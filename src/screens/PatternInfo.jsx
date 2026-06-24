// BreakoutPro - PatternInfo.jsx
// Educational explanation for each candle/chart pattern.
// "When this candle appears, what usually happens next" - educational only.
// Rules: no backtick, no triple-equals, ASCII only.

export var PATTERN_INFO = {
  "Bullish Engulfing":{
    bias:"Bullish",
    what:"A large green candle completely engulfs the previous red candle.",
    next:"Buyers have overpowered sellers. Price often continues upward, especially at a support zone.",
    action:"Watch for a close above the engulfing candle high with volume. Stop loss below the candle low."
  },
  "Bearish Engulfing":{
    bias:"Bearish",
    what:"A large red candle completely engulfs the previous green candle.",
    next:"Sellers have overpowered buyers. Price often turns down, especially at a resistance zone.",
    action:"Watch for a close below the engulfing candle low. Avoid fresh longs until reversal fades."
  },
  "Morning Star":{
    bias:"Bullish",
    what:"Three candles - a red candle, a small indecision candle, then a strong green candle.",
    next:"A reversal from a downtrend. Buyers are stepping back in after a pause.",
    action:"Confirmation on day three with volume strengthens the signal. Stop loss below the star low."
  },
  "Evening Star":{
    bias:"Bearish",
    what:"Three candles - a green candle, a small indecision candle, then a strong red candle.",
    next:"A reversal from an uptrend. Sellers are taking control after a pause.",
    action:"Confirmation on day three with volume strengthens the signal. Watch support below."
  },
  "Shooting Star":{
    bias:"Bearish",
    what:"A small body with a long upper wick at the top of an uptrend.",
    next:"Buyers pushed up but were rejected hard. Price often turns down from here.",
    action:"Watch for a red candle next. Resistance is confirmed near the wick high."
  },
  "Hammer":{
    bias:"Bullish",
    what:"A small body with a long lower wick at the bottom of a downtrend.",
    next:"Sellers pushed down but were rejected. Price often bounces from this level.",
    action:"Watch for a green candle next. Support is confirmed near the wick low."
  },
  "Bearish Harami":{
    bias:"Bearish",
    what:"A small candle sits inside the body of the previous large green candle.",
    next:"Momentum is slowing. The uptrend may pause or reverse downward.",
    action:"Wait for a breakdown below the small candle low before acting."
  },
  "Piercing Line":{
    bias:"Bullish",
    what:"A green candle opens below but closes above the midpoint of the prior red candle.",
    next:"Buyers are recovering strongly. A bullish reversal often follows at support.",
    action:"Confirmation above the prior candle high adds strength."
  },
  "Doji":{
    bias:"Neutral",
    what:"Open and close are nearly equal, forming a cross shape. Market indecision.",
    next:"Trend may pause or reverse. Direction depends on the next candle.",
    action:"Wait for the confirmation candle before taking any position."
  },
  "Double Top":{
    bias:"Bearish",
    what:"Price hits a resistance level twice and fails to break above, forming an M shape.",
    next:"A reversal pattern. Price often falls after breaking the neckline support.",
    action:"Entry on neckline breakdown. Target equals the height of the pattern."
  },
  "Double Bottom":{
    bias:"Bullish",
    what:"Price hits a support level twice and holds, forming a W shape.",
    next:"A reversal pattern. Price often rises after breaking the neckline resistance.",
    action:"Entry on neckline breakout with volume. Target equals the pattern height."
  },
  "Cup and Handle":{
    bias:"Bullish",
    what:"A rounded bottom (cup) followed by a small pullback (handle).",
    next:"A continuation pattern. Price often breaks out upward after the handle.",
    action:"Entry on breakout above the handle high with volume confirmation."
  }
};

export function getPattern(name){
  return PATTERN_INFO[name] || {
    bias:"Neutral",
    what:"Pattern detected on the chart.",
    next:"Watch the next few candles for confirmation of direction.",
    action:"Always use a stop loss and confirm with volume."
  };
}
