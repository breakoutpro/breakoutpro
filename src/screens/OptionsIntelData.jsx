// BreakoutPro - OptionsIntelData.jsx
// Deep Options Intelligence data. API-ready: getOptionsIntel() returns all metrics.
// Mock now; later dataService.getOI()/getOptionChain()/getGreeks() fills same shape.
// Each metric has rich explanation: what/why/now/beginner/advanced/history/risk.
// Rules: no backtick, no triple-equals, ASCII only.

export function getOptionsIntel(symbol){
  return {
    symbol: symbol||"NIFTY",
    spot: "24,850",
    expiry: "Weekly",
    metrics: GROUPS,
    greeks: GREEKS,
    heatmap: HEATMAP,
    levels: OI_LEVELS,
    aiSummary: "Option writers are dominating with PCR above 1.0 and positive dealer gamma, pointing to moderate bullish sentiment with a stabilising bias. Heavy call OI near 25,000 caps upside while puts at 24,500 cushion dips. High time decay favours sellers, IV sits mid-range, and a medium IV crush risk means premium buyers should be selective near events. Overall structure reads as range-with-upward-tilt."
  };
}

// Metric groups for organised display.
var GROUPS = [
  {group:"Positioning", items:[
    {key:"pcr",     label:"PCR",            val:"1.18", tone:"bull",    what:"Put-Call Ratio compares put OI to call OI.", why:"It gauges crowd positioning and sentiment.", now:"Above 1 means more puts written, a mildly bullish tilt.", beginner:"More people are insuring against falls than betting on a crash, which often means calm-to-up.", advanced:"PCR 1.18 with rising put writing at 24,500 suggests support building; watch for PCR over 1.4 (over-bullish, contrarian risk).", history:"Extreme highs above 1.5 have often preceded short-term tops.", risk:"PCR alone can mislead in trending markets; pair with price."},
    {key:"maxpain", label:"Max Pain",       val:"24,800",tone:"neutral",what:"The strike where option buyers lose the most at expiry.", why:"Price often gravitates here into expiry.", now:"Spot 24,850 sits just above max pain 24,800.", beginner:"The price level where most option buyers' bets expire worthless.", advanced:"Pin risk near 24,800 into expiry; dealer hedging can magnetise spot toward it on low-vol days.", history:"Weekly closes cluster near max pain about half the time.", risk:"Max pain is a tendency, not a rule; news overrides it."},
    {key:"writers", label:"Writers Activity",val:"Active",tone:"bull",  what:"Shows how aggressively option sellers are writing.", why:"Writers usually expect a range, not a big move.", now:"Active writing on both sides points to a range expectation.", beginner:"Pro sellers are busy, often a sign the market may stay in a band.", advanced:"Call writing at 25,000 and put writing at 24,500 frames a 24,500-25,000 expected band.", history:"Heavy two-sided writing precedes range-bound weeks.", risk:"Writers can be forced to cover if price breaks the band fast."}
  ]},
  {group:"Walls and Build-up", items:[
    {key:"callwall",label:"Call Wall",      val:"25,000",tone:"bear",   what:"Strike with the heaviest call OI above spot.", why:"Acts as resistance; hard to break without momentum.", now:"25,000 is the ceiling bulls must clear.", beginner:"A price roof where lots of call sellers defend.", advanced:"Dealer short gamma above 25,000 can accelerate moves if it breaks; until then it caps.", history:"Call walls often hold into expiry unless volume surges.", risk:"A decisive break can trigger a sharp squeeze higher."},
    {key:"putwall", label:"Put Wall",       val:"24,500",tone:"bull",   what:"Strike with the heaviest put OI below spot.", why:"Acts as support on dips.", now:"24,500 is the floor buyers defend.", beginner:"A price floor where lots of put sellers defend.", advanced:"Strong put wall plus positive gamma makes dips shallow near 24,500.", history:"Put walls cushion declines until broken on volume.", risk:"If 24,500 breaks, support can vanish quickly."},
    {key:"oibuild", label:"OI Build-up",    val:"Long",  tone:"bull",   what:"Direction of fresh positions via price and OI.", why:"Reveals whether longs or shorts are being added.", now:"Rising price with rising OI suggests long build-up.", beginner:"New buyers are stepping in as price rises.", advanced:"Long build-up in futures plus call unwinding supports continuation.", history:"Sustained long build-up tends to extend trends.", risk:"Crowded longs unwind fast on bad news."},
    {key:"oichange",label:"OI Change",      val:"+8.4%", tone:"bull",   what:"Day-over-day change in total open interest.", why:"Shows whether participation is growing.", now:"OI up 8.4% means fresh money entering.", beginner:"More contracts are open today than yesterday.", advanced:"Rising OI with rising price confirms trend strength.", history:"Falling OI in a rally signals short-covering, weaker.", risk:"Rapid OI spikes can mark exhaustion."}
  ]},
  {group:"Volatility", items:[
    {key:"ivrank",  label:"IV Rank",        val:"38%",   tone:"neutral",what:"Where current IV sits in its 1-year range.", why:"Tells if options are cheap or expensive.", now:"38% is lower-middle, options moderately priced.", beginner:"Options are not too expensive right now.", advanced:"IV rank 38 favours debit spreads over naked buying; sellers get fair, not rich, premium.", history:"Low IV rank precedes volatility expansion.", risk:"IV can spike fast around events."},
    {key:"ivpct",   label:"IV Percentile",  val:"42%",   tone:"neutral",what:"Percent of days IV was below current level.", why:"A finer read on relative IV.", now:"42% of the year had lower IV than today.", beginner:"IV is around its typical level.", advanced:"IV percentile near 40 with IV rank 38 confirms mid-range vol regime.", history:"Sub-20 percentile often precedes vol spikes.", risk:"Percentile lags fast regime shifts."},
    {key:"ivcrush", label:"IV Crush Risk",  val:"Medium",tone:"bear",   what:"Risk of IV dropping sharply post-event.", why:"IV crush hurts option buyers badly.", now:"Medium risk with events on the calendar.", beginner:"Option prices can deflate after big news.", advanced:"Pre-event IV ramp into expiry sets up crush; sellers favoured, buyers need direction fast.", history:"Post-result IV often falls 20-40%.", risk:"Buyers can be right on direction yet lose to crush."},
    {key:"volmeter",label:"Volatility Meter",val:"Calm", tone:"bull",   what:"Overall realised vs implied volatility state.", why:"Frames how jumpy the market is.", now:"Realised vol is below implied, a calm regime.", beginner:"The market is moving gently right now.", advanced:"RV under IV rewards premium sellers; watch for RV catching up on breakouts.", history:"Calm regimes can end abruptly with gaps.", risk:"Calm can flip to volatile without warning."}
  ]},
  {group:"Decay and Move", items:[
    {key:"timedecay",label:"Time Decay",    val:"High",  tone:"bear",   what:"Rate at which option value erodes (theta).", why:"Decay accelerates near expiry.", now:"High theta currently favours option sellers.", beginner:"Options lose value each day, fastest near expiry.", advanced:"Weekly theta is steep; long premium needs quick movement to overcome decay.", history:"Theta burn peaks in the final two days.", risk:"Sellers face tail risk despite steady decay income."},
    {key:"expmove", label:"Expected Move",  val:"+/-185",tone:"neutral",what:"Option-implied move by expiry.", why:"Sets a probable range for planning.", now:"Options imply about 185 points either way.", beginner:"The market expects roughly this much movement.", advanced:"Straddle-implied 185 frames 24,665-25,035; breakouts beyond signal regime change.", history:"Price stays within expected move about 68% of weeks.", risk:"Tail events exceed the implied range."},
    {key:"exprange",label:"Expected Range", val:"24,665-25,035",tone:"neutral",what:"The high-low band from expected move.", why:"A practical band to frame structure.", now:"This week's implied band around spot.", beginner:"The likely high and low zone for the week.", advanced:"Range aligns with put wall 24,500 floor and call wall 25,000 cap.", history:"Bands widen into events, narrow after.", risk:"Bands are probabilistic, not guaranteed."},
    {key:"probmeter",label:"Probability Meter",val:"62% Range",tone:"neutral",what:"Implied odds of staying in range vs breaking.", why:"Helps frame structure expectations.", now:"About 62% odds of staying within the band.", beginner:"More likely to stay in the zone than break out.", advanced:"62% range odds with positive gamma supports mean-reversion setups over breakout bets.", history:"Range odds fall sharply around triggers.", risk:"Probabilities shift fast with new information."}
  ]},
  {group:"Liquidity", items:[
    {key:"liquidity",label:"Liquidity Score",val:"High", tone:"bull",   what:"How easily options can be traded.", why:"Better liquidity means tighter spreads.", now:"High liquidity in weekly NIFTY options.", beginner:"Easy to enter and exit without slippage.", advanced:"Tight bid-ask in ATM strikes; far OTM wings thin out, mind fills.", history:"Liquidity peaks near expiry for weeklies.", risk:"Liquidity dries up in far strikes and after hours."}
  ]}
];

// Greeks block.
var GREEKS = [
  {key:"delta", label:"Delta", val:"0.52", tone:"neutral", what:"Sensitivity to a 1-point move in spot.", beginner:"How much the option moves when price moves.", advanced:"ATM delta near 0.5; net positive book delta tilts long.", risk:"Delta drifts as spot and time change."},
  {key:"gamma", label:"Gamma", val:"0.018",tone:"bull",    what:"Rate of change of delta.", beginner:"How fast the option speeds up.", advanced:"High ATM gamma near expiry means quick delta shifts.", risk:"Gamma risk is largest near expiry."},
  {key:"theta", label:"Theta", val:"-12.4",tone:"bear",     what:"Daily time decay value.", beginner:"How much value is lost per day.", advanced:"Steep negative theta on weeklies; sellers collect, buyers bleed.", risk:"Theta accelerates into expiry."},
  {key:"vega",  label:"Vega",  val:"8.6",  tone:"neutral",  what:"Sensitivity to a 1% IV change.", beginner:"How much IV changes affect price.", advanced:"Moderate vega; IV crush post-event hits long premium.", risk:"Vega risk rises with longer expiries."},
  {key:"charm", label:"Charm", val:"-0.004",tone:"neutral", what:"How delta changes as time passes.", beginner:"How the option's direction sensitivity drifts daily.", advanced:"Charm bleeds delta near expiry, key for hedging books.", risk:"Often overlooked, matters most on expiry day."},
  {key:"vanna", label:"Vanna", val:"0.012",tone:"neutral",  what:"How delta changes as IV changes.", beginner:"Links volatility moves to direction sensitivity.", advanced:"Vanna flows drive dealer hedging as IV shifts; can amplify trends.", risk:"Hard to track without full chain data."}
];

// Dealer positioning.
GREEKS.dealer = [
  {key:"dgamma",  label:"Dealer Gamma",   val:"Positive", tone:"bull", desc:"Dealers buy dips and sell rips, dampening volatility."},
  {key:"dpos",    label:"Dealer Position", val:"Long Gamma",tone:"bull", desc:"Stabilising; large moves are resisted near current levels."},
  {key:"gflip",   label:"Gamma Flip",      val:"24,650",   tone:"neutral",desc:"Below this, dealer gamma turns negative and moves can accelerate."}
];

// OI heatmap by strike (call vs put intensity 0-100).
var HEATMAP = [
  {strike:"24,500", call:30, put:85},
  {strike:"24,600", call:38, put:72},
  {strike:"24,700", call:46, put:64},
  {strike:"24,800", call:58, put:70},
  {strike:"24,900", call:74, put:48},
  {strike:"25,000", call:92, put:34},
  {strike:"25,100", call:66, put:22}
];

// Support / resistance derived from OI.
var OI_LEVELS = [
  {type:"Resistance", level:"25,000", basis:"Highest call OI"},
  {type:"Resistance", level:"24,900", basis:"Secondary call OI"},
  {type:"Support",    level:"24,500", basis:"Highest put OI"},
  {type:"Support",    level:"24,600", basis:"Secondary put OI"}
];

export function toneColor(tone){
  if(tone=="bull") return "#22C55E";
  if(tone=="bear") return "#EF4444";
  return "#A0A7B4";
}
