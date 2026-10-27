// Data adapter contract tests. The Yahoo payloads below are FIXTURES shaped like the provider's
// chart v8 response (as used by api/history.js); no network is used, so these prove the parser
// and error mapping, not live availability.
import test from "node:test";
import assert from "node:assert/strict";
import { yahooSymbol, parseChart, fetchFrame, fetchSnapshots, framesNeeded, FRAME_SPEC } from "../api/_lib/alertData.js";

var NOW = Date.UTC(2026, 9, 13, 5, 30);   // 11:00 IST
function payload(n, extra){
  var ts = [], o = [], h = [], l = [], c = [], v = [];
  for(var i = 0; i < n; i++){ ts.push(1760000000 + i * 300); o.push(100 + i); h.push(101 + i); l.push(99 + i); c.push(100.5 + i); v.push(1000 + i); }
  var r = { timestamp:ts, indicators:{ quote:[{ open:o, high:h, low:l, close:c, volume:v }] }, meta:{ regularMarketPrice:123.4, regularMarketTime:Math.floor(NOW / 1000) - 30 } };
  return { chart:{ result:[Object.assign(r, extra || {})], error:null } };
}
function resp(status, body){ return { status:status, ok:status >= 200 && status < 300, json:function(){ return Promise.resolve(body); } }; }

test("symbol mapping: NSE stocks, the two indices; anything unsafe is refused", function(){
  assert.equal(yahooSymbol("RELIANCE"), "RELIANCE.NS");
  assert.equal(yahooSymbol("M&M"), "M%26M.NS");
  assert.equal(yahooSymbol("NIFTY"), "%5ENSEI");
  assert.equal(yahooSymbol("BANKNIFTY"), "%5ENSEBANK");
  for(var bad of ["", "reliance", "../etc", "A B", "TCS.NS?x=1", "A".repeat(25), null, 5]) assert.equal(yahooSymbol(bad), null);
});

test("timeframes: intraday frames use intraday intervals; daily is its own frame (never relabelled)", function(){
  assert.equal(FRAME_SPEC["5m"].interval, "5m"); assert.equal(FRAME_SPEC["15m"].interval, "15m");
  assert.equal(FRAME_SPEC["1H"].interval, "60m"); assert.equal(FRAME_SPEC["1D"].interval, "1d");
  assert.equal(Object.keys(FRAME_SPEC).length, 4);
});

test("parseChart: maps OHLCV, skips gaps without filling, keeps quote time from the provider", function(){
  var p = payload(6);
  p.chart.result[0].indicators.quote[0].close[2] = null;           // provider gap
  var r = parseChart(p, NOW);
  assert.equal(r.ok, true); assert.equal(r.candles.length, 5);
  assert.deepEqual(Object.keys(r.candles[0]).sort(), ["close", "high", "low", "open", "time", "volume"]);
  assert.equal(r.quote.price, 123.4); assert.equal(r.quote.asOf, (Math.floor(NOW / 1000) - 30) * 1000);
});

test("parseChart: rejects malformed / empty / error payloads; future quote time is not trusted; missing volume is 0, not invented", function(){
  assert.equal(parseChart(null, NOW).code, "provider_error");
  assert.equal(parseChart({}, NOW).code, "provider_error");
  assert.equal(parseChart({ chart:{ result:null, error:{ code:"Not Found" } } }, NOW).code, "no_data");
  assert.equal(parseChart({ chart:{ result:null, error:{ code:"Internal" } } }, NOW).code, "provider_error");
  assert.equal(parseChart({ chart:{ result:[{ timestamp:[], indicators:{ quote:[{}] } }] } }, NOW).code, "no_data");
  var fut = payload(3); fut.chart.result[0].meta.regularMarketTime = Math.floor(NOW / 1000) + 4000;
  assert.equal(parseChart(fut, NOW).quote, null);
  var nov = payload(3); delete nov.chart.result[0].indicators.quote[0].volume;
  assert.deepEqual(parseChart(nov, NOW).candles.map(function(x){ return x.volume; }), [0, 0, 0]);
});

test("fetchFrame: URL is built from the symbol map; statuses map to codes; timeout and network errors never throw", async function(){
  var urls = [];
  var ok = await fetchFrame("RELIANCE", "5m", { now:NOW, fetchImpl:function(u){ urls.push(u); return Promise.resolve(resp(200, payload(5))); } });
  assert.equal(ok.ok, true); assert.equal(ok.fetchedAt, NOW);
  assert.equal(urls[0], "https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS?range=5d&interval=5m");
  assert.equal((await fetchFrame("RELIANCE", "5m", { fetchImpl:function(){ return Promise.resolve(resp(429, {})); } })).code, "rate_limited");
  assert.equal((await fetchFrame("RELIANCE", "5m", { fetchImpl:function(){ return Promise.resolve(resp(500, {})); } })).code, "provider_error");
  assert.equal((await fetchFrame("RELIANCE", "5m", { fetchImpl:function(){ return Promise.reject(new Error("net")); } })).code, "provider_error");
  var abort = function(){ var e = new Error("aborted"); e.name = "AbortError"; return Promise.reject(e); };
  assert.equal((await fetchFrame("RELIANCE", "5m", { fetchImpl:abort })).code, "timeout");
  assert.equal((await fetchFrame("RELIANCE", "5m", { fetchImpl:function(){ return Promise.resolve({ status:200, ok:true, json:function(){ return Promise.reject(new Error("bad json")); } }); } })).code, "provider_error");
  assert.equal((await fetchFrame("bad sym", "5m", { fetchImpl:function(){ throw new Error("must not be called"); } })).code, "invalid_input");
  assert.equal((await fetchFrame("TCS", "7m", { fetchImpl:function(){ throw new Error("must not be called"); } })).code, "invalid_input");
});

test("fetchSnapshots: groups frames per symbol, honours the concurrency limit, reports per-symbol failure", async function(){
  var active = 0, peak = 0, calls = [];
  var f = function(u){
    calls.push(u); active++; peak = Math.max(peak, active);
    return new Promise(function(res){ setTimeout(function(){ active--; res(u.indexOf("BAD.NS") >= 0 ? resp(500, {}) : resp(200, payload(5))); }, 5); });
  };
  var req = { RELIANCE:["5m", "15m"], TCS:["5m"], INFY:["1D"], BAD:["5m"], NIFTY:["5m"], HDFCBANK:["1H"] };
  var out = await fetchSnapshots(req, { fetchImpl:f, now:NOW, concurrency:2 });
  assert.equal(calls.length, 7); assert.ok(peak <= 2, "peak concurrency " + peak);
  assert.equal(out.RELIANCE.ok, true); assert.deepEqual(Object.keys(out.RELIANCE.frames).sort(), ["15m", "5m"]);
  assert.equal(out.RELIANCE.quote.price, 123.4);
  assert.equal(out.BAD.ok, false); assert.equal(out.BAD.code, "provider_error");
  assert.equal(out.NIFTY.ok, true);
});

test("framesNeeded: price rules read 5m, others their own timeframe, disabled rules need nothing", function(){
  var need = framesNeeded([
    { symbol:"A", type:"price_above", timeframe:"1D", enabled:true }, { symbol:"A", type:"breakout", timeframe:"15m", enabled:true },
    { symbol:"B", type:"candle", timeframe:"1D", enabled:true }, { symbol:"C", type:"volume_spike", timeframe:"5m", enabled:false }
  ]);
  assert.deepEqual(need.A.sort(), ["15m", "5m"]); assert.deepEqual(need.B, ["1D"]); assert.equal(need.C, undefined);
});
