// BreakoutPro - src/market/useQuotes.js
// React hook over the shared quote store. Re-renders when a refresh lands and once a
// minute so a label degrades (LIVE -> DELAYED -> STALE) without any new data arriving.
// Rules: no backtick, no triple-equals, ASCII only.
import { useState, useEffect, useRef } from "react";
import { sharedStore } from "./marketClient.js";

export function useQuotes(symbols){
  var key = (symbols || []).join("|");
  var [tick, setTick] = useState(0);
  var timer = useRef(null);
  useEffect(function(){
    var list = key ? key.split("|") : [];
    var stopped = false;
    var unsub = sharedStore.subscribe(list, function(){ if(!stopped) setTick(function(n){ return n + 1; }); });
    function loop(){
      if(stopped) return;
      var hidden = false;
      try{ hidden = typeof document != "undefined" && document.hidden; }catch(e){}
      if(!hidden) sharedStore.refresh();
      timer.current = setTimeout(loop, sharedStore.nextDelay());
    }
    timer.current = setTimeout(loop, sharedStore.nextDelay());
    var clock = setInterval(function(){ if(!stopped) setTick(function(n){ return n + 1; }); }, 60000);
    return function(){ stopped = true; unsub(); clearTimeout(timer.current); clearInterval(clock); };
  }, [key]);
  var list2 = key ? key.split("|") : [];
  return { quotes:sharedStore.read(list2), info:sharedStore.info(), tick:tick };
}
