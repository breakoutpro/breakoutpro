import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";
import { buildTickerItems, formatTickerValue, formatTickerPct, pctDir, stateLabel } from "../../state/marketTickerModel";
import { commodity, findGlobal } from "./HomeStrips";

// BreakoutPro - HomeTicker.jsx
// ONE slim market ticker under the header: NIFTY 50, BANK NIFTY, SENSEX, INDIA VIX, Crude and Nat Gas.
// Index values come from buildTickerItems over the shared /api/market-mood-data payload (the same model the
// rest of the app uses), so freshness is identical: LIVE is shown only for a verified live quote, any other
// quote shows its state (DELAYED, CLOSED, LAST CONFIRMED) with its IST time, and a missing quote shows
// "Unavailable", never a number. Crude is WTI and Nat Gas is NYMEX, both USD futures (no verified
// Brent or MCX source), labelled exactly that. GIFT NIFTY has no verified provider and is not shown.
// One line: on desktop it fits; on mobile it scrolls sideways inside its own box (never widens the page).
// Green and red only for movement.
// Rules: no backtick, no triple-equals, ASCII only.

var KEYS = ["NIFTY", "BANKNIFTY", "SENSEX", "VIX"];
var EXCH = { NIFTY:"NSE", BANKNIFTY:"NSE", SENSEX:"BSE", VIX:"NSE" };

function isNum(v){ return typeof v == "number" && isFinite(v); }

export default function HomeTicker(props){
  useLang();
  var c = useTheme().c;
  var light = c.scheme == "light";
  var ns = useState(Date.now());
  var now = ns[0], setNow = ns[1];
  useEffect(function(){
    var id = setInterval(function(){ setNow(Date.now()); }, 15000);
    return function(){ clearInterval(id); };
  }, []);
  var big = !!props.big;
  var mm = props.mm || {};
  var data = mm.data;
  var go = props.setTab || function(){};
  var all = buildTickerItems(data, { now:now, networkStatus:mm.networkStatus, loadFailed:(mm.status == "error" || mm.status == "offline") });
  var idx = all.filter(function(it){ return KEYS.indexOf(it.key) >= 0; });
  var rows = idx.map(function(it){
    var has = isNum(it.value) && it.state != "unavailable" && it.state != "loading";
    var basis = isNum(it.chgPct) ? it.chgPct : (isNum(it.chgAbs) ? it.chgAbs : null);
    var dir = (has && basis != null) ? pctDir(basis) : "neutral";
    var tag = has ? (it.state == "live" ? "LIVE" : (stateLabel(it.state) + ((it.asOf && !props.big) ? " " + it.asOf : ""))) : "";
    var tipTime = (has && it.asOf) ? ", as of " + it.asOf + " IST" : "";
    return { k:it.key, label:it.label, exch:EXCH[it.key], has:has, loading:it.state == "loading", value:has ? formatTickerValue(it.value) : null, pct:(has && isNum(it.chgPct)) ? formatTickerPct(it.chgPct) : null, dir:dir, tag:tag, tipTime:tipTime, live:it.state == "live", route:has ? it.route : null, raw:it };
  });
  var crude = commodity("Crude WTI", "Crude Oil WTI, NYMEX futures, USD", findGlobal(data, "Crude Oil (WTI)"));
  var gas = commodity("Nat Gas", "Natural Gas, NYMEX futures, USD (no verified MCX INR source)", data && data.macro ? data.macro.natGas : null);
  rows.push({ k:"CRUDE", label:crude.label, exch:"NYMEX", has:crude.ok, loading:!data && mm.status != "error" && mm.status != "offline", value:(crude.ok && crude.ltp != null) ? "$" + crude.ltp.toFixed(2) : null, pct:crude.ok ? formatTickerPct(crude.chg) : null, dir:crude.ok ? pctDir(crude.chg) : "neutral", tag:crude.ok ? (crude.tag || "") : "", live:false, route:null, full:crude.full });
  rows.push({ k:"GAS", label:gas.label, exch:"NYMEX", has:gas.ok, loading:!data && mm.status != "error" && mm.status != "offline", value:(gas.ok && gas.ltp != null) ? "$" + gas.ltp.toFixed(2) : null, pct:gas.ok ? formatTickerPct(gas.chg) : null, dir:gas.ok ? pctDir(gas.chg) : "neutral", tag:gas.ok ? (gas.tag || "") : "", live:false, route:null, full:gas.full });
  function openIdx(r){
    var it = r.raw;
    if(!it || !props.onOpenIndex || (r.k != "NIFTY" && r.k != "BANKNIFTY" && r.k != "SENSEX")) return false;
    props.onOpenIndex({ key:r.k, label:r.label, val:r.value, ltp:r.value, up:r.dir != "down", pct:isNum(it.chgPct) ? it.chgPct : undefined });
    return true;
  }
  return (
    <div data-testid="home-ticker" role="region" aria-label="Market ticker (scrolls sideways on small screens)" tabIndex={0} className="bpTickScroll"
      style={{boxSizing:"border-box",width:"100%",maxWidth:"100%",minWidth:0,height:40,display:"flex",alignItems:"center",gap:big ? 6 : 14,padding:big ? "0 8px" : "0 12px",overflowX:"auto",overflowY:"hidden",WebkitOverflowScrolling:"touch",scrollBehavior:"smooth",background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:12,boxShadow:light ? "0 3px 10px rgba(37,99,235,0.07)" : "0 3px 10px rgba(0,0,0,0.2)"}}>
      <style>{".bpTickScroll{scrollbar-width:none}.bpTickScroll::-webkit-scrollbar{display:none}"}</style>
      {rows.map(function(r, i){
        var col = r.dir == "up" ? c.up : (r.dir == "down" ? c.down : c.text2);
        var arrow = big ? "" : (r.dir == "up" ? " \u25B2" : (r.dir == "down" ? " \u25BC" : ""));
        var tip = r.full ? (r.full + (r.tag ? " (" + r.tag + ")" : "")) : (r.exch + (r.tag ? " - " + r.tag : "") + (r.tipTime || ""));
        var body = (
          <span style={{display:"inline-flex",alignItems:"baseline",gap:big ? 3 : 5,whiteSpace:"nowrap"}}>
            <span style={{fontSize:big ? 11 : 12,fontWeight:800,color:c.text1}}>{r.label}</span>
            <span style={{fontSize:9,fontWeight:600,color:c.text3}}>{r.exch}</span>
            {r.has ? (
              <span style={{display:"inline-flex",alignItems:"baseline",gap:5,fontVariantNumeric:"tabular-nums"}}>
                {r.value ? <span style={{fontSize:big ? 11 : 12,fontWeight:700,color:c.text1}}>{r.value}</span> : null}
                {r.pct ? <span style={{fontSize:big ? 10.5 : 11,fontWeight:700,color:col}}>{r.pct + arrow}</span> : null}
                {r.tag ? <span style={{fontSize:9,fontWeight:700,color:r.live ? c.blue : c.text3}}>{r.live ? r.tag : "(" + r.tag.toLowerCase() + ")"}</span> : null}
              </span>
            ) : (<span style={{fontSize:11,fontWeight:600,color:c.text3}}>{r.loading ? "--" : t("c.unavailable")}</span>)}
          </span>
        );
        var item = r.route ? (<button type="button" data-testid={"home-tick-" + r.k} title={tip} onClick={function(){ if(!openIdx(r)) go(r.route); }} style={{background:"none",border:"none",padding:0,margin:0,cursor:"pointer",fontFamily:"inherit",color:c.text1,flexShrink:0}}>{body}</button>)
          : (<span data-testid={"home-tick-" + r.k} title={tip} style={{flexShrink:0}}>{body}</span>);
        return (<span key={r.k} style={{display:"inline-flex",alignItems:"center",gap:big ? 6 : 14,flexShrink:0}}>{i > 0 ? <span aria-hidden="true" style={{width:1,height:16,background:c.border}}/> : null}{item}</span>);
      })}
    </div>
  );
}
