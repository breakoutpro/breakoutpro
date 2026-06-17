export const config = { runtime: "edge" };

export default async function handler(req) {
  var url = new URL(req.url);
  var symbols = url.searchParams.get("symbols") || "^NSEI";

  try {
    var r = await fetch(
      "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + encodeURIComponent(symbols),
      { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }, signal: AbortSignal.timeout(8000) }
    );

    if (r.ok) {
      var data = await r.json();
      var rows = (data && data.quoteResponse && data.quoteResponse.result) || [];
      var results = rows.map(function(q) {
        return {
          symbol: q.symbol,
          regularMarketPrice: q.regularMarketPrice || 0,
          regularMarketChange: q.regularMarketChange || 0,
          regularMarketChangePercent: q.regularMarketChangePercent || 0,
          regularMarketPreviousClose: q.regularMarketPreviousClose || 0,
          regularMarketDayHigh: q.regularMarketDayHigh || 0,
          regularMarketDayLow: q.regularMarketDayLow || 0,
          regularMarketVolume: q.regularMarketVolume || 0,
          marketState: q.marketState || "CLOSED",
        };
      });

      return new Response(JSON.stringify({ quoteResponse: { result: results, error: null } }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=15",
        },
      });
    }

    return new Response(JSON.stringify({ quoteResponse: { result: [], error: "Yahoo returned " + r.status } }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, quoteResponse: { result: [], error: e.message } }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
