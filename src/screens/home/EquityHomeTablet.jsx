import { useTheme } from "../../theme/ThemeProvider";
import { useHomeData } from "./hooks/useHomeData";
import { formatMarketPrice } from "../../utils/formatMarketPrice";
import { DEMO_MOOD, DEMO_AI } from "../MarketMoodDemoData";
import MarketBadge from "./MarketBadge";
import { SkeletonCard } from "../../components/Skeleton";
import { t, termHelp, useLang } from "../../i18n/translations";
import NextMoveHomeCard from "../NextMoveHomeCard";
import ProvenanceBadge from "../../components/ProvenanceBadge";
import HomeCard from "./HomeCard";
import HomeRange from "./HomeRange";
import HomeBreakouts from "./HomeBreakouts";
import HomeSmartAlerts from "./HomeSmartAlerts";
import MarketTicker from "../../components/MarketTicker";

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
        </div>
      </div>
      <MarketTicker data={mm && mm.data} networkStatus={mm && mm.networkStatus} status={mm && mm.status} onNavigate={function(r){ if(props.setTab) props.setTab(r); }}/>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:12,padding:"12px 16px 0",minWidth:0,boxSizing:"border-box",alignItems:"stretch"}}>

        <HomeCard testId="home-next-move" title={t("home.mood_title")} badge={<ProvenanceBadge type="calculated"/>} action={t("home.view")} onAction={function(){setTab("marketmood");}} onOpen={function(){setTab("marketmood");}}>
          {mm.status=="loading" && !mm.data ? (
            <SkeletonCard height={90}/>
          ) : <NextMoveHomeCard mm={mm} fs={12} wide={true}/>}
        </HomeCard>

        <HomeRange mm={mm} onOpen={function(){setTab("rangeintel");}}/>

        <HomeBreakouts onOpen={function(){setTab("breakoutscan");}}/>

        <HomeSmartAlerts onOpen={function(){setTab("alerts");}}/>

        <HomeCard title={t("home.snapshot")}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,width:"100%",boxSizing:"border-box"}}>
            {data.spineRows.map(function(r){
              var color = r.dir=="up"?UP:(r.dir=="down"?DOWN:T2);
              return (
                <div key={r.key} style={{minWidth:0,background:theme.c.card2,border:"1px solid "+BD,borderRadius:8,padding:8}}>
                  <div style={{fontSize:10,color:T2,fontWeight:600}}>{r.label}</div>
                  {r.live ? (
                    <div>
                      <div style={{fontSize:13,fontWeight:800,color:T1,fontFamily:"monospace"}}>{formatMarketPrice(r.ltp)}</div>
                      <div style={{fontSize:11,fontWeight:700,color:color}}>{r.dir=="up"?"+":""}{r.chgPct}%</div>
                    </div>
                  ) : <div style={{fontSize:11,color:T2}}>{t("c.data_unavailable")}</div>}
                </div>
              );
            })}
          </div>
        </HomeCard>

      </div>
      <div style={{height:8}}></div>
      <style>{"@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}"}</style>
    </div>
  );
}
