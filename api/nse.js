export const config = { runtime: "edge" };

var BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

var cookieCache = { value: "", timestamp: 0 };

async function getCookies() {
  var now = Date.now();
  if (cookieCache.value && (now - cookieCache.timestamp) < 240000) {
    return cookieCache.value;
  }

  var r = await fetch("https://www.nseindia.com/", {
    headers: {
      "User-Agent": BROWSER_UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(10000),
  });

  var setCookieHeader = r.headers.get("set-cookie") || "";
  var cookies = setCookieHeader.split(",").map(function(c) {
    return c.trim().split(";")[0];
  }).filter(Boolean).join("; ");

  cookieCache = { value: cookies, timestamp: now };
  return cookies;
}

async function safeJson(r, label) {
  var text = await r.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(label + " returned non-JSON (status " + r.status + "): " + text.slice(0, 150));
  }
}

export default async function handler(req) {
  try {
    var url = new URL(req.url);
    var index = url.searchParams.get("index") || "NIFTY 50";
    var symbol = url.searchParams.get("symbol");

    var cookies = await getCookies();

    var endpoint;
    if (symbol) {
      endpoint = "https://www.nseindia.com/api/quote-equity?symbol=" + encodeURIComponent(symbol);
    } else {
      var indexMap = {
        "NIFTY 50": "NIFTY 50",
        "BANKNIFTY": "NIFTY BANK",
        "NIFTYIT": "NIFTY IT",
        "NIFTY500": "NIFTY 500",
      };
      var indexParam = indexMap[index] || "NIFTY 50";
      endpoint = "https://www.nseindia.com/api/equity-stockIndices?index=" + encodeURIComponent(indexParam);
    }

    var res = await fetch(endpoint, {
      headers: {
        "User-Agent": BROWSER_UA,
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.nseindia.com/",
        "Cookie": cookies,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      cookieCache = { value: "", timestamp: 0 };
      return new Response(JSON.stringify({ error: "NSE returned status " + res.status }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    var data = await safeJson(res, "NSE API");

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=10",
      },
    });
  } catch(e) {
    return new Response(JSON.stringify({error: e.message}), {
      status: 200,
      headers: {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}
    });
  }
}
