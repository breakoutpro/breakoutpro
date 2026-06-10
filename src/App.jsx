import { useState, useEffect, useRef } from "react";

var G = "#00C853";
var R = "#EF4444";
var GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";
var DISCLAIMER = "Educational only. Not SEBI registered. Not investment advice.";

var STOCKS = [
  {sym:"RELIANCE",name:"Reliance Industries",ltp:2845.60,open:2798,chgPct:1.71,up:true,sect:"Energy",vol:"12.4M"},
  {sym:"TCS",name:"Tata Consultancy",ltp:3654.20,open:3690,chgPct:-0.97,up:false,sect:"IT",vol:"3.2M"},
  {sym:"HDFCBANK",name:"HDFC Bank",ltp:1742.50,open:1710,chgPct:1.90,up:true,sect:"Bank",vol:"8.7M"},
  {sym:"ICICIBANK",name:"ICICI Bank",ltp:1289.30,open:1260,chgPct:2.33,up:true,sect:"Bank",vol:"7.1M"},
  {sym:"INFY",name:"Infosys",ltp:1567.80,open:1590,chgPct:-1.40,up:false,sect:"IT",vol:"5.4M"},
  {sym:"WIPRO",name:"Wipro",ltp:478.90,open:465,chgPct:2.99,up:true,sect:"IT",vol:"9.2M"},
  {sym:"TATAMOTORS",name:"Tata Motors",ltp:945.60,open:925,chgPct:2.23,up:true,sect:"Auto",vol:"11.3M"},
  {sym:"MARUTI",name:"Maruti Suzuki",ltp:13240,open:13100,chgPct:1.07,up:true,sect:"Auto",vol:"1.2M"},
  {sym:"SUNPHARMA",name:"Sun Pharma",ltp:1678.40,open:1695,chgPct:-0.98,up:false,sect:"Pharma",vol:"4.5M"},
  {sym:"BAJFINANCE",name:"Bajaj Finance",ltp:7234.50,open:7100,chgPct:1.90,up:true,sect:"NBFC",vol:"2.8M"},
  {sym:"SBIN",name:"State Bank of India",ltp:812.30,open:795,chgPct:2.18,up:true,sect:"Bank",vol:"15.2M"},
  {sym:"AXISBANK",name:"Axis Bank",ltp:1156.70,open:1140,chgPct:1.47,up:true,sect:"Bank",vol:"6.3M"},
];

var SECTORS = [
  {name:"IT",chg:1.82},{name:"Bank",chg:1.24},{name:"Auto",chg:0.94},
  {name:"Pharma",chg:-0.32},{name:"Energy",chg:1.35},{name:"Metal",chg:3.24},
  {name:"FMCG",chg:0.18},{name:"Realty",chg:2.10},{name:"Infra",chg:0.76},
];

var NEWS = [
  {title:"RBI holds rates steady at 6.5%, signals neutral stance",time:"2h ago",cat:"Policy",up:true},
  {title:"NIFTY crosses 22,500 on strong FII inflows of Rs 4,200 Cr",time:"3h ago",cat:"Markets",up:true},
  {title:"Q4 results: IT sector beats estimates by 8%",time:"4h ago",cat:"Results",up:true},
  {title:"Crude oil rises 2.3% on OPEC supply cut",time:"5h ago",cat:"Global",up:false},
  {title:"SEBI proposes new F and O margin rules effective July",time:"6h ago",cat:"SEBI",up:false},
];

var CANDLES = [
  {name:"Bullish Engulfing",type:"Bullish",desc:"Large green candle engulfs previous red candle. Strong reversal at support."},
  {name:"Bearish Engulfing",type:"Bearish",desc:"Large red candle engulfs previous green candle. Strong reversal at resistance."},
  {name:"Doji",type:"Neutral",desc:"Open and close nearly equal. Shows indecision. Powerful at key levels."},
  {name:"Hammer",type:"Bullish",desc:"Small body, long lower wick at bottom of downtrend. Bulls rejected selling."},
  {name:"Shooting Star",type:"Bearish",desc:"Small body, long upper wick at top of uptrend. Bears rejected buying."},
  {name:"Morning Star",type:"Bullish",desc:"3-candle: red, doji, green. Strong reversal at support."},
];

var AI_KB = {
  "what is nifty":"NIFTY 50 is an index of 50 large-cap stocks on NSE. Represents 65% of total market cap. Used as benchmark for Indian equity markets.",
  "what is oi":"Open Interest = total outstanding contracts. Rising OI + rising price = Long Buildup (bullish). Rising OI + falling price = Short Buildup (bearish).",
  "what is pcr":"Put-Call Ratio = Put OI / Call OI. PCR below 0.7 = Bullish. PCR above 1.3 = Bearish.",
  "what is vwap":"VWAP = Volume Weighted Average Price. Price above VWAP = bullish intraday bias. Institutions use as benchmark.",
  "what is rsi":"RSI (0-100). Above 70 = Overbought. Below 30 = Oversold. Best used with support/resistance levels.",
  "what is macd":"MACD = Moving Average Convergence Divergence. Signal line crossover = trend change.",
  "what is max pain":"Strike price where options buyers lose maximum at expiry. Stocks gravitate towards max pain near expiry.",
  "what is delta":"Delta = option price change per Re 1 move. Call delta 0 to 1. Put delta 0 to -1.",
  "what is theta":"Theta = time decay. Options lose value daily. Highest for ATM options near expiry.",
  "explain breakout":"Breakout = price breaking above resistance with high volume. Wait for candle close. Confirm with 1.5x average volume.",
  "what is support":"Support = price level where buyers prevent further fall. Break of support with volume = bearish signal.",
};

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

var SUB_PLANS = [
  {id:"monthly",name:"Monthly",price:299,tag:"Most Popular",color:"#00C853",
   features:["Unlimited AI Chat","All Breakout Alerts","AI Market Briefing","Advanced OI","Premium Education","No Ads"]},
  {id:"quarterly",name:"Quarterly",price:799,tag:"Save 11%",color:"#8B5CF6",
   features:["Everything in Monthly","Priority Support","Strategy Builder Pro"]},
  {id:"yearly",name:"Yearly",price:1999,tag:"Best Value 44% off",color:"#3B82F6",
   features:["Everything in Quarterly","Voice AI","Portfolio Analytics","Lifetime Price Lock"]},
];

var LESSONS = [
  "Support becomes resistance once broken. Watch for retests on the way back down.",
  "Never risk more than 1-2% of capital on a single trade. Protect your account.",
  "Volume confirms price moves. Breakout without volume = false breakout.",
  "VWAP is the most important intraday level. Price above VWAP = bullish bias.",
  "In options, time decay (Theta) works against buyers every single day.",
];

function nowT(){return new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});}
function fN(n){var num=parseFloat(n)||0;if(num>=10000000)return(num/10000000).toFixed(2)+"Cr";if(num>=100000)return(num/100000).toFixed(2)+"L";if(num>=1000)return(num/1000).toFixed(1)+"K";return num.toFixed(2);}
function rnd(a,b){return Math.random()*(b-a)+a;}
function sg(){return Math.random()>0.5?1:-1;}
function getMkt(){var now=new Date();var m=now.getHours()*60+now.getMinutes();if(m>=555&&m<930)return{open:true,label:"Market Open"};return{open:false,label:"Market Closed"};}
function getSpark(ltp){var a=[];for(var i=0;i<14;i++)a.push(ltp+sg()*rnd(0,ltp*0.005)*i);return a;}
function localAI(q){var ql=q.toLowerCase();var keys=Object.keys(AI_KB);for(var i=0;i<keys.length;i++){if(ql.indexOf(keys[i])!=-1)return AI_KB[keys[i]]+" --- Educational only | Not SEBI registered investment advice";}for(var j=0;j<CANDLES.length;j++){if(ql.indexOf(CANDLES[j].name.toLowerCase())!=-1)return CANDLES[j].name+" ("+CANDLES[j].type+"): "+CANDLES[j].desc;}return null;}

function Spark(props){
  var data=props.data||[],color=props.color||G,w=props.w||60,h=props.h||28;
  if(!data.length)return null;
  var min=Math.min.apply(null,data),max=Math.max.apply(null,data),range=max-min||1;
  var pts=data.map(function(v,i){return(i/(data.length-1))*w+","+(h-((v-min)/range)*h);}).join(" ");
  return React.createElement("svg",{width:w,height:h,style:{display:"block"}},React.createElement("polyline",{points:pts,fill:"none",stroke:color,strokeWidth:"1.5",strokeLinecap:"round"}));
}

function SRow(props){
  var s=props.s,spark=getSpark(s.ltp),up=s.up;
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid #F5F5F5",cursor:"pointer"}} onClick={props.onClick}>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:700,color:"#111827"}}>{s.sym}</div>
        <div style={{fontSize:8,color:"#9CA3AF",marginTop:2}}>{s.sect}</div>
      </div>
      <Spark data={spark} color={up?G:R} w={50} h={22}/>
      <div style={{textAlign:"right",minWidth:80}}>
        <div style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:"#111827"}}>Rs{fN(s.ltp)}</div>
        <div style={{background:up?"#DCFCE7":"#FEE2E2",borderRadius:6,padding:"2px 6px",fontSize:8,fontWeight:700,color:up?"#166534":"#991B1B"}}>{up?"+":""}{s.chgPct.toFixed(2)}%</div>
      </div>
    </div>
  );
}

function ICard(props){
  var d=props.d;
  return(
    <div style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:14,padding:"12px 14px",cursor:"pointer",boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}} onClick={props.onClick}>
      <div style={{fontSize:8,color:"#6B7280",fontWeight:600,marginBottom:4}}>{d.label}</div>
      <div style={{fontFamily:"monospace",fontSize:15,fontWeight:800,color:"#111827",marginBottom:3}}>{d.ltp.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
      <div style={{display:"flex",alignItems:"center",gap:3}}>
        <span style={{fontSize:9,color:d.up?G:R}}>{d.up?"^":"v"}</span>
        <span style={{fontSize:10,fontWeight:700,color:d.up?G:R}}>{d.up?"+":""}{d.pct.toFixed(2)}%</span>
      </div>
    </div>
  );
}

function AuthScreen(props){
  var [mode,setMode]=useState("login");
  var [name,setName]=useState("");
  var [phone,setPhone]=useState("");
  var [pass,setPass]=useState("");
  var [err,setErr]=useState("");
  function submit(){
    setErr("");
    if(!phone||phone.length<10){setErr("Enter valid 10-digit phone");return;}
    if(!pass||pass.length<6){setErr("Password min 6 chars");return;}
    if(phone=="8790124010"&&pass=="Suresh@2025"){props.onLogin({name:"Admin",phone:"8790124010",isAdmin:true,isPrem:true,trialStart:Date.now()});return;}
    var users={};try{users=JSON.parse(localStorage.getItem("bp_users")||"{}");}catch(e){}
    if(mode=="register"){
      if(!name){setErr("Enter your name");return;}
      users[phone]={name:name,phone:phone,pass:pass};
      try{localStorage.setItem("bp_users",JSON.stringify(users));}catch(e){}
      props.onLogin({name:name,phone:phone,trialStart:Date.now()});
    } else {
      if(!users[phone]){users[phone]={name:"Trader",phone:phone,pass:pass};try{localStorage.setItem("bp_users",JSON.stringify(users));}catch(e){}props.onLogin({name:"Trader",phone:phone,trialStart:Date.now()});return;}
      if(users[phone].pass!=pass){setErr("Wrong password");return;}
      props.onLogin(users[phone]);
    }
  }
  var inp={width:"100%",background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,padding:"11px 13px",color:"#111827",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:10};
  return(
    <div style={{background:"#F8F9FA",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#fff",padding:"32px 20px 24px",textAlign:"center",borderBottom:"1px solid #F0F0F0"}}>
        <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",boxShadow:"0 4px 14px rgba(0,200,83,0.3)"}}>
          <span style={{fontFamily:"Arial",fontSize:18,fontWeight:900,color:"#fff"}}>BP</span>
        </div>
        <div style={{fontSize:24,fontWeight:900,color:"#111827",letterSpacing:-0.5}}>Breakout<span style={{color:G}}> Pro</span></div>
        <div style={{fontSize:8,color:"#F97316",fontWeight:800,letterSpacing:2,marginTop:3}}>CATCH EVERY BREAKOUT</div>
      </div>
      <div style={{padding:"24px 20px",flex:1}}>
        <div style={{display:"flex",background:"#F3F4F6",borderRadius:12,padding:4,marginBottom:20}}>
          {[["login","Login"],["register","Register"]].map(function(kv){
            var act=mode==kv[0];
            return <button key={kv[0]} onClick={function(){setMode(kv[0]);setErr("");}} style={{flex:1,padding:"10px",borderRadius:9,border:"none",background:act?"#fff":"transparent",color:act?"#111827":"#6B7280",fontWeight:act?700:500,fontSize:12,cursor:"pointer",fontFamily:"inherit",boxShadow:act?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>{kv[1]}</button>;
          })}
        </div>
        {err?<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:11,color:"#DC2626"}}>! {err}</div>:null}
        {mode=="register"?<input style={inp} placeholder="Full Name" value={name} onChange={function(e){setName(e.target.value);}}/>:null}
        <input style={inp} placeholder="Phone (10 digits)" type="tel" maxLength={10} value={phone} onChange={function(e){setPhone(e.target.value);}}/>
        <input style={inp} placeholder="Password (min 6 chars)" type="password" value={pass} onChange={function(e){setPass(e.target.value);}}/>
        <button style={{width:"100%",background:G,border:"none",borderRadius:12,padding:"14px",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit"}} onClick={submit}>{mode=="login"?"Login":"Create Account"}</button>
        <div style={{marginTop:14,background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:"10px 12px",fontSize:8,color:"#92400E",textAlign:"center"}}>! {DISCLAIMER}</div>
      </div>
    </div>
  );
}

function TopBar(props){
  var mkt=getMkt();
  return(
    <div style={{background:"#fff",borderBottom:"1px solid #F0F0F0",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,200,83,0.3)"}}>
          <span style={{fontFamily:"Arial",fontSize:12,fontWeight:900,color:"#fff"}}>BP</span>
        </div>
        <div>
          <div style={{fontSize:16,fontWeight:900,color:"#111827",letterSpacing:-0.5}}>Breakout<span style={{color:G}}> Pro</span></div>
          <div style={{fontSize:6,color:"#F97316",fontWeight:800,letterSpacing:1.5}}>CATCH EVERY BREAKOUT</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <div style={{background:mkt.open?"#DCFCE7":"#F3F4F6",border:"1px solid "+(mkt.open?"#BBF7D0":"#E5E7EB"),borderRadius:20,padding:"3px 8px",display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:mkt.open?G:"#9CA3AF"}}></div>
          <span style={{fontSize:7,fontWeight:700,color:mkt.open?"#166534":"#6B7280"}}>{mkt.label}</span>
        </div>
        {props.isPrem?<span style={{background:"#FEF3C7",color:"#D97706",border:"1px solid #FDE68A",borderRadius:20,padding:"3px 8px",fontSize:8,fontWeight:700}}>PRO</span>:<button onClick={props.onSub} style={{background:"#FFF7ED",color:"#F97316",border:"1px solid #FED7AA",borderRadius:20,padding:"3px 8px",fontSize:7,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{props.trialDays}d Free</button>}
        <button onClick={props.onMenu} style={{background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:9,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:"#374151"}}>&#9776;</button>
      </div>
    </div>
  );
}

function TabBar(props){
  var items=[{id:"home",label:"Home"},{id:"markets",label:"Markets"},{id:"oi",label:"OI"},{id:"scanner",label:"Scan"},{id:"learn",label:"Learn"},{id:"ai",label:"AI"},{id:"more",label:"More"}];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,maxWidth:430,margin:"0 auto",background:"#fff",borderTop:"1px solid #E5E7EB",display:"flex",zIndex:100,paddingBottom:8}}>
      {items.map(function(t){
        var act=props.tab==t.id;
        return(
          <button key={t.id} style={{flex:1,background:"none",border:"none",padding:"6px 2px",cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:2}} onClick={function(){props.setTab(t.id);}}>
            <span style={{fontSize:7,fontWeight:act?700:500,color:act?G:"#9CA3AF"}}>{t.label}</span>
            {act?<div style={{width:3,height:3,borderRadius:"50%",background:G}}></div>:null}
          </button>
        );
      })}
    </div>
  );
}

function HomeScreen(props){
  var nifty=props.nifty||{ltp:22467,pct:1.35,up:true};
  var sensex=props.sensex||{ltp:73863,pct:1.28,up:true};
  var bankNifty=props.bankNifty||{ltp:48234,pct:0.86,up:true};
  var midcap=props.midcap||{ltp:43876,pct:0.74,up:true};
  var stocks=props.stocks||[],news=props.news,briefing=props.briefing,setTab=props.setTab,user=props.user;
  var glTab=props.glTab,setGlTab=props.setGlTab;
  var h2={display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8};
  var h2t={fontSize:11,fontWeight:700,color:"#111827"};
  var vab={background:"none",border:"none",color:G,fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"};
  var indices=[{label:"NIFTY 50",ltp:nifty.ltp,pct:nifty.pct,up:nifty.up},{label:"SENSEX",ltp:sensex.ltp,pct:sensex.pct,up:sensex.up},{label:"BANK NIFTY",ltp:bankNifty.ltp,pct:bankNifty.pct,up:bankNifty.up},{label:"MIDCAP",ltp:midcap.ltp,pct:midcap.pct,up:midcap.up}];
  var quick=[{label:"OI Chain",tab:"oi"},{label:"Scanner",tab:"scanner"},{label:"FII/DII",tab:"fiidii"},{label:"News",tab:"news"},{label:"Learn",tab:"learn"},{label:"AI Chat",tab:"ai"},{label:"Tools",tab:"tools"},{label:"Watchlist",tab:"watchlist"}];
  var hour=new Date().getHours();
  var greeting=hour<12?"Good Morning":hour<17?"Good Afternoon":"Good Evening";
  var sorted=(stocks||[]).slice().sort(function(a,b){return glTab=="gainers"?b.chgPct-a.chgPct:a.chgPct-b.chgPct;}).slice(0,4);
  var uname=user?user.name.split(" ")[0]:"Trader";
  return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80}}>
      <div style={{background:"#fff",padding:"12px 16px",borderBottom:"1px solid #F0F0F0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#fff"}}>{uname[0].toUpperCase()}</div>
          <div>
            <div style={{fontSize:9,color:"#9CA3AF"}}>{greeting}</div>
            <div style={{fontSize:16,color:"#111827",fontWeight:800}}>{uname}</div>
          </div>
        </div>
        <button style={{background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14}} onClick={function(){setTab("news");}}>&#128276;</button>
      </div>
      <div style={{padding:"14px 14px 0"}}>
        <div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #BBF7D0",borderRadius:16,padding:16,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:900}}>AI</div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#111827"}}>AI Market Briefing</div>
                <div style={{fontSize:8,color:"#6B7280"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"short"})}</div>
              </div>
            </div>
            <button onClick={props.onBriefing} style={{background:briefing?"transparent":G,border:briefing?"1px solid #BBF7D0":"none",borderRadius:20,padding:"6px 14px",color:briefing?"#166534":"#fff",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{props.briefingLoading?"Loading...":briefing?"Refresh":"Get Briefing"}</button>
          </div>
          {props.briefingLoading?<div style={{padding:"12px 0",textAlign:"center",fontSize:10,color:"#374151"}}>AI analyzing markets...</div>:briefing?<div style={{background:"rgba(255,255,255,0.8)",borderRadius:10,padding:10,fontSize:10,color:"#374151",lineHeight:1.7}}>{briefing}</div>:<div style={{background:"rgba(255,255,255,0.7)",borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontSize:11,color:"#374151",fontWeight:600}}>Your Daily Market Briefing</div><div style={{fontSize:9,color:"#6B7280",marginTop:3}}>Tap Get Briefing for AI analysis</div></div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {indices.map(function(d){return <ICard key={d.label} d={d} onClick={function(){setTab("markets");}}/>;  })}
        </div>
        <div style={{marginBottom:14}}>
          <div style={h2}><span style={h2t}>Quick Access</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {quick.map(function(q){return <button key={q.label} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"10px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",fontFamily:"inherit"}} onClick={function(){setTab(q.tab);}}><span style={{fontSize:8,color:"#374151",fontWeight:600,textAlign:"center"}}>{q.label}</span></button>; })}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={h2}>
            <div style={{display:"flex",background:"#F3F4F6",borderRadius:20,padding:3}}>
              {["gainers","losers"].map(function(t){var act=glTab==t;return <button key={t} style={{background:act?"#fff":"transparent",border:"none",borderRadius:17,padding:"5px 12px",color:act?"#111827":"#6B7280",fontSize:9,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit",boxShadow:act?"0 1px 4px rgba(0,0,0,0.08)":"none"}} onClick={function(){setGlTab(t);}}>{t=="gainers"?"Gainers":"Losers"}</button>; })}
            </div>
            <button style={vab} onClick={function(){setTab("markets");}}>View All</button>
          </div>
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #F0F0F0",overflow:"hidden"}}>
            {sorted.map(function(s){return <SRow key={s.sym} s={s} onClick={function(){setTab("markets");}}/>;  })}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={h2}><span style={h2t}>Sectors</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
            {SECTORS.map(function(s){var up=s.chg>=0;return <div key={s.name} style={{background:up?"#F0FDF4":"#FFF1F2",border:"1px solid "+(up?"#BBF7D0":"#FECDD3"),borderRadius:10,padding:"8px",textAlign:"center"}}><div style={{fontSize:9,fontWeight:600,color:"#374151"}}>{s.name}</div><div style={{fontSize:10,fontWeight:700,color:up?G:R,marginTop:2}}>{up?"+":""}{s.chg.toFixed(2)}%</div></div>; })}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={h2}><span style={h2t}>News</span><button style={vab} onClick={function(){setTab("news");}}>View All</button></div>
          {news.slice(0,3).map(function(n,i){return <div key={i} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"11px 13px",marginBottom:6,display:"flex",gap:10}}><div style={{background:n.up?"#DCFCE7":"#F3F4F6",borderRadius:7,padding:"3px 7px",height:"fit-content",flexShrink:0}}><span style={{fontSize:7,fontWeight:700,color:n.up?"#166534":"#6B7280"}}>{n.cat.slice(0,4)}</span></div><div style={{flex:1}}><div style={{fontSize:10,fontWeight:600,color:"#111827",lineHeight:1.4,marginBottom:2}}>{n.title}</div><div style={{fontSize:8,color:"#9CA3AF"}}>{n.time}</div></div></div>; })}
        </div>
        <div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:"9px 12px",marginBottom:6}}><div style={{fontSize:7.5,color:"#92400E"}}>! {DISCLAIMER}</div></div>
      </div>
    </div>
  );
}

function MarketsScreen(props){
  var [search,setSearch]=useState("");
  var [sort,setSort]=useState("pct");
  var filtered=(props.stocks||[]).filter(function(s){return !search||s.sym.toLowerCase().indexOf(search.toLowerCase())!=-1;}).sort(function(a,b){return sort=="pct"?b.chgPct-a.chgPct:b.ltp-a.ltp;});
  return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80}}>
      <div style={{background:"#fff",padding:"12px 14px",borderBottom:"1px solid #F0F0F0"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
          <span>&#128269;</span>
          <input style={{flex:1,background:"none",border:"none",outline:"none",fontSize:12,color:"#111827",fontFamily:"inherit"}} placeholder="Search stocks..." value={search} onChange={function(e){setSearch(e.target.value);}}/>
          {search?<button onClick={function(){setSearch("");}} style={{background:"none",border:"none",cursor:"pointer",color:"#9CA3AF"}}>X</button>:null}
        </div>
        <div style={{display:"flex",gap:6}}>
          {["pct","ltp"].map(function(s){var act=sort==s;return <button key={s} style={{background:act?G:"#F3F4F6",border:"none",borderRadius:20,padding:"4px 12px",color:act?"#fff":"#374151",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={function(){setSort(s);}}>{s=="pct"?"% Change":"Price"}</button>; })}
        </div>
      </div>
      <div style={{background:"#fff",margin:"10px 14px",borderRadius:12,border:"1px solid #F0F0F0",overflow:"hidden"}}>
        {filtered.map(function(s){return <SRow key={s.sym} s={s} onClick={function(){}}/>;  })}
      </div>
    </div>
  );
}

function ScannerScreen(props){
  var [active,setActive]=useState("breakout");
  var [results,setResults]=useState([]);
  var scans=[{id:"breakout",label:"Breakout"},{id:"breakdown",label:"Breakdown"},{id:"volume",label:"Volume"},{id:"gapup",label:"Gap Up"},{id:"gapdown",label:"Gap Down"}];
  function runScan(type){
    setActive(type);
    setResults((props.stocks||[]).filter(function(s){
      if(type=="breakout")return s.up&&s.chgPct>1.5;
      if(type=="breakdown")return !s.up&&s.chgPct<-1.5;
      if(type=="volume")return true;
      if(type=="gapup")return s.up&&s.chgPct>1;
      if(type=="gapdown")return !s.up&&s.chgPct<-1;
      return s.up;
    }));
  }
  useEffect(function(){runScan("breakout");},[]);
  return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80}}>
      <div style={{display:"flex",gap:8,overflowX:"auto",padding:"12px 14px",background:"#fff",borderBottom:"1px solid #F0F0F0"}}>
        {scans.map(function(sc){var act=active==sc.id;return <button key={sc.id} style={{background:act?G:"#F3F4F6",border:"none",borderRadius:20,padding:"6px 14px",color:act?"#fff":"#374151",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}} onClick={function(){runScan(sc.id);}}>{sc.label}</button>; })}
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontSize:10,color:"#6B7280",marginBottom:8}}>{results.length} stocks found</div>
        {results.length==0?<div style={{textAlign:"center",padding:"30px 0",color:"#9CA3AF",fontSize:12}}>No results for this scanner</div>:
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #F0F0F0",overflow:"hidden"}}>{results.map(function(s){return <SRow key={s.sym} s={s} onClick={function(){}}/>;  })}</div>}
      </div>
    </div>
  );
}

function OIScreen(){
  var rows=[{strike:22000,ce:45230,pe:12340},{strike:22100,ce:38400,pe:18900},{strike:22200,ce:67800,pe:23400},{strike:22300,ce:89200,pe:45600},{strike:22400,ce:112000,pe:67800},{strike:22500,ce:134500,pe:89000},{strike:22600,ce:78900,pe:56700}];
  var maxOI=134500;
  return(
    <div style={{background:"#0B0B0B",minHeight:"100%",paddingBottom:80,color:"#fff"}}>
      <div style={{padding:"14px",background:"#111",borderBottom:"1px solid #1E1E1E"}}><div style={{fontSize:14,fontWeight:700}}>NIFTY Options Chain</div></div>
      <div style={{padding:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
          {[["PCR","0.84","#00C853"],["Max Pain","22400","#F59E0B"],["IV","17.0%","#3B82F6"]].map(function(r){return <div key={r[0]} style={{background:"#161616",border:"1px solid #222",borderRadius:10,padding:"10px",textAlign:"center"}}><div style={{fontSize:8,color:"#555",marginBottom:4}}>{r[0]}</div><div style={{fontSize:14,fontWeight:800,color:r[2]}}>{r[1]}</div></div>; })}
        </div>
        <div style={{background:"#111",borderRadius:10,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 60px 1fr",gap:4,padding:"8px 10px",borderBottom:"1px solid #1E1E1E",fontSize:7,color:"#555",textAlign:"center"}}><span>CE OI</span><span>Strike</span><span>PE OI</span></div>
          {rows.map(function(row){var atm=row.strike==22400;return(
            <div key={row.strike} style={{padding:"8px 10px",borderBottom:"1px solid #161616",background:atm?"#1a1000":"transparent"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 60px 1fr",gap:4,alignItems:"center"}}>
                <div><div style={{height:4,background:R,borderRadius:2,width:((row.ce/maxOI)*100)+"%",marginLeft:"auto"}}></div><div style={{fontSize:8,color:"#EF4444",textAlign:"right",marginTop:2}}>{(row.ce/1000).toFixed(0)}K</div></div>
                <div style={{textAlign:"center",fontSize:10,fontWeight:700,color:atm?"#F59E0B":"#fff"}}>{row.strike}</div>
                <div><div style={{height:4,background:G,borderRadius:2,width:((row.pe/maxOI)*100)+"%"}}></div><div style={{fontSize:8,color:G,marginTop:2}}>{(row.pe/1000).toFixed(0)}K</div></div>
              </div>
            </div>
          ); })}
        </div>
      </div>
    </div>
  );
}

function LearnScreen(){
  var [sec,setSec]=useState("home");
  var pg={background:"#F8F9FA",minHeight:"100%",paddingBottom:80};
  if(sec=="candles")return(
    <div style={pg}>
      <div style={{background:"#fff",padding:"12px 14px",borderBottom:"1px solid #F0F0F0",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={function(){setSec("home");}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#374151"}}>&#8592;</button>
        <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Candlestick Patterns</div>
      </div>
      <div style={{padding:14}}>
        {CANDLES.map(function(p){var up=p.type=="Bullish";var neu=p.type=="Neutral";return(
          <div key={p.name} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px",marginBottom:8}}>
            <div style={{background:up?"#DCFCE7":neu?"#FEF3C7":"#FEE2E2",color:up?"#166534":neu?"#D97706":"#991B1B",borderRadius:6,padding:"2px 8px",fontSize:8,fontWeight:700,display:"inline-block",marginBottom:6}}>{p.type}</div>
            <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:4}}>{p.name}</div>
            <div style={{fontSize:10,color:"#6B7280",lineHeight:1.6}}>{p.desc}</div>
          </div>
        ); })}
      </div>
    </div>
  );
  var topics=[{id:"candles",title:"Candlestick Patterns",sub:"50+ patterns",bg:"#FFF7ED",bd:"#FED7AA"},{id:"oi",title:"OI and Options",sub:"PCR, Max Pain, Greeks",bg:"#F0FDF4",bd:"#BBF7D0"},{id:"strategy",title:"Trading Strategies",sub:"EMA, VWAP, Breakout",bg:"#EFF6FF",bd:"#BFDBFE"},{id:"risk",title:"Risk Management",sub:"Position size, Stop loss",bg:"#FFF1F2",bd:"#FECDD3"}];
  return(
    <div style={pg}>
      <div style={{padding:14}}>
        <div style={{fontSize:18,fontWeight:800,color:"#111827",marginBottom:16}}>Learn Trading</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {topics.map(function(t){return <div key={t.id} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:14,padding:"14px",cursor:"pointer"}} onClick={function(){setSec(t.id);}}><div style={{fontSize:11,fontWeight:700,color:"#111827",marginBottom:3}}>{t.title}</div><div style={{fontSize:8,color:"#6B7280"}}>{t.sub}</div></div>; })}
        </div>
        <div style={{background:"linear-gradient(135deg,#111827,#1F2937)",borderRadius:14,padding:14}}>
          <div style={{fontSize:10,color:G,fontWeight:700,marginBottom:6}}>Today's Lesson</div>
          <div style={{fontSize:12,color:"#fff",lineHeight:1.7}}>{LESSONS[new Date().getDay()%LESSONS.length]}</div>
        </div>
      </div>
    </div>
  );
}

function NewsScreen(props){
  return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14}}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>Market News</div>
      {props.news.map(function(n,i){return(
        <div key={i} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"14px",marginBottom:10}}>
          <div style={{background:n.up?"#DCFCE7":"#FEE2E2",display:"inline-block",borderRadius:6,padding:"2px 8px",fontSize:8,fontWeight:700,color:n.up?"#166534":"#991B1B",marginBottom:8}}>{n.cat}</div>
          <div style={{fontSize:12,fontWeight:600,color:"#111827",lineHeight:1.5,marginBottom:6}}>{n.title}</div>
          <div style={{fontSize:9,color:"#9CA3AF"}}>{n.time}</div>
        </div>
      ); })}
    </div>
  );
}

function AIScreen(){
  var [msgs,setMsgs]=useState([]);
  var [input,setInput]=useState("");
  var [loading,setLoading]=useState(false);
  var endRef=useRef(null);
  useEffect(function(){if(endRef.current)endRef.current.scrollIntoView({behavior:"smooth"});},[msgs]);
  function send(q){
    if(!q.trim()||loading)return;
    var nm=msgs.concat([{role:"user",text:q,time:nowT()}]);
    setMsgs(nm);setInput("");setLoading(true);
    var loc=localAI(q);
    if(loc){setMsgs(nm.concat([{role:"ai",text:loc,time:nowT()}]).slice(-20));setLoading(false);return;}
    var KEY="";if(typeof window!="undefined"&&window.GEMINI_KEY)KEY=window.GEMINI_KEY;
    function finish(txt){setMsgs(nm.concat([{role:"ai",text:txt,time:nowT()}]).slice(-20));setLoading(false);}
    fetch(GEMINI_URL+KEY,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:"Indian stock market education only. Under 150 words. End with: Educational only. Q: "+q}]}],generationConfig:{maxOutputTokens:300,temperature:0.5}})})
      .then(function(r){return r.json();})
      .then(function(d){finish(d.candidates&&d.candidates[0]&&d.candidates[0].content?d.candidates[0].content.parts.map(function(p){return p.text||"";}).join("").trim():"Could not get response. Check API key.");})
      .catch(function(){finish("Connection error. Check internet and API key.");});
  }
  var chips=["Explain OI","What is PCR","What is RSI","Explain VWAP","What is Doji","What is Theta"];
  return(
    <div style={{background:"#0B0B0B",minHeight:"100%",display:"flex",flexDirection:"column",paddingBottom:80}}>
      <div style={{background:"#111",borderBottom:"1px solid #1E1E1E",padding:"11px 14px"}}>
        <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>Breakout Pro AI</div>
        <div style={{fontSize:8,color:loading?"#F59E0B":G}}>{loading?"Thinking...":"Gemini 2.0 Flash - Ready"}</div>
      </div>
      <div style={{background:"#0F0A00",borderBottom:"1px solid #2A1E00",padding:"5px 14px"}}>
        <span style={{fontSize:7.5,color:"#92694A",fontWeight:600}}>! Educational Only | Not SEBI Registered Investment Advice</span>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:12}}>
        {msgs.length==0?<div style={{textAlign:"center",paddingTop:20}}>
          <div style={{fontSize:32,fontWeight:900,color:G,marginBottom:10}}>BP AI</div>
          <div style={{fontSize:11,color:"#fff",marginBottom:4}}>Ask me about stock market education</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:12}}>
            {chips.map(function(q){return <button key={q} onClick={function(){send(q);}} style={{background:"#161616",border:"1px solid #222",borderRadius:10,padding:"9px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",fontSize:8,color:"#ccc"}}>{q}</button>; })}
          </div>
        </div>:null}
        {msgs.map(function(m,i){var isu=m.role=="user";return(
          <div key={i} style={{marginBottom:12,display:"flex",flexDirection:"column",alignItems:isu?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"88%",background:isu?"#1E3A5F":"#161616",border:isu?"1px solid #1E4080":"1px solid #222",borderRadius:isu?"14px 14px 4px 14px":"4px 14px 14px 14px",padding:"10px 13px"}}>
              <div style={{fontSize:11,color:"#e8e8e8",lineHeight:1.75,whiteSpace:"pre-wrap"}}>{m.text}</div>
              <div style={{fontSize:7,color:"rgba(255,255,255,0.3)",marginTop:3,textAlign:"right"}}>{m.time}</div>
            </div>
          </div>
        ); })}
        {loading?<div style={{display:"flex",marginBottom:12}}><div style={{background:"#161616",border:"1px solid #222",borderRadius:"4px 14px 14px 14px",padding:"12px 16px"}}><div style={{display:"flex",gap:4}}>{[0,1,2].map(function(i){return <div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#3B82F6",opacity:0.8}}></div>; })}</div></div></div>:null}
        <div ref={endRef}></div>
      </div>
      <div style={{borderTop:"1px solid #1A1A1A",padding:"8px 12px 12px",background:"#0F0F0F"}}>
        <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:8,paddingBottom:2}}>
          {chips.map(function(q){return <button key={q} disabled={loading} onClick={function(){send(q);}} style={{background:"#161616",border:"1px solid #222",borderRadius:20,padding:"4px 10px",color:loading?"#333":"#3B82F6",fontSize:8,cursor:loading?"not-allowed":"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit",fontWeight:600}}>{q}</button>; })}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <textarea value={input} onChange={function(e){setInput(e.target.value);}} onKeyDown={function(e){if(e.key=="Enter"&&!e.shiftKey){e.preventDefault();send(input);}}} placeholder="Ask about any market concept..." rows={1} disabled={loading} style={{flex:1,background:"#161616",border:"1px solid #222",borderRadius:11,padding:"10px 12px",color:"#fff",fontSize:11,fontFamily:"inherit",outline:"none",resize:"none",lineHeight:1.5,maxHeight:80,overflowY:"auto",opacity:loading?0.6:1}}/>
          <button onClick={function(){send(input);}} disabled={!input.trim()||loading} style={{background:(!input.trim()||loading)?"#1A1A1A":"linear-gradient(135deg,#3B82F6,#1D4ED8)",border:"none",borderRadius:11,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",cursor:(!input.trim()||loading)?"not-allowed":"pointer",fontSize:14,color:"#fff",flexShrink:0}}>&#10148;</button>
        </div>
      </div>
    </div>
  );
}

function ToolsScreen(){
  var [tool,setTool]=useState("rr");
  var [e1,setE1]=useState("22500");var [sl1,setSl1]=useState("22400");var [tgt,setTgt]=useState("22700");
  var [cap,setCap]=useState("100000");var [risk,setRisk]=useState("2");var [ep,setEp]=useState("22500");var [slp,setSlp]=useState("22400");
  var rrRatio=0,rrOk=false;
  try{var en=parseFloat(e1),sl=parseFloat(sl1),t=parseFloat(tgt);if(en&&sl&&t){rrRatio=Math.abs(t-en)/Math.abs(en-sl);rrOk=true;}}catch(e){}
  var posQty=0;
  try{var c2=parseFloat(cap),rp=parseFloat(risk)/100,sp=Math.abs(parseFloat(ep)-parseFloat(slp));if(c2&&rp&&sp)posQty=Math.floor((c2*rp)/sp);}catch(e){}
  var inp={width:"100%",background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,padding:"10px 12px",color:"#111827",fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:8};
  var lbl={fontSize:11,color:"#374151",fontWeight:600,marginBottom:4,display:"block"};
  return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80}}>
      <div style={{display:"flex",gap:8,padding:"12px 14px",background:"#fff",borderBottom:"1px solid #F0F0F0",overflowX:"auto"}}>
        {[["rr","R:R Calc"],["pos","Position Size"],["brok","Brokerage"]].map(function(t){var act=tool==t[0];return <button key={t[0]} style={{background:act?G:"#F3F4F6",border:"none",borderRadius:20,padding:"6px 14px",color:act?"#fff":"#374151",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}} onClick={function(){setTool(t[0]);}}>{t[1]}</button>; })}
      </div>
      <div style={{padding:14}}>
        {tool=="rr"?<div>
          <div style={{fontSize:14,fontWeight:700,color:"#111827",marginBottom:14}}>Risk Reward Calculator</div>
          <label style={lbl}>Entry Price</label><input style={inp} type="number" value={e1} onChange={function(e){setE1(e.target.value);}}/>
          <label style={lbl}>Stop Loss</label><input style={inp} type="number" value={sl1} onChange={function(e){setSl1(e.target.value);}}/>
          <label style={lbl}>Target</label><input style={inp} type="number" value={tgt} onChange={function(e){setTgt(e.target.value);}}/>
          {rrOk?<div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #BBF7D0",borderRadius:12,padding:14,textAlign:"center",marginTop:14}}>
            <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Risk:Reward Ratio</div>
            <div style={{fontSize:32,fontWeight:900,color:rrRatio>=2?G:rrRatio>=1?"#F59E0B":R}}>1:{rrRatio.toFixed(1)}</div>
          </div>:null}
        </div>:null}
        {tool=="pos"?<div>
          <div style={{fontSize:14,fontWeight:700,color:"#111827",marginBottom:14}}>Position Size Calculator</div>
          <label style={lbl}>Capital (Rs)</label><input style={inp} type="number" value={cap} onChange={function(e){setCap(e.target.value);}}/>
          <label style={lbl}>Risk %</label><input style={inp} type="number" value={risk} onChange={function(e){setRisk(e.target.value);}}/>
          <label style={lbl}>Entry</label><input style={inp} type="number" value={ep} onChange={function(e){setEp(e.target.value);}}/>
          <label style={lbl}>Stop Loss</label><input style={inp} type="number" value={slp} onChange={function(e){setSlp(e.target.value);}}/>
          {posQty>0?<div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #BBF7D0",borderRadius:12,padding:14,textAlign:"center",marginTop:14}}>
            <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Quantity</div>
            <div style={{fontSize:32,fontWeight:900,color:G}}>{posQty}</div>
            <div style={{fontSize:9,color:"#6B7280",marginTop:4}}>Max loss: Rs {fN(parseFloat(cap)*parseFloat(risk)/100)}</div>
          </div>:null}
        </div>:null}
        {tool=="brok"?<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:6}}>Brokerage Calculator</div><div style={{fontSize:10,color:"#6B7280"}}>Zerodha, Groww, Dhan comparison coming soon</div></div>:null}
      </div>
    </div>
  );
}

function GlobalScreen(){
  return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14}}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>Global Markets</div>
      {GLOBAL_MKT.map(function(m){return(
        <div key={m.name} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:12,fontWeight:700,color:"#111827"}}>{m.name}</span>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"monospace",fontSize:13,fontWeight:800,color:"#111827"}}>{m.val.toLocaleString("en-IN")}</div>
            <div style={{fontSize:10,fontWeight:700,color:m.up?G:R}}>{m.up?"+":""}{m.chg.toFixed(2)}%</div>
          </div>
        </div>
      ); })}
    </div>
  );
}

function HeatmapScreen(){
  var cells=[{sym:"RELIANCE",chg:1.71},{sym:"TCS",chg:-0.97},{sym:"HDFCBANK",chg:1.90},{sym:"ICICIBANK",chg:2.33},{sym:"INFY",chg:-1.40},{sym:"WIPRO",chg:2.99},{sym:"TATAMOTORS",chg:2.23},{sym:"MARUTI",chg:1.07},{sym:"SUNPHARMA",chg:-0.98},{sym:"BAJFINANCE",chg:1.90},{sym:"SBIN",chg:2.18},{sym:"AXISBANK",chg:1.47},{sym:"LT",chg:-0.95},{sym:"NTPC",chg:1.72},{sym:"ONGC",chg:2.24},{sym:"ADANIENT",chg:3.24}];
  function col(chg){if(chg>=3)return{bg:"#00C853",tx:"#fff"};if(chg>=1.5)return{bg:"#4CAF50",tx:"#fff"};if(chg>=0)return{bg:"#C8E6C9",tx:"#111"};if(chg>=-1.5)return{bg:"#EF9A9A",tx:"#111"};return{bg:"#EF4444",tx:"#fff"};}
  return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80}}>
      <div style={{padding:"14px 14px 8px",fontSize:13,fontWeight:700,color:"#111827"}}>NIFTY 50 Heatmap</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3,padding:"0 14px 14px"}}>
        {cells.map(function(s){var c=col(s.chg);return <div key={s.sym} style={{background:c.bg,borderRadius:8,padding:"8px 4px",textAlign:"center"}}><div style={{fontSize:7,fontWeight:700,color:c.tx}}>{s.sym}</div><div style={{fontSize:8,fontWeight:800,color:c.tx,marginTop:2}}>{s.chg>0?"+":""}{s.chg.toFixed(1)}%</div></div>; })}
      </div>
      <div style={{padding:"0 14px 8px",fontSize:11,fontWeight:700,color:"#111827"}}>Sectors</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,padding:"0 14px"}}>
        {SECTORS.map(function(s){var up=s.chg>=0;return <div key={s.name} style={{background:up?"#DCFCE7":"#FEE2E2",borderRadius:10,padding:10,textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:"#374151"}}>{s.name}</div><div style={{fontSize:12,fontWeight:800,color:up?G:R,marginTop:2}}>{up?"+":""}{s.chg.toFixed(2)}%</div></div>; })}
      </div>
    </div>
  );
}

function FiiScreen(){
  var daily=[{date:"Jun 10",fii:2340,dii:-890},{date:"Jun 09",fii:-1230,dii:1560},{date:"Jun 08",fii:3450,dii:-230},{date:"Jun 07",fii:-890,dii:2340}];
  return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14}}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>FII/DII Activity</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #BBF7D0",borderRadius:14,padding:14,textAlign:"center"}}><div style={{fontSize:9,color:"#166534",marginBottom:4}}>FII Today (Cr)</div><div style={{fontSize:22,fontWeight:900,color:G}}>+2,340</div></div>
        <div style={{background:"linear-gradient(135deg,#FFF1F2,#FEE2E2)",border:"1px solid #FECDD3",borderRadius:14,padding:14,textAlign:"center"}}><div style={{fontSize:9,color:"#991B1B",marginBottom:4}}>DII Today (Cr)</div><div style={{fontSize:22,fontWeight:900,color:R}}>-890</div></div>
      </div>
      <div style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:14,padding:14}}>
        <div style={{fontSize:12,fontWeight:700,color:"#111827",marginBottom:10}}>Daily Activity (Rs Cr)</div>
        {daily.map(function(d){var net=d.fii+d.dii;return <div key={d.date} style={{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #F5F5F5"}}><div style={{fontSize:10,color:"#6B7280",width:50}}>{d.date}</div><div style={{flex:1,display:"flex",gap:10}}><span style={{fontSize:9,color:G,fontWeight:600}}>FII:{d.fii>0?"+":""}{d.fii}</span><span style={{fontSize:9,color:R,fontWeight:600}}>DII:{d.dii>0?"+":""}{d.dii}</span></div><div style={{fontSize:10,fontWeight:700,color:net>=0?G:R}}>{net>=0?"+":""}{net}</div></div>; })}
      </div>
    </div>
  );
}

function SubScreen(props){
  return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:16}}>
      {props.trialDays>0?<div style={{background:"linear-gradient(135deg,#FEF3C7,#FDE68A)",border:"1px solid #F59E0B",borderRadius:16,padding:16,marginBottom:16,textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:"#92400E"}}>Free Trial Active</div><div style={{fontSize:24,fontWeight:900,color:"#D97706",margin:"4px 0"}}>{props.trialDays} days left</div></div>:null}
      {SUB_PLANS.map(function(plan){var pop=plan.id=="monthly";return(
        <div key={plan.id} style={{background:"#fff",border:"2px solid "+(pop?plan.color:"#E5E7EB"),borderRadius:16,padding:16,marginBottom:12,position:"relative"}}>
          {pop?<div style={{position:"absolute",top:-10,right:16,background:G,color:"#fff",borderRadius:20,padding:"3px 12px",fontSize:9,fontWeight:700}}>{plan.tag}</div>:null}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div><div style={{fontSize:16,fontWeight:800,color:"#111827"}}>{plan.name}</div><div style={{fontSize:22,fontWeight:900,color:plan.color}}>Rs {plan.price}</div></div>
            <button onClick={function(){props.onUpgrade(plan);}} style={{background:plan.color,border:"none",borderRadius:12,padding:"10px 20px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Upgrade</button>
          </div>
          {plan.features.map(function(f){return <div key={f} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}><span style={{color:G,fontSize:12}}>OK</span><span style={{fontSize:10,color:"#374151"}}>{f}</span></div>; })}
        </div>
      ); })}
      <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:12,padding:12}}><div style={{fontSize:11,fontWeight:700,color:"#166534",marginBottom:4}}>How to Pay</div><div style={{fontSize:9,color:"#166534"}}>UPI / Razorpay / PhonePe - breakoutpro.in/pay</div></div>
    </div>
  );
}

function JournalScreen(){
  var stored=[];try{stored=JSON.parse(localStorage.getItem("bp_journal")||"[]");}catch(e){}
  var [entries,setEntries]=useState(stored);var [show,setShow]=useState(false);
  var [sym,setSym]=useState("");var [en,setEn]=useState("");var [ex,setEx]=useState("");var [qty,setQty]=useState("");var [side,setSide]=useState("Long");
  function add(){
    if(!sym||!en||!ex||!qty)return;
    var pnl=(parseFloat(ex)-parseFloat(en))*parseFloat(qty)*(side=="Long"?1:-1);
    var e2={id:Date.now(),sym:sym.toUpperCase(),side:side,entry:parseFloat(en),exit:parseFloat(ex),qty:parseFloat(qty),pnl:pnl,date:new Date().toLocaleDateString("en-IN")};
    var ne=[e2].concat(entries);setEntries(ne);try{localStorage.setItem("bp_journal",JSON.stringify(ne.slice(0,100)));}catch(e){}
    setShow(false);setSym("");setEn("");setEx("");setQty("");
  }
  var totPnl=entries.reduce(function(s,e){return s+e.pnl;},0);
  var inp={width:"100%",background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,padding:"10px 12px",color:"#111827",fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:8};
  if(show)return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80}}>
      <div style={{background:"#fff",padding:"12px 14px",borderBottom:"1px solid #F0F0F0",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={function(){setShow(false);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#374151"}}>&#8592;</button>
        <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Add Trade</div>
      </div>
      <div style={{padding:14}}>
        <div style={{display:"flex",gap:8,marginBottom:8}}>{["Long","Short"].map(function(s){var act=side==s;return <button key={s} onClick={function(){setSide(s);}} style={{flex:1,background:act?(s=="Long"?G:R):"#F3F4F6",border:"none",borderRadius:10,padding:"10px",color:act?"#fff":"#374151",fontWeight:600,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{s}</button>; })}</div>
        <input style={inp} placeholder="Symbol" value={sym} onChange={function(e){setSym(e.target.value);}}/>
        <input style={inp} placeholder="Entry Price" type="number" value={en} onChange={function(e){setEn(e.target.value);}}/>
        <input style={inp} placeholder="Exit Price" type="number" value={ex} onChange={function(e){setEx(e.target.value);}}/>
        <input style={inp} placeholder="Quantity" type="number" value={qty} onChange={function(e){setQty(e.target.value);}}/>
        <button onClick={add} style={{width:"100%",background:G,border:"none",borderRadius:12,padding:14,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Save Trade</button>
      </div>
    </div>
  );
  return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:16,fontWeight:800,color:"#111827"}}>Trading Journal</div>
        <button onClick={function(){setShow(true);}} style={{background:G,border:"none",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Add</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:totPnl>=0?"#F0FDF4":"#FFF1F2",borderRadius:12,padding:12,textAlign:"center",border:"1px solid "+(totPnl>=0?"#BBF7D0":"#FECDD3")}}><div style={{fontSize:8,color:"#6B7280",marginBottom:3}}>Total P&L</div><div style={{fontSize:20,fontWeight:900,color:totPnl>=0?G:R}}>{totPnl>=0?"+ Rs ":"- Rs "}{Math.abs(totPnl).toFixed(0)}</div></div>
        <div style={{background:"#F0F9FF",border:"1px solid #BAE6FD",borderRadius:12,padding:12,textAlign:"center"}}><div style={{fontSize:8,color:"#6B7280",marginBottom:3}}>Trades</div><div style={{fontSize:20,fontWeight:900,color:"#0369A1"}}>{entries.length}</div></div>
      </div>
      {entries.length==0?<div style={{textAlign:"center",padding:"30px 0",color:"#9CA3AF",fontSize:12}}>No trades yet. Tap + Add to start!</div>:null}
      {entries.map(function(e){var up=e.pnl>=0;return(
        <div key={e.id} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid "+(up?G:R)}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:700,color:"#111827"}}>{e.sym} <span style={{background:e.side=="Long"?"#DCFCE7":"#FEE2E2",color:e.side=="Long"?"#166534":"#991B1B",borderRadius:4,padding:"1px 5px",fontSize:7,fontWeight:700}}>{e.side}</span></span><span style={{fontSize:13,fontWeight:800,color:up?G:R}}>{up?"+ Rs ":"- Rs "}{Math.abs(e.pnl).toFixed(0)}</span></div>
          <div style={{display:"flex",gap:10,marginTop:4,fontSize:9,color:"#6B7280"}}><span>In:{e.entry}</span><span>Out:{e.exit}</span><span>Qty:{e.qty}</span><span>{e.date}</span></div>
        </div>
      ); })}
    </div>
  );
}

function ChallengesScreen(){
  var xp0=0;try{xp0=parseInt(localStorage.getItem("bp_xp")||"0");}catch(e){}
  var done0=[];try{done0=JSON.parse(localStorage.getItem("bp_done")||"[]");}catch(e){}
  var [xp,setXp]=useState(xp0);var [done,setDone]=useState(done0);var [active,setActive]=useState(null);var [sel,setSel]=useState(null);var [res,setRes]=useState(null);
  var qs=[{id:"q1",title:"Candlestick",q:"Which shows indecision?",opts:["Doji","Hammer","Marubozu","Engulfing"],ans:0,xp:10},{id:"q2",title:"OI Concept",q:"Rising OI + rising price =",opts:["Long buildup","Short covering","Unwinding","Short buildup"],ans:0,xp:10},{id:"q3",title:"PCR",q:"PCR below 0.7 =",opts:["Bullish","Bearish","Neutral","Volatile"],ans:0,xp:15},{id:"q4",title:"RSI",q:"RSI above 70 =",opts:["Overbought","Oversold","Neutral","Trending"],ans:0,xp:10}];
  function answer(idx){if(!active)return;setSel(idx);var ok=idx==active.ans;if(ok&&done.indexOf(active.id)==-1){var nx=xp+active.xp;var nd=done.concat([active.id]);setXp(nx);setDone(nd);try{localStorage.setItem("bp_xp",nx);localStorage.setItem("bp_done",JSON.stringify(nd));}catch(e){}}setRes(ok);}
  var level=xp<50?"Beginner":xp<150?"Learner":xp<300?"Trader":"Expert";
  if(active)return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14}}>
      <button onClick={function(){setActive(null);setSel(null);setRes(null);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",marginBottom:14,color:"#374151"}}>&#8592;</button>
      <div style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:16,padding:20}}>
        <div style={{fontSize:11,color:G,fontWeight:700,marginBottom:8}}>{active.title} - +{active.xp} XP</div>
        <div style={{fontSize:16,fontWeight:700,color:"#111827",lineHeight:1.5,marginBottom:16}}>{active.q}</div>
        {active.opts.map(function(opt,i){var bg=sel==null?"#F9FAFB":i==active.ans?"#DCFCE7":i==sel?"#FEE2E2":"#F9FAFB";var bd=sel==null?"#E5E7EB":i==active.ans?G:i==sel?R:"#E5E7EB";return <button key={i} onClick={function(){answer(i);}} disabled={sel!=null} style={{width:"100%",background:bg,border:"2px solid "+bd,borderRadius:12,padding:"12px 14px",marginBottom:8,textAlign:"left",cursor:sel!=null?"default":"pointer",fontFamily:"inherit",fontSize:12,color:"#111827"}}>{opt}</button>; })}
        {res!=null?<div style={{textAlign:"center",padding:"10px 0",fontSize:14,fontWeight:700,color:res?G:R}}>{res?"Correct! +"+active.xp+" XP":"Wrong! Study and retry"}</div>:null}
      </div>
    </div>
  );
  return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14}}>
      <div style={{background:"linear-gradient(135deg,#111827,#1F2937)",borderRadius:16,padding:16,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",color:"#fff"}}>
        <div><div style={{fontSize:11,color:"#9CA3AF"}}>Level</div><div style={{fontSize:22,fontWeight:900,color:G}}>{level}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:11,color:"#9CA3AF"}}>XP</div><div style={{fontSize:28,fontWeight:900,color:"#F59E0B"}}>{xp}</div></div>
      </div>
      {qs.map(function(ch){var isDone=done.indexOf(ch.id)!=-1;return(
        <div key={ch.id} style={{background:"#fff",border:"1px solid "+(isDone?"#BBF7D0":"#F0F0F0"),borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:isDone?"default":"pointer"}} onClick={function(){if(!isDone){setActive(ch);setSel(null);setRes(null);}}}>
          <div style={{width:36,height:36,borderRadius:10,background:isDone?"#DCFCE7":"#F3F4F6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{isDone?"OK":"?"}</div>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"#111827"}}>{ch.title}</div><div style={{fontSize:9,color:"#6B7280",marginTop:2}}>{isDone?"Done":"Tap to start"}</div></div>
          <div style={{background:isDone?"#DCFCE7":"#FEF3C7",borderRadius:6,padding:"3px 8px",fontSize:9,fontWeight:700,color:isDone?"#166534":"#D97706"}}>+{ch.xp} XP</div>
        </div>
      ); })}
    </div>
  );
}

function MoreScreen(props){
  var items=[{label:"Global Markets",id:"global"},{label:"Heatmap",id:"heatmap"},{label:"FII/DII",id:"fiidii"},{label:"News",id:"news"},{label:"Tools",id:"tools"},{label:"Journal",id:"journal"},{label:"Challenges",id:"challenges"},{label:"Premium",id:"sub"},{label:"IPO",id:"ipo"},{label:"Compare Stocks",id:"compare"}];
  return(
    <div style={{background:"#F8F9FA",minHeight:"100%",paddingBottom:80,padding:14}}>
      <div style={{fontSize:16,fontWeight:800,color:"#111827",marginBottom:14}}>All Features</div>
      {items.map(function(item){return(
        <div key={item.id} style={{background:"#fff",border:"1px solid #F0F0F0",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}} onClick={function(){props.setTab(item.id);}}>
          <div style={{fontSize:12,fontWeight:700,color:"#111827"}}>{item.label}</div>
          <span style={{color:"#9CA3AF",fontSize:14}}>&#8250;</span>
        </div>
      ); })}
    </div>
  );
}

export default function StocksBuddy(){
  function getSess(){try{var s=JSON.parse(localStorage.getItem("bp_sess")||"null");if(s&&s.name&&s.phone)return s;return null;}catch(e){return null;}}
  var saved=getSess();
  var [splash,setSplash]=useState(true);
  var [user,setUser]=useState(saved);
  var [tab,setTab]=useState("home");
  var [sidebar,setSidebar]=useState(false);
  var [nifty,setNifty]=useState({ltp:22467.90,pct:1.35,up:true});
  var [sensex,setSensex]=useState({ltp:73863.45,pct:1.28,up:true});
  var [bankNifty,setBankNifty]=useState({ltp:48234.60,pct:0.86,up:true});
  var [midcap,setMidcap]=useState({ltp:43876.20,pct:0.74,up:true});
  var [stocks]=useState(STOCKS);
  var [news]=useState(NEWS);
  var [briefing,setBriefing]=useState("");
  var [briefingLoading,setBriefingLoading]=useState(false);
  var [glTab,setGlTab]=useState("gainers");
  var [isPrem,setIsPrem]=useState(function(){try{var u=JSON.parse(localStorage.getItem("bp_sess")||"{}");return u.isPrem||u.isAdmin||false;}catch(e){return false;}});
  var trialStart=saved&&saved.trialStart?saved.trialStart:Date.now();
  var trialDays=Math.max(0,7-Math.floor((Date.now()-trialStart)/(1000*60*60*24)));

  useEffect(function(){var t=setTimeout(function(){setSplash(false);},2000);return function(){clearTimeout(t);};},[]);
  useEffect(function(){if(!document.getElementById("bp-css")){var el=document.createElement("style");el.id="bp-css";el.textContent="::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px}";document.head.appendChild(el);}},[]);

  function login(u){if(!u.trialStart)u.trialStart=Date.now();setUser(u);setIsPrem(u.isPrem||u.isAdmin||false);try{localStorage.setItem("bp_sess",JSON.stringify(u));}catch(e){}}
  function logout(){setUser(null);setIsPrem(false);try{localStorage.removeItem("bp_sess");}catch(e){}setSidebar(false);}
  function upgrade(plan){var nu=Object.assign({},user,{isPrem:true,plan:plan.id});setIsPrem(true);setUser(nu);try{localStorage.setItem("bp_sess",JSON.stringify(nu));}catch(e){}setTab("home");}
  function loadBriefing(){
    setBriefingLoading(true);
    var KEY="";if(typeof window!="undefined"&&window.GEMINI_KEY)KEY=window.GEMINI_KEY;
    fetch(GEMINI_URL+KEY,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:"Brief Indian stock market summary 80 words. NIFTY "+nifty.ltp+". Educational only. End with: Educational only. Not investment advice."}]}],generationConfig:{maxOutputTokens:200,temperature:0.7}})})
      .then(function(r){return r.json();})
      .then(function(d){setBriefing(d.candidates&&d.candidates[0]&&d.candidates[0].content?d.candidates[0].content.parts[0].text:"Market update unavailable. Check API key.");setBriefingLoading(false);})
      .catch(function(){setBriefing("Could not load. Check internet.");setBriefingLoading(false);});
  }

  var navItems=[{label:"Home",id:"home"},{label:"Markets",id:"markets"},{label:"Scanner",id:"scanner"},{label:"OI Chain",id:"oi"},{label:"Learn",id:"learn"},{label:"AI Chat",id:"ai"},{label:"Tools",id:"tools"},{label:"News",id:"news"},{label:"Global",id:"global"},{label:"Heatmap",id:"heatmap"},{label:"FII/DII",id:"fiidii"},{label:"Journal",id:"journal"},{label:"Challenges",id:"challenges"},{label:"Premium",id:"sub"},{label:"More",id:"more"}];

  function renderSidebar(){
    if(!sidebar)return null;
    return(
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,zIndex:200,display:"flex"}}>
        <div style={{width:260,background:"#fff",borderRight:"1px solid #E5E7EB",display:"flex",flexDirection:"column",boxShadow:"4px 0 24px rgba(0,0,0,0.1)"}}>
          <div style={{padding:"20px 16px",borderBottom:"1px solid #F0F0F0"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#00C853,#00A040)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#fff"}}>{user?user.name[0].toUpperCase():"T"}</div>
              <div><div style={{fontSize:14,fontWeight:800,color:"#111827"}}>{user?user.name:"Trader"}</div><div style={{fontSize:9,color:"#9CA3AF"}}>{user?user.phone:""}</div></div>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
            {navItems.map(function(item){var act=tab==item.id;return(
              <button key={item.id} style={{width:"100%",background:act?"#F0FDF4":"none",border:"none",borderLeft:act?"3px solid "+G:"3px solid transparent",padding:"11px 16px",display:"flex",alignItems:"center",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}} onClick={function(){setTab(item.id);setSidebar(false);}}>
                <span style={{fontSize:13,fontWeight:act?700:500,color:act?G:"#374151"}}>{item.label}</span>
              </button>
            ); })}
          </div>
          <div style={{padding:"16px",borderTop:"1px solid #F0F0F0"}}>
            <div style={{fontSize:7,color:"#9CA3AF",marginBottom:10,lineHeight:1.6}}>! {DISCLAIMER}</div>
            <button style={{width:"100%",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"11px",color:"#DC2626",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={logout}>Logout</button>
          </div>
        </div>
        <div style={{flex:1,background:"rgba(0,0,0,0.3)"}} onClick={function(){setSidebar(false);}}></div>
      </div>
    );
  }

  function renderContent(){
    if(splash)return(
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
    if(!user)return <AuthScreen onLogin={login}/>;
    var screen=null;
    if(tab=="home")screen=<HomeScreen nifty={nifty} sensex={sensex} bankNifty={bankNifty} midcap={midcap} stocks={stocks} news={news} briefing={briefing} briefingLoading={briefingLoading} onBriefing={loadBriefing} user={user} setTab={setTab} glTab={glTab} setGlTab={setGlTab}/>;
    if(tab=="markets")screen=<MarketsScreen stocks={stocks}/>;
    if(tab=="scanner")screen=<ScannerScreen stocks={stocks}/>;
    if(tab=="oi")screen=<OIScreen/>;
    if(tab=="learn")screen=<LearnScreen/>;
    if(tab=="ai")screen=<AIScreen/>;
    if(tab=="tools")screen=<ToolsScreen/>;
    if(tab=="news")screen=<NewsScreen news={news}/>;
    if(tab=="global")screen=<GlobalScreen/>;
    if(tab=="heatmap")screen=<HeatmapScreen/>;
    if(tab=="fiidii")screen=<FiiScreen/>;
    if(tab=="journal")screen=<JournalScreen/>;
    if(tab=="challenges")screen=<ChallengesScreen/>;
    if(tab=="sub")screen=<SubScreen trialDays={trialDays} onUpgrade={upgrade}/>;
    if(tab=="more")screen=<MoreScreen setTab={setTab}/>;
    if(!screen)screen=<MoreScreen setTab={setTab}/>;
    return(
      <div style={{position:"relative",width:"100%",maxWidth:430,margin:"0 auto",height:"100vh",overflow:"hidden",fontFamily:"Inter,Arial,sans-serif",background:"#F8F9FA"}}>
        <div style={{height:"100vh",overflowY:"auto"}}>
          <TopBar isPrem={isPrem} trialDays={trialDays} onMenu={function(){setSidebar(true);}} onSub={function(){setTab("sub");}}/>
          {screen}
        </div>
        <TabBar tab={tab} setTab={setTab}/>
        {renderSidebar()}
      </div>
    );
  }

  return renderContent();
}
