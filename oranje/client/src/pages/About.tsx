import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Heart,
  Shield,
  Zap,
  Users,
  MapPin,
  Utensils,
  Calendar,
  Car,
  Gift,
  BookOpen,
} from "lucide-react";
import { DSButton } from "@/components/ds/Button";
import { DSCard } from "@/components/ds/Card";
import { DSBadge } from "@/components/ds/Badge";
import { DSHeroSection } from "@/components/ds/HeroSection";
import SiteLayout from "@/components/SiteLayout";

export default function About() {
  const navigate = useNavigate();
  return (
    <SiteLayout>
      {/* HERO */}
      <DSHeroSection
        eyebrow="Sobre Nós"
        title="Conheça o Oranje"
        subtitle="Reunimos o melhor de Holambra em um só lugar — experiências, roteiros, parceiros e descobertas com curadoria premium."
        size="md"
        align="center"
      />

      {/* MISSÃO */}
      <section style={{ background: "var(--ds-color-bg-secondary)", padding: "var(--ds-space-20) 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--ds-space-8)", maxWidth: "56rem", margin: "0 auto" }}>
            <div style={{ textAlign: "center" }}>
              <DSBadge variant="accent" size="md">Nossa Missão</DSBadge>
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
                Conectar pessoas às melhores experiências
              </h2>
              <p
                style={{
                  fontSize: "var(--ds-text-lg)",
                  color: "var(--ds-color-text-secondary)",
                  lineHeight: "var(--ds-leading-relaxed)",
                  maxWidth: "48rem",
                  margin: "0 auto",
                }}
              >
                Oranje reúne o melhor de Holambra em um só lugar. Somos a plataforma que conecta você a
                experiências curadas, roteiros premium, parceiros locais e passeios com motorista —
                tudo com o contexto e o cuidado que a cidade das flores merece.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUEM SOMOS */}
      <section style={{ background: "var(--ds-color-bg-primary)", padding: "var(--ds-space-20) 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--ds-space-8)",
              alignItems: "center",
            }}
          >
            <div>
              <DSBadge variant="default" size="md">Quem Somos</DSBadge>
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
                Tecnologia, turismo e paixão por Holambra
              </h2>
              <p
                style={{
                  fontSize: "var(--ds-text-base)",
                  color: "var(--ds-color-text-secondary)",
                  lineHeight: "var(--ds-leading-relaxed)",
                  marginBottom: "var(--ds-space-6)",
                }}
              >
                Oranje é uma plataforma inovadora desenvolvida para servir turistas, moradores e parceiros de negócios
                em Holambra. Nosso time é apaixonado por tecnologia, turismo e pela cidade. Acreditamos que informação
                de qualidade, acessível e bem organizada, pode transformar experiências.
              </p>
              <DSButton variant="primary" onClick={() => navigate("/app")}>
                Explorar o App
                <ChevronRight size={16} />
              </DSButton>
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--ds-space-4)" }}>
              {[
                { number: "100+", label: "Lugares cadastrados" },
                { number: "50+", label: "Parceiros verificados" },
                { number: "30+", label: "Roteiros criados" },
                { number: "24/7", label: "Disponibilidade" },
              ].map((stat) => (
                <DSCard key={stat.label} variant="glass" padding="md">
                  <div style={{ textAlign: "center" }}>
                    <p
                      style={{
                        fontSize: "var(--ds-text-2xl)",
                        fontWeight: "var(--ds-font-bold)",
                        color: "var(--ds-color-accent)",
                        fontFamily: "var(--ds-font-display)",
                      }}
                    >
                      {stat.number}
                    </p>
                    <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)" }}>
                      {stat.label}
                    </p>
                  </div>
                </DSCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* O QUE OFERECEMOS */}
      <section style={{ background: "var(--ds-color-bg-secondary)", padding: "var(--ds-space-20) 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--ds-space-12)" }}>
            <DSBadge variant="accent" size="md">Funcionalidades</DSBadge>
            <h2
              style={{
                fontSize: "var(--ds-text-3xl)",
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginTop: "var(--ds-space-4)",
                fontFamily: "var(--ds-font-display)",
              }}
            >
              O que oferecemos
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--ds-space-6)",
            }}
          >
            {[
              { icon: <Utensils size={24} />, title: "Restaurantes & Cafés", desc: "Guia completo de restaurantes, bares e cafés com avaliações reais" },
              { icon: <Calendar size={24} />, title: "Eventos", desc: "Calendário de eventos e experiências culturais imperdíveis" },
              { icon: <MapPin size={24} />, title: "Pontos Turísticos", desc: "Informações sobre os melhores pontos turísticos da cidade" },
              { icon: <Car size={24} />, title: "Transporte", desc: "Sistema de transporte confiável com motoristas parceiros" },
              { icon: <Gift size={24} />, title: "Ofertas Exclusivas", desc: "Promoções e vouchers exclusivos para nossos usuários" },
              { icon: <BookOpen size={24} />, title: "Conteúdo Editorial", desc: "Artigos e guias sobre o melhor de Holambra" },
            ].map((item) => (
              <DSCard key={item.title} variant="elevated" interactive padding="lg">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--ds-space-4)",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "var(--ds-radius-lg)",
                      background: "rgba(230, 81, 0, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: "var(--ds-color-accent)",
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "var(--ds-text-lg)",
                        fontWeight: "var(--ds-font-semibold)",
                        color: "var(--ds-color-text-primary)",
                        marginBottom: "var(--ds-space-1)",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)", lineHeight: "var(--ds-leading-relaxed)" }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </DSCard>
            ))}
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section style={{ background: "var(--ds-color-bg-primary)", padding: "var(--ds-space-20) 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--ds-space-12)" }}>
            <DSBadge variant="default" size="md">Princípios</DSBadge>
            <h2
              style={{
                fontSize: "var(--ds-text-3xl)",
                fontWeight: "var(--ds-font-bold)",
                color: "var(--ds-color-text-primary)",
                marginTop: "var(--ds-space-4)",
                fontFamily: "var(--ds-font-display)",
              }}
            >
              Nossos Valores
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
                icon: <Heart size={32} />,
                title: "Qualidade",
                desc: "Informações precisas e atualizadas. Cada lugar é verificado pela nossa equipe.",
              },
              {
                icon: <Shield size={32} />,
                title: "Confiança",
                desc: "Parceiros verificados e seguros. Transparência em todas as interações.",
              },
              {
                icon: <Zap size={32} />,
                title: "Inovação",
                desc: "Tecnologia ao serviço da experiência. Interface moderna e intuitiva.",
              },
            ].map((value) => (
              <DSCard key={value.title} variant="glass" padding="lg">
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
                    {value.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: "var(--ds-text-xl)",
                      fontWeight: "var(--ds-font-semibold)",
                      color: "var(--ds-color-accent)",
                      marginBottom: "var(--ds-space-2)",
                    }}
                  >
                    {value.title}
                  </h3>
                  <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)", lineHeight: "var(--ds-leading-relaxed)" }}>
                    {value.desc}
                  </p>
                </div>
              </DSCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--ds-color-accent), #BF360C)",
          padding: "var(--ds-space-16) 0",
        }}
      >
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0 var(--ds-space-4)", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "var(--ds-text-3xl)",
              fontWeight: "var(--ds-font-bold)",
              color: "#FFFFFF",
              marginBottom: "var(--ds-space-4)",
              fontFamily: "var(--ds-font-display)",
            }}
          >
            Pronto para explorar?
          </h2>
          <p
            style={{
              fontSize: "var(--ds-text-lg)",
              color: "rgba(255,255,255,0.9)",
              marginBottom: "var(--ds-space-8)",
            }}
          >
            Tem dúvidas?{" "}
            <Link to="/contato" style={{ color: "#FFFFFF", textDecoration: "underline", fontWeight: 600 }}>
              Entre em contato conosco
            </Link>
            .
          </p>
          <div style={{ display: "flex", gap: "var(--ds-space-4)", justifyContent: "center", flexWrap: "wrap" }}>
            <DSButton
              variant="secondary"
              size="lg"
              onClick={() => navigate("/app")}
              style={{ background: "#FFFFFF", color: "var(--ds-color-accent)", borderColor: "#FFFFFF" }}
            >
              Abrir o App
              <ChevronRight size={18} />
            </DSButton>
            <DSButton
              variant="secondary"
              size="lg"
              onClick={() => navigate("/contato")}
              style={{ borderColor: "rgba(255,255,255,0.5)", color: "#FFFFFF" }}
            >
              Fale Conosco
            </DSButton>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
