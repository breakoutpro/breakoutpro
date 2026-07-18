// BreakoutPro - GlobalMarketsData.jsx
// HONESTY NOTE: Breakout Pro's real /api/market-mood-data endpoint already
// provides real, live data for exactly 6 global instruments (see
// api/market-mood-data.js GLOBAL_SYMS: Dow Jones, Nasdaq, Nikkei 225,
// Hang Seng, Crude Oil WTI, Dollar Index) - reused here, not duplicated.
// Every other requested instrument (S&P 500, FTSE, DAX, CAC, Shanghai,
// Gift Nifty, Gold, Silver, Natural Gas, USD/INR, EUR/USD, USD/JPY) has no
// real source anywhere in this app, so those use fixed, hand-authored
// illustrative figures only, clearly and permanently labeled
// "Educational / Demo Global Markets" - never Math.random, never live.
// Rules: no backtick, no triple-equals, ASCII only.

export var DEMO_LABEL = "Educational / Demo Global Markets";

// Maps a display name to the exact real name key returned by
// /api/market-mood-data's sectors/global groups, where real data exists.
export var REAL_NAME_MAP = {
  "Dow Jones":"Dow Jones",
  "Nasdaq":"Nasdaq",
  "Nikkei":"Nikkei 225",
  "Hang Seng":"Hang Seng",
  "Crude Oil":"Crude Oil (WTI)"
};

export var REGIONS = ["US Markets","Europe","Asia","Commodities","Currency Watch"];

// Fixed illustrative change% for instruments with no real source. Never
// randomized, never claimed as live.
export var DEMO_ITEMS = {
  "US Markets": [ {name:"S&P 500", chgPct:0.4} ],
  "Europe": [ {name:"FTSE 100", chgPct:-0.3}, {name:"DAX", chgPct:0.6}, {name:"CAC 40", chgPct:-0.1} ],
  "Asia": [ {name:"Shanghai Composite", chgPct:0.2}, {name:"Gift Nifty", chgPct:0.5} ],
  "Commodities": [ {name:"Gold", chgPct:0.3}, {name:"Silver", chgPct:-0.5}, {name:"Natural Gas", chgPct:1.4} ],
  "Currency Watch": [ {name:"USD/INR", chgPct:0.1}, {name:"EUR/USD", chgPct:-0.2}, {name:"USD/JPY", chgPct:0.3} ]
};

export var REAL_ITEMS_BY_REGION = {
  "US Markets": ["Dow Jones","Nasdaq"],
  "Europe": [],
  "Asia": ["Nikkei","Hang Seng"],
  "Commodities": ["Crude Oil"],
  "Currency Watch": []
};

export var EDUCATIONAL_TEXT = {
  whyMatters:"Global markets matter because capital, sentiment, and news flow across borders - a large move in one major market can influence how traders elsewhere approach the next session.",
  overnightImpact:"Since global markets operate in different time zones, moves that happen overnight (relative to India) are often discussed the next morning as context for the local session's opening tone.",
  correlation:"Correlation describes how closely two markets tend to move together over time. It is not constant - it can strengthen or weaken depending on conditions, and it never guarantees a specific day's outcome."
};

export function generateInsight(items){
  var up = items.filter(function(i){ return i.chgPct!=null && i.chgPct>=0; }).length;
  var down = items.filter(function(i){ return i.chgPct!=null; }).length - up;
  if(up+down==0) return "No data available to summarize.";
  return "In this view, "+up+" instruments are showing gains and "+down+" are showing losses. This describes the current snapshot only, not a prediction of future market direction.";
}
