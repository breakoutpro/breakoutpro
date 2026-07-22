import { useState, useEffect } from "react";
import { buildTokens, loadThemePref, saveThemePref, THEMES, ACCENTS } from "../state/themeRegistry";

// BreakoutPro - useTheme.js
// Theme tokens + setters. Persists choice. Frozen Phase 0.
// Rules: no backtick, no triple-equals, ASCII only.

var listeners = [];
var pref = loadThemePref();
var current = { theme:pref.theme, accent:pref.accent, tokens:buildTokens(pref.theme, pref.accent) };

function apply(themeId, accentId){
  current = { theme:themeId, accent:accentId, tokens:buildTokens(themeId, accentId) };
  saveThemePref(themeId, accentId);
  for(var i=0;i<listeners.length;i++){ try{ listeners[i](current); }catch(e){} }
}

export function useTheme(){
  var [state, setState] = useState(current);
  useEffect(function(){
    function onChange(c){ setState(c); }
    listeners.push(onChange);
    return function(){ var i=listeners.indexOf(onChange); if(i>=0) listeners.splice(i,1); };
  }, []);
  return {
    tokens: state.tokens,
    theme: state.theme,
    accent: state.accent,
    themes: THEMES,
    accents: ACCENTS,
    setTheme: function(id){ apply(id, current.accent); },
    setAccent: function(id){ apply(current.theme, id); }
  };
}
