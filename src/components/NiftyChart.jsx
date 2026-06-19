import { useEffect, useRef, useState } from "react";

var BG = "#07111F";
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
  "1m":  { label:"1m",  range:"1d",    interval:"1m",  secs:60    },
  "2m":  { label:"2m",  range:"5d",    interval:"2m",  secs:120   },
  "3m":  { label:"3m",  range:"5d",    interval:"5m",  secs:180   },
  "5m":  { label:"5m",  range:"5d",    interval:"5m",  secs:300   },
  "15m": { label:"15m", range:"1mo",   interval:"15m", secs:900   },
  "30m": { label:"30m", range:"1mo",   interval:"30m", secs:1800  },
  "1H":  { label:"1H",  range:"3mo",   interval:"60m", secs:3600  },
  "1D":  { label:"1D",  range:"1y",    interval:"1d",  secs:86400 },
};

var TF_LIST = ["1m","2m","3m","5m","15m","30m","1H","1D"];

function loadLWC(cb) {
  if (window.LightweightCharts) { cb(); return; }
  var s = document.createElement("script");
  s.src = "https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js";
  s.onload = function() { cb(); };
  s.onerror = function() { cb(new Error("failed")); };
  document.head.appendChild(s);
}

function genMock(tf) {
  var cfg = TF_CFG[tf] || TF_CFG["15m"];
  var now = Math.floor(Date.now() / 1000);
  var count = 120;
  var arr = [];
  var base = 23800 + Math.random() * 200;
  for (var i = 0; i < count; i++) {
    var chg = (Math.random() - 0.48) * base * 0.004;
    var o = parseFloat(base.toFixed(2));
    var c = parseFloat((base + chg).toFixed(2));
    var h = parseFloat((Math.max(o, c) + Math.random() * base * 0.002).toFixed(2));
    var l = parseFloat((Math.min(o, c) - Math.random() * base * 0.002).toFixed(2));
    var v = Math.floor(100000 + Math.random() * 900000);
    arr.push({ time: now - (count - i) * cfg.secs, open: o, high: h, low: l, close: c, volume: v });
    base = c;
  }
  return arr;
}

function fmtTime(secs) {
  var h = Math.floor(secs / 3600);
  var m = Math.floor((secs % 3600) / 60);
  var s = secs % 60;
  if (h > 0) return pad(h) + ":" + pad(m) + ":" + pad(s);
  return pad(m) + ":" + pad(s);
}

function pad(n) { return n < 10 ? "0" + n : "" + n; }

function fmtNum(n, dec) {
  if (!n && n !== 0) return "--";
  return n.toLocaleString("en-IN", { minimumFractionDigits: dec || 2, maximumFractionDigits: dec || 2 });
}

function fmtVol(v) {
  if (!v) return "--";
  if (v >= 10000000) return (v / 10000000).toFixed(2) + " Cr";
  if (v >= 100000) return (v / 100000).toFixed(2) + " L";
  if (v >= 1000) return (v / 1000).toFixed(1) + "K";
  return "" + v;
}

export default function NiftyChart() {
  var chartRef = useRef(null);
  var chartObj = useRef(null);
  var candleSeries = useRef(null);
  var volSeries = useRef(null);

  var [tf, setTf] = useState("15m");
  var [loading, setLoading] = useState(true);
  var [err, setErr] = useState(null);
  var [countdown, setCountdown] = useState(0);
  var [candles, setCandles] = useState([]);
  var [stats, setStats] = useState({
    price: 0, open: 0, high: 0, low: 0, close: 0, vol: 0,
    chg: 0, chgPct: 0, up: true,
    todayHigh: 0, todayLow: 0, prevClose: 0,
  });

  function calcStats(arr) {
    if (!arr || arr.length < 2) return;
    var last = arr[arr.length - 1];
    var prev = arr[arr.length - 2];
    var todayCandles = arr.slice(-78);
    var todayHigh = Math.max.apply(null, todayCandles.map(function(c){ return c.high; }));
    var todayLow  = Math.min.apply(null, todayCandles.map(function(c){ return c.low; }));
    var chg = last.close - prev.close;
    var chgPct = prev.close ? (chg / prev.close) * 100 : 0;
    setStats({
      price: last.close, open: last.open, high: last.high, low: last.low,
      close: last.close, vol: last.volume || 0,
      chg: chg, chgPct: chgPct, up: chg >= 0,
      todayHigh: todayHigh, todayLow: todayLow, prevClose: prev.close,
    });
  }

  function fetchData(timeframe) {
    setLoading(true);
    setErr(null);
    var cfg = TF_CFG[timeframe];
    fetch("/api/history?symbol=%5ENSEI&range=" + cfg.range + "&interval=" + cfg.interval)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var arr = (data.candles && data.candles.length > 5) ? data.candles : genMock(timeframe);
        setCandles(arr);
        calcStats(arr);
        if (candleSeries.current) {
          candleSeries.current.setData(arr.map(function(c) {
            return { time: c.time, open: c.open, high: c.high, low: c.low, close: c.close };
          }));
          if (volSeries.current) {
            volSeries.current.setData(arr.map(function(c) {
              return { time: c.time, value: c.volume || 0, color: c.close >= c.open ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)" };
            }));
          }
          if (chartObj.current) chartObj.current.timeScale().fitContent();
        }
        var nowSec = Math.floor(Date.now() / 1000);
        var remaining = cfg.secs - (nowSec % cfg.secs);
        setCountdown(remaining);
        setLoading(false);
      })
      .catch(function() {
        var arr = genMock(timeframe);
        setCandles(arr);
        calcStats(arr);
        if (candleSeries.current) {
          candleSeries.current.setData(arr.map(function(c) {
            return { time: c.time, open: c.open, high: c.high, low: c.low, close: c.close };
          }));
          if (volSeries.current) {
            volSeries.current.setData(arr.map(function(c) {
              return { time: c.time, value: c.volume || 0, color: c.close >= c.open ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)" };
            }));
          }
          if (chartObj.current) chartObj.current.timeScale().fitContent();
        }
        var nowSec = Math.floor(Date.now() / 1000);
        var cfg2 = TF_CFG[timeframe];
        setCountdown(cfg2.secs - (nowSec % cfg2.secs));
        setLoading(false);
      });
  }

  useEffect(function() {
    loadLWC(function(e) {
      if (e || !window.LightweightCharts) {
        setErr("Chart library failed. Check internet.");
        setLoading(false);
        return;
      }
      if (!chartRef.current) return;

      var chart = window.LightweightCharts.createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height: 260,
        layout: { background: { color: CARD }, textColor: T2, fontFamily: "Inter,Arial,sans-serif" },
        grid: { vertLines: { color: "rgba(30,58,95,0.6)" }, horzLines: { color: "rgba(30,58,95,0.6)" } },
        crosshair: { mode: 1, vertLine: { color: BLUE2, labelBackgroundColor: BLUE }, horzLine: { color: BLUE2, labelBackgroundColor: BLUE } },
        rightPriceScale: { borderColor: BD, textColor: T2 },
        timeScale: { borderColor: BD, timeVisible: true, secondsVisible: false, rightOffset: 5 },
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
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

      chartObj.current = chart;
      candleSeries.current = candle;
      volSeries.current = vol;

      var ro = new ResizeObserver(function() {
        if (chartRef.current && chartObj.current) {
          chartObj.current.applyOptions({ width: chartRef.current.clientWidth });
        }
      });
      ro.observe(chartRef.current);

      fetchData("15m");

      return function() { ro.disconnect(); chart.remove(); };
    });
  }, []);

  useEffect(function() {
    if (candleSeries.current) fetchData(tf);
  }, [tf]);

  useEffect(function() {
    if (countdown <= 0) return;
    var t = setInterval(function() {
      setCountdown(function(prev) {
        if (prev <= 1) {
          var cfg = TF_CFG[tf];
          return cfg ? cfg.secs : 60;
        }
        return prev - 1;
      });
    }, 1000);
    return function() { clearInterval(t); };
  }, [countdown, tf]);

  var s = stats;

  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",marginBottom:14}}>

      {/* Top bar */}
      <div style={{background:CARD2,padding:"10px 14px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:s.up?UP:DOWN,boxShadow:"0 0 8px "+(s.up?UP:DOWN)}}></div>
          <span style={{fontSize:12,fontWeight:900,color:T1}}>NIFTY 50</span>
          <span style={{fontSize:8,color:T3,background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:6,padding:"2px 6px"}}>NSE India</span>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:18,fontWeight:900,color:T1,fontFamily:"monospace"}}>{fmtNum(s.price)}</div>
          <div style={{fontSize:9,fontWeight:700,color:s.up?UP:DOWN}}>{s.up?"+":""}{fmtNum(s.chg)} ({s.up?"+":""}{fmtNum(s.chgPct)}%)</div>
        </div>
      </div>

      {/* Timeframe + Timer row */}
      <div style={{padding:"8px 14px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {TF_LIST.map(function(t) {
            var act = tf == t;
            return (
              <button key={t} onClick={function(){ setTf(t); }} style={{background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:6,padding:"3px 9px",color:act?"#fff":T2,fontSize:9,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
                {t}
              </button>
            );
          })}
        </div>
        <div style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:8,padding:"4px 10px",textAlign:"center",flexShrink:0}}>
          <div style={{fontSize:7,color:T3,marginBottom:1,letterSpacing:0.5}}>NEXT CANDLE</div>
          <div style={{fontSize:12,fontWeight:900,color:GOLD,fontFamily:"monospace"}}>{fmtTime(countdown)}</div>
        </div>
      </div>

      {/* Chart + Stats side panel */}
      <div style={{display:"flex",gap:0}}>

        {/* Chart area */}
        <div style={{flex:1,minWidth:0,position:"relative"}}>
          <div ref={chartRef} style={{width:"100%",height:260}}/>
          {loading && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(7,17,31,0.75)",backdropFilter:"blur(2px)"}}>
              <div>
                <div style={{width:20,height:20,border:"2px solid "+BD,borderTopColor:BLUE,borderRadius:"50%",margin:"0 auto 6px",animation:"ncspin 0.8s linear infinite"}}></div>
                <div style={{fontSize:9,color:T2,textAlign:"center"}}>Loading...</div>
              </div>
            </div>
          )}
          {err && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(7,17,31,0.9)"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:10,color:DOWN,marginBottom:6}}>{err}</div>
                <button onClick={function(){fetchData(tf);}} style={{background:BLUE,border:"none",borderRadius:8,padding:"5px 14px",color:"#fff",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Retry</button>
              </div>
            </div>
          )}
        </div>

        {/* Right stats panel */}
        <div style={{width:90,background:CARD2,borderLeft:"1px solid "+BD,padding:"8px 8px",display:"flex",flexDirection:"column",gap:5,flexShrink:0}}>
          {[
            ["Open",   s.open,     T1],
            ["High",   s.high,     UP],
            ["Low",    s.low,      DOWN],
            ["Close",  s.close,    T1],
            ["P.Close",s.prevClose,T2],
            ["T.High", s.todayHigh,UP],
            ["T.Low",  s.todayLow, DOWN],
          ].map(function(row) {
            return (
              <div key={row[0]} style={{borderBottom:"1px solid rgba(30,58,95,0.5)",paddingBottom:4}}>
                <div style={{fontSize:7,color:T3,marginBottom:1}}>{row[0]}</div>
                <div style={{fontSize:9,fontWeight:700,color:row[2],fontFamily:"monospace"}}>{fmtNum(row[1],0)}</div>
              </div>
            );
          })}
          <div>
            <div style={{fontSize:7,color:T3,marginBottom:1}}>Volume</div>
            <div style={{fontSize:9,fontWeight:700,color:BLUE2,fontFamily:"monospace"}}>{fmtVol(s.vol)}</div>
          </div>
        </div>
      </div>

      <style>{"@keyframes ncspin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
