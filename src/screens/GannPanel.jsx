import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { t, useLang } from "../i18n/translations";
import { GANN, suggestScale, validateLine } from "../gann/gannMath";
import { loadLines, saveLine, removeLine, findLine } from "../gann/gannStore";
import { prepareBars, anchorWindow, swingOptions, isSwing, lineFromAnchor, describeLine, fmtNum, linkedRules, ruleOutOfSync, ruleBody } from "../gann/gannView";
import { istLabel } from "../screens/BreakoutTfEngine";
import { normalizeSymbol, cleanWatchlist } from "../alerts/alertRules";
import { statusKey } from "../alerts/alertView";
import { useSmartAlertsPro } from "../alerts/useSmartAlertsPro";

// BreakoutPro - GannPanel.jsx
// Gann 1x1 Angle Intelligence for the Chart screen. The line is: anchor price + (or -) scale x bars,
// where one bar is one candle of the chosen timeframe on the NSE trading calendar and the scale is a
// fixed number of price units per bar (see src/gann/gannMath.js). The anchor is a real completed
// candle from the chart's own data. Lines are saved in this browser (like the watchlist); alerts are
// ordinary Smart Alerts rules on the server, so background push uses the existing scheduler,
// subscriptions and language. Educational tool, never a trading signal.
// Colour: green/red are NOT used for the tool (the line is blue); direction colour appears only on
// alert events elsewhere, where it means a bullish or bearish market move.
// Rules: no backtick, no triple-equals, ASCII only.

var WHY = {
  unsupported_tf: "Gann 1x1 supports the 5m, 15m, 1h and 1D timeframes. Pick one of those above.",
  no_data: "No completed candles are available for this instrument and timeframe.",
  intraday_unavailable: "Reliable intraday candles are not available for this instrument right now, so the intraday Gann line and its alerts are switched off. Daily candles are never used in place of intraday ones.",
  insufficient_history: "Alerts need at least 15 completed candles.",
  stale: "The latest candle is out of date, so alerts cannot be created until fresh data arrives."
};

function GannInner(props){
  var theme = useTheme();
  useLang();
  var c = theme.c;
  var sa = useSmartAlertsPro();
  var open = true;                       // this body is only mounted while the panel is open
  function setOpen(){ if(props.onClose) props.onClose(); }
  var [now, setNow] = useState(Date.now());
  var [lines, setLines] = useState(function(){ return loadLines(); });
  var [draft, setDraft] = useState({ kind:"low", anchorT:null, anchorPrice:null, scaleText:"", scaleMode:"auto" });
  var [selAlerts, setSelAlerts] = useState({ gann_near:false, gann_close:false, gann_any:false });
  var [nearText, setNearText] = useState(String(GANN.NEAR_DEFAULT));
  var [msg, setMsg] = useState(null);
  var [confirmRemove, setConfirmRemove] = useState(false);
  var [working, setWorking] = useState(false);

  var tf = props.tf, symLabel = props.symLabel;
  var alertSym = normalizeSymbol(symLabel);
  var onLine = props.onLine;

  useEffect(function(){
    var id = setInterval(function(){ setNow(Date.now()); }, 30000);
    function reload(){ setLines(loadLines()); }
    try{ window.addEventListener("bp_gann_change", reload); window.addEventListener("storage", reload); }catch(e){}
    return function(){ clearInterval(id); try{ window.removeEventListener("bp_gann_change", reload); window.removeEventListener("storage", reload); }catch(e){} };
  }, []);

  var prep = useMemo(function(){ return prepareBars(props.candles, tf, now); }, [props.candles, tf, Math.floor(now / 60000)]);
  var win = useMemo(function(){ return anchorWindow(prep.bars); }, [prep]);
  var saved = alertSym ? findLine(lines, alertSym, prep.tf || tf) : null;
  var auto = useMemo(function(){ return prep.bars.length ? suggestScale(prep.bars) : { ok:false }; }, [prep]);

  // load the saved line (or a clean draft) whenever the instrument or timeframe changes
  var savedKey = saved ? saved.id + "|" + saved.updatedAt : "none";
  useEffect(function(){ setConfirmRemove(false); setMsg(null); }, [alertSym, prep.tf]);
  useEffect(function(){
    setConfirmRemove(false);
    if(saved){
      setDraft({ kind:saved.kind, anchorT:saved.anchorT, anchorPrice:saved.anchorPrice, scaleText:String(saved.scale), scaleMode:saved.scaleMode });
    } else {
      setDraft({ kind:"low", anchorT:null, anchorPrice:null, scaleText:"", scaleMode:"auto" });
    }
  }, [alertSym, prep.tf, savedKey]);

  // automatic scale follows the data until the user types their own
  var scaleNum = draft.scaleMode == "auto" ? (auto.ok ? auto.scale : null) : Number(draft.scaleText);
  var effective = null;
  if(prep.canDraw && alertSym && draft.anchorT != null && isFinite(scaleNum) && scaleNum > 0){
    var cand = { sym:alertSym, tf:prep.tf, kind:draft.kind, anchorT:draft.anchorT, anchorPrice:draft.anchorPrice, scale:scaleNum, scaleMode:draft.scaleMode };
    if(validateLine(cand, now).ok) effective = cand;
  }
  var differs = !!effective && (!saved || saved.kind != effective.kind || saved.anchorT != effective.anchorT || Math.abs(saved.anchorPrice - effective.anchorPrice) > 0.00005 || Math.abs(saved.scale - effective.scale) > 0.00005);
  var shown = effective || (prep.canDraw ? saved : null);

  useEffect(function(){
    if(onLine) onLine(shown ? { line:shown, preview:!!effective && differs } : null);
  }, [shown ? shown.kind + shown.anchorT + shown.anchorPrice + shown.scale : "x", effective ? (differs ? "p" : "s") : "n", open]);
  useEffect(function(){ return function(){ if(onLine) onLine(null); }; }, []);

  var desc = shown ? describeLine(shown, prep.bars, now) : { ok:false };
  var swings = useMemo(function(){ return swingOptions(win, draft.kind); }, [win, draft.kind]);
  var anchorIdx = -1;
  for(var wi = 0; wi < win.length; wi++){ if(win[wi].t == draft.anchorT) anchorIdx = wi; }
  var anchorIsSwing = anchorIdx >= 0 && isSwing(win, anchorIdx, draft.kind);

  function pickIdx(idx){
    var b = win[idx];
    if(!b) return;
    setDraft(function(d){ return Object.assign({}, d, { anchorT:b.t, anchorPrice:draft.kind == "low" ? b.low : b.high }); });
    setMsg(null);
  }
  function setKind(k){
    setDraft(function(d){
      var nd = Object.assign({}, d, { kind:k });
      var b = null; for(var i = 0; i < win.length; i++){ if(win[i].t == d.anchorT) b = win[i]; }
      if(b){ nd.anchorPrice = k == "low" ? b.low : b.high; } else { nd.anchorT = null; nd.anchorPrice = null; }
      return nd;
    });
    setMsg(null);
  }

  var ruleList = (sa.data && sa.data.doc && sa.data.doc.rules) || [];
  var linked = saved ? linkedRules(ruleList, saved.id) : {};
  var linkedKey = Object.keys(linked).sort().join(",") + (saved ? saved.id : "");
  useEffect(function(){
    setSelAlerts({ gann_near:!!linked.gann_near, gann_close:!!linked.gann_close, gann_any:!!linked.gann_any });
    if(linked.gann_near && linked.gann_near.params && linked.gann_near.params.nearPct) setNearText(String(linked.gann_near.params.nearPct));
  }, [linkedKey]);

  var wlOk = !!alertSym && (cleanWatchlist(sa.watchlist || []).indexOf(alertSym) >= 0 || (sa.data && sa.data.doc && sa.data.doc.indices && sa.data.doc.indices[alertSym] == true));
  var alertBlock = !prep.canAlert ? WHY[prep.alertReason] || null : null;

  function errText(res){
    var errs = (res && res.json && res.json.errors) || [];
    if(errs.length) return errs.map(function(e){ return t("sa.err." + e, e); }).join(" ");
    if(res && res.json && res.json.reason == "symbol_not_in_watchlist") return t("sa.err.symbol_not_in_watchlist");
    return t("sa.err.server");
  }

  async function syncLinked(line){
    // after an edit: bring existing alert rules to the new line
    var bodyList = linkedRules(ruleList, line.id), types = Object.keys(bodyList), problems = null;
    for(var i = 0; i < types.length; i++){
      var ex = bodyList[types[i]];
      if(!ruleOutOfSync(ex, line)) continue;
      var near = ex.params && ex.params.nearPct ? ex.params.nearPct : GANN.NEAR_DEFAULT;
      var r = await sa.saveRule(ruleBody(line, line.sym, types[i], near, ex));
      if(!r.ok) problems = errText(r);
    }
    return problems;
  }
  async function onSave(){
    if(!effective || working) return;
    var label = String(symLabel || "").replace(/[^\x20-\x7E]/g, "");
    var r = saveLine(Object.assign({}, effective, { label:label }));
    if(!r.ok){ setMsg({ kind:"err", text: r.reason == "limit" ? "You can keep at most 12 Gann lines. Remove one first." : "The line could not be saved in this browser." }); return; }
    setLines(r.list);
    setWorking(true);
    var problem = sa.phase == "ready" ? await syncLinked(r.line) : null;
    setWorking(false);
    setMsg(problem ? { kind:"err", text:"Line saved. Alerts could not be updated: " + problem } : { kind:"ok", text: saved ? "Line updated." + (Object.keys(linked).length && sa.phase == "ready" ? " Linked alerts follow the new line." : "") : "Line saved on this device." });
  }
  async function onRemove(){
    if(!saved || working) return;
    setWorking(true);
    var types = Object.keys(linked), failed = false;
    if(sa.phase == "ready"){
      for(var i = 0; i < types.length; i++){ var r = await sa.deleteRule(linked[types[i]].id); if(!r.ok) failed = true; }
    }
    if(failed){ setWorking(false); setMsg({ kind:"err", text:"The line was kept because its alerts could not be removed. Try again." }); return; }
    var rr = removeLine(saved.id);
    setWorking(false); setConfirmRemove(false);
    if(rr.ok){ setLines(rr.list); setDraft({ kind:draft.kind, anchorT:null, anchorPrice:null, scaleText:"", scaleMode:"auto" }); setMsg({ kind:"ok", text: types.length ? "Line and its alerts removed." : "Line removed." }); }
    else setMsg({ kind:"err", text:"The line could not be removed." });
  }
  async function onApplyAlerts(){
    if(!saved || working) return;
    var near = Number(nearText);
    if(selAlerts.gann_near && !(near >= GANN.NEAR_MIN && near <= GANN.NEAR_MAX)){ setMsg({ kind:"err", text:t("sa.err.invalid_near") }); return; }
    setWorking(true);
    var types = ["gann_near", "gann_close", "gann_any"], problem = null, changed = 0;
    for(var i = 0; i < types.length; i++){
      var ty = types[i], ex = linked[ty];
      if(selAlerts[ty]){
        var curNear = ex && ex.params ? ex.params.nearPct : null;
        if(ex && !ruleOutOfSync(ex, saved) && (ty != "gann_near" || curNear == near)) continue;
        var r = await sa.saveRule(ruleBody(saved, alertSym, ty, near, ex));
        if(!r.ok){ problem = errText(r); break; }
        changed++;
      } else if(ex){
        var d = await sa.deleteRule(ex.id);
        if(!d.ok){ problem = errText(d); break; }
        changed++;
      }
    }
    setWorking(false);
    setMsg(problem ? { kind:"err", text:problem } : { kind:"ok", text: changed ? "Alerts updated. Background push needs Smart Alerts set up on this device." : "Alerts already match this line." });
  }

  var box = { background:c.card, border:"1px solid " + c.border, borderRadius:16, padding:12, marginBottom:12 };
  var h = { fontSize:12, fontWeight:800, color:c.text1 };
  var muted = { fontSize:12, color:c.text2, lineHeight:"17px", overflowWrap:"anywhere" };
  var btnBase = { minHeight:44, borderRadius:10, padding:"8px 14px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", border:"1px solid " + c.border };
  function btn(kind, disabled){
    var primary = kind == "primary";
    return Object.assign({}, btnBase, { background:primary ? c.blue : "transparent", color:primary ? c.onBrand : c.text1, borderColor:primary ? c.blue : c.border, opacity:disabled ? 0.5 : 1, cursor:disabled ? "not-allowed" : "pointer" });
  }
  function seg(active){
    return Object.assign({}, btnBase, { flex:1, background:active ? c.blueSoft : "transparent", color:active ? c.blue : c.text1, borderColor:active ? c.blue : c.border });
  }
  var field = { width:"100%", boxSizing:"border-box", minHeight:44, fontSize:16, padding:"8px 10px", borderRadius:10, border:"1px solid " + c.border, background:c.card2, color:c.text1, fontFamily:"inherit" };
  var tfName = prep.tf || tf;

  var summary = saved ? (saved.kind == "low" ? "Up from low " : "Down from high ") + fmtNum(saved.anchorPrice) + " | " + fmtNum(saved.scale) + " per " + saved.tf + " bar" : "No Gann line saved for " + (symLabel || "this instrument") + " " + tf;

  return (
    <div style={box} role="region" aria-label="Gann 1x1 angle tool">
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:8}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14, fontWeight:900, color:c.text1}}>Gann 1x1 angle</div>
          <div style={muted}>{summary}</div>
        </div>
        <button type="button" aria-expanded={open ? "true" : "false"} onClick={function(){ setOpen(!open); }} style={Object.assign({}, btn("ghost"), {flex:"0 0 auto"})}>{open ? "Hide" : "Open"}</button>
      </div>

      {open ? (
        <div style={{marginTop:12}}>
          <div style={Object.assign({}, muted, {background:c.blueSoft, borderRadius:10, padding:"8px 10px", marginBottom:10})}>
            One bar = one {tfName} candle on the NSE trading calendar (nights, weekends and holidays have no bars). The scale is a fixed number of price units per bar. The line is the anchor price plus (upward, from a swing low) or minus (downward, from a swing high) scale x bars. A visual 45 degree line means something different on every chart size, so it is not used.
          </div>

          {!prep.supported || (prep.reason && !prep.canDraw) ? (
            <div role="status" style={Object.assign({}, muted, {border:"1px solid " + c.border, borderRadius:10, padding:"8px 10px", marginBottom:10, color:c.text1})}>{WHY[prep.reason] || WHY.no_data}</div>
          ) : null}

          {prep.canDraw ? (
            <div>
              <div style={h}>Instrument and timeframe</div>
              <div style={Object.assign({}, muted, {marginBottom:10})}>{symLabel} | {tfName}. Change them with the chips above; they include your watchlist.{alertSym && !wlOk ? " " + symLabel + " is not in your watchlist yet, so alerts for it need it added." : ""}</div>

              <div style={h}>Direction</div>
              <div style={{display:"flex", gap:8, margin:"6px 0 10px"}} role="group" aria-label="Line direction">
                <button type="button" aria-pressed={draft.kind == "low" ? "true" : "false"} onClick={function(){ setKind("low"); }} style={seg(draft.kind == "low")}>Up from swing low</button>
                <button type="button" aria-pressed={draft.kind == "high" ? "true" : "false"} onClick={function(){ setKind("high"); }} style={seg(draft.kind == "high")}>Down from swing high</button>
              </div>

              <label style={h} htmlFor="gann-anchor">Anchor candle ({draft.kind == "low" ? "its low" : "its high"} is used)</label>
              <select id="gann-anchor" value={anchorIdx >= 0 && anchorIsSwing ? String(anchorIdx) : ""} onChange={function(e){ if(e.target.value != "") pickIdx(Number(e.target.value)); }} style={Object.assign({}, field, {margin:"6px 0 8px"})}>
                <option value="">{swings.length ? "Choose a confirmed swing" : "No confirmed swing in view"}</option>
                {swings.map(function(s){ return <option key={s.idx} value={String(s.idx)}>{s.label} | {fmtNum(s.price)}</option>; })}
              </select>
              <label style={muted} htmlFor="gann-slider">Or pick any completed candle in view</label>
              <input id="gann-slider" type="range" min={0} max={Math.max(0, win.length - 1)} step={1} value={anchorIdx >= 0 ? anchorIdx : 0}
                     onChange={function(e){ pickIdx(Number(e.target.value)); }} style={{width:"100%", margin:"6px 0 4px", minHeight:32}} aria-label="Anchor candle position" />
              <div style={Object.assign({}, muted, {marginBottom:10})}>
                {draft.anchorT != null ? (
                  <span>Anchor: {istLabel(draft.anchorT * 1000)} at {fmtNum(draft.anchorPrice)}.{anchorIdx < 0 ? " This anchor is older than the candles in view." : (anchorIsSwing ? " Confirmed swing." : " Not a confirmed swing: the line is drawn from it anyway.")}</span>
                ) : <span>No anchor chosen yet.</span>}
              </div>

              <label style={h} htmlFor="gann-scale">Scale (price units per bar)</label>
              <div style={{display:"flex", gap:8, margin:"6px 0 6px"}}>
                <input id="gann-scale" inputMode="decimal" value={draft.scaleMode == "auto" ? (auto.ok ? String(auto.scale) : "") : draft.scaleText}
                       onChange={function(e){ var v = e.target.value; setDraft(function(d){ return Object.assign({}, d, { scaleText:v, scaleMode:"manual" }); }); }} style={Object.assign({}, field, {flex:1})} />
                <button type="button" disabled={!auto.ok} onClick={function(){ setDraft(function(d){ return Object.assign({}, d, { scaleMode:"auto", scaleText:"" }); }); }} style={btn("ghost", !auto.ok)}>Use ATR(14)</button>
              </div>
              <div style={Object.assign({}, muted, {marginBottom:10})}>
                {draft.scaleMode == "auto" ? (auto.ok ? "Automatic: average true range of the last 14 completed " + tfName + " candles, " + fmtNum(auto.scale) + " per bar. It is saved as a fixed number, so the line does not move when data changes." : "Not enough candles for an automatic scale. Enter your own.") : "Your own scale. Doubling it doubles the slope of the line."}
                {draft.scaleMode != "auto" && !(scaleNum > 0) ? " Enter a number greater than zero." : ""}
              </div>

              {shown ? (
                <div style={{border:"1px solid " + c.border, borderRadius:12, padding:10, marginBottom:10}} aria-live="polite">
                  <div style={h}>{effective && differs ? "Preview (not saved)" : "Saved line"}</div>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginTop:6}}>
                    {[["Direction", shown.kind == "low" ? "Up from swing low" : "Down from swing high"], ["Timeframe", shown.tf], ["Anchor", fmtNum(shown.anchorPrice)], ["Scale per bar", fmtNum(shown.scale)],
                      ["Bars since anchor", desc.ok && desc.barsSinceAnchor != null ? String(desc.barsSinceAnchor) : "-"], ["Line at last candle", desc.ok ? fmtNum(desc.levelAtLast) : "-"],
                      ["Line now", desc.ok && desc.levelNow != null ? fmtNum(desc.levelNow) : "closed"], ["Last close", desc.ok ? fmtNum(desc.lastClose) : "-"]].map(function(r){
                      return <div key={r[0]} style={{minWidth:0}}><div style={{fontSize:11, color:c.text2}}>{r[0]}</div><div style={{fontSize:13, fontWeight:700, color:c.text1, overflowWrap:"anywhere"}}>{r[1]}</div></div>;
                    })}
                  </div>
                  {desc.ok && desc.side ? <div style={Object.assign({}, muted, {marginTop:6})}>Last close is {desc.side} the line{desc.distPct != null ? " by " + Math.abs(desc.distPct).toFixed(2) + "%" : ""} (candle closed {istLabel(desc.lastCloseTime)}).</div> : null}
                </div>
              ) : null}

              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                <button type="button" disabled={!effective || working} onClick={onSave} style={btn("primary", !effective || working)}>{saved ? "Update line" : "Save line"}</button>
                {saved ? (confirmRemove ? (
                  <span style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
                    <span style={muted}>Remove the line{Object.keys(linked).length ? " and its alerts" : ""}?</span>
                    <button type="button" disabled={working} onClick={onRemove} style={btn("primary", working)}>Yes, remove</button>
                    <button type="button" onClick={function(){ setConfirmRemove(false); }} style={btn("ghost")}>Keep</button>
                  </span>
                ) : <button type="button" disabled={working} onClick={function(){ setConfirmRemove(true); }} style={btn("ghost", working)}>Remove line</button>) : null}
              </div>
            </div>
          ) : null}

          {msg ? <div role="status" style={Object.assign({}, muted, {marginTop:10, color:c.text1, background:msg.kind == "err" ? c.card2 : c.blueSoft, border:"1px solid " + c.border, borderRadius:10, padding:"8px 10px"})}>{msg.text}</div> : null}

          {saved ? (
            <div style={{marginTop:14, borderTop:"1px solid " + c.border, paddingTop:12}}>
              <div style={h}>Alerts for this line</div>
              {alertBlock ? <div role="status" style={Object.assign({}, muted, {margin:"6px 0"})}>{alertBlock}</div> : null}
              {sa.phase == "loading" ? <div style={muted}>Checking alert setup...</div> : null}
              {sa.phase == "unconfigured" || sa.phase == "error" ? <div style={muted}>Alerts are not available: the alert server is not configured or cannot be reached.</div> : null}
              {sa.phase == "needs_enroll" ? (
                <div style={muted}>Turn on background alerts first in Smart Alerts, then come back here.{props.setTab ? " " : ""}
                  {props.setTab ? <button type="button" onClick={function(){ props.setTab("alerts"); }} style={Object.assign({}, btn("ghost"), {marginLeft:6})}>Open Smart Alerts</button> : null}
                </div>
              ) : null}
              {sa.phase == "ready" ? (
                <div>
                  {[["gann_near", "Price approaching the line"], ["gann_close", saved.kind == "low" ? "Confirmed candle close ABOVE the line" : "Confirmed candle close BELOW the line"], ["gann_any", "Candle close crossing the line either way"]].map(function(row){
                    var ty = row[0], ex = linked[ty], st = ex && sa.data && sa.data.status ? sa.data.status[ex.id] : null;
                    var disabled = !prep.canAlert || !wlOk;
                    return (
                      <div key={ty} style={{margin:"8px 0"}}>
                        <label style={{display:"flex", gap:10, alignItems:"flex-start", minHeight:44, fontSize:13, color:c.text1}}>
                          <input type="checkbox" checked={!!selAlerts[ty]} disabled={disabled && !ex} onChange={function(e){ var v = e.target.checked; setSelAlerts(function(s){ var n = Object.assign({}, s); n[ty] = v; return n; }); }} style={{width:22, height:22, marginTop:2}} />
                          <span>{row[1]}
                            {ty == "gann_any" ? <span style={muted}> A close on the other side of the line also alerts. Direction is named in the alert; it is not advice.</span> : null}
                            {ty == "gann_close" ? <span style={muted}> Uses completed candles only. A wick or the forming candle never counts.</span> : null}
                            {ty == "gann_near" ? <span style={muted}> Uses the latest price, not a confirmed close.</span> : null}
                          </span>
                        </label>
                        {ty == "gann_near" && selAlerts.gann_near ? (
                          <div style={{marginLeft:32}}>
                            <label style={muted} htmlFor="gann-near">Distance from the line (percent)</label>
                            <input id="gann-near" inputMode="decimal" value={nearText} onChange={function(e){ setNearText(e.target.value); }} style={Object.assign({}, field, {maxWidth:140, marginTop:4})} />
                          </div>
                        ) : null}
                        {ex ? <div style={Object.assign({}, muted, {marginLeft:32})}>{ruleOutOfSync(ex, saved) ? "Out of date with the saved line. Press Apply." : t(statusKey(st))}</div> : null}
                      </div>
                    );
                  })}
                  <button type="button" disabled={working || sa.busy == "rule"} onClick={onApplyAlerts} style={btn("primary", working || sa.busy == "rule")}>Apply alerts</button>
                  <div style={Object.assign({}, muted, {marginTop:8})}>Each alert is evaluated on the server with the same schedule, device subscription and language as your other Smart Alerts. After each alert fires it re-arms only when price moves back across the line, with a cooldown of {GANN.COOLDOWN_BARS} bars between close alerts. Background delivery depends on the scheduler, the data provider and your device, and has not been confirmed on a real device by this app yet.</div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div style={Object.assign({}, muted, {marginTop:14, borderTop:"1px solid " + c.border, paddingTop:10})}>
            Gann angles depend on the anchor you pick and the scale you choose. A different scale gives a different line, so no line is "the" Gann line. They are an educational tool and not a guaranteed signal. Holiday handling covers the 2026 NSE list only. Educational only. Not SEBI registered. Not investment advice.
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Closed state: no server calls (the alert hook lives in the body above and is mounted only while the
// panel is open). The saved line is still drawn on the chart.
export default function GannPanel(props){
  var theme = useTheme();
  var c = theme.c;
  var s1 = useState(false);
  // "open" may be owned by the parent: the Chart screen unmounts this panel while candles reload, and
  // the panel should stay open when the timeframe or instrument changes.
  var open = props.open != null ? props.open : s1[0];
  var setOpen = function(v){ if(props.onOpenChange) props.onOpenChange(v); else s1[1](v); };
  var s2 = useState(function(){ return loadLines(); });
  var lines = s2[0], setLines = s2[1];
  var onLine = props.onLine;
  useEffect(function(){
    function reload(){ setLines(loadLines()); }
    try{ window.addEventListener("bp_gann_change", reload); window.addEventListener("storage", reload); }catch(e){}
    return function(){ try{ window.removeEventListener("bp_gann_change", reload); window.removeEventListener("storage", reload); }catch(e){} };
  }, []);
  var alertSym = normalizeSymbol(props.symLabel);
  var nowMin = Math.floor(Date.now() / 60000);
  var prep = useMemo(function(){ return prepareBars(props.candles, props.tf, Date.now()); }, [props.candles, props.tf, nowMin]);
  var saved = alertSym ? findLine(lines, alertSym, prep.tf || props.tf) : null;
  useEffect(function(){
    if(open) return;
    if(onLine) onLine(saved && prep.canDraw ? { line:saved, preview:false } : null);
  }, [open, saved ? saved.id + "|" + saved.updatedAt : "none", prep.canDraw]);
  if(open) return <GannInner {...props} onClose={function(){ setOpen(false); }}/>;
  var muted = { fontSize:12, color:c.text2, lineHeight:"17px", overflowWrap:"anywhere" };
  var summary = saved ? (saved.kind == "low" ? "Up from low " : "Down from high ") + fmtNum(saved.anchorPrice) + " | " + fmtNum(saved.scale) + " per " + saved.tf + " bar" : "No Gann line saved for " + (props.symLabel || "this instrument") + " " + props.tf;
  return (
    <div style={{background:c.card, border:"1px solid " + c.border, borderRadius:16, padding:12, marginBottom:12}} role="region" aria-label="Gann 1x1 angle tool">
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:8}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14, fontWeight:900, color:c.text1}}>Gann 1x1 angle</div>
          <div style={muted}>{summary}</div>
        </div>
        <button type="button" aria-expanded="false" onClick={function(){ setOpen(true); }} style={{flex:"0 0 auto", minHeight:44, borderRadius:10, padding:"8px 14px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", border:"1px solid " + c.border, background:"transparent", color:c.text1}}>Open</button>
      </div>
    </div>
  );
}
