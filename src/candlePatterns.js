// BreakoutPro - candlePatterns.js
// ---------------------------------------------------------------------
// Reusable, deterministic candlestick-pattern detector.
//
// Pure OHLC arithmetic only - no ML model, no network/API call, no
// randomness, nothing hardcoded to "look right". Every candle handed in
// is evaluated against EXACT, named mathematical rules (see each check*
// function below) - a pattern is only ever returned when its real OHLC
// relationship actually satisfies those rules, measured against ATR(14)
// where the specification calls for a volatility-relative threshold
// instead of a fixed/approximate one. This file has NO opinion about
// where the candles came from - it works unmodified for any timeframe
// (1m/3m/5m/10m/15m/1H/1D/...) and for any symbol, live or preview, as
// long as it is handed an array of real {o,h,l,c} candles.
//
// Consumers (e.g. the Range Intelligence chart) call detectCandlePatterns
// once per candle array and get back every pattern that actually fired,
// each tagged with the exact candle index it belongs to - they do not
// duplicate any detection math of their own.
// ---------------------------------------------------------------------

// ---- tiny OHLC helpers -------------------------------------------------
function body(c){ return Math.abs(c.c - c.o); }
function fullRange(c){ return Math.max(0.0001, c.h - c.l); }
function upperWick(c){ return c.h - Math.max(c.o, c.c); }
function lowerWick(c){ return Math.min(c.o, c.c) - c.l; }
function bodyHigh(c){ return Math.max(c.o, c.c); }
function bodyLow(c){ return Math.min(c.o, c.c); }
function isBull(c){ return c.c > c.o; }
function isBear(c){ return c.c < c.o; }
function num(v){ return Math.round(v*100)/100; }
function timeOf(candle, index){ return (candle && candle.label) ? candle.label : ("#"+(index+1)); }
function clampConf(v){ return Math.max(50, Math.min(95, Math.round(v))); }

// ---------------------------------------------------------------------
// ATR(14) - Average True Range, the volatility yardstick every exact
// threshold below is measured against instead of a guessed/approximate
// percentage. True Range for a candle is the greatest of:
//   high - low
//   abs(high - previous close)
//   abs(low  - previous close)
// ATR at index i is the simple mean of the True Range values over the
// last 14 bars up to and including i - or however many bars actually
// exist yet, so the first candles of a short series still get a real
// (if narrower) estimate instead of null/undefined ("handle zero/invalid
// range safely", per spec). This is computed once per candle array and
// reused by every check below - one volatility measurement, not several.
// ---------------------------------------------------------------------
function trueRange(curr, prevClose){
  if(prevClose==null) return fullRange(curr);
  return Math.max(curr.h-curr.l, Math.abs(curr.h-prevClose), Math.abs(curr.l-prevClose), 0.0001);
}
function computeATR14(candles){
  var atr = [];
  var windowVals = [];
  for(var i=0;i<candles.length;i++){
    var prevClose = i>0 ? candles[i-1].c : null;
    var tr = trueRange(candles[i], prevClose);
    windowVals.push(tr);
    if(windowVals.length>14) windowVals.shift();
    var sum = 0;
    for(var k=0;k<windowVals.length;k++){ sum += windowVals[k]; }
    atr.push(sum/windowVals.length);
  }
  return atr;
}

// Local trend context, used ONLY to tell apart candles that have the exact
// same shape but opposite meaning depending on what came immediately
// before them (Hammer vs Hanging Man, Inverted Hammer vs Shooting Star) -
// exactly how classical candlestick theory itself defines the difference.
// Looks at the close `lookback` bars ago vs the close of the bar right
// before the candle being classified; needs real history to say anything,
// so callers skip classification when this returns null.
function priorTrend(candles, idx, lookback){
  lookback = lookback || 4;
  var start = idx - lookback;
  if(start < 0 || idx < 1) return null;
  return candles[idx-1].c - candles[start].c;
}

function describeCandle(c){
  return "Open " + num(c.o) + ", Close " + num(c.c) + " (" + (isBull(c) ? "bullish" : (isBear(c) ? "bearish" : "flat")) + ")";
}

// ---------------------------------------------------------------------
// Each check* function below takes the real candle(s) it needs (plus
// atr/trend context where the spec requires it) and returns either null
// (rule not satisfied) or { name, dir, reason, confidence }. `dir` is
// always one of "bull" | "bear" | "neutral". Confidence is always derived
// from the same measured ratio that decided the match (never a fixed or
// random number) and clamped to 50-95 so it never claims false certainty.
// ---------------------------------------------------------------------

function checkThreeWhiteSoldiers(c0, c1, c2){
  if(!(isBull(c0) && isBull(c1) && isBull(c2))) return null;
  var b0=body(c0), b1=body(c1), b2=body(c2);
  if(b0<=0 || b1<=0 || b2<=0) return null;
  if(!(c1.c>c0.c && c2.c>c1.c)) return null;             // progressively higher closes
  if(!(c1.o>=c0.o && c1.o<=c0.c)) return null;             // each opens inside the prior body
  if(!(c2.o>=c1.o && c2.o<=c1.c)) return null;
  if(upperWick(c1)>b1*0.5 || upperWick(c2)>b2*0.5) return null; // no long rejection wicks
  var r1=fullRange(c1), r2=fullRange(c2);
  if(b1<r1*0.45 || b2<r2*0.45) return null;                // solid bodies, not dojis
  var avgBodyRatio = ((b1/r1) + (b2/r2)) / 2;
  return {
    name:"Three White Soldiers", dir:"bull",
    reason:"Three consecutive rising green candles, each opening inside the previous body and closing higher (" + num(c0.c) + " -> " + num(c1.c) + " -> " + num(c2.c) + ") with small upper wicks. Therefore: Three White Soldiers.",
    confidence: clampConf(50 + avgBodyRatio*40)
  };
}

function checkThreeBlackCrows(c0, c1, c2){
  if(!(isBear(c0) && isBear(c1) && isBear(c2))) return null;
  var b0=body(c0), b1=body(c1), b2=body(c2);
  if(b0<=0 || b1<=0 || b2<=0) return null;
  if(!(c1.c<c0.c && c2.c<c1.c)) return null;
  if(!(c1.o<=c0.o && c1.o>=c0.c)) return null;
  if(!(c2.o<=c1.o && c2.o>=c1.c)) return null;
  if(lowerWick(c1)>b1*0.5 || lowerWick(c2)>b2*0.5) return null;
  var r1=fullRange(c1), r2=fullRange(c2);
  if(b1<r1*0.45 || b2<r2*0.45) return null;
  var avgBodyRatio = ((b1/r1) + (b2/r2)) / 2;
  return {
    name:"Three Black Crows", dir:"bear",
    reason:"Three consecutive falling red candles, each opening inside the previous body and closing lower (" + num(c0.c) + " -> " + num(c1.c) + " -> " + num(c2.c) + ") with small lower wicks. Therefore: Three Black Crows.",
    confidence: clampConf(50 + avgBodyRatio*40)
  };
}

function checkMorningStar(c0, c1, c2){
  var p2Body = body(c0), starBody = body(c1);
  if(p2Body<=0) return null;
  var mid = (c0.o + c0.c) / 2;
  if(!(isBear(c0) && starBody<=p2Body*0.45 && isBull(c2) && c2.c>mid && body(c2)>p2Body*0.5)) return null;
  var fraction = Math.min(1, Math.abs(c2.c-mid) / Math.max(0.0001, p2Body/2));
  return {
    name:"Morning Star", dir:"bull",
    reason:"Candle 1: " + describeCandle(c0) + ", large red body. Candle 2: small-bodied pause (" + num(starBody) + "). Candle 3: " + describeCandle(c2) + ", closes above the midpoint (" + num(mid) + ") of candle 1. Therefore: Morning Star.",
    confidence: clampConf(50 + fraction*40)
  };
}

function checkEveningStar(c0, c1, c2){
  var p2Body = body(c0), starBody = body(c1);
  if(p2Body<=0) return null;
  var mid = (c0.o + c0.c) / 2;
  if(!(isBull(c0) && starBody<=p2Body*0.45 && isBear(c2) && c2.c<mid && body(c2)>p2Body*0.5)) return null;
  var fraction = Math.min(1, Math.abs(c2.c-mid) / Math.max(0.0001, p2Body/2));
  return {
    name:"Evening Star", dir:"bear",
    reason:"Candle 1: " + describeCandle(c0) + ", large green body. Candle 2: small-bodied pause (" + num(starBody) + "). Candle 3: " + describeCandle(c2) + ", closes below the midpoint (" + num(mid) + ") of candle 1. Therefore: Evening Star.",
    confidence: clampConf(50 + fraction*40)
  };
}

// ---------------------------------------------------------------------
// Engulfing - EXACT rule: current REAL BODY must completely contain the
// previous REAL BODY (bodyHigh(curr)>=bodyHigh(prev) AND
// bodyLow(curr)<=bodyLow(prev)). This is real-body containment only -
// wicks are never part of the comparison, per spec item 7.
// ---------------------------------------------------------------------
function checkBullishEngulfing(prev, curr){
  if(!(isBear(prev) && isBull(curr))) return null;
  var prevBody = body(prev);
  if(prevBody<=0) return null;
  if(!(bodyHigh(curr)>=bodyHigh(prev) && bodyLow(curr)<=bodyLow(prev))) return null;
  var ratio = body(curr)/prevBody;
  return {
    name:"Bullish Engulfing", dir:"bull",
    reason:"Previous candle: " + describeCandle(prev) + ". Current candle: " + describeCandle(curr) + " - current real body (" + num(bodyLow(curr)) + " to " + num(bodyHigh(curr)) + ") completely contains the prior real body (" + num(bodyLow(prev)) + " to " + num(bodyHigh(prev)) + "). Therefore: Bullish Engulfing.",
    confidence: clampConf(50 + (ratio-1)*40)
  };
}

function checkBearishEngulfing(prev, curr){
  if(!(isBull(prev) && isBear(curr))) return null;
  var prevBody = body(prev);
  if(prevBody<=0) return null;
  if(!(bodyHigh(curr)>=bodyHigh(prev) && bodyLow(curr)<=bodyLow(prev))) return null;
  var ratio = body(curr)/prevBody;
  return {
    name:"Bearish Engulfing", dir:"bear",
    reason:"Previous candle: " + describeCandle(prev) + ". Current candle: " + describeCandle(curr) + " - current real body (" + num(bodyLow(curr)) + " to " + num(bodyHigh(curr)) + ") completely contains the prior real body (" + num(bodyLow(prev)) + " to " + num(bodyHigh(prev)) + "). Therefore: Bearish Engulfing.",
    confidence: clampConf(50 + (ratio-1)*40)
  };
}

function checkPiercingLine(prev, curr){
  if(!(isBear(prev) && isBull(curr))) return null;
  var prevMid = (prev.o + prev.c) / 2;
  if(!(curr.o < prev.c)) return null;
  if(!(curr.c > prevMid && curr.c < prev.o)) return null;
  var halfBody = Math.max(0.0001, Math.abs(prev.o-prev.c)/2);
  var fraction = Math.min(1, (curr.c-prevMid)/halfBody);
  return {
    name:"Piercing Line", dir:"bull",
    reason:"Previous candle: " + describeCandle(prev) + ". Current candle opens below the prior close at " + num(curr.o) + " and closes at " + num(curr.c) + ", more than halfway up the prior red body (midpoint " + num(prevMid) + ") but below the prior open. Therefore: Piercing Line.",
    confidence: clampConf(50 + fraction*40)
  };
}

function checkDarkCloudCover(prev, curr){
  if(!(isBull(prev) && isBear(curr))) return null;
  var prevMid = (prev.o + prev.c) / 2;
  if(!(curr.o > prev.c)) return null;
  if(!(curr.c < prevMid && curr.c > prev.o)) return null;
  var halfBody = Math.max(0.0001, Math.abs(prev.o-prev.c)/2);
  var fraction = Math.min(1, (prevMid-curr.c)/halfBody);
  return {
    name:"Dark Cloud Cover", dir:"bear",
    reason:"Previous candle: " + describeCandle(prev) + ". Current candle opens above the prior close at " + num(curr.o) + " and closes at " + num(curr.c) + ", more than halfway down the prior green body (midpoint " + num(prevMid) + ") but above the prior open. Therefore: Dark Cloud Cover.",
    confidence: clampConf(50 + fraction*40)
  };
}

// ---------------------------------------------------------------------
// Doji - EXACT rule: bodyPct <= 0.10 AND range >= 0.25 * ATR(14). The
// second clause is the one that stops a candle with almost no range at
// all (not just a small body) from being called a Doji purely because
// its body happens to be tiny too - per spec item 3.
// ---------------------------------------------------------------------
function checkDoji(curr, atrVal){
  var b = body(curr), r = fullRange(curr);
  var bodyPct = b/r;
  if(bodyPct > 0.10) return null;
  if(r < 0.25*atrVal) return null;
  return {
    name:"Doji", dir:"neutral",
    reason:"Open " + num(curr.o) + " and close " + num(curr.c) + " are nearly equal - body is only " + Math.round(bodyPct*100) + "% of a " + num(r) + "-wide range, and that range still clears the 0.25x ATR(14) noise floor (ATR " + num(atrVal) + "). Therefore: Doji (indecision).",
    confidence: clampConf(95 - bodyPct*450)
  };
}

// Spinning Top - not covered by an exact threshold in the specification;
// kept as the existing neutral small-body/both-long-wicks shape, checked
// at its explicit priority (5) below Hammer-family and Harami.
function checkSpinningTop(curr){
  var b = body(curr), r = fullRange(curr);
  var uw = upperWick(curr), lw = lowerWick(curr);
  if(b<=0) return null;
  if(!(b<=r*0.35 && uw>=b*0.8 && lw>=b*0.8)) return null;
  return {
    name:"Spinning Top", dir:"neutral",
    reason:"Small body (" + num(b) + ") with an upper wick of " + num(uw) + " and a lower wick of " + num(lw) + " on both sides of similar size - neither buyers nor sellers controlled the candle. Therefore: Spinning Top.",
    confidence: clampConf(50 + (Math.min(uw,lw)/b)*8)
  };
}

// ---------------------------------------------------------------------
// Hammer / Hanging Man / Inverted Hammer / Shooting Star - ONE shared
// geometry check using the EXACT thresholds from the specification:
//   bodyPct <= 0.40
//   range   >= 0.50 * ATR(14)
//   long-wick side  >= 2.0 * body
//   short-wick side <= 0.30 * body
// The two long-lower-wick / long-upper-wick shapes are mutually
// exclusive by construction (a candle cannot satisfy both at once), so
// each candle can only ever match ONE of the four names here - "do not
// duplicate the same candle into contradictory pattern labels" (spec
// item 6). Which of the two possible names applies is then decided by
// `trend` (priorTrend()); null trend (not enough history) means the
// candle is left unclassified rather than guessed.
// ---------------------------------------------------------------------
function checkHammerFamily(curr, atrVal, trend){
  var b = body(curr), r = fullRange(curr);
  if(b<=0) return null;
  var bodyPct = b/r;
  if(bodyPct>0.40) return null;
  if(r < 0.50*atrVal) return null;
  if(trend==null) return null;
  var uw = upperWick(curr), lw = lowerWick(curr);

  if(lw>=2.0*b && uw<=0.30*b){
    var ratioL = lw/b;
    if(trend<0){
      return {
        name:"Hammer", dir:"bull",
        reason:"After a recent decline, this candle has bodyPct " + Math.round(bodyPct*100) + "% (<=40%), a lower wick " + num(lw) + " (>=2.0x body) and an upper wick " + num(uw) + " (<=0.30x body), with range " + num(r) + " clearing 0.50x ATR(14) (" + num(atrVal) + "). Therefore: Hammer.",
        confidence: clampConf(40 + (ratioL-2)*15)
      };
    }
    return {
      name:"Hanging Man", dir:"bear",
      reason:"After a recent advance, this candle has the identical Hammer geometry (bodyPct " + Math.round(bodyPct*100) + "%, lower wick " + num(lw) + " >=2.0x body, upper wick " + num(uw) + " <=0.30x body, range clearing 0.50x ATR) - the same shape appearing in an uptrend turns it bearish. Therefore: Hanging Man.",
      confidence: clampConf(40 + (ratioL-2)*15)
    };
  }

  if(uw>=2.0*b && lw<=0.30*b){
    var ratioU = uw/b;
    if(trend<0){
      return {
        name:"Inverted Hammer", dir:"bull",
        reason:"After a recent decline, this candle has bodyPct " + Math.round(bodyPct*100) + "% (<=40%), an upper wick " + num(uw) + " (>=2.0x body) and a lower wick " + num(lw) + " (<=0.30x body), with range " + num(r) + " clearing 0.50x ATR(14) (" + num(atrVal) + "). Therefore: Inverted Hammer.",
        confidence: clampConf(40 + (ratioU-2)*15)
      };
    }
    return {
      name:"Shooting Star", dir:"bear",
      reason:"After a recent advance, this candle has the identical Inverted-Hammer geometry (bodyPct " + Math.round(bodyPct*100) + "%, upper wick " + num(uw) + " >=2.0x body, lower wick " + num(lw) + " <=0.30x body, range clearing 0.50x ATR) - the same shape appearing in an uptrend turns it bearish. Therefore: Shooting Star.",
      confidence: clampConf(40 + (ratioU-2)*15)
    };
  }
  return null;
}

// ---------------------------------------------------------------------
// Harami - EXACT rule: current REAL BODY completely INSIDE the previous
// REAL BODY (the reverse containment of Engulfing, never confused with
// it - spec item 8).
// ---------------------------------------------------------------------
function checkBullishHarami(prev, curr){
  if(!(isBear(prev) && isBull(curr))) return null;
  var prevBody = body(prev), currBody = body(curr);
  if(prevBody<=0 || currBody<=0) return null;
  if(!(bodyHigh(curr)<=bodyHigh(prev) && bodyLow(curr)>=bodyLow(prev))) return null;
  if(bodyHigh(curr)==bodyHigh(prev) && bodyLow(curr)==bodyLow(prev)) return null; // not identical/engulfing-equal
  var ratio = 1 - (currBody/prevBody);
  return {
    name:"Bullish Harami", dir:"bull",
    reason:"Previous candle: " + describeCandle(prev) + ", a red body. Current candle's real body (" + num(bodyLow(curr)) + " to " + num(bodyHigh(curr)) + ") sits completely inside the prior real body (" + num(bodyLow(prev)) + " to " + num(bodyHigh(prev)) + ") - selling pressure has stalled. Therefore: Bullish Harami.",
    confidence: clampConf(50 + ratio*40)
  };
}

function checkBearishHarami(prev, curr){
  if(!(isBull(prev) && isBear(curr))) return null;
  var prevBody = body(prev), currBody = body(curr);
  if(prevBody<=0 || currBody<=0) return null;
  if(!(bodyHigh(curr)<=bodyHigh(prev) && bodyLow(curr)>=bodyLow(prev))) return null;
  if(bodyHigh(curr)==bodyHigh(prev) && bodyLow(curr)==bodyLow(prev)) return null;
  var ratio = 1 - (currBody/prevBody);
  return {
    name:"Bearish Harami", dir:"bear",
    reason:"Previous candle: " + describeCandle(prev) + ", a green body. Current candle's real body (" + num(bodyLow(curr)) + " to " + num(bodyHigh(curr)) + ") sits completely inside the prior real body (" + num(bodyLow(prev)) + " to " + num(bodyHigh(prev)) + ") - buying pressure has stalled. Therefore: Bearish Harami.",
    confidence: clampConf(50 + ratio*40)
  };
}

// ---------------------------------------------------------------------
// Structural swing patterns - Double Bottom ("W Pattern") and Double Top
// ("M Pattern"). These look at the SHAPE of many candles at once (real
// swing highs/lows) and are only ever reported once actually CONFIRMED
// by a later breakout close - EXACT rule, per spec items 9-11:
//
//   - swing confirmation: exactly 2 candles to the left AND 2 to the
//     right (SWING_N = 2)
//   - the two swing lows/highs must be within 1.0% of each other,
//     measured as abs(v1-v2)/min(v1,v2) <= 0.01 (NOT 1.5%)
//   - the neckline (middle rally/pullback) must clear the swing extreme
//     by at least 1.0 x ATR(14), measured in absolute price, not a
//     relative percentage
//   - confirmation requires a later CLOSE beyond the neckline by at
//     least max(0.10% of the neckline price, 0.25 x ATR(14))
//   - the confirming close must occur within 40 candles of the second
//     swing (SWING_CONFIRM_WINDOW); otherwise the structure is left
//     UNCONFIRMED and never reported as a pattern/marker/count.
// ---------------------------------------------------------------------
var SWING_N = 2;                // exactly 2 candles left / 2 candles right
var SWING_TOLERANCE = 0.01;     // 1.0% max difference between the two swings
var SWING_MIN_GAP = 5;          // minimum bars between the two swings (noise guard)
var SWING_CONFIRM_WINDOW = 40;  // bars to look ahead for the confirming close

function findSwingLows(candles){
  var out = [];
  for(var i=SWING_N; i<candles.length-SWING_N; i++){
    var isLow = true;
    for(var k=i-SWING_N; k<=i+SWING_N; k++){
      if(k!=i && candles[k].l<=candles[i].l){ isLow=false; break; }
    }
    if(isLow) out.push(i);
  }
  return out;
}
function findSwingHighs(candles){
  var out = [];
  for(var i=SWING_N; i<candles.length-SWING_N; i++){
    var isHigh = true;
    for(var k=i-SWING_N; k<=i+SWING_N; k++){
      if(k!=i && candles[k].h>=candles[i].h){ isHigh=false; break; }
    }
    if(isHigh) out.push(i);
  }
  return out;
}
function highestBetween(candles, i1, i2){
  var hi = -Infinity, hiIdx = i1;
  for(var i=i1; i<=i2; i++){ if(candles[i].h>hi){ hi=candles[i].h; hiIdx=i; } }
  return { idx:hiIdx, v:hi };
}
function lowestBetween(candles, i1, i2){
  var lo = Infinity, loIdx = i1;
  for(var i=i1; i<=i2; i++){ if(candles[i].l<lo){ lo=candles[i].l; loIdx=i; } }
  return { idx:loIdx, v:lo };
}

function detectDoubleBottoms(candles, atr){
  var lows = findSwingLows(candles);
  var out = [];
  var usedUntil = -1;
  for(var a=0; a<lows.length; a++){
    for(var b=a+1; b<lows.length; b++){
      var i1 = lows[a], i2 = lows[b];
      if(i2-i1 < SWING_MIN_GAP) continue;
      if(i1 <= usedUntil) continue;
      var L1 = candles[i1].l, L2 = candles[i2].l;
      var minL = Math.min(L1, L2);
      if(minL<=0) continue;
      if(Math.abs(L1-L2)/minL > SWING_TOLERANCE) continue;      // exact 1.0% rule
      var neck = highestBetween(candles, i1, i2);
      var atrAtSecond = atr[i2];
      if((neck.v - Math.max(L1,L2)) < 1.0*atrAtSecond) continue; // exact 1.0x ATR depth rule
      // Confirmation: a later CLOSE must break back ABOVE the neckline by
      // at least max(0.10% of neckline, 0.25 x ATR(14)) measured at the
      // candle being tested.
      var confirmIdx = -1;
      var searchEnd = Math.min(candles.length-1, i2+SWING_CONFIRM_WINDOW);
      for(var j=i2+1; j<=searchEnd; j++){
        var thresh = Math.max(neck.v*0.0010, 0.25*atr[j]);
        if(candles[j].c > neck.v + thresh){ confirmIdx = j; break; }
      }
      if(confirmIdx<0) continue; // unconfirmed - never reported, per spec item 9
      var similarity = 1 - Math.min(1, (Math.abs(L1-L2)/minL)/SWING_TOLERANCE);
      var marginAtConfirm = Math.max(0.0001, neck.v*0.0010);
      var breakoutStrength = Math.min(1, (candles[confirmIdx].c-neck.v)/marginAtConfirm);
      out.push({
        index: confirmIdx,
        time: timeOf(candles[confirmIdx], confirmIdx),
        name:"W Pattern", dir:"bull",
        reason:"Two swing lows confirmed with exactly 2 candles on each side (" + num(L1) + " at " + timeOf(candles[i1],i1) + ", " + num(L2) + " at " + timeOf(candles[i2],i2) + "), within 1.0% of each other. Neckline at " + num(neck.v) + " clears both lows by at least 1.0x ATR(14) (" + num(atrAtSecond) + "). Price has now closed at " + num(candles[confirmIdx].c) + ", beyond the neckline by more than max(0.10% of neckline, 0.25x ATR) within the 40-candle confirmation window. Therefore: W Pattern - Double Bottom (confirmed).",
        confidence: clampConf(50 + ((similarity+breakoutStrength)/2)*40)
      });
      usedUntil = confirmIdx;
      break;
    }
  }
  return out;
}

function detectDoubleTops(candles, atr){
  var highs = findSwingHighs(candles);
  var out = [];
  var usedUntil = -1;
  for(var a=0; a<highs.length; a++){
    for(var b=a+1; b<highs.length; b++){
      var i1 = highs[a], i2 = highs[b];
      if(i2-i1 < SWING_MIN_GAP) continue;
      if(i1 <= usedUntil) continue;
      var H1 = candles[i1].h, H2 = candles[i2].h;
      var minH = Math.min(H1, H2);
      if(minH<=0) continue;
      if(Math.abs(H1-H2)/minH > SWING_TOLERANCE) continue;      // exact 1.0% rule
      var trough = lowestBetween(candles, i1, i2);
      var atrAtSecond = atr[i2];
      if((Math.min(H1,H2) - trough.v) < 1.0*atrAtSecond) continue; // exact 1.0x ATR depth rule
      // Confirmation: a later CLOSE must break back BELOW the trough by
      // at least max(0.10% of trough, 0.25 x ATR(14)) measured at the
      // candle being tested.
      var confirmIdx = -1;
      var searchEnd = Math.min(candles.length-1, i2+SWING_CONFIRM_WINDOW);
      for(var j=i2+1; j<=searchEnd; j++){
        var thresh = Math.max(trough.v*0.0010, 0.25*atr[j]);
        if(candles[j].c < trough.v - thresh){ confirmIdx = j; break; }
      }
      if(confirmIdx<0) continue; // unconfirmed - never reported, per spec item 10
      var similarity = 1 - Math.min(1, (Math.abs(H1-H2)/minH)/SWING_TOLERANCE);
      var marginAtConfirm = Math.max(0.0001, trough.v*0.0010);
      var breakoutStrength = Math.min(1, (trough.v-candles[confirmIdx].c)/marginAtConfirm);
      out.push({
        index: confirmIdx,
        time: timeOf(candles[confirmIdx], confirmIdx),
        name:"M Pattern", dir:"bear",
        reason:"Two swing highs confirmed with exactly 2 candles on each side (" + num(H1) + " at " + timeOf(candles[i1],i1) + ", " + num(H2) + " at " + timeOf(candles[i2],i2) + "), within 1.0% of each other. Trough at " + num(trough.v) + " clears both highs by at least 1.0x ATR(14) (" + num(atrAtSecond) + "). Price has now closed at " + num(candles[confirmIdx].c) + ", below the trough by more than max(0.10% of trough, 0.25x ATR) within the 40-candle confirmation window. Therefore: M Pattern - Double Top (confirmed).",
        confidence: clampConf(50 + ((similarity+breakoutStrength)/2)*40)
      });
      usedUntil = confirmIdx;
      break;
    }
  }
  return out;
}

// Short on-chart marker codes for every pattern name this module can
// return - single shared source so the chart markers and anything else
// that labels a pattern compactly never invent their own abbreviation.
export var PATTERN_SHORT_CODE = {
  "Doji":"D", "Spinning Top":"ST", "Hammer":"H", "Inverted Hammer":"IH",
  "Shooting Star":"SS", "Hanging Man":"HM",
  "Bullish Engulfing":"BE", "Bearish Engulfing":"BEAR-E",
  "Bullish Harami":"HAR", "Bearish Harami":"HAR",
  "Morning Star":"MS", "Evening Star":"ES",
  "Piercing Line":"PL", "Dark Cloud Cover":"DCC",
  "Three White Soldiers":"3WS", "Three Black Crows":"3BC",
  "W Pattern":"W", "M Pattern":"M"
};

// Every pattern name this module can ever return, in a stable display
// order - used to build the "0 occurrences" rows the Daily Pattern Count
// requirement calls for (a pattern that never fired must still show 0,
// never be silently omitted).
export var ALL_PATTERN_NAMES = [
  "Doji", "Hammer", "Inverted Hammer", "Shooting Star", "Hanging Man", "Spinning Top",
  "Bullish Engulfing", "Bearish Engulfing", "Bullish Harami", "Bearish Harami",
  "Morning Star", "Evening Star", "Piercing Line", "Dark Cloud Cover",
  "Three White Soldiers", "Three Black Crows", "W Pattern", "M Pattern"
];

// ---------------------------------------------------------------------
// Deterministic priority / deduplication table (spec item 12): when more
// than one rule fires on the SAME candle index, this table - not
// detection order - decides which single label that candle gets. Lower
// number wins. This is also how a structural W/M result is weighed
// against whatever single/multi-candle match independently landed on its
// own confirmation candle, instead of structural patterns automatically
// overriding everything.
// ---------------------------------------------------------------------
// Priority 5 ("Doji subtypes" in the specification - e.g. Dragonfly/
// Gravestone/Long-Legged Doji) is intentionally left with no pattern
// mapped to it: this module does not implement those Doji subtypes
// separately from the standard Doji below, so no candidate can ever
// claim that rank. Spinning Top is a distinct shape (not a Doji subtype)
// and is grouped with the other lower-priority single-candle patterns at
// rank 7, so a genuine standard Doji (rank 6) is never masked by it.
var PATTERN_PRIORITY = {
  "Bullish Engulfing":1, "Bearish Engulfing":1,
  "W Pattern":2, "M Pattern":2,
  "Hammer":3, "Hanging Man":3, "Inverted Hammer":3, "Shooting Star":3,
  "Bullish Harami":4, "Bearish Harami":4,
  "Doji":6,
  "Spinning Top":7, "Morning Star":7, "Evening Star":7, "Piercing Line":7,
  "Dark Cloud Cover":7, "Three White Soldiers":7, "Three Black Crows":7
};

// ---------------------------------------------------------------------
// detectCandlePatterns(candles) - the single reusable entry point.
//
// Pass 1: every check runs against every candle it applies to (ATR(14)
// is computed once up front and handed to the checks that need it), and
// EVERY match is kept as a candidate for its candle index - not just the
// first one found - so overlapping rules are possible to detect.
//
// Pass 2: structural W/M results (confirmed only, per the rules above)
// are added as further candidates at their confirmation index.
//
// Pass 3: for every index with more than one candidate, the explicit
// PATTERN_PRIORITY table above - not detection order and not a blanket
// "structural wins" rule - decides the single label reported for that
// candle. Indices with only one candidate keep it unchanged. This keeps
// one marker per candle (spec item 6's "do not overcrowd the chart")
// while staying deterministic and auditable.
// ---------------------------------------------------------------------
export function detectCandlePatterns(candles){
  var out = [];
  if(!candles || !candles.length) return out;
  var atr = computeATR14(candles);
  var candidatesByIndex = {};

  function add(i, hit){
    if(!hit) return;
    if(!candidatesByIndex[i]) candidatesByIndex[i] = [];
    candidatesByIndex[i].push(hit);
  }

  for(var i=0; i<candles.length; i++){
    var curr = candles[i];
    var prev = i>=1 ? candles[i-1] : null;
    var prev2 = i>=2 ? candles[i-2] : null;
    var atrVal = atr[i];

    if(prev2 && prev){
      add(i, checkThreeWhiteSoldiers(prev2, prev, curr));
      add(i, checkThreeBlackCrows(prev2, prev, curr));
      add(i, checkMorningStar(prev2, prev, curr));
      add(i, checkEveningStar(prev2, prev, curr));
    }
    if(prev){
      add(i, checkBullishEngulfing(prev, curr));
      add(i, checkBearishEngulfing(prev, curr));
      add(i, checkPiercingLine(prev, curr));
      add(i, checkDarkCloudCover(prev, curr));
      add(i, checkBullishHarami(prev, curr));
      add(i, checkBearishHarami(prev, curr));
    }
    add(i, checkDoji(curr, atrVal));
    add(i, checkHammerFamily(curr, atrVal, priorTrend(candles, i, 4)));
    add(i, checkSpinningTop(curr));
  }

  // Structural W/M - confirmed-only results, merged as additional
  // candidates at their confirmation candle's index.
  detectDoubleBottoms(candles, atr).forEach(function(p){ add(p.index, p); });
  detectDoubleTops(candles, atr).forEach(function(p){ add(p.index, p); });

  Object.keys(candidatesByIndex).forEach(function(key){
    var idx = parseInt(key, 10);
    var list = candidatesByIndex[idx];
    var best = list[0];
    for(var j=1; j<list.length; j++){
      var rankA = PATTERN_PRIORITY[list[j].name] || 9;
      var rankB = PATTERN_PRIORITY[best.name] || 9;
      if(rankA < rankB) best = list[j];
    }
    out.push({
      index: idx,
      time: timeOf(candles[idx], idx),
      name: best.name,
      dir: best.dir,
      reason: best.reason,
      confidence: best.confidence
    });
  });

  out.sort(function(a,b){ return a.index-b.index; });
  return out;
}

// ---------------------------------------------------------------------
// summarizePatterns(candles) - the single aggregation point the Range
// Intelligence UI reads for everything pattern-related: the full detected
// list (for chart markers), per-pattern counts for the loaded dataset
// (every known pattern name included, 0 if it never fired), the most
// recently detected pattern (for "Current Pattern"), and the last-seen
// time per pattern name (for the summary table's "Latest" column). Built
// directly on top of detectCandlePatterns() - nothing here recomputes a
// pattern independently, and every other consumer (chart markers,
// current/latest pattern, daily counts, the summary panel, the docked
// bar, the pattern detail popover) reads this same result - spec item 17.
// ---------------------------------------------------------------------
export function summarizePatterns(candles){
  var all = detectCandlePatterns(candles);
  var counts = {}, latest = {};
  ALL_PATTERN_NAMES.forEach(function(n){ counts[n]=0; latest[n]=null; });
  all.forEach(function(p){
    if(!(p.name in counts)){ counts[p.name]=0; }
    counts[p.name] = (counts[p.name]||0) + 1;
    latest[p.name] = p.time;
  });
  var current = all.length ? all[all.length-1] : null;
  return {
    all: all,
    counts: counts,
    latest: latest,
    current: current,
    totalCandles: candles ? candles.length : 0
  };
}

// Convenience lookup for a single exact candle index (used by the chart's
// hover tooltip, which already knows exactly which bar is under the
// pointer) - same detector, same rules, just filtered to one index so
// callers never re-implement any of the matching logic themselves.
export function patternAt(candles, index){
  var all = detectCandlePatterns(candles);
  for(var i=0; i<all.length; i++){
    if(all[i].index==index) return all[i];
  }
  return null;
}
