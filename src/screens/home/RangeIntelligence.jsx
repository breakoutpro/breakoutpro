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

var INSTRUMENTS = [
  { key:"NIFTY", label:"NIFTY 50" },
  { key:"BANKNIFTY", label:"BANK NIFTY" },
  { key:"SENSEX", label:"SENSEX" },
  { key:"FINNIFTY", label:"FINNIFTY" }
];

function computeRange(idx){
  if(!idx || idx.ltp==null || idx.high==null || idx.low==null || idx.high<=idx.low) return null;
  var width = idx.high - idx.low;
  var posPct = Math.round(((idx.ltp - idx.low) / width) * 1000) / 10;
  var distToHigh = Math.round((idx.high - idx.ltp) * 100) / 100;
  var distToLow = Math.round((idx.ltp - idx.low) * 100) / 100;
  var distToHighPct = Math.round((distToHigh / idx.ltp) * 10000) / 100;
  var distToLowPct = Math.round((distToLow / idx.ltp) * 10000) / 100;
  var state, meansText, watchPoints;
  if(posPct>=90){
    state = "BREAKOUT WATCH";
    meansText = "Price is approaching today's high with limited room left in the range. A sustained move above this level would indicate increasing breakout pressure.";
    watchPoints = ["Above "+fmtNum(idx.high)+" \u2192 potential breakout area", "Watch volume confirmation on any move above the high", "A failed push above the high may signal exhaustion"];
  } else if(posPct<=10){
    state = "BREAKDOWN WATCH";
    meansText = "Price is approaching today's low with limited room left in the range. A sustained move below this level would indicate increasing breakdown risk.";
    watchPoints = ["Below "+fmtNum(idx.low)+" \u2192 potential breakdown area", "Watch volume confirmation on any move below the low", "A failed push below the low may signal support holding"];
  } else {
    state = "RANGE";
    meansText = "Price is trading between today's established high and low, without a strong breakout or breakdown signal yet.";
    watchPoints = ["Above "+fmtNum(idx.high)+" \u2192 resistance breakout area", "Below "+fmtNum(idx.low)+" \u2192 support breakdown area", "Range width is "+(Math.round((width/idx.ltp)*10000)/100)+"% of current price"];
  }
  return {
    ltp:idx.ltp, high:idx.high, low:idx.low, width:Math.round(width*100)/100,
    widthPct: Math.round((width/idx.ltp)*10000)/100,
    posPct:posPct, distToHigh:distToHigh, distToLow:distToLow,
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

  var idx = indices[selected];
  var range = computeRange(idx);
  var stateColor = range ? (range.state==="BREAKOUT WATCH"?WARN:(range.state==="BREAKDOWN WATCH"?WARN:UP)) : T2;

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:24}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
        {props.setTab ? (
          <button onClick={function(){ props.setTab("home"); }} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,color:T1}}>&#8592;</button>
        ) : null}
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>Range Intelligence</div>
          <div style={{fontSize:11,color:T2}}>Real-time intraday range analysis</div>
        </div>
        <span style={{fontSize:10,fontWeight:800,color:UP,background:UP+"18",border:"1px solid "+UP+"55",borderRadius:6,padding:"3px 8px",display:"inline-flex",alignItems:"center",gap:4}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:UP}}></span>LIVE
        </span>
      </div>

      <div style={{padding:"12px 16px",maxWidth:1280,margin:"0 auto",boxSizing:"border-box"}}>
        {/* Instrument selector - only the 4 indices confirmed genuinely real
            (fetched via fetchQuoteBatch in api/market-mood-data.js).
            Individual stock search is NOT implemented - no real per-stock
            provider exists in this codebase, and adding a search box that
            returns nothing or fabricated data would be dishonest. */}
        <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
          {INSTRUMENTS.map(function(inst){
            var active = selected===inst.key;
            return (
              <button key={inst.key} onClick={function(){ setSelected(inst.key); }} style={{background:active?BLUE:CARD,border:"1px solid "+(active?BLUE:BD),color:active?"#fff":T1,fontSize:12,fontWeight:700,borderRadius:8,padding:"7px 14px",cursor:"pointer"}}>
                {inst.label}
              </button>
            );
          })}
        </div>
        <div style={{fontSize:10,color:T3,marginBottom:10}}>Individual stock search is not yet available - no verified per-stock intraday provider is connected.</div>

        {!range ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:20,textAlign:"center",color:T2,fontSize:12}}>
            No verified range data available right now for {INSTRUMENTS.filter(function(i){return i.key===selected;})[0].label}.
          </div>
        ) : (
          <div>
            {/* Chart - explicitly unavailable, not faked. Only one daily
                H/L/C candle per session exists in this provider - no
                intraday bar sequence to plot. */}
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:16,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:800,color:T1}}>{INSTRUMENTS.filter(function(i){return i.key===selected;})[0].label} &middot; Intraday Chart</div>
                <span style={{fontSize:10,fontWeight:800,color:T3,background:BG,border:"1px solid "+BD,borderRadius:6,padding:"3px 8px"}}>UNAVAILABLE</span>
              </div>
              <div style={{fontSize:11,color:T2,lineHeight:1.6}}>No verified intraday (1m/5m/15m/1H) data provider is connected yet - only end-of-session high/low/close is available. Timeframe switching and a candle chart will appear once a real intraday feed is integrated.</div>
            </div>

            {/* Range Summary - every value real, computed above */}
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:16,marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:10}}>Range Summary</div>
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
                <div style={{fontSize:12,color:T2,marginBottom:4}}>Position in Range</div>
                <div style={{height:8,background:BD,borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:range.posPct+"%",background:BLUE}}></div>
                </div>
                <div style={{fontSize:11,color:T3,marginTop:2,textAlign:"right"}}>{range.posPct}%</div>
              </div>
            </div>

            {/* Range Status */}
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:16,marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:8}}>Range Status</div>
              <span style={{fontSize:11,fontWeight:800,color:stateColor,background:stateColor+"18",border:"1px solid "+stateColor+"55",borderRadius:6,padding:"4px 10px",display:"inline-block",marginBottom:8}}>{range.state}</span>
              <div style={{fontSize:12,color:T2,lineHeight:1.6}}>{range.state==="RANGE"?"Price is trading within today's range.":(range.state==="BREAKOUT WATCH"?"Price is approaching resistance.":"Price is approaching support.")}</div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:16}}>
                <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:6}}>What It Means</div>
                <div style={{fontSize:12,color:T2,lineHeight:1.6}}>{range.meansText}</div>
              </div>
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:16}}>
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
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:16,marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:10}}>Key Levels</div>
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
