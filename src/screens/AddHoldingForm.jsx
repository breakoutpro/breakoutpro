import { useState } from "react";
import { SECTORS } from "./PortfolioAnalyticsData";

// BreakoutPro - AddHoldingForm.jsx
// Add/Edit Holding form. Current Price is always user-entered - never
// fetched, never fake. Saved via the shared usePortfolioAnalytics
// instance passed down - no new hook.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#B8C1CC",BLUE="#3B82F6";

function inputStyle(){
  return {width:"100%",background:"#0B0E13",border:"1px solid "+BD,borderRadius:10,padding:"11px 12px",color:T1,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",marginBottom:12};
}
function labelStyle(){
  return {fontSize:12,color:T2,fontWeight:700,display:"block",marginBottom:6};
}

export default function AddHoldingForm(props){
  var portfolio = props.portfolio;
  var editing = props.editing || null;
  var onDone = props.onDone || function(){};
  var onCancel = props.onCancel || function(){};

  var [symbol, setSymbol] = useState(editing ? editing.symbol : "");
  var [qty, setQty] = useState(editing ? String(editing.qty) : "");
  var [avgBuyPrice, setAvgBuyPrice] = useState(editing ? String(editing.avgBuyPrice) : "");
  var [currentPrice, setCurrentPrice] = useState(editing ? String(editing.currentPrice) : "");
  var [sector, setSector] = useState(editing ? editing.sector : SECTORS[0]);

  function submit(){
    if(!symbol.trim() || !qty || !avgBuyPrice || !currentPrice) return;
    var data = { symbol:symbol.trim(), qty:qty, avgBuyPrice:avgBuyPrice, currentPrice:currentPrice, sector:sector };
    if(editing){ portfolio.editHolding(editing.id, {
      symbol:data.symbol, qty:parseFloat(qty), avgBuyPrice:parseFloat(avgBuyPrice),
      currentPrice:parseFloat(currentPrice), sector:sector
    }); }
    else { portfolio.addHolding(data); }
    onDone();
  }

  return (
    <div style={{padding:14}}>
      <button onClick={onCancel} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:0,marginBottom:14,minHeight:44}}>&#8592; Cancel</button>
      <div style={{fontSize:18,fontWeight:800,color:T1,marginBottom:16}}>{editing?"Edit Holding":"Add Holding"}</div>

      <label style={labelStyle()}>Symbol</label>
      <input style={inputStyle()} type="text" value={symbol} onChange={function(ev){setSymbol(ev.target.value);}} placeholder="e.g. RELIANCE"/>

      <label style={labelStyle()}>Quantity</label>
      <input style={inputStyle()} type="number" value={qty} onChange={function(ev){setQty(ev.target.value);}}/>

      <label style={labelStyle()}>Average Buy Price</label>
      <input style={inputStyle()} type="number" value={avgBuyPrice} onChange={function(ev){setAvgBuyPrice(ev.target.value);}}/>

      <label style={labelStyle()}>Current Price (enter your own value)</label>
      <input style={inputStyle()} type="number" value={currentPrice} onChange={function(ev){setCurrentPrice(ev.target.value);}}/>

      <label style={labelStyle()}>Sector</label>
      <select style={inputStyle()} value={sector} onChange={function(ev){setSector(ev.target.value);}}>
        {SECTORS.map(function(s){ return <option key={s} value={s}>{s}</option>; })}
      </select>

      <button onClick={submit} style={{width:"100%",background:BLUE,border:"none",borderRadius:11,padding:14,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginTop:6,minHeight:44}}>{editing?"Save Changes":"Save Holding"}</button>
    </div>
  );
}
