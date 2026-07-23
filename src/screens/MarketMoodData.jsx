// BreakoutPro - MarketMoodData.jsx
// Presentation/formatting helper layer ONLY for the AI Market Mood open page.
// Owns NO score logic and NO market data of its own. Every function here takes
// real state from useMarketMood() (data, mood, ai, session, lastUpdated) and
// formats it for display. If real data is missing, functions return an
// "unavailable" shape - they never invent numbers, levels, news, or claims.
// Score/stage/confidence ownership stays exclusively in MarketMoodEngine.js.
// Rules: no backtick, no triple-equals, ASCII only.

// Theme tokens (style constants only - not market data).
export var MT = {
  BG:"#000000", CARD:"#101318", CARD2:"#0B0E13", BD:"#1B2330",
  T1:"#FFFFFF", T2:"#A0A7B4", T3:"#5B6472", BLUE:"#3B82F6",
  GREEN:"#22C55E", DGREEN:"#15803D", RED:"#EF4444", DRED:"#7F1D1D",
  WARN:"#F97316", DIV:"#1B2330"
};

// --- Session (market hours) presentation. Session string comes from the
// server (api/market-mood-data.js), which computes it honestly from IST time.
var SESSION_META = {
  OPEN:       { label:"Market Live",  sub:"NSE and BSE are open",         dot:MT.GREEN },
  PRE_OPEN:   { label:"Pre-Open",     sub:"Pre-open session in progress", dot:MT.BLUE },
  POST_CLOSE: { label:"Post Close",   sub:"Session ended, settling",      dot:MT.T3 },
  CLOSED:     { label:"Market Closed",sub:"Outside trading hours",        dot:MT.T3 },
  WEEKEND:    { label:"Weekend",      sub:"Markets closed",               dot:MT.T3 }
};
export function getSessionMeta(session){
  return SESSION_META[session] || { label:"Unknown", sub:"Session status unavailable", dot:MT.T3 };
}

// --- Freshness / data-honesty labels. Every real value must carry one of
// these; never render a number without a status next to it.
var FRESHNESS_META = {
  LIVE:        { text:"LIVE",        color:MT.GREEN },
  DELAYED:     { text:"DELAYED",     color:MT.BLUE },
  STALE:       { text:"STALE",       color:MT.WARN },
  PARTIAL:     { text:"PARTIAL",     color:MT.BLUE },
  OFFLINE:     { text:"OFFLINE",     color:MT.T3 },
  UNAVAILABLE: { text:"UNAVAILABLE", color:MT.T3 }
};
export function getFreshnessMeta(status){
  return FRESHNESS_META[status] || FRESHNESS_META.UNAVAILABLE;
}

// --- Number formatting (pure formatting, no invented values). ---
export function formatIndexValue(v){
  if(v==null) return "--";
  try{ return Number(v).toLocaleString("en-IN", { maximumFractionDigits:2 }); }
  catch(e){ return String(Math.round(v*100)/100); }
}
export function formatPct(v){
  if(v==null) return "--";
  var n = Math.round(v*100)/100;
  return (n>=0?"+":"") + n + "%";
}

// --- Build one real index row from data.indices[key]. Returns null shape
// (available:false) if the server marked it unavailable - never fabricated.
export function buildIndexRow(name, idxData){
  if(!idxData || idxData.ltp==null || !idxData.freshness){
    return { available:false, name:name };
  }
  var fresh = getFreshnessMeta(idxData.freshness.status);
  return {
    available:true,
    name:name,
    ltp:formatIndexValue(idxData.ltp),
    chgPct:formatPct(idxData.chgPct),
    up: idxData.chgPct!=null ? idxData.chgPct>=0 : null,
    freshnessText:fresh.text,
    freshnessColor:fresh.color
  };
}

// --- 3-Day Evolution / Market Stage Timeline material, built only from the
// real context3d block returned by the server (daily candle history).
export function buildEvolution(data){
  var ctx = data && data.context3d;
  if(!ctx || ctx.return3dPct==null){
    return { available:false };
  }
  var structure = [];
  if(ctx.higherHighs) structure.push("Higher highs");
  if(ctx.lowerLows) structure.push("Lower lows");
  if(ctx.rangeCompressing) structure.push("Range compressing");
  if(!structure.length) structure.push("No clear structure signal");
  return {
    available:true,
    return3dPct:formatPct(ctx.return3dPct),
    structure:structure,
    sessions:ctx.sessions,
    note:ctx.note || "",
    status:ctx.status || "DELAYED" // daily candles are prior-session based, never LIVE
  };
}

// --- Sections with no verified provider yet (sectors, global, breadth,
// events). These must render an honest UNAVAILABLE card, never a fake one.
// When a real provider is added (Step 5), the corresponding api field will
// carry real values + a real freshness status, and this helper will pass
// them through unchanged instead of returning available:false.
export function buildUnverifiedSection(dataBlock){
  if(!dataBlock || dataBlock.status=="UNAVAILABLE" || !dataBlock.items){
    return { available:false };
  }
  return { available:true, items:dataBlock.items, status:dataBlock.status };
}

// Sector Rotation wording ("Leading Today" / "Lagging Today") must only be
// derived mathematically from the same real dataset - a simple sort by
// change percent, not a claim about institutional flows.
export function rankSectors(items){
  if(!items || !items.length) return [];
  var sorted = items.slice().sort(function(a,b){
    var av = a.chgPct==null?-999:a.chgPct, bv = b.chgPct==null?-999:b.chgPct;
    return bv-av;
  });
  return sorted.map(function(s,i){
    var tag = "";
    if(i==0 && s.chgPct!=null) tag = "Leading Today";
    else if(i==sorted.length-1 && s.chgPct!=null) tag = "Lagging Today";
    return { name:s.name, chgPct:s.chgPct, up:s.up, freshness:s.freshness, tag:tag };
  });
}

// VIX history sparkline data - only real daily closes, never invented.
export function buildVixHistory(vh){
  if(!vh || !vh.points || !vh.points.length){
    return { available:false };
  }
  return { available:true, points:vh.points, sessions:vh.sessions, status:vh.status || "DELAYED" };
}
// the deterministic engine (mood) and the grounded AI synthesis (ai).
// No invented prices, levels, FII data, or stock calls. Falls back to a
// plain, honest sentence when AI commentary has not arrived yet.
export function buildSummaryLine(mood, session){
  if(!mood || mood.score==null){
    return "Market mood data unavailable right now.";
  }
  var sMeta = getSessionMeta(session);
  return mood.label + " (" + mood.score + "), stage: " + mood.stage + ". " + sMeta.label + ".";
}

export function buildVoiceSummary(mood, ai, session){
  if(!mood || mood.score==null){
    return "Market mood data is not available right now. Please check back shortly.";
  }
  var parts = [];
  var sMeta = getSessionMeta(session);
  parts.push(sMeta.label + ".");
  parts.push("Deterministic market mood reading: " + mood.label + ", score " + mood.score + " out of 100.");
  parts.push("Current stage: " + mood.stage + ". Confidence: " + mood.confidence + ".");
  if(ai && ai.now){ parts.push(ai.now); }
  if(ai && ai.keyDrivers && ai.keyDrivers.length){
    parts.push("Key drivers: " + ai.keyDrivers.join(", ") + ".");
  }
  if(mood.unavailableComponents && mood.unavailableComponents.length){
    parts.push("Not counted due to missing data: " + mood.unavailableComponents.join(", ") + ".");
  }
  parts.push("This is an educational market observation, not investment advice.");
  return parts.join(" ");
}
