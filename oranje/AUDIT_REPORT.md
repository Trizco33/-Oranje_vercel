# ORANJE — Full GitHub Repository Audit Report
**Date:** 2026-03-19  
**Repo:** `Trizco33/-Oranje_vercel` (branch: `main`)

---

## TASK 1 — FULL CODEBASE AUDIT

### 1. Where the Frontend Lives

**Location:** `client/`
- Entry point: `client/src/main.tsx`
- Router: **BrowserRouter** (from `react-router-dom`)
- App shell: `client/src/App.tsx` — defines all routes (`/`, `/app`, `/app/*`, `/admin`, etc.)
- Build output: `dist/public/` (via Vite)
- HTML entry: `client/index.html`
- Key tech: React 19, React Router, TanStack React Query, tRPC React, Tailwind CSS, Radix UI, Lucide icons

**CRITICAL FINDING:** The frontend currently uses **mock data** for ALL user-facing pages. Every page component imports from `client/src/hooks/useMockData.ts`, which returns hardcoded data from `client/src/data/mock/`. No actual API calls are made for displaying places, events, categories, routes, drivers, etc.

**Exceptions (still use tRPC):**
- `pages/LandingNew.tsx` — uses `trpc.content.*` (NOT in route table, likely dead code)
- `pages/DriverDetail.tsx` — uses `trpc.drivers.list`
- `pages/DriversAdminTab.tsx` — uses `trpc.drivers.*`
- `pages/Admin.tsx` — uses `trpc.admin.stats` and `trpc.admin.logs`
- `pages/RegisterDriver.tsx` — uses `trpc.drivers.createPublic`
- `pages/GuideDetail.tsx` — uses `trpc.articles.bySlug`
- All CMS/admin components (`AdminCategories`, `AdminPlaces`, `CMSBlog`, etc.)
- `useAuth` hook — calls `trpc.auth.me` for session validation

**Router structure:**
- `/` → SiteHome (marketing homepage)
- `/app` → Home (app dashboard with mock data)
- `/app/*` → App sub-routes (explorar, busca, eventos, etc.)
- `/admin` → CMS Dashboard (requires DB)
- `/landing` → Landing page

### 2. Where the Backend Lives

**Location:** `server/`
- Entry point: `server/_core/index.ts` — Express server
- Build: `esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`
- Start: `NODE_ENV=production node dist/index.js`
- Port: defaults to 3000 (env: `PORT`)

**What the backend does:**
1. Serves the built static frontend from `dist/public/`
2. Provides SPA fallback (all non-API, non-asset routes → `index.html`)
3. Hosts tRPC API at `/api/trpc`
4. Hosts OAuth callback at `/api/oauth/callback`
5. Hosts CMS REST login at `/api/cms/login`
6. Serves PWA manifest and service worker for `/app`
7. Seeds database with default CMS content on startup

### 3. Where /api/trpc is Defined

**Router file:** `server/routers.ts` (exports `appRouter`)
**tRPC base:** `server/_core/trpc.ts` (initializes tRPC with superjson transformer)
**Mounted at:** `server/_core/index.ts` line: `app.use("/api/trpc", createExpressMiddleware(...))`

**Available tRPC namespaces:**
- `auth` — me, logout, requestMagicLink, verifyMagicLink
- `categories` — list, bySlug, create, update, delete
- `places` — (imported from `places.router.ts`)
- `events` — list, byId, upcoming, create, update, delete, sendAlert
- `vouchers` — list, create, update
- `ads` — list, create, update
- `partners` — list, create, update
- `favorites` — list, add, remove (requires auth)
- `routes` — public, mine, byId, create, update, delete
- `notifications` — list, markRead (requires auth)
- `admin` — stats, logs, generateImage (requires admin role)
- `drivers` — (imported from `drivers.router.ts`)
- `admin_cms` — (imported from `admin.router.ts`)
- `upload` — (imported from `upload.router.ts`)
- `articles` — (imported from `articles.router.ts`)
- `cms` — (imported from `cms.router.ts`)
- `content` — (imported from `content.router.ts`)
- `reviews` — (imported from `reviews.router.ts`)
- `seo` — sitemap
- `system` — (imported from `systemRouter.ts`)

### 4. How Backend is Started

```bash
# Development:
NODE_ENV=development tsx watch server/_core/index.ts

# Production:
# Step 1 - Build:
vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
# Step 2 - Run:
NODE_ENV=production node dist/index.js
```

The server is a **long-running Express process**. It does NOT use serverless functions.

### 5. Whether Auth is Implemented

**YES, fully implemented via TWO systems:**

**System A — Manus OAuth (primary):**
- `server/_core/sdk.ts` — SDKServer class
- Uses external OAuth server at `OAUTH_SERVER_URL`
- Exchanges auth codes for tokens, verifies JWTs
- Session stored as JWT in cookie (`app_session_id`)
- Requires: `OAUTH_SERVER_URL`, `VITE_APP_ID`, `JWT_SECRET`

**System B — Magic Link (email-based):**
- `server/routers.ts` → `auth.requestMagicLink` and `auth.verifyMagicLink`
- Uses Resend API or console logging in dev
- Requires: `RESEND_API_KEY`, `MAIL_FROM` (optional)

**System C — CMS Login (REST, admin only):**
- `server/authService.ts` — AuthService.login()
- TEMPORARY: accepts any password if email exists and role=admin
- Used only for `/api/cms/login`

### 6. Whether Database Access Exists

**YES — MySQL via Drizzle ORM:**
- Schema: `drizzle/schema.ts` — 13+ tables (users, categories, places, events, vouchers, ads, partners, favorites, routes, notifications, adminLogs, magicLinks, drivers, siteContent, articles, etc.)
- DB client: `server/db.ts` — uses `drizzle-orm/mysql2`
- Config: `drizzle.config.ts` — MySQL dialect
- Migrations: `drizzle/0000_chief_slipstream.sql` through `drizzle/0011_greedy_joystick.sql` (12 migration files)
- Connection: `process.env.DATABASE_URL`

**CRITICAL: ALL database functions gracefully degrade.** If `DATABASE_URL` is not set, `getDb()` returns null, and all functions return empty arrays/undefined instead of crashing. The app is designed to work without a database.

**Additionally:** There's a Supabase client in `client/src/lib/supabase.ts` with hardcoded credentials, but it's **NOT used by any active component** (only in test files). It's dead code.

### 7. Whether This Repo is Truly Full-Stack

**YES — it is a complete full-stack application, BUT:**

The frontend has been **decoupled from the backend** through mock data hooks. Here's the layer breakdown:

| Layer | Backend Required? | Currently Active? |
|-------|------------------|--------------------|
| Marketing pages (`/`, `/o-que-fazer-*`, etc.) | NO (mock data) | YES |
| App pages (`/app`, `/app/explorar`, etc.) | NO (mock data) | YES |
| Auth (login, logout) | YES (OAuth/JWT) | YES but gracefully degrades |
| Admin CMS (`/admin`) | YES (tRPC + DB) | YES but needs DB |
| Driver registration | YES (tRPC + DB) | YES but needs DB |
| Image upload/generation | YES (storage + forge API) | YES but needs env vars |

**The frontend can run completely standalone as a static SPA with mock data.** The backend adds auth, CMS, and real database access.

### 8. Environment Variables the Backend Depends On

| Variable | Required? | Used For |
|----------|-----------|----------|
| `DATABASE_URL` | Soft (graceful degrade) | MySQL connection |
| `OAUTH_SERVER_URL` | Soft (auth won't work) | Manus OAuth server |
| `VITE_APP_ID` | Soft (auth won't work) | OAuth app identification |
| `JWT_SECRET` | Soft (auth won't work) | Session JWT signing |
| `OWNER_OPEN_ID` | Optional | Auto-admin role assignment |
| `PORT` | Optional (default 3000) | Server port |
| `NODE_ENV` | Optional | production/development mode |
| `RESEND_API_KEY` | Optional | Email sending (magic links) |
| `MAIL_FROM` | Optional | Email sender address |
| `BUILT_IN_FORGE_API_URL` | Optional | Image generation, storage, notifications |
| `BUILT_IN_FORGE_API_KEY` | Optional | API key for forge services |
| `APP_ORIGIN` | Optional | Magic link email URLs |

**Client-side (build time):**

| Variable | Required? | Used For |
|----------|-----------|----------|
| `VITE_APP_ID` | Soft | OAuth login URL generation |
| `VITE_OAUTH_PORTAL_URL` | Soft | OAuth login URL generation |
| `VITE_GA4_MEASUREMENT_ID` | Optional | Google Analytics |
| `VITE_FRONTEND_FORGE_API_URL` | Optional | Client-side forge API |
| `VITE_FRONTEND_FORGE_API_KEY` | Optional | Client-side forge API key |

### 9. Whether the Backend Can Run on Vercel

**NO. The backend CANNOT run on Vercel as-is.**

Reasons:
1. **Long-running Express server** — Vercel uses serverless functions, not persistent servers
2. **MySQL connection via `mysql2`** — Requires persistent connection pool (not serverless-friendly without PlanetScale or Neon adapters)
3. **`esbuild` bundles to a single `dist/index.js`** — This is a Node.js server entry, not a serverless function
4. **Current `vercel.json`** is configured as **static-only SPA** (framework: "vite", buildCommand: "npx vite build", outputDirectory: "dist/public"). It does NOT include any serverless function configuration.

**What the current Vercel deployment actually does:**
- Builds ONLY the client (`vite build`)
- Serves static files from `dist/public/`
- Rewrites all routes to `index.html` (SPA)
- **No backend, no API, no database**

### 10. Correct Deployment Platform

**For full-stack deployment:**
- **Railway** (already has `railway.json` configured) — `pnpm install && pnpm build` → `pnpm start`
- **Fly.io**, **Render**, **DigitalOcean App Platform** — Any platform supporting long-running Node.js
- **VPS/Docker** — Direct `node dist/index.js`

**For frontend-only (current Vercel config):**
- **Vercel** — Works perfectly for the static SPA with mock data
- Backend features (auth, CMS, real data) will NOT work

---

## TASK 2 — DEPLOYMENT FEASIBILITY

### A. Can the GitHub repo run as a full-stack app?

**YES**, if deployed on a platform that supports long-running Node.js processes AND has a MySQL database available.

### B. Can both frontend and backend be deployed together?

**YES** — the repo is designed for this. The Express server:
1. Builds client with Vite → `dist/public/`
2. Builds server with esbuild → `dist/index.js`
3. Server serves static files AND handles API routes
4. Single deployment, single port

### C. Correct deployment model?

**Option 1 — Full-stack on Railway/Render/Fly.io:**
- Deploy repo → Railway/Render builds and runs `node dist/index.js`
- Set `DATABASE_URL` to a MySQL instance
- Set auth env vars for Manus OAuth
- Domain: Point `oranjeapp.com.br` to the deployment

**Option 2 — Frontend-only on Vercel (current state):**
- Deploy repo → Vercel builds client only
- Mock data serves all pages
- No auth, no CMS, no real database
- Domain: Point `oranjeapp.com.br` to Vercel

### D. What's missing or incompatible?

**For Vercel (frontend-only):**
- The `/app` route SHOULD work with BrowserRouter + SPA rewrites
- BUT the error occurs because some lazy-loaded components or their dependencies crash without certain providers/context
- The `vite-plugin-manus-runtime` injects Manus-specific code that may cause issues outside Manus

**For full-stack (Railway):**
- Need a MySQL database URL
- Need Manus OAuth credentials (or the auth falls back gracefully)
- The `railway.json` is already correctly configured

---

## TASK 3 — KEY DECISIONS NEEDED

### What's Actually in Production Right Now?

The current `oranjeapp.com.br` is served by **Manus infrastructure** (behind Cloudflare). It:
- Uses **HashRouter** (URLs like `/#/app`)
- Has a working backend with tRPC API
- Has a different build than the GitHub repo (GitHub uses BrowserRouter)

The Vercel deployment at `oranje-vercel.vercel.app`:
- Uses **BrowserRouter** (URLs like `/app`)
- Is frontend-only (no backend)
- Shows "Algo inesperado aconteceu" error on `/app`

### Root Cause of the `/app` Error on Vercel

The error is caught by the top-level `ErrorBoundary` in `App.tsx`. The crash likely comes from:
1. **`vite-plugin-manus-runtime`** injecting Manus-specific runtime code that expects Manus infrastructure
2. Components attempting tRPC calls that fail in unexpected ways despite the catch handler
3. The `useAuth` hook stores data to `localStorage` key `manus-runtime-user-info` — suggesting tight coupling with Manus runtime

### Options Going Forward

| Option | Effort | Result |
|--------|--------|--------|
| A. Fix Vercel frontend-only | Low | `/app` works with mock data, no auth/CMS/DB |
| B. Deploy full-stack on Railway | Medium | Everything works, need MySQL + env vars |
| C. Keep Manus + point domain back | Zero | Keep current state (HashRouter URLs) |

**Recommendation:** Fix the Vercel frontend-only deployment first (Option A) as a quick win. The mock data already works. The crash is likely caused by the Manus runtime plugin or a specific component error that can be debugged and fixed.
