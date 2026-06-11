import { useState, useEffect, useRef } from "react";

var G = "#00C853";
var R = "#EF4444";
var GOLD = "#F59E0B";

//  COMPLETE PATTERN ENGINE (100% Offline) 
var PATTERNS = {
  "Bullish Engulfing": {
    type:"Bullish", strength:"Strong", reliability:75, candles:2,
    desc:"Large green candle completely engulfs previous red candle.",
    entry:"Buy at open of next candle after pattern",
    sl:"Below the low of the engulfing candle",
    target:"Next resistance level (1:2 minimum)",
    rr:"1:2", winProb:72,
    formation:"Day 1: Red candle. Day 2: Green opens below Day1 low, closes above Day1 high.",
    bestAt:"Bottom of downtrend, near strong support zone",
    volume:"Day 2 volume MUST be higher than Day 1",
    psychology:"Bears pushed price down but bulls overwhelmed with full control"
  },
  "Bearish Engulfing": {
    type:"Bearish", strength:"Strong", reliability:73, candles:2,
    desc:"Large red candle completely engulfs previous green candle.",
    entry:"Sell/Short at open of next candle",
    sl:"Above the high of the engulfing candle",
    target:"Next support level (1:2 minimum)",
    rr:"1:2", winProb:70,
    formation:"Day 1: Green candle. Day 2: Red opens above Day1 high, closes below Day1 low.",
    bestAt:"Top of uptrend, near strong resistance zone",
    volume:"Day 2 volume must be significantly higher",
    psychology:"Bulls pushed price up but bears overwhelmed with heavy selling"
  },
  "Hammer": {
    type:"Bullish", strength:"Strong", reliability:70, candles:1,
    desc:"Small body at top with long lower wick. Bulls rejected lower prices.",
    entry:"Buy above the high of hammer candle",
    sl:"Below the low of hammer wick",
    target:"Previous resistance or swing high",
    rr:"1:2.5", winProb:68,
    formation:"Body at top 1/3rd. Lower wick 2x or more of body. Minimal upper wick.",
    bestAt:"Bottom of downtrend at strong support zone",
    volume:"High volume hammer = very strong signal",
    psychology:"Sellers pushed price low but buyers overwhelmed and rejected lower prices"
  },
  "Shooting Star": {
    type:"Bearish", strength:"Strong", reliability:70, candles:1,
    desc:"Small body at bottom with long upper wick. Bears rejected higher prices.",
    entry:"Sell below the low of shooting star",
    sl:"Above the high of upper wick",
    target:"Previous support or swing low",
    rr:"1:2.5", winProb:68,
    formation:"Body at bottom 1/3rd. Upper wick 2x or more of body. Minimal lower wick.",
    bestAt:"Top of uptrend at strong resistance zone",
    volume:"Higher volume confirms strength of rejection",
    psychology:"Buyers pushed price high but sellers overwhelmed and rejected higher prices"
  },
  "Doji": {
    type:"Neutral", strength:"Medium", reliability:60, candles:1,
    desc:"Open and close nearly equal. Complete indecision between bulls and bears.",
    entry:"Wait for confirmation candle before entry",
    sl:"Beyond the high or low of doji",
    target:"Depends on confirmation candle direction",
    rr:"1:1.5", winProb:55,
    formation:"Open = Close (within 0.1%). Can have wicks on both sides.",
    bestAt:"After strong trend, at key support/resistance levels",
    volume:"High volume doji = very strong indecision signal",
    psychology:"Neither bulls nor bears in control. Market at decision crossroads"
  },
  "Morning Star": {
    type:"Bullish", strength:"Very Strong", reliability:78, candles:3,
    desc:"3-candle reversal at bottom. Strong bull takeover after bear exhaustion.",
    entry:"Buy at open of 4th candle (after confirmation)",
    sl:"Below the low of Day 1 candle",
    target:"50% retracement of prior downtrend",
    rr:"1:3", winProb:75,
    formation:"Day 1: Large red. Day 2: Small body gap down. Day 3: Large green closes above Day1 midpoint.",
    bestAt:"Bottom of strong downtrend at major support",
    volume:"Day 3 volume should be highest of the three candles",
    psychology:"Bears exhausted, indecision, then strong bull control takeover"
  },
  "Evening Star": {
    type:"Bearish", strength:"Very Strong", reliability:78, candles:3,
    desc:"3-candle reversal at top. Strong bear takeover after bull exhaustion.",
    entry:"Sell at open of 4th candle",
    sl:"Above the high of Day 1 candle",
    target:"50% retracement of prior uptrend",
    rr:"1:3", winProb:75,
    formation:"Day 1: Large green. Day 2: Small body gap up. Day 3: Large red closes below Day1 midpoint.",
    bestAt:"Top of strong uptrend at major resistance",
    volume:"Day 3 volume should be highest",
    psychology:"Bulls exhausted, indecision, then strong bear control takeover"
  },
  "Marubozu": {
    type:"Bullish", strength:"Very Strong", reliability:72, candles:1,
    desc:"Full body candle with no wicks. Complete one-sided market dominance.",
    entry:"Buy at close or next candle open",
    sl:"Below the low (open) of marubozu",
    target:"Next resistance (trend continuation)",
    rr:"1:2", winProb:70,
    formation:"No upper or lower wick. Open = Low (bull). Close = High (bull).",
    bestAt:"After consolidation breakout, trend continuation",
    volume:"Very high volume confirms marubozu strength",
    psychology:"One side has complete control from open to close. No fight."
  },
  "Inside Bar": {
    type:"Neutral", strength:"Medium", reliability:62, candles:2,
    desc:"Small candle completely inside previous candle range. Consolidation signal.",
    entry:"Buy above mother bar high OR Sell below mother bar low",
    sl:"Opposite side of mother bar",
    target:"Measured move equal to mother bar size",
    rr:"1:2", winProb:60,
    formation:"Day 2 high below Day 1 high AND Day 2 low above Day 1 low.",
    bestAt:"After strong trend move, potential continuation or reversal",
    volume:"Volume should decrease significantly on inside bar",
    psychology:"Market pausing and consolidating before next big move"
  },
  "Outside Bar": {
    type:"Neutral", strength:"Strong", reliability:65, candles:2,
    desc:"Large candle completely engulfs previous candle range. Volatility expansion.",
    entry:"Trade in direction of outside bar close",
    sl:"Opposite end of outside bar",
    target:"1.5x the size of outside bar",
    rr:"1:1.5", winProb:63,
    formation:"Day 2 high above Day 1 high AND Day 2 low below Day 1 low.",
    bestAt:"After consolidation, at key breakout levels",
    volume:"Very high volume on outside bar = strong signal",
    psychology:"Both sides fighting hard resulting in large volatile candle"
  },
  "Tweezer Top": {
    type:"Bearish", strength:"Medium", reliability:64, candles:2,
    desc:"Two candles with equal highs at resistance. Double rejection of higher prices.",
    entry:"Sell below the low of second candle",
    sl:"Above the equal highs",
    target:"Previous support level",
    rr:"1:2", winProb:62,
    formation:"Day 1: Green candle. Day 2: Red candle. Both have same or nearly equal highs.",
    bestAt:"At resistance zone, top of uptrend",
    volume:"Second candle volume confirms rejection strength",
    psychology:"Bulls tried twice to push higher but failed both times"
  },
  "Tweezer Bottom": {
    type:"Bullish", strength:"Medium", reliability:64, candles:2,
    desc:"Two candles with equal lows at support. Double rejection of lower prices.",
    entry:"Buy above the high of second candle",
    sl:"Below the equal lows",
    target:"Previous resistance level",
    rr:"1:2", winProb:62,
    formation:"Day 1: Red candle. Day 2: Green candle. Both have same or nearly equal lows.",
    bestAt:"At support zone, bottom of downtrend",
    volume:"Second candle volume confirms buying strength",
    psychology:"Bears tried twice to push lower but failed both times"
  },
};

// Pattern detection - pure math
function detectPatterns(candles) {
  if (!candles || candles.length < 3) return [];
  var detected = [];
  var len = candles.length;
  var c = candles[len-1];
  var p = candles[len-2];
  var pp = candles[len-3];

  var cBull = c.close > c.open;
  var pBull = p.close > p.open;
  var cBody = Math.abs(c.close - c.open);
  var pBody = Math.abs(p.close - p.open);
  var ppBody = Math.abs(pp.close - pp.open);
  var cRange = c.high - c.low;
  var pRange = p.high - p.low;
  var cUW = c.high - Math.max(c.open, c.close);
  var cLW = Math.min(c.open, c.close) - c.low;

  if (!pBull && cBull && c.open < p.close && c.close > p.open && cBody > pBody * 1.2) detected.push("Bullish Engulfing");
  if (pBull && !cBull && c.open > p.close && c.close < p.open && cBody > pBody * 1.2) detected.push("Bearish Engulfing");
  if (cBody < cRange * 0.1 && cRange > 0) detected.push("Doji");
  if (cLW >= cBody * 2 && cUW <= cBody * 0.3 && !pBull) detected.push("Hammer");
  if (cUW >= cBody * 2 && cLW <= cBody * 0.3 && pBull) detected.push("Shooting Star");
  if (cUW < cBody * 0.02 && cLW < cBody * 0.02 && cBody > 0) detected.push("Marubozu");
  if (!pBull && Math.abs(pp.close-pp.open) < (pp.high-pp.low)*0.3 && cBull && c.close > (p.open+p.close)/2) detected.push("Morning Star");
  if (pBull && Math.abs(pp.close-pp.open) < (pp.high-pp.low)*0.3 && !cBull && c.close < (p.open+p.close)/2) detected.push("Evening Star");
  if (c.high < p.high && c.low > p.low) detected.push("Inside Bar");
  if (c.high > p.high && c.low < p.low) detected.push("Outside Bar");
  if (pBull && !cBull && Math.abs(c.high - p.high) < cRange * 0.05) detected.push("Tweezer Top");
  if (!pBull && cBull && Math.abs(c.low - p.low) < cRange * 0.05) detected.push("Tweezer Bottom");

  return detected;
}

// Generate candles
function genCandles(n) {
  var price = 22400;
  var arr = [];
  for (var i = 0; i < n; i++) {
    var chg = (Math.random() - 0.48) * 90;
    var open = price;
    var close = parseFloat((open + chg).toFixed(2));
    var high = parseFloat((Math.max(open,close) + Math.random()*45).toFixed(2));
    var low = parseFloat((Math.min(open,close) - Math.random()*45).toFixed(2));
    arr.push({ open, close, high, low, vol: Math.floor(80000 + Math.random()*300000) });
    price = close;
  }
  return arr;
}

// Mini candle SVG
function MiniCandle({ candle, w, h }) {
  var bull = candle.close >= candle.open;
  var col = bull ? G : R;
  var min = candle.low; var max = candle.high; var range = max - min || 1;
  function y(p) { return h - ((p - min) / range) * h; }
  var bodyTop = y(Math.max(candle.open, candle.close));
  var bodyBot = y(Math.min(candle.open, candle.close));
  var bh = Math.max(2, bodyBot - bodyTop);
  return (
    <svg width={w} height={h}>
      <line x1={w/2} y1={y(candle.high)} x2={w/2} y2={y(candle.low)} stroke={col} strokeWidth={1}/>
      <rect x={w*0.2} y={bodyTop} width={w*0.6} height={bh} fill={col}/>
    </svg>
  );
}

// Pattern Detail Modal
function PatternModal({ name, onClose }) {
  var p = PATTERNS[name];
  if (!p) return null;
  var tc = p.type=="Bullish"?G:p.type=="Bearish"?R:GOLD;
  var tb = p.type=="Bullish"?"#F0FDF4":p.type=="Bearish"?"#FFF1F2":"#FFFBEB";

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.7)", zIndex:500, display:"flex", alignItems:"flex-end" }}>
      <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", width:"100%", maxHeight:"88vh", overflowY:"auto" }}>
        <div style={{ padding:"16px 16px 0" }}>
          <div style={{ width:40, height:4, background:"#E5E7EB", borderRadius:2, margin:"0 auto 14px" }}></div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:20, fontWeight:900, color:"#111827" }}>{name}</div>
              <div style={{ display:"flex", gap:6, marginTop:5 }}>
                <span style={{ background:tb, color:tc, borderRadius:6, padding:"3px 10px", fontSize:10, fontWeight:700 }}>{p.type}</span>
                <span style={{ background:"#F3F4F6", color:"#374151", borderRadius:6, padding:"3px 10px", fontSize:10 }}>{p.strength}</span>
                <span style={{ background:"#F3F4F6", color:"#374151", borderRadius:6, padding:"3px 10px", fontSize:10 }}>{p.reliability}% reliable</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"#F3F4F6", border:"none", borderRadius:10, width:34, height:34, fontSize:16, cursor:"pointer", flexShrink:0 }}>X</button>
          </div>
          <div style={{ fontSize:12, color:"#374151", lineHeight:1.7, marginBottom:14, background:"#F9FAFB", borderRadius:10, padding:12 }}>{p.desc}</div>
        </div>

        {/* Trade Setup */}
        <div style={{ margin:"0 16px 14px", background:"linear-gradient(135deg,#0B0B0B,#1A1A1A)", borderRadius:14, padding:14 }}>
          <div style={{ fontSize:11, fontWeight:700, color:GOLD, marginBottom:10 }}>Trade Setup</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[["Entry",p.entry,G],["Stop Loss",p.sl,R],["Target",p.target,GOLD],["R:R Ratio",p.rr,"#3B82F6"]].map(function(r) {
              return (
                <div key={r[0]} style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:10, borderLeft:"3px solid "+r[2] }}>
                  <div style={{ fontSize:8, color:"#666", marginBottom:3 }}>{r[0]}</div>
                  <div style={{ fontSize:9, color:"#fff", lineHeight:1.4, fontWeight:600 }}>{r[1]}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:9, color:"#888" }}>Win Probability</span>
              <span style={{ fontSize:11, fontWeight:700, color:p.winProb>=70?G:p.winProb>=60?GOLD:R }}>{p.winProb}%</span>
            </div>
            <div style={{ height:6, background:"#1A1A1A", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:p.winProb+"%", background:p.winProb>=70?G:p.winProb>=60?GOLD:R, borderRadius:3 }}></div>
            </div>
          </div>
        </div>

        <div style={{ padding:"0 16px 16px" }}>
          {[["Formation",p.formation],["Best Works At",p.bestAt],["Volume Rule",p.volume],["Psychology",p.psychology]].map(function(r) {
            return (
              <div key={r[0]} style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#6B7280", marginBottom:4 }}>{r[0]}</div>
                <div style={{ fontSize:12, color:"#111827", lineHeight:1.6 }}>{r[1]}</div>
              </div>
            );
          })}
          <div style={{ background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:10, padding:10 }}>
            <div style={{ fontSize:8, color:"#92400E" }}>Educational only. Not SEBI registered. Not investment advice.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CandleDetector() {
  var [candles, setCandles] = useState(function() { return genCandles(25); });
  var [detected, setDetected] = useState([]);
  var [selected, setSelected] = useState(null);
  var [autoDetect, setAutoDetect] = useState(true);

  useEffect(function() {
    if (autoDetect) setDetected(detectPatterns(candles));
  }, [candles, autoDetect]);

  function addCandle() {
    setCandles(function(prev) {
      var last = prev[prev.length-1];
      var chg = (Math.random()-0.48)*100;
      var open = last.close;
      var close = parseFloat((open+chg).toFixed(2));
      return prev.slice(-24).concat([{
        open, close,
        high: parseFloat((Math.max(open,close)+Math.random()*50).toFixed(2)),
        low: parseFloat((Math.min(open,close)-Math.random()*50).toFixed(2)),
        vol: Math.floor(80000+Math.random()*300000)
      }]);
    });
  }

  var lastC = candles[candles.length-1];
  var bull = lastC.close >= lastC.open;

  // Draw simple chart with SVG
  var chartCandles = candles.slice(-20);
  var prices = chartCandles.reduce(function(a,c){return a.concat([c.high,c.low]);}, []);
  var minP = Math.min.apply(null,prices), maxP = Math.max.apply(null,prices), range = maxP-minP||1;
  var cw = 15;
  var ch = 120;
  function yP(p){return ch-((p-minP)/range)*(ch-10)+5;}

  return (
    <div style={{ background:"#F8F9FA", minHeight:"100vh", fontFamily:"Inter,Arial,sans-serif", paddingBottom:20 }}>

      {/* Header */}
      <div style={{ background:"#fff", padding:"12px 14px", borderBottom:"1px solid #F0F0F0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:16, fontWeight:900, color:"#111827" }}>Candle <span style={{color:G}}>Detector</span></div>
          <div style={{ fontSize:8, color:"#F97316", fontWeight:700, letterSpacing:1 }}>12 PATTERNS - 100% OFFLINE</div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={function(){setAutoDetect(!autoDetect);}} style={{ background:autoDetect?G:"#F3F4F6", border:"none", borderRadius:8, padding:"6px 10px", color:autoDetect?"#fff":"#374151", fontSize:9, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>AUTO {autoDetect?"ON":"OFF"}</button>
          <button onClick={addCandle} style={{ background:"#111827", border:"none", borderRadius:8, padding:"6px 10px", color:"#fff", fontSize:9, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Candle</button>
        </div>
      </div>

      <div style={{ padding:"14px" }}>

        {/* Mini Chart */}
        <div style={{ background:"#0B0B0B", borderRadius:14, padding:14, marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div>
              <div style={{ fontSize:10, color:"#555" }}>NIFTY 50 - Last 20 Candles</div>
              <div style={{ fontSize:18, fontWeight:900, fontFamily:"monospace", color:bull?G:R }}>{lastC.close.toLocaleString("en-IN")}</div>
            </div>
            {detected.length > 0 && (
              <div style={{ background:"rgba(245,158,11,0.15)", border:"1px solid "+GOLD, borderRadius:10, padding:"6px 10px", textAlign:"center" }}>
                <div style={{ fontSize:8, color:GOLD, fontWeight:700 }}>DETECTED</div>
                <div style={{ fontSize:11, fontWeight:900, color:GOLD }}>{detected.length}</div>
              </div>
            )}
          </div>
          <svg width="100%" height={ch} viewBox={"0 0 "+(chartCandles.length*cw)+" "+ch} preserveAspectRatio="none">
            {chartCandles.map(function(c,i) {
              var bull2 = c.close >= c.open;
              var col = bull2 ? G : R;
              var x = i*cw + cw/2;
              var bTop = yP(Math.max(c.open,c.close));
              var bBot = yP(Math.min(c.open,c.close));
              var bH = Math.max(1, bBot-bTop);
              return (
                <g key={i}>
                  <line x1={x} y1={yP(c.high)} x2={x} y2={yP(c.low)} stroke={col} strokeWidth={1}/>
                  <rect x={i*cw+3} y={bTop} width={cw-4} height={bH} fill={col}/>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detected Patterns */}
        {detected.length > 0 ? (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#111827", marginBottom:8 }}>Detected on Last Candle</div>
            {detected.map(function(name) {
              var p = PATTERNS[name];
              var tc = p.type=="Bullish"?G:p.type=="Bearish"?R:GOLD;
              var tb = p.type=="Bullish"?"#F0FDF4":p.type=="Bearish"?"#FFF1F2":"#FFFBEB";
              return (
                <div key={name} style={{ background:tb, border:"2px solid "+tc, borderRadius:14, padding:14, marginBottom:8, cursor:"pointer" }} onClick={function(){setSelected(name);}}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:8, color:tc, fontWeight:700, marginBottom:3
