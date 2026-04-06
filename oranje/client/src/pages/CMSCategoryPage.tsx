import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import SiteContentPage from "./SiteContentPage";
import SiteLayout from "@/components/SiteLayout";
import { trpc } from "@/lib/trpc";

/* ─────────────────────────────────────────────
   SEO helpers
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
   JSX helpers — used in static fallback content
───────────────────────────────────────────── */
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
   Fallback JSX content por slug
   (usado quando CMS não tem dado publicado)
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
        Para um almoço tranquilo com ambiente descontraído, o{" "}
        <PlaceLink href="/app/lugar/2614">Lago do Holandês</PlaceLink> é referência. Com cardápio acessível e
        atmosfera de cidade pequena, é um dos favoritos de quem visita Holambra pela primeira vez — e de quem já
        volta pela décima.
      </Para>
      <Para>
        Quem busca culinária holandesa de verdade encontra no{" "}
        <PlaceLink href="/app/lugar/2613">Martin Holandesa</PlaceLink> uma das experiências mais autênticas da cidade
        — confeitaria e restaurante no Boulevard Holandês, com décadas de história e pratos que carregam a herança
        holandesa que define o espírito de Holambra.
      </Para>
      <Para>
        O <PlaceLink href="/app/lugar/24">Casa Bela Restaurante</PlaceLink> é a pedida certa para refeições em família.
        Ambiente acolhedor, cardápio farto e preço justo — o tipo de lugar que você recomenda sem hesitar.
      </Para>
      <SectionTitle>Para os que gostam de algo diferente</SectionTitle>
      <Para>
        O <PlaceLink href="/app/lugar/36">De Immigrant Gastro Café</PlaceLink> abre todos os dias a partir das 8h
        — café da manhã, almoço regional e uma proposta que conta a história dos imigrantes holandeses que fundaram
        Holambra. Na mesma rua, o{" "}
        <PlaceLink href="/app/lugar/3824">De Immigrant Restaurante Garden</PlaceLink> amplia essa experiência com
        cardápio autoral em ambiente garden. Os dois juntos formam um dos endereços mais ricos da cidade.
      </Para>
      <Para>
        Para hambúrguer artesanal, o{" "}
        <PlaceLink href="/app/lugar/42">Cowburguer</PlaceLink> entrega exatamente isso — sem firulas, com muito sabor.
        E o recém-chegado <PlaceLink href="/app/lugar/13946">Don Hamburgo</PlaceLink> já está conquistando quem busca
        hambúrguer de qualidade em Holambra.
      </Para>
      <Para>
        Para esfiha e comida árabe num endereço descontraído,{" "}
        <PlaceLink href="/app/lugar/13952">Casa da Esfiha</PlaceLink> é a novidade que cabe bem no roteiro —
        funcionando diariamente a partir das 17h.
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
      <PlaceCard name="Martin Holandesa" desc="Confeitaria e restaurante holandês — referência histórica no Boulevard Holandês" href="/app/lugar/2613" />
      <PlaceCard name="Lago do Holandês" desc="Cardápio acessível, atmosfera de cidade pequena — ótimo para almoço" href="/app/lugar/2614" />
      <PlaceCard name="Casa Bela Restaurante" desc="Ambiente familiar, farto e acolhedor" href="/app/lugar/24" />
      <PlaceCard name="Restaurante Villa Girassol" desc="Culinária regional e ambiente agradável no coração de Holambra" href="/app/lugar/25" />
      <PlaceCard name="De Immigrant Gastro Café" desc="Café da manhã, almoço e história da imigração holandesa — desde as 8h" href="/app/lugar/36" />
      <PlaceCard name="De Immigrant Restaurante Garden" desc="Cardápio autoral em ambiente garden — vizinho ao Gastro Café" href="/app/lugar/3824" />
      <PlaceCard name="Cowburguer" desc="Hambúrguer artesanal de qualidade em Holambra" href="/app/lugar/42" />
      <PlaceCard name="Don Hamburgo" desc="Novo hambúrgueria artesanal — já conquistando quem visita Holambra" href="/app/lugar/13946" />
      <PlaceCard name="Casa da Esfiha" desc="Esfiha e opções árabes — aberto diariamente a partir das 17h" href="/app/lugar/13952" />
    </div>
  );
}

function CafesContent() {
  return (
    <div>
      <Para>
        Holambra é uma cidade que sabe desacelerar — e o café é parte essencial dessa experiência. A cena de cafés
        na cidade é enxuta mas com identidade própria: são lugares onde a pausa é intencional e o detalhe conta.
      </Para>
      <Para>
        Não espere volume. Espere qualidade e autenticidade — que é o que Holambra entrega quando está no seu melhor.
      </Para>
      <SectionTitle>Os cafés que valem a visita</SectionTitle>
      <Para>
        O <PlaceLink href="/app/lugar/4212">Zoet en Zout</PlaceLink> é a referência atual da cena de cafés em Holambra.
        O nome em holandês — que significa "doce e salgado" — já diz a proposta: um espaço que cruza bem o café
        artesanal com opções de vitrine, num ambiente que traduz o charme da herança holandesa da cidade. É o tipo de
        lugar que faz você querer chegar cedo e sair tarde.
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
      <Para>
        E a <PlaceLink href="/app/lugar/6428">Oma Beppie</PlaceLink> é parada obrigatória para quem quer experimentar
        a confeitaria holandesa mais tradicional de Holambra. As famosas stroopwafels — biscoitos de caramelo
        característicos da Holanda — saem frescos de lá. Um sabor que resume bem a herança cultural da cidade.
      </Para>
      <SectionTitle>O que pedir</SectionTitle>
      <Para>
        Em Holambra, os cafés costumam ter opções que vão além do básico. Pergunte sempre sobre a bebida do dia ou a
        especialidade da casa — você vai descobrir preparos que não encontra em grandes redes. Se for no inverno,
        aposte nos drinks quentes com especiarias. Se for no calor da Expoflora, o café gelado é o melhor amigo.
      </Para>
      <SectionTitle>Quando ir</SectionTitle>
      <Para>
        O horário da manhã, entre 8h e 10h, é o melhor para quem quer evitar filas e aproveitar o frescor do dia. Nos
        fins de semana de Expoflora, os cafés ficam cheios já antes das 9h — chegue cedo ou escolha o período da tarde,
        quando o movimento cai um pouco.
      </Para>
      <PlaceCard name="Zoet en Zout" desc="Café artesanal e vitrine holandesa — referência atual dos cafés de Holambra" href="/app/lugar/4212" />
      <PlaceCard name="Lotus Café" desc="Ambiente contemporâneo, ideal para trabalhar ou relaxar" href="/app/lugar/27" />
      <PlaceCard name="Kéndi Confeitaria" desc="Confeitaria de qualidade unida a um café cuidadoso" href="/app/lugar/29" />
      <PlaceCard name="Oma Beppie" desc="Confeitaria tradicional holandesa — stroopwafels e doces típicos de Holambra" href="/app/lugar/6428" />
    </div>
  );
}

function BaresContent() {
  return (
    <div>
      <Para>
        Holambra não é conhecida pela vida noturna agitada — e isso é exatamente o que torna seus bares interessantes.
        Sem a pressão de grandes cidades, os bares aqui têm personalidade própria: são lugares onde as pessoas se
        conhecem, a conversa flui e o tempo passa sem que ninguém perceba.
      </Para>
      <Para>
        A oferta de bares em Holambra é enxuta mas bem escolhida — cada um com proposta diferente, todos com
        identidade local.
      </Para>
      <SectionTitle>Cerveja artesanal em Holambra</SectionTitle>
      <Para>
        A cultura cervejeira tem raízes fortes em Holambra — afinal, a herança holandesa e belga está no DNA da cidade.
        O <PlaceLink href="/app/lugar/26">Restaurante e Cervejaria Holambier</PlaceLink> é a expressão mais completa
        disso: produção própria, rótulos exclusivos e um espaço que convida a ficar. É o bar mais completo da cidade
        — gastronomia, cerveja e atmosfera num só endereço.
      </Para>
      <SectionTitle>Para vinhos e drinks autorais</SectionTitle>
      <Para>
        A <PlaceLink href="/app/lugar/6418">Fratelli Wine Bar</PlaceLink> é a opção certa para quem prefere vinhos bem
        selecionados e um ambiente mais intimista. Endereço relativamente novo em Holambra, mas já com frequentadores
        fiéis — principalmente em noites de semana, quando a experiência fica ainda mais tranquila.
      </Para>
      <SectionTitle>Para noites mais elegantes</SectionTitle>
      <Para>
        Se a noite pedir um clima mais sofisticado, a{" "}
        <PlaceLink href="/app/lugar/44">Tulipa's Lounge</PlaceLink> é a resposta certa: ambiente cuidado, drinks
        autorais e uma seleção de música que transforma qualquer noite em um programa especial. Um dos endereços mais
        diferentes que Holambra oferece para quem quer algo além do comum.
      </Para>
      <SectionTitle>Para noites mais longas</SectionTitle>
      <Para>
        O <PlaceLink href="/app/lugar/43">Quintal dos Avós Gastrobar</PlaceLink> une gastronomia e drinks num espaço
        com cara de casa de família — rústico, caloroso e com cardápio que vai muito além do petisco comum. Um dos
        endereços mais queridos de Holambra para quem quer passar a noite bem.
      </Para>
      <SectionTitle>Dicas para a noite em Holambra</SectionTitle>
      <Para>
        Holambra não é cidade de virada de madrugada — os bares costumam fechar antes de meia-noite. A experiência
        noturna aqui é mais sobre ritmo do que sobre horário: chegar cedo, pedir com calma e deixar a conversa
        conduzir o tempo. Nos fins de semana, confirme o horário de funcionamento antes de sair.
      </Para>
      <PlaceCard name="Restaurante e Cervejaria Holambier" desc="Produção própria, rótulos exclusivos e espaço completo — o bar mais completo de Holambra" href="/app/lugar/26" />
      <PlaceCard name="Fratelli Wine Bar" desc="Vinhos bem selecionados, ambiente intimista e drinks autorais" href="/app/lugar/6418" />
      <PlaceCard name="Quintal dos Avós Gastrobar" desc="Gastronomia e drinks num ambiente rústico e acolhedor — um dos mais queridos da cidade" href="/app/lugar/43" />
      <PlaceCard name="Tulipa's Lounge" desc="Ambiente sofisticado, drinks autorais e boa música" href="/app/lugar/44" />
    </div>
  );
}

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
      <SectionTitle>O grande evento que define setembro</SectionTitle>
      <Para>
        A <PlaceLink href="/app/lugar/5">Expoflora</PlaceLink> é o maior festival de flores da América Latina e
        acontece todo setembro no Parque de Exposições de Holambra — durante cerca de 30 dias, recebe centenas de
        milhares de visitantes e transforma a cidade numa das mais vibrantes do interior paulista. Se a sua visita
        coincide com setembro, estruture o roteiro em torno dela.
      </Para>
      <SectionTitle>Parques para caminhar, respirar e fotografar</SectionTitle>
      <Para>
        O <PlaceLink href="/app/lugar/19">Parque Van Gogh</PlaceLink> é um dos mais fotografados de Holambra — a
        combinação de jardins bem cuidados com referências ao pintor holandês cria um cenário incomum que funciona em
        qualquer estação do ano.
      </Para>
      <Para>
        O <PlaceLink href="/app/lugar/32">Bloemen Park</PlaceLink> expande essa experiência com mais espaço verde,
        flores e estrutura para passeios tranquilos — ótimo para famílias ou casais que querem um programa sem pressa.
      </Para>
      <Para>
        O <PlaceLink href="/app/lugar/34">Macena Flores</PlaceLink> é uma parada especial para quem quer ver flores de
        perto, em canteiros cuidados e com opção de compra. A beleza do lugar está na simplicidade e na abundância de
        cor.
      </Para>
      <SectionTitle>Cultura, história e os pontos que definem a cidade</SectionTitle>
      <Para>
        O <PlaceLink href="/app/lugar/2616">Moinho Povos Unidos</PlaceLink> é um dos símbolos mais fotografados de
        Holambra — o moinho holandês que ficou famoso como cenário e como representação da herança cultural dos
        imigrantes que fundaram a cidade. É parada obrigatória.
      </Para>
      <Para>
        A <PlaceLink href="/app/lugar/4215">Rua dos Guarda-Chuvas</PlaceLink> — com seus guarda-chuvas coloridos
        suspensos sobre a rua — é um dos pontos mais instagramáveis de Holambra. Simples, bonito e completamente
        único. A <PlaceLink href="/app/lugar/4213">Deck do Amor</PlaceLink> e a{" "}
        <PlaceLink href="/app/lugar/4214">Praça Vitória Régia</PlaceLink> completam um circuito de pontos fotográficos
        que fazem parte do mesmo trajeto romântico pelo centro da cidade.
      </Para>
      <Para>
        Para quem quer entender de onde Holambra veio, o{" "}
        <PlaceLink href="/app/lugar/6424">Museu da Cultura e História de Holambra</PlaceLink> é o ponto de partida
        certo — acervo que conta a imigração holandesa, o desenvolvimento da cidade e a identidade que permanece.
      </Para>
      <SectionTitle>Para ir com crianças e família</SectionTitle>
      <Para>
        A <PlaceLink href="/app/lugar/21">Cidade das Crianças</PlaceLink> é a atração mais indicada para famílias com
        os pequenos. O espaço tem infraestrutura pensada para crianças, com brinquedos, segurança e muito espaço para
        correr — enquanto os adultos respiram e tomam aquele café merecido.
      </Para>
      <Para>
        A <PlaceLink href="/app/lugar/23">Nossa Prainha</PlaceLink> completa o leque de opções ao ar livre, com área
        de lazer à beira d'água, espaço para piqueniques e momentos em família num ambiente tranquilo.
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
      <PlaceCard name="Expoflora" desc="O maior festival de flores da América Latina — acontece todo setembro em Holambra" href="/app/lugar/5" />
      <PlaceCard name="Moinho Povos Unidos" desc="Símbolo de Holambra — o moinho holandês mais fotografado da cidade" href="/app/lugar/2616" />
      <PlaceCard name="Rua dos Guarda-Chuvas" desc="O ponto mais instagramável de Holambra — guarda-chuvas coloridos suspensos" href="/app/lugar/4215" />
      <PlaceCard name="Deck do Amor" desc="Mirante romântico — um dos pontos mais bonitos do circuito central" href="/app/lugar/4213" />
      <PlaceCard name="Praça Vitória Régia" desc="Praça central do circuito fotográfico de Holambra" href="/app/lugar/4214" />
      <PlaceCard name="Parque Van Gogh" desc="Jardins temáticos e cenário único inspirado no pintor holandês" href="/app/lugar/19" />
      <PlaceCard name="Bloemen Park" desc="Flores, jardins e tranquilidade no coração de Holambra" href="/app/lugar/32" />
      <PlaceCard name="Macena Flores" desc="Canteiros coloridos, beleza simples e abundante" href="/app/lugar/34" />
      <PlaceCard name="Cidade das Crianças" desc="Atração ideal para famílias com crianças — brinquedos, segurança e muito espaço" href="/app/lugar/21" />
      <PlaceCard name="Nossa Prainha" desc="Espaço de lazer à beira d'água, perfeito para relaxar em família" href="/app/lugar/23" />
      <PlaceCard name="Museu da Cultura e História de Holambra" desc="Acervo sobre a imigração holandesa e a história da cidade" href="/app/lugar/6424" />
    </div>
  );
}

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
        Se você nunca foi, coloque na agenda. Se já foi, sabe que é difícil ir só uma vez. A Expoflora fica
        tomada de vida e cor de um jeito que nenhuma foto consegue traduzir completamente.
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
        de ver de perto a cadeia produtiva que fez Holambra famosa — e entender por que a cidade funciona como funciona.
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
      <SectionTitle>Onde os eventos acontecem</SectionTitle>
      <Para>
        O <PlaceLink href="/app/lugar/5">Parque de Exposições</PlaceLink> é o palco principal dos grandes eventos de
        Holambra — a Expoflora, shows e feiras temáticas acontecem aqui. O{" "}
        <PlaceLink href="/app/lugar/19">Parque Van Gogh</PlaceLink> e o{" "}
        <PlaceLink href="/app/lugar/32">Bloemen Park</PlaceLink> frequentemente sediam atividades culturais
        ao ar livre durante datas especiais.
      </Para>
      <PlaceCard name="Expoflora" desc="O maior festival de flores da América Latina — todo setembro em Holambra" href="/app/lugar/5" />
      <PlaceCard name="Parque Van Gogh" desc="Eventos e atividades culturais ao ar livre em datas especiais" href="/app/lugar/19" />
      <PlaceCard name="Bloemen Park" desc="Flores, jardins e atividades culturais ao ar livre em Holambra" href="/app/lugar/32" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Config estático por slug — SEO e conteúdo fallback
───────────────────────────────────────────── */
const STATIC_CONFIG: Record<string, {
  h1: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  cta: { label: string; href: string };
  FallbackContent: React.ComponentType;
}> = {
  "melhores-restaurantes-de-holambra": {
    h1: "Melhores Restaurantes em Holambra",
    subtitle: "Uma curadoria real dos lugares para comer bem na capital brasileira das flores",
    seoTitle: "Melhores Restaurantes em Holambra — Guia Oranje",
    seoDescription: "Descubra os melhores restaurantes de Holambra com curadoria do Oranje. Do Lago do Holandês ao Martin Holandesa, veja onde comer bem com avaliações reais.",
    cta: { label: "Ver restaurantes no App", href: "/app" },
    FallbackContent: RestaurantesContent,
  },
  "melhores-cafes-de-holambra": {
    h1: "Melhores Cafés em Holambra",
    subtitle: "Café artesanal e pausas com identidade — os espaços que valem a parada em Holambra",
    seoTitle: "Melhores Cafés em Holambra — Guia Oranje",
    seoDescription: "Os melhores cafés de Holambra: Zoet en Zout, Lotus Café e Kéndi Confeitaria — descubra onde tomar um bom café na cidade das flores com curadoria do Oranje.",
    cta: { label: "Ver cafés no App", href: "/app" },
    FallbackContent: CafesContent,
  },
  "bares-e-drinks-em-holambra": {
    h1: "Bares & Drinks em Holambra",
    subtitle: "Cerveja artesanal, vinhos autorais e lounges para noites memoráveis em Holambra",
    seoTitle: "Bares e Drinks em Holambra — Guia Oranje",
    seoDescription: "Guia completo dos melhores bares de Holambra: Cervejaria Holambier, Quintal dos Avós Gastrobar, Fratelli Wine Bar, Tulipa's Lounge e mais. Vida noturna com identidade local.",
    cta: { label: "Ver bares no App", href: "/app" },
    FallbackContent: BaresContent,
  },
  "onde-tirar-fotos-em-holambra": {
    h1: "Pontos Turísticos de Holambra",
    subtitle: "Parques, flores, o moinho e a Rua dos Guarda-Chuvas — os lugares que definem a cidade",
    seoTitle: "Pontos Turísticos de Holambra — Guia Oranje",
    seoDescription: "Os principais pontos turísticos de Holambra: Expoflora, Moinho Povos Unidos, Rua dos Guarda-Chuvas, Parque Van Gogh e mais. Saiba o que visitar e como se planejar.",
    cta: { label: "Explorar pontos turísticos", href: "/app" },
    FallbackContent: PontosTuristicosContent,
  },
  "eventos-em-holambra": {
    h1: "Eventos em Holambra",
    subtitle: "Expoflora, Mês do Rei, Hortitec e o calendário que transforma a cidade ao longo do ano",
    seoTitle: "Eventos em Holambra — Guia Oranje",
    seoDescription: "Conheça os principais eventos de Holambra: Expoflora em setembro, Mês do Rei em fevereiro, Hortitec em junho e muito mais. Planeje sua visita com o Oranje.",
    cta: { label: "Ver eventos no App", href: "/app/eventos" },
    FallbackContent: EventosContent,
  },
};

/* ─────────────────────────────────────────────
   CSS para conteúdo HTML do CMS
───────────────────────────────────────────── */
const CMS_CONTENT_STYLES = `
  .cms-editorial-content p {
    margin-bottom: var(--ds-space-4);
    color: var(--ds-color-text-secondary);
    line-height: var(--ds-leading-relaxed);
    font-size: var(--ds-text-base);
  }
  .cms-editorial-content h2 {
    font-size: var(--ds-text-2xl);
    font-weight: var(--ds-font-bold);
    color: var(--ds-color-text-primary);
    margin-top: var(--ds-space-10);
    margin-bottom: var(--ds-space-3);
    font-family: var(--ds-font-display);
  }
  .cms-editorial-content h3 {
    font-size: var(--ds-text-xl);
    font-weight: 600;
    color: var(--ds-color-text-primary);
    margin-top: var(--ds-space-6);
    margin-bottom: var(--ds-space-2);
    font-family: var(--ds-font-display);
  }
  .cms-editorial-content a {
    color: var(--ds-color-accent);
    text-decoration: none;
    font-weight: 600;
    border-bottom: 1px solid rgba(230,81,0,0.3);
    transition: border-color 0.2s;
  }
  .cms-editorial-content a:hover { border-color: var(--ds-color-accent); }
  .cms-editorial-content strong { font-weight: 700; color: var(--ds-color-text-primary); }
  .cms-editorial-content ul, .cms-editorial-content ol {
    padding-left: var(--ds-space-5);
    margin-bottom: var(--ds-space-4);
    color: var(--ds-color-text-secondary);
  }
  .cms-editorial-content li { margin-bottom: var(--ds-space-2); line-height: var(--ds-leading-relaxed); }
  .cms-editorial-content .place-card {
    display: block;
    padding: var(--ds-space-4) var(--ds-space-5);
    border-radius: var(--ds-radius-lg);
    border: 1px solid rgba(230,81,0,0.15);
    background: var(--ds-color-bg-secondary);
    text-decoration: none;
    margin-bottom: var(--ds-space-3);
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .cms-editorial-content .place-card:hover {
    border-color: rgba(230,81,0,0.5);
    box-shadow: 0 2px 12px rgba(230,81,0,0.08);
  }
  .cms-editorial-content .place-card-name {
    font-weight: 700;
    color: var(--ds-color-text-primary);
    margin-bottom: var(--ds-space-1);
    font-family: var(--ds-font-display);
    font-size: var(--ds-text-base);
  }
  .cms-editorial-content .place-card-desc { color: var(--ds-color-text-muted); font-size: var(--ds-text-sm); }
`;

/* ─────────────────────────────────────────────
   Componente principal
───────────────────────────────────────────── */
export default function CMSCategoryPage() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, "");
  const staticCfg = STATIC_CONFIG[slug];

  const { data: cmsPage, isLoading } = trpc.cms.getPageBySlug.useQuery(
    { slug },
    { staleTime: 5 * 60 * 1000, retry: false, enabled: !!staticCfg }
  );

  // CMS page takes precedence; fall back to static config when unavailable
  const useCMS = !!(cmsPage && cmsPage.published && cmsPage.content);

  const title = useCMS ? cmsPage!.title : staticCfg?.h1 ?? "Holambra";
  const subtitle = useCMS ? (cmsPage!.subtitle ?? undefined) : staticCfg?.subtitle;
  const seoTitle = useCMS ? (cmsPage!.metaTitle ?? cmsPage!.title) : (staticCfg?.seoTitle ?? title);
  const seoDesc = useCMS ? (cmsPage!.metaDescription ?? "") : (staticCfg?.seoDescription ?? "");

  useEffect(() => {
    if (!staticCfg) return;
    const SITE = "ORANJE — Guia Cultural de Holambra";
    const pageUrl = `https://oranjeapp.com.br${location.pathname}`;
    document.title = seoTitle;
    setMeta("og:title", seoTitle);
    setMeta("og:description", seoDesc);
    setMeta("og:url", pageUrl);
    setMeta("og:type", "website");
    setMeta("og:site_name", SITE);
    setNameMeta("description", seoDesc);
    setNameMeta("twitter:card", "summary_large_image");
    setNameMeta("twitter:title", seoTitle);
    setNameMeta("twitter:description", seoDesc);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", pageUrl);
    return () => { document.title = SITE; };
  }, [location.pathname, seoTitle, seoDesc, staticCfg]);

  // Unknown slug → 404 (routes are always known slugs from App.tsx)
  if (!staticCfg) {
    return (
      <SiteLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "var(--ds-text-2xl)", fontWeight: "var(--ds-font-bold)", color: "var(--ds-color-text-primary)" }}>
              Página não encontrada
            </h1>
            <p style={{ color: "var(--ds-color-text-muted)" }}>A página que você procura não existe.</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const { FallbackContent, cta } = staticCfg;

  // Build content node
  const content = (
    <>
      {useCMS && cmsPage!.coverImageUrl && (
        <div
          style={{
            marginBottom: "var(--ds-space-8)",
            borderRadius: "var(--ds-radius-xl)",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          }}
        >
          <img
            src={cmsPage!.coverImageUrl}
            alt={cmsPage!.title}
            style={{ width: "100%", height: "320px", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      {useCMS ? (
        <>
          <style>{CMS_CONTENT_STYLES}</style>
          <div className="cms-editorial-content" dangerouslySetInnerHTML={{ __html: cmsPage!.content }} />
        </>
      ) : isLoading ? (
        <div style={{ opacity: 0.5 }}>
          <FallbackContent />
        </div>
      ) : (
        <FallbackContent />
      )}
    </>
  );

  return (
    <SiteContentPage
      title={title}
      subtitle={subtitle}
      content={content}
      cta={cta}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: staticCfg.h1, href: location.pathname },
      ]}
    />
  );
}
