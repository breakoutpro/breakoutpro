import { useState } from "react";
import { PRACTICE_LIST } from "./PracticeData";
import PracticeQuiz from "./PracticeQuiz";
import RiskCalcPractice from "./RiskCalcPractice";
import PositionSizePractice from "./PositionSizePractice";
import TradeReplay from "./TradeReplay";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - PracticeZone.jsx
// Trading Academy Phase 2: Practice Zone hub. Reuses the same
// useAcademyProgress() instance passed down from AcademyHome - no second
// hook call anywhere in this subtree.
// Rules: no backtick, no triple-equals, ASCII only.

var CB="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#8899BB",T3="#5B6472",UP="#22C55E";

export default function PracticeZone(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T2=theme.c.text2;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CB = theme.c.card, T3 = theme.c.text3; T1=theme.c.text1;

  var progress = props.progress; // shared instance, not a new hook
  var onBack = props.onBack || function(){};
  var [openId, setOpenId] = useState(null);

  if(openId){
    var item = PRACTICE_LIST.filter(function(p){ return p.id==openId; })[0];
    var back = function(){ setOpenId(null); };
    if(item.type=="calc_risk") return <RiskCalcPractice onBack={back}/>;
    if(item.type=="calc_size") return <PositionSizePractice onBack={back}/>;
    if(item.type=="replay") return <TradeReplay progress={progress} onBack={back}/>;
    return <PracticeQuiz practiceId={openId} progress={progress} onBack={back}/>;
  }

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>Practice Zone</div>
          <div style={{fontSize:12,color:T2}}>Hands-on practice. Real progress, no fake data.</div>
        </div>
      </div>

      <div style={{padding:16}}>
        {PRACTICE_LIST.map(function(p){
          var score = (p.type=="mcq") ? progress.practiceScore(p.id) : null;
          return (
            <div key={p.id} onClick={function(){setOpenId(p.id);}} style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:12,background:p.color+"18",border:"1px solid "+p.color+"40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{p.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:T1}}>{p.title}</div>
                {score ? (
                  <div style={{fontSize:12,color:T3,marginTop:4}}>All-time: {score.correct}/{score.attempts} correct</div>
                ) : (
                  <div style={{fontSize:12,color:T3,marginTop:4}}>{p.type=="replay"?"Candle-by-candle scenario practice":"Interactive calculator"}</div>
                )}
              </div>
              <span style={{color:T3,fontSize:16}}>&#8250;</span>
            </div>
          );
        })}

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:8}}>
          <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.5}}>Educational practice only. All illustrations are abstract teaching shapes, not real market data. Scores tracked locally on your device only.</div>
        </div>
      </div>
    </div>
  );
}
