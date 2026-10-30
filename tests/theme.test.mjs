// Theme foundation tests: palettes, contrast, persistence, legacy migration and
// the source rules that keep Home and Market Mood on theme tokens.
// Fixtures only. Run: node --test tests/theme.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import EN from "../src/i18n/lang/en.js";
import {
  THEMES, THEME_IDS, THEME_MODES, normalizeMode, loadThemeMode, saveThemeMode,
  resolveTheme, resolveThemeId, applyThemeToDocument
} from "../src/theme/tokens.js";

function read(rel){ return fs.readFileSync(new URL("../" + rel, import.meta.url), "utf8"); }
function lum(hex){
  var h = hex.replace("#", "");
  var v = [0, 2, 4].map(function(i){
    var c = parseInt(h.substr(i, 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
function ratio(a, b){
  var la = lum(a), lb = lum(b);
  if(la < lb){ var x = la; la = lb; lb = x; }
  return (la + 0.05) / (lb + 0.05);
}

// minimal localStorage / matchMedia stand-ins (the module guards every access)
function withStorage(initial, fn){
  var store = {};
  if(initial != null) store.bp_theme = initial;
  globalThis.localStorage = {
    getItem: function(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function(k, v){ store[k] = String(v); },
    removeItem: function(k){ delete store[k]; }
  };
  try{ return fn(store); } finally { delete globalThis.localStorage; }
}

// ---- Palettes -------------------------------------------------------------------
test("three themes exist with identical token keys (theme.c API preserved)", function(){
  assert.deepEqual(THEME_IDS, ["light", "dark", "amoled"]);
  assert.deepEqual(THEME_MODES, ["light", "dark", "amoled", "system"]);
  var base = Object.keys(THEMES.light).sort();
  THEME_IDS.forEach(function(id){
    assert.deepEqual(Object.keys(THEMES[id]).sort(), base, id + " keys differ");
    assert.equal(THEMES[id].id, id);
  });
  // the original token names still exist
  ["bg", "bgAlt", "card", "card2", "border", "border2", "text1", "text2", "text3", "up", "down", "blue", "blueSoft", "gold", "warn", "brand", "brandDark", "overlay"].forEach(function(k){
    assert.ok(base.indexOf(k) >= 0, "missing core token " + k);
  });
});

test("semantic, chart and accessibility tokens are present", function(){
  ["bull", "bear", "neutral", "warning", "info", "bullSoft", "bearSoft", "neutralSoft", "warningSoft", "infoSoft", "onAccent", "onBrand", "accent", "danger", "accent2", "accent2Soft",
   "chartGrid", "chartAxis", "chartLine", "chartArea", "chartUp", "chartDown"].forEach(function(k){
    THEME_IDS.forEach(function(id){ assert.ok(THEMES[id][k], id + " missing " + k); });
  });
});

test("AMOLED is genuinely black and the dark themes declare a dark scheme", function(){
  assert.equal(THEMES.amoled.bg, "#000000");
  assert.equal(THEMES.amoled.scheme, "dark");
  assert.equal(THEMES.dark.scheme, "dark");
  assert.equal(THEMES.light.scheme, "light");
  assert.ok(lum(THEMES.dark.bg) > 0 && lum(THEMES.dark.bg) < 0.02);
  assert.ok(lum(THEMES.light.bg) > 0.8);
});

test("signal and text colours that are used with an alpha suffix are 6-digit hex", function(){
  THEME_IDS.forEach(function(id){
    ["text1", "text2", "text3", "up", "down", "blue", "warn", "gold", "bull", "bear", "neutral", "warning", "info", "bg", "card", "card2", "border"].forEach(function(k){
      assert.match(THEMES[id][k], /^#[0-9A-Fa-f]{6}$/, id + "." + k);
    });
  });
});

// ---- Contrast (WCAG AA, 4.5:1) ---------------------------------------------------
THEME_IDS.forEach(function(id){
  var P = THEMES[id];
  ["bg", "card", "card2"].forEach(function(surface){
    ["text1", "text2", "text3", "up", "down", "bull", "bear", "neutral", "warning", "info", "warn", "blue"].forEach(function(k){
      test("contrast " + id + ": " + k + " on " + surface + " >= 4.5", function(){
        var r = ratio(P[k], P[surface]);
        assert.ok(r >= 4.5, id + " " + k + " on " + surface + " = " + r.toFixed(2));
      });
    });
  });
  test("contrast " + id + ": borders separate cards from the page and card text on accent is readable", function(){
    assert.ok(ratio(P.border, P.card) >= 1.15, "border vs card");
    assert.ok(ratio(P.onAccent, P.accent) >= 4.5, "onAccent on accent = " + ratio(P.onAccent, P.accent).toFixed(2));
    assert.ok(ratio(P.onAccent, P.danger) >= 4.5, "onAccent on danger = " + ratio(P.onAccent, P.danger).toFixed(2));
    assert.ok(ratio(P.onBrand, P.brand) >= 4.5, "onBrand on brand = " + ratio(P.onBrand, P.brand).toFixed(2));
    assert.ok(ratio(P.onAccent, P.blue) >= 3, "onAccent on blue (large/bold UI text) = " + ratio(P.onAccent, P.blue).toFixed(2));
  });
});

// Chips draw the signal colour as text on a 9% tint of itself (colour + "18").
function tint(fg, bg){
  var f = [0, 2, 4].map(function(i){ return parseInt(fg.substr(1 + i, 2), 16); });
  var b = [0, 2, 4].map(function(i){ return parseInt(bg.substr(1 + i, 2), 16); });
  var a = 24 / 255;
  return "#" + f.map(function(v, i){ var x = Math.round(v * a + b[i] * (1 - a)); return (x < 16 ? "0" : "") + x.toString(16); }).join("");
}
THEME_IDS.forEach(function(id){
  var P = THEMES[id];
  ["bg", "bgAlt", "card", "card2"].forEach(function(surface){
    ["text2", "text3", "up", "down", "bull", "bear", "neutral", "warning", "warn", "info", "blue"].forEach(function(k){
      test("tinted chip contrast " + id + ": " + k + " on its own tint over " + surface + " >= 4.5", function(){
        var r = ratio(P[k], tint(P[k], P[surface]));
        assert.ok(r >= 4.5, id + " " + k + " tint on " + surface + " = " + r.toFixed(2));
      });
    });
  });
});

// ---- Persistence + migration -----------------------------------------------------
test("normalizeMode maps legacy and unknown values; default is Light Pro", function(){
  assert.equal(normalizeMode(null), "light");
  assert.equal(normalizeMode(undefined), "light");
  assert.equal(normalizeMode(""), "light");
  assert.equal(normalizeMode("garbage"), "light");
  assert.equal(normalizeMode("light"), "light");
  assert.equal(normalizeMode("dark"), "dark");
  assert.equal(normalizeMode("amoled"), "amoled");
  assert.equal(normalizeMode("AMOLED"), "amoled");
  assert.equal(normalizeMode(" Amoled-Dark "), "amoled");
  assert.equal(normalizeMode("Dark Pro"), "dark");
  assert.equal(normalizeMode("light-pro"), "light");
  assert.equal(normalizeMode("system"), "system");
  assert.equal(normalizeMode("auto"), "system");
});

test("selection persists across a reload (save then load)", function(){
  withStorage(null, function(store){
    assert.equal(loadThemeMode(), "light");          // existing users: Light Pro
    ["dark", "amoled", "system", "light"].forEach(function(m){
      saveThemeMode(m);
      assert.equal(store.bp_theme, m);
      assert.equal(loadThemeMode(), m);              // a fresh load reads it back
    });
  });
});

test("a legacy saved value is migrated in place", function(){
  withStorage("AMOLED", function(store){
    assert.equal(loadThemeMode(), "amoled");
    assert.equal(store.bp_theme, "amoled");
  });
  withStorage("midnight", function(store){
    assert.equal(loadThemeMode(), "dark");
    assert.equal(store.bp_theme, "dark");
  });
  withStorage("something-old", function(store){
    assert.equal(loadThemeMode(), "light");
    assert.equal(store.bp_theme, "light");
  });
  withStorage("dark", function(store){ assert.equal(loadThemeMode(), "dark"); assert.equal(store.bp_theme, "dark"); });
});

test("storage failure falls back to Light Pro without throwing", function(){
  globalThis.localStorage = { getItem: function(){ throw new Error("blocked"); }, setItem: function(){ throw new Error("blocked"); } };
  try{
    assert.equal(loadThemeMode(), "light");
    saveThemeMode("dark");   // must not throw
  } finally { delete globalThis.localStorage; }
});

test("System mode resolves from the OS preference; fixed modes ignore it", function(){
  globalThis.window = { matchMedia: function(){ return { matches: true }; } };
  try{
    assert.equal(resolveThemeId("system"), "dark");
    assert.equal(resolveTheme("system").id, "dark");
    assert.equal(resolveThemeId("light"), "light");
    assert.equal(resolveThemeId("amoled"), "amoled");
  } finally { delete globalThis.window; }
  globalThis.window = { matchMedia: function(){ return { matches: false }; } };
  try{ assert.equal(resolveThemeId("system"), "light"); } finally { delete globalThis.window; }
});

test("applyThemeToDocument sets data-theme, color-scheme and the page background", function(){
  var attrs = {}, styleProps = {}, bodyProps = {}, metaContent = null;
  globalThis.document = {
    documentElement: { setAttribute: function(k, v){ attrs[k] = v; }, style: { setProperty: function(k, v){ styleProps[k] = v; } } },
    body: { style: { setProperty: function(k, v){ bodyProps[k] = v; } } },
    querySelector: function(){ return { setAttribute: function(k, v){ metaContent = v; } }; }
  };
  try{
    applyThemeToDocument(THEMES.amoled);
    assert.equal(attrs["data-theme"], "amoled");
    assert.equal(bodyProps.background, "#000000");
    assert.equal(metaContent, "#000000");
    assert.equal(styleProps["--bp-border"], THEMES.amoled.border);
    applyThemeToDocument(THEMES.light);
    assert.equal(attrs["data-theme"], "light");
  } finally { delete globalThis.document; }
});

// ---- Source rules (provider, settings, global CSS) -------------------------------
test("ThemeProvider applies and persists the theme and keeps the theme.c shape", function(){
  var src = read("src/theme/ThemeProvider.jsx");
  assert.ok(src.indexOf("applyThemeToDocument(palette)") >= 0);
  assert.ok(src.indexOf("saveThemeMode(n)") >= 0 && src.indexOf("normalizeMode") >= 0);
  assert.ok(src.indexOf("c:palette") >= 0);
});

test("Settings offers Light Pro, Dark Pro, AMOLED Dark and System as an accessible radio group", function(){
  var src = read("src/screens/Settings.jsx");
  ["light", "dark", "amoled", "system"].forEach(function(id){ assert.ok(src.indexOf('id:"' + id + '"') >= 0, id); });
  assert.ok(src.indexOf('role="radiogroup"') >= 0 && src.indexOf('role="radio"') >= 0 && src.indexOf("aria-checked") >= 0);
  assert.ok(src.indexOf('t("set.amoled")') >= 0 && src.indexOf('t("set.theme_aria")') >= 0);
});

test("the global stylesheet no longer forces a dark body or dark inputs", function(){
  var app = read("src/App.jsx");
  assert.ok(app.indexOf("07111F") < 0, "forced dark body background");
  assert.ok(app.indexOf("rgba(16,27,46,0.9)") < 0, "forced dark input background");
  assert.ok(app.indexOf("var(--bp-input-bg") >= 0 && app.indexOf("var(--bp-text") >= 0);
});

test("Market Mood and Detailed Analysis take their colours from the active theme", function(){
  var parts = read("src/screens/MarketMoodParts.jsx");
  assert.ok(parts.indexOf("theme.c.bull") >= 0 && parts.indexOf("theme.c.bear") >= 0 && parts.indexOf("theme.c.neutral") >= 0);
  assert.ok(parts.indexOf("#087443") < 0 && parts.indexOf("#EAB308") < 0);
  var data = read("src/screens/MarketMoodData.jsx");
  assert.ok(data.indexOf("function getFreshnessMeta(status, c)") >= 0 && data.indexOf("FRESHNESS_ROLE") >= 0);
  ["NextMoveCard", "NextMoveHomeCard", "MarketMoodParts", "EarlyDirectionPanel", "DetailedAnalysis"].forEach(function(f){
    var s = read("src/screens/" + f + ".jsx");
    assert.ok(/getFreshnessMeta\([^)]*(theme\.c|MT\.C)\)/.test(s), f + " does not pass the theme palette to getFreshnessMeta");
  });
  assert.ok(read("src/screens/MarketMood.jsx").indexOf("getSessionMeta(session, theme.c)") >= 0);
});

test("files in the Phase 1 scope contain no hardcoded hex colours (except documented SVG/range exceptions)", function(){
  var files = ["src/screens/NextMoveHomeCard.jsx", "src/screens/NextMoveCard.jsx", "src/screens/DetailedAnalysis.jsx", "src/screens/EarlyDirectionPanel.jsx",
    "src/screens/MarketMood.jsx", "src/screens/MarketMoodParts.jsx", "src/screens/home/EquityHomeMobile.jsx", "src/screens/home/EquityHomeTablet.jsx",
    "src/screens/home/EquityHomeLaptop.jsx", "src/screens/home/EquityHomeDesktop.jsx", "src/screens/home/MarketBadge.jsx", "src/components/TopBar.jsx"];
  files.forEach(function(f){
    var src = read(f).replace(/&#\d+;/g, "");
    var hits = (src.match(/#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b|rgba?\(/g) || []).filter(function(x){ return x != "#fff"; });
    // TopBar keeps its module-level fallback constants, which are shadowed inside the component
    if(f == "src/components/TopBar.jsx") hits = hits.filter(function(x){ return ["#050505", "#1B2330", "#FFFFFF", "#A0A7B4", "#5B6472"].indexOf(x) < 0; });
    assert.deepEqual(hits, [], f + " has hardcoded colours: " + hits.join(","));
  });
});

// ---- Home ------------------------------------------------------------------------
["EquityHomeMobile", "EquityHomeTablet", "EquityHomeLaptop", "EquityHomeDesktop"].forEach(function(f){
  test("Home layout " + f + ": no decorative emoji icons, no fake news or demo options, no duplicate Next Move", function(){
    var src = read("src/screens/home/" + f + ".jsx");
    assert.ok(!/icon="&#\d+;"/.test(src), "decorative icon prop remains");
    assert.ok(src.indexOf("JUSTIN") < 0, "fake JustIn news still used on Home");
    assert.ok(src.indexOf('t("home.market_news")') < 0, "Market News card remains");
    assert.ok(src.indexOf('t("home.options_title")') < 0 && src.indexOf("home.options_example") < 0, "options card remains");
    assert.equal((src.match(/<NextMoveHomeCard/g) || []).length, 0, "the big Next Move panel is no longer on Home");
    assert.ok(src.indexOf("129504") < 0, "brain icon");
  });
});

test("Home reaches Live Breakouts, Options Intelligence, Scanners, Research, Algo, News, Tools and Top Gainers & Losers through the eight-button quick grid", function(){
  var hub = read("src/screens/home/HomeHub.jsx");
  var dest = { "home.live_breakouts":"breakoutscan", "home.qa_options":"optionsintelpro", "home.qa_scanners":"chartscanner", "home.qa_research":"stockresearchpro", "home.qa_algo":"strategy", "home.qa_news":"news", "home.qa_tools":"tools", "home.qa_movers":"movers" };
  var app = read("src/App.jsx");
  Object.keys(dest).forEach(function(k){
    assert.ok(hub.indexOf('key:"' + k + '"') >= 0, "hub lost card " + k);
    assert.ok(hub.indexOf('tab:"' + dest[k] + '"') >= 0, "hub card " + k + " does not open " + dest[k]);
    assert.ok(app.indexOf('tab=="' + dest[k] + '"') >= 0, "App has no screen for " + dest[k]);
    assert.ok(app.indexOf('"' + dest[k] + '"') >= 0);
  });
  // every destination must be a known tab, or App renders the More screen on top of it
  var known = app.slice(app.indexOf("var KNOWN_TABS"), app.indexOf("];", app.indexOf("var KNOWN_TABS")));
  Object.keys(dest).forEach(function(k){ assert.ok(known.indexOf('"' + dest[k] + '"') >= 0, dest[k] + " missing from KNOWN_TABS"); });
  ["EquityHomeMobile", "EquityHomeTablet", "EquityHomeLaptop", "EquityHomeDesktop"].forEach(function(f){
    assert.ok(read("src/screens/home/" + f + ".jsx").indexOf("<HomeHub") >= 0, f + " does not render HomeHub");
  });
  // Market News and Options remain reachable from their own screens
  var app = read("src/App.jsx");
  assert.ok(app.indexOf("optionsintelpro") >= 0 && app.indexOf("news") >= 0);
});

// ---- Localization ------------------------------------------------------------------
test("theme labels exist in all five languages with native script", function(){
  var langs = ["te", "hi", "kn", "ta"];
  var keys = ["set.light", "set.dark", "set.amoled", "set.theme_aria", "set.theme_on", "set.theme_hint", "set.system", "set.appearance"];
  keys.forEach(function(k){ assert.ok(EN.strings[k], "en missing " + k); });
  assert.equal(EN.strings["set.light"], "Light Pro");
  assert.equal(EN.strings["set.dark"], "Dark Pro");
  assert.equal(EN.strings["set.amoled"], "AMOLED Dark");
  return Promise.all(langs.map(function(l){ return import("../src/i18n/lang/" + l + ".js").then(function(m){
    keys.forEach(function(k){
      var v = m.default.strings[k];
      assert.ok(v && /[^\x00-\x7f]/.test(v), l + " " + k);
    });
  }); }));
});

test("Settings and the alert widget use theme tokens instead of fixed dark-only colours", function(){
  var st = read("src/screens/Settings.jsx").split("\n").filter(function(l){ return l.indexOf("sw:[") < 0 && l.indexOf('background:"#F4F6FA"') < 0 && l.indexOf("var ") != 0 && l.indexOf("boxShadow") < 0; }).join("\n");
  assert.ok(!/rgba\(255,255,255/.test(st), "Settings has white-tint fills");
  var vw = read("src/screens/VoiceAlertWidget.jsx");
  assert.ok(!/rgba\(255,255,255/.test(vw) && !/rgba\(34,197,94/.test(vw), "VoiceAlertWidget has fixed tints");
  assert.ok(read("src/App.jsx").indexOf("Enable Alert Notifications") < 0, "Home notification banner was removed");
});

test("theme files follow the repository rules (no backtick, no triple-equals)", function(){
  ["src/theme/tokens.js", "src/theme/ThemeProvider.jsx"].forEach(function(f){
    var s = read(f);
    assert.ok(s.indexOf("`") < 0, f + " has a backtick");
    assert.ok(s.indexOf("===") < 0, f + " has ===");
    assert.ok(!/[^\x00-\x7f]/.test(s), f + " has non-ASCII");
  });
});
