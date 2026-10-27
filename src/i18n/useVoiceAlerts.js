import { useState, useEffect } from "react";
import { voicePhrase, voiceTestPhrase, speechCodeFor, pickVoice } from "../screens/VoiceData";
import { getLang } from "../i18n/translations";

// BreakoutPro - useVoiceAlerts
// ONE shared store (Settings card and Smart Alerts screen see the same switches).
// Voice reads REAL alert events (from the user's own rules) in the app language using the
// browser SpeechSynthesis. It speaks only while the app is open; background alerts arrive as
// text push notifications. If no voice exists for the language the text alert still shows.
// No timers, no demo feed. Rules: no backticks, no triple-equals, ASCII only.

var KEY = "bp_voice_alerts";
function readFlag(k, def){
  try{ var v = localStorage.getItem(k); return v == null ? def : v == "1"; }catch(e){ return def; }
}
var store = { enabled: readFlag(KEY, false), voiceOn: readFlag(KEY + "_voice", true), bellOn: readFlag(KEY + "_bell", true), speaking:false, hasVoice:null };
var listeners = [];
var voices = [];
var spoken = {};

function emit(){ for(var i = 0; i < listeners.length; i++){ try{ listeners[i](); }catch(e){} } }
function persist(){
  try{
    localStorage.setItem(KEY, store.enabled ? "1" : "0");
    localStorage.setItem(KEY + "_voice", store.voiceOn ? "1" : "0");
    localStorage.setItem(KEY + "_bell", store.bellOn ? "1" : "0");
  }catch(e){}
}
export function voiceSupported(){
  try{ return typeof window != "undefined" && !!window.speechSynthesis && typeof SpeechSynthesisUtterance != "undefined"; }catch(e){ return false; }
}
function loadVoices(){
  try{
    if(!voiceSupported()) return;
    voices = window.speechSynthesis.getVoices() || [];
    var has = !!pickVoice(voices, speechCodeFor(getLang()));
    if(store.hasVoice != has){ store.hasVoice = has; emit(); }
  }catch(e){}
}
try{
  if(voiceSupported()){ loadVoices(); window.speechSynthesis.onvoiceschanged = loadVoices; }
}catch(e){}

export function beep(){
  try{
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return;
    var ctx = new Ctx(), o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    o.start(); o.stop(ctx.currentTime + 0.36);
  }catch(e){}
}

export function speakText(text){
  if(!voiceSupported() || !store.voiceOn) return false;
  loadVoices();
  var code = speechCodeFor(getLang());
  var v = pickVoice(voices, code);
  if(!v) return false;                       // graceful: no voice for this language
  try{
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = code; u.voice = v; u.rate = 1; u.pitch = 1;
    u.onstart = function(){ store.speaking = true; emit(); };
    u.onend = function(){ store.speaking = false; emit(); };
    u.onerror = function(){ store.speaking = false; emit(); };
    window.speechSynthesis.speak(u);
    return true;
  }catch(e){ return false; }
}

// Announce one real engine event (id-based de-duplication; respects the master switch).
export function announceEvent(ev){
  if(!store.enabled || !ev) return false;
  try{ if(localStorage.getItem("bp_smart_alerts") == "0") return false; }catch(e){}
  var id = ev.id || ev.key || "";
  if(id && spoken[id]) return false;
  if(id) spoken[id] = Date.now();
  if(store.bellOn) beep();
  return speakText(voicePhrase(getLang(), ev));
}

export function setVoiceEnabled(on){ store.enabled = !!on; if(!on){ try{ if(voiceSupported()) window.speechSynthesis.cancel(); }catch(e){} store.speaking = false; } persist(); emit(); }
export function setVoiceOn(on){ store.voiceOn = !!on; persist(); emit(); }
export function setBellOn(on){ store.bellOn = !!on; persist(); emit(); }
export function testVoice(){ if(store.bellOn) beep(); return speakText(voiceTestPhrase(getLang())); }
export function stopSpeaking(){ try{ if(voiceSupported()) window.speechSynthesis.cancel(); }catch(e){} store.speaking = false; emit(); }

export function useVoiceAlerts(){
  var s = useState(0);
  var bump = s[1];
  useEffect(function(){
    var fn = function(){ bump(function(n){ return n + 1; }); };
    listeners.push(fn);
    loadVoices();
    return function(){ listeners = listeners.filter(function(x){ return x != fn; }); };
  }, []);
  return {
    enabled: store.enabled, voiceOn: store.voiceOn, bellOn: store.bellOn, speaking: store.speaking,
    supported: voiceSupported(), hasVoice: store.hasVoice,
    toggle: function(){ setVoiceEnabled(!store.enabled); },
    setVoiceOn: setVoiceOn, setBellOn: setBellOn, test: testVoice, stop: stopSpeaking
  };
}

export default useVoiceAlerts;
