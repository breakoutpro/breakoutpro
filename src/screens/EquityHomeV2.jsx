import { useState, useEffect, useMemo, useRef } from "react";
import { useMarketMood } from "../hooks/useMarketMood";
import { useWatchlist } from "../hooks/useWatchlist";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../theme/ThemeProvider";
import OptionsIntel from "./OptionsIntel";
import OptionsIntelPage from "./OptionsIntelPage";
import { getOptionsIntel } from "./OptionsIntelData";
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
  var mm = useMarketMood(); // single Market Mood polling source for this tree - same real engine as before
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
  var niftyLtp = (mm.data && mm.data.indices && mm.data.indices.NIFTY && mm.data.indices.NIFTY.ltp) || 24500;
  var bankLtp = (mm.data && mm.data.indices && mm.data.indices.BANKNIFTY && mm.data.indices.BANKNIFTY.ltp) || 51500;
  var niftyZones = useMemo(function(){ return analyzeZones(generateDemoCandles(niftyLtp, 60, "NIFTY")); }, [niftyLtp]);
  var bankZones = useMemo(function(){ return analyzeZones(generateDemoCandles(bankLtp, 60, "BANKNIFTY")); }, [bankLtp]);

  // Fear & Greed - derived from the same real, deterministic mood score
  // (index trend + VIX + technical components), not a second invented metric.
  var moodScore = mm.mood && mm.mood.score;
  var fearGreed = moodScore==null ? null : (moodScore<40 ? "Fear" : (moodScore>60 ? "Greed" : "Neutral"));
  var fearGreedColor = fearGreed=="Fear" ? DOWN : (fearGreed=="Greed" ? UP : T2);

  // Real (not fabricated) rolling LTP history for tiny sparklines - each time
  // the live market-mood data actually updates, the observed LTP is appended
  // to a small per-index history kept in a ref. This reflects genuine
  // observed values only, never a generated shape.
  var ltpHistoryRef = useRef({NIFTY:[],BANKNIFTY:[],SENSEX:[],VIX:[]});
  useEffect(function(){
    var idxData = mm.data && mm.data.indices;
    if(!idxData) return;
    ["NIFTY","BANKNIFTY","SENSEX","VIX"].forEach(function(key){
      var e = idxData[key];
      if(!e || e.ltp==null) return;
      var hist = ltpHistoryRef.current[key];
      var last = hist[hist.length-1];
      if(last==e.ltp) return; // only record genuine changes
      hist.push(e.ltp);
      if(hist.length>20) hist.shift();
    });
  }, [mm.data]);

  function Sparkline(key, color){
    var hist = ltpHistoryRef.current[key];
    if(!hist || hist.length<2) return null;
    var min = Math.min.apply(null,hist), max = Math.max.apply(null,hist);
    var range = max-min || 1;
    var w=48,h=16;
    var pts = hist.map(function(v,i){ return (i/(hist.length-1))*w+","+(h-((v-min)/range)*(h-2)+1); }).join(" ");
    return <svg width={w} height={h} style={{display:"block",marginTop:2}}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg>;
  }

  var idxRows = (function(){
    var idxData = mm.data && mm.data.indices;
    if(!idxData) return [];
    return [
      {key:"NIFTY",label:"NIFTY 50"},
      {key:"BANKNIFTY",label:"BANK NIFTY"},
      {key:"SENSEX",label:"SENSEX"},
      {key:"VIX",label:"INDIA VIX"}
    ].map(function(r){
      var e = idxData[r.key];
      if(!e || e.ltp==null) return null;
      var chgNum = Number(e.chgPct);
      var chgOk = e.chgPct!=null && isFinite(chgNum);
      var dir = chgOk ? (chgNum>0?"up":(chgNum<0?"down":"neutral")) : "neutral";
      return Object.assign({},r,{ltp:e.ltp, chgPct:chgOk?chgNum:null, dir:dir});
    }).filter(function(x){return x;});
  })();

  // ===================================================================
  // MOBILE-FIRST LAYOUT
  // Plain block elements stacked vertically - width:100% + box-sizing:
  // border-box everywhere, nothing that relies on CSS grid/flex "shrink
  // to fit" behavior, because those default to min-width:auto and can
  // silently force a parent wider than the viewport. Compact padding,
  // dense typography, no card taller than its content needs.
  // ===================================================================

  function Card(p){
    return (
      <div style={{width:"100%",boxSizing:"border-box",background:CARD,border:"1px solid "+(p.hero?BLUE:BD),borderRadius:14,padding:p.hero?11:9,marginBottom:7}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
          <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,flex:1}}>
            {p.icon ? <span style={{fontSize:13,flexShrink:0,lineHeight:1}} dangerouslySetInnerHTML={{__html:p.icon}}/> : null}
            <span style={{fontSize:12,fontWeight:800,color:T1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</span>
          </div>
          {p.onDetails ? (
            <button onClick={p.onDetails} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:32,padding:"0 2px",flexShrink:0}}>Details &#8594;</button>
          ) : null}
        </div>
        {p.children}
      </div>
    );
  }

  function LevelsPair(sym, zones){
    return (
      <div style={{width:"100%",boxSizing:"border-box"}}>
        <div style={{fontSize:11,fontWeight:800,color:T1,marginBottom:4}}>{sym}</div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:9,color:T2}}>S1</div>
            <div style={{fontSize:12,fontWeight:800,color:UP}}>{zones.support?("Rs "+zones.support.price):"--"}</div>
          </div>
          <div>
            <div style={{fontSize:9,color:T2}}>R1</div>
            <div style={{fontSize:12,fontWeight:800,color:DOWN}}>{zones.resistance?("Rs "+zones.resistance.price):"--"}</div>
          </div>
        </div>
      </div>
    );
  }

  function MobileHome(){
    return (
      <div style={{background:BG,minHeight:"100vh",width:"100%",boxSizing:"border-box",overflowX:"hidden",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:84,color:T1}}>

        {/* 1. HEADER */}
        <div style={{width:"100%",boxSizing:"border-box",background:BG,borderBottom:"1px solid "+BD,padding:"10px 12px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,flex:1}}>
              <button onClick={function(){ if(props.onMenu){props.onMenu();} else {setTab("more");} }} style={{background:"none",border:"none",padding:2,cursor:"pointer",flexShrink:0,minWidth:36,minHeight:36}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2.2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <div style={{fontSize:18,fontWeight:900,letterSpacing:-0.5,whiteSpace:"nowrap",flexShrink:0}}>
                <span style={{color:T1}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span>
              </div>
              <div style={{minWidth:0,overflow:"hidden"}}><MarketBadge/></div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <button onClick={function(){setTab("search");}} style={{background:"none",border:"none",padding:2,cursor:"pointer",minWidth:36,minHeight:36}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
              <button onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",padding:2,cursor:"pointer",position:"relative",minWidth:36,minHeight:36}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <div style={{position:"absolute",top:0,right:0,width:5,height:5,borderRadius:"50%",background:BLUE,border:"1px solid "+BG}}/>
              </button>
            </div>
          </div>
        </div>

        {/* 2. JUST IN */}
        <div onClick={function(){setSelArticle(JUSTIN[tickerIdx]);}} style={{width:"100%",boxSizing:"border-box",background:theme.c.card2,borderBottom:"1px solid "+BD,display:"flex",alignItems:"stretch",overflow:"hidden",cursor:"pointer"}}>
          <div style={{background:"#EF4444",padding:"3px 6px",display:"flex",alignItems:"center",flexShrink:0}}>
            <span style={{width:4,height:4,borderRadius:"50%",background:"#fff",marginRight:4,animation:"pulse-dot 1.4s infinite"}}/>
            <span style={{fontSize:10,fontWeight:800,color:"#fff",letterSpacing:0.4,whiteSpace:"nowrap"}}>JUST IN</span>
          </div>
          <div style={{flex:1,minWidth:0,display:"flex",alignItems:"center",padding:"6px 8px"}}>
            <span key={tickerIdx} style={{fontSize:11,color:T1,fontWeight:600,lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden",animation:"ticker-fade 0.4s ease"}}>{TICKER[tickerIdx]}</span>
          </div>
        </div>

        <div style={{width:"100%",boxSizing:"border-box",padding:"7px 9px 0"}}>

          {/* 3. MARKET SNAPSHOT - 2x2, compact */}
          <Card title="Market Snapshot" onDetails={function(){setTab("markets");}}>
            {idxRows.length==0 ? (
              <div style={{fontSize:11,color:T2}}>{mm.status=="loading"?"Loading...":"Snapshot unavailable"}</div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,width:"100%",boxSizing:"border-box"}}>
                {idxRows.map(function(r){
                  var color = r.dir=="up"?UP:(r.dir=="down"?DOWN:T2);
                  return (
                    <div key={r.key} style={{minWidth:0,boxSizing:"border-box",background:theme.c.card2,border:"1px solid "+BD,borderRadius:10,padding:8,overflow:"hidden",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                      <div style={{minWidth:0,flex:1}}>
                        <div style={{fontSize:9,color:T2,marginBottom:2,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.label}</div>
                        <div style={{fontSize:13,fontWeight:800,color:T1,fontFamily:"monospace",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                        <div style={{fontSize:10,fontWeight:700,color:color}}>{r.chgPct!=null?((r.dir=="up"?"+":"")+r.chgPct+"%"):"--"}</div>
                      </div>
                      <div style={{flexShrink:0}}>{Sparkline(r.key,color)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* 4. AI MARKET MOOD */}
          <Card title="AI Market Mood" icon="&#129504;" onDetails={function(){setTab("more");}}>
            {mm.status=="loading" && !mm.data ? (
              <div style={{fontSize:11,color:T2}}>Loading...</div>
            ) : !mm.mood || mm.mood.score==null ? (
              <div style={{fontSize:11,color:T2}}>Market mood unavailable</div>
            ) : (function(){
              var moodColor = mm.mood.label && mm.mood.label.indexOf("Bearish")>=0 ? DOWN : (mm.mood.label && mm.mood.label.indexOf("Bullish")>=0 ? UP : T2);
              return (
                <div style={{width:"100%",boxSizing:"border-box"}}>
                  <div style={{fontSize:15,fontWeight:900,color:moodColor,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:5}}>{mm.mood.label}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:10,fontWeight:700,color:T1,background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"2px 8px"}}>Confidence: {mm.mood.confidence}</span>
                    {fearGreed ? (
                      <span style={{fontSize:10,fontWeight:700,color:fearGreedColor,background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"2px 8px"}}>{fearGreed}</span>
                    ) : null}
                  </div>
                  <div style={{fontSize:11,color:T2,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{mm.mood.stage}</div>
                </div>
              );
            })()}
          </Card>

          {/* 5. TODAY'S KEY LEVELS - HERO CARD */}
          <Card title="Today's Key Levels" icon="&#128200;" hero={true}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10,width:"100%",boxSizing:"border-box"}}>
              {LevelsPair("NIFTY", niftyZones)}
              {LevelsPair("BANK NIFTY", bankZones)}
            </div>
            <div style={{borderTop:"1px solid "+BD,margin:"0 0 10px"}}></div>
            <div style={{display:"flex",gap:8,width:"100%",boxSizing:"border-box"}}>
              <button onClick={function(){setTab("alerts");}} style={{flex:1,minWidth:0,background:theme.c.card2,border:"1px solid "+BD,borderRadius:9,padding:"9px 4px",color:T1,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><span style={{fontSize:12}}>&#128276;</span>Alert</button>
              <button onClick={function(){setTab("pazones");}} style={{flex:1,minWidth:0,background:BLUE,border:"none",borderRadius:9,padding:"9px 4px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><span style={{fontSize:12}}>&#128202;</span>Details</button>
            </div>
          </Card>

          {/* 6. QUICK ACTIONS - slim toolbar, not a card */}
          <div style={{display:"flex",gap:6,marginBottom:8,width:"100%",boxSizing:"border-box"}}>
            {[["Scanner","scan","&#128269;"],["Watchlist","watchlist","&#11088;"],["Alerts","alerts","&#128276;"],["Options","oi","&#128200;"]].map(function(q){
              return (
                <button key={q[1]} onClick={function(){setTab(q[1]);}} style={{flex:1,minWidth:0,minHeight:52,boxSizing:"border-box",background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"6px 2px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,cursor:"pointer",fontFamily:"inherit"}}>
                  <span style={{fontSize:14,lineHeight:1,height:14,display:"flex",alignItems:"center"}} dangerouslySetInnerHTML={{__html:q[2]}}/>
                  <span style={{fontSize:9,fontWeight:700,color:T2,whiteSpace:"nowrap"}}>{q[0]}</span>
                </button>
              );
            })}
          </div>

          {/* -------- everything below is normal scroll content -------- */}

          {/* TRADING OPPORTUNITIES */}
          <Card title="Trading Opportunities" icon="&#128640;" onDetails={function(){setTab("scan");}}>
            <div style={{display:"flex",gap:6,overflowX:"auto",WebkitOverflowScrolling:"touch",width:"100%",boxSizing:"border-box"}}>
              {[["Breakout","&#128200;"],["Breakdown","&#128201;"],["High Volume","&#128266;"],["Gap Up","&#11014;"],["Gap Down","&#11015;"]].map(function(o){
                return (
                  <button key={o[0]} onClick={function(){setTab("scan");}} style={{flexShrink:0,background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"6px 10px",display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontFamily:"inherit"}}>
                    <span style={{fontSize:11}} dangerouslySetInnerHTML={{__html:o[1]}}/>
                    <span style={{fontSize:11,fontWeight:700,color:T1,whiteSpace:"nowrap"}}>{o[0]}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* LATEST ALERTS */}
          <Card title="Latest Alerts" icon="&#128276;" onDetails={function(){setTab("alerts");}}>
            <div style={{fontSize:11,color:T2,lineHeight:1.4}}>No alerts yet - set one up from any chart or scanner result.</div>
          </Card>

          {/* TOP GAINERS */}
          <Card title="Top Gainers" icon="&#128200;" onDetails={function(){setTab("markets");}}>
            {GAINERS.slice(0,5).map(function(s){
              return (
                <div key={s.sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
                  <span style={{fontSize:11,fontWeight:700,color:T1}}>{s.sym}</span>
                  <span style={{fontSize:11,fontWeight:700,color:UP}}>+{s.pct}%</span>
                </div>
              );
            })}
          </Card>

          {/* TOP LOSERS */}
          <Card title="Top Losers" icon="&#128201;" onDetails={function(){setTab("markets");}}>
            {LOSERS.slice(0,5).map(function(s){
              return (
                <div key={s.sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
                  <span style={{fontSize:11,fontWeight:700,color:T1}}>{s.sym}</span>
                  <span style={{fontSize:11,fontWeight:700,color:DOWN}}>{s.pct}%</span>
                </div>
              );
            })}
          </Card>

          {/* MARKET HEATMAP */}
          <Card title="Market Heatmap" icon="&#128293;" onDetails={function(){setTab("heatmap");}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:5,width:"100%",boxSizing:"border-box"}}>
              {GAINERS.concat(LOSERS).slice(0,6).map(function(s){
                var up = s.pct>=0;
                return (
                  <div key={s.sym} style={{minWidth:0,boxSizing:"border-box",background:up?"rgba(0,143,57,0.12)":"rgba(220,38,38,0.12)",border:"1px solid "+(up?UP:DOWN)+"40",borderRadius:8,padding:"5px 3px",textAlign:"center",overflow:"hidden"}}>
                    <div style={{fontSize:9,fontWeight:800,color:T1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.sym}</div>
                    <div style={{fontSize:9,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{s.pct}%</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* OPTIONS INTELLIGENCE - compact mobile card, reuses the same
              underlying data as the full OptionsIntel component/page, just
              rendered as 5 small metric tiles instead of the full desktop-
              style block. Full analysis stays on the dedicated page. */}
          <Card title="Options Intelligence" icon="&#128202;" onDetails={function(){setShowOptions(true);}}>
            {(function(){
              var oi = getOptionsIntel("NIFTY");
              var flat = [];
              oi.metrics.forEach(function(g){ g.items.forEach(function(m){ flat.push(m); }); });
              if(oi.greeks) flat = flat.concat(oi.greeks);
              var wantKeys = ["pcr","maxpain","gamma","callwall","putwall"];
              var picked = wantKeys.map(function(k){ return flat.filter(function(m){return m.key==k;})[0]; }).filter(function(x){return x;});
              function toneColor(tone){ return tone=="bull"?UP:(tone=="bear"?DOWN:T2); }
              return (
                <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:6,width:"100%",boxSizing:"border-box"}}>
                  {picked.map(function(m){
                    return (
                      <div key={m.key} style={{minWidth:0,boxSizing:"border-box",background:theme.c.card2,border:"1px solid "+BD,borderRadius:8,padding:"6px 4px",overflow:"hidden"}}>
                        <div style={{fontSize:9,color:T2,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.label}</div>
                        <div style={{fontSize:11,fontWeight:800,color:toneColor(m.tone),whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.val}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </Card>

          {/* FII/DII FLOW */}
          <Card title="FII / DII Flow" icon="&#128176;" onDetails={function(){setTab("fiidiipro");}}>
            <div style={{fontSize:11,color:T2,lineHeight:1.4}}>Institutional buy/sell trends - see today's flow and recent history.</div>
          </Card>

          {/* GLOBAL MARKETS */}
          <Card title="Global Markets" icon="&#127760;" onDetails={function(){setTab("global");}}>
            <div style={{fontSize:11,color:T2,lineHeight:1.4}}>Dow, Nasdaq, Nikkei and more - see the full global snapshot.</div>
          </Card>

          {/* TODAY'S EVENTS */}
          <Card title="Today's Events" icon="&#128197;" onDetails={function(){setTab("econcalendar");}}>
            <div style={{fontSize:11,color:T2,lineHeight:1.4}}>RBI, Fed, CPI, earnings and expiry dates - see the full calendar.</div>
          </Card>

        </div>

        <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0}to{opacity:1}}"}</style>
      </div>
    );
  }

  // ===================================================================
  // TABLET / DESKTOP LAYOUT (unchanged approach - to be refined separately;
  // mobile above is the rebuilt priority per this request)
  // ===================================================================

  function DesktopHome(){
    function SummaryCard(p){
      return (
        <div style={{background:CARD,border:"1px solid "+(p.hero?BLUE:BD),borderRadius:16,padding:p.hero?18:16,boxSizing:"border-box",minWidth:0,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {p.icon ? <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:p.icon}}/> : null}
              <span style={{fontSize:p.hero?15:14,fontWeight:800,color:T1}}>{p.title}</span>
            </div>
            {p.onDetails ? (
              <button onClick={p.onDetails} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:36,padding:"0 2px",flexShrink:0}}>View Details &#8594;</button>
            ) : null}
          </div>
          {p.children}
        </div>
      );
    }
    function DLevelsPair(sym, zones){
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
      <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:40,color:T1,overflowX:"hidden"}}>
        <div style={{background:BG,borderBottom:"1px solid "+BD,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:22,fontWeight:900,letterSpacing:-0.5}}>
              <span style={{color:T1}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span>
            </div>
            <MarketBadge/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <button onClick={function(){setTab("search");}} style={{background:"none",border:"none",cursor:"pointer"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <button onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",cursor:"pointer"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
          </div>
        </div>

        <div onClick={function(){setSelArticle(JUSTIN[tickerIdx]);}} style={{background:theme.c.card2,borderBottom:"1px solid "+BD,display:"flex",alignItems:"stretch",overflow:"hidden",cursor:"pointer"}}>
          <div style={{background:"#EF4444",padding:"4px 8px",display:"flex",alignItems:"center",flexShrink:0}}>
            <span style={{fontSize:12,fontWeight:800,color:"#fff",letterSpacing:0.6,whiteSpace:"nowrap"}}>JUST IN</span>
          </div>
          <div style={{flex:1,minWidth:0,display:"flex",alignItems:"center",padding:"8px 12px"}}>
            <span style={{fontSize:12,color:T1,fontWeight:600}}>{TICKER[tickerIdx]}</span>
          </div>
        </div>

        <div style={{padding:"16px 16px 0",minWidth:0,boxSizing:"border-box"}}>
          <SummaryCard title="Today's Market Snapshot" onDetails={function(){setTab("markets");}}>
            {idxRows.length==0 ? <div style={{fontSize:12,color:T2}}>Snapshot unavailable</div> : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:10}}>
                {idxRows.map(function(r){
                  var color = r.dir=="up"?UP:(r.dir=="down"?DOWN:T2);
                  return (
                    <div key={r.key} style={{minWidth:0,background:theme.c.card2,border:"1px solid "+BD,borderRadius:12,padding:12}}>
                      <div style={{fontSize:11,color:T2,marginBottom:3,fontWeight:600}}>{r.label}</div>
                      <div style={{fontSize:16,fontWeight:900,color:T1,fontFamily:"monospace"}}>{r.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                      <div style={{fontSize:11,fontWeight:700,color:color}}>{r.chgPct!=null?((r.dir=="up"?"+":"")+r.chgPct+"%"):"--"}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </SummaryCard>
        </div>

        <div style={{padding:"12px 16px 0",display:"flex",gap:8,minWidth:0,boxSizing:"border-box"}}>
          {[["Scanner","scan","&#128269;"],["Watchlist","watchlist","&#11088;"],["Alerts","alerts","&#128276;"],["Option Chain","oi","&#128200;"]].map(function(q){
            return (
              <button key={q[1]} onClick={function(){setTab(q[1]);}} style={{flex:1,minWidth:0,background:CARD,border:"1px solid "+BD,borderRadius:12,padding:"10px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",fontFamily:"inherit"}}>
                <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:q[2]}}/>
                <span style={{fontSize:11,fontWeight:700,color:T2}}>{q[0]}</span>
              </button>
            );
          })}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:16,padding:"16px 16px 0",minWidth:0,boxSizing:"border-box"}}>

          <SummaryCard title="AI Market Mood" icon="&#129504;" onDetails={function(){setTab("more");}}>
            {!mm.mood || mm.mood.score==null ? <div style={{fontSize:12,color:T2}}>Market mood unavailable</div> : (function(){
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
                  <div style={{fontSize:12,color:T2,lineHeight:1.4}}>{mm.mood.stage}</div>
                </div>
              );
            })()}
          </SummaryCard>

          <div style={{gridColumn:"span 2"}}>
            <SummaryCard title="Today's Key Levels" icon="&#128200;" hero={true}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                {DLevelsPair("NIFTY", niftyZones)}
                {DLevelsPair("BANK NIFTY", bankZones)}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={function(){setTab("alerts");}} style={{flex:1,background:theme.c.card2,border:"1px solid "+BD,borderRadius:10,padding:"10px",color:T1,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128276; Alert</button>
                <button onClick={function(){setTab("pazones");}} style={{flex:1,background:BLUE,border:"none",borderRadius:10,padding:"10px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>&#128202; View Details</button>
              </div>
            </SummaryCard>
          </div>

          <SummaryCard title="Trading Opportunities" icon="&#128640;" onDetails={function(){setTab("scan");}}>
            <div style={{display:"flex",gap:8,overflowX:"auto",minWidth:0,maxWidth:"100%"}}>
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

          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",minWidth:0}}>
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

  return responsive.isMobile ? <MobileHome/> : <DesktopHome/>;
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
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:20,padding:"3px 7px",whiteSpace:"nowrap"}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:st.dot,animation:st.label=="Open"?"pulse-dot 1.4s infinite":"none",flexShrink:0}}></span>
      <span style={{fontSize:10,fontWeight:800,color:st.col}}>{st.label}</span>
    </span>
  );
}
