// Verifies every Next Move Intelligence string exists in all five language packs
// (existing i18n system) with matching placeholders. Fixture only.
// Run: node --test tests/next-move-i18n.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import EN from "../src/i18n/lang/en.js";
import TE from "../src/i18n/lang/te.js";
import HI from "../src/i18n/lang/hi.js";
import KN from "../src/i18n/lang/kn.js";
import TA from "../src/i18n/lang/ta.js";

var PACKS = { te:TE.strings, hi:HI.strings, kn:KN.strings, ta:TA.strings };
var SCRIPT = { te:[0x0c00,0x0c7f], hi:[0x0900,0x097f], kn:[0x0c80,0x0cff], ta:[0x0b80,0x0bff] };
function ph(s){ return (String(s).match(/\{\w+\}/g) || []).sort().join(","); }

function allKeys(){
  var src = fs.readFileSync(new URL("../src/screens/NextMoveEngine.js", import.meta.url), "utf8")
          + fs.readFileSync(new URL("../src/screens/NextMoveCard.jsx", import.meta.url), "utf8")
          + fs.readFileSync(new URL("../src/screens/MarketMood.jsx", import.meta.url), "utf8")
          + fs.readFileSync(new URL("../src/screens/MarketMoodParts.jsx", import.meta.url), "utf8")
          + fs.readFileSync(new URL("../src/screens/NextMoveHome.jsx", import.meta.url), "utf8")
          + fs.readFileSync(new URL("../src/screens/NextMoveView.js", import.meta.url), "utf8")
          + fs.readFileSync(new URL("../src/screens/NextMoveDetailView.js", import.meta.url), "utf8")
          + fs.readFileSync(new URL("../src/screens/DetailedAnalysis.jsx", import.meta.url), "utf8");
  var keys = {};
  (src.match(/"nm\.[A-Za-z0-9_.]+"/g) || []).forEach(function(l){ var k = l.slice(1, -1); if(k.charAt(k.length-1)!="." ) keys[k] = 1; });
  ["upside","downside","range","reversal_up","reversal_dn","wait","unavailable"].forEach(function(a){ keys["nm.assess." + a] = 1; keys["nm.why." + a] = keys["nm.why." + a] || 0; });
  ["waiting","triggered","confirmed","invalidated","expired"].forEach(function(s){ keys["nm.st." + s] = 1; });
  ["OPEN","PRE_OPEN","POST_CLOSE","CLOSED","WEEKEND"].forEach(function(s){ keys["nm.sess." + s] = 1; });
  ["intraday","volume","options","news","breadth"].forEach(function(u){ keys["nm.unv." + u] = 1; });
  ["ok","behind","stale","na"].forEach(function(u){ keys["nm.trend." + u] = 1; });
  ["home.changed_q","home.drivers_q","home.ai_score","home.ai_conf_score"].forEach(function(k){ keys[k] = 1; });
  // Detailed Analysis keys built at run time (prefix + id): every English nm.da.* key is required.
  Object.keys(EN.strings).forEach(function(k){ if(k.indexOf("nm.da.")==0) keys[k] = 1; });
  Object.keys(keys).forEach(function(k){ if(keys[k]===0) delete keys[k]; });
  return Object.keys(keys);
}

test("every nm.* key used by the engine, card and page exists in English", function(){
  var keys = allKeys();
  assert.ok(keys.length > 40);
  keys.forEach(function(k){ assert.ok(EN.strings[k] != undefined, "missing English key " + k); });
});

test("every nm.* key is translated in Telugu, Hindi, Kannada and Tamil with matching placeholders and script", function(){
  allKeys().forEach(function(k){
    Object.keys(PACKS).forEach(function(l){
      var v = PACKS[l][k];
      assert.ok(v != undefined && v != "", l + " missing " + k);
      assert.equal(ph(v), ph(EN.strings[k]), l + " placeholder mismatch " + k);
      var r = SCRIPT[l], has = false;
      for(var i=0;i<v.length;i++){ var c = v.charCodeAt(i); if(c>=r[0] && c<=r[1]) has = true; }
      assert.ok(has, l + " has no native script in " + k);
    });
  });
});

test("the renamed feature title is Next Move Intelligence in every language", function(){
  assert.equal(EN.strings["home.mood_title"], "Next Move Intelligence");
  assert.equal(EN.strings["nm.title"], "Next Move Intelligence");
  Object.keys(PACKS).forEach(function(l){ assert.notEqual(PACKS[l]["home.mood_title"], undefined, l); assert.ok(PACKS[l]["home.mood_title"].indexOf("AI") < 0, l); });
});
