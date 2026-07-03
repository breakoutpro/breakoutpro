import { useState, useEffect, useRef, useCallback } from "react";
import { buildPhrase, LANGS } from "../screens/VoiceData";

// BreakoutPro - useVoiceAlerts
// Multi-language voice alerts using browser SpeechSynthesis.
// Fixes stale-closure bug by reading live values from refs inside the timer.
// Rules: no backticks, no triple-equals, ASCII only.

export function useVoiceAlerts(){
  var [enabled, setEnabled] = useState(false);
  var [voiceOn, setVoiceOn] = useState(true);
  var [bellOn, setBellOn] = useState(true);
  var [mode, setMode] = useState("voice"); // normal | voice | priority
  var [lang, setLang] = useState("en");
  var [recent, setRecent] = useState([]);
  var [speaking, setSpeaking] = useState(false);
  var [watchOnly, setWatchOnly] = useState(function(){ try{ return localStorage.getItem("bp_watch_only")=="1"; }catch(e){ return false; } });

  // Refs hold live values so the interval callback never goes stale.
  var lastPhraseRef = useRef("");
  var watchOnlyRef = useRef(watchOnly);
  var watchListRef = useRef([]);

  // Refs hold live values so the interval callback never goes stale.
  var enabledRef = useRef(enabled);
  var langRef = useRef(lang);
  var voiceOnRef = useRef(voiceOn);
  var bellOnRef = useRef(bellOn);
  var modeRef = useRef(mode);
  var voicesRef = useRef([]);
  // Anti-spam: remember the last observation key per symbol+timeframe.
  var spokenRef = useRef({});

  useEffect(function(){ enabledRef.current = enabled; }, [enabled]);
  useEffect(function(){ langRef.current = lang; }, [lang]);
  useEffect(function(){ voiceOnRef.current = voiceOn; }, [voiceOn]);
  useEffect(function(){ bellOnRef.current = bellOn; }, [bellOn]);
  useEffect(function(){ modeRef.current = mode; }, [mode]);
  useEffect(function(){ watchOnlyRef.current = watchOnly; try{ localStorage.setItem("bp_watch_only", watchOnly?"1":"0"); }catch(e){} }, [watchOnly]);
  // Allow the app to feed the current watchlist symbols in.
  function setWatchList(arr){ watchListRef.current = arr || []; }

  // Short bell beep using Web Audio.
  function beep(){
    try{
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if(!Ctx) return;
      var ctx = new Ctx();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine"; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.35);
      o.start(); o.stop(ctx.currentTime+0.36);
    }catch(e){}
  }

  // Load voices (some browsers load them async).
  useEffect(function(){
    function load(){
      try{
        if(window.speechSynthesis){
          voicesRef.current = window.speechSynthesis.getVoices() || [];
        }
      }catch(e){}
    }
    load();
    try{
      if(window.speechSynthesis){
        window.speechSynthesis.onvoiceschanged = load;
      }
    }catch(e){}
    return function(){
      try{ if(window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null; }catch(e){}
    };
  }, []);

  function pickVoice(code){
    var vs = voicesRef.current || [];
    var exact = vs.filter(function(v){ return v.lang==code; });
    if(exact.length>0) return exact[0];
    var base = code.split("-")[0];
    var partial = vs.filter(function(v){ return v.lang && v.lang.indexOf(base)==0; });
    if(partial.length>0) return partial[0];
    return null;
  }

  // Speak a phrase in the current language.
  var speak = useCallback(function(text){
    try{
      if(!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      var lcode = "en-IN";
      var i;
      for(i=0;i<LANGS.length;i++){
        if(LANGS[i].id==langRef.current){ lcode = LANGS[i].code; break; }
      }
      u.lang = lcode;
      var v = pickVoice(lcode);
      if(v) u.voice = v;
      u.rate = 1; u.pitch = 1;
      u.onstart = function(){ setSpeaking(true); };
      u.onend = function(){ setSpeaking(false); };
      u.onerror = function(){ setSpeaking(false); };
      window.speechSynthesis.speak(u);
    }catch(e){}
  }, []);

  // Fire one signal: speak + log to recent. Anti-spam + 3 modes.
  // Priority observations trigger sound even in normal contexts.
  var PRIORITY_KINDS = {breakout:1, breakdown:1, trend:1, buildup:1, unwinding:1, covering:1, gamma:1};
  var PRIORITY_INFO = {"Breakout":1,"Breakdown":1,"Trend Change":1,"Support Break":1,"Resistance Break":1,"Three White Soldiers":1,"Three Black Crows":1,"Long Build-up":1,"Short Build-up":1,"Short Covering":1,"Long Unwinding":1,"Gamma Blast":1,"Gamma Flip":1,"Max Pain Shift":1,"Strong Bullish Pattern":1,"Strong Bearish Pattern":1};
  var fire = useCallback(function(sig){
    if(!enabledRef.current) return;
    // Master Smart Alerts switch: if off, no voice/bell at all.
    try{ if(localStorage.getItem("bp_smart_alerts")=="0") return; }catch(e){}
    // Watchlist-only mode: ignore symbols not in the watchlist.
    if(watchOnlyRef.current){
      var wl = watchListRef.current || [];
      if(sig.sym && wl.length && wl.indexOf(sig.sym)<0) return;
    }
    // Anti-spam: skip if the same observation for this sym+tf was already spoken.
    var key = (sig.sym||"") + "|" + (sig.tf||"") + "|" + (sig.info||sig.kind||"");
    if(spokenRef.current[key]) return; // already announced this exact observation
    spokenRef.current[key] = Date.now();

    var m = modeRef.current;
    var isPriority = PRIORITY_KINDS[sig.kind] || PRIORITY_INFO[sig.info];
    var phrase = buildPhrase(langRef.current, sig);
    lastPhraseRef.current = phrase; // store for voice replay

    // Mode behaviour:
    // normal   -> notification only (no voice, no bell) unless priority
    // voice    -> voice + notification
    // priority -> voice + bell + notification, but only for important observations
    if(m=="normal"){
      if(isPriority && bellOnRef.current) beep();
    } else if(m=="voice"){
      if(voiceOnRef.current) speak(phrase);
    } else { // priority mode
      if(isPriority){
        if(bellOnRef.current) beep();
        if(voiceOnRef.current) speak(phrase);
      }
    }

    setRecent(function(prev){
      var item = {sym:sig.sym, kind:sig.kind, info:sig.info, tf:sig.tf, time:sig.time, phrase:phrase, priority:!!isPriority, t:Date.now()};
      return [item].concat(prev).slice(0,8);
    });
  }, [speak]);

  // Replay the latest stored announcement (no regeneration).
  function replay(text){
    var p = text || lastPhraseRef.current;
    if(p) speak(p);
  }

  // Clear anti-spam memory (e.g. when a new session/day starts).
  function resetSpoken(){ spokenRef.current = {}; }

  function stop(){
    try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){}
    setSpeaking(false);
  }

  function toggle(){
    setEnabled(function(p){
      var nv = !p;
      if(!nv) stop();
      return nv;
    });
  }

  return {
    enabled: enabled,
    voiceOn: voiceOn,
    bellOn: bellOn,
    setVoiceOn: setVoiceOn,
    setBellOn: setBellOn,
    mode: mode,
    setMode: setMode,
    lang: lang,
    setLang: setLang,
    recent: recent,
    speaking: speaking,
    watchOnly: watchOnly,
    setWatchOnly: setWatchOnly,
    setWatchList: setWatchList,
    replay: replay,
    toggle: toggle,
    fire: fire,
    speak: speak,
    stop: stop,
    resetSpoken: resetSpoken,
  };
}

export default useVoiceAlerts;
    
