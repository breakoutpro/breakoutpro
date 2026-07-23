import React from "react";
import { useTheme } from "../theme/ThemeProvider";
var CB="#0B1224",BD="#1B2A4D",G="#00C853",G2="#00E676",R="#EF4444",BLUE="#3B82F6",T1="#FFFFFF",T2="#8FA2C9";

export default function IndexTabs(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var G = theme.c.brand, BLUE = theme.c.blue;

  var vt=props.viewTab,zones=props.zones||{},last=props.last||{},pat=props.pattern,rsi=props.rsi,ema9=props.ema9,ema21=props.ema21,trendCol=props.trendCol,trend=props.trend,rsiColor=props.rsiColor;

  if(vt=="zones") return (
    <div>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12}}>Support and Resistance Zones</div>
        {[["Resistance 2 (Strong)",zones.res2,R,"Major selling zone"],["Resistance 1 (Immediate)",zones.res1,R,"First resistance  watch rejection"],["Current Price",last.close,last.close>=last.open?G2:R,"Current market price"],["Support 1 (Immediate)",zones.sup1,G2,"First support  watch bounce"],["Support 2 (Strong)",zones.sup2,G2,"Major buying zone"]].map(function(r,i){
          var isCurr=i==2;
          return (
            <div key={r[0]} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 12px",borderRadius:10,marginBottom:8,background:isCurr?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.02)",border:"1px solid "+(isCurr?r[2]+"44":BD)}}>
              <div style={{width:4,height:36,borderRadius:2,background:r[2],flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{fontSize:12,color:T2,marginBottom:4}}>{r[0]}</div></div>
              <div style={{fontFamily:"monospace",fontSize:14,fontWeight:800,color:r[2]}}>{typeof r[1]=="number"?r[1].toLocaleString("en-IN",{minimumFractionDigits:2}):r[1]}</div>
            </div>
          );
        })}
      </div>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12}}>52 Week Range</div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:12,color:G2,fontWeight:700}}>{zones.low52w&&zones.low52w.toLocaleString("en-IN")} Low</span>
          <span style={{fontSize:12,color:R,fontWeight:700}}>High {zones.high52w&&zones.high52w.toLocaleString("en-IN")}</span>
        </div>
        <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden",position:"relative",marginBottom:4}}>
          <div style={{position:"absolute",left:0,top:0,height:"100%",background:""+R+"",width:"100%",opacity:0.4,borderRadius:3}}></div>
          <div style={{position:"absolute",top:-2,height:10,width:3,background:"#fff",borderRadius:2,left:((last.close-(zones.low52w||0))/((zones.high52w||1)-(zones.low52w||0))*100)+"%"}}></div>
        </div>
        <div style={{fontSize:12,color:T2,textAlign:"center"}}>Current: {last.close&&last.close.toLocaleString("en-IN")}  {zones.high52w&&zones.low52w?Math.round((last.close-zones.low52w)/(zones.high52w-zones.low52w)*100):0}% from 52W low</div>
      </div>
    </div>
  );

  if(vt=="pattern") return (
    <div>
      {pat?(
        <div style={{background:"#0A1020",border:"1px solid "+(pat.type=="bullish"?BLUE:pat.type=="bearish"?R:BLUE)+"44",borderRadius:16,padding:16,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:18,fontWeight:900,color:T1}}>{pat.name}</div>
            <span style={{background:pat.type=="bullish"?"rgba(37,99,235,0.15)":pat.type=="bearish"?"rgba(239,68,68,0.15)":"rgba(245,158,11,0.15)",color:pat.type=="bullish"?BLUE:pat.type=="bearish"?R:BLUE,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700}}>{pat.signal}</span>
          </div>
          <div style={{fontSize:12,color:T1,lineHeight:1.7,marginBottom:12}}>{pat.desc}</div>
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:12}}>
            <div style={{fontSize:12,color:T2}}>Educational pattern observation only. Not buy/sell advice.</div>
          </div>
        </div>
      ):(
        <div style={{background:CB,border:"1px solid rgba(245,158,11,0.2)",borderRadius:16,padding:"24px",textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:BLUE,marginBottom:8}}>Normal Candle</div>
          <div style={{fontSize:12,color:T2,lineHeight:1.7}}>No significant reversal pattern on latest candle. Watch support and resistance levels.</div>
        </div>
      )}
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16}}>
        <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12}}>Common Patterns Guide</div>
        {[["Doji","Open = Close. Market undecided.","neutral"],["Hammer","Long lower wick. Bullish reversal at support.","bullish"],["Shooting Star","Long upper wick. Bearish reversal at resistance.","bearish"],["Engulfing","One candle engulfs previous. Strong reversal.","bullish"],["Marubozu","Full body, no wicks. Strong momentum.","bullish"]].map(function(p){
          var col=p[2]=="bullish"?G2:p[2]=="bearish"?R:BLUE;
          return <div key={p[0]} style={{display:"flex",gap:8,marginBottom:8}}><div style={{width:4,height:4,borderRadius:"50%",background:col,marginTop:4,flexShrink:0}}></div><div><span style={{fontSize:12,fontWeight:700,color:col}}>{p[0]}: </span><span style={{fontSize:12,color:T2}}>{p[1]}</span></div></div>;
        })}
      </div>
    </div>
  );

  if(vt=="analysis") return (
    <div>
      <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12}}>Technical Analysis Summary</div>
        {[["Price vs EMA9",last.close>ema9?"Above EMA9":"Below EMA9",last.close>ema9?G2:R,last.close>ema9?"Short term bullish":"Short term bearish"],["Price vs EMA21",last.close>ema21?"Above EMA21":"Below EMA21",last.close>ema21?G2:R,last.close>ema21?"Medium term bullish":"Medium term bearish"],["RSI Signal",rsi>70?"Overbought":rsi<30?"Oversold":"Neutral Zone",rsiColor,rsi>70?"May face selling":"May face buying"],["Support",zones.sup1&&zones.sup1.toLocaleString("en-IN"),G2,"Watch for bounce here"],["Resistance",zones.res1&&zones.res1.toLocaleString("en-IN"),R,"Watch for rejection here"]].map(function(r){
          return (
            <div key={r[0]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid "+BD}}>
              <div><div style={{fontSize:12,fontWeight:600,color:T1}}>{r[0]}</div><div style={{fontSize:12,color:T2,marginTop:4}}>{r[3]}</div></div>
              <div style={{background:r[2]+"18",border:"1px solid "+r[2]+"33",borderRadius:8,padding:"4px 12px"}}><span style={{fontSize:12,fontWeight:700,color:r[2]}}>{r[1]}</span></div>
            </div>
          );
        })}
      </div>
      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12}}>
        <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.7}}>Educational only. Not SEBI registered. Not investment advice.</div>
      </div>
    </div>
  );

  return null;
}
