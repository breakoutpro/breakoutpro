import { useState, useEffect, useRef } from "react";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../theme/ThemeProvider";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

// BreakoutPro - Chart.jsx
// Real historical candles via the existing /api/history endpoint (Yahoo).
// No synthetic/Math.random data. One request per mount/symbol/timeframe
// change/manual refresh - no polling, no second data tree.
// Rules: no backtick, no triple-equals, ASCII only.

// Proven symbol map only - no guessed tickers, no new symbols.
var SYMBOLS = [
  {sym:"NIFTY 50",   api:"^NSEI"},
  {sym:"BANK NIFTY", api:"^NSEBANK"},
  {sym:"SENSEX",     api:"^BSESN"},
  {sym:"RELIANCE",   api:"RELIANCE.NS"},
  {sym:"TCS",        api:"TCS.NS"},
  {sym:"HDFCBANK",   api:"HDFCBANK.NS"},
  {sym:"INFY",       api:"INFY.NS"},
  {sym:"WIPRO",      api:"WIPRO.NS"},
];

var TIMEFRAMES = ["1m","5m","15m","1h","1D","1W"];
// UI label stays as-is; Yahoo request uses the correct interval/range pair.
var TF_MAP = {
  "1m":  {interval:"1m",  range:"5d"},
  "5m":  {interval:"5m",  range:"1mo"},
  "15m": {interval:"15m", range:"1mo"},
  "1h":  {interval:"60m", range:"3mo"},
  "1D":  {interval:"1d",  range:"1y"},
  "1W":  {interval:"1wk", range:"5y"}
};

function calcEMA(candles, period) {
  if (candles.length < period) return [];
  var k = 2 / (period + 1);
  var ema = candles[0].close;
  var result = [null];
  for (var i = 1; i < candles.length; i++) {
    if (i < period - 1) { result.push(null); continue; }
    ema = candles[i].close * k + ema * (1 - k);
    result.push(parseFloat(ema.toFixed(2)));
  }
  return result;
}

// RSI honesty fix: insufficient real data returns null (not a fabricated
// neutral 50) - caller must show an explicit "insufficient data" state,
// never a numeric value or a neutral/bullish/bearish color for it.
function calcRSI(candles) {
  if (candles.length < 15) return null;
  var gains = 0, losses = 0;
  for (var i = candles.length - 14; i < candles.length; i++) {
    var diff = candles[i].close - candles[i-1].close;
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  if (losses == 0) return 100;
  return parseFloat((100 - 100 / (1 + gains / losses)).toFixed(1));
}

function calcVWAP(candles) {
  var cumTPV = 0, cumVol = 0;
  candles.forEach(function(c) {
    var tp = (c.high + c.low + c.close) / 3;
    cumTPV += tp * c.vol;
    cumVol += c.vol;
  });
  return cumVol > 0 ? parseFloat((cumTPV / cumVol).toFixed(2)) : 0;
}

// Validate + map a raw /api/history candle into the internal shape the
// existing renderer/formulas expect (vol, not volume). Invalid rows are
// dropped honestly - never repaired with guessed numbers.
function mapCandle(c){
  if(!c) return null;
  var o = c.open, h = c.high, l = c.low, cl = c.close;
  var okNum = function(x){ return typeof x=="number" && isFinite(x); };
  if(!okNum(o) || !okNum(h) || !okNum(l) || !okNum(cl)) return null;
  var t = c.time;
  if(typeof t!="number" || !isFinite(t) || t<=0) return null; // honest timestamp validation - no repair, no fabrication
  var v = c.volume;
  var vol = (typeof v=="number" && isFinite(v)) ? v : 0; // safely normalized to 0 only when missing/non-finite
  return { time:t, open:o, high:h, low:l, close:cl, vol:vol };
}

// Cached formatters (Asia/Kolkata, per the locked timezone policy - the
// closed all-Indian symbol set justifies this, not any payload metadata,
// since none reaches this file). Constructed once, reused for every label.
var FMT = null, FMT_TRIED = false;
function getFmt(){
  if(FMT) return FMT;
  if(FMT_TRIED) return null;
  FMT_TRIED = true;
  try{
    FMT = {
      time: new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:false}),
      day: new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short"}),
      monthYear: new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",month:"short",year:"numeric"}),
      dateKey: new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}),
      yearKey: new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric"})
    };
  }catch(e){ FMT = null; }
  return FMT;
}

// Boundary detection - compares consecutive VISIBLE real candles' genuine
// calendar dates in Asia/Kolkata. Never inferred from index/count/gaps.
function computeBoundaries(visible){
  var f = getFmt();
  var dayB = {}, yearB = {};
  if(!f) return {dayB:dayB, yearB:yearB};
  var prevDateKey = null, prevYearKey = null;
  for(var i=0;i<visible.length;i++){
    var t = visible[i].time;
    if(typeof t!="number" || !isFinite(t) || t<=0) continue;
    var d = new Date(t*1000);
    var dk, yk;
    try{ dk=f.dateKey.format(d); yk=f.yearKey.format(d); }catch(e){ continue; }
    if(prevDateKey!=null && dk!=prevDateKey) dayB[i]=true;
    if(prevYearKey!=null && yk!=prevYearKey) yearB[i]=true;
    prevDateKey=dk; prevYearKey=yk;
  }
  return {dayB:dayB, yearB:yearB};
}

// Label text - always derived from the selected candle's genuine c.time.
function labelText(unixSeconds, tf, isDayBoundary, isYearBoundary){
  var f = getFmt();
  if(!f) return "";
  try{
    var d = new Date(unixSeconds*1000);
    if(tf=="1D") return isYearBoundary ? f.monthYear.format(d) : f.day.format(d);
    if(tf=="1W") return f.monthYear.format(d);
    if(isYearBoundary) return f.monthYear.format(d);
    if(isDayBoundary) return f.day.format(d);
    return f.time.format(d);
  }catch(e){ return ""; }
}

// Label selection - index used ONLY to choose which genuine candle gets a
// label; the label text itself always comes from that candle's real time.
// Priority: year-boundary > day-boundary > first/last orientation > even
// sampling, capped at maxLabels, deduplicated, ascending order.
function pickLabelIndices(visible, maxLabels, bounds){
  var n = visible.length;
  var cap = Math.min(maxLabels, n);
  if(cap<=0) return [];
  var selected = {};
  var count = function(){ return Object.keys(selected).length; };
  for(var i=0;i<n && count()<cap;i++){ if(bounds.yearB[i]) selected[i]=true; }
  for(var j=0;j<n && count()<cap;j++){ if(bounds.dayB[j] && !selected[j]) selected[j]=true; }
  if(count()<cap) selected[0]=true;
  if(count()<cap) selected[n-1]=true;
  if(count()<cap){
    var need = cap-count();
    var step = n/(need+1);
    for(var k=1;k<=need && count()<cap;k++){
      var idx = Math.round(k*step);
      if(idx>=0 && idx<n && !selected[idx]) selected[idx]=true;
    }
  }
  var result = Object.keys(selected).map(function(k){ return parseInt(k,10); });
  result.sort(function(a,b){ return a-b; });
  if(result.length>cap) result = result.slice(0,cap);
  return result;
}

function CandleChart(props) {
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  // G is the bull-candle color (col = bull ? G : R below) - this is the
  // positive-price token, not the decorative brand token.
  var G = theme.c.up;

  var candles = props.candles || [];
  var ema9 = props.ema9 || [];
  var ema21 = props.ema21 || [];
  var vwap = props.vwap || 0;
  var showEMA = props.showEMA;
  var showVWAP = props.showVWAP;
  var tf = props.tf;
  var symLabel = props.symLabel || "";
  var maxLabels = props.maxLabels || 4;
  // W/H are the SVG's internal coordinate system - now breakpoint-aware
  // (passed from ChartScreen via useResponsive) instead of a single fixed
  // 340x200 stretched across every screen size. All downstream math below
  // is unchanged - it already only ever referenced these two local names.
  var W = props.w || 340, H = props.h || 200;
  // Small reserved bottom strip for the time axis. Only the price-space
  // mapping (plotH) changes; X-axis candle math (cw/xC) is untouched.
  var axisH = 16;
  var plotH = H - axisH;
  var count = Math.min(60, candles.length);
  var visible = candles.slice(-count);
  var e9 = ema9.slice(-count);
  var e21 = ema21.slice(-count);

  if (visible.length < 2) return null;

  var prices = visible.reduce(function(a, c) { return a.concat([c.high, c.low]); }, []);
  var minP = Math.min.apply(null, prices);
  var maxP = Math.max.apply(null, prices);
  var range = maxP - minP || 1;
  var padH = range * 0.05;
  minP -= padH; maxP += padH; range = maxP - minP;

  var cw = W / count;

  function yP(price) { return plotH - ((price - minP) / range) * plotH; }
  function xC(i) { return i * cw + cw / 2; }

  var bounds = computeBoundaries(visible);
  var labelIdx = pickLabelIndices(visible, maxLabels, bounds);
  var rangeStart = labelText(visible[0].time, "1D", false, false);
  var rangeEnd = labelText(visible[visible.length-1].time, "1D", false, false);
  var a11yText = "Candlestick chart for "+symLabel+", "+tf+" timeframe, showing real historical data from "+rangeStart+" to "+rangeEnd+".";

  var emaPath9 = "", emaPath21 = "";
  e9.forEach(function(v, i) {
    if (v == null) return;
    var cmd = emaPath9 == "" ? "M" : "L";
    emaPath9 += cmd + xC(i) + "," + yP(v) + " ";
  });
  e21.forEach(function(v, i) {
    if (v == null) return;
    var cmd = emaPath21 == "" ? "M" : "L";
    emaPath21 += cmd + xC(i) + "," + yP(v) + " ";
  });

  return (
    <svg width={W} height={H} viewBox={"0 0 "+W+" "+H} style={{display:"block",width:"100%"}} aria-label={a11yText}>
      <title>{a11yText}</title>
      {/* Grid lines */}
      {[0,0.25,0.5,0.75,1].map(function(t) {
        var y = t * plotH;
        var price = maxP - t * range;
        return (
          <g key={t}>
            <line x1={0} y1={y} x2={W} y2={y} stroke={BD} strokeWidth={0.5}/>
            <text x={4} y={y-2} fill={T2} fontSize={8}>{price.toLocaleString("en-IN",{maximumFractionDigits:0})}</text>
          </g>
        );
      })}

      {/* Candles */}
      {visible.map(function(c, i) {
        var bull = c.close >= c.open;
        var col = bull ? G : R;
        var x = i * cw;
        var bodyTop = yP(Math.max(c.open, c.close));
        var bodyBot = yP(Math.min(c.open, c.close));
        var bodyH = Math.max(1, bodyBot - bodyTop);
        return (
          <g key={i}>
            <line x1={xC(i)} y1={yP(c.high)} x2={xC(i)} y2={yP(c.low)} stroke={col} strokeWidth={1}/>
            <rect x={x + cw * 0.1} y={bodyTop} width={cw * 0.8} height={bodyH} fill={col}/>
          </g>
        );
      })}

      {/* EMA Lines */}
      {showEMA && emaPath9 ? <path d={emaPath9} fill="none" stroke="#F59E0B" strokeWidth={1.2}/> : null}
      {showEMA && emaPath21 ? <path d={emaPath21} fill="none" stroke={theme.c.blue} strokeWidth={1.2}/> : null}

      {/* VWAP */}
      {showVWAP && vwap > 0 ? (
        <line x1={0} y1={yP(vwap)} x2={W} y2={yP(vwap)} stroke="#8B5CF6" strokeWidth={1} strokeDasharray="4,3"/>
      ) : null}

      {/* Time axis - reserved bottom strip, genuine timestamps only */}
      <line x1={0} y1={plotH} x2={W} y2={plotH} stroke={BD} strokeWidth={0.5}/>
      {labelIdx.map(function(idx){
        var isFirst = idx==0;
        var isLast = idx==visible.length-1;
        var anchor = isFirst ? "start" : (isLast ? "end" : "middle");
        var x = isFirst ? 1 : (isLast ? W-1 : xC(idx));
        var txt = labelText(visible[idx].time, tf, !!bounds.dayB[idx], !!bounds.yearB[idx]);
        if(!txt) return null;
        return (
          <text key={idx} x={x} y={plotH+axisH-4} fill={T2} fontSize={8} textAnchor={anchor}>{txt}</text>
        );
      })}
    </svg>
  );
}

export default function ChartScreen() {
  var responsive = useResponsive(); // single call, canonical breakpoint only, no raw width checks
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Reassign (not re-declare) the existing module-level color bindings so
  // CandleChart, which reads them via closure, also reflects the current
  // theme. Geometry/math/data logic below is completely untouched.
  DB=theme.c.bg; CB=theme.c.card; BD=theme.c.border;
  G=theme.c.up; G2=theme.c.up; R=theme.c.down; GOLD=theme.c.gold;
  T1=theme.c.text1; T2=theme.c.text2;
  var BLUE = theme.c.blue;
  var bp = responsive.breakpoint;
  // Breakpoint-appropriate chart geometry (coordinate width/height pair).
  // Chosen to approximate each breakpoint's real center-workspace shape
  // (from the already-verified shell arithmetic) so preserveAspectRatio
  // "none" stretches minimally rather than universally mobile-shaped.
  // xs/sm unchanged from the original 340x200. tv/tv4k intentionally reuse
  // xxl's geometry - not redesigned here, per scope.
  var CHART_GEOM = {
    xs:{w:340,h:200}, sm:{w:340,h:200},
    md:{w:500,h:260},
    lg:{w:650,h:280},
    xl:{w:650,h:300},
    xxl:{w:650,h:320},
    tv:{w:650,h:320}, tv4k:{w:650,h:320}
  };
  var geom = CHART_GEOM[bp] || CHART_GEOM.xs;
  // Max visible time-axis labels per canonical breakpoint (Section 6).
  var LABEL_MAX = { xs:4, sm:4, md:6, lg:8, xl:10, xxl:12, tv:12, tv4k:12 };
  var labelMax = LABEL_MAX[bp] || 4;
  var [symIdx, setSymIdx] = useState(0);
  var [tf, setTf] = useState("15m");
  var [candles, setCandles] = useState([]);
  var [status, setStatus] = useState("loading"); // loading | ok | empty | error | offline
  var [showEMA, setShowEMA] = useState(true);
  var [showVWAP, setShowVWAP] = useState(true);
  var [showRSI, setShowRSI] = useState(false);

  var sym = SYMBOLS[symIdx];
  var abortRef = useRef(null);
  var mountedRef = useRef(true);

  function load(){
    // Race safety: cancel any in-flight request before starting a new one.
    if(abortRef.current){ try{ abortRef.current.abort(); }catch(e){} }
    var ctrl = null;
    try{ ctrl = new AbortController(); }catch(e){ ctrl = null; }
    abortRef.current = ctrl;

    if(typeof navigator!="undefined" && navigator.onLine==false){
      setStatus("offline");
      return;
    }
    setStatus("loading");

    var tfCfg = TF_MAP[tf] || TF_MAP["15m"];
    var url = "/api/history?symbol="+encodeURIComponent(sym.api)+"&range="+tfCfg.range+"&interval="+tfCfg.interval;

    fetch(url, ctrl?{signal:ctrl.signal}:{})
      .then(function(r){ return r.json(); })
      .then(function(json){
        if(!mountedRef.current) return;
        if(abortRef.current!=ctrl) return; // a newer request has since started, ignore this stale one
        var raw = (json && json.candles) || [];
        var mapped = raw.map(mapCandle).filter(function(c){ return c!=null; });
        // Sort ascending by genuine time, then drop exact duplicate
        // timestamps (keep first occurrence). Done once here, not
        // repeated inside CandleChart on every render. Never averages or
        // mutates OHLC values - only ordering/dedup of real rows.
        mapped.sort(function(a,b){ return a.time-b.time; });
        var seenT = {}, deduped = [];
        for(var di=0; di<mapped.length; di++){
          var mc = mapped[di];
          if(seenT[mc.time]) continue;
          seenT[mc.time] = true;
          deduped.push(mc);
        }
        mapped = deduped;
        if(json && json.error && mapped.length==0){ setStatus("error"); setCandles([]); return; }
        if(mapped.length==0){ setStatus("empty"); setCandles([]); return; }
        setCandles(mapped);
        setStatus("ok");
      })
      .catch(function(e){
        if(e && e.name=="AbortError") return; // intentional cancellation, not a user-facing error
        if(!mountedRef.current) return;
        if(abortRef.current!=ctrl) return;
        setStatus("error");
        setCandles([]);
      });
  }

  useEffect(function(){
    mountedRef.current = true;
    load();
    return function(){
      mountedRef.current = false;
      if(abortRef.current){ try{ abortRef.current.abort(); }catch(e){} }
    };
  }, [symIdx, tf]);

  var ema9 = calcEMA(candles, 9);
  var ema21 = calcEMA(candles, 21);
  var vwap = calcVWAP(candles);
  var rsi = calcRSI(candles); // null = insufficient real data, never a fabricated number
  var lastC = candles[candles.length - 1] || {open:0,close:0,high:0,low:0,vol:0};
  var hasData = status=="ok" && candles.length>0;
  var bull = lastC.close >= lastC.open;
  var chgPct = (hasData && lastC.open > 0) ? ((lastC.close - lastC.open) / lastC.open * 100).toFixed(2) : "0.00";

  var rsiColor = rsi==null ? T2 : (rsi > 70 ? R : rsi < 30 ? G2 : GOLD);
  var rsiLabel = rsi==null ? "Insufficient data" : (rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral");

  var indicators = [
    {label:"RSI",   val: rsi==null ? "--" : rsi, color:rsiColor, sub:rsiLabel},
    {label:"EMA 9", val: (ema9.length? (ema9[ema9.length-1]==null?"--":ema9[ema9.length-1]) : "--"), color:GOLD, sub: (ema9.length && ema9[ema9.length-1]!=null) ? (lastC.close > ema9[ema9.length-1] ? "Bullish" : "Bearish") : "Insufficient data"},
    {label:"EMA 21",val: (ema21.length? (ema21[ema21.length-1]==null?"--":ema21[ema21.length-1]) : "--"), color:theme.c.blue, sub: (ema21.length && ema21[ema21.length-1]!=null) ? (lastC.close > ema21[ema21.length-1] ? "Bullish" : "Bearish") : "Insufficient data"},
    {label:"VWAP",  val: hasData ? vwap : "--", color:"#8B5CF6", sub: hasData ? (lastC.close > vwap ? "Above" : "Below") : "Insufficient data"},
  ];

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T1}}>Chart <span style={{color:BLUE}}>Engine</span></div>
            <div style={{fontSize:8,color:T2}}>Historical candles</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"monospace",fontSize:18,fontWeight:900,color:hasData?(bull?G2:R):T2}}>
              {hasData ? lastC.close.toLocaleString("en-IN",{minimumFractionDigits:2}) : "--"}
            </div>
            <div style={{fontSize:10,fontWeight:700,color:hasData?(bull?G2:R):T2}}>{hasData ? ((bull?"+":"")+chgPct+"%") : "--"}</div>
          </div>
        </div>

        {/* Symbol selector */}
        <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:8}}>
          {SYMBOLS.map(function(s,i){
            var act=symIdx==i;
            return <button key={s.sym} onClick={function(){setSymIdx(i);}} style={{background:act?BLUE:"rgba(255,255,255,0.06)",border:"1px solid "+(act?BLUE:BD),borderRadius:20,padding:"4px 10px",color:act?"#fff":T2,fontSize:9,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{s.sym}</button>;
          })}
        </div>

        {/* Timeframe */}
        <div style={{display:"flex",gap:6}}>
          {TIMEFRAMES.map(function(t){
            var act=tf==t;
            return <button key={t} onClick={function(){setTf(t);}} style={{background:act?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?GOLD:BD),borderRadius:8,padding:"4px 10px",color:act?GOLD:T2,fontSize:10,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>;
          })}
          <div style={{flex:1}}></div>
          <button onClick={load} style={{background:"rgba(37,99,235,0.1)",border:"1px solid rgba(37,99,235,0.3)",borderRadius:8,padding:"4px 10px",color:BLUE,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Refresh</button>
        </div>
      </div>

      <div style={{padding:14}}>

        {!hasData ? (
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:20,marginBottom:12,textAlign:"center"}}>
            <div style={{fontSize:12,color: status=="error"?R:T2, fontWeight:700}}>
              {status=="loading" ? "Loading chart data..." :
               status=="error" ? "Chart data temporarily unavailable" :
               status=="offline" ? "You are offline" :
               status=="empty" ? "No historical data available for this symbol/timeframe." :
               "Loading chart data..."}
            </div>
          </div>
        ) : (
        <div>
        {/* OHLCV */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:12}}>
          {[["O",lastC.open],["H",lastC.high],["L",lastC.low],["C",lastC.close],["V",(lastC.vol/1000).toFixed(0)+"K"]].map(function(r){
            return (
              <div key={r[0]} style={{background:CB,border:"1px solid "+BD,borderRadius:8,padding:"6px",textAlign:"center"}}>
                <div style={{fontSize:7,color:T2,marginBottom:2}}>{r[0]}</div>
                <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:T1}}>{typeof r[1]=="number"?r[1].toLocaleString("en-IN",{maximumFractionDigits:0}):r[1]}</div>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:10,marginBottom:12,overflow:"hidden"}}>
          <CandleChart candles={candles} ema9={ema9} ema21={ema21} vwap={vwap} showEMA={showEMA} showVWAP={showVWAP} w={geom.w} h={geom.h} tf={tf} symLabel={sym.sym} maxLabels={labelMax}/>
        </div>

        {/* Indicator toggles */}
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          {[["EMA 9/21",showEMA,function(){setShowEMA(!showEMA);},GOLD],["VWAP",showVWAP,function(){setShowVWAP(!showVWAP);},"#8B5CF6"],["RSI",showRSI,function(){setShowRSI(!showRSI);},rsiColor]].map(function(item){
            return (
              <button key={item[0]} onClick={item[2]} style={{background:item[1]?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)",border:"1px solid "+(item[1]?item[3]:BD),borderRadius:20,padding:"5px 12px",color:item[1]?item[3]:T2,fontSize:9,fontWeight:item[1]?700:400,cursor:"pointer",fontFamily:"inherit"}}>
                {item[0]}
              </button>
            );
          })}
        </div>

        {/* RSI Panel */}
        {showRSI ? (
          <div style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:12,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:700,color:T1}}>RSI (14)</div>
              <div style={{fontSize:12,fontWeight:900,color:rsiColor}}>{rsi==null?"Insufficient data":(rsi+"  "+rsiLabel)}</div>
            </div>
            {rsi!=null ? (
              <div>
                <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden",position:"relative"}}>
                  <div style={{width:rsi+"%",height:"100%",background:rsiColor,borderRadius:4}}></div>
                  <div style={{position:"absolute",left:"30%",top:0,width:1,height:"100%",background:"rgba(0,200,83,0.5)"}}></div>
                  <div style={{position:"absolute",left:"70%",top:0,width:1,height:"100%",background:"rgba(239,68,68,0.5)"}}></div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  <span style={{fontSize:7,color:G2}}>30 Oversold</span>
                  <span style={{fontSize:7,color:R}}>70 Overbought</span>
                </div>
              </div>
            ) : (
              <div style={{fontSize:9,color:T2}}>Not enough historical candles for this symbol/timeframe to compute RSI.</div>
            )}
          </div>
        ) : null}

        {/* Indicators grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {indicators.map(function(ind){
            return (
              <div key={ind.label} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:12}}>
                <div style={{fontSize:9,color:T2,marginBottom:3}}>{ind.label}</div>
                <div style={{fontFamily:"monospace",fontSize:14,fontWeight:800,color:ind.color}}>{typeof ind.val=="number"?ind.val.toLocaleString("en-IN",{maximumFractionDigits:2}):ind.val}</div>
                <div style={{fontSize:8,color:ind.color,marginTop:2}}>{ind.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:10,padding:10,marginBottom:12}}>
          <div style={{fontSize:9,fontWeight:700,color:T1,marginBottom:6}}>Chart Legend</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {[["Green candle","Bullish (Close > Open)",G],[" Red candle","Bearish (Close < Open)",R],["Yellow line","EMA 9",GOLD],["Blue line","EMA 21",theme.c.blue],["Purple dash","VWAP","#8B5CF6"]].map(function(l){
              return <div key={l[0]} style={{fontSize:8,color:T2}}><span style={{color:l[2],fontWeight:700}}>{l[0]}</span> = {l[1]}</div>;
            })}
          </div>
        </div>
        </div>
        )}

        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:theme.c.warn}}>
            {hasData ? "Real historical data via Yahoo Finance. Educational only. Not SEBI registered. Not investment advice." : "Educational only. Not SEBI registered. Not investment advice."}
          </div>
        </div>
      </div>
    </div>
  );
}
