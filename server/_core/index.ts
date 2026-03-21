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
