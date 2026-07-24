import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - PracticeSVG.jsx
// Abstract educational SVG illustrations for Practice Zone. Every shape
// uses plain relative coordinates only (0-100 scale) - no prices, no
// currency, no symbol names, no real market data of any kind.
// Rules: no backtick, no triple-equals, ASCII only.

var UP="#22C55E", DOWN="#EF4444", T2="#8899BB", BD="#1E2D4A";

// Single candle shapes, described as {bodyTop,bodyBottom,wickTop,wickBottom,up}
// in a 0-100 coordinate box. Abstract teaching shapes only.
export var CANDLE_SHAPES = {
  bullish_marubozu: { bodyTop:20, bodyBottom:80, wickTop:20, wickBottom:80, up:true },
  bearish_marubozu: { bodyTop:20, bodyBottom:80, wickTop:20, wickBottom:80, up:false },
  doji: { bodyTop:48, bodyBottom:52, wickTop:15, wickBottom:85, up:true },
  hammer: { bodyTop:25, bodyBottom:45, wickTop:20, wickBottom:88, up:true },
  shooting_star: { bodyTop:55, bodyBottom:75, wickTop:12, wickBottom:80, up:false },
  spinning_top: { bodyTop:42, bodyBottom:58, wickTop:15, wickBottom:85, up:true }
};

export function CandleIllustration(props){
  var shape = CANDLE_SHAPES[props.shapeId] || CANDLE_SHAPES.doji;
  var col = shape.up ? UP : DOWN;
  var cx = 50;
  return (
    <svg width="100%" height="160" viewBox="0 0 100 100" style={{display:"block"}}>
      <line x1={cx} y1={shape.wickTop} x2={cx} y2={shape.wickBottom} stroke={col} strokeWidth="2"/>
      <rect x={cx-12} y={shape.bodyTop} width="24" height={Math.max(2,shape.bodyBottom-shape.bodyTop)} fill={col} rx="2"/>
    </svg>
  );
}

// Chart pattern outlines, as simple polyline point arrays in a 0-100 box.
export var PATTERN_SHAPES = {
  double_top: "5,70 25,20 45,55 65,20 90,75",
  double_bottom: "5,30 25,80 45,45 65,80 90,25",
  head_shoulders: "5,60 20,30 35,60 50,10 65,60 80,30 95,65",
  triangle: "5,20 90,55 5,85",
  flag: "5,80 25,20 40,35 55,25 70,40 85,30",
  wedge: "5,85 30,35 55,55 75,30 92,45"
};

export function PatternIllustration(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system

  var pts = PATTERN_SHAPES[props.shapeId] || PATTERN_SHAPES.double_top;
  return (
    <svg width="100%" height="160" viewBox="0 0 100 100" style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={theme.c.blue} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

// Multi-candle replay strip for AI Trade Replay - renders however many
// candles are "revealed so far" (props.shapeIds, in order), reusing the
// exact same CANDLE_SHAPES lookup above rather than a second shape table.
// Abstract teaching shapes only, no prices/currency anywhere.
export function ReplayCandleStrip(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; DOWN=theme.c.down;
  UP=theme.c.up;
  var ids = props.shapeIds || [];
  var n = Math.max(1, ids.length);
  var slotW = 100 / n;
  return (
    <svg width="100%" height="180" viewBox="0 0 100 100" style={{display:"block"}}>
      <line x1="0" y1="80" x2="100" y2="80" stroke={BD} strokeWidth="0.5"/>
      <line x1="0" y1="50" x2="100" y2="50" stroke={BD} strokeWidth="0.5"/>
      <line x1="0" y1="20" x2="100" y2="20" stroke={BD} strokeWidth="0.5"/>
      {ids.map(function(id,i){
        var shape = CANDLE_SHAPES[id] || CANDLE_SHAPES.doji;
        var col = shape.up ? UP : DOWN;
        var cx = slotW*i + slotW/2;
        var w = Math.min(14, slotW*0.55);
        return (
          <g key={i}>
            <line x1={cx} y1={shape.wickTop} x2={cx} y2={shape.wickBottom} stroke={col} strokeWidth="1.5"/>
            <rect x={cx-w/2} y={shape.bodyTop} width={w} height={Math.max(2,shape.bodyBottom-shape.bodyTop)} fill={col} rx="1"/>
          </g>
        );
      })}
    </svg>
  );
}
