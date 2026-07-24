// BreakoutPro - src/state/notificationRegistry.js
// Alert types, priority, sound, frequency, push support. Single engine gates all
// (useSmartAlerts master switch). Frozen Phase 0. Rules: no backtick, no ===, ASCII.

// Priority levels map to behaviour.
export var PRIORITY = {
  normal:   { sound:false, voice:false, push:true },
  voice:    { sound:false, voice:true,  push:true },
  priority: { sound:true,  voice:true,  push:true }
};

// Alert type -> owner feature, default priority, frequency.
export var ALERT_TYPES = {
  price:      { id:"price",     owner:"marketDashboard", priority:"priority", freq:"on-trigger",      badge:true },
  watchlist:  { id:"watchlist", owner:"watchlistAI",     priority:"priority", freq:"on-trigger",      badge:true },
  scanner:    { id:"scanner",   owner:"scannerHub",      priority:"voice",    freq:"on-match",        badge:true },
  market:     { id:"market",    owner:"marketMood",      priority:"priority", freq:"on-state-change", badge:true },
  options:    { id:"options",   owner:"optionsIntel",    priority:"voice",    freq:"on-trigger",      badge:true },
  news:       { id:"news",      owner:"aiNews",          priority:"normal",   freq:"on-major-news",   badge:false },
  education:  { id:"education", owner:"traderCoach",     priority:"normal",   freq:"daily",           badge:false },
  risk:       { id:"risk",      owner:"traderCoach",     priority:"priority", freq:"on-condition",    badge:true }
};

// Master gate + watchlist-only mode read from the single alert store.
export function masterEnabled(){
  try{ return localStorage.getItem("bp_smart_alerts") != "0"; }catch(e){ return true; }
}
export function watchlistOnly(){
  try{ return localStorage.getItem("bp_watch_only") == "1"; }catch(e){ return false; }
}

export function priorityOf(typeId){
  var t = ALERT_TYPES[typeId];
  return t ? PRIORITY[t.priority] : PRIORITY.normal;
}

// Can this alert fire given master switch + watchlist-only + optional symbol.
export function canFire(typeId, opts){
  if(!masterEnabled()) return false;
  var o = opts || {};
  if(watchlistOnly() && o.symbol && o.inWatchlist == false) return false;
  return !!ALERT_TYPES[typeId];
}

// Push notification schema (ready for Push API integration in PWA phase).
export function buildPush(typeId, payload){
  var t = ALERT_TYPES[typeId];
  if(!t) return null;
  var p = priorityOf(typeId);
  return {
    type: typeId,
    title: (payload && payload.title) || "Breakout Pro",
    body: (payload && payload.body) || "",
    sound: p.sound,
    requireInteraction: t.priority == "priority",
    badge: t.badge,
    data: (payload && payload.data) || {}
  };
}
