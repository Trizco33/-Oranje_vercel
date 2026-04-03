import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import * as db from "./db";
import { places, placePhotos, categories } from "../drizzle/schema";
import { eq, like, and } from "drizzle-orm";

export const placesRouter = router({
  // Get all places (for listing)
  list: publicProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
      categoryId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        let query = db.select().from(places);

        const conditions: any[] = [eq(places.status, "active")];
        if (input.categoryId) {
          conditions.push(eq(places.categoryId, input.categoryId));
        }
        query = query.where(and(...conditions)) as any;

        const results = await (query as any)
          .limit(input.limit)
          .offset(input.offset);

        return results;
      } catch (error) {
        console.error("[Places] Error listing places:", error);
        return [];
      }
    }),

  // Get place details with photos
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const placeId = input.id;
      const db = await getDb();
      if (!db) return null;

      try {
        // Get place details
        const place = await (db
          .select()
          .from(places)
          .where(eq(places.id, placeId)) as any)
          .limit(1);

        if (!place || place.length === 0) {
          return null;
        }

        // Get place photos
        const photos = await (db
          .select()
          .from(placePhotos)
          .where(eq(placePhotos.placeId, placeId)) as any)
          .orderBy(placePhotos.order);

        // Get category name if exists
        let categoryName = null;
        if (place[0].categoryId) {
          const category = await (db
            .select()
            .from(categories)
            .where(eq(categories.id, place[0].categoryId)) as any)
            .limit(1);
          
          if (category && category.length > 0) {
            categoryName = category[0].name;
          }
        }

        return {
          ...place[0],
          photos: photos || [],
          categoryName,
        };
      } catch (error) {
        console.error("[Places] Error getting place details:", error);
        return null;
      }
    }),

  // Admin: Create place
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      categoryId: z.number().optional(),
      shortDesc: z.string().optional(),
      longDesc: z.string().optional(),
      tags: z.array(z.string()).optional(),
      priceRange: z.string().optional(),
      openingHours: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      whatsapp: z.string().optional(),
      instagram: z.string().optional(),
      website: z.string().optional(),
      mapsUrl: z.string().optional(),
      coverImage: z.string().optional(),
      images: z.array(z.string()).optional(),
      isFree: z.boolean().optional(),
      isRecommended: z.boolean().optional(),
      isPartner: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      dataPending: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      return db.createPlace(input as any);
    }),

  // Admin: Update place
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      categoryId: z.number().optional(),
      shortDesc: z.string().optional(),
      longDesc: z.string().optional(),
      tags: z.array(z.string()).optional(),
      priceRange: z.string().optional(),
      openingHours: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      whatsapp: z.string().optional(),
      instagram: z.string().optional(),
      website: z.string().optional(),
      mapsUrl: z.string().optional(),
      coverImage: z.string().optional(),
      images: z.array(z.string()).optional(),
      isFree: z.boolean().optional(),
      isRecommended: z.boolean().optional(),
      isPartner: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      dataPending: z.boolean().optional(),
    }))
    .mutation(async ({ input: { id, ...data } }) => {
      await db.updatePlace(id, data as any);
      return { success: true };
    }),

  // Admin: Delete place
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deletePlace(input.id);
      return { success: true };
    }),

  // Search places
  search: publicProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        // Simple search by name (can be enhanced with full-text search)
        const results = await db
          .select()
          .from(places)
          .where(like(places.name, `%${input.query}%`))
          .limit(input.limit);

        return results;
      } catch (error) {
        console.error("[Places] Error searching places:", error);
        return [];
      }
    }),
});
