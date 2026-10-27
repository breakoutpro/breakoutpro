// BreakoutPro - src/market/QuoteBadge.jsx
// The one freshness badge for a quote: LIVE / DELAYED / STALE / UNAVAILABLE, the provider delay when
// it is known, and the quote's own timestamp. Colours are status colours, never green/red (those stay
// reserved for price direction). Text is translated in all five app languages (md.* keys).
// Rules: no backtick, no triple-equals, ASCII only.
import { useTheme } from "../theme/ThemeProvider";
import { t, useLang } from "../i18n/translations";
import { istStamp } from "../state/marketTickerModel";

export function badgeText(q){
  if(!q || q.price == null || q.status == "UNAVAILABLE") return t("md.unavail", "Unavailable");
  if(q.status == "LIVE") return t("md.live", "Live");
  if(q.status == "STALE") return t("md.stale", "Stale");
  if(q.closed) return t("md.closed", "Last close");
  if(q.delayKnown && q.delayedBySec > 0) return t("md.delayed_min", { n:Math.max(1, Math.round(q.delayedBySec / 60)) });
  return t("md.delayed", "Delayed");
}

export default function QuoteBadge(props){
  var theme = useTheme(); useLang();
  var c = theme.c, q = props.quote;
  var st = q && q.price != null ? q.status : "UNAVAILABLE";
  var col = st == "LIVE" ? c.blue : (st == "DELAYED" ? c.warn : c.text3);
  var stamp = (q && q.asOf && st != "UNAVAILABLE") ? t("md.asof", { t:istStamp(q.asOf, Date.now()) }) : "";
  return (
    <span title={t("md.delay_note", "Prices come from Yahoo Finance and may be delayed.")}
          style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:props.size || 11,fontWeight:700,color:col,whiteSpace:"nowrap"}}>
      <span aria-hidden="true" style={{width:6,height:6,borderRadius:"50%",background:col,display:"inline-block"}}></span>
      {badgeText(q)}{stamp && !props.compact ? " \u00B7 " + stamp : ""}
    </span>
  );
}
