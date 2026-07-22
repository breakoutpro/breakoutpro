import { useState } from "react";

// BreakoutPro - useAlertCenter.js
// Single source of truth for Alert Center Pro rules. One dedicated
// localStorage key. Real user-created rule definitions only - never a
// fabricated live-fired alert. Bookmark state lives on the same rule
// object rather than a second key, avoiding unnecessary key sprawl.
// Rules: no backtick, no triple-equals, ASCII only.

var KEY = "bp_alert_center_rules";

function load(){
  try{ var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : []; }catch(e){ return []; }
}
function save(list){
  try{ localStorage.setItem(KEY, JSON.stringify(list)); }catch(e){}
}

export function useAlertCenter(){
  var [rules, setRules] = useState(function(){ return load(); });

  function addRule(raw){
    var rule = Object.assign({ id:Date.now(), enabled:true, bookmarked:false }, raw);
    setRules(function(prev){
      var next = [rule].concat(prev);
      save(next);
      return next;
    });
  }
  function toggleEnabled(id){
    setRules(function(prev){
      var next = prev.map(function(r){ return r.id==id ? Object.assign({}, r, { enabled: !r.enabled }) : r; });
      save(next);
      return next;
    });
  }
  function toggleBookmark(id){
    setRules(function(prev){
      var next = prev.map(function(r){ return r.id==id ? Object.assign({}, r, { bookmarked: !r.bookmarked }) : r; });
      save(next);
      return next;
    });
  }
  function deleteRule(id){
    setRules(function(prev){
      var next = prev.filter(function(r){ return r.id!=id; });
      save(next);
      return next;
    });
  }

  return { rules:rules, addRule:addRule, toggleEnabled:toggleEnabled, toggleBookmark:toggleBookmark, deleteRule:deleteRule };
}
