import React, { useState, useEffect } from "react";

var G = "#00C853";
var R = "#EF4444";
var GOLD = "#F59E0B";
var BLUE = "#3B82F6";

function calcEMA(candles, period) {
  if (candles.length < period) return candles[candles.length-1].close;
  var k = 2 / (period + 1);
  var ema = candles[candles.length - period].close;
  for (var i = candles.length - period + 1; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
  }
  return parseFloat(ema.toFixed(2));
}

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

function calcVWAP(candles) {
  var cumTPV = 0, cumVol = 0;
  for (var i = 0; i < candles.length; i++) {
    var tp = (candles[i].high + candles[i].low + candles[i].close) / 3;
    cumTPV += tp * candles[i].vol;
    cumVol += candles[i].vol;
  }
  return cumVol > 0 ? parseFloat((cumTPV / cumVol).toFixed(2)) : candles[candles.length-1].close;
}

function calcMACD(candles) {
  var ema12 = calcEMA(candles, 12);
  var ema26 = calcEMA(candles, 26);
  var macd = parseFloat((ema12 - ema26).toFixed(2));
  var signal = parseFloat((macd * 0.85).toFixed(2));
  return { macd: macd, signal: signal };
}

function calcCPR(candles) {
  var prev = candles[candles.length - 2];
  var pivot = parseFloat(((prev.high + prev.low + prev.close) / 3).toFixed(2));
  var bc = parseFloat(((prev.high + prev.low) / 2).toFixed(2));
  var tc = parseFloat(((pivot - bc) + pivot).toFixed(2));
  return { pivot: pivot, bc: Math.min(bc, tc), tc: Math.max(bc, tc) };
}

function calcVolSpike(candles) {
  var recent = candles[candles.length-1].vol;
  var avg = 0;
  for (var i = candles.length - 10; i < candles.length; i++) avg += candles[i].vol;
  avg = avg / 10;
  return parseFloat((recent/avg).toFixed(2));
}

function calcATR(candles, period) {
  if (candles.length < period) return 0;
  var sum = 0;
  for (var i = candles.length - period; i < candles.length; i++) {
    var tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i-1].close),
      Math.abs(candles[i].low - candles[i-1].close)
    );
    sum += tr;
  }
  return parseFloat((sum / period).toFixed(2));
}

function genCandles(n) {
  var price = 22400;
  var arr = [];
  for (var i = 0; i < n; i++) {
    var chg = (Math.random()-0.48)*60;
    var open = price;
    var close = parseFloat((open+chg).toFixed(2));
    arr.push({
      open: open, close: close,
      high: parseFloat((Math.max(open,close)+Math.random()*30).toFixed(2)),
      low: parseFloat((Math.min(open,close)-Math.random()*30).toFixed(2)),
      vol: Math.floor(80000+Math.random()*300000)
    });
    price = close;
  }
  return arr;
}

function ICard(props) {
  var label = props.label;
  var value = props.value;
  var sub = props.sub;
  var color = props.color || "#111827";
  var bg = props.bg || "#F9FAFB";
  var bd = props.bd || "#F0F0F0";
  return (
    <div style={{background:bg,border:"1px solid "+bd,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
      <div style={{fontSize:7,color:"#9CA3AF",marginBottom:2}}>{label}</div>
      <div style={{fontSize:13,fontWeight:900,color:color,fontFamily:"monospace"}}>{value}</div>
      {sub ? <div style={{fontSize:7,color:color,marginTop:2,fontWeight:600}}>{sub}</div> : null}
    </div>
  );
}

function SparkLine(props) {
  var data = props.data;
  var color = props.color;
  if (!data || data.length < 2) return null;
  var w = 360; var h = 40;
  var min = Math.min.apply(null, data);
  var max = Math.max.apply(null, data);
  var range = max - min || 1;
  var pts = data.map(function(v, i) {
    var x = (i/(data.length-1))*w;
    var y = h - ((v-min)/range)*(h-4) + 2;
    return x+","+y;
  }).join(" ");
  return (
    <svg width="100%" height={h} viewBox={"0 0 "+w+" "+h} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function ScalperMode() {
  var [candles, setCandles] = useState(function(){ return genCandles(60); });
  var [tf, setTf] = useState("5m");
  var [tab, setTab] = useState("overview");
  var [timerSec, setTimerSec] = useState(60);

  var TF_SECS = {"1m":60,"3m":180,"5m":300,"15m":900,"30m":1800,"1h":3600};

  useEffect(function() {
    var t = setInterval(function() {
      setCandles(function(prev) {
        var last = prev[prev.length-1];
        var chg = (Math.random()-0.5)*8;
        var newClose = parseFloat((last.close+chg).toFixed(2));
        return prev.slice(0,-1).concat([{
          open:last.open, close:newClose,
          high:Math.max(last.high, newClose),
          low:Math.min(last.low, newClose),
          vol:last.vol+Math.floor(Math.random()*5000)
        }]);
      });
    }, 1000);
    return function(){ clearInterval(t); };
  }, []);

  useEffect(function() {
    function calc() {
      var now = new Date();
      var s = now.getSeconds()+now.getMinutes()*60+now.getHours()*3600;
      var tf_s = TF_SECS[tf] || 60;
      setTimerSec(tf_s-(s%tf_s));
    }
    calc();
    var t = setInterval(calc, 1000);
    return function(){ clearInterval(t); };
  }, [tf]);

  var price = candles[candles.length-1].close;
  var prevClose = candles[candles.length-2].close;
  var bull = price >= prevClose;
  var chgPct = parseFloat(((price-prevClose)/prevClose*100).toFixed(2));
  var ema9  = calcEMA(candles, 9);
  var ema21 = calcEMA(candles, 21);
  var ema50 = calcEMA(candles, 50);
  var vwap  = calcVWAP(candles);
  var rsi   = calcRSI(candles, 14);
  var macdD = calcMACD(candles);
  var cpr   = calcCPR(candles);
  var volSpike = calcVolSpike(candles);
  var atr   = calcATR(candles, 14);
  var timerM = Math.floor(timerSec/60);
  var timerS = timerSec % 60;
  var timerPct = (1 - timerSec/(TF_SECS[tf]||60)) * 100;
  var priceHistory = candles.slice(-20).map(function(c){ return c.close; });

  var signals = [
    {label:"EMA 9",  val:ema9,  status:price>ema9?"Above":"Below",   bull:price>ema9},
    {label:"EMA 21", val:ema21, status:price>ema21?"Above":"Below",  bull:price>ema21},
    {label:"EMA 50", val:ema50, status:price>ema50?"Above":"Below",  bull:price>ema50},
    {label:"VWAP",   val:vwap,  status:price>vwap?"Above":"Below",   bull:price>vwap},
    {label:"RSI 14", val:rsi,   status:rsi<40?"Oversold":rsi>60?"Overbought":"Neutral", bull:rsi<40},
    {label:"MACD",   val:macdD.macd, status:macdD.macd>macdD.signal?"Positive":"Negative", bull:macdD.macd>macdD.signal},
    {label:"Volume", val:volSpike+"x", status:volSpike>1.5?"Spike":"Normal", bull:volSpike>1.5},
  ];

  var bullSig = signals.filter(function(s){ return s.bull; }).length;
  var bearSig = signals.length - bullSig;

  var volMax = Math.max.apply(null, candles.slice(-10).map(function(c){ return c.vol; }));

  return (
    <div style={{background:"#0B0B0B",minHeight:"100vh",color:"#fff",fontFamily:"Inter,Arial,sans-serif",paddingBottom:20}}>

      <div style={{background:"#111",padding:"10px 14px",borderBottom:"1px solid #1E1E1E"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div>
            <div style={{fontSize:14,fontWeight:900}}>Scalper <span style={{color:G}}>Mode</span></div>
            <div style={{fontSize:7,color:"#F97316",fontWeight:700,letterSpacing:1}}>EDUCATIONAL ANALYSIS ONLY</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:22,fontWeight:900,fontFamily:"monospace",color:bull?G:R}}>{price.toLocaleString("en-IN")}</div>
            <div style={{fontSize:10,fontWeight:700,color:bull?G:R}}>{bull?"+":""}{chgPct}%</div>
          </div>
        </div>
        <SparkLine data={priceHistory} color={bull?G:R}/>
        <div style={{display:"flex",gap:4,marginTop:6}}>
          {["1m","3m","5m","15m","30m","1h"].map(function(t) {
            return <button key={t} onClick={function(){ setTf(t); }} style={{flex:1,background:tf==t?"#1A2A1A":"transparent",border:"none",borderRadius:6,padding:"5px 2px",color:tf==t?G:"#555",fontSize:9,fontWeight:tf==t?700:400,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>;
          })}
        </div>
      </div>

      <div style={{background:"#0F0F0F",padding:"7px 14px",borderBottom:"1px solid #1A1A1A",display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:8,color:"#555"}}>Next {tf}:</div>
        <div style={{fontSize:18,fontWeight:900,fontFamily:"monospace",color:timerSec<10?R:GOLD}}>
          {String(timerM).padStart(2,"0")}:{String(timerS).padStart(2,"0")}
        </div>
        <div style={{flex:1,height:4,background:"#1A1A1A",borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",width:timerPct+"%",background:timerSec<10?R:G,borderRadius:2,transition:"width 1s linear"}}></div>
        </div>
        <div style={{fontSize:9,fontWeight:700,color:"#444"}}>ATR:{atr}</div>
      </div>

      <div style={{display:"flex",background:"#111",borderBottom:"1px solid #1A1A1A"}}>
        {[["overview","Overview"],["indicators","Indicators"],["cpr","CPR"],["volume","Volume"]].map(function(item) {
          var act = tab == item[0];
          return <button key={item[0]} onClick={function(){ setTab(item[0]); }} style={{flex:1,background:"none",border:"none",borderBottom:act?"2px solid "+G:"2px solid transparent",padding:"9px 4px",color:act?G:"#555",fontSize:9,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit"}}>{item[1]}</button>;
        })}
      </div>

      <div style={{padding:"12px 14px"}}>

        {tab=="overview" ? (
          <div>
            <div style={{background:"#111",border:"1px solid #1E1E1E",borderRadius:14,padding:14,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"#fff",marginBottom:10}}>Signal Summary</div>
              <div style={{display:"flex",gap:10,marginBottom:10}}>
                <div style={{flex:1,background:"rgba(0,200,83,0.1)",border:"1px solid rgba(0,200,83,0.3)",borderRadius:10,padding:10,textAlign:"center"}}>
                  <div style={{fontSize:8,color:"#555",marginBottom:2}}>Bullish Signals</div>
                  <div style={{fontSize:26,fontWeight:900,color:G}}>{bullSig}</div>
                  <div style={{fontSize:8,color:"#444"}}>of {signals.length}</div>
                </div>
                <div style={{flex:1,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:10,textAlign:"center"}}>
                  <div style={{fontSize:8,color:"#555",marginBottom:2}}>Bearish Signals</div>
                  <div style={{fontSize:26,fontWeight:900,color:R}}>{bearSig}</div>
                  <div style={{fontSize:8,color:"#444"}}>of {signals.length}</div>
                </div>
              </div>
              <div style={{height:8,background:"#1A1A1A",borderRadius:4,overflow:"hidden",display:"flex"}}>
                <div style={{width:(bullSig/signals.length*100)+"%",background:G,transition:"width 0.5s"}}></div>
                <div style={{width:(bearSig/signals.length*100)+"%",background:R,transition:"width 0.5s"}}></div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              <ICard label="RSI 14" value={rsi} sub={rsi<40?"Oversold":rsi>60?"Overbought":"Neutral"} color={rsi<40?G:rsi>60?R:GOLD}/>
              <ICard label="VWAP" value={vwap.toLocaleString("en-IN")} sub={price>vwap?"Above":"Below"} color={price>vwap?G:R}/>
              <ICard label="EMA 9" value={ema9.toLocaleString("en-IN")} sub={price>ema9?"Above":"Below"} color={price>ema9?G:R}/>
              <ICard label="EMA 21" value={ema21.toLocaleString("en-IN")} sub={price>ema21?"Above":"Below"} color={price>ema21?G:R}/>
              <ICard label="MACD" value={macdD.macd} sub={macdD.macd>0?"Positive":"Negative"} color={macdD.macd>0?G:R}/>
              <ICard label="Vol" value={volSpike+"x"} sub={volSpike>1.5?"Spike":"Normal"} color={volSpike>1.5?GOLD:G}/>
            </div>
            <div style={{background:"#0F0800",border:"1px solid #2A1E00",borderRadius:10,padding:10}}>
              <div style={{fontSize:8,color:"#92694A",lineHeight:1.7}}>This application is for educational and informational purposes only. It does not provide investment advice, trading tips, or buy/sell recommendations. Users should conduct their own research before making any investment decisions.</div>
            </div>
          </div>
        ) : null}

        {tab=="indicators" ? (
          <div>
            {signals.map(function(sig) {
              return (
                <div key={sig.label} style={{background:"#111",border:"1px solid #1E1E1E",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{sig.label}</div>
                    <div style={{fontSize:9,color:"#555",marginTop:2}}>{sig.status}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:800,fontFamily:"monospace",color:sig.bull?G:R}}>{sig.val}</div>
                    <div style={{background:sig.bull?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.15)",borderRadius:4,padding:"2px 8px",fontSize:8,fontWeight:700,color:sig.bull?G:R,marginTop:3}}>{sig.bull?"Bullish":"Bearish"}</div>
                  </div>
                </div>
              );
            })}
            <div style={{background:"#0F0800",border:"1px solid #2A1E00",borderRadius:10,padding:10,marginTop:4}}>
              <div style={{fontSize:8,color:"#92694A",lineHeight:1.7}}>Educational only. Not SEBI registered. Not investment advice.</div>
            </div>
          </div>
        ) : null}

        {tab=="cpr" ? (
          <div>
            <div style={{background:"#111",border:"1px solid #1E1E1E",borderRadius:14,padding:16,marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14}}>CPR - Central Pivot Range</div>
              {[
                ["Top CPR (TC)", cpr.tc, GOLD, "Resistance zone"],
                ["Pivot Point", cpr.pivot, "#fff", "Key level"],
                ["Bottom CPR (BC)", cpr.bc, BLUE, "Support zone"],
                ["Current Price", price, bull?G:R, bull?"Above CPR":"Below CPR"],
              ].map(function(r) {
                return (
                  <div key={r[0]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #1A1A1A"}}>
                    <div>
                      <div style={{fontSize:11,fontWeight:600,color:"#888"}}>{r[0]}</div>
                      <div style={{fontSize:9,color:"#555",marginTop:2}}>{r[3]}</div>
                    </div>
                    <div style={{fontSize:16,fontWeight:900,fontFamily:"monospace",color:r[2]}}>{r[1].toLocaleString("en-IN")}</div>
                  </div>
                );
              })}
            </div>
            <div style={{background:"#161616",border:"1px solid #222",borderRadius:12,padding:12,marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:GOLD,marginBottom:6}}>CPR Education</div>
              <div style={{fontSize:9,color:"#888",lineHeight:1.8}}>CPR is calculated from previous day High, Low and Close. Narrow CPR = Trending day expected. Wide CPR = Sideways day expected. Price above TC = Bullish bias. Price below BC = Bearish bias.</div>
            </div>
            <div style={{background:"#0F0800",border:"1px solid #2A1E00",borderRadius:10,padding:10}}>
              <div style={{fontSize:8,color:"#92694A",lineHeight:1.7}}>Educational only. Not SEBI registered. Not investment advice.</div>
            </div>
          </div>
        ) : null}

        {tab=="volume" ? (
          <div>
            <div style={{background:"#111",border:"1px solid #1E1E1E",borderRadius:14,padding:14,marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:"#fff",marginBottom:12}}>Volume Analysis</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <div style={{background:volSpike>1.5?"rgba(0,200,83,0.1)":"#161616",border:"1px solid "+(volSpike>1.5?"rgba(0,200,83,0.3)":"#222"),borderRadius:10,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:8,color:"#555",marginBottom:3}}>Volume Ratio</div>
                  <div style={{fontSize:24,fontWeight:900,color:volSpike>1.5?G:GOLD}}>{volSpike}x</div>
                  <div style={{fontSize:9,color:volSpike>1.5?G:"#555"}}>{volSpike>2?"Very High":volSpike>1.5?"High":"Normal"}</div>
                </div>
                <div style={{background:"#161616",border:"1px solid #222",borderRadius:10,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:8,color:"#555",marginBottom:3}}>ATR (14)</div>
                  <div style={{fontSize:24,fontWeight:900,color:BLUE}}>{atr}</div>
                  <div style={{fontSize:9,color:"#555"}}>Avg True Range</div>
                </div>
              </div>
              <div style={{fontSize:10,fontWeight:600,color:"#888",marginBottom:8}}>Last 10 Candles Volume</div>
              {candles.slice(-10).map(function(cv, i) {
                var pct = (cv.vol/volMax)*100;
                var cbull = cv.close >= cv.open;
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <div style={{fontSize:7,color:"#555",width:16,textAlign:"right"}}>{i+1}</div>
                    <div style={{flex:1,height:8,background:"#1A1A1A",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:pct+"%",background:cbull?G:R,borderRadius:2}}></div>
                    </div>
                    <div style={{fontSize:8,color:"#555",width:34}}>{(cv.vol/100000).toFixed(1)}L</div>
                  </div>
                );
              })}
            </div>
            <div style={{background:"#161616",border:"1px solid #222",borderRadius:12,padding:12,marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:GOLD,marginBottom:6}}>Volume Education</div>
              <div style={{fontSize:9,color:"#888",lineHeight:1.8}}>High volume with price up = Strong buying. High volume with price down = Strong selling. Low volume with price up = Weak move. Volume spike above 1.5x average = Significant move. ATR helps understand daily price range.</div>
            </div>
            <div style={{background:"#0F0800",border:"1px solid #2A1E00",borderRadius:10,padding:10}}>
              <div style={{fontSize:8,color:"#92694A",lineHeight:1.7}}>This application is for educational and informational purposes only. It does not provide investment advice, trading tips, or buy/sell recommendations. Users should conduct their own research before making any investment decisions.</div>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
      }
                         
