import { useState } from "react";

// BreakoutPro - useDividendTrackerBookmarks.js
// Single source of truth for bookmarked dividend companies. One dedicated
// localStorage key. Real user bookmarks only.
// Rules: no backtick, no triple-equals, ASCII only.

var KEY = "bp_dividend_tracker_bookmarks";

function load(){
  try{ var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : {}; }catch(e){ return {}; }
}
function save(map){
  try{ localStorage.setItem(KEY, JSON.stringify(map)); }catch(e){}
}

export function useDividendTrackerBookmarks(){
  var [bookmarks, setBookmarks] = useState(function(){ return load(); });

  function isBookmarked(id){
    return !!bookmarks[id];
  }
  function toggleBookmark(id){
    setBookmarks(function(prev){
      var next = Object.assign({}, prev);
      if(next[id]) delete next[id];
      else next[id] = true;
      save(next);
      return next;
    });
  }

  return { isBookmarked:isBookmarked, toggleBookmark:toggleBookmark };
}
