import { useState, useEffect, useMemo, useRef } from "react";
import { useMarketMood } from "../../../hooks/useMarketMood";
import { useWatchlist } from "../../../hooks/useWatchlist";
import { JUSTIN } from "../../JustInData";
import { generateDemoCandles, analyzeZones } from "../../../utils/priceActionZones";

// BreakoutPro - useHomeData.js
// Single source of truth for every Home layout (Mobile/Tablet/Laptop/Desktop).
// This hook owns all data fetching, derived calculations, and local UI state
// that is NOT specific to one device's layout. Every layout component
// consumes this same hook instead of computing anything itself, so there is
// never more than one live subscription to market-mood data, and zone/mood
// calculations never run more than once per actual data change regardless
// of how many layout files exist.
// Rules: no backtick, no triple-equals, ASCII.

var TICKER = JUSTIN.map(function(n){ return n.headline; });

export function useHomeData(){
  var mm = useMarketMood(); // single Market Mood polling source for the whole Home tree
  var wl = useWatchlist();

  var [tickerIdx, setTickerIdx] = useState(0);

  useEffect(function(){
    var tk = setInterval(function(){
      setTickerIdx(function(i){ return (i+1) % TICKER.length; });
    }, 10000);
    return function(){ clearInterval(tk); };
  }, []);

  // Today's Key Levels - reuses the real Price Action Zones engine (candles
  // seeded from the real live LTP, not random). Memoized so this only
  // recomputes when the underlying LTP actually changes, not on every
  // re-render (e.g. every 10s ticker rotation).
  var niftyLtp = (mm.data && mm.data.indices && mm.data.indices.NIFTY && mm.data.indices.NIFTY.ltp) || 24500;
  var bankLtp = (mm.data && mm.data.indices && mm.data.indices.BANKNIFTY && mm.data.indices.BANKNIFTY.ltp) || 51500;
  var niftyZones = useMemo(function(){ return analyzeZones(generateDemoCandles(niftyLtp, 60, "NIFTY")); }, [niftyLtp]);
  var bankZones = useMemo(function(){ return analyzeZones(generateDemoCandles(bankLtp, 60, "BANKNIFTY")); }, [bankLtp]);

  // Fear & Greed - derived from the same real, deterministic mood score
  // (index trend + VIX + technical components), not a second invented metric.
  var moodScore = mm.mood && mm.mood.score;
  var fearGreed = moodScore==null ? null : (moodScore<40 ? "Fear" : (moodScore>60 ? "Greed" : "Neutral"));

  // Real (not fabricated) rolling LTP history for tiny sparklines - each time
  // the live market-mood data actually updates, the observed LTP is appended
  // to a small per-index history kept in a ref. Genuine observed values only.
  var ltpHistoryRef = useRef({NIFTY:[],BANKNIFTY:[],SENSEX:[],VIX:[]});
  useEffect(function(){
    var idxData = mm.data && mm.data.indices;
    if(!idxData) return;
    ["NIFTY","BANKNIFTY","SENSEX","VIX"].forEach(function(key){
      var e = idxData[key];
      if(!e || e.ltp==null) return;
      var hist = ltpHistoryRef.current[key];
      var last = hist[hist.length-1];
      if(last==e.ltp) return; // only record genuine changes
      hist.push(e.ltp);
      if(hist.length>20) hist.shift();
    });
  }, [mm.data]);

  var idxRows = useMemo(function(){
    var idxData = mm.data && mm.data.indices;
    if(!idxData) return [];
    return [
      {key:"NIFTY",label:"NIFTY 50"},
      {key:"BANKNIFTY",label:"BANK NIFTY"},
      {key:"SENSEX",label:"SENSEX"},
      {key:"VIX",label:"INDIA VIX"}
    ].map(function(r){
      var e = idxData[r.key];
      if(!e || e.ltp==null) return null;
      var chgNum = Number(e.chgPct);
      var chgOk = e.chgPct!=null && isFinite(chgNum);
      var dir = chgOk ? (chgNum>0?"up":(chgNum<0?"down":"neutral")) : "neutral";
      return Object.assign({},r,{ltp:e.ltp, chgPct:chgOk?chgNum:null, dir:dir});
    }).filter(function(x){ return x; });
  }, [mm.data]);

  return {
    mm: mm,
    wl: wl,
    ticker: TICKER,
    tickerIdx: tickerIdx,
    niftyZones: niftyZones,
    bankZones: bankZones,
    fearGreed: fearGreed,
    idxRows: idxRows,
    ltpHistoryRef: ltpHistoryRef
  };
}
