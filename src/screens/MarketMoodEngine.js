// BreakoutPro - MarketMoodEngine.js
// Deterministic, evidence-based Market Mood score (0-100). NO random, NO AI-invented score.
// Excludes components with no trustworthy data and re-normalizes remaining weights.
// Rules: no backtick, no ===, ASCII.

// Target weights (only applied when the component has trustworthy data).
var WEIGHTS = {
  indexTrend: 20,
  breadth: 15,
  sectors: 15,
  vix: 10,
  fiiDii: 10,
  global: 10,
  technical: 15,
  news: 5
};

// Map a raw component contribution (0..1 bullishness) to its label evidence.
function pct(x){ return Math.round(x*100); }

// Build the deterministic score from normalized server data.
// data = output of /api/market-mood-data
export function computeMoodScore(data){
  if(!data || !data.indices){ return null; }
  var idx = data.indices;
  var components = {};      // name -> {score01, weight, evidence}
  var unavailable = [];

  // --- INDEX TREND (NIFTY + confirmation from SENSEX/BANKNIFTY) ---
  var nifty = idx.NIFTY;
  if(nifty && nifty.ltp!=null && nifty.chgPct!=null && nifty.freshness && nifty.freshness.status!="UNAVAILABLE"){
    // chgPct roughly -2..+2 mapped to 0..1
    var c = nifty.chgPct;
    var s01 = clamp01(0.5 + (c/4));
    var conf = [];
    conf.push("NIFTY " + (c>=0?"+":"") + round2(c) + "%");
    // confirmation
    if(idx.SENSEX && idx.SENSEX.chgPct!=null){
      var agree = (idx.SENSEX.chgPct>=0) == (c>=0);
      conf.push(agree ? "SENSEX confirms" : "SENSEX diverges");
      if(!agree) s01 = s01*0.85 + 0.075; // pull toward neutral on divergence
    }
    if(idx.BANKNIFTY && idx.BANKNIFTY.chgPct!=null){
      var bnAgree = (idx.BANKNIFTY.chgPct>=0) == (c>=0);
      conf.push(bnAgree ? "Bank Nifty confirms" : "Bank Nifty diverges");
    }
    components.indexTrend = { score01:s01, weight:WEIGHTS.indexTrend, evidence:conf.join(", ") };
  } else { unavailable.push("indexTrend"); }

  // --- VIX (volatility: lower = calmer = mildly bullish bias) ---
  var vix = idx.VIX;
  if(vix && vix.ltp!=null && vix.freshness && vix.freshness.status!="UNAVAILABLE"){
    // VIX 10 (calm) .. 25 (fear). Lower -> higher bullish bias.
    var v = vix.ltp;
    var v01 = clamp01(1 - ((v-10)/15));
    components.vix = { score01:v01, weight:WEIGHTS.vix, evidence:"India VIX " + round2(v) + (v01>0.6?" (calm)":v01<0.4?" (elevated)":"") };
  } else { unavailable.push("vix"); }

  // --- TECHNICAL STRUCTURE (from 3-day context) ---
  var ctx = data.context3d;
  if(ctx && ctx.return3dPct!=null){
    var t01 = clamp01(0.5 + (ctx.return3dPct/6));
    var tconf = ["3-day " + (ctx.return3dPct>=0?"+":"") + ctx.return3dPct + "%"];
    if(ctx.higherHighs){ t01 = Math.min(1, t01+0.1); tconf.push("higher highs"); }
    if(ctx.lowerLows){ t01 = Math.max(0, t01-0.1); tconf.push("lower lows"); }
    if(ctx.rangeCompressing) tconf.push("range compressing");
    components.technical = { score01:t01, weight:WEIGHTS.technical, evidence:tconf.join(", ") };
  } else { unavailable.push("technical"); }

  // --- UNAVAILABLE components (explicitly excluded, per honesty rules) ---
  var un = data.unavailable || {};
  if(un.breadth=="UNAVAILABLE") unavailable.push("breadth");
  if(un.sectors=="UNAVAILABLE") unavailable.push("sectors");
  if(un.fiiDii=="UNAVAILABLE") unavailable.push("fiiDii");
  if(un.global=="UNAVAILABLE") unavailable.push("global");
  if(un.news=="UNAVAILABLE") unavailable.push("news");

  // --- Re-normalize weights across available components only ---
  var totalW = 0, key;
  for(key in components){ if(components.hasOwnProperty(key)) totalW += components[key].weight; }
  if(totalW<=0){ return { score:null, label:"Unavailable", stage:"Uncertain / Mixed", confidence:"Low", componentScores:{}, evidence:{}, unavailableComponents:unavailable }; }

  var score01 = 0, componentScores = {}, evidence = {};
  for(key in components){
    if(!components.hasOwnProperty(key)) continue;
    var comp = components[key];
    var normW = comp.weight/totalW;
    score01 += comp.score01 * normW;
    componentScores[key] = { contribution:pct(comp.score01), weight:Math.round(normW*100) };
    evidence[key] = comp.evidence;
  }
  var score = Math.round(score01*100);

  return {
    score:score,
    label:scoreLabel(score),
    stage:deriveStage(score, data, components),
    confidence:deriveConfidence(components, unavailable),
    componentScores:componentScores,
    evidence:evidence,
    unavailableComponents:unavailable
  };
}

export function scoreLabel(s){
  if(s==null) return "Unavailable";
  if(s<=20) return "Strong Bearish";
  if(s<=40) return "Bearish";
  if(s<=59) return "Neutral / Mixed";
  if(s<=79) return "Bullish";
  return "Strong Bullish";
}

function deriveStage(score, data, comps){
  var ctx = data.context3d;
  var vix = data.indices && data.indices.VIX;
  var highVol = vix && vix.ltp!=null && vix.ltp>=20;
  if(highVol) return "Volatility Expansion";
  if(ctx){
    if(ctx.rangeCompressing && score>=45 && score<=60) return "Range / Consolidation";
    if(ctx.higherHighs && score>=80) return "Strong Bull Trend";
    if(ctx.higherHighs && score>=60) return "Bull Trend";
    if(ctx.lowerLows && score<=20) return "Strong Bear Trend";
    if(ctx.lowerLows && score<=40) return "Bear Trend";
    if(ctx.return3dPct!=null && ctx.return3dPct>0 && score>=55 && score<60) return "Breakout Attempt";
    if(ctx.return3dPct!=null && ctx.return3dPct<0 && score>40 && score<=45) return "Reversal Attempt";
  }
  if(score>=80) return "Strong Bull Trend";
  if(score>=60) return "Early Uptrend";
  if(score>=41) return "Range / Consolidation";
  if(score>=21) return "Early Downtrend";
  return "Bear Trend";
}

function deriveConfidence(comps, unavailable){
  var have = 0, k;
  for(k in comps){ if(comps.hasOwnProperty(k)) have++; }
  if(have>=4) return "High";
  if(have>=2) return "Medium";
  return "Low";
}

// Probabilistic opening-bias text (never a fact).
export function openingBias(score){
  if(score==null) return "Opening direction uncertain";
  if(score>=70) return "Positive opening bias";
  if(score>=60) return "Mild positive bias";
  if(score<=30) return "Negative opening bias";
  if(score<=40) return "Mild negative bias";
  return "Opening direction uncertain";
}

function clamp01(x){ return x<0?0:(x>1?1:x); }
function round2(x){ return Math.round(x*100)/100; }
