// BreakoutPro - DirectionEngine.js
// Early Market Direction Intelligence. PURE and deterministic: no fetch, no
// random numbers, no AI text. Input is the SAME payload the AI Market Mood page
// already receives from /api/market-mood-data (no new request).
//
// What it is: a transparent, rule-based reading of verified inputs that says
// whether bullish or bearish conditions look like they are DEVELOPING. It is
// NOT a forecast. There is no validated probability model, so no probability
// or accuracy number is produced anywhere. Confidence is a qualitative level
// (low / moderate / high) that describes how complete and consistent the
// evidence is. It is separate from direction.
//
// The thresholds below are HEURISTIC rules chosen for explainability. They
// have not been back-tested or validated for predictive accuracy.
//
// Output text is returned as { key, vars } pairs so the UI can render them
// through the existing i18n system (t(key, vars)). Numbers in vars are
// pre-formatted en-IN strings and are never translated.
// Rules: no backtick, no triple-equals, ASCII only.
import { holidayListCoversYear, isTradingHolidayIso } from "../utils/marketStatus.js";

// ---- Tunable heuristic constants (documented in the feature report) --------
export var RULES = {
  EMA_FAST: 9,
  EMA_SLOW: 21,
  MIN_BARS: 30,            // bars needed before a 21 EMA is trusted
  LEVEL_WINDOW: 10,        // sessions used for recent support / resistance
  CROSS_LOOKBACK: 3,       // a crossover this recent counts as "fresh"
  ESTABLISHED_SESSIONS: 5, // EMA alignment held this long = established trend
  DAY_MOVE_PCT: 0.3,       // |index change| needed to count as a directional day
  SECTOR_UP_SHARE: 0.67,   // share of sector indices up to call participation broad
  SECTOR_DOWN_SHARE: 0.33,
  SECTOR_MIN_ITEMS: 4,
  VIX_MOVE_PCT: 5,         // India VIX day change that counts as fear rising/easing
  VIX_HIGH: 20,            // elevated VIX level: caps confidence
  CRUDE_MOVE_PCT: 1,       // crude day move that counts as direction
  CRUDE_HEADWIND_PCT: 1.5, // rising crude this much is a mild headwind
  CRUDE_VOL_MULT: 2,       // today's move vs 10-session stdev = unusually volatile
  CRUDE_VOL_ABS: 2.5,      // or 10-session stdev above this percent
  BIAS_NET: 3,             // net weighted points needed for a directional bias
  CONFLICT_RATIO: 0.6,     // opposing points >= this share of supporting = conflict
  MIN_COVERAGE: 0.4,       // share of model weight that must be usable
  // Source-timestamp validation (IST session dates, no holiday calendar)
  OPEN_MIN: 555,           // 09:15 IST in minutes: first session minute
  CLOSE_MIN: 930,          // 15:30 IST in minutes
  HOLIDAY_TOLERANCE: 2,    // weekdays a source may lag before it is STALE; 1-2 is reported as uncertain
  QUOTE_INTRADAY_SEC: 900, // in-session quote older than this is STALE
  CONTINUOUS_MAX_SEC: 21600, // 24h futures (Crude, Nat Gas): older than 6h is STALE
  FUTURE_SKEW_MS: 300000,  // timestamps more than 5 min ahead of now are invalid
  PRICE_MISMATCH_PCT: 5,   // live quote vs latest daily close further apart than this = inconsistent data
  REV_SWING_PCT: 2         // prior opposite trend must have moved price at least this percent (range wobble is not a trend)
};

// Weights (max points each input can add in either direction).
var W = {
  nifty_ema: 2, nifty_level: 2, nifty_day: 1,
  bn_ema: 1, bn_level: 1, bn_day: 1,
  sectors: 1, vix: 1, crude: 1
};
var TOTAL_W = 0;
for(var wk in W){ if(W.hasOwnProperty(wk)) TOTAL_W += W[wk]; }
export var TOTAL_WEIGHT = TOTAL_W;

function isNum(x){ return typeof x=="number" && isFinite(x); }
function round2(x){ return Math.round(x*100)/100; }
export function fmtNum(x){
  if(!isNum(x)) return "--";
  try{ return x.toLocaleString("en-IN", { maximumFractionDigits:2, minimumFractionDigits:0 }); }
  catch(e){ return String(round2(x)); }
}
function fmtPct(x){ return (x>=0?"+":"") + String(round2(x)); }
function absPct(x){ return String(round2(Math.abs(x))); }

// ---- Technical helpers (exported so tests can verify them independently) ---
export function ema(values, period){
  if(!values || values.length<period) return null;
  var k = 2/(period+1), sum = 0, i;
  for(i=0;i<period;i++) sum += values[i];
  var e = sum/period;
  var out = [];
  for(i=0;i<period-1;i++) out.push(null);
  out.push(e);
  for(i=period;i<values.length;i++){
    e = values[i]*k + e*(1-k);
    out.push(e);
  }
  return out;
}

// ---- Input status handling -------------------------------------------------
// Server freshness is trusted, then only ever DOWNGRADED by client age: if the
// last successful fetch is old (offline / failed polling) a LIVE label cannot
// be kept. Daily bars are never LIVE.
function ageAdjust(status, ageSec){
  if(status=="UNAVAILABLE" || status==null) return "UNAVAILABLE";
  if(status=="DEMO") return "DEMO";
  if(ageSec!=null){
    if(ageSec>900) return "STALE";
    if(ageSec>90 && status=="LIVE") return "DELAYED";
  }
  return status;
}
function usable(status){ return status=="LIVE" || status=="DELAYED"; }

// ---- Source timestamp validation (IST-aware) -------------------------------
// The server's LIVE/DELAYED label is not trusted on its own: a closed market is
// always labelled DELAYED there, whatever the data age. Here the PROVIDER
// timestamp is compared with the latest session that should exist. No holiday
// calendar is invented: a source that is 1-2 weekdays behind is reported as
// UNCERTAIN (holiday or provider delay cannot be told apart), beyond that STALE.
export function istParts(ms){
  var s = ms + 19800000;
  return { day:Math.floor(s/86400000), min:Math.floor((s%86400000)/60000) };
}
function isWeekday(day){ var w = (day+4)%7; return w!=0 && w!=6; }
// Trading day = weekday that is not a known NSE holiday. The app's own list
// (utils/marketStatus.js) is used only for years it covers; for other years
// holidays are unknown and the 1-2 session tolerance below still applies.
function isTradingDay(day){
  if(!isWeekday(day)) return false;
  var iso = new Date(day*86400000).toISOString().slice(0,10);
  if(holidayListCoversYear(parseInt(iso.slice(0,4), 10)) && isTradingHolidayIso(iso)) return false;
  return true;
}
// Latest weekday whose 09:15 IST open has already passed (as an IST day index).
export function expectedSessionDay(now){
  var p = istParts(now), e = p.day;
  if(p.min < RULES.OPEN_MIN) e--;
  while(!isTradingDay(e)) e--;
  return e;
}
// True during regular NSE hours on a trading day (09:15-15:30 IST).
export function isClockOpen(now){
  var np = istParts(now);
  return isTradingDay(np.day) && np.min >= RULES.OPEN_MIN && np.min < RULES.CLOSE_MIN;
}
// kind "session": NSE-style daily/quote data. kind "continuous": 24h futures.
export function checkSourceTime(ts, now, kind, intraday){
  if(!isNum(ts)) return { state:"missing" };
  if(ts > now + RULES.FUTURE_SKEW_MS) return { state:"future" };
  if(kind=="continuous"){
    return ((now - ts)/1000 > RULES.CONTINUOUS_MAX_SEC) ? { state:"stale" } : { state:"fresh" };
  }
  var obs = istParts(ts).day, exp = expectedSessionDay(now), np = istParts(now);
  if(obs >= exp){
    var clockOpen = isClockOpen(now);
    if(intraday && clockOpen && obs==np.day && (now - ts)/1000 > RULES.QUOTE_INTRADAY_SEC) return { state:"stale", lag:0 };
    return { state:"fresh", lag:0 };
  }
  var lag = 0;
  for(var d=obs+1; d<=exp; d++){ if(isTradingDay(d)) lag++; }
  if(lag > RULES.HOLIDAY_TOLERANCE) return { state:"stale", lag:lag };
  return { state:"uncertain", lag:lag };
}
// Applies the check to an input. Only ever DOWNGRADES a usable input; the
// provider timestamp (asOf) is never replaced by the current time.
function applyTime(inp, ts, now, kind, intraday){
  var c = checkSourceTime(ts, now, kind, intraday);
  inp.timeCheck = c.state;
  if(c.lag!=null) inp.sessionLag = c.lag;
  if(!usable(inp.status)) return inp;
  if(c.state=="missing"){ inp.status = "UNAVAILABLE"; inp.reason = "no_timestamp"; }
  else if(c.state=="future"){ inp.status = "UNAVAILABLE"; inp.reason = "bad_timestamp"; }
  else if(c.state=="stale"){ inp.status = "STALE"; inp.reason = "stale_source"; }
  else if(c.state=="uncertain"){ inp.uncertain = true; }
  return inp;
}

function mkInput(id, status, asOf, extra){
  // asOf = provider timestamp (quote time or candle time), never the fetch time.
  // fetchedAt = when the server obtained it. status = validated source status.
  var o = { id:id, status:status, asOf:(isNum(asOf)?asOf:null), fetchedAt:null, serverStatus:null, used:false, reason:"" };
  if(extra){ for(var k in extra){ if(extra.hasOwnProperty(k)) o[k] = extra[k]; } }
  return o;
}

// ---- Per-index technical analysis -------------------------------------------
function analyseBars(candles, provisionalLast){
  var bars = [];
  var i;
  if(candles){
    for(i=0;i<candles.length;i++){
      var b = candles[i];
      if(b && isNum(b.c) && isNum(b.h) && isNum(b.l)) bars.push(b);
    }
  }
  if(bars.length < RULES.MIN_BARS) return null;
  var closes = bars.map(function(b){ return b.c; });
  var e9 = ema(closes, RULES.EMA_FAST), e21 = ema(closes, RULES.EMA_SLOW);
  var n = bars.length;
  var last = bars[n-1], prev = bars[n-2];
  var diff = function(j){ return e9[j] - e21[j]; };
  var bullNow = diff(n-1)>0 && last.c>e21[n-1];
  var bearNow = diff(n-1)<0 && last.c<e21[n-1];
  // how many consecutive sessions the fast/slow relation has had its sign
  var sign = diff(n-1)>0 ? 1 : (diff(n-1)<0 ? -1 : 0);
  var held = 0;
  for(i=n-1;i>=RULES.EMA_SLOW-1;i--){
    var d = diff(i); var sg = d>0?1:(d<0?-1:0);
    if(sg==sign && sg!=0) held++; else break;
  }
  // fresh crossover: sign flipped within the lookback window
  var crossed = 0; // +1 up, -1 down, 0 none
  var crossAgo = 0;
  for(i=1;i<=RULES.CROSS_LOOKBACK;i++){
    var a = n-1-i, bIdx = n-i;
    if(a < RULES.EMA_SLOW-1) break;
    var da = diff(a), db = diff(bIdx);
    if(da<=0 && db>0){ crossed = 1; crossAgo = i-1; break; }
    if(da>=0 && db<0){ crossed = -1; crossAgo = i-1; break; }
  }
  // recent support / resistance from the window ending 2 bars before the end
  var wEnd = n-3, wStart = wEnd - RULES.LEVEL_WINDOW + 1;
  if(wStart < 0) return null;
  var res = -Infinity, sup = Infinity;
  for(i=wStart;i<=wEnd;i++){
    if(bars[i].h > res) res = bars[i].h;
    if(bars[i].l < sup) sup = bars[i].l;
  }
  var brk = { dir:0, state:"none" };
  if(last.c > res){
    brk.dir = 1;
    if(prev.c > res) brk.state = provisionalLast ? "developing" : "confirmed";
    else brk.state = "early";
  } else if(last.c < sup){
    brk.dir = -1;
    if(prev.c < sup) brk.state = provisionalLast ? "developing" : "confirmed";
    else brk.state = "early";
  }
  // reversal: a FRESH EMA cross after an established opposite EMA trend (held at
  // least ESTABLISHED_SESSIONS sessions), with the last close already on the new
  // side of the 21 EMA (heuristic, not validated)
  var rev = { dir:0, priorSessions:0, priorSwingPct:0 };
  if(crossed!=0){
    var xi = n - 1 - crossAgo, pr = 0;
    for(var pj=xi-1; pj>=RULES.EMA_SLOW-1; pj--){
      var dj = diff(pj);
      if(crossed>0 ? dj<0 : dj>0) pr++; else break;
    }
    rev.priorSessions = pr;
    var si = xi - pr, refC = bars[si].c, ext = refC;
    for(var sj=si; sj<n; sj++){ ext = crossed>0 ? Math.min(ext, bars[sj].c) : Math.max(ext, bars[sj].c); }
    rev.priorSwingPct = Math.round((Math.abs(refC-ext)/refC)*10000)/100;
    if(pr >= RULES.ESTABLISHED_SESSIONS && rev.priorSwingPct >= RULES.REV_SWING_PCT && ((crossed>0 && last.c>e21[n-1]) || (crossed<0 && last.c<e21[n-1]))) rev.dir = crossed;
  }
  return {
    reversal:rev, prevClose:prev.c,
    bars:n, close:last.c, ema9:e9[n-1], ema21:e21[n-1],
    bull:bullNow, bear:bearNow, sign:sign, held:held,
    crossed:crossed, crossAgo:crossAgo,
    resistance:res, support:sup, brk:brk,
    lastBarTs: last.t || null, provisional:!!provisionalLast
  };
}

// ---- Main entry --------------------------------------------------------------
// data: payload of /api/market-mood-data (or null)
// opts: { now:ms, lastUpdated:ms, demo:bool, offline:bool }
export function computeDirection(data, opts){
  opts = opts || {};
  var now = isNum(opts.now) ? opts.now : Date.now();
  var ageSec = isNum(opts.lastUpdated) ? Math.max(0, Math.round((now - opts.lastUpdated)/1000)) : null;
  var result = {
    outlook:"insufficient", stage:null, confidence:"low",
    net:0, coverage:0, session:(data && data.session) || null,
    supports:[], contradicts:[], bullEvidence:[], bearEvidence:[], notes:[],
    strengthen:[], weaken:[], inputs:[], reasons:[],
    levels:null, basisClose:false, provisional:false, demo:!!opts.demo, now:now
  };

  // Nothing real to analyse: demo mode, empty payload, or provider error.
  if(opts.demo || !data || !data.indices){
    result.reasons.push({ key: opts.demo ? "dir.why.demo" : "dir.why.no_data", vars:{} });
    result.inputs = unavailableInputs("UNAVAILABLE");
    return result;
  }

  var session = data.session || null;
  var sessionOpen = (session=="OPEN" || session=="PRE_OPEN");
  result.basisClose = !sessionOpen;
  result.provisional = sessionOpen;
  var idx = data.indices || {};
  var fetchedAt = isNum(data.generatedAt) ? data.generatedAt : (isNum(opts.lastUpdated) ? opts.lastUpdated : null);
  var inputs = [];
  var signals = []; // { id, dir, weight, key, vars, group }
  var usedWeight = 0;

  function addInput(inp){ inputs.push(inp); return inp; }
  function sig(id, dir, weight, key, vars, extra){
    var s = { id:id, dir:dir, weight:weight, key:key, vars:vars||{} };
    if(extra){ for(var k in extra){ if(extra.hasOwnProperty(k)) s[k] = extra[k]; } }
    signals.push(s);
    return s;
  }

  // -- Index quote status helper
  function quoteInput(id, q){
    if(!q || !isNum(q.ltp) || !q.freshness){ return mkInput(id, "UNAVAILABLE", null, { reason:"unavailable" }); }
    var st = ageAdjust(q.freshness.status, ageSec);
    var qi = mkInput(id, st, q.freshness.sourceTimestamp, { serverStatus:q.freshness.status, fetchedAt:fetchedAt });
    return applyTime(qi, q.freshness.sourceTimestamp, now, "session", true);
  }

  var nq = quoteInput("nifty_q", idx.NIFTY);
  var bq = quoteInput("bn_q", idx.BANKNIFTY);
  var vq = quoteInput("vix", idx.VIX);
  addInput(nq);
  var niftyDay = null, bnDay = null;
  if(usable(nq.status) && isNum(idx.NIFTY.chgPct)){ niftyDay = idx.NIFTY.chgPct; }
  if(usable(bq.status) && isNum(idx.BANKNIFTY.chgPct)){ bnDay = idx.BANKNIFTY.chgPct; }

  // -- Daily history inputs (EMA and levels). Never LIVE.
  var dh = data.directionHistory || {};
  function histInput(id, block){
    if(!block || !block.candles || !block.candles.length){ return mkInput(id, "UNAVAILABLE", null, { reason:"unavailable" }); }
    var last = block.candles[block.candles.length-1];
    var st = ageAdjust(block.status || "DELAYED", ageSec);
    var hi = mkInput(id, st, last && last.t, { serverStatus:(block.status || "DELAYED"), fetchedAt:(isNum(block.fetchedAt) ? block.fetchedAt : fetchedAt), candleTime:(last && isNum(last.t) ? last.t : null) });
    return applyTime(hi, last && last.t, now, "session", false);
  }
  var nh = histInput("nifty_h", dh.NIFTY);
  var bh = histInput("bn_h", dh.BANKNIFTY);
  var nTech = usable(nh.status) ? analyseBars(dh.NIFTY.candles, sessionOpen) : null;
  var bTech = usable(bh.status) ? analyseBars(dh.BANKNIFTY.candles, sessionOpen) : null;
  if(usable(nh.status) && !nTech){ nh.reason = "short_history"; }
  if(usable(bh.status) && !bTech){ bh.reason = "short_history"; }

  function techSignals(prefix, label, tech, dayChg){
    if(tech){
      var vars = { idx:label, e9:fmtNum(tech.ema9), e21:fmtNum(tech.ema21) };
      if(tech.bull) sig(prefix+"_ema", 1, W[prefix+"_ema"], "dir.s.ema_bull", vars, { group:prefix });
      else if(tech.bear) sig(prefix+"_ema", -1, W[prefix+"_ema"], "dir.s.ema_bear", vars, { group:prefix });
      else sig(prefix+"_ema", 0, W[prefix+"_ema"], "dir.s.ema_mixed", vars, { group:prefix, note:true });
      if(tech.crossed!=0){
        var cv = { idx:label, n:String(RULES.CROSS_LOOKBACK) };
        // weight 0: shown as evidence in its direction, never scored (the
        // EMA relation above already carries the weight).
        sig(prefix+"_cross", tech.crossed, 0, tech.crossed>0 ? "dir.s.cross_up" : "dir.s.cross_dn", cv, { group:prefix, fresh:true, crossDir:tech.crossed });
      }
      var lv = { idx:label, lvl:"" };
      if(tech.brk.dir>0){
        lv.lvl = fmtNum(tech.resistance);
        sig(prefix+"_level", 1, W[prefix+"_level"], "dir.s.break_up_"+tech.brk.state, lv, { group:prefix, brkState:tech.brk.state });
      } else if(tech.brk.dir<0){
        lv.lvl = fmtNum(tech.support);
        sig(prefix+"_level", -1, W[prefix+"_level"], "dir.s.break_dn_"+tech.brk.state, lv, { group:prefix, brkState:tech.brk.state });
      } else {
        sig(prefix+"_level", 0, W[prefix+"_level"], "dir.s.range", { idx:label, sup:fmtNum(tech.support), res:fmtNum(tech.resistance) }, { group:prefix, note:true });
      }
    }
    if(dayChg!=null){
      var dv = { idx:label, p:absPct(dayChg) };
      if(dayChg >= RULES.DAY_MOVE_PCT) sig(prefix+"_day", 1, W[prefix+"_day"], "dir.s.day_up", dv, { group:prefix });
      else if(dayChg <= -RULES.DAY_MOVE_PCT) sig(prefix+"_day", -1, W[prefix+"_day"], "dir.s.day_dn", dv, { group:prefix });
      else sig(prefix+"_day", 0, W[prefix+"_day"], "dir.s.day_flat", dv, { group:prefix, note:true });
    }
  }
  techSignals("nifty", "NIFTY 50", nTech, niftyDay);
  addInput(nh);
  addInput(bq); addInput(bh);
  techSignals("bn", "BANK NIFTY", bTech, bnDay);
  // Authoritative price/levels for other modules (Next Move). Provider
  // timestamps and validated status only; nothing is invented here.
  function quoteView(q, qi){
    if(!q || !isNum(q.ltp)) return null;
    return { ltp:q.ltp, chgPct:(isNum(q.chgPct) ? q.chgPct : null), asOf:qi.asOf, status:qi.status, timeCheck:(qi.timeCheck || null), fetchedAt:qi.fetchedAt };
  }
  result.quote = { nifty:quoteView(idx.NIFTY, nq), bn:quoteView(idx.BANKNIFTY, bq) };
  result.tech = { nifty:nTech, bn:bTech };

  // -- Sector participation (verified NSE sector indices only)
  var sec = data.sectors;
  var secStatus = (!sec || sec.status=="UNAVAILABLE" || !sec.items) ? "UNAVAILABLE" : ageAdjust(sec.status=="PARTIAL" ? "DELAYED" : sec.status, ageSec);
  var secTs = null;
  if(sec && sec.items){ for(var si=0; si<sec.items.length; si++){ var t0 = sec.items[si].ts; if(isNum(t0) && (secTs==null || t0>secTs)) secTs = t0; } }
  var secInp = addInput(mkInput("sectors", secStatus, secTs, secStatus=="UNAVAILABLE" ? { reason:"unavailable" } : { serverStatus:(sec && sec.status) || null, fetchedAt:fetchedAt }));
  if(secStatus!="UNAVAILABLE") applyTime(secInp, secTs, now, "session", false);
  if(usable(secInp.status) && sec.items.length >= RULES.SECTOR_MIN_ITEMS){
    var upN = 0, totN = 0;
    for(si=0; si<sec.items.length; si++){
      if(isNum(sec.items[si].chgPct)){ totN++; if(sec.items[si].chgPct>0) upN++; }
    }
    if(totN >= RULES.SECTOR_MIN_ITEMS){
      var share = upN/totN, sv = { n:String(upN), m:String(totN) };
      if(share >= RULES.SECTOR_UP_SHARE) sig("sectors", 1, W.sectors, "dir.s.sect_up", sv, { group:"sectors" });
      else if(share <= RULES.SECTOR_DOWN_SHARE) sig("sectors", -1, W.sectors, "dir.s.sect_dn", sv, { group:"sectors" });
      else sig("sectors", 0, W.sectors, "dir.s.sect_mix", sv, { group:"sectors", note:true });
    } else { secInp.reason = "few_items"; }
  } else if(usable(secInp.status)){ secInp.reason = "few_items"; }

  // -- India VIX (fear gauge). Direction only on a clear day move; a high
  // level never creates direction, it only caps confidence.
  addInput(vq);
  var vixLevel = null, vixHigh = false;
  if(usable(vq.status)){
    vixLevel = idx.VIX.ltp;
    var vchg = isNum(idx.VIX.chgPct) ? idx.VIX.chgPct : null;
    if(vchg!=null && vchg >= RULES.VIX_MOVE_PCT) sig("vix", -1, W.vix, "dir.s.vix_fear", { v:fmtNum(vixLevel), p:absPct(vchg) }, { group:"vix" });
    else if(vchg!=null && vchg <= -RULES.VIX_MOVE_PCT) sig("vix", 1, W.vix, "dir.s.vix_calm", { v:fmtNum(vixLevel), p:absPct(vchg) }, { group:"vix" });
    else sig("vix", 0, W.vix, "dir.s.vix_flat", { v:fmtNum(vixLevel) }, { group:"vix", note:true });
    if(vixLevel >= RULES.VIX_HIGH){
      vixHigh = true;
      sig("vix_high", 0, 0, "dir.s.vix_high", { v:fmtNum(vixLevel) }, { group:"vix", note:true, info:true });
    }
  }

  // -- Crude Oil: CONTEXT ONLY. Falling crude is never bullish by itself; it
  // is read together with equity direction. Max influence = 1 point of ~11.
  var crudeItem = null;
  var gItems = (data.global && data.global.items) || [];
  for(var gi=0; gi<gItems.length; gi++){ if(gItems[gi].name=="Crude Oil (WTI)") crudeItem = gItems[gi]; }
  var crudeStatus = crudeItem && isNum(crudeItem.chgPct) && crudeItem.freshness ? ageAdjust(crudeItem.freshness, ageSec) : "UNAVAILABLE";
  var crudeInp = addInput(mkInput("crude", crudeStatus, crudeItem && crudeItem.ts, crudeStatus=="UNAVAILABLE" ? { reason:"unavailable" } : { serverStatus:crudeItem.freshness, fetchedAt:fetchedAt }));
  if(crudeStatus!="UNAVAILABLE") applyTime(crudeInp, crudeItem.ts, now, "continuous", false);
  var crudeHigh = false;
  if(usable(crudeInp.status)){
    var cp = crudeItem.chgPct;
    var cvars = { p:absPct(cp) };
    // equity backdrop = NIFTY and BANK NIFTY day moves plus their EMA state
    var eqWeak = (niftyDay!=null && niftyDay < 0) || (bnDay!=null && bnDay < 0) || (nTech && nTech.bear);
    var eqOk = (niftyDay!=null && niftyDay >= 0) && !(nTech && nTech.bear) && !(bnDay!=null && bnDay < 0);
    if(cp <= -RULES.CRUDE_MOVE_PCT){
      if(eqOk) sig("crude", 1, W.crude, "dir.s.crude_fall_ok", cvars, { group:"crude", context:true });
      else if(eqWeak) sig("crude", 0, W.crude, "dir.s.crude_fall_weak", cvars, { group:"crude", note:true, context:true });
      else sig("crude", 0, W.crude, "dir.s.crude_flat", cvars, { group:"crude", note:true, context:true });
    } else if(cp >= RULES.CRUDE_HEADWIND_PCT){
      sig("crude", -1, W.crude, "dir.s.crude_rise", cvars, { group:"crude", context:true });
    } else {
      sig("crude", 0, W.crude, "dir.s.crude_flat", cvars, { group:"crude", note:true, context:true });
    }
    var cm = data.macro && data.macro.crude;
    var cmTime = cm ? checkSourceTime(cm.lastBarTs, now, "session", false).state : "missing";
    if(cm && isNum(cm.vol10Pct) && usable(ageAdjust(cm.status || "DELAYED", ageSec)) && (cmTime=="fresh" || cmTime=="uncertain")){
      if(Math.abs(cp) >= RULES.CRUDE_VOL_MULT*cm.vol10Pct || cm.vol10Pct >= RULES.CRUDE_VOL_ABS){
        crudeHigh = true;
        sig("crude_vol", 0, 0, "dir.s.crude_vol", { sd:String(round2(cm.vol10Pct)), n:String(cm.sessions), p:absPct(cp) }, { group:"crude", note:true, info:true, context:true });
      }
    }
  }

  // -- Natural Gas: informational only, weight 0, never scored.
  var ng = data.macro && data.macro.natGas;
  var ngStatus = ng && isNum(ng.chgPct) && ng.freshness ? ageAdjust(ng.freshness, ageSec) : "UNAVAILABLE";
  var ngInp = addInput(mkInput("natgas", ngStatus, ng && ng.ts, ngStatus=="UNAVAILABLE" ? { reason:"unavailable" } : { contextOnly:true, serverStatus:ng.freshness, fetchedAt:fetchedAt }));
  if(ngStatus!="UNAVAILABLE") applyTime(ngInp, ng.ts, now, "continuous", false);
  if(usable(ngInp.status)){
    sig("natgas", 0, 0, ng.chgPct>=0 ? "dir.s.natgas_up" : "dir.s.natgas_dn", { p:absPct(ng.chgPct) }, { group:"natgas", note:true, info:true, context:true });
  }

  // -- Inputs with NO verified source connected. Listed honestly, never used.
  var un = data.unavailable || {};
  addInput(mkInput("breadth", "UNAVAILABLE", null, { reason:"no_provider" }));
  addInput(mkInput("volume",  "UNAVAILABLE", null, { reason:"no_provider" }));
  addInput(mkInput("fiidii",  "UNAVAILABLE", null, { reason:(un.fiiDii=="UNAVAILABLE" ? "no_provider" : "no_provider") }));
  addInput(mkInput("news",    "UNAVAILABLE", null, { reason:"no_provider" }));

  // Mark which inputs were actually used, with reasons for exclusion.
  var usedGroups = {};
  for(var q=0;q<signals.length;q++){ if(signals[q].weight>0 || signals[q].group) usedGroups[signals[q].group] = true; }
  var inputGroup = { nifty_q:"nifty", nifty_h:"nifty", bn_q:"bn", bn_h:"bn", sectors:"sectors", vix:"vix", crude:"crude", natgas:"natgas" };
  for(var ii=0; ii<inputs.length; ii++){
    var inp = inputs[ii];
    if(inp.status=="STALE" && inp.reason=="") inp.reason = "stale";
    if(inp.id=="natgas"){ inp.used = false; if(usable(inp.status)) inp.reason = "context_only"; continue; }
    inp.used = usable(inp.status) && inp.reason=="" ;
  }
  // coverage = weight of usable, scored inputs / total model weight
  var covW = 0;
  for(var s2=0;s2<signals.length;s2++){ if(signals[s2].weight>0) covW += signals[s2].weight; }
  result.coverage = covW/TOTAL_W;
  result.inputs = inputs;

  // -- Hard gates -> Insufficient or Stale
  var reasons = result.reasons;
  if(nq.status=="UNAVAILABLE"){ reasons.push({ key:"dir.why.no_nifty", vars:{} }); }
  else if(nq.status=="STALE"){ reasons.push({ key:"dir.why.stale_nifty", vars:{} }); }
  if(opts.offline && ageSec!=null && ageSec>90){ reasons.push({ key:"dir.why.offline", vars:{} }); }
  // NIFTY 50 daily history is the technical backbone. If it is stale, has no
  // valid timestamp, or is missing/too short, no directional reading is given.
  if(!nTech){ reasons.push({ key: (nh.status=="STALE" ? "dir.why.stale_history" : "dir.why.no_history"), vars:{} }); }
  // Consistency: the live quote and the latest daily candle describe the same
  // index. If they are far apart, one of them is wrong or from another source.
  if(nTech && usable(nq.status) && isNum(idx.NIFTY.ltp) && nTech.close>0 && (Math.abs(idx.NIFTY.ltp - nTech.close)/nTech.close)*100 > RULES.PRICE_MISMATCH_PCT){
    reasons.push({ key:"dir.why.mismatch", vars:{ q:fmtNum(idx.NIFTY.ltp), c:fmtNum(nTech.close) } });
  }
  if(result.coverage < RULES.MIN_COVERAGE){ reasons.push({ key:"dir.why.low_cov", vars:{ n:String(Math.round(result.coverage*100)) } }); }
  if(reasons.length){
    result.outlook = "insufficient";
    result.notes = signals.filter(function(x){ return !!x.key; });
    result.context = signals.filter(function(x){ return x.dir==0 && (x.group=="crude" || x.group=="vix" || x.group=="natgas" || x.info); });
    return result;
  }

  // -- Score
  var bullPts = 0, bearPts = 0;
  for(var z=0; z<signals.length; z++){
    var sg2 = signals[z];
    if(sg2.dir>0) bullPts += sg2.weight;
    if(sg2.dir<0) bearPts += sg2.weight;
  }
  var net = bullPts - bearPts;
  result.net = net;
  result.points = { bull:bullPts, bear:bearPts, total:TOTAL_W };
  var lead = net>0 ? 1 : (net<0 ? -1 : 0);
  var forP = lead>0 ? bullPts : bearPts, againstP = lead>0 ? bearPts : bullPts;
  var conflict = lead!=0 && forP>0 && (againstP/forP) >= RULES.CONFLICT_RATIO;

  // Price confirmation: EMA alignment alone is not enough (EMAs line up by
  // chance in choppy ranges). At least one price-action signal on NIFTY 50 or
  // BANK NIFTY (a level break or a directional day) must agree.
  var priceConfirm = false;
  for(var pc=0; pc<signals.length; pc++){
    var ps = signals[pc];
    if(ps.dir==lead && lead!=0 && (ps.id=="nifty_level" || ps.id=="bn_level" || ps.id=="nifty_day" || ps.id=="bn_day")) priceConfirm = true;
  }
  var outlook = "neutral";
  var reachedNet = Math.abs(net) >= RULES.BIAS_NET;
  if(reachedNet && !conflict && priceConfirm) outlook = lead>0 ? "bullish" : "bearish";
  result.outlook = outlook;
  // Sources 1-2 weekdays behind: holiday or provider delay cannot be told apart
  // without a holiday calendar, so say so and cap confidence below.
  var anyUncertain = false;
  for(var ui=0; ui<inputs.length; ui++){ if(inputs[ui].uncertain && inputs[ui].used) anyUncertain = true; }
  result.timeUncertain = anyUncertain;
  if(outlook=="neutral"){
    var whyKey = "dir.why.mixed";
    if(reachedNet && conflict) whyKey = "dir.why.conflict";
    else if(reachedNet && !priceConfirm) whyKey = "dir.why.no_price";
    result.reasons.push({ key:whyKey, vars:{} });
  }

  // -- Evidence lists
  // supports / contradicts are relative to the outlook. Neutral readings that
  // are plain context (VIX, Crude Oil, Natural Gas notes) go to the context list;
  // other neutral readings (no confirmation) are caveats against a bias.
  function isContext(sx){ return sx.group=="crude" || sx.group=="vix" || sx.group=="natgas" || !!sx.info; }
  result.context = []; result.caveats = [];
  var dirSign = outlook=="bullish" ? 1 : (outlook=="bearish" ? -1 : 0);
  for(var e2=0; e2<signals.length; e2++){
    var sx = signals[e2];
    var item = { id:sx.id, key:sx.key, vars:sx.vars, weight:sx.weight, context:isContext(sx) };
    if(sx.dir>0) result.bullEvidence.push(item);
    else if(sx.dir<0) result.bearEvidence.push(item);
    else {
      result.notes.push(item);
      if(isContext(sx)) result.context.push(item); else result.caveats.push(item);
    }
    if(dirSign!=0){
      if(sx.dir==dirSign) result.supports.push(item);
      else if(sx.dir==-dirSign) result.contradicts.push(item);
      else if(!isContext(sx)) result.contradicts.push(item);
    }
  }
  // Index divergence is a caveat even though each index is scored separately.
  if(niftyDay!=null && bnDay!=null && ((niftyDay>=RULES.DAY_MOVE_PCT && bnDay<=-RULES.DAY_MOVE_PCT) || (niftyDay<=-RULES.DAY_MOVE_PCT && bnDay>=RULES.DAY_MOVE_PCT))){
    var dvg = { id:"diverge", key:"dir.s.diverge", vars:{}, weight:0, context:false };
    result.notes.push(dvg); result.caveats.push(dvg); if(dirSign!=0) result.contradicts.push(dvg);
  }
  // Limits note: which inputs are not connected / not used.
  result.limits = inputs.filter(function(x){ return !x.used && x.id!="natgas"; }).map(function(x){ return x.id; });

  // -- Stage: early / developing / confirmed (only for a directional outlook)
  if(dirSign!=0){
    var stage = "early";
    var emaAligned = nTech && ((dirSign>0 && nTech.bull) || (dirSign<0 && nTech.bear));
    var brkSame = nTech && nTech.brk.dir==dirSign ? nTech.brk.state : "none";
    var bnAligned = bTech && ((dirSign>0 && bTech.bull) || (dirSign<0 && bTech.bear));
    var established = emaAligned && nTech.held >= RULES.ESTABLISHED_SESSIONS && bnAligned && bTech.held >= RULES.ESTABLISHED_SESSIONS;
    // developing: EMA trend is aligned and has some backing (held beyond the
    // fresh-crossover window, BANK NIFTY agrees, or a level is being held);
    // or a level break is holding even though the EMAs have not caught up.
    var emaBacked = emaAligned && (nTech.held > RULES.CROSS_LOOKBACK || bnAligned || brkSame=="developing" || brkSame=="confirmed");
    if(emaBacked) stage = "developing";
    else if(brkSame=="developing" || brkSame=="confirmed") stage = "developing";
    // confirmed: closing-price break confirmed with EMAs aligned, or an
    // established trend on both indices, and little evidence against.
    var calm = !conflict && (againstP/(forP||1)) < 0.34;
    if(calm && ((brkSame=="confirmed" && emaAligned) || established)) stage = "confirmed";
    result.stage = stage;
  }

  // -- Confidence (qualitative, separate from direction)
  var conf = "low";
  if(outlook=="bullish" || outlook=="bearish"){
    var ratio = forP>0 ? againstP/forP : 1;
    if(result.coverage >= 0.6 && ratio < 0.5) conf = "moderate";
    if(result.stage=="confirmed" && result.coverage >= 0.75 && ratio < 0.25) conf = "high";
    // caps: elevated volatility, unusually volatile crude, delayed data in-session
    // today's candle is still forming while the session is open, so the
    // top level is only reachable on completed-session (closing) data.
    if(conf=="high" && (vixHigh || crudeHigh || sessionOpen)) conf = "moderate";
    if(vixHigh && conf!="low") conf = "moderate";
  } else if(outlook=="neutral"){
    conf = result.coverage >= 0.6 ? "moderate" : "low";
  }
  if(anyUncertain && conf=="high") conf = "moderate";
  if(anyUncertain) result.reasons.push({ key:"dir.why.session_uncertain", vars:{} });
  result.confidence = conf;
  result.volatilityCaution = vixHigh || crudeHigh;

  // -- Levels and what-to-watch conditions (computed from real values)
  if(nTech){
    result.levels = { support:nTech.support, resistance:nTech.resistance, ema9:nTech.ema9, ema21:nTech.ema21, close:nTech.close };
    var Lv = { lvlR:fmtNum(nTech.resistance), lvlS:fmtNum(nTech.support), e9:fmtNum(nTech.ema9), e21:fmtNum(nTech.ema21) };
    if(outlook=="bullish"){
      if(!(nTech.brk.dir>0 && nTech.brk.state=="confirmed")) result.strengthen.push({ key:"dir.c.bull_close", vars:{ lvl:Lv.lvlR } });
      result.strengthen.push({ key:"dir.c.bull_ema", vars:{ e9:Lv.e9, e21:Lv.e21 } });
      if(bTech && !(bTech.brk.dir>0)) result.strengthen.push({ key:"dir.c.bull_bn", vars:{ lvl:fmtNum(bTech.resistance) } });
      result.strengthen.push({ key:"dir.c.bull_sector", vars:{} });
      result.weaken.push({ key:"dir.w.bull_ema", vars:{ e21:Lv.e21 } });
      result.weaken.push({ key:"dir.w.bull_inval", vars:{ lvl:Lv.lvlS } });
      result.weaken.push({ key:"dir.w.vix_up", vars:{} });
    } else if(outlook=="bearish"){
      if(!(nTech.brk.dir<0 && nTech.brk.state=="confirmed")) result.strengthen.push({ key:"dir.c.bear_close", vars:{ lvl:Lv.lvlS } });
      result.strengthen.push({ key:"dir.c.bear_ema", vars:{ e9:Lv.e9, e21:Lv.e21 } });
      if(bTech && !(bTech.brk.dir<0)) result.strengthen.push({ key:"dir.c.bear_bn", vars:{ lvl:fmtNum(bTech.support) } });
      result.strengthen.push({ key:"dir.c.bear_vix", vars:{} });
      result.weaken.push({ key:"dir.w.bear_ema", vars:{ e21:Lv.e21 } });
      result.weaken.push({ key:"dir.w.bear_inval", vars:{ lvl:Lv.lvlR } });
      result.weaken.push({ key:"dir.w.bear_sector", vars:{} });
    } else {
      result.strengthen.push({ key:"dir.c.neu_up", vars:{ lvl:Lv.lvlR } });
      result.strengthen.push({ key:"dir.c.neu_dn", vars:{ lvl:Lv.lvlS } });
      result.weaken.push({ key:"dir.w.neu", vars:{} });
    }
  } else {
    result.strengthen.push({ key:"dir.c.need_history", vars:{} });
  }
  return result;
}

function unavailableInputs(status){
  var ids = ["nifty_q","nifty_h","bn_q","bn_h","sectors","vix","crude","natgas","breadth","volume","fiidii","news"];
  return ids.map(function(id){ return mkInput(id, status, null, { reason: status=="DEMO" ? "demo" : "unavailable" }); });
  // Note: the panel feeds NO demo values to the engine, so when live data is
  // absent the honest status is UNAVAILABLE (see MarketMood.jsx).
}

// Plain-English one-paragraph summary for the existing Listen feature.
export function directionSpeech(d){
  if(!d) return "";
  var names = { bullish:"Bullish bias developing", bearish:"Bearish risk rising", neutral:"Neutral, no clear direction", insufficient:"Insufficient or stale data" };
  var p = "Early market direction: " + (names[d.outlook] || "unavailable") + ".";
  if(d.stage) p += " Signals are " + d.stage + ".";
  if(d.outlook!="insufficient"){ p += " Confidence is " + d.confidence + ". This describes how complete and consistent the evidence is, not a probability."; }
  p += " It is not a prediction or a trading instruction.";
  return p;
}
