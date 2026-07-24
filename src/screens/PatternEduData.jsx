// BreakoutPro - PatternEduData.jsx
// Education content for 18 candlestick + chart patterns.
// Rules: no backtick, no triple-equals, ASCII only.

export var PATTERNS = [
  {id:"bull-engulf", name:"Bullish Engulfing", type:"candle", bias:"Bullish"},
  {id:"bear-engulf", name:"Bearish Engulfing", type:"candle", bias:"Bearish"},
  {id:"hammer",      name:"Hammer",            type:"candle", bias:"Bullish"},
  {id:"shooting",    name:"Shooting Star",     type:"candle", bias:"Bearish"},
  {id:"doji",        name:"Doji",              type:"candle", bias:"Neutral"},
  {id:"morning",     name:"Morning Star",      type:"candle", bias:"Bullish"},
  {id:"evening",     name:"Evening Star",      type:"candle", bias:"Bearish"},
  {id:"cup-handle",  name:"Cup and Handle",    type:"chart",  bias:"Bullish"},
  {id:"double-top",  name:"Double Top",        type:"chart",  bias:"Bearish"},
  {id:"double-bot",  name:"Double Bottom",     type:"chart",  bias:"Bullish"},
  {id:"hns",         name:"Head and Shoulders",type:"chart",  bias:"Bearish"},
  {id:"inv-hns",     name:"Inverse Head and Shoulders", type:"chart", bias:"Bullish"},
  {id:"asc-tri",     name:"Ascending Triangle",type:"chart",  bias:"Bullish"},
  {id:"desc-tri",    name:"Descending Triangle",type:"chart", bias:"Bearish"},
  {id:"fall-wedge",  name:"Falling Wedge",     type:"chart",  bias:"Bullish"},
  {id:"rise-wedge",  name:"Rising Wedge",      type:"chart",  bias:"Bearish"},
  {id:"flag",        name:"Flag",              type:"chart",  bias:"Bullish"},
  {id:"pennant",     name:"Pennant",           type:"chart",  bias:"Bullish"}
];

export function getPattern(id){ return EDU[id]||EDU["bull-engulf"]; }

var EDU = {
  "bull-engulf":{
    psychology:"Buyers overwhelm sellers. A big green candle fully covers the previous red candle, showing a sudden shift in control from bears to bulls.",
    entry:"Enter after the engulfing candle closes, on the next candle open.",
    sl:"Below the low of the engulfing candle.",
    target:"Recent swing high, or 1:2 risk-reward.",
    success:"63%", timeframe:"15m, 1h, 1D", risk:"Medium",
    examples:["RELIANCE reversed up after a bullish engulfing near support in 2023.","HDFCBANK bounced from a daily bullish engulfing post-merger dip."],
    mistakes:["Entering before the candle closes.","Ignoring the trend - works best at support.","Skipping volume confirmation."]
  },
  "bear-engulf":{
    psychology:"Sellers overpower buyers. A large red candle engulfs the prior green candle, signalling bulls have lost control at a top.",
    entry:"Enter short after the engulfing candle closes.",
    sl:"Above the high of the engulfing candle.",
    target:"Recent swing low, or 1:2 risk-reward.",
    success:"60%", timeframe:"15m, 1h, 1D", risk:"Medium",
    examples:["WIPRO topped out with a bearish engulfing on the daily chart.","TATASTEEL reversed down from resistance with this pattern."],
    mistakes:["Shorting in a strong uptrend.","No confirmation candle.","Tight stop loss inside volatility."]
  },
  "hammer":{
    psychology:"Sellers pushed price down hard, but buyers rejected the lows and closed near the top - a long lower wick shows demand stepping in.",
    entry:"Enter on close above the hammer high.",
    sl:"Below the hammer low.",
    target:"Previous resistance or 1:2.",
    success:"60%", timeframe:"15m, 1h, 1D", risk:"Medium",
    examples:["SBIN formed a hammer at support and rallied.","ITC printed a daily hammer before a leg up."],
    mistakes:["Trading hammers in downtrends without confirmation.","Ignoring the wick-to-body ratio."]
  },
  "shooting":{
    psychology:"Buyers pushed price up but sellers slammed it back down, leaving a long upper wick - a rejection of higher prices at a top.",
    entry:"Enter short on close below the candle low.",
    sl:"Above the upper wick.",
    target:"Nearest support or 1:2.",
    success:"58%", timeframe:"15m, 1h, 1D", risk:"Medium",
    examples:["ADANIENT formed a shooting star at resistance.","INFY rejected highs with this candle before falling."],
    mistakes:["Shorting without trend context.","Confusing it with an inverted hammer."]
  },
  "doji":{
    psychology:"Open and close are nearly equal - buyers and sellers are balanced. It signals indecision and a possible turning point.",
    entry:"Wait for the next candle to confirm direction.",
    sl:"Beyond the opposite side of the doji.",
    target:"Depends on confirmation direction.",
    success:"50%", timeframe:"All", risk:"Low to Medium",
    examples:["NIFTY printed a doji before a trend reversal at a top.","TCS showed a doji at support before bouncing."],
    mistakes:["Trading a doji alone without confirmation.","Ignoring the surrounding trend."]
  },
  "morning":{
    psychology:"A three-candle bottom: a red candle, a small indecision candle, then a strong green candle - sellers exhaust and buyers take over.",
    entry:"Enter on the third candle close or next open.",
    sl:"Below the pattern low.",
    target:"Swing high or 1:2.",
    success:"65%", timeframe:"1h, 1D", risk:"Medium",
    examples:["BANKNIFTY bottomed with a morning star after a correction.","MARUTI reversed up from a daily morning star."],
    mistakes:["Entering on the second candle.","Ignoring volume on the third candle."]
  },
  "evening":{
    psychology:"A three-candle top: a green candle, a small indecision candle, then a strong red candle - buyers exhaust and sellers take over.",
    entry:"Enter short on the third candle close.",
    sl:"Above the pattern high.",
    target:"Swing low or 1:2.",
    success:"63%", timeframe:"1h, 1D", risk:"Medium",
    examples:["NIFTY topped with an evening star before a fall.","RELIANCE reversed down from an evening star at resistance."],
    mistakes:["Shorting too early.","No confirmation of the third candle."]
  },
  "cup-handle":{
    psychology:"A rounded bottom (cup) shows slow accumulation, then a small pullback (handle) shakes out weak hands before a breakout.",
    entry:"Enter on breakout above the handle resistance.",
    sl:"Below the handle low.",
    target:"Cup depth added to breakout point.",
    success:"68%", timeframe:"1D, Weekly", risk:"Low to Medium",
    examples:["TITAN formed a cup and handle before a strong rally.","BAJFINANCE broke out from this pattern on the daily."],
    mistakes:["Entering before breakout.","Handle too deep - invalidates pattern."]
  },
  "double-top":{
    psychology:"Price tests a resistance twice and fails. The double rejection shows buyers cannot push higher - a reversal down often follows.",
    entry:"Enter short on break below the neckline (middle low).",
    sl:"Above the second top.",
    target:"Height of pattern projected down.",
    success:"65%", timeframe:"1h, 1D", risk:"Medium",
    examples:["HINDALCO formed a double top before declining.","ICICIBANK rejected the same level twice and fell."],
    mistakes:["Shorting before neckline break.","Ignoring volume drop at second top."]
  },
  "double-bot":{
    psychology:"Price tests a support twice and holds. Two failed breakdowns show sellers are exhausted - a reversal up often follows.",
    entry:"Enter on break above the neckline (middle high).",
    sl:"Below the second bottom.",
    target:"Height of pattern projected up.",
    success:"66%", timeframe:"1h, 1D", risk:"Medium",
    examples:["SBIN formed a double bottom before a rally.","TATAMOTORS bounced from a double bottom on the daily."],
    mistakes:["Buying before neckline break.","No volume confirmation on breakout."]
  },
  "hns":{
    psychology:"Three peaks with a higher middle (head). When the neckline breaks, it shows a major trend reversal from up to down.",
    entry:"Enter short on neckline break.",
    sl:"Above the right shoulder.",
    target:"Head to neckline distance projected down.",
    success:"66%", timeframe:"1D, Weekly", risk:"Medium",
    examples:["NIFTY formed a head and shoulders before a correction.","INFY topped with this pattern on the daily."],
    mistakes:["Entering before the neckline break.","Mislabeling random peaks as the pattern."]
  },
  "inv-hns":{
    psychology:"Three troughs with a lower middle. A neckline break signals a reversal from downtrend to uptrend.",
    entry:"Enter on neckline break upward.",
    sl:"Below the right shoulder.",
    target:"Head to neckline distance projected up.",
    success:"67%", timeframe:"1D, Weekly", risk:"Medium",
    examples:["TATASTEEL formed an inverse head and shoulders before a rally.","AXISBANK reversed up from this pattern."],
    mistakes:["Buying before breakout.","Ignoring volume expansion on break."]
  },
  "asc-tri":{
    psychology:"A flat resistance with rising support shows buyers getting aggressive. A breakout above resistance usually follows.",
    entry:"Enter on breakout above flat resistance.",
    sl:"Below the last higher low.",
    target:"Triangle height projected up.",
    success:"64%", timeframe:"1h, 1D", risk:"Medium",
    examples:["RELIANCE broke out of an ascending triangle in 2023.","LT formed this before a strong move up."],
    mistakes:["Entering inside the triangle.","Ignoring false breakouts - wait for close."]
  },
  "desc-tri":{
    psychology:"A flat support with falling resistance shows sellers gaining control. A breakdown below support usually follows.",
    entry:"Enter short on breakdown below flat support.",
    sl:"Above the last lower high.",
    target:"Triangle height projected down.",
    success:"62%", timeframe:"1h, 1D", risk:"Medium",
    examples:["TATASTEEL broke down from a descending triangle.","WIPRO formed this before declining."],
    mistakes:["Shorting before breakdown.","No volume confirmation."]
  },
  "fall-wedge":{
    psychology:"Price makes lower highs and lower lows but converging - selling pressure weakens. A breakout up often follows.",
    entry:"Enter on breakout above the upper wedge line.",
    sl:"Below the recent low.",
    target:"Wedge height projected up.",
    success:"62%", timeframe:"1h, 1D", risk:"Medium",
    examples:["HDFCBANK formed a falling wedge before bouncing.","SBIN reversed up from this pattern."],
    mistakes:["Entering too early inside the wedge.","Confusing it with a downtrend channel."]
  },
  "rise-wedge":{
    psychology:"Price makes higher highs and higher lows but converging - buying pressure weakens. A breakdown often follows.",
    entry:"Enter short on breakdown below the lower wedge line.",
    sl:"Above the recent high.",
    target:"Wedge height projected down.",
    success:"60%", timeframe:"1h, 1D", risk:"Medium",
    examples:["ADANIENT formed a rising wedge before falling.","INFY topped with this pattern."],
    mistakes:["Shorting inside the wedge.","Ignoring the broader uptrend."]
  },
  "flag":{
    psychology:"After a sharp move (pole), price consolidates in a small channel (flag) before continuing in the same direction.",
    entry:"Enter on breakout in the direction of the pole.",
    sl:"Below the flag low (for bullish).",
    target:"Pole height projected from breakout.",
    success:"67%", timeframe:"5m, 15m, 1h", risk:"Medium",
    examples:["RELIANCE formed a bull flag during a rally.","TCS continued up after a flag breakout."],
    mistakes:["Entering against the pole direction.","Holding through a deep flag - invalidates it."]
  },
  "pennant":{
    psychology:"Like a flag but the consolidation converges into a small triangle. It signals continuation after a strong move.",
    entry:"Enter on breakout in the trend direction.",
    sl:"Below the pennant low (for bullish).",
    target:"Prior move height projected.",
    success:"65%", timeframe:"5m, 15m, 1h", risk:"Medium",
    examples:["BAJFINANCE formed a bullish pennant mid-rally.","MARUTI continued up after a pennant breakout."],
    mistakes:["Trading without a clear prior move.","Entering before the breakout."]
  }
};
