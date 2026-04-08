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
import { seedHolambra } from "../seed-holambra";
import { seedReceptivoExpand } from "../seed-receptivo-expand";
import { runMigrations } from "../run-migrations";
import { sitemapRouter } from "../sitemap-route";

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
  
  // Run DB migrations first (idempotent — safe on every startup)
  await runMigrations();
  // Seed database with default content on startup
  await seedDatabase();
  // Seed real Holambra places (idempotent upsert — safe to run on every startup)
  await seedHolambra();
  // Seed Receptivo Oranje tours + coverImages (idempotent — safe on every startup)
  await seedReceptivoExpand();
  
  // ============================================================================
  // CRITICAL: Register static file serving FIRST
  // This must be done BEFORE any routes (app.get, app.post, etc.)
  // ============================================================================
  console.log(`[Server] NODE_ENV: ${process.env.NODE_ENV}`);
  if (process.env.NODE_ENV === "development" && process.env.SKIP_VITE !== "true") {
    console.log("[Server] Using Vite dev server (combined mode)");
    await setupVite(app, server);
  } else if (process.env.NODE_ENV === "development" && process.env.SKIP_VITE === "true") {
    console.log("[Server] API-only mode (SKIP_VITE=true) — Vite runs separately on its own port");
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

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch(e) { data = { title: 'ORANJE', body: event.data.text() }; }
  const title = data.title || 'ORANJE';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    data: { url: data.url || '/app' },
    vibrate: [100, 50, 100],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/app';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/app') && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
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
              images: update.images
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

  // Run migration 0013 (article_backups table)
  app.get("/api/run-migration-0013", async (req, res) => {
    const { key } = req.query;
    
    if (key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { getDb } = await import("../db");
      const fs = await import("fs");
      const path = await import("path");
      
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection failed' });
      }

      // Read migration file
      const migrationPath = path.join(process.cwd(), "drizzle", "0013_add_article_backups.sql");
      
      if (!fs.existsSync(migrationPath)) {
        return res.status(404).json({ error: 'Migration file not found' });
      }

      const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
      
      // Split by semicolon and execute each statement
      const statements = migrationSQL
        .split(";")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      for (const statement of statements) {
        await db.execute(statement);
      }

      return res.json({ 
        success: true, 
        message: "Migration 0013 (article_backups table) executed successfully",
        statementsExecuted: statements.length
      });
    } catch (error: any) {
      console.error("Migration error:", error);
      return res.status(500).json({ 
        error: 'Migration failed', 
        details: error.message 
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
              images: update.images
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

  // ── Seed Places Endpoint ─────────────────────────────────────────────────
  app.get("/api/seed-places", async (req, res) => {
    const { key } = req.query;
    if (key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { getDb } = await import("../db");
      const { categories, places } = await import("../../drizzle/schema");
      const { sql, eq } = await import("drizzle-orm");

      const db = await getDb();
      if (!db) return res.status(500).json({ error: 'DB connection failed' });

      // Get category map
      const allCats = await db.select().from(categories);
      const catMap: Record<string, number> = {};
      for (const c of allCats) catMap[c.slug] = c.id;

      const newPlaces = [
        // PIZZARIAS
        { name: "Pizzaria Serrana", slug: "pizzaria-serrana", categorySlug: "pizzarias", shortDesc: "Pizzas artesanais com ingredientes selecionados", address: "Rua das Flores, 120 - Holambra", rating: 4.6, coverImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/d8/7f/a1/caption.jpg?w=1100&h=1100&s=1", images: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/d8/7f/a1/caption.jpg?w=1100&h=1100&s=1", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800"] },
        { name: "Dr Pizza Holambra", slug: "dr-pizza-holambra", categorySlug: "pizzarias", shortDesc: "Pizzas tradicionais e especiais", address: "Av. dos Holandeses, 45 - Holambra", rating: 4.4, coverImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800", images: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800", "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800"] },
        { name: "Forno & Massa", slug: "forno-e-massa", categorySlug: "pizzarias", shortDesc: "Forno a lenha e massas frescas", address: "Rua dos Cravos, 88 - Holambra", rating: 4.5, coverImage: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800", images: ["https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800", "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800"] },
        // BARES
        { name: "Seo Carneiro Bar", slug: "seo-carneiro-bar", categorySlug: "bares", shortDesc: "Bar tradicional com petiscos holandeses", address: "Rua Dória, 200 - Holambra", rating: 4.3, coverImage: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800", images: ["https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800", "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800"] },
        { name: "Deck 237", slug: "deck-237", categorySlug: "bares", shortDesc: "Bar e restaurante à beira do lago", address: "Rua do Lago, 237 - Holambra", rating: 4.5, coverImage: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800", images: ["https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800", "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=800"] },
        { name: "Quintal Yah", slug: "quintal-yah", categorySlug: "bares", shortDesc: "Ambiente descontraído com música ao vivo", address: "Rua das Tulipas, 55 - Holambra", rating: 4.2, coverImage: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800", images: ["https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800", "https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=800"] },
        // HOTÉIS
        { name: "Garden Hotel Holambra", slug: "garden-hotel-holambra", categorySlug: "hoteis", shortDesc: "Hotel com jardins holandeses e piscina", address: "Estrada Municipal, km 3 - Holambra", rating: 4.7, coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"] },
        { name: "Villa de Holanda", slug: "villa-de-holanda", categorySlug: "hoteis", shortDesc: "Parque hotel com lazer completo", address: "Rod. SP-107, km 5 - Holambra", rating: 4.8, coverImage: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800", images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800"] },
        { name: "Shellter Hotel", slug: "shellter-hotel", categorySlug: "hoteis", shortDesc: "Hotel boutique moderno", address: "Rua Principal, 300 - Holambra", rating: 4.5, coverImage: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800", images: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"] },
        { name: "Pousada Rancho da Cachaça", slug: "pousada-rancho-cachaca", categorySlug: "hoteis", shortDesc: "Pousada rural com charme", address: "Estrada Rural, s/n - Holambra", rating: 4.4, coverImage: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800", images: ["https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800"] },
        { name: "Parque Hotel Holambra", slug: "parque-hotel-holambra", categorySlug: "hoteis", shortDesc: "Hotel com área verde e lazer", address: "Av. das Flores, 500 - Holambra", rating: 4.6, coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800", images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800", "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800"] },
        // PARQUES
        { name: "Parque Van Gogh", slug: "parque-van-gogh", categorySlug: "parques", shortDesc: "Parque temático com jardins inspirados em Van Gogh", address: "Estrada Municipal, km 2 - Holambra", rating: 4.8, coverImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800", images: ["https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Van_Gogh_-_Paar_im_Park_von_Arles_-_Der_Garten_des_Dichters_III.jpeg/330px-Van_Gogh_-_Paar_im_Park_von_Arles_-_Der_Garten_des_Dichters_III.jpeg", "https://upload.wikimedia.org/wikipedia/commons/1/16/Vincent_van_Gogh_-_Garden_at_Arles_-_Google_Art_Project.jpg"] },
        { name: "Bloemen Park", slug: "bloemen-park", categorySlug: "parques", shortDesc: "Parque de flores e jardins holandeses — principal atração ao ar livre de Holambra", address: "Holambra, SP", rating: 4.8, coverImage: "/places/bloemen-park.png", images: [] },
        { name: "Cidade das Crianças", slug: "cidade-das-criancas", categorySlug: "parques", shortDesc: "Parque infantil com atividades educativas", address: "Av. da Juventude, 100 - Holambra", rating: 4.5, coverImage: "https://images.unsplash.com/photo-1596997000103-e597b3ca50df?w=800", images: ["https://images.unsplash.com/photo-1596997000103-e597b3ca50df?w=800", "https://i.ytimg.com/vi/Mib-dv72bn4/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCIT05EZ3sAV6nrIIWAWY9lv7vsuA"] },
        { name: "Parque Vitória", slug: "parque-vitoria", categorySlug: "parques", shortDesc: "Área verde com trilhas e lago", address: "Estrada da Vitória, km 1 - Holambra", rating: 4.6, coverImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", images: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800"] },
        { name: "Nossa Prainha", slug: "nossa-prainha", categorySlug: "parques", shortDesc: "Praia artificial com área de lazer", address: "Rua do Lago, 50 - Holambra", rating: 4.4, coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800"] },
      ];

      const results: any[] = [];

      for (const p of newPlaces) {
        const catId = catMap[p.categorySlug];
        if (!catId) {
          results.push({ name: p.name, status: 'skipped', reason: `category ${p.categorySlug} not found` });
          continue;
        }

        // Check if place already exists
        const existing = await db.select().from(places).where(sql`name = ${p.name} AND categoryId = ${catId}`);
        if (existing.length > 0) {
          // Update images
          await db.update(places).set({
            coverImage: p.coverImage,
            images: p.images,
          }).where(eq(places.id, existing[0].id));
          results.push({ name: p.name, status: 'updated', id: existing[0].id });
        } else {
          const [inserted] = await db.insert(places).values({
            name: p.name,
            categoryId: catId,
            shortDesc: p.shortDesc,
            address: p.address,
            rating: p.rating,
            coverImage: p.coverImage,
            images: p.images,
            status: 'active',
            isFeatured: false,
            isRecommended: false,
            isPartner: false,
          });
          results.push({ name: p.name, status: 'created', id: (inserted as any).insertId });
        }
      }

      // Also update existing places with images
      const existingUpdates = [
        { id: 1, coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800"] },
        { id: 2, coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800", images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800", "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800", "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800"] },
        { id: 3, coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"] },
        { id: 4, coverImage: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800", images: ["https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800", "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800"] },
        { id: 5, coverImage: "https://images.unsplash.com/photo-1742845918430-c6093f93f740?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHwzMTcwOTl8fGVufDB8fHx8fA%3D%3D", images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFuZHNjYXBlfGVufDB8fDB8fHww", "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800", "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dHJhdmVsJTIwbmF0dXJlfGVufDB8fDB8fHww"] },
        { id: 6, coverImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800", images: ["https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"] },
        { id: 7, coverImage: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800", images: ["https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800", "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"] },
      ];

      for (const u of existingUpdates) {
        try {
          await db.update(places).set({
            coverImage: u.coverImage,
            images: u.images,
          }).where(eq(places.id, u.id));
          results.push({ name: `existing-${u.id}`, status: 'images-updated' });
        } catch (e: any) {
          results.push({ name: `existing-${u.id}`, status: 'error', error: e.message });
        }
      }

      return res.json({ success: true, results, totalProcessed: results.length });
    } catch (error: any) {
      console.error('Seed error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // ── Image Upload (multipart) ────────────────────────────────────────────
  {
    const multer = (await import("multer")).default;
    const { storagePut, getUploadDir } = await import("../storage");

    // Serve uploaded files statically
    app.use("/api/uploads", express.static(getUploadDir(), {
      maxAge: "7d",
      immutable: true,
    }));

    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error("Tipo de arquivo não permitido. Use: JPG, PNG ou WebP"));
        }
      },
    });

    app.post("/api/upload", upload.single("file"), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ success: false, error: "Nenhum arquivo enviado" });
        }
        const safeName = req.file.originalname
          .replace(/[^a-zA-Z0-9._-]/g, "_")
          .substring(0, 80);
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileKey = `uploads/${Date.now()}-${randomSuffix}-${safeName}`;
        const { url } = await storagePut(fileKey, req.file.buffer, req.file.mimetype);
        return res.json({ success: true, url });
      } catch (error: any) {
        console.error("Upload error:", error);
        return res.status(500).json({ success: false, error: error.message || "Erro ao fazer upload" });
      }
    });
  }

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Create admin user endpoint (protected by ADMIN_KEY)
  app.post("/api/create-admin", async (req, res) => {
    const { key, email, name } = req.body;
    
    if (key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { getDb } = await import("../db");
      const { users } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection failed' });
      }

      const adminEmail = email || 'admin@oranjeapp.com.br';
      const adminName = name || 'Admin Oranje';

      // Check if admin already exists by email or openId
      const { or } = await import("drizzle-orm");
      const existing = await db.select().from(users).where(
        or(
          eq(users.email, adminEmail),
          eq(users.openId, 'admin-owner')
        )
      ).limit(1);
      
      if (existing.length > 0) {
        // Update role to admin if not already
        if (existing[0].role !== 'admin') {
          await db.update(users).set({ role: 'admin' }).where(eq(users.id, existing[0].id));
          return res.json({
            success: true,
            message: 'User promoted to admin',
            user: { id: existing[0].id, email: existing[0].email, name: existing[0].name, role: 'admin' }
          });
        }
        return res.json({
          success: true,
          message: 'Admin user already exists',
          user: { id: existing[0].id, email: existing[0].email, name: existing[0].name, role: existing[0].role }
        });
      }

      // Create admin user using upsert to handle duplicates
      try {
        await db.insert(users).values({
          openId: 'admin-owner',
          email: adminEmail,
          name: adminName,
          role: 'admin',
          lastSignedIn: new Date()
        }).onDuplicateKeyUpdate({
          set: {
            email: adminEmail,
            name: adminName,
            role: 'admin',
            lastSignedIn: new Date()
          }
        });

        return res.json({
          success: true,
          message: 'Admin user created/updated successfully',
          user: { email: adminEmail, name: adminName },
          note: 'Login with ANY password (temporary auth system)'
        });
      } catch (insertError: any) {
        // If insert fails, try to find and update the existing user
        const existingByOpenId = await db.select().from(users).where(eq(users.openId, 'admin-owner')).limit(1);
        if (existingByOpenId.length > 0) {
          await db.update(users).set({
            email: adminEmail,
            name: adminName,
            role: 'admin'
          }).where(eq(users.id, existingByOpenId[0].id));
          
          return res.json({
            success: true,
            message: 'Admin user updated successfully',
            user: { email: adminEmail, name: adminName },
            note: 'Login with ANY password (temporary auth system)'
          });
        }
        throw insertError;
      }

    } catch (error: any) {
      console.error('Create admin error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
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
      
      // Set CMS session cookie (legacy)
      res.cookie("cms_session", JSON.stringify(result), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // ALSO set the main app JWT session cookie so trpc auth.me works
      // This bridges CMS login with the App Admin auth system
      try {
        const { sdk } = await import("./sdk");
        const { COOKIE_NAME } = await import("@shared/const");
        const { getSessionCookieOptions } = await import("./cookies");
        const user = result.user;
        if (user && user.id) {
          // Find the user's openId from the database
          const dbModule = await import("../db");
          const dbUser = await dbModule.getUserByEmail(email);
          if (dbUser && dbUser.openId) {
            const sessionToken = await sdk.createSessionToken(dbUser.openId, {
              name: dbUser.name || "Admin",
            });
            const cookieOptions = getSessionCookieOptions(req);
            res.cookie(COOKIE_NAME, sessionToken, {
              ...cookieOptions,
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
          }
        }
      } catch (sessionError) {
        console.warn("[CMS Login] Could not set app session cookie:", sessionError);
        // Continue — CMS session still works
      }
      
      return res.json(result);
    } catch (error: any) {
      console.error("CMS login error:", error);
      return res.status(401).json({ error: error.message || "Invalid credentials" });
    }
  });
  
  app.post("/api/cms/logout", (req, res) => {
    try {
      const { COOKIE_NAME } = require("@shared/const");
      res.clearCookie("cms_session", { path: "/" });
      res.clearCookie(COOKIE_NAME, { path: "/" });
      return res.json({ success: true });
    } catch (error: any) {
      console.error("CMS logout error:", error);
      return res.status(500).json({ error: "Logout failed" });
    }
  });
  
  // ─── CMS direct REST endpoints (work with cms_session cookie at any path) ───
  const parseCmsSession = (req: any): { userId: number } | null => {
    try {
      const cookieHeader = req.headers.cookie || "";
      const match = cookieHeader.match(/cms_session=([^;]+)/);
      if (match) {
        const session = JSON.parse(decodeURIComponent(match[1]));
        if (session?.success && session?.user?.role === "admin" && session?.user?.id) {
          return { userId: Number(session.user.id) };
        }
      }
    } catch {}
    try {
      const tokenHeader = req.headers["x-cms-token"];
      if (tokenHeader) {
        const session = JSON.parse(String(tokenHeader));
        if (session?.success && session?.user?.role === "admin" && session?.user?.id) {
          return { userId: Number(session.user.id) };
        }
      }
    } catch {}
    return null;
  };

  // Shared Drizzle pool for REST endpoints — uses same pattern as content.router.ts
  let _restDb: any = null;
  const getRestDb = async () => {
    if (!_restDb) {
      const { ENV } = await import("./env");
      if (!ENV.databaseUrl) return null;
      const { drizzle } = await import("drizzle-orm/mysql2");
      const mysql = await import("mysql2/promise");
      _restDb = drizzle(mysql.createPool(ENV.databaseUrl) as any);
    }
    return _restDb;
  };

  app.post("/api/cms/hero-image", async (req, res) => {
    try {
      const admin = parseCmsSession(req);
      if (!admin) return res.status(403).json({ error: "Forbidden" });
      const { imageUrl } = req.body;
      if (typeof imageUrl !== "string") return res.status(400).json({ error: "imageUrl required" });
      const db = await getRestDb();
      if (!db) return res.status(500).json({ error: "Database not available" });
      const { siteContent } = await import("../../drizzle/schema");
      await db.insert(siteContent).values({
        key: "hero_imageUrl", value: imageUrl, section: "hero", updatedBy: admin.userId,
      }).onDuplicateKeyUpdate({ set: { value: imageUrl, updatedBy: admin.userId } });
      console.log(`[CMS REST] hero_imageUrl saved (${imageUrl.length} chars) by userId=${admin.userId}`);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("[CMS REST] hero-image save error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cms/app-hero-image", async (req, res) => {
    try {
      const admin = parseCmsSession(req);
      if (!admin) return res.status(403).json({ error: "Forbidden" });
      const { imageUrl } = req.body;
      if (typeof imageUrl !== "string") return res.status(400).json({ error: "imageUrl required" });
      const db = await getRestDb();
      if (!db) return res.status(500).json({ error: "Database not available" });
      const { siteContent } = await import("../../drizzle/schema");
      await db.insert(siteContent).values({
        key: "app_hero_imageUrl", value: imageUrl, section: "app_hero", updatedBy: admin.userId,
      }).onDuplicateKeyUpdate({ set: { value: imageUrl, updatedBy: admin.userId } });
      console.log(`[CMS REST] app_hero_imageUrl saved (${imageUrl.length} chars) by userId=${admin.userId}`);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("[CMS REST] app-hero-image save error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Sitemap + robots.txt (dynamic, reads from DB)
  app.use(sitemapRouter);

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
