import { useEffect, useRef, useState } from "react";

var BG = "#07111F";
var CARD = "#101B2E";
var BD = "#1E3A5F";
var UP = "#22C55E";
var DOWN = "#EF4444";
var BLUE = "#3B82F6";
var BLUE2 = "#60A5FA";
var T1 = "#FFFFFF";
var T2 = "#94A3B8";
var T3 = "#475569";
var GOLD = "#F59E0B";

var TF_MAP = {
  "1D": { range: "5d",    interval: "5m"  },
  "1W": { range: "1mo",   interval: "30m" },
  "1M": { range: "3mo",   interval: "1d"  },
  "1Y": { range: "1y",    interval: "1d"  },
};

function loadLWC(cb) {
  if (window.LightweightCharts) { cb(); return; }
  var s = document.createElement("script");
  s.src = "https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js";
  s.onload = cb;
  s.onerror = function() { cb(new Error("LWC load failed")); };
  document.head.appendChild(s);
}

function genMockData(tf) {
  var now = Math.floor(Date.now() / 1000);
  var arr = [];
  var base = 23800;
  var count = tf == "1D" ? 78 : tf == "1W" ? 84 : tf == "1M" ? 90 : 252;
  var step = tf == "1D" ? 300 : tf == "1W" ? 1800 : 86400;
  var start = now - count * step;
  for (var i = 0; i < count; i++) {
    var chg = (Math.random() - 0.48) * base * 0.006;
    var open2 = parseFloat(base.toFixed(2));
    var close2 = parseFloat((base + chg).toFixed(2));
    var high2 = parseFloat((Math.max(open2, close2) + Math.random() * base * 0.002).toFixed(2));
    var low2 = parseFloat((Math.min(open2, close2) - Math.random() * base * 0.002).toFixed(2));
    arr.push({ time: start + i * step, open: open2, high: high2, low: low2, close: close2 });
    base = close2;
  }
  return arr;
}

export default function NiftyChart() {
  var chartRef = useRef(null);
  var chartInstanceRef = useRef(null);
  var seriesRef = useRef(null);
  var [tf, setTf] = useState("1M");
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState(null);
  var [info, setInfo] = useState({ price: 23800, chg: 0, chgPct: 0, high: 0, low: 0, open: 0, prevClose: 0, up: true });

  function fetchAndDraw(timeframe) {
    setLoading(true);
    setError(null);
    var params = TF_MAP[timeframe];
    fetch("/api/history?symbol=%5ENSEI&range=" + params.range + "&interval=" + params.interval)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var candles = data.candles || [];
        if (candles.length < 2) { candles = genMockData(timeframe); }
        var last = candles[candles.length - 1];
        var prev = candles[candles.length - 2] || last;
        var chg = last.close - prev.close;
        var chgPct = ((chg / prev.close) * 100);
        var highs = candles.map(function(c) { return c.high; });
        var lows = candles.map(function(c) { return c.low; });
        setInfo({
          price: last.close,
          chg: chg,
          chgPct: chgPct,
          high: Math.max.apply(null, highs),
          low: Math.min.apply(null, lows),
          open: candles[0].open,
          prevClose: prev.close,
          up: chg >= 0,
        });
        if (seriesRef.current) {
          seriesRef.current.setData(candles.map(function(c) {
            return { time: c.time, open: c.open, high: c.high, low: c.low, close: c.close };
          }));
          if (chartInstanceRef.current) chartInstanceRef.current.timeScale().fitContent();
        }
        setLoading(false);
      })
      .catch(function() {
        var mock = genMockData(timeframe);
        var last = mock[mock.length - 1];
        var prev = mock[mock.length - 2];
        var chg = last.close - prev.close;
        setInfo({ price: last.close, chg: chg, chgPct: (chg/prev.close)*100, high: Math.max.apply(null, mock.map(function(c){return c.high;})), low: Math.min.apply(null, mock.map(function(c){return c.low;})), open: mock[0].open, prevClose: prev.close, up: chg >= 0 });
        if (seriesRef.current) {
          seriesRef.current.setData(mock.map(function(c) { return { time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }; }));
          if (chartInstanceRef.current) chartInstanceRef.current.timeScale().fitContent();
        }
        setLoading(false);
      });
  }

  useEffect(function() {
    loadLWC(function(err) {
      if (err || !window.LightweightCharts) {
        setError("Chart library failed to load");
        setLoading(false);
        return;
      }
      if (!chartRef.current) return;
      var chart = window.LightweightCharts.createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height: 240,
        layout: { background: { color: CARD }, textColor: T2 },
        grid: { vertLines: { color: BD }, horzLines: { color: BD } },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: BD },
        timeScale: { borderColor: BD, timeVisible: true, secondsVisible: false },
      });
      var series = chart.addCandlestickSeries({
        upColor: UP, downColor: DOWN,
        borderUpColor: UP, borderDownColor: DOWN,
        wickUpColor: UP, wickDownColor: DOWN,
      });
      chartInstanceRef.current = chart;
      seriesRef.current = series;

      var ro = new ResizeObserver(function() {
        if (chartRef.current && chartInstanceRef.current) {
          chartInstanceRef.current.applyOptions({ width: chartRef.current.clientWidth });
        }
      });
      ro.observe(chartRef.current);

      fetchAndDraw("1M");

      return function() { ro.disconnect(); chart.remove(); };
    });
  }, []);

  useEffect(function() {
    if (seriesRef.current) fetchAndDraw(tf);
  }, [tf]);

  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",marginBottom:14}}>

      {/* Header */}
      <div style={{padding:"10px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:info.up?UP:DOWN,boxShadow:"0 0 6px "+(info.up?UP:DOWN)}}></div>
              <span style={{fontSize:10,fontWeight:800,color:T1}}>NIFTY 50</span>
              <span style={{fontSize:8,color:T3}}>NSE India</span>
            </div>
            <div style={{fontSize:22,fontWeight:900,color:T1,fontFamily:"monospace"}}>
              {info.price.toLocaleString("en-IN", {minimumFractionDigits:2,maximumFractionDigits:2})}
            </div>
            <div style={{fontSize:10,fontWeight:700,color:info.up?UP:DOWN,marginTop:2}}>
              {info.up?"+":""}{info.chg.toFixed(2)} ({info.up?"+":""}{info.chgPct.toFixed(2)}%)
            </div>
          </div>

          {/* Stats */}
          <div style={{textAlign:"right"}}>
            {[["O",info.open],["H",info.high],["L",info.low],["PC",info.prevClose]].map(function(row){
              return (
                <div key={row[0]} style={{fontSize:8,color:T2,marginBottom:2}}>
                  <span style={{color:T3}}>{row[0]}: </span>
                  <span style={{fontWeight:600,color:T1}}>{row[1].toLocaleString("en-IN",{maximumFractionDigits:2})}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeframe buttons */}
        <div style={{display:"flex",gap:6,marginTop:10}}>
          {["1D","1W","1M","1Y"].map(function(t){
            var act = tf == t;
            return (
              <button key={t} onClick={function(){setTf(t);}} style={{background:act?"rgba(59,130,246,0.2)":"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:20,padding:"4px 12px",color:act?BLUE2:T2,fontSize:9,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>
                {t}
              </button>
            );
          })}
          <div style={{flex:1}}/>
          {loading && (
            <div style={{width:14,height:14,border:"2px solid "+BD,borderTopColor:BLUE,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
          )}
        </div>
      </div>

      {/* Chart area */}
      <div style={{position:"relative"}}>
        <div ref={chartRef} style={{width:"100%",height:240}}/>
        {error && (
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(7,17,31,0.9)"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:DOWN,marginBottom:4}}>{error}</div>
              <button onClick={function(){fetchAndDraw(tf);}} style={{background:BLUE,border:"none",borderRadius:8,padding:"6px 14px",color:"#fff",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Retry</button>
            </div>
          </div>
        )}
      </div>

      <style>{".lwc-spin{animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
