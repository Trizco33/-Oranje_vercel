/**
 * Directly creates the site_route_features table if it doesn't exist.
 * cd oranje && npx tsx server/create-site-route-features.ts
 */
import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL required");

const pool = mysql.createPool(url);

const SQL = `
CREATE TABLE IF NOT EXISTS \`site_route_features\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`routeId\` int NOT NULL,
  \`label\` varchar(200),
  \`subtitle\` text,
  \`ctaText\` varchar(100),
  \`isFeatured\` boolean NOT NULL DEFAULT false,
  \`isActive\` boolean NOT NULL DEFAULT true,
  \`sortOrder\` int NOT NULL DEFAULT 0,
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`site_route_features_id\` PRIMARY KEY(\`id\`)
)
`;

const FK = `
ALTER TABLE \`site_route_features\` 
ADD CONSTRAINT \`site_route_features_routeId_routes_id_fk\` 
FOREIGN KEY (\`routeId\`) REFERENCES \`routes\`(\`id\`) 
ON DELETE CASCADE ON UPDATE no action
`;

try {
  const [result] = await pool.query(SQL);
  console.log("✅ site_route_features table created (or already exists):", result);
} catch (e: any) {
  console.error("Table creation error:", e.message);
}

try {
  await pool.query(FK);
  console.log("✅ Foreign key added.");
} catch (e: any) {
  if (e.code === "ER_DUP_KEY" || e.message.includes("already exists") || e.message.includes("Duplicate")) {
    console.log("Foreign key already exists — skipping.");
  } else {
    console.log("FK note:", e.message);
  }
}

await pool.end();
console.log("Done!");
