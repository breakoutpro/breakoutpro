// BreakoutPro - OptionsIntelProData.jsx
// Fully offline educational content for Options Intelligence Pro. No live
// option chain data anywhere. The one sample dataset (Max Pain) is
// explicitly and permanently labeled "Educational Example" in the UI,
// never presented as real market data.
// Rules: no backtick, no triple-equals, ASCII only.

export var GREEKS = [
  {
    id:"delta", name:"Delta",
    definition:"Delta estimates how much an option's premium is expected to change for a small move in the underlying's price.",
    behavior:"Call deltas range from 0 to 1; put deltas range from 0 to -1. Deltas move closer to 1 (or -1) as an option goes deeper in-the-money, and closer to 0 as it goes deeper out-of-the-money.",
    example:"A call with a delta of 0.5 is often described as roughly at-the-money - a small move in the underlying is expected to move the premium by roughly half as much, as a rough approximation.",
    mistakes:"A common mistake is treating delta as a precise, guaranteed prediction rather than an approximation that itself changes as price and time move."
  },
  {
    id:"gamma", name:"Gamma",
    definition:"Gamma estimates how much an option's delta itself is expected to change as the underlying price moves.",
    behavior:"Gamma is typically highest for at-the-money options close to expiry, and lower for options that are deep in- or out-of-the-money.",
    example:"High gamma means delta can change quickly with small price moves - this is why near-expiry at-the-money options are often described as behaving unpredictably.",
    mistakes:"A common mistake is ignoring gamma and assuming delta will stay constant, especially close to expiry."
  },
  {
    id:"theta", name:"Theta",
    definition:"Theta estimates how much an option's premium is expected to decline purely from the passage of time, all else equal.",
    behavior:"Theta decay is typically slow far from expiry and accelerates as expiry approaches, especially for at-the-money options.",
    example:"An option losing value day by day even when the underlying doesn't move much is a commonly cited educational illustration of theta decay.",
    mistakes:"A common mistake is underestimating how much time decay accelerates in the final days before expiry."
  },
  {
    id:"vega", name:"Vega",
    definition:"Vega estimates how much an option's premium is expected to change for a change in implied volatility (IV), all else equal.",
    behavior:"Vega is typically higher for options with more time to expiry and lower for options close to expiry.",
    example:"A rise in IV ahead of a known event (like earnings) can inflate premiums even without the underlying price moving - this is the effect vega describes.",
    mistakes:"A common mistake is not accounting for an IV drop right after an event, which can reduce premium value even if the underlying moves favorably (see the IV Crush section)."
  },
  {
    id:"rho", name:"Rho",
    definition:"Rho estimates how much an option's premium is expected to change for a change in interest rates, all else equal.",
    behavior:"Rho generally has a smaller practical effect on short-dated options and a larger effect on longer-dated options.",
    example:"Rho is the least frequently discussed Greek in short-term retail options education, since interest rate changes are usually gradual compared to price and time effects.",
    mistakes:"A common mistake is over-weighting rho for very short-dated options, where its effect is typically minor compared to delta, theta, and vega."
  }
];

export var STRATEGY_CARDS = [
  {
    name:"Long Call",
    setup:"Buying a call option, expecting the underlying to rise.",
    risk:"Limited to the premium paid.",
    reward:"Theoretically large if the underlying rises significantly.",
    bestCondition:"A view that the underlying will rise, with defined risk desired.",
    mistakes:"Buying calls purely on excitement (FOMO) without a plan for time decay working against the position."
  },
  {
    name:"Long Put",
    setup:"Buying a put option, expecting the underlying to fall.",
    risk:"Limited to the premium paid.",
    reward:"Large if the underlying falls significantly, capped near zero on the underlying.",
    bestCondition:"A view that the underlying will fall, with defined risk desired.",
    mistakes:"Underestimating how quickly time decay erodes the premium if the fall doesn't happen quickly."
  },
  {
    name:"Covered Call",
    setup:"Holding the underlying while selling a call option against it.",
    risk:"The underlying's own downside risk, offset only partially by the premium collected.",
    reward:"Limited to the premium collected plus any gain up to the strike.",
    bestCondition:"A neutral-to-mildly-bullish view on an underlying already held.",
    mistakes:"Selling a call with a strike too close to the current price, capping upside during a genuine rally."
  },
  {
    name:"Bull Call Spread",
    setup:"Buying a call at a lower strike and selling a call at a higher strike, same expiry.",
    risk:"Limited to the net premium paid.",
    reward:"Limited to the difference between strikes minus net premium paid.",
    bestCondition:"A moderately bullish view, wanting reduced cost versus a plain long call.",
    mistakes:"Choosing strikes too far apart or too close together without considering the resulting risk-reward shape."
  },
  {
    name:"Bear Put Spread",
    setup:"Buying a put at a higher strike and selling a put at a lower strike, same expiry.",
    risk:"Limited to the net premium paid.",
    reward:"Limited to the difference between strikes minus net premium paid.",
    bestCondition:"A moderately bearish view, wanting reduced cost versus a plain long put.",
    mistakes:"Ignoring that the capped reward may not justify the trade if the fall is expected to be very large."
  },
  {
    name:"Iron Condor",
    setup:"Selling an out-of-the-money call spread and an out-of-the-money put spread simultaneously.",
    risk:"Limited, but can be significant relative to premium collected if the underlying moves sharply beyond either spread.",
    reward:"Limited to the net premium collected.",
    bestCondition:"An expectation that the underlying stays within a defined range through expiry.",
    mistakes:"Setting the range too narrow relative to the underlying's typical volatility, especially around known events."
  },
  {
    name:"Short Straddle",
    setup:"Selling a call and a put at the same strike and expiry.",
    risk:"Potentially large and undefined in theory if the underlying moves sharply in either direction.",
    reward:"Limited to the total premium collected from both legs.",
    bestCondition:"A strong expectation of low movement through expiry - considered a higher-risk strategy given undefined downside.",
    mistakes:"Underestimating tail risk from a sudden large move, especially around unexpected news."
  }
];

// Explicitly labeled sample dataset for the Max Pain interactive example -
// never presented as real, current market data anywhere in the UI.
export var MAX_PAIN_SAMPLE = {
  label:"Educational Example",
  strikes:[
    { strike:100, callOI:200, putOI:900 },
    { strike:105, callOI:400, putOI:600 },
    { strike:110, callOI:800, putOI:350 },
    { strike:115, callOI:650, putOI:200 },
    { strike:120, callOI:300, putOI:150 }
  ]
};

export var QUIZ_QUESTIONS = [
  { q:"Delta primarily estimates:", options:["Time decay","Sensitivity of premium to underlying price moves","Interest rate sensitivity","Dividend impact"], correct:1 },
  { q:"Gamma describes:", options:["How much delta itself changes as price moves","The option's strike price","The lot size","The exchange fee"], correct:0 },
  { q:"Theta is generally associated with:", options:["Volatility changes","Time decay of the premium","Interest rate changes","Dividend payouts"], correct:1 },
  { q:"Vega estimates sensitivity to:", options:["Time decay","Implied volatility changes","Interest rates","Lot size"], correct:1 },
  { q:"A Long Call's maximum risk is:", options:["Unlimited","Limited to the premium paid","Equal to the strike price","Equal to the underlying's price"], correct:1 },
  { q:"A Covered Call involves:", options:["Buying a put against a short position","Holding the underlying and selling a call against it","Buying two calls","Selling a naked put"], correct:1 },
  { q:"An Iron Condor is generally used when a trader expects:", options:["A sharp move in either direction","The underlying to stay within a range","Guaranteed profit","Zero risk"], correct:1 },
  { q:"A Short Straddle's risk profile is best described as:", options:["Always limited to a small amount","Potentially large if the underlying moves sharply","Zero risk","Guaranteed profit"], correct:1 },
  { q:"Max Pain is generally described as:", options:["A guaranteed price target","The strike where option writers as a group face the least payout, an educational concept","A government-mandated price","A type of stoploss"], correct:1 },
  { q:"Put Call Ratio (PCR) is calculated as:", options:["Call OI divided by Put OI","Put OI (or volume) divided by Call OI (or volume)","Strike price divided by premium","Premium divided by lot size"], correct:1 }
];
