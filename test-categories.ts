import { drizzle } from "drizzle-orm/mysql2";
import { categories } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

console.log("=== TEST: getCategories() ===\n");

try {
  const result = await db.select().from(categories).orderBy(categories.name);
  console.log("Result count:", result.length);
  console.log("Result:", JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Full Error:", error);
  if (error instanceof Error) {
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
  }
}

process.exit(0);
