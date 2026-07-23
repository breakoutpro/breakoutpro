// BreakoutPro - src/state/aiEngineRegistry.js
// AI engine contracts. Each engine declares purpose, owner, refresh, dependencies,
// allowed/blocked data, cache, fallback. Frozen per Phase 0 architecture.
// AI writes commentary text ONLY - deterministic engines own all numbers.
// Rules: no backtick, no triple-equals, ASCII only.

export var AI_ENGINES = {
  marketMood: {
    id: "marketMood",
    purpose: "Explain overall market condition",
    owner: "Overall Market Condition",
    dataRefreshMs: 10000,
    refreshMs: 120000,
    dependencies: ["/api/market-mood-data", "/api/market-mood-ai"],
    allowedData: ["indices", "vix", "breadth", "global", "newsImpact", "context3d"],
    blockedData: ["stockLevel", "watchlist", "priceStructure", "probability"],
    cacheMs: 120000,
    fallback: "deterministic_score_only"
  },
  priceAction: {
    id: "priceAction",
    purpose: "Explain how price is moving (structure/phase)",
    owner: "Price Behaviour",
    dataRefreshMs: 10000,
    refreshMs: 120000,
    dependencies: ["/api/stock-history", "/api/ai"],
    allowedData: ["stockHistory", "indexStructure"],
    blockedData: ["moodScore", "watchlistHealth", "probabilityPct", "coach"],
    cacheMs: 120000,
    fallback: "structure_classifier_only"
  },
  traderCoach: {
    id: "traderCoach",
    purpose: "Educate the trader (psychology/discipline)",
    owner: "Trading Education",
    dataRefreshMs: 0,
    refreshMs: 0,
    dependencies: ["/api/ai"],
    allowedData: ["journal", "streak", "curriculum"],
    blockedData: ["indices", "vix", "stockLevel", "watchlist", "moodScore", "probability"],
    cacheMs: 86400000,
    fallback: "static_lesson"
  },
  watchlistAI: {
    id: "watchlistAI",
    purpose: "Analyse the user watchlist only",
    owner: "User Watchlist",
    dataRefreshMs: 10000,
    refreshMs: 120000,
    dependencies: ["/api/stock-history", "/api/ai"],
    allowedData: ["watchlist", "stockHistory"],
    blockedData: ["wholeMarket", "moodScore", "nonWatchlistStocks"],
    cacheMs: 120000,
    fallback: "relative_strength_numbers_only"
  },
  breakoutProbability: {
    id: "breakoutProbability",
    purpose: "Score breakout/breakdown probability",
    owner: "Probability Engine",
    dataRefreshMs: 10000,
    refreshMs: 120000,
    dependencies: ["/api/stock-history", "/api/ai"],
    allowedData: ["stockHistory", "pattern", "volume"],
    blockedData: ["moodScore", "priceActionNarrative", "coach"],
    cacheMs: 120000,
    fallback: "deterministic_probability_only"
  }
};

// AI must never invent these - deterministic engines produce them.
export var AI_NEVER_INVENTS = ["score", "price", "news", "fiiDii", "supportResistance", "gapPrediction", "guaranteedReturn"];

export function engineOf(id){ return AI_ENGINES[id] || null; }

// Guard: is this data allowed for this engine?
export function engineCanUse(engineId, dataKey){
  var e = AI_ENGINES[engineId];
  if(!e) return false;
  if(e.blockedData.indexOf(dataKey) >= 0) return false;
  return e.allowedData.indexOf(dataKey) >= 0;
}
