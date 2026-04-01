export interface MockReview {
  id: number;
  placeId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpfulCount: number;
}

export const mockReviews: MockReview[] = [
  { id: 1, placeId: 1, userName: "Fernanda M.", rating: 5, comment: "Comida maravilhosa! Os bitterballen são incríveis. Ambiente acolhedor e atendimento impecável.", createdAt: "2026-03-10", helpfulCount: 12 },
  { id: 2, placeId: 1, userName: "Lucas R.", rating: 4, comment: "Ótima experiência gastronômica. Preços um pouco acima da média mas vale cada centavo.", createdAt: "2026-02-28", helpfulCount: 5 },
  { id: 3, placeId: 2, userName: "Carolina S.", rating: 5, comment: "Melhor café de Holambra! O bolo de cenoura com cobertura de chocolate é divino.", createdAt: "2026-03-05", helpfulCount: 18 },
  { id: 4, placeId: 2, userName: "Marcos P.", rating: 5, comment: "Lugar incrível, super instagramável. Café de qualidade excepcional.", createdAt: "2026-02-15", helpfulCount: 9 },
  { id: 5, placeId: 4, userName: "Julia L.", rating: 5, comment: "Parque lindo! As crianças adoraram. Muitas flores e esculturas. Fotos incríveis!", createdAt: "2026-03-12", helpfulCount: 22 },
  { id: 6, placeId: 4, userName: "André G.", rating: 4, comment: "Belo passeio, especialmente na primavera. Recomendo chegar cedo para evitar filas.", createdAt: "2026-01-20", helpfulCount: 7 },
  { id: 7, placeId: 7, userName: "Patricia N.", rating: 5, comment: "Paraíso das flores! Comprei orquídeas lindas por um preço justo.", createdAt: "2026-03-01", helpfulCount: 15 },
  { id: 8, placeId: 10, userName: "Ricardo B.", rating: 5, comment: "Hotel impecável. Spa relaxante, café da manhã maravilhoso e jardins encantadores.", createdAt: "2026-02-20", helpfulCount: 11 },
  { id: 9, placeId: 13, userName: "Amanda K.", rating: 5, comment: "Melhor fondue que já comi! Queijo gouda derretido no ponto perfeito.", createdAt: "2026-03-08", helpfulCount: 8 },
  { id: 10, placeId: 22, userName: "Thiago V.", rating: 5, comment: "Experiência gastronômica de outro nível. O menu degustação é uma obra de arte.", createdAt: "2026-02-14", helpfulCount: 20 },
];
