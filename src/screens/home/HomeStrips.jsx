import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";
import { useLiveNews } from "../../hooks/useLiveNews";
import { istStamp } from "../../state/marketTickerModel";

// BreakoutPro - HomeStrips.jsx
// Home strips under the index cards.
//   CommodityNewsStrip: Crude (WTI), Nat Gas (NYMEX) and a rotating Flash News headline.
//     Desktop: one slim row. Mobile (compact): the commodity row, then the news row.
//   SectorStrip: Top and Weakest sector.
// Data: commodities and sectors come from the shared /api/market-mood-data payload (props.mm),
// headlines from /api/news (useLiveNews). The commodity quotes are the global feed's WTI crude and
// NYMEX natural gas in USD, so they are labelled exactly that (not Brent, not MCX). A quote
// that is not LIVE says delayed or stale, and a missing one says Unavailable. Headlines rotate every 10 s
// and pause on hover, focus and touch. A headline opens the News page, a sector opens the Market Heatmap.
// Fixed row heights, so rotation never shifts the page. Nothing here is invented.
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
    <span data-testid={"home-comm-" + props.k} style={{display:"inline-flex",alignItems:"baseline",gap:6,whiteSpace:"nowrap",minWidth:0}}>
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

function NewsRow(props){
  var c = props.c;
  var is = useState(0);
  var idx = is[0], setIdx = is[1];
  var ps = useState(false);
  var paused = ps[0], setPaused = ps[1];
  var touchT = useRef(null);
  var list = props.list || [];
  useEffect(function(){
    if(paused || list.length < 2) return undefined;
    var id = setInterval(function(){ setIdx(function(i){ return i + 1; }); }, ROTATE_MS);
    return function(){ clearInterval(id); };
  }, [paused, list.length]);
  useEffect(function(){ return function(){ if(touchT.current) clearTimeout(touchT.current); }; }, []);
  function onTouchStart(){ if(touchT.current) clearTimeout(touchT.current); setPaused(true); }
  function onTouchEnd(){ if(touchT.current) clearTimeout(touchT.current); touchT.current = setTimeout(function(){ setPaused(false); }, 4000); }
  var cur = list.length ? list[idx % list.length] : null;
  var chip = (<span style={{flexShrink:0,display:"inline-flex",alignItems:"center",gap:4,background:"#DC2626",color:"#FFFFFF",borderRadius:999,padding:"2px 8px",fontSize:10,fontWeight:800,whiteSpace:"nowrap"}}><Svg n="bolt" color="#FFFFFF" s={10}/>{t("home.tk_news", "Flash News")}</span>);
  var txt = { flex:"1 1 0",minWidth:0,fontSize:12,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:c.text1,textAlign:"left" };
  var wrapStyle = { display:"flex",alignItems:"center",gap:8,minWidth:0,flex:"1 1 0",height:"100%" };
  var evs = { onMouseEnter:function(){ setPaused(true); }, onMouseLeave:function(){ setPaused(false); }, onFocus:function(){ setPaused(true); }, onBlur:function(){ setPaused(false); }, onTouchStart:onTouchStart, onTouchEnd:onTouchEnd };
  if(!cur) return null; // no verified headline: the news row is not rendered at all
  return (
    <button type="button" data-testid="home-news" data-state="news" aria-label={t("home.tk_news", "Flash News") + ": " + cur.title} onClick={function(){ props.go("news"); }}
      style={Object.assign({}, wrapStyle, {background:"none",border:"none",padding:0,margin:0,cursor:"pointer",fontFamily:"inherit"})} {...evs}>
      {chip}<span style={txt}>{cur.title}</span>
      <span aria-hidden="true" style={{flexShrink:0,color:c.blue,fontWeight:800}}>{">"}</span>
    </button>
  );
}

export function CommodityNewsStrip(props){
  useLang();
  var c = useTheme().c;
  var light = c.scheme == "light";
  var data = props.mm && props.mm.data;
  var news = useLiveNews();
  var list = news.status == "ok" ? news.news.slice(0, MAX_NEWS) : [];
  var hasNews = list.length > 0;
  var cmp = !!props.compact;
  var crude = commodity(cmp ? "Crude WTI" : "Crude (WTI)", "Crude Oil WTI, NYMEX futures, USD", findGlobal(data, "Crude Oil (WTI)"));
  var gas = commodity(cmp ? "Gas NYMEX" : "Nat Gas (NYMEX)", "Natural Gas, NYMEX futures, USD (no verified MCX INR source)", data && data.macro ? data.macro.natGas : null);
  var go = props.setTab || function(){};
  var pill = { boxSizing:"border-box",display:"flex",alignItems:"center",gap:12,height:40,padding:"0 14px",background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:12,boxShadow:light ? "0 3px 10px rgba(37,99,235,0.07)" : "0 3px 10px rgba(0,0,0,0.2)",overflow:"hidden" };
  var divider = (<span aria-hidden="true" style={{width:1,height:18,background:c.border,flexShrink:0}}/>);
  if(props.compact){
    return (
      <div style={{display:"grid",gap:6}}>
        <div style={Object.assign({}, pill, {height:"auto",minHeight:36,padding:"4px 10px",gap:"2px 10px",flexWrap:"wrap",justifyContent:"space-between"})}>
          <CommodityItem k="crude" it={crude} c={c} compact={true}/><CommodityItem k="gas" it={gas} c={c} compact={true}/>
        </div>
        {hasNews ? <div style={Object.assign({}, pill, {height:36,padding:"0 10px",gap:8})} data-testid="home-news-row"><NewsRow c={c} go={go} list={list}/></div> : null}
      </div>
    );
  }
  return (
    <div style={pill}>
      <CommodityItem k="crude" it={crude} c={c}/>{divider}<CommodityItem k="gas" it={gas} c={c}/>
      {hasNews ? divider : null}
      {hasNews ? <div data-testid="home-news-row" style={{display:"flex",flex:"1 1 0",minWidth:0,height:"100%"}}><NewsRow c={c} go={go} list={list}/></div> : null}
    </div>
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

export function SectorStrip(props){
  useLang();
  var c = useTheme().c;
  var light = c.scheme == "light";
  var compact = !!props.compact;
  var sec = pickSectors(props.mm && props.mm.data && props.mm.data.sectors);
  var go = props.setTab || function(){};
  var box = { boxSizing:"border-box",display:"flex",alignItems:"center",gap:compact ? 8 : 12,width:"100%",minHeight:compact ? 36 : 40,padding:compact ? "4px 10px" : "0 14px",background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:12,boxShadow:light ? "0 3px 10px rgba(37,99,235,0.07)" : "0 3px 10px rgba(0,0,0,0.2)",fontFamily:"inherit",color:c.text1,textAlign:"left",overflow:"hidden" };
  var head = (<span style={{display:"inline-flex",alignItems:"center",gap:6,flexShrink:0}}><Svg n="bars" color={c.blue} s={15}/><span style={{fontSize:12,fontWeight:800,whiteSpace:"nowrap"}}>{compact ? t("home.sector_short", "Sector") : t("home.sector_title", "Sector Momentum")}{compact ? ":" : ""}</span></span>);
  if(!sec){
    return (<div data-testid="home-sector" data-state="unavailable" style={box}>{head}<span style={{fontSize:11,fontWeight:600,color:c.text3}}>{t("home.sector_none", "Sector data unavailable")}</span></div>);
  }
  function part(label, s, up){
    var col = s.chgPct > 0 ? c.up : (s.chgPct < 0 ? c.down : c.text2);
    return (
      <span style={{display:"inline-flex",alignItems:"baseline",gap:5,whiteSpace:"nowrap",minWidth:0,fontVariantNumeric:"tabular-nums"}}>
        <span style={{fontSize:12,fontWeight:700,color:c.text1}}>{label + ": " + s.name}</span>
        <span style={{fontSize:11,fontWeight:800,color:col}}>{sgn(s.chgPct)}{s.chgPct > 0 ? " \u25B2" : (s.chgPct < 0 ? " \u25BC" : "")}</span>
      </span>
    );
  }
  return (
    <button type="button" data-testid="home-sector" data-state="ok" aria-label={t("home.sector_title", "Sector Momentum")} onClick={function(){ go("marketheatmap"); }} style={Object.assign({cursor:"pointer"}, box)}>
      {head}
      <span style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:compact ? "2px 10px" : "0 24px",flex:"1 1 0",minWidth:0}}>
        {part(t("home.tk_top", "Top"), sec.top, true)}
        {sec.weak ? part(t("home.tk_weak", "Weakest"), sec.weak, false) : null}
        {sec.delayed ? <span style={{fontSize:9,fontWeight:700,color:c.text3,whiteSpace:"nowrap"}}>(delayed)</span> : null}
      </span>
      <span aria-hidden="true" style={{flexShrink:0,color:c.blue,fontWeight:800}}>{">"}</span>
    </button>
  );
}
