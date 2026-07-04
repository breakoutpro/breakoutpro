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

function sign(payload, secret){
  var body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  var mac = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + mac;
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
  var SECRET      = process.env.SESSION_SECRET || "change_me";

  var body = await readBody(req);
  var action = body.action || "";
  var phone = (body.phone || "").trim();
  var pass  = body.pass || "";
  var code  = (body.code || "").trim();

  // ADMIN LOGIN: compared on the server, password never leaves the server.
  if(action == "admin"){
    if(ADMIN_PHONE && ADMIN_PASS && phone == ADMIN_PHONE && pass == ADMIN_PASS){
      var token = sign({ role:"admin", phone:phone, iat:Date.now() }, SECRET);
      return res.status(200).json({ ok:true, role:"admin", name:"Admin", token:token });
    }
    return res.status(200).json({ ok:false, reason:"invalid_admin" });
  }

  // BETA INVITE CHECK: codes validated on the server, list never shipped to browser.
  if(action == "verifyCode"){
    var valid = BETA_CODES.length ? BETA_CODES.indexOf(code) >= 0 : false;
    if(valid){
      var t2 = sign({ role:"beta", iat:Date.now() }, SECRET);
      return res.status(200).json({ ok:true, role:"beta", token:t2 });
    }
    return res.status(200).json({ ok:false, reason:"invalid_code" });
  }

  return res.status(200).json({ ok:false, reason:"unsupported_action" });
}
