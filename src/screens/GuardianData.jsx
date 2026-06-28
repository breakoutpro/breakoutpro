// BreakoutPro - GuardianData.jsx
// AI Market Guardian: alert types + educational content + observation storage.
// Educational only. Terminology English. Rules: no backtick, no triple-equals, ASCII.

// All 33 alert types, grouped. ic = HTML entity glyph.
export var ALERT_TYPES = [
  {group:"Price Action", items:[
    {id:"breakout",name:"Breakout",ic:"&#128640;"},
    {id:"breakdown",name:"Breakdown",ic:"&#128201;"},
    {id:"gapup",name:"Gap Up",ic:"&#11014;"},
    {id:"gapdown",name:"Gap Down",ic:"&#11015;"}
  ]},
  {group:"Levels", items:[
    {id:"supporttouch",name:"Support Touch",ic:"&#128072;"},
    {id:"resistancetouch",name:"Resistance Touch",ic:"&#128073;"},
    {id:"supportbreak",name:"Support Break",ic:"&#128317;"},
    {id:"resistancebreak",name:"Resistance Break",ic:"&#128316;"},
    {id:"high52",name:"52 Week High",ic:"&#127942;"},
    {id:"low52",name:"52 Week Low",ic:"&#9888;"},
    {id:"ath",name:"All Time High",ic:"&#127881;"},
    {id:"atl",name:"All Time Low",ic:"&#128293;"}
  ]},
  {group:"Volume", items:[
    {id:"volspike",name:"Volume Spike",ic:"&#128202;"},
    {id:"deliveryspike",name:"Delivery Spike",ic:"&#128230;"},
    {id:"vwapbreak",name:"VWAP Break",ic:"&#10134;"}
  ]},
  {group:"Indicators", items:[
    {id:"emacross",name:"EMA Crossovers",ic:"&#10005;"},
    {id:"rsi",name:"RSI Signals",ic:"&#128316;"},
    {id:"macd",name:"MACD Crossovers",ic:"&#12349;"},
    {id:"supertrend",name:"Supertrend Changes",ic:"&#128260;"},
    {id:"candle",name:"Candlestick Patterns",ic:"&#128367;"}
  ]},
  {group:"Options", items:[
    {id:"chainchange",name:"Option Chain Changes",ic:"&#128279;"},
    {id:"oichange",name:"OI Changes",ic:"&#128200;"},
    {id:"pcr",name:"PCR Changes",ic:"&#9878;"},
    {id:"maxpain",name:"Max Pain Shift",ic:"&#127919;"},
    {id:"gammaflip",name:"Gamma Flip",ic:"&#128259;"},
    {id:"gammablast",name:"Gamma Blast",ic:"&#9889;"},
    {id:"ivspike",name:"IV Spike",ic:"&#128200;"},
    {id:"ivcrush",name:"IV Crush",ic:"&#128201;"},
    {id:"shortcover",name:"Short Covering",ic:"&#128314;"},
    {id:"longbuild",name:"Long Build-up",ic:"&#128315;"}
  ]},
  {group:"Fundamental and News", items:[
    {id:"news",name:"Company News",ic:"&#128240;"},
    {id:"results",name:"Results",ic:"&#128203;"},
    {id:"corpaction",name:"Corporate Actions",ic:"&#127974;"},
    {id:"global",name:"Global Market Events",ic:"&#127758;"}
  ]},
  {group:"Patterns", items:[
    {id:"bullengulf",name:"Bullish Engulfing",ic:"&#128640;"},
    {id:"bearengulf",name:"Bearish Engulfing",ic:"&#128201;"},
    {id:"doji",name:"Doji",ic:"&#10133;"},
    {id:"hammer",name:"Hammer",ic:"&#128296;"},
    {id:"shootingstar",name:"Shooting Star",ic:"&#127775;"},
    {id:"cuphandle",name:"Cup & Handle",ic:"&#9749;"},
    {id:"doubletop",name:"Double Top",ic:"&#9968;"},
    {id:"doublebottom",name:"Double Bottom",ic:"&#128229;"},
    {id:"triangle",name:"Triangle",ic:"&#128313;"},
    {id:"flag",name:"Flag",ic:"&#128681;"},
    {id:"pennant",name:"Pennant",ic:"&#127991;"}
  ]}
];

// Flat lookup for a type by id.
export function alertType(id){
  var found=null;
  ALERT_TYPES.forEach(function(g){ g.items.forEach(function(t){ if(t.id==id)found=t; }); });
  return found||{id:id,name:id,ic:"&#128226;"};
}

// Category for tab filtering: technical, options, news, or pattern.
export function alertCategory(id){
  var techGroups=["Price Action","Levels","Volume","Indicators"];
  var cat="technical";
  ALERT_TYPES.forEach(function(g){
    g.items.forEach(function(t){
      if(t.id==id){
        if(g.group=="Options")cat="options";
        else if(g.group=="Fundamental and News")cat="news";
        else if(g.group=="Patterns")cat="pattern";
        else if(techGroups.indexOf(g.group)!=-1)cat="technical";
      }
    });
  });
  return cat;
}

// AI Insights - educational daily observations across observed assets.
export function getAiInsights(watch){
  if(!watch||!watch.length) return [];
  var out=[];
  out.push({title:"Overall Market Tone",body:"Across your observed assets, price action is mixed with a mild upward tilt. Volume is around average, suggesting steady rather than urgent participation."});
  if(watch[0]) out.push({title:watch[0].sym+" Observation",body:"This asset is showing momentum near a watched level. Studying how it behaves at that level, with volume, builds pattern recognition."});
  out.push({title:"Volatility Note",body:"India VIX is calm, so option premiums are moderate. Calm regimes can change quickly, so it is worth watching for any volatility expansion."});
  out.push({title:"What to Study Today",body:"Focus on whether breakouts hold their levels and whether volume confirms moves. Confirmation over prediction is the core habit."});
  return out;
}

// Educational content per alert type: what / why / edu / risk.
export function getAlertEdu(id){ return EDU[id]||EDU._default; }

var EDU = {
  _default:{ what:"A monitored condition was met on this asset.", why:"It marks a possible change worth studying.", edu:"Alerts highlight conditions, not certainties. Study why it appeared and confirm with your own analysis.", risk:"Conditions can reverse quickly. This is educational, not a recommendation." },
  breakout:{ what:"Price closed above a recent resistance zone.", why:"Breakouts can mark the start of a momentum move.", edu:"A breakout is price clearing a watched level. Volume confirmation and a successful retest raise its quality. Many breakouts fail, so confirmation matters.", risk:"False breakouts are common. A breakout is not a buy signal." },
  breakdown:{ what:"Price closed below a recent support zone.", why:"Breakdowns can mark the start of weakness.", edu:"A breakdown is price falling through support. The level may now act as resistance. Confirmation and follow-through matter.", risk:"Breakdowns can reverse on a bounce. Not a sell signal." },
  gapup:{ what:"Price opened significantly above the previous close.", why:"Gaps show strong overnight sentiment.", edu:"A gap up reflects buyers willing to pay more at the open. Gaps can continue or fill back. The study is whether volume supports the gap.", risk:"Gaps can fade quickly. A gap is not a recommendation." },
  gapdown:{ what:"Price opened significantly below the previous close.", why:"Gaps down show negative overnight sentiment.", edu:"A gap down reflects sellers accepting lower prices at the open. It may continue or fill. Volume and context guide the study.", risk:"Gap downs can bounce sharply. Educational only." },
  supporttouch:{ what:"Price reached a known support level.", why:"Support is where buyers have stepped in before.", edu:"Support is a zone where demand previously appeared. A touch is a test, not a guarantee it holds. Watch how price reacts there.", risk:"Support can break. A touch is not a buy signal." },
  resistancetouch:{ what:"Price reached a known resistance level.", why:"Resistance is where sellers have stepped in before.", edu:"Resistance is a zone where supply previously appeared. A touch tests it. Watch whether price stalls or pushes through.", risk:"Resistance can break. A touch is not a sell signal." },
  supportbreak:{ what:"Price broke below a known support level.", why:"A support break can signal a shift to weakness.", edu:"When support breaks, the prior floor may become a ceiling. Volume confirms the break. Study the retest behaviour.", risk:"Breaks can be false. Educational only." },
  resistancebreak:{ what:"Price broke above a known resistance level.", why:"A resistance break can signal a shift to strength.", edu:"When resistance breaks, the prior ceiling may become a floor. Volume confirms. Watch the retest.", risk:"Breaks can fail. Not a recommendation." },
  high52:{ what:"Price reached a new 52 week high.", why:"New highs show strong momentum.", edu:"A 52 week high means price is at its strongest in a year. It reflects demand but can also mark a stretched move. Context matters.", risk:"Highs can reverse. Educational only." },
  low52:{ what:"Price reached a new 52 week low.", why:"New lows show persistent weakness.", edu:"A 52 week low means price is at its weakest in a year. It reflects supply pressure but can also mark capitulation. Study the context.", risk:"Lows can bounce or fall further. Not advice." },
  ath:{ what:"Price reached a new all time high.", why:"All time highs show unprecedented strength.", edu:"An all time high means no holder is in loss. It reflects strong demand but offers no overhead reference. Study volume and trend.", risk:"All time highs can still reverse. Educational only." },
  atl:{ what:"Price reached a new all time low.", why:"All time lows show extreme weakness.", edu:"An all time low means most holders are in loss. It reflects heavy supply. Study whether selling is exhausting or continuing.", risk:"Lows can extend. Not a recommendation." },
  volspike:{ what:"Volume rose far above its average.", why:"Volume spikes often accompany important moves.", edu:"A volume spike, measured by Relative Volume, shows unusual activity. It often comes with news or institutional interest. Volume confirms moves.", risk:"Volume without price progress can mislead. Educational only." },
  deliveryspike:{ what:"Delivery volume rose sharply.", why:"High delivery suggests genuine ownership change.", edu:"Delivery volume is shares taken to demat rather than intraday traded. A spike suggests investors, not just traders, are active.", risk:"Delivery data is one input only. Not advice." },
  vwapbreak:{ what:"Price crossed its VWAP.", why:"VWAP is a key intraday fair-value reference.", edu:"VWAP is the volume weighted average price. Crossing it can mark a shift in intraday control between buyers and sellers.", risk:"VWAP crosses can whipsaw. Educational only." },
  emacross:{ what:"Two EMAs crossed.", why:"EMA crossovers are classic trend studies.", edu:"An EMA crossover is when a faster average crosses a slower one. It can mark a trend shift, but it lags price and can give false signals in a range.", risk:"Crossovers lag and can whipsaw. Not advice." },
  rsi:{ what:"RSI reached a notable level.", why:"RSI gauges momentum extremes.", edu:"RSI runs 0 to 100. Above 70 is overbought, below 30 oversold. In strong trends these can persist, so it is a study, not a signal.", risk:"RSI alone is not directional. Educational only." },
  macd:{ what:"MACD lines crossed.", why:"MACD crossovers study momentum shifts.", edu:"MACD compares two moving averages and a signal line. A crossover can mark momentum change, but it lags and works best with context.", risk:"MACD lags price. Not a recommendation." },
  supertrend:{ what:"Supertrend changed direction.", why:"Supertrend is a popular trend filter.", edu:"Supertrend flips between up and down based on volatility bands. A flip can mark a trend change, but it can whipsaw in choppy markets.", risk:"Whipsaws are common in ranges. Educational only." },
  candle:{ what:"A candlestick pattern formed.", why:"Patterns hint at momentum shifts.", edu:"Candlestick patterns show the buyer-seller battle. They work best with trend and volume context, not in isolation.", risk:"Patterns can fail. Not advice." },
  chainchange:{ what:"The option chain shifted notably.", why:"Chain changes reveal positioning shifts.", edu:"Large changes in OI or price across strikes show where participants are repositioning. Reading the chain helps study sentiment.", risk:"Positioning can change fast. Educational only." },
  oichange:{ what:"Open Interest changed significantly.", why:"OI shows whether positions are building or unwinding.", edu:"Rising OI with rising price suggests long build-up; rising OI with falling price suggests shorts. OI with price tells the story.", risk:"OI is one input. Not a recommendation." },
  pcr:{ what:"Put-Call Ratio moved to an extreme.", why:"PCR reflects crowd positioning.", edu:"PCR compares put to call OI. High PCR can be supportive or contrarian at extremes; low PCR shows call activity. Pair with price.", risk:"PCR alone is not directional. Educational only." },
  maxpain:{ what:"Max Pain shifted to a new strike.", why:"Max Pain can act as a magnet into expiry.", edu:"Max Pain is the strike where option buyers lose most. Price sometimes gravitates there into expiry, though news can override it.", risk:"Max Pain is a tendency, not a rule. Not advice." },
  gammaflip:{ what:"The Gamma Flip level was crossed.", why:"It marks a change in dealer hedging behaviour.", edu:"Below the Gamma Flip, dealers can amplify moves; above it, they dampen them. Crossing it can change how volatile price becomes.", risk:"Gamma dynamics are complex. Educational only." },
  gammablast:{ what:"Conditions for a Gamma Blast appeared.", why:"Gamma blasts can cause explosive expiry moves.", edu:"Near expiry, high Gamma plus dealer hedging can accelerate a move sharply. It is a market-structure study, very high risk.", risk:"Extremely risky near expiry. Not a recommendation." },
  ivspike:{ what:"Implied Volatility spiked.", why:"IV spikes inflate option premiums.", edu:"An IV spike means the market expects bigger moves, often before events. It raises premiums and hurts short option positions.", risk:"IV can stay high or crush. Educational only." },
  ivcrush:{ what:"Implied Volatility crushed lower.", why:"IV crush deflates option premiums.", edu:"IV crush is a sharp fall in IV, often after events. It helps option sellers and hurts buyers who were right on direction but slow.", risk:"Direction can still hurt. Not advice." },
  shortcover:{ what:"Short covering appeared.", why:"Short covering can lift price quickly.", edu:"Short covering is shorts buying back, shown by falling OI with rising price. It can cause sharp but sometimes short-lived rallies.", risk:"Covering rallies can fade. Educational only." },
  longbuild:{ what:"Long build-up appeared.", why:"Long build-up shows fresh buying interest.", edu:"Long build-up is rising OI with rising price, suggesting new longs. It can support a trend while it lasts.", risk:"Crowded longs can unwind. Not a recommendation." },
  news:{ what:"Notable company news was detected.", why:"News can move price and volatility.", edu:"Company news can change the fundamental picture quickly. The study is how the market digests it, not the headline alone.", risk:"News reactions can be sharp and two-sided. Educational only." },
  results:{ what:"Company results were detected.", why:"Results often cause large moves and IV crush.", edu:"Earnings can move a stock sharply and crush IV afterward. Sellers and buyers both study the pre-event IV ramp and post-event crush.", risk:"Result moves can exceed expectations. Not advice." },
  corpaction:{ what:"A corporate action was detected.", why:"Actions like splits or dividends affect price.", edu:"Corporate actions such as dividends, splits, or bonuses adjust price and sometimes options. Understanding the mechanics avoids confusion.", risk:"Adjustments can be misread. Educational only." },
  global:{ what:"A global market event was detected.", why:"Global events ripple into Indian markets.", edu:"Events like Fed decisions or global selloffs can gap Indian markets at the open. Studying global cues helps frame risk.", risk:"Global shocks can cause gaps. Not a recommendation." },
  bullengulf:{ what:"A Bullish Engulfing pattern formed.", why:"It can mark a shift from selling to buying.", edu:"A Bullish Engulfing is a green candle that fully covers the prior red candle, showing buyers overpowering sellers. It is stronger after a downmove and with volume.", risk:"Patterns can fail. Confirm with trend and volume. Not a signal." },
  bearengulf:{ what:"A Bearish Engulfing pattern formed.", why:"It can mark a shift from buying to selling.", edu:"A Bearish Engulfing is a red candle that fully covers the prior green candle, showing sellers overpowering buyers. It is stronger after an upmove and with volume.", risk:"Patterns can fail. Confirm with context. Educational only." },
  doji:{ what:"A Doji candle formed.", why:"It signals indecision between buyers and sellers.", edu:"A Doji has almost equal open and close, showing balance. At the end of a trend it can hint at a pause or reversal, but it needs confirmation.", risk:"A Doji alone is not directional. Not advice." },
  hammer:{ what:"A Hammer candle formed.", why:"It can hint at a bullish reversal after a fall.", edu:"A Hammer has a small body and a long lower wick, showing buyers rejected lower prices. It is studied at the bottom of a downmove.", risk:"Hammers can fail without follow-through. Educational only." },
  shootingstar:{ what:"A Shooting Star candle formed.", why:"It can hint at a bearish reversal after a rise.", edu:"A Shooting Star has a small body and a long upper wick, showing sellers rejected higher prices. It is studied at the top of an upmove.", risk:"It can fail without confirmation. Not a signal." },
  cuphandle:{ what:"A Cup and Handle pattern formed.", why:"It is a classic continuation study.", edu:"A Cup and Handle is a rounded base followed by a small pullback handle, often studied as a continuation pattern when price breaks the handle on volume.", risk:"Patterns can fail. Volume confirmation matters. Educational only." },
  doubletop:{ what:"A Double Top pattern formed.", why:"It is a classic reversal study.", edu:"A Double Top is two peaks at a similar level with a dip between, suggesting buyers failed twice. A break below the middle low is the studied trigger.", risk:"Double Tops can fail. Confirm the break. Not advice." },
  doublebottom:{ what:"A Double Bottom pattern formed.", why:"It is a classic reversal study.", edu:"A Double Bottom is two troughs at a similar level with a bounce between, suggesting sellers failed twice. A break above the middle high is the studied trigger.", risk:"Patterns can fail. Confirm the break. Educational only." },
  triangle:{ what:"A Triangle pattern formed.", why:"It studies a coiling, narrowing range.", edu:"A Triangle forms as highs and lows converge, showing a balance that often resolves with a breakout. The direction of the break is the study.", risk:"Triangles can break either way. Educational only." },
  flag:{ what:"A Flag pattern formed.", why:"It is a short continuation study.", edu:"A Flag is a small counter-trend channel after a sharp move, often studied as a pause before the trend may continue.", risk:"Flags can fail. Confirm with volume. Not a recommendation." },
  pennant:{ what:"A Pennant pattern formed.", why:"It is a short continuation study.", edu:"A Pennant is a small symmetrical triangle after a strong move, similar to a Flag, often studied as a brief pause in a trend.", risk:"Pennants can fail. Educational only." }
};

// Observation list storage.
export function loadObservation(){
  try{ return JSON.parse(localStorage.getItem("bp_guardian")||"[]"); }catch(e){ return []; }
}
export function saveObservation(list){
  try{ localStorage.setItem("bp_guardian",JSON.stringify(list)); }catch(e){}
}

// Suggested assets to add (stocks, indices, ETFs, futures, options).
export var ASSET_SUGGEST = [
  {sym:"NIFTY 50",type:"Index"},{sym:"BANK NIFTY",type:"Index"},{sym:"SENSEX",type:"Index"},
  {sym:"RELIANCE",type:"Stock"},{sym:"TCS",type:"Stock"},{sym:"HDFCBANK",type:"Stock"},
  {sym:"SBIN",type:"Stock"},{sym:"INFY",type:"Stock"},{sym:"ICICIBANK",type:"Stock"},
  {sym:"TATASTEEL",type:"Stock"},{sym:"NIFTYBEES",type:"ETF"},{sym:"GOLDBEES",type:"ETF"},
  {sym:"NIFTY FUT",type:"Future"},{sym:"BANKNIFTY FUT",type:"Future"},
  {sym:"NIFTY 25000 CE",type:"Option"},{sym:"NIFTY 24500 PE",type:"Option"}
];

// Full Nifty 50 constituents for one-tap bulk add.
export var NIFTY50 = [
  "RELIANCE","TCS","HDFCBANK","ICICIBANK","INFY","SBIN","BHARTIARTL","ITC","LT","HINDUNILVR",
  "AXISBANK","KOTAKBANK","BAJFINANCE","ASIANPAINT","MARUTI","SUNPHARMA","TITAN","NESTLEIND","ULTRACEMCO","WIPRO",
  "ONGC","NTPC","POWERGRID","M&M","TATAMOTORS","TATASTEEL","ADANIENT","ADANIPORTS","COALINDIA","HCLTECH",
  "JSWSTEEL","GRASIM","HINDALCO","BAJAJFINSV","TECHM","DRREDDY","CIPLA","BRITANNIA","EICHERMOT","HEROMOTOCO",
  "DIVISLAB","BPCL","TATACONSUM","APOLLOHOSP","INDUSINDBK","BAJAJ-AUTO","SBILIFE","HDFCLIFE","LTIM","SHRIRAMFIN"
];

// Bank Nifty constituents for one-tap bulk add.
export var BANKNIFTY = [
  "HDFCBANK","ICICIBANK","SBIN","AXISBANK","KOTAKBANK","INDUSINDBK","BANKBARODA","PNB","AUBANK","FEDERALBNK","IDFCFIRSTB","BANDHANBNK"
];

// Add a basket of symbols to an observation list, avoiding duplicates and the 30 cap.
export function addBasket(current, symbols, type){
  var out=current.slice();
  var have={}; out.forEach(function(w){ have[w.sym]=true; });
  for(var i=0;i<symbols.length;i++){
    if(out.length>=50) break;
    if(have[symbols[i]]) continue;
    out.push({sym:symbols[i],type:type||"Stock"});
    have[symbols[i]]=true;
  }
  return out;
}

// Mock alert feed for the observation list (educational). Replace with live engine later.
export function getAlertFeed(watch){
  if(!watch||!watch.length) return [];
  var feed=[];
  // rotate alert types across watched assets so a full watchlist produces a rich feed
  var techTypes=["breakout","breakdown","volspike","rsi","resistancetouch","supporttouch","vwapbreak","macd","supertrend","gapup"];
  var optTypes=["oichange","pcr","ivspike","maxpain","longbuild","shortcover"];
  var newsTypes=["news","results","global","corpaction"];
  var times=["10:24 AM","10:18 AM","10:05 AM","09:58 AM","09:51 AM","09:40 AM","09:32 AM","09:28 AM","09:20 AM","09:16 AM"];
  var cap=Math.min(watch.length,12);
  for(var i=0;i<cap;i++){
    var s=watch[i].sym;
    var pool=(i%3==0)?techTypes:(i%3==1)?optTypes:newsTypes;
    var type=pool[i%pool.length];
    feed.push({sym:s,type:type,time:times[i%times.length]});
    // add a second technical alert for the first few to keep the feed lively
    if(i<4) feed.push({sym:s,type:techTypes[(i+3)%techTypes.length],time:times[(i+5)%times.length]});
  }
  // pattern alerts across the first several watched assets
  var patTypes=["bullengulf","hammer","doji","cuphandle","doublebottom","triangle","flag","bearengulf","shootingstar","doubletop","pennant"];
  var pcap=Math.min(watch.length,6);
  for(var p=0;p<pcap;p++){
    feed.push({sym:watch[p].sym,type:patTypes[p%patTypes.length],time:times[p%times.length]});
  }
  return feed;
}
