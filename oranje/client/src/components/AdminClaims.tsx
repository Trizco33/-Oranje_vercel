import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Clock, CheckCircle, XCircle, ChevronDown, ChevronUp,
  ExternalLink, Image as ImageIcon, User, Phone, Mail,
  Building2, Instagram, Globe, MapPin, Tag, FileText,
  Award, Filter, Loader2,
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
  pending:  { label: "Pendente",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  icon: Clock },
  approved: { label: "Aprovado",  color: "#10B981", bg: "rgba(16,185,129,0.1)",  icon: CheckCircle },
  rejected: { label: "Recusado",  color: "#EF4444", bg: "rgba(239,68,68,0.1)",   icon: XCircle },
};

function StatusBadge({ status }: { status: ClaimStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={12} />
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
    <div
      className="rounded-2xl mb-3 overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: "#fff" }}>
              {claim.placeName || `Lugar #${claim.placeId}`}
            </span>
            <StatusBadge status={claim.status} />
          </div>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {claim.contactName} · {new Date(claim.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
        {expanded ? (
          <ChevronUp size={16} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="pt-4 grid gap-3">

            {/* Contact info */}
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "#E65100", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Responsável
              </p>
              <div className="flex flex-col gap-1.5">
                <Row icon={User} label="Nome" value={claim.contactName} />
                <Row icon={Mail} label="E-mail" value={claim.contactEmail} />
                {claim.contactPhone && <Row icon={Phone} label="Telefone" value={claim.contactPhone} />}
                {claim.contactRole && <Row icon={Tag} label="Cargo" value={claim.contactRole} />}
              </div>
            </div>

            {/* Business info */}
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "#E65100", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Negócio
              </p>
              <div className="flex flex-col gap-1.5">
                {claim.businessName && <Row icon={Building2} label="Nome" value={claim.businessName} />}
                {claim.instagram && <Row icon={Instagram} label="Instagram" value={claim.instagram} />}
                {claim.website && <Row icon={Globe} label="Site" value={claim.website} link />}
                {claim.address && <Row icon={MapPin} label="Endereço" value={claim.address} />}
                {claim.category && <Row icon={Tag} label="Categoria" value={claim.category} />}
                {claim.openingHours && (
                  <div>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Horários</span>
                    <p className="text-xs mt-0.5 whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.65)" }}>{claim.openingHours}</p>
                  </div>
                )}
                {claim.description && (
                  <div>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Descrição</span>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{claim.description}</p>
                  </div>
                )}
                {claim.differentials && (
                  <div>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Diferenciais</span>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{claim.differentials}</p>
                  </div>
                )}
                {claim.message && (
                  <div>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Mensagem</span>
                    <p className="text-xs mt-0.5 italic" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>"{claim.message}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Media */}
            {(claim.logoUrl || claim.coverImageUrl || (claim.photos && claim.photos.length > 0)) && (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#E65100", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Imagens
                </p>
                <div className="flex flex-wrap gap-2">
                  {claim.logoUrl && (
                    <a href={claim.logoUrl} target="_blank" rel="noopener noreferrer">
                      <img src={claim.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                    </a>
                  )}
                  {claim.coverImageUrl && (
                    <a href={claim.coverImageUrl} target="_blank" rel="noopener noreferrer">
                      <img src={claim.coverImageUrl} alt="Capa" className="w-24 h-16 rounded-xl object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                    </a>
                  )}
                  {claim.photos?.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Foto ${i + 1}`} className="w-16 h-16 rounded-xl object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Admin review */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                Nota interna (opcional)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full rounded-xl p-3 outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "#fff",
                  fontSize: "0.8125rem",
                  minHeight: 72,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                placeholder="Anotação interna para esta solicitação..."
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdate("approved")}
                disabled={processing || claim.status === "approved"}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: claim.status === "approved" ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#10B981",
                  cursor: processing || claim.status === "approved" ? "not-allowed" : "pointer",
                  opacity: claim.status === "approved" ? 0.6 : 1,
                }}
              >
                {processing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Aprovar
              </button>
              <button
                onClick={() => handleUpdate("rejected")}
                disabled={processing || claim.status === "rejected"}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: claim.status === "rejected" ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#EF4444",
                  cursor: processing || claim.status === "rejected" ? "not-allowed" : "pointer",
                  opacity: claim.status === "rejected" ? 0.6 : 1,
                }}
              >
                {processing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
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
    <div className="flex items-start gap-2">
      <Icon size={13} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0, marginTop: 2 }} />
      <div className="min-w-0">
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{label}: </span>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: "#E65100" }}>
            {value}
          </a>
        ) : (
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{value}</span>
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

  const counts = {
    all: claims?.length ?? 0,
    pending: claims?.filter((c) => c.status === "pending").length ?? 0,
    approved: claims?.filter((c) => c.status === "approved").length ?? 0,
    rejected: claims?.filter((c) => c.status === "rejected").length ?? 0,
  };

  const { data: allClaims } = trpc.claims.list.useQuery({});

  const allCounts = {
    all: allClaims?.length ?? 0,
    pending: allClaims?.filter((c) => c.status === "pending").length ?? 0,
    approved: allClaims?.filter((c) => c.status === "approved").length ?? 0,
    rejected: allClaims?.filter((c) => c.status === "rejected").length ?? 0,
  };

  const FILTERS: { id: ClaimStatus | "all"; label: string; color?: string }[] = [
    { id: "all", label: `Todas (${allCounts.all})` },
    { id: "pending", label: `Pendentes (${allCounts.pending})`, color: "#F59E0B" },
    { id: "approved", label: `Aprovadas (${allCounts.approved})`, color: "#10B981" },
    { id: "rejected", label: `Recusadas (${allCounts.rejected})`, color: "#EF4444" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(230,81,0,0.12)" }}
        >
          <Award size={18} style={{ color: "#E65100" }} />
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: "#fff", fontFamily: "Montserrat, sans-serif" }}>
            Reivindicações de Perfil
          </h2>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Solicitações de proprietários para gerir seus perfis
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: filter === f.id ? "rgba(230,81,0,0.15)" : "rgba(255,255,255,0.04)",
              border: filter === f.id ? "1px solid rgba(230,81,0,0.3)" : "1px solid rgba(255,255,255,0.08)",
              color: filter === f.id ? "#E65100" : f.color || "rgba(255,255,255,0.45)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin" style={{ color: "#E65100" }} />
        </div>
      ) : !claims || claims.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Award size={28} style={{ color: "rgba(255,255,255,0.15)", margin: "0 auto 12px" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
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
