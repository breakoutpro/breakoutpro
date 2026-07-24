import { useState, useEffect, useRef } from "react";
import { nowT } from "../utils/helpers";

function loadWatchlist() {
  try {
    var saved = JSON.parse(localStorage.getItem("bp_watchlist") || "null");
    if (saved && Array.isArray(saved)) return saved;
  } catch(e) {}
  return ["NIFTY 50","BANKNIFTY","RELIANCE","TCS","HDFCBANK"];
}

function loadScanInterval() {
  try {
    var s = JSON.parse(localStorage.getItem("bp_settings") || "{}");
    var mins = parseInt(s.scanInterval || "5", 10);
    if (isNaN(mins) || mins <= 0) mins = 5;
    return mins * 60000;
  } catch(e) {
    return 300000;
  }
}

function isSoundEnabled() {
  try {
    var s = JSON.parse(localStorage.getItem("bp_settings") || "{}");
    return s.alertSound != false;
  } catch(e) {
    return true;
  }
}

function playBellSound() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var now = ctx.currentTime;

    var fundamentals = [880, 1318.5, 1760, 2637];
    var gains = [0.9, 0.5, 0.3, 0.15];

    fundamentals.forEach(function(freq, i) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = freq;
      o.type = "sine";
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(gains[i], now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      o.start(now);
      o.stop(now + 1.5);
    });

    var o2 = ctx.createOscillator();
    var g2 = ctx.createGain();
    o2.connect(g2);
    g2.connect(ctx.destination);
    o2.frequency.value = 880;
    o2.type = "sine";
    g2.gain.setValueAtTime(0, now + 0.45);
    g2.gain.linearRampToValueAtTime(0.7, now + 0.46);
    g2.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    o2.start(now + 0.45);
    o2.stop(now + 1.7);
  } catch(e) {}
}

function loadAlertHistory() {
  try {
    var saved = JSON.parse(localStorage.getItem("bp_pattern_alerts") || "null");
    if (saved && Array.isArray(saved)) return saved;
  } catch(e) {}
  return [];
}

function saveAlertHistory(list) {
  try { localStorage.setItem("bp_pattern_alerts", JSON.stringify(list.slice(0,40))); } catch(e) {}
}

function loadSeenIds() {
  try {
    var saved = JSON.parse(localStorage.getItem("bp_pattern_seen") || "null");
    if (saved && Array.isArray(saved)) return saved;
  } catch(e) {}
  return [];
}

var BASE_PRICES={
  "NIFTY 50":23969,"BANKNIFTY":52134,"SENSEX":78950,"RELIANCE":2845.60,"TCS":3654.20,
  "HDFCBANK":1742.50,"ICICIBANK":1289.30,"INFY":1567.80,"SBIN":812.30,"TATAMOTORS":945.60,
  "AXISBANK":1156.70,"WIPRO":487.20,"SUNPHARMA":1654.30,"ITC":462.80,"BAJFINANCE":7234.50,
};

function genCandle(prev){
  var chg=(Math.random()-0.48)*prev.close*0.005;
  var o=prev.close,cl=parseFloat((o+chg).toFixed(2));
  var hi=parseFloat((Math.max(o,cl)+Math.random()*prev.close*0.003).toFixed(2));
  var lo=parseFloat((Math.min(o,cl)-Math.random()*prev.close*0.003).toFixed(2));
  return{open:o,close:cl,high:hi,low:lo};
}

function detectPattern(c1,c2,c3){
  var body1=Math.abs(c1.close-c1.open);
  var body2=Math.abs(c2.close-c2.open);
  var range2=c2.high-c2.low;
  var upperWick2=c2.high-Math.max(c2.open,c2.close);
  var lowerWick2=Math.min(c2.open,c2.close)-c2.low;

  if(c1.close<c1.open&&c2.close>c2.open&&c2.close>c1.open&&c2.open<c1.close) return {name:"Bullish Engulfing",type:"bullish",conf:82};
  if(c1.close>c1.open&&c2.close<c2.open&&c2.close<c1.open&&c2.open>c1.close) return {name:"Bearish Engulfing",type:"bearish",conf:80};
  if(lowerWick2>body2*2&&upperWick2<body2*0.5&&c2.close>=c2.open) return {name:"Hammer",type:"bullish",conf:75};
  if(upperWick2>body2*2&&lowerWick2<body2*0.5&&c2.close<=c2.open) return {name:"Shooting Star",type:"bearish",conf:74};
  if(body2<range2*0.1) return {name:"Doji",type:"neutral",conf:60};
  if(c3&&c1.close<c1.open&&body2<Math.abs(c1.close-c1.open)*0.4&&c3.close>c3.open&&c3.close>(c1.open+c1.close)/2) return {name:"Morning Star",type:"bullish",conf:85};
  if(c3&&c1.close>c1.open&&body2<Math.abs(c1.close-c1.open)*0.4&&c3.close<c3.open&&c3.close<(c1.open+c1.close)/2) return {name:"Evening Star",type:"bearish",conf:84};
  if(upperWick2<body2*0.1&&lowerWick2<body2*0.1&&c2.close>c2.open) return {name:"Bullish Marubozu",type:"bullish",conf:70};
  if(upperWick2<body2*0.1&&lowerWick2<body2*0.1&&c2.close<c2.open) return {name:"Bearish Marubozu",type:"bearish",conf:70};
  return null;
}

function detectMPattern(candles){
  if(candles.length<7) return null;
  var closes=candles.map(function(c){return c.close;});
  var n=closes.length;
  var mid=Math.floor(n/2);
  var peak1=Math.max.apply(null,closes.slice(0,mid));
  var peak2=Math.max.apply(null,closes.slice(mid));
  var valley=Math.min.apply(null,closes.slice(Math.floor(n*0.3),Math.floor(n*0.7)));
  var avgPeak=(peak1+peak2)/2;
  if(Math.abs(peak1-peak2)/avgPeak<0.01 && valley<avgPeak*0.985){
    return {name:"M Pattern (Double Top)",type:"bearish",conf:72};
  }
  var trough1=Math.min.apply(null,closes.slice(0,mid));
  var trough2=Math.min.apply(null,closes.slice(mid));
  var peakMid=Math.max.apply(null,closes.slice(Math.floor(n*0.3),Math.floor(n*0.7)));
  var avgTrough=(trough1+trough2)/2;
  if(Math.abs(trough1-trough2)/avgTrough<0.01 && peakMid>avgTrough*1.015){
    return {name:"W Pattern (Double Bottom)",type:"bullish",conf:73};
  }
  return null;
}

export default function useWatchlistAlerts(){
  var [latestAlert,setLatestAlert]=useState(null);
  var [alertHistory,setAlertHistory]=useState(loadAlertHistory());
  var [intervalMs,setIntervalMs]=useState(loadScanInterval());
  var stateRef=useRef({});
  var seenRef=useRef(loadSeenIds());

  useEffect(function(){
    var poll=setInterval(function(){
      var current=loadScanInterval();
      setIntervalMs(function(prev){ return prev!=current ? current : prev; });
    },5000);
    return function(){clearInterval(poll);};
  },[]);

  useEffect(function(){
    var watchlist=loadWatchlist();
    watchlist.forEach(function(sym){
      if(!stateRef.current[sym]){
        var base=BASE_PRICES[sym]||1000+Math.random()*2000;
        var candles=[{open:base,close:base,high:base,low:base}];
        for(var i=0;i<6;i++) candles.push(genCandle(candles[candles.length-1]));
        stateRef.current[sym]=candles;
      }
    });

    function scan(){
      var watchlistNow=loadWatchlist();
      var windowMs=loadScanInterval();
      watchlistNow.forEach(function(sym){
        if(!stateRef.current[sym]){
          var base=BASE_PRICES[sym]||1000+Math.random()*2000;
          var candles=[{open:base,close:base,high:base,low:base}];
          for(var i=0;i<6;i++) candles.push(genCandle(candles[candles.length-1]));
          stateRef.current[sym]=candles;
        }
        var hist=stateRef.current[sym];
        var nc=genCandle(hist[hist.length-1]);
        var newHist=hist.slice(-9).concat([nc]);
        stateRef.current[sym]=newHist;

        var n=newHist.length;
        var pattern=detectPattern(newHist[n-3]||newHist[0],newHist[n-2]||newHist[0],newHist[n-1]);
        var mPattern=detectMPattern(newHist);
        var found=mPattern||pattern;

        if(found){
          var alertId=sym+"_"+found.name+"_"+Math.floor(Date.now()/windowMs);
          if(seenRef.current.indexOf(alertId)==-1){
            seenRef.current.push(alertId);
            if(seenRef.current.length>200) seenRef.current=seenRef.current.slice(-100);
            try{localStorage.setItem("bp_pattern_seen",JSON.stringify(seenRef.current));}catch(e){}

            var alert={
              id:alertId,
              sym:sym,
              pattern:found.name,
              type:found.type,
              conf:found.conf,
              price:nc.close,
              time:nowT(),
              timestamp:Date.now(),
            };

            setLatestAlert(alert);
            setAlertHistory(function(prev){
              var updated=[alert].concat(prev).slice(0,40);
              saveAlertHistory(updated);
              return updated;
            });

            if(isSoundEnabled()){
              playBellSound();
            }

            try{
              if(typeof Notification!="undefined"&&Notification.permission=="granted"){
                var n=new Notification("BreakoutPro: "+sym,{
                  body:found.name+" pattern detected on "+sym+" (educational alert)",
                  icon:"/favicon.ico",
                  tag:alertId,
                });
              }
            }catch(e){}
          }
        }
      });
    }

    var t=setInterval(scan,intervalMs);
    return function(){clearInterval(t);};
  },[intervalMs]);

  function clearLatest(){ setLatestAlert(null); }
  function requestPermission(){
    try{
      if(typeof Notification!="undefined"&&Notification.permission=="default"){
        Notification.requestPermission();
      }
    }catch(e){}
  }
  function testBell(){
    playBellSound();
  }
  function getNotifPermission(){
    try{
      if(typeof Notification=="undefined") return "unsupported";
      return Notification.permission;
    }catch(e){return "unsupported";}
  }

  return {latestAlert:latestAlert, alertHistory:alertHistory, clearLatest:clearLatest, requestPermission:requestPermission, testBell:testBell, notifPermission:getNotifPermission()};
}
