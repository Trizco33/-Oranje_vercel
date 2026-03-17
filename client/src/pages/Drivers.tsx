import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="oranje-app min-h-screen bg-gradient-to-b from-oranje-teal to-oranje-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md" style={{ background: "rgba(15,27,20,0.8)" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: "#E8E6E3" }}>
            Motoristas
          </h1>
          <Button
            onClick={() => navigate("/app/cadastrar-motorista")}
            className="flex items-center gap-2"
            style={{ background: "#D88A3D", color: "#0F1B14" }}
          >
            <Plus size={18} />
            Cadastrar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div
            className="rounded-2xl p-6 flex items-start gap-4"
            style={{ background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.2)" }}
          >
            <AlertCircle size={24} style={{ color: "#FF6464", flexShrink: 0 }} />
            <div className="flex-1">
              <p className="font-medium mb-2" style={{ color: "#FF6464" }}>
                Erro ao carregar motoristas
              </p>
              <p className="text-sm mb-4" style={{ color: "#E8E6E3" }}>
                {error instanceof Error ? error.message : "Tente novamente mais tarde"}
              </p>
              <Button onClick={handleRetry} variant="outline" size="sm">
                Tentar Novamente
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && drivers.length === 0 && (
          <div className="text-center py-12">
            <Car size={48} className="mx-auto mb-4 opacity-50" style={{ color: "#D88A3D" }} />
            <p className="text-lg font-medium mb-2" style={{ color: "#E8E6E3" }}>
              Nenhum motorista disponível no momento
            </p>
            <p className="text-sm mb-6" style={{ color: "#C8C5C0" }}>
              Verifique novamente em breve ou cadastre-se como motorista
            </p>
            <Button
              onClick={() => navigate("/app/cadastrar-motorista")}
              className="flex items-center gap-2 mx-auto"
              style={{ background: "#D88A3D", color: "#0F1B14" }}
            >
              <Plus size={18} />
              Cadastrar como Motorista
            </Button>
          </div>
        )}

        {/* Drivers Grid */}
        {!isLoading && !error && drivers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map((driver: any) => (
              <div
                key={driver.id}
                className="rounded-2xl overflow-hidden transition-all hover:shadow-lg"
                style={{ background: "rgba(216,138,61,0.05)", border: "1px solid rgba(216,138,61,0.2)" }}
              >
                {/* Photo */}
                {driver.photoUrl && (
                  <div className="h-40 overflow-hidden">
                    <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Name */}
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "#E8E6E3" }}>
                      {driver.name}
                    </h3>
                  </div>

                  {/* Service Type & Region */}
                  <div className="flex items-center gap-2 text-sm" style={{ color: "#C8C5C0" }}>
                    <span>{driver.serviceType}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{driver.region}</span>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  {(driver.vehicleModel || driver.vehicleColor || driver.plate) && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: "#D88A3D" }}>
                      <Car size={14} />
                      <span>
                        {driver.vehicleModel}
                        {driver.vehicleColor && ` • ${driver.vehicleColor}`}
                      </span>
                    </div>
                  )}

                  {/* Capacity */}
                  {driver.capacity && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: "#C8C5C0" }}>
                      <Users size={14} />
                      <span>{driver.capacity} pessoas</span>
                    </div>
                  )}

                  {/* Contact Button */}
                  <Button
                    onClick={() => handleContact(driver.whatsapp)}
                    className="w-full flex items-center justify-center gap-2 py-2"
                    style={{ background: "#25D366", color: "#fff" }}
                  >
                    <MessageCircle size={16} />
                    Contatar no WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
