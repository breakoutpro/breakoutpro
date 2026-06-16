import { useState, useEffect } from "react";

function parseItems(data) {
  if (!data || !data.items) return [];
  return data.items.slice(0, 15).map(function(item) {
    var pub = item.pubDate ? new Date(item.pubDate) : new Date();
    var diffMin = Math.floor((Date.now() - pub.getTime()) / 60000);
    var timeStr = diffMin < 0 ? "Just now" : diffMin < 60 ? diffMin + "m ago" : diffMin < 1440 ? Math.floor(diffMin/60) + "h ago" : Math.floor(diffMin/1440) + "d ago";
    return {
      title: item.title,
      link: item.link,
      time: timeStr,
      source: "ET Markets",
      pubDate: timeStr,
      cat: "Markets",
      up: true,
    };
  });
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
      .then(function(r) { return r.json(); })
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
        setError(e.message);
        setLoading(false);
      });
  }

  useEffect(function() {
    fetchNews();
    var t = setInterval(fetchNews, 120000);
    return function() { clearInterval(t); };
  }, []);

  return { news: news, loading: loading, lastFetch: lastFetch, error: error, refresh: fetchNews };
}
