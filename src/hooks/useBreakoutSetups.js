import { useState, useEffect } from "react";
import { pickSetups } from "./breakoutSetupsModel";

// BreakoutPro - useBreakoutSetups.js
// Home hero: Today's Breakout Setups. Reads the SAME /api/scanner-data the Live Breakouts screen uses
// (deterministic classification of real Yahoo daily candles: close beyond the prior 15-session high or low).
// Only results tagged breakout or breakdown become setups. Nothing is invented: no targets, no scores.
// Result: { status:"loading"|"ok"|"error", setups:[...], generatedAt }
// Rules: no backtick, no triple-equals, ASCII only.

var REFRESH_MS = 120000;
export function useBreakoutSetups(){
  var st = useState({ status:"loading", setups:[], generatedAt:null });
  var val = st[0], setVal = st[1];
  useEffect(function(){
    var alive = true;
    function run(){
      fetch("/api/scanner-data").then(function(r){ return r.json(); }).then(function(j){
        if(!alive) return;
        if(j && j.ok !== false && Array.isArray(j.results)) setVal({ status:"ok", setups:pickSetups(j.results), generatedAt:(typeof j.generatedAt == "number") ? j.generatedAt : null });
        else setVal(function(p){ return p.status == "ok" ? p : { status:"error", setups:[], generatedAt:null }; });
      }).catch(function(){
        if(alive) setVal(function(p){ return p.status == "ok" ? p : { status:"error", setups:[], generatedAt:null }; });
      });
    }
    run();
    var id = setInterval(run, REFRESH_MS);
    return function(){ alive = false; clearInterval(id); };
  }, []);
  return val;
}
