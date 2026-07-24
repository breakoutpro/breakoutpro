import { useState } from "react";
import { DIFFICULTIES, SCENARIOS, CANDLE_PSYCHOLOGY, CATEGORY_MODULE_MAP } from "./TradeReplayData";
import { ReplayCandleStrip } from "./PracticeSVG";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - TradeReplay.jsx
// AI Trade Replay: candle-by-candle playback over static, hand-authored
// educational scenarios (no live data, no fake prices). Explanations are
// generated deterministically from pre-authored scenario metadata - this
// is a rule engine, not a real AI call, consistent with "no new API".
// Reuses the shared useAcademyProgress instance passed down - no new hook.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BLUE="#3B82F6",UP="#22C55E",R="#EF4444";

export default function TradeReplay(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  R=theme.c.down;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CARD = theme.c.card, BLUE=theme.c.blue, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var progress = props.progress; // shared instance, not a new hook
  var onBack = props.onBack || function(){};

  var [difficulty, setDifficulty] = useState(null);
  var [step, setStep] = useState(0);
  var [decision, setDecision] = useState(null);
  var [sessionLog, setSessionLog] = useState([]); // {category, correct}
  var [finished, setFinished] = useState(false);

  if(!difficulty){
    return (
      <div style={{padding:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:4,marginBottom:16}}>&#8592; Back to Practice Zone</button>
        <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:8}}>AI Trade Replay</div>
        <div style={{fontSize:12,color:T3,marginBottom:16,lineHeight:1.5}}>Play through a static, hand-built candle sequence one candle at a time. Decide Buy, Sell, or Wait at each step, then see a rule-based explanation of the trend, support/resistance, candle psychology, and risk context.</div>
        {DIFFICULTIES.map(function(d){
          return (
            <div key={d} onClick={function(){ setDifficulty(d); setStep(0); setDecision(null); setSessionLog([]); setFinished(false); }} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12,cursor:"pointer"}}>
              <div style={{fontSize:14,fontWeight:700,color:T1}}>{d}</div>
              <div style={{fontSize:12,color:T3,marginTop:4}}>{SCENARIOS[d].title}</div>
            </div>
          );
        })}
      </div>
    );
  }

  var scenario = SCENARIOS[difficulty];
  var candles = scenario.candles;
  var current = candles[step];
  var shapeIdsRevealed = candles.slice(0, step+1).map(function(c){ return c.shapeId; });

  function restart(){
    setStep(0); setDecision(null); setSessionLog([]); setFinished(false);
  }
  function goPrev(){
    if(step>0 && !decision){ setStep(step-1); setDecision(null); }
  }
  function decide(choice){
    if(decision) return;
    setDecision(choice);
    var wasCorrect = choice==current.idealDecision;
    progress.recordReplayDecision(current.category, wasCorrect);
    setSessionLog(function(prev){ return prev.concat([{category:current.category, correct:wasCorrect}]); });
  }
  function nextCandle(){
    if(step+1 < candles.length){
      setStep(step+1); setDecision(null);
    } else {
      setFinished(true);
    }
  }

  if(finished){
    var correctCount = sessionLog.filter(function(l){ return l.correct; }).length;
    var accuracy = sessionLog.length>0 ? Math.round((correctCount/sessionLog.length)*100) : 0;
    var wrongByCategory = {};
    sessionLog.forEach(function(l){ if(!l.correct){ wrongByCategory[l.category] = (wrongByCategory[l.category]||0)+1; } });
    var weakest = null, weakestCount = 0;
    for(var cat in wrongByCategory){
      if(wrongByCategory.hasOwnProperty(cat) && wrongByCategory[cat]>weakestCount){ weakest=cat; weakestCount=wrongByCategory[cat]; }
    }
    var rec = weakest ? CATEGORY_MODULE_MAP[weakest] : null;

    return (
      <div style={{padding:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:4,marginBottom:16}}>&#8592; Back to Practice Zone</button>
        <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:16}}>Replay Complete - {difficulty}</div>

        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16,textAlign:"center"}}>
          <div style={{fontSize:18,fontWeight:900,color:accuracy>=70?UP:(accuracy>=40?BLUE:R)}}>{accuracy}%</div>
          <div style={{fontSize:12,color:T2,marginTop:4}}>Accuracy &#8226; {correctCount} correct / {sessionLog.length-correctCount} wrong</div>
        </div>

        {rec ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>WEAK AREA IDENTIFIED</div>
            <div style={{fontSize:12,color:T1,marginBottom:8}}>Most misses were in: <b>{rec.label}</b></div>
            <div style={{fontSize:12,color:T3,lineHeight:1.5}}>Recommended: revisit the "{rec.label}" module in Trading Academy to reinforce this area.</div>
          </div>
        ) : (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,color:UP}}>No consistent weak area found this session - solid, balanced decisions.</div>
          </div>
        )}

        <button onClick={restart} style={{width:"100%",background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginBottom:8}}>Restart Replay</button>
        <button onClick={function(){ setDifficulty(null); }} style={{width:"100%",background:"transparent",border:"1px solid "+BD,borderRadius:11,padding:12,color:T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Choose Different Difficulty</button>
      </div>
    );
  }

  return (
    <div style={{padding:16}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:4,marginBottom:12}}>&#8592; Back to Practice Zone</button>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontSize:12,color:T3}}>{difficulty} &#8226; Candle {step+1} of {candles.length}</span>
        <button onClick={restart} style={{background:"none",border:"none",color:T2,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Restart</button>
      </div>

      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:16}}>
        <ReplayCandleStrip shapeIds={shapeIdsRevealed}/>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <button onClick={goPrev} disabled={step==0 || !!decision} style={{flex:1,background:"transparent",border:"1px solid "+BD,borderRadius:10,padding:"12px",color:(step==0||decision)?T3:T2,fontSize:12,fontWeight:700,cursor:(step==0||decision)?"default":"pointer",fontFamily:"inherit",minHeight:44}}>&#8592; Previous Candle</button>
        <button onClick={nextCandle} disabled={!decision} style={{flex:1,background:decision?BLUE:"transparent",border:"1px solid "+(decision?BLUE:BD),borderRadius:10,padding:"12px",color:decision?"#fff":T3,fontSize:12,fontWeight:700,cursor:decision?"pointer":"default",fontFamily:"inherit",minHeight:44}}>Next Candle &#8594;</button>
      </div>

      {!decision ? (
        <div>
          <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12}}>What is your decision on this candle?</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={function(){decide("buy");}} style={{flex:1,background:"transparent",border:"1px solid "+UP,borderRadius:10,padding:"12px",color:UP,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Buy</button>
            <button onClick={function(){decide("sell");}} style={{flex:1,background:"transparent",border:"1px solid "+R,borderRadius:10,padding:"12px",color:R,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Sell</button>
            <button onClick={function(){decide("wait");}} style={{flex:1,background:"transparent",border:"1px solid "+T2,borderRadius:10,padding:"12px",color:T2,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Wait</button>
          </div>
        </div>
      ) : (
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16}}>
          <div style={{fontSize:12,fontWeight:800,color:decision==current.idealDecision?UP:R,marginBottom:12}}>{decision==current.idealDecision?"Correct decision":"This wasn't the ideal decision here"}</div>
          <div style={{marginBottom:8}}><span style={{fontSize:12,fontWeight:800,color:T2}}>TREND: </span><span style={{fontSize:12,color:T1}}>{current.trendNote}</span></div>
          <div style={{marginBottom:8}}><span style={{fontSize:12,fontWeight:800,color:T2}}>SUPPORT/RESISTANCE: </span><span style={{fontSize:12,color:T1}}>{current.zone=="none"?"No nearby zone at this point.":("Price is near a "+current.zone+" zone.")}</span></div>
          <div style={{marginBottom:8}}><span style={{fontSize:12,fontWeight:800,color:T2}}>CANDLE PSYCHOLOGY: </span><span style={{fontSize:12,color:T1}}>{CANDLE_PSYCHOLOGY[current.shapeId]}</span></div>
          <div style={{marginBottom:8}}><span style={{fontSize:12,fontWeight:800,color:T2}}>RISK: </span><span style={{fontSize:12,color:T1}}>{current.riskNote}</span></div>
          <div><span style={{fontSize:12,fontWeight:800,color:T2}}>VERDICT: </span><span style={{fontSize:12,color:T1}}>The ideal decision here was "{current.idealDecision}".</span></div>
        </div>
      )}

      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:16}}>
        <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.5}}>Educational replay only. Static, hand-built scenario - not real market data, no live execution, not investment advice.</div>
      </div>
    </div>
  );
}
