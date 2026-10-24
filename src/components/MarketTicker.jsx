import { useState, useEffect } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { t, useLang } from "../i18n/translations";
import { buildTickerItems, stateLabel } from "../state/marketTickerModel";

// BreakoutPro - MarketTicker.jsx
// Compact single-row market strip. Native horizontal scroll (touch / trackpad / keyboard),
// no marquee and no duplicated track, so nothing is hidden behind animation and there is
// nothing to pause. Always renders every slot, so the height and widths do not jump when
// data arrives. Data comes from the existing market-mood payload passed in as props.
// Green/red only for market direction; VIX change is neutral (a rise is not "good").
// Rules: no backtick, no triple-equals, ASCII only.

var CSS = ".bpTk{scrollbar-width:thin;-webkit-overflow-scrolling:touch}" +
  ".bpTk::-webkit-scrollbar{height:4px}.bpTk::-webkit-scrollbar-thumb{background:rgba(120,130,150,0.4);border-radius:2px}" +
  ".bpTkItem{font-family:inherit;text-align:left}" +
  ".bpTkItem:focus-visible,.bpTk:focus-visible{outline:2px solid #3B82F6;outline-offset:-2px}";

function fmt(v, vix){
  if(v == null) return "--";
  return v.toLocaleString("en-IN", {minimumFractionDigits:2, maximumFractionDigits:2});
}

export default function MarketTicker(props){
  var theme = useTheme();
  useLang();
  var c = theme.c;
  var [now, setNow] = useState(Date.now());
  useEffect(function(){
    var id = setInterval(function(){ setNow(Date.now()); }, 15000);
    return function(){ clearInterval(id); };
  }, []);

  var items = buildTickerItems(props.data, { now:now, networkStatus:props.networkStatus, loadFailed:(props.status == "error" || props.status == "offline") });
  var onNavigate = props.onNavigate || function(){};

  return (
    <div role="region" aria-label={t("tk.region", "Market ticker")}
         style={{flexShrink:0,background:c.card2,borderBottom:"1px solid "+c.border,width:"100%",boxSizing:"border-box"}}>
      <style>{CSS}</style>
      <div className="bpTk" tabIndex={0} aria-label={t("tk.scroll", "Market ticker, scrollable")}
           style={{display:"flex",alignItems:"stretch",overflowX:"auto",overflowY:"hidden",whiteSpace:"nowrap",height:40}}>
        {items.map(function(it){
          var unavailable = it.state == "unavailable" || it.state == "loading";
          var dirCol = it.kind == "vix" ? c.text2 : (it.dir == "up" ? c.up : (it.dir == "down" ? c.down : c.text2));
          var stateCol = it.state == "live" ? c.blue : ((it.state == "delayed" || it.state == "lastconfirmed") ? c.warn : c.text3);
          var arrow = it.dir == "up" ? "\u25B2" : (it.dir == "down" ? "\u25BC" : "");
          var chgTxt = it.chgPct != null ? (it.chgPct > 0 ? "+" : "") + it.chgPct.toFixed(2) + "%" : "";
          var sl = t("tk." + it.state, stateLabel(it.state));
          var name = t("tk.n." + it.key, it.label);
          var stamp = (!unavailable && it.asOf) ? " " + it.asOf : "";
          var aria = name + ", " + (unavailable ? sl : fmt(it.value) + (it.chgPct != null ? ", " + (it.chgPct > 0 ? "up " : (it.chgPct < 0 ? "down " : "unchanged ")) + Math.abs(it.chgPct).toFixed(2) + " percent" : "") + ", " + sl + (it.asOf ? ", as of " + it.asOf + " IST" : ""));
          var title = it.chgAbs != null ? aria + ", change " + (it.chgAbs > 0 ? "+" : "") + it.chgAbs.toFixed(2) : aria;
          var inner = (
            <div style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:1,padding:"0 14px",height:"100%",boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,lineHeight:"14px"}}>
                <span style={{fontSize:11,fontWeight:800,color:c.text2,letterSpacing:0.3}}>{name}</span>
                <span style={{fontSize:10,fontWeight:700,color:stateCol}}>{"\u25CF "}{sl}{stamp}</span>
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:8,lineHeight:"16px"}}>
                <span style={{fontSize:13,fontWeight:800,color:unavailable?c.text3:c.text1,fontVariantNumeric:"tabular-nums"}}>
                  {unavailable ? (it.state == "loading" ? "--" : t("tk.na", "Not available")) : fmt(it.value)}
                </span>
                {chgTxt ? <span style={{fontSize:12,fontWeight:700,color:dirCol,fontVariantNumeric:"tabular-nums"}}>{arrow}{arrow ? " " : ""}{chgTxt}</span> : null}
              </div>
            </div>
          );
          var base = {flex:"0 0 auto",minWidth:170,height:40,borderRight:"1px solid "+c.border,background:"transparent",border:"none",borderRightStyle:"solid",borderRightWidth:1,borderRightColor:c.border,padding:0,margin:0,color:"inherit"};
          if(it.route){
            return <button key={it.key} type="button" className="bpTkItem" title={title} aria-label={aria}
                     onClick={function(){ onNavigate(it.route); }} style={Object.assign({}, base, {cursor:"pointer"})}>{inner}</button>;
          }
          return <div key={it.key} className="bpTkItem" role="group" aria-label={aria} title={title} style={base}>{inner}</div>;
        })}
      </div>
    </div>
  );
}
