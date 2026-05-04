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

      // Validação de elegibilidade — espelha a regra do CTA no front.
      // Passeios walk-only ou sem flag de motorista NÃO podem ser solicitados via este endpoint.
      const t = tour as any;
      const isEligible = !t.walkOnly && (t.requiresTransport || t.recommendedWithDriver);
      if (!isEligible) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este passeio não está disponível para solicitação com motorista Oranje.",
        });
      }

      const basePrice = (tour as any).basePrice ?? 0;
      const partnerCosts = (tour as any).partnerCosts ?? (tour as any).partnerFee ?? 0; // partnerFee = partnerCosts DB column
      const clientPrice = (tour as any).clientPrice ?? (basePrice + partnerCosts);
      const driverPayout = (tour as any).driverPayout ?? 0;
      const partnerCommission = (tour as any).partnerCommission ?? 0;
      // Resultado Oranje = Valor final ao cliente + Comissão do parceiro - Custos incluídos - Repasse motorista
      const oranjeMargin = clientPrice + partnerCommission - partnerCosts - driverPayout;

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
        basePrice,
        partnerCosts,
        clientPrice,
        driverPayout,
        partnerCommission,
        oranjeMargin,
        operationStatus: "pending",
        driverPayoutStatus: "pending",
      });

      // Registrar na Central de Operações Oranje (não crítico — falha silenciosa)
      try {
        await db.createOranjeOperation({
          operationType:  "premium_tour",
          sourceId:       result.id,
          sourceTable:    "tour_operations",
          customerName:   input.clientName,
          customerEmail:  input.clientEmail ?? null,
          customerPhone:  input.clientPhone ?? null,
          scheduledDate:  input.scheduledDate,
          scheduledTime:  input.scheduledTime ?? null,
          partySize:      input.partySize,
          notes:          input.notes ?? null,
          requestOrigin:  input.requestOrigin,
          customerAmount: clientPrice,
          operatorAmount: driverPayout,
          partnerAmount:  partnerCosts,
          oranjeMargin:   oranjeMargin,
          billingStatus:  clientPrice > 0 ? "pending" : "not_applicable",
          payoutStatus:   driverPayout > 0 ? "pending" : "not_applicable",
          createdBy:      input.clientName,
          metaJson:       { tourId: input.tourId, tourName: (tour as any).name, departurePoint: input.departurePoint ?? null },
        });
      } catch (e) { console.warn("[Operations Central] Failed to sync tour operation:", e); }

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
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await db.updateTourOperationStatus(id, data);

      // Sincroniza com a Central de Operações Oranje (não crítico — falha silenciosa).
      // Garante que status/notas/agendamento alterados no painel de Passeios Premium
      // reflitam imediatamente no painel da Central, evitando divergência de fechamento.
      try {
        const linked = await db.findOranjeOperationBySource("tour_operations", id);
        if (linked) {
          const sync: Record<string, any> = {};
          if (data.operationStatus !== undefined) sync.status = data.operationStatus;
          if (data.internalNotes !== undefined) sync.internalNotes = data.internalNotes;
          if (data.scheduledDate !== undefined) sync.scheduledDate = data.scheduledDate;
          if (data.scheduledTime !== undefined) sync.scheduledTime = data.scheduledTime;
          if (data.driverId !== undefined) sync.assignedToId = data.driverId;
          if (Object.keys(sync).length > 0) {
            await db.updateOranjeOperation(
              linked.id,
              sync,
              (ctx as any)?.user?.name ?? (ctx as any)?.user?.email ?? "admin",
            );
          }
        }
      } catch (e) {
        console.warn("[Sync] Falha ao propagar tour_operation → oranje_operation:", e);
      }

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
      // Valores financeiros com semântica correta:
      basePrice: z.number().min(0).optional().nullable(),           // Preço base do passeio
      partnerCosts: z.number().min(0).optional().nullable(),        // Custos incluídos de parceiros (ingresso, atração...)
      partnerCommission: z.number().min(0).optional().nullable(),   // Comissão recebida de parceiros (receita Oranje)
      driverPayout: z.number().min(0).optional().nullable(),        // Repasse ao motorista
    }))
    .mutation(async ({ input }) => {
      const { tourId, basePrice, partnerCosts, partnerCommission, driverPayout, ...eligibility } = input;
      // Calcula clientPrice automaticamente = basePrice + partnerCosts
      const bp = basePrice ?? 0;
      const pc = partnerCosts ?? 0;
      const clientPrice = bp + pc;
      await db.updateGuidedTourPremiumSettings(tourId, {
        ...eligibility,
        basePrice: basePrice ?? null,
        partnerCosts: partnerCosts ?? null,
        clientPrice: clientPrice > 0 ? clientPrice : null,
        partnerCommission: partnerCommission ?? null,
        driverPayout: driverPayout ?? null,
      });
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
        "passeio", "cliente", "data", "status", "passageiros",
        "preco_base", "custos_incluidos_parceiros", "valor_final_cliente",
        "comissao_parceiro", "repasse_motorista", "resultado_oranje",
        "status_repasse", "motorista", "origem", "notas",
      ].join(";");

      const rows = ops.map(op => [
        `"${(op.tourName ?? "").replace(/"/g, "'")}"`,
        `"${op.clientName.replace(/"/g, "'")}"`,
        op.scheduledDate,
        op.operationStatus,
        op.partySize,
        (op.basePrice ?? 0).toFixed(2),
        (op.partnerCosts ?? 0).toFixed(2),
        (op.clientPrice ?? 0).toFixed(2),
        (op.partnerCommission ?? 0).toFixed(2),
        (op.driverPayout ?? 0).toFixed(2),
        (op.oranjeMargin ?? 0).toFixed(2),
        op.driverPayoutStatus,
        `"${(op.driverName ?? "").replace(/"/g, "'")}"`,
        op.requestOrigin ?? "",
        `"${(op.notes ?? "").replace(/"/g, "'")}"`,
      ].join(";"));

      return { csv: [header, ...rows].join("\n"), count: ops.length };
    }),
});
