// BreakoutPro - BreakoutScanner.jsx
// Real-data breakout/breakdown/volume-spike scanner. Fetches from
// /api/scanner-data (real Yahoo daily candles, deterministic classification
// server-side - no Math.random, no fabricated prices/volumes). Separate from
// the existing Scanner.jsx, which is an explicitly mock/demo system used for
// scan categories that have no real data source yet.

import { useState, useEffect } from "react";
import { useTheme } from "../theme/ThemeProvider";

var FILTERS = [
  { id:"all",      label:"All" },
  { id:"breakout", label:"Breakout" },
  { id:"breakdown",label:"Breakdown" },
  { id:"volspike", label:"Volume Spike" }
];

var TAG_META = {
  breakout:  { text:"Breakout Detected",     icon:"\u2191" },
  breakdown: { text:"Breakdown Detected",    icon:"\u2193" },
  volspike:  { text:"Unusual Volume",        icon:"\u26a1" }
};

function fmtVol(v){
  if(v==null) return "--";
  if(v>=10000000) return (v/10000000).toFixed(2)+"Cr";
  if(v>=100000) return (v/100000).toFixed(2)+"L";
  if(v>=1000) return (v/1000).toFixed(1)+"K";
  return String(v);
}

export default function BreakoutScanner(props){
  var theme = useTheme();
  var BG=theme.c.bg, CARD=theme.c.card, BD=theme.c.border;
  var T1=theme.c.text1, T2=theme.c.text2, T3=theme.c.text3;
  var GREEN=theme.c.up, RED=theme.c.down, BLUE=theme.c.blue, WARN=theme.c.warn;

  var [filter, setFilter] = useState("all");
  var [status, setStatus] = useState("loading"); // loading | ok | error
  var [results, setResults] = useState([]);
  var [meta, setMeta] = useState(null);

  useEffect(function(){
    var cancelled = false;
    setStatus("loading");
    fetch("/api/scanner-data")
      .then(function(r){ return r.json(); })
      .then(function(j){
        if(cancelled) return;
        if(j && j.ok!==false && j.results){
          setResults(j.results);
          setMeta({ scanned:j.scanned, matched:j.matched, generatedAt:j.generatedAt });
          setStatus("ok");
        } else {
          setStatus("error");
        }
      })
      .catch(function(){ if(!cancelled) setStatus("error"); });
    return function(){ cancelled = true; };
  }, []);

  var filtered = filter==="all" ? results : results.filter(function(r){ return r.tags.indexOf(filter)>=0; });

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:24}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        {props.onBack ? (
          <button onClick={props.onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:T1}}>&#8592;</button>
        ) : null}
        <div>
          <div style={{fontSize:16,fontWeight:900,color:T1}}>Breakout Scanner</div>
          <div style={{fontSize:11,color:T2}}>Real NIFTY 50 price/volume data &middot; Educational only</div>
        </div>
      </div>

      <div style={{padding:"10px 16px"}}>
        <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto"}}>
          {FILTERS.map(function(f){
            var active = filter===f.id;
            return (
              <button key={f.id} onClick={function(){ setFilter(f.id); }} style={{flexShrink:0,background:active?BLUE:CARD,border:"1px solid "+(active?BLUE:BD),color:active?"#fff":T1,fontSize:12,fontWeight:700,borderRadius:8,padding:"7px 14px",cursor:"pointer"}}>
                {f.label}
              </button>
            );
          })}
        </div>

        {status==="loading" ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:20,textAlign:"center",color:T2,fontSize:12}}>Scanning real market data...</div>
        ) : status==="error" ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:20,textAlign:"center",color:T2,fontSize:12}}>Data unavailable right now. Live scanner data could not be fetched.</div>
        ) : filtered.length===0 ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:20,textAlign:"center",color:T2,fontSize:12}}>No stocks currently match this filter based on real data.</div>
        ) : (
          <div>
            {filtered.map(function(r){
              var up = r.chgPct!=null ? r.chgPct>=0 : null;
              return (
                <div key={r.sym} style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:12,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:900,color:T1}}>{r.sym}</div>
                      <div style={{fontSize:16,fontWeight:800,color:up==null?T2:(up?GREEN:RED),marginTop:2}}>
                        &#8377;{r.ltp.toLocaleString("en-IN")}
                        <span style={{fontSize:11,fontWeight:700,marginLeft:6}}>{r.chgPct!=null?(r.chgPct>=0?"+":"")+r.chgPct+"%":"--"}</span>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      {r.tags.map(function(t){
                        var tm = TAG_META[t];
                        var col = t==="breakout"?GREEN:(t==="breakdown"?RED:WARN);
                        return (
                          <span key={t} style={{fontSize:10,fontWeight:800,color:col,background:col+"18",border:"1px solid "+col+"55",borderRadius:6,padding:"3px 8px"}}>
                            {tm.icon} {tm.text}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,paddingTop:8,borderTop:"1px solid "+BD}}>
                    <div>
                      <div style={{fontSize:9,color:T3}}>{r.tags.indexOf("breakdown")>=0?"Support Level":"Resistance Level"}</div>
                      <div style={{fontSize:11,fontWeight:700,color:T1}}>&#8377;{(r.tags.indexOf("breakdown")>=0?r.priorLow:r.priorHigh).toLocaleString("en-IN")}</div>
                    </div>
                    <div>
                      <div style={{fontSize:9,color:T3}}>Volume</div>
                      <div style={{fontSize:11,fontWeight:700,color:T1}}>{fmtVol(r.volume)}</div>
                    </div>
                    <div>
                      <div style={{fontSize:9,color:T3}}>vs Avg Volume</div>
                      <div style={{fontSize:11,fontWeight:700,color:r.volRatio!=null&&r.volRatio>=1.5?WARN:T1}}>{r.volRatio!=null?r.volRatio+"x":"--"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {meta ? (
          <div style={{fontSize:10,color:T3,marginTop:8,textAlign:"center"}}>
            Scanned {meta.scanned} stocks &middot; {meta.matched} matched &middot; {new Date(meta.generatedAt).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"})}
          </div>
        ) : null}

        <div style={{background:WARN+"14",border:"1px solid "+WARN+"55",borderRadius:10,padding:12,marginTop:12}}>
          <div style={{fontSize:11,color:WARN,lineHeight:1.6}}>Scanners detect price/volume conditions from real data, not trading signals. This is educational market analysis, not investment advice or a buy/sell recommendation.</div>
        </div>
      </div>
    </div>
  );
}
