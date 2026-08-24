export const config = { runtime: "edge" };

// Reuses the exact same real NIFTY 50 constituent symbols already used
// elsewhere in the app (src/data/indexConstituents.js) - not a new list.
// Limited to the first 20 (roughly the highest-weight names in that file)
// to keep total fetch time reasonable; this is a real subset of a real
// index, not an invented watchlist.
var WATCHLIST = [
  "RELIANCE","TCS","HDFCBANK","ICICIBANK","INFY","HINDUNILVR","ITC","SBIN",
  "BHARTIARTL","BAJFINANCE","KOTAKBANK","LT","HCLTECH","AXISBANK","ASIANPAINT",
  "MARUTI","SUNPHARMA","TITAN","ULTRACEMCO","WIPRO"
];

var LOOKBACK_SESSIONS = 15;
var VOLUME_SPIKE_RATIO = 1.5;

async function fetchCandles(sym){
  try{
    var r = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/" + sym + ".NS?range=1mo&interval=1d",
      { headers:{ "User-Agent":"Mozilla/5.0" }, signal: AbortSignal.timeout(7000) }
    );
    if(!r.ok) return null;
    var data = await r.json();
    var result = data && data.chart && data.chart.result && data.chart.result[0];
    if(!result) return null;
    var timestamps = result.timestamp || [];
    var quote = (result.indicators && result.indicators.quote && result.indicators.quote[0]) || {};
    var opens = quote.open || [], highs = quote.high || [], lows = quote.low || [];
    var closes = quote.close || [], volumes = quote.volume || [];
    var candles = [];
    for(var i=0;i<timestamps.length;i++){
      if(closes[i]==null || highs[i]==null || lows[i]==null) continue;
      candles.push({ high:highs[i], low:lows[i], close:closes[i], volume:volumes[i]||0 });
    }
    return candles.length ? { sym:sym, candles:candles } : null;
  }catch(e){ return null; }
}

// Deterministic classification from real, already-fetched candle data only.
// No randomness, no invented numbers - a symbol either has enough real
// history to classify or it is excluded entirely.
function classify(sym, candles){
  if(!candles || candles.length < 6) return null;
  var today = candles[candles.length-1];
  var lookback = candles.slice(0, candles.length-1).slice(-LOOKBACK_SESSIONS);
  if(lookback.length < 5) return null;

  var priorHigh = Math.max.apply(null, lookback.map(function(c){ return c.high; }));
  var priorLow = Math.min.apply(null, lookback.map(function(c){ return c.low; }));
  var avgVol = lookback.reduce(function(s,c){ return s + c.volume; }, 0) / lookback.length;
  var volRatio = avgVol > 0 ? today.volume / avgVol : null;
  var prevClose = lookback[lookback.length-1].close;
  var chgPct = prevClose ? ((today.close - prevClose) / prevClose) * 100 : null;

  var tags = [];
  if(today.close > priorHigh) tags.push("breakout");
  if(today.close < priorLow) tags.push("breakdown");
  if(volRatio!=null && volRatio >= VOLUME_SPIKE_RATIO) tags.push("volspike");
  if(!tags.length) return null;

  return {
    sym: sym,
    ltp: Math.round(today.close*100)/100,
    chgPct: chgPct!=null ? Math.round(chgPct*100)/100 : null,
    priorHigh: Math.round(priorHigh*100)/100,
    priorLow: Math.round(priorLow*100)/100,
    volume: today.volume,
    avgVolume: Math.round(avgVol),
    volRatio: volRatio!=null ? Math.round(volRatio*100)/100 : null,
    tags: tags
  };
}

export default async function handler(req){
  try{
    var settled = await Promise.all(WATCHLIST.map(fetchCandles));
    var results = [];
    for(var i=0;i<settled.length;i++){
      if(!settled[i]) continue;
      var c = classify(settled[i].sym, settled[i].candles);
      if(c) results.push(c);
    }
    return new Response(JSON.stringify({
      ok:true,
      generatedAt: Date.now(),
      scanned: WATCHLIST.length,
      matched: results.length,
      results: results
    }), {
      status:200,
      headers:{
        "Content-Type":"application/json",
        "Access-Control-Allow-Origin":"*",
        "Cache-Control":"public, max-age=60"
      }
    });
  }catch(e){
    return new Response(JSON.stringify({ ok:false, reason:"scanner_error", results:[] }), {
      status:200,
      headers:{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" }
    });
  }
}
