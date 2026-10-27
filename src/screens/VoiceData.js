// BreakoutPro - VoiceData.jsx
// Voice languages for Smart Alerts. The list matches the app's own five languages.
// Phrases are built from real alert events by src/alerts/alertMessage.js; there is no
// demo signal feed here. Voice speaks only while the app is open (browser limitation).
// Rules: no backticks, no triple-equals, ASCII only (Unicode escapes for native scripts).

import { buildMessage } from "../alerts/alertMessage.js";
import { alertText, normLang } from "../alerts/alertLang.js";

export var LANGS = [
  {id:"en", label:"English",  code:"en-IN", native:"English"},
  {id:"te", label:"Telugu",   code:"te-IN", native:"\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41"},
  {id:"hi", label:"Hindi",    code:"hi-IN", native:"\u0939\u093f\u0928\u094d\u0926\u0940"},
  {id:"kn", label:"Kannada",  code:"kn-IN", native:"\u0c95\u0ca8\u0ccd\u0ca8\u0ca1"},
  {id:"ta", label:"Tamil",    code:"ta-IN", native:"\u0ba4\u0bae\u0bbf\u0bb4\u0bcd"}
];

export function speechCodeFor(lang){
  var l = normLang(lang);
  for(var i = 0; i < LANGS.length; i++){ if(LANGS[i].id == l) return LANGS[i].code; }
  return "en-IN";
}

// Spoken phrase for one engine event, in the given language.
export function voicePhrase(lang, ev){
  return buildMessage(ev, lang).voice;
}
export function voiceTestPhrase(lang){ return alertText(lang, "vo.test"); }

// Pick the best installed voice for a language code, or null (graceful text-only fallback).
export function pickVoice(voices, code){
  var vs = voices || [];
  var i;
  for(i = 0; i < vs.length; i++){ if(vs[i].lang == code) return vs[i]; }
  var base = String(code).split("-")[0];
  for(i = 0; i < vs.length; i++){
    var l = vs[i].lang ? String(vs[i].lang).replace("_", "-") : "";
    if(l.indexOf(base) == 0) return vs[i];
  }
  return null;
}
