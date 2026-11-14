// BreakoutPro - tests/market-watch.test.mjs
// Unit tests for the Global & Indian Market Watch feature.
// Tests data integrity, category coverage, formatting, localization, and repo style.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { CATEGORIES, INSTRUMENTS, resolveInstrument, getCategoryItems, formatPriceValue, formatIstTime, formatChangePercent } from "../src/state/marketWatchModel.js";
import EN from "../src/i18n/lang/en.js";
import TE from "../src/i18n/lang/te.js";
import HI from "../src/i18n/lang/hi.js";
import KN from "../src/i18n/lang/kn.js";
import TA from "../src/i18n/lang/ta.js";

var PACKS = { en:EN.strings, te:TE.strings, hi:HI.strings, kn:KN.strings, ta:TA.strings };

test("four market categories exist: India, Global, Commodities, Currencies", function(){
  assert.equal(CATEGORIES.length, 4);
  assert.deepEqual(CATEGORIES.map(function(c){ return c.id; }), ["india", "global", "commodities", "currencies"]);
});

test("all 22 requested instruments are defined in their correct categories", function(){
  // India (7)
  var indiaIds = INSTRUMENTS.india.map(function(x){ return x.id; });
  assert.deepEqual(indiaIds, ["NIFTY", "BANKNIFTY", "SENSEX", "GIFTNIFTY", "VIX", "NIFTY_FUT", "BANKNIFTY_FUT"]);

  // Global (5)
  var globalIds = INSTRUMENTS.global.map(function(x){ return x.id; });
  assert.deepEqual(globalIds, ["SP500", "NASDAQ", "DOW", "DXY", "US10Y"]);

  // Commodities (6)
  var commIds = INSTRUMENTS.commodities.map(function(x){ return x.id; });
  assert.deepEqual(commIds, ["MCX_GOLD", "MCX_SILVER", "MCX_CRUDE", "MCX_NATGAS", "BRENT", "WTI"]);

  // Currencies (4)
  var currIds = INSTRUMENTS.currencies.map(function(x){ return x.id; });
  assert.deepEqual(currIds, ["USDINR", "EURINR", "GBPINR", "USDJPY"]);
});

test("CRITICAL: GIFT NIFTY always shows disconnected and never fabricates a price", function(){
  var giftDef = INSTRUMENTS.india.filter(function(x){ return x.id == "GIFTNIFTY"; })[0];
  var resolved = resolveInstrument(giftDef, { indices:{ GIFTNIFTY:{ ltp:25000 } } }, null);
  assert.equal(resolved.connected, false);
  assert.equal(resolved.status, "UNAVAILABLE");
  assert.equal(resolved.statusLabel, "Data feed not connected");
  assert.equal(resolved.value, null);
  assert.equal(resolved.valFormatted, null);
  assert.equal(resolved.changePercent, null);
});

test("CRITICAL: MCX commodities always show disconnected and never show NYMEX USD prices", function(){
  ["MCX_GOLD", "MCX_SILVER", "MCX_CRUDE", "MCX_NATGAS"].forEach(function(id){
    var def = INSTRUMENTS.commodities.filter(function(x){ return x.id == id; })[0];
    var fakeData = { global:{ items:[{ name:"Crude Oil (WTI)", ltp:72.5 }] } };
    var resolved = resolveInstrument(def, fakeData, null);
    assert.equal(resolved.connected, false);
    assert.equal(resolved.status, "UNAVAILABLE");
    assert.equal(resolved.statusLabel, "Data feed not connected");
    assert.equal(resolved.value, null);
  });
});

test("verified Indian index quotes distinguish LIVE and LAST_CLOSE honestly", function(){
  var niftyDef = INSTRUMENTS.india.filter(function(x){ return x.id == "NIFTY"; })[0];
  var now = 1700000000000;

  // Open session, fresh quote -> LIVE
  var liveData = {
    session: { status:"open" },
    indices: { NIFTY: { ltp:24250.6, chgPct:0.45, ts:now - 30000 } }
  };
  var rLive = resolveInstrument(niftyDef, liveData, null, now);
  assert.equal(rLive.connected, true);
  assert.equal(rLive.status, "LIVE");
  assert.equal(rLive.statusLabel, "LIVE");
  assert.equal(rLive.value, 24250.6);
  assert.equal(rLive.valFormatted, "24,250.60");
  assert.equal(rLive.chgFormatted, "+0.45%");
  assert.equal(rLive.dir, "up");

  // Closed session -> LAST_CLOSE
  var closedData = {
    session: { status:"closed" },
    indices: { NIFTY: { ltp:24250.6, chgPct:-0.15, ts:now - 60000 } }
  };
  var rClosed = resolveInstrument(niftyDef, closedData, null, now);
  assert.equal(rClosed.connected, true);
  assert.equal(rClosed.status, "LAST_CLOSE");
  assert.equal(rClosed.statusLabel, "Last Close");
  assert.equal(rClosed.chgFormatted, "-0.15%");
  assert.equal(rClosed.dir, "down");
});

test("global indices, commodities, and currencies resolve correctly from global items", function(){
  var now = 1700000000000;
  var mmData = {
    global: {
      items: [
        { name:"S&P 500", ltp:5850.25, chgPct:0.32, ts:now - 60000 },
        { name:"Crude Oil (WTI)", ltp:71.85, chgPct:-1.12, ts:now - 60000 },
        { name:"USD/INR", ltp:84.3825, chgPct:0.04, ts:now - 60000 }
      ]
    }
  };

  // S&P 500
  var spDef = INSTRUMENTS.global.filter(function(x){ return x.id == "SP500"; })[0];
  var rSp = resolveInstrument(spDef, mmData, null, now);
  assert.equal(rSp.connected, true);
  assert.equal(rSp.valFormatted, "5,850.25");
  assert.equal(rSp.chgFormatted, "+0.32%");

  // WTI Crude (USD)
  var wtiDef = INSTRUMENTS.commodities.filter(function(x){ return x.id == "WTI"; })[0];
  var rWti = resolveInstrument(wtiDef, mmData, null, now);
  assert.equal(rWti.connected, true);
  assert.equal(rWti.valFormatted, "$71.85");
  assert.equal(rWti.chgFormatted, "-1.12%");

  // USD/INR (Forex 4 decimals)
  var fxDef = INSTRUMENTS.currencies.filter(function(x){ return x.id == "USDINR"; })[0];
  var rFx = resolveInstrument(fxDef, mmData, null, now);
  assert.equal(rFx.connected, true);
  assert.equal(rFx.valFormatted, "84.3825");
});

test("futures feed resolves when Angel One data is present, else shows disconnected", function(){
  var futDef = INSTRUMENTS.india.filter(function(x){ return x.id == "NIFTY_FUT"; })[0];

  // No credentials / no tick
  var rNo = resolveInstrument(futDef, {}, null);
  assert.equal(rNo.connected, false);
  assert.equal(rNo.statusLabel, "Data feed not connected");

  // With tick
  var rYes = resolveInstrument(futDef, {}, { NIFTY: { ltp:24310.0, changePct:0.52, exchangeFeedTime:Date.now(), status:"LIVE", expiry:"28-Nov-2024" } });
  assert.equal(rYes.connected, true);
  assert.equal(rYes.status, "LIVE");
  assert.equal(rYes.valFormatted, "24,310.00");
  assert.equal(rYes.chgFormatted, "+0.52%");
});

test("customization allows reordering and hiding instruments", function(){
  var cat = "india";
  var itemsDefault = getCategoryItems(cat, {}, null, null);
  assert.equal(itemsDefault.length, 7);

  // Reorder
  var customOrder = ["VIX", "NIFTY", "BANKNIFTY", "SENSEX", "GIFTNIFTY", "NIFTY_FUT", "BANKNIFTY_FUT"];
  var itemsReordered = getCategoryItems(cat, {}, null, { order:{ india:customOrder } });
  assert.equal(itemsReordered[0].id, "VIX");
  assert.equal(itemsReordered[1].id, "NIFTY");

  // Hide GIFT NIFTY
  var itemsHidden = getCategoryItems(cat, {}, null, { hidden:{ GIFTNIFTY:true } });
  assert.equal(itemsHidden.length, 6);
  assert.ok(!itemsHidden.some(function(x){ return x.id == "GIFTNIFTY"; }));
});

test("all mw.* translation keys exist in all five languages", function(){
  var required = [
    "mw.title", "mw.sub", "mw.view_all", "mw.tab_india", "mw.tab_global",
    "mw.tab_commodities", "mw.tab_currencies", "mw.not_connected", "mw.live",
    "mw.delayed", "mw.last_close", "mw.stale", "mw.unavail", "mw.customize",
    "mw.reset", "mw.done", "mw.search_placeholder", "mw.instruments",
    "mw.source", "mw.status", "mw.last_price", "mw.change"
  ];

  ["en", "te", "hi", "kn", "ta"].forEach(function(lang){
    var pack = PACKS[lang];
    required.forEach(function(k){
      assert.ok(pack[k] != undefined && pack[k] != "", lang + " missing " + k);
    });
  });
});

test("HomeHub renders HomeMarketWatch between HomeTicker and NewsTicker", function(){
  var hub = fs.readFileSync("src/screens/home/HomeHub.jsx", "utf8");
  var idxTicker = hub.indexOf("<HomeTicker");
  var idxWatch = hub.indexOf("<HomeMarketWatch");
  var idxNews = hub.indexOf("<NewsTicker");
  assert.ok(idxTicker >= 0, "HomeTicker missing");
  assert.ok(idxWatch >= 0, "HomeMarketWatch missing");
  assert.ok(idxNews >= 0, "NewsTicker missing");
  assert.ok(idxTicker < idxWatch && idxWatch < idxNews, "HomeMarketWatch must be between HomeTicker and NewsTicker");
});

test("new market watch files adhere to repo conventions: ASCII only, no backticks, no triple-equals", function(){
  ["src/state/marketWatchModel.js", "src/screens/home/HomeMarketWatch.jsx"].forEach(function(path){
    var s = fs.readFileSync(path, "utf8");
    assert.ok(!/[^\x00-\x7F]/.test(s), path + " has non-ASCII characters");
    assert.ok(s.indexOf("`") < 0, path + " has backticks");
    assert.ok(s.indexOf("===") < 0, path + " has triple-equals");
  });
});
