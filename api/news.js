// BreakoutPro - api/news.js
// GET /api/news
// Headlines returned by the news provider (IndianAPI, via the existing
// api/providers/indianapi.js getNews). Fail-closed: if the key is not set, the
// provider cannot be reached, or the response holds no readable headline, the
// answer is an honest "unavailable" with an empty list. This route never
// returns a stored, example or invented headline and never names a publisher
// the provider did not name.
//
// Response:
//   ok:true  { ok:true, provider:"IndianAPI", fetchedAt, items:[{title,link,pubDate,source}] }
//   ok:false { ok:false, reason:"not_configured"|"provider_error"|"no_items", items:[] }
// pubDate is an ISO string, or "" when the provider gave no unambiguous time.
//
// Server env var used (name only; set it in Vercel -> Settings -> Environment
// Variables): INDIANAPI_KEY
// Rules: no backtick, no triple-equals, ASCII only.

import * as indian from "./_lib/providers/indianapi.js";

var TIMEOUT_MS = 8000;

function fail(res, reason){
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ ok:false, reason:reason, items:[] });
}

export default async function handler(req, res){
  if(req.method != "GET"){
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok:false, reason:"method", items:[] });
  }
  if(!process.env.INDIANAPI_KEY) return fail(res, "not_configured");

  var timer = null;
  try{
    var raw = await Promise.race([
      indian.getNews(),
      new Promise(function(resolve){ timer = setTimeout(function(){ resolve(null); }, TIMEOUT_MS); })
    ]);
    if(timer) clearTimeout(timer);
    if(raw == null) return fail(res, "provider_error");
    var items = indian.normalizeNews(raw, 30);
    if(!items.length) return fail(res, "no_items");
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json({ ok:true, provider:"IndianAPI", fetchedAt:new Date().toISOString(), items:items });
  }catch(e){
    if(timer) clearTimeout(timer);
    return fail(res, "provider_error");
  }
}
