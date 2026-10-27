// Rule model + validation: thresholds, symbols, watchlist-only monitoring.
import test from "node:test";
import assert from "node:assert/strict";
import { validateRuleInput, normalizeSymbol, cleanWatchlist, allowedSymbols, symbolAllowed, MAX_WATCHLIST, RULE_TYPES, groupOf, PATTERN_IDS } from "../src/alerts/alertRules.js";

test("symbols normalise to canonical form; unsafe text is refused", function(){
  assert.equal(normalizeSymbol(" reliance.ns "), "RELIANCE");
  assert.equal(normalizeSymbol("NIFTY 50"), "NIFTY"); assert.equal(normalizeSymbol("Bank Nifty"), "BANKNIFTY"); assert.equal(normalizeSymbol("m&m"), "M&M");
  for(var bad of ["", "1ABC", "A B", "<script>", "A".repeat(30), "x;drop", null, 7, {}]) assert.equal(normalizeSymbol(bad), null, String(bad));
});

test("watchlist cleaning: strings or {sym}, unique, capped", function(){
  assert.deepEqual(cleanWatchlist(["tcs", { sym:"INFY" }, "TCS", "bad sym", 5, null]), ["TCS", "INFY"]);
  var many = []; for(var i = 0; i < 60; i++) many.push("S" + i);
  assert.equal(cleanWatchlist(many).length, MAX_WATCHLIST);
  assert.deepEqual(cleanWatchlist("nope"), []);
});

test("monitoring scope: watchlist only; the two indices join only when enabled", function(){
  assert.deepEqual(allowedSymbols(["TCS"], false), ["TCS"]);
  assert.deepEqual(allowedSymbols(["TCS"], true), ["TCS", "NIFTY", "BANKNIFTY"]);
  assert.equal(symbolAllowed("INFY", ["TCS"], true), false, "no stock outside the watchlist is ever allowed");
  assert.equal(symbolAllowed("NIFTY", ["TCS"], false), false);
  assert.equal(symbolAllowed("NIFTY", ["TCS"], true), true);
});

test("thresholds are validated per rule type with boundary values", function(){
  var ctx = { watchlist:["TCS"], indicesEnabled:false };
  function v(type, params, tf){ return validateRuleInput({ symbol:"TCS", type:type, timeframe:tf, params:params }, ctx); }
  assert.equal(v("price_above", { value:"100.5" }).ok, true);
  assert.equal(v("price_above", { value:"100.5" }).rule.params.value, 100.5);
  assert.equal(v("price_above", { value:0 }).ok, false);
  assert.equal(v("price_above", { value:1e9 }).ok, false);
  assert.equal(v("price_above", { value:"x" }).ok, false);
  assert.equal(v("pct_up", { pct:0.1 }).ok, true); assert.equal(v("pct_up", { pct:0.09 }).ok, false);
  assert.equal(v("pct_down", { pct:50 }).ok, true); assert.equal(v("pct_down", { pct:50.1 }).ok, false);
  assert.equal(v("volume_spike", { mult:1.5 }, "15m").ok, true); assert.equal(v("volume_spike", { mult:1.4 }, "15m").ok, false);
  assert.equal(v("volume_spike", {}, "15m").rule.params.mult, 2, "documented default multiple");
  assert.equal(v("volume_spike", { mult:20 }, "15m").ok, true); assert.equal(v("volume_spike", { mult:21 }, "15m").ok, false);
  assert.equal(v("price_up_volume", { mult:3, minMovePct:0.05 }, "5m").ok, true); assert.equal(v("price_up_volume", { mult:3, minMovePct:0.01 }, "5m").ok, false);
  assert.equal(v("volume_spike", { mult:3 }, "2m").ok, false, "only supported timeframes");
  assert.equal(v("volume_spike", { mult:3 }).ok, false, "timeframe required for candle based rules");
  assert.equal(v("price_above", { value:5 }, "weird").ok, false);
  assert.equal(v("breakout", {}, "1D").ok, true);
  assert.equal(v("candle", { patterns:["doji", "doji", "hammer"] }, "5m").rule.params.patterns.length, 2);
  assert.equal(v("candle", { patterns:["doji", "marubozu"] }, "5m").ok, false);
});

test("errors are codes (never raw input text), several can be reported at once", function(){
  var r = validateRuleInput({ symbol:"<img onerror>", type:"zzz", params:{ value:-1 } }, { watchlist:[], indicesEnabled:false });
  assert.equal(r.ok, false);
  assert.ok(r.errors.indexOf("invalid_symbol") >= 0 && r.errors.indexOf("invalid_type") >= 0);
  r.errors.forEach(function(e){ assert.match(e, /^[a-z_]+$/); });
  assert.equal(validateRuleInput(null).ok, false);
  assert.equal(validateRuleInput("x").ok, false);
});

test("every rule type belongs to one of the four filter groups; every pattern has a name key in the packs", async function(){
  var groups = { candle:1, action:1, volume:1, level:1 };
  Object.keys(RULE_TYPES).forEach(function(k){ assert.ok(groups[groupOf(k)], k); });
  var L = await import("../src/alerts/alertLang.js");
  PATTERN_IDS.forEach(function(p){ ["en", "te", "hi", "kn", "ta"].forEach(function(l){ assert.ok(L.hasAlertKey(l, "pat." + p), l + " " + p); }); });
});
