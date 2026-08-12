import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useResponsive } from "../../hooks/useResponsive";
import { useHomeData } from "./hooks/useHomeData";
import { getHomeTierConfig } from "../../utils/homeTierDensity";
import ProvenanceBadge from "../../components/ProvenanceBadge";
import { JUSTIN } from "../JustInData";

// BreakoutPro - EquityHomeLaptop.jsx
// The Desktop Workstation, built per the approved Design Specification
// (BREAKOUT_INTELLIGENCE_LAPTOP_SPEC.md). Market-first architecture:
// Market Spine (4 permanent indices) is the default focus; selecting a
// stock switches the whole workspace into Stock Mode; selecting an index
// again returns instantly to Market Mode. Breakout Intelligence is the
// dominant center panel, not a card. Every displayed metric renders through
// MarketMetric/ProvenanceBadge - the mandatory, enforced provenance rule.
// The left nav rail is provided by the app shell (DesktopLeftSidebar in
// App.jsx) - this file does not render its own nav.
// Rules: no backtick, no triple-equals, ASCII.
export default function EquityHomeLaptop(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var responsive = useResponsive();
  var tierCfg = getHomeTierConfig(responsive.breakpoint); // Responsive Blueprint v1.0 - single source for this tier's layout values
  var BG=theme.c.bg, CARD2=theme.c.card2, BD=theme.c.border, BD2=theme.c.border2;
  var BLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down, GOLD=theme.c.gold, WARN=theme.c.warn;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;


  var [keyLevelsIdx, setKeyLevelsIdx] = useState(0); // 0=NIFTY, 1=BANKNIFTY, 2=SENSEX - local UI selection only, the underlying computation itself is shared via data.getKeyLevels()
  var keyLevelsZones = useMemo(function(){
    return data.getKeyLevels(keyLevelsIdx, tierCfg.keyLevelsCandles);
  }, [keyLevelsIdx, tierCfg.keyLevelsCandles, data.spineRows]);

  // Breakout Intelligence - single shared pool from useHomeData, sliced to
  // this tier's density. Identical underlying data as every other device.
  var breakoutCards = data.breakoutCardsPool.slice(0, tierCfg.breakoutCards);



  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",color:T1,overflowX:"hidden",display:"flex",flexDirection:"column"}}>

      {/* MARKET SPINE - permanent 4 indices, always visible, the primary selector */}
      <div style={{display:"flex",borderBottom:"1px solid "+BD,background:CARD2}}>
        {data.spineRows.map(function(r,i){
          var active = !data.workspaceIsStock && data.selectedIndex===r.key;
          var color = r.dir==="up"?UP:(r.dir==="down"?DOWN:T2);
          return (
            <div key={r.key} onClick={function(){data.selectIndex(r.key);}} style={{padding:"6px 16px",cursor:"pointer",borderRight:i<data.spineRows.length-1?"1px solid "+BD2:"none",background:active?"rgba(59,130,246,0.10)":"transparent",borderBottom:active?"2px solid "+BLUE:"2px solid transparent",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:tierCfg.label,color:T2}}>{r.label}</span>
              {r.live ? (
                <span style={{fontSize:tierCfg.primaryNumber,fontWeight:900,fontFamily:"monospace",color:T1}}>{r.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</span>
              ) : mm.status=="loading" ? (
                <span style={{fontSize:tierCfg.secondaryText,color:T3,display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:T3,display:"inline-block",animation:"bp-pulse 1.4s ease-in-out infinite"}}></span>
                  Connecting
                </span>
              ) : (
                <ProvenanceBadge type="unavailable"/>
              )}
              {r.live ? <span style={{fontSize:tierCfg.secondaryText,fontWeight:700,color:color}}>{r.dir==="up"?"+":""}{r.chgPct}%</span> : null}
            </div>
          );
        })}
        {data.workspaceIsStock ? (
          <div style={{padding:"6px 16px",display:"flex",alignItems:"center",gap:8,background:"rgba(59,130,246,0.10)",borderBottom:"2px solid "+BLUE}}>
            <span style={{fontSize:tierCfg.label,color:T2}}>Stock Mode</span>
            <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>{data.workspaceSymbol}</span>
            <button onClick={data.returnToMarketMode} style={{background:"none",border:"none",cursor:"pointer",color:BLUE,fontSize:tierCfg.label,fontWeight:700}}>&times; Back to Market</button>
          </div>
        ) : null}
      </div>

      {JUSTIN.length>0 ? (
        <div style={{width:"100%",boxSizing:"border-box",background:CARD2,borderBottom:"1px solid "+BD,display:"flex",alignItems:"stretch",overflow:"hidden"}}>
          <div style={{background:"#EF4444",padding:"4px 10px",display:"flex",alignItems:"center",flexShrink:0}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"#fff",marginRight:5}}/>
            <span style={{fontSize:11,fontWeight:800,color:"#fff",letterSpacing:0.4,whiteSpace:"nowrap"}}>JUST IN</span>
          </div>
          <div style={{flex:1,minWidth:0,display:"flex",alignItems:"center",padding:"6px 12px"}}>
            <span style={{fontSize:12,color:T1,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{data.ticker[data.tickerIdx]}</span>
          </div>
        </div>
      ) : (
        <div style={{width:"100%",boxSizing:"border-box",padding:"6px 12px",background:CARD2,borderBottom:"1px solid "+BD,fontSize:12,color:T3}}>Latest news unavailable right now.</div>
      )}

      {/* MAIN AREA - center workspace */}
      <div style={{flex:1,display:"flex",minHeight:0,width:"100%"}}>

        {/* CENTER WORKSPACE - Universe Dashboard: locked core feature set only.
            Row1: AI Market Mood + Breakout Intelligence
            Row2: Advanced Key Levels (compact, no chart on Home)
            Row2b: Options Intelligence
            Scanner Summary, Market Breadth, Sector Strength, and Market
            Heatmap were explicitly removed from Home - their underlying
            pages remain intact and reachable, only the Home duplication
            was removed. */}
        <div style={{flex:1,minWidth:0,padding:"12px 16px",overflowY:"auto"}}>

          {/* Row 1: AI Market Mood (25%) | AI Intelligence Alerts (25%) | Breakout Intelligence (50%) */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:tierCfg.gridGap,marginBottom:tierCfg.gridGap}}>
            <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:tierCfg.cardPadding,height:tierCfg.aiBriefHeight,overflowY:"auto",boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>AI Market Mood</span>
                <ProvenanceBadge type="calculated"/>
              </div>
              {(function(){
                var mood = data.mm.mood;
                if(!mood || mood.score==null || data.mktStatus!=="ok"){
                  return <div style={{fontSize:tierCfg.secondaryText,color:T3}}>Market mood is unavailable right now.</div>;
                }
                var moodColor = mood.label.indexOf("Bullish")>=0 ? UP : (mood.label.indexOf("Bearish")>=0 ? DOWN : GOLD);
                return (
                  <div>
                    <div style={{fontSize:tierCfg.widgetTitle,fontWeight:900,color:moodColor,marginBottom:4}}>{mood.label.toUpperCase()}</div>
                    <div style={{fontSize:tierCfg.label,color:T3,marginBottom:10}}>Confidence: {mood.score}%</div>
                    <div style={{fontSize:tierCfg.secondaryText,color:T1,lineHeight:1.6,marginBottom:10}}>{data.mm.ai ? data.mm.ai : "AI commentary loading..."}</div>
                    <div style={{padding:"4px 0"}}><div style={{fontSize:tierCfg.label,color:T3,marginBottom:2}}>Stage</div><div style={{fontSize:tierCfg.secondaryText,fontWeight:800,color:T1}}>{mood.stage}</div></div>
                  </div>
                );
              })()}
            </div>

            <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:tierCfg.cardPadding,height:tierCfg.aiBriefHeight,overflowY:"auto",boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>AI Intelligence Alerts</span>
                <ProvenanceBadge type="calculated"/>
              </div>
              {(function(){
                // Real alerts derived from the same, already-computed Breakout
                // Intelligence data (real verdict/volume/VWAP signals) - not a
                // separate fabricated alert engine. Only stocks with a
                // genuinely confirmed signal are shown; no invented alerts.
                var signals = breakoutCards.filter(function(c){ return c.volumeConfirmed || c.category=="Strong Breakout"; }).slice(0,3);
                if(signals.length==0){
                  return <div style={{fontSize:tierCfg.secondaryText,color:T3}}>Intelligence unavailable right now.</div>;
                }
                return signals.map(function(c){
                  var tone = c.category=="Strong Breakout"?UP:(c.category=="Watching"?DOWN:GOLD);
                  return (
                    <div key={c.sym} onClick={function(){data.selectStock(c.sym);}} style={{padding:"6px 0",borderBottom:"1px solid "+BD2,cursor:"pointer"}}>
                      <div style={{fontSize:tierCfg.secondaryText,fontWeight:800,color:tone}}>{c.category}</div>
                      <div style={{fontSize:tierCfg.label,color:T2}}>{c.sym} &middot; {c.volumeConfirmed?"Volume Confirmed":"Watch Volume"}</div>
                    </div>
                  );
                });
              })()}
            </div>

            <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:tierCfg.cardPadding,height:tierCfg.breakoutIntelHeight,overflowY:"auto",boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Breakout Intelligence</span>
                  <ProvenanceBadge type="calculated"/>
                </div>
                <button onClick={function(){setTab("scan");}} style={{background:"none",border:"none",color:BLUE,fontSize:tierCfg.label,fontWeight:700,cursor:"pointer"}}>View All Opportunities &#8594;</button>
              </div>
              {breakoutCards.length===0 ? (
                <div style={{fontSize:tierCfg.secondaryText,color:T3}}>Breakout data unavailable right now.</div>
              ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat("+tierCfg.breakoutCards+", minmax(0, 1fr))",gap:tierCfg.gridGap}}>
                {breakoutCards.map(function(card){
                  var catColor = card.category==="Strong Breakout"?UP:(card.category==="Momentum Building"?GOLD:(card.category==="Watching"?DOWN:BLUE));
                  var up = card.chgPct>=0;
                  var min = Math.min.apply(null,card.sparkline), max = Math.max.apply(null,card.sparkline), range = (max-min)||1;
                  var sw = tierCfg.sparklineW, sh = tierCfg.sparklineH;
                  var pts = card.sparkline.map(function(v,i){ return (i/(card.sparkline.length-1))*sw+","+(sh-((v-min)/range)*(sh-4)+2); }).join(" ");
                  return (
                    <div key={card.sym} onClick={function(){data.selectStock(card.sym);}} style={{background:BG,border:"1px solid "+BD,borderRadius:9,padding:10,cursor:"pointer",minWidth:0,overflow:"hidden"}}>
                      <div style={{fontSize:9,fontWeight:800,color:catColor,marginBottom:6}}>{card.category.toUpperCase()}</div>
                      <div style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>{card.sym}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:2,gap:8}}>
                        <div style={{flexShrink:0}}>
                          <div style={{fontSize:tierCfg.primaryNumber,fontWeight:900,color:T1,fontFamily:"monospace"}}>{card.ltp.toLocaleString("en-IN")}</div>
                          <div style={{fontSize:tierCfg.label,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{card.chgPct}%</div>
                        </div>
                        <svg width={sw} height={sh} style={{flexShrink:0,display:"block"}}><polyline points={pts} fill="none" stroke={up?UP:DOWN} strokeWidth="1.3"/></svg>
                      </div>
                      <div style={{borderTop:"1px solid "+BD2,marginTop:6,paddingTop:6,fontSize:tierCfg.label,color:T3}}>
                        {card.nearLabel} {card.nearLevel!=null?card.nearLevel.toLocaleString("en-IN"):"--"} &middot; Vol {card.volumeConfirmed?"Confirmed":"Avg"}
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          </div>

          {/* Row 2: Advanced Key Levels (55%) | Market Impact News (45%) - reordered per explicit instruction */}
          <div style={{display:"grid",gridTemplateColumns:"11fr 9fr",gap:tierCfg.gridGap,marginBottom:tierCfg.gridGap}}>
            <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:tierCfg.cardPadding,boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Key Levels</span>
                  <ProvenanceBadge type="calculated"/>
                </div>
                <div style={{display:"flex",gap:4}}>
                  {["NIFTY 50","BANK NIFTY","SENSEX"].map(function(lbl,i){
                    var active = i===keyLevelsIdx;
                    return <button key={lbl} onClick={function(){setKeyLevelsIdx(i);}} style={{background:active?BLUE:CARD2,border:"1px solid "+(active?BLUE:BD2),borderRadius:6,padding:"4px 8px",color:active?"#fff":T2,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lbl}</button>;
                  })}
                </div>
              </div>
              {keyLevelsZones.currentPrice==null ? (
                <div style={{fontSize:tierCfg.secondaryText,color:T3,marginBottom:8}}>Data unavailable right now.</div>
              ) : (
              <div style={{fontSize:tierCfg.primaryNumber,fontWeight:900,color:GOLD,fontFamily:"monospace",marginBottom:2}}>{keyLevelsZones.currentPrice.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(5, minmax(0, 1fr))",gap:6,textAlign:"center",marginBottom:10}}>
                <div><div style={{fontSize:tierCfg.label,color:T3}}>R2</div><div style={{fontSize:tierCfg.secondaryText,fontWeight:700,color:DOWN,fontFamily:"monospace"}}>{keyLevelsZones.resistance2?keyLevelsZones.resistance2.price:"--"}</div></div>
                <div><div style={{fontSize:tierCfg.label,color:T3}}>R1</div><div style={{fontSize:tierCfg.secondaryText,fontWeight:700,color:DOWN,fontFamily:"monospace"}}>{keyLevelsZones.resistance?keyLevelsZones.resistance.price:"--"}</div></div>
                <div><div style={{fontSize:tierCfg.label,color:GOLD}}>PIVOT</div><div style={{fontSize:tierCfg.secondaryText,fontWeight:800,color:GOLD,fontFamily:"monospace"}}>{keyLevelsZones.currentPrice.toLocaleString("en-IN",{maximumFractionDigits:0})}</div></div>
                <div><div style={{fontSize:tierCfg.label,color:T3}}>S1</div><div style={{fontSize:tierCfg.secondaryText,fontWeight:700,color:UP,fontFamily:"monospace"}}>{keyLevelsZones.support?keyLevelsZones.support.price:"--"}</div></div>
                <div><div style={{fontSize:tierCfg.label,color:T3}}>S2</div><div style={{fontSize:tierCfg.secondaryText,fontWeight:700,color:UP,fontFamily:"monospace"}}>{keyLevelsZones.support2?keyLevelsZones.support2.price:"--"}</div></div>
              </div>
              <button onClick={function(){setTab("pazones");}} style={{background:"none",border:"none",color:BLUE,fontSize:tierCfg.label,fontWeight:700,cursor:"pointer"}}>View Full Price Action &#8594;</button>
            </div>

            <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:tierCfg.cardPadding,boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Market Impact News</span>
                  <ProvenanceBadge type="calculated"/>
                </div>
                <button onClick={function(){setTab("news");}} style={{background:"none",border:"none",color:BLUE,fontSize:tierCfg.label,fontWeight:700,cursor:"pointer"}}>View All News &#8594;</button>
              </div>
              {JUSTIN.length==0 ? (
                <div style={{fontSize:tierCfg.secondaryText,color:T3}}>No major market-impacting news right now.</div>
              ) : JUSTIN.slice(0,3).map(function(n){
                var impactColor = n.impact=="Bullish"?UP:(n.impact=="Bearish"?DOWN:T2);
                return (
                  <div key={n.id} style={{padding:"6px 0",borderBottom:"1px solid "+BD2}}>
                    <div style={{fontSize:tierCfg.secondaryText,fontWeight:700,color:T1,marginBottom:2}}>{n.headline}</div>
                    <div style={{fontSize:tierCfg.label,fontWeight:700,color:impactColor}}>Impact: {n.impact}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 3: Options Intelligence (50%) | Futures Pulse (50%) */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:tierCfg.gridGap,marginBottom:tierCfg.gridGap}}>
            <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:tierCfg.cardPadding,boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Options Intelligence</span>
                  <ProvenanceBadge type="unavailable"/>
                </div>
              </div>
              {/* PCR/Max Pain/Gamma/Call Wall/Put Wall are not shown here -
                  no live options-chain API is connected. The only prior
                  source (getOptionsIntel) returned hardcoded demo strings,
                  which is exactly the fabricated-data pattern this section
                  must not show, even honestly labeled. */}
              <div style={{fontSize:tierCfg.secondaryText,color:T3}}>Data unavailable right now.</div>
            </div>

            <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:tierCfg.cardPadding,boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Futures Pulse</span>
                <ProvenanceBadge type="unavailable"/>
              </div>
              {/* No real NIFTY/BANKNIFTY futures price, OI or premium/discount
                  data source exists anywhere in this codebase - FuturesIntel.jsx
                  and FuturesData.jsx contain only educational glossary text, no
                  actual numeric feed. Showing this honestly rather than
                  inventing futures prices. */}
              <div style={{fontSize:tierCfg.secondaryText,color:T3}}>Futures data unavailable right now.</div>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER DISCLAIMER */}
      <div style={{padding:"5px 20px",borderTop:"1px solid "+BD}}>
        <div style={{fontSize:10,color:WARN,textAlign:"center"}}>Support &amp; Resistance levels are generated using historical market data for educational purposes only. They are not buy/sell recommendations. Please conduct your own analysis before trading.</div>
      </div>
    </div>
  );
}
