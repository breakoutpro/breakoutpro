import { useState, useEffect } from "react";

import { useTheme } from "../theme/ThemeProvider";
var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",G="#00C853",G2="#00E676",R="#EF4444",BLUE="#3B82F6",T1="#FFFFFF",T2="#8899BB",T3="#475569";

var SYMS=[
  {sym:"NIFTY 50",base:23969},
  {sym:"BANKNIFTY",base:52134},
  {sym:"RELIANCE",base:2845},
  {sym:"TCS",base:3654},
];

function calcCPR(high,low,close){
  var pivot=(high+low+close)/3;
  var bc=(high+low)/2;
  var tc=pivot+(pivot-bc);
  return {pivot:pivot,tc:Math.max(tc,bc),bc:Math.min(tc,bc)};
}

export default function ScalperMode(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; CB=theme.c.card; DB=theme.c.bg; G2=theme.c.up; R=theme.c.down; T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue;

  var setTab = props.setTab || function(){};
  var [selSym,setSelSym]=useState(SYMS[0]);
  var [price,setPrice]=useState(SYMS[0].base);
  var [vwap,setVwap]=useState(SYMS[0].base*0.998);
  var [ema9,setEma9]=useState(SYMS[0].base*1.001);
  var [ema21,setEma21]=useState(SYMS[0].base*0.997);
  var [rsi,setRsi]=useState(54);
  var [signal,setSignal]=useState("WAIT");

  var cpr = calcCPR(selSym.base*1.008,selSym.base*0.992,selSym.base);

  useEffect(function(){
    setPrice(selSym.base);
    setVwap(selSym.base*0.998);
    setEma9(selSym.base*1.001);
    setEma21(selSym.base*0.997);
  },[selSym]);

  // SAFETY PATCH: continuous Math.random price/RSI ticking removed - this
  // tool's price/VWAP/EMA/RSI/signal are simulated for practice, not live
  // market values. See disclosure banner added to the render below.

  useEffect(function(){
    var bullish=0,bearish=0;
    if(price>vwap) bullish++; else bearish++;
    if(ema9>ema21) bullish++; else bearish++;
    if(rsi>55) bullish++; else if(rsi<45) bearish++;
    if(price>cpr.tc) bullish++; else if(price<cpr.bc) bearish++;

    if(bullish>=3) setSignal("BUY");
    else if(bearish>=3) setSignal("SELL");
    else setSignal("WAIT");
  },[price,vwap,ema9,ema21,rsi]);

  var sigColor = signal=="BUY"?G2:signal=="SELL"?R:BLUE;

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:32}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{fontSize:18,fontWeight:900,color:T1,marginBottom:8}}>Scalper <span style={{color:BLUE}}>Mode</span></div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{fontSize:12,fontWeight:800,color:BLUE,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",padding:"4px 8px",borderRadius:5,letterSpacing:0.5}}>SIMULATED</span>
          <span style={{fontSize:12,color:T3}}>Practice mode. Price, RSI, and signal are simulated, not live market values.</span>
        </div>
        <div style={{display:"flex",gap:8,overflowX:"auto"}}>
          {SYMS.map(function(s){
            var act=selSym.sym==s.sym;
            return <button key={s.sym} onClick={function(){setSelSym(s);}} style={{background:act?"rgba(59,130,246,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?BLUE:BD),borderRadius:8,padding:"8px 12px",color:act?BLUE:T2,fontSize:12,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{s.sym}</button>;
          })}
        </div>
      </div>

      <div style={{padding:"12px 16px"}}>

        {/* Signal banner */}
        <div style={{background:sigColor+"15",border:"1px solid "+sigColor+"40",borderRadius:16,padding:"16px",marginBottom:16,textAlign:"center"}}>
          <div style={{fontSize:12,color:T2,marginBottom:4}}>SCALPING SIGNAL</div>
          <div style={{fontSize:22,fontWeight:900,color:sigColor,marginBottom:4}}>{signal}</div>
          <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:T1}}>Rs{price.toLocaleString("en-IN")}</div>
        </div>

        {/* EMA */}
        <div style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.5,marginBottom:8}}>EMA CROSSOVER</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px"}}>
            <div style={{fontSize:12,color:T2,marginBottom:4}}>EMA 9</div>
            <div style={{fontSize:12,fontWeight:700,color:ema9>ema21?G2:R}}>Rs{ema9.toFixed(2)}</div>
          </div>
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px"}}>
            <div style={{fontSize:12,color:T2,marginBottom:4}}>EMA 21</div>
            <div style={{fontSize:12,fontWeight:700,color:T1}}>Rs{ema21.toFixed(2)}</div>
          </div>
        </div>

        {/* VWAP */}
        <div style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.5,marginBottom:8}}>VWAP</div>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:12,color:T2}}>VWAP Level</span>
          <span style={{fontSize:12,fontWeight:700,color:price>vwap?G2:R}}>Rs{vwap.toFixed(2)} {price>vwap?"(Above)":"(Below)"}</span>
        </div>

        {/* CPR */}
        <div style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.5,marginBottom:8}}>CPR (Central Pivot Range)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          <div style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:"8px 8px",textAlign:"center"}}>
            <div style={{fontSize:12,color:T2}}>TC</div>
            <div style={{fontSize:12,fontWeight:700,color:R}}>{cpr.tc.toFixed(0)}</div>
          </div>
          <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"8px 8px",textAlign:"center"}}>
            <div style={{fontSize:12,color:T2}}>Pivot</div>
            <div style={{fontSize:12,fontWeight:700,color:BLUE}}>{cpr.pivot.toFixed(0)}</div>
          </div>
          <div style={{background:"rgba(0,200,83,0.06)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:10,padding:"8px 8px",textAlign:"center"}}>
            <div style={{fontSize:12,color:T2}}>BC</div>
            <div style={{fontSize:12,fontWeight:700,color:G2}}>{cpr.bc.toFixed(0)}</div>
          </div>
        </div>

        {/* RSI */}
        <div style={{fontSize:12,fontWeight:700,color:T3,letterSpacing:0.5,marginBottom:8}}>RSI (14)</div>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:12,color:T2}}>{rsi>70?"Overbought":rsi<30?"Oversold":"Neutral Zone"}</span>
            <span style={{fontSize:12,fontWeight:700,color:rsi>70?R:rsi<30?G2:T1}}>{rsi}</span>
          </div>
          <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,position:"relative"}}>
            <div style={{position:"absolute",left:(rsi)+"%",top:-2,width:10,height:10,borderRadius:"50%",background:rsi>70?R:rsi<30?G2:BLUE,transform:"translateX(-50%)"}}></div>
          </div>
        </div>

        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:12}}>
          <div style={{fontSize:12,color:theme.c.warn}}>Scalping involves high risk and rapid decisions. Educational tool only, not investment advice.</div>
        </div>

      </div>
    </div>
  );
}
