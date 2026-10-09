// BreakoutPro - ChartPatternScanner.jsx
// Mobile-first "Chart Pattern Scanner": lists candlestick patterns detected
// by the EXISTING engine (src/utils/candlePatterns.js - detectCandlePatterns)
// on the REAL daily candles already flowing through mm.data.indexHistory.
//
// DATA HONESTY - read before changing anything:
// - Only NIFTY / BANKNIFTY / SENSEX have daily candle history in the feed
//   (api/market-mood-data.js indexHistory). FINNIFTY has none, so it is
//   shown as UNAVAILABLE - never filled in with invented candles.
// - The feed carries daily H/L/C only (no open, no calendar date). Each
//   candle's open is CALCULATED as the previous session's close (same
//   convention Range Intelligence uses and discloses). Detection "time" is
//   therefore shown as sessions-ago, never as a made-up date/clock time.
// - Only the 1D timeframe is offered: there is no verified intraday feed,
//   and the intraday candles inside Range Intelligence are a seeded PREVIEW
//   simulation. This screen deliberately does NOT use them, so nothing here
//   is preview data and nothing is labeled LIVE (feed status is DELAYED).
// - Status: the engine returns a pattern per candle and has no "forming" or
//   "invalidated" logic. So: a pattern on the latest candle while the NSE
//   session is open is shown as FORMING (that daily candle is still open and
//   can change); a pattern on any completed candle is CONFIRMED (the engine
//   matched it on a closed candle). INVALIDATED is not shown because the
//   engine cannot produce it.
// - No support/resistance is shown: no reliable shared source is exposed
//   without duplicating Range Intelligence's pivot math.
// Rules: no backtick literals, no triple-equals, ASCII only.

import { useState, useMemo } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { detectCandlePatterns } from "../utils/candlePatterns";

var GREEN = "#16A34A";
var RED = "#DC2626";
var AMBER = "#EAB308";

var INSTRUMENTS = [
  { key:"NIFTY", label:"NIFTY 50" },
  { key:"BANKNIFTY", label:"BANK NIFTY" },
  { key:"SENSEX", label:"SENSEX" },
  { key:"FINNIFTY", label:"FINNIFTY" }
];
function instLabel(key){
  for(var i=0;i<INSTRUMENTS.length;i++){ if(INSTRUMENTS[i].key==key) return INSTRUMENTS[i].label; }
  return key;
}

// The only timeframe the data provider supports for verified candles.
var TIMEFRAMES = [ { key:"1D", label:"1D" } ];

function displayName(name){
  if(name=="W Pattern") return "W Pattern (Double Bottom)";
  if(name=="M Pattern") return "M Pattern (Double Top)";
  return name;
}

// Presentation-only one-line descriptions of what each pattern IS. They
// describe the shape, make no prediction and carry no accuracy claim.
var WHAT_IT_IS = {
  "Doji": "Open and close are nearly equal - buyers and sellers were balanced.",
  "Spinning Top": "Small body with wicks on both sides - no side controlled the candle.",
  "Hammer": "Small body near the top, long lower wick - sellers pushed down, buyers recovered.",
  "Inverted Hammer": "Small body near the bottom, long upper wick - buyers tried a push higher.",
  "Shooting Star": "Small body near the bottom, long upper wick - buyers pushed up, sellers recovered.",
  "Hanging Man": "Hammer-shaped candle after an up move - sellers started to test control.",
  "Bullish Engulfing": "A green body fully covers the prior red body - buyers took the candle.",
  "Bearish Engulfing": "A red body fully covers the prior green body - sellers took the candle.",
  "Bullish Harami": "A small candle inside the prior large red body - selling momentum is stalling.",
  "Bearish Harami": "A small candle inside the prior large green body - buying momentum is stalling.",
  "Morning Star": "Three candles: down, small pause, then up - selling pressure fading.",
  "Evening Star": "Three candles: up, small pause, then down - buying pressure fading.",
  "Piercing Line": "A green candle closes above the midpoint of the prior red candle.",
  "Dark Cloud Cover": "A red candle closes below the midpoint of the prior green candle.",
  "Three White Soldiers": "Three consecutive strong green candles - sustained buying.",
  "Three Black Crows": "Three consecutive strong red candles - sustained selling.",
  "W Pattern": "Price tested a low twice and closed back above - a double-bottom structure.",
  "M Pattern": "Price tested a high twice and closed back below - a double-top structure."
};

// How many trailing candles to highlight on the mini chart. This is a
// display mapping of the pattern NAME the engine already returned - it does
// not detect anything. Structural W/M highlight only the confirming candle.
function spanFor(name){
  if(name=="Morning Star" || name=="Evening Star" || name=="Three White Soldiers" || name=="Three Black Crows") return 3;
  if(name=="Bullish Engulfing" || name=="Bearish Engulfing" || name=="Bullish Harami" || name=="Bearish Harami" || name=="Piercing Line" || name=="Dark Cloud Cover") return 2;
  return 1;
}

// Same construction Range Intelligence uses for its real daily candles
// (open = previous close, disclosed). Kept here only as data prep - the
// pattern engine itself is imported, not copied.
function buildDailyCandles(hist){
  if(!hist || !hist.candles || hist.candles.length<2) return [];
  var arr = hist.candles;
  var out = [];
  for(var i=1;i<arr.length;i++){
    var prev = arr[i-1], cur = arr[i];
    if(cur.h==null || cur.l==null || cur.c==null) continue;
    out.push({ o:prev.c, h:Math.max(cur.h, prev.c, cur.c), l:Math.min(cur.l, prev.c, cur.c), c:cur.c });
  }
  return out;
}

// NSE cash session (09:15-15:30 IST, Mon-Fri) - UI convenience only, used to
// decide whether the latest daily candle is still open.
function isSessionOpen(){
  var now;
  try{ now = new Date(new Date().toLocaleString("en-US", { timeZone:"Asia/Kolkata" })); }catch(e){ now = new Date(); }
  var d = now.getDay();
  var m = now.getHours()*60 + now.getMinutes();
  return d>=1 && d<=5 && m>=9*60+15 && m<15*60+30;
}

function fmt(v){ return v==null ? "--" : v.toLocaleString("en-IN", { maximumFractionDigits:2 }); }

function ageLabel(age){
  if(age==0) return "Latest session";
  return age + (age==1 ? " session ago" : " sessions ago") + " (S-" + age + ")";
}

// Builds the event list for one instrument from its real history.
function buildEvents(key, hist, sessionOpen){
  var candles = buildDailyCandles(hist);
  if(candles.length<2) return { available:false, events:[] };
  var found = detectCandlePatterns(candles);
  var last = candles.length-1;
  var events = found.map(function(p){
    var age = last - p.index;
    var isLatest = age==0;
    return {
      id: key + "|1D|" + p.index + "|" + p.name,
      inst: key,
      tf: "1D",
      name: p.name,
      dir: p.dir,
      reason: p.reason,
      index: p.index,
      age: age,
      isLatest: isLatest,
      status: (isLatest && sessionOpen) ? "Forming" : "Confirmed",
      candles: candles
    };
  });
  return { available:true, events:events };
}

function MiniChart(props){
  var candles = props.candles, hi = props.index, span = props.span, color = props.color, theme = props.theme;
  var W = 300, H = 112, padT = 8, padB = 8, padX = 6;
  var n = candles.length;
  var mn = Infinity, mx = -Infinity;
  candles.forEach(function(c){ if(c.l<mn) mn=c.l; if(c.h>mx) mx=c.h; });
  var rng = Math.max(mx-mn, 0.0001);
  function y(v){ return padT + (H-padT-padB) * (1 - (v-mn)/rng); }
  var slot = (W-2*padX)/n;
  var bw = Math.max(3, Math.min(18, slot*0.55));
  var from = Math.max(0, hi-span+1);
  var hx = padX + from*slot;
  var hw = (hi-from+1)*slot;
  return (
    <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height:"auto",display:"block"}} role="img" aria-label="Mini candlestick chart with detected pattern highlighted">
      <rect x={hx} y={2} width={hw} height={H-4} rx={4} fill={color} opacity="0.16"/>
      {candles.map(function(c,i){
        var cx = padX + i*slot + slot/2;
        var up = c.c>=c.o;
        var col = up ? GREEN : RED;
        var top = y(Math.max(c.o,c.c)), bot = y(Math.min(c.o,c.c));
        return (
          <g key={i}>
            <line x1={cx} y1={y(c.h)} x2={cx} y2={y(c.l)} stroke={col} strokeWidth="1.2"/>
            <rect x={cx-bw/2} y={top} width={bw} height={Math.max(1.5, bot-top)} fill={col}/>
          </g>
        );
      })}
      <rect x={hx} y={2} width={hw} height={H-4} rx={4} fill="none" stroke={color} strokeWidth="1.2"/>
    </svg>
  );
}

function PatternCard(props){
  var ev = props.ev, theme = props.theme;
  var CARD = theme.c.card, BD = theme.c.border, T1 = theme.c.text1, T2 = theme.c.text2, T3 = theme.c.text3;
  var [open, setOpen] = useState(false);
  var bias = ev.dir=="bull" ? "Bullish" : (ev.dir=="bear" ? "Bearish" : "Neutral");
  var biasColor = ev.dir=="bull" ? GREEN : (ev.dir=="bear" ? RED : T2);
  var statusColor = ev.status=="Confirmed" ? theme.c.blue : AMBER;
  var c = ev.candles[ev.index];
  function chip(text, color){
    return <span style={{fontSize:10,fontWeight:800,color:color,background:color+"18",border:"1px solid "+color+"55",borderRadius:6,padding:"2px 7px",whiteSpace:"nowrap"}}>{text}</span>;
  }
  return (
    <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"10px 12px",display:"flex",flexDirection:"column",gap:8,minWidth:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
          <span style={{fontSize:13,fontWeight:800,color:T1}}>{instLabel(ev.inst)}</span>
          {chip(ev.tf, T2)}
        </div>
        {chip(ev.status, statusColor)}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:14,fontWeight:800,color:biasColor,overflowWrap:"anywhere"}}>{displayName(ev.name)}</span>
        {chip(bias, biasColor)}
      </div>
      <MiniChart candles={ev.candles} index={ev.index} span={spanFor(ev.name)} color={biasColor} theme={theme}/>
      <div style={{fontSize:11,color:T1,lineHeight:1.45}}>{WHAT_IT_IS[ev.name] || "Pattern matched by the Breakout Pro candle engine."}</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"4px 12px",fontSize:10,color:T3}}>
        <span>Detected: <b style={{color:T2}}>{ageLabel(ev.age)}</b></span>
        <span>Candle H <b style={{color:T2}}>{fmt(c.h)}</b></span>
        <span>L <b style={{color:T2}}>{fmt(c.l)}</b></span>
        <span>C <b style={{color:T2}}>{fmt(c.c)}</b></span>
      </div>
      {ev.status=="Forming" ? (
        <div style={{fontSize:10,color:AMBER,fontWeight:700,lineHeight:1.4}}>Forming - today's daily candle is still open and can change before the close. Not a confirmed setup.</div>
      ) : null}
      <div onClick={function(){ setOpen(!open); }} style={{fontSize:10,fontWeight:800,color:theme.c.blue,cursor:"pointer",borderTop:"1px solid "+BD,paddingTop:6}}>{open ? "Hide detection details -" : "Why was this detected? +"}</div>
      {open ? (
        <div style={{fontSize:10,color:T2,lineHeight:1.5,overflowWrap:"anywhere"}}>{ev.reason}</div>
      ) : null}
    </div>
  );
}

export default function ChartPatternScanner(props){
  var theme = useTheme();
  var BG = theme.c.bg, CARD = theme.c.card, BD = theme.c.border;
  var T1 = theme.c.text1, T2 = theme.c.text2, T3 = theme.c.text3, BLUE = theme.c.blue;
  var mm = props.mm || {};
  var indexHistory = (mm.data && mm.data.indexHistory) || null;
  var onBack = props.onBack || function(){};

  var [tab, setTab] = useState("current");
  var [instFilter, setInstFilter] = useState("ALL");
  var [tfFilter, setTfFilter] = useState("1D");
  var [biasFilter, setBiasFilter] = useState("ALL");
  var [query, setQuery] = useState("");

  var loading = !mm.data && (mm.status=="loading" || mm.status==null);
  var failed = !mm.data && !loading;

  var sessionOpen = isSessionOpen();

  var perInst = useMemo(function(){
    var out = {};
    INSTRUMENTS.forEach(function(it){
      out[it.key] = buildEvents(it.key, indexHistory ? indexHistory[it.key] : null, sessionOpen);
    });
    return out;
    // eslint-disable-next-line
  }, [indexHistory, sessionOpen]);

  // Current = pattern on each instrument's latest candle. History = every
  // earlier detection. Same id never appears twice (id = instrument|tf|
  // candle index|pattern name).
  var seen = {};
  var all = [];
  INSTRUMENTS.forEach(function(it){
    perInst[it.key].events.forEach(function(ev){
      if(seen[ev.id]) return;
      seen[ev.id] = true;
      all.push(ev);
    });
  });
  var currentAll = all.filter(function(e){ return e.isLatest; });
  var historyAll = all.filter(function(e){ return !e.isLatest; }).sort(function(a,b){ return a.age-b.age; });

  var q = query.trim().toLowerCase();
  function passes(ev){
    if(instFilter!="ALL" && ev.inst!=instFilter) return false;
    if(tfFilter!=ev.tf) return false;
    if(biasFilter!="ALL"){
      var b = ev.dir=="bull" ? "BULL" : (ev.dir=="bear" ? "BEAR" : "NEUTRAL");
      if(b!=biasFilter) return false;
    }
    if(q){
      var hay = (instLabel(ev.inst)+" "+ev.inst+" "+ev.name+" "+displayName(ev.name)).toLowerCase();
      if(hay.indexOf(q)==-1) return false;
    }
    return true;
  }
  var currentShown = currentAll.filter(passes);
  var historyShown = historyAll.filter(passes);
  var list = tab=="current" ? currentShown : historyShown;

  function pill(label, active, onClick, key){
    return (
      <button key={key} onClick={onClick} style={{background:active?BLUE:"transparent",border:"1px solid "+(active?BLUE:BD),color:active?"#fff":T2,fontSize:11,fontWeight:700,borderRadius:16,padding:"5px 11px",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{label}</button>
    );
  }

  var unavailableInsts = INSTRUMENTS.filter(function(it){ return !perInst[it.key].available; });
  var scopedUnavailable = unavailableInsts.filter(function(it){ return instFilter=="ALL" || instFilter==it.key; });

  var noDataInScope = INSTRUMENTS.filter(function(it){ return (instFilter=="ALL" || instFilter==it.key) && perInst[it.key].available; }).length==0;

  var histStatus = indexHistory && indexHistory.NIFTY && indexHistory.NIFTY.status ? indexHistory.NIFTY.status : null;

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:90,boxSizing:"border-box"}}>
      <div style={{background:CARD,borderBottom:"1px solid "+BD,padding:"10px 12px",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} aria-label="Back" style={{background:"rgba(120,120,120,0.12)",border:"none",borderRadius:8,width:36,height:36,color:T1,fontSize:16,cursor:"pointer",flexShrink:0}}>&#8592;</button>
        <div style={{minWidth:0,flex:1}}>
          <div style={{fontSize:16,fontWeight:800,color:T1}}>Chart Pattern Scanner</div>
          <div style={{fontSize:11,color:T2}}>Candle patterns from the Breakout Pro engine</div>
        </div>
        <span style={{flexShrink:0,fontSize:10,fontWeight:800,color:AMBER,background:AMBER+"18",border:"1px solid "+AMBER+"55",borderRadius:6,padding:"3px 8px"}}>{histStatus ? histStatus : "DAILY"}</span>
      </div>

      <div style={{padding:"10px 12px",maxWidth:1400,margin:"0 auto",boxSizing:"border-box"}}>
        <div style={{background:AMBER+"10",border:"1px solid "+AMBER+"44",borderRadius:8,padding:"8px 10px",fontSize:10,color:T2,lineHeight:1.5,marginBottom:10}}>
          <b style={{color:AMBER}}>Verified daily candles, not live intraday.</b> Patterns are detected on real daily high/low/close data (delayed). The feed has no open price, so each open is calculated from the previous close. Intraday timeframes are not offered because no verified intraday feed is connected. Educational analysis only - not a trade signal or a prediction.
        </div>

        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {[["current","Current",currentShown.length],["history","History",historyShown.length]].map(function(t){
            var active = tab==t[0];
            return (
              <button key={t[0]} onClick={function(){ setTab(t[0]); }} style={{flex:1,background:active?BLUE:CARD,border:"1px solid "+(active?BLUE:BD),color:active?"#fff":T1,fontSize:13,fontWeight:800,borderRadius:8,padding:"9px 8px",cursor:"pointer",fontFamily:"inherit"}}>{t[1]} <span style={{opacity:0.8,fontWeight:700}}>({t[2]})</span></button>
            );
          })}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
          <input value={query} onChange={function(e){ setQuery(e.target.value); }} placeholder="Search instrument or pattern" aria-label="Search instrument or pattern" style={{width:"100%",boxSizing:"border-box",background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"9px 11px",fontSize:13,color:T1,fontFamily:"inherit"}}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {pill("All instruments", instFilter=="ALL", function(){ setInstFilter("ALL"); }, "ALL")}
            {INSTRUMENTS.map(function(it){ return pill(it.label, instFilter==it.key, function(){ setInstFilter(it.key); }, it.key); })}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
            {TIMEFRAMES.map(function(t){ return pill(t.label, tfFilter==t.key, function(){ setTfFilter(t.key); }, t.key); })}
            <span style={{width:1,alignSelf:"stretch",background:BD,margin:"0 2px"}}></span>
            {[["ALL","All bias"],["BULL","Bullish"],["BEAR","Bearish"],["NEUTRAL","Neutral"]].map(function(b){ return pill(b[1], biasFilter==b[0], function(){ setBiasFilter(b[0]); }, "b"+b[0]); })}
          </div>
        </div>

        {loading ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"28px 12px",textAlign:"center",fontSize:12,color:T2}}>Loading daily candle history...</div>
        ) : failed ? (
          <div style={{background:CARD,border:"1px solid "+RED+"55",borderRadius:10,padding:"20px 14px",textAlign:"center"}}>
            <div style={{fontSize:13,fontWeight:800,color:RED,marginBottom:4}}>Pattern data unavailable</div>
            <div style={{fontSize:11,color:T2,lineHeight:1.5}}>The market data feed could not be reached ({mm.status || "error"}). No patterns are shown rather than guessing. It will retry automatically.</div>
          </div>
        ) : (
          <div>
            {scopedUnavailable.length ? (
              <div style={{background:CARD,border:"1px dashed "+BD,borderRadius:8,padding:"8px 10px",fontSize:10,color:T3,lineHeight:1.5,marginBottom:10}}>
                <b style={{color:T2}}>Unavailable:</b> {scopedUnavailable.map(function(it){ return it.label; }).join(", ")} - no verified daily candle history in the data feed, so no patterns can be detected.
              </div>
            ) : null}
            {list.length ? (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(min(100%, 300px), 1fr))",gap:10,alignItems:"start"}}>
                {list.map(function(ev){ return <PatternCard key={ev.id} ev={ev} theme={theme}/>; })}
              </div>
            ) : (
              <div style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"24px 14px",textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:800,color:T1,marginBottom:4}}>{noDataInScope ? "No candle data available" : (tab=="current" ? "No pattern on the latest candle" : "No earlier patterns found")}</div>
                <div style={{fontSize:11,color:T2,lineHeight:1.5}}>
                  {noDataInScope ? "The data feed has no verified daily candle history for the selected instrument(s), so nothing can be detected. Nothing is estimated or filled in." : (instFilter!="ALL" || biasFilter!="ALL" || q) ? "Nothing matches the current filters. Try clearing them." : (tab=="current" ? "The engine did not match any pattern on the most recent daily candle. Check History for earlier detections." : "The available daily history contains no earlier detections.")}
                </div>
              </div>
            )}
            <div style={{fontSize:10,color:T3,lineHeight:1.5,marginTop:12}}>
              {tab=="history" ? "History is limited to the last ~10 daily sessions the feed provides, shown as sessions ago because the feed has no calendar dates. " : ""}
              Pattern status: Confirmed = matched by the engine on a completed daily candle. Forming = matched on today's still-open candle. Invalidation is not tracked by the engine. Pattern detection does not predict price direction.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
