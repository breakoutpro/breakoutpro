import { useState, useEffect, useRef } from "react";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

var SYMBOLS = [
  {sym:"NIFTY 50",   base:23622},
  {sym:"BANK NIFTY", base:56814},
  {sym:"SENSEX",     base:73863},
  {sym:"RELIANCE",   base:2845},
  {sym:"TCS",        base:3654},
  {sym:"HDFCBANK",   base:1742},
  {sym:"INFY",       base:1567},
  {sym:"WIPRO",      base:478},
];

var TIMEFRAMES = ["1m","5m","15m","1h","1D","1W"];

function genCandles(base, count) {
  var arr = [];
  var price = base;
  for (var i = 0; i < count; i++) {
    var chg = (Math.random() - 0.48) * base * 0.006;
    var open2 = price;
    var close2 = parseFloat((open2 + chg).toFixed(2));
    var wick1 = Math.random() * base * 0.003;
    var wick2 = Math.random() * base * 0.003;
    var hi = parseFloat((Math.max(open2, close2) + wick1).toFixed(2));
    var lo = parseFloat((Math.min(open2, close2) - wick2).toFixed(2));
    arr.push({ open: open2, close: close2, high: hi, low: lo, vol: Math.floor(50000 + Math.random() * 300000) });
    price = close2;
  }
  return arr;
}

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

function calcRSI(candles) {
  if (candles.length < 15) return 50;
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

function CandleChart(props) {
  var candles = props.candles || [];
  var ema9 = props.ema9 || [];
  var ema21 = props.ema21 || [];
  var vwap = props.vwap || 0;
  var showEMA = props.showEMA;
  var showVWAP = props.showVWAP;
  var W = 340, H = 200;
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

  function yP(price) { return H - ((price - minP) / range) * H; }
  function xC(i) { return i * cw + cw / 2; }

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
    <svg width={W} height={H} style={{display:"block",width:"100%"}}>
      {/* Grid lines */}
      {[0,0.25,0.5,0.75,1].map(function(t) {
        var y = t * H;
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
      {showEMA && emaPath21 ? <path d={emaPath21} fill="none" stroke="#3B82F6" strokeWidth={1.2}/> : null}

      {/* VWAP */}
      {showVWAP && vwap > 0 ? (
        <line x1={0} y1={yP(vwap)} x2={W} y2={yP(vwap)} stroke="#8B5CF6" strokeWidth={1} strokeDasharray="4,3"/>
      ) : null}
    </svg>
  );
}

export default function ChartScreen() {
  var [symIdx, setSymIdx] = useState(0);
  var [tf, setTf] = useState("15m");
  var [candles, setCandles] = useState([]);
  var [showEMA, setShowEMA] = useState(true);
  var [showVWAP, setShowVWAP] = useState(true);
  var [showRSI, setShowRSI] = useState(false);

  var sym = SYMBOLS[symIdx];

  function refresh() {
    var count = tf == "1m" ? 120 : tf == "5m" ? 100 : tf == "15m" ? 80 : tf == "1h" ? 60 : tf == "1D" ? 90 : 52;
    setCandles(genCandles(sym.base, count));
  }

  useEffect(function() { refresh(); }, [symIdx, tf]);

  var ema9 = calcEMA(candles, 9);
  var ema21 = calcEMA(candles, 21);
  var vwap = calcVWAP(candles);
  var rsi = calcRSI(candles);
  var lastC = candles[candles.length - 1] || {open:0,close:0,high:0,low:0,vol:0};
  var bull = lastC.close >= lastC.open;
  var chgPct = lastC.open > 0 ? ((lastC.close - lastC.open) / lastC.open * 100).toFixed(2) : "0.00";

  var rsiColor = rsi > 70 ? R : rsi < 30 ? G2 : GOLD;
  var rsiLabel = rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral";

  var indicators = [
    {label:"RSI",   val:rsi, color:rsiColor, sub:rsiLabel},
    {label:"EMA 9", val:ema9[ema9.length-1]||0,   color:GOLD, sub:lastC.close > (ema9[ema9.length-1]||0) ? "Bullish" : "Bearish"},
    {label:"EMA 21",val:ema21[ema21.length-1]||0, color:"#3B82F6", sub:lastC.close > (ema21[ema21.length-1]||0) ? "Bullish" : "Bearish"},
    {label:"VWAP",  val:vwap, color:"#8B5CF6", sub:lastC.close > vwap ? "Above" : "Below"},
  ];

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T1}}>Chart <span style={{color:G}}>Engine</span></div>
            <div style={{fontSize:8,color:T2}}>60fps Canvas Chart</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"monospace",fontSize:18,fontWeight:900,color:bull?G2:R}}>
              {lastC.close.toLocaleString("en-IN",{minimumFractionDigits:2})}
            </div>
            <div style={{fontSize:10,fontWeight:700,color:bull?G2:R}}>{bull?"+":""}{chgPct}%</div>
          </div>
        </div>

        {/* Symbol selector */}
        <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:8}}>
          {SYMBOLS.map(function(s,i){
            var act=symIdx==i;
            return <button key={s.sym} onClick={function(){setSymIdx(i);}} style={{background:act?G:"rgba(255,255,255,0.06)",border:"1px solid "+(act?G:BD),borderRadius:20,padding:"4px 10px",color:act?"#fff":T2,fontSize:9,fontWeight:act?700:500,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{s.sym}</button>;
          })}
        </div>

        {/* Timeframe */}
        <div style={{display:"flex",gap:6}}>
          {TIMEFRAMES.map(function(t){
            var act=tf==t;
            return <button key={t} onClick={function(){setTf(t);}} style={{background:act?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(act?GOLD:BD),borderRadius:8,padding:"4px 10px",color:act?GOLD:T2,fontSize:10,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>;
          })}
          <div style={{flex:1}}></div>
          <button onClick={refresh} style={{background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.3)",borderRadius:8,padding:"4px 10px",color:G,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Refresh</button>
        </div>
      </div>

      <div style={{padding:14}}>

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
          <CandleChart candles={candles} ema9={ema9} ema21={ema21} vwap={vwap} showEMA={showEMA} showVWAP={showVWAP}/>
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
              <div style={{fontSize:12,fontWeight:900,color:rsiColor}}>{rsi}  {rsiLabel}</div>
            </div>
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
            {[["Green candle","Bullish (Close > Open)",G],[" Red candle","Bearish (Close < Open)",R],["Yellow line","EMA 9",GOLD],["Blue line","EMA 21","#3B82F6"],["Purple dash","VWAP","#8B5CF6"]].map(function(l){
              return <div key={l[0]} style={{fontSize:8,color:T2}}><span style={{color:l[2],fontWeight:700}}>{l[0]}</span> = {l[1]}</div>;
            })}
          </div>
        </div>

        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:"#F97316"}}>Educational only. Demo data. Not SEBI registered. Not investment advice.</div>
        </div>
      </div>
    </div>
  );
}
