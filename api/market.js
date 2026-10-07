// BreakoutPro - api/market.js
// Vercel serverless function. Single entry for all market data.
// Routes each action to the best free provider. Dhan ready for future upgrade.
//
// PROVIDER STRATEGY:
//   Yahoo (free, no key)  -> live index + stock prices
//   IndianAPI (free key)  -> fundamentals, 52W, gainers/losers, IPO, news
//   Dhan (real, DHAN_ACCESS_TOKEN/DHAN_CLIENT_ID set) -> option chain, Greeks
//
// To make Dhan primary for indices too later: point those actions at it.
// App code (dataService.js, and everything above it) never changes.

import * as yahoo from "./providers/yahoo.js";
import * as indian from "./providers/indianapi.js";
import * as dhan from "./providers/dhan.js";

export default async function handler(req, res){
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=60");

  var action = (req.query && req.query.action) || "";
  var q = req.query || {};

  try{
    var data = null;

    if(action == "indices"){
      data = await yahoo.getIndices();
    } else if(action == "quote" || action == "index"){
      data = await yahoo.getQuote(q.symbol);
    } else if(action == "quotes"){
      data = await yahoo.getQuotes(q.symbols);
    } else if(action == "trending" || action == "gainers" || action == "losers"){
      data = await indian.getTrending();
    } else if(action == "week52"){
      data = await indian.get52Week();
    } else if(action == "stock"){
      data = await indian.getStock(q.name || q.symbol);
    } else if(action == "ipo"){
      data = await indian.getIPO();
    } else if(action == "news"){
      data = await indian.getNews();
    } else if(action == "commodities"){
      data = await indian.getCommodities();
    } else if(action == "expirylist"){
      data = await getExpiryListData(q.symbol);
    } else if(action == "optionchain"){
      data = await getOptionChainData(q.symbol, q.expiry, q.window);
    } else {
      return res.status(200).json({ ok:false, reason:"unsupported_action", action:action });
    }

    if(data == null){
      return res.status(200).json({ ok:false, reason:"no_data" });
    }
    return res.status(200).json({ ok:true, data:data });

  }catch(err){
    return res.status(200).json({ ok:false, reason:"error", message:String(err && err.message || err) });
  }
}

// =====================================================================
// DHAN OPTION CHAIN - Option Intelligence data layer
// =====================================================================
//
// Two actions:
//   action=expirylist&symbol=NIFTY
//   action=optionchain&symbol=NIFTY&expiry=2026-10-09&window=5
//
// Both are READ-ONLY market data (no order placement - see "13. NO ORDER
// EXECUTION" in the task this was built against). Credentials
// (DHAN_ACCESS_TOKEN / DHAN_CLIENT_ID) are read server-side only inside
// providers/dhan.js and are never put into a response body here.
//
// RATE LIMIT: Dhan's Option Chain REST API allows one unique request every
// 3 seconds. OI_RATE_LIMIT_MS below enforces a hard floor between actual
// upstream calls per (symbol, expiry) key - a request arriving sooner is
// served the cached value instead of ever reaching Dhan, no matter how
// many browser tabs/polling loops hit this endpoint concurrently.
//
// CACHE LIMITATION (same caveat as providers/angelone.js's session cache):
// this is a module-level, in-memory, per-warm-instance cache. It is a
// best-effort throttle, not a guarantee, because Vercel can run multiple
// concurrent serverless instances that do not share this Map. If you see
// the 3-second floor being crossed in logs under real concurrent load,
// move this cache into Vercel KV / Upstash Redis so all instances share
// one clock. For a single trader's own dashboard polling at a sane
// interval (the UI here polls every 5s), this in-memory floor is sufficient.
var OI_RATE_LIMIT_MS = 3000;     // hard floor between real Dhan calls per key
var OI_FRESH_MS = 8000;          // data newer than this reports status LIVE
var OI_STALE_MAX_MS = 120000;    // beyond this with no successful refresh, report UNAVAILABLE instead of STALE
var EXPIRY_CACHE_MS = 5 * 60 * 1000; // expiry lists change rarely - cache 5 min

var _oiCache = new Map();      // key: symbol+"|"+expiry -> { normalized, fetchedAt, lastAttemptAt }
var _expiryCache = new Map();  // key: symbol -> { expiries, fetchedAt }

function nowIso(){ return new Date().toISOString(); }

async function getExpiryListData(symbol){
  symbol = String(symbol || "").toUpperCase().trim();
  if(!symbol){
    return { status:"UNAVAILABLE", message:"Missing required param: symbol", expiries:[] };
  }
  if(dhan.OPTION_CHAIN_SUPPORTED_UNDERLYINGS.indexOf(symbol) < 0){
    return { status:"UNAVAILABLE", message:"Live Option Intelligence is not mapped for " + symbol + " yet. Supported: " + dhan.OPTION_CHAIN_SUPPORTED_UNDERLYINGS.join(", "), expiries:[] };
  }

  var cached = _expiryCache.get(symbol);
  if(cached && (Date.now() - cached.fetchedAt) < EXPIRY_CACHE_MS){
    return { status:"LIVE", message:null, expiries:cached.expiries, updated:new Date(cached.fetchedAt).toISOString() };
  }

  var result = await dhan.getExpiryListResult(symbol);
  var err = dhan.classifyDhanError(result);
  if(err){
    // Serve a stale cached list rather than an empty selector, if we have one.
    if(cached){
      return { status:"STALE", message:err.message, expiries:cached.expiries, updated:new Date(cached.fetchedAt).toISOString() };
    }
    return { status:"UNAVAILABLE", message:err.message, errorCode:err.code, expiries:[] };
  }

  // Dhan's documented v2 shape is { status:"success", data:[ "2026-10-09", ... ] }.
  // Defensive about the exact key (data vs expiryList) since this cannot be
  // live-verified from this sandbox - see the VERIFY BEFORE PRODUCTION USE
  // note in providers/dhan.js.
  var j = result.json;
  var list = (j && Array.isArray(j.data)) ? j.data : (j && Array.isArray(j.expiryList) ? j.expiryList : null);
  if(!list){
    return { status:"UNAVAILABLE", message:"Dhan returned no expiry list for " + symbol + ".", expiries:[] };
  }
  list = list.slice().sort(); // chronological - nearest first
  _expiryCache.set(symbol, { expiries:list, fetchedAt:Date.now() });
  return { status:"LIVE", message:null, expiries:list, updated:nowIso() };
}

async function getOptionChainData(symbol, expiry, windowParam){
  symbol = String(symbol || "").toUpperCase().trim();
  var window = Math.max(1, Math.min(15, parseInt(windowParam, 10) || 5));

  if(!symbol){
    return { status:"UNAVAILABLE", message:"Missing required param: symbol" };
  }
  if(dhan.OPTION_CHAIN_SUPPORTED_UNDERLYINGS.indexOf(symbol) < 0){
    return { status:"UNAVAILABLE", message:"Live Option Intelligence is not mapped for " + symbol + " yet. Supported: " + dhan.OPTION_CHAIN_SUPPORTED_UNDERLYINGS.join(", ") };
  }
  if(!expiry){
    return { status:"UNAVAILABLE", message:"Missing required param: expiry (call action=expirylist first and pass one of its returned dates)." };
  }

  var key = symbol + "|" + expiry;
  var cacheEntry = _oiCache.get(key);
  var now = Date.now();

  // Hard rate-limit floor: never call Dhan again for this key inside
  // OI_RATE_LIMIT_MS, no matter who/what is asking.
  if(cacheEntry && (now - cacheEntry.lastAttemptAt) < OI_RATE_LIMIT_MS){
    return buildStatusPayload(cacheEntry, null);
  }

  var result = await dhan.getOptionChainResult(symbol, expiry);
  var attemptAt = Date.now();
  var err = dhan.classifyDhanError(result);

  if(err){
    if(cacheEntry){
      cacheEntry.lastAttemptAt = attemptAt;
      _oiCache.set(key, cacheEntry);
      return buildStatusPayload(cacheEntry, err);
    }
    return { status:"UNAVAILABLE", message:err.message, errorCode:err.code, underlying:symbol, expiry:expiry };
  }

  var normalized = normalizeOptionChain(result.json, symbol, expiry);
  if(!normalized || !normalized.strikesFull || normalized.strikesFull.length === 0){
    var emptyErr = { code:"empty_option_chain", message:"Dhan returned an empty option chain for " + symbol + " " + expiry + "." };
    if(cacheEntry){
      cacheEntry.lastAttemptAt = attemptAt;
      _oiCache.set(key, cacheEntry);
      return buildStatusPayload(cacheEntry, emptyErr);
    }
    return { status:"UNAVAILABLE", message:emptyErr.message, errorCode:emptyErr.code, underlying:symbol, expiry:expiry };
  }

  cacheEntry = { normalized:normalized, fetchedAt:attemptAt, lastAttemptAt:attemptAt };
  _oiCache.set(key, cacheEntry);
  return buildStatusPayload(cacheEntry, null, window);
}

// Shapes the final response from whatever is in the cache (fresh or
// stale), applying the ATM window, PCR/Max Pain calculations and the
// LIVE/STALE/UNAVAILABLE status - all derived ONLY from real fetched
// fields, never invented.
function buildStatusPayload(cacheEntry, err, window){
  var ageMs = Date.now() - cacheEntry.fetchedAt;
  var status = "LIVE";
  if(err || ageMs > OI_FRESH_MS) status = "STALE";
  if(ageMs > OI_STALE_MAX_MS) status = "UNAVAILABLE";

  var n = cacheEntry.normalized;
  var windowed = windowStrikes(n.strikesFull, n.atmStrike, window || 5);

  var payload = {
    status: status,
    message: err ? err.message : null,
    underlying: n.underlying,
    underlyingLtp: n.underlyingLtp,
    expiry: n.expiry,
    updated: new Date(cacheEntry.fetchedAt).toISOString(),
    dataAgeSec: Math.round(ageMs / 1000),
    atmStrike: n.atmStrike,
    pcrOi: n.pcrOi,
    pcrVolume: n.pcrVolume,
    maxPain: n.maxPain,
    highestCallOi: n.highestCallOi,
    highestPutOi: n.highestPutOi,
    totalStrikesAvailable: n.strikesFull.length,
    strikes: status === "UNAVAILABLE" ? [] : windowed
  };
  return payload;
}

// windowStrikes - ATM-centered slice so the UI never has to render every
// strike Dhan returns (requirement 8: "ATM-centered strike window").
function windowStrikes(strikesFull, atmStrike, window){
  var atmIdx = 0;
  var bestDiff = Infinity;
  for(var i=0;i<strikesFull.length;i++){
    var diff = Math.abs(strikesFull[i].strike - atmStrike);
    if(diff < bestDiff){ bestDiff = diff; atmIdx = i; }
  }
  var start = Math.max(0, atmIdx - window);
  var end = Math.min(strikesFull.length, atmIdx + window + 1);
  return strikesFull.slice(start, end);
}

// normalizeOptionChain - maps Dhan's v2 /optionchain response into the
// app's single normalized shape. Field names below follow Dhan's publicly
// documented v2 Option Chain response (last_price, oc:{<strike>:{ce,pe}},
// each leg carrying oi/previous_oi/volume/previous_volume/
// implied_volatility/last_price/top_bid_price/top_bid_quantity/
// top_ask_price/top_ask_quantity/greeks{delta,gamma,theta,vega}) - I
// cannot make a live call from this sandbox to confirm this is still
// exactly current, so this is defensive about a couple of plausible key
// variants and returns nulls (never fabricated numbers) for anything it
// cannot find, rather than guessing.
function normalizeOptionChain(j, symbol, expiry){
  var d = j && j.data ? j.data : null;
  if(!d) return null;
  var underlyingLtp = numOrNull(d.last_price != null ? d.last_price : d.lastPrice);
  var oc = d.oc || d.optionChain || null;
  if(!oc) return null;

  function leg(raw){
    if(!raw) return null;
    var greeks = raw.greeks || {};
    return {
      securityId: raw.security_id != null ? raw.security_id : (raw.securityId != null ? raw.securityId : null),
      ltp: numOrNull(raw.last_price != null ? raw.last_price : raw.lastPrice),
      oi: numOrNull(raw.oi),
      previousOi: numOrNull(raw.previous_oi != null ? raw.previous_oi : raw.previousOi),
      volume: numOrNull(raw.volume),
      previousVolume: numOrNull(raw.previous_volume != null ? raw.previous_volume : raw.previousVolume),
      iv: numOrNull(raw.implied_volatility != null ? raw.implied_volatility : raw.impliedVolatility),
      delta: numOrNull(greeks.delta),
      gamma: numOrNull(greeks.gamma),
      theta: numOrNull(greeks.theta),
      vega: numOrNull(greeks.vega),
      bid: numOrNull(raw.top_bid_price != null ? raw.top_bid_price : raw.topBidPrice),
      bidQty: numOrNull(raw.top_bid_quantity != null ? raw.top_bid_quantity : raw.topBidQuantity),
      ask: numOrNull(raw.top_ask_price != null ? raw.top_ask_price : raw.topAskPrice),
      askQty: numOrNull(raw.top_ask_quantity != null ? raw.top_ask_quantity : raw.topAskQuantity)
    };
  }

  var strikesFull = [];
  for(var strikeKey in oc){
    if(!oc.hasOwnProperty(strikeKey)) continue;
    var strikeNum = parseFloat(strikeKey);
    if(!isFinite(strikeNum)) continue;
    var row = oc[strikeKey];
    strikesFull.push({
      strike: strikeNum,
      ce: leg(row.ce),
      pe: leg(row.pe)
    });
  }
  strikesFull.sort(function(a,b){ return a.strike - b.strike; });
  if(strikesFull.length === 0) return null;

  // ATM: nearest strike to the real underlying LTP (never hardcoded).
  // Ties (equidistant strikes) resolve to the LOWER strike - an arbitrary
  // but deterministic and documented tie-break.
  var atmStrike = strikesFull[0].strike;
  if(underlyingLtp != null){
    var bestDiff = Infinity;
    strikesFull.forEach(function(s){
      var diff = Math.abs(s.strike - underlyingLtp);
      if(diff < bestDiff - 1e-9){ bestDiff = diff; atmStrike = s.strike; }
    });
  }

  // PCR - Put OI / Call OI, and separately Put Volume / Call Volume, summed
  // across the FULL chain (not just the ATM window) - the standard
  // definition. Reported as two distinct, clearly labeled fields per
  // requirement 6 ("Clearly label whether this is OI PCR or Volume PCR.
  // Do not mix them.").
  var totalCallOi = 0, totalPutOi = 0, totalCallVol = 0, totalPutVol = 0;
  var highestCallOi = null, highestPutOi = null;
  strikesFull.forEach(function(s){
    var cOi = s.ce && s.ce.oi != null ? s.ce.oi : 0;
    var pOi = s.pe && s.pe.oi != null ? s.pe.oi : 0;
    var cVol = s.ce && s.ce.volume != null ? s.ce.volume : 0;
    var pVol = s.pe && s.pe.volume != null ? s.pe.volume : 0;
    totalCallOi += cOi; totalPutOi += pOi;
    totalCallVol += cVol; totalPutVol += pVol;
    if(!highestCallOi || cOi > highestCallOi.oi) highestCallOi = { strike:s.strike, oi:cOi };
    if(!highestPutOi || pOi > highestPutOi.oi) highestPutOi = { strike:s.strike, oi:pOi };
  });
  var pcrOi = totalCallOi > 0 ? roundTo(totalPutOi / totalCallOi, 2) : null;
  var pcrVolume = totalCallVol > 0 ? roundTo(totalPutVol / totalCallVol, 2) : null;

  // Max Pain - the strike at which option WRITERS (sellers) as a group owe
  // the least total intrinsic-value payout at expiry, i.e. where option
  // BUYERS as a group would collectively lose the most ("max pain" to
  // buyers). For each candidate settlement price P across the available
  // strikes, total payout = sum over every strike K of:
  //   callOI(K) * max(0, P - K)   (intrinsic value owed on calls struck at K)
  // + putOI(K)  * max(0, K - P)   (intrinsic value owed on puts struck at K)
  // Max Pain is the P that MINIMIZES that sum. Computed only from the real
  // OI already in strikesFull - never hardcoded.
  var maxPain = null, minPain = Infinity;
  strikesFull.forEach(function(candidate){
    var p = candidate.strike;
    var totalPayout = 0;
    strikesFull.forEach(function(s){
      var cOi = s.ce && s.ce.oi != null ? s.ce.oi : 0;
      var pOi = s.pe && s.pe.oi != null ? s.pe.oi : 0;
      totalPayout += cOi * Math.max(0, p - s.strike);
      totalPayout += pOi * Math.max(0, s.strike - p);
    });
    if(totalPayout < minPain){ minPain = totalPayout; maxPain = p; }
  });

  return {
    underlying: symbol,
    underlyingLtp: underlyingLtp,
    expiry: expiry,
    atmStrike: atmStrike,
    pcrOi: pcrOi,
    pcrVolume: pcrVolume,
    maxPain: maxPain,
    highestCallOi: highestCallOi,
    highestPutOi: highestPutOi,
    strikesFull: strikesFull
  };
}

function numOrNull(v){
  if(v == null) return null;
  var n = Number(v);
  return isFinite(n) ? n : null;
}
function roundTo(v, decimals){
  var mul = Math.pow(10, decimals);
  return Math.round(v * mul) / mul;
}
