import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "./drizzle/schema";

const pool = mysql.createPool(process.env.DATABASE_URL!);
const db = drizzle(pool);

const allUsers = await db.select().from(users).limit(5);
console.log("All users:", allUsers);

const adminUsers = await db.select().from(users).where((u) => u.role === "admin");
console.log("Admin users:", adminUsers);

process.exit(0);
