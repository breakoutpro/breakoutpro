// BreakoutPro - src/alerts/alertRules.js
// Alert rule model + validation, shared by the browser and the Vercel functions.
// Pure: no DOM, no network, no storage. Educational alerts only: never an order or a
// buy/sell recommendation.
// Rules: no backtick, no triple-equals, ASCII only.

import { validateLine, GANN } from "../gann/gannMath.js";

export var INDEX_SYMBOLS = ["NIFTY", "BANKNIFTY"];       // monitored only when the user enables them
export var MAX_RULES = 30;
export var MAX_WATCHLIST = 25;

// Timeframes the data adapter can serve (keys match src/screens/BreakoutTfEngine.js). Daily bars are never called intraday.
export var TIMEFRAMES = {
  "5m":  { minutes:5,    intraday:true,  label:"5 min"  },
  "15m": { minutes:15,   intraday:true,  label:"15 min" },
  "1H":  { minutes:60,   intraday:true,  label:"1 hour" },
  "1D":  { minutes:1440, intraday:false, label:"Daily"  }
};

// group = filter chip on the screen
export var RULE_TYPES = {
  price_above:       { group:"level",    param:"value", dir:"up"   },
  price_below:       { group:"level",    param:"value", dir:"down" },
  pct_up:            { group:"action",   param:"pct",   dir:"up"   },
  pct_down:          { group:"action",   param:"pct",   dir:"down" },
  breakout:          { group:"action",   param:"none",  dir:"up"   },
  breakdown:         { group:"action",   param:"none",  dir:"down" },
  candle:            { group:"candle",   param:"patterns", dir:"any" },
  volume_spike:      { group:"volume",   param:"mult",  dir:"any"  },
  price_up_volume:   { group:"volume",   param:"mult",  dir:"up"   },
  price_down_volume: { group:"volume",   param:"mult",  dir:"down" },
  // Gann 1x1 line alerts (the line is built on the chart screen; see src/gann/gannMath.js)
  gann_near:         { group:"level",    param:"gann",  dir:"any"  },
  gann_close:        { group:"level",    param:"gann",  dir:"any"  },
  gann_any:          { group:"level",    param:"gann",  dir:"any"  }
};
export var GANN_TYPES = ["gann_near", "gann_close", "gann_any"];
export function isGannType(t){ return GANN_TYPES.indexOf(t) >= 0; }
export var GROUPS = ["candle", "action", "volume", "level"];

export var PATTERN_IDS = [
  "doji", "hammer", "shooting_star", "bullish_engulfing", "bearish_engulfing",
  "bullish_harami", "bearish_harami", "morning_star", "evening_star"
];

export var LIMITS = {
  VALUE_MIN: 0.05, VALUE_MAX: 10000000,
  PCT_MIN: 0.1, PCT_MAX: 50,
  MULT_MIN: 1.5, MULT_MAX: 20, MULT_DEFAULT: 2
};

var SYMBOL_RE = /^[A-Z][A-Z0-9&-]{0,19}$/;

// "NIFTY 50", "Bank Nifty", "reliance" -> canonical symbol or null
export function normalizeSymbol(raw){
  if(typeof raw != "string") return null;
  var s = raw.trim().toUpperCase().replace(/\.NS$/, "");
  if(s == "NIFTY 50" || s == "NIFTY50") s = "NIFTY";
  if(s == "BANK NIFTY" || s == "NIFTYBANK" || s == "NIFTY BANK") s = "BANKNIFTY";
  if(!SYMBOL_RE.test(s)) return null;
  return s;
}
export function isIndexSymbol(sym){ return INDEX_SYMBOLS.indexOf(sym) >= 0; }

// Clean a list of watchlist entries (strings or {sym}) to unique valid symbols.
export function cleanWatchlist(list){
  var out = [];
  if(!Array.isArray(list)) return out;
  for(var i = 0; i < list.length && out.length < MAX_WATCHLIST; i++){
    var raw = list[i];
    var s = normalizeSymbol(raw && typeof raw == "object" ? raw.sym : raw);
    if(s && out.indexOf(s) < 0) out.push(s);
  }
  return out;
}

// The only symbols that may be monitored: the user's own watchlist, plus NIFTY and
// BANKNIFTY when explicitly enabled. Nothing else is ever scanned.
export function allowedSymbols(watchlist, indicesEnabled){
  var out = cleanWatchlist(watchlist);
  if(indicesEnabled == true){
    INDEX_SYMBOLS.forEach(function(s){ if(out.indexOf(s) < 0) out.push(s); });
  }
  return out;
}
export function symbolAllowed(sym, watchlist, indicesEnabled){
  var s = normalizeSymbol(sym);
  if(!s) return false;
  return allowedSymbols(watchlist, indicesEnabled).indexOf(s) >= 0;
}

function num(v){
  if(typeof v == "string" && v.trim() != "") v = Number(v);
  return (typeof v == "number" && isFinite(v)) ? v : null;
}
function blank(v){ return v == null || (typeof v == "string" && v.trim() == ""); }
function round4(n){ return Math.round(n * 10000) / 10000; }

// input: { symbol, type, timeframe, params:{value|pct|mult|patterns}, enabled }
// ctx:   { watchlist, indicesEnabled } - when given, the symbol must be allowed.
// Returns { ok:true, rule } or { ok:false, errors:[code,...] } (codes, never raw text).
export function validateRuleInput(input, ctx){
  var errors = [];
  if(!input || typeof input != "object") return { ok:false, errors:["invalid_input"] };
  var symbol = normalizeSymbol(input.symbol);
  if(!symbol) errors.push("invalid_symbol");
  var def = (typeof input.type == "string" && Object.prototype.hasOwnProperty.call(RULE_TYPES, input.type)) ? RULE_TYPES[input.type] : null;
  if(!def) errors.push("invalid_type");
  var tf = (typeof input.timeframe == "string" && Object.prototype.hasOwnProperty.call(TIMEFRAMES, input.timeframe)) ? input.timeframe : null;
  var p = (input.params && typeof input.params == "object") ? input.params : {};
  var params = {};
  if(def){
    if(def.param == "value"){
      var v = num(p.value);
      if(v == null || v < LIMITS.VALUE_MIN || v > LIMITS.VALUE_MAX) errors.push("invalid_value"); else params.value = round4(v);
    } else if(def.param == "pct"){
      var pc = num(p.pct);
      if(pc == null || pc < LIMITS.PCT_MIN || pc > LIMITS.PCT_MAX) errors.push("invalid_pct"); else params.pct = round4(pc);
    } else if(def.param == "mult"){
      var m = blank(p.mult) ? LIMITS.MULT_DEFAULT : num(p.mult);
      if(m == null || m < LIMITS.MULT_MIN || m > LIMITS.MULT_MAX) errors.push("invalid_mult"); else params.mult = round4(m);
      if(input.type != "volume_spike"){
        var mv = blank(p.minMovePct) ? 0.3 : num(p.minMovePct);
        if(mv == null || mv < 0.05 || mv > 10) errors.push("invalid_move"); else params.minMovePct = round4(mv);
      }
    } else if(def.param == "gann"){
      var gl = { kind:p.kind, anchorT:num(p.anchorT), anchorPrice:num(p.anchorPrice), scale:num(p.scale), tf:tf };
      var gv = validateLine(gl, null);
      if(!gv.ok) errors.push("invalid_gann"); else {
        params.kind = gl.kind; params.anchorT = gl.anchorT; params.anchorPrice = round4(gl.anchorPrice); params.scale = round4(gl.scale);
      }
      if(input.type == "gann_near"){
        var np = blank(p.nearPct) ? GANN.NEAR_DEFAULT : num(p.nearPct);
        if(np == null || np < GANN.NEAR_MIN || np > GANN.NEAR_MAX) errors.push("invalid_near"); else params.nearPct = round4(np);
      }
      if(!blank(p.lineId)){
        if(typeof p.lineId == "string" && /^[a-z0-9]{6,24}$/.test(p.lineId)) params.lineId = p.lineId; else errors.push("invalid_gann");
      }
    } else if(def.param == "patterns"){
      var list = Array.isArray(p.patterns) ? p.patterns : [];
      var seen = [];
      for(var i = 0; i < list.length; i++){
        if(PATTERN_IDS.indexOf(list[i]) < 0){ errors.push("invalid_pattern"); seen = null; break; }
        if(seen.indexOf(list[i]) < 0) seen.push(list[i]);
      }
      if(seen){ if(seen.length == 0) errors.push("no_pattern"); else params.patterns = seen; }
    }
    var tfRequired = !(input.type == "price_above" || input.type == "price_below" || input.type == "pct_up" || input.type == "pct_down");
    if(input.timeframe != null && !tf) errors.push("invalid_timeframe");
    else if(!tf && tfRequired) errors.push("invalid_timeframe");
    else if(!tf) tf = "5m"; // level and day-move rules read the latest price
  }
  if(ctx && symbol && !symbolAllowed(symbol, ctx.watchlist, ctx.indicesEnabled)) errors.push("symbol_not_in_watchlist");
  if(errors.length) return { ok:false, errors:errors };
  return { ok:true, rule:{ symbol:symbol, type:input.type, timeframe:tf, params:params, enabled:input.enabled != false } };
}

export function groupOf(type){ return RULE_TYPES[type] ? RULE_TYPES[type].group : null; }
