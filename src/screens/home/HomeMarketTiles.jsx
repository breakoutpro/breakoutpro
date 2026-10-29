import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";
import Spark from "../../components/Spark";
import { useHomePcr, pcrLabel } from "../../hooks/useHomePcr";
import { buildTickerItems, formatTickerValue, formatTickerPct, pctDir, stateLabel } from "../../state/marketTickerModel";

// BreakoutPro - HomeMarketTiles.jsx
// Home index cards: NIFTY 50, BANK NIFTY, SENSEX, INDIA VIX. One row of four on desktop,
// a 2 x 2 grid on mobile (compact = true).
// Values come from the SAME model and payload as the market ticker (buildTickerItems on the
// shared /api/market-mood-data result), so freshness rules are identical: a quote that is not
// live shows its state (DELAYED, CLOSED, LAST CONFIRMED) and a missing quote shows
// "Unavailable", never a number.
// Sparkline: the daily closes the server already returns in indexHistory (drawn only when at
// least 2 real points exist). PCR tag: OI PCR from the option-chain service, only when the
// service returned it (see useHomePcr). VIX tag: calm / elevated using the same thresholds as
// the Market Mood engine (below 16 calm, above 19 elevated), nothing in between.
// Green and red only for the movement; everything else is neutral.
// Rules: no backtick, no triple-equals, ASCII only.

var KEYS = ["NIFTY", "BANKNIFTY", "SENSEX", "VIX"];

function sparkPoints(data, key){
  var h = data && data.indexHistory && data.indexHistory[key];
  if(!h || !Array.isArray(h.points)) return null;
  var p = h.points.filter(function(v){ return typeof v == "number" && isFinite(v); });
  return p.length >= 2 ? p : null;
}

export default function HomeMarketTiles(props){
  useLang();
  var theme = useTheme();
  var c = theme.c;
  var light = c.scheme=="light";
  var compact = !!props.compact;
  var ns = useState(Date.now());
  var now = ns[0], setNow = ns[1];
  useEffect(function(){
    var id = setInterval(function(){ setNow(Date.now()); }, 15000);
    return function(){ clearInterval(id); };
  }, []);
  var pcrs = useHomePcr();
  var mm = props.mm || {};
  var all = buildTickerItems(mm.data, { now:now, networkStatus:mm.networkStatus, loadFailed:(mm.status=="error" || mm.status=="offline") });
  var items = all.filter(function(it){ return KEYS.indexOf(it.key) >= 0; });
  var go = props.setTab || function(){};
  var fs = compact ? { label:11, price:16, pct:11, tag:9 } : { label:12, price:19, pct:12, tag:10 };
  return (
    <div data-testid="home-tiles" style={{display:"grid",gridTemplateColumns:compact ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",gap:compact ? 8 : 12}}>
      {items.map(function(it){
        var has = typeof it.value=="number" && isFinite(it.value) && it.state!="unavailable" && it.state!="loading";
        var dir = has ? pctDir(it.chgPct) : "neutral";
        var col = dir=="up" ? c.up : (dir=="down" ? c.down : c.text2);
        var pct = has ? formatTickerPct(it.chgPct) : null;
        var arrow = dir=="up" ? "\u25B2" : (dir=="down" ? "\u25BC" : "");
        var route = has ? it.route : null;
        var stateTag = has && it.state!="live" ? stateLabel(it.state) : "";
        var pts = has ? sparkPoints(mm.data, it.key) : null;
        var pc = (has && (it.key=="NIFTY" || it.key=="BANKNIFTY")) ? pcrs[it.key] : null;
        var vixTag = "";
        if(has && it.key=="VIX"){ vixTag = it.value < 16 ? "Calm" : (it.value > 19 ? "Elevated" : ""); }
        var tagLine = null;
        if(pc){
          var lab = pcrLabel(pc.pcr);
          var lc = lab=="Bullish" ? c.up : (lab=="Bearish" ? c.down : c.text2);
          tagLine = (
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:compact ? 3 : 4,minWidth:0}}>
              <span style={{fontSize:fs.tag,fontWeight:700,color:c.text2,whiteSpace:"nowrap"}}>{"PCR " + pc.pcr.toFixed(2)}{pc.stale ? " (delayed)" : ""}</span>
              <span style={{fontSize:fs.tag,fontWeight:800,color:lc,whiteSpace:"nowrap"}}>{lab}</span>
            </div>
          );
        } else if(vixTag){
          tagLine = (<div style={{marginTop:compact ? 3 : 4}}><span style={{fontSize:fs.tag,fontWeight:800,color:vixTag=="Calm" ? c.up : c.down,whiteSpace:"nowrap"}}>{vixTag}</span></div>);
        }
        var body = (
          <div style={{minWidth:0}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:6}}>
              <span style={{fontSize:fs.label,fontWeight:800,color:c.text1,letterSpacing:0.2,minWidth:0,overflowWrap:"anywhere"}}>{it.label}</span>
              {stateTag ? <span style={{fontSize:8,fontWeight:800,color:c.text3,whiteSpace:"nowrap"}}>{stateTag}</span> : null}
            </div>
            {has ? (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,marginTop:2}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:fs.price,fontWeight:800,color:c.text1,fontVariantNumeric:"tabular-nums",lineHeight:1.15}}>{formatTickerValue(it.value)}</div>
                  {pct ? <div style={{fontSize:fs.pct,fontWeight:700,color:col,fontVariantNumeric:"tabular-nums"}}>{pct}{arrow ? " " + arrow : ""}</div> : null}
                </div>
                {pts ? <div aria-hidden="true" style={{flexShrink:0}}><Spark data={pts} color={dir=="down" ? c.down : (dir=="up" ? c.up : c.text3)} w={compact ? 44 : 64} h={compact ? 22 : 28}/></div> : null}
              </div>
            ) : (
              <div style={{marginTop:4,fontSize:compact ? 12 : 13,fontWeight:600,color:c.text3}}>{it.state=="loading" ? "--" : t("c.unavailable")}</div>
            )}
            {tagLine}
          </div>
        );
        var box = { textAlign:"left",width:"100%",boxSizing:"border-box",minWidth:0,padding:compact ? "8px 10px" : "10px 14px",minHeight:compact ? 78 : 92,background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:compact ? 12 : 14,boxShadow:light ? "0 4px 14px rgba(37,99,235,0.08), 0 1px 2px rgba(15,23,42,0.05)" : "0 3px 10px rgba(0,0,0,0.22)",fontFamily:"inherit",color:c.text1 };
        if(route) return <button key={it.key} type="button" data-testid={"home-tile-" + it.key} onClick={function(){ go(route); }} style={Object.assign({cursor:"pointer"}, box)}>{body}</button>;
        return <div key={it.key} data-testid={"home-tile-" + it.key} style={box}>{body}</div>;
      })}
    </div>
  );
}
