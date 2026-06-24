import { useState } from "react";
import LightweightChart from "./LightweightChart";
import TVDailyChart from "./TVDailyChart";

// BreakoutPro - SignalChart.jsx
// Hybrid chart screen. Intraday (5m/15m/1h) uses custom Lightweight Charts.
// Daily (1D) uses TradingView widget. No TradingView intraday errors.
// Rules: no backtick, no triple-equals, ASCII only.

var BG="#050505",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

var FRAMES=[
  {id:"5",label:"5m"},
  {id:"15",label:"15m"},
  {id:"60",label:"1h"},
  {id:"D",label:"1D"},
];

function exLabel(sym){
  if(sym=="NIFTY"||sym=="BANKNIFTY"||sym=="FINNIFTY") return "NSE";
  return "NSE";
}

export default function SignalChart(props){
  var s=props.s||{};
  var sym=s.sym||"NIFTY";
  var base=parseFloat(String(s.ltp||"100").replace(/,/g,""));
  var [frame,setFrame]=useState(s.frame=="1h"?"60":s.frame=="5m"?"5":"15");

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:BG,zIndex:400,display:"flex",flexDirection:"column"}}>

      {/* HEADER */}
      <div style={{background:CARD2,borderBottom:"1px solid "+BD,padding:"12px 14px",display:"flex",alignItems:"center",gap:11,flexShrink:0}}>
        <button onClick={props.onClose} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:15,cursor:"pointer",flexShrink:0}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:900,color:T1}}>{sym} <span style={{fontSize:9,color:T3,fontWeight:600}}>{exLabel(sym)}</span></div>
          <div style={{fontSize:9.5,color:T3,marginTop:1}}>{s.pattern||"Live Chart"}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:14,fontWeight:800,color:s.up?UP:DOWN,fontFamily:"monospace"}}>&#8377;{s.ltp||"--"}</div>
          {s.pct?<div style={{fontSize:9.5,color:s.up?UP:DOWN,fontFamily:"monospace"}}>{s.pct}</div>:null}
        </div>
      </div>

      {/* TIMEFRAME TABS */}
      <div style={{background:CARD2,borderBottom:"1px solid "+BD,padding:"8px 14px",display:"flex",gap:7,flexShrink:0}}>
        {FRAMES.map(function(f){
          var act=frame==f.id;
          return (
            <button key={f.id} onClick={function(){setFrame(f.id);}} style={{background:act?"rgba(59,130,246,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?BLUE:BD),borderRadius:8,padding:"6px 14px",color:act?CYAN:T2,fontSize:11,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit"}}>{f.label}</button>
          );
        })}
        <div style={{flex:1}}></div>
        <span style={{fontSize:8.5,color:T3,alignSelf:"center"}}>{frame=="D"?"Daily":"Intraday"}  &#8226;  EMA20</span>
      </div>

      {/* CHART AREA */}
      <div style={{flex:1,minHeight:0,background:"#0B0E13"}}>
        {frame=="D"
          ? <TVDailyChart sym={sym}/>
          : <LightweightChart sym={sym} frame={frame} base={base} up={s.up}/>
        }
      </div>

      {/* DISCLAIMER */}
      <div style={{background:"rgba(249,115,22,0.06)",borderTop:"1px solid rgba(249,115,22,0.15)",padding:"8px 14px",flexShrink:0}}>
        <div style={{fontSize:8,color:"#F97316",lineHeight:1.5,textAlign:"center"}}>Educational only. Not SEBI registered. Intraday candles are simulated for learning.</div>
      </div>

    </div>
  );
}
