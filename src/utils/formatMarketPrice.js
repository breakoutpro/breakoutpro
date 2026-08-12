// BreakoutPro - shared market-price formatting boundary.
// Every Home market price MUST render through this function. Never
// substitute a numeric fallback for a missing value - null/undefined
// always renders the honest unavailable string.
export var UNAVAILABLE_TEXT = "Data unavailable right now.";

export function formatMarketPrice(value, opts){
  if(value==null || typeof value!=="number" || !isFinite(value)) return UNAVAILABLE_TEXT;
  return value.toLocaleString("en-IN", opts || {maximumFractionDigits:2});
}
