// BreakoutPro - BookLibraryData.jsx
// Trading Books Library catalog. Every summary below is written fresh in
// this app's own words as a general characterization of each book's
// well-known topic and approach - no book text, jacket copy, or review
// text is copied or reproduced anywhere in this file.
// Rules: no backtick, no triple-equals, ASCII only.

export var BOOK_CATEGORIES = [
  {
    id:"beginner", title:"Beginner Books", icon:"\u{1F31F}", color:"#3B82F6",
    books:[
      {
        id:"b_onestreet", title:"One Up On Wall Street", author:"Peter Lynch",
        summary:"A widely-read introduction to thinking like a long-term investor, built around the idea that ordinary observation of everyday businesses and products can be a starting point for research, alongside real homework on a company's fundamentals.",
        whyRead:"A gentle, story-driven entry point for beginners who want to understand investing logic before touching charts or technicals.",
        difficulty:"Beginner", readTime:"6-8 hours"
      }
    ]
  },
  {
    id:"priceaction_books", title:"Price Action", icon:"\u{1F4CA}", color:"#F59E0B",
    books:[
      {
        id:"b_albrooks", title:"Trading Price Action Trends", author:"Al Brooks",
        summary:"A dense, detailed exploration of reading raw candle-by-candle price behavior to describe trends, pullbacks, and reversals, without relying primarily on indicators.",
        whyRead:"Useful after finishing this app's own Price Action University modules, for readers who want a much deeper, more technical treatment of the same core ideas.",
        difficulty:"Advanced", readTime:"10-14 hours"
      }
    ]
  },
  {
    id:"candlestick_books", title:"Candlestick", icon:"\u{1F56F}", color:"#22C55E",
    books:[
      {
        id:"b_nison", title:"Japanese Candlestick Charting Techniques", author:"Steve Nison",
        summary:"Widely credited with introducing Japanese candlestick charting to Western readers, this book catalogs classic candle formations and the historical reasoning behind reading them.",
        whyRead:"A natural next step after this app's Candlestick School module, for readers who want the original historical framing behind common candle patterns.",
        difficulty:"Beginner", readTime:"5-7 hours"
      }
    ]
  },
  {
    id:"riskmgmt_books", title:"Risk Management", icon:"\u{1F6E1}", color:"#EF4444",
    books:[
      {
        id:"b_tharp", title:"Trade Your Way to Financial Freedom", author:"Van K. Tharp",
        summary:"Centers on the idea that position sizing and risk control matter at least as much as picking the right trade, and works through a systematic way of thinking about expectancy and risk per trade.",
        whyRead:"Reinforces this app's own Risk Management module with a full-length, systems-based treatment of the same principle.",
        difficulty:"Intermediate", readTime:"8-10 hours"
      }
    ]
  },
  {
    id:"psychology_books", title:"Trading Psychology", icon:"\u{1F9E0}", color:"#8B5CF6",
    books:[
      {
        id:"b_douglas", title:"Trading in the Zone", author:"Mark Douglas",
        summary:"Focuses on the mental and emotional discipline required to follow a trading plan consistently, exploring why probabilistic thinking is difficult for most people and how that difficulty shows up in real decisions.",
        whyRead:"A deep companion to this app's Trading Psychology module, especially for readers who recognize fear/greed patterns in their own decisions.",
        difficulty:"Intermediate", readTime:"7-9 hours"
      }
    ]
  },
  {
    id:"options_books", title:"Options Basics", icon:"\u{1F3AF}", color:"#06B6D4",
    books:[
      {
        id:"b_mcmillan", title:"Options as a Strategic Investment", author:"Lawrence G. McMillan",
        summary:"A comprehensive, reference-style guide covering a very wide range of options strategies and their risk/reward characteristics in detail.",
        whyRead:"Best approached after this app's own Options Basics module, as a much deeper reference once the core vocabulary (calls, puts, strike, premium) feels comfortable.",
        difficulty:"Advanced", readTime:"12-16 hours"
      }
    ]
  },
  {
    id:"futures_books", title:"Futures Basics", icon:"\u{1F4C9}", color:"#EC4899",
    books:[
      {
        id:"b_schwager", title:"A Complete Guide to the Futures Market", author:"Jack D. Schwager",
        summary:"Covers futures and options fundamentals alongside a broad survey of technical and fundamental analysis approaches used by futures traders.",
        whyRead:"Extends this app's Futures Basics module with a much fuller treatment of contract mechanics and analysis approaches.",
        difficulty:"Intermediate", readTime:"10-12 hours"
      }
    ]
  },
  {
    id:"ta_books", title:"Technical Analysis", icon:"\u{1F4D6}", color:"#D4AF37",
    books:[
      {
        id:"b_murphy", title:"Technical Analysis of the Financial Markets", author:"John J. Murphy",
        summary:"A broad, often-cited survey of technical analysis tools - chart patterns, indicators, and multiple-timeframe analysis - presented as a general reference rather than a single strategy.",
        whyRead:"A solid, comprehensive reference once the app's own Price Action and Candlestick modules feel familiar, for readers who want one book covering many tools at once.",
        difficulty:"Intermediate", readTime:"10-14 hours"
      }
    ]
  }
];
