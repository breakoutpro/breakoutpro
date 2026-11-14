// BreakoutPro - src/state/scalperModel.js
// Scalper Mode data structures, calculations, and confluence signal engine.
// Rules: no backtick, no triple-equals, ASCII only.

export var SCALP_SYMS = [
  { sym:"NIFTY 50", name:"NIFTY 50", base:24180.50, type:"index", lot:75, tick:0.05, change:0.42 },
  { sym:"BANK NIFTY", name:"BANK NIFTY", base:51840.20, type:"index", lot:30, tick:0.05, change:0.68 },
  { sym:"FIN NIFTY", name:"FIN NIFTY", base:23610.80, type:"index", lot:65, tick:0.05, change:-0.15 },
  { sym:"SENSEX", name:"SENSEX", base:79420.10, type:"index", lot:10, tick:0.05, change:0.35 },
  { sym:"RELIANCE", name:"Reliance Industries", base:2845.60, type:"stock", lot:250, tick:0.05, change:1.12 },
  { sym:"HDFCBANK", name:"HDFC Bank Ltd", base:1720.40, type:"stock", lot:550, tick:0.05, change:-0.34 },
  { sym:"ICICIBANK", name:"ICICI Bank Ltd", base:1245.80, type:"stock", lot:700, tick:0.05, change:0.85 },
  { sym:"TATAMOTORS", name:"Tata Motors Ltd", base:825.30, type:"stock", lot:1425, tick:0.05, change:1.45 }
];

export var SCALP_TIMEFRAMES = [
  { id:"1m", label:"1m Hyper", desc:"Fast 1-minute execution" },
  { id:"3m", label:"3m Momentum", desc:"Momentum scalping" },
  { id:"5m", label:"5m Standard", desc:"Trend confirmation" }
];

export var RISK_PRESETS = [500, 1000, 2000, 5000];

export function calcCPR(high, low, close){
  var pivot = (high + low + close) / 3;
  var bc = (high + low) / 2;
  var tc = pivot + (pivot - bc);
  var top = Math.max(tc, bc);
  var bottom = Math.min(tc, bc);
  var widthPct = ((top - bottom) / pivot) * 100;
  var widthType = widthPct < 0.25 ? "NARROW" : (widthPct > 0.50 ? "WIDE" : "NORMAL");
  var r1 = (2 * pivot) - low;
  var s1 = (2 * pivot) - high;
  return {
    pivot: Math.round(pivot * 100) / 100,
    tc: Math.round(top * 100) / 100,
    bc: Math.round(bottom * 100) / 100,
    r1: Math.round(r1 * 100) / 100,
    s1: Math.round(s1 * 100) / 100,
    widthPct: Math.round(widthPct * 1000) / 1000,
    widthType: widthType
  };
}

export function calcConfluence(params){
  var price = Number(params && params.price || 0);
  var vwap = Number(params && params.vwap || price);
  var ema9 = Number(params && params.ema9 || price);
  var ema21 = Number(params && params.ema21 || price);
  var rsi = Number(params && params.rsi || 50);
  var cpr = params && params.cpr || calcCPR(price * 1.008, price * 0.992, price);
  var volumeMult = Number(params && params.volumeMult || 1.0);

  var p1 = ema9 > ema21 ? "BULL" : (ema9 < ema21 ? "BEAR" : "NEUTRAL");
  var p2 = price > vwap ? "BULL" : (price < vwap ? "BEAR" : "NEUTRAL");
  var p3 = price > cpr.tc ? "BULL" : (price < cpr.bc ? "BEAR" : "NEUTRAL");
  var p4 = rsi >= 55 ? "BULL" : (rsi <= 45 ? "BEAR" : "NEUTRAL");

  var bullCount = 0;
  var bearCount = 0;
  if(p1 == "BULL") bullCount++; else if(p1 == "BEAR") bearCount++;
  if(p2 == "BULL") bullCount++; else if(p2 == "BEAR") bearCount++;
  if(p3 == "BULL") bullCount++; else if(p3 == "BEAR") bearCount++;
  if(p4 == "BULL") bullCount++; else if(p4 == "BEAR") bearCount++;

  var signal = "WAIT";
  var confidence = 40;
  var setupName = "Consolidating - No High Probability Setup";
  var entry = price;
  var sl = price;
  var target1 = price;
  var target2 = price;
  var risk = 0;
  var reward = 0;

  var riskUnit = Math.max(price * 0.002, Math.abs(price - vwap), 2);

  if(bullCount >= 3){
    signal = bullCount == 4 ? "STRONG_BUY" : "BUY";
    confidence = bullCount == 4 ? 90 : 75;
    setupName = price > cpr.tc ? "CPR Breakout + Bullish EMA 9/21 Trend" : "VWAP Bounce + EMA 9/21 Golden Cross";
    entry = price;
    sl = Math.min(vwap, ema21, price - riskUnit);
    risk = Math.max(price - sl, 1);
    target1 = entry + (risk * 1.5);
    target2 = entry + (risk * 2.0);
    reward = target1 - entry;
  } else if(bearCount >= 3){
    signal = bearCount == 4 ? "STRONG_SELL" : "SELL";
    confidence = bearCount == 4 ? 90 : 75;
    setupName = price < cpr.bc ? "CPR Breakdown + Bearish EMA 9/21 Trend" : "VWAP Rejection + EMA 9/21 Death Cross";
    entry = price;
    sl = Math.max(vwap, ema21, price + riskUnit);
    risk = Math.max(sl - entry, 1);
    target1 = entry - (risk * 1.5);
    target2 = entry - (risk * 2.0);
    reward = entry - target1;
  }

  var rrRatio = risk > 0 ? "1 : " + (Math.round((reward / risk) * 10) / 10).toFixed(1) : "1 : 1.5";

  return {
    signal: signal,
    confidence: confidence,
    setupName: setupName,
    entry: Math.round(entry * 100) / 100,
    sl: Math.round(sl * 100) / 100,
    target1: Math.round(target1 * 100) / 100,
    target2: Math.round(target2 * 100) / 100,
    risk: Math.round(risk * 100) / 100,
    reward: Math.round(reward * 100) / 100,
    rrRatio: rrRatio,
    pillars: {
      trend: { id:"trend", status:p1, label:"EMA 9/21", detail:p1 == "BULL" ? "9 EMA above 21 EMA (Uptrend)" : (p1 == "BEAR" ? "9 EMA below 21 EMA (Downtrend)" : "EMAs Flat") },
      vwap: { id:"vwap", status:p2, label:"VWAP Bias", detail:p2 == "BULL" ? "Trading Above VWAP (Buyers)" : (p2 == "BEAR" ? "Trading Below VWAP (Sellers)" : "At VWAP") },
      cpr: { id:"cpr", status:p3, label:"CPR Pivot Zone", detail:p3 == "BULL" ? "Above Top Central (Breakout)" : (p3 == "BEAR" ? "Below Bottom Central (Breakdown)" : "Inside CPR (Chop Zone)") },
      momentum: { id:"momentum", status:p4, label:"RSI & Vol", detail:p4 == "BULL" ? "RSI > 55 Bullish Momentum" : (p4 == "BEAR" ? "RSI < 45 Bearish Pressure" : "RSI Neutral (45-55)") }
    },
    bullCount: bullCount,
    bearCount: bearCount
  };
}

export function calcPositionSize(capitalRisk, entry, sl, lotSize){
  var riskAmount = Number(capitalRisk || 1000);
  var diff = Math.max(0.5, Math.abs(Number(entry || 0) - Number(sl || 0)));
  var rawQty = Math.floor(riskAmount / diff);
  var lot = Number(lotSize || 1);
  var lots = 0;
  var qty = 0;

  if(lot > 1){
    lots = Math.max(1, Math.floor(rawQty / lot));
    qty = lots * lot;
  } else {
    qty = Math.max(1, rawQty);
  }

  var actualRisk = Math.round(qty * diff);
  var targetReward = Math.round(actualRisk * 1.5);

  return {
    qty: qty,
    lots: lots,
    lotSize: lot,
    riskPerUnit: Math.round(diff * 100) / 100,
    actualRisk: actualRisk,
    targetReward: targetReward
  };
}

export function generateLiveScannerFeed(){
  return [
    { sym:"NIFTY 50", tf:"1m", signal:"STRONG_BUY", setup:"EMA 9/21 Golden Cross", price:24180.50, change:0.42, time:"11:05 IST", conf:90 },
    { sym:"BANK NIFTY", tf:"3m", signal:"BUY", setup:"VWAP Bounce with Volume", price:51840.20, change:0.68, time:"11:04 IST", conf:78 },
    { sym:"FIN NIFTY", tf:"5m", signal:"WAIT", setup:"Consolidating inside CPR", price:23610.80, change:-0.15, time:"11:03 IST", conf:45 },
    { sym:"RELIANCE", tf:"1m", signal:"STRONG_BUY", setup:"Day High Breakout + Vol 2.8x", price:2845.60, change:1.12, time:"11:02 IST", conf:88 },
    { sym:"HDFCBANK", tf:"3m", signal:"SELL", setup:"VWAP Rejection + EMA 9 Cross Down", price:1720.40, change:-0.34, time:"11:00 IST", conf:76 },
    { sym:"TATAMOTORS", tf:"1m", signal:"STRONG_BUY", setup:"CPR Range Expansion Up", price:825.30, change:1.45, time:"10:58 IST", conf:86 }
  ];
}
