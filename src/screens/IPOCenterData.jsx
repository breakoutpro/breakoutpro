// BreakoutPro - IPOCenterData.jsx
// HONESTY NOTE: Breakout Pro has no real live IPO data source anywhere
// (the existing IPOScreen.jsx uses hardcoded fake GMP/dates - not reused
// or fixed here, out of this feature's scope). This module uses fixed,
// hand-authored illustrative entries only, clearly and permanently
// labeled "Educational / Demo IPO Center" - never Math.random, never a
// live status claim, and never a listing-gain prediction.
// Rules: no backtick, no triple-equals, ASCII only.

export var DEMO_LABEL = "Educational / Demo IPO Center";
export var STATUSES = ["Upcoming","Open","Closed","Listed"];

// daysFromToday resolved against the real current date at render time -
// illustrative scheduling only, not a confirmed live status.
export var IPOS = [
  {
    id:"ipo1", company:"Sample Tech Solutions Ltd (illustrative)", exchange:"NSE, BSE",
    issueSize:"Rs 850 Cr", priceBand:"Rs 210 - 225", lotSize:65,
    openDaysFromToday:5, closeDaysFromToday:7, listingDaysFromToday:14, status:"Upcoming"
  },
  {
    id:"ipo2", company:"Sample Renewable Energy Ltd (illustrative)", exchange:"NSE",
    issueSize:"Rs 1,200 Cr", priceBand:"Rs 340 - 360", lotSize:40,
    openDaysFromToday:0, closeDaysFromToday:2, listingDaysFromToday:9, status:"Open"
  },
  {
    id:"ipo3", company:"Sample Consumer Goods Ltd (illustrative)", exchange:"BSE",
    issueSize:"Rs 420 Cr", priceBand:"Rs 95 - 102", lotSize:145,
    openDaysFromToday:-6, closeDaysFromToday:-4, listingDaysFromToday:1, status:"Closed"
  },
  {
    id:"ipo4", company:"Sample Financial Services Ltd (illustrative)", exchange:"NSE, BSE",
    issueSize:"Rs 2,100 Cr", priceBand:"Rs 610 - 640", lotSize:23,
    openDaysFromToday:-20, closeDaysFromToday:-18, listingDaysFromToday:-11, status:"Listed"
  },
  {
    id:"ipo5", company:"Sample Manufacturing Ltd (illustrative)", exchange:"NSE",
    issueSize:"Rs 600 Cr", priceBand:"Rs 150 - 160", lotSize:90,
    openDaysFromToday:12, closeDaysFromToday:14, listingDaysFromToday:21, status:"Upcoming"
  }
];

export var EDUCATIONAL_TEXT = {
  whatIsIPO:"An IPO (Initial Public Offering) is the first time a private company offers its shares for sale to the general public on a stock exchange, allowing it to raise capital and become publicly traded.",
  howToApply:"IPOs are commonly applied for through a broker's app or net banking using ASBA (Application Supported by Blocked Amount), where your funds are blocked but not debited until shares are allotted.",
  risks:"IPO investing carries real risks: the company may not have a long public track record, allotment is not guaranteed even if you apply, and listing price can be below the issue price. Past IPO performance does not guarantee future results.",
  listingGains:"Listing gains refer to the difference between the issue price and the price at which shares first trade on listing day. This can be positive or negative and is never guaranteed - this app does not predict listing gains for any IPO."
};

export function daysFromTodayToDate(offset){
  var d = new Date();
  d.setDate(d.getDate()+offset);
  return d;
}

// Rule-based only - describes the illustrative dataset's status mix, never
// predicts any individual IPO's listing performance.
export function generateInsight(ipos){
  var counts = { Upcoming:0, Open:0, Closed:0, Listed:0 };
  ipos.forEach(function(i){ if(counts.hasOwnProperty(i.status)) counts[i.status]++; });
  return "This illustrative dataset currently shows "+counts.Upcoming+" upcoming, "+counts.Open+" open, "+counts.Closed+" closed, and "+counts.Listed+" listed IPO entries. This is a description of the data shown, not a prediction of any IPO's listing performance.";
}
