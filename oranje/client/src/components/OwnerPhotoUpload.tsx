import { useRef, useState } from "react";
import {
  Camera, Image, Trash2, Plus, Loader2, CheckCircle,
  ChevronDown, ChevronUp, Save, X,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

// ── constants ──────────────────────────────────────────────────────────────
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_MB = 5;
const MAX_GALLERY = 10;

// ── types ──────────────────────────────────────────────────────────────────
interface OwnerPhotoUploadProps {
  placeId: number;
  onUploaded?: (url: string) => void;
}

type GalleryPhoto = { id: number; url: string; isOwner?: boolean };

// ── helpers ────────────────────────────────────────────────────────────────
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const data = res.split(",")[1];
      if (!data) reject(new Error("Erro ao ler arquivo"));
      else resolve(data);
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

function validateFile(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return "Tipo não permitido. Use JPG, PNG ou WebP.";
  if (file.size > MAX_MB * 1024 * 1024) return `Arquivo muito grande. Máximo: ${MAX_MB} MB.`;
  return null;
}

// ── sub-component: upload button ───────────────────────────────────────────
function UploadBtn({
  onFile,
  loading,
  label,
  icon: Icon,
  disabled,
}: {
  onFile: (f: File) => void;
  loading: boolean;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        borderRadius: 20,
        background: "rgba(230,81,0,0.09)",
        border: "1.5px solid rgba(230,81,0,0.28)",
        color: "#E65100",
        fontSize: "0.8125rem",
        fontWeight: 600,
        fontFamily: "'Montserrat', system-ui, sans-serif",
        cursor: loading || disabled ? "not-allowed" : "pointer",
        opacity: loading || disabled ? 0.55 : 1,
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {loading ? (
        <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
      ) : (
        <Icon size={13} />
      )}
      {loading ? "Enviando…" : label}
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        disabled={loading || disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const err = validateFile(file);
          if (err) { toast.error(err); return; }
          onFile(file);
          if (ref.current) ref.current.value = "";
        }}
        style={{ display: "none" }}
      />
    </label>
  );
}

// ── main component ─────────────────────────────────────────────────────────
export function OwnerPhotoUpload({ placeId, onUploaded }: OwnerPhotoUploadProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"photos" | "info">("photos");

  // mutations
  const [coverLoading, setCoverLoading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoForm, setInfoForm] = useState<Record<string, string> | null>(null);

  const utils = trpc.useContext();

  const ownerQ = trpc.owner.checkOwnership.useQuery(
    { placeId },
    { enabled: !!user, staleTime: 5 * 60_000 },
  );

  const placeQ = trpc.places.byId.useQuery(
    { id: placeId },
    { enabled: !!user && !!ownerQ.data?.isOwner, staleTime: 30_000 },
  );

  const uploadCoverMut = trpc.owner.uploadCoverPhoto.useMutation();
  const uploadGalleryMut = trpc.owner.uploadGalleryPhoto.useMutation();
  const deletePhotoMut = trpc.owner.deleteGalleryPhoto.useMutation();
  const updateInfoMut = trpc.owner.updatePlaceInfo.useMutation();

  // Not an owner — render nothing
  if (!user || !ownerQ.data?.isOwner) return null;

  const place = placeQ.data as any;
  const coverUrl: string = place?.coverImage ?? "";
  const galleryPhotos: GalleryPhoto[] = Array.isArray(place?.photos) ? place.photos : [];
  const galleryCount = galleryPhotos.length;

  // initialize info form from place data
  const info: Record<string, string> = infoForm ?? {
    openingHours: place?.openingHours ?? "",
    phone: place?.phone ?? "",
    whatsapp: place?.whatsapp ?? "",
    instagram: place?.instagram ?? "",
    website: place?.website ?? "",
    shortDesc: place?.shortDesc ?? "",
  };

  // ── handlers ──────────────────────────────────────────────────────────────
  async function handleCover(file: File) {
    setCoverLoading(true);
    try {
      const base64 = await toBase64(file);
      const res = await uploadCoverMut.mutateAsync({ placeId, file: base64, fileName: file.name, mimeType: file.type });
      if (res.success) {
        toast.success("Foto de capa atualizada!");
        onUploaded?.(res.url);
        utils.places.byId.invalidate({ id: placeId });
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao enviar foto.");
    } finally {
      setCoverLoading(false);
    }
  }

  async function handleGallery(file: File) {
    setGalleryLoading(true);
    try {
      const base64 = await toBase64(file);
      const res = await uploadGalleryMut.mutateAsync({ placeId, file: base64, fileName: file.name, mimeType: file.type });
      if (res.success) {
        toast.success("Foto adicionada à galeria!");
        utils.places.byId.invalidate({ id: placeId });
      } else {
        toast.error(res.error ?? "Erro ao enviar foto.");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao enviar foto.");
    } finally {
      setGalleryLoading(false);
    }
  }

  async function handleDelete(photoId: number) {
    setDeletingId(photoId);
    try {
      await deletePhotoMut.mutateAsync({ photoId, placeId });
      toast.success("Foto removida.");
      utils.places.byId.invalidate({ id: placeId });
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao remover foto.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSaveInfo() {
    setInfoSaving(true);
    try {
      await updateInfoMut.mutateAsync({
        placeId,
        openingHours: info.openingHours || undefined,
        phone: info.phone || undefined,
        whatsapp: info.whatsapp || undefined,
        instagram: info.instagram || undefined,
        website: info.website || undefined,
        shortDesc: info.shortDesc || undefined,
      });
      toast.success("Informações atualizadas!");
      utils.places.byId.invalidate({ id: placeId });
      setInfoForm(null);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar informações.");
    } finally {
      setInfoSaving(false);
    }
  }

  // ── styles ─────────────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: "rgba(0,37,26,0.55)",
    border: "1px solid rgba(230,81,0,0.18)",
    borderRadius: 16,
    padding: "14px 16px",
    marginTop: 8,
    fontFamily: "'Montserrat', system-ui, sans-serif",
  };

  const label: React.CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(230,81,0,0.18)",
    background: "rgba(0,37,26,0.5)",
    color: "var(--ds-color-text-primary, #fff)",
    fontSize: "0.875rem",
    fontFamily: "'Montserrat', system-ui, sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "7px 0",
    borderRadius: 10,
    border: "none",
    background: active ? "rgba(230,81,0,0.15)" : "transparent",
    color: active ? "#E65100" : "rgba(255,255,255,0.4)",
    fontFamily: "'Montserrat', system-ui, sans-serif",
    fontSize: "0.8125rem",
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
    transition: "all 150ms",
  });

  return (
    <div style={{ padding: "6px 0 10px" }}>
      {/* Toggle button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 18px",
            borderRadius: 20,
            background: "rgba(230,81,0,0.09)",
            border: "1.5px solid rgba(230,81,0,0.28)",
            color: "#E65100",
            fontSize: "0.8125rem",
            fontWeight: 600,
            fontFamily: "'Montserrat', system-ui, sans-serif",
            cursor: "pointer",
          }}
        >
          <Camera size={13} />
          Gerenciar meu estabelecimento
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Expandable panel */}
      {open && (
        <div style={card}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, background: "rgba(0,37,26,0.4)", borderRadius: 12, padding: 3, marginBottom: 14 }}>
            <button type="button" style={tabBtn(tab === "photos")} onClick={() => setTab("photos")}>
              📷 Fotos
            </button>
            <button type="button" style={tabBtn(tab === "info")} onClick={() => setTab("info")}>
              📝 Informações
            </button>
          </div>

          {/* ── Photos tab ─────────────────────────────────────────────────── */}
          {tab === "photos" && (
            <div>
              {/* Cover photo */}
              <p style={label}>Foto de capa</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Capa atual"
                    style={{ width: 72, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(230,81,0,0.2)", flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 72, height: 48, borderRadius: 8, background: "rgba(230,81,0,0.07)", border: "1px dashed rgba(230,81,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Image size={18} style={{ color: "rgba(230,81,0,0.3)" }} />
                  </div>
                )}
                <UploadBtn onFile={handleCover} loading={coverLoading} label="Trocar capa" icon={Camera} />
              </div>

              {/* Gallery */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ ...label, margin: 0 }}>
                  Galeria ({galleryCount}/{MAX_GALLERY})
                </p>
                {galleryCount < MAX_GALLERY && (
                  <UploadBtn onFile={handleGallery} loading={galleryLoading} label="Adicionar foto" icon={Plus} />
                )}
              </div>

              {galleryCount === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.8125rem" }}>
                  Nenhuma foto na galeria ainda
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8 }}>
                  {galleryPhotos.map((photo) => (
                    <div key={photo.id} style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(230,81,0,0.15)" }}>
                      <img
                        src={photo.url}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDelete(photo.id)}
                        disabled={deletingId === photo.id}
                        style={{
                          position: "absolute",
                          top: 3,
                          right: 3,
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.65)",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: deletingId === photo.id ? "wait" : "pointer",
                        }}
                        title="Remover foto"
                      >
                        {deletingId === photo.id
                          ? <Loader2 size={11} style={{ color: "#fff", animation: "spin 1s linear infinite" }} />
                          : <X size={11} style={{ color: "#fff" }} />
                        }
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {galleryCount >= MAX_GALLERY && (
                <p style={{ fontSize: "0.75rem", color: "rgba(230,81,0,0.7)", marginTop: 8, textAlign: "center" }}>
                  Limite de {MAX_GALLERY} fotos atingido
                </p>
              )}
            </div>
          )}

          {/* ── Info tab ──────────────────────────────────────────────────── */}
          {tab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { key: "shortDesc", label: "Descrição curta", multiline: true },
                { key: "openingHours", label: "Horário de funcionamento", multiline: true },
                { key: "phone", label: "Telefone" },
                { key: "whatsapp", label: "WhatsApp (somente números)" },
                { key: "instagram", label: "Instagram (sem @)" },
                { key: "website", label: "Website (https://...)" },
              ].map(({ key, label: lbl, multiline }) => (
                <div key={key}>
                  <p style={label}>{lbl}</p>
                  {multiline ? (
                    <textarea
                      value={info[key]}
                      onChange={(e) => setInfoForm({ ...info, [key]: e.target.value })}
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={info[key]}
                      onChange={(e) => setInfoForm({ ...info, [key]: e.target.value })}
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleSaveInfo}
                disabled={infoSaving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "10px 0",
                  borderRadius: 12,
                  border: "none",
                  background: infoSaving ? "rgba(230,81,0,0.4)" : "#E65100",
                  color: "#fff",
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  cursor: infoSaving ? "wait" : "pointer",
                  marginTop: 4,
                }}
              >
                {infoSaving
                  ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Salvando…</>
                  : <><Save size={15} /> Salvar informações</>
                }
              </button>

              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: -4 }}>
                Endereço, coordenadas e categoria são gerenciados pela equipe Oranje.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
