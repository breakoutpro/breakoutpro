// BreakoutPro - MarketMoodDemoData.js
// DEMO data provider for AI Market Mood, used ONLY until live NSE/BSE APIs
// are connected. Returns data in the EXACT same shape MarketMood.jsx
// already expects from the real useMarketMood() hook (mood/ai/data.*) -
// so when live data is ready, only the import in MarketMood.jsx changes
// (swap DEMO_MM for the real mm prop), the UI/composition code never
// needs to change. Every value here is deterministic, matching the
// provided demo screenshots - never Math.random(), never invented on
// the fly.
// Rules: no backtick, no triple-equals, ASCII only.

function idx(ltp, chgPct){
  return { ltp: ltp, chgPct: chgPct, freshness: { status: "DELAYED" } };
}

export var DEMO_MOOD = {
  score: 31,
  label: "Bearish",
  stage: "Early Downtrend",
  confidence: "Low"
};

export var DEMO_AI = {
  now: "Market momentum remains weak. Watch NIFTY resistance and market breadth before taking directional exposure.",
  whatChanged: "FII turned net sellers. NIFTY failed to sustain above resistance. VIX rising indicates caution.",
  keyDrivers: ["Global market weakness", "FII outflow", "Rising India VIX", "Weak market breadth"],
  watchNext: "NIFTY 24,250 resistance, FII flow trend, VIX above 14, global cues",
  riskNote: null
};

export var DEMO_DATA = {
  indices: {
    NIFTY: idx(24274.90, 0.35),
    BANKNIFTY: idx(51528.10, -0.12),
    SENSEX: idx(79354.12, 0.28),
    VIX: idx(12.18, -1.46)
  },
  fiiDii: "DEMO",
  sectors: {
    status: "DEMO",
    items: [
      { name:"FMCG", chgPct:1.2, up:true },
      { name:"Utilities", chgPct:0.8, up:true },
      { name:"IT", chgPct:-1.6, up:false },
      { name:"Metal", chgPct:-1.4, up:false }
    ]
  },
  global: {
    status: "DEMO",
    items: [
      { name:"Dow Jones", chgPct:-0.6, up:false },
      { name:"Nasdaq", chgPct:-0.9, up:false },
      { name:"Nikkei 225", chgPct:-0.4, up:false },
      { name:"Hang Seng", chgPct:-0.3, up:false }
    ]
  },
  vixHistory: null
};

// Support/Resistance - only place in the app where these are shown, since
// no real OHLC provider exists yet. Explicitly DEMO, matches the screenshot.
export var DEMO_LEVELS = {
  NIFTY: { support:23850, support2:23600, resistance:24250, resistance2:24550, trend:"Weak" },
  BANKNIFTY: { support:51800, support2:51200, resistance:52800, resistance2:53500, trend:"Weak" },
  SENSEX: { support:78800, resistance:80200, trend:"Weak" }
};

export var DEMO_BREADTH = { advances:812, advPct:22, declines:2764, decPct:75, unchanged:96, unchPct:3 };

export var DEMO_FII_DII = { fii:-3245, dii:2105, net:-1140 };

export var DEMO_EVOLUTION = ["Bearish", "Bearish", "Bearish"];
export var DEMO_EVOLUTION_DATES = ["14 May", "15 May", "16 May"];

export var DEMO_SCENARIOS = {
  bullish: "Above 24,250 with strong breadth and FII buying can shift momentum positive.",
  bearish: "Below 23,850 may extend weakness towards 23,600 - 23,200.",
  invalidation: "Above 24,550 NIFTY closes (strong momentum) will invalidate bearish view."
};

export var DEMO_RISK = { level:"High", note:"Rising VIX and weak breadth increase short-term risk." };
export var DEMO_TRADE_BIAS = { label:"Bearish Bias", note:"Prefer cash. Avoid aggressive longs. Wait for confirmation." };
export var DEMO_EVENTS = ["Global GDP data", "FII flow", "US Market trend"];
