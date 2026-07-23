// BreakoutPro - PulseData.jsx
// Data + time-aware market status logic for AI Market Briefing.
// Rules: no backticks, no triple-equals, ASCII only.

// Time-aware market status. Returns phase + label + color.
export function getMarketStatus(){
  var d=new Date();
  var day=d.getDay();
  var mins=d.getHours()*60+d.getMinutes();
  var weekend=(day==0||day==6);
  if(weekend){
    return {phase:"closed",label:"Market Closed",sub:"Weekend - Opens Monday 9:15 AM",dot:"#5B6472",col:"#A0A7B4"};
  }
  if(mins>=540&&mins<555){
    return {phase:"preopen",label:"Pre-Open Session",sub:"9:00 - 9:15 AM - Order matching",dot:"#F59E0B",col:"#F59E0B"};
  }
  if(mins>=555&&mins<930){
    return {phase:"live",label:"Market Live",sub:"NSE - BSE open till 3:30 PM",dot:"#22C55E",col:"#22C55E"};
  }
  if(mins>=300&&mins<540){
    return {phase:"premarket",label:"Pre-Market",sub:"Opens 9:15 AM - Check SGX, US, Crude",dot:"#F59E0B",col:"#F59E0B"};
  }
  if(mins>=930&&mins<1410){
    return {phase:"closed",label:"Market Closed",sub:"Closed at 3:30 PM - MCX till 11:30 PM",dot:"#5B6472",col:"#A0A7B4"};
  }
  return {phase:"closed",label:"Market Closed",sub:"Opens 9:15 AM tomorrow",dot:"#5B6472",col:"#A0A7B4"};
}

export var INDICES = [
  {label:"NIFTY 50",   key:"NIFTY",    ltp:23982.87, pct:1.47, up:true,  prevClose:23635.67, dayHigh:24010.20, dayLow:23720.40, res:"24,050 / 24,150", sup:"23,850 / 23,750", desc:"Top 50 large-cap NSE stocks", pe:"22.4", note:"Strong momentum, FII buying support. Watch 24,050 resistance for breakout."},
  {label:"SENSEX",     key:"SENSEX",   ltp:76695.34, pct:1.54, up:true,  prevClose:75531.84, dayHigh:76780.10, dayLow:75920.60, res:"77,000 / 77,400", sup:"76,200 / 75,800", desc:"Top 30 large-cap BSE stocks", pe:"24.1", note:"Banking and IT heavyweights driving gains. Above all key moving averages."},
  {label:"BANK NIFTY", key:"BANKNIFTY",ltp:52161.30, pct:1.69, up:true,  prevClose:51294.90, dayHigh:52240.50, dayLow:51610.20, res:"52,500 / 53,000", sup:"51,800 / 51,500", desc:"Top 12 liquid banking stocks", pe:"18.2", note:"Breakout above 52,500 confirms strength. Private banks leading."},
  {label:"GIFT NIFTY", key:"GIFTNIFTY",ltp:24035.00, pct:0.32, up:true,  prevClose:23958.20, dayHigh:24060.00, dayLow:23980.00, res:"24,100 / 24,200", sup:"23,900 / 23,800", desc:"NSE IX early indicator for Nifty", pe:"N/A", note:"Trades nearly 24 hours. Strong indicator for Nifty opening direction."},
  {label:"FIN NIFTY",  key:"FINNIFTY", ltp:23445.10, pct:0.85, up:true,  prevClose:23247.60, dayHigh:23490.30, dayLow:23320.10, res:"23,600 / 23,750", sup:"23,300 / 23,150", desc:"Financial services index", pe:"20.1", note:"Banks, NBFCs and insurance. Tracks broader financial sector health."},
  {label:"MIDCAP 50",  key:"MIDCAP",   ltp:54320.75, pct:-0.26,up:false, prevClose:54462.40, dayHigh:54610.20, dayLow:54180.30, res:"55,000 / 55,400", sup:"54,000 / 53,600", desc:"Mid-cap companies index", pe:"28.5", note:"Mild profit booking after rally. Broader market consolidating."},
  {label:"NIFTY IT",   key:"NIFTYIT",  ltp:34210.55, pct:0.92, up:true,  prevClose:33898.10, dayHigh:34290.40, dayLow:33950.60, res:"34,500 / 34,800", sup:"34,000 / 33,700", desc:"IT sector index", pe:"29.4", note:"Strong Q4 earnings. US tech sector positive overnight boosts sentiment."},
  {label:"INDIA VIX",  key:"VIX",      ltp:14.20,    pct:-2.75,up:false, prevClose:14.60,    dayHigh:14.85,    dayLow:14.05,    res:"16.0 / 17.5", sup:"13.0 / 12.5", desc:"Market fear gauge - volatility index", pe:"N/A", note:"Low VIX indicates calm, trending market. Option sellers favoured."},
];

export var GAINERS = [
  {sym:"ADANIENT", ltp:2847.50, pct:4.21},
  {sym:"TATASTEEL",ltp:987.30,  pct:3.45},
  {sym:"SBIN",     ltp:824.60,  pct:2.89},
];

export var LOSERS = [
  {sym:"WIPRO",     ltp:478.20,  pct:-2.14},
  {sym:"HCLTECH",   ltp:1423.70, pct:-1.67},
  {sym:"ASIANPAINT",ltp:2634.50, pct:-1.23},
];

export var ACTIVE = [
  {sym:"HDFCBANK", val:"4,231 Cr"},
  {sym:"ICICIBANK",val:"3,876 Cr"},
  {sym:"RELIANCE", val:"3,654 Cr"},
];

export var GLOBAL = [
  {label:"Dow Jones", val:"42,750", chg:"+0.55%", up:true,  col:"#22C55E"},
  {label:"Nasdaq",    val:"18,920", chg:"+0.46%", up:true,  col:"#22C55E"},
  {label:"S&P 500",   val:"5,890",  chg:"+0.34%", up:true,  col:"#22C55E"},
  {label:"Nikkei",    val:"39,210", chg:"-0.28%", up:false, col:"#EF4444"},
  {label:"Hang Seng", val:"17,420", chg:"-0.62%", up:false, col:"#EF4444"},
  {label:"Crude Oil", val:"$82.4",  chg:"+1.23%", up:true,  col:"#F59E0B"},
  {label:"Gold",      val:"$2,312", chg:"+0.45%", up:true,  col:"#D4AF37"},
  {label:"Dollar Idx",val:"104.2",  chg:"-0.18%", up:false, col:"#3B82F6"},
];

export var SECTORS = [
  {name:"Banking", pct:1.84, up:true},
  {name:"IT",      pct:0.92, up:true},
  {name:"Metal",   pct:2.14, up:true},
  {name:"Pharma",  pct:1.23, up:true},
  {name:"Auto",    pct:-0.67,up:false},
  {name:"FMCG",    pct:0.34, up:true},
  {name:"Realty",  pct:-1.23,up:false},
  {name:"Energy",  pct:0.78, up:true},
];

export var LEVELS = [
  {name:"NIFTY",     res:"24,050 / 24,150", sup:"23,850 / 23,750"},
  {name:"BANK NIFTY",res:"52,500 / 53,000", sup:"51,800 / 51,500"},
];

export var OPTIONS = [
  {label:"PCR",      val:"1.18", tag:"Bullish",  col:"#22C55E"},
  {label:"Max Pain", val:"23,900",tag:"Magnet",  col:"#3B82F6"},
  {label:"Call OI",  val:"24,100",tag:"Resistance",col:"#EF4444"},
  {label:"Put OI",   val:"23,800",tag:"Support",  col:"#22C55E"},
];

export var FIIDII = [
  {label:"FII Net", val:"+2,840 Cr", up:true},
  {label:"DII Net", val:"+1,120 Cr", up:true},
];

export var MARKET_SUMMARY = {
  advances:1693,
  declines:812,
  sentiment:"Bullish",
  sentimentPct:68,
};

// AI conclusion - bias, probability, risk, message.
export var AI_CONCLUSION = {
  bias:"Bullish",
  biasUp:true,
  probability:"72%",
  risk:"Moderate",
  message:"Markets likely to open positive on strong global cues and sustained FII buying. IT and Banking showing leadership. Nifty faces resistance near 24,050 - a decisive breakout opens the path to 24,400. Maintain a buy-on-dips approach while keeping strict stop losses. Watch India VIX for volatility shifts."
};

export var STOCKS_WATCH=[
  {sym:"RELIANCE",reason:"Q4 results today. Strong refining margins expected. Volume buildup seen.",type:"Event",color:"#3B82F6"},
  {sym:"HDFCBANK",reason:"FII buying seen yesterday. Strong support at 1720. Watch breakout above 1760.",type:"Technical",color:"#00E676"},
  {sym:"TATAMOTORS",reason:"EV sales data positive. Global auto sector strong overnight.",type:"Sector",color:"#F59E0B"},
  {sym:"INFY",reason:"US tech sector up overnight. IT sector may see buying. ADR premium.",type:"Global",color:"#8B5CF6"},
  {sym:"SBIN",reason:"RBI policy positive for PSU banks. Strong OI buildup in 820 CE.",type:"OI Data",color:"#EC4899"},
];
