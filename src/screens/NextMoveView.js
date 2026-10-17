// BreakoutPro - NextMoveView.js
// Pure view model for the Next Move Intelligence card and the Home summary.
// No React, no theme, no new calculation: it only turns the NextMoveEngine
// result into display strings through the existing i18n t().
//
// Why it exists: a card must never show an empty bullet, a scenario box with no
// content, a row with a missing label, or the same message twice. Everything
// that is displayed passes through these helpers, so the rule is enforced in
// one place and covered by tests.
// Rules: no backtick, no triple-equals, ASCII only.

import { fmtNum } from "./DirectionEngine.js";

// Translated text, or "" when the string is missing (empty, or the key echoed back).
export function textOf(tfn, key, vars){
  if(!key) return "";
  var s;
  try{ s = tfn(key, vars); }catch(e){ return ""; }
  if(s==null) return "";
  s = String(s).replace(/\s+/g, " ").trim();
  if(s=="" || s==key) return "";
  if(/\{\w+\}/.test(s)) return "";   // an unfilled placeholder is not a message
  return s;
}

// Display lines from engine items: empty text dropped, same text shown once.
// "seen" may be shared between lists that must not repeat each other.
export function cleanLines(items, tfn, seen){
  var out = [];
  var sn = seen || {};
  var arr = items || [];
  for(var i=0; i<arr.length; i++){
    var it = arr[i];
    if(!it) continue;
    var txt = textOf(tfn, it.key, it.vars);
    if(!txt || sn[txt]) continue;
    sn[txt] = 1;
    out.push(txt);
  }
  return out;
}

function finite(n){ return typeof n=="number" && isFinite(n); }

// One scenario: shown only when it has a real trigger level and at least one
// row with text. Otherwise null (the card renders nothing for it).
export function scenarioView(s, tfn){
  if(!s || !finite(s.triggerLevel)) return null;
  var rows = [];
  var defs = [["nm.lbl.trigger", s.trigger], ["nm.lbl.confirm", s.confirm], ["nm.lbl.invalid", s.invalid]];
  for(var i=0; i<defs.length; i++){
    var label = textOf(tfn, defs[i][0]);
    var body = defs[i][1] ? textOf(tfn, defs[i][1].key, defs[i][1].vars) : "";
    if(label && body) rows.push({ label: label, text: body });
  }
  if(!rows.length) return null;
  var st = textOf(tfn, "nm.st." + s.status);
  if(!st) return null;
  return { side: s.side, status: s.status, statusText: st, rows: rows };
}

// Inputs left out, as short readable text: "NIFTY 50 price (stale)".
export function missingText(list, tfn){
  var parts = [];
  var seen = {};
  var arr = list || [];
  for(var i=0; i<arr.length; i++){
    var x = arr[i];
    if(!x || !x.id) continue;
    var name = textOf(tfn, "dir.in." + x.id);
    if(!name || seen[name]) continue;
    seen[name] = 1;
    var why = x.reason ? textOf(tfn, "dir.r." + x.reason) : "";
    parts.push(why ? name + " (" + why + ")" : name);
  }
  return parts.join("; ");
}

export function buildNextMoveView(m, tfn){
  var v = {
    state: m ? m.state : "unavailable",
    assessment: m ? m.assessment : "unavailable",
    scenarios: [], range: "",
    forLines: [], againstLines: [], confirmLines: [], invalidateLines: [],
    excludedText: "", missingText: "", unverifiedText: "", reasons: [], why: ""
  };
  if(!m) return v;
  v.missingText = missingText(m.missing, tfn);
  v.excludedText = missingText(m.excluded, tfn);
  var unv = [];
  var u = m.unverified || [];
  for(var i=0; i<u.length; i++){ var tx = textOf(tfn, "nm.unv." + u[i]); if(tx) unv.push(tx); }
  v.unverifiedText = unv.join(" \u00b7 ");
  var rs = {};
  v.reasons = cleanLines(m.reasons, tfn, rs);
  if(m.state!="ok") return v;

  v.why = m.why ? textOf(tfn, m.why.key, m.why.vars) : "";
  var bull = scenarioView(m.scenarios && m.scenarios.bull, tfn);
  var bear = scenarioView(m.scenarios && m.scenarios.bear, tfn);
  if(bull) v.scenarios.push(bull);
  if(bear) v.scenarios.push(bear);
  var b = m.scenarios && m.scenarios.bull ? m.scenarios.bull.boundary : null;
  if(b && finite(b.support) && finite(b.resistance)){
    v.range = textOf(tfn, "nm.range", { sup: fmtNum(b.support), res: fmtNum(b.resistance) });
  }
  // Evidence for / against never repeat each other. Confirm / invalidate lists
  // are their own sections but also skip anything already shown above.
  var shown = {};
  v.forLines = cleanLines(m.evidence.forTxt, tfn, shown);
  v.againstLines = cleanLines(m.evidence.against.concat(m.evidence.caveats || []), tfn, shown);
  v.confirmLines = cleanLines(m.confirms, tfn, shown);
  v.invalidateLines = cleanLines(m.invalidates, tfn, shown);
  return v;
}

