// Service worker — required for PWA installability
// Chrome requires a fetch handler to consider the app installable
self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", () => self.clients.claim())
self.addEventListener("fetch", (event) => event.respondWith(fetch(event.request)))
