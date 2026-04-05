import { getLoginUrl } from "@/const";
import { CalendarDays, ChevronRight, MapPin, Search, Sparkles, TrendingUp, LogOut, UtensilsCrossed, Pizza, Wine, Coffee, Flower2, Hotel, Calendar, Navigation, Map, ArrowRight, Play } from "lucide-react";
import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAnyReceptivoProgress, type ReceptivoProgress } from "@/lib/receptivoAnalytics";
import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { PlaceCardSkeleton } from "@/components/PlaceCardSkeleton";
import { CategoryCardSkeleton } from "@/components/CategoryCardSkeleton";
import { TabBar } from "@/components/TabBar";
import { useAuth } from "@/_core/hooks/useAuth";
import { DSButton, DSBadge } from "@/components/ds";
import { toast } from "sonner";
import { useCategoriesList, usePlacesList, useFavorites } from "@/hooks/useMockData";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { trpc } from "@/lib/trpc";

const NearbyMap = lazy(() => import("@/components/NearbyMap"));

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
  const [showNearbyMap, setShowNearbyMap] = useState(false);
  const [inProgressJourney, setInProgressJourney] = useState<ReceptivoProgress | null>(null);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    if (!onboardingCompleted && user) {
      navigate("/app/onboarding");
    }
  }, [user, navigate]);

  // Check for any in-progress Receptivo journey
  useEffect(() => {
    const progress = getAnyReceptivoProgress();
    setInProgressJourney(progress);
  }, []);

  const { data: categories } = useCategoriesList();
  const { data: featuredPlaces, isLoading: featuredLoading } = usePlacesList({ limit: 6, offset: 0 });
  const { data: recommendedPlaces, isLoading: recommendedLoading } = usePlacesList({ limit: 6, offset: 6 });

  const { favoriteIds, addFavorite, removeFavorite } = useFavorites(!!user);
  const { position: geoPosition, loading: geoLoading, denied: geoDenied } = useGeolocation();
  const { nearby: nearbyPlaces, isLoading: nearbyLoading } = useNearbyPlaces(geoPosition, 6);
  const { data: appHeroData } = trpc.content.getAppHero.useQuery();

  const heroImageUrl = (() => {
    const url = appHeroData?.imageUrl ?? "";
    return url.startsWith("data:image/") || /^https?:\/\//.test(url) || url.startsWith("/")
      ? url
      : "";
  })();

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
      <OranjeHeader showSearch hideThemeToggle transparentUntilScroll />

      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          minHeight: 340,
          ...(heroImageUrl ? { backgroundImage: `url(${heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center 30%" } : {}),
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
            <Link
              key={cat.id}
              to={`/app/explorar/${cat.slug}`}
              style={{
                textDecoration: "none",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "rgba(230, 81, 0, 0.15)",
                cursor: "pointer",
                display: "block",
              }}
            >
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

      {/* ── Continuar passeio em andamento ── */}
      {inProgressJourney && inProgressJourney.activeIndex > 0 && (
        <section style={{ padding: "0 20px", marginTop: 24 }}>
          <Link
            to={`/app/receptivo/${inProgressJourney.slug}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <div style={{
              borderRadius: 14,
              background: "#E65100",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              boxShadow: "0 2px 12px rgba(230,81,0,0.28)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Play size={16} color="#fff" fill="#fff" />
                </div>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: 700, fontFamily: "Montserrat, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 2px" }}>
                    Passeio em andamento
                  </p>
                  <p style={{ color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: "Montserrat, sans-serif", margin: "0 0 1px" }}>
                    {inProgressJourney.tourName}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Montserrat, sans-serif", margin: 0 }}>
                    Parada {inProgressJourney.activeIndex + 1} de {inProgressJourney.totalStops}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700, fontFamily: "Montserrat, sans-serif" }}>Continuar</span>
                <ArrowRight size={14} color="rgba(255,255,255,0.85)" />
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── Receptivo Oranje ── */}
      <section style={{ padding: "0 20px", marginTop: 32 }}>
        <Link to="/app/receptivo" style={{ textDecoration: "none", display: "block" }}>
          <div
            style={{
              borderRadius: 18,
              overflow: "hidden",
              background: "linear-gradient(135deg, #00251A 0%, #003D2A 50%, #00251A 100%)",
              border: "1px solid rgba(230,81,0,0.25)",
              padding: "20px 20px 20px 20px",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: "radial-gradient(circle at top right, rgba(230,81,0,0.12) 0%, transparent 70%)" }} />
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(230,81,0,0.15)",
                border: "1px solid rgba(230,81,0,0.3)",
                borderRadius: 6,
                padding: "3px 9px",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 800, color: "#E65100", fontFamily: "Montserrat, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Novidade · Receptivo Oranje
              </span>
            </div>
            <h2
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "Montserrat, sans-serif",
                margin: "0 0 6px",
                lineHeight: 1.2,
              }}
            >
              Passeios guiados em Holambra
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 13,
                fontFamily: "Montserrat, sans-serif",
                margin: "0 0 16px",
                lineHeight: 1.5,
              }}
            >
              7 percursos curados com mapa, narrativas e dicas — do romântico ao gastronômico. Venha conferir essa novidade.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={12} color="#E65100" />
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>7 passeios</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <CalendarDays size={12} color="#E65100" />
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>Holambra, SP</span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#E65100",
                  borderRadius: 8,
                  padding: "8px 14px",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                Ver passeios
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* ── Perto de Você ── */}
      <section style={{ marginTop: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Navigation size={16} style={{ color: "#E65100" }} />
              <h2 style={{ fontFamily: "'Montserrat', system-ui, sans-serif", fontSize: 18, fontWeight: 700, color: "#FFFFFF" }}>
                Perto de Você
              </h2>
            </div>
            {geoDenied && !geoLoading && (
              <p style={{ fontSize: "0.7rem", color: "rgba(245,245,220,0.45)" }}>
                Usando centro de Holambra
              </p>
            )}
          </div>
          <button
            onClick={() => setShowNearbyMap(true)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(230,81,0,0.12)", border: "1px solid rgba(230,81,0,0.25)",
              borderRadius: 20, padding: "6px 12px",
              color: "#E65100", fontSize: "0.75rem", fontWeight: 600,
              cursor: "pointer", fontFamily: "'Montserrat', system-ui, sans-serif",
            }}
          >
            <Map size={13} />
            Ver no mapa
          </button>
        </div>

        <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "0 20px 8px", scrollbarWidth: "none" }}>
          {geoLoading || nearbyLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} style={{ flexShrink: 0, width: 200 }}>
                <PlaceCardSkeleton compact />
              </div>
            ))
          ) : nearbyPlaces.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "rgba(245,245,220,0.5)", padding: "8px 0" }}>
              Nenhum lugar com localização disponível.
            </p>
          ) : (
            nearbyPlaces.map((place) => (
              <div key={place.id} style={{ flexShrink: 0, width: 200, position: "relative" }}>
                <PlaceCard
                  place={place as any}
                  compact
                  isFavorite={favoriteIds.has(place.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 48,
                    left: 10,
                    background: "rgba(0,37,26,0.85)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 20,
                    padding: "3px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    border: "1px solid rgba(230,81,0,0.35)",
                  }}
                >
                  <MapPin size={10} style={{ color: "#E65100", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#FFFFFF" }}>
                    {place.distanceFormatted}
                  </span>
                </div>
              </div>
            ))
          )}
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

      {showNearbyMap && (
        <Suspense fallback={null}>
          <NearbyMap onClose={() => setShowNearbyMap(false)} />
        </Suspense>
      )}
    </div>
  );
}
