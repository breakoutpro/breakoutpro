export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");

  var API_KEY = process.env.UPSTOX_API_KEY || "";
  var ACCESS_TOKEN = process.env.UPSTOX_ACCESS_TOKEN || "";
  var type = req.query.type || "indices";

  // No credentials - return fallback
  if (!API_KEY && !ACCESS_TOKEN) {
    res.status(200).json({ success: false, error: "No credentials", fallback: true });
    return;
  }

  var INDEX_SYMS = "NSE_INDEX%7CNifty%2050,NSE_INDEX%7CNifty%20Bank,NSE_INDEX%7CNifty%20Midcap%2050,BSE_INDEX%7CSENSEX";
  var STOCK_SYMS = "NSE_EQ%7CRELIANCE,NSE_EQ%7CTCS,NSE_EQ%7CHDFCBANK,NSE_EQ%7CICICIBANK,NSE_EQ%7CINFY,NSE_EQ%7CWIPRO,NSE_EQ%7CTATAMOTORS,NSE_EQ%7CSBIN,NSE_EQ%7CAXISBANK,NSE_EQ%7CBAJFINANCE,NSE_EQ%7CMARUTI,NSE_EQ%7CSUNPHARMA";

  var symbols = type == "stocks" ? STOCK_SYMS : INDEX_SYMS;
  var url = "https://api.upstox.com/v2/market-quote/ltp?symbol=" + symbols;

  var authHeader = ACCESS_TOKEN ? ("Bearer " + ACCESS_TOKEN) : ("Bearer " + API_KEY);

  try {
    var response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Api-Version": "2.0",
        "Authorization": authHeader,
      }
    });

    if (!response.ok) {
      throw new Error("Upstox " + response.status);
    }

    var data = await response.json();
    var quotes = data.data || {};

    var result = Object.keys(quotes).map(function(key) {
      var q = quotes[key];
      var sym = key.split("|")[1] || key.split(":")[1] || key;
      return {
        symbol: sym,
        name: sym,
        price: parseFloat((q.last_price || 0).toFixed(2)),
        changePct: 0,
        up: true,
      };
    }).filter(function(r){ return r.price > 0; });

    res.json({ success: true, data: result, source: "upstox", timestamp: Date.now() });

  } catch (e) {
    res.status(200).json({ success: false, error: e.message, fallback: true });
  }
}
