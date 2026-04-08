/**
 * run-migrations.ts
 * Idempotent migration runner — safe to run on every server startup.
 * Each migration checks whether it is already applied before executing.
 */
import { getDb } from "./db";

async function columnExists(db: any, table: string, column: string): Promise<boolean> {
  const result = await db.execute(
    `SHOW COLUMNS FROM \`${table}\` LIKE '${column}'`
  );
  return (result[0] as any[]).length > 0;
}

async function tableExists(db: any, table: string): Promise<boolean> {
  const result = await db.execute(
    `SHOW TABLES LIKE '${table}'`
  );
  return (result[0] as any[]).length > 0;
}

async function indexExists(db: any, table: string, index: string): Promise<boolean> {
  const result = await db.execute(
    `SHOW INDEX FROM \`${table}\` WHERE Key_name = '${index}'`
  );
  return (result[0] as any[]).length > 0;
}

export async function runMigrations(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Migrations] Database not available — skipping migrations.");
    return;
  }

  console.log("[Migrations] Checking pending migrations...");

  // ─── Migration 001: profile_claims table ──────────────────────────────────
  if (!(await tableExists(db, "profile_claims"))) {
    console.log("[Migrations] Creating table: profile_claims...");
    await db.execute(`
      CREATE TABLE \`profile_claims\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`placeId\` int NOT NULL,
        \`contactName\` varchar(200) NOT NULL,
        \`contactPhone\` varchar(30),
        \`contactEmail\` varchar(320) NOT NULL,
        \`contactRole\` varchar(200),
        \`businessName\` varchar(200),
        \`instagram\` varchar(100),
        \`website\` text,
        \`openingHours\` text,
        \`address\` text,
        \`category\` varchar(100),
        \`description\` text,
        \`differentials\` text,
        \`message\` text,
        \`photos\` json,
        \`logoUrl\` text,
        \`coverImageUrl\` text,
        \`status\` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        \`adminNote\` text,
        \`reviewedAt\` timestamp NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`profile_claims_id\` PRIMARY KEY(\`id\`)
      )
    `);
    // Add FK (best effort — may fail if places table not ready)
    try {
      await db.execute(`
        ALTER TABLE \`profile_claims\`
          ADD CONSTRAINT \`profile_claims_placeId_places_id_fk\`
          FOREIGN KEY (\`placeId\`) REFERENCES \`places\`(\`id\`)
          ON DELETE NO ACTION ON UPDATE NO ACTION
      `);
    } catch (_) {
      console.warn("[Migrations] Could not add FK on profile_claims.placeId — skipping.");
    }
    // Indexes
    if (!(await indexExists(db, "profile_claims", "profile_claims_place_id_idx"))) {
      await db.execute(`CREATE INDEX \`profile_claims_place_id_idx\` ON \`profile_claims\` (\`placeId\`)`);
    }
    if (!(await indexExists(db, "profile_claims", "profile_claims_status_idx"))) {
      await db.execute(`CREATE INDEX \`profile_claims_status_idx\` ON \`profile_claims\` (\`status\`)`);
    }
    console.log("[Migrations] ✅ profile_claims table created.");
  } else {
    console.log("[Migrations] ✓ profile_claims already exists.");
  }

  // ─── Migration 002: places.claimStatus column ─────────────────────────────
  if (!(await columnExists(db, "places", "claimStatus"))) {
    console.log("[Migrations] Adding column: places.claimStatus...");
    await db.execute(`
      ALTER TABLE \`places\`
        ADD COLUMN \`claimStatus\` enum('unclaimed','claimed','selo_oranje') NOT NULL DEFAULT 'unclaimed'
    `);
    console.log("[Migrations] ✅ places.claimStatus added.");
  } else {
    console.log("[Migrations] ✓ places.claimStatus already exists.");
  }

  console.log("[Migrations] All migrations applied.");
}
