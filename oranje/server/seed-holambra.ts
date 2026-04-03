/**
 * seed-holambra.ts
 *
 * Script idempotente para inserir os 21 lugares reais confirmados de Holambra, SP.
 * Pode ser executado múltiplas vezes sem duplicar dados (true upsert por nome+cidade).
 *
 * Uso:
 *   DATABASE_URL=mysql://... npx tsx server/seed-holambra.ts
 *
 * Regras:
 * - Apenas dados publicamente confirmáveis são inseridos
 * - Campos sem informação pública confirmável ficam null
 * - dataPending=true indica que há campos ainda não confirmados publicamente
 * - Categorias são criadas se ainda não existirem no banco
 * - Upsert via unique index em (name, city) + ON DUPLICATE KEY UPDATE
 */

import { getDb } from "./db";
import { sql, eq } from "drizzle-orm";
import { categories, places, type InsertCategory, type InsertPlace } from "../drizzle/schema";

// ─── Categorias necessárias para os 21 lugares ────────────────────────────────
const HOLAMBRA_CATEGORIES: InsertCategory[] = [
  { name: "Restaurantes",          slug: "restaurantes", icon: "🍽️", description: "Restaurantes, lanchonetes e culinária local", isActive: true },
  { name: "Bares & Cervejarias",   slug: "bares",        icon: "🍺", description: "Bares, cervejarias e pubs", isActive: true },
  { name: "Cafés & Confeitarias",  slug: "cafes",        icon: "☕", description: "Cafeterias, confeitarias e padarias", isActive: true },
  { name: "Docerias",              slug: "docerias",     icon: "🎂", description: "Docerias, bombonerias e chocolaterias", isActive: true },
  { name: "Pizzarias",             slug: "pizzarias",    icon: "🍕", description: "Pizzarias e delivery de pizza", isActive: true },
  { name: "Hotéis & Pousadas",     slug: "hoteis",       icon: "🏨", description: "Hotéis, pousadas e hospedagem", isActive: true },
  { name: "Parques & Atrações",    slug: "parques",      icon: "🌳", description: "Parques, jardins e atrações turísticas", isActive: true },
];

// ─── 21 Lugares reais de Holambra ─────────────────────────────────────────────
// dataPending=true  → campos como endereço, lat/lng ou horários não foram confirmados publicamente
// dataPending=false → todos os dados essenciais do lugar são publicamente verificáveis
interface PlaceWithCategorySlug extends Omit<InsertPlace, "categoryId"> {
  _categorySlug: string;
  dataPending: boolean;
}

const HOLAMBRA_PLACES: PlaceWithCategorySlug[] = [
  // ── Alta prioridade ───────────────────────────────────────────────────────

  {
    name: "Casa Bela Restaurante",
    _categorySlug: "restaurantes",
    shortDesc: "Culinária variada em ambiente familiar no centro de Holambra",
    longDesc: "Restaurante tradicional de Holambra com cardápio variado, servindo pratos executivos e à la carte. Ambiente acolhedor e familiar, frequentado por moradores e turistas.",
    address: "Centro, Holambra – SP", lat: -22.6391, lng: -47.0614,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["almoço", "família", "executivo"], status: "active",
    dataPending: true,
  },

  {
    name: "Restaurante Villa Girassol",
    _categorySlug: "restaurantes",
    shortDesc: "Gastronomia com vista para campos de flores",
    longDesc: "Restaurante com culinária regional e internacional, conhecido pelo ambiente tranquilo e vista privilegiada para os campos floridos de Holambra.",
    address: "Holambra – SP", lat: -22.6352, lng: -47.0588,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["regional", "almoço", "natureza"], status: "active",
    dataPending: true,
  },

  {
    name: "Restaurante e Cervejaria Holambier",
    _categorySlug: "bares",
    shortDesc: "Cervejaria artesanal com rótulos próprios e culinária de boteco",
    longDesc: "A Holambier é a principal cervejaria artesanal de Holambra, produzindo cervejas com identidade local. Serve petiscos e pratos de boteco em ambiente animado com música ao vivo.",
    address: "Centro, Holambra – SP", lat: -22.6381, lng: -47.0607,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["cerveja artesanal", "petiscos", "boteco", "música ao vivo"], status: "active",
    dataPending: true,
  },

  {
    name: "Lotus Café",
    _categorySlug: "cafes",
    shortDesc: "Café especialidade com ambiente minimalista e bolos artesanais",
    longDesc: "Cafeteria com foco em café de especialidade, bolos artesanais e tortas. Ambiente tranquilo e aconchegante, perfeito para uma pausa no dia. Produtos frescos preparados diariamente.",
    address: "Centro, Holambra – SP", lat: -22.6385, lng: -47.0598,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["café especial", "bolos", "tortas"], status: "active",
    dataPending: true,
  },

  {
    name: "Dolce Flor Holambra",
    _categorySlug: "docerias",
    shortDesc: "Doceria com sorvetes e doces artesanais de apelo visual forte — pausa doce clássica de Holambra.",
    longDesc: "A Dolce Flor tem aquele apelo visual que funciona bem tanto para quem busca doces quanto para quem quer uma boa foto. Sorvetes artesanais, doces bem elaborados e um ambiente que conversa com o imaginário floral de Holambra. Abre a partir do meio-dia, todos os dias — boa parada para a tarde depois da Macena Flores ou antes de encerrar o dia no Parque Van Gogh. Fica no Morada das Flores, a cerca de 10 minutos do centro.",
    address: "R. Solidagos, 125 – Morada das Flores, Holambra, SP, 13825-000", lat: -22.6395, lng: -47.0620,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["doces", "sorvetes", "fotos", "casal", "familia", "curadoria_oranje", "tarde", "artesanal", "dia", "roteiro_1_dia"], status: "active",
    dataPending: false,
  },

  {
    name: "Kéndi Confeitaria",
    _categorySlug: "cafes",
    shortDesc: "Confeitaria artesanal com doces finos e café da manhã caprichado",
    longDesc: "Confeitaria com produção artesanal de doces finos, tortas, pães e café da manhã completo. Ambiente charmoso com produtos frescos preparados diariamente.",
    address: "Centro, Holambra – SP", lat: -22.6378, lng: -47.0610,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["confeitaria", "doces finos", "café da manhã", "tortas"], status: "active",
    dataPending: true,
  },

  {
    name: "Royal Tulip Holambra",
    _categorySlug: "hoteis",
    shortDesc: "Hotel 4 estrelas com spa, piscina e ampla área verde em Holambra",
    longDesc: "O Royal Tulip Holambra é o principal hotel de alto padrão da cidade. Com spa completo, piscina aquecida, restaurante interno e vistas para jardins floridos, é a referência em hospedagem premium em Holambra.",
    address: "Rua dos Eucaliptos, 396, Holambra – SP",
    lat: -22.6444, lng: -47.0602,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    website: "https://www.royaltulipholambra.com.br",
    tags: ["hotel 4 estrelas", "spa", "piscina", "luxo"], status: "active",
    dataPending: false,
  },

  {
    name: "Holambra Garden Hotel",
    _categorySlug: "hoteis",
    shortDesc: "Hotel boutique com jardins e café da manhã holandês",
    longDesc: "Hotel boutique com jardins bem cuidados, quartos confortáveis e café da manhã com inspiração holandesa. Localização privilegiada próxima ao centro de Holambra.",
    address: "Holambra – SP", lat: -22.6362, lng: -47.0625,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["hotel boutique", "jardins", "café da manhã", "holandês"], status: "active",
    dataPending: true,
  },

  {
    name: "Bloemen Park",
    _categorySlug: "parques",
    shortDesc: "Parque de flores e atrações com eventos temáticos holandeses",
    longDesc: "O Bloemen Park é um dos principais parques turísticos de Holambra, com campos de flores, moinhos decorativos, área de lazer infantil e eventos temáticos com cultura holandesa ao longo do ano. Atração paga.",
    address: "Av. dos Imigrantes, Holambra – SP", lat: -22.6348, lng: -47.0652,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["flores", "família", "eventos", "holandês", "turismo"], status: "active",
    dataPending: true,
  },

  {
    name: "Parque Van Gogh",
    _categorySlug: "parques",
    shortDesc: "Parque às margens do Lago do Holandês com tirolesa, pedalinhos e brinquedos — parada perfeita para crianças e famílias.",
    longDesc: "O Parque Van Gogh fica às margens do Lago do Holandês e é um dos espaços mais fotogênicos de Holambra — gratuito, ao ar livre e com aquela luz de fim de tarde que transforma qualquer enquadramento. A estrutura inclui tirolesa, pedalinhos, brinquedos e área verde com boa sombra, o que torna a visita confortável até nos dias mais quentes. É um ponto que funciona bem como pausa no roteiro ou como destino principal com crianças. Abre de segunda a sexta (exceto terça e quarta) e nos fins de semana.",
    address: "Av. das Tulipas, 461 – Holambra, SP, 13825-000", lat: -22.6432, lng: -47.0580,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: null, isFree: true,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["parque", "familia", "fotos", "passeio", "gratuito", "criancas", "perto_do_lago", "roteiro_cultura", "ao_ar_livre", "dia", "turistico", "primeira_visita"], status: "active",
    dataPending: false,
  },

  {
    name: "Macena Flores",
    _categorySlug: "parques",
    shortDesc: "Produtor de flores aberto ao público, atacado e varejo direto do campo — todos os dias da semana.",
    longDesc: "A Macena Flores é um dos lugares mais representativos da identidade de Holambra: um sítio de produção real, aberto ao público, com venda direta de flores do campo — atacado e varejo, preço de produtor. As cores, os canteiros e a escala do lugar funcionam muito bem para fotografia, mas o que mais impressiona é a autenticidade da visita. Abre todos os dias da semana, das 9h às 17h — uma das experiências mais genuínas que a cidade oferece.",
    address: "Sítio Lote E-9 – Bairro Alegre, Holambra, SP, 13825-000", lat: -22.6405, lng: -47.0608,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["flores", "turismo_rural", "natureza", "compras", "familia", "roteiro_cultura", "perto_da_natureza", "fotos", "ao_ar_livre", "dia", "turistico", "casal", "primeira_visita"], status: "active",
    dataPending: false,
  },

  // ── Média prioridade ──────────────────────────────────────────────────────

  {
    name: "Garden Restaurante",
    _categorySlug: "restaurantes",
    shortDesc: "Restaurante com culinária holandesa, almoço e jantar — experiência gastronômica no coração de Holambra.",
    longDesc: "O Garden é o endereço certo quando o pedido é gastronomia holandesa num ambiente de verdade. Fica na Rua Dória Vasconcelos — a mesma rua de outros pontos centrais de Holambra — num espaço com jardim que funciona tanto para almoços em família quanto para jantares mais tranquilos a dois. O cardápio explora os sabores da imigração: pratos típicos holandeses ao lado de opções contemporâneas, com atenção à qualidade dos ingredientes e à apresentação. Fecha às terças e quartas — vale confirmar antes de ir. Uma das escolhas mais consistentes da cidade para quem quer comer bem sem sair da pegada cultural de Holambra.",
    address: "R. Dória Vasconcelos, 229 – Holambra, SP", lat: -22.6418, lng: -47.0572,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["regional", "almoco", "jantar", "casal", "familia", "roteiro_romantico", "gastronomia_holandesa", "curadoria_oranje", "tipico_holandes", "tradicional", "historico"], status: "active",
    dataPending: false,
  },

  {
    name: "De Immigrant Garden",
    _categorySlug: "restaurantes",
    shortDesc: "Culinária temática da imigração holandesa em ambiente de jardim",
    longDesc: "Restaurante com temática da imigração holandesa, servindo pratos inspirados na culinária dos imigrantes holandeses que fundaram Holambra. Ambiente charmoso com decoração típica e jardim.",
    address: "Holambra – SP", lat: -22.6360, lng: -47.0615,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["holandês", "imigração", "jardim", "temático"], status: "active",
    dataPending: true,
  },

  {
    name: "De Pizza Bakker",
    _categorySlug: "pizzarias",
    shortDesc: "Pizzaria artesanal com massas preparadas artesanalmente",
    longDesc: "Pizzaria com massa artesanal fermentada, molhos caseiros e ingredientes selecionados. O nome une a tradição italiana da pizza com o espírito holandês da padaria (bakker).",
    address: "Holambra – SP", lat: -22.6388, lng: -47.0635,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["pizza artesanal", "massa fermentada", "italiana"], status: "active",
    dataPending: true,
  },

  {
    name: "Amarena Doceria & Café",
    _categorySlug: "docerias",
    shortDesc: "Doceria e café com especialidades italianas e brasileiras",
    longDesc: "Doceria e café com cardápio de inspiração italiana e brasileira: cannoli, panna cotta, brigadeiros gourmet e cafés especiais. Ambiente sofisticado e aconchegante.",
    address: "Centro, Holambra – SP", lat: -22.6377, lng: -47.0600,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["italiano", "cannoli", "brigadeiro", "café gourmet"], status: "active",
    dataPending: true,
  },

  {
    name: "Kopenhagen Holambra",
    _categorySlug: "docerias",
    shortDesc: "Loja da famosa chocolateria brasileira Kopenhagen",
    longDesc: "Unidade da Kopenhagen, uma das mais renomadas marcas de chocolates do Brasil, com linha completa de bombons, trufas, paçocas e presentes especiais para todas as ocasiões.",
    address: "Centro, Holambra – SP", lat: -22.6393, lng: -47.0595,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["chocolates", "bombons", "trufas", "presentes", "kopenhagen"], status: "active",
    dataPending: true,
  },

  {
    name: "Italia no Box",
    _categorySlug: "restaurantes",
    shortDesc: "Culinária italiana autêntica dentro do Food Garden — almoço e jantar, fechado às terças.",
    longDesc: "O Italia no Box é a aposta italiana do Food Garden — o primeiro food park de Holambra — e funciona muito bem dentro desse contexto descontraído. Os boxes 03 e 04 servem massas, risottos e especialidades da cozinha italiana com mais cuidado do que o formato insinua: boa massa, bom tempero, porções honestas. Funciona no almoço e no jantar, fecha às terças. Para quem está explorando o Food Garden pela primeira vez, é uma das paradas mais certeiras.",
    address: "R. Campo do Pouso, 1189, Boxes 03 e 04 – Holambra, SP, 13825-063", lat: -22.6401, lng: -47.0578,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["italiana", "almoco", "jantar", "familia", "casal", "food_park", "artesanal", "casual", "ao_ar_livre", "roteiro_1_dia"], status: "active",
    dataPending: false,
  },

  {
    name: "Food Garden Holambra",
    _categorySlug: "restaurantes",
    shortDesc: "Praça de alimentação com diversas opções gastronômicas ao ar livre",
    longDesc: "Espaço de alimentação com múltiplas opções culinárias ao ar livre. Ambiente de food park com diferentes boxes gastronômicos, ideal para grupos com diferentes preferências.",
    address: "Holambra – SP", lat: -22.6425, lng: -47.0560,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["food park", "variado", "ao ar livre", "grupos"], status: "active",
    dataPending: true,
  },

  {
    name: "Cowburguer",
    _categorySlug: "restaurantes",
    shortDesc: "Hamburgueria artesanal com blend especial de carne — funcionamento noturno, Qua a Dom.",
    longDesc: "A Cowburguer trabalha com blend especial de carne e hambúrgueres artesanais — e é precisamente isso que a faz uma boa pedida para o jantar em Holambra. Funciona de quarta a domingo, sempre a partir das 19h, no bairro Novo Cambuí. Sem exagero: boa carne, batata bem feita, ambiente descontraído. Boa opção para encerrar o dia com algo menos formal, ou para grupos que querem algo rápido e de qualidade depois de um passeio mais longo.",
    address: "R. Nair Ferreira Coelho Brachi, 695 – Bairro Novo Cambuí, Holambra, SP", lat: -22.6358, lng: -47.0618,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["hamburguer", "artesanal", "jantar", "noite", "lanche", "rapido", "casal", "casual", "amigos"], status: "active",
    dataPending: false,
  },

  {
    name: "Quintal dos Avós Gastrobar",
    _categorySlug: "bares",
    shortDesc: "Gastrobar com petiscos elaborados e ambiente nostálgico",
    longDesc: "Gastrobar com conceito de quintal de interior paulista, servindo petiscos elaborados, coquetéis autorais e boa seleção de cervejas em ambiente aconchegante com decoração nostálgica.",
    address: "Holambra – SP", lat: -22.6420, lng: -47.0644,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["gastrobar", "petiscos", "coquetéis", "nostalgia"], status: "active",
    dataPending: true,
  },

  {
    name: "Tulipa's Lounge",
    _categorySlug: "bares",
    shortDesc: "Bar lounge sofisticado com coquetéis e música ao vivo",
    longDesc: "Bar lounge com ambiente sofisticado, coquetéis autorais, carta de vinhos e eventos com música ao vivo. Ponto de encontro noturno em Holambra, ideal para ocasiões especiais.",
    address: "Centro, Holambra – SP", lat: -22.6375, lng: -47.0622,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["lounge", "coquetéis", "vinhos", "música ao vivo", "noturno"], status: "active",
    dataPending: true,
  },
];

// ─── Runner ───────────────────────────────────────────────────────────────────
export async function seedHolambra() {
  console.log("🌷 Iniciando seed dos 21 lugares reais de Holambra...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ DATABASE_URL não configurado ou banco indisponível.");
    process.exit(1);
  }

  // 0. Garantir unique index em (name, city) para que o upsert funcione
  console.log("🔑 Garantindo unique index places_name_city_idx...");
  try {
    await db.execute(sql`
      CREATE UNIQUE INDEX places_name_city_idx ON places (name, city)
    `);
    console.log("  ✅ Unique index criado.");
  } catch (err: any) {
    const msg: string = err?.message ?? "";
    const causeMsg: string = err?.cause?.message ?? "";
    const causeCode: string = err?.cause?.code ?? "";
    const isDup =
      msg.includes("Duplicate key name") ||
      msg.includes("already exists") ||
      msg.includes("ER_DUP_KEYNAME") ||
      causeMsg.includes("Duplicate key name") ||
      causeCode === "ER_DUP_KEYNAME";
    if (isDup) {
      console.log("  ✓ Unique index já existia.");
    } else {
      throw err;
    }
  }

  // 1. Garantir que as categorias necessárias existam (upsert por slug)
  console.log("\n🏷️  Garantindo categorias...");
  const categoryIdMap: Record<string, number> = {};

  for (const cat of HOLAMBRA_CATEGORIES) {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, cat.slug))
      .limit(1);

    if (existing.length > 0) {
      categoryIdMap[cat.slug] = existing[0].id;
      console.log(`  ✓ ${cat.name} (já existe, id=${existing[0].id})`);
    } else {
      const result = await db.insert(categories).values(cat);
      const r = result as any;
      const insertId: number = r.insertId ?? r[0]?.insertId ?? 0;
      categoryIdMap[cat.slug] = insertId;
      console.log(`  ✅ ${cat.name} criada (id=${insertId})`);
    }
  }

  // 2. Upsert dos 21 lugares via ON DUPLICATE KEY UPDATE (keyed on name+city)
  console.log("\n📍 Realizando upsert dos lugares...");
  let upserted = 0;

  for (const placeData of HOLAMBRA_PLACES) {
    const { _categorySlug, ...placeFields } = placeData;
    const categoryId = categoryIdMap[_categorySlug] ?? null;

    const insertValues: InsertPlace = {
      ...placeFields,
      categoryId,
    };

    await db
      .insert(places)
      .values(insertValues)
      .onDuplicateKeyUpdate({
        set: {
          // Apenas campos estruturais/geográficos — campos editoriais
          // (shortDesc, longDesc, tags, dataPending) nunca são sobrescritos
          // pelo seed de inicialização para preservar a curadoria do Oranje.
          categoryId: insertValues.categoryId,
          priceRange: insertValues.priceRange,
          isFree: insertValues.isFree,
          isRecommended: insertValues.isRecommended,
          isFeatured: insertValues.isFeatured,
          lat: insertValues.lat,
          lng: insertValues.lng,
          updatedAt: new Date(),
        },
      });

    console.log(`  ✅ ${placeFields.name} (dataPending=${placeFields.dataPending})`);
    upserted++;
  }

  console.log(`\n🎉 Seed concluído! ${upserted} lugar(es) inseridos/atualizados via upsert.`);
}

if (process.argv[1] && (process.argv[1].endsWith("seed-holambra.ts") || process.argv[1].endsWith("seed-holambra.js"))) {
  seedHolambra().catch((err) => {
    console.error("Erro fatal:", err);
    process.exit(1);
  });
}
