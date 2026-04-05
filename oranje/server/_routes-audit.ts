import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  // Describe tables to understand structure
  const [cols] = await db.execute(sql`DESCRIBE routes`);
  console.log("=== ROUTES COLUMNS ===");
  (cols as any[]).forEach(c => console.log(`  ${c.Field} ${c.Type} ${c.Null} default=${c.Default}`));
  
  const [r] = await db.execute(sql`SELECT * FROM routes LIMIT 10`);
  console.log("\n=== ROUTES DATA ===");
  (r as any[]).forEach(row => console.log(JSON.stringify(row)));

  const [feat] = await db.execute(sql`DESCRIBE site_route_features`);
  console.log("\n=== SITE_ROUTE_FEATURES COLUMNS ===");
  (feat as any[]).forEach(c => console.log(`  ${c.Field} ${c.Type}`));

  const [srf] = await db.execute(sql`SELECT * FROM site_route_features LIMIT 20`);
  console.log("\n=== SITE_ROUTE_FEATURES DATA ===");
  (srf as any[]).forEach(row => console.log(JSON.stringify(row)));
  
  process.exit(0);
}
main().catch(e => { console.error(e.message, e.sqlMessage); process.exit(1); });
