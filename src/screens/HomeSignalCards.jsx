import { useState } from "react";
import { PatternMini } from "./PatternVisuals";
import { t } from "../i18n/translations";

// BreakoutPro - HomeSignalCards.jsx
// SEBI-safe: shows PATTERN DETECTION only (educational). No buy/sell, no entry/SL/target.
// Pure black, green/red for direction only, blue buttons. Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

// Detected patterns - educational detection only, NOT recommendations.
var DETECTED=[
  {sym:"SHRIRAMFIN", price:"993.35",  tf:"15m", up:true,  pat:"bull-engulf", pname:"Bullish Engulfing"},
  {sym:"RELIANCE",   price:"2,845.60",tf:"1h",  up:true,  pat:"cup-handle",  pname:"Cup and Handle"},
  {sym:"WIPRO",      price:"174.49",  tf:"15m", up:false, pat:"bear-engulf", pname:"Bearish Engulfing"},
  {sym:"TATASTEEL",  price:"148.20",  tf:"1h",  up:false, pat:"double-top",  pname:"Double Top"}
];

export default function HomeSignalCards(props){
  var setTab=props.setTab||function(){};
  return (
    <div style={{padding:"6px 0 0"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px 4px"}}>
        <span style={{fontSize:14,fontWeight:800,color:T1}}>{t("pattern_alerts")}</span>
        <button onClick={function(){setTab("signals");}} style={{background:"none",border:"none",color:BLUE,fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View All &#8594;</button>
      </div>
      <div style={{fontSize:9,color:T3,padding:"0 14px 10px"}}>Educational pattern detection. Tap to learn the pattern.</div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,padding:"0 14px"}}>
        {DETECTED.map(function(s){
          var col=s.up?UP:DOWN;
          return (
            <div key={s.sym} onClick={function(){setTab("signals");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:12,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}>
                <div style={{width:40,height:40,background:CARD2,border:"1px solid "+BD,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <PatternMini id={s.pat} size={32}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:800,color:T1}}>{s.sym}</div>
                  <div style={{fontSize:8,color:T3}}>{s.tf} timeframe</div>
                </div>
              </div>
              <div style={{fontSize:9.5,fontWeight:700,color:T2,marginBottom:3}}>{s.pname}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:12,fontWeight:800,color:col,fontFamily:"monospace"}}>Rs {s.price}</span>
                <span style={{fontSize:9,color:CYAN,fontWeight:700}}>Learn &#8594;</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
