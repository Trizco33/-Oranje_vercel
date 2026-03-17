import { Upload, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  isLoading?: boolean;
  label?: string;
}

export function ImageUpload({ onUpload, isLoading, label = "Upload" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const uploadMutation = trpc.upload.uploadImage.useMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(",")[1];
        
        try {
          const result = await uploadMutation.mutateAsync({
            file: base64Data,
            fileName: file.name,
            mimeType: file.type,
          });
          
          if (result.success && result.url) {
            onUpload(result.url);
            toast.success("Imagem enviada com sucesso");
          } else {
            toast.error(result.error || "Erro ao fazer upload");
          }
        } catch (error) {
          toast.error("Erro ao fazer upload");
          console.error(error);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erro ao processar arquivo");
      setUploading(false);
    }
  };

  return (
    <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all disabled:opacity-50"
      style={{
        background: "rgba(216,138,61,0.1)",
        border: "1px solid rgba(216,138,61,0.3)",
        color: "#D88A3D",
      }}>
      {uploading || isLoading || uploadMutation.isPending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Enviando...
        </>
      ) : (
        <>
          <Upload size={14} />
          {label}
        </>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading || isLoading || uploadMutation.isPending}
        className="hidden"
      />
    </label>
  );
}
