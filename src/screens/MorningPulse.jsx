import { useState, useEffect } from "react";
import { getMarketStatus, GLOBAL, INDICES, MARKET_SUMMARY, STOCKS_WATCH } from "./PulseData";
import PulseOverview from "./PulseOverview";
import PulseIndexDetail from "./PulseIndexDetail";

import { useTheme } from "../theme/ThemeProvider";
var DB="#050816",CB="#0B1224",BD="#1B2A4D";
var G="#00C853",G2="#00E676",R="#EF4444";
var GOLD="#F59E0B",BLUE="#3B82F6",PURPLE="#8B5CF6";
var T1="#FFFFFF",T2="#8FA2C9",T3="#5B6472";

function buildPrompt(){
  var today=new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  var p="You are an expert Indian stock market analyst. It is "+today+". Give a complete Market Pulse for Indian traders.";
  p+=" Include these sections with clear headers:";
  p+=" 1. OVERNIGHT SUMMARY: What happened globally (US markets, SGX Nifty, crude oil, gold, dollar index).";
  p+=" 2. TODAY MARKET OUTLOOK: Expected direction for NIFTY and BANKNIFTY, key levels.";
  p+=" 3. GEOPOLITICAL IMPACT: Any ongoing geopolitical events affecting markets.";
  p+=" 4. STOCKS TO WATCH: 5 stocks with reason they may move (educational - not advice).";
  p+=" 5. OPTIONS EDUCATION: Whether setup favors Call or Put buyers (technical only, not advice).";
  p+=" 6. SECTOR FOCUS: Which sectors look strong/weak and why.";
  p+=" 7. KEY EVENTS: Any results, RBI news, FII data, important events.";
  p+=" 8. CHECKLIST: 5 things trader must check.";
  p+=" Format clearly with numbered sections. Be specific with NIFTY levels. End with disclaimer this is educational only, not SEBI registered advice.";
  return p;
}


export default function MorningPulse(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue, G = theme.c.brand, T3 = theme.c.text3; T1=theme.c.text1;

  var setTab=props.setTab||function(){};
  var [pulse,setPulse]=useState("");
  var [loading,setLoading]=useState(false);
  var [error,setError]=useState("");
  var [tab,setTab2]=useState("overview");
  var [lastFetch,setLastFetch]=useState("");
  var [status,setStatus]=useState(getMarketStatus());

  var now=new Date();
  var dateStr=now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"});
  var timeStr=now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});

  useEffect(function(){
    var t=setInterval(function(){setStatus(getMarketStatus());},30000);
    return function(){clearInterval(t);};
  },[]);

  function getPulse(){
    setLoading(true);setError("");setPulse("");
    fetch("/api/ai",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({messages:[{role:"user",content:buildPrompt()}],max_tokens:2000}),
    })
    .then(function(r){return r.json();})
    .then(function(data){
      if(!data||!data.ok){setError("AI is temporarily unavailable. Please try again later.");setLoading(false);return;}
      var txt=data.text;
      if(!txt){setError("Empty response. Please try again.");setLoading(false);return;}
      setPulse(txt);setLastFetch(timeStr);setLoading(false);
    })
    .catch(function(){setError("Network error. Please check your internet.");setLoading(false);});
  }

  function renderPulse(text){
    if(!text)return null;
    var lines=text.split(String.fromCharCode(10)).filter(function(l){return l.trim();});
    return lines.map(function(line,i){
      var clean=line.replace(/\*\*/g,"").replace(/^#+\s*/,"");
      var isH=/^[0-9]+\./.test(clean.trim())||(clean.length<60&&clean.toUpperCase()==clean&&clean.length>3);
      var isBullet=/^[-*]/.test(line.trim());
      if(isH)return <div key={i} style={{fontSize:12,fontWeight:800,color:GOLD,marginTop:14,marginBottom:5,paddingBottom:4,borderBottom:"1px solid rgba(245,158,11,0.2)"}}>{clean}</div>;
      if(isBullet)return <div key={i} style={{display:"flex",gap:6,marginBottom:4}}><span style={{color:G2,flexShrink:0}}>&#8226;</span><span style={{fontSize:11,color:T1,lineHeight:1.7}}>{clean.replace(/^[-*]\s*/,"")}</span></div>;
      return <div key={i} style={{fontSize:11,color:T1,lineHeight:1.8,marginBottom:2}}>{clean}</div>;
    });
  }


  var summary=MARKET_SUMMARY;
  var [selIdx,setSelIdx]=useState(null);

  if(selIdx) return <PulseIndexDetail idx={selIdx} onBack={function(){setSelIdx(null);}}/>;

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#050816,#0A1020)",padding:"14px 16px",borderBottom:"1px solid "+BD}}>

        {/* TITLE ROW - compact */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:15}} dangerouslySetInnerHTML={{__html:"&#129504;"}}/>
            <div>
              <div style={{fontSize:15,fontWeight:900,color:T1}}>Market <span style={{color:BLUE}}>Briefing</span></div>
              <div style={{fontSize:8.5,color:T2,marginTop:1}}>{dateStr}  {timeStr}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.04)",border:"1px solid "+BD,borderRadius:20,padding:"5px 11px"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:status.dot,animation:status.phase=="live"?"pulse-dot 1.4s infinite":"none",flexShrink:0}}></div>
            <span style={{fontSize:9,fontWeight:800,color:status.col}}>{status.label}</span>
          </div>
        </div>

        {/* MARKET SUMMARY SNAPSHOT - horizontal indices + breadth */}
        <div style={{background:"linear-gradient(135deg,#0A1A0F,#0B1224)",border:"1px solid rgba(0,200,83,0.18)",borderRadius:16,padding:"14px",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:11,fontWeight:800,color:T1}}>Indices</span>
            <span style={{fontSize:9,color:summary.sentimentPct>=50?G2:R,fontWeight:700}}>{summary.sentiment} {summary.sentimentPct}%</span>
          </div>
          <div style={{display:"flex",gap:9,overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:12}}>
            {INDICES.map(function(x){
              return (
                <div key={x.label} onClick={function(){setSelIdx(x);}} style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+(x.up?"rgba(0,230,118,0.2)":"rgba(239,68,68,0.2)"),borderRadius:12,padding:"11px 13px",minWidth:115,flexShrink:0,cursor:"pointer"}}>
                  <div style={{fontSize:8.5,color:T2,marginBottom:4,fontWeight:600}}>{x.label}</div>
                  <div style={{fontSize:16,fontWeight:800,color:T1,fontFamily:"monospace",marginBottom:3}}>{x.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:10,fontWeight:700,color:x.up?G2:R}}>{x.up?"+":""}{x.pct}%</span>
                    <span style={{fontSize:11,color:T3}}>&#8250;</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* breadth bar */}
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:9,color:G2,fontWeight:700}}>Adv {summary.advances}</span>
            <span style={{fontSize:9,color:R,fontWeight:700}}>Dec {summary.declines}</span>
          </div>
          <div style={{height:5,borderRadius:3,overflow:"hidden",display:"flex"}}>
            <div style={{width:(summary.advances/(summary.advances+summary.declines)*100)+"%",background:G2}}></div>
            <div style={{flex:1,background:R}}></div>
          </div>
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:5}}>
          {[["overview","Overview"],["global","Global"],["stocks","Stocks"],["ai","AI Analysis"]].map(function(t){
            var act=tab==t[0];
            return <button key={t[0]} onClick={function(){setTab2(t[0]);}} style={{flex:1,background:act?"rgba(37,99,235,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?BLUE:BD),borderRadius:8,padding:"6px 4px",color:act?BLUE:T2,fontSize:9,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t[1]}</button>;
          })}
        </div>
      </div>

      <div style={{padding:"12px 14px 0"}}>

        {error?<div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:12,padding:12,marginBottom:12}}><div style={{fontSize:11,color:R}}>{error}</div></div>:null}

        {/* OVERVIEW TAB */}
        {tab=="overview"?<PulseOverview/>:null}

        {/* GLOBAL TAB */}
        {tab=="global"?(
          <div>
            <div style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:14,padding:12,marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:BLUE,marginBottom:4}}>Overnight Global Summary</div>
              <div style={{fontSize:11,color:T1,lineHeight:1.7}}>US markets closed positive. Tech stocks led gains. FII buying expected to continue. Dollar index slightly down which is positive for emerging markets like India.</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {GLOBAL.map(function(g){
                return (
                  <div key={g.label} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"11px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <span style={{fontSize:9,color:T2,fontWeight:600}}>{g.label}</span>
                      <span style={{fontSize:9,fontWeight:700,color:g.col}}>{g.chg}</span>
                    </div>
                    <div style={{fontSize:14,fontWeight:800,color:T1,fontFamily:"monospace"}}>{g.val}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ):null}

        {/* STOCKS TAB */}
        {tab=="stocks"?(
          <div>
            <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:14,padding:12,marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:GOLD,marginBottom:4}}>Stocks to Watch Today</div>
              <div style={{fontSize:9,color:T2}}>Educational analysis only. Not buy/sell advice. Always do your own research.</div>
            </div>
            {STOCKS_WATCH.map(function(s){
              return (
                <div key={s.sym} style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:14,marginBottom:8,borderLeft:"3px solid "+s.color}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontSize:15,fontWeight:900,color:T1}}>{s.sym}</div>
                    <span style={{background:s.color+"22",color:s.color,borderRadius:20,padding:"2px 10px",fontSize:8,fontWeight:700}}>{s.type}</span>
                  </div>
                  <div style={{fontSize:11,color:T2,lineHeight:1.6}}>{s.reason}</div>
                </div>
              );
            })}
            <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:10,marginTop:4}}>
              <div style={{fontSize:8,color:theme.c.warn}}>These are educational observations only. Not SEBI registered advice.</div>
            </div>
          </div>
        ):null}

        {/* AI ANALYSIS TAB */}
        {tab=="ai"?(
          <div>
            {!pulse&&!loading?(
              <div style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:40,marginBottom:16}} dangerouslySetInnerHTML={{__html:"&#129302;"}}/>
                <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:8}}>AI Market Pulse</div>
                <div style={{fontSize:11,color:T2,lineHeight:1.8,marginBottom:20}}>Get complete AI analysis - overnight events, geopolitics, stocks to watch, options setup, market prediction - powered by Groq Llama 3.3</div>
                <button onClick={getPulse} style={{background:BLUE,border:"none",borderRadius:14,padding:"14px 30px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Get AI Pulse</button>
              </div>
            ):null}

            {loading?(
              <div style={{padding:"20px 0"}}>
                {[90,70,85,60,75].map(function(w,i){
                  return <div key={i} style={{background:"rgba(255,255,255,0.06)",borderRadius:6,height:12,width:w+"%",marginBottom:10}}></div>;
                })}
                <div style={{textAlign:"center",color:T2,fontSize:11,marginTop:10}}>AI analyzing markets...</div>
              </div>
            ):null}

            {pulse&&!loading?(
              <div>
                {lastFetch?<div style={{fontSize:8,color:T2,marginBottom:8}}>Last updated: {lastFetch}</div>:null}
                <div style={{background:CB,border:"1px solid rgba(0,200,83,0.15)",borderRadius:14,padding:14,marginBottom:10}}>
                  {renderPulse(pulse)}
                </div>
                <button onClick={getPulse} style={{width:"100%",background:"rgba(0,200,83,0.08)",border:"1px solid rgba(0,200,83,0.2)",borderRadius:12,padding:10,color:G2,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Refresh Analysis</button>
              </div>
            ):null}
          </div>
        ):null}

      </div>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}"}</style>
    </div>
  );
        }
