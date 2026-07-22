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
