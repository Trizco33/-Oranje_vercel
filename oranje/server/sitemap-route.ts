import { Router } from "express";
import { generateSitemap } from "./sitemap";

export const sitemapRouter = Router();

sitemapRouter.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const xml = await generateSitemap(baseUrl);
    res.type("application/xml").send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

sitemapRouter.get("/robots.txt", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.type("text/plain").send(robotsTxt);
});
