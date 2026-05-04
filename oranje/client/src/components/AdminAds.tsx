import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AdminListTable } from "./AdminListTable";
import { AdminFormModal } from "./AdminFormModal";

export function AdminAds() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);

  const { data: ads, isLoading, refetch } = trpc.admin_cms.ads.list.useQuery({});
  const createAd = trpc.admin_cms.ads.create.useMutation();
  const updateAd = trpc.admin_cms.ads.update.useMutation();
  const deleteAd = trpc.admin_cms.ads.delete.useMutation();

  const handleCreate = () => {
    setEditingAd(null);
    setIsModalOpen(true);
  };

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    setIsModalOpen(true);
  };

  const handleDelete = async (ad: any) => {
    try {
      await deleteAd.mutateAsync({ id: ad.id });
      toast.success("Anúncio deletado");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar anúncio");
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Allow-list: só campos do formulário, nada de null/undefined/""
      const FORM_FIELDS = [
        "title", "description", "imageUrl", "linkUrl",
        "placement", "startsAt", "endsAt", "isActive",
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

      if (editingAd) {
        await updateAd.mutateAsync({ id: editingAd.id, ...payload });
        toast.success("Anúncio atualizado");
      } else {
        await createAd.mutateAsync(payload as any);
        toast.success("Anúncio criado");
      }
      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      console.error("[AdminAds] save error:", error);
      const msg = error?.message || error?.shape?.message || "Erro ao salvar anúncio";
      toast.error(msg.length > 120 ? "Erro ao salvar anúncio — verifique os campos" : msg);
    }
  };

  return (
    <>
      <AdminListTable
        title="Anúncios"
        columns={[
          { key: "title", label: "Título", width: "30%" },
          { key: "placement", label: "Posição", width: "25%" },
          {
            key: "isActive",
            label: "Ativo",
            render: (value) => (value ? "✓" : "-"),
            width: "15%",
          },
          {
            key: "imageUrl",
            label: "Imagem",
            render: (value) => (value ? "✓" : "-"),
            width: "15%",
          },
        ]}
        data={ads}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      <AdminFormModal
        title={editingAd ? "Editar Anúncio" : "Novo Anúncio"}
        fields={[
          { name: "title", label: "Título", type: "text", required: true },
          { name: "description", label: "Descrição", type: "textarea" },
          { name: "imageUrl", label: "Banner", type: "image" },
          { name: "linkUrl", label: "URL do Link", type: "url" },
          {
            name: "placement",
            label: "Posição",
            type: "select",
            required: true,
            options: [
              { value: "footer_banner", label: "Banner Rodapé" },
              { value: "offers_page", label: "Página de Ofertas" },
              { value: "home_banner", label: "Banner Home" },
            ],
          },
          { name: "startsAt", label: "Data de Início", type: "date" },
          { name: "endsAt", label: "Data de Término", type: "date" },
          { name: "isActive", label: "Ativo", type: "checkbox" },
        ]}
        initialData={editingAd || undefined}
        isOpen={isModalOpen}
        isLoading={createAd.isPending || updateAd.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
