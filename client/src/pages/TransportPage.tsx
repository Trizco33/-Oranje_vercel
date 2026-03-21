import { useState } from "react";
import { useDriversList } from "@/hooks/useMockData";
import { trpc } from "@/lib/trpc";
import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { DSButton, DSInput, DSBadge } from "@/components/ds";
import { AlertCircle, MapPin, Users, MessageCircle, CheckCircle } from "lucide-react";

interface Driver {
  id: number;
  name: string;
  whatsapp: string;
  serviceType: string;
  area?: string;
  capacity?: number;
  notes?: string;
  photoUrl?: string;
  isPartner: boolean;
  partnerUntil?: string;
  isVerified: boolean;
  createdAt: string;
}

export default function TransportPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    serviceType: "",
    area: "",
    capacity: "",
    notes: "",
  });
  const [submitMessage, setSubmitMessage] = useState("");

  const { data: drivers = [], isLoading, error } = useDriversList();

  const createMutation = trpc.drivers.create.useMutation();

  const sortedDrivers = [...(drivers as Driver[])].sort((a, b) => {
    const now = new Date();
    const aIsValidPartner = a.isPartner && a.partnerUntil && new Date(a.partnerUntil) > now;
    const bIsValidPartner = b.isPartner && b.partnerUntil && new Date(b.partnerUntil) > now;
    if (aIsValidPartner && !bIsValidPartner) return -1;
    if (!aIsValidPartner && bIsValidPartner) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWhatsapp = formData.whatsapp.replace(/\D/g, "");
    if (!formData.name || !cleanWhatsapp || !formData.serviceType) {
      setSubmitMessage("Por favor, preencha os campos obrigatórios.");
      return;
    }
    createMutation.mutate(
      {
        name: formData.name,
        whatsapp: cleanWhatsapp,
        serviceType: formData.serviceType,
        region: formData.area || "Holambra",
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        notes: formData.notes || undefined,
      },
      {
        onSuccess: () => {
          setFormData({ name: "", whatsapp: "", serviceType: "", area: "", capacity: "", notes: "" });
          setShowForm(false);
          setSubmitMessage("Cadastro realizado com sucesso! Após aprovação, seu perfil será exibido.");
          setTimeout(() => setSubmitMessage(""), 5000);
        },
      }
    );
  };

  const getWhatsappUrl = (number: string): string => {
    const clean = number.replace(/\D/g, "");
    return `https://wa.me/${clean}?text=Olá, vi seu perfil no ORANJE`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title="Transporte & Motoristas" />

      <div className="px-4 pt-4">
        {/* Header Info */}
        <div className="mb-6">
          <p className="text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>
            Encontre motoristas parceiros ORANJE para suas necessidades de transporte
          </p>
        </div>

        {/* Register Button */}
        <div className="mb-6">
          <DSButton variant={showForm ? "secondary" : "primary"} onClick={() => setShowForm(!showForm)} style={{ width: "100%" }}>
            {showForm ? "Cancelar" : "Cadastre-se como Motorista"}
          </DSButton>
        </div>

        {/* Registration Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl p-5" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.2)" }}>
            <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--ds-color-text-primary)" }}>Cadastro de Motorista</h3>
            <p className="text-xs mb-4" style={{ color: "var(--ds-color-text-secondary)" }}>
              Preencha seus dados. Após aprovação, seu perfil será exibido na plataforma.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--ds-color-text-primary)" }}>Nome *</label>
                  <DSInput name="name" value={formData.name} onChange={handleFormChange} placeholder="Seu nome completo" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--ds-color-text-primary)" }}>WhatsApp *</label>
                  <DSInput name="whatsapp" value={formData.whatsapp} onChange={handleFormChange} placeholder="(11) 99999-9999" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--ds-color-text-primary)" }}>Tipo de Serviço *</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-xl text-sm"
                    style={{ background: "rgba(230,81,0,0.08)", border: "1px solid rgba(230,81,0,0.2)", color: "var(--ds-color-text-primary)" }}
                    required
                  >
                    <option value="">Selecione um tipo</option>
                    <option value="Táxi">Táxi</option>
                    <option value="Motorista Particular">Motorista Particular</option>
                    <option value="Transporte Executivo">Transporte Executivo</option>
                    <option value="Van">Van</option>
                    <option value="Ônibus">Ônibus</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--ds-color-text-primary)" }}>Área de Atuação</label>
                  <DSInput name="area" value={formData.area} onChange={handleFormChange} placeholder="Ex: Holambra e região" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--ds-color-text-primary)" }}>Capacidade de Passageiros</label>
                <DSInput name="capacity" type="number" value={formData.capacity} onChange={handleFormChange} placeholder="Ex: 4" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--ds-color-text-primary)" }}>Observações</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Informações adicionais sobre seus serviços..."
                  className="w-full px-3 py-2 rounded-xl text-sm min-h-20 resize-none"
                  style={{ background: "rgba(230,81,0,0.08)", border: "1px solid rgba(230,81,0,0.2)", color: "var(--ds-color-text-primary)" }}
                />
              </div>

              {submitMessage && (
                <div className="p-3 rounded-xl text-sm" style={{
                  background: submitMessage.includes("sucesso") ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.15)",
                  border: `1px solid ${submitMessage.includes("sucesso") ? "rgba(76,175,80,0.3)" : "rgba(244,67,54,0.3)"}`,
                  color: submitMessage.includes("sucesso") ? "#66BB6A" : "#EF5350",
                }}>
                  {submitMessage}
                </div>
              )}

              <DSButton variant="primary" type="submit" disabled={createMutation.isPending} style={{ width: "100%" }}>
                {createMutation.isPending ? "Enviando..." : "Enviar Cadastro"}
              </DSButton>
            </form>
          </div>
        )}

        {/* Drivers List */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--ds-color-text-primary)" }}>Motoristas Disponíveis</h2>
            <p className="text-xs" style={{ color: "var(--ds-color-text-secondary)" }}>
              {sortedDrivers.length} motorista{sortedDrivers.length !== 1 ? "s" : ""} aprovado{sortedDrivers.length !== 1 ? "s" : ""}
            </p>
          </div>

          {isLoading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl animate-pulse" style={{ height: 160, background: "var(--ds-color-bg-secondary)" }} />
              ))}
            </div>
          )}

          {!isLoading && sortedDrivers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(230,81,0,0.3)" }} />
              <p className="text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>Nenhum motorista disponível no momento</p>
            </div>
          )}

          {!isLoading && sortedDrivers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedDrivers.map((driver) => {
                const now = new Date();
                const isValidPartner = driver.isPartner && driver.partnerUntil && new Date(driver.partnerUntil) > now;
                return (
                  <div key={driver.id} className="rounded-2xl overflow-hidden transition-all" style={{
                    background: isValidPartner ? "rgba(230,81,0,0.08)" : "rgba(230,81,0,0.04)",
                    border: `1px solid ${isValidPartner ? "rgba(230,81,0,0.3)" : "rgba(230,81,0,0.12)"}`,
                  }}>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold" style={{ color: "var(--ds-color-text-primary)" }}>{driver.name}</h3>
                          <p className="text-xs mt-0.5" style={{ color: "var(--ds-color-text-secondary)" }}>{driver.serviceType}</p>
                        </div>
                        {isValidPartner && <DSBadge variant="accent">Parceiro ORANJE</DSBadge>}
                      </div>
                      {driver.isVerified && (
                        <div className="flex items-center gap-1 text-xs mb-2" style={{ color: "#66BB6A" }}>
                          <CheckCircle className="w-4 h-4" /> Verificado
                        </div>
                      )}
                      {driver.area && (
                        <div className="flex items-center gap-2 text-xs mb-1" style={{ color: "var(--ds-color-text-secondary)" }}>
                          <MapPin className="w-3 h-3" /> {driver.area}
                        </div>
                      )}
                      {driver.capacity && (
                        <div className="flex items-center gap-2 text-xs mb-1" style={{ color: "var(--ds-color-text-secondary)" }}>
                          <Users className="w-3 h-3" /> Até {driver.capacity} passageiro{driver.capacity !== 1 ? "s" : ""}
                        </div>
                      )}
                      {driver.notes && <p className="text-xs italic mt-2" style={{ color: "var(--ds-color-text-secondary)" }}>{driver.notes}</p>}
                      <a href={getWhatsappUrl(driver.whatsapp)} target="_blank" rel="noopener noreferrer" className="block mt-3">
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "#25D366", color: "#fff" }}>
                          <MessageCircle className="w-4 h-4" /> Contatar via WhatsApp
                        </button>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
