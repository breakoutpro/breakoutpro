// BreakoutPro - marketStatus.js
// Single source for market status (IST). Reused by badges, notifications, alerts.
// Rules: no backtick, no triple-equals, ASCII.

// Returns current IST Date parts.
function istNow(){
  var now=new Date();
  // IST = UTC + 5:30
  var utc=now.getTime()+now.getTimezoneOffset()*60000;
  return new Date(utc+(5.5*3600000));
}

// status: preopen | open | closed | muhurat | weekend
export function getMarketStatus(){
  var d=istNow();
  var day=d.getDay(); // 0 Sun .. 6 Sat
  var mins=d.getHours()*60+d.getMinutes();
  var open=9*60+15;      // 09:15
  var close=15*60+30;    // 15:30
  var preStart=9*60;     // 09:00
  if(day==0||day==6) return {status:"weekend",label:"Closed",note:"Weekend",color:"#5B6472",live:false};
  if(mins>=preStart&&mins<open) return {status:"preopen",label:"Pre-Open",note:"09:00-09:15",color:"#F59E0B",live:true};
  if(mins>=open&&mins<close) return {status:"open",label:"Market Open",note:"Live",color:"#22C55E",live:true};
  return {status:"closed",label:"Closed",note:"Opens 09:15 IST",color:"#EF4444",live:false};
}

export function isMarketLive(){ var s=getMarketStatus(); return s.live; }
