// BreakoutPro - AIMentorData.jsx
// Offline, rule-based AI Mentor knowledge base. No API call, no real AI
// model - this is a fixed set of hand-authored question/answer pairs with
// simple keyword matching. Every relatedModuleIds/relatedBookIds/
// relatedPracticeIds entry below references a verified real ID that
// already exists in AcademyData.jsx / BookLibraryData.jsx /
// PracticeData.jsx - nothing invented.
// Rules: no backtick, no triple-equals, ASCII only.

export var CATEGORIES = [
  "Price Action","Candlestick","Options","Futures","Risk Management",
  "Trading Psychology","Paper Trading","Trading Journal","Breakout Strategy"
];

export var SUGGESTED_QUESTIONS = [
  "What is support and resistance?",
  "What is a Doji candle?",
  "What is a Call option?",
  "What is a futures contract?",
  "Why is risk management important?",
  "What is revenge trading?",
  "What is Paper Trading?",
  "What should I track in a Trading Journal?",
  "What is a breakout?"
];

export var KNOWLEDGE_BASE = [
  {
    category:"Price Action",
    keywords:["support","resistance","zone","level"],
    question:"What is support and resistance?",
    answer:"Support is a price level where buyers have historically stepped in and price tended to bounce. Resistance is the opposite - a level where sellers have historically appeared and price tended to pull back. Both are zones based on past behavior, not guaranteed future turning points.",
    relatedModuleIds:["pa_sr"], relatedBookIds:["b_albrooks"], relatedPracticeIds:["sr_practice"]
  },
  {
    category:"Price Action",
    keywords:["trend","structure","higher high","higher low","market structure"],
    question:"What is market structure?",
    answer:"Market structure is the shape price makes over time - its swing highs and swing lows. An uptrend shows Higher Highs and Higher Lows; a downtrend shows Lower Highs and Lower Lows. It's a description of what has already happened, not a prediction.",
    relatedModuleIds:["pa_structure"], relatedBookIds:[], relatedPracticeIds:["trend_practice"]
  },
  {
    category:"Price Action",
    keywords:["bos","choch","break of structure","change of character"],
    question:"What is the difference between BOS and CHOCH?",
    answer:"BOS (Break of Structure) reflects the current trend continuing its established pattern. CHOCH (Change of Character) reflects a shift inconsistent with the current trend. Both are observations about structure that has already happened, not certainties about what comes next.",
    relatedModuleIds:["pa_bos","pa_choch"], relatedBookIds:[], relatedPracticeIds:["bos_choch_practice"]
  },
  {
    category:"Candlestick",
    keywords:["doji","indecision"],
    question:"What is a Doji candle?",
    answer:"A Doji has a very small body with the open and close nearly equal, and wicks on both sides. It reflects indecision between buyers and sellers during that period - neither side clearly won.",
    relatedModuleIds:["candles"], relatedBookIds:["b_nison"], relatedPracticeIds:["candle_id"]
  },
  {
    category:"Candlestick",
    keywords:["hammer","shooting star","wick"],
    question:"What do Hammer and Shooting Star candles mean?",
    answer:"A Hammer has a small body near the top and a long lower wick, showing sellers pushed price down but buyers pushed it back up by the close. A Shooting Star is the mirror image, with a long upper wick, showing buyers pushed up but sellers pushed it back down.",
    relatedModuleIds:["candles"], relatedBookIds:["b_nison"], relatedPracticeIds:["candle_id"]
  },
  {
    category:"Options",
    keywords:["call","put","option","strike","premium"],
    question:"What is a Call option?",
    answer:"A Call option gives the buyer the right (not the obligation) to buy an underlying asset at a fixed strike price, on or before expiry. The buyer pays a premium to the seller. Options are derivatives - their value is derived from the underlying asset's price.",
    relatedModuleIds:["optionsbasics"], relatedBookIds:["b_mcmillan"], relatedPracticeIds:[]
  },
  {
    category:"Futures",
    keywords:["futures","contract","margin","leverage","open interest"],
    question:"What is a futures contract?",
    answer:"A futures contract is an agreement to buy or sell an underlying asset at a predetermined price on a specific future date - and unlike an option, it is an obligation for both sides. Futures use margin, which creates leverage: a small deposit controls a much larger contract value.",
    relatedModuleIds:["futuresbasics"], relatedBookIds:["b_schwager"], relatedPracticeIds:[]
  },
  {
    category:"Risk Management",
    keywords:["risk","position size","stoploss","risk reward"],
    question:"Why is risk management important?",
    answer:"Risk management exists because the market's future is uncertain. Position sizing (how much capital you risk per trade) and a defined risk-to-reward ratio help ensure that being wrong sometimes doesn't turn into a capital-destroying event.",
    relatedModuleIds:["riskmgmt"], relatedBookIds:["b_tharp"], relatedPracticeIds:["risk_calc","position_size"]
  },
  {
    category:"Trading Psychology",
    keywords:["revenge trade","revenge trading","emotion","fear","greed"],
    question:"What is revenge trading?",
    answer:"Revenge trading is taking another trade immediately after a loss - often larger and less planned - purely to try to win back the loss quickly. It usually compounds the original problem rather than solving it. A calm, rules-based process decided in advance helps avoid this.",
    relatedModuleIds:["psychology"], relatedBookIds:["b_douglas"], relatedPracticeIds:["psychology_scenarios"]
  },
  {
    category:"Paper Trading",
    keywords:["paper trading","practice trading","virtual","simulate"],
    question:"What is Paper Trading?",
    answer:"Paper Trading lets you practice placing and managing trades with virtual capital, so you can build habits and test ideas without real financial risk. Breakout Pro's Paper Trading feature is available from the main app menu.",
    relatedModuleIds:[], relatedBookIds:[], relatedPracticeIds:[]
  },
  {
    category:"Trading Journal",
    keywords:["journal","track trades","log trades","review trades"],
    question:"What should I track in a Trading Journal?",
    answer:"A useful trading journal logs the real details of each trade - symbol, entry, exit, stoploss, target, strategy, and timeframe - plus honest notes on any mistakes (like early entry or revenge trading). Reviewing real patterns over time is far more useful than remembering trades selectively.",
    relatedModuleIds:[], relatedBookIds:[], relatedPracticeIds:[]
  },
  {
    category:"Breakout Strategy",
    keywords:["breakout","false breakout","fakeout","break level"],
    question:"What is a breakout?",
    answer:"A breakout is when price moves clearly beyond a previously respected support or resistance level, often with increased participation. A brief wick beyond the level is generally not treated as a confirmed breakout - a real close beyond it carries more weight.",
    relatedModuleIds:["pa_breakout","pa_fakebreakout"], relatedBookIds:["b_albrooks"], relatedPracticeIds:["pattern_id"]
  }
];

var FALLBACK_ANSWER = "This topic will be added in a future Academy update.";

export function askMentor(query){
  var q = (query||"").toLowerCase().trim();
  if(!q){
    return { matched:false, answer:FALLBACK_ANSWER, entry:null };
  }
  var best = null, bestScore = 0;
  KNOWLEDGE_BASE.forEach(function(entry){
    var score = 0;
    entry.keywords.forEach(function(k){
      if(q.indexOf(k)>=0) score++;
    });
    // Also match directly against the entry's own question text.
    if(q.length>3 && entry.question.toLowerCase().indexOf(q)>=0) score += 2;
    if(score>bestScore){ bestScore=score; best=entry; }
  });
  if(best && bestScore>0){
    return { matched:true, answer:best.answer, entry:best };
  }
  return { matched:false, answer:FALLBACK_ANSWER, entry:null };
}
