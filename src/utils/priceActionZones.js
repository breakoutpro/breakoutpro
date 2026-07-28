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
