// BreakoutPro - MarketMoodData.jsx
// All data + logic for the premium Today's Game Plan screen.
// Rules: no backtick, no triple-equals, ASCII only.

// Theme tokens shared across mood parts.
export var MT = {
  BG:"#050505", CARD:"#0A0F1A", CARD2:"#101827", BD:"#1E293B",
  T1:"#FFFFFF", T2:"#9CA3AF", BLUE:"#3B82F6",
  GREEN:"#22C55E", DGREEN:"#15803D", RED:"#EF4444", DRED:"#7F1D1D",
  YELLOW:"#F59E0B", DIV:"#1F2937"
};

// Session phase based on IST hour.
export function getPhase(){
  var now=new Date();
  var utc=now.getTime()+now.getTimezoneOffset()*60000;
  var ist=new Date(utc+3600000*5.5);
  var mins=ist.getHours()*60+ist.getMinutes();
  var day=ist.getDay();
  if(day==0||day==6) return {id:"weekend",label:"Weekend",sub:"Markets closed",dot:"#9CA3AF"};
  if(mins<540) return {id:"premarket",label:"Pre-Market",sub:"Get ready before the open",dot:"#F59E0B"};
  if(mins<555) return {id:"preopen",label:"Pre-Open",sub:"Pre-open session live",dot:"#F59E0B"};
  if(mins<930) return {id:"live",label:"Market Live",sub:"NSE and BSE are open",dot:"#22C55E"};
  return {id:"closed",label:"Market Closed",sub:"See you tomorrow at 9:15 AM",dot:"#EF4444"};
}

export var OVERNIGHT = [
  {name:"Dow Jones",  val:"38,654", chg:"+0.82%", up:true},
  {name:"Nasdaq",     val:"16,234", chg:"+1.24%", up:true},
  {name:"GIFT Nifty", val:"23,910", chg:"+0.36%", up:true},
  {name:"Crude Oil",  val:"82.34",  chg:"+1.23%", up:true},
  {name:"Dollar Index",val:"104.2", chg:"-0.18%", up:false},
];

export var LEVELS = [
  {name:"NIFTY",    ltp:"23,824", r2:"24,010", r1:"23,920", piv:"23,780", s1:"23,690", s2:"23,560"},
  {name:"BANKNIFTY",ltp:"51,240", r2:"51,800", r1:"51,520", piv:"51,100", s1:"50,820", s2:"50,500"},
  {name:"SENSEX",   ltp:"76,688", r2:"77,200", r1:"76,950", piv:"76,400", s1:"76,100", s2:"75,700"},
];

export var NEWS_POS = [
  {sym:"RELIANCE", note:"Crude prices softened overnight"},
  {sym:"TCS",      note:"Nasdaq strength positive for IT"},
  {sym:"HDFCBANK", note:"FII inflows remain strong"},
];

export var NEWS_NEG = [
  {sym:"TATASTEEL", note:"Weak China sentiment"},
  {sym:"BPCL",      note:"Crude oil rise negative"},
  {sym:"INDUSINDBK",note:"RBI concerns weigh"},
];

export var SECTORS = [
  {name:"IT",      mood:"bull"},
  {name:"BANKING", mood:"bull"},
  {name:"PHARMA",  mood:"neutral"},
  {name:"AUTO",    mood:"bull"},
  {name:"METAL",   mood:"bear"},
  {name:"FMCG",    mood:"neutral"},
];

export var WATCH = [
  {sym:"RELIANCE", setup:"Bullish", note:"Near breakout above 2,860", up:true},
  {sym:"HDFCBANK", setup:"Neutral", note:"Coiling near resistance",   up:true},
  {sym:"TCS",      setup:"Bullish", note:"IT strength, volume rising", up:true},
];

export var PLAN = [
  {cond:"Above 23,920", act:"Bullish continuation", color:"#22C55E"},
  {cond:"Below 23,780", act:"Weakness possible",    color:"#EF4444"},
  {cond:"Sideways",     act:"Range-bound market",   color:"#F59E0B"},
];

export var METRICS = [
  {label:"Mood",  val:"Bullish", color:"#15803D"},
  {label:"F&G",   val:"78",      color:"#15803D"},
  {label:"FII",   val:"Net Buy", color:"#15803D"},
  {label:"Trend", val:"Up",      color:"#15803D"},
  {label:"Conf",  val:"86%",     color:"#3B82F6"},
];

export function computeMood(){
  var ups=0,i;
  for(i=0;i<OVERNIGHT.length;i++){ if(OVERNIGHT[i].up) ups=ups+1; }
  var ratio=ups/OVERNIGHT.length;
  var score=Math.round(60+ratio*35);
  if(ratio>=0.6) return {label:"Bullish",color:MT.GREEN,score:score,gapText:"Gap-up opening likely"};
  if(ratio<=0.4) return {label:"Bearish",color:MT.RED,score:Math.round(100-score),gapText:"Gap-down opening likely"};
  return {label:"Neutral",color:MT.YELLOW,score:score,gapText:"Flat to range-bound open"};
}

export function getVerdict(){
  var mood=computeMood();
  var n=LEVELS[0];
  if(mood.label=="Bullish") return "Global cues positive. Gap-up opening likely. Watch NIFTY above "+n.piv+" for upside towards "+n.r1+".";
  if(mood.label=="Bearish") return "Global cues weak. Gap-down likely. NIFTY may test "+n.s1+" if "+n.piv+" breaks.";
  return "Mixed global cues. Flat open likely. NIFTY range "+n.s1+" to "+n.r1+" today.";
}

export function getGreetingLine(){
  var mood=computeMood();
  return mood.gapText+"  &#8226;  "+WATCH.length+" stocks near breakout";
}

// Build the 30-second voice summary text.
export function getVoiceSummary(){
  var mood=computeMood();
  var n=LEVELS[0];
  var parts=[];
  parts.push(mood.label=="Bullish"?"Global markets were positive overnight.":mood.label=="Bearish"?"Global markets were weak overnight.":"Global markets were mixed overnight.");
  parts.push("GIFT Nifty indicates a "+(mood.label=="Bearish"?"gap-down":"gap-up")+" opening.");
  parts.push("FII flows remain strong.");
  parts.push("IT and Banking sectors are showing strength.");
  parts.push("Watch Nifty above "+n.r1+".");
  parts.push("Reliance, HDFC Bank and TCS are near breakout.");
  return parts.join(" ");
}
