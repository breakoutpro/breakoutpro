import { useTheme } from "../../theme/ThemeProvider";
import { useResponsive } from "../../hooks/useResponsive";
import { useHomeData } from "./hooks/useHomeData";
import { getHomeTierConfig } from "../../utils/homeTierDensity";
import ProvenanceBadge from "../../components/ProvenanceBadge";
import { t, termHelp, useLang } from "../../i18n/translations";
import NextMoveHomeCard from "../NextMoveHomeCard";
import HomeCard from "./HomeCard";
import HomeRange from "./HomeRange";
import HomeBreakouts from "./HomeBreakouts";
import HomeSmartAlerts from "./HomeSmartAlerts";

// BreakoutPro - EquityHomeDesktop.jsx
// The Home dashboard: SIX core active-trader features (AI Market Mood,
// Range Intelligence, Options Intelligence, Market News, Live Breakouts,
// Market Alerts) in a compact 3x2 grid. Market Breadth, FII/DII Flow,
// Latest Alerts, Global Markets and Key Levels are intentionally NOT on
// Home anymore - they were secondary information competing with the core
// six for space; their own screens/routes are untouched, only their Home
// presence was removed. Live Breakouts (real /api/scanner-data) and
// Market Alerts (honest unavailable state, no fabricated alerts) used to
// live outside the grid (a horizontal strip / a 5-up secondary row) - both
// are now first-class cards inside the same 3x2 grid as the other four.
// Every displayed metric renders through ProvenanceBadge - the mandatory
// provenance rule (LIVE/CALCULATED/UNAVAILABLE, never fabricated).
// Rules: no backtick, no triple-equals, ASCII only.
export default function EquityHomeDesktop(props){
  useLang();
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  var responsive = useResponsive();
  var tierCfg = getHomeTierConfig(responsive.breakpoint); // Responsive Blueprint v1.0 - single source for this tier's layout values
  var BG=theme.c.bg, CARD2=theme.c.card2, BD=theme.c.border, BD2=theme.c.border2;
  var BLUE=theme.c.blue;
  var UP=theme.c.up, DOWN=theme.c.down, WARN=theme.c.warn;
  // Dedicated sentiment colors (Bearish/Sideways/Bullish) - separate from
  // theme.c.up/down/warn, which are used elsewhere for price ticks and
  // general warnings, not sentiment specifically.
  var SENT_GREEN=theme.c.bull, SENT_RED=theme.c.bear, SENT_YELLOW=theme.c.neutral;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var setTab = props.setTab || function(){};
  var data = useHomeData();
  var mm = data.mm;

  return (
    <div style={{background:BG,width:"100%",boxSizing:"border-box",fontFamily:"'Inter',Arial,sans-serif",color:T1,overflowX:"hidden",display:"flex",flexDirection:"column"}}>

      {/* MAIN AREA - center workspace */}
      <div style={{flex:1,display:"flex",minHeight:0,width:"100%"}}>

        {/* CENTER WORKSPACE - Next Move Intelligence (left, primary) with Range
            Intelligence, Live Breakouts and Market Alerts stacked on the right. Each card's detailed analysis lives
            on its own dedicated page - Home shows a real-data summary
            only, never a duplicate of the full page. */}
        <div style={{flex:1,minWidth:0,width:"100%",maxWidth:1280,margin:"0 auto",padding:"12px 20px 8px",boxSizing:"border-box"}}>

          {/* Two balanced columns, both rows stretch to equal height.
              Row 1: Next Move Intelligence | Range Intelligence.
              Row 2: Live Breakouts | Smart Market Alerts. */}
          <div style={{display:"grid",gridTemplateColumns:"minmax(0, 1.25fr) minmax(0, 1fr)",gridAutoRows:"auto",gap:12,alignItems:"stretch"}}>

          <HomeCard testId="home-next-move" title={t("home.mood_title")} badge={<ProvenanceBadge type="calculated"/>} action={t("home.view")} onAction={function(){setTab("marketmood");}} onOpen={function(){setTab("marketmood");}}>
            <NextMoveHomeCard mm={data.mm} fs={tierCfg.secondaryText} wide={true}/>
          </HomeCard>

          <HomeRange mm={data.mm} onOpen={function(){setTab("rangeintel");}}/>

          <HomeBreakouts onOpen={function(){setTab("breakoutscan");}}/>

          <HomeSmartAlerts onOpen={function(){setTab("alerts");}}/>

          </div>

          {/* QUICK ACTIONS - connects to existing real routes only */}
          <div style={{padding:"12px 0 8px",display:"flex",gap:12}}>
            {[[t("home.qa.scan"),"breakoutscan"],[t("home.qa.learn"),"learn"],[t("home.qa.alert"),"alerts"]].map(function(a){
              return (
                <button key={a[1]} onClick={function(){setTab(a[1]);}} style={{flex:1,background:"transparent",border:"1px solid "+BD,borderRadius:8,minHeight:40,padding:"8px 12px",cursor:"pointer",fontSize:tierCfg.label,fontWeight:700,color:T1}}>{a[0]}</button>
              );
            })}
          </div>

        </div>

      </div>

      {/* FOOTER DISCLAIMER */}
      <div style={{padding:"12px 20px",borderTop:"1px solid "+BD,marginTop:8}}>
        <div style={{fontSize:10,color:WARN,textAlign:"center"}}>{t("c.edu_footer")}</div>
      </div>
    </div>
  );
}
