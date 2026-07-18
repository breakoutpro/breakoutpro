import { useState } from "react";
import { STRATEGIES, TIMEFRAMES } from "./TradingJournalData";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - AddTradeForm.jsx
// Add Trade form for the Trading Journal. Pure local form state, saved
// via the shared useTradingJournal instance passed down - no new hook.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BLUE="#3B82F6";

function inputStyle(){
  return {width:"100%",background:"#0B0E13",border:"1px solid "+BD,borderRadius:10,padding:"11px 12px",color:T1,fontSize:13,fontFamily:"inherit",boxSizing:"border-box",marginBottom:12};
}
function labelStyle(){
  return {fontSize:10,color:T2,fontWeight:700,display:"block",marginBottom:6};
}

export default function AddTradeForm(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, T2 = theme.c.text2;

  var journal = props.journal;
  var onDone = props.onDone || function(){};
  var onCancel = props.onCancel || function(){};

  var todayIso = new Date().toISOString().slice(0,10);
  var [date, setDate] = useState(todayIso);
  var [symbol, setSymbol] = useState("");
  var [side, setSide] = useState("Buy");
  var [entry, setEntry] = useState("");
  var [exit, setExit] = useState("");
  var [stoploss, setStoploss] = useState("");
  var [target, setTarget] = useState("");
  var [qty, setQty] = useState("");
  var [timeframe, setTimeframe] = useState(TIMEFRAMES[4]);
  var [strategy, setStrategy] = useState(STRATEGIES[0]);
  var [notes, setNotes] = useState("");

  function submit(){
    if(!symbol.trim() || !entry || !exit || !qty) return;
    journal.addTrade({
      date:date, symbol:symbol.trim().toUpperCase(), side:side,
      entry:entry, exit:exit, stoploss:stoploss, target:target,
      qty:qty, timeframe:timeframe, strategy:strategy, notes:notes.trim()
    });
    onDone();
  }

  return (
    <div style={{padding:14}}>
      <button onClick={onCancel} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:0,marginBottom:14}}>&#8592; Cancel</button>
      <div style={{fontSize:15,fontWeight:800,color:T1,marginBottom:16}}>Add Trade</div>

      <label style={labelStyle()}>Date</label>
      <input style={inputStyle()} type="date" value={date} onChange={function(ev){setDate(ev.target.value);}}/>

      <label style={labelStyle()}>Symbol</label>
      <input style={inputStyle()} type="text" value={symbol} onChange={function(ev){setSymbol(ev.target.value);}} placeholder="e.g. RELIANCE"/>

      <label style={labelStyle()}>Buy / Sell</label>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <button onClick={function(){setSide("Buy");}} style={{flex:1,background:side=="Buy"?"#22C55E":"transparent",border:"1px solid "+(side=="Buy"?"#22C55E":BD),borderRadius:10,padding:11,color:side=="Buy"?"#05130a":T2,fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Buy</button>
        <button onClick={function(){setSide("Sell");}} style={{flex:1,background:side=="Sell"?"#EF4444":"transparent",border:"1px solid "+(side=="Sell"?"#EF4444":BD),borderRadius:10,padding:11,color:side=="Sell"?"#fff":T2,fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Sell</button>
      </div>

      <label style={labelStyle()}>Entry Price</label>
      <input style={inputStyle()} type="number" value={entry} onChange={function(ev){setEntry(ev.target.value);}}/>

      <label style={labelStyle()}>Exit Price</label>
      <input style={inputStyle()} type="number" value={exit} onChange={function(ev){setExit(ev.target.value);}}/>

      <label style={labelStyle()}>Stoploss (optional)</label>
      <input style={inputStyle()} type="number" value={stoploss} onChange={function(ev){setStoploss(ev.target.value);}}/>

      <label style={labelStyle()}>Target (optional)</label>
      <input style={inputStyle()} type="number" value={target} onChange={function(ev){setTarget(ev.target.value);}}/>

      <label style={labelStyle()}>Quantity</label>
      <input style={inputStyle()} type="number" value={qty} onChange={function(ev){setQty(ev.target.value);}}/>

      <label style={labelStyle()}>Timeframe</label>
      <select style={inputStyle()} value={timeframe} onChange={function(ev){setTimeframe(ev.target.value);}}>
        {TIMEFRAMES.map(function(tf){ return <option key={tf} value={tf}>{tf}</option>; })}
      </select>

      <label style={labelStyle()}>Strategy</label>
      <select style={inputStyle()} value={strategy} onChange={function(ev){setStrategy(ev.target.value);}}>
        {STRATEGIES.map(function(s){ return <option key={s} value={s}>{s}</option>; })}
      </select>

      <label style={labelStyle()}>Notes</label>
      <textarea style={Object.assign({},inputStyle(),{minHeight:70,resize:"vertical"})} value={notes} onChange={function(ev){setNotes(ev.target.value);}}/>

      <button onClick={submit} style={{width:"100%",background:BLUE,border:"none",borderRadius:11,padding:13,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginTop:6,minHeight:44}}>Save Trade</button>
    </div>
  );
}
