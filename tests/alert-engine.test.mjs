// Smart Alerts engine tests. ALL market data is MOCK (fixture formulas), so these prove the
// logic, not any real provider.
import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRule, evaluateAll, sessionAt, quoteFreshness, volumeBaseline, prepareFrame, previousClose, LIMITS_T } from "../src/alerts/alertEngine.js";
import { validateRuleInput } from "../src/alerts/alertRules.js";
import { makeFrame, flat, tradingDays, T0, istMs } from "./alert-helpers.mjs";

var NOW = istMs(2026, 10, 13, 11, 0) + 5000;           // Tue 11:00:05 IST, market open
var PREV = tradingDays(T0 - 1, 5);

function rule(type, extra){
  var base = { id:"r1", symbol:"RELIANCE", type:type, timeframe:"5m", enabled:true, params:{} };
  return Object.assign(base, extra || {});
}
// today's 5m series: previous sessions flat at 100 (close 100), today follows `todayFn`
function snap5(todayFn, o){
  o = o || {};
  var now = o.now != null ? o.now : NOW;
  var fn = function(di, k, isToday){ return isToday ? todayFn(k) : { o:100, h:100.5, l:99.5, c:100, v:1000 + (k % 3) * 10 }; };
  var candles = makeFrame(PREV, 5, fn, T0, now);
  var last = candles[candles.length - 1];
  var price = o.price != null ? o.price : last.close;
  return { ok:true, quote:{ price:price, asOf:o.asOf != null ? o.asOf : now - 20000 }, frames:{ "5m":{ ok:true, candles:candles } } };
}
function todayAt(price){ return function(k){ return { o:price, h:price + 0.4, l:price - 0.4, c:price, v:1000 }; }; }

test("session clock: open, pre-open, post-close grace, weekend, listed holiday", function(){
  assert.equal(sessionAt(NOW), "OPEN");
  assert.equal(sessionAt(istMs(2026, 10, 13, 9, 5)), "PRE_OPEN");
  assert.equal(sessionAt(istMs(2026, 10, 13, 15, 32)), "POST_CLOSE");
  assert.equal(sessionAt(istMs(2026, 10, 13, 15, 40)), "CLOSED");
  assert.equal(sessionAt(istMs(2026, 10, 17, 11, 0)), "WEEKEND");
  assert.equal(sessionAt(istMs(2026, 10, 20, 11, 0)), "HOLIDAY");   // Dussehra, in the app's own 2026 list
});

// ---- 1. price rising and falling through configured thresholds --------------------------
test("price crossing ABOVE a value fires once, only on the cross", function(){
  var r = rule("price_above", { params:{ value:101 } });
  var a = evaluateRule(r, snap5(todayAt(100.3)), null, NOW);              // first look, below: waiting
  assert.equal(a.status, "waiting"); assert.equal(a.state.side, "before"); assert.equal(a.events.length, 0);
  var b = evaluateRule(r, snap5(todayAt(101.4), { price:101.4, now:NOW + 300000 }), a.state, NOW + 300000);
  assert.equal(b.status, "triggered"); assert.equal(b.events.length, 1);
  var e = b.events[0];
  assert.equal(e.direction, "up"); assert.equal(e.price, 101.4); assert.equal(e.basis, "last_price"); assert.equal(e.symbol, "RELIANCE");
  assert.ok(e.eventTime > 0 && e.freshness.state == "live");
});
test("price crossing BELOW a value fires", function(){
  var r = rule("price_below", { params:{ value:99 } });
  var a = evaluateRule(r, snap5(todayAt(100)), null, NOW);
  var b = evaluateRule(r, snap5(todayAt(98.6), { price:98.6 }), a.state, NOW + 300000);
  assert.equal(b.events.length, 1); assert.equal(b.events[0].direction, "down");
});
test("a level already passed at creation does not fire; it waits for a re-cross", function(){
  var r = rule("price_above", { params:{ value:99 } });
  var a = evaluateRule(r, snap5(todayAt(100)), null, NOW);
  assert.equal(a.events.length, 0); assert.equal(a.reason, "already_beyond");
});
test("a cross between two checks is caught from real traded highs, labelled as between", function(){
  var r = rule("price_above", { params:{ value:101 } });
  var a = evaluateRule(r, snap5(todayAt(100)), null, NOW);
  var t2 = NOW + 300000;
  var s2 = snap5(function(k){ return k == 21 ? { o:100, h:101.6, l:99.9, c:100.2, v:1000 } : { o:100, h:100.4, l:99.6, c:100, v:1000 }; }, { now:t2, price:100.2 });
  var b = evaluateRule(r, s2, a.state, t2);
  assert.equal(b.events.length, 1); assert.equal(b.events[0].reason.between, true); assert.ok(b.events[0].reason.seen >= 101.6);
});
test("percentage rise and fall thresholds use the previous session close from the data", function(){
  var up = rule("pct_up", { params:{ pct:1.5 } }), dn = rule("pct_down", { params:{ pct:1.5 } });
  var sUp = snap5(todayAt(101.8), { price:101.8 });
  var a = evaluateRule(up, sUp, null, NOW);
  assert.equal(a.events.length, 1); assert.equal(a.events[0].direction, "up"); assert.ok(a.events[0].pct > 1.7 && a.events[0].pct < 1.9);
  var sDn = snap5(todayAt(98.2), { price:98.2 });
  var b = evaluateRule(dn, sDn, null, NOW);
  assert.equal(b.events.length, 1); assert.equal(b.events[0].direction, "down");
  var below = evaluateRule(up, snap5(todayAt(101.0), { price:101.0 }), null, NOW);
  assert.equal(below.events.length, 0); assert.equal(below.status, "waiting");
});
test("percentage rule fires once per session day, then re-arms the next day", function(){
  var r = rule("pct_up", { params:{ pct:1.5 } });
  var a = evaluateRule(r, snap5(todayAt(102), { price:102 }), null, NOW);
  var b = evaluateRule(r, snap5(todayAt(102.2), { price:102.2 }), a.state, NOW + 300000);
  assert.equal(b.events.length, 0); assert.equal(b.reason, "already_fired_today");
  var key = a.events[0].key;
  assert.ok(key.indexOf(String(T0)) > 0);
});
test("previous close is derived from candles, not from a provider field", function(){
  var s = snap5(todayAt(100));
  var p = prepareFrame("5m", s.frames["5m"], NOW);
  var pc = previousClose(p.bars, NOW);
  assert.equal(pc.price, 100); assert.ok(pc.day < T0);
});

// ---- 6. stale data and provider errors ----------------------------------------------------
test("stale quote never fires and is labelled stale", function(){
  var r = rule("price_above", { params:{ value:99 } });
  var res = evaluateRule(r, snap5(todayAt(105), { price:105, asOf:NOW - 3600000 }), { side:"before", keys:[] }, NOW);
  assert.equal(res.status, "stale"); assert.equal(res.events.length, 0);
});
test("delayed quote may fire but carries the DELAYED label, never live", function(){
  var r = rule("price_above", { params:{ value:101 } });
  var st = evaluateRule(r, snap5(todayAt(100)), null, NOW).state;
  var res = evaluateRule(r, snap5(todayAt(102), { price:102, asOf:NOW - 15 * 60000 }), st, NOW);
  assert.equal(res.events[0].freshness.state, "delayed");
  assert.equal(quoteFreshness(NOW - 30000, NOW).state, "live");
  assert.equal(quoteFreshness(NOW - 25 * 60000, NOW).state, "stale");
  assert.equal(quoteFreshness(null, NOW).state, "unknown");
});
test("provider errors become unavailable with a reason code, no event", function(){
  ["provider_error", "rate_limited", "timeout", "no_data"].forEach(function(code){
    var res = evaluateRule(rule("price_above", { params:{ value:99 } }), { ok:false, code:code }, null, NOW);
    assert.equal(res.status, "unavailable"); assert.equal(res.reason, code); assert.equal(res.events.length, 0);
  });
  assert.equal(evaluateRule(rule("candle", { params:{ patterns:["doji"] } }), null, null, NOW).status, "unavailable");
});

// ---- 8. market closed ---------------------------------------------------------------------
test("market closed, weekend and holiday: nothing fires", function(){
  var r = rule("price_above", { params:{ value:99 } });
  [istMs(2026, 10, 13, 8, 0), istMs(2026, 10, 13, 16, 30), istMs(2026, 10, 17, 11, 0), istMs(2026, 10, 20, 11, 0)].forEach(function(t){
    var res = evaluateRule(r, snap5(todayAt(105), { price:105 }), { side:"before", keys:[] }, t);
    assert.equal(res.status, "market_closed"); assert.equal(res.events.length, 0);
  });
});
test("disabled rules are not evaluated", function(){
  assert.equal(evaluateRule(rule("price_above", { enabled:false, params:{ value:1 } }), snap5(todayAt(100)), null, NOW).status, "disabled");
});

// ---- 7. duplicate suppression, cooldown and re-arm ----------------------------------------
test("price level: no repeat while beyond; re-arms after a clear move back; cooldown holds a quick repeat", function(){
  var r = rule("price_above", { params:{ value:101 } });
  var t = NOW;
  function at(price, dt){ return snap5(todayAt(price), { price:price, now:t + dt }); }
  var s0 = evaluateRule(r, at(100, 0), null, t).state;
  var f1 = evaluateRule(r, at(102, 60000), s0, t + 60000);
  assert.equal(f1.events.length, 1);
  var again = evaluateRule(r, at(103, 120000), f1.state, t + 120000);
  assert.equal(again.events.length, 0); assert.equal(again.reason, "beyond_wait_rearm");
  var back = evaluateRule(r, at(100, 180000), again.state, t + 180000);
  assert.equal(back.state.side, "before");
  var quick = evaluateRule(r, at(102, 240000), back.state, t + 240000);       // inside the 15 minute cooldown
  assert.equal(quick.events.length, 0); assert.equal(quick.status, "cooldown"); assert.ok(quick.state.suppressed >= 1);
  var later = evaluateRule(r, at(102, 60000 + 16 * 60000), back.state, t + 60000 + 16 * 60000);
  assert.equal(later.events.length, 1);
});

// ---- breakout / breakdown -----------------------------------------------------------------
// 30 completed bars ranging 100 +/- 0.5 then a completed bar closing beyond resistance (100.5)
function brkSnap(lastBar, forming){
  var tf = 15, bars = [];
  var days = tradingDays(T0 - 1, 3);
  var fn = function(di, k, isToday){
    if(!isToday) return { o:100, h:100.5, l:99.5, c:100 + ((k % 2) ? 0.2 : -0.2), v:5000 };
    if(k < 8) return { o:100, h:100.5, l:99.5, c:100.1, v:5000 };
    return lastBar(k);
  };
  var now = istMs(2026, 10, 13, 12, 0) + 5000;
  var candles = makeFrame(days, tf, fn, T0, now);
  return { snap:{ ok:true, quote:{ price:100, asOf:now - 10000 }, frames:{ "15m":{ ok:true, candles:candles } } }, now:now, n:candles.length };
}
test("breakout: completed close above resistance fires; the same level does not repeat; re-arms when back inside", function(){
  var r = rule("breakout", { timeframe:"15m", params:{} });
  // bars k>=8 today: ordinary until the LAST completed bar closes at 102
  var now0 = istMs(2026, 10, 13, 12, 0) + 5000;
  var fn = function(k){ return { o:100, h:100.5, l:99.5, c:100.1, v:5000 }; };
  var b0 = brkSnap(fn);
  var a = evaluateRule(r, b0.snap, null, b0.now);
  assert.equal(a.events.length, 0); assert.equal(a.status, "waiting");
  var lastCompletedStart = Math.floor((b0.now - 1000 - istMs(2026, 10, 13, 9, 15)) / 900000) - 1;
  var fn2 = function(k){ return k == lastCompletedStart ? { o:100.2, h:102.3, l:100.1, c:102.0, v:9000 } : fn(k); };
  var b1 = brkSnap(fn2);
  var f = evaluateRule(r, b1.snap, a.state, b1.now);
  assert.equal(f.events.length, 1, JSON.stringify(f.detail));
  assert.equal(f.events[0].basis, "completed_candle"); assert.equal(f.events[0].direction, "up"); assert.ok(f.events[0].reason.level < 102);
  var g = evaluateRule(r, b1.snap, f.state, b1.now + 1000);
  assert.equal(g.events.length, 0);
  var h = evaluateRule(r, b0.snap, f.state, b0.now);
  assert.equal(h.state.armed, true);
});
test("false breakout: a wick above resistance, or a forming bar above it, never alerts", function(){
  var r = rule("breakout", { timeframe:"15m", params:{} });
  var idx = Math.floor((istMs(2026, 10, 13, 12, 0) + 5000 - 1000 - istMs(2026, 10, 13, 9, 15)) / 900000) - 1;
  var wick = brkSnap(function(k){ return k == idx ? { o:100, h:103, l:99.6, c:100.2, v:5000 } : { o:100, h:100.5, l:99.5, c:100.1, v:5000 }; });
  var w = evaluateRule(r, wick.snap, null, wick.now);
  assert.equal(w.events.length, 0); assert.equal(w.reason, "wick_only");
  var forming = brkSnap(function(k){ return k == idx + 1 ? { o:100, h:103, l:100, c:102.8, v:5000 } : { o:100, h:100.5, l:99.5, c:100.1, v:5000 }; });
  var f = evaluateRule(r, forming.snap, null, forming.now);
  assert.equal(f.events.length, 0); assert.equal(f.reason, "intrabar_only");
});
test("breakdown: completed close below support fires with direction down", function(){
  var r = rule("breakdown", { timeframe:"15m", params:{} });
  var idx = Math.floor((istMs(2026, 10, 13, 12, 0) + 5000 - 1000 - istMs(2026, 10, 13, 9, 15)) / 900000) - 1;
  var s = brkSnap(function(k){ return k == idx ? { o:99.8, h:99.9, l:97.8, c:98.0, v:5000 } : { o:100, h:100.5, l:99.5, c:100.1, v:5000 }; });
  var f = evaluateRule(r, s.snap, null, s.now);
  assert.equal(f.events.length, 1); assert.equal(f.events[0].direction, "down");
});

// ---- 3 / 4. volume spike with valid baseline; missing or insufficient history -------------
function volSnap(todayVol, sessions, opts){
  opts = opts || {};
  var days = tradingDays(T0 - 1, sessions);
  var now = istMs(2026, 10, 13, 11, 0) + 5000;
  var fn = function(di, k, isToday){ return { o:100, h:100.6, l:99.6, c:100.2, v:(isToday ? todayVol(k) : (opts.noVol ? 0 : 1000 + (di % 2) * 100)) }; };
  var candles = makeFrame(days, 15, fn, T0, now);
  return { snap:{ ok:true, quote:{ price:100.2, asOf:now - 10000 }, frames:{ "15m":{ ok:true, candles:candles } } }, now:now, candles:candles };
}
test("volume spike: last COMPLETED candle vs the median of the same time-of-day candle on previous sessions", function(){
  var idx = Math.floor((istMs(2026, 10, 13, 11, 0) + 5000 - 1000 - istMs(2026, 10, 13, 9, 15)) / 900000) - 1;
  var s = volSnap(function(k){ return k == idx ? 2600 : 1000; }, 5);
  var r = rule("volume_spike", { timeframe:"15m", params:{ mult:2 } });
  var res = evaluateRule(r, s.snap, null, s.now);
  assert.equal(res.events.length, 1, JSON.stringify(res.detail));
  assert.ok(res.events[0].reason.ratio >= 2.3 && res.events[0].reason.sessions >= 3);
  assert.equal(res.events[0].basis, "completed_candle");
  var no = evaluateRule(rule("volume_spike", { timeframe:"15m", params:{ mult:3 } }), s.snap, null, s.now);
  assert.equal(no.events.length, 0); assert.equal(no.status, "waiting");
});
test("the forming candle is never compared with completed ones", function(){
  var idx = Math.floor((istMs(2026, 10, 13, 11, 0) + 5000 - 1000 - istMs(2026, 10, 13, 9, 15)) / 900000) - 1;
  var s = volSnap(function(k){ return k == idx + 1 ? 90000 : 1000; }, 5);        // only the forming bar is huge
  var res = evaluateRule(rule("volume_spike", { timeframe:"15m", params:{ mult:2 } }), s.snap, null, s.now);
  assert.equal(res.events.length, 0);
  var p = prepareFrame("15m", s.snap.frames["15m"], s.now);
  assert.ok(p.forming && p.forming.volume == 90000);
  assert.ok(p.bars.every(function(b){ return b.endMs <= s.now; }));
});
test("insufficient baseline history -> unavailable (no signal invented)", function(){
  var idx = Math.floor((istMs(2026, 10, 13, 11, 0) + 5000 - 1000 - istMs(2026, 10, 13, 9, 15)) / 900000) - 1;
  var s = volSnap(function(k){ return k == idx ? 9000 : 1000; }, 2);
  var res = evaluateRule(rule("volume_spike", { timeframe:"15m", params:{ mult:2 } }), s.snap, null, s.now);
  assert.equal(res.status, "unavailable"); assert.equal(res.reason, "insufficient_baseline"); assert.equal(res.events.length, 0);
  assert.equal(LIMITS_T.MIN_SESSIONS_INTRADAY, 3);
});
test("no volume at all (typical for an index) -> volume unavailable", function(){
  var s = volSnap(function(){ return 0; }, 5, { noVol:true });
  var res = evaluateRule(rule("volume_spike", { symbol:"NIFTY", timeframe:"15m", params:{ mult:2 } }), s.snap, null, s.now);
  assert.equal(res.status, "unavailable"); assert.equal(res.reason, "volume_unavailable");
});
test("price up + volume spike and price down + volume spike", function(){
  var idx = Math.floor((istMs(2026, 10, 13, 11, 0) + 5000 - 1000 - istMs(2026, 10, 13, 9, 15)) / 900000) - 1;
  function mk(o, c){
    var days = tradingDays(T0 - 1, 5), now = istMs(2026, 10, 13, 11, 0) + 5000;
    var fn = function(di, k, isToday){ if(isToday && k == idx) return { o:o, h:Math.max(o, c) + 0.1, l:Math.min(o, c) - 0.1, c:c, v:3000 }; return { o:100, h:100.6, l:99.6, c:100.2, v:1000 }; };
    return { snap:{ ok:true, quote:{ price:c, asOf:now - 5000 }, frames:{ "15m":{ ok:true, candles:makeFrame(days, 15, fn, T0, now) } } }, now:now };
  }
  var u = mk(100, 101), d = mk(100, 99);
  var ru = rule("price_up_volume", { timeframe:"15m", params:{ mult:2, minMovePct:0.3 } });
  var rd = rule("price_down_volume", { timeframe:"15m", params:{ mult:2, minMovePct:0.3 } });
  assert.equal(evaluateRule(ru, u.snap, null, u.now).events.length, 1);
  assert.equal(evaluateRule(ru, d.snap, null, d.now).events.length, 0);
  assert.equal(evaluateRule(rd, d.snap, null, d.now).events.length, 1);
  assert.equal(evaluateRule(rd, u.snap, null, u.now).events.length, 0);
});
test("volume baseline helper reports how many sessions and which method", function(){
  var s = volSnap(function(){ return 1000; }, 5);
  var p = prepareFrame("15m", s.snap.frames["15m"], s.now);
  var b = volumeBaseline(p.bars, "15m");
  assert.equal(b.ok, true); assert.ok(b.sessions >= 3 && /same time-of-day/.test(b.method));
});

// ---- candle rule: dedupe per candle -------------------------------------------------------
test("candle rule fires once per completed candle and pattern", function(){
  var idx = Math.floor((istMs(2026, 10, 13, 11, 0) + 5000 - 1000 - istMs(2026, 10, 13, 9, 15)) / 900000) - 1;
  var days = tradingDays(T0 - 1, 3), now = istMs(2026, 10, 13, 11, 0) + 5000;
  var fn = function(di, k, isToday){
    if(isToday && k == idx) return { o:100.0, h:101.0, l:99.0, c:100.02, v:1000 };    // doji
    var d = (k % 2) ? 0.4 : -0.4; return { o:100, h:100.8, l:99.2, c:100 + d, v:1000 };
  };
  var snap = { ok:true, quote:{ price:100, asOf:now - 5000 }, frames:{ "15m":{ ok:true, candles:makeFrame(days, 15, fn, T0, now) } } };
  var r = rule("candle", { timeframe:"15m", params:{ patterns:["doji"] } });
  var a = evaluateRule(r, snap, null, now);
  assert.equal(a.events.length, 1); assert.equal(a.events[0].event, "candle"); assert.equal(a.events[0].reason.pattern, "doji");
  var b = evaluateRule(r, snap, a.state, now + 20000);
  assert.equal(b.events.length, 0);
  var other = evaluateRule(rule("candle", { timeframe:"15m", params:{ patterns:["hammer"] } }), snap, null, now);
  assert.equal(other.events.length, 0);
});

// ---- watchlist-only / batch ---------------------------------------------------------------
test("evaluateAll evaluates each rule against its own symbol only", function(){
  var rules = [ rule("price_above", { id:"a", symbol:"RELIANCE", params:{ value:101 } }), rule("price_above", { id:"b", symbol:"TCS", params:{ value:101 } }) ];
  var snaps = { RELIANCE:snap5(todayAt(100)) };
  var out = evaluateAll(rules, snaps, {}, NOW);
  assert.equal(out.results.a.status, "waiting"); assert.equal(out.results.b.status, "unavailable");
});
test("validated rules feed the engine unchanged", function(){
  var v = validateRuleInput({ symbol:"reliance", type:"volume_spike", timeframe:"15m", params:{ mult:"2.5" } });
  assert.equal(v.ok, true); assert.equal(v.rule.params.mult, 2.5);
});
