import { useState, useEffect } from "react";
import { X, Car, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TourRequestSheetProps {
  open: boolean;
  onClose: () => void;
  tourId: number;
  tourName: string;
  clientPrice?: number | null;
}

export function TourRequestSheet({ open, onClose, tourId, tourName, clientPrice }: TourRequestSheetProps) {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    scheduledDate: "",
    scheduledTime: "",
    partySize: 1,
    departurePoint: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setTimeout(() => setVisible(true), 80);
    } else {
      setVisible(false);
      setTimeout(() => setSubmitted(false), 400);
    }
  }, [open]);

  const requestMutation = trpc.tourOperations.request.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      toast.error("Erro ao enviar solicitação. Tente novamente.");
      console.error(err);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName.trim()) return toast.error("Informe seu nome.");
    if (!form.scheduledDate) return toast.error("Informe a data desejada.");
    requestMutation.mutate({
      tourId,
      ...form,
    });
  }

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 2000,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2001,
          background: "linear-gradient(160deg, #001A12 0%, #00251A 60%, #002E1F 100%)",
          borderRadius: "20px 20px 0 0",
          maxHeight: "92vh",
          overflowY: "auto",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 20px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(230,81,0,0.15)",
              border: "1px solid rgba(230,81,0,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Car size={18} color="#E65100" />
            </div>
            <div>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "Montserrat, sans-serif", margin: 0 }}>
                Solicitar Passeio
              </p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "Montserrat, sans-serif", margin: 0 }}>
                {tourName}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={20} color="rgba(255,255,255,0.5)" />
          </button>
        </div>

        {submitted ? (
          <div style={{ padding: "40px 24px 60px", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(230,81,0,0.15)",
              border: "2px solid rgba(230,81,0,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Check size={28} color="#E65100" />
            </div>
            <p style={{ color: "#fff", fontSize: 17, fontWeight: 700, fontFamily: "Montserrat, sans-serif", margin: "0 0 10px" }}>
              Solicitação enviada!
            </p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontFamily: "Montserrat, sans-serif", lineHeight: 1.6, margin: "0 0 28px" }}>
              Recebemos seu pedido para o passeio <strong style={{ color: "#E65100" }}>{tourName}</strong>.
              {" "}Nossa equipe entrará em contato em breve para confirmar os detalhes.
            </p>
            <button
              onClick={onClose}
              style={{
                background: "#E65100", border: "none", borderRadius: 10,
                padding: "12px 28px", cursor: "pointer", width: "100%",
              }}
            >
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "Montserrat, sans-serif" }}>
                Fechar
              </span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: "0 20px 60px" }}>
            {clientPrice != null && clientPrice > 0 && (
              <div style={{
                background: "rgba(230,81,0,0.1)", border: "1px solid rgba(230,81,0,0.2)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 20,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "Montserrat, sans-serif" }}>
                  Valor do passeio
                </span>
                <span style={{ color: "#E65100", fontSize: 15, fontWeight: 700, fontFamily: "Montserrat, sans-serif" }}>
                  R$ {clientPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}

            <SectionLabel label="Seus dados" />

            <Field label="Seu nome *">
              <input
                value={form.clientName}
                onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))}
                placeholder="Nome completo"
                required
                style={inputStyle}
              />
            </Field>
            <Field label="E-mail">
              <input
                type="email"
                value={form.clientEmail}
                onChange={e => setForm(p => ({ ...p, clientEmail: e.target.value }))}
                placeholder="seu@email.com.br"
                style={inputStyle}
              />
            </Field>
            <Field label="Telefone / WhatsApp">
              <input
                value={form.clientPhone}
                onChange={e => setForm(p => ({ ...p, clientPhone: e.target.value }))}
                placeholder="(19) 9xxxx-xxxx"
                style={inputStyle}
              />
            </Field>

            <SectionLabel label="Detalhes do passeio" />

            <Field label="Data desejada *">
              <input
                type="date"
                value={form.scheduledDate}
                onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))}
                required
                style={inputStyle}
              />
            </Field>
            <Field label="Horário preferido">
              <input
                type="time"
                value={form.scheduledTime}
                onChange={e => setForm(p => ({ ...p, scheduledTime: e.target.value }))}
                style={inputStyle}
              />
            </Field>
            <Field label="Número de pessoas">
              <input
                type="number"
                min={1}
                max={20}
                value={form.partySize}
                onChange={e => setForm(p => ({ ...p, partySize: parseInt(e.target.value) || 1 }))}
                style={inputStyle}
              />
            </Field>
            <Field label="Ponto de saída">
              <input
                value={form.departurePoint}
                onChange={e => setForm(p => ({ ...p, departurePoint: e.target.value }))}
                placeholder="Hotel, endereço ou ponto de encontro"
                style={inputStyle}
              />
            </Field>
            <Field label="Observações">
              <textarea
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Alguma necessidade especial, preferência ou dúvida?"
                rows={3}
                style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
              />
            </Field>

            <button
              type="submit"
              disabled={requestMutation.isPending}
              style={{
                width: "100%",
                background: requestMutation.isPending ? "rgba(230,81,0,0.5)" : "#E65100",
                border: "none",
                borderRadius: 12,
                padding: "14px 20px",
                cursor: requestMutation.isPending ? "not-allowed" : "pointer",
                marginTop: 8,
              }}
            >
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "Montserrat, sans-serif" }}>
                {requestMutation.isPending ? "Enviando..." : "Enviar solicitação"}
              </span>
            </button>
          </form>
        )}
      </div>
    </>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "20px 0 12px" }}>
      <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.1)" }} />
      <span style={{
        color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 700,
        fontFamily: "Montserrat, sans-serif", letterSpacing: "0.1em",
        textTransform: "uppercase", whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.1)" }} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", color: "rgba(255,255,255,0.5)", fontSize: 10,
        fontWeight: 700, fontFamily: "Montserrat, sans-serif",
        letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  padding: "11px 13px",
  color: "#fff",
  fontSize: 13,
  fontFamily: "Montserrat, sans-serif",
  outline: "none",
  boxSizing: "border-box",
};
