// BreakoutPro - api/auth.js
// Server-side auth for private beta. Secrets live ONLY on the server (no VITE_ prefix),
// so they are NEVER shipped in the browser bundle. Rules: no backtick, no triple-equals, ASCII.
//
// Server-only env vars (set in Vercel, WITHOUT VITE_ prefix):
//   ADMIN_PHONE     - admin phone number
//   ADMIN_PASS      - admin password (never returned to browser)
//   BETA_CODES      - comma-separated invite codes
//   SESSION_SECRET  - random string used to sign session tokens

import crypto from "crypto";

var TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function sign(payload, secret){
  var body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  var mac = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + mac;
}
// Verify signature (timing-safe) and expiry. Returns payload or null.
function verify(token, secret){
  if(!token || typeof token != "string") return null;
  var parts = token.split(".");
  if(parts.length != 2) return null;
  var expected = crypto.createHmac("sha256", secret).update(parts[0]).digest("base64url");
  var a = Buffer.from(parts[1]); var b = Buffer.from(expected);
  if(a.length != b.length) return null;
  if(!crypto.timingSafeEqual(a, b)) return null;
  var payload; try{ payload = JSON.parse(Buffer.from(parts[0], "base64url").toString()); }catch(e){ return null; }
  if(!payload || !payload.exp || Date.now() > payload.exp) return null; // expired
  return payload;
}

function readBody(req){
  return new Promise(function(resolve){
    if(req.body){ resolve(typeof req.body=="string"?safeParse(req.body):req.body); return; }
    var data="";
    req.on("data", function(c){ data+=c; });
    req.on("end", function(){ resolve(safeParse(data)); });
  });
}
function safeParse(s){ try{ return JSON.parse(s||"{}"); }catch(e){ return {}; } }

export default async function handler(req, res){
  if(req.method != "POST"){ return res.status(405).json({ ok:false, reason:"method" }); }

  var ADMIN_PHONE = process.env.ADMIN_PHONE || "";
  var ADMIN_PASS  = process.env.ADMIN_PASS || "";
  var BETA_CODES  = (process.env.BETA_CODES || "").split(",").map(function(x){ return x.trim(); }).filter(Boolean);
  var SECRET      = process.env.SESSION_SECRET || "";

  // Fail closed if required server secrets are missing (never fall back to insecure).
  if(!SECRET){ return res.status(200).json({ ok:false, reason:"unavailable" }); }

  var body = await readBody(req);
  var action = body.action || "";
  var phone = (body.phone || "").trim();
  var pass  = body.pass || "";
  var code  = (body.code || "").trim();

  function tsEqual(x, y){
    var a = Buffer.from(String(x)); var b = Buffer.from(String(y));
    if(a.length != b.length) return false;
    try{ return crypto.timingSafeEqual(a, b); }catch(e){ return false; }
  }

  // ADMIN LOGIN: compared on the server (timing-safe), password never leaves the server.
  if(action == "admin"){
    if(ADMIN_PHONE && ADMIN_PASS && tsEqual(phone, ADMIN_PHONE) && tsEqual(pass, ADMIN_PASS)){
      var token = sign({ role:"admin", phone:phone, exp:Date.now()+TOKEN_TTL_MS }, SECRET);
      return res.status(200).json({ ok:true, role:"admin", name:"Admin", token:token });
    }
    return res.status(200).json({ ok:false, reason:"invalid" }); // generic error
  }

  // BETA INVITE CHECK: codes validated on the server, list never shipped to browser.
  if(action == "verifyCode"){
    var valid = false;
    for(var i=0;i<BETA_CODES.length;i++){ if(tsEqual(code, BETA_CODES[i])){ valid = true; break; } }
    if(valid){
      var t2 = sign({ role:"beta", exp:Date.now()+TOKEN_TTL_MS }, SECRET);
      return res.status(200).json({ ok:true, role:"beta", token:t2 });
    }
    return res.status(200).json({ ok:false, reason:"invalid" });
  }

  // TOKEN VERIFY: server-side validation of a session token for protected operations.
  if(action == "verify"){
    var p = verify(body.token || "", SECRET);
    if(p){ return res.status(200).json({ ok:true, role:p.role }); }
    return res.status(200).json({ ok:false, reason:"invalid" });
  }

  return res.status(200).json({ ok:false, reason:"unsupported_action" });
}
