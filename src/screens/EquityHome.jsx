import { useState, useEffect } from "react";
import IndexDetail from "./IndexDetail";
import { MiniChart, genSpark, INDICES, COMM_IDX, GLOBAL, EVENTS, NEWS_TICKER, WATCHLIST, GAINERS, LOSERS, LARGECAP, MIDCAP, getSession, SESSION_META } from "./HomeData";
import { t, getLang } from "../i18n/translations";
import AIPulseCard from "../components/AIPulseCard";
import HomeSearch from "../components/HomeSearch";
import HomeBottom from "./HomeBottom";
import MorningPulse from "./MorningPulse";

var BG="#07111F", CARD="#101B2E", BD="#1E3A5F";
var BLUE="#3B82F6", BLUE2="#60A5FA";
var PURPLE="#7C3AED", PURPLE2="#A855F7";
var GOLD="#F59E0B";
var UP="#22C55E", DOWN="#EF4444";
var T1="#FFFFFF", T2="#94A3B8", T3="#475569";
var ORANGE="#F97316";

function getPulseInfo() {
  var h = new Date().getHours();
  if (h >= 5 && h < 9)   return { label:"Morning Pulse",   icon:"&#9728;&#65039;", col:GOLD,    sub:"Pre-Market AI Briefing"   };
  if (h >= 9 && h < 16)  return { label:"Afternoon Pulse", icon:"&#9728;",         col:ORANGE,  sub:"Live Market AI Briefing"  };
  if (h >= 16 && h < 20) return { label:"Evening Pulse",   icon:"&#127748;",       col:PURPLE2, sub:"Post-Market AI Summary"   };
  return                         { label:"Night Pulse",     icon:"&#127762;",       col:BLUE2,   sub:"Global Markets Overview"  };
}

var CATEGORIES = [
  { label:"News",         icon:"&#128240;", id:"news",      col:BLUE    },
  { label:"Stocks",       icon:"&#128200;", id:"watchlist", col:UP      },
  { label:"F&O",          icon:"&#127919;", id:"oi",        col:PURPLE2 },
  { label:"Mutual Funds", icon:"&#127974;", id:"mf",        col:GOLD    },
  { label:"Commodities",  icon:"&#128674;", id:"commodity", col:ORANGE  },
  { label:"Loans",        icon:"&#128179;", id:"more",      col:BLUE2   },
];

var LARGE_GAINERS = LARGECAP.filter(function(s){ return s.up; });
var LARGE_LOSERS  = LARGECAP.filter(function(s){ return !s.up; });
var MID_GAINERS   = MIDCAP.filter(function(s){ return s.up; });
var MID_LOSERS    = MIDCAP.filter(function(s){ return !s.up; });

var MTABS = [
  { id:"lgainers", label:"LC Gainers",  data:LARGE_GAINERS, col:UP   },
  { id:"llosers",  label:"LC Losers",   data:LARGE_LOSERS,  col:DOWN },
  { id:"mgainers", label:"MC Gainers",  data:MID_GAINERS,   col:UP   },
  { id:"mlosers",  label:"MC Losers",   data:MID_LOSERS,    col:DOWN },
];

export default function EquityHome(props) {
  var setTab = props.setTab || function(){};
  var news = props.news || [];
  var [lang, setLangState] = useState(getLang());
  var [sess, setSess] = useState(getSession());
  var [indices, setIndices] = useState(function() {
    return INDICES.map(function(x){ return Object.assign({},x,{ltp:x.base,spark:genSpark(x.base)}); });
  });
  var [commIdx, setCommIdx] = useState(function() {
    return COMM_IDX.map(function(x){ return Object.assign({},x,{ltp:x.base,spark:genSpark(x.base)}); });
  });
  var [selIdx, setSelIdx] = useState(null);
  var [tickerIdx, setTickerIdx] = useState(0);
  var [mood, setMood] = useState({bull:72,fg:"Greed",conf:87});
  var [marketTab, setMarketTab] = useState("lgainers");
  var [showMorningPulse, setShowMorningPulse] = useState(false);
  var [showBriefing, setShowBriefing] = useState(false);
  var [pulseInfo, setPulseInfo] = useState(getPulseInfo());

  useEffect(function() {
    var checkLang = setInterval(function(){ var cur=getLang(); if(cur!=lang) setLangState(cur); },1000);
    var ticker = setInterval(function(){
      setSess(getSession());
      setPulseInfo(getPulseInfo());
      setIndices(function(prev){ return prev.map(function(idx){ var chg=(Math.random()-0.48)*idx.ltp*0.0005; var nl=parseFloat((idx.ltp+chg).toFixed(2)); return Object.assign({},idx,{ltp:nl,spark:idx.spark.slice(-19).concat([nl])}); }); });
      setCommIdx(function(prev){ return prev.map(function(idx){ var chg=(Math.random()-0.48)*idx.ltp*0.004; var nl=parseFloat((idx.ltp+chg).toFixed(2)); return Object.assign({},idx,{ltp:nl,spark:idx.spark.slice(-19).concat([nl])}); }); });
      setMood(function(p){ return {bull:Math.max(40,Math.min(85,p.bull+(Math.random()-0.5)*4)),fg:p.bull>60?"Greed":"Fear",conf:Math.floor(75+Math.random()*15)}; });
    }, 3000);
    var tk = setInterval(function(){ setTickerIdx(function(i){ return (i+1)%NEWS_TICKER.length; }); }, 3500);
    return function(){ clearInterval(ticker); clearInterval(tk); clearInterval(checkLang); };
  }, [lang]);

  var activeMarket = MTABS.find(function(m){ return m.id==marketTab; }) || MTABS[0];
  var meta = SESSION_META[sess] || SESSION_META["equity"];
  var trendLabel = mood.bull>=65 ? "Strong Uptrend" : mood.bull>=45 ? "Sideways" : "Bearish";

  if (selIdx) return <IndexDetail idx={selIdx} onBack={function(){setSelIdx(null);}} setTab={setTab}/>;
  if (showBriefing) return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>
      <div style={{background:CARD,borderBottom:"1px solid "+BD,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
        <button onClick={function(){setShowBriefing(false);}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>&#9889; One Tap Market</div>
          <div style={{fontSize:10,color:T2}}>Full market read in 20 seconds</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:UP,boxShadow:"0 0 6px "+UP}}></div>
          <span style={{fontSize:10,fontWeight:700,color:UP}}>LIVE</span>
        </div>
      </div>
      <div style={{padding:"12px 16px"}}>

        {/* Market Overview */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",marginBottom:12}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid "+BD,fontSize:11,fontWeight:800,color:T1}}>&#128200; Market Overview</div>
          {[
            ["NIFTY 50",    "23,969",  "+347 (1.47%)",  UP  ],
            ["SENSEX",      "76,693",  "+1,158 (1.54%)",UP  ],
            ["BANK NIFTY",  "52,135",  "+866 (1.69%)",  UP  ],
            ["GIFTY NIFTY", "24,012",  "+75 (0.32%)",   UP  ],
            ["Market Mood", mood.fg,   Math.round(mood.bull)+"%", mood.bull>=50?UP:DOWN],
            ["FII Flow",    "Net Buy", "+Rs 2,847 Cr",  UP  ],
            ["DII Flow",    "Net Buy", "+Rs 1,234 Cr",  UP  ],
          ].map(function(r,i,arr){
            return (
              <div key={r[0]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 14px",borderBottom:i<arr.length-1?"1px solid rgba(30,58,95,0.4)":"none"}}>
                <span style={{fontSize:11,color:T2}}>{r[0]}</span>
                <div style={{textAlign:"right"}}>
                  <span style={{fontSize:12,fontWeight:700,color:T1}}>{r[1]} </span>
                  <span style={{fontSize:11,fontWeight:700,color:r[3]}}>{r[2]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* News Impact on Markets */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",marginBottom:12}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid "+BD,fontSize:11,fontWeight:800,color:T1}}>&#128240; News Impact on Markets</div>
          {[
            {news:"RBI holds rates steady at 6.5%, signals dovish stance",     impact:"Banking stocks rally. HDFCBANK, ICICIBANK up 2%+",        col:UP  },
            {news:"Q4 IT earnings beat estimates — TCS, Infosys above forecast",impact:"IT sector outperforms. NIFTY IT up 1.8%",                 col:UP  },
            {news:"Crude oil drops 1.2% on demand concerns",                   impact:"OMC stocks gain. BPCL, HPCL up. Aviation benefits",       col:UP  },
            {news:"FII net buyers for 8th consecutive session",                 impact:"Broad market bullish. Midcaps & smallcaps in demand",     col:UP  },
            {news:"Auto sector: monthly sales data disappoints",                impact:"MARUTI, TATAMOTORS under pressure today",                 col:DOWN},
          ].map(function(r,i,arr){
            return (
              <div key={i} style={{padding:"10px 14px",borderBottom:i<arr.length-1?"1px solid rgba(30,58,95,0.4)":"none"}}>
                <div style={{fontSize:10,color:T2,marginBottom:4,lineHeight:1.4}}>{r.news}</div>
                <div style={{display:"flex",alignItems:"flex-start",gap:5}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:r.col,marginTop:3,flexShrink:0}}></div>
                  <div style={{fontSize:11,fontWeight:600,color:r.col,lineHeight:1.4}}>{r.impact}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Recommendation */}
        <div style={{background:"linear-gradient(135deg,rgba(59,130,246,0.1),rgba(124,58,237,0.08))",border:"1px solid rgba(59,130,246,0.25)",borderRadius:16,padding:"14px",marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:800,color:BLUE2,marginBottom:8}}>&#129504; AI Market Take</div>
          <div style={{fontSize:12,color:T1,lineHeight:1.7}}>
            Market is in <span style={{color:UP,fontWeight:700}}>Strong Uptrend ({trendLabel})</span>. FIIs buying heavily — this signals institutional confidence. Banking and IT are the leaders. Avoid Auto sector today. NIFTY resistance at 24,050 — watch for breakout or rejection at this level. Confidence: <span style={{color:PURPLE2,fontWeight:700}}>{mood.conf}%</span>
          </div>
          <button onClick={function(){setShowBriefing(false);setTab("briefing");}} style={{width:"100%",marginTop:12,background:"linear-gradient(135deg,"+BLUE+","+PURPLE+")",border:"none",borderRadius:12,padding:"11px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            Full AI Briefing (Groq AI) &#8594;
          </button>
        </div>
      </div>
    </div>
  );
  if (showMorningPulse) return (
    <div>
      <div style={{background:CARD,borderBottom:"1px solid "+BD,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={function(){setShowMorningPulse(false);}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:32,height:32,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
        <span style={{fontSize:16,fontWeight:800,color:T1}}>{pulseInfo.label}</span>
      </div>
      <MorningPulse setTab={setTab}/>
    </div>
  );

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Live ticker */}
      <div style={{background:"rgba(59,130,246,0.08)",borderBottom:"1px solid "+BD,padding:"6px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{background:DOWN,borderRadius:4,padding:"1px 6px",flexShrink:0}}><span style={{fontSize:8,fontWeight:800,color:"#fff"}}>LIVE</span></div>
          <div style={{fontSize:10,color:T2,fontWeight:500,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{NEWS_TICKER[tickerIdx]}</div>
        </div>
      </div>

      {/* Search */}
      <div style={{padding:"10px 16px 0"}}>
        <HomeSearch setTab={setTab}/>
      </div>

      {/* Session badge + AIPulseCard */}
      <div style={{padding:"10px 16px 0"}}>
        <div style={{marginBottom:10}}>
          <div style={{background:meta.col+"15",border:"1px solid "+meta.col+"40",borderRadius:20,padding:"4px 12px",display:"inline-flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:meta.col,boxShadow:"0 0 5px "+meta.col}}></div>
            <span style={{fontSize:10,fontWeight:700,color:meta.col}}>{meta.label}</span>
          </div>
        </div>
        <AIPulseCard session={sess} mood={mood} setTab={setTab}/>
      </div>

      {/* Index cards horizontal scroll */}
      <div style={{padding:"12px 0 0"}}>
        <div style={{display:"flex",gap:10,overflowX:"auto",padding:"0 16px 4px",WebkitOverflowScrolling:"touch"}}>
          {indices.map(function(idx){
            return (
              <div key={idx.label} onClick={function(){setSelIdx(idx);}} style={{background:CARD,border:"1px solid "+(idx.up?UP+"44":DOWN+"44"),borderRadius:16,padding:"14px",flexShrink:0,minWidth:120,cursor:"pointer",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,"+(idx.up?UP:DOWN)+",transparent)"}}></div>
                <div style={{fontSize:11,fontWeight:700,color:T3,marginBottom:4,whiteSpace:"nowrap"}}>{idx.label}</div>
                <div style={{fontSize:16,fontWeight:900,color:T1,marginBottom:3,fontFamily:"monospace"}}>{idx.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <span style={{fontSize:11,fontWeight:700,color:idx.up?UP:DOWN}}>{idx.up?"+":""}{idx.pct}%</span>
                  <MiniChart d={idx.spark} col={idx.up?UP:DOWN} w={42} h={20}/>
                </div>
                <div style={{fontSize:9,color:BLUE2,fontWeight:600}}>Tap for chart &#8594;</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{padding:"12px 16px 0"}}>

        {/* Pulse Card — auto title changes by time */}
        <div onClick={function(){setShowMorningPulse(true);}} style={{background:"linear-gradient(135deg,rgba(124,58,237,0.15),rgba(59,130,246,0.1))",border:"1px solid "+pulseInfo.col+"55",borderRadius:18,padding:"14px 16px",marginBottom:14,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,"+PURPLE+","+pulseInfo.col+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}} dangerouslySetInnerHTML={{__html:pulseInfo.icon}}/>
            <div>
              <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:3}}>{pulseInfo.label}</div>
              <div style={{fontSize:12,color:T2}}>{pulseInfo.sub} &bull; {trendLabel}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{background:pulseInfo.col+"33",border:"1px solid "+pulseInfo.col+"55",borderRadius:8,padding:"4px 10px"}}>
              <span style={{fontSize:10,fontWeight:700,color:pulseInfo.col}}>Open</span>
            </div>
            <span style={{fontSize:16,color:T3}}>&#8250;</span>
          </div>
        </div>

        {/* Category horizontal scroll */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",gap:10,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4}}>
            {CATEGORIES.map(function(cat){
              return (
                <div key={cat.id} onClick={function(){setTab(cat.id);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",flexShrink:0,minWidth:64}}>
                  <div style={{width:52,height:52,borderRadius:16,background:cat.col+"18",border:"1px solid "+cat.col+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}} dangerouslySetInnerHTML={{__html:cat.icon}}/>
                  <span style={{fontSize:10,fontWeight:600,color:T2,textAlign:"center",lineHeight:1.3}}>{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market Tabs — LC Gainers / LC Losers / MC Gainers / MC Losers */}
        <div style={{fontSize:14,fontWeight:800,color:T1,letterSpacing:0.3,marginBottom:10}}>Market Movers</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:18,overflow:"hidden",marginBottom:14}}>

          {/* Tab row */}
          <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid "+BD}}>
            {MTABS.map(function(mt){
              var act = marketTab==mt.id;
              return (
                <button key={mt.id} onClick={function(){setMarketTab(mt.id);}} style={{flex:1,minWidth:72,background:act?mt.col+"15":"none",border:"none",borderBottom:act?"2px solid "+mt.col:"2px solid transparent",padding:"10px 4px",color:act?mt.col:T3,fontSize:10,fontWeight:act?800:500,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                  {mt.label}
                </button>
              );
            })}
          </div>

          {/* Stock rows */}
          {activeMarket.data.length==0?(
            <div style={{padding:"20px",textAlign:"center",color:T3,fontSize:12}}>No data available</div>
          ):(
            activeMarket.data.map(function(s,i){
              var up = s.up!=null ? s.up : s.pct>=0;
              var pct = typeof s.pct=="number" ? s.pct : 0;
              return (
                <div key={s.sym} style={{padding:"12px 16px",borderBottom:i<activeMarket.data.length-1?"1px solid rgba(30,58,95,0.4)":"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:T1}}>{s.sym}</div>
                    <div style={{fontSize:11,color:T3,marginTop:2}}>{s.name||""}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:700,color:T1,fontFamily:"monospace"}}>{s.ltp ? s.ltp.toLocaleString("en-IN",{maximumFractionDigits:2}) : "--"}</div>
                    <div style={{fontSize:11,fontWeight:700,color:up?UP:DOWN,marginTop:2}}>{up?"+":""}{pct}%</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <HomeBottom setTab={setTab}/>
      </div>
    </div>
  );
}
