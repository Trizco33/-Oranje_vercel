import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import SiteContentPage from "./SiteContentPage";

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

/* ── Componentes de layout editorial ─────────────────────────────────────── */

const p: React.CSSProperties = {
  color: "var(--ds-color-text-secondary)",
  lineHeight: "var(--ds-leading-relaxed)",
  marginBottom: "var(--ds-space-4)",
  fontSize: "var(--ds-text-base)",
};

const h2style: React.CSSProperties = {
  fontSize: "var(--ds-text-2xl)",
  fontWeight: "var(--ds-font-bold)",
  color: "var(--ds-color-text-primary)",
  marginTop: "var(--ds-space-8)",
  marginBottom: "var(--ds-space-3)",
  fontFamily: "var(--ds-font-display)",
};

const bulletStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "var(--ds-space-2)",
  marginBottom: "var(--ds-space-2)",
  paddingLeft: "var(--ds-space-2)",
  color: "var(--ds-color-text-secondary)",
};

const placeLink: React.CSSProperties = {
  color: "var(--ds-color-accent)",
  textDecoration: "none",
  fontWeight: 600,
  borderBottom: "1px solid rgba(230,81,0,0.3)",
};

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div style={bulletStyle}>
      <span style={{ color: "var(--ds-color-accent)", marginTop: 6, flexShrink: 0 }}>•</span>
      <span>{children}</span>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={h2style}>{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={p}>{children}</p>;
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
        margin: "8px 0 28px",
        maxHeight: 380,
      }}
    />
  );
}

function PL({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link to={href} style={placeLink}>{children}</Link>;
}

function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontWeight: 700, color: "var(--ds-color-text-primary)", marginBottom: "var(--ds-space-1)", fontSize: "var(--ds-text-base)" }}>
      {children}
    </p>
  );
}

/* ── Conteúdo: Roteiro de 1 Dia ──────────────────────────────────────────── */

function RoteiroContent() {
  return (
    <div>
      <P>
        Um dia em Holambra é tempo suficiente para sair diferente de como entrou. Não é exagero — tem algo na
        escala humana da cidade, no ritmo das pessoas, no cheiro das flores misturado com café fresco, que vai
        te pegar de jeito. E o melhor: a cidade é compacta. Você vai a pé de um ponto ao outro, sem estresse,
        sem trânsito, sem pressa.
      </P>
      <P>
        Este roteiro foi feito para quem quer aproveitar de verdade — não só tirar foto e ir embora. Siga na
        ordem que quiser. Holambra recompensa quem vai devagar.
      </P>

      <EditImg
        src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=900&h=420&fit=crop&q=80"
        alt="Flores de Holambra — cidade das flores"
      />

      <H2>Manhã (8h – 12h)</H2>
      <P>
        Comece o dia no <PL href="/app/lugar/4212">Zoet en Zout</PL> — café artesanal com vitrine holandesa,
        um dos espaços mais característicos de Holambra. O nome em holandês significa "doce e salgado", e essa
        dualidade define o lugar: você chega para um expresso e quarenta minutos depois ainda está lá, feliz.
        Outras boas opções para o café da manhã são a <PL href="/app/lugar/6428">Oma Beppie</PL> — com as
        famosas stroopwafels quentinhas que vão virar o sabor da sua memória de Holambra — e a{" "}
        <PL href="/app/lugar/29">Kéndi Cafeteria</PL>, com croissant de respeito e método japonês Hario V60.
      </P>
      <P>
        Depois do café, vá direto para o <PL href="/app/lugar/32">Bloemen Park</PL>. A luz da manhã no campo
        de girassóis é completamente diferente da tarde — mais suave, mais dourada, sem o sol na cara. Leve
        tempo, caminhe devagar, e não tente fazer as fotos todas de uma vez: o parque tem ângulos que você só
        descobre explorando.
      </P>

      <EditImg
        src="https://images.unsplash.com/photo-1490750967868-88df5691cc5b?w=900&h=380&fit=crop&q=80"
        alt="Campo de girassóis — Bloemen Park Holambra"
      />

      <H2>Almoço (12h – 14h)</H2>
      <P>
        Na hora do almoço, siga para o Boulevard Holandês — a área mais agradável da cidade para comer bem sem
        pressa. As ruas são sombreadas, os restaurantes têm mesas do lado de fora e o ritmo aqui convida a ficar.
        Entre as indicações do Oranje:{" "}
        <PL href="/app/lugar/3824">De Immigrant Restaurante Garden</PL> para a experiência mais completa da
        gastronomia holandesa; <PL href="/app/lugar/2613">Martin Holandesa</PL> para a confeitaria com décadas
        de história; <PL href="/app/lugar/25">Villa Girassol</PL> para quem quer vista enquanto come.
      </P>
      <P>
        Peça a recomendação do dia ao garçom — em Holambra, isso quase sempre rende uma boa surpresa. Os
        restaurantes daqui têm o hábito bonito de usar o que está fresco e em abundância na região.
      </P>

      <H2>Tarde (14h – 18h)</H2>
      <P>
        A tarde em Holambra pede ritmo contemplativo. Dois destinos que não podem ficar de fora:
      </P>
      <P>
        O <PL href="/app/lugar/2616">Moinho Povos Unidos</PL> é o símbolo mais fotografado da cidade —
        o moinho holandês que ficou famoso como cenário e como representação da herança cultural dos imigrantes
        que fundaram Holambra. É mais do que uma foto: é entender de onde a cidade veio.
      </P>
      <P>
        Já o <PL href="/app/lugar/4213">Deck do Amor</PL> entrega o melhor pôr do sol que Holambra tem a
        oferecer. Um mirante sobre o lago com uma trilha curta e tranquila — chegue com pelo menos 40 minutos
        de antecedência para pegar a luz no momento certo. Quem vai com pressa, se arrepende.
      </P>

      <EditImg
        src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=900&h=380&fit=crop&q=80"
        alt="Moinho holandês — símbolo de Holambra"
      />

      <H2>Noite (18h – 22h)</H2>
      <P>
        Holambra não dorme cedo — mas também não vira madrugada. A noite aqui é sobre ritmo, não sobre horário.
        Para quem quer encerrar o dia com uma boa refeição, o{" "}
        <PL href="/app/lugar/43">Quintal dos Avós Gastrobar</PL> é uma das pedidas mais queridas: ambiente
        rústico, comida generosa e drinks que surpreendem. Se a noite pedir algo mais sofisticado, a{" "}
        <PL href="/app/lugar/44">Tulipa's Lounge</PL> entrega drinks autorais e um clima que transforma qualquer
        encerramento num programa especial.
      </P>
      <P>
        Quem for cervejeiro: a <PL href="/app/lugar/6334">Cervejaria Seo Carneiro</PL> é um achado — funciona
        no jardim dos proprietários, com mais de 10 cervejas artesanais e o famoso Croquete Holandês. Pet
        friendly e com área kids. Um dos lugares mais originais de Holambra.
      </P>

      <H2>Dicas para o seu dia em Holambra</H2>
      <Bullet>Chegue cedo no café da manhã — os melhores lugares lotam nos fins de semana antes das 10h</Bullet>
      <Bullet>Vista sapatos confortáveis e leve protetor solar — a tarde no parque pede os dois</Bullet>
      <Bullet>Não tente ver tudo: Holambra recompensa quem escolhe bem e vai devagar</Bullet>
      <Bullet>Durante a Expoflora (setembro), faça reserva nos restaurantes com antecedência</Bullet>
      <Bullet>Baixe o app Oranje — mapa offline, horários atualizados e avaliações reais de cada lugar</Bullet>
    </div>
  );
}

/* ── Conteúdo: Bate e Volta ──────────────────────────────────────────────── */

function BateVoltaContent() {
  return (
    <div>
      <P>
        Holambra é um dos melhores destinos de bate e volta do interior paulista — e provavelmente o mais
        subestimado. A menos de duas horas de São Paulo e a menos de uma hora de Campinas, a cidade entrega
        muito mais do que parece possível para um único dia. A gente que mora aqui já ouviu inúmeras vezes:
        "Não sabia que tinha tudo isso em Holambra." Pois é. Tem.
      </P>

      <EditImg
        src="https://images.unsplash.com/photo-1468818438311-4bab781ab9b1?w=900&h=400&fit=crop&q=80"
        alt="Estrada para Holambra — bate e volta do interior paulista"
      />

      <H2>Distância e como chegar</H2>
      <P>
        De São Paulo, são cerca de 170 km pela Rodovia Anhanguera (SP-330), com saída em Cosmópolis e mais
        15 km até a cidade. O tempo médio é de 1h45 a 2h, dependendo do trânsito na saída da capital. Saindo
        antes das 7h, você chega bem e aproveita a manhã inteira.
      </P>
      <P>
        De Campinas, são 50 km e aproximadamente 45 minutos — uma das opções mais fáceis de bate e volta no
        estado. De Ribeirão Preto, são cerca de 150 km pela Anhanguera, sem perrengue.
      </P>
      <P>
        Não há transporte público direto de SP até Holambra — o ideal é de carro próprio, ou usando o{" "}
        <Link to="/app/receptivo" style={placeLink}>Receptivo Oranje</Link> com motorista particular, que busca
        você em qualquer ponto de São Paulo ou Campinas e leva para os melhores pontos da cidade sem você
        precisar se preocupar com nada.
      </P>

      <H2>Quando ir</H2>
      <P>
        Holambra recebe visitantes o ano todo — e em todos eles entrega algo especial. Mas há momentos que a
        gente recomenda com mais convicção:
      </P>

      <EditImg
        src="https://images.unsplash.com/photo-1455582916367-25f75bfc6710?w=900&h=360&fit=crop&q=80"
        alt="Festival de flores em Holambra — Expoflora setembro"
      />

      <Bullet>
        <strong>Setembro (Expoflora):</strong> O maior festival de flores da América Latina. A cidade fica
        cheia, os parques estão em plena floração e a energia é única. Reserve restaurantes com antecedência
        e chegue cedo — o Bloemen Park já está cheio às 9h nos fins de semana.
      </Bullet>
      <Bullet>
        <strong>Fins de semana em geral:</strong> A cidade pulsa nos sábados e domingos. Mercados, cafés cheios,
        boa energia. Os parques têm horários mais longos e a atmosfera é festiva sem ser caótica.
      </Bullet>
      <Bullet>
        <strong>Dias úteis:</strong> O segredo que os moradores sabem — Holambra na semana é outra cidade.
        Sem fila, sem multidão. Os restaurantes atendem com mais cuidado, os parques ficam tranquilos e
        a experiência fica muito mais contemplativa e pessoal.
      </Bullet>

      <H2>O que fazer num bate e volta</H2>
      <P>
        Um dia bem aproveitado em Holambra tem uma sequência natural. Não precisa seguir à risca — mas esse
        roteiro dificilmente vai te decepcionar:
      </P>

      <BlockLabel>Manhã — café e girassóis</BlockLabel>
      <P>
        Comece com café artesanal no <PL href="/app/lugar/4212">Zoet en Zout</PL> ou na{" "}
        <PL href="/app/lugar/6428">Oma Beppie</PL> — o stroopwafel quentinho é o jeito certo de entrar no
        clima. Depois, vá direto para o <PL href="/app/lugar/32">Bloemen Park</PL> para as fotos no campo de
        girassóis, que ficam melhores com a luz da manhã. Chegue antes das 10h nos fins de semana.
      </P>

      <BlockLabel>Almoço — Boulevard Holandês</BlockLabel>
      <P>
        O Boulevard Holandês concentra boas opções num raio caminhável.{" "}
        <PL href="/app/lugar/3824">De Immigrant Restaurante Garden</PL> é a indicação clássica para quem quer
        a experiência completa da gastronomia local.{" "}
        <PL href="/app/lugar/25">Villa Girassol</PL> é a opção com melhor vista.{" "}
        <PL href="/app/lugar/24">Casa Bela Restaurante</PL> é perfeito para almoço em família, farto e
        acolhedor.
      </P>

      <BlockLabel>Tarde — moinho, lago e pôr do sol</BlockLabel>
      <P>
        Reserve a tarde para o <PL href="/app/lugar/2616">Moinho Povos Unidos</PL>, o{" "}
        <PL href="/app/lugar/19">Parque Van Gogh</PL> e uma caminhada pela área central. Encerre no{" "}
        <PL href="/app/lugar/4213">Deck do Amor</PL> — parada obrigatória para o pôr do sol sobre o lago.
        É a foto que você vai querer ter tirado.
      </P>

      <EditImg
        src="https://images.unsplash.com/photo-1490750967868-88df5691cc5b?w=900&h=360&fit=crop&q=80"
        alt="Girassóis ao pôr do sol em Holambra"
      />

      <BlockLabel>Volta</BlockLabel>
      <P>
        Se saiu de SP antes das 7h, dá para estar de volta às 20h com conforto — ou encerrar com jantar em
        Holambra antes de pegar a estrada. O <PL href="/app/lugar/43">Quintal dos Avós</PL> é uma ótima
        pedida para fechar a noite antes de voltar.
      </P>

      <H2>Dicas para o bate e volta perfeito</H2>
      <Bullet>Saia de SP antes das 7h para evitar trânsito e aproveitar a manhã inteira</Bullet>
      <Bullet>Leve protetor solar e sapatos confortáveis e fechados — a caminhada vai rolar</Bullet>
      <Bullet>
        Os estacionamentos perto do Boulevard Holandês ficam lotados nos fins de semana — chegue cedo ou
        estacione um pouco mais longe e vá a pé. Vale a caminhada.
      </Bullet>
      <Bullet>Baixe o app Oranje antes de sair: mapa offline, horários e avaliações reais de cada lugar</Bullet>
      <Bullet>
        Se quiser ir sem se preocupar com carro, trânsito ou estacionamento, o{" "}
        <Link to="/app/receptivo" style={placeLink}>Receptivo Oranje</Link> oferece passeios com motorista
        particular saindo de SP e Campinas — você chega descansado e aproveita mais.
      </Bullet>
    </div>
  );
}

/* ── Config de SEO por página ────────────────────────────────────────────── */

interface PageConfig {
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  content: React.ReactNode;
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
    subtitle: "Manhã, almoço, tarde e noite — aproveite cada hora da cidade das flores",
    title: "Roteiro de 1 Dia em Holambra",
    description: "Um dia em Holambra: roteiro completo com dicas de manhã, almoço, tarde e noite para aproveitar ao máximo a cidade das flores.",
    content: <RoteiroContent />,
    cta: {
      label: "Planejar meu Roteiro no App",
      href: "/app/roteiros",
      descriptionText: "O app Oranje tem roteiros curados para todos os perfis de visitante. Salve seus lugares favoritos, veja horários em tempo real e monte um roteiro personalizado direto do celular — sem precisar de guia.",
      secondary: { label: "Ver Passeios com Motorista", href: "/app/receptivo" },
    },
  },
  "holambra-bate-e-volta": {
    h1: "Holambra Bate e Volta",
    subtitle: "Tudo que você precisa saber para fazer o passeio perfeito saindo de SP ou Campinas",
    title: "Holambra Bate e Volta — Guia Completo saindo de SP e Campinas",
    description: "Holambra bate e volta: distância de SP, quando ir, o que fazer, dicas práticas e roteiro completo para aproveitar o dia na cidade das flores.",
    content: <BateVoltaContent />,
    cta: {
      label: "Ver Passeios com Motorista",
      href: "/app/receptivo",
      descriptionText: "Prefere não se preocupar com carro, trânsito ou estacionamento? O Receptivo Oranje busca você em São Paulo ou Campinas com motorista particular e leva para os melhores pontos da cidade — conforto total, nenhuma logística.",
      secondary: { label: "Explorar no App Oranje", href: "/app/explorar" },
    },
  },
};

/* ── Componente principal ────────────────────────────────────────────────── */

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

    return () => { document.title = SITE; };
  }, [location.pathname, seo]);

  if (!seo) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)" }}>
            Página não encontrada
          </h1>
          <p style={{ color: "var(--ds-color-text-muted)" }}>A página que você procura não existe.</p>
        </div>
      </div>
    );
  }

  return (
    <SiteContentPage
      title={seo.h1}
      subtitle={seo.subtitle}
      content={seo.content}
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
