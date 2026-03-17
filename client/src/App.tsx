import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { SplashScreen } from "./components/SplashScreen";
import { NotificationCenter } from "./components/NotificationCenter";
import AdminGuard from "./components/AdminGuard";

// Eagerly loaded - critical pages that appear immediately
import LandingNew from "./pages/LandingNew";
import LandingProposal from "./pages/LandingProposal";
import Home from "./pages/Home";
import Login from "./pages/Login";
import LoginCallback from "./pages/LoginCallback";
import Onboarding from "./pages/Onboarding";
import SiteHome from "./pages/SiteHome";

// Lazy loaded - secondary pages loaded on demand
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
const GuideDetail = lazy(() => import("./pages/GuideDetail"));
const Partnerships = lazy(() => import("./pages/Partnerships"));
const CMSLogin = lazy(() => import("./pages/CMSLogin"));
const CMSDashboard = lazy(() => import("./pages/CMSDashboard"));
const CMSEditor = lazy(() => import("./pages/CMSEditor"));
const Admin = lazy(() => import("./pages/Admin"));
const SiteWhatToDo = lazy(() => import("./pages/SiteWhatToDo"));
const SiteSEOPages = lazy(() => import("./pages/SiteSEOPages"));
const SiteSecondaryPages = lazy(() => import("./pages/SiteSecondaryPages"));
const SiteBlog = lazy(() => import("./pages/SiteBlog"));
const SiteBlogPost = lazy(() => import("./pages/SiteBlogPost"));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="oranje-app min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-oranje-orange"></div>
        <p className="mt-4" style={{ color: "#C8C5C0" }}>Carregando...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
      <Routes>
        {/* Site Pages - NO PWA, Splash, or Notifications */}
        <Route path="/" element={<SiteHome />} />
        <Route path="/o-que-fazer-em-holambra" element={<Suspense fallback={<LoadingFallback />}><SiteWhatToDo /></Suspense>} />
        <Route path="/melhores-cafes-de-holambra" element={<Suspense fallback={<LoadingFallback />}><SiteSEOPages /></Suspense>} />
        <Route path="/melhores-restaurantes-de-holambra" element={<Suspense fallback={<LoadingFallback />}><SiteSEOPages /></Suspense>} />
        <Route path="/bares-e-drinks-em-holambra" element={<Suspense fallback={<LoadingFallback />}><SiteSEOPages /></Suspense>} />
        <Route path="/roteiro-1-dia-em-holambra" element={<Suspense fallback={<LoadingFallback />}><SiteSEOPages /></Suspense>} />
        <Route path="/onde-tirar-fotos-em-holambra" element={<Suspense fallback={<LoadingFallback />}><SiteSEOPages /></Suspense>} />
        <Route path="/eventos-em-holambra" element={<Suspense fallback={<LoadingFallback />}><SiteSEOPages /></Suspense>} />
        <Route path="/roteiros" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/mapa" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/parceiros" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/seja-um-parceiro" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/sobre" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/contato" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/privacidade" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/termos" element={<Suspense fallback={<LoadingFallback />}><SiteSecondaryPages /></Suspense>} />
        <Route path="/blog" element={<Suspense fallback={<LoadingFallback />}><SiteBlog /></Suspense>} />
        <Route path="/blog/:slug" element={<Suspense fallback={<LoadingFallback />}><SiteBlogPost /></Suspense>} />
        {/* Legacy Landing */}
        <Route path="/landing" element={<LandingNew />} />
        {/* Landing Proposal - Redesign Preview */}
        <Route path="/landing-proposal" element={<LandingProposal />} />
        {/* App Routes - WITH PWA, Splash, and Notifications */}
        <Route path="/app">
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="login" element={<Login />} />
          <Route path="login/callback" element={<LoginCallback />} />
          <Route path="explorar/:slug" element={<Suspense fallback={<LoadingFallback />}><Explore /></Suspense>} />
          <Route path="explorar" element={<Suspense fallback={<LoadingFallback />}><Explore /></Suspense>} />
          <Route path="busca" element={<Suspense fallback={<LoadingFallback />}><SearchPage /></Suspense>} />
          <Route path="lugar/:id" element={<Suspense fallback={<LoadingFallback />}><PlaceDetail /></Suspense>} />
          <Route path="favoritos" element={<Suspense fallback={<LoadingFallback />}><Favorites /></Suspense>} />
          <Route path="roteiros" element={<Suspense fallback={<LoadingFallback />}><RoutesPage /></Suspense>} />
          <Route path="roteiro/:id" element={<Suspense fallback={<LoadingFallback />}><RouteDetail /></Suspense>} />
          <Route path="eventos" element={<Suspense fallback={<LoadingFallback />}><EventsList /></Suspense>} />
          <Route path="evento/:id" element={<Suspense fallback={<LoadingFallback />}><EventDetail /></Suspense>} />
          <Route path="ofertas" element={<Suspense fallback={<LoadingFallback />}><Offers /></Suspense>} />
          <Route path="notificacoes" element={<Suspense fallback={<LoadingFallback />}><Notifications /></Suspense>} />
          <Route path="transporte" element={<Suspense fallback={<LoadingFallback />}><TransportPage /></Suspense>} />
          <Route path="motoristas" element={<Suspense fallback={<LoadingFallback />}><Drivers /></Suspense>} />
          <Route path="cadastrar-motorista" element={<Suspense fallback={<LoadingFallback />}><RegisterDriver /></Suspense>} />
          <Route path="motorista/:id" element={<Suspense fallback={<LoadingFallback />}><DriverDetail /></Suspense>} />
          <Route index element={<>
            <SplashScreen />
            <PWAInstallPrompt />
            <NotificationCenter />
            <Home />
          </>} />
        </Route>
        <Route path="/guia" element={<Suspense fallback={<LoadingFallback />}><Guide /></Suspense>} />
        <Route path="/guia/:slug" element={<Suspense fallback={<LoadingFallback />}><GuideDetail /></Suspense>} />
        <Route path="/parcerias" element={<Suspense fallback={<LoadingFallback />}><Partnerships /></Suspense>} />
        <Route path="/admin/login" element={<Suspense fallback={<LoadingFallback />}><CMSLogin /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<LoadingFallback />}><CMSDashboard /></Suspense>} />
        <Route path="/admin/conteudo" element={<Suspense fallback={<LoadingFallback />}><CMSEditor /></Suspense>} />
        <Route path="/app/admin" element={<AdminGuard><Suspense fallback={<LoadingFallback />}><Admin /></Suspense></AdminGuard>} />
        <Route path="/adm" element={<Suspense fallback={<LoadingFallback />}><CMSDashboard /></Suspense>} />
        <Route path="/adm/conteudo" element={<Suspense fallback={<LoadingFallback />}><CMSEditor /></Suspense>} />
        <Route path="/adm/login" element={<Suspense fallback={<LoadingFallback />}><CMSLogin /></Suspense>} />
        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}

function ErrorFallback() {
  return (
    <div className="oranje-app min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: "#E8E6E3" }}>Algo deu errado</h1>
        <p style={{ color: "#C8C5C0" }}>Por favor, recarregue a página.</p>
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
