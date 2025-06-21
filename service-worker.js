const CACHE_NAME = "disruptor-cache-v1";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/assets/icons/icon-192-dark.png",
  "/assets/icons/icon-512-dark.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
