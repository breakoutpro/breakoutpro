import { useState } from "react";

// BreakoutPro - useTradingJournal.js
// Single source of truth for the Trading Journal. One localStorage key,
// one hook, real trades only. Every statistic (win rate, avg R:R, best
// strategy, most common mistake) is computed live from the real trades
// array below - never stored as a separate, potentially-fabricated
// number. This is a genuinely separate feature domain from the Academy
// progress hook (individual real trades vs lesson/practice progress) -
// not a duplicate of it.
// Rules: no backtick, no triple-equals, ASCII only.

var KEY = "bp_trading_journal";

function load(){
  try{ var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : []; }catch(e){ return []; }
}
function save(list){
  try{ localStorage.setItem(KEY, JSON.stringify(list)); }catch(e){}
}

function computeTrade(raw){
  var entry = parseFloat(raw.entry) || 0;
  var exit = parseFloat(raw.exit) || 0;
  var qty = parseFloat(raw.qty) || 0;
  var stoploss = raw.stoploss!=null && raw.stoploss!=="" ? parseFloat(raw.stoploss) : null;
  var target = raw.target!=null && raw.target!=="" ? parseFloat(raw.target) : null;
  var dir = raw.side=="Sell" ? -1 : 1;
  var pnl = (exit-entry)*qty*dir;
  var isWin = pnl>0;
  var rr = null;
  if(stoploss!=null){
    var riskPerUnit = Math.abs(entry-stoploss);
    var rewardPerUnit = target!=null ? Math.abs(target-entry) : Math.abs(exit-entry);
    if(riskPerUnit>0) rr = rewardPerUnit/riskPerUnit;
  }
  return Object.assign({}, raw, { entry:entry, exit:exit, qty:qty, stoploss:stoploss, target:target, pnl:pnl, isWin:isWin, rr:rr });
}

export function useTradingJournal(){
  var [trades, setTrades] = useState(function(){ return load(); });

  function addTrade(raw){
    var trade = computeTrade(Object.assign({ id:Date.now(), mistakeTags:[] }, raw));
    setTrades(function(prev){
      var next = [trade].concat(prev);
      save(next);
      return next;
    });
  }
  function deleteTrade(id){
    setTrades(function(prev){
      var next = prev.filter(function(t){ return t.id!=id; });
      save(next);
      return next;
    });
  }
  function toggleMistakeTag(id, tag){
    setTrades(function(prev){
      var next = prev.map(function(t){
        if(t.id!=id) return t;
        var tags = t.mistakeTags || [];
        var has = tags.indexOf(tag)>=0;
        var newTags = has ? tags.filter(function(x){ return x!=tag; }) : tags.concat([tag]);
        return Object.assign({}, t, { mistakeTags:newTags });
      });
      save(next);
      return next;
    });
  }

  // Real, derived-only statistics - computed fresh from the trades array
  // every time, never cached as a separate stored number.
  function computeStats(filteredTrades){
    var list = filteredTrades || trades;
    var total = list.length;
    var wins = list.filter(function(t){ return t.isWin; }).length;
    var losses = total-wins;
    var winRate = total>0 ? Math.round((wins/total)*100) : 0;

    var rrList = list.filter(function(t){ return t.rr!=null && isFinite(t.rr); }).map(function(t){ return t.rr; });
    var avgRR = rrList.length>0 ? (rrList.reduce(function(a,b){ return a+b; },0)/rrList.length) : null;

    var byStrategy = {};
    list.forEach(function(t){
      var s = t.strategy || "Other";
      if(!byStrategy[s]) byStrategy[s] = { wins:0, total:0 };
      byStrategy[s].total++;
      if(t.isWin) byStrategy[s].wins++;
    });
    var bestStrategy = null, bestRate = -1;
    for(var s in byStrategy){
      if(byStrategy.hasOwnProperty(s) && byStrategy[s].total>0){
        var rate = byStrategy[s].wins/byStrategy[s].total;
        if(rate>bestRate){ bestRate=rate; bestStrategy=s; }
      }
    }

    var mistakeTally = {};
    list.forEach(function(t){
      (t.mistakeTags||[]).forEach(function(tag){ mistakeTally[tag] = (mistakeTally[tag]||0)+1; });
    });
    var mostCommonMistake = null, mostCount = 0;
    for(var m in mistakeTally){
      if(mistakeTally.hasOwnProperty(m) && mistakeTally[m]>mostCount){ mostCount=mistakeTally[m]; mostCommonMistake=m; }
    }

    return { total:total, wins:wins, losses:losses, winRate:winRate, avgRR:avgRR, bestStrategy:bestStrategy, mostCommonMistake:mostCommonMistake };
  }

  return { trades:trades, addTrade:addTrade, deleteTrade:deleteTrade, toggleMistakeTag:toggleMistakeTag, computeStats:computeStats };
}
