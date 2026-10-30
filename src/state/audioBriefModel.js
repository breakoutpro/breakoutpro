// BreakoutPro - audioBriefModel.js
// Builds the text for the 1-Min Market Audio Brief from VERIFIED context only: index quotes and commodity
// quotes already on screen (with their freshness) and the live headlines /api/news returned. Nothing is
// written that is not in those inputs. Returns null when there is nothing to say (the brief is then hidden).
// Input: { indices:[{label,value,chgPct,live}], commodities:[{label,chgPct,tag}], headlines:[string] }
// Rules: no backtick, no triple-equals, ASCII only.

var MAX_WORDS = 150;

function isNum(v){ return typeof v == "number" && isFinite(v); }

function move(p){
  if(!isNum(p)) return "";
  var a = Math.abs(p).toFixed(2);
  return p > 0 ? ", up " + a + " percent" : (p < 0 ? ", down " + a + " percent" : ", unchanged");
}

function spoken(label){
  return String(label).replace(/\bNIFTY\b/g, "Nifty").replace(/\bSENSEX\b/g, "Sensex").replace(/\bINDIA VIX\b/g, "India VIX").replace(/\bBANK\b/g, "Bank");
}

export function buildBrief(input){
  input = input || {};
  var idx = (input.indices || []).filter(function(i){ return i && isNum(i.value); });
  var com = (input.commodities || []).filter(function(i){ return i && isNum(i.chgPct); });
  var heads = (input.headlines || []).filter(function(h){ return typeof h == "string" && h.trim(); }).slice(0, 3);
  if(idx.length == 0 && heads.length == 0) return null;
  var parts = [];
  if(idx.length){
    var allLive = idx.every(function(i){ return i.live; });
    parts.push(allLive ? "Here is your market brief." : "Here is your market brief. These index values are not all live; they are the latest confirmed or delayed quotes.");
    idx.forEach(function(i){
      parts.push(spoken(i.label) + " at " + i.value.toLocaleString("en-IN", { maximumFractionDigits:2 }) + move(i.chgPct) + ".");
    });
  } else {
    parts.push("Here is your market brief. Index quotes are unavailable right now.");
  }
  if(com.length){
    parts.push(com.map(function(c){ return c.label + move(c.chgPct) + (c.tag ? ", " + c.tag : ""); }).join("; ") + ".");
  }
  if(heads.length){
    parts.push("Top headlines.");
    heads.forEach(function(h){ parts.push(h.replace(/\s+/g, " ").trim().replace(/[.!?]*$/, ".")); });
  } else {
    parts.push("No verified headlines are available right now.");
  }
  parts.push("This is educational information, not investment advice.");
  var words = parts.join(" ").split(/\s+/);
  var text = words.length > MAX_WORDS ? words.slice(0, MAX_WORDS).join(" ") + "." : words.join(" ");
  return { text:text, words:Math.min(words.length, MAX_WORDS), seconds:Math.max(10, Math.round(Math.min(words.length, MAX_WORDS) / 2.5)) };
}
