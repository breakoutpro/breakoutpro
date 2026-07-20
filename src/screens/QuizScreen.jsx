import { useState } from "react";

import { useTheme } from "../theme/ThemeProvider";
var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",G="#00C853",G2="#00E676",R="#EF4444",GOLD="#F59E0B",BLUE="#3B82F6",PURPLE="#7C3AED",T1="#FFFFFF",T2="#8899BB",T3="#475569";

var QUESTIONS=[
  {q:"What does PCR stand for in options trading?",options:["Put Call Ratio","Price Change Rate","Position Cover Ratio","Profit Cost Ratio"],correct:0,xp:10},
  {q:"A Bullish Engulfing pattern signals what?",options:["Continued downtrend","Possible reversal upward","Sideways movement","Increased volatility only"],correct:1,xp:10},
  {q:"What is VWAP used for?",options:["Measuring volatility","Volume Weighted Average Price benchmark","Predicting news events","Calculating dividends"],correct:1,xp:10},
  {q:"FII stands for?",options:["Foreign Institutional Investor","Fixed Income Instrument","Future Index Indicator","Financial Insurance Institute"],correct:0,xp:10},
  {q:"RSI above 70 typically indicates?",options:["Oversold condition","Overbought condition","Strong support","No signal"],correct:1,xp:15},
  {q:"What is a Doji candlestick pattern?",options:["Large green candle","Open and close nearly equal","Three candle pattern","Gap up opening"],correct:1,xp:10},
  {q:"Support level in technical analysis means?",options:["Price ceiling","Price floor where buying interest increases","Average trading volume","Maximum profit zone"],correct:1,xp:10},
  {q:"What does OI (Open Interest) represent?",options:["Daily trading volume","Total outstanding derivative contracts","Stock price change","Company earnings"],correct:1,xp:15},
  {q:"A Morning Star pattern appears after?",options:["An uptrend, signals reversal down","A downtrend, signals reversal up","Sideways market only","High volume spike only"],correct:1,xp:15},
  {q:"What is the full form of NSE?",options:["National Stock Exchange","New Securities Exchange","National Savings Exchange","Net Security Exchange"],correct:0,xp:5},
];

function loadProgress(){
  try{
    var s=JSON.parse(localStorage.getItem("bp_quiz_progress")||"null");
    if(s) return s;
  }catch(e){}
  return {xp:0,streak:0,lastDate:null,badges:[]};
}

function saveProgress(p){
  try{localStorage.setItem("bp_quiz_progress",JSON.stringify(p));}catch(e){}
}

export default function QuizScreen(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue;

  var setTab = props.setTab || function(){};
  var [progress,setProgress]=useState(loadProgress());
  var [qIdx,setQIdx]=useState(0);
  var [selected,setSelected]=useState(null);
  var [showResult,setShowResult]=useState(false);
  var [sessionXp,setSessionXp]=useState(0);
  var [finished,setFinished]=useState(false);

  var question=QUESTIONS[qIdx];

  function answer(idx){
    if(selected!=null) return;
    setSelected(idx);
    setShowResult(true);
    if(idx==question.correct){
      setSessionXp(function(x){return x+question.xp;});
    }
  }

  function next(){
    if(qIdx<QUESTIONS.length-1){
      setQIdx(qIdx+1);
      setSelected(null);
      setShowResult(false);
    } else {
      var newXp=progress.xp+sessionXp;
      var badges=progress.badges.slice();
      if(newXp>=100&&badges.indexOf("Century Club")==-1) badges.push("Century Club");
      if(sessionXp==QUESTIONS.reduce(function(s,q){return s+q.xp;},0)&&badges.indexOf("Perfect Score")==-1) badges.push("Perfect Score");
      var updated={xp:newXp,streak:progress.streak+1,lastDate:new Date().toDateString(),badges:badges};
      setProgress(updated);
      saveProgress(updated);
      setFinished(true);
    }
  }

  function restart(){
    setQIdx(0);
    setSelected(null);
    setShowResult(false);
    setSessionXp(0);
    setFinished(false);
  }

  if(finished){
    return (
      <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",padding:"40px 20px",textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:10}}>&#127942;</div>
        <div style={{fontSize:18,fontWeight:900,color:T1,marginBottom:6}}>Quiz Complete!</div>
        <div style={{fontSize:11,color:T2,marginBottom:20}}>You earned {sessionXp} XP this session</div>

        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:18,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:10,color:T2}}>Total XP</span>
            <span style={{fontSize:14,fontWeight:800,color:GOLD}}>{progress.xp}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:10,color:T2}}>Day Streak</span>
            <span style={{fontSize:14,fontWeight:800,color:BLUE}}>{progress.streak}</span>
          </div>
          {progress.badges.length>0?(
            <div>
              <div style={{fontSize:9,color:T2,marginBottom:8,textAlign:"left"}}>Badges Earned</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {progress.badges.map(function(b){
                  return <span key={b} style={{background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:8,padding:"4px 10px",fontSize:9,fontWeight:700,color:GOLD}}>{b}</span>;
                })}
              </div>
            </div>
          ):null}
        </div>

        <button onClick={restart} style={{background:""+BLUE+"",border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Play Again</button>
      </div>
    );
  }

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:30}}>
      <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:15,fontWeight:900,color:T1}}>Daily <span style={{color:GOLD}}>Quiz</span></div>
          <div style={{background:"rgba(245,158,11,0.12)",borderRadius:10,padding:"4px 10px"}}>
            <span style={{fontSize:9,fontWeight:700,color:GOLD}}>+{sessionXp} XP</span>
          </div>
        </div>
        <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:((qIdx+1)/QUESTIONS.length*100)+"%",background:""+BLUE+""}}></div>
        </div>
        <div style={{fontSize:8,color:T3,marginTop:4}}>Question {qIdx+1} of {QUESTIONS.length}</div>
      </div>

      <div style={{padding:"16px 16px"}}>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:T1,lineHeight:1.5}}>{question.q}</div>
        </div>

        {question.options.map(function(opt,i){
          var isCorrect=i==question.correct;
          var isSelected=i==selected;
          var bg="rgba(255,255,255,0.03)",border=BD,col=T1;
          if(showResult&&isCorrect){bg="rgba(0,200,83,0.1)";border=G2;col=G2;}
          else if(showResult&&isSelected&&!isCorrect){bg="rgba(239,68,68,0.1)";border=R;col=R;}

          return (
            <button key={i} onClick={function(){answer(i);}} disabled={selected!=null} style={{display:"block",width:"100%",textAlign:"left",background:bg,border:"1px solid "+border,borderRadius:12,padding:"12px 14px",marginBottom:8,color:col,fontSize:11,fontWeight:600,cursor:selected==null?"pointer":"default",fontFamily:"inherit"}}>{opt}</button>
          );
        })}

        {showResult?(
          <button onClick={next} style={{width:"100%",background:""+BLUE+"",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:6}}>{qIdx<QUESTIONS.length-1?"Next Question":"Finish Quiz"}</button>
        ):null}
      </div>
    </div>
  );
}
