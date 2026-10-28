// BreakoutPro - src/gann/gannStore.js
// Saved Gann 1x1 lines, kept in this browser (localStorage key bp_gann_lines), the same way the
// watchlist (bp_watchlist) is kept. One line per instrument and timeframe. Everything read back is
// re-validated, so a damaged or hand-edited value can never produce a line.
// Alert rules built from a line live on the server with the owner's other Smart Alerts rules.
// Rules: no backtick, no triple-equals, ASCII only.

import { validateLine, isGannTf } from "./gannMath.js";

export var KEY = "bp_gann_lines";
export var MAX_LINES = 12;

function hasStorage(st){ return !!st && typeof st.getItem == "function"; }
function defaultStorage(){ try{ return typeof localStorage != "undefined" ? localStorage : null; }catch(e){ return null; } }

export function lineKey(sym, tf){ return String(sym) + "|" + String(tf); }

// Returns a clean line or null.
export function cleanLine(x, now){
  if(!x || typeof x != "object") return null;
  var line = {
    id: typeof x.id == "string" && /^[a-z0-9]{6,24}$/.test(x.id) ? x.id : null,
    sym: typeof x.sym == "string" && /^[A-Z][A-Z0-9&-]{0,19}$/.test(x.sym) ? x.sym : null,
    label: typeof x.label == "string" ? x.label.slice(0, 24).replace(/[^\x20-\x7E]/g, "") : "",
    tf: x.tf, kind: x.kind, anchorT: x.anchorT, anchorPrice: x.anchorPrice, scale: x.scale,
    scaleMode: x.scaleMode == "auto" ? "auto" : "manual",
    createdAt: typeof x.createdAt == "number" ? x.createdAt : (now || 0),
    updatedAt: typeof x.updatedAt == "number" ? x.updatedAt : (now || 0)
  };
  if(!line.id || !line.sym || !isGannTf(line.tf)) return null;
  if(!validateLine(line, null).ok) return null;
  return line;
}

export function loadLines(storage){
  var st = storage || defaultStorage();
  if(!hasStorage(st)) return [];
  try{
    var raw = st.getItem(KEY);
    if(!raw) return [];
    var arr = JSON.parse(raw);
    if(!Array.isArray(arr)) return [];
    var out = [], seen = {};
    for(var i = 0; i < arr.length && out.length < MAX_LINES; i++){
      var c = cleanLine(arr[i], 0);
      if(!c) continue;
      var k = lineKey(c.sym, c.tf);
      if(seen[k]) continue;
      seen[k] = 1; out.push(c);
    }
    return out;
  }catch(e){ return []; }
}
function persist(list, storage){
  var st = storage || defaultStorage();
  if(!hasStorage(st)) return false;
  try{ st.setItem(KEY, JSON.stringify(list)); }catch(e){ return false; }
  try{ if(typeof window != "undefined" && window.dispatchEvent) window.dispatchEvent(new CustomEvent("bp_gann_change")); }catch(e){}
  return true;
}
export function findLine(list, sym, tf){
  for(var i = 0; i < list.length; i++){ if(list[i].sym == sym && list[i].tf == tf) return list[i]; }
  return null;
}
export function newId(rand){
  var r = typeof rand == "function" ? rand : Math.random;
  var s = "";
  var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < 10; i++) s += chars.charAt(Math.floor(r() * chars.length) % chars.length);
  return s;
}

// Save (insert or replace the line for this instrument + timeframe). Returns { ok, line, list, reason }.
export function saveLine(input, opts){
  opts = opts || {};
  var now = opts.now != null ? opts.now : Date.now();
  var list = loadLines(opts.storage);
  var existing = findLine(list, input && input.sym, input && input.tf);
  var cand = Object.assign({}, input, {
    id: existing ? existing.id : (input && input.id) || newId(opts.rand),
    createdAt: existing ? existing.createdAt : now, updatedAt: now
  });
  var clean = cleanLine(cand, now);
  if(!clean) return { ok:false, reason:"invalid_line", list:list };
  if(!existing && list.length >= MAX_LINES) return { ok:false, reason:"limit", list:list };
  var next = existing ? list.map(function(l){ return l.id == existing.id ? clean : l; }) : list.concat([clean]);
  if(!persist(next, opts.storage)) return { ok:false, reason:"storage", list:list };
  return { ok:true, line:clean, list:next };
}
export function removeLine(id, opts){
  opts = opts || {};
  var list = loadLines(opts.storage);
  var next = list.filter(function(l){ return l.id != id; });
  if(next.length == list.length) return { ok:false, reason:"not_found", list:list };
  if(!persist(next, opts.storage)) return { ok:false, reason:"storage", list:list };
  return { ok:true, list:next };
}
