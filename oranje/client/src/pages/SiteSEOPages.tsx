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

const bateVoltaContent = `
Holambra é um dos melhores destinos de bate e volta do estado de São Paulo — e talvez o mais subestimado. A menos de duas horas da capital e a menos de uma hora de Campinas, a cidade entrega muito mais do que parece possível para um dia de passeio.

## Distância e como chegar

De São Paulo, são cerca de 170 km pela Rodovia Anhanguera (SP-330), com saída em Cosmópolis e mais 15 km até a cidade. O tempo médio é de 1h45 a 2h, dependendo do trânsito na saída da capital. De Campinas, são 50 km e aproximadamente 45 minutos.

Não há transporte público direto de SP até Holambra — o ideal é de carro, ou usando o Receptivo Oranje com motorista particular, que busca você em qualquer ponto de São Paulo ou Campinas.

## Quando ir

Holambra recebe visitantes o ano todo, mas há momentos especialmente bons:

- **Setembro (Expoflora):** O maior festival de flores do Brasil. A cidade fica cheia, os parques estão em plena floração e a programação cultural é intensa. Reserve restaurantes com antecedência e chegue cedo.
- **Fins de semana em geral:** A cidade pulsa nos sábados e domingos, com mercados, cafés cheios e boa energia. Os horários de funcionamento dos parques costumam ser mais longos.
- **Dias úteis:** Para quem quer Holambra sem fila e sem multidão. Os restaurantes atendem bem, os parques ficam mais tranquilos e a experiência é mais contemplativa.

## O que fazer num bate e volta

Um dia bem aproveitado em Holambra cabe no seguinte roteiro:

**Manhã:** Comece com café artesanal no Zoet en Zout ou na Oma Beppie — stroopwafels quentinhos são o jeito certo de entrar no clima. Depois, vá direto para o Bloemen Park para as fotos no campo de girassóis, que ficam melhores com a luz da manhã.

**Almoço:** O Boulevard Holandês concentra boas opções num raio caminhável. De Immigrant Restaurante Garden é a indicação clássica; Villa Girassol é a opção com melhor vista.

**Tarde:** Reserve para o Parque Van Gogh, o Moinho e uma caminhada pela área central. O Deck do Amor é parada obrigatória para fotos no fim do dia.

**Volta:** Se saiu cedo de SP, dá para estar de volta às 20h com conforto — ou encerrar com jantar em Holambra antes de voltar.

## Dicas para o bate e volta perfeito

- Saia de SP antes das 7h para evitar trânsito e aproveitar a manhã inteira
- Leve protetor solar e sapatos fechados e confortáveis
- Os estacionamentos perto do Boulevard Holandês ficam cheios nos fins de semana — chegue cedo ou estacione um pouco mais longe e vá a pé
- Baixe o app Oranje antes de sair: mapa offline, horários e avaliações reais de cada lugar
- Se quiser ir sem se preocupar com logística, o Receptivo Oranje oferece passeios com motorista saindo de SP e Campinas
`;

const roteiroContent = `
Um dia em Holambra é tempo suficiente para sair diferente de como entrou. A cidade é compacta, bonita e surpreendentemente generosa com quem chega disposto a descobrí-la sem pressa.

## Manhã (8h - 12h)
Comece o dia com um bom café da manhã. A recomendação do Oranje é o Zoet en Zout — café artesanal com vitrine holandesa, um dos espaços mais característicos da cidade. Outras boas opções são o Lotus Café, a Kéndi Cafeteria e a Oma Beppie — confeitaria tradicional onde você encontra as famosas stroopwafels, aquele biscoito holandês de caramelo que vicia. É uma forma deliciosa de entrar no clima da cidade logo cedo.

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

interface PageConfig {
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  content: string;
  cta: {
    label: string;
    href: string;
    descriptionText: string;
    secondary?: { label: string; href: string };
  };
}

const seoConfig: Record<string, PageConfig> = {
  "roteiro-1-dia-em-holambra": {
    h1: "Roteiro de 1 Dia em Holambra",
    subtitle: "Aproveite o melhor da cidade em um dia",
    title: "Roteiro de 1 Dia em Holambra",
    description: "Um dia em Holambra: roteiro completo com dicas de manhã, almoço, tarde e noite para aproveitar ao máximo a cidade das flores.",
    content: roteiroContent,
    cta: {
      label: "Planejar meu Roteiro no App",
      href: "/app/roteiros",
      descriptionText: "O app Oranje tem roteiros curados para todos os perfis de visitante. Salve seus lugares favoritos, veja horários em tempo real e monte um roteiro personalizado direto do celular — sem precisar de guia.",
      secondary: { label: "Ver Passeios com Motorista", href: "/app/receptivo" },
    },
  },
  "holambra-bate-e-volta": {
    h1: "Holambra Bate e Volta",
    subtitle: "Tudo que você precisa saber para fazer o passeio perfeito",
    title: "Holambra Bate e Volta — Guia Completo saindo de SP e Campinas",
    description: "Holambra bate e volta: distância de SP, quando ir, o que fazer, dicas práticas e roteiro completo para aproveitar o dia na cidade das flores.",
    content: bateVoltaContent,
    cta: {
      label: "Ver Passeios com Motorista",
      href: "/app/receptivo",
      descriptionText: "Prefere não se preocupar com carro, trânsito ou estacionamento? O Receptivo Oranje busca você em São Paulo ou Campinas com motorista particular e leva para os melhores pontos da cidade — conforto total, nenhuma logística.",
      secondary: { label: "Explorar no App Oranje", href: "/app/explorar" },
    },
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
    const SITE = "ORANJE — Holambra em um só lugar";
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

  function renderMarkdown(text: string) {
    return text
      .split("\n")
      .map((line) => {
        if (line.startsWith("## ")) {
          return `<h2 style="font-size: var(--ds-text-2xl); font-weight: var(--ds-font-bold); color: var(--ds-color-text-primary); margin-top: var(--ds-space-8); margin-bottom: var(--ds-space-3); font-family: var(--ds-font-display);">${line.substring(3)}</h2>`;
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return `<p style="font-weight: var(--ds-font-bold); color: var(--ds-color-text-primary); margin-bottom: var(--ds-space-1);">${line.slice(2, -2)}</p>`;
        }
        if (line.trim().startsWith("- **")) {
          const clean = line.trim().substring(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
          return `<div style="display: flex; align-items: flex-start; gap: var(--ds-space-2); margin-bottom: var(--ds-space-2); padding-left: var(--ds-space-2);"><span style="color: var(--ds-color-accent); margin-top: 6px; flex-shrink: 0;">•</span><span style="color: var(--ds-color-text-secondary);">${clean}</span></div>`;
        }
        if (line.trim().startsWith("- ")) {
          return `<div style="display: flex; align-items: flex-start; gap: var(--ds-space-2); margin-bottom: var(--ds-space-2); padding-left: var(--ds-space-2);"><span style="color: var(--ds-color-accent); margin-top: 6px; flex-shrink: 0;">•</span><span style="color: var(--ds-color-text-secondary);">${line.trim().substring(2)}</span></div>`;
        }
        if (line.trim().startsWith("**") && line.includes(":")) {
          const clean = line.trim().replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
          return `<p style="margin-bottom: var(--ds-space-3); color: var(--ds-color-text-secondary); line-height: var(--ds-leading-relaxed);">${clean}</p>`;
        }
        if (line.trim() === "") return "";
        return `<p style="margin-bottom: var(--ds-space-3); color: var(--ds-color-text-secondary); line-height: var(--ds-leading-relaxed);">${line.trim()}</p>`;
      })
      .join("");
  }

  const content = (
    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(seo.content) }} />
  );

  return (
    <SiteContentPage
      title={seo.h1}
      subtitle={seo.subtitle}
      content={content}
      cta={{
        label: seo.cta.label,
        href: seo.cta.href,
        description: <span>{seo.cta.descriptionText}</span>,
        secondary: seo.cta.secondary,
      }}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: seo.h1, href: location.pathname },
      ]}
    />
  );
}
