// Regression tests for the Next Move Intelligence UI model and the Home card.
// Fixtures only: no real provider is contacted. Covers duplicate evidence,
// missing scenario data, stale and unavailable data, and that every live Home
// layout uses the shared Next Move path.
// Run: node --test tests/next-move-ui.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import EN from "../src/i18n/lang/en.js";
import { computeDirection } from "../src/screens/DirectionEngine.js";
import { computeNextMove, uniqItems } from "../src/screens/NextMoveEngine.js";
import { buildNextMoveView, scenarioView, cleanLines, textOf, missingText } from "../src/screens/NextMoveView.js";
import { makePayload, NOW } from "./direction-fixtures.mjs";

var DAY = 86400000;
var OPEN = { now:NOW, lastUpdated:NOW-5000 };
// Same behaviour as the app's t(): fills {vars}; a missing key gives "".
function tfn(key, vars){
  var s = EN.strings[key];
  if(s==null || s=="") return "";
  return String(s).replace(/\{(\w+)\}/g, function(m, n){ return vars && vars[n]!=null ? String(vars[n]) : m; });
}
function run(payload, opts){ var d = computeDirection(payload, opts || OPEN); var m = computeNextMove(d); return { d:d, m:m, v:buildNextMoveView(m, tfn) }; }
var CLOSED = { session:"CLOSED", status:"DELAYED" };
function allLines(v){ return [].concat(v.forLines, v.againstLines, v.confirmLines, v.invalidateLines); }
function noRepeats(lines){ var seen = {}; lines.forEach(function(l){ assert.ok(!seen[l], "repeated line: " + l); seen[l] = 1; }); }

var CASES = {
  bullish: function(){ return makePayload(Object.assign({ niftyKind:"rangeBreakUp", bnKind:"rangeBreakUp", niftyChg:0.6, bnChg:0.7 }, CLOSED)); },
  bearish: function(){ return makePayload(Object.assign({ niftyKind:"rangeBreakDown", bnKind:"rangeBreakDown", niftyChg:-0.6, bnChg:-0.7 }, CLOSED)); },
  live_up: function(){ return makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7 }); },
  conflict: function(){ return makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:-0.7, sectorsUp:1 }); }
};

// ---- Duplicate evidence -------------------------------------------------------
Object.keys(CASES).forEach(function(name){
  test("no repeated evidence line anywhere on the card: " + name, function(){
    var r = run(CASES[name]());
    assert.equal(r.m.state, "ok");
    noRepeats(allLines(r.v));
    // engine level: each message (rule + values) appears once across for/against
    var seen = {};
    r.m.evidence.forTxt.concat(r.m.evidence.against).forEach(function(it){
      var k = it.key + "|" + JSON.stringify(it.vars || {});
      assert.ok(!seen[k], "engine repeated " + k); seen[k] = 1;
    });
  });
});

test("a signal listed in both contradicts and caveats is shown once (root cause of the repeats)", function(){
  var d = computeDirection(CASES.bullish(), OPEN);
  var dup = { id:"nifty_day", key:"dir.s.nifty_day_flat", vars:{ p:"0.1%" }, weight:1 };
  d.contradicts = (d.contradicts || []).concat([dup]);
  d.caveats = (d.caveats || []).concat([Object.assign({}, dup)]);
  var m = computeNextMove(d);
  var n = m.evidence.against.filter(function(x){ return x.key=="dir.s.nifty_day_flat"; }).length;
  assert.equal(n, 1);
  assert.equal(m.evidence.caveats.length, 0);   // merged into "against", not printed twice
});

test("the same message from two instrument lists is kept once; different values are both kept", function(){
  var a = { id:"nifty_ema", key:"dir.s.ema_up", vars:{ x:"1" } };
  var b = { id:"bn_ema", key:"dir.s.ema_up", vars:{ x:"1" } };
  var c = { id:"bn_ema", key:"dir.s.ema_up", vars:{ x:"2" } };
  assert.equal(uniqItems([a, b, c], {}).length, 2);
});

test("evidence for and against stay in separate lists; confirm and invalidate are not restated from scenarios", function(){
  var r = run(CASES.bullish());
  var forSet = {}; r.v.forLines.forEach(function(l){ forSet[l] = 1; });
  r.v.againstLines.forEach(function(l){ assert.ok(!forSet[l], "in both for and against: " + l); });
  var keys = r.m.confirms.concat(r.m.invalidates).map(function(x){ return x.key; });
  ["dir.c.bull_close", "dir.c.bear_close", "dir.w.bull_inval", "dir.w.bear_inval"].forEach(function(k){ assert.ok(keys.indexOf(k) < 0, k); });
});

// ---- Missing scenario data / empty boxes ------------------------------------------
test("a scenario without a real trigger level is never rendered", function(){
  assert.equal(scenarioView(null, tfn), null);
  assert.equal(scenarioView({ side:"bull", status:"waiting", triggerLevel:NaN, trigger:{ key:"nm.trig.bull", vars:{ lvl:"1" } } }, tfn), null);
  assert.equal(scenarioView({ side:"bull", status:"waiting", triggerLevel:null, trigger:{ key:"nm.trig.bull", vars:{ lvl:"1" } } }, tfn), null);
});

test("a scenario whose texts are all missing is dropped; a partial one keeps only rows with text", function(){
  var none = { side:"bull", status:"waiting", triggerLevel:100, trigger:{ key:"no.such.key" }, confirm:{ key:"no.such.key2" }, invalid:{ key:"no.such.key3" } };
  assert.equal(scenarioView(none, tfn), null);
  var part = { side:"bear", status:"waiting", triggerLevel:100, trigger:{ key:"nm.trig.bear", vars:{ lvl:"100" } }, confirm:{ key:"no.such.key2" }, invalid:null };
  var v = scenarioView(part, tfn);
  assert.equal(v.rows.length, 1);
  assert.ok(v.rows[0].label.length > 0 && v.rows[0].text.length > 0);
  var badStatus = Object.assign({}, part, { status:"nonsense" });
  assert.equal(scenarioView(badStatus, tfn), null);   // a status badge with no label would be an empty pill
});

test("no empty bullets: missing or untranslated lines are dropped, never printed blank", function(){
  var lines = cleanLines([{ key:"no.such.key" }, { key:"" }, null, { key:"nm.unv.volume" }, { key:"nm.unv.volume" }], tfn);
  assert.deepEqual(lines, [tfn("nm.unv.volume")]);
  assert.equal(textOf(tfn, "nm.trig.bull", {}), "");                  // unfilled placeholder is not a message
  assert.ok(textOf(tfn, "nm.trig.bull", { lvl:"24,000" }).indexOf("24,000") >= 0);
});

test("view model with one scenario missing shows only the other, and no blank text anywhere", function(){
  var r = run(CASES.live_up());
  var m = JSON.parse(JSON.stringify(r.m));
  m.scenarios.bear = null;
  var v = buildNextMoveView(m, tfn);
  assert.equal(v.scenarios.length, 1);
  assert.equal(v.scenarios[0].side, "bull");
  allLines(v).concat(v.scenarios[0].rows.map(function(x){ return x.text; })).forEach(function(l){ assert.ok(l && l.trim().length > 0); });
});

// ---- Fresh / delayed / stale / unavailable ----------------------------------------
test("fresh in-session data: live price, scenarios present", function(){
  var r = run(CASES.live_up());
  assert.equal(r.m.state, "ok");
  assert.equal(r.m.price.kind, "live");
  assert.ok(r.v.scenarios.length >= 1);
});

test("delayed (market closed) data: last confirmed price, never live", function(){
  var r = run(CASES.bullish(), { now:NOW + 8*3600000, lastUpdated:NOW });
  assert.notEqual(r.m.price && r.m.price.kind, "live");
});

test("stale quote: no assessment, no scenarios, NIFTY price named as missing", function(){
  var r = run(makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, session:"CLOSED", status:"DELAYED", ts:NOW - 20*DAY }));
  assert.equal(r.m.state, "unavailable");
  assert.equal(r.m.assessment, "unavailable");
  assert.equal(r.v.scenarios.length, 0);
  assert.equal(r.v.forLines.length + r.v.againstLines.length, 0);
  assert.ok(r.m.missing.some(function(x){ return x.id=="nifty_q"; }));
  assert.ok(r.v.missingText.indexOf("NIFTY 50 price") >= 0);
});

test("stale daily history: unavailable, NIFTY daily trend named as stale", function(){
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7 });
  var n = p.directionHistory.NIFTY.candles.length;
  p.directionHistory.NIFTY.candles = p.directionHistory.NIFTY.candles.map(function(c, i){ return Object.assign({}, c, { t:NOW - 30*DAY - (n-1-i)*DAY }); });
  var r = run(p);
  assert.equal(r.m.state, "unavailable");
  assert.ok(r.m.missing.some(function(x){ return x.id=="nifty_h"; }));
  assert.ok(r.v.missingText.indexOf("daily trend") >= 0);
});

test("unavailable inputs: no quote, no history, no data at all, demo", function(){
  [makePayload({ noNifty:true }), makePayload({ noHistory:true })].forEach(function(p){
    var r = run(p);
    assert.equal(r.m.state, "unavailable");
    assert.equal(r.v.scenarios.length, 0);
    assert.ok(r.v.missingText.length > 0);
  });
  var none = computeNextMove(null);
  assert.equal(none.state, "unavailable");
  assert.deepEqual(none.missing.map(function(x){ return x.id; }).sort(), ["nifty_h", "nifty_q"]);
  var demo = run(makePayload({}), { now:NOW, lastUpdated:NOW, demo:true });
  assert.equal(demo.m.state, "unavailable");
  assert.ok(demo.v.missingText.length > 0);
});

test("missingText lists names with reasons and skips unknown ids", function(){
  assert.equal(missingText([{ id:"nifty_q", reason:"stale" }, { id:"nope" }, null], tfn), "NIFTY 50 price (stale)");
});

// ---- Home card -----------------------------------------------------------------
var HOME = ["EquityHomeMobile", "EquityHomeTablet", "EquityHomeLaptop", "EquityHomeDesktop"];
HOME.forEach(function(f){
  test("Home layout " + f + " renders the Home hub and not the missing AI text endpoint", function(){
    var src = fs.readFileSync(new URL("../src/screens/home/" + f + ".jsx", import.meta.url), "utf8");
    assert.ok(src.indexOf("<HomeHub") >= 0, "no HomeHub");
    assert.ok(src.indexOf("ai.watchNext") < 0 && src.indexOf("ai.now") < 0, "still reads ai.now / ai.watchNext");
  });
});

test("the Home block and the full page share one hook and add no request of their own", function(){
  var home = fs.readFileSync(new URL("../src/screens/NextMoveHome.jsx", import.meta.url), "utf8");
  var page = fs.readFileSync(new URL("../src/screens/MarketMood.jsx", import.meta.url), "utf8");
  var hook = fs.readFileSync(new URL("../src/hooks/useNextMove.js", import.meta.url), "utf8");
  assert.ok(home.indexOf("useNextMove(") >= 0 && page.indexOf("useNextMove(") >= 0);
  assert.ok(home.indexOf("computeDirection") < 0 && home.indexOf("fetch(") < 0);
  assert.ok(hook.indexOf("fetch(") < 0);
});

test("unavailable Home state says No reliable setup - wait and names what is missing", function(){
  var r = run(makePayload({ noNifty:true }));
  // NextMoveHome renders nm.assess.wait when state is not ok, plus missingText
  assert.equal(tfn("nm.assess.wait"), "No reliable setup \u2014 wait");
  assert.ok(r.v.missingText.length > 0);
});

// ---- Old name ---------------------------------------------------------------------
function walk(dir, out){
  fs.readdirSync(dir).forEach(function(n){
    var p = path.join(dir, n);
    var st = fs.statSync(p);
    if(st.isDirectory()) walk(p, out); else if(/\.(jsx?|mjs)$/.test(n)) out.push(p);
  });
  return out;
}
test("no user-facing 'AI Market Mood' in language packs or in code outside comments", function(){
  var root = new URL("../src", import.meta.url).pathname;
  var hits = [];
  walk(root, []).forEach(function(f){
    if(f.indexOf(path.join("i18n", "lang")) >= 0) return;
    var src = fs.readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").split("\n");
    src.forEach(function(line, i){
      var code = line.replace(/^\s*\/\/.*$/, "");
      if(/AI Market Mood/i.test(code)) hits.push(f + ":" + (i+1));
    });
  });
  assert.deepEqual(hits, []);
  Object.keys(EN.strings).forEach(function(k){ assert.ok(!/AI Market Mood/i.test(EN.strings[k]), k); });
});
