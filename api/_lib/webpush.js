// BreakoutPro - api/_lib/webpush.js
// Dependency-free Web Push sender (Node crypto only): VAPID (RFC 8292, ES256 JWT) and
// message encryption (RFC 8291, aes128gcm / RFC 8188). No npm package is added.
// Runs only on the server. The VAPID PRIVATE key is read from environment variables and is
// never logged, returned or sent to the browser.
//   VAPID_PUBLIC_KEY   base64url, 65-byte uncompressed P-256 point (also served to the app)
//   VAPID_PRIVATE_KEY  base64url, 32-byte private scalar
//   VAPID_SUBJECT      mailto:you@example.com or an https URL
// Rules: no backtick, no triple-equals, ASCII only.

import crypto from "crypto";

export var MAX_PAYLOAD_BYTES = 3000;     // push services allow 4096 bytes of ciphertext payload
// Push endpoints come from the browser. To stop a user registering an arbitrary URL for the
// server to call (SSRF), only the known browser push services are accepted.
var HOST_ALLOW = [/^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /(^|\.)push\.apple\.com$/, /(^|\.)notify\.windows\.com$/, /^updates-autopush\.(stage\.)?mozaws\.net$/];

export function b64u(buf){ return Buffer.from(buf).toString("base64url"); }
export function unb64u(s){ return Buffer.from(String(s || ""), "base64url"); }

export function endpointAllowed(endpoint){
  var u;
  try{ u = new URL(endpoint); }catch(e){ return false; }
  if(u.protocol != "https:" || u.username || u.password || (u.port && u.port != "443")) return false;
  for(var i = 0; i < HOST_ALLOW.length; i++){ if(HOST_ALLOW[i].test(u.hostname)) return true; }
  return false;
}

// ---- VAPID ----------------------------------------------------------------------------
export function vapidConfig(env){
  env = env || process.env;
  var pub = env.VAPID_PUBLIC_KEY || "", prv = env.VAPID_PRIVATE_KEY || "", sub = env.VAPID_SUBJECT || "";
  if(!pub || !prv || !sub) return { ok:false, code:"vapid_missing" };
  var pb = unb64u(pub), vb = unb64u(prv);
  if(pb.length != 65 || pb[0] != 4 || vb.length != 32) return { ok:false, code:"vapid_invalid" };
  if(!/^(mailto:[^\s@]+@[^\s@]+|https:\/\/[^\s]+)$/.test(sub)) return { ok:false, code:"vapid_invalid" };
  return { ok:true, publicKey:pub, privateKey:prv, subject:sub };
}

function privateKeyObject(cfg){
  var pb = unb64u(cfg.publicKey);
  return crypto.createPrivateKey({ key:{ kty:"EC", crv:"P-256", d:cfg.privateKey, x:b64u(pb.subarray(1, 33)), y:b64u(pb.subarray(33, 65)) }, format:"jwk" });
}

// Authorization header value for one endpoint. now in ms.
export function vapidAuthorization(endpoint, cfg, now){
  var origin = new URL(endpoint).origin;
  var header = b64u(JSON.stringify({ typ:"JWT", alg:"ES256" }));
  var claims = b64u(JSON.stringify({ aud:origin, exp:Math.floor(now / 1000) + 12 * 3600, sub:cfg.subject }));
  var data = header + "." + claims;
  var sig = crypto.sign("sha256", Buffer.from(data), { key:privateKeyObject(cfg), dsaEncoding:"ieee-p1363" });
  return "vapid t=" + data + "." + b64u(sig) + ", k=" + cfg.publicKey;
}

// ---- Message encryption (RFC 8291) ------------------------------------------------------
// sub: { keys:{ p256dh, auth } }. opts (tests only): { salt, asKeyPair }
export function encryptPayload(plain, sub, opts){
  opts = opts || {};
  var ua = unb64u(sub && sub.keys && sub.keys.p256dh), auth = unb64u(sub && sub.keys && sub.keys.auth);
  if(ua.length != 65 || ua[0] != 4 || auth.length != 16) throw new Error("invalid_subscription_keys");
  var data = Buffer.isBuffer(plain) ? plain : Buffer.from(String(plain), "utf8");
  if(data.length > MAX_PAYLOAD_BYTES) throw new Error("payload_too_large");
  var as = opts.asKeyPair || crypto.generateKeyPairSync("ec", { namedCurve:"prime256v1" });
  var asPubJwk = as.publicKey.export({ format:"jwk" });
  var asPub = Buffer.concat([Buffer.from([4]), unb64u(asPubJwk.x), unb64u(asPubJwk.y)]);
  var uaKey = crypto.createPublicKey({ key:{ kty:"EC", crv:"P-256", x:b64u(ua.subarray(1, 33)), y:b64u(ua.subarray(33, 65)) }, format:"jwk" });
  var secret = crypto.diffieHellman({ privateKey:as.privateKey, publicKey:uaKey });
  var ikm = Buffer.from(crypto.hkdfSync("sha256", secret, auth, Buffer.concat([Buffer.from("WebPush: info\0"), ua, asPub]), 32));
  var salt = opts.salt || crypto.randomBytes(16);
  var cek = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: aes128gcm\0"), 16));
  var nonce = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: nonce\0"), 12));
  var cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  var ct = Buffer.concat([cipher.update(Buffer.concat([data, Buffer.from([2])])), cipher.final(), cipher.getAuthTag()]);
  var rs = Buffer.alloc(4); rs.writeUInt32BE(4096, 0);
  return Buffer.concat([salt, rs, Buffer.from([asPub.length]), asPub, ct]);
}

// ---- Send ---------------------------------------------------------------------------------
// Result: { ok, status, code, remove, retryAfterSec }
//   code: sent | subscription_expired | vapid_rejected | rate_limited | payload_too_large |
//         transient | invalid_subscription | endpoint_not_allowed | vapid_missing | vapid_invalid
//   remove: true only when the push service says the subscription is gone (404/410).
// opts: { fetchImpl, now, env, ttl, urgency, topic, timeoutMs }
export function sendPush(sub, payloadObj, opts){
  opts = opts || {};
  var cfg = vapidConfig(opts.env);
  if(!cfg.ok) return Promise.resolve({ ok:false, code:cfg.code, remove:false });
  if(!sub || typeof sub.endpoint != "string" || !endpointAllowed(sub.endpoint)) return Promise.resolve({ ok:false, code:"endpoint_not_allowed", remove:false });
  var body;
  try{
    var text = JSON.stringify(payloadObj);
    if(Buffer.byteLength(text) > MAX_PAYLOAD_BYTES){ payloadObj = Object.assign({}, payloadObj, { body:String(payloadObj.body || "").slice(0, 200) }); text = JSON.stringify(payloadObj); }
    body = encryptPayload(text, sub);
  }catch(e){
    return Promise.resolve({ ok:false, code:(e && e.message == "payload_too_large") ? "payload_too_large" : "invalid_subscription", remove:false });
  }
  var f = opts.fetchImpl || (typeof fetch != "undefined" ? fetch : null);
  if(!f) return Promise.resolve({ ok:false, code:"transient", remove:false });
  var now = opts.now != null ? opts.now : Date.now();
  var headers = {
    "Authorization":vapidAuthorization(sub.endpoint, cfg, now),
    "Content-Encoding":"aes128gcm", "Content-Type":"application/octet-stream",
    "TTL":String(opts.ttl || 1800), "Urgency":opts.urgency || "high"
  };
  if(opts.topic) headers["Topic"] = String(opts.topic).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32);
  var ctrl = null, timer = null;
  try{ ctrl = new AbortController(); }catch(e){ ctrl = null; }
  if(ctrl) timer = setTimeout(function(){ try{ ctrl.abort(); }catch(e){} }, opts.timeoutMs || 8000);
  return Promise.resolve().then(function(){
    return f(sub.endpoint, { method:"POST", headers:headers, body:body, signal:ctrl ? ctrl.signal : undefined });
  }).then(function(r){
    if(timer) clearTimeout(timer);
    var s = r.status;
    if(s >= 200 && s < 300) return { ok:true, status:s, code:"sent", remove:false };
    if(s == 404 || s == 410) return { ok:false, status:s, code:"subscription_expired", remove:true };
    if(s == 401 || s == 403) return { ok:false, status:s, code:"vapid_rejected", remove:false };
    if(s == 413) return { ok:false, status:s, code:"payload_too_large", remove:false };
    if(s == 429){
      var ra = 0; try{ ra = parseInt(r.headers.get("retry-after") || "0", 10) || 0; }catch(e){}
      return { ok:false, status:s, code:"rate_limited", remove:false, retryAfterSec:ra };
    }
    if(s == 400) return { ok:false, status:s, code:"invalid_subscription", remove:false };
    return { ok:false, status:s, code:"transient", remove:false };
  }, function(){
    if(timer) clearTimeout(timer);
    return { ok:false, code:"transient", remove:false };
  });
}
