// BreakoutPro - src/market/marketData.js
// ONE pure market-data model shared by the server (api/_lib, api/market.js) and the browser
// (src/market/marketClient.js). No fetching here, no clock reads except the injected "now".
//
// What it owns:
//   1. Symbol mapping: app symbol -> Yahoo symbol (NSE stocks, indices) and back.
//   2. The freshness rule: LIVE / DELAYED / STALE / UNAVAILABLE for a quote.
//   3. The normalised quote and candle shapes every screen and the alert engine consume.
//
// FRESHNESS RULE (the honesty contract):
//   * A quote is LIVE only when the provider itself reports it is not delayed
//     (delayedBySec == 0) AND the quote timestamp is under 2 minutes old AND the NSE session
//     is open. A provider that does not report its delay can never produce LIVE.
//   * A provider-reported delay (for example 900 seconds) is always DELAYED and the delay is
//     carried so the UI and notifications can state it.
//   * While the market is closed the last session's price is shown as DELAYED with
//     reason "market_closed" (it is a confirmed close, not a live price); older than 5 days is STALE.
//   * A missing or future timestamp is UNAVAILABLE. Nothing is ever filled in or guessed.
// Rules: no backtick, no triple-equals, ASCII only.

import { sessionAt } from "../alerts/alertEngine.js";

export var STATUS = { LIVE:"LIVE", DELAYED:"DELAYED", STALE:"STALE", UNAVAILABLE:"UNAVAILABLE" };
export var LIVE_MAX_S = 120;          // verified-real-time quote must be at most this old
export var DELAYED_MAX_S = 900;       // an unreported-delay quote older than this is STALE
export var DELAY_GRACE_S = 900;       // a reported delay of D seconds is STALE past D + this
export var CLOSED_MAX_S = 5 * 86400;  // last close older than 5 days is STALE
export var FUTURE_TOLERANCE_MS = 300000;

// ---- Symbol mapping --------------------------------------------------------------------
// App key -> Yahoo symbol (unencoded). Stocks are the NSE ticker + ".NS".
export var INDEX_YAHOO = {
  NIFTY:"^NSEI", BANKNIFTY:"^NSEBANK", SENSEX:"^BSESN", FINNIFTY:"NIFTY_FIN_SERVICE.NS",
  MIDCAP:"^CRSLDX", VIX:"^INDIAVIX"
};
var STOCK_RX = /^[A-Z0-9][A-Z0-9&-]{0,19}$/;

export function isIndexKey(sym){ return typeof sym == "string" && Object.prototype.hasOwnProperty.call(INDEX_YAHOO, sym); }

// Returns the Yahoo symbol or null when the input is not a plain NSE ticker or known index.
// Accepts "RELIANCE", "RELIANCE.NS", "^NSEI" and the app index keys; rejects anything else.
// Names the app and users type for the same index ("NIFTY 50" is the legacy watchlist seed).
var ALIASES = { "NIFTY 50":"NIFTY", "NIFTY50":"NIFTY", "BANK NIFTY":"BANKNIFTY", "NIFTY BANK":"BANKNIFTY", "INDIA VIX":"VIX", "FIN NIFTY":"FINNIFTY" };
export function canonicalSymbol(input){
  if(typeof input != "string") return null;
  var s = input.trim().toUpperCase().replace(/\s+/g, " ");
  if(!s) return null;
  return Object.prototype.hasOwnProperty.call(ALIASES, s) ? ALIASES[s] : s;
}

export function toYahooSymbol(input){
  var s = canonicalSymbol(input);
  if(!s) return null;
  if(isIndexKey(s)) return INDEX_YAHOO[s];
  var keys = Object.keys(INDEX_YAHOO);
  for(var i = 0; i < keys.length; i++){ if(INDEX_YAHOO[keys[i]] == s) return s; }
  if(s.slice(-3) == ".NS") s = s.slice(0, -3);
  s = s.replace(/&AMP;/g, "&");
  if(!STOCK_RX.test(s)) return null;
  return s + ".NS";
}

// Reverse mapping used on provider responses: "RELIANCE.NS" -> "RELIANCE", "^NSEI" -> "NIFTY".
export function fromYahooSymbol(ysym){
  if(typeof ysym != "string") return null;
  var keys = Object.keys(INDEX_YAHOO);
  for(var i = 0; i < keys.length; i++){ if(INDEX_YAHOO[keys[i]] == ysym) return keys[i]; }
  return ysym.slice(-3) == ".NS" ? ysym.slice(0, -3) : ysym;
}

export function exchangeOf(sym){ return sym == "SENSEX" ? "BSE" : "NSE"; }

// ---- Freshness -------------------------------------------------------------------------
function isNum(v){ return typeof v == "number" && isFinite(v); }

// in: { asOf (ms), now (ms), delayedBySec (number|null|undefined), session (optional) }
// out: { status, ageSec, delayedBySec, delayKnown, closed, reason }
export function classifyQuote(i){
  var now = isNum(i.now) ? i.now : Date.now();
  var session = i.session || sessionAt(now);
  var closed = session != "OPEN";
  var delayKnown = isNum(i.delayedBySec) && i.delayedBySec >= 0;
  var out = { status:STATUS.UNAVAILABLE, ageSec:null, delayedBySec:delayKnown ? i.delayedBySec : null, delayKnown:delayKnown, closed:closed, reason:"no_timestamp", session:session };
  if(!isNum(i.asOf) || i.asOf <= 0) return out;
  if(i.asOf > now + FUTURE_TOLERANCE_MS){ out.reason = "future_timestamp"; return out; }
  var age = Math.max(0, Math.round((now - i.asOf) / 1000));
  out.ageSec = age;
  if(closed){
    out.status = age <= CLOSED_MAX_S ? STATUS.DELAYED : STATUS.STALE;
    out.reason = age <= CLOSED_MAX_S ? "market_closed" : "old_close";
    return out;
  }
  if(delayKnown && i.delayedBySec > 0){
    out.status = age <= i.delayedBySec + DELAY_GRACE_S ? STATUS.DELAYED : STATUS.STALE;
    out.reason = out.status == STATUS.DELAYED ? "provider_delay" : "stale_quote";
    return out;
  }
  if(delayKnown){   // provider says real time
    if(age <= LIVE_MAX_S){ out.status = STATUS.LIVE; out.reason = "verified_realtime"; }
    else if(age <= DELAYED_MAX_S){ out.status = STATUS.DELAYED; out.reason = "quote_age"; }
    else { out.status = STATUS.STALE; out.reason = "stale_quote"; }
    return out;
  }
  // The provider did not say whether the feed is delayed: never LIVE.
  if(age <= DELAYED_MAX_S){ out.status = STATUS.DELAYED; out.reason = "provider_delay_unreported"; }
  else { out.status = STATUS.STALE; out.reason = "stale_quote"; }
  return out;
}

// ---- Normalised quote ------------------------------------------------------------------
// raw: { price, prevClose, change, changePct, open, high, low, volume, asOf, delayedBySec, marketState }
// Missing numbers stay null. changePct is signed. Nothing is invented: when prevClose and
// change are both missing the change fields are null.
export function normalizeQuote(sym, raw, ctx){
  ctx = ctx || {};
  var now = isNum(ctx.now) ? ctx.now : Date.now();
  if(!raw || !isNum(raw.price) || !(raw.price > 0)){
    return { symbol:sym, exchange:exchangeOf(sym), price:null, change:null, changePct:null, prevClose:null, open:null, high:null, low:null, volume:null,
             asOf:null, source:ctx.source || null, status:STATUS.UNAVAILABLE, statusReason:"no_quote", ageSec:null, delayedBySec:null, delayKnown:false, closed:null, fetchedAt:now };
  }
  var prev = isNum(raw.prevClose) && raw.prevClose > 0 ? raw.prevClose : null;
  var change = isNum(raw.change) ? raw.change : (prev != null ? raw.price - prev : null);
  var pct = isNum(raw.changePct) ? raw.changePct : (prev != null ? (raw.price - prev) / prev * 100 : null);
  var fr = classifyQuote({ asOf:raw.asOf, now:now, delayedBySec:raw.delayedBySec, session:ctx.session });
  var vol = isNum(raw.volume) && raw.volume > 0 ? raw.volume : null;   // 0 means "not supplied" (indices), never a real zero
  return {
    symbol:sym, exchange:exchangeOf(sym), price:raw.price, change:change, changePct:pct, prevClose:prev,
    open:isNum(raw.open) && raw.open > 0 ? raw.open : null, high:isNum(raw.high) && raw.high > 0 ? raw.high : null,
    low:isNum(raw.low) && raw.low > 0 ? raw.low : null, volume:vol,
    asOf:isNum(raw.asOf) ? raw.asOf : null, source:ctx.source || "yahoo",
    status:fr.status, statusReason:fr.reason, ageSec:fr.ageSec, delayedBySec:fr.delayedBySec, delayKnown:fr.delayKnown, closed:fr.closed,
    fetchedAt:now
  };
}

// ---- Candles ---------------------------------------------------------------------------
// Frame keys the layer knows. Yahoo supports 1m for the last 7 days only, 5m/15m/60m for 60 days.
export var FRAMES = {
  "1m":  { interval:"1m",  range:"1d",  seconds:60 },
  "5m":  { interval:"5m",  range:"5d",  seconds:300 },
  "15m": { interval:"15m", range:"5d",  seconds:900 },
  "1H":  { interval:"60m", range:"1mo", seconds:3600 },
  "1D":  { interval:"1d",  range:"6mo", seconds:86400 }
};
export function frameKey(s){
  var m = { "1":"1m", "1m":"1m", "5":"5m", "5m":"5m", "15":"15m", "15m":"15m", "60":"1H", "60m":"1H", "1h":"1H", "1H":"1H", "1D":"1D", "1d":"1D", "D":"1D" };
  return Object.prototype.hasOwnProperty.call(m, s) ? m[s] : null;
}

// Marks the in-progress bar. A bar is complete only when its end (start + frame) is not in the future.
export function markCompleted(candles, frame, now){
  var sec = FRAMES[frame] ? FRAMES[frame].seconds : null;
  if(!sec) return candles;
  return candles.map(function(c){
    var done = (c.time + sec) * 1000 <= now;
    return { time:c.time, open:c.open, high:c.high, low:c.low, close:c.close, volume:c.volume, complete:done };
  });
}

// True only when at least one bar carries a real volume. Index series from Yahoo are all zero:
// that is "volume not supplied", not "no trading", so the layer reports volumeAvailable false.
export function hasVolume(candles){
  for(var i = 0; i < candles.length; i++){ if(isNum(candles[i].volume) && candles[i].volume > 0) return true; }
  return false;
}

export var STATUS_TEXT = { LIVE:"LIVE", DELAYED:"DELAYED", STALE:"STALE", UNAVAILABLE:"UNAVAILABLE" };

// Short human text for a quote, for badges and tooltips. Never says LIVE unless status is LIVE.
export function describeQuote(q){
  if(!q || q.status == STATUS.UNAVAILABLE) return "Unavailable";
  if(q.status == STATUS.LIVE) return "Live";
  if(q.status == STATUS.STALE) return "Stale";
  if(q.closed) return "Last close";
  if(q.delayKnown && q.delayedBySec > 0) return "Delayed " + Math.round(q.delayedBySec / 60) + " min";
  return "Delayed";
}
