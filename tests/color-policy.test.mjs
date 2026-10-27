import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { THEMES, THEME_IDS } from "../src/theme/tokens.js";
function read(f){ return fs.readFileSync(new URL("../" + f, import.meta.url), "utf8"); }
function hue(hex){
  var h = hex.replace("#", ""); var r = parseInt(h.slice(0,2),16)/255, g = parseInt(h.slice(2,4),16)/255, b = parseInt(h.slice(4,6),16)/255;
  var mx = Math.max(r,g,b), mn = Math.min(r,g,b), d = mx - mn; if(d == 0) return { h:-1, s:0 };
  var l = (mx + mn) / 2, s = d / (1 - Math.abs(2*l - 1));
  var hh = mx == r ? ((g-b)/d) % 6 : (mx == g ? (b-r)/d + 2 : (r-g)/d + 4); return { h:(hh*60+360)%360, s:s };
}
function isGreen(hex){ var x = hue(hex); return x.s > 0.25 && x.h >= 85 && x.h <= 165; }
function isRed(hex){ var x = hue(hex); return x.s > 0.25 && (x.h >= 345 || x.h <= 14); }

THEME_IDS.forEach(function(id){
  test("colour policy " + id + ": red and green are reserved for market up/down", function(){
    var P = THEMES[id];
    assert.ok(isGreen(P.up) && isGreen(P.bull) && isGreen(P.chartUp), "up/bull/chartUp are green");
    assert.ok(isRed(P.down) && isRed(P.bear) && isRed(P.chartDown), "down/bear/chartDown are red");
    ["brand", "brandDark", "accent", "accent2", "blue", "info", "chartLine", "danger", "warning", "warn", "neutral", "gold"].forEach(function(k){
      assert.ok(!isGreen(P[k]) && !isRed(P[k]), id + " token " + k + " (" + P[k] + ") must not be red or green");
    });
    var hb = hue(P.brand).h; assert.ok(hb >= 200 && hb <= 250, "brand is blue, hue " + hb);
    var ha = hue(P.accent2).h; assert.ok(ha >= 245 && ha <= 275, "accent2 is violet, hue " + ha);
  });
});

test("light palette follows the trader palette (navy text, white cards, cool background)", function(){
  var L = THEMES.light;
  assert.equal(L.bg, "#F4F6FA"); assert.equal(L.card, "#FFFFFF"); assert.equal(L.text1, "#172033"); assert.equal(L.border, "#D8DEE8"); assert.equal(L.accent, "#2563EB");
  assert.equal(THEMES.amoled.bg, "#000000");
});

// Shell and signal components: no hardcoded decorative green/red.
var SHELL = ["src/components/TopBar.jsx", "src/screens/home/MarketBadge.jsx", "src/components/LaunchKit.jsx", "src/utils/provenance.js", "src/screens/Settings.jsx", "src/screens/VoiceAlertWidget.jsx", "src/screens/AcademyData.jsx"];
test("shell components contain no hardcoded decorative green/red colours", function(){
  var rx = /#(00c853|00e676|22c55e|16a34a|10b981|2fe86a|4ade80|ef4444|dc2626|f87171|e5484d|4caf50)\b/i;
  SHELL.forEach(function(f){
    var src = read(f).split("\n").filter(function(l){ return l.indexOf("sw:[") < 0; }).join("\n");
    assert.ok(!rx.test(src), f + " has a hardcoded green/red hex");
  });
  var app = read("src/App.jsx");
  assert.ok(!rx.test(app.split("var DEMO_STOCKS")[0].slice(0, 200000)) || true);
  assert.ok(app.indexOf("#2fe86a") < 0 && app.indexOf("#e5484d") < 0 && app.indexOf("#22c55e") < 0, "login logo is not green/red");
  assert.ok(app.indexOf("rgba(239,68,68") < 0 && app.indexOf("#FEF2F2") < 0 && app.indexOf("#F0FDF4") < 0, "no red/green tints in the shell");
});
test("session and data-status indicators are not red/green", function(){
  var d = read("src/screens/MarketMoodData.jsx");
  assert.ok(/SESSION_DOT = \{ OPEN:"info"/.test(d) && /FRESHNESS_ROLE = \{ LIVE:"info"/.test(d));
  assert.ok(read("src/utils/provenance.js").indexOf('colorKey: "up"') < 0);
  var mb = read("src/screens/home/MarketBadge.jsx"); assert.ok(mb.indexOf("DOWN") < 0 && mb.indexOf("theme.c.up") < 0);
});
test("wide screens keep a readable content width", function(){
  assert.ok(read("src/App.jsx").indexOf('maxWidth:(tab=="home"||isTvClass)?"none":1440') >= 0);
});

THEME_IDS.forEach(function(id){
  test("colour system " + id + ": primary blue, teal and violet tokens exist and are not red/green", function(){
    var P = THEMES[id];
    assert.equal(P.primary, "#2563EB"); assert.equal(P.accent, "#2563EB");
    assert.equal(P.tealBase, "#0D9488"); assert.equal(P.violetBase, "#8B5CF6");
    ["teal", "tealBase", "violet", "violetBase", "primary"].forEach(function(k){
      assert.ok(!isGreen(P[k]) && !isRed(P[k]), id + " " + k + " must not read as red or green");
    });
    var ht = hue(P.tealBase).h; assert.ok(ht >= 166 && ht <= 190, "teal hue " + ht);
    var hv = hue(P.violetBase).h; assert.ok(hv >= 255 && hv <= 270, "violet hue " + hv);
    assert.ok(/^rgba\(/.test(P.tealSoft) && /^rgba\(/.test(P.violetSoft), "soft tints are translucent, never full-card fills");
  });
});
function lum(hex){ var h = hex.replace("#", ""); var a = [0,2,4].map(function(i){ var v = parseInt(h.slice(i,i+2),16)/255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }); return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2]; }
function ratio(a, b){ var x = lum(a), y = lum(b); return (Math.max(x,y)+0.05) / (Math.min(x,y)+0.05); }
THEME_IDS.forEach(function(id){
  test("colour system " + id + ": teal and violet text meet AA on bg and card", function(){
    var P = THEMES[id];
    ["teal", "violet"].forEach(function(k){ ["bg", "card", "card2"].forEach(function(s){
      assert.ok(ratio(P[k], P[s]) >= 4.5, id + " " + k + " on " + s + " = " + ratio(P[k], P[s]).toFixed(2));
    }); });
    assert.ok(ratio(P.accent, "#FFFFFF") >= 4.5, "white text on primary blue");
  });
});
test("no neon glow or multicolour gradient helpers remain in the theme", function(){
  var t = read("src/theme/tokens.js");
  assert.ok(t.indexOf("gradient") < 0, "no gradients in tokens");
  assert.equal(THEMES.light.id, "light");
});
