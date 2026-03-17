import SiteContentPage from "./SiteContentPage";
import { DSBadge } from "@/components/ds/Badge";
import { CheckCircle } from "lucide-react";

export default function SiteWhatToDo() {
  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-6)" }}>
      <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
        Holambra é uma cidade encantadora no interior de São Paulo, conhecida por suas flores, gastronomia e atrações culturais. Há muito o que fazer para todos os gostos e idades.
      </p>

      <div>
        <DSBadge variant="accent" size="md">Atrações</DSBadge>
        <h2 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginTop: "var(--ds-space-3)", marginBottom: "var(--ds-space-3)" }}>
          Atrações Principais
        </h2>
        <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
          Descubra os principais pontos turísticos de Holambra, desde museus e galerias até parques e espaços verdes. A cidade oferece experiências únicas para famílias, casais e grupos de amigos.
        </p>
      </div>

      {[
        { title: "Museus e Galerias", text: "Holambra possui diversos museus e galerias de arte que refletem a riqueza cultural da região. Visite exposições de arte contemporânea, fotografia e história local." },
        { title: "Parques e Natureza", text: "Aproveite os belos parques e áreas verdes para caminhadas, piqueniques e contato com a natureza. Holambra é cercada por paisagens naturais espetaculares." },
        { title: "Compras e Artesanato", text: "Visite lojas de artesanato local, flores e produtos típicos. Holambra é famosa por suas flores e oferece uma experiência de compras única." },
        { title: "Gastronomia", text: "Desfrute de restaurantes e cafés que servem culinária local e internacional. A cena gastronômica de Holambra é vibrante e oferece opções para todos os paladares." },
      ].map((section) => (
        <div key={section.title}>
          <h3 style={{ fontSize: "var(--ds-text-xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-2)" }}>
            {section.title}
          </h3>
          <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
            {section.text}
          </p>
        </div>
      ))}

      <div>
        <DSBadge variant="default" size="md">Dicas</DSBadge>
        <h2 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginTop: "var(--ds-space-3)", marginBottom: "var(--ds-space-4)" }}>
          Dicas para sua Visita
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-2)" }}>
          {[
            "Visite na primavera para apreciar as flores em sua melhor forma",
            "Explore os bairros a pé para descobrir gemas escondidas",
            "Participe de eventos locais e festivais culturais",
            "Prove a gastronomia local em restaurantes autênticos",
            "Compre flores e artesanato diretamente dos produtores",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
              <CheckCircle size={18} style={{ color: "var(--ds-color-accent)", flexShrink: 0 }} />
              <span style={{ color: "var(--ds-color-text-secondary)" }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <DSBadge variant="accent" size="md">Planejamento</DSBadge>
        <h2 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginTop: "var(--ds-space-3)", marginBottom: "var(--ds-space-3)" }}>
          Planejando sua Visita
        </h2>
        <p style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>
          Use o app Oranje para descobrir mais lugares, ler avaliações de outros visitantes e planejar seu roteiro perfeito. Temos informações completas sobre horários, endereços e como chegar em cada atração.
        </p>
      </div>
    </div>
  );

  return (
    <SiteContentPage
      title="O que Fazer em Holambra"
      subtitle="Descubra as melhores atrações e experiências da cidade"
      content={content}
      cta={{ label: "Explorar no App", href: "/app" }}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "O que Fazer", href: "/o-que-fazer-em-holambra" },
      ]}
    />
  );
}
