import { useState } from "react";

// BreakoutPro - useStrategyBuilder.js
// Single source of truth for the Strategy Builder. One dedicated
// localStorage key, one hook. Every dashboard statistic (total, favourite
// count, most used, average risk %, last edited) is computed live from
// the real strategies array below - never a separately stored, possibly
// fabricated number.
// Rules: no backtick, no triple-equals, ASCII only.

var KEY = "bp_strategy_builder";

function load(){
  try{ var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : []; }catch(e){ return []; }
}
function save(list){
  try{ localStorage.setItem(KEY, JSON.stringify(list)); }catch(e){}
}

export function useStrategyBuilder(){
  var [strategies, setStrategies] = useState(function(){ return load(); });

  function addStrategy(raw){
    var now = Date.now();
    var strategy = Object.assign({}, raw, {
      id: now, createdAt: now, updatedAt: now, favourite:false, usageCount:0
    });
    setStrategies(function(prev){
      var next = [strategy].concat(prev);
      save(next);
      return next;
    });
  }
  function editStrategy(id, updates){
    setStrategies(function(prev){
      var next = prev.map(function(s){
        if(s.id!=id) return s;
        return Object.assign({}, s, updates, { updatedAt: Date.now() });
      });
      save(next);
      return next;
    });
  }
  function deleteStrategy(id){
    setStrategies(function(prev){
      var next = prev.filter(function(s){ return s.id!=id; });
      save(next);
      return next;
    });
  }
  function duplicateStrategy(id){
    setStrategies(function(prev){
      var original = prev.filter(function(s){ return s.id==id; })[0];
      if(!original) return prev;
      var now = Date.now();
      var copy = Object.assign({}, original, {
        id: now, name: original.name+" (Copy)", createdAt: now, updatedAt: now,
        favourite:false, usageCount:0
      });
      var next = [copy].concat(prev);
      save(next);
      return next;
    });
  }
  function toggleFavourite(id){
    setStrategies(function(prev){
      var next = prev.map(function(s){
        if(s.id!=id) return s;
        return Object.assign({}, s, { favourite: !s.favourite });
      });
      save(next);
      return next;
    });
  }
  // Called whenever the user selects this strategy to use for an
  // upcoming trade (e.g. before Paper Trading or a Journal entry). Real
  // count only, incremented one at a time by actual user action.
  function incrementUsage(id){
    setStrategies(function(prev){
      var next = prev.map(function(s){
        if(s.id!=id) return s;
        return Object.assign({}, s, { usageCount: (s.usageCount||0)+1 });
      });
      save(next);
      return next;
    });
  }

  // Real, derived-only dashboard statistics.
  function computeStats(){
    var total = strategies.length;
    var favouriteCount = strategies.filter(function(s){ return s.favourite; }).length;
    var mostUsed = null, mostCount = -1;
    strategies.forEach(function(s){
      if((s.usageCount||0)>mostCount){ mostCount=s.usageCount||0; mostUsed=s; }
    });
    var riskList = strategies.map(function(s){ return parseFloat(s.riskPerTrade); }).filter(function(r){ return isFinite(r); });
    var avgRisk = riskList.length>0 ? (riskList.reduce(function(a,b){ return a+b; },0)/riskList.length) : null;
    var lastEdited = null;
    strategies.forEach(function(s){
      if(!lastEdited || s.updatedAt>lastEdited.updatedAt) lastEdited = s;
    });
    return {
      total:total, favouriteCount:favouriteCount,
      mostUsed: (mostUsed && mostCount>0) ? mostUsed : null,
      avgRisk:avgRisk, lastEdited:lastEdited
    };
  }

  return {
    strategies:strategies, addStrategy:addStrategy, editStrategy:editStrategy,
    deleteStrategy:deleteStrategy, duplicateStrategy:duplicateStrategy,
    toggleFavourite:toggleFavourite, incrementUsage:incrementUsage, computeStats:computeStats
  };
}
