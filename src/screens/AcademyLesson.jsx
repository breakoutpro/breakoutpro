import { useState } from "react";
import { at } from "./AcademyData";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - AcademyLesson.jsx
// Single lesson reader + chapter quiz. Completing the quiz (submitting
// answers, regardless of score) marks the lesson complete via the shared
// useAcademyProgress instance passed down - no separate progress store.
// Rules: no backtick, no triple-equals, ASCII only.

var CB="#0F1629",BD="#1E2D4A";
var T1="#FFFFFF",T2="#8899BB",T3="#5B6472",BLUE="#3B82F6",UP="#22C55E",R="#EF4444";

export default function AcademyLesson(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; CB=theme.c.card; R=theme.c.down; T2=theme.c.text2;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var lesson = props.lesson;
  var module = props.module;
  var progress = props.progress;
  var lang = props.lang || "en";
  var onBack = props.onBack || function(){};
  var onNext = props.onNext || null;

  var [showQuiz, setShowQuiz] = useState(false);
  var [answers, setAnswers] = useState({});
  var [submitted, setSubmitted] = useState(false);

  function pick(qIdx, optIdx){
    if(submitted) return;
    setAnswers(function(prev){
      var next = {}; for(var k in prev){ if(prev.hasOwnProperty(k)) next[k]=prev[k]; }
      next[qIdx] = optIdx;
      return next;
    });
  }
  function submit(){
    setSubmitted(true);
    progress.markComplete(lesson.id);
  }

  var score = 0;
  if(submitted && lesson.quiz){
    lesson.quiz.forEach(function(q,i){ if(answers[i]==q.correct) score++; });
  }

  return (
    <div style={{padding:16}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:4,marginBottom:12}}>&#8592; {at("back_to_module",lang)}</button>

      {!showQuiz ? (
        <div>
          <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:16}}>{lesson.title}</div>
          {lesson.illustration ? (
            <div style={{background:CB,border:"1px dashed "+BD,borderRadius:16,padding:24,marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:22,marginBottom:8}}>&#128196;</div>
              <div style={{fontSize:12,color:T3,lineHeight:1.5}}>{lesson.illustration}</div>
            </div>
          ) : null}
          {(lesson.body||[]).map(function(para,i){
            return <p key={i} style={{fontSize:12,color:T1,lineHeight:1.7,marginBottom:12}}>{para}</p>;
          })}
          {lesson.quiz && lesson.quiz.length ? (
            <button onClick={function(){setShowQuiz(true);}} style={{width:"100%",background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginTop:12}}>{at("quiz",lang)} &#8594;</button>
          ) : null}
        </div>
      ) : (
        <div>
          <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:16}}>{at("quiz_title",lang)}</div>
          {lesson.quiz.map(function(q,qi){
            return (
              <div key={qi} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12}}>{qi+1}. {q.q}</div>
                {q.options.map(function(opt,oi){
                  var picked = answers[qi]==oi;
                  var isRight = oi==q.correct;
                  var showResult = submitted;
                  var col = showResult ? (isRight?UP:(picked?R:BD)) : (picked?BLUE:BD);
                  return (
                    <div key={oi} onClick={function(){pick(qi,oi);}} style={{border:"1px solid "+col,background:picked&&!showResult?"rgba(59,130,246,0.1)":(showResult&&isRight?"rgba(34,197,94,0.1)":(showResult&&picked?"rgba(239,68,68,0.1)":"transparent")),borderRadius:9,padding:"8px 12px",marginBottom:8,fontSize:12,color:T1,cursor:submitted?"default":"pointer"}}>{opt}</div>
                  );
                })}
              </div>
            );
          })}
          {!submitted ? (
            <button onClick={submit} style={{width:"100%",background:UP,border:"none",borderRadius:12,padding:"12px 24px",color:"#05130a",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{at("submit",lang)}</button>
          ) : (
            <div>
              <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12,textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:800,color:score==lesson.quiz.length?UP:T2}}>{score} / {lesson.quiz.length} {at("correct",lang)}</div>
              </div>
              {onNext ? (
                <button onClick={onNext} style={{width:"100%",background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginBottom:8}}>{at("next_lesson",lang)} &#8594;</button>
              ) : null}
              <button onClick={onBack} style={{width:"100%",background:"none",border:"1px solid "+BD,borderRadius:11,padding:12,color:T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{at("back_to_module",lang)}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
