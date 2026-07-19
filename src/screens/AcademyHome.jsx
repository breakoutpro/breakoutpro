import { useState } from "react";
import { MODULES, at } from "./AcademyData";
import { useAcademyProgress } from "../hooks/useAcademyProgress";
import AcademyModule from "./AcademyModule";
import BookLibrary from "./BookLibrary";
import PracticeZone from "./PracticeZone";
import AcademyDashboard from "./AcademyDashboard";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - AcademyHome.jsx
// Trading Academy entry screen: module grid + real progress overview.
// Single useAcademyProgress() instance for this whole Academy subtree.
// Rules: no backtick, no triple-equals, ASCII only.

var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A";
var T1="#FFFFFF",T2="#8899BB",T3="#5B6472",BLUE="#3B82F6",UP="#22C55E",WARN="#F97316";

export default function AcademyHome(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  DB=theme.c.bg; CB=theme.c.card; BD=theme.c.border;
  T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3; BLUE=theme.c.blue; UP=theme.c.up; WARN=theme.c.warn;
  var onBack = props.onBack || function(){};
  var lang = props.lang || "en";
  var progress = useAcademyProgress(); // single instance for the whole Academy subtree
  var [openModuleId, setOpenModuleId] = useState(null);
  var [openLibrary, setOpenLibrary] = useState(false);
  var [openPractice, setOpenPractice] = useState(false);
  var [openDashboard, setOpenDashboard] = useState(false);

  if(openDashboard){
    return <AcademyDashboard progress={progress} onBack={function(){setOpenDashboard(false);}}/>;
  }
  if(openLibrary){
    return <BookLibrary progress={progress} onBack={function(){setOpenLibrary(false);}}/>;
  }
  if(openPractice){
    return <PracticeZone progress={progress} onBack={function(){setOpenPractice(false);}}/>;
  }

  if(openModuleId){
    var mod = MODULES.filter(function(m){ return m.id==openModuleId; })[0];
    return <AcademyModule module={mod} progress={progress} lang={lang} onBack={function(){setOpenModuleId(null);}}/>;
  }

  var overall = progress.overallProgress(MODULES);

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:40,height:40,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:15,fontWeight:800,color:T1}}>{at("academy_title",lang)}</div>
          <div style={{fontSize:9,color:T2}}>{at("academy_sub",lang)}</div>
        </div>
      </div>

      <div style={{padding:14}}>
        <div onClick={function(){setOpenDashboard(true);}} style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:16,cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:theme.c.gold}}>{progress.getLevel().name}</div>
              <div style={{fontSize:9,color:T3,marginTop:2}}>{progress.getLevel().xp} XP &#8226; {progress.streakInfo().current} day streak</div>
            </div>
            <span style={{color:T3,fontSize:16}}>&#8250;</span>
          </div>
        </div>

        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:800,color:T2,marginBottom:8}}>{at("your_progress",lang)}</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,height:8,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
              <div style={{width:overall.pct+"%",height:"100%",background:BLUE,borderRadius:4}}></div>
            </div>
            <div style={{fontSize:12,fontWeight:800,color:BLUE}}>{overall.pct}%</div>
          </div>
          <div style={{fontSize:9,color:T3,marginTop:6}}>{overall.done} of {overall.total} lessons completed</div>
        </div>

        <div onClick={function(){setOpenLibrary(true);}} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:14,marginBottom:16,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:12,background:"#D4AF3718",border:"1px solid #D4AF3740",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{"\u{1F4DA}"}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:T1}}>Trading Library</div>
            <div style={{fontSize:9,color:T3,marginTop:2}}>Real books, original summaries, save & track progress</div>
          </div>
          <span style={{color:T3,fontSize:16}}>&#8250;</span>
        </div>

        <div onClick={function(){setOpenPractice(true);}} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:14,marginBottom:16,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:12,background:"#22C55E18",border:"1px solid #22C55E40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{"\u{1F3AF}"}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:T1}}>Practice Zone</div>
            <div style={{fontSize:9,color:T3,marginTop:2}}>Candlestick ID, patterns, calculators & more</div>
          </div>
          <span style={{color:T3,fontSize:16}}>&#8250;</span>
        </div>

        <div style={{fontSize:11,fontWeight:800,color:T2,marginBottom:10}}>{at("modules",lang).toUpperCase()}</div>
        {MODULES.map(function(m){
          var mp = progress.moduleProgress(m);
          return (
            <div key={m.id} onClick={function(){setOpenModuleId(m.id);}} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:14,marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:12,background:m.color+"18",border:"1px solid "+m.color+"40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{m.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:T1}}>{m.title}</div>
                <div style={{fontSize:9,color:T3,marginTop:2}}>{mp.total} {at("lessons",lang)} &#8226; {mp.done} {at("completed",lang).toLowerCase()}</div>
                <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden",marginTop:6}}>
                  <div style={{width:mp.pct+"%",height:"100%",background:m.color,borderRadius:2}}></div>
                </div>
              </div>
              <span style={{color:T3,fontSize:16}}>&#8250;</span>
            </div>
          );
        })}

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:16}}>
          <div style={{fontSize:8.5,color:WARN,lineHeight:1.5}}>Educational content only. No investment advice, no buy/sell recommendations. Progress is tracked locally on your device only.</div>
        </div>
      </div>
    </div>
  );
}
