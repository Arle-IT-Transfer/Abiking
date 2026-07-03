const CACHE = "abiking-v18";
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
// STRATEGJI: rrjeti-i-pari për index.html (që ndryshimet të duken menjëherë),
// cache si rezervë kur s'ka internet.
self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  // mos ruaj thirrjet e Firebase (duhet lidhje e drejtpërdrejtë)
  if (url.includes("firebaseio") || url.includes("firebasedatabase") || url.includes("gstatic")) {
    return; // le të shkojë direkt në rrjet
  }
  // për faqen kryesore: provo rrjetin i pari, pastaj cache
  if (e.request.mode === "navigate" || url.endsWith("index.html") || url.endsWith("/")) {
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return resp;
        })
        .catch(() => caches.match(e.request).then((c) => c || caches.match("./index.html")))
    );
    return;
  }
  // pjesa tjetër: cache i pari, pastaj rrjeti
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
