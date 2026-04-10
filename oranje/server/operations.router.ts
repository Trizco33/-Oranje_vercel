/**
 * operations.router.ts — Central de Operações Oranje
 * Endpoint admin unificado para todos os tipos de operação reais.
 * Não substitui os routers específicos — complementa com visão central.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, adminProcedure } from "./_core/trpc";
import * as db from "./db";

const OP_TYPE = z.enum(["premium_tour", "receptive_request", "transfer_request", "profile_claim"]);

const OP_STATUS = z.enum([
  "pending", "confirmed", "assigned", "in_progress",
  "completed", "cancelled", "rejected", "no_show",
]);

/**
 * Fluxos de status válidos por tipo de operação.
 * profile_claim é um fluxo de aprovação simples — não compartilha ciclo logístico.
 * Operações logísticas (passeio, transfer, receptivo) têm ciclo operacional completo.
 */
const STATUS_FLOW: Record<string, string[]> = {
  profile_claim:      ["pending", "confirmed", "rejected"],
  premium_tour:       ["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled", "no_show"],
  transfer_request:   ["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled", "no_show"],
  receptive_request:  ["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled", "no_show"],
};

const BILLING_STATUS = z.enum(["not_applicable", "pending", "billed", "paid"]);
const PAYOUT_STATUS  = z.enum(["not_applicable", "pending", "ready_to_pay", "paid"]);

export const operationsRouter = router({

  // ── Listar operações com filtros ──────────────────────────────────────────
  list: adminProcedure
    .input(z.object({
      operationType:     OP_TYPE.optional(),
      status:            OP_STATUS.optional(),
      partnerId:         z.number().int().positive().optional(),
      scheduledDateFrom: z.string().optional(),
      scheduledDateTo:   z.string().optional(),
      month:             z.string().optional(),  // 'YYYY-MM' — atalho de filtro
      limit:             z.number().int().positive().default(200),
      offset:            z.number().int().nonnegative().default(0),
    }).optional())
    .query(async ({ input }) => {
      let dateFrom = input?.scheduledDateFrom;
      let dateTo   = input?.scheduledDateTo;
      if (input?.month && !dateFrom) {
        dateFrom = `${input.month}-01`;
        dateTo   = `${input.month}-31`;
      }
      return db.listOranjeOperations({
        operationType:     input?.operationType,
        status:            input?.status,
        partnerId:         input?.partnerId,
        scheduledDateFrom: dateFrom,
        scheduledDateTo:   dateTo,
        limit:             input?.limit ?? 200,
        offset:            input?.offset ?? 0,
      });
    }),

  // ── Buscar operação por ID ─────────────────────────────────────────────────
  getById: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const op = await db.getOranjeOperationById(input.id);
      if (!op) throw new TRPCError({ code: "NOT_FOUND", message: "Operação não encontrada." });
      const events = await db.getOperationEvents(input.id);
      return { ...op, events };
    }),

  // ── Atualizar status + notas ───────────────────────────────────────────────
  updateStatus: adminProcedure
    .input(z.object({
      id:            z.number().int().positive(),
      status:        OP_STATUS.optional(),
      internalNotes: z.string().optional(),
      billingStatus: BILLING_STATUS.optional(),
      payoutStatus:  PAYOUT_STATUS.optional(),
      assignedToId:  z.string().optional(),
      assignedToName:z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, status, ...rest } = input;
      // Valida se o status é permitido para o tipo desta operação
      if (status) {
        const op = await db.getOranjeOperationById(id);
        if (!op) throw new TRPCError({ code: "NOT_FOUND", message: "Operação não encontrada." });
        const allowed = STATUS_FLOW[op.operationType] ?? [];
        if (!allowed.includes(status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Status "${status}" não é válido para operações do tipo "${op.operationType}". Permitidos: ${allowed.join(", ")}.`,
          });
        }
      }
      await db.updateOranjeOperation(id, { status, ...rest } as any, ctx.user.name ?? ctx.user.email ?? "admin");
      return { ok: true };
    }),

  // ── Adicionar nota / evento manual ─────────────────────────────────────────
  addEvent: adminProcedure
    .input(z.object({
      operationId: z.number().int().positive(),
      eventType:   z.string().min(1),
      note:        z.string().optional(),
      fromValue:   z.string().optional(),
      toValue:     z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.addOperationEvent({
        operationId: input.operationId,
        eventType:   input.eventType,
        note:        input.note ?? null,
        fromValue:   input.fromValue ?? null,
        toValue:     input.toValue ?? null,
        actorName:   ctx.user.name ?? ctx.user.email ?? "admin",
      });
      return { ok: true };
    }),

  // ── Histórico da operação ──────────────────────────────────────────────────
  events: adminProcedure
    .input(z.object({ operationId: z.number().int().positive() }))
    .query(async ({ input }) => db.getOperationEvents(input.operationId)),

  // ── Resumo financeiro ─────────────────────────────────────────────────────
  financialSummary: adminProcedure
    .input(z.object({
      operationType:     OP_TYPE.optional(),
      month:             z.string().optional(),
      scheduledDateFrom: z.string().optional(),
      scheduledDateTo:   z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      let dateFrom = input?.scheduledDateFrom;
      let dateTo   = input?.scheduledDateTo;
      if (input?.month && !dateFrom) {
        dateFrom = `${input.month}-01`;
        dateTo   = `${input.month}-31`;
      }
      return db.getOranjeOperationsFinancialSummary({
        operationType:     input?.operationType,
        scheduledDateFrom: dateFrom,
        scheduledDateTo:   dateTo,
      });
    }),

  // ── Export CSV ───────────────────────────────────────────────────────────
  exportCsv: adminProcedure
    .input(z.object({
      operationType: OP_TYPE.optional(),
      month:         z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      let dateFrom: string | undefined;
      let dateTo:   string | undefined;
      if (input?.month) {
        dateFrom = `${input.month}-01`;
        dateTo   = `${input.month}-31`;
      }
      const ops = await db.listOranjeOperations({
        operationType:     input?.operationType,
        scheduledDateFrom: dateFrom,
        scheduledDateTo:   dateTo,
        limit: 5000,
      });

      const header = [
        "ID", "Tipo", "Status", "Cliente", "Email", "Telefone",
        "Data Agendada", "Horário", "Pessoas", "Atribuído a", "Parceiro ID",
        "Valor Cliente (R$)", "Repasse Operador (R$)", "Valor Parceiro (R$)",
        "Margem Oranje (R$)", "Status Faturamento", "Status Repasse", "Origem",
        "Criado em",
      ].join(";");

      const rows = ops.map(op => [
        op.id,
        op.operationType,
        op.status,
        `"${op.customerName.replace(/"/g, "'")}"`,
        op.customerEmail ?? "",
        op.customerPhone ?? "",
        op.scheduledDate ?? "",
        op.scheduledTime ?? "",
        op.partySize ?? 1,
        `"${(op.assignedToName ?? "").replace(/"/g, "'")}"`,
        op.partnerId ?? "",
        (op.customerAmount ?? 0).toFixed(2),
        (op.operatorAmount ?? 0).toFixed(2),
        (op.partnerAmount  ?? 0).toFixed(2),
        (op.oranjeMargin   ?? 0).toFixed(2),
        op.billingStatus ?? "not_applicable",
        op.payoutStatus  ?? "not_applicable",
        op.requestOrigin ?? "",
        op.createdAt.toISOString(),
      ].join(";"));

      return { csv: [header, ...rows].join("\n"), count: ops.length };
    }),
});
