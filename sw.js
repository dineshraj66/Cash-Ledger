const CACHE = "cash-ledger-v1";
const BASE = "/Cash-Ledger";
const ASSETS = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
  `${BASE}/icon-192x192.png`,
  `${BASE}/icon-512x512.png`,
  `${BASE}/apple-touch-icon.png`,
];

// Install - cache all static assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener("fetch", (e) => {
  // Skip Firebase/external requests - only cache our own assets
  const url = new URL(e.request.url);
  if (!url.origin.includes(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache fresh copy of our assets
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match(`${BASE}/index.html`)))
  );
});
