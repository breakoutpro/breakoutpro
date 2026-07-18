// BreakoutPro - VoiceData.jsx
// Multi-language voice alert phrases + real NSE signal feed.
// Rules: no backticks, no triple-equals, ASCII only (Unicode escapes for native scripts).

export var LANGS = [
  {id:"en", label:"English",  code:"en-IN", native:"English"},
  {id:"te", label:"Telugu",   code:"te-IN", native:"\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41"},
  {id:"hi", label:"Hindi",    code:"hi-IN", native:"\u0939\u093f\u0902\u0926\u0940"},
  {id:"gu", label:"Gujarati", code:"gu-IN", native:"\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0"},
  {id:"mr", label:"Marathi",  code:"mr-IN", native:"\u092e\u0930\u093e\u0920\u0940"},
];

// Build a spoken phrase. sig = {sym, kind, info, tf, time}
// tf = timeframe like "5 minute", "15 minute", "1 hour"
// time = formation time like "10:42 AM"
// Format: "Reliance. 5 minute Doji formed at 10:42 AM."
export function buildPhrase(lang, sig){
  var sym=sig.sym, info=sig.info, tf=sig.tf||"", tm=sig.time?(" at "+sig.time):"";
  if(lang=="te"){
    if(sig.kind=="candle")   return sym+". "+tf+" "+info+tm+" ninda ratthu";
    if(sig.kind=="breakout") return sym+". "+tf+" breakout"+tm;
    if(sig.kind=="volume")   return sym+". volume penchindi"+tm;
    return sym+". "+info+tm;
  }
  if(lang=="hi"){
    if(sig.kind=="candle")   return sym+". "+tf+" "+info+tm+" bana";
    if(sig.kind=="breakout") return sym+". "+tf+" breakout"+tm;
    if(sig.kind=="volume")   return sym+". volume badha"+tm;
    return sym+". "+info+tm;
  }
  if(lang=="gu"){
    if(sig.kind=="candle")   return sym+". "+tf+" "+info+tm+" banyu";
    if(sig.kind=="breakout") return sym+". "+tf+" breakout"+tm;
    if(sig.kind=="volume")   return sym+". volume vadhyu"+tm;
    return sym+". "+info+tm;
  }
  if(lang=="mr"){
    if(sig.kind=="candle")   return sym+". "+tf+" "+info+tm+" zala";
    if(sig.kind=="breakout") return sym+". "+tf+" breakout"+tm;
    if(sig.kind=="volume")   return sym+". volume vadhla"+tm;
    return sym+". "+info+tm;
  }
  // English default: "Reliance. 5 minute Doji formed at 10:42 AM."
  if(sig.kind=="candle")   return sym+". "+tf+" "+info+" formed"+tm+".";
  if(sig.kind=="breakout") return sym+". "+tf+" "+(info||"Breakout")+" observed"+tm+".";
  if(sig.kind=="volume")   return sym+". Volume spike observed"+tm+".";
  if(sig.kind=="level")    return sym+". "+info+" observed"+tm+".";
  if(sig.kind=="trend")    return sym+". "+info+" observed"+tm+".";
  return sym+". "+info+" observed"+tm+".";
}

// Real NSE stocks - demo signal stream cycles to simulate live detection.
export var SIGNAL_FEED = [
  {sym:"RVNL",      kind:"candle",   info:"Doji",              tf:"5 minute"},
  {sym:"NIFTY",     kind:"breakout", info:"Breakout",          tf:"15 minute"},
  {sym:"IRFC",      kind:"candle",   info:"Bullish Engulfing", tf:"15 minute"},
  {sym:"TATASTEEL", kind:"volume",   info:"Volume Spike",      tf:"5 minute"},
  {sym:"SBIN",      kind:"candle",   info:"Morning Star",      tf:"1 hour"},
  {sym:"BANKNIFTY", kind:"breakout", info:"Breakout",          tf:"5 minute"},
  {sym:"WIPRO",     kind:"candle",   info:"Bearish Engulfing", tf:"15 minute"},
  {sym:"ADANIENT",  kind:"volume",   info:"Volume Spike",      tf:"5 minute"},
  {sym:"RELIANCE",  kind:"candle",   info:"Hammer",            tf:"1 hour"},
  {sym:"PFC",       kind:"breakout", info:"Breakout",          tf:"15 minute"},
];
