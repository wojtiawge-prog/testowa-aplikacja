const CACHE = "zlommet-v6";
const SHELL = ["./", "./index.html", "./app.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => {}));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("./index.html")));
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(caches.match(req).then((c) => c || fetch(req).then((r) => { const cp = r.clone(); caches.open(CACHE).then((ch) => ch.put(req, cp)); return r; })));
    return;
  }
  // CDN (esm.sh) — stale-while-revalidate, działa też offline po pierwszym uruchomieniu
  e.respondWith(caches.match(req).then((c) => {
    const f = fetch(req).then((r) => { if (r && r.status === 200) { const cp = r.clone(); caches.open(CACHE).then((ch) => ch.put(req, cp)); } return r; }).catch(() => c);
    return c || f;
  }));
});
