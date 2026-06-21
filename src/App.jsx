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
      {id:"watchlist",
