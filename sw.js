/* Grand Fable GP standalone service worker. Scope: this folder only ('./').
   Shares an origin with the Learning Zone, so it ONLY ever creates / deletes caches whose name starts with "gfgp-". */
const VERSION = "64abac7-202611091533";   // tools/build_standalone.sh writes the Learning Zone commit + date here on every build
const CACHE = "gfgp-" + VERSION;
const CORE = ["./", "./index.html", "./app-shim.js", "./race3d.js", "./manifest.webmanifest", "./vendor/three.r128.min.js", "./assets/vendor/GLTFLoader.r128.js",
  "./icon-180.png", "./icon-192.png", "./icon-512.png", "./assets/world/title.webp"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(f => new Request(f, {cache: "reload"})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("gfgp-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (!req.url.startsWith(self.registration.scope)) return;          // never answer for the Learning Zone or anything else on this origin
  const url = new URL(req.url);
  if (/\.(mp4|webm|m4v)$/.test(url.pathname)) return;                 // videos stream from the network (Safari range requests)
  const shell = req.mode === "navigate" || /\/(index\.html)?$/.test(url.pathname) || /\.(js|webmanifest)$/.test(url.pathname);
  if (shell) {                                                          // network-first: updates show on the next open; cache = offline fallback
    e.respondWith(fetch(req, {cache: "no-cache"}).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return r; })
      .catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || (req.mode === "navigate" ? caches.match("./index.html") : Response.error()))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {   // models, textures, pictures: cache-first (their URLs carry ?v= busters)
    if (r.ok && r.status === 200) { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return r; })));
});
