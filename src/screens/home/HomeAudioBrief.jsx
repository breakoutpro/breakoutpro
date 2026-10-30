import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useLang } from "../../i18n/translations";
import { buildTickerItems } from "../../state/marketTickerModel";
import { commodity, findGlobal } from "./HomeStrips";
import { buildBrief } from "../../state/audioBriefModel";

// BreakoutPro - HomeAudioBrief.jsx
// 1-Min Market Audio Brief. The audio is the browser's own text-to-speech (speechSynthesis), reading text built
// from the verified quotes and live headlines already on Home (see audioBriefModel). It is shown ONLY when the
// browser supports speech and there is something verified to say; otherwise nothing is rendered, never a fake
// player. Play / pause / resume / stop are real calls to speechSynthesis. No audio file, no new service.
// Rules: no backtick, no triple-equals, ASCII only.

function supported(){
  try{ return typeof window != "undefined" && !!window.speechSynthesis && typeof window.SpeechSynthesisUtterance == "function"; }catch(e){ return false; }
}

export default function HomeAudioBrief(props){
  useLang();
  var c = useTheme().c;
  var light = c.scheme == "light";
  var st = useState("idle"); // idle | playing | paused
  var state = st[0], setState = st[1];
  var uref = useRef(null);
  var mm = props.mm || {};
  var data = mm.data;
  var items = buildTickerItems(data, { now:Date.now(), networkStatus:mm.networkStatus, loadFailed:(mm.status == "error" || mm.status == "offline") });
  var indices = items.filter(function(i){ return ["NIFTY", "BANKNIFTY", "SENSEX", "VIX"].indexOf(i.key) >= 0 && typeof i.value == "number" && i.state != "unavailable" && i.state != "loading"; }).map(function(i){ return { label:i.label, value:i.value, chgPct:i.chgPct, live:i.state == "live" }; });
  var com = [commodity("Crude WTI", "", findGlobal(data, "Crude Oil (WTI)")), commodity("Natural gas", "", data && data.macro ? data.macro.natGas : null)].filter(function(x){ return x.ok; }).map(function(x){ return { label:x.label, chgPct:x.chg, tag:x.tag ? "delayed" : "" }; });
  var news = props.liveNews;
  var heads = (news && news.status == "ok" && Array.isArray(news.news)) ? news.news.slice(0, 3).map(function(n){ return n.title; }) : [];
  var brief = buildBrief({ indices:indices, commodities:com, headlines:heads });
  useEffect(function(){
    return function(){ try{ if(uref.current && window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){} };
  }, []);
  if(!supported() || !brief) return null;
  function play(){
    try{
      var ss = window.speechSynthesis;
      if(state == "paused"){ ss.resume(); setState("playing"); return; }
      ss.cancel();
      var u = new window.SpeechSynthesisUtterance(brief.text);
      u.lang = "en-IN";
      u.onend = function(){ setState("idle"); };
      u.onerror = function(){ setState("idle"); };
      uref.current = u;
      ss.speak(u);
      setState("playing");
    }catch(e){ setState("idle"); }
  }
  function pause(){ try{ window.speechSynthesis.pause(); setState("paused"); }catch(e){} }
  function stop(){ try{ window.speechSynthesis.cancel(); }catch(e){} setState("idle"); }
  var playing = state == "playing";
  return (
    <section data-testid="home-audio" data-state={state} aria-label="1-Min Market Audio Brief" style={{boxSizing:"border-box",display:"flex",alignItems:"center",gap:12,minWidth:0,padding:"10px 12px",background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:14,boxShadow:light ? "0 4px 14px rgba(37,99,235,0.08), 0 1px 2px rgba(15,23,42,0.05)" : "0 3px 10px rgba(0,0,0,0.22)",color:c.text1}}>
      <div style={{flex:"1 1 0",minWidth:0}}>
        <div style={{fontSize:14,fontWeight:800}}>1-Min Market Audio Brief</div>
        <div style={{fontSize:11,color:c.text3,marginTop:2,lineHeight:1.3}}>{"Read aloud by your device from the verified quotes and headlines on this page (about " + brief.seconds + " s)."}</div>
      </div>
      {state != "idle" ? <button type="button" data-testid="home-audio-stop" aria-label="Stop audio brief" onClick={stop} style={{width:34,height:34,borderRadius:999,border:"1px solid " + c.border,background:"none",color:c.text2,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:800,flexShrink:0}}>Stop</button> : null}
      <button type="button" data-testid="home-audio-toggle" aria-label={playing ? "Pause audio brief" : (state == "paused" ? "Resume audio brief" : "Play audio brief")} onClick={playing ? pause : play}
        style={{width:44,height:44,borderRadius:999,border:"none",background:c.blue,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        {playing ? (<svg width="16" height="16" viewBox="0 0 16 16" fill="#FFFFFF" aria-hidden="true" focusable="false"><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>)
          : (<svg width="16" height="16" viewBox="0 0 16 16" fill="#FFFFFF" aria-hidden="true" focusable="false"><path d="M4 2l10 6-10 6z"/></svg>)}
      </button>
    </section>
  );
}
