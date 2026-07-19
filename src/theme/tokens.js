// BreakoutPro Design System - tokens.js
// Single source of truth for colors, spacing, typography, radii, shadows, breakpoints.
// Supports Dark, Light, AMOLED and System themes. Rules: no backtick, no triple-equals, ASCII.

// ---- DARK THEME (default, current app palette) ----
var DARK = {
  // backgrounds
  bg:"#050505", bgAlt:"#0A0D12",
  card:"#101318", card2:"#0B0E13",
  // borders
  border:"#20242D", border2:"#141821",
  // text
  text1:"#FFFFFF", text2:"#A0A7B4", text3:"#5B6472",
  // semantic (market data only)
  up:"#006400", down:"#DC2626",
  // accents
  blue:"#3B82F6", blueSoft:"rgba(59,130,246,0.12)",
  gold:"#D4AF37", warn:"#F97316",
  // brand
  brand:"#00C853", brandDark:"#00A040",
  // overlay
  overlay:"rgba(0,0,0,0.7)"
};

// ---- AMOLED THEME (pure black background, same accents as dark) ----
var AMOLED = {
  bg:"#000000", bgAlt:"#000000",
  card:"#0A0A0A", card2:"#050505",
  border:"#1A1A1A", border2:"#101010",
  text1:"#FFFFFF", text2:"#A0A7B4", text3:"#5B6472",
  up:"#006400", down:"#DC2626",
  blue:"#3B82F6", blueSoft:"rgba(59,130,246,0.12)",
  gold:"#D4AF37", warn:"#F97316",
  brand:"#00C853", brandDark:"#00A040",
  overlay:"rgba(0,0,0,0.8)"
};

// ---- LIGHT THEME (mapped, same semantic roles) ----
var LIGHT = {
  bg:"#FFFFFF", bgAlt:"#F8FAFC",
  card:"#FFFFFF", card2:"#F8FAFC",
  border:"#E5E7EB", border2:"#F1F5F9",
  text1:"#111111", text2:"#666666", text3:"#9AA4B2",
  up:"#008F39", down:"#DC2626",
  blue:"#2563EB", blueSoft:"rgba(37,99,235,0.1)",
  gold:"#B7902B", warn:"#EA580C",
  brand:"#00A040", brandDark:"#00803A",
  overlay:"rgba(15,23,42,0.4)"
};

export var THEMES = { dark:DARK, light:LIGHT, amoled:AMOLED };

// ---- SPACING (4px base scale) ----
export var space = { xs:4, sm:8, md:12, lg:16, xl:20, x2:24, x3:32, x4:40, x5:56 };

// ---- BORDER RADIUS ----
export var radius = { sm:8, md:11, lg:14, xl:18, pill:999 };

// ---- TYPOGRAPHY (size scale + weights) ----
export var font = {
  family:"Inter,Arial,sans-serif",
  mono:"monospace",
  size:{ xs:8, sm:9, base:11, md:12.5, lg:14, xl:16, x2:19, x3:24, x4:30 },
  weight:{ regular:400, medium:600, semibold:700, bold:800, black:900 }
};

// ---- SHADOWS ----
export var shadow = {
  sm:"0 2px 8px rgba(0,0,0,0.2)",
  md:"0 4px 16px rgba(0,0,0,0.3)",
  lg:"0 8px 40px rgba(0,0,0,0.5)",
  glow:function(c){ return "0 0 8px "+c; }
};

// ---- RESPONSIVE BREAKPOINTS ----
export var bp = { mobile:768, tablet:1024, laptop:1440, desktop:1920 };
export function deviceFor(w){
  if(w<768) return "mobile";
  if(w<1024) return "tablet";
  if(w<1440) return "laptop";
  if(w<1920) return "desktop";
  return "ultra";
}

// ---- THEME PERSISTENCE + SYSTEM DETECTION ----
// Reuses the existing "bp_theme" key already present in this file - no
// new/duplicate localStorage key introduced.
export function loadThemeMode(){
  try{ return localStorage.getItem("bp_theme")||"light"; }catch(e){ return "light"; }
}
export function saveThemeMode(m){ try{ localStorage.setItem("bp_theme",m); }catch(e){} }
export function systemPrefersDark(){
  try{ return window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches; }catch(e){ return false; }
}
// Resolve a mode (dark/light/amoled/system) to an actual palette.
export function resolveTheme(mode){
  var m=mode||loadThemeMode();
  if(m=="system") m=systemPrefersDark()?"dark":"light";
  return THEMES[m] || LIGHT;
}

