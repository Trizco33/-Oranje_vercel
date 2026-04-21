import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, count } from "drizzle-orm";
import { protectedProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { getDb } from "./db";
import { profileClaims, places, placePhotos } from "../drizzle/schema";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_GALLERY_PHOTOS = 10;

async function verifyOwnership(email: string | null | undefined, placeId: number): Promise<boolean> {
  if (!email) return false;
  const db = await getDb();
  if (!db) return false;
  const [claim] = await db
    .select({ id: profileClaims.id })
    .from(profileClaims)
    .where(
      and(
        eq(profileClaims.placeId, placeId),
        eq(profileClaims.contactEmail, email),
        eq(profileClaims.status, "approved"),
      ),
    )
    .limit(1);
  return !!claim;
}

async function uploadBase64ToR2(
  base64: string,
  fileName: string,
  mimeType: string,
  folder: string,
): Promise<string> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Tipo não permitido. Use JPG, PNG ou WebP." });
  }
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > MAX_FILE_SIZE) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Arquivo muito grande. Máximo: 5 MB." });
  }
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 80);
  const suffix = Math.random().toString(36).substring(2, 8);
  const fileKey = `${folder}/${Date.now()}-${suffix}-${safeName}`;
  const { url } = await storagePut(fileKey, buffer, mimeType);
  return url;
}

export const ownerRouter = router({
  checkOwnership: protectedProcedure
    .input(z.object({ placeId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const isOwner = await verifyOwnership(ctx.user.email, input.placeId);
      return { isOwner };
    }),

  uploadCoverPhoto: protectedProcedure
    .input(
      z.object({
        placeId: z.number().int().positive(),
        file: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!(await verifyOwnership(ctx.user.email, input.placeId))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso não autorizado." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível." });

      const url = await uploadBase64ToR2(
        input.file,
        input.fileName,
        input.mimeType,
        `places/${input.placeId}/cover`,
      );
      await db.update(places).set({ coverImage: url, updatedAt: new Date() }).where(eq(places.id, input.placeId));
      console.log(`[owner] coverImage atualizado — placeId=${input.placeId} por ${ctx.user.email}`);
      return { success: true as const, url };
    }),

  uploadGalleryPhoto: protectedProcedure
    .input(
      z.object({
        placeId: z.number().int().positive(),
        file: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!(await verifyOwnership(ctx.user.email, input.placeId))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso não autorizado." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível." });

      const [{ total }] = await db
        .select({ total: count() })
        .from(placePhotos)
        .where(eq(placePhotos.placeId, input.placeId));

      if (total >= MAX_GALLERY_PHOTOS) {
        return {
          success: false as const,
          error: `Limite de ${MAX_GALLERY_PHOTOS} fotos na galeria atingido.`,
        };
      }

      const url = await uploadBase64ToR2(
        input.file,
        input.fileName,
        input.mimeType,
        `places/${input.placeId}/gallery`,
      );

      await db.insert(placePhotos).values({
        placeId: input.placeId,
        uploaderId: ctx.user.id,
        isOwner: true,
        url,
        order: total,
      });

      console.log(`[owner] galeria +1 foto — placeId=${input.placeId} por ${ctx.user.email}`);
      return { success: true as const, url };
    }),

  deleteGalleryPhoto: protectedProcedure
    .input(
      z.object({
        photoId: z.number().int().positive(),
        placeId: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!(await verifyOwnership(ctx.user.email, input.placeId))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso não autorizado." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível." });

      const [photo] = await db
        .select({ id: placePhotos.id })
        .from(placePhotos)
        .where(and(eq(placePhotos.id, input.photoId), eq(placePhotos.placeId, input.placeId)))
        .limit(1);

      if (!photo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Foto não encontrada." });
      }

      await db.delete(placePhotos).where(eq(placePhotos.id, input.photoId));
      console.log(`[owner] foto id=${input.photoId} removida — placeId=${input.placeId} por ${ctx.user.email}`);
      return { success: true as const };
    }),

  updatePlaceInfo: protectedProcedure
    .input(
      z.object({
        placeId: z.number().int().positive(),
        openingHours: z.string().optional(),
        phone: z.string().max(30).optional(),
        whatsapp: z.string().max(20).optional(),
        instagram: z.string().max(100).optional(),
        website: z.string().optional(),
        shortDesc: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!(await verifyOwnership(ctx.user.email, input.placeId))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso não autorizado." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível." });

      const { placeId, ...fields } = input;
      const updates: Record<string, any> = { updatedAt: new Date() };
      if (fields.openingHours !== undefined) updates.openingHours = fields.openingHours || null;
      if (fields.phone !== undefined) updates.phone = fields.phone || null;
      if (fields.whatsapp !== undefined) updates.whatsapp = fields.whatsapp || null;
      if (fields.instagram !== undefined) updates.instagram = fields.instagram || null;
      if (fields.website !== undefined) updates.website = fields.website || null;
      if (fields.shortDesc !== undefined) updates.shortDesc = fields.shortDesc || null;

      await db.update(places).set(updates).where(eq(places.id, placeId));
      console.log(`[owner] info atualizada — placeId=${placeId} por ${ctx.user.email}`);
      return { success: true as const };
    }),
});
