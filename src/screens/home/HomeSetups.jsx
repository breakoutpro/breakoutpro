import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { useLang } from "../../i18n/translations";
import { useBreakoutSetups } from "../../hooks/useBreakoutSetups";
import { isClockOpen } from "../DirectionEngine";
import { istStamp } from "../../state/marketTickerModel";

// BreakoutPro - HomeSetups.jsx
// Hero: Today's Breakout Setups (up to 3 compact cards) from the existing /api/scanner-data classifier.
// Timeframe is Daily (1D): the classifier compares the latest daily close with the prior 15-session high / low.
// States: while the market is open the daily candle is still forming, so the setup is WAITING;
// after the close it is CONFIRMED. Unavailable = the scanner request failed. (No Conflicting state: the classifier has none.) Key level and volume are shown only when the API returned them.
// The data is Yahoo daily candles, so it is labelled delayed, never LIVE. Nothing is predicted or rated; no examples.
// Rules: no backtick, no triple-equals, ASCII only.

var RUPEE = "\u20B9";

function fmt(v){ return RUPEE + v.toLocaleString("en-IN", { maximumFractionDigits:2 }); }

export default function HomeSetups(props){
  useLang();
  var c = useTheme().c;
  var light = c.scheme == "light";
  var big = !!props.big;
  var go = props.setTab || function(){};
  var d = useBreakoutSetups();
  var ns = useState(Date.now());
  var now = ns[0], setNow = ns[1];
  useEffect(function(){
    var id = setInterval(function(){ setNow(Date.now()); }, 30000);
    return function(){ clearInterval(id); };
  }, []);
  var open = isClockOpen(now);
  var stamp = d.generatedAt != null ? istStamp(d.generatedAt, now) : null;
  var shell = { boxSizing:"border-box",minWidth:0,background:light ? "rgba(255,255,255,0.92)" : c.card,border:"1px solid " + (light ? "rgba(255,255,255,0.95)" : c.border),borderRadius:14,boxShadow:light ? "0 4px 14px rgba(37,99,235,0.08), 0 1px 2px rgba(15,23,42,0.05)" : "0 3px 10px rgba(0,0,0,0.22)",color:c.text1 };
  var note = null;
  if(d.status == "loading") note = "Loading setups...";
  else if(d.status == "error") note = "Breakout data unavailable right now.";
  else if(d.setups.length == 0) note = "No confirmed setups right now.";
  return (
    <section data-testid="home-setups" aria-label="Today's Breakout Setups" style={{minWidth:0}}>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:8,marginBottom:6,minWidth:0}}>
        <h2 style={{margin:0,fontSize:big ? 17 : 15,fontWeight:800,color:c.text1}}>{"Today's Breakout Setups"}</h2>
        <button type="button" data-testid="home-setups-all" onClick={function(){ go("breakoutscan"); }} style={{background:"none",border:"none",padding:4,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:c.blue,whiteSpace:"nowrap"}}>{"View all >"}</button>
      </div>
      {note ? (
        <div data-testid="home-setups-empty" data-state={d.status == "ok" ? "empty" : d.status} role="status" style={Object.assign({}, shell, {padding:"14px 14px",fontSize:13,fontWeight:600,color:c.text2})}>
          {note}
          {d.status == "ok" && stamp ? <div style={{marginTop:4,fontSize:10,fontWeight:600,color:c.text3}}>{"Checked " + stamp + " IST - daily candles, delayed, not live"}</div> : null}
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:big ? "repeat(auto-fit, minmax(230px, 1fr))" : "minmax(0, 1fr)",gap:big ? 12 : 8}}>
          {d.setups.map(function(s){
            var up = s.type == "breakout";
            var dirCol = up ? c.up : c.down;
            var chip = open ? "Waiting" : "Confirmed";
            var why = open
              ? "Waiting: price is " + (up ? "above" : "below") + " the prior 15-session " + (up ? "high" : "low") + ", but today's daily candle is still forming."
              : "Daily close " + (up ? "above" : "below") + " the prior 15-session " + (up ? "high" : "low") + ".";
            return (
              <button key={s.sym} type="button" data-testid={"home-setup-" + s.sym} data-conf={open ? "unconfirmed" : "confirmed"} onClick={function(){ go("breakoutscan"); }}
                style={Object.assign({}, shell, {textAlign:"left",width:"100%",padding:"10px 12px",cursor:"pointer",fontFamily:"inherit"})}>
                <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                  <span style={{fontSize:15,fontWeight:800,minWidth:0,overflowWrap:"anywhere"}}>{s.sym}</span>
                  <span style={{fontSize:10,fontWeight:600,color:c.text3}}>NSE</span>
                  <span style={{marginLeft:"auto",fontSize:11,fontWeight:800,color:dirCol,whiteSpace:"nowrap"}}>{(up ? "Breakout " : "Breakdown ") + (up ? "\u25B2" : "\u25BC")}</span>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:6,marginTop:6}}>
                  <span style={{fontSize:10,fontWeight:700,color:c.text2,border:"1px solid " + c.border,borderRadius:999,padding:"1px 7px"}}>Daily (1D)</span>
                  <span style={{fontSize:10,fontWeight:800,color:open ? c.text2 : c.blue,border:"1px solid " + (open ? c.border : c.blue),borderRadius:999,padding:"1px 7px"}}>{chip}</span>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"2px 12px",marginTop:6,fontSize:12,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>
                  <span>{(up ? "Prior high " : "Prior low ") + fmt(s.level)}</span>
                  {typeof s.ltp == "number" ? <span>{(open ? "Last " : "Close ") + fmt(s.ltp)}</span> : null}
                  {s.chgPct != null ? <span style={{color:s.chgPct >= 0 ? c.up : c.down}}>{(s.chgPct >= 0 ? "+" : "") + s.chgPct.toFixed(2) + "%"}</span> : null}
                  {s.volRatio != null ? <span style={{color:c.text2}}>{"Volume " + s.volRatio.toFixed(2) + "x 15-day avg"}</span> : null}
                </div>
                <div style={{marginTop:6,fontSize:11,lineHeight:1.35,color:c.text2}}>{why}</div>
                <div style={{marginTop:6,fontSize:10,fontWeight:600,color:c.text3}}>{(stamp ? "Updated " + stamp + " IST - " : "") + "Daily candles, delayed, not live"}</div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
