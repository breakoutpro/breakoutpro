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

export default function MarketsScreen(props) {
  var stocks = props.stocks || [];
  var [search, setSearch] = useState("");
  var [sort, setSort] = useState("pct");
  var [view, setView] = useState("markets");
  var [selIdx, setSelIdx] = useState(null);
  var [activeTab, setActiveTab] = useState("stocks");

  var indices = [
    {label:"NIFTY 50",   ltp:23622.90, pct:0.00, up:true},
    {label:"SENSEX",     ltp:73863.45, pct:1.28, up:true},
    {label:"BANK NIFTY", ltp:56814.80, pct:0.00, up:true},
    {label:"MIDCAP",     ltp:17265.90, pct:0.00, up:true},
  ];

  if (selIdx) return <IndexDetail idx={selIdx} onBack={function(){setSelIdx(null);}}/>;

  var filtered = stocks.filter(function(s){
    return !search || s.sym.toLowerCase().indexOf(search.toLowerCase()) != -1;
  }).sort(function(a,b){
    return sort=="pct" ? b.chgPct-a.chgPct : b.ltp-a.ltp;
  });

  function SRow(props) {
    var s = props.s;
    var spark = genSpark(s.ltp);
    return (
      <div style={{display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderBottom:"1px solid "+BD, cursor:"pointer"}} onClick={props.onClick}>
        <div style={{flex:1}}>
          <div style={{fontSize:12, fontWeight:700, color:T1}}>{s.sym}</div>
          <div style={{fontSize:8, color:T2, marginTop:1}}>{s.sect}</div>
        </div>
        <MiniChart data={spark} color={s.up?G:R} w={50} h={22}/>
        <div style={{textAlign:"right", minWidth:80}}>
          <div style={{fontFamily:"monospace", fontSize:12, fontWeight:800, color:T1}}>Rs{s.ltp >= 1000 ? (s.ltp/1000).toFixed(1)+"K" : s.ltp.toFixed(2)}</div>
          <div style={{background:s.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)", borderRadius:5, padding:"1px 6px", fontSize:8, fontWeight:700, color:s.up?G2:R, marginTop:2}}>{s.up?"+":""}{s.chgPct.toFixed(2)}%</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:DB, minHeight:"100%", paddingBottom:80, color:T1, fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{background:CB, padding:"12px 14px", borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.05)", border:"1px solid "+BD, borderRadius:10, padding:"8px 12px", marginBottom:10}}>
          <span style={{color:T2}}>&#128269;</span>
          <input style={{flex:1, background:"none", border:"none", outline:"none", fontSize:12, color:T1, fontFamily:"inherit"}} placeholder="Search stocks..." value={search} onChange={function(e){setSearch(e.target.value);}}/>
          {search ? <button onClick={function(){setSearch("");}} style={{background:"none", border:"none", cursor:"pointer", color:T2, fontSize:12}}>X</button> : null}
        </div>
        <div style={{display:"flex", gap:6}}>
          {[["stocks","Stocks"],["indices","Indices"],["sectors","Sectors"]].map(function(t){
            var act = activeTab==t[0];
            return <button key={t[0]} onClick={function(){setActiveTab(t[0]);}} style={{background:act?G:"rgba(255,255,255,0.06)", border:"1px solid "+(act?G:BD), borderRadius:20, padding:"5px 14px", color:act?"#fff":T2, fontSize:9, fontWeight:act?700:500, cursor:"pointer", fontFamily:"inherit"}}>{t[1]}</button>;
          })}
          <div style={{flex:1}}></div>
          {activeTab=="stocks" ? [["pct","% Chg"],["ltp","Price"]].map(function(s){
            var act=sort==s[0];
            return <button key={s[0]} onClick={function(){setSort(s[0]);}} style={{background:act?"rgba(0,200,83,0.15)":"rgba(255,255,255,0.06)", border:"1px solid "+(act?G:BD), borderRadius:20, padding:"5px 12px", color:act?G:T2, fontSize:9, cursor:"pointer", fontFamily:"inherit"}}>{s[1]}</button>;
          }) : null}
        </div>
      </div>

      {activeTab=="stocks" ? (
        <div style={{background:CB, margin:"10px 14px", borderRadius:12, border:"1px solid "+BD, overflow:"hidden"}}>
          {filtered.length==0 ? <div style={{padding:24, textAlign:"center", color:T2, fontSize:12}}>No stocks found</div> :
            filtered.map(function(s){return <SRow key={s.sym} s={s} onClick={function(){}}/>;})
          }
        </div>
      ) : null}

      {activeTab=="indices" ? (
        <div style={{padding:"10px 14px"}}>
          {indices.map(function(idx){
            var spark = genSpark(idx.ltp);
            return (
              <div key={idx.label} style={{background:CB, border:"1px solid "+BD, borderRadius:14, padding:16, marginBottom:10, cursor:"pointer"}} onClick={function(){setSelIdx(idx.label);}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:11, color:T2, marginBottom:2}}>{idx.label}</div>
                    <div style={{fontSize:24, fontWeight:900, fontFamily:"monospace", color:idx.up?G2:R}}>{idx.ltp.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
                    <div style={{marginTop:4}}>
                      <span style={{background:idx.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)", color:idx.up?G2:R, borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700}}>{idx.up?"+":""}{idx.pct.toFixed(2)}%</span>
                    </div>
                  </div>
                  <MiniChart data={spark} color={idx.up?G:R} w={90} h={45}/>
                </div>
                <div style={{marginTop:8, fontSize:8, color:T2}}>Tap for details, OI, constituents</div>
              </div>
            );
          })}
        </div>
      ) : null}

      {activeTab=="sectors" ? (
        <div style={{padding:"10px 14px"}}>
          {SECTORS.map(function(s){
            var up = s.chg >= 0;
            var spark = genSpark(1000 + s.chg*10);
            return (
              <div key={s.name} style={{background:CB, border:"1px solid "+BD, borderRadius:12, padding:"12px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:12}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13, fontWeight:700, color:T1}}>{s.name}</div>
                  <div style={{fontSize:9, color:T2, marginTop:2}}>{s.stocks.slice(0,3).join(", ")}</div>
                </div>
                <MiniChart data={spark} color={up?G:R} w={60} h={28}/>
                <div style={{background:up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)", borderRadius:8, padding:"6px 12px", textAlign:"center"}}>
                  <div style={{fontSize:13, fontWeight:900, color:up?G2:R}}>{up?"+":""}{s.chg.toFixed(2)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
