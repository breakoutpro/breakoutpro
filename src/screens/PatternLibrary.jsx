import { useState } from "react";
import { PATTERNS, getPattern } from "./PatternEduData";
import { PatternMini } from "./PatternVisuals";

// BreakoutPro - PatternLibrary.jsx
// Pattern grid + full education page. Pure black, green/red bias, blue links.
// Rules: no backtick, no triple-equals, ASCII only.

var BG="#000000",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function biasColor(b){ return b=="Bullish"?UP:b=="Bearish"?DOWN:GOLD; }

export default function PatternLibrary(props){
  var [sel,setSel]=useState(null);
  if(sel) return <PatternEduPage id={sel} onBack={function(){setSel(null);}}/>;

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

export function PatternEduPage(props){
  var meta=PATTERNS.filter(function(p){return p.id==props.id;})[0]||PATTERNS[0];
  var d=getPattern(props.id);
  var bc=biasColor(meta.bias);

  function Sec(p2){ return <div style={{marginBottom:15}}><div style={{fontSize:10.5,fontWeight:800,color:T2,letterSpacing:0.5,marginBottom:8}}>{p2.title}</div>{p2.children}</div>; }
  function Box(p2){ return <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13}}>{p2.children}</div>; }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:BG,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>{meta.name}</div>
          <div style={{fontSize:9,fontWeight:700,color:bc}}>{meta.bias} Pattern</div>
        </div>
      </div>

      <div style={{padding:14}}>
        {/* LIVE ILLUSTRATION */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"22px",display:"flex",justifyContent:"center",marginBottom:16}}>
          <PatternMini id={meta.id} size={120}/>
        </div>

        {/* QUICK STATS */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
            <div style={{fontSize:8,color:T2}}>Success</div>
            <div style={{fontSize:13,fontWeight:800,color:UP,marginTop:3}}>{d.success}</div>
          </div>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
            <div style={{fontSize:8,color:T2}}>Timeframe</div>
            <div style={{fontSize:10,fontWeight:700,color:T1,marginTop:4}}>{d.timeframe}</div>
          </div>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
            <div style={{fontSize:8,color:T2}}>Risk</div>
            <div style={{fontSize:10,fontWeight:700,color:GOLD,marginTop:4}}>{d.risk}</div>
          </div>
        </div>

        <Sec title="PSYCHOLOGY BEHIND IT">
          <Box><div style={{fontSize:11.5,color:T1,lineHeight:1.6}}>{d.psychology}</div></Box>
        </Sec>

        <Sec title="HOW TO TRADE IT">
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",padding:"11px 13px",borderBottom:"1px solid "+BD}}>
              <span style={{fontSize:10,color:CYAN,fontWeight:700}}>ENTRY</span>
              <span style={{fontSize:10.5,color:T1,textAlign:"right",maxWidth:200}}>{d.entry}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"11px 13px",borderBottom:"1px solid "+BD}}>
              <span style={{fontSize:10,color:DOWN,fontWeight:700}}>STOP LOSS</span>
              <span style={{fontSize:10.5,color:T1,textAlign:"right",maxWidth:200}}>{d.sl}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"11px 13px"}}>
              <span style={{fontSize:10,color:UP,fontWeight:700}}>TARGET</span>
              <span style={{fontSize:10.5,color:T1,textAlign:"right",maxWidth:200}}>{d.target}</span>
            </div>
          </div>
        </Sec>

        <Sec title="REAL INDIAN EXAMPLES">
          <Box>
            {d.examples.map(function(e,i){
              return <div key={i} style={{fontSize:11,color:T1,lineHeight:1.5,padding:"5px 0",borderBottom:i<d.examples.length-1?"1px solid "+BD:"none"}}>&#8226;  {e}</div>;
            })}
          </Box>
        </Sec>

        <Sec title="COMMON MISTAKES">
          <Box>
            {d.mistakes.map(function(m,i){
              return <div key={i} style={{fontSize:11,color:T1,lineHeight:1.5,padding:"5px 0",borderBottom:i<d.mistakes.length-1?"1px solid "+BD:"none"}}><span style={{color:DOWN}}>&#33;</span>  {m}</div>;
            })}
          </Box>
        </Sec>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
          <div style={{fontSize:9,color:"#F97316"}}>Educational only. Patterns are not guarantees. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}
