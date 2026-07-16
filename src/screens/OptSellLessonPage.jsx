import { useState } from "react";
import { getLesson, LESSON_ORDER, lessonMeta } from "./OptSellLessonData";

// BreakoutPro - OptSellLessonPage.jsx
// Full premium lesson page: objectives, concepts, examples, AI, quiz, next/prev, bookmark.
// Educational only. Rules: no backtick, no triple-equals, ASCII only.

var BG="#050505",CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function levelColor(l){ return l=="Beginner"?UP:l=="Advanced"?DOWN:GOLD; }

function isBookmarked(id){
  try{ var b=JSON.parse(localStorage.getItem("bp_lesson_bm")||"[]"); return b.indexOf(id)!=-1; }catch(e){ return false; }
}
function toggleBookmark(id){
  try{
    var b=JSON.parse(localStorage.getItem("bp_lesson_bm")||"[]");
    var i=b.indexOf(id);
    if(i==-1)b.push(id); else b.splice(i,1);
    localStorage.setItem("bp_lesson_bm",JSON.stringify(b));
    return b.indexOf(id)!=-1;
  }catch(e){ return false; }
}
function markDone(id){
  try{
    var d=JSON.parse(localStorage.getItem("bp_lesson_done")||"[]");
    if(d.indexOf(id)==-1){ d.push(id); localStorage.setItem("bp_lesson_done",JSON.stringify(d)); }
  }catch(e){}
}

export default function OptSellLessonPage(props){
  var d=getLesson(props.id);
  var idx=LESSON_ORDER.indexOf(props.id);
  var prevId=idx>0?LESSON_ORDER[idx-1]:null;
  var nextId=idx<LESSON_ORDER.length-1?LESSON_ORDER[idx+1]:null;
  var [bm,setBm]=useState(isBookmarked(props.id));
  var [answers,setAnswers]=useState({});
  var [showResult,setShowResult]=useState(false);

  function speak(){
    try{ if(!window.speechSynthesis)return; window.speechSynthesis.cancel();
      var txt=d.title+". "+d.explanation+" "+d.concepts.map(function(c){return c.h+". "+c.p;}).join(" ");
      var u=new SpeechSynthesisUtterance(txt); u.lang="en-IN"; u.rate=0.95; window.speechSynthesis.speak(u);
    }catch(e){}
  }
  function share(){
    try{ if(navigator.share){ navigator.share({title:"BreakoutPro - "+d.title,text:"Learn "+d.title+" on BreakoutPro"}); } }catch(e){}
  }
  function pickAns(qi,oi){ if(showResult)return; var a=Object.assign({},answers); a[qi]=oi; setAnswers(a); }
  function submitQuiz(){ setShowResult(true); markDone(props.id); }
  var score=0; if(showResult){ d.quiz.forEach(function(q,i){ if(answers[i]==q.a)score++; }); }

  function Sec(p){ return <div style={{marginBottom:15}}><div style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:8}}>{p.t}</div>{p.children}</div>; }
  function Box(p){ return <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13}}>{p.children}</div>; }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      {/* HEADER */}
      <div style={{background:BG,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:15,fontWeight:900,color:T1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.title}</div>
          <div style={{fontSize:9,color:T2}}><span style={{color:levelColor(d.level),fontWeight:700}}>{d.level}</span> &#8226; {d.mins} read</div>
        </div>
        <button onClick={function(){setBm(toggleBookmark(props.id));}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:bm?GOLD:T2,fontSize:14,cursor:"pointer"}} dangerouslySetInnerHTML={{__html:bm?"&#9733;":"&#9734;"}}/>
        <button onClick={share} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T2,fontSize:13,cursor:"pointer"}} dangerouslySetInnerHTML={{__html:"&#10148;"}}/>
        <button onClick={speak} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:8,width:32,height:32,color:CYAN,fontSize:13,cursor:"pointer"}} dangerouslySetInnerHTML={{__html:"&#128266;"}}/>
      </div>

      <div style={{padding:14}}>
        {/* progress */}
        <div style={{fontSize:8.5,color:T3,marginBottom:10}}>Lesson {idx+1} of {LESSON_ORDER.length}</div>

        {/* objectives */}
        <Sec t="LEARNING OBJECTIVES">
          <Box>
            {d.objectives.map(function(o,i){
              return <div key={i} style={{fontSize:11,color:T1,lineHeight:1.5,padding:"4px 0"}}><span style={{color:CYAN}}>&#9656;</span>  {o}</div>;
            })}
          </Box>
        </Sec>

        {/* explanation */}
        <div style={{background:"linear-gradient(135deg,rgba(59,130,246,0.08),rgba(96,165,250,0.03))",border:"1px solid rgba(59,130,246,0.25)",borderRadius:13,padding:14,marginBottom:15}}>
          <div style={{fontSize:11.5,color:T1,lineHeight:1.65}}>{d.explanation}</div>
        </div>

        {/* step-by-step concepts */}
        <Sec t="STEP BY STEP">
          {d.concepts.map(function(c,i){
            return (
              <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13,marginBottom:8}}>
                <div style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                  <span style={{width:20,height:20,borderRadius:"50%",background:"rgba(59,130,246,0.15)",color:CYAN,fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span>
                  <div><div style={{fontSize:11.5,fontWeight:700,color:T1,marginBottom:3}}>{c.h}</div><div style={{fontSize:11,color:T2,lineHeight:1.6}}>{c.p}</div></div>
                </div>
              </div>
            );
          })}
        </Sec>

        {/* examples */}
        <Sec t="PRACTICAL EXAMPLES">
          <Box>
            {d.examples.map(function(e,i){
              return <div key={i} style={{fontSize:11,color:T1,lineHeight:1.55,padding:"5px 0",borderBottom:i<d.examples.length-1?"1px solid "+BD2:"none"}}>&#8226;  {e}</div>;
            })}
          </Box>
        </Sec>

        {/* formula */}
        {d.formula?(
          <Sec t="KEY FORMULA">
            <div style={{background:"#08090D",border:"1px solid "+BD,borderRadius:12,padding:13}}>
              <div style={{fontSize:11,color:GOLD,fontFamily:"monospace",lineHeight:1.6}}>{d.formula}</div>
            </div>
          </Sec>
        ):null}

        {/* AI */}
        <Sec t="AI EXPLANATION">
          <div style={{background:CARD,border:"1px solid rgba(59,130,246,0.2)",borderRadius:12,padding:13}}>
            <div style={{fontSize:11.5,color:T1,lineHeight:1.65}}><span style={{color:CYAN,fontWeight:700}}>AI: </span>{d.ai}</div>
          </div>
        </Sec>

        {/* mistakes + best */}
        <Sec t="COMMON MISTAKES">
          <Box>{d.mistakes.map(function(m,i){ return <div key={i} style={{fontSize:11,color:T1,lineHeight:1.5,padding:"4px 0"}}><span style={{color:DOWN}}>&#33;</span>  {m}</div>; })}</Box>
        </Sec>
        <Sec t="BEST PRACTICES">
          <Box>{d.best.map(function(b,i){ return <div key={i} style={{fontSize:11,color:T1,lineHeight:1.5,padding:"4px 0"}}><span style={{color:UP}}>&#10003;</span>  {b}</div>; })}</Box>
        </Sec>

        {/* QUIZ */}
        <Sec t={"QUIZ ("+d.quiz.length+" QUESTIONS)"}>
          {d.quiz.map(function(qq,qi){
            return (
              <div key={qi} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:13,marginBottom:9}}>
                <div style={{fontSize:11.5,fontWeight:700,color:T1,marginBottom:9,lineHeight:1.5}}>{qi+1}. {qq.q}</div>
                {qq.opts.map(function(o,oi){
                  var chosen=answers[qi]==oi;
                  var state="idle";
                  if(showResult){ if(oi==qq.a)state="correct"; else if(chosen)state="wrong"; }
                  else if(chosen)state="chosen";
                  var bg=state=="correct"?"rgba(34,197,94,0.15)":state=="wrong"?"rgba(239,68,68,0.15)":state=="chosen"?"rgba(59,130,246,0.12)":CARD2;
                  var bd=state=="correct"?UP:state=="wrong"?DOWN:state=="chosen"?CYAN:BD;
                  var tc=state=="correct"?UP:state=="wrong"?DOWN:T1;
                  return <button key={oi} onClick={function(){pickAns(qi,oi);}} style={{display:"block",width:"100%",textAlign:"left",background:bg,border:"1px solid "+bd,borderRadius:8,padding:"10px",marginBottom:6,color:tc,fontSize:10.5,fontWeight:600,cursor:showResult?"default":"pointer",fontFamily:"inherit"}}>{o}</button>;
                })}
              </div>
            );
          })}
          {!showResult?(
            <button onClick={submitQuiz} disabled={Object.keys(answers).length<d.quiz.length} style={{width:"100%",background:Object.keys(answers).length<d.quiz.length?"rgba(255,255,255,0.06)":CYAN,border:"none",borderRadius:10,padding:"13px",color:Object.keys(answers).length<d.quiz.length?T3:"#04060D",fontSize:12.5,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Submit Quiz</button>
          ):(
            <div style={{background:score==d.quiz.length?"rgba(34,197,94,0.1)":"rgba(212,175,55,0.1)",border:"1px solid "+(score==d.quiz.length?"rgba(34,197,94,0.3)":"rgba(212,175,55,0.3)"),borderRadius:12,padding:14,textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:900,color:score==d.quiz.length?UP:GOLD}}>{score}/{d.quiz.length}</div>
              <div style={{fontSize:11,color:T1,marginTop:4}}>{score==d.quiz.length?"Perfect! Lesson complete.":"Lesson complete. Review and try again."}</div>
            </div>
          )}
        </Sec>

        {/* takeaways */}
        <Sec t="KEY TAKEAWAYS">
          <div style={{background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,padding:13}}>
            {d.takeaways.map(function(k,i){ return <div key={i} style={{fontSize:11,color:T1,lineHeight:1.5,padding:"4px 0"}}><span style={{color:UP}}>&#10003;</span>  {k}</div>; })}
          </div>
        </Sec>

        {/* related */}
        {d.related && d.related.length?(
          <Sec t="RELATED LESSONS">
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {d.related.map(function(r,i){ return <span key={i} style={{fontSize:10,color:CYAN,background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:14,padding:"6px 12px"}}>{r}</span>; })}
            </div>
          </Sec>
        ):null}

        {/* prev / next */}
        <div style={{display:"flex",gap:9,marginBottom:14}}>
          <button onClick={function(){if(prevId&&props.onNavigate)props.onNavigate(prevId);}} disabled={!prevId} style={{flex:1,background:prevId?CARD:"rgba(255,255,255,0.03)",border:"1px solid "+BD,borderRadius:10,padding:"12px",color:prevId?T1:T3,fontSize:11,fontWeight:700,cursor:prevId?"pointer":"default",fontFamily:"inherit"}}>&#8592; Previous</button>
          <button onClick={function(){if(nextId&&props.onNavigate)props.onNavigate(nextId);}} disabled={!nextId} style={{flex:1,background:nextId?"rgba(59,130,246,0.15)":"rgba(255,255,255,0.03)",border:"1px solid "+(nextId?"rgba(59,130,246,0.3)":BD),borderRadius:10,padding:"12px",color:nextId?CYAN:T3,fontSize:11,fontWeight:700,cursor:nextId?"pointer":"default",fontFamily:"inherit"}}>Next &#8594;</button>
        </div>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
          <div style={{fontSize:9,color:"#F97316"}}>Educational Purpose Only. Not Investment Advice.</div>
        </div>
      </div>
    </div>
  );
      }
            
