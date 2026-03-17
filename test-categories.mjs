import { drizzle } from "drizzle-orm/mysql2";
import { categories } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

console.log("=== TEST: getCategories() ===\n");

try {
  const result = await db.select().from(categories).orderBy(categories.name);
  console.log("Result count:", result.length);
  console.log("Result:", JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Error:", error.message);
}

process.exit(0);
