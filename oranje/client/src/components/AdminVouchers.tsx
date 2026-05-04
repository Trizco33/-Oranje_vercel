import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AdminListTable } from "./AdminListTable";
import { AdminFormModal } from "./AdminFormModal";

export function AdminVouchers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);

  const { data: vouchers, isLoading, refetch } = trpc.admin_cms.vouchers.list.useQuery({});
  const createVoucher = trpc.admin_cms.vouchers.create.useMutation();
  const updateVoucher = trpc.admin_cms.vouchers.update.useMutation();
  const deleteVoucher = trpc.admin_cms.vouchers.delete.useMutation();

  const handleCreate = () => {
    setEditingVoucher(null);
    setIsModalOpen(true);
  };

  const handleEdit = (voucher: any) => {
    setEditingVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleDelete = async (voucher: any) => {
    try {
      await deleteVoucher.mutateAsync({ id: voucher.id });
      toast.success("Voucher deletado");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar voucher");
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Allow-list: só campos do formulário, nada de null/undefined/""
      const CREATE_FIELDS = [
        "placeId", "title", "description", "code", "discount",
        "image", "startsAt", "endsAt", "isActive",
      ] as const;
      const UPDATE_FIELDS = [
        "title", "description", "code", "discount",
        "image", "startsAt", "endsAt", "isActive",
      ] as const;
      const fields = editingVoucher ? UPDATE_FIELDS : CREATE_FIELDS;
      const payload: Record<string, any> = {};
      for (const k of fields) {
        const v = data[k];
        if (v === undefined || v === null || v === "") continue;
        if (k === "placeId") {
          const n = parseInt(String(v), 10);
          if (!Number.isNaN(n)) payload[k] = n;
        } else if (k === "startsAt" || k === "endsAt") {
          const d = new Date(v);
          if (!Number.isNaN(d.getTime())) payload[k] = d;
        } else {
          payload[k] = v;
        }
      }

      if (editingVoucher) {
        await updateVoucher.mutateAsync({ id: editingVoucher.id, ...payload });
        toast.success("Voucher atualizado");
      } else {
        await createVoucher.mutateAsync(payload as any);
        toast.success("Voucher criado");
      }
      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      console.error("[AdminVouchers] save error:", error);
      const msg = error?.message || error?.shape?.message || "Erro ao salvar voucher";
      toast.error(msg.length > 120 ? "Erro ao salvar voucher — verifique os campos" : msg);
    }
  };

  return (
    <>
      <AdminListTable
        title="Vouchers"
        columns={[
          { key: "title", label: "Título", width: "30%" },
          { key: "code", label: "Código", width: "20%" },
          { key: "discount", label: "Desconto", width: "20%" },
          {
            key: "isActive",
            label: "Ativo",
            render: (value) => (value ? "✓" : "-"),
            width: "15%",
          },
        ]}
        data={vouchers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      <AdminFormModal
        title={editingVoucher ? "Editar Voucher" : "Novo Voucher"}
        fields={[
          { name: "placeId", label: "ID do Lugar", type: "number", required: true },
          { name: "title", label: "Título", type: "text", required: true },
          { name: "description", label: "Descrição", type: "textarea" },
          { name: "code", label: "Código", type: "text" },
          { name: "discount", label: "Desconto", type: "text" },
          { name: "image", label: "Imagem", type: "image" },
          { name: "startsAt", label: "Data de Início", type: "date" },
          { name: "endsAt", label: "Data de Término", type: "date" },
          { name: "isActive", label: "Ativo", type: "checkbox" },
        ]}
        initialData={editingVoucher || undefined}
        isOpen={isModalOpen}
        isLoading={createVoucher.isPending || updateVoucher.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
