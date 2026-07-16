// BreakoutPro - src/state/appStateRegistry.js
// Session restore, welcome-back, offline cache keys, missed alerts. Frozen Phase 0.
// Rules: no backtick, no triple-equals, ASCII only.

export var KEYS = {
  lastScreen:   "bp_last_screen",
  lastRefresh:  "bp_last_refresh",
  lastVisit:    "bp_last_visit",
  offlineCache: "bp_offline_cache",
  missedAlerts: "bp_missed_alerts",
  cachePrefix:  "bp_cache_"
};

function read(k, def){ try{ var v=localStorage.getItem(k); return v==null?def:v; }catch(e){ return def; } }
function write(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
function readJSON(k, def){ try{ var v=localStorage.getItem(k); return v?JSON.parse(v):def; }catch(e){ return def; } }
function writeJSON(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }

export function saveState(key, value){ write(key, value); }
export function saveLastScreen(tab){ write(KEYS.lastScreen, String(tab||"")); }
export function getLastScreen(){ return read(KEYS.lastScreen, ""); }

export function markVisit(){
  var prev = parseInt(read(KEYS.lastVisit, "0"), 10) || 0;
  write(KEYS.lastVisit, String(Date.now()));
  return prev;
}
export function timeSinceLastVisit(){
  var prev = parseInt(read(KEYS.lastVisit, "0"), 10) || 0;
  if(!prev) return 0;
  return Date.now() - prev;
}
// Human-friendly gap ("2h 15m", "3 days").
export function formatGap(ms){
  if(!ms || ms<60000) return "just now";
  var mins = Math.floor(ms/60000);
  if(mins<60) return mins + "m ago";
  var hrs = Math.floor(mins/60);
  if(hrs<24) return hrs + "h " + (mins%60) + "m ago";
  var days = Math.floor(hrs/24);
  return days + (days==1?" day ago":" days ago");
}

// Per-feature last-good cache (used by resilientFetch).
export function cacheGet(feature){ return readJSON(KEYS.cachePrefix + feature, null); }
export function cacheSet(feature, data){
  writeJSON(KEYS.cachePrefix + feature, { data:data, at:Date.now() });
  write(KEYS.lastRefresh, String(Date.now()));
}

// Missed alerts queue (fired while user away).
export function queueMissedAlert(alert){
  var q = readJSON(KEYS.missedAlerts, []);
  q.unshift({ a:alert, at:Date.now() });
  writeJSON(KEYS.missedAlerts, q.slice(0,20));
}
export function getMissedAlerts(){ return readJSON(KEYS.missedAlerts, []); }
export function clearMissedAlerts(){ writeJSON(KEYS.missedAlerts, []); }

// Market delta between two index snapshots for "changed while away".
export function marketDelta(oldSnap, newSnap){
  if(!oldSnap || !newSnap) return null;
  var out = [];
  for(var k in newSnap){
    if(!newSnap.hasOwnProperty(k)) continue;
    if(oldSnap[k]!=null && newSnap[k]!=null && oldSnap[k].ltp!=null && newSnap[k].ltp!=null){
      var diff = ((newSnap[k].ltp - oldSnap[k].ltp) / oldSnap[k].ltp) * 100;
      out.push({ key:k, changePct:Math.round(diff*100)/100 });
    }
  }
  return out;
}

// Should the Welcome Back screen show? (gap > 30 min)
export function shouldWelcomeBack(){
  var gap = timeSinceLastVisit();
  return gap > 30*60*1000;
}
