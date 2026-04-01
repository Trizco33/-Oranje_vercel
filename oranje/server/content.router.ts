import { router, publicProcedure } from "./_core/trpc";
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

// ─── Schemas de validação ─────────────────────────────────────────────────────

const heroSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  buttonText: z.string().min(1),
  buttonUrl: z.string().min(1),
  imageUrl: z.string().min(1),
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
});

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

  updateHero: publicProcedure
    .input(heroSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Acesso restrito a administradores" });
      }
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
            updatedBy: ctx.user.id,
          })
          .onDuplicateKeyUpdate({
            set: {
              value: update.value,
              updatedBy: ctx.user.id,
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

  updateServices: publicProcedure
    .input(servicesSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Acesso restrito a administradores" });
      }
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
            updatedBy: ctx.user.id,
          })
          .onDuplicateKeyUpdate({
            set: {
              value: update.value,
              updatedBy: ctx.user.id,
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

  updateAbout: publicProcedure
    .input(aboutSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Acesso restrito a administradores" });
      }
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
            updatedBy: ctx.user.id,
          })
          .onDuplicateKeyUpdate({
            set: {
              value: update.value,
              updatedBy: ctx.user.id,
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

  updateContact: publicProcedure
    .input(contactSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Acesso restrito a administradores" });
      }
      const db = getContentDb();
      const updates = [
        { key: "contact_email", value: input.email },
        { key: "contact_phone", value: input.phone },
        { key: "contact_address", value: input.address },
      ];

      for (const update of updates) {
        await db
          .insert(siteContent)
          .values({
            key: update.key,
            value: update.value,
            section: "contact",
            updatedBy: ctx.user.id,
          })
          .onDuplicateKeyUpdate({
            set: {
              value: update.value,
              updatedBy: ctx.user.id,
            },
          });
      }
      return { success: true };
    }),
});
