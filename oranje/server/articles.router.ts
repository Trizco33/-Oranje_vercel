import { z } from "zod";
import { adminProcedure, cmsProcedure, publicProcedure, router } from "./_core/trpc";
import { articles, articleBackups, articleSlugRedirects } from "../drizzle/schema";
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

// ─── Backup helper ────────────────────────────────────────────────────────────
async function createBackup(
  articleData: {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    coverImageUrl?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    category?: string | null;
    published: boolean;
    publishedAt?: Date | null;
  },
  reason: "create" | "update" | "manual"
) {
  try {
    const database = await db.getDb();
    if (!database) {
      console.warn("[ArticleBackup] Database not available, skipping backup");
      return;
    }
    await database.insert(articleBackups).values({
      originalArticleId: articleData.id,
      title: articleData.title,
      slug: articleData.slug,
      excerpt: articleData.excerpt ?? null,
      content: articleData.content,
      coverImageUrl: articleData.coverImageUrl ?? null,
      seoTitle: articleData.seoTitle ?? null,
      seoDescription: articleData.seoDescription ?? null,
      seoKeywords: articleData.seoKeywords ?? null,
      category: articleData.category ?? null,
      published: articleData.published,
      publishedAt: articleData.publishedAt ?? null,
      backupReason: reason,
    });
    console.log(`[ArticleBackup] Backup created for article ${articleData.id} (${reason})`);
  } catch (error) {
    console.error("[ArticleBackup] Failed to create backup:", error);
    // Don't throw — backup failure should not block the main operation
  }
}

// ─── CSV helper ───────────────────────────────────────────────────────────────
function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function articlesToCsv(data: any[]): string {
  const headers = [
    "id", "title", "slug", "excerpt", "content", "coverImageUrl",
    "seoTitle", "seoDescription", "seoKeywords", "category",
    "published", "publishedAt", "createdAt", "updatedAt",
  ];
  const rows = data.map((a) =>
    headers.map((h) => escapeCsvField(a[h])).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
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

  // PUBLIC: Get article by slug (with redirect fallback for changed slugs)
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        const database = await db.getDb();
        if (!database) return null;

        // Primary lookup by slug
        const data = await database
          .select()
          .from(articles)
          .where(and(eq(articles.slug, input.slug), eq(articles.published, true)))
          .limit(1);

        if (data[0]) return { ...data[0], redirectedFrom: null };

        // Fallback: check if slug was renamed (redirect)
        try {
          const redirect = await database
            .select({ articleId: articleSlugRedirects.articleId })
            .from(articleSlugRedirects)
            .where(eq(articleSlugRedirects.oldSlug, input.slug))
            .limit(1);

          if (redirect[0]) {
            const redirected = await database
              .select()
              .from(articles)
              .where(and(eq(articles.id, redirect[0].articleId), eq(articles.published, true)))
              .limit(1);
            if (redirected[0]) {
              return { ...redirected[0], redirectedFrom: input.slug };
            }
          }
        } catch (_) {
          // article_slug_redirects table may not exist yet
        }

        return null;
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

  // ADMIN: List all articles (published + drafts) — requires app JWT auth
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

  // CMS: List all articles — accepts both JWT auth and CMS session cookie
  listCms: cmsProcedure
    .input(
      z
        .object({
          published: z.boolean().optional(),
          category: z.string().optional(),
          limit: z.number().int().default(50),
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
          .limit(input?.limit || 50)
          .offset(input?.offset || 0);

        return data;
      } catch (error) {
        console.error("[Articles] listCms error:", error);
        return [];
      }
    }),

  // ADMIN: Create article — accepts both JWT auth and CMS session cookie
  create: cmsProcedure
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
        
        const result = await database.insert(articles).values({
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

        // Auto-backup on create
        const insertId = (result as any)[0]?.insertId;
        if (insertId) {
          await createBackup(
            {
              id: Number(insertId),
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
            },
            "create"
          );
        }

        return { slug, success: true };
      } catch (error) {
        console.error("[Articles] create error:", error);
        throw error;
      }
    }),

  // ADMIN: Update article — accepts both JWT auth and CMS session cookie
  update: cmsProcedure
    .input(
      z.object({
        id: z.number().int(),
        title: z.string().optional(),
        slug: z.string().optional(),
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

        // ── Slug update: validate uniqueness + register redirect ──────────────
        let oldSlug: string | null = null;
        if (data.slug !== undefined) {
          const newSlug = data.slug.trim().toLowerCase()
            .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
          if (newSlug) {
            // Fetch current article to get old slug
            const current = await database.select({ slug: articles.slug })
              .from(articles).where(eq(articles.id, id)).limit(1);
            if (current[0] && current[0].slug !== newSlug) {
              // Check uniqueness — conflicts with another article?
              const conflict = await database.select({ id: articles.id })
                .from(articles)
                .where(and(eq(articles.slug, newSlug), eq(articles.id, id)))
                .limit(1);
              // (the above checks if slug belongs to THIS article already — fine)
              // Check if ANY other article already has this slug
              const conflictOther = await database
                .select({ id: articles.id })
                .from(articles)
                .where(eq(articles.slug, newSlug))
                .limit(1);
              if (conflictOther[0] && conflictOther[0].id !== id) {
                throw new Error(`Slug "${newSlug}" já está em uso por outro artigo (id=${conflictOther[0].id}).`);
              }
              oldSlug = current[0].slug;
              updateData.slug = newSlug;
            }
          }
        }

        await database.update(articles).set(updateData).where(eq(articles.id, id));

        // Register old slug as redirect so old URLs keep working
        if (oldSlug) {
          try {
            await database.insert(articleSlugRedirects).values({ oldSlug, articleId: id })
              .onDuplicateKeyUpdate({ set: { articleId: id } });
          } catch (e) {
            console.warn("[Articles] Could not register slug redirect:", e);
          }
        }

        // Auto-backup after update — fetch full article snapshot
        const updated = await database
          .select()
          .from(articles)
          .where(eq(articles.id, id))
          .limit(1);

        if (updated[0]) {
          await createBackup(updated[0], "update");
        }

        return { success: true, slug: updateData.slug };
      } catch (error) {
        console.error("[Articles] update error:", error);
        throw error;
      }
    }),

  // ADMIN: Delete article — accepts both JWT auth and CMS session cookie
  delete: cmsProcedure
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

  // ─── Backup & Export endpoints ──────────────────────────────────────────────

  // CMS: List backups for a specific article (or all)
  listBackups: cmsProcedure
    .input(
      z
        .object({
          articleId: z.number().int().optional(),
          limit: z.number().int().default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const database = await db.getDb();
        if (!database) return [];

        const where = input?.articleId
          ? eq(articleBackups.originalArticleId, input.articleId)
          : undefined;

        const data = await database
          .select()
          .from(articleBackups)
          .where(where)
          .orderBy(desc(articleBackups.backupDate))
          .limit(input?.limit || 50);

        return data;
      } catch (error) {
        console.error("[Articles] listBackups error:", error);
        return [];
      }
    }),

  // CMS: Restore article from a backup
  restoreFromBackup: cmsProcedure
    .input(z.object({ backupId: z.number().int() }))
    .mutation(async ({ input }) => {
      try {
        const database = await db.getDb();
        if (!database) throw new Error("Database connection failed");

        // Fetch backup
        const backup = await database
          .select()
          .from(articleBackups)
          .where(eq(articleBackups.id, input.backupId))
          .limit(1);

        if (!backup[0]) throw new Error("Backup não encontrado");

        const b = backup[0];

        // Check if original article still exists
        const existing = await database
          .select()
          .from(articles)
          .where(eq(articles.id, b.originalArticleId))
          .limit(1);

        if (existing[0]) {
          // Create a backup of the current state before restoring
          await createBackup(existing[0], "update");

          // Restore over existing article
          await database
            .update(articles)
            .set({
              title: b.title,
              slug: b.slug,
              excerpt: b.excerpt,
              content: b.content,
              coverImageUrl: b.coverImageUrl,
              seoTitle: b.seoTitle,
              seoDescription: b.seoDescription,
              seoKeywords: b.seoKeywords,
              category: b.category,
              published: b.published,
              publishedAt: b.publishedAt,
            })
            .where(eq(articles.id, b.originalArticleId));
        } else {
          // Re-create the article
          await database.insert(articles).values({
            title: b.title,
            slug: b.slug,
            excerpt: b.excerpt,
            content: b.content,
            coverImageUrl: b.coverImageUrl,
            seoTitle: b.seoTitle,
            seoDescription: b.seoDescription,
            seoKeywords: b.seoKeywords,
            category: b.category,
            published: b.published,
            publishedAt: b.publishedAt,
          });
        }

        return { success: true, restoredArticleId: b.originalArticleId };
      } catch (error) {
        console.error("[Articles] restoreFromBackup error:", error);
        throw error;
      }
    }),

  // CMS: Export all articles as JSON
  exportJson: cmsProcedure.query(async () => {
    try {
      const database = await db.getDb();
      if (!database) return { data: [], exportedAt: new Date().toISOString() };

      const data = await database
        .select()
        .from(articles)
        .orderBy(desc(articles.createdAt));

      return {
        exportedAt: new Date().toISOString(),
        count: data.length,
        articles: data,
      };
    } catch (error) {
      console.error("[Articles] exportJson error:", error);
      throw error;
    }
  }),

  // CMS: Export all articles as CSV string
  exportCsv: cmsProcedure.query(async () => {
    try {
      const database = await db.getDb();
      if (!database) return { csv: "", exportedAt: new Date().toISOString() };

      const data = await database
        .select()
        .from(articles)
        .orderBy(desc(articles.createdAt));

      return {
        exportedAt: new Date().toISOString(),
        count: data.length,
        csv: articlesToCsv(data),
      };
    } catch (error) {
      console.error("[Articles] exportCsv error:", error);
      throw error;
    }
  }),
});
