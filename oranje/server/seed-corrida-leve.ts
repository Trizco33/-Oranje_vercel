/**
 * seed-corrida-leve.ts
 *
 * Cria o passeio "Corrida Leve em Holambra" no Receptivo Oranje.
 * Parceiro direto da Corrida Puxada — mesmo padrão editorial, outro ritmo.
 * Idempotente — pode ser executado múltiplas vezes sem duplicar dados.
 *
 * Uso:
 *   DATABASE_URL=mysql://... npx tsx server/seed-corrida-leve.ts
 */

import { getDb } from "./db";
import { sql, eq, and } from "drizzle-orm";
import { places } from "../drizzle/schema";

async function findPlaceId(db: any, name: string, city = "Holambra"): Promise<number | null> {
  const rows = await db
    .select({ id: places.id })
    .from(places)
    .where(and(eq(places.name, name), eq(places.city, city)))
    .limit(1);
  return rows[0]?.id ?? null;
}

async function upsertTour(db: any, tour: {
  slug: string; name: string; tagline: string; description: string;
  theme: string; duration: string; coverImage: string; status: string;
}): Promise<number> {
  const existing = await db.execute(sql`SELECT id FROM guided_tours WHERE slug = ${tour.slug} LIMIT 1`);
  const rows = (existing as any)[0] as any[];
  if (rows.length > 0) {
    const id = rows[0].id;
    await db.execute(sql`
      UPDATE guided_tours SET
        name = ${tour.name}, tagline = ${tour.tagline}, description = ${tour.description},
        theme = ${tour.theme}, duration = ${tour.duration}, coverImage = ${tour.coverImage},
        status = ${tour.status}, updatedAt = NOW()
      WHERE id = ${id}
    `);
    console.log(`  ✅ Tour atualizado: "${tour.name}" (id ${id})`);
    return id;
  } else {
    const result = await db.execute(sql`
      INSERT INTO guided_tours (slug, name, tagline, description, theme, duration, coverImage, status)
      VALUES (${tour.slug}, ${tour.name}, ${tour.tagline}, ${tour.description},
              ${tour.theme}, ${tour.duration}, ${tour.coverImage}, ${tour.status})
    `);
    const id = (result as any)[0].insertId;
    console.log(`  ✅ Tour criado: "${tour.name}" (id ${id})`);
    return id;
  }
}

async function upsertStop(db: any, tourId: number, placeId: number, stop: {
  order: number; narrative: string; tip: string | null; bestMoment: string | null;
}) {
  const existing = await db.execute(
    sql`SELECT id FROM guided_tour_stops WHERE tourId = ${tourId} AND stopOrder = ${stop.order} LIMIT 1`
  );
  const rows = (existing as any)[0] as any[];
  if (rows.length > 0) {
    await db.execute(sql`
      UPDATE guided_tour_stops SET
        placeId = ${placeId}, narrative = ${stop.narrative},
        tip = ${stop.tip}, bestMoment = ${stop.bestMoment}, updatedAt = NOW()
      WHERE id = ${rows[0].id}
    `);
  } else {
    await db.execute(sql`
      INSERT INTO guided_tour_stops (tourId, placeId, stopOrder, narrative, tip, bestMoment)
      VALUES (${tourId}, ${placeId}, ${stop.order}, ${stop.narrative}, ${stop.tip}, ${stop.bestMoment})
    `);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const db = await getDb();
  if (!db) { console.error("❌ DB indisponível"); process.exit(1); }

  console.log("🏃 Corrida Leve em Holambra — seed iniciado\n");

  const tourId = await upsertTour(db, {
    slug: "corrida-leve-holambra",
    name: "Corrida Leve em Holambra",
    tagline: "Ritmo constante, cidade bonita — o hábito que Holambra permite",
    description: "Nem todo treino precisa ser difícil para valer. Este percurso existe para quem quer sair da cama cedo, manter o ritmo sem sofrer e chegar de volta com a sensação de que o dia começou bem. O Boulevard Holandês abre o caminho, o lago aparece na metade e o retorno pelo centro fecha o circuito sem surpresa. Leve, intuitivo e bonito — do jeito que uma corrida de manutenção deveria ser.",
    theme: "Corrida · Fácil",
    duration: "4–5 km · 25–35 min",
    coverImage: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=900&q=80",
    status: "active",
  });

  // ── Mapear lugares ────────────────────────────────────────────────────────

  const placeMap: Record<string, number | null> = {};
  const needed = [
    "Martin Holandesa Confeitaria e Restaurante",
    "Praça Vitória Régia",
    "Deck do Amor",
    "Zoet en Zout",
  ];
  for (const name of needed) {
    placeMap[name] = await findPlaceId(db, name);
    if (placeMap[name]) console.log(`  📍 ${name} → id ${placeMap[name]}`);
    else console.warn(`  ⚠️  "${name}" não encontrado`);
  }

  // ── Paradas ───────────────────────────────────────────────────────────────

  const STOPS: Array<{
    placeName: string; order: number;
    narrative: string; tip: string | null; bestMoment: string | null;
  }> = [
    {
      placeName: "Martin Holandesa Confeitaria e Restaurante",
      order: 1,
      narrative: "A saída é aqui, no Boulevard Holandês. A Martin Holandesa ainda está fechada a esta hora — e tudo bem. A referência é o prédio, não o café. Daqui você sai pela rua principal do Boulevard e segue em frente, no ritmo que seu corpo pedir naquela manhã. Sem pressa, sem meta de tempo. O percurso vai guiando naturalmente.",
      tip: "Comece devagar — o trecho do boulevard é plano e tentador para sair rápido demais.",
      bestMoment: "Manhã cedo ou fim da tarde",
    },
    {
      placeName: "Praça Vitória Régia",
      order: 2,
      narrative: "Ao final do boulevard, vire à esquerda em direção à Lagoa Vitória Régia. A praça aparece logo, com o espelho d'água e as vitórias-régias gigantes. Este é o momento de regularizar o fôlego: o trecho foi plano, o ritmo está bom, e o melhor ainda vem. Continue ao longo da orla em direção ao Deck do Amor — aqui a rua é mais calma, a brisa do lago costuma aparecer e o visual é o melhor de todo o circuito.",
      tip: "Se for pela manhã cedo, as vitórias-régias ainda estão abertas — vale um segundo de atenção.",
      bestMoment: "Manhã cedo",
    },
    {
      placeName: "Deck do Amor",
      order: 3,
      narrative: "Vire à esquerda na altura do Deck do Amor e contorne a região. Este é o ponto de virada do percurso — daqui o retorno começa pelo centro da cidade. A subida que existe nesse trecho é suave, nada parecido com a Corrida Puxada: é o tipo de inclinação que você enfrenta sem nem perceber. Continue pela rua principal na direção do Posto Pioneiro e daí de volta ao Boulevard. O circuito fecha sozinho.",
      tip: "Se quiser fechar o percurso com calma, a região do Posto Pioneiro é uma boa parada para um café expresso e um pão na chapa antes de seguir o dia.",
      bestMoment: "Manhã cedo ou fim da tarde",
    },
  ];

  for (const stop of STOPS) {
    const placeId = placeMap[stop.placeName];
    if (!placeId) {
      console.warn(`  ⏭  Pulando "${stop.placeName}" — não encontrado`);
      continue;
    }
    await upsertStop(db, tourId, placeId, {
      order: stop.order,
      narrative: stop.narrative,
      tip: stop.tip,
      bestMoment: stop.bestMoment,
    });
    console.log(`    🏷  Parada ${stop.order}: ${stop.placeName} ✓`);
  }

  // ── Extension: Zoet en Zout (pausa opcional de recuperação) ──────────────

  const zoetId = placeMap["Zoet en Zout"];
  if (zoetId) {
    await db.execute(sql`
      UPDATE guided_tours
      SET extensionPlaceIds = ${JSON.stringify([zoetId])}, updatedAt = NOW()
      WHERE id = ${tourId}
    `);
    console.log(`    🔗 extensionPlaceIds: [${zoetId}] (Zoet en Zout)`);
  }

  console.log("\n🎉 Corrida Leve em Holambra — seed concluído!");
  console.log("📱 Acesse em: /app/receptivo/corrida-leve-holambra");
  process.exit(0);
}

main().catch((err) => { console.error("❌ Erro:", err); process.exit(1); });
