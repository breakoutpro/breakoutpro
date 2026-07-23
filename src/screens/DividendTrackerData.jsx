// BreakoutPro - DividendTrackerData.jsx
// HONESTY NOTE: Breakout Pro has no real live dividend-announcement data
// source anywhere in this app. This module uses fixed, hand-authored
// illustrative entries only, clearly and permanently labeled
// "Educational / Demo Dividend Tracker" - never Math.random, never a
// live announcement claim, never a future-dividend prediction.
// Rules: no backtick, no triple-equals, ASCII only.

export var DEMO_LABEL = "Educational / Demo Dividend Tracker";

// Date offsets resolved against the real current date at render time -
// illustrative scheduling only, not a confirmed live announcement.
export var DIVIDENDS = [
  {
    id:"d1", company:"Sample Energy Corp Ltd (illustrative)",
    exDaysFromToday:4, recordDaysFromToday:5, paymentDaysFromToday:20,
    dps:8.5, yieldPct:2.1, status:"Upcoming"
  },
  {
    id:"d2", company:"Sample Consumer Products Ltd (illustrative)",
    exDaysFromToday:1, recordDaysFromToday:2, paymentDaysFromToday:15,
    dps:12.0, yieldPct:1.4, status:"Upcoming"
  },
  {
    id:"d3", company:"Sample IT Services Ltd (illustrative)",
    exDaysFromToday:-3, recordDaysFromToday:-2, paymentDaysFromToday:12,
    dps:22.0, yieldPct:2.8, status:"Recent"
  },
  {
    id:"d4", company:"Sample Banking Corp Ltd (illustrative)",
    exDaysFromToday:-25, recordDaysFromToday:-24, paymentDaysFromToday:-9,
    dps:4.5, yieldPct:0.9, status:"History"
  },
  {
    id:"d5", company:"Sample Pharma Industries Ltd (illustrative)",
    exDaysFromToday:-40, recordDaysFromToday:-39, paymentDaysFromToday:-25,
    dps:15.0, yieldPct:1.7, status:"History"
  }
];

export var EDUCATIONAL_TEXT = {
  whatIsDividend:"A dividend is a portion of a company's profit distributed to shareholders, usually per share held. Companies are not obligated to pay dividends, and amounts can vary or stop entirely.",
  exDate:"The Ex-Date is the first day a stock trades without the dividend attached. If you buy on or after the Ex-Date, you are generally not entitled to that specific dividend payment.",
  recordDate:"The Record Date is the date the company checks its records to determine which shareholders are entitled to receive the dividend, based on who owned shares before the Ex-Date.",
  paymentDate:"The Payment Date is when the dividend amount is actually credited to eligible shareholders, usually some time after the record date.",
  dividendYield:"Dividend Yield is the annual dividend per share divided by the current share price, expressed as a percentage - it reflects the dividend relative to price, not a guarantee of future payments."
};

export function dateFromOffset(offset){
  var d = new Date();
  d.setDate(d.getDate()+offset);
  return d;
}

// Rule-based only - describes the illustrative dataset's status mix, never
// predicts any company's future dividend decisions.
export function generateInsight(items){
  var counts = { Upcoming:0, Recent:0, History:0 };
  items.forEach(function(i){ if(counts.hasOwnProperty(i.status)) counts[i.status]++; });
  return "This illustrative dataset currently shows "+counts.Upcoming+" upcoming, "+counts.Recent+" recent, and "+counts.History+" historical dividend entries. This describes the data shown only - it does not predict any company's future dividend decisions.";
}
