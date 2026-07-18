import { useState } from "react";
import { PATTERNS, getPattern } from "./PatternEduData";
import { PatternMini } from "./PatternVisuals";
import PatternEduPro from "./PatternEduPro";
import { PatternPractice, PatternQuiz } from "./PatternPractice";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - PatternLibrary.jsx
// Pattern grid + routes to premium interactive education. Pure black, green/red bias.
// Rules: no backtick, no triple-equals, ASCII only.

var BG="#000000",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function biasColor(b){ return b=="Bullish"?UP:b=="Bearish"?DOWN:GOLD; }

export default function PatternLibrary(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var T2 = theme.c.text2;

  var [sel,setSel]=useState(null);
  var [mode,setMode]=useState("edu");

  if(sel){
    var meta=PATTERNS.filter(function(p){return p.id==sel;})[0]||PATTERNS[0];
    if(mode=="practice") return <PatternPractice onBack={function(){setMode("edu");}}/>;
    if(mode=="quiz") return <PatternQuiz name={meta.name} bias={meta.bias} onBack={function(){setMode("edu");}}/>;
    return <PatternEduPro id={sel} onBack={function(){setSel(null);setMode("edu");}} onPractice={function(){setMode("practice");}} onQuiz={function(){setMode("quiz");}}/>;
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:BG,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        {props.onBack?<button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>:null}
        <div>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>Pattern Library</div>
          <div style={{fontSize:9,color:T2}}>Tap any pattern to learn</div>
        </div>
      </div>

      <div style={{padding:14}}>
        <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.6,marginBottom:10}}>CANDLESTICK PATTERNS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:18}}>
          {PATTERNS.filter(function(p){return p.type=="candle";}).map(function(p){
            return <PatCard key={p.id} p={p} onClick={function(){setSel(p.id);}}/>;
          })}
        </div>

        <div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.6,marginBottom:10}}>CHART PATTERNS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>
          {PATTERNS.filter(function(p){return p.type=="chart";}).map(function(p){
            return <PatCard key={p.id} p={p} onClick={function(){setSel(p.id);}}/>;
          })}
        </div>
      </div>
    </div>
  );
}

function PatCard(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card;

  var p=props.p;
  return (
    <div onClick={props.onClick} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"12px 8px",textAlign:"center",cursor:"pointer"}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:7}}>
        <PatternMini id={p.id} size={50}/>
      </div>
      <div style={{fontSize:9,fontWeight:700,color:T1,lineHeight:1.2,minHeight:22}}>{p.name}</div>
      <div style={{fontSize:8,fontWeight:700,color:biasColor(p.bias),marginTop:3}}>{p.bias}</div>
    </div>
  );
}
