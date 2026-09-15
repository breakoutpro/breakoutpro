// api/futures-data.js
//
// GET /api/futures-data?symbols=NIFTY,BANKNIFTY,RELIANCE
//
// Returns normalized NFO futures quotes from Angel One SmartAPI. This is
// the only file a frontend component should ever call for futures data -
// it never touches Yahoo (equities/index) or any existing provider, and it
// does not change any existing route.
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

  var symbols = String(symbolsParam).split(",").map(function(s){ return s.trim(); }).filter(Boolean);
  if(symbols.length===0){
    res.status(400).json({ ok:false, message:"No valid symbols provided" });
    return;
  }

  var results = await Promise.all(symbols.map(function(sym){ return getFuturesQuote(sym); }));

  console.log("[futures-data] " + symbols.join(",") + " -> " + results.map(function(r){ return r.status; }).join(","));

  res.status(200).json({ ok:true, results: results });
}
