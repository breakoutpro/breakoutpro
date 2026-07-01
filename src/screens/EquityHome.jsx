import { useState, useEffect } from "react";
import { t } from "../i18n/translations";
import HomeLearnCards from "./HomeLearnCards";
import LearnTopicPage from "./LearnTopicPage";
import IndexFullPage from "./IndexFullPage";
import { MiniChart, genSpark, INDICES, getSession } from "./HomeData";
import MorningPulse from "./MorningPulse";
import { useStreak } from "../hooks/useStreak";
import HomeGuardianCard from "./HomeGuardianCard";
import MarketMoodCard from "./MarketMoodCard";
import HomeMarketIntel from "./HomeMarketIntel";
import OptionsIntel from "./OptionsIntel";
import OptionsIntelPage from "./OptionsIntelPage";
import HomeQuickTools from "./HomeQuickTools";
import ArticlePage from "./ArticlePage";
import { JUSTIN } from "./JustInData";

var BG="#000000",CARD="#101318",BD="#1B2330";
var BLUE="#3B82F6",CYAN="#60A5FA",PROBLUE="#60A5FA";
var UP="#22C55E",DOWN="#EF4444",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";
var CARDBORDER="#1B2330";

var TICKER=JUSTIN.map(function(n){return n.headline;});

export default function EquityHome(props){
  var setTab=props.setTab||function(){};
  var isPrem=props.isPrem||false;
  var [sess,setSess]=useState(getSession());
  var [indices,setIndices]=useState(function(){var keep=["NIFTY 50","BANK NIFTY","SENSEX","MIDCAP 50"];return INDICES.filter(function(x){return keep.indexOf(x.label)!=-1;}).map(function(x){return Object.assign({},x,{ltp:x.base,spark:genSpark(x.base)});});});
  var [selIdx,setSelIdx]=useState(null);
  var [mood,setMood]=useState({bull:72,fg:68,conf:82,trend:"Up"});
  var [showBriefing,setShowBriefing]=useState(false);
  var [tickerIdx,setTickerIdx]=useState(0);
  var [selArticle,setSelArticle]=useState(null);
  var [showOptions,setShowOptions]=useState(false);
  var [learnTopic,setLearnTopic]=useState(null);
  var streakData=useStreak();
  var isEvening=new Date().getHours()>=16;

  useEffect(function(){
    var t=setInterval(function(){
      setSess(getSession());
      setIndices(function(prev){return prev.map(function(idx){var chg=(Math.random()-0.48)*idx.ltp*0.0005;var nl=parseFloat((idx.ltp+chg).toFixed(2));return Object.assign({},idx,{ltp:nl,spark:idx.spark.slice(-19).concat([nl])});});});
      setMood(function(p){return{bull:Math.max(40,Math.min(85,p.bull+(Math.random()-0.5)*4)),fg:Math.floor(60+Math.random()*20),conf:Math.floor(75+Math.random()*15),trend:"Up"};});
    },3000);
    var tk=setInterval(function(){setTickerIdx(function(i){return (i+1)%TICKER.length;});},10000);
    return function(){clearInterval(t);clearInterval(tk);};
  },[]);

  if(selIdx) return <IndexFullPage idx={selIdx} onBack={function(){setSelIdx(null);}} setTab={setTab}/>;
  if(showOptions) return <OptionsIntelPage symbol="NIFTY" onBack={function(){setShowOptions(false);}}/>;
  if(learnTopic) return <LearnTopicPage id={learnTopic} setTab={setTab} onBack={function(){setLearnTopic(null);}}/>;
  if(selArticle) return (
    <ArticlePage
      article={selArticle}
      onBack={function(){setSelArticle(null);}}
      onOpen={function(n){setSelArticle(n);}}
      setTab={setTab}
    />
  );
  if(showBriefing) return (
    <div style={{background:BG,minHeight:"100vh"}}>
      <div style={{padding:"14px 16px 0"}}>
        <button onClick={function(){setShowBriefing(false);}} style={{background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,width:34,height:34,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
      </div>
      <MorningPulse setTab={setTab}/>
    </div>
  );

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:84,color:T1}}>

      {/* HEADER */}
      <div style={{background:BG,borderBottom:"1px solid "+BD,padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={function(){ if(props.onMenu){props.onMenu();} else {setTab("more");} }} style={{background:"none",border:"none",padding:4,cursor:"pointer",flexShrink:0}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div style={{fontSize:22,fontWeight:900,letterSpacing:-0.5}}>
              <span style={{color:T1}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
            <button onClick={function(){setTab("search");}} style={{background:"none",border:"none",padding:3,cursor:"pointer"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <button onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",padding:3,cursor:"pointer",position:"relative"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <div style={{position:"absolute",top:1,right:1,width:5,height:5,borderRadius:"50%",background:GOLD,border:"1px solid "+BG}}/>
            </button>
            <button onClick={function(){setTab("profile");}} style={{background:"none",border:"none",padding:3,cursor:"pointer"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* JUST IN - Moneycontrol style red ticker, 10s auto rotate, tap to full article */}
      <div onClick={function(){setSelArticle(JUSTIN[tickerIdx]);}} style={{background:"#0B0E13",borderBottom:"1px solid "+BD,display:"flex",alignItems:"stretch",overflow:"hidden",cursor:"pointer"}}>
        <div style={{background:"#EF4444",padding:"5px 8px",display:"flex",alignItems:"center",flexShrink:0}}>
          <span style={{width:4,height:4,borderRadius:"50%",background:"#fff",marginRight:5,animation:"pulse-dot 1.4s infinite"}}/>
          <span style={{fontSize:8,fontWeight:800,color:"#fff",letterSpacing:0.6,whiteSpace:"nowrap"}}>JUST IN</span>
        </div>
        <div style={{flex:1,display:"flex",alignItems:"center",padding:"6px 11px",minWidth:0}}>
          <span key={tickerIdx} style={{fontSize:10.5,color:"#E8EAED",fontWeight:600,lineHeight:1.35,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",animation:"ticker-fade 0.4s ease"}}>{TICKER[tickerIdx]}</span>
        </div>
        <span style={{fontSize:12,color:T3,display:"flex",alignItems:"center",paddingRight:10,flexShrink:0}}>&#8250;</span>
      </div>

      {/* TODAY'S GAME PLAN - 30 second market mood */}
      <MarketMoodCard setTab={setTab}/>

      {/* MARKET DASHBOARD - index cards scroll */}
      <div style={{padding:"12px 0 0"}}>
        <div style={{display:"flex",gap:10,overflowX:"auto",padding:"0 14px 4px",WebkitOverflowScrolling:"touch"}}>
          {indices.map(function(idx){return(
            <div key={idx.label} onClick={function(){setSelIdx(idx);}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"12px",flexShrink:0,minWidth:120,cursor:"pointer"}}>
              <div style={{fontSize:10,color:T2,marginBottom:5,fontWeight:600}}>{idx.label}</div>
              <div style={{fontSize:16,fontWeight:800,color:T1,fontFamily:"monospace",marginBottom:4}}>{idx.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,fontWeight:700,color:idx.up?UP:DOWN}}>{idx.up?"+":""}{idx.pct}%</span>
                <MiniChart d={idx.spark} col={idx.up?UP:DOWN} w={40} h={18}/>
              </div>
            </div>
          );})}
        </div>
      </div>

      {/* PATTERN ALERTS - educational detection only */}
      <div style={{marginTop:4}}>
        <HomeGuardianCard setTab={setTab}/>
      </div>

      {/* MARKET INTELLIGENCE - merged FII/DII + breadth + sector + global */}
      <div style={{marginTop:18}}>
        <HomeMarketIntel setTab={setTab}/>
      </div>

      {/* OPTIONS INTELLIGENCE - hero premium feature */}
      <div style={{marginTop:18}}>
        <OptionsIntel symbol="NIFTY" onOpen={function(){setShowOptions(true);}}/>
      </div>

      {/* LEARN AND INVEST */}
      <div style={{marginTop:18}}>
        <HomeLearnCards setTab={setTab} onTopic={function(id){setLearnTopic(id);}}/>
      </div>

      {/* LIVE MARKET NEWS - top 5 clean cards */}
      <div style={{marginTop:18,padding:"0 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <span style={{fontSize:14,fontWeight:800,color:T1}}>{t("top_news")}</span>
          <button onClick={function(){setTab("news");}} style={{background:"none",border:"none",color:CYAN,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View All &#8594;</button>
        </div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,overflow:"hidden"}}>
          {JUSTIN.slice(0,5).map(function(n,i){
            var ic=n.impact=="Bullish"?UP:n.impact=="Bearish"?DOWN:T2;
            return (
              <div key={n.id} onClick={function(){setSelArticle(n);}} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 13px",borderBottom:i<4?"1px solid "+BD:"none",cursor:"pointer"}}>
                <div style={{width:3,height:34,background:ic,borderRadius:2,flexShrink:0,opacity:0.8}}></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:600,color:T1,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{n.headline}</div>
                  <div style={{fontSize:8.5,color:T3,marginTop:3}}>{n.source}  &#8226;  {n.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK TOOLS */}
      <div style={{marginTop:18}}>
        <HomeQuickTools setTab={setTab}/>
      </div>

      <div style={{height:24}}></div>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0}to{opacity:1}}"}</style>
    </div>
  );
}
