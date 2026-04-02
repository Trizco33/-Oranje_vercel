import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sendMagicLinkEmail } from "./_core/email";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { driversRouter } from "./drivers.router";
import { adminRouter } from "./admin.router";
import { uploadRouter } from "./upload.router";
import { articlesRouter } from "./articles.router";
import { cmsRouter } from "./cms.router";
import { contentRouter } from "./content.router";
import { placesRouter } from "./places.router";
import { reviewsRouter } from "./reviews.router";
import { generateSitemap } from "./sitemap";
import * as db from "./db";
import { getDb } from "./db";
import fs from "fs";
import path from "path";

// ─── Admin Guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
  }
  return next({ ctx });
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  drivers: driversRouter,
  system: systemRouter,
  admin_cms: adminRouter,
  upload: uploadRouter,
  articles: articlesRouter,
  cms: cmsRouter,
  content: contentRouter,
  places: placesRouter,
  reviews: reviewsRouter,

  // ── SEO ────────────────────────────────────────────────────────────────────
  seo: router({
    sitemap: publicProcedure.query(async ({ ctx }) => {
      const baseUrl = ctx.req.headers.origin || "https://oranjeapp.com.br";
      const xml = await generateSitemap(baseUrl);
      return { xml };
    }),
  }),

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      // Also clear CMS session cookie for complete logout
      ctx.res.clearCookie("cms_session", { path: "/" });
      return { success: true } as const;
    }),
    requestMagicLink: publicProcedure.input(z.object({
      email: z.string().email(),
      origin: z.string().url(),
    })).mutation(async ({ input }) => {
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      let user = await db.getUserByEmail(input.email);
      if (!user) {
        user = await db.createUserWithEmail(input.email);
      }
      if (!user?.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
      await db.createMagicLink(token, user.id, expiresAt);
      const origin = process.env.APP_ORIGIN ?? input.origin ?? "http://localhost:5173";
      const url = `${origin}/#/login/callback?token=${token}`;
      await sendMagicLinkEmail({ to: input.email, url });
      return { success: true };
    }),
    verifyMagicLink: publicProcedure.input(z.object({
      token: z.string(),
    })).mutation(async ({ input, ctx }) => {
      const magicLink = await db.getMagicLink(input.token);
      if (!magicLink) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link invalido ou expirado" });
      }
      if (magicLink.usedAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Link ja foi utilizado" });
      }
      if (new Date() > magicLink.expiresAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Link expirou" });
      }
      await db.markMagicLinkAsUsed(input.token);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, String(magicLink.userId), {
        ...cookieOptions,
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      return { success: true };
    }),
  }),

  // ── Database Migrations ───────────────────────────────────────────────────
  migrations: router({
    runMigration0013: adminProcedure.mutation(async () => {
      try {
        const database = await getDb();
        if (!database) {
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: "Database connection not available" 
          });
        }

        // Read migration file
        const migrationPath = path.join(process.cwd(), "drizzle", "0013_add_article_backups.sql");
        
        if (!fs.existsSync(migrationPath)) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "Migration file not found" 
          });
        }

        const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
        
        // Split by semicolon and execute each statement
        const statements = migrationSQL
          .split(";")
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const statement of statements) {
          await database.execute(statement);
        }

        return { 
          success: true, 
          message: "Migration 0013 (article_backups table) executed successfully",
          statementsExecuted: statements.length
        };
      } catch (error: any) {
        console.error("Migration error:", error);
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: `Migration failed: ${error.message}` 
        });
      }
    }),
  }),

  // ── Categories ────────────────────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(() => db.getCategories()),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) =>
      db.getCategoryBySlug(input.slug)
    ),
    create: adminProcedure.input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      icon: z.string().optional(),
      description: z.string().optional(),
      coverImage: z.string().optional(),
    })).mutation(({ input }) => db.createCategory(input)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      slug: z.string().optional(),
      icon: z.string().optional(),
      description: z.string().optional(),
      coverImage: z.string().optional(),
    })).mutation(({ input: { id, ...data } }) => db.updateCategory(id, data)),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) =>
      db.deleteCategory(input.id)
    ),
  }),

  // ── Places ────────────────────────────────────────────────────────────────
  // places router is now imported from places.router.ts

  // ── Events ────────────────────────────────────────────────────────────────
  events: router({
    list: publicProcedure.input(z.object({
      upcoming: z.boolean().optional(),
      featured: z.boolean().optional(),
      limit: z.number().optional(),
    }).optional()).query(({ input }) => db.getEvents(input ?? {})),

    byId: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const event = await db.getEventById(input.id);
      if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "Evento não encontrado." });
      return event;
    }),

    upcoming: publicProcedure.query(() => db.getEvents({ upcoming: true, limit: 5 })),

    create: adminProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      startsAt: z.date(),
      endsAt: z.date().optional(),
      location: z.string().optional(),
      mapsUrl: z.string().optional(),
      coverImage: z.string().optional(),
      isFeatured: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
      price: z.string().optional(),
      sendAlert: z.boolean().optional(),
    })).mutation(async ({ input, ctx }) => {
      const { sendAlert, ...eventData } = input;
      const result = await db.createEvent(eventData as any);
      const insertId = (result as any).insertId;
      if (insertId) {
        await db.logAdminAction(ctx.user.id, "create_event", "event", insertId);
      }
      if (sendAlert && insertId) {
        await db.broadcastEventNotification(
          insertId,
          `Novo evento: ${input.title}`,
          `${input.description ?? ""}\n\nData: ${input.startsAt.toLocaleDateString("pt-BR")}`
        );
        await notifyOwner({
          title: `Novo evento criado: ${input.title}`,
          content: `O evento "${input.title}" foi criado e alertas foram enviados para todos os usuários.`,
        });
      }
      return result;
    }),

    update: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      startsAt: z.date().optional(),
      endsAt: z.date().optional(),
      location: z.string().optional(),
      mapsUrl: z.string().optional(),
      coverImage: z.string().optional(),
      isFeatured: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
      price: z.string().optional(),
      status: z.enum(["active", "cancelled", "past"]).optional(),
    })).mutation(async ({ input: { id, ...data }, ctx }) => {
      const result = await db.updateEvent(id, data as any);
      await db.logAdminAction(ctx.user.id, "update_event", "event", id);
      return result;
    }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const result = await db.deleteEvent(input.id);
      await db.logAdminAction(ctx.user.id, "delete_event", "event", input.id);
      return result;
    }),

    sendAlert: adminProcedure.input(z.object({ eventId: z.number() })).mutation(async ({ input }) => {
      const event = await db.getEventById(input.eventId);
      if (!event) throw new TRPCError({ code: "NOT_FOUND" });
      await db.broadcastEventNotification(
        event.id,
        `Evento em destaque: ${event.title}`,
        `${event.description ?? ""}\n\nData: ${event.startsAt.toLocaleDateString("pt-BR")}\nLocal: ${event.location ?? "Holambra"}`
      );
      return { success: true };
    }),
  }),

  // ── Vouchers ──────────────────────────────────────────────────────────────
  vouchers: router({
    list: publicProcedure.input(z.object({ placeId: z.number().optional() }).optional()).query(({ input }) =>
      db.getVouchers(input?.placeId)
    ),
    create: adminProcedure.input(z.object({
      placeId: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      code: z.string().optional(),
      qrPayload: z.string().optional(),
      discount: z.string().optional(),
      startsAt: z.date().optional(),
      endsAt: z.date().optional(),
    })).mutation(({ input }) => db.createVoucher(input as any)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      code: z.string().optional(),
      discount: z.string().optional(),
      isActive: z.boolean().optional(),
    })).mutation(({ input: { id, ...data } }) => db.updateVoucher(id, data as any)),
  }),

  // ── Ads ───────────────────────────────────────────────────────────────────
  ads: router({
    list: publicProcedure.input(z.object({ placement: z.string().optional() }).optional()).query(({ input }) =>
      db.getAds(input?.placement)
    ),
    create: adminProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      linkUrl: z.string().optional(),
      placement: z.enum(["footer_banner", "offers_page", "home_banner"]),
      startsAt: z.date().optional(),
      endsAt: z.date().optional(),
    })).mutation(({ input }) => db.createAd(input as any)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      linkUrl: z.string().optional(),
      isActive: z.boolean().optional(),
    })).mutation(({ input: { id, ...data } }) => db.updateAd(id, data as any)),
  }),

  // ── Partners ──────────────────────────────────────────────────────────────
  partners: router({
    list: publicProcedure.input(z.object({ status: z.string().optional() }).optional()).query(({ input }) =>
      db.getPartners(input?.status)
    ),
    create: adminProcedure.input(z.object({
      name: z.string().min(1),
      plan: z.enum(["Essencial", "Destaque", "Premium"]),
      contactName: z.string().optional(),
      contactWhatsapp: z.string().optional(),
      contactEmail: z.string().optional(),
    })).mutation(({ input }) => db.createPartner(input as any)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      plan: z.enum(["Essencial", "Destaque", "Premium"]).optional(),
      status: z.enum(["pending", "active", "inactive"]).optional(),
      contactName: z.string().optional(),
      contactWhatsapp: z.string().optional(),
    })).mutation(({ input: { id, ...data } }) => db.updatePartner(id, data as any)),
  }),

  // ── Favorites ─────────────────────────────────────────────────────────────
  favorites: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserFavorites(ctx.user.id)),
    add: protectedProcedure.input(z.object({ placeId: z.number() })).mutation(({ ctx, input }) =>
      db.addFavorite(ctx.user.id, input.placeId)
    ),
    remove: protectedProcedure.input(z.object({ placeId: z.number() })).mutation(({ ctx, input }) =>
      db.removeFavorite(ctx.user.id, input.placeId)
    ),
  }),

  // ── Routes (Roteiros) ─────────────────────────────────────────────────────
  routes: router({
    public: publicProcedure.query(() => db.getPublicRoutes()),
    mine: protectedProcedure.query(({ ctx }) => db.getUserRoutes(ctx.user.id)),
    byId: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const route = await db.getRouteById(input.id);
      if (!route) throw new TRPCError({ code: "NOT_FOUND" });
      const placeIds: number[] = Array.isArray(route.placeIds) ? (route.placeIds as number[]) : [];
      const routePlaces = placeIds.length > 0 ? await db.getPlaces({ limit: 50 }) : [];
      const filteredPlaces = routePlaces.filter(p => placeIds.includes(p.id));
      return { ...route, places: filteredPlaces };
    }),
    create: protectedProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      placeIds: z.array(z.number()),
      duration: z.string().optional(),
      theme: z.string().optional(),
      isPublic: z.boolean().optional(),
    })).mutation(({ ctx, input }) =>
      db.createRoute({ ...input, userId: ctx.user.id } as any)
    ),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      placeIds: z.array(z.number()).optional(),
      duration: z.string().optional(),
      theme: z.string().optional(),
      isPublic: z.boolean().optional(),
    })).mutation(({ input: { id, ...data } }) => db.updateRoute(id, data as any)),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) =>
      db.deleteRoute(input.id)
    ),
    adminCreate: adminProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      placeIds: z.array(z.number()),
      duration: z.string().optional(),
      theme: z.string().optional(),
      isPublic: z.boolean().optional(),
    })).mutation(({ input }) => db.createRoute({ ...input, userId: null } as any)),
  }),

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserNotifications(ctx.user.id)),
    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) =>
      db.markNotificationRead(input.id)
    ),
  }),

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: router({
    stats: adminProcedure.query(() => db.getAdminStats()),

    logs: adminProcedure.input(z.object({
      limit: z.number().int().positive().default(50),
      offset: z.number().int().nonnegative().default(0),
    }).optional()).query(({ input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      return db.getAdminLogs(limit, offset);
    }),

    generateImage: adminProcedure.input(z.object({
      prompt: z.string().min(1),
      type: z.enum(["place", "event"]),
      name: z.string(),
    })).mutation(async ({ input }) => {
      const { generateImage } = await import("./_core/imageGeneration");
      const fullPrompt = input.type === "event"
        ? `Crie uma imagem promocional elegante para o evento "${input.name}" em Holambra, cidade das flores na região de Campinas, São Paulo. Estilo sofisticado, cores quentes douradas e florais. ${input.prompt}`
        : `Crie uma imagem atraente para o estabelecimento "${input.name}" em Holambra, cidade das flores. Estilo elegante, ambiente aconchegante. ${input.prompt}`;
      const result = await generateImage({ prompt: fullPrompt });
      return { url: result.url };
    }),
  }),
});

