import { useState, useRef, useEffect } from "react";
import { SYMBOLS, TF_MAP, SPEEDS } from "./MarketReplayData";
import { useMarketReplay } from "../hooks/useMarketReplay";
import { useTheme } from "../theme/ThemeProvider";

// BreakoutPro - MarketReplaySimulator.jsx
// Real historical candle replay via the same /api/history.js endpoint
// already used by Chart.jsx - not a new or duplicate API. Correct/wrong
// evaluation compares each Buy/Sell decision against the REAL next
// candle's actual close - never a fabricated or predicted outcome. Hold
// decisions are logged but not graded, since there is nothing real to
// evaluate them against. The auto-Play timer only paginates through
// already-fetched real data locally - it is not network polling.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",BD="#20242D";
var T1="#FFFFFF",T2="#B8C1CC",T3="#5B6472",BLUE="#3B82F6",UP="#006400",R="#DC2626",WARN="#D4AF37";

function ReplayChart(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var R = theme.c.down, UP = theme.c.up;

  var candles = props.candles;
  if(!candles || candles.length==0) return null;
  var W=340,H=200;
  var closes = candles.map(function(c){return c.close;});
  var highs = candles.map(function(c){return c.high;});
  var lows = candles.map(function(c){return c.low;});
  var maxP = Math.max.apply(null, highs), minP = Math.min.apply(null, lows);
  var range = (maxP-minP)||1;
  function yP(p){ return H-((p-minP)/range)*H; }
  var cw = W/candles.length;
  return (
    <svg width="100%" height={H} viewBox={"0 0 "+W+" "+H} style={{display:"block"}}>
      {candles.map(function(c,i){
        var cx = i*cw+cw/2;
        var up = c.close>=c.open;
        var col = up?UP:R;
        var bodyTop = yP(Math.max(c.open,c.close));
        var bodyBot = yP(Math.min(c.open,c.close));
        return (
          <g key={i}>
            <line x1={cx} y1={yP(c.high)} x2={cx} y2={yP(c.low)} stroke={col} strokeWidth="1"/>
            <rect x={cx-Math.min(6,cw*0.35)} y={bodyTop} width={Math.min(12,cw*0.7)} height={Math.max(1,bodyBot-bodyTop)} fill={col}/>
          </g>
        );
      })}
    </svg>
  );
}

export default function MarketReplaySimulator(props){

  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  CARD=theme.c.card; BD=theme.c.border;
  T1=theme.c.text1; T2=theme.c.text2; T3=theme.c.text3; BLUE=theme.c.blue; UP=theme.c.up; R=theme.c.down; T2=theme.c.warn;
  var onBack = props.onBack || function(){};
  var replayHistory = useMarketReplay(); // single instance for this whole subtree

  var [view, setView] = useState("setup");
  var [symIdx, setSymIdx] = useState(3);
  var [tf, setTf] = useState("1D");
  var [speedId, setSpeedId] = useState("normal");

  var [candles, setCandles] = useState([]);
  var [status, setStatus] = useState("idle");
  var [revealed, setRevealed] = useState(1);
  var [playing, setPlaying] = useState(false);
  var [decisions, setDecisions] = useState({});
  var [notes, setNotes] = useState("");

  var abortRef = useRef(null);
  var mountedRef = useRef(true);
  var timerRef = useRef(null);

  useEffect(function(){ return function(){ mountedRef.current=false; if(abortRef.current){try{abortRef.current.abort();}catch(e){}} if(timerRef.current) clearInterval(timerRef.current); }; }, []);

  function startReplay(){
    if(abortRef.current){ try{abortRef.current.abort();}catch(e){} }
    var ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus("loading");
    setView("replay");
    var api = SYMBOLS[symIdx].api;
    var cfg = TF_MAP[tf];
    fetch("/api/history?symbol="+encodeURIComponent(api)+"&range="+cfg.range+"&interval="+cfg.interval,{signal:ctrl.signal})
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(!mountedRef.current || abortRef.current!=ctrl) return;
        if(data && data.candles && data.candles.length>1){
          var mapped = data.candles.filter(function(c){ return isFinite(c.open)&&isFinite(c.high)&&isFinite(c.low)&&isFinite(c.close); }).slice(-60);
          setCandles(mapped);
          setRevealed(1);
          setDecisions({});
          setStatus(mapped.length>1 ? "ok" : "empty");
        } else { setCandles([]); setStatus("empty"); }
      })
      .catch(function(e){
        if(e && e.name=="AbortError") return;
        if(!mountedRef.current || abortRef.current!=ctrl) return;
        setStatus("error");
      });
  }

  function stopTimer(){ if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null; } setPlaying(false); }

  function play(){
    if(playing) return;
    setPlaying(true);
    var speed = SPEEDS.filter(function(s){return s.id==speedId;})[0].ms;
    timerRef.current = setInterval(function(){
      setRevealed(function(prev){
        if(prev+1>=candles.length){ stopTimer(); setView("summary"); return prev; }
        return prev+1;
      });
    }, speed);
  }
  function pause(){ stopTimer(); }
  function nextCandle(){ if(revealed+1<candles.length) setRevealed(revealed+1); else { stopTimer(); setView("summary"); } }
  function prevCandle(){ if(revealed>1) setRevealed(revealed-1); }
  function restart(){ stopTimer(); setRevealed(1); setDecisions({}); setNotes(""); }

  function decide(action){
    setDecisions(function(prev){
      var next = Object.assign({}, prev);
      next[revealed-1] = action;
      return next;
    });
  }
  function endReplay(){ stopTimer(); setView("summary"); }

  function evaluate(){
    var correct=0, wrong=0, graded=0;
    var firstDecisionIdx = null, firstAction = null;
    Object.keys(decisions).sort(function(a,b){return a-b;}).forEach(function(k){
      var idx = parseInt(k,10);
      var action = decisions[idx];
      if(firstDecisionIdx==null && (action=="buy"||action=="sell")){ firstDecisionIdx=idx; firstAction=action; }
      if(action=="hold") return;
      if(idx+1>=candles.length) return;
      graded++;
      var moved = candles[idx+1].close - candles[idx].close;
      var wasCorrect = action=="buy" ? moved>0 : moved<0;
      if(wasCorrect) correct++; else wrong++;
    });
    var entry = firstDecisionIdx!=null ? candles[firstDecisionIdx].close : null;
    var exitIdx = Math.min(revealed-1, candles.length-1);
    var exit = candles.length ? candles[exitIdx].close : null;
    var pnl = (entry!=null && exit!=null) ? (firstAction=="sell" ? (entry-exit) : (exit-entry)) : null;
    var accuracy = graded>0 ? Math.round((correct/graded)*100) : 0;
    return { entry:entry, exit:exit, pnl:pnl, correct:correct, wrong:wrong, graded:graded, accuracy:accuracy, firstAction:firstAction };
  }

  function saveToHistory(){
    var ev = evaluate();
    replayHistory.saveSession({
      symbol: SYMBOLS[symIdx].sym, timeframe: tf,
      entry: ev.entry, exit: ev.exit, pnl: ev.pnl,
      correct: ev.correct, wrong: ev.wrong, accuracy: ev.accuracy,
      notes: notes.trim(), date: new Date().toISOString().slice(0,10)
    });
    setView("setup");
  }

  if(view=="history"){
    return (
      <div style={{padding:16}}>
        <button onClick={function(){setView("setup");}} style={{background:"none",border:"none",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:4,marginBottom:16,minHeight:44}}>&#8592; Back</button>
        <div style={{fontSize:18,fontWeight:800,color:T1,marginBottom:16}}>Replay History</div>
        {replayHistory.history.length==0 ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:T3,fontSize:12}}>No saved replays yet.</div>
        ) : replayHistory.history.map(function(s){
          return (
            <div key={s.id} style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:14,fontWeight:700,color:T1}}>{s.symbol} &#8226; {s.timeframe}</span>
                <span style={{fontSize:12,color:T3}}>{s.date}</span>
              </div>
              <Row label="Entry" value={s.entry!=null?s.entry.toFixed(2):"--"}/>
              <Row label="Exit" value={s.exit!=null?s.exit.toFixed(2):"--"}/>
              <Row label="P/L" value={s.pnl!=null?((s.pnl>=0?"+":"")+s.pnl.toFixed(2)):"--"} color={s.pnl!=null?(s.pnl>=0?UP:R):T1}/>
              <Row label="Correct / Wrong" value={s.correct+" / "+s.wrong}/>
              <Row label="Accuracy" value={s.accuracy+"%"} last={!s.notes}/>
              {s.notes ? <div style={{fontSize:12,color:T2,marginTop:8,fontStyle:"italic"}}>{s.notes}</div> : null}
              <button onClick={function(){replayHistory.deleteSession(s.id);}} style={{background:"none",border:"1px solid "+R,borderRadius:8,padding:"8px 12px",color:R,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:8,minHeight:44}}>Delete</button>
            </div>
          );
        })}
      </div>
    );
  }

  if(view=="summary"){
    var ev = evaluate();
    return (
      <div style={{padding:16}}>
        <div style={{fontSize:18,fontWeight:800,color:T1,marginBottom:16}}>Replay Summary</div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <Row label="Entry" value={ev.entry!=null?ev.entry.toFixed(2):"--"}/>
          <Row label="Exit" value={ev.exit!=null?ev.exit.toFixed(2):"--"}/>
          <Row label="P/L" value={ev.pnl!=null?((ev.pnl>=0?"+":"")+ev.pnl.toFixed(2)):"--"} color={ev.pnl!=null?(ev.pnl>=0?UP:R):T1}/>
          <Row label="Correct Decisions" value={ev.correct}/>
          <Row label="Wrong Decisions" value={ev.wrong}/>
          <Row label="Accuracy" value={ev.accuracy+"%"} last={true}/>
        </div>
        <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:8}}>RULE-BASED FEEDBACK</div>
          <div style={{fontSize:12,color:"#C9D4E5",lineHeight:1.6}}>
            {ev.graded==0 ? "No Buy/Sell decisions were graded this session - only Hold was used, or there was no next real candle to compare against." :
              ev.accuracy>=60 ? "Most of your graded decisions matched the real subsequent price movement this session." :
              ev.accuracy>=40 ? "Your graded decisions were mixed against the real subsequent price movement this session." :
              "Most of your graded decisions did not match the real subsequent price movement this session."}
            {" This reflects only what actually happened in this real historical data - it is not a prediction of future performance."}
          </div>
        </div>
        <label style={{fontSize:12,color:T2,fontWeight:700,display:"block",marginBottom:8}}>Notes</label>
        <textarea value={notes} onChange={function(ev2){setNotes(ev2.target.value);}} style={{width:"100%",background:theme.c.card2,border:"1px solid "+BD,borderRadius:16,padding:"12px 12px",color:T1,fontSize:14,fontFamily:"inherit",minHeight:70,boxSizing:"border-box",marginBottom:16}}/>
        <button onClick={saveToHistory} style={{width:"100%",background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginBottom:8,minHeight:44}}>Save to Replay History</button>
        <button onClick={function(){setView("setup");}} style={{width:"100%",background:"transparent",border:"1px solid "+BD,borderRadius:11,padding:12,color:T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Discard & Return</button>
      </div>
    );
  }

  if(view=="replay"){
    var visible = candles.slice(0, revealed);
    return (
      <div style={{padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:12,color:T3}}>{SYMBOLS[symIdx].sym} &#8226; {tf} &#8226; Candle {revealed} of {candles.length||"--"}</span>
          <button onClick={endReplay} style={{background:"none",border:"none",color:T2,fontSize:12,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>End</button>
        </div>
        {status=="loading" ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:T2,fontSize:12}}>Loading real historical data...</div>
        ) : status=="error" ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:R,fontSize:12}}>Data unavailable. <button onClick={startReplay} style={{background:"none",border:"1px solid "+BLUE,borderRadius:16,padding:"8px 16px",color:BLUE,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:8,minHeight:44}}>Retry</button></div>
        ) : status=="empty" ? (
          <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:24,textAlign:"center",color:T3,fontSize:12}}>No real data available for this symbol/timeframe.</div>
        ) : (
          <div>
            <div style={{background:CARD,border:"1px solid "+BD,borderRadius:16,padding:12,marginBottom:16}}>
              <ReplayChart candles={visible}/>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              <button onClick={prevCandle} disabled={revealed<=1} style={{flex:1,background:"transparent",border:"1px solid "+BD,borderRadius:10,padding:12,color:revealed<=1?T3:T2,fontSize:12,fontWeight:700,cursor:revealed<=1?"default":"pointer",fontFamily:"inherit",minHeight:44}}>&#8592; Previous</button>
              {playing ? (
                <button onClick={pause} style={{flex:1,background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Pause</button>
              ) : (
                <button onClick={play} style={{flex:1,background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Play</button>
              )}
              <button onClick={nextCandle} style={{flex:1,background:"transparent",border:"1px solid "+BD,borderRadius:10,padding:12,color:T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Next &#8594;</button>
            </div>
            <button onClick={restart} style={{width:"100%",background:"transparent",border:"1px solid "+BD,borderRadius:10,padding:12,color:T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:16,minHeight:44}}>Restart Replay</button>

            <div style={{fontSize:12,fontWeight:700,color:T1,marginBottom:8}}>Your decision on this candle:</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={function(){decide("buy");}} style={{flex:1,background:decisions[revealed-1]=="buy"?UP:"transparent",border:"1px solid "+UP,borderRadius:10,padding:12,color:decisions[revealed-1]=="buy"?"#fff":UP,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Buy</button>
              <button onClick={function(){decide("sell");}} style={{flex:1,background:decisions[revealed-1]=="sell"?R:"transparent",border:"1px solid "+R,borderRadius:10,padding:12,color:decisions[revealed-1]=="sell"?"#fff":R,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Sell</button>
              <button onClick={function(){decide("hold");}} style={{flex:1,background:decisions[revealed-1]=="hold"?T2:"transparent",border:"1px solid "+T2,borderRadius:10,padding:12,color:decisions[revealed-1]=="hold"?theme.c.bg:T2,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Hold</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{background:theme.c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",paddingBottom:40}}>
      <div style={{background:CARD,padding:"12px 16px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,width:44,height:44,color:T1,fontSize:16,cursor:"pointer"}}>&#8592;</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:800,color:T1}}>Market Replay Simulator</div>
          <div style={{fontSize:12,color:T2}}>Real historical candles. Educational only.</div>
        </div>
        <button onClick={function(){setView("history");}} style={{background:"transparent",border:"1px solid "+BD,borderRadius:9,padding:"8px 12px",color:T2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>History</button>
      </div>

      <div style={{padding:16}}>
        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>SYMBOL</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          {SYMBOLS.map(function(s,i){
            var act=i==symIdx;
            return <button key={s.sym} onClick={function(){setSymIdx(i);}} style={{background:act?BLUE:"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:9,padding:"8px 12px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{s.sym}</button>;
          })}
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>TIMEFRAME</div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {Object.keys(TF_MAP).map(function(t){
            var act=t==tf;
            return <button key={t} onClick={function(){setTf(t);}} style={{flex:1,background:act?BLUE:"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:9,padding:"8px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{t}</button>;
          })}
        </div>

        <div style={{fontSize:12,fontWeight:800,color:T2,marginBottom:12}}>REPLAY SPEED</div>
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          {SPEEDS.map(function(s){
            var act=s.id==speedId;
            return <button key={s.id} onClick={function(){setSpeedId(s.id);}} style={{flex:1,background:act?BLUE:"transparent",border:"1px solid "+(act?BLUE:BD),borderRadius:9,padding:"8px",color:act?"#fff":T2,fontSize:12,fontWeight:act?800:600,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>{s.label}</button>;
          })}
        </div>

        <button onClick={startReplay} style={{width:"100%",background:BLUE,border:"none",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>Start Replay</button>

        <div style={{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)",borderRadius:10,padding:12,marginTop:16}}>
          <div style={{fontSize:12,color:T2,lineHeight:1.5}}>Real historical data only, via the same source used elsewhere in this app. Educational only - not investment advice. Correct/Wrong is graded against what actually happened next in this real data, not a prediction.</div>
        </div>
      </div>
    </div>
  );
}

function Row(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD = theme.c.border;

  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:props.last?"none":"1px solid "+BD}}>
      <span style={{fontSize:12,color:T2}}>{props.label}</span>
      <span style={{fontSize:12,fontWeight:700,color:props.color||T1}}>{props.value}</span>
    </div>
  );
}
