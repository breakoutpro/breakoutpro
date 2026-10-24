// BreakoutPro Design System - tokens.js
// Single source of truth for colors, spacing, typography, radii, shadows, breakpoints.
// Three themes: Light Pro (default), Dark Pro and AMOLED Dark, plus System, which
// resolves to Light Pro or Dark Pro from the OS preference. Rules: no backtick, no triple-equals, ASCII.

// ---- THEMES: Light Pro (default), Dark Pro, AMOLED Dark ----------------------
// Every palette has the SAME keys, so theme.c.* works unchanged in all existing
// screens. Core keys (bg ... overlay) are the original token set. Semantic,
// chart and accessibility keys below them are additions. Contrast of text, up,
// down, neutral, warn and blue against bg/card/card2 is enforced by
// tests/theme.test.mjs (WCAG AA 4.5:1 for text and signal colours).
var DARK = {
  id:"dark", scheme:"dark",
  // backgrounds
  bg:"#0B1220", bgAlt:"#0F172A",
  card:"#131C2E", card2:"#0E1626",
  // borders
  border:"#27344D", border2:"#1B2639",
  // text
  text1:"#E8EDF6", text2:"#A9B5C9", text3:"#8895AB",
  // semantic (market data only: up/down are reserved for positive/negative market meaning)
  up:"#1FAE5B", down:"#F26B6B",
  // accents
  blue:"#4D8DF8", blueSoft:"rgba(77,141,248,0.14)",
  gold:"#E0B84C", warn:"#F59E42",
  // brand
  brand:"#4D8DF8", brandDark:"#3B7BEA",
  // overlay
  overlay:"rgba(0,0,0,0.7)",
  // semantic states
  bull:"#1FAE5B", bear:"#F26B6B", neutral:"#E0B84C", warning:"#F59E42", info:"#5B9DF9",
  bullSoft:"rgba(31,174,91,0.16)", bearSoft:"rgba(242,107,107,0.16)", neutralSoft:"rgba(224,184,76,0.16)",
  warningSoft:"rgba(245,158,66,0.16)", infoSoft:"rgba(91,157,249,0.16)",
  onAccent:"#FFFFFF", onBrand:"#0B1220", accent:"#2563EB", danger:"#475569", accent2:"#7C83F5", accent2Soft:"rgba(124,131,245,0.16)",
  // chart
  chartGrid:"#222D40", chartAxis:"#8895AB", chartLine:"#5B9DF9", chartArea:"rgba(91,157,249,0.14)",
  chartUp:"#1FAE5B", chartDown:"#F26B6B"
};

var LIGHT = {
  id:"light", scheme:"light",
  bg:"#F4F6FA", bgAlt:"#EBEFF5",
  card:"#FFFFFF", card2:"#F8FAFC",
  border:"#D8DEE8", border2:"#E8ECF3",
  text1:"#172033", text2:"#4F5D73", text3:"#58657A",
  up:"#127336", down:"#B91C1C",
  blue:"#215AD5", blueSoft:"rgba(33,90,213,0.10)",
  gold:"#755800", warn:"#9A4405",
  brand:"#215AD5", brandDark:"#1B4DB8",
  overlay:"rgba(15,23,42,0.4)",
  bull:"#127336", bear:"#B91C1C", neutral:"#755800", warning:"#9A4405", info:"#215AD5",
  bullSoft:"rgba(18,115,54,0.10)", bearSoft:"rgba(185,28,28,0.10)", neutralSoft:"rgba(117,88,0,0.12)",
  warningSoft:"rgba(154,68,5,0.12)", infoSoft:"rgba(33,90,213,0.10)",
  onAccent:"#FFFFFF", onBrand:"#FFFFFF", accent:"#2563EB", danger:"#334155", accent2:"#6366F1", accent2Soft:"rgba(99,102,241,0.12)",
  chartGrid:"#E1E6EE", chartAxis:"#58657A", chartLine:"#215AD5", chartArea:"rgba(33,90,213,0.10)",
  chartUp:"#127336", chartDown:"#B91C1C"
};

// Pure black page for OLED panels; cards stay a hair above black so they are
// still separated by border and fill.
var AMOLED = {
  id:"amoled", scheme:"dark",
  bg:"#000000", bgAlt:"#000000",
  card:"#0A0A0A", card2:"#050505",
  border:"#262E3B", border2:"#171C25",
  text1:"#FFFFFF", text2:"#B0B9C8", text3:"#8A95A8",
  up:"#22B862", down:"#FF6B6B",
  blue:"#4D8DF8", blueSoft:"rgba(77,141,248,0.16)",
  gold:"#E0B84C", warn:"#F59E42",
  brand:"#4D8DF8", brandDark:"#3B7BEA",
  overlay:"rgba(0,0,0,0.8)",
  bull:"#22B862", bear:"#FF6B6B", neutral:"#E0B84C", warning:"#F59E42", info:"#5B9DF9",
  bullSoft:"rgba(34,184,98,0.18)", bearSoft:"rgba(255,107,107,0.18)", neutralSoft:"rgba(224,184,76,0.18)",
  warningSoft:"rgba(245,158,66,0.18)", infoSoft:"rgba(91,157,249,0.18)",
  onAccent:"#FFFFFF", onBrand:"#000000", accent:"#2563EB", danger:"#475569", accent2:"#7C83F5", accent2Soft:"rgba(124,131,245,0.18)",
  chartGrid:"#1C222B", chartAxis:"#8A95A8", chartLine:"#5B9DF9", chartArea:"rgba(91,157,249,0.16)",
  chartUp:"#22B862", chartDown:"#FF6B6B"
};

export var THEMES = { light:LIGHT, dark:DARK, amoled:AMOLED };
export var THEME_IDS = ["light", "dark", "amoled"];
export var THEME_MODES = ["light", "dark", "amoled", "system"];

// ---- SPACING (4px base scale) ----
export var space = { xs:4, sm:8, md:12, lg:16, xl:20, x2:24, x3:32, x4:40, x5:56 };

// ---- BORDER RADIUS ----
export var radius = { sm:8, md:11, lg:14, xl:18, pill:999 };

// ---- TYPOGRAPHY (size scale + weights) ----
export var font = {
  family:"Inter,Arial,sans-serif",
  mono:"monospace",
  size:{ xs:8, sm:9, base:11, md:12.5, lg:14, xl:16, x2:19, x3:24, x4:30 },
  // Named semantic scale, per the professional-trading-platform hierarchy -
  // use these for new work; the scale above stays for existing screens.
  // Trader-first scale for the Home card and Market Mood: direction word, big
  // numbers, labels, captions. Numbers use tabular figures so columns align.
  pro:{ direction:24, numLg:20, numMd:16, body:12, label:11, caption:10 },
  tabular:"tabular-nums",
  hierarchy:{ pageTitle:32, sectionTitle:20, cardTitle:16, label:13, numberSm:18, numberLg:24 },
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

// ---- THEME PERSISTENCE, MIGRATION AND SYSTEM DETECTION ------------------------
// One storage key, "bp_theme" (already used before). Saved values from earlier
// versions are normalised here: the legacy "amoled" now selects AMOLED Dark;
// other spellings map to the nearest theme; anything unknown becomes Light Pro
// (the default for existing users).
var LEGACY = {
  "amoled":"amoled", "amoled dark":"amoled", "amoled-dark":"amoled", "amoled_dark":"amoled", "black":"amoled", "pure-black":"amoled",
  "dark":"dark", "dark pro":"dark", "dark-pro":"dark", "dark_pro":"dark", "midnight":"dark",
  "light":"light", "light pro":"light", "light-pro":"light", "light_pro":"light", "white":"light",
  "system":"system", "auto":"system"
};
export function normalizeMode(m){
  if(m==null) return "light";
  var k = String(m).trim().toLowerCase();
  return LEGACY[k] || "light";
}
export function loadThemeMode(){
  var raw = null;
  try{ raw = localStorage.getItem("bp_theme"); }catch(e){ return "light"; }
  var m = normalizeMode(raw);
  if(raw!=null && raw!==m){ try{ localStorage.setItem("bp_theme", m); }catch(e){} }   // migrate in place
  return m;
}
export function saveThemeMode(m){ try{ localStorage.setItem("bp_theme", normalizeMode(m)); }catch(e){} }
export function systemPrefersDark(){
  try{ return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches); }catch(e){ return false; }
}
// The concrete theme id (light / dark / amoled) for a mode.
export function resolveThemeId(mode){
  var m = normalizeMode(mode==null ? loadThemeMode() : mode);
  if(m=="system") return systemPrefersDark() ? "dark" : "light";
  return m;
}
export function resolveTheme(mode){
  return THEMES[resolveThemeId(mode)] || LIGHT;
}
// Set the document theme attribute, color-scheme and page background so the
// area outside React (overscroll, scrollbars, browser chrome) matches.
export function applyThemeToDocument(palette){
  if(typeof document=="undefined" || !palette) return;
  try{
    var root = document.documentElement;
    root.setAttribute("data-theme", palette.id);
    root.style.colorScheme = palette.scheme;
    root.style.setProperty("--bp-input-bg", palette.card2);
    root.style.setProperty("--bp-text", palette.text1);
    root.style.setProperty("--bp-text3", palette.text3);
    root.style.setProperty("--bp-border", palette.border);
    if(document.body) document.body.style.setProperty("background", palette.bg, "important");
    var meta = document.querySelector("meta[name=theme-color]");
    if(meta) meta.setAttribute("content", palette.bg);
  }catch(e){}
}
