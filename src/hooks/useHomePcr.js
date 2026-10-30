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
      var upd = oc.updated ? Date.parse(oc.updated) : NaN;
      var rec = { pcr: oc.pcrOi, stale: oc.status != "LIVE", updated: isFinite(upd) ? upd : null, fromStore: false };
      saveLast(sym, rec);
      return rec;
    });
  }).catch(function(){ return null; });
}

// The last real value this browser received is kept (key bp_pcr_last) so the value after the close can still be
// shown as "Last EOD". It is only ever a stored provider response, never computed or invented.
var STORE_KEY = "bp_pcr_last";
function readStore(){ try{ var o = JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); return (o && typeof o == "object") ? o : {}; }catch(e){ return {}; } }
function saveLast(sym, rec){
  try{ var o = readStore(); o[sym] = { pcr:rec.pcr, updated:rec.updated }; localStorage.setItem(STORE_KEY, JSON.stringify(o)); }catch(e){}
}
export function loadLast(sym){
  var r = readStore()[sym];
  if(!r || typeof r.pcr != "number" || !isFinite(r.pcr) || typeof r.updated != "number" || !isFinite(r.updated)) return null;
  return { pcr:r.pcr, stale:true, updated:r.updated, fromStore:true };
}

export function useHomePcr(){
  var st = useState({ NIFTY:null, BANKNIFTY:null });
  var val = st[0], setVal = st[1];
  useEffect(function(){
    var alive = true;
    function run(){
      Promise.all(SYMS.map(loadOne)).then(function(r){
        if(!alive) return;
        setVal({ NIFTY:r[0] || loadLast("NIFTY"), BANKNIFTY:r[1] || loadLast("BANKNIFTY") });
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
