import { useState } from "react";
import { PatternMini } from "./PatternVisuals";
import PatternLibrary from "./PatternLibrary";
import WatchlistPage from "./WatchlistPage";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - SignalsPage.jsx
// SEBI-safe: Pattern detection + education + watchlist + alert preferences.
// NO buy/sell calls, NO entry/SL/target. Pure black. Rules: no backtick, no triple-equals, ASCII.

var BG="#000000",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

var TFS=["5m","15m","1h","4h","1D"];

// Detected patterns - educational detection only, NOT recommendations.
var DETECTED=[
  {sym:"SHRIRAMFIN",price:"993.35", tf:"15m",up:true, pat:"bull-engulf",pname:"Bullish Engulfing"},
  {sym:"RELIANCE",  price:"2845.60",tf:"1h", up:true, pat:"cup-handle", pname:"Cup and Handle"},
  {sym:"WIPRO",     price:"174.49", tf:"15m",up:false,pat:"bear-engulf",pname:"Bearish Engulfing"},
  {sym:"TATASTEEL", price:"148.20", tf:"1h", up:false,pat:"double-top", pname:"Double Top"},
  {sym:"SBIN",      price:"812.40", tf:"1D", up:true, pat:"double-bot", pname:"Double Bottom"},
  {sym:"ADANIENT",  price:"2456.00",tf:"15m",up:false,pat:"shooting",   pname:"Shooting Star"}
];

var ALERT_TYPES=[
  {ic:"&#128200;",name:"Pattern Alerts",    on:true},
  {ic:"&#128202;",name:"Volume Spike",      on:true},
  {ic:"&#128640;",name:"Breakout Detection",on:true},
  {ic:"&#128201;",name:"OI Change",         on:false},
  {ic:"&#128266;",name:"Voice Alerts",      on:false},
  {ic:"&#128276;",name:"Push Notifications",on:true}
];

export default function SignalsPage(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, CARD2 = theme.c.card2, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var [view,setView]=useState(null);
  var [tf,setTf]=useState("all");
  var [alerts,setAlerts]=useState(ALERT_TYPES);

  if(view=="patterns") return <PatternLibrary onBack={function(){setView(null);}}/>;
  if(view=="watchlist") return <WatchlistPage onBack={function(){setView(null);}} onStock={props.onStock}/>;

  function toggle(i){ setAlerts(alerts.map(function(a,idx){ return idx==i?Object.assign({},a,{on:!a.on}):a; })); }
  var sigs=DETECTED.filter(function(s){ return tf=="all"||s.tf==tf; });

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      <div style={{background:BG,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        {props.onBack?<button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>:null}
        <div style={{flex:1}}><div style={{fontSize:16,fontWeight:900,color:T1}}>Pattern Scanner</div><div style={{fontSize:9,color:T2}}>Educational pattern detection</div></div>
      </div>

      <div style={{padding:14}}>
        {/* QUICK LINKS */}
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <button onClick={function(){setView("watchlist");}} style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:11,padding:"12px 8px",cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:16}} dangerouslySetInnerHTML={{__html:"&#11088;"}}/>
            <div style={{fontSize:10,fontWeight:700,color:T1,marginTop:4}}>Watchlist</div>
          </button>
          <button onClick={function(){setView("patterns");}} style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:11,padding:"12px 8px",cursor:"pointer",textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"center"}}><PatternMini id="bull-engulf" size={26}/></div>
            <div style={{fontSize:10,fontWeight:700,color:T1,marginTop:4}}>Learn Patterns</div>
          </button>
        </div>

        {/* TIMEFRAME FILTER */}
        <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14}}>
          {["all"].concat(TFS).map(function(t){
            var act=tf==t;
            return <button key={t} onClick={function(){setTf(t);}} style={{background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:16,padding:"5px 13px",color:act?"#04060D":T2,fontSize:11,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{t=="all"?"All":t}</button>;
          })}
        </div>

        {/* DETECTED PATTERNS - education only */}
        <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:4}}>DETECTED PATTERNS</div>
        <div style={{fontSize:9,color:T3,marginBottom:10}}>Patterns spotted on charts. Tap to learn. Not a buy or sell recommendation.</div>
        <div style={{marginBottom:18}}>
          {sigs.map(function(s){
            var col=s.up?UP:DOWN;
            return (
              <div key={s.sym} onClick={function(){setView("patterns");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:12,marginBottom:9,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:11}}>
                  <div style={{width:46,height:46,background:CARD2,border:"1px solid "+BD,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <PatternMini id={s.pat} size={36}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:800,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:9,color:T2,marginTop:2}}>{s.pname}  &#8226;  {s.tf}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:800,color:col,fontFamily:"monospace"}}>Rs {s.price}</div>
                    <div style={{fontSize:9,color:BLUE,fontWeight:700,marginTop:2}}>Learn &#8594;</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ALERT SETTINGS */}
        <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:9}}>ALERT PREFERENCES</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
          {alerts.map(function(a,i){
            return (
              <div key={a.name} style={{display:"flex",alignItems:"center",padding:"12px 13px",borderBottom:i<alerts.length-1?"1px solid "+BD:"none"}}>
                <span style={{fontSize:15,marginRight:11}} dangerouslySetInnerHTML={{__html:a.ic}}/>
                <span style={{flex:1,fontSize:12,color:T1,fontWeight:600}}>{a.name}</span>
                <button onClick={function(){toggle(i);}} style={{width:40,height:22,borderRadius:11,border:"none",background:a.on?UP:"rgba(255,255,255,0.12)",cursor:"pointer",position:"relative"}}>
                  <div style={{position:"absolute",top:2,left:a.on?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}></div>
                </button>
              </div>
            );
          })}
        </div>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:14}}>
          <div style={{fontSize:9,color:theme.c.warn,lineHeight:1.5}}>BreakoutPro is an educational and market intelligence platform. We show pattern detection and learning content only. We do NOT provide buy, sell, entry, stop loss, or target recommendations. Not SEBI registered as an advisor. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
                                                                 }
