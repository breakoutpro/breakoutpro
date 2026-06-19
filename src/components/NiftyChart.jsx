import { useEffect, useRef, useState } from "react";
import { TOOLS, drawOnCanvas } from "./ChartDrawing";

var CARD="#101B2E",CARD2="#0D1829",BD="#1E3A5F";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6",BLUE2="#60A5FA";
var T1="#FFFFFF",T2="#94A3B8",T3="#475569",GOLD="#F59E0B";

var TF_CFG={
  "1m":{range:"1d",interval:"1m",secs:60},
  "2m":{range:"5d",interval:"2m",secs:120},
  "3m":{range:"5d",interval:"5m",secs:180},
  "5m":{range:"5d",interval:"5m",secs:300},
  "15m":{range:"1mo",interval:"15m",secs:900},
  "30m":{range:"1mo",interval:"30m",secs:1800},
  "1H":{range:"3mo",interval:"60m",secs:3600},
  "1D":{range:"1y",interval:"1d",secs:86400},
  "1W":{range:"5y",interval:"1wk",secs:604800},
};
var TF_LIST=["1m","2m","3m","5m","15m","30m","1H","1D","1W"];

function loadLWC(cb){
  if(window.LightweightCharts){cb();return;}
  var s=document.createElement("script");
  s.src="https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js";
  s.onload=function(){cb();};
  s.onerror=function(){cb(new Error("failed"));};
  document.head.appendChild(s);
}

var mockCache={};
function genMock(tf,ltp){
  var base=ltp||23850;
  var key=tf+"_"+Math.floor(base);
  if(mockCache[key]){
    var now=Math.floor(Date.now()/1000);
    var cfg2=TF_CFG[tf]||TF_CFG["15m"];
    return mockCache[key].map(function(c,i){return Object.assign({},c,{time:now-(mockCache[key].length-i)*cfg2.secs});});
  }
  var cfg=TF_CFG[tf]||TF_CFG["15m"];
  var now=Math.floor(Date.now()/1000);
  var arr=[],count=120,seed=Math.floor(base*100);
  function sr(){seed=(seed*9301+49297)%233280;return seed/233280;}
  var cur=base*0.96;
  for(var i=0;i<count;i++){
    var chg=(sr()-0.48)*cur*0.003;
    var o=parseFloat(cur.toFixed(2));
    var c=parseFloat((cur+chg).toFixed(2));
    var h=parseFloat((Math.max(o,c)+sr()*cur*0.001).toFixed(2));
    var l=parseFloat((Math.min(o,c)-sr()*cur*0.001).toFixed(2));
    arr.push({time:now-(count-i)*cfg.secs,open:o,high:h,low:l,close:c,volume:Math.floor(50000+sr()*500000)});
    cur=c;
  }
  arr[arr.length-1].close=parseFloat(base.toFixed(2));
  mockCache[key]=arr;
  return arr;
}

function pad(n){return n<10?"0"+n:""+n;}
function fmtTime(secs){
  var h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=secs%60;
  return h>0?pad(h)+":"+pad(m)+":"+pad(s):pad(m)+":"+pad(s);
}
function fmtN(n){
  if(n==null||isNaN(n))return"--";
  return n.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
}
function fmtVol(v){
  if(!v)return"--";
  if(v>=10000000)return(v/10000000).toFixed(1)+" Cr";
  if(v>=100000)return(v/100000).toFixed(1)+" L";
  if(v>=1000)return(v/1000).toFixed(0)+"K";
  return""+v;
}

export default function NiftyChart(){
  var chartRef=useRef(null);
  var canvasRef=useRef(null);
  var chartObj=useRef(null);
  var candleRef=useRef(null);
  var volRef=useRef(null);
  var ltpRef=useRef(null);
  var [tf,setTf]=useState("15m");
  var [loading,setLoading]=useState(true);
  var [err,setErr]=useState(null);
  var [ltp,setLtp]=useState(0);
  var [prevClose,setPrevClose]=useState(0);
  var [cs,setCs]=useState({open:0,high:0,low:0,close:0,vol:0,todayHigh:0,todayLow:0});
  var [countdown,setCountdown]=useState(0);
  var [activeTool,setActiveTool]=useState("none");
  var [drawings,setDrawings]=useState([]);
  var [pending,setPending]=useState(null);

  function calcTimer(timeframe){
    var cfg=TF_CFG[timeframe]||TF_CFG["15m"];
    return cfg.secs-(Math.floor(Date.now()/1000)%cfg.secs)-1;
  }

  function applyCandles(arr,timeframe){
    if(!arr||arr.length<2)return;
    var last=arr[arr.length-1];
    var td=arr.slice(-78);
    setCs({open:last.open,high:last.high,low:last.low,close:last.close,vol:last.volume||0,
      todayHigh:Math.max.apply(null,td.map(function(c){return c.high;})),
      todayLow:Math.min.apply(null,td.map(function(c){return c.low;}))});
    if(candleRef.current) candleRef.current.setData(arr.map(function(c){return{time:c.time,open:c.open,high:c.high,low:c.low,close:c.close};}));
    if(volRef.current) volRef.current.setData(arr.map(function(c){return{time:c.time,value:c.volume||0,color:c.close>=c.open?"rgba(34,197,94,0.35)":"rgba(239,68,68,0.35)"};}));
    if(chartObj.current) chartObj.current.timeScale().fitContent();
    setCountdown(calcTimer(timeframe));
    setLoading(false);
  }

  function fetchLTP(){
    return fetch("/api/history?symbol=%5ENSEI&range=1d&interval=1m")
      .then(function(r){return r.json();})
      .then(function(d){
        if(d.candles&&d.candles.length>1){
          var last=d.candles[d.candles.length-1];
          if(last.close>1000){ltpRef.current=last.close;setLtp(last.close);setPrevClose(d.candles[0].open);}
          return ltpRef.current||23850;
        }
        if(!ltpRef.current){ltpRef.current=23850;setLtp(23850);setPrevClose(23650);}
        return ltpRef.current;
      })
      .catch(function(){
        if(!ltpRef.current){ltpRef.current=23850;setLtp(23850);setPrevClose(23650);}
        return ltpRef.current;
      });
  }

  function fetchCandles(timeframe,liveLtp){
    setLoading(true);setErr(null);
    var cfg=TF_CFG[timeframe]||TF_CFG["15m"];
    fetch("/api/history?symbol=%5ENSEI&range="+cfg.range+"&interval="+cfg.interval)
      .then(function(r){return r.json();})
      .then(function(d){applyCandles((d.candles&&d.candles.length>5)?d.candles:genMock(timeframe,liveLtp),timeframe);})
      .catch(function(){applyCandles(genMock(timeframe,liveLtp),timeframe);});
  }

  useEffect(function(){
    loadLWC(function(e){
      if(e||!window.LightweightCharts){setErr("Chart failed to load");setLoading(false);return;}
      if(!chartRef.current)return;
      var chart=window.LightweightCharts.createChart(chartRef.current,{
        width:chartRef.current.clientWidth,height:255,
        layout:{background:{color:CARD},textColor:T2,fontFamily:"Inter,Arial,sans-serif"},
        grid:{vertLines:{color:"rgba(30,58,95,0.5)"},horzLines:{color:"rgba(30,58,95,0.5)"}},
        crosshair:{mode:1,vertLine:{color:BLUE2,labelBackgroundColor:BLUE},horzLine:{color:BLUE2,labelBackgroundColor:BLUE}},
        rightPriceScale:{borderColor:BD},
        timeScale:{borderColor:BD,timeVisible:true,secondsVisible:false,rightOffset:4},
        handleScroll:{mouseWheel:true,pressedMouseMove:true,horzTouchDrag:true},
        handleScale:{mouseWheel:true,pinch:true},
      });
      var candle=chart.addCandlestickSeries({upColor:UP,downColor:DOWN,borderUpColor:UP,borderDownColor:DOWN,wickUpColor:UP,wickDownColor:DOWN});
      var vol=chart.addHistogramSeries({priceFormat:{type:"volume"},priceScaleId:"vol"});
      chart.priceScale("vol").applyOptions({scaleMargins:{top:0.82,bottom:0}});
      chartObj.current=chart;candleRef.current=candle;volRef.current=vol;
      if(canvasRef.current){canvasRef.current.width=chartRef.current.clientWidth;canvasRef.current.height=255;}
      var ro=new ResizeObserver(function(){
        if(chartRef.current&&chartObj.current){
          var w=chartRef.current.clientWidth;
          chartObj.current.applyOptions({width:w});
          if(canvasRef.current)canvasRef.current.width=w;
        }
      });
      ro.observe(chartRef.current);
      fetchLTP().then(function(l){fetchCandles("15m",l);});
      return function(){ro.disconnect();chart.remove();};
    });
  },[]);

  useEffect(function(){if(candleRef.current)fetchCandles(tf,ltpRef.current||23850);},[tf]);

  useEffect(function(){
    if(!countdown)return;
    var t=setInterval(function(){
      setCountdown(function(prev){
        if(prev<=0){fetchCandles(tf,ltpRef.current||23850);return calcTimer(tf);}
        return prev-1;
      });
    },1000);
    return function(){clearInterval(t);};
  },[countdown,tf]);

  useEffect(function(){var t=setInterval(fetchLTP,30000);return function(){clearInterval(t);};},[]);

  useEffect(function(){
    if(!canvasRef.current)return;
    drawOnCanvas(canvasRef.current,drawings,pending,activeTool,fmtN);
  },[drawings,pending,activeTool]);

  function handleCanvasClick(e){
    if(activeTool=="none")return;
    if(activeTool=="erase"){setDrawings([]);setPending(null);setActiveTool("none");return;}
    var rect=canvasRef.current.getBoundingClientRect();
    var x=e.clientX-rect.left,y=e.clientY-rect.top;
    if(activeTool=="hline"){
      var priceAtY=ltp-((y/255)-0.5)*ltp*0.1;
      setDrawings(function(prev){return prev.concat([{type:"hline",y:y,label:fmtN(priceAtY)}]);});
    } else if(activeTool=="trend"){
      if(!pending){setPending({x:x,y:y});}
      else{setDrawings(function(prev){return prev.concat([{type:"trend",x1:pending.x,y1:pending.y,x2:x,y2:y}]);});setPending(null);}
    } else if(activeTool=="fib"){
      if(!pending){setPending({x:x,y:y});}
      else{setDrawings(function(prev){return prev.concat([{type:"fib",x1:pending.x,y1:pending.y,x2:x,y2:y}]);});setPending(null);setActiveTool("none");}
    }
  }

  var chg=ltp-prevClose;
  var chgPct=prevClose>0?(chg/prevClose)*100:0;
  var up=chg>=0;

  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",marginBottom:14}}>

      {/* Top bar */}
      <div style={{background:CARD2,padding:"10px 14px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:up?UP:DOWN,boxShadow:"0 0 7px "+(up?UP:DOWN)}}></div>
            <span style={{fontSize:11,fontWeight:900,color:T1}}>NIFTY 50</span>
            <span style={{fontSize:8,color:T3,background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:5,padding:"1px 5px"}}>NSE India</span>
          </div>
          <div style={{fontSize:22,fontWeight:900,color:T1,fontFamily:"monospace",letterSpacing:-0.5}}>{ltp>0?fmtN(ltp):"---"}</div>
          <div style={{fontSize:9,fontWeight:700,color:up?UP:DOWN,marginTop:2}}>{ltp>0?(up?"+":"")+fmtN(chg)+" ("+(up?"+":"")+chgPct.toFixed(2)+"%)":""}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:7,color:T3,marginBottom:1}}>PREV CLOSE</div>
          <div style={{fontSize:11,fontWeight:700,color:T2,fontFamily:"monospace"}}>{fmtN(prevClose)}</div>
          {loading&&<div style={{marginTop:6,display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end"}}><div style={{width:10,height:10,border:"2px solid "+BD,borderTopColor:BLUE,borderRadius:"50%",animation:"ncspin 0.7s linear infinite"}}></div><span style={{fontSize:7,color:T3}}>Loading</span></div>}
        </div>
      </div>

      {/* TF + Timer */}
      <div style={{padding:"7px 14px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {TF_LIST.map(function(t){
            var act=tf==t;
            return <button key={t} onClick={function(){if(!loading)setTf(t);}} style={{background:act?BLUE:"rgba(255,255,255,0.05)",border:"1px solid "+(act?BLUE:BD),borderRadius:6,padding:"3px 9px",color:act?"#fff":T2,fontSize:9,fontWeight:act?700:400,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}}>{t}</button>;
          })}
        </div>
        <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:8,padding:"4px 10px",flexShrink:0,textAlign:"center"}}>
          <div style={{fontSize:6,color:T3,letterSpacing:0.5,marginBottom:1}}>NEXT CANDLE</div>
          <div style={{fontSize:13,fontWeight:900,color:GOLD,fontFamily:"monospace"}}>{fmtTime(countdown)}</div>
        </div>
      </div>

      {/* Drawing Tools */}
      <div style={{padding:"5px 14px",borderBottom:"1px solid "+BD,display:"flex",gap:5,alignItems:"center",background:"rgba(0,0,0,0.2)",flexWrap:"wrap"}}>
        <span style={{fontSize:8,color:T3,marginRight:2,flexShrink:0}}>Draw:</span>
        {TOOLS.map(function(tool){
          var act=activeTool==tool.id;
          return (
            <button key={tool.id} onClick={function(){setActiveTool(tool.id);setPending(null);}} style={{background:act?tool.col+"22":"rgba(255,255,255,0.04)",border:"1px solid "+(act?tool.col:BD),borderRadius:6,padding:"3px 8px",color:act?tool.col:T3,fontSize:8,fontWeight:act?700:400,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:3}}>
              <span dangerouslySetInnerHTML={{__html:tool.icon}}></span>
              <span>{tool.label}</span>
            </button>
          );
        })}
        {drawings.length>0&&<span style={{fontSize:8,color:T3,marginLeft:"auto"}}>{drawings.length} drawing{drawings.length>1?"s":""}</span>}
        {pending&&<span style={{fontSize:8,color:GOLD}}>Click 2nd point...</span>}
      </div>

      {/* Chart + Canvas + Stats */}
      <div style={{display:"flex"}}>
        <div style={{flex:1,minWidth:0,position:"relative"}}>
          <div ref={chartRef} style={{width:"100%",height:255}}/>
          <canvas ref={canvasRef} onClick={handleCanvasClick} style={{position:"absolute",top:0,left:0,width:"100%",height:255,cursor:activeTool=="none"?"default":"crosshair",pointerEvents:activeTool=="none"?"none":"all"}}/>
          {err&&(
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(7,17,31,0.9)"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:9,color:DOWN,marginBottom:6}}>{err}</div>
                <button onClick={function(){fetchLTP().then(function(l){fetchCandles(tf,l);});}} style={{background:BLUE,border:"none",borderRadius:8,padding:"5px 14px",color:"#fff",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Retry</button>
              </div>
            </div>
          )}
        </div>
        <div style={{width:88,background:CARD2,borderLeft:"1px solid "+BD,padding:"8px 8px",display:"flex",flexDirection:"column",gap:5,flexShrink:0}}>
          {[["Open",cs.open,T1],["High",cs.high,UP],["Low",cs.low,DOWN],["Close",cs.close,T1],["T.High",cs.todayHigh,UP],["T.Low",cs.todayLow,DOWN]].map(function(row){
            return (
              <div key={row[0]} style={{borderBottom:"1px solid rgba(30,58,95,0.4)",paddingBottom:4}}>
                <div style={{fontSize:7,color:T3}}>{row[0]}</div>
                <div style={{fontSize:9,fontWeight:700,color:row[2],fontFamily:"monospace"}}>{fmtN(row[1])}</div>
              </div>
            );
          })}
          <div>
            <div style={{fontSize:7,color:T3,marginBottom:1}}>Volume</div>
            <div style={{fontSize:9,fontWeight:700,color:BLUE2,fontFamily:"monospace"}}>{fmtVol(cs.vol)}</div>
          </div>
        </div>
      </div>
      <style>{"@keyframes ncspin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
