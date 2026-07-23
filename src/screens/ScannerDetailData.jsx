// BreakoutPro - ScannerDetailData.jsx
// Rich detail data for scanner pages: stock metrics, AI analysis, news, performance.
// API-ready (mock now). Educational only. Rules: no backtick, no triple-equals, ASCII.

// Enriched stock rows with full metrics.
var STOCKS = [
  {sym:"RELIANCE",ltp:"2,845",pct:1.7,up:true,vol:"8.2M",rvol:1.8,sector:"Energy",mcap:"19.2L Cr",trend:"Up",strength:82,liquidity:95,volatility:48},
  {sym:"SBIN",ltp:"812",pct:2.3,up:true,vol:"24M",rvol:2.4,sector:"Banking",mcap:"7.2L Cr",trend:"Up",strength:78,liquidity:92,volatility:54},
  {sym:"INFY",ltp:"1,568",pct:0.9,up:true,vol:"6.1M",rvol:1.3,sector:"IT",mcap:"6.5L Cr",trend:"Up",strength:71,liquidity:88,volatility:42},
  {sym:"TATASTEEL",ltp:"148",pct:-1.2,up:false,vol:"32M",rvol:1.6,sector:"Metal",mcap:"1.8L Cr",trend:"Down",strength:38,liquidity:90,volatility:62},
  {sym:"WIPRO",ltp:"174",pct:-2.1,up:false,vol:"14M",rvol:2.1,sector:"IT",mcap:"1.9L Cr",trend:"Down",strength:34,liquidity:80,volatility:58},
  {sym:"ICICIBANK",ltp:"1,289",pct:1.4,up:true,vol:"11M",rvol:1.5,sector:"Banking",mcap:"9.1L Cr",trend:"Up",strength:80,liquidity:94,volatility:46}
];

export function getScannerDetail(id){
  var base=DETAILS[id]||DETAILS._default;
  var results=base.filter?STOCKS.filter(base.filter):STOCKS;
  return {
    title:base.title, results:results,
    summary:base.summary, ai:base.ai, copilot:base.copilot,
    metrics:base.metrics, news:base.news||DEFAULT_NEWS,
    performance:base.performance||DEFAULT_PERF, learn:base.learn,
    similar:base.similar||[]
  };
}

var DEFAULT_NEWS=[
  {time:"2h ago",src:"ET Markets",head:"Indices hold gains as banking and IT lead the session"},
  {time:"4h ago",src:"Mint",head:"FII flows turn positive ahead of monthly expiry"},
  {time:"6h ago",src:"BS",head:"Volatility stays subdued as VIX holds near yearly lows"}
];
var DEFAULT_PERF={ rate:"62%", avg:"3.1%", note:"Educational backtest over the last 250 sessions. Past behaviour does not predict future results." };

var DETAILS = {
  _default:{ title:"Scanner", filter:null,
    summary:"This scanner highlights stocks meeting its technical criteria right now. Use it as a study starting point, not a signal.",
    ai:"The scanner groups stocks by a shared condition such as a price, volume, or positioning change. Studying why each appears builds pattern recognition over time.",
    copilot:"This scanner looks for a specific market condition and lists every stock that currently matches it. It is a discovery tool for learning, not a recommendation engine.",
    metrics:[{k:"Stocks Detected",v:"6"},{k:"Avg RVOL",v:"1.8x"},{k:"Bullish",v:"4"},{k:"Bearish",v:"2"}],
    learn:"Scanners filter the market by rules. Learning to read why a stock appears, and confirming with your own analysis, is the core skill.",
    similar:["Volume Spike Scanner","RSI Scanner","Breakout Scanner"] },
  breakout:{ title:"Breakout Scanner", filter:function(s){return s.up;},
    summary:"Stocks closing above a recent resistance zone with rising volume. Breakouts show momentum but can fail without follow-through.",
    ai:"A breakout means price has cleared a level many traders watched. Rising volume on the break suggests genuine interest rather than a false move. Sellers of resistance may be stepping back, letting price move up. The key study is whether volume confirms and whether the level holds on a retest. Breakouts into a strong trend tend to follow through more often than those against it.",
    copilot:"The Breakout Scanner finds stocks pushing above resistance with volume support. It teaches you to spot momentum shifts. It never tells you to buy; it shows you where to study.",
    metrics:[{k:"Detected",v:"4"},{k:"Avg RVOL",v:"1.9x"},{k:"With Volume",v:"4"},{k:"Failed Risk",v:"Medium"}],
    learn:"A breakout is a move above resistance. Volume confirmation and a successful retest raise its quality. Many breakouts fail, so confirmation matters.",
    similar:["Breakdown Scanner","Volume Spike Scanner","ORB Scanner"] },
  breakdown:{ title:"Breakdown Scanner", filter:function(s){return !s.up;},
    summary:"Stocks closing below a recent support zone with rising volume. Breakdowns show weakness but can reverse sharply.",
    ai:"A breakdown is price falling through a level buyers defended. Rising volume suggests real selling pressure. The study is whether the level now acts as resistance and whether sellers stay in control. Breakdowns in a weak market follow through more often than those in a strong one.",
    copilot:"The Breakdown Scanner finds stocks losing support with volume. It teaches you to recognise weakness. It never suggests selling; it shows you where to learn.",
    metrics:[{k:"Detected",v:"2"},{k:"Avg RVOL",v:"1.8x"},{k:"With Volume",v:"2"},{k:"Reversal Risk",v:"Medium"}],
    learn:"A breakdown is a move below support. Confirmation and follow-through matter, as many breakdowns reverse on a bounce.",
    similar:["Breakout Scanner","Volume Spike Scanner"] },
  volspike:{ title:"Volume Spike Scanner", filter:function(s){return s.rvol>=1.8;},
    summary:"Stocks trading at unusually high volume versus their average, often a sign of fresh interest or news.",
    ai:"A volume spike means far more shares are changing hands than usual, measured by Relative Volume. High RVOL often accompanies news, breakouts, or institutional activity. The study is whether the volume supports a price move or signals distribution. Volume without price progress can hint at a struggle between buyers and sellers.",
    copilot:"The Volume Spike Scanner finds unusual activity using RVOL. It teaches you to notice when something has changed. It is educational, not a call to act.",
    metrics:[{k:"Detected",v:"3"},{k:"Max RVOL",v:"2.4x"},{k:"Bullish",v:"2"},{k:"Bearish",v:"1"}],
    learn:"Relative Volume compares today's volume to the average. A reading above 2 is a strong spike worth studying.",
    similar:["Breakout Scanner","Delivery Volume Scanner"] },
  rsi:{ title:"RSI Scanner", filter:null,
    summary:"Stocks reaching overbought or oversold RSI zones, a study of momentum extremes.",
    ai:"RSI measures momentum on a 0 to 100 scale. Above 70 is often called overbought; below 30 oversold. These are not signals by themselves; strong trends can stay overbought for a long time. The study is whether momentum is stretched and whether it is confirmed by price structure.",
    copilot:"The RSI Scanner finds momentum extremes. It teaches you to read momentum, not to trade blindly off a number.",
    metrics:[{k:"Overbought",v:"2"},{k:"Oversold",v:"2"},{k:"Neutral",v:"2"},{k:"Avg RSI",v:"54"}],
    learn:"RSI above 70 is overbought, below 30 oversold. In strong trends these levels can persist, so context matters.",
    similar:["Breakout Scanner","Volume Spike Scanner"] },
  pcr:{ title:"PCR Scanner", filter:function(s){return true;},
    summary:"Stocks and indices where Put-Call Ratio reached an extreme versus their recent range.",
    ai:"PCR compares put OI to call OI. A high PCR shows heavy put writing, often read as supportive; a very high PCR can be contrarian. A low PCR shows heavy call activity. The study is positioning, not direction by itself. PCR works best alongside price and OI structure.",
    copilot:"The PCR Scanner finds positioning extremes in options. It teaches you to read crowd sentiment through option data.",
    metrics:[{k:"High PCR",v:"3"},{k:"Low PCR",v:"1"},{k:"Avg PCR",v:"1.12"},{k:"Bias",v:"Mild Bull"}],
    learn:"PCR above 1 means more puts than calls in OI. Extremes can be contrarian. Always pair PCR with price.",
    similar:["Max Pain Scanner","OI Build-up Scanner"] }
};
