import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  const [tours] = await db.execute(sql`
    SELECT id, slug, name, status FROM guided_tours ORDER BY id
  `);
  console.log("=== TOURS ATIVOS ===");
  (tours as any[]).forEach(t => console.log(`id=${t.id} slug="${t.slug}" status=${t.status} name="${t.name}"`));

  const [stops] = await db.execute(sql`
    SELECT gs.tourId, gt.slug as tourSlug, gs.stopOrder, gs.id as stopId,
           p.name as placeName, p.id as placeId, gs.narrative
    FROM guided_tour_stops gs
    JOIN guided_tours gt ON gt.id = gs.tourId
    JOIN places p ON p.id = gs.placeId
    ORDER BY gs.tourId, gs.stopOrder
  `);
  console.log("\n=== STOPS POR TOUR ===");
  let lastTour = '';
  (stops as any[]).forEach(s => {
    if (s.tourSlug !== lastTour) {
      console.log(`\n-- [${s.tourSlug}] --`);
      lastTour = s.tourSlug;
    }
    const narrativeLen = s.narrative ? s.narrative.length : 0;
    console.log(`  ${s.stopOrder}. id=${s.placeId} "${s.placeName}" (narrativa: ${narrativeLen}c)`);
  });
  
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
