import { useState, useEffect } from "react";
import dataService from "../services/dataService";

// BreakoutPro - useHomePcr.js
// Home index cards: OI PCR for NIFTY and BANKNIFTY from the SAME option-chain service the
// OI + PCR screen uses (expiry list first, then the chain for the nearest expiry).
// A value is returned only when the service answers LIVE or STALE with a numeric pcrOi.
// Anything else leaves that index without a PCR tag - never a guessed number.
// Result: { NIFTY:{ pcr, stale } | null, BANKNIFTY:{ pcr, stale } | null }
// Rules: no backtick, no triple-equals, ASCII only.

var SYMS = ["NIFTY", "BANKNIFTY"];
var REFRESH_MS = 120000;

function loadOne(sym){
  return dataService.getExpiryList(sym).then(function(ex){
    if(!ex || !ex.expiries || ex.expiries.length == 0) return null;
    return dataService.getOptionChain(sym, ex.expiries[0], 1).then(function(oc){
      if(!oc || (oc.status != "LIVE" && oc.status != "STALE")) return null;
      if(typeof oc.pcrOi != "number" || !isFinite(oc.pcrOi)) return null;
      return { pcr: oc.pcrOi, stale: oc.status != "LIVE" };
    });
  }).catch(function(){ return null; });
}

export function useHomePcr(){
  var st = useState({ NIFTY:null, BANKNIFTY:null });
  var val = st[0], setVal = st[1];
  useEffect(function(){
    var alive = true;
    function run(){
      Promise.all(SYMS.map(loadOne)).then(function(r){
        if(!alive) return;
        setVal({ NIFTY:r[0], BANKNIFTY:r[1] });
      });
    }
    run();
    var id = setInterval(run, REFRESH_MS);
    return function(){ alive = false; clearInterval(id); };
  }, []);
  return val;
}

// PCR wording follows the OI + PCR screen: above 1.2 bullish, below 0.8 bearish, else neutral.
export function pcrLabel(pcr){
  if(pcr > 1.2) return "Bullish";
  if(pcr < 0.8) return "Bearish";
  return "Neutral";
}
