export var G = "#00C853";
export var R = "#EF4444";
export var GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";
export var DISCLAIMER = "Educational only. Not SEBI registered. Not investment advice.";

export function nowT() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
export function fN(n) {
  var num = parseFloat(n) || 0;
  if (num >= 10000000) return (num / 10000000).toFixed(2) + "Cr";
  if (num >= 100000) return (num / 100000).toFixed(2) + "L";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toFixed(2);
}
export function rnd(a, b) { return Math.random() * (b - a) + a; }
export function sg() { return Math.random() > 0.5 ? 1 : -1; }
export function getMkt() {
  var m = new Date().getHours() * 60 + new Date().getMinutes();
  if (m >= 555 && m < 930) return { open: true, label: "Market Open" };
  return { open: false, label: "Market Closed" };
}
export function getSpark(ltp) {
  var a = [];
  for (var i = 0; i < 14; i++) a.push(ltp + sg() * rnd(0, ltp * 0.005) * i);
  return a;
}
export function localAI(q, AI_KB, CANDLES) {
  var ql = q.toLowerCase();
  var keys = Object.keys(AI_KB);
  for (var i = 0; i < keys.length; i++) {
    if (ql.indexOf(keys[i]) !== -1) return AI_KB[keys[i]] + " --- Educational only | Not SEBI registered";
  }
  for (var j = 0; j < CANDLES.length; j++) {
    if (ql.indexOf(CANDLES[j].name.toLowerCase()) !== -1)
      return CANDLES[j].name + " (" + CANDLES[j].type + "): " + CANDLES[j].desc;
  }
  return null;
}
