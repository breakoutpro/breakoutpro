// BreakoutPro - MarketsTopData.jsx
// Data for the Markets page intelligence header: indices, mood, FII/DII, global.
// Rules: no backtick, no triple-equals, ASCII only.

export var TAGLINE = {
  main:"Advanced Market Intelligence",
  sub:"Analyze Smarter  &#8226;  Increase Returns  &#8226;  Protect Capital"
};

export var INDEX_CARDS = [
  {name:"NIFTY 50",   val:"23,961.42", chg:"+1.47%", up:true},
  {name:"SENSEX",     val:"76,688.63", chg:"+1.54%", up:true},
  {name:"BANK NIFTY", val:"52,224.40", chg:"+1.69%", up:true},
  {name:"INDIA VIX",  val:"13.42",     chg:"-3.20%", up:false},
];

export var MOOD = {
  label:"Bullish", score:74, fg:78, fgLabel:"Greed"
};

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
