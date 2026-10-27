// BreakoutPro - api/_lib/alertData.js
// Server-side market-data adapter for Smart Alerts. Reuses the SAME free provider and
// URL the app already calls (Yahoo chart endpoint, see api/history.js); no new provider,
// no key. Runs only on the server, so nothing here reaches the browser.
//
// PROVIDER FACTS (from this repo, NOT live-verified by the author):
//  - Yahoo NSE data is generally delayed; this adapter reports the provider's own
//    timestamps and the engine labels the result live / delayed / stale from them.
//  - Index symbols (NIFTY, BANKNIFTY) normally carry no volume; the engine then reports
//    "volume unavailable" rather than inventing a signal.
//  - The Dhan provider in this repo has no historical-candle function and only index
//    security ids, so it cannot serve individual NSE stocks and is not used here.
// Output candle shape matches src/screens/BreakoutTfEngine.js validateCandles input:
//   { time (epoch seconds, candle START), open, high, low, close, volume }.
// Rules: no backtick, no triple-equals, ASCII only.

import { toYahooSymbol } from "../../src/market/marketData.js";

var BASE = "https://query1.finance.yahoo.com/v8/finance/chart/";

export var FRAME_SPEC = {
  "5m":  { interval:"5m",  range:"5d"  },
  "15m": { interval:"15m", range:"5d"  },
  "1H":  { interval:"60m", range:"1mo" },
  "1D":  { interval:"1d",  range:"6mo" }
};

// The unified data layer also needs 1m candles; alert rules do not, so FRAME_SPEC stays at four frames.
export var DATA_FRAME_SPEC = Object.assign({ "1m": { interval:"1m", range:"1d" } }, FRAME_SPEC);

// Mapping now lives in src/market/marketData.js (one mapping for the whole app). This wrapper keeps the
// strict alert-side input rule: an upper-case NSE ticker or an app index key, nothing else.
export function yahooSymbol(sym){
  if(typeof sym != "string" || sym != sym.toUpperCase() || sym != sym.trim()) return null;
  if(sym.indexOf(".") >= 0 || sym.charAt(0) == "^") return null;
  var y = toYahooSymbol(sym);
  return y ? encodeURIComponent(y) : null;
}

function isNum(v){ return typeof v == "number" && isFinite(v); }

// Pure: Yahoo chart JSON -> { ok, candles, quote } or { ok:false, code }
export function parseChart(json, nowMs){
  var chart = json && json.chart;
  if(!chart) return { ok:false, code:"provider_error" };
  if(chart.error) return { ok:false, code:(chart.error.code == "Not Found") ? "no_data" : "provider_error" };
  var r = chart.result && chart.result[0];
  if(!r || !Array.isArray(r.timestamp) || !r.indicators || !r.indicators.quote || !r.indicators.quote[0]) return { ok:false, code:"no_data" };
  var q = r.indicators.quote[0], ts = r.timestamp, out = [];
  for(var i = 0; i < ts.length; i++){
    var o = q.open && q.open[i], h = q.high && q.high[i], l = q.low && q.low[i], c = q.close && q.close[i], v = q.volume && q.volume[i];
    if(!isNum(ts[i]) || !isNum(o) || !isNum(h) || !isNum(l) || !isNum(c)) continue;   // provider gaps are skipped, never filled
    out.push({ time:ts[i], open:o, high:h, low:l, close:c, volume:isNum(v) && v >= 0 ? v : 0 });
  }
  if(!out.length) return { ok:false, code:"no_data" };
  var m = r.meta || {};
  var quote = null;
  if(isNum(m.regularMarketPrice) && m.regularMarketPrice > 0 && isNum(m.regularMarketTime)){
    var asOf = m.regularMarketTime * 1000;
    if(!isNum(nowMs) || asOf <= nowMs + 300000){   // a timestamp in the future is not trusted
      quote = { price:m.regularMarketPrice, asOf:asOf };
      // Yahoo's chart meta does not state whether the feed is delayed. When it does not, the quote is
      // flagged so nothing downstream can call it LIVE; a reported delay is carried through.
      if(isNum(m.exchangeDataDelayedBy) && m.exchangeDataDelayedBy >= 0) quote.delayedBySec = m.exchangeDataDelayedBy;
      else quote.delayUnreported = true;
      if(isNum(m.chartPreviousClose) && m.chartPreviousClose > 0) quote.prevClose = m.chartPreviousClose;
      if(isNum(m.regularMarketDayHigh)) quote.dayHigh = m.regularMarketDayHigh;
      if(isNum(m.regularMarketDayLow)) quote.dayLow = m.regularMarketDayLow;
      if(isNum(m.regularMarketVolume)) quote.volume = m.regularMarketVolume;
    }
  }
  return { ok:true, candles:out, quote:quote };
}

// opts: { fetchImpl, timeoutMs, now }
export function fetchFrame(sym, tfKey, opts){
  opts = opts || {};
  var spec = (opts.allFrames ? DATA_FRAME_SPEC : FRAME_SPEC)[tfKey], ys = yahooSymbol(sym);
  if(!spec || !ys) return Promise.resolve({ ok:false, code:"invalid_input" });
  var f = opts.fetchImpl || (typeof fetch != "undefined" ? fetch : null);
  if(!f) return Promise.resolve({ ok:false, code:"provider_error" });
  var now = opts.now != null ? opts.now : Date.now();
  var ctrl = null, timer = null;
  try{ ctrl = new AbortController(); }catch(e){ ctrl = null; }
  if(ctrl) timer = setTimeout(function(){ try{ ctrl.abort(); }catch(e){} }, opts.timeoutMs || 8000);
  var url = BASE + ys + "?range=" + spec.range + "&interval=" + spec.interval;
  return Promise.resolve().then(function(){
    return f(url, { headers:{ "User-Agent":"Mozilla/5.0", "Accept":"application/json" }, signal:ctrl ? ctrl.signal : undefined });
  }).then(function(r){
    if(timer) clearTimeout(timer);
    if(r && r.status == 429) return { ok:false, code:"rate_limited" };
    if(!r || !r.ok) return { ok:false, code:"provider_error" };
    return Promise.resolve(r.json()).then(function(j){
      var p = parseChart(j, now);
      if(!p.ok) return p;
      return { ok:true, candles:p.candles, quote:p.quote, fetchedAt:now };
    }, function(){ return { ok:false, code:"provider_error" }; });
  }, function(err){
    if(timer) clearTimeout(timer);
    return { ok:false, code:(err && err.name == "AbortError") ? "timeout" : "provider_error" };
  });
}

// requests: { SYMBOL: ["5m","15m",...] }. Returns { SYMBOL: { ok, code?, quote, frames } }.
// Concurrency is limited to stay inside provider rate limits.
export function fetchSnapshots(requests, opts){
  opts = opts || {};
  var jobs = [];
  Object.keys(requests).forEach(function(sym){
    requests[sym].forEach(function(tf){ jobs.push({ sym:sym, tf:tf }); });
  });
  var results = {};
  var limit = opts.concurrency || 4, idx = 0;
  function worker(){
    if(idx >= jobs.length) return Promise.resolve();
    var job = jobs[idx++];
    return fetchFrame(job.sym, job.tf, opts).then(function(fr){
      var s = results[job.sym] || (results[job.sym] = { frames:{}, quote:null });
      s.frames[job.tf] = fr;
      if(fr.ok && fr.quote && (!s.quote || (job.tf == "5m"))) s.quote = fr.quote;
    }).then(worker);
  }
  var ws = [];
  for(var i = 0; i < Math.min(limit, jobs.length); i++) ws.push(worker());
  return Promise.all(ws).then(function(){
    var out = {};
    Object.keys(requests).forEach(function(sym){
      var s = results[sym];
      var frames = s ? s.frames : {};
      var anyOk = false, firstCode = null;
      Object.keys(frames).forEach(function(k){ if(frames[k].ok) anyOk = true; else if(!firstCode) firstCode = frames[k].code; });
      out[sym] = anyOk ? { ok:true, quote:s.quote, frames:frames } : { ok:false, code:firstCode || "no_data", quote:null, frames:frames };
    });
    return out;
  });
}

// Which frames each symbol needs for its rules: price rules read the 5m frame (quote, recent
// extremes, previous close); every other type reads its own timeframe.
export function framesNeeded(rules){
  var need = {};
  rules.forEach(function(r){
    if(!r || r.enabled == false) return;
    var list = need[r.symbol] || (need[r.symbol] = []);
    var tf = (r.type == "price_above" || r.type == "price_below" || r.type == "pct_up" || r.type == "pct_down") ? "5m" : r.timeframe;
    if(list.indexOf(tf) < 0) list.push(tf);
  });
  return need;
}
