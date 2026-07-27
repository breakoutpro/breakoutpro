import { useTheme } from "../../theme/ThemeProvider";

// BreakoutPro - MarketBadge.jsx
// Auto market-status badge: Open / Pre-Market / Post-Market / Closed.
// Shared across every Home layout (Mobile/Tablet/Laptop/Desktop) since this
// is a small, identical status atom - not a layout container.
// Rules: no backtick, no triple-equals, ASCII.

export default function MarketBadge(){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BD = theme.c.border, BLUE = theme.c.blue;
  var UP = theme.c.up, DOWN = theme.c.down;

  var d=new Date();
  var mins=d.getHours()*60+d.getMinutes();
  var day=d.getDay(); // 0 Sun, 6 Sat
  var st;
  if(day==0||day==6){ st={label:"Closed",col:DOWN,dot:DOWN}; }
  else if(mins>=9*60+15&&mins<15*60+30){ st={label:"Open",col:UP,dot:UP}; }
  else if(mins>=9*60&&mins<9*60+15){ st={label:"Pre-Market",col:BLUE,dot:BLUE}; }
  else if(mins>=15*60+30&&mins<16*60){ st={label:"Post-Market",col:BLUE,dot:BLUE}; }
  else { st={label:"Closed",col:DOWN,dot:DOWN}; }
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.05)",border:"1px solid "+BD,borderRadius:20,padding:"3px 7px",whiteSpace:"nowrap"}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:st.dot,animation:st.label=="Open"?"pulse-dot 1.4s infinite":"none",flexShrink:0}}></span>
      <span style={{fontSize:10,fontWeight:800,color:st.col}}>{st.label}</span>
    </span>
  );
}
