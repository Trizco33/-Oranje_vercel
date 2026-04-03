import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { TabBar } from "@/components/TabBar";
import { useRouteById } from "@/hooks/useMockData";
import { Clock, Map, Sparkles, ChevronRight, Lightbulb } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DSBadge } from "@/components/ds";

/* ─────────────────────────────────────────────
   Componente de Momento (highlight editorial)
───────────────────────────────────────────── */
function MomentoItem({ index, text }: { index: number; text: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "12px 14px",
        borderRadius: 12,
        background: "rgba(230,81,0,0.04)",
        border: "1px solid rgba(230,81,0,0.08)",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--ds-color-accent)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {index + 1}
      </div>
      <p style={{ color: "var(--ds-color-text-secondary)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
        {text}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Skeleton de loading
───────────────────────────────────────────── */
function RouteDetailSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <div className="p-4 space-y-3" style={{ paddingTop: 80 }}>
        <div className="rounded-2xl animate-pulse" style={{ height: 100, background: "var(--ds-color-bg-secondary)" }} />
        <div className="rounded-2xl animate-pulse" style={{ height: 60, background: "var(--ds-color-bg-secondary)" }} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl animate-pulse" style={{ height: 180, background: "var(--ds-color-bg-secondary)" }} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Componente principal
───────────────────────────────────────────── */
export default function RouteDetail() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: route, isLoading } = useRouteById(Number(params.id));

  if (isLoading) return <RouteDetailSkeleton />;
  if (!route) return null;

  const places = (route as any).places ?? [];
  const highlights: string[] = (route as any).highlights ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title={route.title} showBack onBack={() => navigate("/app/roteiros")} />

      <div className="px-4 pt-4 pb-6">

        {/* ── Hero Card ── */}
        <div
          className="p-4 mb-4 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(230,81,0,0.10) 0%, rgba(230,81,0,0.04) 100%)",
            border: "1px solid rgba(230,81,0,0.14)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "var(--ds-color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Map size={20} style={{ color: "#fff" }} />
            </div>
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontFamily: "var(--ds-font-display)",
                  fontSize: "var(--ds-text-lg)",
                  fontWeight: "var(--ds-font-bold)",
                  color: "var(--ds-color-text-primary)",
                  lineHeight: 1.3,
                  marginBottom: 6,
                }}
              >
                {route.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {route.theme && <DSBadge variant="outline">{route.theme}</DSBadge>}
                {route.duration && (
                  <div className="flex items-center gap-1">
                    <Clock size={11} style={{ color: "var(--ds-color-text-muted)" }} />
                    <span style={{ fontSize: 12, color: "var(--ds-color-text-muted)" }}>{route.duration}</span>
                  </div>
                )}
                {(route as any).distance && (
                  <span style={{ fontSize: 12, color: "var(--ds-color-text-muted)" }}>
                    · {(route as any).distance}
                  </span>
                )}
              </div>
            </div>
          </div>

          {route.description && (
            <p
              style={{
                fontSize: 13,
                color: "var(--ds-color-text-secondary)",
                lineHeight: 1.6,
                marginTop: 12,
              }}
            >
              {route.description}
            </p>
          )}
        </div>

        {/* ── Destaques do Roteiro (highlights como momentos editoriais) ── */}
        {highlights.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} style={{ color: "var(--ds-color-accent)" }} />
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase" as const,
                  color: "var(--ds-color-accent)",
                }}
              >
                Destaques do roteiro
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {highlights.map((h, i) => (
                <MomentoItem key={i} index={i} text={h} />
              ))}
            </div>
          </div>
        )}

        {/* ── Lugares no roteiro ── */}
        {places.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-0.5 w-5 rounded" style={{ background: "linear-gradient(90deg, var(--ds-color-accent), transparent)" }} />
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase" as const,
                  color: "var(--ds-color-accent)",
                }}
              >
                {places.length} {places.length === 1 ? "Lugar" : "Lugares"} neste roteiro
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {places.map((place: any, idx: number) => (
                <div key={place.id} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center flex-shrink-0 mt-2">
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "var(--ds-color-accent)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {idx + 1}
                    </div>
                    {idx < places.length - 1 && (
                      <div
                        style={{
                          width: 1,
                          flex: 1,
                          marginTop: 4,
                          background: "rgba(230,81,0,0.2)",
                          minHeight: 40,
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <PlaceCard place={place} compact />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {places.length === 0 && (
          <div
            className="text-center py-10 rounded-2xl mb-5"
            style={{ background: "rgba(230,81,0,0.04)", border: "1px solid rgba(230,81,0,0.10)" }}
          >
            <p className="text-3xl mb-2">📍</p>
            <p style={{ fontSize: 13, color: "var(--ds-color-text-muted)" }}>
              Este roteiro ainda não tem lugares adicionados.
            </p>
          </div>
        )}

        {/* ── Dica final ── */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{
            background: "rgba(230,81,0,0.06)",
            border: "1px solid rgba(230,81,0,0.12)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={15} style={{ color: "var(--ds-color-accent)" }} />
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ds-color-accent)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
              Dica do Oranje
            </p>
          </div>
          <p style={{ fontSize: 13, color: "var(--ds-color-text-secondary)", lineHeight: 1.6 }}>
            Use o mapa interativo do Oranje para navegar entre os lugares deste roteiro em tempo real. Você evita backtrack e consegue ajustar o percurso no momento.
          </p>
        </div>

        {/* ── CTA Final ── */}
        <Link
          to="/app"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            height: 48,
            background: "var(--ds-color-accent)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            borderRadius: 14,
            textDecoration: "none",
            fontFamily: "var(--ds-font-display)",
          }}
        >
          Explorar no Mapa
          <ChevronRight size={16} />
        </Link>
      </div>

      <TabBar />
    </div>
  );
}
