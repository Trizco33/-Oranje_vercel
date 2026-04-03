export interface MockNotification {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  type: string;
}

export const mockNotifications: MockNotification[] = [
  { id: 1, title: "Bem-vindo ao Oranje! 🌷", content: "Explore o melhor de Holambra com o Oranje. Descubra restaurantes, cafés, eventos e muito mais!", createdAt: "2026-03-18T10:00:00Z", isRead: false, type: "welcome" },
  { id: 2, title: "Expoflora 2026 chegando!", content: "A maior exposição de flores da América Latina começa em setembro. Garanta seu ingresso antecipado!", createdAt: "2026-03-17T14:00:00Z", isRead: false, type: "event" },
  { id: 3, title: "Novo voucher disponível", content: "Ganhe 15% de desconto no Martin Holandesa. Use o código ORANJE15.", createdAt: "2026-03-15T09:00:00Z", isRead: true, type: "voucher" },
  { id: 4, title: "Roteiro em destaque", content: "Confira o novo roteiro 'Holambra Romântica' perfeito para casais!", createdAt: "2026-03-14T16:00:00Z", isRead: true, type: "route" },
];
