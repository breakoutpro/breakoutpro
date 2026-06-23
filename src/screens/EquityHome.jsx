import { useState, useEffect } from "react";
import IndexDetail from "./IndexDetail";
import { MiniChart, genSpark, INDICES, LARGECAP, MIDCAP, SECTORS, GAINERS, LOSERS, GLOBAL, getSession } from "./HomeData";
import HomeBottom from "./HomeBottom";
import MorningPulse from "./MorningPulse";
import { AIBriefingCard } from "../components/HomeNewsHeatmap";
import { useVoiceAlerts } from "../hooks/useVoiceAlerts";
import { useStreak } from "../hooks/useStreak";
import HomeLower from "../components/HomeLower";

var BG="#050505",CARD="#101318",BD="#1B2330";
var BLUE="#3B82F6",CYAN="#60A5FA",PROBLUE="#60A5FA";
var UP="#22C55E",DOWN="#EF4444",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";
var CARDBORDER="#1B2330";

var ALERT_CARDS=[
  {type:"Breakout Alert",sym:"RELIANCE",time:"9:42 AM",col:UP},
  {type:"Doji Pattern",sym:"NIFTY50",time:"9:51 AM",col:T2},
  {type:"Volume Spike",sym:"TATASTEEL",time:"10:03 AM",col:UP},
  {type:"All Time High",sym:"TCS",time:"10:11 AM",col:UP},
  {type:"OI Build-up",sym:"BANKNIFTY",time:"10:18 AM",col:T2},
];

var TICKER=[
  "FII Net Buyers \u20B93,245 Cr today \u2014 Bullish signal",
  "Nifty testing resistance at 24,050 \u2014 Watch closely",
  "BankNifty breakout above 52,500 \u2014 Strength continues",
  "India VIX at 13.4 \u2014 Low volatility zone",
  "IT sector outperforms on strong Q4 earnings",
];

export default function EquityHome(props){
  var setTab=props.setTab||function(){};
  var isPrem=props.isPrem||false;
  var [sess,setSess]=useState(getSession());
  var [indices,setIndices]=useState(function(){return INDICES.map(function(x){return Object.assign({},x,{ltp:x.base,spark:genSpark(x.base)});});});
  var [selIdx,setSelIdx]=useState(null);
  var [mood,setMood]=useState({bull:72,fg:68,conf:82,trend:"Up"});
  var [showBriefing,setShowBriefing]=useState(false);
  var [tickerIdx,setTickerIdx]=useState(0);
  var VOICE_SYMBOLS=LARGECAP.concat(MIDCAP).map(function(s){return s.sym;});
  var voiceAlerts=useVoiceAlerts(VOICE_SYMBOLS,true);
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

      {/* HEADER */}
      <div style={{background:BG,borderBottom:"1px solid "+BD,padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={function(){setTab("more");}} style={{background:"none",border:"none",padding:4,cursor:"pointer",flexShrink:0}}>
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

      {/* LIVE TICKER — 10s rotation, click → news */}
      <div onClick={function(){setTab("news");}} style={{background:"#080B10",borderBottom:"1px solid "+BD,padding:"7px 0",display:"flex",alignItems:"center",overflow:"hidden",cursor:"pointer"}}>
        <div style={{background:"#EF4444",borderRadius:"0 4px 4px 0",padding:"2px 8px",marginRight:8,flexShrink:0}}>
          <span style={{fontSize:8,fontWeight:800,color:T1,letterSpacing:0.5}}>LIVE</span>
        </div>
        <span key={tickerIdx} style={{fontSize:10.5,color:T2,fontWeight:500,flex:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",animation:"ticker-fade 0.4s ease"}}>{TICKER[tickerIdx]}</span>
        <span style={{fontSize:11,color:T3,paddingRight:10}}>&#8250;</span>
      </div>

      {/* AI MARKET BRIEFING */}
      <div style={{padding:"12px 14px 0"}}>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,padding:"14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                <span style={{fontSize:13}}>&#129504;</span>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>AI Market Briefing</span>
                <span style={{fontSize:8,color:T3,marginLeft:4}}>{new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</span>
              </div>
              <div style={{fontSize:11.5,color:T2,lineHeight:1.6}}>Markets likely to open positive. IT and Banking showing strength. Nifty facing resistance near 24,050.</div>
            </div>
            <button onClick={function(){setShowBriefing(true);}} style={{background:"none",border:"none",color:PROBLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",paddingLeft:10}}>Read More &#8594;</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:6}}>
            {[["Mood","Bullish",UP],["F&G",mood.fg,mood.fg>60?UP:DOWN],["FII","Net Buy",UP],["Trend","Up",UP],["Conf",mood.conf+"%",CYAN]].map(function(r){return(
              <div key={r[0]} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"7px 5px",textAlign:"center"}}>
                <div style={{fontSize:7,color:T3,marginBottom:3}}>{r[0]}</div>
                <div style={{fontSize:10,fontWeight:700,color:r[2]}}>{r[1]}</div>
              </div>
            );})}
          </div>
        </div>
      </div>

      {/* MARKET DASHBOARD */}
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

      {/* SMART ALERTS */}
      <div style={{padding:"14px 14px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <span style={{fontSize:13,fontWeight:800,color:T1}}>Smart Alerts</span>
          <button onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",color:PROBLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View All &#8594;</button>
        </div>
        <div style={{display:"flex",gap:9,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          {ALERT_CARDS.map(function(a){return(
            <div key={a.sym+a.type} onClick={function(){setTab("alerts");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"11px 13px",minWidth:130,flexShrink:0,cursor:"pointer"}}>
              <div style={{fontSize:8.5,color:a.col,fontWeight:700,marginBottom:5}}>{a.type}</div>
              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:3}}>{a.sym}</div>
              <div style={{fontSize:9,color:T3}}>{a.time}</div>
            </div>
          );})}
        </div>
      </div>

      {/* TRENDING STOCKS */}
      <div style={{padding:"14px 14px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <span style={{fontSize:13,fontWeight:800,color:T1}}>Trending Stocks</span>
          <button onClick={function(){setTab("markets");}} style={{background:"none",border:"none",color:PROBLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View All &#8594;</button>
        </div>
        <div style={{display:"flex",gap:9,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          {LARGECAP.concat(MIDCAP).sort(function(a,b){return Math.abs(b.pct)-Math.abs(a.pct);}).slice(0,8).map(function(s){return(
            <div key={s.sym} onClick={function(){setTab("markets");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"11px 13px",minWidth:100,flexShrink:0,cursor:"pointer"}}>
              <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:4}}>{s.sym}</div>
              <div style={{fontSize:13,fontWeight:800,color:T1,fontFamily:"monospace",marginBottom:4}}>{s.ltp.toLocaleString("en-IN",{maximumFractionDigits:1})}</div>
              <div style={{fontSize:10.5,fontWeight:700,color:s.up?UP:DOWN}}>{s.up?"+":""}{s.pct}%</div>
            </div>
          );})}
        </div>
      </div>

      {/* LOWER SECTIONS */}
      <HomeLower setTab={setTab} isPrem={isPrem} isEvening={isEvening}
        gainers={GAINERS} losers={LOSERS} sectors={SECTORS} global={GLOBAL}
        largecap={LARGECAP} midcap={MIDCAP}/>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}"}</style>
    </div>
  );
}
