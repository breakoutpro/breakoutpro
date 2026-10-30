import React from "react";
import { useTheme } from "../theme/ThemeProvider";
import { useLang } from "../i18n/translations";
import { useQuotes } from "../market/useQuotes";
import { NIFTY50_SYMS } from "../data/indexConstituents";

// BreakoutPro - LargeCapMovers.jsx
// Top Gainers and Losers - Large Cap (the NIFTY 50 constituents) from the shared quote store.
// Each row carries the quote's own status (LIVE / DELAYED / STALE); a symbol without a price is skipped,
// never filled in. If no quote arrives the screen says so. No demo data.
// Rules: no backtick, no triple-equals, ASCII only.

var N = 5;
var RUPEE = "\u20B9";

function Row(props){
  var c = props.c, q = props.q;
  var up = q.changePct >= 0;
  var st = q.closed ? "CLOSED" : (q.status || "");
  return (
    <div data-testid={"mover-" + q.sym} style={{display:"flex",alignItems:"baseline",gap:8,padding:"8px 0",borderTop:"1px solid " + c.border,minWidth:0}}>
      <span style={{flex:"1 1 0",minWidth:0,fontSize:13,fontWeight:800,color:c.text1,overflowWrap:"anywhere"}}>{q.sym}</span>
      <span style={{fontSize:12,fontWeight:700,color:c.text1,fontVariantNumeric:"tabular-nums"}}>{RUPEE + q.price.toLocaleString("en-IN", { maximumFractionDigits:2 })}</span>
      <span style={{minWidth:62,textAlign:"right",fontSize:12,fontWeight:800,color:up ? c.up : c.down,fontVariantNumeric:"tabular-nums"}}>{(up ? "+" : "") + q.changePct.toFixed(2) + "%"}</span>
      <span style={{minWidth:54,textAlign:"right",fontSize:9,fontWeight:700,color:st == "LIVE" ? c.blue : c.text3}}>{st}</span>
    </div>
  );
}

export default function LargeCapMovers(){
  useLang();
  var c = useTheme().c;
  var light = c.scheme == "light";
  var lq = useQuotes(NIFTY50_SYMS);
  var rows = [];
  NIFTY50_SYMS.forEach(function(s){
    var q = lq.quotes[s];
    if(!q || typeof q.price != "number" || typeof q.changePct != "number" || !isFinite(q.changePct)) return;
    rows.push({ sym:s, price:q.price, changePct:q.changePct, status:q.status, closed:q.closed });
  });
  rows.sort(function(a, b){ return b.changePct - a.changePct; });
  var gain = rows.filter(function(r){ return r.changePct > 0; }).slice(0, N);
  var lose = rows.filter(function(r){ return r.changePct < 0; }).reverse().slice(0, N);
  var anyLive = rows.some(function(r){ return r.status == "LIVE" && !r.closed; });
  var shell = { boxSizing:"border-box",minWidth:0,background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + c.border,borderRadius:14,padding:"10px 14px",color:c.text1 };
  function col(title, list, tid, tone){
    return (
      <div data-testid={tid} style={shell}>
        <div style={{fontSize:14,fontWeight:800,color:tone}}>{title}</div>
        {list.length == 0 ? <div style={{padding:"10px 0",fontSize:12,color:c.text3}}>None right now</div> : list.map(function(r){ return <Row key={r.sym} c={c} q={r}/>; })}
      </div>
    );
  }
  return (
    <div data-testid="movers-screen" style={{background:c.bg,minHeight:"100vh",boxSizing:"border-box",padding:"12px 12px 80px",fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{fontSize:18,fontWeight:900,color:c.text1}}>Top Gainers &amp; Losers - Large Cap</div>
        <div data-testid="movers-note" style={{fontSize:11,color:c.text3,margin:"4px 0 10px"}}>{"NIFTY 50 stocks, NSE. " + (rows.length == 0 ? "No quotes available right now." : (anyLive ? "Live quotes where marked LIVE." : "Quotes are delayed or the market is closed - not live."))}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:12}}>
          {col("Top Gainers", gain, "movers-gainers", c.up)}
          {col("Top Losers", lose, "movers-losers", c.down)}
        </div>
        <div style={{marginTop:12,fontSize:10,color:c.text3}}>Educational only. Not SEBI registered. Not investment advice.</div>
      </div>
    </div>
  );
}
