// BreakoutPro - OptionsIntelData.jsx
// Options Intelligence data. API-ready: getOptionsIntel() returns all metrics.
// Mock now; later dataService.getOI() / getOptionChain() fills the same shape.
// Rules: no backtick, no triple-equals, ASCII only.

// Each metric: value + tone (bull/bear/neutral) + short AI explanation.
export function getOptionsIntel(symbol){
  // TODO: replace with dataService.getOI(symbol) when Dhan Data API is live.
  // The shape below stays identical, so UI never changes.
  return {
    symbol: symbol||"NIFTY",
    spot: "24,850",
    metrics: [
      {key:"pcr",     label:"PCR",            val:"1.18", tone:"bull",    ai:"PCR above 1 shows more puts being written. Mild bullish sentiment."},
      {key:"maxpain", label:"Max Pain",       val:"24,800",tone:"neutral",ai:"Price tends to gravitate near max pain by expiry. Spot is just above it."},
      {key:"oibuild", label:"OI Build-up",    val:"Long",  tone:"bull",   ai:"Rising price with rising OI suggests long build-up."},
      {key:"gammaexp",label:"Gamma Exposure", val:"+",     tone:"bull",   ai:"Positive gamma. Dealers buy dips and sell rips, dampening volatility."},
      {key:"gammaflip",label:"Gamma Flip",    val:"24,650",tone:"neutral",ai:"Below this level gamma turns negative and moves can accelerate."},
      {key:"callwall",label:"Call Wall",      val:"25,000",tone:"bear",   ai:"Heavy call OI here acts as resistance. Hard to break without momentum."},
      {key:"putwall", label:"Put Wall",       val:"24,500",tone:"bull",   ai:"Heavy put OI here acts as support on dips."},
      {key:"ivrank",  label:"IV Rank",        val:"38%",   tone:"neutral",ai:"IV is in the lower-middle of its yearly range. Options moderately priced."},
      {key:"ivcrush", label:"IV Crush Risk",  val:"Medium",tone:"bear",   ai:"Near events, IV can drop fast and hurt option buyers."},
      {key:"timedecay",label:"Time Decay",    val:"High",  tone:"bear",   ai:"Theta is high. Time decay currently favours option sellers."},
      {key:"expmove", label:"Expected Move",  val:"+/-185",tone:"neutral",ai:"Options imply about this many points of movement by expiry."},
      {key:"writers", label:"Writers Activity",val:"Active",tone:"bull",  ai:"Option writers are active, often a sign of range expectation."}
    ],
    // OI heatmap: strikes with call + put OI intensity (0-100).
    heatmap: [
      {strike:"24,500", call:30, put:85},
      {strike:"24,600", call:38, put:72},
      {strike:"24,700", call:46, put:64},
      {strike:"24,800", call:58, put:70},
      {strike:"24,900", call:74, put:48},
      {strike:"25,000", call:92, put:34},
      {strike:"25,100", call:66, put:22}
    ],
    aiSummary: "Option writers are dominating with PCR above 1.0 and positive gamma, pointing to moderate bullish sentiment. Heavy call OI near 25,000 caps upside while puts at 24,500 support dips. High time decay favours sellers, and a medium IV crush risk means option buyers should be selective near events."
  };
}

export function toneColor(tone){
  if(tone=="bull") return "#22C55E";
  if(tone=="bear") return "#EF4444";
  return "#A0A7B4";
}
