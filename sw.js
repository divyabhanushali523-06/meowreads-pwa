self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('meowreads-v1').then((cache) => {
      return cache.addAll(['/writer_dashboard.html']);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});