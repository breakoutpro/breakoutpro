// BreakoutPro - NextMoveDetailView.js
// Pure view model for the "Detailed Analysis" section of Next Move Intelligence.
// No React, no theme and NO new calculation. Every value is copied from an
// existing, authoritative output:
//   evidence rows      NextMoveEngine evidence (from DirectionEngine signals)
//   indicators         NextMoveEngine detail.indicators (DirectionEngine d.tech: EMA 9/21 on daily candles)
//   data quality       NextMoveEngine detail.inputs (DirectionEngine d.inputs: provider timestamps + validated status)
//   market context     the existing mood score (useMarketMood), buildEvolution(), the VIX quote
//   structure timeline buildEvolution() flags + DirectionEngine tech.brk + the mood engine stage
// A row is created only when its source is present and not stale / unavailable /
// demo. Nothing is invented: missing data produces one short explanation, never
// an empty card or a blank bullet.
// Rules: no backtick, no triple-equals, ASCII only.

import { textOf } from "./NextMoveView.js";

var DASH = "\u2014";
var ESSENTIAL = { nifty_q: 1, nifty_h: 1 };

// ---- time (provider time, IST) ------------------------------------------------
export function fmtDay(ts){
  if(typeof ts!="number" || !isFinite(ts)) return "";
  try{ return new Date(ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" }); }catch(e){ return ""; }
}
export function fmtDateTime(ts){
  if(typeof ts!="number" || !isFinite(ts)) return "";
  try{ return new Date(ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true }); }catch(e){ return ""; }
}
function num(x){
  if(typeof x!="number" || !isFinite(x)) return "";
  try{ return x.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }catch(e){ return String(x); }
}
function usable(st){ return st=="LIVE" || st=="DELAYED" || st=="PARTIAL"; }
function inputOf(det, id){
  var list = (det && det.inputs) || [];
  for(var i=0; i<list.length; i++){ if(list[i].id==id) return list[i]; }
  return null;
}

// ---- Section A: evidence ----------------------------------------------------------
// Which input each signal depends on, and the name shown on the row.
var SIGNAL_MAP = {
  nifty_ema: ["NIFTY 50", "nifty_h"], nifty_cross: ["NIFTY 50", "nifty_h"], nifty_level: ["NIFTY 50", "nifty_h"], nifty_day: ["NIFTY 50", "nifty_q"],
  bn_ema: ["BANK NIFTY", "bn_h"], bn_cross: ["BANK NIFTY", "bn_h"], bn_level: ["BANK NIFTY", "bn_h"], bn_day: ["BANK NIFTY", "bn_q"],
  sectors: [null, "sectors", "nm.da.in.sectors"],
  vix: ["India VIX", "vix"], vix_high: ["India VIX", "vix"],
  crude: [null, "crude", "nm.da.in.crude"], crude_vol: [null, "crude", "nm.da.in.crude"],
  diverge: ["NIFTY 50 / BANK NIFTY", "nifty_q"]
};

function evidenceRow(item, det, tfn){
  var map = SIGNAL_MAP[item.id];
  if(!map) return null;
  var inp = inputOf(det, map[1]);
  if(!inp || !usable(inp.status) || !inp.used) return null;       // never a row from stale / missing / unused data
  var name = map[0] || textOf(tfn, map[2]);
  var text = textOf(tfn, item.key, item.vars);
  if(!name || !text) return null;
  var lead = name, rest;
  if(text.indexOf(name)==0){
    rest = text.slice(name.length).replace(/^:\s*/, " " + DASH + " ");
  } else {
    rest = " " + DASH + " " + text;
  }
  return { id: item.id, name: name, lead: lead, rest: rest, text: text, status: inp.status };
}

function evidenceGroup(items, det, tfn, seen){
  var rows = [];
  var arr = items || [];
  for(var i=0; i<arr.length; i++){
    var r = evidenceRow(arr[i], det, tfn);
    if(!r) continue;
    var key = r.name + "|" + r.text;
    if(seen[key]) continue;
    seen[key] = 1;
    rows.push(r);
  }
  return rows;
}

// ---- Section D: timeline ------------------------------------------------------------
var STRUCT_KEY = { "Higher highs": "hh", "Lower lows": "ll", "Range compressing": "rc" };
var EVENT_LABEL = {
  bo_confirmed: "nm.da.tl.bo_confirmed", bo_attempt: "nm.da.tl.bo_attempt",
  bd_confirmed: "nm.da.tl.bd", bd_attempt: "nm.da.tl.bd",
  failed_up: "nm.da.tl.failed", failed_dn: "nm.da.tl.failed"
};
function eventText(ev, tfn){
  var k = ev.kind;
  var vars = { lvl: num(ev.lvl) };
  if(k=="bo_attempt" || k=="bd_attempt") return textOf(tfn, "nm.da.tl.x." + k + "_" + (ev.note || "early"), vars);
  return textOf(tfn, "nm.da.tl.x." + k, vars);
}

function buildTimeline(nm, mood, evolution, tfn){
  var entries = [];
  var det = nm.detail || {};
  var essentialOk = nm.state=="ok";
  if(!essentialOk) return { entries: [], empty: textOf(tfn, "nm.da.tl.none") };
  // 1. structure observations from the existing 3-day evolution output
  if(evolution && evolution.available && evolution.structure){
    for(var i=0; i<evolution.structure.length; i++){
      var sk = STRUCT_KEY[evolution.structure[i]];
      if(!sk) continue;                                      // "No clear structure signal" is not an event
      var n = String(evolution.sessions || "");
      entries.push({
        id: "st_" + sk, label: textOf(tfn, "nm.da.tl." + sk),
        when: n ? textOf(tfn, "nm.da.tl.when", { n: n }) : "",
        text: textOf(tfn, "nm.da.tl.x." + sk, { n: n }),
        status: "historical", current: false
      });
    }
  }
  // 2. breakout / breakdown observations (same fields the scenarios use)
  var evs = det.events || [];
  for(var j=0; j<evs.length; j++){
    var e = evs[j];
    var lab = textOf(tfn, EVENT_LABEL[e.kind]);
    var tx = eventText(e, tfn);
    if(!lab || !tx) continue;
    entries.push({ id: "ev_" + e.kind, label: lab, when: fmtDay(e.ts), text: tx, status: e.status, current: false });
  }
  // 3. the stage the existing mood engine reports now
  if(mood && mood.score!=null && mood.stage){
    var stg = textOf(tfn, "stage." + mood.stage) || mood.stage;
    entries.push({ id: "current", label: textOf(tfn, "nm.da.tl.current", { s: stg }), when: "", text: textOf(tfn, "nm.da.tl.x.current"), status: "current", current: true });
  }
  var real = entries.filter(function(x){ return x.label && x.text; });
  if(!real.length) return { entries: [], empty: textOf(tfn, "nm.da.tl.none") };
  return { entries: real, empty: "" };
}

// ---- Section C: market context ----------------------------------------------------------
function structureNames(evolution, tfn){
  var out = [];
  if(!evolution || !evolution.available || !evolution.structure) return out;
  for(var i=0; i<evolution.structure.length; i++){
    var sk = STRUCT_KEY[evolution.structure[i]];
    if(sk){ var tx = textOf(tfn, "nm.da.tl." + sk); if(tx) out.push(tx); }
  }
  return out;
}

function buildContext(nm, mood, evolution, vixQuote, usingDemo, tfn){
  var det = nm.detail || {};
  var c = { available: false, stale: false, mood: null, score: null, stageText: "", trend: "", vix: null, sector: "", status: "UNAVAILABLE", asOf: "", unavailableText: textOf(tfn, "nm.da.c.unavail") };
  if(usingDemo || !mood || mood.score==null) return c;
  c.available = true;
  var qs = nm.freshness && nm.freshness.quoteStatus ? nm.freshness.quoteStatus : "UNAVAILABLE";
  c.status = nm.price && nm.price.kind=="live" ? "LIVE" : qs;
  c.asOf = nm.freshness ? fmtDateTime(nm.freshness.quoteAsOf) : "";
  c.stale = !(nm.state=="ok" && usable(qs));
  c.mood = textOf(tfn, "mood." + mood.label) || mood.label;
  c.score = textOf(tfn, "home.ai_score", { n: mood.score });
  c.stageText = mood.stage ? (textOf(tfn, "stage." + mood.stage) || mood.stage) : "";
  var parts = [];
  if(c.stageText) parts.push(c.stageText);
  if(evolution && evolution.available && evolution.return3dPct){ parts.push(textOf(tfn, "nm.da.c.r3", { p: evolution.return3dPct })); }
  var sn = structureNames(evolution, tfn);
  if(sn.length) parts.push(sn.join(", "));
  c.trend = parts.join(" \u00b7 ");
  // India VIX: only a number the engine accepted as current
  var vi = inputOf(det, "vix");
  if(vixQuote && typeof vixQuote.ltp=="number"){
    var ok = !!(vi && usable(vi.status) && vi.used);
    c.vix = { value: num(vixQuote.ltp), status: vi ? vi.status : "UNAVAILABLE", ok: ok, asOf: vi ? fmtDateTime(vi.asOf) : "" };
  }
  // Sector participation: only when the engine used verified, fresh sector data
  var si = inputOf(det, "sectors");
  if(si && usable(si.status) && si.used){
    var all = (nm.evidence.forTxt || []).concat(nm.evidence.against || []);
    for(var k=0; k<all.length; k++){
      if(all[k].id=="sectors"){ c.sector = textOf(tfn, all[k].key, all[k].vars); break; }
    }
  }
  return c;
}

// ---- Section E: data quality --------------------------------------------------------------
var QUALITY_ORDER = ["nifty_q", "nifty_h", "bn_q", "bn_h", "vix", "sectors", "intraday", "volume", "options", "news", "breadth", "crude", "natgas", "fiidii"];
var CANDLE = { nifty_h: 1, bn_h: 1 };
// Inputs the engine has no connection for at all: shown honestly as unavailable.
var NOT_CONNECTED = { intraday: 1, options: 1 };

function buildQuality(nm, tfn){
  var det = nm.detail || {};
  var rows = [];
  var essentialNames = [], essentialMissing = [], optionalOut = [], optionalUsed = [];
  for(var i=0; i<QUALITY_ORDER.length; i++){
    var id = QUALITY_ORDER[i];
    var name = textOf(tfn, "nm.da.in." + id);
    if(!name) continue;
    var row = { id: id, name: name, status: "UNAVAILABLE", time: "", used: false, reason: "" };
    if(det.demo){
      row.status = "DEMO";
      row.reason = "";
    } else if(NOT_CONNECTED[id]){
      row.reason = "no_provider";
    } else {
      var inp = inputOf(det, id);
      if(inp){
        row.status = inp.status;
        row.used = !!inp.used;
        row.reason = inp.used ? "" : (inp.reason || "");
        if(inp.asOf!=null) row.time = CANDLE[id] ? fmtDay(inp.asOf) : fmtDateTime(inp.asOf);
      } else {
        row.reason = "unavailable";
      }
    }
    rows.push(row);
    if(ESSENTIAL[id]){ (row.used ? essentialNames : essentialMissing).push(name); }
    else if(!row.used){ optionalOut.push(name); }
    else { optionalUsed.push(name); }
  }
  var reliab;
  if(nm.state!="ok") reliab = "low";
  else if(det.timeUncertain) reliab = "unc";
  else if(optionalOut.length && optionalUsed.length < rows.length) reliab = "partial";
  else reliab = "ok";
  return {
    rows: rows,
    essentialUsed: essentialNames.join(", "),
    essentialMissing: essentialMissing.join(", "),
    optionalExcluded: optionalOut.join(", "),
    reliabKey: reliab,
    reliab: textOf(tfn, "nm.da.e.rel." + reliab)
  };
}

// ---- Section B: indicators ------------------------------------------------------------------
function buildIndicators(nm, tfn){
  var det = nm.detail || {};
  var out = [];
  var list = det.indicators || [];
  for(var i=0; i<list.length; i++){
    var r = list[i];
    var name = r.id=="nifty" ? "NIFTY 50" : "BANK NIFTY";
    var have = r.close!=null && r.ema9!=null && r.ema21!=null;
    out.push({
      id: r.id, name: name, have: have,
      price: have ? num(r.close) : DASH, ema9: have ? num(r.ema9) : DASH, ema21: have ? num(r.ema21) : DASH,
      interpKey: r.interp, interp: textOf(tfn, "nm.da.ind." + r.interp),
      forming: !!(have && r.forming),
      candle: have && r.candleTs ? textOf(tfn, "nm.da.ind.candle", { t: fmtDay(r.candleTs) }) : (r.asOf!=null ? textOf(tfn, "nm.da.ind.candle", { t: fmtDay(r.asOf) }) : ""),
      status: det.demo ? "DEMO" : r.status
    });
  }
  return out;
}

// ---- main ---------------------------------------------------------------------------------------
export function buildDetailView(args, tfn){
  var nm = args.nm;
  var v = {
    evidence: { mode: "neutral", available: false, groups: [] },
    indicators: [], context: null, timeline: { entries: [], empty: "" }, quality: null, how: []
  };
  if(!nm) return v;
  var det = nm.detail || {};

  // A. evidence (only from usable inputs; nothing when the essential data is stale / missing)
  var mode = nm.evidence && nm.evidence.mode=="directional" ? "directional" : "neutral";
  v.evidence.mode = mode;
  v.evidence.available = nm.state=="ok";
  if(nm.state=="ok"){
    var seen = {};
    var first = evidenceGroup(nm.evidence.forTxt, det, tfn, seen);
    var second = evidenceGroup((nm.evidence.against || []).concat(nm.evidence.caveats || []), det, tfn, seen);
    var t1 = mode=="directional" ? "nm.da.ev.sup" : "nm.da.ev.bull";
    var t2 = mode=="directional" ? "nm.da.ev.conf" : "nm.da.ev.bear";
    v.evidence.groups = [
      { id: "first", title: textOf(tfn, t1), rows: first, empty: textOf(tfn, mode=="directional" ? "nm.da.ev.none.sup" : "nm.da.ev.none.bull") },
      { id: "second", title: textOf(tfn, t2), rows: second, empty: textOf(tfn, mode=="directional" ? "nm.da.ev.none.conf" : "nm.da.ev.none.bear") }
    ];
  }
  v.evidence.unavailText = textOf(tfn, "nm.da.ev.unavail");

  v.indicators = buildIndicators(nm, tfn);
  v.context = buildContext(nm, args.mood, args.evolution, args.vixQuote, !!args.usingDemo, tfn);
  v.timeline = buildTimeline(nm, args.usingDemo ? null : args.mood, args.evolution, tfn);
  v.quality = buildQuality(nm, tfn);
  for(var i=1; i<=5; i++){ var tx = textOf(tfn, "nm.da.f." + i); if(tx) v.how.push(tx); }
  return v;
}
