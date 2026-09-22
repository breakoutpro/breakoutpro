import { useState, useEffect } from "react";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../theme/ThemeProvider";
import { track } from "../state/analyticsRegistry";
import { t } from "../i18n/translations";
import { SkeletonCard, SkeletonList } from "../components/Skeleton";
import {
  getSessionMeta, buildIndexRow, buildEvolution, buildVoiceSummary,
  buildUnverifiedSection, rankSectors
} from "./MarketMoodData";
import {
  SectionHead, SectionHeadWithPill, UnavailableCard, IndexRow, GridWrap,
  StageTimeline, EvolutionCard, Sparkline, buildMT
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
  var gapV = wideLayout ? 2 : 8;
  var padV = wideLayout ? "3px 6px" : 10;
  // Explicit, fixed row heights for Row 1 (Mood Summary | Stage Timeline)
  // and Row 2 (Mood Breakdown | Market Intelligence) on wide layouts - a
  // controlled dimension, not natural/stretched height, so neither card's
  // content can determine an oversized or undersized row. Cards get
  // overflowY:auto as a safety net if real content ever exceeds this.
  var ROW1_H = wideLayout ? 108 : null;
  var ROW2_H = wideLayout ? 170 : null;
  // Row 3 (Market Snapshot): title(~20px) + 5-card grid whose tallest real
  // case is LTP+change+low/high+28px sparkline (~100px) - 120px total with
  // overflow safety covers that plus the rarer demo support/resistance case.
  var ROW3_H = wideLayout ? 150 : null;
  // Row 4 (Session | Sector | Breadth | Global): Session's 3-row table and
  // Breadth's 3-column block are both short (~90-110px); Sector/Global's
  // 2-column chip grids are the variable case (item count depends on the
  // real dataset) - capped with overflow safety rather than letting a long
  // sector list grow the whole row.
  var ROW4_H = wideLayout ? 190 : null;
  // Row 5 (Evolution | Risk | AI Trade Bias | Education): all four are
  // short, uniform 2-3 line blocks.
  var ROW5_H = wideLayout ? 100 : null;

  var sMeta = getSessionMeta(session);
  var evolution = buildEvolution(data || {});
  var [selectedIdx, setSelectedIdx] = useState(null);

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
        <div style={{display:"flex",alignItems:"center",gap:10,padding:wideLayout?"2px 8px":"6px 12px",maxWidth:1800,margin:"0 auto",boxSizing:"border-box"}}>
          <button onClick={props.onClose} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:30,height:30,color:MT.T1,fontSize:14,cursor:"pointer",flexShrink:0}}>&#8592;</button>
          <div style={{fontSize:13,fontWeight:800,color:MT.T1}}>AI Market Mood</div>
          <button onClick={onVoice} style={{background:"transparent",border:"1px solid "+MT.BLUE,borderRadius:7,padding:"4px 10px",color:MT.BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:12}} dangerouslySetInnerHTML={{__html:"&#128266;"}}/>
            {speaking ? "Playing..." : "Listen"}
          </button>
          <div style={{fontSize:11,color:MT.T2,display:"flex",alignItems:"center",gap:4,marginLeft:"auto"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:sMeta.dot,display:"inline-block",flexShrink:0}}></span>
            <span>{sMeta.label}</span>
          </div>
        </div>
      </div>

      <div style={{padding:wideLayout?"2px 6px":"10px 12px 16px",maxWidth:1800,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

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
          <div style={{background:MT.WARN+"18",border:"1px solid "+MT.WARN+"55",borderRadius:8,padding:"4px 8px",marginBottom:gapV,display:"inline-flex",alignItems:"center",gap:6,fontSize:11,fontWeight:800,color:MT.WARN}}>
            <span>&#9888;</span> DEMO DATA &#8212; NOT LIVE
          </div>
        ) : null}
        {/* CURRENT MOOD - single clean primary status, per explicit instruction
            to remove duplication. Previously showed the mood 4 times (gauge
            visual + pills + title + AI Bias) - now shows it exactly once. */}
        <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"1fr 1fr":undefined,gridTemplateRows:ROW1_H?ROW1_H+"px":undefined,gap:gapV,marginBottom:gapV,alignItems:"stretch"}}>
          <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:8,padding:padV,height:"100%",boxSizing:"border-box",display:"flex",flexDirection:"column",justifyContent:"center",overflowY:"auto",minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{width:9,height:9,borderRadius:"50%",background:moodColor,flexShrink:0}}></span>
              <span style={{fontSize:16,fontWeight:900,color:moodColor}}>{mood.label.toUpperCase()}</span>
            </div>
            <div style={{fontSize:11,color:MT.T2}}>{mood.stage} &nbsp;&#183;&nbsp; {mood.confidence} {t("confidence")} &nbsp;&#183;&nbsp; {t("ai_score")}: {mood.score}/100</div>
            {mm.lastUpdated ? <div style={{fontSize:9,color:MT.T3,marginTop:2}}>Updated {new Date(mm.lastUpdated).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"})}</div> : null}
          </div>
          <StageTimeline mood={mood} evolution={evolution}/>
        </div>

        {/* MARKET MOOD BREAKDOWN + WHY/WATCH/CHANGED/DRIVERS - single row on wide screens, Breakdown as one column beside the 4-card intelligence grid, matching the reference layout */}
        <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"1fr 1.5fr":undefined,gridTemplateRows:ROW2_H?ROW2_H+"px":undefined,gap:gapV,marginBottom:gapV,alignItems:"stretch"}}>
          <div style={{marginBottom:wideLayout?0:8,height:"100%",display:"flex",flexDirection:"column",minHeight:0,minWidth:0}}>
            <SectionHead>
              <span style={{display:"inline-flex",alignItems:"center",gap:5}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={MT.T2} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                  <polyline points="2 14 8 14 10 8 14 18 16 11 19 11 22 14"/>
                </svg>
                {t("mood_breakdown").toUpperCase()}
              </span>
            </SectionHead>
            <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:8,padding:padV,flex:1,minHeight:0,overflowY:"auto",boxSizing:"border-box"}}>
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

          {(function(){
            var haveWhy = ai && ai.now;
            var haveWatch = ai && ai.watchNext;
            var haveChanged = ai && ai.whatChanged;
            var haveDrivers = ai && ai.keyDrivers && ai.keyDrivers.length;
            var anyReal = haveWhy || haveWatch || haveChanged || haveDrivers;

            if(!anyReal){
              // Keep unavailable intelligence compact on every device. Empty
              // desktop cards waste valuable terminal space and make the page
              // look unfinished.
              return (
                <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:8,padding:padV,boxSizing:"border-box",width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",overflowY:"auto",minWidth:0}}>
                  <div style={{fontSize:10,fontWeight:800,color:MT.T2,marginBottom:2}}>{t("market_intel").toUpperCase()}</div>
                  <div style={{fontSize:11,color:MT.T2}}>Analysis update in progress. Core market score remains available.</div>
                </div>
              );
            }

            return (
          <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"1fr 1fr":undefined,gap:gapV,height:wideLayout?"100%":undefined,overflowY:wideLayout?"auto":undefined,boxSizing:"border-box",minWidth:0}}>
          {wideLayout || haveWhy ? (
          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>WHY THIS MOOD?</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:padV,boxSizing:"border-box"}}>
              {!ai ? (
                <div style={{fontSize:11,color:MT.T2}}>Analysis update in progress. Core market score remains available.</div>
              ) : ai.now ? (
                <div style={{fontSize:11,color:MT.T1,lineHeight:1.35}}>{ai.now}</div>
              ) : (
                <div style={{fontSize:11,color:MT.T2}}>No verified reasoning available right now.</div>
              )}
            </div>
          </div>
          ) : null}
          {wideLayout || haveWatch ? (
          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>{t("what_to_watch").toUpperCase()}?</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:padV,boxSizing:"border-box"}}>
              {ai && ai.watchNext ? (
                <div style={{fontSize:11,color:MT.T1,lineHeight:1.35}}>{ai.watchNext}</div>
              ) : (
                <div style={{fontSize:11,color:MT.T2}}>No verified watch-level data available right now.</div>
              )}
            </div>
          </div>
          ) : null}
          {wideLayout || haveChanged ? (
          <div style={{marginBottom:wideLayout?0:8}}>
            <SectionHead>WHAT CHANGED?</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:padV,boxSizing:"border-box"}}>
              {ai && ai.whatChanged ? (
                <div style={{fontSize:11,color:MT.T1,lineHeight:1.35}}>{ai.whatChanged}</div>
              ) : (
                <div style={{fontSize:11,color:MT.T2}}>No verified change data available right now.</div>
              )}
            </div>
          </div>
          ) : null}
          {wideLayout || haveDrivers ? (
          <div>
            <SectionHead>KEY DRIVERS</SectionHead>
            <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:padV,boxSizing:"border-box"}}>
              {ai && ai.keyDrivers && ai.keyDrivers.length ? (
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {ai.keyDrivers.map(function(d,i){
                    return <span key={i} style={{fontSize:12,color:MT.T2,background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:6,padding:"4px 8px"}}>{d}</span>;
                  })}
                </div>
              ) : (
                <div style={{fontSize:11,color:MT.T2}}>No verified driver data available right now.</div>
              )}
            </div>
          </div>
          ) : null}
          </div>
            );
          })()}
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
          {status==="ok" && ai ? "Live data" : status==="ok" && !ai ? "Score available, analysis updating" : "Data unavailable right now."}
        </div>

        {/* MARKET SNAPSHOT - one compact card, 4-column grid inside, same real index data as below */}
        <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:8,padding:padV,marginBottom:gapV,height:ROW3_H?ROW3_H+"px":undefined,boxSizing:"border-box",display:wideLayout?"flex":undefined,flexDirection:wideLayout?"column":undefined}}>
          <div style={{fontSize:10,fontWeight:800,color:MT.T1,marginBottom:4,flexShrink:0}}>{t("market_snapshot").toUpperCase()}</div>
          <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"repeat(auto-fit, minmax(160px, 1fr))":"repeat(2, minmax(0, 1fr))",gap:wideLayout?6:6,flex:wideLayout?1:undefined,minHeight:wideLayout?0:undefined,overflowY:wideLayout?"auto":undefined}}>
            {[["NIFTY", niftyRow], ["BANKNIFTY", bankRow], ["SENSEX", sensexRow], ["GIFTNIFTY", null], ["VIX", vixRow]].map(function(pair,i){
              var key = pair[0], row = pair[1];
              if(key==="GIFTNIFTY"){
                return (
                  <div key={i} style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:8,padding:"6px 7px",marginBottom:wideLayout?0:6,boxSizing:"border-box",minWidth:0,minHeight:wideLayout?76:0}}>
                    <div style={{fontSize:10,fontWeight:700,color:MT.T2,marginBottom:2}}>GIFT NIFTY</div>
                    <div style={{fontSize:11,color:MT.T2}}>Unavailable</div>
                    <div style={{fontSize:9,color:MT.T3,marginTop:2}}>No verified provider connected yet.</div>
                  </div>
                );
              }
              var lvl = DEMO_LEVELS[key];
              var clickable = row.available && (key==="NIFTY"||key==="BANKNIFTY"||key==="SENSEX");
              return (
                <div key={i} onClick={clickable?function(){setSelectedIdx(key);}:undefined} style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:8,padding:"6px 7px",marginBottom:wideLayout?0:6,boxSizing:"border-box",minWidth:0,minHeight:wideLayout?76:0,cursor:clickable?"pointer":"default"}}>
                  <div style={{fontSize:10,fontWeight:700,color:MT.T2,marginBottom:2}}>{row.name}</div>
                  {row.available ? (
                    <div>
                      <div style={{fontSize:13,fontWeight:800,color:MT.T1}}>{row.ltp}</div>
                      <div style={{fontSize:10,fontWeight:700,color:(row.up==null||row.absChange==="0"||row.absChange==="+0")?MT.T2:(row.up?MT.SENT_GREEN:MT.SENT_RED)}}>{row.up==null?"":(row.up?"\u25b2 ":"\u25bc ")}{row.absChange ? row.absChange+" " : ""}({row.chgPct})</div>
                      {row.dayLow && row.dayHigh ? <div style={{fontSize:9,color:MT.T3,marginTop:1}}>Low: {row.dayLow} &nbsp; High: {row.dayHigh}</div> : null}
                      {!usingDemo && data && data.indexHistory && data.indexHistory[key] && data.indexHistory[key].points && data.indexHistory[key].points.length>=2 ? (
                        <div style={{marginTop:4}}><Sparkline points={data.indexHistory[key].points} inverse={key==="VIX"} height={28}/></div>
                      ) : null}
                      {usingDemo && lvl ? (
                        <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid "+MT.BD,fontSize:11,color:MT.T2}}>
                          <div>{t("support_lvl")}: <b style={{color:MT.T1}}>{lvl.support.toLocaleString("en-IN")}</b></div>
                          <div>{t("resistance_lvl")}: <b style={{color:MT.T1}}>{lvl.resistance.toLocaleString("en-IN")}</b></div>
                          <div>Trend: <b style={{color:MT.SENT_RED}}>{lvl.trend}</b></div>
                        </div>
                      ) : null}
                    </div>
                  ) : <div style={{fontSize:11,color:MT.T2}}>{t("data_unavailable")}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* SESSION / SECTOR ROTATION / MARKET BREADTH / GLOBAL MARKETS - single 4-column row on wide screens (was 3 separate blocks), matching the reference layout density */}
        <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"repeat(4, 1fr)":undefined,gridTemplateRows:ROW4_H?ROW4_H+"px":undefined,gap:gapV,marginBottom:gapV,alignItems:"stretch"}}>
          <div style={{marginBottom:wideLayout?0:8,minWidth:0,height:wideLayout?"100%":undefined,display:wideLayout?"flex":undefined,flexDirection:wideLayout?"column":undefined}}>
            <SectionHead>{t("prev_current_session").toUpperCase()}</SectionHead>
            <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,overflow:wideLayout?"auto":"hidden",flex:wideLayout?1:undefined,minHeight:wideLayout?0:undefined}}>
              <IndexRow row={niftyRow}/>
              <IndexRow row={sensexRow}/>
              <IndexRow row={bankRow}/>
            </div>
          </div>

          <div style={{marginBottom:wideLayout?0:8,minWidth:0,height:wideLayout?"100%":undefined,display:wideLayout?"flex":undefined,flexDirection:wideLayout?"column":undefined}}>
            {sectorSection.available ? (
              <div style={{display:wideLayout?"flex":undefined,flexDirection:wideLayout?"column":undefined,height:wideLayout?"100%":undefined,minHeight:0}}>
                <SectionHeadWithPill status={sectorSection.status}>{t("sector_rotation").toUpperCase()}</SectionHeadWithPill>
                <div style={{flex:wideLayout?1:undefined,minHeight:wideLayout?0:undefined,overflowY:wideLayout?"auto":undefined}}>
                  <GridWrap columns={2}>
                    {rankedSectors.map(function(s,i){
                      var color = (s.chgPct==null || s.chgPct===0) ? MT.T2 : (s.up?MT.SENT_GREEN:MT.SENT_RED);
                      return (
                        <div key={i} style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:8,padding:7}}>
                          <div style={{fontSize:10,color:MT.T1,fontWeight:700}}>{s.name}</div>
                          <div style={{fontSize:10,color:color,marginTop:1}}>{s.chgPct!=null ? (s.chgPct>=0?"+":"")+s.chgPct+"%" : "--"}</div>
                        </div>
                      );
                    })}
                  </GridWrap>
                </div>
              </div>
            ) : (
              <div>
                <SectionHead>{t("sector_rotation").toUpperCase()}</SectionHead>
                <UnavailableCard title="Sector Rotation" hideTitle={true} note="No verified sector-index provider connected yet."/>
              </div>
            )}
          </div>

          <div style={{marginBottom:wideLayout?0:8,minWidth:0,height:wideLayout?"100%":undefined,display:wideLayout?"flex":undefined,flexDirection:wideLayout?"column":undefined}}>
            <SectionHead>{t("market_breadth").toUpperCase()}</SectionHead>
            {usingDemo ? (
              <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:8,padding:padV,flex:wideLayout?1:undefined,minHeight:wideLayout?0:undefined,overflowY:wideLayout?"auto":undefined}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,textAlign:"center"}}>
                  <div><div style={{fontSize:10,color:MT.T3}}>Advances</div><div style={{fontSize:13,fontWeight:800,color:MT.SENT_GREEN}}>{DEMO_BREADTH.advances} ({DEMO_BREADTH.advPct}%)</div></div>
                  <div><div style={{fontSize:10,color:MT.T3}}>Declines</div><div style={{fontSize:13,fontWeight:800,color:MT.SENT_RED}}>{DEMO_BREADTH.declines} ({DEMO_BREADTH.decPct}%)</div></div>
                  <div><div style={{fontSize:10,color:MT.T3}}>Unchanged</div><div style={{fontSize:13,fontWeight:800,color:MT.T1}}>{DEMO_BREADTH.unchanged} ({DEMO_BREADTH.unchPct}%)</div></div>
                </div>
              </div>
            ) : <UnavailableCard title="Market Breadth" hideTitle={true} note="No verified advance/decline provider connected yet."/>}
          </div>

          <div style={{minWidth:0,height:wideLayout?"100%":undefined,display:wideLayout?"flex":undefined,flexDirection:wideLayout?"column":undefined}}>
            {globalSection.available ? (
              <div style={{display:wideLayout?"flex":undefined,flexDirection:wideLayout?"column":undefined,height:wideLayout?"100%":undefined,minHeight:0}}>
                <SectionHeadWithPill status={globalSection.status}>{t("global_markets").toUpperCase()}</SectionHeadWithPill>
                <div style={{flex:wideLayout?1:undefined,minHeight:wideLayout?0:undefined,overflowY:wideLayout?"auto":undefined}}>
                  <GridWrap columns={2}>
                    {globalSection.items.map(function(g,i){
                      var color = (g.chgPct==null || g.chgPct===0) ? MT.T2 : (g.up?MT.SENT_GREEN:MT.SENT_RED);
                      return (
                        <div key={i} style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:8,padding:7}}>
                          <div style={{fontSize:10,color:MT.T1,fontWeight:700}}>{g.name}</div>
                          <div style={{fontSize:10,color:color,marginTop:1}}>{g.chgPct!=null ? (g.chgPct>=0?"+":"")+g.chgPct+"%" : "--"}</div>
                        </div>
                      );
                    })}
                  </GridWrap>
                </div>
              </div>
            ) : (
              <div>
                <SectionHead>{t("global_markets").toUpperCase()}</SectionHead>
                <UnavailableCard title="Global Markets" hideTitle={true} note="No verified global-index provider connected yet."/>
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
        <div style={{display:wideLayout?"grid":"block",gridTemplateColumns:wideLayout?"repeat(4, 1fr)":undefined,gridTemplateRows:ROW5_H?ROW5_H+"px":undefined,gap:gapV,marginBottom:gapV,alignItems:"stretch"}}>
          <div style={{marginBottom:wideLayout?0:8,minWidth:0,height:wideLayout?"100%":undefined,display:wideLayout?"flex":undefined,flexDirection:wideLayout?"column":undefined,overflowY:wideLayout?"auto":undefined}}>
            <SectionHead>{t("three_day_evolution").toUpperCase()}</SectionHead>
            {usingDemo ? (
              <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:8,padding:padV}}>
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
          <div style={{marginBottom:wideLayout?0:8,minWidth:0,height:wideLayout?"100%":undefined,display:wideLayout?"flex":undefined,flexDirection:wideLayout?"column":undefined}}>
            <SectionHead>{t("risk_level").toUpperCase()}</SectionHead>
            <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:8,padding:padV,flex:wideLayout?1:undefined,minHeight:wideLayout?0:undefined,overflowY:wideLayout?"auto":undefined}}>
              {usingDemo ? (
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:MT.SENT_RED,marginBottom:4}}>{DEMO_RISK.level}</div>
                  <div style={{fontSize:12,color:MT.T3}}>{DEMO_RISK.note}</div>
                </div>
              ) : vixRow && vixRow.available ? (function(){
                var vixNum = parseFloat(String(vixRow.ltp).replace(/,/g,""));
                var riskLabel = isNaN(vixNum) ? null : (vixNum<13?"Low":(vixNum<=18?"Moderate":"High"));
                var riskColor = riskLabel==="Low"?MT.SENT_GREEN:(riskLabel==="High"?MT.SENT_RED:MT.SENT_YELLOW);
                return riskLabel ? (
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:riskColor,marginBottom:4}}>{riskLabel}</div>
                    <div style={{fontSize:11,color:MT.T3}}>VIX-based: &lt;13 Low, 13-18 Mod, &gt;18 High</div>
                  </div>
                ) : <div style={{fontSize:11,color:MT.T2}}>No verified VIX value available right now.</div>;
              })() : <div style={{fontSize:11,color:MT.T2}}>No verified VIX value available right now.</div>}
            </div>
          </div>
          <div style={{marginBottom:wideLayout?0:8,minWidth:0,height:wideLayout?"100%":undefined,display:wideLayout?"flex":undefined,flexDirection:wideLayout?"column":undefined}}>
            <SectionHead>{t("ai_trade_bias").toUpperCase()}</SectionHead>
            <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:8,padding:padV,flex:wideLayout?1:undefined,minHeight:wideLayout?0:undefined,overflowY:wideLayout?"auto":undefined}}>
              {mood && mood.score!=null ? (
                <div style={{fontSize:13,fontWeight:800,color:mood.label.indexOf("Bullish")>=0?MT.SENT_GREEN:(mood.label.indexOf("Bearish")>=0?MT.SENT_RED:MT.SENT_YELLOW)}}>{usingDemo ? DEMO_TRADE_BIAS.label : mood.stage}</div>
              ) : <div style={{fontSize:11,color:MT.T2}}>No verified mood data available right now.</div>}
              <div style={{fontSize:12,color:MT.T3,marginTop:6}}>{usingDemo ? DEMO_TRADE_BIAS.note : "Educational market bias only. Not a trading instruction."}</div>
            </div>
          </div>
          <div style={{background:MT.WARN+"14",border:"1px solid "+MT.WARN+"55",borderRadius:8,padding:padV,minWidth:0,boxSizing:"border-box",overflowY:wideLayout?"auto":undefined}}>
            <div style={{fontSize:11,fontWeight:800,color:MT.WARN,marginBottom:6}}>Educational Market Observation Only. Not Investment Advice.</div>
            <div style={{fontSize:10,color:MT.T2,lineHeight:1.35}}>This analysis is for educational purposes only and should not be considered as investment advice.</div>
          </div>
        </div>

        {/* FOOTER DATA STATUS - compact, real status only */}
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,fontSize:9,color:MT.T3,paddingTop:5,borderTop:"1px solid "+MT.BD}}>
          <span>All data is end-of-day unless otherwise stated &#8226; Market data providers not connected</span>
          <span>AI Market Mood Score is deterministic and data-driven.</span>
        </div>

          </>
        )}

      </div>

      {/* INDEX DETAIL PANEL - opened by clicking NIFTY/BANKNIFTY/SENSEX in
          Market Snapshot. Reuses the same real idx.X data already flowing
          through this page - no new data pipeline. Pivot/R1/R2/S1/S2/CPR
          use the same real high/low/ltp formula already established
          elsewhere in this app. Anything not genuinely available (options
          OI, market breadth, historical ATH/returns, news) is shown as an
          honest "Not available" rather than reusing the old
          IndexFullPage.jsx/IndexFullData.jsx, whose own header comment
          says "Mock now, real later" - that data is fabricated and was
          deliberately not reused here. */}
      {selectedIdx ? (function(){
        var raw = idx[selectedIdx];
        var label = selectedIdx==="NIFTY"?"NIFTY 50":(selectedIdx==="BANKNIFTY"?"BANK NIFTY":"SENSEX");
        var row = selectedIdx==="NIFTY"?niftyRow:(selectedIdx==="BANKNIFTY"?bankRow:sensexRow);
        var hasLevels = raw && raw.ltp!=null && raw.high!=null && raw.low!=null;
        var pivot=null,r1=null,r2=null,s1=null,s2=null,bc=null,tc=null;
        if(hasLevels){
          pivot=(raw.high+raw.low+raw.ltp)/3;
          r1=Math.round(((2*pivot)-raw.low)*100)/100;
          s1=Math.round(((2*pivot)-raw.high)*100)/100;
          r2=Math.round((pivot+(raw.high-raw.low))*100)/100;
          s2=Math.round((pivot-(raw.high-raw.low))*100)/100;
          bc=Math.round(((raw.high+raw.low)/2)*100)/100;
          tc=Math.round(((2*pivot)-bc)*100)/100;
        }
        var chgColor = (row.up==null||row.absChange==="0"||row.absChange==="+0")?MT.T2:(row.up?MT.SENT_GREEN:MT.SENT_RED);
        return (
          <div onClick={function(){setSelectedIdx(null);}} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(17,24,39,0.4)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
            <div onClick={function(e){e.stopPropagation();}} style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:10,width:"100%",maxWidth:480,maxHeight:"85vh",overflowY:"auto",padding:16,boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:15,fontWeight:900,color:MT.T1}}>{label}</span>
                <button onClick={function(){setSelectedIdx(null);}} style={{background:"none",border:"none",fontSize:18,color:MT.T2,cursor:"pointer",lineHeight:1}}>&#10005;</button>
              </div>
              <div style={{fontSize:24,fontWeight:900,color:MT.T1,marginBottom:2}}>{row.ltp}</div>
              <div style={{fontSize:13,fontWeight:700,color:chgColor,marginBottom:10}}>{row.absChange?row.absChange+" ":""}({row.chgPct})</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                <div><div style={{fontSize:9,color:MT.T3}}>Day High</div><div style={{fontSize:12,fontWeight:700,color:MT.T1}}>{row.dayHigh||"--"}</div></div>
                <div><div style={{fontSize:9,color:MT.T3}}>Day Low</div><div style={{fontSize:12,fontWeight:700,color:MT.T1}}>{row.dayLow||"--"}</div></div>
                <div><div style={{fontSize:9,color:MT.T3}}>Previous Close</div><div style={{fontSize:12,fontWeight:700,color:MT.T1}}>{row.prevClose||"--"}</div></div>
                <div><div style={{fontSize:9,color:MT.T3}}>Market Status</div><div style={{fontSize:12,fontWeight:700,color:MT.T1}}>{sMeta.label||"--"}</div></div>
              </div>
              {hasLevels ? (
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:800,color:MT.T2,marginBottom:4}}>SUPPORT / RESISTANCE (real pivot calc)</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,fontSize:11}}>
                    <span>R2 <b style={{color:MT.SENT_RED}}>{r2.toLocaleString("en-IN")}</b></span>
                    <span>R1 <b style={{color:MT.SENT_RED}}>{r1.toLocaleString("en-IN")}</b></span>
                    <span>Pivot <b style={{color:MT.T1}}>{Math.round(pivot*100)/100}</b></span>
                    <span>S1 <b style={{color:MT.SENT_GREEN}}>{s1.toLocaleString("en-IN")}</b></span>
                    <span>S2 <b style={{color:MT.SENT_GREEN}}>{s2.toLocaleString("en-IN")}</b></span>
                  </div>
                  <div style={{fontSize:10,color:MT.T3,marginTop:4}}>CPR: BC {bc.toLocaleString("en-IN")} &ndash; TC {tc.toLocaleString("en-IN")}</div>
                </div>
              ) : null}
              <div style={{fontSize:10,color:MT.T3,marginBottom:10}}>Data timestamp/status: {row.freshnessText||"--"}</div>
              <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:8,padding:10,fontSize:11,color:MT.T2,lineHeight:1.5}}>
                Options OI/PCR, market breadth, historical ATH/returns and news for this index are not available - no verified provider connected yet for per-index history.
              </div>
            </div>
          </div>
        );
      })() : null}

    </div>
  );
}
