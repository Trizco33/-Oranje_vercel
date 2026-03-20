import { getLoginUrl } from "@/const";
import { CalendarDays, ChevronRight, MapPin, Search, Sparkles, TrendingUp, LogOut, UtensilsCrossed, Pizza, Wine, Coffee, Flower2, Hotel, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { PlaceCardSkeleton } from "@/components/PlaceCardSkeleton";
import { CategoryCardSkeleton } from "@/components/CategoryCardSkeleton";
import { TabBar } from "@/components/TabBar";
import { useAuth } from "@/_core/hooks/useAuth";
import { DSButton, DSBadge } from "@/components/ds";
import { toast } from "sonner";
import { useCategoriesList, usePlacesList, useFavorites } from "@/hooks/useMockData";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  restaurantes: <UtensilsCrossed size={20} />,
  pizzarias: <Pizza size={20} />,
  bares: <Wine size={20} />,
  cafes: <Coffee size={20} />,
  turistico: <Flower2 size={20} />,
  hospedagem: <Hotel size={20} />,
  eventos: <Calendar size={20} />,
};

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    if (!onboardingCompleted && user) {
      navigate("/app/onboarding");
    }
  }, [user, navigate]);

  const { data: categories } = useCategoriesList();
  const { data: featuredPlaces, isLoading: featuredLoading } = usePlacesList({ limit: 6, offset: 0 });
  const { data: recommendedPlaces, isLoading: recommendedLoading } = usePlacesList({ limit: 6, offset: 6 });

  const { favoriteIds, addFavorite, removeFavorite } = useFavorites(!!user);

  function handleToggleFavorite(placeId: number) {
    if (!user) { window.open(getLoginUrl(), '_blank'); return; }
    if (favoriteIds.has(placeId)) {
      removeFavorite(placeId);
    } else {
      addFavorite(placeId);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      // Don't navigate with empty search to prevent "Lugar não encontrado"
      return;
    }
    navigate(`/app/busca?q=${encodeURIComponent(query)}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#00251A" }}>
      <OranjeHeader showSearch hideThemeToggle />

      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          minHeight: 340,
          backgroundImage: "url(/brand/moinho-povos-unidos.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,37,26,0.7) 0%, rgba(0,37,26,0.4) 40%, rgba(0,37,26,0.85) 100%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 10, padding: "64px 20px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ animation: "ds-fade-up 0.6s ease-out" }}>
            <DSBadge variant="accent" size="sm" style={{ marginBottom: 12 }}>
              GUIA CULTURAL
            </DSBadge>
            <h1
              style={{
                fontFamily: "'Montserrat', system-ui, sans-serif",
                fontSize: "clamp(1.75rem, 7vw, 2.5rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                color: "#FFFFFF",
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              Descubra<br />
              <span style={{ color: "#E65100" }}>Holambra</span>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 24 }}>
              A cidade das flores espera por você
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(230,81,0,0.3)",
                  borderRadius: 16,
                  backdropFilter: "blur(12px)",
                }}
              >
                <Search size={18} style={{ color: "#E65100", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Buscar restaurantes, eventos, lugares..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    fontSize: "0.875rem",
                    background: "transparent",
                    outline: "none",
                    border: "none",
                    color: "#FFFFFF",
                    fontFamily: "'Montserrat', system-ui, sans-serif",
                  }}
                />
                {searchQuery && (
                  <DSButton size="sm" onClick={() => {}}>
                    Buscar
                  </DSButton>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── User Status ── */}
      {user && (
        <section style={{ padding: "0 20px", marginTop: 24 }}>
          <div
            style={{
              padding: 16,
              borderRadius: 18,
              background: "rgba(13, 74, 64, 0.35)",
              border: "1px solid rgba(245, 245, 220, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ fontSize: "0.6875rem", color: "rgba(245,245,220,0.55)" }}>Bem-vindo</p>
              <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#FFFFFF" }}>
                {user.email || user.name || "Usuário"}
              </p>
            </div>
            <DSButton
              variant="secondary"
              size="sm"
              iconLeft={<LogOut size={14} />}
              onClick={async () => {
                try {
                  await logout();
                  toast.success("Logout realizado com sucesso");
                  navigate("/app");
                } catch (error) {
                  toast.error("Erro ao fazer logout");
                }
              }}
            >
              Sair
            </DSButton>
          </div>
        </section>
      )}

      {/* ── Categories ── */}
      <section style={{ padding: "0 20px", marginTop: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Montserrat', system-ui, sans-serif", fontSize: 18, fontWeight: 700, color: "#FFFFFF" }}>
            Explorar
          </h2>
          <Link to="/app/explorar" style={{ textDecoration: "none" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, color: "#E65100" }}>
              Ver tudo <ChevronRight size={14} />
            </span>
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, paddingBottom: 8 }}>
          {categories?.slice(0, 8).map(cat => (
            <Link key={cat.id} to={`/app/explorar/${cat.slug}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 6px",
                  borderRadius: 14,
                  background: "rgba(13, 74, 64, 0.35)",
                  border: "1px solid rgba(245, 245, 220, 0.08)",
                  transition: "background 0.2s ease",
                }}
              >
                <div style={{ color: "#E65100" }}>
                  {CATEGORY_ICONS[cat.slug] ?? <ChevronRight size={20} />}
                </div>
                <span style={{ textAlign: "center", lineHeight: 1.3, fontWeight: 500, fontSize: 10, color: "rgba(245,245,220,0.85)" }}>
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Places ── */}
      <section style={{ padding: "0 20px", marginTop: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "'Montserrat', system-ui, sans-serif", fontSize: 18, fontWeight: 700, color: "#FFFFFF" }}>
              Em Destaque
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <div style={{ height: 2, width: 32, borderRadius: 1, background: "linear-gradient(90deg, #E65100, transparent)" }} />
              <span style={{ fontSize: "0.75rem", color: "rgba(245,245,220,0.55)" }}>Parceiros ORANJE</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {featuredPlaces && featuredPlaces.length > 0 ? (
            featuredPlaces.slice(0, 6).map((place: any) => (
              <div key={place.id} style={{ flexShrink: 0, width: 220 }}>
                <PlaceCard
                  place={place}
                  isFavorite={favoriteIds.has(place.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            ))
          ) : (
            [1, 2, 3, 4].map(i => (
              <div key={`skeleton-${i}`} style={{ flexShrink: 0, width: 220 }}>
                <PlaceCardSkeleton />
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Recommended Places ── */}
      {!recommendedPlaces || recommendedLoading ? (
        <section style={{ padding: "0 20px", marginTop: 32 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                style={{ height: 200, borderRadius: 16, background: "rgba(13,74,64,0.35)", animation: "ds-pulse-glow 2s ease-in-out infinite" }}
              />
            ))}
          </div>
        </section>
      ) : recommendedPlaces.length > 0 && (
        <section style={{ padding: "0 20px", marginTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontFamily: "'Montserrat', system-ui, sans-serif", fontSize: 18, fontWeight: 700, color: "#FFFFFF" }}>
                Recomendados
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <div style={{ height: 2, width: 32, borderRadius: 1, background: "linear-gradient(90deg, #E65100, transparent)" }} />
                <span style={{ fontSize: "0.75rem", color: "rgba(245,245,220,0.55)" }}>Curadoria ORANJE</span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {recommendedPlaces.slice(0, 6).map((place: any) => (
              <PlaceCard
                key={place.id}
                place={place}
                isFavorite={favoriteIds.has(place.id)}
                onToggleFavorite={handleToggleFavorite}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Transport CTA ── */}
      <section style={{ padding: "0 20px", marginTop: 32 }}>
        <Link to="/app/transporte" style={{ textDecoration: "none" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              borderRadius: 16,
              background: "linear-gradient(135deg, rgba(13,74,64,0.4), rgba(11,49,41,0.5))",
              border: "1px solid rgba(230,81,0,0.25)",
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
          >
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                Transporte & Transfers
              </h3>
              <p style={{ fontSize: "0.75rem", marginTop: 4, color: "rgba(245,245,220,0.55)" }}>
                Motoristas verificados e parceiros
              </p>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: "rgba(230,81,0,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronRight size={20} style={{ color: "#E65100" }} />
            </div>
          </div>
        </Link>
      </section>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
