export var GLOBAL_MKT = [
  {name:"Dow Jones",val:38654.42,chg:0.82,up:true},
  {name:"Nasdaq",val:16234.10,chg:1.24,up:true},
  {name:"S and P 500",val:5123.67,chg:0.94,up:true},
  {name:"Nikkei 225",val:38156.97,chg:-0.34,up:false},
  {name:"Hang Seng",val:17823.45,chg:-0.87,up:false},
  {name:"SGX Nifty",val:22510,chg:0.19,up:true},
  {name:"Crude Oil",val:82.34,chg:1.23,up:true},
  {name:"Gold",val:2312.50,chg:0.45,up:true},
  {name:"Silver",val:27.84,chg:-0.32,up:false},
  {name:"DXY",val:104.23,chg:-0.18,up:false},
];
export var AI_KB = {
  "what is nifty":"NIFTY 50 is an index of 50 large-cap stocks on NSE. Represents 65% of total market cap.",
  "what is oi":"Open Interest = total outstanding contracts. Rising OI + rising price = Long Buildup (bullish).",
  "what is pcr":"Put-Call Ratio = Put OI / Call OI. PCR below 0.7 = Bullish. PCR above 1.3 = Bearish.",
  "what is vwap":"VWAP = Volume Weighted Average Price. Price above VWAP = bullish intraday bias.",
  "what is rsi":"RSI (0-100). Above 70 = Overbought. Below 30 = Oversold.",
  "what is macd":"MACD signal line crossover = trend change. Histogram = momentum.",
  "what is max pain":"Strike where options buyers lose maximum at expiry.",
  "what is delta":"Delta = option price change per Re 1 move. Call 0 to 1. Put 0 to -1.",
  "what is theta":"Theta = time decay. Options lose value daily.",
  "explain breakout":"Price breaking above resistance with high volume. Confirm with 1.5x average volume.",
  "what is support":"Support = price level where buyers prevent further fall.",
};
export var CANDLE_PATTERNS = [
  {name:"Bullish Engulfing",type:"Bullish",desc:"Large green candle engulfs previous red candle. Strong reversal at support."},
  {name:"Bearish Engulfing",type:"Bearish",desc:"Large red candle engulfs previous green. Strong reversal at resistance."},
  {name:"Doji",type:"Neutral",desc:"Open and close nearly equal. Shows indecision at key levels."},
  {name:"Hammer",type:"Bullish",desc:"Small body, long lower wick at bottom of downtrend."},
  {name:"Shooting Star",type:"Bearish",desc:"Small body, long upper wick at top of uptrend."},
  {name:"Morning Star",type:"Bullish",desc:"3-candle: red, doji, green. Strong reversal at support."},
];
export var SUB_PLANS = [
  {id:"monthly",name:"Monthly",price:299,tag:"Most Popular",color:"#00C853",
   features:["Unlimited AI Chat","All Breakout Alerts","AI Market Briefing","Advanced OI","Premium Education","No Ads"]},
  {id:"quarterly",name:"Quarterly",price:799,tag:"Save 11%",color:"#8B5CF6",
   features:["Everything in Monthly","Priority Support","Strategy Builder Pro"]},
  {id:"yearly",name:"Yearly",price:1999,tag:"Best Value 44% off",color:"#3B82F6",
   features:["Everything in Quarterly","Voice AI","Portfolio Analytics","Lifetime Price Lock"]},
];
export var LESSONS = [
  "Support becomes resistance once broken. Watch for retests.",
  "Never risk more than 1-2% of capital on a single trade.",
  "Volume confirms price moves. Breakout without volume = false breakout.",
  "VWAP is the most important intraday level. Price above VWAP = bullish.",
  "Theta works against option buyers every single day.",
  "High PCR above 1.3 = oversold. Low PCR below 0.7 = overbought.",
  "Trade in the direction of the larger timeframe trend.",
];
