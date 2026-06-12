import { useState, useEffect, lazy, Suspense } from "react";
import { G, DISCLAIMER, GEMINI_URL } from "./utils/helpers";
import { STOCKS } from "./data/stocks";
import { NEWS } from "./data/news";
import { SUB_PLANS } from "./data/globals";
import TopBar from "./components/TopBar";
import TabBar from "./components/TabBar";

// Lazy load all screens
var HomeScreen     = lazy(function(){ return import("./screens/Home"); });
var MarketsScreen  = lazy(function(){ return import("./screens/Markets"); });
var ScannerScreen  = lazy(function(){ return import("./screens/Scanner"); });
var AIScreen       = lazy(function(){ return import("./screens/AI"); });
var LearnScreen    = lazy(function(){ return import("./screens/Learn"); });
var NewsScreen     = lazy(function(){ return import("./screens/News"); });
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

function MoreScreen(props) {
  var items=[
    {label:"Chart Engine",      id:"chart",    sub:"60fps canvas chart"},
    {label:"Candle Detector",   id:"detector", sub:"12 patterns offline"},
    {label:"Scalper Mode",      id:"scalper",  sub:"EMA, VWAP, CPR, RSI"},
    {label:"Market Analysis",   id:"analysis", sub:"7 indicators educational"},
    {label:"Candle Library",    id:"candle",   sub:"Pattern education"},
    {label:"Global Markets",    id:"global",   sub:"Dow, Gold, Crude"},
    {label:"Heatmap",           id:"heatmap",  sub:"NIFTY 50 color blocks"},
    {label:"FII/DII",           id:"fiidii",   sub:"Institutional flows"},
    {label:"Journal",           id:"journal",  sub:"Track trades and P&L"},
    {label:"Challenges",        id:"challenges",sub:"Quiz and XP badges"},
    {label:"Premium",           id:"sub",      sub:"Upgrade for unlimited"},
    {label:"Daily Quiz",        id:"quiz",     sub:"Earn XP and badges"},
    {label:"Tools",             id:"tools",    sub:"R:R and Position size"},
  ];
  return (
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14}}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>All Features</div>
      {items.map(function(item){
        return (
          <div key={item.id} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}} onClick={function(){props.setTab(item.id);}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"#111827"}}>{item.label}</div>
              <div style={{fontSize:9,color:"#6B7280",marginTop:1}}>{item.sub}</div>
            </div>
            <span style={{color:"#9CA3AF",fontSize:16}}>&#8250;</span>
          </div>
        );
      })}
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

  useEffect(function(){
    if(!document.getElementById("bp-css")){
      var el=document.createElement("style");
      el.id="bp-css";
      el.textContent="::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px}";
      document.head.appendChild(el);
    }
  },[]);

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
        {tab=="quiz"     ? <QuizScreen/> : null}
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
      <TabBar tab={tab} setTab={setTab}/>
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
