import { useState, useEffect } from "react";
import { t } from "../i18n/translations";
import HomeLearnCards from "./HomeLearnCards";
import LearnTopicPage from "./LearnTopicPage";
import MorningPulse from "./MorningPulse";
import { useStreak } from "../hooks/useStreak";
import MarketMoodCard from "./MarketMoodCard";
import DynamicBriefingCard from "./DynamicBriefingCard";
import { useMarketMood } from "../hooks/useMarketMood";
import { useWatchlist } from "../hooks/useWatchlist";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../theme/ThemeProvider";
import OptionsIntel from "./OptionsIntel";
import FuturesIntel from "./FuturesIntel";
import OptionsIntelPage from "./OptionsIntelPage";
import HomeQuickTools from "./HomeQuickTools";
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
  var BLUE=theme.c.blue, BLUE=theme.c.blue, PROBLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down, BLUE=theme.c.blue;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab=props.setTab||function(){};
  var isPrem=props.isPrem||false;
  var mm = useMarketMood(); // single Market Mood polling source for this tree
  var wl = useWatchlist();
  var responsive = useResponsive();
  var [showBriefing,setShowBriefing]=useState(false);
  var [tickerIdx,setTickerIdx]=useState(0);
  var [selArticle,setSelArticle]=useState(null);
  var [showOptions,setShowOptions]=useState(false);
  var [learnTopic,setLearnTopic]=useState(props.initialLearnTopic || null);
  var streakData=useStreak();
  var isEvening=new Date().getHours()>=16;

  useEffect(function(){
    var tk=setInterval(function(){setTickerIdx(function(i){return (i+1)%TICKER.length;});},10000);
    return function(){clearInterval(tk);};
  },[]);

  if(showOptions) return <OptionsIntelPage symbol="NIFTY" onBack={function(){setShowOptions(false);}}/>;
  if(learnTopic) return <LearnTopicPage id={learnTopic} setTab={setTab} onOpenAcademy={props.onOpenAcademy} onBack={function(){setLearnTopic(null); if(props.onLearnTopicConsumed){props.onLearnTopicConsumed();}}}/>;
  if(selArticle) return (
    <ArticlePage
      article={selArticle}
      onBack={function(){setSelArticle(null);}}
      onOpen={function(n){setSelArticle(n);}}
      setTab={setTab}
    />
  );
  if(showBriefing) return (
    <div style={{background:BG,minHeight:"100vh"}}>
      <div style={{padding:"16px 16px 0"}}>
        <button onClick={function(){setShowBriefing(false);}} style={{background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:10,width:44,height:44,color:T1,fontSize:14,cursor:"pointer"}}>&#8592;</button>
      </div>
      <MorningPulse setTab={setTab}/>
    </div>
  );

  var zonesPreview = (function(){
    var niftyLtp = (mm.data && mm.data.indices && mm.data.indices.NIFTY && mm.data.indices.NIFTY.ltp) || 24500;
    var candles = generateDemoCandles(niftyLtp, 60, "NIFTY");
    return analyzeZones(candles);
  })();

  // Shared compact-card shell used by every Home section below, so every
  // card gets the exact same look, spacing, and "View Details" behavior.
  function SummaryCard(p){
    return (
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:p.noHeaderGap?0:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {p.icon ? <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:p.icon}}/> : null}
            <span style={{fontSize:14,fontWeight:800,color:T1}}>{p.title}</span>
          </div>
          {p.onDetails ? (
            <button onClick={p.onDetails} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44,padding:"0 2px",flexShrink:0}}>View Details &#8594;</button>
          ) : null}
        </div>
        {p.children}
      </div>
    );
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:84,color:T1}}>

      {/* HEADER */}
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
            {/* 1. MARKET STATUS */}
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
            <button onClick={function(){setTab("profile");}} style={{background:"none",border:"none",padding:4,cursor:"pointer",minWidth:44,minHeight:44}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* JUST IN - Moneycontrol style red ticker, 10s auto rotate, tap to full article */}
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

      {/* Every section below is a compact SummaryCard with a View Details
          button - nothing expands inline on Home. Mobile: single column,
          fast-scrolling, no oversized cards. Tablet/Desktop: the same cards
          reflow into a dense multi-column dashboard via auto-fit, never a
          fixed pixel-column count. */}
      <div style={{display:"grid",gridTemplateColumns:responsive.isMobile?"1fr":"repeat(auto-fit, minmax(300px, 1fr))",gap:12,padding:"12px 14px 0",alignItems:"start"}}>

        {/* 2. AI MORNING BRIEF - existing compact card, existing expand mechanism preserved */}
        <DynamicBriefingCard mm={mm}/>

        {/* 3. AI MARKET MOOD - existing compact card, own built-in Details modal preserved */}
        <MarketMoodCard mm={mm} setTab={setTab}/>

        {/* 4. NIFTY | SENSEX | BANKNIFTY | INDIA VIX */}
        <div style={{gridColumn:"1 / -1"}}>
          <SummaryCard title="Market Indices" onDetails={function(){setTab("markets");}}>
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
                <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:10}}>
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

        {/* 5. TODAY'S KEY LEVELS - Support & Resistance, reuses the existing
            Price Action Zones analysis (same engine as the pazones screen -
            candles seeded from the real live NIFTY price, not random). */}
        <SummaryCard title="Today's Key Levels" icon="&#128200;" onDetails={function(){setTab("pazones");}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:8}}>
            <div>
              <div style={{fontSize:11,color:T2,marginBottom:2}}>S1 (Support)</div>
              <div style={{fontSize:14,fontWeight:800,color:UP}}>{zonesPreview.support?("Rs "+zonesPreview.support.price):"--"}</div>
            </div>
            <div>
              <div style={{fontSize:11,color:T2,marginBottom:2}}>R1 (Resistance)</div>
              <div style={{fontSize:14,fontWeight:800,color:DOWN}}>{zonesPreview.resistance?("Rs "+zonesPreview.resistance.price):"--"}</div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
            <span style={{color:T2}}>Trend: <span style={{fontWeight:700,color:T1}}>{zonesPreview.trend}</span></span>
            <span style={{color:T2}}>Strength: <span style={{fontWeight:700,color:T1}}>{zonesPreview.support?zonesPreview.support.strength:"--"}</span></span>
          </div>
        </SummaryCard>

        {/* 6. BREAKOUT SCANNER - compact teaser, links to the one real Scanner */}
        <SummaryCard title="Breakout Scanner" icon="&#128269;" onDetails={function(){setTab("scan");}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Live breakout, RSI, VWAP, Supertrend and 12 more scan categories. Tap to run a scan.</div>
        </SummaryCard>

        {/* 7. LATEST ALERTS - compact teaser, links to the one real Alerts screen */}
        <SummaryCard title="Latest Alerts" icon="&#128276;" onDetails={function(){setTab("alerts");}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Price, volume, RSI, MACD, options and AI signal alerts in one feed.</div>
        </SummaryCard>

        {/* 8/9. TOP GAINERS + TOP LOSERS */}
        <SummaryCard title="Top Gainers" icon="&#128200;" onDetails={function(){setTab("markets");}}>
          {GAINERS.slice(0,3).map(function(s){
            return (
              <div key={s.sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0"}}>
                <span style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</span>
                <span style={{fontSize:12,fontWeight:700,color:UP}}>+{s.pct}%</span>
              </div>
            );
          })}
        </SummaryCard>
        <SummaryCard title="Top Losers" icon="&#128201;" onDetails={function(){setTab("markets");}}>
          {LOSERS.slice(0,3).map(function(s){
            return (
              <div key={s.sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0"}}>
                <span style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</span>
                <span style={{fontSize:12,fontWeight:700,color:DOWN}}>{s.pct}%</span>
              </div>
            );
          })}
        </SummaryCard>

        {/* FUTURES INTELLIGENCE - existing feature, kept using its own built-in compact card + expand (not in the numbered priority list, but preserved per "keep all existing features") */}
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
          <FuturesIntel symbol="NIFTY"/>
        </div>

        {/* 10. FII/DII FLOW - compact teaser, links to the one real screen */}
        <SummaryCard title="FII / DII Flow" icon="&#128176;" onDetails={function(){setTab("fiidiipro");}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Institutional buy/sell trends - see today's flow and recent history.</div>
        </SummaryCard>

        {/* 11. MARKET HEATMAP */}
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

        {/* 12. TODAY'S EVENTS - compact teaser, links to the one real Economic Calendar */}
        <SummaryCard title="Today's Events" icon="&#128197;" onDetails={function(){setTab("econcalendar");}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>RBI, Fed, CPI, earnings and expiry dates - see the full calendar.</div>
        </SummaryCard>

        {/* 13. OPTIONS INTELLIGENCE - existing compact card, own expand mechanism preserved */}
        <div style={{gridColumn:responsive.isMobile?"1 / -1":"auto",background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
          <OptionsIntel symbol="NIFTY" onOpen={function(){setShowOptions(true);}}/>
        </div>

        {/* WATCHLIST PREVIEW - real symbols only, no prices, owner page is Watchlist.jsx */}
        <SummaryCard title="Watchlist" onDetails={function(){setTab("watchlist");}}>
          {!wl.hasStoredWatchlist ? (
            <div style={{fontSize:12,color:T2}}>No watchlist symbols added yet</div>
          ) : wl.list.length==0 ? (
            <div style={{fontSize:12,color:T2}}>Your watchlist is empty</div>
          ) : (
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {wl.list.slice(0,4).map(function(sym){
                return <span key={sym} style={{fontSize:12,fontWeight:700,color:T1,background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"6px 10px"}}>{sym}</span>;
              })}
            </div>
          )}
        </SummaryCard>

        {/* NEWS - always full width (reads better as a list) */}
        <div style={{gridColumn:"1 / -1"}}>
          <SummaryCard title={t("top_news")} onDetails={function(){setTab("news");}} noHeaderGap={false}>
            <div style={{marginTop:-4}}>
              {JUSTIN.slice(0,4).map(function(n,i){
                var ic=n.impact=="Bullish"?UP:n.impact=="Bearish"?DOWN:T2;
                return (
                  <div key={n.id} onClick={function(){setSelArticle(n);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:i>0?"1px solid "+BD:"none",cursor:"pointer"}}>
                    <div style={{width:3,height:28,background:ic,borderRadius:2,flexShrink:0,opacity:0.8}}></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:T1,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{n.headline}</div>
                      <div style={{fontSize:11,color:T3,marginTop:3}}>{n.source}  &#8226;  {n.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SummaryCard>
        </div>

        {/* LEARN AND INVEST - always full width (its own internal card row) */}
        <div style={{gridColumn:"1 / -1"}}>
          <HomeLearnCards setTab={setTab} onTopic={function(id){setLearnTopic(id);}}/>
        </div>

        {/* QUICK TOOLS - always full width (its own internal card row) */}
        <div style={{gridColumn:"1 / -1"}}>
          <HomeQuickTools setTab={setTab}/>
        </div>

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
