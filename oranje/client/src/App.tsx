import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, useParams } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "react-error-boundary";
import { usePageTracking } from "@/hooks/usePageTracking";
import { ScrollToTop } from "@/components/ScrollToTop";

const NotFound = lazy(() => import("@/pages/NotFound"));

// All pages lazy-loaded for optimal code splitting
const SiteHome = lazy(() => import("./pages/SiteHome"));
const Landing = lazy(() => import("./pages/Landing"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const LoginCallback = lazy(() => import("./pages/LoginCallback"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Explore = lazy(() => import("./pages/Explore"));
const SearchPage = lazy(() => import("./pages/Search"));
const PlaceDetail = lazy(() => import("./pages/PlaceDetail"));
const Favorites = lazy(() => import("./pages/Favorites"));
const RoutesPage = lazy(() => import("./pages/Routes"));
const RouteDetail = lazy(() => import("./pages/RouteDetail"));
const EventsList = lazy(() => import("./pages/Events").then(m => ({ default: m.EventsList })));
const EventDetail = lazy(() => import("./pages/Events").then(m => ({ default: m.EventDetail })));
const Offers = lazy(() => import("./pages/Offers"));
const Notifications = lazy(() => import("./pages/Notifications"));
const TransportPage = lazy(() => import("./pages/TransportPage"));
const Drivers = lazy(() => import("./pages/Drivers"));
const RegisterDriver = lazy(() => import("./pages/RegisterDriver"));
const DriverDetail = lazy(() => import("./pages/DriverDetail"));
const Guide = lazy(() => import("./pages/Guide"));
const ReceptivoDetail = lazy(() => import("./pages/ReceptivoDetail"));
const GuideDetail = lazy(() => import("./pages/GuideDetail"));
const Partnerships = lazy(() => import("./pages/Partnerships"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const CMSLogin = lazy(() => import("./pages/CMSLogin"));
const CMSDashboard = lazy(() => import("./pages/CMSDashboard"));
const CMSEditor = lazy(() => import("./pages/CMSEditor"));
const Admin = lazy(() => import("./pages/Admin"));
const SiteWhatToDo = lazy(() => import("./pages/SiteWhatToDo"));
const SiteSEOPages = lazy(() => import("./pages/SiteSEOPages"));
const CMSCategoryPage = lazy(() => import("./pages/CMSCategoryPage"));
const SiteSecondaryPages = lazy(() => import("./pages/SiteSecondaryPages"));
const SiteBlog = lazy(() => import("./pages/SiteBlog"));
const SiteBlogPost = lazy(() => import("./pages/SiteBlogPost"));
const MapPage = lazy(() => import("./pages/MapPage"));

// Lazy loaded - heavy app shell components
const PWAInstallPrompt = lazy(() => import("./components/PWAInstallPrompt").then(m => ({ default: m.PWAInstallPrompt })));
const SplashScreen = lazy(() => import("./components/SplashScreen").then(m => ({ default: m.SplashScreen })));
const NotificationCenter = lazy(() => import("./components/NotificationCenter").then(m => ({ default: m.NotificationCenter })));
const AdminGuard = lazy(() => import("./components/AdminGuard"));

// Loading fallback — dark green matches SiteHome bg so no white flash
function SiteHomeFallback() {
  return (
    <div
      style={{ minHeight: "100vh", background: "#00251A" }}
      role="status"
      aria-live="polite"
      aria-label="Carregando"
    />
  );
}

// Generic fallback for app pages
function LoadingFallback() {
  return (
    <div
      className="oranje-app min-h-screen flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Carregando conteúdo"
    >
      <div className="text-center">
        <div
          className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-oranje-orange"
          aria-hidden="true"
        />
        <p className="mt-4" style={{ color: "#C8C5C0" }}>Carregando...</p>
      </div>
    </div>
  );
}

/**
 * Wrapper that forces detail pages to fully remount when the param changes.
 * Without this, React reuses the same component instance and stale state
 * can persist across different detail pages.
 */
function PlaceDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PlaceDetail key={id} />
    </Suspense>
  );
}

function RouteDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouteDetail key={id} />
    </Suspense>
  );
}

function EventDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EventDetail key={id} />
    </Suspense>
  );
}

function DriverDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DriverDetail key={id} />
    </Suspense>
  );
}

function GuideDetailWrapper() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GuideDetail key={slug} />
    </Suspense>
  );
}

function BlogPostWrapper() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SiteBlogPost key={slug} />
    </Suspense>
  );
}

function Router() {
  // Automatic GA4 pageview tracking on route changes
  usePageTracking();

  return (
      <>
      <ScrollToTop />
      <Routes>
        {/* Site Pages - NO PWA, Splash, or Notifications */}
        <Route path="/" element={<Suspense fallback={<SiteHomeFallback />}><SiteHome /></Suspense>} />
        <Route path="/o-que-fazer-em-holambra" element={<Suspense fallback={<LoadingFallback />}><SiteWhatToDo /></Suspense>} />
        <Route path="/melhores-cafes-de-holambra" element={<Suspense fallback={<LoadingFallback />}><CMSCategoryPage /></Suspense>} />
        <Route path="/melhores-restaurantes-de-holambra" element={<Suspense fallback={<LoadingFallback />}><CMSCategoryPage /></Suspense>} />
        <Route path="/bares-e-drinks-em-holambra" element={<Suspense fallback={<LoadingFallback />}><CMSCategoryPage /></Suspense>} />
        <Route path="/onde-tirar-fotos-em-holambra" element={<Suspense fallback={<LoadingFallback />}><CMSCategoryPage /></Suspense>} />
        <Route path="/eventos-em-holambra" element={<Suspense fallback={<LoadingFallback />}><CMSCategoryPage /></Suspense>} />
        <Route path="/roteiro-1-dia-em-holambra" element={<Suspense fallback={<LoadingFallback />}><SiteSEOPages /></Suspense>} />
        <Route path="/roteiros" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/mapa" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/parceiros" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/seja-um-parceiro" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/sobre" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/contato" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/privacidade" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/termos" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/blog" element={<Suspense fallback={<LoadingFallback />}><SiteBlog /></Suspense>} />
        <Route path="/blog/:slug" element={<BlogPostWrapper />} />
        {/* Landing Page */}
        <Route path="/landing" element={<Suspense fallback={<LoadingFallback />}><Landing /></Suspense>} />
        {/* App Routes - WITH PWA, Splash, and Notifications */}
        <Route path="/app">
          <Route path="onboarding" element={<Suspense fallback={<LoadingFallback />}><Onboarding /></Suspense>} />
          <Route path="login" element={<Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
          <Route path="login/callback" element={<Suspense fallback={<LoadingFallback />}><LoginCallback /></Suspense>} />
          <Route path="explorar/:slug" element={<Suspense fallback={<LoadingFallback />}><Explore /></Suspense>} />
          <Route path="explorar" element={<Suspense fallback={<LoadingFallback />}><Explore /></Suspense>} />
          <Route path="busca" element={<Suspense fallback={<LoadingFallback />}><SearchPage /></Suspense>} />
          <Route path="lugar/:id" element={<PlaceDetailWrapper />} />
          <Route path="favoritos" element={<Suspense fallback={<LoadingFallback />}><Favorites /></Suspense>} />
          <Route path="roteiros" element={<Suspense fallback={<LoadingFallback />}><RoutesPage /></Suspense>} />
          <Route path="roteiro/:id" element={<RouteDetailWrapper />} />
          <Route path="receptivo/:slug" element={<Suspense fallback={<LoadingFallback />}><ReceptivoDetail /></Suspense>} />
          <Route path="eventos" element={<Suspense fallback={<LoadingFallback />}><EventsList /></Suspense>} />
          <Route path="evento/:id" element={<EventDetailWrapper />} />
          <Route path="ofertas" element={<Suspense fallback={<LoadingFallback />}><Offers /></Suspense>} />
          <Route path="notificacoes" element={<Suspense fallback={<LoadingFallback />}><Notifications /></Suspense>} />
          <Route path="mapa" element={<Suspense fallback={<LoadingFallback />}><MapPage /></Suspense>} />
          <Route path="transporte" element={<Suspense fallback={<LoadingFallback />}><TransportPage /></Suspense>} />
          <Route path="motoristas" element={<Suspense fallback={<LoadingFallback />}><Drivers /></Suspense>} />
          <Route path="cadastrar-motorista" element={<Suspense fallback={<LoadingFallback />}><RegisterDriver /></Suspense>} />
          <Route path="motorista/:id" element={<DriverDetailWrapper />} />
          <Route index element={<Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary FallbackComponent={() => null}><SplashScreen /></ErrorBoundary>
            <ErrorBoundary FallbackComponent={() => null}><PWAInstallPrompt /></ErrorBoundary>
            <ErrorBoundary FallbackComponent={() => null}><NotificationCenter /></ErrorBoundary>
            <Home />
          </Suspense>} />
        </Route>
        <Route path="/guia" element={<Suspense fallback={<LoadingFallback />}><Guide /></Suspense>} />
        <Route path="/guia/:slug" element={<GuideDetailWrapper />} />
        <Route path="/parcerias" element={<Suspense fallback={<LoadingFallback />}><Partnerships /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<LoadingFallback />}><AdminLogin /></Suspense>} />
        <Route path="/admin/login" element={<Suspense fallback={<LoadingFallback />}><AdminLogin /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<LoadingFallback />}><AdminGuard><CMSDashboard /></AdminGuard></Suspense>} />
        <Route path="/admin/conteudo" element={<Suspense fallback={<LoadingFallback />}><AdminGuard><CMSEditor /></AdminGuard></Suspense>} />
        <Route path="/app/admin" element={<Suspense fallback={<LoadingFallback />}><AdminGuard><Admin /></AdminGuard></Suspense>} />
        <Route path="/app/adm" element={<Suspense fallback={<LoadingFallback />}><AdminGuard><Admin /></AdminGuard></Suspense>} />
        <Route path="/adm" element={<Suspense fallback={<LoadingFallback />}><AdminGuard><CMSDashboard /></AdminGuard></Suspense>} />
        <Route path="/adm/conteudo" element={<Suspense fallback={<LoadingFallback />}><AdminGuard><CMSEditor /></AdminGuard></Suspense>} />
        <Route path="/adm/login" element={<Suspense fallback={<LoadingFallback />}><AdminLogin /></Suspense>} />
        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: { error?: unknown; resetErrorBoundary?: () => void }) {
  // Log error for debugging but don't block the user
  if (error) console.error("[ErrorFallback]", error);

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        maxWidth: 360,
        background: "rgba(0, 37, 26, 0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(230,81,0,0.25)",
        borderRadius: "1rem",
        padding: "1rem 1.25rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>🌷</span>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#E8E6E3", fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>
            Algo inesperado aconteceu
          </p>
          <p style={{ color: "#C8C5C0", fontSize: "0.75rem", margin: "0.25rem 0 0.75rem" }}>
            Você pode continuar navegando normalmente.
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => { resetErrorBoundary?.(); }}
              style={{
                padding: "0.375rem 1rem",
                borderRadius: "0.5rem",
                background: "#E65100",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              Continuar
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              style={{
                padding: "0.375rem 1rem",
                borderRadius: "0.5rem",
                background: "rgba(230,81,0,0.12)",
                color: "#E65100",
                border: "1px solid rgba(230,81,0,0.3)",
                fontWeight: 600,
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              Ir ao Início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider defaultTheme="dark" switchable={true}>
        <TooltipProvider>
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
