// BreakoutPro - TradingJournalData.jsx
// Static reference data for the Trading Journal plus the deterministic,
// rule-based mistake-summary generator. This is NOT a real AI call - it
// is a lookup/rule engine over the user's own real journal entries.
// Never invents a mistake or statistic that isn't actually present in
// the user's own logged trades.
// Rules: no backtick, no triple-equals, ASCII only.

export var STRATEGIES = ["Breakout","Trend Following","Support/Resistance","Reversal","Scalping","Swing","Other"];
export var TIMEFRAMES = ["1m","5m","15m","1h","1D","1W"];

export var MISTAKE_TAGS = [
  "Early Entry","Late Entry","No Stoploss","Revenge Trade",
  "Over Trading","FOMO","Emotional Trade","Wrong Position Size"
];

// Maps a mistake tag to a short, rule-based, purely-educational note -
// never investment advice, never a directional market claim.
var MISTAKE_NOTES = {
  "Early Entry": "Consider waiting for a clearer confirmation candle before entering next time.",
  "Late Entry": "Entering after a large part of the move has already happened increases risk relative to reward.",
  "No Stoploss": "Trading without a defined stoploss removes a key safety boundary on risk.",
  "Revenge Trade": "Trading immediately after a loss to win it back quickly is a well-known pattern worth watching for.",
  "Over Trading": "A high number of trades in a short period can signal reduced selectivity.",
  "FOMO": "Entering purely because price is already moving fast can mean chasing rather than following a plan.",
  "Emotional Trade": "Trades taken outside your normal plan, driven by emotion, are worth reviewing separately from your strategy's real results.",
  "Wrong Position Size": "Position size inconsistent with your own risk plan can distort your real results either way."
};

export function generateMistakeSummary(trades){
  var tally = {};
  trades.forEach(function(t){
    (t.mistakeTags||[]).forEach(function(tag){ tally[tag] = (tally[tag]||0)+1; });
  });
  var entries = [];
  for(var k in tally){ if(tally.hasOwnProperty(k)) entries.push({ tag:k, count:tally[k] }); }
  entries.sort(function(a,b){ return b.count-a.count; });

  if(entries.length==0){
    return { hasData:false, lines:["No mistake tags logged yet - tag trades as you add them to build a real, personalized summary here."] };
  }
  var lines = entries.slice(0,3).map(function(e){
    return e.tag+" appeared in "+e.count+" of your logged trades. "+(MISTAKE_NOTES[e.tag]||"");
  });
  return { hasData:true, lines:lines, top:entries[0] };
}
