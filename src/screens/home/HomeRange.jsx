import { useTheme } from "../../theme/ThemeProvider";
import { t, termHelp, useLang } from "../../i18n/translations";
import ProvenanceBadge from "../../components/ProvenanceBadge";
import HomeCard from "./HomeCard";

// BreakoutPro - HomeRange.jsx
// Home summary of Range Intelligence: where NIFTY sits inside today's real
// high-low range, plus its zone and state. The numbers and the zone/state
// rules are exactly the ones the four Home layouts used before (moved here
// so all layouts share one copy); nothing is recalculated differently and
// no value is invented. Without a verified range it says so.
// Rules: no backtick, no triple-equals, ASCII only.
export default function HomeRange(props){
  useLang();
  var theme = useTheme();
  var c = theme.c;
  var mm = props.mm || {};
  var nifty = mm.data && mm.data.indices && mm.data.indices.NIFTY;
  var hasRange = nifty && nifty.ltp!=null && nifty.high!=null && nifty.low!=null && nifty.high>nifty.low;
  var open = props.onOpen;
  if(!hasRange){
    return (
      <HomeCard testId="home-range" title={t("home.range_title")} badge={<ProvenanceBadge type="unavailable"/>} action={t("home.view")} onAction={open} onOpen={open} dense={props.dense}>
        <div style={{fontSize:12,color:c.text2,lineHeight:1.4}}>{t("home.range_none")}</div>
      </HomeCard>
    );
  }
  var width = nifty.high - nifty.low;
  var rawPosPct = ((nifty.ltp - nifty.low) / width) * 100;
  var posPct = Math.round(Math.max(0, Math.min(100, rawPosPct)));
  var zone = posPct<=20?"Near Low":(posPct<=40?"Lower Range":(posPct<=60?"Mid Range":(posPct<=80?"Upper Range":"Near High")));
  var state = posPct>=80?"Breakout Watch":(posPct<=20?"Breakdown Watch":"Balanced");
  var stateColor = state=="Breakout Watch"?c.up:(state=="Breakdown Watch"?c.down:c.text1);
  var cap = { fontSize:10, color:c.text3, lineHeight:1.3, minWidth:0, overflowWrap:"anywhere" };
  var num = { fontSize:12, fontWeight:700, color:c.text2, fontVariantNumeric:"tabular-nums" };
  return (
    <HomeCard testId="home-range" title={t("home.range_title")} badge={<ProvenanceBadge type="calculated"/>} action={t("home.view")} onAction={open} onOpen={open} dense={props.dense}>
      <div style={{margin:"auto 0"}}>
      <div style={{display:"flex",alignItems:"baseline",flexWrap:"wrap",gap:"2px 8px"}}>
        <span style={{fontSize:11,fontWeight:700,color:c.text2}}>NIFTY 50</span>
        <span style={{fontSize:17,fontWeight:900,color:c.text1,fontVariantNumeric:"tabular-nums"}}>{nifty.ltp.toLocaleString("en-IN")}</span>
        <span style={{fontSize:10,color:c.text3}} title={termHelp("CMP")}>CMP</span>
      </div>
      <div style={{position:"relative",height:14,margin:"6px 0 4px"}} role="img" aria-label={posPct + "%"}>
        <div style={{position:"absolute",top:6,left:0,right:0,height:3,borderRadius:2,background:c.border}}></div>
        <div style={{position:"absolute",top:2,left:"calc("+posPct+"% - 5px)",width:11,height:11,borderRadius:"50%",background:c.blue,border:"2px solid "+c.card,boxSizing:"border-box"}}></div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8}}>
        <span style={num}>{nifty.low.toLocaleString("en-IN")}</span>
        <span style={{fontSize:12,fontWeight:800,color:stateColor,textAlign:"center",minWidth:0,overflowWrap:"anywhere"}}>{posPct}% {"\u00b7"} {t("home.zone."+zone, zone)} {"\u00b7"} {t("home.state."+state, state)}</span>
        <span style={num}>{nifty.high.toLocaleString("en-IN")}</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",gap:8,marginTop:2}}>
        <span style={cap}>{t("home.support_bd")}</span>
        <span style={Object.assign({}, cap, {textAlign:"right"})}>{t("home.res_bo")}</span>
      </div>
      </div>
    </HomeCard>
  );
}
