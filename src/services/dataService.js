// BreakoutPro - dataService.js
// Provider-agnostic market data service. The whole app calls THIS only.
// Underneath it calls our own /api proxy (which talks to Dhan or any provider).
// To switch providers later, change only the backend proxy - app code stays same.
// Rules: no backtick, no triple-equals, ASCII only.

var BASE = "/api/market";

// Generic fetch wrapper with graceful fallback.
function call(action, params){
  var qs = "action=" + encodeURIComponent(action);
  if(params){
    for(var k in params){
      if(params.hasOwnProperty(k)) qs += "&" + k + "=" + encodeURIComponent(params[k]);
    }
  }
  return fetch(BASE + "?" + qs)
    .then(function(r){ return r.json(); })
    .then(function(j){
      if(j && j.ok) return j.data;
      return null;
    })
    .catch(function(){ return null; });
}

// Public API used across the app. Each returns a Promise.
// Components should always handle null (fallback to mock) for graceful UX.
var dataService = {
  // Indices: NIFTY, SENSEX, BANKNIFTY, FINNIFTY, MIDCAP, VIX...
  getIndices: function(){ return call("indices"); },

  // Single index detail (levels, OHLC).
  getIndex: function(symbol){ return call("index", {symbol:symbol}); },

  // One stock quote (ltp, chg, ohlc, volume).
  getQuote: function(symbol){ return call("quote", {symbol:symbol}); },

  // Many quotes at once (comma separated symbols).
  getQuotes: function(symbols){ return call("quotes", {symbols:symbols}); },

  // Option chain for an underlying + expiry.
  getOptionChain: function(symbol, expiry){ return call("optionchain", {symbol:symbol, expiry:expiry}); },

  // Market depth (bid/ask ladder).
  getMarketDepth: function(symbol){ return call("depth", {symbol:symbol}); },

  // Historical candles. interval: 1m,5m,15m,1h,1d.
  getCandles: function(symbol, interval, from, to){ return call("candles", {symbol:symbol, interval:interval, from:from, to:to}); },

  // OI + PCR + max pain summary.
  getOI: function(symbol, expiry){ return call("oi", {symbol:symbol, expiry:expiry}); },

  // FII / DII flow.
  getFlows: function(){ return call("flows"); },

  // Global markets (Dow, Nasdaq, Gold...).
  getGlobal: function(){ return call("global"); },

  // Trending: top gainers + losers.
  getTrending: function(){ return call("trending"); },

  // 52 week high / low lists.
  get52Week: function(){ return call("week52"); },

  // Full stock fundamentals by name.
  getStockFundamentals: function(name){ return call("stock", {name:name}); },

  // Upcoming / open IPOs.
  getIPO: function(){ return call("ipo"); },

  // Market news.
  getNews: function(){ return call("news"); },

  // MCX commodities.
  getCommodities: function(){ return call("commodities"); }
};

export default dataService;
