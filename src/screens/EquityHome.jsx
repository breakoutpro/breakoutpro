import { useState, useEffect } from "react";
import IndexDetail from "./IndexDetail";
import { MiniChart, genSpark, INDICES, LARGECAP, MIDCAP, SECTORS, getSession } from "./HomeData";
import HomeBottom from "./HomeBottom";
import MorningPulse from "./MorningPulse";
import { MarketHeatmapCard, LiveNewsCards, AIBriefingCard } from "../components/HomeNewsHeatmap";
import { TrendingStocksCard, TopBreakoutsCard, AITradeSetupCard, SmartAlertsCard, AINewsSummaryCard, QuickActionBtn, SectorCard, StreakToast, QUICK_ACTIONS } from "../components/HomeExtras";
import { useVoiceAlerts } from "../hooks/useVoiceAlerts";
import { useStreak } from "../hooks/useStreak";

var BG="#050505", CARD="#101318", BD="rgba(255,255,255,0.07)";
var BLUE="#3B82F6", CYAN="#60A5FA", PROBLUE="#4DA6FF";
var UP="#22C55E", DOWN="#EF4444", GOLD="#F59E0B";
var T1="#FFFFFF", T2="#9CA3AF", T3="#5B6472";
var CARDBORDER="rgba(77,166,255,0.3)";

// Modern outline SVG icons for Quick Actions
export default function EquityHome(props){
  var setTab=props.setTab||function(){};
  var isPrem=props.isPrem||false;
  var [sess,setSess]=useState(getSession());
  var [indices,setIndices]=useState(function(){
    return INDICES.map(function(x){return Object.assign({},x,{ltp:x.base,spark:genSpark(x.base)});});
  });
  var [selIdx,setSelIdx]=useState(null);
  var [mood,setMood]=useState({bull:72,fg:"Greed",conf:87});
  var [showBriefing,setShowBriefing]=useState(false);
  var [tickerIdx,setTickerIdx]=useState(0);

  var VOICE_SYMBOLS=LARGECAP.concat(MIDCAP).map(function(s){return s.sym;});
  var voiceAlerts=useVoiceAlerts(VOICE_SYMBOLS,true);
  var streakData=useStreak();
  var isEvening=new Date().getHours()>=16;

  var TICKER=["NIFTY testing 24,050 resistance","Banking sector leads rally today","FII net buyers for 8th session","IT stocks outperform on Q4 beats"];

  useEffect(function(){
    var t=setInterval(function(){
      setSess(getSession());
      setIndices(function(prev){return prev.map(function(idx){var chg=(Math.random()-0.48)*idx.ltp*0.0005;var nl=parseFloat((idx.ltp+chg).toFixed(2));return Object.assign({},idx,{ltp:nl,spark:idx.spark.slice(-19).concat([nl])});});});
      setMood(function(p){return{bull:Math.max(40,Math.min(85,p.bull+(Math.random()-0.5)*4)),fg:p.bull>60?"Greed":"Fear",conf:Math.floor(75+Math.random()*15)};});
    },3000);
    var tk=setInterval(function(){setTickerIdx(function(i){return (i+1)%TICKER.length;});},4000);
    return function(){clearInterval(t);clearInterval(tk);};
  },[]);

  if(selIdx) return <IndexDetail idx={selIdx} onBack={function(){setSelIdx(null);}} setTab={setTab}/>;
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

      {/* ===== HEADER ===== */}
      <div style={{padding:"16px 16px 10px"}}>

        {/* Row 1: Logo + Name + Tagline + Profile Avatar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#1E3A8A,#1D4ED8)",border:"1px solid rgba(77,166,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:12,fontWeight:900,color:"#fff",letterSpacing:-0.5}}>BP</span>
            </div>
            <div>
              <div>
              <div style={{fontSize:22,fontWeight:900,letterSpacing:-0.5,lineHeight:1}}>
                <span style={{color:"#FFFFFF"}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span>
              </div>
              <div style={{fontSize:9,color:T3,fontWeight:600,letterSpacing:1.4,marginTop:3}}>CATCH EVERY BREAKOUT</div>
            </div>
          </div>
          <button onClick={function(){setTab("profile");}} style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,"+BLUE+",#6366F1)",border:"2px solid rgba(77,166,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
            <span style={{fontSize:15}}>&#128100;</span>
          </button>
        </div>

        {/* Row 2: Compact search bar */}
        <div onClick={function(){setTab("search");}} style={{display:"flex",alignItems:"center",gap:8,background:"#111318",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"9px 14px",cursor:"pointer",marginBottom:10}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6472" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span style={{fontSize:12,color:T3,flex:1}}>Search stocks, indices, news...</span>
        </div>

        {/* Row 3: Live Ticker */}
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:UP,boxShadow:"0 0 5px "+UP,flexShrink:0,animation:"pulse-dot 1.5s infinite"}}/>
          <span key={tickerIdx} style={{fontSize:9.5,color:T2,fontWeight:500,animation:"ticker-fade 0.4s ease"}}>{TICKER[tickerIdx]}</span>
        </div>
      </div>

      {/* ===== AI MARKET BRIEFING (compact) ===== */}
      <div style={{padding:"10px 18px 0"}}>
        {streakData.isNewDay&&<StreakToast streak={streakData.streak}/>}
        <AIBriefingCard setShowMorningPulse={setShowBriefing} pulseInfo={{label:"AI Market Briefing"}} mood={mood}/>
      </div>

      {/* ===== UPGRADE BANNER (hidden for premium users) ===== */}
      {!isPrem&&(
      <div style={{padding:"10px 18px"}}>
        <div onClick={function(){setTab("sub");}} style={{background:"linear-gradient(90deg,rgba(29,78,216,0.4),rgba(124,58,237,0.3))",border:"1px solid rgba(99,102,241,0.4)",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
          <span style={{fontSize:16}}>&#9889;</span>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:800,color:"#fff"}}>Unlock AI Trade Signals &amp; More</div>
            <div style={{fontSize:9,color:"#A5B4FC",marginTop:1}}>Upgrade to Premium — real-time alerts, AI setups, unlimited scans</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.15)",borderRadius:8,padding:"5px 10px",flexShrink:0}}>
            <span style={{fontSize:9,fontWeight:800,color:"#fff"}}>Upgrade</span>
          </div>
        </div>
      </div>
      )}

      {/* ===== INDEX CARDS (larger) ===== */}
      <div style={{padding:"0 0 18px"}}>
        <div style={{display:"flex",gap:11,overflowX:"auto",padding:"0 18px 4px",WebkitOverflowScrolling:"touch"}}>
          {indices.map(function(idx){
            return (
              <div key={idx.label} onClick={function(){setSelIdx(idx);}} style={{
                background:CARD,border:"1px solid "+CARDBORDER,borderRadius:18,padding:"16px",
                flexShrink:0,minWidth:152,cursor:"pointer",position:"relative",overflow:"hidden",
                boxShadow:"0 0 16px rgba(77,166,255,0.08)",
              }}>
                <div style={{fontSize:11,fontWeight:700,color:T3,marginBottom:7,letterSpacing:0.2}}>{idx.label}</div>
                <div style={{fontSize:20,fontWeight:900,color:T1,fontFamily:"monospace",marginBottom:6,letterSpacing:-0.4}}>{idx.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:700,color:idx.up?UP:DOWN}}>{idx.up?"+":""}{idx.pct}%</span>
                  <MiniChart d={idx.spark} col={idx.up?UP:DOWN} w={50} h={24}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== TRENDING STOCKS ===== */}
      <div style={{padding:"0 18px"}}>
        <div style={{fontSize:15,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:11}}>&#128293; Trending Stocks</div>
        <TrendingStocksCard setTab={setTab} stocks={LARGECAP.concat(MIDCAP)}/>
      </div>

      {/* ===== QUICK ACTIONS (modern outline icons) ===== */}
      <div style={{padding:"0 18px 18px"}}>
        <div style={{marginBottom:11}}>
          <span style={{fontSize:15,fontWeight:800,color:T1,letterSpacing:0.2}}>Quick Actions</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {QUICK_ACTIONS.map(function(a){
            return <QuickActionBtn key={a.id} icon={a.icon} label={a.label} col={a.col} onClick={function(){setTab(a.id=="gainers"||a.id=="losers"?"markets":a.id);}}/>;
          })}
        </div>
      </div>

      <div style={{padding:"0 18px"}}>

        {/* ===== AI TRADE SETUP ===== */}
        <AITradeSetupCard setTab={setTab}/>

        {/* ===== TOP BREAKOUTS ===== */}
        <div style={{fontSize:15,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:11}}>&#9889; Top Breakouts</div>
        <TopBreakoutsCard setTab={setTab}/>

        {/* ===== SMART ALERTS ===== */}
        <SmartAlertsCard setTab={setTab}/>

        {/* ===== SECTOR PERFORMANCE (with mini chart + arrow) ===== */}
        <div style={{fontSize:15,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:11}}>Sector Performance</div>
        <div style={{display:"flex",gap:9,overflowX:"auto",marginBottom:18,paddingBottom:2,WebkitOverflowScrolling:"touch"}}>
          {["IT","Banking","Pharma","Auto","FMCG"].map(function(name){
            var s=SECTORS.find(function(x){return x.name==name;});
            if(!s)return null;
            var label=name=="Banking"?"Nifty Bank":"Nifty "+name;
            return <SectorCard key={s.name} s={s} label={label} onClick={function(){setTab("markets");}}/>;
          })}
        </div>

        {/* ===== MARKET HEATMAP (full-width) ===== */}
        <div style={{fontSize:15,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:11}}>Market Heatmap</div>
        <MarketHeatmapCard setTab={setTab} stocks={LARGECAP.concat(MIDCAP)}/>

        {/* ===== AI NEWS SUMMARY ===== */}
        <AINewsSummaryCard/>

        {/* ===== MARKET CLOSE SUMMARY (evening only) ===== */}
        {isEvening&&(
          <div onClick={function(){setTab("marketclose");}} style={{background:"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(59,130,246,0.06))",border:"1px solid "+BD,borderRadius:18,padding:"14px 16px",marginBottom:18,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:22}}>&#127769;</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12.5,fontWeight:800,color:T1}}>Market Close Summary</div>
              <div style={{fontSize:9,color:T3,marginTop:2}}>See today's recap before you go</div>
            </div>
            <span style={{fontSize:14,color:T3}}>&#8250;</span>
          </div>
        )}

        {/* ===== LIVE NEWS ===== */}
        <div style={{fontSize:15,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:11}}>Live News</div>
        <LiveNewsCards setTab={setTab}/>

        <HomeBottom setTab={setTab}/>
      </div>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}"}</style>
    </div>
  );
}
