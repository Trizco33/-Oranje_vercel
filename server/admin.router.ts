import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { eq } from "drizzle-orm";
import { vouchers, ads, categories, partners } from "../drizzle/schema";

/**
 * Admin Router - Complete CRUD endpoints for all entities
 * All procedures are protected with adminProcedure (requires admin role)
 */

export const adminRouter = router({
  // ── Vouchers ──────────────────────────────────────────────────────────────
  vouchers: router({
    list: adminProcedure.input(z.object({
      placeId: z.number().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      const db_instance = await db.getDb();
      if (!db_instance) return [];
      // Get all vouchers (admin view)
      const allVouchers = await db.getVouchers(input?.placeId);
      return allVouchers;
    }),

    byId: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db_instance = await db.getDb();
      if (!db_instance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db_instance.select().from(vouchers).where(
        eq(vouchers.id, input.id)
      );
      if (!result.length) throw new TRPCError({ code: "NOT_FOUND", message: "Voucher não encontrado" });
      return result[0];
    }),

    create: adminProcedure.input(z.object({
      placeId: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      code: z.string().optional(),
      qrPayload: z.string().optional(),
      discount: z.string().optional(),
      startsAt: z.date().optional(),
      endsAt: z.date().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input, ctx }) => {
      const result = await db.createVoucher(input as any);
      await db.logAdminAction(ctx.user.id, "create_voucher", "voucher", (result as any).insertId || 0);
      return result;
    }),

    update: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      code: z.string().optional(),
      discount: z.string().optional(),
      startsAt: z.date().optional(),
      endsAt: z.date().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input: { id, ...data }, ctx }) => {
      const result = await db.updateVoucher(id, data as any);
      await db.logAdminAction(ctx.user.id, "update_voucher", "voucher", id);
      return result;
    }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const db_instance = await db.getDb();
      if (!db_instance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db_instance.delete(vouchers).where(eq(vouchers.id, input.id));
      await db.logAdminAction(ctx.user.id, "delete_voucher", "voucher", input.id);
      return { success: true };
    }),
  }),

  // ── Ads (Anúncios) ────────────────────────────────────────────────────────
  ads: router({
    list: adminProcedure.input(z.object({
      placement: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      const db_instance = await db.getDb();
      if (!db_instance) return [];
      const allAds = await db.getAds(input?.placement);
      return allAds;
    }),

    byId: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db_instance = await db.getDb();
      if (!db_instance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db_instance.select().from(ads).where(
        eq(ads.id, input.id)
      );
      if (!result.length) throw new TRPCError({ code: "NOT_FOUND", message: "Anúncio não encontrado" });
      return result[0];
    }),

    create: adminProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      linkUrl: z.string().optional(),
      placement: z.enum(["footer_banner", "offers_page", "home_banner"]),
      startsAt: z.date().optional(),
      endsAt: z.date().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input, ctx }) => {
      const result = await db.createAd(input as any);
      await db.logAdminAction(ctx.user.id, "create_ad", "ad", (result as any).insertId || 0);
      return result;
    }),

    update: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      linkUrl: z.string().optional(),
      placement: z.enum(["footer_banner", "offers_page", "home_banner"]).optional(),
      startsAt: z.date().optional(),
      endsAt: z.date().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input: { id, ...data }, ctx }) => {
      const result = await db.updateAd(id, data as any);
      await db.logAdminAction(ctx.user.id, "update_ad", "ad", id);
      return result;
    }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const db_instance = await db.getDb();
      if (!db_instance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db_instance.delete(ads).where(eq(ads.id, input.id));
      await db.logAdminAction(ctx.user.id, "delete_ad", "ad", input.id);
      return { success: true };
    }),
  }),

  // ── Categories ────────────────────────────────────────────────────────────
  categories: router({
    list: adminProcedure.query(() => db.getCategories()),

    byId: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db_instance = await db.getDb();
      if (!db_instance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db_instance.select().from(categories).where(
        eq(categories.id, input.id)
      );
      if (!result.length) throw new TRPCError({ code: "NOT_FOUND", message: "Categoria não encontrada" });
      return result[0];
    }),

    create: adminProcedure.input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      icon: z.string().optional(),
      description: z.string().optional(),
      coverImage: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const result = await db.createCategory(input as any);
      await db.logAdminAction(ctx.user.id, "create_category", "category", (result as any).insertId || 0);
      return result;
    }),

    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      slug: z.string().optional(),
      icon: z.string().optional(),
      description: z.string().optional(),
      coverImage: z.string().optional(),
    })).mutation(async ({ input: { id, ...data }, ctx }) => {
      const result = await db.updateCategory(id, data as any);
      await db.logAdminAction(ctx.user.id, "update_category", "category", id);
      return result;
    }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const result = await db.deleteCategory(input.id);
      await db.logAdminAction(ctx.user.id, "delete_category", "category", input.id);
      return { success: true };
    }),
  }),

  // ── Partners ──────────────────────────────────────────────────────────────
  partners: router({
    list: adminProcedure.query(() => db.getPartners()),

    byId: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db_instance = await db.getDb();
      if (!db_instance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db_instance.select().from(partners).where(
        eq(partners.id, input.id)
      );
      if (!result.length) throw new TRPCError({ code: "NOT_FOUND", message: "Parceiro não encontrado" });
      return result[0];
    }),

    create: adminProcedure.input(z.object({
      name: z.string().min(1),
      plan: z.enum(["Essencial", "Destaque", "Premium"]),
      contactName: z.string().optional(),
      contactWhatsapp: z.string().optional(),
      contactEmail: z.string().optional(),
      logoUrl: z.string().optional(),
      status: z.enum(["pending", "active", "inactive"]).optional(),
    })).mutation(async ({ input, ctx }) => {
      const result = await db.createPartner(input as any);
      await db.logAdminAction(ctx.user.id, "create_partner", "partner", (result as any).insertId || 0);
      return result;
    }),

    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      plan: z.enum(["Essencial", "Destaque", "Premium"]).optional(),
      contactName: z.string().optional(),
      contactWhatsapp: z.string().optional(),
      contactEmail: z.string().optional(),
      logoUrl: z.string().optional(),
      status: z.enum(["pending", "active", "inactive"]).optional(),
    })).mutation(async ({ input: { id, ...data }, ctx }) => {
      const result = await db.updatePartner(id, data as any);
      await db.logAdminAction(ctx.user.id, "update_partner", "partner", id);
      return result;
    }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const db_instance = await db.getDb();
      if (!db_instance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db_instance.delete(partners).where(eq(partners.id, input.id));
      await db.logAdminAction(ctx.user.id, "delete_partner", "partner", input.id);
      return { success: true };
    }),
  }),

  // ── Routes (Roteiros) ─────────────────────────────────────────────────────
  routes: router({
    list: adminProcedure.query(() => db.getPublicRoutes()),

    byId: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const route = await db.getRouteById(input.id);
      if (!route) throw new TRPCError({ code: "NOT_FOUND", message: "Roteiro não encontrado" });
      const placeIds: number[] = Array.isArray(route.placeIds) ? (route.placeIds as number[]) : [];
      const routePlaces = placeIds.length > 0 ? await db.getPlaces({ limit: 50 }) : [];
      const filteredPlaces = routePlaces.filter(p => placeIds.includes(p.id));
      return { ...route, places: filteredPlaces };
    }),

    create: adminProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      placeIds: z.array(z.number()),
      duration: z.string().optional(),
      theme: z.string().optional(),
      isPublic: z.boolean().optional(),
      coverImage: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })).mutation(async ({ input, ctx }) => {
      const result = await db.createRoute({ ...input, userId: null } as any);
      await db.logAdminAction(ctx.user.id, "create_route", "route", (result as any).insertId || 0);
      return result;
    }),

    update: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      placeIds: z.array(z.number()).optional(),
      duration: z.string().optional(),
      theme: z.string().optional(),
      isPublic: z.boolean().optional(),
      coverImage: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })).mutation(async ({ input: { id, ...data }, ctx }) => {
      const result = await db.updateRoute(id, data as any);
      await db.logAdminAction(ctx.user.id, "update_route", "route", id);
      return result;
    }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const result = await db.deleteRoute(input.id);
      await db.logAdminAction(ctx.user.id, "delete_route", "route", input.id);
      return { success: true };
    }),
  }),
});
