// BreakoutPro - TradeReplayData.jsx
// AI Trade Replay: static, hand-authored educational scenarios only.
// No live data, no fake prices - every candle below is an abstract
// teaching shape (0-100 relative scale) with metadata used to generate
// deterministic, rule-based explanations. This is NOT a real AI call -
// it is a lookup/rule engine over pre-authored scenario metadata, honest
// and consistent with "no new API".
// Rules: no backtick, no triple-equals, ASCII only.

// Candle psychology lookup, keyed by the same shapeId names PracticeSVG
// already defines - reused, not duplicated.
export var CANDLE_PSYCHOLOGY = {
  bullish_marubozu: "Buyers were in control for the entire period with almost no pushback - a strong, one-sided candle.",
  bearish_marubozu: "Sellers were in control for the entire period with almost no pushback - a strong, one-sided candle.",
  doji: "Neither buyers nor sellers won this period - a sign of indecision worth watching closely.",
  hammer: "Sellers pushed price down during the period, but buyers stepped in and pushed it back up by the close.",
  shooting_star: "Buyers pushed price up during the period, but sellers stepped in and pushed it back down by the close.",
  spinning_top: "A genuine tug-of-war between buyers and sellers, with neither side clearly winning."
};

// category: which practice dimension this decision point primarily tests.
// Used to compute "weak areas" and map them to Academy lesson recommendations.
export var CATEGORY_MODULE_MAP = {
  trend: { moduleId:"pa_structure", label:"Market Structure" },
  support_resistance: { moduleId:"pa_sr", label:"Support & Resistance" },
  psychology: { moduleId:"psychology", label:"Trading Psychology" },
  risk: { moduleId:"riskmgmt", label:"Risk Management" }
};

export var DIFFICULTIES = ["Beginner","Intermediate","Advanced"];

export var SCENARIOS = {
  Beginner: {
    title:"Clear Uptrend Practice",
    candles:[
      { shapeId:"bullish_marubozu", trend:"up", zone:"none", idealDecision:"wait", category:"trend", riskNote:"Early in a fresh move - no structure confirmed yet, so waiting is reasonable.", trendNote:"Price has just started moving up." },
      { shapeId:"bullish_marubozu", trend:"up", zone:"none", idealDecision:"wait", category:"trend", riskNote:"Trend is young - confirming a second push up before acting reduces risk.", trendNote:"A second strong up candle reinforces the new uptrend." },
      { shapeId:"spinning_top", trend:"up", zone:"none", idealDecision:"wait", category:"psychology", riskNote:"Indecision candles inside a trend are a normal pause, not a reason to panic either way.", trendNote:"The uptrend is pausing, not reversing yet." },
      { shapeId:"hammer", trend:"up", zone:"support", idealDecision:"buy", category:"support_resistance", riskNote:"A hammer forming right at a support zone, inside an established uptrend, is a commonly studied entry-consideration pattern - risk can be defined just below the zone.", trendNote:"Price pulled back to a support zone within the uptrend and held." },
      { shapeId:"bullish_marubozu", trend:"up", zone:"none", idealDecision:"wait", category:"risk", riskNote:"If already positioned, this is a management decision, not a fresh signal - avoid chasing more size here.", trendNote:"Uptrend resumes strongly." },
      { shapeId:"doji", trend:"up", zone:"resistance", idealDecision:"wait", category:"support_resistance", riskNote:"A doji at resistance signals hesitation right at a level with historical selling interest - a caution flag, not a sell trigger by itself.", trendNote:"Price has reached a resistance zone and stalled." },
      { shapeId:"shooting_star", trend:"up", zone:"resistance", idealDecision:"sell", category:"support_resistance", riskNote:"A shooting star at resistance, after a doji already showed hesitation, is a commonly studied caution sign for an existing long position - not a new short signal.", trendNote:"Rejection at resistance is becoming clearer." },
      { shapeId:"bearish_marubozu", trend:"down", zone:"none", idealDecision:"wait", category:"trend", riskNote:"One strong down candle alone does not confirm a new downtrend - more structure is needed before acting further.", trendNote:"A sharp down candle appears, but the broader trend has not been disproven yet." }
    ]
  },
  Intermediate: {
    title:"Range to Breakdown Practice",
    candles:[
      { shapeId:"spinning_top", trend:"range", zone:"resistance", idealDecision:"wait", category:"trend", riskNote:"Ranges require patience - acting on every touch of the edges usually adds risk without an edge.", trendNote:"Price is ranging between a support and resistance zone." },
      { shapeId:"doji", trend:"range", zone:"support", idealDecision:"wait", category:"support_resistance", riskNote:"Support holding again inside a range is expected behavior, not a fresh signal on its own.", trendNote:"Support has held for a second time." },
      { shapeId:"hammer", trend:"range", zone:"support", idealDecision:"wait", category:"psychology", riskNote:"A third touch of support can tempt an early buy - but ranges often break after repeated tests, which is exactly why patience matters here.", trendNote:"A third test of the same support zone." },
      { shapeId:"bearish_marubozu", trend:"down", zone:"support", idealDecision:"wait", category:"risk", riskNote:"A strong break of a well-tested support zone is a caution sign - jumping in immediately without confirmation adds real risk.", trendNote:"Support has broken decisively - this may be a genuine breakdown, not just noise." },
      { shapeId:"shooting_star", trend:"down", zone:"none", idealDecision:"sell", category:"trend", riskNote:"With structure now shifted to Lower Highs and Lower Lows after the breakdown, this is a commonly studied continuation context - risk can be defined above the recent high.", trendNote:"A new Lower High has formed, confirming the shift to a downtrend." },
      { shapeId:"bearish_marubozu", trend:"down", zone:"none", idealDecision:"wait", category:"risk", riskNote:"If already positioned, this is a management decision - avoid adding size purely because the move looks strong.", trendNote:"The downtrend continues." },
      { shapeId:"doji", trend:"down", zone:"support", idealDecision:"wait", category:"psychology", riskNote:"Indecision after a strong down move can mean a pause or an early reversal sign - neither is confirmed by one candle alone.", trendNote:"Price reaches a new support zone and shows hesitation." }
    ]
  },
  Advanced: {
    title:"False Breakout Practice",
    candles:[
      { shapeId:"bullish_marubozu", trend:"up", zone:"resistance", idealDecision:"wait", category:"support_resistance", riskNote:"A strong close above resistance looks convincing, but confirming with a second candle reduces the risk of reacting to a trap.", trendNote:"Price closes clearly above a well-tested resistance zone." },
      { shapeId:"spinning_top", trend:"up", zone:"resistance", idealDecision:"wait", category:"psychology", riskNote:"Hesitation immediately after a breakout is worth noting - it does not confirm a fake breakout, but it does reduce confidence.", trendNote:"Price stalls just above the broken resistance zone." },
      { shapeId:"shooting_star", trend:"up", zone:"resistance", idealDecision:"wait", category:"risk", riskNote:"A rejection candle back at the broken level is a caution sign for anyone who bought the breakout - reducing risk here is reasonable, chasing more size is not.", trendNote:"Price is pulled back toward the broken resistance level." },
      { shapeId:"bearish_marubozu", trend:"down", zone:"resistance", idealDecision:"sell", category:"support_resistance", riskNote:"Price closing back below the level it just broke is the classic definition of a false breakout - this is a commonly studied caution/exit context for a breakout buyer, with risk defined above the recent high.", trendNote:"Price closes back below the level it had broken - a textbook false breakout shape." },
      { shapeId:"bearish_marubozu", trend:"down", zone:"none", idealDecision:"wait", category:"trend", riskNote:"One confirming down candle after a false breakout does not yet establish a full new downtrend - more structure would help.", trendNote:"The false-breakout move continues downward." },
      { shapeId:"doji", trend:"down", zone:"support", idealDecision:"wait", category:"psychology", riskNote:"Indecision at the next support zone is genuinely ambiguous here - this is exactly the kind of moment where waiting for more information is the safer choice.", trendNote:"Price reaches the next support zone below and shows indecision." }
    ]
  }
};
