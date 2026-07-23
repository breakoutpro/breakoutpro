// BreakoutPro - PortfolioAnalyticsData.jsx
// Static reference data and deterministic, rule-based scoring/insight
// logic for Portfolio Analytics Pro. No fake AI, no invented market
// predictions - every insight is generated purely from the user's own
// entered holdings.
// Rules: no backtick, no triple-equals, ASCII only.

export var SECTORS = [
  "IT","Banking","Finance","Energy","Auto","Pharma","FMCG","Metal",
  "Realty","Telecom","Consumer","Infrastructure","Other"
];

export var SORT_OPTIONS = ["Profit","Loss","Alphabetical","Investment"];

// Portfolio Health: rule-based only, from real holding count and real
// sector concentration - never a fabricated score.
export function computeHealthScore(holdings){
  if(holdings.length==0) return { label:"Needs Improvement", reason:"No holdings added yet." };

  var count = holdings.length;
  var totalValue = holdings.reduce(function(sum,h){ return sum + h.qty*h.currentPrice; }, 0);
  var bySector = {};
  holdings.forEach(function(h){
    var sector = h.sector || "Other";
    bySector[sector] = (bySector[sector]||0) + h.qty*h.currentPrice;
  });
  var maxSectorPct = 0;
  for(var s in bySector){
    if(bySector.hasOwnProperty(s) && totalValue>0){
      var pct = bySector[s]/totalValue;
      if(pct>maxSectorPct) maxSectorPct = pct;
    }
  }
  var sectorCount = Object.keys(bySector).length;

  // Simple, transparent rule ladder - documented, not hidden.
  if(count>=8 && sectorCount>=4 && maxSectorPct<0.35){
    return { label:"Excellent", reason:"Good number of holdings, spread across multiple sectors, with no single sector dominating." };
  }
  if(count>=5 && sectorCount>=3 && maxSectorPct<0.5){
    return { label:"Good", reason:"Reasonable diversification across sectors and holdings." };
  }
  if(count>=3 && maxSectorPct<0.7){
    return { label:"Average", reason:"Some diversification present, but concentration or holding count could improve." };
  }
  return { label:"Needs Improvement", reason:"Few holdings and/or high concentration in one sector." };
}

// Risk Meter: rule-based only, from real concentration and holding count.
export function computeRiskMeter(holdings){
  if(holdings.length==0) return { label:"Low", reason:"No holdings to assess yet." };
  var totalValue = holdings.reduce(function(sum,h){ return sum + h.qty*h.currentPrice; }, 0);
  var bySector = {};
  holdings.forEach(function(h){
    var sector = h.sector || "Other";
    bySector[sector] = (bySector[sector]||0) + h.qty*h.currentPrice;
  });
  var maxSectorPct = 0;
  for(var s in bySector){
    if(bySector.hasOwnProperty(s) && totalValue>0){
      var pct = bySector[s]/totalValue;
      if(pct>maxSectorPct) maxSectorPct = pct;
    }
  }
  if(holdings.length<=2 || maxSectorPct>=0.6) return { label:"High", reason:"Very few holdings or heavy concentration in one sector." };
  if(holdings.length<=4 || maxSectorPct>=0.4) return { label:"Medium", reason:"Moderate concentration - some sectors carry more weight than others." };
  return { label:"Low", reason:"Holdings are reasonably spread across sectors." };
}

// Insights: purely descriptive observations about the user's own real
// holdings - never a market prediction or recommendation.
export function generateInsights(holdings){
  if(holdings.length==0) return ["Add your first holding to see real insights about your own portfolio."];
  var insights = [];
  var totalValue = holdings.reduce(function(sum,h){ return sum + h.qty*h.currentPrice; }, 0);
  var totalInvested = holdings.reduce(function(sum,h){ return sum + h.qty*h.avgBuyPrice; }, 0);

  var bySector = {};
  holdings.forEach(function(h){
    var sector = h.sector || "Other";
    bySector[sector] = (bySector[sector]||0) + h.qty*h.currentPrice;
  });
  var topSector = null, topSectorVal = 0;
  for(var s in bySector){
    if(bySector.hasOwnProperty(s) && bySector[s]>topSectorVal){ topSectorVal=bySector[s]; topSector=s; }
  }
  if(topSector && totalValue>0){
    var pct = Math.round((topSectorVal/totalValue)*100);
    if(pct>=40) insights.push(topSector+" makes up "+pct+"% of your portfolio - a meaningful concentration worth being aware of.");
  }

  if(holdings.length<=3) insights.push("Your portfolio has "+holdings.length+" holding(s) - a small number of positions means each one has a larger impact on your overall result.");

  var winners = holdings.filter(function(h){ return h.currentPrice>h.avgBuyPrice; }).length;
  var losers = holdings.filter(function(h){ return h.currentPrice<h.avgBuyPrice; }).length;
  if(winners+losers>0) insights.push("Currently "+winners+" holding(s) are above your average buy price and "+losers+" are below it, based on the prices you entered.");

  if(totalInvested>0){
    var overallPct = Math.round(((totalValue-totalInvested)/totalInvested)*100);
    insights.push("Your overall portfolio is "+(overallPct>=0?"up":"down")+" "+Math.abs(overallPct)+"% versus your total invested amount, based on your entered prices.");
  }

  if(insights.length==0) insights.push("Your portfolio looks reasonably balanced based on what you've entered so far.");
  return insights;
}
