import { useState, useEffect, lazy, Suspense } from "react";
import { G, DISCLAIMER, GEMINI_URL } from "./utils/helpers";
import { STOCKS } from "./data/stocks";
import { NEWS } from "./data/news";
import { SUB_PLANS } from "./data/globals";
import TopBar from "./components/TopBar";
import TabBar from "./components/TabBar";

// Direct imports for core screens (faster - no lazy delay)
import HomeScreen   from "./screens/Home";
import MarketsScreen from "./screens/Markets";
import ScannerScreen from "./screens/Scanner";
import AIScreen     from "./screens/AI";
import LearnScreen  from "./screens/Learn";
import NewsScreen   from "./screens/News";

// Lazy load for heavy/less-used screens
var CandleScreen   = lazy(function(){ return import("./screens/CandleScreen"); });
var ChartEngine    = lazy(function(){ return import("./screens/Chart"); });
var CandleDetector = lazy(function(){ return import("./screens/CandleDetector"); });
var MarketAnalysis = lazy(function(){ return import("./screens/MarketAnalysis"); });
var ScalperMode    = lazy(function(){ return import("./screens/ScalperMode"); });
var QuizScreen     = lazy(function(){ return import("./screens/QuizScreen"); });

function Loader() {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,color:G,fontSize:13,fontWeight:700}}>
      Loading...
    </div>
  );
}

function AuthScreen(props) {
  var [mode,setMode] = useState("login");
  var [name,setName] = useState("");
  var [phone,setPhone] = useState("");
  var [pass,setPass] = useState("");
  var [err,setErr] = useState("");

  function submit() {
    setErr("");
    if(!phone||phone.length<10){setErr("Enter valid 10-digit phone");return;}
    if(!pass||pass.length<6){setErr("Password min 6 chars");return;}
    if(phone=="8790124010"&&pass=="Suresh@2025"){
      props.onLogin({name:"Admin",phone:"8790124010",isAdmin:true,isPrem:true,trialStart:Date.now()});return;
    }
    var users={};
    try{users=JSON.parse(localStorage.getItem("bp_users")||"{}");}catch(e){}
    if(mode=="register"){
      if(!name){setErr("Enter your name");return;}
      users[phone]={name:name,phone:phone,pass:pass};
      try{localStorage.setItem("bp_users",JSON.stringify(users));}catch(e){}
      props.onLogin({name:name,phone:phone,trialStart:Date.now()});
    } else {
      if(!users[phone]){
        users[phone]={name:"Trader",phone:phone,pass:pass};
        try{localStorage.setItem("bp_users",JSON.stringify(users));}catch(e){}
        props.onLogin({name:"Trader",phone:phone,trialStart:Date.now()});return;
      }
      if(users[phone].pass!=pass){setErr("Wrong password");return;}
      props.onLogin(users[phone]);
    }
  }

  var inp={width:"100%",background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,padding:"11px 13px",color:"#111827",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:10};
  return (
    <div style={{background:"#F8F9FA",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#fff",padding:"32px 20px 24px",textAlign:"center",borderBottom:"1px solid #F0F0F0"}}>
        <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",boxShadow:"0 4px 14px rgba(0,200,83,0.3)"}}>
          <span style={{fontFamily:"Arial",fontSize:18,fontWeight:900,color:"#fff"}}>BP</span>
        </div>
        <div style={{fontSize:24,fontWeight:900,color:"#111827"}}>Breakout<span style={{color:G}}> Pro</span></div>
        <div style={{fontSize:8,color:"#F97316",fontWeight:800,letterSpacing:2,marginTop:3}}>CATCH EVERY BREAKOUT</div>
        <div style={{fontSize:9,color:"#9CA3AF",marginTop:4}}>India's No.1 Trading Education Platform</div>
      </div>
      <div style={{padding:"24px 20px",flex:1}}>
        <div style={{display:"flex",background:"#F3F4F6",borderRadius:12,padding:4,marginBottom:20}}>
          {[["login","Login"],["register","Register"]].map(function(kv){
            var act=mode==kv[0];
            return <button key={kv[0]} onClick={function(){setMode(kv[0]);setErr("");}} style={{flex:1,padding:"10px",borderRadius:9,border:"none",background:act?"#fff":"transparent",color:act?"#111827":"#6B7280",fontWeight:act?700:500,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{kv[1]}</button>;
          })}
        </div>
        {err?<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:11,color:"#DC2626"}}>! {err}</div>:null}
        {mode=="register"?<input style={inp} placeholder="Full Name" value={name} onChange={function(e){setName(e.target.value);}}/>:null}
        <input style={inp} placeholder="Phone (10 digits)" type="tel" maxLength={10} value={phone} onChange={function(e){setPhone(e.target.value);}}/>
        <input style={inp} placeholder="Password (min 6 chars)" type="password" value={pass} onChange={function(e){setPass(e.target.value);}}/>
        <button style={{width:"100%",background:G,border:"none",borderRadius:12,padding:"14px",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit"}} onClick={submit}>
          {mode=="login"?"Login":"Create Account"}
        </button>
        <div style={{marginTop:14,background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:"10px 12px",fontSize:8,color:"#92400E",textAlign:"center"}}>! {DISCLAIMER}</div>
      </div>
    </div>
  );
}


var GLOBAL_MKT = [
  {name:"Dow Jones",val:38654.42,chg:0.82,up:true},
  {name:"Nasdaq",val:16234.10,chg:1.24,up:true},
  {name:"S and P 500",val:5123.67,chg:0.94,up:true},
  {name:"Nikkei 225",val:38156.97,chg:-0.34,up:false},
  {name:"Hang Seng",val:17823.45,chg:-0.87,up:false},
  {name:"SGX Nifty",val:22510,chg:0.19,up:true},
  {name:"Crude Oil",val:82.34,chg:1.23,up:true},
  {name:"Gold",val:2312.50,chg:0.45,up:true},
  {name:"Silver",val:27.84,chg:-0.32,up:false},
  {name:"DXY",val:104.23,chg:-0.18,up:false},
];

var NIFTY_STOCKS = [
  {sym:"RELIANCE",chg:1.71},{sym:"TCS",chg:-0.97},{sym:"HDFCBANK",chg:1.90},
  {sym:"ICICIBANK",chg:2.33},{sym:"INFY",chg:-1.40},{sym:"WIPRO",chg:2.99},
  {sym:"TATAMOTORS",chg:2.23},{sym:"MARUTI",chg:1.07},{sym:"SUNPHARMA",chg:-0.98},
  {sym:"BAJFINANCE",chg:1.90},{sym:"SBIN",chg:2.18},{sym:"AXISBANK",chg:1.47},
  {sym:"LT",chg:-0.95},{sym:"NTPC",chg:1.72},{sym:"ONGC",chg:2.24},
  {sym:"ADANIENT",chg:3.24},{sym:"ITC",chg:0.34},{sym:"HUL",chg:0.18},
  {sym:"KOTAKBANK",chg:1.12},{sym:"ASIANPAINT",chg:-0.54},
];

function GlobalScreen() {
  var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",G="#00C853",G2="#00E676",R="#EF4444",T1="#FFFFFF",T2="#8899BB";
  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,padding:14,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{fontSize:18,fontWeight:900,color:T1,marginBottom:14}}>Global <span style={{color:G}}>Markets</span></div>
      {GLOBAL_MKT.map(function(m){
        return (
          <div key={m.name} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:13,fontWeight:700,color:T1}}>{m.name}</span>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"monospace",fontSize:13,fontWeight:800,color:T1}}>{m.val.toLocaleString("en-IN")}</div>
              <div style={{fontSize:10,fontWeight:700,color:m.up?G2:R}}>{m.up?"+":""}{m.chg.toFixed(2)}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HeatmapScreen() {
  var DB="#0A0E1A",G="#00C853",R="#EF4444",T1="#FFFFFF",T2="#8899BB";
  function col(chg){
    if(chg>=3) return {bg:"#00C853",tx:"#fff"};
    if(chg>=1.5) return {bg:"#4CAF50",tx:"#fff"};
    if(chg>=0) return {bg:"#1A3A1A",tx:"#00E676"};
    if(chg>=-1.5) return {bg:"#3A1A1A",tx:"#EF4444"};
    return {bg:"#EF4444",tx:"#fff"};
  }
  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{padding:"14px 14px 8px",fontSize:16,fontWeight:900,color:T1}}>NIFTY 50 <span style={{color:G}}>Heatmap</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,padding:"0 14px 14px"}}>
        {NIFTY_STOCKS.map(function(s){
          var c2=col(s.chg);
          return (
            <div key={s.sym} style={{background:c2.bg,borderRadius:8,padding:"10px 4px",textAlign:"center"}}>
              <div style={{fontSize:8,fontWeight:700,color:c2.tx}}>{s.sym}</div>
              <div style={{fontSize:9,fontWeight:800,color:c2.tx,marginTop:2}}>{s.chg>0?"+":""}{s.chg.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FiiScreen() {
  var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",G="#00C853",G2="#00E676",R="#EF4444",T1="#FFFFFF",T2="#8899BB";
  var daily=[
    {date:"Jun 12",fii:2340,dii:-890},{date:"Jun 11",fii:-1230,dii:1560},
    {date:"Jun 10",fii:3450,dii:-230},{date:"Jun 07",fii:-890,dii:2340},
    {date:"Jun 06",fii:1560,dii:-450},
  ];
  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,padding:14,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{fontSize:18,fontWeight:900,color:T1,marginBottom:14}}>FII / <span style={{color:G}}>DII</span></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:"rgba(0,200,83,0.08)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:14,padding:14,textAlign:"center"}}>
          <div style={{fontSize:9,color:T2,marginBottom:4}}>FII Today (Cr)</div>
          <div style={{fontSize:22,fontWeight:900,color:G2}}>+2,340</div>
        </div>
        <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:14,padding:14,textAlign:"center"}}>
          <div style={{fontSize:9,color:T2,marginBottom:4}}>DII Today (Cr)</div>
          <div style={{fontSize:22,fontWeight:900,color:R}}>-890</div>
        </div>
      </div>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14}}>
        <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:10}}>Daily Activity (Rs Cr)</div>
        {daily.map(function(d){
          var net=d.fii+d.dii;
          return (
            <div key={d.date} style={{display:"flex",alignItems:"center",padding:"9px 0",borderBottom:"1px solid "+BD}}>
              <div style={{fontSize:10,color:T2,width:50}}>{d.date}</div>
              <div style={{flex:1,display:"flex",gap:10}}>
                <span style={{fontSize:9,color:G2,fontWeight:600}}>FII:{d.fii>0?"+":""}{d.fii}</span>
                <span style={{fontSize:9,color:R,fontWeight:600}}>DII:{d.dii>0?"+":""}{d.dii}</span>
              </div>
              <div style={{fontSize:10,fontWeight:700,color:net>=0?G2:R}}>{net>=0?"+":""}{net}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JournalScreen() {
  var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",G="#00C853",G2="#00E676",R="#EF4444",GOLD="#F59E0B",T1="#FFFFFF",T2="#8899BB";
  var stored=[];
  try{stored=JSON.parse(localStorage.getItem("bp_journal")||"[]");}catch(e){}
  var [entries,setEntries]=React.useState(stored);
  var [show,setShow]=React.useState(false);
  var [sym,setSym]=React.useState("");
  var [en,setEn]=React.useState("");
  var [ex,setEx]=React.useState("");
  var [qty,setQty]=React.useState("");
  var [side,setSide]=React.useState("Long");
  function add(){
    if(!sym||!en||!ex||!qty) return;
    var pnl=(parseFloat(ex)-parseFloat(en))*parseFloat(qty)*(side=="Long"?1:-1);
    var e2={id:Date.now(),sym:sym.toUpperCase(),side:side,entry:parseFloat(en),exit:parseFloat(ex),qty:parseFloat(qty),pnl:pnl,date:new Date().toLocaleDateString("en-IN")};
    var ne=[e2].concat(entries);
    setEntries(ne);
    try{localStorage.setItem("bp_journal",JSON.stringify(ne.slice(0,100)));}catch(e){}
    setShow(false);setSym("");setEn("");setEx("");setQty("");
  }
  var totPnl=entries.reduce(function(s,e){return s+e.pnl;},0);
  var inp={width:"100%",background:CB,border:"1px solid "+BD,borderRadius:10,padding:"11px 13px",color:T1,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:10};
  if(show) return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={function(){setShow(false);}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1}}>&#8592;</button>
        <div style={{fontSize:14,fontWeight:700,color:T1}}>Add Trade</div>
      </div>
      <div style={{padding:14}}>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {["Long","Short"].map(function(s){var act=side==s;return <button key={s} onClick={function(){setSide(s);}} style={{flex:1,background:act?(s=="Long"?G:R):"rgba(255,255,255,0.06)",border:"none",borderRadius:10,padding:"10px",color:act?"#fff":T2,fontWeight:600,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{s}</button>;})}
        </div>
        <input style={inp} placeholder="Symbol (e.g. NIFTY)" value={sym} onChange={function(e){setSym(e.target.value);}}/>
        <input style={inp} placeholder="Entry Price" type="number" value={en} onChange={function(e){setEn(e.target.value);}}/>
        <input style={inp} placeholder="Exit Price" type="number" value={ex} onChange={function(e){setEx(e.target.value);}}/>
        <input style={inp} placeholder="Quantity" type="number" value={qty} onChange={function(e){setQty(e.target.value);}}/>
        <button onClick={add} style={{width:"100%",background:G,border:"none",borderRadius:12,padding:14,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Save Trade</button>
      </div>
    </div>
  );
  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,padding:14,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:18,fontWeight:900,color:T1}}>Trading <span style={{color:G}}>Journal</span></div>
        <button onClick={function(){setShow(true);}} style={{background:G,border:"none",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Add Trade</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:totPnl>=0?"rgba(0,200,83,0.08)":"rgba(239,68,68,0.08)",border:"1px solid "+(totPnl>=0?"rgba(0,200,83,0.2)":"rgba(239,68,68,0.2)"),borderRadius:12,padding:12,textAlign:"center"}}>
          <div style={{fontSize:8,color:T2,marginBottom:3}}>Total P&L</div>
          <div style={{fontSize:20,fontWeight:900,color:totPnl>=0?G2:R}}>{totPnl>=0?"+ Rs ":"- Rs "}{Math.abs(totPnl).toFixed(0)}</div>
        </div>
        <div style={{background:"rgba(30,144,255,0.08)",border:"1px solid rgba(30,144,255,0.2)",borderRadius:12,padding:12,textAlign:"center"}}>
          <div style={{fontSize:8,color:T2,marginBottom:3}}>Trades</div>
          <div style={{fontSize:20,fontWeight:900,color:"#1E90FF"}}>{entries.length}</div>
        </div>
      </div>
      {entries.length==0?<div style={{textAlign:"center",padding:"40px 0",color:T2,fontSize:12}}>No trades yet. Tap + Add Trade!</div>:null}
      {entries.map(function(e){var up=e.pnl>=0;return(
        <div key={e.id} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid "+(up?G:R)}}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:13,fontWeight:700,color:T1}}>{e.sym} <span style={{background:e.side=="Long"?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",color:e.side=="Long"?G2:R,borderRadius:4,padding:"1px 5px",fontSize:7,fontWeight:700}}>{e.side}</span></span>
            <span style={{fontSize:13,fontWeight:800,color:up?G2:R}}>{up?"+ Rs ":"- Rs "}{Math.abs(e.pnl).toFixed(0)}</span>
          </div>
          <div style={{display:"flex",gap:10,marginTop:4,fontSize:9,color:T2}}>
            <span>In:{e.entry}</span><span>Out:{e.exit}</span><span>Qty:{e.qty}</span><span>{e.date}</span>
          </div>
        </div>
      );})}
    </div>
  );
}

function ChallengesScreen() {
  var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",G="#00C853",G2="#00E676",GOLD="#F59E0B",BLUE="#3B82F6",T1="#FFFFFF",T2="#8899BB";
  var xp0=0; try{xp0=parseInt(localStorage.getItem("bp_xp")||"0");}catch(e){}
  var done0=[]; try{done0=JSON.parse(localStorage.getItem("bp_done")||"[]");}catch(e){}
  var [xp,setXp]=React.useState(xp0);
  var [done,setDone]=React.useState(done0);
  var [active,setActive]=React.useState(null);
  var [sel,setSel]=React.useState(null);
  var qs=[
    {id:"q1",title:"Candlestick",q:"Which shows indecision?",opts:["Doji","Hammer","Marubozu","Engulfing"],ans:0,xp:10},
    {id:"q2",title:"OI Concept",q:"Rising OI + rising price =",opts:["Long buildup","Short covering","Unwinding","Short buildup"],ans:0,xp:10},
    {id:"q3",title:"PCR",q:"PCR below 0.7 =",opts:["Overbought","Oversold","Neutral","Volatile"],ans:0,xp:15},
    {id:"q4",title:"RSI",q:"RSI above 70 =",opts:["Overbought","Oversold","Neutral","Trending"],ans:0,xp:10},
    {id:"q5",title:"VWAP",q:"Price above VWAP means:",opts:["Bullish bias","Bearish bias","No trend","Low volume"],ans:0,xp:10},
  ];
  function answer(idx){
    if(!active) return;
    setSel(idx);
    if(idx==active.ans&&done.indexOf(active.id)==-1){
      var nx=xp+active.xp;
      var nd=done.concat([active.id]);
      setXp(nx);setDone(nd);
      try{localStorage.setItem("bp_xp",nx);localStorage.setItem("bp_done",JSON.stringify(nd));}catch(e){}
    }
  }
  var level=xp<50?"Beginner":xp<150?"Learner":xp<300?"Trader":"Expert";
  if(active) return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,padding:14,fontFamily:"Inter,Arial,sans-serif"}}>
      <button onClick={function(){setActive(null);setSel(null);}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1,marginBottom:14}}>&#8592;</button>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:20}}>
        <div style={{fontSize:11,color:G,fontWeight:700,marginBottom:8}}>{active.title} - +{active.xp} XP</div>
        <div style={{fontSize:16,fontWeight:700,color:T1,lineHeight:1.5,marginBottom:16}}>{active.q}</div>
        {active.opts.map(function(opt,i){
          var bg=sel==null?"rgba(255,255,255,0.04)":i==active.ans?"rgba(0,200,83,0.2)":i==sel?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.04)";
          var bd=sel==null?BD:i==active.ans?G:i==sel?"#EF4444":BD;
          return <button key={i} onClick={function(){answer(i);}} disabled={sel!=null} style={{width:"100%",background:bg,border:"1px solid "+bd,borderRadius:12,padding:"12px 14px",marginBottom:8,textAlign:"left",cursor:sel!=null?"default":"pointer",fontFamily:"inherit",fontSize:12,color:T1}}>{opt}</button>;
        })}
        {sel!=null?<div style={{textAlign:"center",padding:"10px 0",fontSize:14,fontWeight:700,color:sel==active.ans?G2:"#EF4444"}}>{sel==active.ans?"Correct! +"+active.xp+" XP":"Wrong! Study and retry"}</div>:null}
      </div>
    </div>
  );
  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,padding:14,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#0F1629,#1A2A1A)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:16,padding:16,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:9,color:T2}}>Level</div><div style={{fontSize:22,fontWeight:900,color:G2}}>{level}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:9,color:T2}}>XP</div><div style={{fontSize:28,fontWeight:900,color:GOLD}}>{xp}</div></div>
      </div>
      {qs.map(function(ch){
        var isDone=done.indexOf(ch.id)!=-1;
        return(
          <div key={ch.id} style={{background:CB,border:"1px solid "+(isDone?"rgba(0,200,83,0.3)":BD),borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:isDone?"default":"pointer"}} onClick={function(){if(!isDone){setActive(ch);setSel(null);}}}>
            <div style={{width:36,height:36,borderRadius:10,background:isDone?"rgba(0,200,83,0.15)":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{isDone?"OK":"?"}</div>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:T1}}>{ch.title}</div><div style={{fontSize:9,color:T2,marginTop:2}}>{isDone?"Completed":"Tap to start"}</div></div>
            <div style={{background:isDone?"rgba(0,200,83,0.15)":"rgba(245,158,11,0.15)",borderRadius:6,padding:"3px 8px",fontSize:9,fontWeight:700,color:isDone?G2:GOLD}}>+{ch.xp} XP</div>
          </div>
        );
      })}
    </div>
  );
}

function SubScreen(props) {
  var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",G="#00C853",G2="#00E676",GOLD="#F59E0B",T1="#FFFFFF",T2="#8899BB";
  var plans=[
    {id:"monthly",name:"Monthly",price:299,color:G,features:["Unlimited AI Chat","All Breakout Alerts","AI Market Briefing","Advanced OI","No Ads"]},
    {id:"yearly",name:"Yearly",price:1999,color:GOLD,tag:"Best Value",features:["Everything in Monthly","Voice AI","Portfolio Analytics","Lifetime Price Lock"]},
  ];
  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,padding:16,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{fontSize:18,fontWeight:900,color:T1,marginBottom:4}}>Breakout Pro <span style={{color:GOLD}}>Premium</span></div>
      <div style={{fontSize:10,color:T2,marginBottom:16}}>Unlock all features for serious traders</div>
      {props.trialDays>0?<div style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:14,padding:14,marginBottom:16,textAlign:"center"}}>
        <div style={{fontSize:12,fontWeight:700,color:GOLD}}>Free Trial Active  {props.trialDays} days left</div>
      </div>:null}
      {plans.map(function(plan){
        return(
          <div key={plan.id} style={{background:CB,border:"2px solid "+plan.color,borderRadius:16,padding:16,marginBottom:12,position:"relative"}}>
            {plan.tag?<div style={{position:"absolute",top:-10,right:16,background:GOLD,color:"#000",borderRadius:20,padding:"3px 12px",fontSize:9,fontWeight:700}}>{plan.tag}</div>:null}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div><div style={{fontSize:16,fontWeight:800,color:T1}}>{plan.name}</div><div style={{fontSize:24,fontWeight:900,color:plan.color}}>Rs {plan.price}</div></div>
              <button onClick={function(){props.onUpgrade&&props.onUpgrade(plan);}} style={{background:plan.color,border:"none",borderRadius:12,padding:"10px 20px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Upgrade</button>
            </div>
            {plan.features.map(function(f){return <div key={f} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}><span style={{color:G2,fontSize:10}}>OK</span><span style={{fontSize:10,color:T2}}>{f}</span></div>;})}
          </div>
        );
      })}
    </div>
  );
}

function MoreScreen(props) {
  var DB = "#0A0E1A";
  var CB = "#0F1629";
  var BD = "#1E2D4A";
  var G = "#00C853";
  var T1 = "#FFFFFF";
  var T2 = "#8899BB";

  var sections = [
    {title:"Charts & Analysis", items:[
      {label:"Chart Engine",     id:"chart",    sub:"60fps canvas chart",       icon:"C"},
      {label:"Scalper Mode",     id:"scalper",  sub:"EMA, VWAP, CPR, RSI",     icon:"S"},
      {label:"Market Analysis",  id:"analysis", sub:"7 indicators educational", icon:"A"},
      {label:"Candle Detector",  id:"detector", sub:"12 patterns offline",      icon:"D"},
    ]},
    {title:"Market Data", items:[
      {label:"Global Markets",   id:"global",   sub:"Dow, Gold, Crude, DXY",   icon:"G"},
      {label:"Heatmap",          id:"heatmap",  sub:"NIFTY 50 color blocks",   icon:"H"},
      {label:"FII/DII",          id:"fiidii",   sub:"Institutional flows",     icon:"F"},
      {label:"Candle Library",   id:"candle",   sub:"Pattern education",       icon:"L"},
    ]},
    {title:"Tools & Learning", items:[
      {label:"Daily Quiz",       id:"quiz",     sub:"Earn XP and badges",      icon:"Q"},
      {label:"Trading Journal",  id:"journal",  sub:"Track trades and P&L",    icon:"J"},
      {label:"Tools",            id:"tools",    sub:"R:R and Position size",   icon:"T"},
      {label:"Challenges",       id:"challenges",sub:"XP and skill badges",    icon:"X"},
    ]},
    {title:"Account", items:[
      {label:"Premium",          id:"sub",      sub:"Upgrade for unlimited",   icon:"P"},
      {label:"News",             id:"news",     sub:"Market news feed",        icon:"N"},
    ]},
  ];

  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#0F1629,#1A2A1A)",padding:"16px 16px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{fontSize:20,fontWeight:900,color:T1}}>All <span style={{color:G}}>Features</span></div>
        <div style={{fontSize:9,color:T2,marginTop:2}}>Breakout Pro  Trading Intelligence Platform</div>
      </div>
      <div style={{padding:"10px 14px"}}>
        {sections.map(function(sec){
          return (
            <div key={sec.title} style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:T2,letterSpacing:1,marginBottom:8,paddingLeft:2}}>{sec.title.toUpperCase()}</div>
              <div style={{background:"#0F1629",border:"1px solid "+BD,borderRadius:14,overflow:"hidden"}}>
                {sec.items.map(function(item,i){
                  return (
                    <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",borderBottom:i<sec.items.length-1?"1px solid "+BD:"none",cursor:"pointer"}} onClick={function(){props.setTab(item.id);}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:12,fontWeight:900,color:G}}>{item.icon}</span>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:T1}}>{item.label}</div>
                        <div style={{fontSize:9,color:T2,marginTop:1}}>{item.sub}</div>
                      </div>
                      <span style={{color:"#4A5A7A",fontSize:16}}>&#8250;</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default function App() {
  function getSess(){
    try{var s=JSON.parse(localStorage.getItem("bp_sess")||"null");if(s&&s.name&&s.phone)return s;return null;}catch(e){return null;}
  }
  var saved = getSess();
  var [splash,setSplash] = useState(true);
  var [user,setUser] = useState(saved);
  var [tab,setTab] = useState("home");
  var [sidebar,setSidebar] = useState(false);
  var [nifty] = useState({ltp:22467.90,pct:1.35,up:true});
  var [sensex] = useState({ltp:73863.45,pct:1.28,up:true});
  var [bankNifty] = useState({ltp:48234.60,pct:0.86,up:true});
  var [midcap] = useState({ltp:43876.20,pct:0.74,up:true});
  var [briefing,setBriefing] = useState("");
  var [briefingLoading,setBriefingLoading] = useState(false);
  var [glTab,setGlTab] = useState("gainers");
  var [isPrem,setIsPrem] = useState(function(){
    try{var u=JSON.parse(localStorage.getItem("bp_sess")||"{}");return u.isPrem||u.isAdmin||false;}catch(e){return false;}
  });
  var trialStart = saved&&saved.trialStart?saved.trialStart:Date.now();
  var trialDays  = Math.max(0,7-Math.floor((Date.now()-trialStart)/(1000*60*60*24)));

  useEffect(function(){
    var t=setTimeout(function(){setSplash(false);},1800);
    return function(){clearTimeout(t);};
  },[]);

  // Browser back button support
  var MORE_SCREENS = ["global","heatmap","fiidii","journal","challenges","sub","tools","candle","chart","detector","analysis","scalper","quiz"];
  useEffect(function(){
    function onBack(e){
      e.preventDefault();
      if(MORE_SCREENS.indexOf(tab) != -1){
        setTab("more");
      } else if(tab != "home"){
        setTab("home");
      }
    }
    window.addEventListener("popstate", onBack);
    return function(){window.removeEventListener("popstate", onBack);};
  },[tab]);

  useEffect(function(){
    if(!document.getElementById("bp-css")){
      var el=document.createElement("style");
      el.id="bp-css";
      el.textContent="::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px}";
      document.head.appendChild(el);
    }
  },[]);

  function goTo(newTab){
    if(newTab != tab){
      window.history.pushState({tab: newTab}, "", "");
    }
    setTab(newTab);
  }

  function login(u){
    if(!u.trialStart)u.trialStart=Date.now();
    setUser(u);setIsPrem(u.isPrem||u.isAdmin||false);
    try{localStorage.setItem("bp_sess",JSON.stringify(u));}catch(e){}
  }
  function logout(){
    setUser(null);setIsPrem(false);
    try{localStorage.removeItem("bp_sess");}catch(e){}
    setSidebar(false);
  }
  function loadBriefing(){
    setBriefingLoading(true);
    var KEY="";if(typeof window!="undefined"&&window.GEMINI_KEY)KEY=window.GEMINI_KEY;
    fetch(GEMINI_URL+KEY,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:"Brief Indian stock market educational summary 80 words. Educational only. End with: Educational only. Not investment advice."}]}],generationConfig:{maxOutputTokens:200,temperature:0.7}})})
      .then(function(r){return r.json();})
      .then(function(d){setBriefing(d.candidates&&d.candidates[0]&&d.candidates[0].content?d.candidates[0].content.parts[0].text:"Check API key.");setBriefingLoading(false);})
      .catch(function(){setBriefing("Could not load. Check internet.");setBriefingLoading(false);});
  }

  var navItems=[
    {label:"Home",id:"home"},{label:"Markets",id:"markets"},
    {label:"Scanner",id:"scanner"},{label:"OI Chain",id:"oi"},
    {label:"Chart Engine",id:"chart"},{label:"Scalper Mode",id:"scalper"},
    {label:"Candle Detector",id:"detector"},{label:"Market Analysis",id:"analysis"},
    {label:"Learn",id:"learn"},{label:"AI Chat",id:"ai"},
    {label:"News",id:"news"},{label:"Quiz",id:"quiz"},{label:"More",id:"more"},
  ];

  var hp={nifty:nifty,sensex:sensex,bankNifty:bankNifty,midcap:midcap,
    stocks:STOCKS,news:NEWS,briefing:briefing,briefingLoading:briefingLoading,
    onBriefing:loadBriefing,user:user,setTab:setTab,glTab:glTab,setGlTab:setGlTab};

  function renderScreen(){
    return (
      <Suspense fallback={<Loader/>}>
        {tab=="home"     ? <HomeScreen nifty={hp.nifty} sensex={hp.sensex} bankNifty={hp.bankNifty} midcap={hp.midcap} stocks={hp.stocks} news={hp.news} briefing={hp.briefing} briefingLoading={hp.briefingLoading} onBriefing={hp.onBriefing} user={hp.user} setTab={hp.setTab} glTab={hp.glTab} setGlTab={hp.setGlTab}/> : null}
        {tab=="markets"  ? <MarketsScreen stocks={STOCKS}/> : null}
        {tab=="scanner"  ? <ScannerScreen stocks={STOCKS}/> : null}
        {tab=="learn"    ? <LearnScreen/> : null}
        {tab=="ai"       ? <AIScreen/> : null}
        {tab=="news"     ? <NewsScreen news={NEWS}/> : null}
        {tab=="candle"   ? <CandleScreen/> : null}
        {tab=="chart"    ? <ChartEngine/> : null}
        {tab=="detector" ? <CandleDetector/> : null}
        {tab=="analysis" ? <MarketAnalysis/> : null}
        {tab=="scalper"  ? <ScalperMode/> : null}
        {tab=="more"     ? <MoreScreen setTab={setTab}/> : null}
        {tab=="quiz"       ? <QuizScreen/> : null}
        {tab=="global"     ? <GlobalScreen/> : null}
        {tab=="heatmap"    ? <HeatmapScreen/> : null}
        {tab=="fiidii"     ? <FiiScreen/> : null}
        {tab=="journal"    ? <JournalScreen/> : null}
        {tab=="challenges" ? <ChallengesScreen/> : null}
        {tab=="sub"        ? <SubScreen isPrem={isPrem} trialDays={trialDays} onUpgrade={upgrade}/> : null}
        {tab=="oi"       ? <div style={{background:"#0B0B0B",minHeight:"100%",padding:20,color:"#fff",paddingBottom:80}}><div style={{fontSize:14,fontWeight:700,marginBottom:10}}>OI Chain</div><div style={{fontSize:10,color:"#666"}}>Coming soon  Live NIFTY Options Chain</div></div> : null}
        {tab=="tools"    ? <div style={{background:"#F8F9FA",minHeight:"100%",padding:20,paddingBottom:80}}><div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Tools</div><div style={{fontSize:10,color:"#6B7280",marginTop:4}}>R:R Calculator, Position Size coming soon</div></div> : null}
        {tab!="home"&&tab!="markets"&&tab!="scanner"&&tab!="learn"&&tab!="ai"&&tab!="news"&&tab!="candle"&&tab!="chart"&&tab!="detector"&&tab!="analysis"&&tab!="scalper"&&tab!="more"&&tab!="oi"&&tab!="tools"&&tab!="quiz" ? <MoreScreen setTab={setTab}/> : null}
      </Suspense>
    );
  }

  if(splash) return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#0B0B0B",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:72,height:72,borderRadius:20,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 6px 24px rgba(0,200,83,0.4)"}}>
          <span style={{fontFamily:"Arial",fontSize:22,fontWeight:900,color:"#fff"}}>BP</span>
        </div>
        <div style={{fontSize:28,fontWeight:900,color:"#fff",letterSpacing:-1}}>Breakout<span style={{color:G}}> Pro</span></div>
        <div style={{fontSize:8,color:"#F97316",fontWeight:800,letterSpacing:2,marginTop:4}}>CATCH EVERY BREAKOUT</div>
        <div style={{width:200,height:3,background:"#1A2A1A",borderRadius:3,margin:"20px auto 0",overflow:"hidden"}}>
          <div style={{height:"100%",width:"70%",background:G,borderRadius:3}}></div>
        </div>
      </div>
    </div>
  );

  if(!user) return <AuthScreen onLogin={login}/>;

  return (
    <div style={{position:"relative",width:"100%",maxWidth:430,margin:"0 auto",height:"100vh",overflow:"hidden",fontFamily:"Inter,Arial,sans-serif",background:"#F8F9FA"}}>
      <div style={{height:"100vh",overflowY:"auto"}}>
        <TopBar isPrem={isPrem} trialDays={trialDays} onMenu={function(){setSidebar(true);}} onSub={function(){setTab("sub");}}/>
        {renderScreen()}
      </div>
      <TabBar tab={tab} setTab={goTo}/>
      {sidebar?(
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,zIndex:200,display:"flex"}}>
          <div style={{width:260,background:"#fff",borderRight:"1px solid #E5E7EB",display:"flex",flexDirection:"column",boxShadow:"4px 0 24px rgba(0,0,0,0.1)"}}>
            <div style={{padding:"20px 16px",borderBottom:"1px solid #F0F0F0"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#fff"}}>{user.name[0].toUpperCase()}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:"#111827"}}>{user.name}</div>
                  <div style={{fontSize:9,color:"#9CA3AF"}}>{user.phone}</div>
                </div>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
              {navItems.map(function(item){
                var act=tab==item.id;
                return (
                  <button key={item.id} style={{width:"100%",background:act?"#F0FDF4":"none",border:"none",borderLeft:act?"3px solid "+G:"3px solid transparent",padding:"11px 16px",display:"flex",alignItems:"center",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}} onClick={function(){setTab(item.id);setSidebar(false);}}>
                    <span style={{fontSize:13,fontWeight:act?700:500,color:act?G:"#374151"}}>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div style={{padding:"16px",borderTop:"1px solid #F0F0F0"}}>
              <div style={{fontSize:7,color:"#9CA3AF",marginBottom:10,lineHeight:1.6}}>! {DISCLAIMER}</div>
              <button style={{width:"100%",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"11px",color:"#DC2626",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={logout}>Logout</button>
            </div>
          </div>
          <div style={{flex:1,background:"rgba(0,0,0,0.3)"}} onClick={function(){setSidebar(false);}}></div>
        </div>
      ):null}
    </div>
  );
}
