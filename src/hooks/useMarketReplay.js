import { useState } from "react";

// BreakoutPro - useMarketReplay.js
// Single source of truth for saved Market Replay sessions. One dedicated
// localStorage key. Every saved record reflects a real completed replay
// session - entry/exit prices, decisions, and accuracy all come from the
// actual real candles played and the user's own real decisions, never
// fabricated.
// Rules: no backtick, no triple-equals, ASCII only.

var KEY = "bp_market_replay_history";

function load(){
  try{ var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : []; }catch(e){ return []; }
}
function save(list){
  try{ localStorage.setItem(KEY, JSON.stringify(list)); }catch(e){}
}

export function useMarketReplay(){
  var [history, setHistory] = useState(function(){ return load(); });

  function saveSession(session){
    var record = Object.assign({ id: Date.now() }, session);
    setHistory(function(prev){
      var next = [record].concat(prev);
      save(next);
      return next;
    });
    return record;
  }
  function deleteSession(id){
    setHistory(function(prev){
      var next = prev.filter(function(s){ return s.id!=id; });
      save(next);
      return next;
    });
  }

  return { history:history, saveSession:saveSession, deleteSession:deleteSession };
}
