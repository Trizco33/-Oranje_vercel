import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  // Get coordinates for all stops in the romantic tour + candidates
  const ids = [4215, 4213, 4214, 2616, 4212, 2614, 25, 30];
  const [places] = await db.execute(sql`
    SELECT id, name, lat, lng, address, shortDesc
    FROM places 
    WHERE id IN (4215, 4213, 4214, 2616, 4212, 2614, 25, 30)
    ORDER BY id
  `);
  
  console.log("=== COORDENADAS DOS LUGARES ===\n");
  (places as any[]).forEach((p: any) => {
    const isCurrentStop = [4215, 4213, 4214, 2616, 4212].includes(p.id);
    const label = isCurrentStop ? "[RECEPTIVO ATUAL]" : "[CANDIDATO]";
    console.log(`${label} id=${p.id} "${p.name}"`);
    console.log(`  lat=${p.lat}, lng=${p.lng}`);
    console.log(`  addr: ${p.address || 'n/a'}`);
    console.log(`  desc: ${p.shortDesc ? p.shortDesc.substring(0,60) : 'n/a'}`);
    console.log();
  });
  
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
