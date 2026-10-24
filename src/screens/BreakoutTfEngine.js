// BreakoutPro - BreakoutTfEngine.js
// Breakout Time Frame Confirmation: a SEPARATE, pure, deterministic layer.
// It does not import or change NextMoveEngine / DirectionEngine calculations.
// It only reuses their exported helpers (ema, RULES, IST session helpers) so the
// level window and the EMA definitions are the same numbers the app already uses.
//
// Educational market structure only. Not a buy or sell recommendation.
//
// ---------------------------------------------------------------------------
// DATA CONTRACT (from api/providers/dhan.js, reached via /api/market?action=historical)
//   candle = { time (epoch s), timestamp (IST iso), open, high, low, close, volume }
//   meta   = { source:"dhan", symbol, exchangeSegment:"IDX_I", timeframe, timezone:"Asia/Kolkata" }
//   intervals actually supported by the provider: "5", "15", "60" (minutes) and "1D".
//   NOT LIVE-VERIFIED: no Dhan credentials were available when this was built, so
//   the intraday timestamp meaning (candle START time) is an assumption. Completion
//   is therefore judged conservatively: start + interval must be in the past.
//
// SESSION: NSE/BSE cash session 09:15-15:30 IST on trading days. Intraday candles
// must START inside the session and on an interval boundary measured from 09:15.
// The last 1H candle (15:15) is a 15 minute candle, so its end is capped at 15:30.
//
// LEVEL RULE (copied from the existing engine's analyseBars, applied per timeframe):
//   resistance = highest HIGH, support = lowest LOW of the 10 completed bars that
//   end 2 bars before the last completed bar. Heuristic, NOT validated.
// BREAKOUT RULE (same as the existing engine):
//   bullish if the last completed CLOSE is above resistance (bearish: below support).
//   "confirmed" when the previous completed close is also beyond the level (two
//   consecutive completed closes). One close beyond = "early". A wick or an
//   unfinished candle beyond the level is never a breakout.
// TREND RULE for a higher timeframe (existing engine's EMA rule, 9 and 21):
//   bullish if EMA9 > EMA21 and close > EMA21, bearish for the mirror, else neutral.
//   Needs 30 completed bars (RULES.MIN_BARS), else "insufficient".
//
// STATES (decided in this order, first match wins)
//   unavailable : the selected timeframe has no valid, fresh, sufficient completed candles.
//   waiting     : selected timeframe has no breakout, or only ONE completed close beyond the level.
//   conflicting : confirmed breakout on the selected timeframe AND at least one required
//                 higher timeframe trend is the OPPOSITE direction.
//   confirmed   : confirmed breakout, every required higher timeframe is available and has
//                 the SAME trend direction. Daily has no required higher timeframe (no
//                 verified weekly source exists), so Daily alone can be confirmed.
//   unconfirmed : confirmed breakout but a required higher timeframe is unavailable,
//                 insufficient, stale or neutral (no opposite evidence, no supporting evidence).
// Stale, missing or errored data can never produce "confirmed".
// Rules: no backtick, no triple-equals, ASCII only.

import { ema, RULES, istParts } from "./DirectionEngine.js";
import { holidayListCoversYear, isTradingHolidayIso } from "../utils/marketStatus.js";

export var BTF = {
  LEVEL_WINDOW: RULES.LEVEL_WINDOW,          // 10
  MIN_LEVEL_BARS: RULES.LEVEL_WINDOW + 2,    // 12 completed bars for a level + two closes
  MIN_TREND_BARS: RULES.MIN_BARS,            // 30 completed bars for the 21 EMA
  FUTURE_SKEW_MS: RULES.FUTURE_SKEW_MS,
  OPEN_MIN: RULES.OPEN_MIN,
  CLOSE_MIN: RULES.CLOSE_MIN,
  MIN_EPOCH_S: 946684800
};

// UI key -> provider interval string (the provider's own format) and higher timeframes.
export var TIMEFRAMES = {
  "5m":  { key:"5m",  interval:"5",  minutes:5,    htf:["15m", "1H"], label:"5m" },
  "15m": { key:"15m", interval:"15", minutes:15,   htf:["1H", "1D"],  label:"15m" },
  "1H":  { key:"1H",  interval:"60", minutes:60,   htf:["1D"],        label:"1H" },
  "1D":  { key:"1D",  interval:"1D", minutes:null, htf:[],            label:"Daily" }
};
export var TF_ORDER = ["5m", "15m", "1H", "1D"];

// Only index symbols the provider maps (api/providers/dhan.js SEC, segment IDX_I).
export var INSTRUMENTS = {
  NIFTY:     { symbol:"NIFTY",     name:"NIFTY 50",   exchange:"NSE", segment:"IDX_I" },
  BANKNIFTY: { symbol:"BANKNIFTY", name:"BANK NIFTY", exchange:"NSE", segment:"IDX_I" },
  FINNIFTY:  { symbol:"FINNIFTY",  name:"FINNIFTY",   exchange:"NSE", segment:"IDX_I" },
  SENSEX:    { symbol:"SENSEX",    name:"SENSEX",     exchange:"BSE", segment:"IDX_I" },
  MIDCAP:    { symbol:"MIDCAP",    name:"MIDCAP",     exchange:"NSE", segment:"IDX_I" }
};
export var INSTRUMENT_ORDER = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX", "MIDCAP"];

var DAY_MS = 86400000;
var IST_MS = 19800000;
function isNum(v){ return typeof v == "number" && isFinite(v); }

// ---- IST calendar helpers (own copies: DirectionEngine does not export isTradingDay) ----
function isWeekdayDay(day){ var w = (day + 4) % 7; return w != 0 && w != 6; }
export function isTradingDayIndex(day){
  if(!isWeekdayDay(day)) return false;
  var iso = new Date(day * DAY_MS).toISOString().slice(0, 10);
  if(holidayListCoversYear(parseInt(iso.slice(0, 4), 10)) && isTradingHolidayIso(iso)) return false;
  return true;
}
function dayOpenMs(day){ return day * DAY_MS - IST_MS + BTF.OPEN_MIN * 60000; }
function dayCloseMs(day){ return day * DAY_MS - IST_MS + BTF.CLOSE_MIN * 60000; }

// IST label, ASCII only: "24 Oct 2026, 14:30 IST"
var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export function istLabel(ms){
  if(!isNum(ms)) return "";
  var d = new Date(ms + IST_MS);
  var hh = String(d.getUTCHours()), mm = String(d.getUTCMinutes());
  if(hh.length < 2) hh = "0" + hh;
  if(mm.length < 2) mm = "0" + mm;
  return d.getUTCDate() + " " + MON[d.getUTCMonth()] + " " + d.getUTCFullYear() + ", " + hh + ":" + mm + " IST";
}
export function istDateLabel(ms){
  var s = istLabel(ms);
  var i = s.indexOf(",");
  return i > 0 ? s.slice(0, i) : s;
}

// ---- Candle validation ------------------------------------------------------
// Returns clean candles (sorted, unique) with startMs/endMs, plus counts of what
// was rejected. Intraday candles must start inside the session on a boundary.
export function validateCandles(raw, tfKey, nowMs){
  var tf = TIMEFRAMES[tfKey];
  var rej = { malformed:0, badTime:0, future:0, offSession:0, misaligned:0, duplicate:0 };
  var out = [];
  if(!tf || !Array.isArray(raw)) return { candles:[], rejected:rej, total:0 };
  var rows = [];
  for(var i = 0; i < raw.length; i++){
    var c = raw[i];
    if(!c || typeof c != "object"){ rej.malformed++; continue; }
    var t = c.time, O = c.open, H = c.high, L = c.low, C = c.close, V = c.volume;
    if(!(isNum(O) && isNum(H) && isNum(L) && isNum(C)) || !(O > 0 && H > 0 && L > 0 && C > 0) ||
       H < L || H < O || H < C || L > O || L > C || (V != null && !(isNum(V) && V >= 0))){ rej.malformed++; continue; }
    if(!isNum(t) || Math.floor(t) != t || t < BTF.MIN_EPOCH_S){ rej.badTime++; continue; }
    var startMs = t * 1000;
    if(startMs > nowMs + BTF.FUTURE_SKEW_MS){ rej.future++; continue; }
    var p = istParts(startMs);
    if(!isTradingDayIndex(p.day)){ rej.offSession++; continue; }
    var endMs;
    if(tf.minutes == null){
      endMs = dayCloseMs(p.day);
    } else {
      if(p.min < BTF.OPEN_MIN || p.min >= BTF.CLOSE_MIN){ rej.offSession++; continue; }
      if((p.min - BTF.OPEN_MIN) % tf.minutes != 0){ rej.misaligned++; continue; }
      endMs = Math.min(startMs + tf.minutes * 60000, dayCloseMs(p.day));
    }
    rows.push({ t:t, startMs:startMs, endMs:endMs, day:p.day, open:O, high:H, low:L, close:C, volume:(V == null ? 0 : V), idx:i });
  }
  rows.sort(function(a, b){ return (a.t - b.t) || (a.idx - b.idx); });
  for(var k = 0; k < rows.length; k++){
    if(out.length && out[out.length - 1].t == rows[k].t){ out[out.length - 1] = rows[k]; rej.duplicate++; }
    else out.push(rows[k]);
  }
  return { candles:out, rejected:rej, total:raw.length };
}

// ---- Freshness --------------------------------------------------------------
// End time of the most recent candle that SHOULD be complete at "now" for this timeframe.
export function expectedLastEnd(tfKey, now){
  var tf = TIMEFRAMES[tfKey];
  if(!tf) return null;
  var p = istParts(now);
  var day = p.day;
  var guard = 0;
  while(guard < 15){
    if(isTradingDayIndex(day)){
      var ends = [];
      if(tf.minutes == null){ ends.push(dayCloseMs(day)); }
      else {
        var s = dayOpenMs(day), close = dayCloseMs(day);
        while(s < close){ ends.push(Math.min(s + tf.minutes * 60000, close)); s += tf.minutes * 60000; }
      }
      for(var i = ends.length - 1; i >= 0; i--){ if(ends[i] <= now) return ends[i]; }
    }
    day--; guard++;
    now = dayCloseMs(day) + 1;   // continue from the end of the previous calendar day
  }
  return null;
}
function graceMs(tf){ return tf.minutes == null ? 600000 : Math.max(120000, Math.round(tf.minutes * 60000 * 0.2)); }

// "fresh" | "stale". A candle set is fresh when the last completed candle is the one
// expected at "now", or the previous one while the provider is still inside a short grace.
export function freshnessOf(tfKey, lastEndMs, now){
  var tf = TIMEFRAMES[tfKey];
  var e = expectedLastEnd(tfKey, now);
  if(e == null || !isNum(lastEndMs)) return { state:"stale", expectedEnd:e, lagMs:null };
  if(lastEndMs >= e) return { state:"fresh", expectedEnd:e, lagMs:0 };
  var e2 = expectedLastEnd(tfKey, e - 1);
  if(e2 != null && lastEndMs >= e2 && (now - e) <= graceMs(tf)) return { state:"fresh", expectedEnd:e, lagMs:e - lastEndMs, delayed:true };
  return { state:"stale", expectedEnd:e, lagMs:e - lastEndMs };
}

// ---- Level, breakout and trend on COMPLETED bars -----------------------------
export function levelAndBreakout(bars, provisional){
  var n = bars.length;
  if(n < BTF.MIN_LEVEL_BARS) return null;
  var wEnd = n - 3, wStart = wEnd - BTF.LEVEL_WINDOW + 1;
  var res = -Infinity, sup = Infinity;
  for(var i = wStart; i <= wEnd; i++){
    if(bars[i].high > res) res = bars[i].high;
    if(bars[i].low < sup) sup = bars[i].low;
  }
  var last = bars[n - 1], prev = bars[n - 2];
  var brk = { dir:0, state:"none" };
  if(last.close > res){ brk.dir = 1; brk.state = (prev.close > res) ? "confirmed" : "early"; }
  else if(last.close < sup){ brk.dir = -1; brk.state = (prev.close < sup) ? "confirmed" : "early"; }
  // a wick beyond the level on the last completed bar that did not close beyond it
  var touch = 0;
  if(brk.dir == 0){
    if(last.high > res) touch = 1;
    else if(last.low < sup) touch = -1;
  }
  // an unfinished candle already beyond the level (never counts)
  var forming = 0;
  if(provisional){
    if(provisional.close > res) forming = 1;
    else if(provisional.close < sup) forming = -1;
  }
  return { resistance:res, support:sup, brk:brk, touch:touch, forming:forming, lastClose:last.close };
}
export function trendOf(bars){
  var n = bars.length;
  if(n < BTF.MIN_TREND_BARS) return { dir:0, insufficient:true, bars:n };
  var closes = bars.map(function(b){ return b.close; });
  var e9 = ema(closes, RULES.EMA_FAST), e21 = ema(closes, RULES.EMA_SLOW);
  var c = closes[n - 1], a = e9[n - 1], b = e21[n - 1];
  var dir = 0;
  if(a > b && c > b) dir = 1; else if(a < b && c < b) dir = -1;
  return { dir:dir, insufficient:false, bars:n, ema9:a, ema21:b, close:c };
}

// ---- One timeframe -----------------------------------------------------------
// frame = { ok:true, meta, candles, fetchedAt } | { ok:false, error:{code} } | null
var ERR_KEY = {
  CREDENTIALS_MISSING:"bt.err.creds_missing", CREDENTIALS_INVALID:"bt.err.creds_invalid",
  DATA_API_NOT_SUBSCRIBED:"bt.err.not_subscribed", RATE_LIMITED:"bt.err.rate_limited",
  TIMEOUT:"bt.err.timeout", NETWORK:"bt.err.network", PROVIDER_ERROR:"bt.err.provider",
  INVALID_INPUT:"bt.err.invalid_input", EMPTY:"bt.err.empty"
};
export function analyseFrame(frame, tfKey, role, symbol, now){
  var tf = TIMEFRAMES[tfKey];
  var res = { tf:tfKey, role:role, status:"unavailable", reasonKey:"bt.tf.missing", reasonVars:{ tf:tfKey },
              completed:0, need:(role == "selected" ? BTF.MIN_LEVEL_BARS : BTF.MIN_TREND_BARS),
              last:null, provisional:null, level:null, trend:null, freshness:null, rejected:null, meta:null };
  if(!tf) return res;
  if(!frame) return res;
  if(frame.ok == false || frame.error){
    var code = frame.error && frame.error.code ? frame.error.code : "PROVIDER_ERROR";
    if(frame.error && frame.error.invalidTimeframe){
      res.status = "unsupported"; res.reasonKey = "bt.tf.unsupported"; res.reasonVars = { tf:tfKey };
      return res;
    }
    res.status = (code == "EMPTY") ? "unavailable" : "error";
    res.reasonKey = ERR_KEY[code] || "bt.err.provider";
    res.reasonVars = { tf:tfKey };
    return res;
  }
  var meta = frame.meta || {};
  var inst = INSTRUMENTS[symbol];
  res.meta = meta;
  // never mix instruments, exchanges, timezones or intervals
  if(!inst || String(meta.source) != "dhan" || String(meta.symbol).toUpperCase() != symbol ||
     String(meta.exchangeSegment) != inst.segment || String(meta.timezone) != "Asia/Kolkata" ||
     String(meta.timeframe).toUpperCase() != tf.interval){
    res.status = "unavailable"; res.reasonKey = "bt.tf.mismatch"; res.reasonVars = { tf:tfKey };
    return res;
  }
  var v = validateCandles(frame.candles, tfKey, now);
  res.rejected = v.rejected;
  var all = v.candles;
  if(all.length == 0){
    res.status = "unavailable";
    res.reasonKey = (v.total > 0) ? "bt.tf.all_invalid" : "bt.err.empty";
    res.reasonVars = { tf:tfKey };
    return res;
  }
  var done = [], open = [];
  for(var i = 0; i < all.length; i++){ if(all[i].endMs <= now) done.push(all[i]); else open.push(all[i]); }
  res.completed = done.length;
  res.provisional = open.length ? open[open.length - 1] : null;
  if(done.length == 0){
    res.status = "insufficient"; res.reasonKey = "bt.tf.insufficient"; res.reasonVars = { tf:tfKey, have:0, need:res.need };
    return res;
  }
  res.last = done[done.length - 1];
  res.freshness = freshnessOf(tfKey, res.last.endMs, now);
  if(res.freshness.state != "fresh"){
    res.status = "stale"; res.reasonKey = "bt.tf.stale"; res.reasonVars = { tf:tfKey, ts:istLabel(res.last.startMs) };
    return res;
  }
  if(done.length < res.need){
    res.status = "insufficient"; res.reasonKey = "bt.tf.insufficient"; res.reasonVars = { tf:tfKey, have:done.length, need:res.need };
    return res;
  }
  res.status = "ok"; res.reasonKey = ""; res.reasonVars = {};
  if(role == "selected") res.level = levelAndBreakout(done, res.provisional);
  else res.trend = trendOf(done);
  return res;
}

// ---- Evaluation --------------------------------------------------------------
function dirName(d){ return d > 0 ? "bullish" : (d < 0 ? "bearish" : "none"); }

export function evaluateBreakoutTf(input){
  var symbol = String(input && input.symbol || "").toUpperCase();
  var tfKey = input && input.tf;
  var now = input && isNum(input.now) ? input.now : Date.now();
  var frames = (input && input.frames) || {};
  var inst = INSTRUMENTS[symbol] || null;
  var tf = TIMEFRAMES[tfKey] || null;
  var view = {
    symbol:symbol, instrument:inst, exchange:inst ? inst.exchange : null, tf:tfKey, tfLabel:tf ? tf.label : String(tfKey),
    state:"unavailable", direction:"none", candidateDirection:"none",
    level:null, selected:null, higher:[], conflicts:[], reasons:[],
    lastCandle:null, provisionalCandle:null, freshness:null,
    source:{ name:"Dhan", dataStatus:"PROVIDER_HISTORICAL", liveVerified:false },
    htfRequired: tf ? tf.htf.length : 0, now:now
  };
  if(!inst){ view.reasons.push({ key:"bt.r.bad_symbol", vars:{ symbol:symbol } }); return view; }
  if(!tf){ view.reasons.push({ key:"bt.tf.unsupported", vars:{ tf:String(tfKey) } }); return view; }

  var sel = analyseFrame(frames[tfKey], tfKey, "selected", symbol, now);
  var hs = tf.htf.map(function(h){ return analyseFrame(frames[h], h, "higher", symbol, now); });
  view.selected = sel; view.higher = hs;
  if(sel.last){
    view.lastCandle = { startMs:sel.last.startMs, endMs:sel.last.endMs, label:istLabel(sel.last.startMs), endLabel:istLabel(sel.last.endMs), completed:true };
  }
  if(sel.provisional){
    view.provisionalCandle = { startMs:sel.provisional.startMs, label:istLabel(sel.provisional.startMs), close:sel.provisional.close, completed:false };
  }
  view.freshness = sel.freshness;

  if(sel.status != "ok"){
    view.state = "unavailable";
    view.reasons.push({ key:sel.reasonKey, vars:sel.reasonVars });
    return view;
  }
  var L = sel.level;
  view.level = { resistance:L.resistance, support:L.support, window:BTF.LEVEL_WINDOW };
  view.candidateDirection = dirName(L.brk.dir);
  var closes = { have:sel.completed };

  // Waiting: nothing beyond the level, or only one completed close beyond it.
  if(L.brk.dir == 0 || L.brk.state == "early"){
    view.state = "waiting";
    view.direction = "none";
    if(L.brk.dir == 0){
      view.reasons.push({ key:"bt.r.inside", vars:{ sup:L.support, res:L.resistance, close:L.lastClose } });
      if(L.touch != 0) view.reasons.push({ key:(L.touch > 0 ? "bt.r.touch_up" : "bt.r.touch_down"), vars:{ lvl:(L.touch > 0 ? L.resistance : L.support) } });
    } else {
      view.reasons.push({ key:(L.brk.dir > 0 ? "bt.r.early_up" : "bt.r.early_down"), vars:{ lvl:(L.brk.dir > 0 ? L.resistance : L.support) } });
    }
    if(L.forming != 0) view.reasons.push({ key:"bt.r.forming", vars:{ dir:dirName(L.forming) } });
    // opposite higher-timeframe trends are still shown as conflicting signals
    hs.forEach(function(h){
      if(h.status == "ok" && L.brk.dir != 0 && h.trend.dir == -L.brk.dir) view.conflicts.push({ tf:h.tf, key:"bt.c.htf_opposite", vars:{ tf:h.tf, dir:dirName(h.trend.dir) } });
    });
    return view;
  }

  // From here: confirmed breakout on the selected timeframe (two completed closes beyond the level).
  view.direction = dirName(L.brk.dir);
  view.reasons.push({ key:(L.brk.dir > 0 ? "bt.r.sel_up" : "bt.r.sel_down"), vars:{ tf:tf.label, lvl:(L.brk.dir > 0 ? L.resistance : L.support) } });
  var agree = 0, opposite = 0, neutral = 0, missing = 0;
  hs.forEach(function(h){
    if(h.status != "ok"){ missing++; return; }
    if(h.trend.dir == L.brk.dir) agree++;
    else if(h.trend.dir == -L.brk.dir){
      opposite++;
      view.conflicts.push({ tf:h.tf, key:"bt.c.htf_opposite", vars:{ tf:h.tf, dir:dirName(h.trend.dir) } });
    } else neutral++;
  });
  view.htfSummary = { agree:agree, opposite:opposite, neutral:neutral, missing:missing, required:hs.length };

  if(opposite > 0){
    view.state = "conflicting";
    view.reasons.push({ key:"bt.r.conflict", vars:{ n:opposite } });
    return view;
  }
  if(hs.length == 0){
    view.state = "confirmed";
    view.reasons.push({ key:"bt.r.daily_only", vars:{} });
    return view;
  }
  if(agree == hs.length){
    view.state = "confirmed";
    view.reasons.push({ key:"bt.r.htf_agree", vars:{ n:agree } });
    return view;
  }
  view.state = "unconfirmed";
  if(missing > 0) view.reasons.push({ key:"bt.r.htf_missing", vars:{ n:missing } });
  if(neutral > 0) view.reasons.push({ key:"bt.r.htf_neutral", vars:{ n:neutral } });
  return view;
}

export var STATE_ORDER = ["confirmed", "conflicting", "waiting", "unconfirmed", "unavailable"];
