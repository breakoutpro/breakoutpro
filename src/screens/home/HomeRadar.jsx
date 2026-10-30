import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useLang } from "../../i18n/translations";
import { NIFTY50_SYMS, BANKNIFTY_SYMS } from "../../data/indexConstituents";
import { loadWatchlist } from "../../hooks/useWatchlist";
import { useRadarSettings, useIntradayRadar, enableSound, beep, MULTS, PROXS, UNIVERSES } from "../../hooks/useIntradayRadar";
import { istHHMM, istDateLabel, newEvents, freshness, vwapSide } from "../../market/intradayRadar";

// BreakoutPro - HomeRadar.jsx
// Live Intraday Scalping Radar sections for Home: INTRADAY VOLUME SHOCKERS, DAY HIGH & DAY LOW CROSSERS,
// VWAP PROXIMITY RADAR and DAILY CPR & PIVOT LEVELS. All values come from /api/market?action=radar (real
// 5-minute candles, see src/market/intradayRadar.js for every rule). Informational market activity only:
// factual event labels, no buy or sell wording. Freshness is shown as Live / Delayed / EOD / Unavailable with
// the last bar time (IST). Alerts and sound work only while this page is open.
// Rules: no backtick, no triple-equals, ASCII only.

var INDEX_SYMS = ["NIFTY", "BANKNIFTY"];

function fmt(v, d){ return typeof v == "number" && isFinite(v) ? v.toLocaleString("en-IN", { minimumFractionDigits:d == null ? 2 : d, maximumFractionDigits:d == null ? 2 : d }) : "--"; }
function compact(v){
  if(typeof v != "number" || !isFinite(v)) return "--";
  if(v >= 10000000) return (v / 10000000).toFixed(2) + " Cr";
  if(v >= 100000) return (v / 100000).toFixed(2) + " L";
  if(v >= 1000) return (v / 1000).toFixed(1) + " K";
  return String(Math.round(v));
}
function universeSyms(id){
  if(id == "banknifty") return BANKNIFTY_SYMS;
  if(id == "watchlist"){
    var w = [];
    try{ w = loadWatchlist().filter(function(s){ return typeof s == "string" && /^[A-Z0-9&-]{1,20}$/.test(s); }); }catch(e){}
    return w.slice(0, 50);
  }
  return NIFTY50_SYMS;
}

export function radarSymbols(universe){
  var u = universeSyms(universe).slice();
  INDEX_SYMS.forEach(function(s){ if(u.indexOf(s) < 0) u.push(s); });
  return u;
}

function Section(props){
  var c = props.c, light = c.scheme == "light";
  return (
    <section data-testid={props.id} aria-label={props.title} style={{boxSizing:"border-box",minWidth:0,padding:"10px 12px",background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:14,boxShadow:light ? "0 4px 14px rgba(37,99,235,0.08), 0 1px 2px rgba(15,23,42,0.05)" : "0 3px 10px rgba(0,0,0,0.22)",color:c.text1}}>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginBottom:6}}>
        <h3 style={{margin:0,fontSize:12,fontWeight:800,letterSpacing:0.4}}>{props.title}</h3>
        <span data-testid={props.id + "-fresh"} style={{fontSize:10,fontWeight:600,color:c.text3}}>{props.fresh}</span>
      </div>
      {props.children}
    </section>
  );
}

function Row(props){
  var c = props.c;
  return (
    <div data-testid={props.tid} style={{padding:"6px 0",borderTop:"1px solid " + c.border,minWidth:0,opacity:props.dim ? 0.75 : 1}}>
      <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap",minWidth:0}}>
        <span style={{fontSize:13,fontWeight:800,overflowWrap:"anywhere"}}>{props.sym}</span>
        {props.price != null ? <span style={{fontSize:12,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{"\u20B9" + fmt(props.price)}</span> : null}
        {props.pct != null ? <span style={{fontSize:11,fontWeight:700,color:props.pct >= 0 ? c.up : c.down,fontVariantNumeric:"tabular-nums"}}>{(props.pct >= 0 ? "+" : "") + props.pct.toFixed(2) + "%"}</span> : null}
        <span style={{marginLeft:"auto",fontSize:11,fontWeight:800,color:props.tagColor || c.text2,whiteSpace:"nowrap"}}>{props.tag}</span>
      </div>
      <div style={{marginTop:2,fontSize:10.5,color:c.text2,lineHeight:1.35}}>{props.detail}</div>
    </div>
  );
}

function Empty(props){ return (<div data-testid={props.tid} role="status" style={{padding:"8px 0",fontSize:12,color:props.c.text3,lineHeight:1.4}}>{props.children}</div>); }

function Chip(props){
  var c = props.c, on = props.on;
  return (<button type="button" data-testid={props.tid} aria-pressed={on} onClick={props.onClick} style={{height:26,padding:"0 9px",borderRadius:999,border:"1px solid " + (on ? c.blue : c.border),background:on ? c.blue : "transparent",color:on ? "#FFFFFF" : c.text2,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{props.children}</button>);
}

export default function HomeRadar(props){
  useLang();
  var c = useTheme().c;
  var light = c.scheme == "light";
  var cs = useRadarSettings();
  var cfg = cs[0], setCfg = cs[1];
  var ps = useState(false);
  var paused = ps[0], setPaused = ps[1];
  var syms = radarSymbols(cfg.universe);
  var rd = useIntradayRadar(syms, paused);
  var st = rd.state, data = st.data;
  var results = data ? data.results : [];
  var open = !!(data && data.session == "OPEN" && results.some(function(r){ return r.open; }));
  var seen = useRef(null);
  var ns = useState(Date.now());
  var setNow = ns[1];
  useEffect(function(){ var id = setInterval(function(){ setNow(Date.now()); }, 30000); return function(){ clearInterval(id); }; }, []);

  var stocks = results.filter(function(r){ return INDEX_SYMS.indexOf(r.sym) < 0; });
  var shockers = stocks.filter(function(r){ return r.vol && r.vol.state == "ok" && r.vol.mult >= cfg.mult; }).sort(function(a, b){ return b.vol.mult - a.vol.mult; }).slice(0, 8);
  var crossers = stocks.filter(function(r){ return r.cross && r.cross.state == "ok" && r.cross.latest; }).sort(function(a, b){
    var fa = a.cross.latest.fresh ? 1 : 0, fb = b.cross.latest.fresh ? 1 : 0;
    return fb - fa || b.cross.latest.time - a.cross.latest.time;
  }).slice(0, 8);
  var nears = stocks.filter(function(r){ return r.cross && r.cross.state == "ok" && !r.cross.latest && r.cross.near; }).slice(0, 3);
  var vw = stocks.filter(function(r){ return r.vwap && r.vwap.distPct != null && (r.vwap.state == "ok" || r.vwap.state == "eod"); }).sort(function(a, b){ return Math.abs(a.vwap.distPct) - Math.abs(b.vwap.distPct); }).slice(0, 8);
  var cprRows = results.filter(function(r){ return r.cpr; });
  var idxRows = cprRows.filter(function(r){ return INDEX_SYMS.indexOf(r.sym) >= 0; });
  var stkRows = cprRows.filter(function(r){ return INDEX_SYMS.indexOf(r.sym) < 0; }).sort(function(a, b){ return a.cpr.widthPct - b.cpr.widthPct; }).slice(0, 6);
  var cprList = idxRows.concat(stkRows);

  // Alerts (sound) fire only for NEW fresh events, while the page is open and the session is open.
  useEffect(function(){
    if(!data) return;
    var ev = [];
    shockers.forEach(function(r){ ev.push({ type:"vol", sym:r.sym, time:r.vol.barTime }); });
    crossers.forEach(function(r){ if(r.cross.latest.fresh) ev.push({ type:r.cross.latest.type, sym:r.sym, time:r.cross.latest.time }); });
    var res = newEvents(seen.current, ev);
    seen.current = res.seen;
    if(res.fresh.length && cfg.sound && open) beep();
  }, [data, cfg.mult]);
  useEffect(function(){ seen.current = null; }, [cfg.universe]);

  var lastBar = results.reduce(function(m, r){ return r.lastBarTime && r.lastBarTime > m ? r.lastBarTime : m; }, 0) || null;
  var anyStatus = results.some(function(r){ return r.status == "LIVE"; }) ? "LIVE" : "DELAYED";
  var fr = freshness(anyStatus, open, lastBar);
  var freshTxt = !data ? (st.status == "error" ? "Unavailable" : "Loading...") : (fr.label + (fr.stamp ? " - " + fr.stamp : "") + (st.failedAt ? " - refresh failed" : ""));
  var sectionFresh = freshTxt + " - 5m candles, Yahoo Finance";

  function toggleSound(){
    if(!cfg.sound){ if(enableSound()){ setCfg({ sound:true }); beep(); } }
    else setCfg({ sound:false });
  }
  var soundSupported = typeof window != "undefined" && !!(window.AudioContext || window.webkitAudioContext);

  var volMsg = null;
  if(!data) volMsg = st.status == "error" ? "Intraday data unavailable right now." : "Loading intraday data...";
  else if(stocks.length && stocks.every(function(r){ return !r.vol || r.vol.state != "ok"; })) volMsg = "Intraday volume history unavailable (needs 3 earlier sessions of 5-minute bars).";
  else if(shockers.length == 0) volMsg = "No stock at or above " + cfg.mult + "x its usual 5-minute volume right now.";
  var crossMsg = !data ? volMsg : (crossers.length == 0 && nears.length == 0 ? "No Day High or Day Low crossings in the last 30 minutes." : null);
  var vwMsg = !data ? volMsg : (vw.length == 0 ? "VWAP unavailable (needs intraday price-volume data)." : null);
  var cprMsg = !data ? volMsg : (cprList.length == 0 ? "CPR unavailable (needs a completed previous session)." : null);

  return (
    <div data-testid="home-radar" style={{display:"grid",gridTemplateColumns:"minmax(0, 1fr)",gap:8,minWidth:0}}>
      <div data-testid="radar-controls" style={{boxSizing:"border-box",display:"flex",flexWrap:"wrap",alignItems:"center",gap:6,padding:"8px 10px",background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:12,color:c.text1}}>
        <span style={{fontSize:11,fontWeight:800,color:c.text2}}>Volume</span>
        {MULTS.map(function(m){ return <Chip key={m} c={c} tid={"radar-mult-" + m} on={cfg.mult == m} onClick={function(){ setCfg({ mult:m }); }}>{m + "x"}</Chip>; })}
        <span style={{fontSize:11,fontWeight:800,color:c.text2,marginLeft:6}}>Stocks</span>
        {UNIVERSES.map(function(u){ return <Chip key={u.id} c={c} tid={"radar-uni-" + u.id} on={cfg.universe == u.id} onClick={function(){ setCfg({ universe:u.id }); }}>{u.label}</Chip>; })}
        <span style={{fontSize:11,fontWeight:800,color:c.text2,marginLeft:6}}>VWAP near</span>
        {PROXS.map(function(p){ return <Chip key={p} c={c} tid={"radar-prox-" + p} on={cfg.prox == p} onClick={function(){ setCfg({ prox:p }); }}>{"\u00B1" + p.toFixed(2) + "%"}</Chip>; })}
        <span style={{flex:"1 1 8px"}}/>
        {soundSupported ? <Chip c={c} tid="radar-sound" on={cfg.sound} onClick={toggleSound}>{cfg.sound ? "Sound on" : "Sound off"}</Chip> : null}
        <Chip c={c} tid="radar-pause" on={paused} onClick={function(){ setPaused(function(p){ return !p; }); }}>{paused ? "Resume" : "Pause"}</Chip>
        <Chip c={c} tid="radar-refresh" on={false} onClick={function(){ rd.refresh(); }}>Refresh</Chip>
        <div style={{flex:"1 1 100%",fontSize:9.5,color:c.text3,lineHeight:1.35}}>{"Updates only while this page is open (no background notifications). " + (paused ? "Paused. " : "") + (cfg.sound ? "Sound plays for new events; turn it off any time." : "")}</div>
      </div>

      <div data-testid="radar-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 340px), 1fr))",gap:8,minWidth:0,alignItems:"start"}}>
      <Section c={c} id="radar-volume" title="INTRADAY VOLUME SHOCKERS" fresh={sectionFresh}>
        {volMsg && shockers.length == 0 ? <Empty c={c} tid="radar-volume-empty">{volMsg}</Empty> : shockers.map(function(r){
          return (<Row key={r.sym} c={c} tid={"shock-" + r.sym} sym={r.sym} price={r.price} pct={r.chgPct} tag={"Volume Surge " + r.vol.mult.toFixed(1) + "x"} tagColor={c.blue}
            detail={"5m volume " + compact(r.vol.volume) + " vs avg " + compact(r.vol.avg) + " (" + r.vol.samples + " sessions, same time) - bar " + istHHMM(r.vol.barTime) + " IST"}/>);
        })}
      </Section>

      <Section c={c} id="radar-cross" title="DAY HIGH & DAY LOW CROSSERS" fresh={(open ? "Market open" : "Market closed") + " - " + sectionFresh}>
        {crossMsg && crossers.length == 0 && nears.length == 0 ? <Empty c={c} tid="radar-cross-empty">{crossMsg}</Empty> : null}
        {crossers.map(function(r){
          var L = r.cross.latest, hi = L.type == "high";
          return (<Row key={r.sym} c={c} tid={"cross-" + r.sym} sym={r.sym} price={r.price} pct={r.chgPct} tag={hi ? "Day High Cross" : "Day Low Cross"} tagColor={hi ? c.up : c.down}
            detail={"Day High " + fmt(r.cross.dayHigh) + " / Day Low " + fmt(r.cross.dayLow) + " - crossed " + fmt(L.level) + " in the 5m bar at " + istHHMM(L.time) + " IST" + (L.fresh ? " (fresh)" : " (earlier)")}/>);
        })}
        {nears.map(function(r){
          return (<Row key={"n" + r.sym} dim c={c} tid={"near-" + r.sym} sym={r.sym} price={r.price} pct={r.chgPct} tag={r.cross.near == "high" ? "Near Day High" : "Near Day Low"}
            detail={"Within 0.15% of the level, not crossed - Day High " + fmt(r.cross.dayHigh) + " / Day Low " + fmt(r.cross.dayLow)}/>);
        })}
      </Section>

      <Section c={c} id="radar-vwap" title="VWAP PROXIMITY RADAR" fresh={sectionFresh}>
        {vwMsg && vw.length == 0 ? <Empty c={c} tid="radar-vwap-empty">{vwMsg}</Empty> : vw.map(function(r){
          var side = vwapSide(r.vwap.distPct, cfg.prox);
          var lab = side == "above" ? "Above VWAP" : (side == "below" ? "Below VWAP" : "Near VWAP");
          return (<Row key={r.sym} c={c} tid={"vwap-" + r.sym} sym={r.sym} price={r.vwap.price} pct={r.chgPct} tag={lab} tagColor={side == "above" ? c.up : (side == "below" ? c.down : c.text2)}
            detail={"VWAP " + fmt(r.vwap.value) + " - " + (r.vwap.distPct >= 0 ? "+" : "") + r.vwap.distPct.toFixed(2) + "% from VWAP (near = within \u00B1" + cfg.prox.toFixed(2) + "%) - " + (r.vwap.state == "eod" ? "session VWAP (EOD), " : "") + "bar " + istHHMM(r.vwap.lastBarTime) + " IST"}/>);
        })}
      </Section>

      <Section c={c} id="radar-cpr" title="DAILY CPR & PIVOT LEVELS" fresh={"Calculated reference levels, not predictions - 5m candles, Yahoo Finance"}>
        {cprMsg && cprList.length == 0 ? <Empty c={c} tid="radar-cpr-empty">{cprMsg}</Empty> : cprList.map(function(r){
          var p = r.cpr;
          return (<Row key={r.sym} c={c} tid={"cpr-" + r.sym} sym={r.sym} price={null} pct={null} tag={"CPR " + (p.kind == "narrow" ? "Narrow" : (p.kind == "wide" ? "Wide" : "Normal"))} tagColor={c.text1}
            detail={"P " + fmt(p.pivot) + " - CPR " + fmt(p.bottom) + " to " + fmt(p.top) + " (width " + p.widthPct.toFixed(2) + "%) - R1 " + fmt(p.r1) + " - S1 " + fmt(p.s1) + " - from session " + istDateLabel(p.sessionDate) + (p.forNext ? " (last completed)" : "")}/>);
        })}
        <div style={{marginTop:4,fontSize:9.5,color:c.text3,lineHeight:1.35}}>Narrow below 0.25% width, Wide above 0.50%, from the last completed session. Index rows first, then the narrowest stock CPRs.</div>
      </Section>
      </div>
    </div>
  );
}
