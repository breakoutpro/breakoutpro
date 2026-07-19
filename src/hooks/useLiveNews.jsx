import { useState, useEffect } from "react";

var POSITIVE_WORDS = ["surge","rally","gain","jump","rise","up","high","beat","strong","profit","growth","positive","bullish","buy","upgrade","record","outperform","soar","boost","recovery","cut rate","rate cut","approval","expansion"];
var NEGATIVE_WORDS = ["fall","drop","crash","decline","loss","down","low","miss","weak","cut","negative","bearish","sell","downgrade","slump","plunge","concern","risk","fraud","probe","penalty","ban","tax hike","rate hike"];

var STOCK_KEYWORDS = ["RELIANCE","TCS","HDFC","ICICI","INFY","SBI","TATA","WIPRO","AXIS","ADANI","ITC","NIFTY","SENSEX","BANKNIFTY","MARUTI","SUNPHARMA","BAJAJ","KOTAK","HCL","TITAN","ONGC","NTPC","POWERGRID","ULTRATECH","ASIANPAINT","NESTLE","HINDUNILVR"];

function classifySentiment(title) {
  if (!title || typeof title != "string") return "neutral";
  var t = title.toLowerCase();
  var posScore = 0, negScore = 0;
  for (var i = 0; i < POSITIVE_WORDS.length; i++) {
    if (t.indexOf(POSITIVE_WORDS[i]) != -1) posScore++;
  }
  for (var j = 0; j < NEGATIVE_WORDS.length; j++) {
    if (t.indexOf(NEGATIVE_WORDS[j]) != -1) negScore++;
  }
  if (posScore > negScore) return "good";
  if (negScore > posScore) return "bad";
  return "neutral";
}

function extractStock(title) {
  if (!title || typeof title != "string") return null;
  var upper = title.toUpperCase();
  for (var i = 0; i < STOCK_KEYWORDS.length; i++) {
    if (upper.indexOf(STOCK_KEYWORDS[i]) != -1) return STOCK_KEYWORDS[i];
  }
  return null;
}

function parseItems(data) {
  if (!data || !data.items || !Array.isArray(data.items)) return [];
  return data.items.slice(0, 20).filter(function(item){ return item && item.title; }).map(function(item) {
    var pub = item.pubDate ? new Date(item.pubDate) : new Date();
    var pubValid = pub instanceof Date && !isNaN(pub.getTime());
    if (!pubValid) pub = new Date();
    var diffMin = Math.floor((Date.now() - pub.getTime()) / 60000);
    var timeStr = diffMin < 0 ? "Just now" : diffMin < 60 ? diffMin + "m ago" : diffMin < 1440 ? Math.floor(diffMin/60) + "h ago" : Math.floor(diffMin/1440) + "d ago";
    var sentiment = classifySentiment(item.title);
    var stock = extractStock(item.title);
    return {
      title: item.title,
      link: item.link || "",
      time: timeStr,
      source: "ET Markets",
      pubDate: timeStr,
      pubDateRaw: item.pubDate || null,
      cat: "Markets",
      sentiment: sentiment,
      stock: stock,
      up: sentiment != "bad",
    };
  });
}

function isOvernight(pubDateRaw) {
  if (!pubDateRaw) return false;
  var pub = new Date(pubDateRaw);
  if (isNaN(pub.getTime())) return false;
  var now = new Date();
  var pubHour = pub.getHours();
  var nowHour = now.getHours();
  var nowMin = now.getMinutes();
  var nowMins = nowHour*60 + nowMin;
  if (nowMins >= 9*60) return false;
  var hoursAgo = (now.getTime() - pub.getTime()) / 3600000;
  return hoursAgo <= 18 && (pubHour >= 21 || pubHour < 9);
}

export function useLiveNews() {
  var [news, setNews] = useState([]);
  var [loading, setLoading] = useState(true);
  var [lastFetch, setLastFetch] = useState(null);
  var [error, setError] = useState("");

  function fetchNews() {
    setLoading(true);
    setError("");
    fetch("/api/news")
      .then(function(r) {
        if (!r.ok) throw new Error("API returned " + r.status);
        return r.json();
      })
      .then(function(data) {
        var parsed = parseItems(data);
        if (parsed.length > 0) {
          setNews(parsed);
          setLastFetch(new Date());
        } else {
          setError("No news items returned");
        }
        setLoading(false);
      })
      .catch(function(e) {
        setError(e && e.message ? e.message : "Failed to load news");
        setLoading(false);
      });
  }

  useEffect(function() {
    fetchNews();
    var t = setInterval(fetchNews, 120000);
    return function() { clearInterval(t); };
  }, []);

  var overnightNews = news.filter(function(n) { return isOvernight(n.pubDateRaw); });

  return { news: news, overnightNews: overnightNews, loading: loading, lastFetch: lastFetch, error: error, refresh: fetchNews };
}

