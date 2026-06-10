import { useState, useEffect, useRef } from "react";

// --- CONSTANTS ----------------------------------------------------------------
var PROXY = "/api/nse";
var GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";
var G = "#00C853";
var R = "#EF4444";
var DISCLAIMER = "Educational only. Not SEBI registered. Not investment advice.";

var STOCKS_DEFAULT = [
  {sym:"RELIANCE",name:"Reliance Industries",ltp:2845.60,open:2798.00,chgPct:1.71,up:true,sect:"Energy",vol:"12.4M",cap:"Large"},
  {sym:"TCS",name:"Tata Consultancy",ltp:3654.20,open:3690.00,chgPct:-0.97,up:false,sect:"IT",vol:"3.2M",cap:"Large"},
  {sym:"HDFCBANK",name:"HDFC Bank",ltp:1742.50,open:1710.00,chgPct:1.90,up:true,sect:"Bank",vol:"8.7M",cap:"Large"},
  {sym:"ICICIBANK",name:"ICICI Bank",ltp:1289.30,open:1260.00,chgPct:2.33,up:true,sect:"Bank",vol:"7.1M",cap:"Large"},
  {sym:"INFY",name:"Infosys",ltp:1567.80,open:1590.00,chgPct:-1.40,up:false,sect:"IT",vol:"5.4M",cap:"Large"},
  {sym:"WIPRO",name:"Wipro",ltp:478.90,open:465.00,chgPct:2.99,up:true,sect:"IT",vol:"9.2M",cap:"Large"},
  {sym:"TATAMOTORS",name:"Tata Motors",ltp:945.60,open:925.00,chgPct:2.23,up:true,sect:"Auto",vol:"11.3M",cap:"Large"},
  {sym:"MARUTI",name:"Maruti Suzuki",ltp:13240.00,open:13100.00,chgPct:1.07,up:true,sect:"Auto",vol:"1.2M",cap:"Large"},
  {sym:"SUNPHARMA",name:"Sun Pharma",ltp:1678.40,open:1695.00,chgPct:-0.98,up:false,sect:"Pharma",vol:"4.5M",cap:"Large"},
  {sym:"BAJFINANCE",name:"Bajaj Finance",ltp:7234.50,open:7100.00,chgPct:1.90,up:true,sect:"NBFC",vol:"2.8M",cap:"Large"},
];

var SECTOR_DATA = [
  {name:"IT",chg:1.82},{name:"Bank",chg:1.24},{name:"Auto",chg:0.94},
  {name:"Pharma",chg:-0.32},{name:"Energy",chg:1.35},{name:"Metal",chg:3.24},
  {name:"FMCG",chg:0.18},{name:"Realty",chg:2.10},{name:"Infra",chg:0.76},
];

var NEWS_DEFAULT = [
  {title:"RBI holds rates steady, signals neutral stance for next quarter",time:"2h ago",cat:"Policy",bull:true},
  {title:"NIFTY crosses 22,500 mark on strong FII inflows of Rs 4,200 Cr",time:"3h ago",cat:"Markets",bull:true},
  {title:"Q4 results season kicks off -- IT sector beats estimates by 8%",time:"4h ago",cat:"Results",bull:true},
  {title:"Crude oil rises 2.3% on OPEC supply cut announcement",time:"5h ago",cat:"Global",bull:false},
  {title:"SEBI proposes new F&amp;O margin rules effective next month",time:"6h ago",cat:"Regulatory",bull:false},
];

var CANDLE_PATTERNS = [
  {name:"Bullish Engulfing",type:"Bullish",desc:"A large green candle completely engulfs the previous red candle. Strong reversal signal at support."},
  {name:"Bearish Engulfing",type:"Bearish",desc:"A large red candle engulfs the previous green candle. Strong reversal at resistance."},
  {name:"Doji",type:"Neutral",desc:"Open and close are nearly equal. Shows indecision. Powerful when at key levels."},
  {name:"Hammer",type:"Bullish",desc:"Small body, long lower wick. Forms at bottom of downtrend. Bulls rejected selling."},
  {name:"Shooting Star",type:"Bearish",desc:"Small body, long upper wick. Forms at top of uptrend. Bears rejected buying."},
  {name:"Morning Star",type:"Bullish",desc:"3-candle pattern: red, doji, green. Strong reversal at support."},
  {name:"Evening Star",type:"Bearish",desc:"3-candle pattern: green, doji, red. Strong reversal at resistance."},
  {name:"Marubozu",type:"Bullish",desc:"Full-body candle with no wicks. Shows complete dominance by one side."},
];

var TERMS_DATA = [
  {term:"Support",def:"Price level where buying interest is strong enough to prevent further decline."},
  {term:"Resistance",def:"Price level where selling pressure prevents further rise."},
  {term:"PCR",def:"Put-Call Ratio. Below 0.7 = bullish, above 1.3 = bearish sentiment."},
  {term:"OI",def:"Open Interest. Total outstanding contracts. Rising OI with rising price = bullish."},
  {term:"Max Pain",def:"Strike price where option buyers lose most money at expiry."},
  {term:"VWAP",def:"Volume Weighted Average Price. Used to gauge intraday trend direction."},
  {term:"RSI",def:"Relative Strength Index. Above 70 = overbought, below 30 = oversold."},
  {term:"MACD",def:"Moving Average Convergence Divergence. Trend + momentum indicator."},
];

var QUICK_QS = [
  "What is Support and Resistance?","Explain Bullish Engulfing pattern",
  "What is PCR in options?","Explain Delta and Theta Greeks",
  "What is VWAP?","Explain Breakout trading",
  "What is Max Pain?","Explain Risk Reward ratio",
];

var GLOBAL_MARKETS = [
  {name:"Dow Jones", val:38654.42, chg:0.82, up:true, ico:"US"},
  {name:"Nasdaq", val:16234.10, chg:1.24, up:true, ico:"US"},
  {name:"S&P 500", val:5123.67, chg:0.94, up:true, ico:"US"},
  {name:"Nikkei 225", val:38156.97, chg:-0.34, up:false, ico:"JP"},
  {name:"Hang Seng", val:17823.45, chg:-0.87, up:false, ico:"HK"},
  {name:"SGX Nifty", val:22510.00, chg:0.19, up:true, ico:"SG"},
  {name:"Crude Oil", val:82.34, chg:1.23, up:true, ico:"🛢"},
  {name:"Gold", val:2312.50, chg:0.45, up:true, ico:"🥇"},
  {name:"Silver", val:27.84, chg:-0.32, up:false, ico:"🥈"},
  {name:"Dollar Index", val:104.23, chg:-0.18, up:false, ico:"💵"},
];

var ECO_CALENDAR = [
  {date:"2025-06-12", event:"RBI Monetary Policy", imp:"HIGH", country:"IN", prev:"6.5%", exp:"6.5%"},
  {date:"2025-06-14", event:"US CPI Inflation", imp:"HIGH", country:"US", prev:"3.4%", exp:"3.3%"},
  {date:"2025-06-19", event:"US Fed Rate Decision", imp:"HIGH", country:"US", prev:"5.5%", exp:"5.5%"},
  {date:"2025-06-28", event:"India GDP Q4", imp:"MED", country:"IN", prev:"8.4%", exp:"7.8%"},
  {date:"2025-07-05", event:"US Jobs Report", imp:"HIGH", country:"US", prev:"272K", exp:"180K"},
  {date:"2025-07-11", event:"US CPI Inflation", imp:"HIGH", country:"US", prev:"3.3%", exp:"3.1%"},
];

var IPO_DATA_LIST = [
  {name:"BreakoutTech IPO", open:"Jun 15", close:"Jun 17", price:"Rs 420-440", lot:34, gmp:"+Rs 85", sub:"12.4x", status:"Open"},
  {name:"IndiaGrow SME", open:"Jun 18", close:"Jun 20", price:"Rs 190-200", lot:75, gmp:"+Rs 28", sub:"34.2x", status:"Upcoming"},
  {name:"PowerGrid Green", open:"May 28", close:"May 30", price:"Rs 78-82", lot:180, gmp:"--", sub:"--", status:"Listed"},
];

var MARKET_MOOD = {bull:62, bear:24, neutral:14, sentiment:"Bullish", vix:14.2, fii_net:2340};

var TRADER_QUOTES = [
  {name:"Rakesh Jhunjhunwala", quote:"Never lose big. If you lose big, you are out of the game.", role:"Big Bull of India"},
  {name:"Warren Buffett", quote:"Be fearful when others are greedy and greedy when others are fearful.", role:"Oracle of Omaha"},
  {name:"Ramesh Damani", quote:"Markets are devices to transfer money from the impatient to the patient.", role:"Market Veteran"},
  {name:"Jesse Livermore", quote:"The market is never wrong -- opinions often are.", role:"Legendary Trader"},
  {name:"Peter Lynch", quote:"Know what you own and why you own it.", role:"Fund Manager"},
];

var CHALLENGES = [
  {id:"candle_q", type:"quiz", title:"Candlestick Quiz", q:"What pattern shows indecision in the market?", opts:["Doji","Hammer","Marubozu","Engulfing"], ans:0, xp:10},
  {id:"oi_q", type:"quiz", title:"OI Concept", q:"Rising OI with rising price indicates:", opts:["Long buildup","Short covering","Long unwinding","Short buildup"], ans:0, xp:10},
  {id:"pcr_q", type:"quiz", title:"PCR Question", q:"PCR below 0.7 is generally considered:", opts:["Bullish","Bearish","Neutral","Volatile"], ans:0, xp:15},
  {id:"rsi_q", type:"quiz", title:"RSI Question", q:"RSI above 70 indicates:", opts:["Overbought","Oversold","Neutral","Trending"], ans:0, xp:10},
  {id:"vwap_q", type:"quiz", title:"VWAP Challenge", q:"Price above VWAP during market hours means:", opts:["Bullish trend","Bearish trend","No trend","Low volume"], ans:0, xp:15},
];

var DIVIDEND_DATA = [
  {sym:"HDFCBANK", type:"Dividend", amt:"Rs 19.50", exDate:"Jun 22", payDate:"Jun 30"},
  {sym:"TCS", type:"Dividend", amt:"Rs 28.00", exDate:"Jun 18", payDate:"Jun 26"},
  {sym:"INFY", type:"Dividend", amt:"Rs 21.00", exDate:"Jul 02", payDate:"Jul 10"},
  {sym:"RELIANCE", type:"Bonus", amt:"1:1", exDate:"Jul 15", payDate:"Jul 20"},
  {sym:"WIPRO", type:"Split", amt:"1:5", exDate:"Jun 30", payDate:"Jul 05"},
];

var STRATEGY_DATA = {
  ema: {name:"EMA Crossover", desc:"Buy when 9 EMA crosses above 21 EMA with volume surge. Sell when 9 EMA crosses below 21 EMA.", rules:["Check 15min/1hr timeframe","Volume should be 1.5x average","Stop loss below recent swing low","Target 1:2 risk reward"]},
  vwap: {name:"VWAP Strategy", desc:"Buy pullbacks to VWAP in uptrend. First 30 minutes breakout above VWAP is high probability.", rules:["Use only during market hours","Best in first 2 hours","Volume confirmation required","Exit at resistance levels"]},
  breakout: {name:"Breakout Strategy", desc:"Buy breakout above resistance with volume. Wait for candle close above level before entry.", rules:["Mark key resistance level","Wait for breakout + retest","Volume must be 2x average","Trail stop as price moves up"]},
  scalp: {name:"Scalping Strategy", desc:"Quick 5-15 min trades near support/resistance. Use 1-3min charts for entries.", rules:["Trade in first 90 mins only","Use 1min/3min charts","Target 0.3-0.5% move","Strict 0.2% stop loss"]},
};

var AI_KB = {
  "what is nifty": "NIFTY 50 is an index of 50 large-cap stocks on NSE. It represents ~65% of total market cap. Used as benchmark for Indian equity markets.",
  "what is sensex": "SENSEX is 30-stock index on BSE. Oldest Indian market index started in 1986. Calculated using free-float market cap method.",
  "what is oi": "Open Interest (OI) is total outstanding derivatives contracts. Rising OI with rising price = bullish (long buildup). Rising OI with falling price = bearish (short buildup).",
  "what is pcr": "Put-Call Ratio = Total Put OI / Total Call OI. PCR < 0.7 = Bullish market, PCR > 1.3 = Bearish market, 0.7-1.3 = Neutral.",
  "what is vwap": "VWAP = Volume Weighted Average Price. Average price weighted by volume. Institutions use it as benchmark. Price above VWAP = bullish intraday bias.",
  "what is rsi": "RSI = Relative Strength Index (0-100). Above 70 = Overbought (potential reversal down). Below 30 = Oversold (potential reversal up). 40-60 = Neutral zone.",
  "what is macd": "MACD = Moving Average Convergence Divergence. When MACD line crosses above signal line = bullish. Below signal line = bearish. Used for trend + momentum.",
  "what is max pain": "Max Pain = Strike price where maximum options buyers lose money at expiry. Stocks tend to gravitate towards max pain near expiry due to market maker hedging.",
  "what is delta": "Delta measures option price change per Re 1 move in underlying. Call delta: 0 to 1. Put delta: 0 to -1. ATM options have ~0.5 delta.",
  "what is theta": "Theta = Time decay of options. Options lose value every day even if stock doesn't move. Theta is highest for ATM options near expiry.",
  "what is iv": "IV = Implied Volatility. High IV = expensive options. Low IV = cheap options. Buy options when IV is low, sell when IV is high.",
  "explain breakout": "Breakout = Price breaking above resistance with high volume. Steps: 1) Identify resistance 2) Wait for candle close above 3) Confirm with 1.5-2x volume 4) Enter with stop below breakout level.",
  "what is support": "Support = Price level where buyers are strong enough to prevent further fall. Price tends to bounce from support. Break of support = bearish signal.",
  "what is resistance": "Resistance = Price level where sellers prevent further rise. Price tends to reverse at resistance. Break of resistance with volume = bullish breakout.",
};

// -- SUBSCRIPTION PLANS --------------------------------------------------------
var SUB_PLANS = [
  {id:"free", name:"Free", price:0, tag:"7 Days Trial", color:"#6B7280",
   features:["7 Days Premium Access","Basic AI Chat (10/day)","Basic Scanner","Basic News","Basic Learning","Basic Alerts"]},
  {id:"monthly", name:"Monthly", price:299, tag:"Most Popular", color:"#00C853", period:"per month",
   features:["Unlimited AI Chat","Unlimited Scanner","All Breakout Alerts","AI Market Briefing","Advanced OI Chain","Premium Education","Premium Strategies","No Ads","Multi Device Login"]},
  {id:"quarterly", name:"Quarterly", price:799, tag:"Save 11%", color:"#8B5CF6", period:"per 3 months",
   features:["Everything in Monthly","Priority Support","Strategy Builder Pro","Extended OI History"]},
  {id:"yearly", name:"Yearly", price:1999, tag:"Best Value -- Save 44%", color:"#3B82F6", period:"per year",
   features:["Everything in Quarterly","AI Voice Assistant","Portfolio Analytics","Exclusive Webinars","Lifetime Price Lock","Early Access to New Features"]},
];

// -- NOTIFICATION CONFIG -------------------------------------------------------
var NOTIF_CATEGORIES = [
  {id:"morning",    label:"Morning Briefing",  ico:"🌅", desc:"8:45 AM daily market summary"},
  {id:"breakout",   label:"Breakout Alerts",   ico:"🚀", desc:"Resistance, VWAP, EMA breaks"},
  {id:"breakdown",  label:"Breakdown Alerts",  ico:"📉", desc:"Support, Trendline breaks"},
  {id:"candle",     label:"Candlestick Alerts",ico:"🕯", desc:"Engulfing, Doji, Hammer etc"},
  {id:"options",    label:"Options Alerts",    ico:"📊", desc:"OI buildup, PCR change, IV spike"},
  {id:"fiidii",     label:"FII/DII Alerts",    ico:"💰", desc:"Heavy buying/selling flows"},
  {id:"news",       label:"Breaking News",     ico:"📰", desc:"RBI, SEBI, Results, IPO news"},
  {id:"global",     label:"Global Markets",    ico:"🌍", desc:"Dow, Gold, Crude alerts"},
  {id:"ecocal",     label:"Economic Calendar", ico:"📅", desc:"RBI Policy, Fed, GDP, CPI"},
  {id:"ai",         label:"AI Alerts",         ico:"🤖", desc:"AI briefing, mood, analysis"},
  {id:"education",  label:"Education Alerts",  ico:"📚", desc:"Daily lesson, quiz, tip"},
  {id:"ipo",        label:"IPO Alerts",        ico:"🏛", desc:"Open, close, GMP, listing"},
  {id:"portfolio",  label:"Portfolio Alerts",  ico:"💎", desc:"Target hit, SL hit, dividend"},
  {id:"gamify",     label:"Gamification",      ico:"🎮", desc:"Streak, XP, badges"},
];

// -- ALERT TEMPLATES -----------------------------------------------------------
var ALERT_TEMPLATES = {
  morning: function(nifty) {
    return {title:"Good Morning Trader! ", body:"NIFTY: "+nifty+" | Check today's top breakout stocks", ico:"🌅"};
  },
  breakout: function(sym, level) {
    return {title:"🚀 Breakout Alert: "+sym, body:sym+" broke above "+level+" with high volume!", ico:"🚀"};
  },
  breakdown: function(sym, level) {
    return {title:"📉 Breakdown Alert: "+sym, body:sym+" broke below "+level+" -- watch for selling!", ico:"📉"};
  },
  candle: function(sym, pattern) {
    return {title:"🕯 "+pattern+" - "+sym, body:sym+" showing "+pattern+" pattern. Educational signal.", ico:"🕯"};
  },
  oi: function(sym, type) {
    return {title:"📊 OI Alert: "+sym, body:sym+" showing "+type+". PCR changing.", ico:"📊"};
  },
  fii: function(flow, amt) {
    return {title:"💰 FII "+flow, body:"FII "+flow.toLowerCase()+" Rs "+amt+" Cr today", ico:"💰"};
  },
  news: function(headline) {
    return {title:"📰 Market News", body:headline, ico:"📰"};
  },
  education: function(lesson) {
    return {title:"📚 Daily Trading Tip", body:lesson, ico:"📚"};
  },
  ipo: function(name, event) {
    return {title:"🏛 IPO Alert: "+name, body:name+" "+event, ico:"🏛"};
  },
};

var DAILY_LESSONS = [
  "Support becomes resistance once broken. Watch for retests on the way back down.",
  "Never risk more than 1-2% of capital on a single trade. Protect your trading account.",
  "Volume confirms price moves. Breakout without volume = false breakout.",
  "The trend is your friend. Trade in the direction of the larger timeframe trend.",
  "VWAP is the most important intraday level. Price above VWAP = bullish bias.",
  "In options, time decay (Theta) works against buyers every single day.",
  "High PCR (above 1.3) = oversold market. Low PCR (below 0.7) = overbought market.",
  "Always have a stop loss before entering a trade. Never average a losing position.",
];

var DAILY_PLAN = {
  support: 22200,
  resistance: 22600,
  pivot: 22400,
  trend: "Sideways",
  watchlist: ["RELIANCE","HDFCBANK","TCS","TATAMOTORS"],
  breakouts: ["WIPRO","ICICIBANK"],
  breakdowns: ["INFY"],
  highVol: ["RELIANCE","SBIN","BAJFINANCE"],
};


// --- HELPERS ------------------------------------------------------------------
function nowT() {
  return new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
}
function fN(n) {
  if(!n) return "0";
  var num = parseFloat(n);
  if(num >= 10000000) return (num/10000000).toFixed(2)+"Cr";
  if(num >= 100000) return (num/100000).toFixed(2)+"L";
  if(num >= 1000) return (num/1000).toFixed(1)+"K";
  return num.toFixed(2);
}
function rnd(a,b){ return Math.random()*(b-a)+a; }
function sg(){ return Math.random()>0.5?1:-1; }

function getMarketStatus() {
  var now = new Date();
  var h = now.getHours(), m = now.getMinutes();
  var mins = h*60+m;
  if(mins >= 9*60+15 && mins < 15*60+30) {
    return {open:true, label:"Market Open", color:G};
  }
  return {open:false, label:"Market Closed", color:"#6B7280"};
}

// --- SUB-COMPONENTS -----------------------------------------------------------
function Spark(props) {
  var data = props.data || [];
  var color = props.color || G;
  var w = props.w || 60;
  var h = props.h || 28;
  if(!data.length) return null;
  var min = Math.min.apply(null, data);
  var max = Math.max.apply(null, data);
  var range = max - min || 1;
  var pts = data.map(function(v,i) {
    var x = (i/(data.length-1))*w;
    var y = h - ((v-min)/range)*h;
    return x+","+y;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IndexCard(props) {
  var item = props.item;
  var up = item.up;
  var s = {
    card:{background:"#fff",border:"1px solid #F0F0F0",borderRadius:14,padding:"12px 14px",cursor:"pointer",boxShadow:"0 1px 6px rgba(0,0,0,0.05)"},
    label:{fontSize:8,color:"#6B7280",fontWeight:600,marginBottom:4,letterSpacing:0.3},
    ltp:{fontFamily:"monospace",fontSize:15,fontWeight:800,color:"#111827",marginBottom:3},
    chg:{display:"flex",alignItems:"center",gap:3},
    arr:{fontSize:9,color:up?G:R},
    pct:{fontSize:10,fontWeight:700,color:up?G:R},
  };
  return (
    <div style={s.card} onClick={props.onClick}>
      <div style={s.label}>{item.label}</div>
      <div style={s.ltp}>{item.ltp.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
      <div style={s.chg}>
        <span style={s.arr}>{up?"^":"v"}</span>
        <span style={s.pct}>{up?"+":""}{item.pct.toFixed(2)}%</span>
      </div>
    </div>
  );
}

function StockRow(props) {
  var s = props.stock;
  var up = s.up;
  var spark = [];
  for(var i=0;i<14;i++) spark.push(s.ltp + sg()*rnd(0, s.ltp*0.005)*i);
  var row = {display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid #F5F5F5",cursor:"pointer"};
  var sym = {fontSize:12,fontWeight:700,color:"#111827"};
  var sect = {fontSize:8,color:"#9CA3AF",marginTop:2};
  var badge = {background:up?"#DCFCE7":"#FEE2E2",borderRadius:6,padding:"2px 6px",fontSize:8,fontWeight:700,color:up?"#166534":"#991B1B"};
  return (
    <div style={row} onClick={props.onClick}>
      <div style={{flex:1}}>
        <div style={sym}>{s.sym}</div>
        <div style={sect}>{s.sect}</div>
      </div>
      <Spark data={spark} color={up?G:R} w={50} h={22}/>
      <div style={{textAlign:"right",minWidth:80}}>
        <div style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:"#111827"}}>{"Rs"+fN(s.ltp)}</div>
        <div style={badge}>{up?"+":""}{s.chgPct.toFixed(2)}%</div>
      </div>
    </div>
  );
}

function TabBar(props) {
  var tabs = [
    {id:"home",ico:"🏠",label:"Home"},
    {id:"markets",ico:"📈",label:"Markets"},
    {id:"oi",ico:"📊",label:"OI"},
    {id:"scanner",ico:"📡",label:"Scan"},
    {id:"learn",ico:"📚",label:"Learn"},
    {id:"ai",ico:"🤖",label:"AI"},
    {id:"more",ico:"...",label:"More"},
  ];
  var bar = {position:"fixed",bottom:0,left:0,right:0,maxWidth:430,margin:"0 auto",background:"#fff",borderTop:"1px solid #E5E7EB",display:"flex",zIndex:100,paddingBottom:8};
  return (
    <div style={bar}>
      {tabs.map(function(t) {
        var active = props.tab == t.id;
        var btn = {flex:1,background:"none",border:"none",padding:"6px 2px",cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:2};
        var ico = {fontSize:16};
        var lbl = {fontSize:7,fontWeight:active?700:500,color:active?G:"#9CA3AF"};
        var dot = {width:3,height:3,borderRadius:"50%",background:G,margin:"1px auto 0"};
        return (
          <button key={t.id} style={btn} onClick={function(){props.setTab(t.id);}}>
            <span style={ico}>{t.ico}</span>
            <span style={lbl}>{t.label}</span>
            {active ? <div style={dot}></div> : null}
          </button>
        );
      })}
    </div>
  );
}

function TopBar(props) {
  var mkt = getMarketStatus();
  var bar = {background:"#fff",borderBottom:"1px solid #F0F0F0",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50};
  var logo = {display:"flex",alignItems:"center",gap:8};
  var bp = {width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,200,83,0.3)"};
  var bpTxt = {fontFamily:"Arial",fontSize:12,fontWeight:900,color:"#fff"};
  var title = {fontSize:16,fontWeight:900,color:"#111827",letterSpacing:-0.5};
  var tag = {fontSize:6,color:"#F97316",fontWeight:800,letterSpacing:1.5};
  var right = {display:"flex",alignItems:"center",gap:6};
  var pill = {background:mkt.open?"#DCFCE7":"#F3F4F6",border:"1px solid "+(mkt.open?"#BBF7D0":"#E5E7EB"),borderRadius:20,padding:"3px 8px",display:"flex",alignItems:"center",gap:3};
  var dot = {width:5,height:5,borderRadius:"50%",background:mkt.open?G:"#9CA3AF"};
  var pillTxt = {fontSize:7,fontWeight:700,color:mkt.open?"#166534":"#6B7280"};
  var menuBtn = {background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:9,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:"#374151"};
  return (
    <div style={bar}>
      <div style={logo}>
        <div style={bp}><span style={bpTxt}>BP</span></div>
        <div>
          <div style={title}>Breakout<span style={{color:G}}> Pro</span></div>
          <div style={tag}>CATCH EVERY BREAKOUT</div>
        </div>
      </div>
      <div style={right}>
        <div style={pill}>
          <div style={dot}></div>
          <span style={pillTxt}>{mkt.label}</span>
        </div>
        {props.isPrem ? (
          <span style={{background:"#FEF3C7",color:"#D97706",border:"1px solid #FDE68A",borderRadius:20,padding:"3px 8px",fontSize:8,fontWeight:700}}>👑 PRO</span>
        ) : (
          <button onClick={props.onSub} style={{background:"#FFF7ED",color:"#F97316",border:"1px solid #FED7AA",borderRadius:20,padding:"3px 8px",fontSize:7,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{props.trialDays}d Free</button>
        )}
        <button style={menuBtn} onClick={props.onMenu}>=</button>
      </div>
    </div>
  );
}

// --- SCREENS ------------------------------------------------------------------

function HomeScreen(props) {
  var nifty = props.nifty;
  var sensex = props.sensex;
  var bankNifty = props.bankNifty;
  var midcap = props.midcap;
  var stocks = props.stocks;
  var news = props.news;
  var briefing = props.briefing;
  var briefingLoading = props.briefingLoading;
  var onBriefing = props.onBriefing;
  var user = props.user;
  var setTab = props.setTab;
  var glTab = props.glTab;
  var setGlTab = props.setGlTab;

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  var greeting = {background:"#fff",padding:"12px 16px",borderBottom:"1px solid #F0F0F0",display:"flex",alignItems:"center",justifyContent:"space-between"};
  var avatar = {width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#fff",flexShrink:0};
  var greetTxt = {fontSize:9,color:"#9CA3AF"};
  var userName = {fontSize:16,color:"#111827",fontWeight:800,letterSpacing:-0.3};
  var notifBtn = {background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"};

  var indices = [
    {label:"NIFTY 50",ltp:nifty.ltp,pct:nifty.pct,up:nifty.up},
    {label:"SENSEX",ltp:sensex.ltp,pct:sensex.pct,up:sensex.up},
    {label:"BANK NIFTY",ltp:bankNifty.ltp,pct:bankNifty.pct,up:bankNifty.up},
    {label:"MIDCAP",ltp:midcap.ltp,pct:midcap.pct,up:midcap.up},
  ];

  var quickGrid = [
    {ico:"📊",label:"OI Chain",tab:"oi"},
    {ico:"📡",label:"Scanner",tab:"scanner"},
    {ico:"💰",label:"FII/DII",tab:"markets"},
    {ico:"📰",label:"News",tab:"news"},
    {ico:"📚",label:"Learn",tab:"learn"},
    {ico:"🤖",label:"AI Chat",tab:"ai"},
    {ico:"🛠",label:"Tools",tab:"tools"},
    {ico:"*",label:"Watchlist",tab:"markets"},
  ];

  var h2 = {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8};
  var h2Txt = {fontSize:11,fontWeight:700,color:"#111827"};
  var viewAll = {background:"none",border:"none",color:G,fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"};

  var sortedStocks = stocks.slice().sort(function(a,b) {
    if(glTab == "gainers") return b.chgPct - a.chgPct;
    return a.chgPct - b.chgPct;
  }).slice(0,4);

  var hour = new Date().getHours();
  var greetWord = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div style={pg}>
      <div style={greeting}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={avatar}>{user && user.name ? user.name[0].toUpperCase() : "T"}</div>
          <div>
            <div style={greetTxt}>{greetWord}</div>
            <div style={userName}>{user && user.name ? user.name.split(" ")[0] : "Trader"} 👋</div>
          </div>
        </div>
        <button style={notifBtn} onClick={function(){setTab("news");}}>🔔</button>
      </div>

      <div style={{padding:"14px 14px 0"}}>

        {/* AI Briefing */}
        <div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #BBF7D0",borderRadius:16,padding:16,marginBottom:14,boxShadow:"0 2px 12px rgba(0,200,83,0.08)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:18}}>🤖</span>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#111827"}}>AI Market Briefing</div>
                <div style={{fontSize:8,color:"#6B7280"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"short"})}</div>
              </div>
            </div>
            {briefing ? (
              <button onClick={onBriefing} style={{background:"transparent",border:"1px solid #BBF7D0",borderRadius:20,padding:"4px 10px",color:G,fontSize:8,cursor:"pointer",fontFamily:"inherit"}}>R Refresh</button>
            ) : (
              <button onClick={onBriefing} style={{background:G,border:"none",borderRadius:20,padding:"6px 14px",color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Get Briefing</button>
            )}
          </div>
          {briefingLoading ? (
            <div style={{textAlign:"center",padding:"12px 0"}}>
              <div style={{fontSize:10,color:"#374151"}}>AI is analyzing markets...</div>
              <div style={{height:3,background:"rgba(0,200,83,0.15)",borderRadius:3,marginTop:8,overflow:"hidden"}}>
                <div style={{height:"100%",width:"60%",background:G,borderRadius:3}}></div>
              </div>
            </div>
          ) : briefing ? (
            <div style={{background:"rgba(255,255,255,0.8)",borderRadius:10,padding:10}}>
              <div style={{fontSize:10,color:"#374151",lineHeight:1.7}}>{briefing}</div>
              <div style={{fontSize:7,color:"#9CA3AF",marginTop:6}}>! {DISCLAIMER}</div>
            </div>
          ) : (
            <div style={{background:"rgba(255,255,255,0.7)",borderRadius:12,padding:14,textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:6}}></div>
              <div style={{fontSize:11,color:"#374151",fontWeight:600,marginBottom:4}}>Your Daily Market Briefing</div>
              <div style={{fontSize:9,color:"#6B7280"}}>Personalized market update ready for you</div>
            </div>
          )}
        </div>

        {/* Index Cards */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {indices.map(function(item) {
            return (
              <IndexCard key={item.label} item={item} onClick={function(){setTab("markets");}}/>
            );
          })}
        </div>

        {/* Quick Access */}
        <div style={{marginBottom:14}}>
          <div style={h2}><span style={h2Txt}>Quick Access</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {quickGrid.map(function(item) {
              var btn = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"10px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",fontFamily:"inherit"};
              var ico = {fontSize:20};
              var lbl = {fontSize:8,color:"#374151",fontWeight:600};
              return (
                <button key={item.label} style={btn} onClick={function(){setTab(item.tab);}}>
                  <span style={ico}>{item.ico}</span>
                  <span style={lbl}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Movers */}
        <div style={{marginBottom:14}}>
          <div style={h2}>
            <div style={{display:"flex",background:"#F3F4F6",borderRadius:20,padding:3}}>
              {["gainers","losers"].map(function(t) {
                var active = glTab == t;
                var tabBtn = {background:active?"#fff":"transparent",border:"none",borderRadius:17,padding:"5px 12px",color:active?"#111827":"#6B7280",fontSize:9,fontWeight:active?700:500,cursor:"pointer",fontFamily:"inherit",boxShadow:active?"0 1px 4px rgba(0,0,0,0.08)":"none"};
                return <button key={t} style={tabBtn} onClick={function(){setGlTab(t);}}>{t == "gainers" ? "🚀 Gainers" : "📉 Losers"}</button>;
              })}
            </div>
            <button style={viewAll} onClick={function(){setTab("markets");}}>View All &gt;</button>
          </div>
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #F0F0F0",overflow:"hidden"}}>
            {sortedStocks.map(function(s) {
              return <StockRow key={s.sym} stock={s} onClick={function(){setTab("markets");}}/>;
            })}
          </div>
        </div>

        {/* Sector */}
        <div style={{marginBottom:14}}>
          <div style={h2}><span style={h2Txt}>Sector Performance</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
            {SECTOR_DATA.slice(0,9).map(function(s) {
              var up = s.chg >= 0;
              var cell = {background:up?"#F0FDF4":"#FFF1F2",border:"1px solid "+(up?"#BBF7D0":"#FECDD3"),borderRadius:10,padding:"8px",textAlign:"center"};
              return (
                <div key={s.name} style={cell}>
                  <div style={{fontSize:9,fontWeight:600,color:"#374151"}}>{s.name}</div>
                  <div style={{fontSize:10,fontWeight:700,color:up?G:R,marginTop:2}}>{up?"+":""}{s.chg.toFixed(2)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* News */}
        <div style={{marginBottom:14}}>
          <div style={h2}>
            <span style={h2Txt}>Market News</span>
            <button style={viewAll} onClick={function(){setTab("news");}}>View All &gt;</button>
          </div>
          {news.slice(0,3).map(function(n,i) {
            var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"11px 13px",marginBottom:6,display:"flex",gap:10,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"};
            var badge = {background:n.bull?"#DCFCE7":"#F3F4F6",borderRadius:7,padding:"3px 7px",height:"fit-content",flexShrink:0};
            var badgeTxt = {fontSize:7,fontWeight:700,color:n.bull?"#166534":"#6B7280"};
            return (
              <div key={i} style={card}>
                <div style={badge}><span style={badgeTxt}>{n.cat.substring(0,4).toUpperCase()}</span></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:600,color:"#111827",lineHeight:1.4,marginBottom:2}}>{n.title}</div>
                  <div style={{fontSize:8,color:"#9CA3AF"}}>{n.time}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:"9px 12px",marginBottom:6,display:"flex",gap:6}}>
          <span style={{fontSize:12,flexShrink:0}}>!</span>
          <div style={{fontSize:7.5,color:"#92400E",lineHeight:1.6}}>Educational Purpose Only. Not SEBI Registered. Not Investment Advice.</div>
        </div>

      </div>
    </div>
  );
}

function MarketsScreen(props) {
  var stocks = props.stocks;
  var setTab = props.setTab;
  var [search, setSearch] = useState("");
  var [sort, setSort] = useState("pct");

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  var hdr = {background:"#fff",padding:"12px 14px",borderBottom:"1px solid #F0F0F0"};
  var searchBox = {display:"flex",alignItems:"center",gap:8,background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:10,padding:"8px 12px",marginBottom:10};
  var inp = {flex:1,background:"none",border:"none",outline:"none",fontSize:12,color:"#111827",fontFamily:"inherit"};

  var filtered = stocks.filter(function(s) {
    if(!search) return true;
    return s.sym.toLowerCase().indexOf(search.toLowerCase()) != -1 || s.name.toLowerCase().indexOf(search.toLowerCase()) != -1;
  }).sort(function(a,b) {
    if(sort == "pct") return b.chgPct - a.chgPct;
    if(sort == "ltp") return b.ltp - a.ltp;
    return 0;
  });

  return (
    <div style={pg}>
      <div style={hdr}>
        <div style={searchBox}>
          <span style={{fontSize:14}}>🔍</span>
          <input style={inp} placeholder="Search stocks..." value={search} onChange={function(e){setSearch(e.target.value);}}/>
          {search ? <button onClick={function(){setSearch("");}} style={{background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",fontSize:14}}>X</button> : null}
        </div>
        <div style={{display:"flex",gap:6}}>
          {["pct","ltp"].map(function(s) {
            var active = sort == s;
            var btn = {background:active?G:"#F3F4F6",border:"none",borderRadius:20,padding:"4px 12px",color:active?"#fff":"#374151",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"};
            return <button key={s} style={btn} onClick={function(){setSort(s);}}>{s == "pct" ? "% Change" : "Price"}</button>;
          })}
        </div>
      </div>
      <div style={{background:"#fff",margin:"10px 14px",borderRadius:12,border:"1px solid #F0F0F0",overflow:"hidden"}}>
        {filtered.map(function(s) {
          return <StockRow key={s.sym} stock={s} onClick={function(){}}/>;
        })}
      </div>
    </div>
  );
}

function ScannerScreen(props) {
  var [activeScanner, setActiveScanner] = useState("breakout");
  var [results, setResults] = useState([]);
  var stocks = props.stocks;

  var scanners = [
    {id:"breakout",label:"Breakout",ico:"🚀"},
    {id:"breakdown",label:"Breakdown",ico:"📉"},
    {id:"volume",label:"Volume Spike",ico:"📊"},
    {id:"gapup",label:"Gap Up",ico:"^"},
    {id:"gapdown",label:"Gap Down",ico:"v"},
    {id:"hh",label:"HH-HL",ico:"📈"},
  ];

  function runScan(type) {
    setActiveScanner(type);
    var r = stocks.filter(function(s) {
      if(type == "breakout") return s.up && s.chgPct > 1.5;
      if(type == "breakdown") return !s.up && s.chgPct < -1.5;
      if(type == "volume") return true;
      if(type == "gapup") return s.up && s.chgPct > 1.0;
      if(type == "gapdown") return !s.up && s.chgPct < -1.0;
      if(type == "hh") return s.up;
      return false;
    });
    setResults(r);
  }

  useEffect(function(){
    runScan("breakout");
  }, []);

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  var scanList = {display:"flex",gap:8,overflowX:"auto",padding:"12px 14px",background:"#fff",borderBottom:"1px solid #F0F0F0"};

  return (
    <div style={pg}>
      <div style={scanList}>
        {scanners.map(function(sc) {
          var active = activeScanner == sc.id;
          var btn = {background:active?G:"#F3F4F6",border:"none",borderRadius:20,padding:"6px 12px",color:active?"#fff":"#374151",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",gap:4};
          return (
            <button key={sc.id} style={btn} onClick={function(){runScan(sc.id);}}>
              <span>{sc.ico}</span><span>{sc.label}</span>
            </button>
          );
        })}
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontSize:10,color:"#6B7280",marginBottom:8}}>{results.length} stocks found</div>
        {results.length == 0 ? (
          <div style={{textAlign:"center",padding:"40px 0",color:"#9CA3AF"}}>
            <div style={{fontSize:32,marginBottom:8}}>🔍</div>
            <div style={{fontSize:12}}>No results for this scanner</div>
          </div>
        ) : (
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #F0F0F0",overflow:"hidden"}}>
            {results.map(function(s) {
              return <StockRow key={s.sym} stock={s} onClick={function(){}}/>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function OIScreen(props) {
  var oiData = [
    {strike:22000,ceOI:45230,peOI:12340,ceLTP:89.50,peLTP:4.20,iv:14.2},
    {strike:22100,ceOI:38400,peOI:18900,ceLTP:56.30,peLTP:8.10,iv:14.8},
    {strike:22200,ceOI:67800,peOI:23400,ceLTP:34.20,peLTP:15.60,iv:15.1},
    {strike:22300,ceOI:89200,peOI:45600,ceLTP:18.90,peLTP:28.40,iv:15.6},
    {strike:22400,ceOI:112000,peOI:67800,ceLTP:8.70,peLTP:48.20,iv:16.2},
    {strike:22500,ceOI:134500,peOI:89000,ceLTP:3.40,peLTP:72.10,iv:17.0},
    {strike:22600,ceOI:78900,peOI:56700,ceLTP:1.20,peLTP:98.40,iv:17.8},
  ];
  var maxPain = 22400;
  var pcr = 0.84;

  var pg = {background:"#0B0B0B",minHeight:"100%",paddingBottom:80,color:"#fff"};
  var hdr = {padding:"14px",background:"#111",borderBottom:"1px solid #1E1E1E"};
  var stats = {display:"flex",gap:10,marginBottom:14};
  var statCard = {flex:1,background:"#161616",border:"1px solid #222",borderRadius:10,padding:"10px",textAlign:"center"};
  var statLbl = {fontSize:8,color:"#555",marginBottom:4};
  var statVal = {fontSize:14,fontWeight:800,color:G};

  return (
    <div style={pg}>
      <div style={hdr}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>NIFTY Options Chain</div>
        <div style={{fontSize:9,color:"#555"}}>Live data every 3 mins during market hours</div>
      </div>
      <div style={{padding:14}}>
        <div style={stats}>
          <div style={statCard}>
            <div style={statLbl}>PCR</div>
            <div style={statVal}>{pcr}</div>
          </div>
          <div style={statCard}>
            <div style={statLbl}>Max Pain</div>
            <div style={{fontSize:14,fontWeight:800,color:"#F59E0B"}}>{maxPain}</div>
          </div>
          <div style={statCard}>
            <div style={statLbl}>ATM IV</div>
            <div style={statVal}>17.0%</div>
          </div>
        </div>
        <div style={{background:"#111",borderRadius:10,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 60px 1fr",gap:4,padding:"8px 10px",borderBottom:"1px solid #1E1E1E",fontSize:7,color:"#555",textAlign:"center"}}>
            <span>CE OI</span>
            <span>Strike</span>
            <span>PE OI</span>
          </div>
          {oiData.map(function(row) {
            var maxOI = 134500;
            var ceBar = (row.ceOI/maxOI)*100;
            var peBar = (row.peOI/maxOI)*100;
            var isAtm = row.strike == maxPain;
            var rowStyle = {padding:"8px 10px",borderBottom:"1px solid #161616",background:isAtm?"#1a1000":"transparent"};
            return (
              <div key={row.strike} style={rowStyle}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 60px 1fr",gap:4,alignItems:"center"}}>
                  <div>
                    <div style={{height:4,background:R,borderRadius:2,width:ceBar+"%",marginLeft:"auto"}}></div>
                    <div style={{fontSize:8,color:"#EF4444",textAlign:"right",marginTop:2}}>{(row.ceOI/1000).toFixed(0)}K</div>
                  </div>
                  <div style={{textAlign:"center",fontSize:10,fontWeight:700,color:isAtm?"#F59E0B":"#fff"}}>{row.strike}</div>
                  <div>
                    <div style={{height:4,background:G,borderRadius:2,width:peBar+"%"}}></div>
                    <div style={{fontSize:8,color:G,marginTop:2}}>{(row.peOI/1000).toFixed(0)}K</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LearnScreen(props) {
  var [section, setSection] = useState("home");
  var [selectedPattern, setSelectedPattern] = useState(null);
  var [termSearch, setTermSearch] = useState("");

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};

  if(section == "candles") {
    return (
      <div style={pg}>
        <div style={{background:"#fff",padding:"12px 14px",borderBottom:"1px solid #F0F0F0",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={function(){setSection("home");}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer"}}>&larr;</button>
          <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Candlestick Patterns</div>
        </div>
        <div style={{padding:14}}>
          {CANDLE_PATTERNS.map(function(p) {
            var up = p.type == "Bullish";
            var neu = p.type == "Neutral";
            var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px",marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"};
            var badge = {background:up?"#DCFCE7":neu?"#FEF3C7":"#FEE2E2",color:up?"#166534":neu?"#D97706":"#991B1B",borderRadius:6,padding:"2px 8px",fontSize:8,fontWeight:700,display:"inline-block",marginBottom:6};
            return (
              <div key={p.name} style={card}>
                <div style={badge}>{p.type}</div>
                <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:4}}>{p.name}</div>
                <div style={{fontSize:10,color:"#6B7280",lineHeight:1.6}}>{p.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if(section == "terms") {
    var filteredTerms = TERMS_DATA.filter(function(t) {
      return !termSearch || t.term.toLowerCase().indexOf(termSearch.toLowerCase()) != -1;
    });
    return (
      <div style={pg}>
        <div style={{background:"#fff",padding:"12px 14px",borderBottom:"1px solid #F0F0F0",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={function(){setSection("home");}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer"}}>&larr;</button>
          <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Market Terms</div>
        </div>
        <div style={{padding:14}}>
          <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:"8px 12px",marginBottom:12,display:"flex",gap:8}}>
            <span>🔍</span>
            <input style={{flex:1,border:"none",outline:"none",fontSize:12,fontFamily:"inherit"}} placeholder="Search terms..." value={termSearch} onChange={function(e){setTermSearch(e.target.value);}}/>
          </div>
          {filteredTerms.map(function(t) {
            return (
              <div key={t.term} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:10,padding:"12px",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:4}}>{t.term}</div>
                <div style={{fontSize:10,color:"#6B7280",lineHeight:1.6}}>{t.def}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  var topics = [
    {id:"candles",ico:"🕯",title:"Candlestick Patterns",count:"50+ patterns",color:"#FFF7ED",border:"#FED7AA"},
    {id:"terms",ico:"📖",title:"Market Terms",count:"100+ terms",color:"#F0FDF4",border:"#BBF7D0"},
    {id:"oi",ico:"📊",title:"OI Concepts",count:"PCR, Max Pain, Greeks",color:"#EFF6FF",border:"#BFDBFE"},
    {id:"charts",ico:"📈",title:"Chart Patterns",count:"Breakout, Triangle, Flag",color:"#FDF4FF",border:"#E9D5FF"},
    {id:"risk",ico:"🛡",title:"Risk Management",count:"Position sizing, SL",color:"#FFF1F2",border:"#FECDD3"},
    {id:"psych",ico:"🧠",title:"Trading Psychology",count:"Discipline, Emotions",color:"#F0FDF4",border:"#BBF7D0"},
  ];

  return (
    <div style={pg}>
      <div style={{padding:14}}>
        <div style={{fontSize:18,fontWeight:800,color:"#111827",marginBottom:4}}>Learn Trading</div>
        <div style={{fontSize:10,color:"#6B7280",marginBottom:16}}>Master the markets with our education library</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {topics.map(function(t) {
            var card = {background:t.color,border:"1px solid "+t.border,borderRadius:14,padding:"14px",cursor:"pointer"};
            return (
              <div key={t.id} style={card} onClick={function(){setSection(t.id);}}>
                <div style={{fontSize:28,marginBottom:8}}>{t.ico}</div>
                <div style={{fontSize:11,fontWeight:700,color:"#111827",marginBottom:3}}>{t.title}</div>
                <div style={{fontSize:8,color:"#6B7280"}}>{t.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AIScreen(props) {
  var [msgs, setMsgs] = useState([]);
  var [input, setInput] = useState("");
  var [loading, setLoading] = useState(false);
  var endRef = useRef(null);

  useEffect(function(){
    if(endRef.current) endRef.current.scrollIntoView({behavior:"smooth"});
  }, [msgs]);

  function localAnswer(q) {
    var ql = q.toLowerCase();
    // Check AI knowledge base first (fastest)
    var kbKeys = Object.keys(AI_KB);
    for(var k=0;k<kbKeys.length;k++) {
      if(ql.indexOf(kbKeys[k]) != -1) {
        return AI_KB[kbKeys[k]] + "\n\n📚 Educational only | Not SEBI registered investment advice";
      }
    }
    // Check terms
    for(var i=0;i<TERMS_DATA.length;i++) {
      if(ql.indexOf(TERMS_DATA[i].term.toLowerCase()) != -1) {
        return TERMS_DATA[i].term + ": " + TERMS_DATA[i].def + "\n\n📚 Educational only | Not SEBI registered investment advice";
      }
    }
    // Check candle patterns
    for(var j=0;j<CANDLE_PATTERNS.length;j++) {
      if(ql.indexOf(CANDLE_PATTERNS[j].name.toLowerCase()) != -1) {
        return CANDLE_PATTERNS[j].name + " (" + CANDLE_PATTERNS[j].type + "): " + CANDLE_PATTERNS[j].desc + "\n\n📚 Educational only | Not SEBI registered investment advice";
      }
    }
    return null;
  }

  async function send(q) {
    if(!q.trim() || loading) return;
    var newMsgs = msgs.concat([{role:"user",text:q,time:nowT()}]);
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);

    var localAns = localAnswer(q);
    if(localAns) {
      setMsgs(newMsgs.concat([{role:"ai",text:localAns,time:nowT()}]).slice(-20));
      setLoading(false);
      return;
    }

    var GEMINI_KEY = "";
    if(typeof window != "undefined" && window.GEMINI_KEY) GEMINI_KEY = window.GEMINI_KEY;

    var sys = "You are Breakout Pro AI -- Indian stock market education assistant. Rules: 1) Educational only -- no buy/sell advice 2) Keep answers under 150 words 3) Use Indian context (NSE/BSE) 4) Always end with: 📚 Educational only | Not SEBI registered investment advice";

    async function callGemini() {
      var ctrl = new AbortController();
      var timer = setTimeout(function(){ctrl.abort();}, 15000);
      try {
        var resp = await fetch(GEMINI_URL + GEMINI_KEY, {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({contents:[{role:"user",parts:[{text:sys+"\n\nQuestion: "+q}]}],generationConfig:{maxOutputTokens:300,temperature:0.5}}),
          signal:ctrl.signal,
        });
        clearTimeout(timer);
        return resp.json();
      } catch(e) {
        clearTimeout(timer);
        throw e;
      }
    }

    var aiText = "";
    try {
      var data = await callGemini();
      if(data.candidates && data.candidates[0] && data.candidates[0].content) {
        aiText = data.candidates[0].content.parts.map(function(p){return p.text||"";}).join("").trim();
      } else if(data.error) {
        throw new Error(data.error.message || "API error");
      } else {
        throw new Error("Empty response");
      }
    } catch(e1) {
      try {
        await new Promise(function(r){setTimeout(r,1500);});
        var data2 = await callGemini();
        if(data2.candidates && data2.candidates[0] && data2.candidates[0].content) {
          aiText = data2.candidates[0].content.parts.map(function(p){return p.text||"";}).join("").trim();
        } else {
          throw new Error("Retry failed");
        }
      } catch(e2) {
        aiText = "X Could not connect to AI. Please check API key in Vercel settings.\n\n📚 Educational only | Not SEBI registered investment advice";
      }
    }

    if(aiText && aiText.indexOf("Educational only") == -1) {
      aiText += "\n\n📚 Educational only | Not SEBI registered investment advice";
    }
    setMsgs(newMsgs.concat([{role:"ai",text:aiText,time:nowT()}]).slice(-20));
    setLoading(false);
  }

  var pg = {background:"#0B0B0B",minHeight:"100%",display:"flex",flexDirection:"column",paddingBottom:80};
  var hdr = {background:"#111",borderBottom:"1px solid #1E1E1E",padding:"11px 14px",display:"flex",alignItems:"center",gap:10};
  var msgs_area = {flex:1,overflowY:"auto",padding:12};
  var inp_area = {borderTop:"1px solid #1A1A1A",padding:"8px 12px 12px",background:"#0F0F0F"};

  return (
    <div style={pg}>
      <div style={hdr}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#1E3A5F,#0F2744)",border:"1px solid #1E4080",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:7,fontWeight:900,color:"#fff",fontFamily:"Arial"}}>BP AI</span>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>Breakout Pro AI</div>
          <div style={{fontSize:8,color:loading?"#F59E0B":"#00C853"}}>{loading?"Thinking...":"Gemini 2.0 Flash . Ready"}</div>
        </div>
      </div>
      <div style={{background:"#0F0A00",borderBottom:"1px solid #2A1E00",padding:"5px 14px"}}>
        <span style={{fontSize:7.5,color:"#92694A",fontWeight:600}}>! Educational Only | Not SEBI Registered Investment Advice</span>
      </div>
      <div style={msgs_area}>
        {msgs.length == 0 ? (
          <div style={{textAlign:"center",paddingTop:20}}>
            <div style={{fontSize:32,marginBottom:10}}>🤖</div>
            <div style={{fontSize:14,fontWeight:800,color:"#fff",marginBottom:4}}>Breakout Pro AI</div>
            <div style={{fontSize:9,color:"#666",marginBottom:16}}>Ask me anything about stock market education</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {QUICK_QS.slice(0,6).map(function(q) {
                return (
                  <button key={q} onClick={function(){send(q);}} style={{background:"#161616",border:"1px solid #222",borderRadius:10,padding:"9px",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
                    <div style={{fontSize:8,color:"#ccc",lineHeight:1.5}}>{q}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        {msgs.map(function(m,i) {
          var isUser = m.role == "user";
          return (
            <div key={i} style={{marginBottom:12,display:"flex",flexDirection:"column",alignItems:isUser?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"88%",background:isUser?"#1E3A5F":"#161616",border:isUser?"1px solid #1E4080":"1px solid #222",borderRadius:isUser?"14px 14px 4px 14px":"4px 14px 14px 14px",padding:"10px 13px"}}>
                <div style={{fontSize:11,color:"#e8e8e8",lineHeight:1.75,whiteSpace:"pre-wrap"}}>{m.text}</div>
                <div style={{fontSize:7,color:"rgba(255,255,255,0.3)",marginTop:3,textAlign:"right"}}>{m.time}</div>
              </div>
            </div>
          );
        })}
        {loading ? (
          <div style={{display:"flex",marginBottom:12}}>
            <div style={{background:"#161616",border:"1px solid #222",borderRadius:"4px 14px 14px 14px",padding:"13px 16px"}}>
              <div style={{display:"flex",gap:5}}>
                {[0,1,2].map(function(i) {
                  return <div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#3B82F6",opacity:0.8}}></div>;
                })}
              </div>
            </div>
          </div>
        ) : null}
        <div ref={endRef}></div>
      </div>
      <div style={inp_area}>
        <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:8,paddingBottom:2}}>
          {["Doji","Support","OI","Theta","VWAP","RSI","PCR","Breakout"].map(function(q) {
            return (
              <button key={q} disabled={loading} onClick={function(){send("Explain "+q+" in stock market");}} style={{background:"#161616",border:"1px solid #222",borderRadius:20,padding:"4px 10px",color:loading?"#333":"#3B82F6",fontSize:8,cursor:loading?"not-allowed":"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit",fontWeight:600}}>{q}</button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <textarea value={input} onChange={function(e){setInput(e.target.value);}} onKeyDown={function(e){if(e.key=="Enter"&&!e.shiftKey){e.preventDefault();send(input);}}} placeholder="Ask about any market concept..." rows={1} disabled={loading} style={{flex:1,background:"#161616",border:"1px solid #222",borderRadius:11,padding:"10px 12px",color:"#fff",fontSize:11,fontFamily:"inherit",outline:"none",resize:"none",lineHeight:1.5,maxHeight:80,overflowY:"auto",opacity:loading?0.6:1}}/>
          <button onClick={function(){send(input);}} disabled={!input.trim()||loading} style={{background:(!input.trim()||loading)?"#1A1A1A":"linear-gradient(135deg,#3B82F6,#1D4ED8)",border:"none",borderRadius:11,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",cursor:(!input.trim()||loading)?"not-allowed":"pointer",fontSize:16,flexShrink:0,color:"#fff"}}>&gt;</button>
        </div>
      </div>
    </div>
  );
}

function ToolsScreen(props) {
  var [activeTool, setActiveTool] = useState("rr");
  var [rrEntry, setRrEntry] = useState("22500");
  var [rrSL, setRrSL] = useState("22400");
  var [rrTarget, setRrTarget] = useState("22700");
  var [posCapital, setPosCapital] = useState("100000");
  var [posRisk, setPosRisk] = useState("2");
  var [posSL, setPosSL] = useState("22400");
  var [posEntry, setPosEntry] = useState("22500");

  var tools = [
    {id:"rr",label:"R:R Calculator",ico:""},
    {id:"pos",label:"Position Size",ico:"📐"},
    {id:"brok",label:"Brokerage Calc",ico:"💰"},
    {id:"greeks",label:"Option Greeks",ico:"🔢"},
  ];

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  var toolBar = {display:"flex",gap:8,overflowX:"auto",padding:"12px 14px",background:"#fff",borderBottom:"1px solid #F0F0F0"};

  var rrRatio = 0;
  var rrValid = false;
  try {
    var entry = parseFloat(rrEntry);
    var sl = parseFloat(rrSL);
    var tgt = parseFloat(rrTarget);
    if(entry && sl && tgt) {
      var risk = Math.abs(entry - sl);
      var reward = Math.abs(tgt - entry);
      rrRatio = reward/risk;
      rrValid = true;
    }
  } catch(e) {}

  var posQty = 0;
  try {
    var cap = parseFloat(posCapital);
    var riskPct = parseFloat(posRisk)/100;
    var slPts = Math.abs(parseFloat(posEntry) - parseFloat(posSL));
    if(cap && riskPct && slPts) {
      posQty = Math.floor((cap * riskPct) / slPts);
    }
  } catch(e) {}

  var inpStyle = {width:"100%",background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,padding:"11px 13px",color:"#111827",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:10};
  var lbl = {fontSize:11,color:"#374151",fontWeight:600,marginBottom:5,display:"block"};
  var resultBox = {background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #BBF7D0",borderRadius:12,padding:14,marginTop:14,textAlign:"center"};

  return (
    <div style={pg}>
      <div style={toolBar}>
        {tools.map(function(t) {
          var active = activeTool == t.id;
          var btn = {background:active?G:"#F3F4F6",border:"none",borderRadius:20,padding:"6px 12px",color:active?"#fff":"#374151",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",gap:4};
          return (
            <button key={t.id} style={btn} onClick={function(){setActiveTool(t.id);}}>
              <span>{t.ico}</span><span>{t.label}</span>
            </button>
          );
        })}
      </div>
      <div style={{padding:14}}>
        {activeTool == "rr" ? (
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#111827",marginBottom:14}}> Risk:Reward Calculator</div>
            <label style={lbl}>Entry Price</label>
            <input style={inpStyle} type="number" value={rrEntry} onChange={function(e){setRrEntry(e.target.value);}}/>
            <label style={lbl}>Stop Loss</label>
            <input style={inpStyle} type="number" value={rrSL} onChange={function(e){setRrSL(e.target.value);}}/>
            <label style={lbl}>Target Price</label>
            <input style={inpStyle} type="number" value={rrTarget} onChange={function(e){setRrTarget(e.target.value);}}/>
            {rrValid ? (
              <div style={resultBox}>
                <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Risk:Reward Ratio</div>
                <div style={{fontSize:32,fontWeight:900,color:rrRatio>=2?G:rrRatio>=1?"#F59E0B":R}}>1:{rrRatio.toFixed(1)}</div>
                <div style={{fontSize:9,color:"#6B7280",marginTop:4}}>{rrRatio>=2?"Excellent trade setup":"R:R below 1:2 -- consider adjusting"}</div>
              </div>
            ) : null}
          </div>
        ) : null}
        {activeTool == "pos" ? (
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#111827",marginBottom:14}}>📐 Position Size Calculator</div>
            <label style={lbl}>Capital (Rs)</label>
            <input style={inpStyle} type="number" value={posCapital} onChange={function(e){setPosCapital(e.target.value);}}/>
            <label style={lbl}>Risk per Trade (%)</label>
            <input style={inpStyle} type="number" value={posRisk} onChange={function(e){setPosRisk(e.target.value);}}/>
            <label style={lbl}>Entry Price</label>
            <input style={inpStyle} type="number" value={posEntry} onChange={function(e){setPosEntry(e.target.value);}}/>
            <label style={lbl}>Stop Loss</label>
            <input style={inpStyle} type="number" value={posSL} onChange={function(e){setPosSL(e.target.value);}}/>
            {posQty > 0 ? (
              <div style={resultBox}>
                <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Recommended Quantity</div>
                <div style={{fontSize:32,fontWeight:900,color:G}}>{posQty}</div>
                <div style={{fontSize:9,color:"#6B7280",marginTop:4}}>Max loss: Rs {fN((parseFloat(posCapital)*parseFloat(posRisk)/100))}</div>
              </div>
            ) : null}
          </div>
        ) : null}
        {activeTool == "brok" ? (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:32,marginBottom:10}}>💰</div>
            <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:6}}>Brokerage Calculator</div>
            <div style={{fontSize:10,color:"#6B7280"}}>Coming soon -- Zerodha, Groww, Dhan brokerage comparison</div>
          </div>
        ) : null}
        {activeTool == "greeks" ? (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:32,marginBottom:10}}>🔢</div>
            <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:6}}>Option Greeks</div>
            <div style={{fontSize:10,color:"#6B7280"}}>Delta, Gamma, Theta, Vega calculator coming soon</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NewsScreen(props) {
  var news = props.news;
  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  return (
    <div style={pg}>
      <div style={{padding:14}}>
        <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>Market News</div>
        {news.map(function(n,i) {
          var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"14px",marginBottom:10,boxShadow:"0 1px 6px rgba(0,0,0,0.04)"};
          var badge = {background:n.bull?"#DCFCE7":"#FEE2E2",display:"inline-block",borderRadius:6,padding:"2px 8px",fontSize:8,fontWeight:700,color:n.bull?"#166534":"#991B1B",marginBottom:8};
          return (
            <div key={i} style={card}>
              <div style={badge}>{n.cat}</div>
              <div style={{fontSize:12,fontWeight:600,color:"#111827",lineHeight:1.5,marginBottom:6}}>{n.title}</div>
              <div style={{fontSize:9,color:"#9CA3AF"}}>{n.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- AUTH SCREEN --------------------------------------------------------------
function AuthScreen(props) {
  var onLogin = props.onLogin;
  var [mode, setMode] = useState("login");
  var [name, setName] = useState("");
  var [phone, setPhone] = useState("");
  var [pass, setPass] = useState("");
  var [err, setErr] = useState("");

  function submit() {
    setErr("");
    if(!phone || phone.length < 10) { setErr("Enter valid 10-digit phone number"); return; }
    if(!pass || pass.length < 6) { setErr("Password must be at least 6 characters"); return; }
    if(mode == "register" && !name) { setErr("Please enter your name"); return; }

    // Admin login
    if(phone == "8790124010" && pass == "Suresh@2025") {
      onLogin({name:"Admin", phone:"8790124010", isAdmin:true});
      return;
    }

    var users = {};
    try { users = JSON.parse(localStorage.getItem("bp_users")||"{}"); } catch(e) {}
    if(mode == "register") {
      if(users[phone]) { setErr("Phone already registered. Please login."); return; }
      users[phone] = {name:name, phone:phone, pass:pass};
      try { localStorage.setItem("bp_users", JSON.stringify(users)); } catch(e) {}
      onLogin({name:name, phone:phone});
    } else {
      if(!users[phone]) {
        var demoName = "Trader";
        users[phone] = {name:demoName, phone:phone, pass:pass};
        try { localStorage.setItem("bp_users", JSON.stringify(users)); } catch(e) {}
        onLogin({name:demoName, phone:phone});
        return;
      }
      if(users[phone].pass != pass) { setErr("Wrong password. Try again."); return; }
      onLogin(users[phone]);
    }
  }

  var pg = {background:"#F8F9FA",minHeight:"100vh",display:"flex",flexDirection:"column"};
  var logoSec = {background:"#fff",padding:"32px 20px 24px",textAlign:"center",borderBottom:"1px solid #F0F0F0"};
  var bp = {width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",boxShadow:"0 4px 14px rgba(0,200,83,0.3)"};
  var appName = {fontSize:26,fontWeight:900,color:"#111827",letterSpacing:-0.8};
  var tag = {fontSize:9,color:"#F97316",fontWeight:800,letterSpacing:2,marginTop:3};
  var sub = {fontSize:10,color:"#9CA3AF",marginTop:6};
  var body = {padding:"24px 20px",flex:1};
  var tabRow = {display:"flex",background:"#F3F4F6",borderRadius:12,padding:4,marginBottom:20,border:"1px solid #E5E7EB"};
  var inpWrap = {background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,padding:"11px 13px",marginBottom:10,display:"flex",gap:8,alignItems:"center"};
  var inpStyle = {flex:1,background:"none",border:"none",outline:"none",color:"#111827",fontSize:13,fontFamily:"inherit"};
  var submitBtn = {width:"100%",background:G,border:"none",borderRadius:12,padding:"14px",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 3px 12px rgba(0,200,83,0.3)",marginTop:4};
  var disc = {marginTop:14,background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:"10px 12px",fontSize:8,color:"#92400E",lineHeight:1.7,textAlign:"center"};

  return (
    <div style={pg}>
      <div style={logoSec}>
        <div style={bp}><span style={{fontFamily:"Arial",fontSize:18,fontWeight:900,color:"#fff"}}>BP</span></div>
        <div style={appName}>Breakout<span style={{color:G}}> Pro</span></div>
        <div style={tag}>CATCH EVERY BREAKOUT</div>
        <div style={sub}>India's #1 Stock Market Education Platform</div>
      </div>
      <div style={body}>
        <div style={tabRow}>
          {["login","register"].map(function(m) {
            var active = mode == m;
            var btn = {flex:1,padding:"10px",borderRadius:9,border:"none",background:active?"#fff":"transparent",color:active?"#111827":"#6B7280",fontWeight:active?700:500,fontSize:12,cursor:"pointer",fontFamily:"inherit",boxShadow:active?"0 1px 4px rgba(0,0,0,0.08)":"none"};
            return <button key={m} style={btn} onClick={function(){setMode(m);setErr("");}}>{m == "login" ? "Login" : "Register"}</button>;
          })}
        </div>
        {err ? <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:11,color:"#DC2626"}}>! {err}</div> : null}
        {mode == "register" ? (
          <div style={inpWrap}>
            <span style={{fontSize:14}}>👤</span>
            <input style={inpStyle} placeholder="Full Name" value={name} onChange={function(e){setName(e.target.value);}}/>
          </div>
        ) : null}
        <div style={inpWrap}>
          <span style={{fontSize:14}}>📱</span>
          <input style={inpStyle} placeholder="10-digit Phone Number" type="tel" maxLength={10} value={phone} onChange={function(e){setPhone(e.target.value);}}/>
        </div>
        <div style={inpWrap}>
          <span style={{fontSize:14}}>🔒</span>
          <input style={inpStyle} placeholder="Password (min 6 chars)" type="password" value={pass} onChange={function(e){setPass(e.target.value);}}/>
        </div>
        <button style={submitBtn} onClick={submit}>{mode == "login" ? "Login" : "Create Account"}</button>
        <div style={disc}>! {DISCLAIMER}</div>
      </div>
    </div>
  );
}

// --- SPLASH SCREEN ------------------------------------------------------------
function SplashScreen() {
  var wrap = {position:"fixed",top:0,left:0,right:0,bottom:0,background:"#0B0B0B",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999};
  var inner = {textAlign:"center"};
  var bp = {width:72,height:72,borderRadius:20,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 6px 24px rgba(0,200,83,0.4)"};
  var name = {fontSize:28,fontWeight:900,color:"#fff",letterSpacing:-1,marginBottom:4};
  var tag = {fontSize:8,color:"#F97316",fontWeight:800,letterSpacing:2,marginBottom:20};
  var bar = {width:200,height:3,background:"#1A2A1A",borderRadius:3,margin:"0 auto",overflow:"hidden"};
  var fill = {height:"100%",width:"70%",background:G,borderRadius:3};
  return (
    <div style={wrap}>
      <div style={inner}>
        <div style={bp}><span style={{fontFamily:"Arial",fontSize:22,fontWeight:900,color:"#fff"}}>BP</span></div>
        <div style={name}>Breakout<span style={{color:G}}> Pro</span></div>
        <div style={tag}>CATCH EVERY BREAKOUT</div>
        <div style={bar}><div style={fill}></div></div>
        <div style={{fontSize:9,color:"#555",marginTop:10}}>Loading...</div>
      </div>
    </div>
  );
}

// --- MAIN APP -----------------------------------------------------------------
// -- GLOBAL MARKETS SCREEN ----------------------------------------------------
function GlobalScreen() {
  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14};
  var title = {fontSize:16,fontWeight:800,color:"#111827",marginBottom:14};
  return (
    <div style={pg}>
      <div style={title}>🌍 Global Markets</div>
      {GLOBAL_MARKETS.map(function(m) {
        var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"};
        var nameStyle = {fontSize:12,fontWeight:700,color:"#111827"};
        var icoStyle = {fontSize:20,marginRight:8};
        var valStyle = {fontFamily:"monospace",fontSize:13,fontWeight:800,color:"#111827"};
        var chgStyle = {fontSize:10,fontWeight:700,color:m.up?"#00C853":"#EF4444",marginTop:2};
        return (
          <div key={m.name} style={card}>
            <div style={{display:"flex",alignItems:"center"}}>
              <span style={icoStyle}>{m.ico}</span>
              <span style={nameStyle}>{m.name}</span>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={valStyle}>{m.val.toLocaleString("en-IN")}</div>
              <div style={chgStyle}>{m.up?"+":""}{m.chg.toFixed(2)}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -- HEATMAP SCREEN ------------------------------------------------------------
function HeatmapScreen() {
  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  var nifty50 = [
    {sym:"RELIANCE",chg:1.71},{sym:"TCS",chg:-0.97},{sym:"HDFCBANK",chg:1.90},
    {sym:"ICICIBANK",chg:2.33},{sym:"INFY",chg:-1.40},{sym:"WIPRO",chg:2.99},
    {sym:"TATAMOTORS",chg:2.23},{sym:"MARUTI",chg:1.07},{sym:"SUNPHARMA",chg:-0.98},
    {sym:"BAJFINANCE",chg:1.90},{sym:"NTPC",chg:0.54},{sym:"POWERGRID",chg:-0.23},
    {sym:"ONGC",chg:1.12},{sym:"SBIN",chg:2.45},{sym:"LTIM",chg:-1.78},
    {sym:"AXISBANK",chg:1.34},{sym:"KOTAKBANK",chg:-0.67},{sym:"HINDALCO",chg:3.24},
    {sym:"TATASTEEL",chg:2.87},{sym:"JSWSTEEL",chg:1.45},{sym:"ULTRACEMCO",chg:-0.34},
    {sym:"TITAN",chg:0.89},{sym:"NESTLEIND",chg:-0.12},{sym:"HINDUNILVR",chg:0.23},
    {sym:"ITC",chg:1.56},{sym:"M&M",chg:1.89},{sym:"BAJAJFINSV",chg:0.45},
  ];
  function getColor(chg) {
    if(chg >= 3) return {bg:"#00C853",text:"#fff"};
    if(chg >= 1.5) return {bg:"#4CAF50",text:"#fff"};
    if(chg >= 0.5) return {bg:"#A5D6A7",text:"#111"};
    if(chg >= 0) return {bg:"#C8E6C9",text:"#111"};
    if(chg >= -0.5) return {bg:"#FFCDD2",text:"#111"};
    if(chg >= -1.5) return {bg:"#EF9A9A",text:"#111"};
    return {bg:"#EF4444",text:"#fff"};
  }
  return (
    <div style={pg}>
      <div style={{padding:"14px 14px 8px",fontSize:13,fontWeight:700,color:"#111827"}}>NIFTY 50 Heatmap</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3,padding:"0 14px 14px"}}>
        {nifty50.map(function(s) {
          var col = getColor(s.chg);
          var cell = {background:col.bg,borderRadius:8,padding:"8px 4px",textAlign:"center"};
          return (
            <div key={s.sym} style={cell}>
              <div style={{fontSize:7,fontWeight:700,color:col.text}}>{s.sym}</div>
              <div style={{fontSize:8,fontWeight:800,color:col.text,marginTop:2}}>{s.chg > 0 ? "+" : ""}{s.chg.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>
      <div style={{padding:"0 14px 14px",fontSize:11,fontWeight:700,color:"#111827",marginBottom:8}}>Sector Heatmap</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,padding:"0 14px 14px"}}>
        {SECTOR_DATA.map(function(s) {
          var up = s.chg >= 0;
          var cell = {background:up?"#DCFCE7":"#FEE2E2",border:"1px solid "+(up?"#BBF7D0":"#FECDD3"),borderRadius:10,padding:10,textAlign:"center"};
          return (
            <div key={s.name} style={cell}>
              <div style={{fontSize:10,fontWeight:700,color:"#374151"}}>{s.name}</div>
              <div style={{fontSize:12,fontWeight:800,color:up?"#00C853":"#EF4444",marginTop:2}}>{up?"+":""}{s.chg.toFixed(2)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- FII/DII SCREEN ------------------------------------------------------------
function FiiDiiScreen() {
  var daily = [
    {date:"Jun 10",fii:2340,dii:-890,net:1450},
    {date:"Jun 09",fii:-1230,dii:1560,net:330},
    {date:"Jun 08",fii:3450,dii:-230,net:3220},
    {date:"Jun 07",fii:-890,dii:2340,net:1450},
    {date:"Jun 06",fii:1230,dii:890,net:2120},
  ];
  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14};
  var scard = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:14,padding:14,marginBottom:12,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"};
  return (
    <div style={pg}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>FII/DII Activity</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #BBF7D0",borderRadius:14,padding:14,textAlign:"center"}}>
          <div style={{fontSize:9,color:"#166534",marginBottom:4}}>FII Today (Cr)</div>
          <div style={{fontSize:22,fontWeight:900,color:"#00C853"}}>+2,340</div>
          <div style={{fontSize:8,color:"#6B7280",marginTop:3}}>Net Buyers</div>
        </div>
        <div style={{background:"linear-gradient(135deg,#FFF1F2,#FEE2E2)",border:"1px solid #FECDD3",borderRadius:14,padding:14,textAlign:"center"}}>
          <div style={{fontSize:9,color:"#991B1B",marginBottom:4}}>DII Today (Cr)</div>
          <div style={{fontSize:22,fontWeight:900,color:"#EF4444"}}>-890</div>
          <div style={{fontSize:8,color:"#6B7280",marginTop:3}}>Net Sellers</div>
        </div>
      </div>
      <div style={scard}>
        <div style={{fontSize:12,fontWeight:700,color:"#111827",marginBottom:10}}>Daily Activity (Rs Cr)</div>
        {daily.map(function(d) {
          var netUp = d.net >= 0;
          return (
            <div key={d.date} style={{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #F5F5F5"}}>
              <div style={{fontSize:10,color:"#6B7280",width:50}}>{d.date}</div>
              <div style={{flex:1,display:"flex",gap:6}}>
                <span style={{fontSize:9,color:"#00C853",fontWeight:600}}>FII: {d.fii > 0 ? "+" : ""}{d.fii}</span>
                <span style={{fontSize:9,color:"#EF4444",fontWeight:600}}>DII: {d.dii > 0 ? "+" : ""}{d.dii}</span>
              </div>
              <div style={{fontSize:10,fontWeight:700,color:netUp?"#00C853":"#EF4444"}}>{netUp?"+":""}{d.net}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- ECONOMIC CALENDAR ---------------------------------------------------------
function EcoCalScreen() {
  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14};
  function impColor(imp) {
    if(imp == "HIGH") return {bg:"#FEE2E2",col:"#991B1B"};
    if(imp == "MED") return {bg:"#FEF3C7",col:"#D97706"};
    return {bg:"#F3F4F6",col:"#6B7280"};
  }
  return (
    <div style={pg}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>Economic Calendar</div>
      {ECO_CALENDAR.map(function(ev,i) {
        var ic = impColor(ev.imp);
        var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px 14px",marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"};
        return (
          <div key={i} style={card}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontSize:12,fontWeight:700,color:"#111827"}}>{ev.event}</div>
              <div style={{background:ic.bg,color:ic.col,borderRadius:6,padding:"2px 8px",fontSize:8,fontWeight:700}}>{ev.imp}</div>
            </div>
            <div style={{display:"flex",gap:16,fontSize:9,color:"#6B7280"}}>
              <span>📅 {ev.date}</span>
              <span>🌍 {ev.country}</span>
              <span>Prev: {ev.prev}</span>
              <span>Exp: {ev.exp}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -- IPO SCREEN ----------------------------------------------------------------
function IPOScreen() {
  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14};
  function statusColor(s) {
    if(s == "Open") return {bg:"#DCFCE7",col:"#166534"};
    if(s == "Upcoming") return {bg:"#FEF3C7",col:"#D97706"};
    return {bg:"#F3F4F6",col:"#6B7280"};
  }
  return (
    <div style={pg}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>IPO Dashboard</div>
      {IPO_DATA_LIST.map(function(ipo,i) {
        var sc = statusColor(ipo.status);
        var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:14,padding:14,marginBottom:10,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"};
        return (
          <div key={i} style={card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{fontSize:13,fontWeight:700,color:"#111827"}}>{ipo.name}</div>
              <div style={{background:sc.bg,color:sc.col,borderRadius:6,padding:"2px 8px",fontSize:8,fontWeight:700}}>{ipo.status}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[["Price Band",ipo.price],["Lot Size",ipo.lot+" shares"],["Open",ipo.open],["Close",ipo.close],["GMP",ipo.gmp],["Subscription",ipo.sub]].map(function(r) {
                return (
                  <div key={r[0]} style={{background:"#F9FAFB",borderRadius:8,padding:"6px 8px"}}>
                    <div style={{fontSize:7,color:"#9CA3AF",marginBottom:2}}>{r[0]}</div>
                    <div style={{fontSize:10,fontWeight:700,color:"#111827"}}>{r[1]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -- TRADING JOURNAL -----------------------------------------------------------
function JournalScreen() {
  var stored = [];
  try { stored = JSON.parse(localStorage.getItem("bp_journal")||"[]"); } catch(e) {}
  var [entries, setEntries] = useState(stored);
  var [showAdd, setShowAdd] = useState(false);
  var [sym, setSym] = useState("");
  var [entry, setEntry] = useState("");
  var [exitP, setExitP] = useState("");
  var [qty, setQty] = useState("");
  var [reason, setReason] = useState("");
  var [emotion, setEmotion] = useState("Neutral");
  var [side, setSide] = useState("Long");

  function addEntry() {
    if(!sym || !entry || !exitP || !qty) return;
    var entryPrice = parseFloat(entry);
    var exitPrice = parseFloat(exitP);
    var quantity = parseFloat(qty);
    var pnl = (exitPrice - entryPrice) * quantity * (side == "Long" ? 1 : -1);
    var newEntry = {
      id:Date.now(), sym:sym.toUpperCase(), side:side,
      entry:entryPrice, exit:exitPrice, qty:quantity,
      pnl:pnl, reason:reason, emotion:emotion,
      date:new Date().toLocaleDateString("en-IN"), time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),
    };
    var newEntries = [newEntry].concat(entries);
    setEntries(newEntries);
    try { localStorage.setItem("bp_journal", JSON.stringify(newEntries.slice(0,100))); } catch(e) {}
    setShowAdd(false); setSym(""); setEntry(""); setExitP(""); setQty(""); setReason(""); setEmotion("Neutral");
  }

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  var inpStyle = {width:"100%",background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,padding:"10px 12px",color:"#111827",fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:8};
  var totalPnl = entries.reduce(function(s,e){return s+e.pnl;},0);

  if(showAdd) {
    return (
      <div style={pg}>
        <div style={{background:"#fff",padding:"12px 14px",borderBottom:"1px solid #F0F0F0",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={function(){setShowAdd(false);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer"}}>&larr;</button>
          <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Add Trade</div>
        </div>
        <div style={{padding:14}}>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            {["Long","Short"].map(function(s) {
              var active = side == s;
              return <button key={s} onClick={function(){setSide(s);}} style={{flex:1,background:active?(s=="Long"?"#00C853":"#EF4444"):"#F3F4F6",border:"none",borderRadius:10,padding:"10px",color:active?"#fff":"#374151",fontWeight:600,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{s}</button>;
            })}
          </div>
          <input style={inpStyle} placeholder="Stock Symbol (e.g. RELIANCE)" value={sym} onChange={function(e){setSym(e.target.value);}}/>
          <input style={inpStyle} placeholder="Entry Price" type="number" value={entry} onChange={function(e){setEntry(e.target.value);}}/>
          <input style={inpStyle} placeholder="Exit Price" type="number" value={exitP} onChange={function(e){setExitP(e.target.value);}}/>
          <input style={inpStyle} placeholder="Quantity" type="number" value={qty} onChange={function(e){setQty(e.target.value);}}/>
          <input style={inpStyle} placeholder="Reason for trade" value={reason} onChange={function(e){setReason(e.target.value);}}/>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:"#374151",fontWeight:600,marginBottom:6}}>Emotion</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {["Confident","FOMO","Fear","Neutral","Greedy","Patient"].map(function(em) {
                return <button key={em} onClick={function(){setEmotion(em);}} style={{background:emotion==em?"#111827":"#F3F4F6",border:"none",borderRadius:20,padding:"5px 10px",color:emotion==em?"#fff":"#374151",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{em}</button>;
              })}
            </div>
          </div>
          <button onClick={addEntry} style={{width:"100%",background:"#00C853",border:"none",borderRadius:12,padding:14,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Save Trade</button>
        </div>
      </div>
    );
  }

  return (
    <div style={pg}>
      <div style={{padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:16,fontWeight:800,color:"#111827"}}>Trading Journal</div>
          <button onClick={function(){setShowAdd(true);}} style={{background:"#00C853",border:"none",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Add Trade</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div style={{background:totalPnl>=0?"#F0FDF4":"#FFF1F2",border:"1px solid "+(totalPnl>=0?"#BBF7D0":"#FECDD3"),borderRadius:12,padding:12,textAlign:"center"}}>
            <div style={{fontSize:8,color:"#6B7280",marginBottom:3}}>Total P&L</div>
            <div style={{fontSize:20,fontWeight:900,color:totalPnl>=0?"#00C853":"#EF4444"}}>{totalPnl>=0?"+ Rs ":"- Rs "}{Math.abs(totalPnl).toFixed(0)}</div>
          </div>
          <div style={{background:"#F0F9FF",border:"1px solid #BAE6FD",borderRadius:12,padding:12,textAlign:"center"}}>
            <div style={{fontSize:8,color:"#6B7280",marginBottom:3}}>Total Trades</div>
            <div style={{fontSize:20,fontWeight:900,color:"#0369A1"}}>{entries.length}</div>
          </div>
        </div>
        {entries.length == 0 ? (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:32,marginBottom:8}}>📔</div>
            <div style={{fontSize:12,color:"#6B7280"}}>No trades yet. Start tracking!</div>
          </div>
        ) : null}
        {entries.map(function(e) {
          var pnlUp = e.pnl >= 0;
          var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid "+(pnlUp?"#00C853":"#EF4444"),boxShadow:"0 1px 4px rgba(0,0,0,0.04)"};
          return (
            <div key={e.id} style={card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <span style={{fontSize:13,fontWeight:700,color:"#111827"}}>{e.sym}</span>
                  <span style={{background:e.side=="Long"?"#DCFCE7":"#FEE2E2",color:e.side=="Long"?"#166534":"#991B1B",borderRadius:4,padding:"1px 6px",fontSize:7,fontWeight:700,marginLeft:6}}>{e.side}</span>
                </div>
                <div style={{fontSize:13,fontWeight:800,color:pnlUp?"#00C853":"#EF4444"}}>{pnlUp?"+ Rs ":"- Rs "}{Math.abs(e.pnl).toFixed(0)}</div>
              </div>
              <div style={{display:"flex",gap:12,marginTop:6,fontSize:9,color:"#6B7280"}}>
                <span>Entry: {e.entry}</span>
                <span>Exit: {e.exit}</span>
                <span>Qty: {e.qty}</span>
              </div>
              {e.emotion ? <div style={{fontSize:8,color:"#9CA3AF",marginTop:3}}>Emotion: {e.emotion}</div> : null}
              <div style={{fontSize:8,color:"#9CA3AF",marginTop:2}}>{e.date} {e.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- MARKET MOOD SCREEN --------------------------------------------------------
function MoodScreen() {
  var m = MARKET_MOOD;
  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14};
  return (
    <div style={pg}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>Market Mood Index</div>
      <div style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:16,padding:20,marginBottom:14,textAlign:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{fontSize:48,marginBottom:8}}>{m.sentiment == "Bullish" ? "🐂" : m.sentiment == "Bearish" ? "🐻" : "😐"}</div>
        <div style={{fontSize:24,fontWeight:900,color:"#00C853",marginBottom:4}}>{m.sentiment}</div>
        <div style={{fontSize:10,color:"#6B7280"}}>Market is in {m.sentiment.toLowerCase()} zone</div>
        <div style={{display:"flex",gap:3,height:12,borderRadius:6,overflow:"hidden",margin:"16px 0 8px"}}>
          <div style={{width:m.bull+"%",background:"#00C853"}}></div>
          <div style={{width:m.neutral+"%",background:"#F59E0B"}}></div>
          <div style={{width:m.bear+"%",background:"#EF4444"}}></div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#6B7280"}}>
          <span style={{color:"#00C853",fontWeight:700}}>Bull {m.bull}%</span>
          <span style={{color:"#F59E0B",fontWeight:700}}>Neutral {m.neutral}%</span>
          <span style={{color:"#EF4444",fontWeight:700}}>Bear {m.bear}%</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:12,textAlign:"center"}}>
          <div style={{fontSize:9,color:"#6B7280",marginBottom:3}}>India VIX</div>
          <div style={{fontSize:20,fontWeight:900,color:m.vix < 15 ? "#00C853" : "#EF4444"}}>{m.vix}</div>
          <div style={{fontSize:8,color:"#9CA3AF"}}>{m.vix < 15 ? "Low Fear" : "High Fear"}</div>
        </div>
        <div style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:12,textAlign:"center"}}>
          <div style={{fontSize:9,color:"#6B7280",marginBottom:3}}>FII Net (Cr)</div>
          <div style={{fontSize:20,fontWeight:900,color:"#00C853"}}>+{m.fii_net}</div>
          <div style={{fontSize:8,color:"#9CA3AF"}}>Buyers</div>
        </div>
      </div>
      <div style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:14,padding:14,marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:"#111827",marginBottom:10}}>Daily Motivation</div>
        {TRADER_QUOTES.slice(0,1).map(function(q) {
          return (
            <div key={q.name} style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",borderRadius:10,padding:14,borderLeft:"3px solid #00C853"}}>
              <div style={{fontSize:12,color:"#374151",lineHeight:1.6,fontStyle:"italic",marginBottom:8}}>"{q.quote}"</div>
              <div style={{fontSize:10,fontWeight:700,color:"#111827"}}>-- {q.name}</div>
              <div style={{fontSize:8,color:"#6B7280"}}>{q.role}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- CHALLENGES SCREEN ---------------------------------------------------------
function ChallengesScreen() {
  var storedXP = 0;
  try { storedXP = parseInt(localStorage.getItem("bp_xp")||"0"); } catch(e) {}
  var storedDone = [];
  try { storedDone = JSON.parse(localStorage.getItem("bp_done")||"[]"); } catch(e) {}
  var [xp, setXp] = useState(storedXP);
  var [done, setDone] = useState(storedDone);
  var [active, setActive] = useState(null);
  var [selected, setSelected] = useState(null);
  var [result, setResult] = useState(null);

  function answer(idx) {
    if(!active) return;
    setSelected(idx);
    var correct = idx == active.ans;
    if(correct && done.indexOf(active.id) == -1) {
      var newXP = xp + active.xp;
      var newDone = done.concat([active.id]);
      setXp(newXP); setDone(newDone);
      try { localStorage.setItem("bp_xp", newXP); localStorage.setItem("bp_done", JSON.stringify(newDone)); } catch(e) {}
    }
    setResult(correct);
  }

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14};
  var level = xp < 50 ? "Beginner" : xp < 150 ? "Learner" : xp < 300 ? "Trader" : "Expert";

  if(active) {
    return (
      <div style={pg}>
        <button onClick={function(){setActive(null);setSelected(null);setResult(null);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",marginBottom:14}}>&larr;</button>
        <div style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:16,padding:20,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:11,color:"#00C853",fontWeight:700,marginBottom:8}}>{active.title} * +{active.xp} XP</div>
          <div style={{fontSize:16,fontWeight:700,color:"#111827",lineHeight:1.5,marginBottom:16}}>{active.q}</div>
          {active.opts.map(function(opt,i) {
            var bgCol = selected == null ? "#F9FAFB" : i == active.ans ? "#DCFCE7" : i == selected ? "#FEE2E2" : "#F9FAFB";
            var borderCol = selected == null ? "#E5E7EB" : i == active.ans ? "#00C853" : i == selected ? "#EF4444" : "#E5E7EB";
            return (
              <button key={i} onClick={function(){answer(i);}} disabled={selected != null} style={{width:"100%",background:bgCol,border:"2px solid "+borderCol,borderRadius:12,padding:"12px 14px",marginBottom:8,textAlign:"left",cursor:selected!=null?"default":"pointer",fontFamily:"inherit",fontSize:12,color:"#111827",fontWeight:500}}>
                {opt}
              </button>
            );
          })}
          {result != null ? (
            <div style={{textAlign:"center",padding:"10px 0",fontSize:14,fontWeight:700,color:result?"#00C853":"#EF4444"}}>
              {result ? "Correct! +" + active.xp + " XP 🎉" : "Wrong! Study and try next question 📚"}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div style={pg}>
      <div style={{background:"linear-gradient(135deg,#111827,#1F2937)",borderRadius:16,padding:16,marginBottom:14,color:"#fff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:"#9CA3AF"}}>Your Level</div>
            <div style={{fontSize:22,fontWeight:900,color:"#00C853"}}>{level}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:"#9CA3AF"}}>Total XP</div>
            <div style={{fontSize:28,fontWeight:900,color:"#F59E0B"}}>{xp}</div>
          </div>
        </div>
        <div style={{height:4,background:"rgba(255,255,255,0.1)",borderRadius:2,marginTop:12,overflow:"hidden"}}>
          <div style={{height:"100%",width:Math.min((xp%100)+"%","100%"),background:"#00C853",borderRadius:2}}></div>
        </div>
        <div style={{fontSize:8,color:"#6B7280",marginTop:4}}>{done.length}/{CHALLENGES.length} challenges completed</div>
      </div>
      <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:10}}>Daily Challenges</div>
      {CHALLENGES.map(function(ch) {
        var isDone = done.indexOf(ch.id) != -1;
        var card = {background:"#fff",border:"1px solid "+(isDone?"#BBF7D0":"#F0F0F0"),borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"};
        return (
          <div key={ch.id} style={card} onClick={function(){if(!isDone){setActive(ch);setSelected(null);setResult(null);}}}>
            <div style={{width:36,height:36,borderRadius:10,background:isDone?"#DCFCE7":"#F3F4F6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{isDone?"OK":"🎯"}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:"#111827"}}>{ch.title}</div>
              <div style={{fontSize:9,color:"#6B7280",marginTop:2}}>{isDone?"Completed":"Tap to start"}</div>
            </div>
            <div style={{background:isDone?"#DCFCE7":"#FEF3C7",borderRadius:6,padding:"3px 8px",fontSize:9,fontWeight:700,color:isDone?"#166534":"#D97706"}}>+{ch.xp} XP</div>
          </div>
        );
      })}
    </div>
  );
}

// -- WATCHLIST SCREEN ----------------------------------------------------------
function WatchlistScreen(props) {
  var storedWL = [];
  try { storedWL = JSON.parse(localStorage.getItem("bp_watchlist")||"[]"); } catch(e) {}
  var [watchlist, setWatchlist] = useState(storedWL);
  var [search, setSearch] = useState("");

  function toggleWatch(sym) {
    var idx = watchlist.indexOf(sym);
    var newWL = idx == -1 ? watchlist.concat([sym]) : watchlist.filter(function(s){return s!=sym;});
    setWatchlist(newWL);
    try { localStorage.setItem("bp_watchlist", JSON.stringify(newWL)); } catch(e) {}
  }

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  var wlStocks = props.stocks.filter(function(s){return watchlist.indexOf(s.sym)!=-1;});
  var allStocks = props.stocks.filter(function(s){
    return !search || s.sym.toLowerCase().indexOf(search.toLowerCase())!=-1;
  });

  return (
    <div style={pg}>
      <div style={{padding:14}}>
        <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:10}}>Watchlist</div>
        {wlStocks.length > 0 ? (
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #F0F0F0",marginBottom:14,overflow:"hidden"}}>
            {wlStocks.map(function(s) {
              return <StockRow key={s.sym} stock={s} onClick={function(){}}/>;
            })}
          </div>
        ) : (
          <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:12,padding:16,textAlign:"center",marginBottom:14}}>
            <div style={{fontSize:24,marginBottom:6}}>*</div>
            <div style={{fontSize:11,color:"#374151"}}>Add stocks to watchlist below</div>
          </div>
        )}
        <div style={{fontSize:11,fontWeight:700,color:"#111827",marginBottom:8}}>Add Stocks</div>
        <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:"8px 12px",marginBottom:10,display:"flex",gap:8}}>
          <span>🔍</span>
          <input style={{flex:1,border:"none",outline:"none",fontSize:12,fontFamily:"inherit"}} placeholder="Search stocks..." value={search} onChange={function(e){setSearch(e.target.value);}}/>
        </div>
        {allStocks.map(function(s) {
          var inWL = watchlist.indexOf(s.sym) != -1;
          return (
            <div key={s.sym} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:10,padding:"10px 12px",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#111827"}}>{s.sym}</div>
                <div style={{fontSize:9,color:"#9CA3AF"}}>{s.sect}</div>
              </div>
              <button onClick={function(){toggleWatch(s.sym);}} style={{background:inWL?"#DCFCE7":"#F3F4F6",border:inWL?"1px solid #BBF7D0":"1px solid #E5E7EB",borderRadius:8,padding:"6px 12px",fontSize:9,fontWeight:700,color:inWL?"#166534":"#374151",cursor:"pointer",fontFamily:"inherit"}}>{inWL?"* Added":"+ Watch"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- STRATEGY SCREEN -----------------------------------------------------------
function StrategyScreen() {
  var [selected, setSelected] = useState(null);
  var strats = [
    {id:"ema",name:"EMA Crossover",ico:"📊",tag:"Swing/Intraday"},
    {id:"vwap",name:"VWAP Strategy",ico:"📈",tag:"Intraday"},
    {id:"breakout",name:"Breakout Strategy",ico:"🚀",tag:"All Types"},
    {id:"scalp",name:"Scalping",ico:"!",tag:"Scalp"},
  ];
  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14};

  if(selected) {
    var s = STRATEGY_DATA[selected];
    return (
      <div style={pg}>
        <button onClick={function(){setSelected(null);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",marginBottom:14}}>&larr;</button>
        <div style={{fontSize:18,fontWeight:800,color:"#111827",marginBottom:6}}>{s.name}</div>
        <div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #BBF7D0",borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,color:"#374151",lineHeight:1.8}}>{s.desc}</div>
        </div>
        <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:8}}>Rules</div>
        {s.rules.map(function(r,i) {
          return (
            <div key={i} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:10,padding:"10px 12px",marginBottom:6,display:"flex",gap:10}}>
              <span style={{color:"#00C853",fontWeight:700,fontSize:12}}>{i+1}.</span>
              <span style={{fontSize:11,color:"#374151",lineHeight:1.5}}>{r}</span>
            </div>
          );
        })}
        <div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:10,marginTop:10}}>
          <div style={{fontSize:8,color:"#92400E"}}>! {DISCLAIMER}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pg}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>Strategy Builder</div>
      {strats.map(function(st) {
        var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:14,padding:"14px",marginBottom:10,display:"flex",alignItems:"center",gap:12,cursor:"pointer",boxShadow:"0 1px 6px rgba(0,0,0,0.04)"};
        return (
          <div key={st.id} style={card} onClick={function(){setSelected(st.id);}}>
            <div style={{width:44,height:44,borderRadius:12,background:"#F0FDF4",border:"1px solid #BBF7D0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{st.ico}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:"#111827"}}>{st.name}</div>
              <div style={{fontSize:9,color:"#6B7280",marginTop:2}}>{st.tag}</div>
            </div>
            <span style={{color:"#9CA3AF",fontSize:16}}>&gt;</span>
          </div>
        );
      })}
    </div>
  );
}

// -- DIVIDEND CALENDAR ---------------------------------------------------------
function DividendScreen() {
  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14};
  function typeColor(t) {
    if(t == "Dividend") return {bg:"#DCFCE7",col:"#166534"};
    if(t == "Bonus") return {bg:"#FEF3C7",col:"#D97706"};
    if(t == "Split") return {bg:"#EFF6FF",col:"#1E40AF"};
    return {bg:"#F3F4F6",col:"#6B7280"};
  }
  return (
    <div style={pg}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>Corporate Actions</div>
      {DIVIDEND_DATA.map(function(d,i) {
        var tc = typeColor(d.type);
        var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px 14px",marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"};
        return (
          <div key={i} style={card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontSize:13,fontWeight:700,color:"#111827"}}>{d.sym}</div>
              <div style={{background:tc.bg,color:tc.col,borderRadius:6,padding:"2px 8px",fontSize:8,fontWeight:700}}>{d.type}</div>
            </div>
            <div style={{fontSize:16,fontWeight:900,color:"#111827",marginBottom:4}}>{d.amt}</div>
            <div style={{display:"flex",gap:12,fontSize:9,color:"#6B7280"}}>
              <span>Ex-Date: {d.exDate}</span>
              <span>Pay Date: {d.payDate}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}


// -- MORE SCREEN ---------------------------------------------------------------
function MoreScreen(props) {
  var items = [
    {ico:"🌍",label:"Global Markets",id:"global",desc:"Dow, Nasdaq, Gold, Crude"},
    {ico:"🌡",label:"Market Heatmap",id:"heatmap",desc:"NIFTY 50 + Sector blocks"},
    {ico:"💹",label:"FII/DII Tracker",id:"fiidii",desc:"Daily institutional flows"},
    {ico:"📅",label:"Economic Calendar",id:"ecocal",desc:"RBI, Fed, GDP, CPI events"},
    {ico:"🏢",label:"IPO Dashboard",id:"ipo",desc:"Live IPO + GMP tracker"},
    {ico:"📔",label:"Trading Journal",id:"journal",desc:"Track your trades + P&L"},
    {ico:"🧭",label:"Market Mood",id:"mood",desc:"Bull/Bear + VIX + FII"},
    {ico:"🎯",label:"Daily Challenges",id:"challenges",desc:"Quiz + XP + Badges"},
    {ico:"*",label:"Watchlist",id:"watchlist",desc:"Track your favourite stocks"},
    {ico:"📐",label:"Strategy Builder",id:"strategy",desc:"EMA, VWAP, Breakout"},
    {ico:"💰",label:"Dividends",id:"dividend",desc:"Dividend, Bonus, Split"},
  ];
  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14};
  return (
    <div style={pg}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>All Features</div>
      {items.map(function(item) {
        var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"};
        return (
          <div key={item.id} style={card} onClick={function(){props.setTab(item.id);}}>
            <div style={{width:40,height:40,borderRadius:10,background:"#F3F4F6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{item.ico}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:"#111827"}}>{item.label}</div>
              <div style={{fontSize:9,color:"#6B7280",marginTop:1}}>{item.desc}</div>
            </div>
            <span style={{color:"#9CA3AF",fontSize:16}}>&gt;</span>
          </div>
        );
      })}
    </div>
  );
}


// -- MULTI LANGUAGE ------------------------------------------------------------
var LANGS = {
  en:{home:"Home",markets:"Markets",learn:"Learn",ai:"AI Chat",
    goodMorn:"Good Morning",goodAfter:"Good Afternoon",goodEve:"Good Evening",
    briefingTitle:"AI Market Briefing",getBriefing:"Get My Briefing",
    disclaimer:"Educational only. Not SEBI registered. Not investment advice.",
    search:"Search stocks...",addTrade:"Add Trade",totalPnl:"Total P&L",
    challenges:"Daily Challenges",watchlist:"Watchlist",strategy:"Strategy"},
  te:{home:"Home",markets:"Markets",learn:"Nerchukovandi",ai:"AI Chat",
    goodMorn:"Shubhodayam",goodAfter:"Shubha Madhyahnam",goodEve:"Shubha Sayantram",
    briefingTitle:"AI Market Briefing",getBriefing:"Briefing Teesuko",
    disclaimer:"Vidya matram. SEBI namoodu kaadu. Pettubadi salaaha kaadu.",
    search:"Stock vetakandi...",addTrade:"Trade Jodimchu",totalPnl:"Mottham Laabhanashttam",
    challenges:"Rojuvari Savallu",watchlist:"Watchlist",strategy:"Vyuham"},
  hi:{home:"Home",markets:"Bazaar",learn:"Seekhein",ai:"AI Chat",
    goodMorn:"Shubh Prabhat",goodAfter:"Shubh Dopahar",goodEve:"Shubh Sandhya",
    briefingTitle:"AI Market Briefing",getBriefing:"Briefing Lo",
    disclaimer:"Keval shaikshik. SEBI panjeekrit nahin. Nivesh salaah nahin.",
    search:"Stock khojein...",addTrade:"Trade Jodein",totalPnl:"Kul Laabh/Haani",
    challenges:"Dainik Chunautiyan",watchlist:"Watchlist",strategy:"Ranniti"},
  gu:{home:"Home",markets:"Bajar",learn:"Shikho",ai:"AI Chat",
    goodMorn:"Suprabhat",goodAfter:"Shubh Bapo",goodEve:"Shubh Saanj",
    briefingTitle:"AI Market Briefing",getBriefing:"Briefing Melvo",
    disclaimer:"Maatra shaikshaanik. SEBI nodhayel nathi. Rokaan salaah nathi.",
    search:"Stock shodho...",addTrade:"Trade Umero",totalPnl:"Kul Nafaa/Nuqsaan",
    challenges:"Dainik Padkaaro",watchlist:"Watchlist",strategy:"Vyuha"},
};


// -- MARKET REPLAY SCREEN ------------------------------------------------------
function ReplayScreen() {
  var [playing, setPlaying] = useState(false);
  var [speed, setSpeed] = useState(1);
  var [candle, setCandle] = useState(0);
  var [userGuess, setUserGuess] = useState(null);
  var [result, setResult] = useState(null);

  var candles = [];
  var seed = 22400;
  for(var i=0;i<30;i++) {
    var o = seed + (Math.random()-0.5)*50;
    var c2 = o + (Math.random()-0.48)*80;
    var h = Math.max(o,c2) + Math.random()*30;
    var l = Math.min(o,c2) - Math.random()*30;
    candles.push({o:parseFloat(o.toFixed(0)),c:parseFloat(c2.toFixed(0)),h:parseFloat(h.toFixed(0)),l:parseFloat(l.toFixed(0))});
    seed = c2;
  }

  useEffect(function() {
    if(!playing) return;
    var t = setInterval(function() {
      setCandle(function(prev) {
        if(prev >= 24) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, 1000/speed);
    return function(){clearInterval(t);};
  }, [playing, speed]);

  function guess(dir) {
    setUserGuess(dir);
    var nextCandle = candles[candle+1];
    var correct = (dir=="up" && nextCandle.c > nextCandle.o) || (dir=="down" && nextCandle.c < nextCandle.o);
    setResult(correct);
    setTimeout(function(){setUserGuess(null);setResult(null);}, 1500);
  }

  var pg = {background:"#0B0B0B",minHeight:"100%",paddingBottom:80,color:"#fff"};
  var visible = candles.slice(0, candle+1);
  var minL = Math.min.apply(null, visible.map(function(c){return c.l;}));
  var maxH = Math.max.apply(null, visible.map(function(c){return c.h;}));
  var range = maxH - minL || 1;
  var chartH = 180;
  var chartW = 280;
  var cw = chartW / 30;

  return (
    <div style={pg}>
      <div style={{background:"#111",padding:"12px 14px",borderBottom:"1px solid #1E1E1E"}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>Market Replay</div>
        <div style={{fontSize:9,color:"#555"}}>Practice reading price action on historical data</div>
      </div>
      <div style={{padding:14}}>
        <div style={{background:"#161616",border:"1px solid #222",borderRadius:12,padding:12,marginBottom:12}}>
          <svg width={chartW} height={chartH}>
            {visible.map(function(cd,i) {
              var up = cd.c >= cd.o;
              var col = up ? "#00C853" : "#EF4444";
              var x = i * cw + cw/2;
              var bodyTop = chartH - ((Math.max(cd.o,cd.c)-minL)/range)*chartH;
              var bodyBot = chartH - ((Math.min(cd.o,cd.c)-minL)/range)*chartH;
              var wickTop = chartH - ((cd.h-minL)/range)*chartH;
              var wickBot = chartH - ((cd.l-minL)/range)*chartH;
              var bh = Math.max(2, bodyBot-bodyTop);
              return (
                <g key={i}>
                  <line x1={x} y1={wickTop} x2={x} y2={wickBot} stroke={col} strokeWidth={1}/>
                  <rect x={x-cw*0.3} y={bodyTop} width={cw*0.6} height={bh} fill={col}/>
                </g>
              );
            })}
          </svg>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:12,justifyContent:"center"}}>
          <button onClick={function(){setPlaying(!playing);}} style={{background:playing?"#EF4444":"#00C853",border:"none",borderRadius:10,padding:"10px 20px",color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{playing ? "|| Pause" : "> Play"}</button>
          {[0.5,1,2].map(function(s) {
            return <button key={s} onClick={function(){setSpeed(s);}} style={{background:speed==s?"#3B82F6":"#222",border:"none",borderRadius:10,padding:"8px 12px",color:"#fff",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{s}x</button>;
          })}
          <button onClick={function(){setCandle(0);setPlaying(false);}} style={{background:"#222",border:"none",borderRadius:10,padding:"8px 12px",color:"#fff",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>R</button>
        </div>
        <div style={{background:"#161616",border:"1px solid #222",borderRadius:12,padding:14,textAlign:"center"}}>
          <div style={{fontSize:11,color:"#888",marginBottom:8}}>What happens next?</div>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <button onClick={function(){guess("up");}} style={{background:userGuess=="up"?(result?"#00C853":"#EF4444"):"#1E3A1E",border:"1px solid #00C853",borderRadius:10,padding:"12px 24px",color:"#00C853",fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>^ Up</button>
            <button onClick={function(){guess("down");}} style={{background:userGuess=="down"?(result?"#00C853":"#EF4444"):"#3A1E1E",border:"1px solid #EF4444",borderRadius:10,padding:"12px 24px",color:"#EF4444",fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>v Down</button>
          </div>
          {result != null ? (
            <div style={{marginTop:10,fontSize:14,fontWeight:700,color:result?"#00C853":"#EF4444"}}>{result ? "OK Correct!" : "X Wrong!"}</div>
          ) : null}
        </div>
        <div style={{marginTop:12,background:"#0F0F0F",border:"1px solid #1A1A1A",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:"#555"}}>Candle {candle+1}/25 * {candles[candle] ? (candles[candle].c > candles[candle].o ? "🟢 Green" : "🔴 Red") : ""}</div>
        </div>
      </div>
    </div>
  );
}

// -- STOCK COMPARE SCREEN ------------------------------------------------------
function CompareScreen(props) {
  var [sym1, setSym1] = useState("RELIANCE");
  var [sym2, setSym2] = useState("TCS");

  var stocks = props.stocks;
  var s1 = stocks.find(function(s){return s.sym==sym1;}) || stocks[0];
  var s2 = stocks.find(function(s){return s.sym==sym2;}) || stocks[1];

  var extraData = {
    RELIANCE: {pe:28.4, roe:14.2, eps:99.8, rev:"870K Cr", profit:"79K Cr", trend:"Bullish"},
    TCS:      {pe:32.1, roe:48.3, eps:114.2, rev:"240K Cr", profit:"46K Cr", trend:"Neutral"},
    HDFCBANK: {pe:19.8, roe:17.4, eps:88.1, rev:"260K Cr", profit:"50K Cr", trend:"Bullish"},
    ICICIBANK:{pe:18.2, roe:18.9, eps:71.0, rev:"185K Cr", profit:"42K Cr", trend:"Bullish"},
    INFY:     {pe:26.4, roe:32.1, eps:59.4, rev:"153K Cr", profit:"26K Cr", trend:"Bearish"},
    WIPRO:    {pe:23.1, roe:18.7, eps:20.8, rev:"90K Cr", profit:"11K Cr", trend:"Neutral"},
  };

  var d1 = extraData[sym1] || {pe:"-",roe:"-",eps:"-",rev:"-",profit:"-",trend:"--"};
  var d2 = extraData[sym2] || {pe:"-",roe:"-",eps:"-",rev:"-",profit:"-",trend:"--"};

  var rows = [
    ["LTP", "Rs "+fN(s1.ltp), "Rs "+fN(s2.ltp)],
    ["Change", (s1.up?"+":"")+s1.chgPct.toFixed(2)+"%", (s2.up?"+":"")+s2.chgPct.toFixed(2)+"%"],
    ["P/E Ratio", d1.pe, d2.pe],
    ["ROE %", d1.roe, d2.roe],
    ["EPS", d1.eps, d2.eps],
    ["Revenue", d1.rev, d2.rev],
    ["Net Profit", d1.profit, d2.profit],
    ["Sector", s1.sect, s2.sect],
    ["Trend", d1.trend, d2.trend],
  ];

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14};
  var selStyle = {flex:1,background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,padding:"8px 10px",fontSize:12,color:"#111827",fontFamily:"inherit",outline:"none"};

  return (
    <div style={pg}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>Stock Compare</div>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
        <select style={selStyle} value={sym1} onChange={function(e){setSym1(e.target.value);}}>
          {stocks.map(function(s){return <option key={s.sym} value={s.sym}>{s.sym}</option>;})}
        </select>
        <span style={{fontSize:16,color:"#9CA3AF",flexShrink:0}}>vs</span>
        <select style={selStyle} value={sym2} onChange={function(e){setSym2(e.target.value);}}>
          {stocks.map(function(s){return <option key={s.sym} value={s.sym}>{s.sym}</option>;})}
        </select>
      </div>
      <div style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:"#F8F9FA",borderBottom:"1px solid #F0F0F0"}}>
          <div style={{padding:"10px 12px",fontSize:9,color:"#6B7280",fontWeight:600}}>Metric</div>
          <div style={{padding:"10px 12px",fontSize:11,fontWeight:700,color:"#00C853",textAlign:"center"}}>{sym1}</div>
          <div style={{padding:"10px 12px",fontSize:11,fontWeight:700,color:"#3B82F6",textAlign:"center"}}>{sym2}</div>
        </div>
        {rows.map(function(row,i) {
          return (
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:"1px solid #F5F5F5"}}>
              <div style={{padding:"10px 12px",fontSize:9,color:"#6B7280",fontWeight:600}}>{row[0]}</div>
              <div style={{padding:"10px 12px",fontSize:10,fontWeight:700,color:"#111827",textAlign:"center"}}>{row[1]}</div>
              <div style={{padding:"10px 12px",fontSize:10,fontWeight:700,color:"#111827",textAlign:"center"}}>{row[2]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- PORTFOLIO ANALYTICS -------------------------------------------------------
function PortfolioScreen() {
  var stored = [];
  try { stored = JSON.parse(localStorage.getItem("bp_portfolio")||"[]"); } catch(e) {}
  var [holdings, setHoldings] = useState(stored);
  var [showAdd, setShowAdd] = useState(false);
  var [sym, setSym] = useState("");
  var [qty, setQty] = useState("");
  var [avgPrice, setAvgPrice] = useState("");

  var LIVE_PRICES = {RELIANCE:2845,TCS:3654,HDFCBANK:1742,ICICIBANK:1289,INFY:1567,WIPRO:478,TATAMOTORS:945,MARUTI:13240,SUNPHARMA:1678,BAJFINANCE:7234};

  function addHolding() {
    if(!sym || !qty || !avgPrice) return;
    var ltp = LIVE_PRICES[sym.toUpperCase()] || parseFloat(avgPrice);
    var newH = {sym:sym.toUpperCase(),qty:parseFloat(qty),avg:parseFloat(avgPrice),ltp:ltp};
    var newList = holdings.concat([newH]);
    setHoldings(newList);
    try { localStorage.setItem("bp_portfolio", JSON.stringify(newList)); } catch(e) {}
    setShowAdd(false); setSym(""); setQty(""); setAvgPrice("");
  }

  var totalInv = holdings.reduce(function(s,h){return s+h.qty*h.avg;},0);
  var totalCur = holdings.reduce(function(s,h){return s+h.qty*h.ltp;},0);
  var totalPnl = totalCur - totalInv;
  var pnlPct = totalInv > 0 ? (totalPnl/totalInv)*100 : 0;

  var sectors = {};
  holdings.forEach(function(h) {
    var sect = h.sym=="RELIANCE"||h.sym=="ONGC"?"Energy":h.sym=="TCS"||h.sym=="INFY"||h.sym=="WIPRO"?"IT":h.sym=="HDFCBANK"||h.sym=="ICICIBANK"?"Banking":"Others";
    sectors[sect] = (sectors[sect]||0) + h.qty*h.ltp;
  });

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  var inpStyle = {width:"100%",background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,padding:"10px 12px",color:"#111827",fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:8};

  if(showAdd) {
    return (
      <div style={pg}>
        <div style={{background:"#fff",padding:"12px 14px",borderBottom:"1px solid #F0F0F0",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={function(){setShowAdd(false);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer"}}>&larr;</button>
          <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Add Holding</div>
        </div>
        <div style={{padding:14}}>
          <input style={inpStyle} placeholder="Symbol (e.g. RELIANCE)" value={sym} onChange={function(e){setSym(e.target.value);}}/>
          <input style={inpStyle} placeholder="Quantity" type="number" value={qty} onChange={function(e){setQty(e.target.value);}}/>
          <input style={inpStyle} placeholder="Average Buy Price" type="number" value={avgPrice} onChange={function(e){setAvgPrice(e.target.value);}}/>
          <button onClick={addHolding} style={{width:"100%",background:"#00C853",border:"none",borderRadius:12,padding:14,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Add to Portfolio</button>
        </div>
      </div>
    );
  }

  return (
    <div style={pg}>
      <div style={{padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:16,fontWeight:800,color:"#111827"}}>Portfolio</div>
          <button onClick={function(){setShowAdd(true);}} style={{background:"#00C853",border:"none",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Add</button>
        </div>
        <div style={{background:"linear-gradient(135deg,#111827,#1F2937)",borderRadius:16,padding:16,marginBottom:14,color:"#fff"}}>
          <div style={{fontSize:9,color:"#9CA3AF",marginBottom:4}}>Portfolio Value</div>
          <div style={{fontSize:26,fontWeight:900,marginBottom:4}}>Rs {fN(totalCur)}</div>
          <div style={{display:"flex",gap:16,fontSize:10}}>
            <span style={{color:"#9CA3AF"}}>Invested: Rs {fN(totalInv)}</span>
            <span style={{color:totalPnl>=0?"#00C853":"#EF4444",fontWeight:700}}>{totalPnl>=0?"+":""}Rs {fN(Math.abs(totalPnl))} ({pnlPct.toFixed(1)}%)</span>
          </div>
        </div>
        {Object.keys(sectors).length > 0 ? (
          <div style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:14,padding:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:"#111827",marginBottom:10}}>Sector Allocation</div>
            {Object.keys(sectors).map(function(s) {
              var pct = totalCur > 0 ? (sectors[s]/totalCur)*100 : 0;
              return (
                <div key={s} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#374151",marginBottom:3}}>
                    <span style={{fontWeight:600}}>{s}</span>
                    <span>{pct.toFixed(1)}%</span>
                  </div>
                  <div style={{height:6,background:"#F3F4F6",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:pct+"%",background:"#00C853",borderRadius:3}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
        {holdings.length == 0 ? (
          <div style={{textAlign:"center",padding:"30px 0"}}>
            <div style={{fontSize:32,marginBottom:8}}>📊</div>
            <div style={{fontSize:12,color:"#6B7280"}}>Add holdings to track your portfolio</div>
          </div>
        ) : null}
        {holdings.map(function(h,i) {
          var pnl = (h.ltp - h.avg) * h.qty;
          var pnlP = ((h.ltp-h.avg)/h.avg)*100;
          var up = pnl >= 0;
          return (
            <div key={i} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid "+(up?"#00C853":"#EF4444"),boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:700,color:"#111827"}}>{h.sym}</span>
                <span style={{fontSize:12,fontWeight:800,color:up?"#00C853":"#EF4444"}}>{up?"+":""}Rs {fN(Math.abs(pnl))}</span>
              </div>
              <div style={{display:"flex",gap:12,fontSize:9,color:"#6B7280"}}>
                <span>Qty: {h.qty}</span>
                <span>Avg: Rs {h.avg}</span>
                <span>LTP: Rs {h.ltp}</span>
                <span style={{color:up?"#00C853":"#EF4444",fontWeight:700}}>{up?"+":""}{pnlP.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- TOP TRADERS SCREEN --------------------------------------------------------
function TradersScreen() {
  var traders = [
    {name:"Rakesh Jhunjhunwala",nick:"Big Bull of India",returns:"30%+ CAGR",style:"Value + Growth",ico:"🐂",quote:"Never lose big. If you lose big, you are out of the game.",tip:"Buy quality stocks when everyone is selling in fear."},
    {name:"Ramesh Damani",nick:"Market Veteran",returns:"25%+ CAGR",style:"Long-term Value",ico:"📈",quote:"Markets are devices to transfer money from the impatient to the patient.",tip:"Patience and conviction beat short-term trading."},
    {name:"Vijay Kedia",nick:"SMILE Investor",returns:"20%+ CAGR",style:"Small/Mid Cap",ico:"😊",quote:"Find a business that can grow 10x in 10 years.",tip:"SMILE: Small cap, Medium in size, Large in aspiration."},
    {name:"Warren Buffett",nick:"Oracle of Omaha",returns:"20% CAGR 60yr",style:"Value Investing",ico:"🎯",quote:"Be fearful when others are greedy and greedy when others are fearful.",tip:"Buy great businesses at fair prices and hold forever."},
    {name:"Jesse Livermore",nick:"Legendary Trader",returns:"100x returns",style:"Price Action",ico:"!",quote:"The market is never wrong -- opinions often are.",tip:"Trade what you see, not what you think."},
    {name:"Mark Minervini",nick:"SEPA Trader",returns:"33% CAGR",style:"Momentum",ico:"🚀",quote:"Trade like a sniper, not a machine gunner.",tip:"Only buy stocks making new 52-week highs with strong earnings."},
  ];

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14};

  return (
    <div style={pg}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:4}}>Top Traders</div>
      <div style={{fontSize:10,color:"#6B7280",marginBottom:14}}>Learn from the world's greatest traders</div>
      {traders.map(function(t) {
        var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:16,padding:16,marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"};
        return (
          <div key={t.name} style={card}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
              <div style={{width:48,height:48,borderRadius:14,background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #BBF7D0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{t.ico}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:800,color:"#111827"}}>{t.name}</div>
                <div style={{fontSize:9,color:"#00C853",fontWeight:600}}>{t.nick}</div>
                <div style={{display:"flex",gap:8,marginTop:3}}>
                  <span style={{fontSize:8,background:"#F3F4F6",borderRadius:4,padding:"1px 6px",color:"#374151"}}>{t.style}</span>
                  <span style={{fontSize:8,background:"#DCFCE7",borderRadius:4,padding:"1px 6px",color:"#166534",fontWeight:700}}>{t.returns}</span>
                </div>
              </div>
            </div>
            <div style={{background:"linear-gradient(135deg,#F8F9FA,#F0FDF4)",borderRadius:10,padding:10,marginBottom:8,borderLeft:"3px solid #00C853"}}>
              <div style={{fontSize:10,color:"#374151",lineHeight:1.6,fontStyle:"italic"}}>"{t.quote}"</div>
            </div>
            <div style={{background:"#FEF3C7",borderRadius:8,padding:"7px 10px",display:"flex",gap:6}}>
              <span style={{fontSize:11}}>💡</span>
              <span style={{fontSize:9,color:"#92400E",lineHeight:1.5}}>{t.tip}</span>
            </div>
          </div>
        );
      })}
      <div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:10}}>
        <div style={{fontSize:8,color:"#92400E"}}>! {DISCLAIMER}</div>
      </div>
    </div>
  );
}

// -- AI VOICE ASSISTANT --------------------------------------------------------
function VoiceScreen() {
  var [listening, setListening] = useState(false);
  var [transcript, setTranscript] = useState("");
  var [answer, setAnswer] = useState("");
  var [supported, setSupported] = useState(true);

  useEffect(function(){
    if(typeof window == "undefined") return;
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR) setSupported(false);
  },[]);

  function startListen() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR) return;
    var rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onstart = function(){setListening(true);};
    rec.onend = function(){setListening(false);};
    rec.onresult = function(e) {
      var text = e.results[0][0].transcript;
      setTranscript(text);
      var ql = text.toLowerCase();
      var ans = null;
      var kbKeys = Object.keys(AI_KB);
      for(var k=0;k<kbKeys.length;k++) {
        if(ql.indexOf(kbKeys[k]) != -1) { ans = AI_KB[kbKeys[k]]; break; }
      }
      if(!ans) ans = "Ask me about OI, PCR, RSI, MACD, Support, Resistance, VWAP, Max Pain, Delta, Theta, Breakout and more!";
      setAnswer(ans);
      // Text-to-speech
      if(window.speechSynthesis) {
        var utt = new window.SpeechSynthesisUtterance(ans.replace("📚","").replace("| Not SEBI registered investment advice",""));
        utt.lang = "en-IN";
        utt.rate = 0.9;
        window.speechSynthesis.speak(utt);
      }
    };
    rec.start();
  }

  var pg = {background:"#0B0B0B",minHeight:"100%",paddingBottom:80,color:"#fff",display:"flex",flexDirection:"column"};

  return (
    <div style={pg}>
      <div style={{background:"#111",padding:"12px 14px",borderBottom:"1px solid #1E1E1E"}}>
        <div style={{fontSize:14,fontWeight:700}}>AI Voice Assistant</div>
        <div style={{fontSize:9,color:"#555"}}>Say "Explain OI" or "What is PCR"</div>
      </div>
      {!supported ? (
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:20,textAlign:"center"}}>
          <div>
            <div style={{fontSize:32,marginBottom:10}}>🎤</div>
            <div style={{fontSize:12,color:"#888"}}>Voice recognition not supported in this browser. Use Chrome on Android for voice support.</div>
          </div>
        </div>
      ) : (
        <div style={{flex:1,padding:20,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
            <button onClick={startListen} style={{width:120,height:120,borderRadius:"50%",background:listening?"linear-gradient(135deg,#EF4444,#DC2626)":"linear-gradient(135deg,#00C853,#00A040)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,boxShadow:listening?"0 0 30px rgba(239,68,68,0.5)":"0 0 30px rgba(0,200,83,0.4)"}}>
              {listening ? "🔴" : "🎤"}
            </button>
            <div style={{fontSize:12,color:listening?"#EF4444":"#888"}}>{listening ? "Listening... speak now" : "Tap mic and ask a question"}</div>
          </div>
          {transcript ? (
            <div style={{background:"#161616",border:"1px solid #222",borderRadius:12,padding:14,marginBottom:12,width:"100%",boxSizing:"border-box"}}>
              <div style={{fontSize:9,color:"#555",marginBottom:4}}>You said:</div>
              <div style={{fontSize:13,color:"#fff",fontStyle:"italic"}}>"{transcript}"</div>
            </div>
          ) : null}
          {answer ? (
            <div style={{background:"#1E3A5F",border:"1px solid #1E4080",borderRadius:12,padding:14,width:"100%",boxSizing:"border-box"}}>
              <div style={{fontSize:9,color:"#3B82F6",marginBottom:4,fontWeight:700}}>BP AI Answer:</div>
              <div style={{fontSize:11,color:"#e8e8e8",lineHeight:1.7}}>{answer}</div>
            </div>
          ) : null}
          <div style={{marginTop:14,width:"100%"}}>
            <div style={{fontSize:10,color:"#555",marginBottom:8}}>Try saying:</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {["Explain OI","What is PCR","What is RSI","Explain VWAP","What is Max Pain"].map(function(q) {
                return <span key={q} style={{background:"#161616",border:"1px solid #222",borderRadius:20,padding:"4px 10px",fontSize:8,color:"#888"}}>{q}</span>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// -- SUBSCRIPTION SCREEN -------------------------------------------------------
function SubScreen(props) {
  var user = props.user;
  var onUpgrade = props.onUpgrade;
  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};

  var trialEndDate = "";
  if(user && user.trialStart) {
    var end = new Date(user.trialStart + 7*24*60*60*1000);
    trialEndDate = end.toLocaleDateString("en-IN");
  }
  var trialDaysLeft = 7;
  if(user && user.trialStart) {
    var diff = Date.now() - user.trialStart;
    trialDaysLeft = Math.max(0, 7 - Math.floor(diff/(1000*60*60*24)));
  }
  var isTrial = user && !user.isPrem && trialDaysLeft > 0;
  var isExpired = user && !user.isPrem && trialDaysLeft == 0;

  return (
    <div style={pg}>
      <div style={{padding:16}}>
        {isTrial ? (
          <div style={{background:"linear-gradient(135deg,#FEF3C7,#FDE68A)",border:"1px solid #F59E0B",borderRadius:16,padding:16,marginBottom:16,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:6}}></div>
            <div style={{fontSize:16,fontWeight:800,color:"#92400E"}}>Free Trial Active</div>
            <div style={{fontSize:24,fontWeight:900,color:"#D97706",margin:"4px 0"}}>{trialDaysLeft} days left</div>
            <div style={{fontSize:10,color:"#92400E"}}>Trial ends {trialEndDate}</div>
          </div>
        ) : null}
        {isExpired ? (
          <div style={{background:"linear-gradient(135deg,#FEE2E2,#FECDD3)",border:"1px solid #EF4444",borderRadius:16,padding:16,marginBottom:16,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:6}}>🔒</div>
            <div style={{fontSize:16,fontWeight:800,color:"#991B1B"}}>Trial Expired</div>
            <div style={{fontSize:10,color:"#991B1B",marginTop:4}}>Upgrade to continue using premium features</div>
          </div>
        ) : null}
        {SUB_PLANS.slice(1).map(function(plan) {
          var isPopular = plan.id == "monthly";
          var saving = plan.id == "quarterly" ? "Save Rs 98" : plan.id == "yearly" ? "Save Rs 1,589" : "";
          var card = {background:"#fff",border:"2px solid "+(isPopular?plan.color:"#E5E7EB"),borderRadius:16,padding:16,marginBottom:12,position:"relative",boxShadow:isPopular?"0 4px 20px rgba(0,200,83,0.15)":"0 1px 6px rgba(0,0,0,0.05)"};
          return (
            <div key={plan.id} style={card}>
              {isPopular ? <div style={{position:"absolute",top:-10,right:16,background:"#00C853",color:"#fff",borderRadius:20,padding:"3px 12px",fontSize:9,fontWeight:700}}>* {plan.tag}</div> : null}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{fontSize:16,fontWeight:800,color:"#111827"}}>{plan.name}</div>
                  <div style={{fontSize:22,fontWeight:900,color:plan.color}}>Rs {plan.price}</div>
                  <div style={{fontSize:9,color:"#6B7280"}}>{plan.period}</div>
                  {saving ? <div style={{fontSize:8,color:"#00C853",fontWeight:700,marginTop:2}}>{saving}</div> : null}
                </div>
                <button onClick={function(){onUpgrade(plan);}} style={{background:plan.color,border:"none",borderRadius:12,padding:"10px 20px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Upgrade</button>
              </div>
              {plan.features.map(function(f) {
                return <div key={f} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}><span style={{color:"#00C853",fontSize:12}}>OK</span><span style={{fontSize:10,color:"#374151"}}>{f}</span></div>;
              })}
            </div>
          );
        })}
        <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:12,padding:12,marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:"#166534",marginBottom:4}}>💳 How to Pay</div>
          <div style={{fontSize:9,color:"#166534",lineHeight:1.8}}>UPI / Razorpay / PhonePe / GPay{"
"}Contact us: breakoutpro.in/pay{"
"}Support: support@breakoutpro.in</div>
        </div>
        <div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:10,textAlign:"center"}}>
          <div style={{fontSize:8,color:"#92400E"}}>! {DISCLAIMER}</div>
        </div>
      </div>
    </div>
  );
}

// -- NOTIFICATION SETTINGS SCREEN ----------------------------------------------
function NotifScreen(props) {
  var defaultSettings = {};
  NOTIF_CATEGORIES.forEach(function(cat){defaultSettings[cat.id]=true;});
  var stored = defaultSettings;
  try { var s=JSON.parse(localStorage.getItem("bp_notif")||"{}"); stored=Object.assign({},defaultSettings,s); } catch(e) {}
  var [settings, setSettings] = useState(stored);
  var [permission, setPermission] = useState("default");
  var [testSent, setTestSent] = useState(false);

  useEffect(function(){
    if(typeof Notification != "undefined") setPermission(Notification.permission);
  },[]);

  function requestPermission() {
    if(typeof Notification == "undefined") return;
    Notification.requestPermission().then(function(p){ setPermission(p); });
  }

  function toggle(id) {
    var newS = Object.assign({}, settings);
    newS[id] = !newS[id];
    setSettings(newS);
    try { localStorage.setItem("bp_notif", JSON.stringify(newS)); } catch(e) {}
  }

  function sendTest() {
    if(typeof Notification == "undefined" || Notification.permission != "granted") {
      requestPermission();
      return;
    }
    new Notification("BREAKOUT PRO Test 🚀", {
      body:"Notifications are working! You will receive breakout alerts.",
      icon:"/favicon.ico",
    });
    setTestSent(true);
    setTimeout(function(){setTestSent(false);}, 3000);
  }

  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80};

  return (
    <div style={pg}>
      <div style={{padding:14}}>
        <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>Notification Settings</div>

        {/* Permission Banner */}
        {permission != "granted" ? (
          <div style={{background:"linear-gradient(135deg,#EFF6FF,#DBEAFE)",border:"1px solid #93C5FD",borderRadius:14,padding:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:"#1E40AF",marginBottom:4}}>Enable Push Notifications</div>
            <div style={{fontSize:9,color:"#1E40AF",marginBottom:10}}>Get instant alerts for breakouts, news and market updates</div>
            <button onClick={requestPermission} style={{background:"#3B82F6",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Enable Notifications</button>
          </div>
        ) : (
          <div style={{background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#166534"}}>OK Notifications Active</div>
              <div style={{fontSize:9,color:"#166534"}}>You will receive all enabled alerts</div>
            </div>
            <button onClick={sendTest} style={{background:testSent?"#00C853":"#166534",border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{testSent?"Sent! OK":"Test"}</button>
          </div>
        )}

        {/* Categories */}
        {NOTIF_CATEGORIES.map(function(cat) {
          var enabled = settings[cat.id];
          var row = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"};
          var toggle_outer = {width:44,height:24,borderRadius:12,background:enabled?"#00C853":"#D1D5DB",position:"relative",cursor:"pointer",flexShrink:0,transition:"background 0.2s"};
          var toggle_inner = {width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:enabled?22:2,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"};
          return (
            <div key={cat.id} style={row}>
              <div style={{fontSize:22,flexShrink:0}}>{cat.ico}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:"#111827"}}>{cat.label}</div>
                <div style={{fontSize:9,color:"#6B7280",marginTop:1}}>{cat.desc}</div>
              </div>
              <div style={toggle_outer} onClick={function(){toggle(cat.id);}}>
                <div style={toggle_inner}></div>
              </div>
            </div>
          );
        })}

        <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:12,padding:12,marginTop:6}}>
          <div style={{fontSize:10,fontWeight:700,color:"#166534",marginBottom:4}}>📢 Notification Quality Promise</div>
          <div style={{fontSize:9,color:"#166534",lineHeight:1.7}}>* High quality alerts only -- no spam{"
"}* AI-filtered relevant signals{"
"}* Instant delivery during market hours{"
"}* Smart grouping to reduce noise</div>
        </div>
      </div>
    </div>
  );
}

// -- DAILY PLAN SCREEN ---------------------------------------------------------
function DailyPlanScreen(props) {
  var p = DAILY_PLAN;
  var mkt = getMarketStatus();
  var pg = {background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14};
  var card = {background:"#fff",border:"1px solid #F0F0F0",borderRadius:14,padding:14,marginBottom:12,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"};
  var lesson = DAILY_LESSONS[new Date().getDay() % DAILY_LESSONS.length];

  return (
    <div style={pg}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:4}}>Daily Trading Plan</div>
      <div style={{fontSize:10,color:"#6B7280",marginBottom:14}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>

      {/* Market status */}
      <div style={{background:mkt.open?"linear-gradient(135deg,#F0FDF4,#DCFCE7)":"linear-gradient(135deg,#F3F4F6,#E5E7EB)",border:"1px solid "+(mkt.open?"#BBF7D0":"#E5E7EB"),borderRadius:14,padding:14,marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:12,height:12,borderRadius:"50%",background:mkt.open?"#00C853":"#9CA3AF",flexShrink:0}}></div>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:"#111827"}}>{mkt.open?"Market is Open":"Market is Closed"}</div>
          <div style={{fontSize:9,color:"#6B7280"}}>{mkt.open?"NSE/BSE: 9:15 AM - 3:30 PM":"Next opens at 9:15 AM"}</div>
        </div>
      </div>

      {/* Key levels */}
      <div style={card}>
        <div style={{fontSize:12,fontWeight:700,color:"#111827",marginBottom:10}}>📐 Key Levels -- NIFTY</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[["Support",p.support,"#DCFCE7","#166534"],["Pivot",p.pivot,"#FEF3C7","#D97706"],["Resistance",p.resistance,"#FEE2E2","#991B1B"]].map(function(r) {
            return (
              <div key={r[0]} style={{background:r[2],borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:8,color:r[3],fontWeight:600,marginBottom:3}}>{r[0]}</div>
                <div style={{fontSize:16,fontWeight:900,color:r[3]}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop:10,display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:9,color:"#6B7280"}}>Trend:</span>
          <span style={{background:"#FEF3C7",borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:700,color:"#D97706"}}>{p.trend}</span>
        </div>
      </div>

      {/* Watchlist */}
      <div style={card}>
        <div style={{fontSize:12,fontWeight:700,color:"#111827",marginBottom:8}}>👁 Today's Watchlist</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {p.watchlist.map(function(sym) {
            return <span key={sym} style={{background:"#F0F9FF",border:"1px solid #BAE6FD",borderRadius:8,padding:"5px 10px",fontSize:10,fontWeight:700,color:"#0369A1"}}>{sym}</span>;
          })}
        </div>
      </div>

      {/* Breakouts/Breakdowns */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:12,padding:12}}>
          <div style={{fontSize:10,fontWeight:700,color:"#166534",marginBottom:6}}>🚀 Breakouts</div>
          {p.breakouts.map(function(sym) {
            return <div key={sym} style={{fontSize:11,fontWeight:700,color:"#00C853",marginBottom:3}}>{sym}</div>;
          })}
        </div>
        <div style={{background:"#FFF1F2",border:"1px solid #FECDD3",borderRadius:12,padding:12}}>
          <div style={{fontSize:10,fontWeight:700,color:"#991B1B",marginBottom:6}}>📉 Breakdowns</div>
          {p.breakdowns.map(function(sym) {
            return <div key={sym} style={{fontSize:11,fontWeight:700,color:"#EF4444",marginBottom:3}}>{sym}</div>;
          })}
        </div>
      </div>

      {/* Daily lesson */}
      <div style={{background:"linear-gradient(135deg,#1F2937,#111827)",borderRadius:14,padding:14,marginBottom:12}}>
        <div style={{fontSize:10,color:"#00C853",fontWeight:700,marginBottom:6}}>📚 Today's Lesson</div>
        <div style={{fontSize:12,color:"#fff",lineHeight:1.7}}>{lesson}</div>
      </div>

      <div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:10}}>
        <div style={{fontSize:8,color:"#92400E"}}>! {DISCLAIMER}</div>
      </div>
    </div>
  );
}


export default function StocksBuddy() {

  function getSess() {
    try {
      var s = localStorage.getItem("bp_sess");
      if(!s) return null;
      var d = JSON.parse(s);
      if(d && d.name && d.phone) return d;
      localStorage.removeItem("bp_sess");
      return null;
    } catch(e) { return null; }
  }

  var savedUser = getSess();

  var [splash, setSplash] = useState(true);
  var [user, setUser] = useState(savedUser);
  var [tab, setTab] = useState("home");
  var [nifty, setNifty] = useState({ltp:22467.90,pct:1.35,up:true});
  var [sensex, setSensex] = useState({ltp:73863.45,pct:1.28,up:true});
  var [bankNifty, setBankNifty] = useState({ltp:48234.60,pct:0.86,up:true});
  var [midcap, setMidcap] = useState({ltp:43876.20,pct:0.74,up:true});
  var [stocks, setStocks] = useState(STOCKS_DEFAULT);
  var [news, setNews] = useState(NEWS_DEFAULT);
  var [briefing, setBriefing] = useState("");
  var [briefingLoading, setBriefingLoading] = useState(false);
  var [glTab, setGlTab] = useState("gainers");
  // Trial & Premium
  var [isPrem, setIsPrem] = useState(function(){
    try{
      var u=JSON.parse(localStorage.getItem("bp_sess")||"{}");
      return u.isPrem || u.isAdmin || false;
    }catch(e){return false;}
  });
  var trialStart = savedUser && savedUser.trialStart ? savedUser.trialStart : Date.now();
  var trialDaysLeft = Math.max(0, 7 - Math.floor((Date.now()-trialStart)/(1000*60*60*24)));
  var isAdmin = user && user.isAdmin;
  var hasAccess = isPrem || isAdmin || trialDaysLeft > 0;

  function upgrade(plan) {
    var newUser = Object.assign({}, user, {isPrem:true, plan:plan.id, planStart:Date.now()});
    setIsPrem(true);
    setUser(newUser);
    try{localStorage.setItem("bp_sess", JSON.stringify(newUser));}catch(e){}
    setTab("home");
  }

  var [sidebar, setSidebar] = useState(false);
  var [lang, setLang] = useState(function(){try{return localStorage.getItem("bp_lang")||"en";}catch(e){return "en";}});
  function t(key){ var l=LANGS[lang]||LANGS["en"]; return l[key]||LANGS["en"][key]||key; }
  var [clk, setClk] = useState(nowT());

  // Splash timer
  useEffect(function() {
    var t = setTimeout(function() { setSplash(false); }, 2000);
    return function() { clearTimeout(t); };
  }, []);

  // Clock
  useEffect(function() {
    var t = setInterval(function() { setClk(nowT()); }, 1000);
    return function() { clearInterval(t); };
  }, []);

  // CSS injection
  // Notification engine
  useEffect(function(){
    if(!user) return;
    var notifSettings = {};
    try{notifSettings=JSON.parse(localStorage.getItem("bp_notif")||"{}");}catch(e){}

    // Morning briefing at 8:45 AM
    function checkMorningAlert() {
      var now = new Date();
      var h = now.getHours(), m = now.getMinutes();
      if(h==8 && m==45) {
        var lastMorning = "";
        try{lastMorning=localStorage.getItem("bp_last_morning")||"";}catch(e){}
        var today = now.toDateString();
        if(lastMorning != today && notifSettings.morning != false) {
          sendNotif("Good Morning Trader! ", "NIFTY "+nifty.ltp+" | Check today's breakout stocks", "🌅");
          try{localStorage.setItem("bp_last_morning", today);}catch(e){}
        }
      }
    }

    // Breakout alert check
    function checkBreakoutAlerts() {
      if(notifSettings.breakout == false) return;
      stocks.forEach(function(s) {
        if(s.up && s.chgPct > 3) {
          var key = "bp_alerted_"+s.sym+"_"+new Date().toDateString();
          try{
            if(!localStorage.getItem(key)) {
              sendNotif("🚀 Breakout: "+s.sym, s.sym+" up "+s.chgPct.toFixed(1)+"% -- educational signal only", "🚀");
              localStorage.setItem(key, "1");
            }
          }catch(e){}
        }
      });
    }

    function sendNotif(title, body, ico) {
      if(typeof Notification == "undefined") return;
      if(Notification.permission != "granted") return;
      try{
        new Notification("BREAKOUT PRO -- "+title, {body:body, icon:"/favicon.ico"});
      }catch(e){}
    }

    var t1 = setInterval(checkMorningAlert, 30000);
    var t2 = setInterval(checkBreakoutAlerts, 120000);
    return function(){clearInterval(t1);clearInterval(t2);};
  }, [user, stocks, nifty]);

  useEffect(function() {
    if(document.getElementById("bp-css")) return;
    var el = document.createElement("style");
    el.id = "bp-css";
    el.textContent = "@keyframes bpPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.05)}}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px}";
    document.head.appendChild(el);
  }, []);

  function login(u) {
    if(!u.trialStart) u.trialStart = Date.now();
    setUser(u);
    try { localStorage.setItem("bp_sess", JSON.stringify(u)); } catch(e) {}
  }

  function logout() {
    setUser(null);
    try { localStorage.removeItem("bp_sess"); } catch(e) {}
    setSidebar(false);
  }

  async function loadBriefing() {
    setBriefingLoading(true);
    var GEMINI_KEY = "";
    if(typeof window != "undefined" && window.GEMINI_KEY) GEMINI_KEY = window.GEMINI_KEY;
    try {
      var ctrl = new AbortController();
      var timer = setTimeout(function(){ctrl.abort();}, 15000);
      var prompt = "Give a brief Indian stock market educational summary for today in 100 words. Mention NIFTY at " + nifty.ltp + " (" + (nifty.up?"+":"") + nifty.pct + "%). Educational only, no advice. End with: Educational only. Not investment advice.";
      var resp = await fetch(GEMINI_URL + GEMINI_KEY, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:200,temperature:0.7}}),
        signal:ctrl.signal,
      });
      clearTimeout(timer);
      var data = await resp.json();
      if(data.candidates && data.candidates[0] && data.candidates[0].content) {
        setBriefing(data.candidates[0].content.parts[0].text);
      } else {
        setBriefing("Market update unavailable. Check Gemini API key in settings.");
      }
    } catch(e) {
      setBriefing("Could not load briefing. Please check your internet connection.");
    }
    setBriefingLoading(false);
  }

  // Sidebar nav items
  var navItems = [
    {ico:"🏠",label:"Home",id:"home"},
    {ico:"📈",label:"Markets",id:"markets"},
    {ico:"📡",label:"Scanner",id:"scanner"},
    {ico:"📊",label:"OI Chain",id:"oi"},
    {ico:"📚",label:"Learn",id:"learn"},
    {ico:"🤖",label:"AI Chat",id:"ai"},
    {ico:"🛠",label:"Tools",id:"tools"},
    {ico:"📰",label:"News",id:"news"},
    {ico:"🌍",label:"Global Markets",id:"global"},
    {ico:"🌡",label:"Heatmap",id:"heatmap"},
    {ico:"💹",label:"FII/DII",id:"fiidii"},
    {ico:"📅",label:"Eco Calendar",id:"ecocal"},
    {ico:"🏢",label:"IPO",id:"ipo"},
    {ico:"📔",label:"Journal",id:"journal"},
    {ico:"🧭",label:"Market Mood",id:"mood"},
    {ico:"🎯",label:"Challenges",id:"challenges"},
    {ico:"*",label:"Watchlist",id:"watchlist"},
    {ico:"📐",label:"Strategy",id:"strategy"},
    {ico:"💰",label:"Dividends",id:"dividend"},
    {ico:"<<",label:"Market Replay",id:"replay"},
    {ico:"",label:"Stock Compare",id:"compare"},
    {ico:"💼",label:"Portfolio",id:"portfolio"},
    {ico:"🏆",label:"Top Traders",id:"traders"},
    {ico:"🎤",label:"Voice AI",id:"voice"},
    {ico:"🔔",label:"Notifications",id:"notif"},
    {ico:"👑",label:"Premium",id:"sub"},
    {ico:"📋",label:"Daily Plan",id:"dailyplan"},
  ];

  var mktStatus = getMarketStatus();

  var appWrap = {position:"relative",width:"100%",maxWidth:430,margin:"0 auto",height:"100vh",overflow:"hidden",fontFamily:"Inter,Poppins,Segoe UI,sans-serif",background:"#F8F9FA"};
  var mainArea = {height:"100vh",overflowY:"auto",paddingTop:0};

  // Sidebar overlay
  var sideOverlay = {position:"absolute",top:0,left:0,right:0,bottom:0,zIndex:200,display:"flex"};
  var sidePanel = {width:260,background:"#fff",borderRight:"1px solid #E5E7EB",display:"flex",flexDirection:"column",boxShadow:"4px 0 24px rgba(0,0,0,0.1)"};
  var sideBg = {flex:1,background:"rgba(0,0,0,0.3)"};
  var sideHead = {padding:"20px 16px",borderBottom:"1px solid #F0F0F0"};
  var sideBody = {flex:1,overflowY:"auto",padding:"8px 0"};
  var sideFoot = {padding:"16px",borderTop:"1px solid #F0F0F0"};
  var logoutBtn = {width:"100%",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"11px",color:"#DC2626",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"};

  function renderContent() {
    if(splash) {
      return (
        <SplashScreen/>
      );
    }
    if(!user) {
      return (
        <AuthScreen onLogin={login}/>
      );
    }
    var homeProps = {nifty:nifty,sensex:sensex,bankNifty:bankNifty,midcap:midcap,stocks:stocks,news:news,briefing:briefing,briefingLoading:briefingLoading,onBriefing:loadBriefing,user:user,setTab:setTab,glTab:glTab,setGlTab:setGlTab};
    var screen = null;
    if(tab == "home") { screen = <HomeScreen nifty={homeProps.nifty} sensex={homeProps.sensex} bankNifty={homeProps.bankNifty} midcap={homeProps.midcap} stocks={homeProps.stocks} news={homeProps.news} briefing={homeProps.briefing} briefingLoading={homeProps.briefingLoading} onBriefing={homeProps.onBriefing} user={homeProps.user} setTab={homeProps.setTab} glTab={homeProps.glTab} setGlTab={homeProps.setGlTab}/>; }
    if(tab == "markets") { screen = <MarketsScreen stocks={stocks} setTab={setTab}/>; }
    if(tab == "scanner") { screen = <ScannerScreen stocks={stocks}/>; }
    if(tab == "oi") { screen = <OIScreen/>; }
    if(tab == "learn") { screen = <LearnScreen/>; }
    if(tab == "ai") { screen = <AIScreen/>; }
    if(tab == "tools") { screen = <ToolsScreen/>; }
    if(tab == "news") { screen = <NewsScreen news={news}/>; }
    if(tab == "global") { screen = <GlobalScreen/>; }
    if(tab == "heatmap") { screen = <HeatmapScreen/>; }
    if(tab == "fiidii") { screen = <FiiDiiScreen/>; }
    if(tab == "ecocal") { screen = <EcoCalScreen/>; }
    if(tab == "ipo") { screen = <IPOScreen/>; }
    if(tab == "journal") { screen = <JournalScreen/>; }
    if(tab == "mood") { screen = <MoodScreen/>; }
    if(tab == "challenges") { screen = <ChallengesScreen/>; }
    if(tab == "watchlist") { screen = <WatchlistScreen stocks={stocks}/>; }
    if(tab == "strategy") { screen = <StrategyScreen/>; }
    if(tab == "dividend") { screen = <DividendScreen/>; }
    if(tab == "replay") { screen = <ReplayScreen/>; }
    if(tab == "compare") { screen = <CompareScreen stocks={stocks}/>; }
    if(tab == "portfolio") { screen = <PortfolioScreen/>; }
    if(tab == "traders") { screen = <TradersScreen/>; }
    if(tab == "voice") { screen = <VoiceScreen/>; }
    if(tab == "notif") { screen = <NotifScreen/>; }
    if(tab == "sub") { screen = <SubScreen user={user} onUpgrade={upgrade}/>; }
    if(tab == "dailyplan") { screen = <DailyPlanScreen/>; }
    if(tab == "more") { screen = <MoreScreen setTab={setTab}/>; }
    if(!screen) { screen = <HomeScreen nifty={homeProps.nifty} sensex={homeProps.sensex} bankNifty={homeProps.bankNifty} midcap={homeProps.midcap} stocks={homeProps.stocks} news={homeProps.news} briefing={homeProps.briefing} briefingLoading={homeProps.briefingLoading} onBriefing={homeProps.onBriefing} user={homeProps.user} setTab={homeProps.setTab} glTab={homeProps.glTab} setGlTab={homeProps.setGlTab}/>; }

    function renderSidebar() {
      if(!sidebar) return null;
      return (
        <div style={sideOverlay}>
          <div style={sidePanel}>
            <div style={sideHead}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#fff"}}>{user.name[0].toUpperCase()}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:"#111827"}}>{user.name}</div>
                  <div style={{fontSize:9,color:"#9CA3AF"}}>{user.phone}</div>
                </div>
              </div>
            </div>
            <div style={sideBody}>
              {navItems.map(function(item) {
                var isActive = tab == item.id;
                var navBtn = {width:"100%",background:isActive?"#F0FDF4":"none",border:"none",borderLeft:isActive?"3px solid "+G:"3px solid transparent",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left"};
                return (
                  <button key={item.id} style={navBtn} onClick={function(){setTab(item.id);setSidebar(false);}}>
                    <span style={{fontSize:18}}>{item.ico}</span>
                    <span style={{fontSize:13,fontWeight:isActive?700:500,color:isActive?G:"#374151"}}>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div style={sideFoot}>
              <div style={{fontSize:10,fontWeight:600,color:"#374151",marginBottom:6}}>Language</div>
              <div style={{display:"flex",gap:5,marginBottom:12}}>
                {["en","te","hi","gu"].map(function(l) {
                  var labels = {en:"EN",te:"TE",hi:"HI",gu:"GU"};
                  var active = lang == l;
                  return <button key={l} onClick={function(){setLang(l);try{localStorage.setItem("bp_lang",l);}catch(e){}}} style={{flex:1,background:active?"#00C853":"#F3F4F6",border:"none",borderRadius:8,padding:"6px",color:active?"#fff":"#374151",fontSize:10,fontWeight:active?700:500,cursor:"pointer",fontFamily:"inherit"}}>{labels[l]}</button>;
                })}
              </div>
              <div style={{fontSize:7,color:"#9CA3AF",marginBottom:10,lineHeight:1.6}}>{t("disclaimer")}</div>
              <button style={logoutBtn} onClick={logout}>Logout</button>
            </div>
          </div>
          <div style={sideBg} onClick={function(){setSidebar(false);}}></div>
        </div>
      );
    }

    return (
      <div style={appWrap}>
        <div style={mainArea}>
          <TopBar onMenu={function(){setSidebar(true);}} isPrem={isPrem} trialDays={trialDaysLeft} onSub={function(){setTab("sub");}}/>
          {screen}
        </div>
        <TabBar tab={tab} setTab={setTab}/>
        {renderSidebar()}
      </div>
    );
  }

  return renderContent();
}
