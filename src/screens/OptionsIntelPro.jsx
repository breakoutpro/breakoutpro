import { useState } from "react";
import { useAcademyProgress } from "../hooks/useAcademyProgress";
import { GREEKS, STRATEGY_CARDS, MAX_PAIN_SAMPLE, QUIZ_QUESTIONS } from "./OptionsIntelProData";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - OptionsIntelPro.jsx
// Fully offline Options Intelligence Pro. No live option chain, no fake
// market data - every number shown is either static educational content
// or computed live from the user's own entered practice values using a
// standard, simplified Black-Scholes-style approximation (real math, not
// a live feed). Reuses useAcademyProgress() directly - same hook, same
// storage keys as the rest of Trading Academy, not a second system.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BLUE="#3B82F6",UP="#22C55E",R="#EF4444",WARN="#F97316";

// Standard normal CDF approximation (Abramowitz & Stegun 26.2.17) - a
// well-known, deterministic numerical formula, not a fabricated shortcut.
function normCdf(x){
  var t = 1/(1+0.2316419*Math.abs(x));
  var d = 0.3989423*Math.exp(-x*x/2);
  var p = d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));
  return x>=0 ? 1-p : p;
}
function normPdf(x){ return 0.3989423*Math.exp(-x*x/2); }

function bsApprox(spot, strike, iv, days, isCall){
  var S = parseFloat(spot), K = parseFloat(strike), sigma = parseFloat(iv)/100, T = parseFloat(days)/365;
  if(!S || !K || !sigma || !T || S<=0 || K<=0 || sigma<=0 || T<=0) return null;
  var d1 = (Math.log(S/K) + 0.5*sigma*sigma*T) / (sigma*Math.sqrt(T));
  var delta = isCall ? normCdf(d1) : normCdf(d1)-1;
  var vega = S*Math.sqrt(T)*normPdf(d1) / 100;
  var thetaApprox = -(S*normPdf(d1)*sigma) / (2*Math.sqrt(T)) / 365;
  return { delta:delta, vega:vega, thetaPerDay:thetaApprox };
}

function inputStyle(){
  return {width:"100%",background:"#0B0E13",border:"1px solid "+BD,borderRadius:9,padding:"8px 12px",color:T1,fontSize:12,fontFamily:"inherit",boxSizing:"border-box",marginBottom:12};
}
function labelStyle(){
  return {fontSize:12,color:T2,fontWeight:700,display:"block",marginBottom:4};
}

var SECTIONS = [
  { id:"greeks", label:"Option Greeks Learning" },
  { id:"simulator", label:"Greeks Simulator" },
  { id:"maxpain", label:"Max Pain Learning" },
  { id:"pcr", label:"PCR Learning & Calculator" },
  { id:"ivcrush", label:"IV Crush Simulator" },
  { id:"walls", label:"Call Wall / Put Wall" },
  { id:"oibuilder", label:"Open Interest Builder" },
  { id:"strategies", label:"Expiry Strategy Cards" },
  { id:"quiz", label:"Mini Quiz (10 Questions)" }
];

export default function OptionsIntelPro(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  CARD=theme.c.card; BD=theme.c.border;
  T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3; BLUE=theme.c.blue; UP=theme.c.up; R=theme.c.down; T2=theme.c.text2;
  var onBack = props.onBack || function(){};
  var progress = useAcademyProgress(); // same hook/storage as the rest of Academy
  var [section, setSection] = useState(null);

  if(!section){
    var quizDone = progress.isComplete("oip_quiz");
    return (
      <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
        <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:T1}}>Options Intelligence Pro</div>
            <div style={{fontSize:12,color:T2}}>Fully offline. Educational only. No live option chain.</div>
          </div>
        </div>
        <div style={{padding:16}}>
          {SECTIONS.map(function(s){
            return (
              <div key={s.id} onClick={function(){setSection(s.id);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,fontWeight:700,color:T1}}>{s.label}</span>
                {s.id=="quiz" && quizDone ? <span style={{fontSize:12,fontWeight:700,color:BLUE}}>Completed</span> : <span style={{color:T3,fontSize:16}}>&#8250;</span>}
              </div>
            );
          })}
          <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:12}}>
            <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Educational only. No live market data anywhere in this module. Not investment advice.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={function(){setSection(null);}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{fontSize:14,fontWeight:800,color:T1}}>{SECTIONS.filter(function(s){return s.id==section;})[0].label}</div>
      </div>
      <div style={{padding:16}}>
        {section=="greeks" ? <GreeksLearning/> : null}
        {section=="simulator" ? <GreeksSimulator/> : null}
        {section=="maxpain" ? <MaxPainLearning/> : null}
        {section=="pcr" ? <PCRLearning/> : null}
        {section=="ivcrush" ? <IVCrushSimulator/> : null}
        {section=="walls" ? <CallPutWalls/> : null}
        {section=="oibuilder" ? <OIBuilder/> : null}
        {section=="strategies" ? <StrategyCards/> : null}
        {section=="quiz" ? <MiniQuiz progress={progress}/> : null}
      </div>
    </div>
  );
}

function GreeksLearning(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T1=theme.c.text1;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card, T3 = theme.c.text3;

  var [openId, setOpenId] = useState(GREEKS[0].id);
  return (
    <div>
      {GREEKS.map(function(g){
        var open = openId==g.id;
        return (
          <div key={g.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12}}>
            <div onClick={function(){setOpenId(open?null:g.id);}} style={{display:"flex",justifyContent:"space-between",cursor:"pointer"}}>
              <span style={{fontSize:14,fontWeight:800,color:T1}}>{g.name}</span>
              <span style={{color:T3}}>{open?"\u2212":"+"}</span>
            </div>
            {open ? (
              <div style={{marginTop:12}}>
                <Field label="Definition" text={g.definition}/>
                <Field label="How it behaves" text={g.behavior}/>
                <Field label="Example" text={g.example}/>
                <Field label="Common mistakes" text={g.mistakes}/>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
function Field(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var T2 = theme.c.text2; T1=theme.c.text1;

  return (
    <div style={{marginBottom:8}}>
      <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:4}}>{props.label.toUpperCase()}</div>
      <div style={{fontSize:12,color:T1,lineHeight:1.6}}>{props.text}</div>
    </div>
  );
}

function GreeksSimulator(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3;

  var [spot,setSpot]=useState("100");
  var [strike,setStrike]=useState("100");
  var [premium,setPremium]=useState("3");
  var [days,setDays]=useState("30");
  var [iv,setIv]=useState("20");
  var [isCall,setIsCall]=useState(true);

  var r = bsApprox(spot,strike,iv,days,isCall);

  return (
    <div>
      <div style={{fontSize:12,color:T3,marginBottom:16,lineHeight:1.5}}>Enter practice values below. This uses a standard simplified approximation formula for educational illustration only - never a live or guaranteed value.</div>
      <label style={labelStyle()}>Spot Price</label>
      <input style={inputStyle()} type="number" value={spot} onChange={function(e){setSpot(e.target.value);}}/>
      <label style={labelStyle()}>Strike Price</label>
      <input style={inputStyle()} type="number" value={strike} onChange={function(e){setStrike(e.target.value);}}/>
      <label style={labelStyle()}>Premium (reference only)</label>
      <input style={inputStyle()} type="number" value={premium} onChange={function(e){setPremium(e.target.value);}}/>
      <label style={labelStyle()}>Days to Expiry</label>
      <input style={inputStyle()} type="number" value={days} onChange={function(e){setDays(e.target.value);}}/>
      <label style={labelStyle()}>IV (%)</label>
      <input style={inputStyle()} type="number" value={iv} onChange={function(e){setIv(e.target.value);}}/>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <button onClick={function(){setIsCall(true);}} style={{flex:1,background:isCall?BLUE:"transparent",border:"1px solid "+(isCall?BLUE:BD),borderRadius:9,padding:8,color:isCall?"#fff":T2,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Call</button>
        <button onClick={function(){setIsCall(false);}} style={{flex:1,background:!isCall?BLUE:"transparent",border:"1px solid "+(!isCall?BLUE:BD),borderRadius:9,padding:8,color:!isCall?"#fff":T2,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Put</button>
      </div>

      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16}}>
        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>APPROXIMATE EDUCATIONAL IMPACT</div>
        {r ? (
          <div>
            <Row label="Approx. Delta" value={r.delta.toFixed(3)}/>
            <Row label="Approx. Vega (per 1% IV)" value={r.vega.toFixed(3)}/>
            <Row label="Approx. Theta (per day)" value={r.thetaPerDay.toFixed(3)} last={true}/>
          </div>
        ) : <div style={{fontSize:12,color:T3}}>Enter valid values above to see an approximation.</div>}
      </div>
    </div>
  );
}
function Row(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T1=theme.c.text1;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, T2 = theme.c.text2;

  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:props.last?"none":"1px solid "+BD}}>
      <span style={{fontSize:12,color:T2}}>{props.label}</span>
      <span style={{fontSize:12,fontWeight:700,color:T1}}>{props.value}</span>
    </div>
  );
}

function computeMaxPain(strikes){
  var candidates = strikes.map(function(row){ return row.strike; });
  var best = null, bestPain = Infinity;
  candidates.forEach(function(candidate){
    var totalPayout = 0;
    strikes.forEach(function(row){
      if(candidate>row.strike) totalPayout += (candidate-row.strike)*row.callOI;
      if(candidate<row.strike) totalPayout += (row.strike-candidate)*row.putOI;
    });
    if(totalPayout<bestPain){ bestPain=totalPayout; best=candidate; }
  });
  return best;
}

function MaxPainLearning(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T1=theme.c.text1;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3, T2=theme.c.text2;

  var maxPainStrike = computeMaxPain(MAX_PAIN_SAMPLE.strikes);
  return (
    <div>
      <Field label="Definition" text="Max Pain is an educational concept describing the strike price at which option writers, as a group, would face the smallest total payout obligation at expiry - it is not a guaranteed price target."/>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginTop:12}}>
        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>{MAX_PAIN_SAMPLE.label.toUpperCase()}</div>
        {MAX_PAIN_SAMPLE.strikes.map(function(row){
          return (
            <div key={row.strike} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid "+BD}}>
              <span style={{fontSize:12,color:T2}}>Strike {row.strike}</span>
              <span style={{fontSize:12,color:T3}}>Call OI {row.callOI} &#8226; Put OI {row.putOI}</span>
            </div>
          );
        })}
        <div style={{marginTop:12,fontSize:12,fontWeight:700,color:T1}}>Computed Max Pain strike (from this example only): {maxPainStrike}</div>
      </div>
    </div>
  );
}

function PCRLearning(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T1=theme.c.text1;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card, T2 = theme.c.text2;

  var [putVal,setPutVal]=useState("");
  var [callVal,setCallVal]=useState("");
  var p = parseFloat(putVal), c = parseFloat(callVal);
  var pcr = (p>0 && c>0) ? (p/c) : null;
  return (
    <div>
      <Field label="Definition" text="Put Call Ratio (PCR) is calculated as Put OI (or volume) divided by Call OI (or volume). It is an observational sentiment gauge some chart readers watch, never a guaranteed signal."/>
      <div style={{marginTop:12}}>
        <label style={labelStyle()}>Put OI / Volume (your input)</label>
        <input style={inputStyle()} type="number" value={putVal} onChange={function(e){setPutVal(e.target.value);}}/>
        <label style={labelStyle()}>Call OI / Volume (your input)</label>
        <input style={inputStyle()} type="number" value={callVal} onChange={function(e){setCallVal(e.target.value);}}/>
      </div>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16}}>
        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>YOUR PCR</div>
        <div style={{fontSize:18,fontWeight:800,color:T1}}>{pcr!=null?pcr.toFixed(2):"--"}</div>
      </div>
    </div>
  );
}

function IVCrushSimulator(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  R=theme.c.down; T1=theme.c.text1; UP=theme.c.up;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card, T2 = theme.c.text2;

  var [before,setBefore]=useState("35");
  var [after,setAfter]=useState("18");
  var [spot,setSpot]=useState("100");
  var [strike,setStrike]=useState("100");
  var [days,setDays]=useState("5");

  var b = parseFloat(before), a = parseFloat(after);
  var r1 = bsApprox(spot,strike,before,days,true);
  var impact = (r1 && isFinite(a) && isFinite(b)) ? r1.vega*(a-b) : null;

  return (
    <div>
      <Field label="Definition" text="IV Crush describes a sharp drop in implied volatility, often right after a known event like earnings, which can reduce an option's premium even if the underlying price barely moves."/>
      <label style={labelStyle()}>Before IV (%)</label>
      <input style={inputStyle()} type="number" value={before} onChange={function(e){setBefore(e.target.value);}}/>
      <label style={labelStyle()}>After IV (%)</label>
      <input style={inputStyle()} type="number" value={after} onChange={function(e){setAfter(e.target.value);}}/>
      <label style={labelStyle()}>Spot (practice)</label>
      <input style={inputStyle()} type="number" value={spot} onChange={function(e){setSpot(e.target.value);}}/>
      <label style={labelStyle()}>Strike (practice)</label>
      <input style={inputStyle()} type="number" value={strike} onChange={function(e){setStrike(e.target.value);}}/>
      <label style={labelStyle()}>Days to Expiry</label>
      <input style={inputStyle()} type="number" value={days} onChange={function(e){setDays(e.target.value);}}/>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16}}>
        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>APPROXIMATE PREMIUM IMPACT (vega-based)</div>
        <div style={{fontSize:16,fontWeight:800,color:impact!=null?(impact>=0?UP:R):T1}}>{impact!=null?(impact>=0?"+":"")+impact.toFixed(3):"--"}</div>
      </div>
    </div>
  );
}

function CallPutWalls(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T2=theme.c.text2; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card, T2=theme.c.text2;

  var strikes = MAX_PAIN_SAMPLE.strikes;
  var callWall = strikes.reduce(function(a,b){ return b.callOI>a.callOI?b:a; });
  var putWall = strikes.reduce(function(a,b){ return b.putOI>a.putOI?b:a; });
  return (
    <div>
      <Field label="Definition" text="A Call Wall is the strike with unusually high call open interest, sometimes studied as an area of potential resistance-side interest. A Put Wall is the strike with unusually high put open interest, sometimes studied as an area of potential support-side interest. Neither is a guarantee."/>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginTop:12}}>
        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>{MAX_PAIN_SAMPLE.label.toUpperCase()}</div>
        <Row label="Call Wall (highest call OI)" value={"Strike "+callWall.strike}/>
        <Row label="Put Wall (highest put OI)" value={"Strike "+putWall.strike} last={true}/>
      </div>
    </div>
  );
}

function OIBuilder(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3;

  var [rows,setRows]=useState([{strike:"",callOI:"",putOI:""}]);
  function updateRow(i,field,val){
    setRows(function(prev){
      var next = prev.slice();
      next[i] = Object.assign({}, next[i]);
      next[i][field] = val;
      return next;
    });
  }
  function addRow(){ setRows(function(prev){ return prev.concat([{strike:"",callOI:"",putOI:""}]); }); }

  var valid = rows.filter(function(r){ return r.strike && r.callOI && r.putOI; }).map(function(r){
    return { strike:parseFloat(r.strike), callOI:parseFloat(r.callOI), putOI:parseFloat(r.putOI) };
  });
  var callWall = valid.length ? valid.reduce(function(a,b){ return b.callOI>a.callOI?b:a; }) : null;
  var putWall = valid.length ? valid.reduce(function(a,b){ return b.putOI>a.putOI?b:a; }) : null;

  return (
    <div>
      <div style={{fontSize:12,color:T3,marginBottom:16,lineHeight:1.5}}>Build your own practice option chain below, then see the resulting educational read.</div>
      {rows.map(function(r,i){
        return (
          <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
            <input placeholder="Strike" style={Object.assign({},inputStyle(),{marginBottom:4})} type="number" value={r.strike} onChange={function(e){updateRow(i,"strike",e.target.value);}}/>
            <input placeholder="Call OI" style={Object.assign({},inputStyle(),{marginBottom:4})} type="number" value={r.callOI} onChange={function(e){updateRow(i,"callOI",e.target.value);}}/>
            <input placeholder="Put OI" style={Object.assign({},inputStyle(),{marginBottom:4})} type="number" value={r.putOI} onChange={function(e){updateRow(i,"putOI",e.target.value);}}/>
          </div>
        );
      })}
      <button onClick={addRow} style={{background:"transparent",border:"1px solid "+BD,borderRadius:9,padding:"8px 12px",color:T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:16,minHeight:44}}>+ Add Strike Row</button>

      {valid.length>0 ? (
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16}}>
          <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>YOUR EDUCATIONAL READ</div>
          <Row label="Likely resistance-side interest" value={"Strike "+callWall.strike}/>
          <Row label="Likely support-side interest" value={"Strike "+putWall.strike} last={true}/>
        </div>
      ) : null}
    </div>
  );
}

function StrategyCards(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T1=theme.c.text1;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, CARD = theme.c.card;

  return (
    <div>
      {STRATEGY_CARDS.map(function(s){
        return (
          <div key={s.name} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:8}}>{s.name}</div>
            <Field label="Setup" text={s.setup}/>
            <Field label="Risk" text={s.risk}/>
            <Field label="Reward" text={s.reward}/>
            <Field label="Best Market Condition" text={s.bestCondition}/>
            <Field label="Common Mistakes" text={s.mistakes}/>
          </div>
        );
      })}
    </div>
  );
}

function MiniQuiz(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  T1=theme.c.text1;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3;

  var progress = props.progress;
  var [idx,setIdx]=useState(0);
  var [answers,setAnswers]=useState({});
  var [submitted,setSubmitted]=useState(false);
  var q = QUIZ_QUESTIONS[idx];

  function pick(oi){
    if(submitted) return;
    setAnswers(function(prev){ var next=Object.assign({},prev); next[idx]=oi; return next; });
  }
  function next(){
    if(idx+1<QUIZ_QUESTIONS.length) setIdx(idx+1);
    else {
      setSubmitted(true);
      progress.markComplete("oip_quiz");
    }
  }

  if(submitted){
    var score = QUIZ_QUESTIONS.filter(function(qq,i){ return answers[i]==qq.correct; }).length;
    return (
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,textAlign:"center"}}>
        <div style={{fontSize:14,fontWeight:800,color:BLUE,marginBottom:8}}>Quiz Complete</div>
        <div style={{fontSize:12,color:T2}}>{score} of {QUIZ_QUESTIONS.length} correct</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{fontSize:12,color:T3,marginBottom:12}}>Question {idx+1} of {QUIZ_QUESTIONS.length}</div>
      <div style={{fontSize:14,fontWeight:700,color:T1,marginBottom:16}}>{q.q}</div>
      {q.options.map(function(opt,oi){
        var picked = answers[idx]==oi;
        return (
          <div key={oi} onClick={function(){pick(oi);}} style={{border:"1px solid "+(picked?BLUE:BD),background:picked?"rgba(59,130,246,0.1)":"transparent",borderRadius:9,padding:"12px 12px",marginBottom:8,fontSize:12,color:T1,cursor:"pointer"}}>{opt}</div>
        );
      })}
      <button onClick={next} disabled={answers[idx]==null} style={{width:"100%",background:answers[idx]!=null?BLUE:CARD,border:"none",borderRadius:10,padding:12,color:answers[idx]!=null?"#fff":T3,fontSize:12,fontWeight:800,cursor:answers[idx]!=null?"pointer":"default",fontFamily:"inherit",marginTop:8,minHeight:44}}>{idx+1<QUIZ_QUESTIONS.length?"Next":"Finish Quiz"}</button>
    </div>
  );
}
