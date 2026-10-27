// Candlestick pattern tests. Candles are hand-built MOCK data.
import test from "node:test";
import assert from "node:assert/strict";
import { detectPatterns, validateSeries, MIN_CANDLES, DEFINITIONS } from "../src/alerts/alertCandles.js";

function bar(i, o, h, l, c){ return { t:1000000 + i * 300000, o:o, h:h, l:l, c:c, v:1000 }; }
// 12 neutral bars then a prefix that sets the trend
function base(trend){
  var out = [], p = 100;
  for(var i = 0; i < 10; i++){ out.push(bar(i, p, p + 1, p - 1, p + 0.2)); }
  // three bars of trend
  for(var k = 0; k < 3; k++){
    var s = trend == "down" ? 100 - k * 1.2 : 100 + k * 1.2;
    var e = trend == "down" ? s - 1.1 : s + 1.1;
    out.push(bar(10 + k, s, Math.max(s, e) + 0.3, Math.min(s, e) - 0.3, e));
  }
  return out;
}
function ids(r){ return r.found.map(function(x){ return x.id; }); }

test("insufficient history is reported, never guessed", function(){
  var r = detectPatterns(base("down").slice(0, 8));
  assert.equal(r.ok, false); assert.equal(r.code, "insufficient_history");
  assert.equal(validateSeries([]).ok, false);
  assert.ok(MIN_CANDLES >= 14);
});
test("malformed OHLC is rejected", function(){
  var s = base("down"); s.push(bar(13, 100, 99, 98, 99.5));            // high below close
  assert.equal(detectPatterns(s).ok, false); assert.equal(detectPatterns(s).code, "invalid_ohlc");
  var s2 = base("down"); s2.push({ t:s2[s2.length - 1].t, o:1, h:2, l:0.5, c:1.5, v:1 });  // duplicate time
  assert.equal(detectPatterns(s2).code, "invalid_ohlc");
});
test("doji: tiny body, normal range, neutral", function(){
  var s = base("down"); s.push(bar(13, 96.0, 97.0, 95.0, 96.05));
  var r = detectPatterns(s); assert.ok(ids(r).indexOf("doji") >= 0);
  assert.equal(r.found.filter(function(x){ return x.id == "doji"; })[0].direction, "neutral");
});
test("doji needs a real range: a flat dead bar is not a doji", function(){
  var s = base("down"); s.push(bar(13, 96.0, 96.02, 95.99, 96.01));
  assert.equal(ids(detectPatterns(s)).indexOf("doji"), -1);
});
test("hammer only after a fall, lower wick >= 2x body", function(){
  var s = base("down"); s.push(bar(13, 96.0, 96.4, 94.2, 96.3));
  assert.ok(ids(detectPatterns(s)).indexOf("hammer") >= 0);
  var up = base("up"); up.push(bar(13, 103.6, 104.0, 101.8, 103.9));       // same shape after a rise: not a hammer
  assert.equal(ids(detectPatterns(up)).indexOf("hammer"), -1);
});
test("shooting star only after a rise", function(){
  var s = base("up"); s.push(bar(13, 103.6, 105.8, 103.5, 103.8));
  assert.ok(ids(detectPatterns(s)).indexOf("shooting_star") >= 0);
  var d = base("down"); d.push(bar(13, 96.0, 98.2, 95.9, 96.2));
  assert.equal(ids(detectPatterns(d)).indexOf("shooting_star"), -1);
});
test("bullish engulfing and its false twin", function(){
  var s = base("down"); // last base close ~ 97.5; red bar then green that covers it
  s.push(bar(13, 97.4, 97.5, 96.2, 96.4));
  s.push(bar(14, 96.2, 98.2, 96.1, 98.0));
  assert.ok(ids(detectPatterns(s)).indexOf("bullish_engulfing") >= 0);
  var w = base("down"); w.push(bar(13, 97.4, 97.5, 96.2, 96.4)); w.push(bar(14, 96.6, 97.2, 96.5, 97.0));   // does not cover the red body
  assert.equal(ids(detectPatterns(w)).indexOf("bullish_engulfing"), -1);
});
test("bearish engulfing after a rise", function(){
  var s = base("up"); s.push(bar(13, 102.7, 104.0, 102.6, 103.9)); s.push(bar(14, 104.1, 104.2, 102.4, 102.5));
  assert.ok(ids(detectPatterns(s)).indexOf("bearish_engulfing") >= 0);
});
test("bullish harami: small green body inside a large red body", function(){
  var s = base("down"); s.push(bar(13, 97.4, 97.5, 94.5, 94.8)); s.push(bar(14, 95.6, 96.4, 95.4, 96.0));
  assert.ok(ids(detectPatterns(s)).indexOf("bullish_harami") >= 0);
});
test("bearish harami after a rise", function(){
  var s = base("up"); s.push(bar(13, 102.7, 105.6, 102.6, 105.4)); s.push(bar(14, 104.6, 104.8, 103.8, 104.0));
  assert.ok(ids(detectPatterns(s)).indexOf("bearish_harami") >= 0);
});
test("morning star and evening star need three bars in order", function(){
  var m = base("down"); m.push(bar(13, 97.4, 97.5, 94.4, 94.6)); m.push(bar(14, 94.4, 94.7, 93.9, 94.2)); m.push(bar(15, 94.5, 97.2, 94.4, 97.0));
  assert.ok(ids(detectPatterns(m)).indexOf("morning_star") >= 0);
  var e = base("up"); e.push(bar(13, 102.7, 105.7, 102.6, 105.5)); e.push(bar(14, 105.7, 106.0, 105.4, 105.8)); e.push(bar(15, 105.5, 105.6, 102.9, 103.0));
  assert.ok(ids(detectPatterns(e)).indexOf("evening_star") >= 0);
});
test("every pattern has a written definition", function(){
  ["doji","hammer","shooting_star","bullish_engulfing","bearish_engulfing","bullish_harami","bearish_harami","morning_star","evening_star"].forEach(function(k){ assert.ok(DEFINITIONS[k].length > 20, k); });
});
