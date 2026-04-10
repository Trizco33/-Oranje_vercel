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
  Search,
  ChevronDown,
  Navigation,
  SlidersHorizontal,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   SITE HOME — Clean. Minimal. Premium. v2.0
   White/Beige alternating, Dark Green header/footer, Orange CTAs
   Mobile-first, WCAG AAA, No glassmorphism, Generous spacing
   ═══════════════════════════════════════════════════════════════════════════ */

// Scroll reveal hook — with 1.2s safety fallback
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => setVisible(true);
    const fallback = setTimeout(show, 1200);
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { show(); observer.disconnect(); clearTimeout(fallback); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
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

type SiteFeatureItem = {
  id: number;
  routeId: number;
  label: string | null;
  subtitle: string | null;
  ctaText: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  route: {
    id: number;
    title: string;
    theme: string | null;
    duration: string | null;
    isPublic: boolean;
    placeIds: unknown;
    description: string | null;
    coverImage: string | null;
  } | null;
};

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
  const [heroReady, setHeroReady] = useState(false);
  const isPWA = typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true);
  const isMobile = typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 80);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    document.title = "ORANJE — Holambra em um só lugar";
    return () => { document.title = "ORANJE — Holambra em um só lugar"; };
  }, []);
  const { data: articles = [] } = useArticlesListPublished({ limit: 3 });
  const { data: allPlaces = [], isLoading: placesLoading } = usePlacesList();
  const { data: cats = [] } = useCategoriesList();
  const { data: publicRoutes = [], isLoading: routesLoading } = usePublicRoutes();
  const { data: siteFeatureItems = [], isLoading: siteFeaturesLoading } = trpc.routes.siteFeatures.useQuery(undefined, { staleTime: 60_000 });
  const siteFeatures = (siteFeatureItems ?? []) as SiteFeatureItem[];
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
    { title: "Passeios", desc: "Receptivo Oranje", icon: <Map size={24} strokeWidth={1.5} />, link: "/app/receptivo" },
  ];

  return (
    <SiteLayout>
      {/* ═══ 1) HERO SECTION ═══ */}
      <section
        style={{
          position: "relative",
          minHeight: "min(90vh, 720px)",
          display: "flex",
          alignItems: "center",
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
        {/* Gradient overlay — direcional (legibilidade editorial) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, #00251A 0%, rgba(0,37,26,0.82) 45%, rgba(0,37,26,0.35) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, #00251A 0%, transparent 50%)",
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

        {/* Hero Content — editorial, left-aligned */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: "1200px",
            padding: "0 clamp(24px, 4vw, 48px)",
            margin: "0 auto",
          }}
        >
          <div style={{ maxWidth: "680px" }}>

          {/* Badge */}
          <div
            style={{
              marginBottom: 24,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1) 0.06s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.06s",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                padding: "6px 16px",
                borderRadius: 20,
                border: "1px solid rgba(245,245,220,0.2)",
                background: "rgba(0,77,64,0.4)",
                color: "rgba(245,245,220,0.9)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E65100", flexShrink: 0 }} />
              Curadoria premium · Holambra
            </span>
          </div>

          {/* Título */}
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6.5vw, 4.5rem)",
              fontWeight: 300,
              color: "#FFFFFF",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              marginBottom: 20,
              fontFamily: "'Montserrat', system-ui, sans-serif",
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
              transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.18s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.18s",
            }}
          >
            Holambra
            <br />
            <em style={{ fontStyle: "italic", fontWeight: 400, fontFamily: "Georgia, 'Times New Roman', serif", color: "rgba(255,255,255,0.92)" }}>
              em um só lugar
            </em>
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2.2vw, 1.125rem)",
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.7,
              marginBottom: 36,
              maxWidth: "520px",
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.65s cubic-bezier(0.22,1,0.36,1) 0.32s, transform 0.65s cubic-bezier(0.22,1,0.36,1) 0.32s",
            }}
          >
            Experiências, roteiros, parceiros e descobertas — reunidos com curadoria.
          </p>

          {/* Search Bar */}
          <div
            style={{
              maxWidth: "480px",
              margin: "0 0 36px",
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1) 0.46s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.46s",
            }}
          >
            <div
              className="btn-press"
              onClick={() => { navigate("/app/busca"); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/app/busca"); }}
              role="button"
              tabIndex={0}
              aria-label="Encontre restaurantes, eventos e roteiros em Holambra"
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
                Encontre restaurantes, eventos e roteiros em Holambra
              </span>
            </div>
          </div>

          {/* CTA Buttons — context-aware */}
          <div style={{
            display: "flex", gap: 12, justifyContent: "flex-start", flexWrap: "wrap", marginBottom: 0,
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1) 0.58s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.58s",
          }}>
            {/* Primary CTA:
                installPrompt  → "Baixar app" (triggers PWA install)
                isPWA/desktop  → "Explorar Holambra" (already in app context)
                mobile/web     → "Acessar o app" (opens web app, clear expectation) */}
            {installPrompt ? (
              <button
                className="btn-press"
                onClick={handleInstall}
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
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                  animation: "hero-cta-breathe 3s ease-in-out infinite",
                  boxShadow: "0 4px 20px rgba(230,81,0,0.35)",
                }}
              >
                <Download size={16} />
                Baixar app
              </button>
            ) : (
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
                {(!isPWA && isMobile) ? "Acessar o app" : "Explorar Holambra"}
                <ArrowRight size={16} />
              </Link>
            )}
            <Link
              to="/app/receptivo"
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
              Ver experiências
            </Link>
          </div>

          </div>{/* /maxWidth 680px */}
        </div>

        {/* Localização decorativa — desktop only */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
            borderRight: "2px solid #E65100",
            paddingRight: 20,
            textAlign: "right",
            opacity: heroReady ? 0.85 : 0,
            transition: "opacity 1s cubic-bezier(0.22,1,0.36,1) 0.9s",
          }}
          className="hero-location-badge"
        >
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,245,220,0.5)", margin: 0 }}>Localização</p>
          <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "rgba(245,245,220,0.9)", margin: 0 }}>Holambra, São Paulo — Brasil</p>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <div style={{ height: 2, width: 32, background: "rgba(245,245,220,0.25)" }} />
            <div style={{ height: 2, width: 16, background: "rgba(245,245,220,0.25)" }} />
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
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {categories.map((cat, i) => (
              <Reveal key={cat.title} delay={i * 60}>
                <Link to={cat.link} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    className="card-press"
                    style={{
                      padding: "26px 22px",
                      background: "#FFFFFF",
                      borderRadius: 16,
                      borderTop: "2px solid #E65100",
                      boxShadow: "0 2px 14px rgba(0,37,26,0.06)",
                      transition: "transform 0.22s ease, box-shadow 0.22s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 12px 32px rgba(0,37,26,0.12)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = "0 2px 14px rgba(0,37,26,0.06)"; }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 13,
                      background: "linear-gradient(135deg, rgba(230,81,0,0.1), rgba(230,81,0,0.04))",
                      border: "1px solid rgba(230,81,0,0.16)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: 16, color: "#E65100",
                    }}>
                      {cat.icon}
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#00251A", marginBottom: 6, fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                      {cat.title}
                    </h3>
                    <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.5)", marginBottom: 18, lineHeight: 1.6, flex: 1 }}>
                      {cat.desc}
                    </p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.8125rem", fontWeight: 700, color: "#E65100" }}>
                      Explorar <ArrowRight size={13} />
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
                      <div
                        className="card-press"
                        style={{
                          background: "#FFFFFF",
                          borderRadius: 16,
                          overflow: "hidden",
                          borderTop: "2px solid #E65100",
                          boxShadow: "0 4px 18px rgba(0,37,26,0.07)",
                          transition: "transform 0.22s ease, box-shadow 0.22s ease",
                        }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 14px 36px rgba(0,37,26,0.14)"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = "0 4px 18px rgba(0,37,26,0.07)"; }}
                      >
                        {/* 3:2 aspect ratio image */}
                        <div style={{ position: "relative", paddingBottom: "66.67%", overflow: "hidden" }}>
                          <img
                            src={getPlaceImage(place)}
                            alt={place.name}
                            loading="lazy"
                            className="card-img-zoom"
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          {/* gradient overlay */}
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,37,26,0.55) 0%, transparent 50%)" }} />
                          {/* category chip */}
                          <span style={{
                            position: "absolute", bottom: 12, left: 14,
                            fontSize: "0.6875rem", fontWeight: 600,
                            background: "rgba(0,37,26,0.75)", backdropFilter: "blur(6px)",
                            color: "rgba(255,255,255,0.92)", padding: "4px 10px", borderRadius: 20,
                            border: "1px solid rgba(255,255,255,0.15)",
                          }}>
                            {catMap[(place as any).categoryId] || "Holambra"}
                          </span>
                        </div>
                        <div style={{ padding: "16px 18px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#00251A", marginBottom: 10, lineHeight: 1.25, fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                            {place.name}
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <Star size={13} style={{ color: "#E65100", fill: "#E65100", flexShrink: 0 }} />
                              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#00251A" }}>
                                {place.rating || "4.5"}
                              </span>
                            </div>
                            <span style={{
                              fontSize: "0.75rem", fontWeight: 700, color: "#fff",
                              display: "inline-flex", alignItems: "center", gap: 4,
                              background: "#E65100", padding: "5px 12px", borderRadius: 8,
                            }}>
                              Visitar <ArrowRight size={11} />
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

      {/* ═══ 3.5) CONTINUE EXPLORANDO — glass icon-card grid ═══ */}
      <section style={{
        background: "linear-gradient(160deg, #001A12 0%, #00251A 60%, #002E1F 100%)",
        padding: "44px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* decorative glow */}
        <div style={{
          position: "absolute", bottom: -60, left: -60,
          width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,81,0,0.09) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
          <Reveal>
            <p style={{
              fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.38)", marginBottom: 22,
              fontFamily: "'Montserrat', system-ui, sans-serif",
            }}>
              Continue Explorando Holambra
            </p>
          </Reveal>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: 12,
          }}>
            {[
              { label: "Melhores Restaurantes", icon: <Utensils size={18} strokeWidth={1.8} />, link: "/melhores-restaurantes-de-holambra", accent: "#E65100" },
              { label: "Cafés em Holambra",      icon: <Coffee    size={18} strokeWidth={1.8} />, link: "/melhores-cafes-de-holambra",       accent: "#FF8C42" },
              { label: "Bares & Drinks",          icon: <Wine      size={18} strokeWidth={1.8} />, link: "/bares-e-drinks-em-holambra",        accent: "#FFB347" },
              { label: "Onde Tirar Fotos",        icon: <Camera    size={18} strokeWidth={1.8} />, link: "/onde-tirar-fotos-em-holambra",      accent: "#FF8C42" },
              { label: "Ver no Mapa",             icon: <Map       size={18} strokeWidth={1.8} />, link: "/mapa",                              accent: "#E65100" },
              { label: "Ver Passeios",            icon: <Navigation size={18} strokeWidth={1.8} />, link: "/app/receptivo",                    accent: "#E65100", cta: true },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 45}>
                <Link to={item.link} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    style={{
                      background: item.cta
                        ? `linear-gradient(135deg, ${item.accent}22, ${item.accent}10)`
                        : "rgba(255,255,255,0.05)",
                      borderRadius: 14,
                      padding: "16px 16px",
                      border: `1px solid ${item.cta ? item.accent + "44" : "rgba(255,255,255,0.08)"}`,
                      borderTop: `2px solid ${item.accent}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      transition: "transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.transform = "translateY(-3px)";
                      el.style.background = item.cta
                        ? `linear-gradient(135deg, ${item.accent}35, ${item.accent}18)`
                        : "rgba(255,255,255,0.09)";
                      el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.transform = "";
                      el.style.background = item.cta
                        ? `linear-gradient(135deg, ${item.accent}22, ${item.accent}10)`
                        : "rgba(255,255,255,0.05)";
                      el.style.boxShadow = "";
                    }}
                  >
                    {/* icon accent square */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: `linear-gradient(135deg, ${item.accent}30, ${item.accent}12)`,
                      border: `1px solid ${item.accent}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: item.accent,
                    }}>
                      {item.icon}
                    </div>
                    <span style={{
                      fontSize: "0.8125rem", fontWeight: 700,
                      color: item.cta ? item.accent : "rgba(255,255,255,0.85)",
                      fontFamily: "'Montserrat', system-ui, sans-serif",
                      lineHeight: 1.25,
                      flex: 1,
                    }}>
                      {item.label}
                    </span>
                    <ArrowRight size={13} style={{ color: item.cta ? item.accent : "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                  </div>
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
              label="Receptivo Oranje"
              title="Passeios Guiados em Holambra"
              subtitle="7 percursos curados com mapa, narrativas e dicas — do coração histórico ao entardecer no lago"
            />
          </Reveal>

          {/* Loading skeleton */}
          {(siteFeaturesLoading || (routesLoading && !hasCmsRoutes)) ? (
            <div style={{
              background: "linear-gradient(160deg, #001A12 0%, #00251A 60%, #002E1F 100%)",
              borderRadius: 24, padding: "40px 32px", display: "flex", flexDirection: "column", gap: 20,
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div className="site-skeleton" style={{ height: 120, borderRadius: 16, background: "rgba(255,255,255,0.06)" }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="site-skeleton" style={{ height: 140, borderRadius: 16, background: "rgba(255,255,255,0.06)" }} />
                ))}
              </div>
            </div>
          ) : hasCmsRoutes ? (
            /* ── CMS-driven 3-layer block ───────────────────────────────── */
            <>
              {/* ── Dark glass container — wraps Layer 1 + Layer 2 ── */}
              <Reveal>
                <div style={{
                  background: "linear-gradient(160deg, #001A12 0%, #00251A 60%, #002E1F 100%)",
                  borderRadius: 24,
                  padding: "32px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  border: "1px solid rgba(255,255,255,0.06)",
                  position: "relative",
                  overflow: "hidden",
                  marginBottom: 20,
                }}>
                  {/* decorative glow */}
                  <div style={{
                    position: "absolute", top: -80, right: -80,
                    width: 300, height: 300, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(230,81,0,0.1) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }} />

                  {/* ── Layer 1: Featured passeio ── */}
                  {featuredRoute && featuredRoute.route && (
                    <Link to={`/app/roteiro/${featuredRoute.routeId}`} style={{ textDecoration: "none", display: "block" }}>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: 16,
                          padding: "24px 22px",
                          border: "1px solid rgba(255,255,255,0.09)",
                          borderTop: "2px solid #E65100",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
                          cursor: "pointer",
                          position: "relative",
                        }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.background = "rgba(255,255,255,0.08)"; el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.35)"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.background = "rgba(255,255,255,0.05)"; el.style.boxShadow = ""; }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                          {/* Icon accent */}
                          <div style={{
                            width: 48, height: 48, borderRadius: 13, flexShrink: 0,
                            background: "linear-gradient(135deg, rgba(230,81,0,0.25), rgba(230,81,0,0.1))",
                            border: "1px solid rgba(230,81,0,0.35)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#E65100",
                          }}>
                            <Map size={22} strokeWidth={1.8} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Badges */}
                            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                              <span style={{
                                fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                                background: "#E65100", color: "#fff", padding: "3px 10px", borderRadius: 20,
                              }}>★ Destaque</span>
                              {featuredRoute.route.theme && (
                                <span style={{
                                  fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                                  background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)",
                                  color: "rgba(255,255,255,0.8)", padding: "3px 10px", borderRadius: 20,
                                  border: "1px solid rgba(255,255,255,0.2)",
                                }}>{featuredRoute.route.theme}</span>
                              )}
                            </div>
                            <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#fff", lineHeight: 1.25, margin: "0 0 6px", fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                              {featuredRoute.label || featuredRoute.route.title}
                            </h3>
                            {(featuredRoute.subtitle || featuredRoute.route.description) && (
                              <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: "0 0 14px" }}>
                                {(() => { const t = featuredRoute.subtitle || featuredRoute.route.description || ""; return t.length > 100 ? t.slice(0, 100) + "…" : t; })()}
                              </p>
                            )}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                              <div style={{ display: "flex", gap: 14 }}>
                                {featuredRoute.route.duration && (
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, color: "#E65100" }}>
                                    <Clock size={12} /> {featuredRoute.route.duration}
                                  </span>
                                )}
                                {Array.isArray(featuredRoute.route.placeIds) && featuredRoute.route.placeIds.length > 0 && (
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>
                                    <MapPin size={12} /> {featuredRoute.route.placeIds.length} paradas
                                  </span>
                                )}
                              </div>
                              <span style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                background: "#E65100", color: "#fff",
                                fontSize: "0.8125rem", fontWeight: 700,
                                padding: "8px 18px", borderRadius: 10,
                                boxShadow: "0 4px 14px rgba(230,81,0,0.35)",
                                flexShrink: 0,
                              }}>
                                {featuredRoute.ctaText || "Fazer este passeio"} <ArrowRight size={13} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* ── Layer 2: Secondary passeios — same glass style ── */}
                  {secondaryRoutes.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                      {secondaryRoutes.map((item, i) => {
                        if (!item.route) return null;
                        const stopCount = Array.isArray(item.route.placeIds) ? item.route.placeIds.length : 0;
                        const accent = i % 3 === 0 ? "#E65100" : i % 3 === 1 ? "#FF8C42" : "#FFB347";
                        return (
                          <Link key={item.id} to={`/app/roteiro/${item.routeId}`} style={{ textDecoration: "none", display: "block" }}>
                            <div
                              style={{
                                background: "rgba(255,255,255,0.05)",
                                borderRadius: 16, padding: "22px 20px",
                                border: "1px solid rgba(255,255,255,0.09)",
                                borderTop: `2px solid ${accent}`,
                                height: "100%",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
                                cursor: "pointer",
                              }}
                              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.background = "rgba(255,255,255,0.08)"; el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.35)"; }}
                              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.background = "rgba(255,255,255,0.05)"; el.style.boxShadow = ""; }}
                            >
                              {/* Icon */}
                              <div style={{
                                width: 44, height: 44, borderRadius: 12, marginBottom: 14, flexShrink: 0,
                                background: `linear-gradient(135deg, ${accent}28, ${accent}10)`,
                                border: `1px solid ${accent}40`,
                                display: "flex", alignItems: "center", justifyContent: "center", color: accent,
                              }}>
                                <Navigation size={20} strokeWidth={1.8} />
                              </div>
                              <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#fff", margin: "0 0 7px", lineHeight: 1.25, fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                                {item.label || item.route.title}
                              </h3>
                              {item.subtitle && (
                                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem", margin: "0 0 14px", lineHeight: 1.65 }}>
                                  {item.subtitle.length > 70 ? item.subtitle.slice(0, 70) + "…" : item.subtitle}
                                </p>
                              )}
                              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                {item.route.duration && (
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, color: accent }}>
                                    <Clock size={11} /> {item.route.duration}
                                  </span>
                                )}
                                {stopCount > 0 && (
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>
                                    <MapPin size={11} /> {stopCount} paradas
                                  </span>
                                )}
                              </div>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.8125rem", fontWeight: 700, color: accent, marginTop: 12 }}>
                                {item.ctaText || "Explorar passeio"} <ArrowRight size={12} />
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Reveal>

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
                      Mapa interativo, favoritos e 7 passeios guiados — tudo no Oranje.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link
                      to="/app/receptivo"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        background: "#E65100", color: "#fff",
                        fontSize: "0.875rem", fontWeight: 700,
                        padding: "12px 22px", borderRadius: 11,
                        textDecoration: "none", whiteSpace: "nowrap",
                        fontFamily: "'Montserrat', system-ui, sans-serif",
                      }}
                    >
                      Ver os passeios <ArrowRight size={15} />
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
                  <Link to="/app/receptivo" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 24px", background: "transparent", color: "#00251A", fontSize: "0.875rem", fontWeight: 600, borderRadius: 11, border: "1.5px solid rgba(0,37,26,0.2)", textDecoration: "none", fontFamily: "'Montserrat', system-ui, sans-serif" }}>
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
              title="Explore Holambra com o Mapa Interativo"
              subtitle="Encontre lugares próximos, filtre por categoria e navegue pela cidade com o mapa do Oranje"
            />
          </Reveal>

          <Reveal delay={80}>
            <div style={{
              background: "linear-gradient(160deg, #001A12 0%, #00251A 60%, #002E1F 100%)",
              borderRadius: 24,
              padding: "40px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 32,
              border: "1px solid rgba(255,255,255,0.06)",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* decorative radial glow */}
              <div style={{
                position: "absolute",
                top: -80, right: -80,
                width: 300, height: 300,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(230,81,0,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              {/* Feature grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 16,
              }}>
                {[
                  {
                    icon: <Navigation size={20} strokeWidth={2} />,
                    accent: "#E65100",
                    title: "Perto de Mim",
                    desc: "Veja o que está mais próximo de você agora, em tempo real",
                  },
                  {
                    icon: <SlidersHorizontal size={20} strokeWidth={2} />,
                    accent: "#FF8C42",
                    title: "Filtros por Categoria",
                    desc: "Restaurantes, cafés, parques — filtre e encontre o que quer",
                  },
                  {
                    icon: <Heart size={20} strokeWidth={2} />,
                    accent: "#FFB347",
                    title: "Favoritos no Mapa",
                    desc: "Seus lugares favoritos marcados e acessíveis de onde estiver",
                  },
                ].map((feat, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 16,
                    padding: "24px 22px",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderTop: `2px solid ${feat.accent}`,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
                    cursor: "default",
                  }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.transform = "translateY(-4px)";
                      el.style.background = "rgba(255,255,255,0.08)";
                      el.style.boxShadow = `0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)`;
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.transform = "";
                      el.style.background = "rgba(255,255,255,0.05)";
                      el.style.boxShadow = "";
                    }}
                  >
                    {/* icon circle */}
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${feat.accent}28, ${feat.accent}10)`,
                      border: `1px solid ${feat.accent}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                      color: feat.accent,
                    }}>
                      {feat.icon}
                    </div>
                    <p style={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem", margin: "0 0 7px", fontFamily: "'Montserrat', system-ui, sans-serif", letterSpacing: "-0.01em" }}>
                      {feat.title}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem", margin: 0, lineHeight: 1.65 }}>
                      {feat.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", position: "relative" }}>
                <Link
                  to="/app/mapa"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    height: 50, padding: "0 28px",
                    background: "linear-gradient(135deg, #E65100, #FF6D00)",
                    color: "#FFFFFF",
                    fontSize: "0.9375rem", fontWeight: 700, borderRadius: 13,
                    textDecoration: "none", fontFamily: "'Montserrat', system-ui, sans-serif",
                    boxShadow: "0 4px 18px rgba(230,81,0,0.4)",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 22px rgba(230,81,0,0.5)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(230,81,0,0.4)"; }}
                >
                  <MapPin size={17} />
                  Abrir mapa no app
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/mapa"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    height: 50, padding: "0 24px",
                    background: "transparent", color: "rgba(255,255,255,0.7)",
                    fontSize: "0.875rem", fontWeight: 600, borderRadius: 13,
                    textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.15)",
                    fontFamily: "'Montserrat', system-ui, sans-serif",
                    transition: "border-color 0.15s ease, color 0.15s ease",
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.35)"; el.style.color = "#fff"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.15)"; el.style.color = "rgba(255,255,255,0.7)"; }}
                >
                  Saiba mais sobre o mapa
                </Link>
              </div>
            </div>
          </Reveal>
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

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
            {articles.slice(0, 3).map((article: any, i: number) => (
              <Reveal key={article.id} delay={i * 60}>
                <Link to={`/blog/${article.slug}`} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    className="card-press"
                    style={{
                      padding: "18px 22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      background: "#FFFFFF",
                      borderRadius: 14,
                      borderLeft: "3px solid #E65100",
                      boxShadow: "0 2px 12px rgba(0,37,26,0.06)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateX(4px)"; el.style.boxShadow = "0 6px 22px rgba(0,37,26,0.11)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = "0 2px 12px rgba(0,37,26,0.06)"; }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#00251A", marginBottom: 4, fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                        {article.title}
                      </h3>
                      <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.4)" }}>
                        {article.publishedAt &&
                          new Date(article.publishedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: "rgba(230,81,0,0.08)", border: "1px solid rgba(230,81,0,0.16)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <ArrowRight size={15} style={{ color: "#E65100" }} />
                    </div>
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

      {/* ═══ 7) PARCEIROS — White background ═══ */}
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
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 18,
              marginBottom: 48,
            }}
          >
            {[
              { icon: <CheckCircle size={22} strokeWidth={1.8} />, title: "Visibilidade", desc: "Alcance turistas e locais que buscam Holambra", accent: "#E65100" },
              { icon: <Star size={22} strokeWidth={1.8} />, title: "Destaque", desc: "Apareça em roteiros curados pelo Oranje", accent: "#FF8C42" },
              { icon: <Download size={22} strokeWidth={1.8} />, title: "Vouchers", desc: "Ofertas exclusivas para visitantes do app", accent: "#FFB347" },
              { icon: <CheckCircle size={22} strokeWidth={1.8} />, title: "Verificado", desc: "Selo de curadoria e confiança Oranje", accent: "#E65100" },
            ].map((vantagem, i) => (
              <Reveal key={vantagem.title} delay={i * 60}>
                <div
                  style={{
                    padding: "24px 20px",
                    background: "#FFFFFF",
                    borderRadius: 16,
                    borderTop: `2px solid ${vantagem.accent}`,
                    boxShadow: "0 2px 14px rgba(0,37,26,0.06)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 10px 28px rgba(0,37,26,0.11)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = "0 2px 14px rgba(0,37,26,0.06)"; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, marginBottom: 14,
                    background: `linear-gradient(135deg, ${vantagem.accent}18, ${vantagem.accent}08)`,
                    border: `1px solid ${vantagem.accent}28`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: vantagem.accent,
                  }}>
                    {vantagem.icon}
                  </div>
                  <h3 style={{ fontWeight: 800, color: "#00251A", marginBottom: 6, fontSize: "0.9375rem", fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                    {vantagem.title}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.5)", lineHeight: 1.6 }}>
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

      {/* ═══ 9) INSTALAR O APP — Dark glass section ═══ */}
      <section style={{
        background: "linear-gradient(160deg, #001A12 0%, #00251A 60%, #002E1F 100%)",
        padding: "72px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* decorative glows */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,81,0,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,81,0,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <Reveal>
            <p style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 14, fontFamily: "'Montserrat', system-ui, sans-serif" }}>
              App Oranje
            </p>
            <h2 style={{
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 800, color: "#FFFFFF", marginBottom: 12,
              lineHeight: 1.2, letterSpacing: "-0.02em",
              fontFamily: "'Montserrat', system-ui, sans-serif",
            }}>
              Tenha o Oranje no seu celular
            </h2>
            <p style={{
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
              color: "rgba(255,255,255,0.6)", marginBottom: 48, lineHeight: 1.65,
            }}>
              Use como app nativo — sem ocupar espaço, sempre atualizado, direto da tela inicial.
            </p>
          </Reveal>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 14, marginBottom: 48, textAlign: "left",
          }}>
            {[
              { num: "1", accent: "#E65100", title: "Abra o Oranje", desc: "Acesse oranjeapp.com.br no navegador do celular" },
              { num: "2", accent: "#FF8C42", title: "Toque em Instalar", desc: "Aparece no navegador ou nas instruções abaixo" },
              { num: "3", accent: "#FFB347", title: "Use como App", desc: "Fica na tela inicial, abre sem navegador" },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 80}>
                <div style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 16, padding: "22px 20px",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderTop: `2px solid ${step.accent}`,
                }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: step.accent, marginBottom: 10, fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                    {step.num}
                  </p>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#FFFFFF", marginBottom: 6, fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                    {step.title}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {installPrompt ? (
            <Reveal>
              <button
                onClick={handleInstall}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  height: 50, padding: "0 32px",
                  background: "linear-gradient(135deg, #E65100, #FF6D00)",
                  color: "#FFFFFF", fontSize: "0.9375rem", fontWeight: 700,
                  borderRadius: 14, border: "none", cursor: "pointer",
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                  boxShadow: "0 6px 24px rgba(230,81,0,0.4)",
                }}
              >
                <Download size={18} />
                Instalar o App Agora
              </button>
            </Reveal>
          ) : (
            <Reveal>
              <div style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 16, padding: "22px 28px",
                border: "1px solid rgba(255,255,255,0.09)",
                borderTop: "2px solid rgba(230,81,0,0.5)",
                textAlign: "left", maxWidth: "520px", margin: "0 auto",
              }}>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                  Como instalar
                </p>
                <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: 10, fontSize: "0.875rem", lineHeight: 1.65 }}>
                  📱 <strong style={{ color: "#fff" }}>iPhone:</strong> Toque em Compartilhar → "Adicionar à Tela de Início"
                </p>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", lineHeight: 1.65 }}>
                  🤖 <strong style={{ color: "#fff" }}>Android:</strong> Toque no menu (⋮) → "Instalar app"
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
