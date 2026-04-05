import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
dotenv.config();

function safeJson(s: any, def: any = []) {
  try { return typeof s === 'string' ? JSON.parse(s) : (s ?? def); } catch { return def; }
}

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);

  // ── 1. RECEPTIVO: tours e stops ──────────────────────────────────────────
  const [tours] = await db.execute(sql`SELECT id, slug, name, status FROM guided_tours ORDER BY id`);
  const [stops] = await db.execute(sql`
    SELECT gs.tourId, gs.stopOrder, gs.narrative, gs.tip, gs.bestMoment,
           p.id as placeId, p.name as placeName
    FROM guided_tour_stops gs
    JOIN places p ON p.id = gs.placeId
    ORDER BY gs.tourId, gs.stopOrder
  `);

  console.log("══════════════════════════════════════════════════");
  console.log("  RECEPTIVO ORANJE — PASSEIOS E PARADAS ATUAIS");
  console.log("══════════════════════════════════════════════════");
  for (const t of tours as any[]) {
    const tStops = (stops as any[]).filter(s => s.tourId === t.id);
    console.log(`\n▶ [${t.slug}] "${t.name}" — ${tStops.length} paradas (status: ${t.status})`);
    for (const s of tStops) {
      console.log(`   ${s.stopOrder}. id=${s.placeId} "${s.placeName}"`);
      if (s.narrative) console.log(`      narrativa: "${s.narrative.substring(0,80)}..."`);
      if (s.tip) console.log(`      tip: "${s.tip.substring(0,60)}..."`);
      if (s.bestMoment) console.log(`      bestMoment: "${s.bestMoment}"`);
    }
  }

  // ── 2. ROTEIROS: estrutura atual ─────────────────────────────────────────
  const [routes] = await db.execute(sql`SELECT id, title, theme, placeIds, placeNotes, highlights, isPublic FROM routes ORDER BY id`);

  console.log("\n\n══════════════════════════════════════════════════");
  console.log("  ROTEIROS — ESTRUTURA ATUAL (aba roteiros no app)");
  console.log("══════════════════════════════════════════════════");
  for (const r of routes as any[]) {
    const ids: number[] = safeJson(r.placeIds, []);
    const notes = safeJson(r.placeNotes, {});
    const highlights: string[] = safeJson(r.highlights, []);

    if (ids.length === 0) { console.log(`\n▶ id=${r.id} "${r.title}" — sem placeIds`); continue; }
    const [ps] = await db.execute(sql`SELECT id, name FROM places WHERE id IN (${sql.raw(ids.join(','))})`);
    const nm: Record<number, string> = {};
    (ps as any[]).forEach((p: any) => { nm[p.id] = p.name; });

    console.log(`\n▶ id=${r.id} "${r.title}" [${r.theme}] — ${ids.length} lugares (público: ${r.isPublic})`);
    ids.forEach((pid, i) => {
      const hasNote = !!notes[pid];
      const note = hasNote ? `"${String(notes[pid]).substring(0,70)}..."` : '(sem nota)';
      console.log(`   ${i+1}. id=${pid} "${nm[pid] || '???'}" ${hasNote ? '✓' : '·'}`);
      if (hasNote) console.log(`      nota: ${note}`);
    });
    if (highlights.length) {
      console.log(`   highlights (${highlights.length}):`);
      highlights.forEach(h => console.log(`     - "${h.substring(0,80)}"`));
    }
  }

  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
