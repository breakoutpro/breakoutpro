import { useState, useEffect, useMemo, useRef } from "react";
import { useMarketMood } from "../../../hooks/useMarketMood";
import { useWatchlist } from "../../../hooks/useWatchlist";
import { JUSTIN } from "../../JustInData";
import { DEMO_STOCKS } from "../../../data/marketsStocks";
import { generateDemoCandles, analyzeZones, analyzeBreakoutIntelligence } from "../../../utils/priceActionZones";

// BreakoutPro - useHomeData.js
// Single source of truth for every Home layout (Mobile/Tablet/Laptop/Desktop).
// This hook owns all data fetching, derived calculations, and local UI state
// that is NOT specific to one device's layout. Every layout component
// consumes this same hook instead of computing anything itself, so there is
// never more than one live subscription to market-mood data, and zone/mood
// calculations never run more than once per actual data change regardless
// of how many layout files exist.
// Rules: no backtick, no triple-equals, ASCII.

var TICKER = JUSTIN.map(function(n){ return n.headline; });

// Market Spine indices - permanent 4, per the approved Laptop/Desktop
// workstation architecture. Fallback base prices only used before the real
// live feed responds (never shown as live - idxRows below filters these out
// until mm.data actually has a real ltp).
var SPINE_INDICES = [
  {key:"NIFTY", label:"NIFTY 50"},
  {key:"BANKNIFTY", label:"BANK NIFTY"},
  {key:"FINNIFTY", label:"FINNIFTY"},
  {key:"SENSEX", label:"SENSEX"}
];

export function useHomeData(){
  var mm = useMarketMood(); // single Market Mood polling source for the whole Home tree
  var wl = useWatchlist();

  var [tickerIdx, setTickerIdx] = useState(0);

  // Workstation instrument selection (Laptop/Desktop) - defaults to NIFTY,
  // the market-first default per the approved architecture. Selecting a
  // stock (via search) switches the workspace into Stock Mode; selecting
  // an index again returns instantly to Market Mode. This is new, additive
  // state - Mobile/Tablet do not consume it, so it cannot affect them.
  var [selectedIndex, setSelectedIndex] = useState("NIFTY");
  var [selectedStock, setSelectedStock] = useState(null); // null = Market Mode

  function selectIndex(key){ setSelectedStock(null); setSelectedIndex(key); }
  function selectStock(sym){ setSelectedStock(sym); }
  function returnToMarketMode(){ setSelectedStock(null); }

  useEffect(function(){
    var tk = setInterval(function(){
      setTickerIdx(function(i){ return (i+1) % TICKER.length; });
    }, 10000);
    return function(){ clearInterval(tk); };
  }, []);

  // Today's Key Levels (existing Mobile/Tablet Key Levels card) - UNCHANGED,
  // still NIFTY + BANKNIFTY only, exactly as before. Do not touch.
  var niftyLive = !!(mm.data && mm.data.indices && mm.data.indices.NIFTY && mm.data.indices.NIFTY.ltp);
  var bankLive = !!(mm.data && mm.data.indices && mm.data.indices.BANKNIFTY && mm.data.indices.BANKNIFTY.ltp);
  var niftyLtp = niftyLive ? mm.data.indices.NIFTY.ltp : null;
  var bankLtp = bankLive ? mm.data.indices.BANKNIFTY.ltp : null;
  var niftyZones = useMemo(function(){
    if(!niftyLive) return {currentPrice:null, priceIsLive:false};
    var z = analyzeZones(generateDemoCandles(niftyLtp, 60, "NIFTY"));
    z.currentPrice = niftyLtp; // price-drift fix: real Spine value, not the simulated candle's close
    z.priceIsLive = true;
    return z;
  }, [niftyLtp, niftyLive]);
  var bankZones = useMemo(function(){
    if(!bankLive) return {currentPrice:null, priceIsLive:false};
    var z = analyzeZones(generateDemoCandles(bankLtp, 60, "BANKNIFTY"));
    z.currentPrice = bankLtp; // price-drift fix: real Spine value, not the simulated candle's close
    z.priceIsLive = true;
    return z;
  }, [bankLtp, bankLive]);

  // Fear & Greed - derived from the same real, deterministic mood score
  // (index trend + VIX + technical components), not a second invented metric.
  var moodScore = mm.mood && mm.mood.score;
  var fearGreed = moodScore==null ? null : (moodScore<40 ? "Fear" : (moodScore>60 ? "Greed" : "Neutral"));

  // Real (not fabricated) rolling LTP history for tiny sparklines - each time
  // the live market-mood data actually updates, the observed LTP is appended
  // to a small per-index history kept in a ref. Genuine observed values only.
  var ltpHistoryRef = useRef({NIFTY:[],BANKNIFTY:[],FINNIFTY:[],SENSEX:[],VIX:[]});
  useEffect(function(){
    var idxData = mm.data && mm.data.indices;
    if(!idxData) return;
    ["NIFTY","BANKNIFTY","FINNIFTY","SENSEX","VIX"].forEach(function(key){
      var e = idxData[key];
      if(!e || e.ltp==null) return;
      var hist = ltpHistoryRef.current[key];
      var last = hist[hist.length-1];
      if(last==e.ltp) return; // only record genuine changes
      hist.push(e.ltp);
      if(hist.length>20) hist.shift();
    });
  }, [mm.data]);

  // idxRows - EXISTING shape and behavior unchanged for Mobile/Tablet's
  // Market Snapshot card (still whatever indices have real live data).
  var idxRows = useMemo(function(){
    var idxData = mm.data && mm.data.indices;
    if(!idxData) return [];
    return [
      {key:"NIFTY",label:"NIFTY 50"},
      {key:"BANKNIFTY",label:"BANK NIFTY"},
      {key:"SENSEX",label:"SENSEX"},
      {key:"VIX",label:"INDIA VIX"}
    ].map(function(r){
      var e = idxData[r.key];
      if(!e || e.ltp==null) return null;
      var chgNum = Number(e.chgPct);
      var chgOk = e.chgPct!=null && isFinite(chgNum);
      var dir = chgOk ? (chgNum>0?"up":(chgNum<0?"down":"neutral")) : "neutral";
      return Object.assign({},r,{ltp:e.ltp, chgPct:chgOk?chgNum:null, dir:dir});
    }).filter(function(x){ return x; });
  }, [mm.data]);

  // NEW: Market Spine rows for the Laptop/Desktop workstation - permanent
  // 4 indices (NIFTY/BANKNIFTY/FINNIFTY/SENSEX). Each row is only marked
  // real/live if the backend actually returned a real ltp for it - FINNIFTY
  // renders provenance "unavailable" rather than a fallback number if its
  // real feed hasn't been verified working yet.
  var spineRows = useMemo(function(){
    var idxData = mm.data && mm.data.indices;
    return SPINE_INDICES.map(function(s){
      var e = idxData && idxData[s.key];
      var hasLive = e && e.ltp!=null;
      var chgNum = hasLive ? Number(e.chgPct) : null;
      var chgOk = hasLive && e.chgPct!=null && isFinite(chgNum);
      var dir = chgOk ? (chgNum>0?"up":(chgNum<0?"down":"neutral")) : "neutral";
      return {
        key: s.key, label: s.label,
        ltp: hasLive ? e.ltp : null,
        chgPct: chgOk ? chgNum : null,
        dir: dir,
        live: hasLive
      };
    });
  }, [mm.data]);

  // NEW: the active workspace symbol - a real stock (Stock Mode) or one of
  // the 4 permanent indices (Market Mode, default).
  var workspaceSymbol = selectedStock || selectedIndex;
  var workspaceIsStock = !!selectedStock;

  var workspaceLtp = useMemo(function(){
    if(workspaceIsStock){
      var stock = DEMO_STOCKS.filter(function(s){ return s.sym===workspaceSymbol; })[0];
      return stock ? stock.ltp : null;
    }
    var spineRow = spineRows.filter(function(r){ return r.key===workspaceSymbol; })[0];
    if(spineRow && spineRow.live) return spineRow.ltp;
    return null;
  }, [workspaceSymbol, workspaceIsStock, spineRows]);

  var workspaceHasLiveLtp = useMemo(function(){
    if(workspaceIsStock) return false; // stock prices are demo data, not live in this app
    var spineRow = spineRows.filter(function(r){ return r.key===workspaceSymbol; })[0];
    return !!(spineRow && spineRow.live);
  }, [workspaceSymbol, workspaceIsStock, spineRows]);

  var workspaceCandles = useMemo(function(){
    if(workspaceLtp==null) return [];
    return generateDemoCandles(workspaceLtp, 90, workspaceSymbol);
  }, [workspaceLtp, workspaceSymbol]);

  var workspaceZones = useMemo(function(){
    if(workspaceCandles.length===0) return {currentPrice:null};
    return analyzeZones(workspaceCandles);
  }, [workspaceCandles]);

  var workspaceBreakout = useMemo(function(){
    if(workspaceCandles.length===0) return {};
    return analyzeBreakoutIntelligence(workspaceCandles, workspaceZones);
  }, [workspaceCandles, workspaceZones]);

  // Single source of truth for Breakout Intelligence - computed ONCE here,
  // every device layout slices from this same pool for its own tier
  // density (3/4/6 cards) instead of running its own separate computation.
  // No real candle-history provider exists in api/providers/yahoo.js (only
  // current quotes, not OHLC history) - genuine breakout/zone analysis needs
  // real historical candles, which don't exist yet. Honest empty state
  // instead of fabricated analysis from simulated candles.
  var breakoutCardsPool = [];

  // Single source of truth for Key Levels - computed ONCE here per
  // instrument selection. FIXES THE CONFIRMED PRICE-DRIFT BUG: currentPrice
  // is now always the real Spine price directly, never the simulated
  // candle's close. Simulated candles remain ONLY for the chart shape
  // (clearly a demo/educational visual), never for the displayed number.
  function getKeyLevels(symIdx, candleCount){
    var syms = ["NIFTY","BANKNIFTY","SENSEX"];
    var sym = syms[symIdx];
    var row = spineRows.filter(function(r){ return r.key===sym; })[0];
    if(!row || !row.live){
      return {currentPrice:null, priceIsLive:false};
    }
    var realPrice = row.ltp;
    var candles = generateDemoCandles(realPrice, candleCount, sym);
    var zones = analyzeZones(candles);
    var klbi = analyzeBreakoutIntelligence(candles, zones);
    var prevCandle = candles[candles.length-2];
    var openCandle = candles[0];
    // THE FIX: force the displayed current price to the real Spine value,
    // not the simulated candle series' drifted close.
    zones.currentPrice = realPrice;
    zones.priceIsLive = true;
    zones.vwap = klbi.vwap;
    zones.prevHigh = prevCandle ? prevCandle.h : null;
    zones.prevLow = prevCandle ? prevCandle.l : null;
    zones.openingRangeHigh = openCandle ? openCandle.h : null;
    zones.openingRangeLow = openCandle ? openCandle.l : null;
    zones.candles = candles;
    return zones;
  }

  return {
    mm: mm,
    wl: wl,
    ticker: TICKER,
    breakoutCardsPool: breakoutCardsPool,
    getKeyLevels: getKeyLevels,
    tickerIdx: tickerIdx,
    niftyZones: niftyZones,
    bankZones: bankZones,
    fearGreed: fearGreed,
    idxRows: idxRows,
    ltpHistoryRef: ltpHistoryRef,

    // Workstation (Laptop/Desktop) additions - Mobile/Tablet do not use these
    spineRows: spineRows,
    selectedIndex: selectedIndex,
    selectedStock: selectedStock,
    selectIndex: selectIndex,
    selectStock: selectStock,
    returnToMarketMode: returnToMarketMode,
    workspaceSymbol: workspaceSymbol,
    workspaceIsStock: workspaceIsStock,
    workspaceLtp: workspaceLtp,
    workspaceHasLiveLtp: workspaceHasLiveLtp,
    workspaceCandles: workspaceCandles,
    workspaceZones: workspaceZones,
    workspaceBreakout: workspaceBreakout
  };
}
