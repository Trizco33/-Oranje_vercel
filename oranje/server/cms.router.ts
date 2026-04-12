import { router, adminProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { siteContent, sitePages, siteSeo, places } from "../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { ENV } from "./_core/env";
import { AuthService } from "./authService";

/* Basic HTML sanitizer — strips script blocks, on* handlers and javascript: hrefs */
function sanitizeHtml(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\s*script[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/href\s*=\s*["']\s*javascript:[^"']*/gi, 'href="#"')
    .replace(/src\s*=\s*["']\s*javascript:[^"']*/gi, 'src=""');
}

let pool: ReturnType<typeof mysql.createPool> | null = null;
let db: any = null;

if (ENV.databaseUrl) {
  try {
    pool = mysql.createPool(ENV.databaseUrl);
    db = drizzle(pool);
  } catch (e) {
    console.warn("[CMS] Failed to connect to database:", e);
  }
}

export const cmsRouter = router({
  // Login (public but validates credentials)
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      // Use shared AuthService
      return await AuthService.login(input.email, input.password);
    }),

  // Get site content
  getContent: publicProcedure
    .input(z.object({ section: z.string() }).optional())
    .query(async ({ input }) => {
      if (!db) return [];
      const where = input?.section ? eq(siteContent.section, input.section) : undefined;
      return await db.select().from(siteContent).where(where);
    }),

  // Update site content (admin only)
  updateContent: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        section: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!db) throw new Error("Database not available");
      await db
        .insert(siteContent)
        .values({
          key: input.key,
          value: input.value,
          section: input.section,
          updatedBy: ctx.user.id,
        })
        .onDuplicateKeyUpdate({
          set: {
            value: input.value,
            updatedBy: ctx.user.id,
          },
        });

      return { success: true };
    }),

  // Get all pages
  getPages: publicProcedure.query(async () => {
    if (!db) return [];
    return await db.select().from(sitePages);
  }),

  // Get page by slug
  getPageBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      if (!db) return null;
      const result = await db
        .select()
        .from(sitePages)
        .where(eq(sitePages.slug, input.slug));
      return result[0] || null;
    }),

  // Create/update page (admin only)
  savePage: adminProcedure
    .input(
      z.object({
        id: z.number().optional(),
        slug: z.string(),
        title: z.string(),
        subtitle: z.string().optional(),
        content: z.string(),
        coverImageUrl: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!db) throw new Error("Database not available");
      const safeContent = sanitizeHtml(input.content);
      const safeInput = { ...input, content: safeContent };

      // ── Anti-regressão: validar IDs de lugares antes de publicar ──────────────
      // Extrai todos os IDs numéricos de /app/lugar/ID no HTML e verifica se
      // existem como lugares ativos no banco. Bloqueia publicação se algum faltar.
      if (input.published) {
        const idMatches = [...safeContent.matchAll(/\/app\/lugar\/(\d+)/g)];
        const numericIds = [...new Set(idMatches.map((m) => parseInt(m[1], 10)))];
        if (numericIds.length > 0) {
          const found = await db
            .select({ id: places.id })
            .from(places)
            .where(inArray(places.id, numericIds));
          const foundIds = new Set(found.map((r: { id: number }) => r.id));
          const missing = numericIds.filter((id) => !foundIds.has(id));
          if (missing.length > 0) {
            throw new Error(
              `Publicação bloqueada: ${missing.length} lugar(es) não encontrado(s) no banco (IDs: ${missing.join(", ")}). Remova os links quebrados antes de publicar.`
            );
          }
        }
      }

      if (input.id) {
        await db
          .update(sitePages)
          .set({
            ...safeInput,
            updatedBy: ctx.user.id,
          })
          .where(eq(sitePages.id, input.id));
      } else {
        await db.insert(sitePages).values({
          ...safeInput,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
          publishedAt: input.published ? new Date() : null,
        });
      }

      return { success: true };
    }),

  // Get SEO config
  getSeo: publicProcedure
    .input(z.object({ page: z.string() }))
    .query(async ({ input }) => {
      if (!db) return null;
      const result = await db
        .select()
        .from(siteSeo)
        .where(eq(siteSeo.page, input.page));
      return result[0] || null;
    }),

  // Update SEO config (admin only)
  updateSeo: adminProcedure
    .input(
      z.object({
        page: z.string(),
        metaTitle: z.string(),
        metaDescription: z.string(),
        metaKeywords: z.string().optional(),
        ogImage: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        canonical: z.string().optional(),
        index: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!db) throw new Error("Database not available");
      await db
        .insert(siteSeo)
        .values({
          ...input,
          updatedBy: ctx.user.id,
        })
        .onDuplicateKeyUpdate({
          set: {
            metaTitle: input.metaTitle,
            metaDescription: input.metaDescription,
            metaKeywords: input.metaKeywords,
            ogImage: input.ogImage,
            ogTitle: input.ogTitle,
            ogDescription: input.ogDescription,
            canonical: input.canonical,
            index: input.index,
            updatedBy: ctx.user.id,
          },
        });

      return { success: true };
    }),
});
