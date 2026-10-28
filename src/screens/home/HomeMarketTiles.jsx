import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";
import { buildTickerItems, formatTickerValue, formatTickerPct, pctDir, stateLabel } from "../../state/marketTickerModel";

// BreakoutPro - HomeMarketTiles.jsx
// Desktop Home market boxes: NIFTY 50, BANK NIFTY, SENSEX, GIFT NIFTY, INDIA VIX.
// Built from the SAME model and payload as the market ticker (buildTickerItems on
// the shared /api/market-mood-data result), so values, freshness rules and the
// "no verified provider" rule are identical. A quote with no verified value shows
// "Unavailable", never a number. When a quote is not live, its state (DELAYED,
// CLOSED, LAST CONFIRMED) is printed in the box, so delayed data is never shown as live.
// Green and red only for the movement; everything else is neutral.
// Rules: no backtick, no triple-equals, ASCII only.
export default function HomeMarketTiles(props){
  useLang();
  var theme = useTheme();
  var c = theme.c;
  var light = c.scheme=="light";
  var ns = useState(Date.now());
  var now = ns[0], setNow = ns[1];
  useEffect(function(){
    var id = setInterval(function(){ setNow(Date.now()); }, 15000);
    return function(){ clearInterval(id); };
  }, []);
  var mm = props.mm || {};
  var items = buildTickerItems(mm.data, { now:now, networkStatus:mm.networkStatus, loadFailed:(mm.status=="error" || mm.status=="offline") });
  var go = props.setTab || function(){};
  return (
    <div data-testid="home-tiles" style={{display:"grid",gridTemplateColumns:"repeat(5, minmax(0, 1fr))",gap:12}}>
      {items.map(function(it){
        var has = typeof it.value=="number" && isFinite(it.value) && it.state!="unavailable" && it.state!="loading";
        var dir = has ? pctDir(it.chgPct) : "neutral";
        var col = dir=="up" ? c.up : (dir=="down" ? c.down : c.text2);
        var pct = has ? formatTickerPct(it.chgPct) : null;
        var arrow = dir=="up" ? "\u2197" : (dir=="down" ? "\u2198" : "");
        var route = has ? it.route : null;
        var tag = has && it.state!="live" ? stateLabel(it.state) : "";
        var body = (
          <div style={{minWidth:0}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:6}}>
              <span style={{fontSize:11,fontWeight:700,color:c.text1,letterSpacing:0.2,minWidth:0,overflowWrap:"anywhere"}}>{it.label}</span>
              {tag ? <span style={{fontSize:8,fontWeight:800,color:c.text3,whiteSpace:"nowrap"}}>{tag}</span> : null}
            </div>
            {has ? (
              <div style={{display:"flex",alignItems:"baseline",flexWrap:"wrap",gap:"0 8px",marginTop:3}}>
                <span style={{fontSize:19,fontWeight:800,color:c.text1,fontVariantNumeric:"tabular-nums"}}>{formatTickerValue(it.value)}</span>
                {pct ? <span style={{fontSize:12,fontWeight:700,color:col,fontVariantNumeric:"tabular-nums"}}>{pct}{arrow ? " " + arrow : ""}</span> : null}
              </div>
            ) : (
              <div style={{marginTop:5,fontSize:13,fontWeight:600,color:c.text3}}>{it.state=="loading" ? "--" : t("c.unavailable")}</div>
            )}
          </div>
        );
        var box = { textAlign:"left",width:"100%",boxSizing:"border-box",minWidth:0,padding:"10px 14px",minHeight:66,background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:12,boxShadow:light ? "0 4px 14px rgba(37,99,235,0.08), 0 1px 2px rgba(15,23,42,0.05)" : "0 3px 10px rgba(0,0,0,0.22)",fontFamily:"inherit",color:c.text1 };
        if(route) return <button key={it.key} type="button" data-testid={"home-tile-" + it.key} onClick={function(){ go(route); }} style={Object.assign({cursor:"pointer"}, box)}>{body}</button>;
        return <div key={it.key} data-testid={"home-tile-" + it.key} style={box}>{body}</div>;
      })}
    </div>
  );
}
