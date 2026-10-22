import { useState } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { useNextMove } from "../hooks/useNextMove";
import { buildHomeView } from "./NextMoveHomeView";
import { buildMT } from "./MarketMoodParts";
import { getFreshnessMeta, buildEvolution } from "./MarketMoodData";
import DetailedAnalysis from "./DetailedAnalysis";
import { useLang, t } from "../i18n/translations";

// BreakoutPro - NextMoveHomeCard.jsx
// Compact, trader-first body of the Home "Next Move Intelligence" card.
// Top: direction word, setup headline, current price and % change, the two key
// levels, data status. Everything else (EMA values, evidence, market mood, the
// stage timeline, data-quality notes) lives in the ONE collapsed Detailed
// Analysis section, so nothing is shown twice. All values come from
// useNextMove(), the same engine result as the full page: no second
// calculation, no new request, no invented level or confidence.
// Rules: no backtick, no triple-equals, ASCII only.

// The Home layouts define their card shells inside the render function, so a
// parent re-render (10 s market poll) remounts this component. The open state
// therefore lives here, not in a hook, so a reader is not collapsed mid-read.
// It starts collapsed on every page load.
var DA_OPEN = false;

var WRAP = { overflowWrap:"anywhere", wordBreak:"break-word", minWidth:0 };

function Chip(props){
  var c = props.color;
  return <span style={{fontSize:10,fontWeight:800,color:c,background:c+"18",border:"1px solid "+c+"45",borderRadius:6,padding:"1px 6px",whiteSpace:"nowrap",maxWidth:"100%",boxSizing:"border-box",overflow:"hidden",textOverflow:"ellipsis"}}>{props.text}</span>;
}

export default function NextMoveHomeCard(props){
  useLang();
  var theme = useTheme();
  var MT = buildMT(theme);
  var UPC = theme.c.up, DNC = theme.c.down;   // theme tokens keep text contrast on both themes
  var st = useState(DA_OPEN);
  var daOpen = st[0], setDaOpen = st[1];
  var hook = useNextMove(props.mm);
  var nm = hook.nextMove;
  var mm = props.mm || {};
  var v = buildHomeView(nm, t);
  var wide = !!props.wide;
  var tone = v.dir=="bull" ? UPC : (v.dir=="bear" ? DNC : (v.dir=="side" ? MT.SENT_YELLOW : (v.dir=="unavail" ? MT.WARN : MT.T2)));
  var glyph = v.dir=="bull" ? "\u25b2" : (v.dir=="bear" ? "\u25bc" : (v.dir=="side" ? "\u25c6" : "\u25cb"));
  var fm = getFreshnessMeta(v.quote.chip, theme.c);
  var usingDemo = hook.usingDemo;
  var evolution = buildEvolution(mm.data || {});
  var vixQ = !usingDemo && mm.data && mm.data.indices ? mm.data.indices.VIX : null;
  var priceColor = v.price && v.price.up!=null ? (v.price.up ? UPC : DNC) : MT.T2;
  var setupColor = v.setup ? (v.setup.status=="confirmed" ? tone : (v.setup.status=="triggered" ? MT.BLUE : (v.setup.status=="waiting" ? MT.T2 : MT.WARN))) : MT.T2;
  var fs = props.fs || 12;

  return (
    <div data-testid="nm-home-card" style={{minWidth:0,width:"100%",boxSizing:"border-box"}}>
      {/* 1. DIRECTION + SETUP HEADLINE + DATA STATUS */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,flex:"1 1 150px"}}>
          <span aria-hidden="true" style={{fontSize:18,color:tone,flexShrink:0,lineHeight:1}}>{glyph}</span>
          <span data-testid="nm-home-dir" style={Object.assign({fontSize:24,fontWeight:900,color:tone,lineHeight:1.1,letterSpacing:0.3}, WRAP)}>{v.dirText}</span>
        </div>
        <Chip color={fm.color} text={fm.text}/>
      </div>
      <div data-testid="nm-home-headline" style={Object.assign({fontSize:fs+1,fontWeight:800,color:MT.T1,marginTop:3,lineHeight:1.3,textTransform:"uppercase",letterSpacing:0.2}, WRAP)}>{v.headline}</div>

      {v.dir=="unavail" ? (
        <div style={Object.assign({fontSize:fs,color:MT.T2,marginTop:6,lineHeight:1.4}, WRAP)}>
          {v.missing ? t("nm.missing.title") + ": " + v.missing : ""}
        </div>
      ) : (
        <div>
          {/* 2. CURRENT PRICE AND % CHANGE */}
          {v.price ? (
            <div data-testid="nm-home-price" style={{marginTop:8,display:"flex",alignItems:"baseline",flexWrap:"wrap",gap:"2px 8px"}}>
              <span style={{fontSize:20,fontWeight:900,color:MT.T1,lineHeight:1.2,fontVariantNumeric:"tabular-nums"}}>{v.price.ltp}</span>
              {v.price.pct ? <span style={{fontSize:fs+1,fontWeight:800,color:priceColor}}>{v.price.pct}</span> : null}
              <span style={Object.assign({fontSize:10,color:MT.T3,lineHeight:1.3}, WRAP)}>{v.price.kindText}{v.price.asOf ? " \u00b7 " + t("nm.asof", { t:v.price.asOf }) : ""}</span>
            </div>
          ) : null}

          {/* 3. KEY LEVELS: breakout trigger and invalidation */}
          {v.levels.length ? (
            <div data-testid="nm-home-levels" style={{display:"grid",gridTemplateColumns:"repeat(" + v.levels.length + ", minmax(0, 1fr))",gap:6,marginTop:8}}>
              {v.levels.map(function(lv){
                var c = lv.tone=="bull" ? UPC : DNC;
                return (
                  <div key={lv.id} style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderLeft:"3px solid "+c,borderRadius:8,padding:"6px 8px",minWidth:0,boxSizing:"border-box"}}>
                    <div style={Object.assign({fontSize:10,fontWeight:700,color:MT.T2,lineHeight:1.3}, WRAP)}>{lv.label}</div>
                    <div style={{fontSize:wide ? 20 : 18,fontWeight:900,color:c,lineHeight:1.2,marginTop:1,fontVariantNumeric:"tabular-nums"}}>{lv.value}</div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* 4. SETUP STATUS (daily-candle only) + CONFIDENCE + BASIS */}
          <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"4px 6px",marginTop:8}}>
            {v.setup && v.setup.text ? <Chip color={setupColor} text={v.setup.text}/> : null}
            <Chip color={MT.T2} text={v.conf}/>
          </div>
          <div style={Object.assign({fontSize:10,color:MT.T3,marginTop:4,lineHeight:1.4}, WRAP)}>{v.basis}</div>
          {v.dataWarn ? <div data-testid="nm-home-warn" style={Object.assign({fontSize:11,fontWeight:700,color:MT.WARN,marginTop:4,lineHeight:1.4}, WRAP)}>{v.dataWarn}</div> : null}
        </div>
      )}

      <div style={Object.assign({fontSize:10,color:MT.WARN,marginTop:6,lineHeight:1.4,fontWeight:700}, WRAP)}>{v.disclaimer}</div>

      {/* 5. EVERYTHING ELSE: one collapsed section */}
      <div style={{marginTop:8}} onClick={function(e){ e.stopPropagation(); }}>
        <DetailedAnalysis nextMove={nm} mood={usingDemo ? null : mm.mood} evolution={evolution} vixQuote={vixQ} usingDemo={usingDemo} open={daOpen} onOpenChange={function(o){ DA_OPEN = o; setDaOpen(o); }} wideLayout={wide} gapV={4} padV={9}/>
      </div>
    </div>
  );
}
