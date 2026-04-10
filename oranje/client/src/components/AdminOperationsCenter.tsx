/**
 * AdminOperationsCenter.tsx — Central de Operações Oranje
 * Visão unificada de todos os fluxos operacionais reais:
 * premium_tour, receptive_request, transfer_request, profile_claim
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  LayoutGrid, Filter, Download, ChevronDown, ChevronUp, X,
  Clock, CheckCircle2, XCircle, Car, Award, MapPin, Star,
  History, DollarSign, StickyNote,
} from "lucide-react";

// ─── Config tables ─────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: React.FC<any> }> = {
  premium_tour:      { label: "Passeio Premium",         color: "#E65100", bg: "rgba(230,81,0,0.10)",       icon: Star   },
  receptive_request: { label: "Receptivo",               color: "#1565C0", bg: "rgba(21,101,192,0.10)",     icon: MapPin },
  transfer_request:  { label: "Motorista / Transfer",    color: "#6A1B9A", bg: "rgba(106,27,154,0.10)",     icon: Car    },
  profile_claim:     { label: "Reivindicação de Perfil", color: "#2E7D32", bg: "rgba(46,125,50,0.10)",      icon: Award  },
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: "Pendente",     color: "#E65100", bg: "rgba(230,81,0,0.10)" },
  confirmed:   { label: "Confirmado",   color: "#0D7A5F", bg: "rgba(13,122,95,0.10)" },
  assigned:    { label: "Atribuído",    color: "#0D7A5F", bg: "rgba(13,122,95,0.10)" },
  in_progress: { label: "Em andamento", color: "#1565C0", bg: "rgba(21,101,192,0.10)" },
  completed:   { label: "Concluído",    color: "#2E7D32", bg: "rgba(46,125,50,0.10)" },
  cancelled:   { label: "Cancelado",    color: "#C62828", bg: "rgba(198,40,40,0.08)" },
  rejected:    { label: "Rejeitado",    color: "#C62828", bg: "rgba(198,40,40,0.08)" },
  no_show:     { label: "No-show",      color: "#6D4C41", bg: "rgba(109,76,65,0.08)" },
};

const ALL_STATUSES = Object.keys(STATUS_META);
const ALL_TYPES    = Object.keys(TYPE_META);

// Espelha o STATUS_FLOW do backend — determina quais status são válidos por tipo
const STATUS_FLOW_FRONTEND: Record<string, string[]> = {
  profile_claim:      ["pending", "confirmed", "rejected"],
  premium_tour:       ["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled", "no_show"],
  transfer_request:   ["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled", "no_show"],
  receptive_request:  ["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled", "no_show"],
};

function TypeBadge({ type }: { type: string }) {
  const m = TYPE_META[type] ?? { label: type, color: "#666", bg: "rgba(0,0,0,0.06)", icon: LayoutGrid };
  const Icon = m.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 8px", borderRadius: 6,
      background: m.bg, color: m.color,
      fontSize: 10, fontWeight: 700, fontFamily: "Montserrat, sans-serif",
    }}>
      <Icon size={10} /> {m.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, color: "#666", bg: "rgba(0,0,0,0.06)" };
  return (
    <span style={{
      display: "inline-block", padding: "3px 8px", borderRadius: 6,
      background: m.bg, color: m.color,
      fontSize: 10, fontWeight: 700, fontFamily: "Montserrat, sans-serif",
    }}>
      {m.label}
    </span>
  );
}

// ─── Financial Summary ─────────────────────────────────────────────────────────

function FinancialSummary({ month, type }: { month?: string; type?: string }) {
  const { data } = trpc.operations.financialSummary.useQuery({
    month:         month  || undefined,
    operationType: (type  || undefined) as any,
  });

  if (!data) return null;
  const { totals } = data;

  const cards = [
    { label: "Total faturado",     value: totals.totalRevenue,        color: "#2E7D32" },
    { label: "Repasse operadores", value: totals.totalOperatorPayout, color: "#E65100" },
    { label: "Valor parceiros",    value: totals.totalPartnerFee,     color: "#1565C0" },
    { label: "Margem Oranje",      value: totals.totalMargin,         color: "#00251A" },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(0,37,26,0.4)", fontFamily: "Montserrat, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>
        Fechamento — {totals.totalCount} operação(ões) concluída(s)
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: "#fff", border: "1px solid rgba(0,37,26,0.08)", borderRadius: 12, padding: "12px 14px" }}>
            <p style={{ fontSize: 10, color: "rgba(0,37,26,0.45)", fontFamily: "Montserrat, sans-serif", margin: "0 0 4px" }}>{c.label}</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: c.color, fontFamily: "Montserrat, sans-serif", margin: 0 }}>
              R$ {(c.value ?? 0).toFixed(2).replace(".", ",")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Event History ─────────────────────────────────────────────────────────────

function EventHistory({ operationId }: { operationId: number }) {
  const { data: events } = trpc.operations.events.useQuery({ operationId });

  if (!events || events.length === 0) {
    return (
      <p style={{ fontSize: 11, color: "rgba(0,37,26,0.35)", fontFamily: "Montserrat, sans-serif", margin: "8px 0 0", fontStyle: "italic" }}>
        Nenhum evento registrado.
      </p>
    );
  }

  const EVENT_LABEL: Record<string, string> = {
    created:       "Criado",
    status_change: "Status alterado",
    note:          "Nota adicionada",
    assignment:    "Atribuição",
    financial:     "Financeiro",
  };

  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(0,37,26,0.4)", fontFamily: "Montserrat, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
        Histórico
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {events.map(ev => (
          <div key={ev.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#E65100", flexShrink: 0, marginTop: 4 }} />
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#00251A", fontFamily: "Montserrat, sans-serif" }}>
                {EVENT_LABEL[ev.eventType] ?? ev.eventType}
              </span>
              {ev.fromValue && ev.toValue && (
                <span style={{ fontSize: 10, color: "rgba(0,37,26,0.5)", fontFamily: "Montserrat, sans-serif" }}>
                  {" "}· {ev.fromValue} → {ev.toValue}
                </span>
              )}
              {ev.note && (
                <p style={{ fontSize: 11, color: "rgba(0,37,26,0.55)", fontFamily: "Montserrat, sans-serif", margin: "2px 0 0" }}>{ev.note}</p>
              )}
              <p style={{ fontSize: 9, color: "rgba(0,37,26,0.35)", fontFamily: "Montserrat, sans-serif", margin: "2px 0 0" }}>
                {ev.actorName ?? "sistema"} · {new Date(ev.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Operation Row ─────────────────────────────────────────────────────────────

function OperationRow({ op }: { op: any }) {
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const utils = trpc.useUtils();

  const [editStatus, setEditStatus] = useState(op.status);
  const [editBilling, setEditBilling] = useState(op.billingStatus);
  const [editPayout, setEditPayout] = useState(op.payoutStatus);
  const [editNotes, setEditNotes] = useState(op.internalNotes ?? "");
  const [saving, setSaving] = useState(false);

  const updateMutation = trpc.operations.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Operação atualizada.");
      utils.operations.list.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar operação."),
  });

  async function handleSave() {
    setSaving(true);
    await updateMutation.mutateAsync({
      id:            op.id,
      status:        editStatus,
      billingStatus: editBilling,
      payoutStatus:  editPayout,
      internalNotes: editNotes || undefined,
    });
    setSaving(false);
  }

  const hasFinancial = (op.customerAmount ?? 0) > 0 || (op.operatorAmount ?? 0) > 0;
  const meta = op.metaJson ?? {};

  return (
    <div style={{ background: "#fff", border: "1px solid rgba(0,37,26,0.08)", borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
      {/* Collapsed row */}
      <div onClick={() => setExpanded(!expanded)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
            <TypeBadge type={op.operationType} />
            <StatusBadge status={op.status} />
            <span style={{ fontSize: 10, color: "rgba(0,37,26,0.4)", fontFamily: "Montserrat, sans-serif" }}>
              <span style={{ fontWeight: 700, color: "#E65100", fontFamily: "Montserrat, sans-serif" }}>
                {op.operationCode ?? `#${op.id}`}
              </span>
              {" "}· {op.scheduledDate ?? new Date(op.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#00251A", fontFamily: "Montserrat, sans-serif", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {op.customerName}
          </p>
          <p style={{ fontSize: 11, color: "rgba(0,37,26,0.5)", fontFamily: "Montserrat, sans-serif", margin: 0 }}>
            {op.customerEmail ?? op.customerPhone ?? "—"}
            {hasFinancial && (
              <span style={{ marginLeft: 8, color: op.oranjeMargin >= 0 ? "#2E7D32" : "#C62828", fontWeight: 600 }}>
                · margem R$ {(op.oranjeMargin ?? 0).toFixed(2).replace(".", ",")}
              </span>
            )}
          </p>
          {meta.tourName && (
            <p style={{ fontSize: 10, color: "#E65100", fontFamily: "Montserrat, sans-serif", margin: "2px 0 0", fontWeight: 600 }}>
              {meta.tourName}
            </p>
          )}
        </div>
        {expanded ? <ChevronUp size={16} color="#999" /> : <ChevronDown size={16} color="#999" />}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 14px 16px", borderTop: "1px solid rgba(0,37,26,0.06)" }}>
          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "14px 0 12px" }}>
            {op.operationCode && <InfoCell label="Código" value={op.operationCode} />}
            <InfoCell label="Tipo" value={TYPE_META[op.operationType]?.label ?? op.operationType} />
            <InfoCell label="Origem" value={op.requestOrigin ?? "web"} />
            <InfoCell label="Email" value={op.customerEmail ?? "—"} />
            <InfoCell label="Telefone" value={op.customerPhone ?? "—"} />
            {op.scheduledDate && <InfoCell label="Data" value={`${op.scheduledDate} ${op.scheduledTime ?? ""}`.trim()} />}
            {op.partySize && op.partySize > 1 && <InfoCell label="Pessoas" value={String(op.partySize)} />}
            {op.assignedToName && <InfoCell label="Atribuído a" value={op.assignedToName} />}
            {meta.serviceType && <InfoCell label="Serviço" value={meta.serviceType} />}
            {meta.region && <InfoCell label="Região" value={meta.region} />}
            {meta.vehicleModel && <InfoCell label="Veículo" value={meta.vehicleModel} />}
            {meta.businessName && <InfoCell label="Estabelecimento" value={meta.businessName} />}
            {meta.contactRole && <InfoCell label="Cargo" value={meta.contactRole} />}
            {meta.departurePoint && <InfoCell label="Ponto de saída" value={meta.departurePoint} />}
          </div>

          {/* Financial */}
          {hasFinancial && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
              <FinCell label="Cliente"   value={op.customerAmount} color="#00251A" />
              <FinCell label="Operador"  value={op.operatorAmount} color="#E65100" />
              <FinCell label="Parceiro"  value={op.partnerAmount}  color="#1565C0" />
            </div>
          )}

          {op.notes && (
            <div style={{ background: "rgba(0,37,26,0.03)", borderRadius: 8, padding: "8px 10px", marginBottom: 12 }}>
              <p style={{ fontSize: 10, color: "rgba(0,37,26,0.4)", fontFamily: "Montserrat, sans-serif", margin: "0 0 3px" }}>Observações</p>
              <p style={{ fontSize: 12, color: "#00251A", fontFamily: "Montserrat, sans-serif", margin: 0 }}>{op.notes}</p>
            </div>
          )}

          {/* Edit controls */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 140px" }}>
              <label style={labelStyle}>Status</label>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value as any)} style={selectStyle}>
                {(STATUS_FLOW_FRONTEND[op.operationType] ?? ALL_STATUSES).map(s => (
                  <option key={s} value={s}>{STATUS_META[s]?.label ?? s}</option>
                ))}
              </select>
            </div>
            {hasFinancial && (
              <>
                <div style={{ flex: "1 1 140px" }}>
                  <label style={labelStyle}>Faturamento</label>
                  <select value={editBilling} onChange={e => setEditBilling(e.target.value as any)} style={selectStyle}>
                    <option value="not_applicable">Não aplicável</option>
                    <option value="pending">Pendente</option>
                    <option value="billed">Faturado</option>
                    <option value="paid">Pago</option>
                  </select>
                </div>
                <div style={{ flex: "1 1 140px" }}>
                  <label style={labelStyle}>Repasse</label>
                  <select value={editPayout} onChange={e => setEditPayout(e.target.value as any)} style={selectStyle}>
                    <option value="not_applicable">Não aplicável</option>
                    <option value="pending">Pendente</option>
                    <option value="ready_to_pay">A pagar</option>
                    <option value="paid">Pago</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Notas internas</label>
            <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2}
              style={{ ...selectStyle, resize: "vertical", minHeight: 52 }} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{
              flex: 1, background: saving ? "#ccc" : "#00251A", border: "none",
              borderRadius: 8, padding: "10px 0", cursor: "pointer",
            }}>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "Montserrat, sans-serif" }}>
                {saving ? "Salvando..." : "Salvar"}
              </span>
            </button>
            <button onClick={() => setShowHistory(!showHistory)} style={{
              background: "rgba(0,37,26,0.05)", border: "1px solid rgba(0,37,26,0.12)",
              borderRadius: 8, padding: "10px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <History size={14} color="#00251A" />
              <span style={{ fontSize: 12, fontFamily: "Montserrat, sans-serif", color: "#00251A" }}>Histórico</span>
            </button>
          </div>

          {showHistory && <EventHistory operationId={op.id} />}
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 9, color: "rgba(0,37,26,0.4)", fontFamily: "Montserrat, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>{label}</p>
      <p style={{ fontSize: 12, color: "#00251A", fontFamily: "Montserrat, sans-serif", margin: 0, wordBreak: "break-word" }}>{value}</p>
    </div>
  );
}

function FinCell({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: "rgba(0,37,26,0.03)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
      <p style={{ fontSize: 9, color: "rgba(0,37,26,0.4)", fontFamily: "Montserrat, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "Montserrat, sans-serif", margin: 0 }}>
        R$ {(value ?? 0).toFixed(2).replace(".", ",")}
      </p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 9, fontWeight: 700, color: "rgba(0,37,26,0.4)",
  fontFamily: "Montserrat, sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5,
};

const selectStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", borderRadius: 8,
  border: "1px solid rgba(0,37,26,0.15)", fontSize: 12,
  fontFamily: "Montserrat, sans-serif", background: "#fff", color: "#00251A",
  boxSizing: "border-box",
};

// ─── Main Panel ────────────────────────────────────────────────────────────────

export function AdminOperationsCenter() {
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [activeView, setActiveView] = useState<"operations" | "summary">("operations");

  const { data: operations, isLoading } = trpc.operations.list.useQuery({
    operationType:     (filterType   || undefined) as any,
    status:            (filterStatus || undefined) as any,
    month:             filterMonth   || undefined,
    limit: 500,
  });

  function handleExportCsv() {
    if (!operations || operations.length === 0) {
      toast.error("Nenhuma operação para exportar.");
      return;
    }
    const header = [
      "ID", "Código", "Tipo", "Status", "Cliente", "Email", "Telefone",
      "Data Agendada", "Horário", "Pessoas",
      "Valor Cliente (R$)", "Repasse Operador (R$)", "Valor Parceiro (R$)", "Margem (R$)",
      "Status Faturamento", "Status Repasse", "Origem", "Criado em",
    ].join(";");

    const rows = operations.map((op: any) => [
      op.id,
      op.operationCode ?? "",
      TYPE_META[op.operationType]?.label ?? op.operationType,
      STATUS_META[op.status]?.label ?? op.status,
      `"${op.customerName.replace(/"/g, "'")}"`,
      op.customerEmail ?? "",
      op.customerPhone ?? "",
      op.scheduledDate ?? "",
      op.scheduledTime ?? "",
      op.partySize ?? 1,
      (op.customerAmount ?? 0).toFixed(2),
      (op.operatorAmount ?? 0).toFixed(2),
      (op.partnerAmount  ?? 0).toFixed(2),
      (op.oranjeMargin   ?? 0).toFixed(2),
      op.billingStatus ?? "",
      op.payoutStatus  ?? "",
      op.requestOrigin ?? "",
      new Date(op.createdAt).toLocaleString("pt-BR"),
    ].join(";"));

    const csv = "\uFEFF" + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oranje-central${filterType ? `-${filterType}` : ""}${filterMonth ? `-${filterMonth}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasFilters = !!(filterType || filterStatus || filterMonth);

  // KPI counts by type
  const typeCounts = (operations ?? []).reduce((acc: Record<string, number>, op: any) => {
    acc[op.operationType] = (acc[op.operationType] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ fontFamily: "Montserrat, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#00251A", margin: "0 0 3px" }}>
            Central de Operações
          </h2>
          <p style={{ fontSize: 12, color: "rgba(0,37,26,0.45)", margin: 0 }}>
            Todos os fluxos operacionais reais da Oranje em um só lugar
          </p>
        </div>
        <button onClick={handleExportCsv} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#00251A", border: "none", borderRadius: 8,
          padding: "8px 12px", cursor: "pointer",
        }}>
          <Download size={14} color="#fff" />
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>CSV</span>
        </button>
      </div>

      {/* Type KPIs */}
      {operations && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {ALL_TYPES.map(type => {
            const m = TYPE_META[type];
            const count = typeCounts[type] ?? 0;
            const Icon = m.icon;
            return (
              <button
                key={type}
                onClick={() => setFilterType(filterType === type ? "" : type)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 12px", borderRadius: 8, border: "1px solid",
                  borderColor: filterType === type ? m.color : "rgba(0,37,26,0.12)",
                  background: filterType === type ? m.bg : "#fff",
                  cursor: "pointer",
                }}
              >
                <Icon size={12} color={m.color} />
                <span style={{ fontSize: 11, fontWeight: 600, color: filterType === type ? m.color : "#00251A", fontFamily: "Montserrat, sans-serif" }}>
                  {m.label}
                </span>
                <span style={{ fontSize: 10, background: filterType === type ? m.color : "rgba(0,37,26,0.08)", color: filterType === type ? "#fff" : "#00251A", borderRadius: 10, padding: "1px 6px", fontWeight: 700 }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* View toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "operations", label: "Operações" },
          { id: "summary",    label: "Fechamento Financeiro" },
        ].map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id as any)} style={{
            padding: "7px 14px", borderRadius: 8, border: "1px solid",
            borderColor: activeView === v.id ? "#E65100" : "rgba(0,37,26,0.15)",
            background:  activeView === v.id ? "#E65100" : "#fff",
            cursor: "pointer",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "Montserrat, sans-serif", color: activeView === v.id ? "#fff" : "#00251A" }}>
              {v.label}
            </span>
          </button>
        ))}
      </div>

      {activeView === "summary" && (
        <FinancialSummary
          month={filterMonth || undefined}
          type={filterType || undefined}
        />
      )}

      {activeView === "operations" && (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 160px" }}>
              <label style={labelStyle}>Tipo de operação</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selectStyle}>
                <option value="">Todos os tipos</option>
                {ALL_TYPES.map(t => (
                  <option key={t} value={t}>{TYPE_META[t]?.label ?? t}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label style={labelStyle}>Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
                <option value="">Todos os status</option>
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_META[s]?.label ?? s}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label style={labelStyle}>Mês</label>
              <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={selectStyle} />
            </div>
            {hasFilters && (
              <button onClick={() => { setFilterType(""); setFilterStatus(""); setFilterMonth(""); }}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,37,26,0.15)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <X size={12} color="#666" />
                <span style={{ fontSize: 11, color: "#666", fontFamily: "Montserrat, sans-serif" }}>Limpar</span>
              </button>
            )}
          </div>

          <p style={{ fontSize: 11, color: "rgba(0,37,26,0.4)", margin: "0 0 12px" }}>
            {isLoading ? "Carregando..." : `${operations?.length ?? 0} operação(ões)`}
          </p>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(0,37,26,0.3)" }}>
              <LayoutGrid size={32} style={{ margin: "0 auto 12px" }} />
              <p>Carregando...</p>
            </div>
          ) : !operations || operations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "rgba(0,37,26,0.02)", borderRadius: 12, border: "1px dashed rgba(0,37,26,0.12)" }}>
              <LayoutGrid size={32} color="rgba(0,37,26,0.2)" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, color: "rgba(0,37,26,0.4)", fontFamily: "Montserrat, sans-serif", fontWeight: 600, margin: "0 0 6px" }}>
                Nenhuma operação encontrada
              </p>
              <p style={{ fontSize: 12, color: "rgba(0,37,26,0.3)", fontFamily: "Montserrat, sans-serif", margin: 0 }}>
                {hasFilters ? "Tente remover os filtros." : "As operações aparecerão aqui quando forem criadas."}
              </p>
            </div>
          ) : (
            <div>
              {operations.map((op: any) => (
                <OperationRow key={op.id} op={op} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
