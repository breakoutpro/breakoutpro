// BreakoutPro - StockFullData.jsx
// Complete A-to-Z stock data (mock now, real via Angel One later).
// Rules: no backtick, no triple-equals, ASCII only.

export function getStockFull(sym, ltp, up){
  var price=parseFloat(String(ltp||"1000").replace(/,/g,""))||1000;
  var D=STOCK_DB[sym]||{};
  return {
    sym:sym,
    name:D.name||sym,
    sector:D.sector||"Equity",
    ltp:price,
    up:up,
    about:D.about||("A listed Indian company in the "+(D.sector||"equity")+" space. Detailed profile will expand with live data."),
    products:D.products||["Core business operations","Multiple revenue segments"],
    competitors:D.competitors||["Peer 1","Peer 2","Peer 3"],
    promoters:D.promoters||"Promoter group holds significant stake.",
    growth:D.growth||["Sector tailwinds","Capacity expansion","New product lines"],
    ipo:D.ipo||{date:"Not available",price:0},
    ath:D.ath||{val:Number((price*1.45).toFixed(2)),date:"Dec 2024",why:"Strong earnings and FII buying"},
    atl:D.atl||{val:Number((price*0.42).toFixed(2)),date:"Mar 2020",why:"COVID market crash"},
    crashes:D.crashes||DEF_CRASHES,
    returns:D.returns||defReturns(),
    fundamentals:D.fundamentals||defFund(price),
    shareholding:D.shareholding||DEF_SHARE,
    results:D.results||DEF_RESULTS,
    newsReaction:D.newsReaction||DEF_NEWS,
    technical:D.technical||defTech(price),
    options:D.options||DEF_OPTIONS,
    delivery:D.delivery||DEF_DELIVERY,
    ai:D.ai||DEF_AI,
    scores:D.scores||DEF_SCORES,
    strengths:D.strengths||["Healthy return ratios","Consistent revenue growth","Low leverage"],
    risks:D.risks||["Valuation above historical average","Sector cyclicality"],
    opinion:D.opinion||DEF_OPINION
  };
}

function defReturns(){
  return [
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
    {label:"P/E Ratio",  val:"24.6"},
    {label:"P/B Ratio",  val:"3.8"},
    {label:"ROE",        val:"18.4%"},
    {label:"ROCE",       val:"21.2%"},
    {label:"Debt/Equity",val:"0.42"},
    {label:"EPS",        val:"Rs "+(p/24.6).toFixed(1)},
    {label:"Book Value", val:"Rs "+(p/3.8).toFixed(0)},
    {label:"Div Yield",  val:"1.2%"},
    {label:"Revenue",    val:"Rs 48,200 Cr"},
    {label:"Net Profit", val:"Rs 9,400 Cr"},
    {label:"Promoter Hold",val:"54.3%"}
  ];
}
function defTech(p){
  return {
    trend:"Uptrend",
    r2:Number((p*1.04).toFixed(0)), r1:Number((p*1.02).toFixed(0)),
    pivot:Number(p.toFixed(0)),
    s1:Number((p*0.98).toFixed(0)), s2:Number((p*0.96).toFixed(0)),
    ema20:Number((p*0.99).toFixed(0)), ema50:Number((p*0.96).toFixed(0)),
    vwap:Number((p*1.005).toFixed(0)),
    rsi:"62 (Neutral-Bullish)", macd:"Bullish crossover"
  };
}

var DEF_CRASHES=[
  {event:"COVID Crash 2020", fall:"-38%", recovery:"8 months"},
  {event:"2022 Rate Hike", fall:"-22%", recovery:"6 months"},
  {event:"2024 Correction", fall:"-14%", recovery:"3 months"}
];
var DEF_SHARE=[
  {label:"Promoters", val:54.3},
  {label:"FII",       val:21.6},
  {label:"DII",       val:14.2},
  {label:"Public",    val:9.9}
];
var DEF_RESULTS=[
  {q:"Q3 FY25", rev:"12,400", pat:"2,380", yoy:"+18%", qoq:"+6%", up:true},
  {q:"Q2 FY25", rev:"11,700", pat:"2,240", yoy:"+15%", qoq:"+4%", up:true},
  {q:"Q1 FY25", rev:"11,250", pat:"2,150", yoy:"+12%", qoq:"+3%", up:true},
  {q:"Q4 FY24", rev:"10,900", pat:"2,080", yoy:"+9%",  qoq:"-2%", up:false}
];
var DEF_NEWS=[
  {event:"Q3 Results beat", reaction:"+5.2%", up:true},
  {event:"Order win announced", reaction:"+3.1%", up:true},
  {event:"Margin pressure news", reaction:"-2.8%", up:false}
];
var DEF_OPTIONS={
  pcr:"1.18", maxPain:"Auto", callWall:"Above spot", putWall:"Below spot",
  iv:"18.5%", oiTrend:"Long buildup",
  signals:[
    {label:"Gamma Blast", note:"Possible if spot crosses call wall fast"},
    {label:"IV Crush", note:"Likely post-results when IV drops"},
    {label:"Writers Trap", note:"If shorts get squeezed above resistance"}
  ]
};
var DEF_DELIVERY={
  delPct:"58.4%", volume:"24.5L", avgVol:"18.2L",
  phase:"Accumulation", note:"High delivery with rising price suggests genuine buying."
};
var DEF_AI={ bull:62, bear:23, side:15 };
var DEF_SCORES=[
  {label:"Intraday", stars:4},
  {label:"Swing Trading", stars:4},
  {label:"Long Term", stars:5},
  {label:"Option Buying", stars:3},
  {label:"Option Selling", stars:4}
];
var DEF_OPINION={ longterm:"Moderate", swing:"High", intraday:"Trending" };

export var STOCK_DB = {
  RELIANCE:{name:"Reliance Industries",sector:"Energy",
    about:"India's largest private company spanning energy, petrochemicals, retail and digital (Jio).",
    products:["Oil to Chemicals","Jio Telecom","Reliance Retail","New Energy"],
    competitors:["ONGC","Bharti Airtel","DMart"],
    ipo:{date:"1977",price:10},
    ath:{val:3024.90,date:"Jul 2024",why:"Jio and retail value unlocking optimism"},
    atl:{val:880.00,date:"Mar 2020",why:"COVID crash and oil price collapse"}},
  TCS:{name:"Tata Consultancy",sector:"IT",
    about:"India's largest IT services and consulting company, part of the Tata Group.",
    products:["IT Services","Consulting","Digital Transformation","BPS"],
    competitors:["Infosys","Wipro","HCL Tech"],
    ipo:{date:"Aug 2004",price:850},
    ath:{val:4254.75,date:"Sep 2024",why:"Record deal wins and buyback"},
    atl:{val:1506.00,date:"Mar 2020",why:"COVID IT selloff"}},
  HDFCBANK:{name:"HDFC Bank",sector:"Bank",
    about:"India's largest private sector bank by assets, known for retail lending strength.",
    products:["Retail Banking","Corporate Banking","Loans","Credit Cards"],
    competitors:["ICICI Bank","SBI","Axis Bank"],
    ipo:{date:"1995",price:10},
    ath:{val:1880.00,date:"Jul 2023",why:"HDFC merger completion"},
    atl:{val:738.75,date:"Mar 2020",why:"Banking crisis fears"}},
  INFY:{name:"Infosys",sector:"IT",
    about:"Global leader in next-generation digital services and consulting.",
    products:["IT Services","Cloud","AI Services","Consulting"],
    competitors:["TCS","Wipro","Accenture"],
    ipo:{date:"Jun 1993",price:95},
    ath:{val:1953.90,date:"Dec 2021",why:"Digital deal momentum"},
    atl:{val:509.25,date:"Mar 2020",why:"COVID crash"}}
};
