import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { siteContent, categories, places, type InsertSiteContent, type InsertCategory, type InsertPlace } from "../drizzle/schema";

const ADMIN_USER_ID = 1;

// ─── Site Content padrão ──────────────────────────────────────────────────────
// Usa chaves individuais (hero_title, contact_email, etc) para consistência
// com o content.router.ts que lê/grava no mesmo formato.
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

// ─── Categorias — slugs alinhados com CATEGORY_SLUGS do frontend ──────────────
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

// ─── 21 Lugares reais de Holambra ─────────────────────────────────────────────
// Apenas dados publicamente confirmáveis. Campos sem informação pública ficam null.
const DEFAULT_PLACES: Omit<InsertPlace, "categoryId">[] = [
  // ── Restaurantes ──────────────────────────────────────────────────────────
  {
    name: "Casa Bela Restaurante",
    shortDesc: "Culinária variada em ambiente familiar no centro de Holambra",
    longDesc: "Restaurante tradicional de Holambra com cardápio variado, servindo pratos executivos e à la carte. Ambiente acolhedor e familiar, frequentado por moradores e turistas.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false, isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["almoço", "família", "executivo"], status: "active",
  },
  {
    name: "Restaurante Villa Girassol",
    shortDesc: "Gastronomia com vista para campos de flores",
    longDesc: "Restaurante com culinária regional e internacional, conhecido pelo ambiente tranquilo e vista privilegiada para os campos floridos de Holambra.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false, isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["regional", "almoço", "natureza"], status: "active",
  },
  {
    name: "Garden Restaurante",
    shortDesc: "Restaurante ao ar livre com jardim e culinária variada",
    longDesc: "Restaurante em ambiente de jardim, ideal para almoços em família. Cardápio com pratos regionais e opções internacionais em espaço amplo e verde.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false, isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["jardim", "almoço", "família"], status: "active",
  },
  {
    name: "De Immigrant Garden",
    shortDesc: "Culinária temática holandesa em ambiente de jardim",
    longDesc: "Restaurante com temática da imigração holandesa, servindo pratos inspirados na culinária dos imigrantes. Ambiente charmoso com decoração típica e jardim.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false, isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["holandês", "imigração", "jardim"], status: "active",
  },
  {
    name: "Italia no Box",
    shortDesc: "Comida italiana em formato box e pratos executivos",
    longDesc: "Restaurante italiano com opções práticas em formato de box. Pratos rápidos e saborosos com massas, risottos e especialidades da cozinha italiana.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false, isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["italiano", "massas", "rápido"], status: "active",
  },
  {
    name: "Food Garden Holambra",
    shortDesc: "Praça de alimentação com diversas opções gastronômicas",
    longDesc: "Espaço de alimentação com múltiplas opções culinárias ao ar livre. Ambiente de food park com diferentes boxes gastronômicos em Holambra.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false, isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["food park", "variado", "ao ar livre"], status: "active",
  },
  {
    name: "Cowburguer",
    shortDesc: "Hamburgueria artesanal com blend especial",
    longDesc: "Hamburgueria com foco em hambúrgueres artesanais de blend especial, batata frita crocante e sucos naturais. Ambiente descontraído.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false, isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["hambúrguer", "artesanal", "lanche"], status: "active",
  },
  // ── Bares & Cervejarias ────────────────────────────────────────────────────
  {
    name: "Restaurante e Cervejaria Holambier",
    shortDesc: "Cervejaria artesanal com rótulos próprios e culinária de boteco",
    longDesc: "A Holambier é a principal cervejaria artesanal de Holambra, produzindo cervejas com identidade local. Serve petiscos e pratos de boteco em ambiente animado.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false, isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["cerveja artesanal", "petiscos", "boteco"], status: "active",
  },
  {
    name: "Quintal dos Avós Gastrobar",
    shortDesc: "Gastrobar com petiscos elaborados e ambiente nostálgico",
    longDesc: "Gastrobar com conceito de quintão de interior paulista, servindo petiscos elaborados, coquetéis autorais e boa seleção de cervejas em ambiente aconchegante.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false, isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["gastrobar", "petiscos", "coquetéis"], status: "active",
  },
  {
    name: "Tulipa's Lounge",
    shortDesc: "Bar lounge sofisticado com coquetéis e música ao vivo",
    longDesc: "Bar lounge com ambiente sofisticado, coquetéis autorais, carta de vinhos e eventos com música ao vivo. Ponto de encontro noturno em Holambra.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$$", isFree: false, isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["lounge", "coquetéis", "vinhos", "música ao vivo"], status: "active",
  },
  // ── Cafés & Confeitarias ──────────────────────────────────────────────────
  {
    name: "Lotus Café",
    shortDesc: "Café especialidade com ambiente minimalista e bolos artesanais",
    longDesc: "Cafeteria com foco em café de especialidade, bolos artesanais e tortas. Ambiente tranquilo e aconchegante, perfeito para uma pausa no dia.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false, isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["café especial", "bolos", "tortas"], status: "active",
  },
  {
    name: "Kéndi Confeitaria",
    shortDesc: "Confeitaria artesanal com doces finos e café da manhã caprichado",
    longDesc: "Confeitaria com produção artesanal de doces finos, tortas, pães e café da manhã. Ambiente charmoso com produtos frescos preparados diariamente.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false, isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["confeitaria", "doces finos", "café da manhã"], status: "active",
  },
  // ── Docerias ──────────────────────────────────────────────────────────────
  {
    name: "Dolce Flor Holambra",
    shortDesc: "Doceria com chocolates e doces com tema floral",
    longDesc: "Doceria especializada em chocolates finos, trufas e doces com temática floral, perfeitos como lembrança de Holambra. Produtos artesanais e embalagem especial.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false, isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["chocolates", "trufas", "flores", "presentes"], status: "active",
  },
  {
    name: "Amarena Doceria & Café",
    shortDesc: "Doceria e café com especialidades italianas e brasileiras",
    longDesc: "Doceria e café com cardápio de inspiração italiana e brasileira: cannoli, panna cotta, brigadeiros gourmet e cafés especiais. Ambiente sofisticado.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false, isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["italiano", "cannoli", "brigadeiro", "café"], status: "active",
  },
  {
    name: "Kopenhagen Holambra",
    shortDesc: "Loja da famosa chocolateria brasileira Kopenhagen",
    longDesc: "Unidade da Kopenhagen, uma das mais renomadas marcas de chocolates do Brasil, com linha completa de bombons, trufas e presentes especiais.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false, isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["chocolates", "bombons", "presentes"], status: "active",
  },
  // ── Pizzarias ─────────────────────────────────────────────────────────────
  {
    name: "De Pizza Bakker",
    shortDesc: "Pizzaria artesanal com massas preparadas artesanalmente",
    longDesc: "Pizzaria com massa artesanal fermentada, molhos caseiros e ingredientes selecionados. Nome une a tradição italiana da pizza com o espírito holandês da padaria (bakker).",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false, isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["pizza artesanal", "massa fermentada", "delivery"], status: "active",
  },
  // ── Hotéis ────────────────────────────────────────────────────────────────
  {
    name: "Royal Tulip Holambra",
    shortDesc: "Hotel 4 estrelas com spa, piscina e ampla área verde em Holambra",
    longDesc: "O Royal Tulip Holambra é o principal hotel de alto padrão da cidade. Com spa completo, piscina aquecida, restaurante interno e vistas para jardins floridos, é a referência em hospedagem premium em Holambra.",
    address: "Rua dos Eucaliptos, 396, Holambra – SP",
    lat: -22.6444, lng: -47.0602,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$$", isFree: false, isRecommended: true, isFeatured: true, isPartner: false,
    website: "https://www.royaltulipholambra.com.br",
    tags: ["hotel 4 estrelas", "spa", "piscina", "luxo"], status: "active",
  },
  {
    name: "Holambra Garden Hotel",
    shortDesc: "Hotel boutique com jardins e café da manhã holandês",
    longDesc: "Hotel boutique com jardins bem cuidados, quartos confortáveis e café da manhã com inspiração holandesa. Localização privilegiada próxima ao centro de Holambra.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false, isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["hotel boutique", "jardins", "café da manhã"], status: "active",
  },
  // ── Parques & Atrações ────────────────────────────────────────────────────
  {
    name: "Bloemen Park",
    shortDesc: "Parque de flores e atrações com eventos temáticos holandeses",
    longDesc: "O Bloemen Park é um dos principais parques turísticos de Holambra, com campos de flores, moinhos decorativos, área de lazer infantil e eventos temáticos com cultura holandesa ao longo do ano.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false, isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["flores", "família", "eventos", "holandês"], status: "active",
  },
  {
    name: "Parque Van Gogh",
    shortDesc: "Parque público com jardins floridos de entrada gratuita",
    longDesc: "O Parque Van Gogh é um espaço público de Holambra com jardins floridos, área de descanso e espaços para piquenique. Inspirado no pintor Vincent van Gogh, a entrada é gratuita.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "gratuito", isFree: true, isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["gratuito", "flores", "família", "piquenique"], status: "active",
  },
  {
    name: "Macena Flores",
    shortDesc: "Floricultural e parque de flores aberto para visitação",
    longDesc: "Floricultural e espaço de atrações florais com campos de tulipas, girassóis e outras flores sazonais. Popular para visitação e fotos, com venda de flores e plantas.",
    address: null, lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false, isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["flores", "tulipas", "girassóis", "fotos"], status: "active",
  },
];

// Mapa de posição → slug da categoria (mesma ordem que DEFAULT_PLACES)
const PLACE_CATEGORY_SLUGS: string[] = [
  "restaurantes", "restaurantes", "restaurantes", "restaurantes", "restaurantes", "restaurantes", "restaurantes",
  "bares", "bares", "bares",
  "cafes", "cafes",
  "docerias", "docerias", "docerias",
  "pizzarias",
  "hoteis", "hoteis",
  "parques", "parques", "parques",
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
    const categoryIdMap: Record<string, number> = {};

    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, cat.slug))
        .limit(1);

      if (existing.length === 0) {
        const result = await db.insert(categories).values(cat);
        const insertId = (result as unknown as [{ insertId: number }])[0]?.insertId ?? 0;
        categoryIdMap[cat.slug] = insertId;
        console.log(`  ✅ Categoria: ${cat.name} (id=${insertId})`);
      } else {
        categoryIdMap[cat.slug] = existing[0].id;
      }
    }

    console.log("📍 Verificando lugares de Holambra...");
    for (let i = 0; i < DEFAULT_PLACES.length; i++) {
      const placeData = DEFAULT_PLACES[i];
      const categorySlug = PLACE_CATEGORY_SLUGS[i];

      const existing = await db
        .select()
        .from(places)
        .where(eq(places.name, placeData.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(places).values({
          ...placeData,
          categoryId: categoryIdMap[categorySlug] ?? null,
        });
        console.log(`  ✅ Lugar: ${placeData.name}`);
      }
    }

    console.log("🎉 Seed concluído!");
  } catch (error) {
    console.error("⚠️  Erro ao fazer seed (não crítico):", error);
  }
}
