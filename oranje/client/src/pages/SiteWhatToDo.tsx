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

function EditImg({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      style={{
        width: "100%",
        borderRadius: "12px",
        objectFit: "cover",
        display: "block",
        margin: "4px 0 24px",
        maxHeight: 360,
      }}
    />
  );
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
    p: { color: "var(--ds-color-text-secondary)", lineHeight: "var(--ds-leading-relaxed)", marginBottom: "var(--ds-space-4)" } as React.CSSProperties,
    h2: { fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginTop: "var(--ds-space-2)", marginBottom: "var(--ds-space-3)", fontFamily: "var(--ds-font-display)" } as React.CSSProperties,
    h3: { fontSize: "var(--ds-text-lg)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-2)" } as React.CSSProperties,
    placeLink: { color: "var(--ds-color-accent)", fontWeight: "var(--ds-font-medium)", textDecoration: "none" } as React.CSSProperties,
    card: { background: "var(--ds-color-bg-secondary)", borderRadius: "var(--ds-radius-lg)", padding: "var(--ds-space-4)", display: "flex", flexDirection: "column" as const, gap: "var(--ds-space-2)" },
    iconRow: { display: "flex", alignItems: "flex-start", gap: "var(--ds-space-3)" },
  };

  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-6)" }}>

      <p style={s.p}>
        Tem uma coisa que quem vem a Holambra pela primeira vez não espera: a cidade é muito mais do que flores.
        Claro que as flores são o cartão-postal — e são espetaculares — mas o que faz a gente que mora aqui se
        apaixonar é o conjunto. A tranquilidade das ruas, a gastronomia que vai muito além do turístico, os
        cafés onde você senta e perde a noção do tempo, os parques onde a luz da tarde faz tudo parecer pintado.
        Este guia foi feito para você aproveitar tudo isso, não só a foto do girassol.
      </p>

      <EditImg
        src="https://images.unsplash.com/photo-1455582916367-25f75bfc6710?w=900&h=420&fit=crop&q=80"
        alt="Flores coloridas de Holambra"
      />

      {/* PARQUES E NATUREZA */}
      <div>
        <DSBadge variant="accent" size="md" style={{ display: "inline-flex", alignItems: "center", gap: "var(--ds-space-1)" }}>
          <Trees size={14} /> Parques e Natureza
        </DSBadge>
        <h2 style={s.h2}>Parques e Atrações ao Ar Livre</h2>
        <p style={s.p}>
          Em Holambra, até os caminhos entre um lugar e outro são bonitos. Mas há parques que merecem parada
          obrigatória — seja pelo campo de girassóis que para o coração, pelo moinho que virou símbolo da cidade,
          ou pelo mirante à beira do lago onde o pôr do sol é sempre uma surpresa nova.
        </p>

        <EditImg
          src="https://images.unsplash.com/photo-1490750967868-88df5691cc5b?w=900&h=400&fit=crop&q=80"
          alt="Campo de girassóis em Holambra"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
          {[
            {
              name: "Bloemen Park",
              id: 32,
              desc: "O parque mais fotogênico de Holambra — ponto final. As fileiras de girassóis voltadas para o poente criam uma das cenas mais bonitas de todo o interior paulista. Quem chega cedo da manhã pega a luz perfeita e as fotos sem fila. Tem também um moinho para fotos e um café no local.",
            },
            {
              name: "Parque Van Gogh",
              id: 19,
              desc: "Jardins floridos com referências ao pintor holandês — um cenário que parece de quadro mesmo. Ótimo para passar a tarde com calma, levar crianças ou simplesmente sentar num banco e respirar. Durante a Expoflora, fica ainda mais bonito.",
            },
            {
              name: "Deck do Amor",
              id: 12,
              desc: "Um mirante à beira do lago com trilha singela e a melhor vista para o pôr do sol da cidade. A gente que mora aqui sabe: se você só tiver tempo para um lugar, que seja o Deck no fim da tarde. Leve alguém especial.",
            },
            {
              name: "Praça Vitória Régia",
              id: 4215,
              desc: "O coração vivo de Holambra. É aqui que a cidade respira — comércio, arquitetura holandesa, o cotidiano dos moradores e a energia de quem chegou para descobrir tudo isso. Ótimo começo ou fim de passeio.",
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
          Holambra tem uma cena gastronômica que surpreende — para uma cidade do seu tamanho, a qualidade e a
          variedade são impressionantes. Você vai encontrar culinária holandesa de verdade, cozinha italiana com
          ingredientes frescos, hambúrguer artesanal bem feito e o bom e velho prato do dia com alma de cidade
          pequena. Tudo num raio que você resolve a pé.
        </p>

        <EditImg
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=400&fit=crop&q=80"
          alt="Mesa de restaurante com boa gastronomia"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
          {[
            {
              name: "De Immigrant Restaurante Garden",
              id: 3824,
              desc: "O clássico irretocável da gastronomia de Holambra. Ambiente garden aberto, cardápio autoral que conta a história dos imigrantes holandeses e uma execução que justifica a reputação. Se for só a um restaurante, que seja esse.",
            },
            {
              name: "Villa Girassol",
              id: 6,
              desc: "A combinação perfeita entre boa cozinha e localização invejável. Fica de frente para os girassóis e o almoço aqui vira uma experiência completa — não só refeição.",
            },
            {
              name: "Quintal dos Avós Gastrobar",
              id: 43,
              desc: "Ambiente que parece quintal de casa — rústico, caloroso, sem frescura. A comida é generosa e os drinks são criativos. Um dos lugares mais queridos de Holambra para quem quer algo diferente.",
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
          Quer a lista completa com todos os detalhes? Veja os{" "}
          <Link to="/melhores-restaurantes-de-holambra" style={s.placeLink}>melhores restaurantes de Holambra</Link>{" "}
          com avaliações reais.
        </p>
      </div>

      {/* CAFÉS */}
      <div>
        <DSBadge variant="accent" size="md" style={{ display: "inline-flex", alignItems: "center", gap: "var(--ds-space-1)" }}>
          <Coffee size={14} /> Cafés
        </DSBadge>
        <h2 style={s.h2}>Cafés Artesanais e Docerias</h2>
        <p style={s.p}>
          Tem algo de muito certo na relação de Holambra com o café. Talvez seja a herança holandesa — que sempre
          levou a sério a arte de fazer uma boa pausa. Os cafés aqui não são genéricos: cada um tem personalidade
          própria, vitrine cuidada e algo que você não encontra em nenhuma rede. O stroopwafel quentinho da Oma
          Beppie, o café coado do Zoet en Zout, o croissant da Kéndi que as pessoas mencionam com nostalgia
          depois que saem da cidade.
        </p>

        <EditImg
          src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=900&h=400&fit=crop&q=80"
          alt="Café artesanal e confeitaria"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
          {[
            {
              name: "Zoet en Zout",
              id: 5,
              desc: "\"Doce e salgado\" em holandês — e esse equilíbrio define o lugar. Café artesanal de qualidade, vitrine com produtos que você vai querer levar pra casa e um ambiente que captura o charme da herança cultural da cidade. É o tipo de café onde você entra para um expresso e sai quarenta minutos depois.",
            },
            {
              name: "Oma Beppie",
              id: 3,
              desc: "Confeitaria tradicional holandesa onde moram as melhores stroopwafels da cidade — aquele biscoito de caramelo que quem prova uma vez nunca mais esquece. Perfeito para comprar de presente ou comer ali mesmo, quentinho.",
            },
            {
              name: "Kéndi Cafeteria",
              id: 29,
              desc: "Confeitaria fina com brigadeiros gourmet, croissant elogiado por todo mundo que passa e método japonês Hario V60 para o café. Ambiente climatizado e charmoso — uma das mais completas da cidade.",
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
          Guia completo:{" "}
          <Link to="/melhores-cafes-de-holambra" style={s.placeLink}>melhores cafés de Holambra</Link>.
        </p>
      </div>

      {/* FOTOS */}
      <div>
        <DSBadge variant="accent" size="md" style={{ display: "inline-flex", alignItems: "center", gap: "var(--ds-space-1)" }}>
          <Camera size={14} /> Pontos Fotogênicos
        </DSBadge>
        <h2 style={s.h2}>Os Melhores Pontos para Fotos</h2>
        <p style={s.p}>
          Holambra foi generosa com quem gosta de fotografia. A cada esquina tem um enquadramento novo — os
          guarda-chuvas coloridos suspensos sobre a rua, o moinho ao fundo de um campo de flores, a luz dourada
          da tarde sobre o lago. Não precisa ser fotógrafo profissional: a cidade faz o trabalho por você.
        </p>

        <EditImg
          src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=900&h=400&fit=crop&q=80"
          alt="Guarda-chuvas coloridos — ponto fotogênico de Holambra"
        />

        <p style={{ ...s.p }}>
          A{" "}
          <Link to="/onde-tirar-fotos-em-holambra" style={s.placeLink}>Rua dos Guarda-Chuvas</Link>{" "}
          é o ponto mais instagramável — simples, colorido, completamente único. O{" "}
          <Link to="/app/lugar/2616" style={s.placeLink}>Moinho Povos Unidos</Link>{" "}
          é a foto clássica que representa Holambra no mundo. O{" "}
          <Link to="/app/lugar/32" style={s.placeLink}>Bloemen Park</Link>{" "}
          entrega aquelas fotos de campo de flores que parecem filtradas mas são o puro real.
        </p>
        <p style={{ ...s.p }}>
          → Guia completo:{" "}
          <Link to="/onde-tirar-fotos-em-holambra" style={s.placeLink}>onde tirar fotos em Holambra</Link>
        </p>
      </div>

      {/* DICAS */}
      <div>
        <DSBadge variant="default" size="md">Dicas de Morador</DSBadge>
        <h2 style={s.h2}>Antes de Ir</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}>
          {[
            { tip: "Chegue cedo nos fins de semana — o Zoet en Zout e a Oma Beppie lotam antes das 10h. Quem chega às 8h30 pega a cidade ainda acordando, com a luz mais bonita e fila nenhuma." },
            { tip: "Vista sapatos que aguentem chão de terra. O Bloemen Park e a área rural ao redor pedem conforto — é difícil parar de caminhar." },
            { tip: "A maioria dos lugares fecha entre 17h e 18h. Se quiser jantar, planeje com antecedência — durante a Expoflora (setembro), a cidade enche muito e os restaurantes lotam cedo." },
            { tip: "Leve dinheiro. Não todos os lugares têm maquininha estável, e não raro você vai querer comprar flores na beira da estrada onde só aceitam espécie." },
            { tip: "Holambra fica a 170 km de São Paulo pela Anhanguera e a 50 km de Campinas. Perfeito para bate e volta — ou para ficar um fim de semana inteiro, que é o que a gente recomenda." },
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
        <h3 style={s.h3}>Continue explorando</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-2)" }}>
          {[
            { label: "Roteiro de 1 dia em Holambra — hora a hora", href: "/roteiro-1-dia-em-holambra" },
            { label: "Holambra bate e volta — guia completo saindo de SP", href: "/holambra-bate-e-volta" },
            { label: "Melhores restaurantes de Holambra", href: "/melhores-restaurantes-de-holambra" },
            { label: "Melhores cafés de Holambra", href: "/melhores-cafes-de-holambra" },
            { label: "Onde tirar fotos em Holambra", href: "/onde-tirar-fotos-em-holambra" },
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
      subtitle="O guia de quem mora aqui — parques, gastronomia, cafés e os segredos da cidade das flores"
      content={content}
      cta={{
        label: "Abrir no App Oranje",
        href: "/app/explorar",
        description: (
          <span>
            O app Oranje tem todos os lugares de Holambra com fotos, horários e avaliações reais de moradores e
            visitantes. Use o filtro{" "}
            <strong style={{ color: "var(--ds-color-text-primary)" }}>Perto de Mim</strong> para descobrir o que
            está aberto agora — ou explore por categoria: restaurantes, cafés, parques, bares e muito mais.
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
