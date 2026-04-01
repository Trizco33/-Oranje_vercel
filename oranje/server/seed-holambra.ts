/**
 * seed-holambra.ts
 *
 * Script idempotente para inserir os 21 lugares reais confirmados de Holambra, SP.
 * Pode ser executado múltiplas vezes sem duplicar dados (upsert por nome+cidade).
 *
 * Uso:
 *   DATABASE_URL=mysql://... npx tsx server/seed-holambra.ts
 *
 * Regras:
 * - Apenas dados publicamente confirmáveis são inseridos
 * - Campos sem informação pública ficam null (endereço, lat/lng, telefone, etc.)
 * - Categorias são criadas se ainda não existirem no banco
 */

import { getDb } from "./db";
import { eq, and } from "drizzle-orm";
import { categories, places, type InsertCategory, type InsertPlace } from "../drizzle/schema";

// ─── Categorias necessárias para os 21 lugares ────────────────────────────────
// Slugs alinhados com CATEGORY_SLUGS do frontend (client/src/constants/categories.ts)
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
// Campos null = informação pública não confirmável
interface PlaceWithCategorySlug extends Omit<InsertPlace, "categoryId"> {
  _categorySlug: string;
}

const HOLAMBRA_PLACES: PlaceWithCategorySlug[] = [
  // ── Alta prioridade ───────────────────────────────────────────────────────

  {
    name: "Casa Bela Restaurante",
    _categorySlug: "restaurantes",
    shortDesc: "Culinária variada em ambiente familiar no centro de Holambra",
    longDesc: "Restaurante tradicional de Holambra com cardápio variado, servindo pratos executivos e à la carte. Ambiente acolhedor e familiar, frequentado por moradores e turistas.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["almoço", "família", "executivo"], status: "active",
  },

  {
    name: "Restaurante Villa Girassol",
    _categorySlug: "restaurantes",
    shortDesc: "Gastronomia com vista para campos de flores",
    longDesc: "Restaurante com culinária regional e internacional, conhecido pelo ambiente tranquilo e vista privilegiada para os campos floridos de Holambra.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["regional", "almoço", "natureza"], status: "active",
  },

  {
    name: "Restaurante e Cervejaria Holambier",
    _categorySlug: "bares",
    shortDesc: "Cervejaria artesanal com rótulos próprios e culinária de boteco",
    longDesc: "A Holambier é a principal cervejaria artesanal de Holambra, produzindo cervejas com identidade local. Serve petiscos e pratos de boteco em ambiente animado com música ao vivo.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["cerveja artesanal", "petiscos", "boteco", "música ao vivo"], status: "active",
  },

  {
    name: "Lotus Café",
    _categorySlug: "cafes",
    shortDesc: "Café especialidade com ambiente minimalista e bolos artesanais",
    longDesc: "Cafeteria com foco em café de especialidade, bolos artesanais e tortas. Ambiente tranquilo e aconchegante, perfeito para uma pausa no dia. Produtos frescos preparados diariamente.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["café especial", "bolos", "tortas"], status: "active",
  },

  {
    name: "Dolce Flor Holambra",
    _categorySlug: "docerias",
    shortDesc: "Doceria com chocolates e doces com tema floral",
    longDesc: "Doceria especializada em chocolates finos, trufas e doces com temática floral, perfeitos como lembrança de Holambra. Produtos artesanais com embalagem especial para presente.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["chocolates", "trufas", "flores", "presentes"], status: "active",
  },

  {
    name: "Kéndi Confeitaria",
    _categorySlug: "cafes",
    shortDesc: "Confeitaria artesanal com doces finos e café da manhã caprichado",
    longDesc: "Confeitaria com produção artesanal de doces finos, tortas, pães e café da manhã completo. Ambiente charmoso com produtos frescos preparados diariamente.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["confeitaria", "doces finos", "café da manhã", "tortas"], status: "active",
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
  },

  {
    name: "Holambra Garden Hotel",
    _categorySlug: "hoteis",
    shortDesc: "Hotel boutique com jardins e café da manhã holandês",
    longDesc: "Hotel boutique com jardins bem cuidados, quartos confortáveis e café da manhã com inspiração holandesa. Localização privilegiada próxima ao centro de Holambra.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["hotel boutique", "jardins", "café da manhã", "holandês"], status: "active",
  },

  {
    name: "Bloemen Park",
    _categorySlug: "parques",
    shortDesc: "Parque de flores e atrações com eventos temáticos holandeses",
    longDesc: "O Bloemen Park é um dos principais parques turísticos de Holambra, com campos de flores, moinhos decorativos, área de lazer infantil e eventos temáticos com cultura holandesa ao longo do ano. Atração paga.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["flores", "família", "eventos", "holandês", "turismo"], status: "active",
  },

  {
    name: "Parque Van Gogh",
    _categorySlug: "parques",
    shortDesc: "Parque público com jardins floridos de entrada gratuita",
    longDesc: "O Parque Van Gogh é um espaço público de Holambra com jardins floridos, área de descanso e espaços para piquenique. Inspirado no pintor Vincent van Gogh, tem entrada gratuita e é muito frequentado por famílias e turistas.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "gratuito", isFree: true,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["gratuito", "flores", "família", "piquenique", "fotos"], status: "active",
  },

  {
    name: "Macena Flores",
    _categorySlug: "parques",
    shortDesc: "Floricultural e parque de flores aberto para visitação",
    longDesc: "Floricultural e espaço de atrações florais com campos de tulipas, girassóis e outras flores sazonais. Popular para visitação e fotos, com venda de flores e plantas para levar para casa.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["flores", "tulipas", "girassóis", "fotos", "floricultura"], status: "active",
  },

  // ── Média prioridade ──────────────────────────────────────────────────────

  {
    name: "Garden Restaurante",
    _categorySlug: "restaurantes",
    shortDesc: "Restaurante ao ar livre com jardim e culinária variada",
    longDesc: "Restaurante em ambiente de jardim, ideal para almoços em família. Cardápio com pratos regionais e opções internacionais em espaço amplo e verde.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["jardim", "almoço", "família", "ao ar livre"], status: "active",
  },

  {
    name: "De Immigrant Garden",
    _categorySlug: "restaurantes",
    shortDesc: "Culinária temática da imigração holandesa em ambiente de jardim",
    longDesc: "Restaurante com temática da imigração holandesa, servindo pratos inspirados na culinária dos imigrantes holandeses que fundaram Holambra. Ambiente charmoso com decoração típica e jardim.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["holandês", "imigração", "jardim", "temático"], status: "active",
  },

  {
    name: "De Pizza Bakker",
    _categorySlug: "pizzarias",
    shortDesc: "Pizzaria artesanal com massas preparadas artesanalmente",
    longDesc: "Pizzaria com massa artesanal fermentada, molhos caseiros e ingredientes selecionados. O nome une a tradição italiana da pizza com o espírito holandês da padaria (bakker).",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["pizza artesanal", "massa fermentada", "italiana"], status: "active",
  },

  {
    name: "Amarena Doceria & Café",
    _categorySlug: "docerias",
    shortDesc: "Doceria e café com especialidades italianas e brasileiras",
    longDesc: "Doceria e café com cardápio de inspiração italiana e brasileira: cannoli, panna cotta, brigadeiros gourmet e cafés especiais. Ambiente sofisticado e aconchegante.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["italiano", "cannoli", "brigadeiro", "café gourmet"], status: "active",
  },

  {
    name: "Kopenhagen Holambra",
    _categorySlug: "docerias",
    shortDesc: "Loja da famosa chocolateria brasileira Kopenhagen",
    longDesc: "Unidade da Kopenhagen, uma das mais renomadas marcas de chocolates do Brasil, com linha completa de bombons, trufas, paçocas e presentes especiais para todas as ocasiões.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["chocolates", "bombons", "trufas", "presentes", "kopenhagen"], status: "active",
  },

  {
    name: "Italia no Box",
    _categorySlug: "restaurantes",
    shortDesc: "Comida italiana em formato box e pratos executivos",
    longDesc: "Restaurante italiano com opções práticas em formato de box. Pratos rápidos e saborosos com massas, risottos e especialidades da cozinha italiana para comer no local ou levar.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["italiano", "massas", "rápido", "delivery"], status: "active",
  },

  {
    name: "Food Garden Holambra",
    _categorySlug: "restaurantes",
    shortDesc: "Praça de alimentação com diversas opções gastronômicas ao ar livre",
    longDesc: "Espaço de alimentação com múltiplas opções culinárias ao ar livre. Ambiente de food park com diferentes boxes gastronômicos, ideal para grupos com diferentes preferências.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["food park", "variado", "ao ar livre", "grupos"], status: "active",
  },

  {
    name: "Cowburguer",
    _categorySlug: "restaurantes",
    shortDesc: "Hamburgueria artesanal com blend especial de carne",
    longDesc: "Hamburgueria com foco em hambúrgueres artesanais de blend especial, batata frita crocante e sucos naturais. Ambiente descontraído, ideal para uma refeição rápida e saborosa.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["hambúrguer", "artesanal", "lanche", "rápido"], status: "active",
  },

  {
    name: "Quintal dos Avós Gastrobar",
    _categorySlug: "bares",
    shortDesc: "Gastrobar com petiscos elaborados e ambiente nostálgico",
    longDesc: "Gastrobar com conceito de quintal de interior paulista, servindo petiscos elaborados, coquetéis autorais e boa seleção de cervejas em ambiente aconchegante com decoração nostálgica.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["gastrobar", "petiscos", "coquetéis", "nostalgia"], status: "active",
  },

  {
    name: "Tulipa's Lounge",
    _categorySlug: "bares",
    shortDesc: "Bar lounge sofisticado com coquetéis e música ao vivo",
    longDesc: "Bar lounge com ambiente sofisticado, coquetéis autorais, carta de vinhos e eventos com música ao vivo. Ponto de encontro noturno em Holambra, ideal para ocasiões especiais.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["lounge", "coquetéis", "vinhos", "música ao vivo", "noturno"], status: "active",
  },
];

// ─── Runner ───────────────────────────────────────────────────────────────────
async function seedHolambra() {
  console.log("🌷 Iniciando seed dos 21 lugares reais de Holambra...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ DATABASE_URL não configurado ou banco indisponível.");
    process.exit(1);
  }

  // 1. Garantir que as categorias necessárias existam
  console.log("🏷️  Garantindo categorias...");
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
      const insertId = (result as unknown as [{ insertId: number }])[0]?.insertId ?? 0;
      categoryIdMap[cat.slug] = insertId;
      console.log(`  ✅ ${cat.name} criada (id=${insertId})`);
    }
  }

  // 2. Inserir / pular lugares (idempotente por nome+cidade)
  console.log("\n📍 Inserindo lugares...");
  let inserted = 0;
  let skipped = 0;

  for (const placeData of HOLAMBRA_PLACES) {
    const { _categorySlug, ...placeFields } = placeData;

    const existing = await db
      .select()
      .from(places)
      .where(
        and(
          eq(places.name, placeFields.name),
          eq(places.city, placeFields.city ?? "Holambra")
        )
      )
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ↩  ${placeFields.name} (já existe)`);
      skipped++;
      continue;
    }

    await db.insert(places).values({
      ...placeFields,
      categoryId: categoryIdMap[_categorySlug] ?? null,
    });
    console.log(`  ✅ ${placeFields.name}`);
    inserted++;
  }

  console.log(`\n🎉 Seed concluído! ${inserted} lugar(es) inserido(s), ${skipped} já existiam.`);
}

seedHolambra().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
