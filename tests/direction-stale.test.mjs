// Regression tests: source-timestamp validation in the Early Direction engine.
// Fixture / unit tests only. No real provider is contacted.
// Run: node --test tests/direction-stale.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { computeDirection, checkSourceTime, expectedSessionDay, istParts } from "../src/screens/DirectionEngine.js";
import { makePayload, NOW } from "./direction-fixtures.mjs";

var DAY = 86400000;
function ist(y, mo, d, h, mi){ return Date.UTC(y, mo-1, d, h, mi) - 19800000; }
function setBars(p, lastT){
  ["NIFTY","BANKNIFTY"].forEach(function(k){
    var b = p.directionHistory[k]; if(!b) return;
    var n = b.candles.length;
    b.candles = b.candles.map(function(c, i){ return Object.assign({}, c, { t:lastT - (n-1-i)*DAY }); });
  });
  return p;
}
function inp(r, id){ return r.inputs.filter(function(x){ return x.id==id; })[0]; }
function reasonKeys(r){ return r.reasons.map(function(x){ return x.key; }); }
function directional(r){ return r.outlook=="bullish" || r.outlook=="bearish"; }
var OPEN = { now:NOW, lastUpdated:NOW-5000 };

test("baseline: fresh in-session data is accepted and directional", function(){
  var r = computeDirection(makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7 }), OPEN);
  assert.ok(directional(r));
  assert.equal(inp(r, "nifty_q").used, true);
  assert.equal(inp(r, "nifty_h").used, true);
  assert.equal(r.timeUncertain, false);
});

test("20-day-old NIFTY quote labelled DELAYED by the server is rejected", function(){
  var old = NOW - 20*DAY;
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, session:"CLOSED", status:"DELAYED", ts:old });
  var r = computeDirection(p, OPEN);
  var q = inp(r, "nifty_q");
  assert.equal(q.status, "STALE");
  assert.equal(q.reason, "stale_source");
  assert.equal(q.used, false);
  assert.equal(q.serverStatus, "DELAYED");   // server label preserved separately
  assert.equal(q.asOf, old);                 // provider timestamp not replaced by now
  assert.equal(r.outlook, "insufficient");
  assert.ok(reasonKeys(r).indexOf("dir.why.stale_nifty") >= 0);
});

test("40-day-old daily history with a fresh quote gives no directional outlook", function(){
  var p = makePayload({ niftyKind:"up", niftyChg:0.8, bnChg:0.9, sectorsUp:6, vixChg:-8, session:"CLOSED", status:"DELAYED" });
  setBars(p, NOW - 40*DAY);
  var r = computeDirection(p, OPEN);
  var h = inp(r, "nifty_h");
  assert.equal(h.status, "STALE");
  assert.equal(h.reason, "stale_source");
  assert.equal(h.used, false);
  assert.equal(h.serverStatus, "DELAYED");
  assert.equal(h.candleTime, NOW - 40*DAY);
  assert.equal(inp(r, "nifty_q").used, true);          // fresh quote still shown as used
  assert.ok(!directional(r));
  assert.equal(r.outlook, "insufficient");
  assert.ok(reasonKeys(r).indexOf("dir.why.stale_history") >= 0);
  assert.equal(r.levels, null);                          // no levels from stale bars
});

test("NIFTY history missing or too short gives no directional outlook", function(){
  var r = computeDirection(makePayload({ niftyKind:"up", noHistory:true }), OPEN);
  assert.equal(r.outlook, "insufficient");
  assert.ok(reasonKeys(r).indexOf("dir.why.no_history") >= 0);
});

test("weekend: latest completed Friday session is valid, not stale", function(){
  var now = ist(2026, 10, 17, 11, 0);                  // Saturday 11:00 IST
  var fri = ist(2026, 10, 16, 15, 29);                 // Friday close
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, session:"WEEKEND", status:"DELAYED", ts:fri });
  setBars(p, ist(2026, 10, 16, 9, 15));                // Yahoo daily bar open time
  var r = computeDirection(p, { now:now, lastUpdated:now-5000 });
  assert.equal(inp(r, "nifty_q").status, "DELAYED");
  assert.equal(inp(r, "nifty_q").used, true);
  assert.equal(inp(r, "nifty_h").used, true);
  assert.equal(r.timeUncertain, false);
  assert.ok(directional(r));
  assert.equal(r.basisClose, true);
});

test("Monday before the open: Friday data is the expected session", function(){
  var now = ist(2026, 10, 19, 8, 30);                  // Monday 08:30 IST
  assert.equal(expectedSessionDay(now), istParts(ist(2026, 10, 16, 12, 0)).day);
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, session:"CLOSED", status:"DELAYED", ts:ist(2026, 10, 16, 15, 29) });
  setBars(p, ist(2026, 10, 16, 9, 15));
  var r = computeDirection(p, { now:now, lastUpdated:now-5000 });
  assert.equal(inp(r, "nifty_q").used, true);
  assert.equal(inp(r, "nifty_h").used, true);
  assert.equal(r.timeUncertain, false);
});

test("1-2 weekdays behind is reported as uncertain (no holiday calendar), 3+ is stale", function(){
  var now = ist(2026, 10, 14, 8, 0);                   // Wednesday 08:00 IST, expected Tuesday
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, session:"CLOSED", status:"DELAYED", ts:ist(2026, 10, 12, 15, 29) });
  setBars(p, ist(2026, 10, 12, 9, 15));                // Monday data: one weekday behind
  var r = computeDirection(p, { now:now, lastUpdated:now-5000 });
  assert.equal(inp(r, "nifty_q").timeCheck, "uncertain");
  assert.equal(inp(r, "nifty_q").used, true);
  assert.equal(r.timeUncertain, true);
  assert.ok(reasonKeys(r).indexOf("dir.why.session_uncertain") >= 0);
  assert.notEqual(r.confidence, "high");
  // Wednesday 10:00, Friday data: Mon, Tue and Wed missing -> stale
  var now2 = ist(2026, 10, 14, 10, 0);
  var p2 = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, session:"CLOSED", status:"DELAYED", ts:ist(2026, 10, 9, 15, 29) });
  setBars(p2, ist(2026, 10, 9, 9, 15));
  var r2 = computeDirection(p2, { now:now2, lastUpdated:now2-5000 });
  assert.equal(inp(r2, "nifty_q").status, "STALE");
  assert.equal(inp(r2, "nifty_h").status, "STALE");
  assert.equal(r2.outlook, "insufficient");
});

test("in-session quote older than 15 minutes is stale even if labelled LIVE", function(){
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, status:"LIVE", ts:NOW - 40*60000 });
  var r = computeDirection(p, OPEN);
  assert.equal(inp(r, "nifty_q").status, "STALE");
  assert.equal(r.outlook, "insufficient");
});

test("stale secondary inputs are excluded with their source status preserved", function(){
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, sectorsUp:6, vixChg:-8, crudeChg:-2, session:"CLOSED", status:"DELAYED" });
  var old = NOW - 20*DAY;
  p.indices.BANKNIFTY.freshness.sourceTimestamp = old;
  p.indices.VIX.freshness.sourceTimestamp = old;
  p.directionHistory.BANKNIFTY.candles = p.directionHistory.BANKNIFTY.candles.map(function(c, i, a){ return Object.assign({}, c, { t:old - (a.length-1-i)*DAY }); });
  p.sectors.items.forEach(function(it){ it.ts = old; });
  p.global.items.forEach(function(it){ if(it.name=="Crude Oil (WTI)") it.ts = NOW - 2*DAY; });
  p.macro.natGas.ts = NOW - 2*DAY;
  p.macro.crude.lastBarTs = old;
  var r = computeDirection(p, OPEN);
  ["bn_q","bn_h","vix","sectors","crude","natgas"].forEach(function(id){
    var i = inp(r, id);
    assert.equal(i.status, "STALE", id);
    assert.equal(i.used, false, id);
    assert.notEqual(i.reason, "", id);
  });
  assert.equal(inp(r, "natgas").reason, "stale_source");  // not masked as context_only
  assert.equal(inp(r, "crude").serverStatus, "LIVE");     // original label kept
  // none of them produced a signal
  var ids = [].concat(r.bullEvidence, r.bearEvidence, r.notes).map(function(x){ return x.id; });
  ["bn_ema","bn_level","bn_day","vix","sectors","crude","natgas","crude_vol"].forEach(function(id){ assert.equal(ids.indexOf(id), -1, id); });
  // NIFTY itself is fresh and still scored
  assert.equal(inp(r, "nifty_q").used, true);
  assert.equal(inp(r, "nifty_h").used, true);
});

test("stale crude can not tip the outlook (excluded, not scored)", function(){
  var base = { niftyKind:"rangeBreakUp", bnKind:"range", niftyChg:0.1, bnChg:0.0, sectorsUp:3, vixChg:0, crudeChg:-2 };
  var fresh = computeDirection(makePayload(base), OPEN);
  var p = makePayload(base);
  p.global.items.forEach(function(it){ if(it.name=="Crude Oil (WTI)") it.ts = NOW - 2*DAY; });
  var stale = computeDirection(p, OPEN);
  assert.equal(inp(stale, "crude").status, "STALE");
  assert.equal(stale.net, fresh.net - 1);
});

test("missing timestamps: nothing is assumed current", function(){
  // NIFTY quote with no provider timestamp in a closed session (server says DELAYED)
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, session:"CLOSED", status:"DELAYED" });
  p.indices.NIFTY.freshness.sourceTimestamp = null;
  var r = computeDirection(p, OPEN);
  assert.equal(inp(r, "nifty_q").status, "UNAVAILABLE");
  assert.equal(inp(r, "nifty_q").reason, "no_timestamp");
  assert.equal(inp(r, "nifty_q").asOf, null);          // not replaced by the current time
  assert.equal(r.outlook, "insufficient");
  // NIFTY history whose last bar has no timestamp
  var p2 = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7 });
  var cs = p2.directionHistory.NIFTY.candles; cs[cs.length-1] = Object.assign({}, cs[cs.length-1], { t:null });
  var r2 = computeDirection(p2, OPEN);
  assert.equal(inp(r2, "nifty_h").reason, "no_timestamp");
  assert.equal(inp(r2, "nifty_h").candleTime, null);
  assert.equal(r2.outlook, "insufficient");
  // secondary inputs without timestamps are excluded
  var p3 = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, crudeChg:-2 });
  delete p3.global.items[1].ts; p3.sectors.items.forEach(function(it){ delete it.ts; }); p3.macro.natGas.ts = null;
  var r3 = computeDirection(p3, OPEN);
  ["sectors","crude","natgas"].forEach(function(id){ assert.equal(inp(r3, id).reason, "no_timestamp", id); assert.equal(inp(r3, id).used, false, id); });
  assert.ok(directional(r3));                            // NIFTY evidence is still valid
});

test("a timestamp in the future is rejected as invalid", function(){
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, ts:NOW + 3*3600000 });
  var r = computeDirection(p, OPEN);
  assert.equal(inp(r, "nifty_q").reason, "bad_timestamp");
  assert.equal(r.outlook, "insufficient");
});

test("fetch time, candle time and source status stay separate", function(){
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7 });
  p.generatedAt = NOW - 3000;
  var r = computeDirection(p, OPEN);
  var h = inp(r, "nifty_h"), q = inp(r, "nifty_q");
  assert.equal(h.candleTime, h.asOf);
  assert.equal(h.fetchedAt, NOW - 3000);
  assert.equal(q.fetchedAt, NOW - 3000);
  assert.equal(q.asOf, NOW - 20000);
  assert.notEqual(q.asOf, q.fetchedAt);
});

test("checkSourceTime unit cases", function(){
  assert.equal(checkSourceTime(null, NOW, "session").state, "missing");
  assert.equal(checkSourceTime(undefined, NOW, "continuous").state, "missing");
  assert.equal(checkSourceTime(NOW + 3600000, NOW, "session").state, "future");
  assert.equal(checkSourceTime(NOW - 20000, NOW, "session", true).state, "fresh");
  assert.equal(checkSourceTime(NOW - 20*DAY, NOW, "session").state, "stale");
  assert.equal(checkSourceTime(NOW - 3600000, NOW, "continuous").state, "fresh");
  assert.equal(checkSourceTime(NOW - 7*3600000, NOW, "continuous").state, "stale");
});

test("known NSE holidays (app calendar, 2026) are not treated as missing sessions", function(){
  // Fri 2026-10-02 (Gandhi Jayanti) is a listed holiday: Monday 08:30 expects Thursday
  var now = ist(2026, 10, 5, 8, 30);
  assert.equal(expectedSessionDay(now), istParts(ist(2026, 10, 1, 12, 0)).day);
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, session:"CLOSED", status:"DELAYED", ts:ist(2026, 10, 1, 15, 29) });
  setBars(p, ist(2026, 10, 1, 9, 15));
  var r = computeDirection(p, { now:now, lastUpdated:now-5000 });
  assert.equal(inp(r, "nifty_q").timeCheck, "fresh");
  assert.equal(inp(r, "nifty_h").timeCheck, "fresh");
  assert.equal(r.timeUncertain, false);
  // Tue 2026-10-20 (Dussehra) holiday: Wednesday 08:00 expects Monday
  var now2 = ist(2026, 10, 21, 8, 0);
  assert.equal(expectedSessionDay(now2), istParts(ist(2026, 10, 19, 12, 0)).day);
});

test("outside the years the calendar covers, holidays stay unknown (uncertain, not stale)", function(){
  var now = ist(2027, 1, 27, 8, 0);                    // Wednesday 08:00; Tue 26 Jan is not in the app list
  var q = checkSourceTime(ist(2027, 1, 25, 15, 29), now, "session");
  assert.equal(q.state, "uncertain");
  assert.equal(q.lag, 1);
});
