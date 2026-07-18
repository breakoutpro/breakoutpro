import { useState } from "react";
import PatternSVG from "./PatternSVG";
import { PATTERNS } from "./PatternData";

import { useTheme } from "../theme/ThemeProvider";
var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var BLUE = "#3B82F6";
var T1 = "#FFFFFF";
var T2 = "#8899BB";



export function PatternCard(props) {
  var p = props.p;
  var tc = p.type=="Bullish"?G2:p.type=="Bearish"?R:GOLD;
  var tb = p.type=="Bullish"?"rgba(0,200,83,0.08)":p.type=="Bearish"?"rgba(239,68,68,0.08)":"rgba(245,158,11,0.08)";
  var isFav = props.isFav;
  var isDone = props.isDone;
  return (
    <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:8,cursor:"pointer"}} onClick={props.onClick}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <div style={{background:tb,border:"1px solid "+tc+"44",borderRadius:10,padding:"8px 10px",flexShrink:0,textAlign:"center",minWidth:44}}>
          <div style={{fontSize:8,fontWeight:700,color:tc}}>{p.type[0]}</div>
          <div style={{fontSize:10,fontWeight:900,color:tc,marginTop:1}}>{p.prob}%</div>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <div style={{fontSize:13,fontWeight:800,color:T1}}>{p.name}</div>
            {isDone?<span style={{background:"rgba(0,200,83,0.15)",color:G2,borderRadius:4,padding:"1px 5px",fontSize:7,fontWeight:700}}>Done</span>:null}
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
            <span style={{background:tb,color:tc,borderRadius:20,padding:"1px 7px",fontSize:8,fontWeight:700}}>{p.type}</span>
            <span style={{background:"rgba(255,255,255,0.05)",color:T2,borderRadius:20,padding:"1px 7px",fontSize:8}}>{p.cat}</span>
          </div>
          <div style={{fontSize:9,color:T2,lineHeight:1.5,overflow:"hidden",maxHeight:30}}>{p.psych.slice(0,65)}...</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
          <button onClick={function(e){e.stopPropagation();props.onFav();}} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:isFav?GOLD:T2,padding:0}}>{isFav?"":""}</button>
          <span style={{color:T2,fontSize:14}}></span>
        </div>
      </div>
    </div>
  );
}

export function PatternDetail(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, G = theme.c.brand;

  var p = props.p;
  var [quizQ, setQuizQ] = useState(0);
  var [quizSel, setQuizSel] = useState(null);
  var [showQuiz, setShowQuiz] = useState(false);
  var tc = p.type=="Bullish"?G2:p.type=="Bearish"?R:GOLD;
  var quiz = [
    {q:"Signal type?",opts:[p.type,p.type=="Bullish"?"Bearish":"Bullish","Neutral"],ans:0},
    {q:"Stop loss?",opts:[p.sl.slice(0,25),p.entry.slice(0,25),"No SL needed"],ans:0},
    {q:"Success rate?",opts:[p.prob+"%",(p.prob-15)+"%",(p.prob+10)+"%"],ans:0},
  ];
  var qq = quiz[quizQ];
  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T1}}></button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:900,color:T1}}>{p.name}</div>
          <div style={{fontSize:8,color:T2}}>{p.cat}</div>
        </div>
        <span style={{background:tc+"22",color:tc,borderRadius:20,padding:"3px 10px",fontSize:9,fontWeight:700}}>{p.type}</span>
      </div>
      <div style={{padding:14}}>
        <PatternSVG name={p.id}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
          {[["Success",p.prob+"%",p.prob>=70?G2:GOLD],["Category",p.cat,BLUE],["Best",p.best.split(",")[0],GOLD]].map(function(r){
            return <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:10,padding:"9px 6px",textAlign:"center"}}><div style={{fontSize:7,color:T2,marginBottom:2}}>{r[0]}</div><div style={{fontSize:10,fontWeight:700,color:r[2]}}>{r[1]}</div></div>;
          })}
        </div>
        {[["PSYCHOLOGY",p.psych],["FORMATION",p.formation]].map(function(r){
          return <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:12,marginBottom:8}}><div style={{fontSize:8,color:T2,fontWeight:700,marginBottom:5,letterSpacing:0.5}}>{r[0]}</div><div style={{fontSize:11,color:T1,lineHeight:1.8}}>{r[1]}</div></div>;
        })}
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:12,marginBottom:8}}>
          <div style={{fontSize:8,color:T2,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>TRADING SETUP</div>
          {[["Entry",p.entry,G2],["Stop Loss",p.sl,R],["Target",p.target,GOLD],["R:R",p.rr,BLUE]].map(function(r){
            return <div key={r[0]} style={{display:"flex",gap:8,marginBottom:7}}><div style={{width:52,fontSize:8,fontWeight:700,color:r[2],flexShrink:0}}>{r[0]}</div><div style={{fontSize:10,color:T1,lineHeight:1.5}}>{r[1]}</div></div>;
          })}
        </div>
        <div style={{background:"rgba(0,200,83,0.06)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:12,padding:12,marginBottom:8}}>
          <div style={{fontSize:8,color:G2,fontWeight:700,marginBottom:5}}>TIMEFRAMES</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {p.tf.split(",").map(function(t){return <span key={t} style={{background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:20,padding:"2px 8px",fontSize:9,color:G2}}>{t.trim()}</span>;})}
          </div>
        </div>
        <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:12,padding:12,marginBottom:10}}>
          <div style={{fontSize:8,color:GOLD,fontWeight:700,marginBottom:4}}>PRO TIP</div>
          <div style={{fontSize:11,color:T1,lineHeight:1.7}}>{p.tip}</div>
        </div>
        <button onClick={function(){setShowQuiz(!showQuiz);setQuizSel(null);setQuizQ(0);}} style={{width:"100%",background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:12,padding:11,color:GOLD,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:showQuiz?8:0}}>
          {showQuiz?"Hide Quiz":"Take Pattern Quiz"}
        </button>
        {showQuiz?(
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:14}}>
            <div style={{fontSize:10,fontWeight:700,color:GOLD,marginBottom:8}}>Q{quizQ+1}/3: {qq.q}</div>
            {qq.opts.map(function(opt,i){
              var bg=quizSel==null?"rgba(255,255,255,0.04)":i==qq.ans?"rgba(0,200,83,0.2)":i==quizSel?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.04)";
              var bd=quizSel==null?BD:i==qq.ans?G:i==quizSel?R:BD;
              return <button key={i} onClick={function(){if(quizSel==null)setQuizSel(i);}} disabled={quizSel!=null} style={{width:"100%",background:bg,border:"1px solid "+bd,borderRadius:10,padding:"10px 12px",marginBottom:6,textAlign:"left",cursor:quizSel!=null?"default":"pointer",fontFamily:"inherit",fontSize:11,color:T1}}>{opt}</button>;
            })}
            {quizSel!=null?(
              <div style={{textAlign:"center",marginTop:8}}>
                <div style={{fontSize:12,fontWeight:700,color:quizSel==qq.ans?G2:R,marginBottom:8}}>{quizSel==qq.ans?"Correct!":"Wrong!"}</div>
                {quizQ<2?<button onClick={function(){setQuizQ(quizQ+1);setQuizSel(null);}} style={{background:BLUE,border:"none",borderRadius:10,padding:"8px 20px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Next</button>:<div style={{fontSize:10,color:G2,fontWeight:700}}>Quiz Complete!</div>}
              </div>
            ):null}
          </div>
        ):null}
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10,marginTop:10}}>
          <div style={{fontSize:8,color:theme.c.warn,lineHeight:1.7}}>Educational only. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
                         }
