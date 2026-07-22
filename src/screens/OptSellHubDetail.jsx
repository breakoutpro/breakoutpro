import { useState } from "react";
import { getHubDetail } from "./OptSellHubData";
import { getOptionsIntel } from "./OptionsIntelData";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - OptSellHubDetail.jsx
// Dedicated detail page for any Daily Hub card. Quiz, voice, related topics.
// Falls back to OptionsIntel metric explanations for dashboard metric keys.
// Educational only. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

// Build a detail object: hub content if present, else from OptionsIntel metric.
function resolve(id){
  var HUB_IDS=["possize","margin","eventrisk","gaprisk","volrisk","emotion","weekly","monthly","timedecay","gammarisk","volchange","sellerconsider"];
  if(HUB_IDS.indexOf(id)!=-1) return getHubDetail(id);
  // try OptionsIntel metric
  var oi=getOptionsIntel("NIFTY");
  var found=null;
  oi.metrics.forEach(function(g){ g.items.forEach(function(m){ if(m.key==id)found=m; }); });
  if(!found) return getHubDetail(id);
  return {
    title:found.label, icon:"&#128202;",
    explanation:found.what+" "+(found.why||""),
    why:found.why||"It helps option sellers read market positioning.",
    examples:[found.now||"", found.history||""].filter(Boolean),
    ai:found.advanced||found.beginner||found.now,
    mistakes:["Reading this metric in isolation","Ignoring how it shifts intraday"],
    best:["Combine with price and OI","Track changes over time"],
    quiz:null,
    related:["PCR","Max Pain","Theta"]
  };
}

export default function OptSellHubDetail(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD2 = theme.c.border2, BG = theme.c.bg, CARD = theme.c.card, CARD2 = theme.c.card2, T2 = theme.c.text2; T1=theme.c.text1; UP=theme.c.up;

  var d=resolve(props.id);
  var [pick,setPick]=useState(null);
  var quiz=d.quiz && d.quiz[0];

  function speak(){
    try{ if(!window.speechSynthesis)return; window.speechSynthesis.cancel();
      var txt=d.title+". "+d.explanation+" Why it matters. "+d.why+" "+d.ai;
      var u=new SpeechSynthesisUtterance(txt); u.lang="en-IN"; u.rate=0.95; window.speechSynthesis.speak(u);
    }catch(e){}
  }
  function Sec(p){ return <div style={{marginBottom:16}}><div style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:8}}>{p.t}</div>{p.children}</div>; }
  function Box(p){ return <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>{p.children}</div>; }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:BG,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}} dangerouslySetInnerHTML={{__html:d.icon}}/>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>{d.title}</div>
        </div>
        <button onClick={speak} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:9,padding:"8px 12px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128266;</button>
      </div>

      <div style={{padding:16}}>
        {/* explanation */}
        <div style={{background:theme.c.card,border:"1px solid rgba(59,130,246,0.25)",borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,color:T1,lineHeight:1.65}}>{d.explanation}</div>
        </div>

        <Sec t="WHY IT IS IMPORTANT"><Box><div style={{fontSize:12,color:T1,lineHeight:1.65}}>{d.why}</div></Box></Sec>

        <Sec t="REAL MARKET EXAMPLES">
          <Box>
            {d.examples.map(function(e,i){
              return <div key={i} style={{fontSize:12,color:T1,lineHeight:1.55,padding:"4px 0",borderBottom:i<d.examples.length-1?"1px solid "+BD2:"none"}}>&#8226;  {e}</div>;
            })}
          </Box>
        </Sec>

        <Sec t="AI EXPLANATION">
          <div style={{background:CARD,border:"1px solid rgba(59,130,246,0.2)",borderRadius:16,padding:12}}>
            <div style={{fontSize:12,color:T1,lineHeight:1.65}}><span style={{color:BLUE,fontWeight:700}}>AI: </span>{d.ai}</div>
          </div>
        </Sec>

        <Sec t="COMMON MISTAKES">
          <Box>
            {d.mistakes.map(function(m,i){
              return <div key={i} style={{fontSize:12,color:T1,lineHeight:1.5,padding:"4px 0",borderBottom:i<d.mistakes.length-1?"1px solid "+BD2:"none"}}><span style={{color:DOWN}}>&#33;</span>  {m}</div>;
            })}
          </Box>
        </Sec>

        <Sec t="BEST PRACTICES">
          <Box>
            {d.best.map(function(b,i){
              return <div key={i} style={{fontSize:12,color:T1,lineHeight:1.5,padding:"4px 0",borderBottom:i<d.best.length-1?"1px solid "+BD2:"none"}}><span style={{color:UP}}>&#10003;</span>  {b}</div>;
            })}
          </Box>
        </Sec>

        {/* QUIZ */}
        {quiz?(
          <Sec t="QUICK QUIZ">
            <Box>
              <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12,lineHeight:1.5}}>{quiz.q}</div>
              {quiz.opts.map(function(o,i){
                var state="idle";
                if(pick!=null){ if(i==quiz.a)state="correct"; else if(i==pick)state="wrong"; }
                var bg=state=="correct"?"rgba(34,197,94,0.15)":state=="wrong"?"rgba(239,68,68,0.15)":CARD2;
                var bd=state=="correct"?UP:state=="wrong"?DOWN:BD;
                var tc=state=="correct"?UP:state=="wrong"?DOWN:T1;
                return <button key={i} onClick={function(){if(pick==null)setPick(i);}} style={{display:"block",width:"100%",textAlign:"left",background:bg,border:"1px solid "+bd,borderRadius:9,padding:"12px",marginBottom:8,color:tc,fontSize:12,fontWeight:600,cursor:pick==null?"pointer":"default",fontFamily:"inherit"}}>{o}</button>;
              })}
              {pick!=null?<div style={{fontSize:12,color:pick==quiz.a?UP:DOWN,fontWeight:700,marginTop:4}}>{pick==quiz.a?"Correct!":"Review the explanation above."}</div>:null}
            </Box>
          </Sec>
        ):null}

        {/* RELATED */}
        {d.related && d.related.length?(
          <Sec t="RELATED TOPICS">
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {d.related.map(function(r,i){
                return <span key={i} style={{fontSize:12,color:BLUE,background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:14,padding:"8px 12px"}}>{r}</span>;
              })}
            </div>
          </Sec>
        ):null}

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12}}>
          <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.5}}>Educational Market Intelligence Only. This content is designed to help users understand options markets. It is not investment advice or a trading recommendation.</div>
        </div>
      </div>
    </div>
  );
}
