/**
 * Adiciona coluna extensionPlaceIds à tabela guided_tours e popula
 * as extensões do passeio Holambra Romântica.
 * 
 * Extensões = lugares curados para o bloco "Se quiser ir além" (não paradas principais).
 * Para Holambra Romântica:
 *   - 2614: Lago do Holandês (almoço no eixo do lago — continuação natural)
 *   - 25: Restaurante Villa Girassol (jantar com vista — encerramento romântico)
 */
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);

  // 1. Adicionar coluna (idempotente — ignora se já existe)
  try {
    await db.execute(sql`
      ALTER TABLE guided_tours
      ADD COLUMN extensionPlaceIds JSON NULL COMMENT 'IDs de lugares para o bloco Se quiser ir alem'
    `);
    console.log("✅ Coluna extensionPlaceIds adicionada");
  } catch (e: any) {
    if (e.sqlMessage?.includes('Duplicate column')) {
      console.log("ℹ️  Coluna extensionPlaceIds já existe");
    } else throw e;
  }

  // 2. Popular extensões para Holambra Romântica
  await db.execute(sql`
    UPDATE guided_tours
    SET extensionPlaceIds = JSON_ARRAY(2614, 25)
    WHERE slug = 'holambra-romantica'
  `);
  console.log("✅ extensionPlaceIds populado para holambra-romantica → [2614, 25]");

  // 3. Verificar
  const [rows] = await db.execute(sql`
    SELECT id, slug, name, extensionPlaceIds FROM guided_tours WHERE slug = 'holambra-romantica'
  `);
  console.log("\n=== ESTADO FINAL ===");
  (rows as any[]).forEach(r => console.log(`slug="${r.slug}" extensions=${r.extensionPlaceIds}`));

  process.exit(0);
}
main().catch(e => { console.error(e.message, e.sqlMessage); process.exit(1); });
