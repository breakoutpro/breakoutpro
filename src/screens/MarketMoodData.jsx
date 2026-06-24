// BreakoutPro - MarketMoodData.jsx
// Data + time-aware logic for the 30-second Market Mood feature.
// Rules: no backtick, no triple-equals, ASCII only.

// Session phase based on IST hour. Drives the headline wording.
export function getPhase(){
  var now=new Date();
  var utc=now.getTime()+now.getTimezoneOffset()*60000;
  var ist=new Date(utc+3600000*5.5);
  var h=ist.getHours(), m=ist.getMinutes();
  var mins=h*60+m;
  var day=ist.getDay();
  if(day==0||day==6) return {id:"weekend",label:"Weekend",sub:"Markets closed",dot:"#5B6472"};
  if(mins<540) return {id:"premarket",label:"Pre-Market",sub:"Get ready before the open",dot:"#F59E0B"};
  if(mins<555) return {id:"preopen",label:"Pre-Open",sub:"Pre-open session live",dot:"#F59E0B"};
  if(mins<930) return {id:"live",label:"Market Live",sub:"NSE and BSE are open",dot:"#22C55E"};
  return {id:"closed",label:"Market Closed",sub:"See you tomorrow at 9:15 AM",dot:"#EF4444"};
}

// Overnight global cues - what happened last night.
export var OVERNIGHT = [
  {name:"Dow Jones",   val:"38,654",  chg:"+0.82%", up:true},
  {name:"Nasdaq",      val:"16,234",  chg:"+1.24%", up:true},
  {name:"GIFT Nifty",  val:"23,910",  chg:"+0.36%", up:true},
  {name:"Crude Oil",   val:"82.34",   chg:"+1.23%", up:true},
  {name:"USD INR",     val:"83.42",   chg:"-0.08%", up:false},
  {name:"Gold",        val:"71,240",  chg:"+0.45%", up:true},
];

// Key levels for the day.
export var LEVELS = [
  {name:"NIFTY",    ltp:"23,824", r2:"24,010", r1:"23,920", piv:"23,780", s1:"23,690", s2:"23,560"},
  {name:"BANKNIFTY",ltp:"51,240", r2:"51,800", r1:"51,520", piv:"51,100", s1:"50,820", s2:"50,500"},
];

// Top stocks to watch today.
export var WATCH = [
  {sym:"RVNL",     setup:"Breakout watch",  note:"Near 52W high, volume rising", up:true},
  {sym:"SHRIRAMFIN",setup:"Bullish Engulfing",note:"Reversal at support zone",   up:true},
  {sym:"WIPRO",    setup:"Bearish setup",   note:"Below VWAP, weak momentum",    up:false},
  {sym:"TATASTEEL",setup:"Cup and Handle",  note:"Breakout above 990 likely",    up:true},
];

// Compute an overall mood from overnight cues.
export function computeMood(){
  var ups=0,i;
  for(i=0;i<OVERNIGHT.length;i++){ if(OVERNIGHT[i].up) ups=ups+1; }
  var ratio=ups/OVERNIGHT.length;
  if(ratio>=0.66) return {label:"Bullish",color:"#22C55E",score:Math.round(ratio*100),gapText:"Gap-up opening likely"};
  if(ratio<=0.34) return {label:"Bearish",color:"#EF4444",score:Math.round(ratio*100),gapText:"Gap-down opening likely"};
  return {label:"Neutral",color:"#F59E0B",score:Math.round(ratio*100),gapText:"Flat to range-bound open"};
}

// One-line AI style verdict for the hero card and notification.
export function getVerdict(){
  var mood=computeMood();
  var phase=getPhase();
  var nifty=LEVELS[0];
  if(mood.label=="Bullish"){
    return "Global cues positive. "+mood.gapText+". Watch NIFTY above "+nifty.piv+" for upside toward "+nifty.r1+".";
  }
  if(mood.label=="Bearish"){
    return "Global cues weak. "+mood.gapText+". NIFTY may test "+nifty.s1+" if "+nifty.piv+" breaks.";
  }
  return "Mixed global cues. "+mood.gapText+". NIFTY range "+nifty.s1+" to "+nifty.r1+" today.";
}

// Short notification-style greeting line.
export function getGreetingLine(){
  var mood=computeMood();
  var n=0,i;
  for(i=0;i<WATCH.length;i++){ if(WATCH[i].up) n=n+1; }
  return mood.gapText+"  &#8226;  "+n+" stocks near breakout";
}
