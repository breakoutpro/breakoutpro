import { getFreshnessMeta } from "./MarketMoodData";
import { useTheme } from "../theme/ThemeProvider";
import { useResponsive } from "../hooks/useResponsive";

// BreakoutPro - MarketMoodParts.jsx
// Reusable VISUAL sections only for the AI Market Mood open page.
// No market data lives here - every prop comes pre-formatted from
// MarketMoodData.jsx (presentation helpers) or directly from the real
// useMarketMood() state. No fabricated fallback values.
// Rules: no backtick, no triple-equals, ASCII only.

// Builds the same MT shape MarketMoodData.jsx used to hardcode, but sourced
// live from the active theme so this page actually switches with Light/Dark.
export function buildMT(theme) {
  return {
    BG: theme.c.bg, CARD: theme.c.card, CARD2: theme.c.card2, BD: theme.c.border,
    T1: theme.c.text1, T2: theme.c.text2, T3: theme.c.text3, BLUE: theme.c.blue,
    GREEN: theme.c.up, DGREEN: theme.c.up, RED: theme.c.down, DRED: theme.c.down,
    WARN: theme.c.warn, DIV: theme.c.border2,
    // Dedicated sentiment colors (Bearish/Sideways/Bullish) - separate from
    // theme.c.up/down/warn since those tokens are used elsewhere for price
    // ticks and general warnings, not sentiment specifically. Not touching
    // the global tokens or their names, per the explicit constraint.
    SENT_GREEN: "#087443", SENT_RED: "#C62828", SENT_YELLOW: "#EAB308"
  };
}

// Section header used across the page.
export function SectionHead(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var responsive = useResponsive();
  var wide = responsive.isDesktop || responsive.isTV;
  return (
    <div style={{fontSize:12,color:MT.T2,fontWeight:800,margin:wide?"6px 0 3px":"22px 0 10px",letterSpacing:0.5}}>
      {props.children}
    </div>
  );
}

// Small freshness pill (LIVE / DELAYED / STALE / OFFLINE / UNAVAILABLE).
export function FreshnessPill(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var meta = getFreshnessMeta(props.status);
  return (
    <span style={{fontSize:12,fontWeight:800,color:meta.color,background:meta.color+"18",border:"1px solid "+meta.color+"40",borderRadius:5,padding:"4px 8px",letterSpacing:0.3}}>
      {meta.text}
    </span>
  );
}

// Honest "no verified data yet" card. Used for Sector Rotation, Market
// Breadth, Global Markets, Important Events until Step 5 wires providers.
export function UnavailableCard(props){
  var theme = useTheme(); var MT = buildMT(theme);
  return (
    <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:6,marginBottom:6}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:props.hideTitle?"flex-end":"space-between",flexWrap:"wrap",rowGap:6,marginBottom:8}}>
        {props.hideTitle ? null : <span style={{fontSize:12,fontWeight:800,color:MT.T1}}>{props.title}</span>}
        <FreshnessPill status="UNAVAILABLE"/>
      </div>
      <div style={{fontSize:12,color:MT.T3,lineHeight:1.6}}>
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
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:4,padding:"6px 14px",borderBottom:"1px solid "+MT.BD}}>
        <span style={{fontSize:12,fontWeight:700,color:MT.T1}}>{(row && row.name) || "--"}</span>
        <FreshnessPill status="UNAVAILABLE"/>
      </div>
    );
  }
  var chgColor = row.up==null ? MT.T2 : (row.up ? MT.SENT_GREEN : MT.SENT_RED);
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:4,padding:"6px 14px",borderBottom:"1px solid "+MT.BD}}>
      <span style={{fontSize:12,fontWeight:700,color:MT.T1,flexShrink:0}}>{row.name}</span>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
        <span style={{fontSize:12,fontWeight:800,color:MT.T1}}>{row.ltp}</span>
        <span style={{fontSize:12,fontWeight:700,color:chgColor}}>{row.chgPct}</span>
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
    if(label.indexOf("Bull")>=0) col = MT.SENT_GREEN;
    else if(label.indexOf("Bear")>=0) col = MT.SENT_RED;
    else col = MT.SENT_YELLOW;
  }
  return (
    <div style={{display:"flex",alignItems:"center",gap:16}}>
      <div style={{width:72,height:72,borderRadius:"50%",border:"5px solid "+col,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:22,fontWeight:900,color:col}}>{scoreVal!=null?scoreVal:"--"}</span>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:18,fontWeight:900,color:col}}>{label}</div>
        <div style={{fontSize:12,color:MT.T2,marginTop:4}}>{mood ? ("Stage: " + mood.stage) : "Stage unavailable"}</div>
        <div style={{fontSize:12,color:MT.T3,marginTop:4}}>{mood ? ("Confidence: " + mood.confidence) : ""}</div>
      </div>
    </div>
  );
}

// 3-Day Evolution card. Built from real context3d only (buildEvolution()).
export function EvolutionCard(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var ev = props.evolution;
  if(!ev || !ev.available){
    return <UnavailableCard title="3-Day Evolution" hideTitle={true} note="Multi-session history not available right now."/>;
  }
  return (
    <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:6,marginBottom:6}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:6,marginBottom:8}}>
        <span style={{fontSize:12,fontWeight:800,color:MT.T1}}>3-Day Evolution</span>
        <FreshnessPill status={ev.status}/>
      </div>
      <div style={{fontSize:14,fontWeight:800,color:ev.return3dPct.indexOf("-")==0?MT.SENT_RED:MT.SENT_GREEN,marginBottom:8}}>
        NIFTY {ev.return3dPct} over {ev.sessions} sessions
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
        {ev.structure.map(function(s,i){
          return <span key={i} style={{fontSize:12,color:MT.T2,background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:6,padding:"4px 8px"}}>{s}</span>;
        })}
      </div>
      {ev.note ? <div style={{fontSize:12,color:MT.T3,marginTop:4}}>{ev.note}</div> : null}
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
  var summary = ev && ev.available && ev.return3dPct!=null ? "3-day: "+ev.return3dPct+" \u00b7 "+(ev.structure&&ev.structure.length?ev.structure.join(", "):"") : null;
  return (
    <div style={{background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:14,padding:6,marginBottom:6}}>
      <div style={{fontSize:11,fontWeight:800,color:MT.T1,marginBottom:4}}>Market Stage Timeline</div>
      {steps.map(function(s,i){
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",borderTop:i>0?"1px solid "+MT.DIV:"none"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:i==steps.length-1?MT.BLUE:MT.T3,flexShrink:0}}></div>
            <span style={{fontSize:11,color:i==steps.length-1?MT.T1:MT.T2,fontWeight:i==steps.length-1?800:600}}>{s}</span>
          </div>
        );
      })}
      {summary ? <div style={{fontSize:10,color:MT.T3,marginTop:4,paddingTop:4,borderTop:"1px solid "+MT.DIV}}>{summary}</div> : null}
    </div>
  );
}

// Generic auto-fit grid wrapper - column count comes from responsiveRegistry
// via useResponsive(), never a fixed pixel layout.
export function GridWrap(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var cols = props.columns || 1;
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(" + cols + ", minmax(0,1fr))",gap:12,marginBottom:4,alignItems:"start"}}>
      {props.children}
    </div>
  );
}

// Section header that also carries a freshness pill - used for the new
// real multi-symbol groups (Global Markets, Sector Rotation).
export function SectionHeadWithPill(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var responsive = useResponsive();
  var wide = responsive.isDesktop || responsive.isTV;
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:6,margin:wide?"6px 0 3px":"22px 0 10px"}}>
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
  var w = 260, h = props.height || 48, pad = 4;
  var min = Math.min.apply(null, pts), max = Math.max.apply(null, pts);
  var range = (max-min) || 1;
  var stepX = (w - pad*2) / (pts.length-1);
  var linePath = pts.map(function(v,i){
    var x = pad + i*stepX;
    var y = pad + (h - pad*2) * (1 - (v-min)/range);
    return (i==0?"M":"L") + Math.round(x) + "," + Math.round(y);
  }).join(" ");
  var lastX = pad + (pts.length-1)*stepX;
  var areaPath = linePath + " L" + Math.round(lastX) + "," + (h-pad) + " L" + pad + "," + (h-pad) + " Z";
  var lastUp = pts[pts.length-1] >= pts[0];
  var col = props.inverse ? (lastUp ? MT.SENT_YELLOW : MT.SENT_GREEN) : (lastUp ? MT.SENT_GREEN : MT.SENT_RED);
  var gradId = "spark-grad-"+Math.round(pts[0]*1000)+"-"+pts.length;
  return (
    <svg width="100%" height={h} viewBox={"0 0 " + w + " " + h} preserveAspectRatio="none" style={{display:"block"}}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={col} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={"url(#"+gradId+")"} stroke="none"/>
      <path d={linePath} fill="none" stroke={col} strokeWidth="2"/>
    </svg>
  );
}

// Compact High/Low/Close mini-chart - NOT a full candlestick, since the
// underlying Yahoo daily-history data only provides High/Low/Close, not
// Open. Fabricating an Open (e.g. from the previous day's Close) can place
// a candle "body" outside its own high-low range after a gap, which would
// misrepresent the data. Each bar instead shows the real high-low range as
// a vertical line, with a tick marking the real close - honest given what
// data actually exists, still communicates range and direction clearly.
export function MiniHLCChart(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var candles = props.candles || [];
  if(candles.length<2) return null;
  var w = 100, h = props.height || 32, pad = 2;
  var highs = candles.map(function(c){ return c.h; }).filter(function(v){ return v!=null; });
  var lows = candles.map(function(c){ return c.l; }).filter(function(v){ return v!=null; });
  if(!highs.length || !lows.length) return null;
  var min = Math.min.apply(null, lows), max = Math.max.apply(null, highs);
  var range = (max-min) || 1;
  var barW = (w - pad*2) / candles.length;
  function yFor(v){ return pad + (h-pad*2) * (1 - (v-min)/range); }
  return (
    <svg width="100%" height={h} viewBox={"0 0 "+w+" "+h} preserveAspectRatio="none" style={{display:"block"}}>
      {candles.map(function(c,i){
        if(c.h==null || c.l==null || c.c==null) return null;
        var cx = pad + i*barW + barW/2;
        var prevC = i>0 && candles[i-1].c!=null ? candles[i-1].c : c.c;
        var up = c.c >= prevC;
        var col = up ? MT.SENT_GREEN : MT.SENT_RED;
        var yHigh = yFor(c.h), yLow = yFor(c.l), yClose = yFor(c.c);
        return (
          <g key={i}>
            <line x1={cx} y1={yHigh} x2={cx} y2={yLow} stroke={col} strokeWidth={Math.max(1, barW*0.15)}/>
            <line x1={cx-barW*0.28} y1={yClose} x2={cx+barW*0.28} y2={yClose} stroke={col} strokeWidth={Math.max(1, barW*0.22)}/>
          </g>
        );
      })}
    </svg>
  );
}
// by api/market-mood-ai.js (mood.now / keyDrivers / watchNext / riskNote).
export function AiCommentaryBlock(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var ai = props.ai;
  if(!ai){
    return (
      <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:6,marginBottom:6}}>
        <div style={{fontSize:12,color:MT.BLUE,fontWeight:800,marginBottom:8,letterSpacing:0.4}}>AI COMMENTARY</div>
        <div style={{fontSize:12,color:MT.T2}}>Analysis update in progress. Core market score remains available.</div>
      </div>
    );
  }
  return (
    <div style={{background:MT.CARD2,border:"1px solid "+MT.BD,borderRadius:12,padding:6,marginBottom:6}}>
      <div style={{fontSize:12,color:MT.BLUE,fontWeight:800,marginBottom:8,letterSpacing:0.4}}>AI COMMENTARY</div>
      {ai.now ? <div style={{fontSize:12,color:MT.T1,lineHeight:1.6,marginBottom:8}}>{ai.now}</div> : null}
      {ai.whatChanged ? <div style={{fontSize:12,color:MT.T2,lineHeight:1.6,marginBottom:8}}><b style={{color:MT.T1}}>What changed: </b>{ai.whatChanged}</div> : null}
      {ai.threeDayContext ? <div style={{fontSize:12,color:MT.T2,lineHeight:1.6,marginBottom:8}}><b style={{color:MT.T1}}>3-day context: </b>{ai.threeDayContext}</div> : null}
      {ai.keyDrivers && ai.keyDrivers.length ? (
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
          {ai.keyDrivers.map(function(d,i){
            return <span key={i} style={{fontSize:12,color:MT.T2,background:MT.CARD,border:"1px solid "+MT.BD,borderRadius:6,padding:"4px 8px"}}>{d}</span>;
          })}
        </div>
      ) : null}
      {ai.watchNext ? <div style={{fontSize:12,color:MT.T2,lineHeight:1.6,marginBottom:8}}><b style={{color:MT.T1}}>Watch next: </b>{ai.watchNext}</div> : null}
      {ai.riskNote ? <div style={{fontSize:12,color:MT.WARN,lineHeight:1.6}}>{ai.riskNote}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------
// Shared angle math for the semicircle gauge below - score 0 sits at the
// left end of the arc (180deg, standard math convention), score 100 at
// the right end (0deg), sweeping up through the top (score 50 = 90deg,
// straight up). Used for BOTH the needle rotation and every arc/label
// point, so they can never fall out of sync with each other.
// ---------------------------------------------------------------------
function gaugeAngleDeg(score){ return 180 - (score/100)*180; }
function gaugePoint(cx, cy, r, score){
  var rad = gaugeAngleDeg(score) * Math.PI / 180;
  return { x: cx + r*Math.cos(rad), y: cy - r*Math.sin(rad) };
}

// Semicircular 0-100 AI Market Mood gauge for the AI Market Mood open
// page. Every value on it - needle position, the big score readout, the
// zone it lands in - comes from the SAME mood.score/mood.label the rest
// of this page already displays (MarketMoodEngine.computeMoodScore()
// output); nothing here recomputes a score or invents a value. Boundaries
// (score<40 Bearish, 40-59 Sideways, score>=60 Bullish) match the same
// thresholds already used by the Market Mood Breakdown bars on this page.
// Pure SVG with a viewBox + width:100%, so it scales proportionally on
// any container width (desktop card or full-width mobile card) without a
// separate mobile layout.
export function SemicircleGauge(props){
  var theme = useTheme(); var MT = buildMT(theme);
  var mood = props.mood;
  var score = mood && mood.score!=null ? mood.score : null;
  var label = mood && mood.score!=null ? mood.label : null;
  var col = MT.T2;
  if(label){
    if(label.indexOf("Bull")>=0) col = MT.SENT_GREEN;
    else if(label.indexOf("Bear")>=0) col = MT.SENT_RED;
    else col = MT.SENT_YELLOW;
  }

  var cx=100, cy=92, bandR=70, needleLen=56;
  // Needle: 0deg (pointing left/bearish) at score 0, 180deg (pointing
  // right/bullish) at score 100 - same gaugeAngleDeg() scale as the arc
  // and zone labels below, just expressed as a rotation of a line that
  // starts out pointing left.
  var needleRot = score!=null ? (score/100)*180 : 90;

  function zonePath(s0, s1){
    var p0 = gaugePoint(cx,cy,bandR,s0), p1 = gaugePoint(cx,cy,bandR,s1);
    return "M "+p0.x.toFixed(1)+" "+p0.y.toFixed(1)+" A "+bandR+" "+bandR+" 0 0 1 "+p1.x.toFixed(1)+" "+p1.y.toFixed(1);
  }
  var zoneLabelR = 50;
  var zones = [
    { from:0, to:40, mid:20, name:"BEARISH", color:MT.SENT_RED },
    { from:40, to:60, mid:50, name:"SIDEWAYS", color:MT.SENT_YELLOW },
    { from:60, to:100, mid:80, name:"BULLISH", color:MT.SENT_GREEN }
  ];
  var ticks = [0,50,100];
  var tickR = 85;

  return (
    <div style={{position:"relative",width:"100%",maxWidth:230,margin:"0 auto"}}>
      <svg viewBox="0 0 200 130" width="100%" style={{display:"block"}}>
        {zones.map(function(z){
          return <path key={z.name} d={zonePath(z.from,z.to)} stroke={z.color} strokeWidth="14" fill="none"/>;
        })}
        {zones.map(function(z){
          var p = gaugePoint(cx,cy,zoneLabelR,z.mid);
          return <text key={"lbl"+z.name} x={p.x} y={p.y} fontSize="8" fontWeight="800" letterSpacing="0.3" fill={z.color} textAnchor="middle">{z.name}</text>;
        })}
        {ticks.map(function(t){
          var p = gaugePoint(cx,cy,tickR,t);
          return <text key={"tick"+t} x={p.x} y={p.y+3} fontSize="9" fontWeight="600" fill={MT.T3} textAnchor="middle">{t}</text>;
        })}
        <g transform={"rotate("+needleRot+" "+cx+" "+cy+")"}>
          <line x1={cx} y1={cy} x2={cx-needleLen} y2={cy} stroke={col} strokeWidth="3" strokeLinecap="round"/>
        </g>
        <circle cx={cx} cy={cy} r="5" fill={col}/>
        <text x={cx} y={cy+30} fontSize="24" fontWeight="900" fill={col} textAnchor="middle">
          {score!=null ? score : "--"}<tspan fontSize="11" fontWeight="700" fill={MT.T3}>/100</tspan>
        </text>
      </svg>
    </div>
  );
}
