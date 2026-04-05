/**
 * audit-places.ts — Auditoria de integridade da base de lugares do Oranje
 */
import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { writeFileSync } from "fs";

const db = await getDb();
if (!db) { console.error("no db"); process.exit(1); }

const result = await db.execute(sql`
  SELECT
    p.id, p.name, p.slug, c.name as category,
    p.dataPending, p.isFeatured, p.isRecommended, p.isPartner,
    p.lat, p.lng, p.instagram, p.website, p.phone, p.whatsapp, p.address,
    p.status,
    CHAR_LENGTH(COALESCE(p.shortDesc,'')) as shortDescLen,
    CHAR_LENGTH(COALESCE(p.longDesc,'')) as longDescLen,
    CHAR_LENGTH(COALESCE(p.coverImage,'')) as coverImageLen,
    CHAR_LENGTH(COALESCE(CAST(p.images AS CHAR),'[]')) as imagesLen,
    p.coverImage,
    CAST(p.images AS CHAR) as imagesRaw
  FROM places p
  LEFT JOIN categories c ON c.id = p.categoryId
  WHERE p.city = 'Holambra'
  ORDER BY p.id
`);

const rows = (result as any)[0] as any[];
writeFileSync("/tmp/oranje_audit.json", JSON.stringify(rows));
console.log("SAVED", rows.length);
process.exit(0);
