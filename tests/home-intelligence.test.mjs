import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { pickSetups, MAX_SETUPS } from "../src/hooks/breakoutSetupsModel.js";
import { calcRisk, calcTarget, calcMessage } from "../src/screens/riskTargetMath.js";

// Intelligence-first Home. Mocked inputs only; no real API is called here.
function read(f){ return fs.readFileSync(f, "utf8"); }

test("pickSetups keeps only breakout / breakdown with a key level, sorted by volume, max 3", function(){
  var r = [
    { sym:"A", tags:["breakout"], priorHigh:100, priorLow:90, ltp:101, volRatio:1.2 },
    { sym:"B", tags:["volspike"], priorHigh:100, priorLow:90, ltp:95, volRatio:3 },
    { sym:"C", tags:["breakdown","volspike"], priorHigh:100, priorLow:90, ltp:89, volRatio:2.1 },
    { sym:"D", tags:["breakout"], priorHigh:50, priorLow:40, ltp:51, volRatio:null },
    { sym:"E", tags:["breakout"], priorHigh:null, priorLow:40, ltp:51, volRatio:5 },
    { sym:"F", tags:["breakout"], priorHigh:10, priorLow:5, ltp:11, volRatio:1.6 }
  ];
  var p = pickSetups(r);
  assert.equal(MAX_SETUPS, 3);
  assert.deepEqual(p.map(function(x){ return x.sym; }), ["C", "F", "A"]);
  assert.equal(p[0].type, "breakdown"); assert.equal(p[0].level, 90);
  assert.equal(pickSetups([]).length, 0); assert.equal(pickSetups(null).length, 0);
  assert.equal(pickSetups([{ sym:"D", tags:["breakout"], priorHigh:50, ltp:51 }])[0].volRatio, null);
});

test("Home hub: no calculator, no big index cards, four quick buttons in order, JUST IN label", function(){
  var hub = read("src/screens/home/HomeHub.jsx");
  assert.ok(hub.indexOf("Calculator") < 0 && hub.indexOf("RiskTargetCalc") < 0);
  var order = ["home.live_breakouts", "home.qa_oi", "home.qa_vwap", "home.qa_movers"].map(function(k){ return hub.indexOf('key:"' + k + '"'); });
  assert.ok(order.every(function(i){ return i > 0; }) && order.slice().sort(function(a, b){ return a - b; }).join() == order.join());
  assert.ok(hub.indexOf("Practice mode (simulated data)") >= 0);
  assert.ok(read("src/screens/home/HomeStrips.jsx").indexOf('"JUST IN"') >= 0);
  assert.ok(!fs.existsSync("src/screens/home/HomeMarketTiles.jsx") && !fs.existsSync("src/screens/home/HomeCalculator.jsx"));
});

test("setups never invent data and are never labelled live", function(){
  var s = read("src/screens/home/HomeSetups.jsx");
  assert.ok(s.indexOf("No confirmed setups right now.") >= 0 && s.indexOf("Breakout data unavailable") >= 0);
  assert.ok(s.indexOf("isClockOpen") >= 0 && s.indexOf("delayed, not live") >= 0);
  assert.ok(!/target|confidence|score/i.test(s.replace(/Today's/g, "")));
});

test("calculator lives in Tools with its calculations and validation intact", function(){
  var t = read("src/screens/InlineScreens.jsx");
  assert.ok(t.indexOf("<RiskTargetCalc") >= 0 && t.indexOf('["rt","Risk & Target"]') >= 0);
  var app = read("src/App.jsx");
  assert.ok(app.indexOf('tab=="tools"') >= 0 && app.indexOf('tab=="movers"') >= 0);
  assert.equal(calcRisk("100", "95", "10"), 50);
  assert.equal(calcTarget("100", "95", "long"), 110);
  assert.equal(calcTarget("100", "105", "short"), 90);
  assert.equal(calcTarget("100", "105", "long"), null);
  assert.equal(calcMessage("100", "105", "10", "long"), "For Long, SL must be below Entry");
  assert.equal(calcMessage("100", "100", "10", "long"), "Entry and SL must differ");
  assert.equal(calcMessage("", "95", "10", "long"), "");
});

test("new files are ASCII, no backtick, no triple-equals", function(){
  ["src/screens/home/HomeTicker.jsx", "src/screens/home/HomeSetups.jsx", "src/screens/home/HomeHub.jsx", "src/screens/home/HomeStrips.jsx", "src/screens/LargeCapMovers.jsx", "src/screens/RiskTargetCalc.jsx", "src/screens/riskTargetMath.js", "src/hooks/useBreakoutSetups.js", "src/hooks/breakoutSetupsModel.js"].forEach(function(f){
    var s = read(f);
    assert.ok(!/[^\x00-\x7F]/.test(s), f + " non-ascii"); assert.ok(s.indexOf("`") < 0, f); assert.ok(s.indexOf("===") < 0, f);
  });
});
