import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { CalendarDays, ChevronRight, MapPin, Search, Sparkles, TrendingUp, LogOut, UtensilsCrossed, Pizza, Wine, Coffee, Flower2, Hotel, Calendar } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { PlaceCardSkeleton } from "@/components/PlaceCardSkeleton";
import { CategoryCardSkeleton } from "@/components/CategoryCardSkeleton";
import { TabBar } from "@/components/TabBar";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect } from "react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  restaurantes: <UtensilsCrossed size={16} />,
  pizzarias: <Pizza size={16} />,
  bares: <Wine size={16} />,
  cafes: <Coffee size={16} />,
  turistico: <Flower2 size={16} />,
  hospedagem: <Hotel size={16} />,
  eventos: <Calendar size={16} />,
};

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1490750967868-88df5691cc4c?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1444021465936-c6ca81d39b84?w=800&h=500&fit=crop",
];

export default function Home() {
  console.log("[HOME] render", window.location.hash);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [heroImg] = useState(() => HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)]);

  // Verificar se é primeira vez e redirecionar para onboarding
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

  // Render immediately without blocking on queries
  return (
    <div className="oranje-app min-h-screen">
      <OranjeHeader showSearch hideThemeToggle />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="hero-section relative" style={{
        minHeight: 400,
        backgroundImage: 'url(/brand/moinho-povos-unidos.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        overflow: 'hidden'
      }}>

        {/* Overlay Cinematográfico Refinado */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(7, 25, 20, 0.85) 0%, rgba(7, 25, 20, 0.55) 50%, rgba(7, 25, 20, 0.9) 100%)'
        }} />
        <div className="relative z-20 px-4 pt-16 pb-12 flex flex-col justify-center h-full">

          <div className="animate-fade-up">
            <p className="text-xs font-medium tracking-widest mb-2" style={{ color: "#F28C28", opacity: 0.8 }}>
              GUIA CULTURAL
            </p>
            <h1
              className="text-4xl font-semibold leading-tight mb-3"
              style={{ fontFamily: "'Montserrat', sans-serif", color: "#EAEAEA", textShadow: '0 4px 20px rgba(0,0,0,0.35)' }}
            >
              Descubra<br />
              <span style={{ color: "#F28C28" }}>Holambra</span>
            </h1>
            <p className="text-sm mb-8" style={{ color: "#B8B8B8", opacity: 0.85 }}>
              A cidade das flores espera por você
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch}>
              <div className="search-bar flex items-center gap-3 px-4 py-3.5" style={{ background: "rgba(15,27,20,0.6)", border: "1px solid rgba(242,140,40,0.15)", borderRadius: "14px" }}>
                <Search size={18} style={{ color: "#F28C28", opacity: 0.8 }} />
                <input
                  type="text"
                  placeholder="Buscar restaurantes, eventos, lugares..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 text-sm"
                />
                {searchQuery && (
                  <button type="submit" className="btn-gold px-3 py-1 text-xs rounded-lg">
                    Buscar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        <style>{`
          @keyframes watermarkFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 0.12;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .hero-watermark {
              animation: none !important;
              opacity: 0.12;
            }
          }
        `}</style>
      </section>

      {/* ── User Status & Logout ─────────────────────────────────────────── */}
      {user && (
        <section className="px-4 mt-6">
          <div className="glass-card p-4 flex items-center justify-between" style={{ background: "rgba(30,47,66,0.3)", border: "1px solid rgba(216,138,61,0.08)" }}>
            <div>
              <p className="text-xs" style={{ color: "#C8C5C0" }}>Bem-vindo</p>
              <p className="text-sm font-medium" style={{ color: "#E8E6E3" }}>{user.email || user.name || "Usuario"}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await logout();
                  toast.success("Logout realizado com sucesso");
                  navigate("/app");
                } catch (error) {
                  toast.error("Erro ao fazer logout");
                }
              }}
              className="flex items-center gap-2"
            >
              <LogOut size={14} />
              <span className="text-xs">Sair</span>
            </Button>
          </div>
        </section>
      )}



      {/* ── Categories ─────────────────────────────────────────────────── */}
      <section className="px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Explorar</h2>
          <Link to="/app/explorar">
            <button className="flex items-center gap-1 text-xs font-medium" style={{ color: "#D88A3D" }}>
              Ver tudo <ChevronRight size={14} />
            </button>
          </Link>
        </div>

        <div className="scroll-x flex gap-4 pb-2">
          {categories?.map(cat => (
            <Link key={cat.id} to={`/app/explorar/${cat.slug}`}>
              <div className="category-card flex-shrink-0" style={{ minWidth: 90 }}>
                <div style={{ color: "#F28C28", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {CATEGORY_ICONS[cat.slug] ?? <ChevronRight size={16} />}
                </div>
                <span className="text-xs font-medium text-center leading-tight" style={{ color: "#E8E6E3" }}>
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Places ────────────────────────────────────────────── */}
      {featuredError ? (
        <section className="px-4 mt-9">
          <p className="text-xs" style={{ color: "#D88A3D" }}>Erro ao carregar destaques</p>
        </section>
      ) : (
        <section className="px-4 mt-9">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Em Destaque</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-0.5 w-8 rounded" style={{ background: "linear-gradient(90deg, #D88A3D, transparent)" }} />
                <span className="text-xs" style={{ color: "#C8C5C0" }}>Parceiros ORANJE</span>
              </div>
            </div>
          </div>

          <div className="scroll-x flex gap-4 pb-2">
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
              // Show skeleton while loading
              [1, 2, 3, 4].map(i => (
                <div key={`featured-skeleton-${i}`} className="flex-shrink-0" style={{ width: 220 }}>
                  <PlaceCardSkeleton />
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ── Recommended Places ─────────────────────────────────────────── */}
      {recommendedError ? (
        <section className="px-4 mt-9">
          <p className="text-xs" style={{ color: "#D88A3D" }}>Erro ao carregar recomendados</p>
        </section>
      ) : !recommendedPlaces || recommendedLoading ? (
        <section className="px-4 mt-9">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-32 rounded-lg shimmer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="place-card h-48 shimmer rounded-2xl" />
            ))}
          </div>
        </section>
      ) : recommendedPlaces.length > 0 && (
        <section className="px-4 mt-9">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Recomendados</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-0.5 w-8 rounded" style={{ background: "linear-gradient(90deg, #D88A3D, transparent)" }} />
                <span className="text-xs" style={{ color: "#C8C5C0" }}>Curadoria ORANJE</span>
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

      {/* ── Transport & Transfers ────────────────────────────────────────────── */}
      <section className="px-4 mt-9">
        <Link to="/app/transporte">
          <div className="card-premium p-6 flex items-center justify-between cursor-pointer hover:scale-102 transition-transform duration-200">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "#E8E6E3" }}>Transporte & Transfers</h3>
              <p className="text-xs mt-1" style={{ color: "#C8C5C0" }}>Motoristas verificados e parceiros</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ background: "rgba(242,140,40,0.15)" }}>
              <ChevronRight size={20} style={{ color: "#F28C28" }} />
            </div>
          </div>
        </Link>
      </section>

      {/* Upcoming Events section - disabled until events data is available */}



      <div className="mb-tab" />
      <TabBar />

      {/* CSS Animations */}
      <style>{`
        @keyframes logoEntranceScale {
          from {
            opacity: 0;
            transform: scale(0.6) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation: logoEntranceScale"] {
            animation: none !important;
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
