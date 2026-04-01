export interface MockArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImageUrl: string;
  category: string;
  publishedAt: string;
  isPublished: boolean;
  author: string;
}

export const mockArticleCategories = [
  "Gastronomia",
  "Turismo",
  "Cultura",
  "Eventos",
  "Dicas",
];

export const mockArticles: MockArticle[] = [
  {
    id: 1,
    title: "Os 10 Melhores Restaurantes de Holambra em 2026",
    slug: "melhores-restaurantes-holambra-2026",
    content: "Holambra é um verdadeiro paraíso gastronômico...\n\nDescubra os restaurantes que estão fazendo sucesso na cidade das flores.",
    excerpt: "Descubra os restaurantes que estão fazendo sucesso na cidade das flores.",
    coverImageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
    category: "Gastronomia",
    publishedAt: "2026-03-10T10:00:00Z",
    isPublished: true,
    author: "Equipe Oranje",
  },
  {
    id: 2,
    title: "Guia Completo: O Que Fazer em Holambra",
    slug: "guia-completo-holambra",
    content: "Holambra oferece experiências para todos os gostos...",
    excerpt: "Tudo o que você precisa saber para aproveitar ao máximo sua visita.",
    coverImageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Montagem_Holambra.jpg",
    category: "Turismo",
    publishedAt: "2026-03-05T14:00:00Z",
    isPublished: true,
    author: "Equipe Oranje",
  },
  {
    id: 3,
    title: "A História da Imigração Holandesa em Holambra",
    slug: "historia-imigracao-holandesa-holambra",
    content: "Em 1948, um grupo de famílias holandesas chegou ao Brasil...",
    excerpt: "Conheça a fascinante história dos imigrantes que fundaram a cidade das flores.",
    coverImageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop",
    category: "Cultura",
    publishedAt: "2026-02-28T09:00:00Z",
    isPublished: true,
    author: "Equipe Oranje",
  },
  {
    id: 4,
    title: "Expoflora 2026: Tudo Sobre o Maior Evento de Holambra",
    slug: "expoflora-2026-guia",
    content: "A Expoflora é o evento mais aguardado do ano...",
    excerpt: "Datas, ingressos, atrações e dicas para aproveitar ao máximo.",
    coverImageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
    category: "Eventos",
    publishedAt: "2026-02-20T11:00:00Z",
    isPublished: true,
    author: "Equipe Oranje",
  },
  {
    id: 5,
    title: "5 Dicas Para Fotografar Flores em Holambra",
    slug: "dicas-fotografar-flores-holambra",
    content: "Holambra é um prato cheio para fotógrafos...",
    excerpt: "Aprenda técnicas para capturar a beleza das flores como um profissional.",
    coverImageUrl: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=400&fit=crop",
    category: "Dicas",
    publishedAt: "2026-02-15T16:00:00Z",
    isPublished: true,
    author: "Equipe Oranje",
  },
];
