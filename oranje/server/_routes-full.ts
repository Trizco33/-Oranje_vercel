import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
dotenv.config();

function safeJson(s: any, def: any = []) {
  try { return typeof s === 'string' ? JSON.parse(s) : (s ?? def); }
  catch { return def; }
}

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  const [routes] = await db.execute(sql`SELECT id, title, placeIds, placeNotes, highlights FROM routes ORDER BY id`);
  
  for (const r of routes as any[]) {
    const ids: number[] = safeJson(r.placeIds, []);
    const notes = safeJson(r.placeNotes, {});
    const highlights: string[] = safeJson(r.highlights, []);
    
    if (ids.length === 0) { console.log(`id=${r.id} "${r.title}" — sem placeIds`); continue; }
    
    const [ps] = await db.execute(sql`SELECT id, name FROM places WHERE id IN (${sql.raw(ids.join(','))})`);
    const nm: Record<number, string> = {};
    (ps as any[]).forEach((p: any) => { nm[p.id] = p.name; });
    
    console.log(`\n=== id=${r.id} "${r.title}" (${ids.length} lugares) ===`);
    ids.forEach((pid, i) => {
      console.log(`  ${i+1}. id=${pid} "${nm[pid] || '???'}" ${notes[pid] ? '✓' : '·'}`);
    });
    if (highlights.length) console.log(`  → ${highlights.join(' | ')}`);
  }
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
