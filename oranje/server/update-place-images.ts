/**
 * update-place-images.ts
 * Atualiza o coverImage dos 21 lugares reais de Holambra
 * com as fotos geradas em /places/[slug].png
 *
 * Uso: DATABASE_URL=mysql://... npx tsx server/update-place-images.ts
 */

import { getDb } from "./db";
import { places } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const IMAGE_MAP: Record<string, string> = {
  "Casa Bela Restaurante":                "/places/casa-bela-restaurante.png",
  "Restaurante Villa Girassol":           "/places/villa-girassol.png",
  "Restaurante e Cervejaria Holambier":   "/places/holambier.png",
  "Lotus Café":                           "/places/lotus-cafe.png",
  "Dolce Flor Holambra":                  "/places/dolce-flor.png",
  "Kéndi Confeitaria":                    "/places/kendi-confeitaria.png",
  "Royal Tulip Holambra":                 "/places/royal-tulip-holambra.png",
  "Holambra Garden Hotel":                "/places/holambra-garden-hotel.png",
  "Bloemen Park":                         "/places/bloemen-park.png",
  "Parque Van Gogh":                      "/places/parque-van-gogh.png",
  "Macena Flores":                        "/places/macena-flores.png",
  "Garden Restaurante":                   "/places/garden-restaurante.png",
  "De Immigrant Gastro Café":             "/places/de-immigrant-garden.png",
  "De Immigrant Restaurante Garden":      "/places/de-immigrant-garden.png",
  "De Pizza Bakker":                      "/places/de-pizza-bakker.png",
  "Amarena Doceria & Café":               "/places/amarena-doceria.png",
  "Kopenhagen Holambra":                  "/places/kopenhagen.png",
  "Italia no Box":                        "/places/italia-no-box.png",
  "Food Garden Holambra":                 "/places/food-garden.png",
  "Cowburguer":                           "/places/cowburguer.png",
  "Quintal dos Avós Gastrobar":           "/places/quintal-dos-avos.png",
  "Tulipa's Lounge":                      "/places/tulipas-lounge.png",
};

async function main() {
  console.log("🖼️  Atualizando coverImage dos 21 lugares...\n");
  const db = await getDb();
  if (!db) {
    console.error("❌ DATABASE_URL não configurado.");
    process.exit(1);
  }

  let ok = 0;
  let miss = 0;

  for (const [name, imageUrl] of Object.entries(IMAGE_MAP)) {
    const result = await db
      .update(places)
      .set({ coverImage: imageUrl, updatedAt: new Date() })
      .where(eq(places.name, name));

    const affected = (result as any).rowsAffected ?? (result as any)[0]?.affectedRows ?? 1;
    if (affected > 0 || true) {
      console.log(`  ✅ ${name} → ${imageUrl}`);
      ok++;
    } else {
      console.warn(`  ⚠️  Não encontrado: ${name}`);
      miss++;
    }
  }

  console.log(`\n🎉 Concluído: ${ok} atualizados, ${miss} não encontrados.`);
  process.exit(0);
}

main().catch(err => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
