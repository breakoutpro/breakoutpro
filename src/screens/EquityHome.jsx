import { useState, useEffect } from "react";
import IndexDetail from "./IndexDetail";
import { MiniChart, genSpark, INDICES, LARGECAP, MIDCAP, SECTORS, getSession } from "./HomeData";
import HomeBottom from "./HomeBottom";
import MorningPulse from "./MorningPulse";
import { MarketHeatmapCard, LiveNewsCards, AIBriefingCard } from "../components/HomeNewsHeatmap";

var BG="#050505", CARD="#101318", BD="rgba(255,255,255,0.07)";
var BLUE="#3B82F6", CYAN="#60A5FA";
var UP="#22C55E", DOWN="#EF4444";
var T1="#FFFFFF", T2="#9CA3AF", T3="#5B6472";

var SECTOR_ICONS={"Banking":"&#127974;","IT":"&#128187;","Auto":"&#128663;","Pharma":"&#128138;","FMCG":"&#128722;","Metal":"&#9881;&#65039;","Realty":"&#127968;","Energy":"&#9889;","Infra":"&#127959;&#65039;","Telecom":"&#128241;"};

// Modern outline SVG icons for Quick Actions
var ICONS={
  gainers:"<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='23 6 13.5 15.5 8.5 10.5 1 18'/><polyline points='17 6 23 6 23 12'/></svg>",
  losers:"<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='23 18 13.5 8.5 8.5 13.5 1 6'/><polyline points='17 18 23 18 23 12'/></svg>",
  sectors:"<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='3' width='7' height='7' rx='1.5'/><rect x='14' y='3' width='7' height='7' rx='1.5'/><rect x='3' y='14' width='7' height='7' rx='1.5'/><rect x='14' y='14' width='7' height='7' rx='1.5'/></svg>",
  global:"<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='9'/><line x1='3' y1='12' x2='21' y2='12'/><path d='M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z'/></svg>",
  news:"<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2z'/><line x1='8' y1='9' x2='15' y2='9'/><line x1='8' y1='13' x2='15' y2='13'/><line x1='8' y1='17' x2='12' y2='17'/></svg>",
};

var QUICK_ACTIONS=[
  {label:"Gainers", id:"gainers", icon:ICONS.gainers, col:UP},
  {label:"Losers",  id:"losers",  icon:ICONS.losers,  col:DOWN},
  {label:"Sectors", id:"markets", icon:ICONS.sectors, col:CYAN},
  {label:"Global",  id:"global",  icon:ICONS.global,  col:CYAN},
  {label:"News",    id:"news",    icon:ICONS.news,    col:CYAN},
];

function QuickActionBtn(props){
  return (
    <button onClick={props.onClick} style={{
      background:CARD,border:"1px solid "+BD,
      borderRadius:16,padding:"13px 4px",
      display:"flex",flexDirection:"column",alignItems:"center",gap:7,
      cursor:"pointer",fontFamily:"inherit",
    }}>
      <span style={{color:props.col}} dangerouslySetInnerHTML={{__html:props.icon}}/>
      <span style={{fontSize:9.5,fontWeight:600,color:T2,textAlign:"center",lineHeight:1.2}}>{props.label}</span>
    </button>
  );
}

function SectorCard(props){
  var s=props.s;
  var label=props.label;
  return (
    <div onClick={props.onClick} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px",minWidth:108,flexShrink:0,cursor:"pointer"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <span style={{fontSize:15}} dangerouslySetInnerHTML={{__html:SECTOR_ICONS[s.name]||"&#128202;"}}/>
        <span style={{fontSize:11,color:s.up?UP:DOWN}}>{s.up?"\u25B2":"\u25BC"}</span>
      </div>
      <div style={{fontSize:10,fontWeight:700,color:T1,marginBottom:6}}>{label}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:12,fontWeight:800,color:s.up?UP:DOWN}}>{s.up?"+":""}{s.pct}%</div>
        <svg width="32" height="14" viewBox="0 0 32 14">
          <path d={s.up?"M0,12 L6,9 L12,10 L18,5 L24,6 L32,1":"M0,2 L6,5 L12,4 L18,9 L24,8 L32,13"} fill="none" stroke={s.up?UP:DOWN} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

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

      {/* ===== LIVE TICKER STRIP ===== */}
      <div style={{padding:"10px 18px 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,overflow:"hidden"}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:UP,boxShadow:"0 0 5px "+UP,flexShrink:0,animation:"pulse-dot 1.5s infinite"}}/>
          <span key={tickerIdx} style={{fontSize:9.5,color:T3,fontWeight:500,whiteSpace:"nowrap",animation:"ticker-fade 0.4s ease"}}>{TICKER[tickerIdx]}</span>
        </div>
      </div>

      {/* ===== AI MARKET BRIEFING (compact) ===== */}
      <div style={{padding:"10px 18px 16px"}}>
        <AIBriefingCard setShowMorningPulse={setShowBriefing} pulseInfo={{label:"AI Market Briefing"}} mood={mood}/>
      </div>

      {/* ===== INDEX CARDS (larger) ===== */}
      <div style={{padding:"0 0 18px"}}>
        <div style={{display:"flex",gap:11,overflowX:"auto",padding:"0 18px 4px",WebkitOverflowScrolling:"touch"}}>
          {indices.map(function(idx){
            return (
              <div key={idx.label} onClick={function(){setSelIdx(idx);}} style={{
                background:CARD,border:"1px solid "+BD,borderRadius:18,padding:"16px",
                flexShrink:0,minWidth:152,cursor:"pointer",position:"relative",overflow:"hidden",
              }}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,"+(idx.up?UP:DOWN)+",transparent)"}}/>
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

        {/* ===== LIVE NEWS ===== */}
        <div style={{fontSize:15,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:11}}>Live News</div>
        <LiveNewsCards setTab={setTab}/>

        {/* ===== BOTTOM TAGLINE ===== */}
        <div style={{textAlign:"center",padding:"22px 10px",marginBottom:8}}>
          <div style={{fontSize:14,fontWeight:900,color:T1,letterSpacing:0.5,marginBottom:5}}>ONE APP.</div>
          <div style={{fontSize:14,fontWeight:900,color:CYAN,letterSpacing:0.5,marginBottom:12}}>EVERYTHING YOU NEED.</div>
          <div style={{fontSize:9,color:T3,letterSpacing:1.5,fontWeight:600}}>ANALYZE &bull; SCAN &bull; PLAN &bull; EXECUTE &bull; SUCCEED</div>
        </div>

        <HomeBottom setTab={setTab}/>
      </div>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}"}</style>
    </div>
  );
}
