// BreakoutPro - api/providers/dhan.js
// Dhan-specific data provider. Runs ONLY on the server (Vercel function).
// Token read from environment variables - NEVER exposed to browser.
// To add Angel One later: create providers/angelone.js with the same exported
// function names, then point market.js to it. App code never changes.
//
// CREDENTIALS: set these in Vercel's Environment Variables (or a local
// .env, never committed) - this file is only ever imported from other
// files under api/, never from src/, so these values never reach the
// browser bundle:
//   DHAN_ACCESS_TOKEN - the Dhan API access token for your account
//   DHAN_CLIENT_ID    - your Dhan client ID
//
// SECURITY ID MAP (SEC below): these numeric IDs were already present in
// this file before this change (used by getIndices/getQuote). I am
// reusing them as-is for the option-chain work rather than inventing new
// ones - I have no live Dhan credentials in this sandbox to independently
// re-verify them against Dhan's current instrument/security master, so
// treat them as "already in this codebase, unverified by me this round"
// and confirm against https://images.dhan.co/api-data/api-scrip-master.csv
// (Dhan's official instrument master) before relying on them in production.
//
// VERIFY BEFORE PRODUCTION USE: Dhan's v2 endpoint paths, header names and
// response shapes below reflect the publicly documented v2 Option Chain
// contract as of my training, and I cannot make a live network call from
// this sandbox to confirm them. Re-check against https://dhanhq.co/docs/v2/
// before relying on this in production, same caveat as api/providers/angelone.js.

var DHAN_BASE = "https://api.dhan.co/v2";
var REQUEST_TIMEOUT_MS = 8000;

function headers(){
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "access-token": process.env.DHAN_ACCESS_TOKEN || "",
    "client-id": process.env.DHAN_CLIENT_ID || ""
  };
}

// Security ID map. Dhan uses numeric security IDs, not symbols.
// Extend this map as needed. Index security IDs (NSE).
var SEC = {
  NIFTY:    {id:"13",    seg:"IDX_I"},
  BANKNIFTY:{id:"25",    seg:"IDX_I"},
  FINNIFTY: {id:"27",    seg:"IDX_I"},
  SENSEX:   {id:"51",    seg:"IDX_I"},
  MIDCAP:   {id:"442",   seg:"IDX_I"},
  VIX:      {id:"21",    seg:"IDX_I"}
};

// postJSON now returns { ok, httpStatus, json, networkError } instead of
// just the parsed body, so callers (the option-chain normalizer in
// market.js) can tell a Dhan-reported failure (bad token, rate limit, bad
// expiry, etc - httpStatus/json.status present) apart from a network-level
// failure (timeout, DNS, connection reset - networkError present) and
// report each one honestly instead of treating every failure the same way.
// A hard timeout (REQUEST_TIMEOUT_MS) stops a hung Dhan request from
// hanging the whole Vercel function past its own execution limit.
function postJSON(path, body){
  var controller = (typeof AbortController!=="undefined") ? new AbortController() : null;
  var timer = controller ? setTimeout(function(){ controller.abort(); }, REQUEST_TIMEOUT_MS) : null;
  return fetch(DHAN_BASE + path, {
    method:"POST",
    headers:headers(),
    body:JSON.stringify(body),
    signal: controller ? controller.signal : undefined
  }).then(function(r){
    if(timer) clearTimeout(timer);
    return r.json().catch(function(){ return null; }).then(function(json){
      return { ok:r.ok, httpStatus:r.status, json:json, networkError:null };
    });
  }).catch(function(err){
    if(timer) clearTimeout(timer);
    var isTimeout = err && err.name === "AbortError";
    return { ok:false, httpStatus:0, json:null, networkError: isTimeout ? "timeout" : String(err && err.message || err) };
  });
}

// Maps a postJSON() result into one of the clean, documented failure
// categories required for Option Intelligence error handling. Dhan's exact
// error-response shape is not independently verifiable from this sandbox
// (no live credentials) - this reads the commonly-documented
// {status:"failure", remarks:{error_code, error_message}} v2 shape plus
// plain HTTP status codes, and falls back to a generic "dhan_api_error"
// bucket for anything it does not recognize, so an unexpected shape still
// surfaces a real message instead of being silently swallowed.
export function classifyDhanError(result){
  if(!result) return { code:"dhan_api_error", message:"No response from Dhan." };
  if(result.networkError === "timeout") return { code:"network_timeout", message:"Dhan request timed out." };
  if(result.networkError) return { code:"network_timeout", message:"Network error reaching Dhan: " + result.networkError };
  var j = result.json;
  var remarks = j && j.remarks ? j.remarks : null;
  var errCode = remarks && (remarks.error_code || remarks.errorCode);
  var errMsg = (remarks && (remarks.error_message || remarks.errorMessage)) || (j && j.message) || null;
  if(result.httpStatus === 401 || /invalid.?token|unauthoriz/i.test(String(errMsg||""))) {
    return { code:"invalid_access_token", message: errMsg || "Invalid or expired Dhan access token." };
  }
  if(/expired/i.test(String(errMsg||"")) || /expired/i.test(String(errCode||""))) {
    return { code:"expired_token", message: errMsg || "Dhan access token has expired." };
  }
  if(/client.?id/i.test(String(errMsg||""))) {
    return { code:"invalid_client_id", message: errMsg || "Invalid Dhan client ID." };
  }
  if(/subscri/i.test(String(errMsg||""))) {
    return { code:"missing_data_subscription", message: errMsg || "Dhan data subscription required for this request." };
  }
  if(result.httpStatus === 429 || /rate.?limit/i.test(String(errMsg||""))) {
    return { code:"rate_limit", message: errMsg || "Dhan API rate limit hit." };
  }
  if(result.httpStatus >= 500) {
    return { code:"dhan_api_error", message: errMsg || ("Dhan server error (HTTP " + result.httpStatus + ").") };
  }
  if(!result.ok || (j && j.status && String(j.status).toLowerCase() === "failure")) {
    return { code:"dhan_api_error", message: errMsg || ("Dhan API error (HTTP " + result.httpStatus + ").") };
  }
  return null;
}

// Marketfeed LTP for a set of indices/stocks.
// Dhan expects { NSE_EQ:[ids], IDX_I:[ids], ... }
export function getIndices(){
  var ids = {};
  ids.IDX_I = [];
  for(var k in SEC){ if(SEC.hasOwnProperty(k)) ids.IDX_I.push(Number(SEC[k].id)); }
  return postJSON("/marketfeed/ltp", ids).then(function(result){
    return normalizeIndices(result.json);
  });
}

export function getQuote(symbol){
  var s = SEC[symbol];
  if(!s) return Promise.resolve(null);
  var body = {}; body[s.seg] = [Number(s.id)];
  return postJSON("/marketfeed/quote", body).then(function(result){ return result.json; });
}

// Returns the raw postJSON() result ({ok, httpStatus, json, networkError}),
// not just the parsed body - the option-chain endpoint in market.js needs
// that envelope to tell a real Dhan error apart from a network failure via
// classifyDhanError(), and to never guess at a success shape.
export function getOptionChainResult(symbol, expiry){
  var s = SEC[symbol];
  if(!s) return Promise.resolve({ ok:false, httpStatus:0, json:null, networkError:"invalid_underlying" });
  return postJSON("/optionchain", {
    UnderlyingScrip: Number(s.id),
    UnderlyingSeg: s.seg,
    Expiry: expiry
  });
}

// Back-compat wrapper kept for any existing caller expecting just the raw
// body (none currently import this, but getOptionChainResult above is the
// one used by the new option-chain endpoint).
export function getOptionChain(symbol, expiry){
  return getOptionChainResult(symbol, expiry).then(function(result){ return result.json; });
}

// POST /v2/optionchain/expirylist - returns the raw result envelope for the
// same reason getOptionChainResult does.
export function getExpiryListResult(symbol){
  var s = SEC[symbol];
  if(!s) return Promise.resolve({ ok:false, httpStatus:0, json:null, networkError:"invalid_underlying" });
  return postJSON("/optionchain/expirylist", {
    UnderlyingScrip: Number(s.id),
    UnderlyingSeg: s.seg
  });
}

export function getCandles(symbol, interval, from, to){
  var s = SEC[symbol];
  if(!s) return Promise.resolve(null);
  return postJSON("/charts/intraday", {
    securityId: s.id,
    exchangeSegment: s.seg,
    instrument: "INDEX",
    interval: interval,
    fromDate: from,
    toDate: to
  }).then(function(result){ return result.json; });
}

// The four underlyings this task scopes to - exported so market.js (and
// anything else) can check support without duplicating this list, per the
// "clean configuration/mapping layer" requirement.
export var OPTION_CHAIN_SUPPORTED_UNDERLYINGS = ["NIFTY", "BANKNIFTY", "SENSEX", "FINNIFTY"];

// Normalize Dhan response into app's common shape.
function normalizeIndices(j){
  var out = [];
  try{
    var d = (j && j.data && j.data.IDX_I) ? j.data.IDX_I : {};
    for(var k in SEC){
      if(!SEC.hasOwnProperty(k)) continue;
      var row = d[SEC[k].id];
      if(row){
        out.push({
          key:k,
          ltp: row.last_price || 0,
          up: (row.net_change||0) >= 0,
          chgPct: row.percent_change || 0
        });
      }
    }
  }catch(e){}
  return out;
}
