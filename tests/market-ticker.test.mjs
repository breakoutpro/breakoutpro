// Tests for the top Market Ticker model (src/state/marketTickerModel.js) and its wiring.
// All quotes here are fixture numbers; no provider is contacted, so nothing in this file
// proves live data. Run: node --test tests/market-ticker.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildTickerItems, stateOf, istStamp, stateLabel, TICKER_ITEMS, visibleTickerItems, pctDir, formatTickerPct, formatTickerValue, loopCopies, wrapOffset } from "../src/state/marketTickerModel.js";

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
test("one set of quotes on Home: slim strip on mobile and tablet, market boxes on desktop tiers", function(){
  var app = fs.readFileSync("src/App.jsx", "utf8");
  assert.equal((app.match(/<MarketTicker /g) || []).length, 0, "App must not render a second strip above the desktop market boxes");
  ["Mobile", "Tablet", "Desktop", "Laptop"].forEach(function(d){
    var h = fs.readFileSync("src/screens/home/EquityHome" + d + ".jsx", "utf8");
    assert.ok(h.indexOf("<MarketTicker") < 0, d + " must not add a second strip above the index cards");
    assert.ok(h.indexOf("<HomeHub") >= 0 && h.indexOf("mm=") >= 0, d + " renders the hub with the shared payload");
  });
  var hub = fs.readFileSync("src/screens/home/HomeHub.jsx", "utf8");
  assert.ok(hub.indexOf("<HomeMarketTiles") >= 0);
});
test("market boxes use the ticker model: same five instruments, GIFT NIFTY unavailable, no invented value", function(){
  var tiles = fs.readFileSync("src/screens/home/HomeMarketTiles.jsx", "utf8");
  assert.ok(tiles.indexOf("buildTickerItems") >= 0 && tiles.indexOf("fetch(") < 0);
  assert.ok(tiles.indexOf('t("c.unavailable")') >= 0);
  var items = buildTickerItems(null, { loadFailed:true });
  assert.deepEqual(items.map(function(i){ return i.label; }), ["NIFTY 50", "BANK NIFTY", "SENSEX", "GIFT NIFTY", "INDIA VIX"]);
  items.forEach(function(i){ assert.equal(i.value, null); });
});
test("strip shows only name, value and signed percent: no status words or timestamps", function(){
  var src = fs.readFileSync("src/components/MarketTicker.jsx", "utf8");
  assert.ok(!/stateLabel|istStamp|\.asOf|tk\.live|tk\.delayed|tk\.closed|LAST CONFIRMED|"LIVE"|"CLOSED"|"DELAYED"/.test(src));
  var v = visibleTickerItems(buildTickerItems(payload("OPEN", 20), { now:NOW, networkStatus:"LIVE" }));
  v.forEach(function(i){ assert.deepEqual(Object.keys(i).sort(), ["chgAbs", "dir", "key", "label", "pct", "route", "value"]); });
});
test("items without a valid value are omitted (GIFT NIFTY, missing symbol, loading)", function(){
  var keys = function(a){ return a.map(function(i){ return i.key; }); };
  assert.deepEqual(keys(visibleTickerItems(buildTickerItems(payload("OPEN", 20), { now:NOW }))), ["NIFTY", "BANKNIFTY", "SENSEX", "VIX"]);
  var p = payload("OPEN", 20); delete p.indices.SENSEX;
  assert.deepEqual(keys(visibleTickerItems(buildTickerItems(p, { now:NOW }))), ["NIFTY", "BANKNIFTY", "VIX"]);
  assert.equal(visibleTickerItems(buildTickerItems(null, { now:NOW })).length, 0);
  assert.equal(visibleTickerItems(buildTickerItems(null, { now:NOW, loadFailed:true })).length, 0);
});
test("old closed-session values stay visible with no status text", function(){
  var v = visibleTickerItems(buildTickerItems(payload("CLOSED", 7200), { now:NOW }));
  assert.equal(v.length, 4);
});
test("sign decides colour: positive up, negative down, zero and missing neutral (VIX included)", function(){
  assert.equal(pctDir(0.5), "up"); assert.equal(pctDir(-0.4), "down");
  assert.equal(pctDir(0), "neutral"); assert.equal(pctDir(0.004), "neutral"); assert.equal(pctDir(-0.004), "neutral"); assert.equal(pctDir(null), "neutral");
  var v = visibleTickerItems(buildTickerItems(payload("OPEN", 20), { now:NOW }));
  assert.equal(v.filter(function(i){ return i.key == "VIX"; })[0].dir, "up");
  assert.equal(v.filter(function(i){ return i.key == "BANKNIFTY"; })[0].dir, "down");
  var src = fs.readFileSync("src/components/MarketTicker.jsx", "utf8");
  assert.ok(src.indexOf("c.up") >= 0 && src.indexOf("c.down") >= 0);
});
test("percent and value text are signed and formatted", function(){
  assert.equal(formatTickerPct(0.523), "+0.52%"); assert.equal(formatTickerPct(-0.4), "-0.40%");
  assert.equal(formatTickerPct(0), "0.00%"); assert.equal(formatTickerPct(null), null);
  assert.equal(formatTickerValue(24500.5), "24,500.50"); assert.equal(formatTickerValue(null), null);
  var p = payload("OPEN", 20); p.indices.NIFTY.chgPct = null;
  assert.equal(visibleTickerItems(buildTickerItems(p, { now:NOW }))[0].pct, null);
});
test("seamless loop: each half covers the viewport and wrapping lands on identical content", function(){
  assert.equal(loopCopies(390, 600), 1); assert.equal(loopCopies(1440, 600), 3); assert.equal(loopCopies(1200, 600), 2);
  assert.equal(loopCopies(0, 600), 1); assert.equal(loopCopies(800, 0), 1);
  [[390, 421], [1366, 421], [1440, 421], [1440, 97]].forEach(function(a){
    var n = loopCopies(a[0], a[1]); assert.ok(n * a[1] >= a[0], a.join(","));
  });
  var half = 1263;
  assert.equal(wrapOffset(1263, half), 0); assert.equal(wrapOffset(1264.5, half), 1.5);
  assert.equal(wrapOffset(-2, half), 1261); assert.equal(wrapOffset(5, half), 5); assert.equal(wrapOffset(5, 0), 0);
});
test("motion contract in the component: rAF, pause on hover/focus/touch, reduced motion, aria-hidden clones", function(){
  var src = fs.readFileSync("src/components/MarketTicker.jsx", "utf8");
  ["requestAnimationFrame", "onMouseEnter", "onFocus", "onTouchStart", "document.hidden", "prefers-reduced-motion", 'aria-hidden="true"', "tabIndex={-1}", "overflowX:\"auto\""].forEach(function(k){
    assert.ok(src.indexOf(k) >= 0, k);
  });
  var h = src.match(/var H = (\d+);/); assert.ok(h && +h[1] >= 32 && +h[1] <= 38);
});
