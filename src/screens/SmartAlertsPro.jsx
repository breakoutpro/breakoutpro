import { useState, useEffect, useRef } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { useDensity } from "../theme/density";
import { t, useLang } from "../i18n/translations";
import { useSmartAlertsPro } from "../alerts/useSmartAlertsPro";
import { RULE_TYPES, TIMEFRAMES, PATTERN_IDS, MAX_RULES, isGannType } from "../alerts/alertRules";
import { buildMessage, symbolLabel, fmtPrice } from "../alerts/alertMessage";
import { istLabel } from "../alerts/alertEngine";
import { FILTERS, FILTER_KEYS, filterRules, filterHistory, ruleDirection, eventDirection, statusKey, statusChipKey, ruleParamText, ageLabel, formSymbols, groupOfEvent } from "../alerts/alertView";
import { takeOpenIntent } from "../alerts/openIntent";
import { announceEvent } from "../hooks/useVoiceAlerts";

// BreakoutPro - Smart Alerts (real, provider-backed, watchlist-only)
// Rules are stored on the server and evaluated there against real market data; alerts reach this
// device as Web Push even when the app is closed (once the owner has configured storage, push
// keys and a scheduler - see docs/SMART_ALERTS_SETUP.md). Educational signals, never advice.
// Colors: red/green only for market direction (UP/DOWN); controls are blue/neutral.
// Rules: no backtick, no triple-equals, ASCII only.

var TYPE_ORDER = ["price_above", "price_below", "pct_up", "pct_down", "breakout", "breakdown", "candle", "volume_spike", "price_up_volume", "price_down_volume"];
var TF_ORDER = ["5m", "15m", "1H", "1D"];

function emptyForm(sym){ return { id:null, symbol:sym || "", type:"price_above", timeframe:"15m", value:"", pct:"", mult:"2", minMovePct:"0.3", patterns:["doji"] }; }

function formFromRule(r){
  var p = r.params || {};
  return { id:r.id, symbol:r.symbol, type:r.type, timeframe:r.timeframe || "15m", value:p.value != undefined ? String(p.value) : "", pct:p.pct != undefined ? String(p.pct) : "",
    mult:p.mult != undefined ? String(p.mult) : "2", minMovePct:p.minMovePct != undefined ? String(p.minMovePct) : "0.3", patterns:(p.patterns || ["doji"]).slice() };
}
function ruleFromForm(f){
  var def = RULE_TYPES[f.type] || {};
  var params = {};
  if(def.param == "value") params.value = f.value;
  if(def.param == "pct") params.pct = f.pct;
  if(def.param == "mult"){ params.mult = f.mult; if(f.type != "volume_spike") params.minMovePct = f.minMovePct; }
  if(def.param == "patterns") params.patterns = f.patterns;
  var out = { symbol:f.symbol, type:f.type, params:params, enabled:true };
  var usesTf = !(f.type == "price_above" || f.type == "price_below" || f.type == "pct_up" || f.type == "pct_down");
  if(usesTf) out.timeframe = f.timeframe;
  if(f.id) out.id = f.id;
  return out;
}

export default function SmartAlertsPro(props){
  useLang();
  var theme = useTheme();
  var c = theme.c;
  var D = useDensity();
  var voiceFired = useRef({});
  var sa = useSmartAlertsPro(function(fresh){
    fresh.forEach(function(h){ if(!voiceFired.current[h.id]){ voiceFired.current[h.id] = 1; announceEvent(h); } });
  });
  var s1 = useState("all"); var filter = s1[0], setFilter = s1[1];
  var s2 = useState(null); var form = s2[0], setForm = s2[1];
  var s3 = useState([]); var formErr = s3[0], setFormErr = s3[1];
  var s4 = useState(""); var code = s4[0], setCode = s4[1];
  var s5 = useState(false); var askCode = s5[0], setAskCode = s5[1];
  var s6 = useState(null); var hl = s6[0], setHl = s6[1];
  var s7 = useState(null); var delId = s7[0], setDelId = s7[1];
  var s8 = useState(false); var confirmWipe = s8[0], setConfirmWipe = s8[1];
  var now = Date.now();

  var doc = sa.data ? sa.data.doc : null;
  var rules = doc ? doc.rules : [];
  var indices = doc ? doc.indices : { NIFTY:false, BANKNIFTY:false };
  var status = sa.data ? sa.data.status : {};
  var history = sa.data ? sa.data.history : [];
  var ready = sa.phase == "ready";

  // notification click / deep link -> highlight that alert
  useEffect(function(){
    if(!ready) return;
    var it = takeOpenIntent();
    if(!it) return;
    if(it.id) setHl(it.id);
    setTimeout(function(){
      try{ var el = document.getElementById("sa-h-" + it.id); if(el && el.scrollIntoView) el.scrollIntoView({ block:"center" }); }catch(e){}
    }, 150);
  }, [ready]);

  var card = { background:c.card, border:"1px solid " + c.border, borderRadius:D.on ? D.radius : 14, padding:D.on ? D.cardPad : 14, boxSizing:"border-box", minWidth:0 };
  var head = { fontSize:11, fontWeight:800, color:c.text2, letterSpacing:0.4, textTransform:"uppercase", marginBottom:8 };
  var muted = { fontSize:12, color:c.text2, lineHeight:1.45, overflowWrap:"anywhere" };
  var inputStyle = { width:"100%", boxSizing:"border-box", minHeight:44, background:c.card2, border:"1px solid " + c.border, borderRadius:10, padding:"0 12px", fontSize:14, color:c.text1, fontFamily:"inherit" };
  function btn(kind){
    var base = { minHeight:44, borderRadius:10, padding:"0 14px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxSizing:"border-box" };
    if(kind == "primary") return Object.assign(base, { background:c.blue, color:"#fff", border:"1px solid " + c.blue });
    return Object.assign(base, { background:"transparent", color:c.blue, border:"1px solid " + c.border });
  }
  function chip(label, active, onClick, key){
    return (
      <button key={key} onClick={onClick} aria-pressed={active ? "true" : "false"}
        style={{background:active ? c.blue : "transparent", border:"1px solid " + (active ? c.blue : c.border), color:active ? "#fff" : c.text2, fontSize:12, fontWeight:700, borderRadius:16, padding:"0 14px", minHeight:44, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap"}}>{label}</button>
    );
  }
  function dirChip(dir){
    var col = dir == "up" ? c.up : (dir == "down" ? c.down : c.text2);
    return <span style={{fontSize:11, fontWeight:800, color:col, border:"1px solid " + col, borderRadius:6, padding:"2px 6px", flexShrink:0}}>{t("dir." + dir)}</span>;
  }
  function tfName(k){ return t("sa.tf." + k); }
  function ageText(ms){
    var a = ageLabel(now, ms);
    if(a.unit == "none") return "";
    return t("sa.age." + a.unit, { n:a.n });
  }
  function toggleRow(label, on, onClick){
    return (
      <button onClick={onClick} role="switch" aria-checked={on ? "true" : "false"} style={{display:"flex", alignItems:"center", gap:10, width:"100%", minHeight:44, background:"transparent", border:"none", padding:0, cursor:"pointer", fontFamily:"inherit"}}>
        <span style={{flex:1, textAlign:"left", fontSize:13, color:c.text1, fontWeight:600}}>{label}</span>
        <span style={{width:40, height:22, borderRadius:11, background:on ? c.blue : c.border, position:"relative", flexShrink:0}}>
          <span style={{position:"absolute", top:3, left:on ? 21 : 3, width:16, height:16, borderRadius:"50%", background:c.onAccent, transition:"left 0.2s"}}></span>
        </span>
      </button>
    );
  }
  function openInstrument(h){
    if(props.onOpenInstrument) props.onOpenInstrument({ sym:h.symbol, name:symbolLabel(h.symbol), ltp:h.price, chgPct:0, up:eventDirection(h) != "down", sect:"" });
  }

  // ---------- Background / status card ----------
  function statusRow(label, value, key){
    return (
      <div key={key} style={{display:"flex", justifyContent:"space-between", gap:10, padding:"6px 0", borderTop:"1px solid " + c.border2}}>
        <span style={{fontSize:12, color:c.text2}}>{label}</span>
        <span style={{fontSize:12, color:c.text1, fontWeight:700, textAlign:"right", overflowWrap:"anywhere"}}>{value}</span>
      </div>
    );
  }
  function backgroundCard(){
    var srv = sa.srv || {};
    var enrolled = ready;
    var permText = sa.perm == "granted" ? t("sa.st.subscribed") : (sa.perm == "denied" ? t("sa.st.denied") : (sa.perm == "unsupported" || !sa.pushCapable ? t("sa.st.unsupported") : t("sa.st.notsubscribed")));
    if(sa.perm == "granted" && sa.browserSub == false) permText = t("sa.st.notsubscribed");
    var lastRun = sa.data && sa.data.serverLastRun ? sa.data.serverLastRun : (srv.lastRun || null);
    var rows = [
      statusRow(t("sa.bg.storage"), srv.storage ? t("sa.st.ready") : t("sa.st.notconfigured"), "r1"),
      statusRow(t("sa.bg.account"), enrolled ? t("sa.st.enrolled") : (sa.phase == "needs_enroll" ? t("sa.st.notenrolled") : "-"), "r2"),
      statusRow(t("sa.bg.push"), srv.push == false ? t("sa.st.vapid") : permText, "r3"),
      statusRow(t("sa.bg.lastrun"), lastRun ? ageText(lastRun.at) + " | " + t("sa.sess." + (lastRun.session || "CLOSED")) : t("sa.bg.never"), "r4")
    ];
    if(enrolled) rows.push(<div key="r5" style={{fontSize:12, color:c.text2, padding:"6px 0", borderTop:"1px solid " + c.border2}}>{t("sa.bg.n_devices", { n:sa.data.subscriptions })}</div>);
    var pushOn = enrolled && sa.data && sa.data.subscriptions > 0 && sa.perm == "granted" && sa.browserSub;
    return (
      <div style={card}>
        <div style={head}>{t("sa.bg.title")}</div>
        <div>{rows}</div>
        {sa.msg ? <div role="status" style={{fontSize:12, color:sa.msg.kind == "error" ? c.text1 : c.blue, background:c.blueSoft, borderRadius:8, padding:"8px 10px", marginTop:8, overflowWrap:"anywhere"}}>{t(sa.msg.key)}</div> : null}
        {sa.perm == "denied" ? <div style={Object.assign({}, muted, {marginTop:8})}>{t("sa.perm.denied")}</div> : null}
        {!sa.pushCapable ? <div style={Object.assign({}, muted, {marginTop:8})}>{t("sa.perm.unsupported")}</div> : null}
        {srv.storage && srv.cron == false ? <div style={Object.assign({}, muted, {marginTop:8})}>{t("sa.bg.note_cron")}</div> : null}
        {srv.storage ? (
          <div style={{display:"flex", flexDirection:"column", gap:8, marginTop:12}}>
            {askCode && !enrolled ? (
              <div>
                <div style={muted}>{t("sa.bg.need_code")}</div>
                <input value={code} onChange={function(e){ setCode(e.target.value); }} placeholder={t("sa.bg.code_ph")} autoCapitalize="characters" autoComplete="off" style={Object.assign({}, inputStyle, {marginTop:6})}/>
              </div>
            ) : null}
            {!pushOn ? (
              <button disabled={sa.busy == "enable"} onClick={function(){
                sa.enableBackground(code || null).then(function(r){ if(r && !r.ok && r.reason == "need_code") setAskCode(true); });
              }} style={btn("primary")}>{t("sa.bg.enable")}</button>
            ) : (
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                <button disabled={sa.busy == "test"} onClick={sa.sendTest} style={Object.assign(btn("ghost"), {flex:1})}>{t("sa.bg.test")}</button>
                <button disabled={sa.busy == "disable"} onClick={sa.disableBackground} style={Object.assign(btn("ghost"), {flex:1})}>{t("sa.bg.disable")}</button>
              </div>
            )}
            {enrolled ? (
              confirmWipe ? (
                <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center"}}>
                  <span style={Object.assign({}, muted, {flex:"1 1 100%"})}>{t("sa.bg.delete_confirm")}</span>
                  <button onClick={function(){ setConfirmWipe(false); sa.deleteServerData(); }} style={Object.assign(btn("primary"), {flex:1})}>{t("sa.form.delete")}</button>
                  <button onClick={function(){ setConfirmWipe(false); }} style={Object.assign(btn("ghost"), {flex:1})}>{t("sa.form.cancel")}</button>
                </div>
              ) : <button onClick={function(){ setConfirmWipe(true); }} style={{background:"transparent", border:"none", color:c.text2, fontSize:12, textDecoration:"underline", cursor:"pointer", fontFamily:"inherit", minHeight:44, textAlign:"left", padding:0}}>{t("sa.bg.delete")}</button>
            ) : null}
          </div>
        ) : null}
        <div style={Object.assign({}, muted, {marginTop:8})}>{t("sa.lang_note")}</div>
      </div>
    );
  }

  // ---------- Instruments ----------
  function instrumentsCard(){
    var wlist = sa.watchlist;
    return (
      <div style={card}>
        <div style={head}>{t("sa.inst.title")}</div>
        <div style={muted}>{t("sa.inst.note")}</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:8}}>
          {wlist.length == 0 ? <span style={muted}>{t("sa.inst.empty")}</span> : wlist.map(function(s){
            return <span key={s} style={{fontSize:12, fontWeight:700, color:c.text1, background:c.card2, border:"1px solid " + c.border, borderRadius:8, padding:"4px 8px"}}>{symbolLabel(s)}</span>;
          })}
        </div>
        {ready ? (
          <div style={{marginTop:8}}>
            {toggleRow(t("sa.inst.nifty"), !!indices.NIFTY, function(){ sa.setIndices({ NIFTY:!indices.NIFTY, BANKNIFTY:!!indices.BANKNIFTY }); })}
            {toggleRow(t("sa.inst.banknifty"), !!indices.BANKNIFTY, function(){ sa.setIndices({ NIFTY:!!indices.NIFTY, BANKNIFTY:!indices.BANKNIFTY }); })}
          </div>
        ) : null}
      </div>
    );
  }

  // ---------- Rule form ----------
  function setF(k, v){ setForm(function(p){ var n = Object.assign({}, p); n[k] = v; return n; }); }
  function formCard(){
    var syms = formSymbols(sa.watchlist, indices);
    var def = RULE_TYPES[form.type] || {};
    var usesTf = !(form.type == "price_above" || form.type == "price_below" || form.type == "pct_up" || form.type == "pct_down");
    return (
      <div style={card}>
        <div style={head}>{form.id ? t("sa.rules.edit") : t("sa.rules.new")}</div>
        <label style={{display:"block", marginBottom:10}}>
          <div style={muted}>{t("sa.form.symbol")}</div>
          <select value={form.symbol} onChange={function(e){ setF("symbol", e.target.value); }} style={Object.assign({}, inputStyle, {marginTop:4})}>
            <option value="">-</option>
            {syms.map(function(s){ return <option key={s} value={s}>{symbolLabel(s)}</option>; })}
          </select>
        </label>
        <label style={{display:"block", marginBottom:10}}>
          <div style={muted}>{t("sa.form.type")}</div>
          <select value={form.type} onChange={function(e){ setF("type", e.target.value); }} style={Object.assign({}, inputStyle, {marginTop:4})}>
            {TYPE_ORDER.map(function(k){ return <option key={k} value={k}>{t("sa.type." + k)}</option>; })}
          </select>
        </label>
        {def.param == "value" ? (
          <label style={{display:"block", marginBottom:10}}>
            <div style={muted}>{t("sa.form.value")}</div>
            <input inputMode="decimal" value={form.value} onChange={function(e){ setF("value", e.target.value); }} style={Object.assign({}, inputStyle, {marginTop:4})}/>
          </label>
        ) : null}
        {def.param == "pct" ? (
          <label style={{display:"block", marginBottom:10}}>
            <div style={muted}>{t("sa.form.pct")}</div>
            <input inputMode="decimal" value={form.pct} onChange={function(e){ setF("pct", e.target.value); }} style={Object.assign({}, inputStyle, {marginTop:4})}/>
          </label>
        ) : null}
        {def.param == "mult" ? (
          <div>
            <label style={{display:"block", marginBottom:10}}>
              <div style={muted}>{t("sa.form.mult")}</div>
              <input inputMode="decimal" value={form.mult} onChange={function(e){ setF("mult", e.target.value); }} style={Object.assign({}, inputStyle, {marginTop:4})}/>
            </label>
            {form.type != "volume_spike" ? (
              <label style={{display:"block", marginBottom:10}}>
                <div style={muted}>{t("sa.form.move")}</div>
                <input inputMode="decimal" value={form.minMovePct} onChange={function(e){ setF("minMovePct", e.target.value); }} style={Object.assign({}, inputStyle, {marginTop:4})}/>
              </label>
            ) : null}
          </div>
        ) : null}
        {def.param == "patterns" ? (
          <div style={{marginBottom:10}}>
            <div style={muted}>{t("sa.form.patterns")}</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:4}}>
              {PATTERN_IDS.map(function(p){
                var on = form.patterns.indexOf(p) >= 0;
                return chip(t("pat." + p), on, function(){ setF("patterns", on ? form.patterns.filter(function(x){ return x != p; }) : form.patterns.concat([p])); }, p);
              })}
            </div>
          </div>
        ) : null}
        {usesTf ? (
          <div style={{marginBottom:10}}>
            <div style={muted}>{t("sa.form.tf")}</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:4}}>
              {TF_ORDER.map(function(k){ return chip(tfName(k), form.timeframe == k, function(){ setF("timeframe", k); }, k); })}
            </div>
            {form.timeframe == "1D" ? <div style={Object.assign({}, muted, {marginTop:6})}>{t("sa.tf.daily_note")}</div> : null}
          </div>
        ) : null}
        {formErr.length ? (
          <div role="alert" style={{marginBottom:10}}>
            {formErr.map(function(e){ return <div key={e} style={{fontSize:12, color:c.text1, background:c.blueSoft, borderRadius:8, padding:"6px 10px", marginBottom:4}}>{t("sa.err." + e, "")}</div>; })}
          </div>
        ) : null}
        <div style={{display:"flex", gap:8}}>
          <button disabled={sa.busy == "rule"} onClick={function(){
            sa.saveRule(ruleFromForm(form)).then(function(res){
              if(res.ok){ setForm(null); setFormErr([]); }
              else setFormErr((res.json && res.json.errors) ? res.json.errors : ["server"]);
            });
          }} style={Object.assign(btn("primary"), {flex:1})}>{t("sa.form.save")}</button>
          <button onClick={function(){ setForm(null); setFormErr([]); }} style={Object.assign(btn("ghost"), {flex:1})}>{t("sa.form.cancel")}</button>
        </div>
      </div>
    );
  }

  // ---------- Rules ----------
  function rulesCard(){
    var list = filterRules(rules, filter);
    return (
      <div style={card}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:8}}>
          <div style={Object.assign({}, head, {marginBottom:0})}>{t("sa.rules.title")}</div>
          <button disabled={!ready || rules.length >= MAX_RULES || sa.watchlist.length + (indices.NIFTY ? 1 : 0) + (indices.BANKNIFTY ? 1 : 0) == 0}
            onClick={function(){ setFormErr([]); setForm(emptyForm(formSymbols(sa.watchlist, indices)[0])); }} style={btn("primary")}>+ {t("sa.rules.new")}</button>
        </div>
        {rules.length >= MAX_RULES ? <div style={muted}>{t("sa.rules.limit")}</div> : null}
        {list.length == 0 ? <div style={muted}>{t("sa.rules.empty")}</div> : null}
        {list.map(function(r){
          var st = status[r.id];
          var chipKey = statusChipKey(st);
          var why = st && (st.status == "waiting" || st.status == "stale" || st.status == "unavailable" || st.status == "market_closed" || st.status == "error") ? t(statusKey(st)) : "";
          var usesTf = !(r.type == "price_above" || r.type == "price_below" || r.type == "pct_up" || r.type == "pct_down");
          return (
            <div key={r.id} style={{borderTop:"1px solid " + c.border2, padding:"10px 0", opacity:r.enabled ? 1 : 0.6}}>
              <div style={{display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
                <span style={{fontSize:14, fontWeight:800, color:c.text1}}>{symbolLabel(r.symbol)}</span>
                {dirChip(ruleDirection(r))}
                <span style={{fontSize:11, fontWeight:700, color:c.blue, background:c.blueSoft, borderRadius:6, padding:"2px 6px"}}>{t(chipKey)}</span>
              </div>
              <div style={{fontSize:12, color:c.text1, marginTop:4, overflowWrap:"anywhere"}}>{t("sa.type." + r.type)} {ruleParamText(r)}{usesTf ? " | " + tfName(r.timeframe) : ""}</div>
              {r.type == "candle" ? <div style={muted}>{(r.params.patterns || []).map(function(p){ return t("pat." + p); }).join(", ")}</div> : null}
              {isGannType(r.type) ? <div style={Object.assign({}, muted, {marginTop:2})}>{t("sa.gann.managed")}</div> : null}
              {why ? <div style={Object.assign({}, muted, {marginTop:2})}>{why}</div> : null}
              <div style={{display:"flex", gap:6, flexWrap:"wrap", marginTop:6}}>
                <button onClick={function(){ sa.toggleRule(r.id, !r.enabled); }} role="switch" aria-checked={r.enabled ? "true" : "false"} style={Object.assign(btn("ghost"), {minWidth:64})}>{r.enabled ? t("sa.st.enrolled") : t("sa.status.disabled")}</button>
                {isGannType(r.type) ? null : <button onClick={function(){ setFormErr([]); setForm(formFromRule(r)); }} style={btn("ghost")}>{t("sa.form.edit")}</button>}
                {delId == r.id ? (
                  <span style={{display:"flex", gap:6, alignItems:"center", flexWrap:"wrap"}}>
                    <span style={muted}>{t("sa.form.confirm_delete")}</span>
                    <button onClick={function(){ setDelId(null); sa.deleteRule(r.id); }} style={btn("primary")}>{t("sa.form.delete")}</button>
                    <button onClick={function(){ setDelId(null); }} style={btn("ghost")}>{t("sa.form.cancel")}</button>
                  </span>
                ) : <button onClick={function(){ setDelId(r.id); }} style={btn("ghost")}>{t("sa.form.delete")}</button>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ---------- History ----------
  function historyCard(){
    var list = filterHistory(history, filter);
    var sup = sa.data ? sa.data.suppressed : 0;
    return (
      <div style={card}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:8, flexWrap:"wrap"}}>
          <div style={Object.assign({}, head, {marginBottom:0})}>{t("sa.hist.title")}</div>
          <div style={{display:"flex", gap:6}}>
            <button disabled={!ready || sa.busy == "check"} onClick={sa.checkNow} style={btn("ghost")}>{t("sa.check_now")}</button>
            {history.length ? <button onClick={sa.clearHistory} style={btn("ghost")}>{t("sa.hist.clear")}</button> : null}
          </div>
        </div>
        {sup > 0 ? <div style={Object.assign({}, muted, {marginBottom:6})}>{t("sa.hist.suppressed", { n:sup })}</div> : null}
        {list.length == 0 ? <div style={muted}>{t("sa.hist.empty")}</div> : null}
        {list.map(function(h){
          var m = buildMessage(h, sa.lang);
          var dir = eventDirection(h);
          var isHl = hl == h.id;
          return (
            <div key={h.id} id={"sa-h-" + h.id} style={{borderTop:"1px solid " + c.border2, padding:"10px 8px", margin:"0 -8px", background:isHl ? c.blueSoft : "transparent", borderRadius:isHl ? 8 : 0}}>
              <div style={{display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
                <span style={{fontSize:14, fontWeight:800, color:c.text1, overflowWrap:"anywhere"}}>{m.title}</span>
                {dirChip(dir)}
              </div>
              <div style={{fontSize:12, color:c.text1, marginTop:4, overflowWrap:"anywhere"}}>{m.reason}</div>
              <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:4, fontSize:11, color:c.text2}}>
                <span>{fmtPrice(h.price)}</span>
                <span>{h.timeframe == "1D" ? tfName("1D") : tfName(h.timeframe)}</span>
                <span>{t("fr." + (h.freshness && h.freshness.state == "live" ? "live" : (h.freshness && h.freshness.state == "delayed" ? "delayed" : "stale")))}</span>
                <span>{m.timeLabel}</span>
              </div>
              <div style={{display:"flex", gap:8, alignItems:"center", marginTop:6, flexWrap:"wrap"}}>
                <span style={{fontSize:11, color:c.text3}}>{t("sa.hist.source")}</span>
                <button onClick={function(){ openInstrument(h); }} style={btn("ghost")}>{t("sa.hist.open")}</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ---------- Page ----------
  var body;
  if(sa.phase == "loading") body = <div style={card}><div style={muted}>{t("sa.loading")}</div></div>;
  else if(sa.phase == "unconfigured") body = (
    <div style={{display:"flex", flexDirection:"column", gap:D.on ? D.gap : 12}}>
      <div style={card}><div style={head}>{t("sa.bg.title")}</div><div style={{fontSize:13, color:c.text1, lineHeight:1.5, overflowWrap:"anywhere"}}>{t("sa.unconfigured")}</div></div>
      {instrumentsCard()}
    </div>
  );
  else if(sa.phase == "error") body = <div style={card}><div style={muted}>{t("sa.err.server")}</div><button onClick={sa.refresh} style={Object.assign(btn("ghost"), {marginTop:8})}>{t("sa.check_now")}</button></div>;
  else {
    var left = (
      <div style={{display:"flex", flexDirection:"column", gap:D.on ? D.gap : 12, minWidth:0}}>
        {backgroundCard()}
        {instrumentsCard()}
        {ready && form ? formCard() : null}
        {ready ? rulesCard() : null}
      </div>
    );
    var right = ready ? historyCard() : null;
    body = D.on ? (
      <div style={{display:"grid", gridTemplateColumns:"minmax(340px, 5fr) minmax(0, 7fr)", gap:D.gap, alignItems:"start"}}>{left}<div style={{minWidth:0}}>{right}</div></div>
    ) : (
      <div style={{display:"flex", flexDirection:"column", gap:12}}>{left}{right}</div>
    );
  }

  var session = sa.srv && sa.srv.session ? sa.srv.session : null;
  return (
    <div style={{background:c.bg, minHeight:"100vh", fontFamily:"Inter,Arial,sans-serif", paddingBottom:90, boxSizing:"border-box", width:"100%", overflowX:"hidden"}}>
      <div style={{background:c.card, borderBottom:"1px solid " + c.border, padding:D.on ? D.headPad : "10px 12px", display:"flex", alignItems:"center", gap:10}}>
        <button onClick={function(){ if(props.setTab) props.setTab("home"); }} aria-label={t("sa.form.cancel")} style={{background:c.blueSoft, border:"none", borderRadius:8, minWidth:44, height:44, color:c.text1, fontSize:16, cursor:"pointer", flexShrink:0}}>&#8592;</button>
        <div style={{minWidth:0, flex:1}}>
          <div style={{fontSize:D.on ? D.title : 16, fontWeight:800, color:c.text1, overflowWrap:"anywhere"}}>{t("sa.title")}</div>
          <div style={{fontSize:11, color:c.text2, overflowWrap:"anywhere"}}>{t("sa.subtitle")}{session ? " | " + t("sa.sess." + session) : ""}</div>
        </div>
      </div>
      <div style={{maxWidth:D.on ? 1200 : 760, margin:"0 auto", padding:D.on ? D.pagePad : "12px 12px 0", boxSizing:"border-box", width:"100%"}}>
        <div style={{fontSize:12, color:c.text2, background:c.card, border:"1px solid " + c.border, borderRadius:10, padding:"8px 12px", marginBottom:D.on ? D.gap : 12, lineHeight:1.45, overflowWrap:"anywhere"}}>{t("sa.edu")}</div>
        {ready ? (
          <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:D.on ? D.gap : 12}}>
            {FILTERS.map(function(f){ return chip(t(FILTER_KEYS[f]), filter == f, function(){ setFilter(f); }, f); })}
          </div>
        ) : null}
        {body}
      </div>
    </div>
  );
}
