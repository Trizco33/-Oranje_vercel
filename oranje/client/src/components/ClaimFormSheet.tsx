import { useState, useRef, useEffect } from "react";
import { X, Upload, Loader2, ChevronDown, Image as ImageIcon, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ClaimFormSheetProps {
  placeId: number;
  placeName: string;
  onClose: () => void;
  onSuccess: () => void;
}

type UploadedFile = { name: string; url: string };

const FIELD_STYLE: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  padding: "12px 14px",
  color: "#ffffff",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  outline: "none",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "rgba(255,255,255,0.5)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 6,
  display: "block",
};

const SECTION_STYLE: React.CSSProperties = {
  borderTop: "1px solid rgba(255,255,255,0.06)",
  paddingTop: 20,
  marginTop: 20,
};

function ImageUploadField({
  label,
  multiple,
  onUploaded,
}: {
  label: string;
  multiple?: boolean;
  onUploaded: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const uploadMutation = trpc.upload.uploadImage.useMutation();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const results: UploadedFile[] = [];
    for (const file of files) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
      const res = await uploadMutation.mutateAsync({
        file: base64,
        fileName: file.name,
        mimeType: file.type,
      });
      if (res.success && res.url) {
        results.push({ name: file.name, url: res.url });
      }
    }
    setUploaded((prev) => [...prev, ...results]);
    onUploaded([...uploaded, ...results].map((r) => r.url));
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px dashed rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.45)",
          fontSize: "0.8125rem",
          cursor: uploading ? "not-allowed" : "pointer",
        }}
      >
        {uploading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Upload size={15} />
        )}
        <span>{uploading ? "Enviando..." : "Selecionar arquivo(s)"}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
      {uploaded.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {uploaded.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{ background: "rgba(230,81,0,0.1)", border: "1px solid rgba(230,81,0,0.18)" }}
            >
              <Check size={11} style={{ color: "#E65100" }} />
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ClaimFormSheet({ placeId, placeName, onClose, onSuccess }: ClaimFormSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    contactRole: "",
    businessName: placeName,
    instagram: "",
    website: "",
    openingHours: "",
    address: "",
    category: "",
    description: "",
    differentials: "",
    message: "",
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  const submitClaim = trpc.claims.submit.useMutation();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.contactName.trim()) { setError("Informe seu nome completo."); return; }
    if (!form.contactEmail.trim()) { setError("Informe seu e-mail."); return; }
    setSubmitting(true);
    try {
      await submitClaim.mutateAsync({
        placeId,
        ...form,
        photos,
        logoUrl: logoUrl ?? undefined,
        coverImageUrl: coverImageUrl ?? undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full outline-none bg-transparent";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={onClose}
        className="absolute inset-0"
        aria-hidden
      />

      <div
        className="relative flex flex-col"
        style={{
          background: "linear-gradient(160deg, #001A12 0%, #00251A 60%, #002E1F 100%)",
          borderRadius: "24px 24px 0 0",
          maxHeight: "94vh",
          transform: mounted ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Handle */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 pb-4 pt-2">
          <div>
            <h2
              className="text-base font-bold"
              style={{ color: "#ffffff", fontFamily: "Montserrat, sans-serif" }}
            >
              Reivindicar Perfil
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              {placeName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <X size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 pb-8" style={{ WebkitOverflowScrolling: "touch" }}>
          <form onSubmit={handleSubmit} noValidate>

            {/* Intro text */}
            <div
              className="rounded-xl p-4 mb-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>
                Preencha os dados abaixo para solicitar a gestão deste perfil. Você poderá enviar informações, horários, fotos e outros detalhes do seu negócio.
              </p>
              <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.75 }}>
                Após análise da equipe, o perfil poderá ser atualizado e se tornar elegível ao{" "}
                <span style={{ color: "rgba(230,81,0,0.75)", fontWeight: 600 }}>Selo Oranje</span>
                {" "}— concedido a estabelecimentos com presença completa, confiável e bem apresentada.
              </p>
            </div>

            {/* ── Seção 1: Responsável ── */}
            <p className="text-xs font-semibold mb-4" style={{ color: "#E65100", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Sobre você
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label style={LABEL_STYLE}>Nome completo *</label>
                <div style={FIELD_STYLE}>
                  <input
                    className={inputClass}
                    style={{ color: "#fff", fontSize: "0.875rem", width: "100%" }}
                    type="text"
                    placeholder="Seu nome completo"
                    value={form.contactName}
                    onChange={set("contactName")}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={LABEL_STYLE}>E-mail *</label>
                <div style={FIELD_STYLE}>
                  <input
                    className={inputClass}
                    style={{ color: "#fff", fontSize: "0.875rem", width: "100%" }}
                    type="email"
                    placeholder="seu@email.com"
                    value={form.contactEmail}
                    onChange={set("contactEmail")}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={LABEL_STYLE}>Telefone / WhatsApp</label>
                <div style={FIELD_STYLE}>
                  <input
                    className={inputClass}
                    style={{ color: "#fff", fontSize: "0.875rem", width: "100%" }}
                    type="tel"
                    placeholder="(19) 99999-9999"
                    value={form.contactPhone}
                    onChange={set("contactPhone")}
                  />
                </div>
              </div>

              <div>
                <label style={LABEL_STYLE}>Cargo ou relação com o negócio</label>
                <div style={FIELD_STYLE}>
                  <input
                    className={inputClass}
                    style={{ color: "#fff", fontSize: "0.875rem", width: "100%" }}
                    type="text"
                    placeholder="Ex: Proprietário, Sócio, Gerente..."
                    value={form.contactRole}
                    onChange={set("contactRole")}
                  />
                </div>
              </div>
            </div>

            {/* ── Seção 2: Negócio ── */}
            <div style={SECTION_STYLE}>
              <p className="text-xs font-semibold mb-4" style={{ color: "#E65100", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Sobre o negócio
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <label style={LABEL_STYLE}>Nome do negócio</label>
                  <div style={FIELD_STYLE}>
                    <input
                      className={inputClass}
                      style={{ color: "#fff", fontSize: "0.875rem", width: "100%" }}
                      type="text"
                      value={form.businessName}
                      onChange={set("businessName")}
                    />
                  </div>
                </div>

                <div>
                  <label style={LABEL_STYLE}>Instagram</label>
                  <div style={FIELD_STYLE}>
                    <input
                      className={inputClass}
                      style={{ color: "#fff", fontSize: "0.875rem", width: "100%" }}
                      type="text"
                      placeholder="@seuperfil"
                      value={form.instagram}
                      onChange={set("instagram")}
                    />
                  </div>
                </div>

                <div>
                  <label style={LABEL_STYLE}>Site</label>
                  <div style={FIELD_STYLE}>
                    <input
                      className={inputClass}
                      style={{ color: "#fff", fontSize: "0.875rem", width: "100%" }}
                      type="url"
                      placeholder="https://..."
                      value={form.website}
                      onChange={set("website")}
                    />
                  </div>
                </div>

                <div>
                  <label style={LABEL_STYLE}>Endereço</label>
                  <div style={FIELD_STYLE}>
                    <input
                      className={inputClass}
                      style={{ color: "#fff", fontSize: "0.875rem", width: "100%" }}
                      type="text"
                      placeholder="Rua, número, bairro"
                      value={form.address}
                      onChange={set("address")}
                    />
                  </div>
                </div>

                <div>
                  <label style={LABEL_STYLE}>Categoria</label>
                  <div style={FIELD_STYLE}>
                    <input
                      className={inputClass}
                      style={{ color: "#fff", fontSize: "0.875rem", width: "100%" }}
                      type="text"
                      placeholder="Ex: Restaurante, Café, Pousada..."
                      value={form.category}
                      onChange={set("category")}
                    />
                  </div>
                </div>

                <div>
                  <label style={LABEL_STYLE}>Horário de funcionamento</label>
                  <div style={{ ...FIELD_STYLE, padding: "10px 14px" }}>
                    <textarea
                      className={inputClass}
                      style={{ color: "#fff", fontSize: "0.875rem", width: "100%", minHeight: 80, resize: "vertical" }}
                      placeholder={"Seg–Sex: 09h–18h\nSáb–Dom: 10h–20h"}
                      value={form.openingHours}
                      onChange={set("openingHours")}
                    />
                  </div>
                </div>

                <div>
                  <label style={LABEL_STYLE}>Descrição do negócio</label>
                  <div style={{ ...FIELD_STYLE, padding: "10px 14px" }}>
                    <textarea
                      className={inputClass}
                      style={{ color: "#fff", fontSize: "0.875rem", width: "100%", minHeight: 100, resize: "vertical" }}
                      placeholder="Conte um pouco sobre o seu negócio..."
                      value={form.description}
                      onChange={set("description")}
                    />
                  </div>
                </div>

                <div>
                  <label style={LABEL_STYLE}>Diferenciais</label>
                  <div style={{ ...FIELD_STYLE, padding: "10px 14px" }}>
                    <textarea
                      className={inputClass}
                      style={{ color: "#fff", fontSize: "0.875rem", width: "100%", minHeight: 80, resize: "vertical" }}
                      placeholder="O que faz seu negócio ser especial?"
                      value={form.differentials}
                      onChange={set("differentials")}
                    />
                  </div>
                </div>

                <div>
                  <label style={LABEL_STYLE}>Mensagem livre</label>
                  <div style={{ ...FIELD_STYLE, padding: "10px 14px" }}>
                    <textarea
                      className={inputClass}
                      style={{ color: "#fff", fontSize: "0.875rem", width: "100%", minHeight: 80, resize: "vertical" }}
                      placeholder="Algo mais que queira compartilhar com a equipe Oranje..."
                      value={form.message}
                      onChange={set("message")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Seção 3: Fotos ── */}
            <div style={SECTION_STYLE}>
              <p className="text-xs font-semibold mb-4" style={{ color: "#E65100", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Imagens
              </p>
              <div className="flex flex-col gap-4">
                <ImageUploadField
                  label="Fotos do negócio (até 10 fotos)"
                  multiple
                  onUploaded={setPhotos}
                />
                <ImageUploadField
                  label="Logo"
                  onUploaded={(urls) => setLogoUrl(urls[0] ?? null)}
                />
                <ImageUploadField
                  label="Imagem de capa"
                  onUploaded={(urls) => setCoverImageUrl(urls[0] ?? null)}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 mt-5"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <div style={{ marginTop: 24, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl transition-all active:scale-[0.98]"
                style={{
                  background: submitting ? "rgba(230,81,0,0.4)" : "#E65100",
                  color: "#ffffff",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  letterSpacing: "0.02em",
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                <span>{submitting ? "Enviando..." : "Enviar solicitação"}</span>
              </button>
              <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                Sua solicitação será analisada pela equipe Oranje antes de qualquer alteração.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
