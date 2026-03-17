import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ChevronRight, Clock, Map, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DSButton, DSBadge, DSInput } from "@/components/ds";

const ROUTE_THEMES = ["Romântico", "Família", "Gastronômico", "Cultural", "Aventura", "Relaxante"];

export default function Routes() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: publicRoutes } = trpc.routes.public.useQuery();
  const { data: myRoutes } = trpc.routes.mine.useQuery(undefined, { enabled: !!user });
  const createRoute = trpc.routes.create.useMutation();
  const deleteRoute = trpc.routes.delete.useMutation();
  const utils = trpc.useUtils();

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTheme, setNewTheme] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  function handleCreate() {
    if (!newTitle.trim()) { toast.error("Informe um título para o roteiro."); return; }
    createRoute.mutate(
      { title: newTitle, description: newDesc, placeIds: [], theme: newTheme, duration: newDuration, isPublic },
      {
        onSuccess: () => {
          toast.success("Roteiro criado!");
          utils.routes.mine.invalidate();
          setShowCreate(false);
          setNewTitle(""); setNewDesc(""); setNewTheme(""); setNewDuration("");
        },
        onError: () => toast.error("Erro ao criar roteiro."),
      }
    );
  }

  function handleDelete(id: number) {
    deleteRoute.mutate({ id }, {
      onSuccess: () => { toast.success("Roteiro removido."); utils.routes.mine.invalidate(); },
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title="Roteiros" />

      <div className="px-5 pt-5">
        {/* ── Curated Routes ── */}
        {publicRoutes && publicRoutes.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Map size={18} style={{ color: "var(--ds-color-accent)" }} />
              <h2 style={{ fontFamily: "var(--ds-font-display)", fontSize: 16, fontWeight: 700, color: "var(--ds-color-text-primary)" }}>
                Roteiros Curados
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {publicRoutes.map(route => {
                const placeIds: number[] = Array.isArray(route.placeIds) ? route.placeIds : [];
                return (
                  <Link key={route.id} to={`/roteiro/${route.id}`}>
                    <div
                      className="flex items-center gap-4 transition-all duration-200"
                      style={{
                        padding: 16,
                        borderRadius: "var(--ds-radius-xl)",
                        background: "var(--ds-color-bg-surface)",
                        border: "1px solid var(--ds-color-border-default)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ds-color-border-accent)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--ds-color-border-default)"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "var(--ds-radius-lg)",
                          background: "linear-gradient(135deg, var(--ds-color-accent-muted), var(--ds-color-accent-subtle))",
                        }}
                      >
                        <Map size={22} style={{ color: "var(--ds-color-accent)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold line-clamp-1" style={{ color: "var(--ds-color-text-primary)" }}>
                          {route.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          {route.theme && <DSBadge variant="accent" size="sm">{route.theme}</DSBadge>}
                          {route.duration && (
                            <div className="flex items-center gap-1">
                              <Clock size={10} style={{ color: "var(--ds-color-text-muted)" }} />
                              <span className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>{route.duration}</span>
                            </div>
                          )}
                          <span className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>
                            {placeIds.length} lugares
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: "var(--ds-color-accent)" }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── My Routes ── */}
        {user ? (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "var(--ds-font-display)", fontSize: 16, fontWeight: 700, color: "var(--ds-color-text-primary)" }}>
                Meus Roteiros
              </h2>
              <DSButton size="sm" iconLeft={<Plus size={13} />} onClick={() => setShowCreate(true)}>
                Novo
              </DSButton>
            </div>

            {myRoutes && myRoutes.length === 0 ? (
              <div
                className="text-center py-10"
                style={{
                  borderRadius: "var(--ds-radius-xl)",
                  background: "var(--ds-color-bg-surface)",
                  border: "1px solid var(--ds-color-border-default)",
                }}
              >
                <p className="text-3xl mb-2">🗺️</p>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--ds-color-text-primary)" }}>Crie seu primeiro roteiro</p>
                <p className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>Organize seus lugares favoritos em um roteiro personalizado</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myRoutes?.map(route => {
                  const placeIds: number[] = Array.isArray(route.placeIds) ? route.placeIds : [];
                  return (
                    <div
                      key={route.id}
                      className="flex items-center gap-3"
                      style={{
                        padding: 16,
                        borderRadius: "var(--ds-radius-xl)",
                        background: "var(--ds-color-bg-surface)",
                        border: "1px solid var(--ds-color-border-default)",
                      }}
                    >
                      <Link to={`/roteiro/${route.id}`} className="flex-1 flex items-center gap-3 min-w-0">
                        <div
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "var(--ds-radius-lg)",
                            background: "var(--ds-color-accent-muted)",
                          }}
                        >
                          <Map size={18} style={{ color: "var(--ds-color-accent)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold line-clamp-1" style={{ color: "var(--ds-color-text-primary)" }}>
                            {route.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            {route.theme && <DSBadge variant="accent" size="sm">{route.theme}</DSBadge>}
                            <span className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>{placeIds.length} lugares</span>
                            {route.isPublic && <DSBadge variant="success" size="sm">Público</DSBadge>}
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleDelete(route.id)}
                        className="flex items-center justify-center flex-shrink-0 transition-all duration-200"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "var(--ds-radius-lg)",
                          background: "var(--ds-color-bg-surface-hover)",
                        }}
                      >
                        <Trash2 size={14} style={{ color: "var(--ds-color-text-muted)" }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <div
            className="text-center mb-6"
            style={{
              padding: 24,
              borderRadius: "var(--ds-radius-xl)",
              background: "var(--ds-color-bg-surface)",
              border: "1px solid var(--ds-color-border-default)",
            }}
          >
            <p className="text-3xl mb-3">🗺️</p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ds-color-text-primary)", fontFamily: "var(--ds-font-display)", marginBottom: 8 }}>
              Crie seus roteiros
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--ds-color-text-muted)" }}>
              Faça login para criar e salvar roteiros personalizados.
            </p>
            <DSButton onClick={() => window.open(getLoginUrl(), '_blank')}>
              Entrar
            </DSButton>
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div
            className="w-full"
            style={{
              padding: 24,
              borderRadius: "var(--ds-radius-2xl) var(--ds-radius-2xl) 0 0",
              background: "var(--ds-color-bg-elevated)",
              border: "1px solid var(--ds-color-border-default)",
              borderBottom: "none",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--ds-font-display)", color: "var(--ds-color-text-primary)" }}>
                Novo Roteiro
              </h3>
              <button onClick={() => setShowCreate(false)}>
                <X size={20} style={{ color: "var(--ds-color-text-muted)" }} />
              </button>
            </div>

            <div className="space-y-4">
              <DSInput
                label="Título"
                placeholder="Ex: Fim de semana em Holambra"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
              <div>
                <label className="text-xs font-semibold tracking-wide mb-1.5 block" style={{ color: "var(--ds-color-accent)", textTransform: "uppercase" }}>
                  Descrição
                </label>
                <textarea
                  placeholder="Descreva seu roteiro..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 text-sm resize-none outline-none transition-all duration-200"
                  style={{
                    borderRadius: "var(--ds-radius-lg)",
                    background: "var(--ds-color-bg-surface)",
                    border: "1px solid var(--ds-color-border-default)",
                    color: "var(--ds-color-text-primary)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ds-color-border-focus)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ds-color-border-default)")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold tracking-wide mb-1.5 block" style={{ color: "var(--ds-color-accent)", textTransform: "uppercase" }}>
                    Tema
                  </label>
                  <select
                    value={newTheme}
                    onChange={e => setNewTheme(e.target.value)}
                    className="w-full px-3 py-3 text-sm outline-none"
                    style={{
                      borderRadius: "var(--ds-radius-lg)",
                      background: "var(--ds-color-bg-surface)",
                      border: "1px solid var(--ds-color-border-default)",
                      color: "var(--ds-color-text-primary)",
                    }}
                  >
                    <option value="">Selecionar</option>
                    {ROUTE_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <DSInput
                  label="Duração"
                  placeholder="Ex: 1 dia"
                  value={newDuration}
                  onChange={e => setNewDuration(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className="flex items-center transition-all duration-200"
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: "var(--ds-radius-full)",
                    background: isPublic ? "var(--ds-color-accent)" : "var(--ds-color-bg-surface-hover)",
                    padding: 2,
                  }}
                >
                  <div
                    className="bg-white rounded-full transition-all duration-200"
                    style={{
                      width: 20,
                      height: 20,
                      transform: isPublic ? "translateX(20px)" : "translateX(0)",
                    }}
                  />
                </button>
                <span className="text-sm" style={{ color: "var(--ds-color-text-primary)" }}>Tornar público</span>
              </div>

              <DSButton
                fullWidth
                onClick={handleCreate}
                loading={createRoute.isPending}
              >
                Criar Roteiro
              </DSButton>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
