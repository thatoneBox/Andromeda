importScripts('/controller/controller.sw.js');

self.addEventListener('install', () => {
  // immediately take control so demo pages can register and use the SW
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

addEventListener('fetch', (e) => {
  try {
    if ((self as any).$scramjetController && (self as any).$scramjetController.shouldRoute(e)) {
      e.respondWith((self as any).$scramjetController.route(e));
      return;
    }
  } catch (err) {
    // best-effort: don't break the page if controller isn't available yet
    // fall through to default network behaviour
  }

  // default: let the request go to network
});
