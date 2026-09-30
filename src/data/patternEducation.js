// BreakoutPro - patternEducation.js
// Single centralized, EDUCATION-ONLY definition map for the candlestick
// patterns detected live on the chart (RangeIntelligence.jsx's
// detectPattern() and identifyCandlePattern() functions). This is data only
// - it does not detect or classify anything itself, so it is not a second
// pattern engine. It exists separately from PatternData.jsx / PatternEduData.jsx
// (the older Pattern Library / Learn screens) because those files carry
// entry/stop-loss/target/risk-reward trading guidance, which must never
// appear in the on-chart educational popup.
//
// Rules: no backtick literals, ASCII only, no trading-action language
// (no Buy/Sell/Entry/Exit/Target/Stop Loss/guaranteed outcome).

export var PATTERN_EDUCATION = {
  "doji": {
    name: "Doji",
    what: "A Doji forms when a candle's open and close are nearly identical, leaving little to no real body.",
    means: "It shows that buyers and sellers were closely balanced over that candle's duration - neither side could push price decisively in one direction.",
    context: "Commonly examined as a possible sign of indecision. Traders often look at where it forms (near a prior high/low) and at the next candle for confirmation before drawing any conclusion."
  },
  "bullish engulfing": {
    name: "Bullish Engulfing",
    what: "A Bullish Engulfing pattern forms when a bullish candle's body completely covers the previous bearish candle's body.",
    means: "It can indicate a shift in short-term buying pressure, with buyers stepping in more forcefully than the prior candle's sellers.",
    context: "Traders generally examine trend context, nearby support/resistance and subsequent price confirmation rather than reacting to the pattern alone."
  },
  "bearish engulfing": {
    name: "Bearish Engulfing",
    what: "A Bearish Engulfing pattern forms when a bearish candle's body completely covers the previous bullish candle's body.",
    means: "It can indicate a shift in short-term selling pressure, with sellers overpowering the prior candle's buyers.",
    context: "Traders generally examine trend context, nearby support/resistance and subsequent price confirmation rather than reacting to the pattern alone."
  },
  "hammer": {
    name: "Hammer",
    what: "A Hammer has a small body near the top of its range with a long lower wick at least twice the body size, and little or no upper wick.",
    means: "It can suggest that sellers pushed price lower during the candle but buyers stepped in and pushed price back up before the close.",
    context: "Is commonly observed as part of a potential reversal setup, though traders often examine where it forms (such as near a support zone) and look for confirmation on subsequent candles."
  },
  "pinbar": {
    name: "Pinbar",
    what: "A Pinbar has a small body with a long wick on one side, showing that price was pushed strongly in one direction before being rejected.",
    means: "The long wick reflects a rejection of the prices reached within that candle.",
    context: "Confirmation may be required from the following candles and the surrounding trend before this rejection is treated as meaningful."
  },
  "inverted hammer": {
    name: "Inverted Hammer",
    what: "An Inverted Hammer has a small body near the bottom of its range with a long upper wick, and little or no lower wick.",
    means: "It can reflect an attempt by buyers to push price higher during the candle that was not fully sustained by the close.",
    context: "Traders often examine the prevailing trend and subsequent candles for confirmation rather than treating this shape alone as decisive."
  },
  "shooting star": {
    name: "Shooting Star",
    what: "A Shooting Star has a small body near the bottom of its range with a long upper wick at least twice the body size, and little or no lower wick.",
    means: "It can suggest that buyers pushed price higher during the candle but sellers pushed it back down before the close.",
    context: "Is commonly observed as part of a potential reversal context near resistance, though confirmation from later price action is generally examined first."
  },
  "bullish marubozu": {
    name: "Bullish Marubozu",
    what: "A Bullish Marubozu is a candle with a large bullish body and little to no upper or lower wick, meaning price opened near its low and closed near its high.",
    means: "It reflects one-sided control by buyers throughout the candle's duration, with almost no push-back from sellers.",
    context: "Traders often examine the surrounding trend and volume context, since a strong single candle can also mark a short-term exhaustion point rather than a continuation."
  },
  "bearish marubozu": {
    name: "Bearish Marubozu",
    what: "A Bearish Marubozu is a candle with a large bearish body and little to no upper or lower wick, meaning price opened near its high and closed near its low.",
    means: "It reflects one-sided control by sellers throughout the candle's duration, with almost no push-back from buyers.",
    context: "Traders often examine the surrounding trend and volume context, since a strong single candle can also mark a short-term exhaustion point rather than a continuation."
  },
  "strong bullish candle": {
    name: "Strong Bullish Candle",
    what: "A candle with a large bullish (up) body relative to its total range, without meeting the strict wick criteria of a Marubozu.",
    means: "It shows that buyers were broadly in control for most of the candle's duration, though the wicks present indicate some push-back from sellers.",
    context: "Traders commonly examine this alongside trend, volume and nearby support/resistance rather than viewing the candle in isolation."
  },
  "strong bearish candle": {
    name: "Strong Bearish Candle",
    what: "A candle with a large bearish (down) body relative to its total range, without meeting the strict wick criteria of a Marubozu.",
    means: "It shows that sellers were broadly in control for most of the candle's duration, though the wicks present indicate some push-back from buyers.",
    context: "Traders commonly examine this alongside trend, volume and nearby support/resistance rather than viewing the candle in isolation."
  },
  "morning star": {
    name: "Morning Star",
    what: "A three-candle sequence: a bearish candle, a small-bodied pause candle, then a bullish candle closing back above the first candle's midpoint.",
    means: "It is commonly observed as a potential bottoming sequence, where selling pressure fades and buyers regain some control.",
    context: "Confirmation may be required from subsequent candles, and traders generally examine where the sequence forms relative to the broader trend."
  },
  "evening star": {
    name: "Evening Star",
    what: "A three-candle sequence: a bullish candle, a small-bodied pause candle, then a bearish candle closing back below the first candle's midpoint.",
    means: "It is commonly observed as a potential topping sequence, where buying pressure fades and sellers regain some control.",
    context: "Confirmation may be required from subsequent candles, and traders generally examine where the sequence forms relative to the broader trend."
  },
  "spinning top": {
    name: "Spinning Top",
    what: "A Spinning Top has a small body with wicks of comparable length on both sides, showing price moved in both directions but closed near where it opened.",
    means: "It can indicate a temporary balance between buyers and sellers within that candle.",
    context: "Traders often examine the following candles and the surrounding trend for confirmation before treating this as a meaningful shift."
  },
  "inside bar": {
    name: "Inside Bar",
    what: "An Inside Bar is a candle whose entire high-low range sits within the range of the previous candle.",
    means: "It can reflect a period of contraction or consolidation, where the market pauses relative to the prior candle's range.",
    context: "Traders commonly examine which direction price eventually moves out of this contracted range, along with the broader trend, for further context."
  },
  "flat bar": {
    name: "Flat Bar",
    what: "A candle with very little net movement between its open and close relative to its overall range.",
    means: "It generally reflects limited directional conviction during that candle.",
    context: "Traders often look at surrounding candles and volume for additional context rather than drawing conclusions from a single flat candle."
  }
};

// Looks up an education entry by the pattern label actually shown on the
// chart. Falls back to a normalized (lowercase, parenthetical-stripped)
// match so labels like "Doji (Indecision)" still resolve to the "Doji"
// entry, and returns null (never a fabricated definition) if a pattern name
// has no matching entry.
export function getPatternEducation(rawName) {
  if (!rawName) return null;
  var key = String(rawName).toLowerCase().trim();
  if (PATTERN_EDUCATION[key]) return PATTERN_EDUCATION[key];
  var stripped = key.replace(/\s*\([^)]*\)\s*/g, "").trim();
  if (PATTERN_EDUCATION[stripped]) return PATTERN_EDUCATION[stripped];
  return null;
}
