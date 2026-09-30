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
  { key:"5m", label:"5m", minutes:5, kind:"preview" },
  { key:"10m", label:"10m", minutes:10, kind:"preview" },
  { key:"15m", label:"15m", minutes:15, kind:"preview" },
  { key:"1h", label:"1H", minutes:60, kind:"preview" },
  { key:"1D", label:"1D", minutes:375, kind:"daily" }
];
var SPLIT_TF_KEYS = ["5m", "10m", "15m", "1h"];

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
      phase=0; segStart=0; segEnd=b1; from=wp0; to=wp1; bodyScale=0.11; wickScale=1.25;
    } else if(i < b2){
      // Phase 2: pullback / consolidation base - tight bodies, small range.
      phase=1; segStart=b1; segEnd=b2; from=wp1; to=wp2; bodyScale=0.045; wickScale=0.65;
    } else {
      // Phase 3: secondary breakout/reversal rally back to the real price.
      phase=2; segStart=b2; segEnd=count; from=wp2; to=wp3; bodyScale=0.10; wickScale=1.15;
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
    var wickUp = seeded(seedBase + i*7.71) * range * 0.07 * wickScale;
    var wickDown = seeded(seedBase + i*11.31) * range * 0.07 * wickScale;
    var barHigh = clampPrice(Math.max(prevClose, close) + wickUp);
    var barLow = clampPrice(Math.min(prevClose, close) - wickDown);
    // Illustrative-only volume (no real volume feed exists) - deterministic
    // from the same seed + how large the candle's real move was, normalized
    // 0..1. Only ever drawn on preview-mode panes, which already carry the
    // persistent PREVIEW disclosure.
    var volRaw = 0.22 + 0.78*seeded(seedBase + i*5.47) * (0.4 + Math.abs(close-prevClose)/range);
    out.push({
      i:i, o:Math.round(prevClose*100)/100, h:Math.round(Math.max(barHigh,prevClose,close)*100)/100,
      l:Math.round(Math.min(barLow,prevClose,close)*100)/100, c:Math.round(close*100)/100,
      t: SESSION_START_MIN + i*minutesPerCandle,
      label: clockLabel(SESSION_START_MIN + i*minutesPerCandle),
      vol: Math.max(0.08, Math.min(1, volRaw))
    });
    prevClose = close;
  }
  if(out.length){
    var last = out[out.length-1];
    last.c = Math.round(ltp*100)/100;
    last.h = Math.round(Math.max(last.h, last.c)*100)/100;
    last.l = Math.round(Math.min(last.l, last.c)*100)/100;
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
// AI Candlestick Pattern Recognition Engine - pure arithmetic on the OHLC
// values already computed above (no ML, no external call, fully
// explainable). Checks 3-candle patterns first, then 2-candle, then
// single-candle shape.
// ---------------------------------------------------------------------
function detectPattern(candles){
  if(!candles || candles.length<1) return null;
  var last = candles[candles.length-1];
  var prev = candles.length>=2 ? candles[candles.length-2] : null;
  var prev2 = candles.length>=3 ? candles[candles.length-3] : null;
  var body = Math.abs(last.c - last.o);
  var range = Math.max(0.0001, last.h - last.l);
  var upperWick = last.h - Math.max(last.o, last.c);
  var lowerWick = Math.min(last.o, last.c) - last.l;
  var isBull = last.c > last.o;
  var isBear = last.c < last.o;

  if(prev2 && prev){
    var p2Body = Math.abs(prev2.c - prev2.o);
    var starBody = Math.abs(prev.c - prev.o);
    var mid = (prev2.o + prev2.c) / 2;
    var p2Bear = prev2.c < prev2.o;
    var p2Bull = prev2.c > prev2.o;
    if(p2Bear && starBody <= p2Body*0.45 && isBull && last.c > mid && body > p2Body*0.5){
      return { name:"Morning Star", dir:"bull", desc:"A big red candle, a small-bodied pause, then a strong green candle closing back above the midpoint - a classic reversal-up sequence." };
    }
    if(p2Bull && starBody <= p2Body*0.45 && isBear && last.c < mid && body > p2Body*0.5){
      return { name:"Evening Star", dir:"bear", desc:"A big green candle, a small-bodied pause, then a strong red candle closing back below the midpoint - a classic reversal-down sequence." };
    }
  }
  if(prev){
    var prevBody = Math.abs(prev.c - prev.o);
    var prevBull = prev.c > prev.o;
    var prevBear = prev.c < prev.o;
    if(isBull && prevBear && last.o<=prev.c && last.c>=prev.o && body>prevBody*0.95){
      return { name:"Bullish Engulfing", dir:"bull", desc:"Current candle's real body fully covers the prior red candle - buyers overwhelmed sellers." };
    }
    if(isBear && prevBull && last.o>=prev.c && last.c<=prev.o && body>prevBody*0.95){
      return { name:"Bearish Engulfing", dir:"bear", desc:"Current candle's real body fully covers the prior green candle - sellers overwhelmed buyers." };
    }
  }
  if(body <= range*0.1){
    return { name:"Doji", dir:"neutral", desc:"Open and close are nearly equal - indecision between buyers and sellers." };
  }
  if(body <= range*0.35 && upperWick >= body*0.8 && lowerWick >= body*0.8){
    return { name:"Spinning Top", dir:"neutral", desc:"Small body with wicks on both sides - neither side controlled the candle." };
  }
  if(lowerWick >= body*2 && upperWick <= body*0.5){
    return { name: isBull ? "Hammer" : "Pinbar", dir:"bull", desc:"Long lower wick with a small body near the top - rejection of lower prices." };
  }
  if(upperWick >= body*2 && lowerWick <= body*0.5){
    return { name:"Shooting Star", dir:"bear", desc:"Long upper wick with a small body near the bottom - rejection of higher prices." };
  }
  return null;
}

// ---------------------------------------------------------------------
// Per-candle hover pattern identification - evaluates whichever single bar
// the mouse/touch is currently over (plus the one immediately before it),
// so the floating tooltip can label ANY historical candle, not just the
// latest one. Pure arithmetic on that candle's own OHLC, same shape/priority
// rules as detectPattern() above but scoped to exactly the hovered bar.
// ---------------------------------------------------------------------
function identifyCandlePattern(curr, prev){
  if(!curr) return null;
  var body = Math.abs(curr.c - curr.o);
  var range = Math.max(0.0001, curr.h - curr.l);
  var upperWick = curr.h - Math.max(curr.o, curr.c);
  var lowerWick = Math.min(curr.o, curr.c) - curr.l;
  var isBull = curr.c > curr.o;
  var isBear = curr.c < curr.o;

  if(prev){
    var prevBody = Math.abs(prev.c - prev.o);
    var prevBull = prev.c > prev.o;
    var prevBear = prev.c < prev.o;
    if(isBull && prevBear && curr.o<=prev.c && curr.c>=prev.o && body>prevBody*0.95){
      return { name:"Bullish Engulfing", dir:"bull" };
    }
    if(isBear && prevBull && curr.o>=prev.c && curr.c<=prev.o && body>prevBody*0.95){
      return { name:"Bearish Engulfing", dir:"bear" };
    }
  }
  if(body <= range*0.10){
    return { name:"Doji (Indecision)", dir:"neutral" };
  }
  if(body >= range*0.95 && upperWick <= body*0.05 && lowerWick <= body*0.05){
    return { name: isBull ? "Bullish Marubozu" : "Bearish Marubozu", dir: isBull?"bull":"bear" };
  }
  if(lowerWick >= body*2 && upperWick <= body*0.10){
    return { name: isBull ? "Hammer" : "Pinbar", dir: "bull" };
  }
  if(upperWick >= body*2 && lowerWick <= body*0.10){
    return { name: isBull ? "Inverted Hammer" : "Shooting Star", dir: isBull?"neutral":"bear" };
  }
  return { name: isBull ? "Strong Bullish Candle" : (isBear ? "Strong Bearish Candle" : "Flat Bar"), dir: isBull?"bull":(isBear?"bear":"neutral") };
}

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
function tierConfigFor(chW){
  if(chW < 480) return { body:7, gap:2, min:22, max:38, ceiling:11 };   // phone-width panels
  if(chW < 820) return { body:6, gap:2.2, min:32, max:55, ceiling:11 }; // tablet / medium panes
  return { body:5, gap:2.5, min:45, max:90, ceiling:12 };               // laptop/desktop width
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

  var minPrice, maxPrice;
  if(visible.length){
    var lows = visible.map(function(c){ return c.l; });
    var highs = visible.map(function(c){ return c.h; });
    minPrice = Math.min.apply(null, lows);
    maxPrice = Math.max.apply(null, highs);
  } else {
    minPrice = dayLow!=null ? dayLow : 0;
    maxPrice = dayHigh!=null ? dayHigh : 1;
  }
  if(dayHigh!=null) maxPrice = Math.max(maxPrice, dayHigh);
  if(dayLow!=null) minPrice = Math.min(minPrice, dayLow);
  var priceRange = Math.max(maxPrice - minPrice, 0.01);
  var yMin = minPrice - priceRange*0.05;
  var yMax = maxPrice + priceRange*0.05;

  function yFor(v){
    return padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  }
  function xFor(idx){
    if(visible.length<=1) return padL + plotW/2;
    return padL + (idx/(visible.length-1)) * plotW;
  }

  function clampView(newCount, newEnd){
    var c = Math.max(3, Math.min(newCount, candles.length || 3));
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
  // Prior bar for the hovered candle - looked up from the FULL candle array
  // (not just the visible slice) so the very first visible bar still gets a
  // correct prior-candle comparison (engulfing patterns need it).
  var hoveredPrev = null;
  if(hovered && hoverIdx!=null){
    var absIdx = vs + hoverIdx;
    hoveredPrev = absIdx>0 ? candles[absIdx-1] : null;
  }
  var hoveredPattern = hovered ? identifyCandlePattern(hovered, hoveredPrev) : null;
  var hoveredPatternColor = hoveredPattern ? (hoveredPattern.dir=="bull"?SENT_GREEN:(hoveredPattern.dir=="bear"?SENT_RED:SENT_YELLOW)) : null;
  var hoveredPctChg = hovered && hovered.o ? Math.round(((hovered.c-hovered.o)/hovered.o)*10000)/100 : null;
  // Slim Angel One/TradingView candle geometry, computed from the SAME
  // real-pixel tier used to pick the default count above: body = slot width
  // minus the tier's target gap, so the gap stays a clean 2-2.5px at any
  // density, and a zoom ceiling still stops a lightly-populated pane (e.g.
  // 1H with only a handful of visible bars) from stretching candles into
  // giant blocks.
  var sizingTier = tierConfigFor(chW);
  var slotW = plotW / Math.max(1, visible.length);
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
          var col = isUp ? SENT_GREEN : SENT_RED;
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
        <div style={{position:"absolute",left:6,top:4,background:theme.c.card,border:"1px solid "+theme.c.border,borderRadius:6,padding:compact?"3px 6px":"5px 9px",fontSize:compact?9:10,color:theme.c.text1,display:"flex",flexDirection:"column",gap:compact?2:3,pointerEvents:"none",maxWidth:compact?150:220}}>
          <div style={{display:"flex",gap:compact?5:8,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontWeight:700,color:theme.c.text2}}>{hovered.label ? hovered.label : ("#"+(vs+hoverIdx+1))}</span>
            <span>O <b style={{color:theme.c.text1}}>{fmtNum(hovered.o)}</b></span>
            <span>H <b style={{color:SENT_RED}}>{fmtNum(hovered.h)}</b></span>
            <span>L <b style={{color:SENT_GREEN}}>{fmtNum(hovered.l)}</b></span>
            <span>C <b style={{color:theme.c.text1}}>{fmtNum(hovered.c)}</b></span>
            {hoveredPctChg!=null ? (
              <span style={{color: hoveredPctChg>=0 ? SENT_GREEN : SENT_RED, fontWeight:700}}>{hoveredPctChg>=0?"+":""}{hoveredPctChg}%</span>
            ) : null}
          </div>
          {hoveredPattern ? (
            <div style={{color:hoveredPatternColor,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              &#9889; Pattern: {hoveredPattern.name.toUpperCase()}
            </div>
          ) : null}
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
  var searchRef = useRef(null);

  var isMobileWidth = (theme.winW || 430) < 768;
  var isIndex = selected.kind=="index";

  useEffect(function(){
    var t = setInterval(function(){ setNowTick(getIST()); }, 1000);
    return function(){ clearInterval(t); };
  }, []);

  var idx = isIndex ? indices[selected.key] : null;
  var equityMeta = !isIndex ? findEquity(selected.key) : null;
  var session = sessionInfo(nowTick);
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
    out["1D"] = buildDailyCandles(indexHistory[selected.key]);
    return out;
    // eslint-disable-next-line
  }, [idx, selected.key, barVersions, indexHistory]);

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

  // F&O Option Scalper data - real spot path per pane's chosen scalper
  // timeframe, plus a CALCULATED strike ladder and a disclosed SIMULATED
  // premium series per option pane (see generateOptionPremiumCandles above).
  // Recomputes once per simulated minute (minuteBucket) so bars roll over
  // without regenerating on every 1-second clock tick.
  var minuteBucket = Math.floor(session.elapsedMin);
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
        ? "INTERACTIVE PATTERN PREVIEW - no verified intraday feed connected yet. This "+singleTf.label+" path is a deterministic model anchored to real open/prevClose, clamped to today's real high/low; the final bar always closes at the real live price. Switch to 1D for real historical candles."
        : "CALCULATED - real daily high/low/close from the last "+(singleCandles.length+1)+" sessions. Daily open is not provided by the data source, so each candle's open is set to the previous session's close.";

  return (
    <div style={{background:BG,height:"100vh",maxHeight:"100vh",overflow:"hidden",fontFamily:"Inter,Arial,sans-serif",display:"flex",flexDirection:"column",boxSizing:"border-box",padding:0}}>

      {/* ================= TOP RIBBON (~50px max, hard-capped): both ribbon
          lines share one flexShrink:0 wrapper with an explicit maxHeight so
          the header can never grow and eat into the chart/bottom-bar space,
          regardless of how much content each line wraps. ============ */}
      <div style={{flexShrink:0,maxHeight:50,overflow:"hidden",boxSizing:"border-box",display:"flex",flexDirection:"column"}}>

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
            {TIMEFRAMES.map(function(t){
              var active = t.key==tfKey;
              return (
                <button key={t.key} onClick={function(){ setTfKey(t.key); }} style={{background:active?BLUE:"transparent",border:"1px solid "+(active?BLUE:BD),color:active?"#fff":T2,fontSize:9,fontWeight:700,borderRadius:5,padding:"4px 7px",cursor:"pointer"}}>{t.label}</button>
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

        <button onClick={function(){ props.setTab && props.setTab("home"); }} style={{flexShrink:0,background:"rgba(120,120,120,0.12)",border:"none",borderRadius:6,width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,color:T1}} title="Home">&#8962;</button>
      </div>

      {/* ---- RIBBON LINE 2: AI signal micro-pill + info tooltip toggle,
          replacing the old multi-line disclaimer. ---- */}
      <div style={{flexShrink:0,background:CARD,borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:6,padding:"2px 8px",position:"relative"}}>
        {isIndex && idx && idx.ltp!=null ? (
          layoutMode=="single" ? (
            <span
              onClick={singlePattern ? function(){ setPatternModal(singlePattern.name); } : undefined}
              title={singlePattern ? "Tap for educational info" : undefined}
              style={{fontSize:10,fontWeight:800,color:singlePatternColor,background:singlePatternColor+"18",border:"1px solid "+singlePatternColor+"55",borderRadius:5,padding:"2px 8px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:singlePattern?"pointer":"default"}}>
              &#129302; AI Signal: {singlePattern ? (singlePattern.name+" Detected ("+singleTf.label+")") : "No clear pattern ("+singleTf.label+")"}
            </span>
          ) : layoutMode=="fno" ? (
            <span style={{fontSize:10,fontWeight:800,color:theme.c.gold,background:theme.c.gold+"18",border:"1px solid "+theme.c.gold+"55",borderRadius:5,padding:"2px 8px",whiteSpace:"nowrap"}}>
              &#9878; F&amp;O Scalper - SIM PREMIUM panes, AI patterns live in each pane below
            </span>
          ) : (
            <span style={{fontSize:10,fontWeight:800,color:T2,background:theme.c.card2,border:"1px solid "+BD,borderRadius:5,padding:"2px 8px",whiteSpace:"nowrap"}}>
              &#129302; AI Signals live in each pane below
            </span>
          )
        ) : (
          <span style={{fontSize:10,color:T3}}>{instLabel}</span>
        )}
        <div style={{flex:1}}/>
        <button onClick={function(){ setInfoOpen(!infoOpen); }} style={{flexShrink:0,background:"transparent",border:"1px solid "+BD,color:T3,fontSize:9,fontWeight:800,borderRadius:5,padding:"2px 7px",cursor:"pointer"}}>&#9432; {layoutMode=="fno" ? "Sim" : (layoutMode=="split" || (idx && idx.ltp!=null && singleTf.kind=="preview") || !isIndex ? "Preview" : "Info")}</button>
        {infoOpen ? (
          <div style={{position:"absolute",top:22,right:6,width:280,background:CARD,border:"1px solid "+BD,borderRadius:8,boxShadow:"0 8px 24px rgba(0,0,0,0.3)",zIndex:60,padding:"8px 10px",fontSize:10,color:T1,lineHeight:1.5}}>
            {infoText}
          </div>
        ) : null}
      </div>
      </div>

      {/* ================= CONTENT: fills all remaining viewport height
          (the elastic flex area between the capped top ribbon and the
          fixed-height docked bottom bar). ==== */}
      <div style={{flex:"1 1 0",minHeight:0,display:"flex",flexDirection:"column",padding: isIndex && idx && idx.ltp!=null ? (layoutMode=="split" || layoutMode=="fno" ? "4px 8px" : "6px 10px") : "10px 12px",boxSizing:"border-box",overflow: isIndex && idx && idx.ltp!=null ? "hidden" : "auto"}}>
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
              </div>
            ) : null}
          </div>
        )}
      </div>

      <PatternInfoModal name={patternModal} onClose={function(){ setPatternModal(null); }}/>
    </div>
  );
}
