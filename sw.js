const CACHE = "thought-to-video-v5";
const ASSETS = ["./", "./index.html", "./content-engine.js", "./manifest.json"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE)
    .then(cache => cache.addAll(ASSETS))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys
      .filter(key => key.startsWith("thought-to-video-") && key !== CACHE)
      .map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" ||
      new URL(event.request.url).origin !== self.location.origin) return;
  // Always check for the latest page; use the cached shell only when offline.
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, { cache: "no-store" });
        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put("./index.html", response.clone());
        }
        return response;
      } catch {
        return caches.match("./index.html");
      }
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
});
