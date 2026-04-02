// Vercel serverless function (ESM) — saves hero media fields directly to MySQL DB
// Handles: hero image, app_hero image, hero video URL, hero media type
// Route: /api/cms/save-hero

import mysql from "mysql2/promise";

function parseCmsAuth(req) {
  try {
    const tokenHeader = req.headers["x-cms-token"];
    if (tokenHeader) {
      const session = JSON.parse(String(tokenHeader));
      if (session?.success && session?.user?.role === "admin" && session?.user?.id) {
        return { userId: Number(session.user.id) };
      }
    }
  } catch {}
  try {
    const cookieHeader = req.headers["cookie"] || "";
    const match = cookieHeader.match(/cms_session=([^;]+)/);
    if (match) {
      const session = JSON.parse(decodeURIComponent(match[1]));
      if (session?.success && session?.user?.role === "admin" && session?.user?.id) {
        return { userId: Number(session.user.id) };
      }
    }
  } catch {}
  return null;
}

// Map field name → { dbKey, section }
const FIELD_MAP = {
  hero:            { dbKey: "hero_imageUrl",   section: "hero" },
  app_hero:        { dbKey: "app_hero_imageUrl", section: "app_hero" },
  hero_video:      { dbKey: "hero_videoUrl",   section: "hero" },
  hero_media_type: { dbKey: "hero_mediaType",  section: "hero" },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-cms-token");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const admin = parseCmsAuth(req);
  if (!admin) return res.status(403).json({ error: "Forbidden — faça login no CMS primeiro" });

  const body = req.body || {};
  const field = body.field;
  // Accept `value` (generic) or `imageUrl` (backward compat)
  const value = body.value !== undefined ? body.value : body.imageUrl;

  if (!field || !(field in FIELD_MAP)) {
    return res.status(400).json({ error: `Campo inválido: ${field}. Use: ${Object.keys(FIELD_MAP).join(", ")}` });
  }
  if (typeof value !== "string") {
    return res.status(400).json({ error: "value (ou imageUrl) obrigatório e deve ser string" });
  }

  const { dbKey, section } = FIELD_MAP[field];

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(500).json({ error: "DATABASE_URL não configurado no Vercel — adicione nas Environment Variables" });
  }

  let conn;
  try {
    conn = await mysql.createConnection(dbUrl);
    await conn.execute(
      "INSERT INTO site_content (`key`, `value`, section, updatedBy) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updatedBy = VALUES(updatedBy)",
      [dbKey, value, section, admin.userId]
    );
    console.log(`[Vercel/save-hero] ${dbKey} saved (${value.length} chars) by userId=${admin.userId}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[Vercel/save-hero] DB error:", err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
}
