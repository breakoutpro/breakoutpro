// BreakoutPro - genSpark.js
// Single shared sparkline-data generator for demo/preview charts. Every screen
// that draws a small preview sparkline should use this instead of its own
// local copy, so the "wobble" behavior is consistent across the app.
// Rules: no backtick, no triple-equals, ASCII.

// base: starting value. points: how many data points (default 20).
// bias: 0.5 = neutral random walk, <0.5 = upward drift, >0.5 = downward drift
//       (matches the historical convention used across this codebase, where
//       Math.random() - bias determines the step direction).
// volatilityPct: how big each step can be, as a fraction of base (default 0.004).
// additive: if true, steps are added directly to the running value (used by a
//       few screens for a smoother look) instead of applied as a percentage.
export function genSpark(base, options){
  var opts = options || {};
  var points = opts.points || 20;
  var bias = opts.bias!=null ? opts.bias : 0.48;
  var volatilityPct = opts.volatilityPct!=null ? opts.volatilityPct : 0.004;
  var additive = !!opts.additive;
  var round = opts.round!=null ? opts.round : true;

  var arr = [];
  var p = base;
  for(var i=0;i<points;i++){
    var step = (Math.random()-bias) * base * volatilityPct;
    if(additive){
      p = p + step;
    } else {
      p = p * (1 + step);
      if(round) p = parseFloat(p.toFixed(2));
    }
    arr.push(p);
  }
  return arr;
}
