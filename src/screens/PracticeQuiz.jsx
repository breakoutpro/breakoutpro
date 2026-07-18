import { useState } from "react";
import { MCQ_BANKS } from "./PracticeData";
import { CandleIllustration, PatternIllustration } from "./PracticeSVG";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - PracticeQuiz.jsx
// Shared, reusable multiple-choice practice engine - used by 8 of the 10
// Practice Zone types (candle ID, pattern ID, S/R, trend, BOS/CHOCH,
// supply/demand, psychology scenarios, final exam) via different question
// banks, instead of building 8 near-duplicate screens. Reuses the shared
// useAcademyProgress instance passed down from PracticeZone - no new hook.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BLUE="#3B82F6",UP="#22C55E",R="#EF4444";

export default function PracticeQuiz(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3;

  var practiceId = props.practiceId;
  var progress = props.progress;
  var onBack = props.onBack || function(){};
  var bank = MCQ_BANKS[practiceId] || [];

  var [idx, setIdx] = useState(0);
  var [picked, setPicked] = useState(null);
  var [answered, setAnswered] = useState(false);
  var [sessionCorrect, setSessionCorrect] = useState(0);

  var q = bank[idx];
  var score = progress.practiceScore(practiceId);

  function pick(optIdx){
    if(answered) return;
    setPicked(optIdx);
    setAnswered(true);
    var wasCorrect = optIdx==q.correct;
    if(wasCorrect) setSessionCorrect(function(c){ return c+1; });
    progress.recordPracticeAttempt(practiceId, wasCorrect);
  }
  function next(){
    if(idx+1 < bank.length){
      setIdx(idx+1); setPicked(null); setAnswered(false);
    }
  }

  if(!q){
    return (
      <div style={{padding:14}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:0,marginBottom:12}}>&#8592; Back</button>
        <div style={{color:T2,fontSize:12}}>No questions available for this practice yet.</div>
      </div>
    );
  }

  var isLast = idx+1 >= bank.length;

  return (
    <div style={{padding:14}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:0,marginBottom:12}}>&#8592; Back to Practice Zone</button>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontSize:10,color:T3}}>Question {idx+1} of {bank.length}</span>
        <span style={{fontSize:10,color:T2}}>All-time: {score.correct}/{score.attempts}</span>
      </div>

      {q.illustration ? (
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:12,marginBottom:14}}>
          {q.illustration.kind=="candle" ? <CandleIllustration shapeId={q.illustration.shapeId}/> : <PatternIllustration shapeId={q.illustration.shapeId}/>}
        </div>
      ) : null}

      <div style={{fontSize:13,fontWeight:700,color:T1,marginBottom:14,lineHeight:1.5}}>{q.q}</div>

      {q.options.map(function(opt,oi){
        var isRight = oi==q.correct;
        var isPicked = picked==oi;
        var col = answered ? (isRight?UP:(isPicked?R:BD)) : (isPicked?BLUE:BD);
        var bg = answered ? (isRight?"rgba(34,197,94,0.1)":(isPicked?"rgba(239,68,68,0.1)":"transparent")) : "transparent";
        return (
          <div key={oi} onClick={function(){pick(oi);}} style={{border:"1px solid "+col,background:bg,borderRadius:10,padding:"11px 14px",marginBottom:8,fontSize:12,color:T1,cursor:answered?"default":"pointer",minHeight:44,display:"flex",alignItems:"center"}}>{opt}</div>
        );
      })}

      {answered ? (
        <div>
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:12,marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:picked==q.correct?UP:R,marginBottom:6}}>{picked==q.correct?"Correct":"Not quite"}</div>
            <div style={{fontSize:11,color:T2,lineHeight:1.6}}>{q.explain}</div>
          </div>
          {!isLast ? (
            <button onClick={next} style={{width:"100%",background:BLUE,border:"none",borderRadius:11,padding:13,color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Next Question &#8594;</button>
          ) : (
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14,textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:800,color:UP,marginBottom:4}}>Practice Complete</div>
              <div style={{fontSize:10,color:T2}}>This session: {sessionCorrect} of {bank.length} correct</div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
