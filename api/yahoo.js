export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");

  var type = req.query.type || "indices";

  // Symbols mapping
  var INDICES_SYMBOLS = "^NSEI,^BSESN,^NSEBANK,NIFTY_MIDCAP50.NS";
  var STOCKS_SYMBOLS = "RELIANCE.NS,TCS.NS,HDFCBANK.NS,ICICIBANK.NS,INFY.NS,WIPRO.NS,TATAMOTORS.NS,SBIN.NS,AXISBANK.NS,BAJFINANCE.NS,MARUTI.NS,SUNPHARMA.NS,LT.NS,NTPC.NS,ONGC.NS,ADANIENT.NS,HINDUNILVR.NS,ITC.NS,KOTAKBANK.NS,ASIANPAINT.NS";

  var symbols = type == "stocks" ? STOCKS_SYMBOLS : INDICES_SYMBOLS;
  var url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + symbols + "&fields=symbol,shortName,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,fiftyTwoWeekHigh,fiftyTwoWeekLow";

  try {
    var response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      }
    });

    if (!response.ok) {
      throw new Error("Yahoo returned " + response.status);
    }

    var data = await response.json();
    var quotes = (data.quoteResponse && data.quoteResponse.result) || [];

    var result = quotes.map(function(q) {
      return {
        symbol: q.symbol,
        name: q.shortName || q.symbol,
        price: parseFloat((q.regularMarketPrice || 0).toFixed(2)),
        change: parseFloat((q.regularMarketChange || 0).toFixed(2)),
        changePct: parseFloat((q.regularMarketChangePercent || 0).toFixed(2)),
        open: q.regularMarketOpen || 0,
        high: q.regularMarketDayHigh || 0,
        low: q.regularMarketDayLow || 0,
        high52: q.fiftyTwoWeekHigh || 0,
        low52: q.fiftyTwoWeekLow || 0,
        volume: q.regularMarketVolume || 0,
      };
    });

    res.json({ success: true, data: result, timestamp: Date.now() });

  } catch (e) {
    res.status(500).json({ success: false, error: e.message, fallback: true });
  }
}

