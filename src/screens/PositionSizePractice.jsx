import { useState } from "react";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - PositionSizePractice.jsx
// Interactive position-sizing calculator practice, focused specifically
// on the units/quantity math (distinct focus from the Risk Management
// Calculator practice, which centers on risk amount and R:R ratio).
// All numbers are user-entered practice values - never real market data.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BLUE="#3B82F6",UP="#22C55E";

function inputStyle(){
  return {width:"100%",background:"#0B0E13",border:"1px solid "+BD,borderRadius:10,padding:"12px 12px",color:T1,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",marginBottom:12};
}

export default function PositionSizePractice(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var onBack = props.onBack || function(){};
  var [account, setAccount] = useState("200000");
  var [riskPct, setRiskPct] = useState("2");
  var [entry, setEntry] = useState("50");
  var [stop, setStop] = useState("47");

  var acc = parseFloat(account) || 0;
  var rp = parseFloat(riskPct) || 0;
  var e = parseFloat(entry) || 0;
  var s = parseFloat(stop) || 0;

  var riskAmount = acc * (rp/100);
  var perUnitRisk = Math.abs(e - s);
  var units = perUnitRisk>0 ? Math.floor(riskAmount / perUnitRisk) : 0;
  var positionValue = units * e;
  var pctOfAccount = acc>0 ? (positionValue/acc)*100 : 0;

  return (
    <div style={{padding:16}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:4,marginBottom:12}}>&#8592; Back to Practice Zone</button>
      <div style={{fontSize:16,fontWeight:800,color:T1,marginBottom:8}}>Position Size Practice</div>
      <div style={{fontSize:12,color:T3,marginBottom:16,lineHeight:1.5}}>Practice calculating how many units a given risk tolerance allows. All values below are yours to experiment with - not real market prices.</div>

      <label style={{fontSize:12,color:T2,fontWeight:700}}>Practice Account Size (Rs)</label>
      <input style={inputStyle()} type="number" value={account} onChange={function(ev){setAccount(ev.target.value);}}/>

      <label style={{fontSize:12,color:T2,fontWeight:700}}>Risk Tolerance (%)</label>
      <input style={inputStyle()} type="number" value={riskPct} onChange={function(ev){setRiskPct(ev.target.value);}}/>

      <label style={{fontSize:12,color:T2,fontWeight:700}}>Practice Entry Price</label>
      <input style={inputStyle()} type="number" value={entry} onChange={function(ev){setEntry(ev.target.value);}}/>

      <label style={{fontSize:12,color:T2,fontWeight:700}}>Practice Stop Level</label>
      <input style={inputStyle()} type="number" value={stop} onChange={function(ev){setStop(ev.target.value);}}/>

      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginTop:8}}>
        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>RESULT (based on your practice numbers only)</div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+BD}}>
          <span style={{fontSize:12,color:T2}}>Units you could take</span>
          <span style={{fontSize:12,fontWeight:700,color:T1}}>{units} units</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+BD}}>
          <span style={{fontSize:12,color:T2}}>Total position value</span>
          <span style={{fontSize:12,fontWeight:700,color:T1}}>Rs {positionValue.toFixed(2)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0"}}>
          <span style={{fontSize:12,color:T2}}>Position as % of account</span>
          <span style={{fontSize:12,fontWeight:700,color:pctOfAccount>50?"#EF4444":UP}}>{pctOfAccount.toFixed(1)}%</span>
        </div>
      </div>

      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:12,marginTop:16}}>
        <div style={{fontSize:12,color:theme.c.warn,lineHeight:1.5}}>Educational calculator only. All numbers above are practice values you entered - not real market data, and not investment advice.</div>
      </div>
    </div>
  );
}
