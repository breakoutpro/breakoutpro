// Web Push sender tests: real cryptography (VAPID signature verified with the public key,
// aes128gcm decrypted with the receiver's private key) against MOCKED push services.
// A real push service was NOT contacted, so end-to-end delivery is not verified here.
import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { encryptPayload, vapidConfig, vapidAuthorization, sendPush, endpointAllowed, b64u, unb64u, MAX_PAYLOAD_BYTES } from "../api/_lib/webpush.js";

function genVapid(){
  var kp = crypto.generateKeyPairSync("ec", { namedCurve:"prime256v1" });
  var j = kp.privateKey.export({ format:"jwk" });
  var pub = Buffer.concat([Buffer.from([4]), unb64u(j.x), unb64u(j.y)]);
  return { env:{ VAPID_PUBLIC_KEY:b64u(pub), VAPID_PRIVATE_KEY:j.d, VAPID_SUBJECT:"mailto:ops@example.com" }, kp:kp };
}
function genSubscriber(endpoint){
  var kp = crypto.generateKeyPairSync("ec", { namedCurve:"prime256v1" });
  var j = kp.publicKey.export({ format:"jwk" });
  var auth = crypto.randomBytes(16);
  return { sub:{ endpoint:endpoint || "https://fcm.googleapis.com/fcm/send/abc", keys:{ p256dh:b64u(Buffer.concat([Buffer.from([4]), unb64u(j.x), unb64u(j.y)])), auth:b64u(auth) } }, kp:kp, auth:auth };
}
// receiver side of RFC 8291 (user agent)
function decrypt(body, subr){
  var salt = body.subarray(0, 16), idlen = body[20], asPub = body.subarray(21, 21 + idlen), ct = body.subarray(21 + idlen);
  var uaJwk = subr.kp.publicKey.export({ format:"jwk" });
  var uaPub = Buffer.concat([Buffer.from([4]), unb64u(uaJwk.x), unb64u(uaJwk.y)]);
  var asKey = crypto.createPublicKey({ key:{ kty:"EC", crv:"P-256", x:b64u(asPub.subarray(1, 33)), y:b64u(asPub.subarray(33, 65)) }, format:"jwk" });
  var secret = crypto.diffieHellman({ privateKey:subr.kp.privateKey, publicKey:asKey });
  var ikm = Buffer.from(crypto.hkdfSync("sha256", secret, subr.auth, Buffer.concat([Buffer.from("WebPush: info\0"), uaPub, asPub]), 32));
  var cek = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: aes128gcm\0"), 16));
  var nonce = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: nonce\0"), 12));
  var d = crypto.createDecipheriv("aes-128-gcm", cek, nonce);
  d.setAuthTag(ct.subarray(ct.length - 16));
  var pt = Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
  assert.equal(pt[pt.length - 1], 2);                                   // single-record delimiter
  return pt.subarray(0, pt.length - 1).toString("utf8");
}

test("RFC 8291 appendix A vector: the sender reproduces the published ciphertext exactly", function(){
  var asPriv = "yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw", asPub = "BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8";
  var uaPub = "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4";
  var auth = "BTBZMqHH6r4Tts7J_aSIgg", salt = "DGv6ra1nlYgDCS1FRnbzlw";
  var pb = unb64u(asPub);
  var privateKey = crypto.createPrivateKey({ key:{ kty:"EC", crv:"P-256", d:asPriv, x:b64u(pb.subarray(1, 33)), y:b64u(pb.subarray(33, 65)) }, format:"jwk" });
  var publicKey = crypto.createPublicKey(privateKey);
  var out = encryptPayload("When I grow up, I want to be a watermelon", { keys:{ p256dh:uaPub, auth:auth } }, { salt:unb64u(salt), asKeyPair:{ privateKey:privateKey, publicKey:publicKey } });
  var expected = "DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN";
  assert.equal(b64u(out), expected);
});
test("round trip: what the receiver decrypts equals what was sent (incl. non-ASCII)", function(){
  var s = genSubscriber();
  var msg = JSON.stringify({ title:"NIFTY", body:"తెలుగు test" });
  assert.equal(decrypt(encryptPayload(msg, s.sub), s), msg);
});
test("tampered ciphertext fails authentication", function(){
  var s = genSubscriber(); var body = encryptPayload("hello", s.sub); body[body.length - 3] ^= 1;
  assert.throws(function(){ decrypt(body, s); });
});
test("bad subscription keys and oversize payloads are rejected", function(){
  assert.throws(function(){ encryptPayload("x", { keys:{ p256dh:"AAAA", auth:"AAAA" } }); }, /invalid_subscription_keys/);
  var s = genSubscriber();
  assert.throws(function(){ encryptPayload("x".repeat(MAX_PAYLOAD_BYTES + 1), s.sub); }, /payload_too_large/);
});
test("VAPID: JWT is ES256, carries aud/exp/sub and verifies with the public key", function(){
  var v = genVapid(), cfg = vapidConfig(v.env); assert.equal(cfg.ok, true);
  var now = Date.now(), h = vapidAuthorization("https://fcm.googleapis.com/fcm/send/abc", cfg, now);
  var m = /^vapid t=([^,]+), k=(.+)$/.exec(h); assert.ok(m); assert.equal(m[2], v.env.VAPID_PUBLIC_KEY);
  var parts = m[1].split(".");
  assert.deepEqual(JSON.parse(unb64u(parts[0]).toString()), { typ:"JWT", alg:"ES256" });
  var c = JSON.parse(unb64u(parts[1]).toString());
  assert.equal(c.aud, "https://fcm.googleapis.com"); assert.equal(c.sub, "mailto:ops@example.com");
  assert.ok(c.exp > now / 1000 && c.exp <= now / 1000 + 86400);
  var sig = unb64u(parts[2]); assert.equal(sig.length, 64);
  assert.equal(crypto.verify("sha256", Buffer.from(parts[0] + "." + parts[1]), { key:v.kp.publicKey, dsaEncoding:"ieee-p1363" }, sig), true);
  assert.equal(crypto.verify("sha256", Buffer.from(parts[0] + "." + parts[1] + "x"), { key:v.kp.publicKey, dsaEncoding:"ieee-p1363" }, sig), false);
});
test("VAPID config: missing or malformed keys fail closed with a code, never a secret", function(){
  assert.equal(vapidConfig({}).code, "vapid_missing");
  assert.equal(vapidConfig({ VAPID_PUBLIC_KEY:"abc", VAPID_PRIVATE_KEY:"def", VAPID_SUBJECT:"mailto:a@b.co" }).code, "vapid_invalid");
  var v = genVapid(); v.env.VAPID_SUBJECT = "ops";
  assert.equal(vapidConfig(v.env).code, "vapid_invalid");
});
test("endpoint allow-list blocks arbitrary / internal URLs (SSRF guard)", function(){
  ["https://fcm.googleapis.com/fcm/send/x", "https://updates.push.services.mozilla.com/wpush/v2/x", "https://web.push.apple.com/x", "https://wns2-par02p.notify.windows.com/x"].forEach(function(u){ assert.equal(endpointAllowed(u), true, u); });
  ["http://fcm.googleapis.com/x", "https://169.254.169.254/latest", "https://localhost/x", "https://evil.example.com/x", "https://fcm.googleapis.com.evil.com/x", "https://user:p@fcm.googleapis.com/x", "https://fcm.googleapis.com:8443/x", "notaurl"].forEach(function(u){ assert.equal(endpointAllowed(u), false, u); });
});

function mockFetch(status, headers){
  var calls = [];
  var f = function(url, init){ calls.push({ url:url, init:init }); return Promise.resolve({ status:status, headers:{ get:function(k){ return headers && headers[k] || null; } } }); };
  f.calls = calls; return f;
}
test("sendPush: success posts an encrypted body with VAPID, TTL and urgency headers", async function(){
  var v = genVapid(), s = genSubscriber(), f = mockFetch(201);
  var r = await sendPush(s.sub, { title:"T", body:"B" }, { env:v.env, fetchImpl:f, topic:"abc-123" });
  assert.equal(r.ok, true); assert.equal(r.code, "sent");
  var c = f.calls[0]; assert.equal(c.url, s.sub.endpoint); assert.equal(c.init.method, "POST");
  assert.equal(c.init.headers["Content-Encoding"], "aes128gcm"); assert.ok(/^vapid t=/.test(c.init.headers.Authorization)); assert.equal(c.init.headers.TTL, "1800"); assert.equal(c.init.headers.Topic, "abc-123");
  assert.equal(JSON.parse(decrypt(c.init.body, s)).title, "T");
});
test("sendPush: server failure modes are classified and only 404/410 remove the subscription", async function(){
  var v = genVapid(), s = genSubscriber();
  var table = [[404, "subscription_expired", true], [410, "subscription_expired", true], [401, "vapid_rejected", false], [403, "vapid_rejected", false], [413, "payload_too_large", false], [429, "rate_limited", false], [400, "invalid_subscription", false], [500, "transient", false], [503, "transient", false]];
  for(var i = 0; i < table.length; i++){
    var r = await sendPush(s.sub, { title:"T" }, { env:v.env, fetchImpl:mockFetch(table[i][0]) });
    assert.equal(r.ok, false); assert.equal(r.code, table[i][1], String(table[i][0])); assert.equal(r.remove, table[i][2], String(table[i][0]));
  }
  var rl = await sendPush(s.sub, { title:"T" }, { env:v.env, fetchImpl:mockFetch(429, { "retry-after":"120" }) });
  assert.equal(rl.retryAfterSec, 120);
});
test("sendPush: network failure is transient; missing VAPID and blocked endpoint never call the network", async function(){
  var v = genVapid(), s = genSubscriber();
  var boom = function(){ return Promise.reject(new Error("net down")); };
  assert.equal((await sendPush(s.sub, { title:"T" }, { env:v.env, fetchImpl:boom })).code, "transient");
  var f = mockFetch(201);
  assert.equal((await sendPush(s.sub, { title:"T" }, { env:{}, fetchImpl:f })).code, "vapid_missing");
  assert.equal((await sendPush({ endpoint:"https://evil.example.com/x", keys:s.sub.keys }, { title:"T" }, { env:v.env, fetchImpl:f })).code, "endpoint_not_allowed");
  assert.equal((await sendPush({ endpoint:s.sub.endpoint, keys:{ p256dh:"x", auth:"y" } }, { title:"T" }, { env:v.env, fetchImpl:f })).code, "invalid_subscription");
  assert.equal(f.calls.length, 0);
});
