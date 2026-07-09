// Minimal PWA service worker (F-12): caches the app shell so the SPA still
// boots offline, and serves the last-known response for GET /api/* reads
// when the network is unavailable — mutations (non-GET) always hit the
// network directly and are never served from cache.
const SHELL_CACHE = "erp-shell-v1";
const API_CACHE = "erp-api-v1";
const SHELL_ASSETS = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== API_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Navigation requests: network-first, fall back to the cached shell so
  // reloading any client-side route works offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/"))
    );
    return;
  }

  // API reads: network-first, cache the successful response, fall back to
  // the last cached copy when offline. Mutations pass straight through.
  if (url.pathname.startsWith("/api/")) {
    if (request.method !== "GET") return;

    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(API_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets (built JS/CSS): cache-first, refresh in the background.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
