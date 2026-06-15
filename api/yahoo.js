export const config = { runtime: "edge" };

var STOCK_DATA = {
  "RELIANCE.NS": 2845, "TCS.NS": 3654, "HDFCBANK.NS": 1742,
  "ICICIBANK.NS": 1289, "INFY.NS": 1567, "SBIN.NS": 812,
  "^NSEI": 23969, "^BSESN": 76692, "^NSEBANK": 52134,
};

export default async function handler(req) {
  var url = new URL(req.url);
  var symbols = url.searchParams.get("symbols") || "^NSEI";
  var symList = symbols.split(",");

  try {
    // Try Yahoo Finance v8 API
    var results = [];
    for (var i = 0; i < symList.length; i++) {
      var sym = symList[i].trim();
      try {
        var r = await fetch(
          "https://query1.finance.yahoo.com/v8/finance/chart/" + sym + "?interval=1m&range=1d",
          { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }, signal: AbortSignal.timeout(3000) }
        );
        if (r.ok) {
          var d = await r.json();
          var meta = d && d.chart && d.chart.result && d.chart.result[0] && d.chart.result[0].meta;
          if (meta) {
            var prev = meta.chartPreviousClose || meta.previousClose || 0;
            var curr = meta.regularMarketPrice || meta.price || 0;
            results.push({
              symbol: sym,
              regularMarketPrice: curr,
              regularMarketChange: curr - prev,
              regularMarketChangePercent: prev > 0 ? ((curr-prev)/prev*100) : 0,
              regularMarketPreviousClose: prev,
              regularMarketDayHigh: meta.regularMarketDayHigh || curr,
              regularMarketDayLow: meta.regularMarketDayLow || curr,
              regularMarketVolume: meta.regularMarketVolume || 0,
              marketState: meta.marketState || "CLOSED",
            });
          }
        }
      } catch(e2) {
        // Individual symbol failed - use fallback
        results.push({symbol: sym, regularMarketPrice: STOCK_DATA[sym]||0, error: e2.message});
      }
    }

    return new Response(JSON.stringify({
      quoteResponse: { result: results, error: null }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=15",
      }
    });
  } catch(e) {
    return new Response(JSON.stringify({error: e.message, quoteResponse:{result:[], error:e.message}}), {
      status: 200,
      headers: {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}
    });
  }
}
