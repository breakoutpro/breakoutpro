// BreakoutPro - api/_lib/alertAuth.js
// Identity for Smart Alerts. The app has no server-side user accounts, so isolation is per
// enrolled device: a server-generated 256-bit device secret is the credential, and the storage
// owner id is sha256("bp-alerts-v1:" + secret). A client-supplied "user id" is never read.
// Enrollment (the only way to obtain a secret) needs an existing valid session token
// (api/auth.js, SESSION_SECRET) or a valid beta invite code (BETA_CODES).
// Rules: no backtick, no triple-equals, ASCII only.

import crypto from "crypto";

export function newDeviceSecret(){ return crypto.randomBytes(32).toString("base64url"); }
export function secretWellFormed(s){ return typeof s == "string" && /^[A-Za-z0-9_-]{43}$/.test(s); }
export function ownerIdFromSecret(s){
  if(!secretWellFormed(s)) return null;
  return crypto.createHash("sha256").update("bp-alerts-v1:" + s).digest("hex");
}

export function tsEqual(x, y){
  var a = Buffer.from(String(x)), b = Buffer.from(String(y));
  if(a.length != b.length) return false;
  try{ return crypto.timingSafeEqual(a, b); }catch(e){ return false; }
}

// Same token format api/auth.js signs: base64url(payload) + "." + HMAC-SHA256.
export function verifySession(token, secret, now){
  if(!token || typeof token != "string" || !secret) return null;
  var parts = token.split(".");
  if(parts.length != 2) return null;
  var expected = crypto.createHmac("sha256", secret).update(parts[0]).digest("base64url");
  if(!tsEqual(parts[1], expected)) return null;
  var payload;
  try{ payload = JSON.parse(Buffer.from(parts[0], "base64url").toString()); }catch(e){ return null; }
  var t = now != null ? now : Date.now();
  if(!payload || !payload.exp || t > payload.exp) return null;
  return payload;
}

export function codeAccepted(code, env){
  env = env || process.env;
  if(!code || typeof code != "string") return false;
  var list = (env.BETA_CODES || "").split(",").map(function(x){ return x.trim(); }).filter(Boolean);
  var ok = false;
  for(var i = 0; i < list.length; i++){ if(tsEqual(code.trim(), list[i])) ok = true; }
  return ok;
}

// Returns { ok, via } - via is "session" or "code".
export function enrollAuthorized(body, env, now){
  env = env || process.env;
  body = body || {};
  if(body.token && verifySession(body.token, env.SESSION_SECRET || "", now)) return { ok:true, via:"session" };
  if(body.code && codeAccepted(body.code, env)) return { ok:true, via:"code" };
  return { ok:false, via:null };
}

// Device credential travels only in this header (never in a URL or query string).
export function deviceSecretFromReq(req){
  var h = req && req.headers ? (req.headers["x-bp-device"] || "") : "";
  return secretWellFormed(h) ? h : null;
}

// Cron credential: Authorization: Bearer <CRON_SECRET>. Fails closed when unset or short.
export function cronAuthorized(req, env){
  env = env || process.env;
  var secret = env.CRON_SECRET || "";
  if(secret.length < 16) return false;
  var h = req && req.headers ? (req.headers["authorization"] || "") : "";
  if(h.indexOf("Bearer ") != 0) return false;
  return tsEqual(h.slice(7), secret);
}
