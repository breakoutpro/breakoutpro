import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { t, useLang } from "../../i18n/translations";
import ProvenanceBadge from "../../components/ProvenanceBadge";
import HomeCard from "./HomeCard";

// BreakoutPro - HomeBreakouts.jsx
// Live Breakouts summary from the existing /api/scanner-data endpoint (same
// request the Home layouts already made; no new API). Three states are kept
// apart on purpose, so a failed request is never read as "no signals":
//   loading      request in flight
//   unavailable  request failed or the endpoint said not ok
//   ok           real result list; empty list = a scan that found no match
// The data is daily candles from a delayed provider, and the card says so
// together with the scan time.
// Rules: no backtick, no triple-equals, ASCII only.
function timeText(ms){
  try{
    return new Date(ms).toLocaleTimeString("en-IN", { timeZone:"Asia/Kolkata", hour:"numeric", minute:"2-digit", hour12:true });
  }catch(e){ return ""; }
}

export default function HomeBreakouts(props){
  useLang();
  var theme = useTheme();
  var c = theme.c;
  var st = useState({ status:"loading", results:[], at:null });
  var s = st[0], setS = st[1];
  useEffect(function(){
    var cancelled = false;
    fetch("/api/scanner-data").then(function(r){ return r.json(); }).then(function(j){
      if(cancelled) return;
      if(j && j.ok!==false && j.results) setS({ status:"ok", results:j.results, at: typeof j.generatedAt=="number" ? j.generatedAt : null });
      else setS({ status:"unavailable", results:[], at:null });
    }).catch(function(){ if(!cancelled) setS({ status:"unavailable", results:[], at:null }); });
    return function(){ cancelled = true; };
  }, []);
  var open = props.onOpen;
  var rows = s.status=="ok" ? s.results.slice(0, props.max || 4) : [];
  var badge = <ProvenanceBadge type={s.status=="ok" ? "calculated" : "unavailable"}/>;
  var msg = { fontSize:12, color:c.text2, lineHeight:1.4 };
  return (
    <HomeCard testId="home-breakouts" title={t("home.live_breakouts")} badge={badge} action={t("home.view")} onAction={open} onOpen={open} dense={props.dense}>
      {s.status=="loading" ? <div style={msg}>{t("home.scanning")}</div> : null}
      {s.status=="unavailable" ? <div data-testid="home-breakouts-unavail" style={Object.assign({}, msg, {color:c.warn,fontWeight:600})}>{t("home.breakouts_unavail")}</div> : null}
      {s.status=="ok" && !rows.length ? <div data-testid="home-breakouts-none" style={msg}>{t("home.breakouts_none")}</div> : null}
      {rows.map(function(r, i){
        var tagLabel = r.tags.indexOf("breakout")>=0?"Breakout":(r.tags.indexOf("breakdown")>=0?"Breakdown":"Vol Spike");
        var tagColor = r.tags.indexOf("breakout")>=0?c.up:(r.tags.indexOf("breakdown")>=0?c.down:c.warn);
        return (
          <div key={r.sym} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"6px 0",borderTop:i>0?"1px solid "+c.border2:"none"}}>
            <span style={{fontSize:13,fontWeight:800,color:c.text1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis"}}>{r.sym}</span>
            <span style={{fontSize:11,fontWeight:700,color:tagColor,flex:"1 1 auto",textAlign:"right"}}>{t("home.tag."+tagLabel, tagLabel)}</span>
            {r.chgPct!=null ? <span style={{fontSize:12,fontWeight:700,color:r.chgPct>=0?c.up:c.down,minWidth:56,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{r.chgPct>=0?"+":""}{r.chgPct}%</span> : null}
          </div>
        );
      })}
      {s.status=="ok" ? <div style={{fontSize:10,color:c.text3,marginTop:4,lineHeight:1.35}}>{t("home.breakouts_basis", { t: s.at ? timeText(s.at) : "--" })}</div> : null}
    </HomeCard>
  );
}
