import { useState } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { buildMT } from "./MarketMoodParts";
import { getFreshnessMeta } from "./MarketMoodData";
import { useLang, t } from "../i18n/translations";

// BreakoutPro - EarlyDirectionPanel.jsx
// Early Market Direction Intelligence panel for the AI Market Mood page.
// PRESENTATION ONLY: every verdict, signal, level and status comes from
// DirectionEngine.js (pure, rule-based). All text goes through the existing
// i18n system (t / useLang); market terms such as NIFTY 50, BANK NIFTY, EMA and
// Crude Oil stay in English inside the translated sentences. Numbers are
// formatted en-IN by the engine and are never translated.
// No probability or accuracy figure is shown anywhere: confidence is a
// qualitative level that describes the evidence, not the market's next move.
// Rules: no backtick, no triple-equals, ASCII only.

function fmtTime(ts){
  if(ts==null) return null;
  try{
    return new Date(ts).toLocaleString("en-IN", { timeZone:"Asia/Kolkata", day:"numeric", month:"short", hour:"numeric", minute:"2-digit", hour12:true }) + " IST";
  }catch(e){ return null; }
}

var WRAP = { overflowWrap:"anywhere", wordBreak:"break-word", minWidth:0 };

function EvidenceList(props){
  var MT = props.MT;
  var items = props.items || [];
  if(!items.length){
    return <div style={{fontSize:11,color:MT.T3}}>{t("dir.none")}</div>;
  }
  return (
    <div>
      {items.map(function(it, i){
        var mark = props.mark || "\u2022";
        return (
          <div key={it.id + "-" + i} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:5}}>
            <span aria-hidden="true" style={{fontSize:10,lineHeight:"15px",color:props.markColor || MT.T2,flexShrink:0,width:12,textAlign:"center"}}>{mark}</span>
            <span style={Object.assign({fontSize:11,lineHeight:1.4,color:MT.T1}, WRAP)}>{t(it.key, it.vars)}</span>
          </div>
        );
      })}
    </div>
  );
}

function Block(props){
  var MT = props.MT;
  return (
    <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:8,padding:"8px 9px",boxSizing:"border-box",minWidth:0}}>
      <div style={Object.assign({fontSize:10,fontWeight:800,color:MT.T2,marginBottom:6,letterSpacing:0.3}, WRAP)}>{props.title}</div>
      {props.children}
    </div>
  );
}

function Chip(props){
  var MT = props.MT;
  var c = props.color || MT.T2;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,color:c,background:c+"18",border:"1px solid "+c+"45",borderRadius:6,padding:"3px 8px",maxWidth:"100%",boxSizing:"border-box"}}>
      <span style={Object.assign({color:MT.T3,fontWeight:600}, WRAP)}>{props.label}</span>
      <span style={WRAP}>{props.value}</span>
    </span>
  );
}

function InputRow(props){
  var MT = props.MT, inp = props.inp;
  var st = inp.status;
  var meta = getFreshnessMeta(st, MT.C);
  var color = meta.color;
  var when = fmtTime(inp.asOf);
  var reasonText = inp.reason ? t("dir.r." + inp.reason) : "";
  var usedText = inp.used ? t("dir.used") : t("dir.not_used");
  return (
    <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"4px 8px",padding:"5px 0",borderTop:"1px solid "+MT.BD}}>
      <div style={Object.assign({flex:"1 1 150px",fontSize:11,color:MT.T1,fontWeight:700}, WRAP)}>{t("dir.in." + inp.id)}</div>
      <span style={{fontSize:10,fontWeight:800,color:color,background:color+"18",border:"1px solid "+color+"40",borderRadius:5,padding:"2px 6px",flexShrink:0}}>{st=="DEMO" ? "DEMO" : st}</span>
      <div style={Object.assign({flex:"1 1 150px",fontSize:10,color:MT.T2}, WRAP)}>
        {when ? (t("dir.updated") + " " + when) : t("dir.time_na")}
        {" \u00b7 "}
        <span style={{color: inp.used ? MT.T1 : MT.T3}}>{usedText}{(!inp.used && reasonText) ? " (" + reasonText + ")" : ""}</span>
      </div>
    </div>
  );
}

export default function EarlyDirectionPanel(props){
  useLang(); // re-render the instant the language changes (no reload)
  var theme = useTheme(); // existing ThemeProvider
  var MT = buildMT(theme);
  var d = props.direction;
  var padV = props.padV || 10;
  var wide = !!props.wideLayout;
  var [showInputs, setShowInputs] = useState(true);
  if(!d) return null;

  var outColor = d.outlook=="bullish" ? MT.SENT_GREEN : (d.outlook=="bearish" ? MT.SENT_RED : (d.outlook=="neutral" ? MT.SENT_YELLOW : MT.T2));
  var outGlyph = d.outlook=="bullish" ? "\u25b2" : (d.outlook=="bearish" ? "\u25bc" : (d.outlook=="neutral" ? "\u25c6" : "\u25cb"));
  var directional = d.outlook=="bullish" || d.outlook=="bearish";
  var neutral = d.outlook=="neutral";
  var insufficient = d.outlook=="insufficient";
  var confColor = d.confidence=="high" ? MT.BLUE : (d.confidence=="moderate" ? MT.SENT_YELLOW : MT.T2);
  var grid = { display:"grid", gridTemplateColumns: wide ? "repeat(auto-fit, minmax(260px, 1fr))" : "minmax(0, 1fr)", gap:6, marginTop:8 };

  return (
    <div data-testid="early-direction" style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:8,padding:padV,marginBottom:props.gapV || 6,boxSizing:"border-box",minWidth:0}}>
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"4px 8px",marginBottom:2}}>
        <div style={Object.assign({fontSize:12,fontWeight:800,color:MT.T1,letterSpacing:0.3}, WRAP)}>{t("dir.title").toUpperCase()}</div>
      </div>
      <div style={Object.assign({fontSize:11,color:MT.T3,marginBottom:8,lineHeight:1.4}, WRAP)}>{t("dir.sub")}</div>

      {/* OUTLOOK: direction, shown separately from confidence */}
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"6px 10px"}}>
        <span aria-hidden="true" style={{fontSize:14,color:outColor,flexShrink:0}}>{outGlyph}</span>
        <span style={Object.assign({fontSize:16,fontWeight:900,color:outColor,lineHeight:1.25,flex:"1 1 200px"}, WRAP)}>{t("dir.out." + d.outlook)}</span>
      </div>
      {!insufficient ? (
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
          {directional && d.stage ? <Chip MT={MT} color={outColor} label={t("dir.stage")} value={t("dir.stage." + d.stage)}/> : null}
          <Chip MT={MT} color={confColor} label={t("dir.conf")} value={t("dir.conf." + d.confidence)}/>
        </div>
      ) : null}
      {directional && d.stage ? <div style={Object.assign({fontSize:11,color:MT.T2,marginTop:6,lineHeight:1.4}, WRAP)}>{t("dir.stage." + d.stage + ".d")}</div> : null}
      {!insufficient ? <div style={Object.assign({fontSize:10,color:MT.T3,marginTop:4,lineHeight:1.4}, WRAP)}>{t("dir.conf.note")}</div> : null}

      {/* Honest basis notes */}
      {d.reasons && d.reasons.length ? (
        <div style={{marginTop:8}}>
          {d.reasons.map(function(r, i){
            return <div key={i} style={Object.assign({fontSize:11,color: insufficient ? MT.WARN : MT.T2,lineHeight:1.4,marginBottom:3}, WRAP)}>{t(r.key, r.vars)}</div>;
          })}
        </div>
      ) : null}
      {!insufficient && d.basisClose ? <div style={Object.assign({fontSize:10,color:MT.T3,marginTop:4}, WRAP)}>{t("dir.basis_close")}</div> : null}
      {!insufficient && d.provisional ? <div style={Object.assign({fontSize:10,color:MT.T3,marginTop:4}, WRAP)}>{t("dir.provisional")}</div> : null}
      {!insufficient && d.volatilityCaution ? <div style={Object.assign({fontSize:10,color:MT.WARN,marginTop:4}, WRAP)}>{t("dir.vol_caution")}</div> : null}

      {/* EXPLANATION: evidence for and against */}
      {directional ? (
        <div style={grid}>
          <Block MT={MT} title={t("dir.supports")}><EvidenceList MT={MT} items={d.supports} mark={d.outlook=="bullish" ? "\u25b2" : "\u25bc"} markColor={outColor}/></Block>
          <Block MT={MT} title={t("dir.contra")}><EvidenceList MT={MT} items={d.contradicts} mark={"\u25c6"} markColor={MT.WARN}/></Block>
        </div>
      ) : null}
      {neutral ? (
        <div style={grid}>
          <Block MT={MT} title={t("dir.bull_ev")}><EvidenceList MT={MT} items={d.bullEvidence} mark={"\u25b2"} markColor={MT.SENT_GREEN}/></Block>
          <Block MT={MT} title={t("dir.bear_ev")}><EvidenceList MT={MT} items={d.bearEvidence} mark={"\u25bc"} markColor={MT.SENT_RED}/></Block>
          {d.caveats && d.caveats.length ? <Block MT={MT} title={t("dir.mixed_ev")}><EvidenceList MT={MT} items={d.caveats} mark={"\u25c6"} markColor={MT.SENT_YELLOW}/></Block> : null}
        </div>
      ) : null}

      {/* CONDITIONS: what strengthens, what weakens or invalidates */}
      {directional ? (
        <div style={grid}>
          <Block MT={MT} title={t("dir.strengthen")}><ConditionList MT={MT} items={d.strengthen}/></Block>
          <Block MT={MT} title={t("dir.weaken")}><ConditionList MT={MT} items={d.weaken}/></Block>
        </div>
      ) : null}
      {neutral ? (
        <div style={grid}>
          <Block MT={MT} title={t("dir.watch")}><ConditionList MT={MT} items={(d.strengthen || []).concat(d.weaken || [])}/></Block>
        </div>
      ) : null}

      {/* Macro / volatility context (Crude Oil, Natural Gas, VIX notes) */}
      {d.context && d.context.length ? (
        <div style={grid}>
          <Block MT={MT} title={t("dir.context")}><EvidenceList MT={MT} items={d.context} mark={"\u2022"}/></Block>
        </div>
      ) : null}

      {/* INPUTS: source status and last update time for every input */}
      <div style={{marginTop:10}}>
        <button type="button" onClick={function(){ setShowInputs(!showInputs); }} aria-expanded={showInputs} style={{background:"transparent",border:"1px solid "+MT.BD,borderRadius:6,padding:"4px 8px",color:MT.BLUE,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",maxWidth:"100%"}}>
          {showInputs ? t("dir.hide_inputs") : t("dir.show_inputs")}
        </button>
        {showInputs ? (
          <div style={{marginTop:6}}>
            <div style={Object.assign({fontSize:10,fontWeight:800,color:MT.T2,marginBottom:2}, WRAP)}>{t("dir.inputs")}</div>
            {(d.inputs || []).map(function(inp){ return <InputRow key={inp.id} MT={MT} inp={inp}/>; })}
            <div style={Object.assign({fontSize:10,color:MT.T3,marginTop:6,lineHeight:1.4}, WRAP)}>{t("dir.st_legend")}</div>
            {d.limits && d.limits.length ? <div style={Object.assign({fontSize:10,color:MT.T3,marginTop:4,lineHeight:1.4}, WRAP)}>{t("dir.limits")}</div> : null}
          </div>
        ) : null}
      </div>

      <div style={Object.assign({fontSize:10,color:MT.WARN,marginTop:10,lineHeight:1.4,fontWeight:700}, WRAP)}>{t("dir.disclaimer")}</div>
    </div>
  );
}

function ConditionList(props){
  var MT = props.MT;
  var items = props.items || [];
  if(!items.length) return <div style={{fontSize:11,color:MT.T3}}>{t("dir.none")}</div>;
  return (
    <div>
      {items.map(function(c, i){
        return (
          <div key={c.key + "-" + i} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:5}}>
            <span aria-hidden="true" style={{fontSize:10,lineHeight:"15px",color:MT.T2,flexShrink:0,width:12,textAlign:"center"}}>{"\u2192"}</span>
            <span style={Object.assign({fontSize:11,lineHeight:1.4,color:MT.T1}, WRAP)}>{t(c.key, c.vars)}</span>
          </div>
        );
      })}
    </div>
  );
}
