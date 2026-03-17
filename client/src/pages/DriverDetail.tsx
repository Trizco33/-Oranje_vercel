import { useParams, useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { OranjeHeader } from "@/components/OranjeHeader";
import { DSButton } from "@/components/ds";
import { MapPin, Phone, Car, Users, CheckCircle } from "lucide-react";

export default function DriverDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: driver, isLoading } = trpc.drivers.list.useQuery();

  const currentDriver = driver?.find((d: any) => d.id === id);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
        <OranjeHeader showBack title="Carregando..." />
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="rounded-2xl animate-pulse mb-6" style={{ height: 384, background: "var(--ds-color-bg-secondary)" }} />
          <div className="rounded-lg animate-pulse mb-4" style={{ height: 80, background: "var(--ds-color-bg-secondary)" }} />
          <div className="rounded-lg animate-pulse" style={{ height: 80, background: "var(--ds-color-bg-secondary)" }} />
        </div>
      </div>
    );
  }

  if (!currentDriver) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }} className="flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-lg font-medium mb-4" style={{ color: "var(--ds-color-text-primary)" }}>Motorista não encontrado</p>
          <DSButton variant="primary" onClick={() => navigate(-1)}>Voltar</DSButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader showBack title={currentDriver.name} />

      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        {currentDriver.photoUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden">
            <img src={currentDriver.photoUrl} alt={currentDriver.name} className="w-full h-64 object-cover" />
          </div>
        )}

        <div className="space-y-4">
          {/* Contact */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.15)" }}>
            <div className="flex items-start gap-3 mb-4">
              <Phone size={20} style={{ color: "var(--ds-color-accent)" }} />
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--ds-color-text-secondary)" }}>Contato</p>
                <a href={`https://wa.me/${currentDriver.whatsapp.replace(/\D/g, "")}`} className="text-sm font-medium" style={{ color: "var(--ds-color-text-primary)" }}>
                  {currentDriver.whatsapp}
                </a>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          {(currentDriver.vehicleModel || currentDriver.vehicleColor || currentDriver.plate) && (
            <div className="rounded-2xl p-6" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.15)" }}>
              <div className="flex items-start gap-3 mb-3">
                <Car size={20} style={{ color: "var(--ds-color-accent)" }} />
                <div className="flex-1">
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--ds-color-text-secondary)" }}>Veículo</p>
                  {currentDriver.vehicleModel && (
                    <p className="text-sm" style={{ color: "var(--ds-color-text-primary)" }}>
                      {currentDriver.vehicleModel}{currentDriver.vehicleColor && ` • ${currentDriver.vehicleColor}`}
                    </p>
                  )}
                  {currentDriver.plate && (
                    <p className="text-xs font-mono mt-1" style={{ color: "var(--ds-color-accent)" }}>{currentDriver.plate}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Service Info */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.15)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--ds-color-text-secondary)" }}>Tipo de Serviço</p>
            <p className="text-sm font-medium" style={{ color: "var(--ds-color-text-primary)" }}>{currentDriver.serviceType}</p>
          </div>

          {/* Region & Capacity */}
          <div className="grid grid-cols-2 gap-4">
            {currentDriver.region && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.15)" }}>
                <div className="flex items-start gap-2 mb-2">
                  <MapPin size={16} style={{ color: "var(--ds-color-accent)" }} />
                  <p className="text-xs font-medium" style={{ color: "var(--ds-color-text-secondary)" }}>Região</p>
                </div>
                <p className="text-sm" style={{ color: "var(--ds-color-text-primary)" }}>{currentDriver.region}</p>
              </div>
            )}
            {currentDriver.capacity && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.15)" }}>
                <div className="flex items-start gap-2 mb-2">
                  <Users size={16} style={{ color: "var(--ds-color-accent)" }} />
                  <p className="text-xs font-medium" style={{ color: "var(--ds-color-text-secondary)" }}>Capacidade</p>
                </div>
                <p className="text-sm" style={{ color: "var(--ds-color-text-primary)" }}>{currentDriver.capacity} pessoas</p>
              </div>
            )}
          </div>

          {/* Status */}
          {currentDriver.isVerified && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(76,175,80,0.1)" }}>
              <CheckCircle size={16} style={{ color: "#66BB6A" }} />
              <span className="text-sm font-medium" style={{ color: "#66BB6A" }}>Motorista Verificado</span>
            </div>
          )}

          {/* Notes */}
          {currentDriver.notes && (
            <div className="rounded-2xl p-6" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.15)" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--ds-color-text-secondary)" }}>Informações Adicionais</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--ds-color-text-primary)" }}>{currentDriver.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
