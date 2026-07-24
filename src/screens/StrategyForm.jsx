import { useState } from "react";
import { MARKETS, TIMEFRAMES } from "./StrategyBuilderData";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - StrategyForm.jsx
// Create/Edit form for the Strategy Builder. Pure local form state, saved
// via the shared useStrategyBuilder instance passed down - no new hook.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#A0A7B4",BLUE="#3B82F6";

function inputStyle(){
  return {width:"100%",background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"12px 12px",color:T1,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",marginBottom:12};
}
function labelStyle(){
  return {fontSize:12,color:T2,fontWeight:700,display:"block",marginBottom:8};
}

export default function StrategyForm(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue; T1=theme.c.text1; CARD=theme.c.card; BD=theme.c.border;

  var builder = props.builder;
  var editing = props.editing || null; // existing strategy object, or null for create
  var onDone = props.onDone || function(){};
  var onCancel = props.onCancel || function(){};

  var [name, setName] = useState(editing ? editing.name : "");
  var [market, setMarket] = useState(editing ? editing.market : MARKETS[0]);
  var [timeframe, setTimeframe] = useState(editing ? editing.timeframe : TIMEFRAMES[4]);
  var [entryRules, setEntryRules] = useState(editing ? editing.entryRules : "");
  var [exitRules, setExitRules] = useState(editing ? editing.exitRules : "");
  var [stoplossRules, setStoplossRules] = useState(editing ? editing.stoplossRules : "");
  var [targetRules, setTargetRules] = useState(editing ? editing.targetRules : "");
  var [riskPerTrade, setRiskPerTrade] = useState(editing ? editing.riskPerTrade : "1");
  var [notes, setNotes] = useState(editing ? editing.notes : "");

  function submit(){
    if(!name.trim()) return;
    var data = {
      name:name.trim(), market:market, timeframe:timeframe,
      entryRules:entryRules.trim(), exitRules:exitRules.trim(),
      stoplossRules:stoplossRules.trim(), targetRules:targetRules.trim(),
      riskPerTrade:riskPerTrade, notes:notes.trim()
    };
    if(editing){ builder.editStrategy(editing.id, data); }
    else { builder.addStrategy(data); }
    onDone();
  }

  return (
    <div style={{padding:16}}>
      <button onClick={onCancel} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:4,marginBottom:16}}>&#8592; Cancel</button>
      <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:16}}>{editing?"Edit Strategy":"Create Strategy"}</div>

      <label style={labelStyle()}>Strategy Name</label>
      <input style={inputStyle()} type="text" value={name} onChange={function(ev){setName(ev.target.value);}} placeholder="e.g. Breakout Retest"/>

      <label style={labelStyle()}>Market</label>
      <select style={inputStyle()} value={market} onChange={function(ev){setMarket(ev.target.value);}}>
        {MARKETS.map(function(m){ return <option key={m} value={m}>{m}</option>; })}
      </select>

      <label style={labelStyle()}>Timeframe</label>
      <select style={inputStyle()} value={timeframe} onChange={function(ev){setTimeframe(ev.target.value);}}>
        {TIMEFRAMES.map(function(tf){ return <option key={tf} value={tf}>{tf}</option>; })}
      </select>

      <label style={labelStyle()}>Entry Rules</label>
      <textarea style={Object.assign({},inputStyle(),{minHeight:60,resize:"vertical"})} value={entryRules} onChange={function(ev){setEntryRules(ev.target.value);}}/>

      <label style={labelStyle()}>Exit Rules</label>
      <textarea style={Object.assign({},inputStyle(),{minHeight:60,resize:"vertical"})} value={exitRules} onChange={function(ev){setExitRules(ev.target.value);}}/>

      <label style={labelStyle()}>Stop Loss Rules</label>
      <textarea style={Object.assign({},inputStyle(),{minHeight:50,resize:"vertical"})} value={stoplossRules} onChange={function(ev){setStoplossRules(ev.target.value);}}/>

      <label style={labelStyle()}>Target Rules</label>
      <textarea style={Object.assign({},inputStyle(),{minHeight:50,resize:"vertical"})} value={targetRules} onChange={function(ev){setTargetRules(ev.target.value);}}/>

      <label style={labelStyle()}>Risk per Trade (%)</label>
      <input style={inputStyle()} type="number" value={riskPerTrade} onChange={function(ev){setRiskPerTrade(ev.target.value);}}/>

      <label style={labelStyle()}>Notes</label>
      <textarea style={Object.assign({},inputStyle(),{minHeight:60,resize:"vertical"})} value={notes} onChange={function(ev){setNotes(ev.target.value);}}/>

      <button onClick={submit} style={{width:"100%",background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginTop:8,minHeight:44}}>{editing?"Save Changes":"Save Strategy"}</button>
    </div>
  );
}
