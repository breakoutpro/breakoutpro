import { useState } from "react";
import { CANDLE_PATTERNS, OI_TOPICS, STRATEGIES, RISK_TOPICS, PSYCH_TOPICS, PRICE_TOPICS, LESSONS, TIPS, TOPICS } from "./LearnData";

var G="#00C853",R="#EF4444",GOLD="#F59E0B";
var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A";
var T1="#FFFFFF",T2="#8899BB";

var DISC="Educational only. Not SEBI registered. Not investment advice.";

function BackHeader(props){
  return (
    <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
      <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1,flexShrink:0}}>&#8592;</button>
      <div>
        <div style={{fontSize:14,fontWeight:700,color:T1}}>{props.title}</div>
        {props.sub?<div style={{fontSize:8,color:T2}}>{props.sub}</div>:null}
      </div>
    </div>
  );
}

function TopicCard(props){
  var t=props.topic;
  var [open,setOpen]=useState(false);
  return (
    <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,marginBottom:8,overflow:"hidden"}}>
      <div style={{padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={function(){setOpen(!open);}}>
        <div style={{fontSize:12,fontWeight:700,color:T1}}>{t.title}</div>
        <span style={{color:G,fontSize:16,fontWeight:700,flexShrink:0}}>{open?"v":">"}</span>
      </div>
      {open?(
        <div style={{padding:"0 14px 14px"}}>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:12,fontSize:11,color:T2,lineHeight:1.9}}>{t.content}</div>
        </div>
      ):null}
    </div>
  );
}

function CandleCard(props){
  var p=props.pattern;
  var [open,setOpen]=useState(false);
  var tc=p.type=="Bullish"?G:p.type=="Bearish"?R:GOLD;
  return (
    <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,marginBottom:8,overflow:"hidden"}}>
      <div style={{padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}} onClick={function(){setOpen(!open);}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:T1}}>{p.name}</div>
          <span style={{background:tc+"22",color:tc,borderRadius:4,padding:"1px 7px",fontSize:8,fontWeight:700}}>{p.type}</span>
        </div>
        <span style={{color:G,fontSize:14,flexShrink:0}}>{open?"v":">"}</span>
      </div>
      {open?(
        <div style={{padding:"0 14px 12px",fontSize:11,color:T2,lineHeight:1.8}}>{p.desc}</div>
      ):null}
    </div>
  );
}

function Disclaimer(){
  return (
    <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10,marginTop:6}}>
      <div style={{fontSize:8,color:"#F97316"}}>{DISC}</div>
    </div>
  );
}

function Section(props){
  return (
    <div style={{background:DB,minHeight:"100vh",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <BackHeader onBack={props.onBack} title={props.title} sub={props.sub}/>
      <div style={{padding:14}}>
        {props.children}
        {props.disc?<Disclaimer/>:null}
      </div>
    </div>
  );
}

export default function LearnScreen(){
  var [sec,setSec]=useState("home");
  var back=function(){setSec("home");};

  if(sec=="candles") return (
    <Section onBack={back} title="Candlestick Patterns" sub={CANDLE_PATTERNS.length+" patterns  tap to expand"}>
      {CANDLE_PATTERNS.map(function(p){return <CandleCard key={p.name} pattern={p}/>;})}
    </Section>
  );

  if(sec=="oi") return (
    <Section onBack={back} title="Options Basics" sub="PCR, Max Pain, Greeks" disc={true}>
      {OI_TOPICS.map(function(t){return <TopicCard key={t.title} topic={t}/>;})}
    </Section>
  );

  if(sec=="strategy") return (
    <Section onBack={back} title="Trading Strategies" sub="EMA, VWAP, Breakout, CPR, ORB" disc={true}>
      {STRATEGIES.map(function(t){return <TopicCard key={t.title} topic={t}/>;})}
    </Section>
  );

  if(sec=="risk") return (
    <Section onBack={back} title="Risk Management" sub="Position size, SL, R:R ratio" disc={true}>
      {RISK_TOPICS.map(function(t){return <TopicCard key={t.title} topic={t}/>;})}
    </Section>
  );

  if(sec=="psychology") return (
    <Section onBack={back} title="Trading Psychology" sub="Mindset, emotions, discipline">
      {PSYCH_TOPICS.map(function(t){return <TopicCard key={t.title} topic={t}/>;})}
    </Section>
  );

  if(sec=="priceaction") return (
    <Section onBack={back} title="Price Action" sub="Support, resistance, market structure">
      {PRICE_TOPICS.map(function(t){return <TopicCard key={t.title} topic={t}/>;})}
    </Section>
  );

  // HOME
  return (
    <div style={{background:DB,minHeight:"100%",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{padding:14}}>
        <div style={{fontSize:20,fontWeight:900,color:T1,marginBottom:4}}>Learn <span style={{color:G}}>Trading</span></div>
        <div style={{fontSize:10,color:T2,marginBottom:16}}>100% Offline  No internet required</div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {TOPICS.map(function(t){
            return (
              <div key={t.id} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:14,padding:14,cursor:"pointer"}} onClick={function(){setSec(t.id);}}>
                <div style={{width:32,height:32,borderRadius:8,background:CB,border:"1px solid "+BD,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8,fontSize:16}} dangerouslySetInnerHTML={{__html:t.icon}}/>
                <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:3}}>{t.title}</div>
                <div style={{fontSize:8,color:T2}}>{t.sub}</div>
              </div>
            );
          })}
        </div>

        <div style={{background:"linear-gradient(135deg,#0F1629,#1A2A1A)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:10,color:G,fontWeight:700,marginBottom:6}}>Today's Lesson</div>
          <div style={{fontSize:13,color:T1,lineHeight:1.7,fontWeight:500}}>{LESSONS[new Date().getDay()%LESSONS.length]}</div>
        </div>

        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:10}}>Quick Tips</div>
          {TIPS.map(function(tip,i){
            return (
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:G,marginTop:4,flexShrink:0}}></div>
                <div style={{fontSize:11,color:T2,lineHeight:1.5}}>{tip}</div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
