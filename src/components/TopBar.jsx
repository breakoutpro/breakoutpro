import { useTheme } from "../theme/ThemeProvider";

var BG="#050505",BD="#1B2330";
var CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function TopBar(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks
  // above so this bar actually switches with the selected theme.
  var BG = theme.c.bg, BD = theme.c.border, GOLD = theme.c.gold, T1 = theme.c.text1;
  var onMenu=props.onMenu||function(){};
  var setTab=props.setTab||function(){};

  return (
    <div style={{background:BG,borderBottom:"1px solid "+BD,padding:"12px 14px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={onMenu} style={{background:"none",border:"none",padding:4,cursor:"pointer",flexShrink:0}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div style={{fontSize:22,fontWeight:900,letterSpacing:-0.5}}>
            <span style={{color:T1}}>Breakout</span><span style={{color:CYAN}}>Pro</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
          <button onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",padding:3,cursor:"pointer",position:"relative"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <div style={{position:"absolute",top:1,right:1,width:5,height:5,borderRadius:"50%",background:GOLD,border:"1px solid "+BG}}/>
          </button>
          <button onClick={function(){setTab("profile");}} style={{background:"none",border:"none",padding:3,cursor:"pointer"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
