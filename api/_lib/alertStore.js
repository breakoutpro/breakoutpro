// BreakoutPro - api/_lib/alertStore.js
// Storage for Smart Alerts. Two adapters behind one tiny async interface:
//   * Upstash Redis over its REST API (server-only env vars, fail closed if absent)
//   * an in-memory adapter used ONLY by tests (never selected in production code paths)
// No data is ever written anywhere else. Keys are namespaced bp:a: and owner-scoped.
// Rules: no backtick, no triple-equals, ASCII only.
//
// Env (server only): UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
//   (the Vercel/Upstash integration names KV_REST_API_URL / KV_REST_API_TOKEN also work)

export function memoryAdapter(){
  var m = {}; var sets = {};
  return {
    kind: "memory",
    get: async function(k){ return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; },
    set: async function(k, v){ m[k] = String(v); return true; },
    del: async function(k){ delete m[k]; delete sets[k]; return true; },
    sadd: async function(k, v){ sets[k] = sets[k] || {}; sets[k][v] = 1; return true; },
    srem: async function(k, v){ if(sets[k]) delete sets[k][v]; return true; },
    smembers: async function(k){ return Object.keys(sets[k] || {}); },
    _dump: function(){ return { m:m, sets:sets }; }
  };
}

export function upstashConfig(env){
  env = env || process.env;
  var url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL || "";
  var token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN || "";
  if(!url || !token) return null;
  if(url.indexOf("https://") != 0) return null;
  return { url: url.replace(/\/+$/, ""), token: token };
}

export function upstashAdapter(cfg, fetchImpl){
  var f = fetchImpl || fetch;
  async function cmd(args){
    var r = await f(cfg.url, {
      method: "POST",
      headers: { Authorization: "Bearer " + cfg.token, "Content-Type": "application/json" },
      body: JSON.stringify(args)
    });
    if(!r.ok) throw new Error("store_http_" + r.status);
    var j = await r.json();
    if(j && j.error) throw new Error("store_error");
    return j ? j.result : null;
  }
  return {
    kind: "upstash",
    get: async function(k){ var v = await cmd(["GET", k]); return v == undefined ? null : v; },
    set: async function(k, v){ await cmd(["SET", k, String(v)]); return true; },
    del: async function(k){ await cmd(["DEL", k]); return true; },
    sadd: async function(k, v){ await cmd(["SADD", k, v]); return true; },
    srem: async function(k, v){ await cmd(["SREM", k, v]); return true; },
    smembers: async function(k){ var r = await cmd(["SMEMBERS", k]); return Array.isArray(r) ? r : []; }
  };
}

// Returns an adapter, or null when storage is not configured (callers fail closed).
export function openStore(env, fetchImpl){
  var cfg = upstashConfig(env);
  if(!cfg) return null;
  return upstashAdapter(cfg, fetchImpl);
}

var P = "bp:a:";
export var KEYS = {
  owner:  function(o){ return P + "own:" + o; },
  doc:    function(o){ return P + "doc:" + o; },
  subs:   function(o){ return P + "sub:" + o; },
  state:  function(o){ return P + "st:" + o; },
  dead:   function(o){ return P + "dead:" + o; },
  owners: P + "owners",
  lastRun: P + "lastrun"
};

async function getJson(store, key, fallback){
  var raw = await store.get(key);
  if(raw == null) return fallback;
  try{ var v = JSON.parse(raw); return v == null ? fallback : v; }catch(e){ return fallback; }
}
async function putJson(store, key, val){ return store.set(key, JSON.stringify(val)); }

export var MAX_HISTORY = 100;
export var MAX_SUBS = 5;

export function emptyDoc(lang){
  return { rules: [], watchlist: [], indices: { NIFTY:false, BANKNIFTY:false }, lang: lang || "en", updatedAt: 0 };
}
export function emptyState(){ return { rs: {}, history: [], suppressed: 0, lastRun: null }; }

export async function isEnrolled(store, owner){ return (await store.get(KEYS.owner(owner))) != null; }
export async function enroll(store, owner, now){
  await store.set(KEYS.owner(owner), JSON.stringify({ at: now }));
  await store.sadd(KEYS.owners, owner);
}
export async function removeOwner(store, owner){
  var ks = [KEYS.owner(owner), KEYS.doc(owner), KEYS.subs(owner), KEYS.state(owner), KEYS.dead(owner)];
  for(var i = 0; i < ks.length; i++) await store.del(ks[i]);
  await store.srem(KEYS.owners, owner);
}
export async function getDoc(store, owner){ return getJson(store, KEYS.doc(owner), emptyDoc("en")); }
export async function putDoc(store, owner, doc){ return putJson(store, KEYS.doc(owner), doc); }
export async function getSubs(store, owner){ return getJson(store, KEYS.subs(owner), []); }
export async function putSubs(store, owner, subs){ return putJson(store, KEYS.subs(owner), subs); }
export async function getState(store, owner){ return getJson(store, KEYS.state(owner), emptyState()); }
export async function putState(store, owner, st){ return putJson(store, KEYS.state(owner), st); }
export async function getDead(store, owner){ return store.smembers(KEYS.dead(owner)); }
export async function markDead(store, owner, subId){ return store.sadd(KEYS.dead(owner), subId); }
export async function clearDead(store, owner, subId){ return store.srem(KEYS.dead(owner), subId); }
export async function listOwners(store){ return store.smembers(KEYS.owners); }
