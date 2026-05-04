import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AdminListTable } from "./AdminListTable";
import { AdminFormModal } from "./AdminFormModal";
import { ImageUpload } from "./ImageUpload";

export function AdminEvents() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: events, isLoading, refetch } = trpc.events.list.useQuery({});
  const createEvent = trpc.events.create.useMutation();
  const updateEvent = trpc.events.update.useMutation();
  const deleteEvent = trpc.events.delete.useMutation();

  const handleCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (event: any) => {
    try {
      await deleteEvent.mutateAsync({ id: event.id });
      toast.success("Evento deletado");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar evento");
    }
  };



  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Allow-list: só campos do formulário, nada de null/undefined/""
      const FORM_FIELDS = [
        "title", "description", "startsAt", "endsAt", "location",
        "mapsUrl", "price", "isFeatured", "coverImage",
      ] as const;
      const payload: Record<string, any> = {};
      for (const k of FORM_FIELDS) {
        const v = data[k];
        if (v === undefined || v === null || v === "") continue;
        if (k === "startsAt" || k === "endsAt") {
          const d = new Date(v);
          if (!Number.isNaN(d.getTime())) payload[k] = d;
        } else {
          payload[k] = v;
        }
      }

      if (editingEvent) {
        await updateEvent.mutateAsync({ id: editingEvent.id, ...payload });
        toast.success("Evento atualizado");
      } else {
        await createEvent.mutateAsync(payload as any);
        toast.success("Evento criado");
      }
      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      console.error("[AdminEvents] save error:", error);
      const msg = error?.message || error?.shape?.message || "Erro ao salvar evento";
      toast.error(msg.length > 120 ? "Erro ao salvar evento — verifique os campos" : msg);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR");
  };

  return (
    <>
      <AdminListTable
        title="Eventos"
        columns={[
          { key: "title", label: "Título", width: "35%" },
          {
            key: "startsAt",
            label: "Data",
            render: (value) => formatDate(value),
            width: "20%",
          },
          {
            key: "isFeatured",
            label: "Destaque",
            render: (value) => (value ? "✓" : "-"),
            width: "15%",
          },
          {
            key: "coverImage",
            label: "Banner",
            render: (value) => (value ? "✓" : "-"),
            width: "15%",
          },
        ]}
        data={events}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      <AdminFormModal
        title={editingEvent ? "Editar Evento" : "Novo Evento"}
        fields={[
          { name: "title", label: "Título", type: "text", required: true },
          { name: "description", label: "Descrição", type: "textarea" },
          { name: "startsAt", label: "Data de Início", type: "date", required: true },
          { name: "endsAt", label: "Data de Término", type: "date" },
          { name: "location", label: "Local", type: "text" },
          { name: "mapsUrl", label: "URL do Mapa", type: "url" },
          { name: "price", label: "Preço", type: "text" },
          { name: "isFeatured", label: "Em Destaque", type: "checkbox" },
          {
            name: "coverImage",
            label: "Banner",
            type: "image",
          },
        ]}
        initialData={editingEvent || undefined}
        isOpen={isModalOpen}
        isLoading={createEvent.isPending || updateEvent.isPending || uploadingImage}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
