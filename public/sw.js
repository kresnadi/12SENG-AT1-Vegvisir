const SHELL = "vv-shell-v1";
const ASSETS = ["/", "/game", "/logo.svg", "/bg.svg", "/icons/timer.svg", "/icons/menu.svg", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(SHELL)
      .then((c) => Promise.allSettled(ASSETS.map((a) => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("vv-shell-") && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const store = (request, res) => {
  if (res.ok) {
    const copy = res.clone();
    caches.open(SHELL).then((c) => c.put(request, copy));
  }
  return res;
};

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (url.pathname.startsWith("/panos/")) {
    e.respondWith(caches.match(request).then((r) => r || fetch(request)));
    return;
  }

  if (url.pathname.startsWith("/data/") || request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((res) => store(request, res))
        .catch(() => caches.match(request).then((r) => r || caches.match("/")))
    );
    return;
  }

  e.respondWith(
    caches.match(request).then((cached) => {
      const net = fetch(request).then((res) => store(request, res)).catch(() => cached);
      return cached || net;
    })
  );
});
