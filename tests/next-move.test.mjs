// Next Move Intelligence engine tests. Controlled fixtures only: no real
// provider is contacted and no market accuracy is measured or claimed.
// Run: node --test tests/next-move.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { computeDirection } from "../src/screens/DirectionEngine.js";
import { computeNextMove } from "../src/screens/NextMoveEngine.js";
import { makePayload, NOW } from "./direction-fixtures.mjs";

var DAY = 86400000;
var OPEN = { now:NOW, lastUpdated:NOW-5000 };
function ist(y, mo, d, h, mi){ return Date.UTC(y, mo-1, d, h, mi) - 19800000; }
function nm(payload, opts){ var d = computeDirection(payload, opts || OPEN); return { d:d, m:computeNextMove(d) }; }
function flat(tail){
  var n = 60, bars = [];
  for(var i=0;i<n;i++){
    var c = 24000 + ((i%2) ? 15 : -15);
    if(i >= n - tail.length) c = 24000 + tail[i-(n-tail.length)];
    bars.push({ t:NOW-(n-1-i)*DAY, c:c, h:c+30, l:c-30 });
  }
  return bars;
}
function withBars(p, bars){
  p.directionHistory.NIFTY.candles = bars;
  p.directionHistory.BANKNIFTY.candles = bars.map(function(b){ return { t:b.t, c:b.c*2.2, h:b.h*2.2, l:b.l*2.2 }; });
  p.indices.NIFTY.ltp = bars[bars.length-1].c;                 // the quote describes the same index as the candles
  p.indices.BANKNIFTY.ltp = bars[bars.length-1].c*2.2;
  return p;
}
var CLOSED = { session:"CLOSED", status:"DELAYED" };

test("bullish: two completed closes above resistance = confirmed; bearish side is invalidated", function(){
  var r = nm(makePayload(Object.assign({ niftyKind:"rangeBreakUp", bnKind:"rangeBreakUp", niftyChg:0.6, bnChg:0.7 }, CLOSED)));
  assert.equal(r.m.state, "ok");
  assert.equal(r.m.assessment, "upside");
  assert.equal(r.m.scenarios.bull.status, "confirmed");
  assert.equal(r.m.scenarios.bear.status, "invalidated");
  assert.equal(r.m.scenarios.bull.triggerLevel, r.d.tech.nifty.resistance);   // level comes from the direction engine
  assert.equal(r.m.scenarios.bull.invalidationLevel, r.d.tech.nifty.support);
});

test("bullish during the session: price beyond the level is only triggered, never confirmed", function(){
  var r = nm(makePayload({ niftyKind:"rangeBreakUp", bnKind:"rangeBreakUp", niftyChg:0.6, bnChg:0.7 }));
  assert.equal(r.m.assessment, "upside");
  assert.equal(r.m.scenarios.bull.status, "triggered");
  assert.equal(r.m.provisional, true);
});

test("bearish mirror", function(){
  var r = nm(makePayload(Object.assign({ niftyKind:"rangeBreakDown", bnKind:"rangeBreakDown", niftyChg:-0.6, bnChg:-0.7 }, CLOSED)));
  assert.equal(r.m.assessment, "downside");
  assert.equal(r.m.scenarios.bear.status, "confirmed");
  assert.equal(r.m.scenarios.bull.status, "invalidated");
});

test("range-bound: balanced signals inside the range with both scenarios waiting", function(){
  var r = nm(withBars(makePayload({ niftyChg:0.05, bnChg:0.05, sectorsUp:3, vixChg:0, crudeChg:0.2 }), flat([5, -5])));
  assert.equal(r.m.assessment, "range");
  assert.equal(r.m.scenarios.bull.status, "waiting");
  assert.equal(r.m.scenarios.bear.status, "waiting");
});

test("conflicting signals give no reliable setup - wait", function(){
  var r = nm(makePayload({ niftyKind:"up", bnKind:"down", niftyChg:-0.5, bnChg:-0.6, sectorsUp:3 }));
  assert.equal(r.m.assessment, "wait");
  assert.equal(r.m.state, "ok");
});

test("reversal: fresh EMA cross after an established opposite trend", function(){
  var n = 60, c = 25000, bars = [];
  for(var i=0;i<n;i++){ c = c*(1 + (i < n-6 ? -0.35 : 1.2)/100); bars.push({ t:NOW-(n-1-i)*DAY, c:Math.round(c*100)/100, h:Math.round(c*1.002*100)/100, l:Math.round(c*0.998*100)/100 }); }
  var r = nm(withBars(makePayload({ niftyChg:0.6, bnChg:0.7, sectorsUp:4, vixChg:0 }), bars));
  assert.equal(r.d.tech.nifty.reversal.dir, 1);
  assert.equal(r.m.assessment, "reversal_up");
});

test("failed break: a close back inside the range after a close beyond the level is invalidated", function(){
  var r = nm(withBars(makePayload(Object.assign({ niftyChg:0.05, bnChg:0.05, sectorsUp:3, vixChg:0 }, CLOSED)), flat([400, 5])));
  assert.equal(r.m.scenarios.bull.status, "invalidated");
});

test("insufficient data (stale quote) -> prediction unavailable, no scenarios", function(){
  var r = nm(makePayload({ niftyKind:"up", status:"STALE" }));
  assert.equal(r.m.state, "unavailable");
  assert.equal(r.m.assessment, "unavailable");
  assert.equal(r.m.scenarios.bull, null);
  assert.equal(r.m.price, null);
  assert.ok(r.m.reasons.length > 0);
});

test("fresh quote with 40-day-old daily history -> prediction unavailable", function(){
  var p = makePayload({ niftyKind:"up", niftyChg:0.8, bnChg:0.9, sectorsUp:6, vixChg:-8, session:"CLOSED", status:"DELAYED" });
  ["NIFTY","BANKNIFTY"].forEach(function(k){ p.directionHistory[k].candles = p.directionHistory[k].candles.map(function(c){ return Object.assign({}, c, { t:c.t - 40*DAY }); }); });
  var r = nm(p);
  assert.equal(r.m.state, "unavailable");
  assert.ok(r.m.reasons.some(function(x){ return x.key=="dir.why.stale_history"; }));
});

test("missing NIFTY timestamp -> prediction unavailable", function(){
  var p = makePayload(Object.assign({ niftyKind:"up", niftyChg:0.6, bnChg:0.7 }, CLOSED));
  p.indices.NIFTY.freshness.sourceTimestamp = null;
  assert.equal(nm(p).m.state, "unavailable");
});

test("no demo or null payload ever produces an assessment", function(){
  assert.equal(computeNextMove(null).state, "unavailable");
  var d = computeDirection(null, { now:NOW, demo:true });
  assert.equal(computeNextMove(d).state, "unavailable");
});

test("price is LIVE only for a LIVE quote in an open session; otherwise last confirmed with provider time", function(){
  var live = nm(makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7 }));
  assert.equal(live.m.price.kind, "live");
  assert.equal(live.m.price.asOf, NOW - 20000);
  var fri = ist(2026, 10, 16, 15, 29), now = ist(2026, 10, 17, 11, 0);
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, session:"WEEKEND", status:"DELAYED", ts:fri });
  ["NIFTY","BANKNIFTY"].forEach(function(k){ var cs = p.directionHistory[k].candles; p.directionHistory[k].candles = cs.map(function(c, i){ return Object.assign({}, c, { t:ist(2026, 10, 16, 9, 15) - (cs.length-1-i)*DAY }); }); });
  var wk = nm(p, { now:now, lastUpdated:now-5000 });
  assert.equal(wk.m.state, "ok");
  assert.equal(wk.m.price.kind, "last_confirmed");
  assert.equal(wk.m.price.asOf, fri);                 // provider time, not fetch time
  assert.equal(wk.m.freshness.session, "WEEKEND");
});

test("a trigger seen on data one session behind is expired, not current", function(){
  var now = ist(2026, 10, 14, 8, 0);                  // Wednesday 08:00, Monday data: one session behind
  var p = makePayload({ niftyKind:"rangeBreakUp", bnKind:"rangeBreakUp", niftyChg:0.6, bnChg:0.7, session:"CLOSED", status:"DELAYED", ts:ist(2026, 10, 12, 15, 29) });
  ["NIFTY","BANKNIFTY"].forEach(function(k){ var cs = p.directionHistory[k].candles; p.directionHistory[k].candles = cs.map(function(c, i){ return Object.assign({}, c, { t:ist(2026, 10, 12, 9, 15) - (cs.length-1-i)*DAY }); }); });
  var r = nm(p, { now:now, lastUpdated:now-5000 });
  assert.equal(r.m.scenarios.bull.status, "expired");
  assert.equal(r.m.freshness.behind, true);
});

test("never claims validated confidence, intraday horizons or unverifiable confirmations", function(){
  var r = nm(makePayload({ niftyKind:"rangeBreakUp", bnKind:"rangeBreakUp", niftyChg:0.6, bnChg:0.7 })).m;
  assert.equal(r.confidence.validated, false);
  assert.equal(r.horizon.intraday, false);
  assert.equal(r.horizon.basis, "daily");
  ["volume","options","news","intraday","breadth"].forEach(function(k){ assert.ok(r.unverified.indexOf(k) >= 0, k); });
  assert.equal(JSON.stringify(r).indexOf("probab") , -1);
});

test("stale secondary inputs are reported as excluded but do not block a NIFTY-based assessment", function(){
  var p = makePayload({ niftyKind:"rangeBreakUp", bnKind:"rangeBreakUp", niftyChg:0.6, bnChg:0.7, session:"CLOSED", status:"DELAYED" });
  p.sectors.items.forEach(function(it){ it.ts = NOW - 20*DAY; });
  var r = nm(p).m;
  assert.equal(r.state, "ok");
  assert.ok(r.excluded.some(function(x){ return x.id=="sectors"; }));
});

test("a live quote far from the latest daily candle is treated as inconsistent data", function(){
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7 });
  p.indices.NIFTY.ltp = p.indices.NIFTY.ltp * 0.8;          // 20% apart: wrong source or wrong ticker
  var r = nm(p);
  assert.equal(r.m.state, "unavailable");
  assert.ok(r.m.reasons.some(function(x){ return x.key=="dir.why.mismatch"; }));
});

test("a payload claiming OPEN outside NSE hours is not shown as a live price", function(){
  var now = ist(2026, 10, 15, 19, 30);                       // Thursday 19:30 IST, market closed by the clock
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, ts:now - 20000 });
  ["NIFTY","BANKNIFTY"].forEach(function(k){ var cs = p.directionHistory[k].candles; p.directionHistory[k].candles = cs.map(function(c, i){ return Object.assign({}, c, { t:ist(2026, 10, 15, 9, 15) - (cs.length-1-i)*DAY }); }); });
  var r = nm(p, { now:now, lastUpdated:now - 5000 });
  assert.equal(r.m.price.kind, "last_confirmed");
});
