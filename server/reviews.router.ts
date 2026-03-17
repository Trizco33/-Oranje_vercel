import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { reviews, places } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const reviewsRouter = router({
  // Get reviews for a place
  listByPlace: publicProcedure
    .input(z.object({
      placeId: z.number(),
      limit: z.number().default(10),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const placeReviews = await (db
          .select()
          .from(reviews)
          .where(
            and(
              eq(reviews.placeId, input.placeId),
              eq(reviews.status, "approved")
            )
          ) as any)
          .orderBy(reviews.createdAt)
          .limit(input.limit)
          .offset(input.offset);

        return placeReviews || [];
      } catch (error) {
        console.error("[Reviews] Error listing reviews:", error);
        return [];
      }
    }),

  // Get review stats for a place
  getStats: publicProcedure
    .input(z.number())
    .query(async ({ input: placeId }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const place = await (db
          .select()
          .from(places)
          .where(eq(places.id, placeId)) as any)
          .limit(1);

        if (!place || place.length === 0) {
          return null;
        }

        return {
          rating: place[0].rating || 0,
          reviewCount: place[0].reviewCount || 0,
        };
      } catch (error) {
        console.error("[Reviews] Error getting stats:", error);
        return null;
      }
    }),

  // Create a new review (protected)
  create: protectedProcedure
    .input(z.object({
      placeId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Check if place exists
        const place = await (db
          .select()
          .from(places)
          .where(eq(places.id, input.placeId)) as any)
          .limit(1);

        if (!place || place.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lugar não encontrado",
          });
        }

        // Check if user already reviewed this place
        const existingReview = await (db
          .select()
          .from(reviews)
          .where(
            and(
              eq(reviews.placeId, input.placeId),
              eq(reviews.userId, ctx.user.id)
            )
          ) as any)
          .limit(1);

        if (existingReview && existingReview.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Você já avaliou este lugar",
          });
        }

        // Create review
        const result = await (db.insert(reviews).values({
          placeId: input.placeId,
          userId: ctx.user.id,
          rating: input.rating,
          comment: input.comment || null,
          status: "pending", // Reviews need approval
        }) as any);

        return {
          success: true,
          message: "Avaliação enviada para aprovação",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Reviews] Error creating review:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar avaliação",
        });
      }
    }),

  // Mark review as helpful (public)
  markHelpful: publicProcedure
    .input(z.number())
    .mutation(async ({ input: reviewId }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Get current helpful count
        const review = await (db
          .select()
          .from(reviews)
          .where(eq(reviews.id, reviewId)) as any)
          .limit(1);

        if (!review || review.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Avaliação não encontrada",
          });
        }

        // Increment helpful count
        const newCount = (review[0].helpfulCount || 0) + 1;
        await (db
          .update(reviews)
          .set({ helpfulCount: newCount })
          .where(eq(reviews.id, reviewId)) as any);

        return { success: true, helpfulCount: newCount };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Reviews] Error marking helpful:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao marcar como útil",
        });
      }
    }),
});
