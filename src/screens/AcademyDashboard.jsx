import { useState } from "react";
import { MODULES } from "./AcademyData";
import Certificate from "./Certificate";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - AcademyDashboard.jsx
// Phase 4 dashboard. Reuses the shared useAcademyProgress instance passed
// down from AcademyHome - no new hook. Every number shown is computed
// live from real stored data (see the hook itself) - nothing here is a
// separately fabricated statistic.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BLUE="#3B82F6",UP="#22C55E";

export default function AcademyDashboard(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CARD = theme.c.card, BLUE=theme.c.blue, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var progress = props.progress; // shared instance, not a new hook
  var onBack = props.onBack || function(){};
  var [showCert, setShowCert] = useState(false);

  if(showCert){
    return <Certificate progress={progress} onBack={function(){setShowCert(false);}}/>;
  }

  var level = progress.getLevel();
  var streak = progress.streakInfo();
  var overall = progress.overallProgress(MODULES);
  var badges = progress.getBadges(MODULES);
  var eligible = progress.isEligibleForCertificate(MODULES);

  var levelPct = level.nextMin ? Math.min(100, Math.round((level.xp / level.nextMin)*100)) : 100;

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>Academy Dashboard</div>
          <div style={{fontSize:12,color:T2}}>Your real progress, XP, and achievements</div>
        </div>
      </div>

      <div style={{padding:16}}>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:16,fontWeight:800,color:BLUE}}>{level.name}</div>
            <div style={{fontSize:12,color:T2}}>{level.xp} XP</div>
          </div>
          <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
            <div style={{width:levelPct+"%",height:"100%",background:BLUE,borderRadius:4}}></div>
          </div>
          <div style={{fontSize:12,color:T3,marginTop:8}}>{level.nextName ? (level.nextMin-level.xp)+" XP to "+level.nextName : "Highest level reached"}</div>
        </div>

        <div style={{display:"flex",gap:12,marginBottom:16}}>
          <div style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:800,color:UP}}>{streak.current}</div>
            <div style={{fontSize:12,color:T3,marginTop:4}}>Current Streak</div>
          </div>
          <div style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:800,color:BLUE}}>{streak.best}</div>
            <div style={{fontSize:12,color:T3,marginTop:4}}>Best Streak</div>
          </div>
        </div>

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>YOUR PROGRESS</div>
          <Row label="Lessons completed" value={progress.lessonsCompletedCount()+" / "+overall.total}/>
          <Row label="Books completed" value={progress.booksCompletedCount()}/>
          <Row label="Practice correct answers" value={progress.practiceCorrectTotal()}/>
          <Row label="Replay correct decisions" value={progress.replayCorrectTotal()}/>
          <Row label="Overall Academy completion" value={overall.pct+"%"} last={true}/>
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>ACHIEVEMENTS</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
          {badges.map(function(b){
            return (
              <div key={b.id} style={{background:CARD,border:"1px solid "+(b.earned?BLUE:BD),borderRadius:16,padding:"8px 12px",opacity:b.earned?1:0.4}}>
                <div style={{fontSize:12,fontWeight:700,color:b.earned?BLUE:T3}}>{b.earned?"\u2605 ":"\u2606 "}{b.label}</div>
              </div>
            );
          })}
        </div>

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16}}>
          <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:8}}>Certificate</div>
          {eligible ? (
            <div>
              <div style={{fontSize:12,color:T2,marginBottom:12}}>All Academy modules complete - your certificate is ready.</div>
              <button onClick={function(){setShowCert(true);}} style={{width:"100%",background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>View Certificate</button>
            </div>
          ) : (
            <div style={{fontSize:12,color:T3}}>Complete all Academy modules ({overall.done}/{overall.total} done) to unlock your certificate.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, T2 = theme.c.text2;

  var T2=theme.c.text2, T1="#FFFFFF", BD=theme.c.border; T1=theme.c.text1;
  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:props.last?"none":"1px solid "+BD}}>
      <span style={{fontSize:12,color:T2}}>{props.label}</span>
      <span style={{fontSize:12,fontWeight:700,color:T1}}>{props.value}</span>
    </div>
  );
}
