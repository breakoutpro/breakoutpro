// BreakoutPro - src/market/intradayRadar.js
// Pure calculations for the Live Intraday Scalping Radar. No network, no React, no randomness.
// Input is the unified candle response of api/_lib/marketFeed.js getCandles(symbol, "5m"): real 5-minute
// OHLCV bars (Yahoo, about 5 sessions) with a complete flag, plus the normalised quote. Nothing is estimated:
// a metric without enough real data comes back with state "unavailable" and a reason.
//
// Documented rules
//  * Session: NSE cash session 09:15 to 15:30 IST. Bars outside it are ignored. Sessions are grouped by IST date,
//    so a holiday or weekend simply has no session (the data itself carries the trading calendar).
//  * Volume shock: volume of the latest COMPLETED 5-minute bar divided by the mean volume of the SAME time-of-day
//    bar (same HH:MM IST) in the earlier sessions available. At least 3 earlier sessions are required.
//  * Day High / Day Low cross: a completed bar whose high is above (low below) the highest high (lowest low) of all
//    earlier completed bars of the session, once at least 3 earlier bars exist (after 09:30). Resolution is the
//    5-minute bar, not the tick; the time shown is the start of that bar. Trading within 0.15% of a level without
//    crossing it is reported as "near", never as a crossing.
//  * VWAP: sum(typical price x volume) / sum(volume) over the completed bars of the latest session, typical price =
//    (high + low + close) / 3, needs at least 3 bars with volume. Stale (open session, last bar older than 20 min)
//    gives "stale"; after the close it is the session (EOD) VWAP.
//  * CPR and pivots: from the latest FULL completed session (first bar at 09:15, last bar at 15:20 or later):
//    P = (H + L + C) / 3, BC = (H + L) / 2, TC = 2P - BC, R1 = 2P - L, S1 = 2P - H. CPR top = max(TC, BC), bottom =
//    min(TC, BC), width = (top - bottom) / P x 100. Narrow below 0.25%, Wide above 0.50%, otherwise Normal (the app's
//    own fixed thresholds). C is the last 5-minute close, which can differ slightly from the official daily close.
//    These are calculated reference levels, not predictions.
// Rules: no backtick, no triple-equals, ASCII only.

var IST_MS = 19800000;
export var OPEN_MIN = 555;   // 09:15
export var CLOSE_MIN = 930;  // 15:30
export var BAR_SEC = 300;
export var MIN_BASELINE_SESSIONS = 3;
export var MIN_PRIOR_BARS = 3;
export var RECENT_BARS = 6;
export var FRESH_BARS = 2;
export var NEAR_PCT = 0.15;
export var VWAP_STALE_MS = 20 * 60000;
export var CPR_NARROW = 0.25;
export var CPR_WIDE = 0.5;

function isNum(v){ return typeof v == "number" && isFinite(v); }
function r2(v){ return Math.round(v * 100) / 100; }

export function istParts(ms){
  var d = new Date(ms + IST_MS);
  return { date:d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate(), min:d.getUTCHours() * 60 + d.getUTCMinutes(), y:d.getUTCFullYear(), mo:d.getUTCMonth() + 1, d:d.getUTCDate() };
}
function p2(n){ return n < 10 ? "0" + n : String(n); }
export function istHHMM(ms){ var p = istParts(ms); return p2(Math.floor(p.min / 60)) + ":" + p2(p.min % 60); }
export function istDateLabel(date){
  var M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return (date % 100) + " " + M[Math.floor(date / 100) % 100 - 1];
}

// Valid session bars grouped by IST date, oldest session first. Malformed bars are dropped.
export function groupSessions(candles){
  var by = {};
  (Array.isArray(candles) ? candles : []).forEach(function(b){
    if(!b || !isNum(b.time) || !isNum(b.open) || !isNum(b.high) || !isNum(b.low) || !isNum(b.close)) return;
    if(b.high < b.low || b.high < Math.max(b.open, b.close) - 1e-9 || b.low > Math.min(b.open, b.close) + 1e-9) return;
    var p = istParts(b.time * 1000);
    if(p.min < OPEN_MIN || p.min >= CLOSE_MIN) return;
    (by[p.date] = by[p.date] || {})[b.time] = { time:b.time, min:p.min, open:b.open, high:b.high, low:b.low, close:b.close, volume:isNum(b.volume) ? b.volume : null, complete:b.complete != false };
  });
  return Object.keys(by).map(Number).sort(function(a, b){ return a - b; }).map(function(date){
    var bars = Object.keys(by[date]).map(function(k){ return by[date][k]; }).sort(function(a, b){ return a.time - b.time; });
    return { date:date, bars:bars };
  });
}

function completedBars(sess){ return sess.bars.filter(function(b){ return b.complete; }); }

export function volumeShock(sessions, cur){
  var bars = completedBars(cur);
  if(!bars.length) return { state:"unavailable", reason:"no_completed_bar" };
  var last = bars[bars.length - 1];
  if(!isNum(last.volume) || last.volume <= 0) return { state:"unavailable", reason:"no_volume" };
  var samples = [];
  sessions.forEach(function(s){
    if(s.date >= cur.date) return;
    for(var i = 0; i < s.bars.length; i++){
      var b = s.bars[i];
      if(b.min == last.min && b.complete && isNum(b.volume) && b.volume > 0){ samples.push(b.volume); break; }
    }
  });
  if(samples.length < MIN_BASELINE_SESSIONS) return { state:"unavailable", reason:"baseline_needs_" + MIN_BASELINE_SESSIONS + "_sessions", samples:samples.length };
  var avg = samples.reduce(function(a, b){ return a + b; }, 0) / samples.length;
  return { state:"ok", barTime:last.time * 1000, volume:last.volume, avg:Math.round(avg), mult:r2(last.volume / avg), samples:samples.length };
}

export function crossings(cur){
  var bars = completedBars(cur);
  if(!bars.length) return { state:"unavailable", reason:"no_completed_bar" };
  var hi = -Infinity, lo = Infinity, events = [];
  for(var i = 0; i < bars.length; i++){
    var b = bars[i];
    if(i >= MIN_PRIOR_BARS){
      if(b.high > hi) events.push({ type:"high", time:b.time * 1000, level:hi, price:b.high });
      if(b.low < lo) events.push({ type:"low", time:b.time * 1000, level:lo, price:b.low });
    }
    if(b.high > hi) hi = b.high;
    if(b.low < lo) lo = b.low;
  }
  var lastEnd = (bars[bars.length - 1].time + BAR_SEC) * 1000;
  var recent = events.filter(function(e){ return e.time + BAR_SEC * 1000 >= lastEnd - (RECENT_BARS - 1) * BAR_SEC * 1000; });
  var latest = recent.length ? recent[recent.length - 1] : null;
  if(recent.length > 1){
    var lt = recent[recent.length - 1].time;
    var same = recent.filter(function(e){ return e.time == lt; });
    if(same.length == 2){ var lb = bars[bars.length - 1]; latest = (lb.close - lb.low) >= (lb.high - lb.close) ? same[0] : same[1]; }
  }
  var out = { state:"ok", dayHigh:hi, dayLow:lo, barsUsed:bars.length, latest:null, near:null };
  if(latest){ out.latest = { type:latest.type, time:latest.time, level:latest.level, price:latest.price, fresh:latest.time + BAR_SEC * 1000 >= lastEnd - (FRESH_BARS - 1) * BAR_SEC * 1000 }; }
  var px = bars[bars.length - 1].close;
  if(!out.latest){
    if(hi > 0 && (hi - px) / hi * 100 <= NEAR_PCT) out.near = "high";
    else if(lo > 0 && (px - lo) / lo * 100 <= NEAR_PCT) out.near = "low";
  }
  return out;
}

export function sessionVwap(cur, ctx){
  var bars = completedBars(cur).filter(function(b){ return isNum(b.volume) && b.volume > 0; });
  if(bars.length < 3) return { state:"unavailable", reason:"needs_3_bars_with_volume", bars:bars.length };
  var pv = 0, v = 0;
  bars.forEach(function(b){ pv += (b.high + b.low + b.close) / 3 * b.volume; v += b.volume; });
  var last = bars[bars.length - 1];
  var lastEnd = (last.time + BAR_SEC) * 1000;
  var open = !!(ctx && ctx.open);
  if(open && ctx.now - lastEnd > VWAP_STALE_MS) return { state:"stale", value:r2(pv / v), bars:bars.length, lastBarTime:last.time * 1000 };
  return { state:open ? "ok" : "eod", value:r2(pv / v), bars:bars.length, lastBarTime:last.time * 1000, lastClose:last.close };
}

export function vwapSide(distPct, proxPct){
  if(!isNum(distPct)) return "unavailable";
  var p = isNum(proxPct) ? proxPct : 0.2;
  if(Math.abs(distPct) <= p) return "near";
  return distPct > 0 ? "above" : "below";
}

export function cprLevels(sess){
  if(!sess || !sess.bars.length) return null;
  var bars = sess.bars.filter(function(b){ return b.complete; });
  if(!bars.length || bars[0].min > OPEN_MIN + 5 || bars[bars.length - 1].min < CLOSE_MIN - 10) return null;
  var H = -Infinity, L = Infinity;
  bars.forEach(function(b){ if(b.high > H) H = b.high; if(b.low < L) L = b.low; });
  var C = bars[bars.length - 1].close;
  var P = (H + L + C) / 3, BC = (H + L) / 2, TC = 2 * P - BC;
  var top = Math.max(TC, BC), bottom = Math.min(TC, BC);
  var width = P > 0 ? (top - bottom) / P * 100 : null;
  if(!isNum(width)) return null;
  return { sessionDate:sess.date, high:r2(H), low:r2(L), close:r2(C), pivot:r2(P), bc:r2(BC), tc:r2(TC), top:r2(top), bottom:r2(bottom), r1:r2(2 * P - L), s1:r2(2 * P - H), widthPct:Math.round(width * 1000) / 1000, kind:width < CPR_NARROW ? "narrow" : (width > CPR_WIDE ? "wide" : "normal") };
}

// c: unified candle response { candles, quote, status, volumeAvailable }. ctx: { now, session ("OPEN"|...) }
export function analyzeSymbol(sym, c, ctx){
  ctx = ctx || {};
  var now = isNum(ctx.now) ? ctx.now : Date.now();
  var sessions = groupSessions(c && c.candles);
  if(!sessions.length) return { sym:sym, state:"unavailable", reason:"no_intraday_bars" };
  var cur = sessions[sessions.length - 1];
  var today = istParts(now).date;
  var open = ctx.session == "OPEN" && cur.date == today;
  var done = completedBars(cur);
  var q = c && c.quote ? c.quote : null;
  var lastBar = done.length ? done[done.length - 1] : null;
  var prevSess = sessions.length > 1 ? sessions[sessions.length - 2] : null;
  var prevClose = q && isNum(q.prevClose) ? q.prevClose : (prevSess && completedBars(prevSess).length ? completedBars(prevSess)[completedBars(prevSess).length - 1].close : null);
  var price = (q && isNum(q.price)) ? q.price : (lastBar ? lastBar.close : null);
  var chgPct = (q && isNum(q.changePct)) ? q.changePct : ((isNum(price) && isNum(prevClose) && prevClose > 0) ? (price - prevClose) / prevClose * 100 : null);
  var hasVol = !!(c && c.volumeAvailable);
  var out = { sym:sym, state:"ok", sessionDate:cur.date, open:open, price:isNum(price) ? r2(price) : null, chgPct:isNum(chgPct) ? Math.round(chgPct * 100) / 100 : null,
    status:(c && c.status) || "UNAVAILABLE", asOf:q && isNum(q.asOf) ? q.asOf : null, lastBarTime:lastBar ? lastBar.time * 1000 : null, volumeAvailable:hasVol };
  out.vol = hasVol ? volumeShock(sessions, cur) : { state:"unavailable", reason:"no_volume_for_instrument" };
  out.cross = crossings(cur);
  out.vwap = hasVol ? sessionVwap(cur, { open:open, now:now }) : { state:"unavailable", reason:"no_volume_for_instrument" };
  if(out.vwap.value != null){
    var ref = open ? price : (out.vwap.lastClose != null ? out.vwap.lastClose : price);
    if(isNum(ref) && out.vwap.value > 0){ out.vwap.price = r2(ref); out.vwap.distPct = Math.round((ref - out.vwap.value) / out.vwap.value * 10000) / 100; }
  }
  var cands = sessions.filter(function(s){ return !(open && s.date == cur.date) && cprLevels(s); });
  var cs = cands.length ? cands[cands.length - 1] : null;
  out.cpr = cs ? cprLevels(cs) : null;
  if(out.cpr) out.cpr.forNext = !open && cs.date == cur.date;
  return out;
}

// Duplicate suppression: one key per stock, event type and candle. Returns the events not seen before and
// the updated set. The first call (seen == null) only seeds, so loading the page never "alerts" old events.
export function eventKey(type, sym, barTime){ return type + "|" + sym + "|" + barTime; }
export function newEvents(seen, events){
  var set = seen ? new Set(seen) : null;
  var fresh = [];
  var next = set || new Set();
  events.forEach(function(e){
    var k = eventKey(e.type, e.sym, e.time);
    if(!next.has(k)){ next.add(k); fresh.push(e); }
  });
  return { fresh:set ? fresh : [], seen:next };
}

// Factual freshness label for a section. never "Live" unless the session is open and the provider status is LIVE.
export function freshness(status, open, lastBarTime){
  if(!isNum(lastBarTime)) return { label:"Unavailable", stamp:null };
  var stamp = "Last Updated " + istHHMM(lastBarTime + BAR_SEC * 1000) + " IST";
  if(!open) return { label:"EOD", stamp:stamp };
  if(status == "LIVE") return { label:"Live", stamp:stamp };
  return { label:"Delayed", stamp:stamp };
}
