import { useState, useEffect, useRef, useCallback } from "react";
import { usePlacesList, useArticlesListPublished } from "@/hooks/useMockData";
import SiteLayout from "@/components/SiteLayout";
import { Link } from "react-router-dom";
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
   SITE HOME — Premium Redesign v1.0
   White/Beige, Dark Green header/footer, Orange CTAs
   Mobile-first, WCAG AAA, Glassmorphism, Micro-animations
   ═══════════════════════════════════════════════════════════════════════════ */

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
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
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Skeleton card for loading states
function SkeletonCard() {
  return (
    <div className="site-card" style={{ overflow: "hidden" }}>
      <div className="site-skeleton" style={{ height: 200, borderRadius: 0 }} />
      <div style={{ padding: 20 }}>
        <div className="site-skeleton" style={{ height: 20, width: "70%", marginBottom: 12 }} />
        <div className="site-skeleton" style={{ height: 14, width: "50%", marginBottom: 16 }} />
        <div className="site-skeleton" style={{ height: 36, width: "40%" }} />
      </div>
    </div>
  );
}

export default function SiteHome() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const { data: articles = [] } = useArticlesListPublished({ limit: 3 });
  const { data: allPlaces = [], isLoading: placesLoading } = usePlacesList();
  const places = allPlaces.slice(0, 6);

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
    { title: "Restaurantes", desc: "Pratos locais e internacionais", icon: <Utensils size={24} strokeWidth={2} />, link: "/melhores-restaurantes-de-holambra" },
    { title: "Cafés", desc: "Cafeterias aconchegantes", icon: <Coffee size={24} strokeWidth={2} />, link: "/melhores-cafes-de-holambra" },
    { title: "Bares & Drinks", desc: "Vida noturna e drinks", icon: <Wine size={24} strokeWidth={2} />, link: "/bares-e-drinks-em-holambra" },
    { title: "Pontos Turísticos", desc: "Atrações imperdíveis", icon: <Camera size={24} strokeWidth={2} />, link: "/onde-tirar-fotos-em-holambra" },
    { title: "Eventos", desc: "Agenda de atividades", icon: <Calendar size={24} strokeWidth={2} />, link: "/eventos-em-holambra" },
    { title: "Roteiros", desc: "Passeios planejados", icon: <Map size={24} strokeWidth={2} />, link: "/roteiros" },
  ];

  return (
    <SiteLayout>
      {/* ═══ 1) HERO SECTION ═══ */}
      <section
        style={{
          position: "relative",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,37,26,0.3) 0%, rgba(0,37,26,0.6) 100%)",
          }}
        />

        {/* Hero Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "0 24px",
            maxWidth: "800px",
            width: "100%",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.8)",
              marginBottom: 16,
            }}
          >
            Curadoria local • Parceiros verificados
          </p>

          <h1
            style={{
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              marginBottom: 20,
              fontFamily: "'Montserrat', system-ui, sans-serif",
            }}
          >
            Descubra Holambra
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.6,
              marginBottom: 32,
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Roteiros, lugares, eventos e serviços locais — tudo em um só lugar.
            Descubra a cidade das flores com informação de qualidade.
          </p>

          {/* Search Bar (glassmorphism) */}
          <div
            style={{
              maxWidth: "520px",
              margin: "0 auto 32px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: 12,
                padding: "0 20px",
                height: 52,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              }}
            >
              <Search size={20} style={{ color: "#00251A", opacity: 0.5, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Buscar restaurantes, eventos, roteiros..."
                aria-label="Buscar"
                onClick={() => { window.location.href = "/app/busca"; }}
                readOnly
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  padding: "0 12px",
                  fontSize: "0.9375rem",
                  color: "#00251A",
                  outline: "none",
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
            <a href="/app" className="site-cta site-cta-lg" style={{ textDecoration: "none" }}>
              Abrir o App
              <ArrowRight size={18} />
            </a>
            <button
              className="site-btn-secondary site-cta-lg"
              style={{ color: "#FFFFFF", borderColor: "rgba(255,255,255,0.4)" }}
              onClick={() => document.getElementById("roteiros")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver Roteiros
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { number: "100+", label: "Lugares" },
              { number: "50+", label: "Parceiros" },
              { number: "30+", label: "Roteiros" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>{stat.number}</p>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{stat.label}</p>
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
          <ChevronDown size={28} style={{ color: "rgba(255,255,255,0.6)" }} />
        </div>
      </section>

      {/* ═══ 2) CATEGORIAS — White background ═══ */}
      <section className="site-section" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#E65100",
                  background: "rgba(230,81,0,0.08)",
                  border: "1px solid rgba(230,81,0,0.2)",
                  borderRadius: 9999,
                  padding: "4px 14px",
                  marginBottom: 16,
                }}
              >
                Categorias
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  fontWeight: 700,
                  color: "#00251A",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                }}
              >
                Explore por Categoria
              </h2>
              <p style={{ color: "rgba(0,37,26,0.55)", fontSize: "clamp(1rem, 2vw, 1.125rem)", lineHeight: 1.6 }}>
                Encontre exatamente o que você procura
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {categories.map((cat, i) => (
              <Reveal key={cat.title} delay={i * 80}>
                <Link to={cat.link} style={{ textDecoration: "none", display: "block" }}>
                  <div className="site-card" style={{ padding: 28, textAlign: "center" }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: "rgba(0,37,26,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                        color: "#00251A",
                      }}
                    >
                      {cat.icon}
                    </div>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#00251A", marginBottom: 8 }}>
                      {cat.title}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "rgba(0,37,26,0.55)", marginBottom: 20, lineHeight: 1.6 }}>
                      {cat.desc}
                    </p>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.875rem",
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

      {/* ═══ 3) DESTAQUES DA SEMANA — Beige background ═══ */}
      <section className="site-section" style={{ background: "#F5F5DC" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#00251A",
                  background: "rgba(0,37,26,0.06)",
                  border: "1px solid rgba(0,37,26,0.1)",
                  borderRadius: 9999,
                  padding: "4px 14px",
                  marginBottom: 16,
                }}
              >
                Destaques
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  fontWeight: 700,
                  color: "#00251A",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                }}
              >
                Destaques da Semana
              </h2>
              <p style={{ color: "rgba(0,37,26,0.55)", fontSize: "clamp(1rem, 2vw, 1.125rem)", lineHeight: 1.6 }}>
                Lugares mais visitados e bem avaliados
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {placesLoading
              ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
              : places.slice(0, 3).map((place: any, i: number) => (
                <Reveal key={place.id} delay={i * 100}>
                  <Link to={`/app/lugar/${place.id}`} style={{ textDecoration: "none", display: "block" }}>
                    <div className="site-card">
                      {/* Image with 4:3 aspect ratio */}
                      <div style={{ position: "relative", paddingBottom: "75%", overflow: "hidden" }}>
                        <img
                          src={place.coverImage}
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
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        />
                        {/* Gradient overlay on image */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "40%",
                            background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)",
                          }}
                        />
                      </div>
                      <div style={{ padding: 20 }}>
                        <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#00251A", marginBottom: 4 }}>
                          {place.name}
                        </h3>
                        <p style={{ fontSize: "0.875rem", color: "rgba(0,37,26,0.55)", marginBottom: 16 }}>
                          {place.category}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Star size={16} style={{ color: "#E65100", fill: "#E65100" }} />
                            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#00251A" }}>
                              {place.rating || "4.5"}
                            </span>
                          </div>
                          <span className="site-cta site-cta-sm" style={{ cursor: "pointer" }}>Ver no app</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      {/* ═══ 4) ROTEIROS PRONTOS — White background ═══ */}
      <section id="roteiros" className="site-section" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#E65100",
                  background: "rgba(230,81,0,0.08)",
                  border: "1px solid rgba(230,81,0,0.2)",
                  borderRadius: 9999,
                  padding: "4px 14px",
                  marginBottom: 16,
                }}
              >
                Roteiros
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  fontWeight: 700,
                  color: "#00251A",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                }}
              >
                Roteiros Prontos
              </h2>
              <p style={{ color: "rgba(0,37,26,0.55)", fontSize: "clamp(1rem, 2vw, 1.125rem)", lineHeight: 1.6 }}>
                Passeios planejados para aproveitar Holambra
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
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
              <Reveal key={roteiro.title} delay={i * 100}>
                <Link to={roteiro.link} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                  <div className="site-card" style={{ padding: 28, display: "flex", flexDirection: "column", height: "100%" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#00251A", marginBottom: 12 }}>
                      {roteiro.title}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "rgba(0,37,26,0.55)", lineHeight: 1.6, flex: 1 }}>
                      {roteiro.desc}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Clock size={16} style={{ color: "#E65100" }} />
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#E65100" }}>{roteiro.duration}</span>
                      </div>
                      <span className="site-cta site-cta-sm" style={{ cursor: "pointer" }}>Abrir</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5) MAPA — Beige background ═══ */}
      <section className="site-section" style={{ background: "#F5F5DC" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 48,
              alignItems: "center",
            }}
          >
            <Reveal>
              <div>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#E65100",
                    background: "rgba(230,81,0,0.08)",
                    border: "1px solid rgba(230,81,0,0.2)",
                    borderRadius: 9999,
                    padding: "4px 14px",
                    marginBottom: 16,
                  }}
                >
                  Mapa
                </span>
                <h2
                  style={{
                    fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                    fontWeight: 700,
                    color: "#00251A",
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    marginBottom: 16,
                  }}
                >
                  Navegue com Facilidade
                </h2>
                <p
                  style={{
                    fontSize: "clamp(1rem, 2vw, 1.125rem)",
                    color: "rgba(0,37,26,0.55)",
                    marginBottom: 32,
                    lineHeight: 1.6,
                  }}
                >
                  Abra o mapa interativo e encontre o melhor caminho para qualquer lugar em Holambra.
                  Veja rotas, distâncias e tempo de deslocamento em tempo real.
                </p>
                <a href="/mapa" className="site-cta site-cta-lg" style={{ textDecoration: "none" }}>
                  Abrir Mapa
                  <ArrowRight size={18} />
                </a>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div
                className="site-card"
                style={{
                  padding: 48,
                  textAlign: "center",
                  background: "#FFFFFF",
                }}
              >
                <MapPin size={64} style={{ margin: "0 auto 16px", color: "#E65100" }} />
                <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#00251A" }}>Mapa Interativo</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ 6) EVENTOS & AGENDA — White background ═══ */}
      <section className="site-section" style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#E65100",
                  background: "rgba(230,81,0,0.08)",
                  border: "1px solid rgba(230,81,0,0.2)",
                  borderRadius: 9999,
                  padding: "4px 14px",
                  marginBottom: 16,
                }}
              >
                Agenda
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  fontWeight: 700,
                  color: "#00251A",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                }}
              >
                Eventos & Agenda
              </h2>
              <p style={{ color: "rgba(0,37,26,0.55)", fontSize: "clamp(1rem, 2vw, 1.125rem)", lineHeight: 1.6 }}>
                Não perca o que está acontecendo em Holambra
              </p>
            </div>
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
            {articles.slice(0, 3).map((article: any, i: number) => (
              <Reveal key={article.id} delay={i * 80}>
                <Link to={`/blog/${article.slug}`} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    className="site-card"
                    style={{
                      padding: "20px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#00251A", marginBottom: 4 }}>
                        {article.title}
                      </h3>
                      <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.45)" }}>
                        {article.publishedAt &&
                          new Date(article.publishedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <ArrowRight size={20} style={{ color: "#E65100", flexShrink: 0 }} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div style={{ textAlign: "center" }}>
              <a href="/eventos-em-holambra" className="site-cta site-cta-lg" style={{ textDecoration: "none" }}>
                Ver Agenda Completa
                <ArrowRight size={18} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 7) PARA QUEM É — Beige background ═══ */}
      <section className="site-section" style={{ background: "#F5F5DC" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#00251A",
                  background: "rgba(0,37,26,0.06)",
                  border: "1px solid rgba(0,37,26,0.1)",
                  borderRadius: 9999,
                  padding: "4px 14px",
                  marginBottom: 16,
                }}
              >
                Público
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  fontWeight: 700,
                  color: "#00251A",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                Para Quem é o Oranje
              </h2>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 32,
            }}
          >
            {[
              { icon: <MapPin size={32} strokeWidth={2} />, title: "Turistas de Fim de Semana", desc: "Viajantes que querem aproveitar Holambra ao máximo em poucos dias." },
              { icon: <Heart size={32} strokeWidth={2} />, title: "Casais e Famílias", desc: "Experiências especiais para momentos inesquecíveis com quem você ama." },
              { icon: <Users size={32} strokeWidth={2} />, title: "Experiências Locais Seguras", desc: "Quem busca autenticidade com confiança em parceiros verificados." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <div className="site-card" style={{ padding: 32, textAlign: "center", background: "#FFFFFF" }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      background: "rgba(0,37,26,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                      color: "#00251A",
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#00251A", marginBottom: 12 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "rgba(0,37,26,0.55)", lineHeight: 1.6 }}>
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
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#E65100",
                  background: "rgba(230,81,0,0.08)",
                  border: "1px solid rgba(230,81,0,0.2)",
                  borderRadius: 9999,
                  padding: "4px 14px",
                  marginBottom: 16,
                }}
              >
                Parceiros
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  fontWeight: 700,
                  color: "#00251A",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                }}
              >
                Seja um Parceiro Oranje
              </h2>
              <p style={{ color: "rgba(0,37,26,0.55)", fontSize: "clamp(1rem, 2vw, 1.125rem)", lineHeight: 1.6 }}>
                Cresça seu negócio com a plataforma de curadoria local
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 24,
              marginBottom: 48,
            }}
          >
            {[
              { icon: <CheckCircle size={28} strokeWidth={2} />, title: "Visibilidade", desc: "Alcance turistas e locais" },
              { icon: <Star size={28} strokeWidth={2} />, title: "Destaque", desc: "Apareça em roteiros curados" },
              { icon: <Download size={28} strokeWidth={2} />, title: "Vouchers", desc: "Ofertas exclusivas" },
              { icon: <CheckCircle size={28} strokeWidth={2} />, title: "Verificado", desc: "Selo de confiança" },
            ].map((vantagem, i) => (
              <Reveal key={vantagem.title} delay={i * 80}>
                <div className="site-card" style={{ padding: 24, textAlign: "center" }}>
                  <div style={{ color: "#E65100", margin: "0 auto 12px", display: "flex", justifyContent: "center" }}>
                    {vantagem.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, color: "#00251A", marginBottom: 4, fontSize: "1rem" }}>
                    {vantagem.title}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(0,37,26,0.55)" }}>
                    {vantagem.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div style={{ textAlign: "center" }}>
              <a href="/seja-um-parceiro" className="site-cta site-cta-lg" style={{ textDecoration: "none" }}>
                Quero ser Parceiro
                <ArrowRight size={18} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 9) INSTALAR O APP — Dark green strong section ═══ */}
      <section
        style={{
          background: "#00251A",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: "768px", margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: 16,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              Instale o Oranje
            </h2>
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                color: "rgba(255,255,255,0.85)",
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
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 24,
              marginBottom: 48,
            }}
          >
            {[
              { num: "1", title: "Abra o Oranje", desc: "Acesse a plataforma" },
              { num: "2", title: "Toque em Instalar", desc: "Procure o botão de instalação" },
              { num: "3", title: "Use como App", desc: "Acesse direto da tela inicial" },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 100}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    padding: 24,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <p style={{ fontSize: "2rem", fontWeight: 700, color: "#E65100", marginBottom: 12 }}>
                    {step.num}
                  </p>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#FFFFFF", marginBottom: 4 }}>
                    {step.title}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem" }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {installPrompt ? (
            <button
              className="site-cta site-cta-lg"
              onClick={handleInstall}
              style={{ background: "#FFFFFF", color: "#E65100" }}
            >
              <Download size={20} />
              Instalar Agora
            </button>
          ) : (
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: 24,
                border: "1px solid rgba(255,255,255,0.1)",
                textAlign: "left",
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 12 }}>
                📱 <strong>iPhone:</strong> Toque em Compartilhar → Adicionar à Tela de Início
              </p>
              <p style={{ color: "rgba(255,255,255,0.85)" }}>
                🤖 <strong>Android:</strong> Toque no menu (⋮) → Instalar app
              </p>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
