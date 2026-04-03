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
Se você tem apenas um dia em Holambra, este roteiro ajudará você a aproveitar ao máximo sua visita.

## Manhã (8h - 12h)
Comece com um café da manhã em um dos cafés especializados da cidade. Depois, visite o centro histórico e explore as galerias de arte.

## Almoço (12h - 14h)
Desfrute de um almoço em um restaurante local. Aproveite para provar pratos típicos da região.

## Tarde (14h - 18h)
Visite parques e áreas verdes. Explore lojas de artesanato e flores. Tire fotos em pontos turísticos.

## Noite (18h - 22h)
Aproveite o pôr do sol em um mirante. Jante em um restaurante sofisticado ou mais casual, conforme sua preferência.

## Dicas Importantes
- Use o app Oranje para planejar sua rota
- Leve água e protetor solar
- Use sapatos confortáveis
- Reserve restaurantes com antecedência
- Deixe tempo para explorar e se perder um pouco

Este é apenas um exemplo. Customize seu roteiro de acordo com seus interesses!
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
