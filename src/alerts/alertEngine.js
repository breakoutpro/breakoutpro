// BreakoutPro - src/alerts/alertEngine.js
// Pure alert evaluation. Input is REAL provider data (see api/_lib/alertData.js) plus the
// rule's own saved state; output is a status, optional events and the next state. No
// network, no storage, no clock (the caller passes now), no randomness.
//
// Honest-data rules enforced here:
//  - only COMPLETED candles are used for candle, breakout, volume and pattern rules;
//    the forming candle may only be reported as "waiting (intrabar)".
//  - data older than the freshness limits is "stale" and can never fire an alert;
//    delayed data fires only with a visible DELAYED label.
//  - outside NSE hours (and on listed holidays) nothing fires: "market_closed".
//  - missing volume / short history is "unavailable" with a reason code, never a guess.
//  - the same event is never fired twice (dedupe keys) and rules cool down / re-arm.
// Educational signals only. Not a buy or sell recommendation.
// Rules: no backtick, no triple-equals, ASCII only.

import { validateCandles, expectedLastEnd, levelAndBreakout, istLabel } from "../screens/BreakoutTfEngine.js";
import { istParts, RULES } from "../screens/DirectionEngine.js";
import { isTradingDayIndex } from "../screens/BreakoutTfEngine.js";
import { TIMEFRAMES, RULE_TYPES } from "./alertRules.js";
import { detectPatterns, MIN_CANDLES } from "./alertCandles.js";

var IST_MS = 19800000, DAY_MS = 86400000;
export var LIMITS_T = {
  LIVE_S: 90,            // quote age for "live"
  DELAYED_S: 1200,       // up to 20 minutes: provider delay is allowed but must be labelled
  BAR_LIVE_MS: 180000,   // completed bar within 3 min of when it should exist
  BAR_DELAYED_MS: 1500000, // up to 25 minutes late: delayed
  POST_CLOSE_GRACE_MIN: 5, // last bar completes at 15:30; still evaluated until 15:35
  HYST: 0.001,           // 0.1% hysteresis for price-level re-arm
  KEEP_KEYS: 30,
  MIN_SESSIONS_INTRADAY: 3,
  MAX_SESSIONS_INTRADAY: 10,
  MIN_DAILY_BASE: 10,
  MAX_DAILY_BASE: 20
};
var COOLDOWN_MS = { price_above:900000, price_below:900000, pct_up:0, pct_down:0, breakout:0, breakdown:0, candle:0, volume_spike:0, price_up_volume:0, price_down_volume:0 };

function isNum(v){ return typeof v == "number" && isFinite(v); }
function dayOf(ms){ return istParts(ms).day; }

// ---- Session (holiday aware, from the app's own calendar) ---------------------------
export function sessionAt(now){
  var p = istParts(now);
  if(!isTradingDayIndex(p.day)) return ((p.day + 4) % 7 == 0 || (p.day + 4) % 7 == 6) ? "WEEKEND" : "HOLIDAY";
  if(p.min < 540) return "CLOSED";
  if(p.min < RULES.OPEN_MIN) return "PRE_OPEN";
  if(p.min < RULES.CLOSE_MIN) return "OPEN";
  if(p.min < RULES.CLOSE_MIN + LIMITS_T.POST_CLOSE_GRACE_MIN) return "POST_CLOSE";
  return "CLOSED";
}

// ---- Freshness ---------------------------------------------------------------------
// info (optional): the quote itself. A provider-reported delay is always "delayed" (and carried as lagMin);
// a quote flagged delayUnreported can never be "live" because the provider did not say it is real time.
export function quoteFreshness(asOf, now, info){
  if(!isNum(asOf)) return { state:"unknown", ageSec:null };
  var age = Math.max(0, Math.round((now - asOf) / 1000));
  if(info && isNum(info.delayedBySec) && info.delayedBySec > 0){
    return { state:(age <= info.delayedBySec + 900 ? "delayed" : "stale"), ageSec:age, lagMin:Math.max(1, Math.round(info.delayedBySec / 60)) };
  }
  if(info && info.delayUnreported == true && age <= LIMITS_T.LIVE_S) return { state:"delayed", ageSec:age };
  if(age <= LIMITS_T.LIVE_S) return { state:"live", ageSec:age };
  if(age <= LIMITS_T.DELAYED_S) return { state:"delayed", ageSec:age };
  return { state:"stale", ageSec:age };
}
export function barFreshness(tfKey, lastEndMs, now){
  var e = expectedLastEnd(tfKey, now);
  if(e == null || !isNum(lastEndMs)) return { state:"stale", lagMin:null };
  var lag = Math.max(0, e - lastEndMs);
  var lagMin = Math.round(lag / 60000);
  if(tfKey == "1D"){ return lag <= 5 * DAY_MS ? { state:(lag == 0 ? "live" : "delayed"), lagMin:lagMin } : { state:"stale", lagMin:lagMin }; }
  if(lag <= LIMITS_T.BAR_LIVE_MS) return { state:"live", lagMin:lagMin };
  if(lag <= LIMITS_T.BAR_DELAYED_MS) return { state:"delayed", lagMin:lagMin };
  return { state:"stale", lagMin:lagMin };
}

// ---- Frame preparation ---------------------------------------------------------------
// frame = { ok, candles:[{time,open,high,low,close,volume}] , code }
export function prepareFrame(tfKey, frame, now){
  if(!frame || frame.ok == false) return { ok:false, code:(frame && frame.code) ? frame.code : "no_data" };
  var v = validateCandles(frame.candles, tfKey, now);
  if(!v.candles.length) return { ok:false, code:"no_data" };
  var bars = [], forming = null;
  for(var i = 0; i < v.candles.length; i++){
    var c = v.candles[i];
    if(c.endMs <= now - 1000) bars.push(c); else forming = c;   // a bar still inside its window never counts as completed
  }
  if(!bars.length) return { ok:false, code:"no_completed_bar" };
  var lastEnd = bars[bars.length - 1].endMs;
  return { ok:true, bars:bars, forming:forming, lastEnd:lastEnd, freshness:barFreshness(tfKey, lastEnd, now), rejected:v.rejected };
}

// Previous session close, taken from the data itself (never from provider "previous close"
// fields, which for multi-day ranges describe the range start, not yesterday).
export function previousClose(bars, now){
  var today = dayOf(now);
  for(var i = bars.length - 1; i >= 0; i--){ if(bars[i].day < today) return { price:bars[i].close, day:bars[i].day }; }
  return null;
}

// ---- Volume baseline -------------------------------------------------------------------
function median(a){
  var s = a.slice().sort(function(x, y){ return x - y; }), n = s.length;
  if(!n) return null;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
// Baseline for the SAME time-of-day slot on previous sessions (intraday) or the previous
// completed daily bars. The tested bar must already be complete; baseline bars are all from
// earlier days, so a forming candle is never compared with completed ones.
export function volumeBaseline(bars, tfKey){
  var last = bars[bars.length - 1];
  if(!last) return { ok:false, code:"no_data" };
  var vols = [], i;
  if(tfKey == "1D"){
    for(i = bars.length - 2; i >= 0 && vols.length < LIMITS_T.MAX_DAILY_BASE; i--){ if(bars[i].volume > 0) vols.push(bars[i].volume); }
    if(vols.length < LIMITS_T.MIN_DAILY_BASE) return { ok:false, code:"insufficient_baseline", have:vols.length, need:LIMITS_T.MIN_DAILY_BASE };
  } else {
    var slot = istParts(last.startMs).min, seenDays = {};
    for(i = bars.length - 2; i >= 0 && vols.length < LIMITS_T.MAX_SESSIONS_INTRADAY; i--){
      var b = bars[i];
      if(b.day >= last.day) continue;
      if(istParts(b.startMs).min != slot || seenDays[b.day]) continue;
      seenDays[b.day] = true;
      if(b.volume > 0) vols.push(b.volume);
    }
    if(vols.length < LIMITS_T.MIN_SESSIONS_INTRADAY) return { ok:false, code:"insufficient_baseline", have:vols.length, need:LIMITS_T.MIN_SESSIONS_INTRADAY };
  }
  return { ok:true, baseline:median(vols), sessions:vols.length, method:(tfKey == "1D" ? "median of previous daily volumes" : "median of the same time-of-day candle on previous sessions") };
}

// ---- Helpers for events ----------------------------------------------------------------
function freshOut(f, extra){ return Object.assign({ state:f.state, source:"yahoo" }, extra || {}); }
function makeEvent(rule, code, direction, basis, price, eventTime, fresh, reasonVars, key, extra){
  return Object.assign({
    ruleId:rule.id || null, symbol:rule.symbol, type:rule.type, event:code, direction:direction, basis:basis,
    price:price, timeframe:rule.timeframe, eventTime:eventTime, freshness:fresh, reason:reasonVars || {}, key:key
  }, extra || {});
}
function pushKey(state, key){
  var keys = (state.keys || []).slice();
  keys.push(key);
  while(keys.length > LIMITS_T.KEEP_KEYS) keys.shift();
  return keys;
}
function result(status, reason, detail, events, state, extra){
  return Object.assign({ status:status, reason:reason || null, detail:detail || {}, events:events || [], state:state }, extra || {});
}

// ---- Main entry -------------------------------------------------------------------------
// rule:  { id, symbol, type, timeframe, params, enabled }
// snap:  { ok, code, quote:{price, asOf}, frames:{ "5m":frame, ... } }
// state: per-rule state saved by the caller (may be null)
export function evaluateRule(rule, snap, state, now){
  var st = Object.assign({ keys:[], side:null, armed:true, lastFiredAt:null, suppressed:0, firedDay:{}, lastCheckAt:null }, state || {});
  var def = RULE_TYPES[rule.type];
  if(!def) return result("error", "invalid_type", {}, [], st);
  if(rule.enabled == false) return result("disabled", null, {}, [], st);

  var session = sessionAt(now);
  var needsCompleted = def.group == "candle" || def.group == "volume" || rule.type == "breakout" || rule.type == "breakdown";
  var sessionOk = session == "OPEN" || (needsCompleted && session == "POST_CLOSE");
  if(!sessionOk) return result("market_closed", session, { session:session }, [], Object.assign(st, { lastCheckAt:now }));

  if(!snap || snap.ok == false) return result("unavailable", (snap && snap.code) ? snap.code : "no_data", { session:session }, [], Object.assign(st, { lastCheckAt:now }));

  var out;
  if(rule.type == "price_above" || rule.type == "price_below") out = evalLevel(rule, snap, st, now, session);
  else if(rule.type == "pct_up" || rule.type == "pct_down") out = evalPct(rule, snap, st, now, session);
  else if(rule.type == "breakout" || rule.type == "breakdown") out = evalBreak(rule, snap, st, now, session);
  else if(rule.type == "candle") out = evalCandle(rule, snap, st, now, session);
  else out = evalVolume(rule, snap, st, now, session);

  // cooldown / duplicate gate applied to every event
  var kept = [], cs = out.state, cool = COOLDOWN_MS[rule.type] || 0;
  for(var i = 0; i < out.events.length; i++){
    var ev = out.events[i];
    if(cs.keys.indexOf(ev.key) >= 0){ cs.suppressed = (cs.suppressed || 0) + 1; continue; }
    if(cool > 0 && cs.lastFiredAt != null && now - cs.lastFiredAt < cool){ cs.suppressed = (cs.suppressed || 0) + 1; out.status = "cooldown"; continue; }
    kept.push(ev);
    cs.keys = pushKey(cs, ev.key);
    cs.lastFiredAt = now;
  }
  out.events = kept;
  if(kept.length) out.status = "triggered";
  cs.lastCheckAt = now;
  out.state = cs;
  return out;
}

function priceOf(snap){
  if(!snap.quote || !isNum(snap.quote.price) || snap.quote.price <= 0) return null;
  return snap.quote;
}

function evalLevel(rule, snap, st, now, session){
  var q = priceOf(snap);
  if(!q) return result("unavailable", "no_quote", { session:session }, [], st);
  var fr = quoteFreshness(q.asOf, now, q);
  var detail = { price:q.price, level:rule.params.value, freshness:freshOut(fr, { ageSec:fr.ageSec, lagMin:fr.lagMin }), session:session };
  if(fr.state == "stale" || fr.state == "unknown") return result("stale", "quote_stale", detail, [], st);
  var level = rule.params.value, up = rule.type == "price_above";
  // real traded extremes since the last check (completed + forming 5m bars) catch a cross between checks
  var hi = q.price, lo = q.price;
  var fp = snap.frames && snap.frames["5m"] ? prepareFrame("5m", snap.frames["5m"], now) : null;
  if(fp && fp.ok && st.lastCheckAt != null){
    var all = fp.bars.slice(); if(fp.forming) all.push(fp.forming);
    for(var i = 0; i < all.length; i++){
      if(all[i].endMs > st.lastCheckAt){ if(all[i].high > hi) hi = all[i].high; if(all[i].low < lo) lo = all[i].low; }
    }
  }
  var h = LIMITS_T.HYST, side = st.side, cur;
  if(up){ cur = q.price >= level ? "beyond" : (q.price <= level * (1 - h) ? "before" : side); }
  else  { cur = q.price <= level ? "beyond" : (q.price >= level * (1 + h) ? "before" : side); }
  var touched = up ? (hi >= level) : (lo <= level);
  var events = [];
  var next = Object.assign({}, st);
  if(side == null){
    next.side = cur == null ? "before" : cur;      // first look: never fires on a level already passed
    if(next.side == "beyond") detail.waitReason = "already_beyond";
  } else if(side == "before"){
    if(cur == "beyond" || touched){
      var between = cur != "beyond";                // crossed and came back between two checks
      var seen = up ? Math.max(q.price, hi) : Math.min(q.price, lo);
      next.side = "beyond";
      next.fires = (st.fires || 0) + 1;
      events.push(makeEvent(rule, rule.type, up ? "up" : "down", "last_price", q.price, q.asOf, freshOut(fr, { ageSec:fr.ageSec, lagMin:fr.lagMin }),
        { level:level, seen:seen, between:between }, rule.id + "|" + rule.type + "|" + level + "|" + dayOf(now) + "|" + next.fires, { pct:null }));
    } else if(cur != null){ next.side = cur; }
  } else {
    if(cur == "before") next.side = "before";       // clearly back on the other side: re-armed
    else detail.waitReason = "beyond_wait_rearm";
  }
  return result(events.length ? "triggered" : "waiting", detail.waitReason || null, detail, events, next);
}

function evalPct(rule, snap, st, now, session){
  var q = priceOf(snap);
  if(!q) return result("unavailable", "no_quote", { session:session }, [], st);
  var fr = quoteFreshness(q.asOf, now, q);
  var f5 = snap.frames && snap.frames["5m"] ? prepareFrame("5m", snap.frames["5m"], now) : null;
  var prev = (f5 && f5.ok) ? previousClose(f5.bars, now) : null;
  var detail = { price:q.price, freshness:freshOut(fr, { ageSec:fr.ageSec, lagMin:fr.lagMin }), session:session, threshold:rule.params.pct };
  if(fr.state == "stale" || fr.state == "unknown") return result("stale", "quote_stale", detail, [], st);
  if(!prev || !(prev.price > 0)) return result("unavailable", "no_prev_close", detail, [], st);
  var pct = (q.price - prev.price) / prev.price * 100;
  detail.pct = Math.round(pct * 100) / 100; detail.prevClose = prev.price;
  var up = rule.type == "pct_up", th = rule.params.pct;
  var hit = up ? pct >= th : pct <= -th;
  var events = [], next = Object.assign({}, st, { firedDay:Object.assign({}, st.firedDay || {}) });
  var dk = dayOf(now);
  if(hit && next.firedDay[rule.type] != dk){
    next.firedDay[rule.type] = dk;
    events.push(makeEvent(rule, rule.type, up ? "up" : "down", "last_price", q.price, q.asOf, freshOut(fr, { ageSec:fr.ageSec, lagMin:fr.lagMin }),
      { pct:detail.pct, threshold:th, prevClose:prev.price }, rule.id + "|" + rule.type + "|" + dk, { pct:detail.pct }));
  } else if(hit){ detail.waitReason = "already_fired_today"; }
  return result(events.length ? "triggered" : "waiting", detail.waitReason || null, detail, events, next);
}

function barsFor(rule, snap, now){
  var fr = snap.frames ? snap.frames[rule.timeframe] : null;
  return prepareFrame(rule.timeframe, fr, now);
}

function evalBreak(rule, snap, st, now, session){
  var p = barsFor(rule, snap, now);
  if(!p.ok) return result("unavailable", p.code, { session:session }, [], st);
  var detail = { freshness:freshOut(p.freshness, { lagMin:p.freshness.lagMin }), session:session, timeframe:rule.timeframe };
  if(p.freshness.state == "stale") return result("stale", "bars_stale", detail, [], st);
  var lb = levelAndBreakout(p.bars, p.forming);
  if(!lb) return result("unavailable", "insufficient_history", detail, [], st);
  detail.resistance = lb.resistance; detail.support = lb.support; detail.lastClose = lb.lastClose;
  var want = rule.type == "breakout" ? 1 : -1;
  var last = p.bars[p.bars.length - 1];
  var next = Object.assign({}, st);
  var events = [];
  if(lb.brk.dir == want){
    var level = want == 1 ? lb.resistance : lb.support;
    if(next.armed != false){
      next.armed = false;
      events.push(makeEvent(rule, rule.type, want == 1 ? "up" : "down", "completed_candle", last.close, last.endMs, freshOut(p.freshness, { lagMin:p.freshness.lagMin }),
        { level:level, close:last.close, confirmed:lb.brk.state == "confirmed" }, rule.id + "|" + rule.type + "|" + rule.timeframe + "|" + last.t, { pct:null }));
    } else detail.waitReason = "already_beyond";
  } else {
    next.armed = true;                       // closed back inside: re-armed
    if(lb.forming == want) detail.waitReason = "intrabar_only";
    else if(lb.touch == want) detail.waitReason = "wick_only";
  }
  return result(events.length ? "triggered" : "waiting", detail.waitReason || null, detail, events, next);
}

function evalCandle(rule, snap, st, now, session){
  var p = barsFor(rule, snap, now);
  if(!p.ok) return result("unavailable", p.code, { session:session }, [], st);
  var detail = { freshness:freshOut(p.freshness, { lagMin:p.freshness.lagMin }), session:session, timeframe:rule.timeframe };
  if(p.freshness.state == "stale") return result("stale", "bars_stale", detail, [], st);
  if(p.bars.length < MIN_CANDLES) return result("unavailable", "insufficient_history", detail, [], st);
  var cs = p.bars.map(function(b){ return { t:b.t, o:b.open, h:b.high, l:b.low, c:b.close, v:b.volume }; });
  var d = detectPatterns(cs);
  if(!d.ok) return result("unavailable", d.code, detail, [], st);
  var last = p.bars[p.bars.length - 1], events = [];
  var want = rule.params.patterns || [];
  for(var i = 0; i < d.found.length; i++){
    if(want.indexOf(d.found[i].id) < 0) continue;
    events.push(makeEvent(rule, "candle", d.found[i].direction, "completed_candle", last.close, last.endMs, freshOut(p.freshness, { lagMin:p.freshness.lagMin }),
      { pattern:d.found[i].id }, rule.id + "|candle|" + rule.timeframe + "|" + last.t + "|" + d.found[i].id, { pattern:d.found[i].id, pct:null }));
  }
  detail.patternsFound = d.found.map(function(x){ return x.id; });
  return result(events.length ? "triggered" : "waiting", null, detail, events, Object.assign({}, st));
}

function evalVolume(rule, snap, st, now, session){
  var p = barsFor(rule, snap, now);
  if(!p.ok) return result("unavailable", p.code, { session:session }, [], st);
  var detail = { freshness:freshOut(p.freshness, { lagMin:p.freshness.lagMin }), session:session, timeframe:rule.timeframe };
  if(p.freshness.state == "stale") return result("stale", "bars_stale", detail, [], st);
  var last = p.bars[p.bars.length - 1];
  var anyVol = false;
  for(var i = 0; i < p.bars.length; i++){ if(p.bars[i].volume > 0){ anyVol = true; break; } }
  if(!anyVol) return result("unavailable", "volume_unavailable", detail, [], st);
  if(!(last.volume > 0)) return result("unavailable", "volume_unavailable", detail, [], st);
  var bl = volumeBaseline(p.bars, rule.timeframe);
  if(!bl.ok) return result("unavailable", bl.code, Object.assign(detail, { have:bl.have, need:bl.need }), [], st);
  var ratio = last.volume / bl.baseline;
  detail.volume = last.volume; detail.baseline = Math.round(bl.baseline); detail.ratio = Math.round(ratio * 100) / 100; detail.sessions = bl.sessions;
  var spike = ratio >= rule.params.mult;
  var movePct = (last.close - last.open) / last.open * 100;
  detail.movePct = Math.round(movePct * 100) / 100;
  var ok = spike, dir = "neutral";
  if(rule.type == "price_up_volume"){ ok = spike && movePct >= rule.params.minMovePct; dir = "up"; }
  else if(rule.type == "price_down_volume"){ ok = spike && movePct <= -rule.params.minMovePct; dir = "down"; }
  else dir = movePct > 0 ? "up" : (movePct < 0 ? "down" : "neutral");
  var events = [];
  if(ok){
    events.push(makeEvent(rule, rule.type, dir, "completed_candle", last.close, last.endMs, freshOut(p.freshness, { lagMin:p.freshness.lagMin }),
      { ratio:detail.ratio, mult:rule.params.mult, volume:last.volume, baseline:detail.baseline, sessions:bl.sessions, movePct:detail.movePct }, rule.id + "|" + rule.type + "|" + rule.timeframe + "|" + last.t, { pct:detail.movePct }));
  }
  return result(events.length ? "triggered" : "waiting", null, detail, events, Object.assign({}, st));
}

// Evaluate many rules for one owner against one batch of snapshots.
// snaps: { SYMBOL: snapshot }, states: { ruleId: state }. Returns { results:{ruleId: result}, events:[...] }
export function evaluateAll(rules, snaps, states, now){
  var results = {}, events = [];
  for(var i = 0; i < rules.length; i++){
    var r = rules[i];
    var res = evaluateRule(r, snaps[r.symbol] || null, (states || {})[r.id] || null, now);
    results[r.id] = res;
    for(var k = 0; k < res.events.length; k++) events.push(res.events[k]);
  }
  return { results:results, events:events };
}

export { istLabel };
