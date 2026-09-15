// api/futures-feed-token.js
//
// GET /api/futures-feed-token
//
// Mints a short-lived (60s) signed token the frontend uses to open a
// WebSocket connection to the relay (server/futures-ws-relay.js) for live
// futures ticks. This endpoint never touches Angel One credentials or
// tokens - it only proves "this request came from our own backend" to the
// relay, using a separate shared secret (RELAY_ACCESS_SECRET).
//
// IMPORTANT - ADD YOUR OWN USER AUTH CHECK HERE before going live: as
// written, this endpoint will hand a valid relay token to anyone who calls
// it. If your app already has a logged-in-user/session check elsewhere
// (e.g. a cookie or header your other API routes check), add the same
// check at the top of this handler before minting a token, so only your
// own signed-in users can open the live feed.

import crypto from "crypto";

export default function handler(req, res){
  if(req.method!=="GET"){
    res.status(405).json({ ok:false, message:"Method not allowed" });
    return;
  }

  // ---- INSERT YOUR EXISTING USER/SESSION AUTH CHECK HERE ----
  // if(!isLoggedIn(req)){ res.status(401).json({ok:false,message:"Not authenticated"}); return; }

  var secret = process.env.RELAY_ACCESS_SECRET;
  if(!secret){
    res.status(500).json({ ok:false, message:"RELAY_ACCESS_SECRET is not configured on this deployment." });
    return;
  }

  var payload = { exp: Date.now() + 60000 }; // 60 second validity - just long enough to open the WS connection
  var payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  var sig = crypto.createHmac("sha256", secret).update(payloadB64).digest("hex");
  var token = payloadB64 + "." + sig;

  var relayUrl = process.env.FUTURES_RELAY_WS_URL || null; // e.g. "wss://your-relay-host.example.com"
  if(!relayUrl){
    res.status(200).json({ ok:false, status:"UNAVAILABLE", message:"Futures live-feed relay is not configured (FUTURES_RELAY_WS_URL unset)." });
    return;
  }

  res.status(200).json({ ok:true, token: token, wsUrl: relayUrl + "?token=" + encodeURIComponent(token) });
}
