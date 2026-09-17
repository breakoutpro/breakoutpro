// api/providers/angelone.js
//
// Angel One SmartAPI adapter for REAL NFO Futures market data.
//
// SCOPE OF THIS FILE:
// - Login + session management (JWT/refresh/feed token) via TOTP
// - NFO instrument (symboltoken) resolution from Angel One's public scrip master
// - REST quote fetch + normalization into one common shape
//
// NOT IN THIS FILE: WebSocket streaming. See server/futures-ws-relay.js and
// the note at the bottom of this file for why that has to live in a
// separately-hosted, always-on process rather than here.
//
// CREDENTIALS: read ONLY from server-side environment variables. Nothing in
// this file is ever imported by frontend code, and none of these values are
// ever put in an API response. Set these in Vercel's Environment Variables
// (or your .env, never committed):
//
//   ANGELONE_API_KEY        - from your SmartAPI app
//   ANGELONE_CLIENT_CODE    - your Angel One client/login ID
//   ANGELONE_MPIN           - your Angel One MPIN (used in place of password
//                             for the loginByPassword call, per current
//                             SmartAPI docs - verify this is still current
//                             before going live, API details do change)
//   ANGELONE_TOTP_SECRET    - the base32 TOTP secret shown when you enable
//                             SmartAPI's 2FA (NOT your 6-digit app code -
//                             the underlying secret used to generate it)
//   ANGELONE_LOCAL_IP       - required header, e.g. "127.0.0.1" is commonly
//                             accepted for server-to-server calls
//   ANGELONE_PUBLIC_IP      - your server's public IP (Vercel does not
//                             expose a stable one per-request; a placeholder
//                             like "106.51.74.11" is commonly accepted, but
//                             confirm against current Angel One requirements)
//   ANGELONE_MAC_ADDRESS    - any stable MAC-like string, e.g. "00:00:00:00:00:00"
//
// This module requires the "otplib" package for TOTP generation:
//   npm install otplib
//
// VERIFY BEFORE PRODUCTION USE: Angel One's SmartAPI endpoint paths, header
// names, and required fields have changed over time and I cannot make a
// live network call from this sandbox to confirm the exact current contract.
// The endpoints/headers below reflect the publicly documented SmartAPI
// contract as of my training, but treat every URL and header name as
// something to re-verify against https://smartapi.angelbroking.com/docs
// before relying on this in production. This file is written so that if a
// field name changes, you only need to edit ANGELONE_ENDPOINTS and the
// header list below - the rest of the adapter (caching, normalization,
// the "never fake data" fallback) does not need to change.

import { authenticator } from "otplib";

var ANGELONE_ENDPOINTS = {
  login: "https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword",
  quote: "https://apiconnect.angelone.in/rest/secure/angelbroking/market/v1/quote/",
  scripMaster: "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json"
};

// In-memory session cache. IMPORTANT LIMITATION: on Vercel serverless
// functions, module-level state only survives across requests on a "warm"
// instance, not guaranteed, and not shared across concurrent instances. This
// is a best-effort cache to avoid re-logging-in on every request when the
// function happens to stay warm - it is NOT a substitute for a real shared
// cache. If you see frequent re-logins in your logs, move this cache into
// Vercel KV / Upstash Redis / similar so all instances share one session.
var _session = { jwtToken: null, feedToken: null, clientCode: null, fetchedAt: 0 };
var SESSION_TTL_MS = 6 * 60 * 60 * 1000; // Angel One sessions are typically valid ~24h; refresh well before that

// _loginInFlight - if several requests hit a cold instance at the same
// moment (e.g. Home's AI Market Mood + Range Intelligence + this futures
// call all arriving together), they would otherwise each call login()
// independently and hit Angel One's login endpoint N times at once. This
// makes every concurrent caller await the SAME in-flight login promise
// instead, so only one login request ever goes out at a time per warm
// instance. This is an in-process lock only (see the session-cache note
// above about multi-instance limitations - a lock can't coordinate across
// separate serverless instances, only within one).
var _loginInFlight = null;

// Scrip master cache - this file is tens of MB, so it is fetched once per
// warm instance and re-used, not fetched per request.
var _scripMaster = { data: null, fetchedAt: 0 };
var SCRIP_MASTER_TTL_MS = 12 * 60 * 60 * 1000; // instrument list changes at most daily (expiries roll over)

function requiredEnv(name){
  var v = process.env[name];
  if(!v) throw new Error("Missing required env var: " + name);
  return v;
}

// mask(str) - for the rare case a value that MIGHT be sensitive needs to
// appear in a log line at all (e.g. confirming which client code a login
// attempt used, for support debugging) - never log the full value.
function mask(str){
  if(!str) return "(empty)";
  var s = String(str);
  if(s.length<=4) return "****";
  return s.slice(0,2) + "****" + s.slice(-2);
}

// parseAngelExpiry(str) - Angel One's instrument master gives expiry as
// "DDMMMYYYY" (e.g. "25SEP2025"), not ISO. new Date("25SEP2025") happens to
// work in V8 but is not a documented/guaranteed parse, so this parses it
// explicitly instead of trusting the Date constructor with a non-standard
// string. Returns null (never a guessed date) if the format doesn't match.
var ANGEL_EXPIRY_RE = /^(\d{1,2})([A-Z]{3})(\d{4})$/;
var MONTH_INDEX = { JAN:0, FEB:1, MAR:2, APR:3, MAY:4, JUN:5, JUL:6, AUG:7, SEP:8, OCT:9, NOV:10, DEC:11 };
function parseAngelExpiry(expiryStr){
  if(!expiryStr) return null;
  var m = ANGEL_EXPIRY_RE.exec(String(expiryStr).trim().toUpperCase());
  if(!m) return null;
  var day = parseInt(m[1], 10);
  var month = MONTH_INDEX[m[2]];
  var year = parseInt(m[3], 10);
  if(month===undefined || isNaN(day) || isNaN(year)) return null;
  // End-of-day UTC so a contract expiring "today" is still counted as a
  // valid, not-yet-expired future for the rest of that day.
  var d = new Date(Date.UTC(year, month, day, 23, 59, 59));
  return isNaN(d.getTime()) ? null : d;
}

function buildHeaders(extra){
  var base = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-UserType": "USER",
    "X-SourceID": "WEB",
    "X-ClientLocalIP": process.env.ANGELONE_LOCAL_IP || "127.0.0.1",
    "X-ClientPublicIP": process.env.ANGELONE_PUBLIC_IP || "106.51.74.11",
    "X-MACAddress": process.env.ANGELONE_MAC_ADDRESS || "00:00:00:00:00:00",
    "X-PrivateKey": requiredEnv("ANGELONE_API_KEY")
  };
  if(extra){
    for(var k in extra){ base[k] = extra[k]; }
  }
  return base;
}

// login() - authenticates with Angel One using MPIN + TOTP, caches the
// resulting jwtToken/feedToken for reuse. Returns the session object, or
// throws - callers must catch and return an explicit unavailable state,
// never fabricate a session.
export async function login(){
  var now = Date.now();
  if(_session.jwtToken && (now - _session.fetchedAt) < SESSION_TTL_MS){
    console.log("[angelone] reusing cached session for client " + mask(_session.clientCode) + ", age " + Math.round((now-_session.fetchedAt)/1000) + "s");
    return _session;
  }

  if(_loginInFlight){
    console.log("[angelone] login already in flight, waiting on it instead of starting a second one");
    return _loginInFlight;
  }

  _loginInFlight = doLogin(now);
  try {
    var result = await _loginInFlight;
    return result;
  } finally {
    _loginInFlight = null;
  }
}

async function doLogin(now){
  var clientCode = requiredEnv("ANGELONE_CLIENT_CODE");
  var mpin = requiredEnv("ANGELONE_MPIN");
  var totpSecret = requiredEnv("ANGELONE_TOTP_SECRET");
  var totp = authenticator.generate(totpSecret);

  console.log("[angelone] attempting login for client " + mask(clientCode));

  var resp;
  try {
    resp = await fetch(ANGELONE_ENDPOINTS.login, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ clientcode: clientCode, password: mpin, totp: totp })
    });
  } catch(networkErr){
    console.error("[angelone] login network error: " + (networkErr && networkErr.message));
    throw new Error("Could not reach Angel One login endpoint: " + (networkErr && networkErr.message));
  }

  if(!resp.ok){
    console.error("[angelone] login HTTP failure, status " + resp.status);
    throw new Error("Angel One login failed with status " + resp.status);
  }

  var json = await resp.json();
  if(!json || json.status!==true || !json.data || !json.data.jwtToken){
    console.error("[angelone] login rejected: " + (json && json.message ? json.message : "no session token in response"));
    throw new Error("Angel One login returned no session token: " + (json && json.message ? json.message : "unknown error"));
  }

  _session = {
    jwtToken: json.data.jwtToken,
    feedToken: json.data.feedToken,
    refreshToken: json.data.refreshToken,
    clientCode: clientCode,
    fetchedAt: now
  };
  console.log("[angelone] login succeeded for client " + mask(clientCode) + " - session cached until " + new Date(now+SESSION_TTL_MS).toISOString());
  return _session;
}

// resolveFutureToken(underlying) - looks up the NFO futures symboltoken for
// a given underlying (e.g. "NIFTY", "BANKNIFTY", "RELIANCE"), picking the
// nearest (current-month) expiry. Angel One's quote API needs symboltoken,
// not a plain symbol name, so this lookup is required before every quote
// call unless you already know the token.
export async function resolveFutureToken(underlying){
  var now = Date.now();
  if(!_scripMaster.data || (now - _scripMaster.fetchedAt) > SCRIP_MASTER_TTL_MS){
    console.log("[angelone] fetching instrument master (cache expired or empty)");
    var resp = await fetch(ANGELONE_ENDPOINTS.scripMaster);
    if(!resp.ok){
      console.error("[angelone] instrument master fetch failed, status " + resp.status);
      throw new Error("Could not fetch Angel One instrument master, status " + resp.status);
    }
    _scripMaster.data = await resp.json();
    _scripMaster.fetchedAt = now;
    console.log("[angelone] instrument master cached, " + _scripMaster.data.length + " rows");
  }

  var upper = String(underlying).toUpperCase();
  var rawCandidates = _scripMaster.data.filter(function(row){
    return row.exch_seg==="NFO" && row.name===upper && (row.instrumenttype==="FUTIDX" || row.instrumenttype==="FUTSTK");
  });
  // Intentionally an exact match on exch_seg/name/instrumenttype rather than
  // fuzzy matching - a wrong/fuzzy match on a real trading feed is worse
  // than an honest "not found".
  if(rawCandidates.length===0){
    console.warn("[angelone] no NFO future found for underlying " + upper);
    return null;
  }

  var todayStart = new Date();
  todayStart.setUTCHours(0,0,0,0);

  var validCandidates = rawCandidates
    .map(function(row){ return { row: row, expiryDate: parseAngelExpiry(row.expiry) }; })
    .filter(function(c){
      if(!c.expiryDate){
        console.warn("[angelone] " + upper + " candidate token " + c.row.token + " has an unparseable expiry (" + c.row.expiry + ") - excluded rather than guessed");
        return false;
      }
      return c.expiryDate.getTime() >= todayStart.getTime(); // never select an expired contract
    });

  if(validCandidates.length===0){
    console.warn("[angelone] all NFO future expiries for " + upper + " are in the past or unparseable - no valid contract to select");
    return null;
  }

  validCandidates.sort(function(a,b){ return a.expiryDate.getTime() - b.expiryDate.getTime(); });
  var picked = validCandidates[0].row; // nearest NOT-expired expiry = current front-month future
  console.log("[angelone] resolved " + upper + " -> token=" + picked.token + " tradingsymbol=" + picked.symbol + " expiry=" + picked.expiry + " (" + validCandidates.length + " valid expiries of " + rawCandidates.length + " total)");
  return picked;
}

// normalizeQuote(raw, meta) - the single place that shapes Angel One's raw
// quote payload into the one common response format this adapter promises:
// LTP, OHLC, volume, OI, percentage change, exchange feed time.
function normalizeQuote(raw, meta){
  if(!raw) return null;
  var ltp = raw.ltp!=null ? Number(raw.ltp) : null;
  var close = raw.close!=null ? Number(raw.close) : null;

  // CHANGE PERCENT: prefer Angel One's own supplied field (FULL quote mode
  // includes "percentChange") - only fall back to computing it from
  // LTP/close when Angel One doesn't supply a usable number, never the
  // other way round.
  var suppliedPct = raw.percentChange!=null ? Number(raw.percentChange) : null;
  var changePct = Number.isFinite(suppliedPct)
    ? Math.round(suppliedPct*100)/100
    : ((Number.isFinite(ltp) && close) ? Math.round(((ltp-close)/close)*10000)/100 : null);

  return {
    symbol: meta && meta.symbol ? meta.symbol : (raw.tradingSymbol || null),
    exchange: "NFO",
    expiry: meta && meta.expiry ? meta.expiry : null,
    ltp: ltp,
    open: raw.open!=null ? Number(raw.open) : null,
    high: raw.high!=null ? Number(raw.high) : null,
    low: raw.low!=null ? Number(raw.low) : null,
    close: close,
    volume: raw.tradeVolume!=null ? Number(raw.tradeVolume) : (raw.volume!=null ? Number(raw.volume) : null),
    oi: raw.opnInterest!=null ? Number(raw.opnInterest) : (raw.oi!=null ? Number(raw.oi) : null),
    changePct: changePct,
    exchangeFeedTime: raw.exchFeedTime || raw.feedTime || null,
    status: "LIVE"
  };
}

// getFuturesQuote(underlying) - the main export other backend code should
// call. Resolves the token, fetches the quote, normalizes it. On ANY
// failure (auth failure, instrument not found, quote API error, network
// error) this returns an explicit unavailable object rather than throwing a
// raw error up to the API route or ever returning fabricated numbers.
export async function getFuturesQuote(underlying){
  try {
    var session = await login();
    var instrument = await resolveFutureToken(underlying);
    if(!instrument){
      console.warn("[angelone] quote skipped for " + underlying + ": no instrument resolved");
      return { ok:false, status:"UNAVAILABLE", symbol: underlying, message: "No NFO future found for " + underlying + " in the instrument master." };
    }

    var resp;
    try {
      resp = await fetch(ANGELONE_ENDPOINTS.quote, {
        method: "POST",
        headers: buildHeaders({ Authorization: "Bearer " + session.jwtToken }),
        body: JSON.stringify({
          mode: "FULL",
          exchangeTokens: { NFO: [instrument.token] }
        })
      });
    } catch(networkErr){
      console.error("[angelone] quote network error for " + underlying + ": " + (networkErr && networkErr.message));
      return { ok:false, status:"UNAVAILABLE", symbol: underlying, message: "Could not reach Angel One quote endpoint: " + (networkErr && networkErr.message) };
    }

    if(!resp.ok){
      console.error("[angelone] quote HTTP failure for " + underlying + ", status " + resp.status);
      if(resp.status===429) console.error("[angelone] rate-limited by Angel One (429) on quote call for " + underlying);
      return { ok:false, status:"UNAVAILABLE", symbol: underlying, message: "Angel One quote API returned status " + resp.status };
    }

    var json = await resp.json();
    var fetched = json && json.data && json.data.fetched;
    if(!fetched || !fetched.length){
      console.warn("[angelone] quote for " + underlying + " (token " + instrument.token + ") returned empty fetched[]" + (json && json.data && json.data.unfetched && json.data.unfetched.length ? " - unfetched: " + JSON.stringify(json.data.unfetched) : ""));
      return { ok:false, status:"UNAVAILABLE", symbol: underlying, message: "Angel One returned no quote data for " + underlying };
    }

    var normalized = normalizeQuote(fetched[0], instrument);
    if(!normalized || !Number.isFinite(normalized.ltp)){
      console.warn("[angelone] quote for " + underlying + " (token " + instrument.token + ") had no valid finite LTP - refusing to label it LIVE");
      return { ok:false, status:"UNAVAILABLE", symbol: underlying, message: "Angel One returned incomplete quote data (invalid LTP) for " + underlying };
    }
    console.log("[angelone] quote OK for " + underlying + " (" + normalized.symbol + "): ltp=" + normalized.ltp + " volume=" + normalized.volume + " oi=" + normalized.oi);
    return { ok:true, status:"LIVE", data: normalized };
  } catch(err){
    // No fake/demo fallback, ever - an honest unavailable state instead.
    console.error("[angelone] getFuturesQuote(" + underlying + ") failed: " + (err && err.message));
    return { ok:false, status:"UNAVAILABLE", symbol: underlying, message: err && err.message ? err.message : "Angel One SmartAPI is not connected." };
  }
}

// ---------------------------------------------------------------------
// A NOTE ON THE "WEBSOCKET SUPPORT FOR LIVE FUTURES TICKS" REQUIREMENT
// ---------------------------------------------------------------------
// Angel One's SmartAPI WebSocket (v2, wss://smartapisocket.angelone.in/smart-stream)
// is designed to be connected to from a Node process using custom
// connection headers (Authorization/x-api-key/x-client-code/x-feed-token).
// Browsers cannot set custom headers on a WebSocket handshake, so a
// frontend page cannot open this connection directly and safely - and this
// backend module runs as a stateless Vercel serverless function, which is
// not a persistent process and cannot hold an open WebSocket connection
// between separate invocations either.
//
// That's why the WebSocket relay (server/futures-ws-relay.js in this
// delivery) is a SEPARATE, always-on Node service, not another file in
// api/. It is the one piece of this adapter that cannot run on Vercel as
// currently deployed - see that file's header comment for what it needs
// and where to host it.
