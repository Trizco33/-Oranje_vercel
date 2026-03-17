/**
 * Google Analytics 4 - Integration Module
 * 
 * Configuração:
 * 1. Defina a variável de ambiente VITE_GA4_MEASUREMENT_ID no .env
 *    Exemplo: VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
 * 
 * 2. O script do GA4 é injetado automaticamente via initGA4()
 *    chamado em main.tsx na inicialização do app.
 * 
 * 3. O tracking de pageviews é automático via usePageTracking()
 *    hook integrado no App.tsx.
 * 
 * 4. Eventos customizados podem ser disparados via trackEvent().
 * 
 * Eventos rastreados automaticamente:
 * - page_view: Todas as navegações de rota
 * - cta_click: Cliques em botões de CTA importantes
 * - navigation: Navegação principal do site
 * - app_open: Abertura do app (/app)
 * - pwa_install: Instalação do PWA
 * - search: Buscas realizadas
 * - place_view: Visualização de lugares
 * - event_view: Visualização de eventos
 * - contact_click: Cliques em links de contato
 */

// GA4 Measurement ID from environment variable
const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined;

// Extend window for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Initialize Google Analytics 4 by injecting the gtag.js script.
 * Should be called once at app startup (main.tsx).
 */
export function initGA4(): void {
  if (!GA4_ID) {
    if (import.meta.env.DEV) {
      console.info('[GA4] VITE_GA4_MEASUREMENT_ID not set. Analytics disabled.');
    }
    return;
  }

  // Avoid double initialization
  if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) {
    return;
  }

  // Inject gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, {
    send_page_view: false, // We handle pageviews manually for SPA
  });
}

/**
 * Track a pageview event.
 * Called automatically by usePageTracking() hook.
 */
export function trackPageView(path: string, title?: string): void {
  if (!GA4_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
}

/**
 * Track a custom event.
 * 
 * @param eventName - The event name (e.g., 'cta_click', 'search')
 * @param params - Additional event parameters
 * 
 * @example
 * trackEvent('cta_click', { button_text: 'Abrir App', location: 'hero' });
 * trackEvent('search', { search_term: 'restaurantes' });
 * trackEvent('place_view', { place_id: '123', place_name: 'Restaurante X' });
 */
export function trackEvent(eventName: string, params?: Record<string, string | number | boolean>): void {
  if (!GA4_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, params);
}
