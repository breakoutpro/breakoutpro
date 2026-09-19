// src/utils/searchStocks.js
//
// ONE shared stock-search function. Desktop's header search (App.jsx's
// GlobalHeader) and mobile's SearchScreen.jsx both call this - neither
// keeps its own filter logic or its own symbol list. This is the fix for
// mobile search previously using a separate, much smaller, differently-
// shaped local array (SearchScreen.jsx's old "UNIVERSE" const) that didn't
// even have an Adani entry, while desktop already searched the real,
// shared DEMO_STOCKS list. Same dataset, same matching rule, everywhere.
//
// Matching rule: case-insensitive substring match against either the
// symbol or the company name - this was already desktop's rule; mobile
// previously only matched against symbol, which is also fixed by sharing
// this one function.

import { DEMO_STOCKS } from "../data/marketsStocks";

export function searchStocks(query, limit){
  if(!query) return [];
  var q = String(query).toLowerCase();
  var results = DEMO_STOCKS.filter(function(s){
    return s.sym.toLowerCase().indexOf(q)>=0 || s.name.toLowerCase().indexOf(q)>=0;
  });
  return typeof limit==="number" ? results.slice(0, limit) : results;
}
