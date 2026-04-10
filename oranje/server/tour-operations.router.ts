import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import * as db from "./db";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
  }
  return next({ ctx });
});

export const tourOperationsRouter = router({

  // ── Público: solicitar passeio com motorista ──────────────────────────────
  request: publicProcedure
    .input(z.object({
      tourId: z.number().int().positive(),
      clientName: z.string().min(2),
      clientEmail: z.string().email().optional(),
      clientPhone: z.string().optional(),
      scheduledDate: z.string().min(1),        // 'YYYY-MM-DD'
      scheduledTime: z.string().optional(),
      partySize: z.number().int().positive().default(1),
      departurePoint: z.string().optional(),
      notes: z.string().optional(),
      requestOrigin: z.string().default("web"),
    }))
    .mutation(async ({ input }) => {
      // Busca o passeio para obter snapshot de preços
      const tourRows = await db.getPublicGuidedTours();
      const tour = tourRows.find(t => t.id === input.tourId);
      if (!tour) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Passeio não encontrado." });
      }

      const clientPrice = (tour as any).clientPrice ?? 0;
      const driverPayout = (tour as any).driverPayout ?? 0;
      const partnerFee = (tour as any).partnerFee ?? 0;
      const oranjeMargin = clientPrice - driverPayout - partnerFee;

      const result = await db.createTourOperation({
        tourId: input.tourId,
        driverId: null,
        clientName: input.clientName,
        clientEmail: input.clientEmail ?? null,
        clientPhone: input.clientPhone ?? null,
        scheduledDate: input.scheduledDate,
        scheduledTime: input.scheduledTime ?? null,
        partySize: input.partySize,
        departurePoint: input.departurePoint ?? null,
        notes: input.notes ?? null,
        internalNotes: null,
        requestOrigin: input.requestOrigin,
        clientPrice,
        driverPayout,
        partnerFee,
        oranjeMargin,
        operationStatus: "pending",
        driverPayoutStatus: "pending",
      });

      // Notificar o admin sobre nova solicitação
      try {
        await notifyOwner({
          title: `Nova solicitação de passeio premium`,
          content: `${input.clientName} solicitou "${(tour as any).name}" para ${input.scheduledDate}. ${input.partySize} pessoa(s).`,
        });
      } catch (_) { /* notificação não crítica */ }

      return { ok: true, operationId: result.id };
    }),

  // ── Admin: listar todas as operações com filtros ──────────────────────────
  list: adminProcedure
    .input(z.object({
      tourId: z.number().int().positive().optional(),
      driverId: z.string().optional(),
      operationStatus: z.enum(["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled", "no_show"]).optional(),
      scheduledDateFrom: z.string().optional(),   // 'YYYY-MM-DD'
      scheduledDateTo: z.string().optional(),
      month: z.string().optional(),               // 'YYYY-MM' — atalho de filtro mensal
      limit: z.number().int().positive().default(200),
      offset: z.number().int().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      let dateFrom = input?.scheduledDateFrom;
      let dateTo = input?.scheduledDateTo;
      if (input?.month && !dateFrom && !dateTo) {
        dateFrom = `${input.month}-01`;
        dateTo = `${input.month}-31`;
      }
      return db.listTourOperations({
        tourId: input?.tourId,
        driverId: input?.driverId,
        operationStatus: input?.operationStatus,
        scheduledDateFrom: dateFrom,
        scheduledDateTo: dateTo,
        limit: input?.limit ?? 200,
        offset: input?.offset ?? 0,
      });
    }),

  // ── Admin: buscar operação por ID (com parceiros vinculados) ─────────────
  getById: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const op = await db.getTourOperationById(input.id);
      if (!op) throw new TRPCError({ code: "NOT_FOUND", message: "Operação não encontrada." });
      const partners = await db.getTourOperationPartners(input.id);
      return { ...op, partners };
    }),

  // ── Admin: atualizar status e dados da operação ───────────────────────────
  updateStatus: adminProcedure
    .input(z.object({
      id: z.number().int().positive(),
      operationStatus: z.enum(["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled", "no_show"]).optional(),
      driverPayoutStatus: z.enum(["pending", "ready_to_pay", "paid"]).optional(),
      driverId: z.string().optional().nullable(),
      internalNotes: z.string().optional(),
      scheduledDate: z.string().optional(),
      scheduledTime: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateTourOperationStatus(id, data);
      return { ok: true };
    }),

  // ── Admin: adicionar parceiro a uma operação ──────────────────────────────
  addPartner: adminProcedure
    .input(z.object({
      operationId: z.number().int().positive(),
      partnerId: z.number().int().positive().optional(),
      placeId: z.number().int().positive().optional(),
      feeAmount: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      await db.createTourOperationPartner({
        operationId: input.operationId,
        partnerId: input.partnerId ?? null,
        placeId: input.placeId ?? null,
        feeAmount: input.feeAmount,
        partnerBillingStatus: "pending",
      });
      return { ok: true };
    }),

  // ── Admin: atualizar status de faturamento de parceiro ───────────────────
  updatePartnerBilling: adminProcedure
    .input(z.object({
      id: z.number().int().positive(),
      partnerBillingStatus: z.enum(["pending", "billable", "invoiced", "paid"]),
    }))
    .mutation(async ({ input }) => {
      await db.updateTourOperationPartnerBilling(input.id, input.partnerBillingStatus);
      return { ok: true };
    }),

  // ── Admin: resumo financeiro (fechamento mensal) ──────────────────────────
  financialSummary: adminProcedure
    .input(z.object({
      month: z.string().optional(),     // 'YYYY-MM'
      tourId: z.number().int().positive().optional(),
      driverId: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return db.getTourFinancialSummary(input ?? {});
    }),

  // ── Admin: configurar passeio premium (preços + elegibilidade) ───────────
  updateTourPremiumSettings: adminProcedure
    .input(z.object({
      tourId: z.number().int().positive(),
      requiresTransport: z.boolean().optional(),
      walkOnly: z.boolean().optional(),
      recommendedWithDriver: z.boolean().optional(),
      clientPrice: z.number().optional().nullable(),
      driverPayout: z.number().optional().nullable(),
      partnerFee: z.number().optional().nullable(),
    }))
    .mutation(async ({ input }) => {
      const { tourId, ...data } = input;
      await db.updateGuidedTourPremiumSettings(tourId, data);
      return { ok: true };
    }),

  // ── Admin: exportar CSV das operações ─────────────────────────────────────
  exportCsv: adminProcedure
    .input(z.object({
      month: z.string().optional(),
      tourId: z.number().int().positive().optional(),
    }).optional())
    .query(async ({ input }) => {
      let dateFrom: string | undefined;
      let dateTo: string | undefined;
      if (input?.month) {
        dateFrom = `${input.month}-01`;
        dateTo = `${input.month}-31`;
      }
      const ops = await db.listTourOperations({
        tourId: input?.tourId,
        scheduledDateFrom: dateFrom,
        scheduledDateTo: dateTo,
        limit: 5000,
      });

      const header = [
        "ID", "Data", "Horário", "Passeio", "Cliente", "Email", "Telefone",
        "Pessoas", "Motorista", "Valor Cliente (R$)", "Repasse Motorista (R$)",
        "Valor Parceiro (R$)", "Margem Oranje (R$)", "Status Operação",
        "Status Repasse", "Origem", "Notas", "Notas Internas",
      ].join(";");

      const rows = ops.map(op => [
        op.id,
        op.scheduledDate,
        op.scheduledTime ?? "",
        `"${(op.tourName ?? "").replace(/"/g, "'")}"`,
        `"${op.clientName.replace(/"/g, "'")}"`,
        op.clientEmail ?? "",
        op.clientPhone ?? "",
        op.partySize,
        `"${(op.driverName ?? "").replace(/"/g, "'")}"`,
        (op.clientPrice ?? 0).toFixed(2),
        (op.driverPayout ?? 0).toFixed(2),
        (op.partnerFee ?? 0).toFixed(2),
        (op.oranjeMargin ?? 0).toFixed(2),
        op.operationStatus,
        op.driverPayoutStatus,
        op.requestOrigin ?? "",
        `"${(op.notes ?? "").replace(/"/g, "'")}"`,
        `"${(op.internalNotes ?? "").replace(/"/g, "'")}"`,
      ].join(";"));

      return { csv: [header, ...rows].join("\n"), count: ops.length };
    }),
});
