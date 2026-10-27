// BreakoutPro - src/alerts/alertCandles.js
// Candlestick pattern detection on COMPLETED candles only. Every pattern has a numeric
// definition (below) and needs enough clean OHLC history; otherwise it reports
// insufficient data instead of guessing. Educational signals, not trade advice.
// A candle is { t, o, h, l, c, v } with t = start time in ms. Oldest first; the LAST item
// is the candle being tested and must already be complete (the caller guarantees it).
// Rules: no backtick, no triple-equals, ASCII only.

export var MIN_CANDLES = 14;      // 10 for context averages + 3 pattern bars + 1 spare
var CONTEXT_BARS = 10;

export var DEFINITIONS = {
  doji:              "body <= 10% of range and range >= half the 10-bar average range",
  hammer:            "after a 3-bar fall: lower wick >= 2x body, upper wick <= 0.5x body, body in the top 40% of the range",
  shooting_star:     "after a 3-bar rise: upper wick >= 2x body, lower wick <= 0.5x body, body in the bottom 40% of the range",
  bullish_engulfing: "red bar then green bar whose body covers the red body, after a 3-bar fall",
  bearish_engulfing: "green bar then red bar whose body covers the green body, after a 3-bar rise",
  bullish_harami:    "large red bar then smaller green body fully inside it, after a 3-bar fall",
  bearish_harami:    "large green bar then smaller red body fully inside it, after a 3-bar rise",
  morning_star:      "long red bar, small body, then green close above the first bar midpoint, after a fall",
  evening_star:      "long green bar, small body, then red close below the first bar midpoint, after a rise"
};

function ok(c){
  if(!c) return false;
  var vals = [c.o, c.h, c.l, c.c];
  for(var i = 0; i < 4; i++){ if(typeof vals[i] != "number" || !isFinite(vals[i]) || vals[i] <= 0) return false; }
  if(c.h < Math.max(c.o, c.c) - 1e-9 || c.l > Math.min(c.o, c.c) + 1e-9) return false;
  return c.h > c.l;
}
function body(c){ return Math.abs(c.c - c.o); }
function range(c){ return c.h - c.l; }
function top(c){ return Math.max(c.o, c.c); }
function bot(c){ return Math.min(c.o, c.c); }
function green(c){ return c.c > c.o; }
function red(c){ return c.c < c.o; }

// True when the series is usable: enough bars, all clean, strictly increasing time.
export function validateSeries(candles){
  if(!Array.isArray(candles) || candles.length < MIN_CANDLES) return { ok:false, code:"insufficient_history", have:Array.isArray(candles) ? candles.length : 0, need:MIN_CANDLES };
  var from = candles.length - (CONTEXT_BARS + 4);
  if(from < 0) from = 0;
  for(var i = from; i < candles.length; i++){
    if(!ok(candles[i])) return { ok:false, code:"invalid_ohlc" };
    if(i > from && !(candles[i].t > candles[i - 1].t)) return { ok:false, code:"invalid_ohlc" };
  }
  return { ok:true };
}

function avgRange(candles, endIdx){
  var s = 0, n = 0;
  for(var i = Math.max(0, endIdx - CONTEXT_BARS + 1); i <= endIdx; i++){ s += range(candles[i]); n++; }
  return n ? s / n : 0;
}
// closes fell (or rose) over the three bars BEFORE index i
function priorTrend(candles, i){
  if(i < 4) return 0;
  var a = candles[i - 4].c, b = candles[i - 1].c;
  var steps = (candles[i - 1].c < candles[i - 2].c ? 1 : 0) + (candles[i - 2].c < candles[i - 3].c ? 1 : 0) + (candles[i - 3].c < candles[i - 4].c ? 1 : 0);
  if(b < a && steps >= 2) return -1;
  var up = (candles[i - 1].c > candles[i - 2].c ? 1 : 0) + (candles[i - 2].c > candles[i - 3].c ? 1 : 0) + (candles[i - 3].c > candles[i - 4].c ? 1 : 0);
  if(b > a && up >= 2) return 1;
  return 0;
}

// Returns an array of { id, direction:"up"|"down"|"neutral" } found on the LAST candle.
export function detectPatterns(candles){
  var v = validateSeries(candles);
  if(!v.ok) return { ok:false, code:v.code, found:[] };
  var i = candles.length - 1, c = candles[i], p1 = candles[i - 1], p2 = candles[i - 2];
  var found = [];
  var tr = priorTrend(candles, i);
  var ar = avgRange(candles, i - 1);
  var b = body(c), r = range(c);

  if(b <= 0.1 * r && r >= 0.5 * ar) found.push({ id:"doji", direction:"neutral" });

  if(tr < 0 && b >= 0.05 * r){
    var lw = bot(c) - c.l, uw = c.h - top(c);
    if(lw >= 2 * b && uw <= 0.5 * b && (bot(c) - c.l) / r >= 0.6) found.push({ id:"hammer", direction:"up" });
  }
  if(tr > 0 && b >= 0.05 * r){
    var lw2 = bot(c) - c.l, uw2 = c.h - top(c);
    if(uw2 >= 2 * b && lw2 <= 0.5 * b && (c.h - top(c)) / r >= 0.6) found.push({ id:"shooting_star", direction:"down" });
  }

  var pb = body(p1);
  var prevBig = pb >= 0.3 * range(p1);
  if(tr < 0 && red(p1) && green(c) && prevBig && c.c > p1.o && c.o < p1.c) found.push({ id:"bullish_engulfing", direction:"up" });
  if(tr > 0 && green(p1) && red(c) && prevBig && c.c < p1.o && c.o > p1.c) found.push({ id:"bearish_engulfing", direction:"down" });

  var big = pb >= 0.5 * range(p1) && pb >= 0.8 * (avgRange(candles, i - 1) * 0.5);
  var inside = top(c) < top(p1) && bot(c) > bot(p1) && b <= 0.5 * pb && b > 0;
  if(tr < 0 && red(p1) && green(c) && big && inside) found.push({ id:"bullish_harami", direction:"up" });
  if(tr > 0 && green(p1) && red(c) && big && inside) found.push({ id:"bearish_harami", direction:"down" });

  var t2 = priorTrend(candles, i - 1);
  var b2 = body(p2), mid2 = (p2.o + p2.c) / 2;
  var small = body(p1) <= 0.35 * b2;
  if(t2 < 0 && red(p2) && b2 >= 0.6 * range(p2) && small && p1.c < p2.c && green(c) && c.c > mid2) found.push({ id:"morning_star", direction:"up" });
  if(t2 > 0 && green(p2) && b2 >= 0.6 * range(p2) && small && p1.c > p2.c && red(c) && c.c < mid2) found.push({ id:"evening_star", direction:"down" });

  return { ok:true, found:found, candleTime:c.t };
}
