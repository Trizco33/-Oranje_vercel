import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import * as db from "./db";
import { places, placePhotos, categories } from "../drizzle/schema";
import { eq, and, asc, inArray, sql, type SQL } from "drizzle-orm";

export const placesRouter = router({
  // Get all places (for listing)
  list: publicProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
      categoryId: z.number().optional(),
      isFeatured: z.boolean().optional(),
      isRecommended: z.boolean().optional(),
      // "featured"/"recommended" ordena por places.featuredOrder/recommendedOrder
      // (asc, NULLs no fim). Sem orderBy, mantém ordem default do banco.
      orderBy: z.enum(["featured", "recommended"]).optional(),
    }))
    .query(async ({ input }) => {
      const conn = await getDb();
      if (!conn) return [];

      try {
        const conditions = [
          eq(places.status, "active"),
          eq(places.dataPending, false),
        ];
        if (input.categoryId) conditions.push(eq(places.categoryId, input.categoryId));
        // orderBy implica o filtro de flag correspondente: orderBy:"featured"
        // sempre retorna apenas isFeatured=true, e idem para "recommended".
        const wantFeatured = input.isFeatured || input.orderBy === "featured";
        const wantRecommended = input.isRecommended || input.orderBy === "recommended";
        if (wantFeatured) conditions.push(eq(places.isFeatured, true));
        if (wantRecommended) conditions.push(eq(places.isRecommended, true));

        const base = conn.select().from(places).where(and(...conditions));

        // MySQL não tem NULLS LAST: ISNULL(col)=1 nos NULLs empurra-os pro fim.
        if (input.orderBy === "featured") {
          return await base
            .orderBy(sql`ISNULL(${places.featuredOrder})`, asc(places.featuredOrder), asc(places.id))
            .limit(input.limit)
            .offset(input.offset);
        }
        if (input.orderBy === "recommended") {
          return await base
            .orderBy(sql`ISNULL(${places.recommendedOrder})`, asc(places.recommendedOrder), asc(places.id))
            .limit(input.limit)
            .offset(input.offset);
        }
        return await base.limit(input.limit).offset(input.offset);
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
      name: z.string().nullish(),
      categoryId: z.number().nullish(),
      shortDesc: z.string().nullish(),
      longDesc: z.string().nullish(),
      tags: z.array(z.string()).nullish(),
      priceRange: z.string().nullish(),
      openingHours: z.string().nullish(),
      address: z.string().nullish(),
      city: z.string().nullish(),
      state: z.string().nullish(),
      country: z.string().nullish(),
      lat: z.number().nullish(),
      lng: z.number().nullish(),
      whatsapp: z.string().nullish(),
      instagram: z.string().nullish(),
      website: z.string().nullish(),
      mapsUrl: z.string().nullish(),
      coverImage: z.string().nullish(),
      images: z.array(z.string()).nullish(),
      isFree: z.boolean().nullish(),
      isRecommended: z.boolean().nullish(),
      isPartner: z.boolean().nullish(),
      isFeatured: z.boolean().nullish(),
      dataPending: z.boolean().nullish(),
    }).passthrough())
    .mutation(async ({ input: { id, ...data } }) => {
      const existing = await db.getPlaceById(id);
      // Pins manuais são imunes à geo-validação automática
      const isManualPin = (existing as any)?.geoSource === 'manual';
      if (!isManualPin && (data.lat != null || data.lng != null || data.address != null)) {
        const { validatePlaceCoords } = await import("./geo-validator");
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

  // Admin: grava a ordem manual de "Em Destaque" ou "Recomendados".
  // Os IDs recebidos devem pertencer a places ativos com a flag correspondente;
  // grava 1..N atomicamente em featuredOrder/recommendedOrder.
  reorder: adminProcedure
    .input(z.object({
      field: z.enum(["featured", "recommended"]),
      orderedIds: z.array(z.number().int().positive()),
    }))
    .mutation(async ({ input }) => {
      const conn = await getDb();
      if (!conn) throw new Error("DB not available");
      if (input.orderedIds.length === 0) return { success: true, count: 0 };

      if (new Set(input.orderedIds).size !== input.orderedIds.length) {
        throw new Error("orderedIds contém IDs duplicados.");
      }

      const flagCol = input.field === "featured" ? places.isFeatured : places.isRecommended;
      const valid = await conn
        .select({ id: places.id })
        .from(places)
        .where(and(
          inArray(places.id, input.orderedIds),
          eq(flagCol, true),
          eq(places.status, "active"),
        ));
      const validIds = new Set(valid.map((r) => r.id));
      const invalid = input.orderedIds.filter((id) => !validIds.has(id));
      if (invalid.length > 0) {
        throw new Error(`IDs não pertencem à vitrine selecionada: ${invalid.join(", ")}`);
      }

      await conn.transaction(async (tx) => {
        for (let i = 0; i < input.orderedIds.length; i++) {
          const id = input.orderedIds[i];
          if (input.field === "featured") {
            await tx.update(places).set({ featuredOrder: i + 1 }).where(eq(places.id, id));
          } else {
            await tx.update(places).set({ recommendedOrder: i + 1 }).where(eq(places.id, id));
          }
        }
      });

      return { success: true, count: input.orderedIds.length };
    }),

  // Search places — full server-side text search.
  //
  // Por que server-side: a tela /app/buscar carregava todos os lugares e filtrava
  // no cliente, o que não escala (passa de ~500 lugares e o limit volta a esconder
  // resultados, e o payload incha). Aqui usamos LIKE direto no MySQL — colunas
  // estão em collation utf8mb4_*_ci, então a comparação já é case-insensitive
  // e tolera acentos do mesmo grupo (ex: "isto" casa "Istok").
  //
  // Campos pesquisados: name, shortDesc, longDesc, address, city e o nome
  // da categoria (via LEFT JOIN). O schema de `places` não tem coluna
  // `neighborhood`/`bairro` (ver drizzle/schema.ts) — bairro/região vivem
  // dentro de `address` (ex: "Rua Figueiras, bairro Palm Park...") e de
  // `longDesc`, então o LIKE nesses dois campos já cobre a busca por bairro.
  // O filtro client-side anterior chamava `p.neighborhood ?? p.bairro`, que
  // era código morto (sempre undefined). Filtros opcionais: categoryId e
  // tags (semântica OR, igual ao filtro client-side anterior).
  //
  // Ordenação por relevância: match no início do name > contém no name >
  // demais campos. Empates desempatam por rating desc.
  search: publicProcedure
    .input(z.object({
      query: z.string().default(""),
      categoryId: z.number().optional(),
      tags: z.array(z.string()).optional(),
      limit: z.number().int().positive().max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const conn = await getDb();
      if (!conn) return [];

      try {
        const conditions = [
          eq(places.status, "active"),
          eq(places.dataPending, false),
        ];
        if (input.categoryId) conditions.push(eq(places.categoryId, input.categoryId));

        const rawQuery = input.query.trim();
        // Escapa wildcards do LIKE pra evitar que "%" / "_" digitados pelo
        // usuário virem coringas (e o "\" precisa ir primeiro).
        const escaped = rawQuery
          .replace(/\\/g, "\\\\")
          .replace(/%/g, "\\%")
          .replace(/_/g, "\\_");
        const likePattern = `%${escaped}%`;
        const startsPattern = `${escaped}%`;

        if (rawQuery.length > 0) {
          conditions.push(
            sql`(
              ${places.name} LIKE ${likePattern}
              OR ${places.shortDesc} LIKE ${likePattern}
              OR ${places.longDesc} LIKE ${likePattern}
              OR ${places.address} LIKE ${likePattern}
              OR ${places.city} LIKE ${likePattern}
              OR ${categories.name} LIKE ${likePattern}
            )`
          );
        }

        // Tags: semântica OR — o lugar precisa ter pelo menos uma das tags
        // marcadas pelo usuário. JSON_CONTAINS espera JSON quotado.
        if (input.tags && input.tags.length > 0) {
          const tagClauses: SQL[] = input.tags.map(
            (t) => sql`JSON_CONTAINS(${places.tags}, ${JSON.stringify(t)})`,
          );
          const [first, ...rest] = tagClauses;
          const joined = rest.reduce<SQL>(
            (acc, c) => sql`${acc} OR ${c}`,
            first,
          );
          conditions.push(sql`(${joined})`);
        }

        // Score de relevância: menor = mais relevante.
        // 1: name começa com a query  · 2: name contém  · 3: shortDesc/longDesc/address/city
        // 4: nome da categoria        · 5: sem texto buscado (lista neutra)
        // O `.as("relevance")` é obrigatório: sem ele o ORDER BY não consegue
        // referenciar o alias da expressão e o MySQL devolve erro 1054.
        const relevance = (rawQuery.length === 0
          ? sql<number>`5`
          : sql<number>`CASE
              WHEN ${places.name} LIKE ${startsPattern} THEN 1
              WHEN ${places.name} LIKE ${likePattern} THEN 2
              WHEN ${places.shortDesc} LIKE ${likePattern}
                OR ${places.longDesc} LIKE ${likePattern}
                OR ${places.address} LIKE ${likePattern}
                OR ${places.city} LIKE ${likePattern} THEN 3
              WHEN ${categories.name} LIKE ${likePattern} THEN 4
              ELSE 5
            END`
        ).as("relevance");

        const rows = await conn
          .select({
            place: places,
            categoryName: categories.name,
            categorySlug: categories.slug,
            relevance,
          })
          .from(places)
          .leftJoin(categories, eq(places.categoryId, categories.id))
          .where(and(...conditions))
          .orderBy(
            sql`relevance ASC`,
            sql`${places.rating} DESC`,
            asc(places.id),
          )
          .limit(input.limit)
          .offset(input.offset);

        return rows.map((r) => ({
          ...r.place,
          categoryName: r.categoryName,
          categorySlug: r.categorySlug,
        }));
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

  // Admin: Ajuste manual de pin — salva coords precisas e protege contra sobrescrita automática
  updatePin: adminProcedure
    .input(z.object({
      id: z.number(),
      lat: z.number(),
      lng: z.number(),
    }))
    .mutation(async ({ input }) => {
      const now = new Date().toISOString().slice(0, 10);
      await db.updatePlace(input.id, {
        lat: input.lat,
        lng: input.lng,
        geoStatus: "ok",
        geoSource: "manual",
        geoNote: `Pin ajustado manualmente pelo admin em ${now}. Coordenadas protegidas contra sobrescrita automática.`,
      } as any);
      return { success: true };
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
