import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AdminListTable } from "./AdminListTable";
import { AdminFormModal } from "./AdminFormModal";

function toSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function AdminCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.categories.adminListAll.useQuery();
  const createCategory = trpc.categories.create.useMutation();
  const updateCategory = trpc.categories.update.useMutation();
  const deleteCategory = trpc.categories.delete.useMutation();

  const invalidate = () => utils.categories.adminListAll.invalidate();

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
      invalidate();
    } catch {
      toast.error("Erro ao deletar categoria");
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      const slug = data.slug?.trim() || toSlug(data.name || "");
      const payload = { ...data, slug };

      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...payload });
        toast.success("Categoria atualizada");
      } else {
        await createCategory.mutateAsync({
          name: payload.name,
          slug: payload.slug,
          icon: payload.icon || undefined,
          description: payload.description || undefined,
          coverImage: payload.coverImage || undefined,
        });
        toast.success("Categoria criada — ela já aparece no Explorar e pode ser atribuída a lugares");
      }
      setIsModalOpen(false);
      invalidate();
    } catch (err: any) {
      const msg = err?.message?.includes("Duplicate") ? "Já existe uma categoria com esse slug" : "Erro ao salvar categoria";
      toast.error(msg);
    }
  };

  return (
    <>
      <AdminListTable
        title="Categorias"
        columns={[
          { key: "name",       label: "Nome",   width: "30%" },
          { key: "slug",       label: "Slug",   width: "25%" },
          { key: "icon",       label: "Ícone",  width: "10%" },
          {
            key: "coverImage",
            label: "Banner",
            render: (v) => (v ? <span style={{ color: "#00897B" }}>✓ sim</span> : <span style={{ color: "#9E9E9E" }}>—</span>),
            width: "15%",
          },
          {
            key: "isActive",
            label: "Ativa",
            render: (v) => (v ? <span style={{ color: "#00897B" }}>✓</span> : <span style={{ color: "#F44336" }}>✗</span>),
            width: "10%",
          },
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
          { name: "name",        label: "Nome",                    type: "text",     required: true },
          { name: "slug",        label: "Slug (gerado do nome se vazio)", type: "text", placeholder: "ex: flores-holambra" },
          { name: "icon",        label: "Ícone (emoji)",           type: "text",     placeholder: "🌷" },
          { name: "description", label: "Descrição",               type: "textarea" },
          { name: "coverImage",  label: "Banner do Card",          type: "image" },
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
