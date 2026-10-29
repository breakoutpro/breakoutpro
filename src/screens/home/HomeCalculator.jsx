import { useState } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";

// BreakoutPro - HomeCalculator.jsx
// Position Size Calculator ribbon for Home. The trader picks Long (default) or Short and types
// Entry, Stop Loss and Quantity. Result: Risk (Loss) = |Entry - SL| x Qty and a 1:2 target.
// Starts empty (no prefilled numbers). Until all three are valid positive numbers, the stop is on
// the correct side of the entry for the chosen direction, and the target stays above zero, both
// results show "--" with a plain message. The arrow opens the full Tools screen.
// Pure arithmetic on user input, no market data.
// Rules: no backtick, no triple-equals, ASCII only.

var RUPEE = "\u20B9";

export function calcRisk(entry, sl, qty){
  var e = parseFloat(entry), s = parseFloat(sl), q = parseFloat(qty);
  if(!isFinite(e) || !isFinite(s) || !isFinite(q)) return null;
  if(e <= 0 || s <= 0 || q <= 0) return null;
  if(e == s) return null;
  return Math.abs(e - s) * q;
}

// 1:2 risk-reward target. Long: Entry + 2 x |Entry - SL|. Short: Entry - 2 x |Entry - SL|.
// Returns null unless the stop is on the correct side of the entry for the chosen direction
// (Long needs SL below Entry, Short needs SL above Entry) and the target stays above zero.
export function calcTarget(entry, sl, dir){
  var e = parseFloat(entry), s = parseFloat(sl);
  if(!isFinite(e) || !isFinite(s) || e <= 0 || s <= 0 || e == s) return null;
  if(dir == "short" ? !(s > e) : !(s < e)) return null;
  var t = dir == "short" ? e - 2 * Math.abs(e - s) : e + 2 * Math.abs(e - s);
  return t > 0 ? t : null;
}

// What to tell the trader when the numbers cannot give a trustworthy result ("" when fine or incomplete).
export function calcMessage(entry, sl, qty, dir){
  if(entry == "" || sl == "" || qty == "") return "";
  var e = parseFloat(entry), s = parseFloat(sl), q = parseFloat(qty);
  if(!isFinite(e) || !isFinite(s) || !isFinite(q) || e <= 0 || s <= 0 || q <= 0) return "Enter positive numbers";
  if(e == s) return "Entry and SL must differ";
  if(dir == "short" && s < e) return "For Short, SL must be above Entry";
  if(dir != "short" && s > e) return "For Long, SL must be below Entry";
  if(calcTarget(entry, sl, dir) == null) return "Target would fall below zero";
  return "";
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
  var ds = useState("long"), dir = ds[0], setDir = ds[1]; // Long is the default assumption and is shown selected
  var msg = calcMessage(e, s, q, dir);
  var okSide = msg == "";
  var risk = okSide ? calcRisk(e, s, q) : null;
  var target = okSide ? calcTarget(e, s, dir) : null;
  var riskTxt = risk == null ? "--" : RUPEE + Math.round(risk).toLocaleString("en-IN");
  var targetTxt = target == null ? "--" : RUPEE + (Math.round(target * 100) / 100).toLocaleString("en-IN", { maximumFractionDigits:2 });
  var fld = { height:compact ? 34 : 32, width:"100%",boxSizing:"border-box",minWidth:0,padding:"0 8px",borderRadius:8,border:"1px solid " + c.border,background:light ? "#FFFFFF" : c.card2,color:c.text1,fontSize:13,fontWeight:600,fontFamily:"inherit",outline:"none" };
  function field(label, val, set, ph){
    return (
      <label style={{display:"flex",alignItems:compact ? "stretch" : "center",flexDirection:compact ? "column" : "row",gap:compact ? 3 : 6,flex:compact ? "1 1 0" : "1 1 96px",maxWidth:compact ? "none" : 150,minWidth:0}}>
        <span style={{fontSize:compact ? 10 : 12,fontWeight:700,color:c.text2,whiteSpace:"nowrap"}}>{label}</span>
        <input type="text" inputMode="decimal" autoComplete="off" aria-label={label} value={val} placeholder={ph} maxLength={10}
          onChange={function(ev){ set(clean(ev.target.value)); }} style={fld}/>
      </label>
    );
  }
  function seg(id, label){
    var on = dir == id;
    return (<button type="button" role="radio" aria-checked={on} data-testid={"home-calc-" + id} onClick={function(){ setDir(id); }} style={{height:compact ? 30 : 28,padding:"0 12px",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:800,background:on ? c.blue : "transparent",color:on ? "#FFFFFF" : c.text2,borderRadius:8}}>{label}</button>);
  }
  var toggle = (<div role="radiogroup" aria-label="Trade direction" style={{display:"inline-flex",flexShrink:0,padding:2,borderRadius:10,border:"1px solid " + c.border,background:light ? "#F1F5FB" : c.card2}}>{seg("long", "Long")}{seg("short", "Short")}</div>);
  var shell = { boxSizing:"border-box",background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:14,boxShadow:light ? "0 4px 14px rgba(37,99,235,0.08), 0 1px 2px rgba(15,23,42,0.05)" : "0 3px 10px rgba(0,0,0,0.22)",color:c.text1 };
  function pill(testid, label, txt, col, bgc){
    return (
      <div data-testid={testid} aria-live="polite" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,flex:compact ? "1 1 0" : "0 0 auto",minWidth:0,height:compact ? 34 : 36,padding:"0 10px",borderRadius:10,background:bgc,whiteSpace:"nowrap"}}>
        <span style={{fontSize:compact ? 11 : 12,fontWeight:700,color:c.text2}}>{label}</span>
        <span style={{fontSize:compact ? 14 : 16,fontWeight:800,color:col,fontVariantNumeric:"tabular-nums"}}>{txt}</span>
      </div>
    );
  }
  var neutralBg = light ? "#EEF3FA" : c.card2;
  var riskPill = pill("home-calc-risk", t("home.calc_risk", "Risk (Loss)"), riskTxt, risk == null ? c.text3 : c.down, risk == null ? neutralBg : (light ? "#FDECEC" : "rgba(239,68,68,0.14)"));
  var targetPill = pill("home-calc-target", t("home.calc_target", "Target 1:2"), targetTxt, target == null ? c.text3 : c.up, target == null ? neutralBg : (light ? "#E8F6EE" : "rgba(34,197,94,0.14)"));
  var open = (
    <button type="button" aria-label={t("home.calc_title", "Position Size Calculator")} onClick={function(){ go("tools"); }} style={{background:"none",border:"none",cursor:"pointer",padding:6,display:"inline-flex",flexShrink:0}}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={c.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M5.5 2.5L11 8l-5.5 5.5"/></svg>
    </button>
  );
  var title = (<span style={{fontSize:compact ? 14 : 15,fontWeight:800,whiteSpace:"nowrap"}}>{t("home.calc_title", "Position Size Calculator")}</span>);
  var note = msg ? (<div role="alert" data-testid="home-calc-msg" style={{marginTop:compact ? 6 : 4,fontSize:11,color:c.text3,textAlign:compact ? "center" : "right"}}>{msg}</div>)
    : (<div style={{marginTop:compact ? 6 : 4,fontSize:10,color:c.text3,textAlign:compact ? "center" : "right"}}>{dir == "short" ? "Short: SL above Entry, target below" : "Long (default): SL below Entry, target above"}</div>);
  if(compact){
    return (
      <div data-testid="home-calc" style={Object.assign({}, shell, {padding:"10px 12px"})}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><CalcIcon color={c.blue}/><span style={{flex:"1 1 0",minWidth:0}}>{title}</span>{toggle}{open}</div>
        <div style={{display:"flex",gap:8,marginBottom:8}}>{field("Entry", e, setE, "0")}{field("SL", s, setS, "0")}{field("Qty", q, setQ, "0")}</div>
        <div style={{display:"flex",gap:8}}>{riskPill}{targetPill}</div>
        {note}
      </div>
    );
  }
  return (
    <div data-testid="home-calc" style={Object.assign({}, shell, {padding:"10px 14px"})}>
      <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
        <CalcIcon color={c.blue}/>{title}
        <span aria-hidden="true" style={{width:1,height:22,background:c.border,flexShrink:0}}/>
        {toggle}
        <div style={{display:"flex",alignItems:"center",gap:12,flex:"1 1 0",minWidth:0}}>{field("Entry", e, setE, "0")}{field("SL", s, setS, "0")}{field("Qty", q, setQ, "0")}</div>
        {riskPill}{targetPill}{open}
      </div>
      {note}
    </div>
  );
}
