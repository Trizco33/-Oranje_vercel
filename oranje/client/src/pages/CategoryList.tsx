import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { ChevronRight, Navigation, Coffee, Utensils, Camera, Map, Wine, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { getCategorycover, normalizeSlug } from "@/constants/categories";
import coverPontosTuristicos from "../assets/covers/pontos-turisticos.jpg";
import { useCategoriesList } from "@/hooks/useMockData";

const CARD_COVER_OVERRIDE: Record<string, string> = {
  "pontos-turisticos": coverPontosTuristicos,
};

/* Links rápidos de categoria */
const QUICK_LINKS = [
  { label: "Cafés", icon: Coffee, href: "/app/explorar/cafes" },
  { label: "Restaurantes", icon: Utensils, href: "/app/explorar/restaurantes" },
  { label: "Fotos", icon: Camera, href: "/app/explorar/pontos-turisticos" },
  { label: "Roteiros", icon: Map, href: "/app/roteiros" },
  { label: "Bares", icon: Wine, href: "/app/explorar/bares-e-drinks" },
  { label: "Parques", icon: Star, href: "/app/explorar/parques-e-atracoes" },
];

export default function CategoryList() {
  const { data: categories } = useCategoriesList();

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title="Explorar" showSearch />

      <div style={{ paddingTop: 16 }}>

        {/* ── Perto de você ── */}
        <div className="px-4 mb-4">
          <Link to="/app/mapa" style={{ textDecoration: "none" }}>
            <div
              className="card-press"
              style={{
                borderRadius: 16,
                background: "linear-gradient(135deg, #00251A 0%, #013d29 100%)",
                border: "1px solid rgba(230,81,0,0.18)",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Orb de fundo */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(230,81,0,0.25) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "var(--ds-color-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Navigation size={20} style={{ color: "#fff" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#fff", fontFamily: "var(--ds-font-display)", lineHeight: 1.2 }}>
                  Perto de você
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2, lineHeight: 1.3 }}>
                  Veja lugares abertos agora no mapa
                </p>
              </div>
              <ChevronRight size={18} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
            </div>
          </Link>
        </div>

        {/* ── Acesso rápido ── */}
        <div className="mb-5">
          <div className="px-4 mb-3">
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--ds-color-accent)",
              }}
            >
              Acesso rápido
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingLeft: 16,
              paddingRight: 16,
              paddingBottom: 4,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
            {QUICK_LINKS.map((item) => (
              <Link key={item.href} to={item.href} style={{ textDecoration: "none", flexShrink: 0 }}>
                <div
                  className="card-press"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: "var(--ds-color-bg-elevated)",
                    border: "1px solid var(--ds-color-border-default)",
                    minWidth: 68,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(230,81,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <item.icon size={16} style={{ color: "var(--ds-color-accent)" }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-color-text-secondary)", whiteSpace: "nowrap" }}>
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Todas as categorias ── */}
        <div className="px-4 mb-3">
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ds-color-accent)",
            }}
          >
            Todas as categorias
          </p>
        </div>

        <div className="px-4 flex flex-col gap-3">
          {categories?.map(cat => {
            const normalizedSlug = normalizeSlug(cat.slug) || cat.slug;
            return (
              <Link key={cat.id} to={`/app/explorar/${normalizedSlug}`}>
                <div
                  className="card-press relative overflow-hidden cursor-pointer"
                  style={{
                    height: 108,
                    borderRadius: "var(--ds-radius-xl)",
                    border: "1px solid var(--ds-color-border-default)",
                    boxShadow: "var(--ds-shadow-sm)",
                  }}
                >
                  <img
                    src={CARD_COVER_OVERRIDE[cat.slug] || cat.coverImage || getCategorycover(cat.slug)}
                    alt={cat.name}
                    className="card-img-zoom w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getCategorycover('restaurantes');
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to right, rgba(0,37,26,0.88) 0%, rgba(0,37,26,0.4) 60%, transparent 100%)" }}
                  />
                  <div className="absolute inset-0 flex items-center px-5 gap-4">
                    <div>
                      <h3
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: "var(--ds-color-text-primary)",
                          fontFamily: "var(--ds-font-display)",
                        }}
                      >
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-xs mt-1 line-clamp-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "var(--ds-radius-full)",
                        background: "rgba(230,81,0,0.15)",
                      }}
                    >
                      <ChevronRight size={16} style={{ color: "var(--ds-color-accent)" }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
