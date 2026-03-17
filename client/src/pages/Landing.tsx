import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  MapPin,
  Calendar,
  Coffee,
  Car,
  Utensils,
  Star,
  ArrowRight,
  Sparkles,
  Clock,
  Shield,
  Users,
} from "lucide-react";
import { DSButton } from "@/components/ds/Button";
import { DSCard } from "@/components/ds/Card";
import { DSBadge } from "@/components/ds/Badge";
import { DSHeroSection } from "@/components/ds/HeroSection";

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE — PROPOSTA DE REDESIGN
   Visual premium inspirado em Stripe/Linear/Vercel
   Design System Oranje aplicado rigorosamente
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Landing() {
  const navigate = useNavigate();
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(() => {
    const checkPWA = async () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsPWAInstalled(true);
      }
    };
    checkPWA();

    const handleScroll = () => {
      setShowFloatingButton(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenApp = () => navigate("/app");

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--ds-color-bg-primary)" }}
    >
      {/* ─── HEADER ─── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: "var(--ds-color-bg-overlay)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--ds-color-border-subtle)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex-shrink-0 border-0 bg-transparent cursor-pointer p-0"
          >
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--ds-color-accent)" }}
            >
              Oranje
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Início", href: "#inicio" },
              { label: "Restaurantes", href: "#restaurantes" },
              { label: "Eventos", href: "#eventos" },
              { label: "Cafés", href: "#cafes" },
              { label: "Transporte", href: "#transporte" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                style={{
                  color: "var(--ds-color-text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--ds-color-text-primary)";
                  e.currentTarget.style.background = "var(--ds-color-bg-surface)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--ds-color-text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {item.label}
              </a>
            ))}
            <div className="w-px h-5 mx-2" style={{ background: "var(--ds-color-border-default)" }} />
            <DSButton variant="primary" size="sm" onClick={handleOpenApp}>
              Abrir App
            </DSButton>
          </nav>

          {/* Mobile CTA */}
          <DSButton variant="primary" size="sm" onClick={handleOpenApp} className="md:hidden">
            App
          </DSButton>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <DSHeroSection
        id="inicio"
        title="Seu guia definitivo de Holambra"
        subtitle="Restaurantes, eventos, cafés e transporte premium — tudo em um só lugar. Descubra o melhor da cidade das flores."
        size="lg"
        align="center"
        backgroundImage="https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Montagem_Holambra.jpg/960px-Montagem_Holambra.jpg"
        eyebrow={
          <DSBadge variant="accent" size="md" icon={<Sparkles size={14} />}>
            Descubra Holambra
          </DSBadge>
        }
        cta={
          <DSButton
            variant="primary"
            size="lg"
            onClick={handleOpenApp}
            iconRight={<ChevronRight size={20} />}
          >
            Explorar agora
          </DSButton>
        }
        ctaSecondary={
          <DSButton
            variant="secondary"
            size="lg"
            onClick={() => navigate("/parcerias")}
          >
            Quero ser parceiro
          </DSButton>
        }
        bottomContent={
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              { value: "50+", label: "Estabelecimentos" },
              { value: "20+", label: "Eventos/ano" },
              { value: "4.9★", label: "Avaliação média" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-2xl sm:text-3xl font-bold mb-1"
                  style={{ color: "var(--ds-color-accent)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs sm:text-sm uppercase tracking-wider"
                  style={{ color: "var(--ds-color-text-muted)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        }
        className="pt-16"
      />

      {/* ─── SEÇÃO: RESTAURANTES ─── */}
      <section
        id="restaurantes"
        className="py-20 sm:py-28 px-4 sm:px-6"
        style={{ background: "var(--ds-color-bg-secondary)" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="max-w-2xl mb-12 sm:mb-16">
            <DSBadge variant="accent" size="sm" className="mb-4">
              Gastronomia
            </DSBadge>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight"
              style={{ color: "var(--ds-color-text-primary)" }}
            >
              Onde comer em Holambra
            </h2>
            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: "var(--ds-color-text-secondary)" }}
            >
              A gastronomia de Holambra reflete sua riqueza cultural. Encontre os
              melhores restaurantes com avaliações, fotos e reservas.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                title: "Culinária Holandesa",
                desc: "Pratos tradicionais que celebram as raízes europeias da cidade",
                icon: Utensils,
                image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
              },
              {
                title: "Cozinha Brasileira",
                desc: "Sabores regionais preparados com ingredientes locais e frescos",
                icon: Star,
                image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
              },
              {
                title: "Bistrôs & Fine Dining",
                desc: "Experiências gastronômicas exclusivas para ocasiões especiais",
                icon: Sparkles,
                image: "https://placehold.co/1200x600/e2e8f0/1e293b?text=photo_representing_fine_dining_or_upscale_restaura",
              },
            ].map((item) => (
              <DSCard
                key={item.title}
                variant="elevated"
                interactive
                image={item.image}
                imageAlt={item.title}
                imageAspect="video"
                overlay
                padding="md"
                className="cursor-pointer group"
                onClick={handleOpenApp}
                overlayContent={
                  <div className="absolute bottom-3 left-3">
                    <DSBadge variant="accent" size="sm" icon={<item.icon size={12} />}>
                      {item.title}
                    </DSBadge>
                  </div>
                }
              >
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--ds-color-text-primary)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "var(--ds-color-text-muted)" }}
                >
                  {item.desc}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2"
                  style={{ color: "var(--ds-color-accent)" }}
                >
                  Ver restaurantes <ArrowRight size={14} />
                </span>
              </DSCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO: EVENTOS ─── */}
      <section
        id="eventos"
        className="py-20 sm:py-28 px-4 sm:px-6"
        style={{ background: "var(--ds-color-bg-primary)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text side */}
            <div>
              <DSBadge variant="accent" size="sm" className="mb-4">
                Eventos
              </DSBadge>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight"
                style={{ color: "var(--ds-color-text-primary)" }}
              >
                Eventos e experiências únicas
              </h2>
              <p
                className="text-base sm:text-lg leading-relaxed mb-8"
                style={{ color: "var(--ds-color-text-secondary)" }}
              >
                A Expoflora, maior exposição de flores do Brasil, é só o começo.
                Holambra oferece festivais, workshops e experiências imersivas o
                ano inteiro. Fique sempre atualizado com Oranje.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Calendar, text: "Calendário completo de eventos" },
                  { icon: Clock, text: "Notificações de novos eventos" },
                  { icon: MapPin, text: "Localização e como chegar" },
                ].map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--ds-color-accent-muted)" }}
                    >
                      <feature.icon size={18} style={{ color: "var(--ds-color-accent)" }} />
                    </div>
                    <span
                      className="text-sm sm:text-base"
                      style={{ color: "var(--ds-color-text-secondary)" }}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <DSButton
                variant="primary"
                size="md"
                onClick={handleOpenApp}
                iconRight={<ArrowRight size={18} />}
              >
                Ver eventos
              </DSButton>
            </div>

            {/* Visual side */}
            <div className="relative">
              <DSCard
                variant="glass"
                image="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80"
                imageAlt="Eventos em Holambra"
                imageAspect="square"
                overlay
                overlayContent={
                  <div className="absolute bottom-4 left-4 right-4">
                    <DSBadge variant="success" size="sm" dot className="mb-2">
                      Próximo evento
                    </DSBadge>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: "var(--ds-color-text-primary)" }}
                    >
                      Expoflora 2026
                    </h3>
                    <p className="text-sm" style={{ color: "var(--ds-color-text-muted)" }}>
                      Setembro — Outubro 2026
                    </p>
                  </div>
                }
              />
              {/* Decorative glow */}
              <div
                className="absolute -inset-4 -z-10 rounded-3xl blur-3xl opacity-20"
                style={{ background: "var(--ds-color-accent)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO: CAFÉS ─── */}
      <section
        id="cafes"
        className="py-20 sm:py-28 px-4 sm:px-6"
        style={{ background: "var(--ds-color-bg-secondary)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <DSBadge variant="accent" size="sm" className="mb-4">
              Cafés & Docerias
            </DSBadge>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight"
              style={{ color: "var(--ds-color-text-primary)" }}
            >
              Cafés especiais e docerias
            </h2>
            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: "var(--ds-color-text-secondary)" }}
            >
              De cafés artesanais a docerias tradicionais holandesas, Holambra
              é um paraíso para quem aprecia boas experiências gastronômicas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {[
              {
                title: "Cafés Artesanais",
                desc: "Grãos selecionados e preparações especiais em ambientes aconchegantes",
                icon: Coffee,
                image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
              },
              {
                title: "Docerias & Confeitarias",
                desc: "Tradição holandesa e criatividade brasileira em cada doce",
                icon: Star,
                image: "https://texasdebrazil.com/wp-content/uploads/2024/09/Desserts.jpg",
              },
            ].map((item) => (
              <DSCard
                key={item.title}
                variant="elevated"
                interactive
                image={item.image}
                imageAlt={item.title}
                imageAspect="video"
                overlay
                padding="md"
                className="cursor-pointer group"
                onClick={handleOpenApp}
                overlayContent={
                  <div className="absolute bottom-3 left-3">
                    <DSBadge variant="accent" size="sm" icon={<item.icon size={12} />}>
                      {item.title}
                    </DSBadge>
                  </div>
                }
              >
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--ds-color-text-primary)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "var(--ds-color-text-muted)" }}
                >
                  {item.desc}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2"
                  style={{ color: "var(--ds-color-accent)" }}
                >
                  Explorar <ArrowRight size={14} />
                </span>
              </DSCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO: TRANSPORTE ─── */}
      <section
        id="transporte"
        className="py-20 sm:py-28 px-4 sm:px-6"
        style={{ background: "var(--ds-color-bg-primary)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Visual side */}
            <div className="order-2 lg:order-1">
              <DSCard variant="glass" padding="lg" className="relative overflow-visible">
                {/* Abstract transport illustration using styled divs */}
                <div className="space-y-4">
                  {[
                    { icon: Car, label: "Motoristas verificados", detail: "Parceiros de confiança" },
                    { icon: Shield, label: "Segurança garantida", detail: "Viaje com tranquilidade" },
                    { icon: Clock, label: "Pontualidade", detail: "Sempre no horário combinado" },
                    { icon: MapPin, label: "Cobertura completa", detail: "Toda região de Holambra" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-4 p-3 rounded-xl transition-colors duration-200"
                      style={{ background: "var(--ds-color-bg-surface)" }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--ds-color-accent-muted)" }}
                      >
                        <item.icon size={22} style={{ color: "var(--ds-color-accent)" }} />
                      </div>
                      <div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "var(--ds-color-text-primary)" }}
                        >
                          {item.label}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--ds-color-text-muted)" }}
                        >
                          {item.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Decorative glow */}
                <div
                  className="absolute -inset-4 -z-10 rounded-3xl blur-3xl opacity-15"
                  style={{ background: "var(--ds-color-accent)" }}
                />
              </DSCard>
            </div>

            {/* Text side */}
            <div className="order-1 lg:order-2">
              <DSBadge variant="accent" size="sm" className="mb-4">
                Transporte
              </DSBadge>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight"
                style={{ color: "var(--ds-color-text-primary)" }}
              >
                Transporte confiável e premium
              </h2>
              <p
                className="text-base sm:text-lg leading-relaxed mb-8"
                style={{ color: "var(--ds-color-text-secondary)" }}
              >
                Oranje conecta você com motoristas verificados que conhecem
                Holambra. Segurança, conforto e pontualidade garantidos em cada
                viagem. Reserve com facilidade pelo app.
              </p>
              <DSButton
                variant="primary"
                size="md"
                onClick={handleOpenApp}
                iconRight={<ArrowRight size={18} />}
              >
                Solicitar transporte
              </DSButton>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section
        className="py-20 sm:py-28 px-4 sm:px-6 text-center relative overflow-hidden"
        style={{ background: "var(--ds-color-bg-primary)" }}
      >
        {/* Decorative gradient orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-15"
          style={{ background: "var(--ds-color-accent)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          <DSBadge variant="accent" size="md" icon={<Sparkles size={14} />} className="mb-6">
            Comece agora
          </DSBadge>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight"
            style={{ color: "var(--ds-color-text-primary)" }}
          >
            Sua jornada em Holambra começa aqui
          </h2>
          <p
            className="text-base sm:text-lg mb-10 leading-relaxed"
            style={{ color: "var(--ds-color-text-secondary)" }}
          >
            Baixe Oranje agora e descubra restaurantes, eventos, cafés e
            transporte — tudo que a cidade das flores tem a oferecer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <DSButton
              variant="primary"
              size="lg"
              onClick={handleOpenApp}
              iconRight={<ChevronRight size={20} />}
            >
              Abrir App gratuitamente
            </DSButton>
            <DSButton
              variant="secondary"
              size="lg"
              onClick={() => navigate("/parcerias")}
            >
              Seja um parceiro
            </DSButton>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className="py-16 px-4 sm:px-6"
        style={{
          background: "var(--ds-color-bg-secondary)",
          borderTop: "1px solid var(--ds-color-border-subtle)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <span
                className="text-xl font-bold tracking-tight block mb-3"
                style={{ color: "var(--ds-color-accent)" }}
              >
                Oranje
              </span>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--ds-color-text-muted)" }}
              >
                Seu guia definitivo para descobrir o melhor de Holambra.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--ds-color-text-secondary)" }}
              >
                Navegação
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Guia", to: "/guia" },
                  { label: "Sobre", to: "/sobre" },
                  { label: "Parcerias", to: "/parcerias" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm transition-colors duration-200 hover:opacity-100"
                      style={{ color: "var(--ds-color-text-muted)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--ds-color-text-secondary)" }}
              >
                Legal
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Privacidade", to: "/privacidade" },
                  { label: "Termos", to: "/termos" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm transition-colors duration-200 hover:opacity-100"
                      style={{ color: "var(--ds-color-text-muted)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--ds-color-text-secondary)" }}
              >
                Contato
              </h4>
              <Link
                to="/contato"
                className="text-sm transition-colors duration-200 hover:opacity-100"
                style={{ color: "var(--ds-color-text-muted)" }}
              >
                Fale conosco
              </Link>
            </div>
          </div>

          {/* Divider + copyright */}
          <div
            className="pt-8 text-center"
            style={{ borderTop: "1px solid var(--ds-color-border-subtle)" }}
          >
            <p
              className="text-xs"
              style={{ color: "var(--ds-color-text-subtle)" }}
            >
              © 2026 Oranje. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING APP BUTTON ─── */}
      <div
        className="fixed bottom-6 right-6 z-40 transition-all duration-500"
        style={{
          opacity: showFloatingButton ? 1 : 0,
          transform: showFloatingButton ? "translateY(0)" : "translateY(20px)",
          pointerEvents: showFloatingButton ? "auto" : "none",
        }}
      >
        <DSButton
          variant="primary"
          size="lg"
          onClick={handleOpenApp}
          iconRight={<ChevronRight size={18} />}
          className="shadow-lg"
        >
          Abrir App
        </DSButton>
      </div>
    </div>
  );
}
