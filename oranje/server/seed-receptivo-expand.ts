/**
 * seed-receptivo-expand.ts
 *
 * Expande o Receptivo Oranje com 6 novos passeios + atualiza coverImage de todos os 7 tours.
 * Idempotente — pode ser executado múltiplas vezes sem duplicar dados.
 *
 * Uso:
 *   DATABASE_URL=mysql://... npx tsx server/seed-receptivo-expand.ts
 */

import { getDb } from "./db";
import { sql, eq, and } from "drizzle-orm";
import { places } from "../drizzle/schema";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function findPlaceId(db: any, name: string, city = "Holambra"): Promise<number | null> {
  const rows = await db
    .select({ id: places.id })
    .from(places)
    .where(and(eq(places.name, name), eq(places.city, city)))
    .limit(1);
  return rows[0]?.id ?? null;
}

async function upsertTour(db: any, tour: {
  slug: string; name: string; tagline: string; description: string;
  theme: string; duration: string; coverImage: string; status: string;
  recommendedWithDriver?: boolean; walkOnly?: boolean; requiresTransport?: boolean;
}): Promise<number> {
  const existing = await db.execute(sql`SELECT id FROM guided_tours WHERE slug = ${tour.slug} LIMIT 1`);
  const rows = (existing as any)[0] as any[];

  const rwd = tour.recommendedWithDriver ? 1 : 0;
  const wo  = tour.walkOnly             ? 1 : 0;
  const rt  = tour.requiresTransport    ? 1 : 0;

  if (rows.length > 0) {
    const id = rows[0].id;
    await db.execute(sql`
      UPDATE guided_tours SET
        name                  = ${tour.name},
        tagline               = ${tour.tagline},
        description           = ${tour.description},
        theme                 = ${tour.theme},
        duration              = ${tour.duration},
        coverImage            = ${tour.coverImage},
        status                = ${tour.status},
        recommendedWithDriver = ${rwd},
        walkOnly              = ${wo},
        requiresTransport     = ${rt},
        updatedAt             = NOW()
      WHERE id = ${id}
    `);
    console.log(`  ✅ Tour atualizado: "${tour.name}" (id ${id})`);
    return id;
  } else {
    const result = await db.execute(sql`
      INSERT INTO guided_tours
        (slug, name, tagline, description, theme, duration, coverImage, status,
         recommendedWithDriver, walkOnly, requiresTransport)
      VALUES
        (${tour.slug}, ${tour.name}, ${tour.tagline}, ${tour.description},
         ${tour.theme}, ${tour.duration}, ${tour.coverImage}, ${tour.status},
         ${rwd}, ${wo}, ${rt})
    `);
    const id = (result as any)[0].insertId;
    console.log(`  ✅ Tour criado: "${tour.name}" (id ${id})`);
    return id;
  }
}

async function upsertStop(db: any, tourId: number, placeId: number, stop: {
  order: number; narrative: string; tip: string | null; bestMoment: string | null;
}) {
  const existing = await db.execute(
    sql`SELECT id FROM guided_tour_stops WHERE tourId = ${tourId} AND stopOrder = ${stop.order} LIMIT 1`
  );
  const rows = (existing as any)[0] as any[];

  if (rows.length > 0) {
    await db.execute(sql`
      UPDATE guided_tour_stops SET
        placeId    = ${placeId},
        narrative  = ${stop.narrative},
        tip        = ${stop.tip},
        bestMoment = ${stop.bestMoment},
        updatedAt  = NOW()
      WHERE id = ${rows[0].id}
    `);
  } else {
    await db.execute(sql`
      INSERT INTO guided_tour_stops (tourId, placeId, stopOrder, narrative, tip, bestMoment)
      VALUES (${tourId}, ${placeId}, ${stop.order}, ${stop.narrative}, ${stop.tip}, ${stop.bestMoment})
    `);
  }
}

async function setExtensionPlaceIds(db: any, tourId: number, ids: number[]) {
  await db.execute(sql`
    UPDATE guided_tours SET extensionPlaceIds = ${JSON.stringify(ids)}, updatedAt = NOW()
    WHERE id = ${tourId}
  `);
}

// ─── Dados dos tours ──────────────────────────────────────────────────────────

const TOURS: Array<{
  slug: string; name: string; tagline: string; description: string;
  theme: string; duration: string; coverImage: string;
  recommendedWithDriver?: boolean; walkOnly?: boolean; requiresTransport?: boolean;
  stops: Array<{ placeName: string; order: number; narrative: string; tip: string | null; bestMoment: string | null }>;
  extensionPlaceNames?: string[];
}> = [

  // ── 1. Holambra Romântica (atualiza coverImage) ────────────────────────────
  {
    slug: "holambra-romantica",
    recommendedWithDriver: true,
    name: "Holambra Romântica",
    tagline: "O percurso mais bonito do centro histórico",
    description: "Existe um jeito de percorrer Holambra que transforma o passeio em memória. Começa com cor e termina com atmosfera — e no meio do caminho, o lago, os cadeados e o moinho que deu nome à cidade. Este passeio foi desenhado para casais, mas qualquer pessoa que queira entender o coração de Holambra vai encontrar o que procura.",
    theme: "Romântico",
    duration: "2 a 3 horas",
    coverImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80",
    stops: [
      {
        placeName: "Rua dos Guarda-Chuvas", order: 1,
        narrative: "O passeio começa aqui — e começa com cor. A Rua dos Guarda-Chuvas é aquela parada que você não planeja, mas acaba fazendo questão de registrar. Os guarda-chuvas coloridos suspensos criam um corredor festivo no coração do centro, especialmente bonito pela manhã, quando a luz atravessa o tecido e projeta tons suaves na calçada. É o ponto de partida natural do eixo de passeio a pé mais bonito de Holambra — daqui, o lago já chama.",
        tip: "Chegue antes das 10h para a melhor luz e menos movimento.",
        bestMoment: "Manhã cedo",
      },
      {
        placeName: "Deck do Amor", order: 2,
        narrative: "Depois da rua, o lago. O Deck do Amor é onde Holambra guarda suas histórias mais silenciosas. Os cadeados presos na cerca não são decoração — são gestos reais de quem passou por aqui e quis deixar alguma coisa. No entardecer, a luz dourada reflete na água, o movimento diminui e o que sobra é exatamente o que um passeio romântico precisa ter: quietude e atmosfera.",
        tip: "Há uma lojinha próxima onde você pode comprar um cadeado para registrar sua passagem.",
        bestMoment: "Final da tarde",
      },
      {
        placeName: "Praça Vitória Régia", order: 3,
        narrative: "Uma das paradas mais contemplativas de Holambra. O espelho d'água com vitórias-régias gigantes muda de tom ao longo do dia — ao amanhecer, com névoa leve e luz rasa, é quase irreal. A praça é gratuita, sempre aberta e fica logo ao lado do Deck do Amor, o que torna a transição entre as duas paradas muito natural. Daqui, o Moinho já se avista.",
        tip: null,
        bestMoment: "Amanhecer ou final da tarde",
      },
      {
        placeName: "Moinho Povos Unidos", order: 4,
        narrative: "Não tem como terminar de outra forma. O Moinho é o símbolo de Holambra — construído pelos imigrantes holandeses, ele fecha o percurso com uma imagem que fica. A qualquer hora do dia oferece uma boa fotografia, mas é no final da tarde que ele ganha um dourado que justifica qualquer visita. Chegando aqui, o passeio se completa — e Holambra fica registrada do jeito certo.",
        tip: "Para a melhor foto, posicione-se do lado oposto à entrada — a perspectiva abre o campo visual.",
        bestMoment: "Final da tarde",
      },
      {
        placeName: "Zoet en Zout", order: 5,
        narrative: "O passeio não precisa terminar no Moinho. A poucos metros dali, o Zoet en Zout espera com café com leite e stroopwafel feito na hora — a versão local do ponto final perfeito. Zoet en Zout significa 'doce e salgado' em holandês, e é exatamente o que você encontra: sabores artesanais com receita de família, num café que ficou de verdade para os moradores. É aqui que o passeio descansa e vira conversa.",
        tip: "No brunch de fim de semana costuma ter fila. Se for num sábado ou domingo, chegue antes das 9h30.",
        bestMoment: "Manhã ou tarde",
      },
    ],
    extensionPlaceNames: ["Lago do Holandês", "Restaurante Villa Girassol"],
  },

  // ── 2. Holambra de Manhã ───────────────────────────────────────────────────
  {
    slug: "holambra-de-manha",
    recommendedWithDriver: true,
    name: "Holambra de Manhã",
    tagline: "Café, história e a cidade acordando",
    description: "A melhor versão de Holambra tem cheiro de café com leite e stroopwafel recém-saído do forno. Este passeio começa ainda cedo — quando as padarias abrem, as ruas estão vazias e a luz de manhã cedo faz de qualquer esquina uma boa foto. Um percurso curto pelo Boulevard Holandês e arredores, pensado para quem quer começar bem o dia antes que a cidade encha.",
    theme: "Manhã",
    duration: "1,5 a 2 horas",
    coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80",
    stops: [
      {
        placeName: "Martin Holandesa Confeitaria e Restaurante", order: 1,
        narrative: "O dia começa aqui, no Boulevard Holandês, com uma das confeitarias mais antigas de Holambra. A Martin Holandesa é aquele lugar que não precisa se anunciar — o cheiro de pão já avisa que você chegou. Os stroopwafels são feitos com receita de família, os pães saem frescos pela manhã e o café que acompanha não tenta ser especialidade: é simplesmente bom. Um ponto de partida perfeito para quem quer começar o dia com identidade de Holambra.",
        tip: "Chegar antes das 9h garante os melhores pães e menos espera.",
        bestMoment: "Manhã cedo",
      },
      {
        placeName: "De Immigrant Gastro Café", order: 2,
        narrative: "A poucos metros da Martin, o De Immigrant abre às 8h com uma proposta diferente: café da manhã mais elaborado, ambiente com história da imigração holandesa nas paredes e um cardápio que mistura o regional com o europeu. É onde você entende que Holambra não é só flores — é também comida com identidade, contada nas paredes e nos pratos. A segunda parada natural do eixo da Rua Dória Vasconcelos.",
        tip: null,
        bestMoment: "Manhã",
      },
      {
        placeName: "Rua dos Guarda-Chuvas", order: 3,
        narrative: "Depois do café, a rua. A luz de manhã cedo atravessa os guarda-chuvas coloridos de um jeito que não se repete em nenhum outro horário — é mais suave, mais fotográfica, e o movimento ainda é mínimo. Vale o desvio de dois quarteirões só para registrar isso. É um dos cenários mais instagramáveis de Holambra, mas de manhã cedo ele tem algo de verdade que o meia-dia de fim de semana não tem.",
        tip: "Antes das 9h30 a rua é quase deserta — foto limpa garantida.",
        bestMoment: "Manhã cedo",
      },
      {
        placeName: "Praça Vitória Régia", order: 4,
        narrative: "A última parada antes de o dia começar de verdade. A Praça Vitória Régia tem aquela quietude de jardim público que a manhã de segunda-feira reserva para quem chega cedo. As vitórias-régias estão abertas, o espelho d'água reflete a luz baixa e o silêncio é completo. É o tipo de lugar que transforma um passeio em pausa — e uma pausa bem colocada no início do dia faz diferença.",
        tip: "Gratuita, sempre aberta — boa opção mesmo com crianças.",
        bestMoment: "Manhã",
      },
    ],
    extensionPlaceNames: ["Zoet en Zout"],
  },

  // ── 3. Holambra das Flores ─────────────────────────────────────────────────
  {
    slug: "holambra-das-flores",
    recommendedWithDriver: true,
    name: "Holambra das Flores",
    tagline: "A rota da natureza, das cores e da identidade floral",
    description: "Holambra é a capital das flores do Brasil — mas poucos visitantes veem flores de verdade. Este passeio muda isso. Começa num campo de produção real, onde flores nascem do campo não para enfeitar, mas para abastecer o país inteiro. Passa pelo parque à beira do lago, termina com sorvete artesanal num bairro tranquilo. É o passeio que a cidade merece mais do que qualquer outro.",
    theme: "Flores e Natureza",
    duration: "3 a 4 horas",
    coverImage: "https://i.ytimg.com/vi/JB52rZeRgR0/maxresdefault.jpg",
    stops: [
      {
        placeName: "Macena Flores", order: 1,
        narrative: "Não existe introdução mais honesta ao que Holambra realmente é do que começar aqui. A Macena Flores é um sítio de produção real, aberto ao público, onde você compra flores diretamente do campo — preço de produtor, atacado e varejo. As cores dos canteiros mudam com a estação, mas nunca decepcionam. Aberta todos os dias das 9h às 17h — raro num campo de flores real. É aqui que você entende de onde vêm as flores que chegam às floriculturas do Brasil inteiro.",
        tip: "Chegue cedo para a melhor luz e mais variedade de flores abertas.",
        bestMoment: "Manhã",
      },
      {
        placeName: "Parque Van Gogh", order: 2,
        narrative: "Seguindo para o eixo sul da cidade, às margens do Lago do Holandês, o Parque Van Gogh é uma das áreas públicas mais bonitas e menos exploradas de Holambra. A tirolesa, os pedalinhos e a sombra generosa fazem dele uma parada excelente para famílias — mas é a vista para o lago que ficou. Gratuito, sempre com boa brisa e fotografia fácil em qualquer horário.",
        tip: "Funciona de segunda a sexta (exceto terça e quarta) e nos fins de semana.",
        bestMoment: "Tarde",
      },
      {
        placeName: "Dolce Flor Holambra", order: 3,
        narrative: "No Bairro Morada das Flores, a uns dez minutos do centro, a Dolce Flor faz jus ao nome. Sorvetes artesanais com identidade visual forte, doces bem elaborados e um ambiente que conversa com o imaginário floral da cidade — sem forçar a barra. É o tipo de pausa que funciona bem no roteiro de flores: depois de tanto verde e cor, um sorvete é a conclusão lógica. Abre a partir do meio-dia.",
        tip: "Boa parada para crianças — sorvetes criativos com apelo visual forte.",
        bestMoment: "Tarde",
      },
    ],
    extensionPlaceNames: ["Expoflora"],
  },

  // ── 4. Holambra da Imigração ───────────────────────────────────────────────
  {
    slug: "holambra-da-imigracao",
    recommendedWithDriver: true,
    name: "Holambra da Imigração",
    tagline: "Onde a história holandesa virou cidade brasileira",
    description: "Em 1948, 92 famílias holandesas chegaram a uma fazenda no interior de São Paulo com a intenção de recomeçar. O que construíram ao longo de décadas é Holambra — uma cidade com identidade cultural rara no Brasil. Este passeio percorre os lugares que guardam essa história: a confeitaria fundada por imigrantes, o restaurante que mantém a culinária da colônia e o moinho que se tornou símbolo.",
    theme: "Cultural e Histórico",
    duration: "3 horas",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/1/18/Montagem_Holambra.jpg",
    stops: [
      {
        placeName: "Martin Holandesa Confeitaria e Restaurante", order: 1,
        narrative: "A história de Holambra tem sabor de stroopwafel. A Martin Holandesa é uma das confeitarias mais antigas da cidade — fundada pelos imigrantes e mantida pela família até hoje. As receitas são originais: sem adaptação para o gosto brasileiro, sem moleza no preparo. É o ponto de partida mais honesto para entender o que os holandeses trouxeram na mala quando chegaram em 1948. O ambiente, com sua decoração de época, conta parte dessa história.",
        tip: "Peça o stroopwafel na hora — é diferente do embalado.",
        bestMoment: "Manhã",
      },
      {
        placeName: "De Immigrant Gastro Café", order: 2,
        narrative: "O nome diz tudo. O De Immigrant é o lugar de Holambra que mais abertamente conta a história da imigração — nas paredes, no cardápio, no nome das preparações. O café da manhã holandês adaptado ao paladar tropical é uma das experiências mais genuínas que a cidade oferece. A mesma Rua Dória Vasconcelos que os imigrantes andaram é onde você está agora.",
        tip: "Aberto desde as 8h — bom ponto de partida para o dia.",
        bestMoment: "Manhã",
      },
      {
        placeName: "De Immigrant Restaurante Garden", order: 3,
        narrative: "No mesmo endereço do Gastro Café, o Restaurante Garden é a versão mais elaborada da proposta De Immigrant — culinária autoral com raízes na colônia holandesa, servida num espaço aberto com ambiente que mistura jardim e história. O almoço aqui é uma das experiências mais completas que Holambra oferece: boa cozinha, identidade cultural clara e ambiente que convida à demora.",
        tip: "Reserve para o almoço de fim de semana — costuma lotar.",
        bestMoment: "Almoço",
      },
      {
        placeName: "Moinho Povos Unidos", order: 4,
        narrative: "O moinho não foi construído para ser cartão-postal — foi construído para ser símbolo. Os imigrantes holandeses que chegaram em 1948 trouxeram a tecnologia dos moinhos de vento e a memória do que haviam deixado para trás. Este aqui fica no eixo central do passeio a pé de Holambra e fecha o percurso histórico do jeito que deve ser fechado: com uma imagem que fica. No final da tarde, o dourado na estrutura é digno de qualquer viagem.",
        tip: "Para a melhor fotografia, posicione-se do lado oposto à entrada principal.",
        bestMoment: "Final da tarde",
      },
    ],
    extensionPlaceNames: ["Expoflora", "Zoet en Zout"],
  },

  // ── 5. Holambra Gourmet ────────────────────────────────────────────────────
  {
    slug: "holambra-gourmet",
    recommendedWithDriver: true,
    name: "Holambra Gourmet",
    tagline: "Um dia inteiro comendo bem — do café ao último drink",
    description: "Holambra tem uma cena gastronômica surpreendente para uma cidade de 13 mil habitantes. Do café da manhã com identidade holandesa ao lounge que serve os melhores drinks da cidade à noite — passando por italiana no food park e hambúrguer artesanal —, este passeio foi desenhado para quem veio comer bem. Não é um roteiro de museus: é um roteiro de garfo e faca.",
    theme: "Gastronomia",
    duration: "1 dia",
    coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80",
    stops: [
      {
        placeName: "De Immigrant Gastro Café", order: 1,
        narrative: "O dia começa com café da manhã no lugar mais carregado de identidade de Holambra. O De Immigrant serve desde as 8h — bolo de especiarias, pão de centeio, ovos no estilo colonial e café bom. O ambiente com fotos da imigração nas paredes dá contexto histórico à refeição. É a abertura certa para um dia dedicado à gastronomia da cidade.",
        tip: "Chegar até às 9h garante mais opções e menos fila.",
        bestMoment: "Manhã",
      },
      {
        placeName: "Martin Holandesa Confeitaria e Restaurante", order: 2,
        narrative: "Do Gastro Café ao Martin são menos de dois quarteirões — é uma parada obrigatória para souvenirs gastronômicos. Stroopwafels embalados, speculaas e pães artesanais para levar. Se a manhã for generosa, peça o café com bolo no próprio espaço da Martin: tem aquela lentidão de confeitaria de cidade pequena que faz bem.",
        tip: "Os stroopwafels embalados são o melhor presente comestível de Holambra.",
        bestMoment: "Manhã",
      },
      {
        placeName: "Italia no Box", order: 3,
        narrative: "Para o almoço, o Food Garden — o primeiro food park de Holambra. O Italia no Box fica nos boxes 03 e 04 e serve massas e risottos com mais cuidado do que o formato de food park insinua. Boa massa, bom tempero, porções honestas. O ambiente aberto e descontraído é exatamente o que um almoço no meio do dia pede: sem cerimônia, com qualidade.",
        tip: "Chega um pouco antes das 12h para garantir lugar na sombra.",
        bestMoment: "Almoço",
      },
      {
        placeName: "Cowburguer", order: 4,
        narrative: "Para o jantar, uma guinada: hambúrguer artesanal com blend especial, batata bem feita e ambiente completamente diferente do almoço. A Cowburguer funciona a partir das 19h de quarta a domingo, no Bairro Novo Cambuí. É o tipo de lugar que aparece nas histórias de quem visitou Holambra — não esperavam um hambúrguer tão bom numa cidade de flores. Mas Holambra é cheia de surpresas.",
        tip: "Peça o blend especial — é a razão de existir da casa.",
        bestMoment: "Noite",
      },
      {
        placeName: "Tulipa's Lounge", order: 5,
        narrative: "O fechamento do dia gourmet acontece aqui: o lounge mais sofisticado de Holambra, com drinks autorais e atmosfera noturna que a cidade não entrega em muitos outros endereços. No Food Garden, mas com clima de outro mundo — mais escuro, mais lento, mais elaborado. É onde a conversa continua depois que os pratos terminam.",
        tip: "Após as 21h o ambiente fica mais cheio e mais vivo.",
        bestMoment: "Noite",
      },
    ],
    extensionPlaceNames: ["Zoet en Zout"],
  },

  // ── 6. Holambra Familiar ──────────────────────────────────────────────────
  {
    slug: "holambra-familiar",
    recommendedWithDriver: true,
    name: "Holambra Familiar",
    tagline: "O roteiro perfeito para curtir com crianças",
    description: "Holambra tem muito mais para famílias do que o imaginário de flores e casais sugere. Este passeio foi desenhado especificamente para quem viaja com crianças: começa num parque com tirolesa e pedalinhos à beira do lago, passa pelos campos de flores reais e termina com sorvete artesanal. Cada parada tem espaço aberto, entrada acessível e ritmo que respeita a energia infantil.",
    theme: "Família",
    duration: "3 a 4 horas",
    coverImage: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=900&q=80",
    stops: [
      {
        placeName: "Parque Van Gogh", order: 1,
        narrative: "A abertura ideal para um dia com crianças. O Parque Van Gogh fica às margens do Lago do Holandês e tem tudo que criança precisa: tirolesa, pedalinhos, brinquedos, área verde com sombra e patos à beira da água. O visual para o lago é bonito o suficiente para os adultos ficarem satisfeitos enquanto as crianças correm. Gratuito e acessível — funciona de segunda a sexta (exceto terça e quarta) e nos fins de semana.",
        tip: "Tire fotos antes de 10h — a luz de manhã cedo sobre o lago é excepcional.",
        bestMoment: "Manhã",
      },
      {
        placeName: "Macena Flores", order: 2,
        narrative: "Crianças gostam de flores mais do que os adultos imaginam — especialmente quando as flores são reais, grandes e estão ao alcance das mãos. A Macena Flores é um sítio de produção real com venda direta do campo: os canteiros são coloridos, a escala impressiona e o preço de produtor faz com que a saída com buquê na mão seja a regra, não a exceção. Uma das experiências mais genuínas que Holambra oferece para qualquer perfil de visitante.",
        tip: "Aberta todos os dias das 9h às 17h — mesmo nas terças e quartas.",
        bestMoment: "Manhã",
      },
      {
        placeName: "Casa Bela Restaurante", order: 3,
        narrative: "Para o almoço, um clássico do centro de Holambra. O Casa Bela é o restaurante familiar por excelência da cidade — cardápio farto, atendimento acolhedor, porções honestas e ambiente que respeita quem vai com criança. É o tipo de almoço que funciona: sem surpresa negativa, com conforto garantido. Central, acessível e consistente — exatamente o que um roteiro familiar precisa no meio do dia.",
        tip: "Boa opção para grupos grandes — o espaço acomoda bem.",
        bestMoment: "Almoço",
      },
      {
        placeName: "Dolce Flor Holambra", order: 4,
        narrative: "O encerramento perfeito para crianças: sorvetes artesanais com apelo visual forte, doces bem elaborados e um ambiente que parece feito para foto. No Bairro Morada das Flores, a cerca de 10 minutos do centro — vale o pequeno desvio. Abre a partir do meio-dia, todos os dias. É aqui que o passeio termina com sorvete na mão e memória boa de Holambra.",
        tip: "Sabores mudam com frequência — pergunte as opções do dia.",
        bestMoment: "Tarde",
      },
    ],
    extensionPlaceNames: ["Parque Van Gogh"],
  },

  // ── 7. Holambra ao Entardecer ──────────────────────────────────────────────
  {
    slug: "holambra-ao-entardecer",
    recommendedWithDriver: true,
    name: "Holambra ao Entardecer",
    tagline: "Quando a luz muda tudo — o passeio que começa às 16h",
    description: "Existe uma versão de Holambra que a maioria dos visitantes não vê: a que começa às 16h, quando a luz baixa e o centro fica dourado. Este passeio foi desenhado para ser feito no final da tarde — um percurso curto pelo eixo do lago e arredores, aproveitando o horário em que cada ponto de Holambra está no seu melhor. Termina com drinks num lounge que só acorda quando o sol já vai embora.",
    theme: "Entardecer",
    duration: "2 a 3 horas",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
    stops: [
      {
        placeName: "Deck do Amor", order: 1,
        narrative: "Às 16h, o Deck do Amor tem uma luz que não existe em nenhum outro horário. O sol começa a baixar, o dourado toca a água do lago e os cadeados na cerca brilham de um jeito que parece proposital. Este é o melhor momento para estar aqui — e quem veio de manhã cedo perde exatamente essa versão do lugar. Fique um tempo: o ritmo aqui é de contemplação, não de passagem.",
        tip: "Leve um cadeado — a lojinha próxima também vende.",
        bestMoment: "Final da tarde",
      },
      {
        placeName: "Praça Vitória Régia", order: 2,
        narrative: "Logo ao lado do Deck, a Praça Vitória Régia ganha uma cor completamente diferente no entardecer. As folhas enormes das vitórias-régias capturam a luz lateral e o espelho d'água vira reflexo dourado. É uma das transições mais bonitas do percurso — e acontece em menos de um minuto de caminhada entre as duas paradas. Gratuita, sempre aberta.",
        tip: null,
        bestMoment: "Final da tarde",
      },
      {
        placeName: "Moinho Povos Unidos", order: 3,
        narrative: "O moinho no final da tarde é outro moinho. O dourado que o sol projeta sobre a estrutura branca é o tipo de coisa que explica por que Holambra virou destino fotográfico. Posicione-se do lado sul, com o sol atrás de você, para a luz perfeita na fachada. Daqui a poucos minutos já anoiteceu — e o próximo destino já espera.",
        tip: "Fique até o sol tocar o horizonte — o pôr do sol pelo moinho é raro.",
        bestMoment: "Pôr do sol",
      },
      {
        placeName: "Tulipa's Lounge", order: 4,
        narrative: "O passeio ao entardecer termina onde o entardecer vira noite: no Tulipa's Lounge, no Food Garden. O ambiente muda depois das 19h — fica mais escuro, a música sobe e os drinks autorais chegam. É o fechamento lógico para quem passou o final da tarde no eixo do lago: sai da tranquilidade da água e entra na energia controlada do melhor bar de Holambra. Um encerramento que fecha o dia bem.",
        tip: "Drinks autorais são o forte da casa — pergunte as sugestões do bartender.",
        bestMoment: "Noite",
      },
    ],
    extensionPlaceNames: ["Zoet en Zout"],
  },
];

// ─── Exported seed function (safe to call at server startup) ──────────────────

export async function seedReceptivoExpand() {
  const db = await getDb();
  if (!db) {
    console.warn("⚠️  seedReceptivoExpand: DATABASE_URL não configurado — pulando.");
    return;
  }

  console.log("🌷 Receptivo Oranje — seed de expansão iniciado\n");

  for (const tour of TOURS) {
    console.log(`\n📍 ${tour.name}`);

    const tourId = await upsertTour(db, {
      slug: tour.slug,
      name: tour.name,
      tagline: tour.tagline,
      description: tour.description,
      theme: tour.theme,
      duration: tour.duration,
      coverImage: tour.coverImage,
      status: "active",
      recommendedWithDriver: tour.recommendedWithDriver,
      walkOnly: tour.walkOnly,
      requiresTransport: tour.requiresTransport,
    });

    // Upsert stops
    for (const stop of tour.stops) {
      const placeId = await findPlaceId(db, stop.placeName);
      if (!placeId) {
        console.warn(`  ⚠️  "${stop.placeName}" não encontrado — parada ignorada`);
        continue;
      }
      await upsertStop(db, tourId, placeId, {
        order: stop.order,
        narrative: stop.narrative,
        tip: stop.tip,
        bestMoment: stop.bestMoment,
      });
      console.log(`    🏷  Parada ${stop.order}: ${stop.placeName} ✓`);
    }

    // Set extension places
    if (tour.extensionPlaceNames && tour.extensionPlaceNames.length > 0) {
      const extIds: number[] = [];
      for (const name of tour.extensionPlaceNames) {
        const id = await findPlaceId(db, name);
        if (id) extIds.push(id);
        else console.warn(`  ⚠️  Extensão "${name}" não encontrada — ignorada`);
      }
      if (extIds.length > 0) {
        await setExtensionPlaceIds(db, tourId, extIds);
        console.log(`    🔗 extensionPlaceIds: [${extIds.join(", ")}]`);
      }
    }
  }

  console.log("\n🎉 Receptivo Oranje — seed de expansão concluído!");
  console.log("📱 Tours disponíveis em /app/receptivo");
}

// Execução direta via tsx (não via import)
if (process.argv[1] && process.argv[1].includes("seed-receptivo-expand")) {
  seedReceptivoExpand()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Erro no seed:", err);
      process.exit(1);
    });
}
