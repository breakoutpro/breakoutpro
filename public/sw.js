// BreakoutPro - sw.js (PWA service worker)
// App-shell offline cache + push notifications. Network-first for API AND
// for navigation/HTML (the shell itself), cache-first only for static
// hashed assets. Never serves fabricated market data (API not cached long).
//
// v3: moved from the project root into /public so Vite's build actually
// copies this file (and manifest.json/icons) into the deployed output -
// previously it lived outside /public and was never emitted into dist/,
// so https://breakoutpro.in/sw.js and /manifest.json 404'd in production
// and the browser silently had nothing to register or read installability
// from. Also refreshed SHELL_ASSETS to the new /icons/* paths. The cache
// name bump below ensures no stale v2 client limps along referencing the
// old (broken) asset list.
//
// v2 (kept for history): the previous version was cache-first for
// navigation requests too, which meant a user's very first cached
// index.html could be served forever afterward, regardless of how many
// times the app was redeployed - the browser never even checked the
// network for a newer shell. v2 fixed that at the strategy level, not just
// by bumping the cache name once - see the fetch handler below.

var SHELL_CACHE = "bp-shell-v3";
var SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

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
//  - API calls (/api/): network-first, never cached - every live price,
//    scanner row, news item and futures quote must always come from the
//    real API response, never a stored copy. On a genuine network failure
//    this returns an explicit offline JSON marker (not fabricated data) so
//    the app's own resilientFetch/last-good-value logic decides what to
//    show, exactly as it already does today.
//  - navigation requests (the HTML shell itself, "/" and "/index.html"):
//    network-first. The shell must always be checked against the network
//    first, falling back to cache only when genuinely offline, so a new
//    Vercel deployment is picked up on the very next online visit rather
//    than being masked indefinitely by an old cached index.html referencing
//    an old build's hashed JS filename.
//  - static hashed assets (JS/CSS/images emitted by the Vite build):
//    cache-first. Their filenames change whenever their content changes
//    (content-hashed by Vite), so a cached entry can never become stale -
//    a new deploy simply requests a new URL the cache has never seen.
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

// ---- Smart Alerts push ------------------------------------------------------------------
// Payload (server-built, already in the user's language):
//   { title, body, tag, lang, data:{ url:"/?tab=alerts&open=<id>", symbol, id } }
// The text is shown as sent. Nothing here invents an alert: no payload, no fabricated body.
function safeUrl(u){
  try{
    if(typeof u != "string" || u.charAt(0) != "/" || u.charAt(1) == "/") return "/?tab=alerts";
    return u;
  }catch(ex){ return "/?tab=alerts"; }
}

self.addEventListener("push", function(e) {
  var data = null;
  try { data = e.data ? e.data.json() : null; } catch(ex) { data = null; }
  if(!data || !data.title){ return; }   // an empty/invalid push shows nothing instead of a generic fake alert
  var meta = data.data || {};
  e.waitUntil(
    self.registration.showNotification(String(data.title).slice(0, 120), {
      body: String(data.body || "").slice(0, 300),
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag || "bp-alert",
      lang: data.lang || "en",
      data: { url: safeUrl(meta.url), symbol: meta.symbol || null, id: meta.id || null },
      requireInteraction: !!data.requireInteraction
    })
  );
});

// Click: focus an open Breakout Pro window and ask it to open the alert, else open a new one.
self.addEventListener("notificationclick", function(e) {
  e.notification.close();
  var meta = e.notification.data || {};
  var url = safeUrl(meta.url);
  e.waitUntil(
    self.clients.matchAll({ type:"window", includeUncontrolled:true }).then(function(list){
      for(var i = 0; i < list.length; i++){
        var c = list[i];
        if(c.url.indexOf(self.location.origin) == 0 && "focus" in c){
          try{ c.postMessage({ type:"bp-open", url:url, id:meta.id || null, symbol:meta.symbol || null }); }catch(ex){}
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// The push service rotated the subscription: re-subscribe so the browser keeps receiving, and
// tell any open window. The new endpoint reaches the server the next time the app opens
// (the service worker has no access to the device credential by design).
self.addEventListener("pushsubscriptionchange", function(e) {
  e.waitUntil(
    Promise.resolve().then(function(){
      var old = e.oldSubscription;
      var opts = (e.newSubscription ? null : (old && old.options)) || null;
      return e.newSubscription ? e.newSubscription : (opts ? self.registration.pushManager.subscribe(opts) : null);
    }).catch(function(){ return null; }).then(function(){
      return self.clients.matchAll({ type:"window", includeUncontrolled:true }).then(function(list){
        for(var i = 0; i < list.length; i++){ try{ list[i].postMessage({ type:"bp-resubscribe" }); }catch(ex){} }
      });
    })
  );
});
