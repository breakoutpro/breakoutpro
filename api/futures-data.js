// api/futures-data.js
//
// GET /api/futures-data?symbols=NIFTY,BANKNIFTY
//
// SYMBOL WHITELIST: only NIFTY and BANKNIFTY are accepted right now, max 2
// per request. This is not a UI limitation - it's here so a request can
// never trigger an arbitrary Angel One API call for a symbol we haven't
// vetted (correct instrument-master matching, real trading interest, etc).
// Expand ALLOWED_SYMBOLS deliberately when adding a new underlying, don't
// remove the whitelist.
//
// Response shape (always this shape, whether live or unavailable):
// {
//   ok: true,
//   results: [
//     { ok:true, status:"LIVE", data:{ symbol, exchange, expiry, ltp, open,
//       high, low, close, volume, oi, changePct, exchangeFeedTime, status } },
//     { ok:false, status:"UNAVAILABLE", symbol:"...", message:"..." }
//   ]
// }
//
// No fake/demo fallback: a symbol that fails resolves to its own
// ok:false/UNAVAILABLE entry, never a fabricated number. If Angel One is
// disconnected entirely, every entry in "results" will be UNAVAILABLE with
// the actual reason (login failure, network error, etc).

import { getFuturesQuote } from "./providers/angelone.js";

var ALLOWED_SYMBOLS = ["NIFTY", "BANKNIFTY"];
var MAX_SYMBOLS = 2;

export default async function handler(req, res){
  if(req.method!=="GET"){
    res.status(405).json({ ok:false, message:"Method not allowed" });
    return;
  }

  var symbolsParam = req.query && req.query.symbols;
  if(!symbolsParam){
    res.status(400).json({ ok:false, message:"Missing required query param: symbols (comma-separated, e.g. NIFTY,BANKNIFTY)" });
    return;
  }

  var symbols = String(symbolsParam).split(",").map(function(s){ return s.trim().toUpperCase(); }).filter(Boolean);
  if(symbols.length===0){
    res.status(400).json({ ok:false, message:"No valid symbols provided" });
    return;
  }
  if(symbols.length>MAX_SYMBOLS){
    res.status(400).json({ ok:false, message:"Too many symbols requested - maximum " + MAX_SYMBOLS + " per request." });
    return;
  }
  var invalid = symbols.filter(function(s){ return ALLOWED_SYMBOLS.indexOf(s)<0; });
  if(invalid.length>0){
    console.warn("[futures-data] rejected unsupported symbol(s): " + invalid.join(","));
    res.status(400).json({ ok:false, message:"Unsupported symbol(s): " + invalid.join(",") + ". Allowed symbols: " + ALLOWED_SYMBOLS.join(",") });
    return;
  }

  var results = await Promise.all(symbols.map(function(sym){ return getFuturesQuote(sym); }));

  console.log("[futures-data] " + symbols.join(",") + " -> " + results.map(function(r){ return r.status; }).join(","));

  res.status(200).json({ ok:true, results: results });
}
