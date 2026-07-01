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
  var PRIORITY_KINDS = {breakout:1, breakdown:1, trend:1};
  var PRIORITY_INFO = {"Breakout":1,"Breakdown":1,"Trend Change":1,"Support Break":1,"Resistance Break":1,"Three White Soldiers":1,"Three Black Crows":1};
  var fire = useCallback(function(sig){
    if(!enabledRef.current) return;
    // Anti-spam: skip if the same observation for this sym+tf was already spoken.
    var key = (sig.sym||"") + "|" + (sig.tf||"") + "|" + (sig.info||sig.kind||"");
    if(spokenRef.current[key]) return; // already announced this exact observation
    spokenRef.current[key] = Date.now();

    var m = modeRef.current;
    var isPriority = PRIORITY_KINDS[sig.kind] || PRIORITY_INFO[sig.info];
    var phrase = buildPhrase(langRef.current, sig);

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
      var item = {sym:sig.sym, kind:sig.kind, info:sig.info, tf:sig.tf, time:sig.time, t:Date.now()};
      return [item].concat(prev).slice(0,8);
    });
  }, [speak]);

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
    toggle: toggle,
    fire: fire,
    speak: speak,
    stop: stop,
    resetSpoken: resetSpoken,
  };
}

export default useVoiceAlerts;
