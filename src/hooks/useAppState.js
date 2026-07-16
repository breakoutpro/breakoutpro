import { useState, useEffect } from "react";
import { markVisit, timeSinceLastVisit, formatGap, shouldWelcomeBack,
  getMissedAlerts, clearMissedAlerts, getLastScreen, saveLastScreen,
  cacheGet, marketDelta } from "../state/appStateRegistry";

// BreakoutPro - useAppState.js
// Session restore + welcome-back state on app open. Frozen Phase 0.
// Rules: no backtick, no triple-equals, ASCII only.

export function useAppState(){
  var [gapMs, setGapMs] = useState(0);
  var [showWelcome, setShowWelcome] = useState(false);
  var [missed, setMissed] = useState([]);
  var [lastScreen, setLastScreen] = useState("");

  useEffect(function(){
    // Compute gap BEFORE marking this visit.
    var gap = timeSinceLastVisit();
    setGapMs(gap);
    setShowWelcome(shouldWelcomeBack());
    setMissed(getMissedAlerts());
    setLastScreen(getLastScreen());
    markVisit();
  }, []);

  return {
    gapMs: gapMs,
    gapText: formatGap(gapMs),
    showWelcome: showWelcome,
    missedAlerts: missed,
    lastScreen: lastScreen,
    dismissWelcome: function(){ setShowWelcome(false); clearMissedAlerts(); },
    rememberScreen: function(tab){ saveLastScreen(tab); },
    lastSnapshot: function(){ var c = cacheGet("marketMood"); return c ? c.data : null; },
    computeDelta: marketDelta
  };
}
