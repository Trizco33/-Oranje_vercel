# Content & Navigation Hardening Report

## 1. Content Audit

### Real API Data ✅
All core data hooks use **real tRPC backend calls**:

| Hook | tRPC Endpoint | Status |
|------|--------------|--------|
| `useCategoriesList` | `trpc.categories.list` | ✅ Real |
| `useCategoryBySlug` | `trpc.categories.bySlug` | ✅ Real |
| `usePlacesList` | `trpc.places.list` | ✅ Real |
| `usePlaceById` | `trpc.places.byId` | ✅ Real |
| `useEventsList` | `trpc.events.list` | ✅ Real |
| `useEventById` | `trpc.events.byId` | ✅ Real |
| `useFavorites` | `trpc.favorites.*` | ✅ Real |
| `useReviewsByPlace` | `trpc.reviews.listByPlace` | ✅ Real |
| `useDriversList` | `trpc.drivers.listPublic` | ✅ Real |
| `useNotificationsList` | `trpc.notifications.*` | ✅ Real |
| `usePublicRoutes` | `trpc.routes.listPublic` | ✅ Real |
| `useVouchersList` | `trpc.vouchers.list` | ✅ Real |
| `usePartnersList` | `trpc.partners.list` | ✅ Real |
| `useAdsList` | `trpc.ads.list` | ✅ Real |
| `useHeroContent` | `trpc.content.getHero` | ✅ Real |

### Articles — Fallback to Seed Content ⚠️
- `useArticlesListPublished` and `useArticleBySlug` hit `trpc.articles.*`
- When the articles DB table is empty, they fall back to **curated local seed content** in `client/src/data/mock/articles.ts`
- This is intentional: provides meaningful blog/guide content until admin adds real articles

### Mock Data Files (client/src/data/mock/)
- Files exist for: articles, categories, content, drivers, events, notifications, partners, places, reviews, routes
- **Only `articles.ts`** is actually imported (by `useMockData.ts` for the fallback)
- All other mock files are **orphaned** and not used by any component

### Login Page (/app/login)
- The magic-link login simulates sending an email (setTimeout placeholder)
- Marked with `TODO: Replace with real magic-link or OAuth flow`
- Real authentication happens via OAuth through `/login` (AdminLogin) and CMS Login

## 2. Navigation Audit

### Fixed Issues

#### Key-based Wrappers for Detail Pages
**Problem**: When navigating between detail pages (e.g., event/1 → event/2), React can reuse the same component instance, causing stale state.

**Fix**: Added `key={param}` wrappers for all detail routes:
- `EventDetailWrapper` — `key={id}` for `/app/evento/:id`
- `DriverDetailWrapper` — `key={id}` for `/app/motorista/:id`
- `GuideDetailWrapper` — `key={slug}` for `/guia/:slug`
- `BlogPostWrapper` — `key={slug}` for `/blog/:slug`
- (Already existed: `PlaceDetailWrapper`, `RouteDetailWrapper`)

#### Broken Link in Contact Page
- `<a href="#">@oranjeholambra</a>` → real Instagram link with `target="_blank"` and `rel="noopener noreferrer"`

### Verified Correct ✅

| Pattern | Location | Status |
|---------|----------|--------|
| `window.location.href = getLoginUrl()` | Search.tsx, DashboardLayout.tsx | ✅ OAuth redirect (external) |
| `window.location.href = "/"` | App.tsx ErrorFallback | ✅ Error recovery |
| `window.location.reload()` | ErrorBoundary.tsx | ✅ Error recovery |
| `window.location.origin` / `.href` | SiteBlogPost, GuideDetail, PlaceDetail, const.ts | ✅ Share URLs / OAuth |
| `window.location.pathname` | InstallPrompt.tsx | ✅ PWA detection |
| `ScrollToTop` component | App.tsx | ✅ Scrolls to top on every route change |
| `useNavigate` usage | All page components | ✅ Client-side SPA navigation |
| `<Link>` components | Navigation, cards, lists | ✅ Proper SPA links |

### Cleaned Up
- Removed unused `useMockMutation` helper function
- Updated `useMockData.ts` header comment to clarify all hooks use real tRPC
- Removed unused `useState` import from `useMockData.ts`

## 3. Route Structure Verified

All routes render correctly:
- `/` — SiteHome (public homepage)
- `/blog`, `/blog/:slug` — Blog listing and detail
- `/o-que-fazer-em-holambra` — SEO page
- `/app` — App home with PWA, Splash, Notifications
- `/app/explorar/:slug` — Category exploration
- `/app/lugar/:id` — Place detail (with key wrapper)
- `/app/evento/:id` — Event detail (NEW key wrapper)
- `/app/roteiro/:id` — Route detail (with key wrapper)
- `/app/motorista/:id` — Driver detail (NEW key wrapper)
- `/guia/:slug` — Guide detail (NEW key wrapper)
- `/app/admin`, `/app/adm` — App Admin (with AdminGuard)
- `/admin`, `/adm` — CMS Dashboard
- `*` — 404 NotFound

## 4. Build Status
✅ `npx vite build` succeeds with no errors
