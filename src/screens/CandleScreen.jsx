import { useState, useEffect, useRef } from "react";

//  CANDLE PATTERN ENGINE (100% Offline, No API) 

var PATTERN_LIBRARY = {
  "Bullish Engulfing": {
    type: "Bullish", strength: "Strong", reliability: 75,
    desc: "A large green candle completely engulfs the previous red candle.",
    formation: "2-candle pattern. Day 1: Red candle. Day 2: Green candle opens below Day1 low and closes above Day1 high.",
    bestAt: "Bottom of downtrend, near support zone",
    volume: "Volume on Day 2 should be higher than Day 1",
    advantages: ["Strong reversal signal", "Easy to identify", "Works on all timeframes"],
    mistakes: ["Don't trade without volume confirmation", "Avoid in sideways market"],
    psychology: "Bears pushed price down, but bulls overwhelmed and took full control"
  },
  "Bearish Engulfing": {
    type: "Bearish", strength: "Strong", reliability: 73,
    desc: "A large red candle completely engulfs the previous green candle.",
    formation: "2-candle pattern. Day 1: Green candle. Day 2: Red candle opens above Day1 high and closes below Day1 low.",
    bestAt: "Top of uptrend, near resistance zone",
    volume: "Volume on Day 2 must be significantly higher",
    advantages: ["Clear reversal signal at resistance", "High success rate at key levels"],
    mistakes: ["Don't trade in middle of range", "Confirm with resistance level"],
    psychology: "Bulls pushed price up, but bears overwhelmed with strong selling pressure"
  },
  "Doji": {
    type: "Neutral", strength: "Medium", reliability: 65,
    desc: "Open and close are nearly equal, showing market indecision.",
    formation: "Single candle. Open = Close (or very close). Can have upper and lower wicks.",
    bestAt: "After strong trend, at key support/resistance levels",
    volume: "Low volume Doji = weak signal. High volume Doji = strong indecision",
    advantages: ["Easy to spot", "Works on all timeframes", "Signals potential reversal"],
    mistakes: ["Never trade Doji alone", "Wait for confirmation candle next day"],
    psychology: "Neither bulls nor bears in control. Market is at crossroads"
  },
  "Hammer": {
    type: "Bullish", strength: "Strong", reliability: 70,
    desc: "Small body at top with long lower wick. Bulls rejected lower prices strongly.",
    formation: "Single candle. Body at top 1/3rd. Lower wick 2x or more of body. Little or no upper wick.",
    bestAt: "Bottom of downtrend, at strong support zone",
    volume: "High volume confirms hammer strength",
    advantages: ["Very reliable at support", "Clear entry signal with stop below wick"],
    mistakes: ["Inverted hammer is different pattern", "Must be at bottom of trend"],
    psychology: "Sellers pushed price low but buyers came in strong and rejected lower prices"
  },
  "Shooting Star": {
    type: "Bearish", strength: "Strong", reliability: 70,
    desc: "Small body at bottom with long upper wick. Bears rejected higher prices.",
    formation: "Single candle. Body at bottom 1/3rd. Upper wick 2x or more of body. Little or no lower wick.",
    bestAt: "Top of uptrend, at strong resistance zone",
    volume: "Higher volume = stronger signal",
    advantages: ["Clear entry for short trade", "Good risk-reward with stop above wick"],
    mistakes: ["Must be at top of uptrend", "Confirm with next red candle"],
    psychology: "Buyers pushed price high but sellers came in strong and rejected higher prices"
  },
  "Morning Star": {
    type: "Bullish", strength: "Very Strong", reliability: 78,
    desc: "3-candle reversal pattern at bottom of downtrend.",
    formation: "Day 1: Large red candle. Day 2: Small body (gap down, indecision). Day 3: Large green candle closes above Day1 midpoint.",
    bestAt: "Bottom of strong downtrend, at major support",
    volume: "Day 3 volume should be highest of the three",
    advantages: ["Very reliable reversal signal", "3-candle confirmation reduces false signals"],
    mistakes: ["Day 3 must close above 50% of Day 1", "All 3 candles must be confirmed"],
    psychology: "Strong bear pressure, then indecision, then strong bull takeover"
  },
  "Evening Star": {
    type: "Bearish", strength: "Very Strong", reliability: 78,
    desc: "3-candle reversal pattern at top of uptrend.",
    formation: "Day 1: Large green candle. Day 2: Small body (gap up, indecision). Day 3: Large red candle closes below Day1 midpoint.",
    bestAt: "Top of strong uptrend, at major resistance",
    volume: "Day 3 volume should be highest",
    advantages: ["Very reliable at tops", "3-candle confirmation = fewer false signals"],
    mistakes: ["Day 3 must close below 50% of Day 1", "Confirm at resistance"],
    psychology: "Strong bull pressure, then indecision, then strong bear takeover"
  },
  "Marubozu": {
    type: "Bullish", strength: "Very Strong", reliability: 72,
    desc: "Full body candle with no wicks. Complete dominance by one side.",
    formation: "Single candle. No upper or lower wick. Open = Low (Bullish). Close = High (Bullish).",
    bestAt: "After consolidation breakout, trend continuation",
    volume: "Very high volume confirms Marubozu strength",
    advantages: ["Shows complete control", "Strong trend continuation signal"],
    mistakes: ["Can be exhaustion candle if too long", "Check overall trend before trading"],
    psychology: "One side has complete control from open to close. No fight from other side"
  },
  "Piercing Pattern": {
    type: "Bullish", strength: "Medium", reliability: 65,
    desc: "2-candle bullish reversal. Green candle opens below but closes above Day1 midpoint.",
    formation: "Day 1: Red candle. Day 2: Opens below Day1 low, closes above Day1 50% level.",
    bestAt: "Bottom of downtrend at support",
    volume: "Day 2 volume should be higher",
    advantages: ["Good risk-reward ratio", "Clear entry and stop levels"],
    mistakes: ["Must close above 50% of Day1", "Dark Cloud Cover is opposite pattern"],
    psychology: "Bears seem in control, but bulls push back and reclaim more than half the loss"
  },
  "Dark Cloud Cover": {
    type: "Bearish", strength: "Medium", reliability: 65,
    desc: "2-candle bearish reversal. Red candle opens above but closes below Day1 midpoint.",
    formation: "Day 1: Green candle. Day 2: Opens above Day1 high, closes below Day1 50% level.",
    bestAt: "Top of uptrend at resistance",
    volume: "Day 2 volume should be higher",
    advantages: ["Clear reversal at resistance", "Defined entry and stop"],
    mistakes: ["Must close below 50% of Day1", "Piercing Pattern is opposite"],
    psychology: "Bulls seem in control, but bears push back and erase more than half the gains"
  },
  "Harami": {
    type: "Neutral", strength: "Weak", reliability: 55,
    desc: "Small candle inside the previous large candle. Shows slowing momentum.",
    formation: "Day 1: Large candle. Day 2: Small candle completely within Day1 body range.",
    bestAt: "After strong trend move, potential slowdown",
    volume: "Day 2 volume should decrease significantly",
    advantages: ["Early warning signal", "Good for watching potential reversals"],
    mistakes: ["Very low reliability alone", "Always wait for confirmation candle"],
    psychology: "Strong move losing steam. Market pausing to decide next direction"
  },
};

// Pattern detection function - pure math, no API
function detectPattern(candles) {
  if (!candles || candles.length < 2) return null;
  var c = candles[candles.length - 1]; // current/last candle
  var p = candles[candles.length - 2]; // previous candle
  var pp = candles.length >= 3 ? candles[candles.length - 3] : null;

  var cBull = c.close > c.open;
  var pBull = p.close > p.open;
  var cBody = Math.abs(c.close - c.open);
  var pBody = Math.abs(p.close - p.open);
  var cRange = c.high - c.low;
  var pRange = p.high - p.low;
  var cUWick = c.high - Math.max(c.open, c.close);
  var cLWick = Math.min(c.open, c.close) - c.low;

  // Bullish Engulfing
  if (!pBull && cBull && c.open < p.close && c.close > p.open && cBody > pBody * 1.2) {
    return "Bullish Engulfing";
  }
  // Bearish Engulfing
  if (pBull && !cBull && c.open > p.close && c.close < p.open && cBody > pBody * 1.2) {
    return "Bearish Engulfing";
  }
  // Doji
  if (cBody < cRange * 0.1 && cRange > 0) {
    return "Doji";
  }
  // Hammer
  if (cLWick >= cBody * 2 && cUWick <= cBody * 0.3 && !pBull) {
    return "Hammer";
  }
  // Shooting Star
  if (cUWick >= cBody * 2 && cLWick <= cBody * 0.3 && pBull) {
    return "Shooting Star";
  }
  // Marubozu
  if (cUWick < cBody * 0.02 && cLWick < cBody * 0.02 && cBody > pBody * 0.8) {
    return "Marubozu";
  }
  // Morning Star (3 candles)
  if (pp && !pp.close - pp.open < 0 && Math.abs(p.close - p.open) < pRange * 0.3 && cBull && c.close > (pp.open + pp.close) / 2) {
    return "Morning Star";
  }
  // Evening Star (3 candles)
  if (pp && pp.close > pp.open && Math.abs(p.close - p.open) < pRange * 0.3 && !cBull && c.close < (pp.open + pp.close) / 2) {
    return "Evening Star";
  }
  // Piercing Pattern
  if (!pBull && cBull && c.open < p.low && c.close > (p.open + p.close) / 2 && c.close < p.open) {
    return "Piercing Pattern";
  }
  // Dark Cloud Cover
  if (pBull && !cBull && c.open > p.high && c.close < (p.open + p.close) / 2 && c.close > p.close) {
    return "Dark Cloud Cover";
  }
  // Harami
  if (c.open > Math.min(p.open, p.close) && c.close < Math.max(p.open, p.close) && cBody < pBody * 0.5) {
    return "Harami";
  }
  return null;
}

// Generate sample candles for demo
function genCandles(count) {
  var candles = [];
  var price = 22400;
  for (var i = 0; i < count; i++) {
    var change = (Math.random() - 0.5) * 120;
    var open = price;
    var close = price + change;
    var high = Math.max(open, close) + Math.random() * 60;
    var low = Math.min(open, close) - Math.random() * 60;
    var vol = Math.floor(50000 + Math.random() * 200000);
    candles.push({ open: parseFloat(open.toFixed(2)), close: parseFloat(close.toFixed(2)), high: parseFloat(high.toFixed(2)), low: parseFloat(low.toFixed(2)), vol: vol, time: new Date(Date.now() - (count - i) * 60000) });
    price = close;
  }
  return candles;
}

var G = "#00C853";
var R = "#EF4444";

//  CANDLE CHART COMPONENT 
function CandleChart({ candles, pattern }) {
  var w = 340; var h = 200;
  var pad = 10;
  var candleW = Math.floor((w - pad * 2) / candles.length) - 2;
  var prices = candles.reduce(function(a, c) { return a.concat([c.high, c.low]); }, []);
  var minP = Math.min.apply(null, prices);
  var maxP = Math.max.apply(null, prices);
  var range = maxP - minP || 1;

  function yPos(price) { return pad + ((maxP - price) / range) * (h - pad * 2); }

  return (
    <svg width={w} height={h} style={{ background: "#0B0B0B", borderRadius: 10, display: "block" }}>
      {candles.map(function(c, i) {
        var x = pad + i * (candleW + 2) + candleW / 2;
        var bull = c.close >= c.open;
        var col = bull ? G : R;
        var bodyTop = yPos(Math.max(c.open, c.close));
        var bodyBot = yPos(Math.min(c.open, c.close));
        var bodyH = Math.max(1, bodyBot - bodyTop);
        var isLast = i == candles.length - 1;
        return (
          <g key={i}>
            <line x1={x} y1={yPos(c.high)} x2={x} y2={yPos(c.low)} stroke={col} strokeWidth={1} />
            <rect x={x - candleW / 2} y={bodyTop} width={candleW} height={bodyH} fill={col} opacity={isLast ? 1 : 0.7} />
            {isLast && pattern && (
              <text x={x} y={bodyTop - 6} textAnchor="middle" fill="#F59E0B" fontSize={8} fontWeight="bold">{pattern.split(" ")[0]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

//  LIVE CANDLE TIMER 
function CandleTimer() {
  var timeframes = [
    { label: "1m", seconds: 60 },
    { label: "3m", seconds: 180 },
    { label: "5m", seconds: 300 },
    { label: "15m", seconds: 900 },
    { label: "30m", seconds: 1800 },
    { label: "1h", seconds: 3600 },
  ];
  var [selected, setSelected] = useState(0);
  var [remaining, setRemaining] = useState(0);

  useEffect(function() {
    function calc() {
      var now = new Date();
      var secs = now.getSeconds() + now.getMinutes() * 60 + now.getHours() * 3600;
      var tf = timeframes[selected].seconds;
      var rem = tf - (secs % tf);
      setRemaining(rem);
    }
    calc();
    var t = setInterval(calc, 1000);
    return function() { clearInterval(t); };
  }, [selected]);

  var mins = Math.floor(remaining / 60);
  var secs = remaining % 60;
  var pct = (1 - remaining / timeframes[selected].seconds) * 100;

  return (
    <div style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Live Candle Timer</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {timeframes.map(function(tf, i) {
          var act = selected == i;
          return (
            <button key={tf.label} onClick={function() { setSelected(i); }} style={{ flex: 1, background: act ? G : "#F3F4F6", border: "none", borderRadius: 8, padding: "6px 2px", color: act ? "#fff" : "#374151", fontSize: 10, fontWeight: act ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
              {tf.label}
            </button>
          );
        })}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 9, color: "#6B7280", marginBottom: 4 }}>Next {timeframes[selected].label} candle in</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: "#111827", letterSpacing: -1, fontFamily: "monospace" }}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
        <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, marginTop: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: pct + "%", background: remaining < 10 ? R : G, borderRadius: 3, transition: "width 1s linear" }}></div>
        </div>
        <div style={{ fontSize: 8, color: "#9CA3AF", marginTop: 4 }}>{pct.toFixed(0)}% elapsed</div>
      </div>
    </div>
  );
}

//  PATTERN DETAIL MODAL 
function PatternDetail({ name, onClose }) {
  var p = PATTERN_LIBRARY[name];
  if (!p) return null;
  var typeColor = p.type == "Bullish" ? G : p.type == "Bearish" ? R : "#F59E0B";
  var typeBg = p.type == "Bullish" ? "#DCFCE7" : p.type == "Bearish" ? "#FEE2E2" : "#FEF3C7";

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: 20, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{name}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <span style={{ background: typeBg, color: typeColor, borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>{p.type}</span>
              <span style={{ background: "#F3F4F6", color: "#374151", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 600 }}>Reliability: {p.reliability}%</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: 10, width: 32, height: 32, fontSize: 16, cursor: "pointer" }}>X</button>
        </div>

        {[
          ["What is it?", p.desc],
          ["Formation", p.formation],
          ["Best works at", p.bestAt],
          ["Volume", p.volume],
          ["Psychology", p.psychology],
        ].map(function(r) {
          return (
            <div key={r[0]} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", marginBottom: 3 }}>{r[0]}</div>
              <div style={{ fontSize: 12, color: "#111827", lineHeight: 1.6 }}>{r[1]}</div>
            </div>
          );
        })}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#166534", marginBottom: 6 }}>Advantages</div>
            {p.advantages.map(function(a) { return <div key={a} style={{ fontSize: 9, color: "#166534", marginBottom: 3 }}>+ {a}</div>; })}
          </div>
          <div style={{ background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#991B1B", marginBottom: 6 }}>Common Mistakes</div>
            {p.mistakes.map(function(m) { return <div key={m} style={{ fontSize: 9, color: "#991B1B", marginBottom: 3 }}>! {m}</div>; })}
          </div>
        </div>

        <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: 10, marginTop: 12 }}>
          <div style={{ fontSize: 8, color: "#92400E" }}>Educational only. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}

//  MAIN CANDLE SCREEN 
export default function CandleScreen() {
  var [candles, setCandles] = useState(function() { return genCandles(20); });
  var [pattern, setPattern] = useState(null);
  var [detail, setDetail] = useState(null);
  var [tf, setTf] = useState("15m");
  var timerRef = useRef(null);

  useEffect(function() {
    var detected = detectPattern(candles);
    setPattern(detected);
  }, [candles]);

  // Simulate live candle update
  useEffect(function() {
    timerRef.current = setInterval(function() {
      setCandles(function(prev) {
        var last = prev[prev.length - 1];
        var change = (Math.random() - 0.5) * 40;
        var newClose = parseFloat((last.close + change).toFixed(2));
        var updated = prev.slice(0, -1).concat([{
          open: last.open, close: newClose,
          high: Math.max(last.high, newClose + Math.random() * 20),
          low: Math.min(last.low, newClose - Math.random() * 20),
          vol: last.vol, time: last.time
        }]);
        return updated;
      });
    }, 2000);
    return function() { clearInterval(timerRef.current); };
  }, []);

  function newCandle() {
    setCandles(function(prev) {
      var last = prev[prev.length - 1];
      var change = (Math.random() - 0.5) * 150;
      var open = last.close;
      var close = parseFloat((open + change).toFixed(2));
      return prev.slice(-19).concat([{
        open: open, close: close,
        high: parseFloat((Math.max(open, close) + Math.random() * 50).toFixed(2)),
        low: parseFloat((Math.min(open, close) - Math.random() * 50).toFixed(2)),
        vol: Math.floor(80000 + Math.random() * 200000),
        time: new Date()
      }]);
    });
  }

  var pData = pattern ? PATTERN_LIBRARY[pattern] : null;
  var typeColor = pData ? (pData.type == "Bullish" ? G : pData.type == "Bearish" ? R : "#F59E0B") : "#6B7280";
  var typeBg = pData ? (pData.type == "Bullish" ? "#DCFCE7" : pData.type == "Bearish" ? "#FEE2E2" : "#FEF3C7") : "#F3F4F6";

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", fontFamily: "Inter,Arial,sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#fff", padding: "14px 16px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>Candle <span style={{ color: G }}>Intelligence</span></div>
          <div style={{ fontSize: 8, color: "#F97316", fontWeight: 700, letterSpacing: 1 }}>100% OFFLINE - INSTANT</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["5m","15m","1h"].map(function(t) {
            return <button key={t} onClick={function(){setTf(t);}} style={{ background: tf==t ? G : "#F3F4F6", border:"none", borderRadius:8, padding:"5px 10px", color:tf==t?"#fff":"#374151", fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{t}</button>;
          })}
        </div>
      </div>

      <div style={{ padding: "14px 14px 80px" }}>

        {/* Live Candle Timer */}
        <CandleTimer />

        {/* Chart */}
        <div style={{ background: "#0B0B0B", borderRadius: 16, padding: 14, marginBottom: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>NIFTY 50</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: G, fontFamily: "monospace" }}>
                {candles[candles.length-1].close.toLocaleString("en-IN")}
              </div>
            </div>
            <button onClick={newCandle} style={{ background: "#1A2A1A", border: "1px solid #00C853", borderRadius: 10, padding: "7px 14px", color: G, fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              + New Candle
            </button>
          </div>
          <CandleChart candles={candles.slice(-15)} pattern={pattern} />
        </div>

        {/* Pattern Detection Result */}
        {pattern ? (
          <div style={{ background: typeBg, border: "1px solid " + typeColor, borderRadius: 16, padding: 16, marginBottom: 14, cursor: "pointer" }} onClick={function() { setDetail(pattern); }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 9, color: typeColor, fontWeight: 700, marginBottom: 3 }}>PATTERN DETECTED - TAP FOR DETAILS</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}>{pattern}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <span style={{ background: typeColor, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>{pData.type}</span>
                  <span style={{ background: "rgba(0,0,0,0.08)", color: "#374151", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 600 }}>{pData.strength}</span>
                  <span style={{ background: "rgba(0,0,0,0.08)", color: "#374151", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 600 }}>{pData.reliability}% reliable</span>
                </div>
              </div>
              <div style={{ fontSize: 28 }}>{pData.type=="Bullish"?"^":pData.type=="Bearish"?"v":"~"}</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: "#374151", lineHeight: 1.6 }}>{pData.desc}</div>
            <div style={{ marginTop: 8, fontSize: 9, color: typeColor, fontWeight: 600 }}>Volume: {pData.volume}</div>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 16, padding: 16, marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#6B7280" }}>No pattern detected on last candle</div>
            <div style={{ fontSize: 9, color: "#9CA3AF", marginTop: 3 }}>Tap + New Candle to simulate</div>
          </div>
        )}

        {/* Pattern Library */}
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Candle Pattern Library</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {Object.keys(PATTERN_LIBRARY).map(function(name) {
            var p = PATTERN_LIBRARY[name];
            var tc = p.type=="Bullish"?G:p.type=="Bearish"?R:"#F59E0B";
            var tb = p.type=="Bullish"?"#F0FDF4":p.type=="Bearish"?"#FFF1F2":"#FFFBEB";
            return (
              <div key={name} style={{ background: tb, border: "1px solid " + (p.type=="Bullish"?"#BBF7D0":p.type=="Bearish"?"#FECDD3":"#FDE68A"), borderRadius: 12, padding: 12, cursor: "pointer" }} onClick={function() { setDetail(name); }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#111827", marginBottom: 3 }}>{name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 8, color: tc, fontWeight: 700 }}>{p.type}</span>
                  <span style={{ fontSize: 8, color: "#6B7280" }}>{p.reliability}%</span>
                </div>
                <div style={{ fontSize: 8, color: "#6B7280", marginTop: 3, lineHeight: 1.4 }}>{p.desc.slice(0, 50)}...</div>
              </div>
            );
          })}
        </div>

      </div>

      {detail && <PatternDetail name={detail} onClose={function() { setDetail(null); }} />}

    </div>
  );
}
