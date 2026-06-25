import { useState } from "react";
import { PatternMini } from "./PatternVisuals";
import PatternLibrary from "./PatternLibrary";
import WatchlistPage from "./WatchlistPage";

// BreakoutPro - SignalsPage.jsx
// Full signals hub: watchlist, AI signals, alerts, timeframe filters, pattern library.
// Pure black, green/red, blue buttons. Rules: no backtick, no triple-equals, ASCII.

var BG="#000000",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

var TFS=["5m","15m","1h","4h","1D"];

var ALL_SIGNALS=[
  {sym:"SHRIRAMFIN",price:"993.35",tf:"15m",conf:88,up:true, kind:"AI BUY",   pattern:"bull-engulf",pname:"Bullish Engulfing",sl:"975",tgt:"1020"},
  {sym:"RELIANCE",  price:"2845.60",tf:"1h",conf:85,up:true, kind:"BREAKOUT", pattern:"cup-handle",pname:"Cup and Handle",sl:"2790",tgt:"2920"},
  {sym:"WIPRO",     price:"174.49",tf:"15m",conf:82,up:false,kind:"AI SELL",  pattern:"bear-engulf",pname:"Bearish Engulfing",sl:"180",tgt:"166"},
  {sym:"TATASTEEL", price:"148.20",tf:"1h",conf:79,up:false,kind:"BREAKDOWN",pattern:"double-top",pname:"Double Top",sl:"153",tgt:"140"},
  {sym:"SBIN",      price:"812.40",tf:"1D",conf:76,up:true, kind:"AI BUY",   pattern:"double-bot",pname:"Double Bottom",sl:"795",tgt:"845"},
  {sym:"ADANIENT",  price:"2456.00",tf:"15m",conf:74,up:false,kind:"AI SELL", pattern:"shooting",pname:"Shooting Star",sl:"2510",tgt:"2380"}
];

var ALERT_TYPES=[
  {ic:"&#128640;",name:"Breakout Alerts",   on:true},
  {ic:"&#128201;",name:"Breakdown Alerts",  on:true},
  {ic:"&#128202;",name:"Volume Spike",      on:true},
  {ic:"&#128200;",name:"OI Alerts",         on:false},
  {ic:"&#9889;",  name:"Gamma Blast",       on:false},
  {ic:"&#128266;",name:"Voice Alerts",      on:false},
  {ic:"&#128276;",name:"Push Notifications",on:true}
];

export default function SignalsPage(props){
  var [view,setView]=useState(null);
  var [tf,setTf]=useState("all");
  var [alerts,setAlerts]=useState(ALERT_TYPES);

  if(view=="patterns") return <PatternLibrary onBack={function(){setView(null);}}/>;
  if(view=="watchlist") return <WatchlistPage onBack={function(){setView(null);}} onStock={props.onStock}/>;

  function toggle(i){
    setAlerts(alerts.map(function(a,idx){ return idx==i?Object.assign({},a,{on:!a.on}):a; }));
  }
  var sigs=ALL_SIGNALS.filter(function(s){ return tf=="all"||s.tf==tf; });

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      <div style={{background:BG,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        {props.onBack?<button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>:null}
        <div style={{flex:1}}><div style={{fontSize:16,fontWeight:900,color:T1}}>Trading Signals</div><div style={{fontSize:9,color:T2}}>AI alerts and patterns</div></div>
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
            <div style={{fontSize:10,fontWeight:700,color:T1,marginTop:4}}>Patterns</div>
          </button>
        </div>

        {/* TIMEFRAME FILTER */}
        <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14}}>
          {["all"].concat(TFS).map(function(t){
            var act=tf==t;
            return <button key={t} onClick={function(){setTf(t);}} style={{background:act?CYAN:"rgba(255,255,255,0.05)",border:"1px solid "+(act?CYAN:BD),borderRadius:16,padding:"5px 13px",color:act?"#04060D":T2,fontSize:11,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{t=="all"?"All":t}</button>;
          })}
        </div>

        {/* SIGNALS LIST */}
        <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:9}}>AI BUY / SELL SIGNALS</div>
        <div style={{marginBottom:18}}>
          {sigs.map(function(s){
            var col=s.up?UP:DOWN;
            return (
              <div key={s.sym} onClick={function(){if(props.onStock)props.onStock({sym:s.sym,ltp:s.price,up:s.up,chgPct:1});}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:12,marginBottom:9,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:11}}>
                  <div style={{width:46,height:46,background:CARD2,border:"1px solid "+BD,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <PatternMini id={s.pattern} size={36}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontSize:13,fontWeight:800,color:T1}}>{s.sym}</span>
                      <span style={{fontSize:7.5,fontWeight:800,color:col,background:s.up?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",padding:"2px 6px",borderRadius:5}}>{s.kind}</span>
                    </div>
                    <div style={{fontSize:9,color:T2,marginTop:2}}>{s.pname}  &#8226;  {s.tf}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:800,color:col,fontFamily:"monospace"}}>Rs {s.price}</div>
                    <div style={{fontSize:9,color:col,fontWeight:700}}>Conf {s.conf}%</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:9}}>
                  <div style={{flex:1,background:CARD2,borderRadius:7,padding:"5px 9px"}}><span style={{fontSize:8,color:DOWN}}>SL </span><span style={{fontSize:10,color:T1,fontWeight:700}}>{s.sl}</span></div>
                  <div style={{flex:1,background:CARD2,borderRadius:7,padding:"5px 9px"}}><span style={{fontSize:8,color:UP}}>Target </span><span style={{fontSize:10,color:T1,fontWeight:700}}>{s.tgt}</span></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ALERT SETTINGS */}
        <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:9}}>ALERT SETTINGS</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
          {alerts.map(function(a,i){
            return (
              <div key={a.name} style={{display:"flex",alignItems:"center",padding:"12px 13px",borderBottom:i<alerts.length-1?"1px solid "+BD:"none"}}>
                <span style={{fontSize:15,marginRight:11}} dangerouslySetInnerHTML={{__html:a.ic}}/>
                <span style={{flex:1,fontSize:12,color:T1,fontWeight:600}}>{a.name}</span>
                <button onClick={function(){toggle(i);}} style={{width:40,height:22,borderRadius:11,border:"none",background:a.on?UP:"rgba(255,255,255,0.12)",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
                  <div style={{position:"absolute",top:2,left:a.on?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}></div>
                </button>
              </div>
            );
          })}
        </div>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:14}}>
          <div style={{fontSize:9,color:"#F97316"}}>Educational signals only. Not buy or sell recommendations. Not SEBI registered.</div>
        </div>
      </div>
    </div>
  );
                }
