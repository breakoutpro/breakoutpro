// Gann chart tool: the pure view helpers and the wiring into the Chart screen and App.
// Candles are FIXTURES (mock). The rendered screen is exercised separately in a browser harness.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { prepareBars, anchorWindow, swingOptions, isSwing, lineFromAnchor, describeLine, fmtNum, linkedRules, ruleOutOfSync, ruleBody, VISIBLE, MIN_BARS } from "../src/gann/gannView.js";
import { lineValueAt, validateLine } from "../src/gann/gannMath.js";
import { istMs, tradingDays, T0 } from "./alert-helpers.mjs";

var DAY = 86400000, IST = 19800000;
function slotMs(day, k, minutes){ return day * DAY - IST + (555 + k * (minutes || 15)) * 60000; }
function read(p){ return fs.readFileSync(p, "utf8"); }
var NOW = istMs(2026, 10, 14, 11, 0) + 5000;      // Wed 14 Oct 2026 11:00:05 IST (market open)

// chart-shaped candles ({ time seconds, open, high, low, close, vol })
function chart15(days, fn, until){
  var out = [];
  days.forEach(function(d){ for(var k = 0; k < 25; k++){ var s = slotMs(d, k); if(until != null && s > until) break; var b = fn(out.length);
    out.push({ time:Math.floor(s / 1000), open:b.o, high:b.h, low:b.l, close:b.c, vol:1000 }); } });
  return out;
}
var WAVE = function(i){ var c = 100 + Math.sin(i / 5) * 6; return { o:c, h:c + 0.6, l:c - 0.6, c:c }; };
var DAYS = tradingDays(T0 + 1, 6);               // five full sessions then Wed 14 Oct

test("prepareBars: supported timeframes map, 1m and 1W are not offered", function(){
  var cs = chart15(DAYS, WAVE, NOW);
  var p = prepareBars(cs, "15m", NOW);
  assert.equal(p.tf, "15m"); assert.equal(p.supported, true); assert.equal(p.canDraw, true); assert.equal(p.canAlert, true); assert.equal(p.alertReason, null);
  assert.ok(p.forming, "the forming candle is kept apart from the completed ones");
  assert.ok(p.bars.every(function(b){ return b.endMs <= NOW - 1000; }));
  assert.equal(prepareBars(cs, "1h", NOW).tf, "1H");
  ["1m", "1W"].forEach(function(t){ var q = prepareBars(cs, t, NOW); assert.equal(q.supported, false); assert.equal(q.canDraw, false); assert.equal(q.canAlert, false); assert.equal(q.reason, "unsupported_tf"); });
});
test("prepareBars: no data and daily-as-intraday switch the intraday tool and alerts off", function(){
  assert.equal(prepareBars([], "15m", NOW).reason, "no_data");
  assert.equal(prepareBars(null, "15m", NOW).canDraw, false);
  var daily = DAYS.map(function(d, i){ var c = 100 + i; return { time:Math.floor(slotMs(d, 0) / 1000), open:c, high:c + 1, low:c - 1, close:c, vol:5 }; });
  var p = prepareBars(daily, "15m", NOW);
  assert.equal(p.canDraw, false); assert.equal(p.canAlert, false); assert.equal(p.reason, "intraday_unavailable"); assert.equal(p.alertReason, "intraday_unavailable");
  var d1 = prepareBars(daily, "1D", NOW);
  assert.equal(d1.supported, true); assert.equal(d1.intraday.ok, true); assert.equal(d1.canDraw, true);
});
test("prepareBars: stale data can still be drawn but never alerted; short history cannot alert", function(){
  var cs = chart15(DAYS, WAVE, NOW);
  var late = istMs(2026, 10, 14, 14, 0);
  var p = prepareBars(cs, "15m", late);
  assert.equal(p.canDraw, true); assert.equal(p.canAlert, false); assert.equal(p.alertReason, "stale"); assert.equal(p.freshness.state, "stale");
  var few = chart15([DAYS[5]], WAVE, istMs(2026, 10, 14, 11, 40));
  var q = prepareBars(few, "15m", istMs(2026, 10, 14, 11, 45) + 5000);
  assert.equal(q.canDraw, true);
  assert.equal(q.canAlert, false); assert.equal(q.alertReason, "insufficient_history");
  assert.ok(MIN_BARS >= 15);
  var tiny = prepareBars(chart15([DAYS[5]], WAVE, istMs(2026, 10, 14, 9, 55)), "15m", istMs(2026, 10, 14, 10, 0) + 5000);
  assert.equal(tiny.canDraw, false, "too few candles to prove the series is intraday: the tool stays off rather than guessing");
});
test("prepareBars rejects off-grid, future and malformed candles instead of repairing them", function(){
  var cs = chart15(DAYS, WAVE, NOW);
  cs.push({ time:Math.floor(slotMs(DAYS[5], 3) / 1000) + 61, open:1, high:2, low:0.5, close:1.5, vol:1 });
  cs.push({ time:Math.floor((NOW + 86400000) / 1000), open:1, high:2, low:0.5, close:1.5, vol:1 });
  cs.push({ time:Math.floor(slotMs(DAYS[5], 2) / 1000), open:5, high:1, low:9, close:3, vol:1 });
  var p = prepareBars(cs, "15m", NOW);
  assert.ok(p.rejected.misaligned >= 1 && p.rejected.future >= 1 && (p.rejected.malformed >= 1 || p.rejected.duplicate >= 1));
});
test("anchor window, swing options and anchors come from real completed candles in view", function(){
  var p = prepareBars(chart15(DAYS, WAVE, NOW), "15m", NOW);
  var w = anchorWindow(p.bars);
  assert.equal(w.length, VISIBLE); assert.equal(w[w.length - 1], p.bars[p.bars.length - 1]);
  var lows = swingOptions(w, "low"), highs = swingOptions(w, "high");
  assert.ok(lows.length > 0 && highs.length > 0 && lows.length <= 8);
  lows.forEach(function(o){ assert.ok(isSwing(w, o.idx, "low")); assert.equal(o.price, w[o.idx].low); assert.ok(/IST$/.test(o.label)); });
  highs.forEach(function(o){ assert.equal(o.price, w[o.idx].high); });
  assert.ok(lows[0].idx > lows[lows.length - 1].idx || lows.length == 1, "newest first");
  var newest = w.length - 1;
  assert.equal(isSwing(w, newest, "low"), false, "the newest candles cannot be confirmed swings");
});
test("a line built from a chosen candle is valid, and its values follow the maths", function(){
  var p = prepareBars(chart15(DAYS, WAVE, NOW), "15m", NOW), w = anchorWindow(p.bars);
  var o = swingOptions(w, "low")[0], b = w[o.idx];
  var line = lineFromAnchor("RELIANCE", "15m", "low", b, 0.5, "auto");
  assert.equal(line.anchorPrice, b.low); assert.equal(line.scaleMode, "auto");
  assert.ok(validateLine(line, NOW).ok);
  var d = describeLine(line, p.bars, NOW), last = p.bars[p.bars.length - 1];
  assert.equal(d.ok, true); assert.equal(d.lastClose, last.close); assert.equal(d.levelAtLast, lineValueAt(line, last.startMs));
  assert.ok(d.levelNow != null && d.levelNow > d.levelAtLast, "the line keeps rising one scale step per bar (the forming candle is one bar later)");
  assert.equal(d.side, d.lastClose > d.levelAtLast ? "above" : "below");
  assert.equal(describeLine(line, p.bars, istMs(2026, 10, 14, 16, 30)).levelNow, null, "after the close there is no current bar");
  assert.equal(describeLine(null, p.bars, NOW).ok, false);
  assert.equal(describeLine(Object.assign({}, line, { scale:0 }), p.bars, NOW).ok, false);
  assert.equal(fmtNum(24512.3), "24,512.30"); assert.equal(fmtNum(null), "-");
});
test("alert rules link to a line by id and are detected as out of date after an edit", function(){
  var line = { id:"abcdef1234", sym:"RELIANCE", tf:"15m", kind:"low", anchorT:1760000000, anchorPrice:100, scale:0.5 };
  var near = ruleBody(line, "RELIANCE", "gann_near", 0.4, null);
  assert.equal(near.params.nearPct, 0.4); assert.equal(near.params.lineId, "abcdef1234"); assert.equal(near.timeframe, "15m"); assert.equal(near.enabled, true); assert.equal("id" in near, false);
  var cl = ruleBody(line, "RELIANCE", "gann_close", 0.4, { id:"r9", enabled:false });
  assert.equal(cl.id, "r9"); assert.equal(cl.enabled, false); assert.equal("nearPct" in cl.params, false);
  var rules = [Object.assign({ id:"r1", type:"gann_near" }, near), Object.assign({ id:"r2", type:"gann_close" }, cl), { id:"r3", type:"price_above", params:{ value:5 } },
    { id:"r4", type:"gann_any", timeframe:"15m", params:{ lineId:"other00000" } }];
  var l = linkedRules(rules, "abcdef1234");
  assert.deepEqual(Object.keys(l).sort(), ["gann_close", "gann_near"]);
  assert.equal(ruleOutOfSync(rules[0], line), false);
  assert.equal(ruleOutOfSync(rules[0], Object.assign({}, line, { scale:0.75 })), true);
  assert.equal(ruleOutOfSync(rules[0], Object.assign({}, line, { anchorT:1760000900 })), true);
  assert.equal(ruleOutOfSync(rules[0], Object.assign({}, line, { kind:"high" })), true);
  assert.equal(ruleOutOfSync(null, line), false);
});

test("wiring: Chart screen hosts the Gann panel and overlay, the symbol chips include the watchlist, App passes setTab", function(){
  var ch = read("src/screens/Chart.jsx");
  assert.match(ch, /import GannPanel from "\.\/GannPanel"/);
  assert.match(ch, /<GannPanel candles=\{candles\} tf=\{tf\} symLabel=\{sym\.sym\} onLine=\{setGann\} setTab/);
  assert.match(ch, /gann=\{gann\}/);
  assert.match(ch, /useWatchlist\(\)/);
  assert.match(ch, /symbols\.map\(function\(s,i\)/);
  assert.match(ch, /lineSeries\(visible, gann\.line\)/);
  assert.match(ch, /clipPath id="bpGannClip"/);
  assert.match(ch, /SYMBOLS = \[/, "the original proven symbol list is still there");
  assert.match(read("src/App.jsx"), /<ChartEngine setTab=\{setTab\}\/>/);
});
test("the Gann panel keeps alert calls on the existing hook and makes no other network calls", function(){
  var gp = read("src/screens/GannPanel.jsx");
  assert.match(gp, /useSmartAlertsPro/); assert.ok(!/fetch\(/.test(gp));
  assert.match(gp, /function GannInner/); assert.match(gp, /export default function GannPanel/);
  assert.ok(gp.indexOf("useSmartAlertsPro()") < gp.indexOf("export default function GannPanel"), "the alert hook is only in the body that is mounted while the panel is open");
  assert.equal((gp.match(/useSmartAlertsPro\(/g) || []).length, 1);
});
test("colour policy: the tool uses blue and neutral tokens; green and red are not used for the line or the controls", function(){
  var gp = read("src/screens/GannPanel.jsx");
  assert.ok(!/c\.up\b|c\.down\b|c\.bull\b|c\.bear\b|#[0-9A-Fa-f]{6}/.test(gp), "no market-direction tokens and no hard-coded colours in the panel");
  var ch = read("src/screens/Chart.jsx");
  var seg = ch.slice(ch.indexOf("Gann 1x1 line: blue"), ch.indexOf("Time axis - reserved"));
  assert.ok(/theme\.c\.blue/.test(seg) && !/\bG\b|\bR\b|c\.up|c\.down/.test(seg));
});
test("accessibility: labelled controls, 44px touch targets, 16px inputs, expanded state", function(){
  var gp = read("src/screens/GannPanel.jsx");
  assert.match(gp, /aria-expanded/); assert.match(gp, /aria-pressed/); assert.match(gp, /htmlFor="gann-anchor"/); assert.match(gp, /htmlFor="gann-scale"/); assert.match(gp, /role="status"/);
  assert.match(gp, /minHeight:44/); assert.match(gp, /fontSize:16/);
});
test("education note and limits are shown", function(){
  var gp = read("src/screens/GannPanel.jsx");
  assert.match(gp, /depend on the anchor you pick and the scale you choose/); assert.match(gp, /not a guaranteed signal/);
  assert.match(gp, /2026 NSE list only/); assert.match(gp, /has not been confirmed on a real device/);
  assert.match(gp, /Daily candles are never used in place of intraday ones/);
});
test("source hygiene for the Gann UI files", function(){
  ["src/screens/GannPanel.jsx", "src/gann/gannView.js", "src/screens/Chart.jsx"].forEach(function(f){
    var s = read(f); assert.ok(!/[^\x00-\x7F]/.test(s), f + " non-ascii"); assert.ok(s.indexOf("`") < 0, f + " backtick"); assert.ok(s.indexOf("===") < 0, f + " triple");
  });
});
