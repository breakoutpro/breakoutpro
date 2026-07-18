import { useEffect } from "react";
import { track, flush, setOptOut, isOptedOut } from "../state/analyticsRegistry";

// BreakoutPro - useAnalytics.js
// Thin hook over analyticsRegistry. Privacy-friendly. Frozen Phase 0.
// Rules: no backtick, no triple-equals, ASCII only.

export function useAnalytics(){
  useEffect(function(){
    track("session_start", {});
    var startedAt = Date.now();
    function onHide(){
      if(document.visibilityState=="hidden"){
        track("session_end", { durationSec: Math.round((Date.now()-startedAt)/1000) });
        flush();
      }
    }
    try{ document.addEventListener("visibilitychange", onHide); }catch(e){}
    return function(){ try{ document.removeEventListener("visibilitychange", onHide); }catch(e){} flush(); };
  }, []);

  return {
    track: track,
    flush: flush,
    setOptOut: setOptOut,
    isOptedOut: isOptedOut
  };
}
