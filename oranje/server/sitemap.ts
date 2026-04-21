import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { articles, places, events, routes, guidedTours } from "../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { ENV } from "./_core/env";

let db: ReturnType<typeof drizzle> | null = null;
if (ENV.databaseUrl) {
  try { db = drizzle(mysql.createPool(ENV.databaseUrl) as any); } catch (e) { console.warn("[Sitemap] DB init failed:", e); }
}

export async function generateSitemap(baseUrl: string): Promise<string> {
  // Only published articles
  const publishedArticles = db ? await db
    .select()
    .from(articles)
    .where(eq(articles.published, true)) : [];

  // Only active places with complete data (dataPending=false)
  const activePlaces = db ? await db
    .select()
    .from(places)
    .where(and(eq(places.status, "active"), eq(places.dataPending, false))) : [];

  // Only active events (not cancelled or past)
  const activeEvents = db ? await db
    .select()
    .from(events)
    .where(eq(events.status, "active")) : [];

  // Only public routes
  const activeRoutes = db ? await db
    .select()
    .from(routes)
    .where(eq(routes.isPublic, true)) : [];

  // Active guided tours (receptivo)
  const activeTours = db ? await db
    .select({ id: guidedTours.id, slug: guidedTours.slug, updatedAt: guidedTours.updatedAt, createdAt: guidedTours.createdAt })
    .from(guidedTours)
    .where(eq(guidedTours.status, "active")) : [];

  const today = new Date().toISOString().split("T")[0];

  const urls: Array<{
    loc: string;
    lastmod: string;
    priority: number;
    changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  }> = [
    // ─── Páginas estáticas principais ────────────────────────────────
    { loc: baseUrl, lastmod: today, priority: 1.0, changefreq: "weekly" },
    { loc: `${baseUrl}/guia`, lastmod: today, priority: 0.8, changefreq: "weekly" },
    { loc: `${baseUrl}/blog`, lastmod: today, priority: 0.8, changefreq: "daily" },

    // ─── Páginas editoriais principais (SEO altíssima prioridade) ────
    { loc: `${baseUrl}/o-que-fazer-em-holambra`, lastmod: today, priority: 0.95, changefreq: "monthly" },
    { loc: `${baseUrl}/roteiro-1-dia-em-holambra`, lastmod: today, priority: 0.95, changefreq: "monthly" },
    { loc: `${baseUrl}/holambra-bate-e-volta`, lastmod: today, priority: 0.95, changefreq: "monthly" },

    // ─── Páginas editoriais de categoria (SEO prioritário) ───────────
    { loc: `${baseUrl}/melhores-restaurantes-de-holambra`, lastmod: today, priority: 0.9, changefreq: "monthly" },
    { loc: `${baseUrl}/melhores-cafes-de-holambra`, lastmod: today, priority: 0.9, changefreq: "monthly" },
    { loc: `${baseUrl}/bares-e-drinks-em-holambra`, lastmod: today, priority: 0.9, changefreq: "monthly" },
    { loc: `${baseUrl}/onde-tirar-fotos-em-holambra`, lastmod: today, priority: 0.9, changefreq: "monthly" },
    { loc: `${baseUrl}/eventos-em-holambra`, lastmod: today, priority: 0.8, changefreq: "weekly" },

    // ─── Páginas institucionais ───────────────────────────────────────
    { loc: `${baseUrl}/sobre`, lastmod: today, priority: 0.5, changefreq: "monthly" },
    { loc: `${baseUrl}/contato`, lastmod: today, priority: 0.4, changefreq: "monthly" },
    { loc: `${baseUrl}/parceiros`, lastmod: today, priority: 0.4, changefreq: "monthly" },
    { loc: `${baseUrl}/parcerias`, lastmod: today, priority: 0.7, changefreq: "monthly" },

    // ─── Rotas INTENCIONALMENTE excluídas do sitemap (não remover sem perguntar) ──
    // /seja-um-parceiro — redireciona para /parcerias (que é a página canônica de parceiros).
    // /roteiros         — página placeholder com conteúdo estático falso (4 cards hardcoded sem dados reais).
    //                     Não indexar até ter conteúdo real. NÃO é o mesmo que /app/receptivo.
    // /privacidade      — página legal, sem valor SEO, não indexar.
    // /termos           — página legal, sem valor SEO, não indexar.
    // /mapa             — página funcional do app, não é conteúdo editorial.

    // ─── Artigos publicados ───────────────────────────────────────────
    ...publishedArticles.map((article) => ({
      loc: `${baseUrl}/blog/${article.slug}`,
      lastmod: (article.updatedAt || article.createdAt).toISOString().split("T")[0],
      priority: 0.8 as const,
      changefreq: "monthly" as const,
    })),

    // ─── Lugares (apenas active + dataPending=false) ──────────────────
    ...activePlaces.map((place) => ({
      loc: `${baseUrl}/app/lugar/${place.id}`,
      lastmod: (place.updatedAt || place.createdAt).toISOString().split("T")[0],
      priority: 0.7 as const,
      changefreq: "weekly" as const,
    })),

    // ─── Eventos (apenas active) ──────────────────────────────────────
    ...activeEvents.map((event) => ({
      loc: `${baseUrl}/app/evento/${event.id}`,
      lastmod: (event.updatedAt || event.createdAt).toISOString().split("T")[0],
      priority: 0.6 as const,
      changefreq: "weekly" as const,
    })),

    // ─── Roteiros (apenas active) ─────────────────────────────────────
    ...activeRoutes.map((route) => ({
      loc: `${baseUrl}/app/roteiro/${route.id}`,
      lastmod: (route.updatedAt || route.createdAt).toISOString().split("T")[0],
      priority: 0.6 as const,
      changefreq: "monthly" as const,
    })),

    // ─── Passeios Receptivo (guided tours ativos) ─────────────────────
    ...activeTours.map((tour) => ({
      loc: `${baseUrl}/app/receptivo/${tour.slug}`,
      lastmod: (tour.updatedAt || tour.createdAt).toISOString().split("T")[0],
      priority: 0.8 as const,
      changefreq: "monthly" as const,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return xml;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
