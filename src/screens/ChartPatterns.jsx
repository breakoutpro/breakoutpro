import { useState, useEffect } from "react";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var G = "#00C853";
var G2 = "#00E676";
var R = "#EF4444";
var GOLD = "#F59E0B";
var BLUE = "#3B82F6";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

var PATTERNS = [
  {id:"flag",cat:"Continuation",type:"Bullish",name:"Flag Pattern",prob:72,tf:"15m,1H,Daily",best:"Intraday,Swing",
   psych:"After strong move up, bulls take a brief rest. Bears can not push price down much. When rest ends, bulls attack again with full force.",
   formation:"Strong pole move up. Followed by small downward sloping channel. Parallel trendlines forming flag shape.",
   entry:"Buy when price breaks above upper flag trendline with volume",
   sl:"Below lower flag trendline or midpoint of flag",
   target:"Measure pole height. Add to breakout point. That is your target.",
   rr:"Risk 1%, Target 2-3%. Excellent RR ratio",
   tip:"Volume should dry up during flag formation. Breakout needs 1.5x average volume.",
   te:"EN",
   svg:"flag"},
  {id:"pennant",cat:"Continuation",type:"Bullish",name:"Pennant",prob:70,tf:"15m,1H,Daily",best:"Intraday,Swing",
   psych:"Similar to flag but consolidation forms a small symmetrical triangle. Both bulls and bears in balance briefly.",
   formation:"Strong pole move. Then symmetrical triangle forms with converging trendlines.",
   entry:"Buy breakout above upper trendline of pennant",
   sl:"Below lower trendline of pennant",
   target:"Pole height added to breakout point",
   rr:"1:2 minimum. Pole gives clear target measurement",
   tip:"Pennant forms faster than flag. Volume expansion on breakout is key.",
   te:"EN",
   svg:"pennant"},
  {id:"rect",cat:"Continuation",type:"Neutral",name:"Rectangle",prob:65,tf:"1H,Daily",best:"Swing,Positional",
   psych:"Price bounces between clear support and resistance. Neither side winning. When one side wins breakout happens.",
   formation:"Price moves sideways between two horizontal parallel lines. Minimum 2 touches on each side.",
   entry:"Buy breakout above resistance or sell breakdown below support with volume",
   sl:"Middle of rectangle or opposite boundary",
   target:"Rectangle height projected from breakout point",
   rr:"1:2 to 1:3 depending on rectangle size",
   tip:"Longer rectangle means stronger breakout. Wait for retest of broken level.",
   te:"EN",
   svg:"rect"},
  {id:"sym_tri",cat:"Continuation",type:"Neutral",name:"Symmetrical Triangle",prob:68,tf:"1H,Daily",best:"Swing",
   psych:"Lower highs and higher lows. Both bulls and bears losing confidence. Compression before explosion.",
   formation:"Two converging trendlines. Upper line slopes down. Lower line slopes up. Price squeezes.",
   entry:"Enter on breakout of either trendline with volume",
   sl:"Inside triangle on opposite side",
   target:"Height of base of triangle added to breakout",
   rr:"1:2 minimum",
   tip:"Breakout usually happens 2/3 of the way to apex. Volume must spike.",
   te:"EN",
   svg:"sym_tri"},
  {id:"asc_tri",cat:"Continuation",type:"Bullish",name:"Ascending Triangle",prob:74,tf:"1H,Daily",best:"Swing,Positional",
   psych:"Bulls keep buying at higher lows. Sellers hold resistance. Eventually bulls overpower sellers.",
   formation:"Flat upper resistance line. Rising lower trendline. Higher lows forming.",
   entry:"Buy breakout above flat resistance with strong volume",
   sl:"Below most recent higher low",
   target:"Height of triangle added to breakout level",
   rr:"1:2 to 1:4",
   tip:"The more times resistance is tested, the stronger the eventual breakout.",
   te:"EN",
   svg:"asc_tri"},
  {id:"desc_tri",cat:"Continuation",type:"Bearish",name:"Descending Triangle",prob:74,tf:"1H,Daily",best:"Swing,Positional",
   psych:"Bears keep selling at lower highs. Buyers hold support. Eventually bears overpower buyers.",
   formation:"Flat lower support line. Declining upper trendline. Lower highs forming.",
   entry:"Sell breakdown below flat support with strong volume",
   sl:"Above most recent lower high",
   target:"Triangle height subtracted from breakdown level",
   rr:"1:2 to 1:4",
   tip:"Watch for volume increase as price approaches support. Breakdown with volume is strong.",
   te:"EN",
   svg:"desc_tri"},
  {id:"hs",cat:"Reversal",type:"Bearish",name:"Head & Shoulders",prob:78,tf:"1H,Daily,Weekly",best:"Swing,Positional",
   psych:"Three peaks. Middle one highest. Shows exhaustion of buyers. Each rally weaker than previous.",
   formation:"Left shoulder, Head (highest point), Right shoulder. Neckline connects the two lows.",
   entry:"Sell when price breaks below neckline with volume",
   sl:"Above right shoulder",
   target:"Distance from head to neckline subtracted from breakout",
   rr:"1:3 typically with clear measured target",
   tip:"Right shoulder should be lower than left. Volume should be lower on right shoulder.",
   te:"EN",
   svg:"hs"},
  {id:"ihs",cat:"Reversal",type:"Bullish",name:"Inverse Head & Shoulders",prob:78,tf:"1H,Daily,Weekly",best:"Swing,Positional",
   psych:"Three troughs. Middle one lowest. Shows exhaustion of sellers. Each decline weaker than previous.",
   formation:"Left shoulder, Head (lowest point), Right shoulder. Neckline connects the two highs.",
   entry:"Buy when price breaks above neckline with high volume",
   sl:"Below right shoulder",
   target:"Distance from head to neckline added to breakout",
   rr:"1:3 typically",
   tip:"Volume should increase significantly on neckline breakout. Classic bottom pattern.",
   te:"EN",
   svg:"ihs"},
  {id:"dtop",cat:"Reversal",type:"Bearish",name:"Double Top",prob:72,tf:"1H,Daily",best:"Swing",
   psych:"Price tests resistance twice but fails both times. Bulls exhausted at same level. Bears taking control.",
   formation:"Two peaks at approximately same price level. Valley between them. Neckline at valley low.",
   entry:"Sell when price breaks below neckline after second peak",
   sl:"Above either peak",
   target:"Distance from peaks to neckline subtracted from breakdown",
   rr:"1:2",
   tip:"Second peak should ideally have lower volume than first. Confirms weakening bulls.",
   te:"EN",
   svg:"dtop"},
  {id:"dbot",cat:"Reversal",type:"Bullish",name:"Double Bottom",prob:72,tf:"1H,Daily",best:"Swing",
   psych:"Price tests support twice but bounces both times. Bears exhausted at same level. Bulls taking control.",
   formation:"Two troughs at approximately same price level. Peak between them. Neckline at peak high.",
   entry:"Buy when price breaks above neckline after second trough",
   sl:"Below either trough",
   target:"Distance from troughs to neckline added to breakout",
   rr:"1:2",
   tip:"W shaped pattern. Very common and reliable. Volume should pick up on breakout.",
   te:"EN",
   svg:"dbot"},
  {id:"hammer",cat:"Candlestick",type:"Bullish",name:"Hammer",prob:68,tf:"5m,15m,1H,Daily",best:"Scalping,Intraday",
   psych:"Bears pushed price down hard. But bulls stepped in strongly and pushed price back up. Sellers losing control.",
   formation:"Small real body at top of candle. Long lower wick at least 2x body. Little or no upper wick.",
   entry:"Buy above hammer high on next candle confirmation",
   sl:"Below hammer low",
   target:"Nearest resistance level or 2:1 RR from entry",
   rr:"1:2 minimum",
   tip:"Hammer must appear at bottom of downtrend or at support level. Volume should be high.",
   te:"EN",
   svg:"hammer"},
  {id:"shoot",cat:"Candlestick",type:"Bearish",name:"Shooting Star",prob:68,tf:"5m,15m,1H,Daily",best:"Scalping,Intraday",
   psych:"Bulls pushed price up hard. But bears stepped in strongly and pushed price back down. Buyers losing control.",
   formation:"Small real body at bottom of candle. Long upper wick at least 2x body. Little or no lower wick.",
   entry:"Sell below shooting star low on next candle confirmation",
   sl:"Above shooting star high",
   target:"Nearest support level or 2:1 RR",
   rr:"1:2 minimum",
   tip:"Must appear at top of uptrend or at resistance level to be valid signal.",
   te:"EN",
   svg:"shoot"},
  {id:"bull_eng",cat:"Candlestick",type:"Bullish",name:"Bullish Engulfing",prob:74,tf:"5m,15m,1H,Daily",best:"Scalping,Intraday,Swing",
   psych:"Red candle followed by much larger green candle that completely swallows it. Bulls overwhelm bears completely.",
   formation:"Day 1 red candle. Day 2 green candle opens below Day1 low and closes above Day1 high.",
   entry:"Buy above Day2 high or at close of Day2 candle",
   sl:"Below Day1 low",
   target:"Next resistance level. Minimum 2x risk",
   rr:"1:2 to 1:3",
   tip:"Stronger at support zones and after prolonged downtrend. Volume must increase on Day2.",
   te:"EN",
   svg:"bull_eng"},
  {id:"bear_eng",cat:"Candlestick",type:"Bearish",name:"Bearish Engulfing",prob:74,tf:"5m,15m,1H,Daily",best:"Scalping,Intraday,Swing",
   psych:"Green candle followed by much larger red candle that completely swallows it. Bears overwhelm bulls completely.",
   formation:"Day 1 green candle. Day 2 red candle opens above Day1 high and closes below Day1 low.",
   entry:"Sell below Day2 low or at close of Day2 candle",
   sl:"Above Day1 high",
   target:"Next support level. Minimum 2x risk",
   rr:"1:2 to 1:3",
   tip:"Stronger at resistance zones and after prolonged uptrend. High volume on Day2 essential.",
   te:"EN",
   svg:"bear_eng"},
  {id:"morning",cat:"Candlestick",type:"Bullish",name:"Morning Star",prob:76,tf:"Daily,Weekly",best:"Swing,Positional",
   psych:"3 candle reversal. Big red day shows bears in control. Small doji day shows indecision. Big green day shows bulls taking over.",
   formation:"Day1 large red. Day2 small body gaps down. Day3 large green closes above Day1 midpoint.",
   entry:"Buy above Day3 high or at Day3 close",
   sl:"Below Day2 low",
   target:"Top of previous downtrend. 3x risk minimum",
   rr:"1:3 excellent pattern",
   tip:"Day3 volume should be highest of all three. Gap on Day2 makes pattern stronger.",
   te:"EN",
   svg:"morning"},
  {id:"evening",cat:"Candlestick",type:"Bearish",name:"Evening Star",prob:76,tf:"Daily,Weekly",best:"Swing,Positional",
   psych:"3 candle reversal. Big green day shows bulls. Small doji day shows exhaustion. Big red day shows bears taking over.",
   formation:"Day1 large green. Day2 small body gaps up. Day3 large red closes below Day1 midpoint.",
   entry:"Sell below Day3 low or at Day3 close",
   sl:"Above Day2 high",
   target:"Bottom of previous uptrend. 3x risk minimum",
   rr:"1:3",
   tip:"Evening star at resistance after long uptrend is very powerful. Watch for gap.",
   te:"EN",
   svg:"evening"},
  {id:"doji",cat:"Candlestick",type:"Neutral",name:"Doji",prob:60,tf:"All timeframes",best:"All",
   psych:"Open and close at same price. Bulls and bears perfectly balanced. Market at crossroads. Direction depends on context.",
   formation:"Very small real body. Can have wicks on both sides. Open equals or nearly equals close.",
   entry:"Wait for next candle to confirm direction then trade breakout",
   sl:"Opposite end of doji range",
   target:"Depends on confirmation candle direction",
   rr:"Wait for 1:2 minimum setup after confirmation",
   tip:"Doji at support after downtrend is bullish. Doji at resistance after uptrend is bearish. Context is everything.",
   te:"EN",
   svg:"doji"},
  {id:"cup",cat:"Advanced",type:"Bullish",name:"Cup & Handle",prob:80,tf:"Daily,Weekly",best:"Swing,Positional",
   psych:"Long rounded bottom forms a cup shape showing gradual accumulation. Handle is final shakeout before big breakout.",
   formation:"Rounded U-shaped bottom over weeks or months. Then small downward handle forms. Breakout above cup rim.",
   entry:"Buy breakout above cup rim with high volume",
   sl:"Below handle low",
   target:"Cup depth added to breakout level",
   rr:"1:3 to 1:5 for positional trades",
   tip:"The longer the cup takes to form, the more powerful the breakout. William ONeil pattern.",
   te:"EN",
   svg:"cup"},
  {id:"rw",cat:"Reversal",type:"Bearish",name:"Rising Wedge",prob:70,tf:"1H,Daily",best:"Swing",
   psych:"Price making higher highs and higher lows but in converging channel. Bulls losing momentum. Breakdown coming.",
   formation:"Two upward sloping converging trendlines. Each higher low is smaller than previous one.",
   entry:"Sell on breakdown below lower trendline with volume",
   sl:"Above most recent high in wedge",
   target:"Start of wedge formation",
   rr:"1:2 to 1:3",
   tip:"Despite looking bullish, rising wedge is a bearish pattern. Fake breakouts common near apex.",
   te:"EN",
   svg:"rw"},
  {id:"fw",cat:"Reversal",type:"Bullish",name:"Falling Wedge",prob:70,tf:"1H,Daily",best:"Swing",
   psych:"Price making lower lows and lower highs in converging channel. Bears losing momentum. Breakout coming.",
   formation:"Two downward sloping converging trendlines. Each lower high is smaller than previous one.",
   entry:"Buy on breakout above upper trendline with volume",
   sl:"Below most recent low in wedge",
   target:"Start of wedge formation",
   rr:"1:2 to 1:3",
   tip:"Despite looking bearish, falling wedge is a bullish pattern. One of the most reliable patterns.",
   te:"EN",
   svg:"fw"},
];

// SVG pattern drawings
function PatternSVG(props) {
  var name = props.name;
  var w = 280, h = 120;
  var G2c = "#00E676", Rc = "#EF4444", GOLDc = "#F59E0B", T2c = "#8899BB";

  var drawings = {
    flag: (
      <svg width={w} height={h}>
        <line x1="60" y1="100" x2="130" y2="20" stroke={G2c} strokeWidth="2.5"/>
        {[0,1,2,3].map(function(i){
          return <g key={i}>
            <line x1={130+i*30} y1={20+i*8} x2={130+(i+1)*30} y2={30+i*8} stroke={Rc} strokeWidth="1.5"/>
            <line x1={130+i*30} y1={35+i*8} x2={130+(i+1)*30} y2={45+i*8} stroke={Rc} strokeWidth="1.5"/>
          </g>;
        })}
        <line x1="250" y1="52" x2="250" y2="15" stroke={G2c} strokeWidth="2" strokeDasharray="4,3"/>
        <text x="90" y="115" fill={T2c} fontSize="9">Pole</text>
        <text x="165" y="115" fill={Rc} fontSize="9">Flag</text>
        <text x="240" y="115" fill={G2c} fontSize="9">Breakout</text>
      </svg>
    ),
    pennant: (
      <svg width={w} height={h}>
        <line x1="50" y1="100" x2="120" y2="15" stroke={G2c} strokeWidth="2.5"/>
        <polygon points="120,15 120,45 200,30" fill="none" stroke={GOLDc} strokeWidth="1.5"/>
        <line x1="200" y1="30" x2="200" y2="10" stroke={G2c} strokeWidth="2" strokeDasharray="4,3"/>
        <text x="75" y="115" fill={T2c} fontSize="9">Pole</text>
        <text x="145" y="115" fill={GOLDc} fontSize="9">Pennant</text>
        <text x="190" y="115" fill={G2c} fontSize="9">Break</text>
      </svg>
    ),
    hs: (
      <svg width={w} height={h}>
        <polyline points="20,90 60,50 90,75 130,15 170,75 210,50 250,90" fill="none" stroke={Rc} strokeWidth="2"/>
        <line x1="20" y1="90" x2="260" y2="90" stroke={GOLDc} strokeWidth="1.5" strokeDasharray="5,3"/>
        <text x="55" y="115" fill={T2c} fontSize="8">L Shoulder</text>
        <text x="118" y="10" fill={Rc} fontSize="9">Head</text>
        <text x="195" y="115" fill={T2c} fontSize="8">R Shoulder</text>
        <text x="95" y="105" fill={GOLDc} fontSize="8">Neckline</text>
      </svg>
    ),
    ihs: (
      <svg width={w} height={h}>
        <polyline points="20,20 60,60 90,35 130,95 170,35 210,60 250,20" fill="none" stroke={G2c} strokeWidth="2"/>
        <line x1="20" y1="20" x2="260" y2="20" stroke={GOLDc} strokeWidth="1.5" strokeDasharray="5,3"/>
        <text x="55" y="115" fill={T2c} fontSize="8">L Shoulder</text>
        <text x="118" y="115" fill={Rc} fontSize="9">Head</text>
        <text x="195" y="115" fill={T2c} fontSize="8">R Shoulder</text>
        <text x="95" y="15" fill={GOLDc} fontSize="8">Neckline</text>
      </svg>
    ),
    dtop: (
      <svg width={w} height={h}>
        <polyline points="20,90 80,20 140,90 200,20 260,90" fill="none" stroke={Rc} strokeWidth="2"/>
        <line x1="20" y1="90" x2="270" y2="90" stroke={GOLDc} strokeWidth="1.5" strokeDasharray="5,3"/>
        <text x="60" y="15" fill={Rc} fontSize="8">Top 1</text>
        <text x="185" y="15" fill={Rc} fontSize="8">Top 2</text>
        <text x="95" y="108" fill={GOLDc} fontSize="8">Neckline - Sell Here</text>
      </svg>
    ),
    dbot: (
      <svg width={w} height={h}>
        <polyline points="20,20 80,90 140,20 200,90 260,20" fill="none" stroke={G2c} strokeWidth="2"/>
        <line x1="20" y1="20" x2="270" y2="20" stroke={GOLDc} strokeWidth="1.5" strokeDasharray="5,3"/>
        <text x="60" y="108" fill={G2c} fontSize="8">Bottom 1</text>
        <text x="185" y="108" fill={G2c} fontSize="8">Bottom 2</text>
        <text x="95" y="15" fill={GOLDc} fontSize="8">Neckline - Buy Here</text>
      </svg>
    ),
    hammer: (
      <svg width={w} height={h}>
        <line x1="140" y1="30" x2="140" y2="90" stroke={G2c} strokeWidth="1.5"/>
        <rect x="120" y="30" width="40" height="20" fill={G2c} rx="2"/>
        <text x="170" y="55" fill={G2c} fontSize="9">Small body</text>
        <text x="170" y="90" fill={T2c} fontSize="9">Long lower wick</text>
        <line x1="155" y1="50" x2="165" y2="50" stroke={G2c} strokeWidth="1"/>
        <line x1="155" y1="85" x2="165" y2="85" stroke={T2c} strokeWidth="1"/>
        <text x="90" y="115" fill={T2c} fontSize="9">At support - Very Bullish</text>
      </svg>
    ),
    shoot: (
      <svg width={w} height={h}>
        <line x1="140" y1="20" x2="140" y2="80" stroke={Rc} strokeWidth="1.5"/>
        <rect x="120" y="65" width="40" height="20" fill={Rc} rx="2"/>
        <text x="170" y="30" fill={T2c} fontSize="9">Long upper wick</text>
        <text x="170" y="80" fill={Rc} fontSize="9">Small body</text>
        <text x="90" y="115" fill={T2c} fontSize="9">At resistance - Very Bearish</text>
      </svg>
    ),
    bull_eng: (
      <svg width={w} height={h}>
        <rect x="80" y="40" width="50" height="45" fill={Rc} rx="2"/>
        <rect x="145" y="25" width="60" height="70" fill={G2c} rx="2"/>
        <text x="85" y="105" fill={Rc} fontSize="9">Day 1 Red</text>
        <text x="148" y="105" fill={G2c} fontSize="9">Day 2 Green</text>
        <text x="70" y="15" fill={T2c} fontSize="9">Green engulfs red completely</text>
      </svg>
    ),
    bear_eng: (
      <svg width={w} height={h}>
        <rect x="80" y="25" width="50" height="70" fill={G2c} rx="2"/>
        <rect x="145" y="20" width="60" height="80" fill={Rc} rx="2"/>
        <text x="85" y="110" fill={G2c} fontSize="9">Day 1 Green</text>
        <text x="148" y="110" fill={Rc} fontSize="9">Day 2 Red</text>
        <text x="70" y="15" fill={T2c} fontSize="9">Red engulfs green completely</text>
      </svg>
    ),
    morning: (
      <svg width={w} height={h}>
        <rect x="40" y="20" width="55" height="65" fill={Rc} rx="2"/>
        <rect x="118" y="60" width="30" height="25" fill={GOLDc} rx="2"/>
        <rect x="170" y="15" width="55" height="70" fill={G2c} rx="2"/>
        <text x="42" y="110" fill={Rc} fontSize="9">Big Red</text>
        <text x="108" y="110" fill={GOLDc} fontSize="9">Small</text>
        <text x="170" y="110" fill={G2c} fontSize="9">Big Green</text>
      </svg>
    ),
    evening: (
      <svg width={w} height={h}>
        <rect x="40" y="15" width="55" height="70" fill={G2c} rx="2"/>
        <rect x="118" y="25" width="30" height="25" fill={GOLDc} rx="2"/>
        <rect x="170" y="20" width="55" height="65" fill={Rc} rx="2"/>
        <text x="42" y="110" fill={G2c} fontSize="9">Big Green</text>
        <text x="108" y="110" fill={GOLDc} fontSize="9">Small</text>
        <text x="170" y="110" fill={Rc} fontSize="9">Big Red</text>
      </svg>
    ),
    doji: (
      <svg width={w} height={h}>
        <line x1="140" y1="20" x2="140" y2="90" stroke={GOLDc} strokeWidth="1.5"/>
        <line x1="110" y1="55" x2="170" y2="55" stroke={GOLDc} strokeWidth="3"/>
        <text x="80" y="115" fill={T2c} fontSize="9">Open = Close = Indecision</text>
    
