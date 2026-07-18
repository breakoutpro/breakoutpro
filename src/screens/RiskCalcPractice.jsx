import { useState } from "react";

import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - RiskCalcPractice.jsx
// Interactive risk-management calculator practice. All numbers are
// entered by the user as practice values - never real market prices or
// any live/fake ticker data. Pure client-side math, no fetch, no polling.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472",BLUE="#3B82F6",UP="#22C55E",R="#EF4444";

function inputStyle(){
  return {width:"100%",background:"#0B0E13",border:"1px solid "+BD,borderRadius:10,padding:"11px 12px",color:T1,fontSize:13,fontFamily:"inherit",boxSizing:"border-box",marginBottom:12};
}

export default function RiskCalcPractice(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border, BLUE = theme.c.blue, CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3;

  var onBack = props.onBack || function(){};
  var [capital, setCapital] = useState("100000");
  var [riskPct, setRiskPct] = useState("1");
  var [entry, setEntry] = useState("100");
  var [stop, setStop] = useState("95");
  var [target, setTarget] = useState("115");

  var cap = parseFloat(capital) || 0;
  var rp = parseFloat(riskPct) || 0;
  var e = parseFloat(entry) || 0;
  var s = parseFloat(stop) || 0;
  var t = parseFloat(target) || 0;

  var riskAmount = cap * (rp/100);
  var perUnitRisk = Math.abs(e - s);
  var qty = perUnitRisk>0 ? Math.floor(riskAmount / perUnitRisk) : 0;
  var perUnitReward = Math.abs(t - e);
  var rrRatio = perUnitRisk>0 ? (perUnitReward/perUnitRisk) : 0;

  return (
    <div style={{padding:14}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:0,marginBottom:12}}>&#8592; Back to Practice Zone</button>
      <div style={{fontSize:15,fontWeight:800,color:T1,marginBottom:6}}>Risk Management Calculator Practice</div>
      <div style={{fontSize:10,color:T3,marginBottom:16,lineHeight:1.5}}>Enter your own practice numbers below - these are not real market prices, just values for you to experiment with.</div>

      <label style={{fontSize:10,color:T2,fontWeight:700}}>Practice Capital (Rs)</label>
      <input style={inputStyle()} type="number" value={capital} onChange={function(ev){setCapital(ev.target.value);}}/>

      <label style={{fontSize:10,color:T2,fontWeight:700}}>Risk per Trade (%)</label>
      <input style={inputStyle()} type="number" value={riskPct} onChange={function(ev){setRiskPct(ev.target.value);}}/>

      <label style={{fontSize:10,color:T2,fontWeight:700}}>Practice Entry Price</label>
      <input style={inputStyle()} type="number" value={entry} onChange={function(ev){setEntry(ev.target.value);}}/>

      <label style={{fontSize:10,color:T2,fontWeight:700}}>Practice Stop Level</label>
      <input style={inputStyle()} type="number" value={stop} onChange={function(ev){setStop(ev.target.value);}}/>

      <label style={{fontSize:10,color:T2,fontWeight:700}}>Practice Target Level (optional)</label>
      <input style={inputStyle()} type="number" value={target} onChange={function(ev){setTarget(ev.target.value);}}/>

      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:14,marginTop:6}}>
        <div style={{fontSize:10,fontWeight:800,color:T2,marginBottom:10}}>RESULT (based on your practice numbers only)</div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+BD}}>
          <span style={{fontSize:11,color:T2}}>Amount at risk</span>
          <span style={{fontSize:12,fontWeight:700,color:R}}>Rs {riskAmount.toFixed(2)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+BD}}>
          <span style={{fontSize:11,color:T2}}>Suggested max quantity</span>
          <span style={{fontSize:12,fontWeight:700,color:T1}}>{qty} units</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}>
          <span style={{fontSize:11,color:T2}}>Risk : Reward ratio</span>
          <span style={{fontSize:12,fontWeight:700,color:rrRatio>=2?UP:(rrRatio>0?T1:T3)}}>{rrRatio>0?("1 : "+rrRatio.toFixed(2)):"--"}</span>
        </div>
      </div>

      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.15)",borderRadius:10,padding:11,marginTop:14}}>
        <div style={{fontSize:8.5,color:theme.c.warn,lineHeight:1.5}}>Educational calculator only. All numbers above are practice values you entered - not real market data, and not investment advice.</div>
      </div>
    </div>
  );
}
