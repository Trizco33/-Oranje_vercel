import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type TabType = "pending" | "active";

export function AdminDriversMarketplace() {
  const [activeTab, setActiveTab] = useState<TabType>("pending");

  const { data: pendingDrivers, isLoading: pendingLoading, refetch: refetchPending } = trpc.drivers.listAdmin.useQuery({
    status: "PENDING",
  });

  const { data: activeDrivers, isLoading: activeLoading, refetch: refetchActive } = trpc.drivers.listAdmin.useQuery({
    status: "ACTIVE",
  });

  const updateMutation = trpc.drivers.updateAdmin.useMutation();
  const deleteMutation = trpc.drivers.deleteAdmin.useMutation();

  const handleApprove = async (driverId: string) => {
    try {
      await updateMutation.mutateAsync({
        id: driverId,
        status: "ACTIVE",
        isVerified: true,
        isActive: true,
      });
      toast.success("Motorista aprovado");
      refetchPending();
      refetchActive();
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      toast.error("Erro ao aprovar motorista");
    }
  };

  const handleReject = async (driverId: string) => {
    try {
      await updateMutation.mutateAsync({
        id: driverId,
        status: "REJECTED",
        isActive: false,
      });
      toast.success("Motorista rejeitado");
      refetchPending();
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      toast.error("Erro ao rejeitar motorista");
    }
  };

  const handleDelete = async (driverId: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este motorista?")) return;

    try {
      await deleteMutation.mutateAsync({ id: driverId });
      toast.success("Motorista deletado");
      refetchPending();
      refetchActive();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao deletar motorista");
    }
  };

  const drivers = activeTab === "pending" ? pendingDrivers : activeDrivers;
  const isLoading = activeTab === "pending" ? pendingLoading : activeLoading;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b" style={{ borderColor: "rgba(216,138,61,0.2)" }}>
        <button
          onClick={() => setActiveTab("pending")}
          className="px-4 py-3 font-medium transition-all"
          style={{
            color: activeTab === "pending" ? "#D88A3D" : "#C8C5C0",
            borderBottom: activeTab === "pending" ? "2px solid #D88A3D" : "none",
          }}
        >
          Pendentes ({pendingDrivers?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className="px-4 py-3 font-medium transition-all"
          style={{
            color: activeTab === "active" ? "#D88A3D" : "#C8C5C0",
            borderBottom: activeTab === "active" ? "2px solid #D88A3D" : "none",
          }}
        >
          Ativos ({activeDrivers?.length || 0})
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!drivers || drivers.length === 0) && (
        <div className="text-center py-12">
          <p style={{ color: "#C8C5C0" }}>
            {activeTab === "pending" ? "Nenhum motorista pendente" : "Nenhum motorista ativo"}
          </p>
        </div>
      )}

      {/* Driver List */}
      {!isLoading && drivers && drivers.length > 0 && (
        <div className="space-y-4">
          {drivers.map((driver: any) => (
            <div
              key={driver.id}
              className="rounded-lg p-4 border"
              style={{ background: "rgba(216,138,61,0.05)", borderColor: "rgba(216,138,61,0.2)" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Name & Contact */}
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "#C8C5C0" }}>
                    Nome
                  </p>
                  <p className="font-medium" style={{ color: "#E8E6E3" }}>
                    {driver.name}
                  </p>
                  <p className="text-sm" style={{ color: "#D88A3D" }}>
                    {driver.whatsapp}
                  </p>
                </div>

                {/* Service & Region */}
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "#C8C5C0" }}>
                    Serviço
                  </p>
                  <p className="font-medium" style={{ color: "#E8E6E3" }}>
                    {driver.serviceType}
                  </p>
                  <p className="text-sm" style={{ color: "#C8C5C0" }}>
                    {driver.region}
                  </p>
                </div>

                {/* Vehicle */}
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "#C8C5C0" }}>
                    Veículo
                  </p>
                  <p className="font-medium" style={{ color: "#E8E6E3" }}>
                    {driver.vehicleModel || "-"}
                  </p>
                  <p className="text-sm" style={{ color: "#C8C5C0" }}>
                    {driver.plate || "-"}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "#C8C5C0" }}>
                    Status
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor:
                          driver.status === "ACTIVE"
                            ? "rgba(91,217,138,0.2)"
                            : driver.status === "PENDING"
                              ? "rgba(255,193,7,0.2)"
                              : "rgba(255,100,100,0.2)",
                        color:
                          driver.status === "ACTIVE"
                            ? "#5BD98A"
                            : driver.status === "PENDING"
                              ? "#FFC107"
                              : "#FF6464",
                        border: "none",
                      }}
                    >
                      {driver.status === "ACTIVE" ? "Ativo" : driver.status === "PENDING" ? "Pendente" : "Rejeitado"}
                    </Badge>
                    {driver.isVerified && (
                      <Badge
                        style={{
                          backgroundColor: "rgba(91,217,138,0.2)",
                          color: "#5BD98A",
                          border: "none",
                        }}
                      >
                        ✓ Verificado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {activeTab === "pending" && (
                <div className="flex gap-2 pt-4 border-t" style={{ borderColor: "rgba(216,138,61,0.2)" }}>
                  <Button
                    onClick={() => handleApprove(driver.id)}
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                    style={{ background: "#5BD98A", color: "#0F1B14" }}
                  >
                    <CheckCircle size={16} />
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => handleReject(driver.id)}
                    size="sm"
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => handleDelete(driver.id)}
                    size="sm"
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              )}

              {activeTab === "active" && (
                <div className="flex gap-2 pt-4 border-t" style={{ borderColor: "rgba(216,138,61,0.2)" }}>
                  <Button
                    onClick={() => handleDelete(driver.id)}
                    size="sm"
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Deletar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
