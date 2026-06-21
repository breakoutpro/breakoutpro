import { useState, useEffect, lazy, Suspense } from "react";
import { G, DISCLAIMER, GEMINI_URL } from "./utils/helpers";
import { STOCKS } from "./data/stocks";
import { NEWS } from "./data/news";
import { useLiveNews } from "./hooks/useLiveNews";
import useWatchlistAlerts from "./hooks/useWatchlistAlerts";
import PatternAlertBanner from "./components/PatternAlertBanner";
import { SUB_PLANS } from "./data/globals";
import TopBar from "./components/TopBar";
import TabBar from "./components/TabBar";
import AlertBanner from "./components/AlertBanner";
import { ToolsScreen, JournalScreen, ChallengesScreen, SubScreen } from "./screens/InlineScreens";

// Direct imports for core screens (faster - no lazy delay)
import HomeScreen   from "./screens/Home";
import MarketsScreen from "./screens/Markets";
import ScannerScreen from "./screens/Scanner";
var ScanScreen = lazy(function(){ return import("./screens/ScanScreen"); });
import AIScreen     from "./screens/AI";
import LearnScreen  from "./screens/Learn";
import NewsScreen   from "./screens/News";
import ErrorBoundary from "./components/ErrorBoundary";
var OIChain = lazy(function(){ return import("./screens/OIChain"); });
var AlertsScreen = lazy(function(){ return import("./screens/Alerts"); });
var SettingsScreen = lazy(function(){ return import("./screens/Settings"); });
var AIBriefing = lazy(function(){ return import("./screens/AIBriefing"); });
var AdminShare = lazy(function(){ return import("./screens/AdminShare"); });
var MorningPulse = lazy(function(){ return import("./screens/MorningPulse"); });
var WatchlistScreen = lazy(function(){ return import("./screens/Watchlist"); });
var ChartPatterns = lazy(function(){ return import("./screens/ChartPatterns"); });
var PaperTrading = lazy(function(){ return import("./screens/PaperTrading"); });

// Lazy load for heavy/less-used screens
var CandleScreen   = lazy(function(){ return import("./screens/CandleScreen"); });
var ChartEngine    = lazy(function(){ return import("./screens/Chart"); });
var CandleDetector = lazy(function(){ return import("./screens/CandleDetector"); });
var MarketAnalysis = lazy(function(){ return import("./screens/MarketAnalysis"); });
var ScalperMode    = lazy(function(){ return import("./screens/ScalperMode"); });
var QuizScreen     = lazy(function(){ return import("./screens/QuizScreen"); });
var CommodityScreen = lazy(function(){ return import("./screens/CommodityHome"); });
var PortfolioReview = lazy(function(){ return import("./screens/PortfolioReview"); });
var VoiceAssistant  = lazy(function(){ return import("./screens/VoiceAssistant"); });
var Backtesting     = lazy(function(){ return import("./screens/Backtesting"); });
var StrategyBuilder = lazy(function(){ return import("./screens/StrategyBuilder"); });
var Profile         = lazy(function(){ return import("./screens/Profile"); });
var ReferralSystem  = lazy(function(){ return import("./screens/ReferralSystem"); });
var DataHub         = lazy(function(){ return import("./screens/DataHub"); });

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



var GLOBAL_MKT_DATA = [
  {name:"Dow Jones",val:38654.42,chg:0.82,up:true},
  {name:"Nasdaq",val:16234.10,chg:1.24,up:true},
  {name:"S and P 500",val:5123.67,chg:0.94,up:true},
  {name:"Nikkei 225",val:38156.97,chg:-0.34,up:false},
  {name:"Hang Seng",val:17823.45,chg:-0.87,up:false},
  {name:"Crude Oil",val:82.34,chg:1.23,up:true},
  {name:"Gold",val:2312.50,chg:0.45,up:true},
  {name:"Silver",val:27.84,chg:-0.32,up:false},
  {name:"DXY",val:104.23,chg:-0.18,up:false},
  {name:"SGX Nifty",val:22510,chg:0.19,up:true},
];

var HEAT_STOCKS = [
  {sym:"RELIANCE",chg:1.71},{sym:"TCS",chg:-0.97},{sym:"HDFCBANK",chg:1.90},{sym:"ICICIBANK",chg:2.33},
  {sym:"INFY",chg:-1.40},{sym:"WIPRO",chg:2.99},{sym:"TATAMOTORS",chg:2.23},{sym:"SBIN",chg:2.18},
  {sym:"AXISBANK",chg:1.47},{sym:"BAJFINANCE",chg:1.90},{sym:"MARUTI",chg:1.07},{sym:"SUNPHARMA",chg:-0.98},
  {sym:"LT",chg:-0.95},{sym:"NTPC",chg:1.72},{sym:"ONGC",chg:2.24},{sym:"ADANIENT",chg:3.24},
];

function GlobalScreen() {
  var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",G2="#00E676",R="#EF4444",T1="#FFFFFF",T2="#8899BB";
  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,padding:14,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{fontSize:18,fontWeight:900,color:T1,marginBottom:14}}>Global <span style={{color:"#00C853"}}>Markets</span></div>
      {GLOBAL_MKT_DATA.map(function(m){
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
  var DB="#0A0E1A",G2="#00E676",R="#EF4444",T1="#FFFFFF";
  function col(chg){if(chg>=3)return{bg:"#00C853",tx:"#fff"};if(chg>=1.5)return{bg:"#4CAF50",tx:"#fff"};if(chg>=0)return{bg:"#1A3A1A",tx:G2};if(chg>=-1.5)return{bg:"#3A1A1A",tx:R};return{bg:R,tx:"#fff"};}
  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{padding:"14px 14px 8px",fontSize:16,fontWeight:900,color:T1}}>NIFTY 50 <span style={{color:"#00C853"}}>Heatmap</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,padding:"0 14px 14px"}}>
        {HEAT_STOCKS.map(function(s){var c2=col(s.chg);return(<div key={s.sym} style={{background:c2.bg,borderRadius:8,padding:"10px 4px",textAlign:"center"}}><div style={{fontSize:8,fontWeight:700,color:c2.tx}}>{s.sym}</div><div style={{fontSize:9,fontWeight:800,color:c2.tx,marginTop:2}}>{s.chg>0?"+":""}{s.chg.toFixed(1)}%</div></div>);})}
      </div>
    </div>
  );
}

function FiiScreen() {
  var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",G2="#00E676",R="#EF4444",T1="#FFFFFF",T2="#8899BB";
  var daily=[{date:"Jun 12",fii:2340,dii:-890},{date:"Jun 11",fii:-1230,dii:1560},{date:"Jun 10",fii:3450,dii:-230},{date:"Jun 07",fii:-890,dii:2340}];
  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,padding:14,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{fontSize:18,fontWeight:900,color:T1,marginBottom:14}}>FII / <span style={{color:"#00C853"}}>DII</span></div>
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
        {daily.map(function(d){var net=d.fii+d.dii;return(
          <div key={d.date} style={{display:"flex",alignItems:"center",padding:"9px 0",borderBottom:"1px solid "+BD}}>
            <div style={{fontSize:10,color:T2,width:50}}>{d.date}</div>
            <div style={{flex:1,display:"flex",gap:10}}>
              <span style={{fontSize:9,color:G2,fontWeight:600}}>FII:{d.fii>0?"+":""}{d.fii}</span>
              <span style={{fontSize:9,color:R,fontWeight:600}}>DII:{d.dii>0?"+":""}{d.dii}</span>
            </div>
            <div style={{fontSize:10,fontWeight:700,color:net>=0?G2:R}}>{net>=0?"+":""}{net}</div>
          </div>
        );})}
      </div>
    </div>
  );
}

function MoreScreen(props) {
  var DB = "#0A0E1A";
  var CB = "#0F1629";
  var BD = "#1E2D4A";
  var BLUE = "#3B82F6";
  var BLUE2 = "#60A5FA";
  var T1 = "#FFFFFF";
  var T2 = "#8899BB";
  var T3 = "#475569";
  var GOLD = "#F59E0B";
  var UP = "#22C55E";
  var PURPLE = "#8B5CF6";

  var ICONS = {
    portfolio:  "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 3h18v18H3z'/><path d='M3 9h18'/><path d='M9 21V9'/></svg>",
    strategy:   "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='6' cy='6' r='3'/><circle cx='6' cy='18' r='3'/><path d='M20 4L8.12 15.88'/><path d='M14.47 14.48L20 20'/><path d='M8.12 8.12L12 12'/></svg>",
    profile:    "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>",
    referral:   "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/></svg>",
    datahub:    "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='3' width='7' height='9' rx='1'/><rect x='14' y='3' width='7' height='5' rx='1'/><rect x='14' y='12' width='7' height='9' rx='1'/><rect x='3' y='16' width='7' height='5' rx='1'/></svg>",
    paper:      "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='2' y='5' width='20' height='14' rx='2'/><line x1='2' y1='10' x2='22' y2='10'/></svg>",
    journal:    "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/><path d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/></svg>",
    tools:      "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'/></svg>",
    quiz:       "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='8' r='6'/><path d='M15.477 12.89L17 22l-5-3-5 3 1.523-9.11'/></svg>",
    challenges: "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='22 12 16 12 14 15 10 15 8 12 2 12'/><path d='M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'/></svg>",
    watchlist:  "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'/></svg>",
    settings:   "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='3'/><path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'/></svg>",
    morning:    "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='5'/><line x1='12' y1='1' x2='12' y2='3'/><line x1='12' y1='21' x2='12' y2='23'/><line x1='4.22' y1='4.22' x2='5.64' y2='5.64'/><line x1='18.36' y1='18.36' x2='19.78' y2='19.78'/><line x1='1' y1='12' x2='3' y2='12'/><line x1='21' y1='12' x2='23' y2='12'/><line x1='4.22' y1='19.78' x2='5.64' y2='18.36'/><line x1='18.36' y1='5.64' x2='19.78' y2='4.22'/></svg>",
    share:      "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/><line x1='8.59' y1='13.51' x2='15.42' y2='17.49'/><line x1='15.41' y1='6.51' x2='8.59' y2='10.49'/></svg>",
    sub:        "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/></svg>",
    news:       "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2'/><path d='M18 14h-8'/><path d='M15 18h-5'/><path d='M10 6h8v4h-8V6z'/></svg>",
  };

  var sections = [
    {title:"Practice & Learning", col:UP, items:[
      {id:"portfolio",  label:"AI Portfolio Review",  sub:"AI analyzes your holdings (educational)", col:PURPLE},
      {id:"paper",      label:"Paper Trading",         sub:"Virtual Rs 5L  practice free",           col:UP    },
      {id:"quiz",       label:"Daily Quiz",            sub:"Earn XP and badges",                      col:GOLD  },
      {id:"challenges", label:"Challenges",            sub:"Skill milestones and XP rewards",         col:PURPLE},
      {id:"watchlist",  label:"My Watchlist",          sub:"Track favorite stocks",                   col:BLUE  },
    ]},
    {title:"Tools & Calculators", col:BLUE, items:[
      {id:"datahub",  label:"Data Hub",             sub:"100+ data points, 15 categories",     col:GOLD  },
      {id:"voice",    label:"AI Voice Assistant",  sub:"Ask market questions by voice",       col:PURPLE},
      {id:"backtest", label:"Backtesting",          sub:"Test strategies on historical data",  col:BLUE  },
      {id:"strategy", label:"Strategy Builder",     sub:"Create custom buy/sell rules",        col:"#06B6D4"},
      {id:"journal",  label:"Trading Journal",      sub:"Track trades and P&L history",        col:BLUE2 },
      {id:"tools",    label:"Risk Calculator",      sub:"R:R ratio, position size, Greeks",    col:"#F97316"},
    ]},
    {title:"Account & Settings", col:GOLD, items:[
      {id:"profile",    label:"Profile",            sub:"Personal info, KYC, preferences",    col:BLUE2 },
      {id:"morning",    label:"Morning Pulse",      sub:"AI overnight + market briefing",     col:GOLD  },
      {id:"news",       label:"Market News",        sub:"Live news feed from ET Markets",     col:"#60A5FA"},
      {id:"settings",   label:"Settings",           sub:"Alerts, notifications, preferences", col:T2    },
      {id:"referral",   label:"Refer & Earn",       sub:"Invite friends, unlock Premium",     col:UP    },
      {id:"share",      label:"Share Posters",      sub:"Create shareable market posters",    col:PURPLE},
      {id:"sub",        label:"Go Premium",         sub:"Unlock unlimited features",          col:GOLD  },
    ]},
  ];

  return (
    <div style={{background:DB,minHeight:"100vh",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#0F1629,#0A1525)",padding:"20px 16px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{fontSize:22,fontWeight:900,color:T1}}>More <span style={{color:BLUE2}}>Features</span></div>
        <div style={{fontSize:11,color:T2,marginTop:3}}>Tools, practice, account settings</div>
      </div>
      <div style={{padding:"12px 14px"}}>
        {sections.map(function(sec){
          return (
            <div key={sec.title} style={{marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,color:T3,letterSpacing:1,marginBottom:10,paddingLeft:2}}>{sec.title.toUpperCase()}</div>
              <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.25)"}}>
                {sec.items.map(function(item,i){
                  return (
                    <div key={item.id} onClick={function(){props.setTab(item.id);}} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 14px",borderBottom:i<sec.items.length-1?"1px solid rgba(30,42,77,0.6)":"none",cursor:"pointer"}}>
                      <div style={{width:40,height:40,borderRadius:12,background:item.col+"18",border:"1px solid "+item.col+"44",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:item.col}} dangerouslySetInnerHTML={{__html:ICONS[item.id]||ICONS.tools}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:T1}}>{item.label}</div>
                        <div style={{fontSize:10,color:T2,marginTop:2}}>{item.sub}</div>
                      </div>
                      <span style={{color:T3,fontSize:18}}>&#8250;</span>
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
  var liveNewsData = useLiveNews();
  var watchlistAlerts = useWatchlistAlerts();
  var LIVE_NEWS = liveNewsData.news.length > 0 ? liveNewsData.news : NEWS;
  function getSess(){
    try{var s=JSON.parse(localStorage.getItem("bp_sess")||"null");if(s&&s.name&&s.phone)return s;return null;}catch(e){return null;}
  }
  var saved = getSess();
  var [splash,setSplash] = useState(true);
  var [user,setUser] = useState(saved);
  var [tab,setTab] = useState("home");
  var [notifAsked,setNotifAsked] = useState(false);
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
  var isAdmin = (user&&user.isAdmin) || false;
  var trialStart = saved&&saved.trialStart?saved.trialStart:Date.now();
  var trialDays  = Math.max(0,7-Math.floor((Date.now()-trialStart)/(1000*60*60*24)));

  useEffect(function(){
    var t=setTimeout(function(){setSplash(false);},1800);
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(function(){});
    }
    // Inject CSS animations
    if (!document.getElementById("bp-global-css")) {
      var el = document.createElement("style");
      el.id = "bp-global-css";
      el.textContent = "@keyframes slideDown{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}} @keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}} body{background:#07111F!important;} * {-webkit-tap-highlight-color:transparent;} input,select,textarea{background:rgba(16,27,46,0.9)!important;color:#fff!important;border-color:#1E3A5F!important;} ::-webkit-scrollbar{width:2px;height:2px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:10px}";
      document.head.appendChild(el);
    }
    return function(){clearTimeout(t);};
  },[]);

  // Browser back button support
  var MORE_SCREENS = ["global","heatmap","fiidii","journal","challenges","sub","tools","candle","chart","detector","analysis","scalper","quiz","briefing","oi","alerts","settings","patterns","paper","share","morning","watchlist"];
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
  function upgrade(plan){
    var nu=Object.assign({},user,{isPrem:true,plan:plan.id});
    setIsPrem(true);setUser(nu);
    try{localStorage.setItem("bp_sess",JSON.stringify(nu));}catch(e){}
    setTab("home");
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
    stocks:STOCKS,news:LIVE_NEWS,briefing:briefing,briefingLoading:briefingLoading,
    onBriefing:loadBriefing,user:user,setTab:setTab,glTab:glTab,setGlTab:setGlTab};

  var KNOWN_TABS = ["home","markets","scan","scanner","learn","ai","briefing","alerts","settings","share","morning","commodity","watchlist","patterns","paper","news","candle","chart","detector","analysis","scalper","more","quiz","global","heatmap","fiidii","journal","challenges","sub","oi","tools","breakdown","volspike","gap","rsiscan","macdscan","supertrend","orb","mf","portfolio","voice","backtest","strategy","profile","referral","datahub"];

  function renderScreen(){
    return (
      <ErrorBoundary key={tab}>
      <Suspense fallback={<Loader/>}>
        <AlertBanner/>
        {tab=="home"     ? <HomeScreen nifty={hp.nifty} sensex={hp.sensex} bankNifty={hp.bankNifty} midcap={hp.midcap} stocks={hp.stocks} news={hp.news} briefing={hp.briefing} briefingLoading={hp.briefingLoading} onBriefing={hp.onBriefing} user={hp.user} setTab={hp.setTab} glTab={hp.glTab} setGlTab={hp.setGlTab}/> : null}
        {tab=="markets"  ? <MarketsScreen stocks={STOCKS}/> : null}
        {tab=="scan"     ? <ScanScreen setTab={setTab}/> : null}
        {tab=="portfolio"? <PortfolioReview setTab={setTab} onBack={function(){setTab("more");}} /> : null}
        {tab=="voice"    ? <VoiceAssistant  setTab={setTab} onBack={function(){setTab("more");}} /> : null}
        {tab=="backtest" ? <Backtesting     setTab={setTab} onBack={function(){setTab("more");}} /> : null}
        {tab=="strategy" ? <StrategyBuilder setTab={setTab} onBack={function(){setTab("more");}} /> : null}
        {tab=="profile"  ? <Profile setTab={setTab} user={user} isPrem={isPrem} onBack={function(){setTab("more");}} /> : null}
        {tab=="referral" ? <ReferralSystem setTab={setTab} user={user} onBack={function(){setTab("more");}} /> : null}
        {tab=="datahub"  ? <DataHub setTab={setTab} onBack={function(){setTab("home");}} /> : null}
        {tab=="scanner"  ? <ScannerScreen stocks={STOCKS}/> : null}
        {tab=="learn"    ? <LearnScreen/> : null}
        {tab=="ai"       ? <AIScreen/> : null}
        {tab=="briefing" ? <AIBriefing/> : null}
        {tab=="alerts"   ? <AlertsScreen setTab={setTab}/> : null}
        {tab=="settings"  ? <SettingsScreen user={user} isPrem={isPrem} isAdmin={isAdmin} setTab={setTab} onLogout={logout}/> : null}
        {tab=="share"     ? <AdminShare isAdmin={isAdmin} setTab={setTab}/> : null}
        {tab=="morning"   ? <MorningPulse/> : null}
        {tab=="commodity" ? <CommodityScreen setTab={setTab}/> : null}
        {tab=="watchlist" ? <WatchlistScreen setTab={setTab}/> : null}
        {tab=="patterns"  ? <ChartPatterns/> : null}
        {tab=="paper"     ? <PaperTrading isPrem={isPrem} setTab={setTab}/> : null}
        {tab=="news"     ? <NewsScreen news={LIVE_NEWS} overnightNews={liveNewsData.overnightNews} isAdmin={isAdmin} setTab={setTab}/> : null}
        {tab=="candle"   ? <CandleScreen setTab={setTab}/> : null}
        {tab=="chart"    ? <ChartEngine/> : null}
        {tab=="detector" ? <CandleDetector setTab={setTab}/> : null}
        {tab=="analysis" ? <MarketAnalysis/> : null}
        {tab=="scalper"  ? <ScalperMode setTab={setTab}/> : null}
        {tab=="more"     ? <MoreScreen setTab={setTab}/> : null}
        {tab=="quiz"       ? <QuizScreen setTab={setTab}/> : null}
        {tab=="global"     ? <GlobalScreen/> : null}
        {tab=="heatmap"    ? <HeatmapScreen/> : null}
        {tab=="fiidii"     ? <FiiScreen/> : null}
        {tab=="journal"    ? <JournalScreen/> : null}
        {tab=="challenges" ? <ChallengesScreen/> : null}
        {tab=="sub"        ? <SubScreen isPrem={isPrem} trialDays={trialDays} onUpgrade={upgrade}/> : null}
        {tab=="oi"       ? <OIChain/> : null}
        {tab=="tools"    ? <ToolsScreen/> : null}
        {KNOWN_TABS.indexOf(tab)==-1 ? <MoreScreen setTab={setTab}/> : null}
      </Suspense>
      </ErrorBoundary>
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
        <PatternAlertBanner alert={watchlistAlerts.latestAlert} onDismiss={watchlistAlerts.clearLatest} onView={function(){watchlistAlerts.clearLatest();setTab("watchlist");}}/>
        {renderScreen()}
      </div>
      {!notifAsked && typeof Notification != "undefined" && Notification.permission == "default" ? (
        <div style={{position:"fixed",bottom:65,left:0,right:0,zIndex:998,padding:"0 14px"}}>
          <div style={{background:"linear-gradient(135deg,#0F1629,#1A2A1A)",border:"1px solid rgba(0,200,83,0.3)",borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 -4px 20px rgba(0,0,0,0.5)"}}>
            <div style={{fontSize:20}}>&#128276;</div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:"#fff",marginBottom:2}}>Enable Alert Notifications</div>
              <div style={{fontSize:9,color:"#8899BB"}}>Get breakout & pattern alerts on your phone</div>
            </div>
            <button onClick={function(){
              setNotifAsked(true);
              if (typeof Notification != "undefined") {
                Notification.requestPermission();
              }
            }} style={{background:"#00C853",border:"none",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>Enable</button>
            <button onClick={function(){setNotifAsked(true);}} style={{background:"none",border:"none",color:"#4A5A7A",fontSize:14,cursor:"pointer",padding:4}}>X</button>
          </div>
        </div>
      ) : null}
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
