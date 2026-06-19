import { useState,useEffect } from "react";
import IndexDetail from "./IndexDetail";
import { MiniChart,genSpark,INDICES,COMM_IDX,GLOBAL,EVENTS,NEWS_TICKER,WATCHLIST,GAINERS,LOSERS,LARGECAP,MIDCAP,getSession,SESSION_META } from "./HomeData";
import { t, getLang } from "../i18n/translations";
import AIPulseCard from "../components/AIPulseCard";
import HomeSearch from "../components/HomeSearch";
import HomeBottom from "./HomeBottom";
import MorningPulse from "./MorningPulse";
var BG="#07111F",CARD="#101B2E",BD="#1E3A5F",BLUE="#3B82F6",BLUE2="#60A5FA",PURPLE="#7C3AED",PURPLE2="#A855F7",GOLD="#F59E0B",UP="#22C55E",DOWN="#EF4444",T1="#FFFFFF",T2="#94A3B8",T3="#475569";
export default function EquityHome(props){
  var setTab=props.setTab||function(){};
  var news=props.news||[];
  var [lang,setLangState]=useState(getLang());
  var [sess,setSess]=useState(getSession());
  var [indices,setIndices]=useState(function(){
    return INDICES.map(function(x){return Object.assign({},x,{ltp:x.base,spark:genSpark(x.base)});});
  });
  var [commIdx,setCommIdx]=useState(function(){
    return COMM_IDX.map(function(x){return Object.assign({},x,{ltp:x.base,spark:genSpark(x.base)});});
  });
  var [selIdx,setSelIdx]=useState(null);
  var [tickerIdx,setTickerIdx]=useState(0);
  var [mood,setMood]=useState({bull:72,fg:"Greed",conf:87});
  var [aiSummary]=useState("FIIs buying aggressively. Banking and IT sectors outperforming. Watch 24,000 resistance on NIFTY.");
  var [marketTab,setMarketTab]=useState("gainers");
  var [showMorningPulse,setShowMorningPulse]=useState(false);
  useEffect(function(){
    var checkLang=setInterval(function(){
      var cur=getLang();
      if(cur!=lang)setLangState(cur);
    },1000);
    var t=setInterval(function(){
      setSess(getSession());
      setIndices(function(prev){return prev.map(function(idx){var chg=(Math.random()-0.48)*idx.ltp*0.0005;var nl=parseFloat((idx.ltp+chg).toFixed(2));return Object.assign({},idx,{ltp:nl,spark:idx.spark.slice(-19).concat([nl])});});});
      setCommIdx(function(prev){return prev.map(function(idx){var chg=(Math.random()-0.48)*idx.ltp*0.004;var nl=parseFloat((idx.ltp+chg).toFixed(2));return Object.assign({},idx,{ltp:nl,spark:idx.spark.slice(-19).concat([nl])});});});
      setMood(function(p){return{bull:Math.max(40,Math.min(85,p.bull+(Math.random()-0.5)*4)),fg:p.bull>60?"Greed":"Fear",conf:Math.floor(75+Math.random()*15)};});
    },3000);
    var tk=setInterval(function(){setTickerIdx(function(i){return(i+1)%NEWS_TICKER.length;});},3500);
    return function(){clearInterval(t);clearInterval(tk);clearInterval(checkLang);};
  },[lang]);
  if(selIdx) return <IndexDetail idx={selIdx} onBack={function(){setSelIdx(null);}} setTab={setTab}/>;
  if(showMorningPulse) return <MorningPulse setTab={setTab} onBack={function(){setShowMorningPulse(false);}}/>;
  var meta=SESSION_META[sess];
  var trendLabel=mood.bull>=65?"Strong Uptrend":mood.bull>=45?"Sideways":"Bearish";
  var showGlobalCues=sess=="global";

  var CATEGORIES=[
    {label:"News",    icon:"\uD83D\uDCF0", id:"news",      col:BLUE   },
    {label:"Stocks",  icon:"\uD83D\uDCC8", id:"watchlist", col:UP     },
    {label:"F&O",     icon:"\uD83C\uDFAF", id:"oi",        col:PURPLE2},
    {label:"Mutual Funds",icon:"\uD83C\uDFE6",id:"mf",     col:GOLD   },
    {label:"Commodities",icon:"\uD83D\uDEE2\uFE0F",id:"commodity",col:"#F97316"},
    {label:"Loans",   icon:"\uD83D\uDCB3", id:"more",      col:BLUE2  },
  ];

  var MTABS=[
    {id:"gainers",   label:"Top Gainers",  data:GAINERS,   col:UP  },
    {id:"losers",    label:"Top Losers",   data:LOSERS,    col:DOWN},
    {id:"largecap",  label:"Large Cap",    data:LARGECAP,  col:BLUE},
    {id:"midcap",    label:"Mid Cap",      data:MIDCAP,    col:GOLD},
  ];
  var activeMarket=MTABS.find(function(m){return m.id==marketTab;})||MTABS[0];
  var QUICK=[
    {label:"OI Chain",id:"oi",icon:"OI",col:BLUE},{label:"Scanner",id:"scanner",icon:"SC",col:BLUE2},{label:"Paper Trade",id:"paper",icon:"PT",col:UP},{label:"AI Chat",id:"ai",icon:"AI",col:PURPLE2},{label:"Charts",id:"chart",icon:"CH",col:PURPLE},{label:"Patterns",id:"patterns",icon:"PA",col:"#06B6D4"},{label:"Watchlist",id:"watchlist",icon:"WL",col:BLUE2},{label:"Morning AI",id:"morning",icon:"MP",col:GOLD},{label:"Alerts",id:"alerts",icon:"AL",col:DOWN},];
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      {/* Live ticker */}
      <div style={{background:"rgba(59,130,246,0.08)",borderBottom:"1px solid "+BD,padding:"6px 16px",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{background:DOWN,borderRadius:4,padding:"1px 6px",flexShrink:0}}><span style={{fontSize:7,fontWeight:800,color:"#fff"}}>LIVE</span></div>
          <div style={{fontSize:9,color:T2,fontWeight:500,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{NEWS_TICKER[tickerIdx]}</div>
        </div>
      </div>

      <div style={{padding:"10px 16px 0"}}>
        <HomeSearch setTab={setTab}/>
      </div>

      <div style={{padding:"10px 16px 0"}}>
        <div style={{background:meta.col+"15",border:"1px solid "+meta.col+"40",borderRadius:20,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:5,marginBottom:10}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:meta.col,boxShadow:"0 0 5px "+meta.col}}></div>
          <span style={{fontSize:8,fontWeight:700,color:meta.col}}>{meta.label}</span>
        </div>

        <AIPulseCard session={sess} mood={mood} setTab={setTab}/>
      </div>

      {/* Index cards - horizontal scroll — tap to open chart */}
      <div style={{padding:"10px 0 0"}}>
        <div style={{display:"flex",gap:8,overflowX:"auto",padding:"0 16px 4px",WebkitOverflowScrolling:"touch"}}>
          {indices.map(function(idx){
            return (
              <div key={idx.label} onClick={function(){setSelIdx(idx);}} style={{background:CARD,border:"1px solid "+(idx.up?UP+"44":DOWN+"44"),borderRadius:14,padding:"10px 12px",flexShrink:0,minWidth:115,cursor:"pointer",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,"+(idx.up?UP:DOWN)+",transparent)"}}></div>
                <div style={{fontSize:8,fontWeight:700,color:T3,marginBottom:3,whiteSpace:"nowrap"}}>{idx.label}</div>
                <div style={{fontSize:14,fontWeight:900,color:T1,marginBottom:2,fontFamily:"monospace"}}>{idx.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:9,fontWeight:700,color:idx.up?UP:DOWN}}>{idx.up?"+":""}{idx.pct}%</span>
                  <MiniChart d={idx.spark} col={idx.up?UP:DOWN} w={40} h={18}/>
                </div>
                <div style={{fontSize:7,color:BLUE2,fontWeight:600}}>Tap for chart &#8594;</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{padding:"0 16px 12px"}}>

        {/* Morning Pulse — click to open */}
        <div onClick={function(){setShowMorningPulse(true);}} style={{background:"linear-gradient(135deg,rgba(124,58,237,0.15),rgba(59,130,246,0.1))",border:"1px solid rgba(124,58,237,0.3)",borderRadius:16,padding:"12px 14px",marginBottom:12,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,"+PURPLE+","+PURPLE2+")",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:14}}>&#9728;&#65039;</span>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:T1}}>Morning Pulse</div>
              <div style={{fontSize:8,color:T2,marginTop:1}}>AI Market Briefing  {trendLabel}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{background:PURPLE+"33",border:"1px solid "+PURPLE+"55",borderRadius:8,padding:"3px 8px"}}>
              <span style={{fontSize:8,fontWeight:700,color:PURPLE2}}>Open</span>
            </div>
            <span style={{fontSize:12,color:T3}}>&#8250;</span>
          </div>
        </div>

        {/* Category horizontal scroll */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",gap:8,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4}}>
            {CATEGORIES.map(function(cat){
              return (
                <div key={cat.id} onClick={function(){setTab(cat.id);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer",flexShrink:0,minWidth:64}}>
                  <div style={{width:48,height:48,borderRadius:14,background:cat.col+"18",border:"1px solid "+cat.col+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>
                    {cat.icon}
                  </div>
                  <span style={{fontSize:8,fontWeight:600,color:T2,textAlign:"center",lineHeight:1.2}}>{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market Tabs — Gainers / Losers / Large Cap / Mid Cap */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",marginBottom:12}}>

          {/* Tab bar */}
          <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid "+BD}}>
            {MTABS.map(function(mt){
              var act=marketTab==mt.id;
              return (
                <button key={mt.id} onClick={function(){setMarketTab(mt.id);}} style={{flex:1,minWidth:70,background:"none",border:"none",borderBottom:act?"2px solid "+mt.col:"2px solid transparent",padding:"8px 4px",color:act?mt.col:T3,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                  {mt.label}
                </button>
              );
            })}
          </div>

          {/* Stock list */}
          <div>
            {activeMarket.data.map(function(s,i){
              var up=s.up!=null ? s.up : s.pct>=0;
              var pct=typeof s.pct=="number" ? s.pct : 0;
              return (
                <div key={s.sym} style={{padding:"9px 14px",borderBottom:i<activeMarket.data.length-1?"1px solid rgba(30,58,95,0.4)":"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:8,color:T3,marginTop:1}}>{s.name||""}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,fontWeight:700,color:T1,fontFamily:"monospace"}}>{s.ltp ? s.ltp.toLocaleString("en-IN",{maximumFractionDigits:2}) : "--"}</div>
                    <div style={{fontSize:9,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <HomeBottom setTab={setTab}/>
      </div>
    </div>
  );
}
