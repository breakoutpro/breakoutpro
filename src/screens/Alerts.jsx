import { useState, useEffect, useRef } from "react";
import { triggerAlert } from "../components/AlertBanner";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

var WATCHLIST = [
  {sym:"NIFTY 50",   ltp:23622.90, base:23622.90, sect:"Index"},
  {sym:"BANK NIFTY", ltp:56814.80, base:56814.80, sect:"Index"},
  {sym:"SENSEX",     ltp:73863.45, base:73863.45, sect:"Index"},
  {sym:"RELIANCE",   ltp:2845.60,  base:2845.60,  sect:"Energy"},
  {sym:"TCS",        ltp:3654.20,  base:3654.20,  sect:"IT"},
  {sym:"HDFCBANK",   ltp:1742.50,  base:1742.50,  sect:"Bank"},
  {sym:"ICICIBANK",  ltp:1289.30,  base:1289.30,  sect:"Bank"},
  {sym:"INFY",       ltp:1567.80,  base:1567.80,  sect:"IT"},
  {sym:"WIPRO",      ltp:478.90,   base:478.90,   sect:"IT"},
  {sym:"SBIN",       ltp:812.30,   base:812.30,   sect:"Bank"},
  {sym:"TATAMOTORS", ltp:945.60,   base:945.60,   sect:"Auto"},
  {sym:"AXISBANK",   ltp:1156.70,  base:1156.70,  sect:"Bank"},
];

var ALERT_TYPES = [
  {id:"breakout",  label:"Breakout",   color:G2,   icon:"UP"},
  {id:"breakdown", label:"Breakdown",  color:R,    icon:"DN"},
  {id:"doji",      label:"Doji",       color:GOLD, icon:"DJ"},
  {id:"hammer",    label:"Hammer",     color:G2,   icon:"HM"},
  {id:"shooting",  label:"Shoot Star", color:R,    icon:"SS"},
  {id:"engulf",    label:"Engulfing",  color:GOLD, icon:"EN"},
  {id:"vwap",      label:"VWAP Cross", color:"#8B5CF6", icon:"VP"},
  {id:"rsi_ob",    label:"RSI Overbought", color:R, icon:"RH"},
  {id:"rsi_os",    label:"RSI Oversold",   color:G2,icon:"RL"},
  {id:"volume",    label:"Volume Spike",   color:GOLD,icon:"VS"},
];

function detectPattern(candles) {
  if (candles.length < 3) return null;
  var len = candles.length;
  var c = candles[len-1];
  var p = candles[len-2];
  var pp = candles[len-3];
  var cBody = Math.abs(c.close-c.open);
  var cRange = c.high-c.low;
  var pBody = Math.abs(p.close-p.open);
  var cUW = c.high - Math.max(c.open,c.close);
  var cLW = Math.min(c.open,c.close) - c.low;
  var cBull = c.close > c.open;
  var pBull = p.close > p.open;

  if (cRange > 0 && cBody < cRange * 0.1) return {name:"Doji", type:"neutral", desc:"Indecision candle. Wait for confirmation."};
  if (cLW >= cBody*2 && cUW <= cBody*0.3 && !pBull) return {name:"Hammer", type:"bullish", desc:"Buyers rejected lower prices. Bullish reversal."};
  if (cUW >= cBody*2 && cLW <= cBody*0.3 && pBull) return {name:"Shooting Star", type:"bearish", desc:"Sellers rejected higher prices. Bearish reversal."};
  if (!pBull && cBull && c.open < p.close && c.close > p.open && cBody > pBody*1.2) return {name:"Bullish Engulfing", type:"bullish", desc:"Strong bull takeover. Bullish reversal signal."};
  if (pBull && !cBull && c.open > p.close && c.close < p.open && cBody > pBody*1.2) return {name:"Bearish Engulfing", type:"bearish", desc:"Strong bear takeover. Bearish reversal signal."};
  if (!pBull && Math.abs(pp.close-pp.open)<(pp.high-pp.low)*0.3 && cBull && c.close>(p.open+p.close)/2) return {name:"Morning Star", type:"bullish", desc:"3-candle bullish reversal pattern."};
  if (pBull && Math.abs(pp.close-pp.open)<(pp.high-pp.low)*0.3 && !cBull && c.close<(p.open+p.close)/2) return {name:"Evening Star", type:"bearish", desc:"3-candle bearish reversal pattern."};
  return null;
}

function genCandle(prev) {
  var chg = (Math.random()-0.48)*prev.close*0.004;
  var open2 = prev.close;
  var close2 = parseFloat((open2+chg).toFixed(2));
  var hi = parseFloat((Math.max(open2,close2)+Math.random()*prev.close*0.002).toFixed(2));
  var lo = parseFloat((Math.min(open2,close2)-Math.random()*prev.close*0.002).toFixed(2));
  return {open:open2, close:close2, high:hi, low:lo, vol:Math.floor(50000+Math.random()*300000)};
}

function playAlert() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880,1100,1320].forEach(function(freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0, ctx.currentTime + i*0.12);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i*0.12 + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i*0.12 + 0.2);
      osc.start(ctx.currentTime + i*0.12);
      osc.stop(ctx.currentTime + i*0.12 + 0.25);
    });
  } catch(e) {}
}

function MiniSpark(props) {
  var data = props.data || [];
  var color = props.color || G;
  var w = 50, h = 22;
  if (data.length < 2) return null;
  var min = Math.min.apply(null,data), max = Math.max.apply(null,data), range = max-min||1;
  var pts = data.map(function(v,i){return (i/(data.length-1))*w+","+(h-((v-min)/range)*(h-4)+2);}).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

export default function AlertsScreen() {
  var [stocks, setStocks] = useState(function(){
    return WATCHLIST.map(function(s){
      var candles = [];
      var price = s.base;
      for (var i=0;i<30;i++){
        var chg=(Math.random()-0.48)*price*0.004;
        var o=price, cl=parseFloat((o+chg).toFixed(2));
        var hi=parseFloat((Math.max(o,cl)+Math.random()*price*0.002).toFixed(2));
        var lo=parseFloat((Math.min(o,cl)-Math.random()*price*0.002).toFixed(2));
        candles.push({open:o,close:cl,high:hi,low:lo,vol:Math.floor(50000+Math.random()*300000)});
        price=cl;
      }
      return Object.assign({},s,{candles:candles,ltp:price,alerts:[],spark:candles.map(function(c){return c.close;})});
    });
  });

  var [alerts, setAlerts] = useState([]);
  var [activeFilters, setActiveFilters] = useState(["breakout","breakdown","doji","hammer","shooting","engulf","vwap","volume"]);
  var [alertSound, setAlertSound] = useState(true);
  var [scanning, setScanning] = useState(true);
  var [selStock, setSelStock] = useState(null);
  var alertsRef = useRef([]);
  alertsRef.current = alerts;

  function addAlert(al) {
    var newAlerts = [al].concat(alertsRef.current).slice(0,50);
    setAlerts(newAlerts);
    triggerAlert(al, alertSound);
  }

  function checkBreakout(stock, newCandle, prevCandles) {
    var closes = prevCandles.slice(-20).map(function(c){return c.close;});
    if (closes.length < 5) return null;
    var high20 = Math.max.apply(null, closes.slice(0,-1));
    var low20 = Math.min.apply(null, closes.slice(0,-1));
    var vol = newCandle.vol;
    var avgVol = prevCandles.slice(-10).reduce(function(s,c){return s+c.vol;},0)/10;
    var volSpike = vol > avgVol * 1.5;

    if (newCandle.close > high20 * 1.002 && volSpike) {
      return {type:"Breakout", alertId:"breakout", color:G2, msg:"Price broke above 20-candle high with volume! Strong bullish signal."};
    }
    if (newCandle.close < low20 * 0.998 && volSpike) {
      return {type:"Breakdown", alertId:"breakdown", color:R, msg:"Price broke below 20-candle low with volume! Strong bearish signal."};
    }
    if (volSpike && vol > avgVol * 2) {
      return {type:"Volume Spike", alertId:"volume", color:GOLD, msg:"Volume is 2x+ average! Institutional activity detected."};
    }
    return null;
  }

  useEffect(function() {
    if (!scanning) return;
    var interval = setInterval(function() {
      setStocks(function(prev) {
        return prev.map(function(stock) {
          var newCandle = genCandle(stock.candles[stock.candles.length-1]);
          var newCandles = stock.candles.slice(-29).concat([newCandle]);
          var newSpark = newCandles.slice(-20).map(function(c){return c.close;});

          var bAlert = checkBreakout(stock, newCandle, newCandles);
          if (bAlert && activeFilters.indexOf(bAlert.alertId) != -1) {
            var al = {id:Date.now()+Math.random(), sym:stock.sym, type:bAlert.type, msg:bAlert.msg, color:bAlert.color, time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}), ltp:newCandle.close};
            addAlert(al);
          }

          var pattern = detectPattern(newCandles);
          if (pattern && Math.random() < 0.15) {
            var patId = pattern.type=="bullish"?"breakout":pattern.type=="bearish"?"breakdown":"doji";
            if (activeFilters.indexOf(patId) != -1 || activeFilters.indexOf("engulf") != -1) {
              var pal = {id:Date.now()+Math.random()+1, sym:stock.sym, type:pattern.name, msg:pattern.desc, color:pattern.type=="bullish"?G2:pattern.type=="bearish"?R:GOLD, time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}), ltp:newCandle.close};
              addAlert(pal);
            }
          }

          return Object.assign({},stock,{candles:newCandles,ltp:newCandle.close,spark:newSpark});
        });
      });
    }, 3000);
    return function(){clearInterval(interval);};
  },[scanning, alertSound, activeFilters]);

  function requestNotif() {
    if ("Notification" in window) {
      window.Notification.requestPermission();
    }
  }

  var notifSupported = "Notification" in window;
  var notifGranted = notifSupported && window.Notification.permission == "granted";

  return (
    <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:CB,padding:"12px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T1}}>Live <span style={{color:G}}>Alerts</span></div>
            <div style={{fontSize:8,color:T2}}>Breakouts, Patterns, Volume Spikes</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={function(){setAlertSound(!alertSound);}} style={{background:alertSound?"rgba(0,200,83,0.15)":"rgba(255,255,255,0.06)",border:"1px solid "+(alertSound?G:BD),borderRadius:20,padding:"5px 10px",color:alertSound?G2:T2,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              {alertSound?"Bell ON":"Bell OFF"}
            </button>
            <button onClick={function(){setScanning(!scanning);}} style={{background:scanning?"rgba(0,200,83,0.15)":"rgba(239,68,68,0.1)",border:"1px solid "+(scanning?G:R),borderRadius:20,padding:"5px 10px",color:scanning?G2:R,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              {scanning?"Scanning":"Paused"}
            </button>
          </div>
        </div>

        {/* Alert type filters */}
        <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
          {ALERT_TYPES.map(function(at){
            var act = activeFilters.indexOf(at.id) != -1;
            return (
              <button key={at.id} onClick={function(){
                setActiveFilters(function(prev){
                  return act ? prev.filter(function(f){return f!=at.id;}) : prev.concat([at.id]);
                });
              }} style={{background:act?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.03)",border:"1px solid "+(act?at.color:BD),borderRadius:20,padding:"4px 8px",color:act?at.color:T2,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
                {at.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{padding:"10px 14px 0"}}>

        {/* Notification permission */}
        {notifSupported && !notifGranted ? (
          <div style={{background:"rgba(30,144,255,0.08)",border:"1px solid rgba(30,144,255,0.2)",borderRadius:12,padding:12,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:10,color:"#1E90FF"}}>Enable push notifications for alerts</div>
            <button onClick={requestNotif} style={{background:"#1E90FF",border:"none",borderRadius:8,padding:"5px 12px",color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Enable</button>
          </div>
        ) : null}

        {/* Live watchlist */}
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,overflow:"hidden",marginBottom:12}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between"}}>
            <div style={{fontSize:11,fontWeight:700,color:T1}}>Watchlist ({stocks.length})</div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              {scanning ? <div style={{width:6,height:6,borderRadius:"50%",background:G2}}></div> : null}
              <span style={{fontSize:8,color:scanning?G2:T2}}>{scanning?"Live scanning...":"Paused"}</span>
            </div>
          </div>
          {stocks.map(function(s){
            var chgPct = s.base > 0 ? ((s.ltp - s.base)/s.base*100) : 0;
            var up = chgPct >= 0;
            return (
              <div key={s.sym} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:"1px solid "+BD,cursor:"pointer"}} onClick={function(){setSelStock(selStock==s.sym?null:s.sym);}}>
                <div style={{width:34,height:34,borderRadius:9,background:"rgba(30,144,255,0.1)",border:"1px solid rgba(30,144,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:7,fontWeight:800,color:"#3B82F6"}}>{s.sym.slice(0,3)}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:700,color:T1}}>{s.sym}</div>
                  <div style={{fontSize:8,color:T2}}>{s.sect}</div>
                </div>
                <MiniSpark data={s.spark} color={up?G:R}/>
                <div style={{textAlign:"right",minWidth:72}}>
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:T1}}>
                    {s.ltp>=1000?(s.ltp/1000).toFixed(1)+"K":s.ltp.toFixed(2)}
                  </div>
                  <div style={{fontSize:8,fontWeight:700,color:up?G2:R}}>{up?"+":""}{chgPct.toFixed(2)}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Alerts feed */}
        <div style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700,color:T1}}>Live Alerts <span style={{background:"rgba(0,200,83,0.15)",color:G2,borderRadius:10,padding:"1px 8px",fontSize:9,fontWeight:700,marginLeft:6}}>{alerts.length}</span></div>
            {alerts.length > 0 ? <button onClick={function(){setAlerts([]);}} style={{background:"none",border:"none",color:T2,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Clear All</button> : null}
          </div>

          {alerts.length == 0 ? (
            <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,padding:"30px 20px",textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:8}}>&#128276;</div>
              <div style={{fontSize:13,fontWeight:700,color:T1,marginBottom:4}}>Scanning for Alerts...</div>
              <div style={{fontSize:9,color:T2,lineHeight:1.7}}>Watching {stocks.length} stocks for breakouts, breakdowns, and candlestick patterns. Alerts appear here in real-time.</div>
            </div>
          ) : (
            <div>
              {alerts.slice(0,20).map(function(al){
                return (
                  <div key={al.id} style={{background:CB,border:"1px solid "+BD,borderRadius:12,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid "+al.color}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{background:al.color+"22",color:al.color,borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:800}}>{al.type}</span>
                        <span style={{fontSize:13,fontWeight:800,color:T1}}>{al.sym}</span>
                      </div>
                      <span style={{fontSize:8,color:T2,flexShrink:0}}>{al.time}</span>
                    </div>
                    <div style={{fontSize:10,color:T2,lineHeight:1.6,marginBottom:4}}>{al.msg}</div>
                    <div style={{fontSize:9,fontWeight:700,color:al.color}}>LTP: Rs{al.ltp>=1000?(al.ltp/1000).toFixed(2)+"K":al.ltp.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div style={{background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:10}}>
          <div style={{fontSize:8,color:"#F97316",lineHeight:1.7}}>Educational alerts only. Not SEBI registered. Not buy/sell recommendations. Demo scanning - live data requires market hours connection. Always do your own analysis before trading.</div>
        </div>

      </div>
    </div>
  );
                                                    }
              
