import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite, setupSPAFallback } from "./vite";
import { seedDatabase } from "../seed";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // CORS support for split frontend/backend deployments
  const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").filter(Boolean);
  if (allowedOrigins.length > 0) {
    app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (origin && allowedOrigins.some(o => origin.startsWith(o.trim()))) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
      }
      if (req.method === "OPTIONS") return res.sendStatus(204);
      next();
    });
  }
  
  // Seed database with default content on startup
  await seedDatabase();
  
  // ============================================================================
  // CRITICAL: Register static file serving FIRST
  // This must be done BEFORE any routes (app.get, app.post, etc.)
  // ============================================================================
  console.log(`[Server] NODE_ENV: ${process.env.NODE_ENV}`);
  if (process.env.NODE_ENV === "development") {
    console.log("[Server] Using Vite dev server");
    await setupVite(app, server);
  } else {
    console.log("[Server] Using static files from dist/public");
    serveStatic(app);
  }
  
  // ============================================================================
  // Register routes AFTER static file middleware
  // ============================================================================
  
  // PWA Manifest para /app
  app.get("/app/manifest.webmanifest", (_req, res) => {
    res.json({
      name: "Oranje",
      short_name: "Oranje",
      start_url: "/app?source=pwa",
      scope: "/app/",
      display: "standalone",
      background_color: "#0F1B14",
      theme_color: "#F28C28",
      icons: [
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663387178677/8rzdsSWs85gXVtjhEeBpLG/icon-192-SBArfE9rAW64F3Y8g9uv32.png", sizes: "192x192", type: "image/png" },
        { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663387178677/8rzdsSWs85gXVtjhEeBpLG/icon-512-DMSGR2sUBGaSabUY4HAB4i.png", sizes: "512x512", type: "image/png" }
      ]
    });
  });
  
  // React app will handle /app route via React Router
  
  // Service Worker para /app
  app.get("/app/sw.js", (_req, res) => {
    const swCode = `
const CACHE_NAME = 'oranje-v1';
const urlsToCache = [
  '/app',
  '/#/app',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        console.log('Some resources could not be cached');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/app');
      });
    })
  );
});
    `;
    res.type('application/javascript').send(swCode);
  });
  
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Complete setup endpoint - creates categories and populates all data
  app.get("/api/complete-setup", async (req, res) => {
    const { key } = req.query;
    
    if (key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { getDb } = await import("../db");
      const { categories, places } = await import("../../drizzle/schema");
      const { sql } = await import("drizzle-orm");
      
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection failed' });
      }

      const results = {
        categories: { created: [] as string[], existing: [] as string[], all: [] as any[] },
        migration: { status: 'pending', message: '' },
        seed: { status: 'pending', updated: 0, details: [] as any[] }
      };

      // Step 1: Ensure all categories exist
      const allCategories = await db.select().from(categories);
      const requiredCategories = [
        { name: 'Restaurantes', slug: 'restaurantes', icon: '🍽️' },
        { name: 'Pizzarias', slug: 'pizzarias', icon: '🍕' },
        { name: 'Bares', slug: 'bares', icon: '🍺' },
        { name: 'Cafés', slug: 'cafes', icon: '☕' },
        { name: 'Hotéis', slug: 'hoteis', icon: '🏨' },
        { name: 'Parques', slug: 'parques', icon: '🌳' },
        { name: 'Pontos turísticos', slug: 'pontos-turisticos', icon: '📍' }
      ];

      for (const cat of requiredCategories) {
        const found = allCategories.find(c => c.slug === cat.slug);
        if (!found) {
          await db.insert(categories).values(cat);
          results.categories.created.push(cat.name);
        } else {
          results.categories.existing.push(cat.name);
        }
      }

      // Get updated categories list
      results.categories.all = await db.select().from(categories);

      // Step 2: Add images column if needed
      try {
        await db.execute(sql`
          ALTER TABLE places ADD COLUMN images JSON DEFAULT NULL AFTER coverImage
        `);
        results.migration = { status: 'success', message: 'images column added' };
      } catch (error: any) {
        const errorMsg = error.message || error.toString();
        if (errorMsg.includes('Duplicate column') || errorMsg.includes('duplicate column') || errorMsg.includes('already exists')) {
          results.migration = { status: 'skipped', message: 'images column already exists' };
        } else {
          // Column likely already exists, continue anyway
          results.migration = { status: 'skipped', message: 'migration skipped (column may already exist)' };
        }
      }

      // Step 3: Seed ALL image data (35+ places)
      const imageUpdates = [
        // RESTAURANTES
        { name: 'Martin Holandesa', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/79/39/00/confeitaria-martin-holandesa.jpg?w=800&h=500&s=1', images: ['https://i.ytimg.com/vi/7B2RW7GS258/maxresdefault.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/79/39/00/confeitaria-martin-holandesa.jpg?w=800&h=500&s=1', 'https://media-cdn.tripadvisor.com/media/photo-s/06/79/39/00/confeitaria-martin-holandesa.jpg'] },
        { name: 'Casa Bela', coverImage: 'https://casabelarestaurante.com.br/wp-content/uploads/2025/02/BRU_9396-scaled-4.jpg', images: ['https://s3-media0.fl.yelpcdn.com/bphoto/7b3sGluJl9ppMeiGuzq_mg/348s.jpg', 'https://casabelarestaurante.com.br/wp-content/uploads/2025/02/BRU_9396-scaled-4.jpg', 'https://s3-media0.fl.yelpcdn.com/bphoto/ZTHVHfD9oxK6iCRTOEW2Zg/348s.jpg'] },
        { name: 'Old Dutch', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/e6/d0/72/fachada.jpg?w=900&h=500&s=1', images: ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEib2-s6ugtUYLuSAtjEDJFAn2qAVjJ5zyiyrXON1XsJ_IZXvnydIJE_ay8x3IDV-m1bwqUQf0RwR7edFKLQmystrflwfYdYBZh9bJOiZBisYzGVFJVbz3LNlowS00KfOPHWB_Re7GkDetTv/s1600/1300-77_dutch+gables.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/e6/d0/72/fachada.jpg?w=900&h=500&s=1'] },
        { name: 'Fratelli', coverImage: 'https://fratelliwinebar.com.br/wp-content/uploads/2025/12/fratelli-3-scaled-1.webp', images: ['https://s3-media0.fl.yelpcdn.com/bphoto/fbMGnveFeT-eoLxB8J_g8A/258s.jpg', 'https://fratelliwinebar.com.br/wp-content/uploads/2025/12/fratelli-3-scaled-1.webp'] },
        { name: 'Lago do Holand', coverImage: 'https://i.ytimg.com/vi/djyEhV-X8IE/sddefault.jpg', images: ['https://i.ytimg.com/vi/djyEhV-X8IE/hq720.jpg', 'https://i.ytimg.com/vi/djyEhV-X8IE/sddefault.jpg'] },
        { name: 'Tratterie', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/24/36/3c/6a/festival-de-inverno-2022.jpg?w=900&h=500&s=1', images: ['https://i.ytimg.com/vi/OMryNlEm48E/sddefault.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/24/36/3c/6a/festival-de-inverno-2022.jpg?w=900&h=500&s=1'] },
        { name: 'Zoet en Zout', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/04/10/0f/97/getlstd-property-photo.jpg?w=500&h=-1&s=1', images: ['https://understandinghospitality.com/wp-content/uploads/2024/05/treditainterior14-808x1024.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/04/10/0f/97/getlstd-property-photo.jpg?w=500&h=-1&s=1'] },
        { name: 'Hana', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/aa/72/b9/sabor-delicadeza-e-amor.jpg?w=900&h=500&s=1', images: ['https://i.ytimg.com/vi/i_GitffIVKs/sddefault.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/aa/72/b9/sabor-delicadeza-e-amor.jpg?w=900&h=500&s=1'] },
        { name: 'Holambier', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/be/f6/a2/entardecer-de-holambra.jpg?w=900&h=500&s=1', images: ['https://upload.wikimedia.org/wikipedia/commons/1/18/Montagem_Holambra.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/be/f6/a2/entardecer-de-holambra.jpg?w=900&h=500&s=1'] },
        // PIZZARIAS
        { name: 'Serrana', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/d8/7f/a1/caption.jpg?w=1100&h=1100&s=1', images: ['https://s3-media0.fl.yelpcdn.com/bphoto/wPk9rux0-qv5n7dKVQdySw/348s.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/d8/7f/a1/caption.jpg?w=1100&h=1100&s=1'] },
        { name: 'Dr Pizza', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/9c/28/4f/dr-pizza.jpg?w=1200&h=1200&s=1', images: ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgHD6n2AS268vuftA8-m8oFnbGTR-5wGp1LE6rd-NSqzXFCvQafwRFNWUpz9riLvcSQ-LLaLg9fN1rZMln_WNUYKNdw1I2KtYG9sH3BTLe8SFHuEdY3wCqoyJgCOYURpamYu0ryeatMNU-QHnqOH7K39nx8jrRwKoT0o20rNguhbKyZ-CB306lIIj3v_c0j/s1652/Screenshot%202025-12-03%20at%202.02.26%E2%80%AFPM.png', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/9c/28/4f/dr-pizza.jpg?w=1200&h=1200&s=1'] },
        // BARES
        { name: 'Seo Carneiro', coverImage: 'https://seocarneiro.com.br/wp-content/uploads/2023/11/20231102_110640-scaled.jpg', images: ['https://dynamic-media-cdn.tripadvisor.com/media/photo-o/26/cd/7f/4f/entrada-da-nossa-humilde.jpg?w=900&h=500&s=1', 'https://seocarneiro.com.br/wp-content/uploads/2023/11/20231102_110640-scaled.jpg'] },
        { name: 'Deck 237', coverImage: 'https://static2.menufyy.com/deck-237-restaurante-bar-ltda-me-albums-4.jpg', images: ['https://s3-media0.fl.yelpcdn.com/bphoto/GAC2MKjlOaGSLotXUQN0fg/348s.jpg', 'https://static2.menufyy.com/deck-237-restaurante-bar-ltda-me-albums-4.jpg'] },
        { name: 'Quintal Yah', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/8f/a5/1f/entrada.jpg?w=900&h=500&s=1', images: ['https://bloximages.chicago2.vip.townnews.com/fltimes.com/content/tncms/assets/v3/editorial/f/af/faf234fd-ce80-59a9-b326-f2b0d85e5e78/62e16a9edf9ae.image.jpg?crop=1330%2C698%2C0%2C94&resize=1200%2C630&order=crop%2Cresize', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/8f/a5/1f/entrada.jpg?w=900&h=500&s=1'] },
        // CAFÉS
        { name: 'Kendi', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/ff/b2/0c/kendi-cafeteria-e-confeitaria.jpg?w=1200&h=1200&s=1', images: ['https://placehold.co/1200x600/e2e8f0/1e293b?text=Kendi+Cafeteria', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/ff/b2/0c/kendi-cafeteria-e-confeitaria.jpg?w=1200&h=1200&s=1'] },
        { name: 'Lotus', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/26/b0/2b/8e/e-o-cafe-ta-sempre-fresquinho.jpg?w=500&h=-1&s=1', images: ['https://images.pexels.com/photos/34206672/pexels-photo-34206672/free-photo-of-cozy-sunset-cafe-interior-with-warm-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/26/b0/2b/8e/e-o-cafe-ta-sempre-fresquinho.jpg?w=500&h=-1&s=1'] },
        // HOTÉIS
        { name: 'Garden Hotel', coverImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/369911865.jpg?k=93ff4114b604d1145d6347d6ddec8e9e8ee1e7f48e13ff097e5ebbd7f5c99ccf&o=', images: ['https://cf.bstatic.com/xdata/images/hotel/max1024x768/369911865.jpg?k=93ff4114b604d1145d6347d6ddec8e9e8ee1e7f48e13ff097e5ebbd7f5c99ccf&o=', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/c6/fd/05/holambra-garden-hotel.jpg?w=900&h=-1&s=1', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/270706316.jpg?k=9df76ab387a7b93b18ab0f482cd4f4e83fa5d7745fdfb74da2f7e0af1e36efd7&o='] },
        { name: 'Villa de Holanda', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/1d/fd/d2/hotel-villa-de-holanda.jpg?w=900&h=500&s=1', images: ['https://villa-de-holanda-parque.allsaopaulohotels.com/data/Images/OriginalPhoto/17430/1743077/1743077013/image-holambra-villa-de-holanda-parque-hotel-11.JPEG', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/1d/fd/d2/hotel-villa-de-holanda.jpg?w=900&h=500&s=1'] },
        { name: 'Shellter', coverImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/297728157.jpg?k=4036a666c0889c64c0542e63fc86bbeaae67ec45bbc1544ec48171089fac2921&o=', images: ['https://cf.bstatic.com/xdata/images/hotel/max1024x768/297728157.jpg?k=4036a666c0889c64c0542e63fc86bbeaae67ec45bbc1544ec48171089fac2921&o=', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/5d/c7/eb/shellter-hotel.jpg?w=900&h=500&s=1'] },
        { name: 'Rancho da Cacha', coverImage: 'https://ranchodacachaca.com.br/wp-content/uploads/2022/02/pousada-rancho-da-cachaca.jpg', images: ['https://cf.bstatic.com/xdata/images/hotel/max1024x768/238029167.jpg?k=f520f9a78209a6719dccd0a6e5f7c8d6c5937d9463ae2d5e16c1e52ce6a453ca&o=', 'https://ranchodacachaca.com.br/wp-content/uploads/2022/02/pousada-rancho-da-cachaca.jpg'] },
        { name: 'Parque Hotel', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/2b/1a/f2/parque-hotel-holambra.jpg?w=900&h=500&s=1', images: ['https://i.ytimg.com/vi/x906VVX225E/hq720.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/2b/1a/f2/parque-hotel-holambra.jpg?w=900&h=500&s=1'] },
        // PARQUES
        { name: 'Van Gogh', coverImage: 'https://i.ytimg.com/vi/aJfA8tz0XH8/maxresdefault.jpg', images: ['https://i.ytimg.com/vi/JB52rZeRgR0/maxresdefault.jpg', 'https://i.ytimg.com/vi/aJfA8tz0XH8/maxresdefault.jpg'] },
        { name: 'Bloemen', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/54/25/2e/rosas-de-jardim.jpg?w=900&h=500&s=1', images: ['https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Aramaki_rose_park04s2400.jpg/960px-Aramaki_rose_park04s2400.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/54/25/2e/rosas-de-jardim.jpg?w=900&h=500&s=1'] },
        { name: 'Cidade das Crian', coverImage: 'https://saopauloparacriancas.com.br/wp-content/uploads/2022/07/3-1.jpg', images: ['https://upload.wikimedia.org/wikipedia/commons/7/7d/Submarino_da_Cidade_da_Crian%C3%A7a.jpg', 'https://saopauloparacriancas.com.br/wp-content/uploads/2022/07/3-1.jpg'] },
        { name: 'Vit', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/0f/ef/2e/foto-panoramica-em-um.jpg?w=900&h=500&s=1', images: ['https://live.staticflickr.com/2913/14506288868_096f57fde1_h.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/0f/ef/2e/foto-panoramica-em-um.jpg?w=900&h=500&s=1'] },
        { name: 'Nossa Prainha', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/44/67/dc/20160514-142534-largejpg.jpg?w=900&h=-1&s=1', images: ['https://lh5.googleusercontent.com/p/AF1QipNgJGZGcsmNW_O2I-PnZeRvuzjh7v-w2YzOb9zD=s1600', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/44/67/dc/20160514-142534-largejpg.jpg?w=900&h=-1&s=1'] },
        // PONTOS TURÍSTICOS
        { name: 'Moinho', coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Moinho_holambra.jpg/500px-Moinho_holambra.jpg', images: ['https://upload.wikimedia.org/wikipedia/commons/c/c5/Holambra_windmill.jpg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Moinho_holambra.jpg/500px-Moinho_holambra.jpg'] },
        { name: 'Boulevard', coverImage: 'https://i.redd.it/pb4dac8vkdra1.jpg', images: ['https://i.redd.it/pb4dac8vkdra1.jpg', 'https://cdn.prod.rexby.com/image/8fce094a49e047669b1178e0c38422a8', 'https://d2enhrgkrmsl80.cloudfront.net/poi-images/650864de1532c128b8e87d09/ATJ83zhU9rL-DEKEjWfh.jpeg'] },
        { name: 'Guarda-chuva', coverImage: 'https://i.pinimg.com/736x/57/ab/06/57ab066b45a89b7000193f24d4e623d7.jpg', images: ['https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Cagliari_collage.png/250px-Cagliari_collage.png', 'https://i.pinimg.com/736x/57/ab/06/57ab066b45a89b7000193f24d4e623d7.jpg'] },
        { name: 'Deck do Amor', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/08/ff/50/img-20180211-174802-283.jpg?w=1200&h=-1&s=1', images: ['https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/e1/c6/e9/closed-off-pr-telco-labor.jpg?w=900&h=500&s=1', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/08/ff/50/img-20180211-174802-283.jpg?w=1200&h=-1&s=1'] },
        { name: 'Museu', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/89/95/87/entrada.jpg?w=1200&h=-1&s=1', images: ['https://springfieldmuseums.org/wp-content/uploads/2023/05/Front-Entryway-Michele-and-Donald-DAmour-Museum-of-Fine-Arts-2023-scaled.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/89/95/87/entrada.jpg?w=1200&h=-1&s=1'] },
        { name: 'Portal', coverImage: 'https://c8.alamy.com/comp/2HEEHE1/dutch-style-portal-at-the-entrance-of-holambra-town-this-is-a-tipycal-town-built-my-dutch-immigrants-so-paulo-estate-brazil-2HEEHE1.jpg', images: ['https://c8.alamy.com/comp/2HEEHJF/dutch-style-portal-at-the-entrance-of-holambra-town-this-is-a-tipycal-town-built-my-dutch-immigrants-so-paulo-estate-brazil-2HEEHJF.jpg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Montagem_Holambra.jpg/960px-Montagem_Holambra.jpg'] },
        { name: 'Torre do Rel', coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/89/9d/f5/torre-do-relogio.jpg?w=1200&h=1200&s=1', images: ['https://images.pexels.com/photos/15829192/pexels-photo-15829192.jpeg?cs=srgb&dl=pexels-willianjusten-15829192.jpg&fm=jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/89/9d/f5/torre-do-relogio.jpg?w=1200&h=1200&s=1'] }
      ];

      for (const update of imageUpdates) {
        try {
          await db
            .update(places)
            .set({
              coverImage: update.coverImage,
              images: JSON.stringify(update.images)
            })
            .where(sql`name LIKE ${`%${update.name}%`} AND status = 'active'`);
          
          results.seed.updated++;
          results.seed.details.push({
            name: update.name,
            status: 'updated',
            imageCount: update.images.length
          });
        } catch (error: any) {
          results.seed.details.push({
            name: update.name,
            status: 'error',
            error: error.message
          });
        }
      }

      results.seed.status = 'success';

      return res.json({
        success: true,
        message: 'Complete setup finished',
        results
      });

    } catch (error: any) {
      console.error('Setup error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Check and create categories endpoint
  app.get("/api/check-categories", async (req, res) => {
    const { key } = req.query;
    
    if (key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { getDb } = await import("../db");
      const { categories } = await import("../../drizzle/schema");
      
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection failed' });
      }

      // Get all categories
      const allCategories = await db.select().from(categories);
      
      // Required categories
      const requiredCategories = [
        { name: 'Restaurantes', slug: 'restaurantes', icon: '🍽️' },
        { name: 'Pizzarias', slug: 'pizzarias', icon: '🍕' },
        { name: 'Bares', slug: 'bares', icon: '🍺' },
        { name: 'Cafés', slug: 'cafes', icon: '☕' },
        { name: 'Hotéis', slug: 'hoteis', icon: '🏨' },
        { name: 'Parques', slug: 'parques', icon: '🌳' },
        { name: 'Pontos turísticos', slug: 'pontos-turisticos', icon: '📍' }
      ];

      const created = [];
      const existing = [];

      for (const cat of requiredCategories) {
        const found = allCategories.find(c => c.slug === cat.slug);
        if (!found) {
          await db.insert(categories).values(cat);
          created.push(cat.name);
        } else {
          existing.push(cat.name);
        }
      }

      return res.json({
        success: true,
        categories: allCategories,
        created,
        existing,
        total: allCategories.length + created.length
      });
    } catch (error: any) {
      console.error('Category check error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Image migration endpoint (one-time use)
  app.get("/api/migrate-images", async (req, res) => {
    const { key } = req.query;
    
    // Security: require admin key
    if (key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { getDb } = await import("../db");
      const { sql } = await import("drizzle-orm");
      const { places } = await import("../../drizzle/schema");
      
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection failed' });
      }

      const results = {
        migration: { status: 'pending', message: '' },
        seed: { status: 'pending', updated: 0, details: [] as any[] }
      };

      // Step 1: Add images column if it doesn't exist
      try {
        await db.execute(sql`
          ALTER TABLE places ADD COLUMN images JSON DEFAULT NULL AFTER coverImage
        `);
        results.migration = { status: 'success', message: 'images column added' };
      } catch (error: any) {
        if (error.message?.includes('Duplicate column')) {
          results.migration = { status: 'skipped', message: 'images column already exists' };
        } else {
          throw error;
        }
      }

      // Step 2: Seed image data
      const imageUpdates = [
        {
          name: 'Martin Holandesa',
          coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/79/39/00/confeitaria-martin-holandesa.jpg?w=800&h=500&s=1',
          images: [
            'https://i.ytimg.com/vi/7B2RW7GS258/maxresdefault.jpg',
            'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/79/39/00/confeitaria-martin-holandesa.jpg?w=800&h=500&s=1',
            'https://media-cdn.tripadvisor.com/media/photo-s/06/79/39/00/confeitaria-martin-holandesa.jpg'
          ]
        },
        {
          name: 'Casa Bela',
          coverImage: 'https://casabelarestaurante.com.br/wp-content/uploads/2025/02/BRU_9396-scaled-4.jpg',
          images: [
            'https://s3-media0.fl.yelpcdn.com/bphoto/7b3sGluJl9ppMeiGuzq_mg/348s.jpg',
            'https://casabelarestaurante.com.br/wp-content/uploads/2025/02/BRU_9396-scaled-4.jpg',
            'https://s3-media0.fl.yelpcdn.com/bphoto/ZTHVHfD9oxK6iCRTOEW2Zg/348s.jpg'
          ]
        },
        {
          name: 'Old Dutch',
          coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/e6/d0/72/fachada.jpg?w=900&h=500&s=1',
          images: [
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEib2-s6ugtUYLuSAtjEDJFAn2qAVjJ5zyiyrXON1XsJ_IZXvnydIJE_ay8x3IDV-m1bwqUQf0RwR7edFKLQmystrflwfYdYBZh9bJOiZBisYzGVFJVbz3LNlowS00KfOPHWB_Re7GkDetTv/s1600/1300-77_dutch+gables.jpg',
            'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/e6/d0/72/fachada.jpg?w=900&h=500&s=1'
          ]
        },
        {
          name: 'Fratelli',
          coverImage: 'https://fratelliwinebar.com.br/wp-content/uploads/2025/12/fratelli-3-scaled-1.webp',
          images: [
            'https://s3-media0.fl.yelpcdn.com/bphoto/fbMGnveFeT-eoLxB8J_g8A/258s.jpg',
            'https://fratelliwinebar.com.br/wp-content/uploads/2025/12/fratelli-3-scaled-1.webp'
          ]
        },
        {
          name: 'Lago do Holandês',
          coverImage: 'https://i.ytimg.com/vi/djyEhV-X8IE/sddefault.jpg',
          images: [
            'https://i.ytimg.com/vi/djyEhV-X8IE/hq720.jpg',
            'https://i.ytimg.com/vi/djyEhV-X8IE/sddefault.jpg'
          ]
        }
      ];

      for (const update of imageUpdates) {
        try {
          await db
            .update(places)
            .set({
              coverImage: update.coverImage,
              images: JSON.stringify(update.images)
            })
            .where(sql`name LIKE ${`%${update.name}%`} AND status = 'active'`);
          
          results.seed.updated++;
          results.seed.details.push({
            name: update.name,
            status: 'updated',
            imageCount: update.images.length
          });
        } catch (error: any) {
          results.seed.details.push({
            name: update.name,
            status: 'error',
            error: error.message
          });
        }
      }

      results.seed.status = 'success';

      return res.json({
        success: true,
        message: 'Image migration and seed completed',
        results
      });

    } catch (error: any) {
      console.error('Migration error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // CMS REST endpoints
  app.post("/api/cms/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
      
      // Use AuthService for REST authentication
      const { AuthService } = await import("../authService");
      const result = await AuthService.login(email, password);
      
      // Set session cookie (optional - could use JWT instead)
      res.cookie("cms_session", JSON.stringify(result), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      return res.json(result);
    } catch (error: any) {
      console.error("CMS login error:", error);
      return res.status(401).json({ error: error.message || "Invalid credentials" });
    }
  });
  
  app.post("/api/cms/logout", (req, res) => {
    try {
      res.clearCookie("cms_session");
      return res.json({ success: true });
    } catch (error: any) {
      console.error("CMS logout error:", error);
      return res.status(500).json({ error: "Logout failed" });
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // Setup SPA fallback LAST - after all static file middleware and routes
  // This ensures /assets/ and other static files are served before fallback
  // IMPORTANT: Must use app.use() with middleware, not app.get("*") which is a route
  setupSPAFallback(app);

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
