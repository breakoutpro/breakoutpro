// BreakoutPro - PracticeData.jsx
// Practice Zone content. All questions are original. No real market
// prices anywhere - calculator practices use plain practice numbers the
// user enters themselves, never live/fake ticker data.
// Rules: no backtick, no triple-equals, ASCII only.

export var PRACTICE_LIST = [
  { id:"candle_id", title:"Candlestick Identification", icon:"\u{1F56F}", color:"#22C55E", type:"mcq" },
  { id:"pattern_id", title:"Chart Pattern Practice", icon:"\u{1F4C8}", color:"#3B82F6", type:"mcq" },
  { id:"sr_practice", title:"Support & Resistance Practice", icon:"\u{1F6A7}", color:"#F59E0B", type:"mcq" },
  { id:"trend_practice", title:"Trend Identification Practice", icon:"\u{1F4C9}", color:"#EF4444", type:"mcq" },
  { id:"bos_choch_practice", title:"BOS / CHOCH Practice", icon:"\u{1F504}", color:"#8B5CF6", type:"mcq" },
  { id:"supply_demand_practice", title:"Supply & Demand Practice", icon:"\u2696\uFE0F", color:"#06B6D4", type:"mcq" },
  { id:"risk_calc", title:"Risk Management Calculator Practice", icon:"\u{1F6E1}", color:"#EF4444", type:"calc_risk" },
  { id:"position_size", title:"Position Size Practice", icon:"\u{1F4CF}", color:"#F97316", type:"calc_size" },
  { id:"psychology_scenarios", title:"Trading Psychology Scenarios", icon:"\u{1F9E0}", color:"#EC4899", type:"mcq" },
  { id:"final_exam", title:"Final Module Exam", icon:"\u{1F3C6}", color:"#D4AF37", type:"mcq" },
  { id:"trade_replay", title:"AI Trade Replay", icon:"\u{1F3AC}", color:"#3B82F6", type:"replay" }
];

export var MCQ_BANKS = {
  candle_id: [
    { illustration:{kind:"candle", shapeId:"doji"}, q:"What is this candle called?", options:["Doji","Hammer","Marubozu","Shooting Star"], correct:0, explain:"A Doji has a very small body with the open and close nearly equal, and wicks on both sides - it reflects indecision between buyers and sellers during that period." },
    { illustration:{kind:"candle", shapeId:"hammer"}, q:"What is this candle called?", options:["Shooting Star","Hammer","Doji","Bearish Marubozu"], correct:1, explain:"A Hammer has a small body near the top and a long lower wick, showing that sellers pushed price down but buyers pushed it back up by the close." },
    { illustration:{kind:"candle", shapeId:"shooting_star"}, q:"What is this candle called?", options:["Hammer","Spinning Top","Shooting Star","Bullish Marubozu"], correct:2, explain:"A Shooting Star has a small body near the bottom and a long upper wick, showing buyers pushed price up but sellers pushed it back down by the close." },
    { illustration:{kind:"candle", shapeId:"bullish_marubozu"}, q:"What is this candle called?", options:["Bullish Marubozu","Doji","Hammer","Bearish Marubozu"], correct:0, explain:"A Marubozu has almost no wicks - the body spans nearly the full high-to-low range, showing one side was in control the whole period. A bullish one closes near its high." },
    { illustration:{kind:"candle", shapeId:"spinning_top"}, q:"What is this candle called?", options:["Marubozu","Spinning Top","Hammer","Shooting Star"], correct:1, explain:"A Spinning Top has a small body with wicks of roughly similar length on both sides, reflecting a tug-of-war between buyers and sellers with no clear winner." }
  ],
  pattern_id: [
    { illustration:{kind:"pattern", shapeId:"double_top"}, q:"What pattern is this?", options:["Double Bottom","Double Top","Triangle","Flag"], correct:1, explain:"A Double Top shows price reaching a similar high twice with a pullback between, often studied as a potential sign that upward momentum is fading." },
    { illustration:{kind:"pattern", shapeId:"double_bottom"}, q:"What pattern is this?", options:["Double Top","Head & Shoulders","Double Bottom","Wedge"], correct:2, explain:"A Double Bottom is the mirror image of a Double Top - price reaching a similar low twice, often studied as a potential sign that downward momentum is fading." },
    { illustration:{kind:"pattern", shapeId:"head_shoulders"}, q:"What pattern is this?", options:["Head & Shoulders","Flag","Triangle","Double Top"], correct:0, explain:"A Head & Shoulders shows three peaks - a higher middle peak (the head) flanked by two lower peaks (the shoulders) - widely studied as a classic reversal pattern shape." },
    { illustration:{kind:"pattern", shapeId:"triangle"}, q:"What pattern is this?", options:["Wedge","Flag","Triangle","Double Bottom"], correct:2, explain:"A Triangle shows price ranges narrowing between converging trendlines, often studied as a period of compression before a potential move in either direction." },
    { illustration:{kind:"pattern", shapeId:"flag"}, q:"What pattern is this?", options:["Flag","Head & Shoulders","Double Top","Wedge"], correct:0, explain:"A Flag shows a brief, parallel-channel pullback after a sharp move, often studied as a pause within an existing trend rather than a reversal." },
    { illustration:{kind:"pattern", shapeId:"wedge"}, q:"What pattern is this?", options:["Triangle","Wedge","Double Bottom","Flag"], correct:1, explain:"A Wedge shows converging trendlines that both slope in the same direction (both up or both down), distinguishing it from a Triangle where the lines slope toward each other from opposite directions." }
  ],
  sr_practice: [
    { q:"Price has bounced upward from roughly the same level three separate times. This level is best described as:", options:["A resistance zone","A support zone","A dividend date","A circuit limit"], correct:1, explain:"A level where price has repeatedly stopped falling and bounced up is the textbook description of a support zone." },
    { q:"Resistance is best understood as:", options:["A single guaranteed exact price","A zone where selling pressure has previously appeared","A government-mandated ceiling","Always exactly double the support level"], correct:1, explain:"Support and resistance are zones of historical interest, not single guaranteed prices." },
    { q:"Once resistance is genuinely broken and price later returns to that level, it often:", options:["Disappears completely","Can act as new support (role reversal)","Becomes illegal to trade","Always causes a circuit halt"], correct:1, explain:"This is the well-known role reversal idea - broken resistance can become new support, and vice versa." }
  ],
  trend_practice: [
    { q:"A series of Higher Highs and Higher Lows describes:", options:["A downtrend","An uptrend","A stock split","A dividend"], correct:1, explain:"Higher Highs and Higher Lows are the defining shape of an uptrend." },
    { q:"A series of Lower Highs and Lower Lows describes:", options:["An uptrend","A downtrend","A rights issue","An IPO"], correct:1, explain:"Lower Highs and Lower Lows are the defining shape of a downtrend." },
    { q:"When price moves sideways with no clear staircase pattern, this is usually called:", options:["A crash","Consolidation or a range","A guaranteed breakout","A dividend event"], correct:1, explain:"Sideways price action without a clear up or down staircase is typically described as consolidation or ranging." }
  ],
  bos_choch_practice: [
    { q:"In an established uptrend, price closes above the most recent swing high. This is generally described as:", options:["CHOCH","BOS (Break of Structure)","A dividend","A circuit limit"], correct:1, explain:"A BOS reflects the CURRENT trend continuing its established pattern - here, a new Higher High in an uptrend." },
    { q:"In an established uptrend, price fails to make a new high and then breaks below the last Higher Low. This is generally described as:", options:["BOS","CHOCH (Change of Character)","An IPO","A stock split"], correct:1, explain:"A CHOCH reflects a shift inconsistent with the current trend's established pattern - a possible early signal the structure is changing." },
    { q:"BOS and CHOCH both require a clear understanding of:", options:["Company dividend policy","Market structure (swing highs and lows)","Mutual fund NAV","Circuit limits"], correct:1, explain:"Both concepts are only meaningful once you can identify the swing highs and lows that define the current market structure." }
  ],
  supply_demand_practice: [
    { q:"A demand zone is best described as an area where:", options:["Selling pressure previously overwhelmed buying","Buying pressure previously overwhelmed selling, pushing price away quickly","The company reported earnings","Volume was always zero"], correct:1, explain:"A demand zone reflects a historical imbalance where buyers previously overwhelmed sellers strongly enough to push price away fast." },
    { q:"A zone formed by a fast, sharp move away is often read by chart readers as:", options:["Meaningless noise","Possibly reflecting a stronger imbalance (an observation, not a certainty)","A guaranteed reversal point","Illegal activity"], correct:1, explain:"A fast move away is commonly read as reflecting a stronger imbalance - though this remains an observation, never a certainty." },
    { q:"Supply and demand zones should be treated as:", options:["Guaranteed turning points","Areas of interest to watch, not guarantees","SEBI-mandated levels","Irrelevant to price action"], correct:1, explain:"Like support and resistance, these zones are observational tools, not promises of what price will do." }
  ],
  psychology_scenarios: [
    { q:"After a losing trade, a trader immediately takes a larger, less-planned trade to try to win back the loss quickly. This is best described as:", options:["Disciplined trading","Revenge trading","Diversification","Position sizing"], correct:1, explain:"This impulsive pattern - trading bigger and less carefully right after a loss specifically to recover it - is widely known as revenge trading." },
    { q:"A trader holds a winning position far longer than planned, hoping for just a bit more. This is most associated with:", options:["Fear","Greed","Diversification","Circuit limits"], correct:1, explain:"Holding on for more than planned, driven by a desire for additional gains, is a classic greed-driven behavior pattern." },
    { q:"A calm, rules-based process decided in advance is valuable mainly because it is:", options:["Guaranteed to be profitable","Decided before emotion takes over in the moment","Only for professional traders","A way to avoid all losses"], correct:1, explain:"The core value of a rules-based process is that decisions are made calmly in advance, not in the heat of an emotional moment." }
  ],
  final_exam: [
    { q:"Support and resistance are best understood as:", options:["Exact guaranteed prices","Zones based on historical buying/selling interest","Government-set limits","Company dividend dates"], correct:1, explain:"These are observational zones, not exact guaranteed price points." },
    { q:"A BOS in an established trend generally reflects:", options:["The trend continuing its established pattern","The trend definitely reversing","A stock split","A circuit halt"], correct:0, explain:"BOS reflects continuation of the current trend's established swing pattern." },
    { q:"A CHOCH generally reflects:", options:["The trend continuing normally","A shift inconsistent with the current trend's established pattern","A dividend payout","An IPO listing"], correct:1, explain:"CHOCH reflects a possible early shift away from the current trend's established pattern." },
    { q:"Revenge trading is best described as:", options:["A calm, rules-based process","Impulsively trading bigger right after a loss to win it back quickly","A type of diversification","A risk management technique"], correct:1, explain:"Revenge trading is the impulsive, emotion-driven pattern of chasing back a recent loss." },
    { q:"A demand zone reflects:", options:["An area where sellers previously overwhelmed buyers","An area where buyers previously overwhelmed sellers, pushing price away","A government-mandated price floor","A dividend record date"], correct:1, explain:"A demand zone is where historical buying pressure overwhelmed selling pressure strongly enough to move price away quickly." }
  ]
};
