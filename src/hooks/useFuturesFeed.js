// src/hooks/useFuturesFeed.js
//
// Standalone hook for live NFO futures ticks. NOT imported by
// EquityHomeDesktop/Laptop/Mobile, RangeIntelligence, or OptionsIntel - it
// is delivered separately so nothing in the existing Home/Range/Options UI
// is touched. Wire it into a component yourself when you're ready.
//
// Usage:
//   var ticks = useFuturesFeed(); // { [token]: normalizedTick }
//
// Falls back to REST polling via /api/futures-data if the live relay isn't
// configured yet (api/futures-feed-token.js returns ok:false) - this is
// polling REAL data on an interval, not a fake value, just a lower-frequency
// version of the same real feed until the WebSocket relay is deployed.

import { useState, useEffect, useRef } from "react";

var POLL_SYMBOLS = "NIFTY,BANKNIFTY"; // adjust to whatever underlyings you want when you wire this in
var POLL_INTERVAL_MS = 5000;

export function useFuturesFeed(){
  var [ticks, setTicks] = useState({});
  var wsRef = useRef(null);

  useEffect(function(){
    var cancelled = false;
    var pollTimer = null;

    function startPolling(){
      function poll(){
        fetch("/api/futures-data?symbols=" + POLL_SYMBOLS)
          .then(function(r){ return r.json(); })
          .then(function(json){
            if(cancelled || !json || !json.results) return;
            setTicks(function(prev){
              var next = Object.assign({}, prev);
              json.results.forEach(function(r){
                if(r.ok && r.data) next[r.data.symbol || r.data.expiry] = r.data;
              });
              return next;
            });
          })
          .catch(function(){ /* leave last-known state - never invent a value on failure */ });
      }
      poll();
      pollTimer = setInterval(poll, POLL_INTERVAL_MS);
    }

    function startLiveSocket(wsUrl){
      var ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onmessage = function(evt){
        if(cancelled) return;
        try {
          var tick = JSON.parse(evt.data);
          setTicks(function(prev){
            var next = Object.assign({}, prev);
            next[tick.token] = tick;
            return next;
          });
        } catch(e){ /* drop malformed frame */ }
      };
      ws.onclose = function(){
        if(!cancelled) startPolling(); // relay dropped - fall back to real REST polling, not a fake state
      };
      ws.onerror = function(){ ws.close(); };
    }

    fetch("/api/futures-feed-token")
      .then(function(r){ return r.json(); })
      .then(function(json){
        if(cancelled) return;
        if(json.ok && json.wsUrl){
          startLiveSocket(json.wsUrl);
        } else {
          startPolling(); // relay not configured yet - real data via REST instead of no data at all
        }
      })
      .catch(function(){ startPolling(); });

    return function(){
      cancelled = true;
      if(wsRef.current) wsRef.current.close();
      if(pollTimer) clearInterval(pollTimer);
    };
  }, []);

  return ticks;
}

export default useFuturesFeed;
