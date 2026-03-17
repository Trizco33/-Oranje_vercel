import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Check, X, Star, Trash2, Edit2, Calendar, Loader2 } from "lucide-react";

type StatusFilter = "all" | "PENDING" | "ACTIVE" | "REJECTED";

export default function DriversAdminTab() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPartnerUntil, setEditingPartnerUntil] = useState<string>("");

  // Queries
  const { data: drivers, isLoading, refetch } = trpc.drivers.listAdmin.useQuery();
  const { data: pendingCount } = trpc.drivers.listAdmin.useQuery({ status: "PENDING" });

  // Mutations
  const setStatusMutation = trpc.drivers.updateAdmin.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado");
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const setPartnerMutation = trpc.drivers.setPartner.useMutation({
    onSuccess: () => {
      toast.success("Parceiro atualizado");
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateDriverMutation = trpc.drivers.updateAdmin.useMutation({
    onSuccess: () => {
      toast.success("Motorista atualizado");
      setEditingId(null);
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteDriverMutation = trpc.drivers.deleteAdmin.useMutation({
    onSuccess: () => {
      toast.success("Motorista deletado");
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Filtrar drivers
  const filteredDrivers = drivers?.filter((d: any) => 
    statusFilter === "all" ? true : d.status === statusFilter
  ) ?? [];

  // Ordenar: PENDING primeiro, depois ACTIVE, depois REJECTED
  const sortedDrivers = [...filteredDrivers].sort((a: any, b: any) => {
    const statusOrder: Record<string, number> = { PENDING: 0, ACTIVE: 1, REJECTED: 2 };
    return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
  });

  const handleApprove = (id: string) => {
    setStatusMutation.mutate({ id, status: "ACTIVE" });
  };

  const handleReject = (id: string) => {
    setStatusMutation.mutate({ id, status: "REJECTED" });
  };

  const handleMarkPartner = (id: string) => {
    const daysFromNow = 30;
    const partnerUntil = new Date();
    partnerUntil.setDate(partnerUntil.getDate() + daysFromNow);
    setPartnerMutation.mutate({ id, isPartner: true });
  };

  const handleRemovePartner = (id: string) => {
    setPartnerMutation.mutate({ id, isPartner: false });
  };

  const handleSavePartnerUntil = (id: string) => {
    if (!editingPartnerUntil) {
      toast.error("Data inválida");
      return;
    }
    setPartnerMutation.mutate({ 
      id, 
      isPartner: true,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este motorista?")) {
      deleteDriverMutation.mutate({ id });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      PENDING: { bg: "rgba(255, 193, 7, 0.1)", color: "#FFC107", label: "Pendente" },
      ACTIVE: { bg: "rgba(91, 217, 138, 0.1)", color: "#5BD98A", label: "Ativo" },
      REJECTED: { bg: "rgba(217, 91, 141, 0.1)", color: "#D95B8D", label: "Rejeitado" },
    };
    const style = styles[status] || styles.PENDING;
    return (
      <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: style.bg, color: style.color }}>
        {style.label}
      </span>
    );
  };

  const isPartnerValid = (driver: any): boolean => {
    if (!driver.isPartner || !driver.partnerUntil) return false;
    return new Date(driver.partnerUntil) > new Date();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title text-lg">Motoristas</h2>
        {pendingCount && pendingCount.length > 0 && (
          <div className="px-3 py-1 rounded-lg" style={{ background: "rgba(255, 193, 7, 0.1)" }}>
            <span className="text-xs font-semibold" style={{ color: "#FFC107" }}>
              {pendingCount.length} pendente{pendingCount.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(["all", "PENDING", "ACTIVE", "REJECTED"] as StatusFilter[]).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: statusFilter === status ? "rgba(216,138,61,0.15)" : "rgba(216,138,61,0.05)",
              color: statusFilter === status ? "#D88A3D" : "#6B7A8D",
              border: statusFilter === status ? "1px solid rgba(216,138,61,0.3)" : "1px solid transparent",
            }}
          >
            {status === "all" ? "Todos" : status === "PENDING" ? "Pendentes" : status === "ACTIVE" ? "Ativos" : "Rejeitados"}
          </button>
        ))}
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin" style={{ color: "#D88A3D" }} />
        </div>
      ) : sortedDrivers.length === 0 ? (
        <div className="text-center py-8" style={{ color: "#C8C5C0" }}>
          Nenhum motorista encontrado
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDrivers.map((driver: any) => (
            <div key={driver.id} className="glass-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm" style={{ color: "#E8E6E3" }}>
                      {driver.name}
                    </h3>
                    {getStatusBadge(driver.status)}
                    {isPartnerValid(driver) && (
                      <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(216,138,61,0.15)", color: "#D88A3D" }}>
                        ⭐ Parceiro
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "#C8C5C0" }}>
                    {driver.serviceType} • {driver.area} • {driver.capacity} passageiros
                  </p>
                  {driver.notes && (
                    <p className="text-xs mt-1" style={{ color: "#A8A5A0" }}>
                      {driver.notes}
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: "#6B7A8D" }}>
                    WhatsApp: {driver.whatsapp}
                  </p>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-wrap gap-2 mt-3">
                {driver.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleApprove(driver.id)}
                      disabled={setStatusMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: "rgba(91, 217, 138, 0.15)", color: "#5BD98A" }}
                    >
                      <Check size={13} />
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleReject(driver.id)}
                      disabled={setStatusMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: "rgba(217, 91, 141, 0.15)", color: "#D95B8D" }}
                    >
                      <X size={13} />
                      Rejeitar
                    </button>
                  </>
                )}

                {driver.status === "ACTIVE" && (
                  <>
                    {!isPartnerValid(driver) ? (
                      <button
                        onClick={() => handleMarkPartner(driver.id)}
                        disabled={setPartnerMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: "rgba(216,138,61,0.15)", color: "#D88A3D" }}
                      >
                        <Star size={13} />
                        Marcar Parceiro
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRemovePartner(driver.id)}
                        disabled={setPartnerMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: "rgba(217, 91, 141, 0.15)", color: "#D95B8D" }}
                      >
                        <X size={13} />
                        Remover Parceiro
                      </button>
                    )}

                    {isPartnerValid(driver) && editingId === driver.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          value={editingPartnerUntil}
                          onChange={(e) => setEditingPartnerUntil(e.target.value)}
                          className="px-2 py-1 rounded text-xs"
                          style={{ background: "rgba(216,138,61,0.1)", color: "#E8E6E3" }}
                        />
                        <button
                          onClick={() => handleSavePartnerUntil(driver.id)}
                          disabled={setPartnerMutation.isPending}
                          className="px-2 py-1 rounded-lg text-xs font-medium"
                          style={{ background: "rgba(91, 217, 138, 0.15)", color: "#5BD98A" }}
                        >
                          Salvar
                        </button>
                      </div>
                    ) : isPartnerValid(driver) ? (
                      <button
                        onClick={() => {
                          setEditingId(driver.id);
                          setEditingPartnerUntil(driver.partnerUntil?.split("T")[0] || "");
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: "rgba(216,138,61,0.15)", color: "#D88A3D" }}
                      >
                        <Calendar size={13} />
                        Alterar Validade
                      </button>
                    ) : null}
                  </>
                )}

                <button
                  onClick={() => handleDelete(driver.id)}
                  disabled={deleteDriverMutation.isPending}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ml-auto"
                  style={{ background: "rgba(217, 91, 141, 0.15)", color: "#D95B8D" }}
                >
                  <Trash2 size={13} />
                  Deletar
                </button>
              </div>

              {isPartnerValid(driver) && (
                <p className="text-xs mt-2" style={{ color: "#D88A3D" }}>
                  Parceiro até: {new Date(driver.partnerUntil as string).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
