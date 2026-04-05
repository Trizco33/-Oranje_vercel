/**
 * seed-site-routes.ts
 * Seeds initial data for site_route_features table.
 * Run: cd oranje && npx tsx server/seed-site-routes.ts
 */
import { getDb } from "./db.js";
import { routes, siteRouteFeatures } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

async function main() {
  const db = await getDb();
  if (!db) { console.error("No DB connection"); process.exit(1); }

  // Get public routes to seed from
  const publicRoutes = await db.select().from(routes).where(eq(routes.isPublic, true));
  if (publicRoutes.length === 0) {
    console.log("No public routes found — create and publish routes first.");
    return;
  }

  const existing = await db.select().from(siteRouteFeatures);
  if (existing.length > 0) {
    console.log(`site_route_features already has ${existing.length} row(s) — skipping seed.`);
    console.log("Existing:", existing.map((f) => `#${f.id} routeId=${f.routeId} featured=${f.isFeatured}`).join(", "));
    return;
  }

  console.log(`Found ${publicRoutes.length} public route(s). Seeding site_route_features…`);

  // Seed first route as featured, rest as secondary (up to 3 total)
  const toSeed = publicRoutes.slice(0, 3);
  for (let i = 0; i < toSeed.length; i++) {
    const r = toSeed[i];
    const isFeatured = i === 0;
    await db.insert(siteRouteFeatures).values({
      routeId: r.id,
      label: isFeatured ? r.title : r.title,
      subtitle: isFeatured
        ? "Roteiro verificado pela equipe Oranje — paradas reais, horários atualizados"
        : r.description?.slice(0, 100) ?? null,
      ctaText: isFeatured ? "Fazer este passeio" : "Explorar passeio",
      isFeatured,
      isActive: true,
      sortOrder: i,
    });
    console.log(`  ✅ Seeded: ${r.title} (featured=${isFeatured}, sortOrder=${i})`);
  }

  console.log("🎉 site_route_features seed concluído!");
}

main().catch(console.error).finally(() => process.exit(0));
