// BreakoutPro - src/utils/briefingSession.js
// Pure, IST-safe session classifier for the Dynamic AI Briefing card only.
// Not a duplicate of Market Mood's marketSession() - that one lives
// server-side in api/market-mood-data.js and is not client-importable;
// this mirrors its proven UTC->IST math but applies the Briefing's own
// 5-state boundary set (different states, different purpose - narrative,
// not deterministic score). No timer, no Date.now() polling here - the
// caller decides when to re-evaluate.
// Rules: no backtick, no ===, ASCII only.

// Start-inclusive / end-exclusive boundaries, IST minutes since midnight.
var MORNING_START = 5*60;      // 05:00
var LIVE_START    = 9*60+15;   // 09:15
var CLOSE_START   = 15*60+30;  // 15:30
var PREP_START    = 19*60;     // 19:00
var GLOBAL_START  = 23*60+30;  // 23:30

export function getBriefingSession(d){
  var now = d || new Date();
  var utcMin = now.getUTCHours()*60 + now.getUTCMinutes();
  var istMin = (utcMin + 330) % 1440;
  var dayShift = (utcMin + 330) >= 1440 ? 1 : 0;
  var dow = (now.getUTCDay() + dayShift) % 7; // 0 Sun .. 6 Sat, IST-adjusted

  if(dow==0 || dow==6) return "GLOBAL"; // weekend, all hours

  if(istMin>=MORNING_START && istMin<LIVE_START) return "MORNING";
  if(istMin>=LIVE_START && istMin<CLOSE_START) return "LIVE";
  if(istMin>=CLOSE_START && istMin<PREP_START) return "CLOSE";
  if(istMin>=PREP_START && istMin<GLOBAL_START) return "PREP";
  return "GLOBAL"; // 23:30-24:00 and 00:00-05:00
}

export var BRIEFING_META = {
  MORNING: { title:"Morning Brief",        icon:"&#9728;" },
  LIVE:    { title:"Live Market Brief",    icon:"&#128200;" },
  CLOSE:   { title:"Market Close Summary", icon:"&#127937;" },
  PREP:    { title:"Tomorrow Preparation", icon:"&#128197;" },
  GLOBAL:  { title:"Global Market Watch",  icon:"&#127760;" }
};
