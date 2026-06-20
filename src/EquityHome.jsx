import { useState, useEffect } from "react";
import IndexDetail from "./IndexDetail";
import { MiniChart, genSpark, INDICES, LARGECAP, MIDCAP, SECTORS, getSession } from "./HomeData";
import HomeBottom from "./HomeBottom";
import MorningPulse from "./MorningPulse";
import { MarketHeatmapCard, LiveNewsCards, AIBriefingCard } from "../components/HomeNewsHeatmap";

var BG="#050505", CARD="#111317", BD="rgba(103,232,249,0.08)";
var BLUE="#3B82F6", CYAN="#67E8F9";
var UP="#22C55E", DOWN="#EF4444";
var T1="#FFFFFF", T2="#9CA3AF", T3="#5B6472";

var SECTOR_ICONS={"Banking":"&#127974;","IT":"&#128187;","Auto":"&#128663;","Pharma":"&#128138;","FMCG":"&#128722;","Metal":"&#9881;&#65039;","Realty":"&#127968;","Energy":"&#9889;","Infra":"&#127959;&#65039;","Telecom":"&#128241;"};

var QUICK_ACTIONS=[
  {label:"Top Gainers", id:"gainers", icon:"&#128200;"},
  {label:"Top Losers",  id:"losers",  icon:"&#128201;"},
  {label:"Sectors",     id:"markets", icon:"&#127760;"},
  {label:"Global",      id:"global",  icon:"&#127757;"},
  {label:"News",        id:"news",    icon:"&#128240;"},
];

function CandleLogo(){
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <line x1="6" y1="3" x2="6" y2="7" stroke={CYAN} strokeWidth="1.6"/>
      <rect x="3.5" y="7" width="5" height="7" rx="1" fill={CYAN}/>
      <line x1="6" y1="14" x2="6" y2="18" stroke={CYAN} strokeWidth="1.6"/>
      <line x1="13" y1="6" x2="13" y2="9" stroke="#fff" strokeWidth="1.6"/>
      <rect x="10.5" y="9" width="5" height="8" rx="1" fill="none" stroke="#fff" strokeWidth="1.6"/>
      <line x1="13" y1="17" x2="13" y2="20" stroke="#fff" strokeWidth="1.6"/>
      <line x1="20" y1="2" x2="20" y2="5" stroke={CYAN} strokeWidth="1.6"/>
      <rect x="17.5" y="5" width="5" height="10" rx="1" fill={CYAN}/>
      <line x1="20" y1="15" x2="20" y2="19" stroke={CYAN} strokeWidth="1.6"/>
    </svg>
  );
}

function GlassButton(props){
  return (
    <button onClick={props.onClick} style={{
      background:"rgba(103,232,249,0.04)",border:"1px solid "+BD,
      borderRadius:16,padding:"13px 6px",
      display:"flex",flexDirection:"column",alignItems:"center",gap:7,
      cursor:"pointer",fontFamily:"inherit",
    }}>
      <span style={{fontSize:18}} dangerouslySetInnerHTML={{__html:props.icon}}/>
      <span style={{fontSize:9.5,fontWeight:600,color:T2,textAlign:"center",lineHeight:1.2}}>{props.label}</span>
    </button>
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
  var [marketTab,setMarketTab]=useState("lgainers");
  var [today,setToday]=useState(new Date());

  useEffect(function(){
    var t=setInterval(function(){
      setSess(getSession());
      setIndices(function(prev){return prev.map(function(idx){var chg=(Math.random()-0.48)*idx.ltp*0.0005;var nl=parseFloat((idx.ltp+chg).toFixed(2));return Object.assign({},idx,{ltp:nl,spark:idx.spark.slice(-19).concat([nl])});});});
      setMood(function(p){return{bull:Math.max(40,Math.min(85,p.bull+(Math.random()-0.5)*4)),fg:p.bull>60?"Greed":"Fear",conf:Math.floor(75+Math.random()*15)};});
    },3000);
    var clockT=setInterval(function(){setToday(new Date());},1000);
    return function(){clearInterval(t);clearInterval(clockT);};
  },[]);

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
  if(showBriefing) return (
    <div style={{background:BG,minHeight:"100vh"}}>
      <div style={{background:CARD,borderBottom:"1px solid "+BD,padding:"16px 16px",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={function(){setShowBriefing(false);}} style={{background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,width:34,height:34,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <span style={{fontSize:18,fontWeight:800,color:T1}}>AI Market Briefing</span>
      </div>
      <MorningPulse setTab={setTab}/>
    </div>
  );

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:84,color:T1}}>

      {/* ===== TOP HEADER (logo + name, live time + date + search) ===== */}
      <div style={{padding:"20px 18px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,borderRadius:12,background:CARD,border:"1px solid "+BD,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <CandleLogo/>
          </div>
          <div style={{fontSize:17,fontWeight:800,letterSpacing:-0.2}}><span style={{color:"#FFFFFF"}}>Breakout</span><span style={{color:CYAN}}>Pro</span></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,fontWeight:700,color:T1,fontFamily:"monospace",letterSpacing:0.2}}>{today.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true})}</div>
            <div style={{fontSize:8.5,fontWeight:600,color:T3,marginTop:1}}>{today.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</div>
          </div>
          <button onClick={function(){setTab("markets");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:11,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
            <span style={{fontSize:15,color:T2}}>&#128269;</span>
          </button>
        </div>
      </div>

      {/* ===== AI MARKET BRIEFING CARD ===== */}
      <div style={{padding:"0 18px 18px"}}>
        <AIBriefingCard setShowMorningPulse={setShowBriefing} pulseInfo={{label:"AI Market Briefing"}} mood={mood}/>
      </div>

      {/* ===== INDEX CARDS ===== */}
      <div style={{padding:"0 0 18px"}}>
        <div style={{display:"flex",gap:10,overflowX:"auto",padding:"0 18px 4px",WebkitOverflowScrolling:"touch"}}>
          {indices.map(function(idx){
            return (
              <div key={idx.label} onClick={function(){setSelIdx(idx);}} style={{
                background:CARD,border:"1px solid "+BD,borderRadius:18,padding:"14px",
                flexShrink:0,minWidth:130,cursor:"pointer",position:"relative",overflow:"hidden",
              }}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,"+(idx.up?UP:DOWN)+",transparent)"}}/>
                <div style={{fontSize:10.5,fontWeight:700,color:T3,marginBottom:6}}>{idx.label}</div>
                <div style={{fontSize:17,fontWeight:900,color:T1,fontFamily:"monospace",marginBottom:5,letterSpacing:-0.3}}>{idx.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11.5,fontWeight:700,color:idx.up?UP:DOWN}}>{idx.up?"+":""}{idx.pct}%</span>
                  <MiniChart d={idx.spark} col={idx.up?UP:DOWN} w={42} h={20}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div style={{padding:"0 18px 18px"}}>
        <div style={{marginBottom:11}}>
          <span style={{fontSize:14.5,fontWeight:800,color:T1,letterSpacing:0.2}}>Quick Actions</span>
        </div>
        <div style={{display:"flex",gap:8,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          {QUICK_ACTIONS.map(function(a){
            return <div key={a.id} style={{minWidth:74,flexShrink:0}}><GlassButton icon={a.icon} label={a.label} onClick={function(){setTab(a.id=="gainers"||a.id=="losers"?"markets":a.id);}}/></div>;
          })}
        </div>
      </div>

      <div style={{padding:"0 18px"}}>

        {/* ===== SECTOR PERFORMANCE ===== */}
        <div style={{fontSize:14.5,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:11}}>Sector Performance</div>
        <div style={{display:"flex",gap:9,overflowX:"auto",marginBottom:18,paddingBottom:2,WebkitOverflowScrolling:"touch"}}>
          {["IT","Banking","Pharma","Auto","FMCG"].map(function(name){
            var s=SECTORS.find(function(x){return x.name==name;});
            if(!s)return null;
            var label=name=="Banking"?"Nifty Bank":"Nifty "+name;
            return (
              <div key={s.name} onClick={function(){setTab("markets");}} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"13px",minWidth:104,flexShrink:0,cursor:"pointer"}}>
                <span style={{fontSize:17}} dangerouslySetInnerHTML={{__html:SECTOR_ICONS[s.name]||"&#128202;"}}/>
                <div style={{fontSize:10.5,fontWeight:700,color:T1,marginTop:7,marginBottom:4}}>{label}</div>
                <div style={{fontSize:12.5,fontWeight:800,color:s.up?UP:DOWN}}>{s.up?"+":""}{s.pct}%</div>
              </div>
            );
          })}
        </div>

        {/* ===== MARKET HEATMAP ===== */}
        <div style={{fontSize:14.5,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:11}}>Market Heatmap</div>
        <MarketHeatmapCard setTab={setTab} stocks={LARGECAP.concat(MIDCAP)}/>

        {/* ===== MARKET MOVERS ===== */}
        <div style={{fontSize:14.5,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:11}}>Market Movers</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:20,overflow:"hidden",marginBottom:18}}>
          <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid "+BD}}>
            {MTABS.map(function(mt){
              var act=marketTab==mt.id;
              return (
                <button key={mt.id} onClick={function(){setMarketTab(mt.id);}} style={{flex:1,minWidth:78,background:"none",border:"none",borderBottom:act?"2px solid "+mt.col:"2px solid transparent",padding:"12px 4px",color:act?mt.col:T3,fontSize:10.5,fontWeight:act?800:500,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{mt.label}</button>
              );
            })}
          </div>
          {activeMarket.data.length==0?(
            <div style={{padding:20,textAlign:"center",color:T3,fontSize:12}}>No data available</div>
          ):(
            activeMarket.data.map(function(s,i){
              var up=s.up!=null?s.up:s.pct>=0;
              return (
                <div key={s.sym} style={{padding:"13px 16px",borderBottom:i<activeMarket.data.length-1?"1px solid "+BD:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:12.5,fontWeight:700,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:9.5,color:T3,marginTop:2}}>{s.name||""}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:T1,fontFamily:"monospace"}}>{s.ltp?s.ltp.toLocaleString("en-IN",{maximumFractionDigits:2}):"--"}</div>
                    <div style={{fontSize:10.5,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{s.pct}%</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ===== LIVE NEWS ===== */}
        <div style={{fontSize:14.5,fontWeight:800,color:T1,letterSpacing:0.2,marginBottom:11}}>Live News</div>
        <LiveNewsCards setTab={setTab}/>

        {/* ===== BOTTOM TAGLINE ===== */}
        <div style={{textAlign:"center",padding:"26px 10px",marginBottom:8}}>
          <div style={{fontSize:14.5,fontWeight:900,color:T1,letterSpacing:0.5,marginBottom:5}}>ONE APP.</div>
          <div style={{fontSize:14.5,fontWeight:900,color:CYAN,letterSpacing:0.5,marginBottom:13}}>EVERYTHING YOU NEED.</div>
          <div style={{fontSize:9.5,color:T3,letterSpacing:1.5,fontWeight:600}}>ANALYZE &bull; SCAN &bull; PLAN &bull; EXECUTE &bull; SUCCEED</div>
        </div>

        <HomeBottom setTab={setTab}/>
      </div>
    </div>
  );
}
