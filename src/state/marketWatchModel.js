// BreakoutPro - src/state/marketWatchModel.js
// Pure model for Global & Indian Market Watch.
// Maps raw feeds (market-mood indices, global items, macro items, futures ticks) into
// verified, categorized, formatted rows.
//
// DATA INTEGRITY CONTRACT:
// 1. Never fabricate quotes, changes, timestamps, or instrument availability.
// 2. LIVE: provider-verified non-delayed quote with timestamp < 2 min and open session.
// 3. DELAYED: provider reports delay or delayed feed during active session.
// 4. LAST CLOSE: market closed session with the last completed session price and timestamp.
// 5. STALE: quote timestamp older than tolerance.
// 6. UNAVAILABLE: "Data feed not connected" for unsupported feeds (GIFT NIFTY, MCX INR).
// 7. Never display NYMEX/COMEX USD futures as MCX INR prices.
// Rules: no backtick, no triple-equals, ASCII only.

export var CATEGORIES = [
  { id:"india", labelKey:"mw.tab_india", fallback:"India" },
  { id:"global", labelKey:"mw.tab_global", fallback:"Global" },
  { id:"commodities", labelKey:"mw.tab_commodities", fallback:"Commodities" },
  { id:"currencies", labelKey:"mw.tab_currencies", fallback:"Currencies" }
];

export var INSTRUMENTS = {
  india: [
    { id:"NIFTY", name:"NIFTY 50", exchange:"NSE", type:"index", feedKey:"NIFTY", route:"markets", isIndex:true },
    { id:"BANKNIFTY", name:"BANK NIFTY", exchange:"NSE", type:"index", feedKey:"BANKNIFTY", route:"markets", isIndex:true },
    { id:"SENSEX", name:"SENSEX", exchange:"BSE", type:"index", feedKey:"SENSEX", route:"markets", isIndex:true },
    { id:"GIFTNIFTY", name:"GIFT NIFTY", exchange:"NSE IX", type:"index", unsupported:true, note:"No verified public feed" },
    { id:"VIX", name:"INDIA VIX", exchange:"NSE", type:"volatility", feedKey:"VIX", route:"markets" },
    { id:"NIFTY_FUT", name:"NIFTY 50 Futures", exchange:"NSE FO", type:"future", futSym:"NIFTY", route:"optionsintelpro" },
    { id:"BANKNIFTY_FUT", name:"BANK NIFTY Futures", exchange:"NSE FO", type:"future", futSym:"BANKNIFTY", route:"optionsintelpro" }
  ],
  global: [
    { id:"SP500", name:"S&P 500", exchange:"Cboe / S&P", type:"global", globalName:"S&P 500", route:"globalmarketspro" },
    { id:"NASDAQ", name:"NASDAQ Composite", exchange:"NASDAQ", type:"global", globalName:"Nasdaq", route:"globalmarketspro" },
    { id:"DOW", name:"DOW JONES", exchange:"DJIA / NYSE", type:"global", globalName:"Dow Jones", route:"globalmarketspro" },
    { id:"DXY", name:"DXY (US Dollar Index)", exchange:"ICE", type:"macro", globalName:"Dollar Index", route:"globalmarketspro" },
    { id:"US10Y", name:"US 10-Year Treasury Yield", exchange:"Cboe", type:"yield", globalName:"US 10-Yr Yield", route:"globalmarketspro", unit:"%" }
  ],
  commodities: [
    { id:"MCX_GOLD", name:"MCX Gold (INR)", exchange:"MCX", type:"commodity_mcx", unsupported:true, note:"No verified MCX provider" },
    { id:"MCX_SILVER", name:"MCX Silver (INR)", exchange:"MCX", type:"commodity_mcx", unsupported:true, note:"No verified MCX provider" },
    { id:"MCX_CRUDE", name:"MCX Crude Oil (INR)", exchange:"MCX", type:"commodity_mcx", unsupported:true, note:"No verified MCX provider" },
    { id:"MCX_NATGAS", name:"MCX Natural Gas (INR)", exchange:"MCX", type:"commodity_mcx", unsupported:true, note:"No verified MCX provider" },
    { id:"BRENT", name:"Brent Crude Oil", exchange:"ICE (USD)", type:"commodity_usd", globalName:"Brent Crude", route:"commodity", unit:"$" },
    { id:"WTI", name:"WTI Crude Oil", exchange:"NYMEX (USD)", type:"commodity_usd", globalName:"Crude Oil (WTI)", route:"commodity", unit:"$" }
  ],
  currencies: [
    { id:"USDINR", name:"USD/INR", exchange:"Forex", type:"currency", globalName:"USD/INR", route:"markets", digits:4 },
    { id:"EURINR", name:"EUR/INR", exchange:"Forex", type:"currency", globalName:"EUR/INR", route:"markets", digits:4 },
    { id:"GBPINR", name:"GBP/INR", exchange:"Forex", type:"currency", globalName:"GBP/INR", route:"markets", digits:4 },
    { id:"USDJPY", name:"USD/JPY", exchange:"Forex", type:"currency", globalName:"USD/JPY", route:"markets", digits:2 }
  ]
};

var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function formatIstTime(ts, nowMs){
  if(!ts || typeof ts != "number" || !isFinite(ts)) return "";
  var d = new Date(ts);
  if(isNaN(d.getTime())) return "";
  var now = new Date(nowMs || Date.now());
  var h = d.getHours();
  var m = d.getMinutes();
  var timeStr = (h < 10 ? "0" + h : "" + h) + ":" + (m < 10 ? "0" + m : "" + m) + " IST";
  var sameDay = d.getFullYear() == now.getFullYear() && d.getMonth() == now.getMonth() && d.getDate() == now.getDate();
  if(sameDay) return timeStr;
  return d.getDate() + " " + MONTHS[d.getMonth()] + " " + timeStr;
}

export function formatPriceValue(val, def){
  if(val == null || typeof val != "number" || !isFinite(val)) return null;
  var digits = def && def.digits != null ? def.digits : (val >= 1000 ? 2 : (val >= 100 ? 2 : (val >= 1 ? 2 : 4)));
  var fixed = val.toFixed(digits);
  var parts = fixed.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  var out = parts.join(".");
  if(def && def.unit == "$") return "$" + out;
  if(def && def.unit == "%") return out + "%";
  return out;
}

export function formatChangePercent(chg){
  if(chg == null || typeof chg != "number" || !isFinite(chg)) return null;
  var s = (chg > 0 ? "+" : "") + chg.toFixed(2) + "%";
  return s;
}

function findGlobalItem(data, name){
  if(!data || !data.global || !data.global.items) return null;
  var list = data.global.items;
  for(var i = 0; i < list.length; i++){
    if(list[i].name == name) return list[i];
  }
  return null;
}

// Builds one normalized instrument card/row from live feeds
export function resolveInstrument(def, mmData, futuresData, nowMs){
  var now = nowMs || Date.now();
  if(def.unsupported){
    return {
      id: def.id,
      name: def.name,
      exchange: def.exchange,
      connected: false,
      status: "UNAVAILABLE",
      statusLabel: "Data feed not connected",
      value: null,
      valFormatted: null,
      changePercent: null,
      chgFormatted: null,
      dir: "neutral",
      timestamp: null,
      timeFormatted: "",
      route: def.route || null,
      isIndex: !!def.isIndex,
      note: def.note || ""
    };
  }

  // 1. Futures feed check
  if(def.type == "future"){
    var fut = futuresData && def.futSym && (futuresData[def.futSym] || futuresData[def.futSym.toUpperCase()]);
    if(!fut || fut.ltp == null){
      return {
        id: def.id,
        name: def.name,
        exchange: def.exchange,
        connected: false,
        status: "UNAVAILABLE",
        statusLabel: "Data feed not connected",
        value: null,
        valFormatted: null,
        changePercent: null,
        chgFormatted: null,
        dir: "neutral",
        timestamp: null,
        timeFormatted: "",
        route: def.route || null,
        isIndex: false,
        note: "Angel One futures feed not active"
      };
    }
    var fLtp = Number(fut.ltp);
    var fChg = fut.changePct != null ? Number(fut.changePct) : null;
    var fTs = fut.exchangeFeedTime ? Number(fut.exchangeFeedTime) : null;
    var fDir = fChg != null && isFinite(fChg) ? (fChg > 0 ? "up" : (fChg < 0 ? "down" : "neutral")) : "neutral";
    return {
      id: def.id,
      name: def.name,
      exchange: def.exchange,
      connected: true,
      status: fut.status || "LIVE",
      statusLabel: fut.status == "LIVE" ? "LIVE" : "DELAYED",
      value: fLtp,
      valFormatted: formatPriceValue(fLtp, def),
      changePercent: fChg,
      chgFormatted: formatChangePercent(fChg),
      dir: fDir,
      timestamp: fTs,
      timeFormatted: formatIstTime(fTs, now),
      route: def.route || null,
      isIndex: false,
      note: fut.expiry ? "Exp: " + fut.expiry : ""
    };
  }

  // 2. Core Indian Indices
  if(def.type == "index" || def.type == "volatility"){
    var idx = mmData && mmData.indices && mmData.indices[def.feedKey];
    if(!idx || idx.ltp == null){
      return {
        id: def.id,
        name: def.name,
        exchange: def.exchange,
        connected: false,
        status: "UNAVAILABLE",
        statusLabel: "Unavailable",
        value: null,
        valFormatted: null,
        changePercent: null,
        chgFormatted: null,
        dir: "neutral",
        timestamp: null,
        timeFormatted: "",
        route: def.route || null,
        isIndex: !!def.isIndex
      };
    }
    var ltp = Number(idx.ltp);
    var chg = idx.chgPct != null ? Number(idx.chgPct) : null;
    var ts = idx.ts ? Number(idx.ts) : null;
    var isClosed = mmData.session && mmData.session.status == "closed";
    var ageSec = ts ? Math.max(0, (now - ts) / 1000) : 999999;
    var status = "LIVE";
    var statusLabel = "LIVE";
    if(isClosed){
      status = "LAST_CLOSE";
      statusLabel = "Last Close";
    } else if(ageSec > 900){
      status = "STALE";
      statusLabel = "STALE";
    } else if(ageSec > 120 || (idx.freshness && idx.freshness.status == "DELAYED")){
      status = "DELAYED";
      statusLabel = "DELAYED";
    }
    var dir = chg != null && isFinite(chg) ? (chg > 0 ? "up" : (chg < 0 ? "down" : "neutral")) : "neutral";
    return {
      id: def.id,
      name: def.name,
      exchange: def.exchange,
      connected: true,
      status: status,
      statusLabel: statusLabel,
      value: ltp,
      valFormatted: formatPriceValue(ltp, def),
      changePercent: chg,
      chgFormatted: formatChangePercent(chg),
      dir: dir,
      timestamp: ts,
      timeFormatted: formatIstTime(ts, now),
      route: def.route || null,
      isIndex: !!def.isIndex
    };
  }

  // 3. Global items (Global indices, macro, commodities, currencies)
  var gItem = findGlobalItem(mmData, def.globalName);
  if(!gItem || gItem.ltp == null){
    return {
      id: def.id,
      name: def.name,
      exchange: def.exchange,
      connected: false,
      status: "UNAVAILABLE",
      statusLabel: "Unavailable",
      value: null,
      valFormatted: null,
      changePercent: null,
      chgFormatted: null,
      dir: "neutral",
      timestamp: null,
      timeFormatted: "",
      route: def.route || null,
      isIndex: false
    };
  }

  var gLtp = Number(gItem.ltp);
  var gChg = gItem.chgPct != null ? Number(gItem.chgPct) : null;
  var gTs = gItem.ts ? Number(gItem.ts) : null;
  var gAgeSec = gTs ? Math.max(0, (now - gTs) / 1000) : 999999;
  var gStatus = "LIVE";
  var gStatusLabel = "LIVE";
  if(gAgeSec > 3600 * 24){
    gStatus = "LAST_CLOSE";
    gStatusLabel = "Last Close";
  } else if(gAgeSec > 900){
    gStatus = "STALE";
    gStatusLabel = "STALE";
  } else if(gAgeSec > 120 || gItem.freshness == "DELAYED"){
    gStatus = "DELAYED";
    gStatusLabel = "DELAYED";
  }
  var gDir = gChg != null && isFinite(gChg) ? (gChg > 0 ? "up" : (gChg < 0 ? "down" : "neutral")) : "neutral";

  return {
    id: def.id,
    name: def.name,
    exchange: def.exchange,
    connected: true,
    status: gStatus,
    statusLabel: gStatusLabel,
    value: gLtp,
    valFormatted: formatPriceValue(gLtp, def),
    changePercent: gChg,
    chgFormatted: formatChangePercent(gChg),
    dir: gDir,
    timestamp: gTs,
    timeFormatted: formatIstTime(gTs, now),
    route: def.route || null,
    isIndex: false
  };
}

// Builds the array of resolved items for a category, applying order and hidden filters
export function getCategoryItems(catId, mmData, futuresData, customConfig, nowMs){
  var defs = INSTRUMENTS[catId] || [];
  var cfg = customConfig || {};
  var order = cfg.order && cfg.order[catId];
  var hidden = cfg.hidden || {};

  var list = defs.slice();
  if(order && Array.isArray(order) && order.length > 0){
    list.sort(function(a, b){
      var idxA = order.indexOf(a.id);
      var idxB = order.indexOf(b.id);
      if(idxA < 0 && idxB < 0) return 0;
      if(idxA < 0) return 1;
      if(idxB < 0) return -1;
      return idxA - idxB;
    });
  }

  var filtered = list.filter(function(d){ return !hidden[d.id]; });
  return filtered.map(function(d){
    return resolveInstrument(d, mmData, futuresData, nowMs);
  });
}
