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
    {id:"candle",name:"Candlestick Patterns",ic:"&#128367;"},
    {id:"sma",name:"SMA Signals",ic:"&#10134;"},
    {id:"atr",name:"ATR Expansion",ic:"&#128207;"},
    {id:"adx",name:"ADX Trend Strength",ic:"&#128200;"},
    {id:"bollinger",name:"Bollinger Bands",ic:"&#12303;"},
    {id:"pivot",name:"Pivot Levels",ic:"&#128313;"},
    {id:"cpr",name:"CPR",ic:"&#128312;"},
    {id:"goldencross",name:"Golden Cross",ic:"&#11088;"},
    {id:"deathcross",name:"Death Cross",ic:"&#128128;"},
    {id:"orb",name:"Opening Range Breakout",ic:"&#128640;"},
    {id:"trendchange",name:"Trend Change",ic:"&#128259;"}
  ]},
  {group:"Options", items:[
    {id:"chainchange",name:"Option Chain Changes",ic:"&#128279;"},
    {id:"oichange",name:"OI Changes",ic:"&#128200;"},
    {id:"oiunwind",name:"OI Unwinding",ic:"&#128201;"},
    {id:"pcr",name:"PCR Changes",ic:"&#9878;"},
    {id:"maxpain",name:"Max Pain Shift",ic:"&#127919;"},
    {id:"gammaflip",name:"Gamma Flip",ic:"&#128259;"},
    {id:"gammablast",name:"Gamma Blast",ic:"&#9889;"},
    {id:"ivspike",name:"IV Spike",ic:"&#128200;"},
    {id:"ivcrush",name:"IV Crush",ic:"&#128201;"},
    {id:"shortcover",name:"Short Covering",ic:"&#128314;"},
    {id:"longbuild",name:"Long Build-up",ic:"&#128315;"},
    {id:"callwall",name:"Call Wall",ic:"&#128317;"},
    {id:"putwall",name:"Put Wall",ic:"&#128316;"},
    {id:"dealergamma",name:"Dealer Gamma",ic:"&#127981;"},
    {id:"thetadecay",name:"Theta Decay",ic:"&#9201;"},
    {id:"expmove",name:"Expected Move",ic:"&#8596;"},
    {id:"expiry",name:"Expiry Events",ic:"&#128197;"}
  ]},
  {group:"Fundamental and News", items:[
    {id:"news",name:"Company News",ic:"&#128240;"},
    {id:"results",name:"Results",ic:"&#128203;"},
    {id:"dividend",name:"Dividend",ic:"&#128181;"},
    {id:"bonus",name:"Bonus",ic:"&#127873;"},
    {id:"split",name:"Split",ic:"&#9988;"},
    {id:"blockdeal",name:"Block Deals",ic:"&#129521;"},
    {id:"bulkdeal",name:"Bulk Deals",ic:"&#128230;"},
    {id:"corpaction",name:"Corporate Actions",ic:"&#127974;"},
    {id:"rbi",name:"RBI",ic:"&#127963;"},
    {id:"budget",name:"Budget",ic:"&#128181;"},
    {id:"usmarkets",name:"US Markets",ic:"&#127482;"},
    {id:"global",name:"Global Market Events",ic:"&#127758;"},
    {id:"econ",name:"Economic Calendar",ic:"&#128467;"}
  ]},
  {group:"Patterns", items:[
    {id:"bullengulf",name:"Bullish Engulfing",ic:"&#128640;"},
    {id:"bearengulf",name:"Bearish Engulfing",ic:"&#128201;"},
    {id:"hammer",name:"Hammer",ic:"&#128296;"},
    {id:"shootingstar",name:"Shooting Star",ic:"&#127775;"},
    {id:"doji",name:"Doji",ic:"&#10133;"},
    {id:"morningstar",name:"Morning Star",ic:"&#127772;"},
    {id:"eveningstar",name:"Evening Star",ic:"&#127771;"},
    {id:"cuphandle",name:"Cup & Handle",ic:"&#9749;"},
    {id:"doubletop",name:"Double Top",ic:"&#9968;"},
    {id:"doublebottom",name:"Double Bottom",ic:"&#128229;"},
    {id:"triangle",name:"Triangle",ic:"&#128313;"},
    {id:"rectangle",name:"Rectangle",ic:"&#11036;"},
    {id:"pennant",name:"Pennant",ic:"&#127991;"},
    {id:"flag",name:"Flag",ic:"&#128681;"},
    {id:"wedge",name:"Wedge",ic:"&#128318;"},
    {id:"channel",name:"Channel",ic:"&#128256;"},
    {id:"insidebar",name:"Inside Bar",ic:"&#128306;"},
    {id:"outsidebar",name:"Outside Bar",ic:"&#128307;"}
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
  pennant:{ what:"A Pennant pattern formed.", why:"It is a short continuation study.", edu:"A Pennant is a small symmetrical triangle after a strong move, similar to a Flag, often studied as a brief pause in a trend.", risk:"Pennants can fail. Educational only." },
  morningstar:{ what:"A Morning Star pattern formed.", why:"It can hint at a bullish reversal.", edu:"A Morning Star is a three-candle bottoming pattern: a down candle, a small indecision candle, then a strong up candle. It is studied after a decline.", risk:"It needs confirmation. Educational only." },
  eveningstar:{ what:"An Evening Star pattern formed.", why:"It can hint at a bearish reversal.", edu:"An Evening Star is a three-candle topping pattern: an up candle, a small indecision candle, then a strong down candle. It is studied after a rise.", risk:"It needs confirmation. Not advice." },
  rectangle:{ what:"A Rectangle range formed.", why:"It studies a sideways range between support and resistance.", edu:"A Rectangle is price bouncing between flat support and resistance. A break of either side, on volume, is the studied event.", risk:"Ranges can break either way. Educational only." },
  wedge:{ what:"A Wedge pattern formed.", why:"It studies a narrowing, slanted range.", edu:"A Wedge is two converging trendlines that slope together. Rising wedges often study as bearish, falling wedges as bullish, with the break as the trigger.", risk:"Wedges can fail. Educational only." },
  channel:{ what:"A Channel formed.", why:"It studies price moving between parallel trendlines.", edu:"A Channel is price riding between two parallel lines. Touches of each line and a break out of the channel are the studied points.", risk:"Channels can break. Not advice." },
  insidebar:{ what:"An Inside Bar formed.", why:"It studies a pause and compression.", edu:"An Inside Bar sits fully inside the prior candle range, showing compression. A break of the mother bar is the studied trigger.", risk:"Inside bars can break either way. Educational only." },
  outsidebar:{ what:"An Outside Bar formed.", why:"It studies expansion and possible reversal.", edu:"An Outside Bar engulfs the prior candle range, showing a burst of volatility. Its close direction is the studied clue.", risk:"Outside bars can mislead. Not advice." },
  sma:{ what:"Price interacted with a key SMA.", why:"Moving averages are common trend references.", edu:"A Simple Moving Average smooths price. Crosses and bounces at key SMAs like the 50 or 200 are widely studied trend references.", risk:"SMAs lag price. Educational only." },
  atr:{ what:"ATR expanded notably.", why:"ATR measures volatility.", edu:"Average True Range measures how much price moves on average. A rising ATR shows expanding volatility, which changes risk sizing studies.", risk:"High ATR means larger swings. Not advice." },
  adx:{ what:"ADX signalled a trend strength change.", why:"ADX measures how strong a trend is.", edu:"ADX rises when a trend strengthens and falls in ranges. Above 25 often studies as a trending market, below 20 as a range.", risk:"ADX lags and is non-directional. Educational only." },
  bollinger:{ what:"Price interacted with Bollinger Bands.", why:"Bands study volatility and stretch.", edu:"Bollinger Bands expand and contract with volatility. Touches of the outer bands and squeezes before expansion are common studies.", risk:"Band touches are not signals alone. Educational only." },
  pivot:{ what:"Price reached a Pivot level.", why:"Pivots are common intraday references.", edu:"Pivot points are calculated levels traders watch intraday for support and resistance. Reactions at pivots are the study.", risk:"Pivots can break. Not advice." },
  cpr:{ what:"Price interacted with the CPR.", why:"CPR is a popular intraday range tool.", edu:"The Central Pivot Range frames the day. A narrow CPR often studies as a trend day setup, a wide CPR as a range day.", risk:"CPR is a guide, not a signal. Educational only." },
  goldencross:{ what:"A Golden Cross formed.", why:"It is a classic long-term bullish study.", edu:"A Golden Cross is the 50-day average crossing above the 200-day. It is a slow, well-known bullish trend study, though it lags.", risk:"It lags and can whipsaw. Educational only." },
  deathcross:{ what:"A Death Cross formed.", why:"It is a classic long-term bearish study.", edu:"A Death Cross is the 50-day average crossing below the 200-day. It is a slow bearish trend study that lags price.", risk:"It lags and can whipsaw. Not advice." },
  orb:{ what:"An Opening Range Breakout formed.", why:"It studies the first range of the day.", edu:"The Opening Range is the high and low of the first minutes. A break of that range is a common intraday study.", risk:"ORB can give false breaks. Educational only." },
  trendchange:{ what:"A possible trend change was detected.", why:"Trend shifts change the whole context.", edu:"A trend change is when structure shifts from higher highs to lower highs, or the reverse. Confirming the shift is the study.", risk:"Trend calls can be early. Educational only." },
  oiunwind:{ what:"OI unwinding appeared.", why:"Unwinding shows positions being closed.", edu:"OI unwinding is falling OI with price moving, showing traders closing positions. Falling OI with falling price suggests longs exiting.", risk:"Unwinding is one input. Educational only." },
  callwall:{ what:"Activity at the Call Wall changed.", why:"The Call Wall is a heavy resistance zone.", edu:"The Call Wall is the strike with the most call OI above price, often acting as resistance. Shifts in it change the studied range.", risk:"Walls can break. Educational only." },
  putwall:{ what:"Activity at the Put Wall changed.", why:"The Put Wall is a heavy support zone.", edu:"The Put Wall is the strike with the most put OI below price, often acting as support. Shifts in it change the studied range.", risk:"Walls can break. Not advice." },
  dealergamma:{ what:"Dealer Gamma positioning changed.", why:"It affects how volatile price may be.", edu:"When dealers are long gamma, they dampen moves; when short, they can amplify them. The flip point is a key volatility study.", risk:"Gamma dynamics are complex. Educational only." },
  thetadecay:{ what:"Theta decay is notable today.", why:"Time decay is the seller's edge.", edu:"Theta is daily time decay, fastest near expiry. It is the core study for option sellers and a cost for buyers.", risk:"High Theta comes with Gamma risk. Educational only." },
  expmove:{ what:"The Expected Move updated.", why:"It frames a probable range.", edu:"The Expected Move is the option-implied range by expiry. It frames where price is likely to stay about two-thirds of the time.", risk:"Tail events exceed the range. Educational only." },
  expiry:{ what:"An expiry event is near.", why:"Expiry brings fast Theta and high Gamma.", edu:"On expiry, Theta is fastest and Gamma risk peaks. Small moves can swing near-strike options sharply. It is a key study day.", risk:"Expiry days can be violent. Not advice." },
  dividend:{ what:"A dividend event was detected.", why:"Dividends adjust price and options.", edu:"On the ex-dividend date, price drops by roughly the dividend. Understanding the adjustment avoids confusion in charts and options.", risk:"Adjustments can be misread. Educational only." },
  bonus:{ what:"A bonus issue was detected.", why:"Bonus shares adjust price and quantity.", edu:"A bonus issue gives extra shares and lowers the price proportionally, so total value is unchanged. The chart adjusts accordingly.", risk:"Adjustments can confuse. Educational only." },
  split:{ what:"A stock split was detected.", why:"Splits change face value and price.", edu:"A split divides each share into more shares at a lower price, leaving total value unchanged. Charts adjust for it.", risk:"Adjustments can be misread. Not advice." },
  blockdeal:{ what:"A block deal was detected.", why:"Large deals show big-player activity.", edu:"Block deals are large transactions arranged between parties. They show institutional interest but not its direction or intent.", risk:"One deal is not a trend. Educational only." },
  bulkdeal:{ what:"A bulk deal was detected.", why:"Bulk deals show notable volume by one party.", edu:"Bulk deals are sizable market transactions by a single client. They flag activity worth studying, not a recommendation.", risk:"Context matters. Educational only." },
  rbi:{ what:"An RBI-related event was detected.", why:"RBI policy moves rates and sentiment.", edu:"RBI decisions on rates and liquidity move banking and the broad market. Studying the reaction matters more than the headline.", risk:"Policy reactions can be sharp. Educational only." },
  budget:{ what:"A Budget-related event was detected.", why:"The Budget can move many sectors.", edu:"The Union Budget sets policy and spending, often causing wide intraday swings across sectors. It is a major event-risk study.", risk:"Budget days can be volatile. Not advice." },
  usmarkets:{ what:"A US market move was detected.", why:"US markets influence India's open.", edu:"US indices and the Fed shape global risk appetite, often setting the tone for India's open. Studying global cues frames risk.", risk:"Global shocks can gap markets. Educational only." },
  econ:{ what:"An economic calendar event is near.", why:"Data releases can move markets.", edu:"Scheduled data like inflation or jobs can move markets on release. Knowing the calendar helps frame event risk.", risk:"Data surprises can be sharp. Educational only." },
  circuit:{ what:"A circuit limit was touched.", why:"Circuits pause extreme moves.", edu:"Circuit limits halt trading after extreme moves to cool volatility. They flag unusual conditions worth understanding.", risk:"Circuits mark extreme stress. Educational only." },
  pricespike:{ what:"A sharp price spike occurred.", why:"Spikes show sudden imbalance.", edu:"A fast price spike shows a sudden surge of buying or selling, often on news or liquidity gaps. The cause is the study.", risk:"Spikes can reverse fast. Not advice." }
};

// Observation list storage.
export function loadObservation(){
  try{ return JSON.parse(localStorage.getItem("bp_guardian")||"[]"); }catch(e){ return []; }
}
export function saveObservation(list){
  try{ localStorage.setItem("bp_guardian",JSON.stringify(list)); }catch(e){}
}

// Live summary + market health for the dashboard. Mock now, API-ready.
export function getMarketStatus(){
  return {
    score:72, mood:"Bullish", trend:"Up", momentum:"Strong", volatility:"Calm",
    risk:"Moderate", breadth:"Adv > Dec", fiidii:"FII +1,240 Cr", vix:"13.8",
    health:74, trendStrength:68, sentiment:71, lastScan:"just now"
  };
}

// Today's market timeline of educational events.
export function getTimeline(watch){
  var s0=(watch&&watch[0])?watch[0].sym:"NIFTY 50";
  var s1=(watch&&watch[1])?watch[1].sym:"RELIANCE";
  return [
    {time:"09:15",type:"gapup",sym:s0},
    {time:"09:35",type:"rsi",sym:s1},
    {time:"10:05",type:"breakout",sym:s0},
    {time:"10:25",type:"oichange",sym:s0},
    {time:"11:10",type:"volspike",sym:s1}
  ];
}

// Priority + confidence + timeframe metadata for an alert type (educational mock).
export function alertMeta(type){
  var crit=["gammablast","circuit","results","ivspike"];
  var high=["breakout","breakdown","gapup","gapdown","oichange","ath","atl","global"];
  var pr=crit.indexOf(type)!=-1?"Critical":high.indexOf(type)!=-1?"High":"Medium";
  // deterministic pseudo confidence from the type string
  var sum=0; for(var i=0;i<type.length;i++){ sum+=type.charCodeAt(i); }
  var conf=72+(sum%24); // 72-95
  var tfs=["5m","15m","1H","Daily"];
  var tf=tfs[sum%tfs.length];
  return {priority:pr, confidence:conf, timeframe:tf};
}
export function priorityColor(p){
  if(p=="Critical") return "#EF4444";
  if(p=="High") return "#F97316";
  if(p=="Medium") return "#D4AF37";
  return "#A0A7B4";
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

// Default demo watchlist: 10 assets, cleanly split 5 uptrend / 5 downtrend.
export var DEMO_WATCHLIST = [
  {sym:"RELIANCE",type:"Stock"},{sym:"TCS",type:"Stock"},{sym:"HDFCBANK",type:"Stock"},
  {sym:"ICICIBANK",type:"Stock"},{sym:"INFY",type:"Stock"},
  {sym:"NIFTY 24500 PE",type:"Option"},{sym:"SBIN",type:"Stock"},{sym:"AXISBANK",type:"Stock"},
  {sym:"WIPRO 240 CALL",type:"Option"},{sym:"SBI BANK 1056 PUT",type:"Option"}
];

// Forced bias for known demo symbols so structure is consistent and clean.
var FORCED_BIAS = {
  "RELIANCE":true,"TCS":true,"HDFCBANK":true,"ICICIBANK":true,"INFY":true,
  "NIFTY 24500 PE":false,"SBIN":false,"AXISBANK":false,"WIPRO 240 CALL":false,"SBI BANK 1056 PUT":false
};

// Per-asset intelligence card: AI score, bias, price, alerts, levels. Mock, API-ready.
export function getAssetCard(asset){
  var sym=asset.sym;
  var seed=0; for(var i=0;i<sym.length;i++){ seed+=sym.charCodeAt(i); }
  var forced=FORCED_BIAS.hasOwnProperty(sym)?FORCED_BIAS[sym]:null;
  var score;
  if(forced===true) score=72+(seed%20);   // 72-91 uptrend
  else if(forced===false) score=35+(seed%18); // 35-52 downtrend
  else score=48+(seed%40); // 48-87 mixed
  var up=forced!==null?forced:(score>=58);
  var bias=up?(score>=75?"Bullish":"Positive"):"Bearish";
  var isOpt=(asset.type=="Option"||asset.type=="Index");
  // alert chips for this asset
  var techAlerts=[
    {ic:"&#128640;",name:"Breakout",tone:"up"},
    {ic:"&#128200;",name:"RSI Bullish",tone:"up"},
    {ic:"&#10134;",name:"Above VWAP",tone:"up"},
    {ic:"&#128293;",name:"Volume Spike",tone:"up"},
    {ic:"&#128367;",name:"Bullish Engulfing",tone:"up"}
  ];
  var optAlerts=[
    {ic:"&#128202;",name:"OI Increasing",tone:"up"},
    {ic:"&#127919;",name:"Max Pain Shift",tone:"neutral"},
    {ic:"&#9878;",name:"PCR Positive",tone:"up"},
    {ic:"&#9889;",name:"Gamma Active",tone:"warn"}
  ];
  var newsAlerts=[
    {ic:"&#127758;",name:"Global Support",tone:"up"},
    {ic:"&#128240;",name:"Positive News",tone:"up"}
  ];
  var alerts=techAlerts.concat(isOpt?optAlerts:[]).concat(newsAlerts);
  if(!up){ alerts=[{ic:"&#128201;",name:"Breakdown",tone:"down"},{ic:"&#128317;",name:"Below VWAP",tone:"down"},{ic:"&#128240;",name:"Weak News",tone:"down"}]; }

  var base=isOpt?(sym.indexOf("BANK")!=-1?52000:24800):(1200+(seed%1800));
  var chg=((seed%40)-15)/10; // -1.5 to +2.4
  return {
    sym:sym, type:asset.type, score:score, bias:bias, up:up, live:true,
    price:isOpt?(""+(120+(seed%180))):(""+base.toLocaleString("en-IN")),
    change:(chg>=0?"+":"")+chg.toFixed(2)+"%",
    alerts:alerts,
    support:""+(isOpt?(base-120):Math.round(base*0.97)),
    resistance:""+(isOpt?(base+140):Math.round(base*1.03)),
    timeframe:["5m","15m","1H","Daily"][seed%4],
    confidence:74+(seed%22),
    updated:"just now"
  };
}

// Live feed - real-time scrolling market events across many assets.
export function getLiveFeed(watch){
  var assets=(watch&&watch.length)?watch.map(function(w){return w.sym;}):["RELIANCE","BANK NIFTY","SBIN","NIFTY 50","INFY","TATASTEEL","HDFCBANK","ICICIBANK"];
  var types=["breakout","volspike","hammer","pcr","vwapbreak","oichange","rsi","bullengulf","gapup","maxpain","resistancebreak","ivspike"];
  var times=["10:32 AM","10:28 AM","10:24 AM","10:19 AM","10:14 AM","10:08 AM","10:02 AM","09:56 AM","09:51 AM","09:44 AM","09:38 AM","09:31 AM","09:27 AM","09:21 AM","09:16 AM"];
  var out=[];
  for(var i=0;i<times.length;i++){
    var sym=assets[i%assets.length];
    var type=types[i%types.length];
    out.push({sym:sym,type:type,time:times[i]});
  }
  return out;
}

// AI Insights - rich daily summary cards.
export function getInsights(watch){
  return [
    {k:"Today's Market Mood",v:"Bullish",tone:"up"},
    {k:"Market Health Score",v:"74 / 100",tone:"up"},
    {k:"Top Bullish Asset",v:(watch&&watch[0])?watch[0].sym:"RELIANCE",tone:"up"},
    {k:"Top Bearish Asset",v:"TATASTEEL",tone:"down"},
    {k:"Highest Volume",v:"SBIN",tone:"neutral"},
    {k:"Highest OI",v:"BANK NIFTY",tone:"neutral"},
    {k:"Strongest Sector",v:"Banking",tone:"up"},
    {k:"Weakest Sector",v:"Metals",tone:"down"},
    {k:"Market Breadth",v:"Adv > Dec",tone:"up"},
    {k:"India VIX",v:"13.8 Calm",tone:"up"},
    {k:"FII / DII",v:"FII +1,240 Cr",tone:"up"},
    {k:"Biggest News",v:"RBI holds rates steady",tone:"neutral"}
  ];
}
export function getInsightNotes(){
  return {
    risk:"Volatility is calm but can expand around events. Keep position sizes modest and respect undefined-risk strategies.",
    lesson:"Confirmation over prediction. A breakout with volume that holds a retest is higher quality than one without.",
    observation:"Banking led today while metals lagged. Two-sided option writing framed a range, suggesting a calm-to-up tone into expiry."
  };
}

// Per-asset alert events for the asset dashboard timeline.
export function getAssetTimeline(sym){
  return [
    {time:"09:15",type:"emacross",obs:"Above EMA 20",edu:"Price moved above its 20 EMA, a common reference for short-term trend."},
    {time:"09:20",type:"breakout",obs:"Higher High formed",edu:"A new higher high suggests buyers are in control for now."},
    {time:"09:25",type:"volspike",obs:"Strong Volume",edu:"Volume rose above average, often confirming a move."},
    {time:"09:30",type:"breakout",obs:"Breakout Structure",edu:"Price cleared a watched level, a breakout structure to study."},
    {time:"09:35",type:"bullengulf",obs:"Bullish Engulfing",edu:"A green candle engulfed the prior red one, showing buyers stepping up."},
    {time:"09:40",type:"rsi",obs:"RSI crossed above 60",edu:"RSI moving above 60 reflects strengthening momentum."},
    {time:"09:45",type:"vwapbreak",obs:"VWAP reclaimed",edu:"Price reclaimed VWAP, shifting intraday control toward buyers."}
  ];
}

// Candle pattern detection (educational mock, deterministic from symbol).
var CANDLE_PATTERNS=[
  {name:"Bullish Engulfing",up:true,edu:"A green candle fully engulfed the prior red one, showing buyers overpowering sellers."},
  {name:"Doji",up:true,edu:"A Doji represents temporary market indecision after recent movement."},
  {name:"Hammer",up:true,edu:"A small body with a long lower wick, showing buyers rejected lower prices."},
  {name:"Morning Star",up:true,edu:"A three-candle bottoming pattern often studied after a decline."},
  {name:"Three White Soldiers",up:true,edu:"Three strong green candles in a row, reflecting steady buying."},
  {name:"Bearish Engulfing",up:false,edu:"A red candle fully engulfed the prior green one, showing sellers in control."},
  {name:"Shooting Star",up:false,edu:"A small body with a long upper wick, showing sellers rejected higher prices."},
  {name:"Evening Star",up:false,edu:"A three-candle topping pattern often studied after a rise."},
  {name:"Dark Cloud Cover",up:false,edu:"A red candle opening above and closing into the prior green body, a weakening sign."}
];
export function getCandleObservation(asset){
  var c=getAssetCard(asset);
  var seed=0; var s=asset.sym; for(var i=0;i<s.length;i++){ seed+=s.charCodeAt(i); }
  var pool=CANDLE_PATTERNS.filter(function(p){ return p.up==c.up; });
  var pat=pool[seed%pool.length];
  return {
    name:pat.name, up:pat.up, edu:pat.edu,
    timeframe:["1m","3m","5m","15m","1H","Daily"][seed%6],
    strength:["Moderate","Strong","Strong","Very Strong"][seed%4],
    confidence:72+(seed%24),
    time:["09:35 AM","10:12 AM","11:05 AM","11:25 AM"][seed%4]
  };
}

// Reasons the structure changed (educational observations only).
export function getStructureReasons(asset){
  var c=getAssetCard(asset);
  if(c.up) return ["Price moved above EMA 20","VWAP reclaimed","Strong buying volume observed","Resistance crossed","Higher High formed","Momentum strengthened"];
  return ["Price moved below EMA 20","Support broken","Weak volume observed","Lower Low formed","Bearish candle pattern detected","Momentum weakened"];
}

// Related assets showing comparable structure.
export function getRelatedObservations(asset){
  var c=getAssetCard(asset);
  if(c.up) return [{sym:"RELIANCE",obs:"Higher High"},{sym:"INFY",obs:"Above VWAP"},{sym:"BANK NIFTY",obs:"Bullish Engulfing"},{sym:"HDFCBANK",obs:"Strong Volume"}];
  return [{sym:"TATASTEEL",obs:"Lower Low"},{sym:"WIPRO",obs:"Below VWAP"},{sym:"HINDALCO",obs:"Bearish Engulfing"},{sym:"COALINDIA",obs:"Weak Volume"}];
}

// Alert types a user can subscribe to per-asset (the bell selector).
export var ASSET_ALERT_OPTIONS=[
  {id:"doji",name:"Doji"},
  {id:"bullengulf",name:"Bullish Engulfing"},
  {id:"bearengulf",name:"Bearish Engulfing"},
  {id:"emacross",name:"EMA Cross"},
  {id:"vwapbreak",name:"VWAP Cross"},
  {id:"supporttouch",name:"Support Touch"},
  {id:"resistancetouch",name:"Resistance Touch"},
  {id:"volspike",name:"Volume Spike"},
  {id:"oichange",name:"OI Change"},
  {id:"ivspike",name:"IV Spike"},
  {id:"breakout",name:"Breakout"},
  {id:"breakdown",name:"Breakdown"}
];
export function loadAssetAlerts(sym){
  try{ return JSON.parse(localStorage.getItem("bp_guardian_alerts_"+sym)||"[]"); }catch(e){ return []; }
}
export function saveAssetAlerts(sym,arr){
  try{ localStorage.setItem("bp_guardian_alerts_"+sym,JSON.stringify(arr)); }catch(e){}
}

// Bank Nifty constituents for one-tap bulk add.
export var BANKNIFTY = [
  "HDFCBANK","ICICIBANK","SBIN","AXISBANK","KOTAKBANK","INDUSINDBK","BANKBARODA","PNB","AUBANK","FEDERALBNK","IDFCFIRSTB","BANDHANBNK"
];

// Popular indices for Quick Add.
export var POPULAR_INDICES = [
  {sym:"NIFTY 50",type:"Index"},{sym:"BANK NIFTY",type:"Index"},{sym:"SENSEX",type:"Index"},
  {sym:"FINNIFTY",type:"Index"},{sym:"MIDCAP NIFTY",type:"Index"},{sym:"NIFTY NEXT 50",type:"Index"}
];

// Popular option presets for Quick Add.
export var POPULAR_OPTIONS = [
  {sym:"NIFTY ATM CE",type:"Option",note:"At-the-money Call"},
  {sym:"NIFTY ATM PE",type:"Option",note:"At-the-money Put"},
  {sym:"NIFTY ITM CE",type:"Option",note:"In-the-money Call"},
  {sym:"NIFTY ITM PE",type:"Option",note:"In-the-money Put"},
  {sym:"NIFTY OTM CE",type:"Option",note:"Out-of-the-money Call"},
  {sym:"NIFTY OTM PE",type:"Option",note:"Out-of-the-money Put"}
];

// Parse a typed option contract like "NIFTY 25000 CE" or "BANKNIFTY 58000 PE".
export function parseOptionContract(text){
  if(!text) return null;
  var t=text.toUpperCase().replace(/\s+/g," ").trim();
  var m=t.match(/^([A-Z]+)\s+(\d{3,6})\s*(CE|PE)$/);
  if(!m) return null;
  return {sym:m[1]+" "+m[2]+" "+m[3], type:"Option"};
}

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
  var techTypes=["breakout","breakdown","volspike","rsi","resistancetouch","supporttouch","vwapbreak","macd","supertrend","gapup"];
  var optTypes=["oichange","pcr","ivspike","ivcrush","maxpain","longbuild","shortcover","gammaflip","gammablast","dealergamma","expmove","callwall","putwall","oiunwind"];
  var newsTypes=["news","results","global","rbi","corpaction"];
  var times=["10:24 AM","10:18 AM","10:05 AM","09:58 AM","09:51 AM","09:40 AM","09:32 AM","09:28 AM","09:20 AM","09:16 AM"];
  var cap=Math.min(watch.length,14);
  for(var i=0;i<cap;i++){
    var a=watch[i];
    var s=a.sym;
    var isOpt=(a.type=="Option"||a.type=="Index");
    if(isOpt){
      // options/indices get options-rich alerts plus some technical
      feed.push({sym:s,type:optTypes[i%optTypes.length],time:times[i%times.length]});
      feed.push({sym:s,type:optTypes[(i+4)%optTypes.length],time:times[(i+2)%times.length]});
      if(i<4) feed.push({sym:s,type:techTypes[i%techTypes.length],time:times[(i+5)%times.length]});
    } else {
      var pool=(i%3==0)?techTypes:(i%3==1)?optTypes:newsTypes;
      feed.push({sym:s,type:pool[i%pool.length],time:times[i%times.length]});
      if(i<4) feed.push({sym:s,type:techTypes[(i+3)%techTypes.length],time:times[(i+5)%times.length]});
    }
  }
  var patTypes=["bullengulf","hammer","doji","cuphandle","doublebottom","triangle","flag","bearengulf","shootingstar","doubletop","pennant"];
  var pcap=Math.min(watch.length,6);
  for(var p=0;p<pcap;p++){
    feed.push({sym:watch[p].sym,type:patTypes[p%patTypes.length],time:times[p%times.length]});
  }
  return feed;
}
