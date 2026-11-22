/* Maths 7 Lab — service worker: works offline after the first visit and opens instantly afterwards.
   Page (navigation): network first, cached copy when offline. Scripts/styles/audio/fonts: cache, refreshed in the background. */
const VER = 'm7-v11';
const CORE = ['./', 'index.html', 'favicon.svg', 'og.png', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VER);
    await c.addAll(CORE).catch(() => {});
    // precache every versioned script/style the page references, so the app works offline straight away
    try {
      const html = await (await fetch('index.html', { cache: 'no-cache' })).text();
      const urls = [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"]+)"/g)].map((m) => m[1]);
      await c.addAll(urls);
    } catch (err) {}
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VER) await caches.delete(k);
    await self.clients.claim();
  })());
});

const FONT = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return; // media range requests go straight to the network
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  if (!same && !FONT.test(req.url)) return; // chatbot, translation etc. are never cached

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) (await caches.open(VER)).put('index.html', res.clone());
        return res;
      } catch (err) {
        return (await caches.match('index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const c = await caches.open(VER);
    const hit = await c.match(req);
    const net = fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque') && res.status !== 206) c.put(req, res.clone()).catch(() => {});
      return res;
    }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || Response.error();
  })());
});
