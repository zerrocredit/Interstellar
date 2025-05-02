importScripts("/assets/dyn/config.js?v=10-02-2024");
importScripts("/assets/dyn/worker.js?v=10-02-2024");
importScripts("/assets/ultra/bundle.js?v=10-02-2024");
importScripts("/assets/ultra/config.js?v=10-02-2024");
importScripts(__uv$config.sw || "/assets/ultra/sw.js?v=10-02-2024");

const uv = new UVServiceWorker();
const dynamic = new Dynamic();

const userKey = new URL(location).searchParams.get("userkey");
self.dynamic = dynamic;

self.addEventListener("fetch", event => {
  event.respondWith((async () => {
    // First, let Dynamic handle its routes:
    if (await dynamic.route(event)) {
      return await dynamic.fetch(event);
    }

    // Then intercept our /a/ prefix with uv.fetch, wrapped in try/catch:
    if (event.request.url.startsWith(`${location.origin}/a/`)) {
      try {
        return await uv.fetch(event);
      } catch (err) {
        console.error("uv.fetch failed:", err);
        return new Response("Proxy error", {
          status: 502,
          statusText: "Bad Gateway",
          headers: { "Content-Type": "text/plain" }
        });
      }
    }

    // Fallback to a normal fetch for everything else:
    return await fetch(event.request);
  })());
});
