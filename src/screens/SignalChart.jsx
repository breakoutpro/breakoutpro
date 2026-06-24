import { useEffect, useRef, useState } from "react";

// BreakoutPro - SignalChart.jsx
// Full TradingView chart screen opened from a trading signal.
// Embeds the TradingView widget for a given NSE symbol.
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

// Map symbols to TradingView format that works on the free widget.
// Indices use NSE index symbols. Stocks use BSE (free widget supports BSE).
function tvSymbol(sym){
  if(sym=="NIFTY") return "NSE:NIFTY";
  if(sym=="BANKNIFTY") return "NSE:BANKNIFTY";
  if(sym=="FINNIFTY") return "NSE:CNXFINANCE";
  return "BSE:"+sym;
}
function exLabel(sym){
  if(sym=="NIFTY"||sym=="BANKNIFTY"||sym=="FINNIFTY") return "NSE";
  return "BSE";
}

export default function SignalChart(props){
  var s=props.s||{};
  var sym=s.sym||"NIFTY";
  var [frame,setFrame]=useState(s.frame=="1h"?"60":s.frame=="5m"?"5":"15");
  var holderRef=useRef(null);

  useEffect(function(){
    var holder=holderRef.current;
    if(!holder) return;
    holder.innerHTML="";
    var box=document.createElement("div");
    box.id="tv_"+sym+"_"+Date.now();
    box.style.height="100%";
    box.style.width="100%";
    holder.appendChild(box);

    function build(){
      try{
        if(!window.TradingView) return;
        new window.TradingView.widget({
          autosize:true,
          symbol:tvSymbol(sym),
          interval:frame,
          timezone:"Asia/Kolkata",
          theme:"dark",
          style:"1",
          locale:"in",
          toolbar_bg:"#0B0E13",
          enable_publishing:false,
          hide_side_toolbar:true,
          allow_symbol_change:false,
          container_id:box.id
        });
      }catch(e){}
    }

    if(window.TradingView){
      build();
    } else {
      var sc=document.createElement("script");
      sc.src="https://s3.tradingview.com/tv.js";
      sc.async=true;
      sc.onload=build;
      holder.appendChild(sc);
    }
  },[sym,frame]);

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
      </div>

      {/* TRADINGVIEW CHART */}
      <div ref={holderRef} style={{flex:1,minHeight:0,background:"#0B0E13"}}></div>

      {/* DISCLAIMER */}
      <div style={{background:"rgba(249,115,22,0.06)",borderTop:"1px solid rgba(249,115,22,0.15)",padding:"8px 14px",flexShrink:0}}>
        <div style={{fontSize:8,color:"#F97316",lineHeight:1.5,textAlign:"center"}}>Educational only. Not SEBI registered. Chart by TradingView.</div>
      </div>

    </div>
  );
}
