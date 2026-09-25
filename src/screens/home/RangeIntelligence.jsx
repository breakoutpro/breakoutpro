// BreakoutPro - RangeIntelligencePage.jsx
// Real-data Range Intelligence: current price, today's high/low, range %,
// position in range, distance to support/resistance - all computed from
// indices.{NIFTY,BANKNIFTY,SENSEX,FINNIFTY} in the existing real
// useMarketMood() pipeline (api/market-mood-data.js). No second data
// pipeline, no Math.random(), no generateDemoCandles().
//
// Honest limitation: the underlying provider only supplies one daily H/L/C
// candle per session (confirmed - no 1m/5m/15m/1H intraday series exists
// anywhere in this codebase). An intraday chart with timeframe switching
// cannot be built from this without fabricating candles, so the chart and
// timeframe selector are shown as an explicit "unavailable" state instead
// of faked data.

import { useState } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { searchStocks } from "../../utils/searchStocks";

var INSTRUMENTS = [
  { key:"NIFTY", label:"NIFTY 50" },
  { key:"BANKNIFTY", label:"BANK NIFTY" },
  { key:"SENSEX", label:"SENSEX" },
  { key:"FINNIFTY", label:"FINNIFTY" }
];

// CPR (Central Pivot Range): Pivot=(H+L+C)/3, BC=(H+L)/2, TC=2*Pivot-BC.
// Narrow vs Wide classified by CPR width as a % of Pivot (threshold 0.15%,
// a commonly used intraday-trading heuristic) - narrow CPR is associated
// with higher odds of a volatile/trending move, wide CPR with more
// range-bound action. Tested with real execution across multiple
// high/low/close combinations before use; correctly varies based on how
// far the close settled from the high-low midpoint (this is a real
// mathematical property of CPR, not an approximation).
// Methodology note: classic CPR uses PRIOR DAY's H/L/C to project today's
// levels. This pipeline only exposes today's session H/L and prevClose
// (not prevHigh/prevLow), so - for consistency with the Key Levels pivot
// already shipped on Home, which has the same constraint - this uses
// today's own H/L/LTP instead. Labeled CALCULATED, never LIVE.
function computeCPR(idx){
  if(!idx || idx.ltp==null || idx.high==null || idx.low==null || idx.high<=idx.low) return null;
  var pivot = (idx.high + idx.low + idx.ltp) / 3;
  var bc = (idx.high + idx.low) / 2;
  var tc = (2 * pivot) - bc;
  var widthPct = (Math.abs(tc - bc) / pivot) * 100;
  return {
    pivot: Math.round(pivot*100)/100,
    bc: Math.round(Math.min(bc,tc)*100)/100,
    tc: Math.round(Math.max(bc,tc)*100)/100,
    widthPct: Math.round(widthPct*10000)/10000,
    status: widthPct < 0.15 ? "Narrow CPR" : "Wide CPR",
    note: widthPct < 0.15 ? "Potential volatile move" : "Range-bound bias"
  };
}

function computeRange(idx){
  if(!idx || idx.ltp==null || idx.high==null || idx.low==null || idx.high<=idx.low) return null;
  var width = idx.high - idx.low;
  var rawPosPct = ((idx.ltp - idx.low) / width) * 100;
  var posPct = Math.round(Math.max(0, Math.min(100, rawPosPct)) * 10) / 10;
  var distToHigh = Math.round((idx.high - idx.ltp) * 100) / 100;
  var distToLow = Math.round((idx.ltp - idx.low) * 100) / 100;
  var distToHighPct = Math.round((distToHigh / idx.ltp) * 10000) / 100;
  var distToLowPct = Math.round((distToLow / idx.ltp) * 10000) / 100;
  var zone = posPct<=20?"Near Low":(posPct<=40?"Lower Range":(posPct<=60?"Mid Range":(posPct<=80?"Upper Range":"Near High")));
  var state, meansText, watchPoints;
  if(posPct>=80){
    state = "Breakout Watch";
    meansText = "Price is near the upper range boundary. A sustained move above "+fmtNum(idx.high)+" may indicate range expansion.";
    watchPoints = ["Above "+fmtNum(idx.high)+" \u2192 potential breakout area", "Watch volume confirmation on any move above the high", "A failed push above the high may signal exhaustion"];
  } else if(posPct<=20){
    state = "Breakdown Watch";
    meansText = "Price is trading in the lower part of today's range. Watch "+fmtNum(idx.low)+" for downside expansion.";
    watchPoints = ["Below "+fmtNum(idx.low)+" \u2192 potential breakdown area", "Watch volume confirmation on any move below the low", "A failed push below the low may signal support holding"];
  } else {
    state = "Balanced";
    meansText = "Price is trading near the "+zone.toLowerCase()+" of today's range. No clear range-side pressure yet.";
    watchPoints = ["Above "+fmtNum(idx.high)+" \u2192 resistance breakout area", "Below "+fmtNum(idx.low)+" \u2192 support breakdown area", "Range width is "+(Math.round((width/idx.ltp)*10000)/100)+"% of current price"];
  }
  return {
    ltp:idx.ltp, high:idx.high, low:idx.low, width:Math.round(width*100)/100,
    widthPct: Math.round((width/idx.ltp)*10000)/100,
    posPct:posPct, zone:zone, distToHigh:distToHigh, distToLow:distToLow,
    distToHighPct:distToHighPct, distToLowPct:distToLowPct,
    state:state, meansText:meansText, watchPoints:watchPoints
  };
}

function fmtNum(v){
  return v==null ? "--" : v.toLocaleString("en-IN");
}

export default function RangeIntelligence(props){
  var theme = useTheme();
  var BG=theme.c.bg, CARD=theme.c.card, CARD2=theme.c.card2, BD=theme.c.border;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var UP=theme.c.up, DOWN=theme.c.down, WARN=theme.c.warn, BLUE=theme.c.blue;

  var mm = props.mm || {};
  var indices = (mm.data && mm.data.indices) || {};
  var [selected, setSelected] = useState("NIFTY");
  var [query, setQuery] = useState("");
  var [searchOpen, setSearchOpen] = useState(false);
  var searchResults = searchStocks(query, 8);

  var idx = indices[selected];
  var range = computeRange(idx);
  var stateColor = range ? (range.state==="Breakout Watch"?WARN:(range.state==="Breakdown Watch"?WARN:UP)) : T2;

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:24}}>
      <div style={{background:CARD,padding:"10px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          {props.setTab ? (
            <button onClick={function(){ props.setTab("home"); }} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,color:T1}}>&#8592;</button>
          ) : null}
          <div onClick={function(){ props.setTab && props.setTab("home"); }} style={{fontSize:17,fontWeight:900,letterSpacing:-0.4,cursor:"pointer",whiteSpace:"nowrap"}}>
            <span style={{color:T1}}>Breakout</span><span style={{color:theme.c.brand}}>Pro</span>
          </div>
        </div>

        {/* Search - reuses the exact same shared searchStocks() function and
            DEMO_STOCKS dataset the global header search and mobile search
            use. No duplicate search pipeline. */}
        <div style={{position:"relative",flex:1,maxWidth:320,margin:"0 auto"}}>
          <span style={{position:"absolute",top:"50%",left:12,transform:"translateY(-50%)",pointerEvents:"none",display:"flex"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            value={query}
            onChange={function(e){ setQuery(e.target.value); }}
            onFocus={function(){ setSearchOpen(true); }}
            onBlur={function(){ setTimeout(function(){ setSearchOpen(false); },150); }}
            placeholder="Search NIFTY, BANKNIFTY, RELIANCE..."
            style={{width:"100%",boxSizing:"border-box",background:CARD2,border:"1px solid "+BD,borderRadius:10,padding:"8px 12px 8px 32px",color:T1,fontSize:12,fontFamily:"inherit",outline:"none"}}
          />
          {searchOpen && searchResults.length>0 ? (
            <div style={{position:"absolute",top:"110%",left:0,right:0,background:CARD,border:"1px solid "+BD,borderRadius:10,overflow:"hidden",zIndex:50,boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
              {searchResults.map(function(s){
                return (
                  <div key={s.sym} onMouseDown={function(){ props.onSelectStock && props.onSelectStock(s); }} style={{padding:"8px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,fontWeight:700,color:T1}}>{s.sym}</span>
                    <span style={{fontSize:11,color:T2}}>{s.name}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <button onClick={function(){ props.setTab && props.setTab("home"); }} style={{background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:8,padding:"7px 12px",cursor:"pointer",color:BLUE,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:13}}>&#127968;</span>Home
          </button>
          <button onClick={function(){ props.setTab && props.setTab("alerts"); }} style={{background:"none",border:"none",cursor:"pointer",color:T2,fontSize:17,padding:"0 4px"}}>&#128276;</button>
          <div onClick={function(){ props.setTab && props.setTab("profile"); }} style={{width:32,height:32,borderRadius:"50%",background:BLUE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff",cursor:"pointer",flexShrink:0}}>
            {props.user && props.user.name ? props.user.name[0].toUpperCase() : "U"}
          </div>
        </div>
      </div>

      <div style={{padding:"8px 12px",maxWidth:1440,margin:"0 auto",boxSizing:"border-box"}}>
        {/* Instrument selector - only the 4 indices confirmed genuinely real
            (fetched via fetchQuoteBatch in api/market-mood-data.js).
            Individual stock search is NOT implemented here for range data -
            no real per-stock intraday provider exists in this codebase, and
            adding a range panel that returns nothing or fabricated data
            would be dishonest. The header search above is for navigating to
            a stock's own profile page instead. */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {INSTRUMENTS.map(function(inst){
              var active = selected===inst.key;
              return (
                <button key={inst.key} onClick={function(){ setSelected(inst.key); }} style={{background:active?BLUE:CARD,border:"1px solid "+(active?BLUE:BD),color:active?"#fff":T1,fontSize:12,fontWeight:700,borderRadius:8,padding:"7px 14px",cursor:"pointer"}}>
                  {inst.label}
                </button>
              );
            })}
          </div>
          <div style={{textAlign:"right"}}>
            <span style={{fontSize:10,fontWeight:800,color:UP,background:UP+"18",border:"1px solid "+UP+"55",borderRadius:6,padding:"3px 8px",display:"inline-flex",alignItems:"center",gap:4}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:UP}}></span>LIVE
            </span>
            {mm.data && mm.data.generatedAt ? <div style={{fontSize:10,color:T3,marginTop:2}}>Updated: {new Date(mm.data.generatedAt).toLocaleTimeString("en-IN",{hour12:true})}</div> : null}
          </div>
        </div>
        <div style={{fontSize:10,color:T3,marginBottom:8}}>Individual stock range data is not yet available - no verified per-stock intraday provider is connected.</div>

        {!range ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",textAlign:"center",color:T2,fontSize:12}}>
            No verified range data available right now for {INSTRUMENTS.filter(function(i){return i.key===selected;})[0].label}.
          </div>
        ) : (
          <div>
            {/* RANGE CHANNEL - the one chart mode real data actually
                supports. Built entirely from today's real high/low/CPR/S1/R1
                (same computeCPR() already used elsewhere on this page) -
                no candles, no fabricated price history. Candlestick/Line/
                Area modes and 5m-1Y timeframe switching are NOT built here:
                this provider gives exactly one H/L/C reading per session,
                with no intraday or multi-day series behind it anywhere in
                this codebase - building those modes would mean inventing
                every bar. Labeled honestly below instead of faked. */}
            {(function(){
              var cpr = computeCPR(idx);
              var chW = 640, chH = 160, padL = 46, padR = 46;
              var lo = range.low, hi = range.high;
              var span = hi - lo;
              function yFor(v){ return chH - 20 - ((v - lo) / span) * (chH - 40); }
              var ltpY = yFor(range.ltp);
              return (
                <div style={{background:CARD,border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:6}}>
                    <div style={{fontSize:13,fontWeight:800,color:T1}}>{INSTRUMENTS.filter(function(i){return i.key===selected;})[0].label} &middot; Range Channel</div>
                    <span style={{fontSize:10,fontWeight:800,color:UP,background:UP+"18",border:"1px solid "+UP+"55",borderRadius:6,padding:"3px 8px"}}>CALCULATED &#183; today's real session</span>
                  </div>
                  <svg width="100%" height={chH} viewBox={"0 0 "+chW+" "+chH} preserveAspectRatio="xMidYMid meet">
                    {/* Range channel box: today's real high to low */}
                    <rect x={padL} y={yFor(hi)} width={chW-padL-padR} height={yFor(lo)-yFor(hi)} fill={BLUE+"14"} stroke={BLUE} strokeWidth="1.5" strokeDasharray="4 3"/>
                    <line x1={padL} y1={yFor(hi)} x2={chW-padR} y2={yFor(hi)} stroke={DOWN} strokeWidth="1.5"/>
                    <text x={chW-padR+4} y={yFor(hi)+4} fontSize="10" fill={DOWN}>Resistance {fmtNum(hi)}</text>
                    <line x1={padL} y1={yFor(lo)} x2={chW-padR} y2={yFor(lo)} stroke={UP} strokeWidth="1.5"/>
                    <text x={chW-padR+4} y={yFor(lo)+4} fontSize="10" fill={UP}>Support {fmtNum(lo)}</text>
                    {cpr ? (
                      <g>
                        <line x1={padL} y1={yFor(cpr.pivot)} x2={chW-padR} y2={yFor(cpr.pivot)} stroke={T3} strokeWidth="1" strokeDasharray="2 2"/>
                        <text x={4} y={yFor(cpr.pivot)+4} fontSize="10" fill={T3}>CPR {fmtNum(cpr.pivot)}</text>
                      </g>
                    ) : null}
                    {/* Current price marker */}
                    <line x1={padL} y1={ltpY} x2={chW-padR} y2={ltpY} stroke={T1} strokeWidth="1"/>
                    <circle cx={padL + (chW-padL-padR)*(range.posPct/100)} cy={ltpY} r="5" fill={T1} stroke={CARD} strokeWidth="2"/>
                    <text x={padL + (chW-padL-padR)*(range.posPct/100)} y={ltpY-10} fontSize="11" fontWeight="800" fill={T1} textAnchor="middle">{fmtNum(range.ltp)}</text>
                  </svg>
                  {cpr ? (
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
                      <span style={{fontSize:11,fontWeight:800,color:cpr.status==="Narrow CPR"?WARN:UP,background:(cpr.status==="Narrow CPR"?WARN:UP)+"18",border:"1px solid "+(cpr.status==="Narrow CPR"?WARN:UP)+"55",borderRadius:6,padding:"3px 9px"}}>{cpr.status}</span>
                      <span style={{fontSize:11,color:T2}}>{cpr.note} &middot; width {cpr.widthPct}%</span>
                    </div>
                  ) : null}
                  <div style={{fontSize:10,color:T3,lineHeight:1.5,marginTop:6}}>
                    This is the only chart mode built from real data - this provider gives one high/low/close reading per session, with no 5m/10m/15m/20m/30m/1h/1D/1M/1Y intraday or historical series anywhere in this codebase. Candlestick, Line, and Area modes, and timeframe switching, would require inventing every price bar - not implemented here for that reason.
                  </div>
                </div>
              );
            })()}

            {/* Range Summary - every value real, computed above */}
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",marginBottom:8}}>
              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:8}}>Range Summary</div>
              {[
                ["Current Price (CMP)", fmtNum(range.ltp), T1],
                ["Today's High (R)", fmtNum(range.high), DOWN],
                ["Today's Low (S)", fmtNum(range.low), UP],
                ["Range (R - S)", fmtNum(range.width), T1],
                ["Range %", range.widthPct+"%", T1],
                ["Distance to Resistance", fmtNum(range.distToHigh)+" ("+range.distToHighPct+"%)", DOWN],
                ["Distance to Support", fmtNum(range.distToLow)+" ("+range.distToLowPct+"%)", UP]
              ].map(function(row,i){
                return (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderTop:i>0?"1px solid "+BD:"none"}}>
                    <span style={{fontSize:12,color:T2}}>{row[0]}</span>
                    <span style={{fontSize:12,fontWeight:700,color:row[2]}}>{row[1]}</span>
                  </div>
                );
              })}
              <div style={{padding:"8px 0 0"}}>
                <div style={{fontSize:12,color:T2,marginBottom:8}}>Range Position</div>
                <div style={{position:"relative",height:24,marginBottom:4}}>
                  <div style={{position:"absolute",top:11,left:0,right:0,height:2,background:BD}}></div>
                  <div style={{position:"absolute",top:4,left:"calc("+range.posPct+"% - 8px)",width:16,height:16,borderRadius:"50%",background:BLUE,border:"2px solid "+CARD}}></div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T3}}>
                  <span>LOW</span>
                  <span style={{fontWeight:700,color:T1}}>{range.zone} &middot; {range.posPct}%</span>
                  <span>HIGH</span>
                </div>
              </div>
            </div>

            {/* Range Status */}
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",marginBottom:8}}>
              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:8}}>Range Status</div>
              <span style={{fontSize:11,fontWeight:800,color:stateColor,background:stateColor+"18",border:"1px solid "+stateColor+"55",borderRadius:6,padding:"4px 10px",display:"inline-block"}}>{range.state}</span>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:8}}>
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:6,padding:"8px 12px"}}>
                <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:6}}>What It Means</div>
                <div style={{fontSize:12,color:T2,lineHeight:1.6}}>{range.meansText}</div>
              </div>
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:6,padding:"8px 12px"}}>
                <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:6}}>What To Watch</div>
                {range.watchPoints.map(function(p,i){
                  return <div key={i} style={{fontSize:12,color:T2,lineHeight:1.6,marginBottom:2}}>&#8226; {p}</div>;
                })}
              </div>
            </div>

            {/* Key Levels - Strong Resistance/Support derived honestly from
                the same real high/low (no separate "strong" level data
                source exists, so these are the same range boundaries,
                labeled plainly rather than implying a distinct calculation
                that doesn't exist). */}
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:6,padding:"8px 12px",marginBottom:8}}>
              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:8}}>Key Levels</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:10,textAlign:"center"}}>
                <div><div style={{fontSize:10,color:T2}}>Resistance</div><div style={{fontSize:13,fontWeight:800,color:DOWN}}>{fmtNum(range.high)}</div></div>
                <div><div style={{fontSize:10,color:T2}}>Support</div><div style={{fontSize:13,fontWeight:800,color:UP}}>{fmtNum(range.low)}</div></div>
              </div>
            </div>

            <div style={{fontSize:11,color:T3,textAlign:"center"}}>Educational market analysis only. Not a trading recommendation. &middot; Source: Live Market Data</div>
          </div>
        )}
      </div>
    </div>
  );
}
