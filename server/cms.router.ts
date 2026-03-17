import { router, adminProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { siteContent, sitePages, siteSeo } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";
import { AuthService } from "./authService";

const pool = mysql.createPool(ENV.databaseUrl);
const db = drizzle(pool);

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
    return await db.select().from(sitePages);
  }),

  // Get page by slug
  getPageBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
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
      if (input.id) {
        await db
          .update(sitePages)
          .set({
            ...input,
            updatedBy: ctx.user.id,
          })
          .where(eq(sitePages.id, input.id));
      } else {
        await db.insert(sitePages).values({
          ...input,
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
