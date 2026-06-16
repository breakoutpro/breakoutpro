export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    var rssUrl = "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms";

    var res = await fetch(rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    var xml = await res.text();
    var items = [];
    var itemBlocks = xml.split("<item>").slice(1);

    for (var i = 0; i < Math.min(itemBlocks.length, 15); i++) {
      var block = itemBlocks[i];
      var titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
      var linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
      var dateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

      var title = titleMatch ? titleMatch[1].replace("<![CDATA[", "").replace("]]>", "").trim() : "";
      var link = linkMatch ? linkMatch[1].replace("<![CDATA[", "").replace("]]>", "").trim() : "";
      var pubDate = dateMatch ? dateMatch[1].trim() : "";

      if (title) {
        items.push({ title: title, link: link, pubDate: pubDate });
      }
    }

    return new Response(JSON.stringify({ items: items }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=120",
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ items: [], error: e.message }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
