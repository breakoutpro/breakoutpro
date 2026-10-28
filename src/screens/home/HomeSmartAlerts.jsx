import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";
import HomeCard from "./HomeCard";

// BreakoutPro - HomeSmartAlerts.jsx
// Entry point to the existing Smart Alerts screen (tab "alerts"), where alerts
// are created and managed. Home itself shows no alert count, list or status:
// no verified alert result is fetched here, so nothing is displayed that is
// not known.
// Rules: no backtick, no triple-equals, ASCII only.
export default function HomeSmartAlerts(props){
  useLang();
  var theme = useTheme();
  var c = theme.c;
  var go = props.onOpen;
  return (
    <HomeCard testId="home-smart-alerts" title={t("home.market_alerts")} onOpen={go} dense={props.dense}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap",margin:"auto 0"}}>
        <div style={{fontSize:12,color:c.text2,lineHeight:1.4,flex:"1 1 180px",minWidth:0}}>{t("home.alerts_desc")}</div>
        <button type="button" onClick={function(e){ e.stopPropagation(); if(go) go(); }}
          style={{background:c.accent,color:c.onAccent,border:"none",borderRadius:8,minHeight:40,padding:"0 16px",cursor:"pointer",fontSize:12,fontWeight:800,flexShrink:0}}>{t("home.qa.alert")}</button>
      </div>
    </HomeCard>
  );
}
