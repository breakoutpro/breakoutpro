import { useState, useEffect } from "react";
import { getMarketStatus } from "../utils/marketStatus";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - LaunchKit.jsx
// Launch polish: MarketBadge, ApiHealth, OfflineBanner, AlertHistory, FirstRunTutorial.
// Lightweight, reusable. Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",WARN="#F97316";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BRAND="#00C853";

// ---- 1. MARKET STATUS BADGE ----
export function MarketBadge(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, T3 = theme.c.text3;

  var [s,setS]=useState(getMarketStatus());
  useEffect(function(){
    var id=setInterval(function(){ setS(getMarketStatus()); },30000);
    return function(){ clearInterval(id); };
  },[]);
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"4px 12px"}}>
      <span style={{width:7,height:7,borderRadius:"50%",background:s.color,boxShadow:s.live?"0 0 6px "+s.color:"none"}}></span>
      <span style={{fontSize:12,fontWeight:800,color:s.color}}>{s.label}</span>
      <span style={{fontSize:12,color:T3}}>{s.note}</span>
    </span>
  );
}

// ---- 2. LIVE API HEALTH ----
export function ApiHealth(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T2=theme.c.text2; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var T2=theme.c.text2;

  // props.status: "live" | "reconnecting" | "offline"
  var st=props.status||"live";
  if(st=="live") return null;
  var txt=st=="reconnecting"?"Reconnecting...":"Offline";
  var col=st=="reconnecting"?T2:DOWN;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(249,115,22,0.1)",border:"1px solid "+col,borderRadius:8,padding:"4px 12px",margin:"8px 16px"}}>
      <span style={{width:7,height:7,borderRadius:"50%",background:col,animation:"pulse 1.2s infinite"}}></span>
      <span style={{fontSize:12,fontWeight:700,color:col}}>{txt}</span>
    </div>
  );
}

// ---- 3. OFFLINE BANNER ----
export function OfflineBanner(){
  var [off,setOff]=useState(function(){ try{ return !navigator.onLine; }catch(e){ return false; } });
  useEffect(function(){
    function on(){ setOff(false); } function down(){ setOff(true); }
    try{ window.addEventListener("online",on); window.addEventListener("offline",down); }catch(e){}
    return function(){ try{ window.removeEventListener("online",on); window.removeEventListener("offline",down); }catch(e){} };
  },[]);
  if(!off) return null;
  return (
    <div style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"8px 12px",margin:"8px 16px"}}>
      <div style={{fontSize:12,fontWeight:700,color:DOWN}}>No internet. Showing last saved observations.</div>
    </div>
  );
}

// ---- 4. ALERT HISTORY (last 24h) ----
// Reads from localStorage bp_alert_history (fed by the alert engine).
export function loadAlertHistory(){
  try{
    var raw=localStorage.getItem("bp_alert_history");
    var arr=raw?JSON.parse(raw):[];
    var cut=Date.now()-24*3600000;
    return arr.filter(function(a){ return a.t>=cut; });
  }catch(e){ return []; }
}
export function pushAlertHistory(item){
  try{
    var arr=loadAlertHistory();
    arr.unshift({sym:item.sym,info:item.info||item.kind,tf:item.tf,time:item.time,t:Date.now()});
    localStorage.setItem("bp_alert_history", JSON.stringify(arr.slice(0,100)));
  }catch(e){}
}
export function AlertHistory(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3, T2=theme.c.text2; T1=theme.c.text1;

  var list=loadAlertHistory();
  return (
    <div style={{padding:"0 14px",marginTop:8}}>
      {props.onBack?<button onClick={props.onBack} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:8,padding:4}}>&#8592; Back</button>:null}
      <div style={{fontSize:16,fontWeight:900,color:T1,marginBottom:4}}>Alert History</div>
      <div style={{fontSize:12,color:T3,marginBottom:12}}>Last 24 hours &#8226; educational observations</div>
      {list.length?list.map(function(a,i){
        return (
          <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontSize:12,fontWeight:800,color:T1}}>{a.sym||"Market"}</div><div style={{fontSize:12,color:BLUE,fontWeight:600,marginTop:4}}>{a.info}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:12,color:T2}}>{a.tf||""}</div><div style={{fontSize:12,color:T3,marginTop:4}}>{a.time||new Date(a.t).toLocaleTimeString()}</div></div>
          </div>
        );
      }):(
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center"}}>
          <div style={{fontSize:12,color:T3}}>No alerts in the last 24 hours.</div>
        </div>
      )}
      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:8}}>
        <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Educational Market Observation Only. Not Investment Advice.</div>
      </div>
    </div>
  );
}

// ---- 5. FIRST RUN TUTORIAL (30s walkthrough) ----
var STEPS=[
  {t:"Welcome to Breakout Pro",d:"Your personal AI market observation platform. Educational insights only, never buy or sell advice.",ic:"&#128075;"},
  {t:"AI Market Guardian",d:"Watch live market structure across stocks, indices, options and futures. Uptrend and downtrend observations in one place.",ic:"&#128737;"},
  {t:"Intelligence Modules",d:"Options Intelligence, Futures Intelligence and Gamma Blast give educational observations with detail pages.",ic:"&#128202;"},
  {t:"Voice & Alerts",d:"Enable voice observations and priority alerts. Add stocks to your Watchlist for focused alerts.",ic:"&#128276;"},
  {t:"You are ready",d:"Explore, learn and observe the markets. Everything here is for education only.",ic:"&#127881;"}
];
export function FirstRunTutorial(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD2 = theme.c.border2, BRAND = theme.c.brand, CARD = theme.c.card, T2 = theme.c.text2;
  var BLUE = theme.c.blue; T1=theme.c.text1;

  var [i,setI]=useState(0);
  var step=STEPS[i];
  function done(){ try{ localStorage.setItem("bp_tutorial_done","1"); }catch(e){} props.onClose&&props.onClose(); }
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10000,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:340,background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24}}>
        <div style={{fontSize:32,textAlign:"center",marginBottom:16}} dangerouslySetInnerHTML={{__html:step.ic}}/>
        <div style={{fontSize:18,fontWeight:900,color:T1,textAlign:"center",marginBottom:8}}>{step.t}</div>
        <div style={{fontSize:12,color:T2,textAlign:"center",lineHeight:1.6,marginBottom:16}}>{step.d}</div>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16}}>
          {STEPS.map(function(s,idx){ return <span key={idx} style={{width:idx==i?18:6,height:6,borderRadius:3,background:idx==i?BLUE:BD2,transition:"all 0.2s"}}></span>; })}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={done} style={{flex:1,background:"none",border:"1px solid "+BD,borderRadius:11,padding:"12px",color:T2,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Skip</button>
          <button onClick={function(){ if(i<STEPS.length-1){ setI(i+1); } else { done(); } }} style={{flex:2,background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#001910",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{i<STEPS.length-1?"Next":"Get Started"}</button>
        </div>
      </div>
    </div>
  );
}
export function shouldShowTutorial(){
  try{ return localStorage.getItem("bp_tutorial_done")!="1"; }catch(e){ return false; }
}
