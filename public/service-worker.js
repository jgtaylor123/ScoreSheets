const CACHE_NAME = 'scoresheets-v64';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css?v=13',
  '/app.js?v=81',
  '/install.js?v=2',
  '/icon.svg',
  '/icon-180.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('scoresheets-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function navigationResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(request, { signal: controller.signal });
    if (!response.ok) throw new Error('Navigation failed');
    await cache.put('/', response.clone());
    return response;
  } catch (err) {
    // A match URL has query parameters; it uses the same app shell as '/'.
    const cached = await cache.match('/') || await cache.match('/index.html');
    if (cached) return cached;
    return new Response('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ScoreSheets</title><body style="background:#062e1c;color:white;font:18px system-ui;padding:32px"><h1>ScoreSheets</h1><p>Your connection is still recovering. Try again when you’re online.</p><button style="font:inherit;padding:12px 20px" onclick="location.reload()">Try again</button></body></html>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } finally {
    clearTimeout(timer);
  }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(navigationResponse(event.request));
    return;
  }
  const url = new URL(event.request.url);
  const isAppAsset = url.origin === self.location.origin && !url.pathname.startsWith('/__/');
  const isFirebaseSDK = url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/');
  if (!isAppAsset && !isFirebaseSDK) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Versioned assets are safe to serve immediately, even while a waking
    // device has a connection that hangs instead of failing outright.
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch (err) {
      return await cache.match(event.request) || Response.error();
    }
  })());
});
