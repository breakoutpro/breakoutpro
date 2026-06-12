export default async function handler(req, res) {
  var path = req.query.path || "marketStatus";
  var url = "https://www.nseindia.com/api/" + path;
  
  // Add query params if any (except 'path')
  var params = [];
  Object.keys(req.query).forEach(function(k) {
    if (k != "path") params.push(k + "=" + encodeURIComponent(req.query[k]));
  });
  if (params.length > 0) url += "?" + params.join("&");

  try {
    // First get NSE cookie
    var cookieRes = await fetch("https://www.nseindia.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
      }
    });
    var cookies = cookieRes.headers.get("set-cookie") || "";

    // Then fetch the actual API
    var apiRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.nseindia.com/",
        "Origin": "https://www.nseindia.com",
        "Connection": "keep-alive",
        "Cookie": cookies,
        "X-Requested-With": "XMLHttpRequest",
      }
    });

    if (!apiRes.ok) {
      throw new Error("NSE returned " + apiRes.status);
    }

    var data = await apiRes.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.json(data);

  } catch (e) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ 
      error: "NSE fetch failed", 
      message: e.message,
      fallback: true
    });
  }
}
