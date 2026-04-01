import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AdminListTable } from "./AdminListTable";
import { AdminFormModal } from "./AdminFormModal";
import { Place } from "../../../drizzle/schema";

const PLACE_FORM_FIELDS = [
  { name: "name", label: "Nome", type: "text" as const, required: true },
  { name: "shortDesc", label: "Descrição Curta", type: "textarea" as const },
  { name: "longDesc", label: "Descrição Longa", type: "textarea" as const },
  { name: "address", label: "Endereço", type: "text" as const },
  { name: "whatsapp", label: "WhatsApp", type: "text" as const, placeholder: "11999999999" },
  { name: "instagram", label: "Instagram", type: "text" as const },
  { name: "website", label: "Website", type: "url" as const },
  { name: "coverImage", label: "Imagem Principal", type: "image" as const },
  { name: "priceRange", label: "Faixa de Preço", type: "text" as const },
  { name: "isFeatured", label: "Em Destaque", type: "checkbox" as const },
  { name: "isRecommended", label: "Recomendado", type: "checkbox" as const },
  { name: "status", label: "Status", type: "select" as const, options: [
    { value: "active", label: "Ativo" },
    { value: "inactive", label: "Inativo" },
  ]},
];

export function AdminPlaces() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<any>(null);

  const { data: places, isLoading: placesLoading, refetch: refetchPlaces } = trpc.places.list.useQuery({ limit: 100, offset: 0 });
  const createPlace = trpc.places.create.useMutation();
  const updatePlace = trpc.places.update.useMutation();
  const deletePlace = trpc.places.delete.useMutation();

  const handleCreate = () => {
    setEditingPlace(null);
    setIsModalOpen(true);
  };

  const handleEdit = (place: any) => {
    setEditingPlace(place);
    setIsModalOpen(true);
  };

  const handleDelete = async (place: any) => {
    try {
      await deletePlace.mutateAsync({ id: place.id });
      toast.success("Lugar deletado com sucesso");
      refetchPlaces();
    } catch (error) {
      toast.error("Erro ao deletar lugar");
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (editingPlace) {
        await updatePlace.mutateAsync({ id: editingPlace.id, ...data });
        toast.success("Lugar atualizado com sucesso");
      } else {
        await createPlace.mutateAsync(data as any);
        toast.success("Lugar criado com sucesso");
      }
      setIsModalOpen(false);
      refetchPlaces();
    } catch (error) {
      toast.error("Erro ao salvar lugar");
    }
  };

  return (
    <>
      <AdminListTable
        title="Lugares"
        columns={[
          { key: "name", label: "Nome", width: "30%" },
          { key: "address", label: "Endereço", width: "40%" },
          {
            key: "status",
            label: "Status",
            render: (value) => (
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: value === "active" ? "rgba(91,217,138,0.2)" : "rgba(255,100,100,0.2)",
                  color: value === "active" ? "#5BD98A" : "#FF6464",
                }}
              >
                {value === "active" ? "Ativo" : "Inativo"}
              </span>
            ),
          },
        ]}
        data={places}
        isLoading={placesLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      <AdminFormModal
        title={editingPlace ? "Editar Lugar" : "Novo Lugar"}
        fields={PLACE_FORM_FIELDS}
        initialData={editingPlace || undefined}
        isOpen={isModalOpen}
        isLoading={createPlace.isPending || updatePlace.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
