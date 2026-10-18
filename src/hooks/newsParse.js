// BreakoutPro - newsParse.js
// Pure helpers for the news feed (no React) so they can be tested.
// Rules: no backtick, no triple-equals, ASCII only.

var POSITIVE_WORDS = ["surge","rally","gain","jump","rise","up","high","beat","strong","profit","growth","positive","bullish","buy","upgrade","record","outperform","soar","boost","recovery","cut rate","rate cut","approval","expansion"];
var NEGATIVE_WORDS = ["fall","drop","crash","decline","loss","down","low","miss","weak","cut","negative","bearish","sell","downgrade","slump","plunge","concern","risk","fraud","probe","penalty","ban","tax hike","rate hike"];

var STOCK_KEYWORDS = ["RELIANCE","TCS","HDFC","ICICI","INFY","SBI","TATA","WIPRO","AXIS","ADANI","ITC","NIFTY","SENSEX","BANKNIFTY","MARUTI","SUNPHARMA","BAJAJ","KOTAK","HCL","TITAN","ONGC","NTPC","POWERGRID","ULTRATECH","ASIANPAINT","NESTLE","HINDUNILVR"];

export function classifySentiment(title) {
  if (!title || typeof title != "string") return "neutral";
  var t = title.toLowerCase();
  var posScore = 0, negScore = 0;
  for (var i = 0; i < POSITIVE_WORDS.length; i++) {
    if (t.indexOf(POSITIVE_WORDS[i]) != -1) posScore++;
  }
  for (var j = 0; j < NEGATIVE_WORDS.length; j++) {
    if (t.indexOf(NEGATIVE_WORDS[j]) != -1) negScore++;
  }
  if (posScore > negScore) return "good";
  if (negScore > posScore) return "bad";
  return "neutral";
}

export function extractStock(title) {
  if (!title || typeof title != "string") return null;
  var upper = title.toUpperCase();
  for (var i = 0; i < STOCK_KEYWORDS.length; i++) {
    if (upper.indexOf(STOCK_KEYWORDS[i]) != -1) return STOCK_KEYWORDS[i];
  }
  return null;
}

// Turns the /api/news response into card items. Only items the provider
// returned with a title are kept. Time is shown only when the provider gave an
// unambiguous time (pubDate is "" otherwise) - it is never replaced by "now".
// The publisher is whatever the provider named (or "" when it named none).
export function parseItems(data) {
  if (!data || data.ok != true || !Array.isArray(data.items)) return [];
  return data.items.slice(0, 20).filter(function(item){ return item && typeof item.title == "string" && item.title.trim(); }).map(function(item) {
    var ms = item.pubDate ? new Date(item.pubDate).getTime() : NaN;
    var hasTime = isFinite(ms);
    var timeStr = "";
    if (hasTime) {
      var diffMin = Math.floor((Date.now() - ms) / 60000);
      timeStr = diffMin < 0 ? "Just now" : diffMin < 60 ? diffMin + "m ago" : diffMin < 1440 ? Math.floor(diffMin/60) + "h ago" : Math.floor(diffMin/1440) + "d ago";
    }
    var sentiment = classifySentiment(item.title);
    var stock = extractStock(item.title);
    return {
      title: item.title,
      link: item.link || "",
      time: timeStr,
      source: item.source || "",
      pubDate: timeStr,
      pubDateRaw: hasTime ? item.pubDate : null,
      cat: "Markets",
      sentiment: sentiment,
      stock: stock,
      up: sentiment != "bad",
    };
  });
}
