// BreakoutPro - api/market.js
// Vercel serverless function. Single entry for all market data.
// Routes each action to the best free provider. Dhan ready for future upgrade.
//
// PROVIDER STRATEGY:
//   Yahoo (free, no key)  -> live index + stock prices
//   IndianAPI (free key)  -> fundamentals, 52W, gainers/losers, IPO, news
//   Dhan (paid, future)   -> real-time option chain, Greeks, depth
//
// To make Dhan primary later: import it and point actions to it. App never changes.

import * as yahoo from "./providers/yahoo.js";
import * as indian from "./providers/indianapi.js";
// import * as dhan from "./providers/dhan.js"; // enable when Data API subscribed

export default async function handler(req, res){
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=60");

  var action = (req.query && req.query.action) || "";
  var q = req.query || {};

  try{
    var data = null;

    if(action == "indices"){
      data = await yahoo.getIndices();
    } else if(action == "quote" || action == "index"){
      data = await yahoo.getQuote(q.symbol);
    } else if(action == "quotes"){
      data = await yahoo.getQuotes(q.symbols);
    } else if(action == "trending" || action == "gainers" || action == "losers"){
      data = await indian.getTrending();
    } else if(action == "week52"){
      data = await indian.get52Week();
    } else if(action == "stock"){
      data = await indian.getStock(q.name || q.symbol);
    } else if(action == "ipo"){
      data = await indian.getIPO();
    } else if(action == "news"){
      data = await indian.getNews();
    } else if(action == "commodities"){
      data = await indian.getCommodities();
    } else {
      return res.status(200).json({ ok:false, reason:"unsupported_action", action:action });
    }

    if(data == null){
      return res.status(200).json({ ok:false, reason:"no_data" });
    }
    return res.status(200).json({ ok:true, data:data });

  }catch(err){
    return res.status(200).json({ ok:false, reason:"error", message:String(err && err.message || err) });
  }
}
