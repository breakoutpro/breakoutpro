// BreakoutPro - src/state/marketTickerModel.js
// Pure model for the top Market Ticker. Input is the payload the app ALREADY loads from
// /api/market-mood-data (useMarketMood). No fetching, no new provider, no invented values.
// Every state label is derived from the server freshness block plus the client clock,
// so cached or old data can never be shown as live.
// States: live, delayed, lastconfirmed, closed, unavailable, loading.
// GIFT NIFTY has no verified provider in this project, so it is always unavailable.
// Rules: no backtick, no triple-equals, ASCII only.

export var TICKER_ITEMS = [
  { key:"NIFTY",     label:"NIFTY 50",   route:"markets",    kind:"index" },
  { key:"BANKNIFTY", label:"BANK NIFTY", route:"markets",    kind:"index" },
  { key:"SENSEX",    label:"SENSEX",     route:"markets",    kind:"index" },
  { key:"GIFT",      label:"GIFT NIFTY", route:null,         kind:"none"  },
  { key:"VIX",       label:"INDIA VIX",  route:"marketmood", kind:"vix"   }
];

var LIVE_MAX_S = 90;
var DELAYED_MAX_S = 900;
var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function p2(n){ return n < 10 ? "0" + n : String(n); }

// "15:30" for today (IST) or "23 Oct 15:30" for an earlier day. Null when no timestamp.
export function istStamp(ms, now){
  if(ms == null || !isFinite(ms)) return null;
  var d = new Date(ms + 19800000), n = new Date((now != null ? now : Date.now()) + 19800000);
  var hm = p2(d.getUTCHours()) + ":" + p2(d.getUTCMinutes());
  var same = d.getUTCFullYear() == n.getUTCFullYear() && d.getUTCMonth() == n.getUTCMonth() && d.getUTCDate() == n.getUTCDate();
  return same ? hm : d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + hm;
}

function isNum(v){ return typeof v == "number" && isFinite(v); }

// How the ticker may describe a quote. session is the server session at generation time.
export function stateOf(ageSec, session, networkStatus){
  var sessionOpen = session == "OPEN" || session == "PRE_OPEN";
  var sessionClosed = session == "WEEKEND" || session == "CLOSED" || session == "POST_CLOSE";
  if(ageSec == null) return "unavailable";
  if(sessionClosed) return "closed";
  if(!sessionOpen) return "lastconfirmed";
  if(networkStatus == "OFFLINE" || networkStatus == "STALE") return "lastconfirmed";
  if(ageSec <= LIVE_MAX_S && (networkStatus == "LIVE" || networkStatus == null)) return "live";
  if(ageSec <= DELAYED_MAX_S) return "delayed";
  return "lastconfirmed";
}

// opts: { now, networkStatus, loadFailed }. loadFailed (hook status error/offline with no data) turns "loading" into unavailable. Always returns one entry per TICKER_ITEMS, same order, so the
// strip never changes size when data arrives. data == null means not loaded yet.
export function buildTickerItems(data, opts){
  opts = opts || {};
  var now = opts.now != null ? opts.now : Date.now();
  var net = opts.networkStatus || null;
  var loading = (!data || typeof data != "object") && !opts.loadFailed;
  var session = data && data.session ? data.session : null;
  var indices = data && data.indices ? data.indices : {};
  return TICKER_ITEMS.map(function(def){
    var out = { key:def.key, label:def.label, route:null, kind:def.kind, state:"unavailable",
                value:null, chgPct:null, chgAbs:null, dir:"neutral", asOf:null };
    if(def.key == "GIFT") return out;           // no verified provider: honest unavailable
    if(loading){ out.state = "loading"; return out; }
    var q = indices[def.key];
    if(!q || !isNum(q.ltp)) return out;         // provider returned nothing for this symbol
    var fr = q.freshness || {};
    var ts = isNum(fr.sourceTimestamp) ? fr.sourceTimestamp : null;
    var age = ts != null ? Math.max(0, Math.round((now - ts) / 1000)) : null;
    out.value = q.ltp;
    out.asOf = istStamp(ts, now);
    out.state = (fr.status == "UNAVAILABLE") ? "unavailable" : stateOf(age, session, net);
    // The server rule (src/market/marketData.js) wins: only a verified real-time quote may be "live".
    if(out.state == "live" && fr.status && fr.status != "LIVE") out.state = "delayed";
    out.delayedBySec = fr.delayedBySec != null ? fr.delayedBySec : null;
    if(out.state == "unavailable"){ out.value = null; out.asOf = null; return out; }
    out.route = def.route;
    if(isNum(q.chgPct)){
      out.chgPct = q.chgPct;
      out.dir = q.chgPct > 0 ? "up" : (q.chgPct < 0 ? "down" : "neutral");
      if(isNum(q.prevClose)) out.chgAbs = q.ltp - q.prevClose;
    }
    return out;
  });
}

export function stateLabel(state){
  if(state == "live") return "LIVE";
  if(state == "delayed") return "DELAYED";
  if(state == "closed") return "CLOSED";
  if(state == "lastconfirmed") return "LAST CONFIRMED";
  if(state == "loading") return "LOADING";
  return "UNAVAILABLE";
}

// ---- Slim marquee helpers (pure) ---------------------------------------------------------
// The ticker strip shows only name, value and signed percent. Items without a valid value
// (loading, unavailable, GIFT NIFTY with no verified provider) are left out, never faked.

export function pctDir(pct){
  if(!isNum(pct)) return "neutral";
  if(Math.abs(pct) < 0.005) return "neutral";   // rounds to 0.00: unchanged, not green or red
  return pct > 0 ? "up" : "down";
}

export function formatTickerValue(v){
  if(!isNum(v)) return null;
  return v.toLocaleString("en-IN", { minimumFractionDigits:2, maximumFractionDigits:2 });
}

// "+0.52%", "-0.40%", "0.00%". Null when the provider sent no change.
export function formatTickerPct(pct){
  if(!isNum(pct)) return null;
  if(Math.abs(pct) < 0.005) return "0.00%";
  return (pct > 0 ? "+" : "") + pct.toFixed(2) + "%";
}

// Items the strip may show, in configured order, each with ready display text.
export function visibleTickerItems(items){
  var out = [];
  (items || []).forEach(function(it){
    if(!it || it.state == "unavailable" || it.state == "loading" || !isNum(it.value)) return;
    out.push({ key:it.key, label:it.label, route:it.route, value:formatTickerValue(it.value),
               pct:formatTickerPct(it.chgPct), dir:pctDir(it.chgPct), chgAbs:it.chgAbs });
  });
  return out;
}

// How many copies of one item group make one marquee half at least as wide as the viewport.
// Two identical halves then loop with no gap: scrollLeft - half lands on identical pixels.
export function loopCopies(containerW, groupW){
  if(!isNum(containerW) || !isNum(groupW) || groupW <= 0) return 1;
  return Math.max(1, Math.ceil(containerW / groupW));
}

// Keep a scroll position inside [0, half) so the two halves join without a jump.
export function wrapOffset(pos, half){
  if(!isNum(pos) || !isNum(half) || half <= 0) return 0;
  var p = pos % half;
  return p < 0 ? p + half : p;
}
