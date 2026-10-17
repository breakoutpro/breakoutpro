import { useTheme } from "../theme/ThemeProvider";
import { useNextMove } from "../hooks/useNextMove";
import { buildNextMoveView } from "./NextMoveView";
import { fmtNum } from "./DirectionEngine";
import { useLang, t } from "../i18n/translations";

// BreakoutPro - NextMoveHome.jsx
// Compact Next Move summary for the Home cards ("Key signal" and "What to
// watch"). It reuses useNextMove(), the same engine result as the full page,
// so the Home card never runs a second calculation. When the essential inputs
// are stale or missing it says "No reliable setup - wait" and names what is
// missing. It never shows a level, price or signal it does not have.
// Rules: no backtick, no triple-equals, ASCII only.

function fmtTime(ts){
  if(ts==null) return null;
  try{
    return new Date(ts).toLocaleString("en-IN", { timeZone:"Asia/Kolkata", day:"numeric", month:"short", hour:"numeric", minute:"2-digit", hour12:true });
  }catch(e){ return null; }
}

var WRAP = { overflowWrap:"anywhere", wordBreak:"break-word", minWidth:0 };

export default function NextMoveHome(props){
  useLang();
  var theme = useTheme();
  var C = theme.c;
  var fs = props.fs || 11, ls = props.ls || 10;
  var nm = useNextMove(props.mm).nextMove;
  var v = buildNextMoveView(nm, t);
  var ok = nm && nm.state=="ok";
  var a = ok ? nm.assessment : "wait";
  var color = (a=="upside" || a=="reversal_up") ? C.up : ((a=="downside" || a=="reversal_dn") ? C.down : C.text2);
  var p = ok ? nm.price : null;
  var tq = p ? fmtTime(p.asOf) : null;
  var labelStyle = { fontSize:ls, color:C.text2, fontWeight:800, marginBottom:2 };
  var line = { fontSize:fs, lineHeight:1.4 };
  var missing = v.missingText || (v.reasons.length ? v.reasons[0] : "");

  var watch = [];
  if(ok){
    for(var i=0; i<v.scenarios.length; i++){
      var sc = v.scenarios[i];
      var trig = sc.rows[0] ? sc.rows[0].text : "";
      if(trig) watch.push({ side:sc.side, text:trig, st:sc.statusText });
    }
  }

  return (
    <div data-testid="nm-home">
      <div style={{marginBottom:6}}>
        <div style={labelStyle}>{t("home.key_signal")}</div>
        <div data-testid="nm-home-assess" style={Object.assign({}, line, {fontWeight:800,color:color}, WRAP)}>{t("nm.assess." + a)}</div>
        {ok && v.why ? <div style={Object.assign({}, line, {color:C.text1,marginTop:2}, WRAP)}>{v.why}</div> : null}
        {!ok && missing ? <div style={Object.assign({}, line, {color:C.text2,marginTop:2}, WRAP)}>{t("nm.missing.title")}: {missing}</div> : null}
        {p ? (
          <div style={Object.assign({fontSize:ls,color:C.text3,marginTop:2,lineHeight:1.4}, WRAP)}>
            {t(p.kind=="live" ? "nm.price.live" : "nm.price.last")}: {fmtNum(p.ltp)}{tq ? " \u00b7 " + t("nm.asof", { t:tq }) : ""}
          </div>
        ) : null}
      </div>
      <div>
        <div style={labelStyle}>{t(props.watchKey || "home.watch")}</div>
        {watch.length ? watch.map(function(w){
          return (
            <div key={w.side} style={Object.assign({}, line, {color:C.text1,marginBottom:2}, WRAP)}>
              <span aria-hidden="true" style={{color:w.side=="bull" ? C.up : C.down}}>{w.side=="bull" ? "\u25b2 " : "\u25bc "}</span>{w.text}
              <span style={{color:C.text3}}>{" \u00b7 " + w.st}</span>
            </div>
          );
        }) : <div style={Object.assign({}, line, {color:C.text2}, WRAP)}>{t("nm.home.watch_wait")}</div>}
      </div>
    </div>
  );
}
