import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { getDb } from "./db";
import { profileClaims, places } from "../drizzle/schema";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function verifyOwnership(email: string | null | undefined, placeId: number): Promise<boolean> {
  if (!email) return false;
  const db = getDb();
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
      const isOwner = await verifyOwnership(ctx.user.email, input.placeId);
      if (!isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para editar este estabelecimento.",
        });
      }

      if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
        return { success: false as const, error: "Tipo não permitido. Use JPG, PNG ou WebP." };
      }

      const buffer = Buffer.from(input.file, "base64");
      if (buffer.length > MAX_FILE_SIZE) {
        return { success: false as const, error: "Arquivo muito grande. Máximo: 5 MB." };
      }

      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 80);
      const suffix = Math.random().toString(36).substring(2, 8);
      const fileKey = `places/${input.placeId}/${Date.now()}-${suffix}-${safeName}`;

      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      const db = getDb();
      await db
        .update(places)
        .set({ coverImage: url, updatedAt: new Date() })
        .where(eq(places.id, input.placeId));

      console.log(`[owner] coverImage atualizado — placeId=${input.placeId} por ${ctx.user.email}`);
      return { success: true as const, url };
    }),
});
