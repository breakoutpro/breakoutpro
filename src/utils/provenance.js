// BreakoutPro - provenance.js
// Single source of truth for data provenance across the app. Every metric
// or module that displays a number must declare which of these 4 states it
// is in - the UI must never blur them. This is a trust mechanism, not a
// cosmetic one: showing PROVENANCE.DEMO instead of PROVENANCE.LIVE for a
// number that isn't real-time is the difference between an honest app and
// a misleading one.
//
// LIVE        - fetched directly from a real market data API right now
//               (e.g. NIFTY/SENSEX/BANKNIFTY live price from the backend).
// CALCULATED  - not fetched directly, but computed via real math from a
//               real input (e.g. Support/Resistance zones derived from the
//               real live price; a trend-only AI Mood computed from real
//               index movement).
// DEMO        - clearly-labeled educational/illustrative data, not live and
//               not derived from a live input (e.g. NIFTY Options
//               Intelligence's PCR/Max Pain - pre-existing, disclosed demo
//               values).
// UNAVAILABLE - no real data exists and none is calculable - the module
//               says so plainly instead of estimating, reusing another
//               instrument's numbers, or scaling a demo value to fit.
//
// Rules: no backtick, no triple-equals, ASCII only.

export var PROVENANCE = {
  LIVE: "live",
  CALCULATED: "calculated",
  DEMO: "demo",
  UNAVAILABLE: "unavailable"
};

export var PROVENANCE_META = {
  live:        { label: "LIVE",        colorKey: "up",    dot: true  },
  calculated:  { label: "CALCULATED",  colorKey: "blue",  dot: true  },
  demo:        { label: "EDUCATIONAL DEMO", colorKey: "gold", dot: true },
  unavailable: { label: "NOT AVAILABLE", colorKey: "text3", dot: false }
};
