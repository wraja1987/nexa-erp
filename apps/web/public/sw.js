const VERSION = 'v1-phase3';
const CORE = [
  '/',
  '/manifest.json',
  '/public/logo-optra.png'
];
const ROUTES = [
  '/dashboard', '/dashboard/help', '/dashboard/orders', '/dashboard/products', '/system/ai-opportunities'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll([...CORE, ...ROUTES])).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const shouldCache = req.url.includes('/dashboard') || req.url.includes('/system') || req.url.includes('/api/auth') || /\.(css|js|png|svg|jpg)$/.test(req.url);
      if (shouldCache) {
        const copy = res.clone();
        caches.open(VERSION).then(cache => cache.put(req, copy));
      }
      return res;
    }).catch(()=> cached))
  );
});

const CACHE = 'optra-v2';
const OFFLINE_URLS = [
  '/',
  '/manifest.json',
  '/public/logo-optra.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_URLS)));
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match('/'));
    })
  );
});


