import { useState } from "react";
import { PATTERNS, getPattern } from "./PatternEduData";
import { PatternMini } from "./PatternVisuals";
import PatternChartEngine from "./PatternChartEngine";
import { getChartSpec, ANIMATED_IDS } from "./PatternChartData";

// BreakoutPro - PatternEduPro.jsx
// Premium interactive pattern education: animated chart, success/failed, R/R, voice, quiz.
// Pure black, subtle green/red. Rules: no backtick, no triple-equals, ASCII only.

var BG="#000000",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function biasColor(b){ return b=="Bullish"?UP:b=="Bearish"?DOWN:GOLD; }

function speak(text){
  try{
    if(typeof window=="undefined"||!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);
    u.lang="en-IN"; u.rate=0.95;
    window.speechSynthesis.speak(u);
  }catch(e){}
}

export default function PatternEduPro(props){
  var meta=PATTERNS.filter(function(p){return p.id==props.id;})[0]||PATTERNS[0];
  var d=getPattern(props.id);
  var bc=biasColor(meta.bias);
  var hasAnim=ANIMATED_IDS.indexOf(meta.id)!=-1;
  var [failed,setFailed]=useState(false);
  var spec=hasAnim?getChartSpec(meta.id,failed):null;

  // Risk/Reward calc from markers
  var rr=null;
  if(spec&&spec.markers){
    var e=null,sl=null,t=null;
    spec.markers.forEach(function(m){ if(m.type=="entry")e=m.price; if(m.type=="sl")sl=m.price; if(m.type=="target")t=m.price; });
    if(e!=null&&sl!=null&&t!=null){
      var risk=Math.abs(e-sl), reward=Math.abs(t-e);
      rr={risk:risk.toFixed(0),reward:reward.toFixed(0),ratio:(reward/risk).toFixed(1)};
    }
  }

  function voiceExplain(){
    speak(meta.name+". "+meta.bias+" pattern. "+d.psychology+" Entry: "+d.entry+" Stop loss: "+d.sl+" Target: "+d.target);
  }

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
        <button onClick={voiceExplain} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:9,padding:"7px 11px",color:CYAN,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128266; Listen</button>
      </div>

      <div style={{padding:14}}>
        {/* ANIMATED CHART or fallback mini */}
        {hasAnim?(
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <button onClick={function(){setFailed(false);}} style={tabBtn(!failed,UP)}>Successful Breakout</button>
              <button onClick={function(){setFailed(true);}} style={tabBtn(failed,DOWN)}>Failed Breakout</button>
            </div>
            <PatternChartEngine key={meta.id+(failed?"-f":"-s")} spec={spec} autoplay={true}/>
            <div style={{fontSize:9.5,color:T3,textAlign:"center",marginTop:8,lineHeight:1.5}}>
              {failed?"A failed breakout: price could not hold above the level and reversed. Always wait for confirmation and use a stop loss.":"Watch candles form, the level break, and volume rise on the breakout candle."}
            </div>
          </div>
        ):(
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:22,display:"flex",justifyContent:"center",marginBottom:16}}>
            <PatternMini id={meta.id} size={120}/>
          </div>
        )}

        {/* QUICK STATS */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          <div style={statBox()}><div style={{fontSize:8,color:T2}}>Success</div><div style={{fontSize:13,fontWeight:800,color:UP,marginTop:3}}>{d.success}</div></div>
          <div style={statBox()}><div style={{fontSize:8,color:T2}}>Timeframe</div><div style={{fontSize:10,fontWeight:700,color:T1,marginTop:4}}>{d.timeframe}</div></div>
          <div style={statBox()}><div style={{fontSize:8,color:T2}}>Risk</div><div style={{fontSize:10,fontWeight:700,color:GOLD,marginTop:4}}>{d.risk}</div></div>
        </div>

        {/* RISK / REWARD VISUAL */}
        {rr?(
          <Sec title="RISK / REWARD">
            <Box>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
                <span style={{fontSize:12,color:T1,fontWeight:700}}>Ratio</span>
                <span style={{fontSize:16,fontWeight:900,color:parseFloat(rr.ratio)>=2?UP:GOLD}}>1 : {rr.ratio}</span>
              </div>
              <div style={{display:"flex",height:14,borderRadius:4,overflow:"hidden"}}>
                <div style={{width:(100/(1+parseFloat(rr.ratio)))+"%",background:DOWN,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:8,color:"#fff",fontWeight:700}}>Risk</span>
                </div>
                <div style={{flex:1,background:UP,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:8,color:"#04060D",fontWeight:700}}>Reward</span>
                </div>
              </div>
              <div style={{fontSize:9.5,color:T2,marginTop:8,lineHeight:1.5}}>Risking {rr.risk} points to make {rr.reward} points. A ratio above 1:2 is considered healthy.</div>
            </Box>
          </Sec>
        ):null}

        <Sec title="PSYCHOLOGY BEHIND IT">
          <Box><div style={{fontSize:11.5,color:T1,lineHeight:1.6}}>{d.psychology}</div></Box>
        </Sec>

        <Sec title="HOW TO TRADE IT">
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
            <Row label="ENTRY" color={CYAN} val={d.entry}/>
            <Row label="STOP LOSS" color={DOWN} val={d.sl}/>
            <Row label="TARGET" color={UP} val={d.target} last={true}/>
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

        {/* PRACTICE + QUIZ buttons */}
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <button onClick={function(){if(props.onPractice)props.onPractice();}} style={{flex:1,background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:10,padding:"12px",color:CYAN,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#127919; Practice Mode</button>
          <button onClick={function(){if(props.onQuiz)props.onQuiz();}} style={{flex:1,background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:10,padding:"12px",color:CYAN,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#10067; Take Quiz</button>
        </div>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
          <div style={{fontSize:9,color:"#F97316"}}>Educational only. Patterns are not guarantees. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

function Row(props){
  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"11px 13px",borderBottom:props.last?"none":"1px solid "+BD}}>
      <span style={{fontSize:10,color:props.color,fontWeight:700}}>{props.label}</span>
      <span style={{fontSize:10.5,color:"#FFFFFF",textAlign:"right",maxWidth:200}}>{props.val}</span>
    </div>
  );
}
function tabBtn(act,col){
  return {flex:1,background:act?(col=="#22C55E"?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)"):"rgba(255,255,255,0.04)",border:"1px solid "+(act?col:"#1B2330"),borderRadius:9,padding:"8px",color:act?col:"#A0A7B4",fontSize:10.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"};
}
function statBox(){ return {background:"#101318",border:"1px solid #1B2330",borderRadius:10,padding:"10px 6px",textAlign:"center"}; }
            
