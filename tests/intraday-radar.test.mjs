import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { groupSessions, volumeShock, crossings, sessionVwap, vwapSide, cprLevels, analyzeSymbol, newEvents, freshness, istHHMM } from "../src/market/intradayRadar.js";

// Live Intraday Scalping Radar: calculation tests. ALL data here is synthetic (mocked); no real provider is called.
var D = { mon:"2026-10-26", tue:"2026-10-27", wed:"2026-10-28", thu:"2026-10-29" };
function t0(day){ return Date.parse(day + "T09:15:00+05:30") / 1000; }
// 75 bars 09:15..15:25. spec(i) returns {o,h,l,c,v}; default flat 100 with volume 1000.
function session(day, spec, nbars){
  var out = [], n = nbars == null ? 75 : nbars;
  for(var i = 0; i < n; i++){
    var sp = spec ? spec(i) : {};
    var s = Object.assign({ o:100, h:101, l:99, c:100, v:1000 }, sp);
    if(sp.o == null && sp.c != null) s.o = sp.c;
    out.push({ time:t0(day) + i * 300, open:s.o, high:s.h, low:s.l, close:s.c, volume:s.v, complete:true });
  }
  return out;
}
function nowAt(day, hhmm){ return Date.parse(day + "T" + hhmm + ":00+05:30"); }

test("groupSessions: IST date grouping, session hours only, malformed bars dropped", function(){
  var good = session(D.mon, null, 3);
  var pre = { time:t0(D.mon) - 600, open:1, high:2, low:1, close:1, volume:5, complete:true };       // 09:05 pre-open
  var post = { time:t0(D.mon) + 75 * 300, open:1, high:2, low:1, close:1, volume:5, complete:true }; // 15:30
  var bad1 = { time:t0(D.mon) + 3 * 300, open:5, high:4, low:6, close:5, volume:1 };                  // high < low
  var bad2 = { time:"x", open:1, high:1, low:1, close:1 };
  var g = groupSessions(good.concat([pre, post, bad1, bad2, null, undefined]));
  assert.equal(g.length, 1); assert.equal(g[0].bars.length, 3); assert.equal(g[0].date, 20261026);
  assert.equal(groupSessions(null).length, 0);
  var two = groupSessions(session(D.tue, null, 2).concat(session(D.mon, null, 2)));
  assert.deepEqual(two.map(function(s){ return s.date; }), [20261026, 20261027]);
});

test("volumeShock: same time-of-day baseline, 3 earlier sessions required, ignores in-progress bar", function(){
  var vols = { mon:800, tue:1000, wed:1200 };
  var all = [];
  ["mon", "tue", "wed"].forEach(function(k){ all = all.concat(session(D[k], function(){ return { v:vols[k] }; })); });
  var cur = session(D.thu, function(i){ return { v:i == 9 ? 4200 : 1000 }; }, 11); // 10 completed bars + 1 in progress
  cur[10].complete = false; cur[10].volume = 99999;
  var g = groupSessions(all.concat(cur));
  var r = volumeShock(g, g[g.length - 1]);
  assert.equal(r.state, "ok"); assert.equal(r.samples, 3); assert.equal(r.avg, 1000); assert.equal(r.mult, 4.2); assert.equal(r.volume, 4200);
  assert.equal(istHHMM(r.barTime), "10:00");
  // only 2 earlier sessions -> unavailable, never a guess
  var g2 = groupSessions(session(D.tue, null).concat(session(D.wed, null)).concat(cur));
  assert.equal(volumeShock(g2, g2[g2.length - 1]).state, "unavailable");
  // zero volume on the latest bar -> unavailable
  var z = groupSessions(all.concat(session(D.thu, function(i){ return { v:i == 9 ? 0 : 1000 }; }, 10)));
  assert.equal(volumeShock(z, z[z.length - 1]).reason, "no_volume");
  // a different time of day uses its own baseline: bar 20 has baseline 1000 too
  assert.equal(volumeShock(groupSessions(all.concat(session(D.thu, function(i){ return { v:i == 20 ? 2500 : 1000 }; }, 21))), null === 1 ? null : groupSessions(all.concat(session(D.thu, null, 1)))[3]).state, "ok");
});

test("crossings: fresh Day High / Day Low cross vs trading near the level", function(){
  var spec = function(i){
    if(i < 6) return { h:101, l:99 };
    if(i == 6) return { h:103, l:99.5, c:102.5 };   // Day High Cross (prior high 101)
    if(i == 7) return { h:102, l:100.5, c:101 };
    return { h:101.5, l:100.5, c:101 };
  };
  var g = groupSessions(session(D.thu, spec, 9));
  var r = crossings(g[0]);
  assert.equal(r.state, "ok"); assert.equal(r.dayHigh, 103); assert.equal(r.dayLow, 99);
  assert.equal(r.latest.type, "high"); assert.equal(istHHMM(r.latest.time), "09:15".replace("09:15", "09:45")); assert.equal(r.latest.level, 101);
  assert.equal(r.latest.fresh, false); // bar 6 ended 2 bars before the last completed bar (index 8)
  var g2 = groupSessions(session(D.thu, spec, 8));
  assert.equal(crossings(g2[0]).latest.fresh, true);
  // first three bars never count as crossings (opening range)
  var early = groupSessions(session(D.thu, function(i){ return { h:100 + i * 2, l:99 }; }, 3));
  assert.equal(crossings(early[0]).latest, null);
  // a Day Low Cross
  var low = groupSessions(session(D.thu, function(i){ return i == 5 ? { h:100.5, l:97, c:97.5 } : {}; }, 6));
  var lr = crossings(low[0]); assert.equal(lr.latest.type, "low"); assert.equal(lr.latest.price, 97);
  // near but not crossed
  var near = groupSessions(session(D.thu, function(i){ return i < 2 ? {} : (i == 2 ? { h:105, l:99, c:104 } : { h:104.95, l:104.5, c:104.9 }); }, 8));
  var nr = crossings(near[0]); assert.equal(nr.latest, null); assert.equal(nr.near, "high");
  // crossing older than 6 bars is not listed
  var old = groupSessions(session(D.thu, function(i){ return i == 4 ? { h:110, c:109 } : {}; }, 20));
  assert.equal(crossings(old[0]).latest, null);
});

test("sessionVwap: typical price x volume, session boundary, stale and EOD states", function(){
  var bars = [{ h:102, l:98, c:100, v:100 }, { h:104, l:100, c:102, v:300 }, { h:106, l:102, c:104, v:100 }];
  var g = groupSessions(session(D.thu, function(i){ return { o:bars[i].c, h:bars[i].h, l:bars[i].l, c:bars[i].c, v:bars[i].v }; }, 3));
  // typical 100, 102, 104 -> (100*100 + 102*300 + 104*100) / 500 = 102
  var open = sessionVwap(g[0], { open:true, now:nowAt(D.thu, "09:32") });
  assert.equal(open.state, "ok"); assert.equal(open.value, 102); assert.equal(open.bars, 3);
  assert.equal(sessionVwap(g[0], { open:true, now:nowAt(D.thu, "10:30") }).state, "stale");
  assert.equal(sessionVwap(g[0], { open:false, now:nowAt(D.thu, "16:30") }).state, "eod");
  assert.equal(sessionVwap(groupSessions(session(D.thu, null, 2))[0], { open:true, now:nowAt(D.thu, "09:26") }).state, "unavailable");
  // previous sessions never leak into today's VWAP
  var two = groupSessions(session(D.wed, function(){ return { o:500, h:501, l:499, c:500, v:99999 }; }, 5).concat(session(D.thu, function(i){ return { o:bars[i].c, h:bars[i].h, l:bars[i].l, c:bars[i].c, v:bars[i].v }; }, 3)));
  assert.equal(sessionVwap(two[1], { open:true, now:nowAt(D.thu, "09:32") }).value, 102);
  assert.equal(vwapSide(0.15, 0.2), "near"); assert.equal(vwapSide(-0.2, 0.2), "near"); assert.equal(vwapSide(0.21, 0.2), "above"); assert.equal(vwapSide(-0.5, 0.2), "below"); assert.equal(vwapSide(null, 0.2), "unavailable");
  assert.equal(vwapSide(0.3, 0.5), "near");
});

test("cprLevels: pivot formulas, width classification, incomplete sessions rejected", function(){
  function full(H, L, C){ return groupSessions(session(D.wed, function(i){ return i == 10 ? { h:H, l:L, o:(H + L) / 2, c:(H + L) / 2 } : (i == 74 ? { o:C, h:C, l:C, c:C } : { h:Math.min(H, 100.4), l:Math.max(L, 99.6) }); }))[0]; }
  var a = cprLevels(full(110, 90, 100));
  assert.equal(a.high, 110); assert.equal(a.low, 90); assert.equal(a.close, 100);
  assert.equal(a.pivot, 100); assert.equal(a.bc, 100); assert.equal(a.tc, 100); assert.equal(a.r1, 110); assert.equal(a.s1, 90);
  assert.equal(a.widthPct, 0); assert.equal(a.kind, "narrow");
  var b = cprLevels(full(120, 100, 104));
  assert.equal(b.pivot, 108); assert.equal(b.bc, 110); assert.equal(b.tc, 106); assert.equal(b.top, 110); assert.equal(b.bottom, 106);
  assert.equal(b.r1, 116); assert.equal(b.s1, 96); assert.equal(b.kind, "wide"); assert.ok(Math.abs(b.widthPct - 3.704) < 0.001);
  var half = groupSessions(session(D.wed, null, 40))[0];
  assert.equal(cprLevels(half), null);
  assert.equal(cprLevels(null), null);
});

test("analyzeSymbol: open vs closed session, previous-session CPR, index without volume, malformed input", function(){
  var hist = session(D.mon, null).concat(session(D.tue, null)).concat(session(D.wed, null));
  var today = session(D.thu, function(i){ return { v:i == 5 ? 5000 : 1000, c:100 + i * 0.01 }; }, 7);
  today[6].complete = false;
  var resp = { candles:hist.concat(today), volumeAvailable:true, status:"DELAYED", quote:{ price:100.2, prevClose:100, changePct:0.2, asOf:nowAt(D.thu, "09:50") } };
  var a = analyzeSymbol("TEST", resp, { now:nowAt(D.thu, "09:50"), session:"OPEN" });
  assert.equal(a.state, "ok"); assert.equal(a.open, true); assert.equal(a.vol.state, "ok"); assert.equal(a.vol.mult, 5); assert.equal(a.cpr.sessionDate, 20261028); assert.equal(a.cpr.forNext, false);
  assert.equal(a.price, 100.2); assert.equal(a.chgPct, 0.2);
  assert.equal(a.vwap.state, "ok"); assert.ok(typeof a.vwap.distPct == "number");
  // after the close the same data is "last session": EOD VWAP and CPR flagged for next session
  var fullToday = session(D.thu, null);
  var closed = analyzeSymbol("TEST", { candles:hist.concat(fullToday), volumeAvailable:true, status:"DELAYED", quote:null }, { now:nowAt(D.thu, "17:00"), session:"CLOSED" });
  assert.equal(closed.open, false); assert.equal(closed.vwap.state, "eod"); assert.equal(closed.cpr.sessionDate, 20261029); assert.equal(closed.cpr.forNext, true);
  // weekend: latest session is Thursday, not today
  var wk = analyzeSymbol("TEST", { candles:hist.concat(fullToday), volumeAvailable:true, status:"DELAYED", quote:null }, { now:nowAt("2026-11-01", "12:00"), session:"WEEKEND" });
  assert.equal(wk.open, false);
  // index: no volume -> volume and VWAP unavailable, CPR still calculated
  var idx = analyzeSymbol("NIFTY", { candles:hist.concat(fullToday).map(function(b){ return Object.assign({}, b, { volume:0 }); }), volumeAvailable:false, status:"DELAYED", quote:null }, { now:nowAt(D.thu, "17:00"), session:"CLOSED" });
  assert.equal(idx.vol.state, "unavailable"); assert.equal(idx.vwap.state, "unavailable"); assert.ok(idx.cpr);
  // malformed / empty
  assert.equal(analyzeSymbol("X", null, {}).state, "unavailable");
  assert.equal(analyzeSymbol("X", { candles:[{ time:1 }, null, "x"] }, {}).state, "unavailable");
  assert.equal(analyzeSymbol("X", { candles:[] }, {}).reason, "no_intraday_bars");
});

test("duplicate alert suppression and freshness wording", function(){
  var e1 = { type:"vol", sym:"A", time:1000 }, e2 = { type:"high", sym:"A", time:1000 }, e3 = { type:"vol", sym:"A", time:2000 };
  var first = newEvents(null, [e1, e2]);
  assert.equal(first.fresh.length, 0, "first load only seeds, never alerts");
  var second = newEvents(first.seen, [e1, e2, e3]);
  assert.deepEqual(second.fresh, [e3]);
  var third = newEvents(second.seen, [e1, e2, e3, e3]);
  assert.equal(third.fresh.length, 0);
  assert.equal(freshness("LIVE", true, 1700000000000).label, "Live");
  assert.equal(freshness("DELAYED", true, 1700000000000).label, "Delayed");
  assert.equal(freshness("LIVE", false, 1700000000000).label, "EOD");
  assert.equal(freshness("LIVE", true, null).label, "Unavailable");
  assert.ok(/^Last Updated \d\d:\d\d IST$/.test(freshness("DELAYED", true, nowAt(D.thu, "10:00")).stamp));
});

test("radar wiring: server action, hook, sound opt-in, no advisory wording, official disclaimer", function(){
  var api = fs.readFileSync("api/market.js", "utf8");
  assert.ok(api.indexOf('action == "radar"') >= 0 && api.indexOf("analyzeSymbol") >= 0 && api.indexOf('feed.getCandles(sy, "5m"') >= 0 && api.indexOf(".slice(0, 60)") >= 0);
  var hook = fs.readFileSync("src/hooks/useIntradayRadar.js", "utf8");
  assert.ok(hook.indexOf("sound:false") >= 0 && hook.indexOf("enableSound") >= 0 && hook.indexOf("document.hidden") >= 0);
  var ui = fs.readFileSync("src/screens/home/HomeRadar.jsx", "utf8");
  ["INTRADAY VOLUME SHOCKERS", "DAY HIGH & DAY LOW CROSSERS", "VWAP PROXIMITY RADAR", "DAILY CPR & PIVOT LEVELS", "Volume Surge", "Day High Cross", "Day Low Cross", "Above VWAP", "Below VWAP", "Near VWAP", "Narrow", "Wide", "\"CPR \" + "].forEach(function(k){ assert.ok(ui.indexOf(k) >= 0, k); });
  assert.ok(!/\b(Strong Buy|Strong Sell|Guaranteed)\b|\bBuy\b|\bSell\b/.test(ui + fs.readFileSync("src/market/intradayRadar.js", "utf8").replace(/not investment advice or recommendations to buy or sell/g, "")));
  var hub = fs.readFileSync("src/screens/home/HomeHub.jsx", "utf8");
  assert.ok(hub.indexOf("mathematical market activity indicators and market data for informational and educational purposes only. These indicators are not investment advice or recommendations to buy or sell securities.") >= 0);
  assert.ok(hub.indexOf("<HomeRadar") > hub.indexOf("<HomeSetups") && hub.indexOf("<HomeRadar") < hub.indexOf("<HomeAudioBrief") && hub.indexOf("<HomeAudioBrief") < hub.indexOf("home-quick-grid"));
  ["api/market.js", "src/market/intradayRadar.js", "src/hooks/useIntradayRadar.js", "src/screens/home/HomeRadar.jsx"].forEach(function(f){
    var s = fs.readFileSync(f, "utf8");
    assert.ok(!/[^\x00-\x7F]/.test(s), f + " non-ascii"); assert.ok(s.indexOf("`") < 0, f + " backtick");
  });
});

import { pcrFreshness } from "../src/state/pcrModel.js";
test("OI PCR freshness: Live / Delayed / Last EOD, never invented", function(){
  var now = Date.parse("2026-10-29T17:00:00+05:30");
  var live = { pcr:0.95, stale:false, updated:Date.parse("2026-10-29T10:59:00+05:30"), fromStore:false };
  assert.deepEqual(pcrFreshness(live, true, Date.parse("2026-10-29T11:00:00+05:30")), { label:"Live", stamp:"as of 10:59 IST" });
  assert.equal(pcrFreshness({ pcr:0.9, stale:true, updated:live.updated }, true, now).label, "Delayed");
  assert.equal(pcrFreshness({ pcr:0.9, stale:true, updated:live.updated, fromStore:true }, true, now).label, "Delayed");
  var eod = pcrFreshness(live, false, now);
  assert.equal(eod.label, "Last EOD"); assert.equal(eod.stamp, "as of 10:59 IST");
  var old = pcrFreshness({ pcr:1.1, stale:true, updated:Date.parse("2026-10-28T15:29:00+05:30"), fromStore:true }, false, now);
  assert.equal(old.label, "Last EOD"); assert.equal(old.stamp, "as of 15:29 IST, 28 Oct");
  assert.equal(pcrFreshness(null, false, now), null);
  assert.equal(pcrFreshness({ pcr:NaN }, false, now), null);
  assert.equal(pcrFreshness({ pcr:0.9, stale:false, updated:null }, false, now).stamp, "");
  var src = fs.readFileSync("src/hooks/useHomePcr.js", "utf8");
  assert.ok(src.indexOf("bp_pcr_last") >= 0 && src.indexOf("fromStore:true") >= 0 && !/Math\.random/.test(src));
});
