import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
          const uploadResult = await uploadMutation.mutateAsync({
            file: base64,
            fileName: `driver-${Date.now()}`,
          });
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

    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!formData.whatsapp.trim()) {
      toast.error("WhatsApp é obrigatório");
      return;
    }
    if (!formData.serviceType.trim()) {
      toast.error("Tipo de serviço é obrigatório");
      return;
    }
    if (!formData.region.trim()) {
      toast.error("Região é obrigatória");
      return;
    }

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
    <div className="oranje-app min-h-screen bg-gradient-to-b from-oranje-teal to-oranje-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md" style={{ background: "rgba(15,27,20,0.8)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg transition-all"
            style={{ background: "rgba(216,138,61,0.1)" }}
          >
            <ChevronLeft size={20} style={{ color: "#D88A3D" }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: "#E8E6E3" }}>
            Cadastrar como Motorista
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div
            className="rounded-2xl p-6 border-2 border-dashed"
            style={{ borderColor: "rgba(216,138,61,0.3)", background: "rgba(216,138,61,0.05)" }}
          >
            {photoUrl ? (
              <div className="space-y-3">
                <img src={photoUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                <label htmlFor="photo" className="block">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById("photo")?.click()}
                  >
                    <Upload size={16} className="mr-2" />
                    Trocar Foto
                  </Button>
                </label>
              </div>
            ) : (
              <label htmlFor="photo" className="block cursor-pointer">
                <div className="text-center py-8">
                  <Upload size={32} className="mx-auto mb-2" style={{ color: "#D88A3D" }} />
                  <p className="text-sm font-medium mb-1" style={{ color: "#E8E6E3" }}>
                    Clique para enviar sua foto
                  </p>
                  <p className="text-xs" style={{ color: "#C8C5C0" }}>
                    JPG, PNG até 5MB
                  </p>
                </div>
              </label>
            )}
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isLoading}
              className="hidden"
            />
          </div>

          {/* Required Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#E8E6E3" }}>
                Nome *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Seu nome completo"
                disabled={isLoading}
                style={{ background: "rgba(232,230,227,0.05)", borderColor: "rgba(216,138,61,0.2)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#E8E6E3" }}>
                WhatsApp *
              </label>
              <Input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="(11) 99999-9999"
                disabled={isLoading}
                style={{ background: "rgba(232,230,227,0.05)", borderColor: "rgba(216,138,61,0.2)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#E8E6E3" }}>
                Tipo de Serviço *
              </label>
              <Input
                type="text"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                placeholder="Ex: Táxi, Uber, Motorista Particular"
                disabled={isLoading}
                style={{ background: "rgba(232,230,227,0.05)", borderColor: "rgba(216,138,61,0.2)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#E8E6E3" }}>
                Região *
              </label>
              <Input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="Ex: Holambra, Campinas"
                disabled={isLoading}
                style={{ background: "rgba(232,230,227,0.05)", borderColor: "rgba(216,138,61,0.2)" }}
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium" style={{ color: "#C8C5C0" }}>
              Informações do Veículo (Opcional)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#E8E6E3" }}>
                  Modelo
                </label>
                <Input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  placeholder="Ex: Honda Civic"
                  disabled={isLoading}
                  style={{ background: "rgba(232,230,227,0.05)", borderColor: "rgba(216,138,61,0.2)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#E8E6E3" }}>
                  Cor
                </label>
                <Input
                  type="text"
                  value={formData.vehicleColor}
                  onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                  placeholder="Ex: Preto"
                  disabled={isLoading}
                  style={{ background: "rgba(232,230,227,0.05)", borderColor: "rgba(216,138,61,0.2)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#E8E6E3" }}>
                  Placa
                </label>
                <Input
                  type="text"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                  placeholder="ABC-1234"
                  disabled={isLoading}
                  style={{ background: "rgba(232,230,227,0.05)", borderColor: "rgba(216,138,61,0.2)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#E8E6E3" }}>
                  Capacidade (pessoas)
                </label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="4"
                  disabled={isLoading}
                  style={{ background: "rgba(232,230,227,0.05)", borderColor: "rgba(216,138,61,0.2)" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#E8E6E3" }}>
                Notas Adicionais
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informações extras sobre seus serviços..."
                disabled={isLoading}
                style={{ background: "rgba(232,230,227,0.05)", borderColor: "rgba(216,138,61,0.2)" }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 font-medium"
            style={{ background: "#D88A3D", color: "#0F1B14" }}
          >
            {isLoading ? "Enviando..." : "Enviar Cadastro para Análise"}
          </Button>

          <p className="text-xs text-center" style={{ color: "#C8C5C0" }}>
            Seu cadastro será analisado em até 24 horas. Você receberá uma notificação.
          </p>
        </form>
      </div>
    </div>
  );
}
