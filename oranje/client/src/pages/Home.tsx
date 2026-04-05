import { getLoginUrl } from "@/const";
import { CalendarDays, ChevronRight, MapPin, Search, LogOut, UtensilsCrossed, Pizza, Wine, Coffee, Flower2, Hotel, Calendar, Navigation, Map, ArrowRight, Play, Sparkles, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAnyReceptivoProgress, type ReceptivoProgress } from "@/lib/receptivoAnalytics";
import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { PlaceCardSkeleton } from "@/components/PlaceCardSkeleton";
import { TabBar } from "@/components/TabBar";
import { useAuth } from "@/_core/hooks/useAuth";
import { DSButton } from "@/components/ds";
import { toast } from "sonner";
import { useCategoriesList, usePlacesList, useFavorites } from "@/hooks/useMockData";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { trpc } from "@/lib/trpc";

const NearbyMap = lazy(() => import("@/components/NearbyMap"));

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATION KEYFRAMES — GPU-accelerated, prefers-reduced-motion safe
───────────────────────────────────────────────────────────────────────────── */
const ANIMATIONS = `
  /* Hero: living gradient background */
  @keyframes oranje-hero-breathe {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  /* Hero: ambient orb drift */
  @keyframes oranje-orb-1 {
    0%   { transform: translate(0px, 0px) scale(1); }
    33%  { transform: translate(18px, -24px) scale(1.08); }
    66%  { transform: translate(-12px, 14px) scale(0.94); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes oranje-orb-2 {
    0%   { transform: translate(0px, 0px) scale(1); }
    40%  { transform: translate(-20px, 18px) scale(1.1); }
    70%  { transform: translate(14px, -10px) scale(0.92); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  /* Hero text: blur → sharp reveal */
  @keyframes oranje-blur-reveal {
    from { opacity: 0; filter: blur(10px); transform: translateY(16px); }
    to   { opacity: 1; filter: blur(0);    transform: translateY(0); }
  }
  /* General fade + slide */
  @keyframes oranje-fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  /* Scale-in for category pills */
  @keyframes oranje-scale-in {
    from { opacity: 0; transform: scale(0.85) translateY(10px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
  /* Badge shimmer sweep */
  @keyframes oranje-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  /* Pulsing dot */
  @keyframes oranje-pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.55; transform: scale(1.5); }
  }
  /* Section divider line grow */
  @keyframes oranje-line-grow {
    from { width: 0; opacity: 0; }
    to   { width: 32px; opacity: 1; }
  }
  /* Floating card subtle bob */
  @keyframes oranje-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-5px); }
  }
  /* Reduced-motion: disable all Oranje animations */
  @media (prefers-reduced-motion: reduce) {
    [class*="oranje-"], [style*="oranje-"] {
      animation: none !important;
      transition: none !important;
    }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────────────────────── */

/** Lightweight scroll-reveal hook — disconnects after first trigger */
function useReveal(threshold = 0.1, rootMargin = "0px 0px -40px 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);
  return { ref, visible };
}

/* ─────────────────────────────────────────────────────────────────────────────
   REUSABLE REVEAL WRAPPERS
───────────────────────────────────────────────────────────────────────────── */

/** Fade + slide-up on scroll */
function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Scale-in on scroll — for grid cells */
function RevealScale({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal(0.05);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1) translateY(0)" : "scale(0.88) translateY(10px)",
        transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUBCOMPONENTS
───────────────────────────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
      <div style={{
        height: 2, borderRadius: 1,
        background: "linear-gradient(90deg, #E65100, transparent)",
        animation: "oranje-line-grow 0.6s cubic-bezier(0.22,1,0.36,1) both",
        animationDelay: "200ms",
      }} />
      <span style={{ fontSize: "0.75rem", color: "rgba(245,245,220,0.5)", fontFamily: "Montserrat, sans-serif" }}>
        {children}
      </span>
    </div>
  );
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  restaurantes: <UtensilsCrossed size={20} />,
  pizzarias:    <Pizza size={20} />,
  bares:        <Wine size={20} />,
  cafes:        <Coffee size={20} />,
  turistico:    <Flower2 size={20} />,
  hospedagem:   <Hotel size={20} />,
  eventos:      <Calendar size={20} />,
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNearbyMap, setShowNearbyMap] = useState(false);
  const [inProgressJourney, setInProgressJourney] = useState<ReceptivoProgress | null>(null);

  useEffect(() => {
    const done = localStorage.getItem("onboarding_completed");
    if (!done && user) navigate("/app/onboarding");
  }, [user, navigate]);

  useEffect(() => {
    setInProgressJourney(getAnyReceptivoProgress());
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
    return url.startsWith("data:image/") || /^https?:\/\//.test(url) || url.startsWith("/") ? url : "";
  })();

  function handleToggleFavorite(placeId: number) {
    if (!user) { window.open(getLoginUrl(), "_blank"); return; }
    favoriteIds.has(placeId) ? removeFavorite(placeId) : addFavorite(placeId);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`/app/busca?q=${encodeURIComponent(q)}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#00251A", overflowX: "hidden" }}>
      <style>{ANIMATIONS}</style>
      <OranjeHeader showSearch hideThemeToggle transparentUntilScroll />

      {/* ════════════════════════════════════════════════════════════
          HERO — animated gradient + floating orbs + blur-reveal text
      ════════════════════════════════════════════════════════════ */}
      <section style={{
        position: "relative",
        minHeight: 360,
        overflow: "hidden",
        ...(heroImageUrl
          ? { backgroundImage: `url(${heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center 30%" }
          : {
              background: "linear-gradient(135deg, #001812 0%, #00251A 40%, #003428 70%, #001F14 100%)",
              backgroundSize: "300% 300%",
              animation: "oranje-hero-breathe 14s ease infinite",
            }),
      }}>
        {/* dark overlay over photo (only when image present) */}
        {heroImageUrl && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,24,18,0.72) 0%, rgba(0,24,18,0.38) 40%, rgba(0,24,18,0.88) 100%)",
          }} />
        )}

        {/* Ambient orb 1 — top-right orange */}
        <div style={{
          position: "absolute",
          top: -60, right: -40,
          width: 280, height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,81,0,0.22) 0%, rgba(230,81,0,0.06) 50%, transparent 75%)",
          animation: "oranje-orb-1 18s ease-in-out infinite",
          willChange: "transform",
          pointerEvents: "none",
        }} />

        {/* Ambient orb 2 — bottom-left green */}
        <div style={{
          position: "absolute",
          bottom: -40, left: -30,
          width: 220, height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,80,56,0.55) 0%, rgba(0,60,42,0.15) 55%, transparent 75%)",
          animation: "oranje-orb-2 22s ease-in-out infinite",
          willChange: "transform",
          pointerEvents: "none",
        }} />

        {/* Subtle grain texture overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.6,
          pointerEvents: "none",
        }} />

        {/* Hero content */}
        <div style={{
          position: "relative", zIndex: 10,
          padding: "72px 20px 40px",
          display: "flex", flexDirection: "column",
        }}>
          {/* Badge */}
          <div style={{
            animation: "oranje-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0ms both",
            marginBottom: 14,
            alignSelf: "flex-start",
          }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 11px",
              borderRadius: 7,
              background: "rgba(230,81,0,0.18)",
              border: "1px solid rgba(230,81,0,0.35)",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#E65100",
              fontFamily: "Montserrat, sans-serif",
              /* shimmer sweep */
              backgroundImage: "linear-gradient(90deg, rgba(230,81,0,0.18) 0%, rgba(255,120,30,0.45) 50%, rgba(230,81,0,0.18) 100%)",
              backgroundSize: "200% 100%",
              animation: "oranje-shimmer 3.5s linear 1.2s infinite",
            }}>
              <Sparkles size={9} />
              Guia Cultural
            </span>
          </div>

          {/* Title line 1 */}
          <h1 style={{
            fontFamily: "'Montserrat', system-ui, sans-serif",
            fontSize: "clamp(1.85rem, 8vw, 2.6rem)",
            fontWeight: 800,
            lineHeight: 1.08,
            color: "#FFFFFF",
            margin: 0,
            letterSpacing: "-0.025em",
          }}>
            <span style={{
              display: "block",
              animation: "oranje-blur-reveal 0.75s cubic-bezier(0.22,1,0.36,1) 120ms both",
              willChange: "opacity, filter, transform",
            }}>
              Descubra
            </span>
            <span style={{
              display: "block",
              color: "#E65100",
              animation: "oranje-blur-reveal 0.75s cubic-bezier(0.22,1,0.36,1) 240ms both",
              willChange: "opacity, filter, transform",
            }}>
              Holambra
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.72)",
            marginTop: 10,
            marginBottom: 24,
            fontFamily: "Montserrat, sans-serif",
            lineHeight: 1.5,
            animation: "oranje-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 400ms both",
            willChange: "opacity, transform",
          }}>
            A cidade das flores espera por você
          </p>

          {/* Search bar */}
          <div style={{
            animation: "oranje-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 560ms both",
            willChange: "opacity, transform",
          }}>
            <form onSubmit={handleSearch}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 16px",
                background: "rgba(255,255,255,0.09)",
                border: "1px solid rgba(230,81,0,0.28)",
                borderRadius: 16,
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
              }}>
                <Search size={18} style={{ color: "#E65100", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Buscar restaurantes, eventos, lugares..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1, fontSize: "0.875rem",
                    background: "transparent", outline: "none", border: "none",
                    color: "#FFFFFF",
                    fontFamily: "'Montserrat', system-ui, sans-serif",
                  }}
                />
                {searchQuery && (
                  <DSButton size="sm" onClick={() => {}}>Buscar</DSButton>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          USER STATUS
      ════════════════════════════════════════════════════════════ */}
      {user && (
        <section style={{ padding: "0 20px", marginTop: 24 }}>
          <Reveal>
            <div style={{
              padding: "14px 16px",
              borderRadius: 18,
              background: "rgba(13,74,64,0.35)",
              border: "1px solid rgba(245,245,220,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <p style={{ fontSize: "0.6875rem", color: "rgba(245,245,220,0.5)" }}>Bem-vindo de volta</p>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#FFFFFF" }}>
                  {user.email || user.name || "Usuário"}
                </p>
              </div>
              <DSButton
                variant="secondary" size="sm"
                iconLeft={<LogOut size={14} />}
                onClick={async () => {
                  try { await logout(); toast.success("Logout realizado"); navigate("/app"); }
                  catch { toast.error("Erro ao fazer logout"); }
                }}
              >Sair</DSButton>
            </div>
          </Reveal>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════
          CATEGORIES — staggered scale-in
      ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 20px", marginTop: 36 }}>
        <Reveal style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{
                fontFamily: "'Montserrat', system-ui, sans-serif",
                fontSize: 18, fontWeight: 800, color: "#FFFFFF", margin: 0,
              }}>
                Explorar
              </h2>
              <SectionLabel>Categorias</SectionLabel>
            </div>
            <Link to="/app/explorar" style={{ textDecoration: "none" }}>
              <span style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: "0.75rem", fontWeight: 700, color: "#E65100",
              }}>
                Ver tudo <ChevronRight size={14} />
              </span>
            </Link>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {categories?.slice(0, 8).map((cat, i) => (
            <RevealScale key={cat.id} delay={i * 55}>
              <Link
                to={`/app/explorar/${cat.slug}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    padding: "15px 6px",
                    borderRadius: 14,
                    background: "rgba(13,74,64,0.35)",
                    border: "1px solid rgba(245,245,220,0.08)",
                    transition: "background 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease",
                    cursor: "pointer",
                  }}
                  onPointerDown={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "scale(0.91)";
                    el.style.background = "rgba(230,81,0,0.15)";
                  }}
                  onPointerUp={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "";
                    el.style.background = "rgba(13,74,64,0.35)";
                  }}
                  onPointerLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "";
                    el.style.background = "rgba(13,74,64,0.35)";
                  }}
                >
                  <div style={{
                    color: "#E65100",
                    transition: "transform 0.2s ease",
                  }}>
                    {CATEGORY_ICONS[cat.slug] ?? <ChevronRight size={20} />}
                  </div>
                  <span style={{
                    textAlign: "center", lineHeight: 1.3,
                    fontWeight: 600, fontSize: 10,
                    color: "rgba(245,245,220,0.85)",
                    fontFamily: "Montserrat, sans-serif",
                  }}>
                    {cat.name}
                  </span>
                </div>
              </Link>
            </RevealScale>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          PASSEIO EM ANDAMENTO
      ════════════════════════════════════════════════════════════ */}
      {inProgressJourney && inProgressJourney.activeIndex > 0 && (
        <section style={{ padding: "0 20px", marginTop: 28 }}>
          <Reveal>
            <Link to={`/app/receptivo/${inProgressJourney.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <div style={{
                borderRadius: 16,
                background: "linear-gradient(135deg, #C44700, #E65100)",
                padding: "14px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                boxShadow: "0 6px 24px rgba(230,81,0,0.35)",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* shimmer */}
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
                  backgroundSize: "200% 100%",
                  animation: "oranje-shimmer 3s linear infinite",
                }} />

                <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    animation: "oranje-float 3s ease-in-out infinite",
                  }}>
                    <Play size={15} color="#fff" fill="#fff" />
                  </div>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 9, fontWeight: 800, fontFamily: "Montserrat, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 2px" }}>
                      Passeio em andamento
                    </p>
                    <p style={{ color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: "Montserrat, sans-serif", margin: "0 0 1px" }}>
                      {inProgressJourney.tourName}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 11, fontFamily: "Montserrat, sans-serif", margin: 0 }}>
                      Parada {inProgressJourney.activeIndex + 1} de {inProgressJourney.totalStops}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, position: "relative" }}>
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 800, fontFamily: "Montserrat, sans-serif" }}>Continuar</span>
                  <ArrowRight size={14} color="rgba(255,255,255,0.9)" />
                </div>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════
          RECEPTIVO ORANJE — shimmer badge + animated orb
      ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 20px", marginTop: 32 }}>
        <Reveal delay={60}>
          <Link to="/app/receptivo" style={{ textDecoration: "none", display: "block" }}>
            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                background: "linear-gradient(145deg, #001812 0%, #00251A 55%, #002E1F 100%)",
                border: "1px solid rgba(230,81,0,0.22)",
                padding: "22px 20px",
                position: "relative",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
              }}
              onPointerDown={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "scale(0.977)"; }}
              onPointerUp={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; }}
              onPointerLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; }}
            >
              {/* animated glow orb */}
              <div style={{
                position: "absolute", top: -50, right: -30,
                width: 180, height: 180, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(230,81,0,0.18) 0%, transparent 70%)",
                animation: "oranje-orb-1 12s ease-in-out infinite",
                pointerEvents: "none",
              }} />
              {/* top accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, transparent, rgba(230,81,0,0.6), transparent)",
              }} />

              {/* shimmer badge */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                borderRadius: 6,
                padding: "4px 10px",
                marginBottom: 12,
                overflow: "hidden",
                position: "relative",
                background: "rgba(230,81,0,0.14)",
                border: "1px solid rgba(230,81,0,0.28)",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                  backgroundSize: "200% 100%",
                  animation: "oranje-shimmer 2.8s linear infinite",
                }} />
                <TrendingUp size={9} color="#E65100" style={{ position: "relative" }} />
                <span style={{
                  position: "relative",
                  fontSize: 9, fontWeight: 800, color: "#E65100",
                  fontFamily: "Montserrat, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  Receptivo Oranje
                </span>
              </div>

              <h2 style={{
                color: "#fff",
                fontSize: 21, fontWeight: 800,
                fontFamily: "Montserrat, sans-serif",
                margin: "0 0 7px",
                lineHeight: 1.18,
                letterSpacing: "-0.01em",
                position: "relative",
              }}>
                Passeios guiados<br />
                <span style={{ color: "#E65100" }}>em Holambra</span>
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                fontFamily: "Montserrat, sans-serif",
                margin: "0 0 18px",
                lineHeight: 1.55,
                position: "relative",
              }}>
                9 percursos curados com mapa, narrativas e dicas — do romântico ao gastronômico.
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                <div style={{ display: "flex", gap: 14 }}>
                  {[
                    { icon: <MapPin size={11} color="#E65100" />, label: "9 passeios" },
                    { icon: <CalendarDays size={11} color="#E65100" />, label: "Holambra, SP" },
                  ].map(({ icon, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {icon}
                      <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "linear-gradient(135deg, #E65100, #FF6D00)",
                  borderRadius: 10, padding: "9px 15px",
                  color: "#fff", fontSize: 12, fontWeight: 800,
                  fontFamily: "Montserrat, sans-serif",
                  boxShadow: "0 4px 14px rgba(230,81,0,0.4)",
                  flexShrink: 0,
                }}>
                  Ver passeios
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </Link>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════
          PERTO DE VOCÊ
      ════════════════════════════════════════════════════════════ */}
      <section style={{ marginTop: 36 }}>
        <Reveal style={{ padding: "0 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                {/* pulsing live dot */}
                <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: "#4CAF50",
                    animation: "oranje-pulse-dot 2s ease-in-out infinite",
                  }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", position: "relative" }} />
                </div>
                <Navigation size={15} style={{ color: "#E65100" }} />
                <h2 style={{
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                  fontSize: 18, fontWeight: 800, color: "#FFFFFF", margin: 0,
                }}>
                  Perto de Você
                </h2>
              </div>
              {geoDenied && !geoLoading && (
                <p style={{ fontSize: "0.7rem", color: "rgba(245,245,220,0.4)", marginTop: 2 }}>
                  Usando centro de Holambra
                </p>
              )}
            </div>
            <button
              onClick={() => setShowNearbyMap(true)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(230,81,0,0.1)", border: "1px solid rgba(230,81,0,0.22)",
                borderRadius: 20, padding: "6px 13px",
                color: "#E65100", fontSize: "0.75rem", fontWeight: 700,
                cursor: "pointer", fontFamily: "'Montserrat', system-ui, sans-serif",
                transition: "background 0.15s ease",
              }}
            >
              <Map size={13} />
              Ver no mapa
            </button>
          </div>
        </Reveal>

        <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "0 20px 8px", scrollbarWidth: "none" }}>
          {geoLoading || nearbyLoading
            ? [1, 2, 3].map(i => (
                <div key={i} style={{ flexShrink: 0, width: 200 }}>
                  <PlaceCardSkeleton compact />
                </div>
              ))
            : nearbyPlaces.length === 0
            ? <p style={{ fontSize: "0.875rem", color: "rgba(245,245,220,0.45)", padding: "8px 0" }}>
                Nenhum lugar com localização disponível.
              </p>
            : nearbyPlaces.map((place, i) => (
                <div key={place.id} style={{
                  flexShrink: 0, width: 200, position: "relative",
                  animation: `oranje-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 70}ms both`,
                  willChange: "opacity, transform",
                }}>
                  <PlaceCard
                    place={place as any}
                    compact
                    isFavorite={favoriteIds.has(place.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                  <div style={{
                    position: "absolute", bottom: 48, left: 10,
                    background: "rgba(0,24,18,0.88)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    borderRadius: 20,
                    padding: "3px 10px",
                    display: "flex", alignItems: "center", gap: 4,
                    border: "1px solid rgba(230,81,0,0.32)",
                  }}>
                    <MapPin size={10} style={{ color: "#E65100", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#FFFFFF" }}>
                      {place.distanceFormatted}
                    </span>
                  </div>
                </div>
              ))
          }
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          EM DESTAQUE
      ════════════════════════════════════════════════════════════ */}
      <section style={{ marginTop: 36 }}>
        <Reveal style={{ padding: "0 20px", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Montserrat', system-ui, sans-serif", fontSize: 18, fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
            Em Destaque
          </h2>
          <SectionLabel>Parceiros ORANJE</SectionLabel>
        </Reveal>

        <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "0 20px 8px", scrollbarWidth: "none" }}>
          {featuredPlaces && featuredPlaces.length > 0
            ? featuredPlaces.slice(0, 6).map((place: any, i: number) => (
                <div key={place.id} style={{
                  flexShrink: 0, width: 220,
                  animation: `oranje-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 80}ms both`,
                  willChange: "opacity, transform",
                }}>
                  <PlaceCard
                    place={place}
                    isFavorite={favoriteIds.has(place.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              ))
            : [1, 2, 3, 4].map(i => (
                <div key={`sk-${i}`} style={{ flexShrink: 0, width: 220 }}>
                  <PlaceCardSkeleton />
                </div>
              ))
          }
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          RECOMENDADOS
      ════════════════════════════════════════════════════════════ */}
      {(!recommendedPlaces || recommendedLoading) ? (
        <section style={{ padding: "0 20px", marginTop: 36 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                height: 200, borderRadius: 16,
                background: "rgba(13,74,64,0.3)",
                animation: "ds-pulse-glow 2s ease-in-out infinite",
              }} />
            ))}
          </div>
        </section>
      ) : recommendedPlaces.length > 0 && (
        <section style={{ padding: "0 20px", marginTop: 36 }}>
          <Reveal style={{ marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Montserrat', system-ui, sans-serif", fontSize: 18, fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
              Recomendados
            </h2>
            <SectionLabel>Curadoria ORANJE</SectionLabel>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {recommendedPlaces.slice(0, 6).map((place: any, i: number) => (
              <RevealScale key={place.id} delay={i * 60}>
                <PlaceCard
                  place={place}
                  isFavorite={favoriteIds.has(place.id)}
                  onToggleFavorite={handleToggleFavorite}
                  compact
                />
              </RevealScale>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════
          TRANSPORT CTA
      ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 20px", marginTop: 32, marginBottom: 16 }}>
        <Reveal delay={40}>
          <Link to="/app/transporte" style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 22px",
                borderRadius: 18,
                background: "linear-gradient(145deg, rgba(13,74,64,0.42), rgba(9,50,38,0.55))",
                border: "1px solid rgba(230,81,0,0.2)",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onPointerDown={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "scale(0.978)"; }}
              onPointerUp={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; }}
              onPointerLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; }}
            >
              <div style={{
                position: "absolute", top: 0, right: 0,
                width: 100, height: 100,
                background: "radial-gradient(circle at top right, rgba(230,81,0,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{ position: "relative" }}>
                <h3 style={{
                  fontSize: 16, fontWeight: 800, color: "#FFFFFF",
                  fontFamily: "'Montserrat', system-ui, sans-serif", margin: 0,
                }}>
                  Transporte & Transfers
                </h3>
                <p style={{ fontSize: "0.75rem", marginTop: 4, color: "rgba(245,245,220,0.5)" }}>
                  Motoristas verificados e parceiros
                </p>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 13,
                background: "rgba(230,81,0,0.16)",
                border: "1px solid rgba(230,81,0,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <ChevronRight size={20} style={{ color: "#E65100" }} />
              </div>
            </div>
          </Link>
        </Reveal>
      </section>

      <div style={{ height: 80 }} />
      <TabBar />

      {showNearbyMap && (
        <Suspense fallback={null}>
          <NearbyMap onClose={() => setShowNearbyMap(false)} />
        </Suspense>
      )}
    </div>
  );
}
