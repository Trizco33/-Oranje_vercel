import { getDb } from "./db";
import { eq } from "drizzle-orm";
import {
  siteContent,
  sitePages,
  categories,
  type InsertSiteContent,
  type InsertCategory,
  type InsertSitePage,
} from "../drizzle/schema";

const ADMIN_USER_ID = 1;

// ─── Site Content padrão ──────────────────────────────────────────────────────
const DEFAULT_CONTENT: InsertSiteContent[] = [
  { key: "hero_title",      section: "hero",    updatedBy: ADMIN_USER_ID, value: "Seu guia definitivo de Holambra" },
  { key: "hero_subtitle",   section: "hero",    updatedBy: ADMIN_USER_ID, value: "Restaurantes, eventos, experiências e mais em um só lugar" },
  { key: "hero_buttonText", section: "hero",    updatedBy: ADMIN_USER_ID, value: "Explorar Agora" },
  { key: "hero_buttonUrl",  section: "hero",    updatedBy: ADMIN_USER_ID, value: "/app" },
  { key: "hero_imageUrl",   section: "hero",    updatedBy: ADMIN_USER_ID, value: "/pontos-turisticos.jpg" },

  { key: "services_title",       section: "services", updatedBy: ADMIN_USER_ID, value: "Nossos Serviços" },
  { key: "services_description", section: "services", updatedBy: ADMIN_USER_ID, value: "Tudo que você precisa para explorar Holambra" },
  { key: "services_list",        section: "services", updatedBy: ADMIN_USER_ID, value: JSON.stringify([
    { name: "Descubra Holambra",    description: "Explore os melhores lugares, restaurantes e atrações turísticas da cidade das flores." },
    { name: "Gastronomia Premium",  description: "Acesse os melhores restaurantes, bares e cafeterias com avaliações e reservas." },
    { name: "Eventos & Experiências", description: "Fique atualizado sobre eventos, shows e experiências exclusivas em Holambra." },
    { name: "Transporte Premium",   description: "Motoristas verificados e parceiros confiáveis para sua mobilidade." },
  ]) },

  { key: "about_title", section: "about", updatedBy: ADMIN_USER_ID, value: "Sobre Holambra" },
  { key: "about_text",  section: "about", updatedBy: ADMIN_USER_ID, value: "Holambra é conhecida como a cidade das flores, um destino turístico vibrante no interior de São Paulo. Com uma rica história de imigração holandesa, a cidade oferece atrações culturais, gastronômicas e naturais que encantam visitantes de todo o mundo." },

  { key: "contact_email",   section: "contact", updatedBy: ADMIN_USER_ID, value: "contato@oranje.com.br" },
  { key: "contact_phone",   section: "contact", updatedBy: ADMIN_USER_ID, value: "(19) 3802-1000" },
  { key: "contact_address", section: "contact", updatedBy: ADMIN_USER_ID, value: "Holambra, São Paulo – Brasil" },
];

// ─── Categorias ───────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES: InsertCategory[] = [
  { name: "Restaurantes",       slug: "restaurantes",     icon: "🍽️",  description: "Restaurantes, lanchonetes e culinária local", isActive: true },
  { name: "Bares & Cervejarias",slug: "bares",            icon: "🍺",  description: "Bares, cervejarias e pubs", isActive: true },
  { name: "Cafés & Confeitarias", slug: "cafes",          icon: "☕",  description: "Cafeterias, confeitarias e padarias", isActive: true },
  { name: "Docerias",           slug: "docerias",         icon: "🎂",  description: "Docerias, bombonerias e sorveterias", isActive: true },
  { name: "Pizzarias",          slug: "pizzarias",        icon: "🍕",  description: "Pizzarias e delivery de pizza", isActive: true },
  { name: "Hotéis & Pousadas",  slug: "hoteis",           icon: "🏨",  description: "Hotéis, pousadas e hospedagem", isActive: true },
  { name: "Parques & Atrações", slug: "parques",          icon: "🌳",  description: "Parques, jardins e atrações turísticas", isActive: true },
  { name: "Pontos Turísticos",  slug: "pontos-turisticos",icon: "🌸",  description: "Pontos de interesse e patrimônio histórico", isActive: true },
];

// ─── Páginas editoriais de categoria ─────────────────────────────────────────
const DEFAULT_PAGES: InsertSitePage[] = [
  {
    slug: "melhores-restaurantes-de-holambra",
    title: "Melhores Restaurantes em Holambra",
    subtitle: "Uma curadoria real dos lugares para comer bem na capital brasileira das flores",
    metaTitle: "Melhores Restaurantes em Holambra — Guia Oranje",
    metaDescription: "Descubra os melhores restaurantes de Holambra com curadoria do Oranje. Do Deck do Lago ao De Klok, veja onde comer bem com avaliações reais.",
    published: true,
    publishedAt: new Date(),
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    content: `<p>Holambra surpreende quem chega esperando apenas flores. A cena gastronômica da cidade cresceu junto com o turismo e hoje oferece experiências de verdade — desde almoços à beira do lago até cardápios que cruzam culturas brasileiras, holandesas e italianas sem perder a identidade local.</p>
<p>Aqui você não vai encontrar genéricas "opções para todos os gostos". O que existe em Holambra são lugares com história, ingredientes frescos e cozinheiros que conhecem seus clientes pelo nome.</p>
<h2>Onde comer bem em Holambra</h2>
<p>Para um almoço tranquilo com vista para o lago, o <a href="/app/lugar/6">Deck do Lago</a> é referência. As mesas à beira d'água e o cardápio descomplicado fazem dele um dos favoritos de quem visita Holambra pela primeira vez — e de quem já volta pela décima.</p>
<p>Quem prefere uma experiência mais clássica e com ambiente requintado vai bem no <a href="/app/lugar/1">Restaurante De Klok</a>, um dos mais tradicionais da cidade, que carrega no nome e na decoração a herança holandesa que define o espírito de Holambra.</p>
<p>O <a href="/app/lugar/24">Casa Bela Restaurante</a> é a pedida certa para refeições em família. Ambiente acolhedor, cardápio farto e preço justo — o tipo de lugar que você recomenda sem hesitar.</p>
<h2>Para os que gostam de algo diferente</h2>
<p>O <a href="/app/lugar/36">De Immigrant Garden</a> traz uma proposta mais autoral, com pratos que contam histórias de imigração e pertencimento. Ótimo para quem quer ir além do convencional.</p>
<p>Se a fome for por hambúrguer artesanal de qualidade, o <a href="/app/lugar/42">Cowburguer</a> entrega exatamente isso — sem firulas, com muito sabor.</p>
<p>E o <a href="/app/lugar/35">Garden Restaurante</a> fecha essa lista com um ambiente verde e agradável, ideal para quem quer comer bem num ambiente que combina com a natureza da cidade.</p>
<h2>Dicas de quem conhece</h2>
<p>Holambra tem movimento intenso nos fins de semana e durante a Expoflora. Se for nessas datas, <strong>faça reserva com antecedência</strong> — os restaurantes mais procurados lotam cedo. Na semana, você consegue mesa com mais tranquilidade e muitas vezes um atendimento ainda mais cuidadoso.</p>
<p>O horário de almoço começa cedo — por volta de 11h30 muitos lugares já estão servindo. Aproveite para chegar antes do pico e pedir a recomendação do dia ao garçom. Em Holambra, isso costuma render as melhores surpresas.</p>
<a href="/app/lugar/1" class="place-card"><div class="place-card-name">Restaurante De Klok</div><div class="place-card-desc">Cozinha tradicional, ambiente clássico e herança holandesa</div></a>
<a href="/app/lugar/6" class="place-card"><div class="place-card-name">Deck do Lago</div><div class="place-card-desc">Vista para o lago, cardápio descomplicado, excelente para almoço</div></a>
<a href="/app/lugar/24" class="place-card"><div class="place-card-name">Casa Bela Restaurante</div><div class="place-card-desc">Ambiente familiar, farto e acolhedor</div></a>
<a href="/app/lugar/36" class="place-card"><div class="place-card-name">De Immigrant Garden</div><div class="place-card-desc">Proposta autoral e ingredientes locais</div></a>
<a href="/app/lugar/35" class="place-card"><div class="place-card-name">Garden Restaurante</div><div class="place-card-desc">Ambiente arborizado, ótima pedida para almoço tranquilo</div></a>
<a href="/app/lugar/42" class="place-card"><div class="place-card-name">Cowburguer</div><div class="place-card-desc">Hambúrguer artesanal de qualidade em Holambra</div></a>`,
  },
  {
    slug: "melhores-cafes-de-holambra",
    title: "Melhores Cafés em Holambra",
    subtitle: "De bistrôs aconchegantes a confeitarias autorais — os cafés que valem a parada",
    metaTitle: "Melhores Cafés em Holambra — Guia Oranje",
    metaDescription: "Os melhores cafés de Holambra em um só lugar. Café Moinho, Lotus Café, Kéndi Confeitaria e mais — descubra onde tomar um bom café na cidade das flores.",
    published: true,
    publishedAt: new Date(),
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    content: `<p>Holambra e o café têm uma relação especial. Não é só por causa do clima ameno ou das ruas floridas — é porque os cafés da cidade entenderam que o momento do café importa tanto quanto a bebida em si. Aqui, sentar para tomar um café é uma pausa de verdade, não uma corrida.</p>
<p>Se você veio a Holambra e não parou em nenhum café, você perdeu uma parte importante da experiência.</p>
<h2>Os cafés que valem a visita</h2>
<p>O <a href="/app/lugar/2">Café Moinho</a> é parada obrigatória. O espaço remete à arquitetura holandesa, o café é bem feito e os acompanhamentos saem frescos da cozinha. É o tipo de lugar que faz você querer ficar mais uma hora do que havia planejado.</p>
<p>Para uma experiência mais contemporânea, o <a href="/app/lugar/27">Lotus Café</a> traz um ambiente que equilibra tranquilidade e estilo. Ótimo para trabalhar remotamente, encontrar alguém ou simplesmente passar a tarde lendo.</p>
<p>Já a <a href="/app/lugar/29">Kéndi Confeitaria</a> é a escolha perfeita para quem quer unir café com confeitaria de qualidade. As sobremesas fazem jus ao cuidado com que o café é preparado — e o visual do lugar é bonito o suficiente para merecer umas fotos.</p>
<h2>O que pedir</h2>
<p>Em Holambra, os cafés costumam ter opções que vão além do básico. Pergunte sempre sobre a bebida do dia ou a especialidade da casa — você vai descobrir preparos que não encontra em grandes redes. Se for no inverno, aposte nos drinks quentes com especiarias. Se for no calor da Expoflora, o café gelado é o melhor amigo.</p>
<p>Quase todos os cafés da cidade também servem algum tipo de comida — de torradas e bolos caseiros a sanduíches leves. Não hesite em combinar o café da manhã com um passeio pelo jardim mais próximo.</p>
<h2>Quando ir</h2>
<p>O horário da manhã, entre 8h e 10h, é o melhor para quem quer evitar filas e aproveitar o frescor do dia. Nos fins de semana de Expoflora, os cafés ficam cheios já antes das 9h — chegue cedo ou escolha o período da tarde, quando o movimento cai um pouco.</p>
<a href="/app/lugar/2" class="place-card"><div class="place-card-name">Café Moinho</div><div class="place-card-desc">Arquitetura holandesa, café bem feito e acompanhamentos frescos</div></a>
<a href="/app/lugar/27" class="place-card"><div class="place-card-name">Lotus Café</div><div class="place-card-desc">Ambiente contemporâneo, ideal para trabalhar ou relaxar</div></a>
<a href="/app/lugar/29" class="place-card"><div class="place-card-name">Kéndi Confeitaria</div><div class="place-card-desc">Confeitaria de qualidade unida a um café cuidadoso</div></a>`,
  },
  {
    slug: "bares-e-drinks-em-holambra",
    title: "Bares & Drinks em Holambra",
    subtitle: "Botequins com personalidade, cerveja artesanal e lounges para noites memoráveis",
    metaTitle: "Bares e Drinks em Holambra — Guia Oranje",
    metaDescription: "Guia completo dos melhores bares de Holambra: Boteco do Holandês, Cervejaria Holambier, Tulipa's Lounge e mais. Vida noturna com identidade local.",
    published: true,
    publishedAt: new Date(),
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    content: `<p>Holambra não é conhecida pela vida noturna agitada — e isso é exatamente o que torna seus bares interessantes. Sem a pressão de grandes cidades, os bares aqui têm personalidade própria: são lugares onde as pessoas se conhecem, a conversa flui e o tempo passa sem que ninguém perceba.</p>
<p>De botequins descontraídos a lounges mais sofisticados, a cidade tem opções para noites tranquilas ou programas em grupo com muito mais sabor do que o esperado.</p>
<h2>Bares com identidade</h2>
<p>O <a href="/app/lugar/4">Boteco do Holandês</a> é o jeito mais honesto de começar essa lista. Sem pretensão, com chopp gelado, petiscos caprichados e aquela atmosfera de boteco de bairro que você quer encontrar em cada cidade que visita — e raramente acha.</p>
<p>Para quem prefere algo mais tranquilo e com drinks bem executados, o <a href="/app/lugar/13">Quintal Yah</a> entrega um ambiente aconchegante com cardápio de drinks criativos que combinam com o ritmo leve de Holambra.</p>
<p>O <a href="/app/lugar/12">Deck 237</a> traz um espaço ao ar livre que funciona especialmente bem nas noites mais frescas — boa música, boa companhia e uma vista que vale o deslocamento.</p>
<h2>Cerveja artesanal em Holambra</h2>
<p>A cultura cervejeira tem raízes fortes em Holambra — afinal, a herança holandesa e belga está no DNA da cidade. O <a href="/app/lugar/26">Restaurante e Cervejaria Holambier</a> é a expressão mais completa disso: produção própria, rótulos exclusivos e um espaço que convida a ficar.</p>
<p>O <a href="/app/lugar/11">Seo Carneiro Bar</a> também merece atenção — um dos mais queridos pelos moradores locais, com ambiente descontraído e o tipo de petisco que combina com qualquer cerveja.</p>
<h2>Para noites mais longas</h2>
<p>O <a href="/app/lugar/43">Quintal dos Avós Gastrobar</a> une gastronomia e drinks num espaço com cara de casa de família — rústico, caloroso e com cardápio que vai muito além do petisco comum.</p>
<p>E se a noite pedir um clima mais elegante, a <a href="/app/lugar/44">Tulipa's Lounge</a> é a resposta certa: ambiente sofisticado, drinks autorais e uma seleção de música que transforma qualquer terça em um programa especial.</p>
<a href="/app/lugar/4" class="place-card"><div class="place-card-name">Boteco do Holandês</div><div class="place-card-desc">Botequim autêntico, chopp gelado e petiscos caprichados</div></a>
<a href="/app/lugar/11" class="place-card"><div class="place-card-name">Seo Carneiro Bar</div><div class="place-card-desc">Querido pelos locais, ambiente leve e descontraído</div></a>
<a href="/app/lugar/12" class="place-card"><div class="place-card-name">Deck 237</div><div class="place-card-desc">Espaço ao ar livre, boa música e view agradável</div></a>
<a href="/app/lugar/13" class="place-card"><div class="place-card-name">Quintal Yah</div><div class="place-card-desc">Drinks criativos, ambiente tranquilo</div></a>
<a href="/app/lugar/26" class="place-card"><div class="place-card-name">Cervejaria Holambier</div><div class="place-card-desc">Produção própria, rótulos exclusivos e espaço completo</div></a>
<a href="/app/lugar/43" class="place-card"><div class="place-card-name">Quintal dos Avós Gastrobar</div><div class="place-card-desc">Gastronomia e drinks num ambiente rústico e acolhedor</div></a>
<a href="/app/lugar/44" class="place-card"><div class="place-card-name">Tulipa's Lounge</div><div class="place-card-desc">Ambiente sofisticado, drinks autorais e boa música</div></a>`,
  },
  {
    slug: "onde-tirar-fotos-em-holambra",
    title: "Pontos Turísticos de Holambra",
    subtitle: "Parques, flores e experiências que só existem aqui — os lugares que definem a cidade",
    metaTitle: "Pontos Turísticos de Holambra — Guia Oranje",
    metaDescription: "Os principais pontos turísticos de Holambra: Expoflora Park, Parque Van Gogh, Cidade das Crianças e mais. Saiba o que visitar, quando ir e como se planejar.",
    published: true,
    publishedAt: new Date(),
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    content: `<p>Holambra não é grande — e isso é uma vantagem. Em poucos quilômetros, você encontra parques floridos, lagos, espaços culturais e pontos que concentram tudo o que torna essa cidade única no Brasil. É o tipo de lugar que funciona tanto para uma tarde quanto para um fim de semana inteiro.</p>
<p>O segredo para aproveitar bem Holambra é não tentar ver tudo de uma vez. Escolha bem, caminhe sem pressa e deixe a cidade te surpreender.</p>
<h2>O grande evento que virou ponto fixo</h2>
<p>O <a href="/app/lugar/5">Expoflora Park</a> é o coração turístico de Holambra. Durante a Expoflora — realizada todo setembro — o parque recebe centenas de milhares de visitantes e se transforma numa das maiores exposições de flores da América Latina. Fora do período do festival, o espaço também mantém atrações e é ponto de referência para quem chega à cidade.</p>
<h2>Parques para caminhar, respirar e fotografar</h2>
<p>O <a href="/app/lugar/19">Parque Van Gogh</a> é um dos mais fotografados de Holambra — a combinação de jardins bem cuidados com referências ao pintor holandês cria um cenário incomum que funciona em qualquer estação do ano.</p>
<p>O <a href="/app/lugar/20">Parque Bloemen</a> e o <a href="/app/lugar/32">Bloemen Park</a> expandem essa experiência com mais espaço verde, flores e estrutura para passeios tranquilos — ótimos para famílias ou casais que querem um programa sem pressa.</p>
<p>O <a href="/app/lugar/34">Macena Flores</a> é uma parada especial para quem quer ver flores de perto, em canteiros cuidados e com opção de compra. A beleza do lugar está na simplicidade e na abundância de cor.</p>
<h2>Para ir com crianças</h2>
<p>A <a href="/app/lugar/21">Cidade das Crianças</a> é a atração mais indicada para famílias com os pequenos. O espaço tem infraestrutura pensada para crianças, com brinquedos, segurança e muito espaço para correr — enquanto os adultos respiram e tomam aquele café merecido.</p>
<p>O <a href="/app/lugar/22">Parque Vitória</a> e a <a href="/app/lugar/23">Nossa Prainha</a> completam o leque de opções ao ar livre, com área verde, água e espaço para piqueniques e momentos em família.</p>
<h2>Como se planejar</h2>
<p>A maioria dos parques de Holambra tem horários de visitação e, em alguns casos, cobrança de entrada. Confira os detalhes no app antes de sair — você economiza tempo e evita surpresas na bilheteria.</p>
<p>O melhor horário para fotos é logo pela manhã, antes do sol forte, ou no final da tarde, quando a luz fica mais dourada e os parques ficam mais tranquilos. Use roupas confortáveis e leve água — mesmo em dias frescos, o sol de Holambra pede respeito.</p>
<a href="/app/lugar/5" class="place-card"><div class="place-card-name">Expoflora Park</div><div class="place-card-desc">O coração turístico de Holambra e sede da maior expo de flores do Brasil</div></a>
<a href="/app/lugar/19" class="place-card"><div class="place-card-name">Parque Van Gogh</div><div class="place-card-desc">Jardins temáticos e cenário único inspirado no pintor holandês</div></a>
<a href="/app/lugar/20" class="place-card"><div class="place-card-name">Parque Bloemen</div><div class="place-card-desc">Espaço verde amplo, ideal para passeios tranquilos e fotos</div></a>
<a href="/app/lugar/21" class="place-card"><div class="place-card-name">Cidade das Crianças</div><div class="place-card-desc">Atração ideal para famílias com crianças</div></a>
<a href="/app/lugar/22" class="place-card"><div class="place-card-name">Parque Vitória</div><div class="place-card-desc">Área verde com lago, ótimo para piquenique</div></a>
<a href="/app/lugar/23" class="place-card"><div class="place-card-name">Nossa Prainha</div><div class="place-card-desc">Espaço de lazer à beira d'água, perfeito para relaxar</div></a>
<a href="/app/lugar/32" class="place-card"><div class="place-card-name">Bloemen Park</div><div class="place-card-desc">Flores, jardins e tranquilidade no coração de Holambra</div></a>
<a href="/app/lugar/34" class="place-card"><div class="place-card-name">Macena Flores</div><div class="place-card-desc">Canteiros coloridos, beleza simples e abundante</div></a>`,
  },
  {
    slug: "eventos-em-holambra",
    title: "Eventos em Holambra",
    subtitle: "Expoflora, Mês do Rei, Hortitec e o calendário que transforma a cidade ao longo do ano",
    metaTitle: "Eventos em Holambra — Guia Oranje",
    metaDescription: "Conheça os principais eventos de Holambra: Expoflora em setembro, Mês do Rei em fevereiro, Hortitec em junho e muito mais. Planeje sua visita com o Oranje.",
    published: true,
    publishedAt: new Date(),
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    content: `<p>Holambra é uma cidade que sabe fazer festa. Não no sentido barulhento do termo — mas no sentido de que os eventos aqui têm raiz cultural, história e uma comunidade local que abraça cada um deles de verdade. Ao longo do ano, a cidade se transforma em diferentes versões de si mesma dependendo do que está acontecendo.</p>
<p>Se você ainda não planejou uma visita em torno de algum evento, este é o motivo para fazer isso.</p>
<h2>Expoflora — o maior de todos</h2>
<p>A Expoflora acontece todo mês de setembro e é, sem exagero, um dos eventos mais impressionantes do interior paulista. Mais de 600 mil visitantes por edição. Flores que cobrem o chão, as paredes e o ar. Artesanato, gastronomia, música e cultura holandesa em tudo.</p>
<p>Se você nunca foi, coloque na agenda. Se já foi, sabe que é difícil ir só uma vez. O Expoflora Park fica tomado de vida e cor de um jeito que nenhuma foto consegue traduzir completamente.</p>
<h2>Mês do Rei — cultura holandesa em fevereiro</h2>
<p>O Mês do Rei é a celebração da identidade holandesa de Holambra. Com trajes típicos, música folclórica, desfiles e uma série de atividades culturais, o evento lembra as raízes dos imigrantes que fundaram a cidade. É menor que a Expoflora, mas tem um charme particular — mais íntimo, mais local, mais verdadeiro.</p>
<h2>Hortitec — para quem trabalha com o campo</h2>
<p>A Hortitec é uma feira técnica de horticultura que acontece em junho e reúne produtores, pesquisadores e profissionais do setor de flores e plantas de todo o Brasil. Para o visitante comum, é uma oportunidade única de ver de perto a cadeia produtiva que fez Holambra famosa — e entender por que a cidade funciona como funciona.</p>
<h2>Feiras, festas e o calendário que nunca para</h2>
<p>Além dos grandes eventos, Holambra mantém um calendário regular de feiras de flores, festivais gastronômicos e festas temáticas ao longo do ano. O centro da cidade costuma ter alguma programação especial em feriados e fins de semana prolongados.</p>
<p>O app Oranje tem o calendário completo de eventos atualizado — é a forma mais prática de saber o que está acontecendo antes de planejar sua visita ou, se você já estiver na cidade, descobrir o que não pode perder naquele fim de semana.</p>
<h2>Como se planejar</h2>
<p>Durante a Expoflora e o Mês do Rei, Holambra lota. Hotéis chegam a ficar sem vagas semanas antes — reserve com antecedência. Os restaurantes também ficam cheios, então planeje os horários com mais flexibilidade do que o habitual.</p>
<p>Fora das grandes datas, a cidade recebe bem e sem filas. É uma experiência completamente diferente — mais tranquila, mais autêntica, mais parecida com o dia a dia dos moradores.</p>`,
  },
];

// ─── Função principal de seed ─────────────────────────────────────────────────
export async function seedDatabase() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("⚠️  Banco de dados não disponível, pulando seed");
      return;
    }

    console.log("🌱 Verificando conteúdo padrão...");
    for (const content of DEFAULT_CONTENT) {
      const existing = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.key, content.key))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(siteContent).values(content);
        console.log(`  ✅ ${content.key}`);
      }
    }

    console.log("🏷️  Verificando categorias...");
    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, cat.slug))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(categories).values(cat);
        console.log(`  ✅ Categoria: ${cat.name}`);
      }
    }

    console.log("📄 Verificando páginas editoriais...");
    for (const page of DEFAULT_PAGES) {
      const existing = await db
        .select()
        .from(sitePages)
        .where(eq(sitePages.slug, page.slug))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(sitePages).values(page);
        console.log(`  ✅ Página: /${page.slug}`);
      }
    }

    console.log("🎉 Seed concluído!");
  } catch (error) {
    console.error("⚠️  Erro ao fazer seed (não crítico):", error);
  }
}
