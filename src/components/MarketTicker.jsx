import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { t, useLang } from "../i18n/translations";
import { buildTickerItems, visibleTickerItems, loopCopies } from "../state/marketTickerModel";

// BreakoutPro - MarketTicker.jsx
// Slim continuously scrolling market strip for the Home page. Each item shows only the
// instrument name, the value and the signed percent change. No status words, timestamps
// or market-timing text here: freshness lives in the detailed market screens.
// Motion: a requestAnimationFrame loop advances scrollLeft of a native overflow-x container,
// so touch drag, trackpad and keyboard scrolling keep working. Two identical halves join
// seamlessly (see loopCopies / wrap below). Pauses on hover, focus, touch and hidden tab.
// Reduced motion: no animation, one group, still scrollable. Items with no valid value are
// omitted, nothing is invented. Green is positive, red is negative, everything else neutral.
// Rules: no backtick, no triple-equals, ASCII only.

var H = 36;            // strip height in px (32-38 target)
var SPEED = 45;        // px per second, right to left
var RESUME_MS = 2500;  // resume after touch or wheel idle

function buildCss(c){
  return ".bpTk{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;touch-action:pan-x pan-y}" +
    ".bpTk::-webkit-scrollbar{display:none;height:0}" +
    ".bpTkItem{font-family:inherit;text-align:left;background:transparent;border:none;margin:0;color:inherit}" +
    ".bpTkItem:focus-visible,.bpTk:focus-visible{outline:2px solid " + c.blue + ";outline-offset:-2px}";
}

function useReducedMotion(){
  var [r, setR] = useState(function(){
    try{ return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }catch(e){ return false; }
  });
  useEffect(function(){
    var mq = null;
    try{ mq = window.matchMedia("(prefers-reduced-motion: reduce)"); }catch(e){ return undefined; }
    if(!mq) return undefined;
    function on(){ setR(!!mq.matches); }
    if(mq.addEventListener) mq.addEventListener("change", on); else if(mq.addListener) mq.addListener(on);
    return function(){ if(mq.removeEventListener) mq.removeEventListener("change", on); else if(mq.removeListener) mq.removeListener(on); };
  }, []);
  return r;
}

export default function MarketTicker(props){
  var theme = useTheme();
  useLang();
  var c = theme.c;
  var reduced = useReducedMotion();
  var [now, setNow] = useState(Date.now());
  var [copies, setCopies] = useState(1);
  var scrollerRef = useRef(null);
  var halfRef = useRef(null);
  var st = useRef({ hover:false, focus:false, touching:false, resumeAt:0, pos:0, lastSet:0, started:false });

  useEffect(function(){
    var id = setInterval(function(){ setNow(Date.now()); }, 15000);
    return function(){ clearInterval(id); };
  }, []);

  var all = buildTickerItems(props.data, { now:now, networkStatus:props.networkStatus, loadFailed:(props.status == "error" || props.status == "offline") });
  var items = visibleTickerItems(all);
  var onNavigate = props.onNavigate || function(){};
  var loading = items.length == 0 && !props.data && props.status != "error" && props.status != "offline";
  var sig = items.map(function(i){ return i.key + i.value + (i.pct || ""); }).join("|");
  var n = reduced ? 1 : copies;

  // Measure one group, give every group an integer pixel width, and size the half.
  useLayoutEffect(function(){
    var sc = scrollerRef.current;
    if(!sc || items.length == 0) return undefined;
    function measure(){
      var groups = sc.querySelectorAll(".bpTkG");
      if(!groups.length) return;
      var i;
      for(i = 0; i < groups.length; i++) groups[i].style.width = "";
      var w = Math.ceil(groups[0].getBoundingClientRect().width);
      if(w <= 0) return;
      for(i = 0; i < groups.length; i++) groups[i].style.width = w + "px";
      var need = reduced ? 1 : loopCopies(sc.clientWidth, w);
      if(need != copies) setCopies(need);
    }
    measure();
    var ro = null;
    if(typeof ResizeObserver != "undefined"){ ro = new ResizeObserver(measure); ro.observe(sc); }
    window.addEventListener("resize", measure);
    return function(){ if(ro) ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [sig, n, reduced, copies, items.length]);

  // Animation loop.
  useEffect(function(){
    var sc = scrollerRef.current;
    if(reduced || !sc || items.length == 0) return undefined;
    var s = st.current, raf = 0, last = 0;
    function frame(ts){
      raf = requestAnimationFrame(frame);
      var dt = last ? Math.min(0.1, (ts - last) / 1000) : 0;
      last = ts;
      var half = halfRef.current ? halfRef.current.getBoundingClientRect().width : 0;
      if(half <= 0) return;
      var cur = sc.scrollLeft;
      if(Math.abs(cur - s.lastSet) > 1.5) s.pos = cur;       // user moved it: follow
      var paused = s.hover || s.focus || s.touching || document.hidden || Date.now() < s.resumeAt;
      var before = s.pos;
      if(!paused && dt > 0){ s.pos += SPEED * dt; if(s.pos > 1) s.started = true; }
      if(s.pos >= half) s.pos -= half;                        // seamless wrap going left
      else if(s.pos <= 0.5 && s.started) s.pos += half;       // seamless wrap going right
      if(s.pos < 0) s.pos = 0;
      if(paused && s.pos == before) { s.lastSet = cur; return; }   // never fight the user's own scroll
      sc.scrollLeft = s.pos;
      s.lastSet = sc.scrollLeft;
      if(Math.abs(s.lastSet - s.pos) > 1.5) s.pos = s.lastSet;
    }
    raf = requestAnimationFrame(frame);
    return function(){ cancelAnimationFrame(raf); };
  }, [reduced, items.length, n]);

  function bump(){ st.current.resumeAt = Date.now() + RESUME_MS; }
  var handlers = {
    onMouseEnter:function(){ st.current.hover = true; },
    onMouseLeave:function(){ st.current.hover = false; },
    onFocus:function(){ st.current.focus = true; },
    onBlur:function(e){ var sc = scrollerRef.current; if(!sc || !e.relatedTarget || !sc.contains(e.relatedTarget)) st.current.focus = false; },
    onTouchStart:function(){ st.current.touching = true; },
    onTouchEnd:function(){ st.current.touching = false; bump(); },
    onTouchCancel:function(){ st.current.touching = false; bump(); },
    onWheel:bump
  };

  if(items.length == 0 && !loading) return null;

  function renderItem(it, copy){
    var col = it.dir == "up" ? c.up : (it.dir == "down" ? c.down : c.text2);
    var name = t("tk.n." + it.key, it.label);
    var aria = name + " " + it.value + (it.pct ? ", " + (it.dir == "up" ? "up " : (it.dir == "down" ? "down " : "")) + it.pct.replace(/^[+-]/, "") : "");
    var body = [
      <span key="n" style={{fontSize:11,fontWeight:700,color:c.text2,letterSpacing:0.3}}>{name}</span>,
      <span key="v" style={{fontSize:12,fontWeight:800,color:c.text1,fontVariantNumeric:"tabular-nums"}}>{it.value}</span>,
      it.pct ? <span key="p" style={{fontSize:12,fontWeight:700,color:col,fontVariantNumeric:"tabular-nums"}}>{it.pct}</span> : null
    ];
    var st1 = {display:"inline-flex",alignItems:"center",gap:7,height:H,padding:"0 12px",boxSizing:"border-box",whiteSpace:"nowrap",flex:"0 0 auto",lineHeight:H + "px"};
    var sep = <span key="s" aria-hidden="true" style={{display:"inline-block",width:1,height:14,background:c.border,flex:"0 0 auto"}}/>;
    var cell;
    if(it.route && copy == 0){
      cell = <button type="button" className="bpTkItem" aria-label={aria} title={aria} onClick={function(){ onNavigate(it.route); }} style={Object.assign({}, st1, {cursor:"pointer"})}>{body}</button>;
    } else if(it.route){
      cell = <button type="button" className="bpTkItem" tabIndex={-1} aria-hidden="true" onClick={function(){ onNavigate(it.route); }} style={Object.assign({}, st1, {cursor:"pointer"})}>{body}</button>;
    } else {
      cell = <span className="bpTkItem" style={st1}>{body}</span>;
    }
    return <span key={it.key} style={{display:"inline-flex",alignItems:"center",flex:"0 0 auto"}}>{cell}{sep}</span>;
  }

  function group(copy, hidden){
    return (
      <div key={"g" + copy} className="bpTkG" aria-hidden={hidden ? "true" : undefined}
           style={{display:"inline-flex",alignItems:"center",flex:"0 0 auto",height:H}}>
        {items.map(function(it){ return renderItem(it, hidden ? 1 : 0); })}
      </div>
    );
  }

  var firstHalf = [];
  var k;
  for(k = 0; k < n; k++) firstHalf.push(group(k, k > 0));
  var secondHalf = [];
  if(!reduced){ for(k = 0; k < n; k++) secondHalf.push(group(n + k, true)); }

  return (
    <div role="region" aria-label={t("tk.region", "Market ticker")}
         style={{flexShrink:0,background:c.card2,borderBottom:"1px solid " + c.border,width:"100%",maxWidth:"100%",boxSizing:"border-box",height:H + 1,overflow:"hidden"}}>
      <style>{buildCss(c)}</style>
      <div ref={scrollerRef} className="bpTk" tabIndex={items.length ? 0 : -1} aria-label={t("tk.scroll", "Market ticker, scrollable")}
           {...handlers}
           style={{display:"block",overflowX:"auto",overflowY:"hidden",whiteSpace:"nowrap",height:H,width:"100%",boxSizing:"border-box"}}>
        <div style={{display:"flex",width:"max-content",height:H,alignItems:"center"}}>
          <div ref={halfRef} style={{display:"flex",flex:"0 0 auto",height:H}}>{firstHalf}</div>
          {reduced ? null : <div aria-hidden="true" style={{display:"flex",flex:"0 0 auto",height:H}}>{secondHalf}</div>}
        </div>
      </div>
    </div>
  );
}
