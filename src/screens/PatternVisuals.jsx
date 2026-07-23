// BreakoutPro - PatternVisuals.jsx
// Animated SVG previews for candlestick + chart patterns. CSS keyframe animation.
// Pure black, green bullish, red bearish. Rules: no backtick, no triple-equals, ASCII.

var UP="#22C55E",DOWN="#EF4444",T2="#A0A7B4",T3="#5B6472",WICK="#6B7280";

// Inject one-time CSS animations.
function ensureCSS(){
  if(typeof document=="undefined") return;
  if(document.getElementById("pat-css")) return;
  var el=document.createElement("style");
  el.id="pat-css";
  el.textContent=""
    + "@keyframes pat-rise{0%{transform:translateY(6px);opacity:0}100%{transform:translateY(0);opacity:1}}"
    + "@keyframes pat-draw{0%{stroke-dashoffset:120}100%{stroke-dashoffset:0}}"
    + ".pat-c{animation:pat-rise 0.5s ease both}"
    + ".pat-line{stroke-dasharray:120;animation:pat-draw 1.1s ease both}";
  document.head.appendChild(el);
}

// One candle. x center, body top/bottom y, wick top/bottom y, color.
function Candle(props){
  var x=props.x,c=props.up?UP:DOWN,w=props.w||7,delay=props.delay||0;
  return (
    <g className="pat-c" style={{animationDelay:delay+"s"}}>
      <line x1={x} y1={props.wt} x2={x} y2={props.wb} stroke={WICK} strokeWidth="1"/>
      <rect x={x-w/2} y={props.bt} width={w} height={Math.max(2,props.bb-props.bt)} fill={c} rx="1"/>
    </g>
  );
}

// Candlestick pattern shapes by id.
function candleShape(id){
  switch(id){
    case "bull-engulf": return [{x:14,up:false,wt:8,wb:34,bt:14,bb:28},{x:30,up:true,wt:6,wb:38,bt:10,bb:34,w:11}];
    case "bear-engulf": return [{x:14,up:true,wt:8,wb:34,bt:14,bb:28},{x:30,up:false,wt:6,wb:38,bt:10,bb:34,w:11}];
    case "hammer":      return [{x:22,up:true,wt:12,wb:40,bt:12,bb:20,w:9}];
    case "shooting":    return [{x:22,up:false,wt:6,wb:34,bt:26,bb:34,w:9}];
    case "doji":        return [{x:22,up:true,wt:8,wb:38,bt:22,bb:24,w:11}];
    case "morning":     return [{x:11,up:false,wt:8,wb:30,bt:10,bb:26},{x:22,up:true,wt:28,wb:38,bt:30,bb:34,w:6},{x:33,up:true,wt:6,wb:30,bt:8,bb:24}];
    case "evening":     return [{x:11,up:true,wt:8,wb:30,bt:10,bb:26},{x:22,up:false,wt:6,wb:16,bt:8,bb:12,w:6},{x:33,up:false,wt:14,wb:38,bt:18,bb:34}];
    default:            return [{x:14,up:false,wt:8,wb:34,bt:14,bb:28},{x:30,up:true,wt:6,wb:38,bt:10,bb:34,w:11}];
  }
}

// Chart pattern line paths by id.
function chartPath(id){
  switch(id){
    case "cup-handle":  return {d:"M4,12 C10,40 34,40 40,12 L40,12 L48,18 L52,14", up:true};
    case "double-top":  return {d:"M4,34 L14,12 L24,26 L34,12 L44,34", up:false};
    case "double-bot":  return {d:"M4,12 L14,34 L24,20 L34,34 L44,12", up:true};
    case "hns":         return {d:"M4,30 L12,20 L18,30 L26,8 L34,30 L40,20 L48,30", up:false};
    case "inv-hns":     return {d:"M4,16 L12,26 L18,16 L26,38 L34,16 L40,26 L48,16", up:true};
    case "asc-tri":     return {d:"M4,12 L48,12 M4,34 L48,16", up:true};
    case "desc-tri":    return {d:"M4,34 L48,34 M4,12 L48,30", up:false};
    case "fall-wedge":  return {d:"M4,10 L48,22 M4,30 L48,26", up:true};
    case "rise-wedge":  return {d:"M4,26 L48,22 M4,38 L48,12", up:false};
    case "flag":        return {d:"M4,34 L18,10 M20,14 L40,22 M22,20 L42,28", up:true};
    case "pennant":     return {d:"M4,34 L16,12 M18,12 L42,20 M18,28 L42,22", up:true};
    default:            return {d:"M4,30 L48,14", up:true};
  }
}

export function PatternMini(props){
  ensureCSS();
  var id=props.id||"bull-engulf";
  var size=props.size||56;
  var isCandle=CANDLE_IDS.indexOf(id)!=-1;
  if(isCandle){
    var cs=candleShape(id);
    return (
      <svg width={size} height={size} viewBox="0 0 44 46" style={{display:"block"}}>
        {cs.map(function(c,i){ return <Candle key={i} x={c.x} up={c.up} wt={c.wt} wb={c.wb} bt={c.bt} bb={c.bb} w={c.w} delay={i*0.12}/>; })}
      </svg>
    );
  }
  var p=chartPath(id);
  return (
    <svg width={size} height={size} viewBox="0 0 52 46" style={{display:"block"}}>
      <path className="pat-line" d={p.d} fill="none" stroke={p.up?UP:DOWN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export var CANDLE_IDS=["bull-engulf","bear-engulf","hammer","shooting","doji","morning","evening"];

