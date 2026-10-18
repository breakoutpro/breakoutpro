import { useState } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { buildMT } from "./MarketMoodParts";
import { getFreshnessMeta } from "./MarketMoodData";
import { buildDetailView } from "./NextMoveDetailView";
import { textOf } from "./NextMoveView";
import { useLang, t } from "../i18n/translations";

// BreakoutPro - DetailedAnalysis.jsx
// One expandable "Detailed Analysis" section under the compact Next Move card:
// A evidence, B key indicators, C market context, D market structure timeline,
// E data quality, F how it works. PRESENTATION ONLY: every row comes from
// NextMoveDetailView.js, which copies existing engine outputs (no second EMA or
// level calculation, no new request). Collapsed by default on every screen; the
// state is local to this component. Nothing renders for missing data except one
// short explanation, never an empty card or a blank bullet.
// Rules: no backtick, no triple-equals, ASCII only.

var WRAP = { overflowWrap:"anywhere", wordBreak:"break-word", minWidth:0 };
var DASH = "\u2014";

function Chip(props){
  var m = getFreshnessMeta(props.status);
  return <span style={{fontSize:9,fontWeight:800,color:m.color,background:m.color+"18",border:"1px solid "+m.color+"40",borderRadius:5,padding:"1px 5px",flexShrink:0,whiteSpace:"nowrap"}}>{m.text}</span>;
}

function Sec(props){
  var MT = props.MT;
  return (
    <section style={{marginTop:props.first ? 0 : 12,paddingTop:props.first ? 0 : 10,borderTop:props.first ? "none" : "1px solid "+MT.BD,minWidth:0}}>
      <div role="heading" aria-level={3} style={Object.assign({fontSize:12,fontWeight:800,color:MT.T1,marginBottom:6}, WRAP)}>{props.title}</div>
      {props.children}
    </section>
  );
}

function Note(props){
  return <div style={Object.assign({fontSize:11,lineHeight:1.4,color:props.color || props.MT.T3,marginTop:props.top==null ? 4 : props.top}, WRAP)}>{props.children}</div>;
}

function EvidenceSection(props){
  var MT = props.MT, ev = props.v.evidence, wide = props.wide;
  if(!ev.available) return <Note MT={MT} top={0} color={MT.T2}>{ev.unavailText}</Note>;
  return (
    <div style={{display:"grid",gridTemplateColumns: wide ? "repeat(auto-fit, minmax(280px, 1fr))" : "minmax(0, 1fr)",gap:8}}>
      {ev.groups.map(function(g){
        var sup = g.id=="first";
        var mark = sup ? "\u25b2" : "\u25c6";
        var markColor = sup ? MT.SENT_GREEN : MT.WARN;
        return (
          <div key={g.id} style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:8,padding:"7px 9px",minWidth:0,boxSizing:"border-box"}}>
            <div style={Object.assign({fontSize:10,fontWeight:800,color:MT.T2,marginBottom:4,letterSpacing:0.3}, WRAP)}>{g.title}</div>
            {g.rows.length ? g.rows.map(function(r, i){
              return (
                <div key={r.id + i} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:i==g.rows.length-1 ? 0 : 5}}>
                  <span aria-hidden="true" style={{fontSize:10,lineHeight:"16px",color:markColor,flexShrink:0,width:12,textAlign:"center"}}>{mark}</span>
                  <span style={Object.assign({fontSize:11,lineHeight:1.4,color:MT.T1,flex:"1 1 auto"}, WRAP)}><b>{r.lead}</b>{r.rest}</span>
                  <Chip status={r.status}/>
                </div>
              );
            }) : <div style={Object.assign({fontSize:11,lineHeight:1.4,color:MT.T3}, WRAP)}>{g.empty}</div>}
          </div>
        );
      })}
    </div>
  );
}

function IndicatorsSection(props){
  var MT = props.MT, rows = props.v.indicators, wide = props.wide;
  var anyForming = rows.some(function(r){ return r.forming; });
  var th = { fontSize:10, fontWeight:800, color:MT.T3, textAlign:"left", padding:"4px 6px", borderBottom:"1px solid "+MT.BD, verticalAlign:"bottom" };
  var td = { fontSize:11, color:MT.T1, padding:"6px 6px", borderBottom:"1px solid "+MT.BD, verticalAlign:"top", overflowWrap:"anywhere" };
  return (
    <div>
      {wide ? (
        <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"auto"}}>
          <thead>
            <tr>
              <th style={th}>{t("nm.da.ind.h.inst")}</th>
              <th style={th}>{t("nm.da.ind.h.price")}</th>
              <th style={th}>EMA 9</th>
              <th style={th}>EMA 21</th>
              <th style={th}>{t("nm.da.ind.h.read")}</th>
              <th style={th}>{t("nm.da.ind.h.src")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(function(r){
              return (
                <tr key={r.id} data-testid={"nm-ind-" + r.id}>
                  <td style={Object.assign({}, td, {fontWeight:800})}>{r.name}</td>
                  <td style={td}>{r.price}</td>
                  <td style={td}>{r.ema9}</td>
                  <td style={td}>{r.ema21}</td>
                  <td style={td}>{r.interp}</td>
                  <td style={td}><span style={{display:"inline-flex",flexWrap:"wrap",gap:"3px 6px",alignItems:"center"}}><Chip status={r.status}/>{r.candle ? <span style={{fontSize:10,color:MT.T2}}>{r.candle}</span> : null}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div>
          {rows.map(function(r){
            function line(label, val){
              return (
                <div style={{display:"flex",justifyContent:"space-between",gap:8,fontSize:11,marginTop:3}}>
                  <span style={{color:MT.T3,flexShrink:0}}>{label}</span>
                  <span style={Object.assign({color:MT.T1,fontWeight:700,textAlign:"right"}, WRAP)}>{val}</span>
                </div>
              );
            }
            return (
              <div key={r.id} data-testid={"nm-ind-" + r.id} style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:8,padding:"7px 9px",marginBottom:6,minWidth:0,boxSizing:"border-box"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,fontWeight:800,color:MT.T1}}>{r.name}</span>
                  <span style={{display:"inline-flex",gap:6,alignItems:"center"}}><Chip status={r.status}/></span>
                </div>
                {r.have ? line(t("nm.da.ind.h.price"), r.price) : null}
                {r.have ? line("EMA 9", r.ema9) : null}
                {r.have ? line("EMA 21", r.ema21) : null}
                <div style={Object.assign({fontSize:11,lineHeight:1.4,color:MT.T1,marginTop:4}, WRAP)}>{r.interp}</div>
                {r.candle ? <div style={{fontSize:10,color:MT.T3,marginTop:2}}>{r.candle}</div> : null}
              </div>
            );
          })}
        </div>
      )}
      <Note MT={MT} top={4}>{t("nm.da.ind.basis")}{anyForming ? " " + t("nm.da.ind.forming") : ""}</Note>
    </div>
  );
}

function ContextSection(props){
  var MT = props.MT, c = props.v.context;
  if(!c || !c.available) return <Note MT={MT} top={0} color={MT.T2}>{c ? c.unavailableText : ""}</Note>;
  var moodColor = c.mood && /Bullish/i.test(c.mood) ? MT.SENT_GREEN : (c.mood && /Bearish/i.test(c.mood) ? MT.SENT_RED : MT.SENT_YELLOW);
  var rowS = { display:"flex", flexWrap:"wrap", alignItems:"center", gap:"3px 8px", marginTop:4, fontSize:11, color:MT.T1 };
  return (
    <div data-testid="nm-context">
      <div style={Object.assign({}, rowS, {marginTop:0})}>
        <span style={{color:MT.T3,fontSize:10,fontWeight:700}}>{t("nm.da.c.mood")}</span>
        <span style={{fontSize:13,fontWeight:900,color:moodColor}}>{c.mood}</span>
        <span style={{fontSize:10,fontWeight:700,color:MT.T2,background:MT.T2+"18",border:"1px solid "+MT.T2+"40",borderRadius:5,padding:"1px 6px"}}>{c.score}</span>
        <Chip status={c.status}/>
        {c.asOf ? <span style={{fontSize:10,color:MT.T3}}>{t("nm.asof", { t:c.asOf })}</span> : null}
      </div>
      {c.trend ? <div style={rowS}><span style={{color:MT.T3,fontSize:10,fontWeight:700}}>{t("nm.da.c.trend")}</span><span style={WRAP}>{c.trend}</span></div> : null}
      {c.vix ? (
        <div style={rowS}>
          <span style={{color:MT.T3,fontSize:10,fontWeight:700}}>{t("nm.da.in.vix")}</span>
          {c.vix.ok ? <span style={{fontWeight:800}}>{c.vix.value}</span> : <span style={Object.assign({color:MT.T2}, WRAP)}>{t("nm.da.c.vixbad")}</span>}
          <Chip status={c.vix.status}/>
          {c.vix.ok && c.vix.asOf ? <span style={{fontSize:10,color:MT.T3}}>{t("nm.asof", { t:c.vix.asOf })}</span> : null}
        </div>
      ) : null}
      {c.sector ? <div style={rowS}><span style={{color:MT.T3,fontSize:10,fontWeight:700}}>{t("nm.da.c.sect")}</span><span style={WRAP}>{c.sector}</span></div> : null}
      {c.stale ? <Note MT={MT} color={MT.WARN}>{t("nm.da.c.stale")}</Note> : null}
      <Note MT={MT}>{t("nm.da.c.note")}</Note>
    </div>
  );
}

function TimelineSection(props){
  var MT = props.MT, tl = props.v.timeline;
  if(!tl.entries.length) return <Note MT={MT} top={0} color={MT.T2}>{tl.empty}</Note>;
  return (
    <div data-testid="nm-timeline">
      {tl.entries.map(function(e, i){
        var last = i==tl.entries.length-1;
        var col = e.status=="confirmed" ? MT.SENT_GREEN : (e.status=="developing" ? MT.BLUE : (e.current ? MT.BLUE : MT.T3));
        return (
          <div key={e.id} style={{display:"flex",gap:8,alignItems:"stretch"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:10,flexShrink:0}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:col,marginTop:4,flexShrink:0}}></span>
              {!last ? <span style={{width:1,flex:1,background:MT.BD,marginTop:2}}></span> : null}
            </div>
            <div style={{flex:"1 1 auto",minWidth:0,paddingBottom:last ? 0 : 8}}>
              <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"2px 8px"}}>
                <span style={Object.assign({fontSize:11,fontWeight:e.current ? 900 : 800,color:e.current ? MT.T1 : MT.T1}, WRAP)}>{e.label}</span>
                <span style={{fontSize:9,fontWeight:800,color:col,background:col+"18",border:"1px solid "+col+"40",borderRadius:5,padding:"1px 5px",whiteSpace:"nowrap"}}>{t("nm.da.tl.st." + e.status)}</span>
                {e.when ? <span style={{fontSize:10,color:MT.T3}}>{e.when}</span> : null}
              </div>
              <div style={Object.assign({fontSize:11,lineHeight:1.4,color:MT.T2,marginTop:1}, WRAP)}>{e.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QualitySection(props){
  var MT = props.MT, q = props.v.quality, wide = props.wide;
  if(!q) return null;
  var th = { fontSize:10, fontWeight:800, color:MT.T3, textAlign:"left", padding:"4px 6px", borderBottom:"1px solid "+MT.BD };
  var td = { fontSize:11, color:MT.T1, padding:"5px 6px", borderBottom:"1px solid "+MT.BD, verticalAlign:"top", overflowWrap:"anywhere" };
  function reasonText(r){ return r.reason && !r.used ? textOf(t, "dir.r." + r.reason) : ""; }
  function usedText(r){ return r.used ? t("nm.da.e.yes") : t("nm.da.e.no"); }
  return (
    <div data-testid="nm-quality">
      {q.essentialUsed ? <Note MT={MT} top={0} color={MT.T1}>{t("nm.da.e.ess", { list:q.essentialUsed })}</Note> : null}
      {q.essentialMissing ? <Note MT={MT} top={q.essentialUsed ? 2 : 0} color={MT.WARN}>{t("nm.da.e.ess_missing", { list:q.essentialMissing })}</Note> : null}
      {q.optionalExcluded ? <Note MT={MT} top={2} color={MT.T2}>{t("nm.da.e.opt", { list:q.optionalExcluded })}</Note> : null}
      {q.reliab ? <Note MT={MT} top={2} color={q.reliabKey=="ok" ? MT.T2 : MT.WARN}>{q.reliab}</Note> : null}
      <div style={{marginTop:8}}>
        {wide ? (
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr><th style={th}>{t("nm.da.e.h.input")}</th><th style={th}>{t("nm.da.e.h.status")}</th><th style={th}>{t("nm.da.e.h.time")}</th><th style={th}>{t("nm.da.e.h.used")}</th></tr></thead>
            <tbody>
              {q.rows.map(function(r){
                var why = reasonText(r);
                return (
                  <tr key={r.id}>
                    <td style={td}>{r.name}</td>
                    <td style={td}><span style={{display:"inline-flex",flexWrap:"wrap",gap:"3px 6px",alignItems:"center"}}><Chip status={r.status}/>{why ? <span style={{fontSize:10,color:MT.T3}}>{why}</span> : null}</span></td>
                    <td style={td}>{r.time || DASH}</td>
                    <td style={Object.assign({}, td, {fontWeight:800,color:r.used ? MT.SENT_GREEN : MT.T3})}>{usedText(r)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div>
            {q.rows.map(function(r, i){
              var why = reasonText(r);
              return (
                <div key={r.id} style={{padding:"5px 0",borderTop:i>0 ? "1px solid "+MT.BD : "none"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                    <span style={Object.assign({fontSize:11,fontWeight:700,color:MT.T1}, WRAP)}>{r.name}</span>
                    <span style={{display:"inline-flex",gap:6,alignItems:"center",flexShrink:0}}>
                      <Chip status={r.status}/>
                      <span style={{fontSize:10,fontWeight:800,color:r.used ? MT.SENT_GREEN : MT.T3,minWidth:22,textAlign:"right"}}>{usedText(r)}</span>
                    </span>
                  </div>
                  <div style={Object.assign({fontSize:10,color:MT.T3,marginTop:1}, WRAP)}>{(r.time || DASH) + (why ? " \u00b7 " + why : "")}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DetailedAnalysis(props){
  useLang();
  var theme = useTheme();
  var MT = buildMT(theme);
  var stOpen = useState(false);       // collapsed by default on mobile and desktop
  var controlled = typeof props.open=="boolean";   // optional: a parent that can be remounted keeps the state
  var open = controlled ? props.open : stOpen[0], setOpen = stOpen[1];
  function toggle(){ if(props.onOpenChange) props.onOpenChange(!open); if(!controlled) setOpen(!open); }
  var m = props.nextMove;
  if(!m) return null;
  var wide = !!props.wideLayout;
  var v = open ? buildDetailView({ nm:m, mood:props.mood, evolution:props.evolution, vixQuote:props.vixQuote, usingDemo:!!props.usingDemo }, t) : null;
  var panelId = "nm-da-panel", btnId = "nm-da-btn";
  return (
    <div data-testid="nm-detail" style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:8,marginBottom:props.gapV || 6,boxSizing:"border-box",minWidth:0}}>
      <button id={btnId} type="button" aria-expanded={open} aria-controls={panelId} onClick={toggle}
        style={{display:"flex",alignItems:"center",gap:10,width:"100%",boxSizing:"border-box",background:"transparent",border:"none",padding:props.padV || 10,color:MT.T1,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
        <span style={{flex:"1 1 auto",minWidth:0}}>
          <span style={Object.assign({display:"block",fontSize:13,fontWeight:800,color:MT.T1}, WRAP)}>{t("nm.da.title")}</span>
          <span style={Object.assign({display:"block",fontSize:10,color:MT.T3,marginTop:2,lineHeight:1.4}, WRAP)}>{t("nm.da.sub")}</span>
        </span>
        <span aria-hidden="true" style={{fontSize:14,color:MT.T2,flexShrink:0,width:16,textAlign:"center"}}>{open ? "\u25b4" : "\u25be"}</span>
      </button>
      {open && v ? (
        <div id={panelId} role="region" aria-labelledby={btnId} style={{padding:"0 " + (props.padV || 10) + "px " + (props.padV || 10) + "px",borderTop:"1px solid "+MT.BD,paddingTop:10,minWidth:0}}>
          <Sec MT={MT} first={true} title={t("nm.da.a.title")}><EvidenceSection MT={MT} v={v} wide={wide}/></Sec>
          <Sec MT={MT} title={t("nm.da.b.title")}><IndicatorsSection MT={MT} v={v} wide={wide}/></Sec>
          <Sec MT={MT} title={t("nm.da.c.title")}><ContextSection MT={MT} v={v}/></Sec>
          <Sec MT={MT} title={t("nm.da.d.title")}><TimelineSection MT={MT} v={v}/></Sec>
          <Sec MT={MT} title={t("nm.da.e.title")}><QualitySection MT={MT} v={v} wide={wide}/></Sec>
          {v.how.length ? (
            <Sec MT={MT} title={t("nm.da.f.title")}>
              {v.how.map(function(h, i){
                return (
                  <div key={i} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:i==v.how.length-1 ? 0 : 4}}>
                    <span aria-hidden="true" style={{fontSize:10,lineHeight:"16px",color:MT.T3,flexShrink:0,width:12,textAlign:"center"}}>{"\u2022"}</span>
                    <span style={Object.assign({fontSize:11,lineHeight:1.4,color:MT.T2}, WRAP)}>{h}</span>
                  </div>
                );
              })}
            </Sec>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
