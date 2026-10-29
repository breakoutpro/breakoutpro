import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";
import { istStamp } from "../../state/marketTickerModel";

// BreakoutPro - HomeStrips.jsx
// Home strips under the index cards.
//   MarketStrip: ONE row with Crude (WTI), Nat Gas (NYMEX) and Sector Momentum (Top / Weakest).
//   NewsTicker: a separate slim Breaking News row under it.
// Data: commodities and sectors come from the shared /api/market-mood-data payload (props.mm), headlines
// from /api/news (the one useLiveNews App already runs, passed in as props.news). The commodity quotes are the global feed's
// WTI crude and NYMEX natural gas in USD, so they are labelled exactly that (not Brent, not MCX). A quote
// that is not LIVE says delayed or stale (with its IST time), and a missing one says Unavailable.
// Headlines rotate every 10 s; hover, keyboard focus and a held touch pause the rotation. A headline opens
// the News page, the sector segment opens the Market Heatmap. Nothing here is invented.
// The market strip never widens the page: it scrolls sideways inside its own box.
// Rules: no backtick, no triple-equals, ASCII only.

var ROTATE_MS = 10000;
var MAX_NEWS = 5;

function sgn(v){ return (v >= 0 ? "+" : "") + v.toFixed(2) + "%"; }
function isNum(v){ return typeof v == "number" && isFinite(v); }

function Svg(props){
  var p = { width:props.s || 16, height:props.s || 16, viewBox:"0 0 24 24", fill:"none", stroke:props.color, strokeWidth:2, strokeLinecap:"round", strokeLinejoin:"round", "aria-hidden":"true", focusable:"false", style:{flexShrink:0} };
  if(props.n=="drop") return (<svg {...p}><path d="M12 3c3.5 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.5-6.5 6-11z"/></svg>);
  if(props.n=="flame") return (<svg {...p}><path d="M12 3c1 3-3 5-3 9a4 4 0 0 0 8 0c0-2-1-3-2-4 0 2-1 3-2 3 1-3 0-6-1-8z"/><path d="M7 14a5 5 0 0 0 10 0"/></svg>);
  if(props.n=="bolt") return (<svg {...p} fill={props.color}><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>);
  return (<svg {...p}><rect x="3" y="12" width="4" height="8" rx="1"/><rect x="10" y="7" width="4" height="13" rx="1"/><rect x="17" y="3" width="4" height="17" rx="1"/></svg>);
}

function findGlobal(data, name){
  var g = data && data.global;
  if(!g || !Array.isArray(g.items)) return null;
  for(var i = 0; i < g.items.length; i++){ if(g.items[i] && g.items[i].name == name) return g.items[i]; }
  return null;
}

function commodity(label, full, q){
  if(!q || !isNum(q.chgPct) || q.freshness == "UNAVAILABLE") return { label:label, full:full, ok:false };
  return { label:label, full:full, ok:true, ltp:isNum(q.ltp) ? q.ltp : null, chg:q.chgPct, tag:q.freshness == "LIVE" ? "" : ((q.freshness == "STALE" ? "stale" : "delayed") + (isNum(q.ts) ? " " + istStamp(q.ts) : "")) };
}

function CommodityItem(props){
  var c = props.c, it = props.it;
  var col = !it.ok ? c.text3 : (it.chg > 0 ? c.up : (it.chg < 0 ? c.down : c.text2));
  return (
    <span data-testid={"home-comm-" + props.k} style={{display:"inline-flex",alignItems:"baseline",gap:6,whiteSpace:"nowrap",flexShrink:0}}>
      {props.compact ? null : <span style={{alignSelf:"center",display:"inline-flex"}}><Svg n={props.k=="crude" ? "drop" : "flame"} color={c.blue} s={15}/></span>}
      <span title={it.full} style={{fontSize:12,fontWeight:800,color:c.text1}}>{it.label}</span>
      {it.ok ? (
        <span style={{display:"inline-flex",alignItems:"baseline",gap:5,fontVariantNumeric:"tabular-nums"}}>
          {it.ltp != null ? <span style={{fontSize:12,fontWeight:700,color:c.text1}}>{"$" + it.ltp.toFixed(2)}</span> : null}
          <span style={{fontSize:11,fontWeight:700,color:col}}>{sgn(it.chg)}{it.chg > 0 ? " \u25B2" : (it.chg < 0 ? " \u25BC" : "")}</span>
          {it.tag ? <span style={{fontSize:props.compact ? 8 : 9,fontWeight:700,color:c.text3}}>{"(" + it.tag + ")"}</span> : null}
        </span>
      ) : (<span style={{fontSize:11,fontWeight:600,color:c.text3}}>{t("c.unavailable")}</span>)}
    </span>
  );
}

// Slim Breaking News ticker, directly under the market strip. Rotates to the next verified headline every
// 10 s; pauses on mouse hover and keyboard focus, and while a finger is held on it (resumes on release).
// A headline opens the News page. With no verified headline nothing is rendered (no placeholder text).
export function NewsTicker(props){
  useLang();
  var c = useTheme().c;
  var light = c.scheme == "light";
  // Headlines come from the single shared news hook App already runs (props.news), so Home adds no request of its own.
  var news = props.news || { status:"unavailable", news:[] };
  var list = news.status == "ok" && Array.isArray(news.news) ? news.news.slice(0, MAX_NEWS) : [];
  var is = useState(0);
  var idx = is[0], setIdx = is[1];
  var ps = useState(false);
  var paused = ps[0], setPaused = ps[1];
  var go = props.setTab || function(){};
  useEffect(function(){
    if(paused || list.length < 2) return undefined;
    var id = setInterval(function(){ setIdx(function(i){ return i + 1; }); }, ROTATE_MS);
    return function(){ clearInterval(id); };
  }, [paused, list.length]);
  if(list.length == 0) return null;
  var cur = list[idx % list.length];
  var label = t("home.tk_breaking", "Breaking News");
  var evs = { onMouseEnter:function(){ setPaused(true); }, onMouseLeave:function(){ setPaused(false); }, onFocus:function(){ setPaused(true); }, onBlur:function(){ setPaused(false); }, onTouchStart:function(){ setPaused(true); }, onTouchEnd:function(){ setPaused(false); }, onTouchCancel:function(){ setPaused(false); } };
  return (
    <button type="button" data-testid="home-news" data-state="news" aria-label={label + ": " + cur.title} onClick={function(){ go("news"); }}
      style={{boxSizing:"border-box",display:"flex",alignItems:"center",gap:8,width:"100%",maxWidth:"100%",minWidth:0,height:props.compact ? 34 : 38,padding:props.compact ? "0 10px" : "0 14px",background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:12,boxShadow:light ? "0 3px 10px rgba(37,99,235,0.07)" : "0 3px 10px rgba(0,0,0,0.2)",cursor:"pointer",fontFamily:"inherit",color:c.text1,textAlign:"left",overflow:"hidden"}} {...evs}>
      <span style={{flexShrink:0,display:"inline-flex",alignItems:"center",gap:4,background:"#DC2626",color:"#FFFFFF",borderRadius:999,padding:"2px 8px",fontSize:10,fontWeight:800,whiteSpace:"nowrap"}}><Svg n="bolt" color="#FFFFFF" s={10}/>{label}</span>
      <span style={{flex:"1 1 0",minWidth:0,fontSize:12,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{cur.title}</span>
      <span aria-hidden="true" style={{flexShrink:0,color:c.blue,fontWeight:800}}>{">"}</span>
    </button>
  );
}

// Top and weakest sector from the verified sectors group. STALE rows are not used; delayed rows say so.
export function pickSectors(sectors){
  if(!sectors || !Array.isArray(sectors.items) || sectors.status == "UNAVAILABLE") return null;
  var list = sectors.items.filter(function(s){ return s && isNum(s.chgPct) && s.freshness != "STALE"; });
  if(list.length == 0) return null;
  var top = list[0], weak = list[0];
  list.forEach(function(s){ if(s.chgPct > top.chgPct) top = s; if(s.chgPct < weak.chgPct) weak = s; });
  return { top:top, weak:(list.length > 1 && weak !== top) ? weak : null, delayed:list.some(function(s){ return s.freshness != "LIVE"; }) };
}

// ONE compact horizontal market strip: Crude, Nat Gas and Sector Momentum (Top / Weakest) together.
// The strip never widens the page: its own row scrolls sideways when the content is wider than the screen
// (scrollbar hidden, touch scrolling). Freshness labels stay on every item.
export function MarketStrip(props){
  useLang();
  var c = useTheme().c;
  var light = c.scheme == "light";
  var cmp = !!props.compact;
  var data = props.mm && props.mm.data;
  var go = props.setTab || function(){};
  var crude = commodity(cmp ? "Crude WTI" : "Crude (WTI)", "Crude Oil WTI, NYMEX futures, USD", findGlobal(data, "Crude Oil (WTI)"));
  var gas = commodity(cmp ? "Gas NYMEX" : "Nat Gas (NYMEX)", "Natural Gas, NYMEX futures, USD (no verified MCX INR source)", data && data.macro ? data.macro.natGas : null);
  var sec = pickSectors(data && data.sectors);
  var divider = (<span aria-hidden="true" style={{width:1,height:18,background:c.border,flexShrink:0}}/>);
  function part(label, s){
    var col = s.chgPct > 0 ? c.up : (s.chgPct < 0 ? c.down : c.text2);
    return (
      <span style={{display:"inline-flex",alignItems:"baseline",gap:5,whiteSpace:"nowrap",flexShrink:0,fontVariantNumeric:"tabular-nums"}}>
        <span style={{fontSize:12,fontWeight:700,color:c.text1}}>{label + ": " + s.name}</span>
        <span style={{fontSize:11,fontWeight:800,color:col}}>{sgn(s.chgPct)}{s.chgPct > 0 ? " \u25B2" : (s.chgPct < 0 ? " \u25BC" : "")}</span>
      </span>
    );
  }
  var sector = !sec ? (
    <span data-testid="home-sector" data-state="unavailable" style={{display:"inline-flex",alignItems:"center",gap:6,flexShrink:0,whiteSpace:"nowrap"}}><Svg n="bars" color={c.blue} s={15}/><span style={{fontSize:12,fontWeight:800}}>{cmp ? "Sector:" : "Sector Momentum"}</span><span style={{fontSize:11,fontWeight:600,color:c.text3}}>{t("c.unavailable")}</span></span>
  ) : (
    <button type="button" data-testid="home-sector" data-state="ok" aria-label={t("home.sector_title", "Sector Momentum")} onClick={function(){ go("marketheatmap"); }} style={{display:"inline-flex",alignItems:"center",gap:cmp ? 8 : 16,flexShrink:0,whiteSpace:"nowrap",background:"none",border:"none",padding:0,margin:0,cursor:"pointer",fontFamily:"inherit",color:c.text1}}>
      <span style={{display:"inline-flex",alignItems:"center",gap:6}}><Svg n="bars" color={c.blue} s={15}/><span style={{fontSize:12,fontWeight:800}}>{cmp ? "Sector:" : t("home.sector_title", "Sector Momentum")}</span></span>
      {part(t("home.tk_top", "Top"), sec.top)}
      {sec.weak ? part(t("home.tk_weak", "Weakest"), sec.weak) : null}
      {sec.delayed ? <span style={{fontSize:9,fontWeight:700,color:c.text3}}>(delayed)</span> : null}
      <span aria-hidden="true" style={{color:c.blue,fontWeight:800}}>{">"}</span>
    </button>
  );
  return (
    <div data-testid="home-strip" role="region" aria-label="Commodities and sector momentum (scrolls sideways)" tabIndex={0} className="bpStripScroll"
      style={{boxSizing:"border-box",width:"100%",maxWidth:"100%",minWidth:0,height:cmp ? 38 : 40,display:"flex",alignItems:"center",gap:cmp ? 10 : 14,padding:cmp ? "0 10px" : "0 14px",overflowX:"auto",overflowY:"hidden",WebkitOverflowScrolling:"touch",background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:12,boxShadow:light ? "0 3px 10px rgba(37,99,235,0.07)" : "0 3px 10px rgba(0,0,0,0.2)"}}>
      <style>{".bpStripScroll{scrollbar-width:none}.bpStripScroll::-webkit-scrollbar{display:none}"}</style>
      <CommodityItem k="crude" it={crude} c={c} compact={cmp}/>{divider}<CommodityItem k="gas" it={gas} c={c} compact={cmp}/>{divider}{sector}
    </div>
  );
}
