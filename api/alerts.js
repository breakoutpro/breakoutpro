// BreakoutPro - api/alerts.js
// ONE serverless function for all Smart Alerts server work (the project is at the Vercel
// Hobby 12-function limit, so actions are multiplexed here).
//   status        public: what the server can do (storage / push keys / last scheduled run)
//   enroll        needs a valid session token or beta invite code; returns a device secret ONCE
//   get | saveRule | deleteRule | toggleRule | saveSettings | subscribe | unsubscribe |
//   test | checkNow | clearHistory | unenroll      need the device secret (X-BP-Device header)
//   cron          needs Authorization: Bearer CRON_SECRET; runs every owner's rules + sends push
// Authorization is ONLY the device secret / session token / cron secret. A user id sent by the
// client is never read. Fails closed when storage is not configured.
// Rules rule: no backtick, no triple-equals, ASCII only.

import crypto from "crypto";
import * as S from "./_lib/alertStore.js";
import * as A from "./_lib/alertAuth.js";
import { runAll, runOwner, eventId, subId, ruleMonitorable, monitorableRules } from "./_lib/alertRunner.js";
import { sendPush, vapidConfig, endpointAllowed, unb64u } from "./_lib/webpush.js";
import { fetchSnapshots, framesNeeded } from "./_lib/alertData.js";
import { validateRuleInput, cleanWatchlist, MAX_RULES } from "../src/alerts/alertRules.js";
import { evaluateAll, sessionAt } from "../src/alerts/alertEngine.js";
import { normLang, alertText } from "../src/alerts/alertLang.js";

var MAX_BODY = 40000;
var CHECK_NOW_GAP_MS = 20000;

function out(status, json){ return { status:status, json:json }; }
function fail(status, reason, extra){ return out(status, Object.assign({ ok:false, reason:reason }, extra || {})); }

function indicesFlags(ind){
  ind = ind || {};
  return { NIFTY: ind.NIFTY == true, BANKNIFTY: ind.BANKNIFTY == true };
}
function ctxFor(doc, symbol){
  var ind = doc.indices || {};
  return { watchlist: doc.watchlist, indicesEnabled: (symbol == "NIFTY" && ind.NIFTY == true) || (symbol == "BANKNIFTY" && ind.BANKNIFTY == true) };
}
function newId(){ return "r" + crypto.randomBytes(6).toString("hex"); }

export function subValid(s){
  if(!s || typeof s != "object" || typeof s.endpoint != "string" || s.endpoint.length > 600) return false;
  if(!endpointAllowed(s.endpoint)) return false;
  var k = s.keys || {};
  if(typeof k.p256dh != "string" || typeof k.auth != "string") return false;
  var p = unb64u(k.p256dh), a = unb64u(k.auth);
  return p.length == 65 && p[0] == 4 && a.length == 16;
}

async function deviceOwner(store, headers){
  var secret = A.deviceSecretFromReq({ headers: headers || {} });
  var owner = A.ownerIdFromSecret(secret);
  if(!owner) return null;
  if(!(await S.isEnrolled(store, owner))) return null;
  return owner;
}

// input: { method, query:{action}, body, headers }, deps: { store, env, now, fetchImpl, sendPush, fetchSnapshots }
export async function handleAlerts(input, deps){
  deps = deps || {};
  var env = deps.env || process.env;
  var now = deps.now != null ? deps.now : Date.now();
  var headers = input.headers || {};
  var body = input.body && typeof input.body == "object" ? input.body : {};
  var action = (input.query && input.query.action) || body.action || "";
  var store = deps.store !== undefined ? deps.store : S.openStore(env, deps.fetchImpl);
  var vapid = vapidConfig(env);

  if(action == "status"){
    var last = null;
    if(store){ try{ var raw = await store.get(S.KEYS.lastRun); if(raw) last = JSON.parse(raw); }catch(e){ last = null; } }
    return out(200, { ok:true, storage: !!store, push: vapid.ok, vapidPublicKey: vapid.ok ? vapid.publicKey : null,
      enrollOpen: !!(env.SESSION_SECRET || env.BETA_CODES), cron: !!(env.CRON_SECRET && env.CRON_SECRET.length >= 16),
      lastRun: last ? { at:last.at, session:last.session } : null, session: sessionAt(now) });
  }

  if(action == "cron"){
    if(!A.cronAuthorized({ headers:headers }, env)) return fail(401, "unauthorized");
    if(!store) return fail(503, "storage_not_configured");
    var sum = await runAll(store, { now:now, env:env, fetchImpl:deps.fetchImpl, sendPush:deps.sendPush, fetchSnapshots:deps.fetchSnapshots });
    return out(200, { ok:true, summary:sum });
  }

  if(!store) return fail(503, "storage_not_configured");

  if(action == "enroll"){
    var auth = A.enrollAuthorized(body, env, now);
    if(!auth.ok) return fail(401, "unauthorized");
    var secret = A.newDeviceSecret();
    var owner = A.ownerIdFromSecret(secret);
    await S.enroll(store, owner, now);
    var doc0 = S.emptyDoc(normLang(body.lang));
    doc0.updatedAt = now;
    await S.putDoc(store, owner, doc0);
    return out(200, { ok:true, secret:secret });
  }

  var me = await deviceOwner(store, headers);
  if(!me) return fail(401, "unauthorized");

  if(action == "get"){
    var doc = await S.getDoc(store, me);
    var st = await S.getState(store, me);
    var subs = await S.getSubs(store, me);
    var dead = await S.getDead(store, me);
    var last2 = null; try{ var r2 = await store.get(S.KEYS.lastRun); if(r2) last2 = JSON.parse(r2); }catch(e){}
    return out(200, { ok:true, doc:doc, status:st.status || {}, history:(st.history || []).map(function(h){ var c = Object.assign({}, h); delete c.key; return c; }),
      suppressed:st.suppressed || 0, lastRun:st.lastRun || null, serverLastRun:last2 ? { at:last2.at, session:last2.session } : null,
      subscriptions:subs.filter(function(s){ return dead.indexOf(s.id) < 0; }).length, push:vapid.ok, session:sessionAt(now) });
  }

  if(action == "saveSettings"){
    var d = await S.getDoc(store, me);
    if(body.watchlist != undefined){
      if(!Array.isArray(body.watchlist)) return fail(400, "invalid_watchlist");
      d.watchlist = cleanWatchlist(body.watchlist);
    }
    if(body.indices != undefined){
      if(!body.indices || typeof body.indices != "object") return fail(400, "invalid_indices");
      d.indices = indicesFlags(body.indices);
    }
    if(body.lang != undefined){ d.lang = normLang(body.lang); }
    d.updatedAt = now;
    await S.putDoc(store, me, d);
    return out(200, { ok:true, doc:d });
  }

  if(action == "saveRule"){
    var d2 = await S.getDoc(store, me);
    var inp = body.rule || {};
    var idx = -1;
    if(inp.id != undefined){
      for(var i = 0; i < d2.rules.length; i++){ if(d2.rules[i].id == inp.id) idx = i; }
      if(idx < 0) return fail(404, "not_found");          // ownership first: never reveal or touch another device's rule
    } else if(d2.rules.length >= MAX_RULES) return fail(400, "invalid_rule", { errors:["limit"] });
    var v = validateRuleInput(inp, ctxFor(d2, String(inp.symbol || "").toUpperCase()));
    if(!v.ok) return fail(400, "invalid_rule", { errors:v.errors });
    var rule = v.rule;
    if(idx >= 0){
      rule.id = d2.rules[idx].id; rule.createdAt = d2.rules[idx].createdAt; rule.rev = (d2.rules[idx].rev || 0) + 1;
      d2.rules[idx] = rule;
    } else { rule.id = newId(); rule.createdAt = now; rule.rev = 1; d2.rules.push(rule); }
    d2.updatedAt = now;
    await S.putDoc(store, me, d2);
    return out(200, { ok:true, rule:rule, doc:d2 });
  }

  if(action == "toggleRule" || action == "deleteRule"){
    var d3 = await S.getDoc(store, me);
    var at = -1;
    for(var j = 0; j < d3.rules.length; j++){ if(d3.rules[j].id == body.id) at = j; }
    if(at < 0) return fail(404, "not_found");
    if(action == "deleteRule") d3.rules.splice(at, 1);
    else { d3.rules[at].enabled = body.enabled == true; d3.rules[at].rev = (d3.rules[at].rev || 0) + 1; }
    d3.updatedAt = now;
    await S.putDoc(store, me, d3);
    return out(200, { ok:true, doc:d3 });
  }

  if(action == "subscribe"){
    var sub = body.subscription;
    if(!subValid(sub)) return fail(400, "invalid_subscription");
    var list = await S.getSubs(store, me);
    var id = subId(sub.endpoint);
    list = list.filter(function(x){ return x.id != id; });
    list.push({ id:id, endpoint:sub.endpoint, keys:{ p256dh:sub.keys.p256dh, auth:sub.keys.auth }, at:now });
    while(list.length > S.MAX_SUBS) list.shift();
    await S.putSubs(store, me, list);
    await S.clearDead(store, me, id);
    return out(200, { ok:true, count:list.length });
  }

  if(action == "unsubscribe"){
    var ep = typeof body.endpoint == "string" ? body.endpoint : "";
    var list2 = await S.getSubs(store, me);
    var id2 = subId(ep);
    var next = list2.filter(function(x){ return x.id != id2; });
    await S.putSubs(store, me, next);
    await S.clearDead(store, me, id2);
    return out(200, { ok:true, removed:list2.length - next.length });
  }

  if(action == "test"){
    if(!vapid.ok) return fail(503, vapid.code);
    var dd = await S.getDoc(store, me);
    var ss = await S.getSubs(store, me), dead2 = await S.getDead(store, me);
    var liveSubs = ss.filter(function(x){ return dead2.indexOf(x.id) < 0; });
    if(!liveSubs.length) return fail(409, "no_subscription");
    var lang = normLang(dd.lang);
    var payload = { title: alertText(lang, "push.test_title"), body: alertText(lang, "push.test_body"), tag:"bp-test", lang:lang, data:{ url:"/?tab=alerts" } };
    var sent = 0, failed = 0, codes = [];
    var snd = deps.sendPush || sendPush;
    for(var k = 0; k < liveSubs.length; k++){
      var rr = await snd(liveSubs[k], payload, { now:now, env:env, fetchImpl:deps.fetchImpl, topic:"bp-test" });
      if(rr.ok) sent++; else { failed++; codes.push(rr.code); if(rr.remove) await S.markDead(store, me, liveSubs[k].id); }
    }
    return out(200, { ok: sent > 0, sent:sent, failed:failed, codes:codes });
  }

  if(action == "checkNow"){
    var st2 = await S.getState(store, me);
    if(st2.lastRun && now - st2.lastRun.at < CHECK_NOW_GAP_MS) return fail(429, "too_soon");
    var d4 = await S.getDoc(store, me);
    var open = sessionAt(now) == "OPEN" || sessionAt(now) == "POST_CLOSE";
    var need = framesNeeded(monitorableRules(d4));
    var snaps = (open && Object.keys(need).length) ? await (deps.fetchSnapshots || fetchSnapshots)(need, { now:now, fetchImpl:deps.fetchImpl }) : {};
    var res = await runOwner(store, me, d4, snaps, open, now, deps.sendPush || sendPush, { env:env, fetchImpl:deps.fetchImpl });
    return out(200, { ok:true, result:res, session:sessionAt(now) });
  }

  if(action == "clearHistory"){
    var st3 = await S.getState(store, me);
    st3.history = []; st3.suppressed = 0;
    await S.putState(store, me, st3);
    return out(200, { ok:true });
  }

  if(action == "unenroll"){
    await S.removeOwner(store, me);
    return out(200, { ok:true });
  }

  return fail(400, "unsupported_action");
}

function readBody(req){
  return new Promise(function(resolve){
    if(req.body){ resolve(typeof req.body == "string" ? safeParse(req.body) : req.body); return; }
    var data = "", over = false;
    req.on("data", function(c){ data += c; if(data.length > MAX_BODY){ over = true; } });
    req.on("end", function(){ resolve(over ? { __tooLarge:true } : safeParse(data)); });
  });
}
function safeParse(s){ try{ return JSON.parse(s || "{}"); }catch(e){ return {}; } }

export default async function handler(req, res){
  res.setHeader("Cache-Control", "no-store");
  if(req.method != "POST" && req.method != "GET") return res.status(405).json({ ok:false, reason:"method" });
  var body = req.method == "POST" ? await readBody(req) : {};
  if(body && body.__tooLarge) return res.status(413).json({ ok:false, reason:"too_large" });
  if(JSON.stringify(body || {}).length > MAX_BODY) return res.status(413).json({ ok:false, reason:"too_large" });
  var q = req.query || {};
  var action = q.action || (body && body.action) || "";
  if(req.method == "GET" && action != "status" && action != "cron") return res.status(405).json({ ok:false, reason:"method" });
  try{
    var r = await handleAlerts({ method:req.method, query:{ action:action }, body:body, headers:req.headers || {} }, {});
    return res.status(r.status).json(r.json);
  }catch(e){
    return res.status(500).json({ ok:false, reason:"server_error" });
  }
}
