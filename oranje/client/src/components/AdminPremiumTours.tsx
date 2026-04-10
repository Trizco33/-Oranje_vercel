import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Car, Filter, Download, ChevronDown, ChevronUp, X, Check,
  Clock, AlertCircle, CheckCircle2, XCircle, Users, DollarSign,
  Calendar, Settings,
} from "lucide-react";

// ─── Status labels ────────────────────────────────────────────────────────────

const OP_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: "Pendente",     color: "#E65100",  bg: "rgba(230,81,0,0.12)" },
  confirmed:   { label: "Confirmado",   color: "#0D7A5F",  bg: "rgba(13,122,95,0.12)" },
  assigned:    { label: "Atribuído",    color: "#0D7A5F",  bg: "rgba(13,122,95,0.12)" },
  in_progress: { label: "Em andamento", color: "#1565C0",  bg: "rgba(21,101,192,0.12)" },
  completed:   { label: "Concluído",    color: "#2E7D32",  bg: "rgba(46,125,50,0.12)" },
  cancelled:   { label: "Cancelado",    color: "#C62828",  bg: "rgba(198,40,40,0.10)" },
  no_show:     { label: "No-show",      color: "#6D4C41",  bg: "rgba(109,76,65,0.10)" },
};

const PAYOUT_LABELS: Record<string, { label: string; color: string }> = {
  pending:       { label: "Pendente",  color: "#E65100" },
  ready_to_pay:  { label: "A pagar",   color: "#1565C0" },
  paid:          { label: "Pago",      color: "#2E7D32" },
};

const OP_STATUSES = ["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled", "no_show"];
const PAYOUT_STATUSES = ["pending", "ready_to_pay", "paid"];

function StatusBadge({ status, map }: { status: string; map: Record<string, { label: string; color: string; bg?: string }> }) {
  const s = map[status] ?? { label: status, color: "#666", bg: "rgba(0,0,0,0.06)" };
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 8px",
      borderRadius: 6,
      background: (s as any).bg ?? "rgba(0,0,0,0.06)",
      color: s.color,
      fontSize: 10,
      fontWeight: 700,
      fontFamily: "Montserrat, sans-serif",
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

// ─── Financial Summary ────────────────────────────────────────────────────────

function FinancialSummary({ month }: { month?: string }) {
  const { data } = trpc.tourOperations.financialSummary.useQuery({ month: month || undefined });

  if (!data) return null;
  const { totals } = data;

  const cards = [
    { label: "Total faturado",       value: totals.totalRevenue,       color: "#2E7D32" },
    { label: "Repasse motoristas",   value: totals.totalDriverPayout,  color: "#E65100" },
    { label: "Faturamento parceiros",value: totals.totalPartnerFee,    color: "#1565C0" },
    { label: "Margem Oranje",        value: totals.totalMargin,        color: "#00251A" },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, color: "rgba(0,37,26,0.4)",
        fontFamily: "Montserrat, sans-serif", letterSpacing: "0.08em",
        textTransform: "uppercase", margin: "0 0 10px",
      }}>
        Fechamento financeiro — {totals.totalExecutions} execuções concluídas
        {month ? ` (${month})` : " (todos os períodos)"}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
        {cards.map(c => (
          <div key={c.label} style={{
            background: "#fff",
            border: "1px solid rgba(0,37,26,0.08)",
            borderRadius: 12, padding: "12px 14px",
          }}>
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

// ─── Tour Premium Settings Modal ──────────────────────────────────────────────

function TourPremiumSettingsModal({ tourId, tourName, onClose }: {
  tourId: number; tourName: string; onClose: () => void;
}) {
  const [form, setForm] = useState({
    requiresTransport: false,
    walkOnly: false,
    recommendedWithDriver: false,
    clientPrice: "",
    driverPayout: "",
    partnerFee: "",
  });

  const updateMutation = trpc.tourOperations.updateTourPremiumSettings.useMutation({
    onSuccess: () => {
      toast.success("Configurações do passeio atualizadas.");
      onClose();
    },
    onError: () => toast.error("Erro ao salvar configurações."),
  });

  function handleSave() {
    updateMutation.mutate({
      tourId,
      requiresTransport: form.requiresTransport,
      walkOnly: form.walkOnly,
      recommendedWithDriver: form.recommendedWithDriver,
      clientPrice: form.clientPrice ? parseFloat(form.clientPrice) : null,
      driverPayout: form.driverPayout ? parseFloat(form.driverPayout) : null,
      partnerFee: form.partnerFee ? parseFloat(form.partnerFee) : null,
    });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 3000,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "24px 20px",
        width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: "#00251A", fontFamily: "Montserrat, sans-serif", margin: 0 }}>
              Configurar passeio premium
            </p>
            <p style={{ fontSize: 11, color: "rgba(0,37,26,0.45)", fontFamily: "Montserrat, sans-serif", margin: 0 }}>
              {tourName}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color="#666" />
          </button>
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,37,26,0.4)", fontFamily: "Montserrat, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
          Elegibilidade
        </p>
        {[
          { key: "requiresTransport", label: "Requer transporte" },
          { key: "walkOnly", label: "Walk-only (sem motorista)" },
          { key: "recommendedWithDriver", label: "Recomendado com motorista" },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={(form as any)[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))}
            />
            <span style={{ fontSize: 13, color: "#00251A", fontFamily: "Montserrat, sans-serif" }}>{label}</span>
          </label>
        ))}

        <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,37,26,0.4)", fontFamily: "Montserrat, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", margin: "20px 0 10px" }}>
          Valores (R$)
        </p>
        {[
          { key: "clientPrice", label: "Valor ao cliente" },
          { key: "driverPayout", label: "Repasse ao motorista" },
          { key: "partnerFee", label: "Faturamento parceiro" },
        ].map(({ key, label }) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: "rgba(0,37,26,0.45)", fontFamily: "Montserrat, sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
              {label}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={(form as any)[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              placeholder="0,00"
              style={{
                width: "100%", padding: "9px 12px", borderRadius: 8,
                border: "1px solid rgba(0,37,26,0.15)", fontSize: 13,
                fontFamily: "Montserrat, sans-serif", boxSizing: "border-box",
              }}
            />
          </div>
        ))}

        {form.clientPrice && form.driverPayout && form.partnerFee && (
          <div style={{ background: "rgba(0,37,26,0.04)", borderRadius: 8, padding: "10px 12px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "rgba(0,37,26,0.45)", fontFamily: "Montserrat, sans-serif", margin: "0 0 4px" }}>
              Margem Oranje calculada:
            </p>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#00251A", fontFamily: "Montserrat, sans-serif", margin: 0 }}>
              R$ {(parseFloat(form.clientPrice) - parseFloat(form.driverPayout) - parseFloat(form.partnerFee)).toFixed(2).replace(".", ",")}
            </p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          style={{
            width: "100%", background: "#E65100", border: "none",
            borderRadius: 10, padding: "12px 0", cursor: "pointer",
          }}
        >
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>
            {updateMutation.isPending ? "Salvando..." : "Salvar configurações"}
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Operation Row (expandable) ───────────────────────────────────────────────

function OperationRow({ op }: { op: any }) {
  const [expanded, setExpanded] = useState(false);
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.tourOperations.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado.");
      utils.tourOperations.list.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar status."),
  });

  const [opStatus, setOpStatus] = useState(op.operationStatus);
  const [payoutStatus, setPayoutStatus] = useState(op.driverPayoutStatus);
  const [notes, setNotes] = useState(op.internalNotes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateStatusMutation.mutateAsync({
      id: op.id,
      operationStatus: opStatus,
      driverPayoutStatus: payoutStatus,
      internalNotes: notes,
    });
    setSaving(false);
  }

  const margin = (op.oranjeMargin ?? 0).toFixed(2).replace(".", ",");

  return (
    <div style={{
      background: "#fff",
      border: "1px solid rgba(0,37,26,0.08)",
      borderRadius: 12,
      marginBottom: 8,
      overflow: "hidden",
    }}>
      {/* Collapsed row */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <StatusBadge status={op.operationStatus} map={OP_STATUS_LABELS} />
            <span style={{ fontSize: 11, color: "rgba(0,37,26,0.45)", fontFamily: "Montserrat, sans-serif" }}>
              #{op.id} · {op.scheduledDate} {op.scheduledTime ?? ""}
            </span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#00251A", fontFamily: "Montserrat, sans-serif", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {op.tourName ?? `Tour #${op.tourId}`}
          </p>
          <p style={{ fontSize: 11, color: "rgba(0,37,26,0.55)", fontFamily: "Montserrat, sans-serif", margin: 0 }}>
            {op.clientName} · {op.partySize} pax · R$ {(op.clientPrice ?? 0).toFixed(2).replace(".", ",")}
            {" · "}<span style={{ color: op.oranjeMargin >= 0 ? "#2E7D32" : "#C62828" }}>margem R$ {margin}</span>
          </p>
        </div>
        {expanded ? <ChevronUp size={16} color="#999" /> : <ChevronDown size={16} color="#999" />}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 14px 16px", borderTop: "1px solid rgba(0,37,26,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "14px 0" }}>
            <InfoCell label="Motorista" value={op.driverName ?? "Não atribuído"} />
            <InfoCell label="Telefone motorista" value={op.driverPhone ?? "—"} />
            <InfoCell label="Email cliente" value={op.clientEmail ?? "—"} />
            <InfoCell label="Tel. cliente" value={op.clientPhone ?? "—"} />
            <InfoCell label="Ponto de saída" value={op.departurePoint ?? "—"} />
            <InfoCell label="Origem" value={op.requestOrigin ?? "web"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
            <FinCell label="Cliente" value={op.clientPrice} color="#00251A" />
            <FinCell label="Motorista" value={op.driverPayout} color="#E65100" />
            <FinCell label="Parceiro" value={op.partnerFee} color="#1565C0" />
          </div>

          {op.notes && (
            <div style={{ background: "rgba(0,37,26,0.03)", borderRadius: 8, padding: "8px 10px", marginBottom: 12 }}>
              <p style={{ fontSize: 10, color: "rgba(0,37,26,0.4)", fontFamily: "Montserrat, sans-serif", margin: "0 0 3px" }}>Observações do cliente</p>
              <p style={{ fontSize: 12, color: "#00251A", fontFamily: "Montserrat, sans-serif", margin: 0 }}>{op.notes}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Status operação</label>
              <select value={opStatus} onChange={e => setOpStatus(e.target.value as any)} style={selectStyle}>
                {OP_STATUSES.map(s => (
                  <option key={s} value={s}>{OP_STATUS_LABELS[s]?.label ?? s}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Repasse motorista</label>
              <select value={payoutStatus} onChange={e => setPayoutStatus(e.target.value as any)} style={selectStyle}>
                {PAYOUT_STATUSES.map(s => (
                  <option key={s} value={s}>{PAYOUT_LABELS[s]?.label ?? s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Notas internas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              style={{ ...selectStyle, resize: "vertical", minHeight: 52 }}
            />
          </div>

          <button onClick={handleSave} disabled={saving} style={{
            width: "100%", background: saving ? "#ccc" : "#00251A",
            border: "none", borderRadius: 8, padding: "10px 0", cursor: "pointer",
          }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "Montserrat, sans-serif" }}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </span>
          </button>
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
  display: "block", fontSize: 9, fontWeight: 700,
  color: "rgba(0,37,26,0.4)", fontFamily: "Montserrat, sans-serif",
  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5,
};

const selectStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", borderRadius: 8,
  border: "1px solid rgba(0,37,26,0.15)", fontSize: 12,
  fontFamily: "Montserrat, sans-serif", background: "#fff", color: "#00251A",
  boxSizing: "border-box",
};

// ─── Main Component ────────────────────────────────────────────────────────────

export function AdminPremiumTours() {
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [showSettings, setShowSettings] = useState<{ id: number; name: string } | null>(null);
  const [activeView, setActiveView] = useState<"operations" | "summary">("operations");

  const { data: operations, isLoading } = trpc.tourOperations.list.useQuery({
    operationStatus: (filterStatus || undefined) as any,
    month: filterMonth || undefined,
    limit: 200,
  });

  const { data: tours } = trpc.receptivo.list.useQuery();

  const { data: csvData } = trpc.tourOperations.exportCsv.useQuery({
    month: filterMonth || undefined,
  }, { enabled: false });

  function handleExportCsv() {
    if (!operations || operations.length === 0) {
      toast.error("Nenhuma operação para exportar.");
      return;
    }

    const header = [
      "ID", "Data", "Horário", "Passeio", "Cliente", "Email", "Telefone",
      "Pessoas", "Motorista", "Valor (R$)", "Repasse Motorista (R$)",
      "Parceiro (R$)", "Margem Oranje (R$)", "Status Operação",
      "Status Repasse", "Origem",
    ].join(";");

    const rows = operations.map((op: any) => [
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
    ].join(";"));

    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oranje-passeios${filterMonth ? `-${filterMonth}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ fontFamily: "Montserrat, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#00251A", margin: "0 0 3px" }}>
            Passeios Premium
          </h2>
          <p style={{ fontSize: 12, color: "rgba(0,37,26,0.45)", margin: 0 }}>
            Operação financeira com Motorista Oranje
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#00251A", border: "none", borderRadius: 8,
            padding: "8px 12px", cursor: "pointer",
          }}
        >
          <Download size={14} color="#fff" />
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>Exportar CSV</span>
        </button>
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "operations", label: "Operações" },
          { id: "summary", label: "Fechamento Financeiro" },
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id as any)}
            style={{
              padding: "7px 14px", borderRadius: 8, border: "1px solid",
              borderColor: activeView === v.id ? "#E65100" : "rgba(0,37,26,0.15)",
              background: activeView === v.id ? "#E65100" : "#fff",
              cursor: "pointer",
            }}
          >
            <span style={{
              fontSize: 11, fontWeight: 700, fontFamily: "Montserrat, sans-serif",
              color: activeView === v.id ? "#fff" : "#00251A",
            }}>
              {v.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tour Settings */}
      {tours && tours.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(0,37,26,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
            Configurar elegibilidade dos passeios
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tours.map((t: any) => (
              <button
                key={t.id}
                onClick={() => setShowSettings({ id: t.id, name: t.name })}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 8,
                  border: "1px solid rgba(0,37,26,0.15)",
                  background: t.requiresTransport || t.recommendedWithDriver
                    ? "rgba(230,81,0,0.08)" : "#fff",
                  cursor: "pointer",
                }}
              >
                <Settings size={12} color={t.requiresTransport || t.recommendedWithDriver ? "#E65100" : "#666"} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#00251A", fontFamily: "Montserrat, sans-serif" }}>
                  {t.name}
                </span>
                {(t.requiresTransport || t.recommendedWithDriver) && (
                  <span style={{ fontSize: 9, color: "#E65100", fontWeight: 700 }}>• Premium</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeView === "summary" && (
        <FinancialSummary month={filterMonth || undefined} />
      )}

      {activeView === "operations" && (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={labelStyle}>Status da operação</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
                <option value="">Todos os status</option>
                {OP_STATUSES.map(s => (
                  <option key={s} value={s}>{OP_STATUS_LABELS[s]?.label ?? s}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>Mês</label>
              <input
                type="month"
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                style={selectStyle}
              />
            </div>
            {(filterStatus || filterMonth) && (
              <div style={{ alignSelf: "flex-end" }}>
                <button
                  onClick={() => { setFilterStatus(""); setFilterMonth(""); }}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,37,26,0.15)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <X size={12} color="#666" />
                  <span style={{ fontSize: 11, color: "#666", fontFamily: "Montserrat, sans-serif" }}>Limpar</span>
                </button>
              </div>
            )}
          </div>

          {/* Operations count */}
          <p style={{ fontSize: 11, color: "rgba(0,37,26,0.4)", margin: "0 0 12px" }}>
            {isLoading ? "Carregando..." : `${operations?.length ?? 0} operação(ões)`}
          </p>

          {/* Operations list */}
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(0,37,26,0.35)" }}>
              <Car size={32} style={{ margin: "0 auto 12px" }} />
              <p>Carregando operações...</p>
            </div>
          ) : !operations || operations.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "40px 20px",
              background: "rgba(0,37,26,0.02)", borderRadius: 12,
              border: "1px dashed rgba(0,37,26,0.12)",
            }}>
              <Car size={32} color="rgba(0,37,26,0.2)" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, color: "rgba(0,37,26,0.4)", fontFamily: "Montserrat, sans-serif", fontWeight: 600, margin: "0 0 6px" }}>
                Nenhuma operação encontrada
              </p>
              <p style={{ fontSize: 12, color: "rgba(0,37,26,0.3)", fontFamily: "Montserrat, sans-serif", margin: 0 }}>
                As solicitações de passeio com motorista aparecerão aqui
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

      {showSettings && (
        <TourPremiumSettingsModal
          tourId={showSettings.id}
          tourName={showSettings.name}
          onClose={() => setShowSettings(null)}
        />
      )}
    </div>
  );
}
