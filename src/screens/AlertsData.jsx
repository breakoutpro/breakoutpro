import { useState, useEffect, useRef } from "react";

var BG="#07111F",CARD="#101B2E",BD="#1E3A5F",BLUE="#3B82F6",BLUE2="#60A5FA",PURPLE="#7C3AED",PURPLE2="#A855F7",GOLD="#F59E0B",UP="#22C55E",DOWN="#EF4444",T1="#FFFFFF",T2="#94A3B8",T3="#475569";

var EQ=[
  {sym:"NIFTY 50",ltp:23969,base:23969,sect:"Index"},
  {sym:"BANKNIFTY",ltp:52134,base:52134,sect:"Index"},
  {sym:"RELIANCE",ltp:2845.60,base:2845.60,sect:"Energy"},
  {sym:"TCS",ltp:3654.20,base:3654.20,sect:"IT"},
  {sym:"HDFCBANK",ltp:1742.50,base:1742.50,sect:"Bank"},
  {sym:"ICICIBANK",ltp:1289.30,base:1289.30,sect:"Bank"},
  {sym:"INFY",ltp:1567.80,base:1567.80,sect:"IT"},
  {sym:"SBIN",ltp:812.30,base:812.30,sect:"Bank"},
  {sym:"TATAMOTORS",ltp:945.60,base:945.60,sect:"Auto"},
  {sym:"AXISBANK",ltp:1156.70,base:1156.70,sect:"Bank"},
];

var CM=[
  {sym:"GOLD",ltp:71245,base:71245,sect:"MCX"},
  {sym:"SILVER",ltp:87654,base:87654,sect:"MCX"},
  {sym:"CRUDEOIL",ltp:6823,base:6823,sect:"MCX"},
  {sym:"NATURALGAS",ltp:243,base:243,sect:"MCX"},
];

var PATTERNS=[
  {id:"bullEng",  name:"Bullish Engulfing", type:"bullish",icon:"BE"},
  {id:"bearEng",  name:"Bearish Engulfing", type:"bearish",icon:"SE"},
  {id:"hammer",   name:"Hammer at Support", type:"bullish",icon:"HM"},
  {id:"shootStar",name:"Shooting Star",     type:"bearish",icon:"SS"},
  {id:"morning",  name:"Morning Star",      type:"bullish",icon:"MS"},
  {id:"evening",  name:"Evening Star",      type:"bearish",icon:"ES"},
  {id:"marubozu", name:"Bullish Marubozu",  type:"bullish",icon:"MB"},
  {id:"doji",     name:"Doji at Resistance",type:"bearish",icon:"DJ"},
];

var BREAKOUTS=[
  {id:"resBreak", name:"Resistance Breakout",  type:"bullish"},
  {id:"supBreak", name:"Support Breakdown",     type:"bearish"},
  {id:"volBreak", name:"Volume Breakout",        type:"bullish"},
  {id:"vwap",     name:"VWAP Reclaim",           type:"bullish"},
  {id:"ema",      name:"EMA Crossover",          type:"bullish"},
  {id:"52wh",     name:"52 Week High Breakout",  type:"bullish"},
  {id:"gapDown",  name:"Gap Down",                type:"bearish"},
  {id:"emaDown",  name:"EMA Breakdown",           type:"bearish"},
];

var OI_TYPES=[
  {id:"callWrite",name:"Heavy Call Writing", type:"bearish"},
  {id:"putWrite", name:"Heavy Put Writing",  type:"bullish"},
  {id:"longBuild",name:"Long Build Up",      type:"bullish"},
  {id:"shortCov", name:"Short Covering",     type:"bullish"},
  {id:"shortBuild",name:"Short Build Up",    type:"bearish"},
  {id:"maxPain",  name:"Max Pain Shift",     type:"neutral"},
];

var SECTORS=[
  {name:"IT",     status:"Strong",up:true},
  {name:"Banking",status:"Strong",up:true},
  {name:"Auto",   status:"Weak",  up:false},
  {name:"Metal",  status:"Rally", up:true},
  {name:"Pharma", status:"Strong",up:true},
  {name:"Realty", status:"Weak",  up:false},
];

var ALERT_FILTERS=[
  {id:"candle",  label:"Candlestick"},
  {id:"breakout",label:"Breakout"},
  {id:"oi",      label:"OI Data"},
  {id:"fiidii",  label:"FII/DII"},
  {id:"sector",  label:"Sector"},
  {id:"news",    label:"News"},
];

function getSess(){
  var m=new Date().getHours()*60+new Date().getMinutes();
  if(m>=9*60+15&&m<15*60+30)return"equity";
  if(m>=15*60+30||m<2*60)return"commodity";
  return"global";
}

function genCandle(prev){
  var chg=(Math.random()-0.48)*prev.close*0.004;
  var o=prev.close,cl=parseFloat((o+chg).toFixed(2));
  var hi=parseFloat((Math.max(o,cl)+Math.random()*prev.close*0.002).toFixed(2));
  var lo=parseFloat((Math.min(o,cl)-Math.random()*prev.close*0.002).toFixed(2));
  return{open:o,close:cl,high:hi,low:lo,vol:Math.floor(50000+Math.random()*300000)};
}

function calcConfidence(){return Math.floor(65+Math.random()*30);}
function riskFromConf(c){return c>=80?"Low":c>=60?"Medium":"High";}

function playSound(){
  try{
    var ctx=new(window.AudioContext||window.webkitAudioContext)();
    [880,1100,1320].forEach(function(f,i){
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.frequency.value=f;o.type="sine";
      g.gain.setValueAtTime(0,ctx.currentTime+i*0.12);
      g.gain.linearRampToValueAtTime(0.22,ctx.currentTime+i*0.12+0.05);
      g.gain.linearRampToValueAtTime(0,ctx.currentTime+i*0.12+0.2);
      o.start(ctx.currentTime+i*0.12);o.stop(ctx.currentTime+i*0.12+0.25);
    });
  }catch(e){}
}

function MiniSpark(props){
  var d=props.data||[],col=props.color||BLUE2,w=46,h=20;
  if(d.length<2)return null;
  var mn=Math.min.apply(null,d),mx=Math.max.apply(null,d),rng=mx-mn||1;
  var pts=d.map(function(v,i){return(i/(d.length-1))*w+","+(h-((v-mn)/rng)*(h-4)+2);}).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

export { EQ, CM, PATTERNS, BREAKOUTS, OI_TYPES, SECTORS, ALERT_FILTERS, getSess, genCandle, calcConfidence, riskFromConf, playSound };
