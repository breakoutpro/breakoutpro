import { useState, useEffect } from "react";

// BreakoutPro - useSmartAlerts.js
// SINGLE global source of truth for the Smart Alerts master switch.
// Module-level store + subscriptions: every component reads/writes the SAME value.
// No Context wrapping needed. Rules: no backtick, no triple-equals, ASCII.

function load(){
  try{ return localStorage.getItem("bp_smart_alerts")!="0"; }catch(e){ return true; }
}

// The one and only state holder.
var store = { enabled: load() };
var listeners = [];

function emit(){
  for(var i=0;i<listeners.length;i++){ try{ listeners[i](store.enabled); }catch(e){} }
}

// Public setter: updates the single store, persists, notifies everyone.
export function setSmartAlerts(on){
  store.enabled = !!on;
  try{ localStorage.setItem("bp_smart_alerts", store.enabled?"1":"0"); }catch(e){}
  emit();
}
export function getSmartAlerts(){ return store.enabled; }
export function toggleSmartAlerts(){ setSmartAlerts(!store.enabled); }

// Cross-tab / cross-listener sync via storage events too.
try{
  window.addEventListener("storage", function(e){
    if(e && e.key=="bp_smart_alerts"){ store.enabled = load(); emit(); }
  });
}catch(e){}

// React hook: subscribe a component to the single store.
export function useSmartAlerts(){
  var [enabled, setEnabled] = useState(store.enabled);
  useEffect(function(){
    function onChange(v){ setEnabled(v); }
    listeners.push(onChange);
    // sync immediately in case it changed before mount
    setEnabled(store.enabled);
    return function(){
      var idx = listeners.indexOf(onChange);
      if(idx>=0) listeners.splice(idx,1);
    };
  },[]);
  return { enabled: enabled, setEnabled: setSmartAlerts, toggle: toggleSmartAlerts };
}
