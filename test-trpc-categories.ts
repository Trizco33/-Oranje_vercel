import { drizzle } from "drizzle-orm/mysql2";
import { categories } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

console.log("=== TEST: tRPC categories.list endpoint ===\n");

try {
  const result = await db.select().from(categories).orderBy(categories.name);
  console.log("✅ Query succeeded!");
  console.log("Categories count:", result.length);
  console.log("Sample category:", JSON.stringify(result[0], null, 2));
} catch (error) {
  console.error("❌ Query failed:", (error as Error).message);
}

process.exit(0);
