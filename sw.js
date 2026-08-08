// BreakoutPro - sw.js (PWA service worker)
// App-shell offline cache + push notifications. Network-first for API AND
// for navigation/HTML (the shell itself), cache-first only for static
// hashed assets. Never serves fabricated market data (API not cached long).
//
// v2: the previous version was cache-first for navigation requests too,
// which meant a user's very first cached index.html could be served
// forever afterward, regardless of how many times the app was redeployed -
// the browser never even checked the network for a newer shell. This
// version fixes that at the strategy level, not just by bumping the cache
// name once - see the fetch handler below.

var SHELL_CACHE = "bp-shell-v2";
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
//  - API calls (/api/): network-first, do NOT cache market data long (freshness). Unchanged.
//  - navigation requests (the HTML shell itself, "/" and "/index.html"):
//    network-first. This is the actual fix - the shell must always be
//    checked against the network first, falling back to cache only when
//    genuinely offline, so a new deployment is picked up on the very next
//    online visit rather than being masked indefinitely by an old cached
//    index.html referencing an old build's hashed JS filename.
//  - static hashed assets (JS/CSS/images): cache-first, unchanged - their
//    filenames change whenever their content changes, so a cached entry
//    can never become stale the way the shell could.
self.addEventListener("fetch", function(e) {
  var url = e.request.url;
  if(e.request.method != "GET"){ return; }

  if(url.indexOf("/api/") >= 0){
    // network-first; if offline, let the app's resilientFetch serve last-good.
    e.respondWith(fetch(e.request).catch(function(){ return new Response(JSON.stringify({ ok:false, reason:"offline" }), { headers:{ "Content-Type":"application/json" } }); }));
    return;
  }

  var isNavigation = e.request.mode=="navigate" ||
    url==self.location.origin+"/" ||
    url==self.location.origin+"/index.html";
  if(isNavigation){
    e.respondWith(
      fetch(e.request).then(function(resp){
        try{
          if(resp && resp.status==200){
            var copy = resp.clone();
            caches.open(SHELL_CACHE).then(function(c){ c.put(e.request, copy); });
          }
        }catch(ex){}
        return resp;
      }).catch(function(){
        // Offline fallback only - a user with real network access always
        // gets the fetch() above, so this path can never mask a fresh
        // deployment from someone who is actually online.
        return caches.match("/index.html").then(function(cached){ return cached || caches.match("/"); });
      })
    );
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
