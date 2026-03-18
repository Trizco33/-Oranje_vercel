import { useState, useEffect } from "react";
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
  PartyPopper,
  Map,
  Clock,
  Heart,
  Users,
} from "lucide-react";
import { DSButton } from "@/components/ds/Button";
import { DSCard } from "@/components/ds/Card";
import { DSBadge } from "@/components/ds/Badge";
import { DSHeroSection } from "@/components/ds/HeroSection";

export default function SiteHome() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const { data: articles = [] } = useArticlesListPublished({ limit: 3 });
  const { data: allPlaces = [] } = usePlacesList();
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
    {
      title: "Restaurantes",
      desc: "Pratos locais e internacionais",
      icon: <Utensils size={28} />,
      link: "/melhores-restaurantes-de-holambra",
    },
    {
      title: "Cafés",
      desc: "Cafeterias aconchegantes",
      icon: <Coffee size={28} />,
      link: "/melhores-cafes-de-holambra",
    },
    {
      title: "Bares & Drinks",
      desc: "Vida noturna e drinks",
      icon: <Wine size={28} />,
      link: "/bares-e-drinks-em-holambra",
    },
    {
      title: "Pontos Turísticos",
      desc: "Atrações imperdíveis",
      icon: <Camera size={28} />,
      link: "/onde-tirar-fotos-em-holambra",
    },
    {
      title: "Eventos",
      desc: "Agenda de atividades",
      icon: <Calendar size={28} />,
      link: "/eventos-em-holambra",
    },
    {
      title: "Roteiros",
      desc: "Passeios planejados",
      icon: <Map size={28} />,
      link: "/roteiros",
    },
  ];

  return (
    <SiteLayout>
      {/* 1) HERO */}
      <DSHeroSection
        eyebrow="Curadoria local • Parceiros verificados"
        title="Seu guia definitivo de Holambra"
        subtitle="Roteiros, lugares, eventos e serviços locais — tudo em um só lugar. Descubra a cidade das flores com informação de qualidade."
        backgroundImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop"
        size="lg"
        align="center"
        cta={
          <DSButton variant="primary" size="lg" onClick={() => window.location.href = "/app"}>
            Abrir o App
            <ArrowRight size={18} />
          </DSButton>
        }
        ctaSecondary={
          <DSButton variant="secondary" size="lg" onClick={() => {
            document.getElementById("roteiros")?.scrollIntoView({ behavior: "smooth" });
          }}>
            Ver Roteiros
          </DSButton>
        }
        bottomContent={
          <div
            style={{
              display: "flex",
              gap: "var(--ds-space-8)",
              justifyContent: "center",
              flexWrap: "wrap",
              paddingTop: "var(--ds-space-8)",
            }}
          >
            {[
              { number: "100+", label: "Lugares" },
              { number: "50+", label: "Parceiros" },
              { number: "30+", label: "Roteiros" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-accent)" }}>
                  {stat.number}
                </p>
                <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        }
      />

      {/* 2) CATEGORIAS */}
      <section style={{ background: "var(--ds-color-bg-secondary)", padding: "var(--ds-space-20) 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--ds-space-12)" }}>
            <DSBadge variant="accent" size="md">Categorias</DSBadge>
            <h2
              style={{
                fontSize: "var(--ds-text-3xl)",
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginTop: "var(--ds-space-4)",
                fontFamily: "var(--ds-font-display)",
              }}
            >
              Explore por Categoria
            </h2>
            <p style={{ color: "var(--ds-color-text-muted)", fontSize: "var(--ds-text-lg)", marginTop: "var(--ds-space-2)" }}>
              Encontre exatamente o que você procura
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--ds-space-6)",
            }}
          >
            {categories.map((cat) => (
              <Link key={cat.title} to={cat.link} style={{ textDecoration: "none" }}>
                <DSCard variant="elevated" interactive padding="lg">
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "var(--ds-radius-xl)",
                        background: "rgba(230, 81, 0, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto var(--ds-space-4)",
                        color: "var(--ds-color-accent)",
                      }}
                    >
                      {cat.icon}
                    </div>
                    <h3
                      style={{
                        fontSize: "var(--ds-text-lg)",
                        fontWeight: "var(--ds-font-bold)",
                        color: "var(--ds-color-text-primary)",
                        marginBottom: "var(--ds-space-2)",
                      }}
                    >
                      {cat.title}
                    </h3>
                    <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)", marginBottom: "var(--ds-space-4)" }}>
                      {cat.desc}
                    </p>
                    <DSButton variant="secondary" size="sm" fullWidth>
                      Explorar
                      <ArrowRight size={14} />
                    </DSButton>
                  </div>
                </DSCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3) DESTAQUES DA SEMANA */}
      <section style={{ background: "var(--ds-color-bg-primary)", padding: "var(--ds-space-20) 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--ds-space-12)" }}>
            <DSBadge variant="default" size="md">Destaques</DSBadge>
            <h2
              style={{
                fontSize: "var(--ds-text-3xl)",
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginTop: "var(--ds-space-4)",
                fontFamily: "var(--ds-font-display)",
              }}
            >
              Destaques da Semana
            </h2>
            <p style={{ color: "var(--ds-color-text-muted)", fontSize: "var(--ds-text-lg)", marginTop: "var(--ds-space-2)" }}>
              Lugares mais visitados e bem avaliados
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "var(--ds-space-6)",
            }}
          >
            {places.slice(0, 3).map((place: any) => (
              <Link key={place.id} to={`/app/lugar/${place.id}`} style={{ textDecoration: "none" }}>
                <DSCard
                  variant="elevated"
                  interactive
                  image={place.coverImage}
                  imageAlt={place.name}
                  overlay
                  padding="none"
                >
                  <div style={{ padding: "var(--ds-space-4)" }}>
                    <h3
                      style={{
                        fontSize: "var(--ds-text-lg)",
                        fontWeight: "var(--ds-font-bold)",
                        color: "var(--ds-color-text-primary)",
                        marginBottom: "var(--ds-space-1)",
                      }}
                    >
                      {place.name}
                    </h3>
                    <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)", marginBottom: "var(--ds-space-3)" }}>
                      {place.category}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-1)" }}>
                        <Star size={16} style={{ color: "var(--ds-color-accent)", fill: "var(--ds-color-accent)" }} />
                        <span style={{ fontSize: "var(--ds-text-sm)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)" }}>
                          {place.rating || "4.5"}
                        </span>
                      </div>
                      <DSButton variant="primary" size="sm">Ver no app</DSButton>
                    </div>
                  </div>
                </DSCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4) ROTEIROS PRONTOS */}
      <section id="roteiros" style={{ background: "var(--ds-color-bg-secondary)", padding: "var(--ds-space-20) 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--ds-space-12)" }}>
            <DSBadge variant="accent" size="md">Roteiros</DSBadge>
            <h2
              style={{
                fontSize: "var(--ds-text-3xl)",
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginTop: "var(--ds-space-4)",
                fontFamily: "var(--ds-font-display)",
              }}
            >
              Roteiros Prontos
            </h2>
            <p style={{ color: "var(--ds-color-text-muted)", fontSize: "var(--ds-text-lg)", marginTop: "var(--ds-space-2)" }}>
              Passeios planejados para aproveitar Holambra
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--ds-space-6)",
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
            ].map((roteiro) => (
              <Link key={roteiro.title} to={roteiro.link} style={{ textDecoration: "none" }}>
                <DSCard variant="elevated" interactive padding="lg" className="h-full">
                  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <h3
                      style={{
                        fontSize: "var(--ds-text-xl)",
                        fontWeight: "var(--ds-font-bold)",
                        color: "var(--ds-color-text-primary)",
                        marginBottom: "var(--ds-space-3)",
                      }}
                    >
                      {roteiro.title}
                    </h3>
                    <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)", flex: 1, lineHeight: "var(--ds-leading-relaxed)" }}>
                      {roteiro.desc}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--ds-space-4)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                        <Clock size={16} style={{ color: "var(--ds-color-accent)" }} />
                        <span style={{ fontSize: "var(--ds-text-sm)", fontWeight: "var(--ds-font-semibold)", color: "var(--ds-color-accent)" }}>
                          {roteiro.duration}
                        </span>
                      </div>
                      <DSButton variant="primary" size="sm">Abrir</DSButton>
                    </div>
                  </div>
                </DSCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5) MAPA RÁPIDO */}
      <section style={{ background: "var(--ds-color-bg-primary)", padding: "var(--ds-space-20) 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "var(--ds-space-12)",
              alignItems: "center",
            }}
          >
            <div>
              <DSBadge variant="accent" size="md">Mapa</DSBadge>
              <h2
                style={{
                  fontSize: "var(--ds-text-3xl)",
                  fontWeight: "var(--ds-font-bold)",
                  color: "var(--ds-color-text-primary)",
                  marginTop: "var(--ds-space-4)",
                  marginBottom: "var(--ds-space-4)",
                  fontFamily: "var(--ds-font-display)",
                }}
              >
                Navegue com Facilidade
              </h2>
              <p
                style={{
                  fontSize: "var(--ds-text-base)",
                  color: "var(--ds-color-text-muted)",
                  marginBottom: "var(--ds-space-8)",
                  lineHeight: "var(--ds-leading-relaxed)",
                }}
              >
                Abra o mapa interativo e encontre o melhor caminho para qualquer lugar em Holambra.
                Veja rotas, distâncias e tempo de deslocamento em tempo real.
              </p>
              <DSButton variant="primary" size="lg" onClick={() => window.location.href = "/mapa"}>
                Abrir Mapa
                <ArrowRight size={18} />
              </DSButton>
            </div>
            <DSCard variant="glass" padding="lg">
              <div style={{ textAlign: "center", padding: "var(--ds-space-12) 0" }}>
                <MapPin size={64} style={{ margin: "0 auto var(--ds-space-4)", color: "var(--ds-color-accent)" }} />
                <p style={{ fontSize: "var(--ds-text-lg)", color: "var(--ds-color-text-primary)" }}>Mapa Interativo</p>
              </div>
            </DSCard>
          </div>
        </div>
      </section>

      {/* 6) EVENTOS & AGENDA */}
      <section style={{ background: "var(--ds-color-bg-secondary)", padding: "var(--ds-space-20) 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--ds-space-12)" }}>
            <DSBadge variant="accent" size="md">Agenda</DSBadge>
            <h2
              style={{
                fontSize: "var(--ds-text-3xl)",
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginTop: "var(--ds-space-4)",
                fontFamily: "var(--ds-font-display)",
              }}
            >
              Eventos & Agenda
            </h2>
            <p style={{ color: "var(--ds-color-text-muted)", fontSize: "var(--ds-text-lg)", marginTop: "var(--ds-space-2)" }}>
              Não perca o que está acontecendo em Holambra
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)", marginBottom: "var(--ds-space-8)" }}>
            {articles.slice(0, 3).map((article: any) => (
              <Link key={article.id} to={`/blog/${article.slug}`} style={{ textDecoration: "none" }}>
                <DSCard variant="elevated" interactive padding="md">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <h3
                        style={{
                          fontSize: "var(--ds-text-lg)",
                          fontWeight: "var(--ds-font-bold)",
                          color: "var(--ds-color-text-primary)",
                          marginBottom: "var(--ds-space-1)",
                        }}
                      >
                        {article.title}
                      </h3>
                      <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)" }}>
                        {article.publishedAt &&
                          new Date(article.publishedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <ArrowRight size={20} style={{ color: "var(--ds-color-accent)", flexShrink: 0 }} />
                  </div>
                </DSCard>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <DSButton variant="primary" size="lg" onClick={() => window.location.href = "/eventos-em-holambra"}>
              Ver Agenda Completa
              <ArrowRight size={18} />
            </DSButton>
          </div>
        </div>
      </section>

      {/* 7) PARA QUEM É */}
      <section style={{ background: "var(--ds-color-bg-primary)", padding: "var(--ds-space-20) 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--ds-space-12)" }}>
            <DSBadge variant="default" size="md">Público</DSBadge>
            <h2
              style={{
                fontSize: "var(--ds-text-3xl)",
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginTop: "var(--ds-space-4)",
                fontFamily: "var(--ds-font-display)",
              }}
            >
              Para Quem é o Oranje
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "var(--ds-space-8)",
            }}
          >
            {[
              {
                icon: <MapPin size={32} />,
                title: "Turistas de Fim de Semana",
                desc: "Viajantes que querem aproveitar Holambra ao máximo em poucos dias.",
              },
              {
                icon: <Heart size={32} />,
                title: "Casais e Famílias",
                desc: "Experiências especiais para momentos inesquecíveis com quem você ama.",
              },
              {
                icon: <Users size={32} />,
                title: "Experiências Locais Seguras",
                desc: "Quem busca autenticidade com confiança em parceiros verificados.",
              },
            ].map((item) => (
              <DSCard key={item.title} variant="glass" padding="lg">
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "var(--ds-radius-xl)",
                      background: "rgba(230, 81, 0, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto var(--ds-space-4)",
                      color: "var(--ds-color-accent)",
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: "var(--ds-text-xl)",
                      fontWeight: "var(--ds-font-bold)",
                      color: "var(--ds-color-text-primary)",
                      marginBottom: "var(--ds-space-3)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)", lineHeight: "var(--ds-leading-relaxed)" }}>
                    {item.desc}
                  </p>
                </div>
              </DSCard>
            ))}
          </div>
        </div>
      </section>

      {/* 8) PARCEIROS */}
      <section style={{ background: "var(--ds-color-bg-secondary)", padding: "var(--ds-space-20) 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--ds-space-12)" }}>
            <DSBadge variant="accent" size="md">Parceiros</DSBadge>
            <h2
              style={{
                fontSize: "var(--ds-text-3xl)",
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginTop: "var(--ds-space-4)",
                fontFamily: "var(--ds-font-display)",
              }}
            >
              Seja um Parceiro Oranje
            </h2>
            <p style={{ color: "var(--ds-color-text-muted)", fontSize: "var(--ds-text-lg)", marginTop: "var(--ds-space-2)" }}>
              Cresça seu negócio com a plataforma de curadoria local
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--ds-space-6)",
              marginBottom: "var(--ds-space-12)",
            }}
          >
            {[
              { icon: <CheckCircle size={28} />, title: "Visibilidade", desc: "Alcance turistas e locais" },
              { icon: <Star size={28} />, title: "Destaque", desc: "Apareça em roteiros curados" },
              { icon: <Download size={28} />, title: "Vouchers", desc: "Ofertas exclusivas" },
              { icon: <CheckCircle size={28} />, title: "Verificado", desc: "Selo de confiança" },
            ].map((vantagem) => (
              <DSCard key={vantagem.title} variant="glass" padding="md">
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      color: "var(--ds-color-accent)",
                      margin: "0 auto var(--ds-space-3)",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {vantagem.icon}
                  </div>
                  <h3
                    style={{
                      fontWeight: "var(--ds-font-bold)",
                      color: "var(--ds-color-text-primary)",
                      marginBottom: "var(--ds-space-1)",
                    }}
                  >
                    {vantagem.title}
                  </h3>
                  <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)" }}>
                    {vantagem.desc}
                  </p>
                </div>
              </DSCard>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <DSButton variant="primary" size="lg" onClick={() => window.location.href = "/seja-um-parceiro"}>
              Quero ser Parceiro
              <ArrowRight size={18} />
            </DSButton>
          </div>
        </div>
      </section>

      {/* 9) INSTALAR O APP (PWA) */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--ds-color-accent), #BF360C)",
          padding: "var(--ds-space-20) 0",
        }}
      >
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0 var(--ds-space-4)", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "var(--ds-text-4xl)",
              fontWeight: "var(--ds-font-bold)",
              color: "#FFFFFF",
              marginBottom: "var(--ds-space-4)",
              fontFamily: "var(--ds-font-display)",
            }}
          >
            Instale o Oranje
          </h2>
          <p
            style={{
              fontSize: "var(--ds-text-xl)",
              color: "rgba(255,255,255,0.9)",
              marginBottom: "var(--ds-space-12)",
            }}
          >
            Use Oranje como um app nativo no seu celular — sem ocupar espaço e sempre atualizado.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "var(--ds-space-6)",
              marginBottom: "var(--ds-space-12)",
            }}
          >
            {[
              { num: "1", title: "Abra o Oranje", desc: "Acesse a plataforma" },
              { num: "2", title: "Toque em Instalar", desc: "Procure o botão de instalação" },
              { num: "3", title: "Use como App", desc: "Acesse direto da tela inicial" },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "var(--ds-radius-lg)",
                  padding: "var(--ds-space-6)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--ds-text-3xl)",
                    fontWeight: "var(--ds-font-bold)",
                    color: "#FFFFFF",
                    marginBottom: "var(--ds-space-3)",
                    fontFamily: "var(--ds-font-display)",
                  }}
                >
                  {step.num}
                </p>
                <h3 style={{ fontSize: "var(--ds-text-lg)", fontWeight: "var(--ds-font-bold)", color: "#FFFFFF", marginBottom: "var(--ds-space-1)" }}>
                  {step.title}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "var(--ds-text-sm)" }}>{step.desc}</p>
              </div>
            ))}
          </div>

          {installPrompt ? (
            <DSButton
              variant="secondary"
              size="lg"
              onClick={handleInstall}
              iconLeft={<Download size={20} />}
              style={{ background: "#FFFFFF", color: "var(--ds-color-accent)", borderColor: "#FFFFFF" }}
            >
              Instalar Agora
            </DSButton>
          ) : (
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: "var(--ds-radius-lg)",
                padding: "var(--ds-space-6)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: "var(--ds-space-3)" }}>
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
