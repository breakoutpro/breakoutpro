import { useTheme } from "../theme/ThemeProvider";
import { buildMT } from "./MarketMoodParts";
import { getFreshnessMeta } from "./MarketMoodData";
import { fmtNum } from "./DirectionEngine";
import { useLang, t } from "../i18n/translations";

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
  return (
    <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:8,padding:"8px 9px",boxSizing:"border-box",minWidth:0}}>
      <div style={Object.assign({fontSize:10,fontWeight:800,color:props.titleColor || MT.T2,marginBottom:6,letterSpacing:0.3}, WRAP)}>{props.title}</div>
      {props.children}
    </div>
  );
}

function Lines(props){
  var MT = props.MT, items = props.items || [];
  if(!items.length) return <div style={{fontSize:11,color:MT.T3}}>{t("dir.none")}</div>;
  return (
    <div>
      {items.map(function(it, i){
        return (
          <div key={(it.id || it.key) + "-" + i} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:5}}>
            <span aria-hidden="true" style={{fontSize:10,lineHeight:"15px",color:props.markColor || MT.T2,flexShrink:0,width:12,textAlign:"center"}}>{props.mark || "\u2022"}</span>
            <span style={Object.assign({fontSize:11,lineHeight:1.4,color:MT.T1}, WRAP)}>{t(it.key, it.vars)}</span>
          </div>
        );
      })}
    </div>
  );
}

function Scenario(props){
  var MT = props.MT, s = props.s;
  var bull = s.side=="bull";
  var sideColor = bull ? MT.SENT_GREEN : MT.SENT_RED;
  var stColor = s.status=="confirmed" ? sideColor : (s.status=="triggered" ? MT.BLUE : (s.status=="waiting" ? MT.T2 : MT.WARN));
  function row(label, node){
    return (
      <div style={{marginBottom:6}}>
        <div style={Object.assign({fontSize:10,fontWeight:700,color:MT.T3,marginBottom:1}, WRAP)}>{label}</div>
        <div style={Object.assign({fontSize:11,lineHeight:1.4,color:MT.T1}, WRAP)}>{node}</div>
      </div>
    );
  }
  return (
    <div data-testid={bull ? "nm-bull" : "nm-bear"} style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:8,padding:"8px 9px",boxSizing:"border-box",minWidth:0}}>
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"4px 8px",marginBottom:6}}>
        <span aria-hidden="true" style={{fontSize:11,color:sideColor}}>{bull ? "\u25b2" : "\u25bc"}</span>
        <span style={Object.assign({fontSize:12,fontWeight:800,color:sideColor,flex:"1 1 110px"}, WRAP)}>{t(bull ? "nm.scn.bull" : "nm.scn.bear")}</span>
        <span style={{fontSize:10,fontWeight:800,color:stColor,background:stColor+"18",border:"1px solid "+stColor+"45",borderRadius:5,padding:"2px 6px",flexShrink:0}}>{t("nm.st." + s.status)}</span>
      </div>
      {row(t("nm.lbl.trigger"), t(s.trigger.key, s.trigger.vars))}
      {row(t("nm.lbl.confirm"), t(s.confirm.key, s.confirm.vars))}
      {row(t("nm.lbl.invalid"), t(s.invalid.key, s.invalid.vars))}
    </div>
  );
}

export default function NextMoveCard(props){
  useLang();
  var theme = useTheme();
  var MT = buildMT(theme);
  var m = props.nextMove;
  var padV = props.padV || 10;
  if(!m) return null;
  var unavailable = m.state!="ok";
  var a = m.assessment;
  var color = (a=="upside" || a=="reversal_up") ? MT.SENT_GREEN : ((a=="downside" || a=="reversal_dn") ? MT.SENT_RED : (a=="range" ? MT.SENT_YELLOW : (unavailable ? MT.WARN : MT.T2)));
  var glyph = (a=="upside" || a=="reversal_up") ? "\u25b2" : ((a=="downside" || a=="reversal_dn") ? "\u25bc" : (a=="range" ? "\u25c6" : "\u25cb"));
  var wide = !!props.wideLayout;
  var grid2 = { display:"grid", gridTemplateColumns: wide ? "repeat(auto-fit, minmax(260px, 1fr))" : "minmax(0, 1fr)", gap:6, marginTop:8 };
  var p = m.price, f = m.freshness;
  var quoteStatus = f && f.quoteStatus ? f.quoteStatus : "UNAVAILABLE";
  var meta = getFreshnessMeta(p && p.kind=="live" ? "LIVE" : quoteStatus);
  var tQuote = f ? fmtTime(f.quoteAsOf) : null;
  var tBar = f ? fmtDay(f.lastBarAsOf) : null;
  var bull = m.scenarios.bull, bear = m.scenarios.bear;
  var b = bull ? bull.boundary : null;

  return (
    <div data-testid="next-move" style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:8,padding:padV,marginBottom:props.gapV || 6,boxSizing:"border-box",minWidth:0}}>
      <div style={Object.assign({fontSize:12,fontWeight:800,color:MT.T1,letterSpacing:0.3}, WRAP)}>{t("nm.title").toUpperCase()}</div>
      <div style={Object.assign({fontSize:10,color:MT.T3,marginTop:2,marginBottom:8,lineHeight:1.4}, WRAP)}>{t("nm.sub")}</div>

      {/* 1. NEXT MOVE ASSESSMENT */}
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"6px 10px"}}>
        <span aria-hidden="true" style={{fontSize:15,color:color,flexShrink:0}}>{glyph}</span>
        <span data-testid="nm-assessment" style={Object.assign({fontSize:17,fontWeight:900,color:color,lineHeight:1.25,flex:"1 1 200px"}, WRAP)}>{t("nm.assess." + a)}</span>
      </div>

      {/* 2. SETUP STATUS AND DATA FRESHNESS */}
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"4px 8px",marginTop:8}}>
        {p ? (
          <span style={Object.assign({fontSize:12,fontWeight:800,color:MT.T1}, WRAP)}>{t(p.kind=="live" ? "nm.price.live" : "nm.price.last")}: {fmtNum(p.ltp)}</span>
        ) : null}
        <span style={{fontSize:10,fontWeight:800,color:meta.color,background:meta.color+"18",border:"1px solid "+meta.color+"40",borderRadius:5,padding:"2px 6px",flexShrink:0}}>{p && p.kind=="live" ? "LIVE" : meta.text}</span>
        {m.session ? <span style={{fontSize:10,color:MT.T2}}>{t("nm.sess." + m.session, m.session)}</span> : null}
      </div>
      <div style={Object.assign({fontSize:10,color:MT.T2,marginTop:3,lineHeight:1.4}, WRAP)}>
        {tQuote ? t("nm.asof", { t:tQuote }) : t("nm.src.na")}
        {tBar ? " \u00b7 " + t("nm.candle", { t:tBar }) : ""}
      </div>
      {f && f.behind ? <div style={Object.assign({fontSize:10,color:MT.WARN,marginTop:3,lineHeight:1.4}, WRAP)}>{t("nm.behind")}</div> : null}

      {/* Basis and confidence (never a validated number) */}
      <div style={Object.assign({fontSize:10,color:MT.T3,marginTop:6,lineHeight:1.4}, WRAP)}>{t("nm.basis")}</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
        <span data-testid="nm-confidence" style={{fontSize:11,fontWeight:700,color:MT.T2,background:MT.T2+"18",border:"1px solid "+MT.T2+"45",borderRadius:6,padding:"3px 8px",maxWidth:"100%",boxSizing:"border-box",overflowWrap:"anywhere"}}>{t("nm.conf")}</span>
      </div>
      <div style={Object.assign({fontSize:10,color:MT.T3,marginTop:4,lineHeight:1.4}, WRAP)}>{t("nm.conf.note")}</div>

      {unavailable ? (
        <div style={{marginTop:8}}>
          {(m.reasons || []).map(function(r, i){
            return <div key={i} style={Object.assign({fontSize:11,color:MT.WARN,lineHeight:1.4,marginBottom:3}, WRAP)}>{t(r.key, r.vars)}</div>;
          })}
        </div>
      ) : (
        <div>
          {/* WHY */}
          <div style={{marginTop:8}}>
            <div style={{fontSize:10,fontWeight:800,color:MT.T2,marginBottom:2}}>{t("nm.why.title")}</div>
            <div style={Object.assign({fontSize:11,lineHeight:1.45,color:MT.T1}, WRAP)}>{t(m.why.key, m.why.vars)}</div>
          </div>

          {/* 3. KEY TRIGGER LEVELS */}
          {b ? <div style={Object.assign({fontSize:11,fontWeight:700,color:MT.T1,marginTop:8}, WRAP)}>{t("nm.range", { sup:fmtNum(b.support), res:fmtNum(b.resistance) })}</div> : null}

          {/* 4 and 5. BULLISH VS BEARISH SCENARIOS WITH CONFIRMATION AND INVALIDATION */}
          <div style={grid2}>
            {bull ? <Scenario MT={MT} s={bull}/> : null}
            {bear ? <Scenario MT={MT} s={bear}/> : null}
          </div>

          {/* 6. EVIDENCE AND CONFLICTING SIGNALS */}
          <div style={grid2}>
            <Block MT={MT} title={t("nm.ev.for")}><Lines MT={MT} items={m.evidence.forTxt} mark={"\u25b2"} markColor={MT.SENT_GREEN}/></Block>
            <Block MT={MT} title={t("nm.ev.against")}><Lines MT={MT} items={m.evidence.against.concat(m.evidence.caveats)} mark={"\u25c6"} markColor={MT.WARN}/></Block>
          </div>
          <div style={grid2}>
            <Block MT={MT} title={t("nm.confirms.title")}><Lines MT={MT} items={m.confirms} mark={"\u2192"}/></Block>
            <Block MT={MT} title={t("nm.invalidates.title")}><Lines MT={MT} items={m.invalidates} mark={"\u2192"}/></Block>
          </div>
        </div>
      )}

      {/* Inputs left out and confirmations this app cannot verify */}
      {m.excluded && m.excluded.length ? (
        <div style={{marginTop:8}}>
          <div style={{fontSize:10,fontWeight:800,color:MT.T2,marginBottom:2}}>{t("nm.excl.title")}</div>
          {m.excluded.map(function(x){
            return <div key={x.id} style={Object.assign({fontSize:10,color:MT.T3,lineHeight:1.4}, WRAP)}>{t("dir.in." + x.id)}{x.reason ? " (" + t("dir.r." + x.reason) + ")" : ""}</div>;
          })}
        </div>
      ) : null}
      <div style={{marginTop:8}}>
        <div style={{fontSize:10,fontWeight:800,color:MT.T2,marginBottom:2}}>{t("nm.unv.title")}</div>
        {(m.unverified || []).map(function(k){
          return <div key={k} style={Object.assign({fontSize:10,color:MT.T3,lineHeight:1.4}, WRAP)}>{"\u2022 " + t("nm.unv." + k)}</div>;
        })}
      </div>

      {/* 7. SECONDARY CONTEXT: the existing mood score sits below this card */}
      <div style={{marginTop:10,paddingTop:8,borderTop:"1px solid "+MT.BD}}>
        <div style={{fontSize:10,fontWeight:800,color:MT.T2,marginBottom:2}}>{t("nm.mood.title")}</div>
        <div style={Object.assign({fontSize:10,color:MT.T3,lineHeight:1.4}, WRAP)}>{t("nm.mood.note")}</div>
      </div>
      <div style={Object.assign({fontSize:10,color:MT.WARN,marginTop:8,lineHeight:1.4,fontWeight:700}, WRAP)}>{t("dir.disclaimer")}</div>
    </div>
  );
}
