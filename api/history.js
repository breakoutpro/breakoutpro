export const config = { runtime: "edge" };

export default async function handler(req) {
  var url = new URL(req.url);
  var symbol = url.searchParams.get("symbol") || "RELIANCE.NS";
  var range = url.searchParams.get("range") || "1y";
  var interval = url.searchParams.get("interval") || "1d";

  try {
    var r = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/" + symbol + "?range=" + range + "&interval=" + interval,
      { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }, signal: AbortSignal.timeout(8000) }
    );

    if (r.ok) {
      var data = await r.json();
      var result = data && data.chart && data.chart.result && data.chart.result[0];

      if (result) {
        var timestamps = result.timestamp || [];
        var quote = (result.indicators && result.indicators.quote && result.indicators.quote[0]) || {};
        var opens = quote.open || [];
        var highs = quote.high || [];
        var lows = quote.low || [];
        var closes = quote.close || [];
        var volumes = quote.volume || [];

        var candles = [];
        for (var i = 0; i < timestamps.length; i++) {
          if (opens[i] == null || closes[i] == null) continue;
          candles.push({
            time: timestamps[i],
            open: parseFloat(opens[i].toFixed(2)),
            high: parseFloat((highs[i] || opens[i]).toFixed(2)),
            low: parseFloat((lows[i] || opens[i]).toFixed(2)),
            close: parseFloat(closes[i].toFixed(2)),
            volume: volumes[i] || 0,
          });
        }

        var meta = result.meta || {};

        return new Response(JSON.stringify({
          symbol: symbol,
          candles: candles,
          meta: {
            firstTradeDate: meta.firstTradeDate || null,
            currency: meta.currency || "INR",
            exchangeName: meta.exchangeName || "NSI",
            fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || null,
            fiftyTwoWeekLow: meta.fiftyTwoWeekLow || null,
            regularMarketPrice: meta.regularMarketPrice || null,
          },
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=300",
          },
        });
      }
    }

    return new Response(JSON.stringify({ symbol: symbol, candles: [], error: "No data from Yahoo" }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ symbol: symbol, candles: [], error: e.message }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
