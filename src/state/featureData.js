// BreakoutPro - src/state/featureData.js
// Central data-ownership registry + access guard. Enforces single ownership per
// the frozen Phase 0 architecture. Every feature declares what it owns and what
// it may NOT touch. Rules: no backtick, no triple-equals, ASCII only.

// Each feature: owner concept, allowed data keys, blocked data keys.
export var FEATURES = {
  marketMood: {
    id: "marketMood",
    owner: "Overall Market Condition",
    allowed: ["indices", "vix", "breadth", "global", "newsImpact", "context3d"],
    blocked: ["stockLevel", "watchlist", "priceStructure", "probability", "coach"]
  },
  priceAction: {
    id: "priceAction",
    owner: "Price Behaviour",
    allowed: ["stockHistory", "indexStructure"],
    blocked: ["moodScore", "watchlistHealth", "probabilityPct", "coach"]
  },
  traderCoach: {
    id: "traderCoach",
    owner: "Trading Education",
    allowed: ["journal", "streak", "curriculum"],
    blocked: ["indices", "vix", "stockLevel", "watchlist", "moodScore", "probability"]
  },
  watchlistAI: {
    id: "watchlistAI",
    owner: "User Watchlist",
    allowed: ["watchlist", "stockHistory"],
    blocked: ["wholeMarket", "moodScore", "nonWatchlistStocks"]
  },
  breakoutProbability: {
    id: "breakoutProbability",
    owner: "Probability Engine",
    allowed: ["stockHistory", "pattern", "volume"],
    blocked: ["moodScore", "priceActionNarrative", "coach"]
  },
  scannerHub: {
    id: "scannerHub",
    owner: "Stock Discovery",
    allowed: ["quotes", "scanFilters"],
    blocked: ["aiNarrative", "moodScore", "probability"]
  },
  marketDashboard: {
    id: "marketDashboard",
    owner: "Raw Market Data",
    allowed: ["indices", "gift", "vix", "gainers", "losers", "sectorPerformance"],
    blocked: ["aiInterpretation", "moodScore", "narrative"]
  },
  aiNews: {
    id: "aiNews",
    owner: "News Intelligence",
    allowed: ["news", "newsSummary", "newsImpactTag"],
    blocked: ["moodScore"]
  },
  learn: {
    id: "learn",
    owner: "Trading Education Library",
    allowed: ["learnContent"],
    blocked: ["marketData", "stockData"]
  }
};

// Return the feature that owns a given data key (single owner guarantee).
export function ownerOf(dataKey){
  for(var id in FEATURES){
    if(!FEATURES.hasOwnProperty(id)) continue;
    if(FEATURES[id].allowed.indexOf(dataKey) >= 0) return id;
  }
  return null;
}

// Guard: can this feature access this data key? (false = ownership violation)
export function canAccess(featureId, dataKey){
  var f = FEATURES[featureId];
  if(!f) return false;
  if(f.blocked.indexOf(dataKey) >= 0) return false;
  return f.allowed.indexOf(dataKey) >= 0;
}

// Dev-time assertion: warn if a feature tries blocked data (no throw in prod).
export function assertAccess(featureId, dataKey){
  if(!canAccess(featureId, dataKey)){
    try{ if(typeof console!="undefined") console.warn("[featureData] " + featureId + " may not access " + dataKey); }catch(e){}
    return false;
  }
  return true;
}

