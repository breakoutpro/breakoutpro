export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");

  var API_KEY = process.env.UPSTOX_API_KEY || "";

  if (!API_KEY) {
    res.status(500).json({ success: false, error: "API key not configured" });
    return;
  }

  var type = req.query.type || "indices";

  // Upstox instrument symbols
  var INDEX_SYMBOLS = "NSE_INDEX|Nifty 50,NSE_INDEX|Nifty Bank,NSE_INDEX|Nifty Midcap 50,BSE_INDEX|SENSEX";
  var STOCK_SYMBOLS = "NSE_EQ|RELIANCE,NSE_EQ|TCS,NSE_EQ|HDFCBANK,NSE_EQ|ICICIBANK,NSE_EQ|INFY,NSE_EQ|WIPRO,NSE_EQ|TATAMOTORS,NSE_EQ|SBIN,NSE_EQ|AXISBANK,NSE_EQ|BAJFINANCE,NSE_EQ|MARUTI,NSE_EQ|SUNPHARMA,NSE_EQ|LT,NSE_EQ|NTPC,NSE_EQ|ONGC,NSE_EQ|ITC,NSE_EQ|HINDUNILVR,NSE_EQ|KOTAKBANK,NSE_EQ|ADANIENT,NSE_EQ|ASIANPAINT";

  var symbols = encodeURIComponent(type == "stocks" ? STOCK_SYMBOLS : INDEX_SYMBOLS);
  var url = "https://api.upstox.com/v2/market-quote/ltp?symbol=" + symbols;

  try {
    var response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Api-Version": "2.0",
        "Authorization": "Bearer " + API_KEY,
      }
    });

    if (!response.ok) {
      var errText = await response.text();
      throw new Error("Upstox " + response.status + ": " + errText.slice(0, 100));
    }

    var data = await response.json();
    var quotes = data.data || {};

    var result = Object.keys(quotes).map(function(key) {
      var q = quotes[key];
      var sym = key.replace("NSE_EQ:", "").replace("NSE_INDEX:", "").replace("BSE_INDEX:", "");
      return {
        symbol: sym,
        name: sym,
        price: parseFloat((q.last_price || 0).toFixed(2)),
        change: 0,
        changePct: 0,
        key: key,
      };
    });

    res.json({ success: true, data: result, source: "upstox", timestamp: Date.now() });

  } catch (e) {
    res.status(500).json({ success: false, error: e.message, fallback: true });
  }
}

