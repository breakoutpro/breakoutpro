import { useState, useEffect, useRef } from "react";
import { computeMoodScore } from "../screens/MarketMoodEngine";

// BreakoutPro - useMarketMood.js
// Dual-layer refresh: fast market data (~10s) + AI synthesis (~120s or on meaningful change).
// Prevents request storms, ignores stale overlapping responses, handles offline.
// Rules: no backtick, no ===, ASCII.

var DATA_INTERVAL = 10 * 1000;
var AI_INTERVAL = 120 * 1000;

export function useMarketMood(){
  var [data, setData] = useState(null);       // normalized server data
  var [mood, setMood] = useState(null);        // deterministic score result
  var [ai, setAi] = useState(null);            // AI synthesis text
  var [status, setStatus] = useState("loading"); // loading | ok | error | offline
  var [lastUpdated, setLastUpdated] = useState(null);

  var reqIdRef = useRef(0);
  var lastAiAtRef = useRef(0);
  var lastKeyRef = useRef("");   // signature to detect meaningful change

  function meaningfulSignature(m, d){
    if(!m) return "";
    var vixBucket = "";
    try{ var v=d.indices.VIX.ltp; vixBucket = v==null?"":String(Math.round(v)); }catch(e){}
    // label + stage + score bucket (5-pt) + vix integer
    return m.label + "|" + m.stage + "|" + Math.round((m.score||0)/5) + "|" + vixBucket;
  }

  function fetchData(){
    if(typeof navigator!="undefined" && navigator.onLine==false){ setStatus("offline"); return; }
    var myId = ++reqIdRef.current;
    fetch("/api/market-mood-data")
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(myId != reqIdRef.current) return;  // stale response, ignore
        if(!d || !d.ok){ setStatus("error"); return; }
        var m = computeMoodScore(d);
        setData(d); setMood(m); setStatus("ok"); setLastUpdated(Date.now());
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
      })
      .catch(function(){ if(myId==reqIdRef.current) setStatus("error"); });
  }

  function fetchAi(m, d){
    fetch("/api/market-mood-ai",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ mood:m, data:d, session:d.session })
    })
      .then(function(r){ return r.json(); })
      .then(function(res){ if(res && res.ok && res.ai) setAi(res.ai); })
      .catch(function(){ /* AI optional; keep deterministic mood */ });
  }

  useEffect(function(){
    fetchData(); // initial
    var t = setInterval(fetchData, DATA_INTERVAL);
    function onOnline(){ fetchData(); }
    try{ window.addEventListener("online", onOnline); }catch(e){}
    return function(){
      clearInterval(t);
      reqIdRef.current++; // invalidate in-flight
      try{ window.removeEventListener("online", onOnline); }catch(e){}
    };
  }, []);

  return {
    data:data, mood:mood, ai:ai, status:status, lastUpdated:lastUpdated,
    session:data && data.session
  };
}
