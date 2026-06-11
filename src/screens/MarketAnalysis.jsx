import { useState } from "react";

var G = "#00C853";
var R = "#EF4444";
var GOLD = "#F59E0B";
var BLUE = "#3B82F6";

//  INDICATOR CALCULATION (Educational) 

function calcRSI(candles, period) {
  if (candles.length < period + 1) return 50;
  var gains = 0, losses = 0;
  for (var i = candles.length - period; i < candles.length; i++) {
    var chg = candles[i].close - candles[i-1].close;
    if (chg > 0) gains += chg; else losses += Math.abs(chg);
  }
  if (losses == 0) return 100;
  return parseFloat((100 - 100 / (1 + gains/losses)).toFixed(1));
}

function calcEMA(candles, period) {
  if (candles.length < period) return candles[candles.length-1].close;
  var k = 2 / (period + 1);
  var ema = candles[candles.length - period].close;
  for (var i = candles.length - period + 1; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
  }
  return parseFloat(ema.toFixed(2));
}

function calcVWAP(candles) {
  var cumTPV = 0, cumVol = 0;
  candles.forEach(function(c) {
    var tp = (c.high + c.low + c.close) / 3;
    cumTPV += tp * c.vol;
    cumVol += c.vol;
  });
  return cumVol > 0 ? parseFloat((cumTPV / cumVol).toFixed(2)) : candles[candles.length-1].close;
}

function calcVolSpike(candles) {
  var recent = candles[candles.length-1].vol;
  var avg = candles.slice(-10).reduce(function(s,c){return s+c.vol;},0) / 10;
  return parseFloat((recent/avg).toFixed(2));
}

function calcSupRes(candles) {
  var highs = candles.map(function(c){return c.high;}).sort(function(a,b){return b-a;});
  var lows = candles.map(function(c){return c.low;}).sort(function(a,b){return a-b;});
  return {
    resistance: parseFloat(highs[Math.floor(highs.length*0.1)].toFixed(2)),
    support: parseFloat(lows[Math.floor(lows.length*0.1)].toFixed(2))
  };
}

function calcMACD(candles) {
  var ema12 = calcEMA(candles, 12);
  var ema26 = calcEMA(candles, 26);
  var macd = parseFloat((ema12 - ema26).toFixed(2));
  return { macd, signal: parseFloat((macd * 0.85).toFixed(2)) };
}

//  MARKET ANALYSIS (Educational) 
function analyzeMarket(candles) {
  var price = candles[candles.length-1].close;
  var rsi = calcRSI(candles, 14);
  var ema9 = calcEMA(candles, 9);
  var ema21 = calcEMA(candles, 21);
  var ema50 = calcEMA(candles, 50);
  var vwap = calcVWAP(candles);
  var macdData = calcMACD(candles);
  var volSpike = calcVolSpike(candles);
  var supRes = calcSupRes(candles);

  var bullCount = 0, bearCount = 0, total = 10;

  // RSI
  if (rsi < 40) bullCount++; else if (rsi > 60) bearCount++;

  // EMA alignment
  if (price > ema9 && ema9 > ema21) { bullCount += 2; }
  else if (price < ema9 && ema9 < ema21) { bearCount += 2; }

  // VWAP
  if (price > vwap * 1.002) bullCount++; else if (price < vwap * 0.998) bearCount++;

  // MACD
  if (macdData.macd > macdData.signal) bullCount++; else bearCount++;

  // Volume
  if (volSpike > 1.5 && price > candles[candles.length-2].close) bullCount++;
  else if (volSpike > 1.5 && price < candles[candles.length-2].close) bearCount++;

  // Trend strength
  var trendStrength = "Weak";
  if (bullCount >= 6 || bearCount >= 6) trendStrength = "Strong";
  else if (bullCount >= 4 || bearCount >= 4) trendStrength = "Medium";

  // Volume label
  var volLabel = volSpike > 2 ? "Very High" : volSpike > 1.5 ? "High" : volSpike > 0.8 ? "Normal" : "Low";
  var volColor = volSpike > 1.5 ? G : volSpike < 0.8 ? R : GOLD;

  // Risk level
  var volatility = "Medium";
  var volatilityColor = GOLD;
  if (bullCount >= 7 || bearCount >= 7) { volatility = "Low"; volatilityColor = G; }
  else if (Math.abs(bullCount - bearCount) <= 1) { volatility = "High"; volatilityColor = R; }

  // Candle pattern (simple)
  var last = candles[candles.length-1];
  var prev = candles[candles.length-2];
  var patternName = "No clear pattern";
  var cBody = Math.abs(last.close - last.open);
  var cRange = last.high - last.low;
  var cUW = last.high - Math.max(last.open, last.close);
  var cLW = Math.min(last.open, last.close) - last.low;
  var pBull = prev.close > prev.open;
  var cBull = last.close > last.open;
  if (cBody < cRange * 0.1) patternName = "Doji - Indecision";
  else if (!pBull && cBull && Math.abs(last.close-last.open) > Math.abs(prev.close-prev.open)*1.2) patternName = "Bullish Engulfing";
  else if (pBull && !cBull && Math.abs(last.close-last.open) > Math.abs(prev.close-prev.open)*1.2) patternName = "Bearish Engulfing";
  else if (cLW >= cBody * 2 && cUW <= cBody * 0.3) patternName = "Hammer";
  else if (cUW >= cBody * 2 && cLW <= cBody * 0.3) patternName = "Shooting Star";
  else if (cBull) patternName = "Bullish Candle";
  else patternName = "Bearish Candle";

  // OI Change (simulated)
  var oiChange = (Math.random() - 0.5) * 20;
  var oiLabel = oiChange > 3 ? "OI Building Up" : oiChange < -3 ? "OI Unwinding" : "OI Stable";
  var oiColor = oiChange > 3 ? G : oiChange < -3 ? R : GOLD;

  return {
    price, rsi, ema9, ema21, ema50, vwap,
    macd: macdData.macd, volSpike, volLabel, volColor,
    support: supRes.support, resistance: supRes.resistance,
    bullCount, bearCount, total,
    trendStrength, volatility, volatilityColor,
    patternName, oiChange: oiChange.toFixed(1), oiLabel, oiColor,
  };
}

function genCandles(n) {
  var price = 22400;
  var arr = [];
  for (var i = 0; i < n; i++) {
    var chg = (Math.random()-0.48)*80;
    var open = price;
    var close = parseFloat((open+chg).toFixed(2));
    arr.push({
      open, close,
      high: parseFloat((Math.max(open,close)+Math.random()*40).toFixed(2)),
      low: parseFloat((Math.min(open,close)-Math.random()*40).toFixed(2)),
      vol: Math.floor(100000+Math.random()*400000)
    });
    price = close;
  }
  return arr;
}

// Signal Bar Component
function SignalBar({ bull, bear, total }) {
  var bullPct = (bull / total) * 100;
  var bearPct = (bear / total) * 100;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:11, fontWeight:700, color:G }}>Bullish Signals: {bull}/{total}</span>
        <span style={{ fontSize:11, fontWeight:700, color:R }}>Bearish: {bear}/{total}</span>
      </div>
      <div style={{ height:10, background:"#F3F4F6", borderRadius:5, overflow:"hidden", display:"flex" }}>
        <div style={{ width:bullPct+"%", background:G, transition:"width 0.6s" }}></div>
        <div style={{ width:bearPct+"%", background:R, transition:"width 0.6s" }}></div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
        <span style={{ fontSize:8, color:"#9CA3AF" }}>{bullPct.toFixed(0)}% Bullish</span>
        <span style={{ fontSize:8, color:"#9CA3AF" }}>{bearPct.toFixed(0)}% Bearish</span>
      </div>
    </div>
  );
}

export default function MarketAnalysis() {
  var [candles] = useState(function() { return genCandles(60); });
  var [result, setResult] = useState(null);
  var [loading, setLoading] = useState(false);

  function analyze() {
    setLoading(true);
    setTimeout(function() {
      setResult(analyzeMarket(candles));
      setLoading(false);
    }, 600);
  }

  var price = candles[candles.length-1].close;
  var bull = candles[candles.length-1].close >= candles[candles.length-1].open;

  return (
    <div style={{ background:"#F8F9FA", minHeight:"100vh", fontFamily:"Inter,Arial,sans-serif", paddingBottom:30 }}>

      {/* Header */}
      <div style={{ background:"#fff", padding:"12px 14px", borderBottom:"1px solid #F0F0F0" }}>
        <div style={{ fontSize:16, fontWeight:900, color:"#111827" }}>Market <span style={{color:G}}>Analysis</span></div>
        <div style={{ fontSize:8, color:"#F97316", fontWeight:700, letterSpacing:1 }}>EDUCATIONAL - NOT INVESTMENT ADVICE</div>
      </div>

      <div style={{ padding:"14px" }}>

        {/* Price + Analyze */}
        <div style={{ background:"#fff", border:"1px solid #F0F0F0", borderRadius:14, padding:14, marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:9, color:"#6B7280" }}>NIFTY 50</div>
            <div style={{ fontSize:24, fontWeight:900, fontFamily:"monospace", color:bull?G:R }}>{price.toLocaleString("en-IN")}</div>
          </div>
          <button onClick={analyze} disabled={loading} style={{ background:loading?"#F3F4F6":G, border:"none", borderRadius:12, padding:"11px 20px", color:loading?"#6B7280":"#fff", fontWeight:700, fontSize:12, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit", boxShadow:loading?"none":"0 4px 14px rgba(0,200,83,0.3)" }}>
            {loading?"Analyzing...":"Analyze"}
          </button>
        </div>

        {/* Result */}
        {result && !loading && (
          <div>
            {/* Signal Summary */}
            <div style={{ background:"#fff", border:"1px solid #F0F0F0", borderRadius:14, padding:14, marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#111827", marginBottom:12 }}>Signal Summary</div>
              <SignalBar bull={result.bullCount} bear={result.bearCount} total={result.total}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:12 }}>
                {[
                  ["Trend Strength", result.trendStrength, result.trendStrength=="Strong"?G:result.trendStrength=="Medium"?GOLD:R],
                  ["Volume", result.volLabel, result.volColor],
                  ["Volatility", result.volatility, result.volatilityColor],
                ].map(function(r) {
                  return (
                    <div key={r[0]} style={{ background:"#F9FAFB", borderRadius:10, padding:"10px 8px", textAlign:"center" }}>
                      <div style={{ fontSize:8, color:"#9CA3AF", marginBottom:3 }}>{r[0]}</div>
                      <div style={{ fontSize:12, fontWeight:800, color:r[2] }}>{r[1]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pattern + OI */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
              <div style={{ background:"#fff", border:"1px solid #F0F0F0", borderRadius:12, padding:12 }}>
                <div style={{ fontSize:9, color:"#6B7280", marginBottom:4 }}>Pattern Detected</div>
                <div style={{ fontSize:11, fontWeight:700, color:"#111827", lineHeight:1.4 }}>{result.patternName}</div>
              </div>
              <div style={{ background:"#fff", border:"1px solid #F0F0F0", borderRadius:12, padding:12 }}>
                <div style={{ fontSize:9, color:"#6B7280", marginBottom:4 }}>OI Change</div>
                <div style={{ fontSize:11, fontWeight:700, color:result.oiColor, lineHeight:1.4 }}>{result.oiLabel}</div>
                <div style={{ fontSize:9, color:"#9CA3AF", marginTop:2 }}>{result.oiChange > 0 ? "+" : ""}{result.oiChange}%</div>
              </div>
            </div>

            {/* Support & Resistance */}
            <div style={{ background:"#fff", border:"1px solid #F0F0F0", borderRadius:14, padding:14, marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#111827", marginBottom:10 }}>Key Levels</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:10, padding:12, textAlign:"center" }}>
                  <div style={{ fontSize:9, color:"#166534", marginBottom:4 }}>Support Zone</div>
                  <div style={{ fontSize:18, fontWeight:900, color:G, fontFamily:"monospace" }}>{result.support.toLocaleString("en-IN")}</div>
                </div>
                <div style={{ background:"#FFF1F2", border:"1px solid #FECDD3", borderRadius:10, padding:12, textAlign:"center" }}>
                  <div style={{ fontSize:9, color:"#991B1B", marginBottom:4 }}>Resistance Zone</div>
                  <div style={{ fontSize:18, fontWeight:900, color:R, fontFamily:"monospace" }}>{result.resistance.toLocaleString("en-IN")}</div>
                </div>
              </div>
            </div>

            {/* Indicators */}
            <div style={{ background:"#fff", border:"1px solid #F0F0F0", borderRadius:14, padding:14, marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#111827", marginBottom:10 }}>Indicator Readings</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
                {[
                  ["RSI", result.rsi, result.rsi<40?"Over Sold":result.rsi>60?"Over Bot":"Neutral", result.rsi<40?G:result.rsi>60?R:GOLD],
                  ["EMA 9", result.ema9, result.price>result.ema9?"Price Above":"Price Below", result.price>result.ema9?G:R],
                  ["EMA 21", result.ema21, result.price>result.ema21?"Price Above":"Price Below", result.price>result.ema21?G:R],
                  ["VWAP", result.vwap, result.price>result.vwap?"Above VWAP":"Below VWAP", result.price>result.vwap?G:R],
                  ["MACD", result.macd, result.macd>0?"Positive":"Negative", result.macd>0?G:R],
                  ["Volume", result.volSpike+"x", result.volLabel, result.volColor],
                ].map(function(r) {
                  return (
                    <div key={r[0]} style={{ background:"#F9FAFB", borderRadius:8, padding:"8px 6px", textAlign:"center" }}>
                      <div style={{ fontSize:7, color:"#9CA3AF", marginBottom:2 }}>{r[0]}</div>
                      <div style={{ fontSize:10, fontWeight:800, color:"#111827", fontFamily:"monospace" }}>{r[1]}</div>
                      <div style={{ fontSize:7, color:r[3], marginTop:1, fontWeight:600 }}>{r[2]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prominent Disclaimer */}
            <div style={{ background:"#FFF7ED", border:"2px solid #F97316", borderRadius:14, padding:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ fontSize:20 }}>!</span>
                <div style={{ fontSize:13, fontWeight:800, color:"#92400E" }}>Important Disclaimer</div>
              </div>
              <div style={{ fontSize:11, color:"#92400E", lineHeight:1.9, fontWeight:500 }}>
                This application is for educational and informational purposes only. It does not provide investment advice, trading tips, or buy/sell recommendations. Users should conduct their own research before making any investment decisions.
              </div>
              <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid #FED7AA", fontSize:9, color:"#B45309" }}>
                Breakout Pro is NOT SEBI registered. Past technical patterns do not guarantee future results.
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && (
          <div style={{ background:"#fff", border:"1px solid #F0F0F0", borderRadius:16, padding:28, textAlign:"center" }}>
            <div style={{ fontSize:32, fontWeight:900, color:G, marginBottom:10 }}>BP</div>
            <div style={{ fontSize:14, fontWeight:700, color:"#111827", marginBottom:6 }}>Market Analysis Engine</div>
            <div style={{ fontSize:10, color:"#6B7280", lineHeight:1.7, marginBottom:16 }}>Educational indicator analysis using RSI, EMA, VWAP, MACD, Volume and Support/Resistance. No buy/sell signals.</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:16 }}>
              {["Bullish/Bearish Signals","Trend Strength","Volume Analysis","Pattern Detection","OI Change","Support & Resistance","Volatility","7 Indicators"].map(function(f) {
                return <div key={f} style={{ background:"#F0FDF4", borderRadius:8, padding:"7px 8px", fontSize:9, color:"#166534", fontWeight:600 }}>{f}</div>;
              })}
            </div>
            <button onClick={analyze} style={{ background:G, border:"none", borderRadius:12, padding:"13px 30px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 14px rgba(0,200,83,0.3)" }}>Start Analysis</button>
          </div>
        )}

      </div>
    </div>
  );
    }
                         
