import { useState, useEffect, useRef, useCallback } from "react";

var G = "#00C853";
var R = "#EF4444";
var GOLD = "#F59E0B";

// Generate candle data
function genCandles(count, base) {
  var price = base || 22400;
  var candles = [];
  for (var i = 0; i < count; i++) {
    var chg = (Math.random() - 0.48) * 80;
    var open = price;
    var close = parseFloat((open + chg).toFixed(2));
    var high = parseFloat((Math.max(open, close) + Math.random() * 40).toFixed(2));
    var low = parseFloat((Math.min(open, close) - Math.random() * 40).toFixed(2));
    var vol = Math.floor(100000 + Math.random() * 500000);
    candles.push({ open, close, high, low, vol, time: new Date(Date.now() - (count - i) * 60000) });
    price = close;
  }
  return candles;
}

export default function ChartEngine() {
  var [candles, setCandles] = useState(function() { return genCandles(60); });
  var [offset, setOffset] = useState(0);
  var [scale, setScale] = useState(1);
  var [crosshair, setCrosshair] = useState(null);
  var [fullscreen, setFullscreen] = useState(false);
  var [tf, setTf] = useState("5m");
  var [showVol, setShowVol] = useState(true);
  var canvasRef = useRef(null);
  var containerRef = useRef(null);
  var touchRef = useRef({ startX: 0, startY: 0, lastDist: 0, isDragging: false });
  var animRef = useRef(null);
  var lastRender = useRef(0);

  var TFS = ["1m","3m","5m","15m","30m","1h","1d"];

  // 60 FPS render with requestAnimationFrame
  var draw = useCallback(function() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = showVol ? canvas.height * 0.78 : canvas.height - 20;
    var VH = canvas.height * 0.18;
    var VY = canvas.height * 0.80;

    // Clear
    ctx.fillStyle = "#0B0B0B";
    ctx.fillRect(0, 0, W, canvas.height);

    // Grid lines
    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 1;
    for (var gi = 0; gi < 6; gi++) {
      var gy = (H / 6) * gi + 10;
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }

    // Candle dimensions
    var visible = Math.floor(30 / scale);
    var startIdx = Math.max(0, candles.length - visible - Math.floor(offset));
    var endIdx = Math.min(candles.length, startIdx + visible);
    var visCandles = candles.slice(startIdx, endIdx);
    if (!visCandles.length) return;

    var prices = visCandles.reduce(function(a, c) { return a.concat([c.high, c.low]); }, []);
    var minP = Math.min.apply(null, prices);
    var maxP = Math.max.apply(null, prices);
    var range = maxP - minP || 1;
    var pad = range * 0.1;
    minP -= pad; maxP += pad; range = maxP - minP;

    var cw = Math.max(3, Math.floor((W - 50) / visCandles.length));
    var gap = Math.max(1, Math.floor(cw * 0.2));
    var bw = cw - gap;

    function yP(price) { return H - ((price - minP) / range) * (H - 20) + 5; }

    // Volume bars
    if (showVol) {
      var maxVol = Math.max.apply(null, visCandles.map(function(c) { return c.vol; }));
      visCandles.forEach(function(c, i) {
        var x = i * cw + gap;
        var bull = c.close >= c.open;
        var vh = (c.vol / maxVol) * VH;
        ctx.fillStyle = bull ? "rgba(0,200,83,0.4)" : "rgba(239,68,68,0.4)";
        ctx.fillRect(x, VY + VH - vh, bw, vh);
      });
    }

    // Price labels
    ctx.fillStyle = "#555";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    for (var pi = 0; pi <= 4; pi++) {
      var pval = minP + (range / 4) * pi;
      var py = yP(pval);
      ctx.fillText(pval.toFixed(0), W - 2, py + 3);
    }

    // Candles
    visCandles.forEach(function(c, i) {
      var bull = c.close >= c.open;
      var col = bull ? G : R;
      var x = i * cw + gap + bw / 2;
      var bodyTop = yP(Math.max(c.open, c.close));
      var bodyBot = yP(Math.min(c.open, c.close));
      var bodyH = Math.max(2, bodyBot - bodyTop);

      // Wick
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, yP(c.high));
      ctx.lineTo(x, yP(c.low));
      ctx.stroke();

      // Body
      ctx.fillStyle = col;
      ctx.fillRect(i * cw + gap, bodyTop, bw, bodyH);
    });

    // Crosshair
    if (crosshair) {
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(crosshair.x, 0); ctx.lineTo(crosshair.x, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, crosshair.y); ctx.lineTo(W, crosshair.y); ctx.stroke();
      ctx.setLineDash([]);

      // Price label on crosshair
      var priceAtY = maxP - ((crosshair.y - 5) / (H - 20)) * range;
      ctx.fillStyle = GOLD;
      ctx.fillRect(W - 52, crosshair.y - 9, 50, 16);
      ctx.fillStyle = "#000";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "right";
      ctx.fillText(priceAtY.toFixed(2), W - 4, crosshair.y + 3);
    }

    // Current price line
    var lastC = visCandles[visCandles.length - 1];
    if (lastC) {
      var lpy = yP(lastC.close);
      ctx.strokeStyle = lastC.close >= lastC.open ? G : R;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(0, lpy); ctx.lineTo(W - 55, lpy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = lastC.close >= lastC.open ? G : R;
      ctx.fillRect(W - 52, lpy - 9, 50, 16);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "right";
      ctx.fillText(lastC.close.toFixed(2), W - 4, lpy + 3);
    }
  }, [candles, offset, scale, crosshair, showVol]);

  // Animate at 60fps
  useEffect(function() {
    function frame(ts) {
      if (ts - lastRender.current > 16) { // ~60fps
        draw();
        lastRender.current = ts;
      }
      animRef.current = requestAnimationFrame(frame);
    }
    animRef.current = requestAnimationFrame(frame);
    return function() { cancelAnimationFrame(animRef.current); };
  }, [draw]);

  // Touch handlers
  function onTouchStart(e) {
    if (e.touches.length == 2) {
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      touchRef.current.lastDist = Math.sqrt(dx*dx + dy*dy);
    } else {
      touchRef.current.startX = e.touches[0].clientX;
      touchRef.current.isDragging = true;
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length == 2) {
      // Pinch zoom
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      var dist = Math.sqrt(dx*dx + dy*dy);
      var delta = dist - touchRef.current.lastDist;
      setScale(function(s) { return Math.max(0.5, Math.min(4, s + delta * 0.01)); });
      touchRef.current.lastDist = dist;
    } else if (touchRef.current.isDragging) {
      // Drag scroll
      var diffX = e.touches[0].clientX - touchRef.current.startX;
      setOffset(function(o) { return Math.max(0, Math.min(candles.length - 10, o - diffX * 0.2)); });
      touchRef.current.startX = e.touches[0].clientX;
    }
  }

  function onTouchEnd() { touchRef.current.isDragging = false; }

  function onMouseMove(e) {
    var rect = canvasRef.current.getBoundingClientRect();
    setCrosshair({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function onMouseLeave() { setCrosshair(null); }

  function onWheel(e) {
    e.preventDefault();
    setScale(function(s) { return Math.max(0.5, Math.min(4, s - e.deltaY * 0.002)); });
  }

  function onDblTap() { setScale(1); setOffset(0); }

  // Live candle update
  useEffect(function() {
    var t = setInterval(function() {
      setCandles(function(prev) {
        var last = prev[prev.length - 1];
        var chg = (Math.random() - 0.5) * 15;
        var newClose = parseFloat((last.close + chg).toFixed(2));
        var updated = prev.slice(0, -1).concat([{
          open: last.open, high: last.high, low: last.low, vol: last.vol, time: last.time,
          close: newClose,
          high: Math.max(last.high, newClose),
          low: Math.min(last.low, newClose),
        }]);
        return updated;
      });
    }, 1000);
    return function() { clearInterval(t); };
  }, []);

  // Candle timer
  var [timerSecs, setTimerSecs] = useState(0);
  var TF_SECS = {"1m":60,"3m":180,"5m":300,"15m":900,"30m":1800,"1h":3600};
  useEffect(function() {
    function calc() {
      var now = new Date();
      var s = now.getSeconds() + now.getMinutes()*60 + now.getHours()*3600;
      var tf_s = TF_SECS[tf] || 300;
      setTimerSecs(tf_s - (s % tf_s));
    }
    calc();
    var t = setInterval(calc, 1000);
    return function() { clearInterval(t); };
  }, [tf]);

  var timerM = Math.floor(timerSecs / 60);
  var timerS = timerSecs % 60;
  var timerPct = (1 - timerSecs / (TF_SECS[tf]||300)) * 100;
  var lastCandle = candles[candles.length - 1];
  var chgAmt = lastCandle.close - lastCandle.open;
  var chgPct = (chgAmt / lastCandle.open) * 100;
  var bull = lastCandle.close >= lastCandle.open;

  var chartH = fullscreen ? window.innerHeight - 160 : 280;

  return (
    <div style={{ background: "#0B0B0B", minHeight: "100vh", color: "#fff", fontFamily: "Inter,Arial,sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#111", padding: "10px 14px", borderBottom: "1px solid #1E1E1E", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>NIFTY <span style={{ color: G }}>50</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 900, fontFamily: "monospace", color: bull ? G : R }}>{lastCandle.close.toLocaleString("en-IN")}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: bull ? G : R }}>{bull?"+":""}{chgAmt.toFixed(2)} ({bull?"+":""}{chgPct.toFixed(2)}%)</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={function(){setShowVol(!showVol);}} style={{ background: showVol?"#1A2A1A":"#222", border:"1px solid "+(showVol?G:"#333"), borderRadius:8, padding:"5px 8px", color:showVol?G:"#888", fontSize:9, cursor:"pointer", fontFamily:"inherit" }}>VOL</button>
          <button onClick={function(){setFullscreen(!fullscreen);}} style={{ background:"#222", border:"1px solid #333", borderRadius:8, padding:"5px 8px", color:"#888", fontSize:9, cursor:"pointer", fontFamily:"inherit" }}>{fullscreen?"EXIT":"FULL"}</button>
        </div>
      </div>

      {/* Timeframe */}
      <div style={{ display: "flex", background: "#111", borderBottom: "1px solid #1A1A1A", padding: "6px 10px", gap: 4 }}>
        {TFS.map(function(t) {
          return <button key={t} onClick={function(){setTf(t);}} style={{ flex:1, background:tf==t?"#1A2A1A":"transparent", border:"none", borderRadius:6, padding:"5px 2px", color:tf==t?G:"#666", fontSize:9, fontWeight:tf==t?700:400, cursor:"pointer", fontFamily:"inherit" }}>{t}</button>;
        })}
      </div>

      {/* Candle Timer */}
      <div style={{ background: "#111", padding: "6px 14px", borderBottom: "1px solid #1A1A1A", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 9, color: "#555" }}>Next {tf} candle:</div>
        <div style={{ fontSize: 16, fontWeight: 900, fontFamily: "monospace", color: timerSecs < 10 ? R : GOLD }}>
          {String(timerM).padStart(2,"0")}:{String(timerS).padStart(2,"0")}
        </div>
        <div style={{ flex: 1, height: 4, background: "#1A1A1A", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: timerPct+"%", background: timerSecs < 10 ? R : G, borderRadius: 2, transition: "width 1s linear" }}></div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={containerRef} style={{ position: "relative", touchAction: "none" }}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
        onWheel={onWheel} onDoubleClick={onDblTap}>
        <canvas ref={canvasRef} width={window.innerWidth > 430 ? 430 : window.innerWidth} height={chartH} style={{ display: "block", width: "100%" }}/>
      </div>

      {/* Controls */}
      <div style={{ background: "#111", padding: "8px 14px", borderTop: "1px solid #1A1A1A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 8, color: "#555" }}>Pinch: Zoom | Drag: Scroll | 2x Tap: Reset</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={function(){setScale(function(s){return Math.min(4,s+0.3);});}} style={{ background:"#1A1A1A", border:"1px solid #333", borderRadius:6, padding:"4px 10px", color:"#fff", fontSize:12, cursor:"pointer" }}>+</button>
          <button onClick={function(){setScale(1);setOffset(0);}} style={{ background:"#1A1A1A", border:"1px solid #333", borderRadius:6, padding:"4px 10px", color:"#888", fontSize:9, cursor:"pointer" }}>Reset</button>
          <button onClick={function(){setScale(function(s){return Math.max(0.5,s-0.3);});}} style={{ background:"#1A1A1A", border:"1px solid #333", borderRadius:6, padding:"4px 10px", color:"#fff", fontSize:12, cursor:"pointer" }}>-</button>
        </div>
      </div>

      {/* OHLCV */}
      <div style={{ background: "#111", padding: "10px 14px", display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4, borderBottom: "1px solid #1A1A1A" }}>
        {[["O", lastCandle.open], ["H", lastCandle.high], ["L", lastCandle.low], ["C", lastCandle.close], ["V", (lastCandle.vol/100000).toFixed(1)+"L"]].map(function(r) {
          return (
            <div key={r[0]} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 7, color: "#555" }}>{r[0]}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: r[0]=="H"?G:r[0]=="L"?R:"#fff", fontFamily:"monospace" }}>{r[1]}</div>
            </div>
          );
        })}
      </div>

      {/* Gesture Guide */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            ["Pinch In/Out", "Zoom In/Out"],
            ["Drag Left/Right", "Scroll Candles"],
            ["Double Tap", "Reset View"],
            ["Mouse Wheel", "Zoom (Desktop)"],
          ].map(function(r) {
            return (
              <div key={r[0]} style={{ background: "#161616", border: "1px solid #222", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: GOLD }}>{r[0]}</div>
                <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>{r[1]}</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
  }
                       
