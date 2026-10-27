// Smart Alerts browser-side tests: languages (five packs), message builder, view helpers, voice
// language/fallback logic, service worker behaviour (executed in a sandbox with a fake `self`),
// deep-link parsing, and source checks that the demo generators are gone from production paths.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { ALERT_LANGS, ALERT_PACKS, alertText, normLang, hasAlertKey } from "../src/alerts/alertLang.js";
import { buildMessage, symbolLabel, freshLabel } from "../src/alerts/alertMessage.js";
import { FILTERS, filterRules, filterHistory, ruleDirection, eventDirection, statusKey, statusChipKey, formSymbols, ageLabel, groupOfEvent } from "../src/alerts/alertView.js";
import { parseOpenUrl, setOpenIntent, takeOpenIntent } from "../src/alerts/openIntent.js";
import { keyToBytes } from "../src/alerts/pushClient.js";
import { pickVoice, speechCodeFor, LANGS as VOICE_LANGS } from "../src/screens/VoiceData.js";

function read(p){ return fs.readFileSync(new URL("../" + p, import.meta.url), "utf8"); }
function ph(s){ return (String(s).match(/\{\w+\}/g) || []).sort().join(","); }
var SCRIPT = { te:[0x0c00,0x0c7f], hi:[0x0900,0x097f], kn:[0x0c80,0x0cff], ta:[0x0b80,0x0bff] };
function hasScript(s, l){ for(var i = 0; i < s.length; i++){ var c = s.charCodeAt(i); if(c >= SCRIPT[l][0] && c <= SCRIPT[l][1]) return true; } return false; }

test("five languages: English, Telugu, Hindi, Kannada, Tamil, with identical key sets", function(){
  assert.deepEqual(ALERT_LANGS, ["en", "te", "hi", "kn", "ta"]);
  var base = Object.keys(ALERT_PACKS.en).sort();
  assert.ok(base.length > 150);
  ALERT_LANGS.forEach(function(l){ assert.deepEqual(Object.keys(ALERT_PACKS[l]).sort(), base, l); });
});

test("every alert string has the same placeholders in every language and is really translated", function(){
  var untranslatedOk = /^(sa\.f\.|pat\.|dir\.)/;
  Object.keys(ALERT_PACKS.en).forEach(function(k){
    var p = ph(ALERT_PACKS.en[k]);
    ["te", "hi", "kn", "ta"].forEach(function(l){
      var v = ALERT_PACKS[l][k];
      assert.equal(typeof v, "string"); assert.ok(v.length > 0, l + " " + k);
      assert.equal(ph(v), p, l + " " + k);
      var letters = ALERT_PACKS.en[k].replace(/\{\w+\}/g, "").replace(/[^A-Za-z]/g, "");
      if(!untranslatedOk.test(k) && letters.length > 0) assert.ok(hasScript(v, l), l + " " + k + " has no native script: " + v);
    });
  });
});

test("every key the code asks for exists (static scan of the alert screen, hook, voice and message builder)", function(){
  var src = ["src/screens/SmartAlertsPro.jsx", "src/alerts/useSmartAlertsPro.js", "src/screens/VoiceAlertWidget.jsx", "src/alerts/alertView.js", "src/alerts/alertMessage.js", "src/hooks/useVoiceAlerts.js", "src/screens/VoiceData.js"].map(read).join("\n");
  var found = {};
  (src.match(/"(sa|ev|rs|fr|vo|push|basis|dir|pat)\.[A-Za-z0-9_.]+"/g) || []).forEach(function(q){ var k = q.slice(1, -1); if(k.charAt(k.length - 1) != ".") found[k] = 1; });
  assert.ok(Object.keys(found).length > 40);
  Object.keys(found).forEach(function(k){ ALERT_LANGS.forEach(function(l){ assert.ok(hasAlertKey(l, k), l + " missing " + k); }); });
  // dynamically built keys
  var dyn = [];
  ["price_above","price_below","pct_up","pct_down","breakout","breakdown","candle","volume_spike","price_up_volume","price_down_volume"].forEach(function(e){ dyn.push("ev." + e, "vo." + e); });
  ["price_above","price_below","pct_up","pct_down","breakout","breakdown","candle","volume_spike","price_up_volume","price_down_volume"].forEach(function(e){ dyn.push("sa.type." + e); });
  ["5m","15m","1H","1D"].forEach(function(e){ dyn.push("sa.tf." + e); });
  ["waiting","triggered","cooldown","stale","market_closed","unavailable","disabled","pending"].forEach(function(e){ dyn.push("sa.status." + e); });
  ["OPEN","PRE_OPEN","POST_CLOSE","CLOSED","WEEKEND","HOLIDAY"].forEach(function(e){ dyn.push("sa.sess." + e); });
  ["HOLIDAY","WEEKEND","CLOSED","PRE_OPEN","POST_CLOSE","already_beyond","beyond_wait_rearm","already_fired_today","intrabar_only","wick_only","volume_unavailable","insufficient_baseline","insufficient_history","no_data","provider_error","rate_limited","timeout","quote_stale","bars_stale","no_prev_close","no_quote","symbol_not_in_watchlist"].forEach(function(e){ if(e != "symbol_not_in_watchlist") dyn.push("sa.why." + e); });
  ["s","m","h","d"].forEach(function(e){ dyn.push("sa.age." + e); });
  ["invalid_symbol","symbol_not_in_watchlist","invalid_type","invalid_value","invalid_pct","invalid_mult","invalid_move","invalid_timeframe","no_pattern","invalid_pattern","limit","server"].forEach(function(e){ dyn.push("sa.err." + e); });
  dyn.forEach(function(k){ ALERT_LANGS.forEach(function(l){ assert.ok(hasAlertKey(l, k), l + " missing " + k); }); });
});

test("the app's single translation module merges the alert packs (one selector, one t())", function(){
  var tr = read("src/i18n/translations.jsx");
  assert.match(tr, /import \{ ALERT_PACKS \} from "\.\.\/alerts\/alertLang"/);
  assert.match(tr, /PACKS\[ks\[i\]\]\[k\] = src\[k\]/);
  ["en", "te", "hi", "kn", "ta"].forEach(function(l){ assert.match(tr, new RegExp('code:"' + l + '"')); });
});

test("language selection: unknown codes fall back to English; missing key never returns the raw key", function(){
  assert.equal(normLang("te"), "te"); assert.equal(normLang("fr"), "en"); assert.equal(normLang(undefined), "en"); assert.equal(normLang("EN"), "en");
  assert.equal(alertText("zz", "ev.price_above", { sym:"TCS", level:"1" }), "TCS crossed above 1");
  assert.equal(alertText("te", "no.such.key", null, "fallback {a}"), "fallback {a}");
  assert.equal(alertText("te", "no.such.key"), "");
  assert.notEqual(alertText("te", "ev.price_above", { sym:"TCS", level:"1" }), alertText("en", "ev.price_above", { sym:"TCS", level:"1" }));
});

var EV = { event:"breakout", symbol:"BANKNIFTY", price:51234.5, timeframe:"15m", eventTime:Date.UTC(2026, 9, 13, 5, 30), direction:"up", basis:"completed_candle",
  freshness:{ state:"delayed", lagMin:6, source:"yahoo" }, reason:{ level:51200, close:51234.5 } };

test("messages: symbol, event, verified price, timeframe, event time, freshness and reason are all present, in every language", function(){
  ALERT_LANGS.forEach(function(l){
    var m = buildMessage(EV, l);
    assert.ok(m.title.indexOf("BANK NIFTY") >= 0, l + " title keeps the market term in English: " + m.title);
    assert.ok(m.title.indexOf("15m") >= 0 && m.title.indexOf("51200.00") >= 0);
    assert.ok(m.body.indexOf("51234.50") >= 0 && m.body.indexOf("15m") >= 0 && m.body.indexOf("IST") >= 0, l + " " + m.body);
    assert.ok(m.reason.length > 10 && m.fresh.length > 0 && m.voice.length > 0 && m.directionLabel.length > 0);
    if(l != "en"){ assert.ok(hasScript(m.title, l), l); assert.ok(hasScript(m.reason, l), l); assert.ok(hasScript(m.fresh, l), l); }
  });
});

test("messages for every event type build without leftover placeholders", function(){
  var cases = [
    { event:"price_above", reason:{ level:101, between:false } }, { event:"price_below", reason:{ level:99, between:true, seen:98.5 } },
    { event:"pct_up", reason:{ pct:1.6, threshold:1.5, prevClose:100 } }, { event:"pct_down", reason:{ pct:-1.7, threshold:1.5, prevClose:100 } },
    { event:"breakout", reason:{ level:100, close:101 } }, { event:"breakdown", reason:{ level:100, close:99 } },
    { event:"candle", reason:{ pattern:"bullish_engulfing" } },
    { event:"volume_spike", reason:{ ratio:3.4, volume:34000, baseline:10000, sessions:5 } },
    { event:"price_up_volume", reason:{ ratio:3, volume:30000, baseline:10000, sessions:5, movePct:0.8 } },
    { event:"price_down_volume", reason:{ ratio:3, volume:30000, baseline:10000, sessions:5, movePct:-0.8 } }
  ];
  cases.forEach(function(cs){
    ALERT_LANGS.forEach(function(l){
      var ev = Object.assign({ symbol:"TCS", price:100.25, timeframe:"5m", eventTime:Date.UTC(2026, 9, 13, 5, 30), direction:"up", freshness:{ state:"live" } }, cs);
      var m = buildMessage(ev, l);
      [m.title, m.reason, m.body, m.voice].forEach(function(s){ assert.equal(/\{\w+\}/.test(s), false, l + " " + cs.event + " " + s); assert.ok(s.length > 3); });
    });
  });
  assert.equal(symbolLabel("BANKNIFTY"), "BANK NIFTY"); assert.equal(symbolLabel("NIFTY"), "NIFTY");
  assert.equal(freshLabel("en", { state:"live" }), "Live"); assert.match(freshLabel("en", { state:"delayed", lagMin:9 }), /9/); assert.equal(freshLabel("en", { state:"stale" }), "Stale");
});

test("view helpers: filters, direction, status text keys all resolve", function(){
  assert.deepEqual(FILTERS, ["all", "candle", "action", "volume", "level"]);
  var rules = [{ type:"price_above" }, { type:"breakout" }, { type:"candle" }, { type:"volume_spike" }, { type:"pct_up" }];
  assert.equal(filterRules(rules, "level").length, 1); assert.equal(filterRules(rules, "action").length, 2);
  assert.equal(filterRules(rules, "candle").length, 1); assert.equal(filterRules(rules, "volume").length, 1); assert.equal(filterRules(rules, "all").length, 5);
  var hist = [{ event:"candle" }, { event:"price_below" }, { event:"price_up_volume" }];
  assert.equal(filterHistory(hist, "candle").length, 1); assert.equal(filterHistory(hist, "volume").length, 1); assert.equal(groupOfEvent({ event:"candle" }), "candle");
  assert.equal(ruleDirection({ type:"price_above" }), "up"); assert.equal(ruleDirection({ type:"breakdown" }), "down"); assert.equal(ruleDirection({ type:"candle" }), "neutral");
  assert.equal(eventDirection({ direction:"down" }), "down"); assert.equal(eventDirection({ direction:"any" }), "neutral"); assert.equal(eventDirection(null), "neutral");
  var states = [null, { status:"waiting" }, { status:"waiting", reason:"already_beyond" }, { status:"stale", reason:"quote_stale" }, { status:"stale", reason:"bars_stale" }, { status:"unavailable", reason:"rate_limited" },
    { status:"unavailable" }, { status:"market_closed", reason:"HOLIDAY" }, { status:"market_closed" }, { status:"disabled" }, { status:"triggered" }, { status:"cooldown" }, { status:"error", reason:"invalid_type" }, { status:"waiting", reason:"intrabar_only" }];
  states.forEach(function(s){
    ALERT_LANGS.forEach(function(l){ assert.ok(hasAlertKey(l, statusChipKey(s)), JSON.stringify(s)); });
    if(!(s && s.status == "error")) ALERT_LANGS.forEach(function(l){ assert.ok(hasAlertKey(l, statusKey(s)), JSON.stringify(s) + " " + statusKey(s)); });
  });
  assert.deepEqual(formSymbols(["TCS"], { NIFTY:true, BANKNIFTY:false }), ["TCS", "NIFTY"]);
  assert.deepEqual(formSymbols(["TCS", "NIFTY"], { NIFTY:true }), ["TCS", "NIFTY"]);
  assert.deepEqual(ageLabel(100000, 100000 - 30000), { unit:"s", n:30 }); assert.equal(ageLabel(1e7, 1e7 - 3600000 * 5).unit, "h"); assert.equal(ageLabel(1, "x").unit, "none");
});

test("voice: language list matches the app's five languages; voice choice and graceful fallback", function(){
  var tr = read("src/i18n/translations.jsx");
  var appCodes = (tr.match(/\{code:"([a-z]{2})"/g) || []).map(function(x){ return x.slice(7, 9); });
  assert.deepEqual(VOICE_LANGS.map(function(l){ return l.id; }), appCodes);
  assert.deepEqual(VOICE_LANGS.map(function(l){ return l.code; }), ["en-IN", "te-IN", "hi-IN", "kn-IN", "ta-IN"]);
  assert.equal(speechCodeFor("kn"), "kn-IN"); assert.equal(speechCodeFor("zz"), "en-IN");
  var voices = [{ lang:"en-US", name:"a" }, { lang:"hi_IN", name:"b" }, { lang:"te-IN", name:"c" }];
  assert.equal(pickVoice(voices, "te-IN").name, "c");
  assert.equal(pickVoice(voices, "hi-IN").name, "b", "underscore locale variant still matches");
  assert.equal(pickVoice(voices, "en-IN").name, "a", "same base language");
  assert.equal(pickVoice(voices, "ta-IN"), null, "no Tamil voice installed -> null (text alert still shown)");
  assert.equal(pickVoice([], "en-IN"), null); assert.equal(pickVoice(null, "en-IN"), null);
  var h = read("src/hooks/useVoiceAlerts.js");
  assert.match(h, /if\(!v\) return false;\s+\/\/ graceful/);
});

test("deep link parsing accepts only the alerts tab and a 12-hex id", function(){
  assert.deepEqual(parseOpenUrl("/?tab=alerts&open=0123456789ab"), { tab:"alerts", id:"0123456789ab" });
  assert.deepEqual(parseOpenUrl("?tab=alerts"), { tab:"alerts", id:null });
  assert.equal(parseOpenUrl("/?tab=settings&open=0123456789ab"), null);
  assert.equal(parseOpenUrl("/?tab=alerts&open=../../x").id, null);
  assert.equal(parseOpenUrl(""), null); assert.equal(parseOpenUrl(null), null);
  setOpenIntent({ id:"0123456789ab", symbol:"TCS" });
  assert.deepEqual(takeOpenIntent(), { id:"0123456789ab", symbol:"TCS" }); assert.equal(takeOpenIntent(), null);
});

test("push key decoding matches Node's base64url", function(){
  var raw = Buffer.from(Array.from({ length:65 }, function(_, i){ return i * 3 % 256; }));
  var out = keyToBytes(raw.toString("base64url"));
  assert.equal(Buffer.compare(Buffer.from(out), raw), 0);
});

// ---- service worker, executed with a fake `self` ----
function loadSw(){
  var handlers = {}, shown = [], opened = [], subs = [];
  var clientsList = [];
  var self = {
    location:{ origin:"https://breakoutpro.in" },
    addEventListener:function(n, fn){ handlers[n] = fn; },
    skipWaiting:function(){},
    registration:{ showNotification:function(title, opts){ shown.push({ title:title, opts:opts }); return Promise.resolve(); }, pushManager:{ subscribe:function(o){ subs.push(o); return Promise.resolve({}); } } },
    clients:{ matchAll:function(){ return Promise.resolve(clientsList); }, openWindow:function(u){ opened.push(u); return Promise.resolve({}); }, claim:function(){ return Promise.resolve(); } }
  };
  var ctx = vm.createContext({ self:self, caches:{ open:function(){ return Promise.resolve({ addAll:function(){ return Promise.resolve(); }, put:function(){} }); }, keys:function(){ return Promise.resolve([]); }, match:function(){ return Promise.resolve(null); } }, fetch:function(){ return Promise.resolve({}); }, Response:function(){}, URL:URL, JSON:JSON, Promise:Promise, String:String, Array:Array });
  vm.runInContext(read("public/sw.js"), ctx);
  return { handlers:handlers, shown:shown, opened:opened, subs:subs, clients:clientsList, self:self };
}
function pushEvent(obj, raw){
  var waited = [];
  return { data: obj === undefined ? null : { json:function(){ if(raw) throw new Error("bad"); return obj; } }, waitUntil:function(p){ waited.push(p); }, waited:waited };
}

test("service worker: shows the server's own text; empty or corrupt pushes show nothing", async function(){
  var sw = loadSw();
  var e = pushEvent({ title:"RELIANCE crossed above 2900.00", body:"b", tag:"bp-abc", lang:"hi", data:{ url:"/?tab=alerts&open=0123456789ab", symbol:"RELIANCE", id:"0123456789ab" } });
  sw.handlers.push(e); await Promise.all(e.waited);
  assert.equal(sw.shown.length, 1);
  assert.equal(sw.shown[0].title, "RELIANCE crossed above 2900.00"); assert.equal(sw.shown[0].opts.tag, "bp-abc"); assert.equal(sw.shown[0].opts.lang, "hi");
  assert.equal(sw.shown[0].opts.data.url, "/?tab=alerts&open=0123456789ab");
  var e2 = pushEvent(undefined); sw.handlers.push(e2); await Promise.all(e2.waited);
  var e3 = pushEvent({}, true); sw.handlers.push(e3); await Promise.all(e3.waited);
  var e4 = pushEvent({ body:"no title" }); sw.handlers.push(e4); await Promise.all(e4.waited);
  assert.equal(sw.shown.length, 1, "no fabricated generic notification");
});

test("service worker: notification click focuses an open window and asks it to open the alert, else opens a new one; hostile urls are neutralised", async function(){
  var sw = loadSw();
  var sent = [], focused = 0;
  var win = { url:"https://breakoutpro.in/", focus:function(){ focused++; return Promise.resolve(); }, postMessage:function(m){ sent.push(m); } };
  sw.clients.push(win);
  var closed = 0;
  var ev = { notification:{ close:function(){ closed++; }, data:{ url:"/?tab=alerts&open=0123456789ab", id:"0123456789ab", symbol:"TCS" } }, waitUntil:function(p){ ev.p = p; } };
  sw.handlers.notificationclick(ev); await ev.p;
  assert.equal(closed, 1); assert.equal(focused, 1); assert.equal(sent[0].type, "bp-open"); assert.equal(sent[0].url, "/?tab=alerts&open=0123456789ab"); assert.equal(sw.opened.length, 0);
  sw.clients.length = 0;
  var ev2 = { notification:{ close:function(){}, data:{ url:"/?tab=alerts&open=0123456789ab" } }, waitUntil:function(p){ ev2.p = p; } };
  sw.handlers.notificationclick(ev2); await ev2.p;
  assert.equal(JSON.stringify(sw.opened), JSON.stringify(["/?tab=alerts&open=0123456789ab"]));
  ["//evil.example/x", "https://evil.example/", "javascript:alert(1)", "", null, 42].forEach(async function(bad){
    var ev3 = { notification:{ close:function(){}, data:{ url:bad } }, waitUntil:function(p){ ev3.p = p; } };
    sw.handlers.notificationclick(ev3); await ev3.p;
  });
  await new Promise(function(r){ setTimeout(r, 20); });
  sw.opened.slice(1).forEach(function(u){ assert.equal(u, "/?tab=alerts"); });
  assert.equal(sw.opened.length, 7);
});

test("service worker: a rotated subscription is renewed and open windows are told to re-register it", async function(){
  var sw = loadSw();
  var msgs = [];
  sw.clients.push({ url:"https://breakoutpro.in/", postMessage:function(m){ msgs.push(m); } });
  var ev = { oldSubscription:{ options:{ userVisibleOnly:true, applicationServerKey:new Uint8Array(3) } }, newSubscription:null, waitUntil:function(p){ ev.p = p; } };
  sw.handlers.pushsubscriptionchange(ev); await ev.p;
  assert.equal(sw.subs.length, 1); assert.equal(sw.subs[0].userVisibleOnly, true);
  assert.equal(JSON.stringify(msgs), JSON.stringify([{ type:"bp-resubscribe" }]));
});

test("service worker keeps API traffic uncached and never serves fabricated data", function(){
  var s = read("public/sw.js");
  assert.match(s, /indexOf\("\/api\/"\) >= 0/); assert.match(s, /reason:"offline"/);
});

// ---- demo removal / security source checks ----
test("demo generators are gone from the production alert paths", function(){
  ["src/hooks/useWatchlistAlerts.jsx", "src/screens/Alerts.jsx", "src/screens/AlertsData.jsx"].forEach(function(f){ assert.equal(fs.existsSync(new URL("../" + f, import.meta.url)), false, f + " should be deleted"); });
  var files = ["src/screens/SmartAlertsPro.jsx", "src/screens/VoiceAlertWidget.jsx", "src/screens/VoiceData.js", "src/hooks/useVoiceAlerts.js", "src/alerts/useSmartAlertsPro.js", "src/alerts/alertsClient.js", "src/alerts/pushClient.js",
    "src/alerts/alertEngine.js", "src/alerts/alertCandles.js", "src/alerts/alertRules.js", "src/alerts/alertMessage.js", "src/alerts/alertView.js", "api/alerts.js", "api/_lib/alertData.js", "api/_lib/alertRunner.js", "api/_lib/alertStore.js", "api/_lib/alertAuth.js", "api/_lib/webpush.js"];
  files.forEach(function(f){
    var s = read(f).replace(/\/\/[^\n]*/g, "");
    assert.equal(/Math\.random/.test(s), false, f + " uses Math.random");
    assert.equal(/SIGNAL_FEED|BASE_PRICES|simulateAlert/.test(s), false, f + " references a demo feed");
  });
  var w = read("src/screens/VoiceAlertWidget.jsx"); assert.equal(/setInterval|setTimeout/.test(w), false, "no timer-driven fake alerts");
  var v = read("src/hooks/useVoiceAlerts.js"); assert.equal(/setInterval/.test(v), false);
  var app = read("src/App.jsx"); assert.match(app, /import\("\.\/screens\/SmartAlertsPro"\)/); assert.equal(/screens\/Alerts"/.test(app), false);
});

test("secrets never reach the browser bundle: server env names appear only under api/ and docs", function(){
  var secretNames = /VAPID_PRIVATE_KEY|CRON_SECRET|UPSTASH_REDIS_REST_TOKEN|KV_REST_API_TOKEN|SESSION_SECRET|BETA_CODES/;
  function walk(dir, out){ fs.readdirSync(dir, { withFileTypes:true }).forEach(function(d){ var p = dir + "/" + d.name; if(d.isDirectory()) walk(p, out); else if(/\.(js|jsx|html)$/.test(d.name)) out.push(p); }); return out; }
  var root = new URL("../", import.meta.url).pathname;
  walk(root + "src", []).concat(walk(root + "public", [])).forEach(function(f){ assert.equal(secretNames.test(fs.readFileSync(f, "utf8")), false, f); });
  assert.equal(/VITE_[A-Z_]*(VAPID|CRON|UPSTASH|SECRET)/.test(read("api/alerts.js") + read("api/_lib/webpush.js") + read("api/_lib/alertStore.js")), false);
  // the only VAPID value sent to the browser is the public key
  assert.match(read("api/alerts.js"), /vapidPublicKey: vapid\.ok \? vapid\.publicKey : null/);
});

test("new files follow the repo style: no backtick, no triple-equals, ASCII only", function(){
  var files = ["src/alerts/alertLang.js", "src/alerts/alertMessage.js", "src/alerts/alertView.js", "src/alerts/alertRules.js", "src/alerts/alertEngine.js", "src/alerts/alertCandles.js", "src/alerts/alertsClient.js", "src/alerts/pushClient.js", "src/alerts/openIntent.js",
    "src/alerts/useSmartAlertsPro.js", "src/screens/SmartAlertsPro.jsx", "src/screens/VoiceAlertWidget.jsx", "src/screens/VoiceData.js", "src/hooks/useVoiceAlerts.js", "public/sw.js",
    "api/alerts.js", "api/_lib/alertData.js", "api/_lib/alertRunner.js", "api/_lib/alertStore.js", "api/_lib/alertAuth.js", "api/_lib/webpush.js"];
  files.forEach(function(f){
    var s = read(f);
    assert.equal(s.indexOf("`"), -1, f + " has a backtick");
    assert.equal(s.indexOf("==="), -1, f + " has triple-equals");
    for(var i = 0; i < s.length; i++){ if(s.charCodeAt(i) > 127){ assert.fail(f + " has non-ASCII at " + i); } }
  });
});

test("red/green are used only for UP/DOWN direction on the alerts screen", function(){
  var s = read("src/screens/SmartAlertsPro.jsx");
  var uses = s.match(/c\.(up|down)\b/g) || [];
  assert.ok(uses.length >= 2);
  var lines = s.split("\n").filter(function(l){ return /c\.(up|down)\b/.test(l); });
  lines.forEach(function(l){ assert.ok(/dir ==|col =|var col|dirChip/.test(l), "direction-only color use: " + l.trim()); });
  assert.equal(/#(22C55E|EF4444|1B5E20)/i.test(s), false);
});
