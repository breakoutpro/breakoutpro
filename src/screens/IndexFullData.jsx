// BreakoutPro - IndexFullData.jsx
// Rich data for full index page (NIFTY/SENSEX/BANKNIFTY). Mock now, real later.
// Rules: no backtick, no triple-equals, ASCII only.

export function getIndexFull(key, label, ltp, up, pct){
  var price=parseFloat(String(ltp||23900).toString().replace(/,/g,""))||23900;
  var D=INDEX_FULL[key]||{};
  return {
    key:key, label:label||D.label||"NIFTY 50",
    ltp:price, up:up!=undefined?up:true, pct:pct!=undefined?pct:1.47,
    about:D.about||"Benchmark index of the Indian market.",
    summary:D.summary||"Index trading with positive bias. Broad participation across sectors.",
    levels:D.levels||defLevels(price),
    oi:D.oi||DEF_OI,
    breadth:D.breadth||DEF_BREADTH,
    vixImpact:D.vixImpact||"India VIX is low and falling, which supports a calm, trending market. Sudden VIX spikes would signal caution.",
    ath:D.ath||{val:Number((price*1.06).toFixed(2)),date:"Sep 2024",why:"Record FII inflows and strong earnings"},
    atl:D.atl||{val:Number((price*0.36).toFixed(2)),date:"Mar 2020",why:"COVID crash"},
    crashes:D.crashes||DEF_CRASHES,
    returns:D.returns||DEF_RETURNS,
    sectors:D.sectors||DEF_SECTORS,
    flowImpact:D.flowImpact||DEF_FLOW,
    ai:D.ai||DEF_AI,
    news:D.news||DEF_NEWS
  };
}

function defLevels(p){
  return {
    r3:Number((p*1.018).toFixed(0)), r2:Number((p*1.012).toFixed(0)), r1:Number((p*1.006).toFixed(0)),
    pivot:Number(p.toFixed(0)),
    s1:Number((p*0.994).toFixed(0)), s2:Number((p*0.988).toFixed(0)), s3:Number((p*0.982).toFixed(0))
  };
}
var DEF_OI={
  pcr:"1.18", maxPain:"23,900", callWall:"24,000", putWall:"23,800",
  note:"Highest Call OI at 24,000 acts as resistance. Highest Put OI at 23,800 acts as support."
};
var DEF_BREADTH={ adv:1340, dec:780, unch:120, note:"Advances leading declines. Healthy market breadth." };
var DEF_CRASHES=[
  {event:"COVID Crash 2020", fall:"-38%", recovery:"8 months"},
  {event:"2022 Rate Hikes", fall:"-18%", recovery:"7 months"},
  {event:"2024 Election Day", fall:"-8.5%", recovery:"3 days"}
];
var DEF_RETURNS=[
  {period:"1 Month", val:"+3.2%",  up:true},
  {period:"3 Month", val:"+6.8%",  up:true},
  {period:"6 Month", val:"+9.4%",  up:true},
  {period:"1 Year",  val:"+18.6%", up:true},
  {period:"3 Year",  val:"+52.3%", up:true},
  {period:"5 Year",  val:"+118.0%",up:true}
];
var DEF_SECTORS=[
  {name:"Banking", chg:"+1.8%", up:true},
  {name:"IT",      chg:"-0.6%", up:false},
  {name:"Auto",    chg:"+2.1%", up:true},
  {name:"Pharma",  chg:"+0.4%", up:true},
  {name:"Metal",   chg:"-0.9%", up:false},
  {name:"FMCG",    chg:"+0.3%", up:true}
];
var DEF_FLOW={
  note:"FII net buyers today, supporting the index. DII slightly net sellers, booking profits.",
  fii:"+2,340 Cr", fiiUp:true, dii:"-890 Cr", diiUp:false
};
var DEF_AI={
  bias:"Bullish", conf:72,
  view:"Trend and breadth favor upside. Sustaining above pivot keeps momentum positive. A close below S2 would weaken the setup."
};
var DEF_NEWS=[
  {time:"08:30", text:"GIFT Nifty signals gap-up opening"},
  {time:"Yesterday", text:"FII net buyers Rs 3,245 Cr - bullish signal"},
  {time:"2 days ago", text:"US markets closed higher, global cues positive"}
];

export var INDEX_FULL = {
  NIFTY:{ label:"NIFTY 50",
    about:"NIFTY 50 is NSE's benchmark of India's 50 largest companies across 13 sectors. The most tracked indicator of the Indian market.",
    ath:{val:26277.35,date:"Sep 2024",why:"Record FII inflows, strong GDP and earnings"},
    atl:{val:7511.10,date:"Mar 2020",why:"COVID-19 pandemic crash"}},
  SENSEX:{ label:"SENSEX",
    about:"SENSEX is BSE's benchmark of 30 large, financially sound companies. India's oldest index, started in 1986.",
    ath:{val:85978.25,date:"Sep 2024",why:"Bull run on strong domestic flows"},
    atl:{val:25638.00,date:"Mar 2020",why:"COVID-19 pandemic crash"}},
  BANKNIFTY:{ label:"BANK NIFTY",
    about:"BANK NIFTY tracks the 12 most liquid large banking stocks on NSE. The most actively traded index for options.",
    ath:{val:54467.35,date:"Sep 2024",why:"Strong credit growth and asset quality"},
    atl:{val:16116.25,date:"Mar 2020",why:"COVID banking selloff"}}
};
