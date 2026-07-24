import { useState } from "react";

// BreakoutPro - usePortfolioAnalytics.js
// Single source of truth for Portfolio Analytics Pro. One dedicated
// localStorage key, one hook. Every dashboard/allocation number is
// computed live from the real holdings array - never a separately
// stored, possibly fabricated statistic. Current price is always the
// user's own entered value - never fetched, never fake.
// Rules: no backtick, no triple-equals, ASCII only.

var KEY = "bp_portfolio_analytics";

function load(){
  try{ var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : []; }catch(e){ return []; }
}
function save(list){
  try{ localStorage.setItem(KEY, JSON.stringify(list)); }catch(e){}
}

export function usePortfolioAnalytics(){
  var [holdings, setHoldings] = useState(function(){ return load(); });

  function addHolding(raw){
    var h = {
      id: Date.now(),
      symbol: (raw.symbol||"").toUpperCase(),
      qty: parseFloat(raw.qty)||0,
      avgBuyPrice: parseFloat(raw.avgBuyPrice)||0,
      currentPrice: parseFloat(raw.currentPrice)||0,
      sector: raw.sector||"Other"
    };
    setHoldings(function(prev){
      var next = [h].concat(prev);
      save(next);
      return next;
    });
  }
  function editHolding(id, updates){
    setHoldings(function(prev){
      var next = prev.map(function(h){
        if(h.id!=id) return h;
        return Object.assign({}, h, updates);
      });
      save(next);
      return next;
    });
  }
  function deleteHolding(id){
    setHoldings(function(prev){
      var next = prev.filter(function(h){ return h.id!=id; });
      save(next);
      return next;
    });
  }

  // Real, derived-only dashboard statistics.
  function computeDashboard(){
    var totalInvestment = holdings.reduce(function(s,h){ return s+h.qty*h.avgBuyPrice; }, 0);
    var currentValue = holdings.reduce(function(s,h){ return s+h.qty*h.currentPrice; }, 0);
    var pnl = currentValue-totalInvestment;
    var pnlPct = totalInvestment>0 ? (pnl/totalInvestment)*100 : 0;
    return { totalInvestment:totalInvestment, currentValue:currentValue, pnl:pnl, pnlPct:pnlPct, count:holdings.length };
  }

  function computeCards(){
    if(holdings.length==0) return { best:null, worst:null, largest:null, highestAllocation:null };
    var withPct = holdings.map(function(h){
      var pnlPct = h.avgBuyPrice>0 ? ((h.currentPrice-h.avgBuyPrice)/h.avgBuyPrice)*100 : 0;
      return Object.assign({}, h, { pnlPct:pnlPct, value:h.qty*h.currentPrice });
    });
    var best = withPct.reduce(function(a,b){ return b.pnlPct>a.pnlPct?b:a; });
    var worst = withPct.reduce(function(a,b){ return b.pnlPct<a.pnlPct?b:a; });
    var largest = withPct.reduce(function(a,b){ return b.value>a.value?b:a; });
    var totalValue = withPct.reduce(function(s,h){ return s+h.value; }, 0);
    var highestAllocation = withPct.reduce(function(a,b){ return b.value>a.value?b:a; });
    return {
      best:best, worst:worst, largest:largest,
      highestAllocation: totalValue>0 ? Object.assign({}, highestAllocation, { allocPct:(highestAllocation.value/totalValue)*100 }) : null
    };
  }

  function computeSectorAllocation(){
    var totalValue = holdings.reduce(function(s,h){ return s+h.qty*h.currentPrice; }, 0);
    var bySector = {};
    holdings.forEach(function(h){
      var sector = h.sector||"Other";
      bySector[sector] = (bySector[sector]||0) + h.qty*h.currentPrice;
    });
    var list = [];
    for(var s in bySector){
      if(bySector.hasOwnProperty(s)){
        list.push({ sector:s, value:bySector[s], pct: totalValue>0 ? (bySector[s]/totalValue)*100 : 0 });
      }
    }
    list.sort(function(a,b){ return b.value-a.value; });
    return list;
  }

  function computeAssetAllocation(){
    // Per-holding allocation (% of portfolio each individual holding
    // represents) - distinct view from sector-level aggregation above,
    // since no separate asset-class field is collected on the form.
    var totalValue = holdings.reduce(function(s,h){ return s+h.qty*h.currentPrice; }, 0);
    var list = holdings.map(function(h){
      var value = h.qty*h.currentPrice;
      return { symbol:h.symbol, value:value, pct: totalValue>0 ? (value/totalValue)*100 : 0 };
    });
    list.sort(function(a,b){ return b.value-a.value; });
    return list;
  }

  return {
    holdings:holdings, addHolding:addHolding, editHolding:editHolding, deleteHolding:deleteHolding,
    computeDashboard:computeDashboard, computeCards:computeCards,
    computeSectorAllocation:computeSectorAllocation, computeAssetAllocation:computeAssetAllocation
  };
}
