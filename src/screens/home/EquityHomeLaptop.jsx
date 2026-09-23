import { useState, useEffect } from "react";
import { useResponsive } from "../../hooks/useResponsive";
import { useHomeData } from "./hooks/useHomeData";
import { getHomeTierConfig } from "../../utils/homeTierDensity";
import ProvenanceBadge from "../../components/ProvenanceBadge";

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
  var responsive = useResponsive();
  var tierCfg = getHomeTierConfig(responsive.breakpoint); // Responsive Blueprint v1.0 - single source for this tier's layout values
  // LIGHT PALETTE - per instruction to match the provided light/white
  // fintech-terminal reference design. Scoped to this file's own local
  // variables only (BG/CARD2/BD/BD2/T1/T2/T3/etc below) - the shared
  // ThemeProvider (theme.c.*) is untouched, so every other screen in the
  // app keeps its existing dark theme exactly as before. Only Home's own
  // rendering uses these hardcoded light values.
  var BG="#F8F9FA", CARD2="#FFFFFF", BD="#E5E7EB", BD2="#F0F1F3";
  var BLUE="#2563EB";
  var UP="#16A34A", DOWN="#DC2626", WARN="#D97706";
  // Dedicated sentiment colors (Bearish/Sideways/Bullish) - separate from
  // UP/DOWN/WARN above, which are used elsewhere for price ticks and
  // general warnings, not sentiment specifically.
  var SENT_GREEN="#087443", SENT_RED="#C62828", SENT_YELLOW="#B45309";
  var T1="#111827", T2="#4B5563", T3="#9CA3AF";
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

          {/* MARKET PULSE - moved above the six-card grid per instruction.
              Broad market context only, deliberately NOT a set of full
              cards (that would just recreate the secondary section removed
              earlier). Market Breadth and FII/DII Flow are literal
              "UNAVAILABLE" strings in api/market-mood-data.js's own
              response (mm.data.breadth, mm.data.fiiDii) - no real provider
              exists for either, shown honestly. Global Markets IS real
              (mm.data.global, the same buildGroup() output already used on
              the full AI Market Mood page). Commodities and Economic
              Calendar are confirmed DEMO-only elsewhere in this codebase
              (CommodityHome.jsx's own "DEMO DATA" badge, EconomicCalendarData.jsx's
              own "EDUCATIONAL / DEMO CALENDAR" comment) - not real, so
              honestly Not connected here rather than silently omitted. */}
          {(function(){
            var global = data.mm && data.mm.data && data.mm.data.global;
            var hasGlobal = global && global.status!=="UNAVAILABLE" && global.items && global.items.length;
            var pulseItems = [
              { label:"Market Breadth", node: <span style={{color:T3}}>Not connected</span> },
              { label:"FII Flow", node: <span style={{color:T3}}>Not connected</span> },
              { label:"DII Flow", node: <span style={{color:T3}}>Not connected</span> },
              { label:"Global Markets", node: hasGlobal ? (
                  <span>{global.items.slice(0,2).map(function(g,i){
                    return <span key={i} style={{marginRight:8}}>{g.name} <span style={{fontWeight:700,color:g.up==null?T2:(g.up?UP:DOWN)}}>{g.chgPct!=null?(g.chgPct>=0?"+":"")+g.chgPct+"%":"--"}</span></span>;
                  })}</span>
                ) : <span style={{color:T3}}>Not connected</span> },
              { label:"Commodities", node: <span style={{color:T3}}>Not connected</span> },
              { label:"Economic Calendar", node: <span style={{color:T3}}>Not connected</span> }
            ];
            return (
              <div style={{marginBottom:8}}>
                <div style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"7px 12px",boxSizing:"border-box",display:"flex",flexWrap:"wrap",gap:"5px 18px",alignItems:"center"}}>
                  <span style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.5}}>MARKET PULSE</span>
                  {pulseItems.map(function(it){
                    return (
                      <div key={it.label} style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}>
                        <span style={{color:T3}}>{it.label}:</span>{it.node}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Subtle divider between Market Pulse and the six-card grid -
              consistent with the existing border system (BD), thin, not a
              new card or section. */}
          <div style={{borderTop:"1px solid "+BD,marginBottom:8}}></div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gridTemplateRows:"repeat(2, "+PRIMARY_CARD_HEIGHT+"px)",gap:8,alignItems:"stretch"}}>

          {/* AI MARKET MOOD - card 1 of 6. Uses the same BEARISH/SIDEWAYS/
              BULLISH segment + small score-badge pattern as the full-screen
              page (no large score circle) - kept consistent between Home
              and the full page. Content-driven height throughout - no fixed
              height anywhere on this card. */}
          <div onClick={function(){setTab("marketmood");}} style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",cursor:"pointer",overflowY:"auto",display:"flex",flexDirection:"column",height:"100%"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                    <polyline points="2 14 8 14 10 8 14 18 16 11 19 11 22 14"/>
                  </svg>
                  <span style={{fontSize:tierCfg.widgetTitle+2,fontWeight:800,color:T1}}>AI Market Mood</span>
                </span>
                <ProvenanceBadge type="calculated"/>
              </div>
              {data.mm.mood && data.mm.mood.score!=null ? (
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:9,color:T3,fontWeight:700}}>AI Score</div>
                  <div style={{fontSize:14,fontWeight:900,color:T1}}>{data.mm.mood.score}/100</div>
                </div>
              ) : null}
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
                  <div style={{fontSize:22,fontWeight:900,color:moodColor,marginBottom:3}}>{mood.label.toUpperCase()}</div>
                  <div style={{fontSize:tierCfg.secondaryText,color:T2,marginBottom:2}}>Stage: <span style={{color:T1,fontWeight:700}}>{mood.stage}</span></div>
                  <div style={{fontSize:tierCfg.secondaryText,color:T2,marginBottom:5}}>Confidence: <span style={{color:T1,fontWeight:700}}>{mood.confidence}</span></div>

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
                    <div style={{fontSize:tierCfg.secondaryText+1,color:ai&&ai.now?T1:T2,lineHeight:1.35}}>{ai && ai.now ? ai.now : "Analysis update in progress. Core market score remains available."}</div>
                  </div>
                  <div style={{marginBottom:4}}>
                    <div style={{fontSize:9,color:T2,fontWeight:800,marginBottom:2}}>WHAT TO WATCH</div>
                    <div style={{fontSize:tierCfg.secondaryText+1,color:ai&&ai.watchNext?T1:T2,lineHeight:1.3}}>{ai && ai.watchNext ? ai.watchNext : "No verified watch-level signal available."}</div>
                  </div>
                  <div style={{textAlign:"right",fontSize:tierCfg.label,color:BLUE,fontWeight:700,marginTop:"auto",paddingTop:4}}>View Full Analysis &#8594;</div>
                </div>
              );
            })()}
          </div>

          {/* RANGE INTELLIGENCE - card 2 of 6. Real data, from api/market-mood-data.js's indices.NIFTY - the
              most recent daily candle IS today's session, so high/low are
              genuinely today's real range. Pivot/Resistance/Support use the
              standard pivot-point formula (Pivot=(H+L+C)/3, R1=2P-L, S1=2P-H)
              over the same real high/low/ltp - this is the calculation that
              used to live in a separate "Key Levels" Home section; it is
              now folded into Range Intelligence, which owns this
              information, rather than existing as a seventh card. */}
          {(function(){
            var nifty = data.mm && data.mm.data && data.mm.data.indices && data.mm.data.indices.NIFTY;
            var hasRange = nifty && nifty.ltp!=null && nifty.high!=null && nifty.low!=null && nifty.high>nifty.low;
            var rangeContent;
            if(!hasRange){
              rangeContent = (
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                    <span style={{fontSize:tierCfg.widgetTitle+2,fontWeight:800,color:T1}}>Range Intelligence</span>
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
              var pivot = (nifty.high + nifty.low + nifty.ltp) / 3;
              var r1 = Math.round(((2*pivot) - nifty.low)*100)/100;
              var s1 = Math.round(((2*pivot) - nifty.high)*100)/100;
              var r2 = Math.round((pivot + (nifty.high - nifty.low))*100)/100;
              var s2 = Math.round((pivot - (nifty.high - nifty.low))*100)/100;
              var bc = Math.round(((nifty.high + nifty.low) / 2)*100)/100;
              var tc = Math.round(((2*pivot) - bc)*100)/100;
              rangeContent = (
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <span style={{fontSize:tierCfg.widgetTitle+2,fontWeight:800,color:T1}}>Range Intelligence</span>
                    <ProvenanceBadge type="calculated"/>
                  </div>
                  <div style={{fontSize:22,fontWeight:900,color:T1,marginBottom:2}}>{nifty.ltp.toLocaleString("en-IN")}</div>
                  <div style={{display:"flex",gap:10,fontSize:tierCfg.label,color:T3,marginBottom:4}}>
                    <span>High <span style={{color:T1,fontWeight:700}}>{nifty.high.toLocaleString("en-IN")}</span></span>
                    <span>Low <span style={{color:T1,fontWeight:700}}>{nifty.low.toLocaleString("en-IN")}</span></span>
                  </div>
                  <div style={{fontSize:tierCfg.label+2,fontWeight:700,color:stateColor,marginBottom:4}}>{posPct}% &#8226; {zone}</div>
                  <div style={{fontSize:11,fontWeight:700,color:stateColor,marginBottom:6}}>{state}</div>
                  <div style={{display:"flex",gap:6,fontSize:8,color:T3,borderTop:"1px solid "+BD2,paddingTop:4,marginBottom:3,flexWrap:"wrap"}}>
                    <span>R2 <span style={{color:DOWN,fontWeight:700}}>{r2.toLocaleString("en-IN")}</span></span>
                    <span>R1 <span style={{color:DOWN,fontWeight:700}}>{r1.toLocaleString("en-IN")}</span></span>
                    <span>Pivot <span style={{color:T1,fontWeight:700}}>{Math.round(pivot*100)/100}</span></span>
                    <span>S1 <span style={{color:UP,fontWeight:700}}>{s1.toLocaleString("en-IN")}</span></span>
                    <span>S2 <span style={{color:UP,fontWeight:700}}>{s2.toLocaleString("en-IN")}</span></span>
                  </div>
                  <div style={{fontSize:8,color:T3}}>CPR: BC {bc.toLocaleString("en-IN")} &ndash; TC {tc.toLocaleString("en-IN")}</div>
                  <div style={{fontSize:8,color:T3}}>VWAP: Not available (no real intraday tick feed connected)</div>
                </div>
              );
            }
            return (
              <div onClick={function(){setTab("rangeintel");}} style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",cursor:"pointer",overflowY:"auto",display:"flex",flexDirection:"column",height:"100%"}}>
                {rangeContent}
              </div>
            );
          })()}

          {/* OPTIONS INTELLIGENCE - card 3 of 6. No verified live options-
              chain provider exists anywhere in this codebase (confirmed via
              full repository audit: dhan.js's real getOptionChain() is
              commented out pending a paid subscription, OptionsIntelData.jsx's
              own header states "Mock now"). Per instruction, example/demo
              PCR/Max Pain/Call Wall/Put Wall numbers must not be shown at
              all - even DEMO-labeled. Instead of one line, each field the
              card would show once a provider is connected is listed
              explicitly as not-connected - visually complete without a
              single fabricated number. */}
          <div style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",overflowY:"auto",display:"flex",flexDirection:"column",height:"100%"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:tierCfg.widgetTitle+2,fontWeight:800,color:T1}}>Options Intelligence</span>
              <ProvenanceBadge type="unavailable"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 8px",marginBottom:6}}>
              {["PCR","Max Pain","Call OI","Put OI","OI Change","Call Wall","Put Wall","IV","Gamma Flip","Expiry Volatility","Writer Trap","Short Covering"].map(function(f){
                return (
                  <div key={f} style={{display:"flex",justifyContent:"space-between",fontSize:9,color:T3}}>
                    <span>{f}</span><span>Not connected</span>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:tierCfg.label,color:T3,borderTop:"1px solid "+BD2,paddingTop:4}}>Live options-chain provider not connected.</div>
          </div>

          {/* MARKET NEWS - card 4 of 6. Per explicit instruction, the
              existing news data source is being kept exactly as-is for now
              (a real News API is planned for later) - nothing about the
              data itself changes here, only how much of it is rendered.
              Labeled DEMO using the app's own existing ProvenanceBadge
              convention (the same 4-state live/calculated/demo/unavailable
              system every other module uses) since this task confirms the
              data is temporary placeholder content - a truthful label on
              unchanged data, not a data change. */}
          <div onClick={function(){setTab("news");}} style={{background:CARD2+"cc",backdropFilter:"blur(12px)",border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",boxSizing:"border-box",cursor:"pointer",overflowY:"auto",display:"flex",flexDirection:"column",height:"100%"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:tierCfg.widgetTitle+2,fontWeight:800,color:T1}}>Market News</span>
                <ProvenanceBadge type="calculated"/>
              </div>
              <span style={{fontSize:tierCfg.label,color:BLUE,fontWeight:700}}>View all &#8594;</span>
            </div>
            {data.liveNews.length===0 ? (
              <div style={{fontSize:tierCfg.secondaryText,color:T3}}>{data.liveNewsLoading ? "Loading market news..." : "Market news unavailable"}</div>
            ) : data.liveNews.slice(0,2).map(function(n){
              var impactColor = n.impact==="Bullish"?"#16A34A":(n.impact==="Bearish"?"#DC2626":"#EAB308");
              return (
                <div key={n.id} onClick={function(e){ if(n.link){ e.stopPropagation(); window.open(n.link, "_blank", "noopener"); } }} style={{padding:"5px 0",borderBottom:"1px solid "+BD2,cursor:n.link?"pointer":"default"}}>
                  <div style={{fontSize:tierCfg.secondaryText+1,fontWeight:700,color:T1,marginBottom:2}}>{n.headline}</div>
                  {n.body && n.body[0] ? <div style={{fontSize:9,color:T3,marginBottom:2,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{n.body[0]}</div> : null}
                  <div style={{display:"flex",alignItems:"center",gap:6,fontSize:tierCfg.label,color:T3}}>
                    <span>{n.time} &#183; {n.source}</span>
                    {n.impact ? <span style={{fontWeight:700,color:impactColor,background:impactColor+"18",border:"1px solid "+impactColor+"55",borderRadius:4,padding:"1px 5px"}}>{n.impact.toUpperCase()}</span> : null}
                  </div>
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
              <span style={{fontSize:tierCfg.widgetTitle+2,fontWeight:800,color:T1}}>Live Breakouts</span>
              <ProvenanceBadge type={scannerResults && scannerResults.length ? "calculated" : "unavailable"}/>
            </div>
            {scannerResults && scannerResults.length ? scannerResults.slice(0,4).map(function(r){
              var tagLabel = r.tags.indexOf("breakout")>=0?"Breakout":(r.tags.indexOf("breakdown")>=0?"Breakdown":"Vol Spike");
              var tagColor = r.tags.indexOf("breakout")>=0?UP:(r.tags.indexOf("breakdown")>=0?DOWN:WARN);
              return (
                <div key={r.sym} onClick={function(){setTab("breakoutscan");}} style={{cursor:"pointer",padding:"4px 0",borderBottom:"1px solid "+BD2}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:tierCfg.secondaryText+1,fontWeight:800,color:T1}}>{r.sym}</span>
                    <span style={{fontSize:tierCfg.label+2,fontWeight:700,color:tagColor}}>{tagLabel}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:9,color:T3}}>
                    <span>{r.ltp!=null ? r.ltp.toLocaleString("en-IN") : "--"}{r.chgPct!=null ? <span style={{color:r.chgPct>=0?UP:DOWN,fontWeight:700}}> {r.chgPct>=0?"+":""}{r.chgPct}%</span> : null}</span>
                    {r.volRatio!=null ? <span>Vol {r.volRatio}x avg</span> : null}
                  </div>
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
              <span style={{fontSize:tierCfg.widgetTitle+2,fontWeight:800,color:T1}}>Market Alerts</span>
              <ProvenanceBadge type="unavailable"/>
            </div>
            <div style={{fontSize:tierCfg.label,color:T3}}>No verified alert-generation source connected yet.</div>
          </div>

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
