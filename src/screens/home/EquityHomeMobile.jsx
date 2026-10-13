import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import { JUSTIN } from "../JustInData";
import MarketBadge from "./MarketBadge";
import { t, termHelp, useLang } from "../../i18n/translations";

// BreakoutPro - EquityHomeMobile.jsx
// The Mobile Home layout - UI only. All data comes from useHomeData(), the
// single shared hook also used by Tablet/Laptop/Desktop. This file owns its
// own presentational Card/Sparkline helpers so it can be edited
// freely without ever affecting the other device layouts.
// Rules: no backtick, no triple-equals, ASCII.

export default function EquityHomeMobile(props){
  useLang();
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG=theme.c.bg, CARD=theme.c.card, BD=theme.c.border;
  var BLUE=theme.c.blue, PROBLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down, WARN=theme.c.warn;
  var SENT_GREEN="#087443", SENT_RED="#C62828", SENT_YELLOW="#EAB308";
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;

  // LIVE BREAKOUTS - reuses the existing real /api/scanner-data endpoint,
  // same one already used by EquityHomeDesktop.jsx/EquityHomeLaptop.jsx.
  // No new polling system, no new provider.
  var [scannerResults, setScannerResults] = useState(null);
  useEffect(function(){
    var cancelled = false;
    fetch("/api/scanner-data").then(function(r){ return r.json(); }).then(function(j){
      if(!cancelled && j && j.ok!==false && j.results) setScannerResults(j.results);
    }).catch(function(){});
    return function(){ cancelled = true; };
  }, []);

  function Card(p){
    return (
      <div onClick={p.onDetails||undefined} style={{width:"100%",boxSizing:"border-box",background:CARD,border:"1px solid "+(p.hero?BLUE:BD),borderRadius:14,padding:p.hero?11:9,marginBottom:7,cursor:p.onDetails?"pointer":"default",minHeight:p.minHeight||undefined}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
          <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,flex:1}}>
            {p.icon ? <span style={{fontSize:13,flexShrink:0,lineHeight:1}} dangerouslySetInnerHTML={{__html:p.icon}}/> : null}
            <span style={{fontSize:12,fontWeight:800,color:T1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</span>
          </div>
        </div>
        {p.children}
      </div>
    );
  }

  return (
    <div style={{background:BG,minHeight:"100vh",width:"100%",boxSizing:"border-box",overflowX:"hidden",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:84,color:T1}}>

      {/* 1. HEADER */}
      <div style={{width:"100%",boxSizing:"border-box",background:BG,borderBottom:"1px solid "+BD,padding:"10px 12px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,flex:1}}>
            <button aria-label={t("aria.menu")} onClick={function(){ if(props.onMenu){props.onMenu();} else {setTab("more");} }} style={{background:"none",border:"none",padding:2,cursor:"pointer",flexShrink:0,minWidth:36,minHeight:36}}>
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
            <button aria-label={t("aria.search")} onClick={function(){setTab("search");}} style={{background:"none",border:"none",padding:2,cursor:"pointer",minWidth:36,minHeight:36}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <button aria-label={t("aria.alerts")} onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",padding:2,cursor:"pointer",position:"relative",minWidth:36,minHeight:36}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <div style={{position:"absolute",top:0,right:0,width:5,height:5,borderRadius:"50%",background:BLUE,border:"1px solid "+BG}}/>
            </button>
          </div>
        </div>
      </div>

      <div style={{width:"100%",boxSizing:"border-box",padding:"7px 9px 0"}}>

        {/* 4. AI MARKET MOOD */}
        <Card title={t("home.mood_title")} icon="&#129504;" onDetails={function(){setTab("marketmood");}}>
          {mm.status=="loading" && !mm.data ? (
            <div style={{fontSize:11,color:T2}}>{t("c.loading")}</div>
          ) : (function(){
            var hasReal = mm.mood && mm.mood.score!=null;
            if(!hasReal){
              return <div style={{fontSize:11,color:T2}}>{t("c.analysis_loading")}</div>;
            }
            var mood = mm.mood;
            var ai = mm.ai;
            var moodColor = mood.label.indexOf("Bullish")>=0?SENT_GREEN:(mood.label.indexOf("Bearish")>=0?SENT_RED:SENT_YELLOW);
            return (
              <div style={{width:"100%",boxSizing:"border-box"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:moodColor,flexShrink:0}}></span>
                  <span style={{fontSize:15,fontWeight:900,color:moodColor}}>{t("mood."+mood.label, mood.label).toUpperCase()}</span>
                </div>
                <div style={{fontSize:11,color:T2,marginBottom:8}}>{t("stage."+mood.stage, mood.stage)} &nbsp;&#183;&nbsp; {t("home.conf_suffix",{c:t("conf."+mood.confidence, mood.confidence)})} &nbsp;&#183;&nbsp; {t("home.ai_score",{n:mood.score})}</div>
                {(function(){
                  var idx = mm.data && mm.data.indices;
                  var tiles = [["NIFTY 50","NIFTY"],["BANK NIFTY","BANKNIFTY"],["INDIA VIX","VIX"]];
                  return (
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:6,marginBottom:8}}>
                      {tiles.map(function(tl){
                        var d = idx && idx[tl[1]];
                        var up = d && d.chgPct!=null ? d.chgPct>=0 : null;
                        return (
                          <div key={tl[1]} style={{background:BG,border:"1px solid "+BD,borderRadius:6,padding:"4px 6px",minWidth:0}}>
                            <div title={termHelp(tl[0])} style={{fontSize:8,color:T3,fontWeight:700}}>{tl[0]}</div>
                            {d && d.ltp!=null ? (
                              <div>
                                <div style={{fontSize:11,fontWeight:800,color:T1}}>{typeof d.ltp==="number"?d.ltp.toLocaleString("en-IN"):d.ltp}</div>
                                <div style={{fontSize:9,fontWeight:700,color:up==null?T2:(up?UP:DOWN)}}>{d.chgPct!=null?(d.chgPct>=0?"+":"")+d.chgPct+"%":"--"}</div>
                              </div>
                            ) : <div style={{fontSize:9,color:T3}}>{t("c.unavailable")}</div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:10,color:T2,fontWeight:700,marginBottom:2}}>{t("home.key_signal")}</div>
                  {ai && (ai.now || ai.whatChanged || (ai.keyDrivers && ai.keyDrivers.length)) ? (
                    <div>
                      {ai.now ? <div style={{fontSize:11,color:T1,lineHeight:1.4,marginBottom:4}}>{ai.now}</div> : null}
                      {ai.whatChanged ? <div style={{fontSize:11,color:T2,lineHeight:1.4,marginBottom:4}}><b style={{color:T1}}>{t("home.what_changed")}</b>{ai.whatChanged}</div> : null}
                      {ai.keyDrivers && ai.keyDrivers.length ? (
                        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                          {ai.keyDrivers.map(function(d,i){
                            return <span key={i} style={{fontSize:10,color:T2,background:theme.c.card2,border:"1px solid "+BD,borderRadius:6,padding:"2px 7px"}}>{d}</span>;
                          })}
                        </div>
                      ) : null}
                    </div>
                  ) : <div style={{fontSize:11,color:T2}}>{t("c.data_unavailable")}</div>}
                </div>
                <div>
                  <div style={{fontSize:10,color:T2,fontWeight:700,marginBottom:2}}>{t("home.watch_q")}</div>
                  {ai && ai.watchNext ? <div style={{fontSize:11,color:T1,lineHeight:1.4}}>{ai.watchNext}</div> : <div style={{fontSize:11,color:T2}}>{t("c.data_unavailable")}</div>}
                </div>
              </div>
            );
          })()}
        </Card>

        {/* Range Intelligence (real data) + Options Intelligence (DEMO,
            clearly labeled), grouped visually in one card but keeping both
            canonical feature names visible - per explicit correction,
            "Market Structure" must not be used as a feature name anywhere.
            Internally stacked (not side-by-side) since Mobile is
            single-column. */}
        {(function(){
          var nifty = mm.data && mm.data.indices && mm.data.indices.NIFTY;
          var hasRange = nifty && nifty.ltp!=null && nifty.high!=null && nifty.low!=null && nifty.high>nifty.low;
          var rangeBlock;
          if(!hasRange){
            rangeBlock = (
              <div style={{marginBottom:8}}>
                <div style={{fontSize:11,color:T2}}>{t("home.range_none")}</div>
              </div>
            );
          } else {
            var width = nifty.high - nifty.low;
            var rawPosPct = ((nifty.ltp - nifty.low) / width) * 100;
            var posPct = Math.round(Math.max(0, Math.min(100, rawPosPct)));
            var zone = posPct<=20?"Near Low":(posPct<=40?"Lower Range":(posPct<=60?"Mid Range":(posPct<=80?"Upper Range":"Near High")));
            var state = posPct>=80?"Breakout Watch":(posPct<=20?"Breakdown Watch":"Balanced");
            var stateColor = state==="Breakout Watch"?UP:(state==="Breakdown Watch"?DOWN:T1);
            rangeBlock = (
              <div style={{marginBottom:8}}>
                <div style={{fontSize:11,color:T2,marginBottom:4}}>NIFTY: {nifty.low.toLocaleString("en-IN")}&ndash;{nifty.high.toLocaleString("en-IN")} &middot; <span title={termHelp("CMP")}>CMP</span> {nifty.ltp.toLocaleString("en-IN")}</div>
                <div style={{position:"relative",height:14,marginBottom:4}}>
                  <div style={{position:"absolute",top:6,left:0,right:0,height:2,background:BD}}></div>
                  <div style={{position:"absolute",top:2,left:"calc("+posPct+"% - 5px)",width:10,height:10,borderRadius:"50%",background:BLUE,border:"2px solid "+CARD}}></div>
                </div>
                <div style={{fontSize:12,fontWeight:800,color:stateColor}}>{posPct}% &middot; {t("home.zone."+zone, zone)} &middot; {t("home.state."+state, state)}</div>
              </div>
            );
          }
          return (
            <Card title={t("home.range_title")} icon="&#128640;" onDetails={function(){setTab("rangeintel");}}>
              {rangeBlock}
              <div style={{borderTop:"1px solid "+BD,paddingTop:8}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:800,color:T1}}>{t("home.options_title")}</span>
                  <span style={{fontSize:8,fontWeight:800,color:WARN,background:WARN+"18",border:"1px solid "+WARN+"55",borderRadius:4,padding:"1px 5px"}}>{t("home.demo")}</span>
                </div>
                <div style={{fontSize:10,color:T3,marginBottom:1}}><span title={termHelp("PCR")}>PCR</span> <span style={{color:T1,fontWeight:700}}>1.02</span> &middot; <span title={termHelp("Max Pain")}>Max Pain</span> <span style={{color:T1,fontWeight:700}}>24,600</span></div>
                <div style={{fontSize:10,color:T3,marginBottom:1}}>Call Wall <span style={{color:T1,fontWeight:700}}>24,800</span> &middot; Put Wall <span style={{color:T1,fontWeight:700}}>24,400</span></div>
                <div style={{fontSize:10,color:T3,marginBottom:1}}><span title={termHelp("OI")}>{t("home.oi_insight")}</span> <span style={{color:T1,fontWeight:700}}>{t("home.oi_insight_text")}</span></div>
                <div style={{fontSize:9,color:T3}}>{t("home.options_example")}</div>
              </div>
            </Card>
          );
        })()}

        {/* MARKET ALERTS - no verified alert-generation source exists
            anywhere in this codebase, matching Desktop/Laptop's honest
            unavailable state. */}
        <Card title={t("home.market_alerts")} icon="&#128276;">
          <div style={{fontSize:11,color:T2}}>{t("home.alerts_none")}</div>
        </Card>

        <Card title={t("home.market_news")} icon="&#128240;" onDetails={function(){setTab("news");}}>
          {JUSTIN.length===0 ? (
            <div style={{fontSize:11,color:T2}}>{t("home.news_none")}</div>
          ) : JUSTIN.slice(0,3).map(function(n){
            return (
              <div key={n.id} style={{padding:"5px 0",borderBottom:"1px solid "+BD}}>
                <div style={{fontSize:11,fontWeight:700,color:T1,marginBottom:2}}>{n.headline}</div>
                <div style={{fontSize:10,color:T2}}>{n.time} &#183; {n.source}</div>
              </div>
            );
          })}
        </Card>

        {/* MARKET BREADTH / FII-DII / LATEST ALERTS - no real provider
            exists anywhere in this codebase for any of these three, shown
            honestly unavailable with structure intact (same pattern as
            Desktop). GLOBAL MARKETS and KEY LEVELS use real data already
            confirmed on Desktop, previously missing from Mobile. */}
        <Card title={t("home.breadth_title")} icon="&#128202;">
          <div style={{fontSize:11,color:T2}}>{t("home.breadth_none")}</div>
        </Card>

        <Card title={t("home.fiidii_title")} icon="&#128176;">
          <div style={{fontSize:11,color:T2}}>{t("home.fiidii_none")}</div>
        </Card>

        <Card title={t("home.latest_alerts")} icon="&#128276;">
          <div style={{fontSize:11,color:T2}}>{t("home.alerts_none")}</div>
        </Card>

        {(function(){
          var global = mm.data && mm.data.global;
          var hasGlobal = global && global.status!=="UNAVAILABLE" && global.items && global.items.length;
          if(!hasGlobal){
            return (
              <Card title={t("home.global_title")} icon="&#127760;">
                <div style={{fontSize:11,color:T2}}>{t("home.global_none")}</div>
              </Card>
            );
          }
          return (
            <Card title={t("home.global_title")} icon="&#127760;">
              {global.items.slice(0,4).map(function(g,i){
                return (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderTop:i>0?"1px solid "+BD:"none"}}>
                    <span style={{fontSize:11,color:T2}}>{g.name}</span>
                    <span style={{fontSize:11,fontWeight:700,color:g.up==null?T2:(g.up?UP:DOWN)}}>{g.chgPct!=null?(g.chgPct>=0?"+":"")+g.chgPct+"%":"--"}</span>
                  </div>
                );
              })}
            </Card>
          );
        })()}

        {(function(){
          var nifty = mm.data && mm.data.indices && mm.data.indices.NIFTY;
          var hasLevels = nifty && nifty.ltp!=null && nifty.high!=null && nifty.low!=null;
          if(!hasLevels) return null;
          var pivot = (nifty.high + nifty.low + nifty.ltp) / 3;
          var r1 = Math.round(((2*pivot) - nifty.low)*100)/100;
          var s1 = Math.round(((2*pivot) - nifty.high)*100)/100;
          var pivotR = Math.round(pivot*100)/100;
          return (
            <Card title={t("home.key_levels")} icon="&#127919;">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                <div><div style={{fontSize:9,color:T3}}>{t("home.strong_res")}</div><div style={{fontSize:12,fontWeight:800,color:DOWN}}>{r1.toLocaleString("en-IN")}</div></div>
                <div><div style={{fontSize:9,color:T3}}>{t("home.pivot")}</div><div style={{fontSize:12,fontWeight:800,color:T1}}>{pivotR.toLocaleString("en-IN")}</div></div>
                <div><div style={{fontSize:9,color:T3}}>{t("home.strong_sup")}</div><div style={{fontSize:12,fontWeight:800,color:UP}}>{s1.toLocaleString("en-IN")}</div></div>
              </div>
            </Card>
          );
        })()}

        {/* LIVE BREAKOUTS - compact strip, real scanner data only */}
        {scannerResults && scannerResults.length ? (
          <div style={{padding:"8px 0",display:"flex",gap:10,overflowX:"auto",borderTop:"1px solid "+BD,marginTop:4}}>
            <span style={{fontSize:10,fontWeight:800,color:T2,flexShrink:0}}>{t("home.live_breakouts_caps")}</span>
            {scannerResults.slice(0,6).map(function(r){
              var tagLabel = r.tags.indexOf("breakout")>=0?"Breakout":(r.tags.indexOf("breakdown")>=0?"Breakdown":"Vol Spike");
              var tagColor = r.tags.indexOf("breakout")>=0?UP:(r.tags.indexOf("breakdown")>=0?DOWN:WARN);
              return (
                <div key={r.sym} onClick={function(){setTab("breakoutscan");}} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",flexShrink:0}}>
                  <span style={{fontSize:11,fontWeight:800,color:T1}}>{r.sym}</span>
                  <span style={{fontSize:10,fontWeight:700,color:tagColor}}>{t("home.tag."+tagLabel, tagLabel)}</span>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* QUICK ACTIONS - connects to existing real routes only */}
        <div style={{padding:"8px 0",display:"flex",gap:6}}>
          {[[t("home.qa.scan"),"breakoutscan"],[t("home.qa.learn"),"learn"],[t("home.qa.alert"),"alerts"]].map(function(a){
            return (
              <button key={a[1]} onClick={function(){setTab(a[1]);}} style={{flex:1,background:"transparent",border:"1px solid "+BD,borderRadius:6,padding:"6px 8px",cursor:"pointer",fontSize:10,fontWeight:700,color:T1}}>{a[0]}</button>
            );
          })}
        </div>

      </div>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0}to{opacity:1}}"}</style>
    </div>
  );
}
