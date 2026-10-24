import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";

// BreakoutPro - MarketBadge.jsx
// Auto market-status badge: Open / Pre-Market / Post-Market / Closed.
// Shared across every Home layout (Mobile/Tablet/Laptop/Desktop) since this
// is a small, identical status atom - not a layout container.
// Rules: no backtick, no triple-equals, ASCII.

export default function MarketBadge(){
  useLang();
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BD = theme.c.border, BLUE = theme.c.blue;
  var T3 = theme.c.text3, NEUT = theme.c.neutral;   // session state is not a price move: no red/green

  var d=new Date();
  var mins=d.getHours()*60+d.getMinutes();
  var day=d.getDay(); // 0 Sun, 6 Sat
  var st;
  if(day==0||day==6){ st={label:"Closed",col:T3,dot:T3}; }
  else if(mins>=9*60+15&&mins<15*60+30){ st={label:"Open",col:BLUE,dot:BLUE}; }
  else if(mins>=9*60&&mins<9*60+15){ st={label:"Pre-Market",col:NEUT,dot:NEUT}; }
  else if(mins>=15*60+30&&mins<16*60){ st={label:"Post-Market",col:NEUT,dot:NEUT}; }
  else { st={label:"Closed",col:T3,dot:T3}; }
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:theme.c.card2,border:"1px solid "+BD,borderRadius:20,padding:"3px 7px",whiteSpace:"nowrap"}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:st.dot,animation:st.label=="Open"?"pulse-dot 1.4s infinite":"none",flexShrink:0}}></span>
      <span style={{fontSize:10,fontWeight:800,color:st.col}}>{t(st.label=="Open"?"mkt.badge_open":(st.label=="Pre-Market"?"mkt.badge_pre":(st.label=="Post-Market"?"mkt.badge_post":"mkt.closed")), st.label)}</span>
    </span>
  );
}
