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
  {label:"NIFTY 50",   ltp:23982.87, pct:1.47, up:true},
  {label:"SENSEX",     ltp:76695.34, pct:1.54, up:true},
  {label:"BANK NIFTY", ltp:52161.30, pct:1.69, up:true},
  {label:"FIN NIFTY",  ltp:23445.10, pct:0.85, up:true},
  {label:"INDIA VIX",  ltp:14.20,    pct:-2.75,up:false},
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
