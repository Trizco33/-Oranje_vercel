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
   Página: Roteiro de 1 Dia (preservado — não migrado para CMS)
───────────────────────────────────────────── */

const roteiroContent = `
Holambra é compacta e isso trabalha a seu favor quando o tempo é curto. Em um dia bem planejado, você consegue ver o essencial — e ainda sobra espaço para as surpresas que só acontecem quando você desacelera um pouco.

## Manhã — Comece com café e flores

Chegue cedo. Holambra de manhã tem uma leveza especial: as ruas ainda estão vazias, as flores estão abertas e os cafés começam o serviço com calma.

Comece o dia no Café Moinho — café bem feito, ambiente acolhedor e um início de dia que define o tom. Depois, caminhe pelos jardins do Parque Van Gogh ou pelo Parque Bloemen. São paradas curtas que valem cada minuto — e a luz da manhã faz toda a diferença nas fotos.

## Almoço — À beira do lago ou no centro

Para o almoço, o Deck do Lago é a pedida: a vista para o lago transforma uma refeição simples em memória. Se preferir algo mais movimentado, o centro da cidade tem boas opções a poucos minutos de caminhada.

Aproveite o almoço para conversar com outros visitantes. Em Holambra, o boca a boca ainda é a melhor fonte de descobertas.

## Tarde — Parques, lojas e o Expoflora Park

A tarde pede mais exploração. O Expoflora Park é parada obrigatória — mesmo fora do período do festival, o espaço tem estrutura e beleza o ano todo. Se vier em setembro, separe boa parte do dia para isso.

Passe também pelas lojas de flores e artesanato do centro. Holambra exporta flores para o Brasil inteiro, e você vai encontrar variedades aqui que não existem em nenhuma outra cidade.

## Noite — Bem-merecida

Para fechar o dia, vá devagar. Um bar tranquilo como o Boteco do Holandês ou uma janta no Casa Bela Restaurante encerram bem qualquer visita. Se a energia ainda estiver alta, passe pela Tulipa's Lounge — o ambiente transforma qualquer noite em algo especial.

## Dica final

Use o app Oranje para montar seu roteiro com o mapa interativo. Você evita voltar pelo mesmo caminho e descobre lugares que não aparecem nos guias tradicionais.
`;

/* ─────────────────────────────────────────────
   SEO config — apenas roteiro
───────────────────────────────────────────── */

const seoConfig: Record<string, { title: string; description: string; h1: string; subtitle: string }> = {
  "roteiro-1-dia-em-holambra": {
    h1: "Roteiro de 1 Dia em Holambra",
    subtitle: "Do café da manhã ao jantar — como aproveitar ao máximo um dia inteiro na cidade",
    title: "Roteiro de 1 Dia em Holambra — Guia Oranje",
    description:
      "Roteiro completo para aproveitar Holambra em um dia: onde tomar café, almoçar, visitar parques e terminar bem a noite. Curadoria Oranje.",
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
