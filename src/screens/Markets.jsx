import { useState, useEffect } from "react";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

var DEMO_STOCKS = [
  {sym:"RELIANCE", name:"Reliance Industries",ltp:2845.60,chgPct:1.71,up:true, sect:"Energy"},
  {sym:"TCS",      name:"Tata Consultancy",   ltp:3654.20,chgPct:0.97,up:false,sect:"IT"},
  {sym:"HDFCBANK", name:"HDFC Bank",          ltp:1742.50,chgPct:1.90,up:true, sect:"Bank"},
  {sym:"ICICIBANK",name:"ICICI Bank",         ltp:1289.30,chgPct:2.33,up:true, sect:"Bank"},
  {sym:"INFY",     name:"Infosys",            ltp:1567.80,chgPct:1.40,up:false,sect:"IT"},
  {sym:"WIPRO",    name:"Wipro",              ltp:478.90, chgPct:2.99,up:true, sect:"IT"},
  {sym:"TATAMOTORS",name:"Tata Motors",       ltp:945.60, chgPct:2.23,up:true, sect:"Auto"},
  {sym:"SBIN",     name:"State Bank India",   ltp:812.30, chgPct:2.18,up:true, sect:"Bank"},
  {sym:"AXISBANK", name:"Axis Bank",          ltp:1156.70,chgPct:1.47,up:true, sect:"Bank"},
  {sym:"BAJFINANCE",name:"Bajaj Finance",     ltp:7234.50,chgPct:1.90,up:true, sect:"NBFC"},
  {sym:"MARUTI",   name:"Maruti Suzuki",      ltp:13240,  chgPct:1.07,up:true, sect:"Auto"},
  {sym:"SUNPHARMA",name:"Sun Pharma",         ltp:1678.40,chgPct:0.98,up:false,sect:"Pharma"},
];

var SECTORS = [
  {name:"IT",    chg:1.82,stocks:["TCS","INFY","WIPRO","HCL"]},
  {name:"Bank",  chg:1.24,stocks:["HDFCBANK","ICICIBANK","SBIN","AXISBANK"]},
  {name:"Auto",  chg:0.94,stocks:["MARUTI","TATAMOTORS","M&M","BAJAJ-AUTO"]},
  {name:"Pharma",chg:-0.32,stocks:["SUNPHARMA","DRREDDY","CIPLA","DIVISLAB"]},
  {name:"Energy",chg:1.35,stocks:["RELIANCE","ONGC","NTPC","POWERGRID"]},
  {name:"Metal", chg:3.24,stocks:["TATASTEEL","HINDALCO","JSWSTEEL","SAIL"]},
  {name:"FMCG",  chg:0.18,stocks:["ITC","HUL","NESTLEIND","BRITANNIA"]},
  {name:"Realty",chg:2.10,stocks:["DLF","GODREJPROP","OBEROIRLTY","PRESTIGE"]},
  {name:"Infra", chg:0.76,stocks:["LT","ADANIPORTS","SIEMENS","ABB"]},
];

var INDICES = [
  {label:"NIFTY 50",   ltp:23622.90,pct:0.00,up:true},
  {label:"SENSEX",     ltp:73863.45,pct:1.28,up:true},
  {label:"BANK NIFTY", ltp:56814.80,pct:0.00,up:true},
  {label:"MIDCAP",     ltp:17265.90,pct:0.00,up:true},
];

var STOCK_META = {
  RELIANCE: {pe:28.4,pb:2.1,mcap:"19.2L Cr",high52:"3024",low52:"2220"},
  TCS:      {pe:31.2,pb:13.4,mcap:"13.2L Cr",high52:"4592",low52:"3056"},
  HDFCBANK: {pe:19.8,pb:2.8,mcap:"13.1L Cr",high52:"1880",low52:"1363"},
  ICICIBANK:{pe:18.4,pb:3.2,mcap:"9.1L Cr",high52:"1362",low52:"972"},
  INFY:     {pe:24.6,pb:7.8,mcap:"6.5L Cr",high52:"1974",low52:"1307"},
  WIPRO:    {pe:22.1,pb:4.2,mcap:"2.5L Cr",high52:"571",low52:"378"},
  TATAMOTORS:{pe:8.2,pb:3.1,mcap:"3.5L Cr",high52:"1179",low52:"724"},
  SBIN:     {pe:11.2,pb:1.8,mcap:"7.2L Cr",high52:"912",low52:"543"},
  AXISBANK: {pe:14.8,pb:2.4,mcap:"3.6L Cr",high52:"1340",low52:"882"},
  BAJFINANCE:{pe:32.4,pb:6.8,mcap:"4.5L Cr",high52:"7830",low52:"5924"},
  MARUTI:   {pe:26.1,pb:4.8,mcap:"4.0L Cr",high52:"13680",low52:"9832"},
  SUNPHARMA:{pe:34.2,pb:5.6,mcap:"4.0L Cr",high52:"1960",low52:"1179"},
};

function genSpark(base) {
  var a=[]; var p=base;
  for(var i=0;i<14;i++){p=p+(Math.random()-0.48)*base*0.004;a.push(p);}
  return a;
}

function MiniChart(props) {
  var data=props.data; var color=props.color||G; var w=props.w||60; var h=props.h||28;
  if(!data||data.length<2) return null;
  var min=Math.min.apply(null,data),max=Math.max.apply(null,data),range=max-min||1;
  var pts=data.map(function(v,i){return (i/(data.length-1))*w+","+(h-((v-min)/range)*(h-4)+2);}).join(" ");
  return (
    <svg width={w} height={h} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function BackBtn(props) {
  return (
    <button onClick={props.onClick} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1,flexShrink:0}}>&#8592;</button>
  );
}

function StockRow(props) {
  var s=props.s; var spark=genSpark(s.ltp);
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:"1px solid "+BD,cursor:"pointer"}} onClick={props.onClick}>
      <div style={{width:36,height:36,borderRadius:10,background:"rgba(30,144,255,0.1)",border:"1px solid rgba(30,144,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:7,fontWeight:800,color:"#1E90FF"}}>{s.sym.slice(0,3)}</span>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
        <div style={{fontSize:8,color:T2,marginTop:1}}>{s.sect}</div>
      </div>
      <MiniChart data={spark} color={s.up?G:R} w={44} h={20}/>
      <div style={{textAlign:"right",minWidth:76}}>
        <div style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:T1}}>Rs{s.ltp>=1000?(s.ltp/1000).toFixed(1)+"K":s.ltp.toFixed(2)}</div>
        <div style={{background:s.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",borderRadius:5,padding:"1px 6px",fontSize:8,fontWeight:700,color:s.up?G2:R,marginTop:2}}>{s.up?"+":""}{s.chgPct.toFixed(2)}%</div>
      </div>
      <span style={{color:"#4A5A7A",fontSize:14}}>&#8250;</span>
    </div>
  );
}

function StockDetail(props) {
  var s=props.s;
  var d=STOCK_META[s.sym]||{pe:"N/A",pb:"N/A",mcap:"N/A",high52:"N/A",low52:"N/A"};
  var spark=genSpark(s.ltp);
  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:20}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <BackBtn onClick={props.onBack}/>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{s.sym}</div>
          <div style={{fontSize:9,color:T2}}>{s.name} - {s.sect}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:18,fontWeight:900,fontFamily:"monospace",color:s.up?G2:R}}>Rs{s.ltp>=1000?(s.ltp/1000).toFixed(2)+"K":s.ltp.toFixed(2)}</div>
          <div style={{fontSize:10,fontWeight:700,color:s.up?G2:R}}>{s.up?"+":""}{s.chgPct.toFixed(2)}%</div>
        </div>
      </div>
      <div style={{padding:14}}>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:12}}>
          <MiniChart data={spark} color={s.up?G:R} w={340} h={80}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          {[["52W High","Rs"+d.high52],["52W Low","Rs"+d.low52],["Mkt Cap",d.mcap],["P/E",d.pe],["P/B",d.pb],["Sector",s.sect]].map(function(r){
            return (
              <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:7,color:T2,marginBottom:3}}>{r[0]}</div>
                <div style={{fontSize:11,fontWeight:700,color:T1}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
        <div style={{background:s.up?"rgba(0,200,83,0.08)":"rgba(239,68,68,0.08)",border:"1px solid "+(s.up?"rgba(0,200,83,0.2)":"rgba(239,68,68,0.2)"),borderRadius:12,padding:12,marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:s.up?G2:R,marginBottom:4}}>{s.up?"Bullish":"Bearish"} Signal</div>
          <div style={{fontSize:10,color:T2,lineHeight:1.7}}>{s.up?"Price showing positive momentum. Watch for continuation above current levels with volume confirmation.":"Price showing negative pressure. Watch support levels for potential reversal signals."}</div>
        </div>
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

function SectorDetail(props) {
  var s=props.s; var up=s.chg>=0;
  var sStocks={
    IT:[{sym:"TCS",ltp:3654,chgPct:0.97,up:false,sect:"IT"},{sym:"INFY",ltp:1567,chgPct:1.40,up:false,sect:"IT"},{sym:"WIPRO",ltp:478,chgPct:2.99,up:true,sect:"IT"},{sym:"HCL",ltp:1876,chgPct:1.82,up:true,sect:"IT"}],
    Bank:[{sym:"HDFCBANK",ltp:1742,chgPct:1.90,up:true,sect:"Bank"},{sym:"ICICIBANK",ltp:1289,chgPct:2.33,up:true,sect:"Bank"},{sym:"SBIN",ltp:812,chgPct:2.18,up:true,sect:"Bank"},{sym:"AXISBANK",ltp:1156,chgPct:1.47,up:true,sect:"Bank"}],
    Auto:[{sym:"MARUTI",ltp:13240,chgPct:1.07,up:true,sect:"Auto"},{sym:"TATAMOTORS",ltp:945,chgPct:2.23,up:true,sect:"Auto"},{sym:"M&M",ltp:2876,chgPct:0.84,up:true,sect:"Auto"},{sym:"BAJAJ-AUTO",ltp:8934,chgPct:0.62,up:true,sect:"Auto"}],
    Pharma:[{sym:"SUNPHARMA",ltp:1678,chgPct:0.98,up:false,sect:"Pharma"},{sym:"DRREDDY",ltp:5432,chgPct:0.45,up:false,sect:"Pharma"},{sym:"CIPLA",ltp:1543,chgPct:0.12,up:false,sect:"Pharma"},{sym:"DIVISLAB",ltp:4321,chgPct:0.78,up:true,sect:"Pharma"}],
    Energy:[{sym:"RELIANCE",ltp:2845,chgPct:1.71,up:true,sect:"Energy"},{sym:"ONGC",ltp:287,chgPct:1.23,up:true,sect:"Energy"},{sym:"NTPC",ltp:398,chgPct:0.94,up:true,sect:"Energy"},{sym:"POWERGRID",ltp:334,chgPct:0.67,up:true,sect:"Energy"}],
    Metal:[{sym:"TATASTEEL",ltp:165,chgPct:3.24,up:true,sect:"Metal"},{sym:"HINDALCO",ltp:678,chgPct:2.87,up:true,sect:"Metal"},{sym:"JSWSTEEL",ltp:934,chgPct:2.54,up:true,sect:"Metal"},{sym:"SAIL",ltp:134,chgPct:1.98,up:true,sect:"Metal"}],
    FMCG:[{sym:"ITC",ltp:467,chgPct:0.34,up:true,sect:"FMCG"},{sym:"HUL",ltp:2345,chgPct:0.18,up:true,sect:"FMCG"},{sym:"NESTLEIND",ltp:2456,chgPct:0.45,up:false,sect:"FMCG"},{sym:"BRITANNIA",ltp:5678,chgPct:0.23,up:false,sect:"FMCG"}],
    Realty:[{sym:"DLF",ltp:876,chgPct:2.10,up:true,sect:"Realty"},{sym:"GODREJPROP",ltp:2345,chgPct:1.87,up:true,sect:"Realty"},{sym:"OBEROIRLTY",ltp:1876,chgPct:1.65,up:true,sect:"Realty"},{sym:"PRESTIGE",ltp:1543,chgPct:1.43,up:true,sect:"Realty"}],
    Infra:[{sym:"LT",ltp:3456,chgPct:0.76,up:true,sect:"Infra"},{sym:"ADANIPORTS",ltp:1234,chgPct:0.54,up:true,sect:"Infra"},{sym:"SIEMENS",ltp:6789,chgPct:0.98,up:true,sect:"Infra"},{sym:"ABB",ltp:7654,chgPct:0.87,up:true,sect:"Infra"}],
  };
  var stocks=sStocks[s.name]||[];
  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:20}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <BackBtn onClick={props.onBack}/>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{s.name} Sector</div>
          <div style={{fontSize:9,color:T2}}>{stocks.length} stocks</div>
        </div>
        <div style={{background:up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",borderRadius:8,padding:"6px 12px"}}>
          <div style={{fontSize:14,fontWeight:900,color:up?G2:R}}>{up?"+":""}{s.chg.toFixed(2)}%</div>
        </div>
      </div>
      <div style={{padding:14}}>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,overflow:"hidden",marginBottom:12}}>
          {stocks.map(function(st){
            var sp=genSpark(st.ltp);
            return (
              <div key={st.sym} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:"1px solid "+BD}}>
                <div style={{width:34,height:34,borderRadius:8,background:"rgba(30,144,255,0.1)",border:"1px solid rgba(30,144,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:7,fontWeight:800,color:"#1E90FF"}}>{st.sym.slice(0,3)}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:T1}}>{st.sym}</div>
                  <div style={{fontSize:8,color:T2}}>{st.sect}</div>
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
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

function IndexDetail(props) {
  var label=props.idx;
  var idx=INDICES.find(function(i){return i.label==label;})||INDICES[0];
  var spark=genSpark(idx.ltp);
  var meta={
    "NIFTY 50":{pe:22.4,mcap:"Rs 2.4 Cr Cr",desc:"Top 50 large-cap NSE stocks"},
    "SENSEX":{pe:24.1,mcap:"Rs 3.1 Cr Cr",desc:"Top 30 large-cap BSE stocks"},
    "BANK NIFTY":{pe:18.2,mcap:"Rs 1.8 Cr Cr",desc:"Top 12 liquid banking stocks"},
    "MIDCAP":{pe:28.5,mcap:"Rs 0.9 Cr Cr",desc:"Mid-cap companies index"},
  };
  var d=meta[label]||{pe:"N/A",mcap:"N/A",desc:""};
  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:20}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <BackBtn onClick={props.onBack}/>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{idx.label}</div>
          <div style={{fontSize:9,color:T2}}>{d.desc}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:18,fontWeight:900,fontFamily:"monospace",color:idx.up?G2:R}}>{idx.ltp.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
          <div style={{fontSize:10,fontWeight:700,color:idx.up?G2:R}}>{idx.up?"+":""}{idx.pct.toFixed(2)}%</div>
        </div>
      </div>
      <div style={{padding:14}}>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:12}}>
          <MiniChart data={spark} color={idx.up?G:R} w={340} h={80}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[["P/E Ratio",d.pe],["Market Cap",d.mcap]].map(function(r){
            return (
              <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:14,textAlign:"center"}}>
                <div style={{fontSize:8,color:T2,marginBottom:4}}>{r[0]}</div>
                <div style={{fontSize:14,fontWeight:800,color:G}}>{r[1]}</div>
              </div>
            );
          })}
        </div>
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

export default function MarketsScreen(props) {
  var stocks=(props.stocks&&props.stocks.length>0)?props.stocks:DEMO_STOCKS;
  var [search,setSearch]=useState("");
  var [sort,setSort]=useState("pct");
  var [activeTab,setActiveTab]=useState("stocks");
  var [selStock,setSelStock]=useState(null);
  var [selSector,setSelSector]=useState(null);
  var [selIdx,setSelIdx]=useState(null);

  useEffect(function(){
    if(!document.getElementById("mkt-css")){
      var el=document.createElement("style");
      el.id="mkt-css";
      el.textContent="@keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}";
      document.head.appendChild(el);
    }
  },[]);

  if(selStock) return <StockDetail s={selStock} onBack={function(){setSelStock(null);}}/>;
  if(selSector) return <SectorDetail s={selSector} onBack={function(){setSelSector(null);}}/>;
  if(selIdx) return <IndexDetail idx={selIdx} onBack={function(){setSelIdx(null);}}/>;

  var filtered=stocks.filter(function(s){
    return !search||s.sym.toLowerCase().indexOf(search.toLowerCase())!=-1;
  }).sort(function(a,b){
    return sort=="pct"?b.chgPct-a.chgPct:b.ltp-a.ltp;
  });

  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,padding:"8px 12px",marginBottom:10}}>
          <span style={{color:T2}}>&#128269;</span>
          <input style={{flex:1,background:"none",border:"none",outline:"none",fontSize:12,color:T1,fontFamily:"inherit"}} placeholder="Search stocks..." value={search} onChange={function(e){setSearch(e.target.value);}}/>
          {search?<button onClick={function(){setSearch("");}} style={{background:"none",border:"none",cursor:"pointer",color:T2,fontSize:12}}>X</button>:null}
        </div>
        <div style={{display:"flex",gap:6}}>
          {[["stocks","Stocks"],["indices","Indices"],["sectors","Sectors"]].map(function(t){
            var act=activeTab==t[0];
            return <button key={t[0]} onClick={function(){setActiveTab(t[0]);}} style={{background:act?G:"rgba(255,255,255,0.06)",border:"1px solid "+(act?G:BD),borderRadius:20,padding:"5px 14px",color:act?"#fff":T2,fontSize:9,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}</button>;
          })}
          <div style={{flex:1}}></div>
          {activeTab=="stocks"?[["pct","% Chg"],["ltp","Price"]].map(function(s){
            var act=sort==s[0];
            return <button key={s[0]} onClick={function(){setSort(s[0]);}} style={{background:act?"rgba(0,200,83,0.15)":"rgba(255,255,255,0.06)",border:"1px solid "+(act?G:BD),borderRadius:20,padding:"5px 10px",color:act?G:T2,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{s[1]}</button>;
          }):null}
        </div>
      </div>

      {activeTab=="stocks"?(
        <div style={{background:CB,margin:"10px 14px",borderRadius:12,border:"1px solid "+BD,overflow:"hidden"}}>
          {filtered.length==0?(
            <div style={{padding:24,textAlign:"center",color:T2,fontSize:12}}>No stocks found</div>
          ):filtered.map(function(s){
            return <StockRow key={s.sym} s={s} onClick={function(){setSelStock(s);}}/>;
          })}
        </div>
      ):null}

      {activeTab=="indices"?(
        <div style={{padding:"10px 14px"}}>
          {INDICES.map(function(idx){
            var spark=genSpark(idx.ltp);
            return (
              <div key={idx.label} style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:16,marginBottom:10,cursor:"pointer"}} onClick={function(){setSelIdx(idx.label);}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:10,color:T2,marginBottom:2}}>{idx.label}</div>
                    <div style={{fontSize:22,fontWeight:900,fontFamily:"monospace",color:idx.up?G2:R}}>{idx.ltp.toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
                    <span style={{background:idx.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",color:idx.up?G2:R,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,marginTop:4,display:"inline-block"}}>{idx.up?"+":""}{idx.pct.toFixed(2)}%</span>
                  </div>
                  <MiniChart data={spark} color={idx.up?G:R} w={90} h={45}/>
                </div>
              </div>
            );
     
