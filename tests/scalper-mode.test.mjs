import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  SCALP_SYMS,
  SCALP_TIMEFRAMES,
  RISK_PRESETS,
  calcCPR,
  calcConfluence,
  calcPositionSize,
  generateLiveScannerFeed
} from "../src/state/scalperModel.js";

function read(rel){
  return fs.readFileSync(new URL("../" + rel, import.meta.url), "utf8");
}

test("SCALP_SYMS defines liquid indices and high-beta stocks with lot sizes", function(){
  assert.ok(Array.isArray(SCALP_SYMS) && SCALP_SYMS.length >= 8);
  var nifty = SCALP_SYMS.find(function(s){ return s.sym == "NIFTY 50"; });
  assert.ok(nifty, "NIFTY 50 exists");
  assert.equal(nifty.type, "index");
  assert.equal(nifty.lot, 75);

  var bnf = SCALP_SYMS.find(function(s){ return s.sym == "BANK NIFTY"; });
  assert.ok(bnf, "BANK NIFTY exists");
  assert.equal(bnf.lot, 30);

  var rel = SCALP_SYMS.find(function(s){ return s.sym == "RELIANCE"; });
  assert.ok(rel, "RELIANCE exists");
  assert.equal(rel.type, "stock");
});

test("SCALP_TIMEFRAMES defines 1m, 3m, 5m scalping intervals", function(){
  assert.equal(SCALP_TIMEFRAMES.length, 3);
  var ids = SCALP_TIMEFRAMES.map(function(tf){ return tf.id; });
  assert.deepEqual(ids, ["1m", "3m", "5m"]);
});

test("calcCPR computes pivot, TC, BC, and classifies narrow/wide CPR", function(){
  var cpr = calcCPR(24200, 24000, 24100);
  assert.equal(cpr.pivot, 24100);
  assert.equal(cpr.bc, 24100);
  assert.equal(cpr.tc, 24100);
  assert.equal(cpr.widthType, "NARROW");

  var wideCpr = calcCPR(24400, 23800, 24300);
  assert.ok(wideCpr.tc >= wideCpr.bc);
  assert.ok(wideCpr.widthPct > 0);
});

test("calcConfluence correctly identifies STRONG_BUY when 4 pillars agree", function(){
  var cpr = calcCPR(24200, 24000, 24100);
  var conf = calcConfluence({
    price: 24220, // above TC
    vwap: 24150,  // price > vwap
    ema9: 24190,  // ema9 > ema21
    ema21: 24170,
    rsi: 62,      // rsi > 55
    cpr: cpr,
    volumeMult: 2.1
  });
  assert.equal(conf.signal, "STRONG_BUY");
  assert.equal(conf.confidence, 90);
  assert.ok(conf.target1 > conf.entry, "target1 above entry");
  assert.ok(conf.sl < conf.entry, "SL below entry");
  assert.ok(conf.rrRatio.indexOf("1 : ") >= 0);
});

test("calcConfluence correctly identifies STRONG_SELL when 4 pillars agree bearish", function(){
  var cpr = calcCPR(24200, 24000, 24100);
  var conf = calcConfluence({
    price: 24050, // below BC
    vwap: 24120,  // price < vwap
    ema9: 24080,  // ema9 < ema21
    ema21: 24110,
    rsi: 38,      // rsi < 45
    cpr: cpr,
    volumeMult: 1.8
  });
  assert.equal(conf.signal, "STRONG_SELL");
  assert.equal(conf.confidence, 90);
  assert.ok(conf.target1 < conf.entry, "target1 below entry");
  assert.ok(conf.sl > conf.entry, "SL above entry");
});

test("calcConfluence signals WAIT during chop/consolidation", function(){
  var cpr = calcCPR(24200, 24000, 24100);
  var conf = calcConfluence({
    price: 24105, // inside CPR
    vwap: 24110,  // below vwap
    ema9: 24115,  // above ema21
    ema21: 24100,
    rsi: 50,      // neutral rsi
    cpr: cpr,
    volumeMult: 0.9
  });
  assert.equal(conf.signal, "WAIT");
  assert.equal(conf.confidence, 40);
});

test("calcPositionSize strictly honors capital risk limit and lot size", function(){
  var pos = calcPositionSize(1000, 24180, 24150, 75); // 30 pt risk per unit, lot size 75
  assert.ok(pos.actualRisk <= 2500, "risk matches lot constraint");
  assert.ok(pos.qty >= 75);
  assert.ok(pos.lots >= 1);
  assert.ok(pos.targetReward >= pos.actualRisk * 1.4);
});

test("generateLiveScannerFeed returns active setups across symbols", function(){
  var feed = generateLiveScannerFeed();
  assert.ok(Array.isArray(feed) && feed.length >= 5);
  assert.ok(feed[0].sym && feed[0].signal && feed[0].setup);
});

test("all scalper.* translation keys exist in all five languages", function(){
  var langs = ["en", "te", "hi", "kn", "ta"];
  var packs = {};
  langs.forEach(function(l){
    var src = read("src/i18n/lang/" + l + ".js");
    var m = src.match(/var strings\s*=\s*(\{[\s\S]*?\n\};)/);
    assert.ok(m, "strings dictionary found in " + l);
    var fn = new Function("return " + m[1]);
    packs[l] = fn();
  });

  var requiredKeys = [
    "scalper.title",
    "scalper.sub",
    "scalper.timeframe",
    "scalper.signal",
    "scalper.entry",
    "scalper.target1",
    "scalper.target2",
    "scalper.stop_loss",
    "scalper.rr_ratio",
    "scalper.confluence",
    "scalper.pillars",
    "scalper.risk_sizer",
    "scalper.scanner_title",
    "scalper.disclaimer"
  ];

  requiredKeys.forEach(function(k){
    langs.forEach(function(l){
      assert.ok(packs[l][k] != null, "Language " + l + " missing key " + k);
      assert.ok(String(packs[l][k]).length > 0, "Language " + l + " empty key " + k);
    });
  });
});

test("Scalper Mode files adhere to repo conventions: ASCII only, no backticks, no triple-equals", function(){
  var files = [
    "src/state/scalperModel.js",
    "src/screens/ScalperMode.jsx"
  ];
  files.forEach(function(f){
    var src = read(f);
    assert.ok(src.indexOf("`") < 0, f + " must not contain backticks");
    assert.ok(!/===|!==/.test(src), f + " must not contain triple-equals");
    for(var i = 0; i < src.length; i++){
      var code = src.charCodeAt(i);
      assert.ok(code <= 127, f + " contains non-ASCII char at " + i + ": " + src[i]);
    }
  });
});
