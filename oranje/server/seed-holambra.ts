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
  { name: "Restaurantes",          slug: "restaurantes",   icon: "🍽️", description: "Restaurantes, lanchonetes e culinária local", isActive: true },
  { name: "Bares & Cervejarias",   slug: "bares",          icon: "🍺", description: "Bares, cervejarias e pubs", isActive: true },
  { name: "Cafés & Confeitarias",  slug: "cafes",          icon: "☕", description: "Cafeterias, confeitarias e padarias", isActive: true },
  { name: "Docerias",              slug: "docerias",       icon: "🎂", description: "Docerias, bombonerias e chocolaterias", isActive: true },
  { name: "Pizzarias",             slug: "pizzarias",      icon: "🍕", description: "Pizzarias e delivery de pizza", isActive: true },
  { name: "Hamburguerias",         slug: "hamburguerias",  icon: "🍔", description: "Hamburguerias artesanais em Holambra", isActive: true },
  { name: "Hotéis & Pousadas",     slug: "hoteis",         icon: "🏨", description: "Hotéis, pousadas e hospedagem", isActive: true },
  { name: "Parques & Atrações",    slug: "parques",        icon: "🌳", description: "Parques, jardins e atrações turísticas", isActive: true },
  { name: "Pontos Turísticos",     slug: "pontos-turisticos", icon: "🌸", description: "Pontos de interesse e patrimônio histórico", isActive: true },
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
    shortDesc: "Restaurante familiar com cardápio farto e atendimento acolhedor — almoço sólido sem complicação",
    longDesc: null,
    address: "Rua Dória Vasconcelos, 81, Holambra, SP, 13825-065", lat: -22.6391, lng: -47.0614,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["almoco", "familia", "casual", "tradicional", "central"], status: "active",
    dataPending: false,
  },

  {
    name: "Restaurante Villa Girassol",
    _categorySlug: "restaurantes",
    shortDesc: "Gastronomia com vista para campos de flores",
    longDesc: "Restaurante com culinária regional e internacional, conhecido pelo ambiente tranquilo e vista privilegiada para os campos floridos de Holambra.",
    address: "Holambra – SP", lat: -22.6352, lng: -47.0588,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
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
    isRecommended: false, isFeatured: false, isPartner: false,
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
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["café especial", "bolos", "tortas"], status: "active",
    dataPending: true,
  },

  {
    name: "Dolce Flor Holambra",
    _categorySlug: "docerias",
    shortDesc: "Doceria conhecida em Holambra pelo gelato de flores — uma das experiências mais instagramáveis da cidade. Ambiente pet friendly, com gelatos artesanais feitos com flores e ingredientes locais. Ideal para uma pausa doce a qualquer hora da tarde.",
    longDesc: "A Dolce Flor tem aquele apelo visual que funciona bem tanto para quem busca doces quanto para quem quer uma boa foto. Sorvetes artesanais, doces bem elaborados e um ambiente que conversa com o imaginário floral de Holambra. Abre a partir do meio-dia, todos os dias — boa parada para a tarde depois da Macena Flores ou antes de encerrar o dia no Parque Van Gogh. Fica no Morada das Flores, a cerca de 10 minutos do centro.",
    address: "Rua Solidagos, 125 - Morada das Flores, Holambra - SP",
    openingHours: "Segunda a Sexta: 13h às 18h30 | Sábado: 11h às 19h | Domingo: 11h às 18h30",
    lat: null, lng: null, // coordenada a confirmar no Maps — anterior era duplicata do Zoet en Zout
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
    isRecommended: false, isFeatured: false, isPartner: false,
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
    isRecommended: true, isFeatured: false, isPartner: false,
    website: "https://www.royaltulipholambra.com.br",
    tags: ["hotel 4 estrelas", "spa", "piscina", "luxo"], status: "active",
    dataPending: false,
  },

  {
    name: "Holambra Garden Hotel",
    _categorySlug: "hoteis",
    shortDesc: "Hotel central com jardins cuidados, café da manhã caprichado e boa relação custo-benefício",
    longDesc: "O Holambra Garden Hotel é uma das escolhas mais equilibradas da cidade: localização central, jardins bem cuidados, quartos confortáveis e um café da manhã com ingredientes locais que já vale a estadia. Atende bem tanto casais em fim de semana quanto viajantes a trabalho.",
    address: "Holambra – SP", lat: -22.6362, lng: -47.0625,
    website: "https://www.holambragardenhotel.com.br",
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["hotel", "central", "cafe_da_manha", "jardins", "familia", "casal", "custo_beneficio", "tradicional"], status: "active",
    dataPending: false,
  },

  {
    name: "Villa de Holanda Hotel",
    _categorySlug: "hoteis",
    shortDesc: "Hotel com jardins, piscina e charme holandês — referência histórica em Holambra",
    longDesc: "O Villa de Holanda Hotel é uma das hospedagens mais reconhecidas de Holambra, com jardins cuidados, piscina e ambientação holandesa. Combina estrutura de hotel com o clima acolhedor das hospedagens da cidade. Boa opção para casais e famílias que querem conforto próximo ao centro.",
    address: "Holambra – SP", lat: -22.6370, lng: -47.0630,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["hotel", "piscina", "casal", "familia", "tradicional", "central", "premium"], status: "active",
    dataPending: true,
  },

  {
    name: "Villa de Holanda Parque Hotel",
    _categorySlug: "hoteis",
    shortDesc: "Parque hotel com ampla área de lazer, piscinas e estrutura completa para famílias",
    longDesc: "O Villa de Holanda Parque Hotel é o irmão maior do Villa de Holanda Hotel, com foco em estrutura de lazer e espaço para famílias. Área verde generosa, piscinas e ambiente que agrada tanto crianças quanto adultos que querem mais do que um quarto.",
    address: "Holambra – SP", lat: -22.6372, lng: -47.0632,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["hotel", "parque", "piscina", "lazer", "familia", "tradicional", "area_verde", "criancas"], status: "active",
    dataPending: false,
  },

  {
    name: "Shellter Hotel",
    _categorySlug: "hoteis",
    shortDesc: "Hotel design com arquitetura contemporânea — o mais charmoso e visualmente cuidado de Holambra",
    longDesc: "O Shellter Hotel se destaca pela arquitetura contemporânea e proposta mais cuidada. Quartos bem projetados, design com identidade e um cuidado com a experiência que vai além do básico. Excelente para casais que valorizam estética e têm Holambra como destino principal do fim de semana.",
    address: "Holambra – SP", lat: -22.6355, lng: -47.0620,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["hotel", "design", "contemporaneo", "charmoso", "casal", "romantico", "fim_de_semana", "premium"], status: "active",
    dataPending: false,
  },

  {
    name: "Parque Hotel Holambra",
    _categorySlug: "hoteis",
    shortDesc: "Hotel tradicional com piscina e área verde ampla — desde 2004, o resort tranquilo de Holambra",
    longDesc: "O Parque Hotel Holambra é a hospedagem mais estabelecida da cidade — funciona desde 2004 e ainda mantém a tradição de resort tranquilo, voltado para famílias e casais que querem descansar de verdade. A área de lazer é generosa: piscina com espreguiçadeiras, jardins bem cuidados e silêncio. Fica a 1,5 km do centro, o que garante que os hóspedes não ficam presos no fluxo do fim de semana. Um dos pontos fortes é o café da manhã caseiro. Ideal para quem quer base tranquila para explorar Holambra no próprio ritmo.",
    address: "Rua das Dálias, 100 – Jardim Holanda, Holambra – SP", lat: -22.6380, lng: -47.0640,
    city: "Holambra", state: "SP", country: "Brasil",
    phone: "(19) 3802-2090",
    website: "https://parquehotelholambra.com.br",
    instagram: "hotelholambra1",
    coverImage: "https://parquehotelholambra.com.br/wp-content/uploads/2018/01/parque-hotel-holambra-area-piscina.jpg",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["hotel", "piscina", "lazer", "familia", "tradicional", "area_verde", "criancas", "fim_de_semana", "classico", "desde_2004"], status: "active",
    dataPending: false,
  },

  {
    name: "Hotel 1948",
    _categorySlug: "hoteis",
    shortDesc: "Hospedagem com nome que homenageia o ano de chegada dos imigrantes holandeses em Holambra",
    longDesc: "O Hotel 1948 carrega no nome a data de chegada dos imigrantes holandeses que fundaram Holambra. Uma hospedagem com identidade cultural clara, ambientação que dialoga com a história da cidade e atendimento próximo.",
    address: "Holambra – SP", lat: -22.6360, lng: -47.0618,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["hotel", "historia", "tradicional", "casal", "cultura_holandesa", "imigracao"], status: "active",
    dataPending: true,
  },

  {
    name: "Pousada Oca",
    _categorySlug: "hoteis",
    shortDesc: "Pousada com clima intimista e proposta aconchegante — boa pedida para casal",
    longDesc: "A Pousada Oca tem uma proposta mais intimista e aconchegante dentro da oferta de hospedagem de Holambra. Indicada para casais que buscam tranquilidade e atendimento mais pessoal.",
    address: "Holambra – SP", lat: -22.6375, lng: -47.0628,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["pousada", "charmosa", "casal", "romantico", "intimista", "descanso", "fim_de_semana"], status: "active",
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
    isRecommended: false, isFeatured: false, isPartner: false,
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
  // NOTA: "Garden Restaurante" foi removido por ser duplicata de
  // "De Immigrant Restaurante Garden" — ambos no mesmo endereço (nº 229).
  // Os dados editoriais foram consolidados na entrada canônica abaixo.

  {
    name: "De Immigrant Gastro Café",
    _categorySlug: "cafes",
    shortDesc: "Gastro café desde as 8h — café da manhã, almoço e a história da imigração holandesa no mesmo endereço",
    longDesc: "O De Immigrant Gastro Café é um dos lugares mais carregados de identidade em Holambra. A proposta mistura café da manhã refinado, almoço regional e a história dos imigrantes holandeses que fundaram a cidade. Aberto todos os dias a partir das 8h, funciona como ponto de partida natural para quem chega à Rua Dória Vasconcelos.",
    address: "Rua Dória Vasconcelos, 293, Holambra – SP", lat: -22.6360, lng: -47.0615,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["cafe", "regional", "almoco", "cafe_da_manha", "casal", "roteiro_cultura", "gastronomia_holandesa", "curadoria_oranje", "historia", "primeira_visita"], status: "active",
    dataPending: false,
  },

  {
    name: "De Immigrant Restaurante Garden",
    _categorySlug: "restaurantes",
    shortDesc: "Restaurante garden com culinária da imigração holandesa — ambiente aberto e identidade cultural forte",
    longDesc: "O De Immigrant Restaurante Garden ocupa um espaço garden que combina gastronomia da imigração holandesa com ambiente aberto e culturalmente rico. Na Rua Dória Vasconcelos, 229, vizinho ao Gastro Café, tem proposta mais voltada ao almoço e jantar — cardápio autoral com raízes na colônia. Um dos endereços mais importantes do corredor gastronômico de Holambra.",
    address: "Rua Dória Vasconcelos, 229, Holambra – SP", lat: -22.6361, lng: -47.0616,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["restaurante", "regional", "almoco", "jantar", "gastronomia_holandesa", "casal", "garden", "aberto", "curadoria_oranje", "roteiro_cultura", "historia", "primeira_visita"], status: "active",
    dataPending: false,
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
    name: "Cow Burguer",
    slug: "cow-burguer",
    _categorySlug: "hamburguerias",
    shortDesc: "Hamburgueria artesanal temática com ambiente do Velho Oeste — Cow Provolone, Cow Cheddar Melt e porções generosas",
    longDesc: "A Cow Burguer é uma hamburgueria artesanal temática com ambiente inspirado no Velho Oeste. O cardápio é focado em hambúrgueres 'brutos' e porções generosas, com ingredientes premium e molhos exclusivos. Destaques: Cow Provolone (com queijo empanado), Cow Cheddar Melt (cebola caramelizada), Cow Costela, Batata Coutrin 2.0 e Batata Faroeste. Para beber, a Pink Lemonade artesanal de pitaya. A unidade de Holambra fica no centro, na Rua Campo do Pouso, 1139.",
    address: "R. Campo do Pouso, 1139 – Centro, Holambra – SP", lat: -22.6358, lng: -47.0618,
    city: "Holambra", state: "SP", country: "Brasil",
    openingHours: "Ter–Qui: 18h30–22h30 | Sex: 18h–23h30 | Sáb: 11h–16h e 18h–23h30 | Dom: 11h–16h e 18h–22h",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["hamburguer", "artesanal", "tematico", "velho_oeste", "jantar", "noite", "fins_de_semana", "lanche", "casual", "amigos"], status: "active",
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
    shortDesc: "Lounge sofisticado no Food Garden — drinks autorais, atmosfera noturna e o melhor da cidade depois do jantar",
    longDesc: null,
    address: "R. Campo do Pouso, 1162 – Centro, Holambra, SP, 13825-000", lat: -22.6375, lng: -47.0622,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["lounge", "noite", "romantico", "casal", "premium", "drinks", "bar"], status: "active",
    dataPending: false,
  },

  // ─── Lugares com dados históricos (não estavam no seed original) ──────────

  {
    name: "Expoflora",
    _categorySlug: "pontos-turisticos",
    shortDesc: "O maior evento de flores da América Latina — acontece todo setembro em Holambra.",
    longDesc: "A Expoflora é o maior evento de flores e plantas ornamentais da América Latina e acontece anualmente em setembro, durante cerca de 30 dias, no Parque de Exposições de Holambra. É o ponto alto do calendário turístico da cidade: atrações ao vivo, gastronomia, artesanato, expositores de todo o Brasil e uma explosão de cor que transforma Holambra numa das cidades mais visitadas do estado durante o período. Se você está planejando uma visita em setembro, estruture o roteiro em torno da Expoflora — ela vale o deslocamento. Nos outros meses, o espaço não está em operação como evento.",
    address: "Parque de Exposições de Holambra, SP", lat: -22.6380, lng: -47.0590,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    coverImage: "https://www.expoflora.com.br/public/imgs/atracoes/jardim_tematico.jpg",
    images: [
      "https://www.expoflora.com.br/public/imgs/atracoes/jardim_tematico.jpg",
      "https://www.expoflora.com.br/public/imgs/atracoes/parada_das_flores.jpg",
      "https://www.expoflora.com.br/public/imgs/atracoes/chuva_petalas.jpg",
      "https://www.expoflora.com.br/public/imgs/atracoes/espaco_instagramaveis.jpg",
      "https://www.expoflora.com.br/public/imgs/sobre_o_evento/evento1.jpg",
      "https://www.expoflora.com.br/public/imgs/sobre_o_evento/evento3.jpg",
      "https://www.expoflora.com.br/public/imgs/sobre_o_evento/evento5.jpg",
      "https://www.expoflora.com.br/public/imgs/atracoes/danca_holandesa.jpg",
    ],
    tags: ["evento_anual", "sazonal", "setembro", "flores", "turismo", "familia", "ao_ar_livre", "fotos", "primeira_visita", "cultura"], status: "active",
    dataPending: false,
  },

  {
    name: "Martin Holandesa Confeitaria e Restaurante",
    _categorySlug: "restaurantes",
    shortDesc: "Confeitaria histórica do Boulevard Holandês — stroopwafels, pães artesanais e sabores da imigração holandesa",
    longDesc: "A Martin Holandesa é uma das mais antigas confeitarias de Holambra e uma referência obrigatória para quem visita o Boulevard Holandês. Fundada pela família Martin, ela mantém viva a tradição da confeitaria holandesa com produtos como stroopwafels, speculaas e pães artesanais de receita original. O ambiente é acolhedor, com decoração que remete à imigração — cada detalhe conta um pedaço da história da cidade. É o lugar ideal para o café da manhã ou para levar um presente típico de Holambra: os stroopwafels embalados são um dos souvenirs mais procurados pelos visitantes.",
    coverImage: "https://martinholandesa.com.br/content/foto4.jpeg",
    address: "Rua Doria Vasconcelos, 144, Boulevard Holandês, Holambra, SP", lat: -22.6395, lng: -47.0608,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["tipico_holandes", "tradicional", "cafe_da_manha", "almoco", "familia", "historico", "classico", "primeira_visita"], status: "active",
    dataPending: false,
  },

  {
    name: "Cervejaria Seo Carneiro",
    _categorySlug: "bares",
    shortDesc: "Cervejaria artesanal com atmosfera autêntica — o bar mais animado e descontraído de Holambra.",
    longDesc: "A Cervejaria Seo Carneiro é o ponto de encontro mais autêntico de Holambra para os amantes de cerveja artesanal. Com um cardápio que mescla rótulos próprios e selecionados, o ambiente é descontraído, barulhento do jeito certo e cheio de gente que volta sempre. Os petiscos combinam com as cervejas e o atendimento é aquele estilo de bar de bairro que faz falta nas cidades grandes. É o tipo de lugar que aparece nas histórias de quem visita Holambra e não esperava encontrar um bom bar artesanal por lá.",
    coverImage: "https://seocarneiro.com.br/wp-content/uploads/2023/11/20231102_110640-scaled.jpg",
    address: "Holambra – SP", lat: -22.6400, lng: -47.0610,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["cervejaria", "artesanal", "bar", "petiscos", "casual", "animado"], status: "active",
    dataPending: true,
  },

  {
    name: "Pousada Rancho da Cachaça",
    _categorySlug: "hoteis",
    shortDesc: "Pousada rural com cachaças artesanais, trilhas e café da manhã da roça — descanso real longe do centro",
    longDesc: null,
    coverImage: "https://ranchodacachaca.com.br/wp-content/uploads/2022/02/pousada-rancho-da-cachaca.jpg",
    address: "Holambra – SP", lat: -22.6500, lng: -47.0500,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["rural", "romantico", "natureza", "casal", "pousada", "turismo_rural"], status: "active",
    dataPending: false,
  },

  // ─── Eixo de passeio + Zoet en Zout ──────────────────────────────────────

  {
    name: "Zoet en Zout",
    _categorySlug: "cafes",
    shortDesc: "Café e doceria holandesa na Viela Lantanas — doces artesanais, brunch caprichado e o charme das manhãs de Holambra",
    longDesc: "Zoet en Zout — que significa doce e salgado em holandês — é um dos cafés mais tradicionais de Holambra. Fica na Viela Lantanas, praticamente dentro do eixo do lago, a passos da Praça Vitória Régia e do Moinho Povos Unidos. É o lugar onde o passeio a pé naturalmente termina com um café com leite e um stroopwafel feito na hora. Os doces são artesanais, com inspiração holandesa de verdade — não o holandês estilizado para turismo, mas o de receita de família. No brunch de fim de semana, costuma ter fila. Aberto todos os dias das 9h às 18h.",
    address: "Viela Lantanas, 90, Holambra, SP, 13825-000", lat: -22.6395, lng: -47.0620,
    city: "Holambra", state: "SP", country: "Brasil",
    phone: "(19) 3802-1293",
    website: "https://zoet-en-zout.com.br",
    instagram: "zoet_en_zout",
    whatsapp: "5519999316353",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["cafe_da_manha", "brunch", "doces", "tradicional", "tipico_holandes", "casal", "fotos", "turistico", "curadoria_oranje", "classico", "primeira_visita", "cultura_holandesa", "eixo_de_passeio"], status: "active",
    dataPending: false,
  },

  {
    name: "Deck do Amor",
    _categorySlug: "pontos-turisticos",
    shortDesc: "Deque romântico com cadeados do amor — o ponto de casais mais simbólico de Holambra",
    longDesc: "O Deck do Amor é um dos pontos mais íntimos e procurados de Holambra. Um deque de madeira à beira do lago, onde casais e turistas fixam cadeados na cerca como símbolo de amor eterno — um ritual que virou tradição da cidade. Os cadeados são comprados em uma pequena lojinha no próprio trecho, o que torna a experiência ainda mais espontânea e local. O melhor momento é o entardecer: a luz dourada reflete no lago, os barcos repousam e o burburinho da cidade dá lugar a uma quietude bonita. O deck faz parte do eixo de passeio do centro — começa na Rua dos Guarda-Chuvas, passa pela Praça Vitória Régia e termina no Moinho Povos Unidos.",
    address: "Eixo do Lago — Holambra, SP", lat: -22.6415, lng: -47.0600,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "free", isFree: true,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["romantico", "cadeados_do_amor", "casal", "fotos", "nascer_do_sol", "contemplacao", "experiencia_simbolica", "ponto_iconico", "primeira_visita", "eixo_de_passeio", "ao_ar_livre", "gratuito"], status: "active",
    dataPending: false,
  },

  {
    name: "Praça Vitória Régia",
    _categorySlug: "pontos-turisticos",
    shortDesc: "Espelho d'água com vitórias-régias — contemplação, reflexos e o nascer do sol mais bonito de Holambra",
    longDesc: "A Praça Vitória Régia é um dos pontos mais contemplativos de Holambra. Um espelho d'água rodeado de folhas gigantes de vitórias-régias, flores aquáticas que só existem em condições especiais de clima e cuidado. O local é imperdível ao amanhecer, especialmente no outono — quando a névoa ainda paira sobre o lago, a luz rasa dourada ilumina os nenúfares gigantes e o silêncio da manhã torna tudo muito intenso. Fotógrafos de natureza conhecem bem esse horário. A praça também abriga o Deck do Amor ao lado e conecta visualmente o centro histórico com o Moinho Povos Unidos, fechando o eixo de passeio mais bonito da cidade.",
    address: "Praça Vitória Régia — Holambra, SP", lat: -22.6385, lng: -47.0608,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "free", isFree: true,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["nascer_do_sol", "lago", "outono", "fotos", "contemplacao", "manha", "romantico", "natureza", "eixo_de_passeio", "ao_ar_livre", "gratuito", "primeira_visita", "ponto_iconico"], status: "active",
    dataPending: false,
  },

  {
    name: "Rua dos Guarda-Chuvas",
    _categorySlug: "pontos-turisticos",
    shortDesc: "Corredor fotográfico com guarda-chuvas coloridos — parada visual obrigatória no eixo de passeio do centro",
    longDesc: "A Rua dos Guarda-Chuvas é uma das paradas mais fotogênicas de Holambra. Uma rua do centro onde guarda-chuvas coloridos suspensos formam um corredor vibrante, instagramável e gratuito. Funciona o dia todo, não precisa de ingresso e é um dos lugares mais fotografados da cidade — inclusive por quem não planejava parar ali. É também o começo do eixo de passeio a pé que percorre o coração histórico de Holambra: depois da rua, vem o Deck do Amor, depois a Praça Vitória Régia e, no fim, o Moinho Povos Unidos. Quem faz esse trajeto inteiro a pé faz o melhor passeio possível em Holambra.",
    address: "Centro — Holambra, SP", lat: -22.6392, lng: -47.0612,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "free", isFree: true,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["instagramavel", "fotos", "casal", "passeio_a_pe", "visual", "colorido", "primeira_visita", "eixo_de_passeio", "ao_ar_livre", "gratuito", "romantico", "familia"], status: "active",
    dataPending: false,
  },

  // ── Âncoras com longDesc editorial completo ───────────────────────────────

  {
    name: "Moinho Povos Unidos",
    _categorySlug: "pontos-turisticos",
    shortDesc: "Moinho holandês símbolo de Holambra — o cartão-postal mais fotografado da cidade das flores",
    longDesc: "O Moinho Povos Unidos é o símbolo mais icônico de Holambra e o ponto de referência de toda a cidade. Construído pelos imigrantes holandeses, ele marca o fim do eixo de passeio do centro — quem percorre a Rua dos Guarda-Chuvas, passa pelo Deck do Amor e segue pela Praça Vitória Régia inevitavelmente chega a ele. É gratuito, está sempre acessível e a qualquer hora do dia oferece uma boa fotografia — ao amanhecer com neblina, ao pôr do sol com luz dourada, ou à noite com iluminação. Em setembro, durante a Expoflora, os campos ao redor ficam tomados por flores e o cenário se torna absolutamente impossível de ignorar.",
    address: "Praça dos Imigrantes — Holambra, SP", lat: -22.6385, lng: -47.0625,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "free", isFree: true,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["icone", "ponto_iconico", "fotos", "historico", "gratuito", "primeira_visita", "casal", "familia", "ao_ar_livre", "roteiro_cultura", "eixo_de_passeio", "curadoria_oranje"], status: "active",
    dataPending: false,
  },

  // ── Migrados do Railway — âncoras com foto real confirmada ────────────────

  {
    name: "The Old Dutch",
    _categorySlug: "restaurantes",
    shortDesc: "Restaurante holandês tradicional no Boulevard — cardápio típico, ambiente histórico e boa reputação na cidade",
    longDesc: "O The Old Dutch é uma das casas mais tradicionais do Boulevard Holandês, com um cardápio que inclui pratos típicos da culinária holandesa e brasileira em um ambiente que lembra os primeiros anos da colonização de Holambra. A fachada histórica, os detalhes decorativos e o atendimento familiar fazem dele uma parada especialmente valorizada por quem quer entender a alma da cidade. Ideal para o almoço após visitar o Moinho Povos Unidos ou o Museu da Cultura — a localização no eixo central facilita combinar as paradas.",
    coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/e6/d0/72/fachada.jpg?w=900&h=500&s=1",
    address: "Holambra – SP", lat: -22.6385, lng: -47.0610,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["tipico_holandes", "tradicional", "almoco", "jantar", "historico", "casal", "gastronomia_holandesa"], status: "active",
    dataPending: true,
  },

  {
    name: "Fratelli Wine Bar",
    _categorySlug: "bares",
    shortDesc: "Wine bar com rótulos selecionados, petiscos de qualidade e ambiente elegante — o endereço premium de Holambra para quem quer um bom vinho.",
    longDesc: "O Fratelli Wine Bar é o único wine bar de Holambra com proposta realmente focada em vinho de qualidade. Carta cuidadosa, petiscos que combinam com a seleção e um ambiente que funciona muito bem para jantares de casal ou encontros com amigos que valorizam a experiência. É o tipo de lugar que faz falta em cidades menores e que Holambra tem sorte de ter.",
    coverImage: "https://fratelliwinebar.com.br/wp-content/uploads/2025/12/fratelli-3-scaled-1.webp",
    address: "Holambra – SP", lat: -22.6388, lng: -47.0605,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["vinho", "wine_bar", "premium", "casal", "romantico", "jantar", "petiscos", "curadoria_oranje", "noite"], status: "active",
    dataPending: false,
  },

  {
    name: "Hana Restaurante Holambra",
    _categorySlug: "restaurantes",
    shortDesc: "Culinária japonesa com qualidade e capricho — o único endereço oriental de Holambra",
    longDesc: "O Hana Restaurante é uma surpresa bem-vinda em Holambra: em uma cidade de forte identidade holandesa, encontrar culinária japonesa de qualidade chama a atenção. O cardápio inclui sushis, sashimis e pratos quentes orientais executados com capricho — longe do estilo rodízio apressado das grandes cidades. O ambiente é tranquilo e o atendimento cuidadoso. É o tipo de restaurante que os moradores frequentam regularmente e que os visitantes encontram por recomendação boca a boca.",
    coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/aa/72/b9/sabor-delicadeza-e-amor.jpg?w=900&h=500&s=1",
    address: "Holambra – SP", lat: -22.6395, lng: -47.0615,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["japones", "oriental", "sushi", "almoco", "jantar", "casal", "diferente"], status: "active",
    dataPending: true,
  },

  {
    name: "Lago do Holandês",
    _categorySlug: "restaurantes",
    shortDesc: "Restaurante às margens do Lago do Holandês — almoço com vista para o lago central de Holambra",
    longDesc: "O Lago do Holandês é um dos raros restaurantes de Holambra com vista privilegiada para o lago central da cidade — o mesmo espelho d'água que se avista do Deck do Amor e da Praça Vitória Régia. O cardápio inclui pratos de almoço com influências da culinária regional e o ambiente ao ar livre é o grande diferencial: mesas à sombra com ventilação natural e uma paisagem que relaxa desde antes de você pedir. Ideal para almoços de família ou casais que querem combinar gastronomia com a vista mais bonita de Holambra.",
    address: "Holambra – SP", lat: -22.6430, lng: -47.0575,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["lago", "vista", "almoco", "familia", "romantico", "ao_ar_livre"], status: "active",
    dataPending: true,
  },

  {
    name: "Museu da Cultura e História de Holambra",
    _categorySlug: "pontos-turisticos",
    shortDesc: "Museu preserva documentos, fotos e objetos dos imigrantes holandeses que fundaram Holambra em 1948.",
    longDesc: "O Museu da Cultura e História de Holambra é uma visita obrigatória para quem quer entender a cidade além da superfície floral. O acervo reúne documentos originais, fotografias e objetos pessoais dos imigrantes holandeses que chegaram em 1948 e fundaram a colônia — uma história de coragem, adaptação e identidade que moldou tudo que você vê na cidade hoje. Pequeno, bem curado e gratuito, é o tipo de parada que dura menos de uma hora mas deixa uma impressão duradoura.",
    coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/89/95/87/entrada.jpg?w=1200&h=-1&s=1",
    address: "Holambra – SP", lat: -22.6390, lng: -47.0618,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: null, isFree: true,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["museu", "historia", "cultura", "imigracao_holandesa", "gratuito", "educativo", "familia", "casal", "primeira_visita", "roteiro_cultura", "curadoria_oranje"], status: "active",
    dataPending: false,
  },

  // ── Prioridade alta — novos lugares ───────────────────────────────────────

  {
    name: "Nossa Prainha",
    _categorySlug: "parques",
    shortDesc: "Praia de lago artificial às margens do Lago do Holandês — área de lazer com areia, sombreiros e acesso à água",
    longDesc: "A Nossa Prainha é uma das atrações mais inusitadas de Holambra: uma praia de areia às margens do Lago do Holandês, com infraestrutura de lazer, sombreiros e acesso à água. É especialmente procurada no verão por famílias com crianças — a água do lago é tranquila, o espaço é seguro e há opções de alimentação por perto. Para os visitantes que não esperavam encontrar uma praia no interior paulista, a surpresa é total. Um ponto de lazer que une moradores e turistas e que faz parte do eixo de passeio natural ao redor do lago central.",
    coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/44/67/dc/20160514-142534-largejpg.jpg?w=900&h=-1&s=1",
    address: "Holambra – SP", lat: -22.6435, lng: -47.0570,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["praia", "lago", "lazer", "familia", "criancas", "verao", "agua", "ao_ar_livre"], status: "active",
    dataPending: true,
  },

  {
    name: "Oma Beppie",
    _categorySlug: "cafes",
    shortDesc: "Confeitaria holandesa artesanal — stroopwafels, biscoitos amanteigados e doces típicos da imigração em Holambra",
    longDesc: null,
    address: "Holambra – SP", lat: -22.6388, lng: -47.0612,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["cafe", "confeitaria", "doceria", "gastronomia_holandesa", "cultura_holandesa", "para_levar"], status: "active",
    dataPending: true,
  },

  {
    name: "Cantinho da Cida",
    _categorySlug: "hoteis",
    shortDesc: "Hospedagem familiar aconchegante — opção íntima e acolhedora para quem busca alternativa às redes maiores",
    longDesc: null,
    address: "Holambra – SP", lat: -22.6378, lng: -47.0625,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["hospedagem", "familiar", "aconchegante", "economico", "casal"], status: "active",
    dataPending: true,
  },

  // ── Prioridade média — novos lugares ──────────────────────────────────────

  {
    name: "Villa Grill Hamburgueria e Bar",
    _categorySlug: "bares",
    shortDesc: "Hamburgueria com proposta de bar — lanches artesanais e ambiente descontraído para o jantar",
    longDesc: null,
    address: "Holambra – SP", lat: -22.6392, lng: -47.0618,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["hamburguer", "bar", "jantar", "casual", "amigos"], status: "active",
    dataPending: true,
  },

  {
    name: "Di Komê Garage Bistrô",
    _categorySlug: "restaurantes",
    shortDesc: "Restaurante casual com culinária variada — almoço e jantar no centro de Holambra",
    longDesc: null,
    address: "Rua Camélias, 365 - Centro, Holambra - SP", lat: -22.630367, lng: -47.050839,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["almoco", "jantar", "casual", "variado", "central"], status: "active",
    dataPending: true,
  },

  {
    name: "Houtskool Steak & Burger",
    _categorySlug: "restaurantes",
    shortDesc: "Steak house e hamburgueria com cortes nobres e hambúrgueres premium — proposta carnívora de qualidade em Holambra",
    longDesc: null,
    address: "Holambra – SP", lat: -22.6380, lng: -47.0605,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["steak", "hamburguer", "carnes", "premium", "jantar", "casal", "grill"], status: "active",
    dataPending: true,
  },

  {
    name: "Op Sorvetes Artesanais",
    _categorySlug: "docerias",
    shortDesc: "Sorveteria artesanal com sabores criativos e ingredientes regionais — parada refrescante no passeio",
    longDesc: null,
    address: "Holambra – SP", lat: -22.6383, lng: -47.0610,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["sorvetes", "artesanal", "doces", "familia", "criancas", "tarde", "passeio"], status: "active",
    dataPending: true,
  },

  // ── Prioridade baixa — presença na base, sem evidenciar ───────────────────

  {
    name: "Real Receptivo Holambra",
    _categorySlug: "pontos-turisticos",
    shortDesc: "Agência de turismo receptivo especializada em roteiros e passeios por Holambra",
    longDesc: null,
    address: "Holambra – SP", lat: -22.6388, lng: -47.0615,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["agencia", "turismo", "roteiros", "passeios", "receptivo"], status: "active",
    dataPending: true,
  },

  {
    name: "HolamBrasil Turismo",
    _categorySlug: "pontos-turisticos",
    shortDesc: "Agência de turismo local com pacotes e roteiros para Holambra e região",
    longDesc: null,
    address: "Holambra – SP", lat: -22.6390, lng: -47.0612,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["agencia", "turismo", "pacotes", "roteiros"], status: "active",
    dataPending: true,
  },

  {
    name: "Em Busca do Galope",
    _categorySlug: "parques",
    shortDesc: "Passeios a cavalo no campo — turismo equestre às portas de Holambra",
    longDesc: null,
    address: "Holambra – SP", lat: -22.6510, lng: -47.0490,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["cavalo", "equestre", "turismo_rural", "natureza", "passeio", "familia"], status: "active",
    dataPending: true,
  },

  {
    name: "Mais Coxinha",
    _categorySlug: "restaurantes",
    shortDesc: "Lanchonete popular com coxinhas e salgados artesanais — lanche rápido e acessível",
    longDesc: null,
    address: "Holambra – SP", lat: -22.6388, lng: -47.0608,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["lanche", "rapido", "popular", "salgados", "acessivel"], status: "active",
    dataPending: true,
  },

  {
    name: "Kok Holambra Food Truck",
    _categorySlug: "restaurantes",
    shortDesc: "Food truck com culinária de rua — lanches e refeições no formato mobile",
    longDesc: null,
    address: "Holambra – SP", lat: -22.6392, lng: -47.0610,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["food_truck", "lanche", "rapido", "casual", "rua"], status: "active",
    dataPending: true,
  },

  {
    name: "Villa Milani",
    _categorySlug: "restaurantes",
    shortDesc: "Restaurante italiano com proposta autoral — massas e risotos em Holambra",
    longDesc: null,
    address: "Holambra – SP", lat: -22.6385, lng: -47.0618,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["italiana", "massas", "risotos", "jantar", "premium", "casal"], status: "active",
    dataPending: true,
  },

  {
    name: "Lanchonete Luiz",
    _categorySlug: "restaurantes",
    shortDesc: "Lanchonete clássica popular — ponto de encontro tradicional de Holambra",
    longDesc: null,
    address: "Holambra – SP", lat: -22.6390, lng: -47.0615,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["lanchonete", "popular", "classico", "acessivel", "tradicional"], status: "active",
    dataPending: true,
  },

  {
    name: "Sabor & Arte",
    _categorySlug: "restaurantes",
    shortDesc: "Restaurante com culinária criativa e apresentação artística — gastronomia autoral em Holambra",
    longDesc: null,
    address: "Holambra – SP", lat: -22.6382, lng: -47.0608,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["autoral", "criativo", "almoco", "jantar", "arte", "gastronomia"], status: "active",
    dataPending: true,
  },
  {
    name: "Floricultura Veiling",
    _categorySlug: "parques",
    shortDesc: "Centro de comercialização de flores e plantas — um dos maiores complexos floriculturais do Brasil",
    longDesc: "A Floricultura Veiling é o coração comercial de Holambra — um dos maiores centros de comercialização de flores e plantas ornamentais do Brasil. O complexo movimenta milhões de flores diariamente, principalmente para atacadistas e floricultores, mas visitantes também encontram ali variedades e preços impossíveis de achar em centros urbanos. Menos turístico que o Parque Van Gogh ou a Macena Flores, a Veiling é o lugar onde a flor de Holambra acontece de verdade: escala industrial, diversidade impressionante e uma dinâmica de mercado que vale conhecer.",
    address: "Holambra – SP", lat: -22.6241, lng: -47.0521,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["flores", "plantas", "veiling", "compras", "comercio", "atacado"], status: "active",
    dataPending: true,
  },
  {
    name: "Campo de Girassóis",
    _categorySlug: "parques",
    shortDesc: "Campos abertos com plantações de girassóis — ponto fotográfico icônico nas estradas de Holambra",
    longDesc: "Os campos de girassóis nas estradas ao redor de Holambra são uma das atrações mais fotogênicas da região — e das menos formalizadas. Não existe um 'Campo de Girassóis oficial', mas sim propriedades agrícolas cujos campos florescem entre janeiro e março, transformando os acostamentos das estradas vicinais em corredores amarelos que chamam atenção de quem passa. O melhor jeito de encontrá-los é saindo de carro pelos arredores da cidade no verão, especialmente pela Estrada Municipal e pelos acessos à rodovia. Nenhum ingresso, nenhuma bilheteria — só a flor e a foto.",
    address: "Holambra – SP", lat: -22.6350, lng: -47.0450,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: true,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["girassol", "campo", "foto", "natureza", "flores", "rural"], status: "active",
    dataPending: true,
  },
  {
    name: "Parque Linear do Lago",
    _categorySlug: "parques",
    shortDesc: "Área verde à beira do Lago do Holandês — pista de caminhada, bancos e vista para o espelho d'água",
    longDesc: "O Parque Linear do Lago é o pulmão verde de Holambra — uma faixa de área pública à beira do Lago do Holandês com pista de caminhada, bancos, iluminação e vegetação nativa. É onde os moradores caminham de manhã, onde as famílias levam as crianças no fim de tarde e onde você consegue uma vista do lago mais tranquila do que na Praça Vitória Régia. O parque se estende do Deck do Amor até a Nossa Prainha, conectando os dois pontos mais visitados do eixo do lago. Entrada livre, sempre aberto.",
    address: "Holambra – SP", lat: -22.6297, lng: -47.0578,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: true,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["parque", "lago", "caminhada", "natureza", "lazer", "familia"], status: "active",
    dataPending: true,
  },
  {
    name: "Igreja Matriz do Divino Espírito Santo",
    _categorySlug: "pontos-turisticos",
    shortDesc: "Principal templo católico de Holambra com arquitetura moderna decorada com flores — símbolo religioso e cultural da cidade",
    longDesc: "A Igreja Matriz do Divino Espírito Santo é o principal templo católico de Holambra, conhecida por sua arquitetura moderna e minimalista, decorada com muitas flores. Localizada na Alameda Maurício de Nassau, 688, fica próxima ao Deck do Amor e à Expoflora. Missas aos sábados às 19h30 e domingos às 10h — programação pode variar em datas festivas, recomenda-se verificar o Instagram da paróquia para atualizações.",
    address: "Alameda Maurício de Nassau, 688 - Centro, Holambra - SP", lat: -22.6285, lng: -47.0593,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: true,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["igreja", "religiao", "cultura", "historia", "arquitetura", "holandes"], status: "active",
    dataPending: true,
  },
  {
    name: "Igreja Nossa Senhora das Flores",
    _categorySlug: "pontos-turisticos",
    shortDesc: "Santuário dedicado à padroeira de Holambra — Nossa Senhora das Flores — símbolo da devoção e da identidade floral da cidade",
    longDesc: "A Igreja Nossa Senhora das Flores é o santuário dedicado à padroeira de Holambra — a Nossa Senhora das Flores, cuja devoção está no coração da identidade cultural e religiosa da cidade. A relação entre a fé e as flores não é acidente: os imigrantes holandeses trouxeram tanto as sementes das flores quanto a devoção mariana, e os dois ficaram. A data festiva de Nossa Senhora das Flores é celebrada com procissões decoradas com flores frescas — uma das cerimônias mais bonitas do calendário religioso da cidade. Uma visita ao santuário complementa bem o passeio cultural pelo Museu da Cultura e pela Igreja Matriz.",
    address: "Holambra - SP", lat: -22.6289, lng: -47.0598,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: true,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["igreja", "religiao", "cultura", "flores", "padroeira", "historia"], status: "active",
    dataPending: true,
  },

  // ── Novos lugares gastronômicos — entorno do Holambra Garden Hotel ────────

  {
    name: "Don Hamburgo",
    slug: "don-hamburgo",
    _categorySlug: "hamburguerias",
    shortDesc: "Hamburgueria artesanal no centro de Holambra — opção forte para almoço e jantar perto do Garden Hotel",
    longDesc: "O Don Hamburgo é a referência em hambúrgueres artesanais de Holambra, localizado no centro da cidade na Av. das Tulipas. Cardápio focado em combinações generosas, com ingredientes de qualidade e montagem caprichada. Funciona tanto no almoço quanto no jantar, com atendimento constante — o que o torna uma das melhores opções para hóspedes do entorno que querem algo sólido sem buscar o boulevard. Ambiente descontraído, preço justo e fácil acesso de quem está hospedado na região central.",
    address: "Av. das Tulipas, 44 – Centro, Holambra – SP", lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    phone: "+55 19 97100-7176",
    openingHours: "Diariamente 10h30–15h e 18h–23h",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: false, isPartner: false,
    tags: ["hamburguer", "artesanal", "central", "almoco", "jantar", "lanche", "casual", "perto_do_garden"], status: "active",
    dataPending: false,
  },

  {
    name: "Fiore Forneria",
    slug: "fiore-forneria",
    _categorySlug: "pizzarias",
    shortDesc: "Forneria com pizzas e massas artesanais em quiosque aconchegante — noites de Qui a Dom",
    longDesc: "A Fiore Forneria opera num quiosque charmoso no Seção A de Holambra, com proposta de forno a lenha artesanal. O cardápio gira em torno de pizzas e fornadas autorais, com ingredientes frescos e receitas que fogem do padrão das pizzarias de bairro. Funciona de quinta a domingo no período noturno — uma boa opção para jantar em noites que a demanda nos restaurantes maiores está alta.",
    address: "R. Iris, Quiosque 1 – Secção A, Holambra – SP", lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    phone: "+55 19 99402-5403",
    openingHours: "Qui–Sab 18h–22h | Dom 18h–21h",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["pizza", "forneria", "jantar", "artesanal", "forno_a_lenha", "seccao_a"], status: "active",
    dataPending: false,
  },

  {
    name: "Vecchio Onofre",
    slug: "vecchio-onofre",
    _categorySlug: "pizzarias",
    shortDesc: "Pizzaria tradicional no bairro Groot — de terça a domingo no jantar",
    longDesc: "O Vecchio Onofre é uma pizzaria de bairro com personalidade, instalada no bairro Groot de Holambra. O cardápio segue a linha italiana clássica — massas, pizzas e antepastos — com ambiente familiar e atendimento acolhedor. Funciona de terça a domingo no período noturno. Uma boa alternativa para quem quer fugir do centro e encontrar algo mais tranquilo no jantar.",
    address: "Av. das Dálias, 753 – Groot, Holambra – SP", lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    phone: "+55 19 3802-5270",
    openingHours: "Ter–Dom 18h–22h30",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["pizza", "italiano", "jantar", "groot", "bairro", "familia", "massas"], status: "active",
    dataPending: false,
  },

  {
    name: "Casa da Esfiha",
    slug: "casa-da-esfiha",
    _categorySlug: "restaurantes",
    shortDesc: "Esfihas e salgados árabes frescos — opção rápida de jantar todos os dias da semana",
    longDesc: "A Casa da Esfiha é uma das poucas opções de culinária árabe em Holambra, com foco em esfihas, kibe e salgados frescos preparados diariamente. Funciona no período noturno todos os dias, com atendimento ágil — ideal para uma refeição rápida antes ou depois de passear pelo centro. Preço acessível e boa para grupos pequenos ou refeições informais.",
    address: "R. Campo do Pouso, 826, Holambra – SP", lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    phone: "+55 19 98961-0366",
    openingHours: "Diariamente 17h–22h40",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["esfiha", "arabe", "lanche", "jantar", "rapido", "acessivel", "diario"], status: "active",
    dataPending: false,
  },

  {
    name: "Italia No Box Holambra",
    slug: "italia-no-box-holambra",
    _categorySlug: "pizzarias",
    shortDesc: "Culinária italiana em formato casual — massas e pizzas de Ter a Sáb, almoço e jantar",
    longDesc: "O Italia No Box Holambra traz culinária italiana num formato descomplicado, com cardápio de massas e pizzas para consumo no local ou retirada. Funciona em dois turnos de terça a sábado — almoço e jantar — o que facilita encaixar no roteiro de quem está na cidade por mais de um dia. Boa opção complementar às pizzarias tradicionais do centro, com uma proposta mais prática e acessível.",
    address: "Holambra – SP", lat: null, lng: null,
    city: "Holambra", state: "SP", country: "Brasil",
    phone: "+55 19 98101-1798",
    openingHours: "Ter–Sab 11h–16h e 18h–21h30",
    priceRange: "$$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["italiano", "massas", "pizza", "almoco", "jantar", "casual", "dois_turnos"], status: "active",
    dataPending: false,
  },
];

// ─── Runner ───────────────────────────────────────────────────────────────────
export async function seedHolambra() {
  console.log("🌷 Iniciando seed dos 60 lugares reais de Holambra...\n");

  // ── Regra de curadoria: dataPending=true → isRecommended=false e isFeatured=false ─────
  const violations = HOLAMBRA_PLACES.filter(
    (p) => p.dataPending && (p.isRecommended || p.isFeatured)
  );
  if (violations.length > 0) {
    console.error("❌ Violação de regra curatorial detectada:");
    violations.forEach((v) => console.error(`   - "${v.name}": dataPending=true mas isRecommended=${v.isRecommended}, isFeatured=${v.isFeatured}`));
    process.exit(1);
  }

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

  // 1b. Migrações de rename — idempotente:
  //   a) Se newName já existe no banco → deleta oldName (duplicata do seed anterior)
  //   b) Se newName não existe → renomeia oldName para newName (preserva o ID original)
  const RENAMES: Array<{ oldName: string; newName: string; city: string }> = [
    { oldName: "Seo Carneiro Bar", newName: "Cervejaria Seo Carneiro", city: "Holambra" },
    { oldName: "Garden Restaurante", newName: "De Immigrant Restaurante Garden", city: "Holambra" },
  ];
  for (const { oldName, newName, city } of RENAMES) {
    const [oldRow] = await db
      .select()
      .from(places)
      .where(sql`name = ${oldName} AND city = ${city}`)
      .limit(1);
    if (!oldRow) continue;
    const [newRow] = await db
      .select()
      .from(places)
      .where(sql`name = ${newName} AND city = ${city}`)
      .limit(1);
    if (newRow) {
      // newName já existe — remove o row legado com o nome antigo
      await db.execute(sql`DELETE FROM places WHERE name = ${oldName} AND city = ${city}`);
      console.log(`  🗑️  Removida entrada legada "${oldName}" (já existe "${newName}")`);
    } else {
      // newName não existe — renomeia preservando o ID original
      await db.execute(sql`UPDATE places SET name = ${newName} WHERE name = ${oldName} AND city = ${city}`);
      console.log(`  🔄 Renomeado "${oldName}" → "${newName}"`);
    }
  }

  // 2. Upsert dos lugares via ON DUPLICATE KEY UPDATE (keyed on name+city)
  console.log("\n📍 Realizando upsert dos lugares...");
  let upserted = 0;

  for (const placeData of HOLAMBRA_PLACES) {
    const { _categorySlug, ...placeFields } = placeData;
    const categoryId = categoryIdMap[_categorySlug] ?? null;

    // Structural safeguard: dataPending=true → force isFeatured=false, isRecommended=false
    if (placeFields.dataPending && (placeFields.isFeatured || placeFields.isRecommended)) {
      console.warn(`  ⚠️  SAFEGUARD: ${placeFields.name} tem dataPending=true mas isFeatured/isRecommended=true — corrigindo automaticamente`);
      placeFields.isFeatured = false;
      placeFields.isRecommended = false;
    }

    const insertValues: InsertPlace = {
      ...placeFields,
      categoryId,
    };

    await db
      .insert(places)
      .values(insertValues)
      .onDuplicateKeyUpdate({
        set: {
          // Campos estruturais: sempre refletem o seed canônico.
          categoryId: insertValues.categoryId,
          priceRange: insertValues.priceRange,
          isFree: insertValues.isFree,
          // dataPending: seed é fonte de verdade para verificação pública.
          // Se o seed diz false (dados confirmados), garante que o DB também fica false.
          // Isso corrige lugares renomeados que herdaram dataPending=true do nome antigo.
          dataPending: insertValues.dataPending,
          // shortDesc e longDesc: atualizados quando o seed tem texto canônico.
          shortDesc: insertValues.shortDesc,
          longDesc: insertValues.longDesc,
          updatedAt: new Date(),
        },
      });

    console.log(`  ✅ ${placeFields.name} (dataPending=${placeFields.dataPending})`);
    upserted++;
  }

  console.log(`\n🎉 Seed concluído! ${upserted} lugar(es) inseridos/atualizados via upsert.`);

  // 3. Anchor longDesc enforcement — actualiza longDescs editoriais das páginas âncora
  // Isso garante que o longDesc seja persistido mesmo em rows já existentes no banco.
  console.log("\n✍️  Atualizando longDescs das páginas âncora...");
  const ANCHOR_LONG_DESCS: Array<{ name: string; city: string; longDesc: string }> = [
    {
      name: "Moinho Povos Unidos",
      city: "Holambra",
      longDesc: "O Moinho Povos Unidos é o símbolo mais icônico de Holambra e o ponto de referência de toda a cidade. Construído pelos imigrantes holandeses, ele marca o fim do eixo de passeio do centro — quem percorre a Rua dos Guarda-Chuvas, passa pelo Deck do Amor e segue pela Praça Vitória Régia inevitavelmente chega a ele. É gratuito, está sempre acessível e a qualquer hora do dia oferece uma boa fotografia — ao amanhecer com neblina, ao pôr do sol com luz dourada, ou à noite com iluminação. Em setembro, durante a Expoflora, os campos ao redor ficam tomados por flores e o cenário se torna absolutamente impossível de ignorar.",
    },
    {
      name: "Martin Holandesa Confeitaria e Restaurante",
      city: "Holambra",
      longDesc: "A Martin Holandesa é uma das mais antigas confeitarias de Holambra e uma referência obrigatória para quem visita o Boulevard Holandês. Fundada pela família Martin, ela mantém viva a tradição da confeitaria holandesa com produtos como stroopwafels, speculaas e pães artesanais de receita original. O ambiente é acolhedor, com decoração que remete à imigração — cada detalhe conta um pedaço da história da cidade. É o lugar ideal para o café da manhã ou para levar um presente típico de Holambra: os stroopwafels embalados são um dos souvenirs mais procurados pelos visitantes.",
    },
    {
      name: "The Old Dutch",
      city: "Holambra",
      longDesc: "O The Old Dutch é uma das casas mais tradicionais do Boulevard Holandês, com um cardápio que inclui pratos típicos da culinária holandesa e brasileira em um ambiente que lembra os primeiros anos da colonização de Holambra. A fachada histórica, os detalhes decorativos e o atendimento familiar fazem dele uma parada especialmente valorizada por quem quer entender a alma da cidade. Ideal para o almoço após visitar o Moinho Povos Unidos ou o Museu da Cultura — a localização no eixo central facilita combinar as paradas.",
    },
    {
      name: "Hana Restaurante Holambra",
      city: "Holambra",
      longDesc: "O Hana Restaurante é uma surpresa bem-vinda em Holambra: em uma cidade de forte identidade holandesa, encontrar culinária japonesa de qualidade chama a atenção. O cardápio inclui sushis, sashimis e pratos quentes orientais executados com capricho — longe do estilo rodízio apressado das grandes cidades. O ambiente é tranquilo e o atendimento cuidadoso. É o tipo de restaurante que os moradores frequentam regularmente e que os visitantes encontram por recomendação boca a boca.",
    },
    {
      name: "Lago do Holandês",
      city: "Holambra",
      longDesc: "O Lago do Holandês é um dos raros restaurantes de Holambra com vista privilegiada para o lago central da cidade — o mesmo espelho d'água que se avista do Deck do Amor e da Praça Vitória Régia. O cardápio inclui pratos de almoço com influências da culinária regional e o ambiente ao ar livre é o grande diferencial: mesas à sombra com ventilação natural e uma paisagem que relaxa desde antes de você pedir. Ideal para almoços de família ou casais que querem combinar gastronomia com a vista mais bonita de Holambra.",
    },
    {
      name: "Nossa Prainha",
      city: "Holambra",
      longDesc: "A Nossa Prainha é uma das atrações mais inusitadas de Holambra: uma praia de areia às margens do Lago do Holandês, com infraestrutura de lazer, sombreiros e acesso à água. É especialmente procurada no verão por famílias com crianças — a água do lago é tranquila, o espaço é seguro e há opções de alimentação por perto. Para os visitantes que não esperavam encontrar uma praia no interior paulista, a surpresa é total. Um ponto de lazer que une moradores e turistas e que faz parte do eixo de passeio natural ao redor do lago central.",
    },
    {
      name: "Cervejaria Seo Carneiro",
      city: "Holambra",
      longDesc: "A Cervejaria Seo Carneiro é o ponto de encontro mais autêntico de Holambra para os amantes de cerveja artesanal. Com um cardápio que mescla rótulos próprios e selecionados, o ambiente é descontraído, barulhento do jeito certo e cheio de gente que volta sempre. Os petiscos combinam com as cervejas e o atendimento é aquele estilo de bar de bairro que faz falta nas cidades grandes. É o tipo de lugar que aparece nas histórias de quem visita Holambra e não esperava encontrar um bom bar artesanal por lá.",
    },
    {
      name: "Parque Van Gogh",
      city: "Holambra",
      longDesc: "O Parque Van Gogh é o cartão-postal mais fotografado de Holambra: campos de flores coloridas dispostas em blocos geométricos que evocam os quadros do pintor holandês que dá nome ao espaço. A entrada é paga e vale o investimento — especialmente durante o pico do florescimento entre agosto e outubro. O parque tem área de piquenique, café interno e espaço amplo que funciona para famílias e casais. É um dos pontos mais requisitados da cidade durante o Festival das Flores e a primeira parada recomendada para quem chega em Holambra pela primeira vez.",
    },
    {
      name: "Praça Vitória Régia",
      city: "Holambra",
      longDesc: "A Praça Vitória Régia é o centro nevrálgico de Holambra: o ponto de chegada de quem percorre o Boulevard Holandês, o espaço de encontro dos moradores e o palco dos eventos da cidade. Com um espelho d'água central decorado com vitórias-régias, bancos à sombra e acesso direto ao Deck do Amor e ao Lago do Holandês, ela é tanto uma parada de descanso quanto um miradouro natural. A praça é gratuita, sempre aberta e animada nos fins de semana com famílias, músicos e comerciantes locais. É o coração da cidade a céu aberto.",
    },
    {
      name: "Rua dos Guarda-Chuvas",
      city: "Holambra",
      longDesc: "A Rua dos Guarda-Chuvas é a instalação mais instagramável de Holambra: um túnel de guarda-chuvas coloridos suspensos sobre a calçada que cria uma atmosfera festiva e visualmente marcante. Localizada no centro histórico, próximo ao Boulevard Holandês, ela é ponto de parada obrigatória para fotos e integra o circuito de passeio a pé do centro. É especialmente fotogênica no início da manhã e no final da tarde, quando a luz atravessa os guarda-chuvas e cria tons quentes na calçada. Gratuita e sempre disponível.",
    },
    {
      name: "De Immigrant Gastro Café",
      city: "Holambra",
      longDesc: "O De Immigrant Gastro Café é a versão diurna da experiência De Immigrant — mais leve, mais rápida e com um cardápio de café da manhã e brunch que combina muito bem com a vibe do Boulevard Holandês. Croissants, quiches, panquecas e cafés especiais em um ambiente com decoração que remete à imigração europeia. É o ponto certo para começar o dia em Holambra antes de seguir para o Parque Van Gogh ou o Moinho Povos Unidos. Funciona de quarta a domingo, a partir das 9h.",
    },
    {
      name: "Macena Flores",
      city: "Holambra",
      longDesc: "A Macena Flores é o principal ponto de compra de flores e plantas de Holambra para visitantes. Com um mix impressionante de variedades — de buquês prontos a plantas raras — e preços de produtor que justificam o deslocamento, é uma parada que a maioria dos turistas faz ao encerrar o passeio pela cidade. O espaço é amplo, com estacionamento próprio e atendimento que conhece profundamente os produtos. Ideal para quem quer levar algo vivo de Holambra para casa.",
    },
    {
      name: "Bloemen Park",
      city: "Holambra",
      longDesc: "O Bloemen Park é um dos parques de flores mais acessíveis e completos de Holambra, com entrada paga e uma proposta familiar: campos de flores organizados em corredores temáticos, moinhos decorativos, área de lazer infantil e gastronomia no local. A experiência é mais tranquila e menos concorrida que o Parque Van Gogh, o que o torna a melhor opção para famílias com crianças pequenas ou para quem quer uma experiência menos massificada. Programação especial durante o Festival das Flores em setembro.",
    },
    {
      name: "Deck do Amor",
      city: "Holambra",
      longDesc: "O Deck do Amor é o mirante mais romântico de Holambra: uma plataforma de madeira que avança sobre o Lago do Holandês e oferece uma das melhores vistas da cidade. Ao entardecer, com o reflexo da luz no lago e os pássaros sobrevoando a água, o deck vira ponto de parada quase obrigatório para casais que passam por Holambra. É gratuito, de acesso livre e fica no eixo central do passeio entre a Praça Vitória Régia e a Nossa Prainha — fácil de combinar com qualquer roteiro pelo centro da cidade.",
    },
    {
      name: "Museu da Cultura e História de Holambra",
      city: "Holambra",
      longDesc: "O Museu da Cultura e História de Holambra é o lugar onde a história da imigração holandesa se torna tangível. Com acervo de objetos pessoais dos primeiros colonos, documentos, fotografias e reconstituições do cotidiano da fundação da cidade, o museu oferece contexto que transforma o passeio por Holambra em algo mais do que turismo de flores. A visita dura entre 40 e 60 minutos e funciona bem como ponto de partida para entender por que a cidade é do jeito que é — antes de seguir para o Boulevard Holandês e o Moinho Povos Unidos.",
    },
    {
      name: "Floricultura Veiling",
      city: "Holambra",
      longDesc: "A Floricultura Veiling é o coração comercial de Holambra — um dos maiores centros de comercialização de flores e plantas ornamentais do Brasil. O complexo movimenta milhões de flores diariamente, principalmente para atacadistas e floricultores, mas visitantes também encontram ali variedades e preços impossíveis de achar em centros urbanos. Menos turístico que o Parque Van Gogh ou a Macena Flores, a Veiling é o lugar onde a flor de Holambra acontece de verdade: escala industrial, diversidade impressionante e uma dinâmica de mercado que vale conhecer.",
    },
    {
      name: "Campo de Girassóis",
      city: "Holambra",
      longDesc: "Os campos de girassóis nas estradas ao redor de Holambra são uma das atrações mais fotogênicas da região — e das menos formalizadas. Não existe um 'Campo de Girassóis oficial', mas sim propriedades agrícolas cujos campos florescem entre janeiro e março, transformando os acostamentos das estradas vicinais em corredores amarelos que chamam atenção de quem passa. O melhor jeito de encontrá-los é saindo de carro pelos arredores da cidade no verão, especialmente pela Estrada Municipal e pelos acessos à rodovia. Nenhum ingresso, nenhuma bilheteria — só a flor e a foto.",
    },
    {
      name: "Parque Linear do Lago",
      city: "Holambra",
      longDesc: "O Parque Linear do Lago é o pulmão verde de Holambra — uma faixa de área pública à beira do Lago do Holandês com pista de caminhada, bancos, iluminação e vegetação nativa. É onde os moradores caminham de manhã, onde as famílias levam as crianças no fim de tarde e onde você consegue uma vista do lago mais tranquila do que na Praça Vitória Régia. O parque se estende do Deck do Amor até a Nossa Prainha, conectando os dois pontos mais visitados do eixo do lago. Entrada livre, sempre aberto.",
    },
    {
      name: "Igreja Matriz do Divino Espírito Santo",
      city: "Holambra",
      longDesc: "A Igreja Matriz do Divino Espírito Santo é o principal templo católico de Holambra, conhecida por sua arquitetura moderna e minimalista, decorada com muitas flores. Localizada na Alameda Maurício de Nassau, 688, fica próxima ao Deck do Amor e à Expoflora. Missas aos sábados às 19h30 e domingos às 10h — programação pode variar em datas festivas, recomenda-se verificar o Instagram da paróquia para atualizações.",
    },
    {
      name: "Igreja Nossa Senhora das Flores",
      city: "Holambra",
      longDesc: "A Igreja Nossa Senhora das Flores é o santuário dedicado à padroeira de Holambra — a Nossa Senhora das Flores, cuja devoção está no coração da identidade cultural e religiosa da cidade. A relação entre a fé e as flores não é acidente: os imigrantes holandeses trouxeram tanto as sementes das flores quanto a devoção mariana, e os dois ficaram. A data festiva de Nossa Senhora das Flores é celebrada com procissões decoradas com flores frescas — uma das cerimônias mais bonitas do calendário religioso da cidade. Uma visita ao santuário complementa bem o passeio cultural pelo Museu da Cultura e pela Igreja Matriz.",
    },
    {
      name: "De Immigrant Restaurante Garden",
      city: "Holambra",
      longDesc: "O De Immigrant Restaurante Garden ocupa um espaço garden que combina gastronomia da imigração holandesa com ambiente aberto e culturalmente rico. Na Rua Dória Vasconcelos, 229, vizinho ao Gastro Café, tem proposta mais voltada ao almoço e jantar — cardápio autoral com raízes na colônia. Um dos endereços mais importantes do corredor gastronômico de Holambra.",
    },
    {
      name: "Holambra Garden Hotel",
      city: "Holambra",
      longDesc: "O Holambra Garden Hotel é uma das escolhas mais equilibradas da cidade: localização central, jardins bem cuidados, quartos confortáveis e um café da manhã com ingredientes locais que já vale a estadia. Atende bem tanto casais em fim de semana quanto viajantes a trabalho.",
    },
    {
      name: "Fratelli Wine Bar",
      city: "Holambra",
      longDesc: "O Fratelli Wine Bar é o único wine bar de Holambra com proposta realmente focada em vinho de qualidade. Carta cuidadosa, petiscos que combinam com a seleção e um ambiente que funciona muito bem para jantares de casal ou encontros com amigos que valorizam a experiência. É o tipo de lugar que faz falta em cidades menores e que Holambra tem sorte de ter.",
    },
  ];

  for (const anchor of ANCHOR_LONG_DESCS) {
    await db.execute(
      sql`UPDATE places SET \`longDesc\` = ${anchor.longDesc}, \`updatedAt\` = NOW()
          WHERE name = ${anchor.name} AND city = ${anchor.city}
            AND (\`longDesc\` IS NULL OR \`longDesc\` = '' OR CHAR_LENGTH(\`longDesc\`) < 80)`
    );
    console.log(`  ✍️  longDesc → ${anchor.name}`);
  }
  console.log("  ✅ longDescs das âncoras atualizados.\n");
}

if (process.argv[1] && (process.argv[1].endsWith("seed-holambra.ts") || process.argv[1].endsWith("seed-holambra.js"))) {
  seedHolambra().catch((err) => {
    console.error("Erro fatal:", err);
    process.exit(1);
  });
}
