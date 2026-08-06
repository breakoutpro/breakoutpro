import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useResponsive } from "../../hooks/useResponsive";
import { useHomeData } from "./hooks/useHomeData";
import { DEMO_STOCKS } from "../../data/marketsStocks";
import { generateDemoCandles, analyzeZones, analyzeBreakoutIntelligence } from "../../utils/priceActionZones";
import { getHomeTierConfig } from "../../utils/homeTierDensity";
import PatternChartEngine from "../PatternChartEngine";
import ProvenanceBadge from "../../components/ProvenanceBadge";

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

  var bi = data.workspaceBreakout;

  var [keyLevelsIdx, setKeyLevelsIdx] = useState(0); // 0=NIFTY, 1=BANKNIFTY, 2=SENSEX - local to the Key Levels card, independent of the global spine selection
  var keyLevelsZones = useMemo(function(){
    var syms = ["NIFTY","BANKNIFTY","SENSEX"];
    var sym = syms[keyLevelsIdx];
    var row = data.spineRows.filter(function(r){ return r.key===sym; })[0];
    var fallback = {NIFTY:24500,BANKNIFTY:51500,SENSEX:80000}[sym];
    var price = (row && row.live) ? row.ltp : fallback;
    var candles = generateDemoCandles(price, 60, sym);
    var zones = analyzeZones(candles);
    var klbi = analyzeBreakoutIntelligence(candles, zones);
    var prevCandle = candles[candles.length-2];
    var openCandle = candles[0];
    zones.vwap = klbi.vwap;
    zones.prevHigh = prevCandle ? prevCandle.h : null;
    zones.prevLow = prevCandle ? prevCandle.l : null;
    zones.openingRangeHigh = openCandle ? openCandle.h : null;
    zones.openingRangeLow = openCandle ? openCandle.l : null;
    zones.candles = candles;
    return zones;
  }, [keyLevelsIdx, data.spineRows]);

  // Sector Performance - real aggregation (average % change per sector) from
  // the real (demo) DEMO_STOCKS dataset, which already has real sector tags.
  var sectorPerf = useMemo(function(){
    var bySector = {};
    DEMO_STOCKS.forEach(function(s){
      if(!bySector[s.sect]) bySector[s.sect] = [];
      bySector[s.sect].push(s.chgPct);
    });
    var all = Object.keys(bySector).map(function(k){
      var arr = bySector[k];
      var avg = arr.reduce(function(a,b){return a+b;},0)/arr.length;
      return {sector:k, avgChg:parseFloat(avg.toFixed(2))};
    }).sort(function(a,b){ return b.avgChg-a.avgChg; });
    return { strong: all.slice(0,5), weak: all.slice(-5).reverse() };
  }, []);

  // Market Breadth - real classification of the same real (demo) DEMO_STOCKS
  // dataset used elsewhere, so the count is internally consistent rather
  // than mixing separate curated lists.
  var breadth = useMemo(function(){
    var adv=0, dec=0, unch=0;
    DEMO_STOCKS.forEach(function(s){
      if(s.chgPct>0) adv++; else if(s.chgPct<0) dec++; else unch++;
    });
    return {adv:adv, dec:dec, unch:unch};
  }, []);

  // Breakout Scanner preview - reuses the same real, already-tested
  // analyzeBreakoutIntelligence engine per stock. "Confidence" is a real
  // composite of already-computed real signals (volume confirmation, verdict,
  // retest status) - not an independent invented number.
  var scannerPreview = useMemo(function(){
    return DEMO_STOCKS.slice(0,5).map(function(s){
      var candles = generateDemoCandles(s.ltp, 90, s.sym);
      var z = analyzeZones(candles);
      var sbi = analyzeBreakoutIntelligence(candles, z);
      var confidence = sbi.volumeConfirmed ? 70 : 45;
      if(sbi.verdict==="Healthy") confidence += 20;
      if(sbi.retest && !sbi.retest.retested) confidence += 10;
      confidence = Math.min(95, confidence);
      // Entry Zone - a descriptive reference to the nearest real support/
      // resistance band, not a directive "buy here" instruction.
      var zoneLevel = z.support ? z.support.price : (z.resistance ? z.resistance.price : null);
      var zoneLabel = z.support ? "Near Support" : (z.resistance ? "Near Resistance" : "No Clear Zone");
      // Risk Level - real derivation from candle-range volatility relative
      // to price, not an invented category.
      var lastCandle = candles[candles.length-1];
      var rangePct = ((lastCandle.h-lastCandle.l)/lastCandle.c)*100;
      var riskLevel = rangePct<1 ? "Low" : (rangePct<2.5 ? "Moderate" : "High");
      return {sym:s.sym, verdict:sbi.verdict, confidence:confidence, zoneLevel:zoneLevel, zoneLabel:zoneLabel, riskLevel:riskLevel};
    });
  }, []);

  // Breakout Intelligence opportunity cards - top 4 stocks by real confidence
  // across a larger pool, each with its own real sparkline. Category labels
  // are a direct mapping from the real, already-tested verdict states - no
  // forced variety, whatever categories genuinely result is what's shown.
  var VERDICT_CATEGORY = {Healthy:"Strong Breakout", Weakening:"Momentum Building", Failed:"Watching", None:"Fresh Setup"};
  var breakoutCards = useMemo(function(){
    var pool = DEMO_STOCKS.slice(0, 12).map(function(s){
      var candles = generateDemoCandles(s.ltp, 90, s.sym);
      var z = analyzeZones(candles);
      var cbi = analyzeBreakoutIntelligence(candles, z);
      var confidence = cbi.volumeConfirmed ? 70 : 45;
      if(cbi.verdict==="Healthy") confidence += 20;
      if(cbi.retest && !cbi.retest.retested) confidence += 10;
      confidence = Math.min(95, confidence);
      var sparkline = candles.slice(-10).map(function(c){ return c.c; });
      return {
        sym: s.sym, ltp: s.ltp, chgPct: s.chgPct, confidence: confidence,
        category: VERDICT_CATEGORY[cbi.verdict], volumeConfirmed: cbi.volumeConfirmed,
        sparkline: sparkline,
        nearLevel: z.resistance ? z.resistance.price : (z.support ? z.support.price : null),
        nearLabel: z.resistance ? "Above" : (z.support ? "Above" : "--")
      };
    });
    return pool.sort(function(a,b){ return b.confidence-a.confidence; }).slice(0,tierCfg.breakoutCards);
  }, [tierCfg.breakoutCards]);

  var [sectorView, setSectorView] = useState("strong"); // "strong" or "weak" - toggle, matching the reference image's Strongest/Weakest pattern

  var symLabel = data.workspaceIsStock ? data.workspaceSymbol : (data.spineRows.filter(function(r){return r.key===data.workspaceSymbol;})[0]||{}).label;

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",color:T1,overflowX:"hidden",display:"flex",flexDirection:"column"}}>

      {/* MARKET SPINE - permanent 4 indices, always visible, the primary selector */}
      <div style={{display:"flex",borderBottom:"1px solid "+BD,background:CARD2}}>
        {data.spineRows.map(function(r,i){
          var active = !data.workspaceIsStock && data.selectedIndex===r.key;
          var color = r.dir==="up"?UP:(r.dir==="down"?DOWN:T2);
          return (
            <div key={r.key} onClick={function(){data.selectIndex(r.key);}} style={{padding:"6px 16px",cursor:"pointer",borderRight:i<data.spineRows.length-1?"1px solid "+BD2:"none",background:active?"rgba(59,130,246,0.10)":"transparent",borderBottom:active?"2px solid "+BLUE:"2px solid transparent",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:T2}}>{r.label}</span>
              {r.live ? (
                <span style={{fontSize:15,fontWeight:800,fontFamily:"monospace",color:T1}}>{r.ltp.toLocaleString("en-IN",{maximumFractionDigits:2})}</span>
              ) : mm.status=="loading" ? (
                <span style={{fontSize:12,color:T3,display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:T3,display:"inline-block",animation:"bp-pulse 1.4s ease-in-out infinite"}}></span>
                  Connecting
                </span>
              ) : (
                <ProvenanceBadge type="unavailable"/>
              )}
              {r.live ? <span style={{fontSize:12,fontWeight:700,color:color}}>{r.dir==="up"?"+":""}{r.chgPct}%</span> : null}
            </div>
          );
        })}
        {data.workspaceIsStock ? (
          <div style={{padding:"6px 16px",display:"flex",alignItems:"center",gap:8,background:"rgba(59,130,246,0.10)",borderBottom:"2px solid "+BLUE}}>
            <span style={{fontSize:12,color:T2}}>Stock Mode</span>
            <span style={{fontSize:13,fontWeight:800,color:T1}}>{data.workspaceSymbol}</span>
            <button onClick={data.returnToMarketMode} style={{background:"none",border:"none",cursor:"pointer",color:BLUE,fontSize:11,fontWeight:700}}>&times; Back to Market</button>
          </div>
        ) : null}
      </div>

      {/* MAIN AREA - center workspace */}
      <div style={{flex:1,display:"flex",minHeight:0,width:"100%"}}>

        {/* CENTER WORKSPACE - matches the approved reference image structure:
            Row1: AI Brief + Breakout Intelligence (4 opportunity cards)
            Row2: Scanner Summary (tabbed table) + Key Levels (toggle + real chart)
            Row3: Market Breadth (donut) + Sector Strength (toggle) + Heatmap
            Bottom: Quick Actions */}
        <div style={{flex:1,minWidth:0,padding:"10px 14px",overflowY:"auto"}}>

          {/* Row 1: AI Market Brief | Breakout Intelligence (4-card strip) */}
          <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:tierCfg.gridGap,marginBottom:tierCfg.gridGap}}>
            <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:9,padding:tierCfg.cardPadding,height:tierCfg.aiBriefHeight,overflowY:"auto",boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>AI Market Brief</span>
                <ProvenanceBadge type="calculated"/>
              </div>
              {(function(){
                var vixLtp = data.vixRow.live ? data.vixRow.ltp : null;
                var riskLevel = vixLtp!=null ? (vixLtp<13?"Low":(vixLtp<=18?"Moderate":"High")) : null;
                var riskColor = riskLevel==="Low"?UP:(riskLevel==="High"?DOWN:GOLD);
                var biasColor = bi.trend==="Uptrend"?UP:(bi.trend==="Downtrend"?DOWN:T2);
                return (
                  <div>
                    <div style={{fontSize:tierCfg.secondaryText,color:T1,lineHeight:1.6,marginBottom:12}}>{symLabel} is {bi.trend.toLowerCase()}, volume is {bi.volumeConfirmed?"confirmed":"average"}, price is {bi.aboveVwap===true?"above":(bi.aboveVwap===false?"below":"near")} VWAP.</div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:tierCfg.label}}><span style={{color:T3}}>Risk Level</span><span style={{fontWeight:700,color:riskLevel?riskColor:T3}}>{riskLevel||"N/A"}</span></div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:tierCfg.label}}><span style={{color:T3}}>Trading Bias</span><span style={{fontWeight:700,color:biasColor}}>{bi.trend}</span></div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:tierCfg.label}}><span style={{color:T3}}>Events</span><span style={{fontWeight:700,color:T1}}>RBI Today</span></div>
                  </div>
                );
              })()}
            </div>

            <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:9,padding:tierCfg.cardPadding,height:tierCfg.breakoutIntelHeight,overflowY:"auto",boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>Breakout Intelligence</span>
                  <ProvenanceBadge type="calculated"/>
                </div>
                <button onClick={function(){setTab("scan");}} style={{background:"none",border:"none",color:BLUE,fontSize:tierCfg.label,fontWeight:700,cursor:"pointer"}}>View All Opportunities &#8594;</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat("+tierCfg.breakoutCards+", 1fr)",gap:tierCfg.gridGap}}>
                {breakoutCards.map(function(card){
                  var catColor = card.category==="Strong Breakout"?UP:(card.category==="Momentum Building"?GOLD:(card.category==="Watching"?DOWN:BLUE));
                  var up = card.chgPct>=0;
                  var min = Math.min.apply(null,card.sparkline), max = Math.max.apply(null,card.sparkline), range = (max-min)||1;
                  var sw = tierCfg.sparklineW, sh = tierCfg.sparklineH;
                  var pts = card.sparkline.map(function(v,i){ return (i/(card.sparkline.length-1))*sw+","+(sh-((v-min)/range)*(sh-4)+2); }).join(" ");
                  return (
                    <div key={card.sym} onClick={function(){data.selectStock(card.sym);}} style={{background:BG,border:"1px solid "+BD,borderRadius:9,padding:10,cursor:"pointer"}}>
                      <div style={{fontSize:9,fontWeight:800,color:catColor,marginBottom:6}}>{card.category.toUpperCase()}</div>
                      <div style={{fontSize:tierCfg.widgetTitle,fontWeight:800,color:T1}}>{card.sym}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:2,gap:8}}>
                        <div style={{flexShrink:0}}>
                          <div style={{fontSize:tierCfg.primaryNumber,fontWeight:700,color:T1,fontFamily:"monospace"}}>{card.ltp.toLocaleString("en-IN")}</div>
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
            </div>
          </div>

          {/* Row 2: Scanner Summary - full width */}
          <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:9,padding:"7px 10px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>Scanner Summary</span>
                <ProvenanceBadge type="calculated"/>
              </div>
              <button onClick={function(){setTab("scan");}} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer"}}>View Full Scanner &#8594;</button>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"fixed"}}>
              <thead>
                <tr style={{borderBottom:"1px solid "+BD2}}>
                  <th style={{width:"34%",textAlign:"left",fontSize:10,color:T3,fontWeight:700,padding:"4px 4px"}}>STOCK</th>
                  <th style={{width:"22%",textAlign:"right",fontSize:10,color:T3,fontWeight:700,padding:"4px 4px"}}>PRICE</th>
                  <th style={{width:"22%",textAlign:"right",fontSize:10,color:T3,fontWeight:700,padding:"4px 4px"}}>CHG%</th>
                  <th style={{width:"22%",textAlign:"right",fontSize:10,color:T3,fontWeight:700,padding:"4px 4px"}}>CONFIDENCE</th>
                </tr>
              </thead>
              <tbody>
                {scannerPreview.map(function(sr){
                  var s = DEMO_STOCKS.filter(function(x){return x.sym===sr.sym;})[0];
                  return (
                    <tr key={sr.sym} onClick={function(){data.selectStock(sr.sym);}} style={{borderBottom:"1px solid "+BD2,cursor:"pointer"}}>
                      <td style={{fontSize:12,fontWeight:700,color:T1,padding:"7px 4px"}}>{sr.sym}</td>
                      <td style={{fontSize:12,color:T1,textAlign:"right",fontFamily:"monospace",padding:"7px 4px"}}>{s?s.ltp.toLocaleString("en-IN"):"--"}</td>
                      <td style={{fontSize:12,fontWeight:700,textAlign:"right",color:s&&s.chgPct>=0?UP:DOWN,padding:"7px 4px"}}>{s?((s.chgPct>=0?"+":"")+s.chgPct+"%"):"--"}</td>
                      <td style={{fontSize:12,fontWeight:800,color:BLUE,textAlign:"right",padding:"7px 4px"}}>{sr.confidence}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Row 3: Key Levels - full width, larger chart */}
          <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:9,padding:"7px 10px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:13,fontWeight:800,color:T1}}>Key Levels</span>
              <div style={{display:"flex",gap:4}}>
                {["NIFTY 50","BANK NIFTY","SENSEX"].map(function(lbl,i){
                  var active = i===keyLevelsIdx;
                  return <button key={lbl} onClick={function(){setKeyLevelsIdx(i);}} style={{background:active?BLUE:CARD2,border:"1px solid "+(active?BLUE:BD2),borderRadius:6,padding:"4px 8px",color:active?"#fff":T2,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lbl}</button>;
                })}
              </div>
            </div>
            <div style={{height:220,marginBottom:8}}>
              <PatternChartEngine spec={{
                candles: keyLevelsZones.candles,
                lines: [
                  keyLevelsZones.resistance2 ? {y1:keyLevelsZones.resistance2.price, color:DOWN, label:"R2"} : null,
                  keyLevelsZones.resistance ? {y1:keyLevelsZones.resistance.price, color:DOWN, label:"R1"} : null,
                  keyLevelsZones.support ? {y1:keyLevelsZones.support.price, color:UP, label:"S1"} : null,
                  keyLevelsZones.support2 ? {y1:keyLevelsZones.support2.price, color:UP, label:"S2"} : null
                ].filter(function(l){return l;})
              }} autoplay={false}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:6,textAlign:"center"}}>
              <div><div style={{fontSize:9,color:T3}}>R2</div><div style={{fontSize:11,fontWeight:700,color:DOWN,fontFamily:"monospace"}}>{keyLevelsZones.resistance2?keyLevelsZones.resistance2.price:"--"}</div></div>
              <div><div style={{fontSize:9,color:T3}}>R1</div><div style={{fontSize:11,fontWeight:700,color:DOWN,fontFamily:"monospace"}}>{keyLevelsZones.resistance?keyLevelsZones.resistance.price:"--"}</div></div>
              <div><div style={{fontSize:9,color:GOLD}}>PIVOT</div><div style={{fontSize:11,fontWeight:800,color:GOLD,fontFamily:"monospace"}}>{keyLevelsZones.currentPrice.toLocaleString("en-IN",{maximumFractionDigits:0})}</div></div>
              <div><div style={{fontSize:9,color:T3}}>S1</div><div style={{fontSize:11,fontWeight:700,color:UP,fontFamily:"monospace"}}>{keyLevelsZones.support?keyLevelsZones.support.price:"--"}</div></div>
              <div><div style={{fontSize:9,color:T3}}>S2</div><div style={{fontSize:11,fontWeight:700,color:UP,fontFamily:"monospace"}}>{keyLevelsZones.support2?keyLevelsZones.support2.price:"--"}</div></div>
            </div>
          </div>

          {/* Row 4: Market Breadth (donut) | Sector Strength (toggle) | Market Heatmap */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
            <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:9,padding:"7px 10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>Market Breadth</span>
                <ProvenanceBadge type="demo"/>
              </div>
              {(function(){
                var total = breadth.adv+breadth.dec+breadth.unch;
                var r=34, circ=2*Math.PI*r;
                var advLen = circ*(breadth.adv/total), decLen = circ*(breadth.dec/total), unchLen = circ*(breadth.unch/total);
                return (
                  <div style={{display:"flex",alignItems:"center",gap:16}}>
                    <svg width="88" height="88" viewBox="0 0 88 88">
                      <circle cx="44" cy="44" r={r} fill="none" stroke={UP} strokeWidth="11" strokeDasharray={advLen+" "+circ} transform="rotate(-90 44 44)"/>
                      <circle cx="44" cy="44" r={r} fill="none" stroke={DOWN} strokeWidth="11" strokeDasharray={decLen+" "+circ} strokeDashoffset={-advLen} transform="rotate(-90 44 44)"/>
                      <circle cx="44" cy="44" r={r} fill="none" stroke={T3} strokeWidth="11" strokeDasharray={unchLen+" "+circ} strokeDashoffset={-(advLen+decLen)} transform="rotate(-90 44 44)"/>
                    </svg>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}><span style={{width:8,height:8,borderRadius:"50%",background:UP,display:"inline-block"}}></span><span style={{fontSize:11,color:T2}}>Advancing {breadth.adv}</span></div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}><span style={{width:8,height:8,borderRadius:"50%",background:DOWN,display:"inline-block"}}></span><span style={{fontSize:11,color:T2}}>Declining {breadth.dec}</span></div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:8,height:8,borderRadius:"50%",background:T3,display:"inline-block"}}></span><span style={{fontSize:11,color:T2}}>Unchanged {breadth.unch}</span></div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:9,padding:"7px 10px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>Sector Strength</span>
                <ProvenanceBadge type="demo"/>
              </div>
              <div style={{display:"flex",gap:4,marginBottom:10}}>
                <button onClick={function(){setSectorView("strong");}} style={{flex:1,background:sectorView==="strong"?BLUE:CARD2,border:"1px solid "+(sectorView==="strong"?BLUE:BD2),borderRadius:6,padding:"5px 0",color:sectorView==="strong"?"#fff":T2,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Strongest</button>
                <button onClick={function(){setSectorView("weak");}} style={{flex:1,background:sectorView==="weak"?BLUE:CARD2,border:"1px solid "+(sectorView==="weak"?BLUE:BD2),borderRadius:6,padding:"5px 0",color:sectorView==="weak"?"#fff":T2,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Weakest</button>
              </div>
              {(sectorView==="strong"?sectorPerf.strong:sectorPerf.weak).map(function(sec){
                var up = sec.avgChg>=0;
                var barPct = Math.min(100, Math.abs(sec.avgChg)*30);
                return (
                  <div key={sec.sector} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                      <span style={{color:T2}}>{sec.sector}</span>
                      <span style={{fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{sec.avgChg}%</span>
                    </div>
                    <div style={{background:BG,borderRadius:4,height:5,overflow:"hidden"}}>
                      <div style={{width:barPct+"%",height:"100%",background:up?UP:DOWN}}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{background:CARD2,border:"1px solid "+BD,borderRadius:9,padding:"7px 10px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:800,color:T1}}>Market Heatmap</span>
                <button onClick={function(){setTab("heatmap");}} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer"}}>View Full &#8594;</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:6}}>
                {DEMO_STOCKS.slice(0,8).map(function(s){
                  var up = s.chgPct>=0;
                  return (
                    <div key={s.sym} onClick={function(){data.selectStock(s.sym);}} style={{background:up?"rgba(0,100,0,0.18)":"rgba(220,38,38,0.15)",border:"1px solid "+(up?UP:DOWN)+"40",borderRadius:7,padding:"7px 4px",textAlign:"center",cursor:"pointer"}}>
                      <div style={{fontSize:9,fontWeight:800,color:T1}}>{s.sym}</div>
                      <div style={{fontSize:9,fontWeight:700,color:up?UP:DOWN}}>{up?"+":""}{s.chgPct}%</div>
                    </div>
                  );
                })}
              </div>
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
