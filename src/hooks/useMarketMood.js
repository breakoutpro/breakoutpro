import { useState, useEffect, useRef } from "react";
import { computeMoodScore } from "../screens/MarketMoodEngine";
import { resilientFetch } from "../services/resilientFetch";
import { canFire, buildPush } from "../state/notificationRegistry";

// BreakoutPro - useMarketMood.js
// Dual-layer refresh: fast market data (~10s, via resilientFetch) + AI
// synthesis (~120s or on meaningful change). Prevents request storms,
// ignores stale/overlapping responses, handles offline honestly.
// IMPORTANT: resilientFetch's status (LIVE/DELAYED/STALE/OFFLINE/
// UNAVAILABLE) describes NETWORK/CACHE state of the HTTP call. It is kept
// separate from PROVIDER freshness (data.indices.NIFTY.freshness.status
// etc), which comes straight from the server payload and is never touched
// here - a successful ("LIVE") network fetch can still carry DELAYED
// market data (e.g. market closed), and that must not be overwritten.
// Step 6: fires the "market" alert type (owned by marketMood per
// notificationRegistry) ONLY on a real deterministic state transition from
// MarketMoodEngine.js (label/stage/confidence). AI text never drives this.
// Rules: no backtick, no ===, ASCII.

var DATA_INTERVAL = 10 * 1000;
var AI_INTERVAL = 120 * 1000;
var ALERT_COOLDOWN_MS = 15 * 60 * 1000; // minimum gap between market-mood alerts

export function useMarketMood(){
  var [data, setData] = useState(null);          // real normalized server data
  var [mood, setMood] = useState(null);           // deterministic score result
  var [ai, setAi] = useState(null);               // AI synthesis text
  var [status, setStatus] = useState("loading");  // loading | ok | error | offline (compat with existing UI)
  var [networkStatus, setNetworkStatus] = useState(null); // raw resilientFetch status, for future use
  var [lastUpdated, setLastUpdated] = useState(null);

  var mountedRef = useRef(true);
  var controllerRef = useRef(null);
  var fetchingRef = useRef(false);
  var lastAcceptedAtRef = useRef(0);   // guards against out-of-order/stale emits
  var lastAiAtRef = useRef(0);
  var lastKeyRef = useRef("");         // signature to detect meaningful change (AI refresh only)
  var aiFetchingRef = useRef(false);   // prevents overlapping AI POSTs
  var prevMoodStateRef = useRef(null); // last accepted {label,stage,confidence} for alert transitions
  var lastAlertAtRef = useRef(0);      // cooldown
  var lastAlertKeyRef = useRef("");    // dedupe identical transition

  function meaningfulSignature(m, d){
    if(!m) return "";
    var vixBucket = "";
    try{ var v=d.indices.VIX.ltp; vixBucket = v==null?"":String(Math.round(v)); }catch(e){}
    // label + stage + score bucket (5-pt) + vix integer
    return m.label + "|" + m.stage + "|" + Math.round((m.score||0)/5) + "|" + vixBucket;
  }

  function mapNetworkStatus(netStatus, hasData){
    // Map resilientFetch's network/cache status to the existing status
    // vocabulary the UI already reads (loading | ok | error | offline).
    if(netStatus=="LIVE") return "ok";
    if(netStatus=="OFFLINE") return "offline";
    if((netStatus=="DELAYED" || netStatus=="STALE") && hasData) return "ok"; // cached but usable, never blank
    return "error"; // UNAVAILABLE with no usable data
  }

  // Fires a local (foreground) notification for the "market" alert type,
  // using ONLY the existing notificationRegistry contract - no new
  // notification system. canFire() already respects the master switch and
  // watchlist-only gating; buildPush() supplies the registry's own
  // title/body/requireInteraction shape for this alert type.
  function showMarketAlert(title, body){
    if(!canFire("market", {})) return;
    var push = buildPush("market", { title:title, body:body });
    if(!push) return;
    try{
      if(typeof Notification!="undefined" && Notification.permission=="granted"){
        new Notification(push.title, { body:push.body, icon:"/favicon.ico", requireInteraction:push.requireInteraction });
      }
    }catch(e){}
  }

  // Checks the REAL deterministic mood (never AI text) for a meaningful
  // state transition, with cooldown + dedupe so the same transition can
  // never spam the user. Never fires on small score fluctuations.
  // Production audit finding: confidence (Low/Medium/High) can flip on a
  // single transient upstream data drop-out (e.g. one component briefly
  // unavailable for one 10s poll) that has nothing to do with an actual
  // market mood change, and is therefore NOT used as a standalone alert
  // trigger - only label and stage changes fire a notification. Confidence
  // is still tracked in the transition key so it cannot cause a false
  // dedupe collision with a genuine label/stage change.
  function checkMoodTransition(m){
    if(!m || m.score==null) return;
    var prev = prevMoodStateRef.current;
    var curr = { label:m.label, stage:m.stage, confidence:m.confidence };
    if(prev){
      var labelChanged = prev.label != curr.label;
      var stageChanged = prev.stage != curr.stage;
      if(labelChanged || stageChanged){
        var transitionKey = prev.label+">"+curr.label+"|"+prev.stage+">"+curr.stage+"|"+prev.confidence+">"+curr.confidence;
        var now = Date.now();
        var cooldownOk = (now - lastAlertAtRef.current) >= ALERT_COOLDOWN_MS;
        var notDupe = transitionKey != lastAlertKeyRef.current;
        if(cooldownOk && notDupe){
          var title, body;
          if(labelChanged){
            title = "Market condition changed";
            body = "Market condition changed from " + prev.label + " to " + curr.label + " observation.";
          } else {
            title = "Market stage changed";
            body = "Market stage changed from " + prev.stage + " to " + curr.stage + " observation.";
          }
          showMarketAlert(title, body);
          lastAlertAtRef.current = now;
          lastAlertKeyRef.current = transitionKey;
        }
      }
    }
    prevMoodStateRef.current = curr;
  }

  function fetchAi(m, d){
    if(aiFetchingRef.current) return; // no overlapping AI calls
    aiFetchingRef.current = true;
    fetch("/api/market-mood-ai",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ mood:m, data:d, session:d.session })
    })
      .then(function(r){ return r.json(); })
      .then(function(res){
        aiFetchingRef.current = false;
        if(!mountedRef.current) return;
        if(res && res.ok && res.ai) setAi(res.ai);
      })
      .catch(function(){ aiFetchingRef.current = false; /* AI optional; keep deterministic mood */ });
  }

  function onUpdate(update){
    fetchingRef.current = false;
    if(!mountedRef.current) return;

    var netStatus = update.status;                 // LIVE/DELAYED/STALE/OFFLINE/UNAVAILABLE
    var at = update.lastUpdated || Date.now();
    var hasPayload = !!(update.data && update.data.ok!=false && update.data.indices);

    // Ignore out-of-order responses (an older cached emit arriving after a
    // newer one). Never lets a stale result overwrite fresher state.
    if(at < lastAcceptedAtRef.current) return;
    lastAcceptedAtRef.current = at;

    setNetworkStatus(netStatus);
    setStatus(mapNetworkStatus(netStatus, hasPayload));

    if(!hasPayload){
      // No usable data at all (fresh UNAVAILABLE, or offline with empty cache).
      // Never fabricate: leave previous good data/mood in place if we ever
      // had any, but do not invent new values.
      setLastUpdated(at);
      return;
    }

    var d = update.data;
    var m = computeMoodScore(d);
    setData(d); setMood(m); setLastUpdated(at);
    checkMoodTransition(m); // deterministic-only, never driven by AI text

    // Decide whether to refresh AI: interval elapsed OR meaningful change.
    var sig = meaningfulSignature(m, d);
    var now = Date.now();
    var changed = sig!=lastKeyRef.current && lastKeyRef.current!="";
    var due = (now - lastAiAtRef.current) >= AI_INTERVAL;
    lastKeyRef.current = sig;
    if((changed || due || lastAiAtRef.current==0) && m && m.score!=null){
      lastAiAtRef.current = now;
      fetchAi(m, d);
    }
  }

  useEffect(function(){
    mountedRef.current = true;

    controllerRef.current = resilientFetch("/api/market-mood-data", {
      cacheKey:"marketMood",
      onUpdate:onUpdate
    });
    fetchingRef.current = true; // initial fetch is already in flight

    var t = setInterval(function(){
      if(!mountedRef.current) return;
      if(fetchingRef.current) return; // skip tick if a request is already in flight, avoids overlap
      fetchingRef.current = true;
      controllerRef.current.refresh();
    }, DATA_INTERVAL);

    return function(){
      mountedRef.current = false;
      clearInterval(t);
      if(controllerRef.current) controllerRef.current.stop();
    };
  }, []);

  return {
    data:data, mood:mood, ai:ai, status:status, networkStatus:networkStatus,
    lastUpdated:lastUpdated, session:data && data.session
  };
}
