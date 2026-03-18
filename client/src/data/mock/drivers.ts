export interface MockDriver {
  id: number;
  name: string;
  phone: string;
  whatsapp: string;
  serviceType: string;
  region: string;
  vehicle: string;
  capacity: number;
  notes: string;
  photo: string;
  isPartner: boolean;
  isVerified: boolean;
  createdAt: string;
}

export const mockDrivers: MockDriver[] = [
  {
    id: 1,
    name: "Carlos Oliveira",
    phone: "(19) 99812-3456",
    whatsapp: "5519998123456",
    serviceType: "Transfer",
    region: "Holambra e Região",
    vehicle: "Toyota Corolla 2024",
    capacity: 4,
    notes: "Transfer aeroporto Viracopos, rodoviária de Campinas. Ar condicionado, Wi-Fi.",
    photo: "",
    isPartner: true,
    isVerified: true,
    createdAt: "2025-10-15",
  },
  {
    id: 2,
    name: "Maria Santos",
    phone: "(19) 99765-4321",
    whatsapp: "5519997654321",
    serviceType: "Passeio turístico",
    region: "Holambra",
    vehicle: "Volkswagen T-Cross 2025",
    capacity: 4,
    notes: "Passeios guiados pela cidade. Conheço todos os pontos turísticos e melhores restaurantes!",
    photo: "",
    isPartner: true,
    isVerified: true,
    createdAt: "2025-11-20",
  },
  {
    id: 3,
    name: "Roberto van der Berg",
    phone: "(19) 99654-7890",
    whatsapp: "5519996547890",
    serviceType: "Van",
    region: "Holambra, Campinas, Jaguariúna",
    vehicle: "Mercedes Sprinter 2023",
    capacity: 15,
    notes: "Van executiva para grupos. Ideal para excursões e eventos corporativos.",
    photo: "",
    isPartner: false,
    isVerified: true,
    createdAt: "2025-12-01",
  },
  {
    id: 4,
    name: "Ana Beatriz Lima",
    phone: "(19) 99543-2109",
    whatsapp: "5519995432109",
    serviceType: "Transfer",
    region: "Holambra e Campinas",
    vehicle: "Honda Civic 2024",
    capacity: 4,
    notes: "Transfer para aeroportos e rodoviárias. Pontualidade garantida.",
    photo: "",
    isPartner: false,
    isVerified: false,
    createdAt: "2026-01-10",
  },
  {
    id: 5,
    name: "Pedro Henrique Costa",
    phone: "(19) 99432-1098",
    whatsapp: "5519994321098",
    serviceType: "Passeio turístico",
    region: "Holambra e circuito das flores",
    vehicle: "Jeep Compass 2024",
    capacity: 4,
    notes: "Roteiros personalizados com guia em português, inglês e holandês.",
    photo: "",
    isPartner: true,
    isVerified: true,
    createdAt: "2026-02-05",
  },
];
