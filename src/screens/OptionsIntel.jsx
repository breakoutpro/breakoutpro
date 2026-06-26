import { useState } from "react";
import { getOptionsIntel, toneColor } from "./OptionsIntelData";

// BreakoutPro - OptionsIntel.jsx
// HERO premium section: Options Intelligence. 12 metrics + AI + OI heatmap.
// Pure black glass, minimal green/red, blue links. Rules: no backtick, no triple-equals, ASCII.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function OptionsIntel(props){
  var data=getOptionsIntel(props.symbol);
  var [open,setOpen]=useState(null);

  return (
    <div style={{padding:"0 14px",marginTop:22}}>
      {/* HEADER */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:15,fontWeight:900,color:T1}}>Options Intelligence</span>
          <span style={{fontSize:7.5,fontWeight:800,color:GOLD,background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.3)",padding:"2px 7px",borderRadius:5,letterSpacing:0.5}}>PRO</span>
        </div>
        {props.onOpen?
          <button onClick={props.onOpen} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View Full &#8594;</button>
          :
          <span style={{fontSize:10,color:T2,fontFamily:"monospace"}}>{data.symbol} {data.spot}</span>
        }
      </div>
      <div style={{fontSize:9,color:T3,marginBottom:12}}>AI-powered option analytics. Tap any metric for insight.</div>

      {/* METRICS GRID */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {data.metrics.map(function(m){
          var col=toneColor(m.tone);
          var isOpen=open==m.key;
          return (
            <div key={m.key} onClick={function(){setOpen(isOpen?null:m.key);}} style={{background:CARD,border:"1px solid "+(isOpen?"rgba(59,130,246,0.4)":BD),borderRadius:12,padding:11,cursor:"pointer",gridColumn:isOpen?"span 2":"span 1",transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:9.5,color:T2,fontWeight:600}}>{m.label}</span>
                <span style={{width:6,height:6,borderRadius:"50%",background:col,display:"inline-block"}}></span>
              </div>
              <div style={{fontSize:15,fontWeight:800,color:col,marginTop:5,fontFamily:"monospace"}}>{m.val}</div>
              {isOpen?(
                <div style={{fontSize:10,color:T1,lineHeight:1.55,marginTop:8,paddingTop:8,borderTop:"1px solid "+BD2}}>
                  <span style={{color:CYAN,fontWeight:700}}>AI: </span>{m.ai}
                </div>
              ):null}
            </div>
          );
        })}
      </div>

      {/* OI HEATMAP */}
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:13,padding:13,marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:800,color:T1,marginBottom:3}}>Open Interest Heatmap</div>
        <div style={{fontSize:8.5,color:T3,marginBottom:11}}>Call OI (red) vs Put OI (green) by strike</div>
        {data.heatmap.map(function(h,i){
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
              <span style={{fontSize:9,color:T2,width:42,fontFamily:"monospace",flexShrink:0}}>{h.strike}</span>
              <div style={{flex:1,display:"flex",gap:2,height:14}}>
                <div style={{flex:1,display:"flex",justifyContent:"flex-end",background:CARD2,borderRadius:"3px 0 0 3px",overflow:"hidden"}}>
                  <div style={{width:h.put+"%",background:"rgba(34,197,94,0.55)",height:"100%"}}></div>
                </div>
                <div style={{flex:1,background:CARD2,borderRadius:"0 3px 3px 0",overflow:"hidden"}}>
                  <div style={{width:h.call+"%",background:"rgba(239,68,68,0.55)",height:"100%"}}></div>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{fontSize:8,color:UP}}>&#9664; Put OI</span>
          <span style={{fontSize:8,color:DOWN}}>Call OI &#9654;</span>
        </div>
      </div>

      {/* AI OPTION ANALYSIS */}
      <div style={{background:"linear-gradient(135deg,rgba(59,130,246,0.08),rgba(96,165,250,0.03))",border:"1px solid rgba(59,130,246,0.25)",borderRadius:13,padding:14}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
          <span style={{fontSize:13}} dangerouslySetInnerHTML={{__html:"&#129302;"}}/>
          <span style={{fontSize:12,fontWeight:800,color:CYAN}}>AI Option Analysis</span>
        </div>
        <div style={{fontSize:11.5,color:T1,lineHeight:1.65}}>{data.aiSummary}</div>
        <div style={{fontSize:8.5,color:T3,marginTop:10,paddingTop:9,borderTop:"1px solid rgba(59,130,246,0.15)"}}>Educational analysis only. Not a buy or sell recommendation.</div>
      </div>
    </div>
  );
}
