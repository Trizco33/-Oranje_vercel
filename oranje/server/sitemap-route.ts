import { Router } from "express";
import { generateSitemap } from "./sitemap";

export const sitemapRouter = Router();

function getBaseUrl(req: import("express").Request): string {
  // Respect explicit override (set on Railway to "https://oranjeapp.com.br")
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  // Vercel forwards the original host via x-forwarded-host
  const fwdHost = req.get("x-forwarded-host");
  if (fwdHost) return `${req.protocol}://${fwdHost}`;
  return `${req.protocol}://${req.get("host")}`;
}

sitemapRouter.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const xml = await generateSitemap(baseUrl);
    res.type("application/xml").send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

sitemapRouter.get("/robots.txt", (req, res) => {
  const baseUrl = getBaseUrl(req);
  const robotsTxt = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /adm
Disallow: /api
Disallow: /app/login
Disallow: /app/perfil
Disallow: /app/mapa
Disallow: /app/configuracoes
Disallow: /app/explorar
Disallow: /app/eventos
Disallow: /app/roteiros
Disallow: /app/favoritos
Disallow: /app/notificacoes

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.type("text/plain").send(robotsTxt);
});
