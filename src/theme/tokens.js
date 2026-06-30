// BreakoutPro Design System - tokens.js
// Single source of truth for colors, spacing, typography, radii, shadows, breakpoints.
// Supports Dark, Light and System themes. Rules: no backtick, no triple-equals, ASCII.

// ---- DARK THEME (default, current app palette) ----
var DARK = {
  // backgrounds
  bg:"#050505", bgAlt:"#0A0D12",
  card:"#101318", card2:"#0B0E13",
  // borders
  border:"#1B2330", border2:"#141821",
  // text
  text1:"#FFFFFF", text2:"#A0A7B4", text3:"#5B6472",
  // semantic (market data only)
  up:"#22C55E", down:"#EF4444",
  // accents
  blue:"#4F8CFF", blueSoft:"rgba(79,140,255,0.12)",
  gold:"#D4AF37", warn:"#F97316",
  // brand
  brand:"#00C853", brandDark:"#00A040",
  // overlay
  overlay:"rgba(0,0,0,0.7)"
};

// ---- LIGHT THEME (mapped, same semantic roles) ----
var LIGHT = {
  bg:"#F6F8FB", bgAlt:"#FFFFFF",
  card:"#FFFFFF", card2:"#F2F4F8",
  border:"#E3E8EF", border2:"#EDF0F4",
  text1:"#0B1220", text2:"#5A6473", text3:"#9AA4B2",
  up:"#15A34A", down:"#DC2626",
  blue:"#2563EB", blueSoft:"rgba(37,99,235,0.1)",
  gold:"#B7902B", warn:"#EA580C",
  brand:"#00A040", brandDark:"#00803A",
  overlay:"rgba(15,23,42,0.4)"
};

export var THEMES = { dark:DARK, light:LIGHT };

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
export function loadThemeMode(){
  try{ return localStorage.getItem("bp_theme")||"dark"; }catch(e){ return "dark"; }
}
export function saveThemeMode(m){ try{ localStorage.setItem("bp_theme",m); }catch(e){} }
export function systemPrefersDark(){
  try{ return window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches; }catch(e){ return true; }
}
// Resolve a mode (dark/light/system) to an actual palette.
export function resolveTheme(mode){
  var m=mode||loadThemeMode();
  if(m=="system") m=systemPrefersDark()?"dark":"light";
  return m=="light"?LIGHT:DARK;
}
