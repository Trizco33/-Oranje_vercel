import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AdminListTable } from "./AdminListTable";
import { AdminFormModal } from "./AdminFormModal";
import { PlacePinEditor } from "./PlacePinEditor";
import { GripVertical, MapPin } from "lucide-react";
import type { Place } from "../../../drizzle/schema";

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

type ShowcaseFilter = "all" | "featured" | "recommended";

export function AdminPlaces() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<any>(null);
  const [pinEditorPlace, setPinEditorPlace] = useState<any>(null);
  const [showSuspectOnly, setShowSuspectOnly] = useState(false);
  const [showcaseFilter, setShowcaseFilter] = useState<ShowcaseFilter>("all");

  const utils = trpc.useUtils();
  const { data: places, isLoading: placesLoading } = trpc.places.list.useQuery({ limit: 200, offset: 0 });

  // Lista ordenada pela vitrine selecionada (apenas quando filtrando).
  const showcaseField: "featured" | "recommended" | null =
    showcaseFilter === "featured" ? "featured" :
    showcaseFilter === "recommended" ? "recommended" : null;
  // Limite alto: a vitrine "Em Destaque"/"Recomendados" precisa ser ordenável
  // por inteiro, sem paginação truncar o set.
  const showcaseOrderQuery = trpc.places.list.useQuery(
    {
      limit: 1000,
      offset: 0,
      isFeatured: showcaseField === "featured" ? true : undefined,
      isRecommended: showcaseField === "recommended" ? true : undefined,
      orderBy: showcaseField ?? undefined,
    },
    { enabled: showcaseField !== null }
  );

  const { data: allCategories = [] } = trpc.categories.adminListAll.useQuery();
  const createPlace = trpc.places.create.useMutation();
  const updatePlace = trpc.places.update.useMutation();
  const deletePlace = trpc.places.delete.useMutation();
  const reorderPlaces = trpc.places.reorder.useMutation();

  const invalidatePlaces = () => {
    utils.places.list.invalidate();
  };

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

  const filteredPlaces = useMemo(() => {
    const base = places ?? [];
    if (!showSuspectOnly) return base;
    return base.filter((p: any) =>
      p.geoStatus === "suspect" || p.geoStatus === "needs_review" || p.geoStatus === "out_of_bounds"
    );
  }, [places, showSuspectOnly]);

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

      {/* Filtro Showcase: Em Destaque / Recomendados → habilita reordenação */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 12, color: "var(--admin-text-muted, #718096)", fontWeight: 600 }}>
          Vitrine:
        </span>
        {([
          { value: "all",         label: "Todos" },
          { value: "featured",    label: "Em Destaque" },
          { value: "recommended", label: "Recomendados" },
        ] as { value: ShowcaseFilter; label: string }[]).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setShowcaseFilter(value)}
            style={{
              padding: "4px 12px",
              borderRadius: 999,
              border: "1px solid",
              borderColor: showcaseFilter === value ? "#E65100" : "rgba(0,37,26,0.15)",
              background: showcaseFilter === value ? "rgba(230,81,0,0.12)" : "transparent",
              color: showcaseFilter === value ? "#E65100" : "var(--admin-text-primary, #1A1A1A)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
        {showcaseFilter !== "all" && (
          <span style={{ fontSize: 11, color: "var(--admin-text-muted, #718096)", marginLeft: 4 }}>
            Arraste pelo handle para reordenar.
          </span>
        )}
      </div>

      {showcaseFilter === "all" ? (
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
      ) : showcaseField !== null ? (
        <ShowcaseReorderTable
          field={showcaseField}
          places={showcaseOrderQuery.data ?? []}
          isLoading={showcaseOrderQuery.isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onPinEdit={setPinEditorPlace}
          onPersist={async (orderedIds) => {
            try {
              await reorderPlaces.mutateAsync({ field: showcaseField, orderedIds });
              toast.success("Ordem atualizada");
              await utils.places.list.invalidate();
            } catch (e: any) {
              console.error("[AdminPlaces] Erro ao reordenar:", e);
              toast.error(e?.message ?? "Erro ao salvar nova ordem");
              // Refetch para reverter o reorder otimista no cliente.
              await utils.places.list.invalidate();
            }
          }}
        />
      ) : null}

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

type ShowcaseReorderTableProps = {
  field: "featured" | "recommended";
  places: Place[];
  isLoading: boolean;
  onEdit: (p: Place) => void;
  onDelete: (p: Place) => void;
  onCreate: () => void;
  onPinEdit: (p: Place) => void;
  onPersist: (orderedIds: number[]) => Promise<void>;
};

function ShowcaseReorderTable(props: ShowcaseReorderTableProps) {
  const { field, places, isLoading, onEdit, onDelete, onCreate, onPinEdit, onPersist } = props;
  const [items, setItems] = useState<Place[]>(places);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  useEffect(() => {
    setItems(places);
  }, [places]);

  const fieldLabel = field === "featured" ? "Em Destaque" : "Recomendados";

  function handleDragStart(e: React.DragEvent, id: number) {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(id)); } catch {}
  }

  function handleDragOver(e: React.DragEvent, id: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overId !== id) setOverId(id);
  }

  function handleDrop(e: React.DragEvent, targetId: number) {
    e.preventDefault();
    if (dragId === null || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const fromIdx = items.findIndex((p) => p.id === dragId);
    const toIdx = items.findIndex((p) => p.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = items.slice();
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setItems(next);
    setDragId(null);
    setOverId(null);
    onPersist(next.map((p) => p.id));
  }

  function handleDragEnd() {
    setDragId(null);
    setOverId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "var(--admin-text-primary, #1A1A1A)",
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}>
          Lugares · {fieldLabel}
        </h2>
        <button onClick={onCreate} className="admin-btn-primary">
          + Novo
        </button>
      </div>

      {isLoading ? (
        <div className="admin-card" style={{ padding: 32, textAlign: "center" }}>
          <span style={{ color: "var(--admin-text-muted, #718096)", fontSize: 13 }}>Carregando…</span>
        </div>
      ) : items.length === 0 ? (
        <div className="admin-card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ color: "var(--admin-text-muted, #718096)", fontSize: 13 }}>
            Nenhum lugar marcado como {fieldLabel.toLowerCase()}. Marque a flag em "Editar" no modo "Todos".
          </p>
        </div>
      ) : (
        <div className="admin-card" style={{ overflow: "hidden" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "32px 48px 1fr 200px",
            padding: "10px 16px",
            borderBottom: "1px solid var(--admin-border, rgba(0,37,26,0.08))",
            color: "var(--admin-text-muted, #718096)",
            fontWeight: 600,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}>
            <span />
            <span>#</span>
            <span>Nome</span>
            <span>Ações</span>
          </div>

          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {items.map((p, idx) => {
              const isDragging = dragId === p.id;
              const isTarget = overId === p.id && dragId !== null && dragId !== p.id;
              return (
                <li
                  key={p.id}
                  onDragOver={(e) => handleDragOver(e, p.id)}
                  onDrop={(e) => handleDrop(e, p.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 48px 1fr 200px",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--admin-border-light, rgba(0,37,26,0.05))",
                    background: isTarget
                      ? "rgba(230,81,0,0.08)"
                      : isDragging
                        ? "rgba(0,137,123,0.06)"
                        : "transparent",
                    opacity: isDragging ? 0.5 : 1,
                    transition: "background 0.15s ease, opacity 0.15s ease",
                  }}
                >
                  <span
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.id)}
                    onDragEnd={handleDragEnd}
                    title="Arraste para reordenar"
                    style={{
                      cursor: "grab",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--admin-text-muted, #718096)",
                      userSelect: "none",
                    }}
                  >
                    <GripVertical size={16} />
                  </span>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--admin-text-muted, #718096)",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{
                    fontSize: 14,
                    color: "var(--admin-text-primary, #1A1A1A)",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {p.name}
                  </span>
                  <span style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => onPinEdit(p)}
                      title="Ajustar Pin Manualmente"
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        border: "1px solid rgba(0,37,26,0.08)",
                        background: "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 36,
                        minHeight: 36,
                      }}
                    >
                      <MapPin size={14} style={{ color: p.geoSource === "manual" ? "#00897B" : "#9E9E9E" }} />
                    </button>
                    <button
                      onClick={() => onEdit(p)}
                      title="Editar"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(0,37,26,0.08)",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#E65100",
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Tem certeza que deseja deletar este item?")) onDelete(p);
                      }}
                      title="Deletar"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(0,37,26,0.08)",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#F87171",
                      }}
                    >
                      Deletar
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
