import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AdminListTable } from "./AdminListTable";
import { AdminFormModal } from "./AdminFormModal";

export function AdminCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { data: categories, isLoading, refetch } = trpc.admin_cms.categories.list.useQuery({} as any);
  const createCategory = trpc.admin_cms.categories.create.useMutation() as any;
  const updateCategory = trpc.admin_cms.categories.update.useMutation() as any;
  const deleteCategory = trpc.admin_cms.categories.delete.useMutation() as any;

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (category: any) => {
    try {
      await deleteCategory.mutateAsync({ id: category.id });
      toast.success("Categoria deletada");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar categoria");
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...data });
        toast.success("Categoria atualizada");
      } else {
        await createCategory.mutateAsync(data as any);
        toast.success("Categoria criada");
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar categoria");
    }
  };

  return (
    <>
      <AdminListTable
        title="Categorias"
        columns={[
          { key: "name", label: "Nome", width: "30%" },
          { key: "slug", label: "Slug", width: "25%" },
          {
            key: "coverImage",
            label: "Banner",
            render: (value) => (value ? "✓" : "-"),
            width: "20%",
          },
          { key: "icon", label: "Ícone", width: "15%" },
        ]}
        data={categories}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      <AdminFormModal
        title={editingCategory ? "Editar Categoria" : "Nova Categoria"}
        fields={[
          { name: "name", label: "Nome", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
          { name: "icon", label: "Ícone", type: "text" },
          { name: "description", label: "Descrição", type: "textarea" },
          { name: "coverImage", label: "Banner do Card", type: "image" },
        ]}
        initialData={editingCategory || undefined}
        isOpen={isModalOpen}
        isLoading={createCategory.isPending || updateCategory.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
