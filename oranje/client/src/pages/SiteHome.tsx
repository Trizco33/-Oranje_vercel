import { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { usePlacesList, useArticlesListPublished, useCategoriesList, usePublicRoutes } from "@/hooks/useMockData";
import { trpc } from "@/lib/trpc";
import { getPlaceImage } from "@/components/PlaceCard";
import { getPlaceImagesByName, isBlockedCoverUrl } from "@/constants/placeImages";
import SiteLayout from "@/components/SiteLayout";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Star,
  ArrowRight,
  Download,
  CheckCircle,
  Utensils,
  Coffee,
  Wine,
  Camera,
  Map,
  Clock,
  Heart,
  Users,
  Search,
  ChevronDown,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   SITE HOME — Clean. Minimal. Premium. v2.0
   White/Beige alternating, Dark Green header/footer, Orange CTAs
   Mobile-first, WCAG AAA, No glassmorphism, Generous spacing
   ═══════════════════════════════════════════════════════════════════════════ */

// Lazy load the map components
const SiteMapView = lazy(() => import("@/components/SiteMapView"));
const NearbyMap = lazy(() => import("@/components/NearbyMap"));

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// Reveal wrapper component
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Section header component for consistency
function SectionHeader({
  label,
  labelColor = "#E65100",
  title,
  subtitle,
}: {
  label: string;
  labelColor?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ textAlign: "center", marginBottom: 56 }}>
      <span
        style={{
          display: "inline-block",
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: labelColor,
          marginBottom: 16,
        }}
      >
        {label}
      </span>
      <h2
        style={{
          fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
          fontWeight: 700,
          color: "#00251A",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          marginBottom: subtitle ? 12 : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ color: "rgba(0,37,26,0.5)", fontSize: "clamp(0.9375rem, 2vw, 1.0625rem)", lineHeight: 1.6 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function SiteHome() {
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showNearbyMap, setShowNearbyMap] = useState(false);
  const { data: articles = [] } = useArticlesListPublished({ limit: 3 });
  const { data: allPlaces = [], isLoading: placesLoading } = usePlacesList();
  const { data: cats = [] } = useCategoriesList();
  const { data: publicRoutes = [], isLoading: routesLoading } = usePublicRoutes();
  const { data: siteFeatureItems = [], isLoading: siteFeaturesLoading } = trpc.routes.siteFeatures.useQuery(undefined, { staleTime: 60_000 });
  const siteFeatures = siteFeatureItems as any[];
  const featuredRoute = siteFeatures.find((f) => f.isFeatured) ?? null;
  const secondaryRoutes = siteFeatures.filter((f) => !f.isFeatured);
  const hasCmsRoutes = siteFeatures.length > 0;
  const { data: heroData } = trpc.content.getHero.useQuery();
  const [heroVideoError, setHeroVideoError] = useState(false);
  const places = allPlaces.filter((p: any) => p.status !== "inactive");
  const hasVerifiedImage = (p: any): boolean => {
    // coverImage from DB is valid only if it exists AND isn't in the blocklist
    if (p.coverImage && p.coverImage.trim().length > 10 && !isBlockedCoverUrl(p.coverImage)) return true;
    // Fall back to named images — but only non-empty arrays (empty array = pending)
    const namedImages = getPlaceImagesByName(p.name).filter((url: string) => url && url.trim().length > 0);
    return namedImages.length > 0;
  };

  const featuredPlaces = useMemo(
    () => allPlaces.filter(
      (p: any) => p.isFeatured && p.isRecommended && p.status !== "inactive" && hasVerifiedImage(p)
    ),
    [allPlaces]
  );

  // Resolve specific curated route links by title keyword — falls back to /roteiros
  const routeLinkByKeyword = useMemo(() => {
    const find = (keywords: string[]): string => {
      const match = (publicRoutes as any[]).find((r: any) =>
        keywords.some((kw) => r.title?.toLowerCase().includes(kw.toLowerCase()))
      );
      return match ? `/app/roteiro/${match.id}` : "/roteiros";
    };
    return {
      romantico: find(["romântic", "romantic", "casal"]),
      familia: find(["família", "familia", "família"]),
    };
  }, [publicRoutes]);

  // Build categoryId → name map for display
  const catMap = useMemo(() => {
    const m: Record<number, string> = {};
    for (const c of cats as any[]) m[c.id] = c.name;
    return m;
  }, [cats]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallPrompt(null);
      }
    }
  };

  const categories = [
    { title: "Restaurantes", desc: "Pratos locais e internacionais", icon: <Utensils size={24} strokeWidth={1.5} />, link: "/melhores-restaurantes-de-holambra" },
    { title: "Cafés", desc: "Cafeterias aconchegantes", icon: <Coffee size={24} strokeWidth={1.5} />, link: "/melhores-cafes-de-holambra" },
    { title: "Bares & Drinks", desc: "Vida noturna e drinks", icon: <Wine size={24} strokeWidth={1.5} />, link: "/bares-e-drinks-em-holambra" },
    { title: "Pontos Turísticos", desc: "Atrações imperdíveis", icon: <Camera size={24} strokeWidth={1.5} />, link: "/onde-tirar-fotos-em-holambra" },
    { title: "Eventos", desc: "Agenda de atividades", icon: <Calendar size={24} strokeWidth={1.5} />, link: "/eventos-em-holambra" },
    { title: "Roteiros", desc: "Passeios planejados", icon: <Map size={24} strokeWidth={1.5} />, link: "/roteiros" },
  ];

  return (
    <SiteLayout>
      {/* ═══ 1) HERO SECTION ═══ */}
      <section
        style={{
          position: "relative",
          minHeight: "min(85vh, 680px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundColor: "#00251A",
        }}
      >
        {/* Background: Video (if active) or Image — controlled by CMS */}
        {(() => {
          const mediaType = (heroData as any)?.mediaType ?? "image";
          const videoUrl = (heroData as any)?.videoUrl ?? "";
          const rawImg = heroData?.imageUrl ?? "";
          const imgSrc =
            rawImg.startsWith("data:image/") || /^https?:\/\//.test(rawImg) || rawImg.startsWith("/")
              ? rawImg : "";

          const useVideo = mediaType === "video" && videoUrl && !heroVideoError;

          if (useVideo) {
            return (
              <video
                key={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                onError={() => setHeroVideoError(true)}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              >
                <source src={videoUrl} type="video/mp4" />
                {imgSrc && <img src={imgSrc} alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
              </video>
            );
          }

          if (!imgSrc) return null;
          return (
            <img
              src={imgSrc}
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                animation: "hero-ken-burns 24s ease-in-out infinite alternate",
                transformOrigin: "center center",
              }}
            />
          );
        })()}
        {/* Gradient overlay — legibilidade */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,37,26,0.45) 0%, rgba(0,37,26,0.65) 100%)",
          }}
        />
        {/* Floating orbs — continuous ambient motion */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: "15%", right: "12%",
            width: 220, height: 220, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(230,81,0,0.22) 0%, transparent 70%)",
            animation: "hero-orb-1 14s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: "20%", left: "8%",
            width: 180, height: 180, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,77,64,0.35) 0%, transparent 70%)",
            animation: "hero-orb-2 18s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", top: "55%", right: "30%",
            width: 120, height: 120, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(230,81,0,0.12) 0%, transparent 70%)",
            animation: "hero-orb-3 10s ease-in-out infinite",
          }} />
        </div>

        {/* Hero Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "0 24px",
            maxWidth: "720px",
            width: "100%",
          }}
        >
          <div
            className="hero-enter hero-enter-d1"
            style={{ marginBottom: 20, display: "inline-block" }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "5px 14px",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 100%)",
                backgroundSize: "200% auto",
                color: "rgba(255,255,255,0.85)",
                animation: "hero-badge-shimmer 4s linear infinite",
                backdropFilter: "blur(4px)",
              }}
            >
              Curadoria local • Parceiros verificados
            </span>
          </div>

          <h1
            className="hero-enter hero-enter-d2"
            style={{
              fontSize: "clamp(2.25rem, 7vw, 3.75rem)",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: 16,
              fontFamily: "'Montserrat', system-ui, sans-serif",
            }}
          >
            Descubra Holambra
          </h1>

          <p
            className="hero-enter hero-enter-d3"
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.6,
              marginBottom: 36,
              maxWidth: "540px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Roteiros, lugares, eventos e serviços locais — tudo em um só lugar.
          </p>

          {/* Search Bar */}
          <div
            className="hero-enter hero-enter-d4"
            style={{
              maxWidth: "480px",
              margin: "0 auto 36px",
            }}
          >
            <div
              className="btn-press"
              onClick={() => { navigate("/app/busca"); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/app/busca"); }}
              role="button"
              tabIndex={0}
              aria-label="Buscar restaurantes, eventos, roteiros"
              style={{
                display: "flex",
                alignItems: "center",
                background: "#FFFFFF",
                borderRadius: 14,
                padding: "0 20px",
                height: 52,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                cursor: "pointer",
              }}
            >
              <Search size={18} style={{ color: "rgba(0,37,26,0.35)", flexShrink: 0 }} />
              <span
                style={{
                  flex: 1,
                  padding: "0 12px",
                  fontSize: "0.9375rem",
                  color: "rgba(0,37,26,0.4)",
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                }}
              >
                Busque restaurantes, eventos ou roteiros em Holambra
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hero-enter hero-enter-d5" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            <Link
              to="/app"
              className="btn-press"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 50,
                padding: "0 30px",
                background: "#E65100",
                color: "#FFFFFF",
                fontSize: "0.9375rem",
                fontWeight: 700,
                borderRadius: 13,
                textDecoration: "none",
                fontFamily: "'Montserrat', system-ui, sans-serif",
                animation: "hero-cta-breathe 3s ease-in-out infinite",
                boxShadow: "0 4px 20px rgba(230,81,0,0.35)",
              }}
            >
              Explorar Holambra
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/roteiros"
              className="btn-press"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 50,
                padding: "0 28px",
                background: "rgba(255,255,255,0.12)",
                color: "#FFFFFF",
                fontSize: "0.9375rem",
                fontWeight: 600,
                borderRadius: 13,
                border: "1.5px solid rgba(255,255,255,0.3)",
                textDecoration: "none",
                fontFamily: "'Montserrat', system-ui, sans-serif",
                backdropFilter: "blur(6px)",
              }}
            >
              <Map size={15} />
              Ver Roteiros
            </Link>
            {installPrompt && (
              <button
                className="btn-press"
                onClick={handleInstall}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  height: 50,
                  padding: "0 24px",
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  borderRadius: 13,
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                }}
              >
                <Download size={15} />
                Instalar
              </button>
            )}
          </div>

          {/* Stats — dynamic counts from real data */}
          <div style={{ display: "flex", gap: 56, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { number: places.length > 0 ? `${places.length}` : "40", label: "Lugares curados" },
              { number: publicRoutes.length > 0 ? `${publicRoutes.length}` : "8", label: "Roteiros prontos" },
              { number: "1", label: "Cidade real" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>{stat.number}</p>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            animation: "site-scroll-bounce 2s ease-in-out infinite",
          }}
        >
          <ChevronDown size={24} style={{ color: "rgba(255,255,255,0.5)" }} />
        </div>
      </section>

      {/* ═══ 2) CATEGORIAS — White background ═══ */}
      <section id="categorias" className="site-section" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Categorias"
              title="Explore por Categoria"
              subtitle="Encontre exatamente o que você procura"
            />
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {categories.map((cat, i) => (
              <Reveal key={cat.title} delay={i * 60}>
                <Link to={cat.link} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    className="site-card card-press"
                    style={{
                      padding: "28px 24px",
                      textAlign: "center",
                      background: "#FFFFFF",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: "rgba(0,37,26,0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                        color: "#00251A",
                      }}
                    >
                      {cat.icon}
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#00251A", marginBottom: 6 }}>
                      {cat.title}
                    </h3>
                    <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.5)", marginBottom: 20, lineHeight: 1.6 }}>
                      {cat.desc}
                    </p>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "#E65100",
                      }}
                    >
                      Explorar <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3) DESTAQUES — Beige background, 3:2 cards ═══ */}
      <section className="site-section" style={{ background: "#F5F5DC" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Destaques"
              labelColor="#00251A"
              title="Destaques da Semana"
              subtitle="Lugares mais visitados e bem avaliados"
            />
          </Reveal>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div
            className="scroll-x site-featured-grid"
            style={{
              display: "flex",
              gap: 20,
              paddingBottom: 4,
            }}
          >
            {placesLoading
              ? [1, 2, 3].map((i) => (
                  <div key={i} className="site-card site-featured-item">
                    <div className="site-skeleton" style={{ height: 200, borderRadius: 0 }} />
                    <div style={{ padding: 20 }}>
                      <div className="site-skeleton" style={{ height: 18, width: "70%", marginBottom: 12 }} />
                      <div className="site-skeleton" style={{ height: 14, width: "50%" }} />
                    </div>
                  </div>
                ))
              : featuredPlaces.slice(0, 3).map((place: any, i: number) => (
                  <Reveal key={place.id} delay={i * 80}>
                    <Link to={`/app/lugar/${place.id}`} className="site-featured-item" style={{ textDecoration: "none", display: "block" }}>
                      <div className="card-press site-card" style={{ background: "#FFFFFF" }}>
                        {/* 3:2 aspect ratio image */}
                        <div style={{ position: "relative", paddingBottom: "66.67%", overflow: "hidden" }}>
                          <img
                            src={getPlaceImage(place)}
                            alt={place.name}
                            loading="lazy"
                            className="card-img-zoom"
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#00251A", marginBottom: 4 }}>
                            {place.name}
                          </h3>
                          <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.5)", marginBottom: 12 }}>
                            {catMap[(place as any).categoryId] || "Holambra"}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Star size={14} style={{ color: "#E65100", fill: "#E65100" }} />
                              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#00251A" }}>
                                {place.rating || "4.5"}
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "#E65100",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              Conhecer lugar <ArrowRight size={12} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      {/* ═══ 3.5) CONTINUE EXPLORANDO — bridge block ═══ */}
      <section style={{ background: "#00251A", padding: "40px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
              Continue Explorando Holambra
            </p>
          </Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { label: "Melhores Restaurantes", link: "/melhores-restaurantes-de-holambra" },
              { label: "Cafés em Holambra", link: "/melhores-cafes-de-holambra" },
              { label: "Bares & Drinks", link: "/bares-e-drinks-em-holambra" },
              { label: "Onde Tirar Fotos", link: "/onde-tirar-fotos-em-holambra" },
              { label: "Ver no Mapa", link: "/mapa" },
              { label: "Todos os Roteiros →", link: "/roteiros" },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 40}>
                <Link
                  to={item.link}
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    textDecoration: "none",
                    fontFamily: "'Montserrat', system-ui, sans-serif",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e: any) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; }}
                  onMouseLeave={(e: any) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; }}
                >
                  {item.label}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4) PASSEIOS — White background — CMS-driven via site_route_features ═══ */}
      <section id="roteiros" className="site-section" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Passeios Curados"
              title="Escolha Seu Passeio em Holambra"
              subtitle="Roteiros feitos pelo time Oranje — cada parada verificada, cada horário real, cada dica testada"
            />
          </Reveal>

          {/* Loading skeleton */}
          {(siteFeaturesLoading || (routesLoading && !hasCmsRoutes)) ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="site-skeleton" style={{ height: 260, borderRadius: 14 }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {[1, 2].map((i) => (
                  <div key={i} className="site-skeleton" style={{ height: 160, borderRadius: 14 }} />
                ))}
              </div>
            </div>
          ) : hasCmsRoutes ? (
            /* ── CMS-driven 3-layer block ───────────────────────────────── */
            <>
              {/* ── Layer 1: Featured passeio (hero card) ── */}
              {featuredRoute && featuredRoute.route && (
                <Reveal>
                  <Link
                    to={`/app/roteiro/${featuredRoute.routeId}`}
                    style={{ textDecoration: "none", display: "block", marginBottom: 20 }}
                  >
                    <div
                      className="site-card card-press"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        overflow: "hidden",
                        background: "#FFFFFF",
                      }}
                    >
                      {/* Cover — taller for hero */}
                      <div style={{ position: "relative", height: 240, background: "linear-gradient(135deg, #00251A 0%, #003828 100%)", overflow: "hidden" }}>
                        {featuredRoute.route.coverImage && !featuredRoute.route.coverImage.includes("unsplash.com") && (
                          <img
                            src={featuredRoute.route.coverImage}
                            alt={featuredRoute.label || featuredRoute.route.title}
                            loading="lazy"
                            className="card-img-zoom"
                            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                          />
                        )}
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,37,26,0.85) 0%, rgba(0,37,26,0.2) 60%, transparent 100%)" }} />
                        {/* Badges */}
                        <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8 }}>
                          <span style={{
                            fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em",
                            background: "#E65100", color: "#fff", padding: "4px 12px", borderRadius: 20,
                            textTransform: "uppercase",
                          }}>
                            ★ Destaque
                          </span>
                          {featuredRoute.route.theme && (
                            <span style={{
                              fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em",
                              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)",
                              color: "#fff", padding: "4px 12px", borderRadius: 20,
                              border: "1px solid rgba(255,255,255,0.3)",
                            }}>
                              {featuredRoute.route.theme}
                            </span>
                          )}
                        </div>
                        {/* Meta bottom-left */}
                        <div style={{ position: "absolute", bottom: 16, left: 20, display: "flex", gap: 12 }}>
                          {featuredRoute.route.duration && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.9)", fontSize: "0.8125rem", fontWeight: 600 }}>
                              <Clock size={13} /> {featuredRoute.route.duration}
                            </span>
                          )}
                          {Array.isArray(featuredRoute.route.placeIds) && featuredRoute.route.placeIds.length > 0 && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.9)", fontSize: "0.8125rem", fontWeight: 600 }}>
                              <MapPin size={13} /> {featuredRoute.route.placeIds.length} paradas
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Info */}
                      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 8 }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#00251A", lineHeight: 1.25, margin: 0, fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                          {featuredRoute.label || featuredRoute.route.title}
                        </h3>
                        {(featuredRoute.subtitle || featuredRoute.route.description) && (
                          <p style={{ fontSize: "0.875rem", color: "rgba(0,37,26,0.6)", lineHeight: 1.65, margin: 0 }}>
                            {featuredRoute.subtitle || (featuredRoute.route.description?.slice(0, 120) + (featuredRoute.route.description?.length > 120 ? "…" : ""))}
                          </p>
                        )}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                          <span style={{ fontSize: "0.75rem", color: "rgba(0,37,26,0.4)", fontWeight: 500 }}>
                            Roteiro verificado pelo time Oranje
                          </span>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            background: "#E65100", color: "#fff",
                            fontSize: "0.875rem", fontWeight: 700,
                            padding: "10px 20px", borderRadius: 10,
                          }}>
                            {featuredRoute.ctaText || "Fazer este passeio"}
                            <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              )}

              {/* ── Layer 2: Secondary passeios ── */}
              {secondaryRoutes.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20, marginBottom: 28 }}>
                  {secondaryRoutes.map((item: any, i: number) => {
                    if (!item.route) return null;
                    const stopCount = Array.isArray(item.route.placeIds) ? item.route.placeIds.length : 0;
                    return (
                      <Reveal key={item.id} delay={i * 80}>
                        <Link to={`/app/roteiro/${item.routeId}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                          <div
                            className="site-card card-press"
                            style={{ display: "flex", flexDirection: "column", height: "100%", background: "#FFFFFF", overflow: "hidden" }}
                          >
                            {/* Cover */}
                            <div style={{ position: "relative", height: 140, overflow: "hidden", borderRadius: "14px 14px 0 0", background: "linear-gradient(135deg, #00251A 0%, #004D40 100%)" }}>
                              {item.route.coverImage && !item.route.coverImage.includes("unsplash.com") && (
                                <img
                                  src={item.route.coverImage}
                                  alt={item.label || item.route.title}
                                  loading="lazy"
                                  className="card-img-zoom"
                                  style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                                />
                              )}
                              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,37,26,0.75) 0%, transparent 55%)" }} />
                              {item.route.theme && (
                                <span style={{
                                  position: "absolute", bottom: 10, left: 12,
                                  fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em",
                                  background: "#E65100", color: "#fff", padding: "3px 10px", borderRadius: 20,
                                  textTransform: "uppercase",
                                }}>
                                  {item.route.theme}
                                </span>
                              )}
                              {!item.route.coverImage && (
                                <Map size={28} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "rgba(255,255,255,0.25)" }} />
                              )}
                            </div>
                            {/* Info */}
                            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#00251A", marginBottom: 6, lineHeight: 1.3, fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                                {item.label || item.route.title}
                              </h3>
                              {item.subtitle && (
                                <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.5)", lineHeight: 1.6, flex: 1, margin: 0 }}>
                                  {item.subtitle.length > 80 ? item.subtitle.slice(0, 80) + "…" : item.subtitle}
                                </p>
                              )}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                                <div style={{ display: "flex", gap: 10 }}>
                                  {item.route.duration && (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, color: "#E65100" }}>
                                      <Clock size={12} /> {item.route.duration}
                                    </span>
                                  )}
                                  {stopCount > 0 && (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, color: "rgba(0,37,26,0.5)" }}>
                                      <MapPin size={12} /> {stopCount} paradas
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#E65100", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  {item.ctaText || "Explorar passeio"} <ArrowRight size={12} />
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </Reveal>
                    );
                  })}
                </div>
              )}

              {/* ── Layer 3: CTA to app ── */}
              <Reveal>
                <div style={{
                  background: "#00251A",
                  borderRadius: 16,
                  padding: "32px 36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 24,
                  flexWrap: "wrap",
                }}>
                  <div>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: "1.125rem", margin: "0 0 4px", fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                      Todos os passeios estão no app
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", margin: 0, lineHeight: 1.5 }}>
                      Mapa interativo, favoritos e roteiros completos — tudo no Oranje.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link
                      to="/app/roteiros"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        background: "#E65100", color: "#fff",
                        fontSize: "0.875rem", fontWeight: 700,
                        padding: "12px 22px", borderRadius: 11,
                        textDecoration: "none", whiteSpace: "nowrap",
                        fontFamily: "'Montserrat', system-ui, sans-serif",
                      }}
                    >
                      Ver todos os passeios <ArrowRight size={15} />
                    </Link>
                    <Link
                      to="/app"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        background: "transparent", color: "#fff",
                        fontSize: "0.875rem", fontWeight: 600,
                        padding: "12px 22px", borderRadius: 11,
                        border: "1.5px solid rgba(255,255,255,0.25)",
                        textDecoration: "none", whiteSpace: "nowrap",
                      }}
                    >
                      Abrir o app <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </Reveal>
            </>
          ) : publicRoutes.length > 0 ? (
            /* ── Fallback: no CMS items → old 3-route grid ─────────────── */
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {(publicRoutes as any[]).slice(0, 3).map((route: any, i: number) => (
                  <Reveal key={route.id} delay={i * 80}>
                    <Link to={`/app/roteiro/${route.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                      <div
                        className="site-card card-press"
                        style={{ display: "flex", flexDirection: "column", height: "100%", background: "#FFFFFF", overflow: "hidden" }}
                      >
                        <div style={{ position: "relative", height: 140, overflow: "hidden", borderRadius: "14px 14px 0 0", background: "linear-gradient(135deg, #00251A 0%, #004D40 100%)" }}>
                          {route.coverImage && (
                            <img src={route.coverImage} alt={route.title} loading="lazy" className="card-img-zoom"
                              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                          )}
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,37,26,0.75) 0%, transparent 55%)" }} />
                          {route.theme && (
                            <span style={{ position: "absolute", bottom: 10, left: 12, fontSize: "0.6875rem", fontWeight: 600, background: "#E65100", color: "#fff", padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                              {route.theme}
                            </span>
                          )}
                          {!route.coverImage && <Map size={32} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) translateY(-10px)", color: "rgba(255,255,255,0.25)" }} />}
                        </div>
                        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
                          <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#00251A", marginBottom: 8, lineHeight: 1.3 }}>{route.title}</h3>
                          {route.description && (
                            <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.5)", lineHeight: 1.6, flex: 1 }}>
                              {route.description.length > 90 ? route.description.slice(0, 90) + "…" : route.description}
                            </p>
                          )}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18 }}>
                            {route.duration ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.8125rem", fontWeight: 600, color: "#E65100" }}>
                                <Clock size={13} /> {route.duration}
                              </span>
                            ) : <span />}
                            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E65100", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              Explorar passeio <ArrowRight size={12} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
              <Reveal>
                <div style={{ textAlign: "center", marginTop: 36 }}>
                  <Link to="/app/roteiros" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 24px", background: "transparent", color: "#00251A", fontSize: "0.875rem", fontWeight: 600, borderRadius: 11, border: "1.5px solid rgba(0,37,26,0.2)", textDecoration: "none", fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                    Ver todos os passeios <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            </>
          ) : (
            <p style={{ textAlign: "center", color: "rgba(0,37,26,0.4)", fontSize: "0.9375rem" }}>
              Em breve: roteiros curados para Holambra.
            </p>
          )}
        </div>
      </section>

      {/* ═══ 5) MAPA INTERATIVO — Beige background ═══ */}
      <section className="site-section" style={{ background: "#F5F5DC" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Mapa"
              title="Navegue com Facilidade"
              subtitle="Explore Holambra no mapa interativo com todos os pontos de interesse"
            />
          </Reveal>

          <Reveal delay={100}>
            <Suspense
              fallback={
                <div
                  style={{
                    height: 400,
                    borderRadius: 14,
                    background: "rgba(0,37,26,0.03)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <p style={{ color: "rgba(0,37,26,0.4)", fontSize: "0.875rem" }}>Carregando mapa...</p>
                </div>
              }
            >
              <SiteMapView height="400px" />
            </Suspense>
          </Reveal>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            <Link
              to="/mapa"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 44,
                padding: "0 24px",
                background: "#E65100",
                color: "#FFFFFF",
                fontSize: "0.875rem",
                fontWeight: 600,
                borderRadius: 11,
                textDecoration: "none",
                transition: "background 0.2s ease",
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}
              onMouseEnter={(e: any) => (e.currentTarget.style.background = "#FF6D00")}
              onMouseLeave={(e: any) => (e.currentTarget.style.background = "#E65100")}
            >
              Abrir Mapa Completo
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => setShowNearbyMap(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 44,
                padding: "0 24px",
                background: "transparent",
                color: "#00251A",
                fontSize: "0.875rem",
                fontWeight: 600,
                borderRadius: 11,
                border: "1.5px solid rgba(0,37,26,0.15)",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}
              onMouseEnter={(e: any) => (e.currentTarget.style.borderColor = "rgba(0,37,26,0.3)")}
              onMouseLeave={(e: any) => (e.currentTarget.style.borderColor = "rgba(0,37,26,0.15)")}
            >
              <MapPin size={16} />
              Perto de mim
            </button>
          </div>
        </div>
      </section>

      {/* ═══ 6) BLOG & GUIAS — White background ═══ */}
      <section className="site-section" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Blog & Guias"
              title="Guias e Notícias de Holambra"
              subtitle="Leia antes de ir — dicas editoriais, guias de visita e novidades da cidade"
            />
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
            {articles.slice(0, 3).map((article: any, i: number) => (
              <Reveal key={article.id} delay={i * 60}>
                <Link to={`/blog/${article.slug}`} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    className="site-card card-press"
                    style={{
                      padding: "18px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#00251A", marginBottom: 4 }}>
                        {article.title}
                      </h3>
                      <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.4)" }}>
                        {article.publishedAt &&
                          new Date(article.publishedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <ArrowRight size={18} style={{ color: "#E65100", flexShrink: 0 }} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div style={{ textAlign: "center" }}>
              <Link
                to="/blog"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  height: 44,
                  padding: "0 24px",
                  background: "#E65100",
                  color: "#FFFFFF",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  borderRadius: 11,
                  textDecoration: "none",
                  transition: "background 0.2s ease",
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                }}
                onMouseEnter={(e: any) => (e.currentTarget.style.background = "#FF6D00")}
                onMouseLeave={(e: any) => (e.currentTarget.style.background = "#E65100")}
              >
                Ver todos os guias
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 7) QUAL É O SEU ROTEIRO — Beige background (navegação real) ═══ */}
      <section className="site-section" style={{ background: "#F5F5DC" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Qual é o seu estilo?"
              labelColor="#00251A"
              title="Escolha o Roteiro Certo para Você"
              subtitle="Passeios curados para cada tipo de viajante — clique e comece a explorar"
            />
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                icon: <MapPin size={28} strokeWidth={1.5} />,
                title: "Fim de semana em Holambra",
                desc: "Um dia completo pelos principais pontos — do Moinho ao Lago, com paradas nos melhores restaurantes.",
                cta: "Ver roteiro de 1 dia",
                link: "/roteiro-1-dia-em-holambra",
              },
              {
                icon: <Heart size={28} strokeWidth={1.5} />,
                title: "A dois em Holambra",
                desc: "Experiências românticas com curadoria especial para casais — jardins, vinhos e pôr do sol.",
                cta: "Ver roteiro romântico",
                link: routeLinkByKeyword.romantico,
              },
              {
                icon: <Users size={28} strokeWidth={1.5} />,
                title: "Com a família",
                desc: "Passeios ao ar livre, restaurantes pet-friendly e atrações para crianças e adultos juntos.",
                cta: "Ver roteiro família",
                link: routeLinkByKeyword.familia,
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <Link to={item.link} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                  <div className="site-card card-press" style={{ padding: "32px 28px", textAlign: "center", background: "#FFFFFF", display: "flex", flexDirection: "column", height: "100%" }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: "rgba(0,37,26,0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        color: "#00251A",
                      }}
                    >
                      {item.icon}
                    </div>
                    <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#00251A", marginBottom: 10 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "rgba(0,37,26,0.5)", lineHeight: 1.6, flex: 1 }}>
                      {item.desc}
                    </p>
                    <span
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "center",
                        marginTop: 20, fontSize: "0.8125rem", fontWeight: 600, color: "#E65100",
                      }}
                    >
                      {item.cta} <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8) PARCEIROS — White background ═══ */}
      <section className="site-section" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Parceiros"
              title="Seja um Parceiro Oranje"
              subtitle="Cresça seu negócio com a plataforma de curadoria local"
            />
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
              marginBottom: 48,
            }}
          >
            {[
              { icon: <CheckCircle size={24} strokeWidth={1.5} />, title: "Visibilidade", desc: "Alcance turistas e locais" },
              { icon: <Star size={24} strokeWidth={1.5} />, title: "Destaque", desc: "Apareça em roteiros curados" },
              { icon: <Download size={24} strokeWidth={1.5} />, title: "Vouchers", desc: "Ofertas exclusivas" },
              { icon: <CheckCircle size={24} strokeWidth={1.5} />, title: "Verificado", desc: "Selo de confiança" },
            ].map((vantagem, i) => (
              <Reveal key={vantagem.title} delay={i * 60}>
                <div className="site-card" style={{ padding: "24px 20px", textAlign: "center" }}>
                  <div style={{ color: "#E65100", margin: "0 auto 12px", display: "flex", justifyContent: "center" }}>
                    {vantagem.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, color: "#00251A", marginBottom: 4, fontSize: "0.9375rem" }}>
                    {vantagem.title}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.5)" }}>
                    {vantagem.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div style={{ textAlign: "center" }}>
              <Link
                to="/seja-um-parceiro"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  height: 44,
                  padding: "0 24px",
                  background: "#E65100",
                  color: "#FFFFFF",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  borderRadius: 11,
                  textDecoration: "none",
                  transition: "background 0.2s ease",
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                }}
                onMouseEnter={(e: any) => (e.currentTarget.style.background = "#FF6D00")}
                onMouseLeave={(e: any) => (e.currentTarget.style.background = "#E65100")}
              >
                Quero ser Parceiro
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 9) INSTALAR O APP — Dark green section ═══ */}
      <section
        style={{
          background: "#00251A",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <h2
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: 12,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              Instale o Oranje
            </h2>
            <p
              style={{
                fontSize: "clamp(0.9375rem, 2.5vw, 1.0625rem)",
                color: "rgba(255,255,255,0.7)",
                marginBottom: 48,
                lineHeight: 1.6,
              }}
            >
              Use Oranje como um app nativo no seu celular — sem ocupar espaço e sempre atualizado.
            </p>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 16,
              marginBottom: 48,
            }}
          >
            {[
              { num: "1", title: "Abra o Oranje", desc: "Acesse a plataforma" },
              { num: "2", title: "Toque em Instalar", desc: "Procure o botão de instalação" },
              { num: "3", title: "Use como App", desc: "Acesse direto da tela inicial" },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 80}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    padding: 24,
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#E65100", marginBottom: 10 }}>
                    {step.num}
                  </p>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#FFFFFF", marginBottom: 4 }}>
                    {step.title}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem" }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {installPrompt ? (
            <button
              onClick={handleInstall}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 48,
                padding: "0 28px",
                background: "#FFFFFF",
                color: "#E65100",
                fontSize: "0.9375rem",
                fontWeight: 600,
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}
            >
              <Download size={18} />
              Instalar Agora
            </button>
          ) : (
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 12,
                padding: "20px 24px",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "left",
                maxWidth: "480px",
                margin: "0 auto",
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 10, fontSize: "0.875rem" }}>
                📱 <strong>iPhone:</strong> Toque em Compartilhar → Adicionar à Tela de Início
              </p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>
                🤖 <strong>Android:</strong> Toque no menu (⋮) → Instalar app
              </p>
            </div>
          )}
        </div>
      </section>
      {showNearbyMap && (
        <Suspense fallback={null}>
          <NearbyMap onClose={() => setShowNearbyMap(false)} />
        </Suspense>
      )}
    </SiteLayout>
  );
}
