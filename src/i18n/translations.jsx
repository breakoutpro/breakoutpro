// BreakoutPro - i18n/translations.jsx
// The ONE localization module for the app (selector, store, t(), glossary).
// Language packs live next to it in ./lang (en, te, hi, kn, ta) as plain
// key -> string maps; this file holds no screen text itself.
//
// TECHNICAL LANGUAGE RULE: standard market terms (NIFTY 50, BANK NIFTY,
// SENSEX, EMA, OI, CE, PE, Gamma, PCR, VWAP, RSI ...) always stay English.
// Only the surrounding words, explanations and UI text translate, and the
// glossary (term / termHelp) explains each term in the selected language.
//
// Behaviour:
//  - The chosen language is saved in localStorage (bp_lang) and restored on
//    every load. Changing it notifies every subscriber at once, so screens
//    update with no page reload (App re-renders through useLang()).
//  - t(key) falls back: selected language -> English -> optional fallback
//    argument -> empty string. A raw key is NEVER returned or shown.
//  - Numbers, prices, symbols, timestamps and calculations are not touched
//    here; they keep their own en-IN formatting in every language.
// Rules: no backtick, no triple-equals, ASCII only.

import { useSyncExternalStore } from "react";
import EN from "./lang/en";
import TE from "./lang/te";
import HI from "./lang/hi";
import KN from "./lang/kn";
import TA from "./lang/ta";

// Only languages that actually have a translation pack are offered.
// (ml, gu, mr, bn, pa, or, as were listed before with ZERO strings behind
// them; they are intentionally not offered until real packs exist.)
// Private beta: every language is open to every invited user. To put the
// Indian languages behind Premium again, set this to true (the selector
// already handles the lock + upgrade path).
export var LANGUAGE_PREMIUM_GATE = false;
var GATED = LANGUAGE_PREMIUM_GATE;
export var LANGUAGES = [
  {code:"en", native:"English",   name:"English", free:true},
  {code:"te", native:"\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41", name:"Telugu",  free:!GATED},
  {code:"hi", native:"\u0939\u093f\u0928\u094d\u0926\u0940", name:"Hindi",   free:!GATED},
  {code:"kn", native:"\u0c95\u0ca8\u0ccd\u0ca8\u0ca1", name:"Kannada", free:!GATED},
  {code:"ta", native:"\u0ba4\u0bae\u0bbf\u0bb4\u0bcd", name:"Tamil",   free:!GATED}
];

var PACKS = { en:EN.strings, te:TE.strings, hi:HI.strings, kn:KN.strings, ta:TA.strings };
var GLOSS = { en:EN.terms,   te:TE.terms,   hi:HI.terms,   kn:KN.terms,   ta:TA.terms };
var STORE_KEY = "bp_lang";

function isSupported(code){
  for(var i=0;i<LANGUAGES.length;i++){ if(LANGUAGES[i].code==code) return true; }
  return false;
}

function readSaved(){
  try{
    var c = localStorage.getItem(STORE_KEY);
    if(c && isSupported(c)) return c;
  }catch(e){}
  return "en";
}

var current = readSaved();
var listeners = [];
var missLog = {};

function applyDocLang(){
  try{ if(typeof document!="undefined") document.documentElement.setAttribute("lang", current); }catch(e){}
}
applyDocLang();

export function getLang(){ return current; }

export function setLang(code){
  if(!isSupported(code)) code = "en";
  try{ localStorage.setItem(STORE_KEY, code); }catch(e){}
  if(code==current) return;
  current = code;
  applyDocLang();
  for(var i=0;i<listeners.length;i++){ try{ listeners[i](); }catch(e){} }
}

export function subscribeLang(fn){
  listeners.push(fn);
  return function(){ listeners = listeners.filter(function(x){ return x!=fn; }); };
}

// Components call this so they re-render the moment the language changes.
export function useLang(){
  return useSyncExternalStore(subscribeLang, getLang, getLang);
}

// Keep tabs/windows in sync: another tab changing bp_lang updates this one.
try{
  if(typeof window!="undefined"){
    window.addEventListener("storage", function(ev){
      if(ev.key==STORE_KEY && ev.newValue && isSupported(ev.newValue) && ev.newValue!=current){
        current = ev.newValue;
        applyDocLang();
        for(var i=0;i<listeners.length;i++){ try{ listeners[i](); }catch(e){} }
      }
    });
  }
}catch(e){}

function fill(str, vars){
  if(!vars || typeof vars!="object") return str;
  return str.replace(/\{(\w+)\}/g, function(m, k){
    return vars[k]!=undefined ? String(vars[k]) : m;
  });
}

// Translate a key. Optional second argument:
//   string  -> English fallback text used only if no pack has the key
//   object  -> values for {placeholders} in the string
// Never returns the raw key.
export function t(key, extra){
  var vars = (extra && typeof extra=="object") ? extra : null;
  var fb = (typeof extra=="string") ? extra : "";
  var pack = PACKS[current];
  if(pack && pack[key]!=undefined && pack[key]!="") return fill(pack[key], vars);
  if(current!="en"){ missLog[current+":"+key] = 1; }
  if(PACKS.en[key]!=undefined) return fill(PACKS.en[key], vars);
  missLog["en:"+key] = 1;
  return fb ? fill(fb, vars) : "";
}

// Glossary: standard market terms stay English, meaning is localized.
export function term(code){
  var g = GLOSS[current] || {};
  var en = GLOSS.en || {};
  var row = g[code] || en[code];
  return row ? { name:code, meaning:row } : { name:code, meaning:"" };
}
// Tooltip text, e.g. "EMA - <meaning in selected language>".
export function termHelp(code){
  var r = term(code);
  return r.meaning ? (code + " - " + r.meaning) : code;
}

// Diagnostics: translated-key counts per language versus the English pack,
// and the keys that were requested at runtime but missing.
export function getCoverage(){
  var enKeys = Object.keys(PACKS.en);
  var enTerms = Object.keys(GLOSS.en);
  var out = {};
  LANGUAGES.forEach(function(l){
    var p = PACKS[l.code], g = GLOSS[l.code];
    var missing = enKeys.filter(function(k){ return p[k]==undefined || p[k]==""; });
    var missingTerms = enTerms.filter(function(k){ return g[k]==undefined || g[k]==""; });
    out[l.code] = {
      total: enKeys.length,
      translated: enKeys.length - missing.length,
      missing: missing,
      termsTotal: enTerms.length,
      termsTranslated: enTerms.length - missingTerms.length,
      missingTerms: missingTerms
    };
  });
  return out;
}
export function getRuntimeMisses(){ return Object.keys(missLog); }

// Shared access check for premium gating. Admin and premium unlock everything.
export function hasAccess(){
  try{
    var sess=JSON.parse(localStorage.getItem("bp_sess")||"{}");
    if(sess && (sess.isAdmin || sess.isPrem)) return true;
    if(sess && sess.trialStart){
      var sevenDays=7*24*60*60*1000;
      if(Date.now() < (sess.trialStart + sevenDays)) return true;
    }
    if(localStorage.getItem("bp_premium")=="1") return true;
    return false;
  }catch(e){ return false; }
}

export function isAdmin(){
  try{
    var sess=JSON.parse(localStorage.getItem("bp_sess")||"{}");
    return !!(sess && sess.isAdmin);
  }catch(e){ return false; }
}
