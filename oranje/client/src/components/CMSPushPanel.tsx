import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Bell, Send, Users } from "lucide-react";

export default function CMSPushPanel() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/app");

  const { data: countData, isLoading: countLoading, error: countError } = trpc.push.subscriberCount.useQuery(
    undefined, { retry: 1, retryDelay: 2000 }
  );
  const sendMutation = trpc.push.sendAll.useMutation({
    onSuccess: (result) => {
      toast.success(`Enviado para ${result.sent} dispositivos${result.staleRemoved > 0 ? ` (${result.staleRemoved} inválidos removidos)` : ""}`);
      setTitle("");
      setBody("");
      setUrl("/app");
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const handleSend = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Preencha título e mensagem");
      return;
    }
    sendMutation.mutate({ title: title.trim(), body: body.trim(), url: url.trim() || "/app" });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(0,37,26,0.2)",
    background: "#fff",
    color: "#00251A",
    fontSize: "0.875rem",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: "#00251A",
    marginBottom: "6px",
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 560 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
        <div style={{ width: 40, height: 40, borderRadius: "10px", background: "rgba(230,81,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bell size={20} style={{ color: "#E65100" }} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#00251A", margin: 0 }}>Notificações Push</h2>
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.55)", margin: 0 }}>Envie uma mensagem para todos os inscritos</p>
        </div>
      </div>

      {/* Subscriber count */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "12px 16px", borderRadius: "12px",
        background: "rgba(0,37,26,0.05)", border: "1px solid rgba(0,37,26,0.12)",
        marginBottom: "1.5rem",
      }}>
        <Users size={16} style={{ color: "rgba(0,37,26,0.45)" }} />
        <span style={{ fontSize: "0.875rem", color: "rgba(0,37,26,0.7)" }}>
          {countLoading
            ? "Carregando..."
            : countError || countData === undefined
              ? <span style={{ color: "rgba(0,37,26,0.4)" }}>—</span>
              : <><strong style={{ color: "#00251A" }}>{countData.count}</strong> dispositivo{countData.count !== 1 ? "s" : ""} inscrito{countData.count !== 1 ? "s" : ""}</>
          }
        </span>
      </div>

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Título *</label>
          <input
            style={inputStyle}
            placeholder="ex: Expoflora 2026 chegando!"
            value={title}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p style={{ fontSize: "0.75rem", color: "rgba(0,37,26,0.4)", marginTop: "4px" }}>{title.length}/100</p>
        </div>

        <div>
          <label style={labelStyle}>Mensagem *</label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: "90px" }}
            placeholder="ex: Garanta seu ingresso antecipado para a maior expo de flores do Brasil!"
            value={body}
            maxLength={300}
            onChange={(e) => setBody(e.target.value)}
          />
          <p style={{ fontSize: "0.75rem", color: "rgba(0,37,26,0.4)", marginTop: "4px" }}>{body.length}/300</p>
        </div>

        <div>
          <label style={labelStyle}>Link ao clicar (URL interna)</label>
          <input
            style={inputStyle}
            placeholder="/app/eventos"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={sendMutation.isPending || !title.trim() || !body.trim()}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            padding: "12px 24px", borderRadius: "10px",
            background: "#E65100",
            color: "#fff", fontWeight: 700, fontSize: "0.9375rem",
            border: "none", cursor: sendMutation.isPending ? "not-allowed" : "pointer",
            transition: "opacity 0.2s",
            opacity: (sendMutation.isPending || !title.trim() || !body.trim()) ? 0.5 : 1,
          }}
        >
          <Send size={16} />
          {sendMutation.isPending ? "Enviando..." : "Enviar para todos"}
        </button>
      </div>
    </div>
  );
}
