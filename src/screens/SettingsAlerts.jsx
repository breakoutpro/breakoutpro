import { useTheme } from "../theme/ThemeProvider";
import { t, useLang } from "../i18n/translations";
import { useDensity } from "../theme/density";
// BreakoutPro - SettingsAlerts.jsx
// Alert Types section for Settings (breakout, breakdown, pattern, volume, vwap, rsi).
// Rules: no backtick, no triple-equals, ASCII only.

var CB="#0F1629",BD="#1E2D4A";
var G="#00C853",T1="#FFFFFF",T2="#8899BB";

function Toggle(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BLUE = theme.c.blue;

  return (
    <div onClick={props.onChange} style={{width:44,height:24,borderRadius:12,background:props.value?BLUE:theme.c.border,border:"1px solid "+(props.value?BLUE:BD),cursor:"pointer",position:"relative",flexShrink:0}}>
      <div style={{width:18,height:18,borderRadius:"50%",background:theme.c.onAccent,position:"absolute",top:2,left:props.value?22:2,boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}></div>
    </div>
  );
}

function Row(props){
  var D = useDensity();
  var theme = useTheme();
  var BD = theme.c.border, T1 = theme.c.text1, T2 = theme.c.text2;
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:D.on?"8px 12px":"12px 16px",borderBottom:"1px solid "+BD}}>
      <div style={{width:D.on?32:36,height:D.on?32:36,borderRadius:10,background:props.bg,border:"1px solid "+props.bd,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:16,color:theme.c.text1}} dangerouslySetInnerHTML={{__html:props.icon}}/>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:600,color:T1}}>{props.label}</div>
        <div style={{fontSize:12,color:T2,marginTop:D.on?2:4}}>{props.sub}</div>
      </div>
      <Toggle value={props.value} onChange={props.onChange}/>
    </div>
  );
}

var TYPES=[
  {key:"breakoutAlert", k:"breakout", icon:"&#9650;",   label:"Breakout Alerts", sub:"Price breaks above resistance", bg:"rgba(0,200,83,0.1)",  bd:"rgba(0,200,83,0.2)"},
  {key:"breakdownAlert",k:"breakdown", icon:"&#9660;",   label:"Breakdown Alerts",sub:"Price breaks below support",    bg:"rgba(239,68,68,0.1)", bd:"rgba(239,68,68,0.2)"},
  {key:"patternAlert",  k:"pattern", icon:"&#128208;", label:"Pattern Alerts",  sub:"Doji, Hammer, Engulfing etc",   bg:"rgba(37,99,235,0.1)",bd:"rgba(37,99,235,0.2)"},
  {key:"volumeAlert",   k:"volume", icon:"&#128202;", label:"Volume Spike",    sub:"2x+ average volume detected",   bg:"rgba(59,130,246,0.1)",bd:"rgba(59,130,246,0.2)"},
  {key:"vwapAlert",     k:"vwap", icon:"&#128201;", label:"VWAP Cross Alert",sub:"Price crosses VWAP level",      bg:"rgba(139,92,246,0.1)",bd:"rgba(139,92,246,0.2)"},
  {key:"rsiAlert",      k:"rsi", icon:"&#128293;", label:"RSI Extreme Alert",sub:"RSI above 70 or below 30",     bg:"rgba(249,115,22,0.1)",bd:"rgba(249,115,22,0.2)"},
];

export default function SettingsAlerts(props){
  useLang();
  var theme = useTheme();
  var st=props.st||{};
  var toggle=props.toggle||function(){};
  return (
    <div style={{background:theme.c.card,border:"1px solid "+theme.c.border,borderRadius:16,margin:props.flush?0:"0 14px",overflow:"hidden"}}>
      {TYPES.map(function(ty){
        return <Row key={ty.key} icon={ty.icon} label={t("set.t."+ty.k, ty.label)} sub={t("set.t."+ty.k+"_sub", ty.sub)} bg={ty.bg} bd={ty.bd} value={st[ty.key]} onChange={function(){toggle(ty.key);}}/>;
      })}
    </div>
  );
}
