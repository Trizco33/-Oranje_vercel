import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AdminListTable } from "./AdminListTable";
import { AdminFormModal } from "./AdminFormModal";
import { PlacePinEditor } from "./PlacePinEditor";
import { Place } from "../../../drizzle/schema";
import { MapPin } from "lucide-react";

const GEO_STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  ok:            { label: "OK",          bg: "rgba(91,217,138,0.15)",  color: "#5BD98A" },
  suspect:       { label: "Suspeito",    bg: "rgba(255,152,0,0.15)",   color: "#FF9800" },
  out_of_bounds: { label: "Fora da área",bg: "rgba(244,67,54,0.15)",   color: "#F44336" },
  unverified:    { label: "Não verif.",  bg: "rgba(150,150,150,0.15)", color: "#9E9E9E" },
  needs_review:  { label: "Revisar",     bg: "rgba(33,150,243,0.15)",  color: "#2196F3" },
};

const GEO_SOURCE_ICON: Record<string, string> = {
  manual:        "📍",
  osm_verified:  "🗺️",
  maps_verified: "🌍",
  auto:          "",
};

function GeoStatusBadge({ status, source }: { status?: string | null; source?: string | null }) {
  const cfg = GEO_STATUS_CONFIG[status ?? "unverified"] ?? GEO_STATUS_CONFIG.unverified;
  const icon = GEO_SOURCE_ICON[source ?? "auto"] ?? "";
  return (
    <span style={{
      padding: "3px 7px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 600,
      backgroundColor: cfg.bg,
      color: cfg.color,
      whiteSpace: "nowrap",
    }}>
      {icon && <span style={{ marginRight: "3px" }}>{icon}</span>}
      {cfg.label}
    </span>
  );
}

const BASE_PLACE_FORM_FIELDS = [
  { name: "name", label: "Nome", type: "text" as const, required: true },
  { name: "shortDesc", label: "Descrição Curta", type: "textarea" as const },
  { name: "longDesc", label: "Descrição Longa", type: "textarea" as const },
  { name: "address", label: "Endereço", type: "text" as const },
  { name: "openingHours", label: "Horário de Funcionamento", type: "text" as const, placeholder: "Seg–Sex 9h–18h" },
  { name: "lat", label: "Latitude", type: "text" as const, placeholder: "-22.6333" },
  { name: "lng", label: "Longitude", type: "text" as const, placeholder: "-47.0520" },
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
  const [pinEditorPlace, setPinEditorPlace] = useState<any>(null);
  const [showSuspectOnly, setShowSuspectOnly] = useState(false);

  const utils = trpc.useUtils();
  const { data: places, isLoading: placesLoading } = trpc.places.list.useQuery({ limit: 200, offset: 0 });
  const { data: allCategories = [] } = trpc.categories.adminListAll.useQuery();
  const createPlace = trpc.places.create.useMutation();
  const updatePlace = trpc.places.update.useMutation();
  const deletePlace = trpc.places.delete.useMutation();

  const invalidatePlaces = () => utils.places.list.invalidate();

  // Campos do formulário com seletor de categoria dinâmico
  const PLACE_FORM_FIELDS = [
    {
      name: "categoryId",
      label: "Categoria",
      type: "select" as const,
      options: [
        { value: "", label: "— Sem categoria —" },
        ...allCategories.map((c: any) => ({ value: c.id, label: c.name })),
      ],
    },
    ...BASE_PLACE_FORM_FIELDS,
  ];

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
      invalidatePlaces();
    } catch (error) {
      toast.error("Erro ao deletar lugar");
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // ⚠️  IMPORTANTE: só enviar os campos do FORMULÁRIO, nunca espalhar
      // o `editingPlace` inteiro — campos do banco como tags/images/geoStatus
      // podem vir null e quebrar a validação Zod do backend silenciosamente.
      const FORM_FIELDS = [
        "categoryId", "name", "shortDesc", "longDesc", "address", "openingHours",
        "lat", "lng", "whatsapp", "instagram", "website", "coverImage",
        "priceRange", "isFeatured", "isRecommended",
      ];
      const parsed: Record<string, any> = {};
      for (const key of FORM_FIELDS) {
        const v = data[key];
        if (v === undefined || v === null || v === "") continue;
        if (key === "lat" || key === "lng") {
          const n = parseFloat(String(v));
          if (!Number.isNaN(n)) parsed[key] = n;
        } else if (key === "categoryId") {
          const n = parseInt(String(v), 10);
          if (!Number.isNaN(n)) parsed[key] = n;
        } else {
          parsed[key] = v;
        }
      }

      if (editingPlace) {
        await updatePlace.mutateAsync({ id: editingPlace.id, ...parsed });
        const isManual = editingPlace.geoSource === "manual";
        toast.success(isManual
          ? "Lugar atualizado — pin manual preservado"
          : "Lugar atualizado com sucesso"
        );
      } else {
        await createPlace.mutateAsync(parsed as any);
        toast.success("Lugar criado com sucesso");
      }
      setIsModalOpen(false);
      await invalidatePlaces();
    } catch (error: any) {
      console.error("[AdminPlaces] Erro ao salvar:", error);
      const msg = error?.message || error?.shape?.message || "Erro ao salvar lugar";
      toast.error(msg.length > 120 ? "Erro ao salvar lugar — verifique os campos" : msg);
    }
  };

  const filteredPlaces = showSuspectOnly
    ? (places ?? []).filter((p: any) => p.geoStatus === "suspect" || p.geoStatus === "needs_review" || p.geoStatus === "out_of_bounds")
    : places;

  const suspectCount = (places ?? []).filter(
    (p: any) => p.geoStatus === "suspect" || p.geoStatus === "needs_review" || p.geoStatus === "out_of_bounds"
  ).length;

  const manualCount = (places ?? []).filter((p: any) => (p as any).geoSource === "manual").length;

  return (
    <>
      {/* Banner suspeitos */}
      {suspectCount > 0 && (
        <div style={{
          background: "rgba(255,152,0,0.1)",
          border: "1px solid rgba(255,152,0,0.3)",
          borderRadius: "8px",
          padding: "10px 16px",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}>
          <span style={{ color: "#FF9800", fontSize: "13px" }}>
            ⚠️ {suspectCount} lugar(es) com coordenadas suspeitas ou não verificadas
            {manualCount > 0 && (
              <span style={{ color: "#00897B", marginLeft: "12px" }}>
                📍 {manualCount} com pin manual verificado
              </span>
            )}
          </span>
          <button
            onClick={() => setShowSuspectOnly(!showSuspectOnly)}
            style={{
              background: showSuspectOnly ? "#FF9800" : "transparent",
              border: "1px solid #FF9800",
              borderRadius: "4px",
              color: showSuspectOnly ? "#fff" : "#FF9800",
              padding: "4px 10px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {showSuspectOnly ? "Mostrar todos" : "Filtrar suspeitos"}
          </button>
        </div>
      )}

      <AdminListTable
        title="Lugares"
        columns={[
          { key: "name", label: "Nome", width: "26%" },
          { key: "address", label: "Endereço", width: "30%" },
          {
            key: "geoStatus",
            label: "Geo",
            width: "12%",
            render: (value, item) => <GeoStatusBadge status={value} source={(item as any).geoSource} />,
          },
          {
            key: "status",
            label: "Status",
            width: "10%",
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
        data={filteredPlaces}
        isLoading={placesLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        extraRowActions={(place: any) => (
          <button
            onClick={() => setPinEditorPlace(place)}
            title="Ajustar Pin Manualmente"
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid",
              borderColor: place.geoSource === "manual"
                ? "rgba(0,137,123,0.4)"
                : "rgba(0,37,26,0.08)",
              background: place.geoSource === "manual"
                ? "rgba(0,137,123,0.08)"
                : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "36px",
              minHeight: "36px",
            }}
          >
            <MapPin
              size={14}
              style={{ color: place.geoSource === "manual" ? "#00897B" : "#9E9E9E" }}
            />
          </button>
        )}
      />

      {/* Modal de edição padrão */}
      <AdminFormModal
        title={editingPlace ? "Editar Lugar" : "Novo Lugar"}
        fields={PLACE_FORM_FIELDS}
        initialData={editingPlace ? {
          ...editingPlace,
          lat: editingPlace.lat?.toString(),
          lng: editingPlace.lng?.toString(),
        } : undefined}
        isOpen={isModalOpen}
        isLoading={createPlace.isPending || updatePlace.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Editor de Pin Manual */}
      {pinEditorPlace && (
        <PlacePinEditor
          place={pinEditorPlace}
          onClose={() => setPinEditorPlace(null)}
          onSaved={() => {
            invalidatePlaces();
            setPinEditorPlace(null);
          }}
        />
      )}
    </>
  );
}
