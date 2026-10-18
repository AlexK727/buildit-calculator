// Сервис-воркер: страница работает без интернета.
// Открывается из кэша сразу, а свежая версия подгружается в фоне (появится при следующем запуске).
const V = 'buildit-1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(V).then(async cache => {
      const hit = await cache.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request)
        .then(r => { if (r && r.ok) cache.put(e.request, r.clone()); return r; })
        .catch(() => hit);
      return hit || net;
    })
  );
});
