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

// ─── Categorias de Holambra ───────────────────────────────────────────────────
const DEFAULT_CATEGORIES: InsertCategory[] = [
  { name: "Restaurantes",       slug: "restaurantes",      icon: "🍽️",  description: "Restaurantes, lanchonetes e culinária local", isActive: true },
  { name: "Pontos Turísticos",  slug: "pontos-turisticos", icon: "🌸",  description: "Atrações e pontos de interesse de Holambra", isActive: true },
  { name: "Floriculturas",      slug: "floriculturas",     icon: "💐",  description: "Floriculturas, estufas e viveiros", isActive: true },
  { name: "Hospedagem",         slug: "hospedagem",        icon: "🏨",  description: "Hotéis, pousadas e hospedagem", isActive: true },
  { name: "Bares & Cafés",      slug: "bares-cafes",       icon: "☕",  description: "Bares, cafeterias e pubs", isActive: true },
  { name: "Lojas & Artesanato", slug: "lojas-artesanato",  icon: "🛍️", description: "Lojas, souvenirs e artesanato holandês", isActive: true },
  { name: "Espaços de Eventos", slug: "espacos-eventos",   icon: "🎪",  description: "Salões, haras e espaços para eventos", isActive: true },
  { name: "Lazer & Natureza",   slug: "lazer-natureza",    icon: "🌳",  description: "Parques, trilhas e espaços de lazer", isActive: true },
];

// ─── 21 Lugares reais de Holambra ─────────────────────────────────────────────
const DEFAULT_PLACES: Omit<InsertPlace, "categoryId">[] = [
  // ── Restaurantes ──────────────────────────────────────────────────────────
  {
    name: "Restaurante Fazenda Holambra",
    shortDesc: "Culinária rural e típica holandesa em ambiente de fazenda",
    longDesc: "Restaurante com cardápio que mescla o tradicional caipira com influências holandesas. Ambiente rústico, amplo e familiar à beira da fazenda.",
    address: "Estrada Municipal, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6373, lng: -47.0580,
    priceRange: "$$", openingHours: "Seg–Dom: 11h–16h",
    mapsUrl: "https://maps.google.com/?q=Restaurante+Fazenda+Holambra",
    isRecommended: true, isFeatured: true, isFree: false, isPartner: false,
    tags: ["almoço", "culinária holandesa", "família"], status: "active",
  },
  {
    name: "Restaurante Tulipa",
    shortDesc: "Especialidades em massas e pratos holandeses no centro",
    longDesc: "Restaurante tradicional com especialidades holandesas como stroopwafels e haringbroodje, além de massas artesanais.",
    address: "Rua das Flores, 45, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6380, lng: -47.0564,
    priceRange: "$$", openingHours: "Ter–Dom: 11h30–15h e 18h–22h",
    mapsUrl: "https://maps.google.com/?q=Restaurante+Tulipa+Holambra",
    isRecommended: true, isFeatured: false, isFree: false, isPartner: false,
    tags: ["massas", "culinária holandesa", "jantar"], status: "active",
  },
  {
    name: "Cantina do Coreto",
    shortDesc: "Petiscos, frutos do mar e cerveja gelada no coração da cidade",
    longDesc: "Bar e cantina no centro histórico com menu de petiscos variados, frutos do mar e boa seleção de cervejas artesanais.",
    address: "Praça 22 de Agosto, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6366, lng: -47.0555,
    priceRange: "$", openingHours: "Qui–Dom: 11h–23h",
    mapsUrl: "https://maps.google.com/?q=Cantina+do+Coreto+Holambra",
    isRecommended: false, isFeatured: false, isFree: false, isPartner: false,
    tags: ["petiscos", "cerveja artesanal", "bar"], status: "active",
  },
  // ── Pontos Turísticos ─────────────────────────────────────────────────────
  {
    name: "Lago dos Patos",
    shortDesc: "Lago artificial com ciclovia, pesca e área de lazer",
    longDesc: "Ponto de lazer com lago artificial, ciclovia ao redor, área para pesca esportiva e churrasqueiras. Muito frequentado por famílias nos fins de semana.",
    address: "Av. Holambra II, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6340, lng: -47.0610,
    priceRange: "gratuito", openingHours: "Aberto 24h",
    mapsUrl: "https://maps.google.com/?q=Lago+dos+Patos+Holambra",
    isRecommended: true, isFeatured: true, isFree: true, isPartner: false,
    tags: ["lazer", "pesca", "ciclovia", "família"], status: "active",
  },
  {
    name: "Cooperativa Holambra (VEILING)",
    shortDesc: "Maior cooperativa de flores do Brasil — visitas guiadas",
    longDesc: "A Cooperativa Holambra – VEILING é a maior central de comercialização de flores e plantas do Brasil. Oferece visitas guiadas e é o coração econômico da cidade.",
    address: "Rod. SP-107, Km 3, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6420, lng: -47.0630,
    priceRange: "$", openingHours: "Seg–Sex: 8h–12h (visitas guiadas)",
    website: "https://www.veilingholambra.com.br",
    mapsUrl: "https://maps.google.com/?q=Veiling+Holambra",
    isRecommended: true, isFeatured: true, isFree: false, isPartner: false,
    tags: ["flores", "cooperativa", "turismo agrícola"], status: "active",
  },
  {
    name: "Praça 22 de Agosto",
    shortDesc: "Centro histórico com o coreto e arquitetura holandesa",
    longDesc: "Praça principal de Holambra, com o coreto histórico, arquitetura de inspiração holandesa, espaços para eventos e ponto de encontro da comunidade.",
    address: "Praça 22 de Agosto, Centro, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6367, lng: -47.0557,
    priceRange: "gratuito", openingHours: "Aberto 24h",
    mapsUrl: "https://maps.google.com/?q=Praça+22+de+Agosto+Holambra",
    isRecommended: true, isFeatured: false, isFree: true, isPartner: false,
    tags: ["centro histórico", "arquitetura holandesa", "eventos"], status: "active",
  },
  {
    name: "Moinho de Vento",
    shortDesc: "Símbolo icônico de Holambra, réplica de moinho holandês",
    longDesc: "Réplica funcional de moinho de vento holandês, símbolo cultural da cidade. Ponto fotográfico mais conhecido de Holambra e marco da imigração holandesa.",
    address: "Av. Holambra, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6360, lng: -47.0548,
    priceRange: "gratuito", openingHours: "Sempre visível",
    mapsUrl: "https://maps.google.com/?q=Moinho+de+Vento+Holambra",
    isRecommended: true, isFeatured: true, isFree: true, isPartner: false,
    tags: ["moinho", "fotografia", "cultura holandesa", "ícone"], status: "active",
  },
  {
    name: "Igreja Matriz Nossa Sra. de Fátima",
    shortDesc: "Igreja principal de Holambra com arquitetura contemporânea",
    longDesc: "A Igreja Matriz de Nossa Senhora de Fátima é o principal templo católico de Holambra. Arquitetura moderna com vitrais artísticos.",
    address: "Rua Princesa Beatriz, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6362, lng: -47.0552,
    priceRange: "gratuito", openingHours: "Missas conforme programação",
    mapsUrl: "https://maps.google.com/?q=Igreja+Matriz+Holambra",
    isRecommended: false, isFeatured: false, isFree: true, isPartner: false,
    tags: ["igreja", "patrimônio", "cultura"], status: "active",
  },
  // ── Floriculturas ─────────────────────────────────────────────────────────
  {
    name: "Estação das Flores",
    shortDesc: "Floricultura e estufa com centenas de espécies para venda direta",
    longDesc: "A maior floricultura aberta ao público de Holambra, com estufas repletas de flores tropicais, rosas, orquídeas e plantas ornamentais. Venda no atacado e varejo.",
    address: "Rod. SP-107, Km 8, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6410, lng: -47.0650,
    priceRange: "$", openingHours: "Ter–Dom: 8h–17h",
    mapsUrl: "https://maps.google.com/?q=Estação+das+Flores+Holambra",
    isRecommended: true, isFeatured: false, isFree: false, isPartner: false,
    tags: ["flores", "orquídeas", "plantas", "estufas"], status: "active",
  },
  {
    name: "Rancho das Orquídeas",
    shortDesc: "Especialistas em orquídeas nativas e exóticas",
    longDesc: "Rancho especializado em orquídeas nativas do Brasil e espécies exóticas importadas. Visitas e cursos de cultivo disponíveis aos finais de semana.",
    address: "Estrada Vicinal, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6450, lng: -47.0590,
    priceRange: "$", openingHours: "Sáb–Dom: 9h–16h",
    mapsUrl: "https://maps.google.com/?q=Rancho+das+Orquídeas+Holambra",
    isRecommended: false, isFeatured: false, isFree: false, isPartner: false,
    tags: ["orquídeas", "flores exóticas", "cursos"], status: "active",
  },
  // ── Hospedagem ────────────────────────────────────────────────────────────
  {
    name: "Pousada Tulipas de Holambra",
    shortDesc: "Pousada charmosa com decoração holandesa e café da manhã caprichado",
    longDesc: "Pousada boutique com 12 suítes decoradas com temática holandesa. Café da manhã completo com queijos, pães e frios importados. A 5 min do centro.",
    address: "Rua das Tulipas, 120, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6345, lng: -47.0540,
    priceRange: "$$", openingHours: "Check-in: 14h | Check-out: 12h",
    mapsUrl: "https://maps.google.com/?q=Pousada+Tulipas+Holambra",
    isRecommended: true, isFeatured: false, isFree: false, isPartner: false,
    tags: ["pousada", "hospedagem", "café da manhã"], status: "active",
  },
  {
    name: "Hotel Fazenda Windmill",
    shortDesc: "Resort rural com piscina, cavalos e paisagem de campos de flores",
    longDesc: "Hotel fazenda com ampla área verde, piscina aquecida, passeios a cavalo e vista para campos de flores. Ideal para famílias e casais em busca de tranquilidade.",
    address: "Estrada da Fazenda, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6500, lng: -47.0700,
    priceRange: "$$$", openingHours: "Recepção 24h",
    mapsUrl: "https://maps.google.com/?q=Hotel+Fazenda+Windmill+Holambra",
    isRecommended: true, isFeatured: true, isFree: false, isPartner: false,
    tags: ["hotel fazenda", "resort", "piscina", "família"], status: "active",
  },
  // ── Bares & Cafés ─────────────────────────────────────────────────────────
  {
    name: "Café Holândia",
    shortDesc: "Café temático com stroopwafels, waffles e café especial",
    longDesc: "Cafeteria boutique com ambiente aconchegante de casinha holandesa. Servem café especial, cappuccinos, waffles belgas e o famoso stroopwafel artesanal.",
    address: "Rua da Paz, 22, Centro, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6368, lng: -47.0553,
    priceRange: "$", openingHours: "Ter–Dom: 8h–18h",
    mapsUrl: "https://maps.google.com/?q=Café+Holândia+Holambra",
    isRecommended: true, isFeatured: false, isFree: false, isPartner: false,
    tags: ["café", "waffles", "stroopwafel", "sobremesas"], status: "active",
  },
  {
    name: "Bar do Rosi",
    shortDesc: "Bar tradicional com petiscos e ambiente familiar",
    longDesc: "Um dos bares mais queridos da cidade, o Bar do Rosi serve petiscos fartos, caldo de mocotó e a melhor caipirinha de Holambra. Ambiente descontraído.",
    address: "Rua das Acácias, 88, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6375, lng: -47.0570,
    priceRange: "$", openingHours: "Qui–Dom: 17h–00h",
    mapsUrl: "https://maps.google.com/?q=Bar+do+Rosi+Holambra",
    isRecommended: false, isFeatured: false, isFree: false, isPartner: false,
    tags: ["bar", "petiscos", "caipirinha"], status: "active",
  },
  // ── Lojas & Artesanato ────────────────────────────────────────────────────
  {
    name: "Casa dos Queijos Holandeses",
    shortDesc: "Importadora e varejista de queijos e frios holandeses",
    longDesc: "Loja especializada na importação e venda de queijos Gouda, Edam, Maasdam e outros frios típicos da Holanda. Degustação gratuita para clientes.",
    address: "Av. das Flores, 56, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6371, lng: -47.0560,
    priceRange: "$$", openingHours: "Seg–Sáb: 9h–18h",
    mapsUrl: "https://maps.google.com/?q=Casa+dos+Queijos+Holandeses+Holambra",
    isRecommended: true, isFeatured: false, isFree: false, isPartner: false,
    tags: ["queijos", "importados", "frios", "gourmet"], status: "active",
  },
  {
    name: "Arte & Flores Holambra",
    shortDesc: "Artesanato local, quadros e souvenirs típicos de Holambra",
    longDesc: "Ateliê e loja com peças de artesanato local, quadros de flores, cerâmica inspirada na cultura holandesa e souvenirs exclusivos para presentear.",
    address: "Rua 22 de Agosto, 33, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6363, lng: -47.0555,
    priceRange: "$", openingHours: "Ter–Dom: 9h–17h",
    mapsUrl: "https://maps.google.com/?q=Arte+Flores+Holambra",
    isRecommended: false, isFeatured: false, isFree: false, isPartner: false,
    tags: ["artesanato", "souvenirs", "quadros", "presente"], status: "active",
  },
  // ── Espaços de Eventos ────────────────────────────────────────────────────
  {
    name: "Haras Nova Holambra",
    shortDesc: "Haras com espaço para festas, shows e eventos ao ar livre",
    longDesc: "Haras com pista de equitação, espaço para festas corporativas e privadas, shows e eventos ao ar livre. Capacidade para até 500 pessoas.",
    address: "Rod. Municipal, Km 2, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6520, lng: -47.0620,
    priceRange: "$$$", openingHours: "Mediante agendamento",
    mapsUrl: "https://maps.google.com/?q=Haras+Nova+Holambra",
    isRecommended: false, isFeatured: false, isFree: false, isPartner: false,
    tags: ["haras", "cavalos", "eventos", "festas"], status: "active",
  },
  {
    name: "Recanto das Flores – Espaço de Eventos",
    shortDesc: "Salão decorado com flores naturais para casamentos e eventos",
    longDesc: "Espaço de eventos especializado em casamentos e festas com decoração floral exclusiva. Parceria com floriculturas locais para bouquets e arranjos.",
    address: "Estrada das Rosas, 14, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6395, lng: -47.0545,
    priceRange: "$$$", openingHours: "Agendamento: Seg–Sex 9h–17h",
    mapsUrl: "https://maps.google.com/?q=Recanto+das+Flores+Holambra",
    isRecommended: false, isFeatured: false, isFree: false, isPartner: false,
    tags: ["casamentos", "eventos", "flores", "decoração"], status: "active",
  },
  // ── Lazer & Natureza ──────────────────────────────────────────────────────
  {
    name: "Parque Municipal das Flores",
    shortDesc: "Parque público com jardins sazonais e trilhas",
    longDesc: "Parque municipal com exuberante jardim de flores que muda conforme a estação. Trilhas sinalizadas, área kids e estacionamento gratuito. Entrada franca.",
    address: "Av. Central, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6355, lng: -47.0585,
    priceRange: "gratuito", openingHours: "Diariamente: 7h–18h",
    mapsUrl: "https://maps.google.com/?q=Parque+Municipal+Holambra",
    isRecommended: true, isFeatured: true, isFree: true, isPartner: false,
    tags: ["parque", "flores", "trilha", "gratuito", "família"], status: "active",
  },
  {
    name: "Ciclovia Holambra–Jaguariúna",
    shortDesc: "Ciclovia com 12 km entre campos de flores e sítios rurais",
    longDesc: "Ciclovia pavimentada e sinalizada ligando Holambra a Jaguariúna, passando por campos de flores, cultivos de morango e paisagens rurais típicas do interior paulista.",
    address: "Rod. SP-107, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6380, lng: -47.0640,
    priceRange: "gratuito", openingHours: "Sempre disponível",
    mapsUrl: "https://maps.google.com/?q=Ciclovia+Holambra",
    isRecommended: true, isFeatured: false, isFree: true, isPartner: false,
    tags: ["ciclovia", "bicicleta", "natureza", "esporte"], status: "active",
  },
  {
    name: "Pesque e Pague Holambra",
    shortDesc: "Pesqueiro com tanques bem abastecidos para pesca esportiva",
    longDesc: "Pesqueiro com diversos tanques abastecidos com tilápia, tucunaré e pintado. Infra completa com churrasqueiras, limpeza do peixe inclusa e restaurante no local.",
    address: "Estrada Municipal dos Tanques, Holambra – SP",
    city: "Holambra", state: "SP", country: "Brasil",
    lat: -22.6480, lng: -47.0580,
    priceRange: "$$", openingHours: "Sáb–Dom e feriados: 6h–18h",
    mapsUrl: "https://maps.google.com/?q=Pesque+Pague+Holambra",
    isRecommended: false, isFeatured: false, isFree: false, isPartner: false,
    tags: ["pesca", "pesqueiro", "família", "lazer"], status: "active",
  },
];

// Mapa de posição → slug da categoria (mesma ordem que DEFAULT_PLACES)
const PLACE_CATEGORY_SLUGS: string[] = [
  "restaurantes", "restaurantes", "restaurantes",
  "pontos-turisticos", "pontos-turisticos", "pontos-turisticos", "pontos-turisticos", "pontos-turisticos",
  "floriculturas", "floriculturas",
  "hospedagem", "hospedagem",
  "bares-cafes", "bares-cafes",
  "lojas-artesanato", "lojas-artesanato",
  "espacos-eventos", "espacos-eventos",
  "lazer-natureza", "lazer-natureza", "lazer-natureza",
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
        const insertId = (result as any)[0]?.insertId ?? 0;
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
