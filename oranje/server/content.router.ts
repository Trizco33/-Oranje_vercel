import { router, publicProcedure, cmsProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { siteContent } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";

let db: ReturnType<typeof drizzle> | null = null;
if (ENV.databaseUrl) {
  try { db = drizzle(mysql.createPool(ENV.databaseUrl) as any); } catch (e) { console.warn("[Content] DB init failed:", e); }
}
function getContentDb() {
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  return db;
}

function getCmsUserId(ctx: any): number {
  if (ctx.user?.id) return ctx.user.id;
  try {
    const cookieHeader = ctx.req?.headers?.cookie || "";
    const match = cookieHeader.match(/cms_session=([^;]+)/);
    if (match) {
      const session = JSON.parse(decodeURIComponent(match[1]));
      if (session?.user?.id) return session.user.id;
    }
  } catch {}
  return 1;
}

// ─── Schemas de validação ─────────────────────────────────────────────────────

// buttonUrl e imageUrl aceitam tanto URLs absolutas (https://...) quanto rotas
// internas (/app, /explorar, /images/hero.jpg) — validação intencional permissiva.
// subtitle é opcional: aceita undefined, "" e qualquer string.
const heroSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  buttonText: z.string().min(1),
  buttonUrl: z.string().refine(
    (v) => v.startsWith("/") || /^https?:\/\//.test(v),
    { message: "URL do botão deve ser uma rota interna (/path) ou URL absoluta (https://...)" }
  ),
  imageUrl: z.string().default(""), // vazio = usa imagem padrão; deve ser URL absoluta https://
});

const servicesSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  services: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().min(1),
    })
  ),
});

const aboutSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});

const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  instagram: z.string().optional(), // ex: https://instagram.com/oranjeholambra ou @handle
});

const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
});
const navItemsSchema = z.array(navItemSchema);

export const contentRouter = router({
  // ─── Hero Section ─────────────────────────────────────────────────────────
  getHero: publicProcedure.query(async () => {
    if (!db) return {};
    try {
      const result = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.section, "hero"));

      const hero: any = {};
      result.forEach((item) => {
        hero[item.key.replace("hero_", "")] = item.value;
      });
      return hero;
    } catch (error) {
      console.error("[Content] Error fetching hero:", error);
      return {};
    }
  }),

  updateHero: cmsProcedure
    .input(heroSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = getCmsUserId(ctx);
      const db = getContentDb();
      const updates = [
        { key: "hero_title", value: input.title },
        { key: "hero_subtitle", value: input.subtitle ?? "" },
        { key: "hero_buttonText", value: input.buttonText },
        { key: "hero_buttonUrl", value: input.buttonUrl },
        { key: "hero_imageUrl", value: input.imageUrl },
      ];

      for (const update of updates) {
        await db
          .insert(siteContent)
          .values({
            key: update.key,
            value: update.value,
            section: "hero",
            updatedBy: userId,
          })
          .onDuplicateKeyUpdate({
            set: {
              value: update.value,
              updatedBy: userId,
            },
          });
      }
      return { success: true };
    }),

  // ─── Services Section ─────────────────────────────────────────────────────
  getServices: publicProcedure.query(async () => {
    if (!db) return {};
    try {
      const result = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.section, "services"));

      const services: any = {};
      result.forEach((item) => {
        const key = item.key.replace("services_", "");
        if (key === "list") {
          try { services.list = JSON.parse(item.value); } catch { services.list = []; }
        } else {
          services[key] = item.value;
        }
      });
      return services;
    } catch (error) {
      console.error("[Content] Error fetching services:", error);
      return {};
    }
  }),

  updateServices: cmsProcedure
    .input(servicesSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = getCmsUserId(ctx);
      const db = getContentDb();
      const updates = [
        { key: "services_title", value: input.title },
        { key: "services_description", value: input.description },
        { key: "services_list", value: JSON.stringify(input.services) },
      ];

      for (const update of updates) {
        await db
          .insert(siteContent)
          .values({
            key: update.key,
            value: update.value,
            section: "services",
            updatedBy: userId,
          })
          .onDuplicateKeyUpdate({
            set: {
              value: update.value,
              updatedBy: userId,
            },
          });
      }
      return { success: true };
    }),

  // ─── About Section ────────────────────────────────────────────────────────
  getAbout: publicProcedure.query(async () => {
    if (!db) return {};
    try {
      const result = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.section, "about"));

      const about: any = {};
      result.forEach((item) => {
        about[item.key.replace("about_", "")] = item.value;
      });
      return about;
    } catch (error) {
      console.error("[Content] Error fetching about:", error);
      return {};
    }
  }),

  updateAbout: cmsProcedure
    .input(aboutSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = getCmsUserId(ctx);
      const db = getContentDb();
      const updates = [
        { key: "about_title", value: input.title },
        { key: "about_text", value: input.text },
      ];

      for (const update of updates) {
        await db
          .insert(siteContent)
          .values({
            key: update.key,
            value: update.value,
            section: "about",
            updatedBy: userId,
          })
          .onDuplicateKeyUpdate({
            set: {
              value: update.value,
              updatedBy: userId,
            },
          });
      }
      return { success: true };
    }),

  // ─── Contact Section ──────────────────────────────────────────────────────
  getContact: publicProcedure.query(async () => {
    if (!db) return {};
    try {
      const result = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.section, "contact"));

      const contact: any = {};
      result.forEach((item) => {
        contact[item.key.replace("contact_", "")] = item.value;
      });
      return contact;
    } catch (error) {
      console.error("[Content] Error fetching contact:", error);
      return {};
    }
  }),

  updateContact: cmsProcedure
    .input(contactSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = getCmsUserId(ctx);
      const db = getContentDb();
      const updates = [
        { key: "contact_email", value: input.email },
        { key: "contact_phone", value: input.phone },
        { key: "contact_address", value: input.address },
        { key: "contact_instagram", value: input.instagram ?? "" },
      ];

      for (const update of updates) {
        await db
          .insert(siteContent)
          .values({
            key: update.key,
            value: update.value,
            section: "contact",
            updatedBy: userId,
          })
          .onDuplicateKeyUpdate({
            set: {
              value: update.value,
              updatedBy: userId,
            },
          });
      }
      return { success: true };
    }),

  // ─── Nav Items ────────────────────────────────────────────────────────────
  getNavItems: publicProcedure.query(async () => {
    if (!db) return null;
    try {
      const result = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.key, "nav_items"));
      if (result.length === 0) return null;
      try { return JSON.parse(result[0].value); } catch { return null; }
    } catch { return null; }
  }),

  updateNavItems: cmsProcedure
    .input(navItemsSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = getCmsUserId(ctx);
      const db = getContentDb();
      await db
        .insert(siteContent)
        .values({ key: "nav_items", value: JSON.stringify(input), section: "nav", updatedBy: userId })
        .onDuplicateKeyUpdate({ set: { value: JSON.stringify(input), updatedBy: userId } });
      return { success: true };
    }),
});
