import { useState, useEffect, useMemo } from "react";
import { computeDirection } from "../screens/DirectionEngine";
import { computeNextMove } from "../screens/NextMoveEngine";

// BreakoutPro - useNextMove.js
// ONE path from the shared market-mood payload to the Next Move result, used by
// the Market Mood page AND the Home cards. It adds no request and no
// calculation of its own: computeDirection() (daily candles, validated provider
// timestamps) feeds computeNextMove(). Because every screen goes through here,
// a level, a status or a freshness label cannot differ between screens.
// The 15 s tick re-evaluates freshness against the clock, so a LIVE label
// cannot linger after polling stops.
// Rules: no backtick, no triple-equals, ASCII only.
export function useNextMove(mm){
  var m = mm || {};
  var tickState = useState(0);
  var setTick = tickState[1];
  useEffect(function(){
    var id = setInterval(function(){ setTick(function(x){ return x+1; }); }, 15000);
    return function(){ clearInterval(id); };
  }, []);
  var tick = tickState[0];
  var usingDemo = !m.mood || m.mood.score==null;
  var direction = useMemo(function(){
    // The REAL payload is used whenever one exists. Demo values are never fed
    // to the direction engine.
    return computeDirection(m.data || null, {
      now: Date.now(), lastUpdated: m.lastUpdated, demo: (usingDemo && !m.data),
      offline: (m.status=="offline" || m.networkStatus=="OFFLINE")
    });
  }, [m.data, usingDemo, m.lastUpdated, m.status, m.networkStatus, tick]);
  var nextMove = useMemo(function(){ return computeNextMove(direction); }, [direction]);
  var niftyQ = m.data && m.data.indices && m.data.indices.NIFTY;
  var srcTs = niftyQ && niftyQ.freshness && niftyQ.freshness.sourceTimestamp ? niftyQ.freshness.sourceTimestamp : null;
  return { direction: direction, nextMove: nextMove, srcTs: srcTs, usingDemo: usingDemo };
}
