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

// Build a spoken phrase. sig = {sym, kind, info, tf}
// tf = timeframe like "5 minute", "15 minute", "1 hour"
export function buildPhrase(lang, sig){
  var sym=sig.sym, info=sig.info, tf=sig.tf||"";
  if(lang=="te"){
    if(sig.kind=="candle")   return sym+" "+tf+" candle lo "+info+" vachindi";
    if(sig.kind=="breakout") return sym+" "+tf+" lo breakout vachindi";
    if(sig.kind=="volume")   return sym+" lo volume penchindi";
  }
  if(lang=="hi"){
    if(sig.kind=="candle")   return sym+" "+tf+" candle mein "+info+" bana";
    if(sig.kind=="breakout") return sym+" "+tf+" mein breakout hua";
    if(sig.kind=="volume")   return sym+" mein volume badha";
  }
  if(lang=="gu"){
    if(sig.kind=="candle")   return sym+" "+tf+" candle ma "+info+" banyu";
    if(sig.kind=="breakout") return sym+" "+tf+" ma breakout thayu";
    if(sig.kind=="volume")   return sym+" ma volume vadhyu";
  }
  if(lang=="mr"){
    if(sig.kind=="candle")   return sym+" "+tf+" candle madhe "+info+" zala";
    if(sig.kind=="breakout") return sym+" "+tf+" madhe breakout zala";
    if(sig.kind=="volume")   return sym+" madhe volume vadhla";
  }
  // English default
  if(sig.kind=="candle")   return sym+" "+tf+" candle "+info+" detected";
  if(sig.kind=="breakout") return sym+" "+tf+" breakout detected";
  if(sig.kind=="volume")   return sym+" volume spike detected";
  return sym+" alert";
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
