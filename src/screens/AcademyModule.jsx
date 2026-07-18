import { useState } from "react";
import { at } from "./AcademyData";
import AcademyLesson from "./AcademyLesson";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - AcademyModule.jsx
// Lesson list within one module. Lessons with comingSoon:true render a
// clearly disabled "Coming soon" state - never opened, never presented as
// if content exists when it does not.
// Rules: no backtick, no triple-equals, ASCII only.

var CB="#0F1629",BD="#1E2D4A";
var T1="#FFFFFF",T2="#8899BB",T3="#5B6472",UP="#22C55E";

export default function AcademyModule(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var T3 = theme.c.text3;

  var module = props.module;
  var progress = props.progress;
  var lang = props.lang || "en";
  var onBack = props.onBack || function(){};
  var [openLessonId, setOpenLessonId] = useState(null);

  if(openLessonId){
    var lessonIdx = module.lessons.findIndex(function(l){ return l.id==openLessonId; });
    var lesson = module.lessons[lessonIdx];
    var nextLesson = module.lessons[lessonIdx+1] || null;
    return (
      <AcademyLesson
        lesson={lesson}
        module={module}
        progress={progress}
        lang={lang}
        onBack={function(){setOpenLessonId(null);}}
        onNext={ (nextLesson && !nextLesson.comingSoon) ? function(){setOpenLessonId(nextLesson.id);} : null }
      />
    );
  }

  return (
    <div style={{padding:14}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:theme.c.blue,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:0,marginBottom:12}}>&#8592; {at("back_to_module",lang)==="back_to_module"?"Back":at("modules",lang)}</button>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{width:44,height:44,borderRadius:12,background:module.color+"18",border:"1px solid "+module.color+"40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{module.icon}</div>
        <div style={{fontSize:16,fontWeight:800,color:T1}}>{module.title}</div>
      </div>

      {module.lessons.map(function(l,i){
        var complete = !l.comingSoon && progress.isComplete(l.id);
        return (
          <div key={l.id} onClick={function(){ if(!l.comingSoon) setOpenLessonId(l.id); }} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:14,marginBottom:8,cursor:l.comingSoon?"default":"pointer",opacity:l.comingSoon?0.55:1,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:complete?UP+"20":"rgba(255,255,255,0.05)",border:"1px solid "+(complete?UP:BD),display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:complete?UP:T3,flexShrink:0}}>{complete?"\u2713":(i+1)}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:T1}}>{l.title}</div>
              {l.comingSoon ? <div style={{fontSize:9,color:T3,marginTop:2}}>{at("coming_soon",lang)}</div> : (complete ? <div style={{fontSize:9,color:UP,marginTop:2}}>{at("completed",lang)}</div> : null)}
            </div>
            {!l.comingSoon ? <span style={{color:T3,fontSize:16}}>&#8250;</span> : null}
          </div>
        );
      })}
    </div>
  );
}
