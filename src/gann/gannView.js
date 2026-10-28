// BreakoutPro - src/gann/gannView.js
// Pure helpers between the chart screen and the Gann maths: validate the chart's own candles,
// decide what is allowed (drawing, alerts), list anchor choices and describe a line. No React,
// no network, no storage, no clock (callers pass "now").
// Rules: no backtick, no triple-equals, ASCII only.

import { validateCandles, istLabel } from "../screens/BreakoutTfEngine.js";
import { barFreshness } from "../alerts/alertEngine.js";
import { GANN, alertTfOfChart, intradayCheck, swingIndexes, anchorPriceOf, lineValueAt, barStartAt, bar as barOf, sideOf, validateLine } from "./gannMath.js";

export var VISIBLE = 60;          // the chart shows the newest 60 candles; anchors are chosen from these
export var MIN_BARS = GANN.ATR_N + 1;

function isNum(v){ return typeof v == "number" && isFinite(v); }

// chartCandles: [{ time (s), open, high, low, close, vol }] as the chart screen holds them.
// Returns { tf, supported, bars (validated COMPLETED candles), intraday, freshness, rejected, reason, canDraw, canAlert, alertReason }.
export function prepareBars(chartCandles, chartTf, now){
  var tf = alertTfOfChart(chartTf);
  var out = { tf:tf, supported:tf != null, bars:[], intraday:{ ok:true }, freshness:null, rejected:null, reason:null, canDraw:false, canAlert:false, alertReason:null, forming:null };
  if(!tf){ out.reason = "unsupported_tf"; out.alertReason = "unsupported_tf"; return out; }
  var raw = (chartCandles || []).map(function(c){ return { time:c.time, open:c.open, high:c.high, low:c.low, close:c.close, volume:c.vol != null ? c.vol : c.volume }; });
  var v = validateCandles(raw, tf, now);
  out.rejected = v.rejected;
  var done = [];
  v.candles.forEach(function(c){ if(c.endMs <= now - 1000) done.push(c); else out.forming = c; });
  out.bars = done;
  if(!done.length){ out.reason = "no_data"; out.alertReason = "no_data"; return out; }
  out.intraday = intradayCheck(done, tf);
  out.freshness = barFreshness(tf, done[done.length - 1].endMs, now);
  if(!out.intraday.ok){ out.reason = "intraday_unavailable"; out.alertReason = "intraday_unavailable"; return out; }
  out.canDraw = done.length >= 2;
  if(done.length < MIN_BARS) out.alertReason = "insufficient_history";
  else if(out.freshness.state == "stale") out.alertReason = "stale";
  else out.canAlert = true;
  return out;
}

// Candles the anchor may be chosen from: the completed candles inside the chart's visible window.
export function anchorWindow(bars){
  return (bars || []).slice(-VISIBLE);
}

// [{ idx (into the given window), label, price, swing:true }] newest first, at most 8.
export function swingOptions(windowBars, kind){
  var idxs = swingIndexes(windowBars, kind, GANN.SWING_N), out = [];
  for(var i = idxs.length - 1; i >= 0 && out.length < 8; i--){
    var b = windowBars[idxs[i]];
    out.push({ idx:idxs[i], label:istLabel(b.startMs), price:anchorPriceOf(b, kind) });
  }
  return out;
}
export function isSwing(windowBars, idx, kind){
  return swingIndexes(windowBars, kind, GANN.SWING_N).indexOf(idx) >= 0;
}

// Build a line from a chosen anchor candle and a scale.
export function lineFromAnchor(sym, tf, kind, anchorBar, scale, scaleMode){
  return { sym:sym, tf:tf, kind:kind, anchorT:anchorBar.t, anchorPrice:anchorPriceOf(anchorBar, kind), scale:scale, scaleMode:scaleMode == "auto" ? "auto" : "manual" };
}

// Numbers shown next to the line. lastClose / side use the newest completed candle; "now" value is the line
// at the candle that is trading right now (null outside the session).
export function describeLine(line, bars, now){
  var out = { ok:false };
  if(!line || !validateLine(line, null).ok || !bars || !bars.length) return out;
  var last = bars[bars.length - 1];
  var atLast = lineValueAt(line, last.startMs);
  var bs = barStartAt(now, line.tf);
  var atNow = bs != null ? lineValueAt(line, bs) : null;
  return {
    ok:true, lastClose:last.close, lastCloseTime:last.endMs, levelAtLast:atLast, levelNow:atNow, barsSinceAnchor:barOf(line, last.startMs),
    side:atLast != null ? sideOf(last.close, atLast) : null,
    distPct:atLast != null && atLast > 0 ? (last.close - atLast) / atLast * 100 : null
  };
}

export function fmtNum(n, d){
  if(!isNum(n)) return "-";
  return n.toLocaleString("en-IN", { minimumFractionDigits:d == null ? 2 : d, maximumFractionDigits:d == null ? 2 : d });
}

// Which alert types match a saved line, from the owner's rules (linked by params.lineId).
export function linkedRules(rules, lineId){
  var out = {};
  (rules || []).forEach(function(r){
    if(r && r.params && r.params.lineId == lineId && (r.type == "gann_near" || r.type == "gann_close" || r.type == "gann_any")) out[r.type] = r;
  });
  return out;
}
// True when a rule no longer matches the saved line (the line was edited since).
export function ruleOutOfSync(rule, line){
  if(!rule || !line) return false;
  var p = rule.params || {};
  return p.kind != line.kind || p.anchorT != line.anchorT || Math.abs(p.anchorPrice - line.anchorPrice) > 0.00005 || Math.abs(p.scale - line.scale) > 0.00005 || rule.timeframe != line.tf;
}
export function ruleBody(line, alertSym, type, nearPct, existing){
  var params = { kind:line.kind, anchorT:line.anchorT, anchorPrice:line.anchorPrice, scale:line.scale, lineId:line.id };
  if(type == "gann_near") params.nearPct = nearPct;
  var body = { symbol:alertSym, type:type, timeframe:line.tf, params:params, enabled:existing ? existing.enabled != false : true };
  if(existing) body.id = existing.id;
  return body;
}
