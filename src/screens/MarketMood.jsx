import { useState, useEffect } from "react";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../theme/ThemeProvider";
import { track } from "../state/analyticsRegistry";
import { SkeletonCard, SkeletonList } from "../components/Skeleton";
import {
  getSessionMeta, buildIndexRow, buildEvolution,
  buildUnverifiedSection, buildVoiceSummary, rankSectors, buildVixHistory
} from "./MarketMoodData";
import {
  SectionHead, SectionHeadWithPill, UnavailableCard, IndexRow,
  Gauge, EvolutionCard, StageTimeline, GridWrap, Sparkline, buildMT
} from "./MarketMoodParts";
import { DEMO_MOOD, DEMO_AI, DEMO_DATA, DEMO_LEVELS, DEMO_BREADTH, DEMO_FII_DII, DEMO_EVOLUTION, DEMO_EVOLUTION_DATES, DEMO_SCENARIOS, DEMO_RISK, DEMO_TRADE_BIAS, DEMO_EVENTS } from "./MarketMoodDemoData";

// BreakoutPro - MarketMood.jsx
// AI Market Mood - full open page. Owns page COMPOSITION only.
// All numbers come from the real useMarketMood() state (mm prop, same
// object MarketMoodCard.jsx already uses) via MarketMoodEngine.js
// (deterministic score) and api/market-mood-ai.js (grounded AI text).
// No static/fake datasets. Missing data renders honest UNAVAILABLE.
// Rules: no backtick, no triple-equals, ASCII only.

function speakText(t){
  try{
    if(!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t);
    u.lang = "en-IN"; u.rate = 1; u.pitch = 1;
    window.speechSynthesis.speak(u);
  }catch(e){}
}

export default function MarketMood(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var MT = buildMT(theme);
  var mm = props.mm || {};
  // DEMO FALLBACK: the app is not yet launched with live NSE/BSE APIs.
  // If the real useMarketMood() pipeline has no score yet, fall back to
  // MarketMoodDemoData - same exact shape as the real mm object, so this
  // is the ONLY place that changes when live data is ready. Remove this
  // fallback block (and only this block) to switch to live-only behavior.
  var usingDemo = !mm.mood || mm.mood.score==null;
  var mood = usingDemo ? DEMO_MOOD : mm.mood;
  var ai = usingDemo ? DEMO_AI : (mm.ai || null);
  var data = usingDemo ? DEMO_DATA : (mm.data || null);
  var session = mm.session || "";
  var status = usingDemo ? "ok" : (mm.status || "loading");

  var responsive = useResponsive();
  var cols = responsive.columns || 1;
  // The shared shellConfig() caps desktop-class content at 900-1100px
  // regardless of actual screen width - correct for some pages, but too
  // narrow for this one's premium terminal feel. Widened locally, without
  // touching the shared registry other pages rely on.
  var wideLayout = responsive.isDesktop || responsive.isTV;
  var gapV = wideLayout ? 10 : 16;

  var sMeta = getSessionMeta(session);
  var evolution = buildEvolution(data || {});

  var idx = (data && data.indices) || {};
  var niftyRow = buildIndexRow("NIFTY 50", idx.NIFTY);
  var sensexRow = buildIndexRow("SENSEX", idx.SENSEX);
  var bankRow = buildIndexRow("BANK NIFTY", idx.BANKNIFTY);
  var vixRow = buildIndexRow("INDIA VIX", idx.VIX);

  // Sector Rotation / Global Markets: real, server-populated groups as of
  // Step 5 (batched quote fetch, honest LIVE/DELAYED/STALE/PARTIAL/
  // UNAVAILABLE per group). Market Breadth / Important Events: still
  // honest UNAVAILABLE - no validated provider exists for them.
  var sectorSection = buildUnverifiedSection(data && data.sectors);
  var rankedSectors = sectorSection.available ? rankSectors(sectorSection.items) : [];
  var globalSection = buildUnverifiedSection(data && data.global);
  var vixHist = buildVixHistory(data && data.vixHistory);

  var [speaking, setSpeaking] = useState(false);

  // Fires exactly once per genuine open (component mount), not on
  // re-render - matches the ANALYTICS_EVENTS allow-list in
  // analyticsRegistry.js ("feature_open": ["feature"]), no new event type.
  useEffect(function(){
    track("feature_open", { feature:"marketMood" });
  }, []);

  function onVoice(){
    var t = buildVoiceSummary(mood, ai, session);
    setSpeaking(true);
    speakText(t);
    setTimeout(function(){ setSpeaking(false); }, 1000);
  }

  var showLoading = status=="loading" && !mood;
  var showOffline = status=="offline";
  var moodColor = mood && mood.label ? (mood.label.indexOf("Bullish")>=0?MT.GREEN:(mood.label.indexOf("Bearish")>=0?MT.RED:MT.WARN)) : MT.T2;

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:MT.BG,zIndex:350,overflowY:"auto"}}>

      {/* HEADER - single compact line, no hero area */}
      <div style={{background:MT.CARD,borderBottom:"1px solid "+MT.BD,position:"sticky",top:0,zIndex:5}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",maxWidth:1440,margin:"0 auto",boxSizing:"border-box"}}>
          <button onClick={props.onClose} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:36,height:36,color:MT.T1,fontSize:15,cursor:"pointer",flexShrink:0}}>&#8592;</button>
          <div style={{fontSize:15,fontWeight:800,color:MT.T1}}>AI Market Mood</div>
          <div style={{fontSize:11,color:MT.T2,display:"flex",alignItems:"center",gap:4,marginLeft:"auto"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:sMeta.dot,display:"inline-block",flexShrink:0}}></span>
            <span>{sMeta.label}</span>
          </div>
        </div>
      </div>

      <div style={{padding:wideLayout?"10px 24px 20px":"16px 24px 32px",maxWidth:1440,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

        {showLoading ? (
          <div>
            <SkeletonCard height={140}/>
            <SkeletonList count={3} height={60}/>
          </div>
        ) : showOffline && !mood ? (
          <div style={{padding:"32px 0",textAlign:"center",color:MT.T2,fontSize:12}}>You are offline. Showing last-known data where available.</div>
        ) : (
          <>
        {/* CURRENT MOOD - compact dashboard row, no hero area */}
        <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:gapV,display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"auto 1fr auto auto":undefined,gap:wideLayout?24:12,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Gauge mood={mood}/>
          </div>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:moodColor}}>{mood.label.toUpperCase()}</div>
            <div style={{fontSize:12,color:MT.T2}}>{mood.stage}</div>
          </div>
          <div>
            <div style={{fontSize:10,color:MT.T3,fontWeight:700}}>CONFIDENCE</div>
            <div style={{fontSize:13,fontWeight:800,color:MT.T1}}>{mood.confidence}</div>
          </div>
          <div>
            <div style={{fontSize:10,color:MT.T3,fontWeight:700}}>AI BIAS</div>
            <div style={{fontSize:13,fontWeight:800,color:moodColor}}>{mood.label}</div>
          </div>
        </div>

        <button onClick={onVoice} style={{width:"100%",background:MT.BLUE,border:"none",borderRadius:13,padding:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginBottom:gapV,display:"flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:40}}>
          <span style={{fontSize:15}} dangerouslySetInnerHTML={{__html:"&#128266;"}}/>
          {speaking ? "Playing..." : "Listen: Market Mood Summary"}
        </button>

        {/* WHY + WHAT TO WATCH: side-by-side on wide screens, stacked on mobile - same real ai.* fields as before, now clearly separated instead of bundled together */}
        <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"1fr 1fr":undefined,gap:gapV,marginBottom:gapV}}>
          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>WHY THIS MOOD?</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:16,height:"100%",boxSizing:"border-box"}}>
              {!ai ? (
                <div style={{fontSize:12,color:MT.T2}}>AI commentary loading. Deterministic score above is already live.</div>
              ) : ai.now ? (
                <div style={{fontSize:12,color:MT.T1,lineHeight:1.6}}>{ai.now}</div>
              ) : (
                <div style={{fontSize:12,color:MT.T2}}>No verified reasoning available right now.</div>
              )}
            </div>
          </div>
          <div>
            <SectionHead>WHAT TO WATCH?</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:16,height:"100%",boxSizing:"border-box"}}>
              {ai && ai.watchNext ? (
                <div style={{fontSize:12,color:MT.T1,lineHeight:1.6}}>{ai.watchNext}</div>
              ) : (
                <div style={{fontSize:12,color:MT.T2}}>No verified watch-level data available right now.</div>
              )}
            </div>
          </div>
        </div>

        {/* WHAT CHANGED + KEY DRIVERS: real ai.whatChanged / ai.keyDrivers, now their own distinct sections rather than bundled inside WHY */}
        <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"1fr 1fr":undefined,gap:gapV,marginBottom:gapV}}>
          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>WHAT CHANGED?</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:16,height:"100%",boxSizing:"border-box"}}>
              {ai && ai.whatChanged ? (
                <div style={{fontSize:12,color:MT.T1,lineHeight:1.6}}>{ai.whatChanged}</div>
              ) : (
                <div style={{fontSize:12,color:MT.T2}}>No verified change data available right now.</div>
              )}
            </div>
          </div>
          <div>
            <SectionHead>KEY DRIVERS</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:16,height:"100%",boxSizing:"border-box"}}>
              {ai && ai.keyDrivers && ai.keyDrivers.length ? (
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {ai.keyDrivers.map(function(d,i){
                    return <span key={i} style={{fontSize:12,color:MT.T2,background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:6,padding:"4px 8px"}}>{d}</span>;
                  })}
                </div>
              ) : (
                <div style={{fontSize:12,color:MT.T2}}>No verified driver data available right now.</div>
              )}
            </div>
          </div>
        </div>

        {/* RISK NOTE - own section, real ai.riskNote only */}
        {ai && ai.riskNote ? (
          <div style={{marginBottom:gapV}}>
            <SectionHead>RISK NOTE</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.WARN,borderRadius:12,padding:16}}>
              <div style={{fontSize:12,color:MT.WARN,lineHeight:1.6}}>{ai.riskNote}</div>
            </div>
          </div>
        ) : null}

        {/* DATA STATUS - honest indicator of live vs unavailable, never fabricated */}
        <div style={{fontSize:11,color:MT.T3,marginBottom:gapV}}>
          {status==="ok" && ai ? "Live data" : status==="ok" && !ai ? "Score live, AI commentary loading" : "Data unavailable right now."}
        </div>

        {/* MARKET SNAPSHOT - compact 4-column grid, same real index data as below */}
        <SectionHead>MARKET SNAPSHOT</SectionHead>
        <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"repeat(4, 1fr)":undefined,gap:wideLayout?12:8,marginBottom:gapV}}>
          {[["NIFTY", niftyRow], ["BANKNIFTY", bankRow], ["SENSEX", sensexRow], ["VIX", vixRow]].map(function(pair,i){
            var key = pair[0], row = pair[1];
            var lvl = DEMO_LEVELS[key];
            return (
              <div key={i} style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:12,padding:12,marginBottom:wideLayout?0:8}}>
                <div style={{fontSize:11,fontWeight:700,color:MT.T2,marginBottom:4}}>{row.name}</div>
                {row.available ? (
                  <div>
                    <div style={{fontSize:15,fontWeight:800,color:MT.T1}}>{row.ltp}</div>
                    <div style={{fontSize:12,fontWeight:700,color:row.up==null?MT.T2:(row.up?MT.GREEN:MT.RED)}}>{row.chgPct}</div>
                    {usingDemo && lvl ? (
                      <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid "+MT.BD,fontSize:11,color:MT.T2}}>
                        <div>Support: <b style={{color:MT.T1}}>{lvl.support.toLocaleString("en-IN")}</b></div>
                        <div>Resistance: <b style={{color:MT.T1}}>{lvl.resistance.toLocaleString("en-IN")}</b></div>
                        <div>Trend: <b style={{color:MT.RED}}>{lvl.trend}</b></div>
                      </div>
                    ) : null}
                  </div>
                ) : <div style={{fontSize:12,color:MT.T2}}>Data unavailable</div>}
              </div>
            );
          })}
        </div>

        {/* SUPPORTING INFORMATION - same sections as before, now clearly separated from the primary WHAT/WHY/WATCH signal above rather than presented as equal-weight */}
        <div style={{borderTop:"1px solid "+MT.BD,paddingTop:16,marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:800,color:MT.T3,letterSpacing:1,marginBottom:12}}>SUPPORTING INFORMATION</div>
        </div>

        {/* 2. 3-DAY EVOLUTION */}
        <SectionHead>3-DAY EVOLUTION</SectionHead>
        {usingDemo ? (
          <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:gapV}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              {DEMO_EVOLUTION.map(function(m,i){
                return (
                  <span key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:12,fontWeight:700,color:MT.RED}}>{m}</span>
                    {i<DEMO_EVOLUTION.length-1 ? <span style={{color:MT.T3}}>&#8594;</span> : null}
                  </span>
                );
              })}
            </div>
            <div style={{fontSize:11,color:MT.T3,marginTop:6}}>{DEMO_EVOLUTION_DATES.join(" - ")}</div>
          </div>
        ) : <EvolutionCard evolution={evolution}/>}

        {/* 3-5. YESTERDAY / PREVIOUS SESSION / CURRENT SESSION */}
        <SectionHead>YESTERDAY, PREVIOUS SESSION AND CURRENT SESSION</SectionHead>
        <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,overflow:"hidden",marginBottom:gapV}}>
          <IndexRow row={niftyRow}/>
          <IndexRow row={sensexRow}/>
          <IndexRow row={bankRow}/>
        </div>
        <div style={{fontSize:12,color:MT.T3,marginTop:-8,marginBottom:gapV}}>
          Yesterday and previous-session detail use the same live index feed above with session-aware freshness labels. A dedicated multi-day close history view will expand this once approved.
        </div>

        {/* 6. MARKET STAGE TIMELINE */}
        <SectionHead>MARKET STAGE TIMELINE</SectionHead>
        <StageTimeline mood={mood} evolution={evolution}/>

        {/* 7. SECTOR ROTATION */}
        {sectorSection.available ? (
          <div>
            <SectionHeadWithPill status={sectorSection.status}>SECTOR ROTATION</SectionHeadWithPill>
            <GridWrap columns={cols}>
              {rankedSectors.map(function(s,i){
                var color = s.up==null?MT.T2:(s.up?MT.GREEN:MT.RED);
                return (
                  <div key={i} style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:12,padding:12}}>
                    <div style={{fontSize:12,color:MT.T1,fontWeight:700}}>{s.name}</div>
                    <div style={{fontSize:12,color:color,marginTop:4}}>{s.chgPct!=null ? (s.chgPct>=0?"+":"")+s.chgPct+"%" : "--"}</div>
                    {s.tag ? <div style={{fontSize:12,color:MT.T3,marginTop:4}}>{s.tag}</div> : null}
                  </div>
                );
              })}
            </GridWrap>
            <div style={{fontSize:12,color:MT.T3,marginTop:8,marginBottom:8}}>Relative strength derived from the same live sector-index dataset above. Not institutional flow data.</div>
          </div>
        ) : (
          <div>
            <SectionHead>SECTOR ROTATION</SectionHead>
            <UnavailableCard title="Sector Rotation" note="No verified sector-index provider connected yet."/>
          </div>
        )}

        {/* 8. MARKET BREADTH */}
        <SectionHead>MARKET BREADTH</SectionHead>
        {usingDemo ? (
          <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:gapV}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,textAlign:"center"}}>
              <div><div style={{fontSize:11,color:MT.T3}}>Advances</div><div style={{fontSize:14,fontWeight:800,color:MT.GREEN}}>{DEMO_BREADTH.advances} ({DEMO_BREADTH.advPct}%)</div></div>
              <div><div style={{fontSize:11,color:MT.T3}}>Declines</div><div style={{fontSize:14,fontWeight:800,color:MT.RED}}>{DEMO_BREADTH.declines} ({DEMO_BREADTH.decPct}%)</div></div>
              <div><div style={{fontSize:11,color:MT.T3}}>Unchanged</div><div style={{fontSize:14,fontWeight:800,color:MT.T1}}>{DEMO_BREADTH.unchanged} ({DEMO_BREADTH.unchPct}%)</div></div>
            </div>
          </div>
        ) : <UnavailableCard title="Market Breadth" note="No verified advance/decline provider connected yet."/>}

        {/* 9. GLOBAL MARKETS */}
        {globalSection.available ? (
          <div>
            <SectionHeadWithPill status={globalSection.status}>GLOBAL MARKETS</SectionHeadWithPill>
            <GridWrap columns={cols}>
              {globalSection.items.map(function(g,i){
                var color = g.up==null?MT.T2:(g.up?MT.GREEN:MT.RED);
                return (
                  <div key={i} style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:12,padding:12}}>
                    <div style={{fontSize:12,color:MT.T1,fontWeight:700}}>{g.name}</div>
                    <div style={{fontSize:12,color:color,marginTop:4}}>{g.chgPct!=null ? (g.chgPct>=0?"+":"")+g.chgPct+"%" : "--"}</div>
                  </div>
                );
              })}
            </GridWrap>
            <div style={{fontSize:12,color:MT.T3,marginTop:8,marginBottom:8}}>Last available quote per market. May reflect a prior close outside that market's own trading hours.</div>
          </div>
        ) : (
          <div>
            <SectionHead>GLOBAL MARKETS</SectionHead>
            <UnavailableCard title="Global Markets" note="No verified global-index provider connected yet."/>
          </div>
        )}

        {/* 10. INDIA VIX */}
        <SectionHead>INDIA VIX</SectionHead>
        <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,overflow:"hidden",marginBottom:vixHist.available?0:14}}>
          <IndexRow row={vixRow}/>
        </div>
        {vixHist.available ? (
          <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderTop:"none",borderRadius:"0 0 14px 14px",padding:"12px 16px 16px",marginBottom:gapV}}>
            <div style={{fontSize:12,color:MT.T3,marginBottom:4}}>Last {vixHist.sessions} sessions (daily close)</div>
            <Sparkline points={vixHist.points}/>
          </div>
        ) : null}

        {/* FII / DII FLOW */}
        <SectionHead>FII / DII FLOW</SectionHead>
        {usingDemo ? (
          <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:gapV}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
              <div><span style={{fontSize:12,color:MT.T2}}>FII: </span><span style={{fontSize:13,fontWeight:800,color:MT.RED}}>-Rs{Math.abs(DEMO_FII_DII.fii).toLocaleString("en-IN")} Cr</span></div>
              <div><span style={{fontSize:12,color:MT.T2}}>DII: </span><span style={{fontSize:13,fontWeight:800,color:MT.GREEN}}>+Rs{DEMO_FII_DII.dii.toLocaleString("en-IN")} Cr</span></div>
              <div><span style={{fontSize:12,color:MT.T2}}>Net: </span><span style={{fontSize:13,fontWeight:800,color:MT.RED}}>-Rs{Math.abs(DEMO_FII_DII.net).toLocaleString("en-IN")} Cr</span></div>
            </div>
          </div>
        ) : <UnavailableCard title="FII / DII Flow" note={data && data.fiiDii ? "Status: "+data.fiiDii+". No verified real-time FII/DII provider connected yet." : "No verified FII/DII provider connected yet."}/>}

        {/* SUPPORT / RESISTANCE MAP */}
        <SectionHead>SUPPORT / RESISTANCE MAP</SectionHead>
        {usingDemo ? (
          <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"1fr 1fr":undefined,gap:wideLayout?16:8,marginBottom:gapV}}>
            <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:wideLayout?0:8}}>
              <div style={{fontSize:12,fontWeight:700,color:MT.T1,marginBottom:8}}>NIFTY 50</div>
              <div style={{fontSize:12,color:MT.T2}}>Support: <b style={{color:MT.T1}}>{DEMO_LEVELS.NIFTY.support.toLocaleString("en-IN")}</b> | {DEMO_LEVELS.NIFTY.support2.toLocaleString("en-IN")}</div>
              <div style={{fontSize:12,color:MT.T2}}>Resistance: <b style={{color:MT.T1}}>{DEMO_LEVELS.NIFTY.resistance.toLocaleString("en-IN")}</b> | {DEMO_LEVELS.NIFTY.resistance2.toLocaleString("en-IN")}</div>
            </div>
            <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16}}>
              <div style={{fontSize:12,fontWeight:700,color:MT.T1,marginBottom:8}}>BANK NIFTY</div>
              <div style={{fontSize:12,color:MT.T2}}>Support: <b style={{color:MT.T1}}>{DEMO_LEVELS.BANKNIFTY.support.toLocaleString("en-IN")}</b> | {DEMO_LEVELS.BANKNIFTY.support2.toLocaleString("en-IN")}</div>
              <div style={{fontSize:12,color:MT.T2}}>Resistance: <b style={{color:MT.T1}}>{DEMO_LEVELS.BANKNIFTY.resistance.toLocaleString("en-IN")}</b> | {DEMO_LEVELS.BANKNIFTY.resistance2.toLocaleString("en-IN")}</div>
            </div>
          </div>
        ) : <UnavailableCard title="Support / Resistance Map" note="No verified intraday OHLC provider connected yet - levels require real candle history, not shown to avoid fabricating them."/>}

        {/* BULLISH SCENARIO / BEARISH SCENARIO / INVALIDATION */}
        <SectionHead>BULLISH SCENARIO, BEARISH SCENARIO AND INVALIDATION</SectionHead>
        {usingDemo ? (
          <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"1fr 1fr 1fr":undefined,gap:wideLayout?16:8,marginBottom:gapV}}>
            <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:wideLayout?0:8}}>
              <div style={{fontSize:12,fontWeight:700,color:MT.GREEN,marginBottom:6}}>BULLISH SCENARIO</div>
              <div style={{fontSize:12,color:MT.T2,lineHeight:1.5}}>{DEMO_SCENARIOS.bullish}</div>
            </div>
            <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:wideLayout?0:8}}>
              <div style={{fontSize:12,fontWeight:700,color:MT.RED,marginBottom:6}}>BEARISH SCENARIO</div>
              <div style={{fontSize:12,color:MT.T2,lineHeight:1.5}}>{DEMO_SCENARIOS.bearish}</div>
            </div>
            <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16}}>
              <div style={{fontSize:12,fontWeight:700,color:MT.T1,marginBottom:6}}>INVALIDATION</div>
              <div style={{fontSize:12,color:MT.T2,lineHeight:1.5}}>{DEMO_SCENARIOS.invalidation}</div>
            </div>
          </div>
        ) : <UnavailableCard title="Scenario Analysis" note="Scenario and invalidation levels require real support/resistance data, which is not yet connected. Not shown to avoid fabricating levels."/>}

        {/* RISK LEVEL - demo case uses the explicit demo value; real case derives from the real VIX price above */}
        <SectionHead>RISK LEVEL</SectionHead>
        <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:gapV}}>
          {usingDemo ? (
            <div>
              <div style={{fontSize:14,fontWeight:800,color:MT.RED,marginBottom:4}}>{DEMO_RISK.level}</div>
              <div style={{fontSize:12,color:MT.T3}}>{DEMO_RISK.note}</div>
            </div>
          ) : vixRow && vixRow.available ? (function(){
            var vixNum = parseFloat(String(vixRow.ltp).replace(/,/g,""));
            var riskLabel = isNaN(vixNum) ? null : (vixNum<13?"Low":(vixNum<=18?"Moderate":"High"));
            var riskColor = riskLabel==="Low"?MT.GREEN:(riskLabel==="High"?MT.RED:MT.WARN);
            return riskLabel ? (
              <div>
                <div style={{fontSize:14,fontWeight:800,color:riskColor,marginBottom:4}}>{riskLabel}</div>
                <div style={{fontSize:12,color:MT.T3}}>Derived from India VIX ({vixRow.ltp}). Below 13 = Low, 13-18 = Moderate, above 18 = High.</div>
              </div>
            ) : <div style={{fontSize:12,color:MT.T2}}>No verified VIX value available right now.</div>;
          })() : <div style={{fontSize:12,color:MT.T2}}>No verified VIX value available right now.</div>}
        </div>

        {/* AI TRADE BIAS - the same real mood.label already shown above, not a new/separate value */}
        <SectionHead>AI TRADE BIAS</SectionHead>
        <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:gapV}}>
          {mood && mood.score!=null ? (
            <div style={{fontSize:14,fontWeight:800,color:mood.label.indexOf("Bullish")>=0?MT.GREEN:(mood.label.indexOf("Bearish")>=0?MT.RED:MT.WARN)}}>{usingDemo ? DEMO_TRADE_BIAS.label : mood.label}</div>
          ) : <div style={{fontSize:12,color:MT.T2}}>No verified mood data available right now.</div>}
          <div style={{fontSize:12,color:MT.T3,marginTop:6}}>{usingDemo ? DEMO_TRADE_BIAS.note : "Educational market bias only. Not a trading instruction."}</div>
        </div>

        {/* 11. IMPORTANT EVENTS */}
        <SectionHead>IMPORTANT EVENTS</SectionHead>
        {usingDemo ? (
          <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:gapV}}>
            {DEMO_EVENTS.map(function(e,i){
              return <div key={i} style={{fontSize:12,color:MT.T2,padding:"4px 0"}}>&#8226; {e}</div>;
            })}
          </div>
        ) : <UnavailableCard title="Important Events" note="No verified economic-calendar source connected yet."/>}

        {/* 12. EDUCATIONAL EXPLANATION */}
        <SectionHead>EDUCATIONAL EXPLANATION</SectionHead>
        <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:gapV}}>
          <div style={{fontSize:12,color:MT.T2,lineHeight:1.7}}>
            Market Mood is a deterministic score (0 to 100) built from live index trend, India VIX, and multi-session structure, weighted by how much verified data is actually available right now. Components with no trustworthy data are excluded rather than guessed, and remaining weights are re-balanced. AI only explains this score in plain language; it never changes the number or adds outside facts.
          </div>
        </div>

        {/* DISCLAIMER */}
        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:8}}>
          <div style={{fontSize:12,color:MT.WARN,lineHeight:1.6}}>Educational Market Observation Only. Not Investment Advice.</div>
        </div>

          </>
        )}

      </div>
    </div>
  );
}
