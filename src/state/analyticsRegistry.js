// BreakoutPro - src/state/analyticsRegistry.js
// Privacy-friendly analytics. Anonymous only. NEVER captures trading data,
// watchlist symbols, portfolio, AI content, or credentials. Frozen Phase 0.
// Rules: no backtick, no triple-equals, ASCII only.

// Allowed events + the ONLY payload fields each may carry (PII allow-list).
export var ANALYTICS_EVENTS = {
  app_open:      ["date"],
  feature_open:  ["feature"],
  session_start: [],
  session_end:   ["durationSec"],
  notif_shown:   ["type"],
  notif_click:   ["type", "clicked"],
  ai_engine_call:["engine"],           // engine id ONLY, never content
  error_caught:  ["message", "feature"],
  perf_mark:     ["firstPaint", "tti", "apiMs"]
};

// Fields that must NEVER be sent (defensive strip).
var BLOCKED_FIELDS = ["symbol","symbols","watchlist","portfolio","pnl","amount",
  "price","qty","quantity","order","invite","code","password","token","admin",
  "prompt","response","content","name","phone","email"];

function optedOut(){
  try{ return localStorage.getItem("bp_analytics_optout") == "1"; }catch(e){ return false; }
}
function anonId(){
  try{
    var id = localStorage.getItem("bp_anon_id");
    if(!id){ id = "a_" + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("bp_anon_id", id); }
    return id;
  }catch(e){ return "a_anon"; }
}

// Strip any field not in the event allow-list and never send blocked fields.
function sanitize(event, payload){
  var allow = ANALYTICS_EVENTS[event] || [];
  var out = {};
  if(payload){
    for(var k in payload){
      if(!payload.hasOwnProperty(k)) continue;
      if(BLOCKED_FIELDS.indexOf(k) >= 0) continue;      // hard block PII
      if(allow.indexOf(k) >= 0) out[k] = payload[k];    // only allow-listed
    }
  }
  return out;
}

var buffer = [];

// Track an event (buffered, respects opt-out, PII-stripped).
export function track(event, payload){
  if(optedOut()) return;
  if(!ANALYTICS_EVENTS[event]) return;
  buffer.push({ e:event, p:sanitize(event, payload), t:Date.now(), id:anonId() });
  if(buffer.length >= 20) flush();
}

// Batched send. Fails silently; analytics never breaks the app.
export function flush(){
  if(optedOut() || !buffer.length) return;
  var batch = buffer.splice(0, buffer.length);
  try{
    fetch("/api/analytics", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ events:batch }),
      keepalive:true
    }).catch(function(){});
  }catch(e){}
}

export function setOptOut(v){ try{ localStorage.setItem("bp_analytics_optout", v?"1":"0"); }catch(e){} }
export function isOptedOut(){ return optedOut(); }
