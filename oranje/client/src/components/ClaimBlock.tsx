import { useState } from "react";
import { Award, ChevronRight, Store, ShieldCheck } from "lucide-react";
import { ClaimFormSheet } from "./ClaimFormSheet";

type ClaimStatus = "unclaimed" | "claimed" | "selo_oranje";

interface ClaimBlockProps {
  placeId: number;
  placeName: string;
  claimStatus?: ClaimStatus;
}

export function ClaimBlock({ placeId, placeName, claimStatus = "unclaimed" }: ClaimBlockProps) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Lugar já verificado — mostrar selo em vez do formulário
  if (claimStatus === "selo_oranje") {
    return (
      <div
        className="rounded-2xl p-4 mb-6 flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(0,37,26,0.5) 100%)",
          border: "1px solid rgba(5,150,105,0.2)",
        }}
      >
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(5,150,105,0.12)" }}
        >
          <ShieldCheck size={18} style={{ color: "#059669" }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#ffffff", fontFamily: "Montserrat, sans-serif" }}>
            Perfil verificado · Selo Oranje
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
            Este estabelecimento tem presença completa e verificada na plataforma.
          </p>
        </div>
      </div>
    );
  }

  // Lugar já reivindicado (aguardando ou aprovado) — mensagem mais discreta
  if (claimStatus === "claimed") {
    return (
      <div
        className="rounded-2xl p-4 mb-6 flex items-center gap-3"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(230,81,0,0.08)" }}
        >
          <Award size={17} style={{ color: "rgba(230,81,0,0.6)" }} />
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.55 }}>
          Perfil reivindicado — em análise pela equipe Oranje.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        className="rounded-2xl p-5 mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(0,37,26,0.7) 0%, rgba(0,46,31,0.7) 100%)",
          border: "1px solid rgba(230,81,0,0.2)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(230,81,0,0.12)" }}
          >
            <Award size={18} style={{ color: "#E65100" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#ffffff", lineHeight: 1.4 }}>
              Solicitação enviada com sucesso
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              Nossa equipe analisará sua solicitação em breve.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="rounded-2xl p-5 mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(0,37,26,0.6) 0%, rgba(0,46,31,0.6) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
            style={{ background: "rgba(230,81,0,0.1)", border: "1px solid rgba(230,81,0,0.15)" }}
          >
            <Store size={17} style={{ color: "#E65100" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: "#ffffff", fontFamily: "Montserrat, sans-serif", lineHeight: 1.4 }}
            >
              Este negócio é seu?
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>
              Assuma este perfil para corrigir informações, atualizar horários, enviar fotos e apresentar seu negócio da melhor forma para quem visita Holambra.
            </p>
          </div>
        </div>

        <div
          className="rounded-xl p-3 mb-4"
          style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.1)" }}
        >
          <div className="flex items-start gap-2">
            <Award size={14} style={{ color: "rgba(230,81,0,0.7)", flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>
              Negócios com perfil atualizado e completo podem receber o{" "}
              <span style={{ color: "rgba(230,81,0,0.85)", fontWeight: 600 }}>Selo Oranje</span>
              {" "}— um destaque que reforça confiança, presença digital e visibilidade na plataforma.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all active:scale-[0.98]"
          style={{
            background: "rgba(230,81,0,0.12)",
            border: "1px solid rgba(230,81,0,0.22)",
            color: "#E65100",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 600,
            fontSize: "0.8125rem",
            letterSpacing: "0.01em",
          }}
        >
          <span>Quero reivindicar este perfil</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {showForm && (
        <ClaimFormSheet
          placeId={placeId}
          placeName={placeName}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            setSubmitted(true);
          }}
        />
      )}
    </>
  );
}
