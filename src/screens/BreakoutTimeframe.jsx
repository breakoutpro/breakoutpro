import { useState } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { useLang, t } from "../i18n/translations";
import { fmtNum } from "./DirectionEngine";
import { TF_ORDER, TIMEFRAMES, INSTRUMENT_ORDER, INSTRUMENTS, istLabel } from "./BreakoutTfEngine";
import { useBreakoutTf } from "../hooks/useBreakoutTf";

// BreakoutPro - BreakoutTimeframe.jsx
// Detail screen for Breakout Time Frame Confirmation. All logic is in
// BreakoutTfEngine (pure); this file only renders its result. No candle, price or
// breakout is ever invented here: when the engine says Unavailable, that is shown.
// Green/red only for bullish/bearish market meaning; blue and neutral elsewhere.
// Rules: no backtick, no triple-equals, ASCII only.

var PRICE_VARS = { lvl:1, sup:1, res:1, close:1 };
function say(r){
  var vars = {};
  var src = r.vars || {};
  for(var k in src){
    if(Object.prototype.hasOwnProperty.call(src, k)) vars[k] = PRICE_VARS[k] ? fmtNum(src[k]) : src[k];
  }
  if(vars.dir) vars.dir = t("bt.dir." + vars.dir);
  return t(r.key, vars);
}
function tfName(k){ return k == "1D" ? t("bt.tf.d") : TIMEFRAMES[k].label; }

export default function BreakoutTimeframe(props){
  useLang();
  var theme = useTheme();
  var c = theme.c;
  var onBack = props.onBack || function(){};
  var instState = useState("NIFTY");
  var tfState = useState("15m");
  var symbol = instState[0], tfKey = tfState[0];
  var r = useBreakoutTf(symbol, tfKey);
  var view = r.view;

  var stateColor = { confirmed:c.blue, conflicting:c.warn, waiting:c.text2, unconfirmed:c.warn, unavailable:c.text3 };
  function pill(label, active, onClick, key, aria){
    return (
      <button key={key} onClick={onClick} aria-pressed={active} aria-label={aria || label}
        style={{background:active ? c.blue : "transparent", border:"1px solid " + (active ? c.blue : c.border), color:active ? "#fff" : c.text2,
          fontSize:12, fontWeight:700, borderRadius:16, padding:"7px 13px", minHeight:34, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap"}}>{label}</button>
    );
  }
  var card = { background:c.card, border:"1px solid " + c.border, borderRadius:12, padding:12, boxSizing:"border-box", minWidth:0 };
  var head = { fontSize:11, fontWeight:800, color:c.text2, letterSpacing:0.4, textTransform:"uppercase", marginBottom:8 };
  var body = { fontSize:13, color:c.text1, lineHeight:1.45, overflowWrap:"anywhere" };
  var muted = { fontSize:12, color:c.text2, lineHeight:1.45, overflowWrap:"anywhere" };

  function dirColor(d){ return d == "bullish" ? c.up : (d == "bearish" ? c.down : c.text2); }
  function htfLabel(h){
    if(h.status == "ok") return t("bt.htf." + (h.trend.dir > 0 ? "bullish" : (h.trend.dir < 0 ? "bearish" : "neutral")));
    return t("bt.htf." + h.status);
  }
  function htfColor(h){
    if(h.status != "ok") return c.text3;
    return h.trend.dir > 0 ? c.up : (h.trend.dir < 0 ? c.down : c.text2);
  }

  return (
    <div style={{background:c.bg, minHeight:"100vh", fontFamily:"Inter,Arial,sans-serif", paddingBottom:90, boxSizing:"border-box", width:"100%", overflowX:"hidden"}}>
      <div style={{background:c.card, borderBottom:"1px solid " + c.border, padding:"10px 12px", display:"flex", alignItems:"center", gap:10}}>
        <button onClick={onBack} aria-label={t("bt.back")} style={{background:c.blueSoft, border:"none", borderRadius:8, minWidth:36, height:36, color:c.text1, fontSize:16, cursor:"pointer", flexShrink:0}}>&#8592;</button>
        <div style={{minWidth:0, flex:1}}>
          <div style={{fontSize:15, fontWeight:800, color:c.text1, overflowWrap:"anywhere"}}>{t("bt.title")}</div>
          <div style={{fontSize:11, color:c.text2, overflowWrap:"anywhere"}}>{t("bt.disclaimer")}</div>
        </div>
        <button onClick={r.refresh} style={{background:"transparent", border:"1px solid " + c.blue, color:c.blue, borderRadius:8, padding:"6px 10px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", flexShrink:0}}>{t("bt.refresh")}</button>
      </div>

      <div style={{maxWidth:980, margin:"0 auto", padding:"12px 12px 0", boxSizing:"border-box", width:"100%"}}>
        <div style={{display:"flex", flexDirection:"column", gap:10, marginBottom:12}}>
          <div>
            <div style={head}>{t("bt.instrument")}</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
              {INSTRUMENT_ORDER.map(function(s){ return pill(INSTRUMENTS[s].name, s == symbol, function(){ instState[1](s); }, s, INSTRUMENTS[s].name + " " + INSTRUMENTS[s].exchange); })}
            </div>
          </div>
          <div>
            <div style={head}>{t("bt.timeframe")}</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
              {TF_ORDER.map(function(k){ return pill(tfName(k), k == tfKey, function(){ tfState[1](k); }, k); })}
            </div>
          </div>
        </div>

        {r.loading || !view ? (
          <div style={Object.assign({}, card, {textAlign:"center", color:c.text2, fontSize:13, padding:28})} role="status">{t("bt.loading")}</div>
        ) : (
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap:10}}>
            <div style={Object.assign({}, card, {gridColumn:"1 / -1"})}>
              <div style={{display:"flex", flexWrap:"wrap", alignItems:"center", gap:10, justifyContent:"space-between"}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:16, fontWeight:800, color:c.text1, overflowWrap:"anywhere"}}>{view.instrument.name}</div>
                  <div style={muted}>{view.exchange} &#183; {tfName(view.tf)}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{display:"inline-block", border:"1px solid " + stateColor[view.state], color:stateColor[view.state], borderRadius:8, padding:"4px 10px", fontSize:13, fontWeight:800}}>{t("bt.state." + view.state)}</div>
                </div>
              </div>
              <div style={Object.assign({}, muted, {marginTop:8})}>{t("bt.state." + view.state + ".d")}</div>
              <div style={{marginTop:10}}>
                <div style={head}>{t("bt.sec.direction")}</div>
                <div style={{fontSize:15, fontWeight:800, color:dirColor(view.direction)}}>{t("bt.dir." + view.direction)}</div>
              </div>
            </div>

            <div style={card}>
              <div style={head}>{t("bt.sec.reasons")}</div>
              <ul style={{margin:0, paddingLeft:18}}>
                {view.reasons.map(function(x, i){ return <li key={i} style={Object.assign({}, body, {marginBottom:4})}>{say(x)}</li>; })}
              </ul>
              <div style={Object.assign({}, head, {marginTop:12})}>{t("bt.sec.conflicts")}</div>
              {view.conflicts.length == 0 ? <div style={muted}>{t("bt.conf.none")}</div> : (
                <ul style={{margin:0, paddingLeft:18}}>
                  {view.conflicts.map(function(x, i){ return <li key={i} style={Object.assign({}, body, {marginBottom:4, color:c.warn})}>{say(x)}</li>; })}
                </ul>
              )}
            </div>

            <div style={card}>
              <div style={head}>{t("bt.sec.levels")}</div>
              {view.level ? (
                <div>
                  <div style={{display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap"}}><span style={muted}>{t("bt.lvl.res")}</span><span style={{fontSize:14, fontWeight:800, color:c.text1}}>{fmtNum(view.level.resistance)}</span></div>
                  <div style={{display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap", marginTop:6}}><span style={muted}>{t("bt.lvl.sup")}</span><span style={{fontSize:14, fontWeight:800, color:c.text1}}>{fmtNum(view.level.support)}</span></div>
                  <div style={Object.assign({}, muted, {marginTop:8})}>{t("bt.lvl.note")}</div>
                </div>
              ) : <div style={muted}>{t("bt.lvl.none")}</div>}
              <div style={Object.assign({}, head, {marginTop:12})}>{t("bt.sec.higher")}</div>
              {view.higher.length == 0 ? <div style={muted}>{t("bt.htf.none")}</div> : view.higher.map(function(h){
                return (
                  <div key={h.tf} style={{display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap", marginBottom:6}}>
                    <span style={body}>{tfName(h.tf)}</span>
                    <span style={{fontSize:13, fontWeight:700, color:htfColor(h)}}>{htfLabel(h)}</span>
                    {h.status != "ok" ? <span style={Object.assign({}, muted, {flexBasis:"100%"})}>{t(h.reasonKey, h.reasonVars)}</span> : null}
                  </div>
                );
              })}
            </div>

            <div style={card}>
              <div style={head}>{t("bt.sec.data")}</div>
              <div style={body}>{t("bt.data.source")}: {t("bt.data.source_v")}</div>
              <div style={Object.assign({}, muted, {marginTop:4})}>{t("bt.data.verified")}</div>
              <div style={Object.assign({}, body, {marginTop:8})}>{t("bt.data.last")}: {view.lastCandle ? view.lastCandle.label : "-"}</div>
              <div style={body}>{t("bt.data.fresh")}: {view.freshness ? (view.freshness.state == "fresh" ? (view.freshness.delayed ? t("bt.data.fresh_delay") : t("bt.data.fresh_ok")) : t("bt.data.fresh_stale")) : "-"}</div>
              {view.provisionalCandle ? <div style={Object.assign({}, muted, {marginTop:4})}>{t("bt.data.prov")}: {view.provisionalCandle.label}</div> : null}
              {view.selected && view.selected.rejected ? (function(){
                var q = view.selected.rejected, n = q.malformed + q.badTime + q.future + q.offSession + q.misaligned + q.duplicate;
                return n > 0 ? <div style={Object.assign({}, muted, {marginTop:4})}>{t("bt.data.rej", {n:n})}</div> : null;
              })() : null}
              {r.loadedAt ? <div style={Object.assign({}, muted, {marginTop:4})}>{t("bt.data.checked", {ts:istLabel(r.loadedAt)})}</div> : null}
              <div style={Object.assign({}, muted, {marginTop:8})}>{t("bt.data.tz")}</div>
            </div>

            <div style={card}>
              <div style={head}>{t("bt.sec.rules")}</div>
              <ul style={{margin:0, paddingLeft:18}}>
                {[1,2,3,4,5,6].map(function(i){ return <li key={i} style={Object.assign({}, muted, {marginBottom:4})}>{t("bt.rule." + i)}</li>; })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
