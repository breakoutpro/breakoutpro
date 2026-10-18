// Tests for the compact Home Next Move card (view model + source rules).
// Fixtures only: no provider is contacted.
// Run: node --test tests/home-next-move.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import EN from "../src/i18n/lang/en.js";
import { computeDirection } from "../src/screens/DirectionEngine.js";
import { computeNextMove } from "../src/screens/NextMoveEngine.js";
import { buildHomeView, directionOf, levelsOf, pctText } from "../src/screens/NextMoveHomeView.js";
import { makePayload, NOW } from "./direction-fixtures.mjs";

var OPEN = { now:NOW, lastUpdated:NOW-5000 };
var CLOSED = { session:"CLOSED", status:"DELAYED" };
function tfn(key, vars){
  var s = EN.strings[key];
  if(s==null || s=="") return "";
  return String(s).replace(/\{(\w+)\}/g, function(m, n){ return vars && vars[n]!=null ? String(vars[n]) : m; });
}
function nmOf(payload, opts){ return computeNextMove(computeDirection(payload, opts || OPEN)); }
var bullish = function(){ return nmOf(makePayload(Object.assign({ niftyKind:"rangeBreakUp", bnKind:"rangeBreakUp", niftyChg:0.6, bnChg:0.7 }, CLOSED))); };
var bearish = function(){ return nmOf(makePayload(Object.assign({ niftyKind:"rangeBreakDown", bnKind:"rangeBreakDown", niftyChg:-0.6, bnChg:-0.7 }, CLOSED))); };

function read(rel){ return fs.readFileSync(new URL("../src/" + rel, import.meta.url), "utf8"); }

test("direction words map from the engine assessment, wait is not SIDEWAYS", function(){
  assert.equal(directionOf({ state:"ok", assessment:"upside" }), "bull");
  assert.equal(directionOf({ state:"ok", assessment:"reversal_up" }), "bull");
  assert.equal(directionOf({ state:"ok", assessment:"downside" }), "bear");
  assert.equal(directionOf({ state:"ok", assessment:"reversal_dn" }), "bear");
  assert.equal(directionOf({ state:"ok", assessment:"range" }), "side");
  assert.equal(directionOf({ state:"ok", assessment:"wait" }), "none");
  assert.equal(directionOf({ state:"unavailable", assessment:"unavailable" }), "unavail");
  assert.equal(directionOf(null), "unavail");
  assert.equal(tfn("nmh.dir.none"), "NO CLEAR BIAS");
});

test("price, % change and levels are the engine values, not recalculated", function(){
  var m = bullish();
  var v = buildHomeView(m, tfn);
  assert.equal(m.state, "ok");
  assert.equal(v.dir, "bull");
  assert.equal(v.dirText, "BULLISH");
  assert.ok(v.price && v.price.ltp.length > 0);
  assert.equal(v.price.pct, pctText(m.price.chgPct));
  var trig = v.levels.filter(function(l){ return l.id=="trigger"; })[0];
  var inv = v.levels.filter(function(l){ return l.id=="invalid"; })[0];
  assert.equal(trig.raw, m.scenarios.bull.triggerLevel);
  assert.equal(inv.raw, m.scenarios.bull.invalidationLevel);
  assert.equal(v.levels.length, 2);
});

test("bearish uses the bear trigger and invalidation", function(){
  var m = bearish();
  var v = buildHomeView(m, tfn);
  assert.equal(v.dir, "bear");
  var trig = v.levels.filter(function(l){ return l.id=="trigger"; })[0];
  var inv = v.levels.filter(function(l){ return l.id=="invalid"; })[0];
  assert.equal(trig.raw, m.scenarios.bear.triggerLevel);
  assert.equal(inv.raw, m.scenarios.bear.invalidationLevel);
});

test("confirmed daily close and unconfirmed move are told apart, and intraday is never claimed", function(){
  var up = JSON.parse(JSON.stringify(bullish()));
  up.scenarios.bull.status = "confirmed";
  assert.equal(buildHomeView(up, tfn).setup.text, "Daily close confirmed");
  up.scenarios.bull.status = "triggered";
  assert.equal(buildHomeView(up, tfn).setup.text, "Triggered, daily close pending");
  up.scenarios.bull.status = "waiting";
  assert.equal(buildHomeView(up, tfn).setup.text, "Not triggered");
  var v = buildHomeView(up, tfn);
  assert.equal(v.conf, "Confidence not yet validated");
  assert.ok(/daily candles only/i.test(v.basis) && /no live intraday/i.test(v.basis));
  assert.ok(!/scalp|1.?5 ?min|live prediction/i.test(JSON.stringify([v.basis, v.disclaimer, v.headline])));
});

test("stale or behind data shows a caution line and keeps the status", function(){
  var m = JSON.parse(JSON.stringify(bullish()));
  m.freshness.behind = true;
  var v = buildHomeView(m, tfn);
  assert.ok(v.dataWarn.length > 0);
  var m2 = JSON.parse(JSON.stringify(bullish()));
  m2.freshness.behind = false; m2.freshness.quoteStatus = "STALE";
  assert.equal(buildHomeView(m2, tfn).quote.status, "STALE");
  assert.ok(buildHomeView(m2, tfn).dataWarn.length > 0);
});

test("the status chip says LIVE only when the engine price is live", function(){
  var m = JSON.parse(JSON.stringify(bullish()));
  m.price.kind = "last_confirmed"; m.freshness.quoteStatus = "LIVE";
  assert.equal(buildHomeView(m, tfn).quote.chip, "DELAYED");
  m.price.kind = "live";
  assert.equal(buildHomeView(m, tfn).quote.chip, "LIVE");
  m.price.kind = "last_confirmed"; m.freshness.quoteStatus = "STALE";
  assert.equal(buildHomeView(m, tfn).quote.chip, "STALE");
});

test("unavailable data: no price, no levels, names what is missing", function(){
  var m = nmOf(makePayload({ noNifty:true }));
  var v = buildHomeView(m, tfn);
  assert.equal(v.dir, "unavail");
  assert.equal(v.dirText, "UNAVAILABLE");
  assert.equal(v.price, null);
  assert.equal(v.levels.length, 0);
  assert.ok(v.missing.length > 0);
});

test("no card or level when the scenario has no finite level", function(){
  assert.deepEqual(levelsOf({ state:"ok", scenarios:{ bull:{ triggerLevel:null, invalidationLevel:null }, bear:{} } }, "bull", tfn), []);
});

test("Home layouts: no brain icon, no duplicate mood block, one card, Home only", function(){
  ["EquityHomeMobile", "EquityHomeTablet", "EquityHomeLaptop", "EquityHomeDesktop"].forEach(function(f){
    var src = read("screens/home/" + f + ".jsx");
    assert.ok(src.indexOf("129504") < 0, f + " still has the brain icon");
    assert.ok(src.indexOf("<NextMoveHomeCard") >= 0, f + " does not use the compact card");
    assert.ok(src.indexOf("mood.seg.") < 0, f + " still renders a mood segment");
    assert.ok(src.indexOf("home.ai_conf_score") < 0, f + " still renders the score badge");
  });
  // the icon is not removed elsewhere
  assert.ok(read("screens/MarketMood.jsx").length > 0);
});

test("the card reuses the shared hook, adds no request and no calculation", function(){
  var src = read("screens/NextMoveHomeCard.jsx") + read("screens/NextMoveHomeView.js");
  assert.ok(src.indexOf("useNextMove(") >= 0);
  assert.ok(src.indexOf("fetch(") < 0 && src.indexOf("computeDirection") < 0 && src.indexOf("computeNextMove") < 0);
  assert.ok(src.indexOf("129504") < 0 && src.indexOf("\\ud83e\\udde0") < 0);
});

test("Detailed Analysis is the only place for evidence, EMA, mood and timeline, and starts collapsed", function(){
  var card = read("screens/NextMoveHomeCard.jsx");
  assert.ok(card.indexOf("<DetailedAnalysis") >= 0);
  assert.equal((card.match(/<DetailedAnalysis/g) || []).length, 1);
  ["nm.ev.", "nm.da.", "stage.", "mood.", "ema9", "ema21", "nm.ind"].forEach(function(k){
    assert.ok(card.toLowerCase().indexOf(k) < 0, "card renders " + k + " outside Detailed Analysis");
  });
  var da = read("screens/DetailedAnalysis.jsx");
  assert.ok(/useState\(false\)/.test(da) && da.indexOf("aria-expanded") >= 0 && da.indexOf("aria-controls") >= 0);
});

test("no long paragraph at the top: short labels only", function(){
  var m = bullish();
  var v = buildHomeView(m, tfn);
  [v.dirText, v.headline, v.conf, v.basis, v.disclaimer].forEach(function(s){ assert.ok(s.length <= 60, "too long: " + s); });
});

test("new keys exist in all five languages with native script and no English-only values", function(){
  var langs = ["en", "te", "hi", "kn", "ta"];
  var packs = {};
  var keys = Object.keys(EN.strings).filter(function(k){ return k.indexOf("nmh.")==0; });
  assert.ok(keys.length >= 19);
  return Promise.all(langs.map(function(l){ return import("../src/i18n/lang/" + l + ".js").then(function(m){ packs[l] = m.default.strings; }); })).then(function(){
    keys.forEach(function(k){
      langs.forEach(function(l){
        var val = packs[l][k];
        assert.ok(val && String(val).trim().length > 0, l + " missing " + k);
        if(l!="en") assert.ok(/[^\x00-\x7f]/.test(val), l + " has no native script in " + k);
      });
    });
  });
});

test("every key used by the card exists in English", function(){
  var src = read("screens/NextMoveHomeView.js") + read("screens/NextMoveHomeCard.jsx");
  var used = {};
  (src.match(/"(nmh|nm|home)\.[a-z_.]+"/g) || []).forEach(function(k){ used[k.replace(/"/g, "")] = 1; });
  ["nmh.dir.bull","nmh.dir.bear","nmh.dir.side","nmh.dir.none","nmh.dir.unavail","nmh.sc.waiting","nmh.sc.triggered","nmh.sc.confirmed","nmh.sc.invalidated","nmh.sc.expired"].forEach(function(k){ used[k] = 1; });
  Object.keys(used).forEach(function(k){
    if(k=="nmh.dir." || k=="nmh.sc." || k=="nm.assess.") return;
    assert.ok(EN.strings[k], "missing English key " + k);
  });
});
