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
