import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
  }
  return next({ ctx });
});

export const claimsRouter = router({
  // ── Public: submit a claim ─────────────────────────────────────────────────
  submit: publicProcedure
    .input(
      z.object({
        placeId: z.number().int().positive(),
        contactName: z.string().min(2, "Nome muito curto"),
        contactPhone: z.string().optional(),
        contactEmail: z.string().email("E-mail inválido"),
        contactRole: z.string().optional(),
        businessName: z.string().optional(),
        instagram: z.string().optional(),
        website: z.string().optional(),
        openingHours: z.string().optional(),
        address: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        differentials: z.string().optional(),
        message: z.string().optional(),
        photos: z.array(z.string().url()).optional(),
        logoUrl: z.string().url().optional(),
        coverImageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.createProfileClaim({
        placeId: input.placeId,
        contactName: input.contactName,
        contactPhone: input.contactPhone ?? null,
        contactEmail: input.contactEmail,
        contactRole: input.contactRole ?? null,
        businessName: input.businessName ?? null,
        instagram: input.instagram ?? null,
        website: input.website ?? null,
        openingHours: input.openingHours ?? null,
        address: input.address ?? null,
        category: input.category ?? null,
        description: input.description ?? null,
        differentials: input.differentials ?? null,
        message: input.message ?? null,
        photos: input.photos ?? null,
        logoUrl: input.logoUrl ?? null,
        coverImageUrl: input.coverImageUrl ?? null,
        status: "pending",
      });
      return { ok: true };
    }),

  // ── Admin: list all claims ─────────────────────────────────────────────────
  list: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        limit: z.number().int().positive().default(100),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      return db.listAllClaims({
        status: input?.status,
        limit: input?.limit ?? 100,
        offset: input?.offset ?? 0,
      });
    }),

  // ── Admin: update claim status ─────────────────────────────────────────────
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(["pending", "approved", "rejected"]),
        adminNote: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateClaimStatus(input.id, input.status, input.adminNote);
      return { ok: true };
    }),
});
