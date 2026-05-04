import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AdminListTable } from "./AdminListTable";
import { AdminFormModal } from "./AdminFormModal";

export function AdminRoutes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);

  const { data: routes, isLoading, refetch } = trpc.admin_cms.routes.list.useQuery({} as any);
  const createRoute = trpc.admin_cms.routes.create.useMutation() as any;
  const updateRoute = trpc.admin_cms.routes.update.useMutation() as any;
  const deleteRoute = trpc.admin_cms.routes.delete.useMutation() as any;

  const handleCreate = () => {
    setEditingRoute(null);
    setIsModalOpen(true);
  };

  const handleEdit = (route: any) => {
    setEditingRoute(route);
    setIsModalOpen(true);
  };

  const handleDelete = async (route: any) => {
    try {
      await deleteRoute.mutateAsync({ id: route.id });
      toast.success("Roteiro deletado");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar roteiro");
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Allow-list: só campos do formulário, nada de null/undefined/""
      const FORM_FIELDS = [
        "title", "description", "theme", "duration", "coverImage", "isPublic",
      ] as const;
      const payload: Record<string, any> = {};
      for (const k of FORM_FIELDS) {
        const v = data[k];
        if (v !== undefined && v !== null && v !== "") payload[k] = v;
      }

      if (editingRoute) {
        await updateRoute.mutateAsync({ id: editingRoute.id, ...payload });
        toast.success("Roteiro atualizado");
      } else {
        await createRoute.mutateAsync(payload as any);
        toast.success("Roteiro criado");
      }
      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      console.error("[AdminRoutes] save error:", error);
      const msg = error?.message || error?.shape?.message || "Erro ao salvar roteiro";
      toast.error(msg.length > 120 ? "Erro ao salvar roteiro — verifique os campos" : msg);
    }
  };

  return (
    <>
      <AdminListTable
        title="Roteiros"
        columns={[
          { key: "title", label: "Título", width: "35%" },
          { key: "theme", label: "Tema", width: "20%" },
          { key: "duration", label: "Duração", width: "15%" },
          {
            key: "isPublic",
            label: "Público",
            render: (value) => (value ? "✓" : "-"),
            width: "15%",
          },
        ]}
        data={routes}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      <AdminFormModal
        title={editingRoute ? "Editar Roteiro" : "Novo Roteiro"}
        fields={[
          { name: "title", label: "Título", type: "text", required: true },
          { name: "description", label: "Descrição", type: "textarea" },
          { name: "theme", label: "Tema", type: "text" },
          { name: "duration", label: "Duração", type: "text", placeholder: "ex: 3 horas" },
          { name: "coverImage", label: "Banner", type: "image" },
          { name: "isPublic", label: "Público", type: "checkbox" },
        ]}
        initialData={editingRoute || undefined}
        isOpen={isModalOpen}
        isLoading={createRoute.isPending || updateRoute.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
