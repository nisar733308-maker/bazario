// ===== FCM background push (admin broadcasts) =====
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');
try {
  firebase.initializeApp({
    apiKey: "AIzaSyAPx_M0Et96w7qY9GB7bZk-wsxGnule9c8",
    projectId: "bazario-2920a",
    messagingSenderId: "275381335548",
    appId: "1:275381335548:web:85319a7fd932036c18ee79"
  });
  const fcmSw = firebase.messaging();
  fcmSw.onBackgroundMessage((payload) => {
    const n = (payload && payload.notification) || {};
    self.registration.showNotification(n.title || 'Bazario', {
      body: n.body || '', icon: './icon-192.png', badge: './icon-192.png',
      data: { url: (payload && payload.fcmOptions && payload.fcmOptions.link) || './index.html' }
    });
  });
} catch (e) {}

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './index.html';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if (c.url.includes('/bazario/')) return c.focus(); }
    return clients.openWindow(url);
  }));
});

const CACHE_NAME = 'bazario-v14';
const STATIC_CACHE = [
  './', './index.html', './post.html', './ad.html', './myads.html', './admin.html', './chat.html', './profile.html',
  './css/style.css', './js/app.js', './js/firebaseConfig.js', './manifest.json',
  './icon-192.png', './icon-512.png'
];
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE_NAME).then(c => Promise.all(STATIC_CACHE.map(u =>
    fetch(u + (u.indexOf('?') >= 0 ? '&' : '?') + 'swbust=' + CACHE_NAME, { cache: 'no-store' })
      .then(r => { if (r.ok) return c.put(u, r); })
      .catch(() => {})
  ))).then(() => self.skipWaiting())
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
