// BreakoutPro - src/services/breakoutTfFetch.js
// Client loader for the Breakout Time Frame Confirmation screen. It only calls the
// EXISTING server route /api/market?action=historical (Dhan, server-side credentials).
// No new provider, no Yahoo fallback, no fabricated candles: any failure becomes a
// frame with an error code, which the engine reports as Unavailable.
// Caching: successful frames are reused for a short TTL and identical in-flight
// requests are shared, so reopening the screen or switching back does not repeat calls.
// Rules: no backtick, no triple-equals, ASCII only.

import { TIMEFRAMES } from "../screens/BreakoutTfEngine.js";

// Calendar days of history requested per timeframe (provider limit is 90 days intraday).
export var WINDOW_DAYS = { "5m":10, "15m":20, "1H":45, "1D":180 };
export var TTL_MS = { "5m":30000, "15m":30000, "1H":60000, "1D":300000 };
var FAIL_TTL_MS = 10000;
var REQUEST_TIMEOUT_MS = 10000;

var cache = {};      // key -> { at, frame }
var inflight = {};   // key -> Promise

export function clearFrameCache(){ cache = {}; inflight = {}; }

function pad(n){ return n < 10 ? "0" + n : String(n); }
function istIso(ms){
  var d = new Date(ms + 19800000);
  return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
}
// IST calendar dates. Intraday "to" is a date: the provider reads it as 23:59:59.
// Daily "toDate" is non-inclusive at the provider, so tomorrow (IST) is sent.
export function buildRange(tfKey, now){
  var days = WINDOW_DAYS[tfKey] || 10;
  var to = istIso(tfKey == "1D" ? now + 86400000 : now);
  var from = istIso(now - days * 86400000);
  return { from:from, to:to };
}

function failFrame(code, extra){
  var f = { ok:false, error:{ code:code }, fetchedAt:null };
  if(extra){ for(var k in extra){ if(Object.prototype.hasOwnProperty.call(extra, k)) f.error[k] = extra[k]; } }
  return f;
}

// Maps the route's JSON to a frame. Server messages are never shown raw.
export function frameFromResponse(httpStatus, body, now){
  if(body && body.ok == true && body.data && typeof body.data == "object"){
    var d = body.data;
    if(d.state == "EMPTY" || !Array.isArray(d.candles) || d.candles.length == 0) return failFrame("EMPTY");
    return { ok:true, fetchedAt:now, candles:d.candles, meta:{
      source:d.source, symbol:d.symbol, exchangeSegment:d.exchangeSegment, timeframe:d.timeframe,
      timezone:d.timezone, dataStatus:d.dataStatus, from:d.from, to:d.to } };
  }
  var reason = body && typeof body.reason == "string" ? body.reason : "";
  var code = body && typeof body.code == "string" ? body.code : "";
  if(reason == "INVALID_INPUT"){
    return failFrame("INVALID_INPUT", { invalidTimeframe:(code == "invalid_timeframe" || code == "provider_rejected_input") });
  }
  var known = ["CREDENTIALS_MISSING", "CREDENTIALS_INVALID", "DATA_API_NOT_SUBSCRIBED", "RATE_LIMITED", "PROVIDER_ERROR", "TIMEOUT", "EMPTY"];
  if(known.indexOf(reason) >= 0) return failFrame(reason);
  if(httpStatus == 429) return failFrame("RATE_LIMITED");
  if(httpStatus == 504) return failFrame("TIMEOUT");
  return failFrame("PROVIDER_ERROR");
}

// opts (tests): { fetchImpl, now, force }
export function loadFrame(symbol, tfKey, opts){
  opts = opts || {};
  var tf = TIMEFRAMES[tfKey];
  if(!tf) return Promise.resolve(failFrame("INVALID_INPUT", { invalidTimeframe:true }));
  var now = opts.now != null ? opts.now : Date.now();
  var range = buildRange(tfKey, now);
  var key = symbol + "|" + tf.interval + "|" + range.from + "|" + range.to;
  var hit = cache[key];
  if(hit && !opts.force){
    var ttl = hit.frame.ok ? (TTL_MS[tfKey] || 30000) : FAIL_TTL_MS;
    if(now - hit.at < ttl) return Promise.resolve(hit.frame);
  }
  if(inflight[key] && !opts.force) return inflight[key];
  var f = opts.fetchImpl || (typeof fetch != "undefined" ? fetch : null);
  if(!f) return Promise.resolve(failFrame("NETWORK"));
  var url = "/api/market?action=historical&symbol=" + encodeURIComponent(symbol) +
            "&timeframe=" + encodeURIComponent(tf.interval) + "&from=" + range.from + "&to=" + range.to;
  var ctrl = null, timer = null;
  try{ ctrl = new AbortController(); }catch(e){ ctrl = null; }
  if(ctrl) timer = setTimeout(function(){ try{ ctrl.abort(); }catch(e){} }, REQUEST_TIMEOUT_MS);
  var p = Promise.resolve().then(function(){
    return f(url, ctrl ? { signal:ctrl.signal } : undefined);
  }).then(function(r){
    var status = r && r.status;
    return Promise.resolve(r.json()).then(function(body){ return frameFromResponse(status, body, now); }, function(){ return failFrame("PROVIDER_ERROR"); });
  }, function(err){
    return failFrame(err && err.name == "AbortError" ? "TIMEOUT" : "NETWORK");
  }).then(function(frame){
    if(timer) clearTimeout(timer);
    delete inflight[key];
    cache[key] = { at:now, frame:frame };
    return frame;
  });
  inflight[key] = p;
  return p;
}

// Loads the selected timeframe plus its required higher timeframes (shared cache).
export function loadFrames(symbol, tfKey, opts){
  var tf = TIMEFRAMES[tfKey];
  var keys = tf ? [tfKey].concat(tf.htf) : [];
  return Promise.all(keys.map(function(k){ return loadFrame(symbol, k, opts); })).then(function(list){
    var out = {};
    keys.forEach(function(k, i){ out[k] = list[i]; });
    return out;
  });
}
