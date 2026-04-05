/**
 * Runs pending migrations against the Railway MySQL database.
 * Usage: cd oranje && npx tsx server/run-migration.ts
 */
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL required");

const pool = mysql.createPool(url);
const db = drizzle(pool);

console.log("Running migrations…");
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("✅ Migrations complete!");
await pool.end();
