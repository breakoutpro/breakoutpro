// BreakoutPro - MarketsTopData.jsx
// Data for Markets intelligence header + index/VIX/FII-DII detail pages.
// Rules: no backtick, no triple-equals, ASCII only.

export var TAGLINE = {
  main:"Advanced Market Intelligence",
  sub:"Analyze Smarter  &#8226;  Increase Returns  &#8226;  Protect Capital"
};

export var INDEX_STRIP = [
  {key:"NIFTY",   name:"NIFTY 50",   val:"23,961.42", chg:"+1.47%", up:true},
  {key:"SENSEX",  name:"SENSEX",     val:"76,688.63", chg:"+1.54%", up:true},
  {key:"BANKNIFTY",name:"BANK NIFTY",val:"52,224.40", chg:"+1.69%", up:true},
  {key:"GIFT",    name:"GIFT NIFTY", val:"23,910.00", chg:"+0.36%", up:true},
  {key:"VIX",     name:"INDIA VIX",  val:"13.42",     chg:"-3.20%", up:false},
];

export var MOOD = { label:"Bullish", score:74, fg:78, fgLabel:"Greed" };

export var FIIDII = [
  {name:"FII",  val:"+2,340", up:true,  note:"Cash market (Cr)"},
  {name:"DII",  val:"-890",   up:false, note:"Cash market (Cr)"},
  {name:"FII F&O", val:"+1,120", up:true, note:"Index futures (Cr)"},
];

export var GLOBAL = [
  {name:"Dow Jones", val:"38,654", chg:"+0.82%", up:true},
  {name:"Nasdaq",    val:"16,234", chg:"+1.24%", up:true},
  {name:"S&P 500",   val:"5,123",  chg:"+0.94%", up:true},
  {name:"Nikkei",    val:"38,156", chg:"-0.34%", up:false},
  {name:"Hang Seng", val:"17,823", chg:"-0.87%", up:false},
  {name:"GIFT Nifty",val:"23,910", chg:"+0.36%", up:true},
  {name:"Gold",      val:"71,240", chg:"+0.45%", up:true},
  {name:"Silver",    val:"89,500", chg:"-0.32%", up:false},
  {name:"Crude Oil", val:"6,820",  chg:"+1.23%", up:true},
  {name:"Dollar Idx",val:"104.23", chg:"-0.18%", up:false},
];

// Index detail: what it is + top constituent stocks.
export var INDEX_DETAIL = {
  NIFTY:{
    title:"NIFTY 50", val:"23,961.42", chg:"+1.47%", up:true,
    about:"NIFTY 50 is the benchmark index of NSE, made of India's 50 largest and most liquid companies across 13 sectors. It is the most tracked indicator of the Indian stock market.",
    stocks:[
      {sym:"RELIANCE",w:"9.8%",chg:"+1.71%",up:true},
      {sym:"HDFCBANK",w:"8.4%",chg:"+1.90%",up:true},
      {sym:"ICICIBANK",w:"7.2%",chg:"+2.33%",up:true},
      {sym:"INFY",w:"5.6%",chg:"-1.40%",up:false},
      {sym:"TCS",w:"4.1%",chg:"-0.97%",up:false},
      {sym:"BHARTIARTL",w:"3.4%",chg:"+0.82%",up:true},
      {sym:"SBIN",w:"3.0%",chg:"+2.18%",up:true},
      {sym:"LT",w:"2.8%",chg:"-0.95%",up:false}
    ]
  },
  SENSEX:{
    title:"SENSEX", val:"76,688.63", chg:"+1.54%", up:true,
    about:"SENSEX (S&P BSE SENSEX) is the benchmark index of BSE, tracking 30 large, well established and financially sound companies. It is India's oldest stock index, started in 1986.",
    stocks:[
      {sym:"RELIANCE",w:"11.2%",chg:"+1.71%",up:true},
      {sym:"HDFCBANK",w:"9.6%",chg:"+1.90%",up:true},
      {sym:"ICICIBANK",w:"8.1%",chg:"+2.33%",up:true},
      {sym:"INFY",w:"6.2%",chg:"-1.40%",up:false},
      {sym:"TCS",w:"4.6%",chg:"-0.97%",up:false},
      {sym:"ITC",w:"3.8%",chg:"+0.34%",up:true}
    ]
  },
  BANKNIFTY:{
    title:"BANK NIFTY", val:"52,224.40", chg:"+1.69%", up:true,
    about:"BANK NIFTY tracks the 12 most liquid and large banking stocks on NSE. It is the most actively traded index for options and reflects the health of India's banking sector.",
    stocks:[
      {sym:"HDFCBANK",w:"28.2%",chg:"+1.90%",up:true},
      {sym:"ICICIBANK",w:"24.1%",chg:"+2.33%",up:true},
      {sym:"SBIN",w:"10.4%",chg:"+2.18%",up:true},
      {sym:"AXISBANK",w:"9.6%",chg:"+1.47%",up:true},
      {sym:"KOTAKBANK",w:"8.8%",chg:"+1.12%",up:true},
      {sym:"PNB",w:"2.1%",chg:"-0.54%",up:false}
    ]
  },
  GIFT:{
    title:"GIFT NIFTY", val:"23,910.00", chg:"+0.36%", up:true,
    about:"GIFT NIFTY (formerly SGX Nifty) trades at GIFT City, Gujarat. It runs nearly 21 hours a day and gives an early signal of how NIFTY may open, based on global cues before Indian market hours.",
    stocks:[]
  }
};

// India VIX education page data.
export var VIX_DETAIL = {
  val:"13.42", chg:"-3.20%", up:false,
  what:"India VIX is the volatility index. It measures how much movement (fear) traders expect in NIFTY over the next 30 days. It is calculated from NIFTY option prices.",
  reading:[
    {range:"Below 12", mean:"Very calm market. Low fear. Often complacency.", tone:"calm"},
    {range:"12 to 16", mean:"Normal, healthy market conditions.", tone:"normal"},
    {range:"16 to 20", mean:"Rising caution. Bigger swings expected.", tone:"warn"},
    {range:"Above 20", mean:"High fear. Sharp moves, often during crashes.", tone:"high"}
  ],
  howto:[
    "When VIX is LOW and rising, market may be near a top (complacency).",
    "When VIX spikes very HIGH, it often marks panic bottoms (reversal zones).",
    "Option sellers prefer falling VIX (IV crush). Option buyers prefer rising VIX.",
    "Check VIX every morning before trading to judge expected day volatility."
  ],
  history:[
    {date:"Mar 2020", val:"86.6", note:"COVID crash peak fear"},
    {date:"Jun 2022", val:"24.6", note:"Rate hike correction"},
    {date:"Jun 2024", val:"31.7", note:"Election result day spike"},
    {date:"Today",   val:"13.42", note:"Calm, normal range"}
  ]
};

// FII / DII full activity: where they bought / sold.
export var FLOW_DETAIL = {
  fii:{
    net:"+2,340", up:true,
    bought:[
      {sym:"HDFCBANK",val:"+820 Cr"},
      {sym:"RELIANCE",val:"+640 Cr"},
      {sym:"ICICIBANK",val:"+510 Cr"},
      {sym:"LT",val:"+370 Cr"}
    ],
    sold:[
      {sym:"INFY",val:"-410 Cr"},
      {sym:"TCS",val:"-290 Cr"},
      {sym:"WIPRO",val:"-180 Cr"}
    ]
  },
  dii:{
    net:"-890", up:false,
    bought:[
      {sym:"SBIN",val:"+340 Cr"},
      {sym:"ITC",val:"+220 Cr"},
      {sym:"NTPC",val:"+160 Cr"}
    ],
    sold:[
      {sym:"HDFCBANK",val:"-520 Cr"},
      {sym:"RELIANCE",val:"-410 Cr"},
      {sym:"BHARTIARTL",val:"-260 Cr"}
    ]
  },
  sectorRotation:[
    {sector:"Banking",flow:"Inflow",up:true},
    {sector:"IT",flow:"Outflow",up:false},
    {sector:"Energy",flow:"Inflow",up:true},
    {sector:"FMCG",flow:"Outflow",up:false},
    {sector:"Auto",flow:"Inflow",up:true}
  ]
};
