/**
 * seed-corrida.ts
 *
 * Cria o passeio "Corrida Puxada em Holambra" no Receptivo Oranje.
 * Idempotente — pode ser executado múltiplas vezes sem duplicar dados.
 *
 * Uso:
 *   DATABASE_URL=mysql://... npx tsx server/seed-corrida.ts
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

  console.log("🏃 Corrida Puxada em Holambra — seed iniciado\n");

  // ── Tour principal ────────────────────────────────────────────────────────

  const tourId = await upsertTour(db, {
    slug: "corrida-puxada-holambra",
    name: "Corrida Puxada em Holambra",
    tagline: "Subidas, fôlego e uma chegada que recompensa",
    description: "Um percurso para quem quer mais do que só manter o hábito. Aqui a cidade entrega descida forte, trecho aberto, retorno exigente e subida que cobra das pernas no final. É a rota ideal para quem gosta de sentir que treinou de verdade, sem abrir mão de um caminho bonito e bem resolvido.",
    theme: "Corrida · Difícil",
    duration: "6–8 km · 40–60 min",
    coverImage: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=900&q=80",
    status: "active",
  });

  // ── Mapear lugares ────────────────────────────────────────────────────────

  const placeMap: Record<string, number | null> = {};
  const needed = [
    "Holambra Garden Hotel",
    "Parque Van Gogh",
    "Nossa Prainha",
    "Praça Vitória Régia",
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
      placeName: "Holambra Garden Hotel",
      order: 1,
      narrative: "Ponto de partida. Saia pela entrada principal do hotel e vire à esquerda — você vai encontrar a descida logo adiante. A rua da imobiliária CAAF é reconhecível pelo aclive acentuado visto de cima: desça sem segurar. Aqui o percurso começa de verdade, e a cidade vai se abrindo no ritmo das pernas.",
      tip: "Guarde fôlego para a volta. A descida do início engana: a parte que realmente exige aparece no retorno.",
      bestMoment: "Manhã cedo ou fim da tarde",
    },
    {
      placeName: "Parque Van Gogh",
      order: 2,
      narrative: "Depois da descida, o trecho pelo eixo do Lago do Holandês — aberto, plano e com boa brisa. O Parque Van Gogh marca o início da zona de ritmo estável: aqui o esforço já foi feito, o pulmão abre e a paisagem do lago compensa qualquer segunda-feira difícil. Continue em direção à Nossa Prainha sem parar — este é o pulmão do percurso.",
      tip: "Trecho mais plano do percurso — bom ponto para recuperar a respiração antes da volta.",
      bestMoment: "Manhã cedo",
    },
    {
      placeName: "Nossa Prainha",
      order: 3,
      narrative: "Ponto de virada. Na Nossa Prainha, o percurso vira à direita e começa o retorno — e é aqui que o roteiro muda de personalidade. O trecho que parecia fácil na descida cobra de volta com força: suba sem tentar economizar, o ritmo certo é o que você consegue manter até o topo. Vista o lago uma vez. Depois olhe só para frente.",
      tip: "Tome um gole d'água antes de virar. A subida do retorno é longa.",
      bestMoment: "Manhã cedo",
    },
    {
      placeName: "Praça Vitória Régia",
      order: 4,
      narrative: "A chegada. Depois da subida, a Praça Vitória Régia é onde o percurso respira. As vitórias-régias estão ali, o espelho d'água reflete quem acabou de fazer algo difícil e Holambra parece uma cidade diferente quando você chega assim — cansado, satisfeito, e com as pernas que pedem respeito. O passeio está feito. O Zoet en Zout fica a menos de dois minutos a pé.",
      tip: "Faça o alongamento aqui — boa sombra e espaço de sobra.",
      bestMoment: "Manhã",
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

  // ── Extension: Zoet en Zout ──────────────────────────────────────────────

  const zoetId = placeMap["Zoet en Zout"];
  if (zoetId) {
    await db.execute(sql`
      UPDATE guided_tours
      SET extensionPlaceIds = ${JSON.stringify([zoetId])}, updatedAt = NOW()
      WHERE id = ${tourId}
    `);
    console.log(`    🔗 extensionPlaceIds: [${zoetId}] (Zoet en Zout)`);
  }

  console.log("\n🎉 Corrida Puxada em Holambra — seed concluído!");
  console.log("📱 Acesse em: /app/receptivo/corrida-puxada-holambra");
  process.exit(0);
}

main().catch((err) => { console.error("❌ Erro:", err); process.exit(1); });
