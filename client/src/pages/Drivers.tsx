import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { DSButton } from "@/components/ds";
import { MessageCircle, MapPin, Car, Users, AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";

export default function Drivers() {
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);

  const { data: drivers = [], isLoading, error, refetch } = trpc.drivers.listPublic.useQuery();

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    refetch();
  };

  const handleContact = (whatsapp: string) => {
    const cleaned = whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/${cleaned}`, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title="Motoristas" />

      <div className="px-4 pt-4">
        {/* Register CTA */}
        <div className="mb-6">
          <DSButton variant="primary" onClick={() => navigate("/app/cadastrar-motorista")} style={{ width: "100%" }}>
            <Plus size={18} className="mr-2" /> Cadastrar como Motorista
          </DSButton>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ height: 200, background: "var(--ds-color-bg-secondary)" }} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.2)" }}>
            <AlertCircle size={24} style={{ color: "#EF5350", flexShrink: 0 }} />
            <div className="flex-1">
              <p className="font-medium mb-2" style={{ color: "#EF5350" }}>Erro ao carregar motoristas</p>
              <p className="text-sm mb-4" style={{ color: "var(--ds-color-text-primary)" }}>
                {error instanceof Error ? error.message : "Tente novamente mais tarde"}
              </p>
              <DSButton variant="secondary" onClick={handleRetry}>Tentar Novamente</DSButton>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && drivers.length === 0 && (
          <div className="text-center py-12">
            <Car size={48} className="mx-auto mb-4" style={{ color: "rgba(230,81,0,0.3)" }} />
            <p className="text-lg font-medium mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Nenhum motorista disponível</p>
            <p className="text-sm mb-6" style={{ color: "var(--ds-color-text-secondary)" }}>Verifique novamente em breve ou cadastre-se como motorista</p>
          </div>
        )}

        {/* Drivers Grid */}
        {!isLoading && !error && drivers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map((driver: any) => (
              <div key={driver.id} className="rounded-2xl overflow-hidden transition-all" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.15)" }}>
                {driver.photoUrl && (
                  <div className="h-40 overflow-hidden">
                    <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <h3 className="text-lg font-bold" style={{ color: "var(--ds-color-text-primary)" }}>{driver.name}</h3>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>
                    <span>{driver.serviceType}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1"><MapPin size={14} /><span>{driver.region}</span></div>
                  </div>
                  {(driver.vehicleModel || driver.vehicleColor) && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ds-color-accent)" }}>
                      <Car size={14} />
                      <span>{driver.vehicleModel}{driver.vehicleColor && ` • ${driver.vehicleColor}`}</span>
                    </div>
                  )}
                  {driver.capacity && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>
                      <Users size={14} /><span>{driver.capacity} pessoas</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleContact(driver.whatsapp)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "#25D366", color: "#fff" }}
                  >
                    <MessageCircle size={16} /> Contatar no WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
