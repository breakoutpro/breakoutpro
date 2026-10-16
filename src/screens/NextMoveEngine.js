// BreakoutPro - NextMoveEngine.js
// Next Move Intelligence: turns the Early Direction result into plain
// scenarios (what could happen next, what confirms it, what invalidates it).
// PURE and deterministic. It makes NO new calculation of prices, levels or
// indicators: every value comes from computeDirection() in DirectionEngine.js
// (daily candles, EMA, support/resistance, validated source timestamps), so the
// two panels can never disagree about a level or about data freshness.
//
// What it is NOT: a forecast. There is no validated model and no historical
// backtest, so no probability, accuracy or win rate is produced anywhere, and
// confidence is always reported as "not yet validated". The basis is DAILY
// candles. No verified intraday feed exists in this app, so no intraday time
// horizon (15-30 min, 30-60 min, session) is ever claimed.
//
// Scenario status on daily closes (price merely touching a level is not a
// confirmed breakout):
//   waiting      price has not closed beyond the trigger level
//   triggered    latest close (or today's forming candle) is beyond the level,
//                but there are not yet two completed closes beyond it
//   confirmed    two consecutive completed daily closes beyond the level
//   invalidated  closed beyond the opposite boundary, or closed back inside the
//                range after a close beyond the level
//   expired      a trigger seen only on data that is behind the expected
//                trading session, so it cannot be treated as current
// Volume, options (PCR / Max Pain / walls), news and breadth confirmations are
// listed as unavailable because no reliable, timestamped source feeds them.
// Output text is { key, vars } pairs rendered through the existing i18n t().
// Rules: no backtick, no triple-equals, ASCII only.

import { fmtNum, isClockOpen } from "./DirectionEngine.js";

// Confirmations this app cannot verify today. Listed, never faked.
var UNVERIFIED = ["intraday", "volume", "options", "news", "breadth"];

function status(side, t, sessionOpen, behind){
  var up = side=="bull";
  var res = t.resistance, sup = t.support;
  var beyond = up ? t.close > res : t.close < sup;
  var prevBeyond = up ? t.prevClose > res : t.prevClose < sup;
  var oppositeBroken = up ? t.close < sup : t.close > res;
  if(oppositeBroken) return "invalidated";
  if(beyond){
    if(behind) return "expired";
    if(prevBeyond && !sessionOpen) return "confirmed";
    return "triggered";
  }
  // closed back inside the range after a close beyond the level = failed break;
  // while today's candle is still forming it is not final, so keep waiting
  if(prevBeyond && !sessionOpen) return "invalidated";
  return "waiting";
}

function scenario(side, t, sessionOpen, behind){
  var up = side=="bull";
  var lvl = up ? t.resistance : t.support;
  var inv = up ? t.support : t.resistance;
  return {
    side: side,
    status: status(side, t, sessionOpen, behind),
    triggerLevel: lvl,
    invalidationLevel: inv,
    boundary: { support: t.support, resistance: t.resistance },
    trigger: { key: up ? "nm.trig.bull" : "nm.trig.bear", vars: { lvl: fmtNum(lvl) } },
    confirm: { key: up ? "nm.confirm.bull" : "nm.confirm.bear", vars: { lvl: fmtNum(lvl) } },
    invalid: { key: up ? "nm.inval.bull" : "nm.inval.bear", vars: { lvl: fmtNum(inv) } }
  };
}

function inputById(d, id){
  var list = d.inputs || [];
  for(var i=0; i<list.length; i++){ if(list[i].id==id) return list[i]; }
  return null;
}

export function computeNextMove(d){
  var out = {
    state: "unavailable", assessment: "unavailable",
    horizon: { intraday: false, basis: "daily" },
    confidence: { validated: false },
    price: null, freshness: null,
    scenarios: { bull: null, bear: null },
    evidence: { forTxt: [], against: [], context: [], caveats: [] },
    confirms: [], invalidates: [], reasons: [],
    unverified: UNVERIFIED.slice(), excluded: [],
    evidenceCompleteness: null, session: (d && d.session) || null,
    provisional: !!(d && d.provisional), basisClose: !!(d && d.basisClose)
  };
  if(!d){ out.reasons.push({ key: "dir.why.no_data", vars: {} }); return out; }
  out.reasons = (d.reasons || []).slice();
  var tech = d.tech && d.tech.nifty;
  var q = d.quote && d.quote.nifty;
  var nh = inputById(d, "nifty_h");
  // Essential inputs: a usable directional reading, NIFTY quote and NIFTY daily
  // structure. Without them no assessment is produced from stale or missing data.
  if(d.demo || d.outlook=="insufficient" || !tech || !q){
    if(!out.reasons.length) out.reasons.push({ key: "dir.why.no_data", vars: {} });
    out.freshness = q ? { quoteAsOf: q.asOf, quoteStatus: q.status, lastBarAsOf: nh ? nh.asOf : null, session: d.session || null } : null;
    return out;
  }

  var sessionOpen = !!d.provisional;
  var behind = !!(nh && nh.uncertain) || !!(inputById(d, "nifty_q") && inputById(d, "nifty_q").uncertain);
  var bull = scenario("bull", tech, sessionOpen, behind);
  var bear = scenario("bear", tech, sessionOpen, behind);
  out.scenarios = { bull: bull, bear: bear };
  out.state = "ok";
  out.evidenceCompleteness = d.confidence || null;

  // Price: LIVE only when the validated quote is LIVE during the open session.
  // Otherwise it is the last confirmed price, shown with its provider time.
  // The clock must agree too: a payload that claims OPEN outside NSE hours is not live.
  var isLive = q.status=="LIVE" && d.session=="OPEN" && q.timeCheck=="fresh" && (typeof d.now=="number" ? isClockOpen(d.now) : false);
  out.price = { ltp: q.ltp, chgPct: q.chgPct, asOf: q.asOf, kind: isLive ? "live" : "last_confirmed", status: q.status };
  out.freshness = { quoteAsOf: q.asOf, quoteStatus: q.status, lastBarAsOf: nh ? nh.asOf : null, session: d.session || null, behind: behind };

  // ---- Assessment ----------------------------------------------------------
  var dirSign = d.outlook=="bullish" ? 1 : (d.outlook=="bearish" ? -1 : 0);
  var revDir = tech.reversal ? tech.reversal.dir : 0;
  var assessment = "wait";
  var whyKey = "nm.why.wait";
  var whyVars = {};
  if(revDir!=0 && (dirSign==0 || dirSign==revDir)){
    assessment = revDir>0 ? "reversal_up" : "reversal_dn";
    whyKey = "nm.why." + assessment;
    whyVars = { n: String(tech.reversal.priorSessions), e21: fmtNum(tech.ema21) };
  } else if(dirSign>0){
    assessment = "upside"; whyKey = "nm.why.upside"; whyVars = { lvl: fmtNum(tech.resistance) };
  } else if(dirSign<0){
    assessment = "downside"; whyKey = "nm.why.downside"; whyVars = { lvl: fmtNum(tech.support) };
  } else {
    var mixedReason = false;
    for(var i=0; i<out.reasons.length; i++){ if(out.reasons[i].key=="dir.why.mixed") mixedReason = true; }
    var bothWaiting = bull.status=="waiting" && bear.status=="waiting";
    var emaMixed = !tech.bull && !tech.bear;
    if(mixedReason && bothWaiting && emaMixed){
      assessment = "range"; whyKey = "nm.why.range"; whyVars = { sup: fmtNum(tech.support), res: fmtNum(tech.resistance) };
    }
  }
  out.assessment = assessment;
  out.why = { key: whyKey, vars: whyVars };

  // ---- Evidence, conditions (all reused from the direction result) --------
  if(dirSign!=0){
    out.evidence.forTxt = d.supports || [];
    out.evidence.against = d.contradicts || [];
  } else {
    out.evidence.forTxt = d.bullEvidence || [];
    out.evidence.against = d.bearEvidence || [];
  }
  out.evidence.context = d.context || [];
  out.evidence.caveats = d.caveats || [];
  out.confirms = d.strengthen || [];
  out.invalidates = d.weaken || [];

  // Inputs that were left out because they were stale, missing or timestamp-less
  var skip = { natgas:1, breadth:1, volume:1, fiidii:1, news:1 };
  var list = d.inputs || [];
  for(var k=0; k<list.length; k++){
    var it = list[k];
    if(!it.used && !skip[it.id]) out.excluded.push({ id: it.id, status: it.status, reason: it.reason });
  }
  return out;
}
