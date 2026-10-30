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

export function findGlobal(data, name){
  var g = data && data.global;
  if(!g || !Array.isArray(g.items)) return null;
  for(var i = 0; i < g.items.length; i++){ if(g.items[i] && g.items[i].name == name) return g.items[i]; }
  return null;
}

export function commodity(label, full, q){
  if(!q || !isNum(q.chgPct) || q.freshness == "UNAVAILABLE") return { label:label, full:full, ok:false };
  return { label:label, full:full, ok:true, ltp:isNum(q.ltp) ? q.ltp : null, chg:q.chgPct, tag:q.freshness == "LIVE" ? "" : ((q.freshness == "STALE" ? "stale" : "delayed") + (isNum(q.ts) ? " " + istStamp(q.ts) : "")) };
}

// Slim JUST IN ticker, directly under the market ticker. Rotates to the next verified headline every
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
  var paused0 = ps[0], setPaused = ps[1];
  var ms = useState(false);
  var manual = ms[0], setManual = ms[1];
  var paused = paused0 || manual;
  var go = props.setTab || function(){};
  useEffect(function(){
    if(paused || list.length < 2) return undefined;
    var id = setInterval(function(){ setIdx(function(i){ return i + 1; }); }, ROTATE_MS);
    return function(){ clearInterval(id); };
  }, [paused, list.length]);
  if(list.length == 0) return null;
  var cur = list[idx % list.length];
  var label = t("home.tk_justin", "JUST IN");
  var evs = { onMouseEnter:function(){ setPaused(true); }, onMouseLeave:function(){ setPaused(false); }, onFocus:function(){ setPaused(true); }, onBlur:function(){ setPaused(false); }, onTouchStart:function(){ setPaused(true); }, onTouchEnd:function(){ setPaused(false); }, onTouchCancel:function(){ setPaused(false); } };
  var meta = props.compact ? "" : [cur.source, cur.time].filter(function(x){ return x; }).join(" - ");
  return (
    <div data-testid="home-news" data-state="news" data-held={manual ? "paused" : "running"}
      style={{boxSizing:"border-box",display:"flex",alignItems:"center",gap:8,width:"100%",maxWidth:"100%",minWidth:0,height:props.compact ? 34 : 38,padding:props.compact ? "0 6px 0 10px" : "0 8px 0 14px",background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:12,boxShadow:light ? "0 3px 10px rgba(37,99,235,0.07)" : "0 3px 10px rgba(0,0,0,0.2)",color:c.text1,overflow:"hidden"}} {...evs}>
      <span style={{flexShrink:0,display:"inline-flex",alignItems:"center",gap:4,background:"#DC2626",color:"#FFFFFF",borderRadius:999,padding:"2px 8px",fontSize:10,fontWeight:800,whiteSpace:"nowrap"}}><Svg n="bolt" color="#FFFFFF" s={10}/>{label}</span>
      <button type="button" data-testid="home-news-open" aria-label={label + ": " + cur.title} onClick={function(){ go("news"); }} style={{flex:"1 1 0",minWidth:0,display:"flex",alignItems:"center",gap:8,height:"100%",background:"none",border:"none",padding:0,margin:0,cursor:"pointer",fontFamily:"inherit",color:c.text1,textAlign:"left"}}>
        <span style={{flex:"1 1 0",minWidth:0,fontSize:12,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{cur.title}</span>
        {meta ? <span style={{flexShrink:0,fontSize:10,fontWeight:600,color:c.text3,whiteSpace:"nowrap"}}>{meta}</span> : null}
        <span aria-hidden="true" style={{flexShrink:0,color:c.blue,fontWeight:800}}>{">"}</span>
      </button>
      {list.length > 1 ? (
        <button type="button" data-testid="home-news-pause" aria-pressed={manual} aria-label={manual ? "Resume headline rotation" : "Pause headline rotation"} onClick={function(){ setManual(function(m){ return !m; }); }} style={{flexShrink:0,width:28,height:28,borderRadius:999,border:"none",background:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
          {manual ? (<svg width="12" height="12" viewBox="0 0 16 16" fill={c.blue} aria-hidden="true" focusable="false"><path d="M4 2l10 6-10 6z"/></svg>) : (<svg width="12" height="12" viewBox="0 0 16 16" fill={c.blue} aria-hidden="true" focusable="false"><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>)}
        </button>
      ) : null}
    </div>
  );
}
