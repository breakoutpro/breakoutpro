import { useState } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { useResponsive } from "../hooks/useResponsive";
import { DEMO_STOCKS } from "../data/marketsStocks";
import { generateDemoCandles, analyzeZones } from "../utils/priceActionZones";
import PatternChartEngine from "./PatternChartEngine";

// BreakoutPro - PriceActionZones.jsx
// "Smart Price Action Zones" - flagship educational feature. Shows historical
// support/resistance zones computed from (demo) candle history, overlaid on
// a chart. This is historical market analysis, not a prediction or a trade
// call - there is no BUY/SELL button, no probability, no guarantee anywhere
// on this screen, by design.
//
// Layout: Mobile stacks everything; Tablet uses two columns; Laptop/Desktop/
// TV use a ~70/30 chart-left / panels-right split, matching the reference
// trading-terminal layout while keeping Breakout Pro's own branding.
// Rules: no backtick, no triple-equals, ASCII.

export default function PriceActionZones(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG = theme.c.bg, CARD = theme.c.card, CARD2 = theme.c.card2, BD = theme.c.border, BD2 = theme.c.border2;
  var T1 = theme.c.text1, T2 = theme.c.text2, T3 = theme.c.text3, BLUE = theme.c.blue, UP = theme.c.up, DOWN = theme.c.down, WARN = theme.c.warn, GOLD = theme.c.gold;
  var responsive = useResponsive();
  var bp = responsive.breakpoint; // xs, sm, md, lg, xl, xxl, tv, tv4k
  var isMobile = responsive.isMobile;
  var isTablet = bp=="md";
  var isWide = !isMobile && !isTablet; // lg, xl, xxl, tv, tv4k - chart+panel split

  var onBack = props.onBack || function(){};
  var [symIdx, setSymIdx] = useState(0);
  var sym = DEMO_STOCKS[symIdx];

  var candles = generateDemoCandles(sym.ltp, 90, sym.sym);
  var z = analyzeZones(candles);

  // Today's High/Low/Prev Close/Volume - derived honestly from the same
  // generated demo candle series already backing the chart and zones.
  var todayHigh = candles[candles.length-1].h;
  var todayLow = candles[candles.length-1].l;
  var prevClose = candles[candles.length-2] ? candles[candles.length-2].c : z.currentPrice;
  var todayVolume = candles[candles.length-1].vol; // relative multiplier vs average, not an absolute share count
  var chgAbs = parseFloat((z.currentPrice - prevClose).toFixed(2));
  var chgPct = prevClose ? parseFloat(((chgAbs/prevClose)*100).toFixed(2)) : 0;
  var isUp = chgAbs >= 0;

  function starRating(zone){
    if(!zone) return 0;
    return Math.max(1, Math.min(5, zone.touches));
  }
  function Stars(p){
    var n = p.n;
    var out = [];
    for(var i=1;i<=5;i++){ out.push(i<=n ? "&#9733;" : "&#9734;"); }
    return <span style={{color:p.color,fontSize:p.size||11,letterSpacing:1}} dangerouslySetInnerHTML={{__html:out.join("")}}/>;
  }

  // Chart zone bands (filled, full width) + labeled price-tag lines, matching
  // the reference's "tinted band + descriptive label + price tag" style.
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

  // Glass-card style used on this screen for a premium feel - translucency +
  // blur over the existing theme card color, not a new color system.
  var glass = {background:CARD+"E6", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", border:"1px solid "+BD, borderRadius:16};

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
        <span style={{fontSize:12,color:T2,width:36,flexShrink:0,textAlign:"center"}}>{zn.touches}</span>
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
          <span style={{fontSize:9,color:T3,width:36,textAlign:"center"}}>Tch</span>
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

  function ChartCard(){
    return (
      <div style={{...glass, padding:12}}>
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

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:32}}>

      {/* HEADER - instrument, exchange badge, live price, today's stats */}
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
        </div>

        <div style={{display:"flex",flexWrap:"wrap",alignItems:"flex-end",gap:isMobile?14:32}}>
          <div>
            <div style={{fontSize:isMobile?22:30,fontWeight:900,color:isUp?UP:DOWN,fontFamily:"monospace",lineHeight:1}}>{z.currentPrice.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
            <div style={{fontSize:isMobile?11:13,fontWeight:700,color:isUp?UP:DOWN,marginTop:3}}>{isUp?"+":""}{chgAbs} ({isUp?"+":""}{chgPct}%)</div>
          </div>
          <div style={{display:"flex",gap:isMobile?14:28,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:10,color:T3}}>High</div>
              <div style={{fontSize:isMobile?12:13,fontWeight:700,color:UP}}>{todayHigh.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:T3}}>Low</div>
              <div style={{fontSize:isMobile?12:13,fontWeight:700,color:DOWN}}>{todayLow.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:T3}}>Prev. Close</div>
              <div style={{fontSize:isMobile?12:13,fontWeight:700,color:T1}}>{prevClose.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:T3}}>Volume</div>
              <div style={{fontSize:isMobile?12:13,fontWeight:700,color:T1}}>{todayVolume.toFixed(2)}x Avg</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:isMobile?14:"18px 24px",maxWidth:1800,margin:"0 auto"}}>

        <div style={{background:"rgba(37,99,235,0.08)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:10,padding:12,marginBottom:16}}>
          <div style={{fontSize:12,color:BLUE,lineHeight:1.6}}>This shows where price has historically reacted in the past. It is a study of past behaviour, not a prediction, not a signal, and not a guarantee of any future breakout or reversal.</div>
        </div>

        {/* Symbol switcher */}
        <div style={{display:"flex",gap:8,overflowX:"auto",marginBottom:16,paddingBottom:4}}>
          {DEMO_STOCKS.slice(0,12).map(function(s,i){
            var active = i==symIdx;
            return (
              <button key={s.sym} onClick={function(){setSymIdx(i);}} style={{background:active?BLUE:CARD2,border:"1px solid "+(active?BLUE:BD2),borderRadius:20,padding:"6px 14px",color:active?"#fff":T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0}}>{s.sym}</button>
            );
          })}
        </div>

        {/* MAIN LAYOUT - breakpoint-specific structure */}
        {isMobile ? (
          // Mobile: chart, then panels stacked naturally below it
          <div>
            <div style={{marginBottom:16}}><ChartCard/></div>
            {panels}
          </div>
        ) : isTablet ? (
          // Tablet: two columns - chart spans full width on top, tables side by side below
          <div>
            <div style={{marginBottom:16}}><ChartCard/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <ZoneTable title="Resistance Zones" color={DOWN} rows={[{level:"R3",zone:z.resistance3},{level:"R2",zone:z.resistance2},{level:"R1",zone:z.resistance}]}/>
              <ZoneTable title="Support Zones" color={UP} rows={[{level:"S1",zone:z.support},{level:"S2",zone:z.support2},{level:"S3",zone:z.support3}]}/>
            </div>
            <ZoneSummary/>
          </div>
        ) : (
          // Laptop/Desktop/TV: chart ~70% left, panels ~30% right
          <div style={{display:"grid",gridTemplateColumns:"70% 1fr",gap:18,alignItems:"start"}}>
            <ChartCard/>
            {panels}
          </div>
        )}

        <div style={{height:16}}></div>

        {/* DISCLAIMER */}
        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12}}>
          <div style={{fontSize:11,color:WARN,lineHeight:1.6}}>Support &amp; Resistance levels are generated using historical market data for educational purposes only. They are not buy/sell recommendations. Please conduct your own analysis before trading.</div>
        </div>

      </div>
    </div>
  );
}
