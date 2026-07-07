// BreakoutPro - src/services/resilientFetch.js
// Cache + retry + status wrapper. Never blank, never crash, never fake values.
// On failure serves last-good cache labelled DELAYED; retries with backoff.
// Rules: no backtick, no triple-equals, ASCII only.

import { cacheGet, cacheSet } from "../state/appStateRegistry";

var BACKOFF = [3000, 8000, 20000]; // then 60s steady
var STALE_MS = 10 * 60 * 1000;     // cache older than this = STALE

// Status: LIVE / DELAYED / STALE / UNAVAILABLE / OFFLINE
function classifyCache(entry){
  if(!entry) return "UNAVAILABLE";
  var age = Date.now() - (entry.at || 0);
  return age <= STALE_MS ? "DELAYED" : "STALE";
}

// resilientFetch(url, { cacheKey, method, body, onUpdate })
// Returns a controller with .stop(). Calls onUpdate({data,status,lastUpdated,fromCache}).
export function resilientFetch(url, opts){
  var o = opts || {};
  var cacheKey = o.cacheKey || url;
  var attempt = 0;
  var stopped = false;
  var timer = null;

  function emit(data, status, at, fromCache){
    if(o.onUpdate) o.onUpdate({ data:data, status:status, lastUpdated:at||Date.now(), fromCache:!!fromCache });
  }

  function offline(){
    try{ return typeof navigator!="undefined" && navigator.onLine==false; }catch(e){ return false; }
  }

  function serveCache(reason){
    var entry = cacheGet(cacheKey);
    if(entry){ emit(entry.data, reason||classifyCache(entry), entry.at, true); }
    else { emit(null, offline()?"OFFLINE":"UNAVAILABLE", null, false); }
  }

  function schedule(){
    if(stopped) return;
    var delay = attempt < BACKOFF.length ? BACKOFF[attempt] : 60000;
    attempt++;
    timer = setTimeout(run, delay);
  }

  function run(){
    if(stopped) return;
    if(offline()){ serveCache("OFFLINE"); schedule(); return; }
    fetch(url, {
      method:o.method||"GET",
      headers:o.body?{ "Content-Type":"application/json" }:undefined,
      body:o.body?JSON.stringify(o.body):undefined
    })
      .then(function(r){ return r.json(); })
      .then(function(json){
        if(stopped) return;
        // Success only if payload is usable (ok flag or has data).
        var ok = json && (json.ok==true || json.ok==undefined) && json.reason==undefined;
        if(!ok){ serveCache(); schedule(); return; }
        attempt = 0; // reset backoff on success
        cacheSet(cacheKey, json);
        emit(json, "LIVE", Date.now(), false);
      })
      .catch(function(){
        if(stopped) return;
        serveCache();  // last-good, never blank
        schedule();    // retry with backoff
      });
  }

  // React to reconnect: immediate refetch.
  function onOnline(){ attempt = 0; if(timer){ clearTimeout(timer); } run(); }
  try{ window.addEventListener("online", onOnline); }catch(e){}

  run();

  return {
    stop: function(){
      stopped = true;
      if(timer){ clearTimeout(timer); timer=null; }
      try{ window.removeEventListener("online", onOnline); }catch(e){}
    },
    refresh: function(){ attempt = 0; if(timer){ clearTimeout(timer); } run(); }
  };
}

