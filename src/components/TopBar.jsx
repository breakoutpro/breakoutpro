import { useState, useEffect } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { getMarketStatus } from "../utils/marketStatus";

var BG="#050505",BD="#1B2330";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function TopBar(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BLUE=theme.c.blue; 
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks
  // above so this bar actually switches with the selected theme.
  var BG = theme.c.bg, BD = theme.c.border, BLUE=theme.c.blue, T1 = theme.c.text1;
  var onMenu=props.onMenu||function(){};
  var setTab=props.setTab||function(){};

  var [mkt, setMkt] = useState(function(){ return getMarketStatus(); });
  useEffect(function(){
    var id = setInterval(function(){ setMkt(getMarketStatus()); }, 30000);
    return function(){ clearInterval(id); };
  }, []);

  var mktIsLive = mkt.status=="open" || mkt.status=="muhurat";
  var mktIsNeutral = mkt.status=="weekend" || mkt.status=="preopen" || mkt.status=="muhurat_upcoming" || mkt.status=="holiday" || mkt.status=="postclose";
  var mktColor = mktIsLive ? theme.c.up : (mktIsNeutral ? theme.c.text3 : theme.c.down);
  var mktBg = mktIsLive ? "rgba(0,143,57,0.1)" : (mktIsNeutral ? theme.c.card2 : "rgba(220,38,38,0.1)");

  return (
    <div style={{background:BG,borderBottom:"1px solid "+BD,padding:"12px 16px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onMenu} style={{background:"none",border:"none",padding:4,cursor:"pointer",flexShrink:0}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div style={{fontSize:22,fontWeight:900,letterSpacing:-0.5}}>
            <span style={{color:T1}}>Breakout</span><span style={{color:BLUE}}>Pro</span>
          </div>
          <div title={mkt.countdown} style={{display:"flex",alignItems:"center",gap:5,background:mktBg,borderRadius:20,padding:"4px 10px",flexShrink:0}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:mktColor,flexShrink:0}}/>
            <span style={{fontSize:12,fontWeight:700,color:mktColor,whiteSpace:"nowrap"}}>{mkt.label}</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
          <button onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",padding:4,cursor:"pointer",position:"relative"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <div style={{position:"absolute",top:1,right:1,width:5,height:5,borderRadius:"50%",background:BLUE,border:"1px solid "+BG}}/>
          </button>
          <button onClick={function(){setTab("profile");}} style={{background:"none",border:"none",padding:4,cursor:"pointer"}}>
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
