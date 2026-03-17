import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AdminListTable } from "./AdminListTable";
import { AdminFormModal } from "./AdminFormModal";

export function AdminDrivers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);

  const { data: drivers, isLoading, refetch } = trpc.drivers.listAdmin.useQuery();
  const updateDriver = trpc.drivers.updateAdmin.useMutation();
  const deleteDriver = trpc.drivers.deleteAdmin.useMutation();

  const handleCreate = () => {
    setEditingDriver(null);
    setIsModalOpen(true);
  };

  const handleEdit = (driver: any) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const handleDelete = async (driver: any) => {
    try {
      await deleteDriver.mutateAsync({ id: driver.id });
      toast.success("Motorista deletado");
      refetch();
    } catch (error) {
      console.error("Erro ao deletar motorista:", error);
      toast.error("Erro ao deletar motorista");
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (editingDriver) {
        console.log("Atualizando motorista:", { id: editingDriver.id, ...data });
        await updateDriver.mutateAsync({ id: editingDriver.id, ...data });
        toast.success("Motorista atualizado");
      } else {
        toast.error("Criação de motoristas deve ser feita através do app");
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Erro ao salvar motorista:", error);
      const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro: ${errorMsg}`);
    }
  };

  return (
    <>
      <AdminListTable
        title="Motoristas"
        columns={[
          { key: "name", label: "Nome", width: "20%" },
          { key: "whatsapp", label: "WhatsApp", width: "15%" },
          { key: "vehicleModel", label: "Veículo", width: "15%" },
          { key: "region", label: "Região", width: "15%" },
          {
            key: "status",
            label: "Status",
            render: (value) => (
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor:
                    value === "ACTIVE"
                      ? "rgba(91,217,138,0.2)"
                      : value === "PENDING"
                        ? "rgba(255,193,7,0.2)"
                        : "rgba(255,100,100,0.2)",
                  color:
                    value === "ACTIVE"
                      ? "#5BD98A"
                      : value === "PENDING"
                        ? "#FFC107"
                        : "#FF6464",
                }}
              >
                {value === "ACTIVE"
                  ? "Ativo"
                  : value === "PENDING"
                    ? "Pendente"
                    : "Rejeitado"}
              </span>
            ),
            width: "15%",
          },
          {
            key: "isVerified",
            label: "Verificado",
            render: (value) => (value ? "✓" : "-"),
            width: "10%",
          },
        ]}
        data={drivers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      <AdminFormModal
        title={editingDriver ? "Editar Motorista" : "Novo Motorista"}
        fields={[
          { name: "name", label: "Nome", type: "text", required: true },
          { name: "whatsapp", label: "WhatsApp", type: "text", required: true },
          { name: "photoUrl", label: "Foto", type: "image" },
          { name: "vehicleModel", label: "Modelo do Veículo", type: "text" },
          { name: "vehicleColor", label: "Cor do Veículo", type: "text" },
          { name: "plate", label: "Placa", type: "text" },
          { name: "capacity", label: "Capacidade (passageiros)", type: "number" },
          { name: "serviceType", label: "Tipo de Serviço", type: "text", required: true },
          { name: "region", label: "Região de Atuação", type: "text" },
          { name: "area", label: "Área de Atuação", type: "textarea" },
          { name: "notes", label: "Notas", type: "textarea" },
          {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
              { value: "PENDING", label: "Pendente" },
              { value: "ACTIVE", label: "Ativo" },
              { value: "REJECTED", label: "Rejeitado" },
            ],
          },
          { name: "isVerified", label: "Verificado", type: "checkbox" },
          { name: "isActive", label: "Ativo", type: "checkbox" },
          { name: "isPartner", label: "Parceiro", type: "checkbox" },
        ]}
        initialData={editingDriver || undefined}
        isOpen={isModalOpen}
        isLoading={updateDriver.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
