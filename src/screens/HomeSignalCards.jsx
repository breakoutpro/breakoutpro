import { useState } from "react";

// BreakoutPro - HomeSignalCards.jsx
// 4 premium AI signal cards for Home: Best Buy, Sell, Breakout, Breakdown.
// Pure black, green bullish, red bearish, blue buttons. Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

var SIGNALS=[
  {kind:"Best Buy",     tag:"AI BUY",      sym:"SHRIRAMFIN", price:"993.35",  tf:"15m", conf:88, up:true,  pattern:"Bullish Engulfing"},
  {kind:"Best Sell",    tag:"AI SELL",     sym:"WIPRO",      price:"174.49",  tf:"15m", conf:82, up:false, pattern:"Bearish Engulfing"},
  {kind:"Best Breakout",tag:"BREAKOUT",    sym:"RELIANCE",   price:"2,845.60",tf:"1h",  conf:85, up:true,  pattern:"Cup and Handle"},
  {kind:"Best Breakdown",tag:"BREAKDOWN",  sym:"TATASTEEL",  price:"148.20",  tf:"1h",  conf:79, up:false, pattern:"Double Top"}
];

function spark(up){
  // simple deterministic mini path
  var pts = up ? "0,26 12,22 24,24 36,16 48,18 60,8" : "0,6 12,10 24,8 36,16 48,14 60,24";
  return pts;
}

export default function HomeSignalCards(props){
  var setTab=props.setTab||function(){};
  return (
    <div style={{padding:"6px 0 0"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px 10px"}}>
        <span style={{fontSize:14,fontWeight:800,color:T1}}>Trading Signals</span>
        <button onClick={function(){setTab("signals");}} style={{background:"none",border:"none",color:BLUE,fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View All &#8594;</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,padding:"0 14px"}}>
        {SIGNALS.map(function(s){
          var col=s.up?UP:DOWN;
          return (
            <div key={s.kind} style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:8,fontWeight:800,color:col,letterSpacing:0.4,background:s.up?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",padding:"3px 7px",borderRadius:6}}>{s.tag}</span>
                <span style={{fontSize:8,color:T3,fontWeight:600}}>{s.tf}</span>
              </div>

              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:1}}>{s.sym}</div>
              <div style={{fontSize:13,fontWeight:800,color:col,fontFamily:"monospace",marginBottom:7}}>Rs {s.price}</div>

              <svg width="100%" height="32" viewBox="0 0 60 32" preserveAspectRatio="none" style={{display:"block",marginBottom:7}}>
                <polyline points={spark(s.up)} fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>

              <div style={{fontSize:8.5,color:T2,marginBottom:8}}>{s.pattern}</div>

              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
                <span style={{fontSize:8,color:T3}}>Confidence</span>
                <span style={{fontSize:11,fontWeight:800,color:col}}>{s.conf}%</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,marginBottom:10}}>
                <div style={{height:4,width:s.conf+"%",background:col,borderRadius:2}}></div>
              </div>

              <button onClick={function(){setTab("signals");}} style={{width:"100%",background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:8,padding:"7px",color:CYAN,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View Details</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
