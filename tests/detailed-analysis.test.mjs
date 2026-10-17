// Tests for the "Detailed Analysis" section of Next Move Intelligence.
// Fixtures only: no real provider is contacted. The expand / collapse behaviour
// of the component itself is checked by source assertions here and in a browser
// run (390 px and 1366 px) outside this file.
// Run: node --test tests/detailed-analysis.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import EN from "../src/i18n/lang/en.js";
import { computeDirection } from "../src/screens/DirectionEngine.js";
import { computeNextMove } from "../src/screens/NextMoveEngine.js";
import { buildDetailView, fmtDay, fmtDateTime } from "../src/screens/NextMoveDetailView.js";
import { makePayload, NOW } from "./direction-fixtures.mjs";

var DAY = 86400000;
var OPEN = { now:NOW, lastUpdated:NOW-5000 };
var CLOSED = { session:"CLOSED", status:"DELAYED" };
var MOOD = { label:"Bullish", score:67, stage:"Early Uptrend", confidence:"Medium" };
var EVO = { available:true, structure:["Higher highs", "Range compressing"], sessions:4, return3dPct:"+0.6%", status:"DELAYED" };
function tfn(key, vars){
  var s = EN.strings[key];
  if(s==null || s=="") return "";
  return String(s).replace(/\{(\w+)\}/g, function(m, n){ return vars && vars[n]!=null ? String(vars[n]) : m; });
}
function make(payload, opts, over){
  var d = computeDirection(payload, opts || OPEN);
  if(over && over.d) over.d(d);
  var nm = computeNextMove(d);
  var args = Object.assign({ nm:nm, mood:MOOD, evolution:EVO, vixQuote:payload.indices && payload.indices.VIX, usingDemo:false }, over && over.args);
  return { d:d, nm:nm, v:buildDetailView(args, tfn) };
}
var CASES = {
  bullish: function(){ return makePayload(Object.assign({ niftyKind:"rangeBreakUp", bnKind:"rangeBreakUp", niftyChg:0.6, bnChg:0.7, vixChg:-6, crudeChg:-1.5 }, CLOSED)); },
  bearish: function(){ return makePayload(Object.assign({ niftyKind:"rangeBreakDown", bnKind:"rangeBreakDown", niftyChg:-0.6, bnChg:-0.7 }, CLOSED)); },
  live: function(){ return makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7 }); },
  conflict: function(){ return makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:-0.7, sectorsUp:1 }); }
};
function everyString(v){
  var out = [];
  v.evidence.groups.forEach(function(g){ out.push(g.title, g.empty); g.rows.forEach(function(r){ out.push(r.lead, r.rest, r.text); }); });
  v.indicators.forEach(function(r){ out.push(r.name, r.price, r.ema9, r.ema21, r.interp); });
  v.timeline.entries.forEach(function(e){ out.push(e.label, e.text); });
  v.quality.rows.forEach(function(r){ out.push(r.name); });
  v.how.forEach(function(h){ out.push(h); });
  return out;
}

// ---- 1-2. Collapsed by default, header toggles (component source) --------------------
var SRC = fs.readFileSync(new URL("../src/screens/DetailedAnalysis.jsx", import.meta.url), "utf8");
test("Detailed Analysis starts collapsed and is toggled by one accessible header button", function(){
  assert.ok(/useState\(false\)/.test(SRC), "default state must be collapsed");
  assert.ok(SRC.indexOf("aria-expanded={open}") >= 0);
  assert.ok(SRC.indexOf("aria-controls={panelId}") >= 0);
  assert.ok(SRC.indexOf("onClick={function(){ setOpen(!open); }}") >= 0);
  assert.ok(/<button[^>]*type="button"/.test(SRC));
  assert.ok(SRC.indexOf("{open && v ?") >= 0, "panel must render only when open");
  assert.ok(SRC.indexOf("localStorage") < 0 && SRC.indexOf("sessionStorage") < 0, "state stays local to the component");
  assert.equal(tfn("nm.da.title"), "Detailed Analysis");
  assert.equal(tfn("nm.da.sub"), "Evidence \u00b7 Indicators \u00b7 Market context \u00b7 Data quality");
});

test("sections appear in the specified order: A evidence, B indicators, C context, D timeline, E data quality, F method", function(){
  var order = ["nm.da.a.title", "nm.da.b.title", "nm.da.c.title", "nm.da.d.title", "nm.da.e.title", "nm.da.f.title"].map(function(k){ return SRC.indexOf('t("' + k + '")'); });
  order.forEach(function(i){ assert.ok(i > 0); });
  for(var i=1; i<order.length; i++) assert.ok(order[i] > order[i-1], "section order");
  assert.equal(tfn("nm.da.a.title"), "Why this setup?");
  assert.equal(tfn("nm.da.b.title"), "Key Indicators");
  assert.equal(tfn("nm.da.c.title"), "Market Context");
  assert.equal(tfn("nm.da.d.title"), "Recent Market Structure");
  assert.equal(tfn("nm.da.e.title"), "Data Quality");
  assert.equal(tfn("nm.da.f.title"), "How this assessment works");
});

test("the page no longer repeats the Early Direction evidence or the old gauge under the card", function(){
  var page = fs.readFileSync(new URL("../src/screens/MarketMood.jsx", import.meta.url), "utf8");
  assert.ok(page.indexOf("<DetailedAnalysis") >= 0);
  assert.ok(page.indexOf("<EarlyDirectionPanel") < 0 && page.indexOf("<SemicircleGauge") < 0 && page.indexOf("<StageTimeline") < 0);
  assert.ok(page.indexOf("<NextMoveCard") < page.indexOf("<DetailedAnalysis"));
});

// ---- 3. No empty cards or blank bullets ---------------------------------------------------
Object.keys(CASES).forEach(function(name){
  test("no blank text, empty rows or placeholder tokens: " + name, function(){
    var r = make(CASES[name]());
    assert.equal(r.nm.state, "ok");
    everyString(r.v).forEach(function(s){ assert.ok(typeof s=="string" && s.trim().length > 0, "blank string in " + name); assert.ok(!/\{\w+\}/.test(s), "placeholder left in: " + s); });
    r.v.evidence.groups.forEach(function(g){ assert.ok(g.rows.length > 0 || g.empty.length > 0, "empty group without explanation"); });
  });
});

test("a group with no reliable entries shows one explanation, not an empty list", function(){
  var r = make(CASES.live(), OPEN, { d: function(d){ d.contradicts = []; d.caveats = []; } });
  var second = r.v.evidence.groups[1];
  assert.equal(second.rows.length, 0);
  assert.ok(second.empty.length > 0);
});

// ---- 4. De-duplicated evidence ---------------------------------------------------------------
test("evidence rows are unique by instrument and message across both groups", function(){
  Object.keys(CASES).forEach(function(name){
    var r = make(CASES[name]());
    var seen = {};
    r.v.evidence.groups.forEach(function(g){ g.rows.forEach(function(x){ var k = x.name + "|" + x.text; assert.ok(!seen[k], "repeated: " + k); seen[k] = 1; }); });
  });
});

test("the same signal injected into both lists is shown once", function(){
  var r = make(CASES.bullish(), OPEN, { d: function(d){
    var dup = { id:"nifty_day", key:"dir.s.day_up", vars:{ idx:"NIFTY 50", p:"0.6" }, weight:1 };
    d.supports = (d.supports || []).concat([dup, Object.assign({}, dup)]);
    d.contradicts = (d.contradicts || []).concat([Object.assign({}, dup)]);
  } });
  var n = 0;
  r.v.evidence.groups.forEach(function(g){ g.rows.forEach(function(x){ if(x.id=="nifty_day" && x.text.indexOf("0.6") >= 0) n++; }); });
  assert.equal(n, 1);
});

test("an evidence row carries the instrument name, a short statement and its input status", function(){
  var r = make(CASES.bullish());
  var row = r.v.evidence.groups[0].rows[0];
  assert.ok(row.lead.length > 0 && row.rest.length > 0);
  assert.ok(["LIVE", "DELAYED", "PARTIAL"].indexOf(row.status) >= 0);
  var day = null;
  r.v.evidence.groups[0].rows.forEach(function(x){ if(x.id=="nifty_day") day = x; });
  assert.ok(day && /0\.6/.test(day.text), "actual percentage change is in the row");
});

// ---- 5. Missing or stale values show the right status --------------------------------------------
test("stale quote: no evidence rows, status STALE and not used in the quality table", function(){
  var r = make(makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7, session:"CLOSED", status:"DELAYED", ts:NOW - 20*DAY }));
  assert.equal(r.nm.state, "unavailable");
  assert.equal(r.v.evidence.available, false);
  assert.equal(r.v.evidence.groups.length, 0);
  assert.ok(r.v.evidence.unavailText.length > 0);
  var q = r.v.quality.rows.filter(function(x){ return x.id=="nifty_q"; })[0];
  assert.equal(q.status, "STALE");
  assert.equal(q.used, false);
  assert.equal(r.v.quality.reliabKey, "low");
  assert.ok(r.v.quality.essentialMissing.indexOf("NIFTY 50 quote") >= 0);
});

test("stale daily candles: indicator values are not shown and the reading says stale", function(){
  var p = makePayload({ niftyKind:"up", niftyChg:0.6, bnChg:0.7 });
  var n = p.directionHistory.NIFTY.candles.length;
  p.directionHistory.NIFTY.candles = p.directionHistory.NIFTY.candles.map(function(c, i){ return Object.assign({}, c, { t:NOW - 30*DAY - (n-1-i)*DAY }); });
  var r = make(p);
  var nifty = r.v.indicators.filter(function(x){ return x.id=="nifty"; })[0];
  assert.equal(nifty.have, false);
  assert.equal(nifty.price, "\u2014"); assert.equal(nifty.ema9, "\u2014"); assert.equal(nifty.ema21, "\u2014");
  assert.equal(nifty.interpKey, "stale");
  assert.equal(nifty.status, "STALE");
  assert.equal(r.v.quality.rows.filter(function(x){ return x.id=="nifty_h"; })[0].status, "STALE");
});

test("no history at all: unavailable status, never a substitute from the live quote", function(){
  var r = make(makePayload({ noHistory:true }));
  r.v.indicators.forEach(function(x){ assert.equal(x.have, false); assert.equal(x.price, "\u2014"); assert.equal(x.status, "UNAVAILABLE"); });
});

test("too few candles: 'not enough valid candles'", function(){
  var p = makePayload({ niftyKind:"up" });
  p.directionHistory.NIFTY.candles = p.directionHistory.NIFTY.candles.slice(-10);
  var r = make(p);
  var nifty = r.v.indicators.filter(function(x){ return x.id=="nifty"; })[0];
  assert.equal(nifty.have, false);
  assert.equal(nifty.interpKey, "short");
});

test("source times are provider times in IST, and candle rows show a date only", function(){
  var r = make(CASES.live());
  var qrow = r.v.quality.rows.filter(function(x){ return x.id=="nifty_q"; })[0];
  var inp = r.nm.detail.inputs.filter(function(x){ return x.id=="nifty_q"; })[0];
  assert.equal(qrow.time, fmtDateTime(inp.asOf));
  var crow = r.v.quality.rows.filter(function(x){ return x.id=="nifty_h"; })[0];
  var cin = r.nm.detail.inputs.filter(function(x){ return x.id=="nifty_h"; })[0];
  assert.equal(crow.time, fmtDay(cin.asOf));
  assert.ok(!/am|pm/i.test(crow.time));
  assert.equal(new Date(inp.asOf).toLocaleString("en-IN", { timeZone:"Asia/Kolkata", day:"numeric", month:"short", hour:"numeric", minute:"2-digit", hour12:true }), fmtDateTime(inp.asOf));
});

test("demo data: every input shows DEMO and none is used", function(){
  var r = make(makePayload({}), { now:NOW, lastUpdated:NOW, demo:true });
  r.v.quality.rows.forEach(function(x){ assert.equal(x.status, "DEMO"); assert.equal(x.used, false); });
  assert.equal(r.v.evidence.available, false);
  assert.equal(r.v.timeline.entries.length, 0);
});

// ---- 6. EMA interpretation matches the numbers -----------------------------------------------------------
test("EMA reading follows the actual numbers", function(){
  Object.keys(CASES).forEach(function(name){
    var r = make(CASES[name]());
    r.nm.detail.indicators.forEach(function(x){
      if(x.close==null) return;
      if(x.interp=="aligned_up") assert.ok(x.ema9 > x.ema21 && x.close > x.ema21, name);
      else if(x.interp=="aligned_dn") assert.ok(x.ema9 < x.ema21 && x.close < x.ema21, name);
      else assert.ok(!(x.ema9 > x.ema21 && x.close > x.ema21) && !(x.ema9 < x.ema21 && x.close < x.ema21), name);
    });
  });
  var up = make(CASES.bullish()).v.indicators[0];
  assert.equal(up.interpKey, "aligned_up");
  var dn = make(CASES.bearish()).v.indicators[0];
  assert.equal(dn.interpKey, "aligned_dn");
});

test("a stale 'bull' flag cannot make the UI say aligned when the numbers disagree", function(){
  var r = make(CASES.bullish(), OPEN, { d: function(d){ d.tech.nifty.bull = true; d.tech.nifty.ema9 = d.tech.nifty.ema21 - 50; } });
  assert.equal(r.v.indicators[0].interpKey, "mixed");
});

test("the UI computes no EMA of its own", function(){
  var view = fs.readFileSync(new URL("../src/screens/NextMoveDetailView.js", import.meta.url), "utf8");
  var comp = SRC;
  [view, comp].forEach(function(src){ assert.ok(!/function\s+ema\w*\(/i.test(src) && !/candles\.(map|reduce)\(/.test(src)); });
});

test("indicator rows carry the basis label (completed daily candles, not live quotes)", function(){
  assert.ok(tfn("nm.da.ind.basis").indexOf("daily candles") >= 0 && tfn("nm.da.ind.basis").indexOf("not live") >= 0);
  var r = make(CASES.bullish());
  r.v.indicators.forEach(function(x){ assert.ok(x.candle.indexOf("Daily candle:") == 0); });
});

// ---- 7. Mood is secondary context, never a probability ---------------------------------------------------
test("market context: mood shown as background context with the required sentence", function(){
  var r = make(CASES.live());
  var c = r.v.context;
  assert.equal(c.available, true);
  assert.equal(c.mood, "Bullish");
  assert.ok(c.score.indexOf("67") >= 0);
  assert.equal(tfn("nm.da.c.note"), "The market mood is background context. It is not a probability that the next move will occur.");
  [c.mood, c.score, c.trend].forEach(function(s){ assert.ok(!/probab|chance|likelihood|accuracy|win rate/i.test(s), s); });
  assert.ok(c.trend.indexOf("Early Uptrend") >= 0 && c.trend.indexOf("Higher highs") >= 0);
});

test("market context: stale data is labelled as not current; unavailable mood shows no score", function(){
  var stale = make(makePayload({ niftyKind:"up", session:"CLOSED", status:"DELAYED", ts:NOW - 20*DAY }));
  assert.equal(stale.v.context.stale, true);
  assert.equal(stale.v.context.status, "STALE");
  var none = make(CASES.live(), OPEN, { args: { mood:null, usingDemo:true } });
  assert.equal(none.v.context.available, false);
  assert.equal(none.v.context.score, null);
});

test("VIX and sector participation appear only when the engine accepted them", function(){
  var ok = make(CASES.live());
  assert.ok(ok.v.context.vix && ok.v.context.vix.ok);
  var noSect = make(makePayload({ noSectors:true }));
  assert.equal(noSect.v.context.sector, "");
  var noVix = make(makePayload({ noVix:true }), OPEN, { args: { vixQuote:null } });
  assert.equal(noVix.v.context.vix, null);
});

// ---- 8. Timeline grounded in existing output --------------------------------------------------------------
test("timeline: structure entries come from the existing evolution flags, with no invented dates", function(){
  var r = make(CASES.live());
  var ids = r.v.timeline.entries.map(function(e){ return e.id; });
  assert.ok(ids.indexOf("st_hh") >= 0 && ids.indexOf("st_rc") >= 0);
  assert.equal(ids.indexOf("st_ll"), -1);
  r.v.timeline.entries.filter(function(e){ return e.id.indexOf("st_")==0; }).forEach(function(e){ assert.equal(e.status, "historical"); assert.ok(e.when.indexOf("Last 4 sessions") == 0); });
  var none = make(CASES.live(), OPEN, { args: { evolution:{ available:true, structure:["No clear structure signal"], sessions:4, return3dPct:"+0.1%" } } });
  assert.ok(none.v.timeline.entries.every(function(e){ return e.id.indexOf("st_")!=0; }));
  var gone = make(CASES.live(), OPEN, { args: { evolution:{ available:false } } });
  assert.ok(gone.v.timeline.entries.every(function(e){ return e.id.indexOf("st_")!=0; }));
});

test("timeline: a confirmed breakout entry matches the engine and carries the candle date", function(){
  var r = make(CASES.bullish());
  var e = r.v.timeline.entries.filter(function(x){ return x.id=="ev_bo_confirmed"; })[0];
  assert.ok(e, "confirmed breakout entry");
  assert.equal(e.status, "confirmed");
  assert.equal(e.when, fmtDay(r.d.tech.nifty.lastBarTs));
  assert.equal(r.d.tech.nifty.brk.state, "confirmed");
  assert.ok(e.text.indexOf("24,090") >= 0 || e.text.indexOf(r.d.tech.nifty.resistance.toLocaleString("en-IN", { minimumFractionDigits:2, maximumFractionDigits:2 })) >= 0);
});

test("timeline: bearish breakdown, failed breakout and no event inside a range", function(){
  var b = make(CASES.bearish());
  assert.ok(b.v.timeline.entries.some(function(x){ return x.id=="ev_bd_confirmed"; }));
  var f = make(CASES.live(), OPEN, { d: function(d){ var t = d.tech.nifty; t.brk = { dir:0, state:"none" }; t.prevClose = t.resistance + 20; t.close = t.resistance - 10; } });
  assert.ok(f.v.timeline.entries.some(function(x){ return x.id=="ev_failed_up"; }));
  var inRange = make(CASES.live(), OPEN, { d: function(d){ var t = d.tech.nifty; t.brk = { dir:0, state:"none" }; t.prevClose = (t.resistance + t.support)/2; } });
  assert.ok(inRange.v.timeline.entries.every(function(x){ return x.id.indexOf("ev_")!=0; }));
});

test("timeline: the current stage entry is the mood engine's stage, marked Now, and last", function(){
  var r = make(CASES.live());
  var last = r.v.timeline.entries[r.v.timeline.entries.length-1];
  assert.equal(last.id, "current");
  assert.equal(last.current, true);
  assert.ok(last.label.indexOf("Early Uptrend") >= 0);
  var ids = r.v.timeline.entries.map(function(e){ return e.id; });
  assert.equal(ids.indexOf("current"), ids.length-1);
});

test("timeline: stale or unavailable data gives one explanation and no rows; data behind the session marks events historical", function(){
  var u = make(makePayload({ noNifty:true }));
  assert.equal(u.v.timeline.entries.length, 0);
  assert.ok(u.v.timeline.empty.length > 0);
  var p = makePayload(Object.assign({ niftyKind:"rangeBreakUp", bnKind:"rangeBreakUp" }, CLOSED));
  var n = p.directionHistory.NIFTY.candles.length;
  var shifted = function(c, i){ return Object.assign({}, c, { t:NOW - 3*DAY - (n-1-i)*DAY }); };
  p.directionHistory.NIFTY.candles = p.directionHistory.NIFTY.candles.map(shifted);
  p.directionHistory.BANKNIFTY.candles = p.directionHistory.BANKNIFTY.candles.map(shifted);
  var b = make(p, { now:NOW, lastUpdated:NOW });
  if(b.nm.state=="ok"){ b.nm.detail.events.forEach(function(e){ assert.ok(e.status=="historical" || !b.nm.freshness.behind); }); }
});

// ---- 9. Unavailable optional inputs are excluded and labelled --------------------------------------------
test("data quality lists every input; unconnected ones are unavailable, unused and never evidence", function(){
  var r = make(CASES.bullish());
  var ids = r.v.quality.rows.map(function(x){ return x.id; });
  ["nifty_q", "nifty_h", "bn_q", "bn_h", "vix", "sectors", "intraday", "volume", "options", "news", "breadth"].forEach(function(id){ assert.ok(ids.indexOf(id) >= 0, id); });
  for(var i=1; i<11; i++){ /* spec order of the first eleven rows */ }
  assert.deepEqual(ids.slice(0, 11), ["nifty_q", "nifty_h", "bn_q", "bn_h", "vix", "sectors", "intraday", "volume", "options", "news", "breadth"]);
  ["intraday", "volume", "options", "news", "breadth"].forEach(function(id){
    var row = r.v.quality.rows.filter(function(x){ return x.id==id; })[0];
    assert.equal(row.status, "UNAVAILABLE", id);
    assert.equal(row.used, false, id);
    assert.equal(row.time, "", id);
  });
  ["Intraday candles", "Volume", "Options chain", "Market news", "Market breadth"].forEach(function(n){ assert.ok(r.v.quality.optionalExcluded.indexOf(n) >= 0, n); });
  r.v.evidence.groups.forEach(function(g){ g.rows.forEach(function(x){ assert.ok(["volume", "news", "breadth", "options", "intraday"].indexOf(x.id) < 0); }); });
  assert.ok(r.v.quality.essentialUsed.indexOf("NIFTY 50 quote") >= 0 && r.v.quality.essentialUsed.indexOf("NIFTY 50 daily candles") >= 0);
});

test("status labels come from the engine, not constants: a DELAYED fixture and a LIVE fixture differ", function(){
  var live = make(CASES.live());
  var closed = make(CASES.bullish());
  var a = live.v.quality.rows.filter(function(x){ return x.id=="nifty_q"; })[0].status;
  var b = closed.v.quality.rows.filter(function(x){ return x.id=="nifty_q"; })[0].status;
  assert.equal(a, "LIVE"); assert.equal(b, "DELAYED");
});

test("methodology: five concise points that make no accuracy or win-rate claim", function(){
  var r = make(CASES.live());
  assert.equal(r.v.how.length, 5);
  r.v.how.forEach(function(h){ assert.ok(h.length < 260); });
  var all = r.v.how.join(" ");
  assert.ok(/rule-based/i.test(all) && /daily candles/i.test(all) && /not a validated probability/i.test(all) && /no backtest/i.test(all));
  assert.ok(!/\d+\s?%/.test(all));
});

// ---- 10. Existing behaviour intact ---------------------------------------------------------------------------
test("the Next Move assessment and scenarios are unchanged by the detail feed", function(){
  var r = make(CASES.bullish());
  assert.equal(r.nm.assessment, "upside");
  assert.equal(r.nm.scenarios.bull.status, "confirmed");
  assert.equal(r.nm.scenarios.bear.status, "invalidated");
  assert.equal(r.nm.horizon.intraday, false);
  assert.equal(r.nm.confidence.validated, false);
  var w = make(CASES.conflict());
  assert.equal(w.nm.assessment, "wait");
  assert.equal(computeNextMove(null).state, "unavailable");
});
