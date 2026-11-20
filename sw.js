const CACHE_NAME = 'rnpg-kontrolle-v4';
const BASE = '/RNPGKontrolle';

self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Never cache index.html — always fetch fresh
  if (url.pathname === BASE + '/' || url.pathname === BASE + '/index.html' || url.pathname.endsWith('/')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Cache-first for JS bundles and assets
  if (url.pathname.includes('/_expo/') || url.pathname.includes('/assets/')) {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(resp => {
            cache.put(e.request, resp.clone());
            return resp;
          });
        })
      )
    );
    return;
  }
  // Network-first for everything else
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
