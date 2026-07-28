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
// on this screen, by design. Rules: no backtick, no triple-equals, ASCII.

export default function PriceActionZones(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG = theme.c.bg, CARD = theme.c.card, CARD2 = theme.c.card2, BD = theme.c.border, BD2 = theme.c.border2;
  var T1 = theme.c.text1, T2 = theme.c.text2, T3 = theme.c.text3, BLUE = theme.c.blue, UP = theme.c.up, DOWN = theme.c.down, WARN = theme.c.warn, GOLD = theme.c.gold;
  var responsive = useResponsive();
  var isMobile = responsive.isMobile;

  var onBack = props.onBack || function(){};
  var [symIdx, setSymIdx] = useState(0);
  var sym = DEMO_STOCKS[symIdx];

  var candles = generateDemoCandles(sym.ltp, 90, sym.sym);
  var z = analyzeZones(candles);

  // Today's High/Low/Prev Close/Volume - derived honestly from the same
  // generated demo candle series already backing the chart and zones
  // (internally consistent, not a second disconnected fake number).
  var todayHigh = candles[candles.length-1].h;
  var todayLow = candles[candles.length-1].l;
  var prevClose = candles[candles.length-2] ? candles[candles.length-2].c : z.currentPrice;
  var todayVolume = candles[candles.length-1].vol;
  var chgAbs = parseFloat((z.currentPrice - prevClose).toFixed(2));
  var chgPct = prevClose ? parseFloat(((chgAbs/prevClose)*100).toFixed(2)) : 0;
  var isUp = chgAbs >= 0;

  // Chart zone bands - red for resistance, green for support, drawn as
  // filled bands behind the candles (uses the new optional zones prop on
  // PatternChartEngine - purely additive, doesn't affect other screens).
  var zoneBands = [];
  [z.resistance3, z.resistance2, z.resistance].forEach(function(r){
    if(r) zoneBands.push({y1:r.price, y2:r.price*1.003, color:DOWN, opacity:0.14});
  });
  [z.support, z.support2, z.support3].forEach(function(s){
    if(s) zoneBands.push({y1:s.price, y2:s.price*0.997, color:UP, opacity:0.14});
  });

  var lines = [];
  if(z.resistance3) lines.push({y1:z.resistance3.price, color:DOWN, label:"R3 "+z.resistance3.price, showAt:0});
  if(z.resistance2) lines.push({y1:z.resistance2.price, color:DOWN, label:"R2 "+z.resistance2.price, showAt:0});
  if(z.resistance) lines.push({y1:z.resistance.price, color:DOWN, label:"R1 "+z.resistance.price, showAt:0});
  lines.push({y1:z.currentPrice, color:GOLD, dash:"2 3", label:"Current "+z.currentPrice, showAt:0});
  if(z.support) lines.push({y1:z.support.price, color:UP, label:"S1 "+z.support.price, showAt:0});
  if(z.support2) lines.push({y1:z.support2.price, color:UP, label:"S2 "+z.support2.price, showAt:0});
  if(z.support3) lines.push({y1:z.support3.price, color:UP, label:"S3 "+z.support3.price, showAt:0});

  // Glass-card style used specifically on this screen for a premium feel -
  // subtle translucency + blur over the existing theme card color, not a
  // new color system.
  var glass = {background:CARD+"E6", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", border:"1px solid "+BD, borderRadius:16};

  function ZoneRow(p){
    var zn = p.zone, level = p.level, color = p.color;
    if(!zn) return (
      <div style={{display:"flex",alignItems:"center",padding:isMobile?"8px 10px":"10px 12px",borderBottom:"1px solid "+BD2,opacity:0.5}}>
        <span style={{fontSize:isMobile?11:12,fontWeight:800,color:color,width:28,flexShrink:0}}>{level}</span>
        <span style={{fontSize:isMobile?11:12,color:T3,flex:1}}>Not enough data yet</span>
      </div>
    );
    return (
      <div style={{display:"flex",alignItems:"center",padding:isMobile?"8px 10px":"10px 12px",borderBottom:"1px solid "+BD2,gap:isMobile?6:12}}>
        <span style={{fontSize:isMobile?11:12,fontWeight:900,color:color,width:26,flexShrink:0}}>{level}</span>
        <span style={{fontSize:isMobile?12:13,fontWeight:800,color:T1,fontFamily:"monospace",width:isMobile?70:90,flexShrink:0}}>Rs {zn.price}</span>
        {!isMobile ? <span style={{fontSize:12,color:T2,width:90,flexShrink:0}}>{zn.strength}</span> : null}
        {!isMobile ? <span style={{fontSize:12,color:T2,width:60,flexShrink:0}}>{zn.touches}</span> : null}
        <span style={{fontSize:isMobile?10:12,color:T3,flex:1,textAlign:"right"}}>{zn.lastTested}</span>
      </div>
    );
  }

  function ZoneTable(p){
    return (
      <div style={{...glass, padding:0, overflow:"hidden", flex:1, minWidth:0}}>
        <div style={{padding:isMobile?"10px 10px 6px":"14px 14px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:isMobile?13:14,fontWeight:800,color:p.color}}>{p.title}</span>
        </div>
        {!isMobile ? (
          <div style={{display:"flex",alignItems:"center",padding:"0 12px 6px",gap:12}}>
            <span style={{fontSize:10,color:T3,width:26}}></span>
            <span style={{fontSize:10,color:T3,width:90}}>Price</span>
            <span style={{fontSize:10,color:T3,width:90}}>Strength</span>
            <span style={{fontSize:10,color:T3,width:60}}>Touches</span>
            <span style={{fontSize:10,color:T3,flex:1,textAlign:"right"}}>Last Tested</span>
          </div>
        ) : null}
        {p.rows.map(function(r,i){ return <ZoneRow key={i} level={r.level} zone={r.zone} color={p.color}/>; })}
      </div>
    );
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>

      {/* HEADER - instrument, exchange badge, live price, today's stats */}
      <div style={{padding:isMobile?"12px 14px":"16px 24px",borderBottom:"1px solid "+BD,position:"sticky",top:0,zIndex:10,background:BG}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:isMobile?10:14}}>
          <button onClick={onBack} style={{background:CARD2,border:"none",borderRadius:8,width:40,height:40,color:T1,fontSize:16,cursor:"pointer",flexShrink:0}}>&#8592;</button>
          <div style={{minWidth:0,flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:isMobile?16:20,fontWeight:900,color:T1}}>{sym.sym}</span>
              <span style={{fontSize:10,fontWeight:700,color:T2,background:CARD2,border:"1px solid "+BD2,borderRadius:6,padding:"2px 6px"}}>NSE</span>
            </div>
            <div style={{fontSize:isMobile?11:12,color:T2}}>{sym.name}</div>
          </div>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",alignItems:"flex-end",gap:isMobile?12:28}}>
          <div>
            <div style={{fontSize:isMobile?24:32,fontWeight:900,color:isUp?UP:DOWN,fontFamily:"monospace",lineHeight:1}}>Rs {z.currentPrice.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
            <div style={{fontSize:isMobile?12:13,fontWeight:700,color:isUp?UP:DOWN,marginTop:3}}>{isUp?"+":""}{chgAbs} ({isUp?"+":""}{chgPct}%)</div>
          </div>
          <div style={{display:"flex",gap:isMobile?14:28,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:10,color:T3}}>Today's High</div>
              <div style={{fontSize:isMobile?12:13,fontWeight:700,color:UP}}>{todayHigh.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:T3}}>Today's Low</div>
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

      <div style={{padding:isMobile?14:24,maxWidth:1400,margin:"0 auto"}}>

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

        {/* CHART with shaded R1-R3 / S1-S3 zones + current price line */}
        <div style={{...glass, padding:12, marginBottom:16}}>
          <PatternChartEngine spec={{candles:candles, lines:lines, zones:zoneBands}} autoplay={false}/>
        </div>

        {/* PRICE ACTION SUMMARY - Resistance table | Support table */}
        <div style={{display:"flex",flexDirection:isMobile?"column":"row",gap:14,marginBottom:16}}>
          <ZoneTable
            title="Resistance Zones"
            color={DOWN}
            rows={[{level:"R3",zone:z.resistance3},{level:"R2",zone:z.resistance2},{level:"R1",zone:z.resistance}]}
          />
          <ZoneTable
            title="Support Zones"
            color={UP}
            rows={[{level:"S1",zone:z.support},{level:"S2",zone:z.support2},{level:"S3",zone:z.support3}]}
          />
        </div>

        {/* ZONE SUMMARY */}
        <div style={{...glass, padding:isMobile?14:18, marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:12}}>Zone Summary</div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(5, 1fr)",gap:isMobile?12:16}}>
            <div>
              <div style={{fontSize:10,color:T3,marginBottom:3}}>Trend</div>
              <div style={{fontSize:13,fontWeight:800,color:z.trend=="Uptrend"?UP:(z.trend=="Downtrend"?DOWN:T2)}}>{z.trend}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:T3,marginBottom:3}}>Strength</div>
              <div style={{fontSize:13,fontWeight:800,color:T1}}>{z.support?z.support.strength:(z.resistance?z.resistance.strength:"--")}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:T3,marginBottom:3}}>Price vs Pivot</div>
              <div style={{fontSize:13,fontWeight:800,color:z.support?UP:T2}}>{z.support?"Above":"Below / Unclear"}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:T3,marginBottom:3}}>Trading Range</div>
              <div style={{fontSize:13,fontWeight:800,color:T1}}>{z.support&&z.resistance?(z.support.price+" - "+z.resistance.price):"--"}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:T3,marginBottom:3}}>Risk : Reward</div>
              <div style={{fontSize:13,fontWeight:800,color:T1}}>{z.riskReward!=null?(z.riskReward+" : 1"):"--"}</div>
            </div>
          </div>
        </div>

        {/* DISCLAIMER */}
        <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12}}>
          <div style={{fontSize:11,color:WARN,lineHeight:1.6}}>Support &amp; Resistance levels are generated using historical market data for educational purposes only. They are not buy/sell recommendations. Please conduct your own analysis before trading.</div>
        </div>

      </div>
    </div>
  );
        }
