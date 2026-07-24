import { getTopic } from "./LearnTopicData";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - LearnTopicPage.jsx
// Dedicated educational page per Learn topic. Voice, deeper-module link.
// Educational only. Rules: no backtick, no triple-equals, ASCII.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function LearnTopicPage(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; DOWN=theme.c.down;
  var BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD2 = theme.c.border2, BG = theme.c.bg, CARD = theme.c.card, T2 = theme.c.text2; T1=theme.c.text1; UP=theme.c.up;

  var d=getTopic(props.id);
  var setTab=props.setTab||function(){};
  function speak(){
    try{ if(!window.speechSynthesis)return; window.speechSynthesis.cancel();
      var txt=d.title+". "+d.intro+" "+d.sections.map(function(s){return s.h+". "+s.p;}).join(" ");
      var u=new SpeechSynthesisUtterance(txt); u.lang="en-IN"; u.rate=0.95; window.speechSynthesis.speak(u);
    }catch(e){}
  }
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:BG,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:900,color:T1}}>{d.title}</div>
          <div style={{fontSize:12,color:T2}}>{d.level} &#8226; {d.mins}</div>
        </div>
        <button onClick={speak} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:9,padding:"8px 12px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128266;</button>
      </div>

      <div style={{padding:16}}>
        {/* intro */}
        <div style={{background:theme.c.card,border:"1px solid rgba(59,130,246,0.25)",borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,color:T1,lineHeight:1.65}}>{d.intro}</div>
        </div>

        {/* sections */}
        {d.sections.map(function(s,i){
          return (
            <div key={i} style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:800,color:T1,marginBottom:8}}>{s.h}</div>
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12}}>
                <div style={{fontSize:12,color:T1,lineHeight:1.65}}>{s.p}</div>
              </div>
            </div>
          );
        })}

        {/* key points */}
        <div style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:8,marginTop:16}}>KEY POINTS</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:16}}>
          {d.keyPoints.map(function(k,i){
            return <div key={i} style={{fontSize:12,color:T1,lineHeight:1.5,padding:"4px 0",borderBottom:i<d.keyPoints.length-1?"1px solid "+BD2:"none"}}><span style={{color:UP}}>&#10003;</span>  {k}</div>;
          })}
        </div>

        {/* mistakes */}
        <div style={{fontSize:12,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:8}}>COMMON MISTAKES</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:16}}>
          {d.mistakes.map(function(m,i){
            return <div key={i} style={{fontSize:12,color:T1,lineHeight:1.5,padding:"4px 0",borderBottom:i<d.mistakes.length-1?"1px solid "+BD2:"none"}}><span style={{color:DOWN}}>&#33;</span>  {m}</div>;
          })}
        </div>

        {/* deeper module link */}
        {d.deeper && typeof d.deeper=="string" ?(
          <button onClick={function(){setTab(d.deeper);}} style={{width:"100%",background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:11,padding:"12px",marginBottom:16,color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Explore the full module &#8594;</button>
        ):null}
        {d.deeper && d.deeper.academy ?(
          <button onClick={function(){ if(props.onOpenAcademy){ props.onOpenAcademy(d.deeper.academy); } else { setTab("academy"); } }} style={{width:"100%",background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:11,padding:"12px",marginBottom:16,color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>Continue in Academy &#8226; View Full Course &#8594;</button>
        ):null}

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12}}>
          <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.5}}>Educational Content Only. Not investment advice or a trading recommendation. Consult a SEBI-registered adviser before investing.</div>
        </div>
      </div>
    </div>
  );
}
