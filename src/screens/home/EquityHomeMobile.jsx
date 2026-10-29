import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import MarketBadge from "./MarketBadge";
import { t, useLang } from "../../i18n/translations";
import HomeHub from "./HomeHub";
import HeaderAuth from "../../components/HeaderAuth";

// BreakoutPro - EquityHomeMobile.jsx
// Mobile Home: existing header, then the shared HomeHub dashboard (it carries the index cards and strips)
// (hero + six feature cards in 2 columns). useHomeData() stays only to feed the
// ticker with the shared market payload.
// Rules: no backtick, no triple-equals, ASCII.

export default function EquityHomeMobile(props){
  useLang();
  var theme = useTheme();
  var BG=theme.c.bg, BD=theme.c.border;
  var BLUE=theme.c.blue, PROBLUE=theme.c.blue;
  var T1=theme.c.text1, T2=theme.c.text2;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;

  return (
    <div style={{background:BG,minHeight:"100vh",width:"100%",boxSizing:"border-box",overflowX:"hidden",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:16,color:T1}}>

      {/* 1. HEADER */}
      <div style={{width:"100%",boxSizing:"border-box",background:BG,borderBottom:"1px solid "+BD,padding:"10px 12px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,flex:1}}>
            {props.user ? (<button aria-label={t("aria.menu")} onClick={function(){ if(props.onMenu){props.onMenu();} else {setTab("more");} }} style={{background:"none",border:"none",padding:2,cursor:"pointer",flexShrink:0,minWidth:36,minHeight:36}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>) : null}
            <div style={{fontSize:18,fontWeight:900,letterSpacing:-0.5,whiteSpace:"nowrap",flexShrink:0}}>
              <span style={{color:T1}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span>
            </div>
            <div style={{minWidth:0,overflow:"hidden"}}><MarketBadge/></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          {props.user ? (
          <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
            <button aria-label={t("aria.search")} onClick={function(){setTab("search");}} style={{background:"none",border:"none",padding:2,cursor:"pointer",minWidth:36,minHeight:36}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <button aria-label={t("aria.alerts")} onClick={function(){setTab("alerts");}} style={{background:"none",border:"none",padding:2,cursor:"pointer",position:"relative",minWidth:36,minHeight:36}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <div style={{position:"absolute",top:0,right:0,width:5,height:5,borderRadius:"50%",background:BLUE,border:"1px solid "+BG}}/>
            </button>
          </div>
          ) : null}
          <HeaderAuth compact={true} user={props.user} onAuth={props.onAuth} onLogout={props.onLogout} setTab={setTab}/>
          </div>
        </div>
      </div>

      <HomeHub size="sm" mm={mm} setTab={setTab}/>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0}to{opacity:1}}"}</style>
    </div>
  );
}
