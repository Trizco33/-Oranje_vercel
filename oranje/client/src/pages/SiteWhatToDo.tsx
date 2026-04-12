import { useEffect } from "react";
import SiteContentPage from "./SiteContentPage";
import { DSBadge } from "@/components/ds/Badge";
import { CheckCircle, MapPin, Coffee, Utensils, Camera, Trees } from "lucide-react";
import { Link } from "react-router-dom";

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

export default function SiteWhatToDo() {
  useEffect(() => {
    const SITE = "ORANJE — Holambra em um só lugar";
    const title = "O que Fazer em Holambra — Guia Completo de Atrações";
    const description =
      "Descubra o que fazer em Holambra: parques de flores, gastronomia holandesa, cafés artesanais, pontos históricos e muito mais. Guia completo e atualizado.";
    const pageUrl = "https://oranjeapp.com.br/o-que-fazer-em-holambra";

    document.title = title;
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:url", pageUrl);
    setMeta("og:type", "website");
    setMeta("og:site_name", SITE);
    setNameMeta("description", description);
    setNameMeta("twitter:card", "summary_large_image");
    setNameMeta("twitter:title", title);
    setNameMeta("twitter:description", description);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", pageUrl);

    return () => { document.title = SITE; };
  }, []);

  const s = {
    p: { color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)", marginBottom: "var(--ds-space-2)" } as React.CSSProperties,
    h2: { fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginTop: "var(--ds-space-3)", marginBottom: "var(--ds-space-3)", fontFamily: "var(--ds-font-display)" } as React.CSSProperties,
    h3: { fontSize: "var(--ds-text-lg)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-2)" } as React.CSSProperties,
    placeLink: { color: "var(--ds-color-accent)", fontWeight: "var(--ds-font-medium)", textDecoration: "none" } as React.CSSProperties,
    card: { background: "var(--ds-color-bg-secondary)", borderRadius: "var(--ds-radius-lg)", padding: "var(--ds-space-4)", display: "flex", flexDirection: "column" as const, gap: "var(--ds-space-2)" },
    iconRow: { display: "flex", alignItems: "flex-start", gap: "var(--ds-space-3)" },
  };

  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-8)" }}>

      <p style={s.p}>
        Holambra surpreende quem não a conhece e encanta quem já voltou. A menor cidade do estado de São Paulo é também uma das mais completas para quem quer gastar um dia bem — ou um fim de semana inteiro — sem abrir mão de conforto, beleza e boa gastronomia.
      </p>

      {/* PARQUES E NATUREZA */}
      <div>
        <DSBadge variant="accent" size="md" style={{ display: "inline-flex", alignItems: "center", gap: "var(--ds-space-1)" }}>
          <Trees size={14} /> Parques e Natureza
        </DSBadge>
        <h2 style={s.h2}>Parques e Atrações ao Ar Livre</h2>
        <p style={s.p}>
          As flores são a alma de Holambra. Há parques e espaços ao ar livre que valem a viagem por si só — do famoso campo de girassóis ao moinho que virou símbolo da cidade.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)", marginTop: "var(--ds-space-4)" }}>
          {[
            {
              name: "Bloemen Park",
              id: 32,
              desc: "O parque mais fotogênico de Holambra. As fileiras de girassóis voltadas para o pôr do sol criam uma das cenas mais bonitas do interior paulista. Há também um moinho para fotos e um café no local.",
            },
            {
              name: "Parque Van Gogh",
              id: 19,
              desc: "Área verde com jardins floridos, exposições ao ar livre e espaço para crianças. Perfeito para passar a tarde com calma, especialmente durante a Expoflora.",
            },
            {
              name: "Deck do Amor",
              id: 12,
              desc: "Um mirante encantador à beira do lago, com vista aberta e uma trilha singela que termina no melhor pôr do sol da cidade. Ida obrigatória para casais.",
            },
            {
              name: "Praça Vitória Régia",
              id: 4215,
              desc: "O coração de Holambra. A praça central reúne comércio, arquitetura holandesa e o cotidiano da cidade — ótima para começar ou encerrar o passeio.",
            },
          ].map((place) => (
            <div key={place.id} style={s.card}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                <MapPin size={16} style={{ color: "var(--ds-color-accent)", flexShrink: 0 }} />
                <Link to={`/app/lugar/${place.id}`} style={s.placeLink}>{place.name}</Link>
              </div>
              <p style={{ ...s.p, marginBottom: 0 }}>{place.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* GASTRONOMIA */}
      <div>
        <DSBadge variant="accent" size="md" style={{ display: "inline-flex", alignItems: "center", gap: "var(--ds-space-1)" }}>
          <Utensils size={14} /> Gastronomia
        </DSBadge>
        <h2 style={s.h2}>Restaurantes que Valem a Viagem</h2>
        <p style={s.p}>
          A cena gastronômica de Holambra é surpreendentemente boa para uma cidade do seu tamanho. Há desde restaurantes com culinária holandesa autêntica até opções italianas, brasileiras e de boteco — tudo concentrado num raio de poucos quilômetros.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)", marginTop: "var(--ds-space-4)" }}>
          {[
            {
              name: "De Immigrant Restaurante Garden",
              id: 7,
              desc: "O clássico da gastronomia holandesa em Holambra. Ambiente aberto, cardápio refinado e a experiência completa de comer bem na cidade das flores.",
            },
            {
              name: "Villa Girassol",
              id: 6,
              desc: "Restaurante com vista para o campo de girassóis. Uma das melhores localizações da cidade aliada a uma cozinha consistente e bem executada.",
            },
            {
              name: "Quintal dos Avós Gastrobar",
              id: 43,
              desc: "Ambiente descontraído com boa comida e drinks — a pedida certa para quem quer uma refeição sem formalidade, mas com personalidade.",
            },
          ].map((place) => (
            <div key={place.id} style={s.card}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                <MapPin size={16} style={{ color: "var(--ds-color-accent)", flexShrink: 0 }} />
                <Link to={`/app/lugar/${place.id}`} style={s.placeLink}>{place.name}</Link>
              </div>
              <p style={{ ...s.p, marginBottom: 0 }}>{place.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ ...s.p, marginTop: "var(--ds-space-3)" }}>
          Quer a lista completa? Veja os <Link to="/melhores-restaurantes-de-holambra" style={s.placeLink}>melhores restaurantes de Holambra</Link> com avaliações reais.
        </p>
      </div>

      {/* CAFÉS */}
      <div>
        <DSBadge variant="accent" size="md" style={{ display: "inline-flex", alignItems: "center", gap: "var(--ds-space-1)" }}>
          <Coffee size={14} /> Cafés
        </DSBadge>
        <h2 style={s.h2}>Cafés Artesanais e Docerias</h2>
        <p style={s.p}>
          Holambra tem uma cultura de café e confeitaria que faz sentido com sua herança holandesa. Estes são os favoritos do Oranje para uma pausa bem aproveitada.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)", marginTop: "var(--ds-space-4)" }}>
          {[
            {
              name: "Zoet en Zout",
              id: 5,
              desc: "Café artesanal com vitrine holandesa e produtos que misturam o doce e o salgado da confeitaria europeia. Um dos espaços mais característicos da cidade.",
            },
            {
              name: "Oma Beppie",
              id: 3,
              desc: "Confeitaria tradicional onde você encontra as famosas stroopwafels e outros clássicos holandeses. Imperdível para quem quer levar algo de volta para casa.",
            },
            {
              name: "Lotus Café",
              id: 2,
              desc: "Café com ambiente aconchegante e uma seleção cuidadosa de bebidas e doces. Um refúgio tranquilo no meio do passeio.",
            },
          ].map((place) => (
            <div key={place.id} style={s.card}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                <MapPin size={16} style={{ color: "var(--ds-color-accent)", flexShrink: 0 }} />
                <Link to={`/app/lugar/${place.id}`} style={s.placeLink}>{place.name}</Link>
              </div>
              <p style={{ ...s.p, marginBottom: 0 }}>{place.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ ...s.p, marginTop: "var(--ds-space-3)" }}>
          Veja todos os <Link to="/melhores-cafes-de-holambra" style={s.placeLink}>melhores cafés de Holambra</Link> no guia completo.
        </p>
      </div>

      {/* FOTOS */}
      <div>
        <DSBadge variant="accent" size="md" style={{ display: "inline-flex", alignItems: "center", gap: "var(--ds-space-1)" }}>
          <Camera size={14} /> Pontos Fotogênicos
        </DSBadge>
        <h2 style={s.h2}>Os Melhores Pontos para Fotos</h2>
        <p style={s.p}>
          Holambra foi feita para ser fotografada. A arquitetura holandesa, as flores em todo canto e as paisagens naturais criam cenários únicos em cada esquina. Veja os lugares favoritos do Oranje para quem quer boas fotos.
        </p>
        <p style={{ ...s.p, marginTop: "var(--ds-space-2)" }}>
          → Guia completo: <Link to="/onde-tirar-fotos-em-holambra" style={s.placeLink}>Onde tirar fotos em Holambra</Link>
        </p>
      </div>

      {/* DICAS */}
      <div>
        <DSBadge variant="default" size="md">Dicas Práticas</DSBadge>
        <h2 style={s.h2}>Antes de Ir</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}>
          {[
            { tip: "Chegue cedo nos fins de semana — cafés e restaurantes populares lotam rápido, especialmente na Expoflora (setembro)." },
            { tip: "Vista sapatos confortáveis. Bloemen Park e a área central pedem bastante caminhada." },
            { tip: "A maioria dos lugares fecha às 18h. Planeje o jantar com antecedência se quiser ficar até mais tarde." },
            { tip: "Baixe o app Oranje antes de sair — mapa offline, horários atualizados e avaliações reais de cada lugar." },
            { tip: "Viajando de carro? Holambra fica a 170 km de São Paulo e 50 km de Campinas — ideal para um bate e volta ou fim de semana." },
          ].map((item, i) => (
            <div key={i} style={s.iconRow}>
              <CheckCircle size={18} style={{ color: "var(--ds-color-accent)", flexShrink: 0, marginTop: 2 }} />
              <span style={{ color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)" }}>{item.tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LINKS RELACIONADOS */}
      <div style={{ borderTop: "1px solid var(--ds-color-border)", paddingTop: "var(--ds-space-6)" }}>
        <h3 style={s.h3}>Leia também</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-2)" }}>
          {[
            { label: "Roteiro de 1 dia em Holambra", href: "/roteiro-1-dia-em-holambra" },
            { label: "Holambra bate e volta — dicas para vir de SP", href: "/holambra-bate-e-volta" },
            { label: "Melhores restaurantes de Holambra", href: "/melhores-restaurantes-de-holambra" },
            { label: "Eventos em Holambra", href: "/eventos-em-holambra" },
          ].map((link) => (
            <Link key={link.href} to={link.href} style={{ ...s.placeLink, display: "flex", alignItems: "center", gap: "var(--ds-space-1)" }}>
              → {link.label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );

  return (
    <SiteContentPage
      title="O que Fazer em Holambra"
      subtitle="Parques de flores, gastronomia holandesa, cafés artesanais e muito mais"
      content={content}
      cta={{
        label: "Abrir no App Oranje",
        href: "/app/explorar",
        description: (
          <span>
            O app Oranje tem todos os lugares de Holambra com fotos, horários e avaliações reais.
            Use o filtro <strong style={{ color: "var(--ds-color-text-primary)" }}>Perto de Mim</strong> para
            descobrir o que está aberto agora, perto de onde você está — ou explore por categoria:
            restaurantes, cafés, parques, bares e muito mais.
          </span>
        ),
        secondary: { label: "Ver Passeios com Motorista", href: "/app/receptivo" },
      }}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "O que Fazer em Holambra", href: "/o-que-fazer-em-holambra" },
      ]}
    />
  );
}
