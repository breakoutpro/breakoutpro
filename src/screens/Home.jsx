import { useState, useEffect } from "react";

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
var DISCLAIMER = "Educational only. Not SEBI registered. Not investment advice.";

var SECTORS = [
  {name:"IT",chg:1.82},{name:"Bank",chg:1.24},{name:"Auto",chg:0.94},
  {name:"Pharma",chg:-0.32},{name:"Energy",chg:1.35},{name:"Metal",chg:3.24},
  {name:"FMCG",chg:0.18},{name:"Realty",chg:2.10},{name:"Infra",chg:0.76},
];

function isMktOpen() {
  var now = new Date();
  var day = now.getDay();
  // 0=Sunday, 6=Saturday
  if (day == 0 || day == 6) return false;
  // NSE Holidays 2026
  var HOLIDAYS = [
    "2026-01-26","2026-02-19","2026-03-02","2026-03-20",
    "2026-04-02","2026-04-06","2026-04-10","2026-04-14",
    "2026-05-01","2026-06-13","2026-08-15","2026-09-07",
    "2026-10-02","2026-10-21","2026-10-22","2026-11-05",
    "2026-11-25","2026-12-25"
  ];
  var todayStr = now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");
  if(HOLIDAYS.indexOf(todayStr) != -1) return false;
  var mins = now.getHours() * 60 + now.getMinutes();
  return mins >= 555 && mins < 930;
}

function parseNSEIndex(data, name) {
  try {
    var arr = data.data || data.allData || [];
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      var iname = (item.indexSymbol || item.index || "").toLowerCase();
      if (iname.indexOf(name.toLowerCase()) != -1) {
        var ltp = parseFloat(item.last || item.lastPrice || 0);
        var chg = parseFloat(item.percChange || item.pChange || 0);
        return { ltp: ltp, pct: Math.abs(chg), up: chg >= 0 };
      }
    }
  } catch(e) {}
  return null;
}

function Spark(props) {
  var data = props.data;
  var color = props.color || G;
  var w = props.w || 60;
  var h = props.h || 28;
  if (!data || data.length < 2) return null;
  var min = Math.min.apply(null, data);
  var max = Math.max.apply(null, data);
  var range = max - min || 1;
  var pts = data.map(function(v,i){
    return (i/(data.length-1))*w+","+(h-((v-min)/range)*(h-4)+2);
  }).join(" ");
  return (
    <svg width={w} height={h} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function genSpark(base) {
  var a=[]; var p=base;
  for(var i=0;i<14;i++){p=p+(Math.random()-0.48)*base*0.004;a.push(p);}
  return a;
}

function IndexCard(props) {
  var d = props.d;
  var spark = genSpark(d.ltp);
  return (
    <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:"12px 14px",cursor:"pointer",position:"relative",overflow:"hidden"}} onClick={props.onClick}>
      <div style={{position:"absolute",top:0,right:0,width:60,height:"100%",opacity:0.15}}>
        <Spark data={spark} color={d.up?G:R} w={60} h={70}/>
      </div>
      <div style={{fontSize:8,color:T2,fontWeight:600,marginBottom:4,letterSpacing:0.5}}>{d.label}</div>
      <div style={{fontFamily:"monospace",fontSize:15,fontWeight:900,color:T1,marginBottom:4}}>
        {d.ltp.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <span style={{fontSize:9,fontWeight:700,color:d.up?G2:R}}>{d.up?"":""}</span>
        <span style={{fontSize:10,fontWeight:700,color:d.up?G2:R}}>{d.up?"+":""}{d.pct.toFixed(2)}%</span>
      </div>
    </div>
  );
}

function StockRow(props) {
  var s = props.s;
  var spark = genSpark(s.ltp);
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid "+BD,cursor:"pointer"}} onClick={props.onClick}>
      <div style={{width:36,height:36,borderRadius:10,background:"rgba(30,144,255,0.1)",border:"1px solid rgba(30,144,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:8,fontWeight:800,color:BLUE}}>{s.sym.slice(0,3)}</span>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
        <div style={{fontSize:8,color:T2,marginTop:1}}>{s.sect}</div>
      </div>
      <Spark data={spark} color={s.up?G:R} w={44} h={20}/>
      <div style={{textAlign:"right",minWidth:76}}>
        <div style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:T1}}>
          Rs{s.ltp>=1000?(s.ltp/1000).toFixed(1)+"K":s.ltp.toFixed(2)}
        </div>
        <div style={{background:s.up?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",borderRadius:5,padding:"1px 6px",fontSize:8,fontWeight:700,color:s.up?G2:R,marginTop:2}}>
          {s.up?"+":""}{s.chgPct.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

var DEFAULT_STOCKS = [
  {sym:"RELIANCE",name:"Reliance",  ltp:2845.60,chgPct:1.71,up:true, sect:"Energy"},
  {sym:"TCS",     name:"TCS",       ltp:3654.20,chgPct:-0.97,up:false,sect:"IT"},
  {sym:"HDFCBANK",name:"HDFC Bank", ltp:1742.50,chgPct:1.90,up:true, sect:"Bank"},
  {sym:"ICICIBANK",name:"ICICI",    ltp:1289.30,chgPct:2.33,up:true, sect:"Bank"},
  {sym:"INFY",    name:"Infosys",   ltp:1567.80,chgPct:-1.40,up:false,sect:"IT"},
  {sym:"WIPRO",   name:"Wipro",     ltp:478.90, chgPct:2.99,up:true, sect:"IT"},
  {sym:"SBIN",    name:"SBI",       ltp:812.30, chgPct:2.18,up:true, sect:"Bank"},
  {sym:"AXISBANK",name:"Axis Bank", ltp:1156.70,chgPct:1.47,up:true, sect:"Bank"},
];

var DEFAULT_INDICES = {
  nifty:    {ltp:23622.90,pct:0.00,up:true},
  sensex:   {ltp:73863.45,pct:1.28,up:true},
  bankNifty:{ltp:56814.80,pct:0.00,up:true},
  midcap:   {ltp:17265.90,pct:0.00,up:true},
};

export default function HomeScreen(props) {
  var setTab = props.setTab;
  var user = props.user;
  var glTab = props.glTab || "gainers";
  var setGlTab = props.setGlTab;
  var briefing = props.briefing;
  var briefingLoading = props.briefingLoading;

  var [liveNifty,    setLiveNifty]    = useState(props.nifty    || DEFAULT_INDICES.nifty);
  var [liveSensex,   setLiveSensex]   = useState(props.sensex   || DEFAULT_INDICES.sensex);
  var [liveBankNifty,setLiveBankNifty]= useState(props.bankNifty|| DEFAULT_INDICES.bankNifty);
  var [liveMidcap,   setLiveMidcap]   = useState(props.midcap   || DEFAULT_INDICES.midcap);
  var [liveStocks,   setLiveStocks]   = useState(DEFAULT_STOCKS);
  var [lastUpdated,  setLastUpdated]  = useState("");
  var [isLive,       setIsLive]       = useState(false);
  var [loading,      setLoading]      = useState(false);
  var [time,         setTime]         = useState(new Date());

  useEffect(function(){
    var t = setInterval(function(){setTime(new Date());},1000);
    return function(){clearInterval(t);};
  },[]);

  function fetchLive() {
    if(loading) return;
    setLoading(true);
    fetch("/api/upstox?type=indices")
      .then(function(r){return r.json();})
      .then(function(data){
        if(!data.success) throw new Error("Upstox failed");
        var quotes = data.data || [];
        quotes.forEach(function(q){
          var ltp = q.price;
          var up = true;
          if(q.symbol=="Nifty 50")       {setLiveNifty({ltp:ltp,pct:0,up:up});setIsLive(true);}
          if(q.symbol=="SENSEX")          setLiveSensex({ltp:ltp,pct:0,up:up});
          if(q.symbol=="Nifty Bank")      setLiveBankNifty({ltp:ltp,pct:0,up:up});
          if(q.symbol=="Nifty Midcap 50") setLiveMidcap({ltp:ltp,pct:0,up:up});
        });
        setLastUpdated(new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}));
        setLoading(false);
      })
      .catch(function(){setLoading(false);setIsLive(false);});
  }

  function fetchStocks() {
    fetch("/api/upstox?type=stocks")
      .then(function(r){return r.json();})
      .then(function(data){
        if(!data.success) return;
        var mapped = (data.data||[]).map(function(q){
          return {
            sym:q.symbol, name:q.name, ltp:q.price,
            chgPct:0, up:true, sect:"NSE", vol:0
          };
        }).filter(function(s){return s.ltp>0;});
        if(mapped.length>0) setLiveStocks(mapped);
      })
      .catch(function(){});
  }

  useEffect(function(){
    fetchLive(); fetchStocks();
    var t=setInterval(function(){if(isMktOpen()){fetchLive();fetchStocks();}},15000);
    return function(){clearInterval(t);};
  },[]);

  var hour = time.getHours();
  var greeting = hour<12?"Good Morning":hour<17?"Good Afternoon":"Good Evening";
  var uname = user?user.name.split(" ")[0]:"Trader";
  var timeStr = time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});

  var indices=[
    {label:"NIFTY 50",   ltp:liveNifty.ltp,     pct:liveNifty.pct,     up:liveNifty.up},
    {label:"SENSEX",     ltp:liveSensex.ltp,     pct:liveSensex.pct,    up:liveSensex.up},
    {label:"BANK NIFTY", ltp:liveBankNifty.ltp,  pct:liveBankNifty.pct, up:liveBankNifty.up},
    {label:"MIDCAP",     ltp:liveMidcap.ltp,     pct:liveMidcap.pct,    up:liveMidcap.up},
  ];

  var quick=[
    {label:"OI Chain",id:"oi",     icon:"OI"},
    {label:"Scanner",id:"scanner", icon:"SC"},
    {label:"Paper Trade",id:"paper",icon:"PT"},
    {label:"Chart",id:"chart",     icon:"CH"},
    {label:"Analysis",id:"analysis",icon:"AN"},
    {label:"AI Chat",id:"ai",      icon:"AI"},
    {label:"Patterns",id:"patterns",icon:"PA"},
    {label:"Briefing",id:"briefing",icon:"BR"},
  ];

  var sorted = liveStocks.slice().sort(function(a,b){
    return glTab=="gainers"?b.chgPct-a.chgPct:a.chgPct-b.chgPct;
  }).slice(0,5);

  var mktOpen = isMktOpen();

  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,color:T1,fontFamily:"Inter,Arial,sans-serif"}}>

      {/* Header */}
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:42,height:42,borderRadius:12,background:"linear-gradient(135deg,"+G+",#00A040)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#fff",boxShadow:"0 2px 12px rgba(0,200,83,0.3)"}}>{uname[0].toUpperCase()}</div>
          <div>
            <div style={{fontSize:9,color:T2}}>{greeting}</div>
            <div style={{fontSize:16,color:T1,fontWeight:800}}>{uname}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,fontFamily:"monospace",fontWeight:700,color:mktOpen?G2:T2}}>{timeStr}</div>
            {isLive?(
              <div style={{display:"flex",alignItems:"center",gap:3,justifyContent:"flex-end"}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:G2}}></div>
                <span style={{fontSize:7,fontWeight:700,color:G2}}>LIVE {lastUpdated}</span>
              </div>
            ):(
              <button onClick={fetchLive} style={{background:"none",border:"none",fontSize:7,color:T2,cursor:"pointer",fontFamily:"inherit"}}>{loading?"...":"Refresh"}</button>
            )}
          </div>
          <button style={{background:"rgba(255,255,255,0.06)",border:"1px solid "+BD,borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:T1}} onClick={function(){setTab("news");}}>&#128276;</button>
        </div>
      </div>

      <div style={{padding:"14px 14px 0"}}>

        {/* Market Status Banner */}
        <div style={{background:mktOpen?"rgba(0,200,83,0.08)":"rgba(30,144,255,0.08)",border:"1px solid "+(mktOpen?"rgba(0,200,83,0.2)":"rgba(30,144,255,0.2)"),borderRadius:12,padding:"8px 14px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:mktOpen?G2:BLUE}}></div>
            <span style={{fontSize:10,fontWeight:700,color:mktOpen?G2:BLUE}}>{mktOpen?"Market Open  Live Data":"Market Closed  Opens 9:15 AM"}</span>
          </div>
          <span style={{fontSize:8,color:T2}}>NSE/BSE</span>
        </div>

        {/* AI Briefing */}
        <div style={{background:"linear-gradient(135deg,rgba(0,200,83,0.08),rgba(0,230,118,0.05))",border:"1px solid rgba(0,200,83,0.2)",borderRadius:16,padding:16,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,"+G+",#00A040)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:900}}>AI</div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:T1}}>AI Market Briefing</div>
                <div style={{fontSize:8,color:T2}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"short"})}</div>
              </div>
            </div>
            <button onClick={function(){props.setTab("briefing");}} style={{background:briefing?"transparent":G,border:briefing?"1px solid rgba(0,200,83,0.3)":"none",borderRadius:20,padding:"6px 14px",color:briefing?G2:"#fff",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              {briefingLoading?"Loading...":briefing?"Refresh":"Get Briefing"}
            </button>
          </div>
          {briefingLoading?(
            <div style={{padding:"8px 0",textAlign:"center",fontSize:10,color:T2}}>AI analyzing markets...</div>
          ):briefing?(
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:10,fontSize:10,color:T2,lineHeight:1.7}}>{briefing}</div>
          ):(
            <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:12,textAlign:"center"}}>
              <div style={{fontSize:11,color:T1,fontWeight:600}}>Your Daily Market Briefing</div>
              <div style={{fontSize:9,color:T2,marginTop:3}}>Tap Get Briefing for AI analysis</div>
            </div>
          )}
        </div>

        {/* Index Cards */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {indices.map(function(d){
            return <IndexCard key={d.label} d={d} onClick={function(){setTab("markets");}}/>;
          })}
        </div>

        {/* Quick Access */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:8}}>Quick Access</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {quick.map(function(q){
              return (
                <button key={q.label} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"10px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",fontFamily:"inherit"}} onClick={function(){setTab(q.id);}}>
                  <div style={{fontSize:9,fontWeight:900,color:G,letterSpacing:0}}>{q.icon}</div>
                  <span style={{fontSize:8,color:T2,fontWeight:600,textAlign:"center"}}>{q.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gainers / Losers */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{display:"flex",background:"rgba(255,255,255,0.05)",borderRadius:20,padding:3,border:"1px solid "+BD}}>
              {["gainers","losers"].map(function(t){
                var act=glTab==t;
                return <button key={t} style={{background:act?G:"transparent",border:"none",borderRadius:17,padding:"5px 12px",color:act?"#fff":T2,fontSize:9,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit"}} onClick={function(){setGlTab(t);}}>{t=="gainers"?"Gainers":"Losers"}</button>;
              })}
            </div>
            <button style={{background:"none",border:"none",color:G,fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={function(){setTab("markets");}}>View All</button>
          </div>
          <div style={{background:CB,borderRadius:12,border:"1px solid "+BD,overflow:"hidden"}}>
            {sorted.map(function(s){return <StockRow key={s.sym} s={s} onClick={function(){setTab("markets");}}/>;  })}
          </div>
        </div>

        {/* Sectors */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:8}}>Sector Performance</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
            {SECTORS.map(function(s){
              var up=s.chg>=0;
              return (
                <div key={s.name} style={{background:CB,border:"1px solid "+(up?"rgba(0,200,83,0.2)":"rgba(239,68,68,0.2)"),borderRadius:10,padding:"8px",textAlign:"center"}}>
                  <div style={{fontSize:9,fontWeight:600,color:T2}}>{s.name}</div>
                  <div style={{fontSize:11,fontWeight:700,color:up?G2:R,marginTop:2}}>{up?"+":""}{s.chg.toFixed(2)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:"9px 12px",marginBottom:6}}>
          <div style={{fontSize:7.5,color:"#F97316"}}>! {DISCLAIMER}</div>
        </div>

      </div>
    </div>
  );
}
