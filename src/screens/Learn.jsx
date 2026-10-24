import { useState } from "react";
import { CANDLE_PATTERNS, OI_TOPICS, STRATEGIES, RISK_TOPICS, PSYCH_TOPICS, PRICE_TOPICS, LESSONS, TIPS, TOPICS } from "./LearnData";

import { useTheme } from "../theme/ThemeProvider";
import { t, useLang } from "../i18n/translations";
var G="#00C853",R="#EF4444";
var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A";
var T1="#FFFFFF",T2="#8899BB";

var DISC_EN="Educational only. Not SEBI registered. Not investment advice.";

function BackHeader(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  CB=theme.c.card; BD=theme.c.border; T1=theme.c.text1; T2=theme.c.text2;
  return (
    <div style={{background:CB,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
      <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1,flexShrink:0}}>&#8592;</button>
      <div>
        <div style={{fontSize:14,fontWeight:700,color:T1}}>{props.title}</div>
        {props.sub?<div style={{fontSize:12,color:T2}}>{props.sub}</div>:null}
      </div>
    </div>
  );
}

function TopicCard(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  useLang();
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var G = theme.c.brand; T1=theme.c.text1;
  CB=theme.c.card; BD=theme.c.border; T2=theme.c.text2;

  var tp=props.topic;
  var kb="learn."+props.grp+"."+props.idx;
  var [open,setOpen]=useState(false);
  return (
    <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,marginBottom:8,overflow:"hidden"}}>
      <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={function(){setOpen(!open);}}>
        <div style={{fontSize:12,fontWeight:700,color:T1}}>{t(kb+".t", tp.title)}</div>
        <span style={{color:G,fontSize:16,fontWeight:700,flexShrink:0}}>{open?"v":">"}</span>
      </div>
      {open?(
        <div style={{padding:"0 14px 14px"}}>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:12,fontSize:12,color:T2,lineHeight:1.9}}>{t(kb+".c", tp.content)}</div>
        </div>
      ):null}
    </div>
  );
}

function CandleCard(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  useLang();
  var BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var G = theme.c.brand; T1=theme.c.text1;
  CB=theme.c.card; BD=theme.c.border; T2=theme.c.text2; R=theme.c.down;

  var p=props.pattern;
  var [open,setOpen]=useState(false);
  var tc=p.type=="Bullish"?theme.c.up:p.type=="Bearish"?theme.c.down:BLUE;
  return (
    <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,marginBottom:8,overflow:"hidden"}}>
      <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}} onClick={function(){setOpen(!open);}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:T1}}>{p.name}</div>
          <span style={{background:tc+"22",color:tc,borderRadius:4,padding:"4px 8px",fontSize:12,fontWeight:700}}>{t("learn.type."+p.type, p.type)}</span>
        </div>
        <span style={{color:G,fontSize:14,flexShrink:0}}>{open?"v":">"}</span>
      </div>
      {open?(
        <div style={{padding:"0 14px 12px",fontSize:12,color:T2,lineHeight:1.8}}>{t("learn.candle."+props.idx+".d", p.desc)}</div>
      ):null}
    </div>
  );
}

function Disclaimer(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  useLang();

  return (
    <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:12,marginTop:8}}>
      <div style={{fontSize:12,color:theme.c.warn}}>{t("c.edu_only", DISC_EN)}</div>
    </div>
  );
}

function Section(props){
  return (
    <div style={{background:DB,minHeight:"100vh",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <BackHeader onBack={props.onBack} title={props.title} sub={props.sub}/>
      <div style={{padding:16}}>
        {props.children}
        {props.disc?<Disclaimer/>:null}
      </div>
    </div>
  );
}

export default function LearnScreen(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  useLang();
  R=theme.c.down;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var G = theme.c.brand, BLUE = theme.c.blue; T1=theme.c.text1;
  DB=theme.c.bg; CB=theme.c.card; BD=theme.c.border; T2=theme.c.text2;

  var [sec,setSec]=useState("home");
  var back=function(){setSec("home");};

  if(sec=="candles") return (
    <Section onBack={back} title={t("learn.sec.candles.t")} sub={t("learn.patterns_count",{n:CANDLE_PATTERNS.length})}>
      {CANDLE_PATTERNS.map(function(p,i){return <CandleCard key={p.name} idx={i} pattern={p}/>;})}
    </Section>
  );

  if(sec=="oi") return (
    <Section onBack={back} title={t("learn.sec.oi.t")} sub={t("learn.sub.oi")} disc={true}>
      {OI_TOPICS.map(function(tp,i){return <TopicCard key={tp.title} grp="oi" idx={i} topic={tp}/>;})}
    </Section>
  );

  if(sec=="strategy") return (
    <Section onBack={back} title={t("learn.sec.strategy.t")} sub={t("learn.sub.strategy")} disc={true}>
      {STRATEGIES.map(function(tp,i){return <TopicCard key={tp.title} grp="strat" idx={i} topic={tp}/>;})}
    </Section>
  );

  if(sec=="risk") return (
    <Section onBack={back} title={t("learn.sec.risk.t")} sub={t("learn.sub.risk")} disc={true}>
      {RISK_TOPICS.map(function(tp,i){return <TopicCard key={tp.title} grp="risk" idx={i} topic={tp}/>;})}
    </Section>
  );

  if(sec=="psychology") return (
    <Section onBack={back} title={t("learn.sec.psychology.t")} sub={t("learn.sub.psychology")}>
      {PSYCH_TOPICS.map(function(tp,i){return <TopicCard key={tp.title} grp="psych" idx={i} topic={tp}/>;})}
    </Section>
  );

  if(sec=="priceaction") return (
    <Section onBack={back} title={t("learn.sec.priceaction.t")} sub={t("learn.sub.priceaction")}>
      {PRICE_TOPICS.map(function(tp,i){return <TopicCard key={tp.title} grp="price" idx={i} topic={tp}/>;})}
    </Section>
  );

  // HOME
  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{padding:16}}>
        <div style={{fontSize:22,fontWeight:900,color:T1,marginBottom:4}}>{t("learn.title_a")} <span style={{color:BLUE}}>{t("learn.title_b")}</span></div>
        <div style={{fontSize:12,color:T2,marginBottom:16}}>{t("learn.offline")}</div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          {TOPICS.map(function(tc){
            return (
              <div key={tc.id} style={{background:tc.bg,border:"1px solid "+tc.bd,borderRadius:14,padding:16,cursor:"pointer"}} onClick={function(){setSec(tc.id);}}>
                <div style={{width:32,height:32,borderRadius:16,background:CB,border:"1px solid "+BD,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8,fontSize:16}} dangerouslySetInnerHTML={{__html:tc.icon}}/>
                <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:4}}>{t("learn.sec."+tc.id+".t", tc.title)}</div>
                <div style={{fontSize:12,color:T2}}>{t("learn.sec."+tc.id+".s", tc.sub)}</div>
              </div>
            );
          })}
        </div>

        <div style={{background:CB,border:"1px solid rgba(37,99,235,0.2)",borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,color:BLUE,fontWeight:700,marginBottom:8}}>{t("learn.todays_lesson")}</div>
          <div style={{fontSize:14,color:T1,lineHeight:1.7,fontWeight:500}}>{t("learn.lesson."+(new Date().getDay()%LESSONS.length), LESSONS[new Date().getDay()%LESSONS.length])}</div>
        </div>

        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,padding:16}}>
          <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:12}}>{t("learn.quick_tips")}</div>
          {TIPS.map(function(tip,i){
            return (
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:BLUE,marginTop:4,flexShrink:0}}></div>
                <div style={{fontSize:12,color:T2,lineHeight:1.5}}>{t("learn.tip."+i, tip)}</div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
