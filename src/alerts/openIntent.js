// BreakoutPro - alerts/openIntent.js
// One-slot hand-off for "open this alert": a notification click (service worker message or the
// ?tab=alerts&open=<id> URL) stores the target here and the Smart Alerts screen consumes it.
// Rules: no backtick, no triple-equals, ASCII only.

var slot = null;
export function setOpenIntent(intent){ slot = intent && typeof intent == "object" ? { id: intent.id || null, symbol: intent.symbol || null } : null; }
export function takeOpenIntent(){ var s = slot; slot = null; return s; }

// Parse "/?tab=alerts&open=abc123def456" (or a full search string). Returns { tab, id } or null.
export function parseOpenUrl(search){
  try{
    var q = String(search || "");
    var i = q.indexOf("?");
    if(i >= 0) q = q.slice(i + 1);
    var out = { tab: null, id: null };
    q.split("&").forEach(function(p){
      var kv = p.split("=");
      if(kv[0] == "tab") out.tab = decodeURIComponent(kv[1] || "");
      if(kv[0] == "open") out.id = decodeURIComponent(kv[1] || "");
    });
    if(out.tab != "alerts") return null;
    if(out.id && !/^[0-9a-f]{12}$/.test(out.id)) out.id = null;
    return out;
  }catch(e){ return null; }
}
