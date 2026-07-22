import { useState } from "react";

// BreakoutPro - useIPOCenterBookmarks.js
// Single source of truth for bookmarked IPOs. One dedicated localStorage
// key. Real user bookmarks only.
// Rules: no backtick, no triple-equals, ASCII only.

var KEY = "bp_ipo_center_bookmarks";

function load(){
  try{ var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : {}; }catch(e){ return {}; }
}
function save(map){
  try{ localStorage.setItem(KEY, JSON.stringify(map)); }catch(e){}
}

export function useIPOCenterBookmarks(){
  var [bookmarks, setBookmarks] = useState(function(){ return load(); });

  function isBookmarked(ipoId){
    return !!bookmarks[ipoId];
  }
  function toggleBookmark(ipoId){
    setBookmarks(function(prev){
      var next = Object.assign({}, prev);
      if(next[ipoId]) delete next[ipoId];
      else next[ipoId] = true;
      save(next);
      return next;
    });
  }

  return { isBookmarked:isBookmarked, toggleBookmark:toggleBookmark };
}
