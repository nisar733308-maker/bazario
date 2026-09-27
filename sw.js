const CACHE_NAME = 'bazario-v1';
const STATIC_CACHE = [
  './', './index.html', './post.html', './ad.html', './myads.html', './admin.html',
  './css/style.css', './js/app.js', './js/firebaseConfig.js', './manifest.json',
  './icon-192.png', './icon-512.png'
];
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE_NAME).then(c => c.addAll(STATIC_CACHE)).then(() => self.skipWaiting())
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
