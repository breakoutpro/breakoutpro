import { useState } from "react";

// BreakoutPro - useMarketHeatmapBookmarks.js
// Single source of truth for bookmarked heatmap sectors/views. One
// dedicated localStorage key. Real user bookmarks only.
// Rules: no backtick, no triple-equals, ASCII only.

var KEY = "bp_market_heatmap_bookmarks";

function load(){
  try{ var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : {}; }catch(e){ return {}; }
}
function save(map){
  try{ localStorage.setItem(KEY, JSON.stringify(map)); }catch(e){}
}

export function useMarketHeatmapBookmarks(){
  var [bookmarks, setBookmarks] = useState(function(){ return load(); });

  function isBookmarked(viewId){
    return !!bookmarks[viewId];
  }
  function toggleBookmark(viewId){
    setBookmarks(function(prev){
      var next = Object.assign({}, prev);
      if(next[viewId]) delete next[viewId];
      else next[viewId] = true;
      save(next);
      return next;
    });
  }

  return { isBookmarked:isBookmarked, toggleBookmark:toggleBookmark };
}
