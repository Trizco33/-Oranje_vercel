import { trpc } from "@/lib/trpc";
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

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: featuredPlaces, error: featuredError, isLoading: featuredLoading } = trpc.places.list.useQuery({ limit: 6, offset: 0 });
  const { data: recommendedPlaces, error: recommendedError, isLoading: recommendedLoading } = trpc.places.list.useQuery({ limit: 6, offset: 6 });

  const { data: userFavs } = trpc.favorites.list.useQuery(undefined, { enabled: !!user });
  const addFav = trpc.favorites.add.useMutation();
  const removeFav = trpc.favorites.remove.useMutation();
  const utils = trpc.useUtils();

  const favoriteIds = new Set(userFavs?.map(f => f.placeId) ?? []);

  function handleToggleFavorite(placeId: number) {
    if (!user) { window.open(getLoginUrl(), '_blank'); return; }
    if (favoriteIds.has(placeId)) {
      removeFav.mutate({ placeId }, { onSuccess: () => utils.favorites.list.invalidate() });
    } else {
      addFav.mutate({ placeId }, { onSuccess: () => utils.favorites.list.invalidate() });
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/app/busca?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader showSearch hideThemeToggle />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: 380,
          backgroundImage: "url(/brand/moinho-povos-unidos.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,37,26,0.88) 0%, rgba(0,37,26,0.5) 50%, rgba(0,37,26,0.95) 100%)",
          }}
        />
        <div className="relative z-10 px-5 pt-16 pb-10 flex flex-col justify-center h-full">
          <div style={{ animation: "ds-fade-up 0.6s ease-out" }}>
            <DSBadge variant="accent" size="sm" style={{ marginBottom: 12 }}>
              GUIA CULTURAL
            </DSBadge>
            <h1
              style={{
                fontFamily: "var(--ds-font-display)",
                fontSize: "clamp(2rem, 8vw, 2.8rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                color: "var(--ds-color-text-primary)",
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              Descubra<br />
              <span style={{ color: "var(--ds-color-accent)" }}>Holambra</span>
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "var(--ds-color-text-secondary)",
                opacity: 0.85,
                marginBottom: 24,
              }}
            >
              A cidade das flores espera por você
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch}>
              <div
                className="flex items-center gap-3"
                style={{
                  padding: "12px 16px",
                  background: "rgba(0,37,26,0.6)",
                  border: "1px solid var(--ds-color-border-accent)",
                  borderRadius: "var(--ds-radius-xl)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Search size={18} style={{ color: "var(--ds-color-accent)", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Buscar restaurantes, eventos, lugares..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 text-sm bg-transparent outline-none"
                  style={{ color: "var(--ds-color-text-primary)" }}
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
        <section className="px-5 mt-6">
          <div
            className="flex items-center justify-between"
            style={{
              padding: 16,
              borderRadius: "var(--ds-radius-xl)",
              background: "var(--ds-color-bg-surface)",
              border: "1px solid var(--ds-color-border-default)",
            }}
          >
            <div>
              <p className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>Bem-vindo</p>
              <p className="text-sm font-medium" style={{ color: "var(--ds-color-text-primary)" }}>
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
      <section className="px-5 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: "var(--ds-font-display)", fontSize: 18, fontWeight: 700, color: "var(--ds-color-text-primary)" }}>
            Explorar
          </h2>
          <Link to="/app/explorar">
            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--ds-color-accent)" }}>
              Ver tudo <ChevronRight size={14} />
            </span>
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {categories?.map(cat => (
            <Link key={cat.id} to={`/app/explorar/${cat.slug}`}>
              <div
                className="flex-shrink-0 flex flex-col items-center gap-2 transition-all duration-200"
                style={{
                  minWidth: 80,
                  padding: "12px 8px",
                  borderRadius: "var(--ds-radius-xl)",
                  background: "var(--ds-color-bg-surface)",
                  border: "1px solid var(--ds-color-border-default)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--ds-color-border-accent)";
                  e.currentTarget.style.background = "var(--ds-color-accent-subtle)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--ds-color-border-default)";
                  e.currentTarget.style.background = "var(--ds-color-bg-surface)";
                }}
              >
                <div style={{ color: "var(--ds-color-accent)" }}>
                  {CATEGORY_ICONS[cat.slug] ?? <ChevronRight size={20} />}
                </div>
                <span
                  className="text-center leading-tight font-medium"
                  style={{ fontSize: 11, color: "var(--ds-color-text-secondary)" }}
                >
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Places ── */}
      {featuredError ? (
        <section className="px-5 mt-8">
          <p className="text-xs" style={{ color: "var(--ds-color-error)" }}>Erro ao carregar destaques</p>
        </section>
      ) : (
        <section className="px-5 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 style={{ fontFamily: "var(--ds-font-display)", fontSize: 18, fontWeight: 700, color: "var(--ds-color-text-primary)" }}>
                Em Destaque
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-0.5 w-8 rounded" style={{ background: "linear-gradient(90deg, var(--ds-color-accent), transparent)" }} />
                <span className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>Parceiros ORANJE</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {featuredPlaces && featuredPlaces.length > 0 ? (
              featuredPlaces.slice(0, 6).map((place: any) => (
                <div key={place.id} className="flex-shrink-0" style={{ width: 220 }}>
                  <PlaceCard
                    place={place}
                    isFavorite={favoriteIds.has(place.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              ))
            ) : (
              [1, 2, 3, 4].map(i => (
                <div key={`skeleton-${i}`} className="flex-shrink-0" style={{ width: 220 }}>
                  <PlaceCardSkeleton />
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ── Recommended Places ── */}
      {recommendedError ? (
        <section className="px-5 mt-8">
          <p className="text-xs" style={{ color: "var(--ds-color-error)" }}>Erro ao carregar recomendados</p>
        </section>
      ) : !recommendedPlaces || recommendedLoading ? (
        <section className="px-5 mt-8">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="rounded-2xl"
                style={{ height: 200, background: "var(--ds-color-bg-surface)", animation: "ds-pulse-glow 2s ease-in-out infinite" }}
              />
            ))}
          </div>
        </section>
      ) : recommendedPlaces.length > 0 && (
        <section className="px-5 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 style={{ fontFamily: "var(--ds-font-display)", fontSize: 18, fontWeight: 700, color: "var(--ds-color-text-primary)" }}>
                Recomendados
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-0.5 w-8 rounded" style={{ background: "linear-gradient(90deg, var(--ds-color-accent), transparent)" }} />
                <span className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>Curadoria ORANJE</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
      <section className="px-5 mt-8">
        <Link to="/app/transporte">
          <div
            className="flex items-center justify-between cursor-pointer transition-all duration-200"
            style={{
              padding: "20px 24px",
              borderRadius: "var(--ds-radius-xl)",
              background: "linear-gradient(135deg, var(--ds-color-bg-secondary), var(--ds-color-bg-elevated))",
              border: "1px solid var(--ds-color-border-accent)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--ds-shadow-accent-sm)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ds-color-text-primary)", fontFamily: "var(--ds-font-display)" }}>
                Transporte & Transfers
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--ds-color-text-muted)" }}>
                Motoristas verificados e parceiros
              </p>
            </div>
            <div
              className="flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--ds-radius-lg)",
                background: "var(--ds-color-accent-muted)",
              }}
            >
              <ChevronRight size={20} style={{ color: "var(--ds-color-accent)" }} />
            </div>
          </div>
        </Link>
      </section>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
