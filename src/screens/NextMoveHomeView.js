// BreakoutPro - NextMoveHomeView.js
// Pure view model for the compact Home "Next Move Intelligence" card.
// No React, no new calculation, no request: it only maps the existing
// NextMoveEngine result (prices, levels, status, freshness) to short display
// parts. A level, price or status that the engine did not produce is never
// shown, and nothing here derives a probability or a risk score.
// Rules: no backtick, no triple-equals, ASCII only.

import { fmtNum } from "./DirectionEngine.js";
import { textOf } from "./NextMoveView.js";

function finite(n){ return typeof n=="number" && isFinite(n); }

// bull / bear / side / none / unavail  ->  tone used for colour and glyph
export function directionOf(nm){
  if(!nm || nm.state!="ok") return "unavail";
  var a = nm.assessment;
  if(a=="upside" || a=="reversal_up") return "bull";
  if(a=="downside" || a=="reversal_dn") return "bear";
  if(a=="range") return "side";
  return "none";   // "wait": mixed or weak evidence is not the same claim as SIDEWAYS
}

// Which scenario carries the bias (for status and levels).
function biasScenario(nm, dir){
  if(!nm || !nm.scenarios) return null;
  if(dir=="bull") return nm.scenarios.bull;
  if(dir=="bear") return nm.scenarios.bear;
  return null;
}

// Two key levels, taken from the scenario values the engine already holds.
// bull: trigger = resistance, invalidation = support. bear: the reverse.
export function levelsOf(nm, dir, tfn){
  var out = [];
  if(!nm || nm.state!="ok" || !nm.scenarios || !nm.scenarios.bull) return out;
  var bull = nm.scenarios.bull, bear = nm.scenarios.bear;
  var res = bull.triggerLevel, sup = bull.invalidationLevel;
  function add(id, key, val, tone){
    var label = textOf(tfn, key);
    if(label && finite(val)) out.push({ id: id, label: label, value: fmtNum(val), raw: val, tone: tone });
  }
  if(dir=="bull"){
    add("trigger", "nmh.lv.trig_up", res, "bull");
    add("invalid", "nmh.lv.inv_dn", sup, "bear");
  } else if(dir=="bear"){
    add("trigger", "nmh.lv.trig_dn", bear ? bear.triggerLevel : null, "bear");
    add("invalid", "nmh.lv.inv_up", bear ? bear.invalidationLevel : null, "bull");
  } else {
    add("res", "nmh.lv.res", res, "bull");
    add("sup", "nmh.lv.sup", sup, "bear");
  }
  return out;
}

function fmtTime(ts){
  if(ts==null) return null;
  try{
    return new Date(ts).toLocaleString("en-IN", { timeZone:"Asia/Kolkata", day:"numeric", month:"short", hour:"numeric", minute:"2-digit", hour12:true });
  }catch(e){ return null; }
}

export function pctText(p){
  if(!finite(p)) return "";
  return (p>=0 ? "+" : "") + p.toFixed(2) + "%";
}

export function buildHomeView(nm, tfn){
  var dir = directionOf(nm);
  var ok = !!nm && nm.state=="ok";
  var v = {
    dir: dir,
    dirText: textOf(tfn, "nmh.dir." + dir),
    headline: ok ? textOf(tfn, "nm.assess." + nm.assessment) : textOf(tfn, "nm.assess.unavailable"),
    price: null, levels: [], setup: null,
    quote: { status: "UNAVAILABLE", chip: "UNAVAILABLE", live: false },
    behind: false, dataWarn: "", conf: textOf(tfn, "nm.conf"),
    basis: textOf(tfn, "nmh.basis"),
    disclaimer: textOf(tfn, "nmh.disc"),
    missing: ""
  };
  if(!nm) return v;
  var f = nm.freshness;
  if(f){
    v.quote.status = f.quoteStatus || "UNAVAILABLE";
    v.behind = !!f.behind;
  }
  // chip: LIVE only when the engine itself calls the price live; a quote the
  // provider labels LIVE outside live conditions is shown as not live
  v.quote.chip = v.quote.status=="LIVE" ? "DELAYED" : v.quote.status;
  if(!ok){
    // unavailable: say what is missing, by the existing names, never a level
    var parts = [];
    var m = nm.missing || [];
    for(var i=0; i<m.length; i++){
      var nmName = m[i] && m[i].id ? textOf(tfn, "dir.in." + m[i].id) : "";
      if(nmName && parts.indexOf(nmName)<0) parts.push(nmName);
    }
    v.missing = parts.join(", ");
    return v;
  }
  var p = nm.price;
  if(p && finite(p.ltp)){
    v.quote.live = p.kind=="live";
    if(v.quote.live) v.quote.chip = "LIVE";
    v.price = {
      ltp: fmtNum(p.ltp),
      pct: pctText(p.chgPct),
      up: finite(p.chgPct) ? p.chgPct>=0 : null,
      kindText: textOf(tfn, p.kind=="live" ? "nm.price.live" : "nm.price.last"),
      asOf: fmtTime(p.asOf)
    };
  }
  v.levels = levelsOf(nm, dir, tfn);
  var sc = biasScenario(nm, dir);
  if(sc && sc.status){
    // confirmed daily-candle breakout vs a move that is only triggered / waiting
    v.setup = { status: sc.status, text: textOf(tfn, "nmh.sc." + sc.status) };
  }
  var st = v.quote.status;
  if(v.behind || st=="STALE" || st=="DELAYED"){
    v.dataWarn = textOf(tfn, "nmh.risk.data");
  }
  return v;
}
