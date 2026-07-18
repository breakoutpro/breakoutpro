import { useState, useEffect, useRef } from "react";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - PatternChartEngine.jsx
// Animated SVG candlestick chart. Candles form one-by-one (60fps via rAF).
// Support/resistance lines, breakout highlight, volume bars, Entry/SL/Target markers.
// Pure black, subtle green/red. Rules: no backtick, no triple-equals, ASCII only.

var UP="#22C55E",DOWN="#EF4444",WICK="#5B6472",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",GRID="#141821";

// Chart geometry.
var W=340, H=220, PADL=8, PADR=8, PADT=12, VOLH=34, GAP=4;

export default function PatternChartEngine(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var GRID = theme.c.border2, T2 = theme.c.text2, WICK = theme.c.text3;

  // candles: [{o,h,l,c,vol,breakout?}], lines:[{type,y1,y2,color,label}], markers:[{type,price,label}]
  var spec=props.spec||{};
  var candles=spec.candles||[];
  var lines=spec.lines||[];
  var markers=spec.markers||[];

  var [shown,setShown]=useState(props.autoplay?0:candles.length);
  var [playing,setPlaying]=useState(!!props.autoplay);
  var [speed,setSpeed]=useState(1);
  var rafRef=useRef(0);
  var lastRef=useRef(0);
  var accRef=useRef(0);

  // price range across all candles
  var allH=[],allL=[];
  candles.forEach(function(c){ allH.push(c.h); allL.push(c.l); });
  markers.forEach(function(m){ allH.push(m.price); allL.push(m.price); });
  var maxP=allH.length?Math.max.apply(null,allH):100;
  var minP=allL.length?Math.min.apply(null,allL):0;
  var rng=(maxP-minP)||1;
  var padR=rng*0.08; maxP+=padR; minP-=padR; rng=maxP-minP;

  var maxVol=1; candles.forEach(function(c){ if(c.vol>maxVol)maxVol=c.vol; });

  var chartTop=PADT, chartBot=H-VOLH-GAP;
  var chartH=chartBot-chartTop;
  var plotW=W-PADL-PADR;
  var cw=candles.length?(plotW/candles.length):10;
  var bodyW=Math.max(3,Math.min(14,cw*0.6));

  function yPrice(p){ return chartTop + (1-(p-minP)/rng)*chartH; }
  function xCandle(i){ return PADL + i*cw + cw/2; }

  // animation loop
  useEffect(function(){
    if(!playing) return;
    function step(ts){
      if(!lastRef.current) lastRef.current=ts;
      var dt=ts-lastRef.current; lastRef.current=ts;
      accRef.current += dt*speed;
      var perCandle=260; // ms per candle
      if(accRef.current>=perCandle){
        accRef.current=0;
        setShown(function(s){
          if(s>=candles.length){ setPlaying(false); return s; }
          return s+1;
        });
      }
      rafRef.current=requestAnimationFrame(step);
    }
    rafRef.current=requestAnimationFrame(step);
    return function(){ cancelAnimationFrame(rafRef.current); lastRef.current=0; };
  },[playing,speed,candles.length]);

  function play(){
    if(shown>=candles.length){ setShown(0); }
    setPlaying(true);
  }
  function pause(){ setPlaying(false); }
  function replay(){ setShown(0); accRef.current=0; lastRef.current=0; setPlaying(true); }

  var progress=candles.length?shown/candles.length:1;

  return (
    <div>
      <div style={{background:"#08090D",border:"1px solid "+GRID,borderRadius:14,padding:"10px 6px 6px",overflow:"hidden"}}>
        <svg width="100%" viewBox={"0 0 "+W+" "+H} style={{display:"block"}}>
          {/* grid lines */}
          {[0,0.25,0.5,0.75,1].map(function(g,i){
            var y=chartTop+g*chartH;
            return <line key={i} x1={PADL} y1={y} x2={W-PADR} y2={y} stroke={GRID} strokeWidth="1"/>;
          })}

          {/* support / resistance / trend lines (draw only after enough candles shown) */}
          {lines.map(function(ln,i){
            var reveal = progress >= (ln.showAt||0.5);
            if(!reveal) return null;
            var y1=yPrice(ln.y1), y2=yPrice(ln.y2!=undefined?ln.y2:ln.y1);
            var x1=ln.x1!=undefined?(PADL+ln.x1*plotW):PADL;
            var x2=ln.x2!=undefined?(PADL+ln.x2*plotW):(W-PADR);
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ln.color||CYAN} strokeWidth="1.4" strokeDasharray={ln.dash||"5 4"} opacity="0.9"/>
                {ln.label?<text x={x2-2} y={y2-4} fontSize="7" fill={ln.color||CYAN} textAnchor="end">{ln.label}</text>:null}
              </g>
            );
          })}

          {/* candles */}
          {candles.slice(0,shown).map(function(c,i){
            var x=xCandle(i);
            var col=c.c>=c.o?UP:DOWN;
            var bodyTop=yPrice(Math.max(c.o,c.c));
            var bodyBot=yPrice(Math.min(c.o,c.c));
            var isBreak=c.breakout;
            return (
              <g key={i} style={{opacity:1}}>
                {isBreak?<rect x={x-cw/2} y={chartTop} width={cw} height={chartH} fill={col} opacity="0.06"/>:null}
                <line x1={x} y1={yPrice(c.h)} x2={x} y2={yPrice(c.l)} stroke={isBreak?col:WICK} strokeWidth={isBreak?"1.4":"1"}/>
                <rect x={x-bodyW/2} y={bodyTop} width={bodyW} height={Math.max(1.5,bodyBot-bodyTop)} fill={col} rx="1" stroke={isBreak?"#fff":"none"} strokeWidth={isBreak?"0.6":"0"}/>
                {isBreak?<text x={x} y={yPrice(c.h)-5} fontSize="8" fill={col} textAnchor="middle" fontWeight="bold">{c.c>=c.o?"&#9650;":"&#9660;"}</text>:null}
              </g>
            );
          })}

          {/* markers: entry / sl / target (after animation mostly done) */}
          {progress>=0.85?markers.map(function(m,i){
            var y=yPrice(m.price);
            var col=m.type=="sl"?DOWN:m.type=="target"?UP:CYAN;
            return (
              <g key={i}>
                <line x1={PADL} y1={y} x2={W-PADR} y2={y} stroke={col} strokeWidth="1" strokeDasharray="2 3" opacity="0.8"/>
                <rect x={PADL} y={y-7} width={48} height={13} rx="3" fill={col} opacity="0.9"/>
                <text x={PADL+5} y={y+2.5} fontSize="7.5" fill="#04060D" fontWeight="bold">{m.label}</text>
              </g>
            );
          }):null}

          {/* volume bars */}
          {candles.slice(0,shown).map(function(c,i){
            var x=xCandle(i);
            var vh=(c.vol/maxVol)*VOLH;
            var col=c.c>=c.o?UP:DOWN;
            return <rect key={"v"+i} x={x-bodyW/2} y={H-vh} width={bodyW} height={vh} fill={col} opacity={c.breakout?"0.7":"0.28"} rx="0.5"/>;
          })}
        </svg>
      </div>

      {/* CONTROLS */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
        {playing?
          <button onClick={pause} style={ctrlBtn(true)}>&#10074;&#10074; Pause</button>
          :
          <button onClick={play} style={ctrlBtn(true)}>&#9654; Play</button>
        }
        <button onClick={replay} style={ctrlBtn(false)}>&#8635; Replay</button>
        <div style={{flex:1}}></div>
        {[1,2].map(function(sp){
          var act=speed==sp;
          return <button key={sp} onClick={function(){setSpeed(sp);}} style={{background:act?CYAN:"rgba(255,255,255,0.05)",border:"1px solid "+(act?CYAN:GRID),borderRadius:8,padding:"6px 11px",color:act?"#04060D":T2,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{sp}x</button>;
        })}
      </div>

      {/* progress bar */}
      <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginTop:9}}>
        <div style={{height:3,width:(progress*100)+"%",background:CYAN,borderRadius:2,transition:"width 0.1s"}}></div>
      </div>
    </div>
  );
}

function ctrlBtn(primary){
  return {
    background:primary?"rgba(59,130,246,0.15)":"rgba(255,255,255,0.05)",
    border:"1px solid "+(primary?"rgba(59,130,246,0.4)":"#141821"),
    borderRadius:9,padding:"8px 14px",
    color:primary?"#60A5FA":"#A0A7B4",
    fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"
  };
              }

