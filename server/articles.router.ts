import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { articles } from "../drizzle/schema";
import { eq, and, desc, isNotNull } from "drizzle-orm";
import * as db from "./db";

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const articlesRouter = router({
  // PUBLIC: List published articles
  listPublished: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          limit: z.number().int().default(10),
          offset: z.number().int().default(0),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const where = and(
        eq(articles.published, true),
        isNotNull(articles.publishedAt),
        input?.category ? eq(articles.category, input.category) : undefined
      );

      try {
        const database = await db.getDb();
        if (!database) return [];
        
        const data = await database
          .select()
          .from(articles)
          .where(where)
          .orderBy(desc(articles.publishedAt))
          .limit(input?.limit || 10)
          .offset(input?.offset || 0);

        return data;
      } catch (error) {
        console.error("[Articles] listPublished error:", error);
        return [];
      }
    }),

  // PUBLIC: Get article by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        const database = await db.getDb();
        if (!database) return null;
        
        const data = await database
          .select()
          .from(articles)
          .where(and(eq(articles.slug, input.slug), eq(articles.published, true)))
          .limit(1);

        return data[0] || null;
      } catch (error) {
        console.error("[Articles] bySlug error:", error);
        return null;
      }
    }),

  // PUBLIC: Get categories
  categories: publicProcedure.query(async () => {
    try {
      const database = await db.getDb();
      if (!database) return [];
      
      const data = await database
        .select({ category: articles.category })
        .from(articles)
        .where(eq(articles.published, true))
        .groupBy(articles.category);

      return data.map((d: any) => d.category).filter(Boolean);
    } catch (error) {
      console.error("[Articles] categories error:", error);
      return [];
    }
  }),

  // ADMIN: List all articles (published + drafts)
  listAdmin: adminProcedure
    .input(
      z
        .object({
          published: z.boolean().optional(),
          category: z.string().optional(),
          limit: z.number().int().default(20),
          offset: z.number().int().default(0),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const where =
        input?.published !== undefined
          ? eq(articles.published, input.published)
          : undefined;

      try {
        const database = await db.getDb();
        if (!database) return [];
        
        const data = await database
          .select()
          .from(articles)
          .where(where)
          .orderBy(desc(articles.createdAt))
          .limit(input?.limit || 20)
          .offset(input?.offset || 0);

        return data;
      } catch (error) {
        console.error("[Articles] listAdmin error:", error);
        return [];
      }
    }),

  // ADMIN: Create article
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "Título obrigatório"),
        excerpt: z.string().optional(),
        content: z.string().min(1, "Conteúdo obrigatório"),
        coverImageUrl: z.string().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional(),
        category: z.string().default("Geral"),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const slug = generateSlug(input.title);

      try {
        const database = await db.getDb();
        if (!database) throw new Error("Database connection failed");
        
        await database.insert(articles).values({
          title: input.title,
          slug,
          excerpt: input.excerpt,
          content: input.content,
          coverImageUrl: input.coverImageUrl,
          seoTitle: input.seoTitle || input.title,
          seoDescription: input.seoDescription,
          seoKeywords: input.seoKeywords,
          category: input.category,
          published: input.published,
          publishedAt: input.published ? new Date() : null,
        });

        return { slug, success: true };
      } catch (error) {
        console.error("[Articles] create error:", error);
        throw error;
      }
    }),

  // ADMIN: Update article
  update: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        title: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        coverImageUrl: z.string().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional(),
        category: z.string().optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ input: { id, ...data } }) => {
      const updateData: any = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.coverImageUrl !== undefined)
        updateData.coverImageUrl = data.coverImageUrl;
      if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
      if (data.seoDescription !== undefined)
        updateData.seoDescription = data.seoDescription;
      if (data.seoKeywords !== undefined)
        updateData.seoKeywords = data.seoKeywords;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.published !== undefined) {
        updateData.published = data.published;
        updateData.publishedAt = data.published ? new Date() : null;
      }

      try {
        const database = await db.getDb();
        if (!database) throw new Error("Database connection failed");
        
        await database.update(articles).set(updateData).where(eq(articles.id, id));

        return { success: true };
      } catch (error) {
        console.error("[Articles] update error:", error);
        throw error;
      }
    }),

  // ADMIN: Delete article
  delete: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      try {
        const database = await db.getDb();
        if (!database) throw new Error("Database connection failed");
        
        await database.delete(articles).where(eq(articles.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("[Articles] delete error:", error);
        throw error;
      }
    }),

  // ADMIN: Get article by ID
  byId: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      try {
        const database = await db.getDb();
        if (!database) return null;
        
        const data = await database
          .select()
          .from(articles)
          .where(eq(articles.id, input.id))
          .limit(1);

        return data[0] || null;
      } catch (error) {
        console.error("[Articles] byId error:", error);
        return null;
      }
    }),
});
