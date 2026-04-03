import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import SiteContentPage from "./SiteContentPage";

/* ─────────────────────────────────────────────
   Helpers
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

function PlaceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      to={href}
      style={{
        color: "var(--ds-color-accent)",
        textDecoration: "none",
        fontWeight: 600,
        borderBottom: "1px solid rgba(230,81,0,0.3)",
        transition: "border-color 0.2s",
      }}
    >
      {children}
    </Link>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: "var(--ds-text-2xl)",
        fontWeight: "var(--ds-font-bold)",
        color: "var(--ds-color-text-primary)",
        marginTop: "var(--ds-space-10)",
        marginBottom: "var(--ds-space-3)",
        fontFamily: "var(--ds-font-display)",
      }}
    >
      {children}
    </h2>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        marginBottom: "var(--ds-space-4)",
        color: "var(--ds-color-text-secondary)",
        lineHeight: "var(--ds-leading-relaxed)",
        fontSize: "var(--ds-text-base)",
      }}
    >
      {children}
    </p>
  );
}

function PlaceCard({ name, desc, href }: { name: string; desc: string; href: string }) {
  return (
    <Link
      to={href}
      style={{
        display: "block",
        padding: "var(--ds-space-4) var(--ds-space-5)",
        borderRadius: "var(--ds-radius-lg)",
        border: "1px solid rgba(230,81,0,0.15)",
        background: "var(--ds-color-bg-secondary)",
        textDecoration: "none",
        marginBottom: "var(--ds-space-3)",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(230,81,0,0.5)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(230,81,0,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(230,81,0,0.15)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: "var(--ds-color-text-primary)",
          marginBottom: "var(--ds-space-1)",
          fontSize: "var(--ds-text-base)",
          fontFamily: "var(--ds-font-display)",
        }}
      >
        {name}
      </div>
      <div style={{ color: "var(--ds-color-text-muted)", fontSize: "var(--ds-text-sm)" }}>{desc}</div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   Página: Restaurantes
───────────────────────────────────────────── */

function RestaurantesContent() {
  return (
    <div>
      <Para>
        Holambra surpreende quem chega esperando apenas flores. A cena gastronômica da cidade cresceu junto com o
        turismo e hoje oferece experiências de verdade — desde almoços à beira do lago até cardápios que cruzam
        culturas brasileiras, holandesas e italianas sem perder a identidade local.
      </Para>
      <Para>
        Aqui você não vai encontrar genéricas "opções para todos os gostos". O que existe em Holambra são lugares com
        história, ingredientes frescos e cozinheiros que conhecem seus clientes pelo nome.
      </Para>

      <SectionTitle>Onde comer bem em Holambra</SectionTitle>
      <Para>
        Para um almoço tranquilo com vista para o lago, o{" "}
        <PlaceLink href="/app/lugar/6">Deck do Lago</PlaceLink> é referência. As mesas à beira d'água e o cardápio
        descomplicado fazem dele um dos favoritos de quem visita Holambra pela primeira vez — e de quem já volta pela
        décima.
      </Para>
      <Para>
        Quem prefere uma experiência mais clássica e com ambiente requintado vai bem no{" "}
        <PlaceLink href="/app/lugar/1">Restaurante De Klok</PlaceLink>, um dos mais tradicionais da cidade, que carrega
        no nome e na decoração a herança holandesa que define o espírito de Holambra.
      </Para>
      <Para>
        O <PlaceLink href="/app/lugar/24">Casa Bela Restaurante</PlaceLink> é a pedida certa para refeições em família.
        Ambiente acolhedor, cardápio farto e preço justo — o tipo de lugar que você recomenda sem hesitar.
      </Para>

      <SectionTitle>Para os que gostam de algo diferente</SectionTitle>
      <Para>
        O <PlaceLink href="/app/lugar/36">De Immigrant Garden</PlaceLink> traz uma proposta mais autoral, com pratos
        que contam histórias de imigração e pertencimento. Ótimo para quem quer ir além do convencional.
      </Para>
      <Para>
        Se a fome for por hambúrguer artesanal de qualidade, o{" "}
        <PlaceLink href="/app/lugar/42">Cowburguer</PlaceLink> entrega exatamente isso — sem firulas, com muito sabor.
      </Para>
      <Para>
        E o <PlaceLink href="/app/lugar/35">Garden Restaurante</PlaceLink> fecha essa lista com um ambiente verde e
        agradável, ideal para quem quer comer bem num ambiente que combina com a natureza da cidade.
      </Para>

      <SectionTitle>Dicas de quem conhece</SectionTitle>
      <Para>
        Holambra tem movimento intenso nos fins de semana e durante a Expoflora. Se for nessas datas,{" "}
        <strong>faça reserva com antecedência</strong> — os restaurantes mais procurados lotam cedo. Na semana, você
        consegue mesa com mais tranquilidade e muitas vezes um atendimento ainda mais cuidadoso.
      </Para>
      <Para>
        O horário de almoço começa cedo — por volta de 11h30 muitos lugares já estão servindo. Aproveite para chegar
        antes do pico e pedir a recomendação do dia ao garçom. Em Holambra, isso costuma render as melhores surpresas.
      </Para>

      <PlaceCard name="Restaurante De Klok" desc="Cozinha tradicional, ambiente clássico e herança holandesa" href="/app/lugar/1" />
      <PlaceCard name="Deck do Lago" desc="Vista para o lago, cardápio descomplicado, excelente para almoço" href="/app/lugar/6" />
      <PlaceCard name="Casa Bela Restaurante" desc="Ambiente familiar, farto e acolhedor" href="/app/lugar/24" />
      <PlaceCard name="De Immigrant Garden" desc="Proposta autoral e ingredientes locais" href="/app/lugar/36" />
      <PlaceCard name="Garden Restaurante" desc="Ambiente arborizado, ótima pedida para almoço tranquilo" href="/app/lugar/35" />
      <PlaceCard name="Cowburguer" desc="Hambúrguer artesanal de qualidade em Holambra" href="/app/lugar/42" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Página: Cafés
───────────────────────────────────────────── */

function CafesContent() {
  return (
    <div>
      <Para>
        Holambra e o café têm uma relação especial. Não é só por causa do clima ameno ou das ruas floridas — é porque
        os cafés da cidade entenderam que o momento do café importa tanto quanto a bebida em si. Aqui, sentar para
        tomar um café é uma pausa de verdade, não uma corrida.
      </Para>
      <Para>
        Se você veio a Holambra e não parou em nenhum café, você perdeu uma parte importante da experiência.
      </Para>

      <SectionTitle>Os cafés que valem a visita</SectionTitle>
      <Para>
        O <PlaceLink href="/app/lugar/2">Café Moinho</PlaceLink> é parada obrigatória. O espaço remete à arquitetura
        holandesa, o café é bem feito e os acompanhamentos saem frescos da cozinha. É o tipo de lugar que faz você
        querer ficar mais uma hora do que havia planejado.
      </Para>
      <Para>
        Para uma experiência mais contemporânea, o <PlaceLink href="/app/lugar/27">Lotus Café</PlaceLink> traz um
        ambiente que equilibra tranquilidade e estilo. Ótimo para trabalhar remotamente, encontrar alguém ou
        simplesmente passar a tarde lendo.
      </Para>
      <Para>
        Já a <PlaceLink href="/app/lugar/29">Kéndi Confeitaria</PlaceLink> é a escolha perfeita para quem quer unir
        café com confeitaria de qualidade. As sobremesas fazem jus ao cuidado com que o café é preparado — e o visual
        do lugar é bonito o suficiente para merecer umas fotos.
      </Para>

      <SectionTitle>O que pedir</SectionTitle>
      <Para>
        Em Holambra, os cafés costumam ter opções que vão além do básico. Pergunte sempre sobre a bebida do dia ou a
        especialidade da casa — você vai descobrir preparos que não encontra em grandes redes. Se for no inverno,
        aposte nos drinks quentes com especiarias. Se for no calor da Expoflora, o café gelado é o melhor amigo.
      </Para>
      <Para>
        Quase todos os cafés da cidade também servem algum tipo de comida — de torradas e bolos caseiros a sanduíches
        leves. Não hesite em combinar o café da manhã com um passeio pelo jardim mais próximo.
      </Para>

      <SectionTitle>Quando ir</SectionTitle>
      <Para>
        O horário da manhã, entre 8h e 10h, é o melhor para quem quer evitar filas e aproveitar o frescor do dia. Nos
        fins de semana de Expoflora, os cafés ficam cheios já antes das 9h — chegue cedo ou escolha o período da tarde,
        quando o movimento cai um pouco.
      </Para>

      <PlaceCard name="Café Moinho" desc="Arquitetura holandesa, café bem feito e acompanhamentos frescos" href="/app/lugar/2" />
      <PlaceCard name="Lotus Café" desc="Ambiente contemporâneo, ideal para trabalhar ou relaxar" href="/app/lugar/27" />
      <PlaceCard name="Kéndi Confeitaria" desc="Confeitaria de qualidade unida a um café cuidadoso" href="/app/lugar/29" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Página: Bares & Drinks
───────────────────────────────────────────── */

function BaresContent() {
  return (
    <div>
      <Para>
        Holambra não é conhecida pela vida noturna agitada — e isso é exatamente o que torna seus bares interessantes.
        Sem a pressão de grandes cidades, os bares aqui têm personalidade própria: são lugares onde as pessoas se
        conhecem, a conversa flui e o tempo passa sem que ninguém perceba.
      </Para>
      <Para>
        De botequins descontraídos a lounges mais sofisticados, a cidade tem opções para noites tranquilas ou programas
        em grupo com muito mais sabor do que o esperado.
      </Para>

      <SectionTitle>Bares com identidade</SectionTitle>
      <Para>
        O <PlaceLink href="/app/lugar/4">Boteco do Holandês</PlaceLink> é o jeito mais honesto de começar essa lista.
        Sem pretensão, com chopp gelado, petiscos caprichados e aquela atmosfera de boteco de bairro que você quer
        encontrar em cada cidade que visita — e raramente acha.
      </Para>
      <Para>
        Para quem prefere algo mais tranquilo e com drinks bem executados, o{" "}
        <PlaceLink href="/app/lugar/13">Quintal Yah</PlaceLink> entrega um ambiente aconchegante com cardápio de drinks
        criativos que combinam com o ritmo leve de Holambra.
      </Para>
      <Para>
        O <PlaceLink href="/app/lugar/12">Deck 237</PlaceLink> traz um espaço ao ar livre que funciona especialmente
        bem nas noites mais frescas — boa música, boa companhia e uma vista que vale o deslocamento.
      </Para>

      <SectionTitle>Cerveja artesanal em Holambra</SectionTitle>
      <Para>
        A cultura cervejeira tem raízes fortes em Holambra — afinal, a herança holandesa e belga está no DNA da cidade.
        O <PlaceLink href="/app/lugar/26">Restaurante e Cervejaria Holambier</PlaceLink> é a expressão mais completa
        disso: produção própria, rótulos exclusivos e um espaço que convida a ficar.
      </Para>
      <Para>
        O <PlaceLink href="/app/lugar/11">Seo Carneiro Bar</PlaceLink> também merece atenção — um dos mais queridos
        pelos moradores locais, com ambiente descontraído e o tipo de petisco que combina com qualquer cerveja.
      </Para>

      <SectionTitle>Para noites mais longas</SectionTitle>
      <Para>
        O <PlaceLink href="/app/lugar/43">Quintal dos Avós Gastrobar</PlaceLink> une gastronomia e drinks num espaço
        com cara de casa de família — rústico, caloroso e com cardápio que vai muito além do petisco comum.
      </Para>
      <Para>
        E se a noite pedir um clima mais elegante, a{" "}
        <PlaceLink href="/app/lugar/44">Tulipa's Lounge</PlaceLink> é a resposta certa: ambiente sofisticado, drinks
        autorais e uma seleção de música que transforma qualquer terça em um programa especial.
      </Para>

      <PlaceCard name="Boteco do Holandês" desc="Botequim autêntico, chopp gelado e petiscos caprichados" href="/app/lugar/4" />
      <PlaceCard name="Seo Carneiro Bar" desc="Querido pelos locais, ambiente leve e descontraído" href="/app/lugar/11" />
      <PlaceCard name="Deck 237" desc="Espaço ao ar livre, boa música e view agradável" href="/app/lugar/12" />
      <PlaceCard name="Quintal Yah" desc="Drinks criativos, ambiente tranquilo" href="/app/lugar/13" />
      <PlaceCard name="Cervejaria Holambier" desc="Produção própria, rótulos exclusivos e espaço completo" href="/app/lugar/26" />
      <PlaceCard name="Quintal dos Avós Gastrobar" desc="Gastronomia e drinks num ambiente rústico e acolhedor" href="/app/lugar/43" />
      <PlaceCard name="Tulipa's Lounge" desc="Ambiente sofisticado, drinks autorais e boa música" href="/app/lugar/44" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Página: Pontos Turísticos
───────────────────────────────────────────── */

function PontosTuristicosContent() {
  return (
    <div>
      <Para>
        Holambra não é grande — e isso é uma vantagem. Em poucos quilômetros, você encontra parques floridos, lagos,
        espaços culturais e pontos que concentram tudo o que torna essa cidade única no Brasil. É o tipo de lugar que
        funciona tanto para uma tarde quanto para um fim de semana inteiro.
      </Para>
      <Para>
        O segredo para aproveitar bem Holambra é não tentar ver tudo de uma vez. Escolha bem, caminhe sem pressa e
        deixe a cidade te surpreender.
      </Para>

      <SectionTitle>O grande evento que virou ponto fixo</SectionTitle>
      <Para>
        O <PlaceLink href="/app/lugar/5">Expoflora Park</PlaceLink> é o coração turístico de Holambra. Durante a
        Expoflora — realizada todo setembro — o parque recebe centenas de milhares de visitantes e se transforma numa
        das maiores exposições de flores da América Latina. Fora do período do festival, o espaço também mantém
        atrações e é ponto de referência para quem chega à cidade.
      </Para>

      <SectionTitle>Parques para caminhar, respirar e fotografar</SectionTitle>
      <Para>
        O <PlaceLink href="/app/lugar/19">Parque Van Gogh</PlaceLink> é um dos mais fotografados de Holambra — a
        combinação de jardins bem cuidados com referências ao pintor holandês cria um cenário incomum que funciona em
        qualquer estação do ano.
      </Para>
      <Para>
        O <PlaceLink href="/app/lugar/20">Parque Bloemen</PlaceLink> e o{" "}
        <PlaceLink href="/app/lugar/32">Bloemen Park</PlaceLink> expandem essa experiência com mais espaço verde,
        flores e estrutura para passeios tranquilos — ótimos para famílias ou casais que querem um programa sem
        pressa.
      </Para>
      <Para>
        O <PlaceLink href="/app/lugar/34">Macena Flores</PlaceLink> é uma parada especial para quem quer ver flores de
        perto, em canteiros cuidados e com opção de compra. A beleza do lugar está na simplicidade e na abundância de
        cor.
      </Para>

      <SectionTitle>Para ir com crianças</SectionTitle>
      <Para>
        A <PlaceLink href="/app/lugar/21">Cidade das Crianças</PlaceLink> é a atração mais indicada para famílias com
        os pequenos. O espaço tem infraestrutura pensada para crianças, com brinquedos, segurança e muito espaço para
        correr — enquanto os adultos respiram e tomam aquele café merecido.
      </Para>
      <Para>
        O <PlaceLink href="/app/lugar/22">Parque Vitória</PlaceLink> e a{" "}
        <PlaceLink href="/app/lugar/23">Nossa Prainha</PlaceLink> completam o leque de opções ao ar livre, com área
        verde, água e espaço para piqueniques e momentos em família.
      </Para>

      <SectionTitle>Como se planejar</SectionTitle>
      <Para>
        A maioria dos parques de Holambra tem horários de visitação e, em alguns casos, cobrança de entrada. Confira
        os detalhes no app antes de sair — você economiza tempo e evita surpresas na bilheteria.
      </Para>
      <Para>
        O melhor horário para fotos é logo pela manhã, antes do sol forte, ou no final da tarde, quando a luz fica
        mais dourada e os parques ficam mais tranquilos. Use roupas confortáveis e leve água — mesmo em dias frescos, o
        sol de Holambra pede respeito.
      </Para>

      <PlaceCard name="Expoflora Park" desc="O coração turístico de Holambra e sede da maior expo de flores do Brasil" href="/app/lugar/5" />
      <PlaceCard name="Parque Van Gogh" desc="Jardins temáticos e cenário único inspirado no pintor holandês" href="/app/lugar/19" />
      <PlaceCard name="Parque Bloemen" desc="Espaço verde amplo, ideal para passeios tranquilos e fotos" href="/app/lugar/20" />
      <PlaceCard name="Cidade das Crianças" desc="Atração ideal para famílias com crianças" href="/app/lugar/21" />
      <PlaceCard name="Parque Vitória" desc="Área verde com lago, ótimo para piquenique" href="/app/lugar/22" />
      <PlaceCard name="Nossa Prainha" desc="Espaço de lazer à beira d'água, perfeito para relaxar" href="/app/lugar/23" />
      <PlaceCard name="Bloemen Park" desc="Flores, jardins e tranquilidade no coração de Holambra" href="/app/lugar/32" />
      <PlaceCard name="Macena Flores" desc="Canteiros coloridos, beleza simples e abundante" href="/app/lugar/34" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Página: Eventos
───────────────────────────────────────────── */

function EventosContent() {
  return (
    <div>
      <Para>
        Holambra é uma cidade que sabe fazer festa. Não no sentido barulhento do termo — mas no sentido de que os
        eventos aqui têm raiz cultural, história e uma comunidade local que abraça cada um deles de verdade. Ao longo
        do ano, a cidade se transforma em diferentes versões de si mesma dependendo do que está acontecendo.
      </Para>
      <Para>
        Se você ainda não planejou uma visita em torno de algum evento, este é o motivo para fazer isso.
      </Para>

      <SectionTitle>Expoflora — o maior de todos</SectionTitle>
      <Para>
        A Expoflora acontece todo mês de setembro e é, sem exagero, um dos eventos mais impressionantes do interior
        paulista. Mais de 600 mil visitantes por edição. Flores que cobrem o chão, as paredes e o ar. Artesanato,
        gastronomia, música e cultura holandesa em tudo.
      </Para>
      <Para>
        Se você nunca foi, coloque na agenda. Se já foi, sabe que é difícil ir só uma vez. O Expoflora Park fica
        tomado de vida e cor de um jeito que nenhuma foto consegue traduzir completamente.
      </Para>

      <SectionTitle>Mês do Rei — cultura holandesa em fevereiro</SectionTitle>
      <Para>
        O Mês do Rei é a celebração da identidade holandesa de Holambra. Com trajes típicos, música folclórica,
        desfiles e uma série de atividades culturais, o evento lembra as raízes dos imigrantes que fundaram a cidade.
        É menor que a Expoflora, mas tem um charme particular — mais íntimo, mais local, mais verdadeiro.
      </Para>

      <SectionTitle>Hortitec — para quem trabalha com o campo</SectionTitle>
      <Para>
        A Hortitec é uma feira técnica de horticultura que acontece em junho e reúne produtores, pesquisadores e
        profissionais do setor de flores e plantas de todo o Brasil. Para o visitante comum, é uma oportunidade única
        de ver de perto a cadeia produtiva que fez Holambra famosa — e entender por que a cidade funciona como
        funciona.
      </Para>

      <SectionTitle>Feiras, festas e o calendário que nunca para</SectionTitle>
      <Para>
        Além dos grandes eventos, Holambra mantém um calendário regular de feiras de flores, festivais gastronômicos e
        festas temáticas ao longo do ano. O centro da cidade costuma ter alguma programação especial em feriados e fins
        de semana prolongados.
      </Para>
      <Para>
        O app Oranje tem o calendário completo de eventos atualizado — é a forma mais prática de saber o que está
        acontecendo antes de planejar sua visita ou, se você já estiver na cidade, descobrir o que não pode perder
        naquele fim de semana.
      </Para>

      <SectionTitle>Como se planejar</SectionTitle>
      <Para>
        Durante a Expoflora e o Mês do Rei, Holambra lota. Hotéis chegam a ficar sem vagas semanas antes — reserve
        com antecedência. Os restaurantes também ficam cheios, então planeje os horários com mais flexibilidade do que
        o habitual.
      </Para>
      <Para>
        Fora das grandes datas, a cidade recebe bem e sem filas. É uma experiência completamente diferente — mais
        tranquila, mais autêntica, mais parecida com o dia a dia dos moradores.
      </Para>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Página: Roteiro de 1 Dia (preservado)
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
   SEO config por página
───────────────────────────────────────────── */

const seoConfig: Record<string, { title: string; description: string; h1: string; subtitle: string }> = {
  "melhores-restaurantes-de-holambra": {
    h1: "Melhores Restaurantes em Holambra",
    subtitle: "Uma curadoria real dos lugares para comer bem na capital brasileira das flores",
    title: "Melhores Restaurantes em Holambra — Guia Oranje",
    description:
      "Descubra os melhores restaurantes de Holambra com curadoria do Oranje. Do Deck do Lago ao De Klok, veja onde comer bem com avaliações reais.",
  },
  "melhores-cafes-de-holambra": {
    h1: "Melhores Cafés em Holambra",
    subtitle: "De bistrôs aconchegantes a confeitarias autorais — os cafés que valem a parada",
    title: "Melhores Cafés em Holambra — Guia Oranje",
    description:
      "Os melhores cafés de Holambra em um só lugar. Café Moinho, Lotus Café, Kéndi Confeitaria e mais — descubra onde tomar um bom café na cidade das flores.",
  },
  "bares-e-drinks-em-holambra": {
    h1: "Bares & Drinks em Holambra",
    subtitle: "Botequins com personalidade, cerveja artesanal e lounges para noites memoráveis",
    title: "Bares e Drinks em Holambra — Guia Oranje",
    description:
      "Guia completo dos melhores bares de Holambra: Boteco do Holandês, Cervejaria Holambier, Tulipa's Lounge e mais. Vida noturna com identidade local.",
  },
  "onde-tirar-fotos-em-holambra": {
    h1: "Pontos Turísticos de Holambra",
    subtitle: "Parques, flores e experiências que só existem aqui — os lugares que definem a cidade",
    title: "Pontos Turísticos de Holambra — Guia Oranje",
    description:
      "Os principais pontos turísticos de Holambra: Expoflora Park, Parque Van Gogh, Cidade das Crianças e mais. Saiba o que visitar, quando ir e como se planejar.",
  },
  "eventos-em-holambra": {
    h1: "Eventos em Holambra",
    subtitle: "Expoflora, Mês do Rei, Hortitec e o calendário que transforma a cidade ao longo do ano",
    title: "Eventos em Holambra — Guia Oranje",
    description:
      "Conheça os principais eventos de Holambra: Expoflora em setembro, Mês do Rei em fevereiro, Hortitec em junho e muito mais. Planeje sua visita com o Oranje.",
  },
  "roteiro-1-dia-em-holambra": {
    h1: "Roteiro de 1 Dia em Holambra",
    subtitle: "Do café da manhã ao jantar — como aproveitar ao máximo um dia inteiro na cidade",
    title: "Roteiro de 1 Dia em Holambra — Guia Oranje",
    description:
      "Roteiro completo para aproveitar Holambra em um dia: onde tomar café, almoçar, visitar parques e terminar bem a noite. Curadoria Oranje.",
  },
};

/* ─────────────────────────────────────────────
   Componente principal
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

  const isRoteiro = page === "roteiro-1-dia-em-holambra";

  const jsxContent: Record<string, React.ReactNode> = {
    "melhores-restaurantes-de-holambra": <RestaurantesContent />,
    "melhores-cafes-de-holambra": <CafesContent />,
    "bares-e-drinks-em-holambra": <BaresContent />,
    "onde-tirar-fotos-em-holambra": <PontosTuristicosContent />,
    "eventos-em-holambra": <EventosContent />,
  };

  const ctaMap: Record<string, { label: string; href: string }> = {
    "melhores-restaurantes-de-holambra": { label: "Ver restaurantes no App", href: "/app" },
    "melhores-cafes-de-holambra": { label: "Ver cafés no App", href: "/app" },
    "bares-e-drinks-em-holambra": { label: "Ver bares no App", href: "/app" },
    "onde-tirar-fotos-em-holambra": { label: "Explorar pontos turísticos", href: "/app" },
    "eventos-em-holambra": { label: "Ver eventos no App", href: "/app/eventos" },
    "roteiro-1-dia-em-holambra": { label: "Planejar meu roteiro no App", href: "/app" },
  };

  const content = isRoteiro ? (
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
  ) : (
    jsxContent[page]
  );

  return (
    <SiteContentPage
      title={seo.h1}
      subtitle={seo.subtitle}
      content={content}
      cta={ctaMap[page]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: seo.h1, href: location.pathname },
      ]}
    />
  );
}
