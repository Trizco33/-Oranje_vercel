import { useRef, useState } from "react";
import { Camera, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface OwnerPhotoUploadProps {
  placeId: number;
  onUploaded?: (url: string) => void;
}

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_MB = 5;

export function OwnerPhotoUpload({ placeId, onUploaded }: OwnerPhotoUploadProps) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const ownershipQuery = trpc.owner.checkOwnership.useQuery(
    { placeId },
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000,
    },
  );

  const uploadMutation = trpc.owner.uploadCoverPhoto.useMutation();

  if (!user || !ownershipQuery.data?.isOwner) return null;

  const handleFile = async (file: File) => {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Tipo não permitido. Use JPG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo: ${MAX_MB} MB.`);
      return;
    }

    setUploading(true);
    setDone(false);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const data = result.split(",")[1];
          if (!data) reject(new Error("Erro ao ler arquivo"));
          else resolve(data);
        };
        reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
        reader.readAsDataURL(file);
      });

      const result = await uploadMutation.mutateAsync({
        placeId,
        file: base64,
        fileName: file.name,
        mimeType: file.type,
      });

      if (result.success) {
        setDone(true);
        toast.success("Foto de capa atualizada!");
        onUploaded?.(result.url);
        setTimeout(() => setDone(false), 3000);
      } else {
        toast.error(result.error ?? "Erro ao enviar imagem.");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao enviar imagem.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "10px 0 4px",
      }}
    >
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          padding: "8px 18px",
          borderRadius: "20px",
          background: done
            ? "rgba(0,37,26,0.08)"
            : "rgba(230,81,0,0.09)",
          border: `1.5px solid ${done ? "rgba(0,37,26,0.2)" : "rgba(230,81,0,0.3)"}`,
          cursor: uploading ? "wait" : "pointer",
          fontFamily: "'Montserrat', system-ui, sans-serif",
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: done ? "#00251A" : "#E65100",
          opacity: uploading ? 0.7 : 1,
          transition: "all 200ms",
          userSelect: "none",
        }}
        title="Atualizar foto de capa do estabelecimento"
      >
        {uploading ? (
          <>
            <Loader2
              size={14}
              style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}
            />
            Enviando foto…
          </>
        ) : done ? (
          <>
            <CheckCircle size={14} style={{ flexShrink: 0 }} />
            Foto atualizada!
          </>
        ) : (
          <>
            <Camera size={14} style={{ flexShrink: 0 }} />
            Atualizar foto de capa
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}
