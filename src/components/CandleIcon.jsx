import React from "react";

// BreakoutPro - CandleIcon.jsx
// Reusable inline SVG candlestick icons for every pattern. No PNG/JPG.
// Optional slow formation animation via animate flag. Rules: no backtick, no triple-equals, ASCII.

var G="#22C55E",R="#EF4444",N="#A0A7B4";

// one candle: x center, body top/bottom (y), wick top/bottom (y), color
function C(cx,bt,bb,wt,wb,col,w,key,anim,delay){
  var bw=w||9;
  var body=React.createElement("rect",{x:cx-bw/2,y:Math.min(bt,bb),width:bw,height:Math.max(2,Math.abs(bb-bt)),fill:col,rx:1});
  var wick=React.createElement("line",{x1:cx,y1:wt,x2:cx,y2:wb,stroke:col,strokeWidth:1.4});
  var g=React.createElement("g",{key:key||cx,style:anim?{animation:"cndl 0.5s ease "+(delay||0)+"s both"}:null},wick,body);
  return g;
}

// each pattern returns an array of candle elements drawn in a 0..100 x, 0..100 y box
function draw(name,anim){
  var a=anim;
  switch(name){
    case "Bullish Engulfing": return [C(35,45,60,38,66,R,9,"1",a,0),C(60,25,62,20,68,G,15,"2",a,0.3)];
    case "Bearish Engulfing": return [C(35,40,55,34,60,G,9,"1",a,0),C(60,22,64,18,70,R,15,"2",a,0.3)];
    case "Doji": return [C(50,48,52,20,80,N,12,"1",a,0)];
    case "Long Legged Doji": case "Long-Legged Doji": return [C(50,49,51,12,88,N,12,"1",a,0)];
    case "Dragonfly Doji": return [C(50,28,30,26,82,G,12,"1",a,0)];
    case "Gravestone Doji": return [C(50,70,72,18,74,R,12,"1",a,0)];
    case "Hammer": return [C(50,30,42,26,82,G,12,"1",a,0)];
    case "Hanging Man": return [C(50,28,40,24,80,R,12,"1",a,0)];
    case "Inverted Hammer": return [C(50,58,70,20,74,G,12,"1",a,0)];
    case "Shooting Star": return [C(50,58,70,20,74,R,12,"1",a,0)];
    case "Morning Star": return [C(28,25,45,20,50,R,11,"1",a,0),C(50,66,72,62,76,G,7,"2",a,0.3),C(72,30,52,26,56,G,11,"3",a,0.6)];
    case "Evening Star": return [C(28,45,25,20,50,G,11,"1",a,0),C(50,26,32,22,36,R,7,"2",a,0.3),C(72,52,30,26,56,R,11,"3",a,0.6)];
    case "Three White Soldiers": return [C(28,55,70,50,74,G,10,"1",a,0),C(50,38,54,34,58,G,10,"2",a,0.3),C(72,22,40,18,44,G,10,"3",a,0.6)];
    case "Three Black Crows": return [C(28,30,45,26,50,R,10,"1",a,0),C(50,46,62,42,66,R,10,"2",a,0.3),C(72,60,78,56,82,R,10,"3",a,0.6)];
    case "Harami": return [C(38,25,65,20,70,R,16,"1",a,0),C(62,42,54,38,58,G,8,"2",a,0.3)];
    case "Harami Cross": return [C(38,25,65,20,70,R,16,"1",a,0),C(62,47,49,40,56,N,10,"2",a,0.3)];
    case "Piercing Line": return [C(38,28,60,24,64,R,11,"1",a,0),C(62,40,66,36,70,G,11,"2",a,0.3)];
    case "Dark Cloud Cover": return [C(38,60,32,28,64,G,11,"1",a,0),C(62,34,58,30,62,R,11,"2",a,0.3)];
    case "Marubozu": case "Bullish Marubozu": return [C(50,25,72,25,72,G,16,"1",a,0)];
    case "Bearish Marubozu": return [C(50,25,72,25,72,R,16,"1",a,0)];
    case "Spinning Top": return [C(50,44,56,26,74,N,11,"1",a,0)];
    case "Tweezer Top": return [C(38,40,60,22,64,G,10,"1",a,0),C(62,40,58,22,62,R,10,"2",a,0.3)];
    case "Tweezer Bottom": return [C(38,40,60,36,78,R,10,"1",a,0),C(62,42,60,38,78,G,10,"2",a,0.3)];
    case "Inside Bar": return [C(38,22,72,18,76,N,12,"1",a,0),C(62,40,56,34,60,G,8,"2",a,0.3)];
    case "Outside Bar": return [C(38,40,56,34,60,R,8,"1",a,0),C(62,22,72,18,76,G,12,"2",a,0.3)];
    case "Rising Three Methods": return [C(22,30,62,26,66,G,10,"1",a,0),C(42,44,54,40,58,R,6,"2",a,0.2),C(54,48,58,44,62,R,6,"3",a,0.35),C(66,50,60,46,64,R,6,"4",a,0.5),C(84,24,58,20,62,G,10,"5",a,0.7)];
    case "Falling Three Methods": return [C(22,62,30,26,66,R,10,"1",a,0),C(42,44,54,40,58,G,6,"2",a,0.2),C(54,42,48,38,52,G,6,"3",a,0.35),C(66,40,50,36,54,G,6,"4",a,0.5),C(84,60,26,20,64,R,10,"5",a,0.7)];
    default: return [C(50,40,60,30,70,N,11,"1",a,0)];
  }
}

export default function CandleIcon(props){
  var size=props.size||44;
  var anim=!!props.animate;
  var vb="0 0 100 100";
  return React.createElement("svg",{width:size,height:size,viewBox:vb,style:{display:"block"}},
    anim?React.createElement("style",null,"@keyframes cndl{from{opacity:0;transform:translateY(8px) scaleY(0.4);transform-origin:center}to{opacity:1;transform:none}}"):null,
    draw(props.name,anim)
  );
}

