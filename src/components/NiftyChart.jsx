import { useEffect, useRef, useState } from "react";

var CARD = "#101B2E";
var CARD2 = "#0D1829";
var BD = "#1E3A5F";
var UP = "#22C55E";
var DOWN = "#EF4444";
var BLUE = "#3B82F6";
var BLUE2 = "#60A5FA";
var T1 = "#FFFFFF";
var T2 = "#94A3B8";
var T3 = "#475569";
var GOLD = "#F59E0B";

var TF_CFG = {
  "1m":  { range:"1d",   interval:"1m",  secs:60    },
  "2m":  { range:"5d",   interval:"2m",  secs:120   },
  "3m":  { range:"5d",   interval:"5m",  secs:180   },
  "5m":  { range:"5d",   interval:"5m",  secs:300   },
  "15m": { range:"1mo",  interval:"15m", secs:900   },
  "30m": { range:"1mo",  interval:"30m", secs:1800  },
  "1H":  { range:"3mo",  interval:"60m", secs:3600  },
  "1D":  { range:"1y",   interval:"1d",  secs:86400 },
  "1W":  { range:"5y",   interval:"1wk", secs:604800},
};
var TF_LIST = ["1m","2m","3m","5m","15m","30m","1H","1D","1W"];

function loadLWC(cb) {
  if (window.LightweightCharts) { cb(); return; }
  var s = document.createElement("script");
  s.src = "https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js";
  s.onload = function() { cb(); };
  s.onerror = function() { cb(new Error("failed")); };
  document.head.appendChild(s);
}

function genMock(tf, ltp) {
  var cfg = TF_CFG[tf] || TF_CFG["15m"];
  var now = Math.floor(Date.now() / 1000);
  var base = ltp || 23850;
  var arr = [];
  var count = 120;
  for (var i = 0; i < count; i++) {
    var chg = (Math.random() - 0.48) * base * 0.004;
    var o = parseFloat(base.toFixed(2));
    var c = parseFloat((base + chg).toFixed(2));
    var h = parseFloat((Math.max(o, c) + Math.random() * base * 0.0015).toFixed(2));
    var l = parseFloat((Math.min(o, c) - Math.random() * base * 0.0015).toFixed(2));
    arr.push({ time: now - (count - i) * cfg.secs, open: o, high: h, low: l, close: c, volume: Math.floor(50000 + Math.random() * 500000) });
    base = c;
  }
  arr[arr.length - 1].close = ltp || arr[arr.length - 1].close;
  return arr;
}

function pad(n) { return n < 10 ? "0" + n : "" + n; }

function fmtTime(secs) {
  var h = Math.floor(secs / 3600);
  var m = Math.floor((secs % 3600) / 60);
  var s = secs % 60;
  if (h > 0) return pad(h) + ":" + pad(m) + ":" + pad(s);
  return pad(m) + ":" + pad(s);
}

function fmtN(n) {
  if (n == null || isNaN(n)) return "--";
  return n.toLocaleString("en-IN", { minimumFractionDigits:2, maximumFractionDigits:2 });
}

function fmtVol(v) {
  if (!v) return "--";
  if (v >= 10000000) return (v / 10000000).toFixed(1) + " Cr";
  if (v >= 100000) return (v / 100000).toFixed(1) + " L";
  if (v >= 1000) return (v / 1000).toFixed(0) + "K";
  return "" + v;
}

export default function NiftyChart() {
  var chartRef = useRef(null);
  var chartObj = useRef(null);
  var candleRef = useRef(null);
  var volRef = useRef(null);
  var ltpRef = useRef(null);

  var [tf, setTf] = useState("15m");
  var [loading, setLoading] = useState(true);
  var [err, setErr] = useState(null);
  var [ltp, setLtp] = useState(0);
  var [prevClose, setPrevClose] = useState(0);
  var [candleStats, setCandleStats] = useState({ open:0, high:0, low:0, close:0, vol:0, todayHigh:0, todayLow:0 });
  var [countdown, setCountdown] = useState(0);

  function calcTimer(timeframe) {
    var cfg = TF_CFG[timeframe] || TF_CFG["15m"];
    var nowSec = Math.floor(Date.now() / 1000);
    var elapsed = nowSec % cfg.secs;
    return cfg.secs - elapsed - 1;
  }

  function applyCandles(arr, timeframe) {
    if (!arr || arr.length < 2) return;
    var last = arr[arr.length - 1];
    var todaySlice = arr.slice(-78);
    setCandleStats({
      open: last.open,
      high: last.high,
      low: last.low,
      close: last.close,
      vol: last.volume || 0,
      todayHigh: Math.max.apply(null, todaySlice.map(function(c){ return c.high; })),
      todayLow: Math.min.apply(null, todaySlice.map(function(c){ return c.low; })),
    });
    if (candleRef.current) {
      candleRef.current.setData(arr.map(function(c) {
        return { time: c.time, open: c.open, high: c.high, low: c.low, close: c.close };
      }));
    }
    if (volRef.current) {
      volRef.current.setData(arr.map(function(c) {
        return { time: c.time, value: c.volume || 0, color: c.close >= c.open ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)" };
      }));
    }
    if (chartObj.current) chartObj.current.timeScale().fitContent();
    setCountdown(calcTimer(timeframe));
    setLoading(false);
  }

  function fetchLTP() {
    return fetch("/api/history?symbol=%5ENSEI&range=1d&interval=1m")
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.candles && d.candles.length > 1) {
          var arr = d.candles;
          var last = arr[arr.length - 1];
          var prev = arr[0];
          var liveLtp = last.close;
          var pc = prev.open;
          ltpRef.current = liveLtp;
          setLtp(liveLtp);
          setPrevClose(pc);
          return liveLtp;
        }
        return ltpRef.current || 23850;
      })
      .catch(function() {
        return ltpRef.current || 23850;
      });
  }

  function fetchCandles(timeframe, liveLtp) {
    setLoading(true);
    setErr(null);
    var cfg = TF_CFG[timeframe] || TF_CFG["15m"];
    return fetch("/api/history?symbol=%5ENSEI&range=" + cfg.range + "&interval=" + cfg.interval)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var arr = (d.candles && d.candles.length > 5) ? d.candles : genMock(timeframe, liveLtp);
        if (arr.length > 0 && liveLtp) {
          arr[arr.length - 1].close = liveLtp;
        }
        applyCandles(arr, timeframe);
      })
      .catch(function() {
        applyCandles(genMock(timeframe, liveLtp), timeframe);
      });
  }

  useEffect(function() {
    loadLWC(function(e) {
      if (e || !window.LightweightCharts) {
        setErr("Chart library failed to load");
        setLoading(false);
        return;
      }
      if (!chartRef.current) return;

      var chart = window.LightweightCharts.createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height: 255,
        layout: { background: { color: CARD }, textColor: T2, fontFamily: "Inter,Arial,sans-serif" },
        grid: { vertLines: { color: "rgba(30,58,95,0.5)" }, horzLines: { color: "rgba(30,58,95,0.5)" } },
        crosshair: { mode: 1, vertLine: { color: BLUE2, labelBackgroundColor: BLUE }, horzLine: { color: BLUE2, labelBackgroundColor: BLUE } },
        rightPriceScale: { borderColor: BD },
        timeScale: { borderColor: BD, timeVisible: true, secondsVisible: false, rightOffset: 4 },
        handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true },
        handleScale: { mouseWheel: true, pinch: true },
      });

      var candle = chart.addCandlestickSeries({
        upColor: UP, downColor: DOWN,
        borderUpColor: UP, borderDownColor: DOWN,
        wickUpColor: UP, wickDownColor: DOWN,
      });

      var vol = chart.addHistogramSeries({
        priceFormat: { type: "volume" },
        priceScaleId: "vol",
      });
      chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });

      chartObj.current = chart;
      candleRef.current = candle;
      volRef.current = vol;

      var ro = new ResizeObserver(function() {
        if (chartRef.current && chartObj.current) {
          chartObj.current.applyOptions({ width: chartRef.current.clientWidth });
        }
      });
      ro.observe(chartRef.current);

      fetchLTP().then(function(liveLtp) {
        fetchCandles("15m", liveLtp);
      });

      return function() { ro.disconnect(); chart.remove(); };
    });
  }, []);

  useEffect(function() {
    if (!candleRef.current) return;
    fetchLTP().then(function(liveLtp) {
      fetchCandles(tf, liveLtp);
    });
  }, [tf]);

  useEffect(function() {
    if (!countdown) return;
    var t = setInterval(function() {
      setCountdown(function(prev) {
        if (prev <= 0) {
          var fresh = calcTimer(tf);
          fetchLTP().then(function(liveLtp) { fetchCandles(tf, liveLtp); });
          return fresh;
        }
        return prev - 1;
      });
    }, 1000);
    return function() { clearInterval(t); };
  }, [countdown, tf]);

  var chg = ltp - prevClose;
  var chgPct = prevClose > 0 ? (chg / prevClose) * 100 : 0;
  var up = chg >= 0;

  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",marginBottom:14}}>

      {/* Top bar — LTP always fixed regardless of TF */}
      <div style={{background:CARD2,padding:"10px 14px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:up?UP:DOWN,boxShadow:"0 0 7px "+(up?UP:DOWN)}}></div>
            <span style={{fontSize:11,fontWeight:900,color:T1}}>NIFTY 50</span>
            <span style={{fontSize:8,color:T3,background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:5,padding:"1px 5px"}}>NSE India</span>
          </div>
          <div style={{fontSize:22,fontWeight:900,color:T1,fontFamily:"monospace",letterSpacing:-0.5}}>
            {ltp > 0 ? fmtN(ltp) : "---"}
          </div>
          <div style={{fontSize:9,fontWeight:700,color:up?UP:DOWN,marginTop:2}}>
            {ltp > 0 ? (up?"+":"") + fmtN(chg) + " (" + (up?"+":"") + chgPct.toFixed(2) + "%)" : ""}
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:7,color:T3,marginBottom:1}}>PREV CLOSE</div>
          <div style={{fontSize:11,fontWeight:700,color:T2,fontFamily:"monospace"}}>{fmtN(prevClose)}</div>
          {loading && (
            <div style={{marginTop:6,display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end"}}>
              <div style={{width:10,height:10,border:"2px solid "+BD,borderTopColor:BLUE,borderRadius:"50%",animation:"ncspin 0.7s linear infinite"}}></div>
              <span style={{fontSize:7,color:T3}}>Loading</span>
            </div>
          )}
        </div>
      </div>

      {/* TF row + Timer */}
      <div style={{padding:"7px 14px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {TF_LIST.map(function(t) {
            var act = tf == t;
            return (
              <button key={t} onClick={function(){ if (!loading) setTf(t); }} style={{background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:6,padding:"3px 9px",color:act?"#fff":T2,fontSize:9,fontWeight:act?700:400,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}}>
                {t}
              </button>
            );
          })}
        </div>
        <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:8,padding:"4px 10px",flexShrink:0,textAlign:"center"}}>
          <div style={{fontSize:6,color:T3,letterSpacing:0.5,marginBottom:1}}>NEXT CANDLE</div>
          <div style={{fontSize:13,fontWeight:900,color:GOLD,fontFamily:"monospace"}}>{fmtTime(countdown)}</div>
        </div>
      </div>

      {/* Chart + Right panel */}
      <div style={{display:"flex"}}>

        <div style={{flex:1,minWidth:0,position:"relative"}}>
          <div ref={chartRef} style={{width:"100%",height:255}}/>
          {err && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(7,17,31,0.9)"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:9,color:DOWN,marginBottom:6}}>{err}</div>
                <button onClick={function(){fetchLTP().then(function(l){fetchCandles(tf,l);});}} style={{background:BLUE,border:"none",borderRadius:8,padding:"5px 14px",color:"#fff",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Retry</button>
              </div>
            </div>
          )}
        </div>

        {/* Right stats — candle OHLCV */}
        <div style={{width:88,background:CARD2,borderLeft:"1px solid "+BD,padding:"8px 8px",display:"flex",flexDirection:"column",gap:5,flexShrink:0}}>
          {[
            ["Open",      candleStats.open,      T1   ],
            ["High",      candleStats.high,      UP   ],
            ["Low",       candleStats.low,       DOWN ],
            ["Close",     candleStats.close,     T1   ],
            ["T.High",    candleStats.todayHigh, UP   ],
            ["T.Low",     candleStats.todayLow,  DOWN ],
          ].map(function(row) {
            return (
              <div key={row[0]} style={{borderBottom:"1px solid rgba(30,58,95,0.4)",paddingBottom:4}}>
                <div style={{fontSize:7,color:T3}}>{row[0]}</div>
                <div style={{fontSize:9,fontWeight:700,color:row[2],fontFamily:"monospace"}}>{fmtN(row[1])}</div>
              </div>
            );
          })}
          <div>
            <div style={{fontSize:7,color:T3,marginBottom:1}}>Volume</div>
            <div style={{fontSize:9,fontWeight:700,color:BLUE2,fontFamily:"monospace"}}>{fmtVol(candleStats.vol)}</div>
          </div>
        </div>
      </div>

      <style>{"@keyframes ncspin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
