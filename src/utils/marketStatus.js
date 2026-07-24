// BreakoutPro - marketStatus.js
// Single source for market status (IST). Reused by badges, notifications, alerts.
// Rules: no backtick, no triple-equals, ASCII.

// NSE/BSE equity-segment trading holidays for 2026 (weekday closures only -
// weekends are handled separately below). Source: NSE/BSE official holiday
// circulars, cross-checked via Sahi's holiday tracker (sahi.com), last
// verified current as of July 2026. This list needs a full refresh at the
// start of every calendar year once the exchanges publish the new circular.
var TRADING_HOLIDAYS_2026 = [
  "2026-01-15", // Maharashtra Municipal Corporation Election
  "2026-01-26", // Republic Day
  "2026-03-03", // Holi
  "2026-03-26", // Ram Navami
  "2026-03-31", // Mahavir Jayanti
  "2026-04-03", // Good Friday
  "2026-04-14", // Dr. Ambedkar Jayanti
  "2026-05-01", // Maharashtra Day
  "2026-05-28", // Bakri Id (Eid ul-Adha)
  "2026-06-26", // Muharram
  "2026-09-14", // Ganesh Chaturthi
  "2026-10-02", // Gandhi Jayanti
  "2026-10-20", // Dussehra
  "2026-11-10", // Diwali Balipratipada
  "2026-11-24", // Guru Nanak Jayanti
  "2026-12-25"  // Christmas
];

// Muhurat Trading dates (Diwali Laxmi Pujan special session) - NSE announces
// this annually via official circular; the exact one-hour window is notified
// closer to the date each year. Source for 2026: NSE circular CMTR71775
// (nsearchives.nseindia.com), confirmed Sunday, November 8, 2026.
// This list needs a new entry added every year once NSE publishes the date.
var MUHURAT_DATES = [
  "2026-11-08"
];

// Returns current IST Date parts.
function istNow(){
  var now=new Date();
  // IST = UTC + 5:30
  var utc=now.getTime()+now.getTimezoneOffset()*60000;
  return new Date(utc+(5.5*3600000));
}

function isoDate(d){
  var y=d.getFullYear();
  var m=d.getMonth()+1; m=m<10?"0"+m:""+m;
  var day=d.getDate(); day=day<10?"0"+day:""+day;
  return y+"-"+m+"-"+day;
}

function minsToClock(totalMins){
  var h=Math.floor(totalMins/60)%24;
  var m=totalMins%60;
  var hh=h<10?"0"+h:""+h;
  var mm=m<10?"0"+m:""+m;
  return hh+":"+mm;
}

function countdownText(fromMins, toMins, prefix){
  var diff=toMins-fromMins;
  if(diff<0) diff+=24*60;
  var h=Math.floor(diff/60), m=diff%60;
  var parts=[];
  if(h>0) parts.push(h+"h");
  parts.push(m+"m");
  return prefix+" "+parts.join(" ");
}

// status: preopen | open | postclose | closed | muhurat | muhurat_upcoming | weekend
export function getMarketStatus(){
  var d=istNow();
  var day=d.getDay(); // 0 Sun .. 6 Sat
  var mins=d.getHours()*60+d.getMinutes();
  var today=isoDate(d);
  var open=9*60+15;      // 09:15
  var close=15*60+30;    // 15:30
  var postCloseEnd=16*60; // 16:00 - brief post-close settlement window
  var preStart=9*60;     // 09:00
  var muhuratStart=13*60+45; // 13:45 (typical published window - exact time is
  var muhuratEnd=14*60+45;   // 14:45  re-notified by NSE each year closer to the date)

  if(MUHURAT_DATES.indexOf(today)>=0){
    if(mins>=muhuratStart&&mins<muhuratEnd) return {status:"muhurat", label:"Muhurat Trading", note:"Special Diwali Session", color:"#008F39", live:true, countdown:countdownText(mins,muhuratEnd,"Closes in")};
    if(mins<muhuratStart) return {status:"muhurat_upcoming", label:"Muhurat Trading Today", note:"Session begins soon", color:"#5B6472", live:false, countdown:countdownText(mins,muhuratStart,"Starts in")};
    return {status:"closed", label:"Closed", note:"Muhurat session ended", color:"#EF4444", live:false, countdown:countdownText(mins,open+24*60,"Opens in")};
  }
  if(day==0||day==6) return {status:"weekend",label:"Closed",note:"Weekend",color:"#5B6472",live:false,countdown:"Opens Monday " + minsToClock(open) + " IST"};
  if(TRADING_HOLIDAYS_2026.indexOf(today)>=0) return {status:"holiday",label:"Market Holiday",note:"Exchange closed today",color:"#5B6472",live:false,countdown:"Check next trading day"};
  if(mins>=preStart&&mins<open) return {status:"preopen",label:"Pre-Open",note:"09:00-09:15",color:"#5B6472",live:true,countdown:countdownText(mins,open,"Market opens in")};
  if(mins>=open&&mins<close) return {status:"open",label:"Market Open",note:"Live",color:"#22C55E",live:true,countdown:countdownText(mins,close,"Market closes in")};
  if(mins>=close&&mins<postCloseEnd) return {status:"postclose",label:"Post-Close",note:"Settlement window",color:"#5B6472",live:false,countdown:"Next session tomorrow "+minsToClock(open)+" IST"};
  return {status:"closed",label:"Closed",note:"Opens 09:15 IST",color:"#EF4444",live:false,countdown:countdownText(mins,open+24*60,"Opens in")};
}

export function isMarketLive(){ var s=getMarketStatus(); return s.live; }
