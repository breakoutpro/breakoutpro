import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - SettingsAlerts.jsx
// Alert Types section for Settings (breakout, breakdown, pattern, volume, vwap, rsi).
// Rules: no backtick, no triple-equals, ASCII only.

var CB="#0F1629",BD="#1E2D4A";
var G="#00C853",T1="#FFFFFF",T2="#8899BB";

function Toggle(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue;

  return (
    <div onClick={props.onChange} style={{width:44,height:24,borderRadius:12,background:props.value?BLUE:"rgba(255,255,255,0.1)",border:"1px solid "+(props.value?BLUE:BD),cursor:"pointer",position:"relative",flexShrink:0}}>
      <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:props.value?22:2,boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}></div>
    </div>
  );
}

function Row(props){
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",borderBottom:"1px solid "+BD}}>
      <div style={{width:36,height:36,borderRadius:10,background:props.bg,border:"1px solid "+props.bd,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:16}} dangerouslySetInnerHTML={{__html:props.icon}}/>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:600,color:T1}}>{props.label}</div>
        <div style={{fontSize:9,color:T2,marginTop:2}}>{props.sub}</div>
      </div>
      <Toggle value={props.value} onChange={props.onChange}/>
    </div>
  );
}

var TYPES=[
  {key:"breakoutAlert", icon:"&#9650;",   label:"Breakout Alerts", sub:"Price breaks above resistance", bg:"rgba(0,200,83,0.1)",  bd:"rgba(0,200,83,0.2)"},
  {key:"breakdownAlert",icon:"&#9660;",   label:"Breakdown Alerts",sub:"Price breaks below support",    bg:"rgba(239,68,68,0.1)", bd:"rgba(239,68,68,0.2)"},
  {key:"patternAlert",  icon:"&#128208;", label:"Pattern Alerts",  sub:"Doji, Hammer, Engulfing etc",   bg:"rgba(245,158,11,0.1)",bd:"rgba(245,158,11,0.2)"},
  {key:"volumeAlert",   icon:"&#128202;", label:"Volume Spike",    sub:"2x+ average volume detected",   bg:"rgba(59,130,246,0.1)",bd:"rgba(59,130,246,0.2)"},
  {key:"vwapAlert",     icon:"&#128201;", label:"VWAP Cross Alert",sub:"Price crosses VWAP level",      bg:"rgba(139,92,246,0.1)",bd:"rgba(139,92,246,0.2)"},
  {key:"rsiAlert",      icon:"&#128293;", label:"RSI Extreme Alert",sub:"RSI above 70 or below 30",     bg:"rgba(249,115,22,0.1)",bd:"rgba(249,115,22,0.2)"},
];

export default function SettingsAlerts(props){
  var st=props.st||{};
  var toggle=props.toggle||function(){};
  return (
    <div style={{background:CB,border:"1px solid "+BD,borderRadius:14,margin:"0 14px",overflow:"hidden"}}>
      {TYPES.map(function(t){
        return <Row key={t.key} icon={t.icon} label={t.label} sub={t.sub} bg={t.bg} bd={t.bd} value={st[t.key]} onChange={function(){toggle(t.key);}}/>;
      })}
    </div>
  );
}
