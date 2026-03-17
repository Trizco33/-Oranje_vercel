import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AdminListTable } from "./AdminListTable";
import { AdminFormModal } from "./AdminFormModal";

export function AdminPartners() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any>(null);

  const { data: partners, isLoading, refetch } = trpc.admin_cms.partners.list.useQuery({} as any);
  const createPartner = trpc.admin_cms.partners.create.useMutation() as any;
  const updatePartner = trpc.admin_cms.partners.update.useMutation() as any;
  const deletePartner = trpc.admin_cms.partners.delete.useMutation() as any;

  const handleCreate = () => {
    setEditingPartner(null);
    setIsModalOpen(true);
  };

  const handleEdit = (partner: any) => {
    setEditingPartner(partner);
    setIsModalOpen(true);
  };

  const handleDelete = async (partner: any) => {
    try {
      await deletePartner.mutateAsync({ id: partner.id });
      toast.success("Parceiro deletado");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar parceiro");
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (editingPartner) {
        await updatePartner.mutateAsync({ id: editingPartner.id, ...data });
        toast.success("Parceiro atualizado");
      } else {
        await createPartner.mutateAsync(data as any);
        toast.success("Parceiro criado");
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar parceiro");
    }
  };

  return (
    <>
      <AdminListTable
        title="Parceiros"
        columns={[
          { key: "name", label: "Nome", width: "30%" },
          { key: "plan", label: "Plano", width: "20%" },
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
                    value === "active"
                      ? "rgba(91,217,138,0.2)"
                      : value === "pending"
                        ? "rgba(255,193,7,0.2)"
                        : "rgba(255,100,100,0.2)",
                  color:
                    value === "active"
                      ? "#5BD98A"
                      : value === "pending"
                        ? "#FFC107"
                        : "#FF6464",
                }}
              >
                {value === "active"
                  ? "Ativo"
                  : value === "pending"
                    ? "Pendente"
                    : "Inativo"}
              </span>
            ),
            width: "20%",
          },
          {
            key: "contactWhatsapp",
            label: "WhatsApp",
            render: (value) => (value ? "✓" : "-"),
            width: "15%",
          },
        ]}
        data={partners}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      <AdminFormModal
        title={editingPartner ? "Editar Parceiro" : "Novo Parceiro"}
        fields={[
          { name: "name", label: "Nome", type: "text", required: true },
          {
            name: "plan",
            label: "Plano",
            type: "select",
            required: true,
            options: [
              { value: "Essencial", label: "Essencial" },
              { value: "Destaque", label: "Destaque" },
              { value: "Premium", label: "Premium" },
            ],
          },
          { name: "contactName", label: "Nome do Contato", type: "text" },
          { name: "contactWhatsapp", label: "WhatsApp", type: "text" },
          { name: "contactEmail", label: "Email", type: "email" },
          { name: "logoUrl", label: "Logo", type: "image" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "pending", label: "Pendente" },
              { value: "active", label: "Ativo" },
              { value: "inactive", label: "Inativo" },
            ],
          },
        ]}
        initialData={editingPartner || undefined}
        isOpen={isModalOpen}
        isLoading={createPartner.isPending || updatePartner.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
