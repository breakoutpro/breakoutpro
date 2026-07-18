// BreakoutPro - api/providers/dhan.js
// Dhan-specific data provider. Runs ONLY on the server (Vercel function).
// Token read from environment variables - NEVER exposed to browser.
// To add Angel One later: create providers/angelone.js with the same exported
// function names, then point market.js to it. App code never changes.

var DHAN_BASE = "https://api.dhan.co/v2";

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

function postJSON(path, body){
  return fetch(DHAN_BASE + path, {
    method:"POST",
    headers:headers(),
    body:JSON.stringify(body)
  }).then(function(r){ return r.json(); });
}

// Marketfeed LTP for a set of indices/stocks.
// Dhan expects { NSE_EQ:[ids], IDX_I:[ids], ... }
export function getIndices(){
  var ids = {};
  ids.IDX_I = [];
  for(var k in SEC){ if(SEC.hasOwnProperty(k)) ids.IDX_I.push(Number(SEC[k].id)); }
  return postJSON("/marketfeed/ltp", ids).then(function(j){
    return normalizeIndices(j);
  });
}

export function getQuote(symbol){
  var s = SEC[symbol];
  if(!s) return Promise.resolve(null);
  var body = {}; body[s.seg] = [Number(s.id)];
  return postJSON("/marketfeed/quote", body).then(function(j){ return j; });
}

export function getOptionChain(symbol, expiry){
  var s = SEC[symbol];
  if(!s) return Promise.resolve(null);
  return postJSON("/optionchain", {
    UnderlyingScrip: Number(s.id),
    UnderlyingSeg: s.seg,
    Expiry: expiry
  }).then(function(j){ return j; });
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
  }).then(function(j){ return j; });
}

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
