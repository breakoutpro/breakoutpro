import { useState,useEffect } from "react";
import IndexDetail from "./IndexDetail";
import { MiniChart,genSpark,INDICES,COMM_IDX,GLOBAL,EVENTS,NEWS_TICKER,WATCHLIST,GAINERS,LOSERS,getSession,SESSION_META } from "./HomeData";
import { t, getLang } from "../i18n/translations";
import AIPulseCard from "../components/AIPulseCard";
import HomeSearch from "../components/HomeSearch";
import HomeBottom from "./HomeBottom";
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
  var meta=SESSION_META[sess];
  var isComm=sess=="mcx";
  var isGlobalSess=sess=="global";
  var showGlobalCues=sess=="global";
  var trendLabel=mood.bull>=65?"Strong Uptrend":mood.bull>=45?"Sideways":"Bearish";
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

      <div style={{padding:"0 16px 0"}}>
        {/* MARKET CENTER */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:18,overflow:"hidden",marginBottom:12,boxShadow:"0 4px 24px rgba(0,0,0,0.3)"}}>
          <div style={{background:"linear-gradient(135deg,#0D1A2E,#101B2E)",padding:"10px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:DOWN,boxShadow:"0 0 6px "+DOWN}}></div>
            <span style={{fontSize:11,fontWeight:800,color:T1}}>MARKET CENTER</span>
          </div>
          {/* AI Summary */}
          <div style={{padding:"10px 14px",background:"linear-gradient(135deg,rgba(124,58,237,0.08),rgba(59,130,246,0.05))",borderBottom:"1px solid "+BD}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,"+PURPLE+","+PURPLE2+")",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:9,fontWeight:900,color:"#fff"}}>AI</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:8,fontWeight:700,color:PURPLE2,marginBottom:3,letterSpacing:0.5}}>{t("aiSummary",lang).toUpperCase()}  {trendLabel}</div>
                <div style={{fontSize:10,color:T1,lineHeight:1.6}}>{aiSummary}</div>
              </div>
            </div>
          </div>
          {/* Global cues - only before 9AM */}
          {showGlobalCues?(
            <div style={{padding:"10px 14px",borderBottom:"1px solid "+BD}}>
              <div style={{fontSize:8,fontWeight:700,color:T3,marginBottom:8,letterSpacing:0.8}}>{t("globalCues",lang).toUpperCase()}</div>
              <div style={{display:"flex",gap:6,overflowX:"auto"}}>
                {GLOBAL.map(function(g){
                  return <div key={g.label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+BD,borderRadius:10,padding:"7px 10px",flexShrink:0,minWidth:65,textAlign:"center"}}><div style={{fontSize:7,color:T3,marginBottom:2}}>{g.label}</div><div style={{fontSize:10,fontWeight:700,color:T1}}>{g.val}</div><div style={{fontSize:8,fontWeight:600,color:g.up?UP:DOWN}}>{g.chg}</div></div>;
                })}
              </div>
            </div>
          ):(
            <div style={{padding:"10px 14px",borderBottom:"1px solid "+BD}}>
              <div style={{fontSize:8,fontWeight:700,color:T3,marginBottom:8,letterSpacing:0.8}}>{t("todayWatchlist",lang).toUpperCase()}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {WATCHLIST.map(function(w){
                  return <div key={w.sym} style={{background:w.color+"12",border:"1px solid "+w.color+"33",borderRadius:10,padding:"6px 10px"}}><span style={{fontSize:9,fontWeight:700,color:w.color}}>{w.sym}</span></div>;
                })}
              </div>
            </div>
          )}
          {/* FII/DII */}
          <div style={{padding:"10px 14px",borderBottom:"1px solid "+BD}}>
            <div style={{fontSize:8,fontWeight:700,color:T3,marginBottom:8,letterSpacing:0.8}}>FII / DII</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["FII","Rs 2,847 Cr",UP],["DII","Rs 1,234 Cr",UP]].map(function(r){
                return <div key={r[0]} style={{background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.15)",borderRadius:10,padding:"8px 12px"}}><div style={{fontSize:8,fontWeight:700,color:T2,marginBottom:2}}>{r[0]} Net Buy</div><div style={{fontSize:11,fontWeight:800,color:r[2]}}>{r[1]}</div></div>;
              })}
            </div>
          </div>
          {/* Today Events */}
          <div style={{padding:"10px 14px",borderBottom:"1px solid "+BD}}>
            <div style={{fontSize:8,fontWeight:700,color:T3,marginBottom:8,letterSpacing:0.8}}>{t("todayEvents",lang).toUpperCase()}</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {EVENTS.map(function(e){
                return <div key={e.label} style={{background:e.color+"11",border:"1px solid "+e.color+"33",borderRadius:8,padding:"4px 8px"}}><div style={{fontSize:7,fontWeight:700,color:e.color}}>{e.type}</div><div style={{fontSize:8,color:T1,fontWeight:500}}>{e.label}</div></div>;
              })}
            </div>
          </div>
          {/* Breaking News */}
          <div style={{padding:"10px 14px"}}>
            <div style={{fontSize:8,fontWeight:700,color:T3,marginBottom:8,letterSpacing:0.8}}>{t("breakingNews",lang).toUpperCase()}</div>
            {(news.length>0?news:NEWS_TICKER.map(function(t){return{title:t,source:"ET Markets"};})).slice(0,3).map(function(n,i){
              return <div key={i} style={{display:"flex",gap:8,marginBottom:8}}><div style={{width:4,height:4,borderRadius:"50%",background:i==0?DOWN:BLUE,marginTop:4,flexShrink:0}}></div><div style={{fontSize:10,color:T1,lineHeight:1.5}}>{n.title||n}</div></div>;
            })}
          </div>
        </div>

        {/* Top Gainers & Losers */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {/* Gainers */}
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,overflow:"hidden"}}>
            <div style={{background:"rgba(34,197,94,0.08)",padding:"7px 10px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:7,fontWeight:900,color:UP,letterSpacing:0.5}}>TOP GAINERS</span>
            </div>
            {GAINERS.slice(0,4).map(function(g){
              return (
                <div key={g.sym} style={{padding:"6px 10px",borderBottom:"1px solid rgba(30,58,95,0.4)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:9,fontWeight:700,color:T1}}>{g.sym}</div>
                    <div style={{fontSize:7,color:T3}}>{g.ltp ? g.ltp.toLocaleString("en-IN",{maximumFractionDigits:2}) : "--"}</div>
                  </div>
                  <div style={{fontSize:9,fontWeight:800,color:UP}}>+{g.pct}%</div>
                </div>
              );
            })}
          </div>
          {/* Losers */}
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:14,overflow:"hidden"}}>
            <div style={{background:"rgba(239,68,68,0.08)",padding:"7px 10px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:7,fontWeight:900,color:DOWN,letterSpacing:0.5}}>TOP LOSERS</span>
            </div>
            {LOSERS.slice(0,4).map(function(l){
              return (
                <div key={l.sym} style={{padding:"6px 10px",borderBottom:"1px solid rgba(30,58,95,0.4)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:9,fontWeight:700,color:T1}}>{l.sym}</div>
                    <div style={{fontSize:7,color:T3}}>{l.ltp ? l.ltp.toLocaleString("en-IN",{maximumFractionDigits:2}) : "--"}</div>
                  </div>
                  <div style={{fontSize:9,fontWeight:800,color:DOWN}}>{l.pct}%</div>
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
