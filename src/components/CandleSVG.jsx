// BreakoutPro - CandleSVG.jsx
// Real lightweight SVG candlestick visuals for detected patterns.
// No emoji, no images. Sharp at any size. Colors: up green, down red, doji gray.
// Rules: no backtick, no triple-equals, ASCII only.

var UP="#22C55E", DOWN="#EF4444", DOJI="#8899BB", NEUTRAL="#A0A7B4";

// One candle primitive: x center, body top/bottom, wick high/low, color.
function C(props){
  var x=props.x, w=props.w||7;
  return (
    <g>
      <line x1={x} y1={props.hi} x2={x} y2={props.lo} stroke={props.col} strokeWidth="1.4"/>
      <rect x={x-w/2} y={props.top} width={w} height={Math.max(1,props.bot-props.top)} fill={props.filled?props.col:"#0B0E13"} stroke={props.col} strokeWidth="1.4"/>
    </g>
  );
}

// Map pattern name (lowercase substring) to an SVG drawing. 40x40 viewBox.
export function patternKey(name){
  var n=(name||"").toLowerCase();
  if(n.indexOf("long-legged")>=0||n.indexOf("long legged")>=0) return "longdoji";
  if(n.indexOf("dragonfly")>=0) return "dragonfly";
  if(n.indexOf("gravestone")>=0) return "gravestone";
  if(n.indexOf("four price")>=0||n.indexOf("fourprice")>=0) return "fourprice";
  if(n.indexOf("doji")>=0) return "doji";
  if(n.indexOf("inverted hammer")>=0) return "invhammer";
  if(n.indexOf("hanging")>=0) return "hangingman";
  if(n.indexOf("hammer")>=0) return "hammer";
  if(n.indexOf("shooting")>=0) return "shooting";
  if(n.indexOf("bullish engulf")>=0) return "bullengulf";
  if(n.indexOf("bearish engulf")>=0) return "bearengulf";
  if(n.indexOf("morning")>=0) return "morning";
  if(n.indexOf("evening")>=0) return "evening";
  if(n.indexOf("three white")>=0||n.indexOf("white soldiers")>=0) return "3soldiers";
  if(n.indexOf("three black")>=0||n.indexOf("black crows")>=0) return "3crows";
  if(n.indexOf("breakout")>=0) return "breakout";
  if(n.indexOf("breakdown")>=0) return "breakdown";
  return "doji";
}

export default function CandleSVG(props){
  var k=props.pattern?patternKey(props.pattern):(props.k||"doji");
  var s=props.size||40;
  var body;
  if(k=="doji") body=[<C key="1" x={20} w={13} hi={7} lo={33} top={19} bot={21} col={DOJI} filled={true}/>];
  else if(k=="longdoji") body=[<C key="1" x={20} w={13} hi={3} lo={37} top={19} bot={21} col={DOJI} filled={true}/>];
  else if(k=="dragonfly") body=[<C key="1" x={20} w={13} hi={9} lo={35} top={9} bot={11} col={DOJI} filled={true}/>];
  else if(k=="gravestone") body=[<C key="1" x={20} w={13} hi={5} lo={31} top={29} bot={31} col={DOJI} filled={true}/>];
  else if(k=="fourprice") body=[<C key="1" x={20} w={13} hi={20} lo={20} top={19} bot={21} col={DOJI} filled={true}/>];
  else if(k=="hammer") body=[<C key="1" x={20} w={11} hi={10} lo={36} top={10} bot={18} col={UP} filled={true}/>];
  else if(k=="invhammer") body=[<C key="1" x={20} w={11} hi={4} lo={30} top={22} bot={30} col={UP} filled={true}/>];
  else if(k=="hangingman") body=[<C key="1" x={20} w={11} hi={10} lo={36} top={10} bot={18} col={DOWN} filled={true}/>];
  else if(k=="shooting") body=[<C key="1" x={20} w={11} hi={4} lo={30} top={22} bot={30} col={DOWN} filled={true}/>];
  else if(k=="bullengulf") body=[
    <C key="1" x={14} w={8} hi={12} lo={30} top={16} bot={26} col={DOWN} filled={true}/>,
    <C key="2" x={26} w={11} hi={8} lo={34} top={12} bot={30} col={UP} filled={true}/>];
  else if(k=="bearengulf") body=[
    <C key="1" x={14} w={8} hi={12} lo={30} top={16} bot={26} col={UP} filled={true}/>,
    <C key="2" x={26} w={11} hi={8} lo={34} top={12} bot={30} col={DOWN} filled={true}/>];
  else if(k=="morning") body=[
    <C key="1" x={11} w={7} hi={6} lo={28} top={8} bot={24} col={DOWN} filled={true}/>,
    <C key="2" x={20} w={7} hi={26} lo={38} top={30} bot={34} col={DOJI} filled={true}/>,
    <C key="3" x={29} w={7} hi={10} lo={30} top={12} bot={26} col={UP} filled={true}/>];
  else if(k=="evening") body=[
    <C key="1" x={11} w={7} hi={12} lo={34} top={16} bot={32} col={UP} filled={true}/>,
    <C key="2" x={20} w={7} hi={2} lo={14} top={6} bot={10} col={DOJI} filled={true}/>,
    <C key="3" x={29} w={7} hi={10} lo={34} top={14} bot={30} col={DOWN} filled={true}/>];
  else if(k=="3soldiers") body=[
    <C key="1" x={11} w={7} hi={22} lo={36} top={26} bot={34} col={UP} filled={true}/>,
    <C key="2" x={20} w={7} hi={14} lo={30} top={18} bot={28} col={UP} filled={true}/>,
    <C key="3" x={29} w={7} hi={6} lo={24} top={10} bot={22} col={UP} filled={true}/>];
  else if(k=="3crows") body=[
    <C key="1" x={11} w={7} hi={4} lo={18} top={6} bot={14} col={DOWN} filled={true}/>,
    <C key="2" x={20} w={7} hi={10} lo={26} top={12} bot={22} col={DOWN} filled={true}/>,
    <C key="3" x={29} w={7} hi={16} lo={34} top={18} bot={30} col={DOWN} filled={true}/>];
  else if(k=="breakout") body=[
    <line key="l" x1={5} y1={14} x2={35} y2={14} stroke={NEUTRAL} strokeWidth="1" strokeDasharray="3 2"/>,
    <C key="1" x={14} w={8} hi={16} lo={32} top={20} bot={30} col={UP} filled={true}/>,
    <C key="2" x={26} w={9} hi={4} lo={22} top={8} bot={18} col={UP} filled={true}/>];
  else if(k=="breakdown") body=[
    <line key="l" x1={5} y1={26} x2={35} y2={26} stroke={NEUTRAL} strokeWidth="1" strokeDasharray="3 2"/>,
    <C key="1" x={14} w={8} hi={8} lo={24} top={10} bot={20} col={DOWN} filled={true}/>,
    <C key="2" x={26} w={9} hi={18} lo={36} top={22} bot={32} col={DOWN} filled={true}/>];
  else body=[<C key="1" x={20} w={13} hi={7} lo={33} top={19} bot={21} col={DOJI} filled={true}/>];

  return (
    <svg width={s} height={s} viewBox="0 0 40 40" style={props.style||{}}>
      {body}
    </svg>
  );
}
