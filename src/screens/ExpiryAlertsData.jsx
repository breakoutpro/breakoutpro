// BreakoutPro - ExpiryAlertsData.jsx
// Expiry Intelligence Smart Alerts: alert types, enable/disable prefs, history storage,
// in-app + browser push dispatch. Educational observation only. SEBI-safe.
// Rules: no backtick, no triple-equals, ASCII only.

// The 8 supported expiry-intelligence alert types (observation-based).
export var EXPIRY_ALERT_TYPES = [
  {id:"gamma_blast", name:"Gamma Blast", icon:"&#128163;", desc:"Sharp gamma-driven move observed near expiry"},
  {id:"gamma_flip", name:"Gamma Flip", icon:"&#128260;", desc:"Dealer gamma polarity change observed"},
  {id:"writers_trap", name:"Writers Trap", icon:"&#129513;", desc:"Option writers under pressure observed"},
  {id:"call_wall_shift", name:"Call Wall Shift", icon:"&#128225;", desc:"Highest call OI strike shifted"},
  {id:"put_wall_shift", name:"Put Wall Shift", icon:"&#128737;", desc:"Highest put OI strike shifted"},
  {id:"max_pain_change", name:"Max Pain Change", icon:"&#127919;", desc:"Max pain level moved to a new strike"},
  {id:"iv_crush", name:"IV Crush", icon:"&#128201;", desc:"Rapid implied volatility drop observed"},
  {id:"short_covering", name:"Short Covering", icon:"&#128316;", desc:"Short covering behaviour observed in OI"}
];

export function alertTypeName(id){
  for(var i=0;i<EXPIRY_ALERT_TYPES.length;i++){ if(EXPIRY_ALERT_TYPES[i].id==id) return EXPIRY_ALERT_TYPES[i].name; }
  return id;
}
export function alertTypeMeta(id){
  for(var i=0;i<EXPIRY_ALERT_TYPES.length;i++){ if(EXPIRY_ALERT_TYPES[i].id==id) return EXPIRY_ALERT_TYPES[i]; }
  return {id:id,name:id,icon:"&#128276;",desc:""};
}

// ---- ENABLE / DISABLE PREFERENCES (per alert type) ----
export function loadAlertPrefs(){
  try{
    var raw=localStorage.getItem("bp_expiry_alert_prefs");
    if(raw) return JSON.parse(raw);
  }catch(e){}
  // default: all enabled
  var d={};
  for(var i=0;i<EXPIRY_ALERT_TYPES.length;i++){ d[EXPIRY_ALERT_TYPES[i].id]=true; }
  return d;
}
export function saveAlertPrefs(prefs){
  try{ localStorage.setItem("bp_expiry_alert_prefs", JSON.stringify(prefs)); }catch(e){}
}

// ---- ALERT HISTORY (notification center) ----
export function loadAlertHistory(){
  try{
    var raw=localStorage.getItem("bp_expiry_alert_history");
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return [];
}
export function saveAlertHistory(list){
  try{ localStorage.setItem("bp_expiry_alert_history", JSON.stringify(list.slice(0,100))); }catch(e){}
}
export function clearAlertHistory(){
  try{ localStorage.removeItem("bp_expiry_alert_history"); }catch(e){}
}
export function markAllRead(){
  var h=loadAlertHistory();
  for(var i=0;i<h.length;i++){ h[i].read=true; }
  saveAlertHistory(h);
  return h;
}
export function unreadCount(){
  var h=loadAlertHistory();
  var c=0;
  for(var i=0;i<h.length;i++){ if(!h[i].read) c++; }
  return c;
}

// ---- TIME HELPER ----
function nowLabel(){
  try{
    var d=new Date();
    var hh=d.getHours(), mm=d.getMinutes();
    var ap=hh>=12?"PM":"AM";
    var h12=hh%12; if(h12==0) h12=12;
    var mmS=mm<10?"0"+mm:""+mm;
    return h12+":"+mmS+" "+ap;
  }catch(e){ return ""; }
}

// ---- BROWSER PUSH NOTIFICATION ----
export function sendBrowserPush(title, body){
  try{
    if(typeof Notification=="undefined") return;
    if(Notification.permission=="granted"){
      new Notification(title, {body:body, icon:"/icon-192.png"});
    }
  }catch(e){}
}
export function requestPushPermission(){
  try{
    if(typeof Notification!="undefined" && Notification.permission=="default"){
      Notification.requestPermission();
    }
  }catch(e){}
}

// ---- FIRE AN ALERT (records history, dispatches in-app + browser) ----
// alert = {type, symbol, detail}
export function fireExpiryAlert(alert){
  var prefs=loadAlertPrefs();
  if(!prefs[alert.type]) return false; // disabled by user
  var meta=alertTypeMeta(alert.type);
  var entry={
    id:"a"+Date.now()+Math.floor(Math.random()*1000),
    type:alert.type,
    name:meta.name,
    icon:meta.icon,
    symbol:alert.symbol||"NIFTY",
    detail:alert.detail||meta.desc,
    time:nowLabel(),
    ts:Date.now(),
    read:false
  };
  var h=loadAlertHistory();
  h.unshift(entry);
  saveAlertHistory(h);
  // in-app popup via custom event
  try{ window.dispatchEvent(new CustomEvent("bp_expiry_alert",{detail:entry})); }catch(e){}
  // browser push
  sendBrowserPush("Breakout Pro - "+meta.name, entry.symbol+": "+entry.detail);
  return true;
}

// ---- DEMO / SIMULATION (for testing the pipeline; observation-based) ----
export function simulateAlert(){
  var samples=[
    {type:"gamma_blast", symbol:"NIFTY", detail:"Sharp gamma-driven move observed near 24500"},
    {type:"gamma_flip", symbol:"BANKNIFTY", detail:"Dealer gamma polarity change observed at 52000"},
    {type:"writers_trap", symbol:"NIFTY", detail:"Call writers under pressure observed at 24600"},
    {type:"call_wall_shift", symbol:"NIFTY", detail:"Call wall shifted from 24500 to 24700"},
    {type:"put_wall_shift", symbol:"BANKNIFTY", detail:"Put wall shifted from 51000 to 51500"},
    {type:"max_pain_change", symbol:"NIFTY", detail:"Max pain moved to 24450"},
    {type:"iv_crush", symbol:"NIFTY", detail:"Implied volatility dropped sharply post-event"},
    {type:"short_covering", symbol:"BANKNIFTY", detail:"Short covering behaviour observed in OI"}
  ];
  var s=samples[Math.floor(Math.random()*samples.length)];
  fireExpiryAlert(s);
}
