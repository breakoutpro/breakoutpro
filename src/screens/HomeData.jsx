import IndexDetail from "./IndexDetail";

var BG="#07111F",CARD="#0D1B2A",BD="#203A5A";
var BLUE="#3B82F6",BLUE2="#60A5FA";
var UP="#22C55E",DOWN="#EF4444",T1="#FFFFFF",T2="#C9D4E5",T3="#8A9BB5";

var INDICES=[
  {label:"NIFTY 50",  base:23969.20,pct:1.47,up:true},
  {label:"SENSEX",    base:76692.70,pct:1.54,up:true},
  {label:"BANK NIFTY",base:52134.80,pct:1.69,up:true},
  {label:"GIFTY NIFTY",base:24012.50,pct:0.32,up:true},
  {label:"MIDCAP 50", base:43876.20,pct:0.74,up:true},
];

var COMM_IDX=[
  {label:"GOLD",      base:71245,pct:0.45, up:true},
  {label:"SILVER",    base:87654,pct:0.82, up:true},
  {label:"CRUDEOIL",  base:6823, pct:-0.34,up:false},
  {label:"NATURALGAS",base:243,  pct:1.20, up:true},
];

var GLOBAL=[
  {label:"Gift Nifty",val:"24,035",chg:"+65", up:true},
  {label:"Dow Jones", val:"42,750",chg:"+234",up:true},
  {label:"Nasdaq",    val:"18,920",chg:"+87", up:true},
  {label:"Crude Oil", val:"$82.4", chg:"-0.3%",up:false},
  {label:"Gold",      val:"$2,312",chg:"+0.2%",up:true},
];

var EVENTS=[
  {type:"Expiry",  label:"NIFTY Weekly Expiry", color:DOWN},
  {type:"Earnings",label:"Reliance Q4 Results", color:BLUE},
  {type:"Data",    label:"US CPI at 6:30 PM",   color:DOWN},
  {type:"IPO",     label:"Ather Energy IPO",    color:BLUE},
];

var NEWS_TICKER=[
  "RBI Policy Today",
  "NIFTY above 24,000",
  "Crude Oil +2%",
  "FIIs Net Buyers Rs 2,800 Cr",
  "Banking sector strong momentum",
];

var WATCHLIST=[
  {sym:"RELIANCE",reason:"Q4 results today",color:BLUE},
  {sym:"TCS",reason:"FII buying interest",color:BLUE},
  {sym:"ICICIBANK",reason:"Strong support zone",color:UP},
  {sym:"HDFCBANK",reason:"Breakout watch",color:BLUE},
];

var GAINERS=[
  {sym:"ADANIENT",  ltp:2847.50, pct:4.21},
  {sym:"TATASTEEL", ltp:987.30,  pct:3.45},
  {sym:"SBIN",      ltp:824.60,  pct:2.89},
  {sym:"JSWSTEEL",  ltp:1124.80, pct:2.34},
];

var LOSERS=[
  {sym:"WIPRO",      ltp:478.20,  pct:-2.14},
  {sym:"HCLTECH",    ltp:1423.70, pct:-1.67},
  {sym:"ASIANPAINT", ltp:2634.50, pct:-1.23},
  {sym:"ULTRACEMCO", ltp:9876.40, pct:-0.98},
];

var LARGECAP=[
  {sym:"RELIANCE",  name:"Reliance Ind",  ltp:2845.60, pct:1.71,  up:true  },
  {sym:"TCS",       name:"Tata Cons Svc", ltp:3654.20, pct:0.94,  up:true  },
  {sym:"HDFCBANK",  name:"HDFC Bank",     ltp:1742.50, pct:1.90,  up:true  },
  {sym:"ICICIBANK", name:"ICICI Bank",    ltp:1289.30, pct:2.33,  up:true  },
  {sym:"INFY",      name:"Infosys",       ltp:1567.80, pct:-0.44, up:false },
  {sym:"BHARTIARTL",name:"Bharti Airtel", ltp:1876.40, pct:0.82,  up:true  },
];

var MIDCAP=[
  {sym:"PERSISTENT", name:"Persistent Sys",  ltp:5432.10, pct:3.21,  up:true  },
  {sym:"CAMS",        name:"CAMS",            ltp:3287.50, pct:2.14,  up:true  },
  {sym:"ABCAPITAL",   name:"Aditya Birla Cap",ltp:218.70,  pct:-1.34, up:false },
  {sym:"IIFL",        name:"IIFL Finance",    ltp:387.40,  pct:1.87,  up:true  },
  {sym:"ZOMATO",      name:"Zomato",          ltp:234.80,  pct:4.12,  up:true  },
  {sym:"NYKAA",       name:"FSN E-Commerce",  ltp:187.30,  pct:-2.43, up:false },
];

var SECTORS=[
  {name:"Banking",   pct:1.84,  up:true,  stocks:["HDFCBANK","ICICIBANK","SBIN","KOTAKBANK","AXISBANK"]},
  {name:"IT",        pct:0.92,  up:true,  stocks:["TCS","INFY","WIPRO","HCLTECH","TECHM"]},
  {name:"Pharma",    pct:1.23,  up:true,  stocks:["SUNPHARMA","DRREDDY","CIPLA","DIVISLAB","LUPIN"]},
  {name:"Auto",      pct:-0.67, up:false, stocks:["MARUTI","TATAMOTORS","M&M","EICHERMOT","HEROMOTOCO"]},
  {name:"Metal",     pct:2.14,  up:true,  stocks:["TATASTEEL","JSWSTEEL","HINDALCO","VEDL","COALINDIA"]},
  {name:"Realty",    pct:-1.23, up:false, stocks:["DLF","GODREJPROP","OBEROIRLTY","PRESTIGE","PHOENIXLTD"]},
  {name:"FMCG",      pct:0.34,  up:true,  stocks:["HINDUNILVR","ITC","NESTLEIND","BRITANNIA","TATACONSUM"]},
  {name:"Energy",    pct:0.78,  up:true,  stocks:["RELIANCE","ONGC","BPCL","IOC","GAIL"]},
  {name:"Infra",     pct:1.45,  up:true,  stocks:["LT","ADANIPORTS","ADANIENT","POWERGRID","NTPC"]},
  {name:"Telecom",   pct:0.56,  up:true,  stocks:["BHARTIARTL","IDEA","MTNL"]},
];

function getSession(){
  var d=new Date();
  var mins=d.getHours()*60+d.getMinutes();
  if(mins>=5*60&&mins<9*60) return "morning";
  if(mins>=9*60&&mins<15*60+30) return "live";
  if(mins>=15*60+30&&mins<18*60) return "closing";
  if(mins>=18*60&&mins<23*60+30) return "mcx";
  return "global";
}

var SESSION_META={
  morning:    {label:"Pre Market",     icon:"PM",col:BLUE2},
  live:       {label:"Live Market",    icon:"LM",col:UP},
  closing:    {label:"Closing Summary",icon:"CS",col:BLUE2},
  mcx:        {label:"MCX Live",       icon:"MX",col:BLUE2},
  global:     {label:"Global Markets", icon:"GM",col:BLUE},
};

export { INDICES, COMM_IDX, GLOBAL, EVENTS, NEWS_TICKER, WATCHLIST, GAINERS, LOSERS, LARGECAP, MIDCAP, SECTORS, getSession, SESSION_META };
