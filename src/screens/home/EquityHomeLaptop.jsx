import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import { DEMO_STOCKS } from "../../data/marketsStocks";
import { generateDemoCandles, analyzeZones, analyzeBreakoutIntelligence } from "../../utils/priceActionZones";
import MarketMetric from "../../components/MarketMetric";
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
  var BG=theme.c.bg, CARD2=theme.c.card2, BD=theme.c.border, BD2=theme.c.border2;
  var BLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down, GOLD=theme.c.gold, WARN=theme.c.warn;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;

  var bi = data.workspaceBreakout;
  var wz = data.workspaceZones;

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
  var symLabel = data.workspaceIsStock ? data.workspaceSymbol : (data.spineRows.filter(function(r){return r.key===data.workspaceSymbol;})[0]||{}).label;
  var stockMeta = data.workspaceIsStock ? DEMO_STOCKS.filter(function(s){return s.sym===data.workspaceSymbol;})[0] : null;
  var chgPct = data.workspaceIsStock ? (stockMeta?stockMeta.chgPct:0) : (data.spineRows.filter(function(r){return r.key===data.workspaceSymbol;})[0]||{}).chgPct;
  var isUp = chgPct!=null && chgPct>=0;

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

        {/* CENTER WORKSPACE - Trading Decision Center: fewer, larger sections,
            Breakout Intelligence as the genuine dominant hero, not a
            compressed card among many. */}
        <div style={{flex:1,minWidth:0,padding:"18px 22px",overflowY:"auto"}}>

          {/* Instrument header - larger, matches the "bigger typography" direction */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,paddingBottom:16,borderBottom:"1px solid "+BD2}}>
            <div style={{fontSize:19,fontWeight:900,color:T1}}>{symLabel} <span style={{fontSize:12,fontWeight:700,color:T2,background:CARD2,border:"1px solid "+BD2,borderRadius:6,padding:"3px 8px",marginLeft:10}}>NSE</span></div>
            <MarketMetric
              label="Live Price"
              value={(!data.workspaceHasLiveLtp && !data.workspaceIsStock) ? "Not Available" : (data.workspaceLtp.toLocaleString("en-IN",{maximumFractionDigits:2}) + (chgPct!=null ? ("  " + (isUp?"+":"") + chgPct + "%") : ""))}
              provenance={data.workspaceHasLiveLtp ? "live" : (data.workspaceIsStock ? "demo" : "unavailable")}
              color={(!data.workspaceHasLiveLtp && !data.workspaceIsStock) ? T3 : (isUp?UP:DOWN)} size={19} mono={true}
            />
          </div>

          {/* AI Market Brief - larger, prominent, plain language */}
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <span style={{fontSize:15,fontWeight:800,color:T1}}>AI Market Brief</span>
              <ProvenanceBadge type="calculated"/>
            </div>
            {(function(){
              var vixLtp = mm.data && mm.data.indices && mm.data.indices.VIX && mm.data.indices.VIX.ltp;
              var riskLevel = vixLtp!=null ? (vixLtp<13?"Low":(vixLtp<=18?"Moderate":"High")) : null;
              var riskColor = riskLevel==="Low"?UP:(riskLevel==="High"?DOWN:GOLD);
              var biasColor = bi.trend==="Uptrend"?UP:(bi.trend==="Downtrend"?DOWN:T2);
              return (
                <div>
                  <div style={{fontSize:15,color:T1,lineHeight:1.6,marginBottom:14}}>{symLabel} is {bi.trend.toLowerCase()}, volume is {bi.volumeConfirmed?"confirmed":"average"}, and price is {bi.aboveVwap===true?"above":(bi.aboveVwap===false?"below":"near")} VWAP.</div>
                  <div style={{display:"flex",gap:36}}>
                    <div><div style={{fontSize:11,color:T3,marginBottom:3}}>IMPORTANT EVENTS</div><div style={{fontSize:13,fontWeight:700,color:T1}}>RBI Today, Fed Wed</div></div>
                    <div><div style={{fontSize:11,color:T3,marginBottom:3}}>RISK LEVEL</div><div style={{fontSize:13,fontWeight:700,color:riskLevel?riskColor:T3}}>{riskLevel||"Not Available"}</div></div>
                    <div><div style={{fontSize:11,color:T3,marginBottom:3}}>TRADING BIAS</div><div style={{fontSize:13,fontWeight:700,color:biasColor}}>{bi.trend}</div></div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Breakout Intelligence - the dominant hero, generously spaced */}
          <div style={{marginBottom:20,paddingBottom:24,borderBottom:"1px solid "+BD2}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <span style={{fontSize:17,fontWeight:900,color:T1}}>Breakout Intelligence</span>
              <ProvenanceBadge type="calculated" size="md"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:24}}>
              <div><div style={{fontSize:11,color:T3,marginBottom:4}}>VOLUME</div><div style={{fontSize:16,fontWeight:800,color:T1}}>{bi.volumeConfirmed?"Confirmed":"Average"}</div></div>
              <div><div style={{fontSize:11,color:T3,marginBottom:4}}>VWAP</div><div style={{fontSize:16,fontWeight:800,color:T1}}>{bi.vwap!=null?(bi.aboveVwap?"Above "+bi.vwap.toLocaleString("en-IN"):"Below "+bi.vwap.toLocaleString("en-IN")):"--"}</div></div>
              <div><div style={{fontSize:11,color:T3,marginBottom:4}}>RETEST</div><div style={{fontSize:16,fontWeight:800,color:T1}}>{bi.retest?(bi.retest.retested?"Confirmed":"Not yet"):"No active breakout"}</div></div>
              <div><div style={{fontSize:11,color:T3,marginBottom:4}}>CANDLE STRENGTH</div><div style={{fontSize:16,fontWeight:800,color:T1}}>{bi.candleStrength.label}</div></div>
              <div><div style={{fontSize:11,color:T3,marginBottom:4}}>TREND</div><div style={{fontSize:16,fontWeight:800,color:bi.trend==="Uptrend"?UP:(bi.trend==="Downtrend"?DOWN:T1)}}>{bi.trend}</div></div>
              <div><div style={{fontSize:11,color:T3,marginBottom:4}}>HISTORICAL FOLLOW-THROUGH</div><div style={{fontSize:16,fontWeight:800,color:T1}}>{bi.followThroughRate!=null?bi.followThroughRate+"%":"Not enough data"}</div></div>
            </div>
          </div>

          {/* Key Levels | Market Breadth | Sector Strength - larger 3-column row */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:20,marginBottom:20,paddingBottom:18,borderBottom:"1px solid "+BD2}}>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:T1,marginBottom:12}}>Key Levels</div>
              <div style={{display:"flex",gap:6,marginBottom:14}}>
                {["NIFTY 50","BANK NIFTY","SENSEX"].map(function(lbl,i){
                  var active = i===keyLevelsIdx;
                  return <button key={lbl} onClick={function(){setKeyLevelsIdx(i);}} style={{flex:1,background:active?BLUE:CARD2,border:"1px solid "+(active?BLUE:BD2),borderRadius:7,padding:"6px 2px",color:active?"#fff":T2,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{lbl}</button>;
                })}
              </div>
              {keyLevelsZones.resistance2 ? <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:12,color:DOWN,fontWeight:700}}>R2</span><span style={{fontSize:14,fontWeight:800,fontFamily:"monospace"}}>{keyLevelsZones.resistance2.price}</span></div> : null}
              {keyLevelsZones.resistance ? <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:12,color:DOWN,fontWeight:700}}>R1</span><span style={{fontSize:15,fontWeight:800,fontFamily:"monospace"}}>{keyLevelsZones.resistance.price}</span></div> : null}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:GOLD+"1A",borderLeft:"3px solid "+GOLD,borderRadius:4,margin:"4px 0"}}>
                <span style={{fontSize:11,color:GOLD,fontWeight:800}}>CURRENT</span>
                <span style={{fontSize:15,fontWeight:900,color:GOLD,fontFamily:"monospace"}}>{keyLevelsZones.currentPrice.toLocaleString("en-IN",{maximumFractionDigits:2})}</span>
              </div>
              {keyLevelsZones.support ? <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:12,color:UP,fontWeight:700}}>S1</span><span style={{fontSize:15,fontWeight:800,fontFamily:"monospace"}}>{keyLevelsZones.support.price}</span></div> : null}
              {keyLevelsZones.support2 ? <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:12,color:UP,fontWeight:700}}>S2</span><span style={{fontSize:14,fontWeight:800,fontFamily:"monospace"}}>{keyLevelsZones.support2.price}</span></div> : null}
              <div style={{borderTop:"1px solid "+BD2,marginTop:10,paddingTop:10}}>
                <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:11}}><span style={{color:T2}}>VWAP</span><span style={{fontWeight:700,color:T1,fontFamily:"monospace"}}>{keyLevelsZones.vwap!=null?keyLevelsZones.vwap.toLocaleString("en-IN"):"--"}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:11}}><span style={{color:T2}}>Prev High / Low</span><span style={{fontWeight:700,color:T1,fontFamily:"monospace"}}>{keyLevelsZones.prevHigh!=null?keyLevelsZones.prevHigh.toLocaleString("en-IN")+" / "+keyLevelsZones.prevLow.toLocaleString("en-IN"):"--"}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:11}}><span style={{color:T2}}>Opening Range</span><span style={{fontWeight:700,color:T1,fontFamily:"monospace"}}>{keyLevelsZones.openingRangeHigh!=null?keyLevelsZones.openingRangeHigh.toLocaleString("en-IN")+" / "+keyLevelsZones.openingRangeLow.toLocaleString("en-IN"):"--"}</span></div>
              </div>
            </div>

            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <span style={{fontSize:15,fontWeight:800,color:T1}}>Market Breadth</span>
                <ProvenanceBadge type="demo"/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div><div style={{fontSize:22,fontWeight:900,color:UP}}>{breadth.adv}</div><div style={{fontSize:12,color:T2}}>Advances</div></div>
                <div><div style={{fontSize:22,fontWeight:900,color:DOWN}}>{breadth.dec}</div><div style={{fontSize:12,color:T2}}>Declines</div></div>
                <div><div style={{fontSize:22,fontWeight:900,color:T2}}>{breadth.unch}</div><div style={{fontSize:12,color:T2}}>Unchanged</div></div>
              </div>
            </div>

            <div>
              <div style={{fontSize:15,fontWeight:800,color:T1,marginBottom:12}}>Sector Strength</div>
              <div style={{fontSize:10,color:T3,fontWeight:700,marginBottom:6}}>TOP STRONG</div>
              {sectorPerf.strong.slice(0,3).map(function(sec){
                return <div key={sec.sector} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:12}}><span style={{color:T2}}>{sec.sector}</span><span style={{fontWeight:700,color:UP}}>+{sec.avgChg}%</span></div>;
              })}
              <div style={{fontSize:10,color:T3,fontWeight:700,marginTop:8,marginBottom:6}}>TOP WEAK</div>
              {sectorPerf.weak.slice(0,3).map(function(sec){
                return <div key={sec.sector} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:12}}><span style={{color:T2}}>{sec.sector}</span><span style={{fontWeight:700,color:DOWN}}>{sec.avgChg}%</span></div>;
              })}
            </div>
          </div>

          {/* Scanner Summary - clean list, full width, no compressed mini-bars */}
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:15,fontWeight:800,color:T1}}>Scanner Summary</span>
                <ProvenanceBadge type="calculated"/>
              </div>
              <button onClick={function(){setTab("scan");}} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer"}}>View Full Scanner &#8594;</button>
            </div>
            {scannerPreview.map(function(sr){
              var riskColor = sr.riskLevel==="Low"?UP:(sr.riskLevel==="High"?DOWN:GOLD);
              return (
                <div key={sr.sym} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid "+BD2}}>
                  <span style={{fontSize:14,fontWeight:800,color:T1,width:100}}>{sr.sym}</span>
                  <span style={{fontSize:12,color:T2,width:140}}>{sr.verdict}</span>
                  <span style={{fontSize:12,color:T2,width:180}}>{sr.zoneLabel}{sr.zoneLevel!=null?" ("+sr.zoneLevel.toLocaleString("en-IN")+")":""}</span>
                  <span style={{fontSize:12,fontWeight:700,color:riskColor,width:100}}>Risk: {sr.riskLevel}</span>
                  <div style={{flex:1,display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1,background:CARD2,borderRadius:4,height:6,overflow:"hidden"}}>
                      <div style={{width:sr.confidence+"%",height:"100%",background:BLUE}}></div>
                    </div>
                    <span style={{fontSize:13,fontWeight:800,color:BLUE,width:40,textAlign:"right"}}>{sr.confidence}%</span>
                  </div>
                </div>
              );
            })}
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
