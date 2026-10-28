// BreakoutPro - src/gann/gannMath.js
// Pure maths for the Gann 1x1 angle tool and the Gann alerts. No DOM, no network, no storage,
// no clock (callers pass "now").
//
// DEFINITION (the whole tool rests on this, and the screen states it in words):
//   * One "bar" is one candle of the chosen timeframe on the NSE trading calendar. Nights,
//     weekends and exchange holidays contain no bars, so a Monday 09:15 candle is one bar after
//     a Friday last candle. The bar count comes from the calendar, never from how many candles a
//     provider happened to return, so a missing candle cannot shift the line.
//   * The scale is a fixed number of price units per bar (for example 12.50 points per bar).
//     That is the "1" on the price axis of 1x1. The line is
//         value(k) = anchorPrice + dir * scale * k
//     where k = bars since the anchor candle, dir = +1 for an upward line from a swing LOW
//     and -1 for a downward line from a swing HIGH. Doubling the scale doubles the slope.
//   * The value belongs to the candle at bar k (its own bar), for the close-cross test as well
//     as for the line drawn on the chart. A visual 45 degree angle is NOT used: it changes
//     with chart size and zoom, the scale above does not.
// Holidays: only the 2026 NSE list is built into the app (src/utils/marketStatus.js). For other
// years the calendar treats every weekday as a trading day, so bar counts across an unlisted
// holiday would be one too high. The screen shows this limitation.
// Educational tool, not a trading signal.
// Rules: no backtick, no triple-equals, ASCII only.

import { istParts } from "../screens/DirectionEngine.js";
import { isTradingDayIndex, BTF, TIMEFRAMES } from "../screens/BreakoutTfEngine.js";

export var GANN = {
  TFS: ["5m", "15m", "1H", "1D"],
  SCALE_MIN: 0.01,
  NEAR_MIN: 0.05, NEAR_MAX: 5, NEAR_DEFAULT: 0.3,
  COOLDOWN_BARS: 3,       // minimum bars between two close-cross alerts for one line
  MAX_SCAN: 30,           // newest bars examined per run
  SWING_N: 3,             // bars on each side that must be higher (low) or lower (high)
  ATR_N: 14,
  ANCHOR_TOL: 0.002       // 0.2%: provider candle vs saved anchor price
};

var DAY_MS = 86400000, IST_MS = 19800000;
function isNum(v){ return typeof v == "number" && isFinite(v); }

export function isGannTf(tf){ return GANN.TFS.indexOf(tf) >= 0; }
// Chart timeframe label ("1h") -> alert timeframe key ("1H"); null when the alert engine has no such frame.
export function alertTfOfChart(tf){
  var m = { "5m":"5m", "15m":"15m", "1h":"1H", "1H":"1H", "1D":"1D" };
  return Object.prototype.hasOwnProperty.call(m, tf) ? m[tf] : null;
}

export function slotsPerDay(tf){
  if(tf == "1D") return 1;
  var t = TIMEFRAMES[tf];
  if(!t || !t.minutes) return null;
  return Math.ceil((BTF.CLOSE_MIN - BTF.OPEN_MIN) / t.minutes);
}
// Slot of a candle start inside its session (0 = 09:15). null when off the grid.
export function slotOf(startMs, tf){
  if(!isNum(startMs)) return null;
  var p = istParts(startMs);
  if(!isTradingDayIndex(p.day)) return null;
  if(tf == "1D") return 0;
  var t = TIMEFRAMES[tf];
  if(!t || !t.minutes) return null;
  if(p.min < BTF.OPEN_MIN || p.min >= BTF.CLOSE_MIN) return null;
  var d = p.min - BTF.OPEN_MIN;
  if(d % t.minutes != 0) return null;
  return d / t.minutes;
}

// Trading days d with a < d <= b (both IST day indexes, b >= a).
function tradingDaysAfter(a, b){
  var n = 0;
  for(var d = a + 1; d <= b; d++){ if(isTradingDayIndex(d)) n++; }
  return n;
}

// Whole bars from candle start aMs to candle start bMs (negative when b is earlier). null when
// either time is not a valid candle start on the trading calendar.
export function barsBetween(aMs, bMs, tf){
  var sa = slotOf(aMs, tf), sb = slotOf(bMs, tf), spd = slotsPerDay(tf);
  if(sa == null || sb == null || spd == null) return null;
  var da = istParts(aMs).day, db = istParts(bMs).day;
  if(Math.abs(db - da) > 1500) return null;
  var days = db >= da ? tradingDaysAfter(da, db) : -tradingDaysAfter(db, da);
  return days * spd + (sb - sa);
}

// Start (ms) of the candle that contains "ms", or null outside the session. Daily candles are
// stamped at the 09:15 IST open, like the provider's.
export function barStartAt(ms, tf){
  if(!isNum(ms)) return null;
  var p = istParts(ms);
  if(!isTradingDayIndex(p.day)) return null;
  if(p.min < BTF.OPEN_MIN || p.min >= BTF.CLOSE_MIN) return null;
  var open = p.day * DAY_MS - IST_MS + BTF.OPEN_MIN * 60000;
  if(tf == "1D") return open;
  var t = TIMEFRAMES[tf];
  if(!t || !t.minutes) return null;
  var k = Math.floor((p.min - BTF.OPEN_MIN) / t.minutes);
  return open + k * t.minutes * 60000;
}

export function dirOf(kind){ return kind == "low" ? 1 : (kind == "high" ? -1 : 0); }

// line: { kind:"low"|"high", anchorT (epoch seconds, candle start), anchorPrice, scale, tf }
export function validateLine(line, now){
  var errors = [];
  if(!line || typeof line != "object") return { ok:false, errors:["invalid_line"] };
  if(line.kind != "low" && line.kind != "high") errors.push("invalid_kind");
  if(!isGannTf(line.tf)) errors.push("invalid_timeframe");
  if(!isNum(line.anchorT) || Math.floor(line.anchorT) != line.anchorT || line.anchorT < BTF.MIN_EPOCH_S) errors.push("invalid_anchor_time");
  else if(isNum(now) && line.anchorT * 1000 > now + BTF.FUTURE_SKEW_MS) errors.push("invalid_anchor_time");
  else if(isGannTf(line.tf) && slotOf(line.anchorT * 1000, line.tf) == null) errors.push("invalid_anchor_time");
  if(!isNum(line.anchorPrice) || !(line.anchorPrice > 0) || line.anchorPrice > 10000000) errors.push("invalid_anchor_price");
  if(!isNum(line.scale) || line.scale < GANN.SCALE_MIN || (isNum(line.anchorPrice) && line.scale > line.anchorPrice)) errors.push("invalid_scale");
  return errors.length ? { ok:false, errors:errors } : { ok:true, errors:[] };
}

export function bar(line, tMs){
  return barsBetween(line.anchorT * 1000, tMs, line.tf);
}
// Line value at the candle starting at tMs. null before the anchor, off the calendar, or when a
// downward line would reach zero.
export function lineValueAt(line, tMs){
  var k = bar(line, tMs);
  if(k == null || k < 0) return null;
  var v = line.anchorPrice + dirOf(line.kind) * line.scale * k;
  if(!isNum(v) || !(v > 0)) return null;
  return v;
}
// Values aligned with chart candles ({time in seconds}); null where the line is not defined.
export function lineSeries(candles, line){
  return (candles || []).map(function(c){ return lineValueAt(line, c.time * 1000); });
}

// Price scale suggestion: average true range of the last ATR_N completed bars (simple average),
// rounded to the 0.05 tick. null with a reason when there are too few bars.
export function suggestScale(bars){
  var n = GANN.ATR_N;
  if(!Array.isArray(bars) || bars.length < n + 1) return { ok:false, code:"insufficient_history", have:Array.isArray(bars) ? bars.length : 0, need:n + 1 };
  var s = 0;
  for(var i = bars.length - n; i < bars.length; i++){
    var b = bars[i], pc = bars[i - 1].close;
    if(!isNum(b.high) || !isNum(b.low) || !isNum(pc)) return { ok:false, code:"invalid_ohlc" };
    s += Math.max(b.high - b.low, Math.abs(b.high - pc), Math.abs(b.low - pc));
  }
  var atr = s / n;
  var v = Math.max(0.05, Math.round(atr / 0.05) * 0.05);
  return { ok:true, scale:Math.round(v * 100) / 100, basis:"ATR(" + n + ")" };
}

// Indexes of confirmed swing candles. A swing LOW has a lower low than the N bars before it and
// a low not higher than the N bars after it; a swing HIGH mirrors that. The newest N bars cannot
// be confirmed yet and are never listed.
export function swingIndexes(bars, kind, n){
  n = n || GANN.SWING_N;
  var out = [];
  if(!Array.isArray(bars)) return out;
  for(var i = n; i + n < bars.length; i++){
    var ok = true, j;
    if(kind == "low"){
      for(j = 1; j <= n; j++){ if(!(bars[i].low < bars[i - j].low) || !(bars[i].low <= bars[i + j].low)){ ok = false; break; } }
    } else {
      for(j = 1; j <= n; j++){ if(!(bars[i].high > bars[i - j].high) || !(bars[i].high >= bars[i + j].high)){ ok = false; break; } }
    }
    if(ok) out.push(i);
  }
  return out;
}
export function anchorPriceOf(bar_, kind){ return kind == "low" ? bar_.low : bar_.high; }

// Intraday candles must really be intraday: a daily series stamped 09:15 would pass a grid check.
// Needs at least 3 same-day neighbouring candles exactly one timeframe apart.
export function intradayCheck(bars, tf){
  if(tf == "1D") return { ok:true };
  var t = TIMEFRAMES[tf];
  if(!t || !t.minutes) return { ok:false, code:"intraday_unavailable" };
  var good = 0;
  for(var i = 1; i < (bars || []).length; i++){
    if(bars[i].day == bars[i - 1].day && bars[i].startMs - bars[i - 1].startMs == t.minutes * 60000) good++;
  }
  return good >= 3 ? { ok:true, pairs:good } : { ok:false, code:"intraday_unavailable", pairs:good };
}

export function sideOf(close, level){
  if(!isNum(close) || !isNum(level)) return null;
  return close > level ? "above" : (close < level ? "below" : null);
}

// Anchor integrity: when the fetched candles include the anchor candle, its price must match.
export function anchorMatches(bars, line){
  for(var i = 0; i < bars.length; i++){
    if(bars[i].t == line.anchorT){
      var p = anchorPriceOf(bars[i], line.kind);
      return Math.abs(p - line.anchorPrice) <= line.anchorPrice * GANN.ANCHOR_TOL;
    }
  }
  return true;   // anchor older than the fetched window: it cannot be checked, the saved price is used
}

// Confirmed-close scan. bars: validated completed candles { t, startMs, endMs, close, ... } oldest
// first. st: { side, lastBarT, firedBarT } or null. mode "close" = only the crossing the line
// kind names (above for an upward line, below for a downward line); "any" = both.
// Returns { state, events:[{ bar, dir, level, bars }], suppressed, level, last }.
export function scanCloses(bars, line, st, mode){
  var s = { side:(st && st.side) || null, lastBarT:(st && st.lastBarT) || 0, firedBarT:(st && st.firedBarT) || null };
  var events = [], suppressed = 0, last = null, lastLevel = null;
  var elig = [];
  for(var i = 0; i < bars.length; i++){
    if(bars[i].t < line.anchorT) continue;                       // the line does not exist before its anchor
    elig.push(bars[i]);
  }
  if(!elig.length) return { state:s, events:events, suppressed:0, level:null, last:null, beforeAnchor:true };
  var fresh = elig.filter(function(b){ return b.t > s.lastBarT; });
  if(s.side == null){
    // first look: remember where price already is, never fire on it
    var nb = elig[elig.length - 1], lv = lineValueAt(line, nb.startMs);
    if(lv == null) return { state:s, events:events, suppressed:0, level:null, last:nb };
    s.side = sideOf(nb.close, lv); s.lastBarT = nb.t;
    return { state:s, events:events, suppressed:0, level:lv, last:nb, firstLook:true };
  }
  if(fresh.length > GANN.MAX_SCAN){
    var dropped = fresh.slice(0, fresh.length - GANN.MAX_SCAN), db = dropped[dropped.length - 1], dl = lineValueAt(line, db.startMs);
    var ds = dl != null ? sideOf(db.close, dl) : null;
    if(ds) s.side = ds;
    fresh = fresh.slice(fresh.length - GANN.MAX_SCAN);
  }
  for(var k = 0; k < fresh.length; k++){
    var b = fresh[k], level = lineValueAt(line, b.startMs);
    s.lastBarT = b.t; last = b; if(level != null) lastLevel = level;
    if(level == null) continue;
    var ns = sideOf(b.close, level);
    if(ns == null || ns == s.side) continue;                     // exactly on the line, or no side change
    var dir = ns == "above" ? "up" : "down";
    var wanted = mode == "any" || (line.kind == "low" && dir == "up") || (line.kind == "high" && dir == "down");
    s.side = ns;
    if(!wanted) continue;
    if(s.firedBarT != null){
      var gap = barsBetween(s.firedBarT * 1000, b.startMs, line.tf);
      if(gap != null && gap < GANN.COOLDOWN_BARS){ suppressed++; continue; }
    }
    s.firedBarT = b.t;
    events.push({ bar:b, dir:dir, level:level, bars:bar(line, b.startMs) });
  }
  return { state:s, events:events, suppressed:suppressed, level:lastLevel, last:last || elig[elig.length - 1] };
}

// Approach test against the live price and the line value at the bar the price is trading in.
// "beyond" means price is already past the line in the direction the alert waits for.
export function nearCheck(price, level, kind, mode, nearPct){
  if(!isNum(price) || !isNum(level) || !(level > 0)) return { ok:false };
  var dist = (price - level) / level * 100;
  var within = Math.abs(dist) <= nearPct;
  var beyond = false;
  if(mode != "any"){ beyond = kind == "low" ? price > level : price < level; }
  return { ok:true, distPct:dist, within:within, beyond:beyond };
}
