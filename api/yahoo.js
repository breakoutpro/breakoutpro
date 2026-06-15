export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    var url = new URL(req.url);
    var symbols = url.searchParams.get("symbols") || "^NSEI,^BSESN,^NSEBANK";

    var yahooUrl = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + symbols + "&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,regularMarketPreviousClose&lang=en-IN&region=IN";

    var res = await fetch(yahooUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      }
    });

    var data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=15",
      }
    });
  } catch(e) {
    return new Response(JSON.stringify({error: e.message}), {
      status: 500,
      headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}
    });
  }
}
