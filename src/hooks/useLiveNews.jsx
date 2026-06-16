import { useState, useEffect } from "react";

var ET_FEED = "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms";

function parseRss2Json(data) {
  if (!data || !data.items) return [];
  return data.items.slice(0, 15).map(function(item) {
    var pub = new Date(item.pubDate);
    var diffMin = Math.floor((Date.now() - pub.getTime()) / 60000);
    var timeStr = diffMin < 60 ? diffMin + "m ago" : diffMin < 1440 ? Math.floor(diffMin/60) + "h ago" : Math.floor(diffMin/1440) + "d ago";
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

  function fetchNews() {
    setLoading(true);
    var url = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(ET_FEED);
    fetch(url)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var parsed = parseRss2Json(data);
        if (parsed.length > 0) {
          setNews(parsed);
          setLastFetch(new Date());
        }
        setLoading(false);
      })
      .catch(function() {
        setLoading(false);
      });
  }

  useEffect(function() {
    fetchNews();
    var t = setInterval(fetchNews, 120000);
    return function() { clearInterval(t); };
  }, []);

  return { news: news, loading: loading, lastFetch: lastFetch, refresh: fetchNews };
}
