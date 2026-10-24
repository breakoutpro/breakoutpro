// Tests for the top Market Ticker model (src/state/marketTickerModel.js) and its wiring.
// All quotes here are fixture numbers; no provider is contacted, so nothing in this file
// proves live data. Run: node --test tests/market-ticker.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildTickerItems, stateOf, istStamp, stateLabel, TICKER_ITEMS } from "../src/state/marketTickerModel.js";

var NOW = Date.UTC(2026, 9, 13, 5, 0, 0);
function q(ltp, chg, ageS, prev){
  return { ltp:ltp, prevClose:prev == null ? null : prev, chgPct:chg, freshness:{ status:"LIVE", sourceTimestamp: NOW - ageS * 1000 } };
}
function payload(session, ageS){
  return { session:session, indices:{ NIFTY:q(24500, 0.5, ageS, 24400), BANKNIFTY:q(53000, -0.4, ageS, 53200), SENSEX:q(80000, 0.2, ageS, 79800), VIX:q(13.4, 2.4, ageS, 13.1) } };
}
function by(items, k){ return items.filter(function(i){ return i.key == k; })[0]; }

test("always one slot per configured item, same order", function(){
  var a = buildTickerItems(null, { now:NOW }), b = buildTickerItems(payload("OPEN", 10), { now:NOW });
  assert.deepEqual(a.map(function(i){ return i.key; }), TICKER_ITEMS.map(function(i){ return i.key; }));
  assert.deepEqual(b.map(function(i){ return i.key; }), TICKER_ITEMS.map(function(i){ return i.key; }));
});
test("fresh open-session quote is live; 5 minutes old is delayed; 30 minutes old is last confirmed", function(){
  assert.equal(by(buildTickerItems(payload("OPEN", 20), { now:NOW, networkStatus:"LIVE" }), "NIFTY").state, "live");
  assert.equal(by(buildTickerItems(payload("OPEN", 300), { now:NOW, networkStatus:"LIVE" }), "NIFTY").state, "delayed");
  assert.equal(by(buildTickerItems(payload("OPEN", 1800), { now:NOW, networkStatus:"LIVE" }), "NIFTY").state, "lastconfirmed");
});
test("cached or offline fetch can never be live", function(){
  assert.notEqual(by(buildTickerItems(payload("OPEN", 20), { now:NOW, networkStatus:"DELAYED" }), "NIFTY").state, "live");
  assert.equal(by(buildTickerItems(payload("OPEN", 20), { now:NOW, networkStatus:"OFFLINE" }), "NIFTY").state, "lastconfirmed");
  assert.equal(by(buildTickerItems(payload("OPEN", 20), { now:NOW, networkStatus:"STALE" }), "NIFTY").state, "lastconfirmed");
});
test("closed session is labelled closed whatever the age, never live", function(){
  ["CLOSED", "WEEKEND", "POST_CLOSE"].forEach(function(s){
    assert.equal(by(buildTickerItems(payload(s, 5), { now:NOW, networkStatus:"LIVE" }), "NIFTY").state, "closed");
  });
});
test("a payload that was live when fetched but is old now is not live", function(){
  var p = payload("OPEN", 20);
  var later = NOW + 20 * 60 * 1000;
  assert.equal(by(buildTickerItems(p, { now:later, networkStatus:"LIVE" }), "NIFTY").state, "lastconfirmed");
});
test("GIFT NIFTY is always unavailable with no number", function(){
  var g = by(buildTickerItems(payload("OPEN", 5), { now:NOW, networkStatus:"LIVE" }), "GIFT");
  assert.equal(g.state, "unavailable"); assert.equal(g.value, null); assert.equal(g.chgPct, null); assert.equal(g.route, null);
});
test("missing or null symbol is unavailable, other items unaffected", function(){
  var p = payload("OPEN", 5); p.indices.SENSEX = { ltp:null, freshness:{ status:"UNAVAILABLE" } }; delete p.indices.VIX;
  var items = buildTickerItems(p, { now:NOW, networkStatus:"LIVE" });
  assert.equal(by(items, "SENSEX").state, "unavailable"); assert.equal(by(items, "SENSEX").value, null);
  assert.equal(by(items, "VIX").state, "unavailable");
  assert.equal(by(items, "NIFTY").state, "live");
});
test("no change is invented when the provider sends none", function(){
  var p = payload("OPEN", 5); p.indices.NIFTY.chgPct = null;
  var n = by(buildTickerItems(p, { now:NOW, networkStatus:"LIVE" }), "NIFTY");
  assert.equal(n.chgPct, null); assert.equal(n.dir, "neutral"); assert.equal(n.chgAbs, null);
  p.indices.NIFTY.chgPct = "0.5"; // string is not trusted
  assert.equal(by(buildTickerItems(p, { now:NOW, networkStatus:"LIVE" }), "NIFTY").chgPct, null);
});
test("direction and absolute change come from the provider values", function(){
  var items = buildTickerItems(payload("OPEN", 5), { now:NOW, networkStatus:"LIVE" });
  assert.equal(by(items, "NIFTY").dir, "up"); assert.ok(Math.abs(by(items, "NIFTY").chgAbs - 100) < 1e-9);
  assert.equal(by(items, "BANKNIFTY").dir, "down");
});
test("loading vs failed load", function(){
  assert.equal(by(buildTickerItems(null, { now:NOW }), "NIFTY").state, "loading");
  var f = buildTickerItems(null, { now:NOW, loadFailed:true });
  assert.equal(by(f, "NIFTY").state, "unavailable"); assert.equal(by(f, "NIFTY").value, null);
});
test("no timestamp means unavailable, not live", function(){
  var p = payload("OPEN", 5); p.indices.NIFTY.freshness = { status:"LIVE", sourceTimestamp:null };
  assert.equal(by(buildTickerItems(p, { now:NOW, networkStatus:"LIVE" }), "NIFTY").state, "unavailable");
});
test("IST stamp: same day time only, earlier day with date", function(){
  assert.equal(istStamp(Date.UTC(2026, 9, 13, 4, 0, 0), NOW), "09:30");
  assert.equal(istStamp(Date.UTC(2026, 9, 12, 10, 0, 0), NOW), "12 Oct 15:30");
  assert.equal(istStamp(null, NOW), null);
});
test("state labels are distinct words, not colour only", function(){
  var s = ["live", "delayed", "closed", "lastconfirmed", "unavailable", "loading"].map(stateLabel);
  assert.equal(new Set(s).size, 6);
});
test("52-week breadth is omitted (no verified provider)", function(){
  assert.ok(TICKER_ITEMS.every(function(i){ return !/52|breadth/i.test(i.label + i.key); }));
});
test("routes only point at tabs that already exist", function(){
  var app = fs.readFileSync("src/App.jsx", "utf8");
  var m = app.match(/var KNOWN_TABS = \[([^\]]*)\]/)[1];
  TICKER_ITEMS.forEach(function(i){ if(i.route) assert.ok(m.indexOf('"' + i.route + '"') >= 0, i.route); });
});
test("source hygiene: ASCII, no backtick, no triple equals, no scale/zoom, no new fetch", function(){
  ["src/state/marketTickerModel.js", "src/components/MarketTicker.jsx"].forEach(function(f){
    var s = fs.readFileSync(f, "utf8");
    assert.ok(!/[^\x00-\x7F]/.test(s), f + " non-ascii"); assert.ok(s.indexOf("`") < 0, f + " backtick");
    assert.ok(s.indexOf("===") < 0, f + " triple"); assert.ok(!/fetch\(|XMLHttpRequest|transform:\s*"?scale|zoom:/.test(s), f + " forbidden");
  });
});
test("ticker is mounted once per layout and hidden on the full-screen rangeintel route", function(){
  var app = fs.readFileSync("src/App.jsx", "utf8");
  assert.equal((app.match(/<MarketTicker /g) || []).length, 2);
  assert.ok(app.indexOf('!isDesktop && tab!="rangeintel" ? <MarketTicker') >= 0);
});
