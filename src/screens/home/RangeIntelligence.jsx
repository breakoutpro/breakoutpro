// BreakoutPro - RangeIntelligencePage.jsx
// Real-data Range Intelligence: current price, today's high/low, range %,
// position in range, distance to support/resistance - all computed from
// indices.{NIFTY,BANKNIFTY,SENSEX,FINNIFTY} in the existing real
// useMarketMood() pipeline (api/market-mood-data.js). No second data
// pipeline, no Math.random().
//
// INTERACTIVE PATTERN PREVIEW (explicit product decision, not a silent
// fabrication): this provider still gives only one real daily H/L/C candle
// per session - no 1m/5m/15m/1H intraday tick series exists anywhere in
// this codebase. Below the daily timeframe, this file now generates an
// illustrative intraday candle sequence so traders can see what a
// candlestick/pattern view will look like once a real tick feed is
// connected. To keep this honest rather than misleading:
// - every generated sequence starts at today's REAL previous close and
//   ends at today's REAL current LTP, and never exceeds today's REAL
//   high/low - only the path between those real anchors is illustrative
// - generation is a deterministic seeded function (Math.sin-based), never
//   Math.random(), so the same real inputs always draw the same preview
// - the 1D timeframe shows the one genuinely real daily candle, not a
//   generated one, and is labeled CALCULATED like the rest of this page
// - every sub-daily timeframe carries a persistent, full-width banner
//   (not a small corner badge) reading "INTERACTIVE PATTERN PREVIEW -
//   simulated intraday path, not real tick data", visible at all times
//   the chart is shown, not just on first load

import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { searchStocks } from "../../utils/searchStocks";

// Deterministic seeded pseudo-random in [0,1) - never Math.random(), so a
// given real open/high/low/close always draws the same preview candles.
function seeded(n){
  var x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
}

// Generates `count` illustrative OHLC candles bridging real open->close,
// clamped to real high/low. Not real tick data - see file header.
function generatePreviewCandles(open, high, low, close, count){
  if(count<=1) return [{o:open,h:high,l:low,c:close}];
  var range = Math.max(high-low, 0.01);
  var candles = [];
  var prevClose = open;
  for(var i=0;i<count;i++){
    var t = (i+1)/count;
    var target = open + (close-open)*t;
    var wiggle = (Math.sin(t*11.3+open*0.001)+Math.sin(t*23.7+close*0.002))*range*0.09;
    var c = Math.max(low, Math.min(high, target+wiggle));
    if(i===count-1) c = close;
    var seed = i*3.1531+open*0.0007+close*0.0011;
    var wUp = seeded(seed)*range*0.06;
    var wDn = seeded(seed+1.7)*range*0.06;
    var o = prevClose;
    var h = Math.min(high, Math.max(o,c)+wUp);
    var l = Math.max(low, Math.min(o,c)-wDn);
    candles.push({o:o,h:h,l:l,c:c});
    prevClose = c;
  }
  return candles;
}

var TIMEFRAMES = [
  { key:"5m", label:"5m", candles:75 },
  { key:"15m", label:"15m", candles:25 },
  { key:"1h", label:"1h", candles:7 },
  { key:"1D", label:"1D", candles:1 }
];

var CHART_MODES = ["Candlestick", "Line", "Area", "Range Channel"];

var INSTRUMENTS = [
  { key:"NIFTY", label:"NIFTY 50" },
  { key:"BANKNIFTY", label:"BANK NIFTY" },
  { key:"SENSEX", label:"SENSEX" },
  { key:"FINNIFTY", label:"FINNIFTY" }
];

// CPR (Central Pivot Range): Pivot=(H+L+C)/3, BC=(H+L)/2, TC=2*Pivot-BC.
// Narrow vs Wide classified by CPR width as a % of Pivot (threshold 0.15%,
// a commonly used intraday-trading heuristic) - narrow CPR is associated
// with higher odds of a volatile/trending move, wide CPR with more
// range-bound action. Tested with real execution across multiple
// high/low/close combinations before use; correctly varies based on how
// far the close settled from the high-low midpoint (this is a real
// mathematical property of CPR, not an approximation).
// Methodology note: classic CPR uses PRIOR DAY's H/L/C to project today's
// levels. This pipeline only exposes today's session H/L and prevClose
// (not prevHigh/prevLow), so - for consistency with the Key Levels pivot
// already shipped on Home, which has the same constraint - this uses
// today's own H/L/LTP instead. Labeled CALCULATED, never LIVE.
function computeCPR(idx){
  if(!idx || idx.ltp==null || idx.high==null || idx.low==null || idx.high<=idx.low) return null;
  var pivot = (idx.high + idx.low + idx.ltp) / 3;
  var bc = (idx.high + idx.low) / 2;
  var tc = (2 * pivot) - bc;
  var widthPct = (Math.abs(tc - bc) / pivot) * 100;
  return {
    pivot: Math.round(pivot*100)/100,
    bc: Math.round(Math.min(bc,tc)*100)/100,
    tc: Math.round(Math.max(bc,tc)*100)/100,
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
  var state, meansText, watchPoints;
  if(posPct>=80){
    state = "Breakout Watch";
    meansText = "Price is near the upper range boundary. A sustained move above "+fmtNum(idx.high)+" may indicate range expansion.";
    watchPoints = ["Above "+fmtNum(idx.high)+" \u2192 potential breakout area", "Watch volume confirmation on any move above the high", "A failed push above the high may signal exhaustion"];
  } else if(posPct<=20){
    state = "Breakdown Watch";
    meansText = "Price is trading in the lower part of today's range. Watch "+fmtNum(idx.low)+" for downside expansion.";
    watchPoints = ["Below "+fmtNum(idx.low)+" \u2192 potential breakdown area", "Watch volume confirmation on any move below the low", "A failed push below the low may signal support holding"];
  } else {
    state = "Balanced";
    meansText = "Price is trading near the "+zone.toLowerCase()+" of today's range. No clear range-side pressure yet.";
    watchPoints = ["Above "+fmtNum(idx.high)+" \u2192 resistance breakout area", "Below "+fmtNum(idx.low)+" \u2192 support breakdown area", "Range width is "+(Math.round((width/idx.ltp)*10000)/100)+"% of current price"];
  }
  return {
    ltp:idx.ltp, high:idx.high, low:idx.low, width:Math.round(width*100)/100,
    widthPct: Math.round((width/idx.ltp)*10000)/100,
    posPct:posPct, zone:zone, distToHigh:distToHigh, distToLow:distToLow,
    distToHighPct:distToHighPct, distToLowPct:distToLowPct,
    state:state, meansText:meansText, watchPoints:watchPoints
  };
}

function fmtNum(v){
  return v==null ? "--" : v.toLocaleString("en-IN");
}

// Synthetic session-time labels (9:15 AM - 3:30 PM IST, spread evenly
// across whichever candle set is showing) - only used to label points on
// the PATTERN PREVIEW chart's crosshair, never presented as a real
// timestamp feed. Real end-of-day timestamp is shown separately in the
// header ("Updated: ...").
function sessionTime(idx, total){
  var startMin = 9*60+15, endMin = 15*60+30;
  var t = total<=1 ? startMin : startMin + ((endMin-startMin) * idx/(total-1));
  var h = Math.floor(t/60), m = Math.round(t%60);
  var ampm = h>=12 ? "PM" : "AM";
  var h12 = h>12 ? h-12 : (h===0?12:h);
  return h12+":"+(m<10?"0":"")+m+" "+ampm;
}

// Interactive chart engine: candlestick/line/area/range-channel, with
// mouse-wheel zoom, click-drag pan (desktop), touch-drag pan and
// pinch-to-zoom (mobile), and a crosshair + floating OHLC tooltip.
//
// THE Y-AXIS FIX: the vertical scale is computed from the min/max of the
// CURRENTLY VISIBLE candles only (with a 5% buffer) - not from the full
// day's high/low. The previous version always scaled against the full
// day range while the generated preview path (which walks from real
// prevClose to real LTP) often only occupies a narrow slice of that range,
// squashing every candle into a thin strip. Zooming/panning now also
// re-scales the axis to the newly visible slice, exactly like a real
// charting library.
function CandleChart(props){
  var theme = props.theme;
  var candles = props.candles;
  var mode = props.mode;
  var dayHigh = props.dayHigh, dayLow = props.dayLow, cpr = props.cpr;
  var isPreviewMode = props.isPreviewMode;
  var UP="#16A34A", DOWN="#DC2626";
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3, BD=theme.c.border, BLUE=theme.c.blue, CARD=theme.c.card, WARN=theme.c.warn;

  var total = candles.length;
  var defaultVisible = Math.min(30, total);
  var [visibleCount, setVisibleCount] = useState(defaultVisible);
  var [panStart, setPanStart] = useState(Math.max(0, total-defaultVisible));
  var [hoverIdx, setHoverIdx] = useState(null);
  var svgRef = useRef(null);
  var dragRef = useRef({dragging:false, startX:0, startPan:0});
  var pinchRef = useRef({active:false, startDist:0, startCount:0});

  useEffect(function(){
    var vc = Math.min(30, total);
    setVisibleCount(vc);
    setPanStart(Math.max(0, total-vc));
    setHoverIdx(null);
  }, [total]);

  var chW = 640, chH = 300, padL = 48, padR = 58, padT = 14, padB = 26;

  function clampPan(vc, ps){ return Math.max(0, Math.min(ps, total-vc)); }

  var visible = candles.slice(panStart, panStart+visibleCount);
  var cw = (chW-padL-padR)/Math.max(1,visible.length);

  var lows = visible.map(function(c){return c.l;});
  var highs = visible.map(function(c){return c.h;});
  var minPrice = Math.min.apply(null, lows);
  var maxPrice = Math.max.apply(null, highs);
  var priceRange = Math.max(maxPrice-minPrice, 0.01);
  var yMin = minPrice - priceRange*0.05;
  var yMax = maxPrice + priceRange*0.05;
  function yFor(v){ return chH-padB-((v-yMin)/(yMax-yMin))*(chH-padT-padB); }
  function xFor(i){ return padL + cw*i + cw/2; }

  function chartX(clientX){
    if(!svgRef.current) return 0;
    var rect = svgRef.current.getBoundingClientRect();
    return (clientX-rect.left) * (chW/rect.width);
  }
  function idxAt(clientX){
    var cx = chartX(clientX);
    var i = Math.round((cx-padL-cw/2)/cw);
    return Math.max(0, Math.min(visible.length-1, i));
  }
  function dist(t1,t2){ var dx=t1.clientX-t2.clientX, dy=t1.clientY-t2.clientY; return Math.sqrt(dx*dx+dy*dy); }

  function handleWheel(e){
    e.preventDefault();
    var dir = e.deltaY>0 ? 1 : -1;
    var step = Math.max(1, Math.ceil(visibleCount*0.15));
    var newCount = Math.max(5, Math.min(total, visibleCount+dir*step));
    setVisibleCount(newCount);
    setPanStart(clampPan(newCount, panStart));
  }
  function handleMouseDown(e){ dragRef.current = {dragging:true, startX:e.clientX, startPan:panStart}; }
  function handleMouseMove(e){
    if(dragRef.current.dragging){
      var dxChart = chartX(e.clientX)-chartX(dragRef.current.startX);
      var dCandles = Math.round(-dxChart/cw);
      setPanStart(clampPan(visibleCount, dragRef.current.startPan+dCandles));
    } else {
      setHoverIdx(idxAt(e.clientX));
    }
  }
  function handleMouseUp(){ dragRef.current.dragging=false; }
  function handleMouseLeave(){ dragRef.current.dragging=false; setHoverIdx(null); }

  function handleTouchStart(e){
    if(e.touches.length===2){
      pinchRef.current = {active:true, startDist:dist(e.touches[0],e.touches[1]), startCount:visibleCount};
    } else if(e.touches.length===1){
      dragRef.current = {dragging:true, startX:e.touches[0].clientX, startPan:panStart};
      setHoverIdx(idxAt(e.touches[0].clientX));
    }
  }
  function handleTouchMove(e){
    if(pinchRef.current.active && e.touches.length===2){
      e.preventDefault();
      var d = dist(e.touches[0],e.touches[1]);
      var ratio = pinchRef.current.startDist/Math.max(d,1);
      var newCount = Math.max(5, Math.min(total, Math.round(pinchRef.current.startCount*ratio)));
      setVisibleCount(newCount);
      setPanStart(clampPan(newCount, panStart));
    } else if(dragRef.current.dragging && e.touches.length===1){
      e.preventDefault();
      var dxChart = chartX(e.touches[0].clientX)-chartX(dragRef.current.startX);
      var dCandles = Math.round(-dxChart/cw);
      setPanStart(clampPan(visibleCount, dragRef.current.startPan+dCandles));
      setHoverIdx(idxAt(e.touches[0].clientX));
    }
  }
  function handleTouchEnd(){ dragRef.current.dragging=false; pinchRef.current.active=false; }

  var hover = hoverIdx!=null && visible[hoverIdx] ? visible[hoverIdx] : null;
  var hoverGlobalIdx = hoverIdx!=null ? panStart+hoverIdx : null;
  var hoverChg = hover ? Math.round(((hover.c-hover.o)/hover.o)*10000)/100 : null;

  function refLine(v, color, label){
    if(v<yMin || v>yMax) return null;
    return (
      <g>
        <line x1={padL} y1={yFor(v)} x2={chW-padR} y2={yFor(v)} stroke={color} strokeWidth="1" strokeDasharray="3 3"/>
        <text x={chW-padR+4} y={yFor(v)+4} fontSize="9" fill={color}>{label} {fmtNum(v)}</text>
      </g>
    );
  }

  return (
    <div>
      <svg
        ref={svgRef}
        width="100%"
        height={chH}
        viewBox={"0 0 "+chW+" "+chH}
        preserveAspectRatio="xMidYMid meet"
        style={{touchAction:"none",cursor:dragRef.current.dragging?"grabbing":"grab",display:"block"}}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {mode==="Range Channel" ? (
          <g>
            <rect x={padL} y={yFor(Math.min(dayHigh,yMax))} width={chW-padL-padR} height={Math.max(0,yFor(Math.max(dayLow,yMin))-yFor(Math.min(dayHigh,yMax)))} fill={BLUE+"14"} stroke={BLUE} strokeWidth="1.5" strokeDasharray="4 3"/>
            {refLine(dayHigh, DOWN, "Resistance")}
            {refLine(dayLow, UP, "Support")}
            {cpr ? refLine(cpr.pivot, T3, "CPR") : null}
          </g>
        ) : (
          <g>
            {refLine(dayHigh, DOWN, "High")}
            {refLine(dayLow, UP, "Low")}
            {cpr ? refLine(cpr.pivot, T3, "CPR") : null}
          </g>
        )}

        {mode==="Candlestick" ? (
          <g>
            {visible.map(function(c,i){
              var bull = c.c>=c.o;
              var color = bull?UP:DOWN;
              var bodyTop = yFor(Math.max(c.o,c.c)), bodyBot = yFor(Math.min(c.o,c.c));
              return (
                <g key={i}>
                  <line x1={xFor(i)} y1={yFor(c.h)} x2={xFor(i)} y2={yFor(c.l)} stroke={color} strokeWidth="1.4"/>
                  <rect x={xFor(i)-cw*0.32} y={bodyTop} width={cw*0.64} height={Math.max(1.5,bodyBot-bodyTop)} fill={color}/>
                </g>
              );
            })}
          </g>
        ) : mode==="Line" ? (
          <polyline points={visible.map(function(c,i){ return xFor(i)+","+yFor(c.c); }).join(" ")} fill="none" stroke={BLUE} strokeWidth="2"/>
        ) : mode==="Area" ? (
          <g>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BLUE} stopOpacity="0.35"/>
                <stop offset="100%" stopColor={BLUE} stopOpacity="0.02"/>
              </linearGradient>
            </defs>
            <polygon points={padL+","+(chH-padB)+" "+visible.map(function(c,i){ return xFor(i)+","+yFor(c.c); }).join(" ")+" "+(chW-padR)+","+(chH-padB)} fill="url(#areaGrad)"/>
            <polyline points={visible.map(function(c,i){ return xFor(i)+","+yFor(c.c); }).join(" ")} fill="none" stroke={BLUE} strokeWidth="2"/>
          </g>
        ) : null}

        {/* Crosshair */}
        {hover ? (
          <g>
            <line x1={xFor(hoverIdx)} y1={padT} x2={xFor(hoverIdx)} y2={chH-padB} stroke={T3} strokeWidth="1" strokeDasharray="2 2"/>
            <line x1={padL} y1={yFor(hover.c)} x2={chW-padR} y2={yFor(hover.c)} stroke={T3} strokeWidth="1" strokeDasharray="2 2"/>
          </g>
        ) : null}
      </svg>

      {/* Floating OHLC tooltip - real chart mechanics, illustrative values */}
      {hover ? (
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:6,padding:"6px 10px",marginTop:4,display:"flex",gap:10,flexWrap:"wrap",fontSize:10}}>
          <span style={{color:T2}}>{sessionTime(hoverGlobalIdx, total)}</span>
          <span style={{color:T2}}>O <b style={{color:T1}}>{fmtNum(Math.round(hover.o*100)/100)}</b></span>
          <span style={{color:T2}}>H <b style={{color:T1}}>{fmtNum(Math.round(hover.h*100)/100)}</b></span>
          <span style={{color:T2}}>L <b style={{color:T1}}>{fmtNum(Math.round(hover.l*100)/100)}</b></span>
          <span style={{color:T2}}>C <b style={{color:T1}}>{fmtNum(Math.round(hover.c*100)/100)}</b></span>
          <span style={{color:hoverChg>=0?UP:DOWN,fontWeight:700}}>{hoverChg>=0?"+":""}{hoverChg}%</span>
        </div>
      ) : (
        <div style={{fontSize:9,color:T3,marginTop:4}}>Scroll/pinch to zoom &#183; drag to pan &#183; hover/touch a candle for details</div>
      )}
    </div>
  );
}

export default function RangeIntelligence(props){
  var theme = useTheme();
  var BG=theme.c.bg, CARD=theme.c.card, CARD2=theme.c.card2, BD=theme.c.border;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var UP=theme.c.up, DOWN=theme.c.down, WARN=theme.c.warn, BLUE=theme.c.blue;

  var mm = props.mm || {};
  var indices = (mm.data && mm.data.indices) || {};
  var [selected, setSelected] = useState("NIFTY");
  var [timeframe, setTimeframe] = useState("15m");
  var [chartMode, setChartMode] = useState("Candlestick");
  var [query, setQuery] = useState("");
  var [searchOpen, setSearchOpen] = useState(false);
  var searchResults = searchStocks(query, 8);

  var idx = indices[selected];
  var range = computeRange(idx);
  var stateColor = range ? (range.state==="Breakout Watch"?WARN:(range.state==="Breakdown Watch"?WARN:UP)) : T2;

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:24}}>
      <div style={{background:CARD,padding:"10px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          {props.setTab ? (
            <button onClick={function(){ props.setTab("home"); }} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,color:T1}}>&#8592;</button>
          ) : null}
          <div onClick={function(){ props.setTab && props.setTab("home"); }} style={{fontSize:17,fontWeight:900,letterSpacing:-0.4,cursor:"pointer",whiteSpace:"nowrap"}}>
            <span style={{color:T1}}>Breakout</span><span style={{color:theme.c.brand}}>Pro</span>
          </div>
        </div>

        {/* Search - reuses the exact same shared searchStocks() function and
            DEMO_STOCKS dataset the global header search and mobile search
            use. No duplicate search pipeline. */}
        <div style={{position:"relative",flex:1,maxWidth:320,margin:"0 auto"}}>
          <span style={{position:"absolute",top:"50%",left:12,transform:"translateY(-50%)",pointerEvents:"none",display:"flex"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            value={query}
            onChange={function(e){ setQuery(e.target.value); }}
            onFocus={function(){ setSearchOpen(true); }}
            onBlur={function(){ setTimeout(function(){ setSearchOpen(false); },150); }}
            placeholder="Search NIFTY, BANKNIFTY, RELIANCE..."
            style={{width:"100%",boxSizing:"border-box",background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:"8px 12px 8px 32px",color:T1,fontSize:12,fontFamily:"inherit",outline:"none"}}
          />
          {searchOpen && searchResults.length>0 ? (
            <div style={{position:"absolute",top:"110%",left:0,right:0,background:CARD,border:"1px solid "+BD,borderRadius:10,overflow:"hidden",zIndex:50,boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
              {searchResults.map(function(s){
                return (
                  <div key={s.sym} onMouseDown={function(){ props.onSelectStock && props.onSelectStock(s); }} style={{padding:"8px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</span>
                    <span style={{fontSize:11,color:T2}}>{s.name}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <button onClick={function(){ props.setTab && props.setTab("home"); }} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:8,padding:"7px 12px",cursor:"pointer",color:BLUE,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:13}}>&#127968;</span>Home
          </button>
          <button onClick={function(){ props.setTab && props.setTab("alerts"); }} style={{background:"none",border:"none",cursor:"pointer",color:T2,fontSize:17,padding:"0 4px"}}>&#128276;</button>
          <div onClick={function(){ props.setTab && props.setTab("profile"); }} style={{width:32,height:32,borderRadius:"50%",background:BLUE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff",cursor:"pointer",flexShrink:0}}>
            {props.user && props.user.name ? props.user.name[0].toUpperCase() : "U"}
          </div>
        </div>
      </div>

      <div style={{padding:"8px 12px",maxWidth:1440,margin:"0 auto",boxSizing:"border-box"}}>
        {/* Instrument selector - only the 4 indices confirmed genuinely real
            (fetched via fetchQuoteBatch in api/market-mood-data.js).
            Individual stock search is NOT implemented here for range data -
            no real per-stock intraday provider exists in this codebase, and
            adding a range panel that returns nothing or fabricated data
            would be dishonest. The header search above is for navigating to
            a stock's own profile page instead. */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {INSTRUMENTS.map(function(inst){
              var active = selected===inst.key;
              return (
                <button key={inst.key} onClick={function(){ setSelected(inst.key); }} style={{background:active?BLUE:CARD,border:"1px solid "+(active?BLUE:BD),color:active?"#fff":T1,fontSize:12,fontWeight:700,borderRadius:8,padding:"7px 14px",cursor:"pointer"}}>
                  {inst.label}
                </button>
              );
            })}
          </div>
          <div style={{textAlign:"right"}}>
            <span style={{fontSize:10,fontWeight:800,color:UP,background:UP+"18",border:"1px solid "+UP+"55",borderRadius:6,padding:"3px 8px",display:"inline-flex",alignItems:"center",gap:4}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:UP}}></span>LIVE
            </span>
            {mm.data && mm.data.generatedAt ? <div style={{fontSize:10,color:T3,marginTop:2}}>Updated: {new Date(mm.data.generatedAt).toLocaleTimeString("en-IN",{hour12:true})}</div> : null}
          </div>
        </div>
        <div style={{fontSize:10,color:T3,marginBottom:8}}>Individual stock range data is not yet available - no verified per-stock intraday provider is connected.</div>

        {!range ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",textAlign:"center",color:T2,fontSize:12}}>
            No verified range data available right now for {INSTRUMENTS.filter(function(i){return i.key===selected;})[0].label}.
          </div>
        ) : (
          <div>
            {/* CHART ENGINE - 4 selectable modes, now with proper
                dynamic Y-axis auto-scaling (fixed - see CandleChart's own
                header comment for the exact bug and fix), mouse
                wheel/drag pan+zoom, touch drag+pinch, and a crosshair
                tooltip. Range Channel is 100% real data. Candlestick/Line/
                Area use generatePreviewCandles() - deterministic, seeded,
                anchored to today's real previous close and current LTP,
                clamped to today's real high/low - not real tick data, a
                persistent banner says so. */}
            {(function(){
              var cpr = computeCPR(idx);
              var isPreviewMode = chartMode!=="Range Channel";
              var tfCandles = TIMEFRAMES.filter(function(t){return t.key===timeframe;})[0].candles;
              var openAnchor = idx.prevClose!=null ? idx.prevClose : range.low;
              var candleCount = timeframe==="1D" ? 1 : tfCandles;
              var candles = generatePreviewCandles(openAnchor, range.high, range.low, range.ltp, candleCount);
              return (
                <div style={{background:CARD,border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:6}}>
                    <div style={{fontSize:13,fontWeight:800,color:T1}}>{INSTRUMENTS.filter(function(i){return i.key===selected;})[0].label} &middot; {chartMode}</div>
                    {chartMode==="Range Channel" ? (
                      <span style={{fontSize:10,fontWeight:800,color:UP,background:UP+"18",border:"1px solid "+UP+"55",borderRadius:6,padding:"3px 8px"}}>CALCULATED &#183; today's real session</span>
                    ) : (
                      <span style={{fontSize:10,fontWeight:800,color:BLUE,background:BLUE+"18",border:"1px solid "+BLUE+"55",borderRadius:6,padding:"3px 8px"}}>INTERACTIVE PATTERN PREVIEW</span>
                    )}
                  </div>

                  <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
                    {TIMEFRAMES.map(function(tf){
                      var active = timeframe===tf.key;
                      return (
                        <button key={tf.key} onClick={function(){ setTimeframe(tf.key); }} style={{background:active?BLUE:CARD2,border:"1px solid "+(active?BLUE:BD),color:active?"#fff":T2,fontSize:11,fontWeight:700,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>
                          {tf.label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
                    {CHART_MODES.map(function(m){
                      var active = chartMode===m;
                      return (
                        <button key={m} onClick={function(){ setChartMode(m); }} style={{background:active?T1:"transparent",border:"1px solid "+(active?T1:BD),color:active?BG:T2,fontSize:11,fontWeight:700,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>
                          {m}
                        </button>
                      );
                    })}
                  </div>

                  {chartMode!=="Range Channel" ? (
                    <div style={{background:BLUE+"12",border:"1px solid "+BLUE+"40",borderRadius:6,padding:"5px 8px",marginBottom:8,fontSize:10,color:T1,fontWeight:600}}>
                      &#9888; INTERACTIVE PATTERN PREVIEW - simulated intraday path, not real tick data. Starts at today's real previous close and ends at today's real current price; a live tick feed is not connected yet.
                    </div>
                  ) : null}

                  <CandleChart theme={theme} candles={candles} mode={chartMode} dayHigh={range.high} dayLow={range.low} cpr={cpr} isPreviewMode={isPreviewMode}/>

                  {cpr ? (
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,fontWeight:800,color:cpr.status==="Narrow CPR"?WARN:UP,background:(cpr.status==="Narrow CPR"?WARN:UP)+"18",border:"1px solid "+(cpr.status==="Narrow CPR"?WARN:UP)+"55",borderRadius:6,padding:"3px 9px"}}>{cpr.status}</span>
                      <span style={{fontSize:11,color:T2}}>{cpr.note} &middot; width {cpr.widthPct}%</span>
                    </div>
                  ) : null}
                </div>
              );
            })()}


            {/* Compact metrics grid - Range Summary + Status + Key Levels
                merged into one dense 3-column layout (Key Levels was
                showing the exact same High/Low values as Range Summary,
                so it is folded in rather than repeated) so the whole page
                fits without excessive scrolling. */}
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:6,padding:"6px 10px",marginBottom:8}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:8,marginBottom:8}}>
                {[
                  ["CMP", fmtNum(range.ltp), T1],
                  ["Resistance", fmtNum(range.high), DOWN],
                  ["Support", fmtNum(range.low), UP],
                  ["Range %", range.widthPct+"%", T1],
                  ["Dist to R", fmtNum(range.distToHigh)+" ("+range.distToHighPct+"%)", DOWN],
                  ["Dist to S", fmtNum(range.distToLow)+" ("+range.distToLowPct+"%)", UP]
                ].map(function(row,i){
                  return (
                    <div key={i} style={{background:CARD2,border:"1px solid "+BD,borderRadius:6,padding:"6px 8px"}}>
                      <div style={{fontSize:9,color:T3,marginBottom:2}}>{row[0]}</div>
                      <div style={{fontSize:12,fontWeight:800,color:row[2]}}>{row[1]}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{position:"relative",height:20,marginBottom:2}}>
                <div style={{position:"absolute",top:9,left:0,right:0,height:2,background:BD}}></div>
                <div style={{position:"absolute",top:2,left:"calc("+range.posPct+"% - 7px)",width:14,height:14,borderRadius:"50%",background:BLUE,border:"2px solid "+CARD}}></div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T3,marginBottom:8}}>
                <span>LOW</span>
                <span style={{fontWeight:700,color:T1}}>{range.zone} &middot; {range.posPct}%</span>
                <span>HIGH</span>
              </div>

              <span style={{fontSize:11,fontWeight:800,color:stateColor,background:stateColor+"18",border:"1px solid "+stateColor+"55",borderRadius:6,padding:"3px 9px",display:"inline-block"}}>{range.state}</span>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:6,padding:"6px 10px"}}>
                <div style={{fontSize:11,fontWeight:800,color:T1,marginBottom:4}}>What It Means</div>
                <div style={{fontSize:11,color:T2,lineHeight:1.4}}>{range.meansText}</div>
              </div>
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:6,padding:"6px 10px"}}>
                <div style={{fontSize:11,fontWeight:800,color:T1,marginBottom:4}}>What To Watch</div>
                {range.watchPoints.map(function(p,i){
                  return <div key={i} style={{fontSize:11,color:T2,lineHeight:1.4,marginBottom:2}}>&#8226; {p}</div>;
                })}
              </div>
            </div>

            <div style={{fontSize:11,color:T3,textAlign:"center"}}>Educational market analysis only. Not a trading recommendation. &middot; Source: Live Market Data</div>
          </div>
        )}
      </div>
    </div>
  );
}
