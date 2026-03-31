import { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import {
  usePlacesList,
  useArticlesListPublished,
  useCategoriesList,
  useHeroContent,
  useServicesContent,
  useAboutContent,
  useContactContent,
} from "@/hooks/useMockData";
import { trpc } from "@/lib/trpc";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { getPlaceImage } from "@/components/PlaceCard";
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
  Mail,
  Phone,
  MoveRight,
  Play,
  Sparkles,
  Compass,
  ShieldCheck,
} from "lucide-react";

function HeroWindmillScene() {
  return (
    <div className="site-hero-windmill" aria-hidden="true">
      <div className="site-hero-windmill-glow" />
      <div className="site-hero-windmill-body">
        <div className="site-hero-windmill-cap" />
        <div className="site-hero-windmill-window window-top" />
        <div className="site-hero-windmill-window window-bottom" />
      </div>
      <div className="site-hero-windmill-rotor">
        <span className="blade blade-1" />
        <span className="blade blade-2" />
        <span className="blade blade-3" />
        <span className="blade blade-4" />
        <span className="hub" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SITE HOME — Clean. Minimal. Premium. v2.0
   White/Beige alternating, Dark Green header/footer, Orange CTAs
   Mobile-first, WCAG AAA, No glassmorphism, Generous spacing
   ═══════════════════════════════════════════════════════════════════════════ */

// Lazy load the map component
const SiteMapView = lazy(() => import("@/components/SiteMapView"));

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

function useParallax(rate = 0.08) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * rate);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [rate]);

  return offset;
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
  const heroParallax = useParallax(0.12);
  const { data: articles = [] } = useArticlesListPublished({ limit: 3 });
  const { data: allPlaces = [], isLoading: placesLoading } = usePlacesList();
  const { data: cats = [] } = useCategoriesList();
  const { data: heroContent } = useHeroContent();
  const { data: servicesContent } = useServicesContent();
  const { data: aboutContent } = useAboutContent();
  const { data: contactContent } = useContactContent();
  const { data: seoData } = trpc.cms.getSeo.useQuery({ page: "home" });
  const places = allPlaces.slice(0, 6);

  const heroTitle = heroContent.title || "Descubra Holambra";
  const heroSubtitle =
    heroContent.subtitle ||
    "Roteiros, lugares, eventos e serviços locais — tudo em um só lugar.";
  const heroButtonText = heroContent.buttonText || "Abrir o App";
  const heroButtonUrl = heroContent.buttonUrl || "/app";
  const heroImageUrl =
    heroContent.imageUrl ||
    "/brand/moinho-povos-unidos.jpg";

  const serviceItems = servicesContent.items.length > 0
    ? servicesContent.items
    : [
        { title: "Curadoria local", description: "Lugares, eventos e experiências selecionados para sua visita." },
        { title: "Planejamento fácil", description: "Organize passeios, descubra rotas e encontre o que fazer com rapidez." },
        { title: "Informações úteis", description: "Tenha contatos, horários e contexto local em um só lugar." },
      ];
  const servicesTitle = servicesContent.title || "Serviços do Oranje";
  const servicesDescription =
    servicesContent.description || "Conte com o Oranje para descobrir, planejar e aproveitar Holambra.";

  const aboutTitle = aboutContent.title || "Sobre o Oranje";
  const aboutText =
    aboutContent.text ||
    "Oranje é um guia local criado para conectar visitantes e moradores ao melhor de Holambra.";

  const contactEmail = contactContent.email || "contato@oranje.com.br";
  const contactPhone = contactContent.phone || "(19) 3802-1000";
  const contactAddress = contactContent.address || "Holambra, SP";

  useSeoMeta({
    title: seoData?.metaTitle || heroTitle,
    description: seoData?.metaDescription || heroSubtitle,
    keywords: seoData?.metaKeywords || undefined,
    canonical: seoData?.canonical || undefined,
    ogTitle: seoData?.ogTitle || seoData?.metaTitle || heroTitle,
    ogDescription: seoData?.ogDescription || seoData?.metaDescription || heroSubtitle,
    ogImage: seoData?.ogImage || heroImageUrl,
    index: seoData?.index ?? true,
    ogType: "website",
  });

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
  const premiumSignals = [
    { icon: <Compass size={18} />, label: "Curadoria local" },
    { icon: <ShieldCheck size={18} />, label: "Experiências verificadas" },
    { icon: <Sparkles size={18} />, label: "Turismo editorial premium" },
  ];
  const heroStats = [
    { value: "100+", label: "Lugares autorais" },
    { value: "50+", label: "Parceiros selecionados" },
    { value: "30+", label: "Roteiros curados" },
  ];

  return (
    <SiteLayout>
      {/* ═══ 1) HERO SECTION ═══ */}
      <section className="site-hero">
        <div
          className="site-hero-media"
          style={{
            backgroundImage: `url('${heroImageUrl}'), url('https://comerciosaopaulo.com.br/wp-content/uploads/2026/02/Guia-Turistico-de-Holambra-SP-2026.jpg')`,
            transform: `translateY(${heroParallax * -0.35}px) scale(1.04)`,
          }}
        />
        <div className="site-hero-overlay" />
        <div className="site-hero-noise" />
        <HeroWindmillScene />

        <div className="site-hero-content">
          <div
            className="site-hero-grid"
            style={{
              maxWidth: "1320px",
              margin: "0 auto",
              padding: "0 clamp(1.25rem, 3vw, 2.5rem)",
            }}
          >
            <div className="site-hero-copy">
              <Reveal delay={20}>
                <div className="site-hero-badge">
                  <Sparkles size={14} />
                  Curadoria premium de Holambra
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="site-hero-title">
                  Uma nova forma de
                  <span className="site-hero-title-accent"> descobrir Holambra</span>
                </h1>
              </Reveal>

              <Reveal delay={140}>
                <p className="site-hero-subtitle">
                  {heroTitle !== "Descubra Holambra" ? heroTitle : heroSubtitle}
                </p>
              </Reveal>

              <Reveal delay={190}>
                <div className="site-hero-signal-row">
                  {premiumSignals.map((signal) => (
                    <div key={signal.label} className="site-hero-signal">
                      {signal.icon}
                      <span>{signal.label}</span>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={240}>
                <div className="site-hero-search-shell">
                  <button
                    onClick={() => {
                      navigate("/app/busca");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") navigate("/app/busca");
                    }}
                    className="site-hero-search"
                    type="button"
                    aria-label="Buscar restaurantes, eventos, roteiros"
                  >
                    <Search size={18} />
                    <span>Busque restaurantes, eventos ou roteiros em Holambra</span>
                    <MoveRight size={18} />
                  </button>
                </div>
              </Reveal>

              <Reveal delay={300}>
                <div className="site-hero-actions">
                  <Link to={heroButtonUrl} className="site-cta site-cta-lg">
                    {heroButtonText}
                    <ArrowRight size={18} />
                  </Link>

                  {installPrompt ? (
                    <button onClick={handleInstall} className="site-btn-secondary site-cta-lg">
                      <Download size={18} />
                      Instalar App
                    </button>
                  ) : (
                    <button
                      onClick={() => document.getElementById("categorias")?.scrollIntoView({ behavior: "smooth" })}
                      className="site-btn-secondary site-cta-lg"
                    >
                      <Play size={16} />
                      Explorar experiência
                    </button>
                  )}
                </div>
              </Reveal>

              <Reveal delay={360}>
                <div className="site-hero-stats">
                  {heroStats.map((stat) => (
                    <div key={stat.label} className="site-hero-stat">
                      <span className="site-hero-stat-value">{stat.value}</span>
                      <span className="site-hero-stat-label">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={220}>
              <div className="site-hero-showcase">
                <div className="site-hero-card site-hero-card-primary">
                  <div className="site-hero-card-eyebrow">Editor&apos;s Selection</div>
                  <h2 className="site-hero-card-title">Roteiros, lugares e experiências com curadoria real.</h2>
                  <p className="site-hero-card-text">
                    Oranje combina profundidade editorial, utilidade prática e uma leitura sofisticada do destino.
                  </p>
                  <div className="site-hero-card-divider" />
                  <div className="site-hero-card-footer">
                    <span>Turismo cultural</span>
                    <span>Marca autoral</span>
                    <span>Confiança local</span>
                  </div>
                </div>

                <div className="site-hero-card site-hero-card-secondary">
                  <p className="site-hero-card-kicker">Experiência refinada</p>
                  <p className="site-hero-card-caption">
                    Visual editorial, navegação clara e uma sensação de produto vivo em cada interação.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="site-hero-scroll-indicator">
          <ChevronDown size={20} />
          <span>Role para descobrir</span>
        </div>
      </section>

      {/* ═══ 2) CATEGORIAS — White background ═══ */}
      <section id="categorias" className="site-section" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Categorias"
              title="Explore Holambra por atmosfera"
              subtitle="Cada trilha abre um universo de experiências com leitura editorial e descoberta prática."
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
                    className="site-card"
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
                    <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#00251A", marginBottom: 8 }}>
                      {cat.title}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "rgba(0,37,26,0.55)", marginBottom: 20, lineHeight: 1.65 }}>
                      {cat.desc}
                    </p>
                    <span className="site-link-inline">
                      Explorar <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 2.5) SERVIÇOS CMS — Beige background ═══ */}
      <section className="site-section" style={{ background: "#F5F5DC" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Serviços"
              labelColor="#00251A"
              title={servicesTitle}
              subtitle={servicesDescription}
            />
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {serviceItems.map((service, i: number) => (
              <Reveal key={`${service.title}-${i}`} delay={i * 60}>
                <div className="site-card site-card-accent" style={{ padding: "30px 26px", background: "#FFFFFF" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#00251A", marginBottom: 10 }}>
                    {service.title}
                  </h3>
                  <p style={{ fontSize: "0.9375rem", color: "rgba(0,37,26,0.62)", lineHeight: 1.75 }}>
                    {service.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3) DESTAQUES — Beige background, 3:2 cards ═══ */}
      <section className="site-section" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Destaques"
              labelColor="#00251A"
              title="Destaques da curadoria Oranje"
              subtitle="Uma seleção pensada para causar impacto, gerar desejo e orientar decisões com confiança."
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
              : places.slice(0, 3).map((place: any, i: number) => (
                  <Reveal key={place.id} delay={i * 80}>
                    <Link to={`/app/lugar/${place.id}`} className="site-featured-item" style={{ textDecoration: "none", display: "block" }}>
                      <div className="site-card site-card-featured" style={{ background: "#FFFFFF" }}>
                        {/* 3:2 aspect ratio image */}
                        <div style={{ position: "relative", paddingBottom: "66.67%", overflow: "hidden" }}>
                          <img
                            src={getPlaceImage(place)}
                            alt={place.name}
                            loading="lazy"
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.4s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                          />
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                          <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#00251A", marginBottom: 6 }}>
                            {place.name}
                          </h3>
                          <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.46)", marginBottom: 12 }}>
                            {catMap[(place as any).categoryId] || "Holambra"}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Star size={14} style={{ color: "#E65100", fill: "#E65100" }} />
                              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#00251A" }}>
                                {place.rating || "4.5"}
                              </span>
                            </div>
                            <span className="site-link-inline" style={{ fontSize: "0.75rem" }}>
                              Ver no app <ArrowRight size={12} />
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

      {/* ═══ 3.5) SOBRE CMS — Beige background ═══ */}
      <section className="site-section" style={{ background: "#F5F5DC" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Sobre"
              labelColor="#00251A"
              title={aboutTitle}
              subtitle="Uma marca construída para transformar descoberta em memória, com linguagem editorial e utilidade real."
            />
          </Reveal>

          <Reveal delay={80}>
            <div className="site-card site-card-editorial" style={{ padding: "38px 34px", background: "#FFFFFF" }}>
              <p
                style={{
                  fontSize: "1rem",
                  color: "rgba(0,37,26,0.68)",
                  lineHeight: 1.95,
                  margin: 0,
                  whiteSpace: "pre-line",
                }}
              >
                {aboutText}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 4) ROTEIROS PRONTOS — White background ═══ */}
      <section id="roteiros" className="site-section" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Roteiros"
              title="Roteiros com leitura de experiência"
              subtitle="Mais do que listas, uma direção clara para viver Holambra com intenção e repertório."
            />
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                title: "Roteiro de 1 Dia",
                desc: "Visite os principais pontos turísticos de Holambra em um dia completo.",
                duration: "8 horas",
                link: "/roteiro-1-dia-em-holambra",
              },
              {
                title: "Roteiro Romântico",
                desc: "Experiências especiais para casais em Holambra.",
                duration: "4 horas",
                link: "/roteiros",
              },
              {
                title: "Dia Chuvoso",
                desc: "Atividades cobertas e indoor para dias nublados.",
                duration: "6 horas",
                link: "/roteiros",
              },
            ].map((roteiro, i) => (
              <Reveal key={roteiro.title} delay={i * 80}>
                <Link to={roteiro.link} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                  <div
                    className="site-card site-card-editorial"
                    style={{
                      padding: "28px 24px",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      background: "#FFFFFF",
                    }}
                  >
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#00251A", marginBottom: 10 }}>
                      {roteiro.title}
                    </h3>
                    <p style={{ fontSize: "0.9375rem", color: "rgba(0,37,26,0.56)", lineHeight: 1.75, flex: 1 }}>
                      {roteiro.desc}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={14} style={{ color: "#E65100" }} />
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E65100" }}>{roteiro.duration}</span>
                      </div>
                      <span className="site-link-inline" style={{ fontSize: "0.8125rem" }}>
                        Abrir <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5) MAPA INTERATIVO — Beige background ═══ */}
      <section className="site-section" style={{ background: "#F5F5DC" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Mapa"
              title="Navegue com profundidade e clareza"
              subtitle="Uma camada visual mais madura para orientar visita, deslocamento e descoberta com fluidez."
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
            <Link
              to="/mapa"
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
                textDecoration: "none",
                border: "1.5px solid rgba(0,37,26,0.15)",
                transition: "border-color 0.2s ease",
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}
              onMouseEnter={(e: any) => (e.currentTarget.style.borderColor = "rgba(0,37,26,0.3)")}
              onMouseLeave={(e: any) => (e.currentTarget.style.borderColor = "rgba(0,37,26,0.15)")}
            >
              <MapPin size={16} />
              Perto de mim
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 6) EVENTOS & AGENDA — White background ═══ */}
      <section className="site-section" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Agenda"
              title="Agenda editorial e oportunidades de visita"
              subtitle="Conteúdo com ritmo, contexto e utilidade para tornar cada visita mais memorável."
            />
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
            {articles.slice(0, 3).map((article: any, i: number) => (
              <Reveal key={article.id} delay={i * 60}>
                <Link to={`/blog/${article.slug}`} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    className="site-card site-card-editorial"
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
                to="/eventos-em-holambra"
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
                Ver Agenda Completa
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 7) PARA QUEM É — Beige background ═══ */}
      <section className="site-section" style={{ background: "#F5F5DC" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Público"
              labelColor="#00251A"
              title="Para quem exige mais do destino"
              subtitle="Um produto desenhado para quem valoriza contexto, curadoria e um acabamento de alto nível."
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
              { icon: <MapPin size={28} strokeWidth={1.5} />, title: "Turistas de Fim de Semana", desc: "Viajantes que querem aproveitar Holambra ao máximo em poucos dias." },
              { icon: <Heart size={28} strokeWidth={1.5} />, title: "Casais e Famílias", desc: "Experiências especiais para momentos inesquecíveis com quem você ama." },
              { icon: <Users size={28} strokeWidth={1.5} />, title: "Experiências Locais Seguras", desc: "Quem busca autenticidade com confiança em parceiros verificados." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div className="site-card site-card-soft" style={{ padding: "34px 28px", textAlign: "center", background: "#FFFFFF" }}>
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
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#00251A", marginBottom: 10 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "rgba(0,37,26,0.5)", lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </div>
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
              title="Uma vitrine premium para marcas locais"
              subtitle="Posicione seu negócio dentro de uma experiência visualmente forte, editorialmente coerente e comercialmente relevante."
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
                <div className="site-card site-card-soft" style={{ padding: "24px 20px", textAlign: "center" }}>
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

      {/* ═══ 10) CONTATO CMS — White background ═══ */}
      <section className="site-section" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Reveal>
            <SectionHeader
              label="Contato"
              title="Contato direto, percepção premium"
              subtitle="Uma apresentação clara e coesa dos canais oficiais da marca, já refletindo o conteúdo publicado."
            />
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                title: "Email",
                value: contactEmail,
                href: `mailto:${contactEmail}`,
                icon: <Mail size={22} strokeWidth={1.75} />,
              },
              {
                title: "Telefone",
                value: contactPhone,
                href: `tel:${contactPhone.replace(/\D/g, "")}`,
                icon: <Phone size={22} strokeWidth={1.75} />,
              },
              {
                title: "Endereço",
                value: contactAddress,
                href: undefined,
                icon: <MapPin size={22} strokeWidth={1.75} />,
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <div className="site-card" style={{ padding: "28px 24px", background: "#FFFFFF" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "rgba(0,37,26,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#00251A",
                      marginBottom: 16,
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#00251A", marginBottom: 8 }}>
                    {item.title}
                  </h3>
                  {item.href ? (
                    <a
                      href={item.href}
                      style={{
                        color: "#E65100",
                        fontSize: "0.95rem",
                        textDecoration: "none",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p style={{ fontSize: "0.95rem", color: "rgba(0,37,26,0.65)", lineHeight: 1.6, margin: 0 }}>
                      {item.value}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
