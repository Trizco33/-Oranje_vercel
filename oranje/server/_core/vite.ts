import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  // CRITICAL: Store vite reference on app so SPA fallback can use transformIndexHtml
  (app as any).vite = vite;

  // Use Vite middleware for serving files and HMR
  app.use(vite.middlewares);
  console.log("[setupVite] Vite middleware configured");
}

export function serveStatic(app: Express) {
  const publicDir = path.join(process.cwd(), "dist", "public");

  if (!fs.existsSync(publicDir)) {
    console.error(`[serveStatic] ERROR: Build directory not found: ${publicDir}`);
    console.error(`[serveStatic] Make sure to run 'pnpm build' first`);
    return;
  }

  app.use(express.static(publicDir, {
    maxAge: "1d",
    etag: false,
  }));

  console.log(`[serveStatic] Static middleware configured for ${publicDir}`);
}

export function setupSPAFallback(app: Express) {
  const publicDir = path.join(process.cwd(), "dist", "public");
  const clientDir = path.resolve(import.meta.dirname, "../..", "client");

  app.use(async (req, res, next) => {
    // Skip API and tRPC routes
    if (req.path.startsWith("/api") || req.path.startsWith("/trpc")) {
      return next();
    }

    // Skip if response was already sent
    if (res.headersSent) {
      return next();
    }

    // Skip requests for files with extensions (assets, images, etc.)
    if (req.path.includes(".") && !req.path.endsWith(".html")) {
      return next();
    }

    try {
      const indexPath =
        process.env.NODE_ENV === "production"
          ? path.join(publicDir, "index.html")
          : path.join(clientDir, "index.html");

      if (!fs.existsSync(indexPath)) {
        console.error(`[SPA Fallback] index.html not found at ${indexPath}`);
        return res.status(404).send("index.html not found");
      }

      // In development, transform HTML with Vite (injects @vite/client, HMR, etc.)
      if (process.env.NODE_ENV === "development") {
        const vite = (app as any).vite;
        if (vite) {
          const template = await fs.promises.readFile(indexPath, "utf-8");
          const page = await vite.transformIndexHtml(req.originalUrl, template);
          return res.status(200).set({ "Content-Type": "text/html" }).end(page);
        } else {
          console.error("[SPA Fallback] Vite instance not found on app!");
        }
      }

      // In production, just send the file
      res.sendFile(indexPath);
    } catch (e) {
      console.error("[SPA Fallback] Error:", e);
      next(e);
    }
  });
}
