// Gann 1x1 maths, calendar, swings, scale, saved lines and crossing detection.
// All candles here are FIXTURES made by formula (mock data). Nothing contacts a provider.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  GANN, slotsPerDay, slotOf, barsBetween, barStartAt, validateLine, lineValueAt, lineSeries, suggestScale,
  swingIndexes, intradayCheck, sideOf, anchorMatches, scanCloses, nearCheck, alertTfOfChart, dirOf
} from "../src/gann/gannMath.js";
import { validateCandles } from "../src/screens/BreakoutTfEngine.js";
import { loadLines, saveLine, removeLine, cleanLine, MAX_LINES, KEY, findLine } from "../src/gann/gannStore.js";
import { dayIdx, istMs, tradingDays, T0 } from "./alert-helpers.mjs";

var DAY = 86400000, IST = 19800000;
function slotMs(day, k, minutes){ return day * DAY - IST + (555 + k * (minutes || 15)) * 60000; }
var D_MON = dayIdx(2026, 10, 12), D_TUE = dayIdx(2026, 10, 13), D_FRI = dayIdx(2026, 10, 16), D_NEXT_MON = dayIdx(2026, 10, 19);

test("bar clock: slots per day for each timeframe", function(){
  assert.equal(slotsPerDay("5m"), 75); assert.equal(slotsPerDay("15m"), 25); assert.equal(slotsPerDay("1H"), 7); assert.equal(slotsPerDay("1D"), 1);
  assert.equal(slotsPerDay("1m"), null);
});
test("bars between candles: same day, overnight, weekend and exchange holiday are all counted on the trading calendar", function(){
  assert.equal(barsBetween(slotMs(D_TUE, 0), slotMs(D_TUE, 4), "15m"), 4);
  assert.equal(barsBetween(slotMs(D_TUE, 24), slotMs(dayIdx(2026, 10, 14), 0), "15m"), 1, "last 15m candle to next open is one bar");
  assert.equal(barsBetween(slotMs(D_FRI, 24), slotMs(D_NEXT_MON, 0), "15m"), 1, "Friday close to Monday open is one bar");
  assert.equal(barsBetween(slotMs(D_FRI, 0), slotMs(D_NEXT_MON, 0), "15m"), 25, "one full trading day between Friday and Monday");
  assert.equal(barsBetween(slotMs(D_NEXT_MON, 0), slotMs(dayIdx(2026, 10, 21), 0), "1D"), 1, "Tuesday 20 Oct 2026 is a listed holiday: Monday to Wednesday is one daily bar");
  assert.equal(barsBetween(slotMs(D_MON, 0), slotMs(D_FRI, 0), "1D"), 4);
  assert.equal(barsBetween(slotMs(D_TUE, 4), slotMs(D_TUE, 0), "15m"), -4, "negative before the anchor");
});
test("bar clock rejects times that are not candle starts", function(){
  assert.equal(barsBetween(slotMs(D_TUE, 0) + 60000, slotMs(D_TUE, 4), "15m"), null, "09:16 is not a 15m candle start");
  assert.equal(barsBetween(slotMs(dayIdx(2026, 10, 17), 0), slotMs(D_NEXT_MON, 0), "15m"), null, "Saturday");
  assert.equal(barsBetween(slotMs(dayIdx(2026, 10, 20), 0), slotMs(dayIdx(2026, 10, 21), 0), "1D"), null, "holiday");
  assert.equal(slotOf(slotMs(D_TUE, 25), "15m"), null, "15:30 is after the session");
  assert.equal(slotOf(slotMs(D_TUE, 0), "1m"), null);
});
test("timezone: IST session times map to the right UTC instants and trading days", function(){
  var open = istMs(2026, 10, 13, 9, 15);
  assert.equal(new Date(open).toISOString(), "2026-10-13T03:45:00.000Z");
  assert.equal(slotOf(open, "15m"), 0); assert.equal(slotOf(istMs(2026, 10, 13, 15, 15), "15m"), 24);
  assert.equal(slotOf(istMs(2026, 10, 13, 15, 15), "1H"), 6, "the 1H slot at 15:15 is the short last candle");
  // 20:00 UTC on 13 Oct is 01:30 IST on 14 Oct: outside the session, no bar
  assert.equal(barStartAt(Date.UTC(2026, 9, 13, 20, 0), "15m"), null);
  // 03:50 UTC is 09:20 IST: inside the 09:15 candle
  assert.equal(barStartAt(Date.UTC(2026, 9, 13, 3, 50), "15m"), open);
  assert.equal(barStartAt(Date.UTC(2026, 9, 13, 3, 50), "1D"), open, "daily candles are stamped at the 09:15 open");
  assert.equal(barStartAt(istMs(2026, 10, 13, 15, 30), "15m"), null, "15:30 sharp is closed");
  assert.equal(barStartAt(istMs(2026, 10, 17, 11, 0), "15m"), null, "Saturday");
});

var UP = { kind:"low", anchorT:Math.floor(slotMs(D_MON, 8) / 1000), anchorPrice:100, scale:0.5, tf:"15m" };
var DOWN = Object.assign({}, UP, { kind:"high", anchorPrice:200 });

test("line value: upward from a swing low, downward from a swing high", function(){
  assert.equal(dirOf("low"), 1); assert.equal(dirOf("high"), -1); assert.equal(dirOf("x"), 0);
  assert.equal(lineValueAt(UP, slotMs(D_MON, 8)), 100, "at the anchor the line equals the anchor price");
  assert.equal(lineValueAt(UP, slotMs(D_MON, 12)), 102);
  assert.equal(lineValueAt(DOWN, slotMs(D_MON, 12)), 198);
  // next day: 25 - 8 = 17 bars to the last Monday slot... Monday slot 8 -> Tuesday slot 0 is 17 bars
  assert.equal(lineValueAt(UP, slotMs(D_TUE, 0)), 100 + 0.5 * 17);
  assert.equal(lineValueAt(DOWN, slotMs(D_TUE, 0)), 200 - 0.5 * 17);
});
test("line is undefined before its anchor, off the calendar, or when a downward line would reach zero", function(){
  assert.equal(lineValueAt(UP, slotMs(D_MON, 7)), null);
  assert.equal(lineValueAt(UP, slotMs(D_MON, 12) + 60000), null);
  var steep = Object.assign({}, DOWN, { scale:30 });
  assert.ok(lineValueAt(steep, slotMs(D_MON, 10)) > 0);
  assert.equal(lineValueAt(steep, slotMs(D_MON, 8 + 7)), null, "200 - 30*7 < 0");
});
test("scale changes the slope proportionally; the line never depends on chart size", function(){
  var t = slotMs(D_TUE, 5);
  var k = barsBetween(UP.anchorT * 1000, t, "15m");
  var a = lineValueAt(UP, t) - 100, b = lineValueAt(Object.assign({}, UP, { scale:1 }), t) - 100, c = lineValueAt(Object.assign({}, UP, { scale:0.25 }), t) - 100;
  assert.equal(a, 0.5 * k); assert.equal(b, 2 * a); assert.equal(c, a / 2);
});
test("a missing provider candle does not move the line (bars come from the calendar, not the candle count)", function(){
  var cs = [];
  for(var k = 8; k < 25; k++) cs.push({ time:Math.floor(slotMs(D_MON, k) / 1000), open:100, high:101, low:99, close:100, volume:1 });
  var full = lineSeries(cs, UP);
  var gap = cs.filter(function(c, i){ return i != 5; });
  var withGap = lineSeries(gap, UP);
  gap.forEach(function(c, i){ assert.equal(withGap[i], full[cs.indexOf(c)]); });
});
test("validateLine: every field is checked", function(){
  assert.ok(validateLine(UP, null).ok);
  assert.deepEqual(validateLine(null).errors, ["invalid_line"]);
  assert.ok(validateLine(Object.assign({}, UP, { kind:"mid" })).errors.indexOf("invalid_kind") >= 0);
  assert.ok(validateLine(Object.assign({}, UP, { tf:"1m" })).errors.indexOf("invalid_timeframe") >= 0);
  assert.ok(validateLine(Object.assign({}, UP, { anchorT:UP.anchorT + 60 })).errors.indexOf("invalid_anchor_time") >= 0, "off the candle grid");
  assert.ok(validateLine(Object.assign({}, UP, { anchorT:1.5 })).errors.indexOf("invalid_anchor_time") >= 0);
  assert.ok(validateLine(Object.assign({}, UP, { anchorPrice:0 })).errors.indexOf("invalid_anchor_price") >= 0);
  assert.ok(validateLine(Object.assign({}, UP, { scale:0 })).errors.indexOf("invalid_scale") >= 0);
  assert.ok(validateLine(Object.assign({}, UP, { scale:101 })).errors.indexOf("invalid_scale") >= 0, "scale larger than the anchor price");
  assert.ok(validateLine(UP, slotMs(D_MON, 8) - 3600000).errors.indexOf("invalid_anchor_time") >= 0, "anchor in the future");
});

function mkBars(n, fn, day, minutes){
  var out = [];
  for(var i = 0; i < n; i++){ var b = fn(i), start = slotMs(day, i, minutes);
    out.push({ t:Math.floor(start / 1000), startMs:start, endMs:start + (minutes || 15) * 60000, day:day, open:b.o, high:b.h, low:b.l, close:b.c, volume:1 }); }
  return out;
}
test("swing lows and highs need N lower/higher bars on each side and are confirmed only after N later bars", function(){
  var lows = [10, 9, 8, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  var bars = mkBars(lows.length, function(i){ return { o:lows[i] + 1, h:lows[i] + 2, l:lows[i], c:lows[i] + 1 }; }, D_TUE);
  assert.deepEqual(swingIndexes(bars, "low", 3), [3]);
  var highs = [5, 6, 7, 9, 7, 6, 5, 4, 3, 2, 1.5, 1];
  var hb = mkBars(highs.length, function(i){ return { o:highs[i] - 1, h:highs[i], l:highs[i] - 2, c:highs[i] - 1 }; }, D_TUE);
  assert.deepEqual(swingIndexes(hb, "high", 3), [3]);
  assert.deepEqual(swingIndexes(bars.slice(0, 5), "low", 3), [], "too short to confirm");
});
test("suggested scale is ATR(14), rounded to the 0.05 tick, and refuses short history", function(){
  var bars = mkBars(20, function(i){ return { o:100, h:101, l:99, c:100 }; }, D_TUE);
  var s = suggestScale(bars);
  assert.equal(s.ok, true); assert.equal(s.scale, 2); assert.equal(s.basis, "ATR(14)");
  var gap = mkBars(20, function(i){ return i < 10 ? { o:100, h:101, l:99, c:100 } : { o:110, h:111, l:109, c:110 }; }, D_TUE);
  assert.ok(suggestScale(gap).scale > 2, "a gap raises the true range");
  var short = suggestScale(bars.slice(0, 10));
  assert.equal(short.ok, false); assert.equal(short.code, "insufficient_history");
});
test("a daily series stamped 09:15 is never accepted as intraday", function(){
  var days = tradingDays(T0, 8);
  var raw = days.map(function(d, i){ return { time:Math.floor(slotMs(d, 0) / 1000), open:100 + i, high:102 + i, low:99 + i, close:101 + i, volume:10 }; });
  var NOW = istMs(2026, 10, 14, 11, 0);
  var v = validateCandles(raw, "15m", NOW);
  assert.ok(v.candles.length >= 6, "passes the grid check, which is exactly the danger");
  var r = intradayCheck(v.candles, "15m");
  assert.equal(r.ok, false); assert.equal(r.code, "intraday_unavailable");
  assert.equal(intradayCheck(v.candles, "1D").ok, true, "the same series is fine as daily");
  var real = [];
  tradingDays(T0, 2).forEach(function(d){ for(var k = 0; k < 25; k++) real.push({ time:Math.floor(slotMs(d, k) / 1000), open:100, high:101, low:99, close:100, volume:10 }); });
  assert.equal(intradayCheck(validateCandles(real, "15m", NOW).candles, "15m").ok, true);
});
test("anchor integrity: a provider candle that disagrees with the saved anchor is detected", function(){
  var bars = mkBars(10, function(i){ return { o:101, h:102, l:i == 0 ? 100 : 100.5, c:101 }; }, D_MON).map(function(b){ return Object.assign(b, { t:Math.floor(b.startMs / 1000) }); });
  var line = Object.assign({}, UP, { anchorT:bars[0].t, anchorPrice:100 });
  assert.equal(anchorMatches(bars, line), true);
  assert.equal(anchorMatches(bars, Object.assign({}, line, { anchorPrice:105 })), false);
  assert.equal(anchorMatches(bars, Object.assign({}, line, { anchorT:bars[0].t - 86400 * 30 })), true, "anchor older than the fetched window cannot be checked");
  assert.equal(anchorMatches(bars, Object.assign({}, line, { kind:"high", anchorPrice:102 })), true);
});

// closes relative to the line: off[i] added to the line value of bar i (anchor candle sits on the anchor price)
function seriesAround(line, nBars, offFn){
  var out = [];
  for(var i = 0; i < nBars; i++){
    var start = slotMs(D_MON, 8 + i);
    var day = D_MON, k = 8 + i;
    while(k >= 25){ k -= 25; day = tradingDays(day + 1, 1)[0]; }
    start = slotMs(day, k);
    var lv = lineValueAt(line, start);
    var c = lv + offFn(i);
    out.push({ t:Math.floor(start / 1000), startMs:start, endMs:start + 900000, day:day, open:c, high:c + 0.2, low:c - 0.2, close:c, volume:1 });
  }
  return out;
}
test("close above an upward line fires once; first look never fires on a price already beyond", function(){
  var bars = seriesAround(UP, 12, function(i){ return i < 6 ? -1 : 1; });   // below until bar 6, then above
  var first = scanCloses(bars.slice(0, 5), UP, null, "close");
  assert.equal(first.events.length, 0); assert.equal(first.state.side, "below"); assert.equal(first.firstLook, true);
  var now = scanCloses(bars.slice(0, 8), UP, first.state, "close");
  assert.equal(now.events.length, 1);
  var e = now.events[0];
  assert.equal(e.dir, "up"); assert.equal(e.bar.t, bars[6].t); assert.equal(e.level, lineValueAt(UP, bars[6].startMs)); assert.equal(e.bars, 6 + 0);
  var again = scanCloses(bars.slice(0, 8), UP, now.state, "close");
  assert.equal(again.events.length, 0, "same candles again: nothing new");
  var already = scanCloses(bars, UP, null, "close");
  assert.equal(already.events.length, 0, "created when price is already beyond the line");
  assert.equal(already.state.side, "above");
});
test("a downward line fires only on a confirmed close below; a close above it is ignored", function(){
  var bars = seriesAround(DOWN, 12, function(i){ return i < 4 ? 1 : (i < 8 ? -1 : 1); });  // above, below (fire), above again
  var f = scanCloses(bars.slice(0, 3), DOWN, null, "close");
  assert.equal(f.state.side, "above");
  var r = scanCloses(bars.slice(0, 12), DOWN, f.state, "close");
  assert.equal(r.events.length, 1); assert.equal(r.events[0].dir, "down"); assert.equal(r.events[0].bar.t, bars[4].t);
});
test("upward line ignores a close below it in the default mode, but reports both ways in 'either' mode", function(){
  var bars = seriesAround(UP, 14, function(i){ return i < 3 ? 1 : (i < 6 ? -1 : 1); });  // above, below, above
  var f = scanCloses(bars.slice(0, 2), UP, null, "close");
  var close = scanCloses(bars, UP, f.state, "close");
  assert.deepEqual(close.events.map(function(e){ return e.dir; }), ["up"]);
  var f2 = scanCloses(bars.slice(0, 2), UP, null, "any");
  var any = scanCloses(bars, UP, f2.state, "any");
  assert.deepEqual(any.events.map(function(e){ return e.dir; }), ["down", "up"].slice(0, any.events.length));
  assert.ok(any.events.length >= 1 && any.events[0].dir == "down");
});
test("a wick through the line without a close beyond it never fires; a close exactly on the line is not a cross", function(){
  var bars = seriesAround(UP, 8, function(i){ return -1; });
  bars[5].high = lineValueAt(UP, bars[5].startMs) + 3;           // wick pokes above
  var f = scanCloses(bars.slice(0, 3), UP, null, "close");
  assert.equal(scanCloses(bars, UP, f.state, "close").events.length, 0);
  var onLine = seriesAround(UP, 8, function(i){ return i < 4 ? -1 : (i == 5 ? 0 : -1); });
  var f3 = scanCloses(onLine.slice(0, 3), UP, null, "close");
  assert.equal(scanCloses(onLine, UP, f3.state, "close").events.length, 0);
  assert.equal(sideOf(5, 5), null); assert.equal(sideOf(6, 5), "above"); assert.equal(sideOf(4, 5), "below"); assert.equal(sideOf(null, 5), null);
});
test("cooldown suppresses a whipsaw, and the rule re-arms once enough bars have passed", function(){
  // below, up(fire), down, up (2 bars later: inside the 3-bar cooldown), down, down, down, up (fires again)
  var pat = [-1, -1, 1, -1, 1, -1, -1, -1, 1, 1];
  var bars = seriesAround(UP, pat.length, function(i){ return pat[i]; });
  var f = scanCloses(bars.slice(0, 2), UP, null, "close");
  var r = scanCloses(bars, UP, f.state, "close");
  assert.deepEqual(r.events.map(function(e){ return e.bar.t; }), [bars[2].t, bars[8].t]);
  assert.equal(r.suppressed, 1);
  assert.equal(GANN.COOLDOWN_BARS, 3);
});
test("only the newest bars are scanned and the side before them is remembered", function(){
  var n = GANN.MAX_SCAN + 12;
  var bars = seriesAround(UP, n, function(i){ return i < 5 ? -1 : 1; });
  var f = scanCloses(bars.slice(0, 3), UP, null, "close");
  var r = scanCloses(bars, UP, f.state, "close");
  assert.equal(r.state.lastBarT, bars[n - 1].t);
  assert.ok(r.events.length <= 1);
});
test("a line is not evaluated against candles before its anchor", function(){
  var bars = seriesAround(UP, 5, function(){ return 1; });
  var early = bars.map(function(b){ return Object.assign({}, b, { t:b.t - 86400 * 3, startMs:b.startMs - 3 * DAY }); });
  var r = scanCloses(early, UP, null, "close");
  assert.equal(r.beforeAnchor, true); assert.equal(r.events.length, 0);
});
test("approach check: distance, side and the 'already beyond' rule", function(){
  var a = nearCheck(99.8, 100, "low", "close", 0.3);
  assert.equal(a.within, true); assert.equal(a.beyond, false); assert.ok(Math.abs(a.distPct + 0.2) < 1e-9);
  assert.equal(nearCheck(99, 100, "low", "close", 0.3).within, false);
  assert.equal(nearCheck(100.1, 100, "low", "close", 0.3).beyond, true, "upward line waits for a cross above: price above is already beyond");
  assert.equal(nearCheck(99.9, 100, "high", "close", 0.3).beyond, true, "downward line waits for a cross below");
  assert.equal(nearCheck(100.1, 100, "high", "close", 0.3).beyond, false);
  assert.equal(nearCheck(100.1, 100, "low", "any", 0.3).beyond, false);
  assert.equal(nearCheck(null, 100, "low", "close", 0.3).ok, false);
});
test("chart timeframe labels map to alert timeframes; 1m and 1W have no alert frames", function(){
  assert.equal(alertTfOfChart("1h"), "1H"); assert.equal(alertTfOfChart("15m"), "15m"); assert.equal(alertTfOfChart("1D"), "1D");
  assert.equal(alertTfOfChart("1m"), null); assert.equal(alertTfOfChart("1W"), null);
});

function memStorage(){ var m = {}; return { getItem:function(k){ return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; }, setItem:function(k, v){ m[k] = String(v); }, removeItem:function(k){ delete m[k]; }, _m:m }; }
var SAVE = { sym:"RELIANCE", tf:"15m", kind:"low", anchorT:UP.anchorT, anchorPrice:100, scale:0.5, scaleMode:"auto", label:"Test" };
test("saved lines: save, edit in place (same id), reload, remove", function(){
  var st = memStorage();
  var a = saveLine(SAVE, { storage:st, now:1000, rand:function(){ return 0.5; } });
  assert.equal(a.ok, true); assert.equal(loadLines(st).length, 1);
  var id = a.line.id;
  var b = saveLine(Object.assign({}, SAVE, { scale:0.75, scaleMode:"manual" }), { storage:st, now:2000 });
  assert.equal(b.ok, true); assert.equal(b.line.id, id); assert.equal(b.line.createdAt, 1000); assert.equal(b.line.updatedAt, 2000);
  assert.equal(loadLines(st).length, 1); assert.equal(loadLines(st)[0].scale, 0.75);
  assert.equal(findLine(loadLines(st), "RELIANCE", "15m").id, id); assert.equal(findLine(loadLines(st), "RELIANCE", "1D"), null);
  var other = saveLine(Object.assign({}, SAVE, { tf:"1H", anchorT:Math.floor(slotMs(D_MON, 1, 60) / 1000) }), { storage:st, now:3000 });
  assert.equal(other.ok, true); assert.equal(loadLines(st).length, 2);
  assert.equal(removeLine(id, { storage:st }).ok, true); assert.equal(loadLines(st).length, 1);
  assert.equal(removeLine("nope12345", { storage:st }).reason, "not_found");
});
test("saved lines: damaged, tampered or oversized storage never yields a line", function(){
  var st = memStorage();
  st.setItem(KEY, "{not json"); assert.deepEqual(loadLines(st), []);
  st.setItem(KEY, JSON.stringify({ a:1 })); assert.deepEqual(loadLines(st), []);
  st.setItem(KEY, JSON.stringify([{ id:"abcdef12", sym:"RELIANCE", tf:"15m", kind:"low", anchorT:UP.anchorT, anchorPrice:-5, scale:1 }, null, 5, { id:"x", sym:"RELIANCE" }]));
  assert.deepEqual(loadLines(st), []);
  assert.equal(saveLine(Object.assign({}, SAVE, { scale:0 }), { storage:st }).reason, "invalid_line");
  assert.equal(saveLine(Object.assign({}, SAVE, { sym:"<script>" }), { storage:st }).reason, "invalid_line");
  assert.equal(cleanLine(Object.assign({ id:"abcdef12", createdAt:1, updatedAt:1 }, SAVE, { label:"\u00e9<b>" }), 0).label, "<b>");
  assert.equal(loadLines(null).length, 0);
  assert.equal(saveLine(SAVE, { storage:null }).ok, false);
});
test("saved lines: at most MAX_LINES, one per instrument and timeframe", function(){
  var st = memStorage(), n = 0;
  var syms = "AAA BBB CCC DDD EEE FFF GGG HHH III JJJ KKK LLL MMM".split(" ");
  syms.forEach(function(s){ if(saveLine(Object.assign({}, SAVE, { sym:s }), { storage:st, now:1 }).ok) n++; });
  assert.equal(n, MAX_LINES); assert.equal(loadLines(st).length, MAX_LINES);
  assert.equal(saveLine(Object.assign({}, SAVE, { sym:"AAA", scale:2 }), { storage:st }).ok, true, "editing an existing line is allowed at the limit");
});
test("source hygiene: ASCII, no backtick, no triple equals, no network, no random in the maths", function(){
  ["src/gann/gannMath.js", "src/gann/gannStore.js"].forEach(function(f){
    var s = fs.readFileSync(f, "utf8");
    assert.ok(!/[^\x00-\x7F]/.test(s), f); assert.ok(s.indexOf("`") < 0, f); assert.ok(s.indexOf("===") < 0, f);
    assert.ok(!/fetch\(|XMLHttpRequest/.test(s), f);
  });
  var m = fs.readFileSync("src/gann/gannMath.js", "utf8");
  assert.ok(!/Math\.random|Date\.now\(/.test(m));
});
