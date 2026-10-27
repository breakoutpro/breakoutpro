// BreakoutPro - api/_lib/alertRunner.js
// Server-side evaluation + Web Push delivery for every enrolled owner. Called ONLY by the
// guarded cron action in api/alerts.js. Market data is fetched once per run for the union of
// all owners' watchlist symbols (no per-user duplicate provider calls).
// Rules: no backtick, no triple-equals, ASCII only.

import crypto from "crypto";
import { evaluateAll, sessionAt } from "../../src/alerts/alertEngine.js";
import { allowedSymbols } from "../../src/alerts/alertRules.js";
import { buildMessage } from "../../src/alerts/alertMessage.js";
import { framesNeeded, fetchSnapshots as defaultFetch } from "./alertData.js";
import { sendPush as defaultSend } from "./webpush.js";
import * as S from "./alertStore.js";

export var RUN_LIMITS = { MAX_PUSH_PER_RUN: 10, MAX_RETRIES: 3, RETRY_WINDOW_MS: 20 * 60 * 1000, MAX_OWNERS: 500 };

export function eventId(key){ return crypto.createHash("sha256").update(String(key)).digest("hex").slice(0, 12); }
export function subId(endpoint){ return crypto.createHash("sha256").update(String(endpoint)).digest("hex").slice(0, 16); }

// Index flags are per index: NIFTY / BANKNIFTY. A rule on an index needs that index enabled.
export function ruleMonitorable(rule, doc){
  var ind = doc.indices || {};
  if(allowedSymbols(doc.watchlist, false).indexOf(rule.symbol) >= 0) return true;   // in the user's own watchlist
  if(rule.symbol == "NIFTY") return ind.NIFTY == true;
  if(rule.symbol == "BANKNIFTY") return ind.BANKNIFTY == true;
  return false;
}
export function monitorableRules(doc){
  var rules = (doc && doc.rules) || [];
  return rules.filter(function(r){ return r && r.enabled != false && ruleMonitorable(r, doc); });
}

function pushPayload(ev, msg, lang, id){
  return {
    title: msg.title, body: msg.body, tag: "bp-" + id, lang: lang,
    data: { url: "/?tab=alerts&open=" + id, symbol: ev.symbol, id: id }
  };
}

// opts: { now, env, fetchSnapshots, sendPush, fetchImpl }
export async function runAll(store, opts){
  opts = opts || {};
  var now = opts.now != null ? opts.now : Date.now();
  var fetchSnaps = opts.fetchSnapshots || defaultFetch;
  var send = opts.sendPush || defaultSend;
  var summary = { ok:true, session:sessionAt(now), owners:0, evaluated:0, events:0, sent:0, failed:0, removedSubs:0, suppressed:0, skipped:null, at:now };

  var owners = await S.listOwners(store);
  owners = owners.slice(0, RUN_LIMITS.MAX_OWNERS);
  var docs = {};
  for(var i = 0; i < owners.length; i++) docs[owners[i]] = await S.getDoc(store, owners[i]);

  var open = summary.session == "OPEN" || summary.session == "POST_CLOSE";
  var snaps = {};
  if(open){
    var union = {};
    owners.forEach(function(o){
      var need = framesNeeded(monitorableRules(docs[o]));
      Object.keys(need).forEach(function(sym){
        var l = union[sym] || (union[sym] = []);
        need[sym].forEach(function(tf){ if(l.indexOf(tf) < 0) l.push(tf); });
      });
    });
    if(Object.keys(union).length) snaps = await fetchSnaps(union, { now: now, fetchImpl: opts.fetchImpl });
  } else summary.skipped = "market_" + summary.session;

  for(var j = 0; j < owners.length; j++){
    var o = owners[j];
    try{
      var r = await runOwner(store, o, docs[o], snaps, open, now, send, opts);
      summary.owners++; summary.evaluated += r.evaluated; summary.events += r.events;
      summary.sent += r.sent; summary.failed += r.failed; summary.removedSubs += r.removedSubs; summary.suppressed += r.suppressed;
    }catch(e){ summary.failed++; }
  }
  await store.set(S.KEYS.lastRun, JSON.stringify({ at:now, session:summary.session, owners:summary.owners, events:summary.events, sent:summary.sent, failed:summary.failed }));
  return summary;
}

export async function runOwner(store, owner, doc, snaps, open, now, send, opts){
  var out = { evaluated:0, events:0, sent:0, failed:0, removedSubs:0, suppressed:0 };
  var st = await S.getState(store, owner);
  st.rs = st.rs || {}; st.history = st.history || []; st.status = st.status || {}; st.outbox = st.outbox || [];
  var lang = doc.lang || "en";
  var rules = monitorableRules(doc);
  var fresh = [];

  // A rule edited or re-enabled (rev changed) starts from clean state; deleted rules are pruned.
  st.rev = st.rev || {};
  var liveIds = {};
  (doc.rules || []).forEach(function(r){
    if(!r) return;
    liveIds[r.id] = 1;
    if(st.rev[r.id] != (r.rev || 0)){ delete st.rs[r.id]; st.rev[r.id] = r.rev || 0; }
  });
  Object.keys(st.rs).forEach(function(id){ if(!liveIds[id]) delete st.rs[id]; });
  Object.keys(st.status).forEach(function(id){ if(!liveIds[id]) delete st.status[id]; });
  Object.keys(st.rev).forEach(function(id){ if(!liveIds[id]) delete st.rev[id]; });

  // Rules that cannot run are labelled so the screen never shows a stale "waiting".
  (doc.rules || []).forEach(function(r){
    if(r && r.enabled == false) st.status[r.id] = { status:"disabled", reason:null, at:now };
    else if(r && !ruleMonitorable(r, doc)) st.status[r.id] = { status:"unavailable", reason:"symbol_not_in_watchlist", at:now };
  });

  if(open && rules.length){
    var ev = evaluateAll(rules, snaps, st.rs, now);
    out.evaluated = rules.length;
    rules.forEach(function(r){
      var res = ev.results[r.id];
      if(!res) return;
      if(res.state) st.rs[r.id] = res.state;
      st.status[r.id] = { status:res.status, reason:res.reason || null, at:now, detail:res.detail ? { waitReason:res.detail.waitReason || null } : null };
    });
    var seen = {};
    st.history.forEach(function(h){ if(h.key) seen[h.key] = 1; });
    ev.events.forEach(function(e){
      if(seen[e.key]){ st.suppressed = (st.suppressed || 0) + 1; out.suppressed++; return; }
      seen[e.key] = 1;
      fresh.push(e);
    });
  } else if(!open){
    rules.forEach(function(r){ st.status[r.id] = { status:"market_closed", reason:summary_reason(now), at:now }; });
  }

  var subs = await S.getSubs(store, owner);
  var dead = await S.getDead(store, owner);
  var live = subs.filter(function(s){ return dead.indexOf(s.id) < 0; });
  var pushed = 0;

  // retries from earlier transient failures
  var keep = [];
  for(var q = 0; q < st.outbox.length; q++){
    var ob = st.outbox[q];
    var sub = live.filter(function(s){ return s.id == ob.subId; })[0];
    if(!sub || now - ob.at > RUN_LIMITS.RETRY_WINDOW_MS || ob.tries >= RUN_LIMITS.MAX_RETRIES) continue;
    var rr = await send(sub, ob.payload, { now:now, env:opts.env, fetchImpl:opts.fetchImpl, topic:ob.payload.tag });
    ob.tries++;
    if(rr.ok) out.sent++;
    else if(rr.remove){ await S.markDead(store, owner, sub.id); out.removedSubs++; }
    else { out.failed++; if(rr.code == "transient" || rr.code == "rate_limited") keep.push(ob); }
  }
  st.outbox = keep;

  for(var k = 0; k < fresh.length; k++){
    var e2 = fresh[k];
    var id = eventId(e2.key);
    var msg = buildMessage(e2, lang);
    var entry = { id:id, key:e2.key, at:now, ruleId:e2.ruleId, symbol:e2.symbol, event:e2.event, direction:e2.direction, basis:e2.basis,
      price:e2.price, timeframe:e2.timeframe, eventTime:e2.eventTime, freshness:e2.freshness, reason:e2.reason, pattern:(e2.reason && e2.reason.pattern) || null,
      delivery:{ sent:0, failed:0, subs:live.length } };
    out.events++;
    if(live.length && pushed < RUN_LIMITS.MAX_PUSH_PER_RUN){
      pushed++;
      var payload = pushPayload(e2, msg, lang, id);
      for(var m = 0; m < live.length; m++){
        var res2 = await send(live[m], payload, { now:now, env:opts.env, fetchImpl:opts.fetchImpl, topic:payload.tag });
        if(res2.ok){ entry.delivery.sent++; out.sent++; }
        else {
          entry.delivery.failed++; out.failed++;
          if(res2.remove){ await S.markDead(store, owner, live[m].id); out.removedSubs++; }
          else if(res2.code == "transient" || res2.code == "rate_limited") st.outbox.push({ subId:live[m].id, payload:payload, tries:1, at:now });
        }
      }
    } else if(live.length) entry.delivery.skipped = true;
    st.history.unshift(entry);
  }
  while(st.history.length > S.MAX_HISTORY) st.history.pop();
  st.lastRun = { at:now, evaluated:out.evaluated, events:out.events, open:open };
  await S.putState(store, owner, st);
  return out;
}

function summary_reason(now){ return sessionAt(now); }
