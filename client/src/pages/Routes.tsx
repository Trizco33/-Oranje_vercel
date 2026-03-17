import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ChevronRight, Clock, Map, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
    <div className="oranje-app min-h-screen">
      <OranjeHeader title="Roteiros" />

      <div className="px-4 pt-4">
        {/* ── Curated Routes ─────────────────────────────────────────── */}
        {publicRoutes && publicRoutes.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Map size={18} style={{ color: "#D88A3D" }} />
              <h2 className="section-title text-base">Roteiros Curados</h2>
            </div>
            <div className="flex flex-col gap-3">
              {publicRoutes.map(route => {
                const placeIds: number[] = Array.isArray(route.placeIds) ? route.placeIds : [];
                return (
                  <Link key={route.id} to={`/roteiro/${route.id}`}>
                    <div className="glass-card p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, rgba(216,138,61,0.2), rgba(216,138,61,0.1))" }}>
                        <Map size={22} style={{ color: "#D88A3D" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold line-clamp-1" style={{ color: "#E8E6E3" }}>
                          {route.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          {route.theme && (
                            <span className="tag-chip">{route.theme}</span>
                          )}
                          {route.duration && (
                            <div className="flex items-center gap-1">
                              <Clock size={10} style={{ color: "#C8C5C0" }} />
                              <span className="text-xs" style={{ color: "#C8C5C0" }}>{route.duration}</span>
                            </div>
                          )}
                          <span className="text-xs" style={{ color: "#C8C5C0" }}>
                            {placeIds.length} lugares
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: "#D88A3D" }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── My Routes ──────────────────────────────────────────────── */}
        {user ? (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title text-base">Meus Roteiros</h2>
              <button
                onClick={() => setShowCreate(true)}
                className="btn-gold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Plus size={13} /> Novo
              </button>
            </div>

            {myRoutes && myRoutes.length === 0 ? (
              <div className="text-center py-8 glass-card">
                <p className="text-3xl mb-2">🗺️</p>
                <p className="text-sm font-medium mb-1" style={{ color: "#E8E6E3" }}>Crie seu primeiro roteiro</p>
                <p className="text-xs" style={{ color: "#C8C5C0" }}>Organize seus lugares favoritos em um roteiro personalizado</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myRoutes?.map(route => {
                  const placeIds: number[] = Array.isArray(route.placeIds) ? route.placeIds : [];
                  return (
                    <div key={route.id} className="glass-card p-4 flex items-center gap-3">
                      <Link to={`/roteiro/${route.id}`} className="flex-1 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(216,138,61,0.15)" }}>
                          <Map size={18} style={{ color: "#D88A3D" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold line-clamp-1" style={{ color: "#E8E6E3" }}>
                            {route.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            {route.theme && <span className="tag-chip">{route.theme}</span>}
                            <span className="text-xs" style={{ color: "#C8C5C0" }}>{placeIds.length} lugares</span>
                            {route.isPublic && (
                              <span className="text-xs" style={{ color: "#D88A3D" }}>Público</span>
                            )}
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleDelete(route.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(216,138,61,0.08)" }}
                      >
                        <Trash2 size={14} style={{ color: "#C8C5C0" }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <div className="glass-card p-6 text-center mb-6">
            <p className="text-3xl mb-3">🗺️</p>
            <h3 className="text-base font-semibold mb-2" style={{ color: "#E8E6E3", fontFamily: "'Playfair Display', serif" }}>
              Crie seus roteiros
            </h3>
            <p className="text-sm mb-4" style={{ color: "#C8C5C0" }}>
              Faça login para criar e salvar roteiros personalizados.
            </p>
            <a href={getLoginUrl()} className="btn-gold px-5 py-2.5 rounded-xl text-sm inline-block">
              Entrar
            </a>
          </div>
        )}
      </div>

      {/* ── Create Modal ─────────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#162233" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: "#E8E6E3" }}>
                Novo Roteiro
              </h3>
              <button onClick={() => setShowCreate(false)}>
                <X size={20} style={{ color: "#C8C5C0" }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold tracking-wide mb-1 block" style={{ color: "#D88A3D" }}>
                  TÍTULO *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fim de semana em Holambra"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ background: "rgba(216,138,61,0.08)", border: "1px solid rgba(216,138,61,0.2)", color: "#E8E6E3" }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wide mb-1 block" style={{ color: "#D88A3D" }}>
                  DESCRIÇÃO
                </label>
                <textarea
                  placeholder="Descreva seu roteiro..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                  style={{ background: "rgba(216,138,61,0.08)", border: "1px solid rgba(216,138,61,0.2)", color: "#E8E6E3" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold tracking-wide mb-1 block" style={{ color: "#D88A3D" }}>
                    TEMA
                  </label>
                  <select
                    value={newTheme}
                    onChange={e => setNewTheme(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl text-sm"
                    style={{ background: "rgba(216,138,61,0.08)", border: "1px solid rgba(216,138,61,0.2)", color: "#E8E6E3" }}
                  >
                    <option value="">Selecionar</option>
                    {ROUTE_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-wide mb-1 block" style={{ color: "#D88A3D" }}>
                    DURAÇÃO
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 1 dia"
                    value={newDuration}
                    onChange={e => setNewDuration(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl text-sm"
                    style={{ background: "rgba(216,138,61,0.08)", border: "1px solid rgba(216,138,61,0.2)", color: "#E8E6E3" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className="w-10 h-6 rounded-full transition-all flex items-center px-1"
                  style={{ background: isPublic ? "#D88A3D" : "rgba(216,138,61,0.2)" }}
                >
                  <div className="w-4 h-4 rounded-full bg-white transition-all"
                    style={{ transform: isPublic ? "translateX(16px)" : "translateX(0)" }} />
                </button>
                <span className="text-sm" style={{ color: "#E8E6E3" }}>Tornar público</span>
              </div>

              <button
                onClick={handleCreate}
                disabled={createRoute.isPending}
                className="w-full btn-gold py-3 rounded-xl text-sm font-semibold"
              >
                {createRoute.isPending ? "Criando..." : "Criar Roteiro"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-tab" />
      <TabBar />
    </div>
  );
}
