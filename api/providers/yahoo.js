// BreakoutPro - api/providers/yahoo.js
// Yahoo Finance provider (free, no key). Live index + stock quotes.
// Runs server-side. Same shape as other providers.

var Q = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=";

// Yahoo symbols for Indian indices.
var IDX = {
  NIFTY:    "%5ENSEI",
  SENSEX:   "%5EBSESN",
  BANKNIFTY:"%5ENSEBANK",
  FINNIFTY: "NIFTY_FIN_SERVICE.NS",
  MIDCAP:   "%5ECRSLDX",
  VIX:      "%5EINDIAVIX"
};

function fetchQuotes(symList){
  return fetch(Q + symList, { headers:{ "User-Agent":"Mozilla/5.0" } })
    .then(function(r){ return r.json(); })
    .then(function(j){
      if(j && j.quoteResponse && j.quoteResponse.result) return j.quoteResponse.result;
      return [];
    })
    .catch(function(){ return []; });
}

export function getIndices(){
  var syms = [];
  for(var k in IDX){ if(IDX.hasOwnProperty(k)) syms.push(IDX[k]); }
  return fetchQuotes(syms.join(",")).then(function(rows){
    var byKey = {};
    rows.forEach(function(q){ byKey[q.symbol] = q; });
    var out = [];
    for(var k in IDX){
      if(!IDX.hasOwnProperty(k)) continue;
      var sym = decodeURIComponent(IDX[k]);
      var q = byKey[sym];
      if(q && q.regularMarketPrice){
        out.push({
          key:k,
          ltp:q.regularMarketPrice,
          up:(q.regularMarketChange||0)>=0,
          chgPct:Math.abs(parseFloat(q.regularMarketChangePercent||0))
        });
      }
    }
    return out.length ? out : null;
  });
}

export function getQuote(symbol){
  return fetchQuotes(symbol + ".NS").then(function(rows){
    if(!rows.length || !rows[0].regularMarketPrice) return null;
    var q = rows[0];
    return {
      sym:symbol,
      ltp:q.regularMarketPrice,
      up:(q.regularMarketChange||0)>=0,
      chgPct:Math.abs(parseFloat(q.regularMarketChangePercent||0)),
      open:q.regularMarketOpen||0,
      high:q.regularMarketDayHigh||0,
      low:q.regularMarketDayLow||0,
      prevClose:q.regularMarketPreviousClose||0,
      volume:q.regularMarketVolume||0,
      high52:q.fiftyTwoWeekHigh||0,
      low52:q.fiftyTwoWeekLow||0
    };
  });
}

export function getQuotes(symbols){
  var list = String(symbols||"").split(",").map(function(s){ return s.trim()+".NS"; }).join(",");
  return fetchQuotes(list).then(function(rows){
    return rows.map(function(q){
      return {
        sym:(q.symbol||"").replace(".NS",""),
        ltp:q.regularMarketPrice||0,
        up:(q.regularMarketChange||0)>=0,
        chgPct:Math.abs(parseFloat(q.regularMarketChangePercent||0))
      };
    });
  });
}
