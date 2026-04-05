import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { usePublicRoutes, useMyRoutes } from "@/hooks/useMockData";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ChevronRight, Clock, Map, Plus, Trash2, X, Star, Utensils, Heart, Users, Landmark, Zap, Waves } from "lucide-react";
import { useState, useMemo, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DSButton, DSBadge, DSInput } from "@/components/ds";

const ROUTE_THEMES = ["Romântico", "Família", "Gastronômico", "Cultural", "Aventura", "Relaxante"];

/* ─── Route Card Visual (para roteiros curados) ────── */
function RouteCard({ route, featured = false }: { route: any; featured?: boolean }) {
  const placeIds: number[] = Array.isArray(route.placeIds) ? route.placeIds : [];
  const hasCover = !!route.coverImage;

  return (
    <Link to={`/app/roteiro/${route.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        className="card-press overflow-hidden"
        style={{
          borderRadius: 16,
          background: "var(--ds-color-bg-elevated)",
          border: featured ? "1.5px solid var(--ds-color-accent)" : "1px solid var(--ds-color-border-default)",
          boxShadow: featured ? "0 4px 20px rgba(230,81,0,0.15)" : "var(--ds-shadow-sm)",
        }}
      >
        {/* Cover image */}
        {hasCover ? (
          <div style={{ position: "relative", height: featured ? 160 : 130, overflow: "hidden" }}>
            <img
              src={route.coverImage}
              alt={route.title}
              className="w-full h-full object-cover card-img-zoom"
              loading="lazy"
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,37,26,0.92) 0%, rgba(0,37,26,0.2) 55%, transparent 100%)",
              }}
            />
            {/* Destaque badge */}
            {featured && (
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "#E65100", color: "#fff",
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                  padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" as const,
                }}>
                  <Star size={9} fill="#fff" />
                  Em Destaque
                </div>
              </div>
            )}
            {/* Overlay meta */}
            <div
              style={{
                position: "absolute",
                bottom: 10,
                left: 12,
                right: 12,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--ds-font-display)",
                    fontWeight: 700,
                    fontSize: featured ? 17 : 15,
                    color: "#fff",
                    lineHeight: 1.2,
                    marginBottom: 4,
                  }}
                >
                  {route.title}
                </p>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  {route.theme && <DSBadge variant="accent" size="sm">{route.theme}</DSBadge>}
                  {route.duration && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Clock size={10} style={{ color: "rgba(255,255,255,0.6)" }} />
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{route.duration}</span>
                    </div>
                  )}
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                    · {placeIds.length} {placeIds.length === 1 ? "lugar" : "lugares"}
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--ds-color-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ChevronRight size={14} color="#fff" />
              </div>
            </div>
          </div>
        ) : (
          /* Fallback sem cover */
          <div
            style={{
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(230,81,0,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Map size={20} style={{ color: "var(--ds-color-accent)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <p
                  style={{
                    fontFamily: "var(--ds-font-display)",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--ds-color-text-primary)",
                    lineHeight: 1.25,
                    margin: 0,
                  }}
                >
                  {route.title}
                </p>
                {featured && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 3,
                    background: "rgba(230,81,0,0.1)", color: "#E65100",
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                    padding: "2px 7px", borderRadius: 20, textTransform: "uppercase" as const, flexShrink: 0,
                  }}>
                    <Star size={8} fill="#E65100" />
                    Destaque
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {route.theme && <DSBadge variant="accent" size="sm">{route.theme}</DSBadge>}
                {route.duration && (
                  <span style={{ fontSize: 11, color: "var(--ds-color-text-muted)" }}>{route.duration}</span>
                )}
                <span style={{ fontSize: 11, color: "var(--ds-color-text-muted)" }}>· {placeIds.length} lugares</span>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: "var(--ds-color-accent)", flexShrink: 0 }} />
          </div>
        )}

        {/* Description snippet (only without cover) */}
        {!hasCover && route.description && (
          <div
            style={{
              padding: "0 14px 12px",
              borderTop: "none",
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "var(--ds-color-text-muted)",
                lineHeight: 1.55,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as any,
                overflow: "hidden",
              }}
            >
              {route.description}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ─── Ícones por tema ─── */
const THEME_ICONS: Record<string, ReactNode> = {
  "Romântico": <Heart size={13} />,
  "Família": <Users size={13} />,
  "Gastronômico": <Utensils size={13} />,
  "Cultural": <Landmark size={13} />,
  "Aventura": <Zap size={13} />,
  "Relaxante": <Waves size={13} />,
};

export default function Routes() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: publicRoutes } = usePublicRoutes();
  const { data: myRoutes, refetch: refetchMyRoutes } = useMyRoutes(!!user);
  const createRouteMutation = trpc.routes.create.useMutation();
  const deleteRouteMutation = trpc.routes.delete.useMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTheme, setNewTheme] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    if (!publicRoutes) return [];
    if (!selectedTheme) return publicRoutes as any[];
    return (publicRoutes as any[]).filter((r: any) =>
      r.theme?.toLowerCase() === selectedTheme.toLowerCase()
    );
  }, [publicRoutes, selectedTheme]);

  const availableThemes = useMemo(() => {
    if (!publicRoutes) return [];
    const set = new Set<string>();
    (publicRoutes as any[]).forEach((r: any) => { if (r.theme) set.add(r.theme); });
    return Array.from(set);
  }, [publicRoutes]);

  function handleCreate() {
    if (!newTitle.trim()) { toast.error("Informe um título para o roteiro."); return; }
    createRouteMutation.mutate(
      { title: newTitle, description: newDesc, placeIds: [], theme: newTheme, duration: newDuration, isPublic },
      {
        onSuccess: () => {
          toast.success("Roteiro criado!");
          setShowCreate(false);
          setNewTitle(""); setNewDesc(""); setNewTheme(""); setNewDuration("");
          refetchMyRoutes();
        },
        onError: () => toast.error("Erro ao criar roteiro."),
      }
    );
  }

  function handleDelete(_id: number) {
    deleteRouteMutation.mutate({ id: _id }, {
      onSuccess: () => {
        toast.success("Roteiro removido.");
        refetchMyRoutes();
      },
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title="Roteiros" />

      <div className="px-4 pt-5 pb-28">

        {/* ── Header editorial ── */}
        <div className="mb-5">
          <h2 style={{
            fontFamily: "var(--ds-font-display)",
            fontSize: 22,
            fontWeight: 800,
            color: "var(--ds-color-text-primary)",
            lineHeight: 1.2,
            marginBottom: 8,
          }}>
            Roteiros para cada jeito de visitar
          </h2>
          <p style={{ fontSize: 13, color: "var(--ds-color-text-muted)", lineHeight: 1.6 }}>
            Curadoria do time Oranje — cada roteiro foi testado, ajustado e organizado para você aproveitar Holambra sem desperdício de tempo.
          </p>
        </div>

        {/* ── Filtros por tema ── */}
        {publicRoutes && publicRoutes.length > 0 && availableThemes.length > 0 && (
          <div
            style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}
            className="hide-scrollbar"
          >
            <button
              onClick={() => setSelectedTheme(null)}
              style={{
                flexShrink: 0,
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 14px", borderRadius: 999,
                fontSize: 12, fontWeight: 600,
                border: selectedTheme === null ? "1.5px solid #E65100" : "1.5px solid var(--ds-color-border-default)",
                background: selectedTheme === null ? "#E65100" : "var(--ds-color-bg-elevated)",
                color: selectedTheme === null ? "#fff" : "var(--ds-color-text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Todos
            </button>
            {availableThemes.map((theme) => {
              const active = selectedTheme === theme;
              return (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(active ? null : theme)}
                  style={{
                    flexShrink: 0,
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 14px", borderRadius: 999,
                    fontSize: 12, fontWeight: 600,
                    border: active ? "1.5px solid #E65100" : "1.5px solid var(--ds-color-border-default)",
                    background: active ? "#E65100" : "var(--ds-color-bg-elevated)",
                    color: active ? "#fff" : "var(--ds-color-text-secondary)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {THEME_ICONS[theme] && <span style={{ display: "flex", alignItems: "center" }}>{THEME_ICONS[theme]}</span>}
                  {theme}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Roteiros Curados ── */}
        {publicRoutes && publicRoutes.length > 0 && (
          <section className="mb-2">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div
                style={{
                  height: 2,
                  width: 16,
                  borderRadius: 2,
                  background: "linear-gradient(90deg, var(--ds-color-accent), transparent)",
                }}
              />
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  color: "var(--ds-color-accent)",
                }}
              >
                {selectedTheme ? `${filteredRoutes.length} roteiro${filteredRoutes.length !== 1 ? "s" : ""} · ${selectedTheme}` : `Curados pelo Oranje · ${publicRoutes.length} no total`}
              </p>
            </div>

            {filteredRoutes.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "32px 20px", borderRadius: 16,
                background: "rgba(230,81,0,0.04)", border: "1px dashed rgba(230,81,0,0.15)",
                marginBottom: 20,
              }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>🗺️</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ds-color-text-primary)", marginBottom: 4 }}>
                  Nenhum roteiro com este tema
                </p>
                <button onClick={() => setSelectedTheme(null)} style={{
                  fontSize: 13, color: "#E65100", fontWeight: 600, background: "none",
                  border: "none", cursor: "pointer", textDecoration: "underline",
                }}>
                  Ver todos os roteiros
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {filteredRoutes.map((route: any, idx: number) => (
                  <RouteCard key={route.id} route={route} featured={!selectedTheme && idx < 2} />
                ))}
              </div>
            )}

            {/* ── Bloco Explore mais Holambra ── */}
            <div style={{
              borderRadius: 16,
              background: "linear-gradient(135deg, #00251A 0%, #003828 100%)",
              padding: "20px 18px",
              marginBottom: 24,
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)",
                marginBottom: 10,
              }}>
                Explore mais Holambra
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { label: "Melhores Restaurantes", href: "/melhores-restaurantes-de-holambra", icon: <Utensils size={14} /> },
                  { label: "Onde Tirar Fotos", href: "/onde-tirar-fotos-em-holambra", icon: <Star size={14} /> },
                  { label: "Mapa Interativo", href: "/app/mapa", icon: <Map size={14} /> },
                  { label: "Holambra Romântica", href: "/holambra-romantica", icon: <Heart size={14} /> },
                ].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                      textDecoration: "none",
                      color: "rgba(255,255,255,0.85)",
                      fontSize: 13, fontWeight: 500,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "#E65100" }}>{item.icon}</span>
                      {item.label}
                    </div>
                    <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Meus Roteiros ── */}
        {user ? (
          <section className="mb-6">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    height: 2,
                    width: 16,
                    borderRadius: 2,
                    background: "linear-gradient(90deg, var(--ds-color-accent), transparent)",
                  }}
                />
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                    color: "var(--ds-color-accent)",
                  }}
                >
                  Meus Roteiros
                </p>
              </div>
              <DSButton size="sm" iconLeft={<Plus size={13} />} onClick={() => setShowCreate(true)}>
                Novo
              </DSButton>
            </div>

            {myRoutes && myRoutes.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 20px",
                  borderRadius: 16,
                  background: "rgba(230,81,0,0.04)",
                  border: "1px dashed rgba(230,81,0,0.15)",
                }}
              >
                <p style={{ fontSize: 28, marginBottom: 8 }}>🗺️</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ds-color-text-primary)", marginBottom: 4 }}>
                  Crie seu primeiro roteiro
                </p>
                <p style={{ fontSize: 12, color: "var(--ds-color-text-muted)" }}>
                  Organize seus lugares favoritos em um roteiro personalizado
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {myRoutes?.map((route: any) => {
                  const placeIds: number[] = Array.isArray(route.placeIds) ? route.placeIds : [];
                  return (
                    <div
                      key={route.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 14,
                        background: "var(--ds-color-bg-elevated)",
                        border: "1px solid var(--ds-color-border-default)",
                      }}
                    >
                      <Link
                        to={`/app/roteiro/${route.id}`}
                        style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0, textDecoration: "none" }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: "rgba(230,81,0,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Map size={17} style={{ color: "var(--ds-color-accent)" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontFamily: "var(--ds-font-display)",
                              fontWeight: 600,
                              fontSize: 14,
                              color: "var(--ds-color-text-primary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {route.title}
                          </p>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3 }}>
                            {route.theme && <DSBadge variant="accent" size="sm">{route.theme}</DSBadge>}
                            <span style={{ fontSize: 11, color: "var(--ds-color-text-muted)" }}>
                              {placeIds.length} {placeIds.length === 1 ? "lugar" : "lugares"}
                            </span>
                            {route.isPublic && <DSBadge variant="success" size="sm">Público</DSBadge>}
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleDelete(route.id)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: "rgba(0,0,0,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={13} style={{ color: "var(--ds-color-text-muted)" }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: 24,
              borderRadius: 16,
              background: "var(--ds-color-bg-elevated)",
              border: "1px solid var(--ds-color-border-default)",
              marginBottom: 24,
            }}
          >
            <p style={{ fontSize: 28, marginBottom: 8 }}>🗺️</p>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--ds-color-text-primary)",
                fontFamily: "var(--ds-font-display)",
                marginBottom: 6,
              }}
            >
              Crie seus roteiros
            </h3>
            <p style={{ fontSize: 13, color: "var(--ds-color-text-muted)", marginBottom: 16 }}>
              Faça login para criar e salvar roteiros personalizados.
            </p>
            <DSButton onClick={() => window.open(getLoginUrl(), "_blank")}>
              Entrar
            </DSButton>
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            background: "rgba(0,0,0,0.7)",
          }}
        >
          <div
            style={{
              width: "100%",
              padding: 24,
              borderRadius: "20px 20px 0 0",
              background: "var(--ds-color-bg-elevated)",
              border: "1px solid var(--ds-color-border-default)",
              borderBottom: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "var(--ds-font-display)",
                  color: "var(--ds-color-text-primary)",
                }}
              >
                Novo Roteiro
              </h3>
              <button onClick={() => setShowCreate(false)}>
                <X size={20} style={{ color: "var(--ds-color-text-muted)" }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <DSInput
                label="Título"
                placeholder="Ex: Fim de semana em Holambra"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <div>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                    color: "var(--ds-color-accent)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Descrição
                </label>
                <textarea
                  placeholder="Descreva seu roteiro..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: 14,
                    resize: "none",
                    outline: "none",
                    borderRadius: 12,
                    background: "var(--ds-color-bg-surface)",
                    border: "1px solid var(--ds-color-border-default)",
                    color: "var(--ds-color-text-primary)",
                    boxSizing: "border-box" as const,
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase" as const,
                      color: "var(--ds-color-accent)",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Tema
                  </label>
                  <select
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: 14,
                      outline: "none",
                      borderRadius: 12,
                      background: "var(--ds-color-bg-surface)",
                      border: "1px solid var(--ds-color-border-default)",
                      color: "var(--ds-color-text-primary)",
                    }}
                  >
                    <option value="">Selecionar</option>
                    {ROUTE_THEMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <DSInput
                  label="Duração"
                  placeholder="Ex: 1 dia"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 999,
                    background: isPublic ? "var(--ds-color-accent)" : "var(--ds-color-bg-surface-hover)",
                    padding: 2,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#fff",
                      transform: isPublic ? "translateX(20px)" : "translateX(0)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>
                <span style={{ fontSize: 14, color: "var(--ds-color-text-primary)" }}>Tornar público</span>
              </div>

              <DSButton fullWidth onClick={handleCreate} loading={createRouteMutation.isPending}>
                Criar Roteiro
              </DSButton>
            </div>
          </div>
        </div>
      )}

      <TabBar />
    </div>
  );
}
