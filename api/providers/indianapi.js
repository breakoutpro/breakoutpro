// BreakoutPro - api/providers/indianapi.js
// IndianAPI.in provider (free tier). Fundamentals, 52W, gainers/losers, news.
// Runs server-side only. Key from env - never in browser.
// Same exported function names as dhan.js for easy switching.

var BASE = "https://stock.indianapi.in";

function headers(){
  return { "X-Api-Key": process.env.INDIANAPI_KEY || "", "Accept": "application/json" };
}

function getJSON(path){
  return fetch(BASE + path, { headers: headers() })
    .then(function(r){ return r.json(); })
    .catch(function(){ return null; });
}

// Trending stocks - top gainers / losers.
export function getTrending(){
  return getJSON("/trending").then(function(j){
    if(!j || !j.trending_stocks) return null;
    return {
      gainers: normList(j.trending_stocks.top_gainers),
      losers:  normList(j.trending_stocks.top_losers)
    };
  });
}

// 52 week high / low.
export function get52Week(){
  return getJSON("/fetch_52_week_high_low_data").then(function(j){
    if(!j) return null;
    var nse = j.NSE_52WeekHighLow || {};
    return {
      high: nse.high52Week || [],
      low:  nse.low52Week || []
    };
  });
}

// Company / stock full fundamentals by name.
export function getStock(name){
  return getJSON("/stock?name=" + encodeURIComponent(name)).then(function(j){
    if(!j) return null;
    return j;
  });
}

// IPO data.
export function getIPO(){ return getJSON("/ipo"); }

// Market news.
export function getNews(){ return getJSON("/news"); }

// ---- News normaliser (pure, fail-closed) ----------------------------------
// The provider's /news response shape is NOT documented in this repo and has
// not been checked against a live response. This function therefore reads only
// what a response actually contains and drops anything it cannot read:
//   - an item without a non-empty title is dropped (never invented)
//   - a link is kept only if it is an http(s) URL
//   - a time is kept only if it can be parsed WITHOUT guessing a timezone
//   - the publisher is kept only if the item names one
// It never fills a missing field with a default, and returns [] when nothing
// usable is found, so the endpoint reports "unavailable" instead of showing
// invented news.
var LIST_KEYS = ["items", "news", "data", "articles", "results", "stories"];

function pickList(json){
  if(Array.isArray(json)) return json;
  if(!json || typeof json != "object") return [];
  for(var i = 0; i < LIST_KEYS.length; i++){
    if(Array.isArray(json[LIST_KEYS[i]])) return json[LIST_KEYS[i]];
  }
  return [];
}
function firstText(obj, keys){
  for(var i = 0; i < keys.length; i++){
    var v = obj[keys[i]];
    if(typeof v == "string" && v.trim()) return v.trim();
  }
  return "";
}
function publisherOf(item){
  var v = item.source;
  if(typeof v == "string" && v.trim()) return v.trim();
  if(v && typeof v == "object" && typeof v.name == "string" && v.name.trim()) return v.name.trim();
  return "";
}
// Returns an ISO string, or "" when the time is missing or ambiguous.
export function parseNewsTime(v){
  var ms = null;
  if(typeof v == "number" && isFinite(v)) ms = v < 1e11 ? v * 1000 : v;
  else if(typeof v == "string" && v.trim()){
    var s = v.trim();
    if(/^\d{9,13}$/.test(s)){ var n = Number(s); ms = n < 1e11 ? n * 1000 : n; }
    else if(/(Z|[+-]\d{2}:?\d{2}|GMT|UTC)$/i.test(s)){ var t = Date.parse(s); if(isFinite(t)) ms = t; }
  }
  if(ms == null || !isFinite(ms) || ms <= 0) return "";
  return new Date(ms).toISOString();
}
export function normalizeNews(json, limit){
  var list = pickList(json);
  var out = [], seen = {};
  var max = limit || 30;
  for(var i = 0; i < list.length && out.length < max; i++){
    var it = list[i];
    if(!it || typeof it != "object") continue;
    var title = firstText(it, ["title", "headline"]);
    if(!title) continue;
    var link = firstText(it, ["url", "link", "article_url"]);
    if(!/^https?:\/\//i.test(link)) link = "";
    var key = title.toLowerCase() + "|" + link;
    if(seen[key]) continue;
    seen[key] = 1;
    var rawTime = it.pub_date != null ? it.pub_date : it.pubDate != null ? it.pubDate : it.published_at != null ? it.published_at : it.published != null ? it.published : it.date;
    out.push({ title: title, link: link, pubDate: parseNewsTime(rawTime), source: publisherOf(it) });
  }
  return out;
}

// Commodities.
export function getCommodities(){ return getJSON("/commodities"); }

function normList(arr){
  if(!arr || !arr.length) return [];
  return arr.map(function(s){
    var pct = parseFloat(s.percent_change || 0);
    return {
      sym: s.ticker_id || s.company_name || "",
      name: s.company_name || "",
      ltp: parseFloat(s.price || 0),
      chgPct: Math.abs(pct),
      up: pct >= 0,
      volume: s.volume || "",
      high: s.high || "", low: s.low || ""
    };
  });
}
