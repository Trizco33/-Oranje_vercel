import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  const [rows] = await db.execute(sql`
    SELECT p.id, p.name, p.slug, p.isFeatured, p.isRecommended, p.dataPending
    FROM places p
    WHERE p.status = 'active'
    ORDER BY p.isFeatured DESC, p.isRecommended DESC, p.name
    LIMIT 100
  `);
  (rows as any[]).forEach(r => 
    console.log(`id=${String(r.id).padEnd(6)} pending=${r.dataPending} f=${r.isFeatured} r=${r.isRecommended} slug="${r.slug}" name="${r.name}"`)
  );
  process.exit(0);
}
main().catch(e => { console.error(e.message, e.sqlMessage); process.exit(1); });
