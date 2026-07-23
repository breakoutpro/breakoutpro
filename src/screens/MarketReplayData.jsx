// BreakoutPro - MarketReplayData.jsx
// Reuses the exact same real symbol map and timeframe conventions already
// proven in Chart.jsx - same /api/history.js endpoint, not a new or
// duplicate API. No fabricated data anywhere in this file.
// Rules: no backtick, no triple-equals, ASCII only.

export var SYMBOLS = [
  {sym:"NIFTY 50",   api:"^NSEI"},
  {sym:"BANK NIFTY", api:"^NSEBANK"},
  {sym:"SENSEX",     api:"^BSESN"},
  {sym:"RELIANCE",   api:"RELIANCE.NS"},
  {sym:"TCS",        api:"TCS.NS"},
  {sym:"HDFCBANK",   api:"HDFCBANK.NS"},
  {sym:"INFY",       api:"INFY.NS"},
  {sym:"WIPRO",      api:"WIPRO.NS"}
];

export var TF_MAP = {
  "15m": {interval:"15m", range:"1mo"},
  "1h":  {interval:"60m", range:"3mo"},
  "1D":  {interval:"1d",  range:"1y"},
  "1W":  {interval:"1wk", range:"5y"}
};

export var SPEEDS = [
  {id:"slow",  label:"Slow",   ms:1800},
  {id:"normal",label:"Normal", ms:1000},
  {id:"fast",  label:"Fast",   ms:400}
];
