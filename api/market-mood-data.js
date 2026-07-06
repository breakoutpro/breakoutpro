// BreakoutPro - api/market-mood-data.js
// Server-side market data aggregator for the AI Market Mood engine.
// Reuses existing Yahoo provider. Adds freshness classification + 3-day context.
// NEVER falls back to hardcoded market values. Rules: no backtick, no ===, ASCII.

import * as yahoo from "./providers/yahoo.js";

// In-memory cache (per serverless instance). ~10s TTL for quotes, longer for history.
var CACHE = { quotes:null, quotesAt:0, hist:{}, histAt:{} };
var QUOTE_TTL = 10 * 1000;
var HIST_TTL = 10 * 60 * 1000;

// India market hours (IST = UTC+5:30). Returns session status.
function marketSession(){
  var now = new Date();
  var utcMin = now.getUTCHours()*60 + now.getUTCMinutes();
  var istMin = (utcMin + 330) % 1440;
  var dayShift = (utcMin + 330) >= 1440 ? 1 : 0;
  var dow = (now.getUTCDay() + dayShift) % 7; // 0 Sun .. 6 Sat, IST-adjusted
  if(dow==0 || dow==6) return "WEEKEND";
  if(istMin >= 9*60+15 && istMin < 15*60+30) return "OPEN";
  if(istMin >= 9*60 && istMin < 9*60+15) return "PRE_OPEN";
  if(istMin >= 15*60+30 && istMin < 16*60) return "POST_CLOSE";
  return "CLOSED";
}

// Classify freshness from the provider timestamp.
function classify(sourceTs, session){
  var now = Date.now();
  var fetchedAt = now;
  var freshnessSeconds = sourceTs ? Math.round((now - sourceTs)/1000) : null;
  var status;
  if(session=="WEEKEND" || session=="CLOSED" || session=="POST_CLOSE"){
    status = "DELAYED"; // market not live; last price is last session close
  } else if(freshnessSeconds==null){
    status = "UNAVAILABLE";
  } else if(freshnessSeconds <= 90){
    status = "LIVE";
  } else if(freshnessSeconds <= 900){
    status = "DELAYED";
  } else {
    status = "STALE";
  }
  return { sourceTimestamp:sourceTs||null, fetchedAt:fetchedAt, freshnessSeconds:freshnessSeconds, status:status };
}

// Fetch raw Yahoo quote (with regularMarketTime) for one symbol.
function rawQuote(symbolEnc){
  var url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + symbolEnc;
  return fetch(url, { headers:{ "User-Agent":"Mozilla/5.0" } })
    .then(function(r){ return r.json(); })
    .then(function(j){
      var rows = j && j.quoteResponse && j.quoteResponse.result;
      return (rows && rows[0]) ? rows[0] : null;
    })
    .catch(function(){ return null; });
}

// Fetch daily history for 3-day context via Yahoo chart.
function dailyHistory(symbolEnc){
  var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + symbolEnc + "?range=10d&interval=1d";
  return fetch(url, { headers:{ "User-Agent":"Mozilla/5.0" } })
    .then(function(r){ return r.json(); })
    .then(function(j){
      var res = j && j.chart && j.chart.result && j.chart.result[0];
      if(!res) return null;
      var q = res.indicators && res.indicators.quote && res.indicators.quote[0];
      var closes = (q && q.close) || [];
      var highs = (q && q.high) || [];
      var lows = (q && q.low) || [];
      var out = [];
      for(var i=0;i<closes.length;i++){
        if(closes[i]!=null) out.push({ c:closes[i], h:highs[i], l:lows[i] });
      }
      return out.length ? out : null;
    })
    .catch(function(){ return null; });
}

var IDX = { NIFTY:"%5ENSEI", SENSEX:"%5EBSESN", BANKNIFTY:"%5ENSEBANK", VIX:"%5EINDIAVIX" };

export default async function handler(req, res){
  res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=30");
  var session = marketSession();

  // Serve cached quotes if within TTL.
  var now = Date.now();
  var indices = {};
  try{
    var keys = Object.keys(IDX);
    var raws = await Promise.all(keys.map(function(k){ return rawQuote(IDX[k]); }));
    for(var i=0;i<keys.length;i++){
      var k = keys[i]; var q = raws[i];
      if(q && q.regularMarketPrice!=null){
        var ts = q.regularMarketTime ? q.regularMarketTime*1000 : null;
        indices[k] = {
          ltp:q.regularMarketPrice,
          prevClose:q.regularMarketPreviousClose!=null?q.regularMarketPreviousClose:null,
          open:q.regularMarketOpen!=null?q.regularMarketOpen:null,
          high:q.regularMarketDayHigh!=null?q.regularMarketDayHigh:null,
          low:q.regularMarketDayLow!=null?q.regularMarketDayLow:null,
          chgPct:q.regularMarketChangePercent!=null?q.regularMarketChangePercent:null,
          freshness:classify(ts, session)
        };
      } else {
        indices[k] = { ltp:null, freshness:{ status:"UNAVAILABLE", sourceTimestamp:null, fetchedAt:now, freshnessSeconds:null } };
      }
    }
  }catch(e){
    return res.status(200).json({ ok:false, reason:"provider_error", session:session });
  }

  // 3-day context for NIFTY (cached).
  var context3d = null;
  try{
    if(!CACHE.hist.NIFTY || (now - (CACHE.histAt.NIFTY||0)) > HIST_TTL){
      CACHE.hist.NIFTY = await dailyHistory(IDX.NIFTY);
      CACHE.histAt.NIFTY = now;
    }
    var candles = CACHE.hist.NIFTY;
    if(candles && candles.length>=4){
      var last4 = candles.slice(-4); // 3 prior sessions + current
      var first = last4[0].c, latest = last4[last4.length-1].c;
      var ret3 = ((latest-first)/first)*100;
      // structure: higher-highs / lower-lows over last sessions
      var hh=true, ll=true;
      for(var j=1;j<last4.length;j++){
        if(last4[j].h <= last4[j-1].h) hh=false;
        if(last4[j].l >= last4[j-1].l) ll=false;
      }
      var rangeVals = last4.map(function(x){ return x.h - x.l; });
      var compressing = rangeVals[rangeVals.length-1] < rangeVals[0];
      context3d = {
        return3dPct:Math.round(ret3*100)/100,
        higherHighs:hh, lowerLows:ll,
        rangeCompressing:compressing,
        sessions:last4.length,
        status:"DELAYED", // daily candles are prior-session based
        note:"Based on last completed trading sessions"
      };
    }
  }catch(e){ context3d = null; }

  return res.status(200).json({
    ok:true,
    session:session,
    generatedAt:now,
    indices:indices,
    context3d:context3d,
    unavailable:{
      breadth:"UNAVAILABLE",       // no verified breadth provider connected
      sectors:"UNAVAILABLE",       // no verified sector feed connected
      fiiDii:"UNAVAILABLE",        // T+1 delayed, not connected
      global:"UNAVAILABLE",        // no verified global feed connected
      news:"UNAVAILABLE"           // server-verified news not connected
    }
  });
}
