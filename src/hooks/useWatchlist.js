import { useState, useEffect } from "react";

// BreakoutPro - useWatchlist.js
// SINGLE global watchlist store. One localStorage key (bp_watchlist).
// Cross-component real-time sync via a custom event. No duplicate arrays or listeners.
// Rules: no backtick, no triple-equals, ASCII.

var KEY = "bp_watchlist";
var EVT = "bp_watchlist_change";
var DEFAULT = ["NIFTY","RELIANCE","HDFCBANK"];

export function loadWatchlist(){
  try{ var s=localStorage.getItem(KEY); return s?JSON.parse(s):DEFAULT.slice(); }catch(e){ return DEFAULT.slice(); }
}
function persist(arr){
  try{ localStorage.setItem(KEY, JSON.stringify(arr)); }catch(e){}
  try{ window.dispatchEvent(new CustomEvent(EVT,{detail:arr})); }catch(e){}
}
export function addToWatchlist(sym){
  var wl=loadWatchlist();
  if(wl.indexOf(sym)<0){ wl=[sym].concat(wl); persist(wl); }
  return wl;
}
export function removeFromWatchlist(sym){
  var wl=loadWatchlist().filter(function(s){ return s!=sym; });
  persist(wl);
  return wl;
}
export function inWatchlist(sym){ return loadWatchlist().indexOf(sym)>=0; }

// Hook: live watchlist that re-renders on any change from anywhere.
export function useWatchlist(){
  var [list,setList]=useState(loadWatchlist());
  useEffect(function(){
    function onChange(e){ setList((e&&e.detail)?e.detail:loadWatchlist()); }
    function onStorage(e){ if(!e||e.key==KEY){ setList(loadWatchlist()); } }
    try{ window.addEventListener(EVT,onChange); }catch(er){}
    try{ window.addEventListener("storage",onStorage); }catch(er){}
    return function(){
      try{ window.removeEventListener(EVT,onChange); }catch(er){}
      try{ window.removeEventListener("storage",onStorage); }catch(er){}
    };
  },[]);
  function add(sym){ setList(addToWatchlist(sym)); }
  function remove(sym){ setList(removeFromWatchlist(sym)); }
  function toggle(sym){ return inWatchlist(sym)?remove(sym):add(sym); }
  return { list:list, add:add, remove:remove, toggle:toggle, has:function(s){ return list.indexOf(s)>=0; } };
}
