import { useState, useEffect } from "react";
import IndexDetail from "./IndexDetail";
import { MiniChart, genSpark, INDICES, LARGECAP, MIDCAP, SECTORS, getSession } from "./HomeData";
import HomeBottom from "./HomeBottom";
import MorningPulse from "./MorningPulse";
import { MarketHeatmapCard, LiveNewsCards, AIBriefingCard } from "../components/HomeNewsHeatmap";
import { TrendingStocksCard, TopBreakoutsCard, AITradeSetupCard, SmartAlertsCard, AINewsSummaryCard, QuickActionBtn, SectorCard, StreakToast, QUICK_ACTIONS } from "../components/HomeExtras";
import { useVoiceAlerts } from "../hooks/useVoiceAlerts";
import { useStreak } from "../hooks/useStreak";

var BG="#050505",CARD="#101318",BD="rgba(255,255,255,0.07)";
var BLUE="#3B82F6",CYAN="#60A5FA",PROBLUE="#4DA6FF";
var UP="#22C55E",DOWN="#EF4444";
var T1="#FFFFFF",T2="#9CA3AF",T3="#5B6472";
var CARDBORDER="rgba(77,166,255,0.3)";

export default function EquityHome(props){
  var setTab=props.setTab||function(){};
  var isPrem=props.isPrem||false;
  var [sess,setSess]=useState(getSession());
  var [indices,setIndices]=useState(function(){return INDICES.map(function(x){return Object.assign({},x,{ltp:x.base,spark:genSpark(x.base)});});});
  var [selIdx,setSelIdx]=useState(null);
  var [mood,setMood]=useState({bull:72,fg:"Greed",conf:87});
  var [showBriefing,setShowBriefing]=useState(false);
  var VOICE_SYMBOLS=LARGECAP.concat(MIDCAP).map(function(s){return s.sym;});
  var voiceAlerts=useVoiceAlerts(VOICE_SYMBOLS,true);
  var streakData=useStreak();
  var isEvening=new Date().getHours()>=16;

  useEffect(function(){
    var t=setInterval(function(){
      setSess(getSession());
      setIndices(function(prev){return prev.map(function(idx){var chg=(Math.random()-0.48)*idx.ltp*0.0005;var nl=parseFloat((idx.ltp+chg).toFixed(2));return Object.assign({},idx,{ltp:nl,spark:idx.spark.slice(-19).concat([nl])});});});
      setMood(function(p){return{bull:Math.max(40,Math.min(85,p.bull+(Math.random()-0.5)*4)),fg:p.bull>60?"Greed":"Fear",conf:Math.floor(75+Math.random()*15)};});
    },3000);
    return function(){clearInterval(t);};
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

      {/* HEADER — Moneycontrol style */}
      <div style={{background:CARD,borderBottom:"1px solid "+BD,padding:"12px 16px"}}>

        {/* Row 1: Logo + Name | Alerts + Profile */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#1E3A8A,#1D4ED8)",border:"1px solid "+CARDBORDER,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="10" width="4" height="10" rx="1" fill={CYAN}/>
                <rect x="8" y="6" width="4" height="14" rx="1" fill="#fff"/>
                <rect x="14" y="3" width="4" height="17" rx="1" fill={CYAN}/>
                <rect x="20" y="7" width="4" height="13" rx="1" fill="#fff"/>
              </svg>
            </div>
            <div style={{fontSize:19,fontWeight:900,letterSpacing:-0.3}}>
              <span style={{color:T1}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",padding:4,cursor:"pointer",position:"relative"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <div style={{position:"absolute",top:2,right:2,width:6,height:6,borderRadius:"50%",background:DOWN,border:"1.5px solid "+CARD}}/>
            </button>
            <button onClick={function(){setTab("profile");}} style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,"+BLUE+",#6366F1)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <span style={{fontSize:13}}>&#128100;</span>
            </button>
          </div>
        </div>

        {/* Row 2: Full-width search bar */}
        <div onClick={function(){setTab("search");}} style={{display:"flex",alignItems:"center",gap:9,background:BG,border:"1px solid rgba(255,255,255,0.09)",borderRadius:10,padding:"10px 14px",cursor:"pointer"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span style={{fontSize:13,color:T3,flex:1}}>Search stocks, indices, news...</span>
        </div>
      </div>

      {/* AI BRIEFING */}
      <div style={{padding:"6px 18px 0"}}>
        {streakData.isNewDay&&<StreakToast streak={streakData.streak}/>}
        <AIBriefingCard setShowMorningPulse={setShowBriefing} pulseInfo={{label:"AI Market Briefing"}} mood={mood}/>
      </div>

      {/* UPGRADE BANNER */}
      {!isPrem&&(
        <div style={{padding:"10px 18px"}}>
          <div onClick={function(){setTab("sub");}} style={{background:"linear-gradient(90deg,rgba(29,78,216,0.4),rgba(124,58,237,0.3))",border:"1px solid rgba(99,102,241,0.4)",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
            <span style={{fontSize:16}}>&#9889;</span>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:800,color:T1}}>Unlock AI Trade Signals &amp; More</div>
              <div style={{fontSize:9,color:"#A5B4FC",marginTop:1}}>Premium — real-time alerts, AI setups, unlimited scans</div>
            </div>
            <div style={{background:"rgba(255,255,255,0.15)",borderRadius:8,padding:"5px 10px",flexShrink:0}}>
              <span style={{fontSize:9,fontWeight:800,color:T1}}>Upgrade</span>
            </div>
          </div>
        </div>
      )}

      {/* INDEX CARDS */}
      <div style={{padding:"6px 0 16px"}}>
        <div style={{display:"flex",gap:11,overflowX:"auto",padding:"0 18px 4px",WebkitOverflowScrolling:"touch"}}>
          {indices.map(function(idx){
            return (
              <div key={idx.label} onClick={function(){setSelIdx(idx);}} style={{background:CARD,border:"1px solid "+CARDBORDER,borderRadius:18,padding:"14px",flexShrink:0,minWidth:148,cursor:"pointer",boxShadow:"0 0 16px rgba(77,166,255,0.06)"}}>
                <div style={{fontSize:10,fontWeight:700,color:T3,marginBottom:6}}>{idx.label}</div>
                <div style={{fontSize:19,fontWeight:900,color:T1,fontFamily:"monospace",marginBottom:5,letterSpacing:-0.3}}>{idx.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:700,color:idx.up?UP:DOWN}}>{idx.up?"+":""}{idx.pct}%</span>
                  <MiniChart d={idx.spark} col={idx.up?UP:DOWN} w={46} h={22}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TRENDING STOCKS */}
      <div style={{padding:"0 18px"}}>
        <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:10}}>&#128293; Trending Stocks</div>
        <TrendingStocksCard setTab={setTab} stocks={LARGECAP.concat(MIDCAP)}/>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{padding:"0 18px 16px"}}>
        <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:10}}>Quick Actions</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {QUICK_ACTIONS.map(function(a){
            return <QuickActionBtn key={a.id} icon={a.icon} label={a.label} col={a.col} onClick={function(){setTab(a.id=="gainers"||a.id=="losers"?"markets":a.id);}}/>;
          })}
        </div>
      </div>

      <div style={{padding:"0 18px"}}>
        <AITradeSetupCard setTab={setTab}/>

        <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:10}}>&#9889; Top Breakouts</div>
        <TopBreakoutsCard setTab={setTab}/>

        <SmartAlertsCard setTab={setTab}/>

        <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:10}}>Sector Performance</div>
        <div style={{display:"flex",gap:9,overflowX:"auto",marginBottom:16,WebkitOverflowScrolling:"touch"}}>
          {["IT","Banking","Pharma","Auto","FMCG"].map(function(name){
            var s=SECTORS.find(function(x){return x.name==name;});
            if(!s)return null;
            return <SectorCard key={s.name} s={s} label={name=="Banking"?"Nifty Bank":"Nifty "+name} onClick={function(){setTab("markets");}}/>;
          })}
        </div>

        <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:10}}>Market Heatmap</div>
        <MarketHeatmapCard setTab={setTab} stocks={LARGECAP.concat(MIDCAP)}/>

        {isEvening&&(
          <div onClick={function(){setTab("marketclose");}} style={{background:"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(59,130,246,0.06))",border:"1px solid "+BD,borderRadius:16,padding:"13px 16px",marginBottom:16,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:20}}>&#127769;</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:800,color:T1}}>Market Close Summary</div>
              <div style={{fontSize:9,color:T3,marginTop:2}}>Today's recap before you go</div>
            </div>
            <span style={{fontSize:14,color:T3}}>&#8250;</span>
          </div>
        )}

        <AINewsSummaryCard/>

        <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:10}}>Live News</div>
        <LiveNewsCards setTab={setTab}/>

        <HomeBottom setTab={setTab}/>
      </div>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}"}</style>
    </div>
  );
}
