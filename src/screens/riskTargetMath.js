// BreakoutPro - riskTargetMath.js
// Pure arithmetic of the Position Size / Risk & Target calculator (unchanged from the Home version).
// Rules: no backtick, no triple-equals, ASCII only.

export function calcRisk(entry, sl, qty){
  var e = parseFloat(entry), s = parseFloat(sl), q = parseFloat(qty);
  if(!isFinite(e) || !isFinite(s) || !isFinite(q)) return null;
  if(e <= 0 || s <= 0 || q <= 0) return null;
  if(e == s) return null;
  return Math.abs(e - s) * q;
}

// 1:2 risk-reward target. Long: Entry + 2 x |Entry - SL|. Short: Entry - 2 x |Entry - SL|.
// Returns null unless the stop is on the correct side of the entry for the chosen direction
// (Long needs SL below Entry, Short needs SL above Entry) and the target stays above zero.
export function calcTarget(entry, sl, dir){
  var e = parseFloat(entry), s = parseFloat(sl);
  if(!isFinite(e) || !isFinite(s) || e <= 0 || s <= 0 || e == s) return null;
  if(dir == "short" ? !(s > e) : !(s < e)) return null;
  var t = dir == "short" ? e - 2 * Math.abs(e - s) : e + 2 * Math.abs(e - s);
  return t > 0 ? t : null;
}

// What to tell the trader when the numbers cannot give a trustworthy result ("" when fine or incomplete).
export function calcMessage(entry, sl, qty, dir){
  if(entry == "" || sl == "" || qty == "") return "";
  var e = parseFloat(entry), s = parseFloat(sl), q = parseFloat(qty);
  if(!isFinite(e) || !isFinite(s) || !isFinite(q) || e <= 0 || s <= 0 || q <= 0) return "Enter positive numbers";
  if(e == s) return "Entry and SL must differ";
  if(dir == "short" && s < e) return "For Short, SL must be above Entry";
  if(dir != "short" && s > e) return "For Long, SL must be below Entry";
  if(calcTarget(entry, sl, dir) == null) return "Target would fall below zero";
  return "";
}
