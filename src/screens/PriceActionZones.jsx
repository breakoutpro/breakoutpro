import { useState, useRef } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { useResponsive } from "../hooks/useResponsive";
import { DEMO_STOCKS } from "../data/marketsStocks";
import { generateDemoCandles, analyzeZones } from "../utils/priceActionZones";
import PatternChartEngine from "./PatternChartEngine";

// BreakoutPro - PriceActionZones.jsx
// "Smart Price Action Zones" - flagship educational feature. Shows historical
// support/resistance zones computed from (demo) candle history, overlaid on
// a chart, across Overview / Chart / News / Option Chain / Futures /
// Financials tabs. This is historical market analysis, not a prediction or a
// trade call - there is no BUY/SELL button, no probability-of-future-move,
// no guarantee anywhere on this screen, by design.
//
// Honesty notes:
// - "Historical Respect Rate" (per zone) is a real computed metric: out of
//   every historical touch of a zone, what % saw price reverse away within
//   the next few candles vs break through. It describes the past, not a
//   forecast. See computeRespectRate() in utils/priceActionZones.js.
// - Timeframe and date-range selectors are functional (they regenerate the
//   same disclosed demo series at a different candle count) - not fake.
// - Drawing tools, Indicators, and the News/Option Chain/Futures/Financials
//   tabs are marked "Coming Soon" rather than faked, since no real drawing
//   engine or per-stock options/futures/financials data exists in this app.
// Rules: no backtick, no triple-equals, ASCII.

var TIMEFRAMES = [["5m",40],["15m",60],["1H",75],["4H",90],["1D",90]];
var RANGES = [["1D",30],["5D",60],["1M",90],["3M",120],["6M",150],["1Y",180],["5Y",180],["All",180]];

export default function PriceActionZones(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG = theme.c.bg, CARD = theme.c.card, CARD2 = theme.c.card2, BD = theme.c.border, BD2 = theme.c.border2;
  var T1 = theme.c.text1, T2 = theme.c.text2, T3 = theme.c.text3, BLUE = theme.c.blue, UP = theme.c.up, DOWN = theme.c.down, WARN = theme.c.warn, GOLD = theme.c.gold;
  var responsive = useResponsive();
  var bp = responsive.breakpoint;
  var isMobile = responsive.isMobile;
  var isTablet = bp=="md";
  var isWide = !isMobile && !isTablet;

  var onBack = props.onBack || function(){};
  var [symIdx, setSymIdx] = useState(0);
  var [tab, setTab] = useState("overview"); // overview | chart | news | optionchain | futures | financials
  var [tfIdx, setTfIdxRaw] = useState(4); // default 1D
  var [rangeIdx, setRangeIdxRaw] = useState(1); // default 5D
  var [lastChanged, setLastChanged] = useState("tf"); // "tf" or "range" - whichever the user touched most recently controls the visible candle count
  function setTfIdx(i){ setTfIdxRaw(i); setLastChanged("tf"); }
  function setRangeIdx(i){ setRangeIdxRaw(i); setLastChanged("range"); }
  var [comingSoonMsg, setComingSoonMsg] = useState(null);
  var chartWrapRef = useRef(null);
  var [isFullscreen, setIsFullscreen] = useState(false);

  var sym = DEMO_STOCKS[symIdx];
  var candleCount = tab=="chart" ? (lastChanged=="range" ? RANGES[rangeIdx][1] : TIMEFRAMES[tfIdx][1]) : TIMEFRAMES[tfIdx][1];
  var candles = generateDemoCandles(sym.ltp, candleCount, sym.sym);
  var z = analyzeZones(candles);

  var todayHigh = candles[candles.length-1].h;
  var todayLow = candles[candles.length-1].l;
  var prevClose = candles[candles.length-2] ? candles[candles.length-2].c : z.currentPrice;
  var todayVolume = candles[candles.length-1].vol;
  var chgAbs = parseFloat((z.currentPrice - prevClose).toFixed(2));
  var chgPct = prevClose ? parseFloat(((chgAbs/prevClose)*100).toFixed(2)) : 0;
  var isUp = chgAbs >= 0;

  function flashComingSoon(label){
    setComingSoonMsg(label);
    setTimeout(function(){ setComingSoonMsg(null); }, 1800);
  }

  function toggleFullscreen(){
    if(!chartWrapRef.current) return;
    if(!document.fullscreenElement){
      if(chartWrapRef.current.requestFullscreen) chartWrapRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if(document.exitFullscreen) document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  function starRating(zone){
    if(!zone) return 0;
    return Math.max(1, Math.min(5, zone.touches));
  }
  function Stars(p){
    var out = [];
    for(var i=1;i<=5;i++){ out.push(i<=p.n ? "&#9733;" : "&#9734;"); }
    return <span style={{color:p.color,fontSize:p.size||11,letterSpacing:1}} dangerouslySetInnerHTML={{__html:out.join("")}}/>;
  }

  var zoneBands = [];
  var zoneLines = [];
  [["R3","Strong Resistance",z.resistance3],["R2","Resistance",z.resistance2],["R1","Immediate Resistance",z.resistance]].forEach(function(r){
    if(!r[2]) return;
    zoneBands.push({y1:r[2].price, y2:r[2].price*1.004, color:DOWN, opacity:0.16});
    zoneLines.push({y1:r[2].price, color:DOWN, dash:"0", bandLabel:r[0]+" - "+r[1], priceTag:r[2].price.toLocaleString("en-IN"), showAt:0});
  });
  zoneLines.push({y1:z.currentPrice, color:GOLD, dash:"2 3", bandLabel:"Pivot / Current Price", priceTag:z.currentPrice.toLocaleString("en-IN",{maximumFractionDigits:2}), showAt:0});
  [["S1","Immediate Support",z.support],["S2","Support",z.support2],["S3","Strong Support",z.support3]].forEach(function(s){
    if(!s[2]) return;
    zoneBands.push({y1:s[2].price, y2:s[2].price*0.996, color:UP, opacity:0.16});
    zoneLines.push({y1:s[2].price, color:UP, dash:"0", bandLabel:s[0]+" - "+s[1], priceTag:s[2].price.toLocaleString("en-IN"), showAt:0});
  });

  var glass = {background:CARD+"E6", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", border:"1px solid "+BD, borderRadius:16};

  function avgRespectRate(){
    var vals = [z.resistance,z.resistance2,z.resistance3,z.support,z.support2,z.support3]
      .filter(function(x){return x && x.respectRate!=null;})
      .map(function(x){return x.respectRate;});
    if(vals.length==0) return null;
    return Math.round(vals.reduce(function(s,v){return s+v;},0)/vals.length);
  }

  // ============ SHARED SUB-COMPONENTS ============

  function ZoneRow(p){
    var zn = p.zone, level = p.level, color = p.color;
    if(!zn) return (
      <div style={{display:"flex",alignItems:"center",padding:"8px 12px",borderBottom:"1px solid "+BD2,opacity:0.5}}>
        <span style={{fontSize:11,fontWeight:800,color:color,width:28,flexShrink:0}}>{level}</span>
        <span style={{fontSize:11,color:T3,flex:1}}>Not enough data yet</span>
      </div>
    );
    return (
      <div style={{display:"flex",alignItems:"center",padding:"9px 12px",borderBottom:"1px solid "+BD2,gap:10}}>
        <span style={{fontSize:12,fontWeight:900,color:color,width:24,flexShrink:0}}>{level}</span>
        <span style={{fontSize:13,fontWeight:800,color:T1,fontFamily:"monospace",width:82,flexShrink:0}}>{zn.price.toLocaleString("en-IN")}</span>
        <span style={{width:70,flexShrink:0}}><Stars n={starRating(zn)} color={color}/></span>
        <span style={{fontSize:12,color:T2,width:32,flexShrink:0,textAlign:"center"}}>{zn.touches}</span>
        <span style={{fontSize:11,color:T3,flex:1,textAlign:"right"}}>{zn.lastTested}</span>
      </div>
    );
  }

  function ZoneTable(p){
    return (
      <div style={{...glass, padding:0, overflow:"hidden"}}>
        <div style={{padding:"12px 14px 8px"}}>
          <span style={{fontSize:13,fontWeight:800,color:p.color}}>{p.title}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",padding:"0 12px 6px",gap:10}}>
          <span style={{fontSize:9,color:T3,width:24}}>Lvl</span>
          <span style={{fontSize:9,color:T3,width:82}}>Price</span>
          <span style={{fontSize:9,color:T3,width:70}}>Strength</span>
          <span style={{fontSize:9,color:T3,width:32,textAlign:"center"}}>Tch</span>
          <span style={{fontSize:9,color:T3,flex:1,textAlign:"right"}}>Last Tested</span>
        </div>
        {p.rows.map(function(r,i){ return <ZoneRow key={i} level={r.level} zone={r.zone} color={p.color}/>; })}
      </div>
    );
  }

  function ZoneSummary(){
    return (
      <div style={{...glass, padding:16}}>
        <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:12}}>Zone Summary</div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+BD2}}>
          <span style={{fontSize:12,color:T2}}>Trend</span>
          <span style={{fontSize:12,fontWeight:800,color:z.trend=="Uptrend"?UP:(z.trend=="Downtrend"?DOWN:T2)}}>{z.trend=="Uptrend"?"Bullish":(z.trend=="Downtrend"?"Bearish":"Sideways")}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+BD2}}>
          <span style={{fontSize:12,color:T2}}>Strength</span>
          <span style={{fontSize:12,fontWeight:800,color:T1}}>{z.support?z.support.strength:(z.resistance?z.resistance.strength:"--")}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+BD2}}>
          <span style={{fontSize:12,color:T2}}>Price vs Pivot</span>
          <span style={{fontSize:12,fontWeight:800,color:z.support?UP:T2}}>{z.support?"Above":"Below / Unclear"}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+BD2}}>
          <span style={{fontSize:12,color:T2}}>Range</span>
          <span style={{fontSize:12,fontWeight:800,color:T1}}>{z.support3?z.support3.price.toLocaleString("en-IN"):(z.support?z.support.price.toLocaleString("en-IN"):"--")} - {z.resistance3?z.resistance3.price.toLocaleString("en-IN"):(z.resistance?z.resistance.price.toLocaleString("en-IN"):"--")}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0"}}>
          <span style={{fontSize:12,color:T2}}>Risk / Reward (S1 to R1)</span>
          <span style={{fontSize:12,fontWeight:800,color:UP}}>{z.riskReward!=null?(z.riskReward+" : 1"):"--"}</span>
        </div>
        <div style={{fontSize:10,color:T3,marginTop:10,fontStyle:"italic"}}>* For educational purposes only</div>
      </div>
    );
  }

  function ChartCard(withOhlc){
    var lastC = candles[candles.length-1];
    return (
      <div ref={chartWrapRef} style={{...glass, padding:12, background:isFullscreen?BG:glass.background}}>
        {withOhlc ? (
          <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:isMobile?8:16,marginBottom:8,paddingBottom:8,borderBottom:"1px solid "+BD2}}>
            <span style={{fontSize:11,fontWeight:700,color:T1}}>{sym.sym} &middot; {TIMEFRAMES[tfIdx][0]} &middot; NSE</span>
            <span style={{fontSize:11,color:T2}}>O<span style={{color:T1,fontWeight:700}}>{lastC.o}</span></span>
            <span style={{fontSize:11,color:T2}}>H<span style={{color:UP,fontWeight:700}}>{lastC.h}</span></span>
            <span style={{fontSize:11,color:T2}}>L<span style={{color:DOWN,fontWeight:700}}>{lastC.l}</span></span>
            <span style={{fontSize:11,color:T2}}>C<span style={{color:T1,fontWeight:700}}>{lastC.c}</span></span>
            <span style={{fontSize:11,fontWeight:700,color:isUp?UP:DOWN}}>{isUp?"+":""}{chgAbs} ({isUp?"+":""}{chgPct}%)</span>
          </div>
        ) : null}
        <PatternChartEngine spec={{candles:candles, lines:zoneLines, zones:zoneBands}} autoplay={false}/>
      </div>
    );
  }

  var panels = (
    <div>
      <div style={{marginBottom:14}}><ZoneTable title="Resistance Zones" color={DOWN} rows={[{level:"R3",zone:z.resistance3},{level:"R2",zone:z.resistance2},{level:"R1",zone:z.resistance}]}/></div>
      <div style={{marginBottom:14}}><ZoneTable title="Support Zones" color={UP} rows={[{level:"S1",zone:z.support},{level:"S2",zone:z.support2},{level:"S3",zone:z.support3}]}/></div>
      <ZoneSummary/>
    </div>
  );

  // ============ COMING SOON ICON BUTTON (drawing tools, indicators, etc.) ============
  function ComingSoonIcon(p){
    return (
      <button onClick={function(){ flashComingSoon(p.label); }} title={p.label+" - Coming Soon"} style={{background:"none",border:"none",width:34,height:34,borderRadius:8,color:T3,fontSize:15,cursor:"pointer",opacity:0.5,display:"flex",alignItems:"center",justifyContent:"center"}} dangerouslySetInnerHTML={{__html:p.icon}}/>
    );
  }

  // ============ HEADER (shared across tabs) ============
  function Header(){
    return (
      <div style={{padding:isMobile?"12px 14px":"14px 24px",borderBottom:"1px solid "+BD,position:"sticky",top:0,zIndex:10,background:BG}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:isMobile?10:12}}>
          <button onClick={onBack} style={{background:CARD2,border:"none",borderRadius:8,width:38,height:38,color:T1,fontSize:16,cursor:"pointer",flexShrink:0}}>&#8592;</button>
          <div style={{minWidth:0,flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:isMobile?16:20,fontWeight:900,color:T1}}>{sym.sym}</span>
              <span style={{fontSize:10,fontWeight:700,color:T2,background:CARD2,border:"1px solid "+BD2,borderRadius:6,padding:"2px 6px"}}>NSE</span>
            </div>
            <div style={{fontSize:isMobile?11:12,color:T2}}>{sym.name}</div>
          </div>
          {!isMobile ? (
            <div style={{display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
              <button onClick={function(){ flashComingSoon("Watchlist star"); }} style={{background:"none",border:"none",cursor:"pointer",color:GOLD,fontSize:18}}>&#9733;</button>
              <button onClick={function(){ flashComingSoon("Notification bell"); }} style={{background:"none",border:"none",cursor:"pointer",color:T2,fontSize:16}}>&#128276;</button>
              <button onClick={function(){ flashComingSoon("Share"); }} style={{background:"none",border:"none",cursor:"pointer",color:T2,fontSize:16}}>&#128257;</button>
            </div>
          ) : null}
        </div>

        <div style={{display:"flex",flexWrap:"wrap",alignItems:"flex-end",gap:isMobile?14:32}}>
          <div>
            <div style={{fontSize:isMobile?22:30,fontWeight:900,color:isUp?UP:DOWN,fontFamily:"monospace",lineHeight:1}}>{z.currentPrice.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
            <div style={{fontSize:isMobile?11:13,fontWeight:700,color:isUp?UP:DOWN,marginTop:3}}>{isUp?"+":""}{chgAbs} ({isUp?"+":""}{chgPct}%)</div>
          </div>
          <div style={{display:"flex",gap:isMobile?14:28,flexWrap:"wrap"}}>
            <div><div style={{fontSize:10,color:T3}}>High</div><div style={{fontSize:isMobile?12:13,fontWeight:700,color:UP}}>{todayHigh.toLocaleString("en-IN")}</div></div>
            <div><div style={{fontSize:10,color:T3}}>Low</div><div style={{fontSize:isMobile?12:13,fontWeight:700,color:DOWN}}>{todayLow.toLocaleString("en-IN")}</div></div>
            <div><div style={{fontSize:10,color:T3}}>Prev. Close</div><div style={{fontSize:isMobile?12:13,fontWeight:700,color:T1}}>{prevClose.toLocaleString("en-IN")}</div></div>
            <div><div style={{fontSize:10,color:T3}}>Volume</div><div style={{fontSize:isMobile?12:13,fontWeight:700,color:T1}}>{todayVolume.toFixed(2)}x Avg</div></div>
          </div>
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:isMobile?14:24,marginTop:isMobile?12:14,overflowX:"auto"}}>
          {[["overview","Overview"],["chart","Chart"],["news","News"],["optionchain","Option Chain"],["futures","Futures"],["financials","Financials"]].map(function(t){
            var active = tab==t[0];
            return (
              <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{background:"none",border:"none",borderBottom:"2px solid "+(active?BLUE:"transparent"),padding:"0 0 8px",color:active?BLUE:T2,fontSize:isMobile?12:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{t[1]}</button>
            );
          })}
        </div>
      </div>
    );
  }

  // ============ OVERVIEW TAB ============
  function OverviewTab(){
    var rate = avgRespectRate();
    var statCards = [
      ["Trend", z.trend=="Uptrend"?"Bullish":(z.trend=="Downtrend"?"Bearish":"Sideways"), z.trend=="Uptrend"?UP:(z.trend=="Downtrend"?DOWN:T2), "&#128200;"],
      ["Historical Respect Rate", rate!=null?(rate+"%"):"--", rate!=null&&rate>=70?UP:(rate!=null&&rate<50?DOWN:T2), "&#128274;"],
      ["Risk/Reward", z.riskReward!=null?(z.riskReward+":1"):"--", UP, "&#9878;"],
      ["Volume at Levels", (z.resistance&&z.resistance.volumeConfirmed)||(z.support&&z.support.volumeConfirmed)?"High":"Normal", T1, "&#128202;"],
      ["Next Key Level", z.nextKeyLevel!=null?z.nextKeyLevel.toLocaleString("en-IN"):"--", z.resistance?DOWN:UP, "&#127919;"]
    ];
    return (
      <div>
        <div style={{marginBottom:16}}>{ChartCard(false)}</div>

        <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2, 1fr)":"repeat(5, 1fr)",gap:10,marginBottom:16}}>
          {statCards.map(function(c,i){
            return (
              <div key={i} style={{...glass, padding:12,textAlign:"center"}}>
                <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:c[3]}}/>
                <div style={{fontSize:10,color:T3,marginTop:6}}>{c[0]}</div>
                <div style={{fontSize:14,fontWeight:800,color:c[2],marginTop:2}}>{c[1]}</div>
              </div>
            );
          })}
        </div>

        <div style={{display:isWide?"grid":"block",gridTemplateColumns:isWide?"1fr 1fr":undefined,gap:14,marginBottom:16}}>
          <div style={{marginBottom:isWide?0:14}}><ZoneTable title="Resistance Zones" color={DOWN} rows={[{level:"R3",zone:z.resistance3},{level:"R2",zone:z.resistance2},{level:"R1",zone:z.resistance}]}/></div>
          <ZoneTable title="Support Zones" color={UP} rows={[{level:"S1",zone:z.support},{level:"S2",zone:z.support2},{level:"S3",zone:z.support3}]}/>
        </div>

        {/* ALERTS FOR THIS STOCK */}
        <div style={{...glass, padding:16, marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:12}}>Alerts For This Stock</div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2, 1fr)":"repeat(4, 1fr)",gap:10}}>
            {[["&#128276;","Alert at Support","Notify at S1, S2, S3",UP],["&#128276;","Alert at Resistance","Notify at R1, R2, R3",DOWN],["&#128276;","Breakout Alert","Notify on breakout",BLUE],["&#128276;","Custom Alert","Create new alert",theme.c.gold]].map(function(a,i){
              return (
                <button key={i} onClick={function(){ if(props.setTab) props.setTab("alerts"); else flashComingSoon(a[1]); }} style={{background:CARD2,border:"1px solid "+BD2,borderRadius:12,padding:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                  <span style={{fontSize:15,color:a[3]}} dangerouslySetInnerHTML={{__html:a[0]}}/>
                  <div style={{fontSize:12,fontWeight:700,color:T1,marginTop:6}}>{a[1]}</div>
                  <div style={{fontSize:10,color:T3,marginTop:2}}>{a[2]}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ============ CHART TAB ============
  function ChartTab(){
    return (
      <div>
        {/* Timeframe + toolbar row */}
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:8,marginBottom:12}}>
          <div style={{display:"flex",gap:4,background:CARD2,border:"1px solid "+BD2,borderRadius:10,padding:4}}>
            {TIMEFRAMES.map(function(t,i){
              var active = i==tfIdx;
              return <button key={t[0]} onClick={function(){setTfIdx(i);}} style={{background:active?BLUE:"none",border:"none",borderRadius:7,padding:"6px 10px",color:active?"#fff":T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t[0]}</button>;
            })}
          </div>
          {!isMobile ? (
            <div style={{display:"flex",gap:2}}>
              <ComingSoonIcon icon="&#8617;" label="Undo"/>
              <ComingSoonIcon icon="&#8618;" label="Redo"/>
              <ComingSoonIcon icon="&#128202;" label="Indicators"/>
              <ComingSoonIcon icon="&#9881;" label="Settings"/>
            </div>
          ) : null}
          <button onClick={toggleFullscreen} style={{background:"none",border:"1px solid "+BD2,borderRadius:8,width:34,height:34,color:T2,fontSize:14,cursor:"pointer",marginLeft:isMobile?"auto":0}}>&#10021;</button>
        </div>

        <div style={{display:isWide?"grid":"block",gridTemplateColumns:isWide?"70% 1fr":undefined,gap:18,alignItems:"start"}}>
          <div style={{display:"flex",gap:0}}>
            {!isMobile ? (
              <div style={{display:"flex",flexDirection:"column",gap:2,paddingRight:8,borderRight:"1px solid "+BD2,marginRight:8}}>
                {[["&#10021;","Crosshair"],["&#9585;","Trend Line"],["&#128207;","Horizontal Line"],["&#9707;","Fibonacci"],["&#9998;","Text"],["&#127917;","Brush"],["&#128269;","Zoom"],["&#128465;","Clear"]].map(function(tl){
                  return <ComingSoonIcon key={tl[1]} icon={tl[0]} label={tl[1]}/>;
                })}
              </div>
            ) : null}
            <div style={{flex:1,minWidth:0}}>{ChartCard(true)}</div>
          </div>

          {isWide ? panels : null}
        </div>

        {/* Date range selector */}
        <div style={{display:"flex",gap:4,marginTop:12,overflowX:"auto"}}>
          {RANGES.map(function(r,i){
            var active = i==rangeIdx;
            return <button key={r[0]} onClick={function(){setRangeIdx(i);}} style={{background:active?BLUE:"none",border:"none",borderRadius:6,padding:"5px 10px",color:active?"#fff":T2,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{r[0]}</button>;
          })}
        </div>

        {!isWide ? <div style={{marginTop:14}}>{panels}</div> : null}
      </div>
    );
  }

  // ============ COMING SOON TAB (News / Option Chain / Futures / Financials) ============
  function ComingSoonTab(label, hint){
    return (
      <div style={{...glass, padding:32, textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:10}}>&#128274;</div>
        <div style={{fontSize:15,fontWeight:800,color:T1,marginBottom:6}}>{label} - Coming Soon</div>
        <div style={{fontSize:12,color:T2,maxWidth:360,margin:"0 auto"}}>{hint}</div>
      </div>
    );
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:32,position:"relative"}}>

      <Header/>

      <div style={{padding:isMobile?14:"18px 24px",maxWidth:1800,margin:"0 auto"}}>

        <div style={{background:"rgba(37,99,235,0.08)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:10,padding:12,marginBottom:16}}>
          <div style={{fontSize:12,color:BLUE,lineHeight:1.6}}>This shows where price has historically reacted in the past. It is a study of past behaviour, not a prediction, not a signal, and not a guarantee of any future breakout or reversal.</div>
        </div>

        <div style={{display:"flex",gap:8,overflowX:"auto",marginBottom:16,paddingBottom:4}}>
          {DEMO_STOCKS.slice(0,12).map(function(s,i){
            var active = i==symIdx;
            return <button key={s.sym} onClick={function(){setSymIdx(i);}} style={{background:active?BLUE:CARD2,border:"1px solid "+(active?BLUE:BD2),borderRadius:20,padding:"6px 14px",color:active?"#fff":T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0}}>{s.sym}</button>;
          })}
        </div>

        {tab=="overview" ? <OverviewTab/> : null}
        {tab=="chart" ? <ChartTab/> : null}
        {tab=="news" ? ComingSoonTab("News", "Per-stock news feed for "+sym.sym+" is not available yet. Check the main News tab for general market headlines.") : null}
        {tab=="optionchain" ? ComingSoonTab("Option Chain", "A live option chain for individual stocks is not available yet. NIFTY options are covered in Options Intelligence.") : null}
        {tab=="futures" ? ComingSoonTab("Futures", "Per-stock futures data is not available yet. NIFTY futures are covered in Futures Intelligence.") : null}
        {tab=="financials" ? ComingSoonTab("Financials", "Company fundamentals and financial statements for "+sym.sym+" are not available yet.") : null}

        <div style={{height:16}}></div>

        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12}}>
          <div style={{fontSize:11,color:WARN,lineHeight:1.6}}>Support &amp; Resistance levels are generated using historical market data for educational purposes only. They are not buy/sell recommendations. Please conduct your own analysis before trading.</div>
        </div>

      </div>

      {comingSoonMsg ? (
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:CARD2,border:"1px solid "+BD2,borderRadius:10,padding:"10px 18px",color:T1,fontSize:12,fontWeight:700,zIndex:50,boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>{comingSoonMsg} - Coming Soon</div>
      ) : null}
    </div>
  );
}
