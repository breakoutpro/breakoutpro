import { getFreshnessMeta } from "./MarketMoodData";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - MarketMoodParts.jsx
// Reusable VISUAL sections only for the AI Market Mood open page.
// No market data lives here - every prop comes pre-formatted from
// MarketMoodData.jsx (presentation helpers) or directly from the real
// useMarketMood() state. No fabricated fallback values.
// Rules: no backtick, no triple-equals, ASCII only.

// Builds the same MT shape MarketMoodData.jsx used to hardcode, but sourced
// live from the active theme so this page actually switches with Light/Dark/AMOLED.
export function buildMT(theme) {
  return {
    BG: theme.c.bg, CARD: theme.c.card, CARD2: theme.c.card2, BD: theme.c.border,
    T1: theme.c.text1, T2: theme.c.text2, T3: theme.c.text3, BLUE: theme.c.blue, CYAN: theme.c.blue,
    GREEN: theme.c.up, DGREEN: theme.c.up, RED: theme.c.down, DRED: theme.c.down,
    GOLD: theme.c.gold, WARN: theme.c.warn, DIV: theme.c.border2
  };
}

// Section header used across the page.
export function SectionHead(props){
  var theme = useTheme(); var MT = buildMT(theme);
  return (
    <div style={{fontSize:12,color:MT.T2,fontWeight:800,margin:"22px 0 10px",letterSpacing:0.5}}>
      {props.children}
    </div>
  );
}

// Small freshness pill (LIVE / DELAYED / STALE / OFFLINE / UNAVAILABLE).
export function FreshnessPill(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var meta = getFreshnessMeta(props.status);
  return (
    <span style={{fontSize:8.5,fontWeight:800,color:meta.color,background:meta.color+"18",border:"1px solid "+meta.color+"40",borderRadius:5,padding:"2px 7px",letterSpacing:0.3}}>
      {meta.text}
    </span>
  );
}

// Honest "no verified data yet" card. Used for Sector Rotation, Market
// Breadth, Global Markets, Important Events until Step 5 wires providers.
export function UnavailableCard(props){
  var theme = useTheme(); var MT = buildMT(theme);
  return (
    <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:6,marginBottom:6}}>
        <span style={{fontSize:12.5,fontWeight:800,color:MT.T1}}>{props.title}</span>
        <FreshnessPill status="UNAVAILABLE"/>
      </div>
      <div style={{fontSize:10.5,color:MT.T3,lineHeight:1.6}}>
        {props.note || "No verified data source connected yet. This section will activate once a trustworthy provider is approved and integrated."}
      </div>
    </div>
  );
}

// One real index row (NIFTY / SENSEX / BANKNIFTY / VIX), formatted via
// buildIndexRow() in MarketMoodData.jsx. Never renders without a row.available check.
export function IndexRow(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var row = props.row;
  if(!row || !row.available){
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:6,padding:"11px 14px",borderBottom:"1px solid "+MT.BD}}>
        <span style={{fontSize:12.5,fontWeight:700,color:MT.T1}}>{(row && row.name) || "--"}</span>
        <FreshnessPill status="UNAVAILABLE"/>
      </div>
    );
  }
  var chgColor = row.up==null ? MT.T2 : (row.up ? MT.GREEN : MT.RED);
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:6,padding:"11px 14px",borderBottom:"1px solid "+MT.BD}}>
      <span style={{fontSize:12.5,fontWeight:700,color:MT.T1,flexShrink:0}}>{row.name}</span>
      <div style={{display:"flex",alignItems:"center",gap:9,flexWrap:"wrap",justifyContent:"flex-end"}}>
        <span style={{fontSize:12.5,fontWeight:800,color:MT.T1}}>{row.ltp}</span>
        <span style={{fontSize:11,fontWeight:700,color:chgColor}}>{row.chgPct}</span>
        <FreshnessPill status={row.freshnessText}/>
      </div>
    </div>
  );
}

// Deterministic mood gauge - score/label/stage come straight from
// MarketMoodEngine.computeMoodScore() output, nothing recomputed here.
export function Gauge(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var mood = props.mood;
  var scoreVal = mood && mood.score!=null ? mood.score : null;
  var label = mood && mood.score!=null ? mood.label : "Unavailable";
  var col = MT.T2;
  if(mood && mood.score!=null){
    if(label.indexOf("Bull")>=0) col = MT.GREEN;
    else if(label.indexOf("Bear")>=0) col = MT.RED;
    else col = MT.YELLOW;
  }
  return (
    <div style={{display:"flex",alignItems:"center",gap:16}}>
      <div style={{width:72,height:72,borderRadius:"50%",border:"5px solid "+col,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:20,fontWeight:900,color:col}}>{scoreVal!=null?scoreVal:"--"}</span>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:19,fontWeight:900,color:col}}>{label}</div>
        <div style={{fontSize:11,color:MT.T2,marginTop:2}}>{mood ? ("Stage: " + mood.stage) : "Stage unavailable"}</div>
        <div style={{fontSize:10,color:MT.T3,marginTop:1}}>{mood ? ("Confidence: " + mood.confidence) : ""}</div>
      </div>
    </div>
  );
}

// 3-Day Evolution card. Built from real context3d only (buildEvolution()).
export function EvolutionCard(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var ev = props.evolution;
  if(!ev || !ev.available){
    return <UnavailableCard title="3-Day Evolution" note="Multi-session history not available right now."/>;
  }
  return (
    <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:6,marginBottom:8}}>
        <span style={{fontSize:12.5,fontWeight:800,color:MT.T1}}>3-Day Evolution</span>
        <FreshnessPill status={ev.status}/>
      </div>
      <div style={{fontSize:14,fontWeight:800,color:ev.return3dPct.indexOf("-")==0?MT.RED:MT.GREEN,marginBottom:8}}>
        NIFTY {ev.return3dPct} over {ev.sessions} sessions
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:6}}>
        {ev.structure.map(function(s,i){
          return <span key={i} style={{fontSize:9.5,color:MT.T2,background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:6,padding:"3px 8px"}}>{s}</span>;
        })}
      </div>
      {ev.note ? <div style={{fontSize:9.5,color:MT.T3,marginTop:4}}>{ev.note}</div> : null}
    </div>
  );
}

// Market Stage Timeline. Uses only mood.stage (deterministic engine) plus
// the same real evolution structure flags - no separate history is invented.
export function StageTimeline(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var mood = props.mood;
  var ev = props.evolution;
  if(!mood || mood.score==null){
    return <UnavailableCard title="Market Stage Timeline" note="Stage classification unavailable right now."/>;
  }
  var steps = [];
  if(ev && ev.available){
    if(ev.structure.indexOf("Higher highs")>=0) steps.push("Higher highs building");
    if(ev.structure.indexOf("Lower lows")>=0) steps.push("Lower lows building");
    if(ev.structure.indexOf("Range compressing")>=0) steps.push("Range compressing");
  }
  steps.push("Current stage: " + mood.stage);
  return (
    <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:16,marginBottom:14}}>
      <div style={{fontSize:12.5,fontWeight:800,color:MT.T1,marginBottom:10}}>Market Stage Timeline</div>
      {steps.map(function(s,i){
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderTop:i>0?"1px solid "+MT.DIV:"none"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:i==steps.length-1?MT.GOLD:MT.T3,flexShrink:0}}></div>
            <span style={{fontSize:11.5,color:i==steps.length-1?MT.T1:MT.T2,fontWeight:i==steps.length-1?800:600}}>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

// Generic auto-fit grid wrapper - column count comes from responsiveRegistry
// via useResponsive(), never a fixed pixel layout.
export function GridWrap(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var cols = props.columns || 1;
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(" + cols + ", minmax(0,1fr))",gap:10,marginBottom:4}}>
      {props.children}
    </div>
  );
}

// Section header that also carries a freshness pill - used for the new
// real multi-symbol groups (Global Markets, Sector Rotation).
export function SectionHeadWithPill(props){
  var theme = useTheme(); var MT = buildMT(theme);
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:6,margin:"22px 0 10px"}}>
      <span style={{fontSize:12,color:MT.T2,fontWeight:800,letterSpacing:0.5}}>{props.children}</span>
      <FreshnessPill status={props.status}/>
    </div>
  );
}

// Lightweight inline SVG sparkline - no chart library, just real closes.
export function Sparkline(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var pts = props.points || [];
  if(pts.length<2) return null;
  var w = 260, h = 48, pad = 4;
  var min = Math.min.apply(null, pts), max = Math.max.apply(null, pts);
  var range = (max-min) || 1;
  var stepX = (w - pad*2) / (pts.length-1);
  var path = pts.map(function(v,i){
    var x = pad + i*stepX;
    var y = pad + (h - pad*2) * (1 - (v-min)/range);
    return (i==0?"M":"L") + Math.round(x) + "," + Math.round(y);
  }).join(" ");
  var lastUp = pts[pts.length-1] >= pts[0];
  var col = lastUp ? MT.WARN : MT.GREEN; // for VIX, rising = more fear (warn), falling = calmer (green)
  return (
    <svg width="100%" height={h} viewBox={"0 0 " + w + " " + h} preserveAspectRatio="none" style={{display:"block"}}>
      <path d={path} fill="none" stroke={col} strokeWidth="2"/>
    </svg>
  );
}
// by api/market-mood-ai.js (mood.now / keyDrivers / watchNext / riskNote).
export function AiCommentaryBlock(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var ai = props.ai;
  if(!ai){
    return (
      <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{fontSize:10,color:MT.CYAN,fontWeight:800,marginBottom:6,letterSpacing:0.4}}>AI COMMENTARY</div>
        <div style={{fontSize:11.5,color:MT.T2}}>AI commentary loading. Deterministic score above is already live.</div>
      </div>
    );
  }
  return (
    <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:14,marginBottom:14}}>
      <div style={{fontSize:10,color:MT.CYAN,fontWeight:800,marginBottom:6,letterSpacing:0.4}}>AI COMMENTARY</div>
      {ai.now ? <div style={{fontSize:12.5,color:MT.T1,lineHeight:1.6,marginBottom:6}}>{ai.now}</div> : null}
      {ai.whatChanged ? <div style={{fontSize:11,color:MT.T2,lineHeight:1.6,marginBottom:6}}><b style={{color:MT.T1}}>What changed: </b>{ai.whatChanged}</div> : null}
      {ai.threeDayContext ? <div style={{fontSize:11,color:MT.T2,lineHeight:1.6,marginBottom:6}}><b style={{color:MT.T1}}>3-day context: </b>{ai.threeDayContext}</div> : null}
      {ai.keyDrivers && ai.keyDrivers.length ? (
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>
          {ai.keyDrivers.map(function(d,i){
            return <span key={i} style={{fontSize:9.5,color:MT.T2,background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:6,padding:"3px 8px"}}>{d}</span>;
          })}
        </div>
      ) : null}
      {ai.watchNext ? <div style={{fontSize:11,color:MT.T2,lineHeight:1.6,marginBottom:6}}><b style={{color:MT.T1}}>Watch next: </b>{ai.watchNext}</div> : null}
      {ai.riskNote ? <div style={{fontSize:10,color:MT.WARN,lineHeight:1.6}}>{ai.riskNote}</div> : null}
    </div>
  );
}
