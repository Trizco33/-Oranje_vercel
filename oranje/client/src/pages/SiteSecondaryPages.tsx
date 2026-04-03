import { Suspense, lazy } from "react";
import { useLocation, Link } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import { Mail, Phone, MapPin, MessageCircle, ArrowRight, CheckCircle, Instagram, Navigation } from "lucide-react";
import { DSButton } from "@/components/ds/Button";
import { DSCard } from "@/components/ds/Card";
import { DSBadge } from "@/components/ds/Badge";
import { DSInput } from "@/components/ds/Input";
import { trpc } from "@/lib/trpc";

const SiteMapView = lazy(() => import("@/components/SiteMapView"));

function resolveInstagramHref(value: string | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const handle = value.replace(/^@/, "");
  return `https://instagram.com/${handle}`;
}

function ContatoSection() {
  const { data: contact } = trpc.content.getContact.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const email = contact?.email || "contato@oranje.com.br";
  const phone = contact?.phone || "";
  const address = contact?.address || "Holambra, SP";
  const instagramHref = resolveInstagramHref(contact?.instagram || undefined);
  const instagramLabel = (() => {
    const raw = contact?.instagram;
    if (!raw) return null;
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      try {
        const pathname = new URL(raw).pathname.replace(/^\//, "");
        return pathname ? `@${pathname}` : raw;
      } catch {
        return raw;
      }
    }
    return raw.startsWith("@") ? raw : `@${raw}`;
  })();

  const channels: { icon: React.ReactNode; title: string; info: string; href: string }[] = [
    { icon: <Mail size={28} />, title: "Email", info: email, href: `mailto:${email}` },
    ...(phone ? [{ icon: <Phone size={28} />, title: "Telefone", info: phone, href: `tel:${phone.replace(/\D/g, "")}` }] : []),
    { icon: <MapPin size={28} />, title: "Localização", info: address, href: "" },
    ...(instagramHref && instagramLabel
      ? [{ icon: <Instagram size={28} />, title: "Instagram", info: instagramLabel, href: instagramHref }]
      : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-8)" }}>
      <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
        Tem dúvidas, sugestões ou quer reportar um problema? Entre em contato conosco através dos canais abaixo.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--ds-space-4)",
        }}
      >
        {channels.map((ch) => (
          <DSCard key={ch.title} variant="glass" interactive padding="md">
            <div style={{ color: "var(--ds-color-accent)", marginBottom: "var(--ds-space-3)" }}>{ch.icon}</div>
            <h3 style={{ fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-1)" }}>
              {ch.title}
            </h3>
            {ch.href ? (
              <a
                href={ch.href}
                style={{ color: "var(--ds-color-accent)", textDecoration: "none", fontSize: "var(--ds-text-sm)" }}
                target={ch.href.startsWith("http") ? "_blank" : undefined}
                rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {ch.info}
              </a>
            ) : (
              <p style={{ color: "var(--ds-color-text-muted)", fontSize: "var(--ds-text-sm)" }}>{ch.info}</p>
            )}
          </DSCard>
        ))}
      </div>

      <DSCard variant="elevated" padding="lg">
        <h3 style={{ fontSize: "var(--ds-text-xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-6)" }}>
          Formulário de Contato
        </h3>
        <form style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
          <DSInput label="Nome" />
          <DSInput label="Email" />
          <div>
            <label
              style={{
                display: "block",
                fontSize: "var(--ds-text-sm)",
                fontWeight: "var(--ds-font-medium)",
                color: "var(--ds-color-text-primary)",
                marginBottom: "var(--ds-space-1)",
              }}
            >
              Mensagem
            </label>
            <textarea
              style={{
                width: "100%",
                minHeight: "8rem",
                padding: "var(--ds-space-3)",
                borderRadius: "var(--ds-radius-lg)",
                border: "1px solid var(--ds-color-border)",
                background: "var(--ds-color-bg-primary)",
                color: "var(--ds-color-text-primary)",
                fontSize: "var(--ds-text-base)",
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ds-color-accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ds-color-border)")}
            />
          </div>
          <DSButton variant="primary" size="lg" fullWidth>
            Enviar Mensagem
          </DSButton>
        </form>
      </DSCard>
    </div>
  );
}

const pages: Record<string, { title: string; subtitle: string; component: React.ReactNode }> = {
  roteiros: {
    title: "Roteiros em Holambra",
    subtitle: "Explore a cidade com roteiros planejados",
    component: (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-6)" }}>
        <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
          Descubra roteiros cuidadosamente planejados para aproveitar o melhor de Holambra. Cada roteiro é desenvolvido para oferecer uma experiência única e memorável.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "var(--ds-space-6)",
          }}
        >
          {[
            { title: "Roteiro Romântico", desc: "Perfeito para casais" },
            { title: "Roteiro Gastronômico", desc: "Para amantes de boa comida" },
            { title: "Roteiro Cultural", desc: "Explorar arte e história" },
            { title: "Roteiro Familiar", desc: "Diversão para toda a família" },
          ].map((r, i) => (
            <DSCard key={i} variant="elevated" interactive padding="md">
              <h3 style={{ fontSize: "var(--ds-text-lg)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-2)" }}>
                {r.title}
              </h3>
              <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)", marginBottom: "var(--ds-space-4)" }}>
                {r.desc}
              </p>
              <Link to="/app" style={{ textDecoration: "none" }}>
                <DSButton variant="secondary" size="sm" fullWidth>Ver Detalhes</DSButton>
              </Link>
            </DSCard>
          ))}
        </div>
      </div>
    ),
  },
  mapa: {
    title: "Mapa de Holambra",
    subtitle: "Veja os pontos turísticos, restaurantes e atrações no mapa interativo",
    component: (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-6)" }}>
        <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
          O mapa abaixo mostra os principais pontos de interesse de Holambra. Use o app para ver todos os lugares com filtros, avaliações e navegação em tempo real.
        </p>

        {/* Mapa embutido */}
        <div style={{ borderRadius: "var(--ds-radius-xl)", overflow: "hidden", border: "1px solid rgba(230,81,0,0.15)", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
          <Suspense fallback={
            <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ds-color-bg-secondary)" }}>
              <div style={{ textAlign: "center" }}>
                <MapPin size={32} style={{ color: "var(--ds-color-accent)", margin: "0 auto 8px" }} />
                <p style={{ color: "var(--ds-color-text-muted)", fontSize: "var(--ds-text-sm)" }}>Carregando mapa...</p>
              </div>
            </div>
          }>
            <SiteMapView height="420px" />
          </Suspense>
        </div>

        {/* CTA para experiência completa */}
        <DSCard variant="glass" padding="lg">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-4)", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)", marginBottom: "var(--ds-space-1)" }}>
                <Navigation size={16} style={{ color: "var(--ds-color-accent)" }} />
                <p style={{ fontWeight: 700, color: "var(--ds-color-text-primary)", fontSize: "var(--ds-text-base)", fontFamily: "var(--ds-font-display)" }}>
                  Perto de você
                </p>
              </div>
              <p style={{ color: "var(--ds-color-text-muted)", fontSize: "var(--ds-text-sm)" }}>
                Veja lugares próximos à sua localização em tempo real com o mapa interativo do app Oranje.
              </p>
            </div>
            <Link to="/app" style={{ textDecoration: "none", flexShrink: 0 }}>
              <DSButton variant="primary" size="md">Abrir no App</DSButton>
            </Link>
          </div>
        </DSCard>
      </div>
    ),
  },
  parceiros: {
    title: "Parceiros Oranje",
    subtitle: "Conheça os melhores negócios de Holambra",
    component: (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-6)" }}>
        <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
          Somos parceiros com os melhores restaurantes, cafés, hotéis e atrações de Holambra. Cada parceiro foi selecionado por qualidade e excelência no atendimento.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "var(--ds-space-4)",
          }}
        >
          {["Restaurantes", "Cafés", "Hotéis", "Atrações", "Lojas", "Serviços"].map((cat, i) => (
            <DSCard key={i} variant="glass" interactive padding="md">
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "var(--ds-text-lg)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-1)" }}>
                  {cat}
                </h3>
                <p style={{ fontSize: "var(--ds-text-xs)", color: "var(--ds-color-text-muted)" }}>
                  Veja todos os parceiros
                </p>
              </div>
            </DSCard>
          ))}
        </div>
        <DSCard variant="elevated" padding="lg">
          <div style={{ borderLeft: "3px solid var(--ds-color-accent)", paddingLeft: "var(--ds-space-4)" }}>
            <h3 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-3)" }}>
              Seja um Parceiro
            </h3>
            <p style={{ color: "var(--ds-color-text-muted)", marginBottom: "var(--ds-space-6)", lineHeight: "var(--ds-leading-relaxed)" }}>
              Aumente a visibilidade do seu negócio e conecte-se com milhares de visitantes de Holambra.
            </p>
            <Link to="/seja-um-parceiro" style={{ textDecoration: "none" }}>
              <DSButton variant="primary" size="lg">Quero ser Parceiro</DSButton>
            </Link>
          </div>
        </DSCard>
      </div>
    ),
  },
  "seja-um-parceiro": {
    title: "Seja um Parceiro Oranje",
    subtitle: "Cresça seu negócio com a gente",
    component: (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-8)" }}>
        <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
          Oranje oferece uma plataforma completa para aumentar a visibilidade do seu negócio em Holambra. Conecte-se com milhares de visitantes e clientes potenciais.
        </p>

        <div>
          <DSBadge variant="accent" size="md">Benefícios</DSBadge>
          <h2 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginTop: "var(--ds-space-3)", marginBottom: "var(--ds-space-4)" }}>
            Benefícios de ser Parceiro
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}>
            {[
              "Visibilidade em nosso app e site",
              "Acesso a ferramentas de marketing",
              "Analytics e insights sobre seus clientes",
              "Suporte dedicado",
              "Promoções e campanhas especiais",
              "Integração com sistema de avaliações",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
                <CheckCircle size={18} style={{ color: "var(--ds-color-accent)", flexShrink: 0 }} />
                <span style={{ color: "var(--ds-color-text-secondary)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <DSBadge variant="default" size="md">Processo</DSBadge>
          <h2 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginTop: "var(--ds-space-3)", marginBottom: "var(--ds-space-4)" }}>
            Como Funciona
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
            {[
              { step: "1", title: "Cadastro", desc: "Preencha o formulário com informações do seu negócio" },
              { step: "2", title: "Aprovação", desc: "Nossa equipe analisa e aprova seu cadastro" },
              { step: "3", title: "Ativação", desc: "Seu negócio aparece no app e site" },
            ].map((s) => (
              <DSCard key={s.step} variant="glass" padding="md">
                <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-4)" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "var(--ds-radius-full)",
                      background: "var(--ds-color-accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                      fontWeight: "var(--ds-font-bold)",
                      flexShrink: 0,
                    }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-1)" }}>
                      {s.title}
                    </h3>
                    <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)" }}>{s.desc}</p>
                  </div>
                </div>
              </DSCard>
            ))}
          </div>
        </div>

        <DSCard variant="elevated" padding="lg">
          <h3 style={{ fontSize: "var(--ds-text-xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-4)" }}>
            Entre em Contato
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
              <Mail size={20} style={{ color: "var(--ds-color-accent)" }} />
              <a href="mailto:parceiros@oranje.com.br" style={{ color: "var(--ds-color-text-secondary)", textDecoration: "none" }}>
                parceiros@oranje.com.br
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
              <Phone size={20} style={{ color: "var(--ds-color-accent)" }} />
              <a href="tel:+551940000000" style={{ color: "var(--ds-color-text-secondary)", textDecoration: "none" }}>
                (19) 4000-0000
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
              <MessageCircle size={20} style={{ color: "var(--ds-color-accent)" }} />
              <a href="https://wa.me/5519999999999" style={{ color: "var(--ds-color-text-secondary)", textDecoration: "none" }}>
                WhatsApp
              </a>
            </div>
          </div>
        </DSCard>
      </div>
    ),
  },
  sobre: {
    title: "Sobre Oranje",
    subtitle: "Conheça nossa história e missão",
    component: (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-8)" }}>
        <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
          Oranje é um guia completo de Holambra, desenvolvido para ajudar visitantes e moradores a descobrir o melhor que a cidade tem a oferecer.
        </p>

        {[
          { badge: "Missão", title: "Nossa Missão", text: "Conectar pessoas com as melhores experiências em Holambra, promovendo turismo sustentável e apoiando negócios locais." },
          { badge: "Visão", title: "Nossa Visão", text: "Ser o guia definitivo de Holambra, oferecendo informações precisas, atualizadas e úteis para todos os visitantes." },
        ].map((section) => (
          <div key={section.badge}>
            <DSBadge variant="accent" size="md">{section.badge}</DSBadge>
            <h2 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginTop: "var(--ds-space-3)", marginBottom: "var(--ds-space-3)" }}>
              {section.title}
            </h2>
            <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
              {section.text}
            </p>
          </div>
        ))}

        <div>
          <DSBadge variant="default" size="md">Princípios</DSBadge>
          <h2 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginTop: "var(--ds-space-3)", marginBottom: "var(--ds-space-4)" }}>
            Valores
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}>
            {[
              "Qualidade: Selecionamos apenas os melhores lugares",
              "Transparência: Avaliações honestas de usuários",
              "Inovação: Tecnologia a serviço do turismo",
              "Sustentabilidade: Apoio ao desenvolvimento local responsável",
            ].map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
                <CheckCircle size={18} style={{ color: "var(--ds-color-accent)", flexShrink: 0 }} />
                <span style={{ color: "var(--ds-color-text-secondary)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <DSBadge variant="accent" size="md">Time</DSBadge>
          <h2 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginTop: "var(--ds-space-3)", marginBottom: "var(--ds-space-3)" }}>
            Equipe
          </h2>
          <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
            Somos uma equipe apaixonada por Holambra, dedicada a criar a melhor experiência possível para nossos usuários.
          </p>
        </div>
      </div>
    ),
  },
  contato: {
    title: "Entre em Contato",
    subtitle: "Estamos aqui para ajudar",
    component: <ContatoSection />,
  },
  privacidade: {
    title: "Política de Privacidade",
    subtitle: "Como protegemos seus dados",
    component: (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-6)" }}>
        <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
          A privacidade dos nossos usuários é importante para nós. Esta política explica como coletamos, usamos e protegemos seus dados.
        </p>

        {[
          { title: "Coleta de Dados", text: "Coletamos informações que você nos fornece voluntariamente, como nome, email e preferências. Também coletamos dados de uso do app para melhorar nossos serviços." },
          { title: "Uso de Dados", text: "Usamos seus dados para fornecer serviços, enviar notificações, melhorar o app e cumprir obrigações legais." },
          { title: "Proteção de Dados", text: "Implementamos medidas de segurança para proteger seus dados contra acesso não autorizado. Seus dados são armazenados em servidores seguros." },
          { title: "Seus Direitos", text: "Você tem o direito de acessar, corrigir ou deletar seus dados. Entre em contato conosco para exercer esses direitos." },
        ].map((section) => (
          <div key={section.title}>
            <h2 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-3)" }}>
              {section.title}
            </h2>
            <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
              {section.text}
            </p>
          </div>
        ))}

        <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)" }}>
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
    ),
  },
  termos: {
    title: "Termos de Serviço",
    subtitle: "Condições de uso do Oranje",
    component: (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-6)" }}>
        <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
          Ao usar o Oranje, você concorda com estes termos de serviço. Se não concordar, não use nosso app ou site.
        </p>

        <div>
          <h2 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-3)" }}>
            Uso Aceitável
          </h2>
          <p style={{ color: "var(--ds-color-text-secondary)", marginBottom: "var(--ds-space-3)", lineHeight: "var(--ds-leading-relaxed)" }}>
            Você concorda em usar o Oranje apenas para fins legítimos e não deve:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-2)", paddingLeft: "var(--ds-space-2)" }}>
            {[
              "Violar leis ou regulamentos",
              "Infringir direitos de terceiros",
              "Enviar conteúdo ofensivo ou prejudicial",
              "Tentar acessar sistemas sem autorização",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--ds-color-accent)", flexShrink: 0 }} />
                <span style={{ color: "var(--ds-color-text-secondary)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {[
          { title: "Limitação de Responsabilidade", text: 'O Oranje é fornecido "como está". Não garantimos que o app funcionará sem interrupções ou erros.' },
          { title: "Modificações", text: "Podemos modificar estes termos a qualquer momento. Continuando a usar o app, você aceita as modificações." },
          { title: "Contato", text: "Para dúvidas sobre estes termos, entre em contato conosco em contato@oranje.com.br" },
        ].map((section) => (
          <div key={section.title}>
            <h2 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-3)" }}>
              {section.title}
            </h2>
            <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
              {section.text}
            </p>
          </div>
        ))}

        <p style={{ fontSize: "var(--ds-text-sm)", color: "var(--ds-color-text-muted)" }}>
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
    ),
  },
};

export default function SiteSecondaryPages() {
  const location = useLocation();
  const pageKey = location.pathname.replace(/^\//, "");
  const pageData = pages[pageKey || ""];

  if (!pageData) {
    return (
      <SiteLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)" }}>
              Página não encontrada
            </h1>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--ds-color-bg-secondary) 0%, var(--ds-color-bg-primary) 100%)",
          padding: "var(--ds-space-12) 0 var(--ds-space-16)",
        }}
      >
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: "var(--ds-font-bold)",
              color: "var(--ds-color-text-primary)",
              marginBottom: "var(--ds-space-4)",
              fontFamily: "var(--ds-font-display)",
            }}
          >
            {pageData.title}
          </h1>
          <p style={{ fontSize: "var(--ds-text-xl)", color: "var(--ds-color-text-muted)" }}>
            {pageData.subtitle}
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "var(--ds-space-16) 0", background: "var(--ds-color-bg-primary)" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0 var(--ds-space-4)" }}>
          {pageData.component}
        </div>
      </section>
    </SiteLayout>
  );
}
