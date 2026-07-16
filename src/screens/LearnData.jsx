// BreakoutPro - LearnData.jsx
// All educational content arrays for the Learn screen.
// Rules: no backticks, no triple-equals, ASCII only.

export var CANDLE_PATTERNS = [
  {name:"Bullish Engulfing",type:"Bullish",desc:"Large green candle engulfs previous red candle. Strong reversal at support. Entry above high, SL below low."},
  {name:"Bearish Engulfing",type:"Bearish",desc:"Large red candle engulfs previous green candle. Strong reversal at resistance."},
  {name:"Doji",type:"Neutral",desc:"Open and close nearly equal. Shows indecision. Wait for confirmation candle."},
  {name:"Hammer",type:"Bullish",desc:"Small body, long lower wick at bottom of downtrend. Bulls rejected selling strongly."},
  {name:"Shooting Star",type:"Bearish",desc:"Small body, long upper wick at top of uptrend. Bears rejected buying strongly."},
  {name:"Morning Star",type:"Bullish",desc:"3-candle: Red, Doji, Green. Strong reversal at support. Day 3 volume must be high."},
  {name:"Evening Star",type:"Bearish",desc:"3-candle: Green, Doji, Red. Strong reversal at resistance. Day 3 volume must be high."},
  {name:"Marubozu",type:"Bullish",desc:"Full body candle, no wicks. Complete bull dominance. Trade in trend direction."},
  {name:"Harami",type:"Neutral",desc:"Small candle inside previous candle. Slowing momentum. Wait for breakout direction."},
  {name:"Piercing Pattern",type:"Bullish",desc:"Green candle opens below but closes above Day1 midpoint. Bullish reversal at support."},
  {name:"Dark Cloud Cover",type:"Bearish",desc:"Red candle opens above but closes below Day1 midpoint. Bearish reversal at resistance."},
  {name:"Inside Bar",type:"Neutral",desc:"Candle completely inside previous candle. Consolidation. Trade the breakout side."},
  {name:"Tweezer Top",type:"Bearish",desc:"Two candles with equal highs. Double rejection at resistance. Bearish signal."},
  {name:"Tweezer Bottom",type:"Bullish",desc:"Two candles with equal lows. Double rejection at support. Bullish signal."},
];

export var OI_TOPICS = [
  {title:"What is Open Interest?",content:"OI = total outstanding contracts not yet settled. Rising OI + Rising Price = Long Buildup (Bullish). Rising OI + Falling Price = Short Buildup (Bearish). Falling OI + Rising Price = Short Covering (Bullish). Falling OI + Falling Price = Long Unwinding (Bearish)."},
  {title:"Put-Call Ratio (PCR)",content:"PCR = Put OI / Call OI. Below 0.7 = Overbought (Bearish signal). Above 1.3 = Oversold (Bullish signal). Between 0.7-1.3 = Neutral zone. Watch PCR changes rather than absolute values."},
  {title:"Max Pain Theory",content:"Max Pain = strike price where option buyers lose maximum money at expiry. Stocks tend to gravitate towards max pain near expiry. Use as reference, not exact prediction. Works best in weekly expiry final 2 days."},
  {title:"Option Greeks",content:"Delta: Price sensitivity. Call 0 to 1, Put 0 to -1. Gamma: Rate of delta change. Theta: Time decay. ATM options lose value fastest. Vega: Volatility sensitivity. IV crush happens after events."},
  {title:"OI in F and O",content:"Check OI build-up at strike prices. High Call OI = resistance. High Put OI = support. Max Pain usually between highest Call and Put OI strikes. PCR helps judge market sentiment."},
];

export var STRATEGIES = [
  {title:"EMA Strategy",content:"EMA 9 > EMA 21 > EMA 50 = Strong uptrend. Price bounces from EMA 21 in uptrend. Price rejects EMA 9/21 in downtrend. Entry: Price touches EMA and bounces with volume. SL: Below previous candle low."},
  {title:"VWAP Strategy",content:"Price above VWAP = Bullish intraday bias. Long trades near VWAP support. Short trades near VWAP resistance. VWAP acts as dynamic support/resistance throughout the day. Most reliable between 10AM-2PM."},
  {title:"Breakout Strategy",content:"Wait for price to break above resistance with 1.5x+ volume. Entry: Candle close above resistance. SL: Below breakout candle low. Target: Resistance + height of base pattern. Avoid low volume breakouts."},
  {title:"CPR Strategy",content:"Narrow CPR = Trending day. Wide CPR = Sideways day. Price above TC = Bullish. Price below BC = Bearish. CPR acts as magnet. Use with EMA and VWAP for confirmation."},
  {title:"ORB Strategy",content:"Opening Range Breakout. First 15 min forms the range. Buy above first 15 min high with volume. Sell below first 15 min low with volume. SL = opposite end of ORB. Works best on trending days."},
  {title:"Scalping Strategy",content:"Use 1-3 min charts. EMA 9 and 21 for trend. VWAP for bias. RSI for entry timing. Trade only in trend direction. Keep RR minimum 1:1.5. Max 3-4 trades per session."},
];

export var RISK_TOPICS = [
  {title:"Position Sizing",content:"Risk only 1-2% per trade. Formula: Position Size = (Capital x Risk%) / Stop Loss distance. Example: Rs 1 lakh capital, 1% risk = Rs 1000 max loss per trade. If SL = Rs 10, quantity = 100 shares."},
  {title:"Stop Loss Discipline",content:"Always set SL before entering. Never move SL further away. SL = your insurance. Without SL, one trade can wipe months of profit. Use trailing SL to protect profits."},
  {title:"Risk Reward Ratio",content:"Minimum 1:2 RR. For every Rs 1 risked, target Rs 2 profit. At 50% win rate with 1:2 RR, you are profitable. Better to have fewer high RR trades than many 1:1 trades."},
  {title:"Trading Psychology",content:"Fear and greed destroy traders. Fear = exit too early. Greed = hold too long. Solution: Pre-plan entry, SL and target before trade. Follow the plan. Journal every trade. Review weekly."},
  {title:"Common Mistakes",content:"No SL = biggest mistake. Averaging down losers. Overtrading. Revenge trading after loss. Trading without a plan. FOMO entries. Not reviewing trades. Taking trades against trend."},
];

export var PSYCH_TOPICS = [
  {title:"Fear and Greed",content:"Fear makes you exit early. Greed makes you hold losers. Identify which emotion controls you and work on it daily."},
  {title:"Loss Aversion",content:"Losses hurt 2x more than gains feel good. This causes traders to hold losers too long and cut winners too early."},
  {title:"Confirmation Bias",content:"We tend to look for information that confirms what we already believe. Always look at both bullish and bearish cases."},
  {title:"Overtrading",content:"Boredom and revenge trading are deadly. The best traders often sit on their hands for hours waiting for the right setup."},
  {title:"Discipline over Intelligence",content:"A consistent trader with simple rules beats a smart trader who keeps changing strategies."},
  {title:"Journaling",content:"Write every trade down - entry, exit, reason, emotion. This is the single most powerful habit of professional traders."},
  {title:"Accept Losses",content:"Every trader has losing days. What separates pros is they keep losses small and let winners run."},
];

export var PRICE_TOPICS = [
  {title:"Support and Resistance",content:"Support is a price level where buyers historically step in. Resistance is where sellers dominate. These levels flip roles when broken."},
  {title:"Trend Structure",content:"Uptrend = Higher Highs + Higher Lows. Downtrend = Lower Highs + Lower Lows. Trade in the direction of the trend."},
  {title:"Breakout Trading",content:"When price breaks above resistance with volume, it signals a strong move. Wait for a candle close above the level before entering."},
  {title:"Pullback Entry",content:"The safest entries are on pullbacks to support in an uptrend. Risk is clearly defined with SL just below support."},
  {title:"Consolidation",content:"When price moves sideways in a tight range, it is consolidating energy. Breakout from consolidation often leads to strong moves."},
  {title:"Volume Analysis",content:"Volume confirms price moves. Breakout on high volume = valid. Breakout on low volume = likely to fail."},
];

export var LESSONS = [
  "Support becomes resistance once broken. Watch for retests.",
  "Never risk more than 1-2% of capital on a single trade.",
  "Volume confirms price moves. Breakout without volume = false breakout.",
  "VWAP is the most important intraday level. Price above VWAP = bullish.",
  "Theta works against option buyers every single day.",
  "High PCR above 1.3 = oversold market. Low PCR = overbought.",
  "Trade in the direction of the larger timeframe trend.",
];

export var TIPS = [
  "Volume confirms every breakout",
  "RSI + Price Action = powerful combo",
  "EMA 21 is the most watched level",
  "Never trade against the trend",
  "Plan the trade, trade the plan",
];

export var TOPICS = [
  {id:"candles",    title:"Candlestick Patterns",sub:"14 patterns with detail",       bg:"rgba(249,115,22,0.08)", bd:"rgba(249,115,22,0.2)", icon:"&#128202;"},
  {id:"oi",         title:"Options Basics",      sub:"PCR, Max Pain, Greeks, IV",     bg:"rgba(0,200,83,0.08)",   bd:"rgba(0,200,83,0.2)",   icon:"&#127919;"},
  {id:"strategy",   title:"Trading Strategies",  sub:"EMA, VWAP, Breakout, CPR",      bg:"rgba(30,144,255,0.08)", bd:"rgba(30,144,255,0.2)", icon:"&#128200;"},
  {id:"risk",       title:"Risk Management",     sub:"Position size, SL, R:R ratio",  bg:"rgba(239,68,68,0.08)",  bd:"rgba(239,68,68,0.2)",  icon:"&#128737;"},
  {id:"psychology", title:"Trading Psychology",  sub:"Mindset, emotions, discipline", bg:"rgba(124,58,237,0.08)", bd:"rgba(124,58,237,0.2)", icon:"&#129504;"},
  {id:"priceaction",title:"Price Action",        sub:"Support, resistance, structure",bg:"rgba(245,158,11,0.08)", bd:"rgba(245,158,11,0.2)", icon:"&#128240;"},
];
