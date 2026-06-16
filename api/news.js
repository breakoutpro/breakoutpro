export const config = { runtime: "edge" };

var FEEDS = [
  "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms",
  "https://www.moneycontrol.com/rss/marketreports.xml",
  "https://www.livemint.com/rss/markets",
];

function parseXmlItems(xml) {
  var items = [];
  var itemBlocks = xml.split(/<item[\s>]/i).slice(1);

  for (var i = 0; i < Math.min(itemBlocks.length, 15); i++) {
    var block = itemBlocks[i];
    var titleMatch = block.match(/<title>([\s\S]*?)<\/title>/i);
    var linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i);
    var dateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);

    var title = titleMatch ? titleMatch[1].replace("<![CDATA[", "").replace("]]>", "").trim() : "";
    var link = linkMatch ? linkMatch[1].replace("<![CDATA[", "").replace("]]>", "").trim() : "";
    var pubDate = dateMatch ? dateMatch[1].trim() : "";

    if (title && title.length > 5) {
      items.push({ title: title, link: link, pubDate: pubDate });
    }
  }
  return items;
}

export default async function handler(req) {
  var debugInfo = [];

  for (var f = 0; f < FEEDS.length; f++) {
    try {
      var res = await fetch(FEEDS[f], {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/rss+xml, application/xml, text/xml, */*",
        },
      });

      debugInfo.push({ feed: FEEDS[f], status: res.status });

      if (res.ok) {
        var xml = await res.text();
        var items = parseXmlItems(xml);

        if (items.length > 0) {
          return new Response(JSON.stringify({ items: items, source: FEEDS[f], debug: debugInfo }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=120",
            },
          });
        }
      }
    } catch (e) {
      debugInfo.push({ feed: FEEDS[f], error: e.message });
    }
  }

  return new Response(JSON.stringify({ items: [], debug: debugInfo }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
