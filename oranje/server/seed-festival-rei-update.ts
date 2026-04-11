/**
 * seed-festival-rei-update.ts
 * Atualização completa dos 15 participantes do Festival Gastronômico do Mês do Rei.
 * Dados: nome, categoria, endereço, telefone, WhatsApp, Instagram, horário,
 * descrições e fotos públicas reais de cada estabelecimento.
 * Idempotente — atualiza por ID direto.
 */

import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { places } from "../drizzle/schema";

interface UpdateEntry {
  id: number;
  fields: Record<string, any>;
}

// ─── Categoria IDs ───────────────────────────────────────────────────────────
const CAT = {
  restaurante: 1,
  cafe: 2,
  bares: 14,
  hoteis: 15,
  hospedagem: 5,
  docerias: 17,
};

const UPDATES: UpdateEntry[] = [

  // ── 1. Restaurante Lago do Holandês (ID 2614) ─────────────────────────────
  {
    id: 2614,
    fields: {
      name: "Restaurante Lago do Holandês",
      slug: "lago-do-holandes",
      categoryId: CAT.restaurante,
      address: "Av. das Tulipas, 245, Centro, Holambra – SP",
      phone: "(19) 99648-6005",
      instagram: "lagodoholandes",
      openingHours: "Seg–Qui: 11:30–14:30 | Sex: 11:30–22:30 | Sáb: 11:00–22:30 | Dom: 11:00–16:30",
      tags: ["restaurante", "almoço", "jantar", "festival-rei", "gastronomia", "holambra", "lago"],
    },
  },

  // ── 2. Casa Bela Café - Restaurante (ID 24) ────────────────────────────────
  {
    id: 24,
    fields: {
      name: "Casa Bela Café - Restaurante",
      slug: "casa-bela-restaurante",
      categoryId: CAT.restaurante,
      address: "R. Dória Vasconcelos, 81, Centro, Holambra – SP",
      phone: "(19) 3802-8040",
      whatsapp: "5519996867612",
      instagram: "casabelarestaurante",
      openingHours: "Ter–Sex: 11:30–22:30 | Sáb: 11:30–23:00 | Dom: 11:30–22:00 | Fecha às segundas",
      coverImage: "https://casabelarestaurante.com.br/wp-content/uploads/2025/02/BRU_9396-scaled-4.jpg",
      tags: ["restaurante", "cafe", "almoço", "jantar", "festival-rei", "gastronomia", "holambra", "centro"],
    },
  },

  // ── 3. Restaurante Tratterie Holandesa (ID 25617) ─────────────────────────
  {
    id: 25617,
    fields: {
      name: "Restaurante Tratterie Holandesa",
      slug: "tratterie-holandesa",
      categoryId: CAT.restaurante,
      shortDesc: "Culinária italiana com identidade holandesa — almoços e jantares em Holambra",
      longDesc: "A Tratterie Holandesa une a tradição da gastronomia italiana ao charme de Holambra. Participante do Festival Gastronômico do Mês do Rei, serve pratos típicos da culinária italiana em ambiente familiar.",
      address: "R. Camélias, 317, Centro, Holambra – SP",
      phone: "(19) 99188-8927",
      instagram: "tratterieholandesa",
      openingHours: "Seg–Qui: 11:30–15:00 | Sex: 11:30–15:30 | Sáb/Dom/Feriados: 11:30–16:00",
      coverImage: "https://tratterieholandesa.com.br/wp-content/uploads/2024/03/tratterie-10.jpg",
      tags: ["restaurante", "italiano", "tratterie", "festival-rei", "almoço", "holambra", "trattoria-holandesa"],
    },
  },

  // ── 4. Restaurante Villa Girassol (ID 25) ─────────────────────────────────
  {
    id: 25,
    fields: {
      name: "Restaurante Villa Girassol",
      slug: "villa-girassol",
      categoryId: CAT.restaurante,
      address: "R. Dória Vasconcelos, 220, Centro, Holambra – SP",
      phone: "(19) 3802-2931",
      instagram: "villa_girassol",
      openingHours: "Seg/Ter/Qua: 11:00–15:00 | Qui/Sex/Dom: 11:00–16:00 e 18:00–22:00 | Sáb: 11:00–22:00",
      coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/31/db/da/a3/risoto-de-camarao.jpg?w=900&h=500&s=1",
      tags: ["restaurante", "almoço", "jantar", "festival-rei", "gastronomia", "holambra", "girassol"],
    },
  },

  // ── 5. Martin Holandesa (ID 2613) ─────────────────────────────────────────
  {
    id: 2613,
    fields: {
      name: "Martin Holandesa",
      slug: "martin-holandesa",
      categoryId: CAT.restaurante,
      address: "R. Dória Vasconcelos, 144, Centro, Holambra – SP",
      phone: "(19) 3802-1295",
      instagram: "martinholandesa",
      openingHours: "Diariamente 09:00–22:00 | Sábados até 23:00",
      coverImage: "https://martinholandesa.com.br/content/foto4.jpeg",
      tags: ["restaurante", "cafe", "confeitaria", "festival-rei", "gastronomia", "holambra", "martin-holandesa-confeitaria-e-restaurante"],
    },
  },

  // ── 6. Ristorante Marchesini di Roverbella (ID 25618) ─────────────────────
  {
    id: 25618,
    fields: {
      name: "Ristorante Marchesini di Roverbella",
      slug: "marchesini-di-roverbella",
      categoryId: CAT.restaurante,
      shortDesc: "Alta gastronomia italiana em Holambra — cardápio autêntico com raízes na região de Roverbella",
      longDesc: "O Ristorante Marchesini di Roverbella traz à mesa a culinária italiana com referências à região de Roverbella, no norte da Itália. Participante do Festival Gastronômico do Mês do Rei em Holambra.",
      address: "R. Campo do Pouso, 1089, Secção A, Holambra – SP",
      phone: "(19) 99838-9291",
      instagram: "marchesinidiroverbella",
      openingHours: "Almoço diário: 11:00–14:30 (Sáb/Dom até 16:30) | Jantar Qui–Sáb: 18:00–22:30",
      coverImage: "https://marchesinidiroverbella.com.br/wp-content/webp-express/webp-images/uploads/2023/10/Historia-do-Restaurante-1024x665.jpg.webp",
      tags: ["restaurante", "italiano", "alta-gastronomia", "festival-rei", "ristorante", "holambra", "marchesini"],
    },
  },

  // ── 7. De Immigrant Gastro Café (ID 36) ───────────────────────────────────
  {
    id: 36,
    fields: {
      name: "De Immigrant Gastro Café",
      slug: "de-immigrant-gastro-cafe",
      categoryId: CAT.cafe,
      address: "R. Dória Vasconcelos, 293, Centro, Holambra – SP",
      phone: "(19) 3199-9723",
      instagram: "deimmigrant",
      openingHours: "Seg–Qui: 08:00–19:00 | Sex/Sáb: 08:00–20:00 | Dom: 08:00–18:30",
      coverImage: "https://recomendonacidade.com.br/wp-content/uploads/2025/12/De-Immigrant-Gastro-Cafe-em-Holambra-SP-1024x683.webp",
      tags: ["cafe", "doceria", "gastronomia", "festival-rei", "holambra", "de-immigrant", "café-holandês"],
    },
  },

  // ── 8. Confeitaria Zoet en Zout (ID 4212) ─────────────────────────────────
  {
    id: 4212,
    fields: {
      name: "Confeitaria Zoet en Zout",
      slug: "zoet-en-zout",
      categoryId: CAT.docerias,
      address: "Viela Lantanas, 90, Centro, Holambra – SP",
      phone: "(19) 3802-1293",
      whatsapp: "5519999316353",
      instagram: "zoet_en_zout",
      openingHours: "Diariamente 09:00–18:00",
      coverImage: "https://recomendonacidade.com.br/wp-content/uploads/2025/12/Confeitaria-Zoet-en-Zout-em-Holambra-1024x683.webp",
      tags: ["confeitaria", "cafe", "doceria", "festival-rei", "holambra", "zoet-en-zout", "doces-holandeses"],
    },
  },

  // ── 9. Oma Beppie (ID 6428) ───────────────────────────────────────────────
  {
    id: 6428,
    fields: {
      name: "Oma Beppie",
      slug: "oma-beppie",
      categoryId: CAT.cafe,
      shortDesc: "Loja e café em Holambra com especialidades holandesas artesanais — stroopwafel, especiarias e produtos típicos",
      longDesc: "A Oma Beppie é uma loja e café em Holambra dedicada às especialidades holandesas artesanais. O espaço reúne produtos típicos como stroopwafel, speculaas e chocolates, além de café e lanches em um ambiente acolhedor.",
      address: "R. Campo do Pouso, 1050, Centro, Holambra – SP",
      phone: "(19) 3199-5202",
      instagram: "oma.beppie",
      openingHours: "Diariamente 08:00–17:30",
      coverImage: "https://recomendonacidade.com.br/wp-content/uploads/2025/12/Stroopwaffle-da-Oma-beppie-1024x683.webp",
      tags: ["cafe", "loja", "doceria", "festival-rei", "holambra", "oma-beppie", "stroopwafel", "holandês", "artesanal"],
    },
  },

  // ── 10. Obelisco Gelato e Café (ID 25616) ─────────────────────────────────
  {
    id: 25616,
    fields: {
      name: "Obelisco Gelato e Café",
      slug: "obelisco-gelato-cafe",
      categoryId: CAT.cafe,
      shortDesc: "Gelato artesanal e café especial no coração de Holambra — parada certa para uma sobremesa diferente",
      longDesc: "O Obelisco Gelato e Café oferece sorvetes artesanais de inspiração europeia e cafés especiais em ambiente aconchegante. Participante do Festival Gastronômico do Mês do Rei em Holambra.",
      address: "R. Dória Vasconcelos, 151, Centro, Holambra – SP",
      phone: "(19) 99953-4188",
      instagram: "obeliscogelato",
      openingHours: "Diariamente 12:00–18:00 | Sex/Sáb até 21:30 | Dom até 19:00",
      coverImage: "https://img02.restaurantguru.com/c76c-Restaurant-Obelisco-Gelato-e-Cafe-food.jpg",
      tags: ["cafe", "gelato", "doceria", "festival-rei", "holambra", "obelisco", "sorvete-artesanal"],
    },
  },

  // ── 11. Lotus Café (ID 27) ────────────────────────────────────────────────
  {
    id: 27,
    fields: {
      name: "Lotus Café",
      slug: "lotus-cafe",
      categoryId: CAT.cafe,
      address: "R. Primavera, 936, Secção A, Holambra – SP",
      phone: "(19) 99316-0734",
      instagram: "lotuscafeholambra",
      openingHours: "Seg/Qua/Qui/Sex: 08:00–12:00 e 15:00–19:00 | Sáb/Dom: 08:00–19:00 | Fecha às terças",
      coverImage: "https://img02.restaurantguru.com/c464-Lotus-Cafe-Holambra-meals.jpg",
      tags: ["cafe", "doceria", "festival-rei", "holambra", "lotus", "lótus"],
    },
  },

  // ── 12. Cervejaria Seo Carneiro (ID 6334) ─────────────────────────────────
  {
    id: 6334,
    fields: {
      name: "Cervejaria Seo Carneiro",
      slug: "cervejaria-seo-carneiro",
      categoryId: CAT.bares,
      address: "R. Campo do Pouso, 851, Centro, Holambra – SP",
      phone: "(19) 99294-1820",
      instagram: "seocarneiro",
      openingHours: "Sex: 17:00–22:00 | Sáb: 15:00–22:00 | Dom: 11:00–16:00",
      coverImage: "https://seocarneiro.com.br/wp-content/uploads/2023/11/20231102_110640-scaled.jpg",
      tags: ["cervejaria", "bar", "gastronomia", "festival-rei", "holambra", "seo-carneiro", "artesanal"],
    },
  },

  // ── 13. Holambier Brouwerij (ID 26) ───────────────────────────────────────
  {
    id: 26,
    fields: {
      name: "Holambier Brouwerij",
      slug: "holambier-brouwerij",
      categoryId: CAT.bares,
      address: "Av. Rota dos Imigrantes, 653, Centro, Holambra – SP",
      instagram: "holambier",
      openingHours: "Seg–Sex: a partir das 17:00 | Sáb/Dom/Feriados: a partir das 12:00",
      coverImage: "https://img1.wsimg.com/isteam/ip/120e8cf7-fb70-45e2-812c-64cb6b350a53/94B87C70-C364-4EE6-BE32-9BDDB05D7C24.jpeg",
      tags: ["cervejaria", "bar", "gastronomia", "festival-rei", "holambra", "holambier", "brouwerij", "cerveja-artesanal"],
    },
  },

  // ── 14. Rancho da Cachaça – Pousada e Restaurante (ID 17) ─────────────────
  {
    id: 17,
    fields: {
      instagram: "ranchodacachacaholambra",
      openingHours: "Seg/Qua/Qui/Sex/Sáb/Dom: 08:00–18:00 | Fecha às terças",
      tags: [
        "restaurante", "pousada", "cachaca", "alambique", "cachacaria",
        "degustacao", "rural", "artesanal", "gastronomia-caseira",
        "fogao-a-lenha", "cafe-da-manha-colonial", "piscina", "espaco-kids",
        "festival-rei", "atrativo-turistico", "rancho-da-cachaca",
        "rancho-da-cachaca-holambra", "rancho-da-cachaca-pousada",
        "rancho-da-cachaca-restaurante", "fim-de-semana", "natureza", "familia",
      ],
    },
  },

  // ── 15. Royal Tulip Holambra (ID 30) ──────────────────────────────────────
  {
    id: 30,
    fields: {
      name: "Royal Tulip Holambra",
      slug: "royal-tulip-holambra",
      categoryId: CAT.hospedagem,
      address: "Estr. Mun. HBR-167, 935, Anjico, Holambra – SP",
      phone: "(19) 99638-3122",
      instagram: "royaltulipholambra",
      coverImage: "https://media.iceportal.com/143841/photos/76089976_XXL.jpg",
      tags: ["hotel", "hospedagem", "gastronomia", "festival-rei", "holambra", "royal-tulip", "luxo", "5-estrelas"],
    },
  },
];

async function run() {
  const db = await getDb();
  if (!db) { console.error("[seed] DB indisponível"); process.exit(1); }

  console.log(`[seed-festival-rei-update] Atualizando ${UPDATES.length} estabelecimentos...\n`);
  let ok = 0;
  let err = 0;

  for (const entry of UPDATES) {
    try {
      await db.update(places)
        .set({ ...entry.fields, updatedAt: new Date() })
        .where(eq(places.id, entry.id));
      console.log(`  ✅ [${entry.id}] ${entry.fields.name || "(nome mantido)"}`);
      ok++;
    } catch (e: any) {
      console.error(`  ❌ [${entry.id}] ERRO: ${e.message}`);
      err++;
    }
  }

  console.log(`\n✅ Concluído: ${ok} atualizados, ${err} erros.`);
  process.exit(err > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
