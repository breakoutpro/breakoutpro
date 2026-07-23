// BreakoutPro - MarketHeatmapData.jsx
// HONESTY NOTE: Breakout Pro's real /api/market-mood-data endpoint already
// provides real, live sector index data for IT, Auto, Pharma, FMCG, and
// Metal (see api/market-mood-data.js SECTOR_SYMS) - reused here, not
// duplicated. There is no real constituent-level data source for the
// full Nifty 50 or Bank Nifty stock lists, and no real Financial or
// Energy sector index wired in that same endpoint. Those sections use
// fixed, hand-authored illustrative figures only, clearly and
// permanently labeled "Educational / Demo Heatmap" - never Math.random,
// never presented as live.
// Rules: no backtick, no triple-equals, ASCII only.

export var DEMO_LABEL = "Educational / Demo Heatmap";

// Sectors with a REAL data source (matches api/market-mood-data.js
// SECTOR_SYMS keys exactly).
export var REAL_SECTOR_NAMES = ["IT","Auto","Pharma","FMCG","Metal"];
// Sectors requested but with no real source in the existing endpoint.
export var DEMO_SECTOR_NAMES = ["Financial","Energy"];

// Fixed illustrative constituent tiles (real company names, illustrative
// change% only - not live prices). Not exhaustive lists, representative
// subsets for education.
export var NIFTY50_DEMO = [
  {sym:"RELIANCE", chgPct:1.2}, {sym:"TCS", chgPct:-0.6}, {sym:"HDFCBANK", chgPct:0.8},
  {sym:"ICICIBANK", chgPct:1.5}, {sym:"INFY", chgPct:-1.1}, {sym:"HINDUNILVR", chgPct:0.3},
  {sym:"ITC", chgPct:-0.2}, {sym:"SBIN", chgPct:2.1}, {sym:"BHARTIARTL", chgPct:0.9},
  {sym:"KOTAKBANK", chgPct:-0.4}, {sym:"LT", chgPct:1.0}, {sym:"AXISBANK", chgPct:-1.8},
  {sym:"BAJFINANCE", chgPct:1.7}, {sym:"MARUTI", chgPct:0.5}, {sym:"ASIANPAINT", chgPct:-0.9},
  {sym:"WIPRO", chgPct:0.2}, {sym:"HCLTECH", chgPct:-0.3}, {sym:"SUNPHARMA", chgPct:1.3},
  {sym:"TATAMOTORS", chgPct:-2.2}, {sym:"NTPC", chgPct:0.6}
];

export var BANKNIFTY_DEMO = [
  {sym:"HDFCBANK", chgPct:0.8}, {sym:"ICICIBANK", chgPct:1.5}, {sym:"SBIN", chgPct:2.1},
  {sym:"KOTAKBANK", chgPct:-0.4}, {sym:"AXISBANK", chgPct:-1.8}, {sym:"INDUSINDBK", chgPct:-0.7},
  {sym:"BANKBARODA", chgPct:1.1}, {sym:"PNB", chgPct:0.4}, {sym:"FEDERALBNK", chgPct:-0.2},
  {sym:"IDFCFIRSTB", chgPct:1.9}, {sym:"AUBANK", chgPct:-1.0}, {sym:"BANDHANBNK", chgPct:0.6}
];

export var EDUCATIONAL_TEXT = {
  heatmap:"A heatmap shows many stocks or sectors at once, colored by how much each has moved, letting you scan for broad patterns quickly instead of checking each one individually.",
  changePct:"Change % shows how much a stock or index has moved from its previous close - a simple, real measure of movement, not a signal by itself.",
  sector:"Grouping stocks by sector (like IT or Pharma) shows whether a move is broad across an industry or limited to a few individual names.",
  direction:"Green tiles indicate a positive change, red indicates negative - this is a description of what already happened, not a prediction of what happens next."
};

export function generateInsight(items){
  var up = items.filter(function(i){ return i.chgPct>=0; }).length;
  var down = items.length-up;
  if(items.length==0) return "No data available to summarize.";
  if(up>down*1.5) return "More names are showing gains than losses in this view ("+up+" up vs "+down+" down). This describes the current snapshot only, not a prediction of future direction.";
  if(down>up*1.5) return "More names are showing losses than gains in this view ("+down+" down vs "+up+" up). This describes the current snapshot only, not a prediction of future direction.";
  return "Gains and losses are fairly balanced in this view ("+up+" up vs "+down+" down). This describes the current snapshot only, not a prediction of future direction.";
}
