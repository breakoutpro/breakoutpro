// BreakoutPro - breakoutSetupsModel.js
// Pure selection of Home hero setups from /api/scanner-data results. No invented values.
// Rules: no backtick, no triple-equals, ASCII only.

export var MAX_SETUPS = 3;

export function pickSetups(results){
  if(!Array.isArray(results)) return [];
  var out = [];
  results.forEach(function(r){
    if(!r || !r.sym || !Array.isArray(r.tags)) return;
    var up = r.tags.indexOf("breakout") >= 0, dn = r.tags.indexOf("breakdown") >= 0;
    if(!up && !dn) return;
    var key = up ? r.priorHigh : r.priorLow;
    if(typeof key != "number" || !isFinite(key)) return;
    out.push({ sym:r.sym, type:up ? "breakout" : "breakdown", level:key, ltp:r.ltp, chgPct:(typeof r.chgPct == "number" && isFinite(r.chgPct)) ? r.chgPct : null, volRatio:(typeof r.volRatio == "number" && isFinite(r.volRatio)) ? r.volRatio : null, volSpike:r.tags.indexOf("volspike") >= 0 });
  });
  out.sort(function(a, b){ return (b.volRatio || 0) - (a.volRatio || 0); });
  return out.slice(0, MAX_SETUPS);
}
