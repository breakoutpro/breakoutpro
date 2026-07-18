// BreakoutPro - sw.js (PWA service worker)
// App-shell offline cache + push notifications. Network-first for API,
// cache-first for shell. Never serves fabricated market data (API not cached long).

var SHELL_CACHE = "bp-shell-v1";
var SHELL_ASSETS = ["/", "/index.html", "/manifest.json", "/favicon.ico"];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(SHELL_CACHE).then(function(c){ return c.addAll(SHELL_ASSETS).catch(function(){}); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if(k!=SHELL_CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Fetch strategy:
//  - API calls (/api/): network-first, do NOT cache market data long (freshness).
//  - navigation/shell/assets: cache-first with network fallback (offline support).
self.addEventListener("fetch", function(e) {
  var url = e.request.url;
  if(e.request.method != "GET"){ return; }
  if(url.indexOf("/api/") >= 0){
    // network-first; if offline, let the app's resilientFetch serve last-good.
    e.respondWith(fetch(e.request).catch(function(){ return new Response(JSON.stringify({ ok:false, reason:"offline" }), { headers:{ "Content-Type":"application/json" } }); }));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(resp){
        // cache same-origin static assets for offline
        try{
          if(resp && resp.status==200 && url.indexOf(self.location.origin)==0){
            var copy = resp.clone();
            caches.open(SHELL_CACHE).then(function(c){ c.put(e.request, copy); });
          }
        }catch(ex){}
        return resp;
      }).catch(function(){
        // offline fallback to shell for navigations
        if(e.request.mode=="navigate"){ return caches.match("/index.html"); }
      });
    })
  );
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
      requireInteraction: !!data.requireInteraction
    })
  );
});

self.addEventListener("notificationclick", function(e) {
  e.notification.close();
  e.waitUntil(self.clients.openWindow("/"));
});
