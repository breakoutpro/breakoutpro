import { useState } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";

// BreakoutPro - HomeCalculator.jsx
// Position Size Calculator ribbon for Home. The trader types Entry, Stop Loss and Quantity and
// sees the Risk (Loss) = |Entry - SL| x Qty. Starts empty (no prefilled numbers); until all three
// are valid positive numbers (and Entry differs from SL) the result is "--".
// The arrow opens the full Tools screen. Pure arithmetic on user input, no market data.
// Rules: no backtick, no triple-equals, ASCII only.

export function calcRisk(entry, sl, qty){
  var e = parseFloat(entry), s = parseFloat(sl), q = parseFloat(qty);
  if(!isFinite(e) || !isFinite(s) || !isFinite(q)) return null;
  if(e <= 0 || s <= 0 || q <= 0) return null;
  if(e == s) return null;
  return Math.abs(e - s) * q;
}

function clean(v){
  var s = String(v).replace(/[^0-9.]/g, "");
  var i = s.indexOf(".");
  if(i >= 0) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, "");
  return s.slice(0, 10);
}

function CalcIcon(props){
  return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={props.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{flexShrink:0}}><rect x="4" y="3" width="16" height="18" rx="2.5"/><rect x="7" y="6" width="10" height="4" rx="1"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01M16 17.5h.01"/></svg>);
}

export default function HomeCalculator(props){
  useLang();
  var c = useTheme().c;
  var light = c.scheme == "light";
  var compact = !!props.compact;
  var go = props.setTab || function(){};
  var es = useState(""), e = es[0], setE = es[1];
  var ss = useState(""), s = ss[0], setS = ss[1];
  var qs = useState(""), q = qs[0], setQ = qs[1];
  var risk = calcRisk(e, s, q);
  var riskTxt = risk == null ? "--" : "\u20B9" + Math.round(risk).toLocaleString("en-IN");
  var touched = e != "" && s != "" && q != "";
  var hint = "";
  if(touched && risk == null) hint = parseFloat(e) == parseFloat(s) ? t("home.calc_same", "Entry and SL must differ") : t("home.calc_bad", "Enter positive numbers");
  var fld = { height:compact ? 34 : 32, width:"100%",boxSizing:"border-box",minWidth:0,padding:"0 8px",borderRadius:8,border:"1px solid " + c.border,background:light ? "#FFFFFF" : c.card2,color:c.text1,fontSize:13,fontWeight:600,fontFamily:"inherit",outline:"none" };
  function field(label, val, set, ph){
    return (
      <label style={{display:"flex",alignItems:compact ? "stretch" : "center",flexDirection:compact ? "column" : "row",gap:compact ? 3 : 6,flex:compact ? "1 1 0" : "0 1 130px",minWidth:0}}>
        <span style={{fontSize:compact ? 10 : 12,fontWeight:700,color:c.text2,whiteSpace:"nowrap"}}>{label}</span>
        <input type="text" inputMode="decimal" autoComplete="off" aria-label={label} value={val} placeholder={ph} maxLength={10}
          onChange={function(ev){ set(clean(ev.target.value)); }} style={fld}/>
      </label>
    );
  }
  var shell = { boxSizing:"border-box",background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:14,boxShadow:light ? "0 4px 14px rgba(37,99,235,0.08), 0 1px 2px rgba(15,23,42,0.05)" : "0 3px 10px rgba(0,0,0,0.22)",color:c.text1 };
  var riskBox = (
    <div data-testid="home-calc-risk" aria-live="polite" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,flexShrink:0,height:compact ? 34 : 36,padding:"0 14px",borderRadius:10,background:risk == null ? (light ? "#EEF3FA" : c.card2) : (light ? "#FDECEC" : "rgba(239,68,68,0.14)"),whiteSpace:"nowrap"}}>
      <span style={{fontSize:12,fontWeight:700,color:c.text2}}>{t("home.calc_risk", "Risk (Loss)")}</span>
      <span style={{fontSize:compact ? 16 : 18,fontWeight:800,color:risk == null ? c.text3 : c.down,fontVariantNumeric:"tabular-nums"}}>{riskTxt}</span>
    </div>
  );
  var open = (
    <button type="button" aria-label={t("home.calc_title", "Position Size Calculator")} onClick={function(){ go("tools"); }} style={{background:"none",border:"none",cursor:"pointer",padding:6,display:"inline-flex",flexShrink:0}}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={c.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M5.5 2.5L11 8l-5.5 5.5"/></svg>
    </button>
  );
  var title = (<span style={{fontSize:compact ? 14 : 15,fontWeight:800,whiteSpace:"nowrap"}}>{t("home.calc_title", "Position Size Calculator")}</span>);
  if(compact){
    return (
      <div data-testid="home-calc" style={Object.assign({}, shell, {padding:"10px 12px"})}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><CalcIcon color={c.blue}/><span style={{flex:"1 1 0",minWidth:0}}>{title}</span>{open}</div>
        <div style={{display:"flex",gap:8,marginBottom:8}}>{field("Entry", e, setE, "0")}{field("SL", s, setS, "0")}{field("Qty", q, setQ, "0")}</div>
        {riskBox}
        {hint ? <div role="alert" style={{marginTop:6,fontSize:11,color:c.text3,textAlign:"center"}}>{hint}</div> : null}
      </div>
    );
  }
  return (
    <div data-testid="home-calc" style={Object.assign({}, shell, {padding:"10px 14px"})}>
      <div style={{display:"flex",alignItems:"center",gap:14,minWidth:0}}>
        <CalcIcon color={c.blue}/>{title}
        <span aria-hidden="true" style={{width:1,height:22,background:c.border,flexShrink:0}}/>
        <div style={{display:"flex",alignItems:"center",gap:14,flex:"1 1 0",minWidth:0}}>{field("Entry", e, setE, "0")}{field("SL", s, setS, "0")}{field("Qty", q, setQ, "0")}</div>
        {riskBox}{open}
      </div>
      {hint ? <div role="alert" style={{marginTop:4,fontSize:11,color:c.text3,textAlign:"right"}}>{hint}</div> : null}
    </div>
  );
}
