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

var BG="#050505",CARD="#101318",BD="#20242D";
var BLUE="#3B82F6",CYAN="#60A5FA",PROBLUE="#60A5FA";
var UP="#1B5E20",DOWN="#EF4444",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

var TICKER=JUSTIN.map(function(n){return n.headline;});

export default function EquityHome(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG=theme.c.bg, CARD=theme.c.card, BD=theme.c.border;
  var BLUE=theme.c.blue, CYAN=theme.c.blue, PROBLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down, BLUE=theme.c.gold;
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
  var [learnTopic,setLearnTopic]=useState(null);
  var streakData=useStreak();
  var isEvening=new Date().getHours()>=16;

  useEffect(function(){
    var tk=setInterval(function(){setTickerIdx(function(i){return (i+1)%TICKER.length;});},10000);
    return function(){clearInterval(tk);};
  },[]);

  if(showOptions) return <OptionsIntelPage symbol="NIFTY" onBack={function(){setShowOptions(false);}}/>;
  if(learnTopic) return <LearnTopicPage id={learnTopic} setTab={setTab} onBack={function(){setLearnTopic(null);}}/>;
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
          <span key={tickerIdx} style={{fontSize:12,color:"#E8EAED",fontWeight:600,lineHeight:1.35,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",animation:"ticker-fade 0.4s ease"}}>{TICKER[tickerIdx]}</span>
        </div>
        <span style={{fontSize:14,color:T3,display:"flex",alignItems:"center",paddingRight:12,flexShrink:0}}>&#8250;</span>
      </div>

      {/* STAGE 1 TABLET REFLOW - md only, 2 columns. xs/sm/lg/xl/xxl/tv/tv4k stay 1 column (unchanged behavior). */}
      <div style={{display:"grid",gridTemplateColumns:responsive.isTablet?"1fr 1fr":"1fr",gap:"16px 16px"}}>

        {/* DYNAMIC AI BRIEFING - session-aware, reuses the same mm object below */}
        <div style={{gridColumn:"1 / -1"}}>
          <DynamicBriefingCard mm={mm}/>
        </div>

        {/* TODAY'S GAME PLAN - 30 second market mood */}
        <div style={{gridColumn:"1 / -1",marginTop:-4}}>
          <MarketMoodCard mm={mm} setTab={setTab}/>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{gridColumn:"1 / -1",display:"flex",gap:8,padding:"12px 16px 0"}}>
          {[["Scanner","scan","&#128269;"],["Watchlist","watchlist","&#11088;"],["Alerts","alerts","&#128276;"],["News","news","&#128240;"]].map(function(q){
            return (
              <button key={q[1]} onClick={function(){setTab(q[1]);}} style={{flex:1,background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"12px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>
                <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:q[2]}}/>
                <span style={{fontSize:12,fontWeight:700,color:T2}}>{q[0]}</span>
              </button>
            );
          })}
        </div>

        {/* MARKET DASHBOARD - real snapshot from the shared mm object, preview only */}
        <div style={{padding:"12px 0 0",alignSelf:"start"}}>
          <div style={{padding:"0 14px 6px"}}>
            <span style={{fontSize:12,fontWeight:800,color:T1}}>Market Dashboard</span>
          </div>
          {(function(){
            var idxData = mm.data && mm.data.indices;
            if(mm.status=="error" && !mm.data){
              return <div style={{padding:"0 14px",fontSize:12,color:DOWN}}>Market snapshot temporarily unavailable</div>;
            }
            if(mm.status=="offline" && !mm.data){
              return <div style={{padding:"0 14px",fontSize:12,color:T2}}>You are offline</div>;
            }
            if(mm.status=="loading" && !mm.data){
              return <div style={{padding:"0 14px",fontSize:12,color:T2}}>Loading market snapshot...</div>;
            }
            if(!mm.data){
              return <div style={{padding:"0 14px",fontSize:12,color:T2}}>Market snapshot unavailable</div>;
            }
            var rows = [
              {key:"NIFTY",label:"NIFTY 50"},
              {key:"BANKNIFTY",label:"BANK NIFTY"},
              {key:"SENSEX",label:"SENSEX"}
            ].map(function(r){
              var e = idxData && idxData[r.key];
              if(!e || e.ltp==null) return null;
              var ltpOk = typeof e.ltp=="number" && isFinite(e.ltp);
              var chgNum = Number(e.chgPct);
              var chgOk = e.chgPct!=null && isFinite(chgNum);
              var dir = "neutral";
              if(chgOk){ if(chgNum>0) dir="up"; else if(chgNum<0) dir="down"; }
              return Object.assign({},r,{
                ltp: ltpOk ? e.ltp : null,
                chgPct: chgOk ? chgNum : null,
                dir: dir,
                freshness: e.freshness && e.freshness.status
              });
            }).filter(function(x){return x;});
            if(rows.length==0){
              return <div style={{padding:"0 14px",fontSize:12,color:T2}}>Market snapshot unavailable</div>;
            }
            return (
              <div style={{display:"flex",gap:12,overflowX:"auto",padding:"0 14px 4px",WebkitOverflowScrolling:"touch"}}>
                {rows.map(function(r){
                  var color = r.dir=="up"?UP:(r.dir=="down"?DOWN:T2);
                  return (
                    <div key={r.key} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:"12px",flexShrink:0,minWidth:120}}>
                      <div style={{fontSize:12,color:T2,marginBottom:4,fontWeight:600}}>{r.label}</div>
                      <div style={{fontSize:16,fontWeight:800,color:T1,fontFamily:"monospace",marginBottom:4}}>{r.ltp!=null?r.ltp.toLocaleString("en-IN",{maximumFractionDigits:2}):"--"}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:12,fontWeight:700,color:color}}>{r.chgPct!=null?((r.dir=="up"?"+":"")+r.chgPct+"%"):"--"}</span>
                        {r.freshness ? <span style={{fontSize:12,color:T3,fontWeight:700}}>{r.freshness}</span> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* OPTIONS INTELLIGENCE - hero premium feature */}
        <div style={{alignSelf:"start"}}>
          <OptionsIntel symbol="NIFTY" onOpen={function(){setShowOptions(true);}}/>
        </div>

      </div>

      {/* FUTURES INTELLIGENCE */}
      <div style={{marginTop:16}}>
        <FuturesIntel symbol="NIFTY"/>
      </div>

      {/* WATCHLIST PREVIEW - real symbols only, no prices, owner page is Watchlist.jsx */}
      <div style={{marginTop:16,padding:"0 14px"}}>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:14,fontWeight:800,color:T1}}>Watchlist</span>
              {wl.hasStoredWatchlist && wl.list.length>0 ? (
                <span style={{fontSize:12,color:T3}}>({wl.list.length})</span>
              ) : null}
            </div>
            <button onClick={function(){setTab("watchlist");}} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44,padding:"0 4px"}}>View All &#8594;</button>
          </div>
          {!wl.hasStoredWatchlist ? (
            <div style={{fontSize:12,color:T2}}>No watchlist symbols added yet</div>
          ) : wl.list.length==0 ? (
            <div style={{fontSize:12,color:T2}}>Your watchlist is empty</div>
          ) : (
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {wl.list.slice(0,4).map(function(sym){
                return <span key={sym} style={{fontSize:12,fontWeight:700,color:T1,background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"8px 12px"}}>{sym}</span>;
              })}
            </div>
          )}
        </div>
      </div>

      {/* LEARN AND INVEST */}
      <div style={{marginTop:16}}>
        <HomeLearnCards setTab={setTab} onTopic={function(id){setLearnTopic(id);}}/>
      </div>

      {/* LIVE MARKET NEWS - top 5 clean cards */}
      <div style={{marginTop:16,padding:"0 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <span style={{fontSize:14,fontWeight:800,color:T1}}>{t("top_news")}</span>
          <button onClick={function(){setTab("news");}} style={{background:"none",border:"none",color:CYAN,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44,padding:"0 4px"}}>View All &#8594;</button>
        </div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden"}}>
          {JUSTIN.slice(0,5).map(function(n,i){
            var ic=n.impact=="Bullish"?UP:n.impact=="Bearish"?DOWN:T2;
            return (
              <div key={n.id} onClick={function(){setSelArticle(n);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<4?"1px solid "+BD:"none",cursor:"pointer"}}>
                <div style={{width:3,height:34,background:ic,borderRadius:2,flexShrink:0,opacity:0.8}}></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:T1,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{n.headline}</div>
                  <div style={{fontSize:12,color:T3,marginTop:4}}>{n.source}  &#8226;  {n.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK TOOLS */}
      <div style={{marginTop:16}}>
        <HomeQuickTools setTab={setTab}/>
      </div>

      <div style={{height:24}}></div>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0}to{opacity:1}}"}</style>
    </div>
  );
}

// Auto market-status badge: Open / Pre-Market / Post-Market / Closed.
function MarketBadge(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, BLUE = theme.c.gold;

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
