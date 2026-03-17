import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { articles, places, events, routes } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";

const pool = mysql.createPool(ENV.databaseUrl);
const db = drizzle(pool);

export async function generateSitemap(baseUrl: string): Promise<string> {
  const publishedArticles = await db
    .select()
    .from(articles)
    .where(eq(articles.published, true));

  const allPlaces = await db.select().from(places);
  const allEvents = await db.select().from(events);
  const allRoutes = await db.select().from(routes);

  const urls: Array<{
    loc: string;
    lastmod: string;
    priority: number;
    changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  }> = [
    // Static pages
    {
      loc: baseUrl,
      lastmod: new Date().toISOString().split("T")[0],
      priority: 1.0,
      changefreq: "weekly",
    },
    {
      loc: `${baseUrl}/guia`,
      lastmod: new Date().toISOString().split("T")[0],
      priority: 0.8,
      changefreq: "weekly",
    },
    {
      loc: `${baseUrl}/app/explorar`,
      lastmod: new Date().toISOString().split("T")[0],
      priority: 0.9,
      changefreq: "daily",
    },
    {
      loc: `${baseUrl}/app/eventos`,
      lastmod: new Date().toISOString().split("T")[0],
      priority: 0.8,
      changefreq: "daily",
    },
    {
      loc: `${baseUrl}/app/roteiros`,
      lastmod: new Date().toISOString().split("T")[0],
      priority: 0.8,
      changefreq: "weekly",
    },

    // Articles
    ...publishedArticles.map((article) => ({
      loc: `${baseUrl}/guia/${article.slug}`,
      lastmod: (article.updatedAt || article.createdAt).toISOString().split("T")[0],
      priority: 0.7,
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
