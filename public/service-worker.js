const CACHE_NAME = 'scoresheets-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css?v=5',
  '/app.js?v=23',
  '/icon.svg',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Always fetch fresh network first, fallback to cache
  e.respondWith(
    fetch(e.request).then((response) => {
      return response;
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});
