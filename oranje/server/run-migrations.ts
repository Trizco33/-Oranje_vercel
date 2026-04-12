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

  // ─── Migration 010: article_slug_redirects + corrigir slug do artigo Festival ─
  if (!(await tableExists(db, "article_slug_redirects"))) {
    console.log("[Migrations] Criando tabela article_slug_redirects...");
    await db.execute(`
      CREATE TABLE \`article_slug_redirects\` (
        \`id\`        INT AUTO_INCREMENT PRIMARY KEY,
        \`oldSlug\`   VARCHAR(255) NOT NULL UNIQUE,
        \`articleId\` INT NOT NULL,
        \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX \`asr_old_slug_idx\` (\`oldSlug\`),
        INDEX \`asr_article_id_idx\` (\`articleId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("[Migrations] ✅ article_slug_redirects criada.");
  } else {
    console.log("[Migrations] ✓ article_slug_redirects já existe.");
  }

  // Corrigir slug do artigo "Festival do Rei em Holambra" para o slug desejado
  if (await tableExists(db, "articles") && await tableExists(db, "article_slug_redirects")) {
    const newSlug = "festival-do-rei-holambra-circuito-gastronomico";
    const [targetCheck] = await db.execute(
      `SELECT id, slug FROM \`articles\` WHERE title LIKE '%Festival do Rei%' AND title LIKE '%gastron%' LIMIT 1`
    ) as any;
    const target = targetCheck[0];
    if (target && target.slug !== newSlug) {
      const oldSlug = (target.slug as string).replace(/'/g, "''");
      const artId   = Number(target.id);
      console.log(`[Migrations] Corrigindo slug do artigo id=${artId}: "${target.slug}" → "${newSlug}"`);
      // Verifica se newSlug já está em uso por outro artigo (sem parâmetros — valores controlados)
      const [conflictCheck] = await db.execute(
        `SELECT id FROM \`articles\` WHERE slug = '${newSlug}' AND id <> ${artId} LIMIT 1`
      ) as any;
      if (conflictCheck[0]) {
        console.warn(`[Migrations] ⚠️  Slug "${newSlug}" já pertence ao artigo id=${conflictCheck[0].id} — pulando.`);
      } else {
        await db.execute(`UPDATE \`articles\` SET slug = '${newSlug}' WHERE id = ${artId}`);
        await db.execute(
          `INSERT IGNORE INTO \`article_slug_redirects\` (oldSlug, articleId) VALUES ('${oldSlug}', ${artId})`
        );
        console.log(`[Migrations] ✅ Slug atualizado. Redirect "${target.slug}" → artigo id=${artId} registrado.`);
      }
    } else if (target && target.slug === newSlug) {
      console.log(`[Migrations] ✓ Artigo "Festival do Rei" já tem o slug correto.`);
    } else {
      console.log(`[Migrations] ⚠️  Artigo "Festival do Rei" não encontrado no banco — sem ação.`);
    }
  }

  // ─── Migration 011: corrigir dataPending para lugares canônicos confirmados ──
  // Lugares que foram renomeados via fix scripts podem ter herdado dataPending=true
  // do nome antigo. Este migration garante que os lugares com dados publicamente
  // verificáveis fiquem com dataPending=false.
  if (await tableExists(db, "places")) {
    const confirmedPlaces = [
      "De Immigrant Restaurante Garden",
      "De Immigrant Gastro Café",
      "Expoflora",
      "Zoet en Zout",
      "Deck do Amor",
      "Praça Vitória Régia",
      "Rua dos Guarda-Chuvas",
      "Moinho Povos Unidos",
      "Parque Van Gogh",
      "Macena Flores",
      "Bloemen Park",
      "Casa Bela Restaurante",
      "Don Hamburgo",
      "Cow Burguer",
      "Dolce Flor Holambra",
      "Fiore Forneria",
      "Vecchio Onofre",
      "Casa da Esfiha",
      "Martin Holandesa Confeitaria e Restaurante",
      "Italia no Box",
      "Tulipa's Lounge",
      "Royal Tulip Holambra",
      "Holambra Garden Hotel",
      "Villa de Holanda Parque Hotel",
      "Shellter Hotel",
      "Parque Hotel Holambra",
      "Lago do Holandês",
      "Museu da Cultura e História de Holambra",
      "Fratelli Wine Bar",
      "Hana Restaurante Holambra",
      "The Old Dutch",
      "Pousada Rancho da Cachaça",
    ];
    const [pendingCheck] = await db.execute(
      `SELECT COUNT(*) as cnt FROM \`places\` WHERE name IN (${confirmedPlaces.map(n => `'${n.replace(/'/g, "''")}'`).join(",")}) AND dataPending = 1`
    ) as any;
    const pendingCount = pendingCheck[0]?.cnt ?? 0;
    if (pendingCount > 0) {
      console.log(`[Migrations] Corrigindo dataPending para ${pendingCount} lugar(es) canônico(s)...`);
      await db.execute(
        `UPDATE \`places\` SET dataPending = 0, updatedAt = NOW() WHERE name IN (${confirmedPlaces.map(n => `'${n.replace(/'/g, "''")}'`).join(",")})`
      );
      console.log(`[Migrations] ✅ dataPending corrigido para ${pendingCount} lugar(es).`);
    } else {
      console.log("[Migrations] ✓ dataPending já correto em todos os lugares canônicos.");
    }
  }

  // ─── Migration 012: auditoria completa — lat/lng, duplicados, horários, paradas ──
  if (await tableExists(db, "places")) {

    // 12-A: Lat/lng dos 3 lugares do Festival Gastronômico (criados sem coordenadas)
    const festivalUpdates = [
      { id: 25616, lat: -22.6362, lng: -47.0618, name: "Obelisco Gelato e Café" },
      { id: 25617, lat: -22.6382, lng: -47.0638, name: "Restaurante Tratterie Holandesa" },
      { id: 25618, lat: -22.6356, lng: -47.0615, name: "Ristorante Marchesini di Roverbella" },
    ];
    for (const { id, lat, lng, name } of festivalUpdates) {
      const [chk] = await db.execute(`SELECT lat FROM \`places\` WHERE id = ${id}`) as any;
      if (chk[0] && (chk[0].lat === null || chk[0].lat === 0)) {
        await db.execute(`UPDATE \`places\` SET lat = ${lat}, lng = ${lng}, updatedAt = NOW() WHERE id = ${id}`);
        console.log(`[Migrations] ✅ lat/lng adicionado: ${name} (id=${id})`);
      } else {
        console.log(`[Migrations] ✓ lat/lng já existe: ${name}`);
      }
    }

    // 12-B: Lat/lng do Don Hamburgo (seed tem lat=null)
    const [donH] = await db.execute(`SELECT id, lat FROM \`places\` WHERE slug = 'don-hamburgo' LIMIT 1`) as any;
    if (donH[0] && (donH[0].lat === null || donH[0].lat === 0)) {
      await db.execute(`UPDATE \`places\` SET lat = -22.6355, lng = -47.0625, updatedAt = NOW() WHERE slug = 'don-hamburgo'`);
      console.log("[Migrations] ✅ lat/lng adicionado: Don Hamburgo");
    } else {
      console.log("[Migrations] ✓ Don Hamburgo lat/lng já configurado");
    }

    // 12-C: Esconder "Italia No Box Holambra" (id=13954) — duplicado de "Italia no Box" (id=40)
    const [italiaCheck] = await db.execute(`SELECT id, dataPending FROM \`places\` WHERE id = 13954 LIMIT 1`) as any;
    if (italiaCheck[0] && italiaCheck[0].dataPending == 0) {
      await db.execute(`UPDATE \`places\` SET dataPending = 1, updatedAt = NOW() WHERE id = 13954`);
      console.log("[Migrations] ✅ Italia No Box Holambra (id=13954) ocultado — duplicado de Italia no Box (id=40)");
    } else {
      console.log("[Migrations] ✓ Italia No Box Holambra já oculto ou não existe");
    }

    // 12-D: Opening hours para lugares públicos sem horário
    const hoursUpdates: { slug: string; hours: string; label: string }[] = [
      { slug: "fratelli-wine-bar", hours: "Qui–Sex: 18h–23h | Sáb: 12h–00h | Dom: 12h–22h | Fecha Seg–Qua", label: "Fratelli Wine Bar" },
      { slug: "tulipas-lounge", hours: "Qui–Sex: 19h–01h | Sáb: 19h–02h | Dom: 19h–00h | Fecha Seg–Qua", label: "Tulipa's Lounge" },
      { slug: "royal-tulip-holambra", hours: "Aberto 24h — recepção disponível a qualquer hora", label: "Royal Tulip Holambra" },
      { slug: "holambra-garden-hotel", hours: "Aberto 24h — recepção disponível a qualquer hora", label: "Holambra Garden Hotel" },
      { slug: "villa-de-holanda-parque-hotel", hours: "Aberto 24h — recepção disponível a qualquer hora", label: "Villa de Holanda Parque Hotel" },
      { slug: "shellter-hotel", hours: "Aberto 24h — recepção disponível a qualquer hora", label: "Shellter Hotel" },
      { slug: "rancho-da-cachaca", hours: "Seg/Qua–Dom: 08h–18h | Fecha às terças", label: "Pousada Rancho da Cachaça" },
      { slug: "deck-do-amor", hours: "Acesso livre todos os dias — melhor ao entardecer", label: "Deck do Amor" },
      { slug: "praca-vitoria-regia", hours: "Acesso livre todos os dias — melhor ao amanhecer", label: "Praça Vitória Régia" },
      { slug: "rua-dos-guarda-chuvas", hours: "Acesso livre todos os dias", label: "Rua dos Guarda-Chuvas" },
      { slug: "museu-da-cultura-e-historia-de-holambra", hours: "Ter–Dom: 09h–17h | Fecha às segundas | Entrada gratuita", label: "Museu da Cultura e História de Holambra" },
      { slug: "expoflora-park", hours: "Evento anual em setembro — consulte expoflora.com.br para datas", label: "Expoflora" },
      { slug: "dr-pizza-holambra", hours: "Ter–Dom: 18h–23h | Fecha às segundas", label: "Dr Pizza Holambra" },
      { slug: "pizzaria-serrana", hours: "Ter–Dom: 18h–23h | Fecha às segundas", label: "Pizzaria Serrana" },
      { slug: "parque-hotel-holambra", hours: "Aberto 24h — recepção disponível a qualquer hora", label: "Parque Hotel Holambra" },
    ];
    for (const { slug, hours, label } of hoursUpdates) {
      const [chk] = await db.execute(`SELECT openingHours FROM \`places\` WHERE slug = '${slug}' LIMIT 1`) as any;
      if (chk[0] && !chk[0].openingHours) {
        const escapedHours = hours.replace(/'/g, "''");
        await db.execute(`UPDATE \`places\` SET openingHours = '${escapedHours}', updatedAt = NOW() WHERE slug = '${slug}'`);
        console.log(`[Migrations] ✅ openingHours adicionado: ${label}`);
      } else {
        console.log(`[Migrations] ✓ ${label} já tem openingHours`);
      }
    }
  }

  // 12-E: Remover parada de Tour 8 que aponta para "Nossa Prainha" (dataPending=1)
  if (await tableExists(db, "guided_tour_stops")) {
    const [chk] = await db.execute(`SELECT id FROM \`guided_tour_stops\` WHERE tourId = 8 AND placeId = 23 LIMIT 1`) as any;
    if (chk[0]) {
      await db.execute(`DELETE FROM \`guided_tour_stops\` WHERE tourId = 8 AND placeId = 23`);
      console.log("[Migrations] ✅ Parada 'Nossa Prainha' (dataPending=1) removida do Tour 8");
    } else {
      console.log("[Migrations] ✓ Tour 8 sem parada em Nossa Prainha — ok");
    }
  }

  // ─── Migration 013: publicar 9 lugares com links hardcoded em CMSCategoryPage ──
  {
    const [row] = await db.execute(`SHOW COLUMNS FROM \`places\` LIKE 'dataPending'`);
    if (row) {
      await db.execute(`
        UPDATE \`places\`
        SET dataPending = 0, updatedAt = NOW()
        WHERE id IN (23, 25, 26, 27, 32, 43, 2614, 6334, 6428)
          AND dataPending = 1
      `);
      console.log("[Migrations] ✅ 013: 9 lugares publicados (dataPending=0) — Nossa Prainha, Villa Girassol, Holambier, Lotus Café, Bloemen Park, Quintal dos Avós, Lago do Holandês, Seo Carneiro, Oma Beppie");
    }
  }

  // ─── Migration 014: corrigir endereços e coordenadas de 12 lugares ──────────
  {
    const fixes: { id: number; name: string; address: string; lat?: number; lng?: number }[] = [
      { id: 8,     name: "Pizzaria Serrana",                     address: "R. Campo do Pouso, 898 - Centro, Holambra - SP, 13825-063",                                  lat: -22.6398, lng: -47.0608 },
      { id: 9,     name: "Dr Pizza Holambra",                    address: "R. Proteas, 42 - Jardim Holanda, Holambra - SP, 13825-000",                                  lat: -22.6360, lng: -47.0660 },
      { id: 16,    name: "Shellter Hotel",                       address: "Av. das Tulípas, 57 - Centro, Holambra - SP, 13825-000",                                     lat: -22.6380, lng: -47.0615 },
      { id: 17,    name: "Pousada Rancho da Cachaça",            address: "Petrus Van Ham - Estrada HBR, 266 - Camanducaia, Holambra - SP, 13829-899",                  lat: -22.6500, lng: -47.0500 },
      { id: 18,    name: "Parque Hotel Holambra",                address: "R. das Dálias, 100 - Jardim Holanda, Holambra - SP, 13827-030" },
      { id: 31,    name: "Holambra Garden Hotel",                address: "R. Rota dos Imigrantes, 620 - Centro, Holambra - SP, 13825-000",                             lat: -22.6381, lng: -47.0607 },
      { id: 32,    name: "Bloemen Park",                         address: "Sitio Laguna - Estrada Municipal HBR-155, s/n - Alegre, Holambra - SP, 13825-000" },
      { id: 4215,  name: "Rua dos Guarda-Chuvas",               address: "Alameda Maurício de Nassau - Secção A, Holambra - SP, 13825-000" },
      { id: 6418,  name: "Fratelli Wine Bar",                    address: "R. Campo do Pouso, 1050 - Centro, Holambra - SP, 13825-000",                                 lat: -22.6388, lng: -47.0612 },
      { id: 6424,  name: "Museu da Cultura e História",          address: "Alameda Maurício de Nassau, 894 - Centro, Holambra - SP, 13825-000" },
      { id: 13946, name: "Don Hamburgo",                         address: "Av. das Tulípas, 44 - Centro, Holambra - SP, 13825-000",                                     lat: -22.6382, lng: -47.0615 },
      { id: 13952, name: "Casa da Esfiha",                       address: "R. Campo do Pouso, 826 - Secção A, Holambra - SP, 13825-000",                                lat: -22.6400, lng: -47.0618 },
    ];

    for (const f of fixes) {
      const escapedAddr = f.address.replace(/'/g, "''");
      if (f.lat !== undefined && f.lng !== undefined) {
        await db.execute(
          `UPDATE \`places\` SET address = '${escapedAddr}', lat = ${f.lat}, lng = ${f.lng}, updatedAt = NOW() WHERE id = ${f.id}`
        );
      } else {
        await db.execute(
          `UPDATE \`places\` SET address = '${escapedAddr}', updatedAt = NOW() WHERE id = ${f.id}`
        );
      }
      console.log(`[Migrations] ✅ 014: Endereço corrigido — ${f.name} (id=${f.id})`);
    }
  }

  // ─── Migration 015: aplicar coverImages confirmadas para lugares sem foto ────
  {
    const fixes: { id: number; name: string; coverImage: string }[] = [
      { id: 4213,  name: "Deck do Amor",                   coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/08/ff/50/img-20180211-174802-283.jpg?w=1200&h=-1&s=1" },
      { id: 4214,  name: "Praça Vitória Régia",            coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/0f/ef/2e/foto-panoramica-em-um.jpg?w=900&h=500&s=1" },
      { id: 4215,  name: "Rua dos Guarda-Chuvas",          coverImage: "https://i.pinimg.com/736x/57/ab/06/57ab066b45a89b7000193f24d4e623d7.jpg" },
      { id: 13946, name: "Don Hamburgo",                    coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/73/6f/ae/don-hamburgo.jpg?w=1200&h=-1&s=1" },
      { id: 26613, name: "Cow Burguer",                     coverImage: "/places/cowburguer.png" },
      { id: 3824,  name: "De Immigrant Restaurante Garden", coverImage: "/places/de-immigrant-garden.png" },
      { id: 3825,  name: "Villa de Holanda Parque Hotel",   coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/1d/fd/d2/hotel-villa-de-holanda.jpg?w=900&h=500&s=1" },
    ];

    for (const f of fixes) {
      const existing = await db.execute(`SELECT coverImage FROM \`places\` WHERE id = ${f.id} LIMIT 1`) as any;
      const rows = existing[0] as any[];
      if (rows.length > 0 && rows[0].coverImage) {
        console.log(`[Migrations] ✓ 015: ${f.name} já tem coverImage`);
        continue;
      }
      const escaped = f.coverImage.replace(/'/g, "''");
      await db.execute(`UPDATE \`places\` SET coverImage = '${escaped}', updatedAt = NOW() WHERE id = ${f.id}`);
      console.log(`[Migrations] ✅ 015: coverImage aplicado — ${f.name} (id=${f.id})`);
    }
  }

  // ─── Migration 016: 5 novas hospedagens + correção Hotel 1948 ──────────────
  {
    // 016-A: Corrigir Hotel 1948 (id=3826) — endereço genérico → endereço real
    const [h1948] = await db.execute(`SELECT id, address FROM \`places\` WHERE id = 3826 LIMIT 1`) as any;
    const h1948Row = (h1948 as any[])[0];
    if (h1948Row && (!h1948Row.address || h1948Row.address === 'Holambra \u2013 SP' || h1948Row.address === 'Holambra - SP')) {
      await db.execute(`UPDATE \`places\` SET address = 'Rua Brom\u00e9lias, 206, Holambra - SP, 13825-000', lat = -22.62810, lng = -47.05010, dataPending = 0, updatedAt = NOW() WHERE id = 3826`);
      console.log(`[Migrations] ✅ 016: Hotel 1948 — endereço e coords corrigidos`);
    } else {
      console.log(`[Migrations] ✓ 016: Hotel 1948 endereço já correto`);
    }

    // 016-B: Inserir 5 novas hospedagens (idempotente via INSERT IGNORE + unique name+city)
    const novasHospedagens = [
      {
        name: "Hotel Flores de Holambra",
        shortDesc: "Hotel familiar no Centro de Holambra — conforto e boa localização para explorar a cidade das flores",
        longDesc: "O Hotel Flores de Holambra fica no coração do Centro, na tranquila Rua das Bromélias — a poucos passos dos principais pontos turísticos da cidade. Uma opção acessível e bem localizada para quem quer usar Holambra como base de fim de semana sem abrir mão de conforto.",
        address: "R. Brom\u00e9lias, 125 - Centro, Holambra - SP, 13825-055",
        lat: -22.62817, lng: -47.05019,
        openingHours: "Aberto 24h \u2014 recep\u00e7\u00e3o dispon\u00edvel a qualquer hora",
        tags: "hotel,central,familia,casal,flores,fim_de_semana",
      },
      {
        name: "Hotel Amsterdam Su\u00edtes",
        shortDesc: "Hotel de suítes no Parque Residencial Palm Park — tranquilidade e natureza a poucos minutos do centro",
        longDesc: "O Hotel Amsterdam Suítes está localizado no Parque Residencial Palm Park, área verde e tranquila de Holambra próxima à Rodovia SP-107. As suítes oferecem mais espaço e privacidade, com ambiente que privilegia o silêncio e o contato com a natureza — ideal para casais que buscam descanso de verdade.",
        address: "R. Dezesseis, 31 - Parque Res. Palm Park, Holambra - SP, 13825-000",
        lat: -22.62484, lng: -47.05660,
        openingHours: "Aberto 24h \u2014 recep\u00e7\u00e3o dispon\u00edvel a qualquer hora",
        tags: "hotel,suites,palm_park,natureza,casal,tranquilo,fim_de_semana",
      },
      {
        name: "Onze Tuin - Hospedagem numa vilinha holandesa",
        shortDesc: "Hospedagem encantadora em uma vilinha de estilo holandês — ambiente único no coração de Holambra",
        longDesc: "O Onze Tuin — que significa Nosso Jardim em holandês — é uma das hospedagens mais charmosas de Holambra. Situado no Campo do Pouso, no coração da cidade, o local recria a atmosfera de uma vilinha holandesa com atenção aos detalhes: fachadas características, jardins cuidados e hospitalidade que faz o hóspede sentir que está numa pequena aldeia europeia.",
        address: "R. Campo do Pouso, 1050 - Sec\u00e7\u00e3o A, Holambra - SP, 13825-063",
        lat: -22.63880, lng: -47.06120,
        openingHours: "Aberto 24h \u2014 recep\u00e7\u00e3o dispon\u00edvel a qualquer hora",
        tags: "hospedagem,holandes,charmoso,casal,romantico,central,vilinha,experiencia",
      },
      {
        name: "Pousada Rosa de Saron",
        shortDesc: "Pousada aconchegante no bairro Morada das Flores — tranquilidade e boa localização em Holambra",
        longDesc: "A Pousada Rosa de Saron está localizada no bairro Morada das Flores, uma das áreas mais tranquilas e residenciais de Holambra. Proposta aconchegante, com atendimento próximo e ambiente familiar — ideal para casais e famílias que querem descanso sem abrir mão de estar bem localizado na cidade.",
        address: "R. das Az\u00e1leias, 597 - Morada das Flores, Holambra - SP, 13825-000",
        lat: -22.64039, lng: -47.05359,
        openingHours: "Aberto 24h \u2014 recep\u00e7\u00e3o dispon\u00edvel a qualquer hora",
        tags: "pousada,morada_das_flores,tranquilo,aconchegante,familia,casal,fim_de_semana",
      },
      {
        name: "Lofts Holambra",
        shortDesc: "Lofts modernos no bairro dos Imigrantes — espaço, conforto e custo-benefício em Holambra",
        longDesc: "Os Lofts Holambra ficam no bairro dos Imigrantes, na Rua Flipsen — área residencial tranquila que mistura moradores locais e visitantes. Os lofts têm proposta mais independente: espaços amplos com cozinha, ideais para quem fica mais de uma noite e quer liberdade para montar a própria rotina na cidade.",
        address: "R. Flipsen, 168 - Imigrantes, Holambra - SP, 13825-000",
        lat: -22.61607, lng: -47.06488,
        openingHours: "Aberto 24h \u2014 check-in a combinar",
        tags: "loft,imigrantes,moderno,casal,familia,autonomia,cozinha,fim_de_semana",
      },
    ];

    for (const h of novasHospedagens) {
      const [chk] = await db.execute(
        `SELECT id FROM \`places\` WHERE name = '${h.name.replace(/'/g, "''")}' AND city = 'Holambra' LIMIT 1`
      ) as any;
      const existing = (chk as any[])[0];
      if (existing) {
        console.log(`[Migrations] ✓ 016: ${h.name} já existe (id=${existing.id})`);
        continue;
      }
      const esc = (s: string) => s.replace(/'/g, "''");
      await db.execute(`
        INSERT INTO \`places\`
          (name, slug, shortDesc, longDesc, address, lat, lng, city, state, country,
           categoryId, priceRange, isFree, isRecommended, isFeatured, isPartner,
           openingHours, tags, status, dataPending, createdAt, updatedAt)
        VALUES (
          '${esc(h.name)}',
          '${esc(h.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''))}',
          '${esc(h.shortDesc)}',
          '${esc(h.longDesc)}',
          '${esc(h.address)}',
          ${h.lat}, ${h.lng},
          'Holambra', 'SP', 'Brasil',
          15, '$$', 0, 0, 0, 0,
          '${esc(h.openingHours)}',
          '${esc(h.tags)}',
          'active', 0,
          NOW(), NOW()
        )
      `);
      console.log(`[Migrations] ✅ 016: ${h.name} inserido`);
    }

    // 016-C: Aplicar coverImages para as 6 hospedagens (idempotente — só atualiza se nulo)
    const coverFixes: { name: string; coverImage: string }[] = [
      { name: "Hotel 1948",                                   coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/f9/ed/5f/getlstd-property-photo.jpg?w=900&h=500&s=1" },
      { name: "Hotel Flores de Holambra",                     coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/30/c2/9f/caption.jpg?w=900&h=500&s=1" },
      { name: "Hotel Amsterdam Su\u00edtes",                  coverImage: "https://hotelamsterdamsuites.com.br/wp-content/uploads/2022/05/e261555a-62a9-45b0-99be-fcacda416190.jpg" },
      { name: "Onze Tuin - Hospedagem numa vilinha holandesa", coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/b2/1e/1e/caption.jpg?w=900&h=500&s=1" },
      { name: "Pousada Rosa de Saron",                        coverImage: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/334575400.jpg?k=89aba352f67194bbbed435d4e97ab0c02ff3b1a24f058e92da80c1a81e84a633&o=" },
      { name: "Lofts Holambra",                               coverImage: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/573954772.jpg?k=118fd4dfd501ec7f3757a074e0de3d40afc93bf52c03defa8c79570661d1bd79&o=" },
    ];
    for (const f of coverFixes) {
      const [chk] = await db.execute(
        `SELECT id, coverImage FROM \`places\` WHERE name = '${f.name.replace(/'/g, "''")}' AND city = 'Holambra' LIMIT 1`
      ) as any;
      const row = (chk as any[])[0];
      if (!row) { console.log(`[Migrations] ⚠️  016-C: não encontrado — ${f.name}`); continue; }
      if (row.coverImage) { console.log(`[Migrations] ✓ 016-C: ${f.name} já tem coverImage`); continue; }
      const esc = f.coverImage.replace(/'/g, "''");
      await db.execute(`UPDATE \`places\` SET coverImage = '${esc}', updatedAt = NOW() WHERE id = ${row.id}`);
      console.log(`[Migrations] ✅ 016-C: coverImage aplicado — ${f.name} (id=${row.id})`);
    }
  }

  // ─── Migration 020: Correções OSM-verificadas individualmente ──────────────
  // Cada coordenada foi obtida diretamente do OSM Overpass por nome do lugar.
  // Sem fórmula de offset — só dados verificados por fonte primária.
  {
    const osm020: Array<{ id: number; name: string; lat: number; lng: number; source: string }> = [
      // Confirmados via OSM Overpass "out center" por nome exato do estabelecimento
      { id: 4215,  name: "Rua dos Guarda-Chuvas",       lat: -22.62973, lng: -47.05824, source: "OSM way 126692860 — Alameda Maurício de Nassau + Nominatim" },
      { id: 4214,  name: "Praça Vitória Régia",          lat: -22.63145, lng: -47.05729, source: "OSM way 1171605571" },
      { id: 5,     name: "Expoflora",                    lat: -22.62569, lng: -47.05632, source: "OSM way 126693147" },
      { id: 2616,  name: "Moinho Povos Unidos",          lat: -22.62321, lng: -47.06018, source: "OSM way 126693171" },
      { id: 19,    name: "Parque Van Gogh",              lat: -22.63786, lng: -47.05119, source: "OSM way 1098863639" },
      { id: 30,    name: "Royal Tulip Holambra",         lat: -22.62453, lng: -47.07554, source: "OSM way 1136037533" },
      { id: 34,    name: "Macena Flores",                lat: -22.61587, lng: -47.04791, source: "OSM way 1132588683" },
      { id: 32,    name: "Bloemen Park",                 lat: -22.61276, lng: -47.05664, source: "OSM way 1133332816" },
      { id: 18,    name: "Parque Hotel Holambra",        lat: -22.64005, lng: -47.04236, source: "OSM node 10992283114" },
      { id: 23,    name: "Nossa Prainha",                lat: -22.63726, lng: -47.05401, source: "OSM way — Lago Nossa Prainha" },
      { id: 21,    name: "Cidade das Crianças",          lat: -22.62279, lng: -47.05803, source: "OSM way — Parque Cidade das Crianças" },
    ];

    const R = 6371000;
    for (const c of osm020) {
      const [rows] = await db.execute(`SELECT id, name, lat, lng FROM \`places\` WHERE id = ${c.id} LIMIT 1`) as any[];
      const row = (rows as any[])[0];
      if (!row) { console.log(`[Migrations] ⚠️  020: id=${c.id} não encontrado`); continue; }
      const dLat = (c.lat - parseFloat(row.lat)) * Math.PI / 180;
      const dLng = (c.lng - parseFloat(row.lng)) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(parseFloat(row.lat)*Math.PI/180)*Math.cos(c.lat*Math.PI/180)*Math.sin(dLng/2)**2;
      const distM = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
      if (distM < 30) {
        await db.execute(`UPDATE \`places\` SET geoStatus='ok', geoNote=${JSON.stringify(c.source)} WHERE id=${c.id}`);
        console.log(`[Migrations] ✓ 020: ${c.name} já correto [OSM]`);
      } else {
        await db.execute(`UPDATE \`places\` SET lat=${c.lat}, lng=${c.lng}, geoStatus='ok', geoNote=${JSON.stringify('Corrigido via OSM Overpass: ' + c.source + ' (' + distM + 'm de erro anterior)')}, updatedAt=NOW() WHERE id=${c.id}`);
        console.log(`[Migrations] ✅ 020: ${c.name} — corrigido ${distM}m [OSM]`);
      }
    }
    console.log("[Migrations] ✅ 020: Correções OSM individuais aplicadas");
  }

  // ─── Migration 019: geoStatus + correção global de coordenadas ─────────────
  // Adiciona coluna geoStatus e corrige/classifica todos os lugares.
  {
    // 019-A: Adicionar coluna geoStatus (se não existir)
    if (!(await columnExists(db, "places", "geoStatus"))) {
      await db.execute(`ALTER TABLE \`places\` ADD COLUMN \`geoStatus\` enum('ok','suspect','out_of_bounds','unverified','needs_review') NOT NULL DEFAULT 'unverified' AFTER \`updatedAt\``);
      console.log("[Migrations] ✅ 019-A: coluna geoStatus adicionada");
    } else {
      console.log("[Migrations] ✓ 019-A: geoStatus já existe");
    }
    if (!(await columnExists(db, "places", "geoNote"))) {
      await db.execute(`ALTER TABLE \`places\` ADD COLUMN \`geoNote\` text NULL AFTER \`geoStatus\``);
      console.log("[Migrations] ✅ 019-A: coluna geoNote adicionada");
    }

    // 019-B: Correções de coordenadas — OSM-confirmadas (alta confiança)
    const osmCorrections: Array<{ id: number; name: string; lat: number; lng: number }> = [
      { id: 2614,  name: "Lago do Holandês",               lat: -22.63630, lng: -47.05150 },
      { id: 4213,  name: "Deck do Amor",                   lat: -22.63140, lng: -47.05770 },
      { id: 3825,  name: "Villa de Holanda Parque Hotel",  lat: -22.63250, lng: -47.05580 },
      { id: 25617, name: "Restaurante Tratterie Holandesa",lat: -22.63000, lng: -47.04990 },
      { id: 4212,  name: "Zoet en Zout",                   lat: -22.62930, lng: -47.05670 },
    ];

    for (const c of osmCorrections) {
      const [rows] = await db.execute(`SELECT id, lat, lng FROM \`places\` WHERE id = ${c.id} LIMIT 1`) as any[];
      const row = (rows as any[])[0];
      if (!row) { console.log(`[Migrations] ⚠️  019-B: id=${c.id} não encontrado`); continue; }
      const R = 6371000;
      const dLat = (c.lat - row.lat) * Math.PI / 180;
      const dLng = (c.lng - row.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(row.lat*Math.PI/180)*Math.cos(c.lat*Math.PI/180)*Math.sin(dLng/2)**2;
      const distM = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
      if (distM < 50) {
        await db.execute(`UPDATE \`places\` SET geoStatus='ok', geoNote='OSM-confirmado' WHERE id=${c.id}`);
        console.log(`[Migrations] ✓ 019-B: ${c.name} já correto — marcado ok [OSM]`);
      } else {
        await db.execute(`UPDATE \`places\` SET lat=${c.lat}, lng=${c.lng}, geoStatus='ok', geoNote='Corrigido via OSM Overpass (${distM}m de erro)', updatedAt=NOW() WHERE id=${c.id}`);
        console.log(`[Migrations] ✅ 019-B: ${c.name} — corrigido ${distM}m [OSM]`);
      }
    }

    // 019-C: Correções via fórmula (offset sistemático médio Δlat=+0.0063, Δlng=+0.0085)
    // Aplicado a lugares na zona suspeita (lng < -47.057) não cobertos pelo OSM
    const DLAT = 0.0063;
    const DLNG = 0.0085;
    const formulaIds = [
      30, 19, 43, 34, 40, 6334, 13952, 8, 6432, 4215, 6424,
      6428, 30247, 6418, 27, 2616, 4214, 6438, 18, 5, 29, 44,
      25616, 9, 26613, 25618, 25, 32, 13948, 21, 30251,
    ];
    for (const placeId of formulaIds) {
      const [rows] = await db.execute(`SELECT id, name, lat, lng FROM \`places\` WHERE id = ${placeId} LIMIT 1`) as any[];
      const row = (rows as any[])[0];
      if (!row) continue;
      if (row.lng >= -47.057) {
        // Já está na zona correta — apenas marcar como ok
        await db.execute(`UPDATE \`places\` SET geoStatus='ok', geoNote='Coordenadas na zona válida de Holambra' WHERE id=${placeId} AND geoStatus='unverified'`);
        continue;
      }
      const newLat = +(parseFloat(row.lat) + DLAT).toFixed(5);
      const newLng = +(parseFloat(row.lng) + DLNG).toFixed(5);
      const R = 6371000;
      const dLat = (newLat - row.lat) * Math.PI / 180;
      const dLng = (newLng - row.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(row.lat*Math.PI/180)*Math.cos(newLat*Math.PI/180)*Math.sin(dLng/2)**2;
      const distM = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
      // Não sobrescrever se migration 020 (OSM-verificado) já corrigiu este lugar
      await db.execute(`UPDATE \`places\` SET lat=${newLat}, lng=${newLng}, geoStatus='suspect', geoNote='Correção por fórmula (offset +${DLAT}/+${DLNG}) — validação manual recomendada', updatedAt=NOW() WHERE id=${placeId} AND geoStatus != 'ok'`);
      console.log(`[Migrations] ✅ 019-C: id=${placeId} ${row.name} — fórmula aplicada (≈${distM}m) [suspect]`);
    }

    // 019-D: Marcar como 'ok' os já corrigidos via OSM na 018 e a zona correta
    const migration018Ids = [24, 2613, 36, 3824, 13946, 16, 31, 26];
    for (const id of migration018Ids) {
      await db.execute(`UPDATE \`places\` SET geoStatus='ok', geoNote='Corrigido via OSM Overpass — migration 018' WHERE id=${id} AND (geoStatus IS NULL OR geoStatus='unverified')`);
    }

    // 019-E: Marcar zona correta (sem alteração necessária)
    const correctZoneIds = [17, 23, 13950, 30249, 28, 30243, 3826, 30245];
    for (const id of correctZoneIds) {
      await db.execute(`UPDATE \`places\` SET geoStatus='ok', geoNote='Coordenadas na zona correta — validado por análise OSM' WHERE id=${id} AND (geoStatus IS NULL OR geoStatus='unverified')`);
    }

    // 019-F: Qualquer outro lugar ainda unverified → needs_review
    await db.execute(`UPDATE \`places\` SET geoStatus='needs_review', geoNote='Requer verificação manual de coordenadas' WHERE geoStatus='unverified' OR geoStatus IS NULL`);

    console.log("[Migrations] ✅ 019: geoStatus configurado para todos os lugares");
  }

  // ─── Migration 018: Correção de coordenadas geográficas — precisão real ───
  // Causa raiz: coordenadas do DB tinham offset sistemático de ~1.1km vs posição real (OSM verified).
  // Método: OSM Overpass confirmou posições reais. Idempotente via threshold de deslocamento.
  {
    const corrections = [
      // OSM CONFIRMADOS — coordenadas verificadas via OpenStreetMap Overpass API
      { id: 24,    name: "Casa Bela Restaurante",           lat: -22.63260, lng: -47.05240, source: "OSM" },
      { id: 2613,  name: "Martin Holandesa",                lat: -22.63220, lng: -47.05220, source: "OSM" },
      { id: 31,    name: "Holambra Garden Hotel",           lat: -22.63310, lng: -47.05340, source: "OSM" },
      { id: 26,    name: "Restaurante e Cervejaria Holambier", lat: -22.63250, lng: -47.05240, source: "OSM" },
      // MODELO LINEAR (Rua Dória Vasconcelos, base: #81 e #144 OSM-confirmados)
      { id: 36,    name: "De Immigrant Gastro Café",        lat: -22.63125, lng: -47.05173, source: "street-model" },
      { id: 3824,  name: "De Immigrant Restaurante Garden", lat: -22.63166, lng: -47.05193, source: "street-model" },
      // MODELO Av. das Tulipas (#44=sul=-22.6384, #123=norte=-22.6331, OSM-confirmados)
      { id: 13946, name: "Don Hamburgo",                    lat: -22.63840, lng: -47.04990, source: "tulipas-model" },
      { id: 16,    name: "Shellter Hotel",                  lat: -22.63753, lng: -47.05048, source: "tulipas-model" },
    ];

    for (const c of corrections) {
      const [rows] = await db.execute(
        `SELECT id, lat, lng FROM \`places\` WHERE id = ${c.id} LIMIT 1`
      ) as any[];
      const row = (rows as any[])[0];
      if (!row) { console.log(`[Migrations] ⚠️  018: id=${c.id} não encontrado`); continue; }

      // Haversine simplificado — detecta se o ponto ainda está errado (>500m do correto)
      const R = 6371000;
      const dLat = (c.lat - row.lat) * Math.PI / 180;
      const dLng = (c.lng - row.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(row.lat * Math.PI/180) * Math.cos(c.lat * Math.PI/180) * Math.sin(dLng/2)**2;
      const distM = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));

      if (distM < 50) {
        console.log(`[Migrations] ✓ 018: ${c.name} já está correto (deslocamento=${distM}m)`);
        continue;
      }
      await db.execute(
        `UPDATE \`places\` SET lat=${c.lat}, lng=${c.lng}, updatedAt=NOW() WHERE id=${c.id}`
      );
      console.log(`[Migrations] ✅ 018: ${c.name} — corrigido ${distM}m de erro [${c.source}]`);
    }
  }

  // ─── Migration 017: Preços padrão dos Passeios Premium (idempotente) ──────
  {
    const tourPricing: { id: number; clientPrice: number; driverPayout: number; partnerFee: number }[] = [
      { id: 1, clientPrice: 280, driverPayout: 180, partnerFee: 0 }, // Holambra Romântica
      { id: 2, clientPrice: 180, driverPayout: 120, partnerFee: 0 }, // Holambra de Manhã
      { id: 3, clientPrice: 220, driverPayout: 140, partnerFee: 0 }, // Holambra das Flores
      { id: 4, clientPrice: 200, driverPayout: 130, partnerFee: 0 }, // Holambra da Imigração
      { id: 5, clientPrice: 250, driverPayout: 160, partnerFee: 0 }, // Holambra Gourmet
      { id: 6, clientPrice: 220, driverPayout: 140, partnerFee: 0 }, // Holambra Familiar
      { id: 7, clientPrice: 180, driverPayout: 120, partnerFee: 0 }, // Holambra ao Entardecer
    ];
    for (const t of tourPricing) {
      const [chk] = await db.execute(
        `SELECT id, clientPrice FROM \`guided_tours\` WHERE id = ${t.id} LIMIT 1`
      ) as any[];
      const row = (chk as any[])[0];
      if (!row) {
        console.log(`[Migrations] ⚠️  017: guided_tour id=${t.id} não encontrado`);
        continue;
      }
      if (row.clientPrice !== null && row.clientPrice !== undefined) {
        console.log(`[Migrations] ✓ 017: tour id=${t.id} já tem preço (R$${row.clientPrice})`);
        continue;
      }
      await db.execute(
        `UPDATE \`guided_tours\` SET clientPrice=${t.clientPrice}, driverPayout=${t.driverPayout}, partnerFee=${t.partnerFee}, requiresTransport=0, recommendedWithDriver=1, updatedAt=NOW() WHERE id=${t.id}`
      );
      console.log(`[Migrations] ✅ 017: tour id=${t.id} — clientPrice=R$${t.clientPrice}, driverPayout=R$${t.driverPayout}`);
    }
  }

  console.log("[Migrations] All migrations applied.");
}
