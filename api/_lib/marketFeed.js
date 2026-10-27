// BreakoutPro - api/_lib/marketFeed.js
// Server side of the unified market-data layer. One place that talks to Yahoo for quotes and
// candles; every API action and the alert runner go through it.
//
//  - Quotes: Yahoo v7 batch (one request per 50 symbols, needs the cookie + crumb pair, which gives
//    exchangeDataDelayedBy). If v7 fails, a bounded per-symbol chart fallback is used.
//  - Candles: delegated to alertData.fetchFrame (the same parser the alert engine uses).
//  - Cache: per warm instance, TTL by session, in-flight de-duplication so concurrent callers share
//    one upstream request. Serverless instances do not share memory; the Cache-Control s-maxage on
//    the API response is what lets the CDN share one copy across users.
//  - Rate limits: a 429 or repeated failures open a circuit breaker with growing back-off; while open
//    the layer serves the last cached copy (its own status degrades with age) or UNAVAILABLE.
//  - Nothing is invented. A symbol the provider cannot resolve comes back UNAVAILABLE.
// Rules: no backtick, no triple-equals, ASCII only.

import { toYahooSymbol, fromYahooSymbol, normalizeQuote, markCompleted, hasVolume, frameKey, FRAMES, STATUS } from "../../src/market/marketData.js";
import { sessionAt } from "../../src/alerts/alertEngine.js";
import { fetchFrame, parseChart } from "./alertData.js";

export var LIMITS = { BATCH:50, MAX_SYMBOLS:500, FALLBACK_MAX:20, CONCURRENCY:4, TIMEOUT_MS:6000,
  TTL_OPEN_MS:15000, TTL_CLOSED_MS:300000, CANDLE_TTL_OPEN_MS:30000, CANDLE_TTL_CLOSED_MS:600000,
  BREAKER_BASE_MS:30000, BREAKER_MAX_MS:600000, CRUMB_TTL_MS:3600000 };

var state = { quotes:new Map(), candles:new Map(), inflight:new Map(), crumb:null, cookie:null, crumbAt:0, failures:0, blockedUntil:0 };
export function _resetForTests(){ state = { quotes:new Map(), candles:new Map(), inflight:new Map(), crumb:null, cookie:null, crumbAt:0, failures:0, blockedUntil:0 }; }
export function breakerState(now){ return { open: state.blockedUntil > (now != null ? now : Date.now()), blockedUntil:state.blockedUntil, failures:state.failures }; }

function isNum(v){ return typeof v == "number" && isFinite(v); }
function ttlFor(now, openMs, closedMs){ return sessionAt(now) == "OPEN" ? openMs : closedMs; }

function noteFailure(code, now){
  state.failures++;
  if(code == "rate_limited" || state.failures >= 3){
    var wait = Math.min(LIMITS.BREAKER_MAX_MS, LIMITS.BREAKER_BASE_MS * Math.pow(2, Math.min(state.failures - 1, 5)));
    state.blockedUntil = now + wait;
  }
}
function noteSuccess(){ state.failures = 0; state.blockedUntil = 0; }

function withTimeout(f, url, init, ms){
  var ctrl = null, timer = null;
  try{ ctrl = new AbortController(); }catch(e){ ctrl = null; }
  if(ctrl){ init = Object.assign({}, init, { signal:ctrl.signal }); timer = setTimeout(function(){ try{ ctrl.abort(); }catch(e){} }, ms); }
  return Promise.resolve().then(function(){ return f(url, init); }).then(function(r){ if(timer) clearTimeout(timer); return r; },
    function(err){ if(timer) clearTimeout(timer); throw err; });
}

// ---- Yahoo cookie + crumb (needed by the v7 quote endpoint) ------------------------------
export function getCrumb(opts){
  opts = opts || {};
  var f = opts.fetchImpl || fetch, now = opts.now != null ? opts.now : Date.now();
  if(state.crumb && state.cookie && now - state.crumbAt < LIMITS.CRUMB_TTL_MS) return Promise.resolve({ crumb:state.crumb, cookie:state.cookie });
  return withTimeout(f, "https://fc.yahoo.com", { headers:{ "User-Agent":"Mozilla/5.0" } }, LIMITS.TIMEOUT_MS).then(function(r){
    var sc = (r.headers && r.headers.get && r.headers.get("set-cookie")) || "";
    var cookie = sc.split(";")[0] || "";
    return withTimeout(f, "https://query1.finance.yahoo.com/v1/test/getcrumb", { headers:{ "User-Agent":"Mozilla/5.0", "Cookie":cookie } }, LIMITS.TIMEOUT_MS)
      .then(function(cr){ return cr.text(); }).then(function(txt){
        if(txt && txt.indexOf("<") < 0 && txt.length < 64){ state.crumb = txt.trim(); state.cookie = cookie; state.crumbAt = now; return { crumb:state.crumb, cookie:cookie }; }
        return { crumb:null, cookie:null };
      });
  }).catch(function(){ return { crumb:null, cookie:null }; });
}

// Pure: one Yahoo v7 row -> raw quote fields (null when unusable).
export function rawFromV7(row){
  if(!row || !isNum(row.regularMarketPrice) || !(row.regularMarketPrice > 0)) return null;
  return {
    price:row.regularMarketPrice, prevClose:row.regularMarketPreviousClose, change:row.regularMarketChange, changePct:row.regularMarketChangePercent,
    open:row.regularMarketOpen, high:row.regularMarketDayHigh, low:row.regularMarketDayLow, volume:row.regularMarketVolume,
    asOf:isNum(row.regularMarketTime) ? row.regularMarketTime * 1000 : null,
    delayedBySec:isNum(row.exchangeDataDelayedBy) ? row.exchangeDataDelayedBy : null, marketState:row.marketState || null
  };
}
// Pure: Yahoo chart JSON meta -> raw quote fields (delay is not reported by this endpoint).
export function rawFromChartMeta(m){
  if(!m || !isNum(m.regularMarketPrice) || !(m.regularMarketPrice > 0)) return null;
  var prev = isNum(m.chartPreviousClose) ? m.chartPreviousClose : (isNum(m.previousClose) ? m.previousClose : null);
  return { price:m.regularMarketPrice, prevClose:prev, change:null, changePct:null, open:null, high:m.regularMarketDayHigh, low:m.regularMarketDayLow,
    volume:m.regularMarketVolume, asOf:isNum(m.regularMarketTime) ? m.regularMarketTime * 1000 : null,
    delayedBySec:isNum(m.exchangeDataDelayedBy) ? m.exchangeDataDelayedBy : null, marketState:m.marketState || null };
}

function fetchV7(ysyms, opts){
  var f = opts.fetchImpl || fetch;
  return getCrumb(opts).then(function(auth){
    var url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + ysyms.map(encodeURIComponent).join(",");
    if(auth.crumb) url += "&crumb=" + encodeURIComponent(auth.crumb);
    var headers = { "User-Agent":"Mozilla/5.0", "Accept":"application/json" };
    if(auth.cookie) headers.Cookie = auth.cookie;
    return withTimeout(f, url, { headers:headers }, LIMITS.TIMEOUT_MS).then(function(r){
      if(r.status == 429) return { ok:false, code:"rate_limited" };
      if(r.status == 401 || r.status == 403){ state.crumb = null; return { ok:false, code:"auth" }; }
      if(!r.ok) return { ok:false, code:"provider_error" };
      return Promise.resolve(r.json()).then(function(j){
        var rows = j && j.quoteResponse && j.quoteResponse.result;
        if(!Array.isArray(rows)) return { ok:false, code:"provider_error" };
        var map = {};
        rows.forEach(function(row){ if(row && row.symbol) map[row.symbol] = rawFromV7(row); });
        return { ok:true, map:map };
      }, function(){ return { ok:false, code:"provider_error" }; });
    });
  }).catch(function(err){ return { ok:false, code:(err && err.name == "AbortError") ? "timeout" : "provider_error" }; });
}

function fetchChartMeta(ysym, opts){
  var f = opts.fetchImpl || fetch;
  var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(ysym) + "?range=1d&interval=1d";
  return withTimeout(f, url, { headers:{ "User-Agent":"Mozilla/5.0", "Accept":"application/json" } }, LIMITS.TIMEOUT_MS).then(function(r){
    if(r.status == 429) return { ok:false, code:"rate_limited" };
    if(!r.ok) return { ok:false, code:"provider_error" };
    return Promise.resolve(r.json()).then(function(j){
      var res = j && j.chart && j.chart.result && j.chart.result[0];
      var raw = res ? rawFromChartMeta(res.meta) : null;
      return raw ? { ok:true, raw:raw } : { ok:false, code:"no_data" };
    }, function(){ return { ok:false, code:"provider_error" }; });
  }).catch(function(err){ return { ok:false, code:(err && err.name == "AbortError") ? "timeout" : "provider_error" }; });
}

function chunk(list, n){ var out = []; for(var i = 0; i < list.length; i += n) out.push(list.slice(i, i + n)); return out; }

function runLimited(jobs, limit){
  var results = new Array(jobs.length), idx = 0;
  function worker(){
    if(idx >= jobs.length) return Promise.resolve();
    var my = idx++;
    return jobs[my]().then(function(r){ results[my] = r; }).then(worker);
  }
  var ws = [];
  for(var i = 0; i < Math.min(limit, jobs.length); i++) ws.push(worker());
  return Promise.all(ws).then(function(){ return results; });
}

// Upstream fetch for symbols that are not fresh in the cache. Returns { raw:{ysym:raw}, codes:[...], source }.
function fetchUpstream(ysyms, opts){
  var now = opts.now != null ? opts.now : Date.now();
  var raw = {}, codes = [], source = "yahoo";
  var jobs = chunk(ysyms, LIMITS.BATCH).map(function(batch){ return function(){ return fetchV7(batch, opts).then(function(r){ return { batch:batch, r:r }; }); }; });
  return runLimited(jobs, 2).then(function(done){
    var missing = [];
    done.forEach(function(d){
      if(d.r.ok){ d.batch.forEach(function(y){ if(d.r.map[y]) raw[y] = d.r.map[y]; else missing.push(y); }); }
      else { codes.push(d.r.code); d.batch.forEach(function(y){ missing.push(y); }); }
    });
    var v7Failed = codes.length > 0;
    if(!v7Failed || !missing.length) return { raw:raw, codes:codes, source:source, fallbackUsed:false };
    if(codes.indexOf("rate_limited") >= 0) return { raw:raw, codes:codes, source:source, fallbackUsed:false };   // do not pile more calls on a 429
    var fb = missing.slice(0, LIMITS.FALLBACK_MAX);
    return runLimited(fb.map(function(y){ return function(){ return fetchChartMeta(y, opts).then(function(r){ return { y:y, r:r }; }); }; }), LIMITS.CONCURRENCY).then(function(list){
      list.forEach(function(it){ if(it.r.ok) raw[it.y] = it.r.raw; else codes.push(it.r.code); });
      return { raw:raw, codes:codes, source:"yahoo-chart", fallbackUsed:true };
    });
  });
}

// symbols: app symbols (RELIANCE, NIFTY ...). opts: { now, fetchImpl, force }
// Returns { quotes:{ SYM: normalizedQuote }, rejected:[sym], source, fetchedAt, cached, provider:{ ok, codes, breakerOpen } }
export function getQuotes(symbols, opts){
  opts = opts || {};
  var now = opts.now != null ? opts.now : Date.now();
  var list = (Array.isArray(symbols) ? symbols : []).slice(0, LIMITS.MAX_SYMBOLS);
  var map = {}, rejected = [], need = [];
  var ttl = ttlFor(now, LIMITS.TTL_OPEN_MS, LIMITS.TTL_CLOSED_MS);
  var seen = {};
  list.forEach(function(sym){
    if(seen[sym]) return; seen[sym] = true;
    var y = toYahooSymbol(sym);
    if(!y){ rejected.push(sym); return; }
    map[sym] = y;
  });
  var syms = Object.keys(map), cachedAll = true;
  syms.forEach(function(sym){
    var hit = state.quotes.get(map[sym]);
    if(!opts.force && hit && now - hit.at < ttl) return;
    need.push(sym); cachedAll = false;
  });
  var breaker = state.blockedUntil > now;
  function build(codes, source){
    var quotes = {};
    syms.forEach(function(sym){
      var hit = state.quotes.get(map[sym]);
      if(hit && hit.raw) quotes[sym] = normalizeQuote(sym, hit.raw, { now:now, source:hit.source });
      else quotes[sym] = normalizeQuote(sym, null, { now:now, source:source });
    });
    return { quotes:quotes, rejected:rejected, source:source, fetchedAt:now, cached:cachedAll, provider:{ ok:codes.length == 0, codes:codes, breakerOpen:breaker } };
  }
  if(!need.length) return Promise.resolve(build([], "yahoo"));
  if(breaker) return Promise.resolve(build(["breaker_open"], "yahoo"));

  var key = "q|" + need.map(function(s){ return map[s]; }).sort().join(",");
  var p = state.inflight.get(key);
  if(!p){
    p = fetchUpstream(need.map(function(s){ return map[s]; }), opts).then(function(res){
      state.inflight.delete(key);
      var gotAny = false;
      need.forEach(function(sym){
        var y = map[sym];
        if(res.raw[y]){ state.quotes.set(y, { raw:res.raw[y], at:now, source:res.source }); gotAny = true; }
      });
      if(gotAny && res.codes.length == 0) noteSuccess();
      else if(!gotAny) noteFailure(res.codes[0] || "provider_error", now);
      return res;
    }, function(err){ state.inflight.delete(key); throw err; });
    state.inflight.set(key, p);
  }
  return p.then(function(res){ return build(res.codes, res.source); });
}

// Raw frame with cache, in-flight sharing and the circuit breaker. Used by getCandles and by the alert runner.
// Resolves { ok:true, fr, at, cached } or { ok:false, code }.
export function getFrame(symbol, frame, opts){
  opts = opts || {};
  var now = opts.now != null ? opts.now : Date.now();
  var y = toYahooSymbol(symbol);
  if(!frame || !FRAMES[frame] || !y) return Promise.resolve({ ok:false, code:"invalid_input" });
  var ttl = ttlFor(now, LIMITS.CANDLE_TTL_OPEN_MS, LIMITS.CANDLE_TTL_CLOSED_MS);
  var key = y + "|" + frame;
  var hit = state.candles.get(key);
  if(!opts.force && hit && now - hit.at < ttl) return Promise.resolve({ ok:true, fr:hit.fr, at:hit.at, cached:true });
  if(state.blockedUntil > now){
    if(hit) return Promise.resolve({ ok:true, fr:hit.fr, at:hit.at, cached:true, servedDuringBreaker:true });
    return Promise.resolve({ ok:false, code:"breaker_open" });
  }
  var ik = "c|" + key, p = state.inflight.get(ik);
  if(!p){
    p = fetchFrame(symbol, frame, { fetchImpl:opts.fetchImpl, now:now, allFrames:true, timeoutMs:LIMITS.TIMEOUT_MS }).then(function(fr){
      state.inflight.delete(ik);
      if(fr.ok){ noteSuccess(); state.candles.set(key, { fr:fr, at:now }); return { ok:true, fr:fr, at:now, cached:false }; }
      noteFailure(fr.code, now);
      return { ok:false, code:fr.code };
    }, function(err){ state.inflight.delete(ik); throw err; });
    state.inflight.set(ik, p);
  }
  return p;
}

// frame: "1m" | "5m" | "15m" | "1H" | "1D" (aliases like "60" accepted). Returns a unified candle response.
export function getCandles(symbol, frameIn, opts){
  opts = opts || {};
  var now = opts.now != null ? opts.now : Date.now();
  var frame = frameKey(frameIn);
  var base = { symbol:symbol, frame:frame, candles:[], volumeAvailable:false, quote:null, source:"yahoo", status:STATUS.UNAVAILABLE, reason:null, fetchedAt:now };
  return getFrame(symbol, frame, opts).then(function(r){
    if(!r.ok){ base.reason = r.code; return base; }
    var fr = r.fr;
    var done = markCompleted(fr.candles, frame, now);
    var q = fr.quote ? normalizeQuote(symbol, { price:fr.quote.price, prevClose:fr.quote.prevClose, high:fr.quote.dayHigh, low:fr.quote.dayLow, volume:fr.quote.volume, asOf:fr.quote.asOf, delayedBySec:fr.quote.delayedBySec }, { now:now }) : null;
    var lastEnd = done.length ? (done[done.length - 1].time + FRAMES[frame].seconds) * 1000 : null;
    var status = q ? q.status : STATUS.DELAYED;
    var reason = q ? q.statusReason : "no_quote_meta";
    if(r.servedDuringBreaker){ reason = "breaker_open_serving_cache"; if(status == STATUS.LIVE) status = STATUS.DELAYED; }
    return { symbol:symbol, frame:frame, candles:done, volumeAvailable:hasVolume(done), quote:q, source:"yahoo", status:status, reason:reason,
             fetchedAt:r.at, lastBarEnd:lastEnd, cached:r.cached };
  });
}

// Alert-runner entry: same contract as alertData.fetchSnapshots, but every frame goes through the shared
// cache, so a run (or several overlapping runs) never asks the provider twice for the same data.
// requests: { SYMBOL: ["5m", ...] }
export function getSnapshots(requests, opts){
  opts = opts || {};
  var jobs = [];
  Object.keys(requests).forEach(function(sym){ requests[sym].forEach(function(tf){ jobs.push({ sym:sym, tf:tf }); }); });
  var results = {};
  return runLimited(jobs.map(function(job){
    return function(){
      return getFrame(job.sym, job.tf, opts).then(function(r){
        var fr = r.ok ? Object.assign({}, r.fr) : { ok:false, code:r.code };
        var s = results[job.sym] || (results[job.sym] = { frames:{}, quote:null });
        s.frames[job.tf] = fr;
        if(fr.ok && fr.quote && (!s.quote || job.tf == "5m")) s.quote = fr.quote;
      });
    };
  }), LIMITS.CONCURRENCY).then(function(){
    var out = {};
    Object.keys(requests).forEach(function(sym){
      var s = results[sym], frames = s ? s.frames : {};
      var anyOk = false, firstCode = null;
      Object.keys(frames).forEach(function(k){ if(frames[k].ok) anyOk = true; else if(!firstCode) firstCode = frames[k].code; });
      out[sym] = anyOk ? { ok:true, quote:s.quote, frames:frames } : { ok:false, code:firstCode || "no_data", quote:null, frames:frames };
    });
    return out;
  });
}

// ---- Generic history for the existing chart screens (/api/history compatibility) -----------------
// The old route accepted any Yahoo range/interval pair. The pairs below are the ones the app uses; anything
// else is rejected instead of being forwarded blindly to the provider.
export var HISTORY_RANGES = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "max"];
export var HISTORY_INTERVALS = ["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo"];
var HISTORY_TTL = { "1m":30000, "2m":30000, "5m":30000, "15m":60000, "30m":60000, "60m":120000, "90m":120000, "1h":120000 };

export function getHistory(symbol, range, interval, opts){
  opts = opts || {};
  var now = opts.now != null ? opts.now : Date.now();
  var y = toYahooSymbol(symbol);
  var out = { symbol:symbol, candles:[], meta:null, volumeAvailable:false, source:"yahoo", status:STATUS.UNAVAILABLE, reason:null, fetchedAt:now };
  if(!y || HISTORY_RANGES.indexOf(range) < 0 || HISTORY_INTERVALS.indexOf(interval) < 0){ out.reason = "invalid_input"; return Promise.resolve(out); }
  var key = "h|" + y + "|" + range + "|" + interval;
  var open = sessionAt(now) == "OPEN";
  var ttl = (HISTORY_TTL[interval] || 300000) * (open ? 1 : 10);
  var hit = state.candles.get(key);
  function shape(h, at){
    var q = h.quote ? normalizeQuote(symbol, { price:h.quote.price, prevClose:h.quote.prevClose, asOf:h.quote.asOf, delayedBySec:h.quote.delayedBySec }, { now:now }) : null;
    return { symbol:symbol, candles:h.candles, meta:h.meta, volumeAvailable:hasVolume(h.candles), quote:q, source:"yahoo", status:q ? q.status : STATUS.DELAYED,
             reason:q ? q.statusReason : "no_quote_meta", fetchedAt:at };
  }
  if(!opts.force && hit && now - hit.at < ttl) return Promise.resolve(shape(hit.h, hit.at));
  if(state.blockedUntil > now){
    if(hit) return Promise.resolve(shape(hit.h, hit.at));
    out.reason = "breaker_open"; return Promise.resolve(out);
  }
  var ik = "i|" + key, p = state.inflight.get(ik);
  if(!p){
    var f = opts.fetchImpl || fetch;
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(y) + "?range=" + range + "&interval=" + interval;
    p = withTimeout(f, url, { headers:{ "User-Agent":"Mozilla/5.0", "Accept":"application/json" } }, 8000).then(function(r){
      if(r.status == 429) return { ok:false, code:"rate_limited" };
      if(!r.ok) return { ok:false, code:"provider_error" };
      return Promise.resolve(r.json()).then(function(j){
        var parsed = parseChart(j, now);
        if(!parsed.ok) return { ok:false, code:parsed.code };
        var m = (j.chart.result[0].meta) || {};
        return { ok:true, h:{ candles:parsed.candles, quote:parsed.quote, meta:{ firstTradeDate:m.firstTradeDate || null, currency:m.currency || null, exchangeName:m.exchangeName || null,
          fiftyTwoWeekHigh:m.fiftyTwoWeekHigh || null, fiftyTwoWeekLow:m.fiftyTwoWeekLow || null } } };
      }, function(){ return { ok:false, code:"provider_error" }; });
    }).catch(function(err){ return { ok:false, code:(err && err.name == "AbortError") ? "timeout" : "provider_error" }; }).then(function(r){
      state.inflight.delete(ik);
      if(r.ok){ noteSuccess(); state.candles.set(key, { h:r.h, at:now }); } else noteFailure(r.code, now);
      return r;
    });
    state.inflight.set(ik, p);
  }
  return p.then(function(r){
    if(r.ok) return shape(r.h, now);
    out.reason = r.code; return out;
  });
}
