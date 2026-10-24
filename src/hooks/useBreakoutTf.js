import { useState, useEffect, useMemo, useRef } from "react";
import { evaluateBreakoutTf } from "../screens/BreakoutTfEngine";
import { loadFrames } from "../services/breakoutTfFetch";
import { isClockOpen } from "../screens/DirectionEngine";

// BreakoutPro - useBreakoutTf.js
// Loads the candles for one instrument and one breakout timeframe (plus its
// required higher timeframes) from the existing /api/market?action=historical
// route and evaluates them with the pure BreakoutTfEngine. No other calculation
// lives here. Frames are cached in services/breakoutTfFetch, so switching back to
// a timeframe within its TTL does not call the provider again.
// While the NSE session is open the data is re-requested every 60 s; the clock
// tick (15 s) re-evaluates freshness so a stale feed cannot keep a "confirmed" label.
// Rules: no backtick, no triple-equals, ASCII only.
export function useBreakoutTf(symbol, tfKey){
  var framesState = useState(null);
  var tickState = useState(0);
  var loadState = useState(true);
  var refreshState = useState(0);
  var reqRef = useRef(0);
  var forceRef = useRef(false);

  useEffect(function(){
    var id = setInterval(function(){ tickState[1](function(x){ return x + 1; }); }, 15000);
    return function(){ clearInterval(id); };
  }, []);

  useEffect(function(){
    var mine = ++reqRef.current;
    var force = forceRef.current;
    forceRef.current = false;
    loadState[1](true);
    loadFrames(symbol, tfKey, { force:force }).then(function(frames){
      if(mine != reqRef.current) return;
      framesState[1]({ symbol:symbol, tf:tfKey, frames:frames, at:Date.now() });
      loadState[1](false);
    });
  }, [symbol, tfKey, refreshState[0]]);

  // auto refresh only while the session is open
  useEffect(function(){
    var id = setInterval(function(){
      if(isClockOpen(Date.now())) refreshState[1](function(x){ return x + 1; });
    }, 60000);
    return function(){ clearInterval(id); };
  }, []);

  var data = framesState[0];
  var tick = tickState[0];
  var view = useMemo(function(){
    if(!data || data.symbol != symbol || data.tf != tfKey) return null;
    return evaluateBreakoutTf({ symbol:symbol, tf:tfKey, frames:data.frames, now:Date.now() });
  }, [data, symbol, tfKey, tick]);

  function refresh(){ forceRef.current = true; refreshState[1](function(x){ return x + 1; }); }
  return { view:view, loading:loadState[0] || !view, refresh:refresh, loadedAt:data ? data.at : null };
}
