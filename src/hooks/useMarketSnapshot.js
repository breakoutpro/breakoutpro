// BreakoutPro - single shared market-data hook. ALL Home widgets (Mobile,
// Tablet, Laptop, Desktop) consume this ONE source - no widget fetches
// market data independently. Backend: FastAPI /api/market-snapshot
// (backend/main.py, testing/private-beta only, YFinanceProvider).
// Never returns fake/fallback prices - null price + status:"unavailable"
// when the backend can't provide a real value.
import { useState, useEffect, useRef } from "react";

var BACKEND_URL = "/api/market-snapshot"; // adjust if FastAPI is hosted separately in testing
var POLL_MS = 15000;

export function useMarketSnapshot(){
  var [snapshot, setSnapshot] = useState(null);
  var [status, setStatus] = useState("loading"); // loading | ok | unavailable
  var timerRef = useRef(null);

  useEffect(function(){
    var cancelled = false;
    function poll(){
      fetch(BACKEND_URL).then(function(r){
        if(!r.ok) throw new Error("bad status");
        return r.json();
      }).then(function(data){
        if(cancelled) return;
        setSnapshot(data);
        setStatus(data && data.status==="ok" ? "ok" : "unavailable");
      }).catch(function(){
        if(cancelled) return;
        setStatus("unavailable");
      });
    }
    poll();
    timerRef.current = setInterval(poll, POLL_MS);
    return function(){ cancelled = true; clearInterval(timerRef.current); };
  }, []);

  return { snapshot: snapshot, status: status };
}
