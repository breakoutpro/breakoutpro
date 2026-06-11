export default async function handler(req, res) {
  var path = req.query.path || "marketStatus";
  var baseUrl = "https://www.nseindia.com/api/" + path;
  try {
    var response = await fetch(baseUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.nseindia.com/",
      },
    });
    var data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=60");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "NSE fetch failed", message: e.message });
  }
}
