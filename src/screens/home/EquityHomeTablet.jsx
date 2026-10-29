import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import { formatMarketPrice } from "../../utils/formatMarketPrice";
import { DEMO_MOOD, DEMO_AI } from "../MarketMoodDemoData";
import MarketBadge from "./MarketBadge";
import { SkeletonCard } from "../../components/Skeleton";
import { t, termHelp, useLang } from "../../i18n/translations";
import HomeHub from "./HomeHub";
import HeaderAuth from "../../components/HeaderAuth";

// BreakoutPro - EquityHomeTablet.jsx
// Tablet Home layout - independent from Mobile and from Laptop/Desktop.
// Initially reuses the same dense-dashboard approach as Desktop as a
// starting point; this file can be re-tuned for tablet specifically later
// without touching any other device's layout.
// Rules: no backtick, no triple-equals, ASCII.

export default function EquityHomeTablet(props){
  useLang();
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG=theme.c.bg, CARD=theme.c.card, BD=theme.c.border;
  var BLUE=theme.c.blue, PROBLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down, WARN=theme.c.warn;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:16,color:T1,overflowX:"hidden"}}>
      <div style={{background:BG,borderBottom:"1px solid "+BD,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:22,fontWeight:900,letterSpacing:-0.5}}>
            <span style={{color:T1}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span>
          </div>
          <MarketBadge/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button onClick={function(){setTab("search");}} style={{background:"none",border:"none",cursor:"pointer"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",cursor:"pointer"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <HeaderAuth user={props.user} onAuth={props.onAuth} onLogout={props.onLogout} setTab={setTab}/>
        </div>
      </div>

      <HomeHub size="lg" mm={mm} setTab={setTab}/>
      <div style={{height:8}}></div>
      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}"}</style>
    </div>
  );
}
