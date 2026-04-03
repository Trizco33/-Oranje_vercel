/**
 * seed-places-priority.ts
 * Upserta o lote prioritário de 23 lugares curados do Oranje.
 * Run: npx tsx scripts/seed-places-priority.ts
 *
 * Mapeamento de categorias (IDs confirmados do banco):
 *   1  = Restaurantes
 *   2  = Cafés
 *   14 = Bares
 *   15 = Hotéis
 *   16 = Parques
 *   17 = Docerias
 *   4  = Pontos Turísticos
 */

import mysql2 from "mysql2/promise";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converte formato do JSON {monday: "09:00-17:00"} →
 * formato do useBusinessHours {seg: [["09:00","17:00"]]}
 */
function convertHours(raw: Record<string, string | null> | null | undefined): string | null {
  if (!raw) return null;
  const dayMap: Record<string, string> = {
    sunday: "dom",
    monday: "seg",
    tuesday: "ter",
    wednesday: "qua",
    thursday: "qui",
    friday: "sex",
    saturday: "sab",
  };
  const result: Record<string, [string, string][] | null> = {};
  for (const [eng, val] of Object.entries(raw)) {
    const pt = dayMap[eng.toLowerCase()];
    if (!pt) continue;
    if (!val || val === "closed") {
      result[pt] = null;
    } else {
      const parts = val.split("-");
      if (parts.length === 2) {
        result[pt] = [[parts[0].trim(), parts[1].trim()]];
      } else {
        result[pt] = null;
      }
    }
  }
  return JSON.stringify(result);
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PLACES = [
  // ═══ BATCH 1 ═══════════════════════════════════════════════════════════════

  // 1 — Martin Holandesa
  {
    _dbId: 2613,
    name: "Martin Holandesa Confeitaria e Restaurante",
    slug: "martin-holandesa-confeitaria-e-restaurante",
    categoryId: 1,
    shortDesc: "Restaurante e confeitaria tradicional no Boulevard Holandês, forte em culinária holandesa e sobremesas.",
    longDesc: "Um dos pontos mais clássicos e frequentados de Holambra. A Martin Holandesa combina culinária holandesa autêntica com uma confeitaria de qualidade, tudo no coração do Boulevard Holandês. Ótima opção para café da manhã, almoço e jantar — especialmente nos fins de semana, quando o movimento é maior e o clima da cidade está em alta.",
    address: "Rua Doria Vasconcelos, 144, Boulevard Holandês, Holambra, SP, 13825-065",
    phone: "+55 19 3802-1295",
    priceRange: "$$",
    openingHours: convertHours({
      sunday: "09:00-21:00",
      monday: "09:00-16:00",
      tuesday: "09:00-16:00",
      wednesday: "09:00-23:00",
      thursday: "09:00-23:00",
      friday: "09:00-23:00",
      saturday: "09:00-23:00",
    }),
    rating: 4.6,
    reviewCount: 3214,
    tags: ["tradicional", "tipico_holandes", "cafe_da_manha", "almoco", "jantar", "turistico", "central", "fotos", "familia"],
    isFeatured: true,
    dataPending: false,
  },

  // 2 — Casa Bela (id=24, UPDATE)
  {
    _dbId: 24,
    name: "Casa Bela Restaurante",
    slug: "casa-bela-restaurante",
    categoryId: 1,
    shortDesc: "Um dos restaurantes mais fortes e bem avaliados de Holambra, com cozinha holandesa e internacional.",
    longDesc: "Casa Bela é uma referência consolidada entre os visitantes de Holambra. Com ambiente cuidado, cardápio que transita entre a culinária holandesa e internacional, e atendimento reconhecido, é uma parada obrigatória para quem quer almoçar ou jantar bem na cidade. Também oferece música ao vivo em algumas noites.",
    address: "Rua Dória Vasconcelos, 81, Holambra, SP, 13825-065",
    phone: "+55 19 3802-8040",
    priceRange: "$$",
    openingHours: convertHours({
      sunday: "11:30-22:00",
      monday: "closed",
      tuesday: "11:30-22:00",
      wednesday: "11:30-22:00",
      thursday: "11:30-22:00",
      friday: "11:30-22:30",
      saturday: "11:30-23:00",
    }),
    rating: 4.6,
    reviewCount: 3243,
    tags: ["almoco", "jantar", "tradicional", "turistico", "familia", "romantico", "central", "estacionamento", "pet_friendly"],
    isFeatured: true,
    dataPending: false,
  },

  // 3 — Lago do Holandês
  {
    _dbId: 2614,
    name: "Lago do Holandês",
    slug: "lago-do-holandes",
    categoryId: 1,
    shortDesc: "Restaurante com vista para o lago, cozinha brasileira e holandesa e forte apelo de experiência.",
    longDesc: "Um dos programas mais fotogênicos de Holambra. O Lago do Holandês combina uma cozinha brasileira com toques holandeses, coquetéis bem elaborados e uma vista privilegiada para o lago — o tipo de lugar que transforma um almoço num momento especial. Ideal para casais e grupos que buscam experiência completa.",
    address: "Av. das Tulipas, 245, Holambra, SP, 13825-000",
    phone: "+55 19 99648-6005",
    priceRange: "$$",
    openingHours: null,
    rating: 4.6,
    reviewCount: 460,
    tags: ["almoco", "jantar", "romantico", "fotos", "por_do_sol", "turistico"],
    isFeatured: true,
    dataPending: false,
  },

  // 4 — The Old Dutch
  {
    _dbId: 2615,
    name: "The Old Dutch",
    slug: "the-old-dutch",
    categoryId: 1,
    shortDesc: "Referência para quem busca culinária holandesa tradicional em Holambra.",
    longDesc: "O Old Dutch é um dos restaurantes mais tradicionais da culinária holandesa em Holambra. Com ambiente temático e cardápio fiel às origens dos imigrantes holandeses, funciona especialmente no almoço e é muito procurado por quem quer viver a experiência gastronômica mais autêntica da cidade.",
    address: "Estrada do Fundão, 200, Holambra, SP, 13825-000",
    phone: "+55 19 99210-0130",
    priceRange: "$$",
    openingHours: convertHours({
      sunday: "11:30-16:00",
      monday: "closed",
      tuesday: "11:30-14:30",
      wednesday: "11:30-14:30",
      thursday: "11:30-14:30",
      friday: "11:30-14:30",
      saturday: "11:30-16:00",
    }),
    rating: 4.5,
    reviewCount: 1114,
    tags: ["almoco", "tradicional", "tipico_holandes", "familia", "turistico", "estacionamento"],
    isFeatured: true,
    dataPending: false,
  },

  // 5 — Holambier (id=26, UPDATE)
  {
    _dbId: 26,
    name: "Restaurante e Cervejaria Holambier",
    slug: "restaurante-e-cervejaria-holambier",
    categoryId: 14,
    shortDesc: "Microcervejaria e restaurante no coração turístico de Holambra.",
    longDesc: "O Holambier é a microcervejaria de referência de Holambra. Com chope artesanal próprio, pratos generosos e ambiente descontraído, fica bem posicionado no roteiro de quem quer encerrar o dia com uma boa cerveja e boa comida. Uma parada autêntica no centro da cidade.",
    address: "Rua Rota dos Imigrantes, 653, Holambra, SP, 13825-000",
    phone: "+55 19 3802-8040",
    priceRange: "$$",
    openingHours: null,
    rating: 4.4,
    reviewCount: 44,
    tags: ["bar", "cervejaria", "jantar", "casual", "turistico", "central"],
    isFeatured: false,
    dataPending: false,
  },

  // 6 — Royal Tulip (id=30, UPDATE)
  {
    _dbId: 30,
    name: "Royal Tulip Holambra",
    slug: "royal-tulip-holambra",
    categoryId: 15,
    shortDesc: "Hotel de padrão premium com boa reputação e forte presença nas listas de hospedagem de Holambra.",
    longDesc: "O Royal Tulip é a melhor opção de hospedagem em Holambra para quem busca estrutura, conforto e uma experiência premium. Jardins bem cuidados, lazer completo e posição estratégica fazem dele a escolha natural para roteiros de fim de semana e viagens em casal.",
    address: null,
    phone: null,
    priceRange: "$$$",
    openingHours: null,
    rating: 4.4,
    reviewCount: 173,
    tags: ["hotel", "premium", "casal", "eventos", "familia"],
    isFeatured: true,
    dataPending: false,
  },

  // 7 — Holambra Garden Hotel (id=31, UPDATE)
  {
    _dbId: 31,
    name: "Holambra Garden Hotel",
    slug: "holambra-garden-hotel",
    categoryId: 15,
    shortDesc: "Hotel central e bem percebido, com boa presença local e turística.",
    longDesc: "O Holambra Garden Hotel é uma opção sólida para quem quer se hospedar no centro da cidade com boa relação custo-benefício. Bem localizado e com boa percepção entre os visitantes, funciona bem como base para roteiros que começam cedo e terminam tarde.",
    address: null,
    phone: null,
    website: "https://www.holambragardenhotel.com.br/",
    priceRange: "$$",
    openingHours: null,
    rating: 4.1,
    reviewCount: 236,
    tags: ["hotel", "central", "familia", "casal", "eventos"],
    isFeatured: true,
    dataPending: false,
  },

  // 8 — Moinho Povos Unidos
  {
    _dbId: 2616,
    name: "Moinho Povos Unidos",
    slug: "moinho-povos-unidos",
    categoryId: 4,
    shortDesc: "O atrativo mais emblemático e um dos mais populares de Holambra.",
    longDesc: "O Moinho Povos Unidos é o símbolo mais reconhecido de Holambra. Visível de longe, é parada obrigatória para qualquer visitante — especialmente para fotos e para absorver a essência holandesa da cidade. Um ícone que representa a história e a identidade cultural da comunidade.",
    address: null,
    phone: null,
    priceRange: "$",
    openingHours: null,
    rating: 4.2,
    reviewCount: 1796,
    tags: ["turistico", "fotos", "classico", "familia", "primeira_visita", "icone"],
    isFeatured: true,
    dataPending: false,
  },

  // 9 — Bloemen Park (id=32, UPDATE)
  {
    _dbId: 32,
    name: "Bloemen Park",
    slug: "bloemen-park",
    categoryId: 16,
    shortDesc: "Parque com jardins e cenários floridos, forte para fotos e passeios contemplativos.",
    longDesc: "O Bloemen Park é o parque mais fotogênico de Holambra. Com jardins de girassóis e flores que mudam conforme a estação, é o lugar perfeito para o fim de tarde, fotos com qualidade de luz natural e uma pausa contemplativa durante o roteiro. Um dos lugares mais compartilhados nas redes sobre a cidade.",
    address: null,
    phone: null,
    priceRange: "$$",
    openingHours: convertHours({
      monday: "09:00-17:00",
      tuesday: "09:00-17:00",
      wednesday: "09:00-17:00",
      thursday: "09:00-17:00",
      friday: "09:00-17:00",
      saturday: "09:00-17:00",
      sunday: "09:00-17:00",
    }),
    rating: 4.3,
    reviewCount: 125,
    tags: ["parque", "fotos", "por_do_sol", "familia", "casal", "turistico"],
    isFeatured: true,
    dataPending: false,
  },

  // ═══ BATCH 2 ═══════════════════════════════════════════════════════════════

  // 10 — Lotus Café (id=27, UPDATE)
  {
    _dbId: 27,
    name: "Lotus Café",
    slug: "lotus-cafe",
    categoryId: 2,
    shortDesc: "Café muito bem encaixado para pausas agradáveis, começo de roteiro e clima leve em Holambra.",
    longDesc: "O Lotus Café é uma das escolhas mais naturais para começar o dia em Holambra. Café especial, ambiente acolhedor e cardápio com referência europeia — o tipo de lugar que define o ritmo certo para um bom passeio pela cidade. Encaixa bem em qualquer roteiro e também funciona como pausa da tarde.",
    address: null,
    phone: null,
    priceRange: "$$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["cafe", "cafe_da_manha", "casal", "fotos", "curadoria_oranje", "roteiro_1_dia"],
    isFeatured: false,
    dataPending: true,
  },

  // 11 — Café Moinho (id=2, UPDATE)
  {
    _dbId: 2,
    name: "Café Moinho",
    slug: "cafe-moinho",
    categoryId: 2,
    shortDesc: "Café clássico para quem quer entrar no clima de Holambra logo cedo.",
    longDesc: "O Café Moinho é um dos pontos mais tradicionais para começar o dia na cidade. Com aquele charme europeu característico de Holambra, funciona bem como parada matinal e como ponto de encontro antes de um roteiro pela cidade.",
    address: null,
    phone: null,
    priceRange: "$$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["cafe", "cafe_da_manha", "turistico", "roteiro_1_dia", "fotos"],
    isFeatured: false,
    dataPending: true,
  },

  // 12 — Kéndi Confeitaria (id=29, UPDATE)
  {
    _dbId: 29,
    name: "Kéndi Confeitaria",
    slug: "kendi-confeitaria",
    categoryId: 2,
    shortDesc: "Boa escolha para doces, café e pausa aconchegante ao longo do passeio.",
    longDesc: "A Kéndi Confeitaria é a parada certa para os momentos entre atrativos. Com doces artesanais, café quente e ambiente convidativo, funciona muito bem em roteiros de dia chuvoso e também como começo tranquilo de manhã.",
    address: null,
    phone: null,
    priceRange: "$$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["cafe", "doces", "cafe_da_manha", "familia", "casal", "dia_chuvoso"],
    isFeatured: false,
    dataPending: true,
  },

  // 13 — Amarena Doceria & Café (id=38, UPDATE)
  {
    _dbId: 38,
    name: "Amarena Doceria & Café",
    slug: "amarena-doceria-e-cafe",
    categoryId: 17,
    shortDesc: "Boa escolha para sobremesa, café e pausa doce em um roteiro pela cidade.",
    longDesc: "A Amarena é a escolha certa para a pausa doce do roteiro. Sobremesas finas, café de qualidade e ambiente cuidado fazem dela um encerramento natural para um dia chuvoso ou um complemento perfeito após o almoço.",
    address: null,
    phone: null,
    priceRange: "$$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["doces", "cafe", "casal", "familia", "dia_chuvoso", "fotos"],
    isFeatured: false,
    dataPending: true,
  },

  // 14 — Kopenhagen Holambra (id=39, UPDATE)
  {
    _dbId: 39,
    name: "Kopenhagen Holambra",
    slug: "kopenhagen-holambra",
    categoryId: 17,
    shortDesc: "Parada segura para doces e café, com forte apelo para pausa e sobremesa.",
    longDesc: "A Kopenhagen de Holambra tem personalidade própria. Chocolate de qualidade, doces finos e café — o tipo de parada que cabe bem em qualquer perfil de visitante. Especialmente indicada para dias mais tranquilos ou como presente da viagem.",
    address: null,
    phone: null,
    priceRange: "$$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["doces", "cafe", "familia", "dia_chuvoso"],
    isFeatured: false,
    dataPending: true,
  },

  // 15 — Dolce Flor Holambra (id=28, UPDATE)
  {
    _dbId: 28,
    name: "Dolce Flor Holambra",
    slug: "dolce-flor-holambra",
    categoryId: 17,
    shortDesc: "Doceria com forte apelo visual, boa para pausa doce e fotos.",
    longDesc: "A Dolce Flor tem aquele apelo visual que funciona bem tanto para quem busca doces quanto para quem quer uma boa foto. Ambiente bonito, produtos de qualidade e uma identidade que conversa com o imaginário floral de Holambra.",
    address: null,
    phone: null,
    priceRange: "$$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["doces", "fotos", "casal", "familia", "curadoria_oranje"],
    isFeatured: false,
    dataPending: true,
  },

  // 16 — Seo Carneiro Bar (id=11, UPDATE)
  {
    _dbId: 11,
    name: "Seo Carneiro Bar",
    slug: "seo-carneiro-bar",
    categoryId: 14,
    shortDesc: "Bar descontraído para fim de tarde e noite mais casual em Holambra.",
    longDesc: "O Seo Carneiro é a opção mais descontraída para encerrar o dia em Holambra. Ambiente sem frescura, boa energia e o ritmo certo para quem quer uma noite leve sem cerimônia.",
    address: null,
    phone: null,
    priceRange: "$$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["bar", "noite", "casual", "amigos"],
    isFeatured: false,
    dataPending: true,
  },

  // 17 — Deck 237 (id=12, UPDATE)
  {
    _dbId: 12,
    name: "Deck 237",
    slug: "deck-237",
    categoryId: 14,
    shortDesc: "Boa opção para fim de tarde, encontro e experiência mais descontraída.",
    longDesc: "O Deck 237 é uma boa pedida para o fim de tarde e começo de noite em Holambra. Com ambiente agradável, funciona bem como ponto de encontro ou parada casual antes de continuar o roteiro.",
    address: null,
    phone: null,
    priceRange: "$$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["bar", "jantar", "noite", "casual", "casal"],
    isFeatured: false,
    dataPending: true,
  },

  // 18 — Quintal dos Avós Gastrobar (id=43, UPDATE)
  {
    _dbId: 43,
    name: "Quintal dos Avós Gastrobar",
    slug: "quintal-dos-avos-gastrobar",
    categoryId: 14,
    shortDesc: "Gastrobar com boa cara de noite agradável e experiência mais autoral.",
    longDesc: "O Quintal dos Avós é o gastrobar mais charmoso de Holambra. Drinks bem feitos, cozinha autoral e aquele clima de quintal que convida a ficar mais um pouco — a escolha certa para encerrar um roteiro com estilo.",
    address: null,
    phone: null,
    priceRange: "$$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["bar", "gastrobar", "casal", "noite", "curadoria_oranje"],
    isFeatured: false,
    dataPending: true,
  },

  // 19 — Tulipa's Lounge (id=44, UPDATE)
  {
    _dbId: 44,
    name: "Tulipa's Lounge",
    slug: "tulipas-lounge",
    categoryId: 14,
    shortDesc: "Lounge com apelo mais sofisticado para estender a noite em Holambra.",
    longDesc: "O Tulipa's Lounge é a opção mais sofisticada da noite holambrana. Com ambiente cuidado, drinks elaborados e aquele clima de lounge que funciona bem para casais e grupos que querem algo a mais no encerramento do dia.",
    address: null,
    phone: null,
    priceRange: "$$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["bar", "lounge", "casal", "premium", "noite"],
    isFeatured: false,
    dataPending: true,
  },

  // 20 — Parque Van Gogh (id=19, UPDATE)
  {
    _dbId: 19,
    name: "Parque Van Gogh",
    slug: "parque-van-gogh",
    categoryId: 16,
    shortDesc: "Parque agradável para passeio leve, contemplação e parada fotográfica.",
    longDesc: "O Parque Van Gogh é um dos pontos mais fotogênicos de Holambra. Cenários naturais, espaço aberto e aquela luz suave de fim de tarde que transforma qualquer foto. Encaixa bem em qualquer roteiro como pausa tranquila e contemplativa.",
    address: null,
    phone: null,
    priceRange: "$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["parque", "familia", "fotos", "passeio", "gratuito"],
    isFeatured: false,
    dataPending: true,
  },

  // 21 — Cidade das Crianças (id=21, UPDATE)
  {
    _dbId: 21,
    name: "Cidade das Crianças",
    slug: "cidade-das-criancas",
    categoryId: 16,
    shortDesc: "Lugar muito útil para famílias com crianças e programas diurnos leves.",
    longDesc: "A Cidade das Crianças é a parada ideal para famílias com crianças em Holambra. Espaço ao ar livre, atividades leves e o ritmo tranquilo que funciona bem para um dia com os menores.",
    address: null,
    phone: null,
    priceRange: "$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["familia", "kids", "parque", "dia", "gratuito"],
    isFeatured: false,
    dataPending: true,
  },

  // 22 — Macena Flores (id=34, UPDATE)
  {
    _dbId: 34,
    name: "Macena Flores",
    slug: "macena-flores",
    categoryId: 16,
    shortDesc: "Lugar com forte apelo visual e conexão direta com o imaginário floral de Holambra.",
    longDesc: "A Macena Flores é um dos lugares mais representativos da identidade floral de Holambra. Flores em abundância, cores vivas e cenários que funcionam perfeitamente para fotografia — visita que vale qualquer horário do dia.",
    address: null,
    phone: null,
    priceRange: "$$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["flores", "fotos", "casal", "familia", "turistico"],
    isFeatured: false,
    dataPending: true,
  },

  // 23 — Nossa Prainha (id=23, UPDATE)
  {
    _dbId: 23,
    name: "Nossa Prainha",
    slug: "nossa-prainha",
    categoryId: 16,
    shortDesc: "Lugar que pode funcionar como pausa ao ar livre para famílias e passeio leve.",
    longDesc: "A Nossa Prainha é uma alternativa de lazer ao ar livre para quem visita Holambra com crianças ou quer um momento mais descontraído na natureza. Ambiente simples, espaço aberto e boa para roteiros em família.",
    address: null,
    phone: null,
    priceRange: "$",
    openingHours: null,
    rating: null,
    reviewCount: null,
    tags: ["familia", "parque", "gratuito", "dia"],
    isFeatured: false,
    dataPending: true,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log("🌷 Iniciando upsert dos lugares prioritários do Oranje...\n");

  const conn = await mysql2.createConnection(process.env.DATABASE_URL!);

  let updated = 0;
  let inserted = 0;
  let errors = 0;

  for (const p of PLACES) {
    const {
      _dbId, name, slug, categoryId, shortDesc, longDesc,
      address, phone, priceRange, openingHours,
      rating, reviewCount, tags, isFeatured, dataPending,
      website,
    } = p as any;

    try {
      if (_dbId) {
        // UPDATE existing place
        const fields: string[] = [];
        const values: any[] = [];

        const push = (col: string, val: any) => {
          if (val !== undefined) { fields.push(`\`${col}\` = ?`); values.push(val); }
        };

        push("slug", slug);
        push("shortDesc", shortDesc);
        push("longDesc", longDesc);
        push("categoryId", categoryId);
        push("tags", tags ? JSON.stringify(tags) : null);
        push("priceRange", priceRange);
        if (openingHours !== undefined) push("openingHours", openingHours);
        if (address !== undefined && address !== null) push("address", address);
        if (phone !== undefined && phone !== null) push("phone", phone);
        if (website !== undefined && website !== null) push("website", website);
        if (rating !== undefined && rating !== null) push("rating", rating);
        if (reviewCount !== undefined && reviewCount !== null) push("reviewCount", reviewCount);
        push("isFeatured", isFeatured ? 1 : 0);
        push("dataPending", dataPending ? 1 : 0);
        push("updatedAt", new Date());

        if (fields.length > 0) {
          await conn.execute(
            `UPDATE places SET ${fields.join(", ")} WHERE id = ?`,
            [...values, _dbId]
          );
        }
        console.log(`  ✅ [${_dbId}] Atualizado: ${name}`);
        updated++;
      } else {
        // INSERT new place
        await conn.execute(
          `INSERT INTO places (name, slug, categoryId, shortDesc, longDesc, tags, priceRange, openingHours, address, phone, city, state, country, rating, reviewCount, isFeatured, dataPending, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Holambra', 'SP', 'Brasil', ?, ?, ?, ?, 'active')`,
          [
            name, slug, categoryId, shortDesc, longDesc,
            tags ? JSON.stringify(tags) : null,
            priceRange, openingHours,
            address || null, phone || null,
            rating || 0, reviewCount || 0,
            isFeatured ? 1 : 0, dataPending ? 1 : 0,
          ]
        );
        console.log(`  ✨ Criado: ${name}`);
        inserted++;
      }
    } catch (err: any) {
      console.error(`  ❌ Erro em "${name}": ${err.message}`);
      errors++;
    }
  }

  await conn.end();

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Atualizados : ${updated}`);
  console.log(`✨ Criados     : ${inserted}`);
  console.log(`❌ Erros       : ${errors}`);
  console.log(`${"─".repeat(50)}`);
  process.exit(errors > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("❌ Falha geral:", err);
  process.exit(1);
});
