import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { articles, places, events, routes, sitePages } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";

let db: MySql2Database | null = null;
if (ENV.databaseUrl) {
  try { db = drizzle(mysql.createPool(ENV.databaseUrl)); } catch (e) { console.warn("[Sitemap] DB init failed:", e); }
}

export async function generateSitemap(baseUrl: string): Promise<string> {
  const publishedArticles = db ? await db
    .select()
    .from(articles)
    .where(eq(articles.published, true)) : [];
  const publishedSitePages = db ? await db
    .select()
    .from(sitePages)
    .where(eq(sitePages.published, true)) : [];

  const allPlaces = db ? await db.select().from(places) : [];
  const allEvents = db ? await db.select().from(events) : [];
  const allRoutes = db ? await db.select().from(routes) : [];
  const staticSitePages = [
    { path: "/blog", priority: 0.8, changefreq: "weekly" as const },
    { path: "/roteiros", priority: 0.7, changefreq: "monthly" as const },
    { path: "/mapa", priority: 0.7, changefreq: "monthly" as const },
    { path: "/parceiros", priority: 0.7, changefreq: "monthly" as const },
    { path: "/seja-um-parceiro", priority: 0.6, changefreq: "monthly" as const },
    { path: "/sobre", priority: 0.6, changefreq: "monthly" as const },
    { path: "/contato", priority: 0.6, changefreq: "monthly" as const },
    { path: "/privacidade", priority: 0.4, changefreq: "yearly" as const },
    { path: "/termos", priority: 0.4, changefreq: "yearly" as const },
  ];
  const today = new Date().toISOString().split("T")[0];

  const urls: Array<{
    loc: string;
    lastmod: string;
    priority: number;
    changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  }> = [
    // Static pages
    {
      loc: baseUrl,
      lastmod: today,
      priority: 1.0,
      changefreq: "weekly",
    },
    {
      loc: `${baseUrl}/guia`,
      lastmod: today,
      priority: 0.8,
      changefreq: "weekly",
    },
    {
      loc: `${baseUrl}/app/explorar`,
      lastmod: today,
      priority: 0.9,
      changefreq: "daily",
    },
    {
      loc: `${baseUrl}/app/eventos`,
      lastmod: today,
      priority: 0.8,
      changefreq: "daily",
    },
    {
      loc: `${baseUrl}/app/roteiros`,
      lastmod: today,
      priority: 0.8,
      changefreq: "weekly",
    },
    ...staticSitePages.map((page) => ({
      loc: `${baseUrl}${page.path}`,
      lastmod: today,
      priority: page.priority,
      changefreq: page.changefreq,
    })),

    // Articles
    ...publishedArticles.map((article) => ({
      loc: `${baseUrl}/blog/${article.slug}`,
      lastmod: (article.updatedAt || article.createdAt).toISOString().split("T")[0],
      priority: 0.7,
      changefreq: "monthly" as const,
    })),

    // CMS pages
    ...publishedSitePages.map((page) => ({
      loc: `${baseUrl}/pagina/${page.slug}`,
      lastmod: (page.updatedAt || page.createdAt).toISOString().split("T")[0],
      priority: 0.6,
      changefreq: "monthly" as const,
    })),

    // Places
    ...allPlaces.map((place) => ({
      loc: `${baseUrl}/app/lugar/${place.id}`,
      lastmod: (place.updatedAt || place.createdAt).toISOString().split("T")[0],
      priority: 0.7,
      changefreq: "weekly" as const,
    })),

    // Events
    ...allEvents.map((event) => ({
      loc: `${baseUrl}/app/evento/${event.id}`,
      lastmod: (event.updatedAt || event.createdAt).toISOString().split("T")[0],
      priority: 0.6,
      changefreq: "weekly" as const,
    })),

    // Routes
    ...allRoutes.map((route) => ({
      loc: `${baseUrl}/app/roteiro/${route.id}`,
      lastmod: (route.updatedAt || route.createdAt).toISOString().split("T")[0],
      priority: 0.6,
      changefreq: "monthly" as const,
    })),
  ];

  // Generate XML
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
