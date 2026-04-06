import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SiteContentPage from "./SiteContentPage";

/* ─────────────────────────────────────────────
   Meta helpers
───────────────────────────────────────────── */

function setMeta(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setNameMeta(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/* ─────────────────────────────────────────────
   Página: Roteiro de 1 Dia — conteúdo e SEO preservados
───────────────────────────────────────────── */

const roteiroContent = `
Um dia em Holambra é tempo suficiente para sair diferente de como entrou. A cidade é compacta, bonita e surpreendentemente generosa com quem chega disposto a descobrí-la sem pressa.

## Manhã (8h - 12h)
Comece o dia com um bom café da manhã. A recomendação do Oranje é o Zoet en Zout — café artesanal com vitrine holandesa, um espaço que reflete perfeitamente o espírito da cidade. Outra boa opção é o De Immigrant Gastro Café, aberto a partir das 8h, com cardápio que conta a história dos imigrantes que fundaram Holambra. É uma forma deliciosa de entrar no clima cedo, antes do movimento do dia começar de verdade.

## Almoço (12h - 14h)
Na hora do almoço, siga para o Boulevard Holandês, uma das áreas mais agradáveis da cidade para comer bem sem pressa. Entre as indicações do Oranje estão o Casa Bela Restaurante, o Martin Holandesa, o Villa Girassol e o De Immigrant Restaurante Garden. São lugares com personalidade própria, que combinam bem com a proposta de um passeio desacelerado por Holambra.

## Tarde (14h - 18h)
A tarde pede ritmo contemplativo. Visite o moinho — um dos símbolos mais fotografados da cidade — ou siga direto para o Bloemen Park. Lá, a plantação de girassóis voltada para o pôr do sol rende fotos que não têm preço e cria uma das cenas mais bonitas que Holambra oferece ao longo do dia. Chegue com tempo para apreciar sem correria.

## Noite (18h - 22h)
Holambra continua entregando uma boa experiência mesmo depois que o sol vai embora. A gastronomia local é divina, com opções que vão do casual ao mais sofisticado. Para quem quer uma culinária mais tradicional e com aquele charme de cidade pequena, a indicação do Oranje é o The Old Dutch — um encerramento à altura de um dia bem aproveitado.

## Dicas para o seu roteiro
- Baixe o app Oranje antes de sair: ele tem mapa, horários e avaliações reais de cada lugar
- Chegue cedo no café da manhã — os melhores lugares lotam nos fins de semana
- Vista sapatos confortáveis e leve protetor solar, principalmente para a tarde no parque
- Se vier durante a Expoflora (setembro), reserve restaurantes com antecedência
- Não tente ver tudo: Holambra recompensa quem escolhe bem e vai devagar
`;

/* ─────────────────────────────────────────────
   SEO config — apenas roteiro (preservado)
───────────────────────────────────────────── */

const seoConfig: Record<string, { title: string; description: string; h1: string; subtitle: string }> = {
  "roteiro-1-dia-em-holambra": {
    h1: "Roteiro de 1 Dia em Holambra",
    subtitle: "Aproveite o melhor da cidade em um dia",
    title: "Roteiro de 1 Dia em Holambra",
    description: "Um dia em Holambra: roteiro completo com dicas de manhã, almoço, tarde e noite para aproveitar ao máximo a cidade das flores.",
  },
};

/* ─────────────────────────────────────────────
   Componente principal (somente Roteiro)
───────────────────────────────────────────── */

export default function SiteSEOPages() {
  const location = useLocation();
  const page = location.pathname.replace(/^\//, "");
  const seo = seoConfig[page];

  useEffect(() => {
    if (!seo) return;
    const SITE = "ORANJE — Guia Cultural de Holambra";
    document.title = seo.title;
    const pageUrl = `https://oranjeapp.com.br${location.pathname}`;

    setMeta("og:title", seo.title);
    setMeta("og:description", seo.description);
    setMeta("og:url", pageUrl);
    setMeta("og:type", "website");
    setMeta("og:site_name", SITE);
    setNameMeta("description", seo.description);
    setNameMeta("twitter:card", "summary_large_image");
    setNameMeta("twitter:title", seo.title);
    setNameMeta("twitter:description", seo.description);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", pageUrl);

    return () => {
      document.title = SITE;
    };
  }, [location.pathname, seo]);

  if (!seo) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--ds-color-bg-primary)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)" }}>
            Página não encontrada
          </h1>
          <p style={{ color: "var(--ds-color-text-muted)" }}>A página que você procura não existe.</p>
        </div>
      </div>
    );
  }

  const content = (
    <div
      dangerouslySetInnerHTML={{
        __html: roteiroContent
          .split("\n")
          .map((line) => {
            if (line.startsWith("## ")) {
              return `<h2 style="font-size: var(--ds-text-2xl); font-weight: var(--ds-font-bold); color: var(--ds-color-text-primary); margin-top: var(--ds-space-8); margin-bottom: var(--ds-space-3); font-family: var(--ds-font-display);">${line.substring(3)}</h2>`;
            }
            if (line.trim().startsWith("- ")) {
              return `<div style="display: flex; align-items: flex-start; gap: var(--ds-space-2); margin-bottom: var(--ds-space-2); padding-left: var(--ds-space-2);"><span style="color: var(--ds-color-accent); margin-top: 6px; flex-shrink: 0;">•</span><span style="color: var(--ds-color-text-secondary);">${line.trim().substring(2)}</span></div>`;
            }
            if (line.trim() === "") return "";
            return `<p style="margin-bottom: var(--ds-space-3); color: var(--ds-color-text-secondary); line-height: var(--ds-leading-relaxed);">${line.trim()}</p>`;
          })
          .join(""),
      }}
    />
  );

  return (
    <SiteContentPage
      title={seo.h1}
      subtitle={seo.subtitle}
      content={content}
      cta={{ label: "Planejar meu roteiro no App", href: "/app" }}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: seo.h1, href: location.pathname },
      ]}
    />
  );
}
