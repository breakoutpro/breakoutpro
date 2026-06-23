import { useState } from "react";

// BreakoutPro - GainersLosers.jsx
// Dedicated full-list pages for Top Gainers / Top Losers.
// Opened as an overlay from HomeLower when a compact icon card is tapped.
// Rules: no backticks, no triple-equals, ASCII only (HTML entities for emoji).

var BG="#050505",CARD="#101318",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",PROBLUE="#60A5FA";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function GainersLosers(props){
  var mode=props.mode||"gainers";
  var rows=props.rows||[];
  var onBack=props.onBack||function(){};
  var setTab=props.setTab||function(){};

  var isGainers=mode!="losers";
  var accent=isGainers?UP:DOWN;
  var title=isGainers?"Top Gainers":"Top Losers";
  var icon=isGainers?"&#128640;":"&#128201;";

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:84,color:T1}}>

      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",position:"sticky",top:0,background:BG,zIndex:10,borderBottom:"1px solid "+BD}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,width:34,height:34,color:T1,fontSize:15,cursor:"pointer",flexShrink:0}}>&#8592;</button>
        <span style={{fontSize:18}} dangerouslySetInnerHTML={{__html:icon}}/>
        <span style={{fontSize:18,fontWeight:900,color:T1}}>{title}</span>
      </div>

      <div style={{padding:"12px 14px"}}>
        {rows.map(function(r,i){
          var pct=r.pct;
          var ltp=r.ltp;
          return (
            <div key={r.sym} onClick={function(){setTab("markets");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"14px",marginBottom:9,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center"}}>
                <span style={{color:T3,fontSize:12,fontWeight:800,width:24}}>{i+1}</span>
                <div>
                  <div style={{color:T1,fontSize:15,fontWeight:800}}>{r.sym}</div>
                  <div style={{color:T3,fontSize:10,marginTop:2}}>NSE</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:T1,fontSize:15,fontWeight:800,fontFamily:"monospace"}}>{ltp?ltp.toLocaleString("en-IN",{maximumFractionDigits:1}):""}</div>
                <div style={{color:accent,fontSize:13,fontWeight:800,marginTop:2}}>{pct>=0?"+":""}{pct}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
