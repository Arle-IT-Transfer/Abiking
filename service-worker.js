const CACHE = "abiking-v1";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// instalo dhe ruaj skedarët
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// pastro cache-t e vjetra
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// shërbe nga cache; Firebase gjithmonë nga rrjeti
self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  // mos ruaj thirrjet e Firebase (duhet lidhje e drejtpërdrejtë)
  if (url.includes("firebaseio") || url.includes("firebasedatabase") || url.includes("gstatic")) {
    return; // le të shkojë direkt në rrjet
  }
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
