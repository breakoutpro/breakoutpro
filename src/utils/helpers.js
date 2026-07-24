export var G = "#00C853";
export var R = "#EF4444";
export var DISCLAIMER = "Educational only. Not SEBI registered. Not investment advice.";

export function nowT(d) {
  return (d || new Date()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
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
export function getSpark(ltp) {
  var a = [];
  for (var i = 0; i < 14; i++) a.push(ltp + sg() * rnd(0, ltp * 0.005) * i);
  return a;
}
export function localAI(q, AI_KB, CANDLES) {
  var ql = q.toLowerCase().trim();
  var SUFFIX = " --- Educational only | Not SEBI registered";

  // 1. Direct key match
  var keys = Object.keys(AI_KB);
  for (var i = 0; i < keys.length; i++) {
    if (ql.indexOf(keys[i]) != -1) return AI_KB[keys[i]] + SUFFIX;
  }

  // 2. Keyword extraction - "explain X" or "what is X" -> search for X
  var stripped = ql
    .replace("explain ", "")
    .replace("what is ", "")
    .replace("what are ", "")
    .replace("tell me about ", "")
    .replace("define ", "")
    .trim();

  for (var j = 0; j < keys.length; j++) {
    var keyWord = keys[j].replace("what is ", "").replace("explain ", "");
    if (stripped.indexOf(keyWord) != -1 || keyWord.indexOf(stripped) != -1) {
      return AI_KB[keys[j]] + SUFFIX;
    }
  }

  // 3. Candle pattern match
  for (var k = 0; k < CANDLES.length; k++) {
    if (ql.indexOf(CANDLES[k].name.toLowerCase()) != -1) {
      return CANDLES[k].name + " (" + CANDLES[k].type + "): " + CANDLES[k].desc + SUFFIX;
    }
  }

  return null;
}
