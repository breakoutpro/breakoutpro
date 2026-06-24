// BreakoutPro - StockFullData.jsx
// Complete A-to-Z stock data structure (mock now, real via Angel One later).
// IPO history, ATH/ATL, returns, fundamentals, options Greeks.
// Rules: no backtick, no triple-equals, ASCII only.

// Master record builder - returns full analysis object for a symbol.
export function getStockFull(sym, ltp, up){
  var price=parseFloat(String(ltp||"1000").replace(/,/g,""))||1000;
  var DB=STOCK_DB[sym]||{};
  return {
    sym:sym,
    name:DB.name||sym,
    sector:DB.sector||"Equity",
    ltp:price,
    up:up,
    ipo:DB.ipo||{date:"Not available",price:0},
    ath:DB.ath||{val:Number((price*1.45).toFixed(2)),date:"Dec 2024",why:"Strong earnings and FII buying"},
    atl:DB.atl||{val:Number((price*0.42).toFixed(2)),date:"Mar 2020",why:"COVID market crash"},
    returns:DB.returns||defReturns(),
    fundamentals:DB.fundamentals||defFund(price),
    greeks:DB.greeks||defGreeks(),
    verdict:DB.verdict||defVerdict()
  };
}

function defReturns(){
  return [
    {period:"1 Day",  val:"+1.2%",  up:true},
    {period:"1 Week", val:"+3.8%",  up:true},
    {period:"1 Month",val:"+7.4%",  up:true},
    {period:"3 Month",val:"-2.1%",  up:false},
    {period:"6 Month",val:"+12.6%", up:true},
    {period:"1 Year", val:"+24.3%", up:true},
    {period:"3 Year", val:"+86.5%", up:true},
    {period:"5 Year", val:"+142.0%",up:true}
  ];
}

function defFund(p){
  return [
    {label:"Market Cap", val:"Rs 1.2L Cr"},
    {label:"PE Ratio",   val:"24.6"},
    {label:"PB Ratio",   val:"3.8"},
    {label:"ROE",        val:"18.4%"},
    {label:"Debt/Equity",val:"0.42"},
    {label:"Div Yield",  val:"1.2%"},
    {label:"EPS",        val:"Rs "+(p/24.6).toFixed(1)},
    {label:"Book Value", val:"Rs "+(p/3.8).toFixed(0)},
    {label:"Face Value", val:"Rs 10"},
    {label:"52W High",   val:"Rs "+(p*1.18).toFixed(0)},
    {label:"52W Low",    val:"Rs "+(p*0.78).toFixed(0)},
    {label:"Volume",     val:"24.5L"}
  ];
}

function defGreeks(){
  return [
    {label:"Delta", val:"0.58", note:"Price sensitivity"},
    {label:"Gamma", val:"0.04", note:"Delta change rate"},
    {label:"Theta", val:"-2.40",note:"Time decay per day"},
    {label:"Vega",  val:"8.20", note:"Volatility impact"},
    {label:"IV",    val:"18.5%",note:"Implied volatility"}
  ];
}

function defVerdict(){
  return {
    intraday:"Momentum positive above VWAP. Good for intraday with tight stop loss.",
    delivery:"Stock in uptrend. Suitable for swing trades of 1 to 4 weeks.",
    longterm:"Strong fundamentals. Can be considered for long term SIP accumulation."
  };
}

// Known stock metadata. Add more as needed.
export var STOCK_DB = {
  RELIANCE:{name:"Reliance Industries",sector:"Energy",ipo:{date:"1977",price:10},
    ath:{val:3024.90,date:"Jul 2024",why:"Jio and retail demerger optimism"},
    atl:{val:880.00,date:"Mar 2020",why:"COVID crash and oil price collapse"}},
  TCS:{name:"Tata Consultancy",sector:"IT",ipo:{date:"Aug 2004",price:850},
    ath:{val:4254.75,date:"Sep 2024",why:"Record deal wins and buyback"},
    atl:{val:1506.00,date:"Mar 2020",why:"COVID IT selloff"}},
  HDFCBANK:{name:"HDFC Bank",sector:"Bank",ipo:{date:"1995",price:10},
    ath:{val:1880.00,date:"Jul 2023",why:"HDFC merger completion"},
    atl:{val:738.75,date:"Mar 2020",why:"Banking crisis fears"}},
  INFY:{name:"Infosys",sector:"IT",ipo:{date:"Jun 1993",price:95},
    ath:{val:1953.90,date:"Dec 2021",why:"Digital deal momentum"},
    atl:{val:509.25,date:"Mar 2020",why:"COVID crash"}},
  BAJFINANCE:{name:"Bajaj Finance",sector:"NBFC",ipo:{date:"1994",price:10},
    ath:{val:8192.00,date:"Oct 2021",why:"Strong AUM growth"},
    atl:{val:1783.00,date:"Mar 2020",why:"NBFC liquidity fears"}}
};
