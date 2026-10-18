import { useState, useEffect, useRef } from "react";
import { parseItems } from "./newsParse";

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

// A failed refresh keeps the last good headlines for at most this long; after
// that the feed reports "unavailable" instead of showing old items as current.
var KEEP_MS = 10 * 60 * 1000;

export function useLiveNews() {
  var [news, setNews] = useState([]);
  var [loading, setLoading] = useState(true);
  var [lastFetch, setLastFetch] = useState(null);
  var [error, setError] = useState("");
  var lastGoodRef = useRef(0);

  function markUnavailable(msg) {
    setError(msg);
    if (Date.now() - lastGoodRef.current > KEEP_MS) setNews([]);
    setLoading(false);
  }

  function fetchNews() {
    setLoading(true);
    fetch("/api/news")
      .then(function(r) {
        if (!r.ok) throw new Error("API returned " + r.status);
        return r.json();
      })
      .then(function(data) {
        var parsed = parseItems(data);
        if (parsed.length > 0) {
          lastGoodRef.current = Date.now();
          setNews(parsed);
          setLastFetch(new Date());
          setError("");
          setLoading(false);
        } else {
          markUnavailable((data && data.reason) ? data.reason : "no_items");
        }
      })
      .catch(function(e) {
        markUnavailable(e && e.message ? e.message : "request_failed");
      });
  }

  useEffect(function() {
    fetchNews();
    var t = setInterval(fetchNews, 120000);
    return function() { clearInterval(t); };
  }, []);

  var overnightNews = news.filter(function(n) { return isOvernight(n.pubDateRaw); });
  // "loading" only until the first answer; "ok" with headlines; otherwise "unavailable".
  var status = news.length > 0 ? "ok" : (loading && !error ? "loading" : "unavailable");

  return { news: news, overnightNews: overnightNews, loading: loading, lastFetch: lastFetch, error: error, status: status, refresh: fetchNews };
}
