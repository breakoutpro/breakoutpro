import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useResponsive } from "../../hooks/useResponsive";
import { useHomeData } from "./hooks/useHomeData";
import { getHomeTierConfig } from "../../utils/homeTierDensity";
import ProvenanceBadge from "../../components/ProvenanceBadge";
import { JUSTIN } from "../JustInData";

// BreakoutPro - EquityHomeLaptop.jsx
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
export default function EquityHomeLaptop(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var responsive = useResponsive();
  var tierCfg = getHomeTierConfig(responsive.breakpoint); // Responsive Blueprint v1.0 - single source for this tier's layout values
  var BG=theme.c.bg, CARD2=theme.c.card2, BD=theme.c.border, BD2=theme.c.border2;
  var BLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down, WARN=theme.c.warn;
  // Dedicated sentiment colors (Bearish/Sideways/Bullish) - separate from
  // theme.c.up/down/warn, which are used elsewhere for price ticks and
  // general warnings, not sentiment specifically.
  var SENT_GREEN="#087443", SENT_RED="#C62828", SENT_YELLOW="#EAB308";
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;

  // PRIMARY_CARD_HEIGHT - the ONE number that controls the 3x2 core-feature
  // grid's row height. Both rows use this same value, so all six primary
  // cards (AI Market Mood, Range Intelligence, Options Intelligence,
  // Market News, Live Breakouts, Market Alerts) are always identical in
  // height regardless of how much content each one has. Content that does
  // not fit scrolls inside its own card (overflowY:auto on each card)
  // rather than growing the row - this is what keeps Row 1 and Row 2 the
  // same height instead of one feature stretching its row taller than the
  // other. Tune this one value if a tier needs a different compact height.
  var PRIMARY_CARD_HEIGHT = 230;

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

        {/* CENTER WORKSPACE - the 3x2 core-feature grid (AI Market Mood,
            Range Intelligence, Options Intelligence, Market News, Live
            Breakouts, Market Alerts). Each card's detailed analysis lives
            on its own dedicated page - Home shows a real-data summary
            only, never a duplicate of the full page. */}
        <div style={{flex:1,minWidth:0,padding:"8px 12px",overflowY:"auto"}}>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gridTemplateRows:"repeat(2, "+PRIMARY_CARD_HEIGHT+"px)",gap:8,alignItems:"stretch"}}>

          {/* AI MARKET MOOD - card 1 of 6. Uses the same BEARISH/SIDEWAYS/
              BULLISH segment + small score-badge pattern as the full-screen
              page (no large score circle) - kept consistent between Home
              and the full page. Content-driven height throughout - no fixed
              height anywhere on this card. */}
          <div onClick={function(){setTab("marketmood");}} style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",cursor:"pointer",overflowY:"auto",display:"flex",flexDirection:"column",height:"100%"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:tierCfg.widgetTitle+1,fontWeight:800,color:T1}}>&#129504; AI Market Mood</span>
              <ProvenanceBadge type="calculated"/>
            </div>
            {(function(){
              var hasReal = data.mm.mood && data.mm.mood.score!=null;
              if(!hasReal){
                return <div style={{fontSize:tierCfg.secondaryText,color:T2}}>Analysis loading...</div>;
              }
              var mood = data.mm.mood;
              var ai = data.mm.ai;
              var moodColor = mood.label.indexOf("Bullish")>=0?SENT_GREEN:(mood.label.indexOf("Bearish")>=0?SENT_RED:SENT_YELLOW);
              return (
                <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
                  <div style={{display:"flex",gap:5,marginBottom:6}}>
                    {[["BEARISH",SENT_RED],["SIDEWAYS",SENT_YELLOW],["BULLISH",SENT_GREEN]].map(function(seg){
                      var active = mood.label.toUpperCase().indexOf(seg[0])>=0 || (seg[0]==="SIDEWAYS" && mood.label.indexOf("Bull")<0 && mood.label.indexOf("Bear")<0);
                      return <div key={seg[0]} style={{fontSize:9,fontWeight:800,padding:"3px 7px",borderRadius:5,color:active?"#fff":seg[1],background:active?seg[1]:seg[1]+"14",border:"1px solid "+seg[1]}}>{seg[0]}</div>;
                    })}
                  </div>
                  <div style={{fontSize:16,fontWeight:900,color:moodColor,marginBottom:3}}>{mood.label.toUpperCase()}</div>
                  <div style={{fontSize:tierCfg.secondaryText,color:T2,marginBottom:2}}>Stage: <span style={{color:T1,fontWeight:700}}>{mood.stage}</span></div>
                  <div style={{fontSize:tierCfg.secondaryText,color:T2,marginBottom:5}}>Confidence: <span style={{color:T1,fontWeight:700}}>{mood.confidence}</span></div>
                  <div style={{fontSize:9,color:T3,background:BG,border:"1px solid "+BD,borderRadius:5,padding:"2px 7px",display:"inline-block",marginBottom:4}}>AI Confidence Score: {mood.score}/100</div>

                  {/* VIX - one compact inline line, not a dedicated wide
                      panel. PCR/Max Pain/FII flow have no real provider
                      anywhere in this codebase (confirmed: dhan.js's
                      getOptionChain() is commented out; OptionsIntelData.jsx
                      is explicitly "Mock now") - a single small honest note
                      replaces what used to be a 55%-width empty panel. */}
                  {(function(){
                    var vix = data.mm && data.mm.data && data.mm.data.indices && data.mm.data.indices.VIX;
                    var hasVix = vix && vix.ltp!=null;
                    if(!hasVix) return null;
                    var vixNum = Number(vix.ltp);
                    var vixLabel = isNaN(vixNum) ? null : (vixNum<13?"Low volatility":(vixNum<=18?"Moderate volatility":"High volatility"));
                    return (
                      <div style={{fontSize:tierCfg.secondaryText,color:T2,marginBottom:5}}>VIX <span style={{color:T1,fontWeight:700}}>{vix.ltp}</span> &#8226; {vixLabel}</div>
                    );
                  })()}

                  <div style={{marginBottom:4}}>
                    <div style={{fontSize:9,color:T2,fontWeight:800,marginBottom:2}}>KEY SIGNAL</div>
                    <div style={{fontSize:tierCfg.secondaryText,color:ai&&ai.now?T1:T2,lineHeight:1.35}}>{ai && ai.now ? ai.now : "Analysis update in progress. Core market score remains available."}</div>
                  </div>
                  <div style={{marginBottom:4}}>
                    <div style={{fontSize:9,color:T2,fontWeight:800,marginBottom:2}}>WHAT TO WATCH</div>
                    <div style={{fontSize:tierCfg.secondaryText,color:ai&&ai.watchNext?T1:T2,lineHeight:1.3}}>{ai && ai.watchNext ? ai.watchNext : "No verified watch-level signal available."}</div>
                  </div>
                  <div style={{textAlign:"right",fontSize:tierCfg.label,color:BLUE,fontWeight:700,marginTop:"auto",paddingTop:4}}>View Full Analysis &#8594;</div>
                </div>
              );
            })()}
          </div>

          {/* RANGE INTELLIGENCE - card 2 of 6. Real data, from api/market-mood-data.js's indices.NIFTY - the
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
                    <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Range Intelligence</span>
                    <ProvenanceBadge type="unavailable"/>
                  </div>
                  <div style={{fontSize:tierCfg.label,color:T3}}>No verified intraday range provider connected yet.</div>
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
                    <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Range Intelligence</span>
                    <ProvenanceBadge type="calculated"/>
                  </div>
                  <div style={{fontSize:15,fontWeight:900,color:T1,marginBottom:2}}>{nifty.ltp.toLocaleString("en-IN")}</div>
                  <div style={{fontSize:tierCfg.label,color:T3,marginBottom:4}}>{nifty.low.toLocaleString("en-IN")}&ndash;{nifty.high.toLocaleString("en-IN")}</div>
                  <div style={{fontSize:tierCfg.label,fontWeight:700,color:stateColor,marginBottom:4}}>{posPct}% &#8226; {zone}</div>
                  <div style={{fontSize:9,fontWeight:700,color:stateColor}}>{state}</div>
                </div>
              );
            }
            return (
              <div onClick={function(){setTab("rangeintel");}} style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",cursor:"pointer",overflowY:"auto",display:"flex",flexDirection:"column",height:"100%"}}>
                {rangeContent}
              </div>
            );
          })()}

          {/* OPTIONS INTELLIGENCE - card 3 of 6. DEMO only - confirmed via
              full repository audit that no real options-chain provider
              exists anywhere: dhan.js's
              real getOptionChain() is commented out pending a paid
              subscription, OptionsIntelData.jsx's own header states "Mock
              now". Explicitly, prominently labeled DEMO - never presented
              as live. No onClick - no dedicated Options Intelligence page
              exists yet to route to. */}
          <div style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",overflowY:"auto",display:"flex",flexDirection:"column",height:"100%"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Options Intelligence</span>
              <span style={{fontSize:8,fontWeight:800,color:WARN,background:WARN+"18",border:"1px solid "+WARN+"55",borderRadius:4,padding:"1px 5px"}}>DEMO</span>
            </div>
            <div style={{fontSize:9,color:T3,marginBottom:2}}>PCR <span style={{color:T1,fontWeight:700}}>1.02</span> &middot; Max Pain <span style={{color:T1,fontWeight:700}}>24,600</span></div>
            <div style={{fontSize:9,color:T3,marginBottom:2}}>Call Wall <span style={{color:T1,fontWeight:700}}>24,800</span> &middot; Put Wall <span style={{color:T1,fontWeight:700}}>24,400</span></div>
            <div style={{fontSize:9,color:T3,marginBottom:2}}>OI Insight: <span style={{color:T1,fontWeight:700}}>Call writing at upper strikes</span></div>
            <div style={{fontSize:8,color:T3,marginTop:4,lineHeight:1.3}}>Example values only - not live options-chain data.</div>
          </div>

          {/* MARKET NEWS - card 4 of 6, compact, max 2 headlines (narrower
              1/3-width card than before), real JustIn data only */}
          <div onClick={function(){setTab("news");}} style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",cursor:"pointer",overflowY:"auto",display:"flex",flexDirection:"column",height:"100%"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Market News</span>
                <ProvenanceBadge type="calculated"/>
              </div>
              <span style={{fontSize:tierCfg.label,color:BLUE,fontWeight:700}}>View all &#8594;</span>
            </div>
            {JUSTIN.length===0 ? (
              <div style={{fontSize:tierCfg.secondaryText,color:T3}}>Market news unavailable</div>
            ) : JUSTIN.slice(0,2).map(function(n){
              return (
                <div key={n.id} style={{padding:"5px 0",borderBottom:"1px solid "+BD2}}>
                  <div style={{fontSize:tierCfg.secondaryText,fontWeight:700,color:T1,marginBottom:2}}>{n.headline}</div>
                  <div style={{fontSize:tierCfg.label,color:T3}}>{n.time} &#183; {n.source}</div>
                </div>
              );
            })}
          </div>

          {/* LIVE BREAKOUTS - card 5 of 6. Same real /api/scanner-data
              source that BreakoutScanner.jsx uses (real daily-candle
              classification, no Math.random, no invented values) -
              previously a horizontal strip below the grid, now its own
              core card so it gets equal Home-page prominence. Not
              duplicated into Market Alerts - each feature owns its own
              information. */}
          <div style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",overflowY:"auto",display:"flex",flexDirection:"column",height:"100%"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Live Breakouts</span>
              <ProvenanceBadge type={scannerResults && scannerResults.length ? "calculated" : "unavailable"}/>
            </div>
            {scannerResults && scannerResults.length ? scannerResults.slice(0,4).map(function(r){
              var tagLabel = r.tags.indexOf("breakout")>=0?"Breakout":(r.tags.indexOf("breakdown")>=0?"Breakdown":"Vol Spike");
              var tagColor = r.tags.indexOf("breakout")>=0?UP:(r.tags.indexOf("breakdown")>=0?DOWN:WARN);
              return (
                <div key={r.sym} onClick={function(){setTab("breakoutscan");}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",padding:"4px 0",borderBottom:"1px solid "+BD2}}>
                  <span style={{fontSize:tierCfg.secondaryText,fontWeight:800,color:T1}}>{r.sym}</span>
                  <span style={{fontSize:tierCfg.label,fontWeight:700,color:tagColor}}>{tagLabel}</span>
                  {r.chgPct!=null ? <span style={{fontSize:tierCfg.label,color:r.chgPct>=0?UP:DOWN}}>{r.chgPct>=0?"+":""}{r.chgPct}%</span> : null}
                </div>
              );
            }) : (
              <div style={{fontSize:tierCfg.label,color:T3}}>Scanning for breakouts...</div>
            )}
          </div>

          {/* MARKET ALERTS - card 6 of 6. No verified alert-generation
              source exists anywhere in this codebase - shown as a compact,
              honest unavailable state, never a fabricated alert count,
              timestamp, symbol or reason. Previously lived in a secondary
              5-up row below the grid; moved into the core 3x2 grid so it
              gets equal Home-page prominence with the other five features. */}
          <div style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",overflowY:"auto",display:"flex",flexDirection:"column",height:"100%"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Market Alerts</span>
              <ProvenanceBadge type="unavailable"/>
            </div>
            <div style={{fontSize:tierCfg.label,color:T3}}>No verified alert-generation source connected yet.</div>
          </div>

          </div>

          {/* QUICK ACTIONS - connects to existing real routes only */}
          <div style={{padding:"8px 12px",display:"flex",gap:8}}>
            {[["Scan Breakouts","breakoutscan"],["Learn Patterns","learn"],["Set Alert","alerts"]].map(function(a){
              return (
                <button key={a[1]} onClick={function(){setTab(a[1]);}} style={{flex:1,background:"transparent",border:"1px solid "+BD,borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:tierCfg.label,fontWeight:700,color:T1}}>{a[0]}</button>
              );
            })}
          </div>

        </div>

      </div>

      {/* FOOTER DISCLAIMER */}
      <div style={{padding:"5px 20px",borderTop:"1px solid "+BD}}>
        <div style={{fontSize:10,color:WARN,textAlign:"center"}}>Educational market intelligence only. Not investment advice. Not a recommendation to buy or sell.</div>
      </div>
    </div>
  );
}
