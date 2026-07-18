import { useState } from "react";

// BreakoutPro - useGlobalMarketsBookmarks.js
// Single source of truth for bookmarked global market instruments. One
// dedicated localStorage key. Real user bookmarks only.
// Rules: no backtick, no triple-equals, ASCII only.

var KEY = "bp_global_markets_bookmarks";

function load(){
  try{ var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : {}; }catch(e){ return {}; }
}
function save(map){
  try{ localStorage.setItem(KEY, JSON.stringify(map)); }catch(e){}
}

export function useGlobalMarketsBookmarks(){
  var [bookmarks, setBookmarks] = useState(function(){ return load(); });

  function isBookmarked(name){
    return !!bookmarks[name];
  }
  function toggleBookmark(name){
    setBookmarks(function(prev){
      var next = Object.assign({}, prev);
      if(next[name]) delete next[name];
      else next[name] = true;
      save(next);
      return next;
    });
  }

  return { isBookmarked:isBookmarked, toggleBookmark:toggleBookmark };
}
