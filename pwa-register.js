(() => {
  if (!("serviceWorker" in navigator)) return;
  const script = document.currentScript;
  if (!script) return;
  const root = new URL(".", script.src);
  const manifest = document.querySelector('link[rel="manifest"]');
  if (manifest) manifest.href = new URL("manifest.webmanifest", root).href;
  navigator.serviceWorker.register(new URL("sw.js", root), {
    scope: root.pathname,
    updateViaCache: "none"
  }).then((registration) => {
    registration.update().catch((error) => {
      console.warn("PWA service worker update failed", error);
    });
  }).catch((error) => console.warn("PWA service worker registration failed", error));
})();
