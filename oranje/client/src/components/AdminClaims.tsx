import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Clock, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Image as ImageIcon, User, Phone, Mail,
  Building2, Instagram, Globe, MapPin, Tag,
  Award, Loader2,
} from "lucide-react";

type ClaimStatus = "pending" | "approved" | "rejected";

type Claim = {
  id: number;
  placeId: number;
  placeName: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  contactRole: string | null;
  businessName: string | null;
  instagram: string | null;
  website: string | null;
  openingHours: string | null;
  address: string | null;
  category: string | null;
  description: string | null;
  differentials: string | null;
  message: string | null;
  photos: string[] | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  status: ClaimStatus;
  adminNote: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
};

const STATUS_CONFIG: Record<ClaimStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending:  { label: "Pendente",  color: "#D97706", bg: "rgba(217,119,6,0.10)",   icon: Clock },
  approved: { label: "Aprovado",  color: "#059669", bg: "rgba(5,150,105,0.10)",   icon: CheckCircle },
  rejected: { label: "Recusado",  color: "#DC2626", bg: "rgba(220,38,38,0.10)",   icon: XCircle },
};

function StatusBadge({ status }: { status: ClaimStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 8,
        background: cfg.bg, color: cfg.color,
        fontSize: 11, fontWeight: 700, fontFamily: "Montserrat, sans-serif",
      }}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function ClaimCard({ claim, onRefresh }: { claim: Claim; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [adminNote, setAdminNote] = useState(claim.adminNote || "");
  const [processing, setProcessing] = useState(false);

  const updateStatus = trpc.claims.updateStatus.useMutation();

  const handleUpdate = async (status: ClaimStatus) => {
    setProcessing(true);
    try {
      await updateStatus.mutateAsync({ id: claim.id, status, adminNote: adminNote || undefined });
      toast.success(status === "approved" ? "Solicitação aprovada!" : status === "rejected" ? "Solicitação recusada." : "Status atualizado.");
      onRefresh();
    } catch {
      toast.error("Erro ao atualizar status.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{
      background: "#fff",
      border: "1px solid rgba(0,37,26,0.10)",
      borderRadius: 14,
      marginBottom: 10,
      overflow: "hidden",
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "14px 16px",
          background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#00251A", fontFamily: "Montserrat, sans-serif" }}>
              {claim.placeName || `Lugar #${claim.placeId}`}
            </span>
            <StatusBadge status={claim.status} />
          </div>
          <p style={{ fontSize: 11, color: "rgba(0,37,26,0.5)", fontFamily: "Montserrat, sans-serif", margin: 0 }}>
            {claim.contactName} · {new Date(claim.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
        {expanded
          ? <ChevronUp size={16} color="rgba(0,37,26,0.35)" style={{ flexShrink: 0 }} />
          : <ChevronDown size={16} color="rgba(0,37,26,0.35)" style={{ flexShrink: 0 }} />
        }
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(0,37,26,0.07)" }}>
          <div style={{ paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Contact info */}
            <div style={{ background: "rgba(0,37,26,0.03)", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#E65100", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px", fontFamily: "Montserrat, sans-serif" }}>
                Responsável
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Row icon={User}  label="Nome"     value={claim.contactName} />
                <Row icon={Mail}  label="E-mail"   value={claim.contactEmail} />
                {claim.contactPhone && <Row icon={Phone} label="Telefone" value={claim.contactPhone} />}
                {claim.contactRole  && <Row icon={Tag}   label="Cargo"    value={claim.contactRole} />}
              </div>
            </div>

            {/* Business info */}
            <div style={{ background: "rgba(0,37,26,0.03)", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#E65100", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px", fontFamily: "Montserrat, sans-serif" }}>
                Negócio
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {claim.businessName && <Row icon={Building2} label="Nome"      value={claim.businessName} />}
                {claim.instagram    && <Row icon={Instagram}  label="Instagram" value={claim.instagram} />}
                {claim.website      && <Row icon={Globe}      label="Site"      value={claim.website} link />}
                {claim.address      && <Row icon={MapPin}     label="Endereço"  value={claim.address} />}
                {claim.category     && <Row icon={Tag}        label="Categoria" value={claim.category} />}
                {claim.openingHours && (
                  <div>
                    <span style={{ fontSize: 10, color: "rgba(0,37,26,0.45)", fontFamily: "Montserrat, sans-serif" }}>Horários</span>
                    <p style={{ fontSize: 12, color: "#00251A", fontFamily: "Montserrat, sans-serif", margin: "2px 0 0", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{claim.openingHours}</p>
                  </div>
                )}
                {claim.description && (
                  <div>
                    <span style={{ fontSize: 10, color: "rgba(0,37,26,0.45)", fontFamily: "Montserrat, sans-serif" }}>Descrição</span>
                    <p style={{ fontSize: 12, color: "#00251A", fontFamily: "Montserrat, sans-serif", margin: "2px 0 0", lineHeight: 1.65 }}>{claim.description}</p>
                  </div>
                )}
                {claim.differentials && (
                  <div>
                    <span style={{ fontSize: 10, color: "rgba(0,37,26,0.45)", fontFamily: "Montserrat, sans-serif" }}>Diferenciais</span>
                    <p style={{ fontSize: 12, color: "#00251A", fontFamily: "Montserrat, sans-serif", margin: "2px 0 0", lineHeight: 1.65 }}>{claim.differentials}</p>
                  </div>
                )}
                {claim.message && (
                  <div>
                    <span style={{ fontSize: 10, color: "rgba(0,37,26,0.45)", fontFamily: "Montserrat, sans-serif" }}>Mensagem</span>
                    <p style={{ fontSize: 12, color: "rgba(0,37,26,0.65)", fontStyle: "italic", fontFamily: "Montserrat, sans-serif", margin: "2px 0 0", lineHeight: 1.65 }}>"{claim.message}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Media */}
            {(claim.logoUrl || claim.coverImageUrl || (claim.photos && claim.photos.length > 0)) && (
              <div style={{ background: "rgba(0,37,26,0.03)", borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#E65100", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px", fontFamily: "Montserrat, sans-serif" }}>
                  Imagens
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {claim.logoUrl && (
                    <a href={claim.logoUrl} target="_blank" rel="noopener noreferrer">
                      <img src={claim.logoUrl} alt="Logo" style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", border: "1px solid rgba(0,37,26,0.12)" }} />
                    </a>
                  )}
                  {claim.coverImageUrl && (
                    <a href={claim.coverImageUrl} target="_blank" rel="noopener noreferrer">
                      <img src={claim.coverImageUrl} alt="Capa" style={{ width: 90, height: 60, borderRadius: 10, objectFit: "cover", border: "1px solid rgba(0,37,26,0.12)" }} />
                    </a>
                  )}
                  {claim.photos?.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Foto ${i + 1}`} style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", border: "1px solid rgba(0,37,26,0.12)" }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Admin note */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(0,37,26,0.45)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, fontFamily: "Montserrat, sans-serif" }}>
                Nota interna (opcional)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10, outline: "none",
                  background: "#fff", border: "1px solid rgba(0,37,26,0.15)",
                  color: "#00251A", fontSize: 12, minHeight: 72,
                  resize: "vertical", fontFamily: "Montserrat, sans-serif",
                  boxSizing: "border-box",
                }}
                placeholder="Anotação interna para esta solicitação..."
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleUpdate("approved")}
                disabled={processing || claim.status === "approved"}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "10px 0", borderRadius: 10, fontSize: 12, fontWeight: 700,
                  fontFamily: "Montserrat, sans-serif", cursor: processing || claim.status === "approved" ? "not-allowed" : "pointer",
                  background: claim.status === "approved" ? "rgba(5,150,105,0.15)" : "rgba(5,150,105,0.10)",
                  border: "1px solid rgba(5,150,105,0.30)", color: "#059669",
                  opacity: claim.status === "approved" ? 0.6 : 1,
                }}
              >
                {processing ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={13} />}
                Aprovar
              </button>
              <button
                onClick={() => handleUpdate("rejected")}
                disabled={processing || claim.status === "rejected"}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "10px 0", borderRadius: 10, fontSize: 12, fontWeight: 700,
                  fontFamily: "Montserrat, sans-serif", cursor: processing || claim.status === "rejected" ? "not-allowed" : "pointer",
                  background: claim.status === "rejected" ? "rgba(220,38,38,0.15)" : "rgba(220,38,38,0.08)",
                  border: "1px solid rgba(220,38,38,0.25)", color: "#DC2626",
                  opacity: claim.status === "rejected" ? 0.6 : 1,
                }}
              >
                {processing ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <XCircle size={13} />}
                Recusar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ icon: Icon, label, value, link }: { icon: any; label: string; value: string; link?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <Icon size={13} color="rgba(0,37,26,0.35)" style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ minWidth: 0 }}>
        <span style={{ fontSize: 11, color: "rgba(0,37,26,0.45)", fontFamily: "Montserrat, sans-serif" }}>{label}: </span>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: "#E65100", textDecoration: "underline", fontFamily: "Montserrat, sans-serif" }}>
            {value}
          </a>
        ) : (
          <span style={{ fontSize: 11, color: "#00251A", fontFamily: "Montserrat, sans-serif" }}>{value}</span>
        )}
      </div>
    </div>
  );
}

export function AdminClaims() {
  const [filter, setFilter] = useState<ClaimStatus | "all">("pending");

  const { data: claims, isLoading, refetch } = trpc.claims.list.useQuery(
    filter === "all" ? {} : { status: filter }
  );

  const { data: allClaims } = trpc.claims.list.useQuery({});

  const allCounts = {
    all:      allClaims?.length ?? 0,
    pending:  allClaims?.filter((c) => c.status === "pending").length  ?? 0,
    approved: allClaims?.filter((c) => c.status === "approved").length ?? 0,
    rejected: allClaims?.filter((c) => c.status === "rejected").length ?? 0,
  };

  const FILTERS: { id: ClaimStatus | "all"; label: string; activeColor: string }[] = [
    { id: "all",      label: `Todas (${allCounts.all})`,           activeColor: "#00251A" },
    { id: "pending",  label: `Pendentes (${allCounts.pending})`,   activeColor: "#D97706" },
    { id: "approved", label: `Aprovadas (${allCounts.approved})`,  activeColor: "#059669" },
    { id: "rejected", label: `Recusadas (${allCounts.rejected})`,  activeColor: "#DC2626" },
  ];

  return (
    <div style={{ fontFamily: "Montserrat, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: "rgba(230,81,0,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Award size={18} color="#E65100" />
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#00251A", fontFamily: "Montserrat, sans-serif", margin: "0 0 2px" }}>
            Reivindicações de Perfil
          </h2>
          <p style={{ fontSize: 11, color: "rgba(0,37,26,0.45)", fontFamily: "Montserrat, sans-serif", margin: 0 }}>
            Solicitações de proprietários para gerir seus perfis
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: "6px 14px", borderRadius: 8, border: "1px solid",
                fontSize: 11, fontWeight: 700, fontFamily: "Montserrat, sans-serif",
                cursor: "pointer",
                background:   active ? `${f.activeColor}14` : "rgba(0,37,26,0.04)",
                borderColor:  active ? `${f.activeColor}44` : "rgba(0,37,26,0.12)",
                color:        active ? f.activeColor         : "rgba(0,37,26,0.55)",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <Loader2 size={20} color="#E65100" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : !claims || claims.length === 0 ? (
        <div style={{
          borderRadius: 14, padding: "40px 24px", textAlign: "center",
          background: "rgba(0,37,26,0.02)", border: "1px dashed rgba(0,37,26,0.12)",
        }}>
          <Award size={28} color="rgba(0,37,26,0.18)" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "rgba(0,37,26,0.4)", fontFamily: "Montserrat, sans-serif", fontWeight: 600, margin: 0 }}>
            {filter === "pending" ? "Nenhuma solicitação pendente." : "Nenhuma solicitação nesta categoria."}
          </p>
        </div>
      ) : (
        <div>
          {claims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim as Claim}
              onRefresh={() => refetch()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
