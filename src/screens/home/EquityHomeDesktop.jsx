import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useResponsive } from "../../hooks/useResponsive";
import { useHomeData } from "./hooks/useHomeData";
import { getHomeTierConfig } from "../../utils/homeTierDensity";
import ProvenanceBadge from "../../components/ProvenanceBadge";
import { t, termHelp, useLang } from "../../i18n/translations";
import NextMoveHomeCard from "../NextMoveHomeCard";

// BreakoutPro - EquityHomeDesktop.jsx
// The Home dashboard: SIX core active-trader features (AI Market Mood,
// Range Intelligence, Options Intelligence, Market News, Live Breakouts,
// Market Alerts) in a compact 3x2 grid. Market Breadth, FII/DII Flow,
// Latest Alerts, Global Markets and Key Levels are intentionally NOT on
// Home anymore - they were secondary information competing with the core
// six for space; their own screens/routes are untouched, only their Home
// presence was removed. Live Breakouts (real /api/scanner-data) and
// Market Alerts (honest unavailable state, no fabricated alerts) used to
// live outside the grid (a horizontal strip / a 5-up secondary row) - both
// are now first-class cards inside the same 3x2 grid as the other four.
// Every displayed metric renders through ProvenanceBadge - the mandatory
// provenance rule (LIVE/CALCULATED/UNAVAILABLE, never fabricated).
// Rules: no backtick, no triple-equals, ASCII only.
export default function EquityHomeDesktop(props){
  useLang();
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var responsive = useResponsive();
  var tierCfg = getHomeTierConfig(responsive.breakpoint); // Responsive Blueprint v1.0 - single source for this tier's layout values
  var BG=theme.c.bg, CARD2=theme.c.card2, BD=theme.c.border, BD2=theme.c.border2;
  var BLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down, WARN=theme.c.warn;
  // Dedicated sentiment colors (Bearish/Sideways/Bullish) - separate from
  // theme.c.up/down/warn, which are used elsewhere for price ticks and
  // general warnings, not sentiment specifically.
  var SENT_GREEN=theme.c.bull, SENT_RED=theme.c.bear, SENT_YELLOW=theme.c.neutral;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;

  // LIVE BREAKOUTS - reuses the existing real /api/scanner-data endpoint
  // (confirmed real: fetches actual daily candles per symbol, classifies
  // breakout/breakdown/volume-spike deterministically from real data, no
  // Math.random(), no invented values). No new polling system - this is
  // the same endpoint BreakoutScanner.jsx already calls.
  var [scannerResults, setScannerResults] = useState(null);
  useEffect(function(){
    var cancelled = false;
    fetch("/api/scanner-data").then(function(r){ return r.json(); }).then(function(j){
      if(!cancelled && j && j.ok!==false && j.results) setScannerResults(j.results);
    }).catch(function(){});
    return function(){ cancelled = true; };
  }, []);

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",color:T1,overflowX:"hidden",display:"flex",flexDirection:"column"}}>

      {/* MAIN AREA - center workspace */}
      <div style={{flex:1,display:"flex",minHeight:0,width:"100%"}}>

        {/* CENTER WORKSPACE - Next Move Intelligence (left, primary) with Range
            Intelligence, Live Breakouts and Market Alerts stacked on the right. Each card's detailed analysis lives
            on its own dedicated page - Home shows a real-data summary
            only, never a duplicate of the full page. */}
        <div style={{flex:1,minWidth:0,padding:"8px 12px",overflowY:"auto"}}>

          <div style={{display:"grid",gridTemplateColumns:"minmax(0, 1.2fr) minmax(0, 1fr)",gridAutoRows:"auto",gap:8,alignItems:"start"}}>

          {/* NEXT MOVE INTELLIGENCE - Compact trader-first card (direction, price, key levels, data status) with one collapsed Detailed Analysis. Content-driven height: the first grid row grows to fit it. */}
          <div onClick={function(){setTab("marketmood");}} style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",cursor:"pointer",overflowY:"auto",display:"flex",flexDirection:"column",alignSelf:"start"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:tierCfg.widgetTitle+1,fontWeight:800,color:T1}}>{t("home.mood_title")}</span>
              <ProvenanceBadge type="calculated"/>
            </div>
            <NextMoveHomeCard mm={data.mm} fs={tierCfg.secondaryText} wide={true} onOpen={function(){setTab("marketmood");}}/>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:8,minWidth:0}}>

          {/* RANGE INTELLIGENCE - Real data, from api/market-mood-data.js's indices.NIFTY - the
              most recent daily candle IS today's session, so high/low are
              genuinely today's real range. */}
          {(function(){
            var nifty = data.mm && data.mm.data && data.mm.data.indices && data.mm.data.indices.NIFTY;
            var hasRange = nifty && nifty.ltp!=null && nifty.high!=null && nifty.low!=null && nifty.high>nifty.low;
            var rangeContent;
            if(!hasRange){
              rangeContent = (
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                    <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>{t("home.range_title")}</span>
                    <ProvenanceBadge type="unavailable"/>
                  </div>
                  <div style={{fontSize:tierCfg.label,color:T3}}>{t("home.range_none")}</div>
                </div>
              );
            } else {
              var width = nifty.high - nifty.low;
              var rawPosPct = ((nifty.ltp - nifty.low) / width) * 100;
              var posPct = Math.round(Math.max(0, Math.min(100, rawPosPct)));
              var zone = posPct<=20?"Near Low":(posPct<=40?"Lower Range":(posPct<=60?"Mid Range":(posPct<=80?"Upper Range":"Near High")));
              var state = posPct>=80?"Breakout Watch":(posPct<=20?"Breakdown Watch":"Balanced");
              var stateColor = state==="Breakout Watch"?UP:(state==="Breakdown Watch"?DOWN:T1);
              rangeContent = (
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>{t("home.range_title")}</span>
                    <ProvenanceBadge type="calculated"/>
                  </div>
                  <div style={{fontSize:15,fontWeight:900,color:T1,marginBottom:2}}>{nifty.ltp.toLocaleString("en-IN")}</div>
                  <div style={{fontSize:tierCfg.label,color:T3,marginBottom:4}}>{nifty.low.toLocaleString("en-IN")}&ndash;{nifty.high.toLocaleString("en-IN")}</div>
                  <div style={{fontSize:tierCfg.label,fontWeight:700,color:stateColor,marginBottom:4}}>{posPct}% &#8226; {t("home.zone."+zone, zone)}</div>
                  <div style={{fontSize:9,fontWeight:700,color:stateColor}}>{t("home.state."+state, state)}</div>
                </div>
              );
            }
            return (
              <div onClick={function(){setTab("rangeintel");}} style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",cursor:"pointer",overflowY:"auto",display:"flex",flexDirection:"column"}}>
                {rangeContent}
              </div>
            );
          })()}

          {/* LIVE BREAKOUTS - Same real /api/scanner-data
              source that BreakoutScanner.jsx uses (real daily-candle
              classification, no Math.random, no invented values) -
              previously a horizontal strip below the grid, now its own
              core card so it gets equal Home-page prominence. Not
              duplicated into Market Alerts - each feature owns its own
              information. */}
          <div style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",overflowY:"auto",display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>{t("home.live_breakouts")}</span>
              <ProvenanceBadge type={scannerResults && scannerResults.length ? "calculated" : "unavailable"}/>
            </div>
            {scannerResults && scannerResults.length ? scannerResults.slice(0,4).map(function(r){
              var tagLabel = r.tags.indexOf("breakout")>=0?"Breakout":(r.tags.indexOf("breakdown")>=0?"Breakdown":"Vol Spike");
              var tagColor = r.tags.indexOf("breakout")>=0?UP:(r.tags.indexOf("breakdown")>=0?DOWN:WARN);
              return (
                <div key={r.sym} onClick={function(){setTab("breakoutscan");}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",padding:"4px 0",borderBottom:"1px solid "+BD2}}>
                  <span style={{fontSize:tierCfg.secondaryText,fontWeight:800,color:T1}}>{r.sym}</span>
                  <span style={{fontSize:tierCfg.label,fontWeight:700,color:tagColor}}>{t("home.tag."+tagLabel, tagLabel)}</span>
                  {r.chgPct!=null ? <span style={{fontSize:tierCfg.label,color:r.chgPct>=0?UP:DOWN}}>{r.chgPct>=0?"+":""}{r.chgPct}%</span> : null}
                </div>
              );
            }) : (
              <div style={{fontSize:tierCfg.label,color:T3}}>{t("home.scanning")}</div>
            )}
          </div>

          {/* MARKET ALERTS - No verified alert-generation
              source exists anywhere in this codebase - shown as a compact,
              honest unavailable state, never a fabricated alert count,
              timestamp, symbol or reason. Previously lived in a secondary
              5-up row below the grid; moved into the core 3x2 grid so it
              gets equal Home-page prominence with the other five features. */}
          <div style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",overflowY:"auto",display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>{t("home.market_alerts")}</span>
              <ProvenanceBadge type="unavailable"/>
            </div>
            <div style={{fontSize:tierCfg.label,color:T3}}>{t("home.alerts_none")}</div>
          </div>

          </div>

          </div>

          {/* QUICK ACTIONS - connects to existing real routes only */}
          <div style={{padding:"8px 12px",display:"flex",gap:8}}>
            {[[t("home.qa.scan"),"breakoutscan"],[t("home.qa.learn"),"learn"],[t("home.qa.alert"),"alerts"]].map(function(a){
              return (
                <button key={a[1]} onClick={function(){setTab(a[1]);}} style={{flex:1,background:"transparent",border:"1px solid "+BD,borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:tierCfg.label,fontWeight:700,color:T1}}>{a[0]}</button>
              );
            })}
          </div>

        </div>

      </div>

      {/* FOOTER DISCLAIMER */}
      <div style={{padding:"5px 20px",borderTop:"1px solid "+BD}}>
        <div style={{fontSize:10,color:WARN,textAlign:"center"}}>{t("c.edu_footer")}</div>
      </div>
    </div>
  );
}
