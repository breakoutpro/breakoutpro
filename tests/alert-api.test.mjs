// Smart Alerts server tests: enrollment, per-device isolation, rule validation, subscription
// lifecycle, scheduled run (cron) with a MOCK market feed and MOCK push service, dedupe,
// sender failures, market closure and language selection.
// Everything external is injected (store, fetch, provider). Nothing here talks to a real
// provider, Upstash or push service, so it proves the server logic, not live delivery.
import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { handleAlerts, subValid } from "../api/alerts.js";
import { memoryAdapter, upstashAdapter, upstashConfig, openStore, KEYS } from "../api/_lib/alertStore.js";
import { cronAuthorized, ownerIdFromSecret, secretWellFormed, verifySession } from "../api/_lib/alertAuth.js";
import { makeFrame, tradingDays, T0, istMs } from "./alert-helpers.mjs";
import { alertText } from "../src/alerts/alertLang.js";

var NOW = istMs(2026, 10, 13, 11, 0) + 5000;
var PREV = tradingDays(T0 - 1, 5);
var ENV_BASE = { SESSION_SECRET: "s".repeat(32), BETA_CODES: "CODE-ONE, CODE-TWO", CRON_SECRET: "c".repeat(24) };

function vapidEnv(){
  var kp = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  var j = kp.privateKey.export({ format: "jwk" });
  var pub = Buffer.concat([Buffer.from([4]), Buffer.from(j.x, "base64url"), Buffer.from(j.y, "base64url")]);
  return Object.assign({}, ENV_BASE, { VAPID_PUBLIC_KEY: pub.toString("base64url"), VAPID_PRIVATE_KEY: j.d, VAPID_SUBJECT: "mailto:ops@example.com" });
}
function subKeys(host){
  var e = crypto.createECDH("prime256v1"); e.generateKeys();
  return { endpoint: "https://" + (host || "fcm.googleapis.com") + "/fcm/send/" + crypto.randomBytes(8).toString("hex"),
    keys: { p256dh: e.getPublicKey().toString("base64url"), auth: crypto.randomBytes(16).toString("base64url") } };
}
function signToken(payload, secret){
  var b = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return b + "." + crypto.createHmac("sha256", secret).update(b).digest("base64url");
}
// snapshot: previous sessions flat at 100; today at `price`
function snap(price, now){
  var fn = function(di, k, isToday){ return isToday ? { o:price, h:price + 0.4, l:price - 0.4, c:price, v:1000 } : { o:100, h:100.5, l:99.5, c:100, v:1000 + (k % 3) * 10 }; };
  var candles = makeFrame(PREV, 5, fn, T0, now);
  return { ok:true, quote:{ price:price, asOf:now - 20000 }, frames:{ "5m":{ ok:true, candles:candles } } };
}
function feed(prices, counter){
  return function(req, o){
    if(counter) counter.n++;
    var out = {};
    Object.keys(req).forEach(function(sym){ out[sym] = prices[sym] == null ? { ok:false, code:"no_data", quote:null, frames:{} } : (prices[sym].ok === false ? prices[sym] : snap(prices[sym], o.now)); });
    return Promise.resolve(out);
  };
}
function mk(env){
  var store = memoryAdapter();
  var deps = { store:store, env:env || ENV_BASE, now:NOW };
  async function call(action, body, secret, extra){
    var d = Object.assign({}, deps, extra || {});
    return handleAlerts({ method:"POST", query:{ action:action }, body:body || {}, headers: secret ? { "x-bp-device": secret } : {} }, d);
  }
  async function enroll(code){ var r = await call("enroll", { code: code || "CODE-ONE" }); assert.equal(r.status, 200); return r.json.secret; }
  return { store:store, deps:deps, call:call, enroll:enroll };
}
function capturePush(plan){
  var calls = [];
  var fn = function(url, init){
    calls.push({ url:url, init:init });
    var s = plan ? plan(calls.length, url) : 201;
    return Promise.resolve({ status:s, ok:s >= 200 && s < 300, headers:{ get:function(){ return "0"; } } });
  };
  fn.calls = calls; return fn;
}

test("status is public and reports what is missing; nothing else works without storage", async function(){
  var r = await handleAlerts({ method:"GET", query:{ action:"status" }, body:{}, headers:{} }, { store:null, env:{}, now:NOW });
  assert.equal(r.json.storage, false); assert.equal(r.json.push, false); assert.equal(r.json.cron, false); assert.equal(r.json.vapidPublicKey, null);
  var e = await handleAlerts({ method:"POST", query:{ action:"enroll" }, body:{ code:"x" }, headers:{} }, { store:null, env:ENV_BASE, now:NOW });
  assert.equal(e.status, 503); assert.equal(e.json.reason, "storage_not_configured");
  var c = await handleAlerts({ method:"POST", query:{ action:"cron" }, body:{}, headers:{ authorization:"Bearer " + ENV_BASE.CRON_SECRET } }, { store:null, env:ENV_BASE, now:NOW });
  assert.equal(c.status, 503);
  var v = await handleAlerts({ method:"GET", query:{ action:"status" }, body:{}, headers:{} }, { store:memoryAdapter(), env:vapidEnv(), now:NOW });
  assert.equal(v.json.storage, true); assert.equal(v.json.push, true); assert.equal(typeof v.json.vapidPublicKey, "string");
  assert.equal(JSON.stringify(v.json).indexOf("VAPID_PRIVATE"), -1);
});

test("openStore fails closed without env and picks Upstash REST with env (server-only names)", function(){
  assert.equal(openStore({}), null);
  assert.equal(openStore({ UPSTASH_REDIS_REST_URL:"http://insecure", UPSTASH_REDIS_REST_TOKEN:"t" }), null);
  assert.equal(openStore({ KV_REST_API_URL:"https://x.upstash.io", KV_REST_API_TOKEN:"t" }).kind, "upstash");
  assert.deepEqual(upstashConfig({ UPSTASH_REDIS_REST_URL:"https://a.upstash.io/", UPSTASH_REDIS_REST_TOKEN:"t" }), { url:"https://a.upstash.io", token:"t" });
});

test("Upstash adapter contract: command arrays, bearer auth, error mapping", async function(){
  var seen = [];
  var f = function(url, init){
    seen.push({ url:url, init:init, body:JSON.parse(init.body) });
    var cmd = JSON.parse(init.body)[0];
    if(seen.length == 5) return Promise.resolve({ ok:false, status:500, json:function(){ return {}; } });
    return Promise.resolve({ ok:true, status:200, json:function(){ return { result: cmd == "GET" ? "v1" : (cmd == "SMEMBERS" ? ["a", "b"] : 1) }; } });
  };
  var a = upstashAdapter({ url:"https://x.upstash.io", token:"TOK" }, f);
  assert.equal(await a.get("k"), "v1"); await a.set("k", { toString:function(){ return "z"; } }); await a.del("k");
  assert.deepEqual(await a.smembers("s"), ["a", "b"]);
  assert.deepEqual(seen[0].body, ["GET", "k"]); assert.deepEqual(seen[1].body, ["SET", "k", "z"]);
  assert.equal(seen[0].init.headers.Authorization, "Bearer TOK"); assert.equal(seen[0].url, "https://x.upstash.io");
  await assert.rejects(function(){ return a.sadd("s", "m"); }, /store_http_500/);
});

test("enrollment needs a valid session token or invite code; secrets are server-made and never reusable by guess", async function(){
  var m = mk();
  assert.equal((await m.call("enroll", {})).status, 401);
  assert.equal((await m.call("enroll", { code:"WRONG" })).status, 401);
  assert.equal((await m.call("enroll", { token:"garbage" })).status, 401);
  assert.equal((await m.call("enroll", { token: signToken({ role:"beta", exp:NOW + 1000 }, "wrong-secret-wrong-secret-wrong-xx") })).status, 401);
  assert.equal((await m.call("enroll", { token: signToken({ role:"beta", exp:NOW - 1 }, ENV_BASE.SESSION_SECRET) })).status, 401);
  var ok = await m.call("enroll", { token: signToken({ role:"beta", exp:NOW + 60000 }, ENV_BASE.SESSION_SECRET) });
  assert.equal(ok.status, 200); assert.ok(secretWellFormed(ok.json.secret));
  var ok2 = await m.call("enroll", { code:"CODE-TWO" });
  assert.notEqual(ok2.json.secret, ok.json.secret);
  assert.equal(verifySession("a.b", ENV_BASE.SESSION_SECRET, NOW), null);
  // a made-up but well-formed secret is not enrolled
  var fake = crypto.randomBytes(32).toString("base64url");
  assert.equal((await m.call("get", {}, fake)).status, 401);
  assert.equal((await m.call("get", {}, "short")).status, 401);
  assert.equal((await m.call("get", {})).status, 401);
});

test("USER ISOLATION: another device cannot read, change or delete my rules; client-sent ids are ignored", async function(){
  var m = mk();
  var A = await m.enroll("CODE-ONE"), B = await m.enroll("CODE-TWO");
  await m.call("saveSettings", { watchlist:["RELIANCE", "TCS"] }, A);
  var r = await m.call("saveRule", { rule:{ symbol:"RELIANCE", type:"price_above", params:{ value:105 } } }, A);
  assert.equal(r.status, 200); var id = r.json.rule.id;
  var gb = await m.call("get", {}, B);
  assert.deepEqual(gb.json.doc.rules, []); assert.deepEqual(gb.json.doc.watchlist, []);
  assert.equal((await m.call("deleteRule", { id:id }, B)).status, 404);
  assert.equal((await m.call("toggleRule", { id:id, enabled:false }, B)).status, 404);
  assert.equal((await m.call("saveRule", { rule:{ id:id, symbol:"RELIANCE", type:"price_above", params:{ value:1 } } }, B)).status, 404);
  // spoof attempts: owner / userId in body and query are never used
  var sp = await m.call("get", { userId:ownerIdFromSecret(A), owner:ownerIdFromSecret(A), ownerId:ownerIdFromSecret(A) }, B);
  assert.deepEqual(sp.json.doc.rules, []);
  var ga = await m.call("get", {}, A);
  assert.equal(ga.json.doc.rules.length, 1); assert.equal(ga.json.doc.rules[0].params.value, 105);
  // B subscribing does not give A a subscription
  await m.call("subscribe", { subscription:subKeys() }, B);
  assert.equal((await m.call("get", {}, A)).json.subscriptions, 0);
  assert.equal((await m.call("get", {}, B)).json.subscriptions, 1);
  // the storage owner id is derived from the secret, never stored as the secret itself
  var dump = JSON.stringify(m.store._dump());
  assert.equal(dump.indexOf(A), -1); assert.equal(dump.indexOf(B), -1);
});

test("rules: validated on the server; watchlist-only; indices only when enabled; thresholds; limit; edit/toggle/delete", async function(){
  var m = mk(); var A = await m.enroll();
  var bad = async function(rule, code){ var r = await m.call("saveRule", { rule:rule }, A); assert.equal(r.status, 400, JSON.stringify(rule)); assert.ok(r.json.errors.indexOf(code) >= 0, code + " in " + JSON.stringify(r.json.errors)); };
  await bad({ symbol:"RELIANCE", type:"price_above", params:{ value:100 } }, "symbol_not_in_watchlist");
  await m.call("saveSettings", { watchlist:["RELIANCE", "bad symbol!", "TCS"], indices:{ NIFTY:true } }, A);
  var g = await m.call("get", {}, A);
  assert.deepEqual(g.json.doc.watchlist, ["RELIANCE", "TCS"]); assert.deepEqual(g.json.doc.indices, { NIFTY:true, BANKNIFTY:false });
  await bad({ symbol:"BANKNIFTY", type:"price_above", params:{ value:100 } }, "symbol_not_in_watchlist");
  assert.equal((await m.call("saveRule", { rule:{ symbol:"NIFTY", type:"price_above", params:{ value:25000 } } }, A)).status, 200);
  await bad({ symbol:"TCS", type:"price_above", params:{ value:-5 } }, "invalid_value");
  await bad({ symbol:"TCS", type:"price_above", params:{ value:"abc" } }, "invalid_value");
  await bad({ symbol:"TCS", type:"pct_up", params:{ pct:90 } }, "invalid_pct");
  await bad({ symbol:"TCS", type:"volume_spike", timeframe:"5m", params:{ mult:0.5 } }, "invalid_mult");
  await bad({ symbol:"TCS", type:"candle", timeframe:"15m", params:{ patterns:[] } }, "no_pattern");
  await bad({ symbol:"TCS", type:"candle", timeframe:"15m", params:{ patterns:["rainbow"] } }, "invalid_pattern");
  await bad({ symbol:"TCS", type:"breakout", timeframe:"2m", params:{} }, "invalid_timeframe");
  await bad({ symbol:"TCS", type:"nope", params:{} }, "invalid_type");
  var ok = await m.call("saveRule", { rule:{ symbol:"TCS", type:"breakout", timeframe:"15m", params:{} } }, A);
  assert.equal(ok.status, 200); var id = ok.json.rule.id; assert.equal(ok.json.rule.rev, 1);
  var ed = await m.call("saveRule", { rule:{ id:id, symbol:"TCS", type:"breakdown", timeframe:"1H", params:{} } }, A);
  assert.equal(ed.json.rule.rev, 2); assert.equal(ed.json.rule.type, "breakdown"); assert.equal(ed.json.rule.createdAt, ok.json.rule.createdAt);
  var tg = await m.call("toggleRule", { id:id, enabled:false }, A);
  assert.equal(tg.json.doc.rules.filter(function(r){ return r.id == id; })[0].enabled, false);
  assert.equal((await m.call("deleteRule", { id:id }, A)).status, 200);
  assert.equal((await m.call("deleteRule", { id:id }, A)).status, 404);
  // limit
  for(var i = 0; i < 40; i++){ var rr = await m.call("saveRule", { rule:{ symbol:"TCS", type:"price_above", params:{ value:100 + i } } }, A); if(rr.status != 200){ assert.equal(rr.json.errors[0], "limit"); break; } }
  assert.ok((await m.call("get", {}, A)).json.doc.rules.length <= 30);
});

test("watchlist removal stops monitoring: a rule whose symbol left the watchlist is not evaluated", async function(){
  var m = mk(vapidEnv()); var A = await m.enroll();
  await m.call("saveSettings", { watchlist:["RELIANCE"] }, A);
  await m.call("saveRule", { rule:{ symbol:"RELIANCE", type:"price_above", params:{ value:101 } } }, A);
  await m.call("saveSettings", { watchlist:["TCS"] }, A);
  var counter = { n:0 };
  var f = function(req, o){ counter.n++; return Promise.resolve({}); };
  var env = vapidEnv(); m.deps.env = env;
  var r2 = await handleAlerts({ method:"POST", query:{ action:"cron" }, body:{}, headers:{ authorization:"Bearer " + env.CRON_SECRET } }, Object.assign({}, m.deps, { fetchSnapshots:f }));
  assert.equal(r2.status, 200); assert.equal(r2.json.summary.evaluated, 0);
  assert.equal(counter.n, 0, "no provider call when nothing is monitorable");
  var st = (await m.call("get", {}, A)).json.status;
  var rid = (await m.call("get", {}, A)).json.doc.rules[0].id;
  assert.equal(st[rid].status, "unavailable"); assert.equal(st[rid].reason, "symbol_not_in_watchlist");
});

test("cron endpoint: bearer secret only, timing-safe, fails closed on missing or short secret", async function(){
  assert.equal(cronAuthorized({ headers:{ authorization:"Bearer " + ENV_BASE.CRON_SECRET } }, ENV_BASE), true);
  assert.equal(cronAuthorized({ headers:{ authorization:"Bearer nope" } }, ENV_BASE), false);
  assert.equal(cronAuthorized({ headers:{} }, ENV_BASE), false);
  assert.equal(cronAuthorized({ headers:{ authorization:"Bearer abc" } }, { CRON_SECRET:"abc" }), false);
  assert.equal(cronAuthorized({ headers:{ authorization:"Bearer " } }, {}), false);
  var m = mk();
  var r = await m.call("cron", {}, null);
  assert.equal(r.status, 401);
  var q = await handleAlerts({ method:"POST", query:{ action:"cron", secret:ENV_BASE.CRON_SECRET }, body:{ secret:ENV_BASE.CRON_SECRET }, headers:{} }, m.deps);
  assert.equal(q.status, 401, "a secret in the URL or body is not accepted");
});

test("subscription lifecycle: validate, add, de-duplicate, cap, unsubscribe, SSRF allowlist", async function(){
  var m = mk(); var A = await m.enroll();
  var s1 = subKeys();
  assert.equal(subValid(s1), true);
  assert.equal((await m.call("subscribe", { subscription:s1 }, A)).json.count, 1);
  assert.equal((await m.call("subscribe", { subscription:s1 }, A)).json.count, 1, "same endpoint is not duplicated");
  for(var bad of [ null, {}, { endpoint:"http://fcm.googleapis.com/x", keys:s1.keys }, { endpoint:"https://evil.example.com/x", keys:s1.keys },
    { endpoint:"https://169.254.169.254/x", keys:s1.keys }, { endpoint:s1.endpoint, keys:{ p256dh:"AAAA", auth:s1.keys.auth } }, { endpoint:s1.endpoint, keys:{ p256dh:s1.keys.p256dh, auth:"AAAA" } } ]){
    assert.equal((await m.call("subscribe", { subscription:bad }, A)).status, 400);
  }
  for(var i = 0; i < 7; i++) await m.call("subscribe", { subscription:subKeys() }, A);
  assert.equal((await m.call("get", {}, A)).json.subscriptions, 5, "capped at 5 devices");
  assert.equal((await m.call("unsubscribe", { endpoint:"https://fcm.googleapis.com/fcm/send/unknown" }, A)).json.removed, 0);
  var s2 = subKeys(); await m.call("subscribe", { subscription:s2 }, A);
  assert.equal((await m.call("unsubscribe", { endpoint:s2.endpoint }, A)).json.removed, 1);
  assert.equal((await m.call("subscribe", { subscription:s1 }, null)).status, 401);
});

test("test push: needs VAPID keys and a subscription; delivers in the saved language; 410 removes the device", async function(){
  var env = vapidEnv(); var m = mk(env); var A = await m.enroll();
  var noKeys = await m.call("test", {}, A, { env:ENV_BASE });
  assert.equal(noKeys.status, 503); assert.equal(noKeys.json.reason, "vapid_missing");
  assert.equal((await m.call("test", {}, A)).json.reason, "no_subscription");
  await m.call("saveSettings", { lang:"kn" }, A);
  var s = subKeys(); await m.call("subscribe", { subscription:s }, A);
  var seen = [];
  var snd = function(sub, payload){ seen.push(payload); return Promise.resolve({ ok:true, code:"sent" }); };
  var t = await m.call("test", {}, A, { sendPush:snd });
  assert.equal(t.json.sent, 1); assert.equal(seen[0].title, alertText("kn", "push.test_title")); assert.equal(seen[0].lang, "kn");
  var gone = function(){ return Promise.resolve({ ok:false, code:"subscription_expired", remove:true }); };
  var t2 = await m.call("test", {}, A, { sendPush:gone });
  assert.equal(t2.json.ok, false); assert.deepEqual(t2.json.codes, ["subscription_expired"]);
  assert.equal((await m.call("get", {}, A)).json.subscriptions, 0, "expired subscription is dropped");
  assert.equal((await m.call("test", {}, A)).json.reason, "no_subscription");
  // re-subscribing the same endpoint revives it
  await m.call("subscribe", { subscription:s }, A);
  assert.equal((await m.call("get", {}, A)).json.subscriptions, 1);
});

async function setup(env, lang, ruleBody){
  var m = mk(env); m.deps.env = env; var A = await m.enroll();
  await m.call("saveSettings", { watchlist:["RELIANCE"], lang:lang || "en" }, A);
  var sub = subKeys(); await m.call("subscribe", { subscription:sub }, A);
  var r = await m.call("saveRule", { rule:ruleBody || { symbol:"RELIANCE", type:"price_above", params:{ value:101 } } }, A);
  assert.equal(r.status, 200);
  async function cron(at, prices, extra){
    return handleAlerts({ method:"POST", query:{ action:"cron" }, body:{}, headers:{ authorization:"Bearer " + env.CRON_SECRET } },
      Object.assign({}, m.deps, { now:at, fetchSnapshots:feed(prices) }, extra || {}));
  }
  return { m:m, A:A, sub:sub, rid:r.json.rule.id, cron:cron };
}

test("END-TO-END (mock feed + mock push service): scheduled run fires once on the cross, pushes real encrypted payload, records history", async function(){
  var env = vapidEnv(); var s = await setup(env, "te");
  var push = capturePush();
  var r1 = await s.cron(NOW, { RELIANCE:100.2 }, { fetchImpl:push });
  assert.equal(r1.json.summary.events, 0); assert.equal(push.calls.length, 0);
  var r2 = await s.cron(NOW + 300000, { RELIANCE:101.6 }, { fetchImpl:push });
  assert.equal(r2.json.summary.events, 1); assert.equal(r2.json.summary.sent, 1);
  assert.equal(push.calls.length, 1);
  var c = push.calls[0];
  assert.equal(c.url, s.sub.endpoint); assert.equal(c.init.method, "POST");
  assert.equal(c.init.headers["Content-Encoding"], "aes128gcm");
  assert.match(c.init.headers.Authorization, /^vapid t=[\w-]+\.[\w-]+\.[\w-]+, k=/);
  assert.ok(c.init.body.length > 86, "encrypted body present");
  var g = (await s.m.call("get", {}, s.A)).json;
  assert.equal(g.history.length, 1);
  var h = g.history[0];
  assert.equal(h.symbol, "RELIANCE"); assert.equal(h.event, "price_above"); assert.equal(h.direction, "up"); assert.equal(h.price, 101.6);
  assert.equal(h.timeframe, "5m"); assert.equal(h.freshness.state, "live"); assert.equal(h.freshness.source, "yahoo"); assert.equal(h.delivery.sent, 1);
  assert.equal(g.status[s.rid].status, "triggered");
  assert.equal(g.lastRun.open, true); assert.ok(g.serverLastRun.at > 0);
  // next runs: still above -> no duplicate, no push
  var r3 = await s.cron(NOW + 600000, { RELIANCE:101.9 }, { fetchImpl:push });
  assert.equal(r3.json.summary.events, 0); assert.equal(push.calls.length, 1);
  assert.equal((await s.m.call("get", {}, s.A)).json.history.length, 1);
});

test("push text is built in the saved language (five languages), symbols stay English", async function(){
  for(var lang of ["en", "te", "hi", "kn", "ta"]){
    var env = vapidEnv(); var s = await setup(env, lang);
    var seen = [];
    var snd = function(sub, payload){ seen.push(payload); return Promise.resolve({ ok:true, code:"sent" }); };
    await s.cron(NOW, { RELIANCE:100.2 }, { sendPush:snd });
    await s.cron(NOW + 300000, { RELIANCE:101.6 }, { sendPush:snd });
    assert.equal(seen.length, 1, lang);
    assert.equal(seen[0].lang, lang);
    assert.equal(seen[0].title, alertText(lang, "ev.price_above", { sym:"RELIANCE", level:"101.00" }), lang);
    assert.ok(seen[0].title.indexOf("RELIANCE") >= 0);
    assert.match(seen[0].data.url, /^\/\?tab=alerts&open=[0-9a-f]{12}$/);
    if(lang != "en") assert.notEqual(seen[0].title, alertText("en", "ev.price_above", { sym:"RELIANCE", level:"101.00" }));
  }
});

test("language preference is stored per device; unknown languages fall back to English", async function(){
  var m = mk(); var A = await m.enroll(); var B = await m.enroll("CODE-TWO");
  assert.equal((await m.call("saveSettings", { lang:"ta" }, A)).json.doc.lang, "ta");
  assert.equal((await m.call("saveSettings", { lang:"fr" }, A)).json.doc.lang, "en");
  await m.call("saveSettings", { lang:"hi" }, B);
  assert.equal((await m.call("get", {}, A)).json.doc.lang, "en");
  assert.equal((await m.call("get", {}, B)).json.doc.lang, "hi");
  var e = await m.call("enroll", { code:"CODE-ONE", lang:"te" });
  assert.equal((await m.call("get", {}, e.json.secret)).json.doc.lang, "te");
});

test("sender failures: 410 drops the device; 401/413/400 are counted but keep it; 429 and 5xx retry then deliver", async function(){
  var env = vapidEnv(); var s = await setup(env);
  await s.cron(NOW, { RELIANCE:100.2 });
  // transient failure first, then success on the next run's retry
  var plan = function(n){ return n == 1 ? 503 : 201; };
  var push = capturePush(plan);
  var r = await s.cron(NOW + 300000, { RELIANCE:101.6 }, { fetchImpl:push });
  assert.equal(r.json.summary.events, 1); assert.equal(r.json.summary.failed, 1); assert.equal(r.json.summary.sent, 0);
  var r2 = await s.cron(NOW + 600000, { RELIANCE:101.7 }, { fetchImpl:push });
  assert.equal(r2.json.summary.sent, 1, "retry delivered");
  assert.equal(r2.json.summary.events, 0, "retry is not a new event");
  var r3 = await s.cron(NOW + 900000, { RELIANCE:101.8 }, { fetchImpl:push });
  assert.equal(r3.json.summary.sent, 0); assert.equal(push.calls.length, 2, "no further retry after success");
  // permanent: vapid rejected keeps subscription
  var env2 = vapidEnv(); var s2 = await setup(env2);
  var p401 = capturePush(function(){ return 401; });
  await s2.cron(NOW, { RELIANCE:100.2 }, { fetchImpl:p401 });
  var x = await s2.cron(NOW + 300000, { RELIANCE:101.6 }, { fetchImpl:p401 });
  assert.equal(x.json.summary.failed, 1); assert.equal(x.json.summary.removedSubs, 0);
  assert.equal((await s2.m.call("get", {}, s2.A)).json.subscriptions, 1);
  var gh = (await s2.m.call("get", {}, s2.A)).json.history[0];
  assert.equal(gh.delivery.failed, 1); assert.equal(gh.delivery.sent, 0);
  // expired: removed
  var env3 = vapidEnv(); var s3 = await setup(env3);
  var p410 = capturePush(function(){ return 410; });
  await s3.cron(NOW, { RELIANCE:100.2 }, { fetchImpl:p410 });
  var y = await s3.cron(NOW + 300000, { RELIANCE:101.6 }, { fetchImpl:p410 });
  assert.equal(y.json.summary.removedSubs, 1);
  assert.equal((await s3.m.call("get", {}, s3.A)).json.subscriptions, 0);
  assert.equal(p410.calls.length, 1);
  // network exception does not crash the run
  var thrower = function(){ return Promise.reject(new Error("boom")); };
  var env4 = vapidEnv(); var s4 = await setup(env4);
  await s4.cron(NOW, { RELIANCE:100.2 }, { fetchImpl:thrower });
  var z = await s4.cron(NOW + 300000, { RELIANCE:101.6 }, { fetchImpl:thrower });
  assert.equal(z.status, 200); assert.equal(z.json.summary.events, 1); assert.equal(z.json.summary.failed, 1);
});

test("missing VAPID keys: the run still records history but reports every send as failed (never fakes delivery)", async function(){
  var s = await setup(Object.assign({}, ENV_BASE));
  await s.cron(NOW, { RELIANCE:100.2 });
  var r = await s.cron(NOW + 300000, { RELIANCE:101.6 });
  assert.equal(r.json.summary.events, 1); assert.equal(r.json.summary.sent, 0); assert.equal(r.json.summary.failed, 1);
});

test("duplicate suppression: an identical event key is counted as suppressed, not sent twice", async function(){
  var env = vapidEnv();
  var s = await setup(env, "en", { symbol:"RELIANCE", type:"pct_up", params:{ pct:1.5 } });
  var seen = [];
  var snd = function(sub, p){ seen.push(p); return Promise.resolve({ ok:true, code:"sent" }); };
  await s.cron(NOW, { RELIANCE:101.8 }, { sendPush:snd });
  assert.equal(seen.length, 1);
  // editing the rule resets engine state, so the engine would fire the same day-key again
  var cur = (await s.m.call("get", {}, s.A)).json.doc.rules[0];
  await s.m.call("saveRule", { rule:{ id:cur.id, symbol:"RELIANCE", type:"pct_up", params:{ pct:1.5 } } }, s.A);
  var r = await s.cron(NOW + 300000, { RELIANCE:101.9 }, { sendPush:snd });
  assert.equal(r.json.summary.events, 0); assert.equal(r.json.summary.suppressed, 1);
  assert.equal(seen.length, 1, "no second push");
  var g = (await s.m.call("get", {}, s.A)).json;
  assert.equal(g.suppressed, 1); assert.equal(g.history.length, 1);
  await s.m.call("clearHistory", {}, s.A);
  var g2 = (await s.m.call("get", {}, s.A)).json; assert.equal(g2.history.length, 0); assert.equal(g2.suppressed, 0);
});

test("market closure: weekend, listed holiday and after-hours runs skip the provider and label the rules", async function(){
  var env = vapidEnv(); var s = await setup(env);
  var counter = { n:0 };
  for(var c of [ [istMs(2026, 10, 17, 11, 0), "market_WEEKEND"], [istMs(2026, 10, 20, 11, 0), "market_HOLIDAY"], [istMs(2026, 10, 13, 20, 0), "market_CLOSED"], [istMs(2026, 10, 13, 9, 5), "market_PRE_OPEN"] ]){
    var r = await handleAlerts({ method:"POST", query:{ action:"cron" }, body:{}, headers:{ authorization:"Bearer " + env.CRON_SECRET } },
      Object.assign({}, s.m.deps, { now:c[0], fetchSnapshots:feed({ RELIANCE:101.6 }, counter) }));
    assert.equal(r.json.summary.skipped, c[1]);
    assert.equal(r.json.summary.events, 0);
  }
  assert.equal(counter.n, 0, "provider never called while the market is closed");
  var g = (await s.m.call("get", {}, s.A)).json;
  assert.equal(g.status[s.rid].status, "market_closed");
});

test("provider errors and stale data: no alert, rule labelled with the reason", async function(){
  var env = vapidEnv(); var s = await setup(env);
  var push = capturePush();
  var r = await s.cron(NOW, { RELIANCE:{ ok:false, code:"rate_limited", quote:null, frames:{} } }, { fetchImpl:push });
  assert.equal(r.json.summary.events, 0); assert.equal(push.calls.length, 0);
  var g = (await s.m.call("get", {}, s.A)).json;
  assert.equal(g.status[s.rid].status, "unavailable"); assert.equal(g.status[s.rid].reason, "rate_limited");
  // stale quote: price crossed but the quote is 3 hours old -> no alert
  var staleFeed = function(req, o){ var sn = snap(101.6, o.now); sn.quote.asOf = o.now - 3 * 3600000; return Promise.resolve({ RELIANCE:sn }); };
  await s.cron(NOW + 300000, { RELIANCE:100.2 });
  var r2 = await handleAlerts({ method:"POST", query:{ action:"cron" }, body:{}, headers:{ authorization:"Bearer " + env.CRON_SECRET } },
    Object.assign({}, s.m.deps, { now:NOW + 600000, fetchSnapshots:staleFeed, fetchImpl:push }));
  assert.equal(r2.json.summary.events, 0); assert.equal(push.calls.length, 0);
});

test("checkNow evaluates only my rules and is rate limited; clear and unenroll remove data", async function(){
  var env = vapidEnv(); var s = await setup(env);
  var r1 = await s.m.call("checkNow", {}, s.A, { fetchSnapshots:feed({ RELIANCE:100.2 }) });
  assert.equal(r1.status, 200); assert.equal(r1.json.result.evaluated, 1);
  var r2 = await s.m.call("checkNow", {}, s.A, { fetchSnapshots:feed({ RELIANCE:100.2 }), now:NOW + 5000 });
  assert.equal(r2.status, 429);
  assert.equal((await s.m.call("checkNow", {}, null)).status, 401);
  var un = await s.m.call("unenroll", {}, s.A);
  assert.equal(un.status, 200);
  assert.equal((await s.m.call("get", {}, s.A)).status, 401);
  var dump = JSON.stringify(s.m.store._dump());
  assert.equal(dump.indexOf(ownerIdFromSecret(s.A)), -1, "all keys for the owner are gone");
});
