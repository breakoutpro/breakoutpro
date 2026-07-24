// BreakoutPro - StrategyBuilderData.jsx
// Static reference data for the Strategy Builder.
// Rules: no backtick, no triple-equals, ASCII only.

export var MARKETS = ["Equity","Options","Futures"];
export var TIMEFRAMES = ["1m","5m","15m","1h","1D","1W"];
export var SORT_OPTIONS = ["Newest","Oldest","Favourite","Most Used"];

// Pre-trade checklist - ephemeral per use, not stored as history. Exactly
// the six items requested.
export var CHECKLIST_ITEMS = [
  "Trend confirmed",
  "Support/Resistance marked",
  "Volume confirmed",
  "Risk calculated",
  "RR >= 1:2",
  "Emotion under control"
];
