import { useState, useEffect } from "react";
import IndexDetail from "./IndexDetail";
import { MiniChart, genSpark, INDICES, GAINERS, LOSERS, LARGECAP, MIDCAP, SECTORS, NEWS_TICKER, getSession, SESSION_META } from "./HomeData";
import { getLang } from "../i18n/translations";
import HomeSearch from "../components/HomeSearch";
import HomeBottom from "./HomeBottom";
import MorningPulse from "./MorningPulse";
import { MarketHeatmapCard, LiveNewsCards, AIBriefingCard } from "../components/HomeNewsHeatmap";

var BG="#061223", CARD="#0D1B2A", BD="rgba(255,255,255,0.05)";
var BLUE="#3B82F6", CYAN="#22D3EE";
var UP="#22C55E", DOWN="#EF4444", GOLD="#F59E0B";
var T1="#FFFFFF", T2="#94A3B8", T3="#5B6B85";

function getPulseInfo(){
  var h=new Date().getHours();
  if(h>=5&&h<9)return{label:"Morning Briefing",icon:"&#9728;&#65039;"};
  if(h>=9&&h<16)return{label:"Live Market Pulse",icon:"&#9889;"};
  if(h>=16&&h<20)return{label:"Closing Summary",icon:"&#127748;"};
  return{label:"Overnight Watch",icon:"&#127762;"};
}

var SECTOR_ICONS={"Banking":"&#127974;","IT":"&#128187;","Auto":"&#128663;","Pharma":"&#128138;","FMCG":"&#128722;","Metal":"&#9881;&#65039;","Realty":"&#127968;","Energy":"&#9889;","Infra":"&#127959;&#65039;","Telecom":"&#128241;"};

var QUICK_ACTIONS=[
  {label:"Top Gainers",  id:"gainers",  icon:"&#128200;"},
  {label:"Top Losers",   id:"losers",   icon:"&#128201;"},
  {label:"Sector Perf",  id:"markets",  icon:"&#127760;"},
  {label:"Global",       id:"global",   icon:"&#127757;"},
  {label:"News",         id:"news",     icon:"&#128240;"},
];

function GlassButton(props){
  return (
    <button onClick={props.onClick} style={{
      background:"rgba(59,130,246,0.08)",
      border:"1px solid rgba(59,130,246,0.18)",
      backdropFilter:"blur(12px)",
      borderRadius:16,padding:"12px 8px",
      display:"flex",flexDirection:"column",alignItems:"center",gap:6,
      cursor:"pointer",fontFamily:"inherit",flexShrink:0,minWidth:76,
    }}>
      <span style={{fontSize:18}} dangerouslySetInnerHTML={{__html:props.icon}}/>
      <span style={{fontSize:9,fontWeight:600,color:T2,textAlign:"center",lineHeight:1.2}}>{props.label}</span>
    </button>
  );
}

export default function EquityHome(props){
  var setTab=props.setTab||function(){};
  var news=props.news||[];
  var [lang,setLangState]=useState(getLang());
  var [sess,setSess]=useState(getSession());
  var [indices,setIndices]=useState(function(){
    return INDICES.map(function(x){return Object.assign({},x,{ltp:x.base,spark:genSpark(x.base)});});
  });
  var [selIdx,setSelIdx]=useState(null);
  var [mood,setMood]=useState({bull:72,fg:"Greed",conf:87});
  var [showMorningPulse,setShowMorningPulse]=useState(false);
  var [pulseInfo,setPulseInfo]=useState(getPulseInfo());
  var [now,setNow]=useState(new Date());
  var [marketTab,setMarketTab]=useState("lgainers");

  useEffect(function(){
    var t=setInterval(function(){
      setSess(getSession());
      setPulseInfo(getPulseInfo());
      setNow(new Date());
      setIndices(function(prev){return prev.map(function(idx){var chg=(Math.random()-0.48)*idx.ltp*0.0005;var nl=parseFloat((idx.ltp+chg).toFixed(2));return Object.assign({},idx,{ltp:nl,spark:idx.spark.slice(-19).concat([nl])});});});
      setMood(function(p){return{bull:Math.max(40,Math.min(85,p.bull+(Math.random()-0.5)*4)),fg:p.bull>60?"Greed":"Fear",conf:Math.floor(75+Math.random()*15)};});
    },3000);
    var langT=setInterval(function(){var cur=getLang();if(cur!=lang)setLangState(cur);},1000);
    return function(){clearInterval(t);clearInterval(langT);};
  },[lang]);

  var meta=SESSION_META[sess]||SESSION_META["equity"];
  var isLive=sess=="live"||sess=="equity";
  var timeStr=now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});

  var LARGE_GAINERS=LARGECAP.filter(function(s){return s.up;});
  var LARGE_LOSERS=LARGECAP.filter(function(s){return !s.up;});
  var MID_GAINERS=MIDCAP.filter(function(s){return s.up;});
  var MID_LOSERS=MIDCAP.filter(function(s){return !s.up;});
  var MTABS=[
    {id:"lgainers",label:"LC Gainers",data:LARGE_GAINERS,col:UP},
    {id:"llosers", label:"LC Losers", data:LARGE_LOSERS, col:DOWN},
    {id:"mgainers",label:"MC Gainers",data:MID_GAINERS,  col:UP},
    {id:"mlosers", label:"MC Losers", data:MID_LOSERS,   col:DOWN},
  ];
  var activeMarket=MTABS.find(function(m){return m.id==marketTab;})||MTABS[0];

  if(selIdx) return <IndexDetail idx={selIdx} onBack={function(){setSelIdx(null);}} setTab={setTab}/>;
  if(showMorningPulse) return (
    <div style={{background:BG,minHeight:"100vh"}}>
      <div style={{background:CARD,borderBottom:"1px solid "+BD,padding:"16px 16px",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={function(){setShowMorningPulse(false);}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:10,width:34,height:34,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <span style={{fontSize:17,fontWeight:800,color:T1}}>{pulseInfo.label}</span>
      </div>
      <MorningPulse setTab={setTab}/>
    </div>
  );

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:84,color:T1}}>

      {/* ===== TOP HEADER ===== */}
      <div style={{padding:"22px 18px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:11,background:"linear-gradient(135deg,"+BLUE+","+CYAN+")",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(59,130,246,0.35)"}}>
            <span style={{fontSize:14,fontWeight:900,color:"#fff",letterSpacing:-0.5}}>BP</span>
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:T1,letterSpacing:-0.2}}>Breakout<span style={{color:CYAN}}>Pro</span></div>
            <div style={{display:"flex",alignItems:"center",gap:5,marginTop:1}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:isLive?UP:T3,boxShadow:isLive?"0 0 6px "+UP:"none"}}/>
              <span style={{fontSize:8,fontWeight:600,color:isLive?UP:T3}}>{isLive?"Market Live":"Market Closed"}</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,fontWeight:700,color:T2,fontFamily:"monospace"}}>{timeStr}</div>
            <div style={{fontSize:7,color:T3}}>{lang=="te"?"తెలుగు":"EN"}</div>
          </div>
          <button onClick={function(){setTab("sub");}} style={{background:"linear-gradient(135deg,"+GOLD+",#D97706)",border:"none",borderRadius:10,padding:"7px 13px",display:"flex",alignItems:"center",gap:4,cursor:"pointer",boxShadow:"0 3px 12px rgba(245,158,11,0.3)"}}>
            <span style={{fontSize:10}}>&#11088;</span>
            <span style={{fontSize:10,fontWeight:800,color:"#1A0F00"}}>PRO</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{padding:"0 18px 14px"}}>
        <HomeSearch setTab={setTab}/>
      </div>

      {/* ===== AI MARKET BRIEFING CARD ===== */}
      <div style={{padding:"0 18px 16px"}}>
        <AIBriefingCard setShowMorningPulse={setShowMorningPulse} pulseInfo={pulseInfo} mood={mood}/>
      </div>

      {/* ===== LIVE MARKET CARDS ===== */}
      <div style={{padding:"0 0 16px"}}>
        <div style={{padding:"0 18px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:13,fontWeight:800,color:T1,letterSpacing:0.2}}>Live Markets</span>
          <span style={{fontSize:9,color:T3}}>Tap for chart &#8594;</span>
        </div>
        <div style={{display:"flex",gap:10,overflowX:"auto",padding:"0 18px 4px",WebkitOverflowScrolling:"touch"}}>
          {indices.map(function(idx){
            return (
              <div key={idx.label} onClick={function(){setSelIdx(idx);}} style={{
                background:CARD,border:"1px solid "+BD,borderRadius:18,padding:"14px",
                flexShrink:0,minWidth:128,cursor:"pointer",position:"relative",overflow:"hidden",
                boxShadow:"0 4px 20px rgba(0,0,0,0.25)",
              }}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,"+(idx.up?UP:DOWN)+",transparent)"}}/>
                <div style={{fontSize:10,fontWeight:700,color:T3,marginBottom:5}}>{idx.label}</div>
                <div style={{fontSize:16,fontWeight:900,color:T1,fontFamily:"monospace",marginBottom:4,letterSpacing:-0.3}}>{idx.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,fontWeight:700,color:idx.up?UP:DOWN}}>{idx.up?"+":""}{idx.pct}%</span>
                  <MiniChart d={idx.spark} col={idx.up?UP:DOWN} w={42} h={20}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div style={{padding:"0 0 18px"}}>
        <div style={{padding:"0 18px",marginBottom:10}}>
          <span style={{fontSize:13,fontWeight:800,color:T1,letterSpacing:0.2}}>Quick Actions</span>
        </div>
        <div style={{display:"flex",gap:8,overflowX:"auto",padding:"0 18px 4px",WebkitOverflowScrolling:"touch"}}>
          {QUICK_ACTIONS.map(function(a){
            return <GlassButton key={a.id} icon={a.icon} label={a.label} onClick={function(){setTab(a.id=="gainers"||a.id=="losers"?"markets":a.id);}}/>;
          })}
        </div>
      </div>

      <div style={{padding:"0 18px"}}>

        {/* ===== SECTOR PERFORMANCE ===== */}
        <div style={{fontSize:13,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:10}}>Sector Performance</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:20,overflow:"hidden",marginBottom:16,boxShadow:"0 4px 20px rgba(0,0,0,0.25)"}}>
          {SECTORS.slice(0,6).map(function(s,i){
            var barW=Math.min(100,Math.abs(s.pct)*20);
            return (
              <div key={s.name} onClick={function(){setTab("markets");}} style={{padding:"11px 16px",borderBottom:i<5?"1px solid "+BD:"none",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:13}} dangerouslySetInnerHTML={{__html:SECTOR_ICONS[s.name]||"&#128202;"}}/>
                    <span style={{fontSize:11,fontWeight:700,color:T1}}>{s.name}</span>
                  </div>
                  <span style={{fontSize:11,fontWeight:800,color:s.up?UP:DOWN}}>{s.up?"+":""}{s.pct}%</span>
                </div>
                <div style={{height:3,background:"rgba(255,255,255,0.05)",borderRadius:2}}>
                  <div style={{height:3,background:s.up?UP:DOWN,borderRadius:2,width:barW+"%",opacity:0.75}}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== MARKET HEATMAP ===== */}
        <div style={{fontSize:13,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:10}}>Market Heatmap</div>
        <MarketHeatmapCard setTab={setTab} stocks={LARGECAP.concat(MIDCAP)}/>

        {/* ===== MARKET MOVERS (LC/MC Gainers/Losers) ===== */}
        <div style={{fontSize:13,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:10}}>Market Movers</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:20,overflow:"hidden",marginBottom:16,boxShadow:"0 4px 20px rgba(0,0,0,0.25)"}}>
          <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid "+BD}}>
            {MTABS.map(function(mt){
              var act=marketTab==mt.id;
              return (
                <button key={mt.id} onClick={function(){setMarketTab(mt.id);}} style={{flex:1,minWidth:74,background:act?mt.col+"12":"none",border:"none",borderBottom:act?"2px solid "+mt.col:"2px solid transparent",padding:"11px 4px",color:act?mt.col:T3,fontSize:10,fontWeight:act?800:500,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{mt.label}</button>
              );
            })}
          </div>
          {activeMarket.data.length==0?(
            <div style={{padding:20,textAlign:"center",color:T3,fontSize:11}}>No data available</div>
          ):(
            activeMarket.data.map(function(s,i){
              var up=s.up!=null?s.up:s.pct>=0;
              return (
                <div key={s.sym} style={{padding:"12px 16px",borderBottom:i<activeMarket.data.length-1?"1px solid "+BD:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:9,color:T3,marginTop:2}}>{s.name||""}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,fontWeight:700,color:T1,fontFamily:"monospace"}}>{s.ltp?s.ltp.toLocaleString("en-IN",{maximumFractionDigits:2}):"--"}</div>
                    <div style={{fontSize:10,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{s.pct}%</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ===== LIVE NEWS ===== */}
        <div style={{fontSize:13,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:10}}>Live News</div>
        <LiveNewsCards setTab={setTab}/>

        {/* ===== BOTTOM TAGLINE ===== */}
        <div style={{textAlign:"center",padding:"24px 10px",marginBottom:8}}>
          <div style={{fontSize:14,fontWeight:900,color:T1,letterSpacing:0.5,marginBottom:4}}>ONE APP.</div>
          <div style={{fontSize:14,fontWeight:900,background:"linear-gradient(90deg,"+BLUE+","+CYAN+")",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",letterSpacing:0.5,marginBottom:12}}>EVERYTHING YOU NEED.</div>
          <div style={{fontSize:9,color:T3,letterSpacing:1.5,fontWeight:600}}>ANALYZE &bull; SCAN &bull; PLAN &bull; EXECUTE &bull; SUCCEED</div>
        </div>

        <HomeBottom setTab={setTab}/>
      </div>
    </div>
  );
}
