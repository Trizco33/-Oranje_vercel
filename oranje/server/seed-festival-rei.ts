/**
 * seed-festival-rei.ts
 * Cadastra os 3 estabelecimentos do Festival Gastronômico do Mês do Rei
 * que ainda não constavam no banco: Obelisco Gelato e Café, Trattoria Holandesa
 * e Ristorante Marchesini di Roverbella.
 *
 * Idempotente: usa ON DUPLICATE KEY UPDATE (name+city).
 * Regra de seed: isFeatured, isRecommended, lat, lng NÃO são atualizados no upsert.
 */

import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { categories, places } from "../drizzle/schema";

const NOVOS_LUGARES = [
  {
    name: "Obelisco Gelato e Café",
    categorySlug: "cafes",
    shortDesc: "Gelato artesanal e café especial no coração de Holambra — parada certa para uma sobremesa diferente",
    longDesc: "O Obelisco Gelato e Café oferece sorvetes artesanais de inspiração europeia e cafés especiais em um ambiente aconchegante. Participante do Festival Gastronômico do Mês do Rei em Holambra.",
    address: "Holambra, SP",
    lat: null as number | null,
    lng: null as number | null,
    city: "Holambra",
    state: "SP",
    country: "Brasil",
    priceRange: "$",
    isFree: false,
    isRecommended: false,
    isFeatured: false,
    isPartner: false,
    tags: ["gelato", "cafe", "sobremesa", "festival-rei"],
    status: "active" as const,
    dataPending: true,
  },
  {
    name: "Trattoria Holandesa",
    categorySlug: "restaurantes",
    shortDesc: "Culinária italiana com identidade holandesa — almoços e jantares em Holambra",
    longDesc: "A Trattoria Holandesa une a tradição da gastronomia italiana ao charme de Holambra. Participante do Festival Gastronômico do Mês do Rei, serve pratos típicos da culinária italiana em ambiente familiar.",
    address: "Holambra, SP",
    lat: null as number | null,
    lng: null as number | null,
    city: "Holambra",
    state: "SP",
    country: "Brasil",
    priceRange: "$$",
    isFree: false,
    isRecommended: false,
    isFeatured: false,
    isPartner: false,
    tags: ["italiano", "trattoria", "festival-rei", "almoço", "jantar"],
    status: "active" as const,
    dataPending: true,
  },
  {
    name: "Ristorante Marchesini di Roverbella",
    categorySlug: "restaurantes",
    shortDesc: "Alta gastronomia italiana em Holambra — cardápio autêntico com raízes na região de Roverbella",
    longDesc: "O Ristorante Marchesini di Roverbella traz à mesa a culinária italiana com referências à região de Roverbella, no norte da Itália. Participante do Festival Gastronômico do Mês do Rei em Holambra.",
    address: "Holambra, SP",
    lat: null as number | null,
    lng: null as number | null,
    city: "Holambra",
    state: "SP",
    country: "Brasil",
    priceRange: "$$$",
    isFree: false,
    isRecommended: false,
    isFeatured: false,
    isPartner: false,
    tags: ["italiano", "alta-gastronomia", "festival-rei", "ristorante"],
    status: "active" as const,
    dataPending: true,
  },
];

async function seedFestivalRei() {
  const db = await getDb();
  if (!db) {
    console.error("[seed-festival-rei] Banco não disponível.");
    process.exit(1);
  }

  console.log("[seed-festival-rei] Iniciando cadastro dos 3 participantes ausentes...\n");

  for (const lugar of NOVOS_LUGARES) {
    const { categorySlug, ...fields } = lugar;

    const catRows = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1) as any[];

    const categoryId: number | null = catRows[0]?.id ?? null;
    if (!categoryId) {
      console.warn(`  ⚠️  Categoria '${categorySlug}' não encontrada — ${fields.name} será inserido sem categoria.`);
    }

    const insertValues = { ...fields, categoryId };

    await db
      .insert(places)
      .values(insertValues)
      .onDuplicateKeyUpdate({
        set: {
          categoryId: insertValues.categoryId,
          shortDesc: insertValues.shortDesc,
          longDesc: insertValues.longDesc,
          priceRange: insertValues.priceRange,
          tags: insertValues.tags,
          status: insertValues.status,
          updatedAt: new Date(),
        },
      });

    console.log(`  ✅ ${fields.name} (categoria: ${categorySlug}, dataPending: ${fields.dataPending})`);
  }

  console.log("\n✅ seed-festival-rei concluído. 3 lugares inseridos/atualizados.");
  process.exit(0);
}

seedFestivalRei().catch((e) => {
  console.error("[seed-festival-rei] Erro:", e);
  process.exit(1);
});
