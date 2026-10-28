// Gann 1x1 alerts through the real Smart Alerts engine, rule validation, message builder and the
// server cron runner. Candles, quotes, push service and store are MOCKS (fixtures made by
// formula). These tests prove the logic. They do NOT prove a real provider, a real scheduler run
// or a real device push.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "crypto";
import { evaluateRule } from "../src/alerts/alertEngine.js";
import { validateRuleInput, RULE_TYPES, isGannType, GANN_TYPES, groupOf } from "../src/alerts/alertRules.js";
import { buildMessage } from "../src/alerts/alertMessage.js";
import { ALERT_LANGS, alertText, hasAlertKey } from "../src/alerts/alertLang.js";
import { statusKey, ruleParamText } from "../src/alerts/alertView.js";
import { lineValueAt, barsBetween, GANN } from "../src/gann/gannMath.js";
import { framesNeeded } from "../api/_lib/alertData.js";
import { handleAlerts } from "../api/alerts.js";
import { memoryAdapter } from "../api/_lib/alertStore.js";
import { dayIdx, istMs, tradingDays, T0 } from "./alert-helpers.mjs";

var DAY = 86400000, IST = 19800000;
function slotMs(day, k, minutes){ return day * DAY - IST + (555 + k * (minutes || 15)) * 60000; }
var PREV = tradingDays(T0 - 1, 5);                       // five sessions before Tue 13 Oct 2026
var ANCHOR_DAY = PREV[2];
var LINE = { kind:"low", anchorT:Math.floor(slotMs(ANCHOR_DAY, 8) / 1000), anchorPrice:100, scale:0.5, tf:"15m" };
var DLINE = Object.assign({}, LINE, { kind:"high", anchorPrice:200 });
function nowAt(h, m){ return istMs(2026, 10, 13, h, m) + 5000; }

// 15m series: previous sessions in full + today's candles that have started by `now`.
// off(kBars, isAnchor) is added to the line value of each candle; the anchor candle sits on the anchor price.
function frame15(line, now, off, opts){
  opts = opts || {};
  var out = [];
  PREV.concat([T0]).forEach(function(day){
    for(var k = 0; k < 25; k++){
      var start = slotMs(day, k);
      if(start > now) break;
      var t = Math.floor(start / 1000), c, h, l;
      var kb = barsBetween(line.anchorT * 1000, start, "15m");
      if(t == line.anchorT){
        if(line.kind == "low"){ l = line.anchorPrice + (opts.anchorShift || 0); c = l + 0.2; h = l + 0.5; }
        else { h = line.anchorPrice + (opts.anchorShift || 0); c = h - 0.2; l = h - 0.5; }
        out.push({ time:t, open:c, high:h, low:l, close:c, volume:1000 }); continue;
      }
      if(kb == null || kb < 0){ c = line.kind == "low" ? 90 : 210; }
      else c = lineValueAt(line, start) + off(kb);
      out.push({ time:t, open:c, high:c + 0.2, low:c - 0.2, close:c, volume:1000 });
    }
  });
  return out;
}
function snapOf(candles, now, price, tf){
  var fr = {}; fr[tf || "15m"] = { ok:true, candles:candles };
  var last = candles[candles.length - 1];
  return { ok:true, quote:{ price:price != null ? price : last.close, asOf:now - 20000, delayedBySec:0 }, frames:fr };
}
function rule(type, line, extra){
  var params = { kind:line.kind, anchorT:line.anchorT, anchorPrice:line.anchorPrice, scale:line.scale };
  if(type == "gann_near") params.nearPct = 0.3;
  return Object.assign({ id:"g1", symbol:"RELIANCE", type:type, timeframe:line.tf, enabled:true, params:params }, extra || {});
}
// today's slot 3 (10:00) is the crossing candle; before it the close is below the upward line
var K_CROSS = barsBetween(LINE.anchorT * 1000, slotMs(T0, 3), "15m");
function upCross(kb){ return kb < K_CROSS ? -1 : 1; }

test("rule validation: Gann rule types, params, timeframe and watchlist gate", function(){
  assert.deepEqual(GANN_TYPES, ["gann_near", "gann_close", "gann_any"]);
  GANN_TYPES.forEach(function(t){ assert.ok(isGannType(t)); assert.equal(groupOf(t), "level"); });
  assert.equal(isGannType("price_above"), false);
  var ok = validateRuleInput({ symbol:"RELIANCE", type:"gann_close", timeframe:"15m", params:{ kind:"low", anchorT:LINE.anchorT, anchorPrice:"100", scale:"0.5", lineId:"abc123def0" } }, { watchlist:["RELIANCE"] });
  assert.equal(ok.ok, true); assert.equal(ok.rule.params.anchorPrice, 100); assert.equal(ok.rule.params.lineId, "abc123def0");
  var near = validateRuleInput({ symbol:"RELIANCE", type:"gann_near", timeframe:"15m", params:{ kind:"high", anchorT:LINE.anchorT, anchorPrice:200, scale:1 } }, { watchlist:["RELIANCE"] });
  assert.equal(near.ok, true); assert.equal(near.rule.params.nearPct, GANN.NEAR_DEFAULT);
  function bad(over, p){ return validateRuleInput(Object.assign({ symbol:"RELIANCE", type:"gann_close", timeframe:"15m", params:Object.assign({ kind:"low", anchorT:LINE.anchorT, anchorPrice:100, scale:0.5 }, p || {}) }, over || {}), { watchlist:["RELIANCE"] }); }
  assert.ok(bad(null, { kind:"mid" }).errors.indexOf("invalid_gann") >= 0);
  assert.ok(bad(null, { scale:0 }).errors.indexOf("invalid_gann") >= 0);
  assert.ok(bad(null, { anchorT:LINE.anchorT + 60 }).errors.indexOf("invalid_gann") >= 0);
  assert.ok(bad(null, { anchorPrice:-1 }).errors.indexOf("invalid_gann") >= 0);
  assert.ok(bad(null, { lineId:"<x>" }).errors.indexOf("invalid_gann") >= 0);
  assert.ok(bad({ timeframe:"1m" }).errors.indexOf("invalid_timeframe") >= 0);
  assert.ok(bad({ timeframe:undefined }).errors.indexOf("invalid_timeframe") >= 0);
  assert.ok(bad({ type:"gann_near" }, { nearPct:9 }).errors.indexOf("invalid_near") >= 0);
  assert.ok(bad({ symbol:"TCS" }).errors.indexOf("symbol_not_in_watchlist") >= 0);
});
test("every Gann error code and text key exists in all five languages", function(){
  var keys = ["sa.err.invalid_gann", "sa.err.invalid_near", "sa.gann.managed"];
  GANN_TYPES.forEach(function(t){ keys.push("ev." + t, "vo." + t, "sa.type." + t); });
  ["rs.gann_near", "rs.gann_close_up", "rs.gann_close_down"].forEach(function(k){ keys.push(k); });
  ["before_anchor", "gann_watching", "gann_cooldown", "gann_beyond", "intraday_unavailable", "anchor_mismatch"].forEach(function(k){ keys.push("sa.why." + k); });
  keys.forEach(function(k){ ALERT_LANGS.forEach(function(l){ assert.ok(hasAlertKey(l, k), l + " missing " + k); }); });
  ["before_anchor", "gann_watching", "gann_cooldown", "gann_beyond", "intraday_unavailable", "anchor_mismatch"].forEach(function(r){
    assert.equal(statusKey({ status:"waiting", reason:r }), "sa.why." + r);
  });
  assert.equal(statusKey({ status:"unavailable", reason:"intraday_unavailable" }), "sa.why.intraday_unavailable");
  assert.ok(ruleParamText({ type:"gann_near", params:{ anchorPrice:100, scale:0.5, nearPct:0.3 } }).indexOf("0.3") >= 0);
});
test("Gann rules read the frame of their own timeframe (never a different one)", function(){
  var n = framesNeeded([rule("gann_close", LINE), rule("gann_near", Object.assign({}, LINE, { tf:"1H", anchorT:Math.floor(slotMs(ANCHOR_DAY, 1, 60) / 1000) }), { id:"g2" })]);
  assert.deepEqual(n.RELIANCE.sort(), ["15m", "1H"]);
});

test("confirmed close above an upward line: fires once with every explanation field, never on the forming candle", function(){
  var r = rule("gann_close", LINE);
  var n1 = nowAt(10, 0);                                         // bars through 09:45 are complete, all below the line
  var a = evaluateRule(r, snapOf(frame15(LINE, n1, upCross), n1), null, n1);
  assert.equal(a.status, "waiting"); assert.equal(a.events.length, 0); assert.equal(a.state.gann.side, "below");
  var n2 = nowAt(10, 15);                                        // the 10:00 candle has closed above the line
  var b = evaluateRule(r, snapOf(frame15(LINE, n2, upCross), n2), a.state, n2);
  assert.equal(b.status, "triggered"); assert.equal(b.events.length, 1);
  var e = b.events[0];
  assert.equal(e.event, "gann_close"); assert.equal(e.direction, "up"); assert.equal(e.basis, "completed_candle");
  assert.equal(e.timeframe, "15m"); assert.equal(e.eventTime, istMs(2026, 10, 13, 10, 15), "candle-close timestamp");
  assert.equal(e.reason.confirmed, true); assert.equal(e.reason.anchorPrice, 100); assert.equal(e.reason.scale, 0.5); assert.equal(e.reason.anchorT, LINE.anchorT);
  assert.equal(e.reason.level, lineValueAt(LINE, slotMs(T0, 3))); assert.equal(e.freshness.source, "yahoo"); assert.equal(e.freshness.state, "live");
  assert.ok(e.price > e.reason.level);
  // the same candles again: nothing
  var c = evaluateRule(r, snapOf(frame15(LINE, n2, upCross), n2), b.state, n2 + 60000);
  assert.equal(c.events.length, 0);
});
test("a crossing on the still-forming candle does not fire until that candle closes", function(){
  var r = rule("gann_close", LINE);
  var n1 = nowAt(10, 0), a = evaluateRule(r, snapOf(frame15(LINE, n1, upCross), n1), null, n1);
  var n2 = nowAt(10, 7);                                         // 10:00 candle is forming (up to now) and already above
  var b = evaluateRule(r, snapOf(frame15(LINE, n2, upCross), n2, null), a.state, n2);
  assert.equal(b.events.length, 0); assert.equal(b.state.gann.side, "below");
});
test("downward line fires on a confirmed close below only", function(){
  var r = rule("gann_close", DLINE);
  var kc = barsBetween(DLINE.anchorT * 1000, slotMs(T0, 3), "15m");
  var off = function(kb){ return kb < kc ? 1 : -1; };
  var n1 = nowAt(10, 0), a = evaluateRule(r, snapOf(frame15(DLINE, n1, off), n1), null, n1);
  assert.equal(a.state.gann.side, "above");
  var n2 = nowAt(10, 15), b = evaluateRule(r, snapOf(frame15(DLINE, n2, off), n2), a.state, n2);
  assert.equal(b.events.length, 1); assert.equal(b.events[0].direction, "down"); assert.ok(b.events[0].price < b.events[0].reason.level);
});
test("created when price is already beyond the line: waits, no instant alert", function(){
  var r = rule("gann_close", LINE), n = nowAt(10, 45);
  var a = evaluateRule(r, snapOf(frame15(LINE, n, upCross), n), null, n);
  assert.equal(a.events.length, 0); assert.equal(a.state.gann.side, "above"); assert.equal(a.reason, "gann_watching");
});
test("'either direction' reports an upward and a downward close with the crossing direction", function(){
  var r = rule("gann_any", LINE);
  var kUp = barsBetween(LINE.anchorT * 1000, slotMs(T0, 3), "15m"), kDown = barsBetween(LINE.anchorT * 1000, slotMs(T0, 7), "15m");
  var off = function(kb){ return kb < kUp ? -1 : (kb < kDown ? 1 : -1); };
  var n1 = nowAt(10, 0), a = evaluateRule(r, snapOf(frame15(LINE, n1, off), n1), null, n1);
  var n2 = nowAt(11, 45), b = evaluateRule(r, snapOf(frame15(LINE, n2, off), n2), a.state, n2);
  assert.deepEqual(b.events.map(function(e){ return e.direction; }), ["up", "down"]);
  assert.ok(b.events.every(function(e){ return e.event == "gann_any" && e.reason.mode == "any"; }));
});
test("duplicate keys are unique per candle and direction; cooldown suppresses a whipsaw; the rule re-arms later", function(){
  var r = rule("gann_close", LINE);
  var k0 = K_CROSS;
  // below, up (fire), down, up 2 bars later (inside the cooldown), down x3, up (fires again)
  var pat = {}; [0, 1, 0, 1, 0, 0, 0, 1].forEach(function(v, i){ pat[k0 + i - 2] = v; });
  var off = function(kb){ if(kb < k0 - 2) return -1; return pat[kb] ? 1 : -1; };
  var seq = [nowAt(9, 50), nowAt(10, 15), nowAt(11, 45), nowAt(12, 30)];
  var st = null, evs = [];
  seq.forEach(function(n){ var x = evaluateRule(r, snapOf(frame15(LINE, n, off), n), st, n); st = x.state; evs = evs.concat(x.events); });
  assert.ok(evs.length >= 2);
  var keys = evs.map(function(e){ return e.key; });
  assert.equal(new Set(keys).size, keys.length, "dedupe keys differ");
  keys.forEach(function(k){ assert.ok(k.indexOf("g1|gann_close|15m|") == 0 && /\|up$/.test(k)); });
  assert.ok(st.suppressed >= 1, "the quick re-cross was suppressed by the cooldown");
});
test("stale candles, missing frame, no data: never an alert", function(){
  var r = rule("gann_close", LINE);
  var built = nowAt(10, 15), later = nowAt(12, 30);              // data is two hours old by the time of the check
  var stale = evaluateRule(r, snapOf(frame15(LINE, built, upCross), built), null, later);
  assert.equal(stale.status, "stale"); assert.equal(stale.reason, "bars_stale"); assert.equal(stale.events.length, 0);
  var none = evaluateRule(r, { ok:true, quote:null, frames:{} }, null, built);
  assert.equal(none.status, "unavailable"); assert.equal(none.events.length, 0);
  assert.equal(evaluateRule(r, { ok:false, code:"provider_error", frames:{} }, null, built).status, "unavailable");
  assert.equal(evaluateRule(r, null, null, built).status, "unavailable");
  var bad = { ok:true, quote:null, frames:{ "15m":{ ok:false, code:"rate_limited" } } };
  assert.equal(evaluateRule(r, bad, null, built).reason, "rate_limited");
});
test("market closed, holiday and weekend: nothing fires; closed after 15:35 too", function(){
  var r = rule("gann_close", LINE), n = nowAt(10, 15), snap = snapOf(frame15(LINE, n, upCross), n);
  assert.equal(evaluateRule(r, snap, null, istMs(2026, 10, 13, 16, 0)).status, "market_closed");
  assert.equal(evaluateRule(r, snap, null, istMs(2026, 10, 17, 11, 0)).reason, "WEEKEND");
  assert.equal(evaluateRule(r, snap, null, istMs(2026, 10, 20, 11, 0)).reason, "HOLIDAY");
  assert.equal(evaluateRule(rule("gann_near", LINE), snap, null, istMs(2026, 10, 13, 15, 32)).status, "market_closed", "the approach alert needs a live session");
});
test("daily candles are never used as intraday: a daily series sent for a 15m rule disables it", function(){
  var daily = PREV.concat([T0]).map(function(d, i){ var c = 90 + i; return { time:Math.floor(slotMs(d, 0) / 1000), open:c, high:c + 1, low:c - 1, close:c, volume:5 }; });
  var daily2 = daily.map(function(c, i){ return c; });
  var n = nowAt(11, 0), r = rule("gann_close", LINE);
  var res = evaluateRule(r, { ok:true, quote:{ price:95, asOf:n - 20000, delayedBySec:0 }, frames:{ "15m":{ ok:true, candles:daily2 } } }, null, n);
  assert.equal(res.status, "unavailable"); assert.equal(res.reason, "intraday_unavailable"); assert.equal(res.events.length, 0);
  var near = evaluateRule(rule("gann_near", LINE), { ok:true, quote:{ price:95, asOf:n - 20000, delayedBySec:0 }, frames:{ "15m":{ ok:true, candles:daily2 } } }, null, n);
  assert.equal(near.reason, "intraday_unavailable");
});
test("a real daily (1D) Gann rule works on daily candles and is labelled daily", function(){
  var dayLine = { kind:"low", anchorT:Math.floor(slotMs(PREV[1], 0) / 1000), anchorPrice:100, scale:1, tf:"1D" };
  var days = tradingDays(T0 - 1, 12);
  var kc = barsBetween(dayLine.anchorT * 1000, slotMs(PREV[4], 0), "1D");
  var cs = days.map(function(d){
    var start = slotMs(d, 0), t = Math.floor(start / 1000);
    if(t == dayLine.anchorT) return { time:t, open:100.2, high:100.5, low:100, close:100.2, volume:1 };
    var kb = barsBetween(dayLine.anchorT * 1000, start, "1D");
    var c = kb == null || kb < 0 ? 90 : lineValueAt(dayLine, start) + (kb < kc ? -1 : 1);
    return { time:t, open:c, high:c + 0.2, low:c - 0.2, close:c, volume:1 };
  });
  var r = rule("gann_close", dayLine, { timeframe:"1D" });
  var early = cs.filter(function(c){ return c.time * 1000 < slotMs(PREV[4], 0); });
  var n = nowAt(11, 0);
  var a = evaluateRule(r, { ok:true, quote:{ price:101, asOf:n - 20000, delayedBySec:0 }, frames:{ "1D":{ ok:true, candles:early } } }, null, n);
  var b = evaluateRule(r, { ok:true, quote:{ price:101, asOf:n - 20000, delayedBySec:0 }, frames:{ "1D":{ ok:true, candles:cs } } }, a.state, n);
  assert.equal(b.events.length, 1); assert.equal(b.events[0].timeframe, "1D"); assert.equal(b.events[0].direction, "up");
});
test("anchor mismatch with the provider's own candle pauses the rule", function(){
  var r = rule("gann_close", LINE), n = nowAt(10, 15);
  var res = evaluateRule(r, snapOf(frame15(LINE, n, upCross, { anchorShift:5 }), n), null, n);
  assert.equal(res.status, "unavailable"); assert.equal(res.reason, "anchor_mismatch"); assert.equal(res.events.length, 0);
});
test("approach alert: fires within the band on the pre-cross side, not when already beyond, re-arms after moving away", function(){
  var r = rule("gann_near", LINE);
  var n1 = nowAt(10, 0), lvl = lineValueAt(LINE, slotMs(T0, 3));            // the line value of the candle price is trading in
  var far = evaluateRule(r, snapOf(frame15(LINE, n1, upCross), n1, lvl * 0.98), null, n1);
  assert.equal(far.events.length, 0);
  var n2 = n1 + 60000;
  var near = evaluateRule(r, snapOf(frame15(LINE, n2, upCross), n2, lvl * 0.9985), far.state, n2);
  assert.equal(near.events.length, 1);
  var e = near.events[0];
  assert.equal(e.event, "gann_near"); assert.equal(e.direction, "neutral"); assert.equal(e.reason.confirmed, false); assert.equal(e.basis, "last_price");
  assert.equal(e.reason.level, lvl); assert.ok(e.reason.distPct < 0 && Math.abs(e.reason.distPct) <= 0.3);
  var n3 = n2 + 60000;
  var again = evaluateRule(r, snapOf(frame15(LINE, n3, upCross), n3, lvl * 0.9988), near.state, n3);
  assert.equal(again.events.length, 0, "already fired: not re-armed while still near");
  var n4 = n3 + 120000;
  var away = evaluateRule(r, snapOf(frame15(LINE, n4, upCross), n4, lvl * 0.97), again.state, n4);
  assert.equal(away.state.gannNear.armed, true);
  var n5 = n4 + 16 * 60000;                                                 // past the 15 minute cooldown
  var lvl5 = lineValueAt(LINE, slotMs(T0, 4));
  var back = evaluateRule(r, snapOf(frame15(LINE, n5, upCross), n5, lvl5 * 0.999), away.state, n5);
  assert.equal(back.events.length, 1, "re-armed and past the cooldown");
  var beyond = evaluateRule(r, snapOf(frame15(LINE, n1, upCross), n1, lvl * 1.01), null, n1);
  assert.equal(beyond.events.length, 0); assert.equal(beyond.reason, "gann_beyond");
});
test("approach alert stays silent on a stale quote", function(){
  var r = rule("gann_near", LINE), n = nowAt(10, 0), lvl = lineValueAt(LINE, slotMs(T0, 3));
  var s = snapOf(frame15(LINE, n, upCross), n, lvl * 0.999); s.quote.asOf = n - 3600000;
  var res = evaluateRule(r, s, null, n);
  assert.equal(res.status, "stale"); assert.equal(res.events.length, 0);
});

test("message builder: instrument, timeframe, anchor, line value, candle-close time, source, freshness and 'confirmed' in all five languages", function(){
  var r = rule("gann_close", LINE), n1 = nowAt(10, 0), n2 = nowAt(10, 15);
  var a = evaluateRule(r, snapOf(frame15(LINE, n1, upCross), n1), null, n1);
  var ev = evaluateRule(r, snapOf(frame15(LINE, n2, upCross), n2), a.state, n2).events[0];
  ALERT_LANGS.forEach(function(l){
    var m = buildMessage(ev, l);
    assert.ok(m.title.indexOf("RELIANCE") >= 0 && m.title.indexOf("15m") >= 0, l + " " + m.title);
    assert.ok(m.title.indexOf(ev.reason.level.toFixed(2)) >= 0, l + " line value in title");
    assert.ok(m.reason.indexOf("100.00") >= 0 && m.reason.indexOf("0.50") >= 0, l + " anchor and scale: " + m.reason);
    assert.ok(m.reason.indexOf("IST") >= 0, l + " anchor time");
    assert.ok(m.body.indexOf("Yahoo Finance") >= 0 && m.body.indexOf("10:15") >= 0 && m.body.indexOf("IST") >= 0, l + " " + m.body);
    assert.ok(m.fresh.length > 0 && m.voice.length > 0);
  });
  var en = buildMessage(ev, "en"); assert.match(en.reason, /Candle close confirmed/); assert.match(en.reason, /above/);
  var down = buildMessage(Object.assign({}, ev, { direction:"down", reason:Object.assign({}, ev.reason, { crossDir:"down" }) }), "en");
  assert.match(down.reason, /below/);
  var nearEv = Object.assign({}, ev, { event:"gann_near", basis:"last_price", reason:Object.assign({}, ev.reason, { confirmed:false, near:0.3, distPct:-0.1 }) });
  assert.match(buildMessage(nearEv, "en").reason, /not a confirmed candle close/);
  assert.notEqual(buildMessage(ev, "te").title, en.title);
});

// ---- server runner: per-device isolation and push, with a MOCK store, feed and push sender ----
var ENV = { SESSION_SECRET:"s".repeat(32), BETA_CODES:"CODE-ONE, CODE-TWO", CRON_SECRET:"c".repeat(24) };
function subKeys(){
  var e = crypto.createECDH("prime256v1"); e.generateKeys();
  return { endpoint:"https://fcm.googleapis.com/fcm/send/" + crypto.randomBytes(8).toString("hex"), keys:{ p256dh:e.getPublicKey().toString("base64url"), auth:crypto.randomBytes(16).toString("base64url") } };
}
function harness(){
  var store = memoryAdapter(), deps = { store:store, env:ENV, now:nowAt(10, 0) };
  async function call(action, body, secret, extra){
    return handleAlerts({ method:"POST", query:{ action:action }, body:body || {}, headers:secret ? { "x-bp-device":secret } : {} }, Object.assign({}, deps, extra || {}));
  }
  return { store:store, deps:deps, call:call };
}
function gannBody(line, type, extra){
  return { rule:{ symbol:"RELIANCE", type:type, timeframe:line.tf, params:Object.assign({ kind:line.kind, anchorT:line.anchorT, anchorPrice:line.anchorPrice, scale:line.scale }, extra || {}) } };
}
test("RUNNER (mock): two devices with the same symbol keep separate lines, history, languages and pushes", async function(){
  var h = harness();
  var A = (await h.call("enroll", { code:"CODE-ONE" })).json.secret, B = (await h.call("enroll", { code:"CODE-TWO" })).json.secret;
  await h.call("saveSettings", { watchlist:["RELIANCE"], lang:"te" }, A);
  await h.call("saveSettings", { watchlist:["RELIANCE"], lang:"hi" }, B);
  var sa = subKeys(), sb = subKeys();
  await h.call("subscribe", { subscription:sa }, A); await h.call("subscribe", { subscription:sb }, B);
  // A: upward line that WILL be crossed. B: a downward line (needs a close below): no cross happens.
  var ra = await h.call("saveRule", gannBody(LINE, "gann_close"), A); assert.equal(ra.status, 200, JSON.stringify(ra.json));
  var DB_ = Object.assign({}, LINE, { kind:"high", anchorPrice:100.5 });   // matches the anchor candle high, so it stays active
  var rb = await h.call("saveRule", gannBody(DB_, "gann_close"), B); assert.equal(rb.status, 200, JSON.stringify(rb.json));
  var sent = [];
  var snd = function(sub, payload){ sent.push({ endpoint:sub.endpoint, payload:payload }); return Promise.resolve({ ok:true, code:"sent" }); };
  // the mock feed serves the 15m frame for whatever lines are being watched: price path crosses A's line only
  function feed(n){
    return function(req){
      var out = {};
      Object.keys(req).forEach(function(sym){
        // one frame per symbol: build it from A's line so the close crosses A's upward line at 10:00;
        // B's downward line (anchored far above) never sees a close below it.
        var candles = frame15(LINE, n, upCross);
        out[sym] = snapOf(candles, n);
      });
      return Promise.resolve(out);
    };
  }
  function cron(n){ return handleAlerts({ method:"POST", query:{ action:"cron" }, body:{}, headers:{ authorization:"Bearer " + ENV.CRON_SECRET } }, Object.assign({}, h.deps, { now:n, fetchSnapshots:feed(n), sendPush:snd })); }
  var c1 = await cron(nowAt(10, 0)); assert.equal(c1.status, 200);
  var c2 = await cron(nowAt(10, 15)); assert.equal(c2.status, 200);
  var ga = (await h.call("get", {}, A)).json, gb = (await h.call("get", {}, B)).json;
  assert.equal(ga.history.length, 1, "A got its alert"); assert.equal(ga.history[0].event, "gann_close"); assert.equal(ga.history[0].direction, "up");
  assert.equal(gb.history.length, 0, "B's line was not crossed and A's event never reaches B");
  assert.notEqual(gb.status[gb.doc.rules[0].id].status, "unavailable", "B's rule really was evaluated, not skipped");
  assert.equal(sent.length, 1); assert.equal(sent[0].endpoint, sa.endpoint, "only A's device received the push");
  assert.equal(sent[0].payload.lang, "te", "A's language");
  assert.ok(sent[0].payload.title.indexOf("RELIANCE") >= 0 && sent[0].payload.body.indexOf("IST") >= 0);
  assert.notEqual(ga.doc.rules[0].id, gb.doc.rules[0].id);
  // a later run on the same candles does not repeat the alert
  await cron(nowAt(10, 16)); await cron(nowAt(10, 20));
  assert.equal(sent.length, 1, "no duplicate push");
  assert.equal((await h.call("get", {}, A)).json.history.length, 1);
  // editing the line restarts it from clean state (rev change); deleting it removes its state
  var del = await h.call("deleteRule", { id:ga.doc.rules[0].id }, A); assert.equal(del.status, 200);
  assert.equal((await h.call("get", {}, A)).json.doc.rules.length, 0);
  assert.equal((await h.call("get", {}, B)).json.doc.rules.length, 1, "B's rule is untouched");
  // A cannot touch B's rule
  var cross = await h.call("deleteRule", { id:gb.doc.rules[0].id }, A); assert.equal(cross.status, 404);
  var edit = await h.call("saveRule", Object.assign({}, gannBody(LINE, "gann_close"), { rule:Object.assign({ id:gb.doc.rules[0].id }, gannBody(LINE, "gann_close").rule) }), A);
  assert.equal(edit.status, 404);
});
test("RUNNER (mock): an intraday Gann rule on a market-data failure reports unavailable and sends nothing", async function(){
  var h = harness();
  var A = (await h.call("enroll", { code:"CODE-ONE" })).json.secret;
  await h.call("saveSettings", { watchlist:["RELIANCE"] }, A);
  await h.call("subscribe", { subscription:subKeys() }, A);
  await h.call("saveRule", gannBody(LINE, "gann_close"), A);
  var sent = [];
  var res = await handleAlerts({ method:"POST", query:{ action:"cron" }, body:{}, headers:{ authorization:"Bearer " + ENV.CRON_SECRET } },
    Object.assign({}, h.deps, { now:nowAt(10, 15), fetchSnapshots:function(){ return Promise.resolve({ RELIANCE:{ ok:false, code:"provider_error", quote:null, frames:{} } }); }, sendPush:function(s, p){ sent.push(p); return Promise.resolve({ ok:true }); } }));
  assert.equal(res.status, 200); assert.equal(sent.length, 0);
  var g = (await h.call("get", {}, A)).json;
  assert.equal(g.status[g.doc.rules[0].id].status, "unavailable");
});
test("source hygiene for the alert integration", function(){
  ["src/alerts/alertEngine.js", "src/alerts/alertRules.js", "src/alerts/alertMessage.js", "src/alerts/alertView.js"].forEach(function(f){
    var s = fs.readFileSync(f, "utf8"); assert.ok(!/[^\x00-\x7F]/.test(s), f); assert.ok(s.indexOf("`") < 0, f); assert.ok(s.indexOf("===") < 0, f);
  });
  assert.ok(Object.keys(RULE_TYPES).length >= 13);
});
