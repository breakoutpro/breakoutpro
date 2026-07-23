var BG="#07111F",CARD="#101B2E",BD="#1E3A5F",BLUE="#3B82F6",BLUE2="#60A5FA",UP="#22C55E",DOWN="#EF4444",T1="#FFFFFF",T2="#94A3B8",T3="#475569";

var EQ=[
  {sym:"NIFTY 50",  ltp:23969, base:23969, sect:"Index"},
  {sym:"SENSEX",    ltp:76692, base:76692, sect:"Index"},
  {sym:"BANKNIFTY", ltp:52134, base:52134, sect:"Index"},
  {sym:"FINNIFTY",  ltp:23410, base:23410, sect:"Index"},
  {sym:"MIDCAP",    ltp:43876, base:43876, sect:"Index"},
  {sym:"INDIA VIX", ltp:13.4,  base:13.4,  sect:"VIX"},
  {sym:"RELIANCE",  ltp:2845,  base:2845,  sect:"Energy"},
  {sym:"TCS",       ltp:3920,  base:3920,  sect:"IT"},
  {sym:"HDFCBANK",  ltp:1876,  base:1876,  sect:"Banking"},
  {sym:"ICICIBANK", ltp:1243,  base:1243,  sect:"Banking"},
  {sym:"INFY",      ltp:1876,  base:1876,  sect:"IT"},
  {sym:"SBIN",      ltp:832,   base:832,   sect:"Banking"},
  {sym:"TATAMOTORS",ltp:987,   base:987,   sect:"Auto"},
  {sym:"WIPRO",     ltp:543,   base:543,   sect:"IT"},
  {sym:"NF 24000CE",ltp:180,   base:180,   sect:"Options"},
  {sym:"NF 24000PE",ltp:120,   base:120,   sect:"Options"},
  {sym:"BNF 52500CE",ltp:210,  base:210,   sect:"Options"},
  {sym:"BNF 52000PE",ltp:190,  base:190,   sect:"Options"},
];
var CM=[
  {sym:"GOLD",      ltp:71245, base:71245, sect:"MCX"},
  {sym:"SILVER",    ltp:87654, base:87654, sect:"MCX"},
  {sym:"CRUDEOIL",  ltp:6823,  base:6823,  sect:"MCX"},
  {sym:"USDINR",    ltp:83.42, base:83.42, sect:"Forex"},
];

// Alert categories for the new Smart Alerts Hub
var ALERT_CATEGORIES=[
  {id:"price",    label:"Price Alerts",    icon:"&#128200;", types:[
    "Cross Above Price","Cross Below Price","% Move Alert",
    "Day High","Day Low","All Time High","All Time Low","52W High","52W Low",
  ]},
  {id:"candle",   label:"Candle Patterns", icon:"&#128197;", types:[
    "Doji","Hammer","Inverted Hammer","Shooting Star",
    "Bullish Engulfing","Bearish Engulfing","Morning Star","Evening Star",
    "Marubozu","Harami","Inside Bar","Outside Bar",
  ]},
  {id:"breakout", label:"Breakout Alerts", icon:"&#128293;", types:[
    "Resistance Breakout","Support Breakdown","Trendline Breakout",
    "Channel Breakout","Range Breakout","ATH Breakout","Gap Up","Gap Down",
  ]},
  {id:"technical",label:"Technical",       icon:"&#128202;", types:[
    "EMA Crossover","SMA Crossover","VWAP Cross",
    "RSI Overbought","RSI Oversold","MACD Bullish","MACD Bearish",
    "Supertrend Buy","Supertrend Sell","Bollinger Break","ADX Strong Trend",
  ]},
  {id:"volume",   label:"Volume Alerts",   icon:"&#9650;", types:[
    "Volume Spike","Delivery Spike","Unusual Volume","Price+Volume Breakout",
  ]},
  {id:"options",  label:"Options Alerts",  icon:"&#127919;", types:[
    "OI Spike","OI Change","PCR Change","Max Pain Shift",
    "IV Spike","Long Buildup","Short Buildup","Long Unwinding","Short Covering",
  ]},
  {id:"global",   label:"Global Alerts",   icon:"&#127757;", types:[
    "Dow Jones ±1%","Nasdaq ±1%","S&P500 Move",
    "Dollar Index Spike","Crude Oil Move","Gold Move","India VIX Spike",
  ]},
  {id:"news",     label:"News Alerts",     icon:"&#128240;", types:[
    "Breaking News","Earnings Results","Dividend","Bonus Issue",
    "Stock Split","Bulk Deals","Block Deals","Insider Trading","Management Commentary",
  ]},
  {id:"ai",       label:"AI Alerts",       icon:"&#129504;", types:[
    "AI Confidence >80%","Strong Trend","Sector Rotation",
    "Market Mood Change","Fear & Greed Extreme","Smart Money Flow",
  ]},
];

var TIMEFRAMES=[
  {id:"1m",label:"1 Min"},
  {id:"3m",label:"3 Min"},
  {id:"5m",label:"5 Min"},
  {id:"15m",label:"15 Min"},
  {id:"30m",label:"30 Min"},
  {id:"1h",label:"1 Hr"},
  {id:"1d",label:"Daily"},
  {id:"1w",label:"Weekly"},
];

var VOICE_MODES=[
  {id:"silent",  label:"Silent",       icon:"&#128263;"},
  {id:"bell",    label:"Bell Sound",   icon:"&#128276;"},
  {id:"female",  label:"Female Voice", icon:"&#128105;"},
  {id:"male",    label:"Male Voice",   icon:"&#128104;"},
  {id:"telugu",  label:"Telugu Voice", icon:"&#127470;&#127475;"},
  {id:"english", label:"English Voice",icon:"&#127468;&#127463;"},
];

var PATTERNS=[
  {id:"doji",      name:"Doji",                type:"bearish",icon:"DJ"},
  {id:"hammer",    name:"Hammer",              type:"bullish",icon:"HM"},
  {id:"invHammer", name:"Inverted Hammer",     type:"bullish",icon:"IH"},
  {id:"shootStar", name:"Shooting Star",       type:"bearish",icon:"SS"},
  {id:"bullEng",   name:"Bullish Engulfing",   type:"bullish",icon:"BE"},
  {id:"bearEng",   name:"Bearish Engulfing",   type:"bearish",icon:"SE"},
  {id:"morning",   name:"Morning Star",        type:"bullish",icon:"MS"},
  {id:"evening",   name:"Evening Star",        type:"bearish",icon:"ES"},
  {id:"marubozu",  name:"Marubozu",            type:"bullish",icon:"MB"},
  {id:"harami",    name:"Harami",              type:"neutral",icon:"HR"},
  {id:"insideBar", name:"Inside Bar",          type:"neutral",icon:"IB"},
  {id:"outsideBar",name:"Outside Bar",         type:"neutral",icon:"OB"},
];

var BREAKOUTS=[
  {id:"resBreak",name:"Resistance Breakout",type:"bullish"},
  {id:"supBreak",name:"Support Breakdown",  type:"bearish"},
  {id:"trendLine",name:"Trendline Breakout",type:"bullish"},
  {id:"channel", name:"Channel Breakout",   type:"bullish"},
  {id:"range",   name:"Range Breakout",     type:"bullish"},
  {id:"athBreak",name:"ATH Breakout",       type:"bullish"},
  {id:"gapUp",   name:"Gap Up",             type:"bullish"},
  {id:"gapDown", name:"Gap Down",           type:"bearish"},
];

var OI_TYPES=[
  {id:"oiSpike",  name:"OI Spike",       type:"neutral"},
  {id:"callWrite",name:"Heavy Call Writing",type:"bearish"},
  {id:"putWrite", name:"Heavy Put Writing", type:"bullish"},
  {id:"longBuild",name:"Long Buildup",    type:"bullish"},
  {id:"shortCov", name:"Short Covering",  type:"bullish"},
  {id:"shortBuild",name:"Short Buildup",  type:"bearish"},
  {id:"maxPain",  name:"Max Pain Shift",  type:"neutral"},
  {id:"ivSpike",  name:"IV Spike",        type:"neutral"},
  {id:"longUnwind",name:"Long Unwinding", type:"bearish"},
];

var SECTORS=[
  {name:"IT",     status:"Strong",up:true},
  {name:"Banking",status:"Strong",up:true},
  {name:"Auto",   status:"Weak",  up:false},
  {name:"Metal",  status:"Rally", up:true},
  {name:"Pharma", status:"Strong",up:true},
  {name:"Realty", status:"Weak",  up:false},
];

function getSess(){
  var m=new Date().getHours()*60+new Date().getMinutes();
  if(m>=9*60+15&&m<15*60+30)return "equity";
  if(m>=15*60+30||m<2*60)return "commodity";
  return "global";
}

function genCandle(prev){
  var chg=(Math.random()-0.48)*prev.close*0.004;
  var o=prev.close,cl=parseFloat((o+chg).toFixed(2));
  var hi=parseFloat((Math.max(o,cl)+Math.random()*prev.close*0.002).toFixed(2));
  var lo=parseFloat((Math.min(o,cl)-Math.random()*prev.close*0.002).toFixed(2));
  return{open:o,close:cl,high:hi,low:lo,vol:Math.floor(50000+Math.random()*300000)};
}

function calcConfidence(){return Math.floor(65+Math.random()*30);}
function riskFromConf(c){return c>=80?"Low":c>=60?"Medium":"High";}

function buildVoiceText(al,lang,timeframe){
  var sym=al.sym,type=al.type;
  var tf=timeframe||"5m";
  var tfLabel={"1m":"1-minute","3m":"3-minute","5m":"5-minute","15m":"15-minute","30m":"30-minute","1h":"hourly","1d":"daily","1w":"weekly"}[tf]||"5-minute";

  if(lang=="telugu"){
    return "Attention. "+sym+" lo "+type+" vachindi.";
  }
  if(al.category=="candle"){
    return "Attention. "+sym+" formed a "+type+" pattern on the "+tfLabel+" chart.";
  }
  if(al.category=="breakout"){
    if(type=="Gap Up")return sym+" opened with a gap up today.";
    if(type=="Gap Down")return sym+" opened with a gap down today.";
    return sym+" "+type.toLowerCase()+" detected on the "+tfLabel+" chart.";
  }
  if(al.category=="volume"){
    return "Volume spike detected in "+sym+". Check the "+tfLabel+" chart.";
  }
  if(al.category=="price"){
    if(type.indexOf("All Time High")!=-1)return sym+" reached a new all-time high.";
    if(type.indexOf("52W High")!=-1)return sym+" hit a 52-week high.";
    if(type.indexOf("52W Low")!=-1)return sym+" hit a 52-week low.";
    return sym+" "+type.toLowerCase()+" alert triggered.";
  }
  if(al.category=="technical"){
    return sym+" "+type+" signal on the "+tfLabel+" chart.";
  }
  if(al.category=="options"){
    return "Options alert. "+sym+". "+type+" detected.";
  }
  if(al.category=="global"){
    return "Global markets alert. "+type+" detected.";
  }
  if(al.category=="news"){
    return "News alert for "+sym+". "+type+".";
  }
  if(al.category=="ai"){
    return "AI alert. "+sym+". "+type+".";
  }
  return "Attention. "+sym+". "+type+".";
}

function speakAlert(al,voiceMode,timeframe){
  if(!window.speechSynthesis||voiceMode=="silent"||voiceMode=="bell")return;
  var text=buildVoiceText(al,voiceMode=="telugu"?"telugu":"english",timeframe);
  window.speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(text);
  u.lang=voiceMode=="telugu"?"te-IN":"en-IN";
  u.rate=0.95;u.pitch=voiceMode=="male"?0.8:1.15;
  var voices=window.speechSynthesis.getVoices();
  if(voiceMode=="female"||voiceMode=="telugu"||voiceMode=="english"){
    var v=voices.find(function(v){return v.name.indexOf("Female")!=-1||v.name.indexOf("Samantha")!=-1||v.name.indexOf("Zira")!=-1;});
    if(v)u.voice=v;
  }
  window.speechSynthesis.speak(u);
}

function playSound(){
  try{
    var ctx=new(window.AudioContext||window.webkitAudioContext)();
    [880,1100,1320].forEach(function(f,i){
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.frequency.value=f;o.type="sine";
      g.gain.setValueAtTime(0,ctx.currentTime+i*0.12);
      g.gain.linearRampToValueAtTime(0.22,ctx.currentTime+i*0.12+0.05);
      g.gain.linearRampToValueAtTime(0,ctx.currentTime+i*0.12+0.2);
      o.start(ctx.currentTime+i*0.12);o.stop(ctx.currentTime+i*0.12+0.25);
    });
  }catch(e){}
}

function MiniSpark(props){
  var d=props.data||[],col=props.color||BLUE2,w=46,h=20;
  if(d.length<2)return null;
  var mn=Math.min.apply(null,d),mx=Math.max.apply(null,d),rng=mx-mn||1;
  var pts=d.map(function(v,i){return(i/(d.length-1))*w+","+(h-((v-mn)/rng)*(h-4)+2);}).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

function loadAlertSettings(){
  try{return JSON.parse(localStorage.getItem("bp_alert_settings")||"{}");}catch(e){return{};}
}

function saveAlertSettings(s){
  try{localStorage.setItem("bp_alert_settings",JSON.stringify(s));}catch(e){}
}

var CATS_POOL={
  price:["Day High","Day Low","Cross Above Price","52W High","% Move Alert","All Time High","Cross Below Price"],
  candle:PATTERNS.map(function(p){return p.name;}),
  breakout:BREAKOUTS.map(function(b){return b.name;}),
  technical:["EMA Crossover","RSI Overbought","RSI Oversold","MACD Bullish","Supertrend Buy","VWAP Cross","Bollinger Break","ADX Strong Trend"],
  volume:["Volume Spike","Unusual Volume","Price+Volume Breakout","Delivery Spike"],
  options:["OI Spike","Long Buildup","Short Covering","IV Spike","PCR Change","Max Pain Shift"],
  global:["India VIX Spike","Crude Oil Move","Dollar Index Spike","Dow Jones 1%","Nasdaq 1%"],
  news:["Breaking News","Earnings Results","Bulk Deals","Insider Trading","Management Commentary"],
  ai:["AI Confidence 80%","Strong Trend","Market Mood Change","Sector Rotation Alert"],
};

export { EQ, CM, PATTERNS, BREAKOUTS, OI_TYPES, SECTORS, ALERT_CATEGORIES, TIMEFRAMES, VOICE_MODES, CATS_POOL, getSess, genCandle, calcConfidence, riskFromConf, playSound, speakAlert, buildVoiceText, MiniSpark, loadAlertSettings, saveAlertSettings };
