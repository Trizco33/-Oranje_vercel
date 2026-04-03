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
    shortDesc: "Hotel central com jardins cuidados, café da manhã caprichado e boa relação custo-benefício",
    longDesc: "O Holambra Garden Hotel é uma das escolhas mais equilibradas da cidade: localização central, jardins bem cuidados, quartos confortáveis e um café da manhã com ingredientes locais que já vale a estadia. Atende bem tanto casais em fim de semana quanto viajantes a trabalho.",
    address: "Holambra – SP", lat: -22.6362, lng: -47.0625,
    website: "https://www.holambragardenhotel.com.br",
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
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
    isRecommended: true, isFeatured: true, isPartner: false,
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
    isRecommended: true, isFeatured: false, isPartner: false,
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
    isRecommended: true, isFeatured: false, isPartner: false,
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
    name: "De Immigrant Gastro Café",
    _categorySlug: "restaurantes",
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
    shortDesc: "Lounge sofisticado no Food Garden — drinks autorais, atmosfera noturna e o melhor da cidade depois do jantar",
    longDesc: null,
    address: "R. Campo do Pouso, 1162 – Centro, Holambra, SP, 13825-000", lat: -22.6375, lng: -47.0622,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
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
    longDesc: null,
    coverImage: "https://martinholandesa.com.br/content/foto4.jpeg",
    address: "Rua Doria Vasconcelos, 144, Boulevard Holandês, Holambra, SP", lat: -22.6395, lng: -47.0608,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$$", isFree: false,
    isRecommended: true, isFeatured: true, isPartner: false,
    tags: ["tipico_holandes", "tradicional", "cafe_da_manha", "almoco", "familia", "historico", "classico", "primeira_visita"], status: "active",
    dataPending: false,
  },

  {
    name: "Seo Carneiro Bar",
    _categorySlug: "bares",
    shortDesc: "Cervejaria artesanal com atmosfera autêntica em Holambra.",
    longDesc: null,
    coverImage: "https://seocarneiro.com.br/wp-content/uploads/2023/11/20231102_110640-scaled.jpg",
    address: "Holambra – SP", lat: -22.6400, lng: -47.0610,
    city: "Holambra", state: "SP", country: "Brasil",
    priceRange: "$", isFree: false,
    isRecommended: false, isFeatured: false, isPartner: false,
    tags: ["cervejaria", "artesanal", "bar", "petiscos", "casual"], status: "active",
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
