import { useEffect, useRef } from "react";

// BreakoutPro - TVDailyChart.jsx
// TradingView widget for Daily/Weekly/Monthly only (free tier supports these).
// Used by SignalChart when 1D is selected. Rules: no backtick, no triple-equals, ASCII.

function tvSymbol(sym){
  if(sym=="NIFTY") return "NSE:NIFTY";
  if(sym=="BANKNIFTY") return "NSE:BANKNIFTY";
  if(sym=="FINNIFTY") return "NSE:CNXFINANCE";
  return "BSE:"+sym;
}

export default function TVDailyChart(props){
  var sym=props.sym||"NIFTY";
  var holderRef=useRef(null);

  useEffect(function(){
    var holder=holderRef.current;
    if(!holder) return;
    holder.innerHTML="";
    var box=document.createElement("div");
    box.id="tvd_"+sym+"_"+Date.now();
    box.style.height="100%";
    box.style.width="100%";
    holder.appendChild(box);

    function build(){
      try{
        if(!window.TradingView) return;
        new window.TradingView.widget({
          autosize:true,
          symbol:tvSymbol(sym),
          interval:"D",
          timezone:"Asia/Kolkata",
          theme:"dark",
          style:"1",
          locale:"in",
          toolbar_bg:"#0B0E13",
          enable_publishing:false,
          hide_side_toolbar:true,
          allow_symbol_change:false,
          container_id:box.id
        });
      }catch(e){}
    }

    if(window.TradingView){
      build();
    } else {
      var sc=document.createElement("script");
      sc.src="https://s3.tradingview.com/tv.js";
      sc.async=true;
      sc.onload=build;
      holder.appendChild(sc);
    }
  },[sym]);

  return <div ref={holderRef} style={{width:"100%",height:"100%",background:"#0B0E13"}}></div>;
}
