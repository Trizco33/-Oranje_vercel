import { useParams, useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, MapPin, Phone, Car, Users, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DriverDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: driver, isLoading } = trpc.drivers.list.useQuery();

  const currentDriver = driver?.find((d: any) => d.id === id);

  if (isLoading) {
    return (
      <div className="oranje-app min-h-screen bg-gradient-to-b from-oranje-teal to-oranje-dark">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Skeleton className="h-96 rounded-2xl mb-6" />
          <Skeleton className="h-20 rounded-lg mb-4" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!currentDriver) {
    return (
      <div className="oranje-app min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-lg font-medium mb-4" style={{ color: "#E8E6E3" }}>
            Motorista não encontrado
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg"
            style={{ background: "#D88A3D", color: "#0F1B14" }}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

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
            {currentDriver.name}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        {/* Photo */}
        {currentDriver.photoUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden">
            <img
              src={currentDriver.photoUrl}
              alt={currentDriver.name}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Info Cards */}
        <div className="space-y-4">
          {/* Contact */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "rgba(216,138,61,0.1)", border: "1px solid rgba(216,138,61,0.2)" }}
          >
            <div className="flex items-start gap-3 mb-4">
              <Phone size={20} style={{ color: "#D88A3D" }} />
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "#C8C5C0" }}>
                  Contato
                </p>
                <a
                  href={`https://wa.me/${currentDriver.whatsapp.replace(/\D/g, "")}`}
                  className="text-sm font-medium"
                  style={{ color: "#E8E6E3" }}
                >
                  {currentDriver.whatsapp}
                </a>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          {(currentDriver.vehicleModel || currentDriver.vehicleColor || currentDriver.plate) && (
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(216,138,61,0.1)", border: "1px solid rgba(216,138,61,0.2)" }}
            >
              <div className="flex items-start gap-3 mb-3">
                <Car size={20} style={{ color: "#D88A3D" }} />
                <div className="flex-1">
                  <p className="text-xs font-medium mb-2" style={{ color: "#C8C5C0" }}>
                    Veículo
                  </p>
                  {currentDriver.vehicleModel && (
                    <p className="text-sm" style={{ color: "#E8E6E3" }}>
                      {currentDriver.vehicleModel}
                      {currentDriver.vehicleColor && ` • ${currentDriver.vehicleColor}`}
                    </p>
                  )}
                  {currentDriver.plate && (
                    <p className="text-xs font-mono mt-1" style={{ color: "#D88A3D" }}>
                      {currentDriver.plate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Service Info */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "rgba(216,138,61,0.1)", border: "1px solid rgba(216,138,61,0.2)" }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: "#C8C5C0" }}>
              Tipo de Serviço
            </p>
            <p className="text-sm font-medium" style={{ color: "#E8E6E3" }}>
              {currentDriver.serviceType}
            </p>
          </div>

          {/* Region & Capacity */}
          <div className="grid grid-cols-2 gap-4">
            {currentDriver.region && (
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(216,138,61,0.1)", border: "1px solid rgba(216,138,61,0.2)" }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <MapPin size={16} style={{ color: "#D88A3D" }} />
                  <p className="text-xs font-medium" style={{ color: "#C8C5C0" }}>
                    Região
                  </p>
                </div>
                <p className="text-sm" style={{ color: "#E8E6E3" }}>
                  {currentDriver.region}
                </p>
              </div>
            )}

            {currentDriver.capacity && (
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(216,138,61,0.1)", border: "1px solid rgba(216,138,61,0.2)" }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <Users size={16} style={{ color: "#D88A3D" }} />
                  <p className="text-xs font-medium" style={{ color: "#C8C5C0" }}>
                    Capacidade
                  </p>
                </div>
                <p className="text-sm" style={{ color: "#E8E6E3" }}>
                  {currentDriver.capacity} pessoas
                </p>
              </div>
            )}
          </div>

          {/* Status */}
          {currentDriver.isVerified && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{ background: "rgba(91,217,138,0.1)" }}>
              <CheckCircle size={16} style={{ color: "#5BD98A" }} />
              <span className="text-sm font-medium" style={{ color: "#5BD98A" }}>
                Motorista Verificado
              </span>
            </div>
          )}

          {/* Notes */}
          {currentDriver.notes && (
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(216,138,61,0.1)", border: "1px solid rgba(216,138,61,0.2)" }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: "#C8C5C0" }}>
                Informações Adicionais
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#E8E6E3" }}>
                {currentDriver.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
