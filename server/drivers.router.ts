import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

// Normalize WhatsApp number to international format
function normalizeWhatsApp(whatsapp: string): string {
  const cleaned = whatsapp.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("55")) {
    return cleaned;
  }
  if (cleaned.length === 11) {
    return "55" + cleaned;
  }
  if (cleaned.length === 10) {
    return "55" + cleaned;
  }
  return whatsapp;
}

export const driversRouter = router({
  // PUBLIC: List only approved drivers
  listPublic: publicProcedure.query(async () => {
    const drivers = await db.getAllDrivers({ status: "ACTIVE" });
    return drivers
      .filter((d) => d.isVerified && d.isActive)
      .map((d) => ({
        id: d.id,
        name: d.name,
        whatsapp: d.whatsapp,
        photoUrl: d.photoUrl,
        vehicleModel: d.vehicleModel,
        vehicleColor: d.vehicleColor,
        plate: d.plate,
        region: d.region,
        serviceType: d.serviceType,
        capacity: d.capacity,
      }));
  }),

  // PUBLIC: Create new driver with proper defaults
  createPublic: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        whatsapp: z.string().min(10, "WhatsApp inválido"),
        serviceType: z.string().min(1, "Tipo de serviço é obrigatório"),
        region: z.string().min(1, "Região é obrigatória"),
        vehicleModel: z.string().optional(),
        vehicleColor: z.string().optional(),
        plate: z.string().optional(),
        capacity: z.number().int().positive().optional(),
        photoUrl: z.string().url().optional(),
        notes: z.string().optional(),
        area: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!input.name?.trim()) throw new Error("Nome é obrigatório");
      if (!input.whatsapp?.trim()) throw new Error("WhatsApp é obrigatório");
      if (!input.serviceType?.trim()) throw new Error("Tipo de serviço é obrigatório");
      if (!input.region?.trim()) throw new Error("Região é obrigatória");

      const payload = {
        name: input.name.trim(),
        whatsapp: normalizeWhatsApp(input.whatsapp),
        serviceType: input.serviceType.trim(),
        region: input.region.trim(),
        area: input.area?.trim() || null,
        vehicleModel: input.vehicleModel?.trim() || null,
        vehicleColor: input.vehicleColor?.trim() || null,
        plate: input.plate?.trim() || null,
        capacity: input.capacity ?? null,
        photoUrl: input.photoUrl || null,
        notes: input.notes?.trim() || null,
        status: "PENDING" as const,
        isPartner: false,
        partnerUntil: null,
        isVerified: false,
        isActive: true,
      };

      try {
        await db.createDriver(payload as any);
      } catch (error) {
        console.error("[Drivers] Insert error:", error);
        throw new Error("Falha ao salvar cadastro. Tente novamente.");
      }

      notifyOwner({
        title: "Novo Motorista Cadastrado",
        content: `${input.name} se cadastrou como motorista.\n\nTipo de Serviço: ${input.serviceType}\nRegião: ${input.region}\nWhatsApp: ${input.whatsapp}\n\nAcesse o ADMIN para revisar o cadastro.`,
      }).catch((err) => console.error("Erro ao notificar admin:", err));

      return { success: true, message: "Cadastro enviado para análise" };
    }),

  // ADMIN: List all drivers
  listAdmin: adminProcedure
    .input(
      z
        .object({
          status: z.enum(["PENDING", "ACTIVE", "REJECTED"]).optional(),
        })
        .optional()
    )
    .query(({ input }) => db.getAllDrivers({ status: input?.status })),

  // ADMIN: Update driver
  updateAdmin: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        whatsapp: z.string().optional(),
        serviceType: z.string().optional(),
        region: z.string().optional(),
        vehicleModel: z.string().optional(),
        vehicleColor: z.string().optional(),
        plate: z.string().optional(),
        capacity: z.number().int().optional(),
        photoUrl: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["PENDING", "ACTIVE", "REJECTED"]).optional(),
        isVerified: z.boolean().optional(),
        isActive: z.boolean().optional(),
        isPartner: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined)
      );
      await db.updateDriver(id, cleanUpdates as any);
      return { success: true };
    }),

   // ADMIN: Get driver by ID
  byId: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const drivers = await db.getAllDrivers();
      return drivers.find((d) => d.id === input.id) || null;
    }),

  // PUBLIC: List (backwards compatibility)
  list: publicProcedure.query(async () => {
    return await db.getAllDrivers({ status: "ACTIVE" });
  }),

  // PUBLIC: Create (backwards compatibility)
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        whatsapp: z.string().min(10),
        serviceType: z.string().min(1),
        region: z.string().min(1),
        vehicleModel: z.string().optional(),
        vehicleColor: z.string().optional(),
        plate: z.string().optional(),
        capacity: z.number().int().optional(),
        photoUrl: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const payload = {
        name: input.name.trim(),
        whatsapp: normalizeWhatsApp(input.whatsapp),
        serviceType: input.serviceType.trim(),
        region: input.region.trim(),
        area: null,
        vehicleModel: input.vehicleModel?.trim() || null,
        vehicleColor: input.vehicleColor?.trim() || null,
        plate: input.plate?.trim() || null,
        capacity: input.capacity ?? null,
        photoUrl: input.photoUrl || null,
        notes: input.notes?.trim() || null,
        status: "PENDING" as const,
        isPartner: false,
        partnerUntil: null,
        isVerified: false,
        isActive: true,
      };
      await db.createDriver(payload as any);
      return { success: true };
    }),

  // ADMIN: Delete driver
  deleteAdmin: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.deleteDriver(input.id);
      return { success: true };
    }),

  // ADMIN: List all
  admin: adminProcedure.query(async () => {
    return await db.getAllDrivers();
  }),

  // ADMIN: Set partner status
  setPartner: adminProcedure
    .input(z.object({ id: z.string(), isPartner: z.boolean() }))
    .mutation(async ({ input }) => {
      await db.updateDriverPartner(input.id, input.isPartner);
      return { success: true };
    }),

  // ADMIN: Update driver (alias for updateAdmin)
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        whatsapp: z.string().optional(),
        serviceType: z.string().optional(),
        region: z.string().optional(),
        vehicleModel: z.string().optional(),
        vehicleColor: z.string().optional(),
        plate: z.string().optional(),
        capacity: z.number().int().optional(),
        photoUrl: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["PENDING", "ACTIVE", "REJECTED"]).optional(),
        isVerified: z.boolean().optional(),
        isActive: z.boolean().optional(),
        isPartner: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined)
      );
      await db.updateDriver(id, cleanUpdates as any);
      return { success: true };
    }),

  // ADMIN: Delete driver (alias for deleteAdmin)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.deleteDriver(input.id);
      return { success: true };
    }),
});
