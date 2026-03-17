import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronLeft, Upload } from "lucide-react";
import { OranjeHeader } from "@/components/OranjeHeader";
import { DSButton, DSInput } from "@/components/ds";

export default function RegisterDriver() {
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    serviceType: "",
    region: "",
    vehicleModel: "",
    vehicleColor: "",
    plate: "",
    capacity: "",
    notes: "",
  });

  const createMutation = trpc.drivers.createPublic.useMutation();
  const uploadMutation = trpc.upload.uploadImage.useMutation();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        try {
          const uploadResult = await uploadMutation.mutateAsync({ file: base64, fileName: `driver-${Date.now()}` });
          if (uploadResult.success && uploadResult.url) {
            setPhotoUrl(uploadResult.url);
            toast.success("Foto carregada com sucesso");
          } else {
            toast.error(uploadResult.error || "Erro ao fazer upload");
          }
        } catch (err) {
          console.error("Upload error:", err);
          toast.error("Erro ao fazer upload da foto");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erro ao ler arquivo:", error);
      toast.error("Erro ao ler arquivo");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error("Nome é obrigatório"); return; }
    if (!formData.whatsapp.trim()) { toast.error("WhatsApp é obrigatório"); return; }
    if (!formData.serviceType.trim()) { toast.error("Tipo de serviço é obrigatório"); return; }
    if (!formData.region.trim()) { toast.error("Região é obrigatória"); return; }

    try {
      setIsLoading(true);
      await createMutation.mutateAsync({
        name: formData.name,
        whatsapp: formData.whatsapp,
        serviceType: formData.serviceType,
        region: formData.region,
        vehicleModel: formData.vehicleModel || undefined,
        vehicleColor: formData.vehicleColor || undefined,
        plate: formData.plate || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        photoUrl: photoUrl || undefined,
        notes: formData.notes || undefined,
      });
      toast.success("Cadastro enviado para análise. Você será notificado em breve.");
      setTimeout(() => navigate("/app/transporte"), 2000);
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      const errorMsg = error instanceof Error ? error.message : "Erro ao cadastrar motorista";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader showBack title="Cadastrar como Motorista" />

      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="rounded-2xl p-6 border-2 border-dashed" style={{ borderColor: "rgba(230,81,0,0.3)", background: "rgba(230,81,0,0.05)" }}>
            {photoUrl ? (
              <div className="space-y-3">
                <img src={photoUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                <DSButton variant="secondary" type="button" onClick={() => document.getElementById("photo")?.click()} style={{ width: "100%" }}>
                  <Upload size={16} className="mr-2" /> Trocar Foto
                </DSButton>
              </div>
            ) : (
              <label htmlFor="photo" className="block cursor-pointer">
                <div className="text-center py-8">
                  <Upload size={32} className="mx-auto mb-2" style={{ color: "var(--ds-color-accent)" }} />
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--ds-color-text-primary)" }}>Clique para enviar sua foto</p>
                  <p className="text-xs" style={{ color: "var(--ds-color-text-secondary)" }}>JPG, PNG até 5MB</p>
                </div>
              </label>
            )}
            <input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} disabled={isLoading} className="hidden" />
          </div>

          {/* Required Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Nome *</label>
              <DSInput type="text" value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} placeholder="Seu nome completo" disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--ds-color-text-primary)" }}>WhatsApp *</label>
              <DSInput type="tel" value={formData.whatsapp} onChange={(e: any) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="(11) 99999-9999" disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Tipo de Serviço *</label>
              <DSInput type="text" value={formData.serviceType} onChange={(e: any) => setFormData({ ...formData, serviceType: e.target.value })} placeholder="Ex: Táxi, Uber, Motorista Particular" disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Região *</label>
              <DSInput type="text" value={formData.region} onChange={(e: any) => setFormData({ ...formData, region: e.target.value })} placeholder="Ex: Holambra, Campinas" disabled={isLoading} />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium" style={{ color: "var(--ds-color-text-secondary)" }}>Informações do Veículo (Opcional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Modelo</label>
                <DSInput type="text" value={formData.vehicleModel} onChange={(e: any) => setFormData({ ...formData, vehicleModel: e.target.value })} placeholder="Ex: Honda Civic" disabled={isLoading} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Cor</label>
                <DSInput type="text" value={formData.vehicleColor} onChange={(e: any) => setFormData({ ...formData, vehicleColor: e.target.value })} placeholder="Ex: Preto" disabled={isLoading} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Placa</label>
                <DSInput type="text" value={formData.plate} onChange={(e: any) => setFormData({ ...formData, plate: e.target.value })} placeholder="ABC-1234" disabled={isLoading} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Capacidade (pessoas)</label>
                <DSInput type="number" value={formData.capacity} onChange={(e: any) => setFormData({ ...formData, capacity: e.target.value })} placeholder="4" disabled={isLoading} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Notas Adicionais</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informações extras sobre seus serviços..."
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-xl text-sm min-h-20 resize-none"
                style={{ background: "rgba(230,81,0,0.08)", border: "1px solid rgba(230,81,0,0.2)", color: "var(--ds-color-text-primary)" }}
              />
            </div>
          </div>

          <DSButton variant="primary" type="submit" disabled={isLoading} style={{ width: "100%" }}>
            {isLoading ? "Enviando..." : "Enviar Cadastro para Análise"}
          </DSButton>

          <p className="text-xs text-center" style={{ color: "var(--ds-color-text-secondary)" }}>
            Seu cadastro será analisado em até 24 horas. Você receberá uma notificação.
          </p>
        </form>
      </div>
    </div>
  );
}
