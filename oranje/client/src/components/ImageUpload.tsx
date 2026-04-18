import { Upload, Loader2, X, Image as ImageIcon, Link as LinkIcon, AlertCircle } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

// ── Constants ──────────────────────────────────────────────────────────────
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// ── Props ──────────────────────────────────────────────────────────────────
interface ImageUploadProps {
  /** Called with the hosted URL when upload completes or URL is entered */
  onUpload: (url: string) => void;
  /** Current image URL (for preview + replace/remove) */
  value?: string;
  /** Disable the component */
  isLoading?: boolean;
  /** Label shown on the upload button */
  label?: string;
  /** Show a manual URL input as fallback */
  showUrlInput?: boolean;
  /** Compact mode — smaller button, no preview */
  compact?: boolean;
}

export function ImageUpload({
  onUpload,
  value,
  isLoading,
  label = "Enviar imagem",
  showUrlInput = true,
  compact = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [urlMode, setUrlMode] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [imgError, setImgError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset imgError whenever value changes
  const handleValueChange = useCallback((url: string) => {
    setImgError(false);
    onUpload(url);
  }, [onUpload]);

  // ── Validate file before upload ──────────────────────────────────────
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Tipo não permitido. Use JPG, PNG ou WebP.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo: ${MAX_SIZE_MB} MB.`;
    }
    return null;
  }, []);

  // ── Upload via multipart POST (preferred — works with large files) ───
  const uploadFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      setUploading(true);
      setProgress(10);
      setImgError(false);

      try {
        const formData = new FormData();
        formData.append("file", file);

        // Determine the API base — honours VITE_API_URL for split deploys
        const apiBase = (import.meta as any).env?.VITE_API_URL || "";

        const xhr = new XMLHttpRequest();
        const url = `${apiBase}/api/upload`;

        // Track progress
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 90) + 5);
          }
        });

        const result = await new Promise<{ success: boolean; url?: string; error?: string }>(
          (resolve, reject) => {
            xhr.onload = () => {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch {
                reject(new Error("Resposta inválida do servidor"));
              }
            };
            xhr.onerror = () => reject(new Error("Falha na conexão"));
            xhr.open("POST", url);
            // Include credentials for cookie-based auth
            xhr.withCredentials = true;
            xhr.send(formData);
          }
        );

        setProgress(100);

        if (result.success && result.url) {
          console.log("[ImageUpload] URL retornada:", result.url);
          // Warn if it's a local/proxy URL (not persistent in production)
          if (result.url.startsWith("/api/uploads/")) {
            console.warn("[ImageUpload] AVISO: URL local retornada — storage externo não configurado.");
            toast.warning("Imagem enviada localmente. Configure o storage externo para persistência.");
          } else {
            toast.success("Imagem enviada com sucesso!");
          }
          handleValueChange(result.url);
        } else {
          toast.error(result.error || "Erro ao enviar imagem");
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        toast.error(err.message || "Erro ao enviar imagem");
      } finally {
        setUploading(false);
        setProgress(0);
        // Reset file input
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [handleValueChange, validateFile]
  );

  // ── Event handlers ───────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemove = () => {
    handleValueChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleManualUrl = () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/.test(trimmed)) {
      toast.error("Insira uma URL válida (ex: https://…)");
      return;
    }
    handleValueChange(trimmed);
    setManualUrl("");
    setUrlMode(false);
    toast.success("URL da imagem aplicada!");
  };

  const busy = uploading || isLoading;

  // ── Compact mode — just a small button ───────────────────────────────
  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {value && !imgError && (
          <img
            src={value}
            alt="preview"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "6px",
              objectFit: "cover",
              border: "1px solid rgba(0,37,26,0.1)",
            }}
            onError={() => setImgError(true)}
          />
        )}
        {value && imgError && (
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "6px",
            background: "rgba(230,81,0,0.08)",
            border: "1px dashed rgba(230,81,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <AlertCircle size={16} style={{ color: "#E65100" }} />
          </div>
        )}
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "8px",
            cursor: busy ? "wait" : "pointer",
            background: "rgba(230,81,0,0.08)",
            border: "1px solid rgba(230,81,0,0.25)",
            color: "#E65100",
            fontSize: "0.8125rem",
            fontWeight: 600,
            fontFamily: "'Montserrat', system-ui, sans-serif",
            opacity: busy ? 0.6 : 1,
            minHeight: "36px",
          }}
        >
          {busy ? (
            <>
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              {progress > 0 ? `${progress}%` : "Enviando…"}
            </>
          ) : (
            <>
              <Upload size={14} />
              {label}
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={busy}
            style={{ display: "none" }}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            title="Remover imagem"
            style={{
              padding: "4px",
              borderRadius: "6px",
              border: "1px solid rgba(0,0,0,0.08)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} style={{ color: "#E53935" }} />
          </button>
        )}
      </div>
    );
  }

  // ── Full mode ────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}
    >
      {/* Preview — imagem carregada com sucesso */}
      {value && !imgError && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={value}
            alt="Preview"
            style={{
              width: "100%",
              maxWidth: "320px",
              height: "auto",
              maxHeight: "180px",
              objectFit: "cover",
              borderRadius: "10px",
              border: "1px solid rgba(0,37,26,0.1)",
              display: "block",
            }}
            onError={() => setImgError(true)}
          />
          <button
            type="button"
            onClick={handleRemove}
            title="Remover imagem"
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Erro ao carregar imagem — mostra URL para debug */}
      {value && imgError && (
        <div style={{
          padding: "12px 14px",
          borderRadius: "10px",
          background: "rgba(230,81,0,0.06)",
          border: "1px solid rgba(230,81,0,0.25)",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertCircle size={15} style={{ color: "#E65100", flexShrink: 0 }} />
            <span style={{ fontSize: "0.8125rem", color: "#E65100", fontWeight: 600 }}>
              Não foi possível carregar a imagem
            </span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#718096", wordBreak: "break-all" }}>
            URL: {value}
          </span>
          <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: "0.75rem",
                color: "#E65100",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Abrir URL
            </a>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                fontSize: "0.75rem",
                color: "#718096",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Remover
            </button>
          </div>
        </div>
      )}

      {/* Drop zone / upload button */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        style={{
          border: `2px dashed ${dragOver ? "#E65100" : "rgba(0,37,26,0.15)"}`,
          borderRadius: "10px",
          padding: "20px",
          textAlign: "center",
          background: dragOver ? "rgba(230,81,0,0.04)" : "#FAFAFA",
          cursor: busy ? "wait" : "pointer",
          transition: "border-color 200ms, background 200ms",
          minHeight: "44px",
        }}
        onClick={() => !busy && inputRef.current?.click()}
      >
        {busy ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <Loader2 size={24} style={{ color: "#E65100", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "0.875rem", color: "#4A5568" }}>
              Enviando… {progress > 0 && `${progress}%`}
            </span>
            {/* Progress bar */}
            {progress > 0 && (
              <div
                style={{
                  width: "100%",
                  maxWidth: "200px",
                  height: "4px",
                  borderRadius: "2px",
                  background: "rgba(0,37,26,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "#E65100",
                    borderRadius: "2px",
                    transition: "width 200ms ease",
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <ImageIcon size={28} style={{ color: "rgba(0,37,26,0.25)" }} />
            <span style={{ fontSize: "0.875rem", color: "#4A5568", fontWeight: 500 }}>
              {value ? "Trocar imagem" : label}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#A0AEC0" }}>
              JPG, PNG ou WebP • Máx. {MAX_SIZE_MB} MB
            </span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={busy}
          style={{ display: "none" }}
        />
      </div>

      {/* URL fallback toggle */}
      {showUrlInput && (
        <div>
          <button
            type="button"
            onClick={() => setUrlMode(!urlMode)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.8125rem",
              color: "#718096",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 0",
            }}
          >
            <LinkIcon size={12} />
            {urlMode ? "Fechar" : "Ou inserir URL manualmente"}
          </button>

          {urlMode && (
            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,37,26,0.1)",
                  fontSize: "0.875rem",
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                  outline: "none",
                  minHeight: "40px",
                }}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleManualUrl())}
              />
              <button
                type="button"
                onClick={handleManualUrl}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#E65100",
                  color: "#fff",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  minHeight: "40px",
                  whiteSpace: "nowrap",
                }}
              >
                Aplicar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
