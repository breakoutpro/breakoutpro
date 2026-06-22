import { useState, useEffect } from "react";
import IndexDetail from "./IndexDetail";
import { MiniChart, genSpark, INDICES, LARGECAP, MIDCAP, SECTORS, getSession } from "./HomeData";
import HomeBottom from "./HomeBottom";
import MorningPulse from "./MorningPulse";
import { MarketHeatmapCard, LiveNewsCards, AIBriefingCard } from "../components/HomeNewsHeatmap";
import { TrendingStocksCard, TopBreakoutsCard, AITradeSetupCard, SmartAlertsCard, ExploreShortcuts, AINewsSummaryCard, QuickActionBtn, SectorCard, StreakToast } from "../components/HomeExtras";
import { useVoiceAlerts } from "../hooks/useVoiceAlerts";
import { useStreak } from "../hooks/useStreak";

var BG="#050505", CARD="#101318", BD="rgba(255,255,255,0.07)";
var BLUE="#3B82F6", CYAN="#60A5FA", PROBLUE="#4DA6FF";
var UP="#22C55E", DOWN="#EF4444", GOLD="#F59E0B";
var T1="#FFFFFF", T2="#9CA3AF", T3="#5B6472";
var CARDBORDER="rgba(77,166,255,0.3)";

// Modern outline SVG icons for Quick Actions
var ICONS={
  gainers:"<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='23 6 13.5 15.5 8.5 10.5 1 18'/><polyline points='17 6 23 6 23 12'/></svg>",
  losers:"<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='23 18 13.5 8.5 8.5 13.5 1 6'/><polyline points='17 18 23 18 23 12'/></svg>",
  sectors:"<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='3' width='7' height='7' rx='1.5'/><rect x='14' y='3' width='7' height='7' rx='1.5'/><rect x='3' y='14' width='7' height='7' rx='1.5'/><rect x='14' y='14' width='7' height='7' rx='1.5'/></svg>",
  global:"<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='9'/><line x1='3' y1='12' x2='21' y2='12'/><path d='M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z'/></svg>",
  heatmap:"<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='3' width='8' height='8' rx='1.5'/><rect x='13' y='3' width='8' height='5' rx='1.5'/><rect x='13' y='10' width='8' height='11' rx='1.5'/><rect x='3' y='13' width='8' height='8' rx='1.5'/></svg>",
};

var QUICK_ACTIONS=[
  {label:"Gainers", id:"gainers", icon:ICONS.gainers, col:UP},
  {label:"Losers",  id:"losers",  icon:ICONS.losers,  col:DOWN},
  {label:"Sectors", id:"markets", icon:ICONS.sectors, col:CYAN},
  {label:"Global",  id:"global",  icon:ICONS.global,  col:CYAN},
  {label:"Heatmap", id:"heatmap", icon:ICONS.heatmap, col:"url(#heatGrad)"},
];

export default function EquityHome(props){
  var setTab=props.setTab||function(){};
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
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          {/* Left: Logo + Title */}
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <div style={{width:36,height:36,borderRadius:10,background:CARD,border:"1px solid "+BD,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="22" height="22" viewBox="0 0 28 24" fill="none">
                <line x1="3" y1="14" x2="3" y2="22" stroke={CYAN} strokeWidth="1.4"/>
                <rect x="1.3" y="14" width="3.4" height="5" rx="0.6" fill={CYAN}/>
                <line x1="8" y1="11" x2="8" y2="21" stroke="#fff" strokeWidth="1.4"/>
                <rect x="6.3" y="13" width="3.4" height="5" rx="0.6" fill="#fff"/>
                <line x1="13" y1="9" x2="13" y2="19" stroke={CYAN} strokeWidth="1.4"/>
                <rect x="11.3" y="11" width="3.4" height="5" rx="0.6" fill={CYAN}/>
                <line x1="18" y1="6" x2="18" y2="17" stroke="#fff" strokeWidth="1.4"/>
                <rect x="16.3" y="8" width="3.4" height="5" rx="0.6" fill="none" stroke="#fff" strokeWidth="1.2"/>
                <line x1="23" y1="3" x2="23" y2="14" stroke={CYAN} strokeWidth="1.4"/>
                <rect x="21.3" y="5" width="3.4" height="5" rx="0.6" fill={CYAN}/>
                <path d="M2 9L9 4L14 7L24 0" stroke={UP} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M19 0L24 0L24 5" stroke={UP} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <div style={{fontSize:18,fontWeight:800,letterSpacing:-0.3,whiteSpace:"nowrap"}}><span style={{color:"#FFFFFF"}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span></div>
          </div>
          {/* Right: Search bar + EN pill */}
          <div style={{display:"flex",alignItems:"center",gap:7,flex:1,minWidth:0}}>
            <div style={{flex:1,display:"flex",alignItems:"center",background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"0 12px",height:38,gap:7,minWidth:0}}>
              <span style={{fontSize:13,color:T3,flexShrink:0}}>&#128269;</span>
              <input placeholder="Search stocks, indices, news..." style={{background:"none",border:"none",outline:"none",color:T1,fontSize:11,fontFamily:"inherit",flex:1,minWidth:0}} onClick={function(){setTab("markets");}}/>
            </div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"0 9px",height:38,display:"flex",alignItems:"center",gap:4,flexShrink:0,cursor:"pointer"}}>
              <span style={{fontSize:11,color:T3}}>&#127760;</span>
              <span style={{fontSize:10,fontWeight:700,color:T2}}>EN</span>
            </div>
          </div>
        </div>

        {/* ===== LIVE TICKER ===== */}
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:UP,boxShadow:"0 0 6px "+UP,flexShrink:0,animation:"pulse-dot 1.5s infinite"}}/>
          <span key={tickerIdx} style={{fontSize:10,color:T2,fontWeight:500,animation:"ticker-fade 0.4s ease"}}>{TICKER[tickerIdx]}</span>
        </div>
      </div>

      {/* ===== AI MARKET BRIEFING (compact) ===== */}
      <div style={{padding:"10px 18px 16px"}}>
        {streakData.isNewDay&&<StreakToast streak={streakData.streak}/>}
        <AIBriefingCard setShowMorningPulse={setShowBriefing} pulseInfo={{label:"AI Market Briefing"}} mood={mood}/>
      </div>

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

        {/* ===== EXPLORE: LEARN + AI ASSISTANT ===== */}
        <div style={{fontSize:15,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:11}}>Explore</div>
        <ExploreShortcuts setTab={setTab}/>

        <HomeBottom setTab={setTab}/>
      </div>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}"}</style>
    </div>
  );
}
