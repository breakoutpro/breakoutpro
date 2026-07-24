// BreakoutPro - FiiDiiData.jsx
// IMPORTANT HONESTY NOTE: Breakout Pro's real API already marks
// fiiDii:"UNAVAILABLE" (see api/market-mood-data.js) - there is no live
// FII/DII data source connected anywhere in this app. Per spec, this
// module is built as clearly and permanently labeled EDUCATIONAL / DEMO
// DATA - fixed, hand-authored illustrative figures only, never
// Math.random, never presented as live institutional data.
// Rules: no backtick, no triple-equals, ASCII only.

export var DATA_LABEL = "Educational / Demo Data";

// Fixed illustrative daily entries (crores INR), most recent first.
// daysAgo is resolved against the real current date at render time.
export var DAILY_FLOWS = [
  { daysAgo:0, fiiBuy:8200, fiiSell:9400, diiBuy:7600, diiSell:6100 },
  { daysAgo:1, fiiBuy:7100, fiiSell:6300, diiBuy:5900, diiSell:6800 },
  { daysAgo:2, fiiBuy:9500, fiiSell:11200, diiBuy:8800, diiSell:6200 },
  { daysAgo:3, fiiBuy:6400, fiiSell:5900, diiBuy:6100, diiSell:7300 },
  { daysAgo:4, fiiBuy:10200, fiiSell:8700, diiBuy:5400, diiSell:6900 },
  { daysAgo:5, fiiBuy:7800, fiiSell:9100, diiBuy:8200, diiSell:5800 },
  { daysAgo:6, fiiBuy:8900, fiiSell:8200, diiBuy:6700, diiSell:7100 },
  { daysAgo:7, fiiBuy:6700, fiiSell:7400, diiBuy:7900, diiSell:6300 },
  { daysAgo:8, fiiBuy:9100, fiiSell:8300, diiBuy:6500, diiSell:7800 },
  { daysAgo:9, fiiBuy:7500, fiiSell:6900, diiBuy:6200, diiSell:6600 },
  { daysAgo:10, fiiBuy:8600, fiiSell:9800, diiBuy:7300, diiSell:6100 },
  { daysAgo:11, fiiBuy:9300, fiiSell:8100, diiBuy:6800, diiSell:7400 },
  { daysAgo:12, fiiBuy:7200, fiiSell:6800, diiBuy:5900, diiSell:6300 },
  { daysAgo:13, fiiBuy:8100, fiiSell:8900, diiBuy:7100, diiSell:6500 }
];

export function netFlow(entry){
  return { fiiNet: entry.fiiBuy-entry.fiiSell, diiNet: entry.diiBuy-entry.diiSell };
}

export function aggregate(entries){
  var fiiBuy=0, fiiSell=0, diiBuy=0, diiSell=0;
  entries.forEach(function(e){ fiiBuy+=e.fiiBuy; fiiSell+=e.fiiSell; diiBuy+=e.diiBuy; diiSell+=e.diiSell; });
  return { fiiBuy:fiiBuy, fiiSell:fiiSell, diiBuy:diiBuy, diiSell:diiSell, fiiNet:fiiBuy-fiiSell, diiNet:diiBuy-diiSell };
}

export var METRIC_EXPLANATIONS = {
  fiiNet:"FII (Foreign Institutional Investor) Net Flow is the difference between what foreign institutions bought and sold on a given day. A positive number means foreign buying exceeded selling.",
  diiNet:"DII (Domestic Institutional Investor) Net Flow is the difference between what domestic institutions (mutual funds, insurers, etc.) bought and sold. A positive number means domestic buying exceeded selling.",
  buyVsSell:"Comparing gross Buy and Sell activity (not just the net figure) shows how much two-way participation occurred, which the net figure alone can hide.",
  dailyFlow:"Daily flow shows single-session activity, which can be noisy and is often more meaningful when viewed alongside weekly or monthly trends.",
  weeklyFlow:"Weekly flow aggregates daily figures to smooth out single-session noise and show a short-term trend.",
  monthlyFlow:"Monthly flow aggregates a longer window, often used to observe more sustained institutional positioning trends."
};

// Rule-based only - describes what the (illustrative) numbers show, never
// predicts future price direction.
export function generateInsight(agg){
  var lines = [];
  if(agg.fiiNet>0 && agg.diiNet>0){
    lines.push("Both FII and DII net flow are positive in this period - both investor groups were net buyers in this illustrative data.");
  } else if(agg.fiiNet<0 && agg.diiNet<0){
    lines.push("Both FII and DII net flow are negative in this period - both investor groups were net sellers in this illustrative data.");
  } else if(agg.fiiNet<0 && agg.diiNet>0){
    lines.push("FII net flow is negative while DII net flow is positive in this period - a pattern sometimes described as domestic buying offsetting foreign selling. This is a description of the numbers, not a prediction.");
  } else if(agg.fiiNet>0 && agg.diiNet<0){
    lines.push("FII net flow is positive while DII net flow is negative in this period - foreign buying alongside domestic selling in this illustrative data.");
  } else {
    lines.push("Net flows are close to flat in this period based on this illustrative data.");
  }
  lines.push("This insight only describes the numbers shown above - it does not predict future market direction and is based on illustrative, not live, data.");
  return lines;
}
