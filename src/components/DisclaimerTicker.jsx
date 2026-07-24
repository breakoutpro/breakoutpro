import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - DisclaimerTicker.jsx
// A single, consistent, elegant horizontally-scrolling disclaimer shown
// across the app (mounted once at the shell level, not duplicated per
// screen). Pure CSS animation - no JS timers, no re-renders, smooth on any
// device. Rules: no backtick, no triple-equals, ASCII.

var DISCLAIMER_TEXT = "Breakout Pro provides educational market analysis only. We do not provide investment advice or guaranteed returns. All information is for learning and research purposes only. Please consult a SEBI-registered investment adviser before making investment decisions.";

export default function DisclaimerTicker(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG = theme.c.card2, BD = theme.c.border, T3 = theme.c.text3;

  return (
    <div style={{background:BG,borderTop:"1px solid "+BD,padding:"6px 0",overflow:"hidden",whiteSpace:"nowrap",flexShrink:0}}>
      <style>{"@keyframes bpTickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }"}</style>
      <div style={{display:"inline-block",animation:"bpTickerScroll 38s linear infinite"}}>
        <span style={{fontSize:11,color:T3,paddingRight:60}}>{DISCLAIMER_TEXT}</span>
        <span style={{fontSize:11,color:T3,paddingRight:60}}>{DISCLAIMER_TEXT}</span>
      </div>
    </div>
  );
}
