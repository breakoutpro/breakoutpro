import { useState } from "react";
import { getPhase, OVERNIGHT, LEVELS, NEWS_POS, NEWS_NEG, SECTORS, WATCH, PLAN, METRICS, MT, computeMood, getVerdict, getVoiceSummary } from "./MarketMoodData";
import { Gauge, MiniCue, LevelCard, NewsBlock, SectorGrid } from "./MarketMoodParts";

// BreakoutPro - MarketMood.jsx
// Premium Today's Game Plan screen. 8 sections + 30 second voice summary.
// Rules: no backtick, no triple-equals, ASCII only.

function speakText(t){
  try{
    if(!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(t);
    u.lang="en-IN"; u.rate=1; u.pitch=1;
    window.speechSynthesis.speak(u);
  }catch(e){}
}

function Head(props){
  return <div style={{fontSize:12,color:MT.T2,fontWeight:800,margin:"4px 0 10px",letterSpacing:0.5}}>{props.children}</div>;
}

export default function MarketMood(props){
  var phase=getPhase();
  var mood=computeMood();
  var verdict=getVerdict();
  var setTab=props.setTab||function(){};
  var [speaking,setSpeaking]=useState(false);

  function onVoice(){
    var t=getVoiceSummary();
    setSpeaking(true);
    speakText(t);
    setTimeout(function(){setSpeaking(false);},1000);
  }

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:MT.BG,zIndex:350,overflowY:"auto"}}>

      {/* HEADER */}
      <div style={{background:MT.CARD,borderBottom:"1px solid "+MT.BD,padding:"16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:5}}>
        <button onClick={props.onClose} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:34,height:34,color:MT.T1,fontSize:16,cursor:"pointer",flexShrink:0}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:22,fontWeight:800,color:MT.T1}}>Today's Game Plan</div>
          <div style={{fontSize:11,color:MT.T2,marginTop:2,display:"flex",alignItems:"center",gap:5}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:phase.dot,display:"inline-block"}}></span>
            {phase.label}  &#8226;  {phase.sub}
          </div>
        </div>
      </div>

      <div style={{padding:"18px 16px 36px"}}>

        {/* 1. MOOD GAUGE + VERDICT + METRICS */}
        <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:16,padding:"20px 16px 16px",marginBottom:18}}>
          <Gauge mood={mood}/>
          <div style={{marginTop:14,background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:14}}>
            <div style={{fontSize:10,color:MT.CYAN||"#60A5FA",fontWeight:800,marginBottom:6,letterSpacing:0.4}}>AI MARKET VERDICT</div>
            <div style={{fontSize:13.5,color:MT.T1,lineHeight:1.7}}>{verdict}</div>
          </div>
          <div style={{display:"flex",gap:6,marginTop:12}}>
            {METRICS.map(function(m){
              return (
                <div key={m.label} style={{flex:1,background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:9,padding:"9px 3px",textAlign:"center"}}>
                  <div style={{fontSize:8,color:MT.T2,marginBottom:3}}>{m.label}</div>
                  <div style={{fontSize:11,fontWeight:800,color:m.color}}>{m.val}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 8. VOICE SUMMARY - placed near top for quick access */}
        <button onClick={onVoice} style={{width:"100%",background:MT.BLUE,border:"none",borderRadius:13,padding:14,color:"#fff",fontSize:13.5,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:"&#128266;"}}/>
          {speaking?"Playing...":"Listen 30-Second Market Mood"}
        </button>

        {/* 2. OVERNIGHT */}
        <Head>OVERNIGHT  &#8226;  WHAT HAPPENED LAST NIGHT</Head>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,marginBottom:18}}>
          {OVERNIGHT.map(function(c){return <MiniCue key={c.name} c={c}/>;})}
        </div>

        {/* 3. KEY LEVELS */}
        <Head>KEY LEVELS TODAY</Head>
        {LEVELS.map(function(L){return <LevelCard key={L.name} L={L}/>;})}

        {/* 4. NEWS IMPACT */}
        <Head>NEWS IMPACT STOCKS</Head>
        <NewsBlock pos={true} items={NEWS_POS}/>
        <NewsBlock pos={false} items={NEWS_NEG}/>

        {/* 5. SECTOR MOOD */}
        <Head>SECTOR MOOD</Head>
        <SectorGrid sectors={SECTORS}/>

        {/* 6. STOCKS TO WATCH */}
        <Head>STOCKS TO WATCH</Head>
        <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,overflow:"hidden",marginBottom:18}}>
          {WATCH.map(function(w,i){
            var c=w.setup=="Bullish"?MT.GREEN:w.setup=="Bearish"?MT.RED:MT.YELLOW;
            return (
              <div key={w.sym} onClick={function(){setTab("scan");}} style={{display:"flex",alignItems:"center",gap:11,padding:"12px 13px",borderBottom:i<WATCH.length-1?"1px solid "+MT.BD:"none",cursor:"pointer"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:c,flexShrink:0}}></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:800,color:MT.T1}}>{w.sym}</div>
                  <div style={{fontSize:9.5,color:MT.T2,marginTop:1}}>{w.note}</div>
                </div>
                <span style={{fontSize:9,fontWeight:700,color:c,background:c+"18",borderRadius:6,padding:"3px 9px"}}>{w.setup}</span>
              </div>
            );
          })}
        </div>

        {/* 7. TRADING PLAN */}
        <Head>TRADING PLAN</Head>
        <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:14,padding:14,marginBottom:18}}>
          {PLAN.map(function(p,i){
            return (
              <div key={p.cond} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 0",borderTop:i>0?"1px solid "+MT.DIV:"none"}}>
                <div style={{width:10,height:10,borderRadius:3,background:p.color,flexShrink:0}}></div>
                <span style={{fontSize:12.5,fontWeight:800,color:MT.T1,width:120,flexShrink:0}}>{p.cond}</span>
                <span style={{fontSize:11,color:MT.T2,flex:1}}>{p.act}</span>
              </div>
            );
          })}
        </div>

        {/* DISCLAIMER */}
        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11}}>
          <div style={{fontSize:8.5,color:"#F97316",lineHeight:1.6}}>Educational only. Not SEBI registered. Not investment advice. Levels, cues and plans are for learning, not trade calls.</div>
        </div>

      </div>
    </div>
  );
      }
