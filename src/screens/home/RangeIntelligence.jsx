// BreakoutPro - RangeIntelligence.jsx
// Multi-Timeframe Split View Candlestick Station (Angel One style) for
// NIFTY / BANK NIFTY / SENSEX / FINNIFTY, built on real data already
// flowing through api/market-mood-data.js (mm.data.indices.* and
// mm.data.indexHistory.*).
//
// DATA HONESTY - read before changing anything:
// - "1D" (Daily) mode plots REAL daily high/low/close candles from
//   mm.data.indexHistory[SYM].candles (last ~10 real sessions). That feed
//   has no per-day OPEN, so each daily candle's open is CALCULATED as the
//   previous session's close (disclosed in-UI). Every H/L/C is real.
// - 5m / 10m / 15m / 1H: NO verified intraday tick/bar feed exists in this
//   codebase (confirmed - only one daily H/L/C per session is fetched).
//   These render a deterministic, seeded "INTERACTIVE PATTERN PREVIEW"
//   path anchored to REAL open/prevClose/ltp and clamped inside the REAL
//   day high/low, disclosed with a persistent banner. Never Math.random(),
//   never labeled LIVE. The final (forming) candle always closes exactly
//   at the real live price.
// - "Range Channel" single-view mode draws zero candles - a pure real-data
//   channel of today's high/low/CPR, same numbers as the Range Summary.
// - Stock search: ALL_NSE_STOCKS/DEMO_STOCKS (src/data/marketsStocks.js) is
//   a STATIC, hardcoded reference list (ltp/chgPct only - no open/high/low/
//   prevClose, and its own filename says DEMO). It is fine as the searchable
//   SYMBOL UNIVERSE (names/tickers don't go stale), but it is NOT a live
//   per-stock feed. Selecting an equity therefore shows its reference price
//   labeled EDUCATIONAL DEMO and an honest NOT AVAILABLE state for the
//   chart/CPR/range analytics - it never fabricates a candle path or S/R
//   levels from a frozen demo number pretending to be a live session. Only
//   NIFTY / BANK NIFTY / SENSEX / FINNIFTY have a real live feed
//   (mm.data.indices) and get the full split-view charting engine.
// - F&O Option Scalper split view (layoutMode "fno"): there is NO live
//   option-chain / per-strike premium feed anywhere in this codebase. This
//   mode does NOT invent a realistic-looking "live" option LTP. Instead:
//   strikes are CALCULATED from the real spot LTP (rounded to the index's
//   real strike step - 50 for NIFTY/FINNIFTY, 100 for BANKNIFTY/SENSEX), and
//   each option premium candle = REAL intrinsic value (max(spot-strike,0) or
//   max(strike-spot,0), driven by the same real/preview spot path) plus a
//   disclosed, deterministic (seeded, never Math.random) synthetic time-value
//   component that decays across the session to approximate theta. Every
//   option pane is permanently tagged "SIM PREMIUM" (never "LIVE" or
//   "PREVIEW") and carries a DEMO provenance badge, and the info panel
//   spells out that this is an illustrative premium model, not a broker
//   quote - a trader must not scalp real capital off these numbers.
//
// No second data pipeline, no fabricated fallbacks. Rules: no backtick
// literals, ASCII only.

import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { ALL_NSE_STOCKS } from "../../data/marketsStocks";
import ProvenanceBadge from "../../components/ProvenanceBadge";
import PatternInfoModal from "../../components/PatternInfoModal";
import { detectCandlePatterns, summarizePatterns, ALL_PATTERN_NAMES } from "../../utils/candlePatterns";

var INSTRUMENTS = [
  { key:"NIFTY", label:"NIFTY 50" },
  { key:"BANKNIFTY", label:"BANK NIFTY" },
  { key:"SENSEX", label:"SENSEX" },
  { key:"FINNIFTY", label:"FINNIFTY" }
];

// Top F&O quick-pick pills shown in the header - a mix of the 4 real
// indices and a few of the most-traded stocks from the symbol universe.
var QUICK_PICKS = [
  { key:"NIFTY", kind:"index", label:"NIFTY 50" },
  { key:"BANKNIFTY", kind:"index", label:"BANK NIFTY" },
  { key:"RELIANCE", kind:"equity", label:"RELIANCE" },
  { key:"HDFCBANK", kind:"equity", label:"HDFCBANK" },
  { key:"TCS", kind:"equity", label:"TCS" },
  { key:"ICICIBANK", kind:"equity", label:"ICICIBANK" },
  { key:"SBIN", kind:"equity", label:"SBIN" }
];

// Combined searchable universe: 4 real indices + every symbol in the
// static equity reference list. Search itself is real (it matches real
// ticker/company names) - only the resulting equity PRICE data is demo.
var SEARCH_UNIVERSE = INSTRUMENTS.map(function(i){
  return { key:i.key, kind:"index", label:i.label, sub:"Index" };
}).concat(ALL_NSE_STOCKS.map(function(s){
  return { key:s.sym, kind:"equity", label:s.sym, sub:s.name || s.sect || "Equity" };
}));

function searchSymbols(query, limit){
  var q = (query||"").trim().toUpperCase();
  if(!q) return [];
  var starts = [], contains = [];
  for(var i=0;i<SEARCH_UNIVERSE.length;i++){
    var item = SEARCH_UNIVERSE[i];
    var hay = (item.key + " " + (item.sub||"")).toUpperCase();
    if(item.key.toUpperCase().indexOf(q)==0) starts.push(item);
    else if(hay.indexOf(q)>=0) contains.push(item);
  }
  return starts.concat(contains).slice(0, limit||8);
}
function findEquity(sym){
  for(var i=0;i<ALL_NSE_STOCKS.length;i++){ if(ALL_NSE_STOCKS[i].sym==sym) return ALL_NSE_STOCKS[i]; }
  return null;
}

var TIMEFRAMES = [
  { key:"1m", label:"1m", minutes:1, kind:"preview" },
  { key:"3m", label:"3m", minutes:3, kind:"preview" },
  { key:"5m", label:"5m", minutes:5, kind:"preview" },
  { key:"10m", label:"10m", minutes:10, kind:"preview" },
  { key:"15m", label:"15m", minutes:15, kind:"preview" },
  { key:"1h", label:"1H", minutes:60, kind:"preview" },
  { key:"1D", label:"1D", minutes:375, kind:"daily" }
];
var SPLIT_TF_KEYS = ["5m", "10m", "15m", "1h"];
// Full chart-first timeframe row for the SINGLE view selector - every
// timeframe Range Intelligence Single Mode must support (1m/3m/5m/10m/
// 15m/1H/1D), all reading the exact same candlesByTf pipeline and the
// exact same pattern-detection engine (candlePatterns.js) - no separate
// engine or calculation per timeframe (Multi-TF keeps its own
// SPLIT_TF_KEYS set above, unchanged).
var SINGLE_TF_KEYS = ["1m", "3m", "5m", "10m", "15m", "1h", "1D"];

// Scalper timeframes for the F&O Option Scalper split view - shorter bars
// than the Multi-TF view since option premiums move faster than the spot.
var FNO_TIMEFRAMES = [
  { key:"1m", label:"1m", minutes:1, kind:"preview" },
  { key:"3m", label:"3m", minutes:3, kind:"preview" },
  { key:"5m", label:"5m", minutes:5, kind:"preview" },
  { key:"15m", label:"15m", minutes:15, kind:"preview" }
];
function fnoTfByKey(key){
  for(var i=0;i<FNO_TIMEFRAMES.length;i++){ if(FNO_TIMEFRAMES[i].key==key) return FNO_TIMEFRAMES[i]; }
  return FNO_TIMEFRAMES[2];
}

// Real strike step per index (NSE convention) - used to CALCULATE strikes
// from the real spot LTP. Never a guessed/hardcoded strike number.
var STRIKE_STEP = { NIFTY:50, FINNIFTY:50, BANKNIFTY:100, SENSEX:100 };
function buildStrikeLadder(symKey, spot){
  var step = STRIKE_STEP[symKey] || 50;
  var atm = Math.round(spot/step) * step;
  return {
    step:step,
    atm:atm,
    ceStrike: atm,          // ATM Call
    peStrike: atm - step,   // near OTM Put
    itmCeStrike: atm - step*4 // deeper ITM Call
  };
}

var CHART_MODES = ["Candlestick", "Line", "Area", "Range Channel"];

var SENT_GREEN = "#16A34A";
var SENT_RED = "#DC2626";
var SENT_YELLOW = "#EAB308";

function tfByKey(key){
  for(var i=0;i<TIMEFRAMES.length;i++){ if(TIMEFRAMES[i].key==key) return TIMEFRAMES[i]; }
  return TIMEFRAMES[0];
}
function fmtNum(v){
  return v==null ? "--" : v.toLocaleString("en-IN");
}

// ---------------------------------------------------------------------
// Real CPR / pivot - same methodology already shipped on Home.
// ---------------------------------------------------------------------
function computeCPR(idx){
  if(!idx || idx.ltp==null || idx.high==null || idx.low==null || idx.high<=idx.low) return null;
  var pivot = (idx.high + idx.low + idx.ltp) / 3;
  var bc = (idx.high + idx.low) / 2;
  var tc = (2 * pivot) - bc;
  var r1 = (2*pivot) - idx.low;
  var s1 = (2*pivot) - idx.high;
  var r2 = pivot + (idx.high - idx.low);
  var s2 = pivot - (idx.high - idx.low);
  var widthPct = (Math.abs(tc - bc) / pivot) * 100;
  return {
    pivot: Math.round(pivot*100)/100,
    bc: Math.round(Math.min(bc,tc)*100)/100,
    tc: Math.round(Math.max(bc,tc)*100)/100,
    r1: Math.round(r1*100)/100,
    s1: Math.round(s1*100)/100,
    r2: Math.round(r2*100)/100,
    s2: Math.round(s2*100)/100,
    widthPct: Math.round(widthPct*10000)/10000,
    status: widthPct < 0.15 ? "Narrow CPR" : "Wide CPR",
    note: widthPct < 0.15 ? "Potential volatile move" : "Range-bound bias"
  };
}

function computeRange(idx){
  if(!idx || idx.ltp==null || idx.high==null || idx.low==null || idx.high<=idx.low) return null;
  var width = idx.high - idx.low;
  var rawPosPct = ((idx.ltp - idx.low) / width) * 100;
  var posPct = Math.round(Math.max(0, Math.min(100, rawPosPct)) * 10) / 10;
  var distToHigh = Math.round((idx.high - idx.ltp) * 100) / 100;
  var distToLow = Math.round((idx.ltp - idx.low) * 100) / 100;
  var distToHighPct = Math.round((distToHigh / idx.ltp) * 10000) / 100;
  var distToLowPct = Math.round((distToLow / idx.ltp) * 10000) / 100;
  var zone = posPct<=20?"Near Low":(posPct<=40?"Lower Range":(posPct<=60?"Mid Range":(posPct<=80?"Upper Range":"Near High")));
  var state = posPct>=80 ? "Breakout Watch" : (posPct<=20 ? "Breakdown Watch" : "Balanced");
  return {
    ltp:idx.ltp, high:idx.high, low:idx.low, width:Math.round(width*100)/100,
    widthPct: Math.round((width/idx.ltp)*10000)/100,
    posPct:posPct, zone:zone, distToHigh:distToHigh, distToLow:distToLow,
    distToHighPct:distToHighPct, distToLowPct:distToLowPct, state:state
  };
}

// ---------------------------------------------------------------------
// IST session clock - local UI convenience only (9:15-15:30 IST, Mon-Fri).
// Never used to overwrite the server's own freshness/status fields.
// ---------------------------------------------------------------------
function getIST(){
  try{
    return new Date(new Date().toLocaleString("en-US", { timeZone:"Asia/Kolkata" }));
  }catch(e){
    return new Date();
  }
}
function sessionInfo(now){
  var day = now.getDay();
  var mins = now.getHours()*60 + now.getMinutes() + (now.getSeconds()/60);
  var openMin = 9*60 + 15;
  var closeMin = 15*60 + 30;
  var isWeekday = day>=1 && day<=5;
  var isOpen = isWeekday && mins>=openMin && mins<closeMin;
  var elapsed = Math.max(0, Math.min(closeMin-openMin, mins-openMin));
  return { isOpen:isOpen, elapsedMin:elapsed, openMin:openMin, closeMin:closeMin, totalMin:closeMin-openMin };
}
function fmtCountdown(s){
  if(s==null) return null;
  var m = Math.floor(s/60), sec = s%60;
  return (m<10?"0":"")+m+":"+(sec<10?"0":"")+sec;
}
var SESSION_START_MIN = 9*60 + 15;
// Real trading-session clock label for an absolute minute-of-day value,
// e.g. 555 -> "09:15". Used for every intraday X-axis label - never a raw
// sequence index.
function clockLabel(absMin){
  var h = Math.floor(absMin/60) % 24;
  var m = Math.round(absMin) % 60;
  var pad = function(n){ return (n<10?"0":"")+n; };
  return pad(h)+":"+pad(m);
}

// ---------------------------------------------------------------------
// Deterministic seeded generator (Math.sin based - NOT Math.random).
// Anchored to real open -> real ltp, clamped within real high/low.
// ---------------------------------------------------------------------
function seeded(n){
  var x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
}

// Standard 9-period EMA over an array of {c:...} candles - pure real
// arithmetic on whatever closes are already plotted (real daily closes, or
// the disclosed preview/SIM series). Computed once over the FULL series so
// the line stays continuous as the visible zoom/pan window slides, exactly
// like a real charting library.
function computeEMA(arr, period){
  if(!arr || !arr.length) return [];
  var k = 2/(period+1);
  var out = new Array(arr.length);
  var prev = arr[0].c;
  out[0] = prev;
  for(var i=1;i<arr.length;i++){
    prev = arr[i].c*k + prev*(1-k);
    out[i] = prev;
  }
  return out;
}
function generatePreviewCandles(anchor, count, seedBase, minutesPerCandle){
  var open = anchor.open!=null ? anchor.open : anchor.prevClose;
  var ltp = anchor.ltp;
  var high = anchor.high;
  var low = anchor.low;
  if(open==null || ltp==null || high==null || low==null || count<1) return [];
  var range = Math.max(0.01, high-low);
  function clampPrice(v){ return Math.max(low, Math.min(high, v)); }
  // Rounding precision scales with the day's real range instead of a flat
  // 2 decimals: at NIFTY/BANKNIFTY/SENSEX/FINNIFTY price levels (ranges in
  // the tens-hundreds) 2 decimals is already fine, but for a much smaller
  // reference price/range a flat 0.01 step is a coarse chunk of the whole
  // range and can quantize an intended small body down to 0.00 - which is
  // what was inflating the wick/body RATIO (not the wick itself) for very
  // low-priced instruments. This keeps every price realistic for its own
  // scale without changing anything for the app's real (index-level) feed.
  var pxDecimals = range<2 ? 4 : (range<20 ? 3 : 2);
  var pxMul = Math.pow(10, pxDecimals);
  function roundPx(v){ return Math.round(v*pxMul)/pxMul; }

  // Multi-phase organic market path - replaces the old sine-wave oscillator
  // (which made every bar the same height, like a barcode, and made the 9
  // EMA wiggle erratically). Real charts move in distinct phases: an
  // impulsive trend leg, a pullback/consolidation base, then a secondary
  // breakout or reversal rally back to the real live price. Everything
  // below is still deterministic (seeded, never Math.random) and every
  // candle is still hard-clamped inside today's real high/low.
  var wp0 = open;
  var wp1 = clampPrice(open + (seeded(seedBase*3.1)-0.5) * range * 0.9);   // phase 1 impulse target
  var wp2 = clampPrice(wp1 + (seeded(seedBase*5.7)-0.5) * range * 0.5);    // phase 2 pullback/base
  var wp3 = ltp;                                                          // phase 3 lands on the real price
  var b1 = Math.max(1, Math.round(count * (0.32 + seeded(seedBase*2.1)*0.14)));   // ~32-46% of bars
  var b2 = Math.max(b1+1, Math.min(count-1, Math.round(count * (0.62 + seeded(seedBase*4.4)*0.14)))); // ~62-76%

  var out = [];
  var prevClose = open;
  for(var i=0;i<count;i++){
    var phase, segStart, segEnd, from, to, bodyScale, wickScale;
    if(i < b1){
      // Phase 1: directional trending impulse - consecutive same-bias bars.
      phase=0; segStart=0; segEnd=b1; from=wp0; to=wp1; bodyScale=0.11; wickScale=1.08;
    } else if(i < b2){
      // Phase 2: pullback / consolidation base - tight bodies, small range.
      phase=1; segStart=b1; segEnd=b2; from=wp1; to=wp2; bodyScale=0.045; wickScale=0.72;
    } else {
      // Phase 3: secondary breakout/reversal rally back to the real price.
      phase=2; segStart=b2; segEnd=count; from=wp2; to=wp3; bodyScale=0.10; wickScale=1.0;
    }
    var segLen = Math.max(1, segEnd-segStart);
    var localProgress = (i - segStart + 1) / segLen;
    var target = from + (to-from) * localProgress;
    // Real price distribution: most bars are ordinary, but a seeded "burst"
    // factor occasionally expands a trend-phase bar into a marubozu-style
    // wide-body impulse bar, or shrinks a consolidation bar into a tight
    // doji - varied body sizes instead of a uniform staircase.
    var burst = seeded(seedBase + i*9.17);
    var burstMult = phase==1 ? (burst>0.85 ? 0.35 : 1) : (burst>0.82 ? 1.8 : (burst<0.15 ? 0.4 : 1));
    var noise = (seeded(seedBase + i*3.113) - 0.5) * range * bodyScale * burstMult;
    var close = clampPrice(target + noise);
    var body = Math.abs(close-prevClose);
    // TOTAL wick budget (both sides combined) is drawn from a distribution
    // that targets real-market proportions, independent of the day's whole
    // range: ~80% of candles total wick <=1.0x body, ~15% land 1.0x-1.5x,
    // ~3.5% land 1.5x-2.0x, and only ~1.5% (rare) reach 2.0x-3.0x - that
    // last sliver is what still lets a genuine Hammer/Shooting-Star-shaped
    // bar occur occasionally for the (unmodified) pattern detector to find,
    // without making long wicks the norm. refBody floors a near-zero real
    // body to a small, fixed fraction of the day's range purely so a true
    // doji-like bar still gets a believable small range instead of
    // collapsing to zero height - the floor itself is tiny on purpose so it
    // can never become a hidden source of exaggerated wicks.
    var wickRoll = seeded(seedBase + i*7.71);
    var totalWickFactor =
      wickRoll>0.985 ? (2.0 + (wickRoll-0.985)*66.7) :  // ~1.5% of bars: 2.0x-3.0x body
      wickRoll>0.95  ? (1.5 + (wickRoll-0.95)*14.3)  :  // ~3.5% of bars: 1.5x-2.0x body
      wickRoll>0.80  ? (1.0 + (wickRoll-0.80)*3.33)  :  // ~15% of bars: 1.0x-1.5x body
                        (0.1 + wickRoll*1.125);          // ~80% of bars: 0.1x-1.0x body
    var refBody = Math.max(body, range*0.004);
    var totalWick = Math.min(totalWickFactor * refBody * wickScale, range*0.22);
    // Split the total wick budget between the top and bottom of the candle.
    // A uniform 0-1 split fraction naturally produces mostly-balanced bars
    // with an occasional heavily one-sided bar (the shape a genuine Hammer
    // or Shooting Star needs) without a separate special-cased generator.
    var skewUp = seeded(seedBase + i*11.31);
    var wickUp = totalWick * skewUp;
    var wickDown = totalWick * (1-skewUp);
    var barHigh = clampPrice(Math.max(prevClose, close) + wickUp);
    var barLow = clampPrice(Math.min(prevClose, close) - wickDown);
    // Illustrative-only volume (no real volume feed exists) - deterministic
    // from the same seed + how large the candle's real move was, normalized
    // 0..1. Only ever drawn on preview-mode panes, which already carry the
    // persistent PREVIEW disclosure.
    var volRaw = 0.22 + 0.78*seeded(seedBase + i*5.47) * (0.4 + Math.abs(close-prevClose)/range);
    out.push({
      i:i, o:roundPx(prevClose), h:roundPx(Math.max(barHigh,prevClose,close)),
      l:roundPx(Math.min(barLow,prevClose,close)), c:roundPx(close),
      t: SESSION_START_MIN + i*minutesPerCandle,
      label: clockLabel(SESSION_START_MIN + i*minutesPerCandle),
      vol: Math.max(0.08, Math.min(1, volRaw))
    });
    prevClose = close;
  }
  if(out.length){
    var last = out[out.length-1];
    last.c = roundPx(ltp);
    last.h = roundPx(Math.max(last.h, last.c));
    last.l = roundPx(Math.min(last.l, last.c));
  }
  return out;
}

// ---------------------------------------------------------------------
// Option premium SIMULATION (never a live option-chain feed - none exists
// in this codebase). Every bar's REAL component is the intrinsic value,
// driven by the same spot candle path already anchored to real
// open/prevClose/ltp/high/low. The extrinsic (time-value) component is a
// disclosed, deterministic (seeded, never Math.random) approximation that
// decays across the session to loosely mimic theta - it is NOT a quoted
// premium and must never be shown without the SIM PREMIUM tag.
// ---------------------------------------------------------------------
function generateOptionPremiumCandles(spotCandles, strike, optType, spotAnchor, seedBase){
  if(!spotCandles || spotCandles.length<1) return [];
  var n = spotCandles.length;
  var spotSpan = Math.max(1, (spotAnchor.high||0) - (spotAnchor.low||0));
  var atmRef = spotAnchor.ltp!=null ? spotAnchor.ltp : strike;
  var distFromAtm = Math.abs(strike - atmRef);
  // Near-the-money strikes carry more time value; far strikes (deep ITM or
  // far OTM) carry less - a standard, disclosed simplification.
  var extrinsicCap = Math.max(1, spotSpan * 0.35) * Math.max(0.12, 1 - (distFromAtm / Math.max(1, spotSpan*4)));
  function intr(v){ return optType=="CE" ? Math.max(0, v-strike) : Math.max(0, strike-v); }
  var out = [];
  for(var i=0;i<n;i++){
    var sc = spotCandles[i];
    var progress = (i+1)/n;
    var decay = Math.max(0.2, 1 - progress*0.65); // theta-style decay across the session
    var noise = (seeded(seedBase + i*4.21) - 0.5) * extrinsicCap * 0.3;
    var extrO = Math.max(0, extrinsicCap*decay + noise);
    var extrC = Math.max(0, extrinsicCap*decay*(1 - progress*0.05) + noise*0.8);
    var o = Math.max(0.05, intr(sc.o) + extrO);
    var c = Math.max(0.05, intr(sc.c) + extrC);
    var hIntr = optType=="CE" ? intr(sc.h) : intr(sc.l);
    var lIntr = optType=="CE" ? intr(sc.l) : intr(sc.h);
    var h = Math.max(o, c, hIntr + extrO*0.9);
    var l = Math.max(0.05, Math.min(o, c, lIntr*0.6 + extrC*0.7));
    out.push({
      i:i, o:Math.round(o*100)/100, h:Math.round(Math.max(h,o,c)*100)/100,
      l:Math.round(Math.max(0.05, Math.min(l,o,c))*100)/100, c:Math.round(c*100)/100,
      t: sc.t, label: sc.label
    });
  }
  return out;
}

// Real daily candles - no per-candle calendar date is exposed by the data
// source, so sessions are labeled by relative offset ("S-3" = 3 sessions
// ago) rather than fabricating a date.
function buildDailyCandles(hist){
  if(!hist || !hist.candles || hist.candles.length<2) return [];
  var arr = hist.candles;
  var out = [];
  for(var i=1;i<arr.length;i++){
    var prev = arr[i-1], cur = arr[i];
    if(cur.h==null || cur.l==null || cur.c==null) continue;
    out.push({ i:i-1, o:prev.c, h:Math.max(cur.h, prev.c, cur.c), l:Math.min(cur.l, prev.c, cur.c), c:cur.c, label: i==arr.length-1 ? "Today" : ("S-"+(arr.length-1-i)) });
  }
  return out;
}

// ---------------------------------------------------------------------
// detectPattern(candles) - thin wrapper kept for the existing call sites
// (the header pattern pill for each timeframe/F&O pane). ALL real
// detection logic now lives in one reusable module (src/utils/
// candlePatterns.js) instead of being duplicated here - this just asks
// that module for the pattern belonging to the LAST candle in the given
// array, which is exactly what every caller below already expects.
// ---------------------------------------------------------------------
function detectPattern(candles){
  if(!candles || !candles.length) return null;
  var hit = patternAtIndex(candles, candles.length-1);
  if(!hit) return null;
  return { name:hit.name, dir:hit.dir, desc:hit.reason };
}

// Exact-index lookup used both by detectPattern() above and by the
// chart's crosshair tooltip (hoveredPattern below) - single source of
// truth, see src/utils/candlePatterns.js for every rule and formula.
function patternAtIndex(candles, index){
  var all = detectCandlePatterns(candles);
  for(var i=0; i<all.length; i++){
    if(all[i].index==index) return all[i];
  }
  return null;
}

// ---------------------------------------------------------------------
// Range Intelligence UI-layer-only helpers: these never detect or compute
// a pattern themselves - they just relabel/color a pattern name that
// candlePatterns.js already returned. displayPatternName() maps the raw
// structural names "W Pattern"/"M Pattern" to the trader-friendly strings
// the spec calls for, everywhere a pattern name is shown (chart popover
// header, Pattern Summary Panel, pattern table). patternBias() is the
// fixed bullish/bearish/neutral direction map for the pattern table's
// Bias column.
// ---------------------------------------------------------------------
function displayPatternName(name){
  if(name=="W Pattern") return "W PATTERN - Double Bottom";
  if(name=="M Pattern") return "M PATTERN - Double Top";
  return name;
}
var BULLISH_PATTERN_NAMES = { "Hammer":1, "Inverted Hammer":1, "Bullish Engulfing":1, "Bullish Harami":1, "Morning Star":1, "Piercing Line":1, "Three White Soldiers":1, "W Pattern":1 };
var BEARISH_PATTERN_NAMES = { "Shooting Star":1, "Hanging Man":1, "Bearish Engulfing":1, "Bearish Harami":1, "Evening Star":1, "Dark Cloud Cover":1, "Three Black Crows":1, "M Pattern":1 };
function patternBias(name){
  if(BULLISH_PATTERN_NAMES[name]) return "Bullish";
  if(BEARISH_PATTERN_NAMES[name]) return "Bearish";
  return "Neutral";
}

// ---------------------------------------------------------------------
// Candle Confirmation - presentation-layer-only short explanations, same
// kind of helper as displayPatternName()/patternBias() above: it does not
// detect or classify anything, it only labels a name candlePatterns.js
// already returned. One short trader-friendly line per pattern name (not
// the longer "reason"/educational text used elsewhere) per the "keep it
// compact, no long paragraphs" requirement.
// ---------------------------------------------------------------------
var CANDLE_CONFIRMATION_NOTES = {
  "Bullish Engulfing": "Buyers have taken control of the latest candle.",
  "Bearish Engulfing": "Sellers have taken control of the latest candle.",
  "Hammer": "Sellers pushed lower but buyers regained control into the close.",
  "Inverted Hammer": "Buyers attempted a push higher after selling pressure.",
  "Shooting Star": "Buyers pushed higher but sellers regained control into the close.",
  "Hanging Man": "A caution sign after an uptrend - sellers tested control.",
  "Morning Star": "A bullish reversal sequence completed over three candles.",
  "Evening Star": "A bearish reversal sequence completed over three candles.",
  "Piercing Line": "Buyers reversed more than half of the prior down move.",
  "Dark Cloud Cover": "Sellers reversed more than half of the prior up move.",
  "Three White Soldiers": "Three straight strong up candles show sustained buying.",
  "Three Black Crows": "Three straight strong down candles show sustained selling.",
  "Bullish Harami": "Momentum is stalling after a down move - buyers stepping in.",
  "Bearish Harami": "Momentum is stalling after an up move - sellers stepping in.",
  "W Pattern": "Price tested a level twice and held - a potential double bottom.",
  "M Pattern": "Price tested a level twice and failed - a potential double top.",
  "Doji": "Indecision - wait for the next candle.",
  "Spinning Top": "Indecision - buyers and sellers are evenly matched."
};
var CANDLE_CONFIRMATION_NO_PATTERN_NOTE = "Waiting for a confirmed price-action signal.";

// ---------------------------------------------------------------------
// CandleChart - TradingView-style pane: right price ruler, bottom time
// ruler, CPR band + High/Low lines, mouse wheel zoom, drag pan, touch pan
// + pinch-zoom, crosshair with floating OHLC tooltip. Y-axis auto-scales
// from the VISIBLE slice only. `compact` shrinks paddings/fonts so the
// same component works as a 2x2 split-view pane at ~190px tall.
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// Responsive candle geometry - keyed off the chart's ACTUAL rendered pixel
// width (measured via ResizeObserver below), never the browser window
// width. This is what makes a phone's full-width single chart AND a
// quarter-width desktop split-view pane both look right: a narrow pane on
// a big laptop screen still gets the "mobile" treatment it visually needs,
// and vice versa. Each tier targets a real body-width + gap (the actual
// legibility complaint), and the candle COUNT is derived from that target
// rather than the other way around - exactly how TradingView/Angel One
// keep bars crisp at any panel size instead of cramming a fixed count into
// whatever width happens to be available.
// ---------------------------------------------------------------------
// zoomMin is the floor for how far the user can zoom IN (mouse wheel /
// pinch) - deliberately higher than a bare minimum so 2-3 candles can
// never end up stretched across the whole pane looking "giant" (the
// professional-chart complaint). min (the default/reset view) stays
// separate and is already comfortably above this floor.
function tierConfigFor(chW){
  if(chW < 480) return { body:7, gap:2, min:22, max:38, ceiling:11, zoomMin:10 }; // phone-width panels
  if(chW < 820) return { body:6, gap:2.2, min:32, max:55, ceiling:11, zoomMin:12 }; // tablet / medium panes
  return { body:5, gap:2.5, min:45, max:90, ceiling:12, zoomMin:14 };               // laptop/desktop width
}
function defaultVisibleCount(chW, padL, padR, candlesLen){
  var plotW = Math.max(10, chW - padL - padR);
  var tier = tierConfigFor(chW);
  var raw = Math.round(plotW / (tier.body + tier.gap));
  var count = Math.max(tier.min, Math.min(tier.max, raw));
  return Math.max(1, Math.min(candlesLen || count, count));
}

function CandleChart(props){
  var theme = props.theme;
  var candles = props.candles || [];
  var mode = props.mode || "Candlestick";
  var dayHigh = props.dayHigh, dayLow = props.dayLow, cpr = props.cpr, ltp = props.ltp;
  var isPreview = props.isPreview;
  var compact = !!props.compact;
  // fill: the chart stretches to exactly fill its (flex/grid) parent's real
  // box via CSS 100%/100% + preserveAspectRatio="none", instead of a fixed
  // pixel height. chH below stays a virtual coordinate-space constant used
  // only for internal math (padding ratios, font sizes) - the actual
  // rendered pixel height comes from the parent container's flex sizing,
  // which is how the chart canvas expands to fill all remaining viewport
  // height instead of a guessed calc(100vh - Npx).
  var fill = !!props.fill;
  var previewLabel = props.previewLabel || "PREVIEW";

  var svgRef = useRef(null);
  var wrapRef = useRef(null);
  var dragRef = useRef(null);
  var pinchRef = useRef(null);

  // Measure the wrapper's ACTUAL rendered pixel box (not the browser window)
  // so the SVG's virtual coordinate space can be set to real pixels 1:1 -
  // this is what makes candle-width math below mean what it says instead of
  // being stretched/squashed by preserveAspectRatio scaling a fixed 640-unit
  // canvas onto whatever real width the container happens to have.
  var [measuredW, setMeasuredW] = useState(0);
  var [measuredH, setMeasuredH] = useState(0);
  var measuredOnceRef = useRef(false);
  useLayoutEffect(function(){
    var el = wrapRef.current;
    if(!el) return;
    function measure(){
      var w = el.clientWidth, h = el.clientHeight;
      if(w>0) setMeasuredW(w);
      if(h>0) setMeasuredH(h);
    }
    measure();
    var ro = null;
    if(typeof ResizeObserver!="undefined"){
      ro = new ResizeObserver(function(){ measure(); });
      ro.observe(el);
    } else {
      window.addEventListener("resize", measure);
    }
    return function(){
      if(ro) ro.disconnect(); else window.removeEventListener("resize", measure);
    };
  }, []);

  var chW = measuredW>0 ? Math.round(measuredW) : (compact ? 320 : 900);
  var chH = props.height || (measuredH>0 ? Math.round(measuredH) : (compact ? 200 : 340));
  var padL = 6, padR = compact ? 46 : 62, padT = compact ? 8 : 14, padB = compact ? 18 : 26;
  var plotW = chW - padL - padR;
  var plotH = chH - padT - padB;
  var fs = compact ? 8 : 9;

  // Responsive default visible-candle window (see tierConfigFor/
  // defaultVisibleCount above) - keyed off the real measured width, so a
  // phone screen shows ~25-35 healthy-bodied candles and a laptop-width
  // panel shows ~55-65 slim ones, without cramming either into the other's
  // density.
  var defaultCount = defaultVisibleCount(chW, padL, padR, candles.length);
  var [visibleCount, setVisibleCount] = useState(defaultCount);
  var [viewEnd, setViewEnd] = useState(candles.length);
  var [hoverIdx, setHoverIdx] = useState(null);

  useEffect(function(){
    setVisibleCount(defaultVisibleCount(chW, padL, padR, candles.length));
    setViewEnd(candles.length);
    setHoverIdx(null);
    // eslint-disable-next-line
  }, [candles.length, mode]);

  // Re-apply the responsive default exactly once, the moment the real
  // container width is first measured (before that, chW falls back to a
  // generic guess) - keeps the initial paint from briefly showing the wrong
  // density on a phone vs a laptop. Later resizes intentionally do NOT reset
  // the user's chosen zoom/pan, matching how a real charting library behaves.
  useEffect(function(){
    if(measuredW>0 && !measuredOnceRef.current){
      measuredOnceRef.current = true;
      setVisibleCount(defaultVisibleCount(Math.round(measuredW), padL, padR, candles.length));
      setViewEnd(candles.length);
    }
    // eslint-disable-next-line
  }, [measuredW]);

  var vc = Math.max(2, Math.min(visibleCount, candles.length || 2));
  var ve = Math.max(vc, Math.min(viewEnd, candles.length));
  var vs = Math.max(0, ve - vc);
  var visible = candles.slice(vs, ve);

  // Y-axis viewport: fit ONLY the candles currently in view, not the full
  // day's High/Low. Previously dayHigh/dayLow were always folded into the
  // domain, so a zoomed-in/recent window (price sitting well inside the
  // day's range) still forced the axis to stretch across the ENTIRE day's
  // span - candles would end up compressed into a small band with large
  // blank areas above/below. Support/Resistance/CMP lines (levelLines,
  // drawn further below) already no-op when their price falls outside the
  // current [yMin,yMax] window, so this only changes how tightly the
  // viewport hugs the visible candles - no candle/indicator math changes.
  var minPrice, maxPrice;
  if(visible.length){
    var lows = visible.map(function(c){ return c.l; });
    var highs = visible.map(function(c){ return c.h; });
    minPrice = Math.min.apply(null, lows);
    maxPrice = Math.max.apply(null, highs);
  } else {
    // No candles to size from yet (e.g. still loading) - fall back to the
    // day's range so the empty chart isn't a degenerate 0-height domain.
    minPrice = dayLow!=null ? dayLow : 0;
    maxPrice = dayHigh!=null ? dayHigh : 1;
  }
  var priceRange = Math.max(maxPrice - minPrice, 0.01);
  // Padding is a max() of a proportional share of the VISIBLE range and a
  // small absolute floor tied to the day's REAL high/low span - the floor
  // is what stops a tight/few-candle window (small visible price range)
  // from reading as an exaggerated, zoomed-in-to-noise vertical scale; it
  // never changes any OHLC value, only how much empty margin frames them.
  var dayRangeKnown = (dayHigh!=null && dayLow!=null) ? (dayHigh-dayLow) : null;
  var padFloor = dayRangeKnown!=null ? Math.max(dayRangeKnown*0.025, 0.01) : 0.01;
  var padAmt = Math.max(priceRange*0.10, padFloor);
  var yMin = minPrice - padAmt;
  var yMax = maxPrice + padAmt;

  function yFor(v){
    return padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  }
  // When the visible series is too SHORT to naturally fill the pane at a
  // normal, un-stretched candle spacing (e.g. a 1H timeframe with only a
  // handful of bars for the day), candles are spaced at their natural
  // width and right-aligned - newest candle near the right edge, blank
  // chart area on the left - instead of being stretched thin across the
  // FULL plot width (the "5 candles spread across the whole chart, one
  // candle looks giant" complaint). A series long enough to fill the pane
  // keeps the original full-width, evenly distributed spacing unchanged.
  var chartTier = tierConfigFor(chW);
  var naturalSlot = chartTier.body + chartTier.gap;
  var useNaturalSpacing = visible.length>1 && (naturalSlot * visible.length) < plotW;
  function xFor(idx){
    if(visible.length<=1) return padL + plotW/2;
    if(useNaturalSpacing){
      var rightmostX = padL + plotW - naturalSlot/2;
      return rightmostX - (visible.length-1-idx)*naturalSlot;
    }
    return padL + (idx/(visible.length-1)) * plotW;
  }

  function clampView(newCount, newEnd){
    // Zoom-in floor is tier-aware (10-14 candles depending on pane width),
    // never a flat "3" - that is what previously let a wheel/pinch zoom
    // blow 2-3 candles up to dominate the whole chart. If the series
    // itself has fewer candles than the floor (e.g. a short 1D history),
    // the floor backs off to whatever actually exists instead of forcing
    // a count the data can't supply.
    var zoomFloor = Math.min(tierConfigFor(chW).zoomMin, candles.length || 3);
    var c = Math.max(zoomFloor, Math.min(newCount, candles.length || zoomFloor));
    var e = Math.max(c, Math.min(newEnd, candles.length));
    setVisibleCount(c);
    setViewEnd(e);
  }

  function handleWheel(e){
    e.preventDefault();
    var dir = e.deltaY>0 ? 1 : -1;
    clampView(visibleCount + dir*Math.max(2, Math.round(visibleCount*0.15)), viewEnd);
  }
  function handleMouseDown(e){
    dragRef.current = { x:e.clientX, startEnd:viewEnd };
  }
  function handleMouseMove(e){
    var rect = svgRef.current ? svgRef.current.getBoundingClientRect() : null;
    if(rect){
      var relX = (e.clientX - rect.left) / rect.width * chW;
      var idx = Math.round(((relX - padL) / plotW) * (visible.length-1));
      setHoverIdx(idx>=0 && idx<visible.length ? idx : null);
    }
    if(dragRef.current){
      var dx = e.clientX - dragRef.current.x;
      var barsShifted = Math.round(-dx / (plotW/Math.max(1,visible.length)) );
      clampView(visibleCount, dragRef.current.startEnd + barsShifted);
    }
  }
  function handleMouseUp(){ dragRef.current = null; }
  function handleMouseLeave(){ dragRef.current = null; setHoverIdx(null); }

  function touchDist(t){
    var dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }
  // Maps a touch's clientX to a hovered-candle index (same math as the mouse
  // crosshair) so a touch-and-hold shows the same floating OHLC/pattern
  // tooltip a mouse hover does - previously touch never called setHoverIdx
  // at all, so the crosshair tooltip could never appear on mobile.
  function hoverIdxForClientX(clientX){
    var rect = svgRef.current ? svgRef.current.getBoundingClientRect() : null;
    if(!rect) return null;
    var relX = (clientX - rect.left) / rect.width * chW;
    var i = Math.round(((relX - padL) / plotW) * (visible.length-1));
    return i>=0 && i<visible.length ? i : null;
  }
  function handleTouchStart(e){
    if(e.touches.length==2){
      pinchRef.current = { dist:touchDist(e.touches), count:visibleCount };
      dragRef.current = null;
    } else if(e.touches.length==1){
      dragRef.current = { x:e.touches[0].clientX, startEnd:viewEnd, moved:false };
      setHoverIdx(hoverIdxForClientX(e.touches[0].clientX));
    }
  }
  function handleTouchMove(e){
    if(e.cancelable) e.preventDefault();
    if(e.touches.length==2){
      // A second finger landing mid-gesture (or a fresh 2-finger start that
      // handleTouchStart missed) still pinches correctly.
      if(!pinchRef.current) pinchRef.current = { dist:touchDist(e.touches), count:visibleCount };
      var d = touchDist(e.touches);
      var ratio = pinchRef.current.dist / Math.max(1,d);
      clampView(Math.round(pinchRef.current.count * ratio), viewEnd);
    } else if(e.touches.length==1 && dragRef.current){
      var dx = e.touches[0].clientX - dragRef.current.x;
      if(Math.abs(dx)>3) dragRef.current.moved = true;
      var barsShifted = Math.round(-dx / (plotW/Math.max(1,visible.length)) );
      clampView(visibleCount, dragRef.current.startEnd + barsShifted);
      setHoverIdx(hoverIdxForClientX(e.touches[0].clientX));
    }
  }
  function handleTouchEnd(e){
    // Commit whatever the finger last landed on - viewEnd/visibleCount are
    // already committed via clampView on every move, so there is nothing to
    // "snap back"; just clear the gesture refs. Keep the crosshair showing
    // briefly after lift so a tap-and-hold reading stays visible, but clear
    // it once every finger is off screen with no drag in progress.
    if(!e.touches || e.touches.length==0){
      dragRef.current = null;
      pinchRef.current = null;
    }
  }

  // Native (non-passive) touch listeners, attached directly to the chart
  // wrapper via a ref instead of React's onTouchMove/onTouchStart JSX props.
  // This is the actual fix for "touching the chart does nothing on mobile":
  // some mobile browsers treat React's synthetic touch handlers as passive,
  // silently ignoring preventDefault() and letting the page's own scroll/
  // zoom gesture win instead of our pan/pinch. Registering with
  // {passive:false} guarantees preventDefault() actually stops the browser
  // taking over, while touchAction:'none' below (CSS) is the first line of
  // defense. Handler refs keep the listener always calling the LATEST
  // closure (visibleCount/viewEnd/visible.length change every render)
  // without re-attaching the listener on every render.
  var startRef = useRef(handleTouchStart);
  var moveRef = useRef(handleTouchMove);
  var endRef = useRef(handleTouchEnd);
  startRef.current = handleTouchStart;
  moveRef.current = handleTouchMove;
  endRef.current = handleTouchEnd;
  useEffect(function(){
    var el = wrapRef.current;
    if(!el) return;
    function onStart(e){ startRef.current(e); }
    function onMove(e){ moveRef.current(e); }
    function onEnd(e){ endRef.current(e); }
    el.addEventListener("touchstart", onStart, { passive:false });
    el.addEventListener("touchmove", onMove, { passive:false });
    el.addEventListener("touchend", onEnd, { passive:false });
    el.addEventListener("touchcancel", onEnd, { passive:false });
    return function(){
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  // 9 EMA - computed once over the FULL candle series (not just the visible
  // slice) so the line stays continuous while zooming/panning, then sliced
  // down to whatever is currently visible for drawing.
  var ema9Full = useMemo(function(){ return computeEMA(candles, 9); }, [candles]);
  var ema9Visible = ema9Full.slice(vs, ve);

  // Real candlestick-pattern detection - runs ONCE over the full candle
  // array whenever it changes (new bar / new timeframe / live update),
  // via the single reusable detector in src/utils/candlePatterns.js. Every
  // other pattern-aware bit of this chart (the on-chart markers below, the
  // crosshair tooltip, and the detectPattern()/patternAtIndex() wrappers
  // used by the rest of this screen) reads from this SAME array instead of
  // re-running its own detection.
  var allPatterns = useMemo(function(){ return detectCandlePatterns(candles); }, [candles]);
  // Kept available (per spec) even though the chart itself no longer
  // renders a permanent marker layer from this - pattern inspection now
  // happens entirely through the existing hover/touch crosshair below
  // (hoveredPattern), which is the single on-chart pattern UI.
  var visiblePatterns = useMemo(function(){
    return allPatterns.filter(function(p){ return p.index>=vs && p.index<ve; });
  }, [allPatterns, vs, ve]);

  var levelLines = [];
  if(ltp!=null) levelLines.push({ v:ltp, label:"CMP", color:theme.c.blue, pill:true });
  if(dayHigh!=null) levelLines.push({ v:dayHigh, label:"High", color:SENT_RED });
  if(dayLow!=null) levelLines.push({ v:dayLow, label:"Low", color:SENT_GREEN });
  if(cpr && cpr.s1!=null) levelLines.push({ v:cpr.s1, label:"S1", color:theme.c.text3 });
  if(cpr && cpr.r1!=null) levelLines.push({ v:cpr.r1, label:"R1", color:theme.c.text3 });

  // TradingView-grade price ruler: subtle horizontal gridlines at a "nice"
  // round price step (e.g. every 5/10/20/50 depending on the instrument's
  // own price scale), with a muted tick label on the right gutter for each
  // - distinct from the bold colored CMP/High/Low/S1/R1 pills above, which
  // stay layered on top so the current price still reads as the one
  // prominent highlight.
  function niceStep(range, targetTicks){
    var raw = range / Math.max(1, targetTicks);
    var mag = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 0.0001))));
    var norm = raw / mag;
    var step = norm<1.5 ? 1 : (norm<3 ? 2 : (norm<7 ? 5 : 10));
    return step * mag;
  }
  var gridStep = niceStep(yMax - yMin, compact ? 4 : 6);
  var gridTicks = [];
  if(gridStep>0){
    var gStart = Math.ceil(yMin / gridStep) * gridStep;
    for(var gp=gStart; gp<=yMax; gp+=gridStep){ gridTicks.push(Math.round(gp*100)/100); }
  }

  var hovered = hoverIdx!=null && visible[hoverIdx] ? visible[hoverIdx] : null;
  // Looked up from the SAME full-series detection result used for the
  // on-chart markers below (allPatterns), keyed to this exact candle's
  // absolute index, so the tooltip and the markers can never disagree.
  var hoveredPattern = (hovered && hoverIdx!=null) ? (function(){
    var absIdx = vs + hoverIdx;
    for(var i=0; i<allPatterns.length; i++){ if(allPatterns[i].index==absIdx) return allPatterns[i]; }
    return null;
  })() : null;
  var hoveredPatternColor = hoveredPattern ? (hoveredPattern.dir=="bull"?SENT_GREEN:(hoveredPattern.dir=="bear"?SENT_RED:SENT_YELLOW)) : null;
  var hoveredPctChg = hovered && hovered.o ? Math.round(((hovered.c-hovered.o)/hovered.o)*10000)/100 : null;
  // Slim Angel One/TradingView candle geometry, computed from the SAME
  // real-pixel tier used to pick the default count above: body = slot width
  // minus the tier's target gap, so the gap stays a clean 2-2.5px at any
  // density, and a zoom ceiling still stops a lightly-populated pane (e.g.
  // 1H with only a handful of visible bars) from stretching candles into
  // giant blocks. When useNaturalSpacing is active (see xFor above), the
  // slot is the tier's own natural width instead of plotW/count, so a
  // short series keeps normal-looking candles with blank space on the
  // left rather than a handful of stretched, oversized bars.
  var sizingTier = chartTier;
  var slotW = useNaturalSpacing ? naturalSlot : (plotW / Math.max(1, visible.length));
  var barW = Math.max(1.2, Math.min(sizingTier.ceiling, slotW - sizingTier.gap));

  // Illustrative volume histogram - lower slice of the same plot area.
  // Only ever shown on preview-mode panes (already carrying the PREVIEW
  // disclosure); real daily candles have no volume field and draw none.
  var volBandH = plotH * 0.12;
  var volBaseY = padT + plotH;
  function volBarHeight(v){
    return Math.max(1, (v==null?0:v) * volBandH);
  }

  var labelCount = Math.min(compact ? 4 : 6, visible.length);
  var xLabels = [];
  for(var li=0; li<labelCount; li++){
    var pos = labelCount==1 ? 0 : Math.round((li/(labelCount-1)) * (visible.length-1));
    xLabels.push(pos);
  }

  return (
    <div ref={wrapRef} style={{position:"relative",width:"100%",height: fill ? "100%" : chH,touchAction:"none",userSelect:"none",WebkitUserSelect:"none",MozUserSelect:"none",msUserSelect:"none"}}>
      <svg ref={svgRef} viewBox={"0 0 "+chW+" "+chH} preserveAspectRatio={fill ? "none" : "xMidYMid meet"} style={{width:"100%",height: fill ? "100%" : chH,display:"block",touchAction:"none",userSelect:"none",WebkitUserSelect:"none",cursor:dragRef.current?"grabbing":"grab"}}
        onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}>
        <rect x="0" y="0" width={chW} height={chH} fill="transparent"/>
        {gridTicks.map(function(gp,i){
          var y = yFor(gp);
          if(y<padT-1 || y>padT+plotH+1) return null;
          return <line key={"grid"+i} x1={padL} y1={y} x2={padL+plotW} y2={y} stroke={theme.c.border} strokeWidth="1" opacity="0.22"/>;
        })}
        {cpr && cpr.bc!=null && cpr.tc!=null ? (
          <rect x={padL} y={yFor(Math.max(cpr.bc,cpr.tc))} width={plotW} height={Math.max(0,yFor(Math.min(cpr.bc,cpr.tc))-yFor(Math.max(cpr.bc,cpr.tc)))} fill={theme.c.blue} opacity="0.10"/>
        ) : null}
        {levelLines.map(function(lvl,i){
          var y = yFor(lvl.v);
          if(y<padT-2 || y>padT+plotH+2) return null;
          return (
            <line key={i} x1={padL} y1={y} x2={padL+plotW} y2={y} stroke={lvl.color} strokeWidth="1" strokeDasharray={lvl.pill?"5,4":"3,3"} opacity={lvl.pill?0.6:0.35}/>
          );
        })}
        {isPreview && (mode=="Candlestick" || mode=="Range Channel") ? visible.map(function(c,i){
          var x = xFor(i);
          var isUp = c.c>=c.o;
          var vh = volBarHeight(c.vol);
          return (
            <rect key={"v"+i} x={x-barW/2} y={volBaseY-vh} width={barW} height={vh} fill={isUp ? "#16A34A25" : "#DC262625"}/>
          );
        }) : null}
        {mode=="Candlestick" || mode=="Range Channel" ? visible.map(function(c,i){
          var x = xFor(i);
          var isUp = c.c>=c.o;
          // A near-zero body (doji-like) gets a subtle neutral gray instead
          // of green/red - purely a rendering choice (this threshold is NOT
          // the real Doji pattern-detection rule in candlePatterns.js, which
          // is untouched) so an indecision candle visually reads as neutral
          // the way a professional candlestick chart draws it. The wick uses
          // the same color as the body, per standard OHLC convention.
          var cRange = Math.max(0.0001, c.h-c.l);
          var cBodyPct = Math.abs(c.c-c.o)/cRange;
          var col = cBodyPct<=0.08 ? theme.c.text3 : (isUp ? SENT_GREEN : SENT_RED);
          return (
            <g key={i}>
              <line x1={x} y1={yFor(c.h)} x2={x} y2={yFor(c.l)} stroke={col} strokeWidth="1"/>
              <rect x={x-barW/2} y={Math.min(yFor(c.o),yFor(c.c))} width={barW} height={Math.max(1,Math.abs(yFor(c.o)-yFor(c.c)))} fill={col}/>
            </g>
          );
        }) : null}
        {mode=="Candlestick" && ema9Visible.length>1 ? (
          <polyline fill="none" stroke="#3B82F6" strokeWidth="1.2" opacity="0.5" points={ema9Visible.map(function(v,i){ return xFor(i)+","+yFor(v); }).join(" ")}/>
        ) : null}
        {mode=="Line" ? (
          <polyline fill="none" stroke={theme.c.blue} strokeWidth="2" points={visible.map(function(c,i){ return xFor(i)+","+yFor(c.c); }).join(" ")}/>
        ) : null}
        {mode=="Area" ? (
          <g>
            <polyline fill="none" stroke={theme.c.blue} strokeWidth="2" points={visible.map(function(c,i){ return xFor(i)+","+yFor(c.c); }).join(" ")}/>
            <polygon fill={theme.c.blue} opacity="0.12" points={
              visible.map(function(c,i){ return xFor(i)+","+yFor(c.c); }).join(" ") + " " + xFor(visible.length-1)+","+(padT+plotH)+" "+xFor(0)+","+(padT+plotH)
            }/>
          </g>
        ) : null}
        {/* No permanent pattern markers are drawn on the chart (TradingView-
            style: the candles themselves are the whole normal view).
            Detection still runs in full (allPatterns/visiblePatterns/
            patternSummary all stay populated) - a pattern is only ever
            surfaced to the trader through the hover/touch crosshair
            tooltip below (hoveredPattern), the one on-chart pattern UI. */}
        {hovered ? (
          <g>
            <line x1={xFor(hoverIdx)} y1={padT} x2={xFor(hoverIdx)} y2={padT+plotH} stroke={theme.c.text3} strokeWidth="1" strokeDasharray="2,2"/>
            <line x1={padL} y1={yFor(hovered.c)} x2={padL+plotW} y2={yFor(hovered.c)} stroke={theme.c.text3} strokeWidth="1" strokeDasharray="2,2"/>
          </g>
        ) : null}
        <line x1={padL} y1={padT+plotH} x2={padL+plotW} y2={padT+plotH} stroke={theme.c.border} strokeWidth="1"/>
        <line x1={padL+plotW} y1={padT} x2={padL+plotW} y2={padT+plotH} stroke={theme.c.border} strokeWidth="1"/>
        {gridTicks.map(function(gp,i){
          var y = yFor(gp);
          if(y<padT-6 || y>padT+plotH+6) return null;
          // Skip a plain tick that would sit right under a colored pill
          // (CMP/High/Low/S1/R1) so the two label styles don't collide.
          var nearLevel = levelLines.some(function(lvl){ return Math.abs(yFor(lvl.v)-y) < 9; });
          if(nearLevel) return null;
          return (
            <text key={"gtxt"+i} x={padL+plotW+4} y={y+3} fontSize={fs-1} fill={theme.c.text3} opacity="0.75">{fmtNum(gp)}</text>
          );
        })}
        {levelLines.map(function(lvl,i){
          var y = yFor(lvl.v);
          if(y<padT-6 || y>padT+plotH+6) return null;
          var w = compact ? 42 : 56;
          return (
            <g key={"lbl"+i}>
              <rect x={padL+plotW+2} y={y-7} width={w} height={14} rx={lvl.pill?4:2} fill={lvl.pill?lvl.color:theme.c.card} stroke={lvl.pill?"none":theme.c.border} strokeWidth="1"/>
              <text x={padL+plotW+2+w/2} y={y+4} fontSize={fs} fontWeight="700" fill={lvl.pill?"#fff":lvl.color} textAnchor="middle">{lvl.label+" "+fmtNum(Math.round(lvl.v))}</text>
            </g>
          );
        })}
        {xLabels.map(function(pos,i){
          var c = visible[pos];
          if(!c) return null;
          var label = c.label ? c.label : ("#"+(vs+pos+1));
          return (
            <text key={i} x={xFor(pos)} y={chH-6} fontSize={fs} fill={theme.c.text3} textAnchor="middle">{label}</text>
          );
        })}
      </svg>
      {hovered ? (
        <div style={{position:"absolute",left:4,top:3,background:theme.c.card+"E6",border:"1px solid "+theme.c.border,borderRadius:5,padding:compact?"2px 5px":"3px 7px",fontSize:compact?8:9,color:theme.c.text1,display:"flex",flexDirection:"column",gap:1,pointerEvents:"none",maxWidth:compact?128:190}}>
          <div style={{display:"flex",gap:compact?4:6,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontWeight:700,color:theme.c.text2}}>{hovered.label ? hovered.label : ("#"+(vs+hoverIdx+1))}</span>
            <span>O <b style={{color:theme.c.text1}}>{fmtNum(hovered.o)}</b></span>
            <span>H <b style={{color:SENT_RED}}>{fmtNum(hovered.h)}</b></span>
            <span>L <b style={{color:SENT_GREEN}}>{fmtNum(hovered.l)}</b></span>
            <span>C <b style={{color:theme.c.text1}}>{fmtNum(hovered.c)}</b></span>
            {hoveredPctChg!=null ? (
              <span style={{color: hoveredPctChg>=0 ? SENT_GREEN : SENT_RED, fontWeight:700}}>{hoveredPctChg>=0?"+":""}{hoveredPctChg}%</span>
            ) : null}
          </div>
          <div style={{color:hoveredPattern?hoveredPatternColor:theme.c.text3,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            Pattern: {hoveredPattern ? displayPatternName(hoveredPattern.name) : "None"}
          </div>
        </div>
      ) : null}
      {isPreview ? (
        <div style={{position:"absolute",right:4,top:4,background:SENT_YELLOW+"22",border:"1px solid "+SENT_YELLOW+"66",borderRadius:5,padding:"1px 6px",fontSize:compact?8:9,fontWeight:800,color:SENT_YELLOW}}>{previewLabel}</div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------
// One synchronized chart pane: header (timeframe pill + countdown + AI
// badge), then the CandleChart canvas. Used by both the desktop 2x2
// matrix and the mobile stacked split view.
// ---------------------------------------------------------------------
function ChartPane(props){
  var theme = props.theme;
  var T1=theme.c.text1, T2=theme.c.text2, BD=theme.c.border, CARD=theme.c.card;
  var tf = props.tf;
  var candles = props.candles;
  var pattern = props.pattern;
  var idx = props.idx;
  var cpr = props.cpr;
  var countdownSec = props.countdownSec;
  var marketOpen = props.marketOpen;
  var compact = props.compact;
  var onPickTf = props.onPickTf;
  var tfList = props.tfList || TIMEFRAMES.filter(function(t){ return t.kind=="preview"; });
  // Option-pane mode: props.optionInfo = { title, strike, ltp, chgPct }.
  // When present the header shows the strike/LTP identity instead of the
  // plain timeframe label, and the chart carries a permanent SIM PREMIUM
  // tag (never PREVIEW/LIVE) since no live option-chain feed exists.
  var optionInfo = props.optionInfo || null;
  var onPatternClick = props.onPatternClick;

  var patternColor = pattern ? (pattern.dir=="bull"?SENT_GREEN:(pattern.dir=="bear"?SENT_RED:SENT_YELLOW)) : T2;

  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"3px 6px",display:"flex",flexDirection:"column",gap:2,minWidth:0,minHeight:0,height:"100%",maxHeight:"100%",boxSizing:"border-box",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"nowrap",flexShrink:0,overflow:"hidden"}}>
        {optionInfo ? (
          <span style={{fontSize:9,fontWeight:800,color:T1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:compact?108:180}}>
            {optionInfo.title}{" "}
            {optionInfo.ltp!=null ? (
              <span style={{color: optionInfo.chgPct>=0 ? SENT_GREEN : SENT_RED}}>
                &#8377;{fmtNum(optionInfo.ltp)} ({optionInfo.chgPct>=0?"+":""}{optionInfo.chgPct}%)
              </span>
            ) : null}
          </span>
        ) : onPickTf ? null : (
          <span style={{fontSize:10,fontWeight:800,color:T1,background:theme.c.card2,border:"1px solid "+BD,borderRadius:5,padding:"2px 7px"}}>{tf.label}</span>
        )}
        {onPickTf ? (
          <div style={{display:"flex",gap:3,flexShrink:0}}>
            {tfList.map(function(t){
              var active = t.key==tf.key;
              return (
                <button key={t.key} onClick={function(){ onPickTf(t.key); }} style={{background:active?theme.c.blue:"transparent",border:"1px solid "+(active?theme.c.blue:BD),color:active?"#fff":T2,fontSize:9,fontWeight:700,borderRadius:5,padding:"2px 6px",cursor:"pointer"}}>{t.label}</button>
              );
            })}
          </div>
        ) : null}
        {!optionInfo ? (
          <span style={{fontSize:9,fontWeight:700,color: marketOpen ? T2 : theme.c.text3,display:"flex",alignItems:"center",gap:3}}>
            <span>&#9203;</span>{marketOpen ? fmtCountdown(countdownSec) : "Closed"}
          </span>
        ) : null}
        <span
          onClick={pattern && onPatternClick ? function(){ onPatternClick(pattern.name); } : undefined}
          title={pattern ? "Tap for educational info" : undefined}
          style={{marginLeft:"auto",fontSize:9,fontWeight:800,color:patternColor,background:patternColor+"18",border:"1px solid "+patternColor+"55",borderRadius:5,padding:"2px 6px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:compact?90:220,cursor:pattern && onPatternClick ? "pointer":"default"}}>
          {pattern ? pattern.name : "No Pattern"}
        </span>
      </div>
      <div style={{flex:"1 1 auto",minHeight:0,position:"relative"}}>
        {candles.length>0 ? (
          <CandleChart theme={theme} candles={candles} mode="Candlestick" dayHigh={optionInfo?null:idx.high} dayLow={optionInfo?null:idx.low} cpr={optionInfo?null:cpr} ltp={optionInfo?(optionInfo.ltp):idx.ltp} isPreview={true} previewLabel={optionInfo?"SIM PREMIUM":"PREVIEW"} compact={compact} fill={true}/>
        ) : (
          <div style={{padding:"20px 8px",textAlign:"center",fontSize:11,color:T2}}>No data.</div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Range Intelligence single-mode UI additions (used ONLY by layoutMode
// "single" - split/fno are untouched). Every one of these is a pure
// presentational component: it takes the already-computed range/cpr/
// patternSummary props and renders them with the theme's existing color
// tokens - none of them run any new range/CPR/pattern calculation.
// ---------------------------------------------------------------------
function RangeSnapshot(props){
  var theme = props.theme, range = props.range, cpr = props.cpr;
  var T1=theme.c.text1, T3=theme.c.text3, CARD=theme.c.card, BD=theme.c.border;
  var UP=theme.c.up, DOWN=theme.c.down, BLUE=theme.c.blue, T2=theme.c.text2;
  if(!range || !cpr) return null;
  var stateColor = range.state=="Breakout Watch" ? UP : (range.state=="Breakdown Watch" ? DOWN : T2);
  function cell(label, value, color){
    return (
      <div style={{flexShrink:0}}>
        <div style={{fontSize:8,color:T3,lineHeight:1}}>{label}</div>
        <div style={{fontSize:12,fontWeight:800,color:color||T1,lineHeight:1.25}}>{value}</div>
      </div>
    );
  }
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"8px 10px",display:"flex",flexWrap:"wrap",gap:12,alignItems:"center"}}>
      {cell("CMP", fmtNum(range.ltp), BLUE)}
      {cell("Day High", fmtNum(range.high), DOWN)}
      {cell("Day Low", fmtNum(range.low), UP)}
      {cell("Range", fmtNum(range.width))}
      {cell("Position", range.posPct+"%")}
      {cell("Zone", range.zone)}
      {cell("Support", fmtNum(cpr.s1), UP)}
      {cell("Resistance", fmtNum(cpr.r1), DOWN)}
      <span style={{flexShrink:0,fontSize:9,fontWeight:800,color:stateColor,background:stateColor+"18",border:"1px solid "+stateColor+"55",borderRadius:6,padding:"3px 8px",whiteSpace:"nowrap"}}>{range.state}</span>
    </div>
  );
}

function PatternSummaryPanel(props){
  var theme = props.theme, patternSummary = props.patternSummary, isPreview = props.isPreview;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3, CARD=theme.c.card, BD=theme.c.border;
  var UP=theme.c.up, DOWN=theme.c.down;
  if(!patternSummary || !patternSummary.totalCandles){
    return (
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"10px 12px"}}>
        <div style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.4}}>CANDLE PATTERN INTELLIGENCE</div>
        <div style={{fontSize:11,color:T3,marginTop:6}}>Pattern analysis unavailable - candle data not connected.</div>
      </div>
    );
  }
  var current = patternSummary.current;
  var currentName = current ? displayPatternName(current.name) : "No pattern";
  var sessionCount = current ? patternSummary.counts[current.name] : "-";
  var lastDetected = current ? current.time : "-";
  var signalType = current ? (current.dir=="bull" ? "Bullish" : (current.dir=="bear" ? "Bearish" : "Neutral")) : "Neutral";
  var signalColor = signalType=="Bullish" ? UP : (signalType=="Bearish" ? DOWN : T2);
  var wm = (current && (current.name=="W Pattern" || current.name=="M Pattern")) ? displayPatternName(current.name) : null;
  var lowData = patternSummary.totalCandles < 5;
  // Honest data-status wording (spec item 14): a preview/seeded series
  // must never be labeled as a verified "Today" count - only once a real
  // historical OHLC provider backs the series does the UI say "Today: X".
  var countLabel = isPreview ? "Session Count" : "Today's Count";
  var dataStatusLine = isPreview
    ? "Interactive Pattern Preview - counts based on preview candles for the currently loaded session, not a verified live intraday feed."
    : "Based on verified historical daily OHLC candles (not a live intraday count).";

  function kv(label, value, color){
    return (
      <div style={{minWidth:72}}>
        <div style={{fontSize:8,color:T3,lineHeight:1}}>{label}</div>
        <div style={{fontSize:11,fontWeight:800,color:color||T1,lineHeight:1.3}}>{value}</div>
      </div>
    );
  }

  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
      <div style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.4}}>CANDLE PATTERN INTELLIGENCE</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
        {kv("Current Pattern", currentName, signalColor)}
        {kv(countLabel, sessionCount)}
        {kv("Last Detected", lastDetected)}
        {kv("Signal Type", signalType, signalColor)}
      </div>
      <div style={{fontSize:9,color:isPreview?(theme.c.gold||T3):T3,fontWeight:isPreview?700:400}}>{dataStatusLine}</div>
      <div style={{fontSize:10,color:T3,borderTop:"1px solid "+BD,paddingTop:6}}>
        W/M status: {wm ? wm : "No confirmed W/M pattern"}
      </div>
      {lowData ? (
        <div style={{fontSize:9,color:theme.c.gold||T3,fontWeight:700}}>Insufficient candle data for a reliable pattern count on this timeframe yet.</div>
      ) : null}
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:9}}>
          <thead>
            <tr style={{textAlign:"left",color:T3}}>
              <th style={{padding:"3px 4px",fontWeight:700}}>Pattern</th>
              <th style={{padding:"3px 4px",fontWeight:700}}>Count</th>
              <th style={{padding:"3px 4px",fontWeight:700}}>Latest</th>
              <th style={{padding:"3px 4px",fontWeight:700}}>Bias</th>
            </tr>
          </thead>
          <tbody>
            {ALL_PATTERN_NAMES.map(function(name){
              var bias = patternBias(name);
              var biasColor = bias=="Bullish" ? UP : (bias=="Bearish" ? DOWN : T2);
              return (
                <tr key={name} style={{borderTop:"1px solid "+BD}}>
                  <td style={{padding:"3px 4px",color:T1}}>{name=="W Pattern"||name=="M Pattern" ? displayPatternName(name) : name}</td>
                  <td style={{padding:"3px 4px",color:T1,fontWeight:700}}>{patternSummary.counts[name]}</td>
                  <td style={{padding:"3px 4px",color:T2}}>{patternSummary.latest[name] || "-"}</td>
                  <td style={{padding:"3px 4px",color:biasColor,fontWeight:700}}>{bias}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RangePositionDetail(props){
  var theme = props.theme, range = props.range, cpr = props.cpr;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3, CARD=theme.c.card, BD=theme.c.border;
  var UP=theme.c.up, DOWN=theme.c.down, BLUE=theme.c.blue;
  if(!range || !cpr) return null;
  function row(label, value, color){
    return (
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0",borderBottom:"1px solid "+BD}}>
        <span style={{color:T3}}>{label}</span>
        <span style={{color:color||T1,fontWeight:700}}>{value}</span>
      </div>
    );
  }
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"10px 12px"}}>
      <div style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:6}}>SUPPORT / RESISTANCE / RANGE POSITION</div>
      <div style={{position:"relative",height:10,margin:"4px 0 10px"}}>
        <div style={{position:"absolute",top:4,left:0,right:0,height:2,background:BD}}></div>
        <div style={{position:"absolute",top:0,left:"calc("+range.posPct+"% - 5px)",width:10,height:10,borderRadius:"50%",background:BLUE,border:"1px solid "+CARD}}></div>
      </div>
      {row("Zone", range.zone)}
      {row("Status", range.state, range.state=="Breakout Watch" ? UP : (range.state=="Breakdown Watch" ? DOWN : T2))}
      {row("Support (S1)", fmtNum(cpr.s1), UP)}
      {row("Resistance (R1)", fmtNum(cpr.r1), DOWN)}
      {row("Distance to High", fmtNum(range.distToHigh)+" ("+range.distToHighPct+"%)")}
      {row("Distance to Low", fmtNum(range.distToLow)+" ("+range.distToLowPct+"%)")}
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0"}}>
        <span style={{color:T3}}>CPR</span>
        <span style={{color:cpr.status=="Narrow CPR"?SENT_YELLOW:T2,fontWeight:700}}>{cpr.status} - {cpr.note}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// CandleConfirmationCard - additional confirmation layer shown below
// Support/Resistance/Range Position. Reads `pattern` exactly as produced
// by detectPattern()/candlePatterns.js for the LAST CLOSED candle of the
// currently selected single-view timeframe (patternByTf[tfKey] in the
// main component below) - this component does not detect, recompute, or
// guess a pattern of its own, and never upgrades a null/no-match result
// into a fabricated signal. dir ("bull"/"bear"/"neutral") comes straight
// from the detector's own output, same as every other pattern-color spot
// in this file (pillColor, singlePatternColor, PatternSummaryPanel's
// signalColor) - this never reclassifies bull/bear/neutral itself.
// ---------------------------------------------------------------------
function CandleConfirmationCard(props){
  var theme = props.theme, pattern = props.pattern, tfLabel = props.tfLabel, isPreview = props.isPreview;
  var CARD = theme.c.card, BD = theme.c.border, T1 = theme.c.text1, T2 = theme.c.text2, T3 = theme.c.text3;
  var dir = pattern ? pattern.dir : null;
  var dotColor = dir=="bull" ? SENT_GREEN : (dir=="bear" ? SENT_RED : T2);
  var dot = dir=="bull" ? "🟢" : (dir=="bear" ? "🔴" : "⚪");
  var label = pattern ? displayPatternName(pattern.name) : "No confirmed pattern";
  var statusText = pattern ? ("Confirmed" + (tfLabel ? " • " + tfLabel : "")) : "Waiting for confirmation";
  var explanation = pattern ? (CANDLE_CONFIRMATION_NOTES[pattern.name] || "A confirmed price-action signal on the latest closed candle.") : CANDLE_CONFIRMATION_NO_PATTERN_NOTE;
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"10px 12px"}}>
      <div style={{fontSize:10,fontWeight:800,color:T2,letterSpacing:0.4,marginBottom:6}}>CANDLE CONFIRMATION</div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:13,lineHeight:1}}>{dot}</span>
        <span style={{fontSize:12,fontWeight:800,color:dotColor}}>{label}</span>
      </div>
      <div style={{fontSize:10,color:T3,fontWeight:700,marginTop:3}}>{statusText}</div>
      <div style={{fontSize:10,color:T1,lineHeight:1.4,marginTop:4}}>{explanation}</div>
      {isPreview ? (
        <div style={{fontSize:9,color:theme.c.gold||T3,fontWeight:700,marginTop:6,paddingTop:6,borderTop:"1px solid "+BD}}>Interactive Pattern Preview - based on preview candles, not a verified live intraday feed.</div>
      ) : null}
    </div>
  );
}

function RangeHelpBox(props){
  var theme = props.theme, open = props.open, onToggle = props.onToggle;
  var T2=theme.c.text2, T3=theme.c.text3, CARD=theme.c.card, BD=theme.c.border;
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"8px 10px"}}>
      <div onClick={onToggle} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
        <span style={{fontSize:10,fontWeight:800,color:T2}}>What is Range Intelligence?</span>
        <span style={{fontSize:11,color:T3}}>{open ? "-" : "+"}</span>
      </div>
      {open ? (
        <div style={{fontSize:10,color:T2,lineHeight:1.5,marginTop:6}}>
          Range Intelligence tells the trader where the current price is positioned between the day's High and Low, how close it is to important support/resistance levels, and whether the price is showing a potential breakout, breakdown or reversal structure.
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------
// SingleModeView - the entire restructured layout for layoutMode
// "single" only. One shared JSX tree, responsive purely via CSS grid
// (gridTemplateAreas switched on isMobileWidth, following the same
// theme.winW-driven responsive pattern already used elsewhere in this
// file) - no separate mobile/desktop components, no zoom/transform
// hacks. Mobile stacks everything in DOM order (header -> CMP/Range
// summary -> chart -> pattern panel -> range position detail -> help);
// desktop keeps the identical DOM order but reflows it into a 2-column
// grid via named grid-area placement.
// ---------------------------------------------------------------------
function SingleModeView(props){
  var theme = props.theme, idx = props.idx, range = props.range, cpr = props.cpr;
  var singleCandles = props.singleCandles, chartMode = props.chartMode, isPreview = props.isPreview;
  var patternSummary = props.patternSummary;
  var singlePattern = props.singlePattern, singleTfLabel = props.singleTfLabel;
  var isMobileWidth = props.isMobileWidth;
  var helpOpen = props.helpOpen, setHelpOpen = props.setHelpOpen;
  var CARD = theme.c.card, BD = theme.c.border, T1 = theme.c.text1, T2 = theme.c.text2, T3 = theme.c.text3;

  // "confirm" (Candle Confirmation) sits directly below "detail" (Support/
  // Resistance/Range Position) in DOM order on mobile, and in the same
  // right-hand column just under it on desktop - an additional
  // confirmation layer, not a replacement for the range classification.
  var gridStyle = isMobileWidth ? {
    display:"grid",
    gridTemplateColumns:"1fr",
    gridTemplateAreas: "\"header\" \"snapshot\" \"chart\" \"panel\" \"detail\" \"confirm\" \"help\"",
    gap:8
  } : {
    display:"grid",
    gridTemplateColumns:"minmax(0,2fr) minmax(260px,1fr)",
    gridTemplateAreas: "\"header header\" \"snapshot snapshot\" \"chart panel\" \"chart detail\" \"chart confirm\" \"chart help\"",
    gap:10,
    alignItems:"start"
  };

  var current = patternSummary.current;
  var pillColor = current ? (current.dir=="bull"?SENT_GREEN:(current.dir=="bear"?SENT_RED:T2)) : T2;

  return (
    <div style={gridStyle}>
      <div style={{gridArea:"header"}}>
        <div style={{fontSize:13,fontWeight:800,color:T1}}>Range Intelligence</div>
      </div>
      <div style={{gridArea:"snapshot"}}>
        <RangeSnapshot theme={theme} range={range} cpr={cpr}/>
      </div>
      <div style={{gridArea:"chart",display:"flex",flexDirection:"column",gap:6,minHeight:0}}>
        {/* Mobile gets its own compact, fixed-feeling chart box instead of
            the desktop "clamp(360px, 60vh, 640px)" box - on a phone that
            desktop sizing reads as 60% of the whole viewport height,
            which is what made the chart look oversized/giant and pushed
            the range-detail bar and everything below it far down the
            page. A real mobile trading app's chart pane sits in roughly
            this 220-300px band regardless of phone height. Desktop keeps
            its original sizing unchanged. */}
        <div style={{height: isMobileWidth ? "clamp(220px, 34vh, 300px)" : "clamp(360px, 60vh, 640px)",background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"6px 8px",boxSizing:"border-box",display:"flex",flexDirection:"column"}}>
          {singleCandles.length>0 ? (
            <CandleChart theme={theme} candles={singleCandles} mode={chartMode} dayHigh={idx.high} dayLow={idx.low} cpr={cpr} ltp={idx.ltp} isPreview={isPreview} compact={isMobileWidth} fill={true}/>
          ) : (
            <div style={{padding:"40px 12px",textAlign:"center",fontSize:12,color:T2}}>No candle data available for this timeframe right now.</div>
          )}
        </div>
        {range && cpr ? (
          <div style={{flexShrink:0,height:28,maxHeight:28,boxSizing:"border-box",background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"4px 10px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap",overflowX:"auto",overflowY:"hidden"}}>
            <div style={{flexShrink:0}}>
              <div style={{fontSize:8,color:T3,lineHeight:1}}>CMP</div>
              <div style={{fontSize:11,fontWeight:800,color:T1,lineHeight:1.1}}>{fmtNum(range.ltp)}</div>
            </div>
            <div style={{flex:1,minWidth:90}}>
              <div style={{position:"relative",height:8}}>
                <div style={{position:"absolute",top:3,left:0,right:0,height:2,background:BD}}></div>
                <div style={{position:"absolute",top:0,left:"calc("+range.posPct+"% - 4px)",width:8,height:8,borderRadius:"50%",background:theme.c.blue,border:"1px solid "+CARD}}></div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:T3,lineHeight:1}}>
                <span>L {fmtNum(range.low)}</span>
                <span>H {fmtNum(range.high)}</span>
              </div>
            </div>
            <span style={{flexShrink:0,fontSize:9,fontWeight:800,color:cpr.status=="Narrow CPR"?SENT_YELLOW:T2,background:(cpr.status=="Narrow CPR"?SENT_YELLOW:T2)+"18",borderRadius:6,padding:"2px 7px",whiteSpace:"nowrap"}}>{cpr.status}</span>
            <div style={{flexShrink:0,textAlign:"right"}}>
              <div style={{fontSize:8,color:T3,lineHeight:1}}>Dist R1</div>
              <div style={{fontSize:11,fontWeight:800,color:theme.c.down,lineHeight:1.1}}>{fmtNum(Math.round((cpr.r1-idx.ltp)*100)/100)}</div>
            </div>
            <div style={{flexShrink:0,textAlign:"right"}}>
              <div style={{fontSize:8,color:T3,lineHeight:1}}>Dist S1</div>
              <div style={{fontSize:11,fontWeight:800,color:theme.c.up,lineHeight:1.1}}>{fmtNum(Math.round((idx.ltp-cpr.s1)*100)/100)}</div>
            </div>
            <span style={{flexShrink:0,fontSize:8,fontWeight:700,color:pillColor,background:pillColor+"14",border:"1px solid "+pillColor+"40",borderRadius:5,padding:"2px 6px",whiteSpace:"nowrap"}}>
              {current ? displayPatternName(current.name) : "No pattern"}
            </span>
          </div>
        ) : null}
      </div>
      <div style={{gridArea:"panel"}}>
        <PatternSummaryPanel theme={theme} patternSummary={patternSummary} isPreview={isPreview}/>
      </div>
      <div style={{gridArea:"detail"}}>
        <RangePositionDetail theme={theme} range={range} cpr={cpr}/>
      </div>
      <div style={{gridArea:"confirm"}}>
        <CandleConfirmationCard theme={theme} pattern={singlePattern} tfLabel={singleTfLabel} isPreview={isPreview}/>
      </div>
      <div style={{gridArea:"help"}}>
        <RangeHelpBox theme={theme} open={helpOpen} onToggle={function(){ setHelpOpen(!helpOpen); }}/>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------
export default function RangeIntelligence(props){
  var theme = useTheme();
  var BG=theme.c.bg, CARD=theme.c.card, BD=theme.c.border;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var UP=theme.c.up, DOWN=theme.c.down, BLUE=theme.c.blue;

  var mm = props.mm || {};
  var indices = (mm.data && mm.data.indices) || {};
  var indexHistory = (mm.data && mm.data.indexHistory) || {};

  var [selected, setSelected] = useState({ key:"NIFTY", kind:"index" });
  var [layoutMode, setLayoutMode] = useState("single"); // "single" | "split" | "fno"
  var [tfKey, setTfKey] = useState("5m");
  var [chartMode, setChartMode] = useState("Candlestick");
  var [mobileTopTf, setMobileTopTf] = useState("5m");
  var [mobileBottomTf, setMobileBottomTf] = useState("15m");
  var [barVersions, setBarVersions] = useState({ "5m":0, "10m":0, "15m":0, "1h":0 });
  var [fnoTfByPane, setFnoTfByPane] = useState({ spot:"5m", ce:"5m", pe:"5m", itmCe:"5m" });
  var [nowTick, setNowTick] = useState(function(){ return getIST(); });
  // Name of the pattern whose educational popup is currently open, or null.
  // Purely a UI-display concern - carries no trading action.
  var [patternModal, setPatternModal] = useState(null);
  var [searchQuery, setSearchQuery] = useState("");
  var [searchOpen, setSearchOpen] = useState(false);
  var [infoOpen, setInfoOpen] = useState(false);
  // Collapsed-by-default "What is Range Intelligence?" toggle - single-mode
  // only, purely a UI-display concern.
  var [helpOpen, setHelpOpen] = useState(false);
  var searchRef = useRef(null);

  var isMobileWidth = (theme.winW || 430) < 768;
  // The app's fixed bottom TabBar (Home/Pulse/Scanner/Learn/More) renders on
  // top of every non-desktop screen, including this one - it is NOT excluded
  // for rangeintel. Reserve exactly its footprint (its own 56px content
  // height plus the device's own safe-area inset) at the bottom of this
  // screen's 100vh so the docked Range Summary bar/chart never sits under
  // it. Uses a slightly wider breakpoint than the mobile split-view stack
  // above since the app's own isDesktop check also treats "md" (tablet)
  // widths as non-desktop.
  var reserveBottomNav = (theme.winW || 430) < 1024;
  var isIndex = selected.kind=="index";

  useEffect(function(){
    var t = setInterval(function(){ setNowTick(getIST()); }, 1000);
    return function(){ clearInterval(t); };
  }, []);

  var idx = isIndex ? indices[selected.key] : null;
  var equityMeta = !isIndex ? findEquity(selected.key) : null;
  var session = sessionInfo(nowTick);
  // Continuous minute-in-session bucket, used to seed fast (1m/3m) preview
  // series on a clean per-minute rollover - same approach already used by
  // the F&O spot series below, reused here for the single-view's compact
  // 1m/3m timeframe buttons instead of inventing a second rollover scheme.
  var minuteBucket = Math.floor(session.elapsedMin);
  var range = computeRange(idx);
  var cpr = computeCPR(idx);
  var instLabel = isIndex ? (INSTRUMENTS.filter(function(i){ return i.key==selected.key; })[0]||{}).label : selected.key;

  var searchResults = searchSymbols(searchQuery, 8);
  function pickSymbol(item){
    setSelected({ key:item.key, kind:item.kind });
    setSearchQuery("");
    setSearchOpen(false);
  }

  // Bar index (per timeframe) at the current tick - used both to roll the
  // preview candle over at 00:00 and to compute each pane's countdown.
  function barIndexFor(tfObj){
    return Math.floor(session.elapsedMin / tfObj.minutes);
  }
  function countdownFor(tfObj){
    if(!session.isOpen) return null;
    var bi = barIndexFor(tfObj);
    var nextCloseMin = (bi+1) * tfObj.minutes;
    return Math.max(0, Math.round((nextCloseMin - session.elapsedMin) * 60));
  }

  var prevBarIndexRef = useRef({});
  useEffect(function(){
    var changed = null;
    SPLIT_TF_KEYS.forEach(function(k){
      var tfObj = tfByKey(k);
      var bi = barIndexFor(tfObj);
      if(prevBarIndexRef.current[k]!=null && prevBarIndexRef.current[k]!=bi){
        changed = changed || {};
        changed[k] = true;
      }
      prevBarIndexRef.current[k] = bi;
    });
    if(changed){
      setBarVersions(function(prev){
        var next = { "5m":prev["5m"], "10m":prev["10m"], "15m":prev["15m"], "1h":prev["1h"] };
        Object.keys(changed).forEach(function(k){ next[k] = (prev[k]||0) + 1; });
        return next;
      });
    }
    // eslint-disable-next-line
  }, [nowTick]);

  // Candles for every preview timeframe, precomputed once per tick-driven
  // rollover / instrument change, reused by both single view and split
  // view so there is only one source of truth per timeframe.
  var candlesByTf = useMemo(function(){
    var out = {};
    if(!idx || idx.ltp==null) return out;
    SPLIT_TF_KEYS.forEach(function(k){
      var tfObj = tfByKey(k);
      var count = Math.max(6, Math.min(100, Math.round(session.totalMin / tfObj.minutes) || 70));
      var seedBase = (selected.key.length*13) + (k.length*7) + (barVersions[k]||0)*101 + Math.round((idx.prevClose||idx.ltp||1)*10);
      out[k] = generatePreviewCandles({ open:idx.open, prevClose:idx.prevClose, ltp:idx.ltp, high:idx.high, low:idx.low }, count, seedBase, tfObj.minutes);
    });
    // Fast scalper-style granularities (1m/3m) for the chart-first single
    // view's compact timeframe row - same generatePreviewCandles() call,
    // same real open/prevClose/ltp/high/low anchor, just seeded on a clean
    // minute-bucket rollover (same technique as the F&O spot series below)
    // instead of the bar-version-on-rollover tracking used for 5m/10m/15m/1h.
    ["1m","3m"].forEach(function(k){
      var tfObj = tfByKey(k);
      var count = Math.max(6, Math.min(150, Math.round(session.totalMin / tfObj.minutes) || 70));
      var seedBase = (selected.key.length*13) + (k.length*7) + Math.floor(minuteBucket/tfObj.minutes)*101 + Math.round((idx.prevClose||idx.ltp||1)*10);
      out[k] = generatePreviewCandles({ open:idx.open, prevClose:idx.prevClose, ltp:idx.ltp, high:idx.high, low:idx.low }, count, seedBase, tfObj.minutes);
    });
    out["1D"] = buildDailyCandles(indexHistory[selected.key]);
    return out;
    // eslint-disable-next-line
  }, [idx, selected.key, barVersions, indexHistory, minuteBucket]);

  var patternByTf = useMemo(function(){
    var out = {};
    Object.keys(candlesByTf).forEach(function(k){
      var arr = candlesByTf[k] || [];
      var closed = k!="1D" && arr.length>1 ? arr.slice(0,-1) : arr;
      out[k] = detectPattern(closed);
    });
    return out;
  }, [candlesByTf]);

  var singleTf = tfByKey(tfKey);
  var singleCandles = candlesByTf[tfKey] || [];
  var singlePattern = patternByTf[tfKey];
  var singlePatternColor = singlePattern ? (singlePattern.dir=="bull"?SENT_GREEN:(singlePattern.dir=="bear"?SENT_RED:SENT_YELLOW)) : T2;
  // Single source of truth for everything pattern-related in the single-
  // mode UI (Pattern Summary Panel, counts table, W/M status row) - built
  // directly on summarizePatterns(singleCandles) from candlePatterns.js,
  // nothing here recomputes a pattern independently.
  var patternSummary = useMemo(function(){ return summarizePatterns(singleCandles); }, [singleCandles]);

  // F&O Option Scalper data - real spot path per pane's chosen scalper
  // timeframe, plus a CALCULATED strike ladder and a disclosed SIMULATED
  // premium series per option pane (see generateOptionPremiumCandles above).
  // Recomputes once per simulated minute (minuteBucket, declared above) so
  // bars roll over without regenerating on every 1-second clock tick.
  function optionSummary(arr){
    if(!arr || !arr.length) return { ltp:null, chgPct:null };
    var last = arr[arr.length-1], first = arr[0];
    var chg = first.o>0 ? ((last.c-first.o)/first.o)*100 : 0;
    return { ltp:last.c, chgPct: Math.round(chg*10)/10 };
  }
  var fnoData = useMemo(function(){
    if(layoutMode!="fno" || !idx || idx.ltp==null) return null;
    var ladder = buildStrikeLadder(selected.key, idx.ltp);
    function spotSeries(tfk){
      var tfObj = fnoTfByKey(tfk);
      var count = Math.max(6, Math.min(150, Math.round(session.totalMin / tfObj.minutes) || 70));
      var seedBase = (selected.key.length*13) + (tfObj.key.length*7) + Math.floor(minuteBucket/tfObj.minutes)*101 + Math.round((idx.prevClose||idx.ltp||1)*10);
      return { tfObj:tfObj, candles: generatePreviewCandles({ open:idx.open, prevClose:idx.prevClose, ltp:idx.ltp, high:idx.high, low:idx.low }, count, seedBase, tfObj.minutes) };
    }
    var spotS = spotSeries(fnoTfByPane.spot);
    var ceS = spotSeries(fnoTfByPane.ce);
    var peS = spotSeries(fnoTfByPane.pe);
    var itmS = spotSeries(fnoTfByPane.itmCe);
    var ceCandles = generateOptionPremiumCandles(ceS.candles, ladder.ceStrike, "CE", idx, 71 + Math.floor(minuteBucket/ceS.tfObj.minutes));
    var peCandles = generateOptionPremiumCandles(peS.candles, ladder.peStrike, "PE", idx, 137 + Math.floor(minuteBucket/peS.tfObj.minutes));
    var itmCandles = generateOptionPremiumCandles(itmS.candles, ladder.itmCeStrike, "CE", idx, 211 + Math.floor(minuteBucket/itmS.tfObj.minutes));
    return {
      ladder: ladder,
      spot: { tfObj:spotS.tfObj, candles:spotS.candles, pattern: detectPattern(spotS.candles.slice(0,-1)) },
      ce: { tfObj:ceS.tfObj, strike:ladder.ceStrike, candles:ceCandles, pattern: detectPattern(ceCandles.slice(0,-1)), summary: optionSummary(ceCandles) },
      pe: { tfObj:peS.tfObj, strike:ladder.peStrike, candles:peCandles, pattern: detectPattern(peCandles.slice(0,-1)), summary: optionSummary(peCandles) },
      itmCe: { tfObj:itmS.tfObj, strike:ladder.itmCeStrike, candles:itmCandles, pattern: detectPattern(itmCandles.slice(0,-1)), summary: optionSummary(itmCandles) }
    };
    // eslint-disable-next-line
  }, [layoutMode, idx, selected.key, fnoTfByPane, minuteBucket]);

  // Info-tooltip text - one shared source of the disclosure, shown via a
  // tiny (i) toggle in the ribbon instead of a permanent multi-line box.
  var infoText = !isIndex
    ? "Static reference price, not a live tick. Only NIFTY 50, BANK NIFTY, SENSEX and FINNIFTY have a real live feed."
    : layoutMode=="fno"
      ? "SIM PREMIUM - there is no live option-chain feed in this app. Strikes are CALCULATED from the real "+instLabel+" spot LTP (rounded to the real strike step). Each option candle = real intrinsic value from the spot path + a disclosed simulated time-value that decays across the session. These are illustrative premiums for pattern practice only, never a broker quote - do not scalp real capital off these numbers."
      : layoutMode=="split"
      ? "INTERACTIVE PATTERN PREVIEW - no verified intraday feed connected yet. All panes are a deterministic model anchored to real open/prevClose, clamped to today's real high/low; each forming candle closes at the real live price."
      : singleTf.kind=="preview"
        ? "INTERACTIVE PATTERN PREVIEW - no verified intraday feed connected yet. This "+singleTf.label+" path is a deterministic model anchored to real open/prevClose, clamped to today's real high/low; the final bar always closes at the real live price."
        : "CALCULATED - real daily high/low/close from the last "+(singleCandles.length+1)+" sessions. Daily open is not provided by the data source, so each candle's open is set to the previous session's close.";

  return (
    <div style={{background:BG,height: reserveBottomNav ? "calc(100vh - 56px)" : "100vh",maxHeight: reserveBottomNav ? "calc(100vh - 56px)" : "100vh",overflow: layoutMode=="single" ? "auto" : "hidden",fontFamily:"Inter,Arial,sans-serif",display:"flex",flexDirection:"column",boxSizing:"border-box",padding:0,paddingBottom: reserveBottomNav ? "env(safe-area-inset-bottom)" : 0}}>

      {/* ================= TOP RIBBON (~38px max, hard-capped): a single
          TradingView-style row (instrument/timeframe/mode/status/info), so
          the chart gets all the vertical space below it. The old second
          ribbon row (AI Signal banner) was folded into the docked Range
          Summary bar below the chart, matching the chart-first hierarchy:
          Instrument -> Timeframe -> Chart -> CMP -> High/Low ->
          Support/Resistance -> Pattern. ============ */}
      <div style={{flexShrink:0,maxHeight:38,overflow:"hidden",boxSizing:"border-box",display:"flex",flexDirection:"column"}}>

      {/* ---- RIBBON LINE 1: back, search, quick pills, mode/timeframe,
          chart-mode, market status, home - one TradingView-style row
          instead of the old 3 stacked bars. ---- */}
      <div style={{flexShrink:0,background:CARD,borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:6,padding:"4px 8px",overflowX:"auto",whiteSpace:"nowrap"}}>
        <button onClick={function(){ props.setTab && props.setTab("home"); }} style={{flexShrink:0,background:"rgba(120,120,120,0.12)",border:"none",borderRadius:6,width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,color:T1}}>&#8592;</button>

        <div ref={searchRef} style={{position:"relative",flexShrink:0,width:150}}>
          <input
            value={searchQuery}
            onChange={function(e){ setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={function(){ setSearchOpen(true); }}
            onBlur={function(){ setTimeout(function(){ setSearchOpen(false); }, 150); }}
            placeholder={instLabel}
            style={{width:"100%",boxSizing:"border-box",background:theme.c.card2,border:"1px solid "+BD,borderRadius:6,padding:"4px 8px",fontSize:11,color:T1,fontFamily:"inherit"}}
          />
          {searchOpen && searchQuery.trim() ? (
            <div style={{position:"absolute",top:26,left:0,width:240,background:CARD,border:"1px solid "+BD,borderRadius:8,boxShadow:"0 8px 24px rgba(0,0,0,0.3)",zIndex:60,maxHeight:220,overflowY:"auto"}}>
              {searchResults.length ? searchResults.map(function(item){
                return (
                  <div key={item.kind+item.key} onMouseDown={function(){ pickSymbol(item); }} style={{padding:"7px 9px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid "+BD,whiteSpace:"normal"}}>
                    <div>
                      <span style={{fontSize:11,fontWeight:700,color:T1}}>{item.label}</span>
                      <span style={{fontSize:9,color:T3,marginLeft:5}}>{item.sub}</span>
                    </div>
                    <span style={{fontSize:8,fontWeight:800,color: item.kind=="index" ? UP : theme.c.gold,background:(item.kind=="index"?UP:theme.c.gold)+"18",borderRadius:4,padding:"1px 5px"}}>{item.kind=="index" ? "LIVE" : "DEMO"}</span>
                  </div>
                );
              }) : (
                <div style={{padding:"9px",fontSize:10,color:T3,textAlign:"center"}}>No symbol matches "{searchQuery}".</div>
              )}
            </div>
          ) : null}
        </div>

        <div style={{display:"flex",gap:3,flexShrink:0}}>
          {QUICK_PICKS.slice(0,4).map(function(p){
            var active = selected.key==p.key && selected.kind==p.kind;
            return (
              <button key={p.kind+p.key} onClick={function(){ setSelected({ key:p.key, kind:p.kind }); }} style={{flexShrink:0,background:active?BLUE:"transparent",border:"1px solid "+(active?BLUE:BD),color:active?"#fff":T2,fontSize:9,fontWeight:700,borderRadius:5,padding:"4px 7px",cursor:"pointer"}}>{p.label}</button>
            );
          })}
          <button onClick={function(){ setSearchOpen(true); try{ searchRef.current && searchRef.current.querySelector("input").focus(); }catch(e){} }} style={{flexShrink:0,background:"transparent",border:"1px dashed "+BD,color:T3,fontSize:9,fontWeight:700,borderRadius:5,padding:"4px 7px",cursor:"pointer"}}>+More</button>
        </div>

        <div style={{width:1,alignSelf:"stretch",background:BD,flexShrink:0}}/>

        {isIndex && idx && idx.ltp!=null ? (
          <div style={{display:"flex",gap:3,flexShrink:0}}>
            <button onClick={function(){ setLayoutMode("single"); }} style={{background:layoutMode=="single"?BLUE:theme.c.card2,color:layoutMode=="single"?"#fff":T2,border:"1px solid "+(layoutMode=="single"?BLUE:BD),borderRadius:5,padding:"4px 8px",fontSize:9,fontWeight:800,cursor:"pointer"}}>Single</button>
            <button onClick={function(){ setLayoutMode("split"); }} style={{background:layoutMode=="split"?BLUE:theme.c.card2,color:layoutMode=="split"?"#fff":T2,border:"1px solid "+(layoutMode=="split"?BLUE:BD),borderRadius:5,padding:"4px 8px",fontSize:9,fontWeight:800,cursor:"pointer"}}>Multi-TF</button>
            <button onClick={function(){ setLayoutMode("fno"); }} style={{background:layoutMode=="fno"?BLUE:theme.c.card2,color:layoutMode=="fno"?"#fff":T2,border:"1px solid "+(layoutMode=="fno"?BLUE:BD),borderRadius:5,padding:"4px 8px",fontSize:9,fontWeight:800,cursor:"pointer"}}>F&amp;O Scalper</button>
          </div>
        ) : null}

        {isIndex && idx && idx.ltp!=null && layoutMode=="single" ? (
          <div style={{display:"flex",gap:3,flexShrink:0}}>
            {SINGLE_TF_KEYS.map(function(k){
              var t = tfByKey(k);
              var active = k==tfKey;
              return (
                <button key={k} onClick={function(){ setTfKey(k); }} style={{background:active?BLUE:"transparent",border:"1px solid "+(active?BLUE:BD),color:active?"#fff":T2,fontSize:9,fontWeight:700,borderRadius:5,padding:"4px 7px",cursor:"pointer"}}>{t.label}</button>
              );
            })}
          </div>
        ) : null}
        {isIndex && idx && idx.ltp!=null && layoutMode=="split" ? (
          <div style={{fontSize:9,color:T3,flexShrink:0}}>5m&middot;10m&middot;15m&middot;1H</div>
        ) : null}
        {isIndex && idx && idx.ltp!=null && layoutMode=="fno" ? (
          <div style={{fontSize:9,color:T3,flexShrink:0}}>Spot&middot;CE&middot;PE&middot;ITM CE</div>
        ) : null}

        {isIndex && idx && idx.ltp!=null && layoutMode=="single" ? (
          <div style={{display:"flex",gap:3,flexShrink:0}}>
            {CHART_MODES.map(function(m){
              var active = m==chartMode;
              return (
                <button key={m} onClick={function(){ setChartMode(m); }} style={{background:active?theme.c.card2:"transparent",border:"1px solid "+(active?BLUE:BD),color:active?BLUE:T3,fontSize:9,fontWeight:700,borderRadius:5,padding:"4px 6px",cursor:"pointer"}}>{m.slice(0,4)}</button>
              );
            })}
          </div>
        ) : null}

        <div style={{flex:1}}/>

        <span style={{flexShrink:0,fontSize:9,fontWeight:800,color: isIndex ? (session.isOpen?UP:T3) : theme.c.gold,display:"flex",alignItems:"center",gap:4}}>
          <span style={{width:6,height:6,borderRadius:"50%",background: isIndex ? (session.isOpen?UP:T3) : theme.c.gold}}/>
          {isIndex ? (session.isOpen?"LIVE":"CLOSED") : "DEMO"}
        </span>

        <div style={{position:"relative",flexShrink:0}}>
          <button onClick={function(){ setInfoOpen(!infoOpen); }} style={{flexShrink:0,background:"transparent",border:"1px solid "+BD,color:T3,fontSize:9,fontWeight:800,borderRadius:5,padding:"2px 7px",cursor:"pointer"}}>&#9432; {layoutMode=="fno" ? "Sim" : (layoutMode=="split" || (idx && idx.ltp!=null && singleTf.kind=="preview") || !isIndex ? "Preview" : "Info")}</button>
          {infoOpen ? (
            <div style={{position:"absolute",top:28,right:0,width:260,background:CARD,border:"1px solid "+BD,borderRadius:8,boxShadow:"0 8px 24px rgba(0,0,0,0.3)",zIndex:60,padding:"8px 10px",fontSize:10,color:T1,lineHeight:1.5}}>
              {infoText}
            </div>
          ) : null}
        </div>

        <button onClick={function(){ props.setTab && props.setTab("home"); }} style={{flexShrink:0,background:"rgba(120,120,120,0.12)",border:"none",borderRadius:6,width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,color:T1}} title="Home">&#8962;</button>
      </div>
      </div>

      {/* ================= CONTENT: fills all remaining viewport height
          (the elastic flex area between the capped top ribbon and the
          fixed-height docked bottom bar). ==== */}
      <div style={{flex:"1 1 0",minHeight:0,display:"flex",flexDirection:"column",padding: isIndex && idx && idx.ltp!=null ? (layoutMode=="split" || layoutMode=="fno" ? "4px 8px" : "6px 10px") : "10px 12px",boxSizing:"border-box",overflow: layoutMode=="single" ? "visible" : (isIndex && idx && idx.ltp!=null ? "hidden" : "auto")}}>
        {!isIndex ? (
          <div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"12px 14px",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:14,fontWeight:800,color:T1}}>{instLabel}{equityMeta && equityMeta.name ? " - "+equityMeta.name : ""}</div>
                <ProvenanceBadge type="demo" size="sm"/>
              </div>
              {equityMeta ? (
                <div style={{fontSize:20,fontWeight:900,color:equityMeta.up?UP:DOWN,marginBottom:4}}>
                  {fmtNum(equityMeta.ltp)} <span style={{fontSize:12,fontWeight:700}}>{equityMeta.up?"+":"-"}{equityMeta.chgPct}%</span>
                </div>
              ) : null}
              <div style={{fontSize:10,color:T3,lineHeight:1.5}}>This is a static reference price, not a live tick. Only NIFTY 50, BANK NIFTY, SENSEX and FINNIFTY are wired to a real live feed right now.</div>
            </div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"16px 14px",textAlign:"center"}}>
              <div style={{marginBottom:8}}><ProvenanceBadge type="unavailable" size="md"/></div>
              <div style={{fontSize:12,color:T2,lineHeight:1.6}}>
                Candlestick charting, Support/Resistance and CPR need real session open/high/low/prevClose for {instLabel}. No verified per-stock intraday or EOD data provider is connected yet - this analytics engine only fabricates nothing, so nothing renders here rather than guessing.<br/>
                Switch to NIFTY 50, BANK NIFTY, SENSEX or FINNIFTY above for the full live split-view charting engine.
              </div>
            </div>
          </div>
        ) : !idx || idx.ltp==null ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"20px 12px",textAlign:"center",color:T2,fontSize:12}}>
            No verified data available right now for {instLabel}.
          </div>
        ) : layoutMode=="single" ? (
          <SingleModeView theme={theme} idx={idx} range={range} cpr={cpr} singleCandles={singleCandles} chartMode={chartMode} isPreview={singleTf.kind=="preview"} patternSummary={patternSummary} singlePattern={singlePattern} singleTfLabel={singleTf.label} isMobileWidth={isMobileWidth} helpOpen={helpOpen} setHelpOpen={setHelpOpen}/>
        ) : (
          <div style={{flex:"1 1 0",minHeight:0,overflow:"hidden",display:"flex",flexDirection:"column"}}>

            {/* Chart region - takes ALL remaining height. */}
            <div style={{flex:"1 1 0",minHeight:0,overflow:"hidden",marginBottom: layoutMode=="split" || layoutMode=="fno" ? 4 : 6}}>
              {layoutMode=="split" ? (
                isMobileWidth ? (
                  /* B. Mobile: Angel One stacked 2-split view - each pane
                      gets an equal share of all remaining height. */
                  <div style={{height:"100%",minHeight:0,overflow:"hidden",display:"flex",flexDirection:"column",gap:4}}>
                    <div style={{flex:"1 1 0",minHeight:0,display:"flex",flexDirection:"column"}}>
                      <ChartPane theme={theme} tf={tfByKey(mobileTopTf)} candles={candlesByTf[mobileTopTf]||[]} pattern={patternByTf[mobileTopTf]} idx={idx} cpr={cpr} countdownSec={countdownFor(tfByKey(mobileTopTf))} marketOpen={session.isOpen} compact={true} onPickTf={setMobileTopTf} onPatternClick={setPatternModal}/>
                    </div>
                    <div style={{flex:"1 1 0",minHeight:0,display:"flex",flexDirection:"column"}}>
                      <ChartPane theme={theme} tf={tfByKey(mobileBottomTf)} candles={candlesByTf[mobileBottomTf]||[]} pattern={patternByTf[mobileBottomTf]} idx={idx} cpr={cpr} countdownSec={countdownFor(tfByKey(mobileBottomTf))} marketOpen={session.isOpen} compact={true} onPickTf={setMobileBottomTf} onPatternClick={setPatternModal}/>
                    </div>
                  </div>
                ) : (
                  /* A. Desktop/laptop: fixed 2x2 matrix filling all
                      remaining viewport height - no fixed pixel guess, the
                      grid itself is the full-height flex child, so all 4
                      panes are always fully visible with zero page scroll. */
                  <div style={{height:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 1fr",gap:4,minHeight:0,overflow:"hidden"}}>
                    {SPLIT_TF_KEYS.map(function(k){
                      var tfObj = tfByKey(k);
                      return (
                        <ChartPane key={k} theme={theme} tf={tfObj} candles={candlesByTf[k]||[]} pattern={patternByTf[k]} idx={idx} cpr={cpr} countdownSec={countdownFor(tfObj)} marketOpen={session.isOpen} compact={true} onPatternClick={setPatternModal}/>
                      );
                    })}
                  </div>
                )
              ) : layoutMode=="fno" ? (
                !fnoData ? (
                  <div style={{padding:"40px 12px",textAlign:"center",fontSize:12,color:T2}}>Loading F&amp;O Scalper panes...</div>
                ) : isMobileWidth ? (
                  /* Mobile: all 4 panes stacked, scrollable within this one
                      inner region - the outer page itself never scrolls. */
                  <div style={{height:"100%",minHeight:0,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
                    <div style={{minHeight:150,flexShrink:0}}>
                      <ChartPane theme={theme} tf={fnoData.spot.tfObj} tfList={FNO_TIMEFRAMES} candles={fnoData.spot.candles} pattern={fnoData.spot.pattern} idx={idx} cpr={cpr} marketOpen={session.isOpen} compact={true} onPickTf={function(k){ setFnoTfByPane(function(p){ return { spot:k, ce:p.ce, pe:p.pe, itmCe:p.itmCe }; }); }} onPatternClick={setPatternModal}/>
                    </div>
                    <div style={{minHeight:150,flexShrink:0}}>
                      <ChartPane theme={theme} tf={fnoData.ce.tfObj} tfList={FNO_TIMEFRAMES} candles={fnoData.ce.candles} pattern={fnoData.ce.pattern} idx={idx} compact={true} optionInfo={{ title:selected.key+" "+fmtNum(fnoData.ce.strike)+" CE", ltp:fnoData.ce.summary.ltp, chgPct:fnoData.ce.summary.chgPct }} onPickTf={function(k){ setFnoTfByPane(function(p){ return { spot:p.spot, ce:k, pe:p.pe, itmCe:p.itmCe }; }); }} onPatternClick={setPatternModal}/>
                    </div>
                    <div style={{minHeight:150,flexShrink:0}}>
                      <ChartPane theme={theme} tf={fnoData.pe.tfObj} tfList={FNO_TIMEFRAMES} candles={fnoData.pe.candles} pattern={fnoData.pe.pattern} idx={idx} compact={true} optionInfo={{ title:selected.key+" "+fmtNum(fnoData.pe.strike)+" PE", ltp:fnoData.pe.summary.ltp, chgPct:fnoData.pe.summary.chgPct }} onPickTf={function(k){ setFnoTfByPane(function(p){ return { spot:p.spot, ce:p.ce, pe:k, itmCe:p.itmCe }; }); }} onPatternClick={setPatternModal}/>
                    </div>
                    <div style={{minHeight:150,flexShrink:0}}>
                      <ChartPane theme={theme} tf={fnoData.itmCe.tfObj} tfList={FNO_TIMEFRAMES} candles={fnoData.itmCe.candles} pattern={fnoData.itmCe.pattern} idx={idx} compact={true} optionInfo={{ title:selected.key+" "+fmtNum(fnoData.itmCe.strike)+" CE (ITM)", ltp:fnoData.itmCe.summary.ltp, chgPct:fnoData.itmCe.summary.chgPct }} onPickTf={function(k){ setFnoTfByPane(function(p){ return { spot:p.spot, ce:p.ce, pe:p.pe, itmCe:k }; }); }} onPatternClick={setPatternModal}/>
                    </div>
                  </div>
                ) : (
                  /* Desktop: fixed 2x2 Option Scalper matrix - Spot | ATM CE
                      / OTM PE | ITM CE, exactly like the Multi-TF grid. */
                  <div style={{height:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 1fr",gap:4,minHeight:0,overflow:"hidden"}}>
                    <ChartPane theme={theme} tf={fnoData.spot.tfObj} tfList={FNO_TIMEFRAMES} candles={fnoData.spot.candles} pattern={fnoData.spot.pattern} idx={idx} cpr={cpr} marketOpen={session.isOpen} compact={true} onPickTf={function(k){ setFnoTfByPane(function(p){ return { spot:k, ce:p.ce, pe:p.pe, itmCe:p.itmCe }; }); }} onPatternClick={setPatternModal}/>
                    <ChartPane theme={theme} tf={fnoData.ce.tfObj} tfList={FNO_TIMEFRAMES} candles={fnoData.ce.candles} pattern={fnoData.ce.pattern} idx={idx} compact={true} optionInfo={{ title:selected.key+" "+fmtNum(fnoData.ce.strike)+" CE", ltp:fnoData.ce.summary.ltp, chgPct:fnoData.ce.summary.chgPct }} onPickTf={function(k){ setFnoTfByPane(function(p){ return { spot:p.spot, ce:k, pe:p.pe, itmCe:p.itmCe }; }); }} onPatternClick={setPatternModal}/>
                    <ChartPane theme={theme} tf={fnoData.pe.tfObj} tfList={FNO_TIMEFRAMES} candles={fnoData.pe.candles} pattern={fnoData.pe.pattern} idx={idx} compact={true} optionInfo={{ title:selected.key+" "+fmtNum(fnoData.pe.strike)+" PE", ltp:fnoData.pe.summary.ltp, chgPct:fnoData.pe.summary.chgPct }} onPickTf={function(k){ setFnoTfByPane(function(p){ return { spot:p.spot, ce:p.ce, pe:k, itmCe:p.itmCe }; }); }} onPatternClick={setPatternModal}/>
                    <ChartPane theme={theme} tf={fnoData.itmCe.tfObj} tfList={FNO_TIMEFRAMES} candles={fnoData.itmCe.candles} pattern={fnoData.itmCe.pattern} idx={idx} compact={true} optionInfo={{ title:selected.key+" "+fmtNum(fnoData.itmCe.strike)+" CE (ITM)", ltp:fnoData.itmCe.summary.ltp, chgPct:fnoData.itmCe.summary.chgPct }} onPickTf={function(k){ setFnoTfByPane(function(p){ return { spot:p.spot, ce:p.ce, pe:p.pe, itmCe:k }; }); }} onPatternClick={setPatternModal}/>
                  </div>
                )
              ) : (
                <div style={{height:"100%",minHeight:0,overflow:"hidden",background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"6px 8px",boxSizing:"border-box",display:"flex",flexDirection:"column"}}>
                  {singleCandles.length>0 ? (
                    <CandleChart theme={theme} candles={singleCandles} mode={chartMode} dayHigh={idx.high} dayLow={idx.low} cpr={cpr} ltp={idx.ltp} isPreview={singleTf.kind=="preview"} fill={true}/>
                  ) : (
                    <div style={{padding:"40px 12px",textAlign:"center",fontSize:12,color:T2}}>No candle data available for this timeframe right now.</div>
                  )}
                </div>
              )}
            </div>

            {/* Docked compact Range-Bound analytics bar - fixed height,
                shared by both layouts, always real data. */}
            {range && cpr ? (
              <div style={{flexShrink:0,height:28,maxHeight:28,boxSizing:"border-box",background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"4px 10px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap",overflowX:"auto",overflowY:"hidden"}}>
                <div style={{flexShrink:0}}>
                  <div style={{fontSize:8,color:T3,lineHeight:1}}>CMP</div>
                  <div style={{fontSize:11,fontWeight:800,color:T1,lineHeight:1.1}}>{fmtNum(range.ltp)}</div>
                </div>
                <div style={{flex:1,minWidth:90}}>
                  <div style={{position:"relative",height:8}}>
                    <div style={{position:"absolute",top:3,left:0,right:0,height:2,background:BD}}></div>
                    <div style={{position:"absolute",top:0,left:"calc("+range.posPct+"% - 4px)",width:8,height:8,borderRadius:"50%",background:BLUE,border:"1px solid "+CARD}}></div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:T3,lineHeight:1}}>
                    <span>L {fmtNum(range.low)}</span>
                    <span>H {fmtNum(range.high)}</span>
                  </div>
                </div>
                <span style={{flexShrink:0,fontSize:9,fontWeight:800,color:cpr.status=="Narrow CPR"?SENT_YELLOW:T2,background:(cpr.status=="Narrow CPR"?SENT_YELLOW:T2)+"18",borderRadius:6,padding:"2px 7px",whiteSpace:"nowrap"}}>{cpr.status}</span>
                <div style={{flexShrink:0,textAlign:"right"}}>
                  <div style={{fontSize:8,color:T3,lineHeight:1}}>Dist R1</div>
                  <div style={{fontSize:11,fontWeight:800,color:DOWN,lineHeight:1.1}}>{fmtNum(Math.round((cpr.r1-idx.ltp)*100)/100)}</div>
                </div>
                <div style={{flexShrink:0,textAlign:"right"}}>
                  <div style={{fontSize:8,color:T3,lineHeight:1}}>Dist S1</div>
                  <div style={{fontSize:11,fontWeight:800,color:UP,lineHeight:1.1}}>{fmtNum(Math.round((idx.ltp-cpr.s1)*100)/100)}</div>
                </div>
                {layoutMode=="single" ? (
                  <span
                    onClick={singlePattern ? function(){ setPatternModal(singlePattern.name); } : undefined}
                    title={singlePattern ? "Tap for educational info" : undefined}
                    style={{flexShrink:0,fontSize:8,fontWeight:700,color:singlePatternColor,background:singlePatternColor+"14",border:"1px solid "+singlePatternColor+"40",borderRadius:5,padding:"2px 6px",whiteSpace:"nowrap",cursor:singlePattern?"pointer":"default"}}>
                    {singlePattern ? singlePattern.name : "No pattern"}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <PatternInfoModal name={patternModal} onClose={function(){ setPatternModal(null); }}/>
    </div>
  );
}
