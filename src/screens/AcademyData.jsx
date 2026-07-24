// BreakoutPro - AcademyData.jsx
// Trading Academy curriculum data. All lesson body text is original,
// educational, SEBI-safe (no buy/sell/target/stoploss language, no
// guaranteed-outcome claims, no copyrighted book content - written fresh
// for this app). Each module's FIRST lesson is fully authored with a real
// quiz. Remaining lessons are honestly marked comingSoon:true with a title
// only - never rendered as if they have content when they do not.
// Rules: no backtick, no triple-equals, ASCII only.

// Small bilingual-ready dictionary for Academy's own UI chrome (module/nav
// labels only - lesson body text stays English for now, since genuine
// Telugu translation of full lesson prose is a larger future task, not
// fabricated here). Mirrors the shared i18n t()'s exact fallback pattern
// (requested language -> English -> key) without touching the shared,
// deliberately English-locked src/i18n/translations.jsx file.
var ACADEMY_STR = {
  en: {
    academy_title: "Trading Academy",
    academy_sub: "Learn at your own pace. Educational only.",
    modules: "Modules",
    lessons: "Lessons",
    start: "Start",
    continue_lbl: "Continue",
    completed: "Completed",
    quiz: "Quiz",
    quiz_title: "Chapter Quiz",
    submit: "Submit",
    next_lesson: "Next Lesson",
    back_to_module: "Back to Module",
    coming_soon: "Coming soon",
    your_progress: "Your Progress",
    correct: "Correct",
    incorrect: "Incorrect",
    retry: "Try Again"
  },
  te: {
    academy_title: "\u0C1F\u0CCD\u0C30\u0C47\u0C21\u0CBF\u0C02\u0C17\u0CCD \u0C05\u0C15\u0C3E\u0C21\u0C2E\u0C40",
    academy_sub: "\u0C2E\u0C40 \u0C38\u0C4D\u0C35\u0C02\u0C24 \u0C35\u0C47\u0C17\u0C02\u0C24\u0C4B \u0C28\u0C47\u0C30\u0CCD\u0C1A\u0CC1\u0C15\u0C4B\u0C02\u0C21\u0CBF",
    modules: "Modules",
    lessons: "\u0C2A\u0C3E\u0C20\u0C3E\u0C32\u0CC1",
    start: "\u0C2A\u0CCD\u0CB0\u0C3E\u0CB0\u0C02\u0C2D\u0C3F\u0C02\u0C1A\u0C41",
    continue_lbl: "\u0C15\u0CCA\u0C28\u0CB8\u0C3E\u0C17\u0CBF\u0C02\u0C1A\u0C41",
    completed: "\u0C2A\u0CC2\u0CB0\u0CCD\u0C24\u0C48\u0C02\u0C26\u0CBF",
    quiz: "\u0C15\u0CCD\u0C35\u0CBF\u0C1C\u0CCD",
    quiz_title: "\u0C05\u0C27\u0CCD\u0C2F\u0CBE\u0C2F \u0C15\u0CCD\u0C35\u0CBF\u0C1C\u0CCD",
    submit: "\u0C38\u0C2E\u0CB0\u0CCD\u0C2A\u0CBF\u0C02\u0C1A\u0C41",
    next_lesson: "\u0C24\u0C26\u0CC1\u0C2A\u0CBF \u0C2A\u0C3E\u0C20\u0C02",
    back_to_module: "\u0C2E\u0C4B\u0C21\u0CCD\u0C2F\u0CC2\u0C32\u0CCD\u200C\u0C15\u0CC1 \u0C24\u0CBF\u0C30\u0CBF\u0C17\u0CBF",
    coming_soon: "\u0C24\u0CCD\u0C35\u0C30\u0C32\u0CB0\u0C4D",
    your_progress: "\u0C2E\u0C40 \u0C2A\u0CCD\u0CB0\u0C17\u0C24\u0C3F",
    correct: "\u0C38\u0CB0\u0C48\u0C28\u0C26\u0CBF",
    incorrect: "\u0C24\u0CAA\u0CCD\u0C2A\u0CC1",
    retry: "\u0C2E\u0CB3\u0CCD\u0CB2\u0C40 \u0C2A\u0CCD\u0CB0\u0CAF\u0C24\u0CCD\u0C28\u0CBF\u0C02\u0C1A\u0C41"
  }
};
export function at(key, lang){
  var l = (lang=="te") ? "te" : "en";
  if(ACADEMY_STR[l] && ACADEMY_STR[l][key]!=undefined) return ACADEMY_STR[l][key];
  if(ACADEMY_STR.en[key]!=undefined) return ACADEMY_STR.en[key];
  return key;
}

// ---- Curriculum ----
// Each module: id, title, icon, color, lessons[]. lessons[0] is always fully
// authored (body + quiz). Remaining lessons are titles only, comingSoon:true.

export var MODULES = [
  {
    id:"sharemarket", title:"Share Market Basics", icon:"\u{1F4C8}", color:"#3B82F6",
    lessons:[
      {
        id:"sm1", title:"What Is the Stock Market?",
        body:[
          "A stock market is a public place - today mostly electronic - where shares of companies are bought and sold. In India, the two main exchanges are the National Stock Exchange (NSE) and the Bombay Stock Exchange (BSE).",
          "When you buy a share, you are buying a small ownership piece of a real company. If that company grows and does well over time, the value of your ownership piece may grow too. If it does poorly, the value may fall. This is why share prices move up and down every single day - they reflect what buyers and sellers currently believe a company is worth.",
          "Indices like NIFTY 50 and SENSEX are not individual companies - they are baskets that track the average performance of many large companies together, so people can get a quick sense of how the market is doing overall without checking every company one by one.",
          "New investors often assume the stock market is like gambling. It is not the same thing - gambling has no underlying asset, while a share represents real ownership in a real business with real revenue and real risk. That said, share prices can still be genuinely unpredictable in the short term, which is exactly why education, patience, and risk management matter so much before putting in real money."
        ],
        quiz:[
          {q:"What does owning a share actually represent?", options:["A loan to the government","A small ownership piece of a company","A fixed-interest deposit","A guaranteed profit contract"], correct:1},
          {q:"NIFTY 50 and SENSEX are examples of:", options:["Individual companies","Market indices tracking many companies","Government bonds","Mutual funds"], correct:1},
          {q:"Which Indian exchange is NOT mentioned as a main exchange?", options:["NSE","BSE","LSE","Both NSE and BSE are correct"], correct:2}
        ]
      },
      {id:"sm2", title:"How Orders Are Placed and Matched", comingSoon:true},
      {id:"sm3", title:"Understanding Market Timings and Sessions", comingSoon:true},
      {id:"sm4", title:"Types of Market Participants", comingSoon:true}
    ]
  },
  {
    id:"candles", title:"Candlestick School", icon:"\u{1F56F}", color:"#22C55E",
    lessons:[
      {
        id:"cs1", title:"Reading a Single Candle",
        body:[
          "A candlestick is simply a visual summary of price movement during one time period - it could be one minute, one hour, or one full day, depending on the chart's timeframe.",
          "Every candle has four key prices: Open (the price at the start of the period), Close (the price at the end), High (the highest price reached), and Low (the lowest price reached). Together these are called OHLC.",
          "The thick middle part of the candle is called the body and shows the distance between the open and close. If the close is higher than the open, the body is usually colored green, and traders call this a bullish candle. If the close is lower than the open, the body is usually red, called a bearish candle.",
          "The thin lines above and below the body are called wicks or shadows. They show the high and low reached during that period, even if the price came back down (or up) before the period ended. A long wick tells you that price moved a lot in one direction but was then pushed back - this is often read as a sign of rejection at that price level, though it is only one observation among many, never a guarantee of what happens next."
        ],
        quiz:[
          {q:"What does the body of a candle represent?", options:["The distance between high and low","The distance between open and close","The trading volume","The number of buyers"], correct:1},
          {q:"A candle where close is higher than open is usually called:", options:["Bearish","Bullish","Neutral","Doji"], correct:1},
          {q:"A long wick generally shows that:", options:["Volume was zero","Price moved to that level but was pushed back","The market was closed","The candle is fake"], correct:1}
        ]
      },
      {id:"cs2", title:"Doji and Indecision Candles", comingSoon:true},
      {id:"cs3", title:"Engulfing Patterns", comingSoon:true},
      {id:"cs4", title:"Hammers and Shooting Stars", comingSoon:true},
      {id:"cs5", title:"Multi-Candle Patterns", comingSoon:true}
    ]
  },
  {
    id:"pa_structure", title:"Market Structure", icon:"\u{1F4CA}", color:"#F59E0B",
    lessons:[
      {
        id:"pas1", title:"Reading Market Structure",
        illustration:"Diagram: a price line forming Higher Highs and Higher Lows during an uptrend, then Lower Highs and Lower Lows during a downtrend",
        body:[
          "Market structure is simply the shape price makes over time - a record of its swing highs and swing lows. Learning to read this shape is one of the very first skills in price action study, because almost every other price-action concept builds on top of it.",
          "In an uptrend, price tends to make Higher Highs (HH) and Higher Lows (HL) - each new peak is higher than the last, and each pullback stops at a higher point than the previous pullback. In a downtrend, the opposite happens: Lower Highs (LH) and Lower Lows (LL).",
          "When neither pattern is clearly present - price bounces sideways without a clear staircase up or down - the market is often described as 'ranging' or 'consolidating'. Recognizing this state is just as important as recognizing a trend, since many price-action tools behave differently in a range than in a trend.",
          "Market structure is a description of what has already happened, not a prediction of what will happen next. A structure can shift at any time - which is exactly why later lessons on Break of Structure and Change of Character exist as their own dedicated topics."
        ],
        quiz:[
          {q:"Higher Highs and Higher Lows are generally associated with:", options:["A downtrend","An uptrend","A stock split","A dividend announcement"], correct:1},
          {q:"When price bounces sideways with no clear staircase pattern, this is usually called:", options:["A crash","Ranging or consolidation","A guaranteed reversal","An IPO"], correct:1},
          {q:"Market structure is best understood as:", options:["A guaranteed prediction of the future","A description of price's past swing pattern","A government regulation","A type of order"], correct:1}
        ]
      },
      {id:"pas2", title:"Swing Highs and Swing Lows in Detail", comingSoon:true},
      {id:"pas3", title:"Identifying Trend Shifts Early", comingSoon:true}
    ]
  },
  {
    id:"pa_sr", title:"Support & Resistance", icon:"\u{1F6A7}", color:"#3B82F6",
    lessons:[
      {
        id:"pasr1", title:"Support and Resistance Basics",
        illustration:"Diagram: a price chart with a horizontal support zone below and a resistance zone above, price bouncing between them",
        body:[
          "Support is a price level where a stock or index has historically tended to stop falling and bounce back up, because enough buyers stepped in at that price. Resistance is the opposite - a level where price has tended to stop rising and pull back, because enough sellers appeared at that price.",
          "These levels are not exact laser lines - they are more like zones, because real buying and selling interest happens across a small range of prices, not one single perfect number. That is why experienced chart readers often talk about a support zone rather than one exact price.",
          "An important, often-misunderstood idea: once resistance is genuinely broken (price closes clearly above it, not just briefly touches it), that same level can later act as support if price comes back down to it. The reverse is also true - broken support can become new resistance. This is sometimes called role reversal.",
          "Support and resistance are observational tools, not promises. Price can and does break through these levels, sometimes strongly. They are one input among many that traders use to build a fuller picture - never a guarantee of what will happen next."
        ],
        quiz:[
          {q:"Support is best described as a level where:", options:["Price always reverses with certainty","Buyers have historically stepped in and price tended to bounce","The company reports earnings","Volume is always highest"], correct:1},
          {q:"Support and resistance are better thought of as:", options:["Exact single prices","Zones or ranges","Government-set limits","Fixed forever, never changing"], correct:1},
          {q:"Role reversal refers to:", options:["A stock changing its name","Broken resistance later acting as support (or vice versa)","A company changing its CEO","Volume reversing direction"], correct:1}
        ]
      },
      {id:"pasr2", title:"Zones vs Exact Price Levels", comingSoon:true},
      {id:"pasr3", title:"Multiple-Timeframe Support and Resistance", comingSoon:true}
    ]
  },
  {
    id:"pa_trendlines", title:"Trendlines", icon:"\u{1F4C9}", color:"#22C55E",
    lessons:[
      {
        id:"pat1", title:"Drawing and Reading Trendlines",
        illustration:"Diagram: an upward-sloping trendline connecting two or more swing lows beneath rising price",
        body:[
          "A trendline is a straight line drawn by connecting a series of swing points - swing lows in an uptrend, or swing highs in a downtrend - to visualize the general slope and pace of a trend.",
          "A common educational guideline is that a trendline drawn through only two points is a hypothesis, while a third point that also respects the line adds more observational weight to it. No number of touches, however, turns a trendline into a certainty - it remains a visual aid, not a rule of physics.",
          "The steepness (angle) of a trendline matters. A very steep trendline often reflects a fast, emotional move that may be harder to sustain, while a gentler slope often reflects a steadier, more gradual trend. This is an observation experienced chart readers make, not a fixed law.",
          "Trendlines are frequently redrawn as new swing points form - this is normal and expected, not a sign that the original line was 'wrong'. Price action study is an ongoing process of updating your picture as more real information arrives, not committing to one static line forever."
        ],
        quiz:[
          {q:"A trendline in an uptrend is typically drawn by connecting:", options:["Swing highs only","Swing lows","Volume bars","Opening prices only"], correct:1},
          {q:"A trendline touched by a third genuine swing point:", options:["Becomes a guaranteed support level","Gains more observational weight, but is still not a certainty","Automatically triggers a buy signal","Means the stock will split"], correct:1},
          {q:"Redrawing a trendline as new swings form is:", options:["A sign of a mistake","A normal, expected part of ongoing analysis","Against exchange rules","Only done by beginners"], correct:1}
        ]
      },
      {id:"pat2", title:"Trend Channels", comingSoon:true},
      {id:"pat3", title:"Trendline Breaks vs Genuine Reversals", comingSoon:true}
    ]
  },
  {
    id:"pa_breakout", title:"Breakout", icon:"\u{1F680}", color:"#EF4444",
    lessons:[
      {
        id:"pab1", title:"Understanding Breakouts",
        illustration:"Diagram: price compressing near a resistance line, then closing clearly above it with an expanding candle",
        body:[
          "A breakout is what chart readers call it when price moves clearly beyond a previously respected support or resistance level, or beyond the edge of a trading range, often accompanied by increased participation.",
          "The word 'clearly' matters a lot here. A brief wick poking above resistance, followed by price falling back inside the range, is generally not treated as a confirmed breakout by experienced chart readers - a real close beyond the level carries more weight than a brief touch.",
          "Breakouts are often discussed alongside volume, because a level being cleared on unusually high participation is read differently than the same level being cleared on very light activity. Neither guarantees what happens next, but they are commonly observed together in price-action study.",
          "Because breakouts can and do fail (see the dedicated Fake Breakout module), this topic is best treated as one observational tool among several, not a standalone signal to act on by itself."
        ],
        quiz:[
          {q:"A breakout generally refers to price moving:", options:["Sideways within a range","Clearly beyond a previously respected level","Toward the average of the last 10 closes","Exactly to the opening price"], correct:1},
          {q:"A brief wick above resistance that falls back inside the range is usually treated as:", options:["A confirmed breakout","Not a confirmed breakout on its own","Proof of a stock split","A dividend signal"], correct:1},
          {q:"Volume is often discussed alongside breakouts because:", options:["It always guarantees the breakout will continue","Different participation levels are commonly read differently by chart readers","Volume determines the company's dividend","It has no relationship to breakouts"], correct:1}
        ]
      },
      {id:"pab2", title:"Measuring Breakout Follow-Through", comingSoon:true},
      {id:"pab3", title:"Breakout Retests", comingSoon:true}
    ]
  },
  {
    id:"pa_fakebreakout", title:"Fake Breakout", icon:"\u26A0\uFE0F", color:"#F97316",
    lessons:[
      {
        id:"paf1", title:"Understanding False Breakouts",
        illustration:"Diagram: price briefly closing above resistance, then reversing sharply back below it within a few candles",
        body:[
          "A false breakout (sometimes called a 'fakeout' or a bull/bear trap) happens when price appears to break beyond a support or resistance level, drawing in participants who act on that apparent breakout, and then reverses back inside the original range shortly after.",
          "These patterns are widely discussed in price-action education precisely because they are common and can catch inexperienced chart readers off guard - the initial move can look convincing at the exact moment it happens.",
          "One frequently cited educational observation is that false breakouts often occur on comparatively lower participation than genuine breakouts, though this is a tendency discussed in educational material, not a rule that holds in every single case.",
          "Because a breakout cannot be labeled 'false' with certainty until after price has actually reversed, this concept is best understood as a pattern recognized in hindsight and studied for pattern-recognition purposes - not as a tool that reliably predicts, in advance, which specific breakout will fail."
        ],
        quiz:[
          {q:"A false breakout is also sometimes called a:", options:["Stock split","Bull or bear trap","Dividend event","IPO"], correct:1},
          {q:"False breakouts are widely studied because they:", options:["Never happen in real markets","Are common and can catch chart readers off guard","Are illegal","Only happen once a year"], correct:1},
          {q:"A breakout can be confidently labeled 'false' only:", options:["Before it happens","After price has actually reversed back inside the range","By SEBI","Never"], correct:1}
        ]
      },
      {id:"paf2", title:"Common Fake Breakout Contexts", comingSoon:true},
      {id:"paf3", title:"Distinguishing Genuine vs False Breaks", comingSoon:true}
    ]
  },
  {
    id:"pa_supplydemand", title:"Supply & Demand", icon:"\u2696\uFE0F", color:"#2563EB",
    lessons:[
      {
        id:"pasd1", title:"Supply and Demand Zones",
        illustration:"Diagram: a horizontal zone marked on a chart where price previously moved away sharply, labeled as a demand zone",
        body:[
          "Supply and demand zones are a close cousin of support and resistance, but framed around the idea of an imbalance between buying and selling interest at a particular price area, rather than simply 'price bounced here before'.",
          "A demand zone is an area where buying pressure has previously overwhelmed selling pressure strongly enough to push price away quickly. A supply zone is the mirror image - an area where selling pressure previously overwhelmed buying pressure.",
          "A commonly cited educational idea is that zones formed by a sharp, fast move away (rather than a slow, gradual one) are considered by many chart readers to reflect a stronger imbalance - though, as with all price-action concepts in this course, this is an observational framework, not a certainty.",
          "Like support and resistance, supply and demand zones are treated as areas of interest to watch, not as guaranteed turning points. Price can and does pass through them without reacting at all."
        ],
        quiz:[
          {q:"A demand zone reflects an area where:", options:["Selling pressure previously overwhelmed buying","Buying pressure previously overwhelmed selling, pushing price away","The company issued new shares","Volume was always zero"], correct:1},
          {q:"Zones formed by a fast move away are often read by chart readers as:", options:["Meaningless","Reflecting a possibly stronger imbalance (an observation, not a certainty)","Proof of a guaranteed reversal","Illegal trading activity"], correct:1},
          {q:"Supply and demand zones should be treated as:", options:["Guaranteed turning points","Areas of interest to watch, not guarantees","Government-mandated levels","Irrelevant to price action"], correct:1}
        ]
      },
      {id:"pasd2", title:"Zone Freshness and Retests", comingSoon:true},
      {id:"pasd3", title:"Zones Across Timeframes", comingSoon:true}
    ]
  },
  {
    id:"pa_liquidity", title:"Liquidity", icon:"\u{1F4A7}", color:"#60A5FA",
    lessons:[
      {
        id:"pal1", title:"What Liquidity Means in Price Action",
        illustration:"Diagram: clusters of resting orders shown just beyond an obvious swing high and swing low on a chart",
        body:[
          "In price-action education, 'liquidity' often refers to areas on a chart where a cluster of pending orders is believed to sit - for example, just beyond an obvious recent swing high or swing low, where many participants may have placed protective or entry orders.",
          "The general educational idea is that price sometimes moves toward these areas because a concentration of orders offers more counter-parties for large trades to be filled against, though the exact mechanics are debated and not something any single tool can prove in real time.",
          "This concept is closely related to the earlier lessons on breakouts and false breakouts - a move that clears an obvious swing point, interacts with resting orders there, and then reverses is one way this idea is commonly discussed in educational material.",
          "Liquidity, as taught here, is a conceptual lens for understanding why certain price areas attract attention - it is not a live data feed of actual order books, and this course does not claim to measure real liquidity positions."
        ],
        quiz:[
          {q:"In price-action education, 'liquidity' commonly refers to:", options:["A company's cash reserves","Areas believed to hold clusters of pending orders","The stock's dividend yield","A type of mutual fund"], correct:1},
          {q:"Liquidity concepts are closely related to which earlier topics?", options:["Dividends and IPOs","Breakouts and false breakouts","Circuit limits only","Mutual fund NAV"], correct:1},
          {q:"This lesson's liquidity concept is:", options:["A live order-book data feed","A conceptual educational lens, not a real-time data measurement","A guaranteed prediction tool","Exclusive to futures trading"], correct:1}
        ]
      },
      {id:"pal2", title:"Liquidity Sweeps", comingSoon:true},
      {id:"pal3", title:"Liquidity and Range Extremes", comingSoon:true}
    ]
  },
  {
    id:"pa_bos", title:"BOS (Break of Structure)", icon:"\u{1F4CF}", color:"#8B5CF6",
    lessons:[
      {
        id:"pabos1", title:"What Is a Break of Structure?",
        illustration:"Diagram: an uptrend's Higher-Low broken as price closes below it, labeled BOS",
        body:[
          "Break of Structure (BOS) is a term used when price moves beyond a recent swing point in a way that is consistent with the CURRENT trend continuing - for example, in an uptrend, price closing above the most recent swing high.",
          "This is an important distinction from a trend reversal signal: a BOS in an uptrend is generally read as the uptrend continuing its established Higher-High, Higher-Low pattern, not as a warning sign.",
          "BOS builds directly on the Market Structure lesson earlier in this course - you cannot meaningfully identify a Break of Structure without first having a clear picture of the swing highs and swing lows that define the current structure.",
          "As with every price-action concept in this course, a BOS is an observation about what price has just done, not a promise about what it will do next. The related but different concept of a trend potentially reversing is covered in the next module, CHOCH."
        ],
        quiz:[
          {q:"A Break of Structure (BOS) generally reflects:", options:["The current trend potentially reversing","The current trend continuing its established pattern","A dividend payout","A stock split"], correct:1},
          {q:"BOS builds directly on which earlier topic?", options:["Volume Analysis","Market Structure (swing highs/lows)","IPO basics","Mutual funds"], correct:1},
          {q:"A BOS is best understood as:", options:["A guarantee of future price direction","An observation about what price has just done","A government filing requirement","A type of dividend"], correct:1}
        ]
      },
      {id:"pabos2", title:"BOS on Multiple Timeframes", comingSoon:true},
      {id:"pabos3", title:"BOS vs Simple Level Breaks", comingSoon:true}
    ]
  },
  {
    id:"pa_choch", title:"CHOCH (Change of Character)", icon:"\u{1F504}", color:"#EC4899",
    lessons:[
      {
        id:"pac1", title:"What Is a Change of Character?",
        illustration:"Diagram: an uptrend's Higher-High pattern failing, followed by a Lower-Low, labeled CHOCH",
        body:[
          "Change of Character (CHOCH) is a term used when price behavior shifts in a way that is INCONSISTENT with the current trend, unlike a BOS which continues it - for example, in an uptrend, price failing to make a new Higher High and then breaking below the most recent Higher Low.",
          "CHOCH is often discussed as an early educational signal that the current trend's structure may be shifting, which is why it is frequently studied alongside BOS as a pair of related but opposite concepts.",
          "It is important to understand that identifying a CHOCH is still just pattern recognition applied to structure that has already happened - it does not predict with certainty that a full trend reversal will follow, only that the CURRENT pattern of higher-highs-and-higher-lows (or the reverse) has been interrupted.",
          "Like BOS, CHOCH only makes sense once you have a solid grasp of the Market Structure lesson - both concepts are simply different ways of describing what happens when price interacts with recent swing points."
        ],
        quiz:[
          {q:"A Change of Character (CHOCH) generally reflects:", options:["The current trend continuing normally","A shift inconsistent with the current trend's established pattern","A company's earnings report","A fixed deposit maturing"], correct:1},
          {q:"CHOCH and BOS are best described as:", options:["Unrelated concepts","A related but opposite pair of structure concepts","The same exact thing","Only relevant to commodities"], correct:1},
          {q:"Identifying a CHOCH:", options:["Guarantees a full trend reversal","Is pattern recognition on structure that has already happened, not a certainty","Is a SEBI-mandated disclosure","Only applies to weekly charts"], correct:1}
        ]
      },
      {id:"pac2", title:"CHOCH Confirmation Ideas", comingSoon:true},
      {id:"pac3", title:"Avoiding Overinterpretation of CHOCH", comingSoon:true}
    ]
  },
  {
    id:"pa_volume", title:"Volume Analysis", icon:"\u{1F4CA}", color:"#D4AF37",
    lessons:[
      {
        id:"pav1", title:"Reading Volume Alongside Price",
        illustration:"Diagram: a price breakout candle paired with a taller-than-average volume bar directly beneath it",
        body:[
          "Volume simply measures how many shares (or contracts) changed hands during a given period. On its own it says nothing about direction - it only reflects how much activity occurred.",
          "Volume is almost always studied together with price, not alone. Rising price alongside rising volume is commonly read by chart readers as reflecting broader participation behind the move, while rising price on unusually low volume is often read as reflecting a move with less crowd conviction behind it - both are educational observations, not rules.",
          "Volume spikes - periods of unusually high activity compared to recent average volume - are often noted around news events, results, or significant technical levels like breakouts, precisely because more participants are reacting at the same time.",
          "As with every concept in this course, volume analysis is one input to combine with others (structure, support/resistance, trendlines) - it does not, by itself, generate a trading decision, and this course does not present volume patterns as buy or sell signals."
        ],
        quiz:[
          {q:"Volume by itself measures:", options:["Price direction","How many shares or contracts changed hands","The company's profit","The stock's dividend"], correct:1},
          {q:"Rising price on unusually low volume is often read by chart readers as:", options:["A move with less crowd conviction behind it","Proof of a guaranteed rally","A dividend announcement","Irrelevant information"], correct:0},
          {q:"Volume analysis in this course is presented as:", options:["A standalone buy/sell signal","One input to combine with other price-action tools","A guaranteed prediction method","A government requirement"], correct:1}
        ]
      },
      {id:"pav2", title:"Volume Spikes and Context", comingSoon:true},
      {id:"pav3", title:"Volume Divergence Concepts", comingSoon:true}
    ]
  },
  {
    id:"riskmgmt", title:"Risk Management", icon:"\u{1F6E1}", color:"#EF4444",
    lessons:[
      {
        id:"rm1", title:"Why Risk Management Comes Before Strategy",
        body:[
          "New traders often spend almost all their time looking for the perfect entry and almost no time thinking about what happens if the trade goes wrong. Experienced traders tend to do the opposite - they decide their risk BEFORE they decide their entry.",
          "Position sizing means deciding how much of your capital to put into a single trade. A common educational principle is to risk only a small, fixed percentage of your total capital on any one trade - so that even a string of losing trades does not seriously damage your overall capital. The exact percentage is a personal risk-tolerance decision, not a one-size-fits-all rule.",
          "Risk-to-reward ratio compares how much you are risking to how much you are hoping to gain on a trade. A trade with a poor risk-to-reward ratio can still lose you money overall even if you are right more often than you are wrong, which is a very common and costly misunderstanding among beginners.",
          "No amount of technical or fundamental analysis removes uncertainty from markets. Risk management exists precisely because the future is uncertain - its entire purpose is to make sure that being wrong sometimes does not turn into a catastrophic, capital-destroying event."
        ],
        quiz:[
          {q:"Position sizing refers to:", options:["Predicting the next big move","Deciding how much capital to risk on a single trade","Choosing a broker","Reading news headlines"], correct:1},
          {q:"A poor risk-to-reward ratio can lose money even if:", options:["You are right more often than wrong","The market is closed","You use a stoploss","You trade only blue-chip stocks"], correct:0},
          {q:"The core purpose of risk management is to:", options:["Guarantee profits","Predict the market perfectly","Prevent being wrong from becoming catastrophic","Eliminate all uncertainty"], correct:2}
        ]
      },
      {id:"rm2", title:"Stoploss Concepts (Educational)", comingSoon:true},
      {id:"rm3", title:"Diversification Basics", comingSoon:true},
      {id:"rm4", title:"Emotional Capital vs Financial Capital", comingSoon:true}
    ]
  },
  {
    id:"psychology", title:"Trading Psychology", icon:"\u{1F9E0}", color:"#8B5CF6",
    lessons:[
      {
        id:"ps1", title:"Fear, Greed, and Decision-Making",
        body:[
          "Markets are ultimately driven by the collective decisions of millions of participants, and those decisions are shaped heavily by emotion, not just logic. Two emotions come up again and again in trading education: fear and greed.",
          "Fear can cause a trader to exit a genuinely good position too early, or to avoid taking a well-thought-out trade altogether because of a recent loss. Greed can cause a trader to hold a position too long hoping for just a bit more, or to increase position size impulsively after a winning streak.",
          "Revenge trading is a well-documented pattern where a trader, after a loss, immediately takes another trade - often larger and less planned - purely to try to win back the loss quickly. This usually compounds the original problem rather than solving it.",
          "A calm, rules-based process - decided in advance, before emotions are running high - is one of the most consistently mentioned habits among experienced traders in trading education literature. This does not mean emotions disappear; it means decisions are made from a plan, not from the emotion of the moment."
        ],
        quiz:[
          {q:"Revenge trading typically happens:", options:["Before the market opens","Immediately after a loss, trying to win it back quickly","Only on Fridays","Only with options"], correct:1},
          {q:"Greed in trading can lead to:", options:["Exiting too early out of fear","Holding too long or increasing size impulsively","Better risk management","Lower position sizes"], correct:1},
          {q:"A rules-based process is valuable mainly because it is:", options:["Guaranteed to be profitable","Decided in advance, before emotion takes over","Only for professionals","A way to avoid all losses"], correct:1}
        ]
      },
      {id:"ps2", title:"Overtrading and FOMO", comingSoon:true},
      {id:"ps3", title:"Building a Trading Journal Habit", comingSoon:true},
      {id:"ps4", title:"Discipline vs Rigidity", comingSoon:true}
    ]
  },
  {
    id:"optionsbasics", title:"Options Basics", icon:"\u{1F3AF}", color:"#2563EB",
    lessons:[
      {
        id:"ob1", title:"What Is an Option, Really?",
        body:[
          "An option is a contract that gives the buyer a right (but not an obligation) to buy or sell an underlying asset - like NIFTY or a stock - at a fixed price (called the strike price) on or before a certain date (called the expiry).",
          "A Call option gives the right to buy at the strike price. A Put option gives the right to sell at the strike price. The person buying the option pays a price called the premium to the person selling (writing) the option.",
          "Options are called derivatives because their value is derived from something else - the underlying asset's price. Their pricing is influenced by several factors together: the underlying price, the strike price, time remaining until expiry, and volatility (how much the underlying is expected to move).",
          "Because an option buyer's maximum loss is limited to the premium paid, while an option seller's risk can be substantially larger, options are considered a more complex instrument than plain stock buying, and are usually recommended for study and small-scale practice before any serious capital is involved."
        ],
        quiz:[
          {q:"A Call option gives the holder the right to:", options:["Sell at the strike price","Buy at the strike price","Vote at company meetings","Receive dividends"], correct:1},
          {q:"The price paid by an option buyer to the seller is called the:", options:["Strike","Premium","Margin","Dividend"], correct:1},
          {q:"Options are called derivatives because:", options:["They are always risk-free","Their value is derived from an underlying asset","They only apply to indices","They never expire"], correct:1}
        ]
      },
      {id:"ob2", title:"Strike Price and Expiry Explained", comingSoon:true},
      {id:"ob3", title:"In-the-Money vs Out-of-the-Money", comingSoon:true},
      {id:"ob4", title:"Why Option Sellers Have Different Risk", comingSoon:true}
    ]
  },
  {
    id:"futuresbasics", title:"Futures Basics", icon:"\u{1F4C9}", color:"#EC4899",
    lessons:[
      {
        id:"fb1", title:"What Is a Futures Contract?",
        body:[
          "A futures contract is an agreement between two parties to buy or sell an underlying asset at a predetermined price on a specific future date. Unlike an option, a futures contract is an obligation for both sides, not just a right for one side.",
          "Futures are traded in fixed lot sizes rather than single units, and require a margin - a fraction of the total contract value - to be deposited, rather than the full value. This is what makes futures a leveraged instrument: a relatively small margin controls a much larger contract value, which magnifies both potential gains and potential losses.",
          "Open Interest (OI) is a term specific to futures and options - it represents the total number of outstanding contracts that have not yet been settled or closed. Rising OI alongside rising price is often read as a sign of fresh buying interest (sometimes called long build-up), while other OI/price combinations suggest different educational interpretations.",
          "Because of leverage, losses in futures trading can, in principle, exceed the initial margin deposited. This is one of the most important reasons futures are generally considered suitable only after solid foundational education and careful risk management planning."
        ],
        quiz:[
          {q:"Unlike an option, a futures contract is:", options:["A right for the buyer only","An obligation for both parties","Risk-free","Only available on stocks"], correct:1},
          {q:"Open Interest represents:", options:["Today's trading volume","The total outstanding unsettled contracts","The company's profit","The index's dividend yield"], correct:1},
          {q:"Leverage in futures means:", options:["A small margin controls a larger contract value","Trades are guaranteed to profit","No margin is required","Futures cannot lose money"], correct:0}
        ]
      },
      {id:"fb2", title:"Margin and Mark-to-Market", comingSoon:true},
      {id:"fb3", title:"Long Build-up vs Short Build-up", comingSoon:true},
      {id:"fb4", title:"Rollover and Expiry Mechanics", comingSoon:true}
    ]
  },
  {
    id:"glossary", title:"Trading Glossary", icon:"\u{1F4D6}", color:"#D4AF37",
    lessons:[
      {
        id:"gl1", title:"Essential Terms - Part 1",
        body:[
          "Bid: the highest price a buyer is currently willing to pay for a share.",
          "Ask (or Offer): the lowest price a seller is currently willing to accept.",
          "Volume: the total number of shares traded during a given period.",
          "Volatility: how much and how quickly a price tends to move, in either direction.",
          "Market Capitalization: the total value of a company's shares, calculated as share price multiplied by total number of shares outstanding.",
          "Circuit Limit: a regulatory price band that temporarily halts trading if a stock moves too far, too fast, in either direction, intended to curb extreme volatility.",
          "IPO (Initial Public Offering): the first time a private company offers its shares to the general public on a stock exchange."
        ],
        quiz:[
          {q:"Bid refers to:", options:["The lowest price a seller accepts","The highest price a buyer is willing to pay","A company's annual report","A type of index"], correct:1},
          {q:"Market Capitalization is calculated as:", options:["Revenue minus expenses","Share price times total shares outstanding","Total employees times average salary","Dividend yield times volume"], correct:1},
          {q:"A Circuit Limit exists to:", options:["Guarantee profits","Curb extreme volatility by halting trading temporarily","Set the company's tax rate","Determine dividend payments"], correct:1}
        ]
      },
      {id:"gl2", title:"Essential Terms - Part 2", comingSoon:true},
      {id:"gl3", title:"Derivatives Terms", comingSoon:true}
    ]
  },
  {
    id:"quiz", title:"Interactive Quiz", icon:"\u2753", color:"#F97316",
    lessons:[
      {
        id:"qz1", title:"Mixed Review Quiz - Round 1",
        body:[
          "This round mixes questions from Share Market Basics, Candlestick School, and Price Action University to help reinforce what you have learned so far across modules, rather than testing one topic in isolation."
        ],
        quiz:[
          {q:"A bullish candle means:", options:["Close was lower than open","Close was higher than open","Volume was zero","The market was closed"], correct:1},
          {q:"Support and resistance are best understood as:", options:["Exact single numbers","Zones where buying/selling interest has clustered","Government rules","Company earnings dates"], correct:1},
          {q:"An index like NIFTY 50 represents:", options:["A single company","A basket tracking many companies together","A type of bond","A government scheme"], correct:1}
        ]
      },
      {id:"qz2", title:"Mixed Review Quiz - Round 2", comingSoon:true}
    ]
  },
  {
    id:"progress", title:"Progress Tracking", icon:"\u{1F4C8}", color:"#22C55E",
    lessons:[
      {
        id:"pt1", title:"How Your Progress Is Tracked",
        body:[
          "Breakout Pro Academy tracks your real progress locally on your own device - which lessons you have opened, and which chapter quizzes you have completed. There is no fabricated streak or invented statistic anywhere in this module - every number you see reflects something you actually did.",
          "Completing a chapter quiz marks that lesson as complete in your progress view. Your overall percentage is calculated honestly from real completed lessons divided by total lessons currently available in the curriculum.",
          "As new lessons are added to each module over time, your percentage will naturally reflect the larger curriculum - this is expected and is not a sign of anything being wrong with your existing progress."
        ],
        quiz:[
          {q:"Where is your Academy progress stored?", options:["On a public leaderboard","Locally on your own device","Sent to your broker","Nowhere, it isn't tracked"], correct:1},
          {q:"What marks a lesson as complete?", options:["Opening the app","Completing that lesson's chapter quiz","Waiting 24 hours","Sharing on social media"], correct:1}
        ]
      }
    ]
  }
];

// Future integration points (documented, not implemented):
// - AI Mentor: a future chat-style helper could reference MODULES/lessons
//   by id to answer "explain this lesson again" style questions.
// - Certificates: a future feature could generate a completion certificate
//   once all non-comingSoon lessons in a module are marked complete in
//   useAcademyProgress - no fake certificate logic exists yet.
// - Paper Trading integration: lessons could deep-link into the existing
//   PaperTrading screen for hands-on practice once a lesson explains a
//   concept - no such linking exists yet, this is a placement note only.
