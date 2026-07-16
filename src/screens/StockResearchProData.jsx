// BreakoutPro - StockResearchProData.jsx
// Real technical-analysis helpers only. No fundamentals data exists
// anywhere in this app, so this file deliberately contains none -
// Company Overview, Financials, Shareholding, Valuation, SWOT, Timeline,
// Competitors, and Sector Comparison are NOT computed or faked here.
// Rules: no backtick, no triple-equals, ASCII only.

// Same 8 proven, high-confidence symbols already used by Chart.jsx - not
// a duplicate API, the same real /api/history.js source and mapping.
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

export function calcEMA(values, period){
  var k = 2/(period+1);
  var out = [];
  var prev = values[0];
  for(var i=0;i<values.length;i++){
    var v = i==0 ? values[0] : (values[i]*k + prev*(1-k));
    out.push(v);
    prev = v;
  }
  return out;
}

export function calcRSI(closes, period){
  if(closes.length<period+1) return null;
  var gains=0, losses=0;
  for(var i=closes.length-period;i<closes.length;i++){
    var diff = closes[i]-closes[i-1];
    if(diff>=0) gains+=diff; else losses-=diff;
  }
  if(gains+losses==0) return 50;
  var rs = gains/(losses||0.0001);
  return 100-(100/(1+rs));
}

export function calcMACD(closes){
  if(closes.length<26) return null;
  var ema12 = calcEMA(closes,12);
  var ema26 = calcEMA(closes,26);
  var macdLine = closes.map(function(c,i){ return ema12[i]-ema26[i]; });
  var signal = calcEMA(macdLine,9);
  var last = macdLine.length-1;
  return { macd: macdLine[last], signal: signal[last], histogram: macdLine[last]-signal[last] };
}

export function findSupportResistance(candles){
  var recent = candles.slice(-30);
  var lows = recent.map(function(c){ return c.low; });
  var highs = recent.map(function(c){ return c.high; });
  return { support: Math.min.apply(null, lows), resistance: Math.max.apply(null, highs) };
}

export function determineTrend(closes){
  if(closes.length<10) return "Insufficient data";
  var recent = closes.slice(-10);
  var up = 0, down = 0;
  for(var i=1;i<recent.length;i++){
    if(recent[i]>recent[i-1]) up++; else if(recent[i]<recent[i-1]) down++;
  }
  if(up>=7) return "Uptrend";
  if(down>=7) return "Downtrend";
  return "Range/Sideways";
}

// Simple, real, technical-only volatility read - distinct from a
// fundamentals-based risk score, which this app has no data for.
export function calcTechnicalVolatility(closes){
  if(closes.length<15) return null;
  var recent = closes.slice(-15);
  var returns = [];
  for(var i=1;i<recent.length;i++){ returns.push((recent[i]-recent[i-1])/recent[i-1]); }
  var mean = returns.reduce(function(a,b){return a+b;},0)/returns.length;
  var variance = returns.reduce(function(a,b){ return a+(b-mean)*(b-mean); },0)/returns.length;
  var stdDev = Math.sqrt(variance)*100;
  var label = stdDev<1 ? "Low" : stdDev<2.5 ? "Medium" : "High";
  return { stdDevPct: stdDev, label: label };
}
