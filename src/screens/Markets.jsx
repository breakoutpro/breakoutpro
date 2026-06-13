import React, { useState, useEffect } from "react";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var GOLD = "#F59E0B";
var BLUE = "#1E90FF";
var T1 = "#FFFFFF";
var T2 = "#8899BB";
var R = "#EF4444";

var INDICES_DATA = {
  "NIFTY 50": {
    sym: "NIFTY 50", ltp: 23622.90, chg: 0.00, up: true,
    open: 23580, high: 23680, low: 23540, prev: 23622.90,
    pe: 22.4, pb: 3.8, mcap: "Rs 2.4 Cr Cr",
    desc: "Benchmark index of 50 largest companies on NSE",
    topStocks: ["RELIANCE","TCS","HDFCBANK","ICICIBANK","INFY"],
  },
  "SENSEX": {
    sym: "SENSEX", ltp: 73863.45, chg: 1.28, up: true,
    open: 73500, high: 74100, low: 73400, prev: 72931,
    pe: 24.1, pb: 4.2, mcap: "Rs 3.1 Cr Cr",
    desc: "Benchmark index of 30 largest companies on BSE",
    topStocks: ["RELIANCE","TCS","HDFCBANK","ICICIBANK","INFY"],
  },
  "BANK NIFTY": {
    sym: "BANK NIFTY", ltp: 56814.80, chg: 0.00, up: true,
    open: 56700, high: 57100, low: 56500, prev: 56814.80,
    pe: 18.2, pb: 2.9, mcap: "Rs 1.8 Cr Cr",
    desc: "Index of most liquid banking stocks on NSE",
    topStocks: ["HDFCBANK","ICICIBANK","SBIN","AXISBANK","KOTAK"],
  },
  "MIDCAP": {
    sym: "MIDCAP", ltp: 17265.90, chg: 0.00, up: true,
    open: 17200, high: 17400, low: 17150, prev: 17265.90,
    pe: 28.5, pb: 4.5, mcap: "Rs 0.9 Cr Cr",
    desc: "Index tracking mid-cap companies performance",
    topStocks: ["VOLTAS","MFSL","PERSISTENT","LTTS","SONACOMS"],
  },
};

var SECTORS = [
  {name:"IT",     chg:1.82, stocks:["TCS","INFY","WIPRO","HCL"]},
  {name:"Bank",   chg:1.24, stocks:["HDFC","ICICI","SBIN","AXIS"]},
  {name:"Auto",   chg:0.94, stocks:["MARUTI","TATAMOTO","M&M"]},
  {name:"Pharma", chg:-0.32,stocks:["SUNPHARMA","DRREDDY","CIPLA"]},
  {name:"Energy", chg:1.35, stocks:["RELIANCE","ONGC","NTPC"]},
  {name:"Metal",  chg:3.24, stocks:["TATASTEEL","HINDALCO","JSWSTEEL"]},
  {name:"FMCG",   chg:0.18, stocks:["ITC","HUL","NESTLEIND"]},
  {name:"Realty", chg:2.10, stocks:["DLF","GODREJPROP","OBEROIRLTY"]},
  {name:"Infra",  chg:0.76, stocks:["LT","ADANIPORTS","SIEMENS"]},
];

function MiniChart(props) {
  var data = props.data;
  var color = props.color || G;
  var w = props.w || 80;
  var h = props.h || 30;
  if (!data || data.length < 2) return null;
  var min = Math.min.apply(null, data);
  var max = Math.max.apply(null, data);
  var range = max - min || 1;
  var pts = data.map(function(v, i) {
    return (i/(data.length-1))*w + "," + (h - ((v-min)/range)*(h-4) + 2);
  }).join(" ");
  var fillPts = pts + " " + w + "," + h + " 0," + h;
  return (
    <svg width={w} height={h} style={{display:"block"}}>
      <defs>
        <linearGradient id={"grad"+w} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={"url(#grad"+w+")"}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function genSpark(base) {
  var arr = [];
  var p = base;
  for (var i = 0; i < 20; i++) {
    p = p + (Math.random()-0.48)*base*0.003;
    arr.push(p);
  }
  return arr;
}

function IndexDetail(props) {
  var idx = props.idx;
  var d = INDICES_DATA[idx] || INDICES_DATA["NIFTY 50"];
  var spark = genSpark(d.ltp);
  var chgAmt = parseFloat((d.ltp * d.chg / 100).toFixed(2));

  return (
    <div style={{background:DB, minHeight:"100vh", color:T1, fontFamily:"Inter,Arial,sans-serif", paddingBottom:20}}>
      <div style={{background:CB, padding:"12px 16px", borderBottom:"1px solid "+BD, display:"flex", alignItems:"center", gap:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:16, color:T1}}>&#8592;</button>
        <div>
          <div style={{fontSize:16, fontWeight:900, color:T1}}>{d.sym}</div>
          <div style={{fontSize:8, color:T2}}>{d.desc}</div>
        </div>
      </div>

      <div style={{padding:"16px 16px 0"}}>
        <div style={{background:CB, border:"1px solid "+BD, borderRadius:16, padding:16, marginBottom:14}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12}}>
            <div>
              <div style={{fontSize:32, fontWeight:900, fontFamily:"monospace", color:d.up?G2:R}}>{d.ltp.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
              <div style={{display:"flex", alignItems:"center", gap:6, marginTop:4}}>
                <span style={{background:d.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)", color:d.up?G2:R, borderRadius:6, padding:"2px 10px", fontSize:11, fontWeight:700}}>{d.up?"+":""}{chgAmt} ({d.up?"+":""}{d.chg.toFixed(2)}%)</span>
              </div>
            </div>
            <MiniChart data={spark} color={d.up?G:R} w={100} h={50}/>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8}}>
            {[["Open",d.open],["High",d.high],["Low",d.low],["Prev",d.prev]].map(function(r){
              return (
                <div key={r[0]} style={{background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"8px 6px", textAlign:"center"}}>
                  <div style={{fontSize:7, color:T2, marginBottom:2}}>{r[0]}</div>
                  <div style={{fontSize:11, fontWeight:700, color:T1, fontFamily:"monospace"}}>{r[1].toLocaleString("en-IN")}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14}}>
          {[["P/E Ratio",d.pe,""],["P/B Ratio",d.pb,""],["Market Cap",d.mcap,""]].map(function(r){
            return (
              <div key={r[0]} style={{background:CB, border:"1px solid "+BD, borderRadius:12, padding:12, textAlign:"center"}}>
                <div style={{fontSize:7, color:T2, marginBottom:4}}>{r[0]}</div>
                <div style={{fontSize:12, fontWeight:800, color:G}}>{r[1]}</div>
              </div>
            );
          })}
        </div>

        <div style={{background:CB, border:"1px solid "+BD, borderRadius:14, padding:14, marginBottom:14}}>
          <div style={{fontSize:11, fontWeight:700, color:T1, marginBottom:10}}>Top Constituents</div>
          {d.topStocks.map(function(s, i) {
            var chg = (Math.random()-0.4)*3;
            var up = chg >= 0;
            return (
              <div key={s} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom: i < d.topStocks.length-1 ? "1px solid "+BD : "none"}}>
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  <div style={{width:28, height:28, borderRadius:8, background:"rgba(30,144,255,0.15)", border:"1px solid rgba(30,144,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:700, color:BLUE}}>{i+1}</div>
                  <span style={{fontSize:12, fontWeight:600, color:T1}}>{s}</span>
                </div>
                <span style={{fontSize:11, fontWeight:700, color:up?G:R}}>{up?"+":""}{chg.toFixed(2)}%</span>
              </div>
            );
          })}
        </div>

        <div style={{background:"#0F0800", border:"1px solid #2A1E00", borderRadius:10, padding:10}}>
          <div style={{fontSize:8, color:"#92694A", lineHeight:1.7}}>Educational only. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}


function StockDetail(props) {
  var s = props.stock;
  var bull = s.up;
  var spark = genSpark(s.ltp);
  var details = {
    RELIANCE:{pe:28.4,pb:2.1,mcap:"19.2L Cr",high52:"3024",low52:"2220"},
    TCS:{pe:31.2,pb:13.4,mcap:"13.2L Cr",high52:"4592",low52:"3056"},
    HDFCBANK:{pe:19.8,pb:2.8,mcap:"13.1L Cr",high52:"1880",low52:"1363"},
    ICICIBANK:{pe:18.4,pb:3.2,mcap:"9.1L Cr",high52:"1362",low52:"972"},
    INFY:{pe:24.6,pb:7.8,mcap:"6.5L Cr",high52:"1974",low52:"1307"},
    WIPRO:{pe:22.1,pb:4.2,mcap:"2.5L Cr",high52:"571",low52:"378"},
    TATAMOTORS:{pe:8.2,pb:3.1,mcap:"3.5L Cr",high52:"1179",low52:"724"},
    SBIN:{pe:11.2,pb:1.8,mcap:"7.2L Cr",high52:"912",low52:"543"},
    AXISBANK:{pe:14.8,pb:2.4,mcap:"3.6L Cr",high52:"1340",low52:"882"},
    BAJFINANCE:{pe:32.4,pb:6.8,mcap:"4.5L Cr",high52:"7830",low52:"5924"},
    MARUTI:{pe:26.1,pb:4.8,mcap:"4.0L Cr",high52:"13680",low52:"9832"},
  };
  var d = details[s.sym] || {pe:"N/A",pb:"N/A",mcap:"N/A",high52:"N/A",low52:"N/A"};
  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:20,animation:"slideIn 0.15s ease-out"}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{s.sym}</div>
          <div style={{fontSize:9,color:T2}}>{s.name || s.sym} - {s.sect}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:18,fontWeight:900,fontFamily:"monospace",color:bull?G2:R}}>Rs{s.ltp>=1000?(s.ltp/1000).toFixed(2)+"K":s.ltp.toFixed(2)}</div>
          <div style={{fontSize:10,fontWeight:700,color:bull?G2:R}}>{bull?"+":""}{s.chgPct.toFixed(2)}%</div>
        </div>
      </div>
      <div style={{padding:14}}>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:12}}>
          <MiniChart data={spark} color={bull?G:R} w={340} h={80}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          {[["52W High","Rs"+d.high52],["52W Low","Rs"+d.low52],["Market Cap",d.mcap],["P/E Ratio",d.pe],["P/B Ratio",d.pb],["Sector",s.sect]].map(function(r){
            return (
              <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:7,color:T2,marginBottom:3}}>{r[0]}</div>
                <div style={{fontSize:11,fontWeight:700,color:T1}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:14,marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:8}}>Price Analysis</div>
          <div style={{background:bull?"rgba(0,200,83,0.08)":"rgba(239,68,68,0.08)",border:"1px solid "+(bull?"rgba(0,200,83,0.2)":"rgba(239,68,68,0.2)"),borderRadius:10,padding:12}}>
            <div style={{fontSize:11,color:bull?G2:R,fontWeight:700,marginBottom:4}}>{bull?"Bullish":"Bearish"} - {Math.abs(s.chgPct).toFixed(2)}% change</div>
            <div style={{fontSize:10,color:T2,lineHeight:1.7}}>{bull?"Price showing positive momentum. Watch for continuation above current levels with volume confirmation.":"Price showing negative pressure. Watch for support levels and potential reversal signals."}</div>
          </div>
        </div>
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:"#F97316",lineHeight:1.6}}>Educational only. Not SEBI registered. Not investment advice. Do your own research.</div>
        </div>
      </div>
    </div>
  );
}


function SectorDetail(props) {
  var s = props.sector;
  var up = s.chg >= 0;
  var spark = genSpark(22000 + s.chg * 100);

  var sectorStocks = {
    IT:     [{sym:"TCS",ltp:3654,chgPct:0.97,up:false},{sym:"INFY",ltp:1567,chgPct:1.40,up:false},{sym:"WIPRO",ltp:478,chgPct:2.99,up:true},{sym:"HCL",ltp:1876,chgPct:1.82,up:true}],
    Bank:   [{sym:"HDFCBANK",ltp:1742,chgPct:1.90,up:true},{sym:"ICICIBANK",ltp:1289,chgPct:2.33,up:true},{sym:"SBIN",ltp:812,chgPct:2.18,up:true},{sym:"AXISBANK",ltp:1156,chgPct:1.47,up:true}],
    Auto:   [{sym:"MARUTI",ltp:13240,chgPct:1.07,up:true},{sym:"TATAMOTORS",ltp:945,chgPct:2.23,up:true},{sym:"BAJAJ-AUTO",ltp:8934,chgPct:0.84,up:true},{sym:"HEROMOTOCO",ltp:4123,chgPct:0.62,up:true}],
    Pharma: [{sym:"SUNPHARMA",ltp:1678,chgPct:0.98,up:false},{sym:"DRREDDY",ltp:5432,chgPct:0.45,up:false},{sym:"CIPLA",ltp:1543,chgPct:0.12,up:false},{sym:"DIVISLAB",ltp:4321,chgPct:0.78,up:true}],
    Energy: [{sym:"RELIANCE",ltp:2845,chgPct:1.71,up:true},{sym:"ONGC",ltp:287,chgPct:1.23,up:true},{sym:"NTPC",ltp:398,chgPct:0.94,up:true},{sym:"POWERGRID",ltp:334,chgPct:0.67,up:true}],
    Metal:  [{sym:"TATASTEEL",ltp:165,chgPct:3.24,up:true},{sym:"HINDALCO",ltp:678,chgPct:2.87,up:true},{sym:"JSWSTEEL",ltp:934,chgPct:2.54,up:true},{sym:"SAIL",ltp:134,chgPct:1.98,up:true}],
    FMCG:   [{sym:"ITC",ltp:467,chgPct:0.34,up:true},{sym:"HUL",ltp:2345,chgPct:0.18,up:true},{sym:"NESTLEIND",ltp:2456,chgPct:0.45,up:false},{sym:"BRITANNIA",ltp:5678,chgPct:0.23,up:false}],
    Realty: [{sym:"DLF",ltp:876,chgPct:2.10,up:true},{sym:"GODREJPROP",ltp:2345,chgPct:1.87,up:true},{sym:"OBEROIRLTY",ltp:1876,chgPct:1.65,up:true},{sym:"PRESTIGE",ltp:1543,chgPct:1.43,up:true}],
    Infra:  [{sym:"LT",ltp:3456,chgPct:0.76,up:true},{sym:"ADANIPORTS",ltp:1234,chgPct:0.54,up:true},{sym:"SIEMENS",ltp:6789,chgPct:0.98,up:true},{sym:"ABB",ltp:7654,chgPct:0.87,up:true}],
  };

  var stocks = sectorStocks[s.name] || [];

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:20,animation:"slideIn 0.15s ease-out"}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{s.name} Sector</div>
          <div style={{fontSize:9,color:T2}}>{stocks.length} stocks</div>
        </div>
        <div style={{background:up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",borderRadius:8,padding:"6px 12px"}}>
          <div style={{fontSize:14,fontWeight:900,color:up?G2:R}}>{up?"+":""}{s.chg.toFixed(2)}%</div>
        </div>
      </div>

      <div style={{padding:14}}>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:10,color:T2,marginBottom:6}}>Sector Performance</div>
          <MiniChart data={spark} color={up?G:R} w={340} h={60}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
            {[["Today",(up?"+":"")+s.chg.toFixed(2)+"%",up?G2:R],["Trend",up?"Bullish":"Bearish",up?G2:R],["Stocks",stocks.length+" active","#8899BB"]].map(function(r){
              return (
                <div key={r[0]} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"8px",textAlign:"center"}}>
                  <div style={{fontSize:7,color:T2,marginBottom:2}}>{r[0]}</div>
                  <div style={{fontSize:11,fontWeight:700,color:r[2]}}>{r[1]}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:10}}>Top Stocks</div>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
          {stocks.map(function(st){
            var sp = genSpark(st.ltp);
            return (
              <div key={st.sym} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:"1px solid "+BD}}>
                <div style={{width:36,height:36,borderRadius:10,background:"rgba(30,144,255,0.1)",border:"1px solid rgba(30,144,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:7,fontWeight:800,color:"#1E90FF"}}>{st.sym.slice(0,3)}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{st.sym}</div>
                </div>
                <MiniChart data={sp} color={st.up?G:R} w={44} h={20}/>
                <div style={{textAlign:"right",minWidth:76}}>
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:T1}}>Rs{st.ltp>=1000?(st.ltp/1000).toFixed(1)+"K":st.ltp}</div>
                  <div style={{background:st.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",borderRadius:4,padding:"1px 6px",fontSize:8,fontWeight:700,color:st.up?G2:R}}>{st.up?"+":""}{st.chgPct.toFixed(2)}%</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10,marginTop:12}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

export default function MarketsScreen(props) {
  var DEMO_STOCKS = [
    {sym:"RELIANCE", name:"Reliance Industries", ltp:2845.60, chgPct:1.71, up:true,  sect:"Energy"},
    {sym:"TCS",      name:"Tata Consultancy",    ltp:3654.20, chgPct:0.97, up:false, sect:"IT"},
    {sym:"HDFCBANK", name:"HDFC Bank",           ltp:1742.50, chgPct:1.90, up:true,  sect:"Bank"},
    {sym:"ICICIBANK",name:"ICICI Bank",          ltp:1289.30, chgPct:2.33, up:true,  sect:"Bank"},
    {sym:"INFY",     name:"Infosys",             ltp:1567.80, chgPct:1.40, up:false, sect:"IT"},
    {sym:"WIPRO",    name:"Wipro",               ltp:478.90,  chgPct:2.99, up:true,  sect:"IT"},
    {sym:"TATAMOTORS",name:"Tata Motors",        ltp:945.60,  chgPct:2.23, up:true,  sect:"Auto"},
    {sym:"SBIN",     name:"State Bank India",    ltp:812.30,  chgPct:2.18, up:true,  sect:"Bank"},
    {sym:"AXISBANK", name:"Axis Bank",           ltp:1156.70, chgPct:1.47, up:true,  sect:"Bank"},
    {sym:"BAJFINANCE",name:"Bajaj Finance",      ltp:7234.50, chgPct:1.90, up:true,  sect:"NBFC"},
    {sym:"MARUTI",   name:"Maruti Suzuki",       ltp:13240,   chgPct:1.07, up:true,  sect:"Auto"},
    {sym:"SUNPHARMA",name:"Sun Pharma",          ltp:1678.40, chgPct:0.98, up:false, sect:"Pharma"},
  ];
  var stocks = (props.stocks && props.stocks.length > 0) ? props.stocks : DEMO_STOCKS;
  var [search, setSearch] = useState("");
  var [sort, setSort] = useState("pct");
  var [view, setView] = useState("markets");
  var [selIdx, setSelIdx] = useState(null);
  var [activeTab, setActiveTab] = useState("stocks");
  var [selStock, setSelStock] = useState(null);
  var [selSector, setSelSector] = useState(null);

  // Inject animation CSS once
  useEffect(function(){
    if(!document.getElementById("mkt-css")){
      var el=document.createElement("style");
      el.id="mkt-css";
      el.textContent="@keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}";
      document.head.appendChild(el);
    }
  },[]);

  if(selStock) return <StockDetail stock={selStock} onBack={function(){setSelStock(null);}}/>;
  if(selSector) return <SectorDetail sector={selSector} onBack={function(){setSelSector(null);}}/>;

  var indices = [
    {label:"NIFTY 50",   ltp:23622.90, pct:0.00, up:true},
    {label:"SENSEX",     ltp:73863.45, pct:1.28, up:true},
    {label:"BANK NIFTY", ltp:56814.80, pct:0.00, up:true},
    {label:"MIDCAP",     ltp:17265.90, pct:0.00, up:true},
  ];

  if (selIdx) return <IndexDetail idx={se
