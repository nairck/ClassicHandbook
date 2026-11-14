// The page's own service worker: it makes the page cross-origin isolated, which GitHub Pages can't (it sends no
// headers of a site's choosing). Isolated, the page may share memory between its workers (SharedArrayBuffer), so the
// readers' Python waits on ONNX Runtime Web's answers with Atomics.wait (index.html, worker-src's ortWait) in every
// browser, JS promise integration or not.
// It adds two headers to the site's own pages and workers as they come, and nothing else: no cache, every request
// goes to the network as it would without it.
// - Cross-Origin-Opener-Policy: same-origin (the page in a browsing context group of its own);
// - Cross-Origin-Embedder-Policy: what it was registered with (?coep=): credentialless where the browser has it
//   (Chrome, Edge, Firefox: another site's pictures still load, without cookies), else require-corp (Safari: the
//   page's other sites, Pyodide's CDN and the database's, send Cross-Origin-Resource-Policy: cross-origin).
// index.html registers it and reloads once, the first time, for the page to come through it.
const COEP = new URL(self.location.href).searchParams.get("coep") === "require-corp" ? "require-corp" : "credentialless";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (new URL(r.url).origin !== self.location.origin) return;       // (another site's: as the browser fetches it)
  if (r.mode !== "navigate" && r.destination !== "worker" && r.destination !== "sharedworker") return;
  e.respondWith(fetch(r).then((res) => {
    if (res.status === 0 || res.type === "opaqueredirect") return res;
    const headers = new Headers(res.headers);
    headers.set("Cross-Origin-Opener-Policy", "same-origin");
    headers.set("Cross-Origin-Embedder-Policy", COEP);
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }));
});
