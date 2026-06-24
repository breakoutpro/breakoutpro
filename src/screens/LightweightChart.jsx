import { useEffect, useRef } from "react";
import { buildCandles, buildEMA, buildRSI } from "./ChartData";

// BreakoutPro - LightweightChart.jsx
// Custom intraday candlestick chart using TradingView Lightweight Charts (open source).
// Candles + volume + EMA20. Dark theme. Rules: no backtick, no triple-equals, ASCII.

var UP="#22C55E",DOWN="#EF4444",BLUE="#60A5FA",GRID="#1B2330",TXT="#A0A7B4";

export default function LightweightChart(props){
  var sym=props.sym||"NIFTY";
  var frame=props.frame||"15";
  var base=props.base||100;
  var up=props.up;
  var holderRef=useRef(null);
  var chartRef=useRef(null);

  useEffect(function(){
    var holder=holderRef.current;
    if(!holder) return;

    function draw(){
      try{
        if(!window.LightweightCharts) return;
        holder.innerHTML="";
        var chart=window.LightweightCharts.createChart(holder,{
          layout:{background:{color:"#0B0E13"},textColor:TXT},
          grid:{vertLines:{color:GRID},horzLines:{color:GRID}},
          timeScale:{timeVisible:true,secondsVisible:false,borderColor:GRID},
          rightPriceScale:{borderColor:GRID},
          crosshair:{mode:0},
          width:holder.clientWidth,
          height:holder.clientHeight
        });
        chartRef.current=chart;

        var candles=buildCandles(sym,frame,base,up);

        var cs=chart.addCandlestickSeries({
          upColor:UP,downColor:DOWN,
          wickUpColor:UP,wickDownColor:DOWN,
          borderVisible:false
        });
        cs.setData(candles);

        // Volume histogram on a lower scale.
        var vs=chart.addHistogramSeries({
          priceFormat:{type:"volume"},
          priceScaleId:"vol"
        });
        chart.priceScale("vol").applyOptions({scaleMargins:{top:0.82,bottom:0}});
        vs.setData(candles.map(function(c){
          return {time:c.time,value:c.volume,color:c.close>=c.open?"rgba(34,197,94,0.4)":"rgba(239,68,68,0.4)"};
        }));

        // EMA 20 overlay.
        var ema=buildEMA(candles,20);
        var es=chart.addLineSeries({color:BLUE,lineWidth:2,priceLineVisible:false,lastValueVisible:false});
        es.setData(ema);

        chart.timeScale().fitContent();

        // Resize handling.
        function onResize(){
          if(chartRef.current) chartRef.current.applyOptions({width:holder.clientWidth,height:holder.clientHeight});
        }
        window.addEventListener("resize",onResize);
        holder._cleanup=function(){ window.removeEventListener("resize",onResize); };
      }catch(e){}
    }

    if(window.LightweightCharts){
      draw();
    } else {
      var sc=document.createElement("script");
      sc.src="https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js";
      sc.async=true;
      sc.onload=draw;
      document.body.appendChild(sc);
    }

    return function(){
      try{
        if(holder&&holder._cleanup) holder._cleanup();
        if(chartRef.current){ chartRef.current.remove(); chartRef.current=null; }
      }catch(e){}
    };
  },[sym,frame,base,up]);

  return <div ref={holderRef} style={{width:"100%",height:"100%",background:"#0B0E13"}}></div>;
}
