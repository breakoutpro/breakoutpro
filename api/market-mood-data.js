// BreakoutPro - api/market-mood-data.js
// Server-side market data aggregator for the AI Market Mood engine.
// Adds freshness classification, 3-day context, global markets, sector
// performance and VIX history. NEVER falls back to hardcoded market values.
// Rules: no backtick, no ===, ASCII.

// In-memory cache (per warm serverless instance only - best effort, not
// guaranteed across invocations). Different TTLs per data type: core
// Indian indices refresh fast (matches the 10s client poll), global/sector
// quotes are moderate (they do not need per-10s freshness), history/VIX
// history are long (daily-candle data, rarely changes intra-session).
var CACHE = { quotes:null, quotesAt:0, global:null, globalAt:0, sectors:null, sectorsAt:0, hist:{}, histAt:{} };
var QUOTE_TTL = 10 * 1000;
var MODERATE_TTL = 60 * 1000;
var HIST_TTL = 10 * 60 * 1000;
var UPSTREAM_TIMEOUT = 5000;

// fetch wrapped with a hard timeout so one slow provider never blocks the
// whole response. Resolves to null on timeout/abort/error instead of hanging.
function fetchWithTimeout(url){
  var ctrl = null, timer = null;
  try{ ctrl = new AbortController(); }catch(e){ ctrl = null; }
  var opts = { headers:{ "User-Agent":"Mozilla/5.0" } };
  if(ctrl) opts.signal = ctrl.signal;
  if(ctrl){ timer = setTimeout(function(){ try{ ctrl.abort(); }catch(e){} }, UPSTREAM_TIMEOUT); }
  return fetch(url, opts)
    .then(function(r){ if(timer) clearTimeout(timer); return r.json(); })
    .catch(function(){ if(timer) clearTimeout(timer); return null; });
}

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

// Classify freshness for CORE Indian indices - session-aware (a previous
// close during Indian market-closed hours is honestly DELAYED, not STALE).
function classify(sourceTs, session){
  var now = Date.now();
  var freshnessSeconds = sourceTs ? Math.round((now - sourceTs)/1000) : null;
  var status;
  if(session=="WEEKEND" || session=="CLOSED" || session=="POST_CLOSE"){
    status = "DELAYED";
  } else if(freshnessSeconds==null){
    status = "UNAVAILABLE";
  } else if(freshnessSeconds <= 90){
    status = "LIVE";
  } else if(freshnessSeconds <= 900){
    status = "DELAYED";
  } else {
    status = "STALE";
  }
  return { sourceTimestamp:sourceTs||null, fetchedAt:now, freshnessSeconds:freshnessSeconds, status:status };
}

// Classify freshness for GLOBAL/SECTOR quotes - time-based only. No
// per-market session engine is built here (out of scope for this step), so
// thresholds are widened to avoid mislabeling a legitimate last-close price
// (e.g. Dow Jones overnight while NSE is open) as STALE. Anything older
// than 6 hours is genuinely old and honestly marked STALE.
function classifyGeneric(sourceTs){
  if(sourceTs==null) return "UNAVAILABLE";
  var ageSec = Math.round((Date.now() - sourceTs)/1000);
  if(ageSec <= 900) return "LIVE";
  if(ageSec <= 21600) return "DELAYED";
  return "STALE";
}

// Single batched Yahoo quote request for any list of raw ticker symbols.
// Returns a map keyed by the RAW (unencoded) symbol string. Never throws -
// resolves to {} on any failure so partial success stays possible.
function fetchQuoteBatch(symbols){
  if(!symbols || !symbols.length) return Promise.resolve({});
  var joined = symbols.map(function(s){ return encodeURIComponent(s); }).join(",");
  var url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + joined;
  return fetchWithTimeout(url).then(function(j){
    var rows = (j && j.quoteResponse && j.quoteResponse.result) || [];
    var map = {};
    for(var i=0;i<rows.length;i++){
      if(rows[i] && rows[i].symbol) map[rows[i].symbol] = rows[i];
    }
    return map;
  });
}

// Fetch daily history (closes/highs/lows) for one symbol via Yahoo chart.
function dailyHistory(symbolEnc){
  var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + symbolEnc + "?range=10d&interval=1d";
  return fetchWithTimeout(url).then(function(j){
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
  });
}

var IDX = { NIFTY:"^NSEI", SENSEX:"^BSESN", BANKNIFTY:"^NSEBANK", VIX:"^INDIAVIX" };
var IDX_ENC = { NIFTY:"%5ENSEI", SENSEX:"%5EBSESN", BANKNIFTY:"%5ENSEBANK", VIX:"%5EINDIAVIX" }; // for chart endpoint

// Global indices relevant as overnight/global-cue reference. No GIFT Nifty
// symbol here - there is no verified, reliable public Yahoo ticker for it.
var GLOBAL_SYMS = {
  "Dow Jones":"^DJI", "Nasdaq":"^IXIC", "Nikkei 225":"^N225",
  "Hang Seng":"^HSI", "Crude Oil (WTI)":"CL=F", "Dollar Index":"DX-Y.NYB"
};

// NSE sector indices. Distinct from core indices (no Bank Nifty duplicate -
// that already lives in the core group as an owned index, not a sector).
var SECTOR_SYMS = {
  "IT":"^CNXIT", "Auto":"^CNXAUTO", "Pharma":"^CNXPHARMA",
  "FMCG":"^CNXFMCG", "Metal":"^CNXMETAL", "Realty":"^CNXREALTY"
};

// Build a generic {status, items[]} group from a symbol map + quote map.
// Honest partial success: PARTIAL if some symbols resolved and some did
// not, UNAVAILABLE if none did, otherwise the worst freshness among items.
var SEVERITY = { LIVE:0, DELAYED:1, STALE:2 };
function buildGroup(symMap, quoteMap){
  var items = [], have = 0, total = 0, worst = "LIVE";
  for(var name in symMap){
    if(!symMap.hasOwnProperty(name)) continue;
    total++;
    var raw = quoteMap[symMap[name]];
    if(raw && raw.regularMarketPrice!=null){
      have++;
      var ts = raw.regularMarketTime ? raw.regularMarketTime*1000 : null;
      var fresh = classifyGeneric(ts);
      if(SEVERITY[fresh] > SEVERITY[worst]) worst = fresh;
      var chg = raw.regularMarketChangePercent!=null ? Math.round(raw.regularMarketChangePercent*100)/100 : null;
      items.push({ name:name, chgPct:chg, up: chg!=null ? chg>=0 : null, freshness:fresh });
    }
  }
  var status;
  if(have==0) status = "UNAVAILABLE";
  else if(have<total) status = "PARTIAL";
  else status = worst;
  return { status:status, items:items };
}

export default async function handler(req, res){
  res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=30");
  var session = marketSession();
  var now = Date.now();

  // --- CORE Indian indices: batched single request, cached raw for QUOTE_TTL,
  // freshness always recomputed fresh at request time (never frozen stale). ---
  var indices = {};
  try{
    if(!CACHE.quotes || (now - CACHE.quotesAt) >= QUOTE_TTL){
      CACHE.quotes = await fetchQuoteBatch([IDX.NIFTY, IDX.SENSEX, IDX.BANKNIFTY, IDX.VIX]);
      CACHE.quotesAt = now;
    }
    var qmap = CACHE.quotes || {};
    var keys = Object.keys(IDX);
    for(var i=0;i<keys.length;i++){
      var k = keys[i]; var q = qmap[IDX[k]];
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

  // --- 3-day NIFTY context (unchanged behavior, long cache). ---
  var context3d = null;
  try{
    if(!CACHE.hist.NIFTY || (now - (CACHE.histAt.NIFTY||0)) > HIST_TTL){
      CACHE.hist.NIFTY = await dailyHistory(IDX_ENC.NIFTY);
      CACHE.histAt.NIFTY = now;
    }
    var candles = CACHE.hist.NIFTY;
    if(candles && candles.length>=4){
      var last4 = candles.slice(-4);
      var first = last4[0].c, latest = last4[last4.length-1].c;
      var ret3 = ((latest-first)/first)*100;
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
        status:"DELAYED",
        note:"Based on last completed trading sessions"
      };
    }
  }catch(e){ context3d = null; }

  // --- VIX history (new, long cache, reuses the same daily-candle fetch). ---
  var vixHistory = null;
  try{
    if(!CACHE.hist.VIX || (now - (CACHE.histAt.VIX||0)) > HIST_TTL){
      CACHE.hist.VIX = await dailyHistory(IDX_ENC.VIX);
      CACHE.histAt.VIX = now;
    }
    var vc = CACHE.hist.VIX;
    if(vc && vc.length>=5){
      var closes = vc.map(function(x){ return Math.round(x.c*100)/100; });
      vixHistory = { status:"DELAYED", points:closes.slice(-10), sessions:closes.length, note:"Daily closes, last completed sessions" };
    }
  }catch(e){ vixHistory = null; }

  // --- Global markets (new, moderate cache, single batched request). ---
  var global = { status:"UNAVAILABLE", items:[] };
  try{
    if(!CACHE.global || (now - CACHE.globalAt) >= MODERATE_TTL){
      var gsyms = []; for(var gk in GLOBAL_SYMS){ if(GLOBAL_SYMS.hasOwnProperty(gk)) gsyms.push(GLOBAL_SYMS[gk]); }
      CACHE.global = await fetchQuoteBatch(gsyms);
      CACHE.globalAt = now;
    }
    global = buildGroup(GLOBAL_SYMS, CACHE.global || {});
  }catch(e){ global = { status:"UNAVAILABLE", items:[] }; }

  // --- Sector performance (new, moderate cache, single batched request). ---
  var sectors = { status:"UNAVAILABLE", items:[] };
  try{
    if(!CACHE.sectors || (now - CACHE.sectorsAt) >= MODERATE_TTL){
      var ssyms = []; for(var sk in SECTOR_SYMS){ if(SECTOR_SYMS.hasOwnProperty(sk)) ssyms.push(SECTOR_SYMS[sk]); }
      CACHE.sectors = await fetchQuoteBatch(ssyms);
      CACHE.sectorsAt = now;
    }
    sectors = buildGroup(SECTOR_SYMS, CACHE.sectors || {});
  }catch(e){ sectors = { status:"UNAVAILABLE", items:[] }; }

  return res.status(200).json({
    ok:true,
    session:session,
    generatedAt:now,
    indices:indices,
    context3d:context3d,
    vixHistory:vixHistory,
    global:global,
    sectors:sectors,
    unavailable:{
      breadth:"UNAVAILABLE",  // no verified advance/decline provider connected
      fiiDii:"UNAVAILABLE",   // T+1 delayed, not connected, never labeled live
      news:"UNAVAILABLE"      // no verified economic-calendar / event source connected
    }
  });
}
