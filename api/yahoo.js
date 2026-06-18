export const config = { runtime: "edge" };

async function fetchOne(sym) {
  try {
    var r = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/" + sym + "?range=1d&interval=1m",
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }, signal: AbortSignal.timeout(7000) }
    );
    if (!r.ok) return null;
    var data = await r.json();
    var result = data && data.chart && data.chart.result && data.chart.result[0];
    if (!result || !result.meta) return null;
    var meta = result.meta;
    var price = meta.regularMarketPrice || 0;
    var prevClose = meta.previousClose || meta.chartPreviousClose || price;
    var change = price - prevClose;
    var changePct = prevClose ? (change / prevClose) * 100 : 0;
    return {
      symbol: sym,
      regularMarketPrice: price,
      regularMarketChange: change,
      regularMarketChangePercent: changePct,
      regularMarketPreviousClose: prevClose,
      regularMarketDayHigh: meta.regularMarketDayHigh || 0,
      regularMarketDayLow: meta.regularMarketDayLow || 0,
      regularMarketVolume: meta.regularMarketVolume || 0,
      marketState: meta.marketState || "CLOSED",
    };
  } catch (e) {
    return null;
  }
}

export default async function handler(req) {
  var url = new URL(req.url);
  var symbolsParam = url.searchParams.get("symbols") || "^NSEI";
  var symbols = symbolsParam.split(",").filter(Boolean).slice(0, 30);

  try {
    var promises = symbols.map(fetchOne);
    var settled = await Promise.all(promises);
    var results = settled.filter(function(r) { return r != null; });

    return new Response(JSON.stringify({ quoteResponse: { result: results, error: results.length == 0 ? "No symbols resolved" : null } }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=15",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, quoteResponse: { result: [], error: e.message } }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}

