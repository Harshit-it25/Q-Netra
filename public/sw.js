/**
 * Q-NETRA AI — PWA Service Worker (Resilient Edition)
 * 
 * Strict Privacy & Freshness Rules:
 * - Navigation (HTML) ALWAYS fetches fresh over the network to prevent outdated JS chunk hash collisions.
 * - Dynamic /api/* routes (payment evaluations, risk graphs, forensic dossiers) are NEVER cached.
 * - Stale caches are purged on activation.
 */

const CACHE_NAME = 'qnetra-static-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. PRIVACY GUARD: NEVER cache dynamic API calls
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. FRESHNESS GUARD: HTML Navigation MUST always fetch fresh over network
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // 3. Static assets: Network first, with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

