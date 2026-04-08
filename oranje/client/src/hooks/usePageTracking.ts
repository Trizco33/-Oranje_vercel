import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

const SITE_URL = 'https://oranjeapp.com.br';

function updateCanonical(pathname: string): void {
  const existing = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const url = `${SITE_URL}${pathname}`;
  if (existing) {
    existing.href = url;
  } else {
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = url;
    document.head.appendChild(link);
  }
}

export function usePageTracking(): void {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
    updateCanonical(location.pathname);
  }, [location.pathname, location.search]);
}
