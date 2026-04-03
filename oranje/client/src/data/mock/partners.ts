export interface MockPartner {
  id: number;
  name: string;
  category: string;
  logo: string;
  description: string;
  website: string;
  discount: string;
  plan: string;
  isActive: boolean;
}

export const mockPartners: MockPartner[] = [
  { id: 1, name: "Martin Holandesa", category: "Gastronomia", logo: "", description: "Confeitaria e restaurante holandês no Boulevard Holandês", website: "https://martinholandesa.com.br", discount: "15% no almoço", plan: "Premium", isActive: true },
  { id: 2, name: "Café Moinho", category: "Cafés", logo: "", description: "Cafés especiais e bolos artesanais", website: "", discount: "15% em bebidas", plan: "Destaque", isActive: true },
  { id: 3, name: "Pousada Campos de Tulipas", category: "Hospedagem", logo: "", description: "Chalés aconchegantes", website: "", discount: "20% em diárias (seg-qui)", plan: "Premium", isActive: true },
  { id: 4, name: "Pizzaria Bella Napoli", category: "Gastronomia", logo: "", description: "Pizzas artesanais em forno a lenha", website: "", discount: "Refrigerante grátis", plan: "Essencial", isActive: true },
  { id: 5, name: "Expoflora Garden Center", category: "Turismo", logo: "", description: "Flores e plantas ornamentais", website: "https://expoflora.com.br", discount: "10% em plantas", plan: "Premium", isActive: true },
  { id: 6, name: "Hotel Oranje", category: "Hospedagem", logo: "", description: "Hotel boutique de luxo", website: "https://hoteloranje.com.br", discount: "Late checkout grátis", plan: "Premium", isActive: true },
  { id: 7, name: "Bistrô Gouda", category: "Gastronomia", logo: "", description: "Fondues e queijos especiais", website: "", discount: "Sobremesa cortesia", plan: "Destaque", isActive: true },
  { id: 8, name: "Doceria Windmill", category: "Cafés", logo: "", description: "Doces holandeses tradicionais", website: "", discount: "1 stroopwafel grátis", plan: "Essencial", isActive: true },
  { id: 9, name: "Pousada Flor de Lótus", category: "Hospedagem", logo: "", description: "Pousada zen com spa", website: "", discount: "Massagem 30min cortesia", plan: "Destaque", isActive: true },
  { id: 10, name: "Pizzaria Forno Mágico", category: "Gastronomia", logo: "", description: "Pizzas criativas artesanais", website: "", discount: "10% na conta", plan: "Essencial", isActive: true },
  { id: 11, name: "Empório das Flores", category: "Compras", logo: "", description: "Flores e produtos artesanais", website: "", discount: "15% em arranjos", plan: "Destaque", isActive: true },
  { id: 12, name: "Restaurante Tulipa Negra", category: "Gastronomia", logo: "", description: "Fine dining com menu degustação", website: "", discount: "Copa de boas-vindas", plan: "Premium", isActive: true },
  { id: 13, name: "Vila Holandesa", category: "Turismo", logo: "", description: "Complexo turístico", website: "https://vilaholandesa.com.br", discount: "20% no ingresso", plan: "Premium", isActive: true },
  { id: 14, name: "Wine Bar Rótterdam", category: "Gastronomia", logo: "", description: "Vinhos e tapas gourmet", website: "", discount: "1ª taça cortesia", plan: "Destaque", isActive: true },
  { id: 15, name: "Restaurante Fazenda Ribeirão", category: "Gastronomia", logo: "", description: "Culinária caipira gourmet", website: "", discount: "Cafezinho e doce cortesia", plan: "Essencial", isActive: true },
  { id: 16, name: "Confeitaria Amsterdã", category: "Cafés", logo: "", description: "Doces e salgados artesanais", website: "", discount: "10% em compras acima de R$50", plan: "Essencial", isActive: true },
  { id: 17, name: "Gelato Fiore", category: "Cafés", logo: "", description: "Gelatos artesanais", website: "", discount: "Cobertura grátis", plan: "Essencial", isActive: true },
  { id: 18, name: "Pub The Orange", category: "Bares", logo: "", description: "Pub com cervejas importadas", website: "", discount: "Happy hour estendido", plan: "Destaque", isActive: true },
  { id: 19, name: "Bar do Holandês", category: "Bares", logo: "", description: "Cervejas artesanais e petiscos", website: "", discount: "Porção de bitterballen grátis", plan: "Essencial", isActive: true },
  { id: 20, name: "Churrasquinho do Jota", category: "Gastronomia", logo: "", description: "Espetinhos gourmet", website: "", discount: "Espetinho extra grátis", plan: "Essencial", isActive: true },
];

export interface MockVoucher {
  id: number;
  title: string;
  description: string;
  discount: string;
  code: string;
  placeId: number;
  placeName: string;
  expiresAt: string;
  isActive: boolean;
}

export const mockVouchers: MockVoucher[] = [
  { id: 1, title: "Desconto Martin Holandesa", description: "15% de desconto no almoço executivo", discount: "15%", code: "ORANJE15", placeId: 2613, placeName: "Martin Holandesa", expiresAt: "2026-06-30", isActive: true },
  { id: 2, title: "Café Grátis", description: "Ganhe um café espresso na compra de qualquer bolo", discount: "Café grátis", code: "CAFEMOINHO", placeId: 2, placeName: "Café Moinho", expiresAt: "2026-05-31", isActive: true },
  { id: 3, title: "Diária Especial", description: "20% OFF em diárias de segunda a quinta", discount: "20%", code: "TULIPA20", placeId: 3, placeName: "Pousada Campos de Tulipas", expiresAt: "2026-07-31", isActive: true },
  { id: 4, title: "Sobremesa Cortesia", description: "Ganhe uma sobremesa na compra de qualquer fondue", discount: "Sobremesa", code: "GOUDA2026", placeId: 13, placeName: "Bistrô Gouda", expiresAt: "2026-05-15", isActive: true },
  { id: 5, title: "Ingresso com Desconto", description: "20% OFF no ingresso da Vila Holandesa", discount: "20%", code: "VILA20", placeId: 24, placeName: "Vila Holandesa", expiresAt: "2026-08-31", isActive: true },
];

export interface MockAd {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  placement: string;
  isActive: boolean;
}

export const mockAds: MockAd[] = [
  {
    id: 1,
    title: "Expoflora 2026 - Garanta seu ingresso!",
    description: "A maior exposição de flores da América Latina. Ingressos com desconto antecipado.",
    image: "https://placehold.co/1200x600/e2e8f0/1e293b?text=A_vibrant_and_colorful_floral_display_or_bouquet_r",
    link: "https://expoflora.com.br",
    placement: "offers_page",
    isActive: true,
  },
];
