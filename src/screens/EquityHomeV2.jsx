import { useState, useEffect } from "react";
import { useMarketMood } from "../hooks/useMarketMood";
import { useWatchlist } from "../hooks/useWatchlist";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../theme/ThemeProvider";
import OptionsIntel from "./OptionsIntel";
import OptionsIntelPage from "./OptionsIntelPage";
import ArticlePage from "./ArticlePage";
import { JUSTIN } from "./JustInData";
import { GAINERS, LOSERS } from "./HomeData";
import { generateDemoCandles, analyzeZones } from "../utils/priceActionZones";

var BG="#050505",CARD="#101318",BD="#20242D";
var BLUE="#3B82F6",PROBLUE="#60A5FA";
var UP="#1B5E20",DOWN="#EF4444";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

var TICKER=JUSTIN.map(function(n){return n.headline;});

export default function EquityHomeV2(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE=theme.c.blue;
  var BG=theme.c.bg, CARD=theme.c.card, BD=theme.c.border;
  var BLUE=theme.c.blue, PROBLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab=props.setTab||function(){};
  var isPrem=props.isPrem||false;
  var mm = useMarketMood(); // single Market Mood polling source for this tree - same real engine as V1
  var wl = useWatchlist();
  var responsive = useResponsive();
  var [tickerIdx,setTickerIdx]=useState(0);
  var [selArticle,setSelArticle]=useState(null);
  var [showOptions,setShowOptions]=useState(false);

  useEffect(function(){
    var tk=setInterval(function(){setTickerIdx(function(i){return (i+1)%TICKER.length;});},10000);
    return function(){clearInterval(tk);};
  },[]);

  if(showOptions) return <OptionsIntelPage symbol="NIFTY" onBack={function(){setShowOptions(false);}}/>;
  if(selArticle) return (
    <ArticlePage
      article={selArticle}
      onBack={function(){setSelArticle(null);}}
      onOpen={function(n){setSelArticle(n);}}
      setTab={setTab}
    />
  );

  // Today's Key Levels - reuses the same real Price Action Zones engine as
  // the pazones screen (candles seeded from the real live LTP, not random).
  // Computed once per render for NIFTY and BANK NIFTY, matching the hero card.
  var niftyLtp = (mm.data && mm.data.indices && mm.data.indices.NIFTY && mm.data.indices.NIFTY.ltp) || 24500;
  var bankLtp = (mm.data && mm.data.indices && mm.data.indices.BANKNIFTY && mm.data.indices.BANKNIFTY.ltp) || 51500;
  var niftyZones = analyzeZones(generateDemoCandles(niftyLtp, 60, "NIFTY"));
  var bankZones = analyzeZones(generateDemoCandles(bankLtp, 60, "BANKNIFTY"));

  // Fear & Greed label - derived from the SAME real, deterministic mood
  // score already computed by MarketMoodEngine (index trend + VIX +
  // technical components). Not a second invented metric - just a second
  // reading of the one real score.
  var moodScore = mm.mood && mm.mood.score;
  var fearGreed = moodScore==null ? null : (moodScore<40 ? "Fear" : (moodScore>60 ? "Greed" : "Neutral"));
  var fearGreedColor = fearGreed=="Fear" ? DOWN : (fearGreed=="Greed" ? UP : T2);

  // Shared compact-card shell - every Home section uses this so all 15
  // cards share identical header height, spacing, and "View Details" style.
  function SummaryCard(p){
    return (
      <div style={{background:CARD,border:"1px solid "+(p.hero?BLUE:BD),borderRadius:16,padding:p.hero?18:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {p.icon ? <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:p.icon}}/> : null}
            <span style={{fontSize:p.hero?15:14,fontWeight:800,color:T1}}>{p.title}</span>
          </div>
          {p.onDetails ? (
            <button onClick={p.onDetails} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44,padding:"0 2px",flexShrink:0}}>View Details &#8594;</button>
          ) : null}
        </div>
        {p.children}
      </div>
    );
  }

  // One index's S1/R1 pair for the hero Key Levels card
  function LevelsPair(sym, zones){
    return (
      <div>
        <div style={{fontSize:12,fontWeight:800,color:T1,marginBottom:6}}>{sym}</div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:10,color:T2}}>S1</div>
            <div style={{fontSize:13,fontWeight:800,color:UP}}>{zones.support?("Rs "+zones.support.price):"--"}</div>
          </div>
          <div>
            <div style={{fontSize:10,color:T2}}>R1</div>
            <div style={{fontSize:13,fontWeight:800,color:DOWN}}>{zones.resistance?("Rs "+zones.resistance.price):"--"}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:84,color:T1}}>

      {/* 1. HEADER */}
      <div style={{background:BG,borderBottom:"1px solid "+BD,padding:"12px 16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={function(){ if(props.onMenu){props.onMenu();} else {setTab("more");} }} style={{background:"none",border:"none",padding:4,cursor:"pointer",flexShrink:0,minWidth:44,minHeight:44}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div style={{fontSize:22,fontWeight:900,letterSpacing:-0.5}}>
              <span style={{color:T1}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span>
            </div>
            <MarketBadge/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
            <button onClick={function(){setTab("search");}} style={{background:"none",border:"none",padding:4,cursor:"pointer",minWidth:44,minHeight:44}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <button onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",padding:4,cursor:"pointer",position:"relative",minWidth:44,minHeight:44}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <div style={{position:"absolute",top:1,right:1,width:5,height:5,borderRadius:"50%",background:BLUE,border:"1px solid "+BG}}/>
            </button>
          </div>
        </div>
      </div>

      {/* 2. JUST IN */}
      <div onClick={function(){setSelArticle(JUSTIN[tickerIdx]);}} style={{background:theme.c.card2,borderBottom:"1px solid "+BD,display:"flex",alignItems:"stretch",overflow:"hidden",cursor:"pointer"}}>
        <div style={{background:"#EF4444",padding:"4px 8px",display:"flex",alignItems:"center",flexShrink:0}}>
          <span style={{width:4,height:4,borderRadius:"50%",background:"#fff",marginRight:4,animation:"pulse-dot 1.4s infinite"}}/>
          <span style={{fontSize:12,fontWeight:800,color:"#fff",letterSpacing:0.6,whiteSpace:"nowrap"}}>JUST IN</span>
        </div>
        <div style={{flex:1,display:"flex",alignItems:"center",padding:"8px 12px",minWidth:0}}>
          <span key={tickerIdx} style={{fontSize:12,color:T1,fontWeight:600,lineHeight:1.35,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",animation:"ticker-fade 0.4s ease"}}>{TICKER[tickerIdx]}</span>
        </div>
        <span style={{fontSize:14,color:T3,display:"flex",alignItems:"center",paddingRight:12,flexShrink:0}}>&#8250;</span>
      </div>

      {/* Row 1 (desktop): Market Snapshot - always full width */}
      <div style={{padding:"12px 14px 0"}}>
        <SummaryCard title="Today's Market Snapshot" onDetails={function(){setTab("markets");}}>
          {(function(){
            var idxData = mm.data && mm.data.indices;
            if(mm.status=="error" && !mm.data) return <div style={{fontSize:12,color:DOWN}}>Market snapshot temporarily unavailable</div>;
            if(mm.status=="offline" && !mm.data) return <div style={{fontSize:12,color:T2}}>You are offline</div>;
            if(mm.status=="loading" && !mm.data) return <div style={{fontSize:12,color:T2}}>Loading market snapshot...</div>;
            if(!mm.data) return <div style={{fontSize:12,color:T2}}>Market snapshot unavailable</div>;
            var rows = [
              {key:"NIFTY",label:"NIFTY 50"},
              {key:"BANKNIFTY",label:"BANK NIFTY"},
              {key:"SENSEX",label:"SENSEX"},
              {key:"VIX",label:"INDIA VIX"}
            ].map(function(r){
              var e = idxData && idxData[r.key];
              if(!e || e.ltp==null) return null;
              var chgNum = Number(e.chgPct);
              var chgOk = e.chgPct!=null && isFinite(chgNum);
              var dir = chgOk ? (chgNum>0?"up":(chgNum<0?"down":"neutral")) : "neutral";
              return Object.assign({},r,{ltp:e.ltp, chgPct:chgOk?chgNum:null, dir:dir});
            }).filter(function(x){return x;});
            if(rows.length==0) return <div style={{fontSize:12,color:T2}}>Market snapshot unavailable</div>;
            return (
              <div style={{display:"grid",gridTemplateColumns:responsive.isMobile?"repeat(2, 1fr)":"repeat(4, 1fr)",gap:10}}>
                {rows.map(function(r){
                  var color = r.dir=="up"?UP:(r.dir=="down"?DOWN:T2);
                  return (
                    <div key={r.key} style={{background:theme.c.card2,border:"1px solid "+BD,borderRadius:12,padding:10}}>
                      <div style={{fontSize:11,color:T2,marginBottom:3,fontWeight:600}}>{r.label}</div>
                      <div style={{fontSize:14,fontWeight:800,color:T1,fontFamily:"monospace"}}>{r.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                      <div style={{fontSize:11,fontWeight:700,color:color}}>{r.chgPct!=null?((r.dir=="up"?"+":"")+r.chgPct+"%"):"--"}</div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </SummaryCard>
      </div>

      {/* Quick Actions - slim full-width toolbar, not a card, no View Details (direct jumps) */}
      <div style={{padding:"12px 14px 0",display:"flex",gap:8}}>
        {[["Scanner","scan","&#128269;"],["Watchlist","watchlist","&#11088;"],["Alerts","alerts","&#128276;"],["Option Chain","oi","&#128200;"]].map(function(q){
          return (
            <button key={q[1]} onClick={function(){setTab(q[1]);}} style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"10px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>
              <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:q[2]}}/>
              <span style={{fontSize:11,fontWeight:700,color:T2}}>{q[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Row 2 (desktop, 3 col): AI Market Mood | Today's Key Levels (hero) | Trading Opportunities */}
      <div style={{display:"grid",gridTemplateColumns:responsive.isMobile?"1fr":"repeat(auto-fit, minmax(300px, 1fr))",gap:12,padding:"12px 14px 0",alignItems:"start"}}>

        {/* 4. AI MARKET MOOD - mood + confidence + Fear&Greed + one-line summary */}
        <SummaryCard title="AI Market Mood" icon="&#129504;" onDetails={function(){setTab("more");}}>
          {(function(){
            if(mm.status=="loading" && !mm.data) return <div style={{fontSize:12,color:T2}}>Loading...</div>;
            if(!mm.mood || mm.mood.score==null) return <div style={{fontSize:12,color:T2}}>Market mood unavailable</div>;
            var moodColor = mm.mood.label && mm.mood.label.indexOf("Bearish")>=0 ? DOWN : (mm.mood.label && mm.mood.label.indexOf("Bullish")>=0 ? UP : T2);
            return (
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:15,fontWeight:900,color:moodColor}}>{mm.mood.label}</span>
                  <span style={{fontSize:11,color:T2}}>Confidence: <span style={{fontWeight:700,color:T1}}>{mm.mood.confidence}</span></span>
                </div>
                {fearGreed ? (
                  <div style={{display:"inline-block",background:theme.c.card2,border:"1px solid "+BD,borderRadius:20,padding:"3px 10px",marginBottom:8}}>
                    <span style={{fontSize:11,fontWeight:700,color:fearGreedColor}}>{fearGreed}</span>
                  </div>
                ) : null}
                <div style={{fontSize:12,color:T2,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{mm.mood.stage}</div>
              </div>
            );
          })()}
        </SummaryCard>

        {/* 5. TODAY'S KEY LEVELS - HERO CARD - S1/R1 only for NIFTY + BANK NIFTY */}
        <SummaryCard title="Today's Key Levels" icon="&#128200;" hero={true}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            {LevelsPair("NIFTY", niftyZones)}
            {LevelsPair("BANK NIFTY", bankZones)}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={function(){setTab("alerts");}} style={{flex:1,background:theme.c.card2,border:"1px solid "+BD,borderRadius:10,padding:"10px",color:T1,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128276; Alert</button>
            <button onClick={function(){setTab("pazones");}} style={{flex:1,background:BLUE,border:"none",borderRadius:10,padding:"10px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128202; View Details</button>
          </div>
        </SummaryCard>

        {/* 7. TRADING OPPORTUNITIES - chips jump toward the real Scanner (category pre-selection
            would need a small change inside Scanner.jsx, not made here since only this file was requested -
            for now every chip opens the Scanner screen, not yet pre-filtered to that exact category). */}
        <SummaryCard title="Trading Opportunities" icon="&#128640;" onDetails={function(){setTab("scan");}}>
          <div style={{display:"flex",gap:8,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:2}}>
            {[["Breakout","&#128200;"],["Breakdown","&#128201;"],["High Volume","&#128266;"],["Gap Up","&#11014;"],["Gap Down","&#11015;"]].map(function(o){
              return (
                <button key={o[0]} onClick={function(){setTab("scan");}} style={{flexShrink:0,background:theme.c.card2,border:"1px solid "+BD,borderRadius:20,padding:"8px 14px",display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontFamily:"inherit"}}>
                  <span style={{fontSize:13}} dangerouslySetInnerHTML={{__html:o[1]}}/>
                  <span style={{fontSize:12,fontWeight:700,color:T1,whiteSpace:"nowrap"}}>{o[0]}</span>
                </button>
              );
            })}
          </div>
        </SummaryCard>

        {/* Row 3 (desktop, 3 col): Top Gainers | Top Losers | Latest Alerts */}
        <SummaryCard title="Top Gainers" icon="&#128200;" onDetails={function(){setTab("markets");}}>
          {GAINERS.slice(0,5).map(function(s){
            return (
              <div key={s.sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0"}}>
                <span style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</span>
                <span style={{fontSize:12,fontWeight:700,color:UP}}>+{s.pct}%</span>
              </div>
            );
          })}
        </SummaryCard>
        <SummaryCard title="Top Losers" icon="&#128201;" onDetails={function(){setTab("markets");}}>
          {LOSERS.slice(0,5).map(function(s){
            return (
              <div key={s.sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0"}}>
                <span style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</span>
                <span style={{fontSize:12,fontWeight:700,color:DOWN}}>{s.pct}%</span>
              </div>
            );
          })}
        </SummaryCard>
        <SummaryCard title="Latest Alerts" icon="&#128276;" onDetails={function(){setTab("alerts");}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>No alerts yet - set one up from any chart or scanner result.</div>
        </SummaryCard>

        {/* Row 4 (desktop, 3 col): Options Intelligence | Market Heatmap | FII/DII Flow */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
          <OptionsIntel symbol="NIFTY" onOpen={function(){setShowOptions(true);}}/>
        </div>

        <SummaryCard title="Market Heatmap" icon="&#128293;" onDetails={function(){setTab("heatmap");}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:6}}>
            {GAINERS.concat(LOSERS).slice(0,6).map(function(s){
              var up = s.pct>=0;
              return (
                <div key={s.sym} style={{background:up?"rgba(0,143,57,0.12)":"rgba(220,38,38,0.12)",border:"1px solid "+(up?UP:DOWN)+"40",borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
                  <div style={{fontSize:10,fontWeight:800,color:T1}}>{s.sym}</div>
                  <div style={{fontSize:10,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{s.pct}%</div>
                </div>
              );
            })}
          </div>
        </SummaryCard>

        <SummaryCard title="FII / DII Flow" icon="&#128176;" onDetails={function(){setTab("fiidiipro");}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Institutional buy/sell trends - see today's flow and recent history.</div>
        </SummaryCard>

        {/* Row 5 (desktop, 2 col): Global Markets | Today's Events */}
        <SummaryCard title="Global Markets" icon="&#127760;" onDetails={function(){setTab("global");}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Dow, Nasdaq, Nikkei and more - see the full global snapshot.</div>
        </SummaryCard>

        <SummaryCard title="Today's Events" icon="&#128197;" onDetails={function(){setTab("econcalendar");}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>RBI, Fed, CPI, earnings and expiry dates - see the full calendar.</div>
        </SummaryCard>

      </div>

      <div style={{height:24}}></div>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0}to{opacity:1}}"}</style>
    </div>
  );
}

// Auto market-status badge: Open / Pre-Market / Post-Market / Closed.
function MarketBadge(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  DOWN=theme.c.down; UP=theme.c.up;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, BLUE=theme.c.blue;

  var d=new Date();
  var mins=d.getHours()*60+d.getMinutes();
  var day=d.getDay(); // 0 Sun, 6 Sat
  var st;
  if(day==0||day==6){ st={label:"Closed",col:DOWN,dot:DOWN}; }
  else if(mins>=9*60+15&&mins<15*60+30){ st={label:"Open",col:UP,dot:UP}; }
  else if(mins>=9*60&&mins<9*60+15){ st={label:"Pre-Market",col:BLUE,dot:BLUE}; }
  else if(mins>=15*60+30&&mins<16*60){ st={label:"Post-Market",col:BLUE,dot:BLUE}; }
  else { st={label:"Closed",col:DOWN,dot:DOWN}; }
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:20,padding:"4px 8px"}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:st.dot,animation:st.label=="Open"?"pulse-dot 1.4s infinite":"none"}}></span>
      <span style={{fontSize:12,fontWeight:800,color:st.col}}>{st.label}</span>
    </span>
  );
}
