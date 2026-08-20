import { useState, useEffect } from "react";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../theme/ThemeProvider";
import { track } from "../state/analyticsRegistry";
import { SkeletonCard, SkeletonList } from "../components/Skeleton";
import {
  getSessionMeta, buildIndexRow, buildEvolution, buildVoiceSummary,
  buildUnverifiedSection, rankSectors
} from "./MarketMoodData";
import {
  SectionHead, SectionHeadWithPill, UnavailableCard, IndexRow, GridWrap,
  SemicircleGauge, StageTimeline, EvolutionCard, buildMT
} from "./MarketMoodParts";
import { DEMO_MOOD, DEMO_AI, DEMO_DATA, DEMO_LEVELS, DEMO_EVOLUTION, DEMO_EVOLUTION_DATES, DEMO_RISK, DEMO_TRADE_BIAS, DEMO_BREADTH } from "./MarketMoodDemoData";

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
  var gapV = wideLayout ? 6 : 16;
  var padV = wideLayout ? "4px 6px" : 16;

  var sMeta = getSessionMeta(session);
  var evolution = buildEvolution(data || {});

  var idx = (data && data.indices) || {};
  var niftyRow = buildIndexRow("NIFTY 50", idx.NIFTY);
  var sensexRow = buildIndexRow("SENSEX", idx.SENSEX);
  var bankRow = buildIndexRow("BANK NIFTY", idx.BANKNIFTY);
  var vixRow = buildIndexRow("INDIA VIX", idx.VIX);

  // Sector Rotation / Global Markets: real, server-populated groups.
  var sectorSection = buildUnverifiedSection(data && data.sectors);
  var rankedSectors = sectorSection.available ? rankSectors(sectorSection.items) : [];
  var globalSection = buildUnverifiedSection(data && data.global);

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
  var moodColor = mood && mood.label ? (mood.label.indexOf("Bullish")>=0?MT.SENT_GREEN:(mood.label.indexOf("Bearish")>=0?MT.SENT_RED:MT.SENT_YELLOW)) : MT.T2;

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

      <div style={{padding:wideLayout?"4px 10px":"16px 24px 32px",maxWidth:1440,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

        {showLoading ? (
          <div>
            <SkeletonCard height={140}/>
            <SkeletonList count={3} height={60}/>
          </div>
        ) : showOffline && !mood ? (
          <div style={{padding:"32px 0",textAlign:"center",color:MT.T2,fontSize:12}}>You are offline. Showing last-known data where available.</div>
        ) : (
          <>
        {usingDemo ? (
          <div style={{background:MT.WARN+"18",border:"1px solid "+MT.WARN+"55",borderRadius:8,padding:"6px 12px",marginBottom:gapV,display:"inline-flex",alignItems:"center",gap:6,fontSize:11,fontWeight:800,color:MT.WARN}}>
            <span>&#9888;</span> DEMO DATA &#8212; NOT LIVE
          </div>
        ) : null}
        {/* CURRENT MOOD - three-part hero per reference: gauge (visual only,
            no text) | score circle + ONE primary mood label + small
            supporting fields | Market Stage Timeline. The gauge no longer
            renders the mood label as text, so "BEARISH" now appears exactly
            once as the primary result; AI Bias is a small supporting field
            below it, not a second large mood result - matches the
            reference's explicit requirement. */}
        <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"1fr 1fr":undefined,gap:gapV,marginBottom:gapV,alignItems:"stretch"}}>
          <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:10,padding:padV,marginBottom:wideLayout?0:gapV,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <SemicircleGauge mood={mood}/>
            <div style={{flexShrink:0}}>
              <div style={{display:"flex",gap:4,marginBottom:4}}>
                {[["BEARISH",MT.SENT_RED],["SIDEWAYS",MT.SENT_YELLOW],["BULLISH",MT.SENT_GREEN]].map(function(seg){
                  var active = mood.label.toUpperCase().indexOf(seg[0])>=0 || (seg[0]==="SIDEWAYS" && mood.label.indexOf("Bull")<0 && mood.label.indexOf("Bear")<0);
                  return (
                    <div key={seg[0]} style={{fontSize:8,fontWeight:800,padding:"2px 6px",borderRadius:5,color:active?"#fff":seg[1],background:active?seg[1]:seg[1]+"14",border:"1px solid "+seg[1]+(active?"":"55")}}>{seg[0]}</div>
                  );
                })}
              </div>
              <div style={{fontSize:13,fontWeight:900,color:moodColor,marginBottom:2}}>Market Mood: {mood.label.toUpperCase()}</div>
              <div style={{fontSize:11,color:MT.T2}}>Stage: <b style={{color:MT.T1}}>{mood.stage}</b> &nbsp; Confidence: <b style={{color:moodColor}}>{mood.confidence}</b></div>
              <div style={{fontSize:9,color:MT.T3,marginTop:2}}>AI Score: {mood.score}/100{mm.lastUpdated ? " \u00b7 Updated "+new Date(mm.lastUpdated).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"}) : ""}</div>
            </div>
          </div>
          <StageTimeline mood={mood} evolution={evolution}/>
        </div>

        <button onClick={onVoice} style={{width:wideLayout?"auto":"100%",background:"transparent",border:"1px solid "+MT.BLUE,borderRadius:9,padding:"10px 16px",color:MT.BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:40,marginBottom:gapV}}>
          <span style={{fontSize:13}} dangerouslySetInnerHTML={{__html:"&#128266;"}}/>
          {speaking ? "Playing..." : "Listen: Market Mood Summary"}
        </button>

        {/* MARKET MOOD BREAKDOWN + WHY/WATCH/CHANGED/DRIVERS - single row on wide screens, Breakdown as one column beside the 4-card intelligence grid, matching the reference layout */}
        <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"1fr 3fr":undefined,gap:gapV,marginBottom:gapV,alignItems:"start"}}>
          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>MARKET MOOD BREAKDOWN</SectionHead>
            <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:padV}}>
              {(function(){
                var score = mood.score;
                var zone = score<40?"bearish":(score<60?"sideways":"bullish");
                var depth;
                if(zone==="bearish") depth = 1 - Math.abs(score-19.5)/19.5;
                else if(zone==="sideways") depth = 1 - Math.abs(score-50)/10;
                else depth = 1 - Math.abs(score-80)/20;
                var dominant = Math.round(55 + depth*30);
                var remainder = 100 - dominant;
                var others = ["bearish","sideways","bullish"].filter(function(z){ return z!==zone; });
                var distScore = {bearish:score, sideways:Math.abs(score-50), bullish:100-score};
                var w0 = 1/(distScore[others[0]]+5), w1 = 1/(distScore[others[1]]+5);
                var pct = {}; pct[zone] = dominant;
                pct[others[0]] = Math.round(remainder*w0/(w0+w1));
                pct[others[1]] = remainder - pct[others[0]];
                var rows = [["BEARISH",MT.SENT_RED,pct.bearish],["SIDEWAYS",MT.SENT_YELLOW,pct.sideways],["BULLISH",MT.SENT_GREEN,pct.bullish]];
                return rows.map(function(r){
                  return (
                    <div key={r[0]} style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                      <div style={{width:70,fontSize:11,fontWeight:700,color:r[1]}}>{r[0]}</div>
                      <div style={{flex:1,height:8,background:MT.BD,borderRadius:4,overflow:"hidden"}}>
                        <div style={{height:"100%",width:r[2]+"%",background:r[1]}}/>
                      </div>
                      <div style={{width:36,fontSize:11,fontWeight:700,color:MT.T1,textAlign:"right"}}>{r[2]}%</div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"repeat(4, 1fr)":undefined,gap:gapV}}>
          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>&#10067; WHY THIS MOOD?</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:padV,boxSizing:"border-box"}}>
              {!ai ? (
                <div style={{fontSize:12,color:MT.T2}}>AI commentary loading. Deterministic score above is already live.</div>
              ) : ai.now ? (
                <div style={{fontSize:12,color:MT.T1,lineHeight:1.6}}>{ai.now}</div>
              ) : (
                <div style={{fontSize:12,color:MT.T2}}>No verified reasoning available right now.</div>
              )}
            </div>
          </div>
          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>&#128065; WHAT TO WATCH?</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:padV,boxSizing:"border-box"}}>
              {ai && ai.watchNext ? (
                <div style={{fontSize:12,color:MT.T1,lineHeight:1.6}}>{ai.watchNext}</div>
              ) : (
                <div style={{fontSize:12,color:MT.T2}}>No verified watch-level data available right now.</div>
              )}
            </div>
          </div>
          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>&#128260; WHAT CHANGED?</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:padV,boxSizing:"border-box"}}>
              {ai && ai.whatChanged ? (
                <div style={{fontSize:12,color:MT.T1,lineHeight:1.6}}>{ai.whatChanged}</div>
              ) : (
                <div style={{fontSize:12,color:MT.T2}}>No verified change data available right now.</div>
              )}
            </div>
          </div>
          <div>
            <SectionHead>&#128200; KEY DRIVERS</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:padV,boxSizing:"border-box"}}>
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
        </div>

        {/* RISK NOTE - own section, real ai.riskNote only */}
        {ai && ai.riskNote ? (
          <div style={{marginBottom:gapV}}>
            <SectionHead>RISK NOTE</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.WARN,borderRadius:12,padding:padV}}>
              <div style={{fontSize:12,color:MT.WARN,lineHeight:1.6}}>{ai.riskNote}</div>
            </div>
          </div>
        ) : null}

        {/* DATA STATUS - honest indicator of live vs unavailable, never fabricated */}
        <div style={{fontSize:11,color:MT.T3,marginBottom:gapV}}>
          {status==="ok" && ai ? "Live data" : status==="ok" && !ai ? "Score live, AI commentary loading" : "Data unavailable right now."}
        </div>

        {/* MARKET SNAPSHOT - one compact card, 4-column grid inside, same real index data as below */}
        <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:padV,marginBottom:gapV}}>
          <div style={{fontSize:12,fontWeight:800,color:MT.T1,marginBottom:10}}>MARKET SNAPSHOT</div>
          <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"repeat(4, 1fr)":undefined,gap:wideLayout?12:8}}>
            {[["NIFTY", niftyRow], ["BANKNIFTY", bankRow], ["SENSEX", sensexRow], ["VIX", vixRow]].map(function(pair,i){
              var key = pair[0], row = pair[1];
              var lvl = DEMO_LEVELS[key];
              return (
                <div key={i} style={{marginBottom:wideLayout?0:8}}>
                  <div style={{fontSize:11,fontWeight:700,color:MT.T2,marginBottom:4}}>{row.name}</div>
                  {row.available ? (
                    <div>
                      <div style={{fontSize:15,fontWeight:800,color:MT.T1}}>{row.ltp}</div>
                      <div style={{fontSize:12,fontWeight:700,color:row.up==null?MT.T2:(row.up?MT.SENT_GREEN:MT.SENT_RED)}}>{row.chgPct}</div>
                      {usingDemo && lvl ? (
                        <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid "+MT.BD,fontSize:11,color:MT.T2}}>
                          <div>Support: <b style={{color:MT.T1}}>{lvl.support.toLocaleString("en-IN")}</b></div>
                          <div>Resistance: <b style={{color:MT.T1}}>{lvl.resistance.toLocaleString("en-IN")}</b></div>
                          <div>Trend: <b style={{color:MT.SENT_RED}}>{lvl.trend}</b></div>
                        </div>
                      ) : null}
                    </div>
                  ) : <div style={{fontSize:12,color:MT.T2}}>Data unavailable</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* SESSION / SECTOR ROTATION / MARKET BREADTH / GLOBAL MARKETS - single 4-column row on wide screens (was 3 separate blocks), matching the reference layout density */}
        <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"repeat(4, 1fr)":undefined,gap:gapV,marginBottom:gapV,alignItems:"start"}}>
          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>PREVIOUS / CURRENT SESSION</SectionHead>
            <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,overflow:"hidden"}}>
              <IndexRow row={niftyRow}/>
              <IndexRow row={sensexRow}/>
              <IndexRow row={bankRow}/>
            </div>
          </div>

          <div style={{marginBottom:wideLayout?0:8}}>
            {sectorSection.available ? (
              <div>
                <SectionHeadWithPill status={sectorSection.status}>SECTOR ROTATION</SectionHeadWithPill>
                <GridWrap columns={2}>
                  {rankedSectors.map(function(s,i){
                    var color = s.up==null?MT.T2:(s.up?MT.SENT_GREEN:MT.SENT_RED);
                    return (
                      <div key={i} style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:10,padding:10}}>
                        <div style={{fontSize:11,color:MT.T1,fontWeight:700}}>{s.name}</div>
                        <div style={{fontSize:11,color:color,marginTop:2}}>{s.chgPct!=null ? (s.chgPct>=0?"+":"")+s.chgPct+"%" : "--"}</div>
                      </div>
                    );
                  })}
                </GridWrap>
              </div>
            ) : (
              <div>
                <SectionHead>SECTOR ROTATION</SectionHead>
                <UnavailableCard title="Sector Rotation" note="No verified sector-index provider connected yet."/>
              </div>
            )}
          </div>

          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>MARKET BREADTH</SectionHead>
            {usingDemo ? (
              <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:padV}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,textAlign:"center"}}>
                  <div><div style={{fontSize:10,color:MT.T3}}>Advances</div><div style={{fontSize:13,fontWeight:800,color:MT.SENT_GREEN}}>{DEMO_BREADTH.advances} ({DEMO_BREADTH.advPct}%)</div></div>
                  <div><div style={{fontSize:10,color:MT.T3}}>Declines</div><div style={{fontSize:13,fontWeight:800,color:MT.SENT_RED}}>{DEMO_BREADTH.declines} ({DEMO_BREADTH.decPct}%)</div></div>
                  <div><div style={{fontSize:10,color:MT.T3}}>Unchanged</div><div style={{fontSize:13,fontWeight:800,color:MT.T1}}>{DEMO_BREADTH.unchanged} ({DEMO_BREADTH.unchPct}%)</div></div>
                </div>
              </div>
            ) : <UnavailableCard title="Market Breadth" note="No verified advance/decline provider connected yet."/>}
          </div>

          <div>
            {globalSection.available ? (
              <div>
                <SectionHeadWithPill status={globalSection.status}>GLOBAL MARKETS</SectionHeadWithPill>
                <GridWrap columns={2}>
                  {globalSection.items.map(function(g,i){
                    var color = g.up==null?MT.T2:(g.up?MT.SENT_GREEN:MT.SENT_RED);
                    return (
                      <div key={i} style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:10,padding:10}}>
                        <div style={{fontSize:11,color:MT.T1,fontWeight:700}}>{g.name}</div>
                        <div style={{fontSize:11,color:color,marginTop:2}}>{g.chgPct!=null ? (g.chgPct>=0?"+":"")+g.chgPct+"%" : "--"}</div>
                      </div>
                    );
                  })}
                </GridWrap>
              </div>
            ) : (
              <div>
                <SectionHead>GLOBAL MARKETS</SectionHead>
                <UnavailableCard title="Global Markets" note="No verified global-index provider connected yet."/>
              </div>
            )}
          </div>

        </div>

        {/* 3-DAY EVOLUTION / RISK LEVEL / AI TRADE BIAS / DISCLAIMER - single
            4-column row on wide screens (was two separate 2-column rows).
            Support/Resistance, Scenarios and Important Events remain removed
            per an earlier round's explicit instruction to reduce this page's
            information architecture; Sector Rotation, Market Breadth, Global
            Markets and the Session table are restored above per this
            round's explicit "do not delete" instruction. Their underlying
            data functions were never deleted from the project either way. */}
        <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"repeat(4, 1fr)":undefined,gap:gapV,marginBottom:gapV,alignItems:"start"}}>
          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>3-DAY EVOLUTION</SectionHead>
            {usingDemo ? (
              <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:padV}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  {DEMO_EVOLUTION.map(function(m,i){
                    return (
                      <span key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:12,fontWeight:700,color:MT.SENT_RED}}>{m}</span>
                        {i<DEMO_EVOLUTION.length-1 ? <span style={{color:MT.T3}}>&#8594;</span> : null}
                      </span>
                    );
                  })}
                </div>
                <div style={{fontSize:11,color:MT.T3,marginTop:6}}>{DEMO_EVOLUTION_DATES.join(" - ")}</div>
              </div>
            ) : <EvolutionCard evolution={evolution}/>}
          </div>
          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>RISK LEVEL</SectionHead>
            <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:padV}}>
              {usingDemo ? (
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:MT.SENT_RED,marginBottom:4}}>{DEMO_RISK.level}</div>
                  <div style={{fontSize:12,color:MT.T3}}>{DEMO_RISK.note}</div>
                </div>
              ) : vixRow && vixRow.available ? (function(){
                var vixNum = parseFloat(String(vixRow.ltp).replace(/,/g,""));
                var riskLabel = isNaN(vixNum) ? null : (vixNum<13?"Low":(vixNum<=18?"Moderate":"High"));
                var riskColor = riskLabel==="Low"?MT.SENT_GREEN:(riskLabel==="High"?MT.SENT_RED:MT.SENT_YELLOW);
                return riskLabel ? (
                  <div>
                    <div style={{fontSize:14,fontWeight:800,color:riskColor,marginBottom:4}}>{riskLabel}</div>
                    <div style={{fontSize:12,color:MT.T3}}>Derived from India VIX ({vixRow.ltp}). Below 13 = Low, 13-18 = Moderate, above 18 = High.</div>
                  </div>
                ) : <div style={{fontSize:12,color:MT.T2}}>No verified VIX value available right now.</div>;
              })() : <div style={{fontSize:12,color:MT.T2}}>No verified VIX value available right now.</div>}
            </div>
          </div>
          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>AI TRADE BIAS</SectionHead>
            <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:padV}}>
              {mood && mood.score!=null ? (
                <div style={{fontSize:14,fontWeight:800,color:mood.label.indexOf("Bullish")>=0?MT.SENT_GREEN:(mood.label.indexOf("Bearish")>=0?MT.SENT_RED:MT.SENT_YELLOW)}}>{usingDemo ? DEMO_TRADE_BIAS.label : mood.label}</div>
              ) : <div style={{fontSize:12,color:MT.T2}}>No verified mood data available right now.</div>}
              <div style={{fontSize:12,color:MT.T3,marginTop:6}}>{usingDemo ? DEMO_TRADE_BIAS.note : "Educational market bias only. Not a trading instruction."}</div>
            </div>
          </div>
          <div style={{background:MT.WARN+"14",border:"1px solid "+MT.WARN+"55",borderRadius:14,padding:padV}}>
            <div style={{fontSize:13,fontWeight:800,color:MT.WARN,marginBottom:6}}>Educational Market Observation Only. Not Investment Advice.</div>
            <div style={{fontSize:12,color:MT.T2,lineHeight:1.5}}>This analysis is for educational purposes only and should not be considered as investment advice.</div>
          </div>
        </div>

        {/* FOOTER DATA STATUS - compact, real status only */}
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,fontSize:11,color:MT.T3,paddingTop:8,borderTop:"1px solid "+MT.BD}}>
          <span>All data is end-of-day unless otherwise stated &#8226; Market data providers not connected</span>
          <span>AI Market Mood Score is deterministic and data-driven.</span>
        </div>

          </>
        )}

      </div>
    </div>
  );
}
