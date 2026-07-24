// BreakoutPro - AlertCenterData.jsx
// HONESTY NOTE: Breakout Pro has no live alert-triggering engine for
// price/volume/breakout/breakdown/news/economic-event/FII-DII alerts
// (the app's only real live notification source is Market Mood's own
// label-transition alerts, a separate, already-audited system). Alert
// Center Pro is therefore a real, honest alert-RULE management center -
// users can create, enable/disable, delete, search, filter, and bookmark
// their own alert rule definitions, all genuinely stored locally. It does
// not fabricate that any alert has actually fired, and Alert History is
// shown honestly empty with a clear "Educational / Demo Alerts" label,
// never Math.random, never a fake live trigger.
// Rules: no backtick, no triple-equals, ASCII only.

export var DEMO_LABEL = "Educational / Demo Alerts";

export var ALERT_TYPES = [
  "Price Alert","Watchlist Alert","Volume Alert","Breakout Alert",
  "Breakdown Alert","News Alert","Economic Event Alert","FII/DII Alert"
];

export var TYPE_EXPLANATIONS = {
  "Price Alert":"A price alert notifies you when a symbol reaches a price level you define - useful for watching a level without checking the chart constantly.",
  "Watchlist Alert":"A watchlist alert applies a rule across your whole watchlist at once, rather than a single symbol.",
  "Volume Alert":"A volume alert watches for unusually high or low trading activity compared to a symbol's recent average.",
  "Breakout Alert":"A breakout alert watches for price closing clearly beyond a resistance level you define.",
  "Breakdown Alert":"A breakdown alert watches for price closing clearly below a support level you define - the mirror image of a breakout alert.",
  "News Alert":"A news alert notifies you when new headlines mention a symbol or topic you are tracking.",
  "Economic Event Alert":"An economic event alert reminds you ahead of scheduled events like central bank meetings or inflation data releases.",
  "FII/DII Alert":"An FII/DII alert notifies you about changes in institutional buying or selling flow trends you are tracking."
};

export function generateInsight(rules){
  var enabled = rules.filter(function(r){ return r.enabled; }).length;
  var disabled = rules.length-enabled;
  if(rules.length==0) return "You have not created any alert rules yet.";
  return "You have "+rules.length+" alert rule(s) saved - "+enabled+" enabled and "+disabled+" disabled. This describes your saved rules only, not any live triggered alert.";
}
