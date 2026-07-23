import { useState } from "react";

// BreakoutPro - useEconomicCalendarBookmarks.js
// Single source of truth for bookmarked calendar events. One dedicated
// localStorage key. Real user bookmarks only.
// Rules: no backtick, no triple-equals, ASCII only.

var KEY = "bp_economic_calendar_bookmarks";

function load(){
  try{ var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : {}; }catch(e){ return {}; }
}
function save(map){
  try{ localStorage.setItem(KEY, JSON.stringify(map)); }catch(e){}
}

export function useEconomicCalendarBookmarks(){
  var [bookmarks, setBookmarks] = useState(function(){ return load(); });

  function isBookmarked(eventId){
    return !!bookmarks[eventId];
  }
  function toggleBookmark(eventId){
    setBookmarks(function(prev){
      var next = Object.assign({}, prev);
      if(next[eventId]) delete next[eventId];
      else next[eventId] = true;
      save(next);
      return next;
    });
  }

  return { isBookmarked:isBookmarked, toggleBookmark:toggleBookmark };
}
