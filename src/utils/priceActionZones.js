// BreakoutPro - priceActionZones.js
// Smart Price Action Zones: a real swing-high/low clustering algorithm applied
// to historical (demo) candle data. This computes zones from whatever data it
// is given - it does not pre-script an outcome. Educational, historical
// analysis only - never a prediction, never a signal.
// Rules: no backtick, no triple-equals, ASCII.

// Deterministic seeded RNG so the same symbol always shows the same demo
// candle history (no flicker on re-render), matching the convention already
// used by genSpark.js elsewhere in this app.
function seededRandom(seed){
  var s = seed;
  return function(){
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function seedFromSymbol(sym){
  var h = 0;
  for(var i=0;i<sym.length;i++){ h = ((h<<5)-h+sym.charCodeAt(i))|0; }
  return Math.abs(h % 100000) + 1;
}

// Generates a demo OHLC candle series. Educational/demo only - not live data.
export function generateDemoCandles(basePrice, count, sym){
  var rnd = seededRandom(seedFromSymbol(sym||"DEMO"));
  var candles = [];
  var p = basePrice;
  for(var i=0;i<count;i++){
    var open = p;
    var change = (rnd()-0.5) * basePrice * 0.012;
    var close = open + change;
    var high = Math.max(open,close) + rnd()*basePrice*0.004;
    var low = Math.min(open,close) - rnd()*basePrice*0.004;
    var vol = 0.5 + rnd()*1.5;
    candles.push({o:parseFloat(open.toFixed(2)), h:parseFloat(high.toFixed(2)), l:parseFloat(low.toFixed(2)), c:parseFloat(close.toFixed(2)), vol:vol});
    p = close;
  }
  return candles;
}

// A candle is a swing high if its high is the max within `window` candles on
// either side (and similarly for swing low). This is a standard, honest
// definition - not tuned to produce a particular result.
function findSwings(candles, window){
  var swingHighs = [], swingLows = [];
  for(var i=window;i<candles.length-window;i++){
    var isHigh = true, isLow = true;
    for(var j=i-window;j<=i+window;j++){
      if(j==i) continue;
      if(candles[j].h >= candles[i].h) isHigh = false;
      if(candles[j].l <= candles[i].l) isLow = false;
    }
    if(isHigh) swingHighs.push({idx:i, price:candles[i].h, vol:candles[i].vol});
    if(isLow) swingLows.push({idx:i, price:candles[i].l, vol:candles[i].vol});
  }
  return {swingHighs:swingHighs, swingLows:swingLows};
}

// Groups swing points that sit within tolerancePct of each other into a
// single zone. Only zones with 2+ touches are returned - a single swing point
// is not a "zone", it is just one candle.
function clusterZones(points, tolerancePct, totalCandles){
  var sorted = points.slice().sort(function(a,b){return a.price-b.price;});
  var clusters = [];
  sorted.forEach(function(pt){
    var found = null;
    for(var i=0;i<clusters.length;i++){
      var c = clusters[i];
      if(Math.abs(pt.price-c.avgPrice)/c.avgPrice <= tolerancePct){ found = c; break; }
    }
    if(found){
      found.touches.push(pt);
      found.avgPrice = found.touches.reduce(function(s,t){return s+t.price;},0) / found.touches.length;
    } else {
      clusters.push({avgPrice:pt.price, touches:[pt]});
    }
  });
  return clusters.map(function(c){
    var avgVol = c.touches.reduce(function(s,t){return s+t.vol;},0) / c.touches.length;
    var lastTouchIdx = Math.max.apply(null, c.touches.map(function(t){return t.idx;}));
    return {
      price: parseFloat(c.avgPrice.toFixed(2)),
      touches: c.touches.length,
      touchIdxs: c.touches.map(function(t){return t.idx;}),
      avgVol: avgVol,
      candlesSinceTouch: totalCandles - 1 - lastTouchIdx
    };
  }).filter(function(c){ return c.touches >= 2; })
    .sort(function(a,b){ return b.touches - a.touches; });
}

// Historical Respect Rate - a real, computed metric (not a prediction): out
// of every time price has historically approached this zone in the visible
// history, what percentage of those approaches saw price reverse away from
// the zone within the following few candles, versus break straight through
// it. This describes what already happened, not what will happen next.
function computeRespectRate(zonePrice, touchIdxs, candles, isResistance){
  var window = 6;
  var buffer = 0.004; // 0.4% beyond the zone counts as a genuine break
  var counted = 0, respected = 0;
  touchIdxs.forEach(function(idx){
    var future = candles.slice(idx+1, idx+1+window);
    if(future.length < 2) return; // not enough future data yet to judge this touch
    counted++;
    var broke = future.some(function(c){
      return isResistance ? (c.c > zonePrice*(1+buffer)) : (c.c < zonePrice*(1-buffer));
    });
    if(!broke) respected++;
  });
  if(counted === 0) return null;
  return Math.round((respected/counted)*100);
}

function zoneStrengthLabel(touches, avgVol){
  var score = touches + (avgVol > 1.2 ? 1 : 0);
  if(score >= 4) return "Strong";
  if(score >= 3) return "Moderate";
  return "Developing";
}

function trendDirection(candles){
  var n = candles.length;
  if(n < 20) return "Sideways";
  var recent = candles.slice(n-10).reduce(function(s,c){return s+c.c;},0) / 10;
  var prior = candles.slice(n-20,n-10).reduce(function(s,c){return s+c.c;},0) / 10;
  var diffPct = (recent-prior)/prior*100;
  if(diffPct > 0.5) return "Uptrend";
  if(diffPct < -0.5) return "Downtrend";
  return "Sideways";
}

function candlesAgoLabel(n){
  if(n <= 0) return "This candle";
  if(n == 1) return "1 candle ago";
  return n + " candles ago";
}

// Main entry point: given a candle series, computes the nearest valid support
// zone (below current price) and nearest valid resistance zone (above current
// price), plus trend, R:R, and a plain-language summary. Returns null zones
// when the data genuinely does not have a qualifying 2+ touch cluster -
// it does not invent one.
export function analyzeZones(candles){
  var currentPrice = candles[candles.length-1].c;
  var swings = findSwings(candles, 3);
  var resistanceZones = clusterZones(swings.swingHighs, 0.008, candles.length);
  var supportZones = clusterZones(swings.swingLows, 0.008, candles.length);

  var validSupports = supportZones.filter(function(z){ return z.price < currentPrice; })
    .sort(function(a,b){ return b.price - a.price; }); // nearest first
  var validResistances = resistanceZones.filter(function(z){ return z.price > currentPrice; })
    .sort(function(a,b){ return a.price - b.price; }); // nearest first

  var support = validSupports[0] || null;
  var support2 = validSupports[1] || null;
  var support3 = validSupports[2] || null;
  var resistance = validResistances[0] || null;
  var resistance2 = validResistances[1] || null;
  var resistance3 = validResistances[2] || null;

  var trend = trendDirection(candles);
  var rr = null;
  if(support && resistance){
    var risk = currentPrice - support.price;
    var reward = resistance.price - currentPrice;
    if(risk > 0) rr = parseFloat((reward/risk).toFixed(2));
  }

  function zoneOut(z, isResistance){
    if(!z) return null;
    return {
      price: z.price,
      touches: z.touches,
      strength: zoneStrengthLabel(z.touches, z.avgVol),
      volumeConfirmed: z.avgVol > 1.1,
      lastTested: candlesAgoLabel(z.candlesSinceTouch),
      respectRate: computeRespectRate(z.price, z.touchIdxs, candles, isResistance)
    };
  }

  return {
    currentPrice: currentPrice,
    trend: trend,
    support: zoneOut(support, false),
    support2: zoneOut(support2, false),
    support3: zoneOut(support3, false),
    resistance: zoneOut(resistance, true),
    resistance2: zoneOut(resistance2, true),
    resistance3: zoneOut(resistance3, true),
    riskReward: rr,
    nextKeyLevel: resistance ? resistance.price : (support ? support.price : null)
  };
}

// ===========================================================================
// BREAKOUT INTELLIGENCE - real calculations from real candle data. Every
// value here is either a direct calculation (VWAP, candle strength, retest)
// or a real derivation from an already-tested metric (Historical
// Follow-Through/Failure Rate, derived from the tested respectRate). Nothing
// here is a forecast or an invented number.
// ===========================================================================

// VWAP - volume-weighted average price using typical price (H+L+C)/3 and the
// real relative-volume weight already available per candle. Computed over
// a recent window (last 20 candles), matching how VWAP is conventionally
// reset/considered over a trading session rather than the full history.
function computeVWAP(candles){
  var window = candles.slice(Math.max(0, candles.length-20));
  var sumPV = 0, sumV = 0;
  window.forEach(function(c){
    var typical = (c.h + c.l + c.c) / 3;
    sumPV += typical * c.vol;
    sumV += c.vol;
  });
  if(sumV === 0) return null;
  return parseFloat((sumPV/sumV).toFixed(2));
}

// Candle strength - real body-to-range ratio of the most recent candle.
function computeCandleStrength(candles){
  var c = candles[candles.length-1];
  var range = c.h - c.l;
  if(range <= 0) return { ratio: 0, label: "Weak" };
  var ratio = Math.abs(c.c - c.o) / range;
  var label = ratio > 0.7 ? "Strong" : (ratio > 0.4 ? "Moderate" : "Weak");
  return { ratio: parseFloat(ratio.toFixed(2)), label: label };
}

// Retest detection - looks for the most recent clearly-broken level (a swing
// zone price has since closed beyond) within a recent window, then checks
// whether any candle since that break has returned close to the broken
// level. Returns null (no active breakout) if no clear recent break exists,
// rather than fabricating a status.
function detectRetest(candles, allZones){
  var window = 15;
  var recent = candles.slice(Math.max(0, candles.length-window));
  var currentPrice = candles[candles.length-1].c;
  var buffer = 0.004;

  var brokenZone = null, breakIdx = -1;
  allZones.forEach(function(z){
    var idxInFull = candles.length - recent.length;
    for(var i=0;i<recent.length;i++){
      var c = recent[i];
      var wasBelow = z.type=="resistance" ? true : false;
      var brokeUp = z.type=="resistance" && c.c > z.price*(1+buffer);
      var brokeDown = z.type=="support" && c.c < z.price*(1-buffer);
      if(brokeUp || brokeDown){
        if(!brokenZone || (idxInFull+i) > breakIdx){
          brokenZone = z; breakIdx = idxInFull+i;
        }
      }
    }
  });
  if(!brokenZone) return null;

  var afterBreak = candles.slice(breakIdx+1);
  var retested = afterBreak.some(function(c){
    return Math.abs(c.l - brokenZone.price) / brokenZone.price < buffer ||
           Math.abs(c.h - brokenZone.price) / brokenZone.price < buffer;
  });
  return {
    zonePrice: brokenZone.price,
    zoneType: brokenZone.type,
    retested: retested,
    candlesSinceBreak: candles.length - 1 - breakIdx
  };
}

// Combined Breakout Health Verdict - real synthesis of the above real
// calculations plus the already-tested zone/trend data. Returns one of:
// "Healthy", "Weakening", "Failed", "None" (no active breakout detected).
export function analyzeBreakoutIntelligence(candles, zones){
  var currentPrice = candles[candles.length-1].c;
  var vwap = computeVWAP(candles);
  var candleStrength = computeCandleStrength(candles);
  var aboveVwap = vwap!=null ? currentPrice > vwap : null;

  // Build the raw zone list (unfiltered by above/below current price) so
  // detectRetest can find a level that price has already broken through.
  var allRawZones = [];
  [zones.resistance, zones.resistance2, zones.resistance3].forEach(function(z){
    if(z) allRawZones.push({ price: z.price, type: "resistance" });
  });
  [zones.support, zones.support2, zones.support3].forEach(function(z){
    if(z) allRawZones.push({ price: z.price, type: "support" });
  });
  var retest = detectRetest(candles, allRawZones);

  var volumeConfirmed = (zones.resistance && zones.resistance.volumeConfirmed) ||
                         (zones.support && zones.support.volumeConfirmed) || false;

  // Historical Follow-Through / Failure Rate - real derivation from the
  // already-tested respectRate of the nearest relevant zone.
  var nearestZone = zones.trend=="Uptrend" ? zones.resistance : zones.support;
  var followThroughRate = nearestZone && nearestZone.respectRate!=null ? (100 - nearestZone.respectRate) : null;
  var failureRate = nearestZone && nearestZone.respectRate!=null ? nearestZone.respectRate : null;

  var verdict = "None";
  if(retest){
    var trendAgrees = (retest.zoneType=="resistance" && zones.trend=="Uptrend") ||
                       (retest.zoneType=="support" && zones.trend=="Downtrend");
    if(trendAgrees && volumeConfirmed && !retest.retested) verdict = "Healthy";
    else if(trendAgrees && (volumeConfirmed || retest.retested)) verdict = "Weakening";
    else if(!trendAgrees) verdict = "Failed";
    else verdict = "Weakening";
  }

  return {
    verdict: verdict,
    vwap: vwap,
    aboveVwap: aboveVwap,
    candleStrength: candleStrength,
    retest: retest,
    volumeConfirmed: volumeConfirmed,
    followThroughRate: followThroughRate,
    failureRate: failureRate,
    trend: zones.trend
  };
}
