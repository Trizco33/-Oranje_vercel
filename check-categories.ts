import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const pool = mysql.createPool(process.env.DATABASE_URL!);

console.log("=== CATEGORIES TABLE STRUCTURE (MySQL) ===\n");

try {
  const connection = await pool.getConnection();
  
  // Get table structure
  const [columns] = await connection.execute(
    "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'categories' AND TABLE_SCHEMA = DATABASE() ORDER BY ORDINAL_POSITION"
  );
  
  console.log("Columns in MySQL:");
  console.log(JSON.stringify(columns, null, 2));
  
  connection.release();
} catch (error) {
  console.error("Error:", (error as Error).message);
}

process.exit(0);
