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

        const conditions: any[] = [
          eq(places.status, "active"),
          eq(places.dataPending, false),   // nunca retornar lugares pendentes de validação
        ];
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
        // Get place details — nunca retornar lugares pendentes de validação
        const place = await (db
          .select()
          .from(places)
          .where(and(eq(places.id, placeId), eq(places.dataPending, false), eq(places.status, "active"))) as any)
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

        // Get category name and slug if exists
        let categoryName = null;
        let categorySlug = null;
        if (place[0].categoryId) {
          const category = await (db
            .select()
            .from(categories)
            .where(eq(categories.id, place[0].categoryId)) as any)
            .limit(1);
          
          if (category && category.length > 0) {
            categoryName = category[0].name;
            categorySlug = category[0].slug;
          }
        }

        return {
          ...place[0],
          photos: photos || [],
          categoryName,
          categorySlug,
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
      const { validatePlaceCoords } = await import("./geo-validator");
      const { geoStatus, geoNote } = await validatePlaceCoords(input.lat, input.lng, input.address);
      return db.createPlace({ ...input, geoStatus, geoNote } as any);
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
      if (data.lat != null || data.lng != null || data.address != null) {
        const { validatePlaceCoords } = await import("./geo-validator");
        const existing = await db.getPlaceById(id);
        const lat = data.lat ?? existing?.lat;
        const lng = data.lng ?? existing?.lng;
        const address = data.address ?? existing?.address;
        const { geoStatus, geoNote } = await validatePlaceCoords(lat, lng, address);
        (data as any).geoStatus = geoStatus;
        (data as any).geoNote = geoNote;
      }
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
        // Busca por nome — exclui lugares pendentes e inativos
        const results = await db
          .select()
          .from(places)
          .where(and(
            like(places.name, `%${input.query}%`),
            eq(places.dataPending, false),
            eq(places.status, "active"),
          ))
          .limit(input.limit);

        return results;
      } catch (error) {
        console.error("[Places] Error searching places:", error);
        return [];
      }
    }),

  // Admin: Geo audit — classifica todos os lugares por confiabilidade geográfica
  geoAudit: adminProcedure.query(async () => {
    const { auditPlaces } = await import("./geo-validator");
    const dbConn = await getDb();
    if (!dbConn) return { ok: [], suspect: [], out_of_bounds: [], unverified: [], needs_review: [] };
    const all = await dbConn.select({
      id: places.id,
      name: places.name,
      lat: places.lat,
      lng: places.lng,
      address: places.address,
      geoStatus: places.geoStatus,
    }).from(places).where(eq(places.status, "active"));

    const results = auditPlaces(all);
    const grouped = {
      ok:            results.filter(r => r.auditStatus === "ok"),
      suspect:       results.filter(r => r.auditStatus === "suspect"),
      out_of_bounds: results.filter(r => r.auditStatus === "out_of_bounds"),
      unverified:    results.filter(r => r.auditStatus === "unverified"),
      needs_review:  results.filter(r => r.auditStatus === "needs_review"),
    };
    return grouped;
  }),

  // Admin: Marca geoStatus manualmente (revisão humana)
  setGeoStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      geoStatus: z.enum(["ok", "suspect", "out_of_bounds", "unverified", "needs_review"]),
      geoNote: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.updatePlace(input.id, {
        geoStatus: input.geoStatus,
        geoNote: input.geoNote ?? null,
      } as any);
      return { success: true };
    }),
});
