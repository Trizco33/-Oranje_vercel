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

  // ─── Migration 003: guided_tours — colunas de Passeio Premium ─────────────
  const tourPremiumCols: [string, string][] = [
    ["requiresTransport", "ALTER TABLE `guided_tours` ADD COLUMN `requiresTransport` tinyint(1) NOT NULL DEFAULT 0"],
    ["walkOnly",          "ALTER TABLE `guided_tours` ADD COLUMN `walkOnly` tinyint(1) NOT NULL DEFAULT 0"],
    ["recommendedWithDriver", "ALTER TABLE `guided_tours` ADD COLUMN `recommendedWithDriver` tinyint(1) NOT NULL DEFAULT 0"],
    ["clientPrice",       "ALTER TABLE `guided_tours` ADD COLUMN `clientPrice` float NULL"],
    ["driverPayout",      "ALTER TABLE `guided_tours` ADD COLUMN `driverPayout` float NULL"],
    ["partnerFee",        "ALTER TABLE `guided_tours` ADD COLUMN `partnerFee` float NULL"],
  ];
  for (const [col, sql] of tourPremiumCols) {
    if (!(await columnExists(db, "guided_tours", col))) {
      console.log(`[Migrations] Adding column guided_tours.${col}...`);
      await db.execute(sql);
      console.log(`[Migrations] ✅ guided_tours.${col} added.`);
    } else {
      console.log(`[Migrations] ✓ guided_tours.${col} already exists.`);
    }
  }

  // ─── Migration 004: tour_operations table ─────────────────────────────────
  if (!(await tableExists(db, "tour_operations"))) {
    console.log("[Migrations] Creating table: tour_operations...");
    await db.execute(`
      CREATE TABLE \`tour_operations\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`tourId\` int NOT NULL,
        \`driverId\` varchar(36) NULL,
        \`clientName\` varchar(200) NOT NULL,
        \`clientEmail\` varchar(320) NULL,
        \`clientPhone\` varchar(30) NULL,
        \`scheduledDate\` varchar(20) NOT NULL,
        \`scheduledTime\` varchar(10) NULL,
        \`partySize\` int NOT NULL DEFAULT 1,
        \`departurePoint\` text NULL,
        \`notes\` text NULL,
        \`internalNotes\` text NULL,
        \`requestOrigin\` varchar(50) DEFAULT 'web',
        \`clientPrice\` float NOT NULL DEFAULT 0,
        \`driverPayout\` float NOT NULL DEFAULT 0,
        \`partnerFee\` float NOT NULL DEFAULT 0,
        \`oranjeMargin\` float NOT NULL DEFAULT 0,
        \`operationStatus\` enum('pending','confirmed','assigned','in_progress','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
        \`driverPayoutStatus\` enum('pending','ready_to_pay','paid') NOT NULL DEFAULT 'pending',
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`tour_operations_id\` PRIMARY KEY(\`id\`)
      )
    `);
    try {
      await db.execute(`ALTER TABLE \`tour_operations\` ADD CONSTRAINT \`tour_ops_tour_id_fk\` FOREIGN KEY (\`tourId\`) REFERENCES \`guided_tours\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    } catch (_) { console.warn("[Migrations] FK tour_operations.tourId skipped."); }
    try {
      await db.execute(`ALTER TABLE \`tour_operations\` ADD CONSTRAINT \`tour_ops_driver_id_fk\` FOREIGN KEY (\`driverId\`) REFERENCES \`drivers\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    } catch (_) { console.warn("[Migrations] FK tour_operations.driverId skipped."); }
    if (!(await indexExists(db, "tour_operations", "tour_ops_tour_id_idx"))) {
      await db.execute(`CREATE INDEX \`tour_ops_tour_id_idx\` ON \`tour_operations\` (\`tourId\`)`);
    }
    if (!(await indexExists(db, "tour_operations", "tour_ops_driver_id_idx"))) {
      await db.execute(`CREATE INDEX \`tour_ops_driver_id_idx\` ON \`tour_operations\` (\`driverId\`)`);
    }
    if (!(await indexExists(db, "tour_operations", "tour_ops_scheduled_date_idx"))) {
      await db.execute(`CREATE INDEX \`tour_ops_scheduled_date_idx\` ON \`tour_operations\` (\`scheduledDate\`)`);
    }
    if (!(await indexExists(db, "tour_operations", "tour_ops_status_idx"))) {
      await db.execute(`CREATE INDEX \`tour_ops_status_idx\` ON \`tour_operations\` (\`operationStatus\`)`);
    }
    console.log("[Migrations] ✅ tour_operations table created.");
  } else {
    console.log("[Migrations] ✓ tour_operations already exists.");
  }

  // ─── Migration 005: tour_operation_partners table ─────────────────────────
  if (!(await tableExists(db, "tour_operation_partners"))) {
    console.log("[Migrations] Creating table: tour_operation_partners...");
    await db.execute(`
      CREATE TABLE \`tour_operation_partners\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`operationId\` int NOT NULL,
        \`partnerId\` int NULL,
        \`placeId\` int NULL,
        \`feeAmount\` float NOT NULL DEFAULT 0,
        \`partnerBillingStatus\` enum('pending','billable','invoiced','paid') NOT NULL DEFAULT 'pending',
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        CONSTRAINT \`tour_op_partners_id\` PRIMARY KEY(\`id\`)
      )
    `);
    try {
      await db.execute(`ALTER TABLE \`tour_operation_partners\` ADD CONSTRAINT \`top_op_id_fk\` FOREIGN KEY (\`operationId\`) REFERENCES \`tour_operations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    } catch (_) { console.warn("[Migrations] FK tour_operation_partners.operationId skipped."); }
    if (!(await indexExists(db, "tour_operation_partners", "top_operation_id_idx"))) {
      await db.execute(`CREATE INDEX \`top_operation_id_idx\` ON \`tour_operation_partners\` (\`operationId\`)`);
    }
    if (!(await indexExists(db, "tour_operation_partners", "top_partner_id_idx"))) {
      await db.execute(`CREATE INDEX \`top_partner_id_idx\` ON \`tour_operation_partners\` (\`partnerId\`)`);
    }
    if (!(await indexExists(db, "tour_operation_partners", "top_billing_status_idx"))) {
      await db.execute(`CREATE INDEX \`top_billing_status_idx\` ON \`tour_operation_partners\` (\`partnerBillingStatus\`)`);
    }
    console.log("[Migrations] ✅ tour_operation_partners table created.");
  } else {
    console.log("[Migrations] ✓ tour_operation_partners already exists.");
  }

  // ─── Migration 006: oranje_operations — Central de Operações ────────────────
  if (!(await tableExists(db, "oranje_operations"))) {
    console.log("[Migrations] Creating table: oranje_operations...");
    await db.execute(`
      CREATE TABLE \`oranje_operations\` (
        \`id\`              int AUTO_INCREMENT NOT NULL,
        \`operationType\`   enum('premium_tour','receptive_request','transfer_request','profile_claim') NOT NULL,
        \`sourceId\`        int NULL,
        \`sourceTable\`     varchar(60) NULL,
        \`customerName\`    varchar(200) NOT NULL,
        \`customerEmail\`   varchar(320) NULL,
        \`customerPhone\`   varchar(30) NULL,
        \`assignedToId\`    varchar(36) NULL,
        \`assignedToName\`  varchar(200) NULL,
        \`partnerId\`       int NULL,
        \`scheduledDate\`   varchar(20) NULL,
        \`scheduledTime\`   varchar(10) NULL,
        \`partySize\`       int NULL DEFAULT 1,
        \`notes\`           text NULL,
        \`internalNotes\`   text NULL,
        \`requestOrigin\`   varchar(50) DEFAULT 'web',
        \`status\`          enum('pending','confirmed','assigned','in_progress','completed','cancelled','rejected','no_show') NOT NULL DEFAULT 'pending',
        \`customerAmount\`  float NULL DEFAULT 0,
        \`partnerAmount\`   float NULL DEFAULT 0,
        \`operatorAmount\`  float NULL DEFAULT 0,
        \`oranjeMargin\`    float NULL DEFAULT 0,
        \`billingStatus\`   enum('not_applicable','pending','billed','paid') DEFAULT 'not_applicable',
        \`payoutStatus\`    enum('not_applicable','pending','ready_to_pay','paid') DEFAULT 'not_applicable',
        \`metaJson\`        json NULL,
        \`createdBy\`       varchar(200) NULL,
        \`lastActionAt\`    timestamp NULL,
        \`lastActionBy\`    varchar(200) NULL,
        \`createdAt\`       timestamp NOT NULL DEFAULT (now()),
        \`updatedAt\`       timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`oranje_operations_pk\` PRIMARY KEY(\`id\`)
      )
    `);
    if (!(await indexExists(db, "oranje_operations", "oranje_ops_type_idx"))) {
      await db.execute(`CREATE INDEX \`oranje_ops_type_idx\` ON \`oranje_operations\` (\`operationType\`)`);
    }
    if (!(await indexExists(db, "oranje_operations", "oranje_ops_status_idx"))) {
      await db.execute(`CREATE INDEX \`oranje_ops_status_idx\` ON \`oranje_operations\` (\`status\`)`);
    }
    if (!(await indexExists(db, "oranje_operations", "oranje_ops_date_idx"))) {
      await db.execute(`CREATE INDEX \`oranje_ops_date_idx\` ON \`oranje_operations\` (\`scheduledDate\`)`);
    }
    if (!(await indexExists(db, "oranje_operations", "oranje_ops_source_idx"))) {
      await db.execute(`CREATE INDEX \`oranje_ops_source_idx\` ON \`oranje_operations\` (\`sourceId\`, \`sourceTable\`)`);
    }
    console.log("[Migrations] ✅ oranje_operations table created.");
  } else {
    console.log("[Migrations] ✓ oranje_operations already exists.");
  }

  // ─── Migration 007: operation_events — Histórico por Operação ─────────────
  if (!(await tableExists(db, "operation_events"))) {
    console.log("[Migrations] Creating table: operation_events...");
    await db.execute(`
      CREATE TABLE \`operation_events\` (
        \`id\`           int AUTO_INCREMENT NOT NULL,
        \`operationId\`  int NOT NULL,
        \`eventType\`    varchar(50) NOT NULL,
        \`fromValue\`    varchar(100) NULL,
        \`toValue\`      varchar(100) NULL,
        \`note\`         text NULL,
        \`actorName\`    varchar(200) NULL,
        \`createdAt\`    timestamp NOT NULL DEFAULT (now()),
        CONSTRAINT \`operation_events_pk\` PRIMARY KEY(\`id\`)
      )
    `);
    try {
      await db.execute(`
        ALTER TABLE \`operation_events\`
          ADD CONSTRAINT \`op_events_operation_id_fk\`
          FOREIGN KEY (\`operationId\`) REFERENCES \`oranje_operations\`(\`id\`)
          ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    } catch (_) { console.warn("[Migrations] FK operation_events.operationId skipped."); }
    if (!(await indexExists(db, "operation_events", "op_events_operation_id_idx"))) {
      await db.execute(`CREATE INDEX \`op_events_operation_id_idx\` ON \`operation_events\` (\`operationId\`)`);
    }
    if (!(await indexExists(db, "operation_events", "op_events_type_idx"))) {
      await db.execute(`CREATE INDEX \`op_events_type_idx\` ON \`operation_events\` (\`eventType\`)`);
    }
    console.log("[Migrations] ✅ operation_events table created.");
  } else {
    console.log("[Migrations] ✓ operation_events already exists.");
  }

  // ─── Migration 008: operationCode em oranje_operations ───────────────────
  if (await tableExists(db, "oranje_operations")) {
    const colExists = await columnExists(db, "oranje_operations", "operationCode");
    if (!colExists) {
      console.log("[Migrations] Adding operationCode to oranje_operations...");
      await db.execute(`
        ALTER TABLE \`oranje_operations\`
          ADD COLUMN \`operationCode\` varchar(20) NULL UNIQUE
      `);
      // Preenche retroativamente os registros sem código
      await db.execute(`
        UPDATE \`oranje_operations\`
          SET \`operationCode\` = CONCAT('ORJ-', YEAR(\`createdAt\`), '-', LPAD(\`id\`, 4, '0'))
          WHERE \`operationCode\` IS NULL
      `);
      console.log("[Migrations] ✅ operationCode adicionado e preenchido retroativamente.");
    } else {
      console.log("[Migrations] ✓ operationCode já existe em oranje_operations.");
    }
  }

  // ─── Migration 009: configurar campos de transporte nos guided_tours ────────
  // Tours curados (1-7): recommendedWithDriver = true (CTA do motorista aparece)
  // Tours de corrida (8-9): walkOnly = true (CTA não aparece)
  // Idempotente: só atualiza se o tour já está todos em 0 (nunca configurado)
  if (await tableExists(db, "guided_tours") && await columnExists(db, "guided_tours", "recommendedWithDriver")) {
    const [check] = await db.execute(`
      SELECT COUNT(*) as cnt FROM \`guided_tours\`
      WHERE (slug LIKE 'holambra-%') AND recommendedWithDriver = 1
    `) as any;
    const alreadySet = (check[0]?.cnt ?? 0) > 0;
    if (!alreadySet) {
      console.log("[Migrations] Configurando campos de transporte nos guided_tours...");
      await db.execute(`
        UPDATE \`guided_tours\`
          SET recommendedWithDriver = 1, walkOnly = 0, requiresTransport = 0
          WHERE slug IN (
            'holambra-romantica','holambra-de-manha','holambra-das-flores',
            'holambra-da-imigracao','holambra-gourmet','holambra-familiar',
            'holambra-ao-entardecer'
          )
      `);
      await db.execute(`
        UPDATE \`guided_tours\`
          SET walkOnly = 1, recommendedWithDriver = 0, requiresTransport = 0
          WHERE slug IN ('corrida-puxada-holambra','corrida-leve-holambra')
      `);
      console.log("[Migrations] ✅ Campos de transporte configurados nos 7 passeios curados.");
    } else {
      console.log("[Migrations] ✓ Campos de transporte dos guided_tours já configurados.");
    }
  }

  console.log("[Migrations] All migrations applied.");
}
