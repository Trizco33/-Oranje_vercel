/**
 * Google Analytics 4 - Módulo de integração
 *
 * O script gtag.js é carregado globalmente via client/index.html
 * com o Measurement ID G-00YQZ6WTKZ e send_page_view: false.
 *
 * Este módulo expõe helpers tipados para disparar eventos no GA4:
 * - trackPageView: chamado automaticamente pelo hook usePageTracking
 * - trackEvent: para eventos customizados opcionais
 */

// Tipagem global do gtag (já inicializado no index.html)
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Dispara um evento page_view no GA4.
 * Chamado automaticamente pelo hook usePageTracking() a cada mudança de rota.
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
}

/**
 * Dispara um evento customizado no GA4.
 *
 * @example
 * trackEvent('cta_click', { button_text: 'Abrir App', location: 'hero' });
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, params);
}
