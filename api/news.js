// BreakoutPro - api/news.js
//
// This is the endpoint src/hooks/useLiveNews.jsx has always called
// (fetch("/api/news")) - it just never existed as a file, so every request
// silently failed and the app fell back to hardcoded static news
// (src/data/news.js / src/screens/JustInData.jsx). This is the real,
// missing piece: fetches India's actual Economic Times Markets RSS feed
// through the free rss2json converter (no API key required for this
// public endpoint), server-side, so the browser never hits rss2json
// directly (avoids CORS and keeps their rate limit to one caller: us).
//
// Response shape matches exactly what useLiveNews.jsx's parseItems()
// already expects: { items: [{ title, link, pubDate }, ...] }
//
// Real data only - if the upstream feed is unreachable or empty, this
// returns items:[] (never invented headlines); the frontend hook already
// handles that by keeping whatever it last successfully fetched.

var CACHE = { items: null, at: 0 };
var CACHE_TTL = 3 * 60 * 1000; // 3-minute cache, matches the requested refresh interval
var UPSTREAM_TIMEOUT = 8000;
var RSS2JSON_URL = "https://api.rss2json.com/v1/api.json?rss_url=https://economictimes.indiatimes.com/markets/rssfeeds/2146842.cms";

function fetchWithTimeout(url, ms){
  var controller = new AbortController();
  var timer = setTimeout(function(){ controller.abort(); }, ms);
  return fetch(url, { signal: controller.signal }).finally(function(){ clearTimeout(timer); });
}

export default async function handler(req, res){
  if(req.method!=="GET"){
    res.status(405).json({ ok:false, message:"Method not allowed" });
    return;
  }

  var now = Date.now();
  if(CACHE.items && (now - CACHE.at) < CACHE_TTL){
    res.status(200).json({ items: CACHE.items, cached: true });
    return;
  }

  try {
    var resp = await fetchWithTimeout(RSS2JSON_URL, UPSTREAM_TIMEOUT);
    if(!resp.ok){
      console.error("[api/news] rss2json returned status " + resp.status);
      // Serve the last good cache if the upstream call fails, even if
      // slightly stale, rather than an empty feed - still real data, just
      // not the freshest fetch.
      res.status(200).json({ items: CACHE.items || [], cached: true, stale: true });
      return;
    }
    var json = await resp.json();
    if(!Array.isArray(json?.items) || json?.status!=="ok"){
      console.warn("[api/news] rss2json response missing items - " + (json && json.message ? json.message : "unknown shape"));
      res.status(200).json({ items: CACHE.items || [], cached: true, stale: true });
      return;
    }

    var items = json.items.map(function(it){
      var desc = it.description ? String(it.description).replace(/<[^>]*>/g, "").trim() : "";
      return {
        title: it.title || "",
        link: it.link || "",
        pubDate: it.pubDate || null,
        description: desc
      };
    }).filter(function(it){ return it.title; });

    CACHE.items = items;
    CACHE.at = now;
    console.log("[api/news] fetched " + items.length + " real items from ET Markets RSS");
    res.status(200).json({ items: items, cached: false });
  } catch(err){
    console.error("[api/news] fetch failed: " + (err && err.message));
    // No fake fallback - either the last real cache, or an honestly empty list.
    res.status(200).json({ items: CACHE.items || [], cached: true, stale: true, error: "Upstream feed unreachable" });
  }
}
