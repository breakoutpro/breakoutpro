var COMMODITIES = [
  {sym:"CRUDEOIL", name:"Crude Oil (MCX)",     ltp:6823.00,  chgPct:1.23, up:true,  unit:"bbl",  sect:"Energy"},
  {sym:"GOLD",     name:"Gold (MCX)",           ltp:71245.00, chgPct:0.45, up:true,  unit:"10g",  sect:"Precious"},
  {sym:"SILVER",   name:"Silver (MCX)",         ltp:87654.00, chgPct:-0.32,up:false, unit:"kg",   sect:"Precious"},
  {sym:"NATURALGAS",name:"Natural Gas (MCX)",   ltp:243.50,   chgPct:-1.23,up:false, unit:"mmbtu",sect:"Energy"},
  {sym:"COPPER",   name:"Copper (MCX)",         ltp:812.40,   chgPct:2.87, up:true,  unit:"kg",   sect:"Base Metal"},
  {sym:"ZINC",     name:"Zinc (MCX)",           ltp:289.30,   chgPct:1.54, up:true,  unit:"kg",   sect:"Base Metal"},
  {sym:"LEAD",     name:"Lead (MCX)",           ltp:187.60,   chgPct:0.87, up:true,  unit:"kg",   sect:"Base Metal"},
  {sym:"ALUMINIUM",name:"Aluminium (MCX)",      ltp:234.50,   chgPct:1.23, up:true,  unit:"kg",   sect:"Base Metal"},
  {sym:"NICKEL",   name:"Nickel (MCX)",         ltp:1456.80,  chgPct:-0.54,up:false, unit:"kg",   sect:"Base Metal"},
  {sym:"COTTON",   name:"Cotton (MCX)",         ltp:57890,    chgPct:0.34, up:true,  unit:"bale", sect:"Agri"},
];

var INDICES = [
  {label:"NIFTY 50",    ltp:23622.90, pct:0.00, up:true},
  {label:"SENSEX",      ltp:73863.45, pct:1.28, up:true},
  {label:"BANK NIFTY",  ltp:56814.80, pct:0.00, up:true},
  {label:"MIDCAP 50",   ltp:17265.90, pct:0.00, up:true},
  {label:"INDIA VIX",   ltp:14.23,    pct:-2.34,up:false},
  {label:"FINNIFTY",    ltp:24123.45, pct:0.87, up:true},
  {label:"NIFTY IT",    ltp:38456.70, pct:1.24, up:true},
  {label:"NIFTY BANK",  ltp:56814.80, pct:0.54, up:true},
  {label:"NIFTY AUTO",  ltp:23456.70, pct:0.94, up:true},
  {label:"NIFTY PHARMA",ltp:19876.40, pct:-0.32,up:false},
];

var SECTORS = [
  {name:"IT",     chg:1.82, stocks:["TCS","INFY","WIPRO","HCLTECH","TECHM"]},
  {name:"Bank",   chg:1.24, stocks:["HDFCBANK","ICICIBANK","SBIN","AXISBANK","KOTAKBANK"]},
  {name:"Auto",   chg:0.94, stocks:["MARUTI","TATAMOTORS","M&M","EICHERMOT","HEROMOTOCO"]},
  {name:"Pharma", chg:-0.32,stocks:["SUNPHARMA","DRREDDY","CIPLA","DIVISLAB"]},
  {name:"Energy", chg:1.35, stocks:["RELIANCE","ONGC","NTPC","POWERGRID","COALINDIA"]},
  {name:"Metal",  chg:3.24, stocks:["TATASTEEL","HINDALCO","JSWSTEEL"]},
  {name:"FMCG",   chg:0.18, stocks:["ITC","HUL","NESTLEIND","BRITANNIA","TATACONSUM"]},
  {name:"Realty", chg:2.10, stocks:["DLF","GODREJPROP","OBEROIRLTY"]},
  {name:"Infra",  chg:0.76, stocks:["LT","ADANIENT","POWERGRID"]},
  {name:"Cement", chg:1.12, stocks:["ULTRACEMCO","GRASIM","AMBUJACEM"]},
];

export { COMMODITIES, INDICES, SECTORS };
