// BreakoutPro - ScannerData.jsx
// Scanner Hub catalog (8 sections) + mock scanner results. API-ready for Dhan.
// Terminology stays English. Rules: no backtick, no triple-equals, ASCII only.

// Section catalog. Each item: id, title, desc, pro flag, kind (route type).
export var SECTIONS = [
  {name:"Market Tools", items:[
    {id:"alerts",     title:"Live Alerts",       desc:"Real-time pattern and volume alerts", kind:"tab", tab:"signals"},
    {id:"analysis",   title:"Market Analysis",   desc:"AI market structure overview", kind:"tab", tab:"markets"},
    {id:"heatmap",    title:"Heatmap",           desc:"Sector and stock heatmap", kind:"tab", tab:"heatmap"},
    {id:"fiidii",     title:"FII / DII Activity",desc:"Institutional money flow", kind:"tab", tab:"fiidii"},
    {id:"global",     title:"Global Markets",    desc:"Dow, Nasdaq, Nikkei and more", kind:"tab", tab:"global"},
    {id:"sectors",    title:"Sector Performance",desc:"Live sector gainers and losers", kind:"tab", tab:"heatmap"},
    {id:"breadth",    title:"Market Breadth",    desc:"Advances vs declines", kind:"scan"}
  ]},
  {name:"Stock Scanners", items:[
    {id:"breakout",   title:"Breakout Scanner",      desc:"Stocks breaking key resistance", kind:"scan"},
    {id:"breakdown",  title:"Breakdown Scanner",     desc:"Stocks breaking key support", kind:"scan"},
    {id:"volspike",   title:"Volume Spike Scanner",  desc:"Unusual volume surges", kind:"scan"},
    {id:"gap",        title:"Gap Up / Gap Down",     desc:"Opening gap movers", kind:"scan"},
    {id:"rsi",        title:"RSI Scanner",           desc:"Overbought and oversold zones", kind:"scan"},
    {id:"orb",        title:"ORB Scanner",           desc:"Opening range breakouts", kind:"scan"},
    {id:"delivery",   title:"Delivery Volume Scanner",desc:"High delivery percentage", kind:"scan"},
    {id:"high52",     title:"52 Week High Scanner",  desc:"Stocks at yearly highs", kind:"scan"},
    {id:"low52",      title:"52 Week Low Scanner",   desc:"Stocks at yearly lows", kind:"scan"}
  ]},
  {name:"Options Scanners", pro:true, items:[
    {id:"gammablast", title:"Gamma Blast Scanner",   desc:"Explosive gamma setups", kind:"scan", pro:true},
    {id:"pcr",        title:"PCR Scanner",           desc:"Put-Call Ratio extremes", kind:"scan", pro:true},
    {id:"maxpain",    title:"Max Pain Scanner",      desc:"Max pain by expiry", kind:"scan", pro:true},
    {id:"callwriting",title:"Call Writing Scanner",  desc:"Heavy call writing strikes", kind:"scan", pro:true},
    {id:"putwriting", title:"Put Writing Scanner",   desc:"Heavy put writing strikes", kind:"scan", pro:true},
    {id:"oibuild",    title:"OI Build-up Scanner",   desc:"Fresh OI positioning", kind:"scan", pro:true},
    {id:"oichange",   title:"OI Change Scanner",     desc:"Largest OI changes", kind:"scan", pro:true},
    {id:"shortcover", title:"Short Covering Scanner",desc:"Short covering candidates", kind:"scan", pro:true},
    {id:"longbuild",  title:"Long Build-up Scanner", desc:"Long build-up candidates", kind:"scan", pro:true},
    {id:"longunwind", title:"Long Unwinding Scanner",desc:"Long unwinding candidates", kind:"scan", pro:true},
    {id:"ivspike",    title:"IV Spike Scanner",      desc:"Implied volatility spikes", kind:"scan", pro:true},
    {id:"ivcrush",    title:"IV Crush Scanner",      desc:"IV crush candidates", kind:"scan", pro:true},
    {id:"greeks",     title:"Greeks Scanner",        desc:"Delta, Gamma, Theta, Vega scan", kind:"scan", pro:true},
    {id:"optchain",   title:"Option Chain Scanner",  desc:"Full chain analytics", kind:"tab", tab:"oi", pro:true}
  ]},
  {name:"AI Scanners", pro:true, items:[
    {id:"aibreakout", title:"AI Breakout Scanner",   desc:"AI-detected breakouts", kind:"scan", pro:true},
    {id:"aireversal", title:"AI Reversal Scanner",   desc:"AI-detected reversals", kind:"scan", pro:true},
    {id:"aitrend",    title:"AI Trend Scanner",      desc:"AI trend strength scan", kind:"scan", pro:true},
    {id:"aimomentum", title:"AI Momentum Scanner",   desc:"AI momentum leaders", kind:"scan", pro:true},
    {id:"aiswing",    title:"AI Swing Scanner",      desc:"AI swing setups", kind:"scan", pro:true},
    {id:"aisentiment",title:"AI Market Sentiment Scanner",desc:"AI sentiment gauge", kind:"scan", pro:true}
  ]},
  {name:"Learning", items:[
    {id:"candlelib",  title:"Candle Library",    desc:"All candlestick patterns", kind:"tab", tab:"signals"},
    {id:"chartpat",   title:"Chart Patterns",    desc:"Classic chart patterns", kind:"tab", tab:"signals"},
    {id:"priceaction",title:"Price Action",      desc:"Price action basics", kind:"tab", tab:"learn"},
    {id:"snr",        title:"Support & Resistance",desc:"Key level concepts", kind:"tab", tab:"learn"},
    {id:"optlearn",   title:"Options Learning",  desc:"Options from scratch", kind:"tab", tab:"learn"}
  ]},
  {name:"Smart Money", items:[
    {id:"fiidiiflow", title:"FII / DII Flow",    desc:"Daily institutional flow", kind:"tab", tab:"fiidii"},
    {id:"bulk",       title:"Bulk Deals",        desc:"Large bulk transactions", kind:"scan"},
    {id:"block",      title:"Block Deals",       desc:"Block deal activity", kind:"scan"},
    {id:"insider",    title:"Insider Trading",   desc:"Insider transaction disclosures", kind:"scan"},
    {id:"promoter",   title:"Promoter Buying/Selling",desc:"Promoter stake changes", kind:"scan"}
  ]},
  {name:"Calculators", items:[
    {id:"possize",    title:"Position Size Calculator", desc:"Size by risk per trade", kind:"calc"},
    {id:"riskreward", title:"Risk Reward Calculator",   desc:"R:R ratio planner", kind:"calc"},
    {id:"brokerage",  title:"Brokerage Calculator",     desc:"Charges and breakeven", kind:"calc"},
    {id:"margin",     title:"Margin Calculator",        desc:"Span and exposure margin", kind:"calc"},
    {id:"optpnl",     title:"Option P&L Calculator",    desc:"Payoff and breakeven", kind:"calc"},
    {id:"sip",        title:"SIP Calculator",           desc:"Wealth from monthly SIP", kind:"calc"},
    {id:"cagr",       title:"CAGR Calculator",          desc:"Compound annual growth", kind:"calc"},
    {id:"compound",   title:"Compound Interest Calculator",desc:"Power of compounding", kind:"calc"}
  ]},
  {name:"IPO & Investments", items:[
    {id:"ipotrack",   title:"IPO Tracker",      desc:"Live and upcoming IPOs", kind:"tab", tab:"ipo"},
    {id:"gmp",        title:"GMP",              desc:"Grey market premium", kind:"tab", tab:"ipo"},
    {id:"upcomingipo",title:"Upcoming IPOs",    desc:"IPO calendar", kind:"tab", tab:"ipo"},
    {id:"mftrack",    title:"Mutual Fund Tracker",desc:"Track MF NAV and returns", kind:"tab", tab:"learn"}
  ]}
];

// Mock scanner results - replace with dataService later. Each result has why/what/meaning/risk.
export function getScanResults(id){
  var base=MOCK[id]||MOCK._default;
  return base;
}

var STOCKS=[
  {sym:"RELIANCE",ltp:"2,845",pct:1.7,up:true},
  {sym:"SBIN",ltp:"812",pct:2.3,up:true},
  {sym:"TATASTEEL",ltp:"148",pct:-1.2,up:false},
  {sym:"INFY",ltp:"1,568",pct:0.9,up:true},
  {sym:"WIPRO",ltp:"174",pct:-2.1,up:false},
  {sym:"ICICIBANK",ltp:"1,289",pct:1.4,up:true}
];

var MOCK = {
  _default:{
    results:STOCKS,
    why:"These stocks match the scanner's technical criteria right now.",
    what:"The scanner detected a notable change in price, volume, or positioning.",
    meaning:"Use this as a starting point for your own study, not as a signal to act.",
    risk:"Scanners detect conditions, not certainties. Always confirm with your own analysis."
  },
  breakout:{
    results:STOCKS.filter(function(s){return s.up;}),
    why:"Price closed above a recent resistance zone with rising volume.",
    what:"A breakout is when price clears a level many traders were watching.",
    meaning:"Breakouts show momentum, but many fail; confirmation and volume matter.",
    risk:"False breakouts are common. A breakout is not a buy recommendation."
  },
  breakdown:{
    results:STOCKS.filter(function(s){return !s.up;}),
    why:"Price closed below a recent support zone with rising volume.",
    what:"A breakdown is when price falls through a level buyers were defending.",
    meaning:"Breakdowns show weakness, but can reverse; context matters.",
    risk:"Breakdowns can trap sellers on a bounce. Not a sell recommendation."
  },
  pcr:{
    results:STOCKS.slice(0,4),
    why:"PCR for these names moved to an extreme versus their recent range.",
    what:"PCR compares put OI to call OI to gauge positioning.",
    meaning:"Extreme PCR can signal crowded positioning, sometimes contrarian.",
    risk:"PCR alone is not directional. Pair with price and OI."
  },
  gammablast:{
    results:STOCKS.slice(0,3),
    why:"High gamma near the money with expiry approaching.",
    what:"Gamma blast describes fast moves when dealer hedging accelerates.",
    meaning:"Educational concept showing how option mechanics can amplify moves.",
    risk:"High gamma cuts both ways and is very risky near expiry."
  }
};
