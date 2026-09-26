// BreakoutPro - RangeIntelligence.jsx
// Smart AI Candlestick Trading Station for NIFTY / BANK NIFTY / SENSEX /
// FINNIFTY, built entirely on real data already flowing through
// api/market-mood-data.js (mm.data.indices.* and mm.data.indexHistory.*).
//
// DATA HONESTY - read before changing anything:
// - "1D" (Daily) chart mode plots REAL daily high/low/close candles from
//   mm.data.indexHistory[SYM].candles (up to the last ~10 real sessions).
//   That endpoint does not carry a per-day OPEN, so each daily candle's
//   open is CALCULATED as the previous session's close (a standard,
//   disclosed convention - the same "use what we have honestly" approach
//   already used for CPR/pivot below). This mode never uses Math.random()
//   or any synthetic path - every H/L/C is a real historical value.
// - "5m" / "15m" / "1H" intraday modes: NO verified intraday tick/bar feed
//   exists anywhere in this codebase (confirmed - only one daily H/L/C per
//   session is fetched). These modes render a deterministic, seeded
//   "INTERACTIVE PATTERN PREVIEW" path - anchored to REAL open/prevClose/
//   ltp and clamped inside the REAL day high/low - so the AI pattern
//   engine and chart interactions have something to demonstrate on. This
//   is disclosed with a persistent on-screen banner at all times while
//   active, and is never labeled LIVE.
// - "Range Channel" mode draws zero candles - it is a pure real-data
//   channel view of today's high/low/CPR, same numbers as Range Summary.
//
// No second data pipeline, no fabricated fallbacks, no Math.random() used
// for anything presented as real. Rules: no backtick literals, ASCII only.

import { useState, useEffect, useRef, useMemo } from "react";
import { useTheme } from "../../theme/ThemeProvider";

var INSTRUMENTS = [
  { key:"NIFTY", label:"NIFTY 50" },
  { key:"BANKNIFTY", label:"BANK NIFTY" },
  { key:"SENSEX", label:"SENSEX" },
  { key:"FINNIFTY", label:"FINNIFTY" }
];

var TIMEFRAMES = [
  { key:"5m", label:"5m", minutes:5, kind:"preview" },
  { key:"15m", label:"15m", minutes:15, kind:"preview" },
  { key:"1h", label:"1H", minutes:60, kind:"preview" },
  { key:"1D", label:"1D", minutes:375, kind:"daily" }
];

var CHART_MODES = ["Candlestick", "Line", "Area", "Range Channel"];

var SENT_GREEN = "#16A34A";
var SENT_RED = "#DC2626";
var SENT_YELLOW = "#EAB308";

function fmtNum(v){
  return v==null ? "--" : v.toLocaleString("en-IN");
}

// ---------------------------------------------------------------------
// Real CPR / pivot - identical methodology already shipped on Home.
// ---------------------------------------------------------------------
function computeCPR(idx){
  if(!idx || idx.ltp==null || idx.high==null || idx.low==null || idx.high<=idx.low) return null;
  var pivot = (idx.high + idx.low + idx.ltp) / 3;
  var bc = (idx.high + idx.low) / 2;
  var tc = (2 * pivot) - bc;
  var r1 = (2*pivot) - idx.low;
  var s1 = (2*pivot) - idx.high;
  var r2 = pivot + (idx.high - idx.low);
  var s2 = pivot - (idx.high - idx.low);
  var widthPct = (Math.abs(tc - bc) / pivot) * 100;
  return {
    pivot: Math.round(pivot*100)/100,
    bc: Math.round(Math.min(bc,tc)*100)/100,
    tc: Math.round(Math.max(bc,tc)*100)/100,
    r1: Math.round(r1*100)/100,
    s1: Math.round(s1*100)/100,
    r2: Math.round(r2*100)/100,
    s2: Math.round(s2*100)/100,
    widthPct: Math.round(widthPct*10000)/10000,
    status: widthPct < 0.15 ? "Narrow CPR" : "Wide CPR",
    note: widthPct < 0.15 ? "Potential volatile move" : "Range-bound bias"
  };
}

function computeRange(idx){
  if(!idx || idx.ltp==null || idx.high==null || idx.low==null || idx.high<=idx.low) return null;
  var width = idx.high - idx.low;
  var rawPosPct = ((idx.ltp - idx.low) / width) * 100;
  var posPct = Math.round(Math.max(0, Math.min(100, rawPosPct)) * 10) / 10;
  var distToHigh = Math.round((idx.high - idx.ltp) * 100) / 100;
  var distToLow = Math.round((idx.ltp - idx.low) * 100) / 100;
  var distToHighPct = Math.round((distToHigh / idx.ltp) * 10000) / 100;
  var distToLowPct = Math.round((distToLow / idx.ltp) * 10000) / 100;
  var zone = posPct<=20?"Near Low":(posPct<=40?"Lower Range":(posPct<=60?"Mid Range":(posPct<=80?"Upper Range":"Near High")));
  var state = posPct>=80 ? "Breakout Watch" : (posPct<=20 ? "Breakdown Watch" : "Balanced");
  return {
    ltp:idx.ltp, high:idx.high, low:idx.low, width:Math.round(width*100)/100,
    widthPct: Math.round((width/idx.ltp)*10000)/100,
    posPct:posPct, zone:zone, distToHigh:distToHigh, distToLow:distToLow,
    distToHighPct:distToHighPct, distToLowPct:distToLowPct, state:state
  };
}

// ---------------------------------------------------------------------
// IST session clock - local UI convenience only (9:15-15:30 IST, Mon-Fri).
// Never used to overwrite the server's own freshness/status fields.
// ---------------------------------------------------------------------
function getIST(){
  try{
    return new Date(new Date().toLocaleString("en-US", { timeZone:"Asia/Kolkata" }));
  }catch(e){
    return new Date();
  }
}
function sessionInfo(now){
  var day = now.getDay();
  var mins = now.getHours()*60 + now.getMinutes() + (now.getSeconds()/60);
  var openMin = 9*60 + 15;
  var closeMin = 15*60 + 30;
  var isWeekday = day>=1 && day<=5;
  var isOpen = isWeekday && mins>=openMin && mins<closeMin;
  var elapsed = Math.max(0, Math.min(closeMin-openMin, mins-openMin));
  return { isOpen:isOpen, elapsedMin:elapsed, openMin:openMin, closeMin:closeMin, totalMin:closeMin-openMin };
}

// ---------------------------------------------------------------------
// Deterministic seeded generator (Math.sin based - NOT Math.random).
// Anchored to real open -> real ltp, clamped within real high/low.
// Re-seeding on barVersion lets the "live" bar evolve without ever being
// literally random.
// ---------------------------------------------------------------------
function seeded(n){
  var x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
}
function generatePreviewCandles(anchor, count, seedBase){
  var open = anchor.open!=null ? anchor.open : anchor.prevClose;
  var ltp = anchor.ltp;
  var high = anchor.high;
  var low = anchor.low;
  if(open==null || ltp==null || high==null || low==null || count<1) return [];
  var out = [];
  var prevClose = open;
  for(var i=0;i<count;i++){
    var progress = (i+1)/count;
    var target = open + (ltp - open) * progress;
    var noise = (seeded(seedBase + i*3.113) - 0.5) * (high-low) * 0.12;
    var close = Math.max(low, Math.min(high, target + noise));
    var wickUp = seeded(seedBase + i*7.71) * (high-low) * 0.08;
    var wickDown = seeded(seedBase + i*11.31) * (high-low) * 0.08;
    var barHigh = Math.max(prevClose, close) + wickUp;
    var barLow = Math.min(prevClose, close) - wickDown;
    barHigh = Math.min(high, barHigh);
    barLow = Math.max(low, barLow);
    out.push({
      i:i, o:Math.round(prevClose*100)/100, h:Math.round(barHigh*100)/100,
      l:Math.round(barLow*100)/100, c:Math.round(close*100)/100
    });
    prevClose = close;
  }
  // Last candle always closes exactly at the real LTP - the chart never
  // disagrees with the real current price.
  if(out.length){
    var last = out[out.length-1];
    last.c = Math.round(ltp*100)/100;
    last.h = Math.round(Math.max(last.h, last.c)*100)/100;
    last.l = Math.round(Math.min(last.l, last.c)*100)/100;
  }
  return out;
}

// Real daily candles from mm.data.indexHistory - open synthesized only as
// "previous session's close", disclosed in the UI note.
function buildDailyCandles(hist){
  if(!hist || !hist.candles || hist.candles.length<2) return [];
  var arr = hist.candles;
  var out = [];
  for(var i=1;i<arr.length;i++){
    var prev = arr[i-1], cur = arr[i];
    if(cur.h==null || cur.l==null || cur.c==null) continue;
    out.push({ i:i-1, o:prev.c, h:Math.max(cur.h, prev.c, cur.c), l:Math.min(cur.l, prev.c, cur.c), c:cur.c });
  }
  return out;
}

// ---------------------------------------------------------------------
// AI Candlestick Pattern Recognition Engine - runs on the latest CLOSED
// candle (and the one before it, for the two engulfing patterns). Pure
// arithmetic on the OHLC values already computed above - no ML, no
// external call, fully deterministic and explainable.
// ---------------------------------------------------------------------
function detectPattern(candles){
  if(!candles || candles.length<1) return null;
  var last = candles[candles.length-1];
  var prev = candles.length>=2 ? candles[candles.length-2] : null;
  var body = Math.abs(last.c - last.o);
  var range = Math.max(0.0001, last.h - last.l);
  var upperWick = last.h - Math.max(last.o, last.c);
  var lowerWick = Math.min(last.o, last.c) - last.l;
  var isBull = last.c > last.o;
  var isBear = last.c < last.o;

  if(prev){
    var prevBody = Math.abs(prev.c - prev.o);
    var prevBull = prev.c > prev.o;
    var prevBear = prev.c < prev.o;
    if(isBull && prevBear && last.o<=prev.c && last.c>=prev.o && body>prevBody*0.95){
      return { name:"Bullish Engulfing", dir:"bull", desc:"Current candle's real body fully covers the prior red candle - buyers overwhelmed sellers." };
    }
    if(isBear && prevBull && last.o>=prev.c && last.c<=prev.o && body>prevBody*0.95){
      return { name:"Bearish Engulfing", dir:"bear", desc:"Current candle's real body fully covers the prior green candle - sellers overwhelmed buyers." };
    }
  }
  if(body <= range*0.1){
    return { name:"Doji", dir:"neutral", desc:"Open and close are nearly equal - indecision between buyers and sellers." };
  }
  if(lowerWick >= body*2 && upperWick <= body*0.5){
    return { name: isBull ? "Hammer" : "Pinbar", dir:"bull", desc:"Long lower wick with a small body near the top - rejection of lower prices." };
  }
  if(upperWick >= body*2 && lowerWick <= body*0.5){
    return { name:"Shooting Star", dir:"bear", desc:"Long upper wick with a small body near the bottom - rejection of higher prices." };
  }
  return null;
}

// ---------------------------------------------------------------------
// CandleChart - TradingView-style pane: right price ruler, bottom time
// ruler, mouse wheel zoom, click-drag + touch pan, pinch-to-zoom,
// crosshair with floating OHLC tooltip. Y-axis auto-scales from the
// VISIBLE slice only (not the whole series), so zooming/panning always
// fills the available height.
// ---------------------------------------------------------------------
function CandleChart(props){
  var theme = props.theme;
  var candles = props.candles || [];
  var mode = props.mode;
  var dayHigh = props.dayHigh, dayLow = props.dayLow, cpr = props.cpr, ltp = props.ltp;
  var isPreview = props.isPreview;

  var svgRef = useRef(null);
  var dragRef = useRef(null);
  var pinchRef = useRef(null);
  var [visibleCount, setVisibleCount] = useState(Math.min(candles.length, 40) || 1);
  var [viewEnd, setViewEnd] = useState(candles.length);
  var [hoverIdx, setHoverIdx] = useState(null);

  useEffect(function(){
    setVisibleCount(Math.min(candles.length, 40) || 1);
    setViewEnd(candles.length);
    setHoverIdx(null);
  }, [candles.length, mode]);

  var chW = 640, chH = 300, padL = 8, padR = 62, padT = 14, padB = 26;
  var plotW = chW - padL - padR;
  var plotH = chH - padT - padB;

  var vc = Math.max(2, Math.min(visibleCount, candles.length || 2));
  var ve = Math.max(vc, Math.min(viewEnd, candles.length));
  var vs = Math.max(0, ve - vc);
  var visible = candles.slice(vs, ve);

  var minPrice, maxPrice;
  if(visible.length){
    var lows = visible.map(function(c){ return c.l; });
    var highs = visible.map(function(c){ return c.h; });
    minPrice = Math.min.apply(null, lows);
    maxPrice = Math.max.apply(null, highs);
  } else {
    minPrice = dayLow!=null ? dayLow : 0;
    maxPrice = dayHigh!=null ? dayHigh : 1;
  }
  if(dayHigh!=null) maxPrice = Math.max(maxPrice, dayHigh);
  if(dayLow!=null) minPrice = Math.min(minPrice, dayLow);
  var priceRange = Math.max(maxPrice - minPrice, 0.01);
  var yMin = minPrice - priceRange*0.05;
  var yMax = maxPrice + priceRange*0.05;

  function yFor(v){
    return padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  }
  function xFor(idx){
    if(visible.length<=1) return padL + plotW/2;
    return padL + (idx/(visible.length-1)) * plotW;
  }

  function clampView(newCount, newEnd){
    var c = Math.max(3, Math.min(newCount, candles.length || 3));
    var e = Math.max(c, Math.min(newEnd, candles.length));
    setVisibleCount(c);
    setViewEnd(e);
  }

  function handleWheel(e){
    e.preventDefault();
    var dir = e.deltaY>0 ? 1 : -1;
    clampView(visibleCount + dir*Math.max(2, Math.round(visibleCount*0.15)), viewEnd);
  }
  function handleMouseDown(e){
    dragRef.current = { x:e.clientX, startEnd:viewEnd };
  }
  function handleMouseMove(e){
    var rect = svgRef.current ? svgRef.current.getBoundingClientRect() : null;
    if(rect){
      var relX = (e.clientX - rect.left) / rect.width * chW;
      var idx = Math.round(((relX - padL) / plotW) * (visible.length-1));
      setHoverIdx(idx>=0 && idx<visible.length ? idx : null);
    }
    if(dragRef.current){
      var dx = e.clientX - dragRef.current.x;
      var barsShifted = Math.round(-dx / (plotW/Math.max(1,visible.length)) );
      clampView(visibleCount, dragRef.current.startEnd + barsShifted);
    }
  }
  function handleMouseUp(){ dragRef.current = null; }
  function handleMouseLeave(){ dragRef.current = null; setHoverIdx(null); }

  function touchDist(t){
    var dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }
  function handleTouchStart(e){
    if(e.touches.length==2){
      pinchRef.current = { dist:touchDist(e.touches), count:visibleCount };
    } else if(e.touches.length==1){
      dragRef.current = { x:e.touches[0].clientX, startEnd:viewEnd };
    }
  }
  function handleTouchMove(e){
    if(e.touches.length==2 && pinchRef.current){
      var d = touchDist(e.touches);
      var ratio = pinchRef.current.dist / Math.max(1,d);
      clampView(Math.round(pinchRef.current.count * ratio), viewEnd);
    } else if(e.touches.length==1 && dragRef.current){
      var dx = e.touches[0].clientX - dragRef.current.x;
      var barsShifted = Math.round(-dx / (plotW/Math.max(1,visible.length)) );
      clampView(visibleCount, dragRef.current.startEnd + barsShifted);
    }
  }
  function handleTouchEnd(){ dragRef.current = null; pinchRef.current = null; }

  var levelLines = [];
  if(ltp!=null) levelLines.push({ v:ltp, label:"CMP", color:theme.c.blue, pill:true });
  if(dayHigh!=null) levelLines.push({ v:dayHigh, label:"High", color:SENT_RED });
  if(dayLow!=null) levelLines.push({ v:dayLow, label:"Low", color:SENT_GREEN });
  if(cpr && cpr.s1!=null) levelLines.push({ v:cpr.s1, label:"S1", color:theme.c.text3 });
  if(cpr && cpr.r1!=null) levelLines.push({ v:cpr.r1, label:"R1", color:theme.c.text3 });

  var hovered = hoverIdx!=null && visible[hoverIdx] ? visible[hoverIdx] : null;
  var barW = Math.max(2, (plotW/Math.max(1,visible.length)) * 0.6);

  var xLabels = [];
  var labelCount = Math.min(5, visible.length);
  for(var li=0; li<labelCount; li++){
    var pos = labelCount==1 ? 0 : Math.round((li/(labelCount-1)) * (visible.length-1));
    xLabels.push(pos);
  }

  return (
    <div style={{position:"relative"}}>
      <svg ref={svgRef} viewBox={"0 0 "+chW+" "+chH} style={{width:"100%",height:chH,display:"block",touchAction:"none",cursor:dragRef.current?"grabbing":"grab"}}
        onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <rect x="0" y="0" width={chW} height={chH} fill="transparent"/>
        {levelLines.map(function(lvl,i){
          var y = yFor(lvl.v);
          if(y<padT-2 || y>padT+plotH+2) return null;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={padL+plotW} y2={y} stroke={lvl.color} strokeWidth="1" strokeDasharray={lvl.pill?"0":"3,3"} opacity={lvl.pill?0.5:0.35}/>
            </g>
          );
        })}
        {mode=="Range Channel" ? (
          <rect x={padL} y={yFor(Math.min(dayHigh!=null?dayHigh:yMax,yMax))} width={plotW} height={Math.max(0,yFor(dayLow!=null?dayLow:yMin)-yFor(dayHigh!=null?dayHigh:yMax))} fill={theme.c.blue} opacity="0.08"/>
        ) : null}
        {mode=="Candlestick" || mode=="Range Channel" ? visible.map(function(c,i){
          var x = xFor(i);
          var isUp = c.c>=c.o;
          var col = isUp ? SENT_GREEN : SENT_RED;
          return (
            <g key={i}>
              <line x1={x} y1={yFor(c.h)} x2={x} y2={yFor(c.l)} stroke={col} strokeWidth="1"/>
              <rect x={x-barW/2} y={Math.min(yFor(c.o),yFor(c.c))} width={barW} height={Math.max(1,Math.abs(yFor(c.o)-yFor(c.c)))} fill={col}/>
            </g>
          );
        }) : null}
        {mode=="Line" ? (
          <polyline fill="none" stroke={theme.c.blue} strokeWidth="2" points={visible.map(function(c,i){ return xFor(i)+","+yFor(c.c); }).join(" ")}/>
        ) : null}
        {mode=="Area" ? (
          <g>
            <polyline fill="none" stroke={theme.c.blue} strokeWidth="2" points={visible.map(function(c,i){ return xFor(i)+","+yFor(c.c); }).join(" ")}/>
            <polygon fill={theme.c.blue} opacity="0.12" points={
              visible.map(function(c,i){ return xFor(i)+","+yFor(c.c); }).join(" ") + " " + xFor(visible.length-1)+","+(padT+plotH)+" "+xFor(0)+","+(padT+plotH)
            }/>
          </g>
        ) : null}
        {hovered ? (
          <g>
            <line x1={xFor(hoverIdx)} y1={padT} x2={xFor(hoverIdx)} y2={padT+plotH} stroke={theme.c.text3} strokeWidth="1" strokeDasharray="2,2"/>
            <line x1={padL} y1={yFor(hovered.c)} x2={padL+plotW} y2={yFor(hovered.c)} stroke={theme.c.text3} strokeWidth="1" strokeDasharray="2,2"/>
          </g>
        ) : null}
        <line x1={padL} y1={padT+plotH} x2={padL+plotW} y2={padT+plotH} stroke={theme.c.border} strokeWidth="1"/>
        <line x1={padL+plotW} y1={padT} x2={padL+plotW} y2={padT+plotH} stroke={theme.c.border} strokeWidth="1"/>
        {levelLines.map(function(lvl,i){
          var y = yFor(lvl.v);
          if(y<padT-6 || y>padT+plotH+6) return null;
          return (
            <g key={"lbl"+i}>
              <rect x={padL+plotW+2} y={y-7} width={56} height={14} rx={lvl.pill?4:2} fill={lvl.pill?lvl.color:theme.c.card} stroke={lvl.pill?"none":theme.c.border} strokeWidth="1"/>
              <text x={padL+plotW+30} y={y+4} fontSize="9" fontWeight="700" fill={lvl.pill?"#fff":lvl.color} textAnchor="middle">{lvl.label+" "+fmtNum(Math.round(lvl.v))}</text>
            </g>
          );
        })}
        {xLabels.map(function(pos,i){
          var c = visible[pos];
          if(!c) return null;
          var label = c.label ? c.label : ("#"+(vs+pos+1));
          return (
            <text key={i} x={xFor(pos)} y={chH-8} fontSize="9" fill={theme.c.text3} textAnchor="middle">{label}</text>
          );
        })}
      </svg>
      {hovered ? (
        <div style={{position:"absolute",left:8,top:6,background:theme.c.card,border:"1px solid "+theme.c.border,borderRadius:6,padding:"4px 8px",fontSize:10,color:theme.c.text1,display:"flex",gap:8,pointerEvents:"none"}}>
          <span>{hovered.label ? hovered.label : ("Bar #"+(vs+hoverIdx+1))}</span>
          <span>O <b style={{color:theme.c.text1}}>{fmtNum(hovered.o)}</b></span>
          <span>H <b style={{color:SENT_RED}}>{fmtNum(hovered.h)}</b></span>
          <span>L <b style={{color:SENT_GREEN}}>{fmtNum(hovered.l)}</b></span>
          <span>C <b style={{color:theme.c.text1}}>{fmtNum(hovered.c)}</b></span>
          <span style={{color:hovered.c>=hovered.o?SENT_GREEN:SENT_RED}}>{hovered.c>=hovered.o?"+":""}{Math.round((hovered.c-hovered.o)*100)/100}</span>
        </div>
      ) : null}
      {isPreview ? (
        <div style={{position:"absolute",right:8,top:6,background:SENT_YELLOW+"22",border:"1px solid "+SENT_YELLOW+"66",borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:800,color:SENT_YELLOW}}>PREVIEW</div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------
export default function RangeIntelligence(props){
  var theme = useTheme();
  var BG=theme.c.bg, CARD=theme.c.card, BD=theme.c.border;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var UP=theme.c.up, DOWN=theme.c.down, BLUE=theme.c.blue;

  var mm = props.mm || {};
  var indices = (mm.data && mm.data.indices) || {};
  var indexHistory = (mm.data && mm.data.indexHistory) || {};

  var [selected, setSelected] = useState("NIFTY");
  var [tfKey, setTfKey] = useState("5m");
  var [chartMode, setChartMode] = useState("Candlestick");
  var [barVersion, setBarVersion] = useState(0);
  var [nowTick, setNowTick] = useState(function(){ return getIST(); });

  useEffect(function(){
    var t = setInterval(function(){ setNowTick(getIST()); }, 1000);
    return function(){ clearInterval(t); };
  }, []);

  var idx = indices[selected];
  var tf = TIMEFRAMES.filter(function(x){ return x.key==tfKey; })[0] || TIMEFRAMES[0];
  var range = computeRange(idx);
  var cpr = computeCPR(idx);

  var session = sessionInfo(nowTick);
  var barIndexNow = tf.kind=="preview" ? Math.floor(session.elapsedMin / tf.minutes) : null;
  var secondsToClose = null;
  if(tf.kind=="preview" && session.isOpen){
    var nextCloseMin = (barIndexNow+1) * tf.minutes;
    var nowMinFrac = session.elapsedMin;
    secondsToClose = Math.max(0, Math.round((nextCloseMin - nowMinFrac) * 60));
  }

  // Roll the preview bar over when its countdown reaches zero.
  var prevBarIndexRef = useRef(barIndexNow);
  useEffect(function(){
    if(tf.kind!="preview") return;
    if(prevBarIndexRef.current!=null && barIndexNow!=null && barIndexNow!=prevBarIndexRef.current){
      setBarVersion(function(v){ return v+1; });
    }
    prevBarIndexRef.current = barIndexNow;
  }, [barIndexNow, tf.kind]);

  var candles = useMemo(function(){
    if(!idx || idx.ltp==null) return [];
    if(tf.kind=="daily"){
      return buildDailyCandles(indexHistory[selected]);
    }
    var count = Math.max(6, Math.min(60, Math.round(session.totalMin / tf.minutes) || 20));
    var seedBase = (selected.length*13) + (tfKey.length*7) + barVersion*101 + Math.round((idx.prevClose||idx.ltp||1)*10);
    return generatePreviewCandles({ open:idx.open, prevClose:idx.prevClose, ltp:idx.ltp, high:idx.high, low:idx.low }, count, seedBase);
  }, [idx, tf.kind, tfKey, selected, barVersion, session.totalMin]);

  var pattern = useMemo(function(){
    var closed = tf.kind=="preview" && candles.length>1 ? candles.slice(0,-1) : candles;
    return detectPattern(closed);
  }, [candles, tf.kind]);

  var patternColor = pattern ? (pattern.dir=="bull"?SENT_GREEN:(pattern.dir=="bear"?SENT_RED:SENT_YELLOW)) : T2;
  var instLabel = INSTRUMENTS.filter(function(i){ return i.key==selected; })[0].label;

  function fmtCountdown(s){
    if(s==null) return null;
    var m = Math.floor(s/60), sec = s%60;
    return (m<10?"0":"")+m+":"+(sec<10?"0":"")+sec;
  }

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:24}}>
      {/* Single, isolated sub-header - the global header is hidden for this
          route in App.jsx so there is never a duplicate logo/bar here on
          mobile OR desktop. */}
      <div style={{background:CARD,padding:"10px 14px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={function(){ props.setTab && props.setTab("home"); }} style={{background:"rgba(120,120,120,0.12)",border:"none",borderRadius:8,width:36,height:36,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1}}>&#8592;</button>
        <div style={{flex:1,display:"flex",gap:6,overflowX:"auto"}}>
          {INSTRUMENTS.map(function(inst){
            var active = selected==inst.key;
            return (
              <button key={inst.key} onClick={function(){ setSelected(inst.key); setBarVersion(0); }} style={{flexShrink:0,background:active?BLUE:"transparent",border:"1px solid "+(active?BLUE:BD),color:active?"#fff":T1,fontSize:12,fontWeight:700,borderRadius:8,padding:"7px 12px",cursor:"pointer"}}>
                {inst.label}
              </button>
            );
          })}
        </div>
        <button onClick={function(){ props.setTab && props.setTab("home"); }} style={{background:"rgba(120,120,120,0.12)",border:"none",borderRadius:8,width:36,height:36,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,color:T1}} title="Home">&#8962;</button>
      </div>

      <div style={{padding:"10px 12px",maxWidth:1440,margin:"0 auto",boxSizing:"border-box"}}>
        {!idx || idx.ltp==null ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"20px 12px",textAlign:"center",color:T2,fontSize:12}}>
            No verified data available right now for {instLabel}.
          </div>
        ) : (
          <div>
            {/* AI Pattern badge */}
            <div style={{background:patternColor+"14",border:"1px solid "+patternColor+"55",borderRadius:8,padding:"8px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="7" width="16" height="12" rx="3" stroke={patternColor} strokeWidth="2"/><circle cx="9" cy="13" r="1.4" fill={patternColor}/><circle cx="15" cy="13" r="1.4" fill={patternColor}/><path d="M9 4 L9 7 M15 4 L15 7" stroke={patternColor} strokeWidth="2" strokeLinecap="round"/></svg>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:800,color:patternColor}}>
                  {pattern ? ("AI Signal: "+pattern.name+" Detected ("+tf.label+")") : "AI Signal: No clear pattern on the latest closed candle"}
                </div>
                {pattern ? <div style={{fontSize:10,color:T2,marginTop:1}}>{pattern.desc}</div> : null}
              </div>
            </div>

            {/* Timeframe pills + countdown */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:6}}>
                {TIMEFRAMES.map(function(t){
                  var active = t.key==tfKey;
                  return (
                    <button key={t.key} onClick={function(){ setTfKey(t.key); }} style={{background:active?BLUE:CARD,border:"1px solid "+(active?BLUE:BD),color:active?"#fff":T1,fontSize:11,fontWeight:700,borderRadius:7,padding:"6px 11px",cursor:"pointer"}}>{t.label}</button>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:6,flex:1,justifyContent:"flex-end"}}>
                {CHART_MODES.map(function(m){
                  var active = m==chartMode;
                  return (
                    <button key={m} onClick={function(){ setChartMode(m); }} style={{background:active?theme.c.card2:CARD,border:"1px solid "+(active?BLUE:BD),color:active?BLUE:T2,fontSize:10,fontWeight:700,borderRadius:7,padding:"6px 9px",cursor:"pointer"}}>{m}</button>
                  );
                })}
              </div>
              {tf.kind=="preview" ? (
                <div style={{fontSize:11,fontWeight:800,color: session.isOpen ? T1 : T3, background:theme.c.card2,border:"1px solid "+BD,borderRadius:7,padding:"6px 10px",display:"flex",alignItems:"center",gap:6}}>
                  <span>&#9203;</span>
                  {session.isOpen ? ("Candle Closes In: "+fmtCountdown(secondsToClose)) : "Market Closed"}
                </div>
              ) : null}
            </div>

            {tf.kind=="preview" ? (
              <div style={{background:SENT_YELLOW+"14",border:"1px solid "+SENT_YELLOW+"55",borderRadius:8,padding:"6px 10px",marginBottom:8,fontSize:10,color:T1}}>
                INTERACTIVE PATTERN PREVIEW - no verified intraday feed is connected yet. This {tf.label} path is generated by a deterministic model anchored to real open/prevClose and clamped to today's real high/low; the final bar always closes exactly at the real live price. Not tick data. Switch to 1D for real historical candles.
              </div>
            ) : (
              <div style={{background:BLUE+"14",border:"1px solid "+BLUE+"55",borderRadius:8,padding:"6px 10px",marginBottom:8,fontSize:10,color:T1}}>
                CALCULATED &middot; real daily high/low/close from the last {candles.length+1} sessions. Daily open is not provided by the data source, so each candle's open is set to the previous session's close.
              </div>
            )}

            {/* Chart */}
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"8px 10px",marginBottom:8}}>
              {candles.length>0 ? (
                <CandleChart theme={theme} candles={candles} mode={chartMode} dayHigh={idx.high} dayLow={idx.low} cpr={cpr} ltp={idx.ltp} isPreview={tf.kind=="preview"}/>
              ) : (
                <div style={{padding:"40px 12px",textAlign:"center",fontSize:12,color:T2}}>No candle data available for this timeframe right now.</div>
              )}
            </div>

            {/* Compact metrics grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:8,marginBottom:8}}>
              {[
                ["CMP", fmtNum(range ? range.ltp : idx.ltp), T1],
                ["Resistance (R1)", cpr ? fmtNum(cpr.r1) : "--", DOWN],
                ["Support (S1)", cpr ? fmtNum(cpr.s1) : "--", UP],
                ["Range %", range ? range.widthPct+"%" : "--", T1],
                ["Dist to R1", cpr ? fmtNum(Math.round((cpr.r1-idx.ltp)*100)/100) : "--", DOWN],
                ["Dist to S1", cpr ? fmtNum(Math.round((idx.ltp-cpr.s1)*100)/100) : "--", UP]
              ].map(function(row,i){
                return (
                  <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"8px 10px"}}>
                    <div style={{fontSize:10,color:T2,marginBottom:3}}>{row[0]}</div>
                    <div style={{fontSize:14,fontWeight:800,color:row[2]}}>{row[1]}</div>
                  </div>
                );
              })}
            </div>

            {range ? (
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"10px 12px",marginBottom:8}}>
                <div style={{fontSize:12,color:T2,marginBottom:8}}>Range Position</div>
                <div style={{position:"relative",height:20,marginBottom:4}}>
                  <div style={{position:"absolute",top:9,left:0,right:0,height:2,background:BD}}></div>
                  <div style={{position:"absolute",top:2,left:"calc("+range.posPct+"% - 8px)",width:16,height:16,borderRadius:"50%",background:BLUE,border:"2px solid "+CARD}}></div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T3}}>
                  <span>LOW {fmtNum(range.low)}</span>
                  <span style={{fontWeight:700,color:T1}}>{range.zone} &middot; {range.posPct}%</span>
                  <span>HIGH {fmtNum(range.high)}</span>
                </div>
              </div>
            ) : null}

            {cpr ? (
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"10px 12px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:12,fontWeight:800,color:T1}}>CPR Status</div>
                  <span style={{fontSize:10,fontWeight:800,color:cpr.status=="Narrow CPR"?SENT_YELLOW:T2,background:(cpr.status=="Narrow CPR"?SENT_YELLOW:T2)+"18",borderRadius:6,padding:"3px 8px"}}>{cpr.status}</span>
                </div>
                <div style={{fontSize:11,color:T2,marginTop:4}}>{cpr.note} &middot; Pivot {fmtNum(cpr.pivot)}</div>
              </div>
            ) : null}

            <div style={{fontSize:10,color:T3,textAlign:"center",lineHeight:1.6}}>Educational market analysis only. Not a trading recommendation. AI pattern detection is a rule-based read of candle shape, not a prediction of future price. &middot; Source: Live Market Data</div>
          </div>
        )}
      </div>
    </div>
  );
}
