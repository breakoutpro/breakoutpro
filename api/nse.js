// api/nse.js — Vercel Serverless NSE India Proxy
// Upload to: api/nse.js (repo ROOT folder)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { endpoint, symbol } = req.query;
  const NSE = "https://www.nseindia.com";

  const URLS = {
    "indices":          "/api/allIndices",
    "nifty50":          "/api/allIndices",
    "marketstatus":     "/api/marketStatus",
    "quote":            `/api/quote-equity?symbol=${encodeURIComponent(symbol||"RELIANCE")}`,
    "optionchain":      `/api/option-chain-indices?symbol=${encodeURIComponent(symbol||"NIFTY")}`,
    "optionchainstock": `/api/option-chain-equities?symbol=${encodeURIComponent(symbol||"RELIANCE")}`,
    "gainers":          "/api/live-analysis-variations?index=gainers&limit=10",
    "losers":           "/api/live-analysis-variations?index=loosers&limit=10",
    "mostactive":       "/api/live-analysis-variations?index=mostactive&limit=10",
    "fiidii":           "/api/fiidiiTradeReact",
    "banknifty":        "/api/equity-stockIndices?index=NIFTY%20BANK",
    "niftynext50":      "/api/equity-stockIndices?index=NIFTY%20NEXT%2050",
    "midcap":           "/api/equity-stockIndices?index=NIFTY%20MIDCAP%20100",
    "smallcap":         "/api/equity-stockIndices?index=NIFTY%20SMALLCAP%20100",
    "holidays":         "/api/holiday-master?type=trading",
  };

  const path = URLS[endpoint];
  if (!path) {
    return res.status(400).json({ error: "Invalid endpoint", available: Object.keys(URLS) });
  }

  const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.nseindia.com/",
    "Origin": "https://www.nseindia.com",
    "Connection": "keep-alive",
    "Cache-Control": "no-cache",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
  };

  try {
    // Step 1: Get NSE session cookies
    const cookieResp = await fetch("https://www.nseindia.com/", { headers: HEADERS });
    const cookies = cookieResp.headers.get("set-cookie") || "";

    // Step 2: Fetch data with cookies
    const dataResp = await fetch(NSE + path, {
      headers: { ...HEADERS, "Cookie": cookies },
    });

    if (!dataResp.ok) {
      return res.status(dataResp.status).json({
        error: `NSE ${dataResp.status}`,
        message: "NSE temporarily unavailable",
      });
    }

    const data = await dataResp.json();
    res.setHeader("Cache-Control", "public, s-maxage=5, stale-while-revalidate=10");
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Proxy error", message: error.message });
  }
}
