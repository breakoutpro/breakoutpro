import { useTheme } from "../../theme/ThemeProvider";
import { useLang } from "../../i18n/translations";
import Spark from "../../components/Spark";
import { useHomePcr, pcrLabel } from "../../hooks/useHomePcr";
import { pcrFreshness } from "../../state/pcrModel";
import { isClockOpen } from "../DirectionEngine";
import { buildTickerItems, formatTickerValue, formatTickerPct, pctDir } from "../../state/marketTickerModel";

// BreakoutPro - HomePanels.jsx
// Desktop side panels: NIFTY 50 (daily closes from /api/market-mood-data indexHistory), Market Sentiment
// (OI PCR from the same option-chain service the OI + PCR screen uses, plus India VIX) and Sector
// Performance (the verified sectors group). Every value is shown only when the provider returned it;
// otherwise the panel says Unavailable. Stale sector rows are skipped. Green and red only for movement.
// Rules: no backtick, no triple-equals, ASCII only.

function isNum(v){ return typeof v == "number" && isFinite(v); }

function Card(props){
  var c = props.c, light = c.scheme == "light";
  return (<section data-testid={props.id} aria-label={props.title} style={{boxSizing:"border-box",minWidth:0,padding:"12px 14px",background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:14,boxShadow:light ? "0 4px 14px rgba(37,99,235,0.08), 0 1px 2px rgba(15,23,42,0.05)" : "0 3px 10px rgba(0,0,0,0.22)",color:c.text1}}>
    <div style={{fontSize:14,fontWeight:800,marginBottom:8}}>{props.title}</div>{props.children}</section>);
}

export function IndexPanel(props){
  useLang();
  var c = useTheme().c;
  var mm = props.mm || {};
  var items = buildTickerItems(mm.data, { now:Date.now(), networkStatus:mm.networkStatus, loadFailed:(mm.status == "error" || mm.status == "offline") });
  var it = items.filter(function(i){ return i.key == "NIFTY"; })[0];
  var has = it && isNum(it.value) && it.state != "unavailable" && it.state != "loading";
  var h = mm.data && mm.data.indexHistory && mm.data.indexHistory.NIFTY;
  var pts = (h && Array.isArray(h.points)) ? h.points.filter(isNum) : [];
  var dir = (has && isNum(it.chgPct)) ? pctDir(it.chgPct) : "neutral";
  var col = dir == "up" ? c.up : (dir == "down" ? c.down : c.text2);
  var open = (has && props.onOpenIndex) ? function(){ props.onOpenIndex({ key:"NIFTY", label:"NIFTY 50", val:formatTickerValue(it.value), ltp:formatTickerValue(it.value), up:dir != "down", pct:isNum(it.chgPct) ? it.chgPct : undefined }); } : null;
  return (
    <Card c={c} id="home-panel-index" title="NIFTY 50">
      {has ? (
        <button type="button" onClick={open || undefined} disabled={!open} style={{display:"block",width:"100%",textAlign:"left",background:"none",border:"none",padding:0,cursor:open ? "pointer" : "default",fontFamily:"inherit",color:c.text1}}>
          <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:22,fontWeight:800,fontVariantNumeric:"tabular-nums"}}>{formatTickerValue(it.value)}</span>
            {isNum(it.chgPct) ? <span style={{fontSize:13,fontWeight:700,color:col}}>{formatTickerPct(it.chgPct) + (dir == "up" ? " \u25B2" : (dir == "down" ? " \u25BC" : ""))}</span> : null}
            <span style={{fontSize:10,fontWeight:700,color:it.state == "live" ? c.blue : c.text3}}>{it.state == "live" ? "LIVE" : "(" + it.state + (it.asOf ? " " + it.asOf : "") + ")"}</span>
          </div>
          {pts.length >= 2 ? (<div style={{marginTop:8}}><Spark data={pts} color={dir == "down" ? c.down : (dir == "up" ? c.up : c.text3)} w={290} h={110}/><div style={{fontSize:10,color:c.text3,marginTop:4}}>{"Daily closes, last " + pts.length + " sessions (not intraday)"}</div></div>) : <div style={{marginTop:8,fontSize:12,color:c.text3}}>Daily history unavailable</div>}
        </button>
      ) : (<div style={{fontSize:13,color:c.text3}}>Unavailable</div>)}
    </Card>
  );
}

export function SentimentPanel(props){
  useLang();
  var c = useTheme().c;
  var pcrs = useHomePcr();
  var mm = props.mm || {};
  var items = buildTickerItems(mm.data, { now:Date.now(), networkStatus:mm.networkStatus, loadFailed:(mm.status == "error" || mm.status == "offline") });
  var vix = items.filter(function(i){ return i.key == "VIX"; })[0];
  var vixOk = vix && isNum(vix.value) && vix.state != "unavailable" && vix.state != "loading";
  var n = pcrs.NIFTY;
  var fr = pcrFreshness(n, isClockOpen(Date.now()), Date.now());
  var lab = n ? pcrLabel(n.pcr) : null;
  var lc = lab == "Bullish" ? c.up : (lab == "Bearish" ? c.down : c.text2);
  var pos = n ? Math.max(0, Math.min(1, (n.pcr - 0.4) / 1.2)) * 100 : 50;
  function row(k, v){ return (<div style={{display:"flex",justifyContent:"space-between",gap:8,fontSize:12,padding:"2px 0"}}><span style={{color:c.text2}}>{k}</span><span style={{fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{v}</span></div>); }
  return (
    <Card c={c} id="home-panel-sentiment" title="Market Sentiment (OI + PCR)">
      {n ? (
        <div>
          <div style={{display:"flex",alignItems:"baseline",gap:8}}><span style={{fontSize:20,fontWeight:800,color:lc}}>{lab}</span><span style={{fontSize:13,fontWeight:700}}>{n.pcr.toFixed(2)}</span><span data-testid="pcr-fresh" style={{fontSize:10,fontWeight:700,color:fr && fr.label == "Live" ? c.blue : c.text3}}>{fr ? fr.label + (fr.stamp ? " - " + fr.stamp : "") : ""}</span></div>
          <div aria-hidden="true" style={{position:"relative",height:6,borderRadius:3,background:c.border,margin:"8px 0 4px"}}><span style={{position:"absolute",left:pos + "%",top:-3,width:4,height:12,borderRadius:2,background:c.blue,transform:"translateX(-2px)"}}/></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:c.text3}}><span>Bearish below 0.8</span><span>Bullish above 1.2</span></div>
        </div>
      ) : (<div style={{fontSize:13,color:c.text3}}>OI PCR unavailable right now</div>)}
      <div style={{marginTop:8}}>
        {row("NIFTY PCR", n ? n.pcr.toFixed(2) : "Unavailable")}
        {row("BANKNIFTY PCR", pcrs.BANKNIFTY ? pcrs.BANKNIFTY.pcr.toFixed(2) : "Unavailable")}
        {row("INDIA VIX", vixOk ? formatTickerValue(vix.value) + (vix.value < 16 ? " (Calm)" : (vix.value > 19 ? " (Elevated)" : "")) : "Unavailable")}
      </div>
    </Card>
  );
}

export function SectorPanel(props){
  useLang();
  var c = useTheme().c;
  var s = props.mm && props.mm.data ? props.mm.data.sectors : null;
  var list = (s && s.status != "UNAVAILABLE" && Array.isArray(s.items)) ? s.items.filter(function(x){ return x && isNum(x.chgPct) && x.freshness != "STALE"; }) : [];
  list = list.slice().sort(function(a, b){ return b.chgPct - a.chgPct; }).slice(0, 7);
  var max = 0.01;
  list.forEach(function(x){ if(Math.abs(x.chgPct) > max) max = Math.abs(x.chgPct); });
  var delayed = list.some(function(x){ return x.freshness != "LIVE"; });
  return (
    <Card c={c} id="home-panel-sectors" title="Sector Performance">
      {list.length == 0 ? (<div style={{fontSize:13,color:c.text3}}>Sector data unavailable</div>) : (
        <div>
          {list.map(function(x){
            var up = x.chgPct >= 0;
            return (<div key={x.name} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",fontSize:12}}>
              <span style={{width:74,flexShrink:0,color:c.text2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{x.name}</span>
              <span aria-hidden="true" style={{flex:"1 1 0",minWidth:0,height:8,borderRadius:4,background:c.border,position:"relative",overflow:"hidden"}}><span style={{position:"absolute",left:0,top:0,bottom:0,width:Math.max(4, Math.abs(x.chgPct) / max * 100) + "%",background:up ? c.up : c.down,borderRadius:4}}/></span>
              <span style={{width:56,textAlign:"right",fontWeight:700,color:up ? c.up : c.down,fontVariantNumeric:"tabular-nums"}}>{(up ? "+" : "") + x.chgPct.toFixed(2) + "%"}</span>
            </div>);
          })}
          {delayed ? <div style={{fontSize:10,color:c.text3,marginTop:4}}>Some sector values are delayed, not live</div> : null}
        </div>
      )}
    </Card>
  );
}
