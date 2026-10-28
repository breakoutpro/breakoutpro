import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import MarketBadge from "./MarketBadge";
import { t, useLang } from "../../i18n/translations";
import NextMoveHomeCard from "../NextMoveHomeCard";
import MarketTicker from "../../components/MarketTicker";
import ProvenanceBadge from "../../components/ProvenanceBadge";
import HomeCard from "./HomeCard";
import HomeRange from "./HomeRange";
import HomeBreakouts from "./HomeBreakouts";
import HomeSmartAlerts from "./HomeSmartAlerts";
import HomeMore from "./HomeMore";

// BreakoutPro - EquityHomeMobile.jsx
// The Mobile Home layout - UI only. All data comes from useHomeData(), the
// single shared hook also used by Tablet/Laptop/Desktop.
// Order: Next Move Intelligence, Range Intelligence, Live Breakouts, Smart
// Alerts entry, quick actions; secondary cards sit in one collapsed group.
// Rules: no backtick, no triple-equals, ASCII.

export default function EquityHomeMobile(props){
  useLang();
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var BG=theme.c.bg, BD=theme.c.border;
  var BLUE=theme.c.blue, PROBLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;

  return (
    <div style={{background:BG,minHeight:"100vh",width:"100%",boxSizing:"border-box",overflowX:"hidden",fontFamily:"'Inter',Arial,sans-serif",paddingBottom:16,color:T1}}>

      {/* 1. HEADER */}
      <div style={{width:"100%",boxSizing:"border-box",background:BG,borderBottom:"1px solid "+BD,padding:"10px 12px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,flex:1}}>
            <button aria-label={t("aria.menu")} onClick={function(){ if(props.onMenu){props.onMenu();} else {setTab("more");} }} style={{background:"none",border:"none",padding:2,cursor:"pointer",flexShrink:0,minWidth:36,minHeight:36}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div style={{fontSize:18,fontWeight:900,letterSpacing:-0.5,whiteSpace:"nowrap",flexShrink:0}}>
              <span style={{color:T1}}>Breakout</span><span style={{color:PROBLUE}}>Pro</span>
            </div>
            <div style={{minWidth:0,overflow:"hidden"}}><MarketBadge/></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
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
        </div>
      </div>
      <MarketTicker data={mm && mm.data} networkStatus={mm && mm.networkStatus} status={mm && mm.status} onNavigate={setTab}/>

      <div style={{width:"100%",boxSizing:"border-box",padding:"8px 10px 0",display:"flex",flexDirection:"column",gap:8}}>

        {/* 1. NEXT MOVE INTELLIGENCE */}
        <HomeCard dense={true} testId="home-next-move" title={t("home.mood_title")} badge={<ProvenanceBadge type="calculated"/>} action={t("home.view")} onAction={function(){setTab("marketmood");}} onOpen={function(){setTab("marketmood");}}>
          {mm.status=="loading" && !mm.data ? (
            <div style={{fontSize:11,color:T2}}>{t("c.loading")}</div>
          ) : <NextMoveHomeCard mm={mm} fs={11}/>}
        </HomeCard>

        {/* 2. RANGE INTELLIGENCE */}
        <HomeRange mm={mm} dense={true} onOpen={function(){setTab("rangeintel");}}/>

        {/* 3. LIVE BREAKOUTS */}
        <HomeBreakouts dense={true} max={3} onOpen={function(){setTab("breakoutscan");}}/>

        {/* 4. SMART MARKET ALERTS entry */}
        <HomeSmartAlerts dense={true} onOpen={function(){setTab("alerts");}}/>

        {/* QUICK ACTIONS - connects to existing real routes only */}
        <div style={{display:"flex",gap:8}}>
          {[[t("home.qa.scan"),"breakoutscan"],[t("home.qa.learn"),"learn"],[t("home.qa.alert"),"alerts"]].map(function(a){
            return (
              <button key={a[1]} onClick={function(){setTab(a[1]);}} style={{flex:1,minHeight:40,background:"transparent",border:"1px solid "+BD,borderRadius:8,padding:"6px 8px",cursor:"pointer",fontSize:11,fontWeight:700,color:T1}}>{a[0]}</button>
            );
          })}
        </div>

        {/* 5. OTHER MARKET TOOLS - collapsed. Breadth, FII/DII, Global and Key Levels keep their own data and honest unavailable states. */}
        <HomeMore>
        <HomeCard dense={true} title={t("home.breadth_title")}>
          <div style={{fontSize:11,color:T2}}>{t("home.breadth_none")}</div>
        </HomeCard>

        <HomeCard dense={true} title={t("home.fiidii_title")}>
          <div style={{fontSize:11,color:T2}}>{t("home.fiidii_none")}</div>
        </HomeCard>

        {(function(){
          var global = mm.data && mm.data.global;
          var hasGlobal = global && global.status!=="UNAVAILABLE" && global.items && global.items.length;
          if(!hasGlobal){
            return (
              <HomeCard dense={true} title={t("home.global_title")}>
                <div style={{fontSize:11,color:T2}}>{t("home.global_none")}</div>
              </HomeCard>
            );
          }
          return (
            <HomeCard dense={true} title={t("home.global_title")}>
              {global.items.slice(0,4).map(function(g,i){
                return (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderTop:i>0?"1px solid "+BD:"none"}}>
                    <span style={{fontSize:11,color:T2}}>{g.name}</span>
                    <span style={{fontSize:11,fontWeight:700,color:g.up==null?T2:(g.up?UP:DOWN)}}>{g.chgPct!=null?(g.chgPct>=0?"+":"")+g.chgPct+"%":"--"}</span>
                  </div>
                );
              })}
            </HomeCard>
          );
        })()}

        {(function(){
          var nifty = mm.data && mm.data.indices && mm.data.indices.NIFTY;
          var hasLevels = nifty && nifty.ltp!=null && nifty.high!=null && nifty.low!=null;
          if(!hasLevels) return null;
          var pivot = (nifty.high + nifty.low + nifty.ltp) / 3;
          var r1 = Math.round(((2*pivot) - nifty.low)*100)/100;
          var s1 = Math.round(((2*pivot) - nifty.high)*100)/100;
          var pivotR = Math.round(pivot*100)/100;
          return (
            <HomeCard dense={true} title={t("home.key_levels")}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                <div><div style={{fontSize:9,color:T3}}>{t("home.strong_res")}</div><div style={{fontSize:12,fontWeight:800,color:DOWN}}>{r1.toLocaleString("en-IN")}</div></div>
                <div><div style={{fontSize:9,color:T3}}>{t("home.pivot")}</div><div style={{fontSize:12,fontWeight:800,color:T1}}>{pivotR.toLocaleString("en-IN")}</div></div>
                <div><div style={{fontSize:9,color:T3}}>{t("home.strong_sup")}</div><div style={{fontSize:12,fontWeight:800,color:UP}}>{s1.toLocaleString("en-IN")}</div></div>
              </div>
            </HomeCard>
          );
        })()}

        </HomeMore>

      </div>

      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes ticker-fade{from{opacity:0}to{opacity:1}}"}</style>
    </div>
  );
}
