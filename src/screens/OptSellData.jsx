// BreakoutPro - OptSellData.jsx
// Options Selling Academy data: strategies (with payoff legs) + learning path.
// Educational only. Terminology English. Rules: no backtick, no triple-equals, ASCII.

// Each strategy has legs for the payoff graph: {type:call/put, dir:short/long, strike, prem}
// Payoff computed from legs at expiry. spot reference for centering.
export var STRATEGIES = [
  {id:"covered-call", name:"Covered Call", bias:"Neutral to Bullish",
    legs:[{type:"call",dir:"short",strike:105,prem:2}], stockLong:true, spot:100,
    overview:"Hold the stock and sell a call against it to collect premium.",
    condition:"Mildly bullish or sideways market.",
    risk:"Stock can fall; premium only cushions a little.", reward:"Premium plus capped upside to the strike.",
    maxProfit:"Premium plus gain up to the strike.", maxLoss:"Large if the stock falls sharply.",
    breakeven:"Stock price minus premium received.", margin:"Covered by the stock holding.",
    greeks:"Short Theta works for you; negative Delta from the call caps upside.",
    expiry:"If price stays below strike, keep stock plus premium.",
    mistakes:["Selling calls too close to the price.","Ignoring dividend or event dates."]},
  {id:"cash-secured-put", name:"Cash Secured Put", bias:"Neutral to Bullish",
    legs:[{type:"put",dir:"short",strike:95,prem:2}], spot:100,
    overview:"Sell a put and keep cash aside to buy the stock if assigned.",
    condition:"Willing to own the stock lower; sideways to bullish.",
    risk:"Stock can fall well below the strike.", reward:"Premium, or buying the stock at a discount.",
    maxProfit:"The premium received.", maxLoss:"Strike minus premium, down to zero.",
    breakeven:"Strike minus premium.", margin:"Cash equal to strike set aside.",
    greeks:"Positive Theta; short put has positive Delta.",
    expiry:"Above strike keep premium; below, get assigned the stock.",
    mistakes:["Selling puts on stocks you would not want to own.","Using too much capital."]},
  {id:"bull-put-spread", name:"Bull Put Spread", bias:"Bullish",
    legs:[{type:"put",dir:"short",strike:95,prem:2},{type:"put",dir:"long",strike:90,prem:0.8}], spot:100,
    overview:"Sell a put and buy a lower put to define risk while collecting net premium.",
    condition:"Moderately bullish.", risk:"Limited to the spread width minus credit.",
    reward:"Limited to the net credit.", maxProfit:"Net premium received.",
    maxLoss:"Strike difference minus net credit.", breakeven:"Short strike minus net credit.",
    margin:"Spread width minus credit.", greeks:"Positive Theta; defined risk.",
    expiry:"Above short strike, both expire worthless and you keep the credit.",
    mistakes:["Going too wide and risking too much.","Ignoring liquidity in the long leg."]},
  {id:"bear-call-spread", name:"Bear Call Spread", bias:"Bearish",
    legs:[{type:"call",dir:"short",strike:105,prem:2},{type:"call",dir:"long",strike:110,prem:0.8}], spot:100,
    overview:"Sell a call and buy a higher call to define risk on a bearish view.",
    condition:"Moderately bearish to sideways.", risk:"Limited to spread width minus credit.",
    reward:"Limited to net credit.", maxProfit:"Net premium received.",
    maxLoss:"Strike difference minus net credit.", breakeven:"Short strike plus net credit.",
    margin:"Spread width minus credit.", greeks:"Positive Theta; defined risk.",
    expiry:"Below short strike, both expire worthless and you keep the credit.",
    mistakes:["Selling into strong momentum.","Choosing illiquid strikes."]},
  {id:"iron-condor", name:"Iron Condor", bias:"Sideways",
    legs:[{type:"put",dir:"long",strike:90,prem:0.6},{type:"put",dir:"short",strike:95,prem:1.6},{type:"call",dir:"short",strike:105,prem:1.6},{type:"call",dir:"long",strike:110,prem:0.6}], spot:100,
    overview:"Sell a put spread and a call spread to profit from a range.",
    condition:"Low volatility, range-bound market.", risk:"Limited on both sides.",
    reward:"Net credit if price stays in the range.", maxProfit:"Total net premium.",
    maxLoss:"Wing width minus credit on either side.", breakeven:"Two points around the range.",
    margin:"One spread width minus credit.", greeks:"Strong positive Theta; short Vega.",
    expiry:"Inside the short strikes, all expire worthless and you keep the credit.",
    mistakes:["Setting wings too tight.","Holding through a big event."]},
  {id:"iron-butterfly", name:"Iron Butterfly", bias:"Sideways",
    legs:[{type:"put",dir:"long",strike:90,prem:0.6},{type:"put",dir:"short",strike:100,prem:3},{type:"call",dir:"short",strike:100,prem:3},{type:"call",dir:"long",strike:110,prem:0.6}], spot:100,
    overview:"Sell an at-the-money straddle and buy wings to cap risk.",
    condition:"Very low expected movement.", risk:"Limited by the wings.",
    reward:"High credit but a narrow profit zone.", maxProfit:"Net premium at the center strike.",
    maxLoss:"Wing width minus credit.", breakeven:"Center plus or minus net credit.",
    margin:"Wing width minus credit.", greeks:"High positive Theta; short Vega.",
    expiry:"Maximum profit only if price pins the center strike.",
    mistakes:["Expecting a pin every time.","Underestimating gamma near expiry."]},
  {id:"short-straddle", name:"Short Straddle", bias:"Sideways",
    legs:[{type:"call",dir:"short",strike:100,prem:3},{type:"put",dir:"short",strike:100,prem:3}], spot:100,
    overview:"Sell a call and a put at the same strike to collect rich premium.",
    condition:"Expecting very little movement and falling IV.", risk:"Unlimited on both sides.",
    reward:"The full premium if price stays at the strike.", maxProfit:"Total premium received.",
    maxLoss:"Unlimited as price moves far either way.", breakeven:"Strike plus or minus total premium.",
    margin:"High, due to undefined risk.", greeks:"Very high positive Theta; very short Vega and Gamma.",
    expiry:"Best if price pins the strike; risky if it moves.",
    mistakes:["Selling before events.","No hedge against a gap."]},
  {id:"short-strangle", name:"Short Strangle", bias:"Sideways",
    legs:[{type:"call",dir:"short",strike:105,prem:1.8},{type:"put",dir:"short",strike:95,prem:1.8}], spot:100,
    overview:"Sell an out-of-the-money call and put to profit from a range.",
    condition:"Range-bound with elevated IV.", risk:"Unlimited beyond the strikes.",
    reward:"Premium if price stays between the strikes.", maxProfit:"Total premium received.",
    maxLoss:"Unlimited on a big move.", breakeven:"Call strike plus or put strike minus total premium.",
    margin:"High, undefined risk.", greeks:"High positive Theta; short Vega.",
    expiry:"Keep premium if price stays between the short strikes.",
    mistakes:["Strikes too close.","Holding into a trending move."]},
  {id:"calendar-spread", name:"Calendar Spread", bias:"Neutral",
    legs:[{type:"call",dir:"short",strike:100,prem:2},{type:"call",dir:"long",strike:100,prem:3.2}], spot:100,
    overview:"Sell a near-term option and buy a longer-term one at the same strike.",
    condition:"Neutral now, expecting movement later or rising IV.", risk:"Limited to net debit.",
    reward:"Benefits from near-term Theta and rising IV.", maxProfit:"Around the strike at near expiry.",
    maxLoss:"The net debit paid.", breakeven:"Varies with IV; near the strike.",
    margin:"Net debit.", greeks:"Long Vega; profits from near-leg Theta.",
    expiry:"Near leg decays faster than the far leg, the core idea.",
    mistakes:["Ignoring IV differences.","Big directional moves hurt it."]},
  {id:"ratio-spread", name:"Ratio Spread", bias:"Directional",
    legs:[{type:"call",dir:"long",strike:100,prem:3},{type:"call",dir:"short",strike:105,prem:1.6},{type:"call",dir:"short",strike:105,prem:1.6}], spot:100,
    overview:"Buy one option and sell more above to lower cost, adding risk.",
    condition:"Directional with a target zone.", risk:"Can be large beyond the short strikes.",
    reward:"Best in a specific zone.", maxProfit:"Around the short strike.",
    maxLoss:"Rises beyond the short strikes.", breakeven:"Depends on net cost and strikes.",
    margin:"Higher due to extra short.", greeks:"Mixed; watch Gamma near expiry.",
    expiry:"Profit peaks near the short strike.",
    mistakes:["Underestimating risk from the extra short.","Holding through a strong trend."]}
];

export function getStrategy(id){ return STRATEGIES.filter(function(s){return s.id==id;})[0]||STRATEGIES[0]; }

// Compute payoff at a given underlying price from legs (+ optional long stock).
export function payoffAt(strat, price){
  var pnl=0;
  if(strat.stockLong){ pnl += (price - strat.spot); }
  strat.legs.forEach(function(l){
    var intrinsic = l.type=="call" ? Math.max(0, price-l.strike) : Math.max(0, l.strike-price);
    if(l.dir=="short"){ pnl += l.prem - intrinsic; }
    else { pnl += intrinsic - l.prem; }
  });
  return pnl;
}

// Learning path - lesson ids grouped by level (matches OptSellLessonData).
export var LEARN_PATH = {
  Beginner:[
    {id:"what-options",t:"What are Options?"},{id:"calls-puts",t:"Calls vs Puts"},
    {id:"premium",t:"Premium"},{id:"intrinsic",t:"Intrinsic Value"},
    {id:"timevalue",t:"Time Value"},{id:"expiry",t:"Expiry"},
    {id:"strike",t:"Strike Price"},{id:"chain-basics",t:"Option Chain Basics"}
  ],
  Intermediate:[
    {id:"what-selling",t:"What is Option Selling?"},{id:"why-premium",t:"Why Sellers Collect Premium"},
    {id:"probability",t:"Probability in Option Selling"},{id:"theta",t:"Theta Decay"},
    {id:"iv-basics",t:"IV Basics"},{id:"delta",t:"Delta"},{id:"gamma",t:"Gamma"},
    {id:"vega",t:"Vega"},{id:"margin-basics",t:"Margin Basics"},{id:"risk-mgmt",t:"Risk Management"}
  ],
  Advanced:[
    {id:"iron-condor",t:"Iron Condor"},{id:"iron-fly",t:"Iron Fly"},
    {id:"short-strangle",t:"Short Strangle"},{id:"short-straddle",t:"Short Straddle"},
    {id:"credit-spreads",t:"Credit Spreads"},{id:"hedging",t:"Hedging"},
    {id:"greeks-selling",t:"Greeks in Selling"},{id:"vol-trading",t:"Volatility Trading"},
    {id:"position-adjust",t:"Position Adjustment"},{id:"rolling",t:"Rolling Positions"},
    {id:"portfolio-margin",t:"Portfolio Margin"},{id:"event-trading",t:"Event Trading"},
    {id:"expiry-strategies",t:"Expiry Strategies"}
  ]
};
     
