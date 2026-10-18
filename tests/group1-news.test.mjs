// Phase A1 / Group 1: honest news, no calls to missing endpoints.
// Fixtures only. No real provider is contacted and no key is read.
// Run: node --test tests/group1-news.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import handler from "../api/news.js";
import { normalizeNews, parseNewsTime } from "../api/providers/indianapi.js";
import { parseItems } from "../src/hooks/newsParse.js";
import { track, flush } from "../src/state/analyticsRegistry.js";
import EN from "../src/i18n/lang/en.js";
import TE from "../src/i18n/lang/te.js";
import HI from "../src/i18n/lang/hi.js";
import KN from "../src/i18n/lang/kn.js";
import TA from "../src/i18n/lang/ta.js";

function read(p){ return fs.readFileSync(new URL("../" + p, import.meta.url), "utf8"); }
function mockRes(){
  var r = { code:200, body:null, headers:{} };
  r.setHeader = function(k, v){ r.headers[k] = v; };
  r.status = function(c){ r.code = c; return r; };
  r.json = function(b){ r.body = b; return r; };
  return r;
}
async function call(method, env, fetchImpl){
  var saved = { f:globalThis.fetch, k:process.env.INDIANAPI_KEY };
  if(env.key == null) delete process.env.INDIANAPI_KEY; else process.env.INDIANAPI_KEY = env.key;
  var calls = 0;
  globalThis.fetch = function(){ calls++; return fetchImpl ? fetchImpl() : Promise.reject(new Error("no network in tests")); };
  var res = mockRes();
  try{ await handler({ method:method }, res); }
  finally{ globalThis.fetch = saved.f; if(saved.k == undefined) delete process.env.INDIANAPI_KEY; else process.env.INDIANAPI_KEY = saved.k; }
  return { res:res, calls:calls };
}
function jsonResp(obj){ return function(){ return Promise.resolve({ json: function(){ return Promise.resolve(obj); } }); }; }

// ---- normaliser ---------------------------------------------------------------
test("normalizeNews keeps only items that carry a title and invents nothing", function(){
  var out = normalizeNews([
    { title:"  RBI keeps repo rate unchanged ", url:"https://example.com/a", pub_date:"2026-10-16T09:30:00+05:30", source:"Wire A" },
    { headline:"Second headline" },
    { title:"" , url:"https://example.com/b" },
    { url:"https://example.com/c" },
    null, 5, "text"
  ]);
  assert.equal(out.length, 2);
  assert.equal(out[0].title, "RBI keeps repo rate unchanged");
  assert.equal(out[0].source, "Wire A");
  assert.equal(out[1].title, "Second headline");
  assert.equal(out[1].source, "");          // no publisher named -> none shown
  assert.equal(out[1].link, "");
  assert.equal(out[1].pubDate, "");         // no time -> none shown, never "now"
});

test("normalizeNews accepts the common list wrappers and rejects everything else", function(){
  var item = { title:"Headline" };
  ["items", "news", "data", "articles", "results", "stories"].forEach(function(k){
    var o = {}; o[k] = [item];
    assert.equal(normalizeNews(o).length, 1, k);
  });
  [null, undefined, 0, "x", {}, { detail:"Invalid API key" }, { items:"nope" }, { error:true }].forEach(function(v){
    assert.deepEqual(normalizeNews(v), []);
  });
});

test("links must be http(s); duplicates are removed; the list is capped", function(){
  var out = normalizeNews([
    { title:"A", url:"javascript:alert(1)" },
    { title:"B", url:"https://ok.example/x" },
    { title:"B", url:"https://ok.example/x" }
  ]);
  assert.equal(out.length, 2);
  assert.equal(out[0].link, "");
  assert.equal(out[1].link, "https://ok.example/x");
  var many = []; for(var i=0;i<100;i++) many.push({ title:"T" + i });
  assert.equal(normalizeNews(many, 30).length, 30);
});

test("times are kept only when unambiguous (timezone given or epoch)", function(){
  assert.equal(parseNewsTime("2026-10-16T04:00:00Z"), "2026-10-16T04:00:00.000Z");
  assert.equal(parseNewsTime("2026-10-16T09:30:00+05:30"), "2026-10-16T04:00:00.000Z");
  assert.equal(parseNewsTime(1792123200), new Date(1792123200 * 1000).toISOString());
  assert.equal(parseNewsTime("1792123200000"), new Date(1792123200000).toISOString());
  assert.equal(parseNewsTime("2026-10-16 09:30:00"), "");   // no timezone: not guessed
  assert.equal(parseNewsTime("yesterday"), "");
  assert.equal(parseNewsTime(null), "");
  assert.equal(parseNewsTime(undefined), "");
});

test("a publisher object with a name is accepted; an empty one is not", function(){
  assert.equal(normalizeNews([{ title:"A", source:{ name:"Desk" } }])[0].source, "Desk");
  assert.equal(normalizeNews([{ title:"A", source:{ name:" " } }])[0].source, "");
  assert.equal(normalizeNews([{ title:"A", source:42 }])[0].source, "");
});

// ---- /api/news handler -------------------------------------------------------------
test("no key configured: honest unavailable, and the provider is never called", async function(){
  var r = await call("GET", { key:null }, jsonResp({ items:[{ title:"must not appear" }] }));
  assert.equal(r.res.code, 200);
  assert.deepEqual(r.res.body, { ok:false, reason:"not_configured", items:[] });
  assert.equal(r.calls, 0);
  assert.equal(r.res.headers["Cache-Control"], "no-store");
});

test("provider unreachable or non-JSON: provider_error with no items", async function(){
  var a = await call("GET", { key:"test-key" }, function(){ return Promise.reject(new Error("down")); });
  assert.equal(a.res.body.ok, false); assert.equal(a.res.body.reason, "provider_error"); assert.deepEqual(a.res.body.items, []);
  var b = await call("GET", { key:"test-key" }, function(){ return Promise.resolve({ json: function(){ return Promise.reject(new Error("bad json")); } }); });
  assert.equal(b.res.body.reason, "provider_error");
});

test("provider error body or empty list: no_items, nothing invented", async function(){
  var a = await call("GET", { key:"test-key" }, jsonResp({ detail:"Invalid API key" }));
  assert.equal(a.res.body.reason, "no_items"); assert.deepEqual(a.res.body.items, []);
  var b = await call("GET", { key:"test-key" }, jsonResp({ items:[{ summary:"no title here" }] }));
  assert.equal(b.res.body.reason, "no_items");
});

test("provider headlines are returned as given, with provider named and no publisher invented", async function(){
  var r = await call("GET", { key:"test-key" }, jsonResp([
    { title:"Sensex ends higher", url:"https://example.com/s", pub_date:"2026-10-16T10:00:00Z" },
    { title:"Crude slips", source:"Desk X" }
  ]));
  var b = r.res.body;
  assert.equal(b.ok, true);
  assert.equal(b.provider, "IndianAPI");
  assert.equal(b.items.length, 2);
  assert.deepEqual(b.items[0], { title:"Sensex ends higher", link:"https://example.com/s", pubDate:"2026-10-16T10:00:00.000Z", source:"" });
  assert.equal(b.items[1].source, "Desk X");
  assert.ok(JSON.stringify(b).indexOf("ET Markets") < 0);
  assert.equal(r.calls, 1);
});

test("only GET is accepted", async function(){
  var r = await call("POST", { key:"test-key" }, jsonResp({ items:[{ title:"x" }] }));
  assert.equal(r.res.code, 405); assert.equal(r.calls, 0);
});

// ---- client parsing ---------------------------------------------------------------
test("parseItems: unavailable or malformed responses give no cards", function(){
  [null, {}, { ok:false, reason:"not_configured", items:[] }, { ok:true, items:"x" }, { ok:true, items:[{ title:"" }, {}] }].forEach(function(v){
    assert.deepEqual(parseItems(v), []);
  });
});

test("parseItems: no publisher means no source text, and no time means no age text", function(){
  var out = parseItems({ ok:true, items:[{ title:"Plain headline", link:"", pubDate:"", source:"" }] });
  assert.equal(out.length, 1);
  assert.equal(out[0].source, "");
  assert.equal(out[0].time, ""); assert.equal(out[0].pubDate, ""); assert.equal(out[0].pubDateRaw, null);
});

test("parseItems: a real time gives an age label; the source is the provider's own", function(){
  var iso = new Date(Date.now() - 3 * 3600000).toISOString();
  var out = parseItems({ ok:true, items:[{ title:"Nifty rallies strongly", link:"https://x.example", pubDate:iso, source:"Desk X" }] });
  assert.equal(out[0].time, "3h ago");
  assert.equal(out[0].source, "Desk X");
  assert.equal(out[0].sentiment, "good");
});

// ---- no stored headlines, no hardcoded publisher -------------------------------------
test("App no longer substitutes stored headlines, and no code names ET Markets as the source", function(){
  var app = read("src/App.jsx");
  assert.ok(app.indexOf("data/news") < 0, "static news import removed");
  assert.ok(/var LIVE_NEWS = liveNewsData\.news;/.test(app));
  ["src/App.jsx", "src/hooks/useLiveNews.jsx", "src/hooks/newsParse.js", "src/screens/News.jsx", "src/screens/NewsStudio.jsx", "api/news.js", "api/providers/indianapi.js"].forEach(function(f){
    assert.ok(read(f).indexOf("ET Markets") < 0, f);
  });
  [EN, TE, HI, KN, TA].forEach(function(p){
    ["more.news.s", "news.sub", "news.loading_sub"].forEach(function(k){ assert.ok(String(p.strings[k]).indexOf("ET Markets") < 0, k); });
  });
});

// ---- mood AI and analytics: no requests to missing routes -------------------------------
test("the mood hook sends no /api/market-mood-ai request while the route does not exist", function(){
  var src = read("src/hooks/useMarketMood.js");
  assert.ok(/var AI_ENDPOINT_AVAILABLE = false;/.test(src));
  var i = src.indexOf("function fetchAi(m, d){");
  var guard = src.indexOf("if(!AI_ENDPOINT_AVAILABLE) return;", i);
  var req = src.indexOf('fetch("/api/market-mood-ai"', i);
  assert.ok(i > 0 && guard > i && req > guard, "guard comes before the request");
  assert.ok(!fs.existsSync(new URL("../api/market-mood-ai.js", import.meta.url)), "no invented route");
});

test("analytics: no request, no buffering, no route invented", function(){
  var saved = globalThis.fetch, calls = 0;
  globalThis.fetch = function(){ calls++; return Promise.resolve({}); };
  try{
    for(var i = 0; i < 60; i++) track("app_open", { date:"2026-10-18" });
    flush();
  } finally { globalThis.fetch = saved; }
  assert.equal(calls, 0);
  assert.ok(!fs.existsSync(new URL("../api/analytics.js", import.meta.url)));
  assert.ok(/var ANALYTICS_SEND_ENABLED = false;/.test(read("src/state/analyticsRegistry.js")));
});

// ---- translations ------------------------------------------------------------------------------
var NEW_KEYS = ["news.unavail", "news.unavail_sub", "news.none_filter", "news.empty", "news.sub", "news.loading_sub", "more.news.s"];
var SCRIPT = { te:[0x0c00,0x0c7f], hi:[0x0900,0x097f], kn:[0x0c80,0x0cff], ta:[0x0b80,0x0bff] };
test("every new or changed news string exists in all five languages in the right script", function(){
  var packs = { te:TE, hi:HI, kn:KN, ta:TA };
  NEW_KEYS.forEach(function(k){
    assert.ok(EN.strings[k] && EN.strings[k].trim(), "en " + k);
    Object.keys(packs).forEach(function(l){
      var v = packs[l].strings[k];
      assert.ok(v && v.trim(), l + " missing " + k);
      assert.notEqual(v, EN.strings[k], l + " is untranslated: " + k);
      var r = SCRIPT[l], has = false;
      for(var i = 0; i < v.length; i++){ var c = v.charCodeAt(i); if(c >= r[0] && c <= r[1]) has = true; }
      assert.ok(has, l + " has no native script in " + k);
    });
  });
});

test("News screen shows a status-specific empty state and never an empty pill or blank line", function(){
  var s = read("src/screens/News.jsx");
  assert.ok(s.indexOf('t("news.unavail")') > 0 && s.indexOf('t("news.unavail_sub")') > 0 && s.indexOf('t("news.none_filter")') > 0);
  assert.ok(s.indexOf("{n.source?<span") > 0, "source pill only when a publisher is named");
  assert.ok(/\(n\.source \? "Source: "/.test(s), "share text omits an empty source line");
});
