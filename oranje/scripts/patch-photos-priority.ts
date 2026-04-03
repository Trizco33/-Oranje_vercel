/**
 * patch-photos-priority.ts
 *
 * Atualiza coverImage dos 5 lugares com maior prioridade de foto real.
 *
 * Fontes:
 *  - Moinho Povos Unidos  → arquivo local /brand/moinho-povos-unidos.jpg
 *  - Martin Holandesa     → TripAdvisor (já em placeImages.ts)
 *  - Lago do Holandês     → Blogger/Wikimedia (já em placeImages.ts)
 *  - Café Moinho          → Wikimedia Commons (café dentro do complexo do Moinho)
 *  - Restaurante De Klok  → sem foto pública encontrada → mantém Unsplash, marcado
 *
 * Run: npx tsx scripts/patch-photos-priority.ts
 */

import mysql2 from "mysql2/promise";

const UPDATES = [
  {
    id: 2616,
    name: "Moinho Povos Unidos",
    coverImage: "/brand/moinho-povos-unidos.jpg",
    images: JSON.stringify([
      "/brand/moinho-povos-unidos.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Moinho_holambra.jpg/800px-Moinho_holambra.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Holambra_windmill.jpg/600px-Holambra_windmill.jpg",
    ]),
    source: "local + Wikimedia Commons (CC BY-SA)",
  },
  {
    id: 2613,
    name: "Martin Holandesa",
    coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/79/39/00/confeitaria-martin-holandesa.jpg?w=800&h=500&s=1",
    images: JSON.stringify([
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/79/39/00/confeitaria-martin-holandesa.jpg?w=800&h=500&s=1",
      "https://martinholandesa.com.br/content/foto4.jpeg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/79/39/3a/confeitaria-martin-holandesa.jpg?w=800&h=500&s=1",
    ]),
    source: "TripAdvisor + martinholandesa.com.br",
  },
  {
    id: 2614,
    name: "Lago do Holandês",
    coverImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhKPUIxaywY_656CccCugMGLowWe04FtqESLSx_G4bvYArgJJiWcPmQXIfpqIJJ5RLzfXUEBVe-yI3iTqEJ5htMsM3YyCYzpTwYrr05vacs2diXeLwlrXCAh8_KgJalXSY_80qY-1T5pYdg/w1200-h630-p-k-no-nu/Lago+do+Holandes.jpg",
    images: JSON.stringify([
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhKPUIxaywY_656CccCugMGLowWe04FtqESLSx_G4bvYArgJJiWcPmQXIfpqIJJ5RLzfXUEBVe-yI3iTqEJ5htMsM3YyCYzpTwYrr05vacs2diXeLwlrXCAh8_KgJalXSY_80qY-1T5pYdg/w1200-h630-p-k-no-nu/Lago+do+Holandes.jpg",
      "https://i.ytimg.com/vi/djyEhV-X8IE/sddefault.jpg",
    ]),
    source: "Blogger editorial / YouTube thumb",
  },
  {
    id: 2,
    name: "Café Moinho",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Moinho_holambra.jpg/800px-Moinho_holambra.jpg",
    images: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Moinho_holambra.jpg/800px-Moinho_holambra.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Holambra_windmill.jpg/600px-Holambra_windmill.jpg",
    ]),
    source: "Wikimedia Commons (CC BY-SA) — café dentro do complexo do Moinho",
  },
  // De Klok (id=1): sem foto pública encontrada → mantém Unsplash atual
  // Necessário: foto enviada diretamente pelo estabelecimento
];

async function run() {
  console.log("📸 Atualizando fotos prioritárias...\n");
  const conn = await mysql2.createConnection(process.env.DATABASE_URL!);

  for (const u of UPDATES) {
    await conn.execute(
      "UPDATE places SET coverImage = ?, images = ? WHERE id = ?",
      [u.coverImage, u.images, u.id]
    );
    const preview = u.coverImage.startsWith("/") ? u.coverImage : u.coverImage.substring(0, 55) + "...";
    console.log(`  ✅ [${u.id}] ${u.name.padEnd(35)} → ${preview}`);
    console.log(`     Fonte: ${u.source}`);
  }

  console.log(`\n  ⚪ [1] Restaurante De Klok              → sem foto pública encontrada (Unsplash mantido)`);
  console.log(`     Ação necessária: foto enviada pelo estabelecimento`);

  await conn.end();
  console.log("\n✅ Patch de fotos concluído.");
}

run().catch(err => { console.error("❌", err); process.exit(1); });
