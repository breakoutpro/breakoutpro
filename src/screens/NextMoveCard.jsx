import { useTheme } from "../theme/ThemeProvider";
import { buildMT } from "./MarketMoodParts";
import { getFreshnessMeta } from "./MarketMoodData";
import { fmtNum } from "./DirectionEngine";
import { useLang, t } from "../i18n/translations";
import { buildNextMoveView } from "./NextMoveView";

// BreakoutPro - NextMoveCard.jsx
// Next Move Intelligence card (top of the former AI Market Mood page).
// PRESENTATION ONLY: every assessment, level, status and time comes from
// NextMoveEngine.js, which reuses DirectionEngine.js (daily candles, validated
// provider timestamps). Times are the PROVIDER source times in IST, never the
// time this phone received the response. No probability, accuracy or win rate
// is shown anywhere: confidence is always "not yet validated".
// Rules: no backtick, no triple-equals, ASCII only.

function fmtTime(ts){
  if(ts==null) return null;
  try{
    return new Date(ts).toLocaleString("en-IN", { timeZone:"Asia/Kolkata", day:"numeric", month:"short", hour:"numeric", minute:"2-digit", hour12:true });
  }catch(e){ return null; }
}
function fmtDay(ts){
  if(ts==null) return null;
  try{
    return new Date(ts).toLocaleString("en-IN", { timeZone:"Asia/Kolkata", day:"numeric", month:"short" });
  }catch(e){ return null; }
}

var WRAP = { overflowWrap:"anywhere", wordBreak:"break-word", minWidth:0 };

function Block(props){
  var MT = props.MT;
  if(!props.lines || !props.lines.length) return null;   // never an empty box
  var MAXL = 4;                                            // keep the card compact; the full list is in the detailed evidence
  var shown = props.lines.slice(0, MAXL);
  var extra = props.lines.length - shown.length;
  return (
    <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:8,padding:"7px 9px",boxSizing:"border-box",minWidth:0}}>
      <div style={Object.assign({fontSize:10,fontWeight:800,color:props.titleColor || MT.T2,marginBottom:4,letterSpacing:0.3}, WRAP)}>{props.title}</div>
      {shown.map(function(txt, i){
        return (
          <div key={i} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:(i==shown.length-1 && !extra) ? 0 : 4}}>
            <span aria-hidden="true" style={{fontSize:10,lineHeight:"15px",color:props.markColor || MT.T2,flexShrink:0,width:12,textAlign:"center"}}>{props.mark || "\u2022"}</span>
            <span style={Object.assign({fontSize:11,lineHeight:1.4,color:MT.T1}, WRAP)}>{txt}</span>
          </div>
        );
      })}
      {extra>0 ? <div style={{fontSize:10,color:MT.T3,paddingLeft:18}}>{t("nm.more", { n:String(extra) })}</div> : null}
    </div>
  );
}

function Scenario(props){
  var MT = props.MT, s = props.s;
  var bull = s.side=="bull";
  var sideColor = bull ? MT.SENT_GREEN : MT.SENT_RED;
  var stColor = s.status=="confirmed" ? sideColor : (s.status=="triggered" ? MT.BLUE : (s.status=="waiting" ? MT.T2 : MT.WARN));
  return (
    <div data-testid={bull ? "nm-bull" : "nm-bear"} style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:8,padding:"7px 9px",boxSizing:"border-box",minWidth:0}}>
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"4px 8px",marginBottom:4}}>
        <span aria-hidden="true" style={{fontSize:11,color:sideColor}}>{bull ? "\u25b2" : "\u25bc"}</span>
        <span style={Object.assign({fontSize:12,fontWeight:800,color:sideColor,flex:"1 1 110px"}, WRAP)}>{t(bull ? "nm.scn.bull" : "nm.scn.bear")}</span>
        <span style={{fontSize:10,fontWeight:800,color:stColor,background:stColor+"18",border:"1px solid "+stColor+"45",borderRadius:5,padding:"2px 6px",flexShrink:0}}>{s.statusText}</span>
      </div>
      {s.rows.map(function(r, i){
        return (
          <div key={i} style={{marginBottom:i==s.rows.length-1 ? 0 : 4}}>
            <span style={Object.assign({fontSize:10,fontWeight:700,color:MT.T3}, WRAP)}>{r.label}: </span>
            <span style={Object.assign({fontSize:11,lineHeight:1.4,color:MT.T1}, WRAP)}>{r.text}</span>
          </div>
        );
      })}
    </div>
  );
}

function Pill(props){
  return <span style={{fontSize:10,fontWeight:800,color:props.color,background:props.color+"18",border:"1px solid "+props.color+"40",borderRadius:5,padding:"2px 6px",flexShrink:0}}>{props.text}</span>;
}

// Daily candle / trend status. Separate from the live quote status: a live
// quote does not make the daily candles current.
function trendMeta(f, MT){
  var st = f ? f.lastBarStatus : null;
  if(!f || f.lastBarAsOf==null || st==null || st=="UNAVAILABLE") return { text:t("nm.trend.na"), color:MT.T3 };
  if(st=="STALE") return { text:t("nm.trend.stale"), color:MT.WARN };
  if(f.behind) return { text:t("nm.trend.behind"), color:MT.WARN };
  return { text:t("nm.trend.ok"), color:MT.T2 };
}

export default function NextMoveCard(props){
  useLang();
  var theme = useTheme();
  var MT = buildMT(theme);
  var m = props.nextMove;
  var padV = props.padV || 10;
  if(!m) return null;
  var v = buildNextMoveView(m, t);
  var unavailable = m.state!="ok";
  var a = m.assessment;
  var color = (a=="upside" || a=="reversal_up") ? MT.SENT_GREEN : ((a=="downside" || a=="reversal_dn") ? MT.SENT_RED : (a=="range" ? MT.SENT_YELLOW : (unavailable ? MT.WARN : MT.T2)));
  var glyph = (a=="upside" || a=="reversal_up") ? "\u25b2" : ((a=="downside" || a=="reversal_dn") ? "\u25bc" : (a=="range" ? "\u25c6" : "\u25cb"));
  var wide = !!props.wideLayout;
  var grid2 = { display:"grid", gridTemplateColumns: wide ? "repeat(auto-fit, minmax(260px, 1fr))" : "minmax(0, 1fr)", gap:6, marginTop:6 };
  var p = m.price, f = m.freshness;
  var quoteStatus = f && f.quoteStatus ? f.quoteStatus : "UNAVAILABLE";
  var qmeta = getFreshnessMeta(p && p.kind=="live" ? "LIVE" : quoteStatus, theme.c);
  var tQuote = f ? fmtTime(f.quoteAsOf) : null;
  var tBar = f ? fmtDay(f.lastBarAsOf) : null;
  var tm = trendMeta(f, MT);
  var rowLbl = { fontSize:10, fontWeight:700, color:MT.T3, minWidth:62, flexShrink:0 };
  var evBlocks = [
    { id:"for", title:t("nm.ev.for"), lines:v.forLines, mark:"\u25b2", markColor:MT.SENT_GREEN },
    { id:"against", title:t("nm.ev.against"), lines:v.againstLines, mark:"\u25c6", markColor:MT.WARN },
    { id:"confirms", title:t("nm.confirms.title"), lines:v.confirmLines, mark:"\u2192" },
    { id:"invalidates", title:t("nm.invalidates.title"), lines:v.invalidateLines, mark:"\u2192" }
  ].filter(function(x){ return x.lines.length>0; });

  return (
    <div data-testid="next-move" style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:8,padding:padV,marginBottom:props.gapV || 6,boxSizing:"border-box",minWidth:0}}>
      <div style={Object.assign({fontSize:12,fontWeight:800,color:MT.T1,letterSpacing:0.3}, WRAP)}>{t("nm.title").toUpperCase()}</div>
      <div style={Object.assign({fontSize:10,color:MT.T3,marginTop:2,marginBottom:6,lineHeight:1.4}, WRAP)}>{t("nm.sub")}</div>

      {/* 1. NEXT MOVE ASSESSMENT */}
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"4px 10px"}}>
        <span aria-hidden="true" style={{fontSize:15,color:color,flexShrink:0}}>{glyph}</span>
        <span data-testid="nm-assessment" style={Object.assign({fontSize:17,fontWeight:900,color:color,lineHeight:1.25,flex:"1 1 200px"}, WRAP)}>{t("nm.assess." + a)}</span>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"4px 8px",alignItems:"center",marginTop:6}}>
        <span data-testid="nm-confidence" style={{fontSize:10,fontWeight:700,color:MT.T2,background:MT.T2+"18",border:"1px solid "+MT.T2+"45",borderRadius:6,padding:"2px 7px",maxWidth:"100%",boxSizing:"border-box",overflowWrap:"anywhere"}}>{t("nm.conf")}</span>
        <span style={Object.assign({fontSize:10,color:MT.T3,lineHeight:1.4}, WRAP)}>{t("nm.basis")}</span>
      </div>

      {/* 2. SETUP STATUS AND DATA FRESHNESS: live quote and daily trend are separate */}
      <div style={{marginTop:8,paddingTop:6,borderTop:"1px solid "+MT.BD}}>
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"3px 8px",marginBottom:4}}>
          <span style={rowLbl}>{t("nm.row.quote")}</span>
          {p ? <span style={Object.assign({fontSize:12,fontWeight:800,color:MT.T1}, WRAP)}>{t(p.kind=="live" ? "nm.price.live" : "nm.price.last")}: {fmtNum(p.ltp)}</span> : null}
          <Pill color={qmeta.color} text={p && p.kind=="live" ? "LIVE" : qmeta.text}/>
          <span style={Object.assign({fontSize:10,color:MT.T2}, WRAP)}>{tQuote ? t("nm.asof", { t:tQuote }) : t("nm.src.na")}</span>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"3px 8px"}}>
          <span style={rowLbl}>{t("nm.row.trend")}</span>
          <Pill color={tm.color} text={tm.text}/>
          <span style={Object.assign({fontSize:10,color:MT.T2}, WRAP)}>{tBar ? t("nm.candle", { t:tBar }) : ""}</span>
        </div>
        {m.session ? <div style={{fontSize:10,color:MT.T3,marginTop:4}}>{t("nm.row.session")}: {t("nm.sess." + m.session, m.session)}</div> : null}
        {f && f.behind ? <div style={Object.assign({fontSize:10,color:MT.WARN,marginTop:3,lineHeight:1.4}, WRAP)}>{t("nm.behind")}</div> : null}
      </div>

      {unavailable ? (
        <div style={{marginTop:8}}>
          {v.reasons.map(function(r, i){
            return <div key={i} style={Object.assign({fontSize:11,color:MT.WARN,lineHeight:1.4,marginBottom:3}, WRAP)}>{r}</div>;
          })}
          {v.missingText ? <div style={Object.assign({fontSize:11,color:MT.T2,lineHeight:1.4}, WRAP)}>{t("nm.missing.title")}: {v.missingText}</div> : null}
        </div>
      ) : (
        <div style={{marginTop:8}}>
          {/* WHY, then KEY LEVELS */}
          {v.why ? <div style={Object.assign({fontSize:11,lineHeight:1.45,color:MT.T1}, WRAP)}><b style={{color:MT.T2}}>{t("nm.why.title")}: </b>{v.why}</div> : null}
          {v.range ? <div style={Object.assign({fontSize:11,fontWeight:700,color:MT.T1,marginTop:4}, WRAP)}>{v.range}</div> : null}

          {/* BULLISH VS BEARISH SCENARIOS (only those with real content) */}
          {v.scenarios.length ? (
            <div style={grid2}>
              {v.scenarios.map(function(sc){ return <Scenario key={sc.side} MT={MT} s={sc}/>; })}
            </div>
          ) : null}

          {/* EVIDENCE AND CONFLICTING SIGNALS (only non-empty, no repeats) */}
          {evBlocks.length ? (
            <div style={grid2}>
              {evBlocks.map(function(b){ return <Block key={b.id} MT={MT} title={b.title} lines={b.lines} mark={b.mark} markColor={b.markColor}/>; })}
            </div>
          ) : null}
        </div>
      )}

      {/* Inputs left out and confirmations this app cannot verify: one line each */}
      {v.excludedText && !unavailable ? (
        <div style={Object.assign({fontSize:10,color:MT.T3,lineHeight:1.4,marginTop:8}, WRAP)}><b style={{color:MT.T2}}>{t("nm.excl.title")}: </b>{v.excludedText}</div>
      ) : null}
      {v.unverifiedText ? (
        <div style={Object.assign({fontSize:10,color:MT.T3,lineHeight:1.4,marginTop:v.excludedText && !unavailable ? 3 : 8}, WRAP)}><b style={{color:MT.T2}}>{t("nm.unv.title")}: </b>{v.unverifiedText}</div>
      ) : null}
      <div style={Object.assign({fontSize:10,color:MT.WARN,marginTop:8,lineHeight:1.4,fontWeight:700}, WRAP)}>{t("dir.disclaimer")}</div>
    </div>
  );
}
