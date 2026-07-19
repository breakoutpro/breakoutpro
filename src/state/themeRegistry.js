// BreakoutPro - src/state/themeRegistry.js
// Central theme tokens. dark (default) / amoled / light + accent colors.
// Every card reads tokens from here - no hardcoded hex per component.
// up/green + down/red stay semantic across all themes. Frozen Phase 0.
// Rules: no backtick, no triple-equals, ASCII only.

export var THEMES = {
  dark: {
    id:"dark", label:"Dark",
    bg:"#000000", bgAlt:"#0A0D12", card:"#101318", card2:"#0B0E13",
    border:"#1B2330", border2:"#141821",
    text1:"#FFFFFF", text2:"#A0A7B4", text3:"#5B6472",
    up:"#22C55E", down:"#EF4444", gold:"#D4AF37", warn:"#F97316"
  },
  amoled: {
    id:"amoled", label:"AMOLED Black",
    bg:"#000000", bgAlt:"#000000", card:"#050505", card2:"#000000",
    border:"#111111", border2:"#0A0A0A",
    text1:"#FFFFFF", text2:"#9AA0AA", text3:"#4A4F58",
    up:"#22C55E", down:"#EF4444", gold:"#D4AF37", warn:"#F97316"
  },
  light: {
    id:"light", label:"Light",
    bg:"#F8F9FA", bgAlt:"#FFFFFF", card:"#FFFFFF", card2:"#F1F3F5",
    border:"#E5E7EB", border2:"#EDEFF2",
    text1:"#0B1220", text2:"#475569", text3:"#94A3B8",
    up:"#16A34A", down:"#DC2626", gold:"#B7791F", warn:"#EA580C"
  }
};

export var ACCENTS = {
  blue:   "#3B82F6",
  cyan:   "#60A5FA",
  green:  "#22C55E",
  gold:   "#D4AF37",
  purple: "#8B5CF6"
};

export function getTheme(id){ return THEMES[id] || THEMES.dark; }
export function getAccent(id){ return ACCENTS[id] || ACCENTS.blue; }

// Build a full token set (theme + chosen accent applied as "accent").
export function buildTokens(themeId, accentId){
  var t = getTheme(themeId);
  var out = {};
  for(var k in t){ if(t.hasOwnProperty(k)) out[k] = t[k]; }
  out.accent = getAccent(accentId);
  return out;
}

export function loadThemePref(){
  try{ return { theme: localStorage.getItem("bp_theme") || "dark", accent: localStorage.getItem("bp_accent") || "blue" }; }
  catch(e){ return { theme:"dark", accent:"blue" }; }
}
export function saveThemePref(themeId, accentId){
  try{ localStorage.setItem("bp_theme", themeId); localStorage.setItem("bp_accent", accentId); }catch(e){}
}
