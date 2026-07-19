export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    var url = new URL(req.url);
    var symbols = url.searchParams.get("symbols") || "NSE_INDEX|Nifty 50,NSE_INDEX|Nifty Bank";
    var token = process.env.UPSTOX_ACCESS_TOKEN || "";

    if (!token) {
      return new Response(JSON.stringify({error: "No access token"}), {
        status: 401,
        headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}
      });
    }

    var upstoxUrl = "https://api.upstox.com/v2/market-quote/ltp?symbol=" + encodeURIComponent(symbols);

    var res = await fetch(upstoxUrl, {
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json",
      }
    });

    var data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=5",
      }
    });
  } catch(e) {
    return new Response(JSON.stringify({error: e.message}), {
      status: 500,
      headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}
    });
  }
}
