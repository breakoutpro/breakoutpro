import { useState, useEffect, useRef, useCallback } from "react";
import { isClockOpen } from "../screens/DirectionEngine";

// BreakoutPro - useIntradayRadar.js
// Client side of the Live Intraday Scalping Radar. One request to /api/market?action=radar for the chosen
// universe (real 5-minute candles reduced by src/market/intradayRadar.js on the server). It refreshes every
// 60 s while the NSE session is open and every 5 min otherwise, skips refreshes while paused or while the tab is
// hidden, and keeps the last good data (marked with its own time) when a refresh fails. Page-open only: nothing
// here runs in the background.
// Settings (volume multiple, universe, VWAP proximity, sound) live in localStorage under bp_radar_cfg.
// Rules: no backtick, no triple-equals, ASCII only.

var CFG_KEY = "bp_radar_cfg";
export var DEFAULT_CFG = { mult:3, universe:"nifty50", prox:0.2, sound:false };
export var MULTS = [2, 3, 5];
export var PROXS = [0.1, 0.2, 0.5];
export var UNIVERSES = [{ id:"nifty50", label:"NIFTY 50" }, { id:"banknifty", label:"Bank Nifty" }, { id:"watchlist", label:"My Watchlist" }];

export function sanitizeCfg(c){
  c = c || {};
  return {
    mult:MULTS.indexOf(c.mult) >= 0 ? c.mult : DEFAULT_CFG.mult,
    universe:UNIVERSES.some(function(u){ return u.id == c.universe; }) ? c.universe : DEFAULT_CFG.universe,
    prox:PROXS.indexOf(c.prox) >= 0 ? c.prox : DEFAULT_CFG.prox,
    sound:c.sound == true
  };
}

export function useRadarSettings(){
  var st = useState(function(){
    try{ return sanitizeCfg(JSON.parse(localStorage.getItem(CFG_KEY) || "null")); }catch(e){ return sanitizeCfg(null); }
  });
  var cfg = st[0], setCfg = st[1];
  var update = useCallback(function(patch){
    setCfg(function(prev){
      var next = sanitizeCfg(Object.assign({}, prev, patch));
      try{ localStorage.setItem(CFG_KEY, JSON.stringify(next)); }catch(e){}
      return next;
    });
  }, []);
  return [cfg, update];
}

export function useIntradayRadar(symbols, paused){
  var key = symbols.join(",");
  var st = useState({ status:"loading", data:null, fetchedAt:null, failedAt:null });
  var val = st[0], setVal = st[1];
  var ts = useState(0);
  var tick = ts[0], setTick = ts[1];
  var alive = useRef(true);
  useEffect(function(){ alive.current = true; return function(){ alive.current = false; }; }, []);
  useEffect(function(){
    if(paused) return undefined;
    var stopped = false, timer = null;
    function run(){
      var hidden = false;
      try{ hidden = typeof document != "undefined" && document.hidden; }catch(e){}
      var next = function(){ if(!stopped) timer = setTimeout(run, isClockOpen(Date.now()) ? 60000 : 300000); };
      if(hidden){ next(); return; }
      fetch("/api/market?action=radar&symbols=" + encodeURIComponent(key)).then(function(r){ return r.json(); }).then(function(j){
        if(stopped || !alive.current) return;
        if(j && j.ok && j.data && Array.isArray(j.data.results)) setVal({ status:"ok", data:j.data, fetchedAt:Date.now(), failedAt:null });
        else setVal(function(p){ return { status:p.data ? "ok" : "error", data:p.data, fetchedAt:p.fetchedAt, failedAt:Date.now() }; });
        next();
      }).catch(function(){
        if(stopped || !alive.current) return;
        setVal(function(p){ return { status:p.data ? "ok" : "error", data:p.data, fetchedAt:p.fetchedAt, failedAt:Date.now() }; });
        next();
      });
    }
    run();
    return function(){ stopped = true; if(timer) clearTimeout(timer); };
  }, [key, paused, tick]);
  return { state:val, refresh:function(){ setTick(function(n){ return n + 1; }); } };
}

// ---- Sound (explicit user opt-in; off by default; the toggle is the mute control) ----
var audioCtx = null;
export function enableSound(){
  try{
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return false;
    if(!audioCtx) audioCtx = new AC();
    if(audioCtx.state == "suspended" && audioCtx.resume) audioCtx.resume();
    return true;
  }catch(e){ return false; }
}
export function beep(){
  try{
    if(!audioCtx) return false;
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "sine"; o.frequency.value = 880;
    g.gain.value = 0.08;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + 0.18);
    return true;
  }catch(e){ return false; }
}
