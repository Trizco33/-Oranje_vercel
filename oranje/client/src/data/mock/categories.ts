export interface MockCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  coverImage: string;
  count: number;
}

export const mockCategories: MockCategory[] = [
  {
    id: 1,
    name: "Restaurantes",
    slug: "restaurantes",
    description: "Os melhores restaurantes de Holambra com culinária holandesa, brasileira e internacional",
    icon: "🍽️",
    coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=300&fit=crop",
    count: 12,
  },
  {
    id: 2,
    name: "Pizzarias",
    slug: "pizzarias",
    description: "Pizzarias artesanais e tradicionais com sabores únicos",
    icon: "🍕",
    coverImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=300&fit=crop",
    count: 5,
  },
  {
    id: 3,
    name: "Bares",
    slug: "bares",
    description: "Bares e pubs com drinks artesanais e cervejas especiais",
    icon: "🍷",
    coverImage: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=300&fit=crop",
    count: 6,
  },
  {
    id: 4,
    name: "Cafés",
    slug: "cafes",
    description: "Cafeterias charmosas com cafés especiais e doces artesanais",
    icon: "☕",
    coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=300&fit=crop",
    count: 8,
  },
  {
    id: 5,
    name: "Pontos Turísticos",
    slug: "pontos-turisticos",
    description: "Atrações turísticas, parques e jardins floridos de Holambra",
    icon: "🌷",
    coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/54/25/2e/rosas-de-jardim.jpg?w=900&h=500&s=1",
    count: 10,
  },
  {
    id: 6,
    name: "Hospedagem",
    slug: "hospedagem",
    description: "Hotéis, pousadas e chalés aconchegantes para sua estadia",
    icon: "🏨",
    coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=300&fit=crop",
    count: 7,
  },
  {
    id: 7,
    name: "Eventos",
    slug: "eventos",
    description: "Festivais, feiras e eventos culturais da cidade das flores",
    icon: "🎉",
    coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=300&fit=crop",
    count: 5,
  },
];
