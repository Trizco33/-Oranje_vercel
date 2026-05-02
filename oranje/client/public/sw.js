// ────────────────────────────────────────────────────────────────────────────
// Oranje Service Worker — v4 (kill-switch + clean cache)
//
// Histórico do bug: o SW v3 cacheava HTML em todas as navegações. Quando o
// bundle JS mudava (deploy/HMR), o HTML cacheado apontava para chunks que
// não existiam mais — usuário ficava preso em telas antigas (ex.: "Categoria
// não encontrada" mesmo com a categoria voltando OK na API).
//
// Esta versão:
//   1) Pula waiting + claim imediato → ativa assim que carrega
//   2) Apaga TODOS os caches antigos (oranje-v1/v2/v3)
//   3) Não cacheia mais nada — sempre rede direto (network-only passthrough)
//   4) Notifica páginas abertas para se recarregarem uma vez
//
// Resultado: o celular do usuário, na próxima visita, baixa este SW, limpa o
// cache, e a partir daí busca tudo na rede como app web normal.
// ────────────────────────────────────────────────────────────────────────────

const CACHE_NAME = 'oranje-v4-cleanup';

self.addEventListener('install', (event) => {
  // Não pré-cacheia nada. Ativa imediatamente.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // 1) Apaga TODOS os caches (legados oranje-v1, v2, v3, etc.)
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));

    // 2) Toma controle de todas as abas/PWA imediatamente
    await self.clients.claim();

    // 3) Notifica clientes para fazerem 1 reload (pegar bundle fresco)
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      try {
        client.postMessage({ type: 'SW_CLEANUP_RELOAD' });
      } catch (e) {}
    }
  })());
});

// ── Fetch: passthrough total. Não cacheia, não intercepta nada. ────────────
// (Sem listener de fetch = browser usa rede direto. Mantido vazio por clareza.)
self.addEventListener('fetch', () => {
  // intencionalmente sem event.respondWith → browser usa rede direto
});

// ── Push Notifications (mantido funcional) ─────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Oranje', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Oranje';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    data: { url: data.url || '/app' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/app';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
