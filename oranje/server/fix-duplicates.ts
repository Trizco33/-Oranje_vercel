/**
 * fix-duplicates.ts
 * Remove 6 duplicatas criadas pelo seed-holambra.ts (por renomear lugares).
 * Primeiro redireciona guided_tour_stops para os IDs originais, depois deleta.
 */
import { getDb } from "./db";
import { eq, inArray, and } from "drizzle-orm";
import { places, guidedTourStops } from "../drizzle/schema";

// Mapeamento: ID duplicata → ID original canônico
const DUPLICATE_TO_ORIGINAL: Record<number, number> = {
  25685: 24,    // "Casa Bela Restaurante"    → ID 24 (canônico)
  25687: 26,    // "Holambier"                → ID 26 (canônico)
  25713: 2613,  // "Martin Holandesa..."      → ID 2613 (canônico)
  25715: 17,    // "Pousada Rancho da Cachaça"→ ID 17 (canônico)
  25716: 4212,  // "Zoet en Zout"             → ID 4212 (canônico)
  25724: 2614,  // "Lago do Holandês"         → ID 2614 (canônico)
};

const DUPLICATE_IDS = Object.keys(DUPLICATE_TO_ORIGINAL).map(Number);

// Nomes canônicos (alinhados com seed-holambra.ts)
const REVERTS = [
  { id: 2614, name: "Lago do Holandês",                           slug: "lago-do-holandes" },
  { id: 24,   name: "Casa Bela Restaurante",                      slug: "casa-bela-restaurante" },
  { id: 26,   name: "Restaurante e Cervejaria Holambier",          slug: "holambier" },
  { id: 2613, name: "Martin Holandesa Confeitaria e Restaurante",  slug: "martin-holandesa" },
  { id: 17,   name: "Pousada Rancho da Cachaça",                  slug: "rancho-da-cachaca" },
  { id: 4212, name: "Zoet en Zout",                               slug: "zoet-en-zout" },
];

async function run() {
  const db = await getDb();
  if (!db) { console.error("[fix] DB indisponível"); process.exit(1); }

  // ── 1. Corrigir guided_tour_stops com placeId apontando para duplicatas ────
  console.log("🔧 Corrigindo guided_tour_stops...");

  // Buscar todos os stops referenciando duplicatas
  const badStops = await db.select()
    .from(guidedTourStops)
    .where(inArray(guidedTourStops.placeId, DUPLICATE_IDS)) as any[];

  console.log(`  Stops com placeId duplicado: ${badStops.length}`);

  for (const stop of badStops) {
    const origId = DUPLICATE_TO_ORIGINAL[stop.placeId];

    // Verificar se já existe stop com o ID original no mesmo tour
    const existingStops = await db.select()
      .from(guidedTourStops)
      .where(
        and(
          eq(guidedTourStops.tourId, stop.tourId),
          eq(guidedTourStops.placeId, origId)
        )
      ) as any[];

    if (existingStops.length > 0) {
      // Já existe stop com o ID original → deletar o stop duplicado
      await db.delete(guidedTourStops).where(eq(guidedTourStops.id, stop.id));
      console.log(`  🗑  Deletado stop ID ${stop.id} (tour ${stop.tourId}) — placeId ${stop.placeId} já existe como ${origId}`);
    } else {
      // Não existe → redirecionar para ID original
      await db.update(guidedTourStops)
        .set({ placeId: origId })
        .where(eq(guidedTourStops.id, stop.id));
      console.log(`  ✅ Stop ID ${stop.id} (tour ${stop.tourId}): placeId ${stop.placeId} → ${origId}`);
    }
  }

  // ── 2. Deletar as 6 duplicatas ─────────────────────────────────────────────
  console.log("\n🗑  Deletando duplicatas...");
  for (const dupId of DUPLICATE_IDS) {
    await db.delete(places).where(eq(places.id, dupId));
    console.log(`  ✅ Deletado lugar ID ${dupId}`);
  }

  // ── 3. Reverter nomes para os canônicos do seed-holambra.ts ───────────────
  console.log("\n📝 Revertendo nomes para seed-holambra.ts canônico...");
  for (const r of REVERTS) {
    await db.update(places)
      .set({ name: r.name, slug: r.slug, updatedAt: new Date() })
      .where(eq(places.id, r.id));
    console.log(`  ✅ [${r.id}] "${r.name}"`);
  }

  console.log("\n✅ Fix concluído — duplicatas removidas, nomes e stops sincronizados.");
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
