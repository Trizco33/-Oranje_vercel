import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { reviews, places, users } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const reviewsRouter = router({
  listByPlace: publicProcedure
    .input(
      z.object({
        placeId: z.number(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const placeReviews = await db
          .select({
            id: reviews.id,
            placeId: reviews.placeId,
            userId: reviews.userId,
            rating: reviews.rating,
            comment: reviews.comment,
            isVerified: reviews.isVerified,
            helpfulCount: reviews.helpfulCount,
            status: reviews.status,
            createdAt: reviews.createdAt,
            updatedAt: reviews.updatedAt,
            userName: users.name,
          })
          .from(reviews)
          .leftJoin(users, eq(reviews.userId, users.id))
          .where(and(eq(reviews.placeId, input.placeId), eq(reviews.status, "approved")))
          .orderBy(desc(reviews.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return placeReviews ?? [];
      } catch (error) {
        console.error("[Reviews] Error listing reviews:", error);
        return [];
      }
    }),

  getStats: publicProcedure
    .input(z.number())
    .query(async ({ input: placeId }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const place = await db
          .select({ rating: places.rating, reviewCount: places.reviewCount })
          .from(places)
          .where(eq(places.id, placeId))
          .limit(1);

        if (!place || place.length === 0) return null;
        return { rating: place[0].rating ?? 0, reviewCount: place[0].reviewCount ?? 0 };
      } catch (error) {
        console.error("[Reviews] Error getting stats:", error);
        return null;
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        placeId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível." });

      try {
        const place = await db.select({ id: places.id }).from(places).where(eq(places.id, input.placeId)).limit(1);
        if (!place || place.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Lugar não encontrado." });

        const existing = await db
          .select({ id: reviews.id })
          .from(reviews)
          .where(and(eq(reviews.placeId, input.placeId), eq(reviews.userId, ctx.user.id)))
          .limit(1);

        if (existing && existing.length > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Você já avaliou este lugar." });
        }

        await db.insert(reviews).values({
          placeId: input.placeId,
          userId: ctx.user.id,
          rating: input.rating,
          comment: input.comment ?? null,
          status: "approved",
        });

        return { success: true, message: "Avaliação publicada!" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Reviews] Error creating review:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar avaliação." });
      }
    }),

  markHelpful: publicProcedure
    .input(z.number())
    .mutation(async ({ input: reviewId }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível." });

      try {
        const review = await db
          .select({ id: reviews.id, helpfulCount: reviews.helpfulCount })
          .from(reviews)
          .where(eq(reviews.id, reviewId))
          .limit(1);

        if (!review || review.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliação não encontrada." });

        const newCount = (review[0].helpfulCount ?? 0) + 1;
        await db.update(reviews).set({ helpfulCount: newCount }).where(eq(reviews.id, reviewId));
        return { success: true, helpfulCount: newCount };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Reviews] Error marking helpful:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao marcar como útil." });
      }
    }),
});
