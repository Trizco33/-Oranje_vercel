import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { useRouteById } from "@/hooks/useMockData";
import { Clock, Map, Sparkles, ChevronRight, Lightbulb, Quote } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DSBadge } from "@/components/ds";
import { getPlaceImage } from "@/components/PlaceCard";
import { getCategoryFallbackImage } from "@/constants/placeImages";
import { useState } from "react";

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
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {index + 1}
      </div>
      <p style={{ color: "var(--ds-color-text-secondary)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
        {text}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Card de lugar com mini-descrição de curadoria
───────────────────────────────────────────── */
function RoutePlace({
  place,
  index,
  total,
  note,
}: {
  place: any;
  index: number;
  total: number;
  note?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const image = imgError
    ? getCategoryFallbackImage(place.categoryName)
    : getPlaceImage(place);

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      {/* Timeline indicator */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
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
          }}
        >
          {index + 1}
        </div>
        {index < total - 1 && (
          <div
            style={{
              width: 1,
              background: "rgba(230,81,0,0.2)",
              flex: 1,
              marginTop: 4,
              minHeight: 40,
            }}
          />
        )}
      </div>

      {/* Place card */}
      <div style={{ flex: 1, marginBottom: index < total - 1 ? 4 : 0 }}>
        <Link
          to={`/app/lugar/${place.id}`}
          style={{ textDecoration: "none" }}
        >
          <div
            className="card-press overflow-hidden"
            style={{
              borderRadius: 14,
              background: "var(--ds-color-bg-elevated)",
              border: "1px solid var(--ds-color-border-default)",
              boxShadow: "var(--ds-shadow-sm)",
            }}
          >
            {/* Imagem */}
            <div style={{ height: 120, position: "relative", overflow: "hidden" }}>
              <img
                src={image}
                alt={place.name}
                className="w-full h-full object-cover card-img-zoom"
                loading="lazy"
                onError={() => setImgError(true)}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,37,26,0.75) 0%, rgba(0,37,26,0.05) 50%, transparent 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 12,
                  right: 12,
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--ds-font-display)",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  {place.name}
                </p>
                {place.categoryName && (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                    {place.categoryName}
                  </p>
                )}
              </div>
            </div>

            {/* Mini-descrição editorial (placeNote) */}
            {note && (
              <div
                style={{
                  padding: "10px 12px",
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                  borderTop: "1px solid rgba(230,81,0,0.08)",
                }}
              >
                <Quote
                  size={12}
                  style={{ color: "var(--ds-color-accent)", flexShrink: 0, marginTop: 2 }}
                />
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-color-text-muted)",
                    lineHeight: 1.55,
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  {note}
                </p>
              </div>
            )}
          </div>
        </Link>
      </div>
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
        <div className="rounded-2xl animate-pulse" style={{ height: 120, background: "var(--ds-color-bg-secondary)" }} />
        <div className="rounded-2xl animate-pulse" style={{ height: 60, background: "var(--ds-color-bg-secondary)" }} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl animate-pulse" style={{ height: 160, background: "var(--ds-color-bg-secondary)" }} />
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
  const placeNotes: Record<string, string> = (route as any).placeNotes ?? {};

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title={route.title} showBack onBack={() => navigate("/app/roteiros")} />

      <div className="px-4 pt-4 pb-6">

        {/* ── Hero Card ── */}
        <div
          className="rounded-2xl overflow-hidden mb-4"
          style={{
            border: "1px solid rgba(230,81,0,0.14)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          {/* Cover image */}
          {(route as any).coverImage && (
            <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
              <img
                src={(route as any).coverImage}
                alt={route.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,37,26,0.9) 0%, rgba(0,37,26,0.3) 60%, transparent 100%)",
                }}
              />
              <div style={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
                <h1
                  style={{
                    fontFamily: "var(--ds-font-display)",
                    fontSize: "var(--ds-text-xl)",
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.2,
                    marginBottom: 8,
                  }}
                >
                  {route.title}
                </h1>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  {route.theme && <DSBadge variant="accent" size="sm">{route.theme}</DSBadge>}
                  {route.duration && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} style={{ color: "rgba(255,255,255,0.6)" }} />
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{route.duration}</span>
                    </div>
                  )}
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    · {places.length} {places.length === 1 ? "lugar" : "lugares"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Without cover: simple header */}
          {!(route as any).coverImage && (
            <div
              style={{
                padding: 16,
                background: "linear-gradient(135deg, rgba(230,81,0,0.08) 0%, rgba(230,81,0,0.03) 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--ds-color-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Map size={18} style={{ color: "#fff" }} />
                </div>
                <h1
                  style={{
                    fontFamily: "var(--ds-font-display)",
                    fontSize: "var(--ds-text-lg)",
                    fontWeight: 700,
                    color: "var(--ds-color-text-primary)",
                    lineHeight: 1.25,
                  }}
                >
                  {route.title}
                </h1>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {route.theme && <DSBadge variant="accent" size="sm">{route.theme}</DSBadge>}
                {route.duration && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={11} style={{ color: "var(--ds-color-text-muted)" }} />
                    <span style={{ fontSize: 12, color: "var(--ds-color-text-muted)" }}>{route.duration}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {route.description && (
            <div style={{ padding: "12px 16px 14px", background: "var(--ds-color-bg-elevated)" }}>
              <p style={{ fontSize: 13, color: "var(--ds-color-text-secondary)", lineHeight: 1.65, margin: 0 }}>
                {route.description}
              </p>
            </div>
          )}
        </div>

        {/* ── Destaques / Momentos ── */}
        {highlights.length > 0 && (
          <div className="mb-5">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Sparkles size={13} style={{ color: "var(--ds-color-accent)" }} />
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
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

        {/* ── Lugares com mini-descrição ── */}
        {places.length > 0 && (
          <div className="mb-5">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div
                style={{
                  height: 2,
                  width: 20,
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
                {places.length} {places.length === 1 ? "Lugar" : "Lugares"} neste roteiro
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {places.map((place: any, idx: number) => (
                <RoutePlace
                  key={place.id}
                  place={place}
                  index={idx}
                  total={places.length}
                  note={placeNotes[String(place.id)]}
                />
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

        {/* ── Dica do Oranje ── */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{
            background: "rgba(230,81,0,0.06)",
            border: "1px solid rgba(230,81,0,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Lightbulb size={14} style={{ color: "var(--ds-color-accent)" }} />
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--ds-color-accent)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
              }}
            >
              Dica do Oranje
            </p>
          </div>
          <p style={{ fontSize: 13, color: "var(--ds-color-text-secondary)", lineHeight: 1.65 }}>
            Use o mapa interativo do Oranje para navegar entre os lugares em tempo real.
            Assim você evita backtrack e ajusta o percurso conforme o dia vai acontecendo.
          </p>
        </div>

        {/* ── CTA Final ── */}
        <Link
          to="/app/mapa"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            height: 50,
            background: "var(--ds-color-accent)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            borderRadius: 14,
            textDecoration: "none",
            fontFamily: "var(--ds-font-display)",
            boxShadow: "0 4px 16px rgba(230,81,0,0.3)",
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
