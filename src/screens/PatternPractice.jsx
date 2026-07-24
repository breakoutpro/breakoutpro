import { useState } from "react";
import { PATTERNS } from "./PatternEduData";
import PatternChartEngine from "./PatternChartEngine";
import { getChartSpec, ANIMATED_IDS } from "./PatternChartData";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - PatternPractice.jsx
// Practice Mode (guess the pattern) + Quiz. Pure black, subtle green/red.
// Rules: no backtick, no triple-equals, ASCII only.

var BG="#000000",CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function shuffle(a){ var x=a.slice(); for(var i=x.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=x[i];x[i]=x[j];x[j]=t; } return x; }
var ANIM=PATTERNS.filter(function(p){return ANIMATED_IDS.indexOf(p.id)!=-1;});

// PRACTICE MODE: show animated chart, user guesses pattern from 4 options.
export function PatternPractice(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; BG=theme.c.bg; DOWN=theme.c.down;
  var BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, T2 = theme.c.text2; T1=theme.c.text1; UP=theme.c.up;

  var [round,setRound]=useState(0);
  var [q,setQ]=useState(makeQ());
  var [picked,setPicked]=useState(null);
  var [score,setScore]=useState(0);

  function makeQ(){
    var correct=ANIM[Math.floor(Math.random()*ANIM.length)];
    var others=shuffle(ANIM.filter(function(p){return p.id!=correct.id;})).slice(0,3);
    var opts=shuffle([correct].concat(others));
    return {correct:correct,opts:opts,spec:getChartSpec(correct.id,false)};
  }
  function pick(p){
    if(picked) return;
    setPicked(p);
    if(p.id==q.correct.id) setScore(score+1);
  }
  function next(){
    setPicked(null); setQ(makeQ()); setRound(round+1);
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:BG,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}><div style={{fontSize:18,fontWeight:900,color:T1}}>Practice Mode</div><div style={{fontSize:12,color:T2}}>Guess the pattern</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:900,color:UP}}>{score}</div><div style={{fontSize:12,color:T2}}>Score</div></div>
      </div>

      <div style={{padding:16}}>
        <div style={{fontSize:12,color:T1,fontWeight:700,marginBottom:12,textAlign:"center"}}>Which pattern is forming?</div>
        <PatternChartEngine key={"prac"+round} spec={q.spec} autoplay={true}/>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:16}}>
          {q.opts.map(function(p){
            var state="idle";
            if(picked){
              if(p.id==q.correct.id) state="correct";
              else if(p.id==picked.id) state="wrong";
            }
            var bg=state=="correct"?"rgba(34,197,94,0.15)":state=="wrong"?"rgba(239,68,68,0.15)":CARD;
            var bd=state=="correct"?UP:state=="wrong"?DOWN:BD;
            var tc=state=="correct"?UP:state=="wrong"?DOWN:T1;
            return (
              <button key={p.id} onClick={function(){pick(p);}} style={{background:bg,border:"1px solid "+bd,borderRadius:10,padding:"12px 8px",color:tc,fontSize:12,fontWeight:700,cursor:picked?"default":"pointer",fontFamily:"inherit"}}>{p.name}</button>
            );
          })}
        </div>

        {picked?(
          <div style={{marginTop:16}}>
            <div style={{background:picked.id==q.correct.id?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",border:"1px solid "+(picked.id==q.correct.id?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.25)"),borderRadius:12,padding:12,marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:800,color:picked.id==q.correct.id?UP:DOWN,marginBottom:4}}>{picked.id==q.correct.id?"Correct!":"Not quite"}</div>
              <div style={{fontSize:12,color:T1,lineHeight:1.5}}>This is a <b>{q.correct.name}</b> ({q.correct.bias}).</div>
            </div>
            <button onClick={next} style={{width:"100%",background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Next Pattern &#8594;</button>
          </div>
        ):null}
      </div>
    </div>
  );
}

// QUIZ: text questions about a specific pattern.
export function PatternQuiz(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; BG=theme.c.bg; DOWN=theme.c.down;
  var BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, BLUE=theme.c.blue, T2 = theme.c.text2; T1=theme.c.text1; UP=theme.c.up;

  var bias=props.bias||"Bullish";
  var name=props.name||"Pattern";
  var QS=[
    {q:"What does this pattern usually signal?", opts:[bias=="Bullish"?"A move up":"A move down", bias=="Bullish"?"A move down":"A move up", "Nothing", "Always sideways"], a:0},
    {q:"When should you enter?", opts:["Before confirmation","After the breakout candle confirms","Randomly","Never"], a:1},
    {q:"What protects you if wrong?", opts:["Hope","A stop loss","Bigger position","Ignoring it"], a:1},
    {q:"A healthy risk reward ratio is at least?", opts:["1:0.5","1:1","1:2","1:0"], a:2}
  ];
  var [idx,setIdx]=useState(0);
  var [picked,setPicked]=useState(null);
  var [score,setScore]=useState(0);
  var [done,setDone]=useState(false);
  var cur=QS[idx];

  function pick(i){
    if(picked!=null) return;
    setPicked(i);
    if(i==cur.a) setScore(score+1);
  }
  function next(){
    if(idx>=QS.length-1){ setDone(true); return; }
    setIdx(idx+1); setPicked(null);
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:BG,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}><div style={{fontSize:18,fontWeight:900,color:T1}}>{name} Quiz</div><div style={{fontSize:12,color:T2}}>{done?"Complete":"Question "+(idx+1)+" of "+QS.length}</div></div>
      </div>

      <div style={{padding:16}}>
        {done?(
          <div style={{textAlign:"center",padding:"32px 12px"}}>
            <div style={{fontSize:32,fontWeight:900,color:score>=3?UP:BLUE}}>{score}/{QS.length}</div>
            <div style={{fontSize:14,color:T1,fontWeight:700,marginTop:8}}>{score>=3?"Well done!":"Keep practicing"}</div>
            <button onClick={props.onBack} style={{marginTop:16,background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Back to Pattern</button>
          </div>
        ):(
          <div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
              <div style={{fontSize:14,fontWeight:700,color:T1,lineHeight:1.5}}>{cur.q}</div>
            </div>
            {cur.opts.map(function(o,i){
              var state="idle";
              if(picked!=null){ if(i==cur.a)state="correct"; else if(i==picked)state="wrong"; }
              var bg=state=="correct"?"rgba(34,197,94,0.15)":state=="wrong"?"rgba(239,68,68,0.15)":CARD;
              var bd=state=="correct"?UP:state=="wrong"?DOWN:BD;
              var tc=state=="correct"?UP:state=="wrong"?DOWN:T1;
              return <button key={i} onClick={function(){pick(i);}} style={{display:"block",width:"100%",textAlign:"left",background:bg,border:"1px solid "+bd,borderRadius:10,padding:"12px",marginBottom:8,color:tc,fontSize:12,fontWeight:600,cursor:picked!=null?"default":"pointer",fontFamily:"inherit"}}>{o}</button>;
            })}
            {picked!=null?<button onClick={next} style={{width:"100%",background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",marginTop:8,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{idx>=QS.length-1?"See Result":"Next"} &#8594;</button>:null}
          </div>
        )}
      </div>
    </div>
  );
}
  
