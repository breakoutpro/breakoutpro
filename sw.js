self.addEventListener("install", function(e) {
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("push", function(e) {
  var data = {};
  try { data = e.data.json(); } catch(ex) {}
  e.waitUntil(
    self.registration.showNotification(data.title || "Breakout Pro Alert", {
      body: data.body || "New market alert",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      vibrate: [200, 100, 200],
      tag: data.tag || "bp-alert",
      requireInteraction: false,
    })
  );
});

self.addEventListener("notificationclick", function(e) {
  e.notification.close();
  e.waitUntil(
    self.clients.openWindow("/")
  );
});
